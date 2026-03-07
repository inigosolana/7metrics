import asyncio
import json
import os
import shutil
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

app = FastAPI(title="7metrics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "output_clips")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

KAGGLE_JOBS: Dict[str, Dict[str, Any]] = {}
KAGGLE_EXECUTOR = ThreadPoolExecutor(max_workers=4)
ACTIVE_JOBS_BY_VIDEO: Dict[str, str] = {}

KAGGLE_USERNAME = os.getenv("KAGGLE_USERNAME", "").strip()
KAGGLE_KEY = os.getenv("KAGGLE_KEY", "").strip()
WEBHOOK_BASE_URL = os.getenv("WEBHOOK_BASE_URL", "http://localhost:8000").rstrip("/")
REPO_URL = os.getenv("REPO_URL", "https://github.com/inigosolana/7metrics.git")


WORKER_SCRIPT_TEMPLATE = '''# -*- coding: utf-8 -*-
import glob
import json
import os
import subprocess
import sys
import urllib.request

VIDEO_URL = "{video_url}"
WEBHOOK_URL = "{webhook_url}"
JOB_ID = "{job_id}"
REPO_URL = "{repo_url}"


def post_webhook(payload):
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={{"Content-Type": "application/json"}},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status


def main():
    work_dir = os.getcwd()
    repo_root = os.path.join(work_dir, "repo")
    video_path = os.path.join(work_dir, "input_video.mp4")
    output_dir = os.path.join(work_dir, "output_clips")
    os.makedirs(output_dir, exist_ok=True)

    subprocess.run(["git", "clone", "--depth", "1", REPO_URL, repo_root], check=True)
    repo_backend = os.path.join(repo_root, "backend")
    if not os.path.isdir(repo_backend):
        repo_backend = os.path.join(repo_root, "7metrics", "backend")
    if not os.path.isdir(repo_backend):
        raise RuntimeError("No se encontró backend/ dentro del repo clonado")

    req_file = os.path.join(repo_backend, "requirements.txt")
    if os.path.isfile(req_file):
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-r", req_file], check=True)

    urllib.request.urlretrieve(VIDEO_URL, video_path)
    sys.path.insert(0, repo_backend)

    from ai_processor import HandballProcessor

    processor = HandballProcessor(input_path=video_path, output_dir=output_dir)
    processor.process()

    clips = []
    for metadata_path in glob.glob(os.path.join(output_dir, "*.json")):
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                clips.append(json.load(f))
        except Exception:
            continue

    payload = {{
        "job_id": JOB_ID,
        "metrics": {{
            "status": "completed",
            "clips_count": len(clips),
            "clips": clips,
        }},
    }}
    post_webhook(payload)
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        payload = {{
            "job_id": JOB_ID,
            "metrics": {{
                "status": "error",
                "message": str(e),
                "error": str(e),
                "clips_count": 0,
                "clips": [],
            }},
        }}
        try:
            post_webhook(payload)
        except Exception:
            pass
        sys.exit(1)
'''


class ProcessGpuRequest(BaseModel):
    video_url: Optional[str] = None
    video_id: Optional[str] = None


class WebhookKaggleDoneBody(BaseModel):
    job_id: str
    metrics: Dict[str, Any]


@app.get("/health")
def healthcheck():
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}


@app.post("/api/upload-for-gpu")
async def upload_for_gpu(file: UploadFile = File(...)):
    try:
        safe_name = os.path.basename(file.filename or "video.mp4").replace("..", "")
        if not safe_name.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
            safe_name += ".mp4"
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        video_url = f"{WEBHOOK_BASE_URL}/uploads/{safe_name}"
        # Flujo bajo demanda: al subir archivo se lanza el job en Kaggle.
        job_id = _enqueue_kaggle_job(video_url)
        return {"video_url": video_url, "filename": safe_name, "job_id": job_id, "status": KAGGLE_JOBS[job_id]["status"]}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})


def _build_kernel_and_push(job_id: str, video_url: str) -> None:
    import subprocess

    tmpdir = None
    try:
        tmpdir = tempfile.mkdtemp(prefix="kaggle_7metrics_")
        metadata = {
            "id": f"{KAGGLE_USERNAME}/7metrics-worker-{job_id[:8]}",
            "title": f"7metrics GPU Worker {job_id[:8]}",
            "code_file": "worker.py",
            "language": "python",
            "kernel_type": "script",
            "is_private": "true",
            "enable_gpu": "true",
            "enable_internet": "true",
            "dataset_sources": [],
            "competition_sources": [],
            "kernel_sources": [],
            "model_sources": [],
        }
        with open(os.path.join(tmpdir, "kernel-metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        worker_content = WORKER_SCRIPT_TEMPLATE.format(
            video_url=video_url,
            webhook_url=f"{WEBHOOK_BASE_URL}/api/webhook/kaggle-done",
            job_id=job_id,
            repo_url=REPO_URL,
        )
        with open(os.path.join(tmpdir, "worker.py"), "w", encoding="utf-8") as f:
            f.write(worker_content)

        # Prefer API call as requested; fallback to CLI if needed.
        try:
            from kaggle import api as kaggle_api

            kaggle_api.authenticate()
            kaggle_api.kernels_push(tmpdir)
        except Exception:
            proc = subprocess.run(
                ["kaggle", "kernels", "push", "-p", tmpdir],
                capture_output=True,
                text=True,
                timeout=180,
            )
            if proc.returncode != 0:
                KAGGLE_JOBS[job_id]["status"] = "error"
                KAGGLE_JOBS[job_id]["error"] = proc.stderr or proc.stdout or "kaggle push failed"
                return
        KAGGLE_JOBS[job_id]["status"] = "submitted"
    except Exception as exc:
        if job_id in KAGGLE_JOBS:
            KAGGLE_JOBS[job_id]["status"] = "error"
            KAGGLE_JOBS[job_id]["error"] = str(exc)
    finally:
        active_job = ACTIVE_JOBS_BY_VIDEO.get(video_url)
        if active_job == job_id and KAGGLE_JOBS.get(job_id, {}).get("status") == "error":
            ACTIVE_JOBS_BY_VIDEO.pop(video_url, None)
        if tmpdir and os.path.isdir(tmpdir):
            try:
                shutil.rmtree(tmpdir)
            except Exception:
                pass


def _enqueue_kaggle_job(video_url: str) -> str:
    """Create one on-demand Kaggle job for a given video URL."""
    existing_job_id = ACTIVE_JOBS_BY_VIDEO.get(video_url)
    if existing_job_id:
        existing = KAGGLE_JOBS.get(existing_job_id, {})
        if existing.get("status") in {"pending", "submitted"}:
            return existing_job_id

    job_id = str(uuid.uuid4())
    KAGGLE_JOBS[job_id] = {
        "status": "pending",
        "video_url": video_url,
        "metrics": None,
        "result": None,
        "error": None,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    ACTIVE_JOBS_BY_VIDEO[video_url] = job_id
    loop = asyncio.get_event_loop()
    loop.run_in_executor(KAGGLE_EXECUTOR, _build_kernel_and_push, job_id, video_url)
    return job_id


@app.post("/api/process-gpu")
async def process_gpu(body: ProcessGpuRequest):
    if not KAGGLE_USERNAME or not KAGGLE_KEY:
        raise HTTPException(status_code=503, detail="Configura KAGGLE_USERNAME y KAGGLE_KEY.")

    video_url = (body.video_url or body.video_id or "").strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="Se requiere video_url o video_id.")

    job_id = _enqueue_kaggle_job(video_url)
    return JSONResponse(
        status_code=202,
        content={"job_id": job_id, "status": "pending", "message": "Trabajo enviado a Kaggle."},
    )


@app.post("/api/webhook/kaggle-done")
async def webhook_kaggle_done(body: WebhookKaggleDoneBody):
    if body.job_id not in KAGGLE_JOBS:
        return JSONResponse(status_code=404, content={"message": "job_id no encontrado"})
    KAGGLE_JOBS[body.job_id]["status"] = "completed" if body.metrics.get("status") != "error" else "error"
    KAGGLE_JOBS[body.job_id]["metrics"] = body.metrics
    KAGGLE_JOBS[body.job_id]["result"] = body.metrics
    KAGGLE_JOBS[body.job_id]["updated_at"] = datetime.utcnow().isoformat() + "Z"
    video_url = KAGGLE_JOBS[body.job_id].get("video_url")
    if video_url and ACTIVE_JOBS_BY_VIDEO.get(video_url) == body.job_id:
        ACTIVE_JOBS_BY_VIDEO.pop(video_url, None)
    return {"ok": True, "job_id": body.job_id}


@app.get("/api/job/{job_id}")
def get_job_status(job_id: str):
    if job_id not in KAGGLE_JOBS:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")
    return KAGGLE_JOBS[job_id]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

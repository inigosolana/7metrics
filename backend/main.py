import os
import shutil
import json
import asyncio

from dotenv import load_dotenv
# Cargar .env desde el directorio backend/ para KAGGLE_* y WEBHOOK_BASE_URL
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

from processor import VideoProcessor

app = FastAPI(title="7metrics Optimized Video API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output_clips"
processor = VideoProcessor(UPLOAD_DIR, OUTPUT_DIR)

# Kaggle jobs store: job_id -> { status, video_url, result, error, created_at }
KAGGLE_JOBS: dict = {}
KAGGLE_EXECUTOR = ThreadPoolExecutor(max_workers=4)

# Env: KAGGLE_USERNAME, KAGGLE_KEY (for CLI). WEBHOOK_BASE_URL = public URL of this API for callbacks.
KAGGLE_USERNAME = os.environ.get("KAGGLE_USERNAME", "")
WEBHOOK_BASE_URL = os.environ.get("WEBHOOK_BASE_URL", "http://localhost:8000").rstrip("/")
REPO_URL = os.environ.get("REPO_URL", "https://github.com/inigosolana/7metrics.git")

# Serve generated clips and uploads (for Kaggle worker to download via video_url)
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# --- Kaggle GPU worker template (run on Kaggle) ---
WORKER_SCRIPT_TEMPLATE = '''# -*- coding: utf-8 -*-
"""Worker script for Kaggle GPU. Injected: VIDEO_URL, WEBHOOK_URL, JOB_ID, REPO_URL."""
import os
import sys
import subprocess
import urllib.request
import json
import uuid

VIDEO_URL = "{video_url}"
WEBHOOK_URL = "{webhook_url}"
JOB_ID = "{job_id}"
REPO_URL = "{repo_url}"

def log(msg):
    print(msg, flush=True)

def post_webhook(payload):
    try:
        req = urllib.request.Request(WEBHOOK_URL, data=json.dumps(payload).encode(), method="POST",
            headers={{ "Content-Type": "application/json" }})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status in (200, 201)
    except Exception as e:
        log(f"Webhook error: {{e}}")
        return False

def main():
    work_dir = os.getcwd()
    video_path = os.path.join(work_dir, "input_video.mp4")
    log("Cloning repo...")
    subprocess.run(["git", "clone", "--depth", "1", REPO_URL, "repo"], check=True, capture_output=True)
    repo_backend = os.path.join(work_dir, "repo", "backend")
    if not os.path.isdir(repo_backend):
        repo_backend = os.path.join(work_dir, "repo", "7metrics", "backend")
    sys.path.insert(0, os.path.dirname(repo_backend))
    log("Installing dependencies...")
    req_file = os.path.join(repo_backend, "requirements.txt")
    if os.path.isfile(req_file):
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-r", req_file], check=True, capture_output=True)
    log("Downloading video...")
    urllib.request.urlretrieve(VIDEO_URL, video_path)
    metrics = {{ "clips_count": 0, "status": "completed", "message": "OK" }}
    try:
        from processor import VideoProcessor
        out_dir = os.path.join(work_dir, "output_clips")
        proc = VideoProcessor(work_dir, out_dir)
        proc.process_match(video_path)
        clips = []
        for root, _, files in os.walk(out_dir):
            for f in files:
                if f.endswith(".mp4"):
                    rel = os.path.relpath(os.path.join(root, f), out_dir)
                    clips.append({{ "path": rel.replace(os.sep, "/"), "filename": f }})
        metrics["clips_count"] = len(clips)
        metrics["clips"] = clips
    except Exception as e:
        metrics["status"] = "error"
        metrics["message"] = str(e)
        metrics["error"] = str(e)
    payload = {{ "job_id": JOB_ID, "metrics": metrics }}
    log(f"Posting webhook: {{payload}}")
    post_webhook(payload)

if __name__ == "__main__":
    main()
'''


class ProcessGpuRequest(BaseModel):
    video_url: Optional[str] = None
    video_id: Optional[str] = None


@app.post("/api/upload-for-gpu")
async def upload_for_gpu(file: UploadFile = File(...)):
    """
    Sube un vídeo y devuelve su URL pública para usarla en POST /api/process-gpu.
    El servidor debe ser accesible desde internet (ej. ngrok) para que Kaggle pueda descargarlo.
    """
    try:
        safe_name = os.path.basename(file.filename or "video.mp4").replace("..", "")
        if not safe_name.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
            safe_name = safe_name + ".mp4"
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        video_url = f"{WEBHOOK_BASE_URL}/uploads/{safe_name}"
        return {"video_url": video_url, "filename": safe_name}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


def _build_kernel_and_push(job_id: str, video_url: str) -> None:
    """Runs in thread: create temp dir, write kernel-metadata.json + worker.py, run kaggle kernels push."""
    import subprocess
    tmpdir = None
    try:
        tmpdir = tempfile.mkdtemp(prefix="kaggle_7metrics_")
        metadata = {
            "id": f"{KAGGLE_USERNAME}/7metrics-worker-{job_id[:8]}" if KAGGLE_USERNAME else f"7metrics-worker-{job_id[:8]}",
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
        if not KAGGLE_USERNAME:
            metadata["id"] = f"7metrics-worker-{job_id[:8]}"
        with open(os.path.join(tmpdir, "kernel-metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        webhook_url = f"{WEBHOOK_BASE_URL}/api/webhook/kaggle-done"
        worker_content = WORKER_SCRIPT_TEMPLATE.format(
            video_url=video_url,
            webhook_url=webhook_url,
            job_id=job_id,
            repo_url=REPO_URL,
        )
        with open(os.path.join(tmpdir, "worker.py"), "w", encoding="utf-8") as f:
            f.write(worker_content)
        proc = subprocess.run(
            ["kaggle", "kernels", "push", "-p", tmpdir],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if proc.returncode != 0:
            KAGGLE_JOBS[job_id]["status"] = "error"
            KAGGLE_JOBS[job_id]["error"] = proc.stderr or proc.stdout or "kaggle push failed"
    except Exception as e:
        if job_id in KAGGLE_JOBS:
            KAGGLE_JOBS[job_id]["status"] = "error"
            KAGGLE_JOBS[job_id]["error"] = str(e)
    finally:
        if tmpdir and os.path.isdir(tmpdir):
            try:
                shutil.rmtree(tmpdir)
            except Exception:
                pass


class WebhookKaggleDoneBody(BaseModel):
    job_id: str
    metrics: dict

@app.post("/api/process-gpu")
async def process_gpu(body: ProcessGpuRequest):
    """
    Encola un trabajo de procesamiento en GPU (Kaggle).
    Acepta video_url (URL del vídeo) o video_id (identificador).
    El trabajo se lanza de forma asíncrona; usar GET /api/job/{job_id} para polling.
    """
    if not os.environ.get("KAGGLE_USERNAME") or not os.environ.get("KAGGLE_KEY"):
        raise HTTPException(
            status_code=503,
            detail="Configura KAGGLE_USERNAME y KAGGLE_KEY en el entorno para usar procesamiento GPU (Kaggle).",
        )
    video_url = body.video_url
    if not video_url and body.video_id:
        video_url = body.video_id  # Tratar como URL si es el único campo
    if not video_url or not video_url.strip():
        raise HTTPException(status_code=400, detail="Se requiere video_url o video_id")
    video_url = video_url.strip()
    job_id = str(uuid.uuid4())
    KAGGLE_JOBS[job_id] = {
        "status": "pending",
        "video_url": video_url,
        "result": None,
        "error": None,
        "metrics": None,
    }
    try:
        loop = asyncio.get_event_loop()
        loop.run_in_executor(KAGGLE_EXECUTOR, _build_kernel_and_push, job_id, video_url)
    except Exception as e:
        KAGGLE_JOBS[job_id]["status"] = "error"
        KAGGLE_JOBS[job_id]["error"] = str(e)
        return JSONResponse(
            status_code=500,
            content={"job_id": job_id, "message": "Error al lanzar el kernel", "error": str(e)},
        )
    return JSONResponse(
        status_code=202,
        content={
            "job_id": job_id,
            "message": "Trabajo enviado a Kaggle GPU. Consulta el estado en GET /api/job/{job_id}.",
            "status": "pending",
        },
    )


@app.post("/api/webhook/kaggle-done")
async def webhook_kaggle_done(body: WebhookKaggleDoneBody):
    """Webhook al que Kaggle notifica al terminar el procesamiento con las métricas."""
    job_id = body.job_id
    if job_id not in KAGGLE_JOBS:
        return JSONResponse(status_code=404, content={"message": "job_id no encontrado"})
    KAGGLE_JOBS[job_id]["status"] = "completed"
    KAGGLE_JOBS[job_id]["metrics"] = body.metrics
    KAGGLE_JOBS[job_id]["result"] = body.metrics
    return {"ok": True, "job_id": job_id}


@app.get("/api/job/{job_id}")
def get_job_status(job_id: str):
    """Devuelve el estado de un trabajo de Kaggle (para polling desde el frontend)."""
    if job_id not in KAGGLE_JOBS:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")
    return KAGGLE_JOBS[job_id]


@app.get("/status")
def get_status():
    """Returns the current processing status."""
    return processor.global_state

@app.post("/upload-match")
async def upload_match(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Receives video and starts the background analysis pipeline.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Reset state and start background task
    processor.global_state["progress"] = 0
    processor.global_state["status"] = "processing"
    background_tasks.add_task(processor.process_match, file_path)
    
    return {"message": "Processing started", "status": "started"}

@app.get("/clips")
def list_clips():
    """
    Scans the output directory and returns found clips dynamically.
    """
    all_clips = []
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for f in files:
            if f.endswith(".mp4"):
                rel_path = os.path.relpath(os.path.join(root, f), OUTPUT_DIR)
                # Structure: Team/Player/Timestamp.mp4
                path_parts = rel_path.replace(os.sep, '/').split('/')
                team = path_parts[0] if len(path_parts) > 2 else "OFFENSE"
                player = path_parts[1] if len(path_parts) > 2 else "UNK"
                
                all_clips.append({
                    "filename": f,
                    "path": rel_path.replace(os.sep, '/'),
                    "url": f"/static/{rel_path.replace(os.sep, '/')}",
                    "team": team,
                    "player": player,
                    "actionType": "GOAL" # Default for offensive clips
                })
    return all_clips

@app.get("/download/{path:path}")
def download_clip(path: str):
    full_path = os.path.join(OUTPUT_DIR, path)
    if os.path.exists(full_path):
        return FileResponse(full_path)
    return JSONResponse(status_code=404, content={"message": "Clip not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

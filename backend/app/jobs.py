import json
import os
from datetime import datetime
from typing import Optional, Dict, Any
from .schemas import JobStatus, JobStatusResponse
from .storage import get_job_meta_path, get_job_result_path

def save_job_meta(job_id: str, meta: Dict[str, Any]):
    path = get_job_meta_path(job_id)
    # Convert datetime to string if present
    if "created_at" in meta and isinstance(meta["created_at"], datetime):
        meta["created_at"] = meta["created_at"].isoformat()
    
    with open(path, "w") as f:
        json.dump(meta, f, indent=2)

def load_job_meta(job_id: str) -> Optional[Dict[str, Any]]:
    path = get_job_meta_path(job_id)
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return json.load(f)

def save_job_result(job_id: str, result: Any):
    path = get_job_result_path(job_id)
    with open(path, "w") as f:
        json.dump(result, f, indent=2)

def load_job_result(job_id: str) -> Optional[Any]:
    path = get_job_result_path(job_id)
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return json.load(f)

def update_job_status(job_id: str, status: JobStatus, progress: int = 0, current_step: str = None, error: str = None):
    meta = load_job_meta(job_id)
    if not meta:
        return
    
    meta["status"] = status
    meta["progress_percentage"] = progress
    if current_step:
        meta["current_step"] = current_step
    if error:
        meta["error"] = error
        
    save_job_meta(job_id, meta)

def create_job(job_id: str, video_id: str, mode: str, config: Dict[str, Any]) -> JobStatusResponse:
    meta = {
        "job_id": job_id,
        "video_id": video_id,
        "mode": mode,
        "config": config,
        "status": JobStatus.QUEUED,
        "progress_percentage": 0,
        "current_step": "Initializing...",
        "created_at": datetime.utcnow().isoformat(),
        "error": None
    }
    save_job_meta(job_id, meta)
    return JobStatusResponse(**meta)

import os
import shutil
from .config import settings

def ensure_dirs():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.JOB_DIR, exist_ok=True)
    os.makedirs(settings.EXPORT_DIR, exist_ok=True)

def get_video_path(video_id: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, f"{video_id}.mp4")

def video_exists(video_id: str) -> bool:
    return os.path.exists(get_video_path(video_id))

def get_job_dir(job_id: str) -> str:
    path = os.path.join(settings.JOB_DIR, job_id)
    os.makedirs(path, exist_ok=True)
    return path

def get_job_meta_path(job_id: str) -> str:
    return os.path.join(get_job_dir(job_id), "meta.json")

def get_job_result_path(job_id: str) -> str:
    return os.path.join(get_job_dir(job_id), "result.json")

def get_export_dir(job_id: str) -> str:
    path = os.path.join(settings.EXPORT_DIR, job_id)
    os.makedirs(path, exist_ok=True)
    return path

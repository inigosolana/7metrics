"""
Storage utilities for managing files and job metadata.
"""
import json
import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

from app.config import settings
from app.schemas import JobMetadata, JobStatus


class StorageManager:
    """Manages file storage and job metadata persistence."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.uploads_path = self.base_path / settings.UPLOADS_DIR
        self.jobs_path = self.base_path / settings.JOBS_DIR
        self.exports_path = self.base_path / settings.EXPORTS_DIR
    
    # --- Video Upload Methods ---
    
    def get_upload_path(self, video_id: str, extension: str = "mp4") -> Path:
        """Get the path where an uploaded video should be stored."""
        return self.uploads_path / f"{video_id}.{extension}"
    
    def video_exists(self, video_id: str) -> bool:
        """Check if a video file exists."""
        # Check common extensions
        for ext in ["mp4", "mov", "MP4", "MOV"]:
            if self.get_upload_path(video_id, ext).exists():
                return True
        return False
    
    def get_video_path(self, video_id: str) -> Optional[Path]:
        """Get the actual path of an existing video (checks extensions)."""
        for ext in ["mp4", "mov", "MP4", "MOV"]:
            path = self.get_upload_path(video_id, ext)
            if path.exists():
                return path
        return None
    
    # --- Job Management Methods ---
    
    def create_job(
        self,
        job_id: str,
        mode: str,
        video_id: str,
        config: Optional[Dict[str, Any]] = None
    ) -> JobMetadata:
        """Create a new job with metadata."""
        job_dir = self.jobs_path / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        now = datetime.utcnow()
        metadata = JobMetadata(
            job_id=job_id,
            mode=mode,
            video_id=video_id,
            status=JobStatus.QUEUED,
            progress_percentage=0,
            current_step="Initializing...",
            created_at=now,
            updated_at=now,
            config=config or {}
        )
        
        self._save_job_metadata(job_id, metadata)
        return metadata
    
    def get_job_metadata(self, job_id: str) -> Optional[JobMetadata]:
        """Load job metadata from disk."""
        meta_file = self.jobs_path / job_id / "meta.json"
        if not meta_file.exists():
            return None
        
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return JobMetadata(**data)
        except Exception:
            return None
    
    def update_job_metadata(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        progress_percentage: Optional[int] = None,
        current_step: Optional[str] = None,
        error: Optional[str] = None
    ) -> Optional[JobMetadata]:
        """Update job metadata."""
        metadata = self.get_job_metadata(job_id)
        if not metadata:
            return None
        
        if status:
            metadata.status = status
        if progress_percentage is not None:
            metadata.progress_percentage = progress_percentage
        if current_step:
            metadata.current_step = current_step
        if error is not None:
            metadata.error = error
        
        metadata.updated_at = datetime.utcnow()
        self._save_job_metadata(job_id, metadata)
        return metadata
    
    def _save_job_metadata(self, job_id: str, metadata: JobMetadata):
        """Save job metadata to disk."""
        meta_file = self.jobs_path / job_id / "meta.json"
        meta_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata.model_dump(mode="json"), f, indent=2, default=str)
    
    def save_job_result(self, job_id: str, result: Dict[str, Any]):
        """Save job result (MatchReport) to disk."""
        result_file = self.jobs_path / job_id / "result.json"
        result_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(result_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, default=str)
    
    def get_job_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Load job result from disk."""
        result_file = self.jobs_path / job_id / "result.json"
        if not result_file.exists():
            return None
        
        try:
            with open(result_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    
    def job_exists(self, job_id: str) -> bool:
        """Check if a job directory exists."""
        return (self.jobs_path / job_id).exists()
    
    # --- Export Methods ---
    
    def get_clip_path(self, event_id: str) -> Path:
        """Get the path for a single clip file."""
        return self.exports_path / f"{event_id}.mp4"
    
    def get_zip_path(self, job_id: str) -> Path:
        """Get the path for a job's ZIP export."""
        return self.exports_path / job_id / "clips.zip"
    
    def clip_exists(self, event_id: str) -> bool:
        """Check if a clip file exists."""
        return self.get_clip_path(event_id).exists()
    
    def zip_exists(self, job_id: str) -> bool:
        """Check if a ZIP export exists."""
        return self.get_zip_path(job_id).exists()


# Global storage manager instance
storage = StorageManager()


def generate_job_id() -> str:
    """Generate a unique job ID."""
    return f"job_{uuid.uuid4().hex[:12]}"


def generate_video_id() -> str:
    """Generate a unique video ID."""
    return str(uuid.uuid4())

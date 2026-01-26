"""
Export service for managing clip downloads and ZIP creation.
"""
import os
import zipfile
from pathlib import Path
from typing import Optional

from app.storage import storage


class ExportService:
    """Service for handling clip exports and ZIP downloads."""
    
    def create_clips_zip(self, job_id: str, event_ids: list[str]) -> Optional[Path]:
        """
        Create a ZIP file containing all clips for a job.
        
        Args:
            job_id: The job ID
            event_ids: List of event IDs to include
        
        Returns:
            Path to the created ZIP file, or None if no clips found
        """
        zip_path = storage.get_zip_path(job_id)
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Collect all existing clip files
        clip_files = []
        for event_id in event_ids:
            clip_path = storage.get_clip_path(event_id)
            if clip_path.exists():
                clip_files.append((event_id, clip_path))
        
        if not clip_files:
            return None
        
        # Create ZIP archive
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for event_id, clip_path in clip_files:
                # Add file to ZIP with event_id as filename
                arcname = f"{event_id}.mp4"
                zipf.write(clip_path, arcname=arcname)
        
        return zip_path


# Global export service instance
export_service = ExportService()

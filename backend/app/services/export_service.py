import os
import httpx
from fastapi.responses import FileResponse, StreamingResponse
from ..storage import get_export_dir
from ..config import settings

async def get_single_clip_response(event_id: str):
    # For MVP: Look for a file named {event_id}.mp4 in any job export dir
    # Or more realistically, look for it in the jobs result mapping
    # Since we don't have a DB, we search in the exports folder
    
    # Placeholder search
    for job_id in os.listdir(settings.EXPORT_DIR):
        file_path = os.path.join(settings.EXPORT_DIR, job_id, f"{event_id}.mp4")
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="video/mp4")
            
    # If not found locally, maybe it's in a mock result? 
    # Return a 404 or a dummy video
    return None

async def get_zip_response(job_id: str):
    zip_path = os.path.join(settings.EXPORT_DIR, job_id, "clips.zip")
    if os.path.exists(zip_path):
        return FileResponse(zip_path, media_type="application/zip", filename=f"clips_{job_id}.zip")
    return None

"""
Router for serving raw video files.
"""
import logging
import os
from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import FileResponse, Response

from app.storage import storage
from app.schemas import ErrorResponse

logger = logging.getLogger(__name__)

# Note: this router is separate from "upload" to keep concerns separated (serving vs accepting)
router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/{video_id}/raw", response_class=FileResponse)
async def get_raw_video(video_id: str = Path(...)):
    """
    Serve the raw video file for a given video ID.
    
    - Used by external workers (Colab) to download the video.
    - No authentication required for this specific endpoint to allow easy access by workers.
    """
    video_path = storage.get_video_path(video_id)
    
    if not video_path:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Video {video_id} not found"
            ).model_dump()
        )
    
    # Ensure file exists
    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Video file for {video_id} not found on disk"
            ).model_dump()
        )
        
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"{video_id}.mp4"
    )

@router.head("/{video_id}/raw")
async def get_raw_video_head(video_id: str = Path(...)):
    """
    Check if video exists (HEAD request).
    """
    video_path = storage.get_video_path(video_id)
    
    if not video_path or not video_path.exists():
        raise HTTPException(status_code=404)
        
    file_size = os.path.getsize(video_path)
    return Response(
        headers={
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes"
        }
    )

"""
Upload endpoint for video files.
"""
import logging
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import VideoUploadResponse, ErrorResponse
from app.storage import storage, generate_video_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("", response_model=VideoUploadResponse, status_code=201)
async def upload_video(file: UploadFile = File(...)):
    """
    Upload a video file for processing.
    
    - Accepts MP4 and MOV files
    - Maximum size: 2GB (configurable via MAX_UPLOAD_BYTES)
    - Returns a unique video_id for subsequent operations
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                code=422,
                message="No filename provided"
            ).model_dump()
        )
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".mp4", ".mov"]:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                code=422,
                message=f"Unsupported file format: {file_ext}. Only .mp4 and .mov are allowed."
            ).model_dump()
        )
    
    # Generate unique video ID
    video_id = generate_video_id()
    video_path = storage.get_upload_path(video_id, file_ext.lstrip("."))
    
    # Ensure upload directory exists
    video_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Stream file to disk and check size
    total_bytes = 0
    try:
        with open(video_path, "wb") as f:
            while chunk := await file.read(8192):  # 8KB chunks
                total_bytes += len(chunk)
                
                # Check size limit
                if total_bytes > settings.MAX_UPLOAD_BYTES:
                    # Clean up partial file
                    f.close()
                    os.remove(video_path)
                    raise HTTPException(
                        status_code=413,
                        detail=ErrorResponse(
                            code=413,
                            message=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_BYTES} bytes"
                        ).model_dump()
                    )
                
                f.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        # Clean up if file was created
        if video_path.exists():
            os.remove(video_path)
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                code=500,
                message="Failed to save uploaded file"
            ).model_dump()
        )
    
    logger.info(f"Uploaded video {video_id} ({total_bytes} bytes) to {video_path}")
    
    # Return relative path (from backend/)
    relative_path = f"/data/uploads/{video_path.name}"
    
    return VideoUploadResponse(
        video_id=video_id,
        path=relative_path
    )

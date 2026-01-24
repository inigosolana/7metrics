from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import os
import aiofiles
from ..schemas import VideoUploadResponse, ErrorResponse
from ..config import settings
from ..storage import get_video_path

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("", response_model=VideoUploadResponse, status_code=201)
async def upload_video(file: UploadFile = File(...)):
    # Validation
    if not file.filename.lower().endswith(('.mp4', '.mov')):
        raise HTTPException(status_code=422, detail="Unsupported video format. Use MP4 or MOV.")
    
    # Check size (approximate)
    # Note: For real large files, we should stream and check size
    
    video_id = str(uuid.uuid4())
    file_path = get_video_path(video_id)
    
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            if len(content) > settings.MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="File too large")
            await out_file.write(content)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        
    return VideoUploadResponse(video_id=video_id, path=f"/data/uploads/{video_id}.mp4")

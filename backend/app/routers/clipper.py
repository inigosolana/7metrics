from fastapi import APIRouter, HTTPException, BackgroundTasks
import uuid
from ..schemas import ClipRequest, JobStatusResponse, JobStatus
from ..jobs import create_job, load_job_meta
from ..storage import video_exists
from ..services.job_runner import start_job_execution
from ..services.export_service import get_single_clip_response, get_zip_response

router = APIRouter(prefix="/clipper", tags=["Clipper"])

@router.post("/start", response_model=JobStatusResponse, status_code=202)
async def start_clipper(request: ClipRequest, background_tasks: BackgroundTasks):
    if not video_exists(request.video_id):
        raise HTTPException(status_code=404, detail="Video not found")
    
    job_id = f"clip_{uuid.uuid4().hex[:8]}"
    job_info = create_job(job_id, request.video_id, "clipper", request.config.dict() if request.config else {})
    
    # Start process
    background_tasks.add_task(start_job_execution, job_id, request.video_id, "clipper", request.config.dict() if request.config else {})
    
    return job_info

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_clipper_status(job_id: str):
    meta = load_job_meta(job_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(**meta)

@router.get("/download/single/{event_id}")
async def download_single_clip(event_id: str):
    response = await get_single_clip_response(event_id)
    if not response:
        raise HTTPException(status_code=404, detail="Clip not found")
    return response

@router.get("/download/zip/{job_id}")
async def download_zip(job_id: str):
    response = await get_zip_response(job_id)
    if not response:
        raise HTTPException(status_code=404, detail="ZIP not found")
    return response

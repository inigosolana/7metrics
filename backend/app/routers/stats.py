from fastapi import APIRouter, HTTPException, BackgroundTasks
import uuid
from ..schemas import AnalysisRequest, JobStatusResponse, MatchReport
from ..jobs import create_job, load_job_meta, load_job_result
from ..storage import video_exists
from ..services.job_runner import start_job_execution

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.post("/start", response_model=JobStatusResponse, status_code=202)
async def start_stats(request: AnalysisRequest, background_tasks: BackgroundTasks):
    if not video_exists(request.video_id):
        raise HTTPException(status_code=404, detail="Video not found")
    
    job_id = f"stats_{uuid.uuid4().hex[:8]}"
    job_info = create_job(job_id, request.video_id, "stats", request.config.dict() if request.config else {})
    
    # Start process
    background_tasks.add_task(start_job_execution, job_id, request.video_id, "stats", request.config.dict() if request.config else {})
    
    return job_info

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_stats_status(job_id: str):
    meta = load_job_meta(job_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(**meta)

@router.get("/report/{job_id}", response_model=MatchReport)
async def get_match_report(job_id: str):
    result = load_job_result(job_id)
    if not result:
        # Check if job exists but not completed
        meta = load_job_meta(job_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Job not found")
        raise HTTPException(status_code=400, detail="Report not ready yet")
    return MatchReport(**result)

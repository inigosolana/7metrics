from fastapi import APIRouter, HTTPException
from ..schemas import ColabCallback, JobStatus
from ..jobs import update_job_status, save_job_result, load_job_meta

router = APIRouter(prefix="/callback", tags=["Internal"])

@router.post("/colab")
async def colab_callback(payload: ColabCallback):
    meta = load_job_meta(payload.job_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_job_status(
        payload.job_id, 
        payload.status, 
        progress=payload.progress_percentage, 
        current_step=payload.current_step
    )
    
    if payload.status == JobStatus.COMPLETED and payload.result:
        save_job_result(payload.job_id, payload.result)
        
    return {"status": "ok"}

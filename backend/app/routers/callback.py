"""
Callback endpoints for Colab worker updates.
"""
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.schemas import ColabCallbackPayload, JobStatus
from app.storage import storage
from app.services.export_service import export_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/callback", tags=["callback"])


@router.post("/colab")
async def handle_colab_callback(payload: ColabCallbackPayload, background_tasks: BackgroundTasks):
    """
    Receive status updates from Colab worker.
    """
    logger.info(f"Received callback for job {payload.job_id}: {payload.status}")
    
    # Verify job exists
    if not storage.job_exists(payload.job_id):
        logger.warning(f"Callback received for unknown job {payload.job_id}")
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update metadata
    storage.update_job_metadata(
        job_id=payload.job_id,
        status=payload.status,
        progress_percentage=payload.progress_percentage,
        current_step=payload.current_step,
        error=payload.error
    )
    
    # If completed, save result and trigger post-processing
    if payload.status == JobStatus.COMPLETED:
        if payload.result:
            storage.save_job_result(payload.job_id, payload.result)
            logger.info(f"Saved result for job {payload.job_id}")
            
            # Retrieve metadata to check mode
            meta = storage.get_job_metadata(payload.job_id)
            if meta and meta.mode == "clipper":
                # Trigger ZIP creation in background
                # We need to extract event IDs from the result
                timeline = payload.result.get("timeline", [])
                event_ids = [evt.get("event_id") for evt in timeline if evt.get("event_id")]
                
                if event_ids:
                    background_tasks.add_task(
                        export_service.create_clips_zip, 
                        payload.job_id, 
                        event_ids
                    )
                    logger.info(f"Scheduled ZIP creation for job {payload.job_id}")
        else:
            logger.warning(f"Job {payload.job_id} completed but no result provided")
    
    return {"status": "ok"}

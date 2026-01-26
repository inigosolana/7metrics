"""
Stats endpoints for statistical analysis jobs.
"""
import logging
from fastapi import APIRouter, HTTPException, Path

from app.config import settings
from app.schemas import (
    AnalysisRequest,
    JobStatusResponse,
    MatchReport,
    ErrorResponse,
    JobStatus
)
from app.storage import storage, generate_job_id
from app.services.colab_client import colab_client
from app.services.mock_generator import generate_mock_match_report
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stats", tags=["stats"])


@router.post("/start", response_model=JobStatusResponse, status_code=202)
async def start_stats_job(request: AnalysisRequest):
    """
    Start an asynchronous statistical analysis job.
    
    - Validates that the video_id exists
    - Creates a job and delegates to Colab worker (if available)
    - Falls back to mock mode if Colab is not configured
    """
    # Validate video exists
    if not storage.video_exists(request.video_id):
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Video {request.video_id} not found"
            ).model_dump()
        )
    
    # Generate job ID
    job_id = generate_job_id()
    
    # Create job metadata
    config_dict = request.config.model_dump() if request.config else {}
    metadata = storage.create_job(
        job_id=job_id,
        mode="stats",
        video_id=request.video_id,
        config=config_dict
    )
    
    # Get video path
    video_path = storage.get_video_path(request.video_id)
    if not video_path:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Video file for {request.video_id} not found"
            ).model_dump()
        )
    
    # Prepare callback URL
    callback_url = f"{settings.PUBLIC_BASE_URL}/api/v1/callback/colab"
    
    # Prepare public video URL
    video_url = f"{settings.PUBLIC_BASE_URL}/api/v1/videos/{request.video_id}/raw"
    
    # Try to delegate to Colab
    colab_success = False
    if colab_client.is_available():
        try:
            await colab_client.start_job(
                job_id=job_id,
                mode="stats",
                video_url=video_url,
                config=config_dict,
                callback_url=callback_url
            )
            colab_success = True
            logger.info(f"Job {job_id} delegated to Colab worker")
            
            # Update status to PROCESSING
            storage.update_job_metadata(
                job_id=job_id,
                status=JobStatus.PROCESSING,
                current_step="Sent to Colab worker..."
            )
        except Exception as e:
            logger.warning(f"Failed to delegate to Colab: {e}. Falling back to mock mode.")
    
    # If Colab not available or failed, use mock mode
    if not colab_success:
        logger.info(f"Job {job_id} running in MOCK mode")
        # Schedule background task to simulate processing
        asyncio.create_task(_simulate_stats_processing(job_id, request.video_id))
    
    # Return current status
    metadata = storage.get_job_metadata(job_id)
    return JobStatusResponse(
        job_id=metadata.job_id,
        status=metadata.status,
        progress_percentage=metadata.progress_percentage,
        current_step=metadata.current_step,
        created_at=metadata.created_at,
        error=metadata.error
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_stats_job_status(job_id: str = Path(...)):
    """
    Get the current status of a stats job.
    """
    metadata = storage.get_job_metadata(job_id)
    if not metadata:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Job {job_id} not found"
            ).model_dump()
        )
    
    return JobStatusResponse(
        job_id=metadata.job_id,
        status=metadata.status,
        progress_percentage=metadata.progress_percentage,
        current_step=metadata.current_step,
        created_at=metadata.created_at,
        error=metadata.error
    )


@router.get("/report/{job_id}", response_model=MatchReport)
async def get_match_report(job_id: str = Path(...)):
    """
    Get the final match report for a completed stats job.
    
    - Returns the complete MatchReport JSON with timeline and statistics
    - Only available after job status is COMPLETED
    """
    # Check if job exists
    metadata = storage.get_job_metadata(job_id)
    if not metadata:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Job {job_id} not found"
            ).model_dump()
        )
    
    # Get result
    result = storage.get_job_result(job_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                code=404,
                message=f"Report for job {job_id} not found. Job may still be processing or failed."
            ).model_dump()
        )
    
    return MatchReport(**result)


async def _simulate_stats_processing(job_id: str, video_id: str):
    """Background task to simulate stats processing in mock mode."""
    try:
        # Simulate processing steps
        steps = [
            (15, "Loading video and initializing models..."),
            (30, "Detecting ball and players (YOLOv8)..."),
            (50, "Tracking players (ByteTrack)..."),
            (70, "Analyzing team colors (K-Means clustering)..."),
            (90, "Classifying events and building timeline..."),
        ]
        
        for progress, step in steps:
            await asyncio.sleep(2)  # Simulate work
            storage.update_job_metadata(
                job_id=job_id,
                status=JobStatus.PROCESSING,
                progress_percentage=progress,
                current_step=step
            )
        
        # Generate mock result
        result = generate_mock_match_report(job_id, video_id, mode="stats")
        storage.save_job_result(job_id, result)
        
        # Mark as completed
        storage.update_job_metadata(
            job_id=job_id,
            status=JobStatus.COMPLETED,
            progress_percentage=100,
            current_step="Analysis complete!"
        )
        
        logger.info(f"Mock stats job {job_id} completed")
        
    except Exception as e:
        logger.error(f"Mock stats job {job_id} failed: {e}")
        storage.update_job_metadata(
            job_id=job_id,
            status=JobStatus.ERROR,
            error=str(e)
        )

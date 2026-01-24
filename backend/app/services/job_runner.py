from .colab_client import call_colab_start
from .mock_generator import generate_mock_report
from ..jobs import update_job_status, save_job_result
from ..schemas import JobStatus
from ..storage import get_video_path

async def start_job_execution(job_id: str, video_id: str, mode: str, config: dict):
    video_path = get_video_path(video_id)
    
    # Try calling Colab
    success = await call_colab_start(job_id, mode, video_path, config)
    
    if success:
        update_job_status(job_id, JobStatus.PROCESSING, progress=5, current_step="Sent to Colab")
    else:
        # Fallback to MOCK mode
        update_job_status(job_id, JobStatus.PROCESSING, progress=10, current_step="Running MOCK mode (Colab offline)")
        
        # Simulate local processing for a bit? No, just complete it for now or set to COMPLETED
        # In a real app we might use a background task to simulate progress
        report = generate_mock_report(job_id, video_id)
        save_job_result(job_id, report)
        update_job_status(job_id, JobStatus.COMPLETED, progress=100, current_step="Completed (Mock)")

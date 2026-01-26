"""
Client for communicating with Google Colab worker.
"""
import httpx
import logging
from typing import Dict, Any, Optional

from app.config import settings
from app.schemas import JobStatus

logger = logging.getLogger(__name__)


class ColabClient:
    """Client for sending jobs to Colab worker and handling responses."""
    
    def __init__(self):
        self.worker_url = settings.COLAB_WORKER_URL
        self.timeout = 30.0  # 30 seconds timeout for HTTP requests
    
    def is_available(self) -> bool:
        """Check if Colab worker URL is configured."""
        return bool(self.worker_url and self.worker_url.strip())
    
    async def start_job(
        self,
        job_id: str,
        mode: str,
        video_url: str,
        config: Dict[str, Any],
        callback_url: str
    ) -> Dict[str, Any]:
        """
        Send a job to the Colab worker.
        
        Args:
            job_id: Unique job identifier
            mode: "clipper" or "stats"
            video_url: Public URL to the video file
            config: Job configuration (ClipConfig or AnalysisConfig)
            callback_url: URL for Colab to send progress updates
        
        Returns:
            Response from Colab worker
        
        Raises:
            httpx.HTTPError: If the request fails
        """
        if not self.is_available():
            raise RuntimeError("Colab worker URL not configured")
        
        payload = {
            "job_id": job_id,
            "mode": mode,
            "video_path": video_url,  # Worker expects "video_path" key for the URL
            "config": config,
            "callback_url": callback_url
        }
        
        start_url = f"{self.worker_url.rstrip('/')}/start"
        
        logger.info(f"Sending job {job_id} to Colab at {start_url}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(start_url, json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Failed to start Colab job {job_id}: {e}")
            raise
    
    async def check_health(self) -> bool:
        """
        Check if the Colab worker is healthy.
        
        Returns:
            True if worker responds to health check, False otherwise
        """
        if not self.is_available():
            return False
        
        health_url = f"{self.worker_url.rstrip('/')}/health"
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(health_url)
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Colab health check failed: {e}")
            return False


# Global client instance
colab_client = ColabClient()

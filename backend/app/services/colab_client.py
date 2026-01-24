import httpx
from typing import Dict, Any, Optional
from ..config import settings

async def call_colab_start(job_id: str, mode: str, video_path: str, config: Dict[str, Any]) -> bool:
    if not settings.COLAB_WORKER_URL:
        return False
    
    url = f"{settings.COLAB_WORKER_URL}/start"
    payload = {
        "job_id": job_id,
        "mode": mode,
        "video_path": video_path,
        "config": config,
        "callback_url": f"{settings.PUBLIC_BASE_URL}/api/v1/callback/colab"
    }
    
    headers = {}
    if settings.COLAB_API_KEY:
        headers["X-API-KEY"] = settings.COLAB_API_KEY
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            return response.status_code == 200
    except Exception as e:
        print(f"Error calling Colab: {e}")
        return False

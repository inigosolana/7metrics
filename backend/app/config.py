from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    COLAB_WORKER_URL: Optional[str] = None
    COLAB_API_KEY: Optional[str] = None
    PUBLIC_BASE_URL: str = "http://localhost:8000"
    MAX_UPLOAD_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB
    ALLOWED_ORIGINS: List[str] = ["*"]
    STORAGE_MODE: str = "local"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    UPLOAD_DIR: str = os.path.join(DATA_DIR, "uploads")
    JOB_DIR: str = os.path.join(DATA_DIR, "jobs")
    EXPORT_DIR: str = os.path.join(DATA_DIR, "exports")

    class Config:
        env_file = ".env"

settings = Settings()

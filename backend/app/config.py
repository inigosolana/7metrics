"""
Configuration module using Pydantic Settings for environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Colab worker configuration
    COLAB_WORKER_URL: str = ""  # HTTP URL of the Colab worker
    
    # Public base URL for callbacks
    PUBLIC_BASE_URL: str = "https://euphoniously-unquilted-nichole.ngrok-free.dev"
    
    # Upload limits
    MAX_UPLOAD_BYTES: int = 2 * 1024 * 1024 * 1024  # 2GB default
    
    # CORS configuration
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Storage paths (relative to backend/)
    DATA_DIR: str = "data"
    UPLOADS_DIR: str = "data/uploads"
    JOBS_DIR: str = "data/jobs"
    EXPORTS_DIR: str = "data/exports"
    
    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


def ensure_directories():
    """Create required directories if they don't exist."""
    base_path = os.path.join(os.path.dirname(os.path.dirname(__file__)))
    
    dirs = [
        os.path.join(base_path, settings.DATA_DIR),
        os.path.join(base_path, settings.UPLOADS_DIR),
        os.path.join(base_path, settings.JOBS_DIR),
        os.path.join(base_path, settings.EXPORTS_DIR),
    ]
    
    for directory in dirs:
        os.makedirs(directory, exist_ok=True)

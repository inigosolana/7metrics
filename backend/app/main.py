"""
Main FastAPI application entry point.
"""
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings, ensure_directories
from app.routers import upload, clipper, stats, callback, videos

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events.
    """
    # Startup: Ensure directories exist
    ensure_directories()
    logger.info("Application started. storage directories ready.")
    
    yield
    
    # Shutdown: Clean up resources if needed
    logger.info("Application shutting down.")


app = FastAPI(
    title="Antigravity Sports API",
    description="API for handball video analysis, clip generation, and statistics.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for direct access to uploads and exports (useful for dev/testing)
# In production, these should ideally be served by Nginx or a CDN
app.mount("/data/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")
app.mount("/data/exports", StaticFiles(directory=settings.EXPORTS_DIR), name="exports")

# Include routers
app.include_router(upload.router, prefix="/api/v1")
app.include_router(clipper.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(callback.router, prefix="/api/v1")
app.include_router(videos.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

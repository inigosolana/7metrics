from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .storage import ensure_dirs
from .routers import upload, clipper, stats, callback

app = FastAPI(
    title="Antigravity Sports API",
    description="API para el análisis automatizado de vídeo de balonmano.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
async def startup_event():
    ensure_dirs()

# Routers
app.include_router(upload.router, prefix="/api/v1")
app.include_router(clipper.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(callback.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Antigravity Sports API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }

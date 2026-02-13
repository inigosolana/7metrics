import os
import shutil
import json
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from processor import VideoProcessor

app = FastAPI(title="7metrics Optimized Video API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output_clips"
processor = VideoProcessor(UPLOAD_DIR, OUTPUT_DIR)

# Serve generated clips
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

@app.get("/status")
def get_status():
    """Returns the current processing status."""
    return processor.global_state

@app.post("/upload-match")
async def upload_match(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Receives video and starts the background analysis pipeline.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Reset state and start background task
    processor.global_state["progress"] = 0
    processor.global_state["status"] = "processing"
    background_tasks.add_task(processor.process_match, file_path)
    
    return {"message": "Processing started", "status": "started"}

@app.get("/clips")
def list_clips():
    """
    Scans the output directory and returns found clips dynamically.
    """
    all_clips = []
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for f in files:
            if f.endswith(".mp4"):
                rel_path = os.path.relpath(os.path.join(root, f), OUTPUT_DIR)
                # Structure: Team/Player/Timestamp.mp4
                path_parts = rel_path.replace(os.sep, '/').split('/')
                team = path_parts[0] if len(path_parts) > 2 else "OFFENSE"
                player = path_parts[1] if len(path_parts) > 2 else "UNK"
                
                all_clips.append({
                    "filename": f,
                    "path": rel_path.replace(os.sep, '/'),
                    "url": f"/static/{rel_path.replace(os.sep, '/')}",
                    "team": team,
                    "player": player,
                    "actionType": "GOAL" # Default for offensive clips
                })
    return all_clips

@app.get("/download/{path:path}")
def download_clip(path: str):
    full_path = os.path.join(OUTPUT_DIR, path)
    if os.path.exists(full_path):
        return FileResponse(full_path)
    return JSONResponse(status_code=404, content={"message": "Clip not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

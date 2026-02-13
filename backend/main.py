from fastapi.staticfiles import StaticFiles
import json

app = FastAPI(title="7metrics Video Logic API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output_clips"
processor = VideoProcessor(UPLOAD_DIR, OUTPUT_DIR)

# Servir los videos recortados para que el frontend pueda verlos/descargarlos
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

@app.post("/upload-match")
async def upload_match(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Recibe el video del partido y lanza el procesamiento.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # En esta simulación, procesamos de inmediato para el demo
    clips = processor.analyze_full_match(file_path)
    return {"message": "Procesamiento completado", "clips": clips}

@app.get("/clips")
async def get_clips():
    """
    Devuelve la lista de clips con sus metadatos desde el archivo JSON.
    """
    metadata_path = os.path.join(OUTPUT_DIR, "metadata.json")
    if os.path.exists(metadata_path):
        with open(metadata_path, "r") as f:
            return json.load(f)
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

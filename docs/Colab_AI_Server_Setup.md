# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import shutil
import time
import cv2
import numpy as np
import torch
import threading

# --- 1. CONFIGURACIÓN E INSTALACIÓN DE DEPENDENCIAS ---

def install_dependencies():
    print("🚀 Instalando dependencias de alto rendimiento...")
    try:
        # Usamos pip install directamente para asegurar que pyngrok y otros se instalen antes de importar
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", 
            "fastapi", "uvicorn", "python-multipart", "pyngrok", 
            "ultralytics", "opencv-python-headless", "ffmpeg-python", 
            "scikit-learn", "scipy", "lapx", "nest_asyncio"])
        print("✅ Dependencias instaladas.")
    except Exception as e:
        print(f"❌ Error instalando dependencias: {e}")

# Intentamos importar todo lo necesario de fuentes externas
try:
    from fastapi import FastAPI, UploadFile, File, BackgroundTasks
    from fastapi.responses import JSONResponse, FileResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pyngrok import ngrok
    import uvicorn
    from ultralytics import YOLO
    from sklearn.cluster import KMeans
    import nest_asyncio
except ImportError:
    install_dependencies()
    # Re-intentar importación tras instalar
    from fastapi import FastAPI, UploadFile, File, BackgroundTasks
    from fastapi.responses import JSONResponse, FileResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pyngrok import ngrok
    import uvicorn
    from ultralytics import YOLO
    from sklearn.cluster import KMeans
    import nest_asyncio

# Aplicar patch para permitir bucles anidados en Notebooks (Colab)
nest_asyncio.apply()

NGROK_AUTH_TOKEN = "38nuec0NauciUj1o70wg29N1xK2_5odXuyQSStGE6tLhuLXdq"
PORT = 8000

GLOBAL_STATE = {
    "progress": 0,
    "status": "idle",
    "current_file": "",
    "eta_seconds": 0
}

BASE_DIR = os.getcwd()
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "clips")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- 3. CLASES DE PROCESAMIENTO ---

class TeamClassifier:
    def __init__(self):
        self.kmeans = None
        self.trained = False

    def train(self, crops):
        if len(crops) < 10: return
        data = []
        for crop in crops:
            try:
                hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                avg_color = np.mean(hsv[int(hsv.shape[0]*0.3):int(hsv.shape[0]*0.7), 
                                       int(hsv.shape[1]*0.3):int(hsv.shape[1]*0.7)], axis=(0, 1))
                data.append(avg_color)
            except: continue
        
        if data:
            self.kmeans = KMeans(n_clusters=2, n_init=10)
            self.kmeans.fit(data)
            self.trained = True
            print("🎨 Equipos identificados por color.")

    def predict(self, crop):
        if not self.trained: return "UNKNOWN"
        try:
            hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
            avg_color = np.mean(hsv[int(hsv.shape[0]*0.3):int(hsv.shape[0]*0.7), 
                                   int(hsv.shape[1]*0.3):int(hsv.shape[1]*0.7)], axis=(0, 1))
            label = self.kmeans.predict([avg_color])[0]
            return "HOME" if label == 0 else "AWAY"
        except: return "UNKNOWN"

class HandballProcessor:
    def __init__(self, input_path):
        self.input_path = input_path
        self.model = YOLO("yolo11n.pt")
        self.team_clf = TeamClassifier()
        
        # Lógica de ataque
        self.in_attack = False
        self.attack_start_time = 0
        self.last_ball_pos = None
        self.possession_player = None
        self.possession_team = None
        
        # Buffer de entrenamiento de equipos
        self.training_crops = []

    def export_segment(self, start, end, team, player):
        timestamp = int(start)
        folder = os.path.join(OUTPUT_DIR, team, player)
        os.makedirs(folder, exist_ok=True)
        
        output_file = os.path.join(folder, f"{timestamp}.mp4")
        duration = end - start
        
        # FFmpeg -c copy para instantaneidad
        cmd = [
            'ffmpeg', '-y', '-ss', str(start), '-t', str(duration),
            '-i', self.input_path, '-c', 'copy', output_file
        ]
        subprocess.run(cmd, capture_output=True)
        print(f"🎬 Segmento guardado: {team}/{player}/{timestamp}.mp4")

    def process(self):
        cap = cv2.VideoCapture(self.input_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # ULTRA-OPTIMIZACIÓN: Stride 5
        # En balonmano, una fase de ataque dura 20-40s. Verificar 6 veces por segundo (30fps/5) es suficiente.
        stride = 5 
        print(f"🚀 MODO HIPER-VELOCIDAD ACTIVADO (Stride={stride})")
        
        start_time = time.time()
        frame_idx = 0
        
        # Buffer de ataque
        # Guardaremos clips cuando el juego esté en las áreas (Zona < 35% o Zona > 65%)
        # La zona central se considera transición.
        attack_min_x = w * 0.35
        attack_max_x = w * 0.65
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            # Salto de frames manual para velocidad extrema
            if frame_idx % stride != 0:
                frame_idx += 1
                continue

            current_time = frame_idx / fps
            
            # Redimensión para inferencia (640px es el sweet spot rendimiento/precisión)
            small_frame = cv2.resize(frame, (640, 384))

            # Inferencia YOLO con persistencia de tracks
            # classes=[0, 32] -> Persona y Balón
            results = self.model.track(small_frame, persist=True, verbose=False, imgsz=640, classes=[0, 32], conf=0.25)
            res = results[0]
            
            scale_x = w / 640
            scale_y = h_orig / 384
            
            ball_pos = None
            players = []
            
            if res.boxes is not None:
                boxes = res.boxes.xyxy.cpu().numpy()
                cls = res.boxes.cls.cpu().numpy()
                ids = res.boxes.id.int().cpu().numpy() if res.boxes.id is not None else []
                
                for i in range(len(boxes)):
                    box = boxes[i]
                    c = cls[i]
                    
                    # Coordenadas escaladas al frame original
                    x1 = int(box[0] * scale_x)
                    y1 = int(box[1] * scale_y)
                    x2 = int(box[2] * scale_x)
                    y2 = int(box[3] * scale_y)
                    
                    if c == 32: # Ball
                        ball_pos = ((x1+x2)/2, (y1+y2)/2)
                    elif c == 0 and i < len(ids): # Player
                        players.append({'id': ids[i], 'box': [x1, y1, x2, y2]})
                        
                        # Recolectar muestras para clasificación de equipos
                        if not self.team_clf.trained and len(self.training_crops) < 60:
                            # Crop seguro
                            crop = frame[max(0,y1):min(y2,h_orig), max(0,x1):min(x2,w)]
                            if crop.size > 0: self.training_crops.append(crop)
                
                # Entrenar solo si tenemos suficientes muestras y aún no está entrenado
                if len(self.training_crops) >= 60 and not self.team_clf.trained:
                    self.team_clf.train(self.training_crops)

            # LÓGICA DE POSESIÓN Y ATAQUE
            if ball_pos:
                bx, by = ball_pos
                
                if frame_idx % 200 == 0:
                     print(f"📍 BALL DETECTED at ({bx:.0f}, {by:.0f}) [T={current_time:.0f}s]")

                # 1. Determinar Posesión
                closest_player = None
                min_dist = 200 # pixels (en resolución original)
                
                for p in players:
                    px = (p['box'][0] + p['box'][2]) / 2
                    py = (p['box'][1] + p['box'][3]) / 2
                    dist = np.sqrt((px - bx)**2 + (py - by)**2)
                    if dist < min_dist:
                        min_dist = dist
                        closest_player = p
                
                if closest_player:
                    self.possession_player = f"P-{closest_player['id']}"
                    # Predecir equipo si es posible
                    if self.team_clf.trained:
                         x1, y1, x2, y2 = closest_player['box']
                         crop = frame[max(0,y1):min(y2,h_orig), max(0,x1):min(x2,w)]
                         if crop.size > 0:
                             self.possession_team = self.team_clf.predict(crop)

                # 2. Detección de Zona de Ataque (Cualquiera de las dos áreas)
                in_danger_zone = (bx < attack_min_x) or (bx > attack_max_x)
                
                if not self.in_attack and in_danger_zone:
                    print(f"⚔️ Ataque detectado (t={current_time:.1f}s)")
                    self.in_attack = True
                    self.attack_start_time = max(0, current_time - 5) # Buffer de entrada
                
                elif self.in_attack and not in_danger_zone:
                    # El balón ha salido de la zona de peligro (vuelve al centro) -> Fin de jugada
                    # Buffer de salida de 3s para coger el repliegue
                    print(f"🛑 Fin de ataque (t={current_time:.1f}s)")
                    self.export_segment(self.attack_start_time, current_time + 3, 
                                        self.possession_team or "UNK", 
                                        self.possession_player or "UNK")
                    self.in_attack = False

            # Actualizar progreso UI más frecuentemente (cada ~100 frames procesados)
            frame_idx += 1
            if frame_idx % 100 == 0:
                elapsed = time.time() - start_time
                if elapsed > 0:
                    prog = (frame_idx / total_frames) * 100
                    fps_proc = frame_idx / elapsed
                    eta = int((total_frames - frame_idx) / fps_proc)
                    
                    GLOBAL_STATE["progress"] = prog
                    GLOBAL_STATE["eta_seconds"] = eta
                    print(f"⚡ {prog:.1f}% completo | Velocidad: {fps_proc:.1f} fps | ETA: {eta}s")

        # Cierre final (si se quedó un ataque a medias)
        if self.in_attack:
            self.export_segment(self.attack_start_time, total_frames/fps, 
                                self.possession_team or "UNK", 
                                self.possession_player or "UNK")

        cap.release()
        GLOBAL_STATE["status"] = "completed"
        GLOBAL_STATE["progress"] = 100
        print("✅ Procesamiento finalizado.")

# --- 4. API SERVIDOR ---

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/status")
def get_status(): return GLOBAL_STATE

@app.post("/upload-video")
async def upload(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)
    with open(path, "wb") as f: shutil.copyfileobj(file.file, f)
    GLOBAL_STATE["current_file"] = file.filename
    GLOBAL_STATE["status"] = "processing"
    GLOBAL_STATE["progress"] = 0
    background_tasks.add_task(run_pipeline, path)
    return {"status": "started"}

@app.get("/clips")
def list_clips():
    all_clips = []
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for f in files:
            if f.endswith(".mp4"):
                rel_path = os.path.relpath(os.path.join(root, f), OUTPUT_DIR)
                all_clips.append({
                    "filename": f,
                    "path": rel_path.replace(os.sep, '/'),
                    "url": f"/download/{rel_path.replace(os.sep, '/')}"
                })
    return all_clips

@app.get("/download/{team}/{player}/{filename}")
def download(team: str, player: str, filename: str):
    path = os.path.join(OUTPUT_DIR, team, player, filename)
    return FileResponse(path)

def run_pipeline(path):
    processor = HandballProcessor(path)
    processor.process()

if __name__ == "__main__":
    os.system("pkill ngrok")
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    url = ngrok.connect(PORT).public_url
    print(f"\n🌍 BACKEND URL: {url}\n")
    
    # IMPORTANTE: En Colab, uvicorn.run() falla si se llama directamente
    # porque ya hay un bucle de eventos corriendo. Lo lanzamos en un hilo.
    def start_server():
        config = uvicorn.Config(app, host="0.0.0.0", port=PORT, log_level="info")
        server = uvicorn.Server(config)
        server.run()

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    print("🚀 Servidor lanzado en segundo plano.")
    
    # Mantener el hilo principal vivo
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("🛑 Deteniendo...")

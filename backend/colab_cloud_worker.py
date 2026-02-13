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

# --- 1. INSTALACIÓN DE DEPENDENCIAS ---
def install_dependencies():
    print("🚀 Instalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", 
            "fastapi", "uvicorn", "python-multipart", "pyngrok", 
            "ultralytics", "opencv-python-headless", "ffmpeg-python", 
            "scikit-learn", "scipy", "lapx", "nest_asyncio"])
        print("✅ Dependencias listas.")
    except Exception as e:
        print(f"❌ Error instalando: {e}")

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
    from fastapi import FastAPI, UploadFile, File, BackgroundTasks
    from fastapi.responses import JSONResponse, FileResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pyngrok import ngrok
    import uvicorn
    from ultralytics import YOLO
    from sklearn.cluster import KMeans
    import nest_asyncio

nest_asyncio.apply()

# --- 2. MODELO DE LA TESIS (best.pt) ---
MODEL_PATH = "best.pt"

if not os.path.exists(MODEL_PATH):
    print(f"⚠️ NO SE ENCUENTRA 'best.pt' en la carpeta actual.")
    print("👉 Por favor, sube el archivo 'best.pt' a la carpeta de archivos de Colab.")
    # Fallback por si acaso
    MODEL_PATH = "yolo11n.pt"
else:
    print(f"✅ Modelo 'best.pt' detectado y listo para usar.")

# --- CONFIGURACIÓN ---
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

# --- CLASES DE PROCESAMIENTO ---

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
                avg = np.mean(hsv[int(hsv.shape[0]*0.3):int(hsv.shape[0]*0.7), 
                                 int(hsv.shape[1]*0.3):int(hsv.shape[1]*0.7)], axis=(0, 1))
                data.append(avg)
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
            avg = np.mean(hsv[int(hsv.shape[0]*0.3):int(hsv.shape[0]*0.7), 
                             int(hsv.shape[1]*0.3):int(hsv.shape[1]*0.7)], axis=(0, 1))
            label = self.kmeans.predict([avg])[0]
            return "HOME" if label == 0 else "AWAY"
        except: return "UNKNOWN"

class HandballProcessor:
    def __init__(self, input_path):
        self.input_path = input_path
        # Cargar el modelo descargado
        print(f"🧠 Cargando modelo: {MODEL_PATH}")
        self.model = YOLO(MODEL_PATH)
        self.team_clf = TeamClassifier()
        self.in_attack = False
        self.attack_start_time = 0
        self.training_crops = []

    def export_segment(self, start, end, team, player):
        timestamp = int(start)
        folder = os.path.join(OUTPUT_DIR, team, player)
        os.makedirs(folder, exist_ok=True)
        output_file = os.path.join(folder, f"{timestamp}.mp4")
        
        # MODO ULTRA-RÁPIDO: -c copy
        cmd = [
            'ffmpeg', '-y', '-ss', str(start), '-to', str(end),
            '-i', self.input_path, '-c', 'copy', '-loglevel', 'error', output_file
        ]
        subprocess.run(cmd)
        print(f"🎬 Clip guardado: {team}/{player}/{timestamp}.mp4")

    def process(self):
        cap = cv2.VideoCapture(self.input_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Stride equilibrado
        stride = 2
        print(f"🚀 Procesando con modelo tesis (Stride={stride})...")
        
        start_time = time.time()
        frame_idx = 0
        
        # Zonas de ataque (Áreas de 6m y 9m aprox)
        zona_izq = w * 0.30
        zona_der = w * 0.70
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            if frame_idx % stride != 0:
                frame_idx += 1
                continue

            current_time = frame_idx / fps
            
            # Redimensión para inferencia rápida
            small_frame = cv2.resize(frame, (640, 384))
            scale_x = w / 640
            scale_y = h_orig / 384

            # Tracking con persistencia
            # IMPORTANTE: El modelo de la tesis puede usar clases diferentes. 
            # Asumimos estándar YOLO: 0=Persona, 32=Balón (o similar si es custom)
            # Al no saber las clases exactas del .pt, lo dejamos abierto y filtramos por confianza
            results = self.model.track(small_frame, persist=True, verbose=False, imgsz=640, tracker="bytetrack.yaml", conf=0.25)
            res = results[0]
            
            ball_pos = None
            players = []

            if res.boxes is not None:
                boxes = res.boxes.xyxy.cpu().numpy()
                cls = res.boxes.cls.cpu().numpy()
                ids = res.boxes.id.int().cpu().numpy() if res.boxes.id is not None else []
                
                for i in range(len(boxes)):
                    c = int(cls[i])
                    box = boxes[i]
                    
                    # Coordenadas reales
                    x1 = int(box[0] * scale_x)
                    y1 = int(box[1] * scale_y)
                    x2 = int(box[2] * scale_x)
                    y2 = int(box[3] * scale_y)
                    
                    # Ajustar según las clases del modelo de la tesis
                    # Si es custom, quizás 0=jugador, 1=balón. Si es COCO, 0=persona, 32=balón.
                    # Probamos lógica genérica: Si es pequeño y en el aire -> Balón
                    
                    # (Asumimos COCO por defecto, si el modelo es custom detectará 'ball' en otra clase)
                    is_ball = (c == 32) or (res.names[c] == 'ball') or (res.names[c] == 'sports ball')
                    is_player = (c == 0) or (res.names[c] == 'person') or (res.names[c] == 'player')

                    if is_ball:
                        ball_pos = ((x1+x2)/2, (y1+y2)/2)
                    elif is_player and i < len(ids):
                        players.append({'id': ids[i], 'box': [x1, y1, x2, y2]})
                        
                        # Entrenamiento colores
                        if not self.team_clf.trained and len(self.training_crops) < 50:
                            crop = frame[max(0,y1):min(y2,h_orig), max(0,x1):min(x2,w)]
                            if crop.size > 0: self.training_crops.append(crop)

                if len(self.training_crops) >= 50 and not self.team_clf.trained:
                    self.team_clf.train(self.training_crops)

            # LÓGICA DE JUEGO
            if ball_pos:
                bx, by = ball_pos
                
                # Asignar posesión
                closest_player = None
                min_dist = 200
                for p in players:
                    px = (p['box'][0] + p['box'][2]) / 2
                    py = (p['box'][1] + p['box'][3]) / 2
                    dist = np.sqrt((px - bx)**2 + (py - by)**2)
                    if dist < min_dist:
                        min_dist = dist
                        closest_player = p
                
                possession_info = {"team": "UNK", "player": "UNK"}
                if closest_player:
                    pid = closest_player['id']
                    possession_info["player"] = f"P-{pid}"
                    p_box = closest_player['box']
                    crop = frame[max(0,p_box[1]):min(p_box[3],h_orig), max(0,p_box[0]):min(p_box[2],w)]
                    if crop.size > 0:
                        possession_info["team"] = self.team_clf.predict(crop)

                # Detección de Ataque (Zonas)
                in_danger = (bx < zona_izq) or (bx > zona_der)
                
                if not self.in_attack and in_danger:
                    print(f"⚔️ Ataque detectado en {current_time:.1f}s")
                    self.in_attack = True
                    self.attack_start_time = max(0, current_time - 5)
                    self.possession_player = possession_info["player"] # Guardar quién inicia
                    self.possession_team = possession_info["team"]

                elif self.in_attack and not in_danger:
                    print(f"🛑 Fin de ataque en {current_time:.1f}s")
                    self.export_segment(self.attack_start_time, current_time + 3, 
                                        self.possession_team or "UNK", 
                                        self.possession_player or "UNK")
                    self.in_attack = False

            # Progreso
            frame_idx += 1
            if frame_idx % 100 == 0:
                elapsed = time.time() - start_time
                if elapsed > 0:
                    prog = (frame_idx / total_frames) * 100
                    fps_proc = frame_idx / elapsed
                    eta = int((total_frames - frame_idx) / fps_proc)
                    GLOBAL_STATE["progress"] = prog
                    GLOBAL_STATE["eta_seconds"] = eta
                    print(f"📊 {prog:.1f}% | ETA: {eta}s")

        cap.release()
        GLOBAL_STATE["status"] = "completed"
        GLOBAL_STATE["progress"] = 100
        print("✅ Procesamiento completado con modelo Tesis.")

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

# Wrapper para correr el pipeline
def run_pipeline(path):
    HandballProcessor(path).process()

if __name__ == "__main__":
    os.system("pkill ngrok")
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    url = ngrok.connect(PORT).public_url
    print(f"\n🌍 BACKEND URL: {url}\n")
    
    def start_server():
        config = uvicorn.Config(app, host="0.0.0.0", port=PORT, log_level="info")
        server = uvicorn.Server(config)
        server.run()

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    print("🚀 Servidor lanzado en segundo plano.")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: print("🛑 Deteniendo...")

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
from collections import Counter, deque

# --- 1. INSTALACIÓN DE DEPENDENCIAS ---
def install_dependencies():
    print("🚀 Instalando dependencias de alto rendimiento...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", 
            "fastapi", "uvicorn", "python-multipart", "pyngrok", 
            "ultralytics", "opencv-python-headless", "ffmpeg-python", 
            "scikit-learn", "scipy", "lapx", "nest_asyncio", "tensorflow"])
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
    # Re-importar tras instalación
    from fastapi import FastAPI, UploadFile, File, BackgroundTasks
    from fastapi.responses import JSONResponse, FileResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pyngrok import ngrok
    import uvicorn
    from ultralytics import YOLO
    from sklearn.cluster import KMeans
    import nest_asyncio

nest_asyncio.apply()

# --- 1.1 CONFIGURACIÓN TENSORFLOW & MODELO LRCN ---
import tensorflow as tf
from tensorflow.keras.models import load_model

# Cargar el modelo de reconocimiento de acciones de la tesis
try:
    print("🧠 Cargando modelo de Acciones LRCN...")
    ACTION_MODEL = load_model("LRCN_model.h5") # Asegúrate de que el nombre coincida con el archivo que subas
    CLASSES_LIST = ["jump-shot", "dribbling", "shot", "defence", "passing"]
except Exception as e:
    print(f"⚠️ No se pudo cargar el modelo LRCN: {e}")
    ACTION_MODEL = None

# --- 2. GESTIÓN DEL MODELO (Auto-Export a TensorRT) ---
ORIGINAL_MODEL = "best.pt"
ENGINE_MODEL = "best.engine"

def load_optimized_model():
    """Carga TensorRT si existe y funciona, o convierte el .pt si hay GPU"""
    
    # 1. Intentar cargar motor existente con validación
    if os.path.exists(ENGINE_MODEL):
        print(f"⚡ Cargando motor acelerado: {ENGINE_MODEL}")
        try:
            model = YOLO(ENGINE_MODEL)
            # Prueba rápida de inferencia para validar versión (evita crash posterior)
            dummy = np.zeros((640, 640, 3), dtype=np.uint8)
            model.predict(dummy, verbose=False)
            print("✅ Motor validado correctamente.")
            return model
        except Exception as e:
            print(f"⚠️ MOTOR CORRUPTO O VERSIÓN INCORRECTA ({e}). ELIMINANDO PARA REGENERAR...")
            try:
                os.remove(ENGINE_MODEL)
            except:
                pass
            # Continuamos abajo para regenerarlo...

    # 2. Si no hay motor o falló, cargar .pt y optimizar
    if os.path.exists(ORIGINAL_MODEL):
        print(f"⚠️ Usando modelo estándar {ORIGINAL_MODEL}")
        if torch.cuda.is_available():
            print("🚀 GPU Detectada: Optimizando modelo (esto tarda ~2 min la primera vez)...")
            try:
                model = YOLO(ORIGINAL_MODEL)
                # Exportar a TensorRT (fp16 para mayor velocidad en T4)
                model.export(format="engine", half=True, imgsz=640, device=0)
                print("✅ Conversión completada. Cargando nuevo motor...")
                return YOLO(ENGINE_MODEL)
            except Exception as e:
                print(f"❌ Falló la optimización ({e}). Usando modelo estándar lento.")
                return YOLO(ORIGINAL_MODEL)
        else:
            return YOLO(ORIGINAL_MODEL)
    
    print("⚠️ No se encontró best.pt. Descargando YOLOv8n base...")
    return YOLO("yolov8n.pt")

# --- CONFIGURACIÓN ---
NGROK_AUTH_TOKEN = "38nuec0NauciUj1o70wg29N1xK2_5odXuyQSStGE6tLhuLXdq" # Tu token
PORT = 8000
GLOBAL_STATE = {"progress": 0, "status": "idle", "current_file": "", "eta_seconds": 0}

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

    def get_color_name(self, hsv):
        h, s, v = hsv
        # Filtrar colores muy oscuros o muy claros
        if v < 40: return "NEGRO/OSCURO"
        if s < 30 and v > 180: return "BLANCO"
        
        # Rangos específicos de balonmano (Camisetas vibrantes)
        if (h < 15 or h > 165): return "ROJO"
        if 15 <= h < 35: return "NARANJA/AMARILLO"
        if 35 <= h < 85: return "VERDE"
        if 85 <= h < 140: return "AZUL" # Rango ampliado para azul
        if 140 <= h < 165: return "PÚRPURA/ROSA"
        return "DESCONOCIDO"

    def train(self, crops):
        if len(crops) < 40: return
        data = []
        for crop in crops:
            try:
                h, w, _ = crop.shape
                # Solo el centro del pecho para evitar brazos y fondo
                roi = crop[int(h*0.3):int(h*0.6), int(w*0.3):int(w*0.7)]
                hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
                
                # --- FILTRO ANT-PISTA ---
                # Ignorar colores tipo madera/beige (H: 15-30, S: 20-100)
                mask = cv2.inRange(hsv, (10, 30, 0), (35, 255, 255))
                inverse_mask = cv2.bitwise_not(mask)
                
                # Calcular promedio solo de los píxeles que NO son pista
                avg = cv2.mean(hsv, mask=inverse_mask)[:3]
                if avg[1] > 30: # Asegurarnos de que hay suficiente color (saturación)
                    data.append(avg)
            except: continue
        
        if len(data) < 20:
            print("⚠️ Muestras de color insuficientes tras filtrado de pista.")
            return

        # Usamos 3 clusters: HOME, AWAY y un posible 3ero (Portero, Árbitro o Fondo)
        self.kmeans = KMeans(n_clusters=3, n_init=20)
        self.kmeans.fit(data)
        self.trained = True
        
        centers = self.kmeans.cluster_centers_
        names = [self.get_color_name(c) for c in centers]
        
        # Intentar identificar HOME (Rojo/Azul) y AWAY (contraste)
        # Por ahora, simplemente guardamos los 3 y en el predict decidiremos
        self.team_names = {i: names[i] for i in range(3)}
        
        print(f"\n\033[1;36m🎨 CALIBRACIÓN DE EQUIPOS (3 Clústeres):\033[0m")
        for i in range(3):
            print(f"\033[1;3{i+2}m   - Grupo {i}: {names[i]} (HSV: {centers[i].astype(int)})\033[0m")
        print("")

    def predict(self, crop):
        if not self.trained: return "UNKNOWN"
        try:
            h, w, _ = crop.shape
            roi = crop[int(h*0.3):int(h*0.6), int(w*0.3):int(w*0.7)]
            hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
            
            mask = cv2.inRange(hsv, (10, 30, 0), (35, 255, 255))
            inverse_mask = cv2.bitwise_not(mask)
            avg = cv2.mean(hsv, mask=inverse_mask)[:3]
            
            label = self.kmeans.predict([avg])[0]
            # Mapeo a HOME/AWAY: El grupo 0 y 1 suelen ser los equipos principales. 
            # El grupo 2 suele ser el portero o árbitro.
            if label == 0: return "HOME"
            if label == 1: return "AWAY"
            return "UNKNOWN" # Evitar que el portero/fondo sume como equipo si es clúster 2
        except: return "UNKNOWN"

class HandballProcessor:
    def __init__(self, input_path):
        self.input_path = input_path
        self.model = load_optimized_model()
        self.team_clf = TeamClassifier()
        
        # Estado del juego
        self.in_attack = False
        self.attack_start_time = 0
        self.training_crops = []
        
        # Sistema de Votos para Posesión
        self.possession_votes = Counter()
        self.current_team_votes = Counter()
        self.attack_cooldown = 0 # Para evitar jitter (histeresis)

    def export_segment_async(self, start, end, team, player):
        # Evitar clips extremadamente cortos (menos de 2 segundos de acción real)
        if (end - start) < 3: return 
        threading.Thread(target=self._export_ffmpeg, args=(start, end, team, player)).start()

    def _export_ffmpeg(self, start, end, team, player):
        timestamp = int(start)
        folder = os.path.join(OUTPUT_DIR, team, player)
        os.makedirs(folder, exist_ok=True)

        # 1. Guardamos un archivo temporal primero
        temp_file = os.path.join(folder, f"temp_{int(start)}_{int(end)}.mp4")
        
        # 1. Exportamos el clip re-codificando para máxima compatibilidad con navegadores (H.264)
        cmd = [
            'ffmpeg', '-y', 
            '-ss', f"{start:.2f}", 
            '-to', f"{end:.2f}",
            '-i', self.input_path, 
            '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
            '-c:a', 'aac', '-b:a', '128k',
            '-pix_fmt', 'yuv420p', # Muy importante para compatibilidad QuickTime/Chrome
            '-movflags', '+faststart', # Permite previsualización mientras descarga
            '-loglevel', 'error', 
            temp_file
        ]
        subprocess.run(cmd)

        # 2. Análisis de Acción usando la lógica de la Tesis (LRCN)
        predicted_action = "GOAL" # Por defecto por si falla
        if ACTION_MODEL is not None:
            try:
                frames_list = []
                video_reader = cv2.VideoCapture(temp_file)
                video_frames_count = int(video_reader.get(cv2.CAP_PROP_FRAME_COUNT))
                
                # Extraer 20 frames espaciados uniformemente
                skip_frames_window = max(int(video_frames_count / 20), 1)

                for frame_counter in range(20):
                    video_reader.set(cv2.CAP_PROP_POS_FRAMES, frame_counter * skip_frames_window)
                    success, frame = video_reader.read()
                    if not success: break
                    
                    # Redimensionar a 64x64 y normalizar (Requisito del modelo de la tesis)
                    resized_frame = cv2.resize(frame, (64, 64))
                    normalized_frame = resized_frame / 255.0
                    frames_list.append(normalized_frame)
                    
                video_reader.release()

                # Si logramos extraer los 20 frames, predecimos
                if len(frames_list) == 20:
                    input_sequence = np.expand_dims(np.array(frames_list), axis=0)
                    predictions = ACTION_MODEL.predict(input_sequence, verbose=0)
                    predicted_index = np.argmax(predictions)
                    predicted_action = CLASSES_LIST[predicted_index]
            except Exception as e:
                print(f"Error en predicción de acción: {e}")

        # 3. Renombramos el archivo final incluyendo la acción predicha
        # Ej: "jump-shot_120_135.mp4"
        final_filename = f"{predicted_action}_{int(start)}_{int(end)}.mp4"
        final_file = os.path.join(folder, final_filename)
        
        if os.path.exists(temp_file):
            os.rename(temp_file, final_file)
            
            # Generar Thumbnail (vía FFmpeg) - Ir al segundo 1 para evitar frames negros al inicio
            thumb_filename = final_filename.replace('.mp4', '.jpg')
            thumb_file = os.path.join(folder, thumb_filename)
            subprocess.run([
                'ffmpeg', '-y', '-ss', '1.0', '-i', final_file, 
                '-vframes', '1', '-q:v', '5', '-loglevel', 'error', thumb_file
            ])
            
            file_size = os.path.getsize(final_file) / (1024*1024)
            print(f"🎬 Clip Listo: {team} ({file_size:.1f}MB) | JPG: {'OK' if os.path.exists(thumb_file) else 'FALLÓ'}")

        color_info = ""
        if team == "HOME" and hasattr(self.team_clf, 'team_names'):
            color_info = f" ({self.team_clf.team_names[0]})"
        elif team == "AWAY" and hasattr(self.team_clf, 'team_names'):
            color_info = f" ({self.team_clf.team_names[1]})"

        print(f"🎬 Clip: {team}{color_info} | {player} | Acción: {predicted_action.upper()} ({final_filename})")

    def process(self):
        cap = cv2.VideoCapture(self.input_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # --- FASE 1: CALIBRACIÓN DE COLORES (Detectar primero) ---
        print("\n\033[1;33m🔍 FASE 1: Calibrando colores de equipos...\033[0m")
        GLOBAL_STATE["status"] = "calibrating"
        
        cal_frame = 0
        while cap.isOpened() and not self.team_clf.trained and cal_frame < min(total_frames, 3600): # Máximo 2 min de busca
            ret, frame = cap.read()
            if not ret: break
            
            if cal_frame % 10 == 0: # Muestreo más frecuente
                small = cv2.resize(frame, (640, 384))
                results = self.model.predict(small, verbose=False, imgsz=640, conf=0.20) # Menos confianza para detectar más personas
                if results[0].boxes is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy()
                    cls = results[0].boxes.cls.cpu().numpy()
                    for i, c in enumerate(cls):
                        if int(c) == 0: # Persona
                            b = boxes[i]
                            # Escalar coordenadas
                            x1, y1, x2, y2 = int(b[0]*w/640), int(b[1]*h_orig/384), int(b[2]*w/640), int(b[3]*h_orig/384)
                            crop = frame[max(0,y1):min(y2,h_orig), max(0,x1):min(x2,w)]
                            if crop.size > 0: self.training_crops.append(crop)
                
                if len(self.training_crops) >= 60:
                    self.team_clf.train(self.training_crops)
                    break
            cal_frame += 1

        # Reiniciar video para el proceso real
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        GLOBAL_STATE["status"] = "processing"
        print("\033[1;32m🚀 FASE 2: Iniciando análisis táctico completo...\033[0m")
        
        STRIDE = 2 
        LEAD_IN = 8 
        LEAD_OUT = 3
        COOLDOWN_FRAMES = int(fps * 1.5)
        
        zona_izq = w * 0.25
        zona_der = w * 0.75
        
        frame_idx = 0
        start_time = time.time()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            if frame_idx % STRIDE != 0:
                frame_idx += 1
                continue

            current_time = frame_idx / fps
            small_frame = cv2.resize(frame, (640, 384))
            scale_x = w / 640
            scale_y = h_orig / 384

            # Usar persist=True para tracking
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
                    x1, y1, x2, y2 = int(box[0]*scale_x), int(box[1]*scale_y), int(box[2]*scale_x), int(box[3]*scale_y)
                    
                    is_ball = (c == 2) or (res.names[c] in ['ball', 'sports ball'])
                    is_player = (c == 0) or (res.names[c] in ['person', 'player'])

                    if is_ball:
                        ball_pos = ((x1+x2)/2, (y1+y2)/2)
                    elif is_player and i < len(ids):
                        players.append({'id': ids[i], 'box': [x1, y1, x2, y2]})

            if ball_pos:
                bx, by = ball_pos
                in_danger_zone = (bx < zona_izq) or (bx > zona_der)
                
                closest_p = None
                min_d = w * 0.20 
                
                for p in players:
                    px = (p['box'][0] + p['box'][2]) / 2
                    py = (p['box'][1] + p['box'][3]) / 2
                    pb = p['box']
                    d = np.sqrt((px-bx)**2 + (py-by)**2)
                    is_inside = (pb[0]-20 < bx < pb[2]+20) and (pb[1]-20 < by < pb[3]+20)
                    
                    if d < min_d or is_inside:
                        if is_inside: d = d / 2
                        if d < min_d:
                            min_d = d
                            closest_p = p
                
                if closest_p:
                    self.possession_votes[closest_p['id']] += 1
                    pb = closest_p['box']
                    crop = frame[max(0,pb[1]):min(pb[3],h_orig), max(0,pb[0]):min(pb[2],w)]
                    if crop.size > 0:
                        tm = self.team_clf.predict(crop)
                        self.current_team_votes[tm] += 1

                if in_danger_zone:
                    self.attack_cooldown = 0
                    if not self.in_attack:
                        self.in_attack = True
                        self.attack_start_time = max(0, current_time - LEAD_IN)
                        self.possession_votes.clear()
                        self.current_team_votes.clear()
                        print(f"⚔️ Ataque iniciado en {int(current_time)}s")
                
                elif self.in_attack:
                    self.attack_cooldown += STRIDE
                    if self.attack_cooldown > COOLDOWN_FRAMES:
                        winner_player = f"P-{self.possession_votes.most_common(1)[0][0]}" if self.possession_votes else "Desconocido"
                        
                        # Fallback de equipo: si no hay votos en este ataque, usar el que más haya aparecido en toda la sesión
                        if self.current_team_votes:
                            winner_team = self.current_team_votes.most_common(1)[0][0]
                        else:
                            # Si no sabemos, al menos ponemos el nombre de color de HOME por defecto si existe
                            winner_team = "HOME" if self.team_clf.trained else "Sin_Equipo"

                        self.export_segment_async(
                            self.attack_start_time, 
                            current_time + LEAD_OUT, 
                            winner_team, 
                            winner_player
                        )
                        self.in_attack = False
                        self.attack_cooldown = 0

            frame_idx += 1
            if frame_idx % 60 == 0:
                elapsed = time.time() - start_time
                if elapsed > 0:
                    fps_proc = frame_idx / elapsed
                    eta = int((total_frames - frame_idx) / fps_proc) if fps_proc > 0 else 0
                    prog = (frame_idx / total_frames) * 100
                    GLOBAL_STATE["progress"] = round(prog, 1)
                    GLOBAL_STATE["eta_seconds"] = eta
                    print(f"📊 {prog:.1f}% | Vel: {fps_proc:.1f} FPS | ETA: {eta}s")

        cap.release()
        GLOBAL_STATE["status"] = "completed"
        GLOBAL_STATE["progress"] = 100
        print("✅ Procesamiento finalizado.")

# --- 4. API SERVIDOR ---

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def add_ngrok_header(request, call_next):
    response = await call_next(request)
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response

# --- 5. ENDPOINTS ---
from pydantic import BaseModel
import uuid

class HighlightRequest(BaseModel):
    clips: list[str] # Lista de rutas relativas de los videos

@app.post("/generate-highlight")
def create_highlight(req: HighlightRequest):
    list_file = f"list_{uuid.uuid4().hex}.txt"
    out_file = f"highlight_{uuid.uuid4().hex}.mp4"
    out_path = os.path.join(OUTPUT_DIR, out_file)
    
    # Crear un archivo de texto con la lista de videos para que FFmpeg los una
    with open(list_file, "w") as f:
        for clip in req.clips:
            abs_path = os.path.join(OUTPUT_DIR, clip)
            f.write(f"file '{abs_path}'\n")
    
    # FFmpeg concatena sin recodificar (súper rápido)
    subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', list_file, '-c', 'copy', out_path])
    if os.path.exists(list_file):
        os.remove(list_file)
    
    return {"url": f"/download_highlight/{out_file}?ngrok-skip-browser-warning=true"}

@app.get("/download_highlight/{filename}")
def download_highlight(filename: str):
    return FileResponse(os.path.join(OUTPUT_DIR, filename))

@app.get("/status")
def get_status(): return GLOBAL_STATE

@app.post("/upload-video")
async def upload(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # 🧹 Limpiar clips de sesiones anteriores para evitar mezclas
    print(f"🧹 Limpiando espacio de trabajo para: {file.filename}")
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    path = os.path.join(UPLOAD_DIR, file.filename)
    with open(path, "wb") as f: shutil.copyfileobj(file.file, f)
    GLOBAL_STATE["current_file"] = file.filename
    GLOBAL_STATE["status"] = "processing"
    GLOBAL_STATE["progress"] = 0
    background_tasks.add_task(run_pipeline, path)
    return {"status": "started", "filename": file.filename}

@app.post("/reset")
def reset_workspace():
    if os.path.exists(OUTPUT_DIR): shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    GLOBAL_STATE.update({"status": "idle", "progress": 0, "current_file": None, "eta_seconds": 0})
    return {"message": "Workspace cleared"}

@app.get("/clips")
def list_clips():
    all_clips = []
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for f in files:
            if f.endswith(".mp4"):
                rel_path = rel_path_base = os.path.relpath(os.path.join(root, f), OUTPUT_DIR)
                thumb_path = rel_path.replace('.mp4', '.jpg')
                
                all_clips.append({
                    "filename": f,
                    "path": rel_path.replace(os.sep, '/'),
                    "url": f"download/{rel_path.replace(os.sep, '/')}?ngrok-skip-browser-warning=true",
                    "thumbnailUrl": f"download/{thumb_path.replace(os.sep, '/')}?ngrok-skip-browser-warning=true"
                })
    # Sort clips by filename (which starts with action) or timestamp if we had it
    return all_clips

@app.get("/download/{team}/{player}/{filename}")
def download(team: str, player: str, filename: str):
    path = os.path.join(OUTPUT_DIR, team, player, filename)
    if not os.path.exists(path):
        return JSONResponse({"error": "File not found"}, status_code=404)
    
    media_type = "video/mp4" if filename.endswith(".mp4") else "image/jpeg"
    headers = {
        "Content-Disposition": f"inline; filename={filename}",
        "ngrok-skip-browser-warning": "true",
        "Cache-Control": "public, max-age=3600"
    }
    return FileResponse(path, media_type=media_type, headers=headers)

def run_pipeline(path):
    processor = HandballProcessor(path)
    processor.process()

# --- 7. EJECUCIÓN ---
if __name__ == "__main__":
    # Limpieza agresiva de cualquier proceso previo en el puerto 8000
    try:
        print("🧹 Limpiando procesos antiguos en el puerto 8000...")
        os.system("fuser -k 8000/tcp")
        time.sleep(2) # Dar tiempo a liberar el puerto
    except:
        pass

    # Configurar Ngrok
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    
    # Iniciar túnel
    try:
        # Matar túneles previos
        ngrok.kill()
        
        # Crear nuevo túnel con configuración explícita
        public_url = ngrok.connect(PORT, "http").public_url
        print(f"\n🌍 \033[1;32mURL PÚBLICA (Poner en Frontend): {public_url}\033[0m \n")
    except Exception as e:
        print(f"❌ Error Ngrok: {e}")
        # Intentar conectar sin config extra si falla
        public_url = ngrok.connect(PORT).public_url
        print(f"\n🌍 \033[1;32mURL PÚBLICA (Fallback): {public_url}\033[0m \n")

    # Iniciar servidor Uvicorn (Bloqueante para que Colab no cierre el script)
    print("🚀 Servidor Uvicorn Iniciando...")
    # Iniciar servidor Uvicorn en un hilo separado para evitar conflictos con el loop de Colab
    print("🚀 Servidor Uvicorn Iniciando en segundo plano...")
    
    def run_server():
        # Desactivamos access log para menos ruido, mantenemos log de error
        uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")

    t = threading.Thread(target=run_server)
    t.start()

    # Mantener el script vivo (y la celda de Colab ejecutándose)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("🛑 Deteniendo servidor...")

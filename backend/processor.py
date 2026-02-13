import os
import subprocess
import json
import time
import cv2
import numpy as np
import torch
import threading
from typing import List, Dict
try:
    from ultralytics import YOLO
except ImportError:
    pass

class VideoProcessor:
    """
    High-Performance Handball Video Processor.
    Optimized with TensorRT, Voting-based possession, and Fast seek FFmpeg.
    """
    
    def __init__(self, upload_dir: str, output_dir: str, model_path: str = "best.pt"):
        self.upload_dir = upload_dir
        self.output_dir = output_dir
        self.model_path = model_path
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)
        
        # 1. TENSORRT ACCELERATION
        print(f"🧠 Loading Model: {model_path}")
        self.model = YOLO(model_path)
        
        if torch.cuda.is_available():
            engine_path = model_path.replace('.pt', '.engine')
            if not os.path.exists(engine_path):
                print("🚀 Exporting to TensorRT .engine format (imgsz=640)...")
                # This may take a few minutes but only runs ONCE
                self.model.export(format='engine', imgsz=640, device=0)
            
            print(f"🔥 Using TensorRT Engine: {engine_path}")
            self.model = YOLO(engine_path)
        else:
            print("⚠️ GPU not detected, running on CPU (Slower).")

        self.global_state = {"progress": 0, "status": "idle", "eta_seconds": 0}

    def extract_clip(self, input_video: str, start: float, end: float, team: str, player: str):
        """
        2. FAST SEEK FFMPEG: -ss BEFORE -i
        3. DYNAMIC BUFFER: 8s lead-in, 3s lead-out (handled by caller or here)
        """
        timestamp = int(start)
        folder = os.path.join(self.output_dir, team, player)
        os.makedirs(folder, exist_ok=True)
        filename = f"{timestamp}.mp4"
        output_file = os.path.join(folder, filename)
        
        # Optimized FFmpeg command: fast seeking + stream copy
        cmd = [
            'ffmpeg', '-y', 
            '-ss', str(start), 
            '-to', str(end),
            '-i', input_video, 
            '-c', 'copy', 
            '-loglevel', 'error', 
            output_file
        ]
        
        # 5. MULTITHREADING IN RENDERING: Called in a thread to not block inference
        def run_ffmpeg():
            subprocess.run(cmd)
            print(f"🎬 Clip saved: {team}/{player}/{timestamp}.mp4")

        threading.Thread(target=run_ffmpeg).start()

    def process_match(self, video_path: str):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        stride = 2 # Process every 2nd frame for speed
        self.global_state["status"] = "processing"
        
        # State for attack detection
        in_attack = False
        attack_start_time = 0
        
        # 3. VOTING LOGIC FOR POSSESSION
        attack_votes = {} # {player_id: count}
        
        zona_izq = w * 0.30
        zona_der = w * 0.70
        
        frame_idx = 0
        start_proc_time = time.time()

        print(f"🚀 Starting High-Performance Pipeline (Stride={stride})...")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            if frame_idx % stride != 0:
                frame_idx += 1
                continue

            current_time = frame_idx / fps
            small_frame = cv2.resize(frame, (640, 640))
            
            # 6. MANEJO DE CLASES TESIS: 0=Jugador, 2=Balón
            results = self.model.track(small_frame, persist=True, verbose=False, imgsz=640, conf=0.25, classes=[0, 2])
            res = results[0]
            
            ball_pos = None
            players = []

            if res.boxes is not None:
                boxes = res.boxes.xyxy.cpu().numpy()
                cls = res.boxes.cls.cpu().numpy()
                ids = res.boxes.id.int().cpu().numpy() if res.boxes.id is not None else []
                
                # Scale back to original size
                scale_x = w / 640
                scale_y = h_orig / 640

                for i in range(len(boxes)):
                    c = int(cls[i])
                    box = boxes[i]
                    x_mid = (box[0] + box[2]) / 2 * scale_x
                    y_mid = (box[1] + box[3]) / 2 * scale_y

                    if c == 2: # Ball
                        ball_pos = (x_mid, y_mid)
                    elif c == 0 and i < len(ids): # Player
                        players.append({'id': ids[i], 'pos': (x_mid, y_mid)})

            # Analysis Logic
            if ball_pos:
                bx, _ = ball_pos
                in_danger = (bx < zona_izq) or (bx > zona_der)
                
                # Assign "vote" to nearest player
                closest_player_id = None
                min_dist = 150 # pixels
                for p in players:
                    dist = np.sqrt((p['pos'][0] - ball_pos[0])**2 + (p['pos'][1] - ball_pos[1])**2)
                    if dist < min_dist:
                        min_dist = dist
                        closest_player_id = p['id']
                
                if in_danger:
                    if not in_attack:
                        in_attack = True
                        attack_start_time = current_time
                        attack_votes = {}
                        print(f"⚔️ Attack start at {current_time:.1f}s")
                    
                    if closest_player_id is not None:
                        attack_votes[closest_player_id] = attack_votes.get(closest_player_id, 0) + 1

                elif in_attack and not in_danger:
                    # Attack ended
                    # 3. WINNER BY VOTES
                    winner_id = "UNK"
                    if attack_votes:
                        winner_id = max(attack_votes, key=attack_votes.get)
                        print(f"🗳️ Possession winner: P-{winner_id} (Votes: {attack_votes[winner_id]})")
                    
                    # 4. BUFFER DINÁMICO: 8s lead-in, 3s lead-out
                    clip_start = max(0, attack_start_time - 8)
                    clip_end = current_time + 3
                    
                    self.extract_clip(video_path, clip_start, clip_end, "OFFENSE", f"P-{winner_id}")
                    in_attack = False

            # Update progress
            frame_idx += 1
            if frame_idx % 50 == 0:
                self.global_state["progress"] = (frame_idx / total_frames) * 100
                elapsed = time.time() - start_proc_time
                fps_actual = frame_idx / elapsed
                self.global_state["eta_seconds"] = int((total_frames - frame_idx) / fps_actual)

        cap.release()
        self.global_state["status"] = "completed"
        self.global_state["progress"] = 100
        print("✅ Analysis Complete.")

    def _timestamp_to_seconds(self, ts: str) -> int:
        parts = ts.split(':')
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])

    def _seconds_to_timestamp(self, seconds: int) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02d}:{m:02d}:{s:02d}"

if __name__ == "__main__":
    processor = VideoProcessor("uploads", "output_clips")
    print("VideoProcessor ready.")

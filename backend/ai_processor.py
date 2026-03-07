import json
import os
import subprocess
import time
import uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from typing import List

import cv2
import numpy as np
from sklearn.cluster import KMeans
from ultralytics import YOLO


def _load_model(model_path: str) -> YOLO:
    """Load local model if available, fallback to YOLOv8n."""
    if os.path.exists(model_path):
        return YOLO(model_path)
    return YOLO("yolov8n.pt")


class TeamClassifier:
    def __init__(self) -> None:
        self.kmeans = None
        self.trained = False
        self.team_names = {}

    def get_color_name(self, hsv: np.ndarray) -> str:
        h, s, v = hsv
        if v < 40:
            return "NEGRO/OSCURO"
        if s < 30 and v > 180:
            return "BLANCO"
        if h < 15 or h > 165:
            return "ROJO"
        if 15 <= h < 35:
            return "NARANJA/AMARILLO"
        if 35 <= h < 85:
            return "VERDE"
        if 85 <= h < 140:
            return "AZUL"
        if 140 <= h < 165:
            return "PÚRPURA/ROSA"
        return "DESCONOCIDO"

    def train(self, crops: List[np.ndarray]) -> None:
        if len(crops) < 40:
            return
        data = []
        for crop in crops:
            try:
                h, w, _ = crop.shape
                roi = crop[int(h * 0.3):int(h * 0.6), int(w * 0.3):int(w * 0.7)]
                hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
                mask = cv2.inRange(hsv, (10, 30, 0), (35, 255, 255))
                inverse_mask = cv2.bitwise_not(mask)
                avg = cv2.mean(hsv, mask=inverse_mask)[:3]
                if avg[1] > 30:
                    data.append(avg)
            except Exception:
                continue

        if len(data) < 20:
            return

        self.kmeans = KMeans(n_clusters=3, n_init=20)
        self.kmeans.fit(data)
        self.trained = True
        centers = self.kmeans.cluster_centers_
        names = [self.get_color_name(c) for c in centers]
        self.team_names = {i: names[i] for i in range(3)}

    def predict(self, crop: np.ndarray) -> str:
        if not self.trained or self.kmeans is None:
            return "UNKNOWN"
        try:
            h, w, _ = crop.shape
            roi = crop[int(h * 0.3):int(h * 0.6), int(w * 0.3):int(w * 0.7)]
            hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv, (10, 30, 0), (35, 255, 255))
            inverse_mask = cv2.bitwise_not(mask)
            avg = cv2.mean(hsv, mask=inverse_mask)[:3]
            label = self.kmeans.predict([avg])[0]
            return self.team_names.get(label, "DESCONOCIDO")
        except Exception:
            return "DESCONOCIDO"


class HandballProcessor:
    """
    IA engine only:
    - input_path: local video file
    - output_dir: destination for clips + metadata json files
    """

    def __init__(self, input_path: str, output_dir: str, model_path: str = "best.pt") -> None:
        self.input_path = input_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        self.model = _load_model(model_path)
        self.team_clf = TeamClassifier()

        self.in_attack = False
        self.attack_start_time = 0.0
        self.training_crops: List[np.ndarray] = []
        self.possession_votes = Counter()
        self.current_team_votes = Counter()
        self.attack_cooldown = 0
        self._futures = []
        self.export_pool = ThreadPoolExecutor(max_workers=2)

    def _save_clip_metadata(
        self,
        clip_id: str,
        filename: str,
        start_time: float,
        end_time: float,
        team: str,
        player: str,
        action: str,
    ) -> None:
        metadata = {
            "id": clip_id,
            "filename": filename,
            "path": filename,
            "start_seconds": round(start_time, 2),
            "end_seconds": round(end_time, 2),
            "duration_seconds": round(end_time - start_time, 2),
            "team": team,
            "player": player,
            "action": action,
        }
        json_path = os.path.join(self.output_dir, f"{clip_id}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

    def _export_ffmpeg(self, start: float, end: float, team: str, player: str) -> None:
        if end - start < 3:
            return

        clip_id = f"clip_{uuid.uuid4().hex[:6]}"
        final_filename = f"{clip_id}.mp4"
        final_file = os.path.join(self.output_dir, final_filename)

        cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            f"{start:.2f}",
            "-to",
            f"{end:.2f}",
            "-i",
            self.input_path,
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "28",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            "-loglevel",
            "error",
            final_file,
        ]
        subprocess.run(cmd, check=False)

        if os.path.exists(final_file):
            self._save_clip_metadata(
                clip_id=clip_id,
                filename=final_filename,
                start_time=start,
                end_time=end,
                team=team or "Desconocido",
                player=player or "Desconocido",
                action="Ataque Detectado",
            )

    def _export_segment_async(self, start: float, end: float, team: str, player: str) -> None:
        self._futures.append(self.export_pool.submit(self._export_ffmpeg, start, end, team, player))

    def process(self) -> None:
        cap = cv2.VideoCapture(self.input_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        cal_frame = 0
        while cap.isOpened() and not self.team_clf.trained and cal_frame < min(total_frames, 3600):
            ret, frame = cap.read()
            if not ret:
                break
            if cal_frame % 10 == 0:
                small = cv2.resize(frame, (640, 384))
                results = self.model.predict(small, verbose=False, imgsz=640, conf=0.20)
                if results[0].boxes is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy()
                    cls = results[0].boxes.cls.cpu().numpy()
                    for i, c in enumerate(cls):
                        if int(c) == 0:
                            b = boxes[i]
                            x1, y1, x2, y2 = int(b[0] * w / 640), int(b[1] * h_orig / 384), int(b[2] * w / 640), int(b[3] * h_orig / 384)
                            crop = frame[max(0, y1):min(y2, h_orig), max(0, x1):min(x2, w)]
                            if crop.size > 0:
                                self.training_crops.append(crop)
                if len(self.training_crops) >= 60:
                    self.team_clf.train(self.training_crops)
                    break
            cal_frame += 1

        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        stride = 2
        lead_in = 8
        lead_out = 3
        cooldown_frames = int(fps * 1.5)
        zona_izq = w * 0.25
        zona_der = w * 0.75

        frame_idx = 0
        _ = time.time()

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if frame_idx % stride != 0:
                frame_idx += 1
                continue

            current_time = frame_idx / fps
            small_frame = cv2.resize(frame, (640, 384))
            scale_x = w / 640
            scale_y = h_orig / 384

            results = self.model.track(
                small_frame,
                persist=True,
                verbose=False,
                imgsz=640,
                tracker="bytetrack.yaml",
                conf=0.25,
            )
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
                    x1, y1, x2, y2 = int(box[0] * scale_x), int(box[1] * scale_y), int(box[2] * scale_x), int(box[3] * scale_y)
                    is_ball = (c == 2) or (res.names[c] in ["ball", "sports ball"])
                    is_player = (c == 0) or (res.names[c] in ["person", "player"])
                    if is_ball:
                        ball_pos = ((x1 + x2) / 2, (y1 + y2) / 2)
                    elif is_player and i < len(ids):
                        players.append({"id": ids[i], "box": [x1, y1, x2, y2]})

            if ball_pos:
                bx, by = ball_pos
                in_danger_zone = (bx < zona_izq) or (bx > zona_der)
                closest_p = None
                min_d = w * 0.20

                for p in players:
                    px = (p["box"][0] + p["box"][2]) / 2
                    py = (p["box"][1] + p["box"][3]) / 2
                    pb = p["box"]
                    d = np.sqrt((px - bx) ** 2 + (py - by) ** 2)
                    is_inside = (pb[0] - 20 < bx < pb[2] + 20) and (pb[1] - 20 < by < pb[3] + 20)
                    if d < min_d or is_inside:
                        if is_inside:
                            d = d / 2
                        if d < min_d:
                            min_d = d
                            closest_p = p

                if closest_p:
                    self.possession_votes[closest_p["id"]] += 1
                    pb = closest_p["box"]
                    crop = frame[max(0, pb[1]):min(pb[3], h_orig), max(0, pb[0]):min(pb[2], w)]
                    if crop.size > 0:
                        tm = self.team_clf.predict(crop)
                        self.current_team_votes[tm] += 1

                if in_danger_zone:
                    self.attack_cooldown = 0
                    if not self.in_attack:
                        self.in_attack = True
                        self.attack_start_time = max(0, current_time - lead_in)
                        self.possession_votes.clear()
                        self.current_team_votes.clear()
                elif self.in_attack:
                    self.attack_cooldown += stride
                    if self.attack_cooldown > cooldown_frames:
                        winner_player = f"P-{self.possession_votes.most_common(1)[0][0]}" if self.possession_votes else "Desconocido"
                        if self.current_team_votes:
                            winner_team = self.current_team_votes.most_common(1)[0][0]
                        else:
                            winner_team = "HOME" if self.team_clf.trained else "Sin_Equipo"
                        self._export_segment_async(self.attack_start_time, current_time + lead_out, winner_team, winner_player)
                        self.in_attack = False
                        self.attack_cooldown = 0

            frame_idx += 1

        cap.release()
        for future in self._futures:
            future.result()
        self.export_pool.shutdown(wait=True)

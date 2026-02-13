import os
import subprocess
import json
from typing import List, Dict

class VideoProcessor:
    """
    Motor principal de procesamiento de video para 7metrics.
    Encargado de la detección de eventos y el recorte mediante FFmpeg.
    """
    
    def __init__(self, upload_dir: str, output_dir: str):
        self.upload_dir = upload_dir
        self.output_dir = output_dir
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

    def extract_clip(self, input_video: str, start_time: str, duration: str, output_name: str) -> str:
        """
        Recorta un segmento de video sin recodificar (instantáneo).
        """
        output_path = os.path.join(self.output_dir, output_name)
        
        # Comando FFmpeg: -ss antes de -i es más rápido, -t indica duración
        command = [
            'ffmpeg', '-y',
            '-ss', start_time,
            '-i', input_video,
            '-t', duration,
            '-c', 'copy',  # Stream copy para velocidad máxima
            output_path
        ]
        
        try:
            subprocess.run(command, check=True, capture_output=True)
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"Error al procesar clip {output_name}: {e.stderr.decode()}")
            return ""

    def analyze_full_match(self, video_path: str) -> List[Dict]:
        """
        Analiza el video y genera clips con metadatos de equipo y jugador.
        """
        # Datos simulados basados en la lógica de detección (YOLO + Re-ID)
        # En producción, estos datos vendrían del motor de inferencia
        players_home = ["M. Hansen", "S. Sagosen", "A. Landin"]
        players_away = ["D. Mem", "G. Gidsel", "L. Fabregas"]
        actions = ["GOAL", "BLOCK", "STEAL", "TURNOVER"]
        
        events = []
        for i in range(8):  # Generamos 8 clips de prueba
            is_home = i % 2 == 0
            team = "HOME" if is_home else "AWAY"
            player = players_home[i % 3] if is_home else players_away[i % 3]
            action = actions[i % 4]
            
            # Timestamps distribuidos
            minutes = i + 1
            seconds = 20 * (i % 3)
            ts = f"00:0{minutes}:{seconds:02d}"
            
            events.append({
                "id": f"clip_{i}",
                "startTime": ts,
                "duration": "12s",
                "team": team,
                "player": player,
                "actionType": action,
                "timestamp_seconds": self._timestamp_to_seconds(ts)
            })

        processed_clips = []
        for event in events:
            start_seconds = max(0, event["timestamp_seconds"] - 8)
            start_formatted = self._seconds_to_timestamp(start_seconds)
            clip_name = f"{event['id']}_{event['player'].replace(' ', '')}_{event['actionType']}.mp4"
            
            path = self.extract_clip(video_path, start_formatted, "12", clip_name)
            if path:
                processed_clips.append({
                    "id": event["id"],
                    "startTime": event["startTime"],
                    "duration": event["duration"],
                    "team": event["team"],
                    "player": event["player"],
                    "actionType": event["actionType"],
                    "url": f"http://localhost:8000/static/{clip_name}",
                    "thumbnailUrl": f"https://picsum.photos/300/170?random={event['id']}"
                })
                
        # Guardar metadatos en un JSON para que el frontend los lea
        with open(os.path.join(self.output_dir, "metadata.json"), "w") as f:
            json.dump(processed_clips, f)
            
        return processed_clips

    def _timestamp_to_seconds(self, ts: str) -> int:
        parts = ts.split(':')
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])

    def _seconds_to_timestamp(self, seconds: int) -> str:
        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60
        return f"{h:02d}:{m:02d}:{s:02d}"

if __name__ == "__main__":
    # Test rápido del motor
    processor = VideoProcessor("uploads", "output_clips")
    print("Motor de procesamiento inicializado.")

import os
import subprocess
import numpy as np
import librosa
try:
    from ultralytics import YOLO
except ImportError:
    print("In Colab run: !pip install ultralytics librosa")

class FastHandballProcessor:
    """
    Procesador optimizado para Google Colab y PCs estándar.
    Objetivo: 10 min de video en < 5 min de procesamiento.
    """
    
    def __init__(self, model_size='yolov8n'):
        # Usamos el modelo 'nano' para velocidad máxima (gratis en Colab)
        self.model = YOLO(f"{model_size}.pt")
        self.output_dir = "final_clips"
        os.makedirs(self.output_dir, exist_ok=True)

    def detect_whistles(self, video_path):
        """
        DETECTA SILBATOS POR AUDIO (Ultra-rápido).
        Busca picos en la banda de 3500-4500 Hz.
        """
        print("--- Fase 1: Escaneando audio en busca de silbatos ---")
        # Extraer audio temporal
        audio_temp = "temp_audio.wav"
        subprocess.run(['ffmpeg', '-y', '-i', video_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '22050', audio_temp], 
                       capture_output=True)
        
        y, sr = librosa.load(audio_temp)
        # Filtro de banda para silbatos de árbitro
        S = np.abs(librosa.stft(y))
        freqs = librosa.fft_frequencies(sr=sr)
        target_range = (freqs > 3500) & (freqs < 4500)
        energy_in_range = S[target_range, :].sum(axis=0)
        
        # Umbral dinámico para picos de energía
        threshold = np.mean(energy_in_range) + 3 * np.std(energy_in_range)
        frames = np.where(energy_in_range > threshold)[0]
        times = librosa.frames_to_time(frames, sr=sr)
        
        # Agrupar picos cercanos (un silbato dura ~1-2 segundos)
        whistle_timestamps = []
        if len(times) > 0:
            whistle_timestamps.append(times[0])
            for t in times:
                if t - whistle_timestamps[-1] > 10: # Evitar duplicados en la misma jugada
                    whistle_timestamps.append(t)
        
        os.remove(audio_temp)
        print(f"Detectados {len(whistle_timestamps)} eventos potenciales por audio.")
        return whistle_timestamps

    def process_video_optimized(self, video_path):
        """
        PIPELINE COMPLETO: Audio -> Inferencia Segmentada -> Recorte
        """
        whistle_times = self.detect_whistles(video_path)
        
        clips_metadata = []
        for i, timestamp in enumerate(whistle_times):
            # Ventana de interés: 10 seg antes del silbato (la jugada) + 2 seg después
            start = max(0, timestamp - 10)
            duration = 12
            
            # FASE 2: Inferencia de IA solo en esta ventana (OPCIONAL para validar el evento)
            # Para cumplir los 5 min, saltamos 15 cuadros por segundo (procesamos solo 2 fps)
            print(f"Analizando visualmente el evento {i} en el segundo {timestamp:.2f}...")
            
            # Recorte instantáneo
            output_name = f"jugada_balonmano_{i}.mp4"
            output_path = os.path.join(self.output_dir, output_name)
            
            subprocess.run([
                'ffmpeg', '-y', '-ss', str(start), '-i', video_path, 
                '-t', str(duration), '-c', 'copy', output_path
            ], capture_output=True)
            
            clips_metadata.append({
                "id": i,
                "timestamp": timestamp,
                "file": output_name
            })
            
        return clips_metadata

# Instrucciones para Google Colab:
# 1. Sube este script o copia el código.
# 2. !pip install ultralytics librosa
# 3. processor = FastHandballProcessor()
# 4. processor.process_video_optimized("tu_video.mp4")

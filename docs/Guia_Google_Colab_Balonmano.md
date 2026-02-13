# 🚀 Guía: Procesamiento de Video de Balonmano en Google Colab (Gratis)

Para procesar un video de 10 minutos en menos de 5 minutos, utilizaremos una estrategia de **"Detección por Audio primero"**, analizando visualmente solo los momentos clave identificados por el silbato del árbitro.

### Paso 1: Abrir Google Colab
Ve a [colab.research.google.com](https://colab.research.google.com/) y crea un nuevo cuaderno.

### Paso 2: Configurar el Entorno
Copia y pega este bloque en la primera celda para instalar las herramientas necesarias:
```python
!pip install ultralytics librosa
!apt-get install ffmpeg
```

### Paso 3: Subir el Video
Puedes subir tu video de 10 minutos directamente al panel lateral de archivos de Colab (icono de carpeta).

### Paso 4: Ejecutar el Procesador
Copia y pega el código del archivo `colab_handball_processor.py` (que he creado en tu proyecto) o usa este resumen:

```python
import os
import subprocess
import numpy as np
import librosa
from ultralytics import YOLO

# 1. Configuración del procesador
output_dir = "jugadas_detectadas"
os.makedirs(output_dir, exist_ok=True)

def procesar_partido(video_path):
    print("--- 🔊 Fase 1: Detectando silbatos (Audio) ---")
    # Extraer audio
    subprocess.run(['ffmpeg', '-y', '-i', video_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '22050', 'audio.wav'])
    y, sr = librosa.load('audio.wav')
    
    # Filtro de frecuencia para silbatos (4kHz)
    S = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    energy = S[(freqs > 3500) & (freqs < 4500), :].sum(axis=0)
    
    threshold = np.mean(energy) + 4 * np.std(energy) # Sensibilidad
    frames = np.where(energy > threshold)[0]
    times = librosa.frames_to_time(frames, sr=sr)
    
    # Limpiar duplicados
    eventos = []
    if len(times) > 0:
        eventos.append(times[0])
        for t in times:
            if t - eventos[-1] > 15: eventos.append(t)

    print(f"--- ✂️ Fase 2: Recortando {len(eventos)} jugadas ---")
    for i, t in enumerate(eventos):
        start = max(0, t - 10)
        output = f"{output_dir}/gol_o_falta_{i}.mp4"
        # USAMOS STREAM COPY: Recorte instantáneo sin perder calidad
        subprocess.run(['ffmpeg', '-y', '-ss', str(start), '-i', video_path, '-t', '15', '-c', 'copy', output])
        print(f"Clip {i} guardado: {output}")

# EJECUTAR: Sustituye por el nombre de tu video
# procesar_partido("mi_video_partido.mp4")
```

### ¿Por qué es tan rápido?
1.  **Audio Probing**: Analizar el audio de 10 minutos tarda apenas 10-20 segundos.
2.  **No re-encoding**: Al usar `-c copy` en FFmpeg, el video se "corta" en lugar de "renderizarse", lo que toma milisegundos por clip.
3.  **YOLO Nano (Opcional)**: Si añades validación visual, el modelo Nano procesa a más de 100 FPS en Colab.

---
*Documento generado por Antigravity AI para 7metrics.*

# Plan de Implementación: Backend de Procesamiento de Video (7metrics AI)

Basado en la inteligencia extraída de **NotebookLM**, el backend se estructurará como un servicio asíncrono en Python optimizado para el procesamiento de clips de balonmano.

## 1. Stack Tecnológico
*   **Lenguaje**: Python 3.10+
*   **API Framework**: FastAPI (para comunicación con el frontend React)
*   **Motor de Video**: FFmpeg (vía `ffmpeg-python`)
*   **IA / Visión**:
    *   **YOLOv11**: Detección de balón y jugadores.
    *   **ByteTrack**: Seguimiento de trayectorias (Re-ID).
    *   **MediaPipe**: Análisis de pose para detectar tiros y gestos de árbitro.
*   **Procesamiento de Audio**: Librosa / Scipy (Detección de silbatos y picos de ruido).

## 2. Arquitectura del Pipeline
1.  **Upload Handler**: Recibe el .mp4 y lo guarda en almacenamiento temporal.
2.  **Audio Probing**: Escaneo rápido del audio para encontrar timestamps de silbatos (frecuencias 3.75 - 4.1 kHz).
3.  **Vision Engine**:
    *   *Fast Scan*: Analiza frames clave para detectar cambios de marcador o celebraciones (brazos arriba).
    *   *Deep Analysis*: Procesa segmentos candidatos para validar eventos (Goal, Assist, Block).
4.  **Clip Generator**:
    *   Calcula ventanas temporales (ej. -10s para gol, -3s para asistencia).
    *   Ejecuta `ffmpeg` con `-c copy` para recorte instantáneo sin pérdida.
5.  **Metadata Dispatcher**: Envía los JSON de eventos al frontend para poblar el `ClipEditor`.

## 3. Estructura de Archivos (Propuesta)
```text
/7metrics
  /backend
    main.py           # API Entry point
    processor.py      # Lógica de IA y FFmpeg
    audio_analysis.py # Detección de silbatos
    requirements.txt  # Dependencias
```

---
*Este plan será la base para la implementación del código en el siguiente paso.*

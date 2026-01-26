# Antigravity Sports API

Backend para el análisis de vídeo de balonmano.

## Arquitectura

El backend actúa como **orquestador** entre el Frontend y el Worker de Análisis (Google Colab).

### Flujo de Trabajo
1. **Frontend** sube el vídeo (`POST /upload`).
2. **Backend** guarda el vídeo y devuelve un `video_id`.
3. **Frontend** solicita inicio de análisis (`POST /stats/start` o `/clipper/start`).
4. **Backend** delega el trabajo al **Worker (Colab)** enviando la URL pública del vídeo.
   - Si el Worker no está disponible, el backend ejecuta una simulación (Mock Mode).
5. **Worker** descarga el vídeo desde el Backend (`GET /videos/{video_id}/raw`).
6. **Worker** procesa el vídeo y envía actualizaciones periódicas al Backend (`POST /callback/colab`).
7. **Frontend** consulta el estado (`GET /jobs/{job_id}`) y finalmente obtiene el reporte.

## Configuración

Crear un archivo `.env.local` en la raíz de `backend/`:

```env
# URL del Worker de Colab (Obtener de la celda de ngrok en Colab)
COLAB_WORKER_URL=http://xxxx-xx-xx-xx-xx.ngrok-free.app

# URL Pública de este Backend (Para que Colab pueda llamar de vuelta)
# Usar ngrok para exponer localhost:8000
PUBLIC_BASE_URL=https://euphoniously-unquilted-nichole.ngrok-free.dev

# Límites
MAX_UPLOAD_BYTES=2147483648  # 2GB
```

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

2. Iniciar servidor:
   ```bash
   python -m app.main
   ```

3. Exponer servidor con ngrok (necesario para integración con Colab):
   ```bash
   ngrok http 8000
   ```
   Copia la URL HTTPS generada en `PUBLIC_BASE_URL` si cambia.

## API Documentation

- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Endpoints Clave

- `POST /api/v1/upload`: Subir vídeo.
- `POST /api/v1/stats/start`: Iniciar análisis estadístico.
- `POST /api/v1/clipper/start`: Iniciar generación de clips.
- `GET /api/v1/videos/{video_id}/raw`: Descargar vídeo (usado por worker).
- `POST /api/v1/callback/colab`: Recibir actualizaciones del worker.

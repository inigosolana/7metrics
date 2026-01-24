# Antigravity Sports API Backend

Backend para el análisis de vídeo de balonmano. Este servicio coordina la subida de vídeos, el procesamiento asíncrono en Google Colab y la entrega de resultados.

## Requisitos

- Python 3.9+
- Pip

## Instalación

```bash
cd backend
pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --reload --port 8000
```

## Variables de Entorno

Puedes configurar las siguientes variables en un archivo `.env` en la raíz de la carpeta `backend`:

- `COLAB_WORKER_URL`: URL del worker en Colab (ej: `https://xxxx.ngrok-free.app`). Si no se define, el backend entrará en **Modo Mock**.
- `COLAB_API_KEY`: Key opcional para autenticar contra el worker.
- `PUBLIC_BASE_URL`: URL base pública de este backend (necesaria para el callback de Colab).
- `MAX_UPLOAD_BYTES`: Límite de subida (default 2GB).
- `ALLOWED_ORIGINS`: Lista de orígenes para CORS.

## Flujo de Trabajo

1.  **Subida**: `POST /api/v1/upload` -> Obtienes `video_id`.
2.  **Inicio**: `POST /api/v1/clipper/start` o `/stats/start` con el `video_id`.
3.  **Procesamiento**: El backend llama al Colab Worker.
4.  **Polling**: Consulta el estado en `GET /api/v1/clipper/jobs/{job_id}`.
5.  **Resultados**:
    -   `GET /api/v1/stats/report/{job_id}` para el JSON de estadísticas.
    -   `GET /api/v1/clipper/download/zip/{job_id}` para todos los clips.

## Integración con Colab (Callback)

El worker de Colab debe notificar el progreso al endpoint interno:
`POST /api/v1/callback/colab`

Payload esperado:
```json
{
  "job_id": "...",
  "status": "PROCESSING|COMPLETED|ERROR",
  "progress_percentage": 45,
  "current_step": "Tracking players...",
  "result": { ... } // Requerido si status es COMPLETED
}
```

## Estructura de Datos (Locales)

- `data/uploads/`: Almacena los vídeos crudos.
- `data/jobs/`: Almacena metadatos y resultados (JSON) de cada job.
- `data/exports/`: Almacena los clips recortados y archivos ZIP.

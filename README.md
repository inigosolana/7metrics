<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rxDzQjutYnmmfyOSECOCvzwfLRo_kq-o

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Backend (FastAPI) y procesamiento GPU (Kaggle)

- En `backend/`: `pip install -r requirements.txt` y `uvicorn main:app --reload --port 8000`.
- Para usar **procesamiento en GPU vía Kaggle** (endpoints `/api/process-gpu` y `/api/webhook/kaggle-done`), configura las variables de entorno. Puedes copiar `backend/.env.example` a `backend/.env` y rellenar:

| Variable | Descripción |
|----------|-------------|
| `KAGGLE_USERNAME` | Usuario de Kaggle (igual que en [Account → API](https://www.kaggle.com/settings)). |
| `KAGGLE_KEY` | API Key de Kaggle (Create New API Token en la misma página). |
| `WEBHOOK_BASE_URL` | URL pública del backend (ej. `https://xxx.ngrok-free.app`) para que Kaggle pueda descargar el vídeo y notificar al webhook. |

La librería `kaggle` usa por defecto `~/.kaggle/kaggle.json` o las variables `KAGGLE_USERNAME` y `KAGGLE_KEY`. En Windows puedes definir las variables en el sistema o en un `.env` cargado por tu entorno (por ejemplo con `python-dotenv` en el backend si lo añades).

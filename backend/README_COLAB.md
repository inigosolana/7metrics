# 🚀 Despliegue Rápido en Google Colab

Como la automatización falló por límites de cuota, aquí tienes el plan B infalible:

1. **Abre Colab**: [Enlace al Notebook](https://colab.research.google.com/drive/17Gva5-GLx9HQ9YSIoWosRF4b8c3_nYJM)
2. **Copia el Script**: Abre `backend/colab_cloud_worker.py` en tu PC y COPIA todo.
3. **Pega y Ejecuta**: Pégalo en una celda de Colab y dale al Play ▶️.
4. **Copia la URL**: Al final saldrá algo como `URL PUBLICA: https://xyz.ngrok-free.app`.
5. **Configura**: Abre `.env.local` en tu proyecto y pega esa URL en `VITE_COLAB_URL`.

¡Listo! Tu backend estará procesando vídeos en la nube gratis.

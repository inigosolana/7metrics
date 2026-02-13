import os
import webbrowser
import time

ENV_FILE = ".env.local"
COLAB_URL = "https://colab.research.google.com/drive/17Gva5-GLx9HQ9YSIoWosRF4b8c3_nYJM"

def read_env():
    if not os.path.exists(ENV_FILE): return {}
    env = {}
    with open(ENV_FILE, "r") as f:
        for line in f:
            if "=" in line:
                try:
                    k, v = line.strip().split("=", 1)
                    env[k] = v
                except: pass
    return env

def update_env(key, value):
    lines = []
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r") as f:
            lines = f.readlines()
    
    found = False
    with open(ENV_FILE, "w") as f:
        for line in lines:
            if line.startswith(f"{key}="):
                f.write(f"{key}={value}\n")
                found = True
            else:
                f.write(line)
        if not found:
            f.write(f"\n{key}={value}\n")

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print("\n\n")
    print("   ###############################################")
    print("   ###   ASISTENTE DE CONFIGURACIÓN AUTOMÁTICA   ###")
    print("   ###############################################")
    print("\n")
    
    print("   ⚠️  DETECTADO: El backend en la nube (Colab) no está conectado.")
    print("   🔧  Iniciando protocolo de conexión manual asistida...")
    print("\n")
    
    print("   1️⃣  Abriendo Google Colab en tu navegador...")
    webbrowser.open(COLAB_URL)
    time.sleep(2)
    
    print("\n   2️⃣  Instrucción: En Colab, busca la celda de código y pulsa el botón ▶️ (Play).")
    print("       (Si no hay código, pega el contenido de 'backend/colab_cloud_worker.py')")
    print("\n   3️⃣  Espera unos segundos hasta que aparezca 'URL PUBLICA'.")
    
    while True:
        url = input("\n   👉  COPIA Y PEGA ESA URL AQUÍ: ").strip()
        if "ngrok" in url or "http" in url:
            print("\n   💾  Guardando configuración...")
            update_env("VITE_COLAB_URL", url)
            print("   ✅  ¡Conectado! El frontend detectará el cambio automáticamente.")
            print("\n   🚀  Puedes cerrar esta ventana y usar la aplicación.")
            input("\n   Presiona ENTER para salir...")
            break
        else:
            print("   ❌  Eso no parece una URL válida. Debe empezar por http/https.")

if __name__ == "__main__":
    main()

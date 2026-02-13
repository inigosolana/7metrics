# Manual de Lógica de Negocio: IA para Analítica de Balonmano

Este manual define las especificaciones técnicas y lógicas para el sistema de IA de **7metrics**, enfocado en la extracción automatizada de estadísticas en partidos de balonmano profesional.

---

## 1. Mapeo de Coordenadas: Del Píxel a la Pista (40x20m)

Para traducir la visión de cámara a datos métricos accionables, el sistema emplea una **Transformación de Homografía**.

### Metodología de Mapeo
1.  **Calibración Automática**: La IA detecta las primitivas de la pista (líneas de banda, área de 6m, línea de 9m y centro). Se requieren al menos 4 puntos de control (ej. esquinas del área de portería) para establecer la relación plana.
2.  **Matriz de Homografía ($H$)**: Se calcula una matriz $3 \times 3$ que permite proyectar cualquier punto $(x, y)$ de la imagen al plano $Z=0$ de la pista $(X, Y)$ en metros.
3.  **Corrección de Perspectiva**: Dado que los jugadores tienen altura, el punto de contacto con el suelo (los pies o el centro de la base del 'bounding box') es el que se mapea para evitar errores de paralaje.
4.  **Normalización**: Todas las coordenadas se normalizan a un sistema estándar de 4000x2000 unidades (1 unidad = 1 cm) para facilitar cálculos de distancia y velocidad.

---

## 2. Identificación Unívoca (Re-ID) y Gestión de Oclusiones

El mayor reto reside en la zona de 6 metros, donde la densidad de jugadores produce oclusiones masivas.

### Estrategias de Tracking y Re-ID
*   **Tracking-by-Detection**: Uso de YOLOv8 para detección de objetos acoplado con **BoT-SORT** para el seguimiento de trayectorias.
*   **Embeddings de Apariencia**: Cada jugador tiene asignado un vector de características (color de piel, zapatillas, estilo de pelo) extraído mediante una CNN ligera. Esto permite recuperar el ID si el jugador desaparece tras un bloque defensivo.
*   **Detección de Dorsales (OCR Experto)**: En momentos de duda o tras una oclusión larga, el sistema prioriza la búsqueda del número en la camiseta para re-vincular la trayectoria con el ID correcto.
*   **Cinemática Predictiva (Filtro de Kalman)**: Se estima la trayectoria probable de un jugador ocluido basándose en su velocidad y dirección previa. Si al reaparecer el 'embedding' coincide, la trayectoria se fusiona.

---

## 3. Lógica de Eventos: Definiciones Técnicas

La IA registra eventos basándose en la interacción espacial y temporal entre jugadores y balón.

### A. Gol
*   **Criterio Espacial**: El centro del balón cruza completamente el plano vertical de la línea de portería.
*   **Criterio Lógico**: 
    1.  Detección de 'Lanzamiento' previo.
    2.  Trayectoria del balón hacia el interior del marco.
    3.  Cambio de estado en el marcador o detección de celebración (gestos de brazos en alto).

### B. Asistencia
*   **Criterio Temporal**: Pase realizado al goleador en un intervalo máximo de 3 segundos antes del gol.
*   **Criterio Lógico**: El receptor del pase no debe realizar más de 3 pasos o perder la posesión antes del lanzamiento. Se excluyen pases tras falta técnica si hay un reinicio lento.

### C. Bloqueo (Shot Block)
*   **Criterio Espacial**: Intersección de la trayectoria del balón con el 'bounding box' de un defensor.
*   **Criterio Lógico**: 
    1.  El balón cambia de trayectoria drásticamente sin haber tocado el suelo o la portería.
    2.  El defensor está en posición de 'brazos extendidos' (pose estimation) en el momento del contacto.

---

## 4. Visualización de Datos: El Panel del Entrenador

Para que los datos sean útiles, deben presentarse de forma que revelen patrones tácticos.

### Gráficos Recomendados
1.  **Heatmaps de Lanzamiento vs. Efectividad**: Mapa de calor de las zonas desde donde se lanza, con capas de colores (gradiente verde-rojo) que indiquen el porcentaje de acierto.
2.  **Diagramas de Radar (Perfil de Jugador)**: Comparativa de métricas: Goles, Asistencias, Recuperaciones, Bloqueos y Km recorridos. Ideal para scoutear rivales.
3.  **Flujos de Posesión (Sankey Diagrams)**: Visualiza cómo progresa el balón desde la defensa hasta el ataque, identificando si el equipo prefiere el centro o las bandas (wing play).
4.  **Mapa de Distancia Defensiva**: Visualización de la 'forma' de la defensa (6:0, 5:1). Detecta agujeros o excesiva separación entre defensores por los que el rival suele penetrar.

---
*Propietario del Documento: Departamento de Producto, 7metrics AI.*

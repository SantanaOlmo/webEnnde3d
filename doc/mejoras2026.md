Nuestra Investigación: Optimización y Análisis Geométrico en webEnnde3d

Para que el visor no sea solo una herramienta de visualización, sino un sistema de diagnóstico de daños, hemos investigado las siguientes soluciones técnicas:
1. Alineación Automática: Algoritmo ICP (Iterative Closest Point)
Hemos detectado que el mayor problema al comparar dos modelos es que nunca coinciden en el espacio. Tras investigar cómo lo hacen las herramientas profesionales, hemos llegado al ICP.
En qué consiste: Es un proceso iterativo donde el código selecciona puntos de la Malla A y busca sus homólogos más cercanos en la Malla B. Calcula una matriz de transformación para mover y rotar la malla hasta que el "error de distancia" sea mínimo.
Nuestra recomendación: Aunque es complejo de programar desde cero en JS, hemos visto que podemos implementar una versión simplificada calculando el Centroide (el punto medio de todos los vértices) de ambas mallas. Si restamos la posición del centroide a cada modelo, ambos se alinean automáticamente en el origen $(0,0,0)$.
2. Detección de Diferencias: Estructuras BVH y Octrees
Para saber si una escultura tiene una grieta o pérdida de material, necesitamos medir la distancia entre la superficie de la "Malla Original" y la "Malla Actual".
El problema del rendimiento: Comparar cada vértice contra todos los demás colgaría el navegador.
Nuestra solución investigada: El uso de BVH (Bounding Volume Hierarchy). Es una estructura que envuelve la geometría en "cajas" lógicas. En lugar de preguntar "¿este punto toca la malla?", preguntamos "¿este punto está dentro de esta caja?". Si no lo está, descartamos miles de cálculos de golpe.
Aplicación técnica: Hemos investigado la librería three-mesh-bvh, que permite hacer consultas de proximidad en milisegundos. Con esto, podemos pintar de rojo las zonas donde la distancia entre mallas sea superior a un umbral (por ejemplo, 1mm).
3. Optimización de Memoria: Compresión Draco
Dado que los archivos de patrimonio (ARPA) suelen ser nubes de puntos pesadísimas, hemos investigado cómo reducir el tiempo de carga sin perder detalle.
Tecnología: Google Draco. Es un sistema de compresión de mallas que reduce el tamaño de los archivos hasta un 90%.
Implementación: Hemos analizado cómo integrar el DRACOLoader en nuestro flujo actual de Vite. Esto permitiría que el visor cargue modelos complejos casi instantáneamente, algo vital para que la herramienta sea usable en una web real.
4. Shaders para el "Heatmap" de Daños
En lugar de modificar el color de cada vértice mediante la CPU (que es lento), hemos investigado cómo delegar esto a la tarjeta gráfica mediante GLSL (Shaders).
Concepto: Crear un Vertex Shader que reciba las posiciones de ambas mallas y calcule la diferencia de color en tiempo real. Esto permitiría que, si el usuario mueve una pieza, el "mapa de calor" de daños se actualice instantáneamente sin tirones de FPS.

¿Qué proponemos implementar para el portfolio?
Para que nuestro código destaque de verdad, nos vamos a centrar en estas tres mejoras basadas en nuestra investigación:
Lógica de Centrado Automático: Implementar la función que alinea los modelos por su centro de masas al cargarlos.
Uso de three-mesh-bvh: Integrar esta librería para que la herramienta de "medir distancias" sea profesional y ultra rápida.
Interfaz de Tolerancia: Añadir un slider en el UI de nuestro visor para que el usuario elija cuántos milímetros de diferencia considera un "daño" y que el modelo cambie de color dinámicamente.



Nuestra Investigación: Optimización y Análisis Geométrico en webEnnde3d
Para que el visor no sea solo una herramienta de visualización, sino un sistema de diagnóstico de daños, hemos investigado las siguientes soluciones técnicas:
1. Alineación Automática: Algoritmo ICP (Iterative Closest Point)
Hemos detectado que el mayor problema al comparar dos modelos es que nunca coinciden en el espacio. Tras investigar cómo lo hacen las herramientas profesionales, hemos llegado al ICP.
En qué consiste: Es un proceso iterativo donde el código selecciona puntos de la Malla A y busca sus homólogos más cercanos en la Malla B. Calcula una matriz de transformación para mover y rotar la malla hasta que el "error de distancia" sea mínimo.
Nuestra recomendación: Aunque es complejo de programar desde cero en JS, hemos visto que podemos implementar una versión simplificada calculando el Centroide (el punto medio de todos los vértices) de ambas mallas. Si restamos la posición del centroide a cada modelo, ambos se alinean automáticamente en el origen $(0,0,0)$.
2. Detección de Diferencias: Estructuras BVH y Octrees
Para saber si una escultura tiene una grieta o pérdida de material, necesitamos medir la distancia entre la superficie de la "Malla Original" y la "Malla Actual".
El problema del rendimiento: Comparar cada vértice contra todos los demás colgaría el navegador.
Nuestra solución investigada: El uso de BVH (Bounding Volume Hierarchy). Es una estructura que envuelve la geometría en "cajas" lógicas. En lugar de preguntar "¿este punto toca la malla?", preguntamos "¿este punto está dentro de esta caja?". Si no lo está, descartamos miles de cálculos de golpe.
Aplicación técnica: Hemos investigado la librería three-mesh-bvh, que permite hacer consultas de proximidad en milisegundos. Con esto, podemos pintar de rojo las zonas donde la distancia entre mallas sea superior a un umbral (por ejemplo, 1mm).
3. Optimización de Memoria: Compresión Draco
Dado que los archivos de patrimonio (ARPA) suelen ser nubes de puntos pesadísimas, hemos investigado cómo reducir el tiempo de carga sin perder detalle.
Tecnología: Google Draco. Es un sistema de compresión de mallas que reduce el tamaño de los archivos hasta un 90%.
Implementación: Hemos analizado cómo integrar el DRACOLoader en nuestro flujo actual de Vite. Esto permitiría que el visor cargue modelos complejos casi instantáneamente, algo vital para que la herramienta sea usable en una web real.
4. Shaders para el "Heatmap" de Daños
En lugar de modificar el color de cada vértice mediante la CPU (que es lento), hemos investigado cómo delegar esto a la tarjeta gráfica mediante GLSL (Shaders).
Concepto: Crear un Vertex Shader que reciba las posiciones de ambas mallas y calcule la diferencia de color en tiempo real. Esto permitiría que, si el usuario mueve una pieza, el "mapa de calor" de daños se actualice instantáneamente sin tirones de FPS.

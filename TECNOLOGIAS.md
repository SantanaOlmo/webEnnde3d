# Tecnologías y Conceptos 3D del Proyecto webEnnde3d

Este documento explica tanto el stack tecnológico empleado en el proyecto como los conceptos fundamentales de 3D (Three.js) que hacen posible la visualización de los modelos.

## Tecnologías Utilizadas

- **Three.js**: Es la librería principal (escrita en JavaScript) que permite crear y mostrar gráficos 3D animados por ordenador en un navegador web mediante el uso de WebGL. Abstrae la complejidad matemática y de bajo nivel de WebGL ofreciendo una API más accesible y potente.
- **Vite**: Herramienta de compilación y servidor de desarrollo (bundler). Proporciona un entorno de desarrollo ultra rápido con recarga en caliente (HMR) y empaqueta el proyecto para producción de forma altamente optimizada.
- **JavaScript Moderno (ES6+)**: Se utilizan módulos nativos de JS (`type="module"`) para organizar la lógica de escenas y la interacción del usuario (`initIndex.js`, `index.js`, `script.js`).
- **IndexedDB**: API del navegador orientada a base de datos del lado del cliente. En el visor se utiliza para guardar temporalmente el modelo 3D subido localmente. Esto permite saltar fácilmente entre el visor individual o comparativo, recuperando el archivo al instante sin tener que volver a pedir al usuario que lo seleccione y transfiriendo el contexto entre vistas.
- **Librerías Auxiliares**:
  - *Bootstrap Icons y FontAwesome*: Para la integración de iconografía del visor web.
  - *Simplebar*: Para modernizar y personalizar barras de desplazamiento nativas en el UI.
  - *Resize Observer Polyfill*: Para mantener la retrocompatibilidad en la detección reactiva de cambios de dimensiones en la ventana y recalcular la relación de aspecto del canvas 3D de forma fluida.

---

## Conceptos Clave en Gráficos 3D (Three.js)

Para entender cómo funciona el interior de un visor 3D como este, es esencial conocer los pilares fundamentales en los que se asienta cualquier escena tridimensional.

### 1. La Escena (Scene)
Es el contenedor universal. Todo lo que queremos renderizar (modelos, luces, cámaras, fondos) debe ser añadido a la Escena. Funciona como un estadio vacío o escenario oscuro donde colocaremos paulatinamente y ajustaremos todos los elementos de nuestra aplicación.

### 2. La Cámara (Camera)
Define *desde qué punto y con qué enfoque* el usuario está mirando la escena. Three.js usa comúnmente una `PerspectiveCamera`, que imita de forma fiel la manera en la que el ojo humano ve su entorno (los objetos lejanos se ven de menor tamaño y las proporciones se fugan).
- Parámetros vitales: El **FOV (Field of View)** (el grado de apertura visual) y el `aspect ratio` (la relación rectangular de la pantalla).

### 3. Geometrías (Geometry)
Representa la estructura fundamental o _esqueleto_ de un objeto tridimensional. Una geometría almacena datos esenciales sobre el volumen de un objeto:
- **Vértices (Vertices)**: Son puntos exactos posicionados en el espacio matemático 3D usando coordenadas (X, Y, Z). Es el componente indivisible y mínimo. Una geometría está compuesta por cientos o miles de estos puntos espaciales.
- **Caras (Faces / Polygons)**: Son las superficies virtuales creadas trazando líneas que conectan un grupo de vértices. En gráficas por ordenador y para máximo rendimiento, un número masivo de veces se usan exclusivamente "triángulos" (conectar 3 vértices) dado que son las formas matemáticas coplanarias perfectas y más veloces de renderizar por la tarjeta gráfica (GPU).

### 4. Materiales (Material)
Mientras que la geometría define la forma interna, el material define la **apariencia y textura**. Describe cómo se siente la superficie, color del objeto y, más importante, cómo y cuánto reacciona a la luz.
- Ejemplos: Puede definir un color sólido mate, un modelo PBR (Physically Based Rendering) para generar reflejos metálicos calculados físicamente, rugosidad, refracción cristalina y proyectar texturas desde imágenes cargadas.

### 5. Mallas (Mesh)
Es el punto de unión culminante y el resultado sintético de empaquetar una **Geometría** junto con un **Material**. La Malla es el objeto "existente" y visual que finalmente agregamos a nuestra Escena.
> `Malla (Mesh) = Geometría (Estructura/Huesos) + Material (Piel y Pintura)`

### 6. Puntos (Points & PointCloud)
A veces, en lugar de conectar vértices para cerrar caras y ver elementos masivos sólidos (Mesh), nos interesa mostrar únicamente esos vértices de manera libre flotando en el espacio (por ejemplo, al renderizar escaneos LiDAR, nubes de puntos, simulaciones de polvo o lluvia). En lugar de usar la clase `Mesh`, renderizamos un objeto gráfico diferente en el origen de las coordenadas, permitiendo agrupar millones de representaciones minimalistas con enorme rendimiento.

### 7. Luces (Lights)
Incluso si tu escena tiene la malla estructurada a perfección, si no añades luces el renderizado final te mostrará simplemente negro absoluto. Existen distintos rangos para simular iluminación real de la vida diaria:
- **Ambient Light**: Ilumina todos los polígonos del modelo universalmente por igual en todo el volumen, venga de donde venga. Se usa para imbuir un brillo global sin direccionalidad estricta y rellenar rincones muy oscuros, no provoca sombras duras.
- **Directional Light**: Actúa análogamente a un un farol potentísimo del sol. Es luz emitida infinitamente desde una lejanía enorme pero con dirección controlada, produciendo sombras marcadas.
- **Point Light / Spot Light**: Comportamientos dinámicos como los que se verían con una linterna encendida, una vela del entorno o pequeños focos concentrados sobre la materia de tu visor.

### 8. El Renderizador (Renderer)
Es el procesador final algorítmico, y motor encargado de hacer de "fotógrafo" de toda tu escena. Haciendo uso interactivo entre la CPU o la tarjeta gráfica acelerada usando el API global de *WebGL*, calcula cada píxel en base a ángulos, luces y cámara para generar la imagen proyectándosela al usuario dentro del lienzo vacío `<canvas>` en su HTML unas fluidas 60 a 120 veces por segundo.

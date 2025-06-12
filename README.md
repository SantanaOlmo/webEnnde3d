# web Ennde3d

[drag and drop info](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)

[three.js manual](https://threejs.org/manual/#en/installation)

[crear un primer proyecto de three.js (incluye video)](https://threejs-journey.com/lessons/first-threejs-project)

[ejemplo visor 3d](https://sketchfab.com/3d-models?date=week&sort_by=-likeCount&cursor=bz0xJnA9Mjc%3D)ç

[descarga de hdri](https://polyhaven.com/)

[loaders](https://css-loaders.com/)

[repositorio con iconos de blender](https://github.com/blender/blender/tree/main/release/datafiles/icons_svg)


## POR QUÉ UTILIZAR THREE.JS
Hemos elegido utilizar Three.js porque nos permite visualizar archivos `.glb` y `.gltf` de forma sencilla y eficiente en la web. Esta librería nos facilita trabajar con gráficos 3D sin tener que escribir código complejo directamente en WebGL (una API de bajo nivel para renderizar gráficos 2D y 3D en el navegador mediante la GPU). Además, incluye herramientas como el `GLTFLoader`, que nos permite cargar modelos 3D directamente y con buen rendimiento. Al ser ligera y compatible con todos los navegadores modernos, se integra fácilmente en cualquier proyecto web. A diferencia de motores más pesados como Unity, Three.js no requiere instalaciones externas y nos da control total sobre la escena. También cuenta con una comunidad activa y buena documentación, lo que agiliza nuestro desarrollo.


## INSTALACION DE TRHEE.JS

1. Descargar e instalar node.js (verificar en terminal con node -v)
2. Ir a la ruta del proyecto webennde3d en cmd y ejecutar lo siguiente
   ```
   npm init -y
   npm install three
   npm install --save-dev vite
   ```
3. importar three en el archivo js:
    ```
    import * as THREE from 'three';
    ```
4. Ejecutar el servidor en cmd con 
   ```
   npx vite
   ```
   aparecerá algo así: 
   
   ![imagen](/assets/readmeFiles/image1.png)

   y habrá que clicar en el link que aparece, el cual abrirá nuestro proyecto en el navegador



   Por cuestiones de seguridad deberemos crar un servidor local para poder utilizar las funcionalidades qeu nos ofrece three.js Y para crear este servidor local deberemos utilizar una herramienta que nos permita construir ese servidor (build tool), en este caso, hemos usado `vite`.


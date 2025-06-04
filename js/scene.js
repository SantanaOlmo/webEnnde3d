// scene.js

// Importaciones de módulos necesarios de Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Variables globales
let scene, camera, renderer, controls, loader, gridHelper, currentModel;
let cameraPositionX = document.getElementById('x');
let cameraPositionY = document.getElementById('y');
let cameraPositionZ = document.getElementById('z');


// Inicializa la escena 3D completa
export function initScene(container) {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color('red'); // para pruebas sin HDRI

  // Fondo HDRI (fondo + luz ambiental)
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/assets/hdri/campo.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  // Cámara en perspectiva
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  // Renderizador WebGL
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.physicallyCorrectLights = true; // iluminación físicamente correcta
  renderer.outputColorSpace = THREE.SRGBColorSpace; // espacio de color estándar
  container.appendChild(renderer.domElement);

  // Cuadrícula y ejes
  gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Controles orbitales (ratón)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Luces direccionales
  const directionalLight = new THREE.DirectionalLight('white', 0.25);
  directionalLight.position.set(5, 10, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight('white', 1);
  directionalLight2.position.set(-5, -10, 7.5);
  directionalLight2.castShadow = true;
  scene.add(directionalLight2);

  const directionalLight3 = new THREE.DirectionalLight('white', 1);
  directionalLight3.position.set(-180, -360, 20);
  directionalLight3.castShadow = true;
  scene.add(directionalLight3);

  // Luz ambiental opcional
  /* const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight); */

  // Cargador de modelos GLTF/GLB
  loader = new GLTFLoader();

  // Ajuste al redimensionar la ventana
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();              // Comienza el bucle de render
  autoLoadFromSession();  // Carga desde sessionStorage si hay algo
}


// Carga un modelo desde archivo (GLB/GLTF)
export function loadModel(file) {
  if (!loader) {
    console.error("Scene not initialized. Call initScene(container) first.");
    return;
  }

  const url = URL.createObjectURL(file);
  loader.load(
    url,
    (gltf) => {
      if (currentModel) {
        scene.remove(currentModel);
      }

      currentModel = gltf.scene;
      scene.add(currentModel);
      centerAndFitModel(currentModel);
    },
    undefined,
    (error) => {
      console.error("Error cargando modelo:", error);
      alert("Error al cargar el modelo. Verifica que sea un archivo .glb o .gltf válido.");
    }
  );
}


// Centra el modelo y ajusta la cámara para que encaje
function centerAndFitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const dist = maxDim * 1.5;

  camera.position.set(dist, dist, dist);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}


// Bucle de renderizado y actualización
let angle = 0;
const radius = 5; // Distancia constante de la cámara al centro (ajustable)

function animate() {
  requestAnimationFrame(animate);

  /*// Incrementar el ángulo suavemente
  angle += 0.005;

  // Calcular la nueva posición de la cámara en un círculo
  camera.position.x = radius * Math.sin(angle);
  camera.position.z = radius * Math.cos(angle);
  camera.position.y = 1.5; // Altura constante de la cámara (ajustable)

  camera.lookAt(0, 0, 0); // La cámara siempre apunta al centro*/

  controls.update();
  renderer.render(scene, camera);

  // Mostrar posición de cámara redondeada
  cameraPositionX.textContent = redondear(camera.position.x, 3);
  cameraPositionY.textContent = redondear(camera.position.y, 3);
  cameraPositionZ.textContent = redondear(camera.position.z, 3);
}


// Carga automática de modelo desde sessionStorage
function autoLoadFromSession() {
  const base64 = sessionStorage.getItem('uploadedModel');

  if (!base64) {
    console.warn("No hay modelo en sessionStorage para cargar.");
    return;
  }

  try {
    const mimeMatch = base64.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'model/gltf-binary';
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], 'model.glb', { type: mimeType });

    loadModel(file);
  } catch (e) {
    console.error("Error al convertir y cargar modelo desde sessionStorage:", e);
    alert("El modelo no pudo cargarse desde sessionStorage. Asegúrate de haber subido un archivo válido.");
  }
}


// Redondea número a n decimales
function redondear(num, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(num * factor) / factor;
}


// Actualiza el material del modelo cargado usando valores del sessionStorage
export function actualizarModelo() {
  const datos = JSON.parse(sessionStorage.getItem('estilos'));

  currentModel.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(datos.color),
        roughness: datos.roughness,
        metalness: datos.metalness,
      });
      child.material.needsUpdate = true;
    }
  });
}

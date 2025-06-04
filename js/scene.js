// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, loader, gridHelper, currentModel;
let cameraPositionX=document.getElementById('x');
let cameraPositionY=document.getElementById('y');
let cameraPositionZ=document.getElementById('z');

export function initScene(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('grey');

  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.physicallyCorrectLights = true; // 👈 Iluminación realista
  renderer.outputColorSpace = THREE.SRGBColorSpace; // 👈 Para glTF correcto
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 💡 Luz ambiental (suave, general)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // 💡 Luz direccional (como el sol)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Cuadrícula y ejes
  gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  loader = new GLTFLoader();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();
  autoLoadFromSession();
}


export function loadModel(file) {
  if (!loader) {
    console.error("Scene not initialized. Call initScene(container) first.");

    return;
  }

  const url = URL.createObjectURL(file);
  loader.load(
    url,
    (gltf) => {
      // Eliminar solo el modelo anterior, no la escena entera
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

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  cameraPositionX.textContent=redondear(camera.position.x, 3);
  cameraPositionY.textContent=redondear(camera.position.y, 3);
  cameraPositionZ.textContent=redondear(camera.position.z, 3);
}

/*CARGAR EL ARCHIVO 3D DEL SESSION STORAGE*/
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

function redondear(num,decimales){
  const factor = Math.pow(10, decimales);
  return Math.round(num * factor) / factor;
}
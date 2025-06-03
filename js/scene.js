// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, loader;

export function initScene(container) {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  scene.add(light);

  loader = new GLTFLoader();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();

  // Intentar cargar modelo automáticamente si está en sessionStorage
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
      // Limpiar escena
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      scene.add(gltf.scene);
      centerAndFitModel(gltf.scene);
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
}

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

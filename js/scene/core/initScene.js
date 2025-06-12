// js/scene/core/initScene.js
import * as THREE from 'three';

export function initScene(containerId) {
  const container = document.getElementById(containerId);
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.075,
    1000
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5); 
  scene.add(ambientLight);

  // ResizeObserver para actualizar el render si cambia el tamaño del contenedor
  const observer = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  });
  observer.observe(container);

  return { scene, camera, renderer };
}

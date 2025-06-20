// js/scene/core/initScene.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import * as THREE from 'three';
import { crearEjes, crearGrid } from './helpers.js';

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

  // ✅ Añadir ejes y cuadrícula solo si es un visor principal
  if (containerId === 'indexViewer1' || containerId === 'viewer1' || containerId === 'viewer2') {
    const ejes = crearEjes();
    const grid = crearGrid();

    scene.add(ejes);
    scene.add(grid);
  }

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

// ✅ ./js/scene/environment/hdriManager.js
//recibe una ruta hdri, una escena y aplica el fondo
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Cambiar HDRI desde un archivo
export function cambiarHDRI(scene, nombreArchivo) {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(`/assets/hdri/${nombreArchivo}`, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background  = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });
}

// Quitar HDRI y dejar fondo blanco
export function quitarHDRI(scene) {
  scene.background  = new THREE.Color(0xffffff);
  scene.environment = null;
  currentHDRI = null;
}

// Cambiar color de fondo sólido
export function cambiarColorFondo(scene, renderer, colorHex) {
  if (scene && renderer) {
    const color = new THREE.Color(colorHex);
    scene.background = color;
    renderer.setClearColor(color);
  }
}
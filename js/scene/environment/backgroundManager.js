// js/scene/environment/backgroundManager.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import * as THREE from 'three';

export function setBackgroundColor(scene, renderer, color) {
  if (!scene || !renderer) return;

  // Desactivamos el HDRI
  scene.environment = null;

  // Aplicamos color plano
  const c = new THREE.Color(color);
  scene.background = c;
  renderer.setClearColor(c);
}

export function attachSceneToViewer(viewerId, scene) {
  const canvas = document.querySelector(`#${viewerId} canvas`);
  if (canvas) canvas.__sceneRef = scene;
}

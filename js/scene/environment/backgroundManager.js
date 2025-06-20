// js/scene/environment/backgroundManager.js

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

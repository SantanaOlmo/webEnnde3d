// js/scene/environment/backgroundManager.js

export function setBackgroundColor(scene, renderer, color) {
  if (!scene || !renderer) return;

  const c = new THREE.Color(color);
  scene.background = c;
  renderer.setClearColor(c);
}

export function attachSceneToViewer(viewerId, scene) {
  const canvas = document.querySelector(`#${viewerId} canvas`);
  if (canvas) canvas.__sceneRef = scene;
}

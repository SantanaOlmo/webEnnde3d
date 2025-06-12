// js/scene/environment/backgroundManager.js
import { getActiveViewer, isSyncMode } from '../../ui/viewerSwitch.js';

export function setBackgroundColor(color) {
  const viewers = isSyncMode() ? ['viewer1', 'viewer2'] : [`viewer${getActiveViewer()}`];

  viewers.forEach(viewerId => {
    const canvas = document.querySelector(`#${viewerId} canvas`);
    if (!canvas || !canvas.__sceneRef) return;

    const scene = canvas.__sceneRef;
    scene.background = new THREE.Color(color);
  });
}

// Utilidad opcional si necesitas actualizar manualmente la referencia a la escena
export function attachSceneToViewer(viewerId, scene) {
  const canvas = document.querySelector(`#${viewerId} canvas`);
  if (canvas) canvas.__sceneRef = scene;
}

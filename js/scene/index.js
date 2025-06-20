// js/viewerSetup.js

import { initScene } from './core/initScene.js';
import { loadModel } from './model/modelLoader.js';
import { animate } from './core/animate.js';

export async function setupViewerScene(containerId, file) {
  const { scene, camera, renderer, controls } = initScene(containerId);
  await loadModel(scene, file);
  animate({ scene, camera, renderer, controls });
}

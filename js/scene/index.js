// js/scene/index.js
export * from './core/initScene.js';
export * from './model/loader.js';
export * from './model/materials.js';
export * from './model/centerFit.js';
export * from './model/vertices.js';
export * from './model/interaction.js';
export * from './environment/hdri.js';
export * from './db/indexedLoader.js';
export * from './interaction/keyboard.js';
export * from './interaction/sliders.js';
export * from './interaction/dragdrop.js';

import { initScene } from './core/initScene.js';
import { loadModel } from './model/loadModel.js';
import { animate } from './core/animate.js';

// Este es el entrypoint para viewer.js
export async function setupViewerScene(containerId, file) {
  const { scene, camera, renderer, controls } = initScene(containerId);
  await loadModel(scene, file);
  animate({ scene, camera, renderer, controls });
}


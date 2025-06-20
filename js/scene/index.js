// js/viewerSetup.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import { initScene } from './core/initScene.js';
import { loadModel } from './model/modelLoader.js';
import { animate } from './core/animate.js';

export async function setupViewerScene(containerId, file) {
  const { scene, camera, renderer, controls } = initScene(containerId);
  await loadModel(scene, file);
  animate({ scene, camera, renderer, controls });
}

// js/scene/init/initSingleViewer.js
import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModel } from '../model/modelLoader.js';
import { initScene } from '../core/initScene.js';
import { addOrbitControls } from '../core/cameraControls.js';
import { animate } from '../core/animate.js';
import { attachSceneToViewer } from '../environment/backgroundManager.js';

console.log('📦 initSingleViewer.js cargado');

document.addEventListener('DOMContentLoaded', async () => {

  const viewerId = new URLSearchParams(window.location.search).get('viewerId');
  console.log('🧭 viewerId:', viewerId);

  const container = document.getElementById(viewerId);
  if (!container) {
    console.warn(`❌ No se encontró contenedor con id "${viewerId}"`);
    return;
  }

  const key = `uploadedModel_${viewerId}`;
  const fileFromDB = await getFileFromIndexedDB(key);
  console.log(`📦 Archivo cargado desde IndexedDB (${key}):`, fileFromDB);
  if (!fileFromDB) return;

  const { scene, camera, renderer } = initScene(viewerId);
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);
  await loadModel(scene, fileFromDB);
  animate(renderer, scene, camera, controls);
});

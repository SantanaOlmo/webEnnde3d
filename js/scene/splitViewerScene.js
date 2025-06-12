// js/splitViewerScene.js
import { setOnFileProcessed } from './db/model-upload.js';
import { getFileFromIndexedDB } from './db/db-utils.js';
import { loadModel } from './model/modelLoader.js';
import { animate } from './core/animate.js';
import { initScene } from './core/initScene.js';
import { addOrbitControls } from './core/cameraControls.js';
import { initViewerSwitchUI } from '../ui/viewerSwitch.js';
import { attachSceneToViewer } from './environment/backgroundManager.js';

initViewerSwitchUI();

setOnFileProcessed(async (file, viewerId) => {
  console.log(`📥 Archivo soltado en ${viewerId}: ${file.name}`);

  const container = document.getElementById(viewerId);
  if (!container) return;

  container.innerHTML = '';

  const fileFromDB = await getFileFromIndexedDB(`uploadedModel_${viewerId}`);
  if (!fileFromDB) return;

  const { scene, camera, renderer } = initScene(viewerId);
  
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);
  await loadModel(scene, fileFromDB);
  animate(renderer, scene, camera, controls);
});

// js/splitViewerScene.js

import { setOnFileProcessed } from './db/model-upload.js';
import { getFileFromIndexedDB } from './db/db-utils.js';
import { loadModel } from './model/modelLoader.js';
import { animate } from './core/animate.js';
import { initScene } from './core/initScene.js';
import { addOrbitControls } from './core/cameraControls.js';
import { initViewerSwitchUI } from '../ui/viewerSwitch.js';
import { attachSceneToViewer } from './environment/backgroundManager.js';
import { setupDragAndDrop } from '../utils/drag-drop-handler.js';
import { handleFile } from './db/model-upload.js';

initViewerSwitchUI();

// === CARGA AUTOMÁTICA EN viewer1 SI VIENES DEL VISOR INDIVIDUAL ===
const modeloOrigen = localStorage.getItem("modeloOrigen");

if (modeloOrigen) {
  const key = `uploadedModel_${modeloOrigen}`; // normalmente 'uploadedModel_indexViewer1'
  const container = document.getElementById("viewer1");

  (async () => {
    const fileFromDB = await getFileFromIndexedDB(key);
    if (!fileFromDB) return;

    container.innerHTML = '';
    const { scene, camera, renderer } = initScene("viewer1");
    attachSceneToViewer("viewer1", scene);
    const controls = addOrbitControls(camera, renderer);
    await loadModel(scene, fileFromDB);
    animate(renderer, scene, camera, controls);
  })();

  // OPCIONAL: Limpieza para evitar residuos
  // localStorage.removeItem("modeloOrigen");
}

// === ZONA DE DROP PARA viewer1 (vinculado al visor individual) ===
setupDragAndDrop({
  dropArea: document.querySelector('.viewer1'),
  fileInput: document.querySelector('#inputFile1'),
  onFileDrop: handleFile,
  viewerId: 'indexViewer1'  // 🔁 clave sincronizada con visor individual
});

// === ZONA DE DROP PARA viewer2 (independiente) ===
setupDragAndDrop({
  dropArea: document.querySelector('.viewer2'),
  fileInput: document.querySelector('#inputFile2'),
  onFileDrop: handleFile,
  viewerId: 'viewer2'
});

// === CUANDO SE CARGA UN ARCHIVO EN CUALQUIER VISOR ===
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

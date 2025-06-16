// js/splitViewerScene.js

// Limpieza inicial si venimos desde el index (no debe haber modelo preasignado)
const from = localStorage.getItem("from");
if (from === 'index') {
  localStorage.removeItem("modeloOrigen"); // solo lo borramos si venimos del index
}

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



// === CARGA AUTOMÁTICA EN viewer1 SI VIENES DEL VISOR INDIVIDUAL ===
const modeloOrigen = localStorage.getItem("modeloOrigen");

// Detectamos si existe 'indexViewer1' o 'viewer1'
const viewer1Id = document.getElementById("indexViewer1") ? "indexViewer1" : "viewer1";
console.log("🎯 viewer1Id detectado:", viewer1Id);
initViewerSwitchUI(viewer1Id); // <--- PASAMOS EL ID CORRECTO


if (modeloOrigen) {
  const key = `uploadedModel_${modeloOrigen}`; // normalmente 'uploadedModel_indexViewer1'

  (async () => {
    const fileFromDB = await getFileFromIndexedDB(key);
    if (!fileFromDB) return;

    viewer1Container.innerHTML = '';
    const { scene, camera, renderer } = initScene(viewer1Id);
    attachSceneToViewer(viewer1Id, scene);
    const controls = addOrbitControls(camera, renderer);
    await loadModel(scene, fileFromDB);
    animate(renderer, scene, camera, controls);
  })();
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

  // Limpieza previa
  container.innerHTML = '';

  // ✅ Siempre se inicializa escena al cargar archivo
  const { scene, camera, renderer } = initScene(viewerId);
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);

  // Cargamos el modelo desde IndexedDB (ya guardado)
  const fileFromDB = await getFileFromIndexedDB(`uploadedModel_${viewerId}`);
  if (!fileFromDB) return;

  await loadModel(scene, fileFromDB);
  animate(renderer, scene, camera, controls);
});

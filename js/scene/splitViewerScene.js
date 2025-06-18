// Ruta: js/splitViewerScene.js

const from = localStorage.getItem("from");
if (from === 'index') {
  localStorage.removeItem("modeloOrigen");
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
import { registerViewer } from './core/viewerRegistry.js';
import { setupAllHelperIcons } from './core/helpers.js';


const modeloOrigen = localStorage.getItem("modeloOrigen");
const viewer1Id = document.getElementById("indexViewer1") ? "indexViewer1" : "viewer1";
console.log("🎯 viewer1Id detectado:", viewer1Id);
initViewerSwitchUI(viewer1Id);

// ==================
// Carga automática en viewer1 si vienes del visor individual
// ==================
if (modeloOrigen) {
  const key = `uploadedModel_${modeloOrigen}`;

  (async () => {
    const fileFromDB = await getFileFromIndexedDB(key);
    if (!fileFromDB) return;

    const viewer1Container = document.getElementById(viewer1Id);

    // Elimina solo el canvas viejo (si existe), NO el contenido HTML (helpers y +)
    const oldCanvas = viewer1Container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    // Elimina el "+"
    const plusSign = viewer1Container.querySelector('.plus-sign');
    if (plusSign) plusSign.remove();


    const { scene, camera, renderer } = initScene(viewer1Id);
    attachSceneToViewer(viewer1Id, scene);
    const controls = addOrbitControls(camera, renderer);

    const model = await loadModel(scene, fileFromDB);
    console.log(`✅ Modelo cargado en ${viewer1Id}`);
    registerViewer(viewer1Id, scene, camera, renderer, model);

    // Muestra los helpers
    const helperIcons = viewer1Container.querySelector('.helper-icons');
    if (helperIcons) helperIcons.style.display = "flex";

    setupAllHelperIcons();

    animate(renderer, scene, camera, controls);
  })();
}

// ==========
// Zonas de drop
// ==========
setupDragAndDrop({
  dropArea: document.querySelector('.viewer1'),
  fileInput: document.querySelector('#inputFile1'),
  onFileDrop: handleFile,
  viewerId: 'indexViewer1'
});

setupDragAndDrop({
  dropArea: document.querySelector('.viewer2'),
  fileInput: document.querySelector('#inputFile2'),
  onFileDrop: handleFile,
  viewerId: 'viewer2'
});

// ==================
// Procesado tras soltar archivo en visor 1 o 2
// ==================
setOnFileProcessed(async (file, viewerId) => {
  console.log(`📥 Archivo soltado en ${viewerId}: ${file.name}`);

  const container = document.getElementById(viewerId);

  // Elimina SOLO el canvas viejo, no el contenido html
  const oldCanvas = container.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();

  // Elimina el "+"
  const plusSign = container.querySelector('.plus-sign');
  if (plusSign) plusSign.remove();


  const { scene, camera, renderer } = initScene(viewerId);
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);

  const fileFromDB = await getFileFromIndexedDB(`uploadedModel_${viewerId}`);
  if (!fileFromDB) return;

  const model = await loadModel(scene, fileFromDB);
  console.log(`✅ Modelo cargado en ${viewerId}`);
  registerViewer(viewerId, scene, camera, renderer, model);

  // Muestra los helpers SOLO cuando hay modelo
  const helperIcons = container.querySelector('.helper-icons');
  if (helperIcons) helperIcons.style.display = "flex";

  setupAllHelperIcons();

  animate(renderer, scene, camera, controls);
});


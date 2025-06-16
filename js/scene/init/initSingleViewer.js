// js/scene/init/initSingleViewer.js

// === Importaciones necesarias para cargar y visualizar el modelo ===
import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModel } from '../model/modelLoader.js';
import { initScene } from '../core/initScene.js';
import { addOrbitControls } from '../core/cameraControls.js';
import { animate } from '../core/animate.js';
import { attachSceneToViewer } from '../environment/backgroundManager.js';
import { registerScene, updateModel } from '../core/viewerRegistry.js';

console.log('📦 initSingleViewer.js cargado');

document.addEventListener('DOMContentLoaded', async () => {
  // 🧭 Obtenemos el ID del visor desde la URL
  const viewerId = new URLSearchParams(window.location.search).get('viewerId');
  console.log('🧭 viewerId:', viewerId);

  const container = document.getElementById(viewerId);
  if (!container) {
    console.warn(`❌ No se encontró contenedor con id "${viewerId}"`);
    return;
  }

  // 📤 Obtenemos el archivo guardado en IndexedDB
  const key = `uploadedModel_${viewerId}`;
  const fileFromDB = await getFileFromIndexedDB(key);
  console.log(`📦 Archivo cargado desde IndexedDB (${key}):`, fileFromDB);

  if (!fileFromDB) {
    console.warn("⚠️ No se encontró archivo en IndexedDB para este visor");
    return;
  }

  // ⚙️ Inicializamos la escena
  const { scene, camera, renderer } = initScene(viewerId);
  registerScene(viewerId, { scene, camera, renderer });
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);

  // 🧱 Cargamos el modelo y lo añadimos a la escena
  const loadedModel = await loadModel(scene, fileFromDB);
  updateModel(viewerId, loadedModel); // ✅ Este es el objeto 3D, no el archivo

  // ▶️ Lanzamos la animación
  animate(renderer, scene, camera, controls);

  // 🧹 Limpiamos el flag temporal
  localStorage.removeItem("modeloOrigen");

  // 🖱️ Puedes reactivar el drag & drop si lo deseas
  // handleDragDrop(viewerId);
});

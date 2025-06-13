// js/scene/init/initSingleViewer.js

// === Importaciones necesarias para cargar y visualizar el modelo ===
import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModel } from '../model/modelLoader.js';
import { initScene } from '../core/initScene.js';
import { addOrbitControls } from '../core/cameraControls.js';
import { animate } from '../core/animate.js';
import { attachSceneToViewer } from '../environment/backgroundManager.js';
//import { handleDragDrop } from '../../utils/drag-drop-handler.js';


console.log('📦 initSingleViewer.js cargado');

// === Cuando el documento esté listo, se lanza la carga del visor ===
document.addEventListener('DOMContentLoaded', async () => {
  // 🧭 Obtenemos el viewerId desde la URL (por ejemplo, "indexViewer1")
  const viewerId = new URLSearchParams(window.location.search).get('viewerId');
  console.log('🧭 viewerId:', viewerId);

  const container = document.getElementById(viewerId);
  if (!container) {
    console.warn(`❌ No se encontró contenedor con id "${viewerId}"`);
    return;
  }

  // 📤 Intentamos cargar archivo desde IndexedDB
  const key = `uploadedModel_${viewerId}`;
  const fileFromDB = await getFileFromIndexedDB(key);
  console.log(`📦 Archivo cargado desde IndexedDB (${key}):`, fileFromDB);

  if (!fileFromDB) {
    console.warn("⚠️ No se encontró archivo en IndexedDB para este visor");
    return;
  }

  // ⚙️ Inicializamos escena y renderizado
  const { scene, camera, renderer } = initScene(viewerId);
  attachSceneToViewer(viewerId, scene);
  const controls = addOrbitControls(camera, renderer);
  await loadModel(scene, fileFromDB);
  animate(renderer, scene, camera, controls);

  // 🧹 Limpiamos el modeloOrigen si lo hubiera
  localStorage.removeItem("modeloOrigen");

  // 🖱️ Activamos el drag and drop para este visor (si quieres seguir cargando)
  //handleDragDrop(IndexViewerId);

});



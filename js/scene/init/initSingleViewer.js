// js/scene/init/initSingleViewer.js

// TODO: Guardar el HDR seleccionado en localStorage y aplicarlo también en el visor comparativo.

// === Importaciones necesarias para cargar y visualizar el modelo ===
import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModel } from '../model/modelLoader.js';
import { initScene } from '../core/initScene.js';
import { addOrbitControls } from '../core/cameraControls.js';
import { animate } from '../core/animate.js';
import { attachSceneToViewer } from '../environment/backgroundManager.js';
import { cambiarHDRI } from '../environment/hdriManager.js';
import { registerScene, updateModel } from '../core/viewerRegistry.js';
import { initRotationInput } from '../interaction/rotationInput.js';
import { initVertexRaycast } from '../interaction/vertexRaycast.js';
import { actualizarColorWireframe } from '../model/materials.js';
import { setupAllHelperIcons } from '../core/helpers.js';
import { crearEjes, crearGrid } from '../core/helpers.js'; 

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
  window.scene = scene; // <- Esto SOLO para depuración

  const controls = addOrbitControls(camera, renderer);

  // 🖼️ Cambiamos el HDRI de fondo inicialmente
  cambiarHDRI(scene, 'campo.hdr');

  // 🧱 Cargamos el modelo y lo añadimos a la escena
  const loadedModel = await loadModel(scene, fileFromDB);
  updateModel(viewerId, loadedModel); // ✅ Este es el objeto 3D, no el archivo
  initVertexRaycast(renderer, camera, loadedModel);

  if (scene && !scene.getObjectByName('helper_ejes')) {
    scene.add(crearEjes());
  }
  if (scene && !scene.getObjectByName('helper_grid')) {
    scene.add(crearGrid());
  }

  // 🎨 Color de la malla
  const colorInput = document.getElementById('wireframeColor');
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      actualizarColorWireframe(loadedModel, colorInput.value);
    });
  }

  // ▶️ Lanzamos la animación (¡primero!)
  animate(renderer, scene, camera, controls);

  // Ahora sí: Mostrar controles de helpers tras cargar modelo Y tras arrancar la animación
  const helperPanel = document.getElementById('helperToggles');
  if (helperPanel) {
    helperPanel.style.display = 'flex';
    setupAllHelperIcons();
  }

  // 🧹 Limpiamos el flag temporal
  localStorage.removeItem("modeloOrigen");

  initRotationInput(viewerId);

  // 🖱️ Puedes reactivar el drag & drop si lo deseas
  // handleDragDrop(viewerId);
});

// js/scene/init/initSingleViewer.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

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

document.addEventListener('DOMContentLoaded', async () => {
  // Obtenemos el ID del visor desde la URL
  const viewerId = new URLSearchParams(window.location.search).get('viewerId');

  const container = document.getElementById(viewerId);
  if (!container) {
    return;
  }

  // Obtenemos el archivo guardado en IndexedDB
  const key = `uploadedModel_${viewerId}`;
  const fileFromDB = await getFileFromIndexedDB(key);

  if (!fileFromDB) {
    return;
  }

  // Inicializamos la escena
  const { scene, camera, renderer } = initScene(viewerId);
  registerScene(viewerId, { scene, camera, renderer });
  attachSceneToViewer(viewerId, scene);

  const controls = addOrbitControls(camera, renderer);
  controls.dampingFactor = 0.08;

  // Cambiamos el HDRI de fondo inicialmente
  cambiarHDRI(scene, 'campo.hdr');

  // Cargamos el modelo y lo añadimos a la escena
  const loadedModel = await loadModel(scene, fileFromDB);
  updateModel(viewerId, loadedModel);
  initVertexRaycast(renderer, camera, loadedModel);
   // === DEPURACIÓN: expón modelo y escena en window ===
  window._debugModel = loadedModel;
  window._debugScene = scene;
  window._debugRenderer = renderer;
  window._debugCamera = camera;



  if (scene && !scene.getObjectByName('helper_ejes')) {
    scene.add(crearEjes());
  }
  if (scene && !scene.getObjectByName('helper_grid')) {
    scene.add(crearGrid());
  }

  // Color de la malla
  const colorInput = document.getElementById('wireframeColor');
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      actualizarColorWireframe(loadedModel, colorInput.value);
    });
  }

  // ▶Lanzamos la animación (¡primero!)
  animate(renderer, scene, camera, controls);

  const canvas = container.querySelector('canvas');
  if (canvas) {
    canvas.classList.add('fade-in');
    setTimeout(() => {
      canvas.classList.add('visible');
    }, 50);
  }

  // Mostrar controles de helpers tras cargar modelo Y tras arrancar la animación
  const helperPanel = document.getElementById('helperToggles');
  if (helperPanel) {
    helperPanel.style.display = 'flex';
    setupAllHelperIcons();
  }

  // Limpiamos el flag temporal
  localStorage.removeItem("modeloOrigen");

  initRotationInput(viewerId);
  // handleDragDrop(viewerId);
});

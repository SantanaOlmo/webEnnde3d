// js/scene/init/initFinalViewer.js

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
import { actualizarColorWireframe, aplicarMatrizTransformacion } from '../model/materials.js';
import { setupAllHelperIcons, crearEjes, crearGrid } from '../core/helpers.js';

console.log('📦 initFinalViewer.js cargado');

document.addEventListener('DOMContentLoaded', async () => {
  const viewerId = 'indexViewer1'; // El único visor en tu escena final
  const container = document.getElementById(viewerId);
  if (!container) {
    console.warn(`❌ No se encontró contenedor con id "${viewerId}"`);
    return;
  }

  // 1. Cargamos ambos modelos desde IndexedDB
  const file1FromDB = await getFileFromIndexedDB('finalModel_1');
  const file2FromDB = await getFileFromIndexedDB('finalModel_2');

  if (!file1FromDB || !file2FromDB) {
    alert('No se han encontrado los dos modelos. Por favor, usa antes el visor doble para cargar y alinear los modelos.');
    return;
  }

  // 2. Inicializa la escena
  const { scene, camera, renderer } = initScene(viewerId);
  registerScene(viewerId, { scene, camera, renderer });

  attachSceneToViewer(viewerId, scene);

  // 3. Añade helpers y controles
  const controls = addOrbitControls(camera, renderer);
  cambiarHDRI(scene, 'campo.hdr');

  // 4. Carga los dos modelos en la escena
  const model1 = await loadModel(scene, file1FromDB);
  model1.name = 'modelo_base';
  scene.add(model1);
  updateModel(viewerId, model1);

  const model2 = await loadModel(scene, file2FromDB);
  model2.name = 'modelo_alineado';
  scene.add(model2);

  // 5. Aplica la matriz de alineación al segundo modelo
  // Lee la matriz guardada (asegúrate que es un array de 16 numbers)
  const matrixArray = JSON.parse(localStorage.getItem('matrix'));
  console.log('Leyendo matriz de localStorage:', matrixArray);

  if (!matrixArray || !Array.isArray(matrixArray) || matrixArray.length !== 16) {
    alert('No se ha encontrado la matriz de alineación. Vuelve a alinear los modelos en el visor doble.');
    return;
  }

  // Aplica la matriz usando tu función
  aplicarMatrizTransformacion(model2, matrixArray);
  console.log('✅ Matriz de alineación aplicada al segundo modelo');

  // 6. Añade helpers visuales
  if (scene && !scene.getObjectByName('helper_ejes')) scene.add(crearEjes());
  if (scene && !scene.getObjectByName('helper_grid')) scene.add(crearGrid());

  // 7. Wireframe, eventos, etc (opcional)
  const colorInput = document.getElementById('wireframeColor');
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      actualizarColorWireframe(model1, colorInput.value);
      actualizarColorWireframe(model2, colorInput.value);
    });
  }

  animate(renderer, scene, camera, controls);

  const helperPanel = document.getElementById('helperToggles');
  if (helperPanel) {
    helperPanel.style.display = 'flex';
    setupAllHelperIcons();
  }

  // Otros setups
  initRotationInput(viewerId);

  // Inicializa raycast para selección de puntos en ambos modelos si necesitas (por ejemplo para analizar diferencias)
  initVertexRaycast(renderer, camera, model1);
  initVertexRaycast(renderer, camera, model2);
});

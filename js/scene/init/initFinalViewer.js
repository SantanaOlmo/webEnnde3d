// js/scene/init/initFinalViewer.js

import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModelRaw } from '../model/modelLoader.js';
import { initScene } from '../core/initScene.js';
import { addOrbitControls } from '../core/cameraControls.js';
import { attachSceneToViewer } from '../environment/backgroundManager.js';
import { cambiarHDRI } from '../environment/hdriManager.js';
import { registerScene, updateModel } from '../core/viewerRegistry.js';
import { initRotationInput } from '../interaction/rotationInput.js';
import { initVertexRaycast } from '../interaction/vertexRaycast.js';
import { aplicarMaterialInicial } from '../model/materials.js';
import { actualizarColorWireframe, aplicarMatrizTransformacion } from '../model/materials.js';
import { setupAllHelperIcons, crearEjes, crearGrid } from '../core/helpers.js';
import { initOutlinePass, updateOutlines, getComposer } from '../model/outlinePass.js';

document.addEventListener('DOMContentLoaded', async () => {
  const viewerId = 'indexViewer1';
  const container = document.getElementById(viewerId);
  if (!container) {
    return;
  }

  async function depurarCargado(file1FromDB, file2FromDB) {
  console.log('[DEPURAR] CARGANDO MODELOS DESDE INDEXEDDB...');
  // Blob 1
  if (file1FromDB) {
    console.log('⬅️ [finalModel_1] type:', file1FromDB.type, '| size:', file1FromDB.size);
    if (file1FromDB.name) console.log('⬅️ [finalModel_1] name:', file1FromDB.name);
  }
  // Blob 2
  if (file2FromDB) {
    console.log('⬅️ [finalModel_2] type:', file2FromDB.type, '| size:', file2FromDB.size);
    if (file2FromDB.name) console.log('⬅️ [finalModel_2] name:', file2FromDB.name);
  }
}

  // 1. Cargamos ambos modelos desde IndexedDB
  const file1FromDB = await getFileFromIndexedDB('finalModel_1');
  const file2FromDB = await getFileFromIndexedDB('finalModel_2');

  depurarCargado(file1FromDB, file2FromDB);

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

  const model1 = await loadModelRaw(scene, file1FromDB);
  model1.name = 'modelo_base';

  const model2 = await loadModelRaw(scene, file2FromDB);
  model2.name = 'modelo_alineado';

  const matrixArray = JSON.parse(localStorage.getItem('matrix'));
  aplicarMatrizTransformacion(model2, matrixArray);

  // Aplica material inicial SÓLIDO aquí, justo después de cargar
  aplicarMaterialInicial(model1, '#cccccc');
  aplicarMaterialInicial(model2, '#555555');

  // Para seleccionar el modelo activo
  let activeModel = model1;
  let linkedMode = false;

  // Exponer globales para otros scripts
  window.model1 = model1;
  window.model2 = model2;
  window.activeModel = activeModel;
  window.linkedMode = linkedMode;

  // --- OutlinePass ---
  initOutlinePass(
    renderer,
    scene,
    camera,
    {
      getLinkedMode: () => window.linkedMode,
      getActiveModel: () => window.activeModel,
      getModel1: () => window.model1,
      getModel2: () => window.model2
    }
  );
  updateOutlines();
  animateLoop();

  // Inicia con modelo 1 contorneado
  updateOutlines();
  function animateLoop() {
    requestAnimationFrame(animateLoop);
    controls.update();
    getComposer().render();
  }
  animateLoop();

  // Helpers visuales
  if (scene && !scene.getObjectByName('helper_ejes')) scene.add(crearEjes());
  if (scene && !scene.getObjectByName('helper_grid')) scene.add(crearGrid());

  // Wireframe, eventos, etc (opcional)
  const colorInput = document.getElementById('wireframeColor');
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      actualizarColorWireframe(model1, colorInput.value);
      actualizarColorWireframe(model2, colorInput.value);
    });
  }

  const helperPanel = document.getElementById('helperToggles');
  if (helperPanel) {
    helperPanel.style.display = 'flex';
    setupAllHelperIcons();
  }

  // Otros setups
  initRotationInput(viewerId);
  initVertexRaycast(renderer, camera, model1);
  initVertexRaycast(renderer, camera, model2);

});

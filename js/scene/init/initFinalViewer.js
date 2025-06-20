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

  const model1 = await loadModelRaw(scene, file1FromDB);
  model1.name = 'modelo_base';

  const model2 = await loadModelRaw(scene, file2FromDB);
  model2.name = 'modelo_alineado';

  const matrixArray = JSON.parse(localStorage.getItem('matrix'));

  console.log('Material inicial asignado a modelo 1 y modelo 2');


  aplicarMatrizTransformacion(model2, matrixArray);

// Aplica material inicial SÓLIDO aquí, justo después de cargar
  aplicarMaterialInicial(model1, '#cccccc');
  aplicarMaterialInicial(model2, '#555555');
  console.log('Material inicial aplicado a modelo 1 y modelo 2');

  // Para seleccionar el modelo activo
  let activeModel = model1; // Por defecto modelo 1 activo
  let linkedMode = false;   // Por defecto off

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
  controls.update();  // esto es lo que suaviza
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

  // Debug visualización (puedes quitarlo si no lo necesitas)
function depurar() {
  console.log('🟦 MODELO 1:', model1.name, model1.type, model1.children.length, 'meshes:', model1.children.filter(c => c.isMesh).length);
  console.log('🟩 MODELO 2:', model2.name, model2.type, model2.children.length, 'meshes:', model2.children.filter(c => c.isMesh).length);

  model1.traverse(obj => {
    if (obj.isMesh) {
      console.log('Mesh en modelo1:', obj.name, obj.geometry?.type);
    }
  });
  model2.traverse(obj => {
    if (obj.isMesh) {
      console.log('Mesh en modelo2:', obj.name, obj.geometry?.type);
    }
  });
}


  depurar();
  
});

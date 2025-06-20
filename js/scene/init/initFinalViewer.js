// js/scene/init/initFinalViewer.js

import { getFileFromIndexedDB } from '../db/db-utils.js';
import { loadModelRaw } from '../model/modelLoader.js';
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

const model1 = await loadModelRaw(scene, file1FromDB);
model1.name = 'modelo_base';

const model2 = await loadModelRaw(scene, file2FromDB);
model2.name = 'modelo_alineado';

const matrixArray = JSON.parse(localStorage.getItem('matrix'));


console.log("⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️Antes de aplicar matriz");
console.log("modelo_base:", model1.position, model1.scale);
console.log("modelo_alineado:", model2.position, model2.scale);
console.log("matrixArray:", matrixArray);

aplicarMatrizTransformacion(model2, matrixArray);

console.log("Después de aplicar matriz");
console.log("modelo_base:", model1.position, model1.scale);
console.log("modelo_alineado:", model2.position, model2.scale);

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

  depurar();


  // PARA DEPURARR⬇️⬇️⬇️
function depurar(){
console.log('🟦 MODELO 1:', model1);
console.dir(model1, { depth: 3 });
console.log('  - Type:', model1.type, '| Children:', model1.children.length);
console.log('🟩 MODELO 2:', model2);
console.dir(model2, { depth: 3 });
console.log('  - Type:', model2.type, '| Children:', model2.children.length);

model1.traverse(obj => {
  if (obj.isMesh) {
    console.log('Mesh en modelo1:', obj.name, obj.geometry?.type, obj.geometry?.attributes);
  }
});
model2.traverse(obj => {
  if (obj.isMesh) {
    console.log('Mesh en modelo2:', obj.name, obj.geometry?.type, obj.geometry?.attributes);
  }
});

console.log('Hijos de modelo1:', model1.children);
model1.children[0] && console.log('Primer hijo modelo1:', model1.children[0]);
model1.children[0]?.traverse(obj => {
  if (obj.isMesh) {
    console.log('Mesh encontrado en modelo1:', obj.name, obj.geometry?.type, obj.geometry?.attributes);
  }
});

console.log('Hijos de modelo2:', model2.children);
model2.children[0] && console.log('Primer hijo modelo2:', model2.children[0]);
model2.children[0]?.traverse(obj => {
  if (obj.isMesh) {
    console.log('Mesh encontrado en modelo2:', obj.name, obj.geometry?.type, obj.geometry?.attributes);
  }
});
model1.children[0]?.traverse(obj => {
  if (obj.isMesh) {
    console.log('✔️ Mesh en modelo1:', obj.name, obj.geometry?.type, obj.geometry?.attributes);
  }
  if (obj.isGroup) {
    console.log('➡️ Group en modelo1:', obj.name, obj.children.length);
  }
  if (obj.type === 'Object3D' && !obj.isMesh && !obj.isGroup) {
    console.log('ℹ️ Object3D en modelo1:', obj.name, obj.children.length);
  }
});

}
  

});


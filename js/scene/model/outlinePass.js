// ./js/scene/model/outlinePass.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

let composer, outlinePass, getLinkedMode, getActiveModel, getModel1, getModel2;

function initOutlinePass(renderer, scene, camera, accessors) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  composer.addPass(outlinePass);

  getLinkedMode = accessors.getLinkedMode;
  getActiveModel = accessors.getActiveModel;
  getModel1 = accessors.getModel1;
  getModel2 = accessors.getModel2;
}

function updateOutlines() {
  if (!outlinePass) return;
  let seleccionados;
  if (getLinkedMode && getLinkedMode()) {
    seleccionados = [getModel1(), getModel2()];
  } else {
    seleccionados = [getActiveModel()];
  }
  outlinePass.selectedObjects = seleccionados;
  outlinePass.edgeStrength = 6;
  outlinePass.edgeGlow = 0;
  outlinePass.edgeThickness = 2.5;
  outlinePass.visibleEdgeColor.set('#FFD700');
  outlinePass.hiddenEdgeColor.set('#FFA500');
}

function getComposer() {
  return composer;
}

export { initOutlinePass, updateOutlines, getComposer };

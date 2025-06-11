// js/scene/utils/centerFit.js
import * as THREE from 'three';

export function centerAndFitModel(model, scene) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  console.log("Modelo centrado en la escena.");
}

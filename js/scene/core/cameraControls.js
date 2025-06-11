// js/scene/core/cameraControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function addOrbitControls(camera, renderer) {
  console.log("cameraControls.js → addOrbitControls() ejecutado");
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  return controls;
}

// js/scene/core/cameraControls.js

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

export function addOrbitControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07; // Suavidad del movimiento
  return controls;
}

export function centerCameraOnPoint(camera, controls, {x, y, z}, distance = 2) {
  if (!camera || !controls) {
    return;
  }
  const target = new THREE.Vector3(Number(x), Number(y), Number(z));
  controls.target.copy(target);
  camera.position.copy(target.clone().add(new THREE.Vector3(0, 0, distance)));
  controls.update();
}

window.centerCameraOnPoint = centerCameraOnPoint;

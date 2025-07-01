// js/scene/core/cameraControls.js

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

export function addOrbitControls(camera, renderer, scene) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.zoomSpeed = 0.55;
  controls.minDistance = 0.0001;
  controls.maxDistance = 100;

  controls._initialTarget = controls.target.clone();
  controls._initialCamPos = camera.position.clone();
  controls._isCustomFocus = false;

  renderer.domElement.addEventListener('dblclick', (event) => {
    if (!controls._isCustomFocus) {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        centerCameraOnPoint(camera, controls, point, 1.2); // <-- MÁS CERCA (zoom)
        controls._isCustomFocus = true;
      }
    } else {
      controls.target.copy(controls._initialTarget);
      camera.position.copy(controls._initialCamPos);
      controls._isCustomFocus = false;
      controls.update();
    }
  });

  return controls;
}

export function centerCameraOnPoint(camera, controls, {x, y, z}, distance = 2) {
  if (!camera || !controls) return;
  const target = new THREE.Vector3(Number(x), Number(y), Number(z));
  controls.target.copy(target);
  const dir = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(target.clone().add(dir.multiplyScalar(distance)));
  controls.update();
}

window.centerCameraOnPoint = centerCameraOnPoint;

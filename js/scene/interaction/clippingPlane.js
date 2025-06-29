// js/scene/interaction/clippingPlane.js
import * as THREE from 'three';
import { getRendererById } from '../core/viewerRegistry.js';

// 💡 Guardamos un plano por visor
const clippingPlanesByViewer = {};

export function applyClippingPlane(model, axis = 'X', constant = 0, viewerId = 'indexViewer1') {
  if (!model || !viewerId) return;

  const normal = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }[axis.toUpperCase()];
  const plane = new THREE.Plane(new THREE.Vector3(...normal), -constant);

  clippingPlanesByViewer[viewerId] = plane;

  model.traverse(obj => {
    if (obj.isMesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(mat => {
        mat.clippingPlanes = [plane];
        mat.clipShadows = true;
        mat.needsUpdate = true;
      });
    }
  });

  const renderer = getRendererById(viewerId);
  if (renderer) renderer.localClippingEnabled = true;
}

export function updateClippingPosition(value, viewerId = 'indexViewer1') {
  const plane = clippingPlanesByViewer[viewerId];
  if (plane) {
    plane.constant = -value;
  }

  const renderer = getRendererById(viewerId);
  if (renderer) {
    renderer.localClippingEnabled = true;
  }
}

export function disableClipping(model, viewerId = 'indexViewer1') {
  if (!model) return;

  model.traverse(obj => {
    if (obj.isMesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(mat => {
        mat.clippingPlanes = [];
        mat.needsUpdate = true;
      });
    }
  });

  const renderer = getRendererById(viewerId);
  if (renderer) renderer.localClippingEnabled = false;

  delete clippingPlanesByViewer[viewerId];
}

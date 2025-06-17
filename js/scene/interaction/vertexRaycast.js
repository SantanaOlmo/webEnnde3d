
// js/scene/interaction/vertexRaycast.js
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const TEMP_VEC = new THREE.Vector3();
let puntosSeleccionados = [];

export function initVertexRaycast(renderer, camera, model) {
  window.addEventListener('click', (e) => {
    if (!model) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = [];
    model.traverse((pt) => {
      if (!pt.isPoints) return;

      pt.getWorldPosition(TEMP_VEC);
      const dist = TEMP_VEC.distanceTo(camera.position);
      const adapt = THREE.MathUtils.clamp(1.2 / dist, 0.8, 1.2);

      raycaster.params.Points.threshold = pt.material.userData.pickSize * adapt;
      hits.push(...raycaster.intersectObject(pt, false));
    });

    if (!hits.length) return;

    hits.sort((a, b) => a.distanceToRay - b.distanceToRay);
    const { object, index, point } = hits[0];

    const colors = object.geometry.attributes.color;
    colors.setXYZ(index, 1, 1, 0); // amarillo
    colors.needsUpdate = true;

    puntosSeleccionados.push({
      x: point.x.toFixed(4),
      y: point.y.toFixed(4),
      z: point.z.toFixed(4)
    });

    console.log("🎯 Punto seleccionado:", puntosSeleccionados.at(-1));
  });
}

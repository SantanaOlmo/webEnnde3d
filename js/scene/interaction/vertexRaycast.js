// js/scene/interaction/vertexRaycast.js
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const TEMP_VEC = new THREE.Vector3();

// Nota: Ahora puntosSeleccionados es por visor, no global.
export function initVertexRaycast(renderer, camera, model) {
  if (!renderer || !camera || !model) return;

  // Array de puntos seleccionados para este visor
  const puntosSeleccionados = [];

  // Usamos el canvas del renderer para el evento (así solo afecta a clicks en ese visor)
  renderer.domElement.addEventListener('click', (e) => {
    // Solo actúa si el modelo está definido
    if (!model) return;

    // Calcula el ratón respecto al canvas
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = [];
    model.traverse((pt) => {
      if (!pt.isPoints) return;
      if (pt.name !== 'puntos_nube') return;

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
    if (!colors) {
      console.warn('❌ El objeto Points NO tiene atributo color', object);
      return;
    }

    console.log("Objeto clicado:", object);
console.log("Tiene atributo color?", !!object.geometry.attributes.color);
console.log("Material vertexColors?", object.material.vertexColors);
console.log("Material userData.pickSize:", object.material.userData.pickSize);

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
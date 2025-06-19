// js/scene/interaction/pointSelectionManager.js
import * as THREE from 'three';

// Colores para cada punto (Three.js, NO HEX)
const POINT_COLORS = [
  [0, 1, 0], // Verde
  [0, 0, 1], // Azul
  [1, 1, 0]  // Amarillo
];

// Colores de fondo para las cajas (HTML/CSS)
const BOX_COLORS = ['#2b8108', '#0086ec', '#fff200'];

const raycaster = new THREE.Raycaster();
const TEMP_VEC = new THREE.Vector3();

// Estado global de selección
let activePoint = null; // { visor: 1/2, index: 0/1/2 }
const puntosSeleccionados = {
  1: [null, null, null],
  2: [null, null, null]
};

// FUNCIÓN PRINCIPAL PARA CADA VISOR
export function setupPointSelection({ renderer, camera, model, visor }) {
  const canvas = renderer.domElement;
  const pointsBar = document.getElementById(`pointsBar${visor}`);
  if (!pointsBar) return;

  pointsBar.querySelectorAll('.point-label').forEach((label, idx) => {
    label.addEventListener('click', () => {
      // Quita la clase activa de todas las cajas de ese visor
      pointsBar.querySelectorAll('.point-label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      // Marca la caja activa globalmente
      activePoint = { visor, index: idx };

      // ACTIVA RAYCAST SOLO PARA ESTE VISOR
      activarRaycast();
    });
  });

  // --- RAYCAST SOLO SI HAY CAJA ACTIVA ---
  function activarRaycast() {
    function handler(e) {
      if (!activePoint || activePoint.visor !== visor) return;

      // Raycast como siempre
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
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

      // ---- RESET COLOR DEL PUNTO PREVIO DE ESTE TIPO (SI EXISTE) ----
      const prev = puntosSeleccionados[visor][activePoint.index];
      if (prev && prev.vertexIndex !== undefined && prev.object && prev.object.geometry?.attributes?.color) {
        // Cambia el punto anterior a gris claro
        prev.object.geometry.attributes.color.setXYZ(prev.vertexIndex, 0.7, 0.7, 0.7);
        prev.object.geometry.attributes.color.needsUpdate = true;
      }

      // Cambia color según el punto (verde, azul, amarillo)
      const colorArr = POINT_COLORS[activePoint.index];
      const colors = object.geometry.attributes.color;
      colors.setXYZ(index, ...colorArr);
      colors.needsUpdate = true;

      // Guarda coordenadas y refs SOLO en la posición de la caja activa
      puntosSeleccionados[visor][activePoint.index] = {
        x: point.x.toFixed(4),
        y: point.y.toFixed(4),
        z: point.z.toFixed(4),
        vertexIndex: index,
        object: object
      };

      // Actualiza la caja: SOLO nombre y color de fondo
      const label = document.getElementById(`point${visor}-${activePoint.index + 1}`);
      if (label) {
        // Color de fondo según tipo de punto
        label.style.backgroundColor = BOX_COLORS[activePoint.index];
        label.textContent = `Punto ${activePoint.index + 1}`;
        label.classList.remove('active');

        // Tooltip con coords
        label.setAttribute('data-bs-toggle', 'tooltip');
        label.setAttribute(
          'title',
          `X: ${point.x.toFixed(4)}\nY: ${point.y.toFixed(4)}\nZ: ${point.z.toFixed(4)}`
        );

        // Refresca tooltips (Bootstrap 5+)
        if (window.bootstrap && window.bootstrap.Tooltip) {
          window.bootstrap.Tooltip.getInstance(label)?.dispose();
          new window.bootstrap.Tooltip(label);
        }
      }

      // Desactiva selección de punto
      activePoint = null;
      canvas.removeEventListener('click', handler);
    }
    // Asegúrate de no duplicar listeners
    canvas.removeEventListener('click', handler);
    canvas.addEventListener('click', handler);
  }
}

// --- (opcional) Exporta puntosSeleccionados para acceder desde fuera si quieres ---
export { puntosSeleccionados };

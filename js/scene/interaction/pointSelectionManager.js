// Ruta: js/scene/interaction/pointSelectionManager.js
import * as THREE from 'three';
// Importa centrado de cámara
import { centerCameraOnPoint } from '../core/cameraControls.js';
import { getCameraById, getControlsById } from '../core/viewerRegistry.js';

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

// Registro de funciones de raycast por visor
const activarRaycastPorVisor = {};

// FUNCIÓN PRINCIPAL PARA CADA VISOR
export function setupPointSelection({ renderer, camera, model, scene, visor }) {
  const canvas = renderer.domElement;
  const pointsBar = document.getElementById(`pointsBar${visor}`);
  if (!pointsBar) return;

  // DELEGACIÓN: Engancha un solo listener al padre
  pointsBar.onclick = (e) => {
    const label = e.target.closest('.point-label');
    if (!label) return;
    // Coge el index respecto a los hermanos visibles
    const labels = Array.from(pointsBar.querySelectorAll('.point-label'));
    const idx = labels.indexOf(label);
    const punto = puntosSeleccionados[visor][idx];
    if (punto && punto.x && punto.y && punto.z) {
      const cam = getCameraById(visor === 1 ? 'indexViewer1' : 'viewer2');
      const controls = getControlsById(visor === 1 ? 'indexViewer1' : 'viewer2');
      if (cam && controls) {
        centerCameraOnPoint(cam, controls, punto, 2);
      }
      e.stopPropagation();
    }
  };

  canvas.addEventListener('mousemove', (e) => {
    if (!activePoint || activePoint.visor !== visor) {
      canvas.style.cursor = 'default';
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);

    let hovering = false;
    model.traverse((pt) => {
      if (!pt.isPoints) return;
      if (pt.name !== 'puntos_nube') return;
      pt.getWorldPosition(TEMP_VEC);
      const dist = TEMP_VEC.distanceTo(camera.position);
      const adapt = THREE.MathUtils.clamp(1.2 / dist, 0.8, 1.2);
      raycaster.params.Points.threshold = pt.material.userData.pickSize * adapt;
      const hits = raycaster.intersectObject(pt, false);
      if (hits.length) hovering = true;
    });
    canvas.style.cursor = hovering ? 'pointer' : 'default';
  });

  // --- RAYCAST SOLO SI HAY CAJA ACTIVA ---
  function activarRaycast() {
    function handler(e) {
      if (!activePoint || activePoint.visor !== visor) {
        return;
      }
      // Raycast
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
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

      if (!hits.length) {
        // No se ha tocado ningún punto
        return;
      }

      hits.sort((a, b) => a.distanceToRay - b.distanceToRay);
      const { object, index, point } = hits[0];

      // RESET COLOR DEL PUNTO PREVIO DE ESTE TIPO (SI EXISTE)
      const prev = puntosSeleccionados[visor][activePoint.index];
      if (prev && prev.vertexIndex !== undefined && prev.object && prev.object.geometry?.attributes?.color) {
        prev.object.geometry.attributes.color.setXYZ(prev.vertexIndex, 0.7, 0.7, 0.7);
        prev.object.geometry.attributes.color.needsUpdate = true;
      }

      // Cambia color según el punto (verde, azul, amarillo)
      const colorArr = POINT_COLORS[activePoint.index];
      const colors = object.geometry.attributes.color;

            if (!colors) {
        console.warn('❌ El objeto Points NO tiene atributo color', object);
        return;
        }
      colors.setXYZ(index, ...colorArr);
      colors.needsUpdate = true;
      object.geometry.attributes.color.needsUpdate = true;
      object.geometry.needsUpdate = true;

      // Guarda coordenadas y refs SOLO en la posición de la caja activa
      puntosSeleccionados[visor][activePoint.index] = {
        x: point.x.toFixed(4),
        y: point.y.toFixed(4),
        z: point.z.toFixed(4),
        vertexIndex: index,
        object: object
      };

      // Actualiza la caja: SOLO nombre y tooltip, NO estilos ni colores aquí
      const label = document.getElementById(`point${visor}-${activePoint.index + 1}`);
      if (label) {
        label.textContent = `Punto ${activePoint.index + 1}`;
        label.setAttribute('data-bs-toggle', 'tooltip');
        label.setAttribute(
          'title',
          `X: ${point.x.toFixed(4)}\nY: ${point.y.toFixed(4)}\nZ: ${point.z.toFixed(4)}`
        );
        if (window.bootstrap && window.bootstrap.Tooltip) {
          window.bootstrap.Tooltip.getInstance(label)?.dispose();
          new window.bootstrap.Tooltip(label);
        }
      }

      // ---- EMITE EVENTO PARA QUE pointPanelManager GESTIONE DISEÑO ----
      const event = new CustomEvent('puntoSeleccionado', {
        detail: {
          visor,
          puntoIndex: activePoint.index,           // 0, 1, 2
          color: BOX_COLORS[activePoint.index],    // color CSS
          labelId: `point${visor}-${activePoint.index + 1}`,
          coords: {
            x: point.x.toFixed(4),
            y: point.y.toFixed(4),
            z: point.z.toFixed(4)
          }
        }
      });
      window.dispatchEvent(event);

      // Desactiva selección de punto
      activePoint = null;
      canvas.removeEventListener('click', handler);
    }
    canvas.removeEventListener('click', handler);
    canvas.addEventListener('click', handler);
  }

  // Guarda la función para este visor en el registro global
  activarRaycastPorVisor[visor] = activarRaycast;
}

// Permite que el flujo externo active la selección de punto en el visor correcto
window.addEventListener('activarSeleccionPunto', (e) => {
  const { visor, index } = e.detail;
  activePoint = { visor, index };
  if (activarRaycastPorVisor[visor]) {
    activarRaycastPorVisor[visor]();
  }
});

export { puntosSeleccionados };

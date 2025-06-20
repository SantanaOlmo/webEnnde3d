// Ruta: ./js/ui/pointPanelManager.js
import * as THREE from 'three';
import { puntosSeleccionados } from '../scene/interaction/pointSelectionManager.js';
import { alignPoints } from '../scene/model/alignModel.js';   // <-- IMPORTA AQUÍ TU FUNCIÓN
import { getModelById } from '../scene/core/viewerRegistry.js';
import { exportGLB } from '../scene/model/modelLoader.js';
import { saveFileToIndexedDB } from '../scene/db/db-utils.js';


// -- Elementos base y referencias
const pointsBarIds = ['pointsBar1', 'pointsBar2'];
let pointsMenuVisible = false;

function getLabel(visor, punto) {
  return document.getElementById(`point${visor}-${punto}`);
}

// --- Parpadeo visual para los labels ---
let blinkInterval = null;
let currentBlinkBtn = null;
let currentBlinkClass = '';

export function startButtonBlink(btnElement, punto) {
  stopButtonBlink();
  if (!btnElement || ![1,2,3].includes(punto)) return;
  currentBlinkBtn = btnElement;
  currentBlinkClass = `blinking-${punto}`;
  btnElement.classList.add('active');
  blinkInterval = setInterval(() => {
    btnElement.classList.toggle(currentBlinkClass);
  }, 400);
}

export function stopButtonBlink() {
  if (blinkInterval) clearInterval(blinkInterval);
  if (currentBlinkBtn && currentBlinkClass) {
    currentBlinkBtn.classList.remove(currentBlinkClass);
    currentBlinkBtn.classList.remove('active');
  }
  currentBlinkBtn = null;
  currentBlinkClass = '';
}

function removeAllBlinkingClasses(label) {
  for (let i = 1; i <= 3; i++) {
    label.classList.remove(`blinking-${i}`);
  }
  label.classList.remove('active');
}

// --- Flujo guiado de selección de puntos ---
const selectionOrder = [
  { visor: 1, punto: 1 },
  { visor: 2, punto: 1 },
  { visor: 1, punto: 2 },
  { visor: 2, punto: 2 },
  { visor: 1, punto: 3 },
  { visor: 2, punto: 3 }
];
let selectionStep = 0;

function pedirSeleccionModelo(step) {
  if (step >= selectionOrder.length) return;
  const { visor, punto } = selectionOrder[step];
  // Avisar al sistema de selección de puntos para que active el raycast para ese visor y punto
  window.dispatchEvent(new CustomEvent('activarSeleccionPunto', { detail: { visor, index: punto-1 } }));
}

function blinkNextPoint() {
  if (selectionStep >= selectionOrder.length) return;
  const { visor, punto } = selectionOrder[selectionStep];
  const label = getLabel(visor, punto);
  if (label) {
    startButtonBlink(label, punto);
    pedirSeleccionModelo(selectionStep);
    console.log(`[UI] blinkNextPoint: Visor${visor} Punto${punto} (step ${selectionStep})`);
  }
}

// --- Menú de puntos (muestra/oculta y arranca el flujo)
const selectPointsBtn = document.getElementById('btn-selectPoints');
if (selectPointsBtn) {
  selectPointsBtn.addEventListener('click', () => {
    pointsMenuVisible = !pointsMenuVisible;
    pointsBarIds.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = pointsMenuVisible ? 'flex' : 'none';
    });
    if (pointsMenuVisible) {
      selectionStep = 0;
      blinkNextPoint();
      console.log(`[UI] Menú puntos mostrado, flujo arrancado step 0`);
    } else {
      stopButtonBlink();
      console.log(`[UI] Menú puntos oculto`);
    }
  });
}

// --- Permitir arrancar flujo desde cualquier botón al principio
for (let visor = 1; visor <= 2; visor++) {
  for (let punto = 1; punto <= 3; punto++) {
    const label = getLabel(visor, punto);
    if (!label) continue;
    label.addEventListener('click', () => {
      if (!pointsMenuVisible) return;
      if (selectionStep === 0) {
        selectionStep = selectionOrder.findIndex(
          o => o.visor === visor && o.punto === punto
        );
        blinkNextPoint();
        console.log(`[UI] Flujo iniciado en visor${visor} punto${punto} (step ${selectionStep})`);
      }
    });
  }
}

// --- Evento para controlar visual cuando se selecciona punto (flujo guiado)
window.addEventListener('puntoSeleccionado', (e) => {
  const { visor, puntoIndex, color } = e.detail;
  const label = getLabel(visor, puntoIndex + 1);
  if (label) {
    label.style.backgroundColor = color;
    removeAllBlinkingClasses(label);
  }
  if (currentBlinkBtn === label) stopButtonBlink();
  checkShowSuperponer();

  // --- AVANZA AL SIGUIENTE PUNTO DEL TOUR ---
  if (
    selectionStep < selectionOrder.length &&
    visor === selectionOrder[selectionStep].visor &&
    puntoIndex + 1 === selectionOrder[selectionStep].punto
  ) {
    selectionStep++;
    setTimeout(() => blinkNextPoint(), 200);
  }
});

// --- Evento para limpiar parpadeos si otros scripts actualizan puntos
window.addEventListener('actualizarPuntosSeleccionados', () => {
  for (let visor = 1; visor <= 2; visor++) {
    for (let i = 0; i < 3; i++) {
      const puntoObj = puntosSeleccionados[visor][i];
      if (puntoObj) {
        const label = getLabel(visor, i + 1);
        if (label) {
          removeAllBlinkingClasses(label);
        }
        if (currentBlinkBtn === label) stopButtonBlink();
      }
    }
  }
  checkShowSuperponer();
});

function checkShowSuperponer() {
  const todos = [...puntosSeleccionados[1], ...puntosSeleccionados[2]];
  const btnSuperponer = document.getElementById('btnSuperponerModelos');
  if (btnSuperponer) {
    if (todos.every(p => p !== null)) {
      btnSuperponer.classList.remove('d-none');
      btnSuperponer.style.display = 'block';
      console.log('[UI] Botón Superponer Modelos mostrado');
    } else {
      btnSuperponer.classList.add('d-none');
      btnSuperponer.style.display = 'none';
      console.log('[UI] Botón Superponer Modelos oculto');
    }
  }
}

const btnSuperponer = document.getElementById('btnSuperponerModelos');
if (btnSuperponer) {
  btnSuperponer.addEventListener('click', async () => {
    // --- Recoge los 6 puntos seleccionados ---
    let puntosA = puntosSeleccionados[1];
    let puntosB = puntosSeleccionados[2];

    // Seguridad: comprobamos que hay 3 puntos de cada
    if (!puntosA || !puntosB || puntosA.length < 3 || puntosB.length < 3 || puntosA.includes(null) || puntosB.includes(null)) {
      alert('Debes seleccionar 3 puntos en cada modelo antes de superponer.');
      return;
    }

    // --- Limpieza forzada: asegura que TODOS los campos son numbers ---
    function sanitizePointsArray(arr) {
      return arr.map(p => ({
        x: Number(p.x),
        y: Number(p.y),
        z: Number(p.z)
      }));
    }
    puntosA = sanitizePointsArray(puntosA);
    puntosB = sanitizePointsArray(puntosB);

    // --- CONVIERTE a Vector3 siempre con numbers ---
    function toVector3Array(arr) {
      return arr.map(p =>
        (p instanceof THREE.Vector3)
          ? p
          : new THREE.Vector3(Number(p.x), Number(p.y), Number(p.z))
      );
    }
    puntosA = toVector3Array(puntosA);
    puntosB = toVector3Array(puntosB);

    // LOG de depuración: ahora SIEMPRE serán numbers
    console.log('Puntos A:', puntosA);
    console.log('Puntos B:', puntosB);
    puntosA.forEach((p, i) => {
      console.log("DEBUG PUNTO", i, p, typeof p.x, typeof p.y, typeof p.z);
    });

    // --- Calcula la matriz de alineación ---
    const matrix = alignPoints(puntosA, puntosB);

    // --- Guarda la matriz serializada en localStorage ---
    console.log('Guardando matriz en localStorage:', matrix.elements);
    localStorage.setItem('matrix', JSON.stringify(matrix.elements));

    // --- Exporta y guarda ambos modelos antes de cambiar de pantalla ---
    const model1 = getModelById('indexViewer1');
    const model2 = getModelById('viewer2');
    if (!model1 || !model2) {
      alert('No se han encontrado ambos modelos en memoria.');
      return;
    }

    try {
      const blob1 = await exportGLB(model1);
      const blob2 = await exportGLB(model2);
      await saveFileToIndexedDB(blob1, 'finalModel_1');
      await saveFileToIndexedDB(blob2, 'finalModel_2');
    } catch (err) {
      alert('Error al exportar y guardar los modelos: ' + err);
      return;
    }

    // --- Ahora sí, redirige ---
    console.log("Redirigiendo en 15 segundos...");
    setTimeout(() => {
      window.location.href = '/views/viewerFinal.html?from=splitviewer';
    }, 15000);
  });
}



checkShowSuperponer();

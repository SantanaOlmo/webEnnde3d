// Ruta: ./js/ui/pointPanelManager.js
import { puntosSeleccionados } from '../scene/interaction/pointSelectionManager.js';

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

const btnSuperponer = document.querySelector('.btnSuperponer');
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

if (btnSuperponer) {
  btnSuperponer.addEventListener('click', () => {
    localStorage.setItem('fusionPoints', JSON.stringify(puntosSeleccionados));
    window.location.href = '/views/viewerNew.html?from=splitviewer';
  });
}

checkShowSuperponer();

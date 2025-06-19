// Ruta: ./js/ui/pointPanelManager.js
// Controla el menú de puntos, el parpadeo de los labels, y la lógica de mostrar el botón "Superponer Modelos" solo cuando están seleccionados los 6 puntos.

import { puntosSeleccionados } from '../scene/interaction/pointSelectionManager.js';

const pointsBarIds = ['pointsBar1', 'pointsBar2'];
let pointsMenuVisible = false;

// Referencias a los 6 labels de punto
const pointLabels = [
  document.getElementById('point1-1'),
  document.getElementById('point1-2'),
  document.getElementById('point1-3'),
  document.getElementById('point2-1'),
  document.getElementById('point2-2'),
  document.getElementById('point2-3')
];

const selectPointsBtn = document.getElementById('btn-selectPoints');
if (selectPointsBtn) {
  selectPointsBtn.addEventListener('click', () => {
    pointsMenuVisible = !pointsMenuVisible;
    pointsBarIds.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = pointsMenuVisible ? 'flex' : 'none';
    });
  });
}

// --- Parpadeo visual mejorado para los labels de punto ---
let blinkInterval = null;
let currentBlinkBtn = null;
let currentBlinkClass = '';

export function startButtonBlink(btnElement, punto) {
  stopButtonBlink();
  if (!btnElement || ![1,2,3].includes(punto)) return;

  currentBlinkBtn = btnElement;
  currentBlinkClass = `blinking-${punto}`;
  blinkInterval = setInterval(() => {
    btnElement.classList.toggle(currentBlinkClass);
  }, 400);
}

export function stopButtonBlink() {
  if (blinkInterval) clearInterval(blinkInterval);
  if (currentBlinkBtn && currentBlinkClass) {
    currentBlinkBtn.classList.remove(currentBlinkClass);
  }
  currentBlinkBtn = null;
  currentBlinkClass = '';
}

// --- Activar el parpadeo cuando se pulsa un punto (y detener al guardar coordenadas) ---
pointLabels.forEach((label, idx) => {
  if (!label) return;
  label.addEventListener('click', () => {
    // Saber si es del visor 1 o 2 y qué punto es
    const visor = idx < 3 ? 1 : 2;
    const punto = (idx % 3) + 1;
    startButtonBlink(label, punto);
  });
});

// --- ESCUCHA PARA DETENER PARPADEO CUANDO HAY NUEVAS COORDENADAS ---
window.addEventListener('actualizarPuntosSeleccionados', () => {
  // Recorre todos los puntos seleccionados, si alguno es nuevo, detén el parpadeo de su label
  for (let visor = 1; visor <= 2; visor++) {
    for (let i = 0; i < 3; i++) {
      const puntoObj = puntosSeleccionados[visor][i];
      // Si el punto está seleccionado (ya tiene coordenadas), deten el parpadeo
      if (puntoObj) {
        const label = document.getElementById(`point${visor}-${i+1}`);
        if (label) label.classList.remove(`blinking-${i+1}`);
        // Además, si era el que parpadeaba, resetea el interval
        if (currentBlinkBtn === label) stopButtonBlink();
      }
    }
  }
  checkShowSuperponer();
});

// --- Mostrar el botón de superponer modelos solo cuando estén los 6 puntos ---
const btnSuperponer = document.querySelector('.btnSuperponer');

function checkShowSuperponer() {
  const todos = [...puntosSeleccionados[1], ...puntosSeleccionados[2]];
  if (todos.every(p => p !== null)) {
    btnSuperponer.style.display = 'inline-block';
  } else {
    btnSuperponer.style.display = 'none';
  }
}

btnSuperponer.addEventListener('click', () => {
  localStorage.setItem('fusionPoints', JSON.stringify(puntosSeleccionados));
  window.location.href = '/views/viewerNew.html?from=splitviewer';
});

checkShowSuperponer();

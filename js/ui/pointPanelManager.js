// Ruta: js/scene/interaction/pointPanelManager.js
// Crea el panel de puntos en el visor si no existe, y gestiona el botón de "Superponer Modelos"
// Mostrando solo si están seleccionados los 6 puntos, enviando los datos a viewerNew.html

import { puntosSeleccionados } from './pointSelectionManager.js';

export function addPointPanel(viewerId) {
  const viewer = document.getElementById(viewerId);
  if (!viewer) return;

  // Evita duplicados
  if (viewer.querySelector('.point-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'point-panel d-none';
  panel.innerHTML = `
    <div class="point" data-point="1">Punto 1</div>
    <div class="point" data-point="2">Punto 2</div>
    <div class="point" data-point="3">Punto 3</div>
  `;

  viewer.appendChild(panel);
}

// --- Lógica de mostrar/ocultar el botón de superponer modelos solo cuando estén los 6 puntos ---

const btnSuperponer = document.querySelector('.btnSuperponer');

function checkShowSuperponer() {
  const todos = [...puntosSeleccionados[1], ...puntosSeleccionados[2]];
  if (todos.every(p => p !== null)) {
    btnSuperponer.style.display = 'inline-block';
  } else {
    btnSuperponer.style.display = 'none';
  }
}

// Escucha cambios de puntos (llama a esto tras cada selección exitosa)
window.addEventListener('actualizarPuntosSeleccionados', checkShowSuperponer);

// Al hacer click en el botón, guarda puntos y redirige al visor de fusión
btnSuperponer.addEventListener('click', () => {
  localStorage.setItem('fusionPoints', JSON.stringify(puntosSeleccionados));
  window.location.href = '/views/viewerNew.html?from=splitviewer';
});

// Inicializa el estado del botón al cargar
checkShowSuperponer();

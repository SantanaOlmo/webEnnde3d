// js/ui/syncToggle.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import { toggleSyncMode, isSyncMode } from './viewerSwitch.js';

export function initSyncToggleUI() {
  const button = document.getElementById('btn-material');

  if (!button) {
    return;
  }

  // Estilo inicial según estado
  function updateSyncUI() {
    const activo = isSyncMode();

    button.style.backgroundColor = activo ? 'limegreen' : '';
    button.title = activo ? 'Modo sincronizado activado' : 'Modo sincronizado desactivado';

    // Opcional: icono alternativo, clase o animación
    // button.classList.toggle('activo', activo);
  }

  button.addEventListener('click', () => {
    const nuevoEstado = toggleSyncMode();
    updateSyncUI();
  });

  updateSyncUI(); // estado inicial
}

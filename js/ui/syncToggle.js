// js/ui/syncToggle.js
import { toggleSyncMode, isSyncMode } from './viewerSwitch.js';

export function initSyncToggleUI() {
  const button = document.getElementById('btn-material');

  if (!button) {
    console.warn("🔗 Botón de sincronización no encontrado.");
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
    console.log(`🔄 SyncMode: ${nuevoEstado}`);
    updateSyncUI();
  });

  updateSyncUI(); // estado inicial
}

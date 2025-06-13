// js/viewer.js
import { getFileFromIndexedDB } from './scene/db/db-utils.js';
import { setupViewerScene } from './scene/initIndex.js';
import { loadHdriOptions } from '../../ui/loadHdriOptions.js';
import { setHdriEnvironment } from '../environment/hdriManager.js';

loadHdriOptions((path) => {
  setHdriEnvironment(path, scene, renderer);
});

const containerId = 'three-container';

async function init() {
  const dbKey = sessionStorage.getItem('viewerFileName');
  if (!dbKey) {
    console.warn("⚠️ No hay archivo cargado para visualizar.");
    return;
  }

  try {
    const file = await getFileFromIndexedDB(dbKey);
    if (!file) {
      console.error("❌ Archivo no encontrado en IndexedDB:", dbKey);
      return;
    }

    await setupViewerScene(containerId, file);
  } catch (err) {
    console.error("Error al iniciar visor:", err);
  }
}

init();

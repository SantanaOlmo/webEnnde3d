// js/viewer.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

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
    return;
  }

  try {
    const file = await getFileFromIndexedDB(dbKey);
    if (!file) {
      return;
    }

    await setupViewerScene(containerId, file);
  } catch (err) {
    // Error crítico, no mostrar por consola en versión final
  }
}

init();

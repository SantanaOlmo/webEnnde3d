// js/core/entrypoint.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import { setupDragAndDrop } from '../scene/utils/drag-drop-handler.js';
import { saveFileToIndexedDB } from '../scene/db/db-utils.js';

export function initSingleViewerDrop(dropArea, inputFile, dbKey = 'singleViewerFile', redirectTo = 'viewer.html') {
  setupDragAndDrop({
    dropArea,
    fileInput: inputFile,
    onFileDrop: async (file) => {
      if (!file.name.toLowerCase().match(/\.(glb|gltf|stl|stp)$/)) {
        alert("Formato no soportado.");
        return;
      }

      try {
        await saveFileToIndexedDB(dbKey, file);
        sessionStorage.setItem('viewerFileName', dbKey);
        window.location.href = redirectTo;
      } catch (e) {
        console.error("❌ Error guardando archivo:", e);
      }
    }
  });
}


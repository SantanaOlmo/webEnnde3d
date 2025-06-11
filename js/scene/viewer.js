// js/viewer.js
import { saveFileToIndexedDB, getFileFromIndexedDB } from './db-utils.js';
import { setupViewerScene } from './scene/index.js';

const containerId = 'three-container';
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');

// Lógica común para iniciar escena con un archivo
async function loadAndRenderFile(file) {
  try {
    await saveFileToIndexedDB(file.name, file);
    const fileFromDB = await getFileFromIndexedDB(file.name);
    await setupViewerScene(containerId, fileFromDB);
  } catch (err) {
    console.error('Error al cargar el archivo en la escena:', err);
  }
}

// Evento: input file
fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadAndRenderFile(file);
});

// Evento: drag & drop
dropArea?.addEventListener('dragover', (e) => e.preventDefault());
dropArea?.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) loadAndRenderFile(file);
});

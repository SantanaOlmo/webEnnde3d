console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

// Importa configuración de drag & drop y lógica de subida
import { setupDragAndDrop } from '../utils/drag-drop-handler.js';
import { handleFile as baseHandleFile } from '../scene/db/model-upload.js';

// Función que guarda el archivo y redirige al visor con el modelo
async function handleFileAndRedirect(file, viewerId) {
  await baseHandleFile(file, viewerId);
  sessionStorage.setItem('viewerFileName', `uploadedModel_${viewerId}`);

  // Redirige al visor con query identificando el visor
  window.location.href = `/views/viewerNew.html?viewerId=${viewerId}`;
}

// Configura zona de subida (drag and drop y file input)
setupDragAndDrop({
  dropArea: document.querySelector('#dropIndex1'),      
  fileInput: document.querySelector('#inputIndexFile1'), 
  onFileDrop: handleFileAndRedirect,                    
  viewerId: 'indexViewer1'                              
});
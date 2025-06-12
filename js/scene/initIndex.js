// js/initIndex.js
console.log('🚀 initIndex.js cargado');

import { setupDragAndDrop } from '../utils/drag-drop-handler.js';
import { handleFile as baseHandleFile } from '../scene/db/model-upload.js';

async function handleFileAndRedirect(file, viewerId) {
  await baseHandleFile(file, viewerId);
  sessionStorage.setItem('viewerFileName', `uploadedModel_${viewerId}`);
  window.location.href = `/views/viewerNew.html?viewerId=${viewerId}`;
}

setupDragAndDrop({
  dropArea: document.querySelector('#dropIndex1'),
  fileInput: document.querySelector('#inputIndexFile1'),
  onFileDrop: handleFileAndRedirect,
  viewerId: 'indexViewer1'
});

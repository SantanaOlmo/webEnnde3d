// js/utils/drag-drop-handler.js

export function setupDragAndDrop({ dropArea, fileInput = null, onFileDrop, viewerId = null }) {
  if (!dropArea) return;

  let activeViewer = viewerId;

  dropArea.addEventListener('dragenter', ev => {
    ev.preventDefault();
    dropArea.classList.add("drag-over");
    dropArea.style.color = 'white';
    dropArea.style.fontSize = '8em';
    dropArea.style.backgroundColor = 'rgb(20,20,20)';
  });

  dropArea.addEventListener('dragover', ev => ev.preventDefault());

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove("drag-over");
    resetViewerStyle(dropArea);
  });

  dropArea.addEventListener('drop', async (ev) => {
    ev.preventDefault();
    resetViewerStyle(dropArea);
    const file = ev.dataTransfer.files[0];
    if (file) {
      console.log(`📦 Archivo soltado en ${viewerId || dropArea.id}: ${file.name}`);
      await onFileDrop(file, activeViewer);
    }
  });

  // Si hay un input asociado y se permite click
  if (fileInput) {
    dropArea.addEventListener('click', () => {
      if (!dropArea.hasChildNodes() || dropArea.querySelector('canvas') === null) {
        activeViewer = viewerId;
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log(`📁 Archivo seleccionado manualmente: ${file.name}`);
        await onFileDrop(file, activeViewer);
        activeViewer = null;
      }
    });
  }
}

function resetViewerStyle(area) {
  area.style.color = 'rgb(48,48,48)';
  area.style.fontSize = '5em';
  area.style.backgroundColor = 'rgb(85,85,85)';
}

// js/utils/drag-drop-handler.js

/* Inicializa una zona de arrastrar y soltar para subir modelos 3D.
 * Puede usar también un input de archivo opcional. */
export function setupDragAndDrop({ dropArea, fileInput = null, onFileDrop, viewerId = null }) {
  if (!dropArea) return;

  let activeViewer = viewerId;

  // === EVENTOS PARA DRAG & DROP ===

  // Al entrar el archivo en la zona
  dropArea.addEventListener('dragenter', ev => {
    ev.preventDefault();
    dropArea.classList.add("drag-over");
  });

  // Al mantener el archivo encima
  dropArea.addEventListener('dragover', ev => ev.preventDefault());

  // Al salir sin soltarlo
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove("drag-over");
  });

  // Al soltar el archivo
  dropArea.addEventListener('drop', async (ev) => {
    ev.preventDefault();
    dropArea.classList.remove("drag-over");

    const file = ev.dataTransfer.files[0];
    const realViewerId = activeViewer || viewerId || dropArea.id;
    if (!realViewerId) {
      return;
    }
    if (file) {
      await onFileDrop(file, realViewerId);
    }
  });

  // === OPCIONAL: Soporte para input tipo file ===

  let bloqueandoInput = false;

  if (fileInput) {
    dropArea.addEventListener('click', (event) => {
      event.stopPropagation();
      const noCanvasCargado = !dropArea.hasChildNodes() || dropArea.querySelector('canvas') === null;
      if (noCanvasCargado && !bloqueandoInput) {
        activeViewer = viewerId;
        bloqueandoInput = true;
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        await onFileDrop(file, activeViewer);
        activeViewer = null;
        fileInput.value = '';
      }
      bloqueandoInput = false;
    });
  }
}

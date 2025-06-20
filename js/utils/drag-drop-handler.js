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
    dropArea.classList.add("drag-over"); // solo esto activa el estilo CSS correcto
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
    // === FIX ROBUSTO: Fuerza viewerId correcto ===
    const realViewerId = activeViewer || viewerId || dropArea.id;
    if (!realViewerId) {
      console.error('❌ No se puede determinar el viewerId para este drop. Comprueba el DOM y el setup.');
      return;
    }
    if (file) {
      console.log(`📦 Archivo soltado en ${realViewerId}: ${file.name}`);
      await onFileDrop(file, realViewerId);
    }
  });

  // === OPCIONAL: Soporte para input tipo file ===

  let bloqueandoInput = false;

  if (fileInput) {
  dropArea.addEventListener('click', (event) => {
      event.stopPropagation(); // <- EVITA doble apertura por burbuja
      console.log('CLICK en dropArea');
      const noCanvasCargado = !dropArea.hasChildNodes() || dropArea.querySelector('canvas') === null;
      if (noCanvasCargado && !bloqueandoInput) {
        activeViewer = viewerId;
        bloqueandoInput = true; // <-- ¡bloqueamos aquí!
        fileInput.click();
      }
  });

  fileInput.addEventListener('change', async (event) => {
      console.log('CHANGE en fileInput');
      const file = event.target.files[0];
      if (file) {
        console.log(`📁 Archivo seleccionado manualmente: ${file.name}`);
        await onFileDrop(file, activeViewer);
        activeViewer = null;
        fileInput.value = '';
      }
      bloqueandoInput = false; // <-- liberamos aquí
  });
}

}

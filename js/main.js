document.addEventListener("DOMContentLoaded", () => {

  // Cuando el archivo entra en la zona de drop
  function dragEnterHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add("drag-over"); // Añade efecto visual
  }

  // Mientras el archivo se mantiene encima
  function dragOverHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add("drag-over"); // Asegura efecto visual
  }

  // Cuando el archivo sale de la zona sin soltarse
  function dragLeaveHandler(ev) {
    ev.target.classList.remove("drag-over"); // Quita efecto visual
  }

  // Cuando se suelta el archivo sobre la zona
  function dropHandler(ev) {
    ev.preventDefault();

    const file = ev.dataTransfer.files[0];
    if (!file) return; // Si no hay archivo, salimos

    const reader = new FileReader();
    reader.onload = function(event) {
      // Guarda el contenido del archivo en sessionStorage
      sessionStorage.setItem('uploadedModel', event.target.result);
      // Redirige al visor 3D
      window.location.href = './views/viewer.html';
    };
    reader.readAsDataURL(file); // Lee el archivo como base64
  }

  // Seleccionamos la zona de subida y le asignamos eventos
  const dropArea = document.getElementById('drop_zone');
  dropArea.addEventListener('dragover', dragOverHandler);
  dropArea.addEventListener('dragenter', dragEnterHandler);
  dropArea.addEventListener('dragleave', dragLeaveHandler);
  dropArea.addEventListener('drop', dropHandler);

});

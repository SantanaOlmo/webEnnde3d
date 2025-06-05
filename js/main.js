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
  if (!file) return;

  const name = file.name.toLowerCase();

  if (!name.endsWith(".glb") && !name.endsWith(".gltf")) {
    alert("Solo se permiten archivos .glb o .gltf.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      sessionStorage.setItem('uploadedModel', event.target.result);
      window.location.href = './views/viewer.html';
    } catch (e) {
      alert("El archivo es demasiado grande para cargarse.");
      console.error("Error al guardar en sessionStorage:", e);
    }
  };

  reader.readAsDataURL(file);
}


  // Seleccionamos la zona de subida y le asignamos eventos
  const dropArea = document.getElementById('drop_zone');
  dropArea.addEventListener('dragover', dragOverHandler);
  dropArea.addEventListener('dragenter', dragEnterHandler);
  dropArea.addEventListener('dragleave', dragLeaveHandler);
  dropArea.addEventListener('drop', dropHandler);

});

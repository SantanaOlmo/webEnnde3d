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
async function dropHandler(ev) {
  ev.preventDefault();

  const file = ev.dataTransfer.files[0];
  if (!file) return;

  const name = file.name.toLowerCase();

  if (
    !name.endsWith(".glb") &&
    !name.endsWith(".gltf") &&
    !name.endsWith(".stl") &&
    !name.endsWith(".stp")
  ) {
    alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
    return;
  }

  try {
    await saveFileToIndexedDB(file);
    sessionStorage.setItem('uploadedModelName', name); // guardamos el nombre para usar en la otra página
    if(path.endsWith('index.html')){
      window.location.href = './views/viewer.html';
    }
  } catch (e) {
    console.error("Error guardando archivo en IndexedDB: " + e);
  }
}



  // Seleccionamos la zona de subida y le asignamos eventos
const dropArea = document.getElementById('drop_zone');
const path = window.location.pathname;

if (path.endsWith('index.html')) {
  dropArea.addEventListener('dragover', dragOverHandler);
  dropArea.addEventListener('dragenter', dragEnterHandler);
  dropArea.addEventListener('dragleave', dragLeaveHandler);
  dropArea.addEventListener('drop', dropHandler);
} else if (path.endsWith('viewer.html')) {
  dropArea.addEventListener('dragover', dragOverHandler);
  dropArea.addEventListener('dragenter', dragEnterHandler);
  dropArea.addEventListener('dragleave', dragLeaveHandler);
  dropArea.addEventListener('drop', dropHandler);
}

});

function saveFileToIndexedDB(file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ModelDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("models")) {
        db.createObjectStore("models");
      }
    };

    request.onerror = () => reject("Error abriendo IndexedDB");
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("models", "readwrite");
      const store = transaction.objectStore("models");

      const putRequest = store.put(file, "uploadedModel");
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject("Error guardando archivo");
    };
  });
}


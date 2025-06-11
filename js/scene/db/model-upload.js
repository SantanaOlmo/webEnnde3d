// js/scene/db/model-upload.js
import '../../../styles/style.css'; // ajusta la ruta si es necesario

import { saveFileToIndexedDB } from './db-utils.js';

console.log("model-upload.js cargado");

let onFileProcessed = () => {}; // función callback vacía
export function setOnFileProcessed(callback) {
  console.log("✔️ Callback onFileProcessed asignado");
  onFileProcessed = callback;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM completamente cargado");
  const dropArea1 = document.querySelector('.viewer1');
  const dropArea2 = document.querySelector('.viewer2');
  const inputFile = document.getElementById('inputFile');

  let activeViewer = null;

  function setupArea(area, viewerId) {
    console.log(`Configurando drop area para ${viewerId}`);
    area.addEventListener('dragenter', ev => {
      ev.preventDefault();
      area.classList.add("drag-over");
      area.style.color = 'white';
      area.style.fontSize = '8em';
      area.style.backgroundColor = 'rgb(20,20,20)';
    });

    area.addEventListener('dragover', ev => {
      ev.preventDefault();
    });
    area.addEventListener('dragleave', () => {
      area.classList.remove("drag-over");
      resetViewerStyle(area);
    });

    area.addEventListener('drop', ev => {
      console.log(`Archivo soltado en ${viewerId}`);
      resetViewerStyle(area);
      handleFileDrop(ev, viewerId);
    });

    area.addEventListener('click', () => {
    // Solo permitir el click si el visor está vacío (sin modelo cargado)
    if (!area.hasChildNodes() || area.querySelector('canvas') === null) {
      activeViewer = viewerId;
      console.log(`Click en ${viewerId}, esperando input file`);
      inputFile.click();
    }
});

  }

  inputFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && activeViewer) {
      console.log(`Archivo seleccionado manualmente para ${activeViewer}: ${file.name}`);
      await processFile(file, activeViewer);
      activeViewer = null;
    }
  });

  async function handleFileDrop(ev, viewerId) {
    console.log(`🧪 Drop recibido en ${viewerId}`);
    ev.preventDefault();
    const file = ev.dataTransfer.files[0];
    if (file) {
      console.log(`Procesando archivo soltado: ${file.name}`);
      await processFile(file, viewerId);
    }
  }

  async function processFile(file, viewerId) {
    const name = file.name.toLowerCase();
    console.log("✅ Procesando archivo en", viewerId);

    if (!name.endsWith(".glb") && !name.endsWith(".gltf") && !name.endsWith(".stl") && !name.endsWith(".stp")) {
      alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
      return;
    }

    try {
      console.log(`Guardando archivo en DB como uploadedModel_${viewerId}`);
      await saveFileToIndexedDB(file, `uploadedModel_${viewerId}`);
      sessionStorage.setItem(`uploadedModelName_${viewerId}`, name);
      console.log(`Archivo cargado en ${viewerId}: ${name}`);
      onFileProcessed(file, viewerId); // ← aquí se dispara la escena
    } catch (e) {
      console.error("Error guardando archivo en IndexedDB: " + e);
    }
  }

  setupArea(dropArea1, 'viewer1');
  setupArea(dropArea2, 'viewer2');
});

function resetViewerStyle(area) {
  area.style.color = 'rgb(48,48,48)';
  area.style.fontSize = '5em';
  area.style.backgroundColor = 'rgb(85,85,85)';
}

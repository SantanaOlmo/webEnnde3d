// js/scene/db/model-upload.js
import { setupDragAndDrop } from '../../utils/drag-drop-handler.js';
import { saveFileToIndexedDB } from './db-utils.js';

let onFileProcessed = () => {};
export function setOnFileProcessed(callback) {
  onFileProcessed = callback;
}

document.addEventListener("DOMContentLoaded", () => {
  const dropArea1 = document.querySelector('.viewer1');
  const dropArea2 = document.querySelector('.viewer2');
  const inputFile1 = dropArea1.querySelector('input[type="file"]');
  const inputFile2 = dropArea2.querySelector('input[type="file"]');

  async function handleFile(file, viewerId) {
    const name = file.name.toLowerCase();
    if (!name.match(/\.(glb|gltf|stl|stp)$/)) {
      alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
      return;
    }

    try {
      await saveFileToIndexedDB(file, `uploadedModel_${viewerId}`);
      sessionStorage.setItem(`uploadedModelName_${viewerId}`, name);
      onFileProcessed(file, viewerId);
    } catch (e) {
      console.error("Error al guardar archivo:", e);
    }
  }

  setupDragAndDrop({
    dropArea: dropArea1,
    fileInput: inputFile1,
    onFileDrop: handleFile,
    viewerId: 'viewer1'
  });

  setupDragAndDrop({
    dropArea: dropArea2,
    fileInput: inputFile2,
    onFileDrop: handleFile,
    viewerId: 'viewer2'
  });
});

// js/scene/db/model-upload.js
import { saveFileToIndexedDB } from './db-utils.js';

let onFileProcessed = () => {};
export function setOnFileProcessed(callback) {
  onFileProcessed = callback;
}

export async function handleFile(file, viewerId) {
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

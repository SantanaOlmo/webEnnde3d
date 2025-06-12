// js/scene/db/model-upload.js

// === Importa la función para guardar en IndexedDB ===
import { saveFileToIndexedDB } from './db-utils.js';

let onFileProcessed = () => {};

// Asigna callback opcional que se lanza tras procesar un archivo
export function setOnFileProcessed(callback) {
  onFileProcessed = callback;
}

// Valida extensión, guarda y gestiona un archivo 3D subido
export async function handleFile(file, viewerId) {
  const name = file.name.toLowerCase();
  if (!name.match(/\.(glb|gltf|stl|stp)$/)) {
    alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
    return;
  }

  try {
    // Guardar archivo en IndexedDB
    await saveFileToIndexedDB(file, `uploadedModel_${viewerId}`);
    sessionStorage.setItem(`uploadedModelName_${viewerId}`, name);
    onFileProcessed(file, viewerId);
  } catch (e) {
    console.error("❌ Error al guardar archivo:", e);
  }
}

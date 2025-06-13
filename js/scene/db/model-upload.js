// js/scene/db/model-upload.js

// === Importa la función para guardar en IndexedDB ===
import { saveFileToIndexedDB } from './db-utils.js';

let onFileProcessed = () => {};

// === Asigna callback opcional que se lanza tras procesar un archivo ===
export function setOnFileProcessed(callback) {
  onFileProcessed = callback;
}

// === Valida extensión, guarda y gestiona un archivo 3D subido ===
export async function handleFile(file) {
  const name = file.name.toLowerCase();
  if (!name.match(/\.(glb|gltf|stl|stp)$/)) {
    alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
    return;
  }

  try {
    // ⚠️ Usamos siempre el ID fijo "indexViewer1" como identificador del visor
    const viewerId = 'indexViewer1';

    // 💾 Guardamos el archivo en IndexedDB con clave fija para su recuperación posterior
    await saveFileToIndexedDB(file, `uploadedModel_${viewerId}`);

    // 🧠 Guardamos el nombre del archivo subido para mostrarlo si hace falta
    sessionStorage.setItem(`uploadedModelName_${viewerId}`, name);

    // 🔁 Guardamos el origen del visor para que splitViewer pueda cargarlo automáticamente
    localStorage.setItem("modeloOrigen", viewerId);

    // ✅ Notificamos que se ha procesado el archivo (por si hay callbacks activos)
    onFileProcessed(file, viewerId);
  } catch (e) {
    console.error("❌ Error al guardar archivo:", e);
  }
}

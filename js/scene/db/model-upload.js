// js/scene/db/model-upload.js

// === Importa la función para guardar en IndexedDB ===
import { saveFileToIndexedDB } from './db-utils.js';

let onFileProcessed = () => {};

// === Asigna callback opcional que se lanza tras procesar un archivo ===
export function setOnFileProcessed(callback) {
  onFileProcessed = callback;
}

// === Valida extensión, guarda y gestiona un archivo 3D subido ===
// Ahora acepta el `viewerId` como argumento para soportar múltiples visores
export async function handleFile(file, viewerId = 'indexViewer1') {
  const name = file.name.toLowerCase();
  if (!name.match(/\.(glb|gltf|stl|stp)$/)) {
    alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
    return;
  }

  try {
    // Guardamos el archivo en IndexedDB con clave basada en el viewerId
    await saveFileToIndexedDB(file, `uploadedModel_${viewerId}`);

    // Guardamos el nombre del archivo subido (útil si lo quieres mostrar)
    sessionStorage.setItem(`uploadedModelName_${viewerId}`, name);

    // Si se trata del visor individual, guarda el origen para splitViewer
    if (viewerId === 'indexViewer1') {
      localStorage.setItem("modeloOrigen", viewerId);
    }

    // Notificamos que se ha procesado el archivo (callback opcional)
    onFileProcessed(file, viewerId);
  } catch (e) {
    console.error("Error al guardar archivo:", e);
  }
}

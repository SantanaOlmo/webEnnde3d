// js/scene/db/db-utils.js

const DB_NAME = "ModelDB";
const STORE_NAME = "models";

console.log("📁 db-utils.js cargado");

// Guarda un archivo en IndexedDB bajo una clave específica
export function saveFileToIndexedDB(file, key = "uploadedModel") {
  console.log(`💾 Guardando archivo en IndexedDB con clave: ${key}`);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log("🗃️ Store creado en IndexedDB");
      }
    };

    request.onerror = () => reject("❌ Error abriendo IndexedDB");

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const putRequest = store.put(file, key);
      putRequest.onsuccess = () => {
        console.log("✅ Archivo guardado correctamente");
        resolve();
      };
      putRequest.onerror = () => reject("❌ Error guardando archivo");
    };
  });
}

// Recupera un archivo de IndexedDB mediante su clave
export function getFileFromIndexedDB(key = "uploadedModel") {
  console.log(`📤 Recuperando archivo con clave: ${key}`);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        console.log("📦 Archivo recuperado:", getRequest.result);
        resolve(getRequest.result);
      };
      getRequest.onerror = () => reject("❌ Error leyendo archivo");
    };

    request.onerror = () => reject("❌ Error abriendo IndexedDB");
  });
}


// js/scene/db/db-utils.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

const DB_NAME = "ModelDB";
const STORE_NAME = "models";

// Guarda un archivo en IndexedDB bajo una clave específica
export function saveFileToIndexedDB(file, key = "uploadedModel") {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onerror = () => reject("Error abriendo IndexedDB");

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const putRequest = store.put(file, key);
      putRequest.onsuccess = () => {
        resolve();
      };
      putRequest.onerror = () => reject("Error guardando archivo");
    };
  });
}

// Recupera un archivo de IndexedDB mediante su clave
export function getFileFromIndexedDB(key = "uploadedModel") {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
      getRequest.onerror = () => reject("Error leyendo archivo");
    };

    request.onerror = () => reject("Error abriendo IndexedDB");
  });
}

// js/scene/model/modelLoader.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { centerAndFitModel } from '../utils/centerFit.js';
import { guardarVertices, crearNubeDePuntos } from '../interaction/vertexUtils.js';
import { escalarModelo } from '../model/scaleModel.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { getRendererById } from '../core/viewerRegistry.js';

let gltfLoader, stlLoader;

function initLoaders() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('/libs/draco/');
    gltfLoader.setDRACOLoader(draco);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  if (!stlLoader) {
    stlLoader = new STLLoader();
  }
}

export function loadModel(scene, fileOrUrl) {
  return new Promise((resolve, reject) => {
    let url;
    let shouldRevoke = false;

    if (fileOrUrl instanceof Blob) {
      url = URL.createObjectURL(fileOrUrl);
      shouldRevoke = true;
    } else if (typeof fileOrUrl === "string") {
      url = fileOrUrl;
    } else {
      reject(new Error("Argumento inválido para loadModel (esperado Blob o string de URL)"));
      return;
    }

    const name = (fileOrUrl && fileOrUrl.name) ? fileOrUrl.name.toLowerCase() : 'model.glb';
    initLoaders();

    const prev = scene.userData.currentModel;
    if (prev) {
      scene.remove(prev);
      if (prev.userData.url) URL.revokeObjectURL(prev.userData.url);
    }

    function onLoad(obj) {
      obj.userData.url = url;

      obj.traverse(child => {
        if (child.isMesh && child.material) {
          child.userData.originalMaterial = child.material.clone();
        }
      });

      scene.add(obj);
      scene.userData.currentModel = obj;
      
      guardarVertices(obj);
      escalarModelo(obj);  
      centerAndFitModel(obj, scene);

      // Generar y añadir nube de puntos
      const nube = crearNubeDePuntos(obj);
      if (nube) {
        scene.add(nube);
        scene.userData.nubeDePuntos = nube;
        nube.visible = false;
      }

      if (shouldRevoke) URL.revokeObjectURL(url);
      resolve(obj);
    }

    function onError(err) {
      console.error('Error cargando modelo:', err);
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(err);
    }

    if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      gltfLoader.load(url, gltf => onLoad(gltf.scene), undefined, onError);
    } else if (name.endsWith('.stl')) {
      stlLoader.load(url, geometry => {
        geometry.rotateX(-Math.PI / 2);

        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center).negate();
        geometry.translate(center.x, center.y, center.z);

        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.originalMaterial = material.clone();
        onLoad(mesh);
      }, undefined, onError);
    } else {
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(new Error(`Formato no soportado: ${name}`));
    }
  });
}

// PARA CAMBIAR LOS DOS MODELOS AL VISOR : 
// Ruta: js/scene/model/modelLoader.js
export function loadModels(scene, files) {
  // files: array de archivos
  // Devuelve una promesa que resuelve con un array de modelos cargados
  const models = [];
  return Promise.all(
    files.map((file, i) => {
      return loadModelNoRemove(scene, file, i)
        .then(obj => {
          models.push(obj);
          return obj;
        });
    })
  ).then(() => models);
}

// Variante interna que NO elimina el modelo anterior, solo añade
export function loadModelNoRemove(scene, fileOrUrl) {
  return new Promise((resolve, reject) => {
    let url;
    let shouldRevoke = false;

    if (fileOrUrl instanceof Blob) {
      url = URL.createObjectURL(fileOrUrl);
      shouldRevoke = true;
    } else if (typeof fileOrUrl === "string") {
      url = fileOrUrl;
    } else {
      reject(new Error("Argumento inválido para loadModelNoRemove (esperado Blob o string de URL)"));
      return;
    }

    const name = (fileOrUrl && fileOrUrl.name) ? fileOrUrl.name.toLowerCase() : 'model.glb';
    initLoaders();

    function onLoad(obj) {
      obj.userData.url = url;

      obj.traverse(child => {
        if (child.isMesh && child.material) {
          child.userData.originalMaterial = child.material.clone();
        }
      });

      scene.add(obj);

      guardarVertices(obj);
      escalarModelo(obj);  
      centerAndFitModel(obj, scene);

      // Nube de puntos
      const nube = crearNubeDePuntos(obj);
      if (nube) {
        scene.add(nube);
        nube.visible = false;
      }

      if (shouldRevoke) URL.revokeObjectURL(url);
      resolve(obj);
    }

    function onError(err) {
      console.error('Error cargando modelo:', err);
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(err);
    }

    if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      gltfLoader.load(url, gltf => onLoad(gltf.scene), undefined, onError);
    } else if (name.endsWith('.stl')) {
      stlLoader.load(url, geometry => {
        geometry.rotateX(-Math.PI / 2);

        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center).negate();
        geometry.translate(center.x, center.y, center.z);

        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.originalMaterial = material.clone();
        onLoad(mesh);
      }, undefined, onError);
    } else {
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(new Error(`Formato no soportado: ${name}`));
    }
  });
}

// Variante solo para visor final: NO escalar, NO centrar, NO modificar nada tras cargar
export function loadModelRaw(scene, fileOrUrl) {
  return new Promise((resolve, reject) => {
    let url;
    let shouldRevoke = false;

    if (fileOrUrl instanceof Blob) {
      url = URL.createObjectURL(fileOrUrl);
      shouldRevoke = true;
    } else if (typeof fileOrUrl === "string") {
      url = fileOrUrl;
    } else {
      reject(new Error("Argumento inválido para loadModelRaw (esperado Blob o string de URL)"));
      return;
    }

    const name = (fileOrUrl && fileOrUrl.name) ? fileOrUrl.name.toLowerCase() : 'model.glb';
    initLoaders();

    function onLoad(obj) {
      obj.userData.url = url;
      scene.add(obj);

      if (shouldRevoke) URL.revokeObjectURL(url);
      resolve(obj);
    }

    function onError(err) {
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(err);
    }

    if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      gltfLoader.load(url, gltf => onLoad(gltf.scene), undefined, onError);
    } else if (name.endsWith('.stl')) {
      stlLoader.load(url, geometry => {
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        onLoad(mesh);
      }, undefined, onError);
    } else {
      if (shouldRevoke) URL.revokeObjectURL(url);
      reject(new Error(`Formato no soportado: ${name}`));
    }
  });
}

// Exporta un modelo Three.js a un Blob GLB listo para guardar en IndexedDB
export function exportGLB(model) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      model,
      glb => {
        const blob = new Blob([glb], { type: 'model/gltf-binary' });
        resolve(blob);
      },
      error => {
        reject(error);
      },
      { binary: true }
    );
  });
}
// js/scene/model/modelLoader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { centerAndFitModel } from '../utils/centerFit.js';
import { guardarVertices } from '../interaction/vertexUtils.js';
import { crearNubeDePuntos } from '../interaction/vertexUtils.js';
import { escalarModelo } from '../model/scaleModel.js';

let gltfLoader, stlLoader;

function initLoaders() {
  if (!gltfLoader) {
    console.log("Inicializando GLTFLoader");
    gltfLoader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('/libs/draco/');
    gltfLoader.setDRACOLoader(draco);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  if (!stlLoader) {
    console.log("Inicializando STLLoader");
    stlLoader = new STLLoader();
  }
}

export function loadModel(scene, file) {
  return new Promise((resolve, reject) => {
    console.log(`Iniciando carga del modelo: ${file.name}`);
    initLoaders();

    const name = file.name.toLowerCase();
    const url = URL.createObjectURL(file);

    const prev = scene.userData.currentModel;
    if (prev) {
      console.log("Eliminando modelo anterior...");
      scene.remove(prev);
      URL.revokeObjectURL(prev.userData.url);
    }

    function onLoad(obj) {
      console.log("Modelo cargado, procesando...");
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

      // === Generar y añadir nube de puntos ===
      const nube = crearNubeDePuntos(obj);
      if (nube) {
        scene.add(nube);
        scene.userData.nubeDePuntos = nube;
        nube.visible = false; // Opcional: empieza oculta
      }

        console.log("Modelo añadido a la escena correctamente.");
        resolve(obj);
      }

    function onError(err) {
      console.error('Error cargando modelo:', err);
      reject(err);
    }

    if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      console.log("Usando GLTFLoader");
      gltfLoader.load(url, gltf => onLoad(gltf.scene), undefined, onError);
    } else if (name.endsWith('.stl')) {
      console.log("Usando STLLoader");
      stlLoader.load(url, geometry => {
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.originalMaterial = material.clone();
        onLoad(mesh);
      }, undefined, onError);
    } else {
      reject(new Error(`Formato no soportado: ${file.name}`));
    }
  });
}

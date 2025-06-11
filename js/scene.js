// scene.js


//==================================================
//   IMPORTACIONES DE MODULOS NECESARIOS THREE.JS
//==================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { contain } from 'three/src/extras/TextureUtils.js';

//=============================
//    VARIABLES GLOBALES
//=============================

let scene, camera, renderer, controls, loader, loaderSTL;
let gridHelper, currentModel, axesHelper, cameraY;
let helper1, sphere1, line1;
let currentHDRI;
let play = false;
const container= document.getElementById('three-container');
const drop_zone=document.getElementById('drop_zone');
let cameraPositionX = document.getElementById('x');
let cameraPositionY = document.getElementById('y');
let cameraPositionZ = document.getElementById('z');
// let puntosMarcados = [];



// const modelName = localStorage.getItem('uploadedModelName'); // ya no se usa, ahora va por sessionStorage
// console.log("Nombre del archivo:", modelName);


//==================================================
//           CONFIGURACIÓN HDRI Y FONDOS          
//==================================================

// Cambiar HDRI desde un archivo
export function cambiarHDRI(nombreArchivo) {
  const rgbeLoader = new RGBELoader(); // Fondo HDRI (fondo + luz ambiental)
  rgbeLoader.load(`/assets/hdri/${nombreArchivo}`, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });
}

// Quitar HDRI y dejar fondo blanco
export function quitarHDRI() {
  scene.background = new THREE.Color(0xffffff); // fondo blanco por defecto
  scene.environment = null;
  currentHDRI = null;
}

// Cambiar color de fondo 
export function cambiarColorFondo(colorHex) {
  if (scene && renderer) {
    const color = new THREE.Color(colorHex);
    scene.background = color;
    renderer.setClearColor(color); // asegúrate de limpiar el fondo también
  }
}


//==================================================
//                INICIALIZAR ESCENA              
//==================================================

// Inicializa la escena 3D completa
export function initScene(container) {
  scene = new THREE.Scene();

  // Fondo HDRI por defecto (fondo + luz ambiental)
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/assets/hdri/campo.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });

  // Cámara en perspectiva
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  // Renderizador WebGL
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Controles orbitales (ratón)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Cuadrícula
  gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  // Ejes
  axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Luz direccional principal
  const directionalLight = new THREE.DirectionalLight('white', 0.25);
  directionalLight.position.set(5, 10, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Helper visual
  helper1 = new THREE.DirectionalLightHelper(directionalLight, 2, 'red');
  scene.add(helper1);

  // Esfera para representar posición de la luz
  sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  sphere1.position.copy(directionalLight.position);
  scene.add(sphere1);

  // Línea desde el origen a la luz
  const lineGeom1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    directionalLight.position.clone()
  ]);
  line1 = new THREE.Line(lineGeom1, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  scene.add(line1);

  // Controles de arrastre para la luz
  const dragControls = new DragControls([sphere1], camera, renderer.domElement);
  dragControls.addEventListener('dragstart', () => { controls.enabled = false; });
  dragControls.addEventListener('dragend', () => { controls.enabled = true; });
  dragControls.addEventListener('drag', (event) => {
    const pos = event.object.position;
    directionalLight.position.copy(pos);
    helper1.update();
    lineGeom1.setFromPoints([new THREE.Vector3(0, 0, 0), pos.clone()]);
  });

  // Otras luces direccionales
  /*scene.add(new THREE.DirectionalLight('white', 1).position.set(-5, -10, 7.5));
  scene.add(new THREE.DirectionalLight('white', 1).position.set(-180, -360, 20));*/

  // Loaders de modelos
  loader = new GLTFLoader();
  loaderSTL = new STLLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  loader.setMeshoptDecoder(MeshoptDecoder);

  // Ajustar al redimensionar
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Iniciar renderizado y cargar desde IndexedDB
  animate();
  autoLoadFromIndexedDB();

  // Teclas para cambio de vistas
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '4': camera.position.set(0, 5, 0); break;     // vista superior
      case '1': camera.position.set(0, 0, 5); break;     // frontal
      case '3': camera.position.set(0, -5, 0); break;    // inferior
      case '5': camera.position.set(0, 0, -5); break;    // trasera
      case '2': camera.position.set(5, 0, 0); break;     // lateral izquierda
      case '6': camera.position.set(0, 5, 0); break;     // lateral izquierda
      case '7': camera.position.set(-5, 0, 0); break;     // lateral izquierda
    }
    camera.lookAt(0, 0, 0);
    controls.update();
  });
}


//==================================================
//                 CARGA DE MODELOS               
//==================================================

// Carga un modelo desde archivo (GLB/GLTF, STL)
export function loadModel(url, name) {
  if (!loader || !loaderSTL) return;

  //--------------------------------------------
  //     CARGA DE ARCHIVOS GLB / GLTF
  //--------------------------------------------
  if (name.toLowerCase().endsWith('.glb') || name.toLowerCase().endsWith('.gltf')) {
    loader.load(url, (gltf) => {
      if (currentModel) scene.remove(currentModel);
      currentModel = gltf.scene;
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.userData.originalMaterial = child.material.clone();
        }
      });
      
      escalarModelo(currentModel);
      scene.add(currentModel);
      guardarVertices(currentModel);
      centerAndFitModel(currentModel);
      currentModel.traverse((child) => {
        if (child.isMesh) crearNubeDePuntos(child);
      });

      if (localStorage.getItem('estilos')) actualizarModelo();
      document.getElementById('loader-container').style.display='none';
      document.getElementById('contenido').style.visibility='visible';
    
    }, undefined, (error) => {
      console.error("Error cargando modelo:", error);
    });

  //--------------------------------------------
  //     CARGA DE ARCHIVOS STL
  //--------------------------------------------
  } else if (name.toLowerCase().endsWith('.stl')) {
    loaderSTL.load(url, (geometry) => {
      if (currentModel) scene.remove(currentModel);
      const material = new THREE.MeshStandardMaterial({});
      
      // ✅ CORREGIR ORIENTACIÓN: STL suele venir en Z-up, lo rotamos a Y-up
      geometry.rotateX(-Math.PI / 2);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.originalMaterial = material.clone();

      currentModel = mesh;
      escalarModelo(currentModel);
      scene.add(currentModel);
      guardarVertices(currentModel);
      currentModel.traverse((child) => {
        if (child.isMesh) crearNubeDePuntos(child);
      });

      centerAndFitModel(currentModel);
      if (localStorage.getItem('estilos')) actualizarModelo();
      document.getElementById('loader-container').style.display='none';
      document.getElementById('contenido').style.visibility='visible';
    }, undefined, (error) => {
      console.error("Error cargando STL:", error);
    });


  //--------------------------------------------
  //     ARCHIVO NO SOPORTADO
  //--------------------------------------------
  } else {
    alert("Formato de archivo no soportado. Usa .glb, .gltf o .stl");
  }
}

// Centra el modelo y ajusta la cámara para que encaje
function centerAndFitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const size = box.getSize(new THREE.Vector3());
  const dist = Math.max(size.x, size.y, size.z) * 1.5;
  camera.position.set(dist, dist, dist);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}

//==================================================
//             BUCLE DE RENDERIZADO               
//==================================================

// Bucle de renderizado y actualización
let angle = 0;
// Distancia constante de la cámara al centro (ajustable)
const radius = 5;

function animate() {
  requestAnimationFrame(animate);


  controls.update();
  renderer.render(scene, camera);

  cameraPositionX.textContent = redondear(camera.position.x, 3);
  cameraPositionY.textContent = redondear(camera.position.y, 3);
  cameraPositionZ.textContent = redondear(camera.position.z, 3);
}

function rotarCamara() {
  if (!play) return;
  angle += 0.001;
  camera.position.x = radius * Math.sin(angle);
  camera.position.z = radius * Math.cos(angle);
  
  camera.lookAt(0, 0, 0);

  controls.update();
  renderer.render(scene, camera);

  cameraPositionX.textContent = redondear(camera.position.x, 3);
  cameraPositionY.textContent = redondear(camera.position.y, 3);
  cameraPositionZ.textContent = redondear(camera.position.z, 3);

  requestAnimationFrame(rotarCamara);
}

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    play = !play;

    if (!play) {
   
      controls.update();
    } else {
      
      angle = Math.atan2(camera.position.x, camera.position.z);
      rotarCamara(); // Iniciar rotación
    }
  }
});
//==================================================
//               FUNCIONES AUXILIARES            
//==================================================

// Escala el modelo para que encaje en un cubo de 3 unidades
function escalarModelo(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const escalaDeseada = 8; // estándar (puedes ajustar)
  const factorEscala = escalaDeseada / maxDim;
  model.scale.setScalar(factorEscala);
}

  // Mostrar posición de cámara redondeada
  // Redondea número a n decimales
function redondear(num, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(num * factor) / factor;
}

// Actualiza el material del modelo cargado usando valores del localStorage
export function actualizarModelo() {
  const datos = JSON.parse(localStorage.getItem('estilos'));
  if (!datos) return;
  currentModel.traverse((child) => {
    if (child.isMesh) {
     
      // Solo aplicar nuevo material si el usuario lo ha cambiado
      const nuevoMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(datos.color),
        roughness: datos.roughness,
        metalness: datos.metalness,
      });
      
      // Guardar el original si aún no está guardado
      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material.clone();
      }
      child.material = nuevoMaterial;
      child.material.needsUpdate = true;
    }
  });
}

// =======================================================
//  FUNCIÓN PARA CAMBIAR EL MATERIAL DEL MODELO ACTUAL
// =======================================================
export function cambiarMaterial(tipo, colorWireframeManual) {
  if (!currentModel) return;

  currentModel.traverse((child) => {
    if (child.isPoints) return;

    if (child.isMesh) {
      // Guarda el material original si aún no se ha hecho
      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material.clone();
      }

      // ==========================================
      //            MODO MALLA (Wireframe)
      // ==========================================
      if (tipo === 'wireframe') {
        // Usa el color recibido por parámetro, o negro por defecto
        const colorWireframe = colorWireframeManual || '#000000';

        child.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(colorWireframe),
          wireframe: true,
        });

      // ==========================================
      //            MODO SÓLIDO (Standard)
      // ==========================================
      } else if (tipo === 'solido') {
        // Carga color, rugosidad y metalicidad desde localStorage
        const datos = JSON.parse(localStorage.getItem('estilos'));
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(datos?.color || '#ffffff'),
          roughness: datos?.roughness ?? 0.5,
          metalness: datos?.metalness ?? 0.5,
        });
      }

      // ⚠️ Asegura que el material se actualice en pantalla
      child.material.needsUpdate = true;
    }
  });
}


// Restaura los materiales originales guardados en userData.originalMaterial
export function restaurarMaterialesOriginales() {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh && child.userData.originalMaterial) {
      child.material = child.userData.originalMaterial.clone();
      child.material.needsUpdate = true;
      // Eliminar esferas marcadas con clics
      // puntosMarcados.forEach(p => scene.remove(p));
      // puntosMarcados = [];

    }
  });
}

// Alterna la visibilidad de la cuadrícula y los ejes
export function toggleHelpers(visible) {
  if (gridHelper) gridHelper.visible = visible;
  if (axesHelper) axesHelper.visible = visible;
  if (helper1) helper1.visible = visible;
  if (sphere1) sphere1.visible = visible;
  if (line1) line1.visible = visible;
}


//==================================================
//         INDEXEDDB: CARGA DE ARCHIVOS           
//==================================================

// Función para recuperar archivo desde IndexedDB
function getFileFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ModelDB", 1);
    request.onerror = () => reject("Error abriendo IndexedDB");
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("models", "readonly");
      const store = transaction.objectStore("models");
      const getRequest = store.get("uploadedModel");
      getRequest.onsuccess = () => {
        if (getRequest.result) resolve(getRequest.result);
        else reject("No se encontró archivo en IndexedDB");
      };
      getRequest.onerror = () => reject("Error leyendo archivo de IndexedDB");
    };
  });
}

// Nueva función para cargar el modelo desde IndexedDB
export async function autoLoadFromIndexedDB() {
  try {
    const file = await getFileFromIndexedDB();
    const modelName = sessionStorage.getItem('uploadedModelName') || 'model.glb';
    const url = URL.createObjectURL(file);
    loadModel(url, modelName);
  } catch (e) {
    console.error("Error cargando modelo desde IndexedDB:", e);
    alert("No se pudo cargar el modelo guardado. Por favor sube uno nuevo.");
  }
}


//==================================================
//         INTERACCIÓN: ROTACIÓN CON TECLAS       
//==================================================

// Slider para rotar el modelo con precisión manual
const rotationSlider = document.getElementById('rotationSlider');
if (rotationSlider) {
  rotationSlider.addEventListener('input', () => {
    if (currentModel) {
      const grados = parseFloat(rotationSlider.value);
      currentModel.rotation.y = THREE.MathUtils.degToRad(grados);
    }
  });
}

// Control por teclado para rotar el modelo (Q y E)
window.addEventListener('keydown', (event) => {
  if (!currentModel) return;
  switch (event.key.toLowerCase()) {
    case 'q': currentModel.rotation.y -= 0.1; break;
    case 'e': currentModel.rotation.y += 0.1; break;
    default: return;
  }

  // Sincroniza el valor del slider con la rotación actual (en grados)
  if (rotationSlider) {
    const grados = THREE.MathUtils.radToDeg(currentModel.rotation.y) % 360;
    rotationSlider.value = (grados < 0 ? grados + 360 : grados).toFixed(0);
  }
});

// =======================================
// GUARDAR VÉRTICES DEL MODELO
// =======================================
let verticesModelo = [];

function guardarVertices(model) {
  verticesModelo = []; // resetear si ya había algo
  model.traverse((child) => {
    if (child.isMesh && child.geometry && child.geometry.attributes.position) {
      const posiciones = child.geometry.attributes.position;
      for (let i = 0; i < posiciones.count; i++) {
        const vertice = new THREE.Vector3().fromBufferAttribute(posiciones, i);
        child.localToWorld(vertice); // Pasar a coordenadas globales
        verticesModelo.push(vertice);
      }
    }
  });
}


//==================================================
//        RAYCASTER PARA DETECTAR CLICS EN VÉRTICES
//==================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const DISTANCIA_MAXIMA = 0.05;

window.addEventListener('click', function (event) {
  if (!currentModel || !camera || !renderer) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const ray = raycaster.ray;
  let verticeMasCercano = null;
  let distanciaMasCorta = Infinity;

  verticesModelo.forEach((vertice) => {
    const distancia = ray.distanceToPoint(vertice);
    if (distancia < distanciaMasCorta && distancia < DISTANCIA_MAXIMA) {
      distanciaMasCorta = distancia;
      verticeMasCercano = vertice;
    }
  });

  if (verticeMasCercano) {
    console.log("Vértice clicado:", verticeMasCercano);
  }
});

//==================================================
//        NUBE DE PUNTOS A PARTIR DEL MESH
//==================================================

let puntosMesh = null;

function crearNubeDePuntos(mesh) {
  const geometry = mesh.geometry;

  // Calcular tamaño relativo de los puntos
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const averageSize = (size.x + size.y + size.z) / 3;
  const puntoSize = averageSize * 0.005; // Puedes subirlo si lo ves pequeño

  const material = new THREE.PointsMaterial({
    size: puntoSize,
    color: 0xff0000,
    sizeAttenuation: true,
    transparent: true,
    alphaTest: 0.5,
    depthWrite: false
  });

  puntosMesh = new THREE.Points(geometry, material);
  mesh.add(puntosMesh);
  puntosMesh.visible = false;
}

export function toggleNubeDePuntos(visible) {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh && child.children.length > 0) {
      child.children.forEach(c => {
        if (c.isPoints) c.visible = visible;
      });
    }
  });
}

/*
intentando hacer que viewer también tenga un dragover y no haga
falta volver hacia atrás para cargar otro archivo
  // Cuando el archivo entra en la zona de drop
  function dragEnterHandler(ev) {
    ev.preventDefault();
    drop_zone.style.display='flex';
  }

  // Mientras el archivo se mantiene encima
  function dragOverHandler(ev) {
    ev.preventDefault();
    drop_zone.style.display='flex';
  }

  // Cuando el archivo sale de la zona sin soltarse
  function dragLeaveHandler(ev) {
    drop_zone.style.display='none';
  }

  // Cuando se suelta el archivo sobre la zona
async function dropHandler(ev) {
  ev.preventDefault();

  const file = ev.dataTransfer.files[0];
  if (!file) return;

  const name = file.name.toLowerCase();

  if (
    !name.endsWith(".glb") &&
    !name.endsWith(".gltf") &&
    !name.endsWith(".stl") &&
    !name.endsWith(".stp")
  ) {
    alert("Solo se permiten archivos .glb, .gltf, .stl o .stp.");
    return;
  }

  try {
    await saveFileToIndexedDB(file);
    sessionStorage.setItem('uploadedModelName', name); // guardamos el nombre para usar en la otra página
    if(path.endsWith('index.html')){
      window.location.href = './views/viewer.html';
    }
  } catch (e) {
    alert("Error guardando archivo en IndexedDB: " + e);
  }
}



  // Seleccionamos la zona de subida y le asignamos eventos

const path = window.location.pathname;

if (path.endsWith('index.html')) {
  container.addEventListener('dragover', dragOverHandler);
  container.addEventListener('dragenter', dragEnterHandler);
  container.addEventListener('dragleave', dragLeaveHandler);
  container.addEventListener('drop', dropHandler);
} else if (path.endsWith('viewer.html')) {
  container.addEventListener('dragover', dragOverHandler);
  container.addEventListener('dragenter', dragEnterHandler);
  container.addEventListener('dragleave', dragLeaveHandler);
  container.addEventListener('drop', dropHandler);
}



function saveFileToIndexedDB(file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ModelDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("models")) {
        db.createObjectStore("models");
      }
    };

    request.onerror = () => reject("Error abriendo IndexedDB");
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("models", "readwrite");
      const store = transaction.objectStore("models");

      const putRequest = store.put(file, "uploadedModel");
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject("Error guardando archivo");
    };
  });
}
*/
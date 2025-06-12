// scene.js

//==================================================
//   IMPORTACIONES DE MÓDULOS NECESARIOS THREE.JS
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
let gridHelper, currentModel, axesHelper;
let helper1, sphere1, line1;
let currentHDRI;
let play = false;
const container   = document.getElementById('three-container');
const drop_zone   = document.getElementById('drop_zone');
let cameraPositionX = document.getElementById('x');
let cameraPositionY = document.getElementById('y');
let cameraPositionZ = document.getElementById('z');

//==================================================
//           CONFIGURACIÓN HDRI Y FONDOS
//==================================================

// Cambiar HDRI desde un archivo
export function cambiarHDRI(nombreArchivo) {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(`/assets/hdri/${nombreArchivo}`, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background  = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });
}

// Quitar HDRI y dejar fondo blanco
export function quitarHDRI() {
  scene.background  = new THREE.Color(0xffffff);
  scene.environment = null;
  currentHDRI = null;
}

// Cambiar color de fondo sólido
export function cambiarColorFondo(colorHex) {
  if (scene && renderer) {
    const color = new THREE.Color(colorHex);
    scene.background = color;
    renderer.setClearColor(color);
  }
}

//==================================================
//                INICIALIZAR ESCENA
//==================================================

export function initScene(container) {
  scene = new THREE.Scene();

  // Fondo HDRI por defecto
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/assets/hdri/campo.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background  = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });

  // Cámara (🔧 MOD: near=0.01 para evitar clipping de puntos)
  camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.01,
    1000
  );
  camera.position.set(2, 2, 2);

  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace        = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Controles orbitales
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Cuadrícula y ejes
  gridHelper  = new THREE.GridHelper(20, 20);
  axesHelper  = new THREE.AxesHelper(5);
  scene.add(gridHelper, axesHelper);

  // Luz direccional principal + helper + drag
  const directionalLight = new THREE.DirectionalLight('white', 0.25);
  directionalLight.position.set(5, 10, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  helper1 = new THREE.DirectionalLightHelper(directionalLight, 2, 'red');
  scene.add(helper1);

  sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  sphere1.position.copy(directionalLight.position);
  scene.add(sphere1);

  const lineGeom1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    directionalLight.position.clone()
  ]);
  line1 = new THREE.Line(lineGeom1, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  scene.add(line1);

  const dragControls = new DragControls([sphere1], camera, renderer.domElement);
  dragControls.addEventListener('dragstart', () => (controls.enabled = false));
  dragControls.addEventListener('dragend',   () => (controls.enabled = true));
  dragControls.addEventListener('drag', (e) => {
    const pos = e.object.position;
    directionalLight.position.copy(pos);
    helper1.update();
    lineGeom1.setFromPoints([new THREE.Vector3(0, 0, 0), pos.clone()]);
  });

  // Loaders
  loader     = new GLTFLoader();
  loaderSTL  = new STLLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  loader.setMeshoptDecoder(MeshoptDecoder);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Iniciar
  animate();
  autoLoadFromIndexedDB();

  // Vistas rápidas numpad-like
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '4': camera.position.set(0, 5, 0);  break; // top
      case '1': camera.position.set(0, 0, 5);  break; // front
      case '3': camera.position.set(0, -5, 0); break; // bottom
      case '5': camera.position.set(0, 0, -5); break; // back
      case '2': camera.position.set(5, 0, 0);  break; // right
      case '6': camera.position.set(0, 5, 0);  break;
      case '7': camera.position.set(-5,0, 0);  break; // left
    }
    camera.lookAt(0, 0, 0);
    controls.update();
  });
}

//==================================================
//                 CARGA DE MODELOS
//==================================================

export function loadModel(url, name) {
  if (!loader || !loaderSTL) return;

  // ---------- GLB / GLTF ----------
  if (name.toLowerCase().endsWith('.glb') || name.toLowerCase().endsWith('.gltf')) {
    loader.load(
      url,
      (gltf) => {
        if (currentModel) scene.remove(currentModel);
        currentModel = gltf.scene;

        currentModel.traverse((c) => {
          if (c.isMesh && c.material) c.userData.originalMaterial = c.material.clone();
        });

        escalarModelo(currentModel);
        scene.add(currentModel);
        guardarVertices(currentModel);
        currentModel.traverse((c) => {
          if (c.isMesh) crearNubeDePuntos(c);
        });
        centerAndFitModel(currentModel);

        if (localStorage.getItem('estilos')) actualizarModelo();
        document.getElementById('loader-container').style.display = 'none';
        document.getElementById('contenido').style.visibility      = 'visible';
      },
      undefined,
      (e) => console.error('Error cargando modelo:', e)
    );

  // ---------- STL ----------
  } else if (name.toLowerCase().endsWith('.stl')) {
    loaderSTL.load(
      url,
      (geometry) => {
        if (currentModel) scene.remove(currentModel);
        const material = new THREE.MeshStandardMaterial({});
        geometry.rotateX(-Math.PI / 2); // corregir orientación

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.originalMaterial = material.clone();
        currentModel = mesh;

        escalarModelo(currentModel);
        scene.add(currentModel);
        guardarVertices(currentModel);
        currentModel.traverse((c) => {
          if (c.isMesh) crearNubeDePuntos(c);
        });
        centerAndFitModel(currentModel);

        if (localStorage.getItem('estilos')) actualizarModelo();
        document.getElementById('loader-container').style.display = 'none';
        document.getElementById('contenido').style.visibility      = 'visible';
      },
      undefined,
      (e) => console.error('Error cargando STL:', e)
    );

  } else {
    alert('Formato no soportado. Usa .glb, .gltf o .stl.');
  }
}

// Centrar + cámara
function centerAndFitModel(model) {
  const box    = new THREE.Box3().setFromObject(model);
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

let angle = 0;
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

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    play = !play;
    if (!play) {
      controls.update();
    } else {
      angle = Math.atan2(camera.position.x, camera.position.z);
      rotarCamara();
    }
  }
});

//==================================================
//               FUNCIONES AUXILIARES
//==================================================

function escalarModelo(model) {
  const box     = new THREE.Box3().setFromObject(model);
  const size    = box.getSize(new THREE.Vector3());
  const factor  = 7 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(factor);
}

function redondear(num, d) {
  const f = Math.pow(10, d);
  return Math.round(num * f) / f;
}

//==================================================
//      ACTUALIZAR / RESTAURAR MATERIALES
//==================================================

export function actualizarModelo() {
  const datos = JSON.parse(localStorage.getItem('estilos'));
  if (!datos) return;
  currentModel.traverse((c) => {
    if (!c.isMesh) return;
    const nuevoMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(datos.color),
      roughness: datos.roughness,
      metalness: datos.metalness
    });
    if (!c.userData.originalMaterial) c.userData.originalMaterial = c.material.clone();
    c.material = nuevoMat;
    c.material.needsUpdate = true;
  });
}

export function cambiarMaterial(tipo, colorWireframeManual) {
  if (!currentModel) return;
  currentModel.traverse((c) => {
    if (!c.isMesh || c.isPoints) return;

    // Guarda el original una sola vez
    if (!c.userData.originalMaterial) c.userData.originalMaterial = c.material.clone();

    if (tipo === 'wireframe') {
      c.material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorWireframeManual || '#000000'),
        wireframe: true
      });
    } else if (tipo === 'solido') {
      const datos = JSON.parse(localStorage.getItem('estilos'));
      c.material = new THREE.MeshStandardMaterial({
        color:     new THREE.Color(datos?.color || '#ffffff'),
        roughness: datos?.roughness ?? 0.5,
        metalness: datos?.metalness ?? 0.5
      });
    }
    c.material.needsUpdate = true;
  });
}

export function restaurarMaterialesOriginales() {
  if (!currentModel) return;
  currentModel.traverse((c) => {
    if (c.isMesh && c.userData.originalMaterial) {
      c.material = c.userData.originalMaterial.clone();
      c.material.needsUpdate = true;
    }
  });
}

export function toggleHelpers(visible) {
  [gridHelper, axesHelper, helper1, sphere1, line1].forEach((h) => {
    if (h) h.visible = visible;
  });
}

//==================================================
//         INDEXEDDB: CARGA DE ARCHIVOS
//==================================================

function getFileFromIndexedDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('ModelDB', 1);
    req.onerror   = () => rej('Error abriendo IndexedDB');
    req.onsuccess = (e) => {
      const db  = e.target.result;
      const tx  = db.transaction('models', 'readonly');
      const st  = tx.objectStore('models');
      const grq = st.get('uploadedModel');
      grq.onsuccess = () =>
        grq.result ? res(grq.result) : rej('No se encontró archivo en IndexedDB');
      grq.onerror   = () => rej('Error leyendo archivo de IndexedDB');
    };
  });
}

export async function autoLoadFromIndexedDB() {
  try {
    const file      = await getFileFromIndexedDB();
    const modelName = sessionStorage.getItem('uploadedModelName') || 'model.glb';
    loadModel(URL.createObjectURL(file), modelName);
  } catch (e) {
    console.error('IndexedDB:', e);
    alert('No se pudo cargar el modelo guardado. Sube uno nuevo.');
  }
}

//==================================================
//   INTERACCIÓN: ROTACIÓN CON TECLAS + SLIDER
//==================================================

const rotationSlider = document.getElementById('rotationSlider');
if (rotationSlider) {
  rotationSlider.addEventListener('input', () => {
    if (currentModel) {
      currentModel.rotation.y = THREE.MathUtils.degToRad(parseFloat(rotationSlider.value));
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (!currentModel) return;
  if (e.key.toLowerCase() === 'q') currentModel.rotation.y -= 0.1;
  if (e.key.toLowerCase() === 'e') currentModel.rotation.y += 0.1;
  if (rotationSlider) {
    const grados = THREE.MathUtils.radToDeg(currentModel.rotation.y) % 360;
    rotationSlider.value = (grados < 0 ? grados + 360 : grados).toFixed(0);
  }
});

//==================================================
//        GUARDAR VÉRTICES DEL MODELO
//==================================================

let verticesModelo = [];

function guardarVertices(model) {
  verticesModelo = [];
  model.traverse((c) => {
    if (c.isMesh && c.geometry?.attributes?.position) {
      const pos = c.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        c.localToWorld(v);
        verticesModelo.push(v);
      }
    }
  });
}

//==================================================
//        RAYCASTER PARA VÉRTICES  (🔧 MOD)
//==================================================

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
let puntosSeleccionados = [];

const TEMP_VEC = new THREE.Vector3();   // fuera del listener (reutilizable)

window.addEventListener('click', (e) => {
  if (!currentModel) return;

  // 1. coords normalizadas
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // 2. recojo todos los impactos
  const hits = [];
  currentModel.traverse((pt) => {
    if (!pt.isPoints) return;

    // --- distancia del centro de la nube al ojo
    pt.getWorldPosition(TEMP_VEC);
    const dist = TEMP_VEC.distanceTo(camera.position);

    /*  FACTOR DE UMBRAL:
        - tamaño real del sprite (pickSize)
        - multiplicado por (distancia_relativa) para ampliar si está cerca
        - 0.8…1.2 es la escala que mejor funciona; ajusta si hace falta
    */
    const adapt = THREE.MathUtils.clamp( 1.2 / dist, 0.8, 1.2 );
    raycaster.params.Points.threshold = pt.material.userData.pickSize * adapt;

    hits.push(...raycaster.intersectObject(pt, false));
  });

  if (!hits.length) return;

  // 3. mejor impacto = mínima distancia al RAYO
  hits.sort((a, b) => a.distanceToRay - b.distanceToRay);
  const { object, index, point } = hits[0];

  // 4. pintar amarillo
  const colors = object.geometry.attributes.color;
  colors.setXYZ(index, 1, 1, 0);
  colors.needsUpdate = true;

  // 5. registrar coordenadas
  puntosSeleccionados.push({
    x: point.x.toFixed(4),
    y: point.y.toFixed(4),
    z: point.z.toFixed(4)
  });
  console.log('🎯', puntosSeleccionados.at(-1));
});



// justo después de crear raycaster
//raycaster.params.Points.threshold = 0.25;   // 0.25–0.3 suele ir bien


//==================================================
//        NUBE DE PUNTOS DESDE CADA MESH
//==================================================

function crearNubeDePuntos(mesh) {
  const geometry = mesh.geometry.clone();
  geometry.computeBoundingSphere();          // 🔧 MOD
  const count = geometry.attributes.position.count;

  // Colores iniciales (rojo)
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = 1; colors[i + 1] = 0; colors[i + 2] = 0;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.08,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
    transparent: true
  });

  // 👇 guardamos el tamaño para el picker
  material.userData.pickSize = material.size;

  const puntos = new THREE.Points(geometry, material);
  puntos.name  = 'puntos_nube';
  puntos.visible = true;
  mesh.add(puntos);
  mesh.userData.nubePuntos = puntos;
}

//==================================================
//        ACTIVAR / DESACTIVAR NUBE DE PUNTOS
//==================================================

export function toggleNubeDePuntos(visible) {
  if (!currentModel) return;
  currentModel.traverse((c) => {
    if (c.isPoints) c.visible = visible;
  });
  console.log('🔁 Nube de puntos:', visible);
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
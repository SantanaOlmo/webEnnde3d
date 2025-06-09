// scene.js

// Importaciones de módulos necesarios de Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { STLLoader } from 'three/examples/jsm/Addons.js';


// NUEVO: Importamos los decodificadores para modelos comprimidos
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';


// Variables globales
const modelUrl = localStorage.getItem('uploadedModelURL');
const modelName = localStorage.getItem('uploadedModelName');
let scene, camera, renderer, controls, loader, loaderSTL, gridHelper, currentModel, axesHelper;
let cameraPositionX = document.getElementById('x');
let cameraPositionY = document.getElementById('y');
let cameraPositionZ = document.getElementById('z');

// Variables para las luces direccionales
let helper1, sphere1, line1;

// VariableHDRI
let currentHDRI;

if (!modelUrl) {
  alert("No se ha cargado ningún modelo.");
} else {
  // Aquí puedes usar modelUrl con GLTFLoader, STLLoader, etc.
  console.log("URL del modelo cargado:", modelUrl);
  console.log("Nombre del archivo:", modelName);
}

// Cambiar HDRI desde un archivo
export function cambiarHDRI(nombreArchivo) {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(`/assets/hdri/${nombreArchivo}`, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    currentHDRI = texture;
  });
}

// Quitar HDRI y dejar fondo blanco
export function quitarHDRI() {
  scene.background = new THREE.Color(0xffffff); // blanco
  scene.environment = null;
  currentHDRI = null;
}

// Inicializa la escena 3D completa
export function initScene(container) {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color('red'); // para pruebas sin HDRI

  // Fondo HDRI (fondo + luz ambiental)
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('/assets/hdri/campo.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    currentHDRI = texture; // Guardamos para poder cambiarlo después
  });

  // Cámara en perspectiva
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  // Renderizador WebGL
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.physicallyCorrectLights = true; // iluminación físicamente correcta
  renderer.outputColorSpace = THREE.SRGBColorSpace; // espacio de color estándar
  container.appendChild(renderer.domElement);

  // Cuadrícula y ejes
  gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Controles orbitales (ratón)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Luces direccionales
  // Luz direccional 1
  const directionalLight = new THREE.DirectionalLight('white', 0.25);
  directionalLight.position.set(5, 10, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

// Helper visual para la luz direccional 1
const helper1 = new THREE.DirectionalLightHelper(directionalLight, 2, 'red'); // tamaño, color
scene.add(helper1);

  // Esfera en la posición de la luz
  const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  sphere1.position.copy(directionalLight.position);
  scene.add(sphere1);

// Línea desde el origen hacia la luz
const lineGeom1 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  directionalLight.position.clone()
]);
const line1 = new THREE.Line(
  lineGeom1,
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);
const dragControls = new DragControls([sphere1], camera, renderer.domElement);

// Desactiva orbit mientras haces drag
dragControls.addEventListener('dragstart', () => {
  controls.enabled = false;
});

dragControls.addEventListener('dragend', () => {
  controls.enabled = true;
});

// Mientras arrastras, actualiza la posición de la luz, el helper y la línea
dragControls.addEventListener('drag', (event) => {
  const pos = event.object.position;

  // Mueve la luz
  directionalLight.position.copy(pos);

  // Actualiza helper
  helper1.update();

  // Actualiza línea
  const newPoints = [new THREE.Vector3(0, 0, 0), pos.clone()];
  lineGeom1.setFromPoints(newPoints);
});

scene.add(line1);

  const directionalLight2 = new THREE.DirectionalLight('white', 1);
  directionalLight2.position.set(-5, -10, 7.5);
  directionalLight2.castShadow = true;
  scene.add(directionalLight2);

  const directionalLight3 = new THREE.DirectionalLight('white', 1);
  directionalLight3.position.set(-180, -360, 20);
  directionalLight3.castShadow = true;
  scene.add(directionalLight3);

  // Luz ambiental opcional
  /* const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight); */

  // NUEVO: Configuración del loader con decodificadores
  loader = new GLTFLoader();
  loaderSTL = new STLLoader();
  

  // Draco
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/libs/draco/'); // Ajusta esta ruta si mueves la carpeta
  loader.setDRACOLoader(dracoLoader);

  // Meshopt
  loader.setMeshoptDecoder(MeshoptDecoder);

  // Ajuste al redimensionar la ventana
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();              // Comienza el bucle de render
  autoLoadFromIndexedDB()  // Carga desde IndexedDB si hay algo

  window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '4': // vista superior
      camera.position.set(0, 5, 0); // Y alto, X y Z = 0
      camera.lookAt(0, 0, 0);
      break;

    case '1': 
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      break;

    case '3': // vista inferior
      camera.position.set(0, -5, 0); 
      camera.lookAt(0, 0, 0);
      break;

    case '5': // vista trasera
      camera.position.set(0, 0, -5);
      camera.lookAt(0, 0, 0);
      break;

    case '2': // vista lateral izq
      camera.position.set(5, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
  }

    // Si usas OrbitControls, actualízalo:
    controls.update();
  });
}

// Carga un modelo desde archivo (GLB/GLTF,STL)
export function loadModel(url, name) {
  if (!loader && !loaderSTL) {
    console.error("Scene not initialized. Call initScene(container) first.");
    return;
  }

  if (name.toLowerCase().endsWith('.glb') || name.toLowerCase().endsWith('.gltf')) {
    loader.load(
      url,
      (gltf) => {
        if (currentModel) {
          scene.remove(currentModel);
        }

        currentModel = gltf.scene;

        currentModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.userData.originalMaterial = child.material.clone();
          }
        });

        scene.add(currentModel);
        centerAndFitModel(currentModel);

        if (localStorage.getItem('estilos')) {
          actualizarModelo();
        }
      },
      undefined,
      (error) => {
        console.error("Error cargando modelo:", error);
        alert("Error al cargar el modelo. Verifica que sea un archivo .glb o .gltf válido.");
      }
    );

  } else if (name.toLowerCase().endsWith('.stl')) {
    loaderSTL.load(
      url,
      (geometry) => {
        if (currentModel) {
          scene.remove(currentModel);
        }

        const material = new THREE.MeshStandardMaterial({});
        const mesh = new THREE.Mesh(geometry, material);

        mesh.userData.originalMaterial = material.clone();

        currentModel = mesh;
        scene.add(currentModel);
        centerAndFitModel(currentModel);

        if (localStorage.getItem('estilos')) {
          actualizarModelo();
        }
      },
      undefined,
      (error) => {
        console.error("Error cargando STL:", error);
        alert("Error al cargar el modelo. Verifica que sea un archivo .stl válido.");
      }
    );

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
  const maxDim = Math.max(size.x, size.y, size.z);
  const dist = maxDim * 1.5;

  camera.position.set(dist, dist, dist);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}

// Bucle de renderizado y actualización
let angle = 0;
const radius = 5; // Distancia constante de la cámara al centro (ajustable)

function animate() {
  requestAnimationFrame(animate);

  /*// Incrementar el ángulo suavemente
  angle += 0.005;

  // Calcular la nueva posición de la cámara en un círculo
  camera.position.x = radius * Math.sin(angle);
  camera.position.z = radius * Math.cos(angle);
  camera.position.y = 1.5; // Altura constante de la cámara (ajustable)

  camera.lookAt(0, 0, 0); // La cámara siempre apunta al centro*/

  controls.update();
  renderer.render(scene, camera);

  // Mostrar posición de cámara redondeada
  cameraPositionX.textContent = redondear(camera.position.x, 3);
  cameraPositionY.textContent = redondear(camera.position.y, 3);
  cameraPositionZ.textContent = redondear(camera.position.z, 3);
}

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
        if (getRequest.result) {
          resolve(getRequest.result);
        } else {
          reject("No se encontró archivo en IndexedDB");
        }
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

// Restaura los materiales originales guardados en userData.originalMaterial
export function restaurarMaterialesOriginales() {
  if (!currentModel) {
    alert("No hay modelo cargado actualmente.");
    return;
  }

  currentModel.traverse((child) => {
    if (child.isMesh && child.userData.originalMaterial) {
      child.material = child.userData.originalMaterial.clone();
      child.material.needsUpdate = true;
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
// 🎯 Control por teclado para rotar el modelo (Q y E)
window.addEventListener('keydown', (event) => {
  if (!currentModel) return;

  switch (event.key.toLowerCase()) {
    case 'q': // Rota a la izquierda
      currentModel.rotation.y -= 0.1;
      break;
    case 'e': // Rota a la derecha
      currentModel.rotation.y += 0.1;
      break;
    default:
      return; // Ignora otras teclas
  }

  // 🔄 Sincroniza el valor del slider con la rotación actual (en grados)
  if (rotationSlider) {
    const grados = THREE.MathUtils.radToDeg(currentModel.rotation.y) % 360;
    rotationSlider.value = (grados < 0 ? grados + 360 : grados).toFixed(0);
  }
});


// 🎛️ Slider para rotar el modelo con precisión manual
const rotationSlider = document.getElementById('rotationSlider');
if (rotationSlider) {
  rotationSlider.addEventListener('input', () => {
    if (currentModel) {
      const grados = parseFloat(rotationSlider.value);
      currentModel.rotation.y = THREE.MathUtils.degToRad(grados);
    }
  });
}

export function cambiarColorFondo(colorHex) {
  if (scene && renderer) {
    const color = new THREE.Color(colorHex);
    scene.background = color;
    renderer.setClearColor(color); // por si acaso también afecta
  }
}


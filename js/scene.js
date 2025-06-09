// scene.js

// Importaciones de módulos necesarios de Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// NUEVO: Importamos los decodificadores para modelos comprimidos
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Variables globales
let scene, camera, renderer, controls, loader, gridHelper, currentModel, axesHelper;
let cameraPositionX = document.getElementById('x');
let cameraPositionY = document.getElementById('y');
let cameraPositionZ = document.getElementById('z');

// Variables para las luces direccionales
let helper1, sphere1, line1;

// VariableHDRI
let currentHDRI;

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
  helper1 = new THREE.DirectionalLightHelper(directionalLight, 2, 0xff0000); // tamaño, color
  scene.add(helper1);

  // Esfera en la posición de la luz
  sphere1 = new THREE.Mesh(
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

  line1 = new THREE.Line(
    lineGeom1,
    new THREE.LineBasicMaterial({ color: 0xff0000 })
  );
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
  autoLoadFromSession();  // Carga desde sessionStorage si hay algo

  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '1': // vista superior
        camera.position.set(0, 5, 0); // Y alto, X y Z = 0
        camera.lookAt(0, 0, 0);
        break;

      case '2': // vista lateral (ej: eje Z negativo)
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        break;

      case '3': // vista inferior
        camera.position.set(0, -5, 0); // Y negativo
        camera.lookAt(0, 0, 0);
        break;
    }

    // Si usas OrbitControls, actualízalo:
    controls.update();
  });
}

// Carga un modelo desde archivo (GLB/GLTF)
export function loadModel(file) {
  if (!loader) {
    console.error("Scene not initialized. Call initScene(container) first.");
    return;
  }

  const url = URL.createObjectURL(file);
  loader.load(
    url,
    (gltf) => {
      if (currentModel) {
        scene.remove(currentModel);
      }

      currentModel = gltf.scene;

      // 🔒 Guardar los materiales originales para poder restaurarlos más tarde
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.userData.originalMaterial = child.material.clone();
        }
      });

      scene.add(currentModel);
      centerAndFitModel(currentModel);

      // ✅ Aplicar estilos guardados si existen en sessionStorage
      if (sessionStorage.getItem('estilos')) {
        actualizarModelo();
      }
    },
    undefined,
    (error) => {
      console.error("Error cargando modelo:", error);
      alert("Error al cargar el modelo. Verifica que sea un archivo .glb o .gltf válido.");
    }
  );
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

// Carga automática de modelo desde sessionStorage
function autoLoadFromSession() {
  const base64 = sessionStorage.getItem('uploadedModel');

  if (!base64) {
    console.warn("No hay modelo en sessionStorage para cargar.");
    return;
  }

  try {
    const mimeMatch = base64.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'model/gltf-binary';
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], 'model.glb', { type: mimeType });

    loadModel(file);
  } catch (e) {
    console.error("Error al convertir y cargar modelo desde sessionStorage:", e);
    alert("El modelo no pudo cargarse desde sessionStorage. Asegúrate de haber subido un archivo válido.");
  }
}

// Redondea número a n decimales
function redondear(num, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(num * factor) / factor;
}

// Actualiza el material del modelo cargado usando valores del sessionStorage
export function actualizarModelo() {
  const datos = JSON.parse(sessionStorage.getItem('estilos'));
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


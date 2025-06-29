// js/scene/interaction/vertexRaycast.js
import * as THREE from 'three';
import { getModoVerticesActivo } from './vertexMode';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function setColorPunto(pointsObj, index, r, g, b, context = '') {
  if (!pointsObj || !pointsObj.geometry || !pointsObj.geometry.attributes.color) return;
  let col = pointsObj.geometry.attributes.color;
  console.log(`[${context}] setColorPunto idx ${index}: antes=`, col.getX(index), col.getY(index), col.getZ(index));
  col.setXYZ(index, r, g, b);
  col.needsUpdate = true;
  if (pointsObj.material) pointsObj.material.needsUpdate = true;
  console.log(`[${context}] setColorPunto idx ${index}: después=`, col.getX(index), col.getY(index), col.getZ(index));
}

export function initVertexRaycast(renderer, camera, model) {
  if (!renderer || !camera || !model || typeof getModoVerticesActivo !== 'function') return;
  if (renderer.domElement.__vertexRaycastInitialized) return;
  renderer.domElement.__vertexRaycastInitialized = true;

  const puntosSeleccionados = [];
  let ultimoHover = null;

  const SCALE_FACTOR = 1.03;

  // Esfera hover
  const hoverSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 })
  );
  hoverSphere.visible = false;
  model.parent.add(hoverSphere);

  // Esferas fijas para puntos seleccionados
  const seleccionSpheres = [];
  const seleccionData = [];

  function crearEsferaSeleccion(pos, puntoObj) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 })
    );
    sphere.position.copy(pos);
    model.parent.add(sphere);
    seleccionSpheres.push(sphere);
    seleccionData.push({ sphere, puntoObj });
    sphere.scale.setScalar((puntoObj.material.size || 0.03) * SCALE_FACTOR);
    return sphere;
  }

  function actualizarEscalaEsferas() {
    seleccionData.forEach(({ sphere, puntoObj }) => {
      const tamaño = puntoObj.material.size || 0.02;
      sphere.scale.setScalar(tamaño * SCALE_FACTOR);
    });
  }

  renderer.domElement.onPuntosSizeChanged = actualizarEscalaEsferas;

  // Para detectar si el mouse se mueve mucho entre down y up
  let pointerDownPos = null;
  let isDragging = false;
  const DRAG_THRESHOLD = 5; // píxeles

  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
    isDragging = false;
  });

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!pointerDownPos) return;
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    if (Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) {
      isDragging = true;
    }
  });

  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!getModoVerticesActivo() || isDragging) {
      pointerDownPos = null;
      isDragging = false;
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = [];
    model.traverse((pt) => {
      if (!pt.isPoints || pt.name !== 'puntos_nube' || !pt.visible) return; // Añadido pt.visible
      raycaster.params.Points.threshold = pt.material.size;
      hits.push(...raycaster.intersectObject(pt, false));
    });

    if (!hits.length) {
      console.log('[CLICK] No se ha seleccionado ningún punto.');
      pointerDownPos = null;
      return;
    }

    hits.sort((a, b) => a.distanceToRay - b.distanceToRay);
    const { object, index, point } = hits[0];

    const idx = puntosSeleccionados.findIndex(p => p.object === object && p.index === index);
    if (idx !== -1) {
      const sel = puntosSeleccionados[idx];
      model.parent.remove(sel.sphere);
      puntosSeleccionados.splice(idx, 1);
      const col = object.geometry.attributes.color;
      const originalColor = [
        col.getX(index),
        col.getY(index),
        col.getZ(index)
      ];
      setColorPunto(object, index, ...originalColor, 'DESELECT');
        } else {
      setColorPunto(object, index, 1, 1, 0, 'CLICK');
      // Aseguramos que la esfera aparece JUSTO en el vértice
      const posAttr = object.geometry.attributes.position;
      const vertexPos = new THREE.Vector3().fromBufferAttribute(posAttr, index);
      object.localToWorld(vertexPos);
      const sphere = crearEsferaSeleccion(vertexPos, object);
      puntosSeleccionados.push({ object, index, sphere });
    }


    pointerDownPos = null;
    isDragging = false;
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    if (!getModoVerticesActivo()) {
      hoverSphere.visible = false;
      renderer.domElement.style.cursor = '';
      ultimoHover = null;
      return;
    }
    if (!model) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const allHits = [];
    model.traverse((pt) => {
      if (pt.isPoints && pt.name === 'puntos_nube' && pt.visible) { // Añadido pt.visible
        raycaster.params.Points.threshold = pt.material.size;
        const hits = raycaster.intersectObject(pt, false);
        if (hits.length > 0) allHits.push(...hits);
      }
    });

    let hovered = null;
    if (allHits.length > 0) {
      allHits.sort((a, b) => a.distanceToRay - b.distanceToRay);
      hovered = allHits[0];
    }

    if (hovered) {
      if (!ultimoHover || hovered.object !== ultimoHover.object || hovered.index !== ultimoHover.index) {
        const posAttr = hovered.object.geometry.attributes.position;
        const vertexPos = new THREE.Vector3().fromBufferAttribute(posAttr, hovered.index);
        hovered.object.localToWorld(vertexPos);
        hoverSphere.position.copy(vertexPos);
      }
      hoverSphere.visible = true;

      const puntoSize = hovered.object.material.size || 0.03;
      hoverSphere.scale.setScalar(puntoSize * SCALE_FACTOR);

      renderer.domElement.style.cursor = 'pointer';
    } else {
      hoverSphere.visible = false;
      renderer.domElement.style.cursor = '';
    }

    ultimoHover = hovered ? { object: hovered.object, index: hovered.index } : null;
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    hoverSphere.visible = false;
    renderer.domElement.style.cursor = '';
    ultimoHover = null;
  });

  model.userData.vertexRaycastData = {
    puntosSeleccionados,
    seleccionSpheres,
    hoverSphere
  };
}

export function activarSeleccionDePunto({ model, camera, renderer, scene, viewerId, visor, index }) {
  if (!model || index == null) return;

  // Elimina esfera anterior si existe
  const existingSphere = scene.getObjectByName('punto_esfera');
  if (existingSphere) {
    scene.remove(existingSphere);
  }

  let targetVertex = null;

  model.traverse(child => {
    if (child.isPoints && child.name === 'puntos_nube' && child.geometry) {
      const positionAttr = child.geometry.attributes.position;
      if (index < positionAttr.count) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positionAttr, index);
        child.localToWorld(vertex); // 🔧 Esta línea transforma bien la posición
        targetVertex = vertex;
      }
    }
  });

  if (!targetVertex) return;

  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(targetVertex);
  sphere.name = 'punto_esfera';

  scene.add(sphere);
}

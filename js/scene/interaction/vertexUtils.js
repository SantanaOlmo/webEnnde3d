// js/scene/interaction/vertexUtils.js

import * as THREE from 'three';

export function guardarVertices(model) {
  const vertices = [];
  model.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const pos = child.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        child.localToWorld(v);
        vertices.push(v);
      }
    }
  });
  return vertices;
}

// === CREAR NUBE DE PUNTOS ===

// Asignar colores únicos por índice de mesh (ejemplo con varios colores)
const coloresBase = [
  [1, 0, 1], // violeta
  [0, 1, 1], // cyan
  [1, 0.5, 0], // naranja
  [0, 1, 0], // verde
  [1, 1, 0], // amarillo
  [0, 0, 1], // azul
];

export function crearNubeDePuntos(modelo) {
  // --- NUEVO: Cálculo de tamaño de modelo ---
  const boundingBox = new THREE.Box3().setFromObject(modelo);
  const bboxSize = boundingBox.getSize(new THREE.Vector3()).length();
  // Ajusta el factor a tu gusto (esto es "tamaño agradable" para 1px real en la mayoría de modelos)
  const puntoSizePorDefecto = bboxSize * 0.0025;  
  const pickSize = puntoSizePorDefecto * 1.2;    
  // -------------------------------------------

  // Guardar el tamaño para que el slider lo use por defecto
  // (Puedes guardar en el modelo, en window, o como prefieras)
  modelo.userData.tamanoPuntoDefecto = puntoSizePorDefecto;

  let meshIndex = 0;
  modelo.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const posAttr = child.geometry.attributes.position;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', posAttr.clone());

      const numVertices = posAttr.count;
      const colorArray = new Float32Array(numVertices * 3);

      // Escoge color base según índice (cíclico si hay más meshes que colores)
      const baseColor = coloresBase[meshIndex % coloresBase.length];
      meshIndex++;

      for (let i = 0; i < numVertices; i++) {
        colorArray[i * 3 + 0] = baseColor[0];
        colorArray[i * 3 + 1] = baseColor[1];
        colorArray[i * 3 + 2] = baseColor[2];
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

      // --- MODIFICADO: tamaño dinámico por defecto ---
      const material = new THREE.PointsMaterial({
        size: puntoSizePorDefecto,
        vertexColors: true,
        map: createCircleTexture(),
        alphaTest: 0.5,
        transparent: true,
        opacity: 1.0,
      });

      material.userData.pickSize = pickSize; // Tamaño de la esfera de selección
      // -----------------------------------------------

      const puntos = new THREE.Points(geometry, material);
      puntos.name = 'puntos_nube';
      puntos.visible = false;
      puntos.renderOrder = 1;

      child.children.forEach(obj => {
        if (obj.isPoints && obj !== puntos) obj.visible = false;
      });

      child.add(puntos);
      child.userData.nubePuntos = puntos;
    }
  });
}

function createCircleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}


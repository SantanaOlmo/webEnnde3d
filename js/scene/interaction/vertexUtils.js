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

export function crearNubeDePuntos(modelo) {
  let nubeCreada = false;

  modelo.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const posAttr = child.geometry.attributes.position;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', posAttr.clone());

      // === ASIGNAR COLORES INDIVIDUALES (RGB blanco por defecto) ===
      const numVertices = posAttr.count;
      const colorArray = new Float32Array(numVertices * 3);
      for (let i = 0; i < numVertices; i++) {
        colorArray[i * 3 + 0] = 1.0; // R
        colorArray[i * 3 + 1] = 0.0; // G
        colorArray[i * 3 + 2] = 1.0; // B
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true // Activar colores por vértice
      });

      // Tamaño para el raycaster
      material.userData.pickSize = 0.13;

      const puntos = new THREE.Points(geometry, material);
      puntos.name = 'puntos_nube';
      puntos.visible = false;

      // Añadir al mesh original
      child.add(puntos);
      child.userData.nubePuntos = puntos;

      nubeCreada = true;
    }
  });

  // Si no se pudo crear la nube, no mostramos ningún log ni advertencia
}



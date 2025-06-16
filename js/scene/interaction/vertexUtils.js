// js/scene/interaction/vertexUtils.js

import * as THREE from 'three';

export function guardarVertices(model) {
  console.log("guardando vértices del modelo...");
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
  console.log(`total vértices guardados: ${vertices.length}`);
  return vertices;
}

// === CREAR NUBE DE PUNTOS DESDE GEOMETRÍA DEL MODELO ===
export function crearNubeDePuntos(modelo) {
  let puntos = null;

  modelo.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', child.geometry.attributes.position);
      geometry.setDrawRange(0, child.geometry.attributes.position.count);

      const material = new THREE.PointsMaterial({
        color: 0xff00ff,
        size: 0.02
      });

      puntos = new THREE.Points(geometry, material);
      puntos.name = 'nubeDePuntos';
    }
  });

  if (!puntos) {
    console.warn("⚠️ No se pudo generar la nube de puntos: no se encontró ninguna malla válida.");
    return null;
  }

  return puntos;
}


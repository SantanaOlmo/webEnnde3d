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

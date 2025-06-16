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

// === CREAR NUBE DE PUNTOS ===

export function crearNubeDePuntos(modelo) {
  let nubeCreada = false;

  modelo.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const geometry = child.geometry.clone();
      geometry.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        color: 0xff00ff,
        size: 0.002
      });

      const puntos = new THREE.Points(geometry, material);
      puntos.name = 'puntos_nube';
      puntos.visible = false;

      // ✅ Añadir directamente al mesh original
      child.add(puntos);
      child.userData.nubePuntos = puntos;

      nubeCreada = true;
    }
  });

  if (!nubeCreada) {
    console.warn("⚠️ No se pudo generar la nube de puntos: no se encontró ninguna malla válida.");
  }
}


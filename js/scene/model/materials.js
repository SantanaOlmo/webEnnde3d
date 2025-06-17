// model/materials.js
import * as THREE from 'three';

// Aplica los estilos guardados (color, roughness, metalness)
export function aplicarEstilos(model, estilos) {
  if (!model || !estilos) return;

  const nuevoMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(estilos.color),
    roughness: estilos.roughness,
    metalness: estilos.metalness
  });

  model.traverse(child => {
    if (child.isMesh) {
      child.material = nuevoMaterial;
    }
  });
}

// Restaura el material original de cada malla
export function restaurarMaterialesOriginales(model) {
  if (!model) return;

  model.traverse(child => {
    if (child.isMesh && child.userData.originalMaterial) {
      child.material = child.userData.originalMaterial;
    }
  });
}

// Cambia entre modo wireframe o sólido (alternativa rápida de visualización)
export function cambiarMaterial(model, tipo, colorWireframeManual = '#000000') {
  if (!model) return;

  model.traverse((c) => {
    if (!c.isMesh || c.isPoints) return;
    if (!c.userData.originalMaterial) {
      c.userData.originalMaterial = c.material.clone();
    }

    if (tipo === 'wireframe') {
      c.material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorWireframeManual),
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

export function actualizarColorWireframe(modelo, nuevoColor) {
  modelo.traverse((c) => {
    if (c.isMesh && c.material.wireframe) {
      c.material.color = new THREE.Color(nuevoColor);
      c.material.needsUpdate = true;
    }
  });
}

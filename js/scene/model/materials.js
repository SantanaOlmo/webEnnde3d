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
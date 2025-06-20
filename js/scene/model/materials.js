// model/materials.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import * as THREE from 'three';

// Aplica los estilos guardados (color, roughness, metalness)
export function aplicarEstilos(model, estilos) {
  if (!model || !estilos) return;

  const nuevoMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(estilos.color),
    roughness: estilos.roughness,
    metalness: estilos.metalness,
    transmission: estilos.transmission ?? 0,
    thickness: estilos.thickness ?? 0,
    envMapIntensity: estilos.envMapIntensity ?? 1,
    transparent: estilos.transmission > 0 // importante
  });

  model.traverse(child => {
    if (child.isMesh) {
      child.material = nuevoMaterial;
      child.material.needsUpdate = true; // 👈 añade esto
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

// Asigna un material sólido de color (y guarda el original)
export function aplicarMaterialInicial(model, color = '#cccccc') {
  if (!model) return;
  model.traverse(child => {
    if (child.isMesh) {
      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material.clone();
      }
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.5,
        metalness: 0.2
      });
      child.material.needsUpdate = true;
    }
  });
}

export function aplicarToonShading(model, colores, thresholds) {
  if (!model || !colores || !thresholds) return;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < colores.length; i++) {
    const xStart = i === 0 ? 0 : (thresholds[i - 1] / 100) * canvas.width;
    const xEnd = (thresholds[i] / 100) * canvas.width;
    ctx.fillStyle = colores[i];
    ctx.fillRect(xStart, 0, xEnd - xStart, 1);
  }

  const gradientMap = new THREE.CanvasTexture(canvas);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;

  const toonMaterial = new THREE.MeshToonMaterial({
    color: 0xffffff, // base, pero el sombreado lo da el gradientMap
    gradientMap
  });

  model.traverse(child => {
    if (child.isMesh) {
      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material.clone();
      }
      child.material = toonMaterial;
      child.material.needsUpdate = true;
    }
  });
}

// Aplica una matriz de transformación 4x4 a todo el modelo (incluyendo jerarquías)
export function aplicarMatrizTransformacion(model, matriz) {
  if (!model || !matriz) return;

  // Convierte array a Matrix4 si es necesario
  const mat4 = Array.isArray(matriz)
    ? new THREE.Matrix4().fromArray(matriz)
    : matriz;

  model.applyMatrix4(mat4); // <- aplicar al root!

  model.updateMatrixWorld(true);
}

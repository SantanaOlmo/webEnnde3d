// js/scene/model/scaleModel.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

// Escala un modelo 3D en la escena de Three.js
// Esta función toma un modelo y lo escala para que su tamaño máximo sea 7 unidades
// de modo que se ajuste adecuadamente en la escena sin perder proporciones.
import * as THREE from 'three';

export function escalarModelo(modelo) {
  const box = new THREE.Box3().setFromObject(modelo);
  const size = box.getSize(new THREE.Vector3());
  const factor = 4 / Math.max(size.x, size.y, size.z);
  modelo.scale.setScalar(factor);
}

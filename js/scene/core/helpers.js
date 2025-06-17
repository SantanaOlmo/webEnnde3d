// scene/core/helpers.js
import * as THREE from 'three';

export function crearEjes(tamaño = 3) {
  const axesHelper = new THREE.AxesHelper(tamaño);
  axesHelper.name = 'helper_ejes';
  axesHelper.visible = false;
  return axesHelper;
}

export function crearGrid(size = 50, divisions = 100) {
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.name = 'helper_grid';
  gridHelper.material.opacity = 0.7;      // más opaco
  gridHelper.material.transparent = true;
  gridHelper.visible = false;
  gridHelper.position.y = -1.5;
  return gridHelper;
}


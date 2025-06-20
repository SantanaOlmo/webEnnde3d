// scene/core/helpers.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

import * as THREE from 'three';
import { getSceneById } from './viewerRegistry.js';

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

/* Modular: listeners para todos los bloques .helper-icons */
export function setupAllHelperIcons() {
  document.querySelectorAll('.helper-icons').forEach(helperBlock => {
    const btnAxes = helperBlock.querySelector('.toggleAxes, #toggleAxes');
    const btnGrid = helperBlock.querySelector('.toggleGrid, #toggleGrid');

    // Evita duplicidad de listeners: Clona los botones y reemplaza
    if (btnAxes) {
      const newBtnAxes = btnAxes.cloneNode(true);
      btnAxes.parentNode.replaceChild(newBtnAxes, btnAxes);
    }
    if (btnGrid) {
      const newBtnGrid = btnGrid.cloneNode(true);
      btnGrid.parentNode.replaceChild(newBtnGrid, btnGrid);
    }

    // Recupera los nuevos nodos tras clonar
    const btnAxesClean = helperBlock.querySelector('.toggleAxes, #toggleAxes');
    const btnGridClean = helperBlock.querySelector('.toggleGrid, #toggleGrid');

    let parentViewer = helperBlock.closest('.viewer1, .viewer2, #indexViewer1, #viewer2');
    let viewerId = parentViewer?.id;

    if (!viewerId && document.getElementById('indexViewer1')) {
      viewerId = 'indexViewer1';
    }

    btnAxesClean?.addEventListener('click', () => {
      const scene = getSceneById(viewerId);
      if (!scene) {
        return;
      }
      const axesHelper = scene.getObjectByName('helper_ejes');
      if (axesHelper) {
        axesHelper.visible = !axesHelper.visible;
      }
    });

    btnGridClean?.addEventListener('click', () => {
      const scene = getSceneById(viewerId);
      if (!scene) {
        return;
      }
      const gridHelper = scene.getObjectByName('helper_grid');
      if (gridHelper) {
        gridHelper.visible = !gridHelper.visible;
      }
    });
  });
}


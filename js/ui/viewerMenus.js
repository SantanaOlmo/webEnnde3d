// Ruta: js/ui/viewerMenus.js
import {
  getSceneById,
  getModelById
} from '../scene/core/viewerRegistry.js';

import {
  aplicarEstilos,
  restaurarMaterialesOriginales,
  cambiarMaterial
} from '../scene/model/materials.js';

import { toggleNubeDePuntos } from '../scene/interaction/vertexToggle.js';

import { applyToRelevantViewers } from '../scene/core/sceneSyncUtils.js';

document.addEventListener('DOMContentLoaded', () => {
  const btnWorld = document.getElementById('btn-world');
  const btnModelo = document.getElementById('btn-axes');
  const btnGoToCompare = document.getElementById('btn-goToCompare');

  const panelWorld = document.getElementById('menu-world');
  const panelModelo = document.getElementById('menu-modelo');
  const menuPanel = document.getElementById('menuPanel');
  menuPanel.classList.remove('show');
  menuPanel.style.display = 'none';

  let activePanel = null;

  const showPanel = (panel) => {
    menuPanel.style.display = 'block';
    menuPanel.classList.add('show');
    panel.classList.remove('d-none');
    activePanel = panel;
  };

  const hideAllPanels = () => {
    panelWorld.classList.add('d-none');
    panelModelo.classList.add('d-none');
    menuPanel.classList.remove('show');
    menuPanel.style.display = 'none';
    activePanel = null;
  };

  btnWorld?.addEventListener('click', () => {
    activePanel === panelWorld ? hideAllPanels() : (hideAllPanels(), showPanel(panelWorld));
  });

  btnModelo?.addEventListener('click', () => {
    activePanel === panelModelo ? hideAllPanels() : (hideAllPanels(), showPanel(panelModelo));
  });

  if (btnGoToCompare) {
    btnGoToCompare.addEventListener('click', () => {
      localStorage.setItem("modeloOrigen", "indexViewer1");
      localStorage.setItem("from", "viewer");
      window.location.href = "/views/splitViewer.html?from=viewer";
    });
  }

  const formModelo = document.getElementById('formStyles');
  formModelo?.addEventListener('input', () => {
    const datos = Object.fromEntries(new FormData(formModelo).entries());
    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;
    localStorage.setItem('estilos', JSON.stringify(datos));

    applyToRelevantViewers(({ model }) => {
      if (model) aplicarEstilos(model, datos);
    });
  });

  const btnReset = document.getElementById('resetEstilos');
  btnReset?.addEventListener('click', () => {
    applyToRelevantViewers(({ model }) => {
      if (!model) return;
      restaurarMaterialesOriginales(model);
    });

    localStorage.removeItem("estilos");

    if (formModelo) {
      formModelo.elements["color"].value = "#ffffff";
      formModelo.elements["roughness"].value = 500;
      formModelo.elements["metalness"].value = 500;
    }
  });

  const btnWireframe = document.getElementById('wireframe');
  const btnSolido = document.getElementById('solido');
  const btnPuntos = document.getElementById('togglePuntos');

  btnWireframe?.addEventListener('click', () => {
    applyToRelevantViewers(({ model }) => {
      if (model) cambiarMaterial(model, 'wireframe', '#000000');
    });
  });

  btnSolido?.addEventListener('click', () => {
    applyToRelevantViewers(({ model }) => {
      if (model) cambiarMaterial(model, 'solido');
    });
  });

  btnPuntos?.addEventListener('click', () => {
    applyToRelevantViewers(({ model }) => {
      if (model) toggleNubeDePuntos(model);
    });
  });

  const btnEjes = document.getElementById('toggleAxes');
  const btnGrid = document.getElementById('toggleGrid');

  setTimeout(() => {
    applyToRelevantViewers(({ scene }) => {
      btnEjes?.addEventListener('click', () => {
        const ejes = scene.getObjectByName('helper_ejes');
        if (ejes) ejes.visible = !ejes.visible;
      });

      btnGrid?.addEventListener('click', () => {
        const grid = scene.getObjectByName('helper_grid');
        if (grid) grid.visible = !grid.visible;
      });
    });
  }, 200);
});

import { toggleSyncMode } from './viewerSwitch.js';

const btnSync = document.getElementById('btn-material');
btnSync?.addEventListener('click', () => {
  const sync = toggleSyncMode();
  btnSync.style.backgroundColor = sync ? 'green' : '';
});
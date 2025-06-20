// js/ui/viewerMenus.js
import {
  getSceneById,
  getModelById
} from '../scene/core/viewerRegistry.js';

import {
  aplicarEstilos,
  restaurarMaterialesOriginales,
  cambiarMaterial,
  actualizarColorWireframe,
  aplicarToonShading
} from '../scene/model/materials.js';

import { toggleNubeDePuntos } from '../scene/interaction/vertexToggle.js';
import { applyToRelevantViewers } from '../scene/core/sceneSyncUtils.js';
import { toggleSyncMode } from './viewerSwitch.js';
import { setupAllHelperIcons } from '../scene/core/helpers.js';

function debounce(callback, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // --- BOTONES Y ELEMENTOS PRINCIPALES ---
  const btnWorld = document.getElementById('btn-world');
  const btnModelo = document.getElementById('btn-axes');
  const btnInfo = document.getElementById('btn-info');
  const btnGoToCompare = document.getElementById('btn-goToCompare');

  const panelWorld = document.getElementById('menu-world');
  const panelModelo = document.getElementById('menu-modelo');
  const panelInfo = document.getElementById('menu-info');

  const menuPanel = document.getElementById('menuPanel');
  const formModelo = document.getElementById('formStyles');
  const btnReset = document.getElementById('resetEstilos');

  menuPanel.classList.remove('show');
  menuPanel.style.display = 'none';
  let activePanel = null;

  // --- PANEL DE MENÚS LATERAL ---
  const showPanel = (panel) => {
    menuPanel.style.display = 'block';
    menuPanel.classList.add('show');
    panel.classList.remove('d-none');
    activePanel = panel;
  };

  const hideAllPanels = () => {
    panelWorld.classList.add('d-none');
    panelModelo.classList.add('d-none');
    panelInfo.classList.add('d-none');
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

  btnInfo?.addEventListener('click', () => {
    activePanel === panelInfo ? hideAllPanels() : (hideAllPanels(), showPanel(panelInfo));
  });

  if (btnGoToCompare) {
    btnGoToCompare.addEventListener('click', () => {
      localStorage.setItem("modeloOrigen", "indexViewer1");
      localStorage.setItem("from", "viewer");
      window.location.href = "/views/splitViewer.html?from=viewer";
    });
  }

  // --- FORMULARIO DE ESTILOS (CON TRANSPARENCIA, GROSOR Y REFLEJO) ---
  const debouncedUpdateMaterial = debounce(() => {
    const datos = Object.fromEntries(new FormData(formModelo).entries());

    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;
    datos.transmission = parseFloat(formModelo.elements["transmissionSlider"].value);
    datos.thickness = parseFloat(formModelo.elements["thicknessSlider"].value);
    datos.envMapIntensity = parseFloat(formModelo.elements["envMapSlider"].value);

    localStorage.setItem('estilos', JSON.stringify(datos));

    applyToRelevantViewers(({ model }) => {
      if (model) aplicarEstilos(model, datos);
    });
  }, 200);

  formModelo?.addEventListener('input', debouncedUpdateMaterial);

  // --- CAMBIO DE COLOR DE LA MALLA ---
  const wireframeColorInput = document.getElementById('wireframeColor');
  wireframeColorInput?.addEventListener("input", () => {
    const color = wireframeColorInput.value;
    applyToRelevantViewers(({ model }) => {
      if (model) {
        cambiarMaterial(model, "wireframe", color);
        actualizarColorWireframe(model, color);
      }
    });
  });

  // --- RESET ESTILOS ---
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
      formModelo.elements["transmissionSlider"].value = 0;
      formModelo.elements["thicknessSlider"].value = 0;
      formModelo.elements["envMapSlider"].value = 1.5;
    }
  });

  // --- BOTONES VISUALES ---
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

  // --- SYNC BOTÓN ---
  const btnSync = document.getElementById('btn-material');
  btnSync?.addEventListener('click', () => {
    const sync = toggleSyncMode();
    btnSync.style.backgroundColor = sync ? 'green' : '';
  });

  // --- TOON SHADING: Listener del panel ---
  const toonPanel = document.getElementById('toonShadingPanel');

  toonPanel?.addEventListener('input', () => {
    const colorInputs = [...toonPanel.querySelectorAll('.toon-color')];
    const rangeInputs = [...toonPanel.querySelectorAll('.toon-range')];

    const colors = colorInputs.map(input => input.value);
    const thresholds = rangeInputs.map(input => parseInt(input.value));

    applyToRelevantViewers(({ model }) => {
      if (!model) return;
      aplicarToonShading(model, colors, thresholds);
    });
  });

});

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
import { updateOutlines } from '../scene/model/outlinePass.js';

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
    if (panelWorld) panelWorld.classList.add('d-none');
    if (panelModelo) panelModelo.classList.add('d-none');
    if (panelInfo) panelInfo.classList.add('d-none');
    if (menuPanel) {
      menuPanel.classList.remove('show');
      menuPanel.style.display = 'none';
    }
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

    // --- Detecta modo "viewerFinal" (dos modelos, cambiar y/o linked) ---
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        aplicarEstilos(window.model1, datos);
        aplicarEstilos(window.model2, datos);
      } else {
        aplicarEstilos(window.activeModel, datos);
      }
    } else {
      // Flujo normal: split, viewer simple, etc
      applyToRelevantViewers(({ model }) => {
        if (model) aplicarEstilos(model, datos);
      });
    }
  }, 200);

  formModelo?.addEventListener('input', debouncedUpdateMaterial);

  // --- CAMBIO DE COLOR DE LA MALLA ---
  const wireframeColorInput = document.getElementById('wireframeColor');
  wireframeColorInput?.addEventListener("input", () => {
    const color = wireframeColorInput.value;
    // Si estamos en viewerFinal con dos modelos:
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        cambiarMaterial(window.model1, "wireframe", color);
        actualizarColorWireframe(window.model1, color);
        cambiarMaterial(window.model2, "wireframe", color);
        actualizarColorWireframe(window.model2, color);
      } else {
        cambiarMaterial(window.activeModel, "wireframe", color);
        actualizarColorWireframe(window.activeModel, color);
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) {
          cambiarMaterial(model, "wireframe", color);
          actualizarColorWireframe(model, color);
        }
      });
    }
  });

  // --- RESET ESTILOS ---
  btnReset?.addEventListener('click', () => {
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        restaurarMaterialesOriginales(window.model1);
        restaurarMaterialesOriginales(window.model2);
      } else {
        restaurarMaterialesOriginales(window.activeModel);
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (!model) return;
        restaurarMaterialesOriginales(model);
      });
    }

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
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        cambiarMaterial(window.model1, 'wireframe', '#000000');
        cambiarMaterial(window.model2, 'wireframe', '#000000');
      } else {
        cambiarMaterial(window.activeModel, 'wireframe', '#000000');
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) {
          cambiarMaterial(model, 'wireframe', '#000000');
        }
      });
    }
  });

  btnSolido?.addEventListener('click', () => {
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        cambiarMaterial(window.model1, 'solido');
        cambiarMaterial(window.model2, 'solido');
      } else {
        cambiarMaterial(window.activeModel, 'solido');
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) {
          cambiarMaterial(model, 'solido');
        }
      });
    }
  });

  btnPuntos?.addEventListener('click', () => {
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        toggleNubeDePuntos(window.model1);
        toggleNubeDePuntos(window.model2);
      } else {
        toggleNubeDePuntos(window.activeModel);
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) {
          toggleNubeDePuntos(model);
        }
      });
    }
  });

  // --- SLIDER PARA TAMAÑO DE PUNTOS --- //
  const puntosSettings = document.getElementById('puntosSettings');
  const vertexSizeSlider = document.getElementById('vertexSizeSlider');
  const vertexSizeValue = document.getElementById('vertexSizeValue');
  // btnPuntos ya está definido arriba

  // 1. Mostrar el slider SOLO al activar el modo "Vértices"
  btnPuntos?.addEventListener('click', () => {
    // Toggle: muestra si estaba oculto, oculta si estaba visible
    const visible = puntosSettings.style.display === 'flex';
    puntosSettings.style.display = visible ? 'none' : 'flex';

    // Si ahora se muestra, resetea el slider y el tamaño de los puntos
    if (!visible) {
      vertexSizeSlider.value = 1;
      vertexSizeValue.textContent = "1 px";
      applyToRelevantViewers(({ model }) => {
        if (!model) return;
        model.traverse(child => {
          if (child.isPoints && child.name === 'puntos_nube' && child.material) {
            child.material.size = 1 / 300; // Ajusta divisor según escala de tu escena
            child.material.needsUpdate = true;
          }
        });
      });
    }
  });


  // 2. Cambiar tamaño de puntos en tiempo real
  vertexSizeSlider?.addEventListener('input', (e) => {
    const px = Number(e.target.value);
    vertexSizeValue.textContent = px + " px";

    // Recorre los modelos activos y ajusta el tamaño de los puntos
    applyToRelevantViewers(({ model }) => {
      if (!model) return;
      model.traverse(child => {
        if (child.isPoints && child.name === 'puntos_nube' && child.material) {
          child.material.size = px / 300; // Ajusta el divisor para la escala de tu escena
          child.material.needsUpdate = true;
        }
      });
    });
  });


  // --- CAMBIO DE MODELO ACTIVO Y LINKED (solo si existen los botones) ---
  const btnChange = document.getElementById('btn-changeModel');
  const btnLinked = document.getElementById('btn-material'); // Ojo, reutilizado arriba

  if (btnChange) {
    btnChange.addEventListener('click', () => {
      if (!window.activeModel || !window.model1 || !window.model2) return;
      window.activeModel = (window.activeModel === window.model1) ? window.model2 : window.model1;
      updateOutlines();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!window.activeModel || !window.model1 || !window.model2) return;
    if (e.key === 'ArrowLeft') {
      window.activeModel = window.model1;
      updateOutlines();
    }
    if (e.key === 'ArrowRight') {
      window.activeModel = window.model2;
      updateOutlines();
    }
  });


  if (btnLinked && window.updateOutlines) {
    btnLinked.addEventListener('click', () => {
      if (typeof window.linkedMode !== 'boolean') return;
      window.linkedMode = !window.linkedMode;
      btnLinked.classList.toggle('active', window.linkedMode);
      window.updateOutlines();
    });
  }

  // --- SYNC BOTÓN ---
  const btnSync = document.getElementById('btn-material');
  btnSync?.addEventListener('click', () => {
    const sync = toggleSyncMode?.();
    btnSync.style.backgroundColor = sync ? 'green' : '';
  });

  // --- TOON SHADING: Listener del panel ---
  const toonPanel = document.getElementById('toonShadingPanel');

  toonPanel?.addEventListener('input', () => {
    const colorInputs = [...toonPanel.querySelectorAll('.toon-color')];
    const rangeInputs = [...toonPanel.querySelectorAll('.toon-range')];

    const colors = colorInputs.map(input => input.value);
    const thresholds = rangeInputs.map(input => parseInt(input.value));

    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        aplicarToonShading(window.model1, colors, thresholds);
        aplicarToonShading(window.model2, colors, thresholds);
      } else {
        aplicarToonShading(window.activeModel, colors, thresholds);
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (!model) return;
        aplicarToonShading(model, colors, thresholds);
      });
    }
  });

});

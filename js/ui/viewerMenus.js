// js/ui/viewerMenus.js

import * as THREE from 'three';

import {
  aplicarEstilos,
  restaurarMaterialesOriginales,
  cambiarMaterial,
  actualizarColorWireframe,
  aplicarToonShading
} from '../scene/model/materials.js';

import { toggleNubeDePuntos } from '../scene/interaction/vertexToggle.js';
import { applyToRelevantViewers, applyClippingPlaneSmart } from '../scene/core/sceneSyncUtils.js';
import { toggleSyncMode } from './viewerSwitch.js';
import { updateOutlines } from '../scene/model/outlinePass.js';
import { setModoVerticesActivo } from '../scene/interaction/vertexMode.js';

// --- IMPORTACIÓN DEL CLIPPING PLANE ---
import { applyClippingPlane, updateClippingPosition, disableClipping } from '../scene/interaction/clippingPlane.js';

// ==== DEBOUNCE ====
function debounce(callback, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function getCorrectViewerIdFromModel(model) {
  if (!model) return 'indexViewer1'; // fallback
  if (window.model1 && model === window.model1) return 'indexViewer1';
  if (window.model2 && model === window.model2) return 'viewer2';
  return 'indexViewer1';
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

  // --- PANEL DE MENÚS LATERAL (Sidebar Principal) ---
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

  // --- FORMULARIO DE ESTILOS ---
  const debouncedUpdateMaterial = debounce(() => {
    const datos = Object.fromEntries(new FormData(formModelo).entries());

    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;
    datos.transmission = parseFloat(formModelo.elements["transmissionSlider"].value);
    datos.thickness = parseFloat(formModelo.elements["thicknessSlider"].value);

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
    }
  });

  // === CONTROL UNIFICADO DE MODOS "botón pestaña" ===

  // Botones modo
  const btnWireframe = document.getElementById('wireframe');
  const btnSolido = document.getElementById('solido');
  const btnPuntos = document.getElementById('togglePuntos');
  const btnClipping = document.getElementById('toggleClipping');
  const btnToonShading = document.getElementById('toggleToonShading');

  // Paneles desplegables de cada modo
  const puntosSettings = document.getElementById('puntosSettings');
  const clippingSettings = document.getElementById('clippingSettings');
  const toonShadingPanel = document.getElementById('toonShadingPanel');

  function cerrarTodosLosPanelesModo() {
    if (puntosSettings) puntosSettings.style.display = 'none';
    if (clippingSettings) clippingSettings.style.display = 'none';
    if (toonShadingPanel) toonShadingPanel.style.display = 'none';
  }

  // --- BOTÓN: Wireframe ---
  btnWireframe?.addEventListener('click', () => {
    cerrarTodosLosPanelesModo();
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        cambiarMaterial(window.model1, 'wireframe', '#000000');
        cambiarMaterial(window.model2, 'wireframe', '#000000');
      } else {
        cambiarMaterial(window.activeModel, 'wireframe', '#000000');
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) cambiarMaterial(model, 'wireframe', '#000000');
      });
    }
  });

  // --- BOTÓN: Sólido ---
  btnSolido?.addEventListener('click', () => {
    cerrarTodosLosPanelesModo();
    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        cambiarMaterial(window.model1, 'solido');
        cambiarMaterial(window.model2, 'solido');
      } else {
        cambiarMaterial(window.activeModel, 'solido');
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) cambiarMaterial(model, 'solido');
      });
    }
  });

  // --- BOTÓN: Vértices ---
  let modoVerticesActivo = false;
  btnPuntos?.addEventListener('click', () => {
    cerrarTodosLosPanelesModo();
    const nuevoEstado = !modoVerticesActivo;
    modoVerticesActivo = nuevoEstado;
    setModoVerticesActivo(nuevoEstado);

    if (window.model1 && window.model2 && window.activeModel) {
      if (window.linkedMode) {
        toggleNubeDePuntos(window.model1);
        toggleNubeDePuntos(window.model2);
      } else {
        toggleNubeDePuntos(window.activeModel);
      }
    } else {
      applyToRelevantViewers(({ model }) => {
        if (model) toggleNubeDePuntos(model);
      });
    }

    if (modoVerticesActivo && puntosSettings) {
      puntosSettings.style.display = 'flex';
      let tamanoDefecto = 1;
      applyToRelevantViewers(({ model }) => {
        if (!model) return;
        if (model.userData && model.userData.tamanoPuntoDefecto) {
          tamanoDefecto = Math.max(1, Math.round(model.userData.tamanoPuntoDefecto * 300));
        }
        model.traverse(child => {
          if (child.isPoints && child.name === 'puntos_nube' && child.material) {
            child.material.size = tamanoDefecto / 300;
            child.material.needsUpdate = true;
          }
        });
      });

      vertexSizeSlider.value = tamanoDefecto;
      vertexSizeValue.textContent = tamanoDefecto + " px";
      if (window.actualizarEscalaEsferas) window.actualizarEscalaEsferas();
    }
  });

  // Cambiar tamaño de puntos en tiempo real
  const vertexSizeSlider = document.getElementById('vertexSizeSlider');
  const vertexSizeValue = document.getElementById('vertexSizeValue');
  vertexSizeSlider?.addEventListener('input', (e) => {
    const px = Number(e.target.value);
    vertexSizeValue.textContent = px + " px";
    applyToRelevantViewers(({ model, renderer }) => {
      if (!model) return;
      model.traverse(child => {
        if (child.isPoints && child.name === 'puntos_nube' && child.material) {
          child.material.size = px / 300;
          child.material.needsUpdate = true;
        }
      });
      if (renderer && renderer.domElement.onPuntosSizeChanged) {
        renderer.domElement.onPuntosSizeChanged();
      }
    });
  });

// --- PANEL DE CORTE (CLIPPING PLANE) ---

const clipX = document.getElementById('clip-x');
const clipY = document.getElementById('clip-y');
const clipZ = document.getElementById('clip-z');
const clipSlider = document.getElementById('clip-slider');
const clipSliderValue = document.getElementById('clip-slider-value');
let activeClipAxis = null; // inicial sin eje

function getActiveModelAndId() {
  let model = null;
  let viewerId = 'indexViewer1';

  if (window.model1 && window.model2 && window.activeModel) {
    model = window.activeModel;
    viewerId = model === window.model2 ? 'viewer2' : 'indexViewer1';
  } else {
    model = window.model;
    viewerId = new URLSearchParams(window.location.search).get('viewerId') || 'indexViewer1';
  }

  return { model, viewerId };
}


// Aplica plano de corte a uno o ambos modelos según el modo
function applyClippingToRelevantViewers(axis, constant) {
  if (window.model1 && window.model2 && window.activeModel) {
    if (window.linkedMode) {
      applyClippingPlane(window.model1, axis, constant, 'indexViewer1');
      applyClippingPlane(window.model2, axis, constant, 'viewer2');
    } else {
      const viewerId = window.activeModel === window.model1 ? 'indexViewer1' : 'viewer2';
      applyClippingPlane(window.activeModel, axis, constant, viewerId);
    }
  } else {
    const { model, viewerId } = getActiveModelAndId();
    if (model) applyClippingPlane(model, axis, constant, viewerId);
  }
}

// Al seleccionar un eje, configura el plano y activa el slider
function setupClippingPlane() {
  if (!activeClipAxis) return;

  applyToRelevantViewers(({ model, viewerId }) => {
  const box = new THREE.Box3().setFromObject(model);
  let min = 0, max = 0;
  switch (activeClipAxis) {
    case 'X': min = box.min.x; max = box.max.x; break;
    case 'Y': min = box.min.y; max = box.max.y; break;
    case 'Z': min = box.min.z; max = box.max.z; break;
  }

    const margen = 0.01;
    clipSlider.min = (min - margen).toFixed(2);
    clipSlider.max = (max + margen).toFixed(2);
    clipSlider.step = 0.01;
    clipSlider.value = min.toFixed(2);
    clipSlider.disabled = false;
    clipSliderValue.textContent = clipSlider.value;

    applyClippingPlane(model, activeClipAxis, parseFloat(clipSlider.value), viewerId);
  });

}

// Solo mueve el plano ya activo
// Mueve el plano sin regenerarlo
function moveClippingPlane() {
  const constant = parseFloat(clipSlider.value);
  clipSliderValue.textContent = constant.toFixed(2);

  const { model } = getActiveModelAndId();
  const viewerId = getCorrectViewerIdFromModel(model);
  updateClippingPosition(constant, viewerId);
}



// Ejes
clipX?.addEventListener('click', () => {
  activeClipAxis = 'X';
  setupClippingPlane();
  clipX.classList.add('active');
  clipY.classList.remove('active');
  clipZ.classList.remove('active');
});
clipY?.addEventListener('click', () => {
  activeClipAxis = 'Y';
  setupClippingPlane();
  clipX.classList.remove('active');
  clipY.classList.add('active');
  clipZ.classList.remove('active');
});
clipZ?.addEventListener('click', () => {
  activeClipAxis = 'Z';
  setupClippingPlane();
  clipX.classList.remove('active');
  clipY.classList.remove('active');
  clipZ.classList.add('active');
});

clipSlider?.addEventListener('input', moveClippingPlane);

btnClipping?.addEventListener('click', () => {
  cerrarTodosLosPanelesModo();
  if (!clippingSettings) return;

  const visible = clippingSettings.style.display === 'flex';
  clippingSettings.style.display = visible ? 'none' : 'flex';

  const { model } = getActiveModelAndId();
  if (visible) {
    disableClipping(model);
    clipSlider.disabled = true;
    clipSliderValue.textContent = "—";
    activeClipAxis = null;
    clipX.classList.remove('active');
    clipY.classList.remove('active');
    clipZ.classList.remove('active');
  } else {
    // Se espera a que el usuario pulse un eje
    clipSlider.disabled = true;
    clipSliderValue.textContent = "—";
  }
});


  // --- BOTÓN: Toon Shading ---
  btnToonShading?.addEventListener('click', () => {
    cerrarTodosLosPanelesModo();
    if (toonShadingPanel) {
      const visible = toonShadingPanel.style.display === 'flex';
      toonShadingPanel.style.display = visible ? 'none' : 'flex';
    }
  });

  // --- CAMBIO DE MODELO ACTIVO Y LINKED (solo si existen los botones) ---
  const btnChange = document.getElementById('btn-changeModel');
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

  const btnLinked = document.getElementById('btn-material'); // Ojo, reutilizado arriba
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

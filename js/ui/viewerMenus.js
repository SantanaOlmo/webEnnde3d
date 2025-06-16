import * as THREE from 'three';
import { getModelById } from '../scene/core/viewerRegistry.js';

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
  console.log("viewerMenus cargado");

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
    if (activePanel === panelWorld) {
      hideAllPanels();
    } else {
      hideAllPanels();
      showPanel(panelWorld);
    }
  });

  btnModelo?.addEventListener('click', () => {
    if (activePanel === panelModelo) {
      hideAllPanels();
      showPanel(panelModelo);
    } else {
      hideAllPanels();
      showPanel(panelModelo);
    }
  });

  // Redirección al visor comparativo desde botón lateral
  if (btnGoToCompare) {
    btnGoToCompare.addEventListener('click', () => {
      localStorage.setItem("modeloOrigen", "indexViewer1");
      localStorage.setItem("from", "viewer");
      window.location.href = "/views/splitViewer.html?from=viewer";
    });
  }

  // === CONTROL DE ESTILO DEL MODELO ===

  const viewerId = new URLSearchParams(window.location.search).get('viewerId') || 'indexViewer1';
  const formModelo = document.getElementById('formStyles');

  // Se ejecuta cada vez que el usuario cambia color, roughness o metalness
  formModelo?.addEventListener('input', () => {
    const model = getModelById(viewerId); // 👈 ahora se obtiene en el momento justo
    if (!model) return;

    const datos = Object.fromEntries(new FormData(formModelo).entries());
    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;
    localStorage.setItem('estilos', JSON.stringify(datos));

    const nuevoMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(datos.color),
      roughness: datos.roughness,
      metalness: datos.metalness
    });

    model.traverse(child => {
      if (child.isMesh) {
        child.material = nuevoMaterial;
      }
    });
  });

  // Botón para restablecer estilos y materiales originales
  const btnReset = document.getElementById('resetEstilos');
  btnReset?.addEventListener('click', () => {
    const model = getModelById(viewerId); // 👈 también se obtiene dinámicamente aquí
    if (!model) return;

    model.traverse(child => {
      if (child.isMesh && child.userData.originalMaterial) {
        child.material = child.userData.originalMaterial;
      }
    });

    localStorage.removeItem("estilos");

    // Restaurar valores en el formulario
    if (formModelo) {
      formModelo.elements["color"].value = "#ffffff";
      formModelo.elements["roughness"].value = 500;
      formModelo.elements["metalness"].value = 500;
    }
  });
});


import { getSceneById, getModelById } from '../scene/core/viewerRegistry.js';
import { aplicarEstilos, restaurarMaterialesOriginales, cambiarMaterial } from '../scene/model/materials.js';
import { toggleNubeDePuntos } from '../scene/interaction/vertexToggle.js';

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

  // === GESTIÓN DE PANELES LATERALES ===
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

  // Redirección al visor comparativo
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

  formModelo?.addEventListener('input', () => {
    const model = getModelById(viewerId);
    if (!model) return;

    const datos = Object.fromEntries(new FormData(formModelo).entries());
    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;

    localStorage.setItem('estilos', JSON.stringify(datos));
    aplicarEstilos(model, datos);
  });

  const btnReset = document.getElementById('resetEstilos');
  btnReset?.addEventListener('click', () => {
    const model = getModelById(viewerId);
    if (!model) return;

    restaurarMaterialesOriginales(model);
    localStorage.removeItem("estilos");

    if (formModelo) {
      formModelo.elements["color"].value = "#ffffff";
      formModelo.elements["roughness"].value = 500;
      formModelo.elements["metalness"].value = 500;
    }
  });

  // === CONTROL DE VISUALIZACIÓN: MALLA / SÓLIDO / PUNTOS ===
  const btnWireframe = document.getElementById('wireframe');
  const btnSolido    = document.getElementById('solido');
  const btnPuntos    = document.getElementById('togglePuntos');

  btnWireframe?.addEventListener('click', () => {
    const model = getModelById(viewerId);
    if (!model) return;
    cambiarMaterial(model, 'wireframe', '#000000');
  });

  btnSolido?.addEventListener('click', () => {
    const model = getModelById(viewerId);
    if (!model) return;
    cambiarMaterial(model, 'solido');
  });

  btnPuntos?.addEventListener('click', () => {
    const model = getModelById(viewerId);
    if (!model) return;
    toggleNubeDePuntos(model);
  });

  // Al final del mismo bloque
    const scene = getSceneById(viewerId);

    const btnEjes = document.getElementById('toggleAxes');
    const btnGrid = document.getElementById('toggleGrid');

  // Esperar unos milisegundos hasta que la escena se registre
  setTimeout(() => {
    const scene = getSceneById(viewerId);
    if (!scene) {
      console.warn("⚠️ La escena aún no está disponible.");
      return;
    }

    btnEjes?.addEventListener('click', () => {
      const ejes = scene.getObjectByName('helper_ejes');
      if (ejes) ejes.visible = !ejes.visible;
    });

    btnGrid?.addEventListener('click', () => {
      const grid = scene.getObjectByName('helper_grid');
      if (grid) grid.visible = !grid.visible;
    });
  }, 200); // Puedes ajustar este valor si hiciera falta


});

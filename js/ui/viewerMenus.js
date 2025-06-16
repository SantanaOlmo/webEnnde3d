import { getModelById } from '../scene/core/viewerRegistry.js';
import { aplicarEstilos, restaurarMaterialesOriginales } from '../scene/model/materials.js';

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

  // Activación del panel correspondiente
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
      localStorage.setItem("from", "viewer"); // necesario para el botón "volver"
      window.location.href = "/views/splitViewer.html?from=viewer";
    });
  }

  // === CONTROL DE ESTILO DEL MODELO ===

  const viewerId = new URLSearchParams(window.location.search).get('viewerId') || 'indexViewer1';
  const formModelo = document.getElementById('formStyles');

  // Aplicación dinámica de estilos al mover sliders o cambiar color
  formModelo?.addEventListener('input', () => {
    const model = getModelById(viewerId); // se obtiene el modelo activo registrado
    if (!model) return;

    // Captura de valores desde el formulario
    const datos = Object.fromEntries(new FormData(formModelo).entries());
    datos.roughness = parseFloat(datos.roughness) / 1000;
    datos.metalness = parseFloat(datos.metalness) / 1000;

    // Guardamos los estilos para mantenerlos entre sesiones
    localStorage.setItem('estilos', JSON.stringify(datos));

    // Aplicamos el nuevo material
    aplicarEstilos(model, datos);
  });

  // Botón para restablecer el material original del modelo
  const btnReset = document.getElementById('resetEstilos');
  btnReset?.addEventListener('click', () => {
    const model = getModelById(viewerId);
    if (!model) return;

    restaurarMaterialesOriginales(model); // aplica materiales originales
    localStorage.removeItem("estilos");   // limpiamos estilos guardados

    // Restauramos también el estado visual del formulario
    if (formModelo) {
      formModelo.elements["color"].value = "#ffffff";
      formModelo.elements["roughness"].value = 500;
      formModelo.elements["metalness"].value = 500;
    }
  });
});
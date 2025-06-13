

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

  btnWorld.addEventListener('click', () => {
    if (activePanel === panelWorld) {
      hideAllPanels();
    } else {
      hideAllPanels();
      showPanel(panelWorld);
    }
  });

  btnModelo.addEventListener('click', () => {
    if (activePanel === panelModelo) {
      hideAllPanels();
    } else {
      hideAllPanels();
      showPanel(panelModelo);
    }
  });

  // NUEVO: redirige al visor comparativo guardando modelo actual
if (btnGoToCompare) {
  btnGoToCompare.addEventListener('click', () => {
    // Guardamos el origen
    localStorage.setItem("modeloOrigen", "viewer1");

    // Esperamos 300ms antes de redirigir (ajustable)
    setTimeout(() => {
      window.location.href = "/views/splitViewer.html?from=viewer";
    }, 300);
  });
}
});
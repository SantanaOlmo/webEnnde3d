// Ruta: ./js/ui/SelectPointsMenus.js
// Alterna la visibilidad del menú de puntos en ambos visores al pulsar el botón del sidebar

const pointsBarIds = ['pointsBar1', 'pointsBar2'];
let pointsMenuVisible = false;

const selectPointsBtn = document.getElementById('btn-selectPoints');
if (selectPointsBtn) {
  selectPointsBtn.addEventListener('click', () => {
    pointsMenuVisible = !pointsMenuVisible;
    pointsBarIds.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = pointsMenuVisible ? 'flex' : 'none';
    });
  });
}

export function addPointPanel(viewerId) {
  const viewer = document.getElementById(viewerId);
  if (!viewer) return;

  // Evita duplicados
  if (viewer.querySelector('.point-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'point-panel d-none';
  panel.innerHTML = `
    <div class="point" data-point="1">Punto 1</div>
    <div class="point" data-point="2">Punto 2</div>
    <div class="point" data-point="3">Punto 3</div>
  `;

  viewer.appendChild(panel);
}

const toonPanel = document.getElementById('toonShadingPanel');
const btnToonShading = document.getElementById('btnToonShading');
const addToonRange = document.getElementById('addToonRange');

btnToonShading.addEventListener('click', () => {
  toonPanel.classList.toggle('d-none');
  updateToonMaterial();
});

addToonRange.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'toon-color-block';
  div.innerHTML = `
    <label>Color intermedio:</label>
    <input type="color" class="toon-color" value="#888888">
    <input type="range" class="toon-range" min="0" max="100" value="80">
  `;
  toonPanel.insertBefore(div, addToonRange);
  updateToonMaterial();
});

// Escucha cambios
toonPanel.addEventListener('input', () => {
  updateToonMaterial();
});

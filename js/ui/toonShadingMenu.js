const toonPanel = document.getElementById('toonShadingPanel');
const addToonRange = document.getElementById('addToonRange');

// El panel se abre/cierra desde viewerMenus.js

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

// Escucha cambios (inputs dentro del panel)
toonPanel.addEventListener('input', () => {
  updateToonMaterial();
});

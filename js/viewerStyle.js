// viewerStyle.js

// Importa las funciones necesarias desde scene.js
import { actualizarModelo, restaurarMaterialesOriginales } from '/js/scene.js';

// Referencias al botón, al panel y al formulario de estilos
const btnOptions = document.getElementById('options');
const form = document.getElementById('formStyles');
const menuPanel = document.getElementById('menuDesplegable');

// Al hacer clic en el botón de los tres puntos, alterna visibilidad del menú
btnOptions.addEventListener('click', () => {
  menuPanel.classList.toggle('oculto');
  btnOptions.classList.toggle('rotado'); // Activa o desactiva la rotación del icono
});

// Escucha cambios en los inputs del formulario (color, roughness, metalness)
form.addEventListener('input', () => {
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.roughness = parseFloat(datos.roughness) / 1000;
  datos.metalness = parseFloat(datos.metalness) / 1000;

  sessionStorage.setItem('estilos', JSON.stringify(datos));
  actualizarModelo();
});

// Botón para restablecer estilos originales del modelo
const btnReset = document.getElementById('resetEstilos');

btnReset.addEventListener('click', () => {
  restaurarMaterialesOriginales();
  sessionStorage.removeItem('estilos');

  // También puedes reiniciar el formulario visualmente
  const colorInput = document.getElementById('chooseColor');
  const roughnessInput = form.elements['roughness'];
  const metalnessInput = form.elements['metalness'];

  if (colorInput) colorInput.value = "#ffffff"; // puedes ajustar esto si quieres
  if (roughnessInput) roughnessInput.value = 500;
  if (metalnessInput) metalnessInput.value = 500;
});

// Activar / Desactivar coordenadas
const toggleCoords = document.getElementById('toggleCoords');
const coordPanel = document.getElementById('bottomInfo');

toggleCoords.addEventListener('change', () => {
  coordPanel.style.display = toggleCoords.checked ? 'flex' : 'none';
});

// Activar / Desactivar cuadrícula y ejes
import { toggleHelpers } from '/js/scene.js';

const toggleHelpersCheckbox = document.getElementById('toggleHelpers');

toggleHelpersCheckbox.addEventListener('change', () => {
  toggleHelpers(toggleHelpersCheckbox.checked);
});

// viewerStyle.js

// Importa funciones desde scene.js
import {
  actualizarModelo,
  restaurarMaterialesOriginales,
  cambiarHDRI,
  quitarHDRI,
  toggleHelpers,
  cambiarColorFondo
} from '/js/scene.js';

// Referencias al botón, al panel y al formulario de estilos
const btnOptions = document.getElementById('options');
const form = document.getElementById('formStyles');
const menuPanel = document.getElementById('menuDesplegable');

// Mostrar/ocultar menú de opciones
btnOptions.addEventListener('click', () => {
  menuPanel.classList.toggle('oculto');
  btnOptions.classList.toggle('rotado');
});

// Estilos del modelo (color, roughness, metalness)
form.addEventListener('input', () => {
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.roughness = parseFloat(datos.roughness) / 1000;
  datos.metalness = parseFloat(datos.metalness) / 1000;

  sessionStorage.setItem('estilos', JSON.stringify(datos));
  actualizarModelo();
});

// Botón para restablecer estilos
const btnReset = document.getElementById('resetEstilos');
btnReset.addEventListener('click', () => {
  restaurarMaterialesOriginales();
  sessionStorage.removeItem('estilos');

  const colorInput = document.getElementById('chooseColor');
  const roughnessInput = form.elements['roughness'];
  const metalnessInput = form.elements['metalness'];

  if (colorInput) colorInput.value = "#ffffff";
  if (roughnessInput) roughnessInput.value = 500;
  if (metalnessInput) metalnessInput.value = 500;
});

// Coordenadas
const toggleCoords = document.getElementById('toggleCoords');
const coordPanel = document.getElementById('bottomInfo');
toggleCoords.addEventListener('change', () => {
  coordPanel.style.display = toggleCoords.checked ? 'flex' : 'none';
});

// Cuadrícula y ejes
const toggleHelpersCheckbox = document.getElementById('toggleHelpers');
toggleHelpersCheckbox.addEventListener('change', () => {
  toggleHelpers(toggleHelpersCheckbox.checked);
});

// HDRI y fondo
const toggleHR = document.getElementById('toggleHR');
const selectorHDRI = document.getElementById('selectorHDRI');
const bloqueHDRI = document.getElementById('bloqueHDRI');
const bloqueColor = document.getElementById('bloqueColor');
const inputColor = document.getElementById('backgroundColor');

// Mostrar/ocultar elementos según HDRI activado
toggleHR.addEventListener('change', () => {
  const activo = toggleHR.checked;
  bloqueHDRI.style.display = activo ? 'block' : 'none';
  bloqueColor.style.display = activo ? 'none' : 'block';

  if (activo) {
    cambiarHDRI(selectorHDRI.value);
    sessionStorage.setItem('hdriActivo', selectorHDRI.value);
    sessionStorage.removeItem('colorFondo');
  } else {
    quitarHDRI();
    cambiarColorFondo(inputColor.value);
    sessionStorage.setItem('colorFondo', inputColor.value);
    sessionStorage.removeItem('hdriActivo');
  }
});

// Cambio de HDRI
selectorHDRI.addEventListener('change', () => {
  if (toggleHR.checked && selectorHDRI.value !== 'none') {
    cambiarHDRI(selectorHDRI.value);
    sessionStorage.setItem('hdriActivo', selectorHDRI.value);
  } else {
    quitarHDRI();
    sessionStorage.removeItem('hdriActivo');
  }
});

// Cambio de color de fondo
inputColor.addEventListener('input', () => {
  if (!toggleHR.checked) {
    cambiarColorFondo(inputColor.value);
    sessionStorage.setItem('colorFondo', inputColor.value);
  }
});

// Si no hay valores previos, activa HDRI por defecto
if (!sessionStorage.getItem('hdriActivo') && !sessionStorage.getItem('colorFondo')) {
  sessionStorage.setItem('hdriActivo', 'campo.hdr');
}

// Restaurar estado desde sessionStorage
window.addEventListener('load', () => {
  const hdriGuardado = sessionStorage.getItem('hdriActivo');
  const colorGuardado = sessionStorage.getItem('colorFondo');

  if (hdriGuardado && hdriGuardado !== 'none') {
    toggleHR.checked = true;
    selectorHDRI.value = hdriGuardado;
    cambiarHDRI(hdriGuardado);
    bloqueHDRI.style.display = 'block';
    bloqueColor.style.display = 'none';
  } else if (colorGuardado) {
    toggleHR.checked = false;
    cambiarColorFondo(colorGuardado);
    inputColor.value = colorGuardado;
    bloqueHDRI.style.display = 'none';
    bloqueColor.style.display = 'block';
  } else {
    toggleHR.checked = false;
    cambiarColorFondo('#222222');
    bloqueHDRI.style.display = 'none';
    bloqueColor.style.display = 'block';
  }
});

// viewerStyle.js

import {
  actualizarModelo,
  restaurarMaterialesOriginales,
  cambiarHDRI,
  quitarHDRI,
  toggleHelpers,
  cambiarColorFondo,
  cambiarMaterial
} from '/js/scene.js';

// Referencias generales
const btnOptions = document.getElementById('options');
const form = document.getElementById('formStyles');
const menuPanel = document.getElementById('menuDesplegable');
const toggleModo = document.getElementById('toggleModo');
const menuContenido = document.getElementById('menuContenido');
const menuTecnico = document.getElementById('menuTecnico');
const mallas = document.getElementById('mallas');

// Mostrar/ocultar panel lateral completo
btnOptions.addEventListener('click', () => {
  menuPanel.classList.toggle('oculto');
  btnOptions.classList.toggle('rotado');
});

// Modo técnico ON/OFF
let modoTecnicoActivo = false;

toggleModo?.addEventListener('click', () => {
  modoTecnicoActivo = !modoTecnicoActivo;

  if (modoTecnicoActivo) {
    menuContenido.style.display = 'none';
    menuTecnico.style.display = 'block';
    toggleModo.innerText = '🔙';
    toggleModo.title = 'Volver al menú normal';
  } else {
    menuTecnico.style.display = 'none';
    menuContenido.style.display = 'block';
    toggleModo.innerText = '🛠️';
    toggleModo.title = 'Modo técnico';
  }
});

// =======================
// Estilos del modelo
// =======================
form.addEventListener('input', () => {
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.roughness = parseFloat(datos.roughness) / 1000;
  datos.metalness = parseFloat(datos.metalness) / 1000;
  localStorage.setItem('estilos', JSON.stringify(datos));
  actualizarModelo();
});

const btnReset = document.getElementById('resetEstilos');
btnReset.addEventListener('click', () => {
  restaurarMaterialesOriginales();
  localStorage.removeItem('estilos');
  form.elements['color'].value = '#ffffff';
  form.elements['roughness'].value = 500;
  form.elements['metalness'].value = 500;
});

const btnWireframe=document.getElementById('wireframe');
const btnSolido=document.getElementById('solido');

btnWireframe.addEventListener('click', () => {
  cambiarMaterial('wireframe');
});

btnSolido.addEventListener('click', () => {
  cambiarMaterial('solido');
});


// =======================
// Mostrar coordenadas
// =======================
const toggleCoords = document.getElementById('toggleCoords');
const coordPanel = document.getElementById('bottomInfo');
toggleCoords.addEventListener('change', () => {
  coordPanel.style.display = toggleCoords.checked ? 'flex' : 'none';
});

// =======================
// Cuadrícula y ejes
// =======================
const toggleHelpersCheckbox = document.getElementById('toggleHelpers');
toggleHelpersCheckbox.addEventListener('change', () => {
  toggleHelpers(toggleHelpersCheckbox.checked);
});

// =======================
// HDRI y fondo plano
// =======================
const toggleHR = document.getElementById('toggleHR');
const selectorHDRI = document.getElementById('selectorHDRI');
const bloqueHDRI = document.getElementById('bloqueHDRI');
const bloqueColor = document.getElementById('bloqueColor');
const inputColor = document.getElementById('backgroundColor');

toggleHR.addEventListener('change', () => {
  const activo = toggleHR.checked;
  bloqueHDRI.style.display = activo ? 'block' : 'none';
  bloqueColor.style.display = activo ? 'none' : 'block';

  if (activo) {
    cambiarHDRI(selectorHDRI.value);
    localStorage.setItem('hdriActivo', selectorHDRI.value);
    localStorage.removeItem('colorFondo');
  } else {
    quitarHDRI();
    cambiarColorFondo(inputColor.value);
    localStorage.setItem('colorFondo', inputColor.value);
    localStorage.removeItem('hdriActivo');
  }
});

selectorHDRI.addEventListener('change', () => {
  if (toggleHR.checked && selectorHDRI.value !== 'none') {
    cambiarHDRI(selectorHDRI.value);
    localStorage.setItem('hdriActivo', selectorHDRI.value);
  } else {
    quitarHDRI();
    localStorage.removeItem('hdriActivo');
  }
});

inputColor.addEventListener('input', () => {
  if (!toggleHR.checked) {
    cambiarColorFondo(inputColor.value);
    localStorage.setItem('colorFondo', inputColor.value);
  }
});

// =======================
// Restaurar estado inicial
// =======================
window.addEventListener('load', () => {
  const hdriGuardado = localStorage.getItem('hdriActivo');
  const colorGuardado = localStorage.getItem('colorFondo');

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

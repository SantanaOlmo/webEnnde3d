// viewerStyle.js

// Importa la función que actualiza el modelo según el formulario
import { actualizarModelo } from '/js/scene.js';

// Referencias al botón y al formulario de estilos
let btnOptions = document.getElementById('options');
let form = document.getElementById('formStyles');

// Evento de clic sobre el botón de opciones (sin funcionalidad por ahora)
btnOptions.addEventListener('click', function() {
  // (Pendiente: abrir/cerrar menú)
});

// Escucha cambios en los inputs del formulario (color, roughness, metalness)
form.addEventListener('input', function() {
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.roughness = parseFloat(datos.roughness) / 1000;
  datos.metalness = parseFloat(datos.metalness) / 1000;

  sessionStorage.setItem('estilos', JSON.stringify(datos));
  actualizarModelo();
});

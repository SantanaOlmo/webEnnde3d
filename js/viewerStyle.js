let btnOptions = document.getElementById('options');
let form;
const previewTexturas=document.getElementById('previewTexturas');

import {actualizarModelo} from '/js/scene.js';
btnOptions.addEventListener('click',function(){

});

form = document.getElementById('formStyles');
form.addEventListener('input',function(){
   const datos = Object.fromEntries(new FormData(form).entries());

    datos.roughness=parseFloat(datos.roughness)/1000;
    datos.metalness=parseFloat(datos.metalness)/1000;
    sessionStorage.setItem('estilos',JSON.stringify(datos))
    actualizarModelo();
    });


function mostrarPreviews(texturasJson, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) {
    console.error(`No se encontró el contenedor con id="${contenedorId}"`);
    return;
  }

  contenedor.innerHTML = '';

  for (const nombreTextura in texturasJson) {
    if (Object.hasOwnProperty.call(texturasJson, nombreTextura)) {
      const previewSrc = texturasJson[nombreTextura].preview;
      if (previewSrc) {
        const img = document.createElement('img');
        img.src = previewSrc;
        img.alt = `Preview de ${nombreTextura}`;
        img.style.width = '50px';
        img.style.margin = '5px';
        contenedor.appendChild(img);
      }
    }
  }
}

// Cargar JSON desde una ruta externa
fetch('/texturas.json')
  .then(response => {
    if (!response.ok) throw new Error('Error cargando el JSON');
    return response.json();
  })
  .then(data => {
    mostrarPreviews(data, 'previewTexturas');
  })
  .catch(error => {
    console.error('Error:', error);
  });

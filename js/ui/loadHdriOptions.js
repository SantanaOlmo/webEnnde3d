// Ruta: ./js/ui/loadHdriOptions.js
//GENERA AUTOTMATICAMENTE LAS IMAGENES DE LOS HDRI EN EL ASIDE

import { getSceneById } from '../scene/core/viewerRegistry';
import { cambiarHDRI, quitarHDRI } from '../scene/environment/hdriManager';
import { setBackgroundColor } from '../scene/environment/backgroundManager.js';

import { getRendererById } from '../scene/core/viewerRegistry.js';
const bloqueHDRI = document.getElementById('bloqueHDRI');
const viewerId = new URLSearchParams(window.location.search).get('viewerId') || 'indexViewer1';


async function loadHDRIOptions() {
  try {
    const res = await fetch('/assets/hdri/hdriList.json');
    const names = await res.json();

    names.forEach(name => {
      const img = document.createElement('img');
      img.className = 'envOption';
      img.src = `/assets/hdri/hdr_img/${name}.png`;
      img.alt=`${name}`;
      img.id=`${name}`;
      

      img.addEventListener('click', () =>{
        cambiarHDRI(getSceneById(viewerId),`${name}.hdr`);
      })

      const div = document.createElement('div');
      div.className = 'tarjeta';
      div.appendChild(img);

      bloqueHDRI.appendChild(div);
    });
  } catch (err) {
    console.error('Error cargando HDRIs:', err);
  }
}

loadHDRIOptions();

// 👇 Escucha el input del color
const inputColor = document.getElementById('chooseBgColor');
if (inputColor) {
  inputColor.addEventListener('input', () => {
    const scene = getSceneById(viewerId);
    const renderer = getRendererById(viewerId);
    const color = inputColor.value;

    setBackgroundColor(scene, renderer, color);  // ✅ ESTA es la buena
  });
}


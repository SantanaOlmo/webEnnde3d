// js/ui/loadHdriOptions.js
// Genera automáticamente las imágenes de los HDRI en el aside


import {
  getSceneById,
  getRendererById
} from '../scene/core/viewerRegistry.js';

import {
  cambiarHDRI,
  quitarHDRI
} from '../scene/environment/hdriManager.js';

import { setBackgroundColor } from '../scene/environment/backgroundManager.js';

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
      img.alt = name;
      img.id = name;

      img.addEventListener('click', () => {
        cambiarHDRI(getSceneById(viewerId), `${name}.hdr`);
      });

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

    quitarHDRI(scene); // ✅ Esto desactiva el HDR activo
    setBackgroundColor(scene, renderer, color); // ✅ Y ahora el color se ve
  });
}


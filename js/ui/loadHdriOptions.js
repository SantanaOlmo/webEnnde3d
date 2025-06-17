// Ruta: js/ui/loadHdriOptions.js
import {
  cambiarHDRI,
  quitarHDRI
} from '../scene/environment/hdriManager.js';

import { setBackgroundColor } from '../scene/environment/backgroundManager.js';

import { applyToRelevantViewers } from '../scene/core/sceneSyncUtils.js';

const bloqueHDRI = document.getElementById('bloqueHDRI');

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
      console.log("🧪 Click en HDRI:", name);
        applyToRelevantViewers(({ viewerId, scene }) => {
          console.log("➡️ [split] Aplicando HDRI a:", viewerId, scene);
          cambiarHDRI(scene, `${name}.hdr`);
        });
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

const inputColor = document.getElementById('chooseBgColor');
if (inputColor) {
  inputColor.addEventListener('input', () => {
    const color = inputColor.value;

    applyToRelevantViewers(({ scene, renderer }) => {
      quitarHDRI(scene);
      setBackgroundColor(scene, renderer, color);
    });
  });
}

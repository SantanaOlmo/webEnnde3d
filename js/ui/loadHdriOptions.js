// js/ui/loadHdriOptions.js

// === IMPORTS DE FUNCIONES DE ESCENA Y UTILIDADES ===
import { cambiarHDRI, quitarHDRI } from '../scene/environment/hdriManager.js';
import { setBackgroundColor } from '../scene/environment/backgroundManager.js';
import { applyToRelevantViewers } from '../scene/core/sceneSyncUtils.js';

// === SELECCIÓN DEL CONTENEDOR DE OPCIONES DE ENTORNO (HDRI/COLOR) ===
const bloqueHDRI = document.getElementById('bloqueHDRI');

// === CARGA Y RENDERIZADO DE MINIATURAS DE HDRI ===
async function loadHDRIOptions() {
  try {
    const res = await fetch('/assets/hdri/hdriList.json');
    const names = await res.json();

    names.forEach(name => {
      // Crear imagen miniatura de HDRI
      const img = document.createElement('img');
      img.className = 'envOption';
      img.src = `/assets/hdri/hdr_img/${name}.png`;
      img.alt = name;
      img.id = name;

      // Evento click en miniatura HDRI: aplica el HDRI al visor relevante
      img.addEventListener('click', () => {
        console.log("🧪 Click en HDRI:", name);
        applyToRelevantViewers(({ viewerId, scene }) => {
          console.log("➡️ [split] Aplicando HDRI a:", viewerId, scene);
          cambiarHDRI(scene, `${name}.hdr`);
        });
      });

      // Añadir miniatura a la tarjeta y al bloqueHDRI
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

// === GESTIÓN DEL CAMBIO DE COLOR DE FONDO EN EL VISOR ===

// Nota: En visor único, el input suele llamarse 'chooseBgColor'.
// En splitViewer, normalmente es '#chooseColor' dentro de #menu-world.
// Vamos a seleccionar el input de color AMBIENTE en ambos casos:

const inputColor =
  document.querySelector('#menu-world #chooseColor') || 
  document.getElementById('chooseBgColor');             

// Evento: cuando el usuario elige un color de fondo
if (inputColor) {
  inputColor.addEventListener('input', () => {
    const color = inputColor.value;

    // Aplica SOLO al visor seleccionado o ambos si sincronizas
    applyToRelevantViewers(({ scene, renderer }) => {
      quitarHDRI(scene); // Desactiva el HDRI (como en el visor individual)
      setBackgroundColor(scene, renderer, color); // Aplica el color de fondo
    });
  });
}


// js/scene/interaction/vertexToggle.js

import { getSceneByViewerId } from '../core/viewerRegistry.js';

/* Alterna la visibilidad de la nube de puntos en la escena.
 * @param {string} viewerId - ID del visor (por defecto: 'indexViewer1') */

export function toggleNubeDePuntos(viewerId = 'indexViewer1') {
  const scene = getSceneByViewerId(viewerId);
  if (!scene) {
    console.warn(`No se encontró la escena con ID ${viewerId}`);
    return;
  }

  const nube = scene.userData.nubeDePuntos;
  if (nube) {
    nube.visible = !nube.visible;
    console.log(`Nube de puntos ${nube.visible ? 'mostrada' : 'oculta'}`);
  } else {
    console.warn("No hay nube de puntos registrada en esta escena.");
  }
}

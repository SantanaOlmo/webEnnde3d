
// js/scene/interaction/vertexToggle.js

/* Alterna la visibilidad de la nube de puntos en la escena.
 * @param {string} viewerId - ID del visor (por defecto: 'indexViewer1') */

export function toggleNubeDePuntos(model) {
  const scene = model?.parent;
  if (!scene || !scene.userData) {
    console.warn("No se pudo acceder a la escena desde el modelo.");
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


// js/scene/interaction/vertexToggle.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

export function toggleNubeDePuntos(model) {
  let encontrado = false;

  model.traverse((child) => {
    if (child.userData?.nubePuntos) {
      child.userData.nubePuntos.visible = !child.userData.nubePuntos.visible;
      encontrado = true;
    }
  });
}



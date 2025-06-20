// js/scene/interaction/vertexToggle.js

export function toggleNubeDePuntos(model) {
  let encontrado = false;

  model.traverse((child) => {
    if (child.userData?.nubePuntos) {
      child.userData.nubePuntos.visible = !child.userData.nubePuntos.visible;
      encontrado = true;
    }
  });
}



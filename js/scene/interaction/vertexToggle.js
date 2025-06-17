// js/scene/interaction/vertexToggle.js

export function toggleNubeDePuntos(model) {
  let encontrado = false;

  model.traverse((child) => {
    if (child.userData?.nubePuntos) {
      child.userData.nubePuntos.visible = !child.userData.nubePuntos.visible;
      encontrado = true;
    }
  });

  if (encontrado) {
    console.log("✅ Nubes de puntos alternadas correctamente");
  } else {
    console.warn("⚠️ No se encontraron nubes de puntos para alternar");
  }
}



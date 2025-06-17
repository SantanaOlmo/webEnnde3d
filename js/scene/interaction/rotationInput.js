// scene/interaction/rotationInput.js
import { getModelById } from '../core/viewerRegistry.js';

let autoRotate = false;

export function initRotationInput(viewerId) {
  document.addEventListener("keydown", (e) => {
    const model = getModelById(viewerId);
    if (!model) return;

    switch (e.key.toLowerCase()) {
      case "q":
        model.rotation.y -= 0.1;
        break;
      case "e":
        model.rotation.y += 0.1;
        break;
      case " ":
        autoRotate = !autoRotate;
        break;
    }
  });

  // Función que se llama en cada frame desde el bucle de animación
  function updateRotation() {
    const model = getModelById(viewerId);
    if (autoRotate && model) {
      model.rotation.y += 0.01;
    }
    requestAnimationFrame(updateRotation);
  }

  // Se lanza el ciclo de rotación automática
  updateRotation();
}

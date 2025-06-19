// scene/interaction/rotationInput.js
import { getModelById } from '../core/viewerRegistry.js';
import { isSyncMode, getActiveViewer } from '../../ui/viewerSwitch.js';

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


// Ahora lo mismo pero adaptado para el modo comparativo con dos visores

let autoRotate1 = false;
let autoRotate2 = false;
let rotationListenerSet = false;

export function initRotationInputComparativo() {
  // Sólo instala los listeners UNA VEZ
  if (rotationListenerSet) return;
  rotationListenerSet = true;

  document.addEventListener("keydown", (e) => {
    let ids = [];
    if (isSyncMode()) {
      ids = ['indexViewer1', 'viewer2'];
    } else {
      const active = getActiveViewer() === 2 ? 'viewer2' : 'indexViewer1';
      ids = [active];
    }

    ids.forEach(viewerId => {
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
          if (viewerId === 'indexViewer1') autoRotate1 = !autoRotate1;
          else if (viewerId === 'viewer2') autoRotate2 = !autoRotate2;
          break;
      }
    });
  });

  function updateRotation() {
    const model1 = getModelById('indexViewer1');
    const model2 = getModelById('viewer2');
    if (autoRotate1 && model1) model1.rotation.y += 0.01;
    if (autoRotate2 && model2) model2.rotation.y += 0.01;
    requestAnimationFrame(updateRotation);
  }
  updateRotation();
}

// Por si necesitas resetear la rotación tras recargar modelo
export function resetAutoRotate(viewerId) {
  if (viewerId === 'indexViewer1') autoRotate1 = false;
  if (viewerId === 'viewer2') autoRotate2 = false;
}

// js/scene/core/animate.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

export function animate(renderer, scene, camera, controls) {
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    if (controls) controls.update();

    renderer.render(scene, camera);
  }

  renderLoop();
}

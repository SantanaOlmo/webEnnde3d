// js/scene/core/animate.js
export function animate(renderer, scene, camera, controls) {
  console.log("animate() iniciado");

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    if (controls) controls.update();

    renderer.render(scene, camera);
  }

  renderLoop();
}


// Ruta: js/scene/core/viewerRegistry.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

const scenes = new Map();

export function registerScene(viewerId, { scene, camera, renderer, model = null, controls = null }) {
  scenes.set(viewerId, { scene, camera, renderer, model, controls });
}

export function registerViewer(id, scene, camera, renderer, model, controls) {
  scenes.set(id, { scene, camera, renderer, model, controls });
}

export function updateModel(viewerId, model) {
  const entry = scenes.get(viewerId);
  if (entry) entry.model = model;
}

export function getSceneById(viewerId) {
  return scenes.get(viewerId)?.scene || null;
}

export function getCameraById(viewerId) {
  return scenes.get(viewerId)?.camera || null;
}

export function getRendererById(viewerId) {
  return scenes.get(viewerId)?.renderer || null;
}

export function getModelById(viewerId) {
  return scenes.get(viewerId)?.model || null;
}

export function getControlsById(viewerId) {
  return scenes.get(viewerId)?.controls || null;
}

window.getCameraById = getCameraById;
window.getControlsById = getControlsById;

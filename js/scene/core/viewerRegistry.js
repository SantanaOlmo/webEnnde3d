// js/scene/core/viewerRegistry.js

const scenes = new Map();

export function registerScene(viewerId, { scene, camera, renderer, model = null }) {
  scenes.set(viewerId, { scene, camera, renderer, model });
}

// Setters
export function updateModel(viewerId, model) {
  const entry = scenes.get(viewerId);
  if (entry) entry.model = model;
}

// Getters
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




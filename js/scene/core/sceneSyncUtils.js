// Ruta: js/scene/core/sceneSyncUtils.js

import { getActiveViewer, isSyncMode } from '../../ui/viewerSwitch.js';
import {
  getSceneById,
  getCameraById,
  getRendererById,
  getModelById
} from './viewerRegistry.js';

const viewerIdMap = {
  1: ['indexViewer1', 'viewer1'],
  2: ['viewer2']
};

export function applyToRelevantViewers(callback) {
  const apply = (viewerId) => {
    const context = {
      viewerId,
      scene: getSceneById(viewerId),
      camera: getCameraById(viewerId),
      renderer: getRendererById(viewerId),
      model: getModelById(viewerId),
    };
    if (context.scene) callback(context);
  };

  if (isSyncMode()) {
    viewerIdMap[1].forEach(apply);
    viewerIdMap[2].forEach(apply);
  } else {
    const ids = viewerIdMap[getActiveViewer()];
    ids.forEach(apply);
  }
}

export function applyClippingPlaneSmart(callback) {
  if (window.model1 && window.model2 && window.activeModel) {
    const ids = ['indexViewer1', 'viewer2'];
    const models = [window.model1, window.model2];
    models.forEach((model, i) => {
      const viewerId = ids[i];
      callback(model, viewerId);
    });
  } else {
    const model = window.activeModel || window.model;
    const viewerId = new URLSearchParams(window.location.search).get('viewerId') || 'indexViewer1';
    if (model) callback(model, viewerId);
  }
}


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
    /*console.log("📡 applyToRelevantViewers →", viewerId, context.scene);*/
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

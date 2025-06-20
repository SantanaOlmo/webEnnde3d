// js/ui/viewerSwitch.js

let activeViewer = 1;
let syncMode = false;

export function getActiveViewer() {
  return activeViewer;
}

export function isSyncMode() {
  return syncMode;
}

export function toggleSyncMode() {
  syncMode = !syncMode;
  return syncMode;
}

export function initViewerSwitchUI(viewer1Id = 'viewer1') {
  const button = document.getElementById('btn-SwitchViewer');
  
  function updateUI() {
    button.style.backgroundColor = activeViewer === 1 ? 'green' : 'blue';

    const targetId = activeViewer === 1 ? viewer1Id : 'viewer2';
    const target = document.getElementById(targetId);
    
    if (!target) return;

    target.style.boxShadow = `0 0 0 3px ${button.style.backgroundColor}`;
    target.style.transition = 'box-shadow .2s ease-in-out';
    setTimeout(() => {
      target.style.boxShadow = 'none';
    }, 1500);
  }

  button.addEventListener('click', () => {
    activeViewer = activeViewer === 1 ? 2 : 1;
    updateUI();
  });

  updateUI();
}

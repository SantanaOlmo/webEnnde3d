// ./js/resizer.js
const contenido = document.querySelector('.contenido');
const leftPanel = document.querySelector('.c-viewer1');
const rightPanel = document.querySelector('.c-viewer2');

const resizer = document.createElement('div');
resizer.classList.add('resizer');
contenido.appendChild(resizer);

let isResizing = false;

function isDesktop() {
  return window.innerWidth >= 992;
}

resizer.addEventListener('mousedown', () => {
  isResizing = true;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.userSelect = 'auto';
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;

  if (isDesktop()) {
    // Horizontal resize
    let containerRect = contenido.getBoundingClientRect();
    let offsetX = e.clientX - containerRect.left;
    
    // Limites para no romper
    offsetX = Math.max(offsetX, containerRect.width * 0.1);
    offsetX = Math.min(offsetX, containerRect.width * 0.9);

    let leftPercent = (offsetX / containerRect.width) * 100;
    let rightPercent = 100 - leftPercent;

    leftPanel.style.flexBasis = leftPercent + '%';
    rightPanel.style.flexBasis = rightPercent + '%';

    resizer.style.left = leftPercent + '%';

  } else {
    // Vertical resize
    let containerRect = contenido.getBoundingClientRect();
    let offsetY = e.clientY - containerRect.top;

    offsetY = Math.max(offsetY, containerRect.height * 0.1);
    offsetY = Math.min(offsetY, containerRect.height * 0.9);

    let topPercent = (offsetY / containerRect.height) * 100;
    let bottomPercent = 100 - topPercent;

    leftPanel.style.flexBasis = topPercent + '%';
    rightPanel.style.flexBasis = bottomPercent + '%';

    resizer.style.top = topPercent + '%';
  }
});

// Actualizar resizer en resize ventana para ajustar posición
window.addEventListener('resize', () => {
  if (isDesktop()) {
    let leftPercent = parseFloat(leftPanel.style.flexBasis) || 50;
    resizer.style.left = leftPercent + '%';
    resizer.style.top = '0';
  } else {
    let topPercent = parseFloat(leftPanel.style.flexBasis) || 50;
    resizer.style.top = topPercent + '%';
    resizer.style.left = '0';
  }
});

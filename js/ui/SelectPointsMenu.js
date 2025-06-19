// Ruta: ./js/ui/SelectPointsMenus.js
// Alterna la visibilidad del menú de puntos en ambos visores al pulsar el botón del sidebar

const pointsBarIds = ['pointsBar1', 'pointsBar2'];
let pointsMenuVisible = false;

// Guarda referencias seguras a los 6 labels de puntos (3 por visor)
const pointLabels = [
  document.getElementById('point1-1'),
  document.getElementById('point1-2'),
  document.getElementById('point1-3'),
  document.getElementById('point2-1'),
  document.getElementById('point2-2'),
  document.getElementById('point2-3')
];

const selectPointsBtn = document.getElementById('btn-selectPoints');
if (selectPointsBtn) {
  selectPointsBtn.addEventListener('click', () => {
    pointsMenuVisible = !pointsMenuVisible;
    pointsBarIds.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = pointsMenuVisible ? 'flex' : 'none';
    });
  });
}

// Parpadeo con color diferente por punto (blinking-1, blinking-2, blinking-3)
let blinkInterval = null;
let currentBlinkBtn = null;
let currentBlinkClass = '';

/**
 * Inicia el parpadeo en el label de punto recibido, usando color según el número de punto.
 * Detiene cualquier otro parpadeo activo.
 * @param {HTMLElement} btnElement - Elemento del punto que debe parpadear.
 * @param {number} punto - El número de punto (1, 2 o 3).
 */
export function startButtonBlink(btnElement, punto) {
  stopButtonBlink();
  if (!btnElement || ![1,2,3].includes(punto)) return;

  currentBlinkBtn = btnElement;
  currentBlinkClass = `blinking-${punto}`;
  blinkInterval = setInterval(() => {
    btnElement.classList.toggle(currentBlinkClass);
  }, 400);
}

/**
 * Detiene el parpadeo activo, si lo hay.
 */
export function stopButtonBlink() {
  if (blinkInterval) clearInterval(blinkInterval);
  if (currentBlinkBtn && currentBlinkClass) {
    currentBlinkBtn.classList.remove(currentBlinkClass);
  }
  currentBlinkBtn = null;
  currentBlinkClass = '';
}



// Llama a esto para que todos los puntos parpadeen a la vez
//startButtonBlink(pointLabels[0], 1); // Punto 1 visor 1 (amarillo)
//startButtonBlink(pointLabels[1], 2); // Punto 2 visor 1 (verde)
//startButtonBlink(pointLabels[2], 3); // Punto 3 visor 1 (azul)
//startButtonBlink(pointLabels[3], 1); // Punto 1 visor 2 (amarillo)
//startButtonBlink(pointLabels[4], 2); // Punto 2 visor 2 (verde)
//startButtonBlink(pointLabels[5], 3); // Punto 3 visor 2 (azul)

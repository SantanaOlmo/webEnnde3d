// tooltips.js

function initAllTooltips() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    // Limpia instancia previa si la hay
    const prev = bootstrap.Tooltip.getInstance(el);
    if (prev) prev.dispose();
    new bootstrap.Tooltip(el, {
      trigger: 'hover focus',
      container: 'body'
    });
  });
}

// Inicializa tooltips en todos los elementos visibles al cargar
document.addEventListener('DOMContentLoaded', function () {
  initAllTooltips();

  // Observador para detectar elementos nuevos con tooltip (incluyendo cuando se muestran helpers)
  const observer = new MutationObserver(() => {
    // Inicializa solo en los elementos visibles y con data-bs-toggle="tooltip"
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      // Solo si está visible y no tiene tooltip activo aún
      const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      const prev = bootstrap.Tooltip.getInstance(el);
      if (isVisible && !prev) {
        new bootstrap.Tooltip(el, {
          trigger: 'hover focus',
          container: 'body'
        });
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['style', 'class'],
  });
});

// Oculta tooltip SIEMPRE al salir del hover (aunque desaparezca el botón o cambie el DOM)
document.addEventListener('mouseleave', function (e) {
  if (
    e.target instanceof Element &&
    e.target.matches('[data-bs-toggle="tooltip"]')
  ) {
    const tip = bootstrap.Tooltip.getInstance(e.target);
    if (tip) tip.hide();
  }
}, true);

// Oculta todos los tooltips al hacer scroll
window.addEventListener('scroll', function () {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    const tip = bootstrap.Tooltip.getInstance(el);
    if (tip) tip.hide();
  });
});

// (Opcional) Oculta el tooltip al hacer click en el botón
document.addEventListener('click', function (e) {
  if (
    e.target instanceof Element &&
    e.target.matches('[data-bs-toggle="tooltip"]')
  ) {
    const tip = bootstrap.Tooltip.getInstance(e.target);
    if (tip) tip.hide();
  }
}, true);

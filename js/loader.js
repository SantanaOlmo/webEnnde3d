// js/loader.js
console.info('%c Proyecto desarrollado por Alberto Estepa y David Gutiérrez (DAM 2025) para ENNDE', 'color:#b97593; font-weight:bold; font-size:1.1em;');

window.addEventListener('load', () => {
  const loader = document.getElementById('loader-container');
  if (loader) {
    loader.style.display = 'flex';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 1000);
  }
});

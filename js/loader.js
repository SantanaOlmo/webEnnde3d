// js/loader.js

window.addEventListener('load', () => {
  const loader = document.getElementById('loader-container');
  if (loader) {
    loader.style.display = 'flex';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 1000);
  }
});

// script.js

// Ejecuta el código una vez que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

  // Lista de vídeos a mostrar en carrusel en la cabecera
  const videos = [
    "assets/gif_video360/3DOB1.mp4",
    "assets/gif_video360/3DOB9.mp4",
    "assets/gif_video360/3DOB6.mp4",
  ];

  let videoIndex = 0; // Índice actual del vídeo
  const videoElement = document.getElementById("videoCarrusel");

  // Cambia el vídeo del carrusel con efecto de opacidad
  function cambiarVideoConFade() {
    videoElement.style.opacity = 0;

    setTimeout(() => {
      videoElement.src = videos[videoIndex];
      videoElement.load();
      videoElement.play();
      videoElement.style.opacity = 1;

      videoIndex = (videoIndex + 1) % videos.length;
    }, 1000);
  }

  // Reproduce un nuevo vídeo cada 5 segundos
  setInterval(cambiarVideoConFade, 5000);
  cambiarVideoConFade();


  // MENÚ BURGUER RESPONSIVE

  const burguer = document.querySelector('.burguer');
  const navLinks = document.getElementById('navlinks');

  if (burguer && navLinks) {

    // Muestra u oculta el menú al hacer clic en el icono
    burguer.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });

    // Cierra el menú al hacer clic en cualquier enlace
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('show');
      });
    });
  }

  // Doble refuerzo: cierra el menú al hacer clic en cualquier enlace
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });

});

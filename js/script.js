document.addEventListener("DOMContentLoaded", () => {



  // === GIF CARRUSEL EN CABECERA ===

  const videos = [
  "assets/gif_video360/3DOB1.mp4",
  "assets/gif_video360/3DOB9.mp4",
  "assets/gif_video360/3DOB6.mp4",
  "assets/gif_video360/3DOB5.mp4",
];

let videoIndex = 0;
const videoElement = document.getElementById("videoCarrusel");

function cambiarVideoConFade() {
  videoElement.style.opacity = 0;

  setTimeout(() => {
    videoElement.src = videos[videoIndex];
    videoElement.load();
    videoElement.play();
    videoElement.style.opacity = 1;

    videoIndex = (videoIndex + 1) % videos.length;
  }, 1000); // 1 segundo para el fade-out
}

setInterval(cambiarVideoConFade, 5000);
cambiarVideoConFade();


  // === MENÚ BURGUER ===
const burguer = document.querySelector('.burguer');
const navLinks = document.getElementById('navlinks');

if (burguer && navLinks) {
  burguer.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  const navItems = navLinks.querySelectorAll('a');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });
}

  // Cerrar menú al hacer clic en un enlace
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });


});
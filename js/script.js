// script.js

document.addEventListener("DOMContentLoaded", () => {

  const videos = [
    "assets/gif_video360/3DOB1.mp4",
    "assets/gif_video360/3DOB9.mp4",
    "assets/gif_video360/3DOB6.mp4",
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
    }, 1000);
  }

  setInterval(cambiarVideoConFade, 5000);
  cambiarVideoConFade();

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

  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });

});

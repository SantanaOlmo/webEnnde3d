document.addEventListener("DOMContentLoaded", () => {



  // === GIF CARRUSEL EN CABECERA ===

  const imagenesFondo = [
    "assets/gif_360/Kaws_Bunny.gif",
    "assets/gif_360/trompo.gif",
    "assets/gif_360/car.gif"
  ];

  let index = 0;

  setInterval(() => {
    const gif = document.getElementById("gifCarrusel");
    if (gif) {
      gif.src = imagenesFondo[index];
      index = (index + 1) % imagenesFondo.length;
    }
  }, 8000);

  

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
  const burguer = document.querySelector('.burguer');
  const navLinks = document.getElementById('navlinks');

  burguer.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  // Cerrar menú al hacer clic en un enlace
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });

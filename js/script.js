document.addEventListener("DOMContentLoaded", () => {

  function dropHandler(ev) {
    console.log("File(s) dropped");
    ev.preventDefault();

    // Quitar la clase visual
    ev.target.classList.remove("drag-over");

    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          console.log(`… file[${i}].name = ${file.name}`);
        }
      });
    } else {
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
      });
    }
  }

  function dragOverHandler(ev) {
    ev.preventDefault();
    console.log("File(s) in drop zone");

    ev.target.classList.add("drag-over"); // Añade la clase mientras el archivo está encima
  }

  function dragEnterHandler(ev) {
    ev.preventDefault();
    ev.target.classList.add("drag-over");
  }

  function dragLeaveHandler(ev) {
    ev.target.classList.remove("drag-over"); // Quita la clase cuando el archivo sale
  }
  


  // === GIF CARRUSEL EN CABECERA ===

  const videos = [
  "assets/gif_video360/3DOB1.mp4",
  "assets/gif_video360/3DOB9.mp4",
  "assets/gif_video360/3DOB6.mp4",
  "assets/gif_video360/3DOB11.mp4",
  "assets/gif_video360/3DOB5.mp4",
  "assets/gif_video360/3DOB2.mp4",
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
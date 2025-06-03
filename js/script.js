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

  // Cerrar menú al hacer clic en un enlace
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
    });
  });
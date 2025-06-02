const imagenesFondo = [
    "url('/assets/gif_360/Kaws_Bunny.gif')",
    "url('/assets/gif_360/trompo.gif')",
    "url('/assets/gif_360/car.gif')"
  ];

  let index = 0;

  function cambiarFondo() {
    const inicio = document.querySelector('main > #cabeceraLoop');
    if (inicio) {
      inicio.style.backgroundImage = imagenesFondo[index];
      inicio.style.backgroundSize = "cover";
      inicio.style.backgroundPosition = "60%";
      inicio.style.transition = "background-image 1s ease-in-out";
      index = (index + 1) % imagenesFondo.length;
    }
  }

  setInterval(cambiarFondo, 8000); // cambia cada 8 segundos

  cambiarFondo(); // llama una vez al principio para poner la primera imagen

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

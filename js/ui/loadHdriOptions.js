// Ruta: ./js/ui/loadHdriOptions.js
//GENERA AUTOTMATICAMENTE LAS IMAGENES DE LOS HDRI EN EL ASIDE
const bloqueHDRI = document.getElementById('bloqueHDRI');

async function loadHDRIOptions() {
  try {
    const res = await fetch('/assets/hdri/hdriList.json');
    const names = await res.json();

    names.forEach(name => {
      const img = document.createElement('img');
      img.className = 'envOption';
      img.src = `/assets/hdri/hdr_img/${name}.png`;
      img.alt=`${name}`;
      img.id=`${name}`;
      

      const div = document.createElement('div');
      div.className = 'tarjeta';
      div.appendChild(img);

      bloqueHDRI.appendChild(div);
    });
  } catch (err) {
    console.error('Error cargando HDRIs:', err);
  }
}

loadHDRIOptions();


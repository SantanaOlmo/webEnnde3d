let btnOptions = document.getElementById('options');
let form;
import {actualizarModelo} from '/js/scene.js';
btnOptions.addEventListener('click',function(){

});

form = document.getElementById('formStyles');
form.addEventListener('input',function(){
   const datos = Object.fromEntries(new FormData(form).entries());

    datos.roughness=parseFloat(datos.roughness)/1000;
    datos.metalness=parseFloat(datos.metalness)/1000;
    sessionStorage.setItem('estilos',JSON.stringify(datos))
    actualizarModelo();
    });

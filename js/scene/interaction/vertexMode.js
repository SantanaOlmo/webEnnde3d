// ./js/scene/interaction/vertexMode.js
let modoVerticesActivo = false;

export function getModoVerticesActivo() {
  return modoVerticesActivo;
}

export function setModoVerticesActivo(valor) {
  modoVerticesActivo = Boolean(valor);
}

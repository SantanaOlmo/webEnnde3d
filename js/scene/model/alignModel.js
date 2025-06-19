// Supón que tienes 3 puntos seleccionados de cada modelo:
const A = [a1, a2, a3]; // Vector3 del modelo A
const B = [b1, b2, b3]; // Vector3 del modelo B

function alignPoints(A, B) {
  // Paso 1: calcular centroides
  const centroidA = new THREE.Vector3().addVectors(A[0], A[1]).add(A[2]).divideScalar(3);
  const centroidB = new THREE.Vector3().addVectors(B[0], B[1]).add(B[2]).divideScalar(3);

  // Paso 2: centra los puntos
  const AA = A.map(p => p.clone().sub(centroidA));
  const BB = B.map(p => p.clone().sub(centroidB));

  // Paso 3: calcula la escala
  const scaleA = Math.sqrt(AA.reduce((sum, v) => sum + v.lengthSq(), 0));
  const scaleB = Math.sqrt(BB.reduce((sum, v) => sum + v.lengthSq(), 0));
  const scale = scaleB / scaleA;

  // Paso 4: calcula la matriz de rotación usando SVD (Kabsch)
  // Construye la matriz de covarianza
  let H = new THREE.Matrix3();
  for (let i = 0; i < 3; i++) {
    H.elements[0] += AA[i].x * BB[i].x;
    H.elements[1] += AA[i].x * BB[i].y;
    H.elements[2] += AA[i].x * BB[i].z;
    H.elements[3] += AA[i].y * BB[i].x;
    H.elements[4] += AA[i].y * BB[i].y;
    H.elements[5] += AA[i].y * BB[i].z;
    H.elements[6] += AA[i].z * BB[i].x;
    H.elements[7] += AA[i].z * BB[i].y;
    H.elements[8] += AA[i].z * BB[i].z;
  }
  // Para la rotación exacta necesitas hacer una descomposición SVD.
  // Aquí te dejo una librería para eso: https://github.com/mljs/svd
  // Como atajo, si usas tres puntos, puedes construir la rotación usando quaternion.setFromUnitVectors.

  // Calcula vectores normales para ambos triángulos
  const nA = new THREE.Vector3().crossVectors(AA[1], AA[2]);
  const nB = new THREE.Vector3().crossVectors(BB[1], BB[2]);
  const q = new THREE.Quaternion().setFromUnitVectors(nA.clone().normalize(), nB.clone().normalize());

  // Paso 5: construye la matriz de transformación
  const m = new THREE.Matrix4();
  m.makeRotationFromQuaternion(q);
  m.scale(new THREE.Vector3(scale, scale, scale));
  m.setPosition(centroidB.clone().sub(centroidA.clone().applyQuaternion(q).multiplyScalar(scale)));

  return m;
}

//ESTO SON LAS DOS COSAS QUE HAY QUE HACER PARA PARA RELOCALIZAR EL MODELO EN CUESTION
// Luego simplemente:
const matrix = alignPoints(A, B);
aplicarMatrizTransformacion(model, matrix);

// ./js/scene/model/alignModel.js
import * as THREE from 'three';

export function alignPoints(A, B) {
  // Paso 1: calcular centroides
  const centroidA = new THREE.Vector3().addVectors(A[0], A[1]).add(A[2]).divideScalar(3);
  const centroidB = new THREE.Vector3().addVectors(B[0], B[1]).add(B[2]).divideScalar(3);
  console.log('centroidA:', centroidA);
  console.log('centroidB:', centroidB);

  // Paso 2: centra los puntos
  const AA = A.map(p => p.clone().sub(centroidA));
  const BB = B.map(p => p.clone().sub(centroidB));
  console.log('AA:', AA);
  console.log('BB:', BB);

  // Paso 3: calcula la escala
  const scaleA = Math.sqrt(AA.reduce((sum, v) => sum + v.lengthSq(), 0));
  const scaleB = Math.sqrt(BB.reduce((sum, v) => sum + v.lengthSq(), 0));
  const scale = scaleB / scaleA;
  console.log('scaleA:', scaleA, 'scaleB:', scaleB, 'scale:', scale);

  // Paso 4: calcula la matriz de rotación usando SVD (Kabsch)
  const nA = new THREE.Vector3().crossVectors(AA[1], AA[2]);
  const nB = new THREE.Vector3().crossVectors(BB[1], BB[2]);
  const q = new THREE.Quaternion().setFromUnitVectors(nA.clone().normalize(), nB.clone().normalize());
  console.log('nA:', nA, 'nB:', nB, 'quaternion:', q);

  // Paso 5: construye la matriz de transformación
  const m = new THREE.Matrix4();
  m.makeRotationFromQuaternion(q);
  m.scale(new THREE.Vector3(scale, scale, scale));
  m.setPosition(centroidB.clone().sub(centroidA.clone().applyQuaternion(q).multiplyScalar(scale)));
  console.log('matrix:', m.elements);

  return m;
}



// ✅ ./js/scene/environment/hdriManager.js
//recibe una ruta hdri, una escena y aplica el fondo
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export async function setHdriEnvironment(path, scene, renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const texture = await new RGBELoader().loadAsync(path);
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  scene.environment = envMap;
  scene.background = envMap;

  texture.dispose();
  pmremGenerator.dispose();
}

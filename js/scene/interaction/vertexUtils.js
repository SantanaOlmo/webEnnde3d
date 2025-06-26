// js/scene/interaction/vertexUtils.js

import * as THREE from 'three';

export function guardarVertices(model) {
  const vertices = [];
  model.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const pos = child.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        child.localToWorld(v);
        vertices.push(v);
      }
    }
  });
  return vertices;
}

// === CREAR NUBE DE PUNTOS ===

export function crearNubeDePuntos(modelo) {
  let nubeCreada = false;

  modelo.traverse((child) => {
    if (child.isMesh && child.geometry?.attributes?.position) {
      const posAttr = child.geometry.attributes.position;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', posAttr.clone());

      // === ASIGNAR COLORES INDIVIDUALES (RGB blanco por defecto) ===
      const numVertices = posAttr.count;
      const colorArray = new Float32Array(numVertices * 3);
      for (let i = 0; i < numVertices; i++) {
        colorArray[i * 3 + 0] = 1.0; // R
        colorArray[i * 3 + 1] = 0.0; // G
        colorArray[i * 3 + 2] = 1.0; // B
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

      const material = new THREE.PointsMaterial({
        size: 0.02,              // Tamaño de cada punto
        vertexColors: true,      // Permite color por vértice
        map: createCircleTexture(), // Usa textura circular para puntos redondos
        alphaTest: 0.5,          // Hace transparente el fondo del sprite
        transparent: true        // Permite transparencia
      });


      // Tamaño para el raycaster
      material.userData.pickSize = 0.13;

      const puntos = new THREE.Points(geometry, material);
      puntos.name = 'puntos_nube';
      puntos.visible = false;
      puntos.renderOrder=1;

      // Añadir al mesh original
      child.add(puntos);
      child.userData.nubePuntos = puntos;

      nubeCreada = true;
    }
  });

  // Si no se pudo crear la nube, no mostramos ningún log ni advertencia
}

function createCircleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

export function crearNubeDePuntosConDesplazamientoVisual(modelo, offset = 0.005) {
  modelo.traverse((child) => {
    if (
      child.isMesh &&
      child.geometry?.attributes?.position &&
      child.geometry?.attributes?.normal
    ) {
      const posAttr = child.geometry.attributes.position;
      const normAttr = child.geometry.attributes.normal;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', posAttr.clone());
      geometry.setAttribute('normal', normAttr.clone());

      // Colores por vértice (blanco-violeta por defecto)
      const numVertices = posAttr.count;
      const colorArray = new Float32Array(numVertices * 3);
      for (let i = 0; i < numVertices; i++) {
        colorArray[i * 3 + 0] = 1.0; // R
        colorArray[i * 3 + 1] = 0.0; // G
        colorArray[i * 3 + 2] = 1.0; // B
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

      // Custom ShaderMaterial
      const material = new THREE.ShaderMaterial({
        uniforms: {
          size: { value: 0.02 },
          offset: { value: offset },
          map: { value: createCircleTexture() }
        },
        vertexColors: true,
        transparent: true,
        alphaTest: 0.5,
        depthTest: true,
        uniformsNeedUpdate: true,
        vertexShader: `
          attribute vec3 normal;
          uniform float size;
          uniform float offset;
          void main() {
            vec3 displaced = position + normal * offset;
            vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          varying vec3 vColor;
          void main() {
            vec4 color = vec4(1.0);
            #ifdef USE_COLOR
              color *= vec4(vColor, 1.0);
            #endif
            vec2 uv = gl_PointCoord;
            float alpha = texture2D(map, uv).a;
            if (alpha < 0.5) discard;
            gl_FragColor = color;
            gl_FragColor.a *= alpha;
          }
        `
      });

      // Tamaño para el raycaster
      material.userData.pickSize = 0.13;

      const puntos = new THREE.Points(geometry, material);
      puntos.name = 'puntos_nube';
      puntos.visible = false;
      puntos.renderOrder = 1;

      child.add(puntos);
      child.userData.nubePuntos = puntos;
    }
  });
}

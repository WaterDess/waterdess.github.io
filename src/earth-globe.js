import * as THREE from "../public/vendor/three.module.min.js";

const FULL_TURN_SECONDS = 300;

function createStars({ color, count, opacity, phase, seed, size }) {
  const positions = new Float32Array(count * 3);
  let randomSeed = seed;

  const random = () => {
    randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
    return randomSeed / 4294967296;
  };

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = random() * 2 - 1;
    positions[offset + 1] = random() * 2 - 1;
    positions[offset + 2] = -2.4 - random() * 0.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    opacity,
    size,
    sizeAttenuation: true,
    transparent: true
  });
  const stars = new THREE.Points(geometry, material);
  stars.userData = { baseOpacity: opacity, phase };
  return stars;
}

function createAtmosphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(1.004, 96, 64),
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vViewNormal;
        void main() {
          vViewNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vViewNormal;
        void main() {
          float fresnel = pow(1.0 - max(vViewNormal.z, 0.0), 4.8);
          float alpha = smoothstep(0.18, 0.92, fresnel) * 0.16;
          gl_FragColor = vec4(0.62, 0.82, 0.88, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    })
  );
}

export function mountEarthGlobe(container, { textureUrl }) {
  if (!container || !textureUrl || !window.WebGLRenderingContext) return false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x020708, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const globeGroup = new THREE.Group();
  globeGroup.rotation.z = -0.07;
  scene.add(globeGroup);

  const starLayers = [
    createStars({ color: 0xa8c7cc, count: 380, opacity: 0.34, phase: 0.4, seed: 4137, size: 0.0075 }),
    createStars({ color: 0xe4ded0, count: 76, opacity: 0.48, phase: 2.1, seed: 9127, size: 0.012 })
  ];
  starLayers.forEach((layer) => scene.add(layer));

  const sphereGeometry = new THREE.SphereGeometry(1, 96, 64);
  const earthMaterial = new THREE.MeshBasicMaterial();
  const earth = new THREE.Mesh(sphereGeometry, earthMaterial);
  earth.visible = false;
  globeGroup.add(earth);

  const atmosphere = createAtmosphere();
  atmosphere.visible = false;
  globeGroup.add(atmosphere);

  const showStaticFallback = () => {
    renderer.setAnimationLoop(null);
    container.closest(".home-landing")?.classList.add("earth-static");
  };

  const texture = new THREE.TextureLoader().load(
    textureUrl,
    () => {
      earth.visible = true;
      atmosphere.visible = true;
      container.closest(".home-landing")?.classList.add("earth-ready");
    },
    undefined,
    showStaticFallback
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  earthMaterial.map = texture;

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const verticalFit = 3.87;
    const horizontalFit = 1 / (0.86 * aspect * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.aspect = aspect;
    camera.position.set(0, 0, Math.max(verticalFit, horizontalFit));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    const starDepth = camera.position.z + 2.8;
    const starHalfHeight = starDepth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    starLayers.forEach((layer) => layer.scale.set(starHalfHeight * aspect, starHalfHeight, 1));
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const clock = new THREE.Clock();
  const radiansPerSecond = (Math.PI * 2) / FULL_TURN_SECONDS;
  let rotation = Math.PI;

  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    rotation += delta * radiansPerSecond;
    earth.rotation.y = rotation;
    atmosphere.rotation.y = rotation;
    starLayers.forEach((layer) => {
      const { baseOpacity, phase } = layer.userData;
      layer.material.opacity = baseOpacity * (0.94 + 0.06 * Math.sin(elapsed * 0.2 + phase));
    });
    renderer.render(scene, camera);
  });

  renderer.domElement.addEventListener("webglcontextlost", () => {
    showStaticFallback();
  });

  return true;
}

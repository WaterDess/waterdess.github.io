import * as THREE from "../public/vendor/three.module.min.js";

const FULL_TURN_SECONDS = 180;

function createStars({ count, opacity, seed, size }) {
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
    color: 0xb8d1d2,
    opacity,
    size,
    sizeAttenuation: true,
    transparent: true
  });
  return new THREE.Points(geometry, material);
}

function createAtmosphere(geometry) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.16, 0.48, 0.78, rim * 0.32);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
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
    createStars({ count: 210, opacity: 0.22, seed: 4137, size: 0.006 }),
    createStars({ count: 42, opacity: 0.3, seed: 9127, size: 0.01 })
  ];
  starLayers.forEach((layer) => scene.add(layer));

  const sphereGeometry = new THREE.SphereGeometry(1, 96, 64);
  const earthMaterial = new THREE.MeshBasicMaterial();
  const earth = new THREE.Mesh(sphereGeometry, earthMaterial);
  earth.visible = false;
  globeGroup.add(earth);

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

  const atmosphereGeometry = new THREE.SphereGeometry(1.035, 72, 48);
  const atmosphere = createAtmosphere(atmosphereGeometry);
  atmosphere.visible = false;
  globeGroup.add(atmosphere);

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
    rotation += delta * radiansPerSecond;
    earth.rotation.y = rotation;
    renderer.render(scene, camera);
  });

  renderer.domElement.addEventListener("webglcontextlost", () => {
    showStaticFallback();
  });

  return true;
}

import * as THREE from "../public/vendor/three.module.min.js";

const FULL_TURN_SECONDS = 140;

function createStars() {
  const count = 560;
  const positions = new Float32Array(count * 3);
  let seed = 4137;

  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let index = 0; index < count; index += 1) {
    const radius = 8 + random() * 5;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const offset = index * 3;
    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.cos(phi);
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xb8d1d2,
    opacity: 0.28,
    size: 0.018,
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
  if (!container || !textureUrl || !window.WebGLRenderingContext) return;

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
  scene.add(createStars());

  const sphereGeometry = new THREE.SphereGeometry(1, 96, 64);
  const texture = new THREE.TextureLoader().load(
    textureUrl,
    () => container.closest(".home-landing")?.classList.add("earth-ready")
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const earth = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({ map: texture })
  );
  globeGroup.add(earth);

  const atmosphereGeometry = new THREE.SphereGeometry(1.035, 72, 48);
  globeGroup.add(createAtmosphere(atmosphereGeometry));

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
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const clock = new THREE.Clock();
  const radiansPerSecond = (Math.PI * 2) / FULL_TURN_SECONDS;
  let rotation = Math.PI;

  renderer.setAnimationLoop(() => {
    rotation += Math.min(clock.getDelta(), 0.05) * radiansPerSecond;
    earth.rotation.y = rotation;
    renderer.render(scene, camera);
  });

  renderer.domElement.addEventListener("webglcontextlost", () => {
    container.closest(".home-landing")?.classList.remove("earth-ready");
  });
}

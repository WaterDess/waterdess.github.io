import * as THREE from "../public/vendor/three.module.min.js";

const FULL_TURN_SECONDS = 500;

function createStars({ color, count, opacity, seed, size }) {
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
  return stars;
}

function createAtmosphere() {
  const atmosphere = new THREE.Group();
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.012, 96, 64),
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
          float fresnel = pow(1.0 - max(vViewNormal.z, 0.0), 3.4);
          float alpha = smoothstep(0.1, 0.9, fresnel) * 0.42;
          gl_FragColor = vec4(0.42, 0.78, 1.0, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    })
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.018, 96, 64),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0x8ce6ff,
      depthWrite: false,
      opacity: 0.32,
      side: THREE.BackSide,
      transparent: true
    })
  );
  atmosphere.add(rim, halo);
  return atmosphere;
}

function createEarthMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      earthMap: { value: texture }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vViewNormal;
      void main() {
        vUv = uv;
        vViewNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D earthMap;
      varying vec2 vUv;
      varying vec3 vViewNormal;
      void main() {
        vec3 surface = texture2D(earthMap, vUv).rgb;
        float luminance = dot(surface, vec3(0.2126, 0.7152, 0.0722));
        surface = mix(vec3(luminance), surface, 1.08);
        surface = (surface - 0.5) * 1.04 + 0.5;
        float blueLead = surface.b - max(surface.r, surface.g);
        float ocean = smoothstep(0.015, 0.16, blueLead);
        vec3 oceanGrade = surface * vec3(0.91, 0.98, 1.08) + vec3(0.005, 0.018, 0.045);
        surface = mix(surface, oceanGrade, ocean * 0.32);
        surface = pow(clamp(surface, 0.0, 1.0), vec3(0.98));
        float limbLight = mix(0.76, 1.0, smoothstep(0.04, 0.82, max(vViewNormal.z, 0.0)));
        surface *= limbLight;
        gl_FragColor = vec4(surface, 1.0);
      }
    `
  });
}

export function mountEarthGlobe(container, { onFallback, textureUrl }) {
  if (!container || !textureUrl || !window.WebGLRenderingContext) return false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x01080d, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const globeGroup = new THREE.Group();
  globeGroup.rotation.z = -0.07;
  scene.add(globeGroup);

  const starLayers = [
    createStars({ color: 0x8caeb9, count: 82, opacity: 0.34, seed: 4137, size: 0.008 }),
    createStars({ color: 0xd7e0de, count: 18, opacity: 0.58, seed: 9127, size: 0.015 }),
    createStars({ color: 0xf3f6f2, count: 4, opacity: 0.8, seed: 1783, size: 0.023 })
  ];
  starLayers.forEach((layer) => scene.add(layer));

  const sphereGeometry = new THREE.SphereGeometry(1, 96, 64);
  const earth = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial());
  earth.visible = false;
  globeGroup.add(earth);

  const atmosphere = createAtmosphere();
  atmosphere.visible = false;
  globeGroup.add(atmosphere);

  const showStaticFallback = () => {
    renderer.setAnimationLoop(null);
    onFallback?.();
  };

  const texture = new THREE.TextureLoader().load(
    textureUrl,
    () => {
      earth.material = createEarthMaterial(texture);
      earth.visible = true;
      atmosphere.visible = true;
      container.closest(".home-landing")?.classList.add("earth-ready");
    },
    undefined,
    showStaticFallback
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

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
    atmosphere.rotation.y = rotation;
    renderer.render(scene, camera);
  });

  renderer.domElement.addEventListener("webglcontextlost", () => {
    showStaticFallback();
  });

  return true;
}

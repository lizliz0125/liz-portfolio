<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import * as THREE from 'three';
import { heroParticleLightLocked } from '@/config/heroVisualLock';

/** 用于采样生成粒子的图片（动效逻辑不变，仅像素来源可换）。建议 JPG/PNG，横图更佳。 */
const props = defineProps({
  imageUrl: {
    type: String,
    default: '/backgrounds/mountains.jpg',
  },
  /** 稀疏粒子、整体更淡，适合叠在底图上做「轻粒子」 */
  lightMode: {
    type: Boolean,
    default: false,
  },
  /** 采样前压暗部、略提对比（与底图 CSS 观感更接近） */
  gradeForSample: {
    type: Boolean,
    default: false,
  },
});

function boostRgbForOverlay(r, g, b) {
  const { colorGain, colorFloor } = heroParticleLightLocked;
  return [
    Math.min(1, r * colorGain + colorFloor),
    Math.min(1, g * colorGain + colorFloor),
    Math.min(1, b * colorGain + colorFloor),
  ];
}

function gradeRgb(r, g, b) {
  const contrast = 1.2;
  const crush = 0.88;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  r = clamp((r - 0.5) * contrast + 0.5) * crush;
  g = clamp((g - 0.5) * contrast + 0.5) * crush;
  b = clamp((b - 0.5) * contrast + 0.5) * crush;
  return [r, g, b];
}

const FALLBACK_IMAGE = '/backgrounds/mountains.jpg';

const container = ref(null);

let scene;
let camera;
let renderer;
let particles;
let geometry;
let animationFrameId;
let resizeObserver;
let visibilityObserver;

/** 滚离再滚回 Hero 时，浏览器常回收 WebGL；需 teardown 后重 init，不能因 renderer 仍存在而跳过 */
let restartDebounceT;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

let visibleWidth = 0;
let visibleHeight = 0;

let containerWidth = 0;
let containerHeight = 0;

/** 首帧容器常为 0×0（IDE 预览、flex 布局），会导致 visible 尺寸与 scale 无效、粒子「消失」 */
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 80;

const updateVisibleDimensions = () => {
  if (!camera) return;
  const fovRad = camera.fov * Math.PI / 180;
  visibleHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
  visibleWidth = visibleHeight * camera.aspect;
};

function teardownWebGL() {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = undefined;

  if (resizeObserver && container.value) {
    try {
      resizeObserver.disconnect();
    } catch {
      /* noop */
    }
  }
  resizeObserver = null;

  if (visibilityObserver && container.value) {
    try {
      visibilityObserver.disconnect();
    } catch {
      /* noop */
    }
  }
  visibilityObserver = null;

  if (renderer) {
    const dom = renderer.domElement;
    dom.removeEventListener('mousedown', onMouseDown);
    dom.removeEventListener('mousemove', onMouseMove);
    dom.removeEventListener('mouseup', onMouseUp);
    dom.removeEventListener('mouseleave', onMouseUp);
    dom.removeEventListener('webglcontextlost', onWebglContextLost);
    dom.removeEventListener('webglcontextrestored', onWebglContextRestored);

    if (particles && scene) {
      scene.remove(particles);
    }
    if (geometry) {
      geometry.dispose();
      geometry = undefined;
    }
    if (particles?.material) {
      particles.material.dispose();
    }
    particles = undefined;

    try {
      if (container.value && dom.parentNode === container.value) {
        container.value.removeChild(dom);
      }
    } catch {
      /* noop */
    }
    renderer.dispose();
    renderer = undefined;
  }

  scene = undefined;
  camera = undefined;
}

function scheduleRestart() {
  clearTimeout(restartDebounceT);
  restartDebounceT = window.setTimeout(() => {
    restartDebounceT = undefined;
    teardownWebGL();
    initAttempts = 0;
    nextTick(() => {
      requestAnimationFrame(() => {
        init();
      });
    });
  }, 0);
}

function onWebglContextLost(e) {
  e.preventDefault();
  cancelAnimationFrame(animationFrameId);
  animationFrameId = undefined;
  scheduleRestart();
}

function onWebglContextRestored() {
  scheduleRestart();
}

/** 滚回视区时：若上下文已丢或粒子未挂上，则恢复 */
function ensureWebGLAlive() {
  if (!renderer || !container.value) return;
  const gl = renderer.getContext();
  if (gl?.isContextLost?.()) {
    scheduleRestart();
    return;
  }
  if (!particles && scene && camera) {
    loadImageAndCreateParticles();
  }
}

const init = () => {
  if (!container.value) return;
  if (renderer) return;

  const rect = container.value.getBoundingClientRect();
  containerWidth = rect.width;
  containerHeight = rect.height;

  if (containerWidth < 8 || containerHeight < 8) {
    if (initAttempts++ < MAX_INIT_ATTEMPTS) {
      requestAnimationFrame(init);
    }
    return;
  }
  initAttempts = 0;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
  camera.position.z = 300;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);

  updateVisibleDimensions();
  loadImageAndCreateParticles();

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) continue;
      containerWidth = width;
      containerHeight = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateVisibleDimensions();
    }
  });
  resizeObserver.observe(container.value);

  const dom = renderer.domElement;
  dom.addEventListener('mousedown', onMouseDown);
  dom.addEventListener('mousemove', onMouseMove);
  dom.addEventListener('mouseup', onMouseUp);
  dom.addEventListener('mouseleave', onMouseUp);
  dom.addEventListener('webglcontextlost', onWebglContextLost, false);
  dom.addEventListener('webglcontextrestored', onWebglContextRestored, false);

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.02) {
          ensureWebGLAlive();
        }
      }
    },
    { root: null, threshold: [0, 0.02, 0.1] },
  );
  visibilityObserver.observe(container.value);

  animate();
};

const loadImageAndCreateParticles = () => {
  const img = new Image();
  const src = props.imageUrl || FALLBACK_IMAGE;
  img.src = src;

  img.onerror = () => {
    if (img.src.includes('/backgrounds/mountains.jpg')) return;
    img.src = FALLBACK_IMAGE;
  };

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgWidth = 800;
    const imgHeight = Math.max(
      1,
      Math.floor((img.height / (img.width || 1)) * imgWidth),
    );

    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    const imgData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

    const buildParticles = (attempt = 0) => {
      updateVisibleDimensions();
      const scale = Math.max(
        visibleWidth / imgWidth,
        visibleHeight / imgHeight,
        1e-3,
      );
      if (
        !Number.isFinite(scale) ||
        !Number.isFinite(visibleWidth) ||
        !Number.isFinite(visibleHeight) ||
        visibleWidth < 1e-6 ||
        visibleHeight < 1e-6
      ) {
        if (attempt < 60) {
          requestAnimationFrame(() => buildParticles(attempt + 1));
        }
        return;
      }

      if (particles) {
        scene.remove(particles);
        geometry?.dispose();
        particles.material?.dispose?.();
        particles = null;
        geometry = null;
      }

      geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const alphas = [];
    const originalPositions = [];

    const alphaCutoff = props.lightMode
      ? heroParticleLightLocked.alphaCutoff
      : 0.05;

    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const index = (y * imgWidth + x) * 4;
        let r = imgData[index] / 255;
        let g = imgData[index + 1] / 255;
        let b = imgData[index + 2] / 255;
        const a = imgData[index + 3] / 255;

        if (props.gradeForSample) {
          [r, g, b] = gradeRgb(r, g, b);
        }

        if (a > 0.1) {
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          const dx = x - imgWidth / 2;
          const dy = y - imgHeight / 2;
          let posX = dx * scale;
          let posY = -dy * scale;

          let posZ = (luminance - 0.5) * visibleWidth * 0.08;

          const normalizedX = Math.abs(dx) / (imgWidth / 2);
          const normalizedY = Math.abs(dy) / (imgHeight / 2);

          const noise = (Math.sin(x * 0.05) * Math.cos(y * 0.05) + Math.sin((x + y) * 0.02)) * 0.08;
          const edgeFactor = Math.max(normalizedX, normalizedY) + noise;

          let alpha = 1.0;
          let size = scale * 1.8;

          const solidZone = 0.65;
          const edgeZone = 0.90;

          if (edgeFactor > solidZone) {
            const scatterFactor = (edgeFactor - solidZone) / (1.0 - solidZone);
            const smoothScatter = Math.pow(scatterFactor, 2.0);

            const maxZScatter = visibleWidth * 0.2;
            posZ += (Math.random() - 0.5) * maxZScatter * smoothScatter;

            const maxXYScatter = scale * 40.0;
            posX += (Math.random() - 0.5) * maxXYScatter * smoothScatter;
            posY += (Math.random() - 0.5) * maxXYScatter * smoothScatter;

            size = (scale * 1.8) - (scale * 1.2 * smoothScatter);

            if (edgeFactor > edgeZone) {
              alpha = 1.0 - (edgeFactor - edgeZone) / (1.0 - edgeZone);
              alpha = Math.max(0, alpha);
            }
          }

          if (props.lightMode) {
            alpha *= heroParticleLightLocked.alpha;
            size *= heroParticleLightLocked.size;
            [r, g, b] = boostRgbForOverlay(r, g, b);
          }

          if (alpha > alphaCutoff) {
            positions.push(posX, posY, posZ);
            originalPositions.push(posX, posY, posZ);
            colors.push(r, g, b);
            sizes.push(size);
            alphas.push(alpha);
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));
    geometry.setAttribute('originalPosition', new THREE.Float32BufferAttribute(originalPositions, 3));

    const se0 = heroParticleLightLocked.fragmentSmoothstepEdge0;
    const se1 = heroParticleLightLocked.fragmentSmoothstepEdge1;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        attribute vec3 color;
        attribute float size;
        attribute float alpha;
        attribute vec3 originalPosition;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          vAlpha = alpha;
          vec3 pos = position;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;

          float particleAlpha = smoothstep(${se0}, ${se1}, dist) * vAlpha;

          gl_FragColor = vec4(vColor, particleAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    };

    buildParticles(0);
  };
};

const onMouseDown = (e) => {
  if (!renderer) return;
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
};

const onMouseMove = (e) => {
  if (!renderer) return;
  const rect = renderer.domElement.getBoundingClientRect();
  targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  targetMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  targetMouseX *= visibleWidth / 2;
  targetMouseY *= visibleHeight / 2;

  if (isDragging) {
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    targetRotation.x += deltaMove.y * 0.005;
    targetRotation.y += deltaMove.x * 0.005;

    const maxPitch = 85 * (Math.PI / 180);
    targetRotation.x = Math.max(-maxPitch, Math.min(maxPitch, targetRotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
};

const onMouseUp = () => {
  isDragging = false;
};

const animate = () => {
  if (!renderer || !scene || !camera) {
    return;
  }

  const gl = renderer.getContext();
  if (gl?.isContextLost?.()) {
    scheduleRestart();
    return;
  }

  animationFrameId = requestAnimationFrame(animate);

  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

  try {
    if (
      particles &&
      geometry?.attributes?.position &&
      geometry?.attributes?.originalPosition
    ) {
      particles.rotation.x = currentRotation.x;
      particles.rotation.y = currentRotation.y;

      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      const positions = geometry.attributes.position.array;
      const originalPositions = geometry.attributes.originalPosition.array;

      for (let i = 0; i < positions.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];

        const px = positions[i];
        const py = positions[i + 1];
        const pz = positions[i + 2];

        const dx = ox - mouseX;
        const dy = oy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = visibleWidth * (
          props.lightMode ? heroParticleLightLocked.maxDistMul : 0.06
        );

        let targetX = ox;
        let targetY = oy;
        let targetZ = oz;

        if (dist < maxDist) {
          const force = Math.pow((maxDist - dist) / maxDist, 1.2);
          const angle = Math.atan2(dy, dx);

          const pushStrength = visibleWidth * (
            props.lightMode ? heroParticleLightLocked.pushStrengthMul : 0.04
          );
          targetX = ox + Math.cos(angle) * force * pushStrength;
          targetY = oy + Math.sin(angle) * force * pushStrength;
          targetZ = oz + force * pushStrength * 0.5;
        }

        positions[i] += (targetX - px) * 0.1;
        positions[i + 1] += (targetY - py) * 0.1;
        positions[i + 2] += (targetZ - pz) * 0.1;
      }
      geometry.attributes.position.needsUpdate = true;

      const material = particles.material;
      material.uniforms.uMouse.value.set(mouseX, mouseY);
      material.uniforms.uTime.value += 0.05;
    }

    renderer.render(scene, camera);
  } catch {
    cancelAnimationFrame(animationFrameId);
    scheduleRestart();
  }
};

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => init());
  });
});

onBeforeUnmount(() => {
  clearTimeout(restartDebounceT);
  restartDebounceT = undefined;
  teardownWebGL();
});
</script>

<template>
  <div ref="container" class="absolute inset-0 z-[1] cursor-grab active:cursor-grabbing"></div>
</template>

/* Small continuously rotating Solid orb for the site header.
   One WebGL context, blitted to each visible canvas. Paused while the
   tab is hidden, a single frame when the user prefers reduced motion. */
const LOCAL = "../../assets/landing/vendor/three.module.min.js";
const CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
const TEX = "assets/landing/";
const SIZE = 192; // source buffer, larger than the CSS logo so the blit stays sharp
const TURN = 10; // seconds per revolution

const canvases = new Set();
let bootP = null;
let failed = false;
let renderer, scene, pivot, glCanvas;
let raf = 0;
let last = 0;
let yaw = 0.45;
const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function visible(c) {
  return c.isConnected && c.getClientRects().length > 0;
}

function mark(canvas, live) {
  var root = canvas.closest(".mini-orb");
  if (root) root.classList.toggle("is-live", live);
}

async function loadThree() {
  try {
    const THREE = await import(LOCAL);
    const env = await import("../../assets/landing/vendor/RoomEnvironment.js");
    return { THREE, RoomEnvironment: env.RoomEnvironment };
  } catch (e) {
    const THREE = await import(CDN);
    return { THREE, RoomEnvironment: null };
  }
}

function miniRoom(THREE) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x555060, side: THREE.BackSide }));
  s.add(room);
  [[0, 4.9, 0, 6, 0.2, 3, 6], [-4.9, 0, 1, 0.2, 5, 3, 4], [4.9, 1, -1, 0.2, 3, 5, 5]].forEach(function (p) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(p[3], p[4], p[5]), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(p[6]) }));
    m.position.set(p[0], p[1], p[2]); s.add(m);
  });
  return s;
}

function texOf(THREE, loader, name, srgb) {
  return new Promise(function (res, rej) {
    loader.load(TEX + name, function (t) {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      res(t);
    }, undefined, function () { rej(new Error(name)); });
  });
}

async function boot() {
  const { THREE, RoomEnvironment } = await loadThree();
  glCanvas = document.createElement("canvas");
  renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    failed = true;
    canvases.forEach(function (c) { mark(c, false); });
  });

  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = RoomEnvironment ? new RoomEnvironment(renderer) : miniRoom(THREE);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0x9A29E9, 2.0); key.position.set(-3, 3.2, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(4, 1.5, -3); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xF8F2FF, 0x1A0038, 0.35));

  const loader = new THREE.TextureLoader();
  const [tColor, tHeight, tOrm, tGlow] = await Promise.all([
    texOf(THREE, loader, "solid-color.png", true),
    texOf(THREE, loader, "solid-height.png", false),
    texOf(THREE, loader, "solid-orm.png", false),
    texOf(THREE, loader, "solid-glow.png", false)
  ]);
  const geo = new THREE.SphereGeometry(1, 64, 48);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshPhysicalMaterial({
    map: tColor, metalnessMap: tOrm, roughnessMap: tOrm, metalness: 1, roughness: 1,
    clearcoat: 0.8, clearcoatRoughness: 0.12,
    bumpMap: tHeight, bumpScale: 1.3,
    emissive: new THREE.Color(0x9A29E9), emissiveMap: tGlow, emissiveIntensity: 0.45,
    envMapIntensity: 1.0
  });
  const sphere = new THREE.Mesh(geo, mat);
  pivot = new THREE.Group();
  pivot.add(sphere);
  pivot.rotation.x = 0.16;
  scene.add(pivot);

  const fov = 18;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 50);
  camera.position.z = 1 / Math.tan(THREE.MathUtils.degToRad(fov / 2)) / 0.86;
  scene.userData.camera = camera;
  return true;
}

function blit(dest) {
  const css = dest.clientWidth || 56;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(css * dpr));
  if (dest.width !== w || dest.height !== w) { dest.width = w; dest.height = w; }
  const ctx = dest.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, w);
  ctx.drawImage(glCanvas, 0, 0, w, w);
}

function frame(ts) {
  raf = 0;
  if (failed || document.hidden) return;
  const shown = [];
  canvases.forEach(function (c) { if (visible(c)) shown.push(c); });
  if (!shown.length) return;
  const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
  last = ts;
  if (!reduce) yaw += dt * (Math.PI * 2 / TURN);
  pivot.rotation.y = yaw;
  renderer.render(scene, scene.userData.camera);
  shown.forEach(blit);
  if (!reduce) raf = requestAnimationFrame(frame);
}

function kick() {
  if (failed || raf) return;
  raf = requestAnimationFrame(frame);
}

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) { last = 0; kick(); }
});

export function mountMiniOrb(canvas) {
  if (!canvas) return Promise.resolve(false);
  canvases.add(canvas);
  if (failed) return Promise.resolve(false);
  if (!bootP) {
    bootP = boot().then(function () { return true; }).catch(function () {
      failed = true;
      canvases.forEach(function (c) { mark(c, false); });
      return false;
    });
  }
  return bootP.then(function (ok) {
    mark(canvas, ok);
    if (ok) kick();
    return ok;
  });
}

/* Orb Analytics hero, "Solid" tab: the orb as a tangible object (three.js, loaded lazily on first use).
   A dark-purple anodized sphere under a clear coat. The logo is the sphere's body; its white channels are inlaid
   pearl channels with a faint purple glow. Maps come from scripts/landing/prep_solid.py. */
const LOCAL = "../../assets/landing/vendor/three.module.min.js";
const CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

async function loadThree() {
  try {
    const THREE = await import(LOCAL);
    const env = await import("../../assets/landing/vendor/RoomEnvironment.js");
    return { THREE, RoomEnvironment: env.RoomEnvironment };
  } catch (e) {
    const THREE = await import(CDN); // offline copy missing: fall back to the CDN (with a small built-in studio room)
    return { THREE, RoomEnvironment: null };
  }
}

function miniRoom(THREE) { // stand-in for RoomEnvironment: dim room with a few bright panels
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x555060, side: THREE.BackSide }));
  s.add(room);
  [[0, 4.9, 0, 6, 0.2, 3, 8], [-4.9, 0, 1, 0.2, 5, 3, 5], [4.9, 1, -1, 0.2, 3, 5, 6], [0, 0, 4.9, 4, 3, 0.2, 3]].forEach(function (p) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(p[3], p[4], p[5]), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(p[6]) }));
    m.position.set(p[0], p[1], p[2]); s.add(m);
  });
  return s;
}

const TEX = "assets/landing/";
export async function createSolid(canvas, onLost) {
  const { THREE, RoomEnvironment } = await loadThree();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); if (onLost) onLost(); });

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = RoomEnvironment ? new RoomEnvironment(renderer) : miniRoom(THREE);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  const FOV = 12; // near-orthographic: the logo reads head-on without perspective distortion
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 200);

  // soft studio lights: purple key from the upper left, white rim from behind on the right, faint fill
  const key = new THREE.DirectionalLight(0x9A29E9, 2.0); key.position.set(-3, 3.2, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.6); rim.position.set(4, 1.5, -3); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xF8F2FF, 0x1A0038, 0.35));

  // textures
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy()); // the pole-coordinate maps are stretched in u near the poles
  function tex(name, srgb, tries) {
    tries = tries === undefined ? 2 : tries;
    return new Promise(function (res, rej) {
      loader.load(TEX + name + (tries < 2 ? "?r=" + tries : ""), function (t) {
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = aniso; t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; res(t); // wrapS repeats: periodic in u, no seam
      }, undefined, function () { // one retry covers a dropped request
        if (tries > 0) tex(name, srgb, tries - 1).then(res, rej); else rej(new Error("texture failed: " + name));
      });
    });
  }
  const [tColor, tHeight, tOrm, tGlow] = await Promise.all([tex("solid-color.png", true), tex("solid-height.png"), tex("solid-orm.png"), tex("solid-glow.png")]);

  // sphere: the maps are baked in pole coordinates (row = angle from the +Z pole, column = angle around it), so the sphere's
  // UV poles are rotated onto +Z, the axis facing the camera head-on. The rings then close at both poles, continue past the
  // equator and have no seam; the front still reads as the flat logo (see scripts/landing/prep_solid.py)
  const geo = new THREE.SphereGeometry(1, 640, 320);
  geo.rotateX(Math.PI / 2); // +Y (the UV pole axis) -> +Z
  const D = 0.03; // channel depth, in sphere radii
  const mat = new THREE.MeshPhysicalMaterial({
    map: tColor, metalnessMap: tOrm, roughnessMap: tOrm, metalness: 1, roughness: 1,
    clearcoat: 0.8, clearcoatRoughness: 0.09,
    bumpMap: tHeight, bumpScale: 2.2,
    displacementMap: tHeight, displacementScale: D, displacementBias: -D,
    emissive: new THREE.Color(0x9A29E9), emissiveMap: tGlow, emissiveIntensity: 0.5,
    envMapIntensity: 1.0
  });
  const sphere = new THREE.Mesh(geo, mat);
  const pivot = new THREE.Group(); pivot.add(sphere); scene.add(pivot);

  // ground: a soft shadow under the object plus a faint purple glow, both camera-facing so they work with a level camera
  function radial(inner, outer) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d"), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, inner); gr.addColorStop(0.55, outer.replace("A", "0.35")); gr.addColorStop(1, outer.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const shadowMat = new THREE.MeshBasicMaterial({ map: radial("rgba(11,0,25,0.42)", "rgba(11,0,25,A)"), transparent: true, depthWrite: false, toneMapped: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.5), shadowMat); shadow.position.set(0, -1.32, -1.2); shadow.renderOrder = -2; scene.add(shadow);
  const glowMat = new THREE.MeshBasicMaterial({ map: radial("rgba(154,41,233,0.16)", "rgba(154,41,233,A)"), transparent: true, depthWrite: false, toneMapped: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), glowMat); glow.position.set(0, 0, -2); glow.renderOrder = -3; scene.add(glow);

  const SCALE = 0.89; // the Solid sphere is drawn about 11% smaller than the particle states; shadow and glow scale with it
  let lw = 0, lh = 0;
  function resize(L) { // L: { W, H, cx, cy, R, dpr } in CSS px of the hero
    lw = L.W; lh = L.H;
    renderer.setPixelRatio(L.dpr);
    renderer.setSize(L.W, L.H, false);
    camera.aspect = L.W / L.H;
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = L.H / (2 * L.R * SCALE * t); // one world unit (the sphere radius) is R * SCALE css px
    camera.position.set(0, 0, dist); camera.near = dist - 6; camera.far = dist + 6;
    camera.setViewOffset(L.W, L.H, -(L.cx - L.W / 2), -(L.cy - L.H / 2), L.W, L.H); // move the object to the stage centre
    camera.updateProjectionMatrix();
  }

  function render(s) { // s: { yaw, pitch, now }
    const breath = 1 + 0.02 * Math.sin(s.now * 1.2);
    sphere.rotation.y = s.yaw; pivot.rotation.x = s.pitch; pivot.scale.setScalar(breath);
    shadow.scale.set(1 - 0.04 * Math.sin(s.now * 1.2), 1, 1);
    renderer.render(scene, camera);
  }
  return { resize, render };
}

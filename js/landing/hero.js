/* Orb Analytics hero (light mode): purple particle sphere (with black speckle) and the Orb logo.
   Four states: sphere, logo (a spinning 3D coin), hybrid (the logo pattern wrapped on a rotating sphere), solid (a three.js object, see solid.js). Cycle: sphere -> logo -> hybrid -> solid -> repeat.
   Logo targets come from assets/landing/logo.js (see scripts/landing/prep_logo.py). */
(function () {
  "use strict";
  var canvas = document.getElementById("orbCanvas");
  var stage = document.getElementById("stage");
  var hero = document.getElementById("top");
  var pager = document.getElementById("pager");
  var LOGO = (window.ORB_LOGO && window.ORB_LOGO.pts) || [];
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var HOLD = [5, 9, 13, 13]; // seconds: sphere, logo (one coin turn), hybrid, solid
  var CLICK_PAUSE = 8; // extra seconds before auto-cycle resumes after a tab click
  // one shared palette for all three states: a purple ramp (dark to light, indices 0..NR-1), then three near-black shades
  var PALETTE = ["#1f0638", "#350a5c", "#4b0d7e", "#6410a0", "#6D28D9", "#7C3AED", "#A855F7", "#C084FC", "#0B0B12", "#140A24", "#1A1033"];
  var NR = 8, DK0 = 8, DARK_SHARE = 0.28;
  var NLV = PALETTE.length, NAL = 4, ALPHAS = [0.3, 0.55, 0.8, 0.96];

  /* ---------- sprites: round dots with a soft edge, normal blending ---------- */
  var SPR = 32, sprites = [];
  function hexToRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  (function () {
    for (var a = 0; a < NAL; a++) {
      sprites[a] = [];
      for (var c = 0; c < NLV; c++) {
        var cv = document.createElement("canvas"); cv.width = cv.height = SPR;
        var g = cv.getContext("2d"), rgb = hexToRgb(PALETTE[c]).join(",");
        var gr = g.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
        gr.addColorStop(0, "rgba(" + rgb + "," + ALPHAS[a] + ")");
        gr.addColorStop(0.55, "rgba(" + rgb + "," + ALPHAS[a] * 0.9 + ")");
        gr.addColorStop(0.8, "rgba(" + rgb + "," + ALPHAS[a] * 0.35 + ")");
        gr.addColorStop(1, "rgba(" + rgb + ",0)");
        g.fillStyle = gr; g.fillRect(0, 0, SPR, SPR);
        sprites[a][c] = cv;
      }
    }
  })();

  /* ---------- particle setup ---------- */
  var small = window.innerWidth < 700;
  var N_SHELL = small ? 3800 : 5800, N_SEAM = small ? 1900 : 2900, N_TRAIL = small ? 200 : 300;
  var NB = N_SHELL + N_SEAM + N_TRAIL; // particles used by Sphere and Logo
  var NX = small ? 2100 : 4000; // extra particles that only appear in Hybrid (fade in and out on morphs); total 13k desktop, 8k mobile
  var N = NB + NX;
  var KIND_SHELL = 0, KIND_SEAM = 1, KIND_TRAIL = 2, KIND_EXTRA = 3;
  var kind = new Uint8Array(N);
  var lx = new Float32Array(N), ly = new Float32Array(N), lz = new Float32Array(N);
  var tu = new Float32Array(N), lzj = new Float32Array(N);
  var px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
  var vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N);
  var K = new Float32Array(N), sz = new Float32Array(N), ph1 = new Float32Array(N), ph2 = new Float32Array(N);
  var lv = new Float32Array(N), al = new Float32Array(N), dk = new Uint8Array(N);
  var swAt = new Float32Array(N), applied = new Int16Array(N);
  var dsx = new Float32Array(N), dsy = new Float32Array(N), dh = new Float32Array(N), dsp = new Int16Array(N);
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rnd = mulberry(1234);
  function gauss() { return (rnd() + rnd() + rnd() + rnd() - 2) * 0.8660254; }

  var i, n = 0, TILT_Z = 0.38, cz = Math.cos(TILT_Z), sz_ = Math.sin(TILT_Z);
  function put(x, y, z, k, size) {
    lx[n] = x * cz - y * sz_; ly[n] = x * sz_ + y * cz; lz[n] = z; kind[n] = k; sz[n] = size; n++;
  }
  for (i = 0; i < N_SHELL; i++) {
    var u = rnd() * 2 - 1, t = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = 1 - Math.pow(rnd(), 3) * 0.035;
    put(r * s * Math.cos(t), r * u, r * s * Math.sin(t), KIND_SHELL, 1.0 + rnd() * 0.8);
  }
  var seams = [
    function (t) { return [Math.cos(t), 0, Math.sin(t)]; },
    function (t) { return [0, Math.cos(t), Math.sin(t)]; },
    function (t) { return [0.5, 0.866 * Math.cos(t), 0.866 * Math.sin(t)]; },
    function (t) { return [-0.5, 0.866 * Math.cos(t), 0.866 * Math.sin(t)]; }
  ];
  for (i = 0; i < N_SEAM; i++) {
    var p = seams[i % 4](rnd() * Math.PI * 2), rr = 1.012 + gauss() * 0.003;
    put(p[0] * rr + gauss() * 0.003, p[1] * rr + gauss() * 0.003, p[2] * rr + gauss() * 0.003, KIND_SEAM, 1.5 + rnd() * 0.9);
  }
  for (i = 0; i < N_TRAIL; i++) { kind[n] = KIND_TRAIL; sz[n] = 1.0 + rnd() * 1.3; tu[n] = Math.pow(rnd(), 0.9); n++; }
  for (i = NB; i < N; i++) { kind[i] = KIND_EXTRA; }
  for (i = 0; i < N; i++) { K[i] = 11 + rnd() * 8; ph1[i] = rnd() * 6.283; ph2[i] = rnd() * 6.283; lzj[i] = (rnd() - 0.5) * 0.07; applied[i] = -1; }
  // shared per-particle look, identical in every state so nothing pops on a morph: one size distribution, one tone, and about 28% near-black
  var tn = new Float32Array(N);
  // logo sample for each particle: base particles use their own point, extras re-sample the logo with a hash and a tiny jitter (about half a dot)
  var LP = Math.max(1, (LOGO.length / 3) | 0), lidx = new Int32Array(N), ljx = new Float32Array(N), ljy = new Float32Array(N);
  for (i = 0; i < N; i++) {
    if (i < NB) { lidx[i] = i % LP; }
    else { lidx[i] = (Math.imul(i, 2654435761) >>> 0) % LP; ljx[i] = (rnd() - 0.5) * 0.012; ljy[i] = (rnd() - 0.5) * 0.012; }
  }
  // Logo coin: every particle gets a fixed role. 0 = face (the logo, on whichever face is toward the camera), 1 = rim, 2 = stroke wall (logo edges, extruded through the thickness)
  var crole = new Uint8Array(N), cidx = new Int32Array(N), cjx = new Float32Array(N), cjy = new Float32Array(N);
  var rcos = new Float32Array(N), rsin = new Float32Array(N), rz = new Float32Array(N), rrad = new Float32Array(N);
  (function () {
    // find logo edge points: rasterize the points, close small gaps, and keep points next to an empty cell
    var G = 100, cnt = new Uint8Array(G * G), m = new Uint8Array(G * G), edge = [], a, b, c, d;
    function cell(v) { var q = ((v + 1) * 0.5 * G) | 0; return q < 0 ? 0 : q >= G ? G - 1 : q; }
    for (a = 0; a < LP; a++) { cnt[cell(LOGO[a * 3 + 1]) * G + cell(LOGO[a * 3])]++; }
    for (a = 1; a < G - 1; a++) for (b = 1; b < G - 1; b++) {
      var any = 0; for (c = -1; c <= 1; c++) for (d = -1; d <= 1; d++) if (cnt[(a + c) * G + b + d]) any = 1;
      m[a * G + b] = any;
    }
    for (a = 0; a < LP; a++) {
      var gy = cell(LOGO[a * 3 + 1]), gx = cell(LOGO[a * 3]);
      if (gy < 1 || gx < 1 || gy > G - 2 || gx > G - 2 || !m[(gy - 1) * G + gx] || !m[(gy + 1) * G + gx] || !m[gy * G + gx - 1] || !m[gy * G + gx + 1]) edge.push(a);
    }
    if (!edge.length) edge.push(0);
    var rank = 0;
    for (a = 0; a < N; a++) {
      var fr = (a * 0.6180339887) % 1;
      crole[a] = fr < 0.15 ? 1 : fr < 0.25 ? 2 : 0; // about 15% rim, 10% walls, 75% faces
      if (crole[a] === 0) { cidx[a] = rank % LP; if (rank >= LP) { cjx[a] = (rnd() - 0.5) * 0.012; cjy[a] = (rnd() - 0.5) * 0.012; } rank++; }
      else if (crole[a] === 2) { cidx[a] = edge[(Math.imul(a, 2654435761) >>> 0) % edge.length]; cjx[a] = (rnd() - 0.5) * 0.008; cjy[a] = (rnd() - 0.5) * 0.008; rz[a] = rnd() * 2 - 1; }
      else { var phi = rnd() * 6.2831853; rcos[a] = Math.cos(phi); rsin[a] = Math.sin(phi); rz[a] = rnd() * 2 - 1; rrad[a] = 1 + ((a % 3) - 1) * 0.006 + (rnd() - 0.5) * 0.004; } // rim: about 3 rows
    }
  })();
  var ptx = new Float32Array(N), pty = new Float32Array(N), ptz = new Float32Array(N), pff = new Uint8Array(N); // previous Hybrid target, for co-moving rotation
  for (i = 0; i < N; i++) {
    sz[i] = 1.0 + rnd() * 0.9;
    tn[i] = rnd();
    dk[i] = rnd() < DARK_SHARE ? DK0 + ((rnd() * 3) | 0) : 0;
  }
  // colour for any state: dark particles stay near-black; the rest sit on the purple ramp, biased by vertical position v (0 bottom, 1 top)
  function shade(j, v) {
    if (dk[j]) return dk[j];
    var t = 0.35 * tn[j] + 0.65 * v; t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * (NR - 1);
  }
  var gtab = new Float32Array(2048);
  for (i = 0; i < 2048; i++) gtab[i] = gauss();

  /* ---------- layout ---------- */
  var dpr = 1, W = 0, H = 0, cx = 0, cy = 0, R = 200, FOC = 800, logoScale = 300;
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    W = hr.width; H = hr.height;
    if (solid) solid.resize({ W: hr.width, H: hr.height, cx: sr.left - hr.left + sr.width / 2, cy: sr.top - hr.top + sr.height / 2, R: Math.max(110, Math.min(sr.width * 0.44, sr.height * 0.42)), dpr: dpr });
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    cx = sr.left - hr.left + sr.width / 2; cy = sr.top - hr.top + sr.height / 2;
    R = Math.max(110, Math.min(sr.width * 0.44, sr.height * 0.42));
    FOC = R * 3.4;
    logoScale = Math.max(100, Math.min(sr.width, sr.height) * 0.84) / 2; // logo spans y in [-1,1]
  }

  /* ---------- state ---------- */
  var STATS = /[?&]stats=1/.test(location.search), stN = 0, stR = 0, stD = 0, stMs = 0; // preview helper: writes per-frame dot stats to a data attribute
  // 3 = Solid (three.js, own canvas, loaded on first use). The tab only exists when WebGL is available.
  var solidCv = document.getElementById("solidCanvas"), solid = null, solidState = 0; // 0 not loaded, 1 loading, 2 ready, -1 failed
  function webglOK() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }
  var HAS_SOLID = !!solidCv && webglOK();
  var phaseCount = HAS_SOLID ? 4 : 3; // 0 sphere, 1 logo, 2 hybrid, 3 solid
  var phase = 0, phaseStart = 0, now = 0, rot = 0.6, tiltX = 0.18, tiltXTarget = 0.18;
  var lyaw = 0, lpitch = 0, ctau = 0, coinFront = true, cfa = 1, flipNow = false, hC = 20, cL = [-0.45, -0.55, -0.70], hrot = 0, hyFixed = null, hyPitch = 0, stillMode = false, stillN = 0, breath = 1, FOCc = 800, cosH = 1, sinH = 0;
  var mouse = { x: -9999, y: -9999, on: false };
  var visible = true, last = 0, snapAll = false;

  function setPhase(p, snap, extra) {
    phase = ((p % phaseCount) + phaseCount) % phaseCount;
    phaseStart = now + (extra || 0);
    if (phase === 2) hrot = 0; // spin restarts head-on
    if (phase === 1) ctau = 0; // coin starts head-on
    if (phase === 3) { hrot = 0; ensureSolid(); }
    for (var j = 0; j < N; j++) swAt[j] = snap ? -1 : now + Math.random() * 0.55;
    if (snap) { for (var j2 = 0; j2 < N; j2++) applied[j2] = -2; snapAll = true; }
    updatePager(); updateFade();
  }

  /* ---------- Solid tab: lazy init and crossfade ---------- */
  function layoutInfo() { return { W: W, H: H, cx: cx, cy: cy, R: R, dpr: dpr }; }
  function updateFade() { hero.classList.toggle("solid-on", phase === 3 && solidState === 2); }
  function dropSolid() {
    solidState = -1; if (solidBtn && solidBtn.parentNode) solidBtn.parentNode.removeChild(solidBtn);
    btns = btns.filter(function (b) { return b !== solidBtn; }); phaseCount = 3;
    if (phase === 3) setPhase(0, reduce); else updateFade();
  }
  function ensureSolid() {
    if (solidState !== 0) return;
    solidState = 1;
    import("./solid.js").then(function (m) { return m.createSolid(solidCv, dropSolid); }).then(function (s) {
      solid = s; solid.resize(layoutInfo()); solidState = 2; updateFade();
      if (reduce) frame(performance.now());
    }).catch(function (e) { if (window.console) console.warn("Solid tab unavailable:", e); dropSolid(); });
  }

  /* ---------- state toggle ---------- */
  var solidBtn = null;
  var btns = [["Sphere", 0], ["Logo", 1], ["Hybrid", 2]].concat(HAS_SOLID ? [["Solid", 3]] : []).map(function (d) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = d[0]; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { setPhase(d[1], reduce, CLICK_PAUSE); if (reduce) frame(performance.now()); });
    pager.appendChild(b); if (d[1] === 3) solidBtn = b; return b;
  });
  function updatePager() { btns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === phase ? "true" : "false"); }); }

  /* ---------- targets ---------- */
  var cosR, sinR, cosT, sinT, cosY = 1, sinY = 0, cosP = 1, sinP = 0;
  var tmp = { x: 0, y: 0, z: 0, lv: 0, al: 0 };
  function targetFor(j, p) {
    if (kind[j] === KIND_EXTRA && p !== 2 && p !== 1) { tmp.x = tmp.y = tmp.z = 0; tmp.lv = shade(j, 0.5); tmp.al = 0; return; }
    if (p === 2) {
      // wrap the logo onto the sphere (inverse orthographic, so the front view matches the flat logo); half of the points on the front hemisphere and half on a back copy (aligned behind the front one head-on, mirrored from behind), with only mild depth fading
      var q = lidx[j] * 3, LX = LOGO[q] + ljx[j], LY = LOGO[q + 1] + ljy[j];
      var rho = Math.sqrt(LX * LX + LY * LY); if (rho > 0.9995) rho = 0.9995;
      var th = Math.asin(rho), ph = Math.atan2(LY, LX), sT = Math.sin(th), cT = Math.cos(th);
      var rr = 1 + lzj[j] * 0.3;
      var wx = sT * Math.cos(ph) * rr, wy = sT * Math.sin(ph) * rr, wz = cT * rr;
      var onBack = (j & 1) === 1; if (!onBack) wz = -wz; // back copy sits exactly behind the front one (same screen position head-on), mirrored when seen from behind
      var wx1 = wx * cosH + wz * sinH, wz1 = -wx * sinH + wz * cosH;
      var wy2 = wy * cosT - wz1 * sinT, wz2 = wy * sinT + wz1 * cosT;
      tmp.x = wx1 * R * breath; tmp.y = wy2 * R * breath; tmp.z = wz2 * R * breath;
      var wf = (1 - wz2) * 0.5;
      tmp.lv = shade(j, 1 - LOGO[q + 2]);
      var ws = (wf - 0.3) / 0.3; ws = ws < 0 ? 0 : ws > 1 ? 1 : ws; ws = ws * ws * (3 - 2 * ws);
      tmp.al = 0.78 + 0.2 * ws;
      return;
    }
    if (p === 0) {
      var k = kind[j];
      if (k === KIND_TRAIL) {
        var u = tu[j];
        tmp.x = R * (0.62 + 0.16 * Math.sin(u * 3.2) + 0.1 * u) + gtab[(j * 2) & 2047] * R * 0.09 * (0.3 + u);
        tmp.y = R * (0.25 + 0.95 * u) + gtab[(j * 2 + 1) & 2047] * R * 0.03;
        tmp.z = 0; tmp.lv = shade(j, 0.5 + 0.5 * u); tmp.al = 0.8 - u * 0.5;
        return;
      }
      var x = lx[j], y = ly[j], z = lz[j];
      var x1 = x * cosR + z * sinR, z1 = -x * sinR + z * cosR;
      var y2 = y * cosT - z1 * sinT, z2 = y * sinT + z1 * cosT;
      tmp.x = x1 * R; tmp.y = y2 * R; tmp.z = z2 * R;
      var front = (1 - z2) * 0.5, rim = Math.sqrt(Math.max(0, 1 - z2 * z2));
      if (k === KIND_SHELL) {
        tmp.lv = shade(j, (1 - y2) * 0.5);
        tmp.al = 0.3 + 0.5 * Math.pow(rim, 1.2) + 0.4 * front * front;
      } else {
        tmp.lv = shade(j, (1 - y2) * 0.5);
        tmp.al = 0.5 + 0.5 * front;
      }
      return;
    }
    // Logo coin: thick disc made of a face toward the camera (the logo; the far face is hidden), a rim and extruded stroke walls
    var ls = logoScale, role = crole[j], X, Y, Z, o;
    if (role === 0) {
      o = cidx[j] * 3; X = (LOGO[o] + cjx[j]) * ls; Y = (LOGO[o + 1] + cjy[j]) * ls; Z = lzj[j] * ls * 0.3;
      if (coinFront) { Z -= hC; } else { X = -X; Z += hC; } // the back face is the logo mirrored, so it reads correctly from behind
      tmp.lv = shade(j, 1 - LOGO[o + 2]); tmp.al = cfa;
    } else if (role === 2) {
      o = cidx[j] * 3; X = (LOGO[o] + cjx[j]) * ls; Y = (LOGO[o + 1] + cjy[j]) * ls; Z = rz[j] * hC;
      tmp.lv = shade(j, 1 - LOGO[o + 2]); tmp.al = 0.8;
    } else {
      var rc = rcos[j], rs = rsin[j];
      X = rc * rrad[j] * ls; Y = rs * rrad[j] * ls; Z = rz[j] * hC;
      // specular-like highlight: rim normal, turned with the coin, against a fixed light from the upper left
      var nx = rc * cosY, nz0 = -rc * sinY, ny = rs * cosP - nz0 * sinP, nz = rs * sinP + nz0 * cosP;
      var dl = nx * cL[0] + ny * cL[1] + nz * cL[2]; dl = dl > 0 ? dl : 0;
      var sp = dl * dl; sp = sp * sp * 1.6; if (sp > 1) sp = 1;
      if (dk[j]) tmp.lv = dk[j]; else { var tt = 0.35 * tn[j] + 0.65 * (1 - rs) * 0.5 + 0.55 * sp; tmp.lv = (tt > 1 ? 1 : tt) * (NR - 1); }
      tmp.al = 0.72 + 0.26 * sp;
    }
    var x2 = X * cosY + Z * sinY, z3 = -X * sinY + Z * cosY;
    var y3 = Y * cosP - z3 * sinP, z4 = Y * sinP + z3 * cosP;
    tmp.x = x2; tmp.y = y3; tmp.z = z4;
  }

  /* ---------- render loop ---------- */
  function frame(ts) {
    var t0 = STATS ? performance.now() : 0;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts;
    if (reduce) dt = 0;
    now += dt;
    if (!reduce && now - phaseStart > HOLD[phase]) setPhase(phase + 1, false);

    var sphereMode = phase === 0;
    rot += dt * 0.32;
    if (mouse.on) tiltXTarget = 0.18 + ((mouse.y - cy) / Math.max(H, 1)) * 0.5; else tiltXTarget = 0.18;
    tiltX += (tiltXTarget - tiltX) * Math.min(1, dt * 3);
    cosR = Math.cos(rot); sinR = Math.sin(rot); cosT = Math.cos(tiltX); sinT = Math.sin(tiltX);
    // logo: gentle sway plus mouse parallax
    var yawT = mouse.on ? ((mouse.x - cx) / Math.max(W, 1)) * 0.9 : (phase === 2 || phase === 1 || phase === 3 ? 0 : Math.sin(now * 0.55) * 0.32);
    var pitchT = mouse.on ? ((mouse.y - cy) / Math.max(H, 1)) * 0.6 : (hyFixed !== null && (phase === 1 || phase === 3) ? hyPitch : Math.sin(now * 0.4) * 0.1);
    var ease = Math.min(1, dt * 3);
    lyaw += (yawT - lyaw) * ease; lpitch += (pitchT - lpitch) * ease;
    hrot += dt * 0.4833; // Hybrid: continuous spin, one revolution about every 13 s
    if (stillMode && phase === 3 && solidState === 2) { lpitch = hyPitch; lyaw = 0; } // preview helper: no easing
    var hyaw = (hyFixed !== null ? hyFixed : hrot) + lyaw * 1.1; cosH = Math.cos(hyaw); sinH = Math.sin(hyaw);
    var realPhase = phase;
    if (phase === 3) {
      if (solidState === 2) {
        solid.render({ yaw: hyaw, pitch: lpitch, now: now });
        if (stillMode) window.__stillN = ++stillN; if (stillMode && stillN > 4) return; // preview helper: stop the loop after a few frames so a headless screenshot can finish
        if (!snapAll) { if (!reduce && visible) requestAnimationFrame(frame); return; } // particles stay parked while the object is shown
      }
      phase = 2; // still loading (or settling after a snap): keep showing the Hybrid
    }
    if (phase === 1) {
      // coin spin: one turn about every 9 s, slower near head-on and near the back so the logo stays readable (dtheta/dtau = 1 - 0.7 cos 2tau)
      ctau += dt * 6.2831853 / 9;
      var cy0 = (hyFixed !== null ? hyFixed : ctau - 0.35 * Math.sin(2 * ctau)) + lyaw * 0.9;
      cosY = Math.cos(cy0); sinY = Math.sin(cy0);
    } else { cosY = Math.cos(lyaw); sinY = Math.sin(lyaw); }
    cosP = Math.cos(lpitch); sinP = Math.sin(lpitch);
    if (phase === 1) {
      var cf = cosY >= 0; flipNow = cf !== coinFront; coinFront = cf;
      var cc = Math.abs(cosY * cosP), fs = (cc - 0.03) / 0.25; fs = fs < 0 ? 0 : fs > 1 ? 1 : fs; fs = fs * fs * (3 - 2 * fs);
      cfa = fs * (0.62 + 0.36 * cc); // face brightest when it points at the camera, fades out as it turns edge-on
      hC = logoScale * 0.07; // half thickness: total thickness t = 7% of the diameter
    } else flipNow = false;
    var damp = Math.exp(-8.5 * dt), mrad = Math.max(90, R * 0.5), mrad2 = mrad * mrad;
    var amp = sphereMode ? R * 0.005 : 1.1;
    if (phase === 2) {
      // no baseline tilt: pitch is centred on 0 with a small symmetric wobble, plus the mouse
      var hp = (hyFixed !== null ? 0 : 0.12 * Math.sin(hrot * 0.73)) + (tiltX - 0.18) * 1.3;
      cosT = Math.cos(hp); sinT = Math.sin(hp);
      breath = 1 + 0.02 * Math.sin(now * 1.2);
      FOCc = FOC * 6; // near-orthographic so the front matches the flat logo
    } else { breath = 1; FOCc = sphereMode ? FOC * 2 : FOC * 6; } // milder perspective on the sphere keeps dot size closer to the other states
    var snap = snapAll || reduce;
    var pscale = 0.8; // same dot scale in every state
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    var lvRate = Math.min(1, dt * 5);

    for (var j = 0; j < N; j++) {
      if (applied[j] !== phase && now >= swAt[j]) {
        if (!snap && applied[j] >= 0) {
          var ang = Math.random() * 6.283, mag = R * (1 + Math.random() * 2.4);
          vx[j] += Math.cos(ang) * mag; vy[j] += Math.sin(ang) * mag; vz[j] += (Math.random() - 0.5) * mag * 0.5;
        }
        applied[j] = phase; pff[j] = 0;
      }
      if (kind[j] === KIND_EXTRA && applied[j] !== 2 && applied[j] !== 1 && al[j] < 0.04 && !snap) { dsp[j] = -1; continue; } // Hybrid-only particle, hidden: no work
      targetFor(j, applied[j]);
      var tx = tmp.x + Math.sin(now * 0.9 + ph1[j]) * amp, ty = tmp.y + Math.cos(now * 0.7 + ph2[j]) * amp, tz = tmp.z;
      if (snap) { px[j] = tx; py[j] = ty; pz[j] = tz; vx[j] = vy[j] = vz[j] = 0; lv[j] = tmp.lv; al[j] = tmp.al; }
      else {
        if (flipNow && applied[j] === 1 && crole[j] === 0) { px[j] = tx; py[j] = ty; pz[j] = tz; vx[j] = vy[j] = vz[j] = 0; ptx[j] = tx; pty[j] = ty; ptz[j] = tz; pff[j] = 1; }
        else if (applied[j] === 2 || applied[j] === 1) { if (pff[j]) { px[j] += tx - ptx[j]; py[j] += ty - pty[j]; pz[j] += tz - ptz[j]; } ptx[j] = tx; pty[j] = ty; ptz[j] = tz; pff[j] = 1; } // ride along with the rotating target so the spin does not lag
        var k = K[j];
        vx[j] += (tx - px[j]) * k * dt; vy[j] += (ty - py[j]) * k * dt; vz[j] += (tz - pz[j]) * k * dt;
        if (mouse.on) {
          var zs = FOCc / (FOCc + pz[j]);
          var dx = px[j] * zs + cx - mouse.x, dy = py[j] * zs + cy - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < mrad2 && d2 > 0.01) {
            var d = Math.sqrt(d2), f = 1 - d / mrad; f = f * f * 1800 * dt;
            vx[j] += dx / d * f; vy[j] += dy / d * f;
          }
        }
        vx[j] *= damp; vy[j] *= damp; vz[j] *= damp;
        px[j] += vx[j] * dt; py[j] += vy[j] * dt; pz[j] += vz[j] * dt;
        lv[j] += (tmp.lv - lv[j]) * lvRate; al[j] += (tmp.al - al[j]) * lvRate;
      }
      var ps = FOCc / (FOCc + pz[j]);
      var sx = (cx + px[j] * ps) * dpr, sy = (cy + py[j] * ps) * dpr;
      var half = sz[j] * ps * dpr * pscale * 1.5;
      var ci = lv[j] < 0 ? 0 : lv[j] > NLV - 1 ? NLV - 1 : (lv[j] + 0.5) | 0;
      var ai = (al[j] * NAL - 0.5) | 0; ai = ai < 0 ? 0 : ai > NAL - 1 ? NAL - 1 : ai;
      dsx[j] = sx; dsy[j] = sy; dh[j] = half; dsp[j] = ai * NLV + ci; // al below 0.04 is skipped (hidden Hybrid-only particles)
      if (al[j] < 0.04) dsp[j] = -1;
      if (STATS && al[j] > 0.5) { stN++; stR += half / dpr; if (lv[j] > DK0 - 0.5) stD++; }
    }
    var back = phase === 2;
    for (var d0 = 0; d0 < N; d0++) {
      var sp = dsp[d0]; if (sp < 0 || (back && pz[d0] <= 0)) continue;
      ctx.drawImage(sprites[(sp / NLV) | 0][sp % NLV], dsx[d0] - dh[d0], dsy[d0] - dh[d0], dh[d0] * 2, dh[d0] * 2);
    }
    if (back) for (var d1 = 0; d1 < N; d1++) {
      var sq = dsp[d1]; if (sq < 0 || pz[d1] > 0) continue;
      ctx.drawImage(sprites[(sq / NLV) | 0][sq % NLV], dsx[d1] - dh[d1], dsy[d1] - dh[d1], dh[d1] * 2, dh[d1] * 2);
    }
    if (STATS) { document.documentElement.setAttribute("data-orb-stats", JSON.stringify({ phase: phase, shown: stN, meanRadiusCss: +(stR / Math.max(stN, 1)).toFixed(3), darkShare: +(stD / Math.max(stN, 1)).toFixed(3), frameMsAvg: +(stMs = stMs ? stMs * 0.9 + (performance.now() - t0) * 0.1 : performance.now() - t0).toFixed(2), particles: N })); stN = stR = stD = 0; }
    snapAll = false; phase = realPhase;
    if (!reduce && visible) requestAnimationFrame(frame);
  }

  /* ---------- events ---------- */
  window.addEventListener("pointermove", function (e) {
    var hr = hero.getBoundingClientRect(), x = e.clientX - hr.left, y = e.clientY - hr.top;
    mouse.on = y > 0 && y < hr.height && x > 0 && x < hr.width; mouse.x = x; mouse.y = y;
  }, { passive: true });
  document.addEventListener("mouseleave", function () { mouse.on = false; });
  var rto;
  function onResize() { clearTimeout(rto); rto = setTimeout(function () { layout(); if (reduce) { snapAll = true; frame(performance.now()); } }, 80); }
  window.addEventListener("resize", onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(hero);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !reduce) { last = 0; requestAnimationFrame(frame); }
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { last = 0; });

  layout();
  var qs = /[?&]start=(\d+)/.exec(location.search); // preview helper: ?start=1 opens on the logo
  setPhase(qs ? +qs[1] : 0, true);
  var qy = /[?&]yaw=([\d.]+)/.exec(location.search); if (qy) hyFixed = +qy[1]; // preview helper: fixed Hybrid yaw, no sway (radians)
  if (/[?&]still=1/.test(location.search)) stillMode = true;
  var qp = /[?&]pitch=(-?[\d.]+)/.exec(location.search); if (qp) hyPitch = +qp[1]; // preview helper: fixed pitch for the Logo and Solid states (radians)
  requestAnimationFrame(frame);
})();

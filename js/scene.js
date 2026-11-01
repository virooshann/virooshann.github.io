// Three.js scene: one particle cloud that morphs between procedurally generated shapes.
// Every shape is a Float32Array of N positions. The shader blends `aFrom` → `aTo` by `uMorph`,
// so the CPU only swaps which two shapes are bound and the GPU does the per-particle work.
import * as THREE from 'three';

const COLORS = { bg: 0x070b14, cyan: 0x3fe0ff, amber: 0xffb547, white: 0xeaf9ff };

// Which shape each section shows
const SCENE_SHAPE = {
  hero: 'face', about: 'constellation', attendance: 'face', plate: 'plate',
  experience: 'network', skills: 'clusters', contact: 'point',
};

// Camera + object pose per section. `x` shifts the object to the right of the text column.
const VIEWS_DESKTOP = {
  hero:       { x: 2.1, y: 0.05, s: 1.0,  rx: 0.0,   ry: 0.32,  cy: 0.0, cz: 7.0, spin: 0 },
  about:      { x: 1.8, y: 0.0,  s: 1.0,  rx: 0.35,  ry: 0.0,   cy: 0.4, cz: 8.0, spin: 0.10 },
  attendance: { x: 2.2, y: -0.1, s: 0.92, rx: 0.08,  ry: -0.38, cy: 0.7, cz: 7.4, spin: 0 },
  plate:      { x: 2.25, y: 0.1, s: 0.62, rx: -0.12, ry: -0.3,  cy: 0.2, cz: 7.0, spin: 0 },
  experience: { x: 2.1, y: 0.0,  s: 1.0,  rx: 0.1,   ry: 0.25,  cy: 0.0, cz: 7.2, spin: 0.05 },
  skills:     { x: 2.15, y: 0.0, s: 0.82, rx: 0.32,  ry: 0.0,   cy: 0.5, cz: 7.6, spin: 0.22 },
  contact:    { x: 0.0, y: 1.75, s: 1.0,  rx: 0.0,   ry: 0.0,   cy: 0.0, cz: 7.0, spin: 0 },
};
// On narrow screens the scene sits behind the content, centred and smaller.
const VIEWS_MOBILE = {
  hero:       { x: 0, y: 1.55, s: 0.52, rx: 0.0,   ry: 0.25,  cy: 0, cz: 7.4, spin: 0 },
  about:      { x: 0, y: 0.3,  s: 0.7,  rx: 0.35,  ry: 0.0,   cy: 0, cz: 8.0, spin: 0.10 },
  attendance: { x: 0, y: 0.6,  s: 0.72, rx: 0.08,  ry: -0.3,  cy: 0, cz: 7.6, spin: 0 },
  plate:      { x: 0, y: 1.2,  s: 0.52, rx: -0.12, ry: -0.2,  cy: 0, cz: 7.0, spin: 0 },
  experience: { x: 0, y: 0.3,  s: 0.75, rx: 0.1,   ry: 0.25,  cy: 0, cz: 7.4, spin: 0.05 },
  skills:     { x: 0, y: 0.3,  s: 0.7,  rx: 0.32,  ry: 0.0,   cy: 0, cz: 7.8, spin: 0.22 },
  contact:    { x: 0, y: 1.9,  s: 0.9,  rx: 0.0,   ry: 0.0,   cy: 0, cz: 7.0, spin: 0 },
};

// ───────────── helpers ─────────────
function rng(seed) { // mulberry32: deterministic, so the shapes look the same on every visit
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hexVec = (h) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ───────────── shapes ─────────────
function noiseShape(N, R) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    out[i * 3] = (R() - 0.5) * 18;
    out[i * 3 + 1] = (R() - 0.5) * 10;
    out[i * 3 + 2] = -6 + R() * 9;
  }
  return out;
}

// Face = a height field z(x, y) on an egg-shaped outline, with bumps for nose, brows, lips.
const FACE_B = 1.62;
const faceA = (y) => { const yn = y / FACE_B; return 1.12 * (y < 0 ? 1 - 0.2 * yn * yn - 0.1 * -yn : 1 - 0.08 * yn * yn); };
const faceHalfW = (y) => { const yn = y / FACE_B; return faceA(y) * Math.sqrt(Math.max(0, 1 - yn * yn)); };
function faceZ(x, y) {
  const yn = y / FACE_B, A = faceA(y);
  const e = 1 - (x / A) ** 2 - yn * yn;
  if (e <= 0) return 0;
  const g = (dx, dy, sx, sy) => Math.exp(-(dx * dx) / sx - (dy * dy) / sy);
  let z = 1.05 * Math.sqrt(e);
  z += 0.3 * g(x, y + 0.18, 0.01, 0.09) + 0.12 * g(x, y + 0.45, 0.02, 0.01); // nose ridge + tip
  z -= 0.14 * (g(x - 0.42, y - 0.18, 0.035, 0.012) + g(x + 0.42, y - 0.18, 0.035, 0.012)); // eye sockets
  z += 0.07 * Math.exp(-((y - 0.4) ** 2) / 0.008) * Math.exp(-(x * x) / 0.5); // brow ridge
  z += 0.07 * g(x, y + 0.85, 0.06, 0.01); // lips
  z += 0.08 * g(x, y + 1.3, 0.05, 0.02); // chin
  z += 0.05 * (g(x - 0.6, y + 0.15, 0.04, 0.04) + g(x + 0.6, y + 0.15, 0.04, 0.04)); // cheekbones
  return z;
}
function faceShape(N, R, mobile) {
  const out = new Float32Array(N * 3);
  const curves = [];
  const add = (len, fn) => curves.push({ len, fn });
  for (const s of [-1, 1]) {
    add(0.85, (t) => [s * 0.42 + 0.19 * Math.cos(t * 6.283), 0.18 + 0.07 * Math.sin(t * 6.283)]); // eye
    add(0.35, (t) => [s * 0.42 + 0.055 * Math.cos(t * 6.283), 0.18 + 0.055 * Math.sin(t * 6.283)]); // iris
    add(0.5, (t) => [s * (0.2 + 0.48 * t), 0.39 + 0.06 * Math.sin(Math.PI * t)]); // brow
    add(1.4, (t) => { const y = -FACE_B * 0.98 + t * FACE_B * 1.96; return [s * faceHalfW(y) * 0.985, y]; }); // outline
  }
  add(0.65, (t) => [0, 0.22 - t * 0.66]); // nose bridge
  add(0.45, (t) => [0.17 * Math.cos(Math.PI * t), -0.5 - 0.05 * Math.sin(Math.PI * t)]); // nose base
  add(0.7, (t) => { const x = -0.34 + 0.68 * t; return [x, -0.81 + 0.03 * Math.cos(Math.PI * x / 0.34)]; }); // upper lip
  add(0.7, (t) => { const x = -0.32 + 0.64 * t; return [x, -0.86 - 0.07 * (1 - (x / 0.32) ** 2)]; }); // lower lip
  add(0.6, (t) => [-0.3 + 0.6 * t, -0.835]); // mouth line
  const total = curves.reduce((a, c) => a + c.len, 0);

  const pFeature = 0.24, pGrid = mobile ? 0.36 : 0.5;
  for (let i = 0; i < N; i++) {
    const r = R();
    let x, y, lift = 0;
    if (r < pFeature) {
      let k = R() * total, c = curves[0];
      for (const cv of curves) { if ((k -= cv.len) <= 0) { c = cv; break; } }
      [x, y] = c.fn(R());
      x += (R() - 0.5) * 0.012; y += (R() - 0.5) * 0.012;
      lift = 0.02;
    } else if (r < pFeature + pGrid) {
      if (R() < 0.5) { // meridian
        const s = -0.92 + Math.floor(R() * 11) * (1.84 / 10);
        y = (R() * 2 - 1) * FACE_B * 0.97; x = s * faceHalfW(y);
      } else { // parallel
        y = -1.45 + Math.floor(R() * 13) * (2.9 / 12);
        x = (R() * 2 - 1) * faceHalfW(y) * 0.97;
      }
      lift = 0.005;
    } else {
      y = (R() * 2 - 1) * FACE_B * 0.98; x = (R() * 2 - 1) * faceHalfW(y);
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = faceZ(x, y) + lift;
  }
  return out;
}

function constellationShape(N, R) {
  const out = new Float32Array(N * 3);
  const clumps = Array.from({ length: 18 }, () => {
    const a = R() * 6.283, r = 0.8 + R() * 2.8;
    return [Math.cos(a) * r, (R() - 0.5) * 0.9, Math.sin(a) * r];
  });
  for (let i = 0; i < N; i++) {
    if (R() < 0.25) {
      const c = clumps[i % clumps.length], s = 0.09;
      out[i * 3] = c[0] + (R() - 0.5) * s * 2; out[i * 3 + 1] = c[1] + (R() - 0.5) * s * 2; out[i * 3 + 2] = c[2] + (R() - 0.5) * s * 2;
    } else {
      const a = R() * 6.283, r = 0.6 + 3.4 * Math.pow(R(), 0.7);
      out[i * 3] = Math.cos(a) * r;
      out[i * 3 + 1] = (R() + R() + R() - 1.5) * 0.45 * (1.2 - r / 4.5);
      out[i * 3 + 2] = Math.sin(a) * r;
    }
  }
  return out;
}

function sampleText(text, R, count) {
  const W = 600, H = 130;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '500 96px "JetBrains Mono", ui-monospace, Consolas, monospace';
  ctx.fillText(text, W / 2, H / 2 + 4);
  const data = ctx.getImageData(0, 0, W, H).data;
  const px = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 128) px.push(x, y);
  const pts = [];
  const n = px.length / 2;
  for (let i = 0; i < count; i++) {
    const k = n ? Math.floor(R() * n) : 0;
    pts.push(n ? [px[k * 2] / W - 0.5, 0.5 - px[k * 2 + 1] / H] : [R() - 0.5, R() - 0.5]);
  }
  return pts;
}
function plateShape(N, R, text) {
  const out = new Float32Array(N * 3);
  const W = 4.2, H = W * 130 / 600;
  const nChars = Math.floor(N * 0.52), nBorder = Math.floor(N * 0.3);
  const chars = sampleText(text, R, nChars);
  for (let i = 0; i < N; i++) {
    let x, y, z = (R() - 0.5) * 0.03;
    if (i < nChars) {
      [x, y] = chars[i]; x *= W * 0.94; y *= H * 0.94;
      x += (R() - 0.5) * 0.01; y += (R() - 0.5) * 0.01;
    } else if (i < nChars + nBorder) {
      const inset = R() < 0.6 ? 0 : 0.09, w = W - inset * 2, h = H - inset * 2;
      let d = R() * 2 * (w + h);
      if (d < w) { x = -w / 2 + d; y = h / 2; } else if ((d -= w) < h) { x = w / 2; y = h / 2 - d; }
      else if ((d -= h) < w) { x = w / 2 - d; y = -h / 2; } else { d -= w; x = -w / 2; y = -h / 2 + d; }
    } else {
      x = (R() - 0.5) * W; y = (R() - 0.5) * H; z -= 0.05;
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return out;
}

// Network: the first `keyNodes` nodes form a chain (one per timeline entry), the rest are random.
function networkShape(N, R, keyNodes, mobile) {
  const out = new Float32Array(N * 3);
  const net = new Float32Array(N).fill(-1);
  const nodes = [];
  for (let k = 0; k < keyNodes; k++) {
    const t = keyNodes > 1 ? k / (keyNodes - 1) : 0.5;
    nodes.push([lerp(-1.7, 1.7, t), lerp(1.3, -1.3, t) + Math.sin(t * 6) * 0.3, Math.cos(t * 5) * 0.6]);
  }
  const extra = mobile ? 7 : 11;
  let guard = 0;
  while (nodes.length < keyNodes + extra && guard++ < 500) {
    const p = [(R() - 0.5) * 4.6, (R() - 0.5) * 3.2, (R() - 0.5) * 2.2];
    if (nodes.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) > 0.75)) nodes.push(p);
  }
  const edges = new Set();
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  for (let k = 0; k < keyNodes - 1; k++) edges.add(key(k, k + 1));
  nodes.forEach((p, a) => {
    const near = nodes.map((q, b) => [b, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])])
      .filter(([b]) => b !== a).sort((u, v) => u[1] - v[1]).slice(0, 2);
    near.forEach(([b]) => edges.add(key(a, b)));
  });
  const E = [...edges].map((s) => s.split('-').map(Number));
  const nNode = Math.floor(N * 0.34);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (i < nNode) {
      const k = i % nodes.length, c = nodes[k], s = k < keyNodes ? 0.13 : 0.08;
      const g = () => (R() + R() + R() - 1.5) * s;
      x = c[0] + g(); y = c[1] + g(); z = c[2] + g();
      if (k < keyNodes) net[i] = k;
    } else {
      const [a, b] = E[Math.floor(R() * E.length)], t = R(), j = 0.012;
      x = lerp(nodes[a][0], nodes[b][0], t) + (R() - 0.5) * j;
      y = lerp(nodes[a][1], nodes[b][1], t) + (R() - 0.5) * j;
      z = lerp(nodes[a][2], nodes[b][2], t) + (R() - 0.5) * j;
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return { pos: out, net };
}

// Four clusters on a ring; rotating the group makes them orbit. Particle i belongs to cluster i % 4.
function clusterShape(N, R) {
  const out = new Float32Array(N * 3);
  const skill = new Float32Array(N);
  const centers = [0, 1, 2, 3].map((k) => {
    const a = k * Math.PI / 2 + 0.4;
    return [Math.cos(a) * 1.9, k % 2 ? -0.45 : 0.45, Math.sin(a) * 1.9];
  });
  for (let i = 0; i < N; i++) {
    const k = i % 4, c = centers[k];
    skill[i] = k;
    let x, y, z;
    if (R() < 0.78) {
      const u = R() * 2 - 1, a = R() * 6.283, r = 0.55 * Math.cbrt(R());
      const s = Math.sqrt(1 - u * u);
      x = s * Math.cos(a) * r; y = u * r; z = s * Math.sin(a) * r;
    } else {
      const a = R() * 6.283, r = 0.85 + (R() - 0.5) * 0.04;
      x = Math.cos(a) * r; y = Math.sin(a) * r * 0.25; z = Math.sin(a) * r;
    }
    out[i * 3] = c[0] + x; out[i * 3 + 1] = c[1] + y; out[i * 3 + 2] = c[2] + z;
  }
  return { pos: out, skill };
}

function pointShape(N, R) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const halo = R() < 0.12;
    const r = halo ? 0.5 + R() * 1.1 : 0.2 * R() * R();
    const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u);
    out[i * 3] = s * Math.cos(a) * r; out[i * 3 + 1] = u * r; out[i * 3 + 2] = s * Math.sin(a) * r;
  }
  return out;
}

// Camera frustum wireframe: apex at the origin, opening towards +Z (Object3D.lookAt aims +Z).
function frustum(material) {
  const w = 0.42, h = 0.28, d = 0.75;
  const v = [[0, 0, 0], [-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d]];
  const idx = [0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(idx.flatMap((i) => v[i]), 3));
  return new THREE.LineSegments(g, material);
}

// ───────────── shaders ─────────────
const vertexShader = /* glsl */ `
  attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 aNoise;
  attribute float aSeed; attribute float aNet; attribute float aSkill;
  uniform float uTime, uMorph, uAssemble, uSize, uPR, uMotion, uOpacity;
  uniform vec3 uScanDir; uniform float uScanPos, uScanAmt;
  uniform float uNetLit, uNetOn, uSkillHi, uSkillOn, uPulse, uFlash;
  uniform vec3 uCyan, uAmber, uWhite;
  varying vec3 vColor; varying float vAlpha;
  float ease(float x) { return x * x * (3.0 - 2.0 * x); }
  void main() {
    // staggered morph: each particle starts a little later, depending on its seed
    float m = ease(clamp(uMorph * 1.6 - aSeed * 0.6, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, m);
    p += normalize(aNoise + vec3(0.001)) * 0.45 * sin(m * 3.14159);
    // intro: drift in from a random field
    float a = ease(clamp(uAssemble * 1.5 - aSeed * 0.5, 0.0, 1.0));
    vec3 drift = aNoise + uMotion * 0.3 * vec3(sin(uTime * 0.2 + aSeed * 50.0), cos(uTime * 0.17 + aSeed * 30.0), 0.0);
    p = mix(drift, p, a);
    p *= 1.0 + uPulse * 0.12 * sin(uTime * 2.4);
    p += uMotion * 0.016 * vec3(sin(uTime * 0.9 + aSeed * 40.0), cos(uTime * 0.8 + aSeed * 31.0), sin(uTime * 0.7 + aSeed * 17.0));

    float scan = uScanAmt * (1.0 - smoothstep(0.0, 0.14, abs(dot(p, uScanDir) - uScanPos)));
    float net = aNet >= 0.0 ? clamp(uNetLit - aNet, 0.0, 1.0) * uNetOn : 0.0;
    float sk = abs(aSkill - uSkillHi) < 0.5 ? uSkillOn : 0.0;
    float warm = step(0.985, aSeed);
    vec3 col = mix(uCyan, uAmber, clamp(max(max(net, sk), warm * 0.9) + uFlash * 0.55, 0.0, 1.0));
    col = mix(col, uWhite, scan * 0.8);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + scan * 1.2 + net * 0.7 + sk * 0.5);
    gl_PointSize = size * uPR / max(-mv.z, 0.5);
    vAlpha = uOpacity * ((0.3 + 0.4 * a) * (0.55 + 0.45 * fract(aSeed * 7.13)) + scan * 0.5 + net * 0.25);
    vColor = col;
  }`;
const fragmentShader = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    float f = 1.0 - d;
    gl_FragColor = vec4(vColor, f * f * vAlpha);
  }`;

// ───────────── scene ─────────────
export async function createScene(canvas, { scenes, mobile, reduced, plateText = 'BVN 2026', keyNodes = 5, onContextLost }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(COLORS.bg, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onContextLost?.(); }, { once: true });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 7);

  const cores = navigator.hardwareConcurrency || 4;
  const N = mobile ? 3200 : cores <= 4 ? 6000 : 9000;
  const R = rng(20260101);

  // Wait (briefly) for the mono font so the plate characters use it.
  try { await Promise.race([document.fonts.load('500 96px "JetBrains Mono"'), new Promise((r) => setTimeout(r, 1200))]); } catch { /* system font is fine */ }

  const network = networkShape(N, R, keyNodes, mobile);
  const clusters = clusterShape(N, R);
  const shapes = {
    face: faceShape(N, R, mobile),
    constellation: constellationShape(N, R),
    plate: plateShape(N, R, plateText),
    network: network.pos,
    clusters: clusters.pos,
    point: pointShape(N, R),
  };
  const attrs = Object.fromEntries(Object.entries(shapes).map(([k, v]) => [k, new THREE.BufferAttribute(v, 3)]));

  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = R();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', attrs.face); // required by three; real position comes from aFrom/aTo
  geometry.setAttribute('aFrom', attrs.face);
  geometry.setAttribute('aTo', attrs.face);
  geometry.setAttribute('aNoise', new THREE.BufferAttribute(noiseShape(N, R), 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aNet', new THREE.BufferAttribute(network.net, 1));
  geometry.setAttribute('aSkill', new THREE.BufferAttribute(clusters.skill, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20); // shader moves points; skip culling

  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uAssemble: { value: reduced ? 1 : 0 },
    uSize: { value: mobile ? 30 : 26 }, uPR: { value: dpr }, uMotion: { value: reduced ? 0 : 1 }, uOpacity: { value: 1 },
    uScanDir: { value: new THREE.Vector3(0, 1, 0) }, uScanPos: { value: 0 }, uScanAmt: { value: 0 },
    uNetLit: { value: 0 }, uNetOn: { value: 0 }, uSkillHi: { value: -1 }, uSkillOn: { value: 0 },
    uPulse: { value: 0 }, uFlash: { value: 0 },
    uCyan: { value: hexVec(COLORS.cyan) }, uAmber: { value: hexVec(COLORS.amber) }, uWhite: { value: hexVec(COLORS.white) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);

  // group (pose per section) → spinner (slow orbit) → points + frustums
  const group = new THREE.Group();
  const spinner = new THREE.Group();
  group.add(spinner);
  spinner.add(points);
  scene.add(group);

  const lineMat = new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0, depthWrite: false });
  const camSpots = mobile ? [[1.3, 0.9, 2.4]] : [[1.6, -0.3, 2.3], [-0.9, 1.5, 2.1], [1.3, 1.6, 1.7]];
  const frustums = camSpots.map((p) => {
    const f = frustum(lineMat);
    f.position.set(...p);
    f.lookAt(0, 0, 0.4);
    spinner.add(f);
    return f;
  });

  let views = VIEWS_DESKTOP;

  // public state, tweened from main.js with GSAP
  const state = { assemble: uniforms.uAssemble.value, heroScan: -1, flash: 0, netLit: 0, skillHi: -1, px: 0, py: 0 };

  let curIndex = -1, stageT = 0, spinAngle = 0;
  const weights = {};
  function setStage(i, t) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    const next = Math.min(scenes.length - 1, i + 1);
    if (i !== curIndex) {
      curIndex = i;
      geometry.setAttribute('aFrom', attrs[SCENE_SHAPE[scenes[i]]]);
      geometry.setAttribute('aTo', attrs[SCENE_SHAPE[scenes[next]]]);
    }
    stageT = next === i ? 0 : t;
    for (const k in views) weights[k] = 0;
    weights[scenes[i]] += 1 - stageT;
    weights[scenes[next]] += stageT;
  }
  setStage(0, 0);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    views = w < 900 ? VIEWS_MOBILE : VIEWS_DESKTOP;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  const tmp = new THREE.Vector3();
  function render(time, dt) {
    const a = scenes[curIndex], b = scenes[Math.min(scenes.length - 1, curIndex + 1)];
    const va = views[a], vb = views[b], t = stageT;
    const v = (k) => lerp(va[k], vb[k], t);

    uniforms.uTime.value = reduced ? 0 : time;
    uniforms.uMorph.value = t;
    uniforms.uAssemble.value = state.assemble;
    uniforms.uNetLit.value = state.netLit;
    uniforms.uNetOn.value = weights.experience;
    uniforms.uSkillHi.value = state.skillHi;
    uniforms.uSkillOn.value = weights.skills;
    uniforms.uPulse.value = reduced ? 0 : weights.contact;
    uniforms.uFlash.value = state.flash;

    // scan beam: one vertical sweep in the hero intro, a looping horizontal sweep over the plate
    if (state.heroScan >= 0) {
      uniforms.uScanDir.value.set(0, 1, 0);
      uniforms.uScanPos.value = lerp(1.8, -1.8, state.heroScan);
      uniforms.uScanAmt.value = Math.sin(Math.PI * state.heroScan);
    } else if (weights.plate > 0.01 && !reduced) {
      uniforms.uScanDir.value.set(1, 0, 0);
      uniforms.uScanPos.value = ((time * 0.45) % 1) * 5.4 - 2.7;
      uniforms.uScanAmt.value = smooth(0.5, 1, weights.plate);
    } else {
      uniforms.uScanAmt.value = 0;
    }

    lineMat.opacity = 0.4 * smooth(0.4, 1, weights.attendance);
    frustums.forEach((f) => { f.visible = lineMat.opacity > 0.01; });

    group.position.set(v('x'), v('y'), 0);
    group.scale.setScalar(v('s'));
    group.rotation.set(v('rx') + state.py * 0.08, v('ry') + state.px * 0.12, 0);

    // slow orbit in the about / skills scenes, easing back to a whole turn elsewhere
    const spin = v('spin');
    if (!reduced) {
      spinAngle += dt * spin;
      if (spin < 0.02) {
        const target = Math.round(spinAngle / (Math.PI * 2)) * Math.PI * 2;
        spinAngle += (target - spinAngle) * Math.min(1, dt * 2.5);
      }
    }
    spinner.rotation.y = spinAngle;

    camera.position.set(state.px * 0.25, v('cy') - state.py * 0.15, v('cz'));
    tmp.set(0, v('cy') * 0.4, 0);
    camera.lookAt(tmp);

    renderer.render(scene, camera);
  }

  // Screen rectangle (CSS px) around the face, used to place the HTML lock-on box.
  const corners = [];
  for (const x of [-1.1, 1.1]) for (const y of [-1.6, 1.5]) for (const z of [0.25, 0.9]) corners.push(new THREE.Vector3(x, y, z));
  function faceRect() {
    scene.updateMatrixWorld();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const w = window.innerWidth, h = window.innerHeight;
    for (const c of corners) {
      tmp.copy(c).applyMatrix4(points.matrixWorld).project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * w, sy = (-tmp.y * 0.5 + 0.5) * h;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  return { state, weights, setStage, render, resize, faceRect, uniforms };
}

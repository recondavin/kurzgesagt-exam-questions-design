// The low-poly kit: flat-coloured shapes that are merged into one mesh per object, a three-tone toon material and
// dark ink outlines (an inverted hull), for the chunky, hand-drawn look of the reference (Messenger by Abeto).
// Every shape is placed by the middle of its base, so furniture is built bottom up.
import * as THREE from '../../lib/three.module.min.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

export const INK = '#2A2622';

// Paints a geometry one flat colour and gives it flat (per-face) normals, or keeps its smooth ones (round things).
export function paint(geo, color, smooth) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  geo !== g && geo.dispose();
  g.deleteAttribute('uv');
  if (!smooth) g.computeVertexNormals();
  const c = new THREE.Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}

// at: { x, y, z, rx, ry, rz, sx, sy, sz }. y is where the base sits.
export function place(g, at = {}) {
  _e.set(at.rx || 0, at.ry || 0, at.rz || 0);
  _q.setFromEuler(_e);
  _s.set(at.sx || 1, at.sy || 1, at.sz || 1);
  _v.set(at.x || 0, at.y || 0, at.z || 0);
  g.applyMatrix4(_m.compose(_v, _q, _s));
  return g;
}

export function box(w, h, d, color, at) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return place(paint(g, color), at);
}

// A prism or cylinder; few sides keep it chunky.
export function cyl(rTop, rBottom, h, sides, color, at) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, sides);
  g.translate(0, h / 2, 0);
  return place(paint(g, color), at);
}

// A low-poly ball, centred on at.y + r so it rests on its base.
export function ball(r, color, at, detail = 1) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  g.translate(0, r, 0);
  return place(paint(g, color), at);
}

// Part of a sphere (a cap of hair, a bowl). Centred like a ball.
export function cap(r, color, thetaLength, at, widthSeg = 10, heightSeg = 5) {
  const g = new THREE.SphereGeometry(r, widthSeg, heightSeg, 0, Math.PI * 2, 0, thetaLength);
  g.translate(0, r, 0);
  return place(paint(g, color), at);
}

export function ring(r, tube, color, at) {
  const g = new THREE.TorusGeometry(r, tube, 4, 10);
  return place(paint(g, color), at);
}

// A flat shape drawn in x/z (points [[x, z], ...]) and raised h.
export function slab(points, h, color, at) {
  const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p[0], -p[1])));
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return place(paint(g, color), at);
}

// A shape drawn side-on (points [[z, y], ...]) and stretched along x for `length`, centred (a roof, a gable).
export function prism(points, length, color, at) {
  const shape = new THREE.Shape(points.map(([u, v]) => new THREE.Vector2(-u, v)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  g.translate(0, 0, -length / 2);
  g.rotateY(Math.PI / 2);
  return place(paint(g, color), at);
}

// A shape from a converted model (orals/models, made by tools/orals/convert_food.py): { p, i, f, c }. Scaled to
// stand h high on its base; ry etc. as for place. Its size is { w, d } once scaled (model.size).
const sizes = new WeakMap();
function bounds(m) {
  if (!sizes.has(m)) {
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < m.p.length; k++) { lo[k % 3] = Math.min(lo[k % 3], m.p[k]); hi[k % 3] = Math.max(hi[k % 3], m.p[k]); }
    sizes.set(m, { w: hi[0] - lo[0], h: hi[1], d: hi[2] - lo[2] });
  }
  return sizes.get(m);
}
export function model(m, h, at) {
  const s = h / bounds(m).h, n = m.i.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
  for (let k = 0; k < n; k++) {
    const v = m.i[k] * 3;
    pos[k * 3] = m.p[v] * s; pos[k * 3 + 1] = m.p[v + 1] * s; pos[k * 3 + 2] = m.p[v + 2] * s;
    c.set(m.c[m.f[Math.floor(k / 3)]]);
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return place(g, at);
}
model.size = (m, h) => { const b = bounds(m), s = h / b.h; return { w: b.w * s, d: b.d * s }; };

// A sign board with painted letters (a small texture), on two posts or flat on a wall.
export function signMesh(text, w = 1.6, h = 0.45, colors = {}) {
  const cv = document.createElement('canvas'), W = 512, Hh = Math.round(512 * h / w);
  cv.width = W; cv.height = Hh;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = colors.bg || '#F4F1EA';
  ctx.fillRect(0, 0, W, Hh);
  ctx.strokeStyle = colors.ink || '#2A2622';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, Hh - 10);
  ctx.fillStyle = colors.ink || '#2A2622';
  // Small enough that the fada on a capital (COLÁISTE) fits inside the border.
  ctx.font = `bold ${Math.round(Hh * 0.44)}px "Arial Rounded MT Bold", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, W / 2, Hh * 0.72);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
}

// Joins painted geometries into one (one draw call).
export function merge(list) {
  list = list.filter(Boolean);
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o);
    nor.set(g.attributes.normal.array, o);
    col.set(g.attributes.color.array, o);
    o += g.attributes.position.count * 3;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

// Merges a big set of shapes in square chunks (size metres), so the parts of a large world off screen aren't drawn.
export function chunked(list, size = 16, opts) {
  const bins = new Map(), c = new THREE.Vector3();
  for (const g of list) {
    g.computeBoundingBox();
    g.boundingBox.getCenter(c);
    const k = Math.floor(c.x / size) + ',' + Math.floor(c.z / size);
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push(g);
  }
  const group = new THREE.Group();
  for (const parts of bins.values()) group.add(mesh(parts, opts));
  return group;
}

// Smooth normals shared by every corner at the same spot, so the outline shell has no gaps at the edges.
function outlineNormals(g) {
  const p = g.attributes.position.array, nr = g.attributes.normal.array, sum = new Map(), keys = [];
  for (let i = 0; i < p.length; i += 3) {
    const k = Math.round(p[i] * 500) + ',' + Math.round(p[i + 1] * 500) + ',' + Math.round(p[i + 2] * 500);
    keys.push(k);
    const s = sum.get(k) || [0, 0, 0];
    s[0] += nr[i]; s[1] += nr[i + 1]; s[2] += nr[i + 2];
    sum.set(k, s);
  }
  const out = new Float32Array(p.length);
  keys.forEach((k, j) => {
    const s = sum.get(k), l = Math.hypot(s[0], s[1], s[2]) || 1;
    out[j * 3] = s[0] / l; out[j * 3 + 1] = s[1] / l; out[j * 3 + 2] = s[2] / l;
  });
  g.setAttribute('onormal', new THREE.BufferAttribute(out, 3));
}

let toonGrad = null;
function gradient() {
  if (toonGrad) return toonGrad;
  // Three flat tones: shade, mid, lit. No smooth ramps.
  const d = new Uint8Array([120, 190, 255]);
  toonGrad = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  toonGrad.minFilter = toonGrad.magFilter = THREE.NearestFilter;
  toonGrad.generateMipmaps = false;
  toonGrad.needsUpdate = true;
  return toonGrad;
}

const mats = {};
export function toon() {
  return mats.toon || (mats.toon = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradient() }));
}

export function outlineMaterial(width) {
  const key = 'line' + width;
  if (mats[key]) return mats[key];
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 onormal;')
      .replace('#include <begin_vertex>', 'vec3 transformed = position + onormal * ' + width.toFixed(4) + ';');
  };
  m.customProgramCacheKey = () => key;
  return (mats[key] = m);
}

// A merged mesh with its outline as a child. opts: { line (world units, 0 for none), cast, receive }.
export function mesh(list, opts = {}) {
  const g = Array.isArray(list) ? merge(list) : list;
  const m = new THREE.Mesh(g, toon());
  m.castShadow = opts.cast !== false;
  m.receiveShadow = opts.receive !== false;
  const line = opts.line === undefined ? 0.018 : opts.line;
  if (line > 0) {
    outlineNormals(g);
    const o = new THREE.Mesh(g, outlineMaterial(line));
    o.raycast = () => {};
    m.add(o);
  }
  return m;
}

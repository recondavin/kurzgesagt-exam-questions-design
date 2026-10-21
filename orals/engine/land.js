// The open world outside: an island of fields standing in the sea, like a diorama with earth sides, with a sandy
// shore, boreens, dry-stone walls, buildings with signs, rocks, gorse, wind-bent trees, sheep, a pier with a
// currach and mountains behind. Built from a content pack's description (see orals/ga/village.js). Static things
// are merged in chunks (only the chunks on screen are drawn); the sheep move.
// Returns { group, blocks, walkable(x, z), surface(x, z), shore(x, z), bounds, update(dt) }.
import * as THREE from '../../lib/three.module.min.js';
import { box, cyl, ball, slab, prism, paint, place, mesh, chunked, signMesh } from './kit.js';
import { seeded } from './room.js';

const GRASS = '#7D9A5B', EARTH = '#6B5545', SAND = '#D8C79C', SEA = '#5A8F98', STONES = ['#9A9C95', '#8A8C86', '#A7A9A2', '#7F817B'];

function inside(poly, x, z) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

// A flat strip from a to b (a road or a path), lying on the ground.
function strip(a, b, w, color, y, h = 0.03) {
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  return box(len + w * 0.6, h, w, color, { x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, y, ry: -Math.atan2(dz, dx) });
}

// A dry-stone wall along a straight line: two or three courses of grey boulders, a little uneven.
function stoneWall(x0, z0, x1, z1, rnd) {
  const p = [], len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 0.48)), ang = Math.atan2(z1 - z0, x1 - x0);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    const c = () => STONES[Math.floor(rnd() * STONES.length)];
    p.push(box(0.5 + rnd() * 0.1, 0.34, 0.44, c(), { x, z, y: -0.02, ry: -ang + (rnd() - 0.5) * 0.3 }));
    p.push(box(0.4 + rnd() * 0.12, 0.28, 0.36, c(), { x: x + (rnd() - 0.5) * 0.08, z: z + (rnd() - 0.5) * 0.08, y: 0.3, ry: -ang + (rnd() - 0.5) * 0.5 }));
    if (rnd() < 0.5) p.push(box(0.3, 0.2, 0.28, c(), { x: x + (rnd() - 0.5) * 0.1, z, y: 0.56, ry: rnd() * 3 }));
  }
  const pad = 0.28;
  return { parts: p, block: [Math.min(x0, x1) - pad, Math.min(z0, z1) - pad, Math.max(x0, x1) + pad, Math.max(z0, z1) + pad] };
}

// A building seen from outside (not one you can go into): walls, a slate or thatched roof, a door, windows and a sign.
function building(b, signs) {
  const { x, z, w, d } = b, h = b.h || 2.6, c = b.wall || '#ECE5D5', rise = b.rise || (b.roof === 'thatch' ? 2.0 : 1.5);
  const p = [box(w, h, d, c, { x, z }), box(w + 0.02, 0.22, d + 0.02, '#6E6A63', { x, z })];
  const over = 0.3, roofC = b.roof === 'thatch' ? '#B8924F' : '#4E555B';
  p.push(prism([[-d / 2 - over, -0.1], [d / 2 + over, -0.1], [0, rise]], w + 2 * over, roofC, { x, z, y: h }));
  if (b.roof !== 'thatch') p.push(cyl(0.08, 0.08, w + 2 * over, 6, '#3B4146', { x: x + w / 2 + over, z, y: h + rise - 0.05, rz: Math.PI / 2 }));
  else p.push(cyl(0.2, 0.2, w + 0.4, 8, '#A6823F', { x: x + w / 2 + 0.2, z, y: h + rise + 0.05, rz: Math.PI / 2 }));
  for (const sx of [-1, 1]) p.push(prism([[-d / 2, 0], [d / 2, 0], [0, rise]], 0.2, c, { x: x + sx * (w / 2 - 0.1), z, y: h }));
  const fz = z + d / 2, door = b.door || 0;
  p.push(box(1.0, 2.05, 0.08, b.doorColor || '#8E3A2C', { x: x + door, z: fz + 0.03 }), box(1.16, 0.08, 0.1, '#E9E3D6', { x: x + door, z: fz + 0.04, y: 2.05 }));
  p.push(box(1.3, 0.06, 0.5, '#9A9C95', { x: x + door, z: fz + 0.25, y: -0.02 }));
  for (const wx of b.windows || []) p.push(
    box(1.0, 1.0, 0.05, '#F4F1EA', { x: x + wx, y: 0.95, z: fz + 0.03 }),
    box(0.84, 0.84, 0.03, '#9DBEC4', { x: x + wx, y: 1.03, z: fz + 0.05 }),
    box(0.05, 0.84, 0.04, '#F4F1EA', { x: x + wx, y: 1.03, z: fz + 0.07 }),
  );
  for (const cx of b.chimneys || []) p.push(box(0.6, 1.0, 0.5, c, { x: x + cx, z, y: h + rise - 0.4 }), box(0.7, 0.1, 0.6, '#B9AE98', { x: x + cx, z, y: h + rise + 0.6 }));
  if (b.sign) {
    const s = signMesh(b.sign, b.signW || 2.8, 0.72, b.signColors || {});
    s.position.set(x + (b.signAt || door), h - 0.42, fz + 0.07);
    signs.push(s);
  }
  return { parts: p, block: [x - w / 2, z - d / 2, x + w / 2, z + d / 2] };
}

// A sheep: a woolly body, a dark face and legs. It wanders slowly round its field.
function sheep(rnd) {
  const g = new THREE.Group();
  g.add(mesh([
    place(paint(new THREE.IcosahedronGeometry(0.34, 1), '#EEEAE0', true), { y: 0.5, sx: 1.25, sy: 0.85, sz: 0.95 }),
    box(0.22, 0.24, 0.26, '#2F2B28', { x: 0.42, y: 0.5 }),
    box(0.06, 0.1, 0.12, '#2F2B28', { x: 0.42, y: 0.66, z: 0.14 }), box(0.06, 0.1, 0.12, '#2F2B28', { x: 0.42, y: 0.66, z: -0.14 }),
    ...[[-0.22, -0.14], [-0.22, 0.14], [0.22, -0.14], [0.22, 0.14]].map(([lx, lz]) => box(0.07, 0.3, 0.07, '#2F2B28', { x: lx, z: lz })),
  ], { line: 0.014 }));
  return { g, t: rnd() * 5, goal: null, wait: rnd() * 3 };
}

export function buildLand(L) {
  const rnd = seeded(11), parts = [], blocks = [], signs = [], group = new THREE.Group();

  // The island: a grass top with a band of grass down its sides, earth below, a sandy shore round it, the sea.
  parts.push(slab(L.coast, 1.4, EARTH, { y: -1.5 }), slab(L.coast, 0.08, GRASS, { y: -0.1 }));
  parts.push(slab(L.beach, 1.2, SAND, { y: -1.32 }));
  for (const pt of L.patches || []) parts.push(slab(pt.pts, 0.02, pt.color, { y: -0.025 }));
  const sea = new THREE.Mesh(paint(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), SEA), new THREE.MeshLambertMaterial({ vertexColors: true }));
  sea.position.y = -0.3;
  sea.receiveShadow = true;
  group.add(sea);
  // A ring of foam where the sand meets the sea.
  const cx = L.beach.reduce((a, p) => a + p[0], 0) / L.beach.length, cz = L.beach.reduce((a, p) => a + p[1], 0) / L.beach.length;
  const foam = slab(L.beach.map(([x, z]) => [cx + (x - cx) * 1.012, cz + (z - cz) * 1.025]), 0.02, '#E6EEEA', { y: -0.3 });
  group.add(mesh([foam], { line: 0, cast: false }));

  // Roads (boreens, with grass up the middle) and paths.
  for (const r of L.roads || []) for (let i = 1; i < r.pts.length; i++) {
    parts.push(strip(r.pts[i - 1], r.pts[i], r.w || 3, '#B9AE98', -0.02));
    if (r.middle !== false) parts.push(strip(r.pts[i - 1], r.pts[i], 0.45, '#879F62', -0.015));
  }
  for (const r of L.paths || []) for (let i = 1; i < r.pts.length; i++) parts.push(strip(r.pts[i - 1], r.pts[i], r.w || 1.2, '#A59D8C', -0.018));

  for (const w of L.walls || []) { const s = stoneWall(...w, rnd); parts.push(...s.parts); blocks.push(s.block); }
  for (const b of L.buildings || []) { const s = building(b, signs); parts.push(...s.parts); blocks.push(s.block); }

  for (const [x, z, s] of L.rocks || []) {
    parts.push(place(paint(new THREE.IcosahedronGeometry(s, 0), STONES[Math.floor(rnd() * 4)]), { x, z, y: s * 0.3, sy: 0.65, ry: rnd() * 6, rx: rnd() * 0.4 }));
    if (s > 0.35) blocks.push([x - s * 0.8, z - s * 0.8, x + s * 0.8, z + s * 0.8]);
  }
  // Gorse: dark green clumps with yellow flowers.
  for (const [x, z, s] of L.bushes || []) {
    parts.push(ball(s, '#5B7A42', { x, z, y: -0.15, sy: 0.8 }, 1));
    for (let i = 0; i < 4; i++) parts.push(ball(0.06, '#E3B83A', { x: x + (rnd() - 0.5) * s * 1.3, z: z + (rnd() - 0.2) * s, y: s * 0.95 + rnd() * 0.15 }, 0));
    blocks.push([x - s * 0.7, z - s * 0.7, x + s * 0.7, z + s * 0.7]);
  }
  // Trees bent by the wind off the sea.
  for (const [x, z, s, lean] of L.trees || []) {
    parts.push(cyl(0.1 * s, 0.16 * s, 1.6 * s, 6, '#6B4E3A', { x, z, rz: lean || -0.25 }));
    parts.push(ball(0.9 * s, '#4F7A45', { x: x - Math.sin(lean || -0.25) * 1.4 * s, z, y: 1.1 * s, sy: 0.7, sx: 1.3 }, 1));
    blocks.push([x - 0.3, z - 0.3, x + 0.3, z + 0.3]);
  }
  // A reek of turf: dark brown sods stacked into a long ridge.
  for (const [x, z] of L.turf || []) {
    for (let i = 0; i < 18; i++) parts.push(box(0.3, 0.12, 0.16, i % 3 ? '#4A3326' : '#5A3F2E', { x: x + (i % 6) * 0.28 - 0.7, z: z + (rnd() - 0.5) * 0.1, y: Math.floor(i / 6) * 0.12, ry: (rnd() - 0.5) * 0.4 }));
    parts.push(prism([[-0.35, 0], [0.35, 0], [0, 0.35]], 1.8, '#4A3326', { x, z, y: 0.36 }));
    blocks.push([x - 1, z - 0.4, x + 1, z + 0.4]);
  }
  // The pier and a currach tied up beside it.
  if (L.pier) {
    const { x, z0, z1, w } = L.pier;
    parts.push(box(w, 0.6, z1 - z0, '#8F918A', { x, z: (z0 + z1) / 2, y: -0.62 }));
    for (let z = z0 + 1; z < z1; z += 2.2) for (const sx of [-1, 1]) parts.push(cyl(0.12, 0.12, 0.35, 8, '#3A3532', { x: x + sx * (w / 2 - 0.2), z }));
  }
  for (const bt of L.boats || []) {
    const hull = [box(0.9, 0.32, 2.6, '#2A2622', { y: -0.36 }), box(0.5, 0.3, 0.6, '#2A2622', { y: -0.34, z: 1.5, sx: 0.8 }), box(0.5, 0.3, 0.5, '#2A2622', { y: -0.34, z: -1.5 }), box(0.7, 0.04, 0.12, '#6B4E3A', { y: -0.08 }), box(0.7, 0.04, 0.12, '#6B4E3A', { y: -0.08, z: 0.7 })];
    for (const g of hull) place(g, { x: bt.x, z: bt.z, ry: bt.ry || 0 });
    parts.push(...hull);
  }
  // A bus stop: a small shelter open to the south (towards the camera, so it never hides anyone), a bench in it,
  // and a pole with its sign.
  if (L.busStop) {
    const { x, z } = L.busStop;
    parts.push(box(2.2, 2.1, 0.1, '#4E6E64', { x, z: z - 0.55 }), box(0.1, 2.1, 1.0, '#4E6E64', { x: x - 1.1, z: z - 0.1 }), box(0.1, 2.1, 1.0, '#4E6E64', { x: x + 1.1, z: z - 0.1 }));
    parts.push(box(2.4, 0.1, 1.2, '#3B4146', { x, z: z - 0.1, y: 2.1 }), box(1.8, 0.08, 0.45, '#6B4E3A', { x, z: z - 0.3, y: 0.45 }));
    parts.push(cyl(0.05, 0.05, 2.3, 6, '#3A3532', { x: x + 1.6, z: z + 0.4 }));
    const s = signMesh('BUS', 0.7, 0.42, { bg: '#FFC800' });
    s.position.set(x + 1.6, 2.1, z + 0.45);
    signs.push(s);
    blocks.push([x - 1.2, z - 0.65, x + 1.2, z + 0.35]);
  }
  // Mountains across the bay behind the island.
  const far = [];
  for (const [x, z, r, h, c] of L.mountains || []) far.push(cyl(0, r, h, 6, c || '#6E7F86', { x, z, y: -0.4, ry: rnd() }), cyl(0, r * 0.35, h * 0.35, 6, '#B9C4C7', { x, z, y: -0.4 + h * 0.65 + 0.01, ry: rnd() }));
  group.add(mesh(far, { line: 0.05, cast: false }));

  group.add(chunked(parts, 16, { line: 0.018 }));
  for (const s of signs) group.add(s);

  // Sheep, each in its own field.
  const flock = [];
  for (const f of L.sheep || []) for (let i = 0; i < f.n; i++) {
    const s = sheep(rnd);
    s.field = f.field;
    s.g.position.set(f.field[0] + rnd() * (f.field[2] - f.field[0]), 0, f.field[1] + rnd() * (f.field[3] - f.field[1]));
    s.g.rotation.y = rnd() * 6;
    s.g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    group.add(s.g);
    flock.push(s);
  }
  function update(dt) {
    for (const s of flock) {
      s.t += dt;
      const p = s.g.position;
      if (!s.goal) {
        s.wait -= dt;
        s.g.children[0].position.y = Math.abs(Math.sin(s.t * 1.3)) * 0.01;
        if (s.wait <= 0) { const f = s.field; s.goal = [f[0] + Math.random() * (f[2] - f[0]), f[1] + Math.random() * (f[3] - f[1])]; }
        continue;
      }
      const dx = s.goal[0] - p.x, dz = s.goal[1] - p.z, d = Math.hypot(dx, dz);
      if (d < 0.1) { s.goal = null; s.wait = 2 + Math.random() * 6; continue; }
      const step = Math.min(d, dt * 0.5);
      p.x += dx / d * step; p.z += dz / d * step;
      s.g.rotation.y = Math.atan2(-dz, dx);
      s.g.children[0].position.y = Math.abs(Math.sin(s.t * 9)) * 0.06;
    }
  }

  const walk = L.walk || [];
  const onPier = (x, z) => walk.some(b => x > b[0] && x < b[2] && z > b[1] && z < b[3]);
  const onStrip = (x, z, list, w0) => list.some(r => r.pts.some((b, i) => i && segDist(x, z, r.pts[i - 1], b) < (r.w || w0) / 2));
  return {
    group, blocks, update, bounds: L.bounds,
    // Walkable: on the island or its sand, or out on the pier.
    walkable: (x, z) => inside(L.beach, x, z) || onPier(x, z),
    // What is underfoot (for footsteps): wood, stone (a road or path), grass or sand.
    surface(x, z) {
      if (onPier(x, z) && !inside(L.beach, x, z)) return 'wood';
      if (onStrip(x, z, L.roads || [], 3) || onStrip(x, z, L.paths || [], 1.2)) return 'stone';
      return inside(L.coast, x, z) ? 'grass' : 'sand';
    },
    // How far it is to the water's edge, in metres (0 out on the pier).
    shore(x, z) {
      if (!inside(L.beach, x, z)) return 0;
      let d = 1e9;
      L.beach.forEach((b, i) => { d = Math.min(d, segDist(x, z, L.beach[(i || L.beach.length) - 1], b)); });
      return d;
    },
  };
}

function segDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
  return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
}

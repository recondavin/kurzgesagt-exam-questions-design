// Builds a diorama room from a content pack's description: a flagstone floor on a thick slab of earth and grass,
// three walls cut off at the top (the front is open to the camera), and the furniture. Everything that doesn't move
// is merged into one mesh. Also returns the walkable grid and the named seats.
//   { w, d, wallH, wall, floor, props: [{ type, id?, x?, z?, ry?, wall?: 'back' | 'left' | 'right', at?, ...options }] }
import * as THREE from '../../lib/three.module.min.js';
import { box, mesh, place } from './kit.js';
import { MAKERS } from './props.js';

const T = 0.25; // wall thickness

// A random generator with a fixed seed, so the flagstones come out the same every time.
function seeded(n) { return () => (n = (n * 16807) % 2147483647) / 2147483647; }

function floorStones(w, d, colors) {
  const rnd = seeded(7), parts = [box(w, 0.04, d, '#56524C', { y: -0.05 })];
  const rowD = 0.62;
  for (let z = -d / 2, row = 0; z < d / 2 - 0.01; z += rowD, row++) {
    const dz = Math.min(rowD, d / 2 - z);
    let x = -w / 2;
    let first = row % 2 ? 0.45 : 0.85;
    while (x < w / 2 - 0.01) {
      const sw = Math.min(first || (0.7 + rnd() * 0.4), w / 2 - x);
      first = 0;
      parts.push(box(sw - 0.035, 0.05, dz - 0.035, colors[Math.floor(rnd() * colors.length)], { x: x + sw / 2, y: -0.05, z: z + dz / 2 }));
      x += sw;
    }
  }
  return parts;
}

function walls(r) {
  const { w, d, wallH: h } = r, c = r.wall || '#ECE5D5', top = r.wallTop || '#3A3532', p = [];
  // Back wall and the two side walls, each with a dark cut along its top.
  p.push(box(w + 2 * T, h, T, c, { z: -d / 2 - T / 2 }));
  p.push(box(T, h, d, c, { x: -w / 2 - T / 2 }));
  p.push(box(T, h, d, c, { x: w / 2 + T / 2 }));
  p.push(box(w + 2 * T, 0.03, T, top, { y: h, z: -d / 2 - T / 2 }));
  p.push(box(T, 0.03, d, top, { x: -w / 2 - T / 2, y: h }));
  p.push(box(T, 0.03, d, top, { x: w / 2 + T / 2, y: h }));
  // A painted band along the bottom of the walls.
  const band = r.band || '#B9AE98';
  p.push(box(w, 0.12, 0.02, band, { z: -d / 2 + 0.01 }));
  p.push(box(0.02, 0.12, d, band, { x: -w / 2 + 0.01 }));
  p.push(box(0.02, 0.12, d, band, { x: w / 2 - 0.01 }));
  return p;
}

// The slab the room stands on: earth sides and a rim of grass, with stepping stones at the front.
function ground(r) {
  const { w, d } = r, m = 0.55, W = w + 2 * T + 2 * m, D = d + T + 2 * m, zc = -T / 2;
  const p = [
    box(W, 0.55, D, '#6B5545', { y: -0.62, z: zc }),
    box(W - 0.06, 0.07, D - 0.06, '#7D9A5B', { y: -0.1, z: zc }),
  ];
  const rnd = seeded(3);
  for (let i = 0; i < 4; i++) p.push(box(0.36 + rnd() * 0.1, 0.03, 0.26, '#9A9C95', { x: -0.4 + i * 0.32 + rnd() * 0.05, y: -0.02, z: d / 2 + 0.2 + (i % 2) * 0.08 }));
  return p;
}

// Where a prop goes and how it is turned.
function frame(r, o) {
  if (o.wall === 'back') return { x: o.at || 0, z: -r.d / 2, ry: 0 };
  if (o.wall === 'left') return { x: -r.w / 2, z: o.at || 0, ry: Math.PI / 2 };
  if (o.wall === 'right') return { x: r.w / 2, z: o.at || 0, ry: -Math.PI / 2 };
  return { x: o.x || 0, z: o.z || 0, ry: o.ry || 0 };
}

// The floor area a prop blocks, as an axis-aligned box.
function footprint(f, foot, offset) {
  const [w, d] = foot;
  if (!w || !d) return null;
  const c = Math.cos(f.ry), s = Math.sin(f.ry), oz = offset || 0;
  const pts = [[-w / 2, -d / 2 + oz], [w / 2, -d / 2 + oz], [w / 2, d / 2 + oz], [-w / 2, d / 2 + oz]].map(([x, z]) => [f.x + x * c + z * s, f.z - x * s + z * c]);
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
}

export function buildRoom(r) {
  const parts = [...floorStones(r.w, r.d, r.stones || ['#8E9290', '#858A88', '#979A95', '#8A8D86']), ...walls(r), ...ground(r)];
  const blocks = [], seats = {};
  for (const o of r.props) {
    const make = MAKERS[o.type];
    if (!make) { console.warn('No maker for', o.type); continue; }
    const f = frame(r, o), built = make(o);
    // Things built against a wall are pushed out by half their depth so their back touches it.
    const back = o.wall && built.foot[1] ? built.foot[1] / 2 : 0;
    for (const g of built.parts) {
      if (back) g.translate(0, 0, back);
      place(g, { x: f.x, z: f.z, ry: f.ry });
    }
    parts.push(...built.parts);
    const fp = footprint(f, built.foot, back ? built.foot[1] / 2 : 0);
    if (fp && o.solid !== false) blocks.push(fp);
    if (built.seat && o.id) {
      const c = Math.cos(f.ry), s = Math.sin(f.ry), sz = built.seat.z;
      seats[o.id] = { x: f.x + sz * s, z: f.z + sz * c, y: built.seat.y, ry: f.ry, front: { x: f.x + 0.55 * s, z: f.z + 0.55 * c } };
    }
  }
  const group = new THREE.Group();
  group.add(mesh(parts, { line: 0.016 }));
  return { group, blocks, seats, bounds: [-r.w / 2, -r.d / 2, r.w / 2, r.d / 2] };
}

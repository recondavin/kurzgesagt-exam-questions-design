// Builds a room from a content pack's description: a flagstone floor, the walls and the furniture. Everything that
// doesn't move is merged into one mesh. Also returns what blocks walking and the named seats.
//   { w, d, wallH, wall, props: [{ type, id?, x?, z?, ry?, wall?: 'back' | 'left' | 'right', at?, ...options }],
//     floor?: 'boards', house?: { door: { at, w }, windows: [x...], roof: 'thatch' | 'slate', chimneys: [x...], sign } }
// Without `house` it is a diorama: three walls cut off at the top on a slab of earth and grass, the front open.
// With `house` it is a cottage standing in the open world: four walls (a door in the front one), a thatched roof
// (or slate) with its gables, windows, a half-door outside and a sign over the door if it has one. The roof and the front wall are separate objects so the
// world can lift the roof off and drop the front wall to a low stub while the player is inside.
import * as THREE from '../../lib/three.module.min.js';
import { box, cyl, mesh, place, prism, signMesh } from './kit.js';
import { MAKERS } from './props.js';

const T = 0.25; // wall thickness

// A random generator with a fixed seed, so the flagstones come out the same every time.
export function seeded(n) { return () => (n = (n * 16807) % 2147483647) / 2147483647; }

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

// Wooden floorboards (a shop) instead of flagstones.
function floorBoards(w, d) {
  const rnd = seeded(5), parts = [box(w, 0.04, d, '#4E3A2A', { y: -0.05 })], colors = ['#9C7350', '#A57B56', '#946C4A', '#A88158'];
  const bw = 0.32;
  for (let x = -w / 2, i = 0; x < w / 2 - 0.01; x += bw, i++) {
    const ww = Math.min(bw, w / 2 - x);
    let z = -d / 2 + (i % 3) * -0.7;
    while (z < d / 2 - 0.01) {
      const len = 1.6 + rnd() * 0.8, z0 = Math.max(z, -d / 2), z1 = Math.min(z + len, d / 2);
      if (z1 - z0 > 0.05) parts.push(box(ww - 0.025, 0.05, z1 - z0 - 0.02, colors[Math.floor(rnd() * 4)], { x: x + ww / 2, y: -0.05, z: (z0 + z1) / 2 }));
      z += len;
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

// The slab a diorama room stands on: earth sides and a rim of grass, with stepping stones at the front.
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

// The front wall of a cottage, with its door gap, and what is on its outside: the door, windows, a step.
function frontWall(r, H) {
  const { w, d, wallH: h } = r, c = r.wall || '#ECE5D5', z = d / 2 + T / 2, door = H.door || { at: 0, w: 1.1 };
  const x0 = -w / 2 - T, x1 = w / 2 + T, d0 = door.at - door.w / 2, d1 = door.at + door.w / 2, dh = 2.1;
  const p = [
    box(d0 - x0, h, T, c, { x: (x0 + d0) / 2, z }),
    box(x1 - d1, h, T, c, { x: (d1 + x1) / 2, z }),
    box(door.w, h - dh, T, c, { x: door.at, y: dh, z }),
    box(w + 2 * T, 0.03, T, r.wallTop || '#3A3532', { y: h, z }),
    // Outside: the red half-door open flat against the wall beside the doorway, its frame, a step and a dark plinth.
    box(door.w + 0.16, 0.08, 0.06, '#E9E3D6', { x: door.at, y: dh, z: z + T / 2 + 0.02 }),
    box(0.08, dh, 0.06, '#E9E3D6', { x: d0 - 0.04, z: z + T / 2 + 0.02 }),
    box(0.08, dh, 0.06, '#E9E3D6', { x: d1 + 0.04, z: z + T / 2 + 0.02 }),
    box(door.w - 0.1, dh - 0.05, 0.06, H.doorColor || '#8E3A2C', { x: d1 + 0.12 + (door.w - 0.1) / 2, z: z + T / 2 + 0.05 }),
    box(door.w - 0.1, 0.06, 0.08, '#6E2C22', { x: d1 + 0.12 + (door.w - 0.1) / 2, y: 1.0, z: z + T / 2 + 0.07 }),
    box(door.w + 0.3, 0.06, 0.45, '#9A9C95', { x: door.at, y: -0.02, z: z + T / 2 + 0.22 }),
    box(w + 2 * T + 0.02, 0.22, 0.02, '#6E6A63', { z: z + T / 2 + 0.01 }),
  ];
  // A sign over the door, on its own (it is a picture, not part of the merged walls).
  let sign = null;
  if (H.sign) {
    sign = signMesh(H.sign, H.signW || 2.6, 0.62, H.signColors || {});
    sign.position.set(door.at, dh + 0.22 + 0.31, z + T / 2 + 0.03);
  }
  for (const x of H.windows || []) p.push(
    box(1.0, 1.1, 0.05, '#F4F1EA', { x, y: 0.95, z: z + T / 2 + 0.02 }),
    box(0.84, 0.94, 0.03, '#9DBEC4', { x, y: 1.03, z: z + T / 2 + 0.04 }),
    box(0.05, 0.94, 0.04, '#F4F1EA', { x, y: 1.03, z: z + T / 2 + 0.06 }),
    box(0.84, 0.05, 0.04, '#F4F1EA', { x, y: 1.47, z: z + T / 2 + 0.06 }),
    box(1.12, 0.07, 0.16, '#E7E1D2', { x, y: 0.9, z: z + T / 2 + 0.07 }),
  );
  const blocks = [[x0, d / 2, d0, d / 2 + T], [d1, d / 2, x1, d / 2 + T]];
  return { parts: p, blocks, sign };
}

// A thatched roof along the length of the cottage, with the gable ends and the chimneys.
function roof(r, H) {
  const { w, d, wallH: h } = r, rise = H.rise || 2.0, over = 0.35, L = w + 2 * T + 2 * over, D2 = d / 2 + T + over;
  const thatch = H.thatch || '#B8924F', c = r.wall || '#ECE5D5', p = [];
  if (H.roof === 'slate') {
    // Slates: a thin dark roof with a ridge tile.
    p.push(prism([[-D2, -0.1], [D2, -0.1], [0, rise]], L, '#4E555B', { y: h }));
    p.push(cyl(0.09, 0.09, L, 6, '#3B4146', { y: h + rise - 0.06, rz: Math.PI / 2, x: L / 2 }));
  } else {
    // The thatch: a thick triangle with a rounded ridge and a darker trimmed edge at the eaves.
    p.push(prism([[-D2, -0.12], [D2, -0.12], [0, rise + 0.2]], L, thatch, { y: h }));
    p.push(prism([[-D2 + 0.02, -0.12], [D2 - 0.02, -0.12], [D2 - 0.02, 0.0], [-D2 + 0.02, 0.0]], L + 0.02, '#9C7A3E', { y: h }));
    p.push(cyl(0.22, 0.22, L - 0.2, 8, '#A6823F', { y: h + rise + 0.08, rz: Math.PI / 2, x: L / 2 - 0.1 }));
  }
  // Whitewashed gables under the thatch at both ends.
  for (const sx of [-1, 1]) p.push(prism([[-d / 2 - T, 0], [d / 2 + T, 0], [0, rise]], T, c, { y: h, x: sx * (w / 2 + T / 2) }));
  for (const x of H.chimneys || []) p.push(
    box(0.7, 1.1, 0.6, c, { x, y: h + rise - 0.3 }),
    box(0.8, 0.12, 0.7, '#B9AE98', { x, y: h + rise + 0.8 }),
    cyl(0.1, 0.1, 0.25, 8, '#6B4E3A', { x: x - 0.15, y: h + rise + 0.9 }),
    cyl(0.1, 0.1, 0.25, 8, '#6B4E3A', { x: x + 0.15, y: h + rise + 0.9 }),
  );
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
export function footprint(f, foot, offset) {
  const [w, d] = foot;
  if (!w || !d) return null;
  const c = Math.cos(f.ry), s = Math.sin(f.ry), oz = offset || 0;
  const pts = [[-w / 2, -d / 2 + oz], [w / 2, -d / 2 + oz], [w / 2, d / 2 + oz], [-w / 2, d / 2 + oz]].map(([x, z]) => [f.x + x * c + z * s, f.z - x * s + z * c]);
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
}

export function buildRoom(r) {
  const H = r.house;
  const floor = r.floor === 'boards' ? floorBoards(r.w, r.d) : floorStones(r.w, r.d, r.stones || ['#8E9290', '#858A88', '#979A95', '#8A8D86']);
  const parts = [...floor, ...walls(r), ...(H ? [] : ground(r))];
  const blocks = [], seats = {}, fine = [];
  for (const o of r.props) {
    const make = MAKERS[o.type];
    if (!make) { console.warn('No maker for', o.type); continue; }
    const f = frame(r, o), built = make(o);
    // Things built against a wall are pushed out by half their depth so their back touches it.
    const back = o.wall && built.foot[1] ? built.foot[1] / 2 : 0;
    for (const g of built.parts.concat(built.fine || [])) {
      if (back) g.translate(0, 0, back);
      place(g, { x: f.x, z: f.z, ry: f.ry });
    }
    parts.push(...built.parts);
    fine.push(...(built.fine || []));
    const fp = footprint(f, built.foot, back ? built.foot[1] / 2 : 0);
    if (fp && o.solid !== false) blocks.push(fp);
    if (built.seat && o.id) {
      const c = Math.cos(f.ry), s = Math.sin(f.ry), sz = built.seat.z;
      seats[o.id] = { x: f.x + sz * s, z: f.z + sz * c, y: built.seat.y, ry: f.ry, front: { x: f.x + 0.55 * s, z: f.z + 0.55 * c } };
    }
  }
  const group = new THREE.Group();
  group.add(mesh(parts, { line: 0.016 }));
  // Small things (the food in the shop) get a thinner outline, so they don't turn into blobs of ink.
  if (fine.length) group.add(mesh(fine, { line: 0.006 }));
  const out = { group, blocks, seats, bounds: [-r.w / 2, -r.d / 2, r.w / 2, r.d / 2] };
  if (H) {
    const { w, d } = r;
    // The walls block walking too (a diorama room's walls are its edges instead).
    blocks.push([-w / 2 - T, -d / 2 - T, w / 2 + T, -d / 2], [-w / 2 - T, -d / 2, -w / 2, d / 2 + T], [w / 2, -d / 2, w / 2 + T, d / 2 + T]);
    const fw = frontWall(r, H);
    blocks.push(...fw.blocks);
    out.front = mesh(fw.parts, { line: 0.016 });
    if (fw.sign) out.front.add(fw.sign);
    out.roof = mesh(roof(r, H), { line: 0.02 });
    group.add(out.front, out.roof);
    out.outer = [-w / 2 - T, -d / 2 - T, w / 2 + T, d / 2 + T];
    const door = H.door || { at: 0 };
    out.door = { x: door.at, z: d / 2 + T + 0.6 };
  }
  // A room can stand anywhere in the world: everything moves with it.
  const [ox, oz] = r.at || [0, 0];
  if (ox || oz) {
    group.position.set(ox, 0, oz);
    const shift = b => [b[0] + ox, b[1] + oz, b[2] + ox, b[3] + oz];
    out.blocks = blocks.map(shift);
    out.bounds = shift(out.bounds);
    if (out.outer) out.outer = shift(out.outer);
    if (out.door) out.door = { x: out.door.x + ox, z: out.door.z + oz };
    for (const s of Object.values(seats)) { s.x += ox; s.z += oz; s.front.x += ox; s.front.z += oz; }
  }
  return out;
}

// Furniture and things for the rooms. Each maker builds its shapes around its own origin (front facing +z) and
// returns { parts, foot: [w, d] (the floor it blocks, 0 for wall things), seat?: the spot to sit, facing +z }.
// A room places it with { x, z, ry } (see room.js). New rooms (the shop, the classroom, the céilí hall) add makers here.
import { box, cyl, ball, ring, slab } from './kit.js';

const WOOD = '#7A4E33', WOOD_D = '#5E3B27', WHITE = '#EDE7DA', IRON = '#34302D';

// Wall things are given the wall's face at z = 0, so they sit on its surface.
export const MAKERS = {
  // A cream solid-fuel range under a chimney breast, with a kettle on the hotplate.
  range(o) {
    const c = o.color || '#E4D8BE', p = [
      box(1.02, 0.06, 0.62, IRON, {}),
      box(1, 0.8, 0.6, c, { y: 0.06 }),
      box(1.04, 0.05, 0.64, IRON, { y: 0.86 }),
      cyl(0.17, 0.17, 0.05, 10, '#B7B3AA', { x: -0.24, y: 0.91, z: 0.02 }),
      cyl(0.17, 0.17, 0.05, 10, '#B7B3AA', { x: 0.24, y: 0.91, z: 0.02 }),
      box(0.4, 0.42, 0.03, '#D6C8AA', { x: -0.24, y: 0.22, z: 0.3 }),
      box(0.4, 0.42, 0.03, '#D6C8AA', { x: 0.24, y: 0.22, z: 0.3 }),
      box(0.92, 0.03, 0.04, '#9C978E', { y: 0.72, z: 0.33 }),
      cyl(0.07, 0.07, 1.6, 8, IRON, { x: 0.3, y: 0.9, z: -0.2 }),
      cyl(0.1, 0.12, 0.15, 8, '#2F4F46', { x: 0.24, y: 0.96, z: 0.02 }),
      box(0.12, 0.02, 0.03, '#2F4F46', { x: 0.36, y: 1.04, z: 0.02, rz: 0.6 }),
    ];
    return { parts: p, foot: [1.04, 0.64] };
  },
  // The chimney breast: built into the back wall, with a mantelpiece.
  chimney(o) {
    const w = o.w || 1.6, h = o.h || 2.5;
    return { parts: [
      box(w, h, 0.36, o.color || WHITE, {}),
      box(w + 0.1, 0.07, 0.24, WOOD, { y: 1.5, z: 0.25 }),
      box(0.08, 0.16, 0.08, '#C9B27A', { x: -0.55, y: 1.57, z: 0.25 }),
      box(0.08, 0.16, 0.08, '#C9B27A', { x: 0.55, y: 1.57, z: 0.25 }),
      box(0.22, 0.26, 0.05, '#E9E2CF', { x: 0, y: 1.57, z: 0.22 }),
    ], foot: [w, 0.36] };
  },
  // A painted kitchen dresser with plates on its shelves.
  dresser(o) {
    const c = o.color || '#5B2E2B', w = 1.3, p = [
      box(w, 0.86, 0.5, c, {}),
      box(w + 0.06, 0.045, 0.54, '#7A4A3C', { y: 0.86 }),
      box(0.56, 0.6, 0.03, '#4C2523', { x: -0.31, y: 0.12, z: 0.25 }),
      box(0.56, 0.6, 0.03, '#4C2523', { x: 0.31, y: 0.12, z: 0.25 }),
      box(w, 1.2, 0.05, c, { y: 0.9, z: -0.22 }),
      box(0.05, 1.2, 0.28, c, { x: -w / 2 + 0.025, y: 0.9, z: -0.1 }),
      box(0.05, 1.2, 0.28, c, { x: w / 2 - 0.025, y: 0.9, z: -0.1 }),
      box(w + 0.08, 0.08, 0.32, c, { y: 2.1, z: -0.1 }),
    ];
    for (const y of [1.25, 1.62]) p.push(box(w - 0.06, 0.03, 0.26, c, { y, z: -0.1 }));
    for (const y of [0.93, 1.28, 1.65]) for (let i = 0; i < 4; i++) {
      const x = -0.45 + i * 0.3;
      p.push(cyl(0.12, 0.12, 0.02, 10, '#F1EDE3', { x, y: y + 0.13, z: -0.15, rx: Math.PI / 2 - 0.2 }));
      p.push(cyl(0.07, 0.07, 0.02, 10, '#4C6F94', { x, y: y + 0.13, z: -0.137, rx: Math.PI / 2 - 0.2 }));
    }
    return { parts: p, foot: [w, 0.5] };
  },
  // A low cupboard with a sink and a tap, for under a window.
  sink(o) {
    const w = o.w || 1.4, c = o.color || '#3F5E52', p = [
      box(w, 0.86, 0.6, c, {}),
      box(w + 0.04, 0.05, 0.62, '#B9AE98', { y: 0.86 }),
      box(0.6, 0.12, 0.44, '#F2F0EA', { y: 0.8, z: 0.02 }),
      box(0.5, 0.02, 0.34, '#9FB4B8', { y: 0.86, z: 0.02 }),
      cyl(0.02, 0.02, 0.22, 6, '#A9A59D', { y: 0.91, z: -0.22 }),
      box(0.03, 0.03, 0.14, '#A9A59D', { y: 1.11, z: -0.16 }),
      box(0.58, 0.62, 0.03, '#36514A', { x: -0.33, y: 0.1, z: 0.3 }),
      box(0.58, 0.62, 0.03, '#36514A', { x: 0.33, y: 0.1, z: 0.3 }),
    ];
    return { parts: p, foot: [w + 0.04, 0.62] };
  },
  // A window on the wall's face, with a deep sill and a pot of geraniums.
  window(o) {
    const w = o.w || 0.95, h = o.h || 1.05, y = o.y || 1.05, p = [
      box(w + 0.16, h + 0.16, 0.06, '#F4F1EA', { y: y - 0.08, z: 0.03 }),
      box(w, h, 0.02, '#9DBEC4', { y, z: 0.065 }),
      box(0.05, h, 0.04, '#F4F1EA', { y, z: 0.08 }),
      box(w, 0.05, 0.04, '#F4F1EA', { y: y + h / 2 - 0.025, z: 0.08 }),
      box(w + 0.24, 0.06, 0.22, '#E7E1D2', { y: y - 0.1, z: 0.11 }),
    ];
    if (o.plant !== false) p.push(
      cyl(0.08, 0.06, 0.12, 8, '#B5653F', { x: -w / 4, y: y - 0.04, z: 0.12 }),
      ball(0.08, '#4D7A45', { x: -w / 4, y: y + 0.06, z: 0.12 }, 0),
      ball(0.04, '#C8423A', { x: -w / 4 + 0.04, y: y + 0.15, z: 0.15 }, 0),
      ball(0.04, '#C8423A', { x: -w / 4 - 0.05, y: y + 0.13, z: 0.1 }, 0),
    );
    if (o.curtain) p.push(
      box(0.2, h + 0.1, 0.04, o.curtain, { x: -w / 2 - 0.08, y: y - 0.05, z: 0.1 }),
      box(0.2, h + 0.1, 0.04, o.curtain, { x: w / 2 + 0.08, y: y - 0.05, z: 0.1 }),
    );
    return { parts: p, foot: [0, 0] };
  },
  // A red half-door with its frame, on the wall's face.
  door(o) {
    const c = o.color || '#8E3A2C', p = [
      box(1.1, 2.15, 0.06, '#E9E3D6', { z: 0.03 }),
      box(0.9, 1.0, 0.06, c, { z: 0.07 }),
      box(0.9, 1.0, 0.06, c, { y: 1.04, z: 0.07 }),
      box(0.94, 0.05, 0.1, shadeHex(c), { y: 1.0, z: 0.08 }),
      ball(0.035, '#C9B27A', { x: 0.33, y: 0.95, z: 0.1 }, 0),
    ];
    return { parts: p, foot: [0, 0] };
  },
  table(o) {
    const w = o.w || 1.5, d = o.d || 0.9, h = 0.74, p = [
      box(w, 0.05, d, WOOD, { y: h - 0.05 }),
      box(w + 0.04, 0.012, d + 0.04, o.cloth || '#B5493C', { y: h }),
      box(w + 0.04, 0.14, 0.012, o.cloth || '#B5493C', { y: h - 0.13, z: d / 2 + 0.02 }),
      box(w + 0.04, 0.14, 0.012, o.cloth || '#B5493C', { y: h - 0.13, z: -d / 2 - 0.02 }),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(box(0.07, h - 0.05, 0.07, WOOD_D, { x: sx * (w / 2 - 0.08), z: sz * (d / 2 - 0.08) }));
    return { parts: p, foot: [w, d] };
  },
  // Tea things on the table: a brown teapot, two mugs and a plate of brown bread.
  tea(o) {
    const y = o.y || 0.752, p = [
      ball(0.1, '#6B3F2A', { y, sy: 0.85 }),
      cyl(0.03, 0.03, 0.03, 8, '#6B3F2A', { y: y + 0.17 }),
      cyl(0.015, 0.025, 0.12, 6, '#6B3F2A', { x: 0.11, y: y + 0.05, rz: -0.9 }),
      ring(0.045, 0.012, '#6B3F2A', { x: -0.1, y: y + 0.09 }),
      cyl(0.04, 0.04, 0.09, 8, '#F1EDE3', { x: 0.34, y, z: 0.12 }),
      cyl(0.04, 0.04, 0.09, 8, '#4C6F94', { x: -0.36, y, z: -0.12 }),
      cyl(0.14, 0.12, 0.02, 10, '#F1EDE3', { x: 0.05, y, z: 0.22 }),
      box(0.16, 0.06, 0.09, '#7A5132', { x: 0.05, y: y + 0.02, z: 0.22 }),
    ];
    return { parts: p, foot: [0, 0] };
  },
  // A súgán chair (a straw seat); sit facing +z.
  chair(o) {
    const p = [
      box(0.44, 0.05, 0.42, '#C9A65C', { y: 0.42 }),
      box(0.46, 0.04, 0.44, WOOD, { y: 0.4 }),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(box(0.045, 0.4, 0.045, WOOD, { x: sx * 0.19, z: sz * 0.18 }));
    for (const sx of [-1, 1]) p.push(box(0.05, 0.5, 0.05, WOOD, { x: sx * 0.19, y: 0.45, z: -0.19 }));
    p.push(box(0.42, 0.06, 0.04, WOOD, { y: 0.8, z: -0.19 }), box(0.42, 0.05, 0.04, WOOD, { y: 0.66, z: -0.19 }));
    return { parts: p, foot: [0.46, 0.44], seat: { y: 0.46, z: 0.02 } };
  },
  armchair(o) {
    const c = o.color || '#7C4A3E', p = [
      box(0.8, 0.42, 0.75, c, { y: 0.05 }),
      box(0.8, 0.55, 0.2, c, { y: 0.4, z: -0.28 }),
      box(0.16, 0.22, 0.75, c, { x: -0.36, y: 0.45 }),
      box(0.16, 0.22, 0.75, c, { x: 0.36, y: 0.45 }),
      box(0.54, 0.1, 0.55, '#8F5A4C', { y: 0.45, z: 0.06 }),
      box(0.4, 0.3, 0.12, '#C9A65C', { x: 0.05, y: 0.55, z: -0.13, rx: -0.2 }),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.push(box(0.06, 0.06, 0.06, WOOD_D, { x: sx * 0.33, z: sz * 0.3 }));
    return { parts: p, foot: [0.8, 0.76] };
  },
  // A high-backed wooden bench (a settle).
  settle(o) {
    const w = o.w || 1.4, p = [
      box(w, 0.06, 0.46, WOOD, { y: 0.42 }),
      box(w, 0.42, 0.06, WOOD_D, { z: 0.2 }),
      box(w, 1.05, 0.06, WOOD, { y: 0.42, z: -0.2 }),
      box(0.06, 0.62, 0.46, WOOD_D, { x: -w / 2 + 0.03, y: 0 }),
      box(0.06, 0.62, 0.46, WOOD_D, { x: w / 2 - 0.03, y: 0 }),
      box(w + 0.04, 0.05, 0.12, WOOD_D, { y: 1.46, z: -0.18 }),
      box(0.4, 0.08, 0.36, '#4C6F94', { x: -0.3, y: 0.48 }),
    ];
    return { parts: p, foot: [w, 0.48] };
  },
  // A wicker basket of turf by the fire.
  turf(o) {
    const p = [cyl(0.26, 0.22, 0.32, 7, '#9C7A4B', {}), cyl(0.27, 0.27, 0.04, 7, '#86663D', { y: 0.3 })];
    const sods = [[-0.1, 0.02, 0.3], [0.08, -0.06, -0.4], [0.02, 0.09, 1.2], [-0.04, -0.1, 0.9], [0.1, 0.08, 2]];
    sods.forEach(([x, z, r], i) => p.push(box(0.2, 0.08, 0.1, i % 2 ? '#4A3326' : '#5A3F2E', { x, z, y: 0.3 + (i > 2 ? 0.07 : 0), ry: r })));
    return { parts: p, foot: [0.54, 0.54] };
  },
  rug(o) {
    const w = o.w || 1.6, d = o.d || 1.0;
    return { parts: [box(w, 0.015, d, o.edge || '#C49A55', {}), box(w - 0.14, 0.02, d - 0.14, o.color || '#8B3D35', {})], foot: [0, 0] };
  },
  // A round wall clock.
  clock(o) {
    const y = o.y || 1.95;
    return { parts: [
      cyl(0.17, 0.17, 0.05, 12, WOOD, { y, rx: Math.PI / 2, z: 0.0 }),
      cyl(0.14, 0.14, 0.02, 12, '#F3EEDF', { y, rx: Math.PI / 2, z: 0.04 }),
      box(0.015, 0.1, 0.01, IRON, { y: y + 0.0, z: 0.055 }),
      box(0.07, 0.015, 0.01, IRON, { x: 0.035, y: y + 0.0, z: 0.055 }),
    ], foot: [0, 0] };
  },
  // A St Brigid's cross of rushes.
  cross(o) {
    const y = o.y || 1.7, c = '#C9B27A', p = [box(0.42, 0.04, 0.02, c, { y, z: 0.01 }), box(0.04, 0.42, 0.02, c, { y: y - 0.19, z: 0.01 }), box(0.1, 0.1, 0.025, '#B39A62', { y: y - 0.03, z: 0.02 })];
    return { parts: p, foot: [0, 0] };
  },
  // A framed painting: hills, the sea and a sky in flat bands.
  picture(o) {
    const y = o.y || 1.6, w = o.w || 0.6, h = o.h || 0.42;
    return { parts: [
      box(w, h, 0.04, WOOD_D, { y, z: 0.02 }),
      box(w - 0.08, h - 0.08, 0.02, '#A9C4C8', { y: y + 0.04, z: 0.04 }),
      box(w - 0.08, h * 0.28, 0.025, '#4E7A8C', { y: y + 0.04, z: 0.045 }),
      slab([[-(w - 0.08) / 2, 0], [-0.05, 0], [-0.12, -0.12]], 0.01, '#5E7F4E', { y: y + 0.04 + h * 0.28, z: 0.05, rx: Math.PI / 2 }),
    ], foot: [0, 0] };
  },
  // Coats on hooks by the door.
  coats(o) {
    const y = o.y || 1.55, p = [box(0.8, 0.08, 0.04, WOOD, { y, z: 0.02 })];
    [['#3E5A3A', -0.2], ['#9C4A2F', 0.18]].forEach(([c, x]) => p.push(box(0.3, 0.62, 0.1, c, { x, y: y - 0.62, z: 0.08 }), box(0.18, 0.12, 0.1, c, { x, y: y - 0.04, z: 0.07 })));
    return { parts: p, foot: [0, 0] };
  },
};

function shadeHex(hex) {
  const n = parseInt(hex.slice(1), 16), f = v => Math.round(v * 0.8);
  return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

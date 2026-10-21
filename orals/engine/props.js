// Furniture and things for the rooms. Each maker builds its shapes around its own origin (front facing +z) and
// returns { parts, goods?: [{ name, at }] (things on shelves, see GOODS), signs?: [{ text, w, h, at, colors }],
// foot: [w, d] (the floor it blocks, 0 for wall things), seat?: the spot to sit, facing +z }.
// A room places it with { x, z, ry } (see room.js). New rooms (the shop, the classroom, the céilí hall) add makers here.
import { box, cyl, ball, ring, slab, model, merge } from './kit.js';
import { FOOD } from '../models/food.js';

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
  // ------------------------------------------------ the shop
  // The counter: a long wooden counter with a till, a jar of sweets and a bell.
  counter(o) {
    const w = o.w || 2.4, p = [
      box(w, 0.95, 0.7, '#6B4E3A', {}),
      box(w + 0.08, 0.06, 0.78, '#C2A27A', { y: 0.95 }),
      box(w - 0.2, 0.7, 0.03, '#5A3F2E', { y: 0.12, z: 0.36 }),
      box(0.42, 0.22, 0.34, '#2F2B28', { x: w / 2 - 0.45, y: 1.01, z: -0.05 }),
      box(0.3, 0.16, 0.04, '#7FB3AE', { x: w / 2 - 0.45, y: 1.24, z: -0.12, rx: -0.4 }),
      cyl(0.11, 0.11, 0.26, 10, '#D8E8EA', { x: -w / 2 + 0.35, y: 1.01, z: 0.05 }),
      cyl(0.08, 0.1, 0.05, 10, '#B8924F', { x: 0.1, y: 1.01, z: 0.15 }),
    ];
    // Sweets in the jar.
    for (const [c, dx, dy] of [['#E25C5C', -0.04, 0.06], ['#F2C94C', 0.04, 0.09], ['#6FBF73', 0, 0.15], ['#5C8DE2', -0.03, 0.2]]) p.push(ball(0.035, c, { x: -w / 2 + 0.35 + dx, y: 1.01 + dy, z: 0.05 }, 0));
    return { parts: p, foot: [w + 0.08, 0.78] };
  },
  // Shelves of groceries against a wall. o.rows: what is on each shelf from the bottom up, e.g.
  // [['flour'], ['beans', 'tomatoes'], ...] (names in GOODS), each laid out side by side till the shelf is full.
  shopShelf(o) {
    const w = o.w || 1.6, h = 2.0, c = o.color || '#7A4E33', p = [box(w, h, 0.06, c, { z: -0.17 })], goods = [];
    for (const sx of [-1, 1]) p.push(box(0.06, h, 0.4, c, { x: sx * (w / 2 - 0.03) }));
    const rows = o.rows || [['flour'], ['beans', 'tomatoes'], ['jam', 'honey'], ['bread']];
    for (let i = 0; i < 4; i++) {
      const y = 0.08 + i * 0.5;
      p.push(box(w - 0.12, 0.04, 0.38, c, { y }));
      goods.push(...row(rows[i] || [], -w / 2 + 0.1, w / 2 - 0.1, y + 0.04, 0.02, (o.seed || 1) + i));
    }
    return { parts: p, goods, foot: [w, 0.42] };
  },
  // An open-fronted chiller (o.w wide): milk, juice, water and cans of drink on its shelves, o.rows bottom up.
  fridge(o) {
    const w = o.w || 0.9, p = [box(w, 0.3, 0.7, '#F1F1EE', {}), box(w, 0.06, 0.06, '#9AA0A3', { y: 0.3, z: 0.32 }), box(w, 0.06, 0.66, '#3A3532', { y: 0.3 })], goods = [];
    // Corner posts, not side panels, so the drinks can be seen from the side too.
    for (let x = -w / 2 + 0.03; x < w / 2; x += Math.max(0.1, (w - 0.06) / Math.max(1, Math.round(w / 1.2)))) for (const sz of [-1, 1]) p.push(box(0.06, 1.95, 0.06, '#F1F1EE', { x, z: sz * 0.32 }));
    p.push(box(w, 1.65, 0.05, '#DCE3E4', { y: 0.3, z: -0.32 }), box(w, 0.26, 0.72, o.color || '#C8423A', { y: 1.9 }), box(w - 0.1, 0.06, 0.08, '#F4F1EA', { y: 1.84, z: 0.3 }));
    const rows = o.rows || [['milk'], ['juice', 'water'], ['fizzy', 'lemonade']];
    rows.forEach((r, i) => {
      const y = 0.36 + i * 0.5;
      if (i) p.push(box(w - 0.12, 0.03, 0.6, '#B9C0C2', { y: y - 0.03 }), box(w - 0.12, 0.04, 0.02, '#9AA0A3', { y: y - 0.03, z: 0.3 }));
      goods.push(...row(r, -w / 2 + 0.08, w / 2 - 0.08, y, 0.015, i + 5, 0.06));
    });
    return { parts: p, goods, foot: [w, 0.72] };
  },
  // Crates of fruit and vegetables on a sloped stand. o.produce: one kind for each crate (names in GOODS).
  crates(o) {
    const w = o.w || 1.3, p = [box(w, 0.6, 0.6, '#7A4E33', {})], goods = [];
    const kinds = o.produce || ['apple', 'orange', 'banana', 'cabbage'], n = kinds.length, cw = (w - 0.08) / n;
    kinds.forEach((kind, i) => {
      const x = -w / 2 + 0.04 + cw * (i + 0.5);
      // Each crate tips forward to show what's in it.
      p.push(box(cw - 0.03, 0.1, 0.5, '#A57B56', { x, y: 0.6, rx: 0.25 }));
      const s = goodsShape(kind), cols = Math.max(1, Math.floor((cw - 0.05) / (s.w + 0.01)));
      // Three rows, a little jumbled, lying on the slope of the crate.
      for (let j = 0; j < cols * 3; j++) {
        const cx = x + ((j % cols) - (cols - 1) / 2) * (s.w + 0.01), z = -0.15 + Math.floor(j / cols) * 0.15;
        goods.push({ name: kind, at: { x: cx + jitter(i, j) * 0.015, z, y: 0.69 - z * 0.25, ry: jitter(j, i) * 3, rx: 0.25 } });
      }
    });
    return { parts: p, goods, foot: [w, 0.6] };
  },
  // A supermarket's free-standing run of shelves (o.w long, along x), low enough to see over: o.front holds the
  // goods on its front shelves, bottom first (like shopShelf's rows), o.back those on the back (the camera never
  // looks at the back, so it can stay empty). o.sign: what's in the aisle, on a board along its top.
  gondola(o) {
    const L = o.w || 5, H = 1.2, c = o.color || '#E9E5DC', p = [box(L, 0.12, 0.8, '#3A3532', {}), box(L - 0.1, H, 0.06, c, {}), box(L, 0.04, 0.84, c, { y: H })], goods = [];
    for (const sx of [-1, 1]) p.push(box(0.06, H + 0.04, 0.86, c, { x: sx * (L / 2 - 0.03) }));
    [o.front || [], o.back || []].forEach((rows, side) => {
      const sz = side ? -1 : 1;
      [0.12, 0.5, 0.88].forEach((y, i) => {
        if (i) p.push(box(L - 0.12, 0.035, 0.38, c, { y, z: sz * 0.22 }));
        p.push(box(L - 0.12, 0.05, 0.015, '#F4F1EA', { y: y - 0.02, z: sz * 0.415 }));
        goods.push(...row(rows[i] || [], -L / 2 + 0.1, L / 2 - 0.1, y + (i ? 0.035 : 0), 0.02, (o.seed || 1) + i + side * 7, sz * 0.22, side ? Math.PI : 0));
      });
    });
    const signs = [];
    if (o.sign) {
      const sw = Math.min(L * 0.55, 2.2), sh = 0.4;
      for (const sx of [-1, 1]) p.push(box(0.04, 0.12, 0.04, '#3A3532', { x: sx * sw * 0.35, y: H + 0.04 }));
      p.push(box(sw + 0.04, sh + 0.04, 0.03, '#2F3438', { y: H + 0.14, z: -0.02 }));
      signs.push({ text: o.sign, w: sw, h: sh, at: { y: H + 0.16 + sh / 2, z: 0.001 }, colors: { bg: '#F4F1EA', ink: '#2F5D8A' } });
    }
    return { parts: p, goods, signs, foot: [L, 0.86] };
  },
  // An open chest freezer: tubs of ice cream and lollies lying inside, seen from above.
  freezer(o) {
    const w = o.w || 1.8, p = [box(w, 0.55, 0.8, '#F1F1EE', {}), box(w - 0.12, 0.01, 0.68, '#BFD9DE', { y: 0.55 }), box(w, 0.12, 0.02, '#2F5D8A', { y: 0.4, z: 0.41 })], goods = [];
    for (const sz of [-1, 1]) p.push(box(w, 0.27, 0.06, '#F1F1EE', { y: 0.55, z: sz * 0.37 }), box(w, 0.03, 0.08, '#9AA0A3', { y: 0.82, z: sz * 0.37 }));
    for (const sx of [-1, 1]) p.push(box(0.06, 0.27, 0.8, '#F1F1EE', { x: sx * (w / 2 - 0.03), y: 0.55 }));
    const kinds = o.goods || ['icecream', 'lolly', 'chocice', 'icecream2'];
    const share = (w - 0.16) / kinds.length;
    kinds.forEach((k, i) => {
      const s = goodsShape(k), x0 = -w / 2 + 0.08 + share * i, lying = k === 'lolly' || k === 'chocice';
      for (let x = x0 + 0.06; x < x0 + share - 0.04; x += (lying ? 0.09 : s.w + 0.02)) for (let z = -0.24; z <= 0.24; z += (lying ? 0.24 : s.d + 0.03)) {
        goods.push({ name: k, at: lying ? { x, y: 0.58, z: z + 0.1, rx: -Math.PI / 2, ry: jitter(x * 9, z) * 0.2 } : { x, y: 0.56, z, ry: jitter(x * 9, z) * 0.1 } });
      }
    });
    return { parts: p, goods, foot: [w, 0.8] };
  },
  // A stack of red shopping baskets by the door.
  baskets() {
    const p = [];
    for (let i = 0; i < 5; i++) p.push(box(0.5, 0.06, 0.34, i % 2 ? '#B33A3A' : '#C8423A', { y: i * 0.07 }), box(0.44, 0.02, 0.28, '#7A2A2A', { y: i * 0.07 + 0.06 }));
    p.push(box(0.04, 0.16, 0.3, '#3A3532', { x: -0.2, y: 0.35 }), box(0.04, 0.16, 0.3, '#3A3532', { x: 0.2, y: 0.35 }));
    return { parts: p, foot: [0.5, 0.34] };
  },
  // A sign hanging from the ceiling on two rods (o.text), o.y high, o.ceiling the height of the walls.
  hangingSign(o) {
    const w = o.w || 2.2, h = o.h || 0.5, y = o.y || 2.45, top = o.ceiling || 3.2;
    const p = [-1, 1].map(sx => cyl(0.012, 0.012, top - y - h / 2, 4, '#3A3532', { x: sx * w * 0.38, y: y + h / 2 }));
    p.push(box(w + 0.04, h + 0.04, 0.03, '#2F3438', { y: y - h / 2 - 0.02, z: -0.02 }));
    return { parts: p, signs: [{ text: o.text, w, h, at: { y, z: 0.001 }, colors: o.colors || { bg: '#F4F1EA', ink: '#2F5D8A' } }], foot: [0, 0] };
  },
  // A doormat inside the door.
  mat(o) { return { parts: [box(o.w || 1.3, 0.015, o.d || 0.8, '#5A4A3E', {}), box((o.w || 1.3) - 0.12, 0.018, (o.d || 0.8) - 0.12, '#6E5B4C', {})], foot: [0, 0] }; },
  // A stand of newspapers.
  newsstand(o) {
    const p = [box(0.6, 0.8, 0.4, '#3B4146', {}), box(0.6, 0.05, 0.42, '#2F3438', { y: 0.8 })];
    for (let i = 0; i < 3; i++) p.push(box(0.5, 0.04, 0.32, '#EDEAE2', { y: 0.84 + i * 0.03, ry: (i - 1) * 0.08 }), box(0.3, 0.005, 0.05, '#4A4440', { y: 0.86 + i * 0.03, z: -0.06 }));
    return { parts: p, foot: [0.6, 0.42] };
  },

  // Coats on hooks by the door.
  coats(o) {
    const y = o.y || 1.55, p = [box(0.8, 0.08, 0.04, WOOD, { y, z: 0.02 })];
    [['#3E5A3A', -0.2], ['#9C4A2F', 0.18]].forEach(([c, x]) => p.push(box(0.3, 0.62, 0.1, c, { x, y: y - 0.62, z: 0.08 }), box(0.18, 0.12, 0.1, c, { x, y: y - 0.04, z: 0.07 })));
    return { parts: p, foot: [0, 0] };
  },
};

// ------------------------------------------------ goods
// What can go on a shelf or in a crate: a model from FOOD standing h metres high, a packet (a box with a label
// on its front: [w, h, d], colour, label colour) or a bottle ([radius, height], colour, cap colour). Makers give
// back goods as [{ name, at }]; the room draws each kind as one instanced mesh (kit.instanced), since a
// supermarket holds over a thousand. Models are simplified a little (kit.model's cells) as they're seen small.
export const GOODS = {
  milk: { m: 0.24 }, juice: { m: 0.16 }, cola: { m: 0.28 }, water: { m: 0.28 }, tomatoes: { m: 0.11 }, beans: { m: 0.11 },
  tuna: { m: 0.05 }, fizzy: { m: 0.12 }, lemonade: { m: 0.12 }, bread: { m: 0.13 }, sodabread: { m: 0.09 }, flour: { m: 0.2 },
  honey: { m: 0.1 }, jam: { m: 0.1 }, ketchup: { m: 0.19 }, chocolate: { m: 0.02 }, oil: { m: 0.26 },
  croissant: { m: 0.06 }, muffin: { m: 0.08 }, donut: { m: 0.03 }, cake: { m: 0.1 }, pie: { m: 0.05 }, lolly: { m: 0.15 }, chocice: { m: 0.15 },
  apple: { m: 0.08 }, orange: { m: 0.08 }, banana: { m: 0.06 }, pear: { m: 0.1 }, lemon: { m: 0.07 }, cabbage: { m: 0.14 }, onion: { m: 0.07 },
  tomato: { m: 0.07 }, broccoli: { m: 0.12 }, mushroom: { m: 0.05 }, pepper: { m: 0.09 },
  cereal: { box: [0.19, 0.28, 0.07], c: '#E8A33D', l: '#F4F1EA' }, cornflakes: { box: [0.19, 0.28, 0.07], c: '#3C6E9C', l: '#E9D45A' },
  oats: { box: [0.14, 0.2, 0.09], c: '#C9B27A', l: '#3E5A3A' }, tea: { box: [0.14, 0.1, 0.09], c: '#C8423A', l: '#E9D45A' },
  biscuits: { box: [0.2, 0.06, 0.07], c: '#2F5D8A', l: '#E8E2D0' }, crisps: { box: [0.16, 0.22, 0.05], c: '#E8932F', l: '#C8423A' },
  crisps2: { box: [0.16, 0.22, 0.05], c: '#3C6E9C', l: '#F4F1EA' }, pasta: { box: [0.1, 0.2, 0.06], c: '#2F5D8A', l: '#E9D45A' },
  rice: { box: [0.12, 0.18, 0.06], c: '#F4F1EA', l: '#C8423A' }, sugar: { box: [0.12, 0.17, 0.08], c: '#F4F1EA', l: '#3C6E9C' },
  rolls: { box: [0.26, 0.22, 0.13], c: '#F4F1EA', l: '#7FB3AE' }, sweets: { box: [0.12, 0.16, 0.04], c: '#B33A3A', l: '#F2C94C' },
  sweets2: { box: [0.12, 0.16, 0.04], c: '#7C4A6B', l: '#F4F1EA' }, icecream: { box: [0.16, 0.09, 0.11], c: '#E199D8', l: '#F4F1EA' },
  icecream2: { box: [0.16, 0.09, 0.11], c: '#F4F1EA', l: '#996450' },
  soap: { bottle: [0.035, 0.2], c: '#4C9A5B', l: '#F4F1EA' }, bleach: { bottle: [0.045, 0.24], c: '#3C6E9C', l: '#F4F1EA' },
};

// A kind of goods made once: its shape (at its own origin, standing on y = 0) and its size.
const shapes = {};
export function goodsShape(name) {
  if (shapes[name]) return shapes[name];
  const g = GOODS[name] || GOODS.beans;
  let geo, w, d, h;
  if (g.m) {
    const m = FOOD[name] || FOOD.beans, s = model.size(m, g.m);
    geo = model(m, g.m, undefined, 7); w = s.w; d = s.d; h = g.m;
  } else if (g.box) {
    [w, h, d] = g.box;
    geo = merge([box(w, h, d, g.c), box(w * 0.78, h * 0.42, 0.006, g.l, { y: h * 0.32, z: d / 2 })]);
  } else {
    const [r, bh] = g.bottle;
    w = d = r * 2; h = bh;
    geo = merge([cyl(r, r, bh * 0.82, 8, g.c), cyl(r * 0.45, r * 0.8, bh * 0.1, 8, g.c, { y: bh * 0.82 }), cyl(r * 0.4, r * 0.4, bh * 0.08, 6, g.l, { y: bh * 0.92 })]);
  }
  return (shapes[name] = { geo, w, d, h });
}

// A steady random number from -1 to 1 for a pair of numbers (so the shop looks the same every time).
function jitter(a, b) { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; }

// A shelf's worth of goods between x0 and x1: each kind gets an equal share and fills it side by side.
// ry turns them all (PI for the back of a double-sided shelf, so they face out).
function row(names, x0, x1, y, gap, seed, z = 0.02, ry = 0) {
  const out = [], share = (x1 - x0) / Math.max(1, names.length);
  names.forEach((name, k) => {
    const s = goodsShape(name), step = s.w + gap, n = Math.max(1, Math.floor((share + gap) / step));
    const start = x0 + share * k + (share - (n * step - gap)) / 2 + s.w / 2;
    for (let i = 0; i < n; i++) out.push({ name, at: { x: start + i * step, y, z, ry: ry + jitter(seed + k, i) * 0.12 } });
  });
  return out;
}

function shadeHex(hex) {
  const n = parseInt(hex.slice(1), 16), f = v => Math.round(v * 0.8);
  return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

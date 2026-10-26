// Checks Draw your own (bio/maker-draw.js), the parts that don't need a screen:
//   The code    a drawing (lines, rubbed-out lines, fills, on each background) comes back from its code the same; a
//               broken or altered code (bad colour, a point off the canvas, a stray letter, a character on a place's
//               background) is no drawing; a drawing too long for a link is thinned until it fits.
//   Tidy up     a wobbly nearly-straight line becomes straight (and level when nearly level); a wobbly loop becomes a
//               circle, an oval, a rectangle (square to the page when nearly so) or a triangle; a scribble stays a
//               smooth line; an end that nearly meets another line is joined to it; and so for 50 wobbly drawings
//               of each.
//   Fill        fills the inside of a drawn ring, not outside it, even through a gap of 3 pixels; through a gap of 20
//               it does fill outside; on nothing (a character) it fills the inside only; the soft edges of the line
//               take the fill's colour; filling with the colour that's there changes nothing; a night sky and its
//               navy ground are different areas.
//   The wheel   colours go round the wheel and back the same.
// Run: node tools/bio/tests/draw.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
global.btoa = s => Buffer.from(s, 'binary').toString('base64');
global.atob = s => Buffer.from(s, 'base64').toString('binary');
require('../../../bio/maker-draw.js');
const D = window.BioMakerDraw;
let fails = 0, n = 0;
const fail = msg => { fails++; if (fails < 30) console.log('   FAIL', msg); };
let seed = 11;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const jitter = a => a + (rand() - 0.5) * 2 * 2.2;
const flat = ps => ps.flatMap(p => [Math.round(p[0]), Math.round(p[1])]);

// ---------------------------------------------------------------- the code
{
  const ops = [
    { t: 's', c: '#13294A', w: 9, z: 2, p: [10, 10, 40, 12, 80, 30, 120, 90] },
    { t: 'f', c: '#FFC800', k: '#CDEBFA', x: 500, y: 100 },
    { t: 'e', w: 18, z: 2, p: [300, 200, 310, 205] },
    { t: 's', c: '#FF4B4B', w: 4, z: 1, p: [100, 100, 200, 100, 200, 200, 100, 200] },
    { t: 'f', c: '#58CC02', k: '', x: 5, y: 5 }
  ];
  for (const start of ['b', 'g', 's', 'n', 'p']) {
    const code = D.encode({ start, ops }), back = D.decode(code, 'place');
    n++;
    if (!back || back.start !== start || JSON.stringify(back.ops) !== JSON.stringify(ops)) fail(`a place on ${start} doesn't come back from its code: ${code}`);
  }
  const ch = D.encode({ start: 'b', ops: ops.slice(0, 1) });
  n += 6;
  if (!D.decode(ch, 'char')) fail('a character doesn\'t come back from its code');
  if (D.decode(D.encode({ start: 'g', ops: [] }), 'char')) fail('a character on a place\'s background should be no drawing');
  if (D.decode(ch.replace('13294A', '13294Z'), 'char')) fail('a bad colour should be no drawing');
  if (D.decode(D.encode({ start: 'b', ops: [{ t: 's', c: '#13294A', w: 4, z: 0, p: [10, 10, 900, 10] }] }), 'char')) fail('a point off a character\'s canvas should be no drawing');
  if (D.decode(ch + ';q12', 'char') || D.decode('2b', 'char') || D.decode('1b;s13294A,4,0,@@@', 'char')) fail('a stray letter should be no drawing');
  if (D.decode(D.encode({ start: 'b', ops: [{ t: 's', c: '#13294A', w: 99, z: 0, p: [10, 10, 20, 10] }] }), 'char')) fail('a line 99 wide should be no drawing');
  // A drawing too long for a link is thinned until it fits.
  const big = [];
  for (let k = 0; k < 40; k++) { const p = []; for (let i = 0; i < 300; i++) p.push(Math.round(480 + 400 * Math.cos(i / 40 + k)), Math.round(150 + 120 * Math.sin(i / 37 + k))); big.push({ t: 's', c: '#13294A', w: 4, z: 2, p }); }
  const raw = D.encode({ start: 'g', ops: big }), fitted = D.fit({ start: 'g', ops: big }, 'place');
  n++;
  if (raw.length <= D.MAX_CODE) fail('the long drawing isn\'t long');
  else if (!fitted || fitted.length > D.MAX_CODE) fail(`a long drawing (${raw.length}) isn't thinned to fit (${fitted && fitted.length})`);
}

// ---------------------------------------------------------------- tidy up
function loop(fn, steps = 60, gap = 0) { const ps = []; for (let i = 0; i <= steps - gap; i++) ps.push(fn(i / steps)); return ps.map(p => [jitter(p[0]), jitter(p[1])]); }
const shapes = [
  ['line', Array.from({ length: 30 }, (_, i) => [50 + i * 10, 100 + i * 2]), r => r.kind === 'line'],
  ['level line', Array.from({ length: 30 }, (_, i) => [50 + i * 10, 100 + i * 0.4]), r => r.kind === 'line' && r.ps[0][1] === r.ps[1][1]],
  ['circle', loop(t => [200 + 60 * Math.cos(t * 2 * Math.PI), 150 + 60 * Math.sin(t * 2 * Math.PI)]), r => r.kind === 'circle' && r.closed],
  ['circle left open a little', loop(t => [200 + 60 * Math.cos(t * 2 * Math.PI), 150 + 60 * Math.sin(t * 2 * Math.PI)], 60, 3), r => r.kind === 'circle'],
  ['oval', loop(t => [300 + 110 * Math.cos(t * 2 * Math.PI), 150 + 45 * Math.sin(t * 2 * Math.PI)]), r => r.kind === 'ellipse'],
  ['rectangle', loop(t => { const s = t * 4, side = Math.floor(s) % 4, f = s - Math.floor(s); return [[100 + 200 * f, 50], [300, 50 + 120 * f], [300 - 200 * f, 170], [100, 170 - 120 * f]][side]; }, 80),
    r => r.kind === 'rect' && Math.abs(r.ps[0][1] - r.ps[1][1]) < 0.01 && Math.abs(r.ps[1][0] - r.ps[2][0]) < 0.01],
  ['triangle', loop(t => { const P = [[100, 200], [200, 40], [300, 200]], s = t * 3, i = Math.floor(s) % 3, f = s - Math.floor(s), a = P[i], b = P[(i + 1) % 3]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }, 75),
    r => r.kind === 'triangle'],
  ['scribble', Array.from({ length: 50 }, (_, i) => [50 + i * 8, 150 + 60 * Math.sin(i / 5)]), r => r.kind === 'curve' && !r.closed]
];
for (const [name, ps, ok] of shapes) {
  const r = D.tidyStroke(ps.map(p => [Math.round(p[0]), Math.round(p[1])]));
  n++;
  if (!ok(r)) fail(`${name}: tidied as ${r.kind}${r.closed ? ' (closed)' : ''} (${r.ps.length} points)`);
}
// And on many drawings: 50 of each shape, with a hand's wobble (a slow drift of 3px and a jitter), tidied right at least
// 47 times in 50.
{
  const wob = ps => { const f1 = rand() * 6, f2 = rand() * 6, ph = rand() * 6; return ps.map((p, i) => { const t = i / ps.length; return [Math.round(p[0] + 3 * Math.sin(t * f1 * 6.28 + ph) + (rand() - 0.5) * 2), Math.round(p[1] + 3 * Math.cos(t * f2 * 6.28 + ph) + (rand() - 0.5) * 2)]; }); };
  const gen = {
    line: () => { const a = [rand() * 400, rand() * 200], b = [a[0] + 100 + rand() * 300, a[1] + (rand() - 0.5) * 200]; return Array.from({ length: 40 }, (_, i) => [a[0] + (b[0] - a[0]) * i / 39, a[1] + (b[1] - a[1]) * i / 39]); },
    circle: () => { const r = 30 + rand() * 80, s0 = rand() * 6; return Array.from({ length: 68 }, (_, i) => [300 + r * Math.cos(s0 + i / 70 * 6.283), 150 + r * Math.sin(s0 + i / 70 * 6.283)]); },
    ellipse: () => { const rx = 60 + rand() * 80, ry = rx * (0.35 + rand() * 0.35); return Array.from({ length: 70 }, (_, i) => [300 + rx * Math.cos(i / 69 * 6.283), 150 + ry * Math.sin(i / 69 * 6.283)]); },
    rect: () => { const w = 80 + rand() * 200, h = 60 + rand() * 120, P = [[100, 50], [100 + w, 50], [100 + w, 50 + h], [100, 50 + h]], out = [];
      for (let k = 0; k < 4; k++) { const a = P[k], b = P[(k + 1) % 4]; for (let i = 0; i < 20; i++) out.push([a[0] + (b[0] - a[0]) * i / 20, a[1] + (b[1] - a[1]) * i / 20]); } out.push(out[0].slice()); return out; },
    triangle: () => { const P = [[100 + rand() * 40, 220], [200 + rand() * 60, 40 + rand() * 40], [320 + rand() * 60, 220 - rand() * 30]], out = [];
      for (let k = 0; k < 3; k++) { const a = P[k], b = P[(k + 1) % 3]; for (let i = 0; i < 25; i++) out.push([a[0] + (b[0] - a[0]) * i / 25, a[1] + (b[1] - a[1]) * i / 25]); } out.push(out[0].slice()); return out; },
    curve: () => Array.from({ length: 60 }, (_, i) => [50 + i * 7, 150 + (40 + rand() * 40) * Math.sin(i / (4 + rand() * 3))])
  };
  for (const k of Object.keys(gen)) {
    let ok = 0;
    for (let t = 0; t < 50; t++) if (D.tidyStroke(wob(gen[k]())).kind === k) ok++;
    n++;
    if (ok < 47) fail(`${k}: tidied right only ${ok} times in 50`);
  }
}
{
  // Ends that nearly meet: the second line's start is 7px off the first; after tidying it's on it.
  const a = { t: 's', c: '#13294A', w: 4, z: 2, p: flat(Array.from({ length: 20 }, (_, i) => [100 + i * 10, 100])) };
  const b = { t: 's', c: '#13294A', w: 4, z: 2, p: flat(Array.from({ length: 20 }, (_, i) => [200, 107 + i * 8])) };
  const r = D.tidyAll([a, b]);
  n++;
  if (Math.abs(r.ops[1].p[1] - 100) > 0.6) fail(`an end 7px off a line isn't joined to it: ${r.ops[1].p.slice(0, 2)}`);
  if (r.kinds.line !== 2) fail(`two lines tidied as ${JSON.stringify(r.kinds)}`);
  if (a.p[1] !== 100 || b.p[1] !== 107) fail('tidying changed the drawing it was given (undo needs it)');
}

// ---------------------------------------------------------------- fill
// A W x H raster; lines stamped as round brushes.
function raster(W, H, clear) { const d = new Uint8ClampedArray(W * H * 4); for (let i = 0; i < W * H; i++) d.set(clear ? [0, 0, 0, 0] : [255, 255, 255, 255], i * 4); return d; }
function stamp(d, W, H, x, y, r, c) {
  for (let yy = Math.floor(y - r - 1); yy <= y + r + 1; yy++) for (let xx = Math.floor(x - r - 1); xx <= x + r + 1; xx++) {
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const cover = Math.max(0, Math.min(1, r + 0.5 - Math.hypot(xx - x, yy - y))), o = (yy * W + xx) * 4;
    if (!cover) continue;
    for (let k = 0; k < 3; k++) d[o + k] = Math.round(d[o + k] * (1 - cover) + c[k] * cover);
    d[o + 3] = Math.max(d[o + 3], Math.round(255 * cover));
  }
}
function ring(d, W, H, gapDeg) {
  for (let a = 0; a < 360; a += 0.5) {
    const g = a < gapDeg;
    if (!g) stamp(d, W, H, 100 + 50 * Math.cos(a * Math.PI / 180), 100 + 50 * Math.sin(a * Math.PI / 180), 1.6, [19, 41, 74]);
  }
}
const px = (d, W, x, y) => Array.from(d.slice((y * W + x) * 4, (y * W + x) * 4 + 4));
for (const [gapDeg, leaks, what] of [[0, false, 'a closed ring'], [3.5, false, 'a ring with a 3px gap'], [23, true, 'a ring with a 20px gap']]) {
  const W = 200, H = 200, d = raster(W, H);
  ring(d, W, H, gapDeg);
  const did = D.fillRegion(d, W, H, 100, 100, '#FFC800', '#FFFFFF');
  n++;
  const inside = px(d, W, 100, 100), outside = px(d, W, 5, 5), edge = px(d, W, 100 + 48, 100);
  if (!did || inside.join() !== '255,200,0,255') fail(`${what}: the inside isn't filled (${inside})`);
  if ((outside.join() === '255,200,0,255') !== leaks) fail(`${what}: outside ${leaks ? 'should' : 'shouldn\'t'} be filled (${outside})`);
  if (!leaks && edge[2] > 120) fail(`${what}: the line's soft inner edge kept white (${edge})`);
}
{
  const W = 200, H = 200, d = raster(W, H, true);
  ring(d, W, H, 3.5);
  D.fillRegion(d, W, H, 100, 100, '#FF4B4B', '');
  n++;
  if (px(d, W, 100, 100).join() !== '255,75,75,255' || px(d, W, 5, 5)[3] !== 0) fail(`a character's ring: inside ${px(d, W, 100, 100)}, outside ${px(d, W, 5, 5)}`);
  const before = d.slice();
  n++;
  if (D.fillRegion(d, W, H, 100, 100, '#FF4B4B', '#FF4B4B') || d.some((v, i) => v !== before[i])) fail('filling with the colour that\'s there changed something');
  // After a tidy moved a line onto the spot that was tapped, the fill finds the colour that was tapped nearby.
  const d2 = raster(W, H);
  ring(d2, W, H, 0);
  stamp(d2, W, H, 100, 100, 3, [19, 41, 74]);
  n++;
  if (!D.fillRegion(d2, W, H, 100, 100, '#1CB0F6', '#FFFFFF') || px(d2, W, 110, 110).join() !== '28,176,246,255') fail('a fill on a spot now covered by a line doesn\'t find the colour that was tapped');
}

{
  // Night: the sky and the ground are close navy blues, but separate areas; a filled moon stays when the sky is filled.
  const W = 120, H = 60, d = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) d.set(Math.floor(i / W) < 45 ? [0x1B, 0x2A, 0x4A, 255] : [0x2C, 0x3E, 0x5C, 255], i * 4);
  for (let a = 0; a < 360; a += 1) stamp(d, W, H, 30 + 10 * Math.cos(a * Math.PI / 180), 20 + 10 * Math.sin(a * Math.PI / 180), 1.2, [255, 255, 255]);
  D.fillRegion(d, W, H, 30, 20, '#FFC800', '#1B2A4A');
  D.fillRegion(d, W, H, 90, 10, '#58CC02', '#1B2A4A');
  n++;
  if (px(d, W, 90, 55).join() !== '44,62,92,255') fail(`filling the night sky filled the ground too (${px(d, W, 90, 55)})`);
  if (px(d, W, 30, 20).join() !== '255,200,0,255') fail(`filling the night sky covered the moon (${px(d, W, 30, 20)})`);
  if (px(d, W, 90, 10).join() !== '88,204,2,255') fail(`the night sky wasn't filled (${px(d, W, 90, 10)})`);
}

// ---------------------------------------------------------------- the wheel
for (const hex of ['#13294A', '#FFC800', '#1CB0F6', '#FF86D0', '#2BD4BD', '#FFFFFF', '#000000']) {
  const c = parseInt(hex.slice(1), 16), back = D.hsv2rgb(...D.rgb2hsv(c >> 16, (c >> 8) & 255, c & 255));
  n++;
  if (back.join() !== [c >> 16, (c >> 8) & 255, c & 255].join()) fail(`${hex} comes back from the wheel as ${back}`);
}
console.log(fails ? `${fails} failures` : `ok: ${n} checks: codes come back the same and altered ones are no drawing, Tidy up finds lines, circles, ovals, rectangles and triangles and joins ends, fills don't leak through small gaps`);
process.exit(fails ? 1 : 0);

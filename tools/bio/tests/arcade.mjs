// Checks the logic of Sea Battle, Cannon Duel and Topple the Examiner (bio/bio-arcade.js):
//   Sea Battle  every fleet has its five ships (4, 3, 3, 2, 2), in the sea and not touching; his aim never fires at the
//               same square twice, sinks a whole fleet, and follows up a hit next to it.
//   Cannon      his aim with no wobble lands near you, through any wind and over any hills; shells dig craters.
//   Tower       every level's tower stands on its own (he doesn't move in six seconds), and some shot knocks him off.
// Run: node tools/bio/tests/arcade.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
window.Matter = require('../../../bio/vendor/matter.min.js');
window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {} };
window.BioBoard = { pools() {}, nearMascot() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
require('../../../bio/bio-arcade.js');
const T = window.BioArcade.test, M = window.Matter;
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
// A repeatable random number source.
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// ---------------------------------------------------------------- Sea Battle
for (let g = 0; g < 300; g++) {
  const rand = seeded(g + 1), sea = T.place(rand), lens = sea.ships.map(s => s.cells.length).join();
  if (lens !== '4,3,3,2,2') fail(`fleet ${g}: ships ${lens}`);
  const all = sea.ships.flatMap(s => s.cells);
  if (all.some(x => x < 0 || x >= 64) || new Set(all).size !== all.length) fail(`fleet ${g}: a ship off the sea or two on one square`);
  sea.ships.forEach((s, i) => {
    const r = s.cells.map(x => Math.floor(x / 8)), c = s.cells.map(x => x % 8);
    const line = r.every(v => v === r[0]) && c.every((v, k) => v === c[0] + k) || c.every(v => v === c[0]) && r.every((v, k) => v === r[0] + k);
    if (!line) fail(`fleet ${g}: ship ${i} isn't in a straight line`);
    s.cells.forEach(x => {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = Math.floor(x / 8) + dr, cc = x % 8 + dc, n = rr * 8 + cc;
        if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && sea.at[n] && sea.at[n] !== i + 1) fail(`fleet ${g}: ships ${i} and ${sea.at[n] - 1} touch`);
      }
    });
  });
  // His whole game against it: no square twice, every ship sunk, and after a hit on a ship still afloat his next shot
  // is beside one of its hits.
  let shots = 0, lastHit = null;
  while (T.afloat(sea) && shots < 64) {
    const x = T.aim(sea, rand);
    if (sea.shot[x]) { fail(`game ${g}: fired at ${x} twice`); break; }
    if (lastHit !== null) {
      const hurt = sea.ships.find(s => s.hits && s.hits < s.cells.length);
      const beside = hurt && hurt.cells.filter(c => sea.shot[c]).some(h => Math.abs(h - x) === 8 || Math.abs(h - x) === 1 && Math.floor(h / 8) === Math.floor(x / 8));
      if (hurt && !beside) fail(`game ${g}: after a hit he fired away from it`);
    }
    const r = T.fire(sea, x);
    lastHit = r === 'hit' ? x : null;
    shots++;
  }
  if (T.afloat(sea)) fail(`game ${g}: ships left after ${shots} shots`);
}

// ---------------------------------------------------------------- Cannon Duel
let near = 0, tried = 0;
for (let g = 0; g < 24; g++) {
  const rand = seeded(1000 + g), h = T.hills(rand), tanks = T.POS.map(x => ({ x, y: h[x], hp: 100 })), wind = (rand() * 2 - 1) * 70;
  const s = T.solve(h, tanks, wind, true, () => 0.5), me = tanks[1];
  const f = T.flight(h, tanks, me.x, me.y - 14, s.angle, s.power, wind);
  tried++;
  if (f.direct === 0 || !f.out && Math.abs(f.x - tanks[0].x) < 30) near++;
}
if (near < tried * 0.9) fail(`his steady aim landed near you ${near} of ${tried} times`);
{
  const h = T.hills(seeded(7)), tanks = T.POS.map(x => ({ x, y: h[x], hp: 100 })), before = h[500];
  const hurt = T.burst(h, tanks, { x: 500, y: before }, false);
  if (!(h[500] > before + 20)) fail('a shell on the hill dug no crater');
  if (hurt.some(d => d)) fail('a shell in the middle hurt a cannon');
  const hit = T.burst(h, tanks, { x: tanks[0].x, y: tanks[0].y - 10, direct: 0 }, false);
  if (hit[0] !== 40 || tanks[0].hp !== 60) fail(`a direct hit did ${hit[0]}`);
}

// ---------------------------------------------------------------- Topple the Examiner
for (let lv = 0; lv < 5; lv++) {
  const w = T.world(lv);
  T.tick(w, 240);
  const x0 = w.him.position.x, y0 = w.him.position.y;
  w.startY = y0;
  T.tick(w, 180 * 6);
  if (Math.hypot(w.him.position.x - x0, w.him.position.y - y0) > 3 || T.off(w)) fail(`level ${lv + 1}: the tower doesn't stand on its own`);
  // A spread of full textbook shots: at least one knocks him off.
  let off = 0;
  for (let deg = 0; deg <= 50 && !off; deg += 5) for (let pull = 70; pull <= 110 && !off; pull += 10) {
    const v = T.world(lv);
    T.tick(v, 240);
    v.startY = v.him.position.y;
    const px = -pull * Math.cos(deg * Math.PI / 180), py = pull * Math.sin(deg * Math.PI / 180);
    const b = M.Bodies.rectangle(T.SLING.x + px, T.SLING.y + py, 44, 32, { density: 0.009, friction: 0.6, restitution: 0.1 });
    M.Composite.add(v.eng.world, b);
    M.Body.setVelocity(b, { x: -px * T.LAUNCH, y: -py * T.LAUNCH });
    for (let f = 0, calm = 0; calm < 20 && f < 540; f++) { T.tick(v, 3); calm = T.still(v) ? calm + 1 : 0; }
    if (T.off(v)) off++;
  }
  if (!off) fail(`level ${lv + 1}: no shot knocks him off`);
}
console.log(fails ? `${fails} failures` : 'ok: 300 fleets and games, his cannon aim, 5 towers');
process.exit(fails ? 1 : 0);

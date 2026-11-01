// Checks the logic of Sea Battle, Cannon Duel and Topple the Examiner (bio/bio-arcade.js):
//   Sea Battle  every fleet has its five ships (3, 3, 2, 2, 1) on the 7x7 sea, in straight lines, not touching; a sunk
//               ship's surrounding water is marked clear; his aim never fires at the same square (or clear water)
//               twice, sinks a whole fleet, and follows up a hit next to it. A whole game (two shells a right answer,
//               two right answers a turn) for a player right 7 in 10 against him at 6 in 10 takes about 11 rounds.
//   Cannon      aimed at you, he lands near you through any wind and over any hills; after a right answer (he only
//               fires then) he aims on you about half the time, close three in ten and wide two in ten; shells dig
//               craters.
//   Tower       every level's tower stands on its own (he doesn't move in six seconds); a pull is only ever backwards;
//               a single paper ball never knocks him off level 1, some textbook shot does on every level, and each
//               level takes a steady player more shots than the one before.
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
const S = T.SEA, N = S * S;
for (let g = 0; g < 300; g++) {
  const rand = seeded(g + 1), sea = T.place(rand), lens = sea.ships.map(s => s.cells.length).join();
  if (lens !== '3,3,2,2,1' || S !== 7) fail(`fleet ${g}: ships ${lens} on ${S}x${S}`);
  const all = sea.ships.flatMap(s => s.cells);
  if (all.some(x => x < 0 || x >= N) || new Set(all).size !== all.length) fail(`fleet ${g}: a ship off the sea or two on one square`);
  sea.ships.forEach((s, i) => {
    const r = s.cells.map(x => Math.floor(x / S)), c = s.cells.map(x => x % S);
    const line = r.every(v => v === r[0]) && c.every((v, k) => v === c[0] + k) || c.every(v => v === c[0]) && r.every((v, k) => v === r[0] + k);
    if (!line) fail(`fleet ${g}: ship ${i} isn't in a straight line`);
    s.cells.forEach(x => {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = Math.floor(x / S) + dr, cc = x % S + dc, n = rr * S + cc;
        if (rr >= 0 && rr < S && cc >= 0 && cc < S && sea.at[n] && sea.at[n] !== i + 1) fail(`fleet ${g}: ships ${i} and ${sea.at[n] - 1} touch`);
      }
    });
  });
  // His whole game against it: no square twice and never clear water, every ship sunk, the water round each sunk ship
  // marked clear, and after a hit on a ship still afloat his next shot is beside one of its hits.
  let shots = 0, lastHit = null;
  while (T.afloat(sea) && shots < N) {
    const x = T.aim(sea, rand);
    if (sea.shot[x] || sea.clear[x]) { fail(`game ${g}: fired at ${x} again (or at clear water)`); break; }
    if (lastHit !== null) {
      const hurt = sea.ships.find(s => s.hits && s.hits < s.cells.length);
      const beside = hurt && hurt.cells.filter(c => sea.shot[c]).some(h => Math.abs(h - x) === S || Math.abs(h - x) === 1 && Math.floor(h / S) === Math.floor(x / S));
      if (hurt && !beside) fail(`game ${g}: after a hit he fired away from it`);
    }
    const r = T.fire(sea, x);
    if (r === 'sunk') {
      const ship = sea.ships[sea.at[x] - 1];
      ship.cells.forEach(c => {
        const rr = Math.floor(c / S), cc = c % S;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const n = (rr + dr) * S + cc + dc;
          if (rr + dr >= 0 && rr + dr < S && cc + dc >= 0 && cc + dc < S && !sea.at[n] && !sea.shot[n] && !sea.clear[n]) fail(`game ${g}: water by a sunk ship isn't clear`);
        }
      });
    }
    lastHit = r === 'hit' ? x : null;
    shots++;
  }
  if (T.afloat(sea)) fail(`game ${g}: ships left after ${shots} shots`);
}
{
  // Whole games by the rules: a right answer fires two shells, two right answers a turn, a wrong one ends it; both
  // sides aim his way. The audit found the old 8x8 game took about 32 rounds; it should be 9 to 13 now, and the better
  // player should usually win.
  const rand = seeded(4242), rounds = [], cards = [];
  let wins = 0;
  for (let g = 0; g < 1500; g++) {
    const mine = T.place(rand), his = T.place(rand);
    let r = 0, c = 0, done = null;
    while (!done) {
      r++;
      for (const [me, sea, odds] of [[0, his, 0.7], [1, mine, 0.6]]) {
        for (let k = 0; k < T.ANSWERS && !done; k++) {
          c++;
          if (rand() >= odds) break;
          for (let s = 0; s < T.SALVO && !done; s++) { T.fire(sea, T.aim(sea, rand)); if (!T.afloat(sea)) done = me ? 'him' : 'you'; }
        }
        if (done) break;
      }
    }
    rounds.push(r);
    cards.push(c);
    if (done === 'you') wins++;
  }
  rounds.sort((a, b) => a - b);
  cards.sort((a, b) => a - b);
  const med = rounds[rounds.length >> 1];
  if (med < 9 || med > 13) fail(`a game takes ${med} rounds (median)`);
  if (wins / 1500 < 0.6) fail(`a player right 7 in 10 wins only ${Math.round(wins / 15)}% of games`);
  console.log(`   sea: median ${med} rounds, ${cards[cards.length >> 1]} question cards, you win ${Math.round(wins / 15)}%`);
}

// ---------------------------------------------------------------- Cannon Duel
// Aimed at you he lands within 30px at least 9 times in 10.
let near = 0, tried = 0;
for (let g = 0; g < 24; g++) {
  const rand = seeded(1000 + g), h = T.hills(rand), tanks = T.POS.map(x => ({ x, y: h[x], hp: 100 })), wind = (rand() * 2 - 1) * 70;
  const s = T.solve(h, tanks, wind, 0), m = T.muzzle(tanks[1], s.angle);
  const f = T.flight(h, tanks, m.x, m.y, s.angle, s.power, wind);
  tried++;
  if (f.direct === 0 || !f.out && Math.abs(f.x - tanks[0].x) < 30) near++;
}
if (near < tried * 0.9) fail(`his aim landed near you ${near} of ${tried} times`);
{
  // Where he aims after a right answer: on you (within 12px) about half the time, never more than 200px off.
  const rand = seeded(55), offs = Array.from({ length: 2000 }, () => T.hisOffset(rand)), on = offs.filter(o => Math.abs(o) <= 12).length / offs.length;
  if (on < 0.42 || on > 0.58 || offs.some(o => Math.abs(o) > 200)) fail(`his aim after a right answer is on you ${Math.round(on * 100)}% of the time`);
}
{
  const h = T.hills(seeded(7)), tanks = T.POS.map(x => ({ x, y: h[x], hp: 100 })), before = h[500];
  const hurt = T.burst(h, tanks, { x: 500, y: before }, false);
  if (!(h[500] > before + 20)) fail('a shell on the hill dug no crater');
  if (hurt.some(d => d)) fail('a shell in the middle hurt a cannon');
  const hit = T.burst(h, tanks, { x: tanks[0].x, y: tanks[0].y - 10, direct: 0 }, false);
  if (hit[0] !== 40 || tanks[0].hp !== 60) fail(`a direct hit did ${hit[0]}`);
}

// ---------------------------------------------------------------- Topple the Examiner
const GROUND = 470;
function fresh(lv) { const v = T.world(lv); T.tick(v, 240); v.startY = v.him.position.y; return v; }
// One shot from the slingshot, played until everything's still; the shot is then cleared away, as in the game.
function shoot(v, heavy, px, py) {
  const b = T.shotBody(T.SLING.x + px, T.SLING.y + py, heavy);
  M.Composite.add(v.eng.world, b);
  M.Body.setVelocity(b, { x: -px * T.LAUNCH, y: -py * T.LAUNCH });
  for (let f = 0, calm = 0; calm < 20 && f < 540; f++) { T.tick(v, 3); calm = T.still(v) ? calm + 1 : 0; }
  M.Composite.remove(v.eng.world, b);
  return T.off(v);
}
// Does a pull's flight cross the top half of the tower (where he sits), as a player aims?
function aimed(lv, px, py) {
  const t = T.tower(lv), tw = t.blocks.filter(b => b[0] > 640), x0 = Math.min(...tw.map(b => b[0] - b[2] / 2)) - 10, x1 = Math.max(...tw.map(b => b[0] + b[2] / 2));
  const y0 = t.top - 50, y1 = t.top + (GROUND - t.top) / 2, eng = M.Engine.create(), b = T.shotBody(T.SLING.x + px, T.SLING.y + py, false);
  M.Composite.add(eng.world, b);
  M.Body.setVelocity(b, { x: -px * T.LAUNCH, y: -py * T.LAUNCH });
  for (let i = 0; i < 900; i++) {
    T.tick({ eng }, 1);
    const p = b.position;
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) return true;
    if (p.y > GROUND + 50 || p.x > x1 + 50) return false;
  }
  return false;
}
{
  // A pull only ever goes backwards (the shot forwards), never past the full pull.
  for (const [x, y] of [[50, 0], [80, 40], [30, -60], [-200, 10], [-60, -90], [0, 120], [-1, 1]]) {
    const p = T.clampPull(x, y);
    if (p.x > 0 || Math.hypot(p.x, p.y) > T.PULL + 1e-6) fail(`a pull of ${x},${y} became ${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
}
const pulls = [];
for (let deg = -10; deg <= 65; deg += 5) for (let pull = 40; pull <= 110; pull += 10) pulls.push([-pull * Math.cos(deg * Math.PI / 180), pull * Math.sin(deg * Math.PI / 180)]);
const means = [];
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
    if (shoot(fresh(lv), true, -pull * Math.cos(deg * Math.PI / 180), pull * Math.sin(deg * Math.PI / 180))) off++;
  }
  if (!off) fail(`level ${lv + 1}: no shot knocks him off`);
  // A steady player: pulls that reach the top half of the tower, a little off each time, a textbook every third shot;
  // how many shots to knock him off (11 if not in 10).
  const ok = pulls.filter(p => aimed(lv, p[0], p[1])), rand = seeded(lv * 7 + 3);
  let sum = 0;
  for (let g = 0; g < 50; g++) {
    const v = fresh(lv);
    let n = 0;
    while (n < 10) { n++; const [px, py] = ok[Math.floor(rand() * ok.length)]; if (shoot(v, n % 3 === 0, px + (rand() - 0.5) * 8, py + (rand() - 0.5) * 8)) break; }
    sum += T.off(v) ? n : 11;
  }
  means.push(sum / 50);
}
// Level 1 takes a few shots (the user found it fell to the first full-power paper ball): hard paper balls straight off
// the slingshot rarely knock him off.
{
  let tried = 0, off = 0;
  for (let deg = -10; deg <= 60; deg += 2) for (const pull of [100, 110]) { tried++; if (shoot(fresh(0), false, -pull * Math.cos(deg * Math.PI / 180), pull * Math.sin(deg * Math.PI / 180))) off++; }
  if (off > tried * 0.12) fail(`level 1: ${off} of ${tried} hard paper balls knock him off in one`);
}
// Each level a little harder than the one before; level 1 doable in a few shots.
if (means[0] > 4.5) fail(`level 1 takes ${means[0].toFixed(1)} shots on average`);
means.forEach((m, i) => { if (i && m < means[i - 1] - 0.5) fail(`level ${i + 1} (${m.toFixed(1)} shots) is easier than level ${i} (${means[i - 1].toFixed(1)})`); });
if (means[4] < means[0] + 1.5) fail(`level 5 (${means[4].toFixed(1)}) isn't much harder than level 1 (${means[0].toFixed(1)})`);
console.log(`   tower: a steady player's shots per level ${means.map(m => m.toFixed(1)).join(', ')}`);
console.log(fails ? `${fails} failures` : 'ok: 300 fleets and games, whole games, his cannon aim (on you, and his spread after a right answer), 5 towers and their order');
process.exit(fails ? 1 : 0);

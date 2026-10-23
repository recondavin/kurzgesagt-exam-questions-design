// Checks Pool's physics, rules and his shots (bio/bio-pool.js):
//   rack      nine balls in a diamond on the foot spot, the black in the middle, none touching, the cue ball on its spot;
//   same      the physics is deterministic: the same shot plays the same way every time, and nothing in it is random;
//   table     no ball ever leaves the table except into a pocket, balls never end up inside each other, and every shot
//             (breaks included) comes to rest;
//   pots      a straight shot along the ghost-ball line pots the ball, and the guide shows it going into that pocket;
//   rules     potting yours goes again, a miss passes, the cue ball in is a foul, the black wins only after all yours;
//   search    when a straight pot is on, his search finds one that drops, and with his wobble it still mostly drops;
//   quiet     his shot for when nothing else is safe never pots a ball (his or yours, the black or the cue ball).
// Run: node tools/bio/tests/pool.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {} };
window.BioBoard = { pools() {}, nearMascot() {}, reveal() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
require('../../../bio/bio-pool.js');
const T = window.BioPool.test, { L, W, R, N, BLACK } = T;
let fails = 0;
const fail = msg => { fails++; if (fails < 40) console.log('   FAIL', msg); };
const seeded = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const t0 = Date.now();
const nearPocket = (x, y, d) => T.POCKETS.some(p => Math.hypot(x - p[0], y - p[1]) < d);

// A random table: the cue ball and some of the other balls (the black always) scattered, none touching.
function layout(rand, keep = 0.75) {
  const p = [], on = [];
  for (let b = 0; b < N; b++) {
    on.push(b === 0 || b === BLACK || rand() < keep);
    for (let t = 0; ; t++) {
      const x = (rand() * 2 - 1) * (L - R - 0.05), y = (rand() * 2 - 1) * (W - R - 0.05);
      if (p.every((q, k) => !on[k] || Math.hypot(q[0] - x, q[1] - y) > 2 * R + 0.05) && !nearPocket(x, y, 0.9)) { p.push([x, y]); break; }
    }
  }
  return { p, on };
}
// Every frame of a shot on the table (or at a pocket's mouth on its way in); none inside another at the end.
function checkShot(st, r, label) {
  const F = r.frames, potAt = {};
  r.pots.forEach(p => { potAt[p.b] = p.i; });
  for (let s = 0; s <= r.steps; s++) {
    for (let b = 0; b < N; b++) {
      if (!st.on[b] || (potAt[b] != null && s >= potAt[b])) continue;
      const x = F[s * N * 2 + b * 2], y = F[s * N * 2 + b * 2 + 1];
      if (Math.abs(x) > L + 1e-9 || Math.abs(y) > W + 1e-9 || (!nearPocket(x, y, 1.6) && (Math.abs(x) > L - R + 0.02 || Math.abs(y) > W - R + 0.02))) {
        fail(`${label}: ball ${b} off the table at (${x.toFixed(2)}, ${y.toFixed(2)}) on step ${s}`);
        return;
      }
    }
  }
  const e = r.end;
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) {
    if (e.on[a] && e.on[b] && Math.hypot(e.p[a][0] - e.p[b][0], e.p[a][1] - e.p[b][1]) < 2 * R - 0.01) fail(`${label}: balls ${a} and ${b} end up inside each other`);
  }
  if (r.steps >= 20 * 120) fail(`${label}: the balls were still moving after 20 seconds`);
}

// ---------------------------------------------------------------- rack
for (let g = 0; g < 50; g++) {
  const st = T.rack(seeded(g + 1));
  if (st.p.length !== N || st.on.some(o => !o)) fail('the rack is missing balls');
  if (st.p[0][0] !== -5 || st.p[0][1] !== 0) fail('the cue ball is not on its spot');
  if (Math.abs(st.p[BLACK][0] - (5 + 2 * (2 * R * 0.866 + 0.004))) > 1e-9 || Math.abs(st.p[BLACK][1]) > 1e-9) fail('the black is not in the middle of the rack');
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) if (Math.hypot(st.p[a][0] - st.p[b][0], st.p[a][1] - st.p[b][1]) < 2 * R) fail(`rack ${g}: balls ${a} and ${b} overlap`);
}

// ---------------------------------------------------------------- same
{
  const real = Math.random;
  Math.random = () => { throw new Error('the physics or his search used Math.random'); };
  try {
    for (let g = 0; g < 8; g++) {
      const st = g < 4 ? T.rack(seeded(g + 9)) : layout(seeded(g + 9)), a = g * 0.7 - 0.2, p = 0.3 + g * 0.08;
      const r1 = T.shoot(st, a, p, true), r2 = T.shoot(st, a, p, true);
      if (r1.frames.length !== r2.frames.length || r1.frames.some((v, i) => v !== r2.frames[i]) || r1.potted.join() !== r2.potted.join()) fail(`shot ${g} played two ways`);
      const s1 = T.plan(st, 1), s2 = T.plan(st, 1);
      if (JSON.stringify(s1) !== JSON.stringify(s2)) fail(`his search found two different shots on table ${g}`);
      const q1 = T.quiet(st, 1, seeded(3)), q2 = T.quiet(st, 1, seeded(3));
      if (q1.angle !== q2.angle || q1.power !== q2.power) fail(`his miss came out two ways on table ${g}`);
    }
  } catch (err) { fail(err.message); }
  Math.random = real;
}

// ---------------------------------------------------------------- table: breaks and random shots
let shots = 0;
for (let g = 0; g < 40; g++) {
  const rand = seeded(100 + g), st = T.rack(rand), r = T.shoot(st, (rand() - 0.5) * 0.06, 0.7 + rand() * 0.3, true);
  shots++;
  checkShot(st, r, `break ${g}`);
  let s2 = r.end;
  if (!s2.on[0]) s2 = T.respot(T.copy(s2));
  for (let k = 0; k < 4; k++) {
    const r2 = T.shoot(s2, rand() * Math.PI * 2, 0.1 + rand() * 0.9, true);
    shots++;
    checkShot(s2, r2, `break ${g} shot ${k}`);
    s2 = r2.end.on[0] ? r2.end : T.respot(T.copy(r2.end));
    if (!s2.on.slice(1).some(Boolean)) break;
  }
}
for (let g = 0; g < 120; g++) {
  const rand = seeded(300 + g), st = layout(rand), r = T.shoot(st, rand() * Math.PI * 2, rand(), true);
  shots++;
  checkShot(st, r, `table ${g}`);
}
{
  // The cue ball respotted after a foul: on the table and clear of every ball.
  const rand = seeded(5);
  for (let g = 0; g < 60; g++) {
    const st = layout(rand);
    st.on[0] = false;
    const s = T.respot(T.copy(st)), c = s.p[0];
    if (!s.on[0] || Math.abs(c[0]) > L - R || Math.abs(c[1]) > W - R || s.p.some((q, b) => b && s.on[b] && Math.hypot(q[0] - c[0], q[1] - c[1]) < 2 * R)) fail(`respot ${g}: the cue ball isn't clear on the table`);
  }
}

// ---------------------------------------------------------------- pots and the guide
// A ball 3 from each pocket on the line to it, the cue ball 4 further back: shot along the ghost-ball line, it drops.
T.POCKETS.forEach((pk, k) => {
  const m = T.mouth(k), cx = (k === 1 || k === 4) ? 0 : pk[0] * 0.6, cy = (k === 1 || k === 4) ? pk[1] * 0.2 : pk[1] * 0.3;
  const ux = m[0] - cx, uy = m[1] - cy, d = Math.hypot(ux, uy), bx = m[0] - ux / d * 3, by = m[1] - uy / d * 3;
  const st = { p: Array.from({ length: N }, (_, b) => [-50 + b, -50]), on: Array.from({ length: N }, (_, b) => b === 0 || b === 5) };
  st.p[5] = [bx, by];
  st.p[0] = [bx - ux / d * 4, by - uy / d * 4];
  const c = T.potLines(st, 1).filter(l => l.k === k)[0];
  if (!c) { fail(`pocket ${k}: no straight line found`); return; }
  const r = T.shoot(st, c.angle, 0.5, true), g = T.guide(r);
  if (r.potted.indexOf(5) < 0) fail(`pocket ${k}: the straight shot didn't pot the ball`);
  if (g.pocket !== k) fail(`pocket ${k}: the guide shows pocket ${g.pocket}`);
  if (!g.ghost || Math.hypot(g.ghost[0] - (bx - ux / d * 2 * R), g.ghost[1] - (by - uy / d * 2 * R)) > 0.15) fail(`pocket ${k}: the ghost ball isn't where the cue ball meets the ball`);
});

// ---------------------------------------------------------------- rules
{
  const st = T.rack(seeded(1)), cleared = T.copy(st);
  [1, 2, 3, 4].forEach(b => { cleared.on[b] = false; });
  const res = (potted, scratch) => ({ potted, scratch: Boolean(scratch) });
  const cases = [[st, res([1]), 0, 'again'], [st, res([5]), 0, 'pass'], [st, res([]), 0, 'pass'], [st, res([2], true), 0, 'foul'], [st, res([BLACK]), 0, 'lose'],
    [cleared, res([BLACK]), 0, 'win'], [cleared, res([BLACK], true), 0, 'lose'], [st, res([6]), 1, 'again'], [st, res([3, 0], true), 1, 'foul'], [cleared, res([BLACK]), 1, 'lose']];
  cases.forEach(([s, r, who, want], i) => { const got = T.judge(s, r, who); if (got !== want) fail(`rule ${i}: ${got}, should be ${want}`); });
  if (T.targets(cleared, 0).join() !== String(BLACK)) fail('with all yours potted you should be on the black');
}

// ---------------------------------------------------------------- search and misses
let tables = 0, found = 0, sunk = 0, wobbled = 0, misses = 0;
for (let g = 0; g < 2000 && tables < 80; g++) {
  const rand = seeded(700 + g), st = layout(rand);
  // Easy: a straight-ish pot, not long, with the ball and the cue ball clear of the cushions.
  const off = q => Math.abs(q[0]) < L - 0.6 && Math.abs(q[1]) < W - 0.6;
  const lines = T.potLines(st, 1).filter(l => l.cut > 0.7 && l.dc + l.d < 14 && off(st.p[l.b]) && off(st.p[0]));
  if (!lines.length) continue;
  tables++;
  const s = T.plan(st, 1);
  if (s) {
    found++;
    const v = T.judge(st, T.shoot(st, s.angle, s.power, false), 1);
    if (v === 'again' || v === 'win') sunk++;
  }
  const h = T.hisAim(st, 1, rand), v2 = T.judge(st, T.shoot(st, h.angle, h.power, false), 1);
  if (v2 === 'again' || v2 === 'win') wobbled++;
}
if (found < tables * 0.9 || sunk < found) fail(`with an easy pot on, his search found a shot that drops on ${sunk} of ${tables} tables`);
if (wobbled < tables * 0.6) fail(`with his wobble he potted on only ${wobbled} of ${tables} easy tables`);
for (let g = 0; g < 260; g++) {
  const rand = seeded(2000 + g), st = g % 2 ? layout(rand) : T.rack(rand);
  if (g % 4 === 3) {
    // Balls sitting in the jaws of pockets.
    [1, 5, 6, BLACK].forEach((b, i) => { const p = T.POCKETS[(g + i) % 6]; st.p[b] = [p[0] * 0.93, p[1] * 0.88]; });
    if ([1, 5, 6, BLACK].some((a, i, l) => l.some(b => b !== a && Math.hypot(st.p[a][0] - st.p[b][0], st.p[a][1] - st.p[b][1]) < 2 * R + 0.02)) || st.p.some((q, b) => b && Math.hypot(q[0] - st.p[0][0], q[1] - st.p[0][1]) < 2 * R + 0.02)) continue;
  }
  const s = T.quiet(st, 1, rand), r = T.shoot(st, s.angle, s.power, false);
  misses++;
  if (r.potted.length) fail(`table ${g}: his quiet shot potted ${r.potted.join(', ')}`);
}

console.log(fails ? `${fails} failures` : `ok: racks, ${shots} shots on the table and deterministic, straight pots and the guide, the rules, his search potted on ${sunk}/${tables} easy tables (${wobbled} with his wobble), ${misses} quiet shots potted nothing (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(fails ? 1 : 0);

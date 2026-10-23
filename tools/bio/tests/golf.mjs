// Checks Mini Golf's ball physics and his putts (bio/bio-golf.js):
//   par       every hole can be sunk within par + 2 by a searched aim (the same search he uses), from the tee;
//   course    the ball never leaves the course (or sinks into a wall) in a spread of putts from all over each hole;
//   same      the physics is deterministic: the same putt rolls the same way every time, and nothing in it is random;
//   valves    the heart's valves let the ball through forwards and bounce it back the other way;
//   turns     a wrong answer ends a turn and two right ones in a row do too; a player who's in is skipped;
//   his putt  after a right answer, the search's putt with no more than his wobble.
// Run: node tools/bio/tests/golf.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {} };
window.BioBoard = { pools() {}, nearMascot() {}, reveal() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
require('../../../bio/bio-golf.js');
const T = window.BioGolf.test;
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const seeded = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const t0 = Date.now();
const holes = T.HOLES.map(h => T.prep(h));

// ---------------------------------------------------------------- par: searched aims sink every hole within par + 2
const starts = holes.map(() => []);
holes.forEach((h, n) => {
  let at = h.tee.slice(), clock = 0, strokes = 0, sunk = false;
  const log = [];
  while (!sunk && strokes < h.par + 2) {
    const s = T.solve(h, at, clock), r = T.roll(h, at, s.angle, s.power, clock, false);
    strokes++;
    starts[n].push(at);
    log.push(`(${at.map(v => v.toFixed(1))}) -> ${r.sunk ? 'in' : `(${r.end.map(v => v.toFixed(1))})`}`);
    sunk = r.sunk;
    at = r.end;
    clock = r.clock;
  }
  console.log(`   hole ${n + 1} (par ${h.par}): ${sunk ? `in ${strokes}` : 'not in'}  ${log.join('  ')}`);
  if (!sunk) fail(`hole ${n + 1}: not sunk within par + 2`);
});

// ---------------------------------------------------------------- course: the ball stays on the green
// Starting points: the tee, the searched putts' stops, and a scatter of points on each green.
holes.forEach((h, n) => {
  const rand = seeded(50 + n), b = h.box;
  while (starts[n].length < 14) {
    const x = b[0] + rand() * (b[2] - b[0]), y = b[1] + rand() * (b[3] - b[1]);
    if (T.inPoly(h.outline, x, y) && T.gap(h, x, y) > T.R + 0.05) starts[n].push([x, y]);
  }
  let worst = Infinity, out = 0, shots = 0;
  starts[n].forEach(from => {
    for (let k = 0; k < 36; k++) {
      const r = T.roll(h, from, rand() * Math.PI * 2, 0.05 + rand() * 0.95, rand() * 20, true);
      shots++;
      for (let i = 0; i < r.path.length; i += 2) {
        const x = r.path[i], y = r.path[i + 1], g = T.gap(h, x, y);
        if (!T.inPoly(h.outline, x, y)) { out++; break; }
        worst = Math.min(worst, g);
      }
    }
  });
  if (out) fail(`hole ${n + 1}: the ball left the course in ${out} of ${shots} putts`);
  if (worst < T.R - 0.02) fail(`hole ${n + 1}: the ball went ${(T.R - worst).toFixed(3)} into a wall`);
});

// ---------------------------------------------------------------- same: deterministic
{
  const real = Math.random;
  Math.random = () => { throw new Error('the physics used Math.random'); };
  try {
    holes.forEach((h, n) => {
      for (let k = 0; k < 6; k++) {
        const a = k * 1.1 + 0.3, p = 0.2 + k * 0.13, c = k * 2.7;
        const r1 = T.roll(h, h.tee, a, p, c, true), r2 = T.roll(h, h.tee, a, p, c, true);
        if (r1.path.length !== r2.path.length || r1.path.some((v, i) => v !== r2.path[i]) || r1.sunk !== r2.sunk || r1.clock !== r2.clock) fail(`hole ${n + 1}: putt ${k} rolled two ways`);
      }
      const s1 = T.solve(h, h.tee, 0), s2 = T.solve(h, h.tee, 0);
      if (s1.angle !== s2.angle || s1.power !== s2.power) fail(`hole ${n + 1}: the search found two different putts`);
    });
  } catch (err) { fail(err.message); }
  Math.random = real;
}

// ---------------------------------------------------------------- valves: one way only
{
  const h = holes[3], down = T.roll(h, [-3.25, 9.5], -Math.PI / 2, 0.2, 0, false), up = T.roll(h, [-3.25, 5.5], Math.PI / 2, 0.2, 0, false);
  if (!(down.end[1] < 7.4)) fail(`a putt down through the first valve stopped at y ${down.end[1].toFixed(2)} (should be through, below 7.4)`);
  if (!(up.end[1] < 7.4)) fail(`a putt up into the first valve got through to y ${up.end[1].toFixed(2)}`);
  const out = T.roll(h, [3.25, 5.5], Math.PI / 2, 0.2, 0, false), back = T.roll(h, [3.25, 9.8], -Math.PI / 2, 0.2, 0, false);
  if (!(out.end[1] > 8)) fail(`a putt up through the second valve stopped at y ${out.end[1].toFixed(2)}`);
  if (!(back.end[1] > 8)) fail(`a putt back down the second valve got through to y ${back.end[1].toFixed(2)}`);
}

// ---------------------------------------------------------------- turns: wrong ends a turn, two right and it's capped
const G = (who, shots) => ({ who, shots });
[
  [G(0, 0), true, [false, false], G(0, 1), 'a right answer gives another go'],
  [G(0, 1), true, [false, false], G(1, 0), 'two right and it is his turn'],
  [G(0, 0), false, [false, false], G(1, 0), 'a wrong answer ends your turn'],
  [G(0, 1), false, [false, false], G(1, 0), 'a wrong second answer ends your turn'],
  [G(1, 0), true, [false, false], G(1, 1), 'his right answer gives him another go'],
  [G(1, 1), true, [false, false], G(0, 0), 'his two right and it is your turn'],
  [G(1, 0), false, [false, false], G(0, 0), 'his wrong answer ends his turn'],
  [G(0, 0), true, [true, false], G(1, 0), 'once you are in it is his turn'],
  [G(1, 1), true, [true, false], G(1, 0), 'with you in, he carries on'],
  [G(1, 0), false, [true, false], G(1, 0), 'with you in, a wrong answer still leaves it his go'],
  [G(0, 1), true, [false, true], G(0, 0), 'with him in, you carry on'],
  [G(0, 0), true, [true, true], null, 'both in: the hole is done']
].forEach(([turn, right, holed, want, what]) => {
  const got = T.nextGo(turn, right, holed);
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`turns: ${what} (got ${JSON.stringify(got)})`);
});
// His putt after a right answer is the search's, off by no more than his wobble (2 degrees, 7% power).
holes.forEach((h, n) => {
  const rand = seeded(400 + n), s = T.solve(h, h.tee, 0), a = T.hisAim(h, h.tee, 0, rand);
  if (Math.abs(a.angle - s.angle) > 0.0351 || Math.abs(a.power / s.power - 1) > 0.0701) fail(`hole ${n + 1}: his putt is further off the search's than his wobble`);
});

console.log(fails ? `${fails} failures` : `ok: 5 holes sunk within par + 2, the ball stays on the course, the same putt rolls the same way, valves are one way, turns (wrong ends a turn, two right and it's capped), his putts (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(fails ? 1 : 0);

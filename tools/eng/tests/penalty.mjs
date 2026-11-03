// The penalty shootout (eng/eng-penalty.js) is challenging but possible (the user's words): its rules, and how often
// goals go in when you answer right or wrong, for a steady player, simulated.
// Run: node tools/eng/tests/penalty.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const box = { console, document: { addEventListener() {} }, performance: { now: () => 0 } };
box.window = box; box.ExamAnswerMode = { kit: { esc: s => s } };
vm.createContext(box);
vm.runInContext(fs.readFileSync(new URL('../../../eng/eng-penalty.js', import.meta.url), 'utf8'), box);
const T = box.PenaltyShootout.test, fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
// The rules.
ok(T.outcome(300, 380, 'L') === 'save' && T.outcome(300, 380, 'R') === 'goal', 'a keeper on the right side saves a low shot, the wrong side doesn\'t');
ok(T.outcome(290, 200, 'L') === 'goal', 'a top corner beats a keeper who guesses right');
ok(T.outcome(230, 300, 'C') === 'wide' && T.outcome(500, 140, 'C') === 'over' && T.outcome(256, 300, 'C') === 'post' && T.outcome(500, 164, 'L') === 'post', 'wide, over and the woodwork');
// A steady player aims at a corner; where the marker stops is off by an amount that grows with its speed (a person
// stops a moving marker within about 60ms: 60ms of the sweep).
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
function myKick(right) {
  const period = right ? 2.6 : 1.25, sx = (T.AIM.x[1] - T.AIM.x[0]) * 2 / period * 0.06, sy = (T.AIM.y[0] - T.AIM.y[1]) * 2 / period * 0.06;
  const corner = rnd() < 0.5, side = rnd() < 0.5 ? -1 : 1;
  const tx = 500 + side * (corner ? 205 : 180), ty = corner ? 205 : 370;
  const x = tx + gauss() * sx, y = ty + gauss() * sy, bz = T.zoneOf(x);
  const kz = !right && rnd() < 0.67 ? bz : ['L', 'C', 'R'][Math.floor(rnd() * 3)];
  return T.outcome(x, y, kz) === 'goal';
}
function hisKick(right) {
  const tz = ['L', 'C', 'R'][Math.floor(rnd() * 3)], top = tz !== 'C' && rnd() < 0.25, on = rnd() < 0.9;
  let x = tz === 'L' ? (top ? 292 : 300 + rnd() * 100) : tz === 'R' ? (top ? 708 : 600 + rnd() * 100) : 440 + rnd() * 120, y = top ? 196 : 250 + rnd() * 150;
  if (!on) x = 228;
  const tell = right ? (rnd() < 0.67 ? tz : ['L', 'C', 'R'].filter(z => z !== tz)[Math.floor(rnd() * 2)]) : null;
  const kz = tell || ['L', 'C', 'R'][Math.floor(rnd() * 3)];
  return T.outcome(x, y, kz) === 'goal';
}
const rate = (f, right) => { let n = 0; for (let i = 0; i < 20000; i++) if (f(right)) n++; return n / 20000; };
const mine = [rate(myKick, true), rate(myKick, false)], his = [rate(hisKick, true), rate(hisKick, false)];
ok(mine[0] > 0.6 && mine[0] < 0.9, `your kicks after a right answer go in ${Math.round(mine[0] * 100)}% (60-90)`);
ok(mine[1] > 0.25 && mine[1] < 0.6, `your kicks after a wrong answer go in ${Math.round(mine[1] * 100)}% (25-60)`);
ok(his[0] > 0.3 && his[0] < 0.6, `his kicks when you answered right go in ${Math.round(his[0] * 100)}% (30-60)`);
ok(his[1] > 0.55 && his[1] < 0.85, `his kicks when you answered wrong go in ${Math.round(his[1] * 100)}% (55-85)`);
// Whole shootouts: answering right 80% of the time should win more often than not, 40% should mostly lose.
function shootout(p) {
  const you = [], him = [];
  for (let r = 0; r < 30; r++) {
    you.push(myKick(rnd() < p)); him.push(hisKick(rnd() < p));
    const y = you.filter(Boolean).length, h = him.filter(Boolean).length;
    if (r >= 4 && y !== h) return y > h;
  }
  return false;
}
const wins = p => { let n = 0; for (let i = 0; i < 4000; i++) if (shootout(p)) n++; return n / 4000; };
const w8 = wins(0.8), w4 = wins(0.4);
ok(w8 > 0.55 && w8 < 0.92, `knowing 80% of answers wins ${Math.round(w8 * 100)}% of shootouts (55-92)`);
ok(w4 < 0.5, `knowing 40% wins ${Math.round(w4 * 100)}% (under 50)`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log(`ok: you score ${Math.round(mine[0] * 100)}% / ${Math.round(mine[1] * 100)}% (right / wrong answer), he scores ${Math.round(his[0] * 100)}% / ${Math.round(his[1] * 100)}%; 80% right wins ${Math.round(w8 * 100)}% of shootouts, 40% right wins ${Math.round(w4 * 100)}%`);

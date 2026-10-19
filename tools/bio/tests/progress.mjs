// Checks the Progress model (bio/bio-progress.js): grade bands and CAO points, the predicted grade and its range, and
// the history replayed from the log. Run: node tools/bio/tests/progress.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
for (const n of [28, 29, 30, 31, 32]) require(`../../../bio/q${n}.js`);
require('../../../bio/bio-progress.js');
const P = window.BioProgress, Q = window.BioQuestions;
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const outOf = q => q.parts.reduce((s, p) => s + (p.m || p.n * 3), 0);
const chapters = [28, 29, 30, 31, 32].map(n => ({ n, weight: Q[n].questions.length, total: Q[n].questions.length, questions: Q[n].questions }));
// Every question at the same rate r: { "n/id": { got, out, tried } }.
const at = (r, pick = () => true) => {
  const s = {};
  chapters.forEach(c => c.questions.forEach((q, i) => { if (pick(c.n, i)) { const o = outOf(q); s[c.n + '/' + q.id] = { got: Math.round(o * r), out: o, tried: o }; } }));
  return s;
};

// 1. Grade bands and CAO points.
[[100, 'H1', 100], [90, 'H1', 100], [89, 'H2', 88], [80, 'H2', 88], [70, 'H3', 77], [65, 'H4', 66], [50, 'H5', 56], [40, 'H6', 46], [30, 'H7', 37], [29, 'H8', 0], [0, 'H8', 0]]
  .forEach(([pct, name, pts]) => { const g = P.gradeOf(pct); if (g.name !== name || g.points !== pts) fail(`${pct}% should be ${name} (${pts}), got ${g.name} (${g.points})`); });

// 2. No answers, no prediction.
if (P.predict(chapters, {}).pct !== null) fail('a prediction with no answers');

// 3. The grade is read from the percentage shown, and the range holds it.
for (const r of [0.2, 0.45, 0.62, 0.78, 0.95]) for (const share of [1, 0.3, 0.05]) {
  const p = P.predict(chapters, at(r, (n, i) => i < Math.max(1, Math.round(Q[n].questions.length * share))));
  if (p.grade.name !== P.gradeOf(p.pct).name) fail(`grade ${p.grade.name} doesn't match ${p.pct}%`);
  if (!(p.low <= p.pct && p.pct <= p.high)) fail(`range ${p.low}-${p.high} doesn't hold ${p.pct}`);
}

// 4. Lots of answers at one rate predict close to that rate; one answer is pulled towards the middle.
const all90 = P.predict(chapters, at(0.9));
if (Math.abs(all90.pct - 90) > 2) fail(`every question at 90% predicts ${all90.pct}%`);
if (all90.high - all90.low > 8) fail(`with every question answered the range is still ${all90.low}-${all90.high}`);
const one = P.predict(chapters, at(1, (n, i) => n === 28 && i === 0));
if (one.pct >= 90 || one.pct <= 50) fail(`one full-marks question predicts ${one.pct}%`);
if (one.high - one.low < 20) fail(`one question gives a narrow range ${one.low}-${one.high}`);
const untried = P.predict(chapters, at(0.8, n => n !== 32));
if (!(untried.untried > 0) || untried.rows.find(r => r.n === 32).tried) fail('an untried chapter is not counted as untried');

// 5. The history replays the log: one point per day, ending on today's prediction, and a worse later score on the
// same question doesn't lower it (the saved score is the best).
const q1 = Q[29].questions[0], q2 = Q[29].questions[1], o1 = outOf(q1), o2 = outOf(q2);
const log = [
  { d: '2026-10-01', n: 29, id: q1.id, got: Math.round(o1 * 0.4), tried: o1 },
  { d: '2026-10-03', n: 29, id: q1.id, got: o1, tried: o1 },
  { d: '2026-10-05', n: 29, id: q1.id, got: 0, tried: o1 },
  { d: '2026-10-05', n: 29, id: q2.id, got: Math.round(o2 * 0.5), tried: o2 }
];
const saved = { ['29/' + q1.id]: { got: o1, out: o1, tried: o1 }, ['29/' + q2.id]: { got: Math.round(o2 * 0.5), out: o2, tried: o2 } };
const h = P.history(chapters, saved, log), now = P.predict(chapters, saved);
if (h.length !== 3) fail(`history should have 3 days, has ${h.length}`);
if (h[1].pct <= h[0].pct) fail(`a better score on day 2 didn't raise the line (${h[0].pct} -> ${h[1].pct})`);
if (h[2].pct !== now.pct) fail(`the history ends at ${h[2].pct}% but the prediction is ${now.pct}%`);
// Scores saved before the log began count from the first day.
const h2 = P.history(chapters, { ['28/' + Q[28].questions[0].id]: { got: 10, out: 10, tried: 10 } }, []);
if (h2.length !== 1) fail('saved scores with no log give no point');

console.log(fails ? `${fails} failed` : 'all progress checks pass');
process.exit(fails ? 1 : 0);

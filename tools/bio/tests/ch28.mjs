// Checks chapter 28's own content against the Biology marker: practice-question keys, the Be the examiner
// lines and their fixes, and some wrong and right answers to real exam parts. Run: node tools/bio/tests/ch28.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: null };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
require('../../../bio/q28.js');
require('../../../bio/learn28.js');
require('../../../bio/bio.js');
const B = window.BioApp, L = window.BioLearn[28], Q = window.BioQuestions[28], verbose = process.argv[2];
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };

// 1. Every practice point is found in its own answer wording.
let pn = 0, pok = 0;
for (const q of L.practice) q.parts.forEach(p => p.pts.forEach(pt => {
  pn++;
  if (B.hasPoint(pt, B.words(pt.a))) pok++; else fail(`practice ${q.id}${p.l}: "${pt.a}" not found by its own keys`);
}));
console.log(`practice points found in their own wording: ${pok}/${pn}`);

// 2. Be the examiner: in order, each ok line earns a point the lines before haven't; other lines earn nothing new;
//    every fix earns a point the ok lines didn't.
const hits = (part, text, banked) => part.pts.map((pt, i) => (!banked.has(i) && pt.k && B.hasPoint(pt, B.words(text))) ? i : -1).filter(i => i >= 0);
let en = 0, eok = 0;
for (const item of L.examiner) {
  const q = Q.questions.find(x => x.id === item.q), part = q && q.parts[item.part];
  if (!part) { fail(`examiner ${item.q} part ${item.part}: no such part`); continue; }
  if (part.kind !== 'text' || part.pts.filter(pt => pt.k).length < 3) fail(`examiner ${item.q} part ${item.part}: needs a text part with 3+ keyed points`);
  const banked = new Set(), okBanked = new Set();
  const lines = item.lines;
  if (lines.filter(l => l.ok).length < 2 || !lines.some(l => !l.ok && /^Vague/.test(l.why)) || !lines.some(l => !l.ok && /^Wrong/.test(l.why))) fail(`examiner ${item.q}: wants 2+ ok lines, a vague line and a wrong line`);
  lines.forEach((l, k) => {
    en++;
    const h = hits(part, l.t, banked);
    if (l.ok) { if (h.length) { eok++; h.forEach(i => { banked.add(i); okBanked.add(i); }); } else fail(`examiner ${item.q} line ${k + 1} should earn: "${l.t}"`); }
    else if (h.length) fail(`examiner ${item.q} line ${k + 1} should earn nothing new but gets ${h.map(i => part.pts[i].a)}: "${l.t}"`);
    else eok++;
    if (verbose) console.log('     ', l.ok ? '//' : 'x ', l.t, h.length ? '-> ' + h.map(i => part.pts[i].a).join(' | ') : '');
  });
  lines.filter(l => !l.ok).forEach(l => {
    en++;
    if (!l.fix || !l.why) { fail(`examiner ${item.q}: a weak line needs why and fix: "${l.t}"`); return; }
    const h = hits(part, l.fix, okBanked);
    if (h.length) eok++; else fail(`examiner ${item.q} fix earns nothing new: "${l.fix}"`);
    if (verbose) console.log('      fix', l.fix, '->', h.map(i => part.pts[i].a).join(' | '));
  });
}
console.log(`examiner lines and fixes as intended: ${eok}/${en}`);

// 3. Wrong answers to real parts: [question, part index, typed answer, points that must NOT be given].
const WRONG = [
  ['2019-Q6', 0, 'The pulmonary vein', [0]],
  ['2007-Q13a', 0, 'the pulmonary artery', [0]],
  ['2014-Q12c', 0, 'the nucleus', [0]],
  ['2025-Q16b', 3, 'osmosis', [0]],
  ['2021-Q16d', 2, 'oxygen', [0]],
  ['2021-Q16d', 3, 'the cerebellum', [0]],
  ['2026-Q3', 0, 'the abdominal cavity', [0]],
];
let wok = 0;
for (const [id, k, text, idx] of WRONG) {
  const got = B.check(28, id, k, text), bad = idx.filter(i => got[i]);
  if (!bad.length) wok++; else fail(`wrong answer got marks: ${id} ${k} "${text}" ${bad}`);
}
console.log(`wrong answers kept out: ${wok}/${WRONG.length}`);
// Right answers in a student's own words.
const RIGHT = [
  ['2021-Q16d', 3, 'The medulla oblongata', [0]],
  ['2026-Q3', 2, 'They keep the trachea open', [0]],
  ['2025-Q16b', 5, 'The diaphragm moves up and the volume of the chest decreases.', [2, 3]],
  ['2025-Q16b', 4, 'the diaphragm and the intercostals', [0, 1]],
  ['2007-Q13c', 1, 'diffusion', [0]],
];
let rok = 0;
for (const [id, k, text, idx] of RIGHT) {
  const got = B.check(28, id, k, text), miss = idx.filter(i => !got[i]);
  if (!miss.length) rok++; else fail(`right answer missed: ${id} ${k} "${text}" ${miss}`);
}
console.log(`right answers found: ${rok}/${RIGHT.length}`);
process.exitCode = fails ? 1 : 0;

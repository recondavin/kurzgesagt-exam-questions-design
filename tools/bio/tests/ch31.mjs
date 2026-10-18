// Checks chapter 31's own content against the Biology marker: practice-question keys, Be the examiner lines,
// Build it anchors and some wrong answers to real parts. Run: node tools/bio/tests/ch31.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: null };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
// Every chapter's diagrams: some chapter 31 questions show another chapter's (the alveolus, the villus).
for (const n of [28, 29, 30, 31, 32]) require(`../../../bio/d${n}.js`);
require('../../../bio/q31.js');
require('../../../bio/learn31.js');
require('../../../bio/bio.js');
const B = window.BioApp, L = window.BioLearn[31], Q = window.BioQuestions[31], ART = window.BioArt, verbose = process.argv[2];
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const plain = a => a.replace(/^\*+/, '').replace(/^(?:[A-Z]|\d{1,2})\s*(?:[=:.)]|\s-)\s*/, '').replace(/\*/g, '');

// 1. Practice questions: every point is found in its own wording.
let n = 0, ok = 0;
for (const q of L.practice) q.parts.forEach(p => p.pts.forEach(pt => {
  n++;
  const words = B.words(plain(pt.a));
  if (B.hasPoint(pt, words)) ok++; else fail(`${q.id}${p.l}: own wording misses: ${pt.a}`);
}));
console.log(`practice points in their own wording: ${ok}/${n}`);

// 2. Be the examiner: in order, ok lines each earn a new point; other lines earn nothing new; every fix earns a point
// the ok lines did not.
let lines = 0, lok = 0;
for (const item of L.examiner) {
  const q = Q.questions.find(x => x.id === item.q);
  if (!q) { fail(`examiner: no question ${item.q}`); continue; }
  const part = q.parts[item.part];
  if (!part || part.kind !== 'text') { fail(`examiner: ${item.q} part ${item.part} is not a text part`); continue; }
  const keyed = part.pts.filter(pt => pt.k).length;
  if (keyed < 3) fail(`examiner: ${item.q} part ${item.part} has only ${keyed} keyed points`);
  const hits = t => part.pts.map((pt, i) => B.hasPoint(pt, B.words(t)) ? i : -1).filter(i => i >= 0);
  const banked = new Set(), byOk = new Set();
  item.lines.forEach(l => { if (l.ok) hits(l.t).forEach(i => byOk.add(i)); });
  item.lines.forEach((l, k) => {
    lines++;
    const fresh = hits(l.t).filter(i => !banked.has(i));
    fresh.forEach(i => banked.add(i));
    let good = l.ok ? fresh.length > 0 : fresh.length === 0;
    if (!good) fail(`examiner ${item.q} line ${k + 1} (${l.ok ? 'ok' : 'not ok'}) gets ${JSON.stringify(fresh)}: ${l.t}`);
    if (!l.ok) {
      if (!l.why || !l.fix) { good = false; fail(`examiner ${item.q} line ${k + 1} needs why and fix`); }
      else if (!hits(l.fix).some(i => !byOk.has(i))) { good = false; fail(`examiner ${item.q} line ${k + 1}: fix earns nothing new: ${l.fix}`); }
    }
    if (good) lok++;
  });
  const okLines = item.lines.filter(l => l.ok).length;
  if (okLines < 2 || okLines > 4) fail(`examiner ${item.q}: ${okLines} ok lines`);
}
console.log(`examiner lines behaving: ${lok}/${lines} (${L.examiner.length} answers)`);

// 3. Build it: every tap answer is an anchor on its diagram; every diagram has questions.
let taps = 0, tok = 0;
for (const [id, qs] of Object.entries(L.build)) {
  if (!ART[id]) { fail(`build: no diagram ${id}`); continue; }
  for (const x of qs) {
    taps++;
    if (x.tap) { const bad = x.tap.filter(a => !ART[id].anchors[a]); if (bad.length) fail(`build ${id}: unknown anchors ${bad}`); else tok++; }
    else if (x.opts && x.opts.length === 4 && x.a >= 0 && x.a < 4) tok++; else fail(`build ${id}: bad question ${x.q}`);
  }
}
for (const id of Object.keys(ART).filter(i => ART[i].chapter === 31)) if (!L.build[id]) fail(`build: no questions for ${id}`);
console.log(`build questions well formed: ${tok}/${taps}`);

// 4. Exam diagrams: tap answers and letters point at real anchors.
for (const q of Q.questions) {
  const d = q.dia;
  if (d && d.base) {
    if (!ART[d.base]) fail(`${q.id}: no base ${d.base}`);
    else (d.marks || []).forEach(m => { if (!ART[d.base].anchors[m.a]) fail(`${q.id}: no anchor ${m.a}`); });
    if (d.missing) fail(`${q.id}: letters with no anchor ${d.missing}`);
  }
  q.parts.forEach(p => { if (p.tap) p.tap.forEach(a => { if (!d || !ART[d.base] || !ART[d.base].anchors[a]) fail(`${q.id}${p.l}: tap anchor ${a}`); }); });
}

// 5. Wrong answers to real parts must not earn the point: [question, part, answer, points that must NOT be given].
const WRONG = [
  ['2025-Q17a', 2, 'diastole', [0]],
  ['2022-Q17d', 2, 'the left atrium', [0]],
  ['2019-Q5', 2, 'chlorophyll', [0]],
  ['2014-Q3', 1, 'a vein', [0]],
  ['2014-Q3', 0, 'a lymphocyte', [0]],
  ['2016-Q8', 1, 'it is near the heart', [0]],
  ['2022-Q17d', 4, 'the heart muscle contracting', [0]],
  ['S2-Q5a', 1, 'It closes to stop backflow', [0]],
];
let wok = 0;
for (const [id, k, text, idx] of WRONG) {
  const got = B.check(31, id, k, text), bad = idx.filter(i => got[i]);
  if (!bad.length) wok++; else fail(`wrong answer got marks: ${id} part ${k}: "${text}" ${bad}`);
}
console.log(`wrong answers kept out: ${wok}/${WRONG.length}`);
// And right answers in a student's own words.
const RIGHT = [
  ['2025-Q17a', 2, 'Systole', [0]],
  ['2022-Q17d', 2, 'In the wall of the right atrium', [0]],
  ['2014-Q3', 0, 'It is a lymph vessel', [0]],
  ['2019-Q5', 2, 'haemoglobin', [0]],
  ['S2-Q5a', 1, 'It opens to let the blood out of the ventricle', [0]],
];
let rok = 0;
for (const [id, k, text, idx] of RIGHT) {
  const got = B.check(31, id, k, text), miss = idx.filter(i => !got[i]);
  if (!miss.length) rok++; else fail(`right answer missed: ${id} part ${k}: "${text}" ${miss}`);
}
console.log(`right answers found: ${rok}/${RIGHT.length}`);
if (verbose) console.log(Object.keys(L).join(', '));
console.log(fails ? `${fails} problem(s)` : 'all chapter 31 checks pass');
process.exitCode = fails ? 1 : 0;

// Checks chapter 32's own content against the Biology marker: practice-question keys, the Be the examiner lines,
// the Build it questions and some wrong answers to real questions. Run: node tools/bio/tests/ch32.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: null };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
require('../../../bio/q32.js');
require('../../../bio/d32.js');
require('../../../bio/learn32.js');
require('../../../bio/bio.js');
const B = window.BioApp, L = window.BioLearn[32], Q = window.BioQuestions[32], verbose = process.argv[2];
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };

// 1. Every practice point is found in its own wording.
let pn = 0;
for (const q of L.practice) q.parts.forEach(p => p.pts.forEach(pt => {
  pn++;
  if (!B.hasPoint(pt, B.words(pt.a))) fail(`${q.id}${p.l} own wording: ${pt.a}`);
}));
console.log(`practice points found in their own wording: ${pn}`);

// 2. Practice answers in a student's own words (right), and near misses (wrong).
const P = id => L.practice.find(q => q.id === id);
const got = (id, k, text) => P(id).parts[k].pts.map(pt => B.hasPoint(pt, B.words(text)));
const RIGHT = [
  ['P32-1', 0, 'malaria', [0]], ['P32-1', 1, 'athletes foot', [0]], ['P32-1', 2, 'tapeworms', [0]],
  ['P32-1', 3, 'Antibiotics only work on bacteria, so you would use antivirals instead.', [0, 1]],
  ['P32-2', 0, 'They kill cells infected with viruses and they are non-specific.', [0, 1]],
  ['P32-2', 1, 'B cells produce antibodies. Killer T cells destroy infected cells. Helper T cells activate the B cells.', [0, 2, 3]],
  ['P32-3', 0, 'RNA: the flu virus. DNA: herpes.', [0, 1]], ['P32-3', 2, 'reverse transcriptase', [0]],
  ['P32-4', 0, 'Each infected person infects 3 others on average.', [0]],
  ['P32-4', 1, 'If R is above 1 cases increase because each person infects more than one new person, and below 1 the disease dies out.', [0, 1]],
  ['P32-5', 0, 'Some pests had a mutation making them resistant. They survived and reproduced and their offspring inherited the resistance.', [0, 1, 2]],
  ['P32-6', 1, 'Quarantine, contact tracing and testing.', [0, 1, 2]],
  ['P32-7', 0, 'The immune system attacks the body\'s own cells.', [0]], ['P32-7', 1, 'Type 1 diabetes', [0]],
  ['P32-7', 2, 'The insulin making cells in the pancreas are destroyed so the blood glucose level is high.', [0, 1]],
];
for (const [id, k, text, want] of RIGHT) { const g = got(id, k, text); want.forEach(i => { if (!g[i]) fail(`${id} part ${k} missed point ${i}: "${text}"`); }); }
const WRONG = [
  ['P32-1', 3, 'Antibiotics kill viruses.', [0, 1]],
  ['P32-4', 0, 'Three people are ill.', [0]],
  ['P32-7', 0, 'The body attacks bacteria.', [0]],
  ['P32-3', 2, 'transcription', [0]],
];
for (const [id, k, text, bad] of WRONG) { const g = got(id, k, text); bad.forEach(i => { if (g[i]) fail(`${id} part ${k} gave point ${i} to "${text}"`); }); }
console.log(`practice answers checked: ${RIGHT.length} right, ${WRONG.length} wrong`);

// 3. Be the examiner: in order, an ok line makes a new scheme point; other lines make none; every fix makes a point the ok lines don't.
for (const ex of L.examiner) {
  const q = Q.questions.find(x => x.id === ex.q), part = q && q.parts[ex.part];
  if (!part || part.kind !== 'text') { fail(`examiner ${ex.q} part ${ex.part}: no such text part`); continue; }
  const hits = text => part.pts.map((pt, i) => (B.hasPoint(pt, B.words(text)) ? i : -1)).filter(i => i >= 0);
  const earned = new Set();
  ex.lines.forEach((l, n) => {
    const fresh = hits(l.t).filter(i => !earned.has(i));
    if (l.ok && !fresh.length) fail(`examiner ${ex.q} line ${n + 1} should earn: "${l.t}"`);
    if (!l.ok && fresh.length) fail(`examiner ${ex.q} line ${n + 1} should earn nothing but makes ${fresh}: "${l.t}"`);
    if (!l.ok && (!l.why || !l.fix)) fail(`examiner ${ex.q} line ${n + 1} needs why and fix`);
    if (verbose) console.log(`    ${ex.q} ${n + 1} ${l.ok ? 'ok ' : '-- '} new ${JSON.stringify(fresh)}  ${l.t}`);
    fresh.forEach(i => earned.add(i));
  });
  ex.lines.forEach((l, n) => {
    if (l.fix && !hits(l.fix).some(i => !earned.has(i))) fail(`examiner ${ex.q} line ${n + 1} fix earns nothing new: "${l.fix}"`);
  });
  // The engine stops counting once the part has all its points, so the ok lines must leave room for a fix.
  if (earned.size >= part.n) fail(`examiner ${ex.q}: the ok lines already make all ${part.n} points, so no fix could earn`);
  const oks = ex.lines.filter(l => l.ok).length;
  if (oks < 2 || oks > 4 || ex.lines.length < 4 || ex.lines.length > 7) fail(`examiner ${ex.q}: ${oks} ok lines of ${ex.lines.length}`);
}
console.log(`examiner answers checked: ${L.examiner.length}`);

// 4. Build it: every tap answer is an anchor on its diagram, every option question has its answer.
for (const [id, qs] of Object.entries(L.build)) {
  const art = window.BioArt[id];
  if (!art) { fail(`build: no diagram ${id}`); continue; }
  qs.forEach(q => {
    if (q.tap) q.tap.forEach(a => { if (!art.anchors[a]) fail(`build ${id}: no anchor ${a}`); });
    else if (!(q.opts && q.opts[q.a])) fail(`build ${id}: bad options for "${q.q}"`);
  });
}
console.log(`build questions checked: ${Object.values(L.build).flat().length}`);

// 5. Real questions: some wrong answers must not earn marks.
const check = (qid, k, text) => { const q = Q.questions.find(x => x.id === qid); return q.parts[k].pts.map(pt => B.hasPoint(pt, B.words(text))); };
const REAL_WRONG = [
  ['2021-Q16c', 7, 'Antibiotics kill the virus.', [0]],
  ['2021-Q16c', 2, 'T lymphocytes', [0]],
  ['2024-Q16d', 3, 'T cells', [0]],
  ['2015-Q14a', 4, 'Killer T cells', [0]],
  ['2022-Q11b', 2, 'The bacteria get used to it.', [0]],
  ['2020-Q15b', 5, 'Passive', [0]],
];
for (const [qid, k, text, bad] of REAL_WRONG) { const g = check(qid, k, text); bad.forEach(i => { if (g[i]) fail(`${qid} part ${k} gave point ${i} to "${text}"`); }); }
console.log(`real-question wrong answers kept out: ${REAL_WRONG.length}`);

// 6. Question diagrams: every letter sits on an anchor of a diagram that exists.
for (const q of Q.questions) {
  const ds = q.dia ? (q.dia.panels || [q.dia]) : [];
  ds.forEach(d => {
    if (d.missing) fail(`${q.id}: letters with no anchor ${d.missing}`);
    if (d.base) { const a = window.BioArt[d.base]; if (!a) fail(`${q.id}: no diagram ${d.base}`); else (d.marks || []).forEach(m => { if (!a.anchors[m.a]) fail(`${q.id}: no anchor ${m.a}`); }); }
  });
  q.parts.forEach(p => { if (p.kind === 'tap' && !(p.tap && p.tap.length)) fail(`${q.id}${p.l}: tap part with no answer`); });
}
console.log(fails ? `${fails} FAILED` : 'all chapter 32 checks pass');
process.exit(fails ? 1 : 0);

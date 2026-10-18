// Checks chapter 30's own content against the Biology marker: the practice questions' keys, the Be the examiner
// answers (each right line earns a new point, the others earn nothing new, every fix earns a point the answer lacks),
// and some wrong and right answers to real chapter 30 questions. Run: node tools/bio/tests/ch30.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: null };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
require('../../../bio/q30.js');
require('../../../bio/learn30.js');
require('../../../bio/bio.js');
const B = window.BioApp, L = window.BioLearn[30], Q = window.BioQuestions[30], verbose = process.argv[2];
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const plain = a => a.replace(/^\*+/, '').replace(/\*/g, '');
const words = t => B.words(t);

// 1. Practice questions: every point is found in its own wording.
let n = 0, ok = 0;
for (const q of L.practice) q.parts.forEach(p => p.pts.forEach(pt => {
  n++;
  if (B.hasPoint(pt, words(plain(pt.a)))) ok++; else fail(`${q.id}${p.l}: own wording not found: ${pt.a}`);
}));
console.log(`practice points in their own wording: ${ok}/${n}`);

// 2. Be the examiner: the marker reads each answer line by line.
let lines = 0, lok = 0;
for (const item of L.examiner) {
  const q = Q.questions.find(x => x.id === item.q), part = q && q.parts[item.part];
  if (!part) { fail(`${item.q} part ${item.part}: no such part`); continue; }
  if (part.kind !== 'text') fail(`${item.q} part ${item.part}: not a text part (${part.kind})`);
  const hits = t => part.pts.map((pt, k) => B.hasPoint(pt, words(t)) ? k : -1).filter(k => k >= 0);
  const earned = new Set(), byOk = new Set();
  item.lines.forEach((ln, i) => {
    lines++;
    const fresh = hits(ln.t).filter(k => !earned.has(k));
    if (ln.ok && !fresh.length) fail(`${item.q}[${item.part}] line ${i + 1} should earn a new point: ${ln.t}`);
    else if (!ln.ok && fresh.length) fail(`${item.q}[${item.part}] line ${i + 1} should earn nothing new but got ${fresh}: ${ln.t}`);
    else lok++;
    fresh.forEach(k => earned.add(k));
    if (ln.ok) fresh.forEach(k => byOk.add(k));
    if (!ln.ok && !(ln.why && ln.fix)) fail(`${item.q}[${item.part}] line ${i + 1} needs why and fix`);
    if (verbose) console.log(`   ${item.q} ${i + 1} ${ln.ok ? 'ok ' : '-- '} ${JSON.stringify(fresh)} ${ln.t}`);
  });
  item.lines.filter(ln => ln.fix).forEach(ln => {
    const fresh = hits(ln.fix).filter(k => !byOk.has(k));
    if (!fresh.length) fail(`${item.q}[${item.part}] fix earns no new point: ${ln.fix}`);
    else if (verbose) console.log(`      fix ${JSON.stringify(fresh)} ${ln.fix}`);
  });
  const oks = item.lines.filter(ln => ln.ok).length;
  if (oks < 2 || oks > 4) fail(`${item.q}: ${oks} ok lines (want 2 to 4)`);
}
console.log(`examiner lines read as intended: ${lok}/${lines}`);

// 3. Wrong answers to real questions earn nothing; right ones in a student's own words are found.
// [question, part index, typed answer, points that must (RIGHT) or must not (WRONG) be given]
const WRONG = [
  ['2019-Q15b', 4, 'the pancreas', [0]],
  ['2006-Q3', 1, 'in the stomach', [0]],
  ['2008-Q12b', 2, 'the stomach', [0]],
  ['2012-Q15a', 1, 'digestion', [0]],
  ['2020-Q13b', 1, 'carbohydrate', [0]],
  ['2021-Q14b', 2, 'X is a capillary and it absorbs glucose', [0, 1]],
  ['2010-Q15b', 4, 'the liver', [0]],
  ['2019-Q15b', 7, 'the hepatic vein', [0]],
];
const RIGHT = [
  ['2021-Q14b', 2, 'X is the lacteal and its role is to absorb fats', [0, 1]],
  ['2010-Q15b', 6, 'Deamination of amino acids and detoxification of alcohol', [1, 3]],
  ['2019-Q15b', 2, 'Peristalsis: waves of muscular contractions push the food along', [0, 1]],
  ['2022-Q6', 1, 'fatty acids and glycerol', [0, 1]],
];
const check = (id, k, text) => B.check(30, id, k, text);
let wok = 0, rok = 0;
for (const [id, k, text, idx] of WRONG) {
  const got = check(id, k, text), bad = idx.filter(i => got[i]);
  if (bad.length) fail(`wrong answer got marks: ${id} ${k} "${text}" ${bad}`); else wok++;
}
for (const [id, k, text, idx] of RIGHT) {
  const got = check(id, k, text), miss = idx.filter(i => !got[i]);
  if (miss.length) fail(`right answer missed: ${id} ${k} "${text}" ${miss}`); else rok++;
}
console.log(`wrong answers kept out: ${wok}/${WRONG.length}`);
console.log(`right answers found: ${rok}/${RIGHT.length}`);

// 4. Build it questions point at anchors that exist; the learn drills are well formed.
const ART = {};
global.window.BioArt = undefined;
require('../../../bio/d30.js');
Object.assign(ART, window.BioArt);
for (const [id, qs] of Object.entries(L.build)) {
  if (!ART[id]) { fail(`build: no diagram ${id}`); continue; }
  qs.forEach(q => {
    if (q.tap) q.tap.forEach(a => { if (!ART[id].anchors[a]) fail(`build ${id}: no anchor ${a}`); });
    else if (!(q.opts && q.opts[q.a])) fail(`build ${id}: bad options for ${q.q}`);
  });
}
for (const d of L.learn) {
  if (d.type === 'sort') d.items.forEach(it => { if (!d.bins[it[1]]) fail(`${d.name}: bad bin for ${it[0]}`); });
  if (d.type === 'table') d.rows.forEach(r => r[1].forEach(c => { if (d.choices.indexOf(c) < 0) fail(`${d.name}: ${c} not a choice`); }));
}
console.log(fails ? `${fails} problem(s)` : 'all chapter 30 checks pass');
process.exit(fails ? 1 : 0);

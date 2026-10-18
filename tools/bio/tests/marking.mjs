// Checks the Biology marker: every marking-scheme point must be found in its own wording, and some
// common wrong answers must not earn marks. Run: node tools/bio/tests/marking.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: null };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
require('../../../bio/bio.js');
const B = window.BioApp, verbose = process.argv[2];
// The answer as a student might write it: the scheme's wording without its notation.
const plain = a => a.replace(/^\*+/, '').replace(/^(?:[A-Z]|\d{1,2})\s*(?:[=:.)]|\s-)\s*/, '').replace(/\*/g, '');
let ok = 0, n = 0; const bad = [];
for (const ch of [28, 29, 30, 31, 32]) for (const q of window.BioQuestions[ch].questions) q.parts.forEach(p => p.pts.forEach(pt => {
  if (!pt.k) return;
  n++;
  if (B.hasPoint(pt, B.words(plain(pt.a)))) ok++; else bad.push(`${q.id}${p.l}: ${pt.a}  keys=${JSON.stringify(pt.k)}`);
}));
console.log(`own wording: ${ok}/${n}`);
if (verbose) bad.forEach(b => console.log('   ', b));
// Wrong answers: [chapter, question, part index, typed answer, points that must NOT be given (indexes)].
const WRONG = [
  [29, '2008-Q13b', 1, 'renal vein', [0]],
  [29, '2008-Q13b', 2, 'the medulla', [0]],
  [29, '2008-Q13b', 5, 'glucose', [0]],
  [29, '2011-Q12b', 2, '1. renal vein 2. vena cava', [0, 1]],
  [29, '2020-Q13b', 1, 'carbohydrate', [0]],
  [29, '2025-Q17c', 1, 'the hypothalamus', [0]],
  [29, '2025-Q17c', 3, 'it increases the volume of urine', [0]],
  [29, '2006-Q13b', 1, 'they are too small', [0]],
];
let wok = 0;
for (const [ch, id, k, text, idx] of WRONG) {
  const got = B.check(ch, id, k, text), fail = idx.filter(i => got[i]);
  if (!fail.length) wok++; else console.log('   WRONG ANSWER GOT MARKS:', id, k, text, fail);
}
console.log(`wrong answers kept out: ${wok}/${WRONG.length}`);
// Right answers in a student's own words.
const RIGHT = [
  [29, '2008-Q13b', 4, 'It has a large surface area and the capillary walls are porous', [0, 1]],
  [29, '2006-Q13b', 1, 'Red blood cells are too large to fit through', [0]],
  [29, '2025-Q17c', 3, 'It lowers the volume of urine', [0]],
  [29, '2016-Q12a', 0, 'Excretion is the removal of metabolic waste from the body. Egestion is the removal of undigested food.', [0, 1]],
];
let rok = 0;
for (const [ch, id, k, text, idx] of RIGHT) {
  const got = B.check(ch, id, k, text), miss = idx.filter(i => !got[i]);
  if (!miss.length) rok++; else console.log('   RIGHT ANSWER MISSED:', id, k, text, miss);
}
console.log(`right answers found: ${rok}/${RIGHT.length}`);

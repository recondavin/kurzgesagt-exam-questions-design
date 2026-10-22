// Checks the Biology marker: every marking-scheme point must be found in its own wording, and some
// common wrong answers must not earn marks. Run: node tools/bio/tests/marking.mjs [-v]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// A stand-in for answer-mode.js's kit, so bio-examiner.js loads.
global.window = { ExamAnswerMode: { kit: {} }, BioKit: { esc: x => x, pick: a => a[0], buttons() {}, body() {} } };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/learn${ch}.js`);
require('../../../bio/bio.js');
require('../../../bio/bio-examiner.js');
const B = window.BioApp, verbose = process.argv[2];
// The answer as a student might write it: the scheme's wording without its notation.
const plain = a => a.replace(/^\*+/, '').replace(/^(?:[A-Z]|\d{1,2})\s*(?:[=:.)]|\s-)\s*/, '').replace(/\*/g, '');
let ok = 0, n = 0; const bad = [];
for (const ch of [28, 29, 30, 31, 32]) for (const q of window.BioQuestions[ch].questions) q.parts.forEach(p => p.pts.forEach(pt => {
  if (!pt.k || pt.own) return;
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
  [28, '2009-Q13c', 2, 'asthma, treated with antibiotics', [3]],  // a bronchitis treatment, not asthma's
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
  // Right in the student's own words (the user's answer, marked 0/6 before "produce" = "make" and "eating" = "eat").
  [30, '2015-Q11a', 0, 'heterotrophic is when an organism cannot produce its own food, omnivorous is when an animal survives by eating both other animals and plants', [0, 1]],
  [30, '2015-Q11a', 1, 'a diet with the right quantity of each kind of food', [0]],
  // The user's answer: the disorder's prevention and treatment, marked with the disorder it belongs to.
  [28, '2009-Q13c', 2, 'asthma, can be prevented by not breathing in dust or animal hair, can be treated with an inhaler', [0, 2, 3]],
];
let rok = 0;
for (const [ch, id, k, text, idx] of RIGHT) {
  const got = B.check(ch, id, k, text), miss = idx.filter(i => !got[i]);
  if (!miss.length) rok++; else console.log('   RIGHT ANSWER MISSED:', id, k, text, miss);
}
console.log(`right answers found: ${rok}/${RIGHT.length}`);
// Spelling slips earn (one letter in a word of 5+, two in a long word that starts the same); look-alike words don't.
const SLIPS = [['thoracic', 'thorasic', true], ['peristalsis', 'peristalis', true], ['haemoglobin', 'heamoglobin', true], ['oesophagus', 'esophagus', true],
  ['maltase', 'maltose', false], ['lactase', 'lactose', false], ['sucrose', 'sucrase', false], ['systemic', 'systolic', false], ['bronchus', 'bronchitis', false]];
let sok = 0;
for (const [key, typed, want] of SLIPS) {
  if (B.hasPoint({ k: [{ w: [key], n: 1 }] }, B.words(typed)) === want) sok++; else console.log('   SLIP:', key, typed, want ? 'should earn' : 'should not earn');
}
console.log(`spelling slips and look-alikes: ${sok}/${SLIPS.length}`);
// Be the examiner: lines written to earn (ok) must earn, the rest must earn nothing, and each fix must earn a new point.
let eok = 0, en = 0;
for (const ch of [28, 29, 30, 31, 32]) for (const it of (window.BioLearn[ch] || {}).examiner || []) {
  const got = window.BioExaminer.mark(ch, it);
  it.lines.forEach((l, k) => {
    en++;
    const bad = Boolean(l.ok) !== got[k].earns || (l.fix && !got[k].fixNew);
    if (!bad) eok++; else console.log('   EXAMINER LINE:', ch, it.q, k, l.t, JSON.stringify(got[k]));
  });
}
console.log(`examiner lines as written: ${eok}/${en}`);

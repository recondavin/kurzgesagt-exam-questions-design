// Checks the marker reads more than the words (the user: "if you can say the keywords you basically know how the
// question goes but if you cant do the real awnser im not sure if thats good enough"), in bio/bio.js:
//   Cancel      a short answer that adds a wrong term to a right one ("pulmonary vein or pulmonary artery") loses a
//               starred point, as the scheme says ("an incorrect additional answer cancels it"); the drill does it for
//               every question with its wrong boxes. Saying "not" isn't adding it.
//   Opposites   a word of the scheme's answer left out can't be said the opposite way next to its key ("hepatic portal
//               artery", "renal artery", "a small surface area").
//   Which way   keys that need their words together (c) or in order (o) see swapped roles ("T cells make antibodies,
//               B cells kill infected cells").
// And none of it takes a mark from a right answer: every drill item's right box and accepts, every quick check's
// right answer, and the scheme's own answers aren't cancelled.
// Run: node tools/bio/tests/whichway.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) { require(`../../../bio/q${ch}.js`); require(`../../../bio/checks${ch}.js`); }
require('../../../bio/bio.js');
require('../../../bio/sprint.js');
require('../../../bio/drill.js');
window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {}, host() {} };
window.BioBoard = { pools() {}, nearMascot() {}, reveal() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
require('../../../bio/bio-drill.js');
const B = window.BioApp, D = window.BioDrill;
let fails = 0, n = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
// [chapter, question, part, answer, the points it should get (true/false per point)]
const SHEET = [
  [28, '2007-Q13a', 0, 'pulmonary vein', [true]],
  [28, '2007-Q13a', 0, 'pulmonary vein or pulmonary artery', [false]],
  [28, '2007-Q13a', 0, 'the pulmonary vein, not the pulmonary artery', [true]],
  [30, '2025-Q17a', 0, 'the hepatic portal vein', [true]],
  [30, '2025-Q17a', 0, 'hepatic portal artery', [false]],
  [29, '2023-Q17c', 0, 'renal vein', [true]],
  [29, '2023-Q17c', 0, 'renal artery', [false]],
  [29, 'S1-Q1e', 3, 'less water is reabsorbed into the blood', [false, false, false]],
  [30, '2005-Q6', 1, 'a small surface area', [false, false, false, false, false]],
  [30, '2005-Q6', 1, 'microvilli increase the surface area of the small intestine', [true, false, true, false, false]],
];
SHEET.forEach(([ch, qid, k, text, want]) => {
  n++;
  const got = B.check(ch, qid, k, text);
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`${ch} ${qid} part ${k + 1}: "${text}" gets ${JSON.stringify(got)}, not ${JSON.stringify(want)}`);
});
// [chapter, drill item, answer, full marks?]
const DRILL = [
  [28, 'e28:S1-Q3a:1', 'diffusion', true],
  [28, 'e28:S1-Q3a:1', 'diffusion and osmosis', false],
  [32, 'n32:D32-9', 'B cells make antibodies; killer T cells destroy the infected body cells', true],
  [32, 'n32:D32-9', 'antibodies are made by B cells and killer T cells destroy infected cells', true],
  [32, 'n32:D32-9', 'T cells make antibodies and B cells kill infected cells', false],
  [32, 'n32:D32-9', 'killer T cells make antibodies; B cells destroy the infected body cells', false],
  [32, 'n32:D32-8', 'plasma cells from B cells make antibodies', true],
  [32, 'n32:D32-8', 'B lymphocytes make antigens that lock onto antibodies on the pathogen', false],
  [31, 'n31:D31-6', 'its red cells have no A or B antigens', true],
  [31, 'n31:D31-6', 'its red cells have no A or B antibodies for antigens to attack', false],
  [31, 'n31:D31-29', 'the left atrium, then the tricuspid valve', false],
];
const byId = {};
[28, 29, 30, 31, 32].forEach(ch => D.items(ch).forEach(it => { byId[it.id] = it; }));
DRILL.forEach(([ch, id, text, full]) => {
  n++;
  const it = byId[id];
  if (!it) return fail(`no drill item ${id}`);
  const ok = !D.cancelled(it, text) && it.earned(text) >= it.need;
  if (ok !== full) fail(`${id}: "${text}" ${ok ? 'gets' : 'misses'} full marks`);
});
// Right answers are never cancelled: the drill's right boxes and every accept, the quick checks' right answers.
Object.values(byId).forEach(it => {
  [it.right].concat(...it.pts.map(p => p.accept || [])).forEach(text => {
    n++;
    const bad = D.cancelled(it, text);
    if (bad) fail(`${it.id}: the right answer "${text}" is cancelled by "${bad}"`);
  });
});
[28, 29, 30, 31, 32].forEach(ch => {
  for (const q of window.BioQuestions[ch].questions) q.parts.forEach((p, k) => {
    const c = ((window.BioChecks[ch] || {})[q.id] || [])[k];
    if (!c || p.kind !== 'text' || !p.pts.some(t => /\*/.test(t.a))) return;
    n++;
    const plain = B.check(ch, q.id, k, c.right), alone = p.pts.map(t => !!t.k && B.hasPoint(t, B.words(c.right)));
    if (plain.some((g, i) => alone[i] && !g)) fail(`${ch} ${q.id} part ${k + 1}: its right answer "${c.right}" is cancelled`);
  });
});
console.log(fails ? `${fails} failures` : `ok: ${n} answers: wrong terms added cancel, opposites and swapped roles miss, right answers keep their marks`);
process.exit(fails ? 1 : 0);

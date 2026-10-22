// Checks the quick checks on the desk guide's slides (bio/checksNN.js, built by tools/bio/build_bio_checks.py): every
// part of every question has one, with a short question, a right answer that isn't also among the wrong ones, three
// wrong answers (one for true or false), none repeated, a why, and a hint (at most 100 letters, not the answer itself)
// for the examiner's help on the desk. Run: node tools/bio/tests/checks.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
let fails = 0, checks = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
for (const n of [28, 29, 30, 31, 32]) {
  require(`../../../bio/q${n}.js`);
  require(`../../../bio/checks${n}.js`);
  const C = window.BioChecks[n];
  for (const q of window.BioQuestions[n].questions) {
    const list = C[q.id];
    if (!list) { fail(`${n}/${q.id} has no checks`); continue; }
    if (list.length !== q.parts.length) fail(`${n}/${q.id}: ${list.length} checks for ${q.parts.length} parts`);
    list.forEach((c, k) => {
      checks++;
      const where = `${n}/${q.id} part ${k + 1}`;
      const tf = c.right === 'True' || c.right === 'False';
      if (!c.q || c.q.length > 110) fail(`${where}: question missing or too long`);
      if (!c.why) fail(`${where}: no why`);
      if (!c.hint || c.hint.length > 100) fail(`${where}: hint missing or too long`);
      if (c.hint && c.right.length < 30 && !/^(True|False)$/.test(c.right) && c.hint.toLowerCase().includes(c.right.toLowerCase())) fail(`${where}: the hint gives the answer`);
      if (c.wrong.length !== (tf ? 1 : 3)) fail(`${where}: ${c.wrong.length} wrong answers`);
      const all = [c.right, ...c.wrong].map(s => s.trim().toLowerCase());
      if (new Set(all).size !== all.length) fail(`${where}: an answer is repeated (or the right one is among the wrong)`);
    });
  }
}
console.log(fails ? `${fails} failures` : `ok: ${checks} quick checks`);
process.exit(fails ? 1 : 0);

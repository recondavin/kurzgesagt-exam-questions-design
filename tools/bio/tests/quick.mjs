// Checks the quick games' content in every chapter (bio/learnNN.js: match, spot, sprint; played by bio/bio-quick.js).
// Run: node tools/bio/tests/quick.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
const CH = [28, 29, 30, 31, 32];
for (const n of CH) { require(`../../../bio/d${n}.js`); require(`../../../bio/learn${n}.js`); }
const NOT_A_PART = /^\d+\.|:|diffuses|entering|^Cut |^Blood (from|to) /;
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const stem = w => w.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);

for (const n of CH) {
  const L = window.BioLearn[n];
  // Match pairs: three rounds of four, every word and meaning different, and no meaning gives away its own word.
  const m = L.match || [];
  if (m.length < 12) fail(`${n} match: ${m.length} pairs, needs 12`);
  const words = m.map(p => p[0]), means = m.map(p => p[1]);
  if (new Set(words).size !== words.length) fail(`${n} match: a word is there twice`);
  if (new Set(means).size !== means.length) fail(`${n} match: a meaning is there twice`);
  m.forEach(([w, mean]) => {
    const key = w.split(' ').filter(x => x.length > 3).map(stem), said = mean.split(/[\s,:;.]+/).map(stem);
    if (key.some(k => said.includes(k))) fail(`${n} match: "${mean}" gives away ${w}`);
  });
  // Spot the mistake: one starred phrase, a fix that isn't the wrong words, two other choices.
  for (const it of L.spot || []) {
    const bad = /^(.*?)\*(.+?)\*(\S*)(.*)$/.exec(it.s);
    if (!bad || (it.s.match(/\*/g) || []).length !== 2) { fail(`${n} spot: one *phrase* needed: ${it.s}`); continue; }
    if (it.fix === bad[2]) fail(`${n} spot: the fix is the wrong words: ${it.s}`);
    if (!Array.isArray(it.opts) || it.opts.length !== 2) fail(`${n} spot: two other choices needed: ${it.s}`);
    if (it.opts.includes(it.fix) || it.opts.includes(bad[2])) fail(`${n} spot: a choice repeats the fix or the wrong words: ${it.s}`);
    if (!it.why) fail(`${n} spot: no why: ${it.s}`);
  }
  if ((L.spot || []).length < 8) fail(`${n} spot: ${(L.spot || []).length} sentences, needs 8`);
  // Label sprint: every diagram is there, with at least three parts to tap, and twelve different parts in all.
  const set = window.ExamDrawDiagrams['bio-' + n].diagrams, names = new Set();
  for (const id of L.sprint || []) {
    const d = set.find(x => x.id === id);
    if (!d) { fail(`${n} sprint: no diagram ${id}`); continue; }
    const parts = d.labels.filter(l => !NOT_A_PART.test(l.text));
    if (parts.length < 3) fail(`${n} sprint: ${id} has ${parts.length} parts`);
    parts.forEach(l => { names.add(l.text); if (!Array.isArray(l.at) || l.at.length !== 2) fail(`${n} sprint: ${id} ${l.text} has no point`); });
  }
  if (names.size < 12) fail(`${n} sprint: only ${names.size} different parts`);
  console.log(`ch${n}: ${m.length} pairs, ${(L.spot || []).length} mistakes, ${(L.sprint || []).length} diagrams (${names.size} parts)`);
}
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);

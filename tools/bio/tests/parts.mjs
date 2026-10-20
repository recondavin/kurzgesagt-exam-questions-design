// Checks the part views the desk guide moves through (bio/papers.js parts, traced by tools/bio/build_bio_part_boxes.py):
// every question on the desk has one view per part, in the order of its slides, each box inside the page with its
// covers inside the box, and every page it names is in assets/bio/papers. Run: node tools/bio/tests/parts.mjs
import { createRequire } from 'module';
import { existsSync } from 'fs';
const require = createRequire(import.meta.url);
global.window = {};
for (const n of [28, 29, 30, 31, 32]) require(`../../../bio/q${n}.js`);
require('../../../bio/papers.js');
const P = window.BioPapers, Q = window.BioQuestions;
let fails = 0, views = 0, covers = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const inPage = b => b[0] >= -2 && b[1] >= -2 && b[0] + b[2] <= 102 && b[1] + b[3] <= 102 && b[2] > 0 && b[3] > 0;
const within = (d, b) => d[0] >= b[0] - 0.01 && d[1] >= b[1] - 0.01 && d[0] + d[2] <= b[0] + b[2] + 0.01 && d[1] + d[3] <= b[1] + b[3] + 0.01;

for (const n of [28, 29, 30, 31, 32]) {
  for (const q of Q[n].questions) {
    const p = P[n + '/' + q.id];
    if (!p) continue;
    if (!p.parts) { fail(`${n}/${q.id} has no part views`); continue; }
    if (p.parts.length !== q.parts.length) fail(`${n}/${q.id}: ${p.parts.length} views for ${q.parts.length} parts`);
    p.parts.forEach((v, k) => {
      views++;
      if (!inPage(v.box)) fail(`${n}/${q.id} part ${k + 1}: box ${v.box} is off the page`);
      if (!existsSync(new URL('../../../' + v.img, import.meta.url))) fail(`${n}/${q.id} part ${k + 1}: ${v.img} is missing`);
      v.dim.forEach(d => { covers++; if (!within(d, v.box)) fail(`${n}/${q.id} part ${k + 1}: cover ${d} is outside its box`); });
    });
  }
}
console.log(fails ? `${fails} failures` : `ok: ${views} part views, ${covers} covers`);
process.exit(fails ? 1 : 0);

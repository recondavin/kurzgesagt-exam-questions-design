// Checks Label sprint's real exam diagrams (bio/sprint.js, built by tools/bio/build_bio_sprint.py): every chapter
// has some, each page image exists, each box is on its page, every spot and cover is inside its box, no spot is
// under a cover, each diagram has at least two parts to tap, and spots with different names are far enough apart to
// tell which was tapped (the game takes the nearest spot). Run: node tools/bio/tests/sprint.mjs
import { existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
require('../../../bio/sprint.js');
const S = window.BioSprint, PAGE = [2055, 2908];
let fails = 0, diagrams = 0, spots = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const inBox = (p, b) => p[0] >= b[0] && p[1] >= b[1] && p[0] <= b[0] + b[2] && p[1] <= b[1] + b[3];
const px = p => [p[0] * PAGE[0] / 100, p[1] * PAGE[1] / 100];

for (const ch of [28, 29, 30, 31, 32]) {
  const list = S[ch] || [];
  if (list.length < 3) fail(`chapter ${ch}: only ${list.length} diagrams`);
  for (const d of list) {
    diagrams++;
    const at = `${ch}/${d.q}`, b = d.box;
    if (!existsSync(new URL('../../../' + d.img, import.meta.url))) fail(`${at}: ${d.img} is missing`);
    if (!(b[0] >= 0 && b[1] >= 0 && b[0] + b[2] <= 100.01 && b[1] + b[3] <= 100.01)) fail(`${at}: box ${b} is off the page`);
    d.cover.forEach(c => { if (!inBox([c[0], c[1]], b) || !inBox([c[0] + c[2], c[1] + c[3]], b)) fail(`${at}: cover ${c} is outside the box`); });
    if (new Set(d.spots.map(s => s.t)).size < 2) fail(`${at}: fewer than two parts to tap`);
    const width = b[2] * PAGE[0] / 100;
    d.spots.forEach((s, i) => {
      spots++;
      if (!s.t || s.t !== s.t.trim() || !/^[A-Z]/.test(s.t)) fail(`${at}: spot name "${s.t}"`);
      if (!inBox(s.at, b)) fail(`${at}: ${s.t} is outside the box`);
      if (d.cover.some(c => inBox(s.at, c))) fail(`${at}: ${s.t} is under a cover`);
      d.spots.forEach((o, j) => {
        if (j <= i || o.t === s.t) return;
        const a = px(s.at), c = px(o.at), dist = Math.hypot(a[0] - c[0], a[1] - c[1]);
        if (dist < width * 0.035) fail(`${at}: ${s.t} and ${o.t} are too close to tell apart`);
      });
    });
  }
}
console.log(fails ? `${fails} failures` : `ok: ${diagrams} exam diagrams, ${spots} spots`);
process.exit(fails ? 1 : 0);

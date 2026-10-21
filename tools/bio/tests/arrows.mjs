// Checks the answer sheet's pictures and arrow parts (bio/qNN.js, from the chapter OVERRIDES): every picture cut from
// the paper is on a page that exists and inside it, no diagram is left as a written note, and every arrow part has one
// rule per scheme point whose right arrow (show) passes its own rule and no other's. The judging is bio.js's
// (zoneDist, zoneOf, arrowFits), copied here. Run: node tools/bio/tests/arrows.mjs
import { existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = {};
const PAGE = [2055, 2908];
let fails = 0, figs = 0, parts = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };

function zoneDist(p, rects, sc) {
  return Math.min(...rects.map(r => {
    const x = r[0] * sc[0], y = r[1] * sc[1], w = r[2] * sc[0], h = r[3] * sc[1];
    return Math.hypot(Math.max(x - p[0], 0, p[0] - x - w), Math.max(y - p[1], 0, p[1] - y - h));
  }));
}
function zoneOf(p, A, D) {
  let best = null, bd = D.size * 0.06 + 0.01;
  Object.keys(A.zones || {}).forEach(z => { const d = zoneDist(p, A.zones[z], D.sc); if (d < bd) { best = z; bd = d; } });
  return best;
}
function arrowFits(r, rule, A, D) {
  const dx = r.b[0] - r.a[0], dy = r.b[1] - r.a[1], L = Math.hypot(dx, dy), z = rule.toward || rule.away;
  if (rule.label && r.t !== rule.label) return false;
  if (rule.on && zoneOf([(r.a[0] + r.b[0]) / 2, (r.a[1] + r.b[1]) / 2], A, D) !== rule.on) return false;
  if (rule.from && zoneOf(r.a, A, D) !== rule.from) return false;
  if (rule.to && zoneOf(r.b, A, D) !== rule.to) return false;
  if (rule.dir) {
    const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[rule.dir];
    if ((dx * d[0] + dy * d[1]) / L < 0.75) return false;
  }
  if (z) {
    const gain = zoneDist(r.a, A.zones[z], D.sc) - zoneDist(r.b, A.zones[z], D.sc);
    if ((rule.toward ? gain : -gain) < 0.35 * L) return false;
  }
  return true;
}

for (const n of [28, 29, 30, 31, 32]) {
  require(`../../../bio/d${n}.js`);
  require(`../../../bio/q${n}.js`);
}
for (const n of [28, 29, 30, 31, 32]) {
  for (const q of window.BioQuestions[n].questions) {
    const where = `${n}/${q.id}`, dia = q.dia;
    if (dia && dia.note) fail(`${where}: diagram is only a written note`);
    (dia && dia.fig || []).forEach(f => {
      figs++;
      const b = f.box;
      if (!existsSync(new URL('../../../' + f.img, import.meta.url))) fail(`${where}: ${f.img} is missing`);
      if (!(b[0] >= 0 && b[1] >= 0 && b[2] > 0 && b[3] > 0 && b[0] + b[2] <= 100 && b[1] + b[3] <= 100)) fail(`${where}: picture box ${b} is off the page`);
    });
    q.parts.forEach(p => {
      if (p.kind !== 'arrows') return;
      parts++;
      const A = p.arrows, at = `${where}${p.l}`;
      if (!A || !A.rules) { fail(`${at}: arrows part with no rules`); return; }
      if (A.rules.length !== p.pts.length) fail(`${at}: ${A.rules.length} rules for ${p.pts.length} points`);
      const fig = dia && dia.fig, art = dia && dia.base && window.BioArt[dia.base];
      if (!fig && !art) { fail(`${at}: no diagram to draw on`); return; }
      const size = fig ? fig[0].box[2] * PAGE[0] / 100 : +art.plain.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+)/)[1];
      const D = { size, sc: fig ? [PAGE[0] / 100, PAGE[1] / 100] : [1, 1] };
      const shown = A.rules.map(rule => {
        ['on', 'from', 'to', 'toward', 'away'].forEach(k => { if (rule[k] && !(A.zones || {})[rule[k]]) fail(`${at}: zone ${rule[k]} isn't defined`); });
        if (rule.label && !(A.labels || []).includes(rule.label)) fail(`${at}: label ${rule.label} isn't one of the buttons`);
        if (!rule.show) { fail(`${at}: a rule has no right arrow to show`); return null; }
        const s = rule.show;
        return { a: [s[0] * D.sc[0], s[1] * D.sc[1]], b: [s[2] * D.sc[0], s[3] * D.sc[1]], t: rule.label || '' };
      });
      A.rules.forEach((rule, i) => {
        if (shown[i] && !arrowFits(shown[i], rule, A, D)) fail(`${at}: the right arrow for point ${i + 1} doesn't pass its own rule`);
        // The right arrow drawn backwards must not pass.
        if (shown[i] && arrowFits({ a: shown[i].b, b: shown[i].a, t: shown[i].t }, rule, A, D)) fail(`${at}: point ${i + 1} also passes backwards`);
        shown.forEach((r, j) => { if (r && j !== i && arrowFits(r, rule, A, D)) fail(`${at}: the right arrow for point ${j + 1} also passes point ${i + 1}`); });
      });
    });
  }
}
console.log(fails ? `${fails} failures` : `ok: ${figs} pictures from the papers, ${parts} arrow parts`);
process.exit(fails ? 1 : 0);

// Checks every Computer Science question (tools/cs/questions/ch<N>.json):
//  - every bit of maths renders in KaTeX (question, ask, steps, model, scheme, tip), every picture is one the site can
//    draw (MathsRender.validate, with the CS kinds), every part has steps;
//  - the answer can be marked: the model answer earns full marks for keys answers, an answer saying nothing earns
//    none, exact answers accept their own value, table blanks accept the table's own cells.
// Run: node tools/cs/tests/check.mjs [chapter] [-v]     (CS_Q=<dir> checks another folder)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
global.window = { matchMedia: null };
window.katex = require(path.join(ROOT, 'lib/katex/katex.min.js'));
require(path.join(ROOT, 'maths/maths-render.js'));
require(path.join(ROOT, 'maths/maths-scenes.js'));
global.document = undefined;
require(path.join(ROOT, 'cs/cs-scenes.js'));
require(path.join(ROOT, 'cs/cs-mark.js'));
const M = window.MathsRender, CM = window.CsMark, katex = window.katex;
const only = process.argv.find(a => /^\d+$/.test(a)), verbose = process.argv.includes('-v');
const QDIR = process.env.CS_Q || path.join(ROOT, 'tools/cs/questions');
let bad = 0, parts = 0, checked = 0;
function fail(where, msg) { bad++; console.log('FAIL', where + ':', msg); }
function texOk(where, s) {
  try { katex.renderToString(s, { throwOnError: true, strict: false, macros: { '\\hl': '\\htmlClass{mx-hl}{#1}', '\\mv': '\\htmlData{mv=#1}{#2}' }, trust: () => true }); }
  catch (e) { fail(where, 'KaTeX: ' + e.message.slice(0, 120) + ' in ' + JSON.stringify(s).slice(0, 100)); }
}
function inlineOk(where, s) {
  if (s == null) return;
  const t = String(s).replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  if ((t.match(/\$/g) || []).length % 2) { fail(where, 'odd number of $ in ' + JSON.stringify(s).slice(0, 100)); return; }
  t.split(/(\$[^$]+\$)/).forEach(b => { if (/^\$[^$]+\$$/.test(b)) texOk(where, b.slice(1, -1)); });
}
function visOk(where, v) { if (v) M.validate(v).forEach(p => fail(where, 'picture: ' + p)); }
function answerOk(P, a, model, marks) {
  if (!a || !a.type) { fail(P, 'no answer'); return; }
  const t = a.type;
  if (t === 'none') return;
  if (t === 'keys') {
    (a.points || []).forEach((p, i) => { if (!(p.alts || []).length) fail(P, 'point ' + (i + 1) + ' has no alts'); });
    if (model) {
      const r = CM.check(a, model, marks);
      checked++;
      if (!r.ok) fail(P, 'the model answer does not earn full marks (' + r.got + '/' + r.max + '; points ' + JSON.stringify(r.points) + '): ' + JSON.stringify(model).slice(0, 140));
    }
    const nothing = CM.check(a, 'I do not know', marks);
    if (nothing.got > 0) fail(P, '"I do not know" earns marks');
    return;
  }
  if (t === 'text') { checked++; if (!CM.check(a, a.value, marks).ok) fail(P, 'its own value is marked wrong'); return; }
  if (t === 'number') { checked++; if (!CM.check(a, String(a.value), marks).ok) fail(P, 'its own value is marked wrong'); return; }
  if (t === 'choice') { if (!(a.options && a.options[a.value] != null)) fail(P, 'choice value is not an option'); return; }
  if (t === 'table') {
    const vals = (a.blank || []).map(rc => a.rows && a.rows[rc[0]] ? a.rows[rc[0]][rc[1]] : undefined);
    if (vals.some(v => v == null || v === '')) fail(P, 'a blank cell has no answer in rows');
    else { checked++; if (!CM.check(a, vals, marks).ok) fail(P, 'its own cells are marked wrong'); }
    return;
  }
  if (t === 'fields') {
    (a.fields || []).forEach((f, i) => answerOk(P + ' field ' + (i + 1), f.answer, f.model || null, f.marks || null));
    return;
  }
  fail(P, 'unknown answer type ' + t);
}
for (const f of (fs.existsSync(QDIR) ? fs.readdirSync(QDIR) : []).sort()) {
  const m = /^ch(\d+)\.json$/.exec(f);
  if (!m || (only && m[1] !== only)) continue;
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8')); } catch (e) { fail(f, 'not valid JSON: ' + e.message); continue; }
  const ids = new Set();
  for (const q of d.questions) {
    const W = 'ch' + m[1] + ' ' + q.id;
    if (ids.has(q.id)) fail(W, 'duplicate id');
    ids.add(q.id);
    if (q.id !== q.year + '-Q' + q.q) fail(W, 'id should be year-Qnumber');
    if (!Array.isArray(q.pages) || !q.pages.length) fail(W, 'no pages');
    inlineOk(W + ' stem', q.stem);
    (q.parts || []).forEach(p => {
      parts++;
      const P = W + ' ' + (p.l || '(whole)');
      ['q', 'ask', 'scheme', 'tip', 'model'].forEach(k => inlineOk(P + ' ' + k, p[k]));
      if (p.ask && String(p.ask).length > 90) fail(P, 'ask over 90 characters');
      if (p.idea) { inlineOk(P + ' idea', p.idea.text); visOk(P + ' idea', p.idea.vis); }
      if (!p.steps || !p.steps.length) fail(P, 'no steps');
      (p.steps || []).forEach((s, i) => {
        inlineOk(P + ' step ' + (i + 1), s.say);
        (s.math || []).forEach(line => texOk(P + ' step ' + (i + 1), line));
        visOk(P + ' step ' + (i + 1), s.vis);
      });
      answerOk(P, p.answer, p.model, p.marks);
    });
  }
}
console.log(parts + ' parts, ' + checked + ' answers checked, ' + bad + ' problems');
process.exit(bad ? 1 : 0);

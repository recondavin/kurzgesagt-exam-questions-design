// Checks every Maths question (tools/maths/questions/ch<N>.json):
//  - every bit of maths renders in KaTeX without an error (question text, steps, answers, scheme, tips),
//  - every \mv key in a line is unique, and every picture is one the site can draw (MathsRender.validate),
//  - typing the answer as it's shown to the student ("show") is marked right, and a wrong answer isn't.
// Run: node tools/maths/tests/check.mjs [chapter] [-v]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
global.window = { matchMedia: null };
window.katex = require(path.join(ROOT, 'lib/katex/katex.min.js'));
require(path.join(ROOT, 'maths/maths-render.js'));
require(path.join(ROOT, 'maths/maths-scenes.js'));
const M = window.MathsRender, katex = window.katex;
const only = process.argv.find(a => /^\d+$/.test(a)), verbose = process.argv.includes('-v');
const MACROS = { '\\hl': '\\htmlClass{mx-hl}{#1}', '\\mv': '\\htmlData{mv=#1}{#2}' };
function visOk(where, v) { if (v) M.validate(v).forEach(p => fail(where, 'picture: ' + p)); }
const QDIR = process.env.MATHS_Q || path.join(ROOT, 'tools/maths/questions');
let bad = 0, parts = 0, checked = 0;
function fail(where, msg) { bad++; console.log('FAIL', where + ':', msg); }
function texOk(where, s) {
  try { katex.renderToString(s, { throwOnError: true, strict: false, macros: { ...MACROS }, trust: () => true }); }
  catch (e) { fail(where, 'KaTeX: ' + e.message.slice(0, 140) + ' in ' + JSON.stringify(s).slice(0, 120)); }
}
function inlineOk(where, s) {
  if (s == null) return;
  const bits = String(s).split(/(\$[^$]+\$)/);
  if ((String(s).match(/\$/g) || []).length % 2) fail(where, 'odd number of $ in ' + JSON.stringify(s).slice(0, 120));
  bits.forEach(b => { if (/^\$[^$]+\$$/.test(b)) texOk(where, b.slice(1, -1)); });
}
function wrongOf(a) {
  if (a.type === 'number') return String(a.value * 1.37 + 3 + 3 * (a.tol || 0));
  if (a.type === 'numbers') return a.values.map(v => v + Math.max(7, 3 * (a.tol || 0) + 1)).join(', ');
  if (a.type === 'point') return '(' + (a.value[0] + 5) + ', ' + (a.value[1] - 3) + ')';
  if (a.type === 'expr') return a.value + '+1';
  if (a.type === 'equation') return a.value.replace('=', '=1+');
  return null;
}
for (const f of (fs.existsSync(QDIR) ? fs.readdirSync(QDIR) : []).sort()) {
  const m = /^ch(\d+)\.json$/.exec(f);
  if (!m || (only && m[1] !== only)) continue;
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8')); }
  catch (e) { fail(f, 'not valid JSON: ' + e.message); continue; }
  const ids = new Set();
  for (const q of d.questions) {
    const W = 'ch' + m[1] + ' ' + q.id;
    if (ids.has(q.id)) fail(W, 'duplicate id');
    ids.add(q.id);
    if (q.id !== q.year + '-P' + q.paper + '-Q' + q.q) fail(W, 'id should be year-Ppaper-Qnumber');
    if (!Array.isArray(q.pages) || !q.pages.length) fail(W, 'no pages');
    inlineOk(W + ' stem', q.stem);
    (q.parts || []).forEach((p, k) => {
      parts++;
      const P = W + ' ' + p.l;
      inlineOk(P + ' q', p.q); inlineOk(P + ' scheme', p.scheme); inlineOk(P + ' tip', p.tip);
      if (p.ask != null) { inlineOk(P + ' ask', p.ask); if (String(p.ask).length > 90) fail(P, 'ask is over 90 characters'); }
      if (p.idea) { inlineOk(P + ' idea', p.idea.text); visOk(P + ' idea', p.idea.vis); }
      if (!p.steps || !p.steps.length) fail(P, 'no steps');
      (p.steps || []).forEach((s, i) => {
        inlineOk(P + ' step ' + (i + 1) + ' say', s.say);
        (s.math || []).forEach(line => {
          texOk(P + ' step ' + (i + 1), line);
          const keys = [...line.matchAll(/\\mv\{([^}]*)\}/g)].map(x => x[1]);
          if (new Set(keys).size !== keys.length) fail(P + ' step ' + (i + 1), 'a \\mv key is used twice in one line');
        });
        visOk(P + ' step ' + (i + 1), s.vis);
      });
      const a = p.answer;
      if (!a) { fail(P, 'no answer'); return; }
      if (a.show) inlineOk(P + ' answer', a.show);
      if (a.type === 'none' || a.type === 'choice') {
        if (a.type === 'choice' && !(a.options && a.options[a.value] != null)) fail(P, 'choice value is not one of the options');
        return;
      }
      // The answer as the student is shown it should be marked right when typed (maths markup taken out).
      const typed = String(a.show || (a.values ? a.values.join(', ') : a.value)).replace(/\$/g, '').replace(/\\(text|mathrm)\{([^}]*)\}/g, '$2')
        .replace(/\\pi/g, 'π').replace(/\\times/g, '×').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)').replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)').replace(/\\[,;! ]/g, '').replace(/[{}]/g, '')
        .replace(/^[^=]*?(?:≈|\\approx)/, '');
      const r = M.check(a, a.type === 'number' && /=/.test(typed) && !/^[a-z]+\s*=/i.test(typed) ? typed.split('=').pop() : typed);
      checked++;
      if (!r.ok) {
        // Fall back to the bare value: "show" may be a sentence.
        const r2 = M.check(a, a.type === 'number' ? String(a.value) : a.type === 'numbers' ? a.values.join(', ') : a.type === 'point' ? '(' + a.value.join(', ') + ')' : a.value);
        if (!r2.ok) fail(P, 'the right answer is marked wrong: ' + JSON.stringify(a));
        else if (verbose) console.log('note', P, 'shown answer not typeable as is:', JSON.stringify(a.show));
      }
      const w = wrongOf(a);
      if (w && M.check(a, w).ok) fail(P, 'a wrong answer (' + w + ') is marked right');
    });
  }
}
console.log(parts + ' parts, ' + checked + ' answers checked, ' + bad + ' problems');
process.exit(bad ? 1 : 0);

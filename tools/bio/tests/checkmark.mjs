// Checks that each quick check teaches an answer the marker gives marks for: a written part's check, typed as the
// answer, must earn the points it promises ("(2 points)" at the end of its question: two; otherwise one). A check
// that teaches a right answer the marker misses is a student marked down for learning it.
// Reads the checks' source (tools/bio/checks/ch<N>.json), so it works before the build.
// Run: node tools/bio/tests/checkmark.mjs [-v] [chapter]
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} } };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
require('../../../bio/bio.js');
const B = window.BioApp, verbose = process.argv.includes('-v'), only = +process.argv.find(a => /^\d\d$/.test(a)) || 0;
const CHECKS = {};
for (const ch of [28, 29, 30, 31, 32]) CHECKS[ch] = JSON.parse(readFileSync(new URL(`../checks/ch${ch}.json`, import.meta.url)));
let ok = 0, n = 0;
for (const ch of [28, 29, 30, 31, 32].filter(c => !only || c === only)) for (const q of window.BioQuestions[ch].questions) q.parts.forEach((p, k) => {
  const c = (CHECKS[ch][q.id] || [])[k], keyed = p.pts.filter(pt => pt.k && !pt.self).length;
  if (p.kind !== 'text' || !keyed || !c) return;
  const m = c.q.match(/\((\d) points\)$/), want = Math.min(m ? +m[1] : 1, keyed, p.n || 1);
  const got = B.check(ch, q.id, k, c.right).filter(Boolean).length;
  n++;
  if (got >= want) { ok++; return; }
  console.log(`   ${ch}/${q.id}${p.l}: "${c.right}" earns ${got} of ${want}` + (verbose ? `\n      points: ${p.pts.map(pt => pt.a + ' ' + JSON.stringify((pt.k || []).map(a => a.w.join('+') + '/' + a.n))).join(' | ')}` : ''));
});
console.log(`quick-check answers the marker gives marks for: ${ok}/${n}`);
process.exit(ok === n ? 0 : 1);

// Checks the marker gives every answer the marking scheme accepts (the user, after "thin cell wall" was marked wrong
// though the 2014 scheme accepts "thin wall": "it has to be by the marking scheme, nothing else"). Each point's
// "accept" alternatives in tools/bio/questions/ch<N>.json, typed as an answer, must earn that point. Accepts that are
// notes to the examiner ("any valid disorder", "other correct reason") are skipped, as the builder skips them.
// Run: node tools/bio/tests/accept.mjs [-v]
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} } };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
require('../../../bio/bio.js');
const B = window.BioApp, verbose = process.argv.includes('-v');
// The same notes the builder (tools/bio/build_bio_questions.py META) leaves out.
const META = /\b(any|other|valid|correct|correctly|example|examples|named|explained|described|description|plausible|suitable|appropriate|reasonable|relevant|similar|equivalent|e\.g)\b/i;
let fails = 0, tried = 0;
for (const ch of [28, 29, 30, 31, 32]) {
  const src = JSON.parse(readFileSync(new URL(`../questions/ch${ch}.json`, import.meta.url)));
  const Q = window.BioQuestions[ch].questions;
  src.questions.forEach(q => {
    const bq = Q.find(x => x.id === q.id);
    if (!bq) return;
    q.parts.forEach((p, pi) => {
      const bp = bq.parts[pi];
      if (!bp || bp.kind !== 'text') return;
      p.points.forEach((pt, j) => (pt.accept || []).forEach(a => {
        if (META.test(a) || !bp.pts[j] || !bp.pts[j].k) return;
        tried++;
        if (!B.check(ch, q.id, pi, a)[j]) { fails++; console.log(`   FAIL ${ch} ${q.id}${p.label}: the scheme accepts "${a}" for "${pt.answer}"`); }
        else if (verbose) console.log(`   ${ch} ${q.id}${p.label}: "${a}"`);
      }));
    });
  });
}
console.log(fails ? `${fails} failures` : `ok: ${tried} answers the schemes accept all earn their point`);
process.exit(fails ? 1 : 0);

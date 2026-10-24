// Checks Exam drill's questions (bio/bio-drill.js): you first answer each by ticking a box; got right, it comes back
// later for you to type out; got wrong, it comes back as boxes again. The box marked right must be an answer that gets
// full marks in the exam, and no wrong box may.
//   New questions on parts of the course no exam has asked yet (tools/bio/drill/ch<N>.json): each exam-shaped
//   ({id, topic, q, marks, need, pts: [{a, accept, k}], right, wrong: [3], why}); its right box earns full marks (need
//   points) on its own keys, every wrong box and a vague answer earn less, each "accept" earns its point; every untested
//   topic of the chapter (tools/bio/questions/ch<N>.json not_covered, by index) has at least two.
//   Real exam questions and diagrams (when bio/bio-drill.js is there): every one it draws from the papers' quick checks
//   and Label sprint has a right box that earns full marks and no wrong box that does.
// Run: node tools/bio/tests/drill.mjs [-v] [chapter]
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
require('../../../bio/bio.js');
const B = window.BioApp, verbose = process.argv.includes('-v'), only = +process.argv.find(a => /^\d\d$/.test(a)) || 0;
let fails = 0, made = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
// Points an answer earns on a list of scheme points (the marker's rule: a point is earned when one of its key
// alternatives has enough of its word stems).
const earned = (text, pts) => { const w = B.words(text); return pts.filter(p => p.k && B.hasPoint(p, w)).length; };
const off = JSON.parse(readFileSync(new URL('../drill/off_spec.json', import.meta.url)));
for (const ch of [28, 29, 30, 31, 32].filter(c => !only || c === only)) {
  const src = new URL(`../drill/ch${ch}.json`, import.meta.url);
  if (!existsSync(src)) { fail(`chapter ${ch}: no new questions yet`); continue; }
  const list = JSON.parse(readFileSync(src)), topics = JSON.parse(readFileSync(new URL(`../questions/ch${ch}.json`, import.meta.url))).not_covered || [];
  if (list.length < 12 || list.length > 30) fail(`chapter ${ch}: ${list.length} questions (12 to 30)`);
  const seen = new Set(), per = topics.map(() => 0);
  list.forEach(it => {
    made++;
    const at = `${ch}/${it.id}`;
    if (!/^D\d\d-\d+$/.test(it.id || '') || seen.has(it.id)) fail(`${at}: id must be D${ch}-<n> and unique`);
    seen.add(it.id);
    if (!(it.topic >= 0 && it.topic < topics.length)) fail(`${at}: topic ${it.topic} isn't one of the ${topics.length} untested topics`); else per[it.topic]++;
    if (!it.q || it.q.length > 180 || !/[?.]$/.test(it.q) || /\(\d+ (points?|marks?)\)/.test(it.q)) fail(`${at}: the question must be one sentence or two, up to 180 letters, ending in ? or ., with no marks in it`);
    if (!(it.need >= 1 && it.need <= 2) || it.marks !== it.need * 3) fail(`${at}: need 1 or 2, and marks 3 a point (${it.marks} for ${it.need})`);
    if (!Array.isArray(it.pts) || it.pts.length < it.need) fail(`${at}: needs at least ${it.need} scheme points`);
    (it.pts || []).forEach((p, j) => {
      if (!p.a || !Array.isArray(p.k) || !p.k.length || !Array.isArray(p.accept)) fail(`${at}: point ${j + 1} needs a, accept (a list) and k`);
      (p.accept || []).forEach(a => { if (!B.hasPoint(p, B.words(a))) fail(`${at}: point ${j + 1} accepts "${a}" but its keys miss it`); });
    });
    if (!it.right || it.right.length > 80) fail(`${at}: the right box must be up to 80 letters`);
    if (!Array.isArray(it.wrong) || it.wrong.length !== 3 || new Set(it.wrong.map(w => w.toLowerCase())).size !== 3 || it.wrong.some(w => w.toLowerCase() === (it.right || '').toLowerCase())) fail(`${at}: needs 3 different wrong boxes, none the right one`);
    if (!it.why || it.why.length > 220) fail(`${at}: why must be there, up to 220 letters`);
    const got = earned(it.right || '', it.pts || []);
    if (got < it.need) fail(`${at}: the right box "${it.right}" earns ${got} of ${it.need} points`);
    (it.wrong || []).forEach(w => { const g = earned(w, it.pts || []); if (g >= it.need) fail(`${at}: the wrong box "${w}" would get full marks (${g} points)`); });
    ['I don\'t know', 'It helps the body work properly.', 'Blood, cells and organs.'].forEach(v => { if (earned(v, it.pts || []) >= it.need) fail(`${at}: a vague answer gets full marks: "${v}"`); });
    if (verbose) console.log(`   ${at} [${it.marks}] ${it.q}  ->  ${it.right}`);
  });
  per.forEach((n, i) => { if (n < 2) fail(`chapter ${ch}: untested topic ${i} has ${n} questions (at least 2): ${topics[i].slice(0, 80)}`); });
}
// The real exam questions and diagrams the drill draws from.
let real = 0;
if (existsSync(new URL('../../../bio/bio-drill.js', import.meta.url))) {
  for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/checks${ch}.js`);
  require('../../../bio/sprint.js');
  window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {}, host() {} };
  window.BioBoard = { pools() {}, nearMascot() {}, reveal() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
  require('../../../bio/drill.js');
  require('../../../bio/bio-drill.js');
  // Every part off_spec.json leaves out is a real part, so the list can't go stale unnoticed.
  for (const [ch, ids] of Object.entries(off.parts)) for (const id of Object.keys(ids)) {
    const [qid, k] = id.split(':'), q = (window.BioQuestions[ch].questions || []).find(x => x.id === qid);
    if (!q || !q.parts[+k]) fail(`off_spec.json: chapter ${ch} has no part ${id}`);
  }
  for (const ch of [28, 29, 30, 31, 32].filter(c => !only || c === only)) {
    window.BioDrill.items(ch).filter(it => it.kind !== 'new').forEach(it => {
      real++;
      // Only what the 2025 specification covers: an exam part that tests a learning outcome, a diagram part it names.
      if (it.kind === 'exam') {
        const [, qid, k] = it.id.split(':'), part = window.BioQuestions[ch].questions.find(x => x.id === qid).parts[k];
        if (!part.out) fail(`${ch} ${it.id}: an old-course part (no learning outcome)`);
      }
      if (off.parts[ch] && off.parts[ch][it.id.replace(/^e\d\d:/, '')]) fail(`${ch} ${it.id}: off the specification (off_spec.json)`);
      if (it.kind === 'diagram' && off.labels[it.right]) fail(`${ch} ${it.id}: "${it.right}" isn't on the specification`);
      if (it.earned(it.right) < it.need) fail(`${ch} ${it.id}: the right box "${it.right}" doesn't get full marks`);
      it.wrong.forEach(w => { if (it.earned(w) >= it.need) fail(`${ch} ${it.id}: the wrong box "${w}" would get full marks`); });
    });
  }
}
console.log(fails ? `${fails} failures` : `ok: ${made} new questions${real ? `, ${real} from the real papers and diagrams` : ''}`);
process.exit(fails ? 1 : 0);

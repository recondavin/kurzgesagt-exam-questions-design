// Checks the trivia board's questions (bio/bio-board.js): every quick check says whether it makes sense alone
// ("board": true, false, or the question rewritten with the context it needs; the user: "make them all make sense"),
// what's left still has plenty in every chapter, and every typed (wedge) question's own right answer earns the points it asks for, marked like the sheet.
// Questions sit on the board under what they're about (topicOf): a question on the pulmonary vein filed under
// Breathing is a Circulation question.
// Run: node tools/bio/tests/board.mjs
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} } };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) { require(`../../../bio/q${ch}.js`); require(`../../../bio/checks${ch}.js`); }
require('../../../bio/bio.js');
const src = readFileSync(new URL('../../../bio/bio-board.js', import.meta.url), 'utf8');
const PIC = eval(src.match(/var PIC = (\/.*\/);/)[1]);
const needsPaper = eval('(' + src.match(/function needsPaper\(c\) \{[\s\S]*?\n  \}/)[0] + ')');
const topicOf = eval('(' + src.match(/function topicOf\(c, ch\) \{[\s\S]*?\n  \}/)[0] + ')');
const B = window.BioApp;
const board = { 28: [0, 0], 29: [0, 0], 30: [0, 0], 31: [0, 0], 32: [0, 0] };
let fails = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
for (const ch of [28, 29, 30, 31, 32]) {
  let mc = 0, typed = 0;
  for (const q of window.BioQuestions[ch].questions) (window.BioChecks[ch][q.id] || []).forEach((c, k) => {
    if (!('board' in c)) fail(`${ch}/${q.id} part ${k + 1}: no "board" (does it make sense alone?)`);
    if (c.board === false || (c.board == null && needsPaper(c))) return;
    const text = typeof c.board === 'string' ? c.board : c.q;
    if (typeof c.board === 'string' && (c.board.length < 10 || c.board.length > 160)) fail(`${ch}/${q.id} part ${k + 1}: board question length ${c.board.length}`);
    mc++;
    const home = topicOf({ q: text, right: c.right }, ch);
    board[home][0]++;
    if (/brings blood back to the heart from the lungs/.test(text) && home !== 31) fail(`${ch}/${q.id}: "${c.q}" is on a ${home} square, not Circulation`);
    // A rewritten question can name its own letters ("vaccinated (A) and later infected (B)").
    if (typeof c.board !== 'string' && /\(([A-Z])\)|\b(on|in) the diagram\b/.test(text)) fail(`${ch}/${q.id} part ${k + 1} kept but points at the paper: ${text}`);
    const p = q.parts[k], keyed = p && p.kind === 'text' ? p.pts.filter(t => t.k && !t.self).length : 0;
    if (!keyed || /^(True|False)$/.test(c.right)) return;
    typed++;
    board[home][1]++;
    const m = c.q.match(/\((\d) points\)$/), want = Math.min(m ? +m[1] : 1, keyed, p.n || 1);
    const got = B.check(ch, q.id, k, c.right).filter(Boolean).length;
    if (got < want) fail(`${ch}/${q.id} part ${k + 1}: its own answer earns ${got} of ${want}`);
  });
}
for (const ch of [28, 29, 30, 31, 32]) {
  if (board[ch][0] < 30) fail(`chapter ${ch}: only ${board[ch][0]} questions on its squares`);
  if (board[ch][1] < 20) fail(`chapter ${ch}: only ${board[ch][1]} wedge questions`);
  console.log(`   ${ch}: ${board[ch][0]} questions on its squares, ${board[ch][1]} wedge questions`);
}
console.log(fails ? `${fails} failures` : 'ok: the board has questions for every chapter');
process.exit(fails ? 1 : 0);

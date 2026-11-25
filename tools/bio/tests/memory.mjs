// Checks the memory every question game shares with Exam drill (bio/bio-board.js: memNext, memRecord, memOrder; the
// user: "it repeats ones you got wrong and the ones you got right it makes you type it out", "do it for every
// minigame", then "take the answers the student got wrong in the exam questions or in games previously and hammer them
// with it in the minigames"):
//   A question you get wrong comes first, as boxes, after two others, ahead of every new one and every one due to type,
//   with a line saying you got it wrong; it keeps coming till it's right twice in a row.
//   One you get right in the boxes comes back typed after five others (even where the game wanted boxes).
//   Typed with full marks it's learnt and comes after the new ones; typed short of that, it's boxes again.
//   One that can't be typed is learnt once it's right.
//   A typed slot (a wedge, a big shell) takes one due to type first.
//   The grid's columns are dealt in the same order, with one due to type kept for the typed cells.
//   Right in the boxes keeps a learnt one learnt.
//   Match pairs, Spot the mistake, Label sprint and Don't Say It: what you missed comes first next time.
//   The ids are Exam drill's, so what you do in a game counts in the drill and the other way round.
//   Wrong in the exam question on the desk (bio.js): it comes first in the games, saying so. Maths and Computer
//   Science: the desk saves the part ('x' + question : part), and every card made from it comes first.
// Run: node tools/bio/tests/memory.mjs
import { createRequire } from 'module';
import { existsSync as __exists } from 'fs';
// Biology's chapters: 28-32, and 33 and 34 once their questions, checks and learn content are built.
const BIO_CHAPTERS = [28, 29, 30, 31, 32, 33, 34].filter(n => ['q', 'checks', 'learn'].every(f => __exists(new URL(`../../../bio/${f}${n}.js`, import.meta.url))));
const require = createRequire(import.meta.url);
const saved = {};
global.window = { ExamAnswerMode: { kit: { store(k, v) { if (v == null) return saved[k] == null ? null : saved[k]; saved[k] = v; return null; }, later() {} } }, addEventListener() {},
  localStorage: { getItem: k => saved[k] == null ? null : saved[k], setItem(k, v) { saved[k] = String(v); } } };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of BIO_CHAPTERS) { require(`../../../bio/q${ch}.js`); require(`../../../bio/checks${ch}.js`); }
require('../../../bio/bio.js');
let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
window.BioKit = { esc: String, shuffle: a => a.slice(), pick: a => a[Math.floor(rand() * a.length)], body() {}, buttons() {}, host() {} };
require('../../../bio/bio-board.js');
const BB = window.BioBoard;
let fails = 0, n = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
const stage = item => (JSON.parse(saved['bio-drill'] || '{}')[BB.memKey(item)] || {}).s;
const P = BB.pools(), CH = 31, S = {};
// Answers every question right in the boxes except the ones listed wrong; follows what comes back.
function play(rounds, wrongKeys, typedOk) {
  const log = [];
  for (let i = 0; i < rounds; i++) {
    const m = BB.memNext(S, P, CH, false), key = BB.memKey(m.item);
    const ok = m.typed ? typedOk : !wrongKeys.has(key);
    BB.memRecord(P, m.item, m.typed, ok);
    log.push({ key, typed: m.typed, ok, item: m.item, again: m.again });
  }
  return log;
}
// 1. A wrong one comes back as boxes after two others, ahead of new ones, saying so; wrong again, the same.
{
  const first = BB.memNext(S, P, CH, false);
  n++;
  if (first.typed) fail('a new question came typed');
  if (first.again) fail('a new question says you got it wrong');
  BB.memRecord(P, first.item, false, false);
  if (stage(first.item) !== 'box') fail(`a wrong answer saved "${stage(first.item)}", not box`);
  const key = BB.memKey(first.item), log = play(6, new Set([key]), true);
  const at = log.map((l, i) => l.key === key ? i : -1).filter(i => i >= 0);
  n++;
  if (at[0] !== 2) fail(`the wrong one came back after ${at[0]} others, not 2`);
  else if (log[at[0]].typed) fail('the wrong one came back typed, not as boxes');
  else if (!/wrong before/.test(log[at[0]].again || '')) fail(`the wrong one came back without its line: "${log[at[0]].again}"`);
  n++;
  if (at[1] !== 5) fail(`wrong again, it came back after ${at[1] - at[0] - 1} others, not 2`);
  else if (!/\(2 times\)/.test(log[at[1]].again || '')) fail(`the second time back it doesn't count the misses: "${log[at[1]].again}"`);
  // Right once: still on the list, once more; right twice: off it.
  const again = play(3, new Set(), true), back = again.map((l, i) => l.key === key ? i : -1).filter(i => i >= 0);
  n++;
  if (back[0] !== 2) fail(`the wrong one came back after ${back[0]} others, not 2`);
  else if (stage(first.item) !== 'box') fail(`right once after wrong it saved "${stage(first.item)}", not box (it needs two)`);
  const last = play(3, new Set(), true), more = last.findIndex(l => l.key === key);
  n++;
  if (more !== 2) fail(`right once, it came back after ${more} others, not 2`);
  else if (!/off your list/.test(last[more].again || '')) fail(`the last time it doesn't say it's the last: "${last[more].again}"`);
  const typeable = P[CH].typed.some(t => BB.memKey(t) === key);
  n++;
  if (stage(first.item) !== (typeable ? 'type' : 'done')) fail(`right twice it saved "${stage(first.item)}"`);
}
// 2. A right one comes back typed after five others; typed right it's learnt.
{
  const CH2 = 32, S2 = {}, first = BB.memNext(S2, P, CH2, false);
  BB.memRecord(P, first.item, false, true);
  const typeable = P[CH2].typed.some(t => BB.memKey(t) === BB.memKey(first.item));
  n++;
  if (stage(first.item) !== (typeable ? 'type' : 'done')) fail(`a right box saved "${stage(first.item)}"`);
  if (typeable) {
    const key = BB.memKey(first.item), log = [];
    for (let i = 0; i < 8; i++) {
      const m = BB.memNext(S2, P, CH2, false);
      BB.memRecord(P, m.item, m.typed, true);
      log.push({ key: BB.memKey(m.item), typed: m.typed });
    }
    const at = log.findIndex(l => l.key === key);
    n++;
    if (at !== 5) fail(`the right one came back after ${at} others, not 5`);
    else if (!log[at].typed) fail('the right one came back as boxes, not typed');
    n++;
    if (stage(first.item) !== 'done') fail(`typed right it saved "${stage(first.item)}", not done`);
  }
}
// 3. Typed short of full marks: boxes again. Can't be typed: learnt once right.
{
  const t = P[30].typed[0];
  BB.memRecord(P, t, true, false);
  n++;
  if (stage(t) !== 'box') fail(`typed wrong saved "${stage(t)}", not box`);
  const tf = P[30].mc.find(i => !P[30].typed.some(x => BB.memKey(x) === BB.memKey(i)));
  if (tf) { BB.memRecord(P, tf, false, true); n++; if (stage(tf) !== 'done') fail(`a right box that can't be typed saved "${stage(tf)}"`); }
}
// 4. A typed slot takes one due to type first; learnt ones come after new ones.
{
  const t = P[29].typed[5], d = P[29].mc[3];
  BB.memRecord(P, t, false, true);
  BB.memRecord(P, d, true, true);
  const m = BB.memNext({}, P, 29, true);
  n++;
  if (BB.memKey(m.item) !== BB.memKey(t) || !m.typed) fail('a typed slot didn\'t take the question due to type');
  const order = BB.memOrder(P, P[29].mc, false), at = order.findIndex(i => BB.memKey(i) === BB.memKey(d)), news = order.filter(i => !stage(i)).length;
  n++;
  if (at < news) fail(`a learnt question is dealt at ${at}, before the ${news} new ones`);
  const box = BB.memOrder(P, P[29].mc, false).findIndex(i => BB.memKey(i) === BB.memKey(t)), typed = BB.memOrder(P, P[29].typed, true)[0];
  n++;
  if (BB.memKey(typed) !== BB.memKey(t)) fail('the grid\'s typed cells aren\'t dealt the question due to type first');
  if (box < news) fail('the grid deals a question due to type into a box cell before the new ones');
  const w = P[29].mc[7];
  BB.memRecord(P, w, false, false);
  n++;
  if (BB.memKey(BB.memOrder(P, P[29].mc, false)[0]) !== BB.memKey(w)) fail('the grid doesn\'t deal the one you got wrong first');
}
// 4b. Right in the boxes keeps a learnt question learnt (it doesn't go back to typing).
{
  const d = P[28].typed[2];
  BB.memRecord(P, d, true, true);
  BB.memRecord(P, d, false, true);
  n++;
  if (stage(d) !== 'done') fail(`a learnt question right again in the boxes saved "${stage(d)}"`);
}
// 4c. The other games: what you missed comes first next time; right takes it off.
{
  const list = ['a', 'b', 'c', 'd'];
  BB.missMark('test', 'c', false);
  BB.missMark('test', 'd', false);
  n++;
  if (BB.missFirst('test', list, x => x).join('') !== 'cdab') fail(`missed ones aren't first: ${BB.missFirst('test', list, x => x).join('')}`);
  BB.missMark('test', 'c', true);
  n++;
  if (BB.missFirst('test', list, x => x).join('') !== 'dabc') fail('a missed one got right stays first');
}
// 5. The ids are Exam drill's.
{
  window.BioDrillNew = {};
  require('../../../bio/sprint.js');
  require('../../../bio/bio-drill.js');
  const ids = new Set(); BIO_CHAPTERS.forEach(ch => P[ch].typed.forEach(t => ids.add(BB.memKey(t))));
  const drill = BIO_CHAPTERS.flatMap(ch => window.BioDrill.items(ch)).filter(it => it.kind === 'exam');
  const shared = drill.filter(it => ids.has(it.id)).length;
  n++;
  if (shared < drill.length * 0.5) fail(`only ${shared} of the drill's ${drill.length} exam questions have the games' ids`);
}
// 6. Wrong in the exam question on the desk: it comes first in the games, saying it was the exam question.
{
  const C6 = BIO_CHAPTERS[BIO_CHAPTERS.length - 1], it = P[C6].mc[4], S6 = {};
  window.BioApp.missedCheck(it.src, it.qid, it.k);
  const m = BB.memNext(S6, P, C6, false);
  n++;
  if (BB.memKey(m.item) !== BB.memKey(it)) fail(`a part wrong on the desk didn't come first in the game: ${BB.memKey(it)} ${JSON.stringify(JSON.parse(saved["bio-drill"])[BB.memKey(it)])} got ${BB.memKey(m.item)} ${stage(m.item)}`);
  else if (!/in the exam question/.test(m.again)) fail(`a part wrong on the desk came without its line: "${m.again}"`);
}
// 7. Maths and Computer Science: the desk saves the part; every card made from it comes first, till its own answer is
// newer. Right on the desk doesn't take off a card you got wrong in a game.
{
  const card = (id) => ({ ch: 28, src: 't', qid: id, k: 0, part: id.replace(/:[^:]*$/, ''), text: id, c: { q: id, right: 'a', wrong: ['b', 'c', 'd'] } });
  const a1 = card('Q1:(a):1'), a2 = card('Q1:(a):2'), b1 = card('Q1:(b):1'), F = { 28: { mc: [b1, a1, a2], typed: [] } };
  const st = JSON.parse(saved['bio-drill'] || '{}');
  st['xQ1:(a)'] = { s: 'box', m: 1, h: 2, x: 1, t: Date.now() };
  saved['bio-drill'] = JSON.stringify(st);
  const S7 = {}, got = [0, 1, 2].map(() => { const m = BB.memNext(S7, F, 28, false); return { key: BB.memKey(m.item), again: m.again }; });
  n++;
  if (got[0].key === BB.memKey(b1) || got[1].key === BB.memKey(b1)) fail('a card from a part wrong on the desk didn\'t come first');
  else if (!/in the exam question/.test(got[0].again)) fail(`a card from a part wrong on the desk came without its line: "${got[0].again}"`);
  const later = Date.now() + 5;
  BB.memRecord(F, a1, false, true);
  const own = JSON.parse(saved['bio-drill'])[BB.memKey(a1)];
  n++;
  if (!own || own.s !== 'box' || own.h !== 1) fail(`a card right once after its part was wrong saved ${JSON.stringify(own)}, not box once more`);
  BB.memRecord(F, b1, false, false);
  const st2 = JSON.parse(saved['bio-drill']);
  st2['xQ1:(b)'] = { s: 'done', t: later + 1000 };
  saved['bio-drill'] = JSON.stringify(st2);
  n++;
  if (!BB.memWrong(b1)) fail('right on the desk took off a card you got wrong in a game');
}
console.log(fails ? `${fails} failures` : `ok: ${n} checks: wrong ones come back as boxes, right ones typed, typed right is learnt, shared with Exam drill`);
process.exit(fails ? 1 : 0);

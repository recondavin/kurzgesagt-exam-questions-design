// Checks the memory every question game shares with Exam drill (bio/bio-board.js: memNext, memRecord, memOrder; the
// user: "it repeats ones you got wrong and the ones you got right it makes you type it out", "do it for every
// minigame"):
//   A question you get wrong in the boxes comes back as boxes after three others, before any new one.
//   One you get right in the boxes comes back typed after five others (even where the game wanted boxes).
//   Typed with full marks it's learnt and comes after the new ones; typed short of that, it's boxes again.
//   One that can't be typed is learnt once it's right.
//   A typed slot (a wedge, a big shell) takes one due to type first.
//   The grid's columns are dealt in the same order, with one due to type kept for the typed cells.
//   Right in the boxes keeps a learnt one learnt.
//   Match pairs, Spot the mistake, Label sprint and Don't Say It: what you missed comes first next time.
//   The ids are Exam drill's, so what you do in a game counts in the drill and the other way round.
// Run: node tools/bio/tests/memory.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const saved = {};
global.window = { ExamAnswerMode: { kit: { store(k, v) { if (v == null) return saved[k] == null ? null : saved[k]; saved[k] = v; return null; }, later() {} } }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) { require(`../../../bio/q${ch}.js`); require(`../../../bio/checks${ch}.js`); }
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
    log.push({ key, typed: m.typed, ok, item: m.item });
  }
  return log;
}
// 1. A wrong one comes back as boxes after three others, ahead of new ones.
{
  const first = BB.memNext(S, P, CH, false);
  n++;
  if (first.typed) fail('a new question came typed');
  BB.memRecord(P, first.item, false, false);
  if (stage(first.item) !== 'box') fail(`a wrong answer saved "${stage(first.item)}", not box`);
  const key = BB.memKey(first.item), log = play(6, new Set([key]), true);
  const at = log.findIndex(l => l.key === key);
  n++;
  if (at !== 3) fail(`the wrong one came back after ${at} others, not 3`);
  else if (log[at].typed) fail('the wrong one came back typed, not as boxes');
}
// 2. A right one comes back typed after five others; typed right it's learnt.
{
  const S2 = {}, first = BB.memNext(S2, P, CH, false);
  while (BB.memRecord(P, first.item, false, true) && !P[CH].typed.some(t => BB.memKey(t) === BB.memKey(first.item))) break;
  const typeable = P[CH].typed.some(t => BB.memKey(t) === BB.memKey(first.item));
  n++;
  if (stage(first.item) !== (typeable ? 'type' : 'done')) fail(`a right box saved "${stage(first.item)}"`);
  if (typeable) {
    const key = BB.memKey(first.item), log = [];
    for (let i = 0; i < 8; i++) {
      const m = BB.memNext(S2, P, CH, false);
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
  const ids = new Set(); [28, 29, 30, 31, 32].forEach(ch => P[ch].typed.forEach(t => ids.add(BB.memKey(t))));
  const drill = [28, 29, 30, 31, 32].flatMap(ch => window.BioDrill.items(ch)).filter(it => it.kind === 'exam');
  const shared = drill.filter(it => ids.has(it.id)).length;
  n++;
  if (shared < drill.length * 0.5) fail(`only ${shared} of the drill's ${drill.length} exam questions have the games' ids`);
}
console.log(fails ? `${fails} failures` : `ok: ${n} checks: wrong ones come back as boxes, right ones typed, typed right is learnt, shared with Exam drill`);
process.exit(fails ? 1 : 0);

// Checks Make your own games (bio/bio-maker.js, its asset library bio/maker-assets.js):
//   Links      every game made of the cards goes into a link and comes back the same; a broken or altered link (bad
//              base64, unknown cards, a name with markup, things off the picture, parts that don't exist) still
//              gives a game made of real cards; a link from the first version (characters and places by number)
//              still opens.
//   Rules      in every world, with every card: right answers alone always win, in no more answers than the size; a
//              wrong answer does what its card says; "Lose a life" loses after three; in a Race where he moves, enough
//              wrong answers mean he catches you; scores and hearts never go below zero.
//   Assets     every character (in every colour), every part of a designed one, every opponent, place and thing
//              draws as whole SVG (every tag closed, no "undefined" or "NaN").
//   Questions  every source in every chapter has questions of its kind: shorter (one point, real papers), longer (two
//              or more, real papers), new-course, diagrams; every question's right answer earns full marks by its
//              scheme points, no wrong answer does, and its own right answer isn't cancelled; a diagram can be tapped
//              on its own diagram; "What I got wrong" asks exactly the ones you got wrong, and with none it says so
//              and asks them all.
//   Memory     the shared memory (Exam drill's 'bio-drill'): a wrong one comes back as options three questions on; a
//              right one comes back typed five on (typing sometimes); typing never or always is kept to.
// Run: node tools/bio/tests/maker.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const saved = {};
global.window = { ExamAnswerMode: { kit: { store(k, v) { if (v == null) return saved[k] == null ? null : saved[k]; saved[k] = v; return null; }, later() {} } }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
global.location = { origin: 'https://example.org', pathname: '/biology.html' };
global.btoa = s => Buffer.from(s, 'binary').toString('base64');
global.atob = s => Buffer.from(s, 'base64').toString('binary');
for (const ch of [28, 29, 30, 31, 32]) { require(`../../../bio/q${ch}.js`); require(`../../../bio/checks${ch}.js`); }
require('../../../bio/bio.js');
require('../../../bio/sprint.js');
require('../../../bio/drill.js');
window.BioKit = { esc: String, shuffle: a => a.slice(), pick: a => a[0], buttons() {}, body() {}, host() {} };
require('../../../bio/bio-board.js');
require('../../../bio/bio-drill.js');
require('../../../bio/maker-assets.js');
require('../../../bio/bio-maker.js');
const T = window.BioMaker.test, A = window.BioMakerArt, D = window.BioDrill;
let fails = 0, n = 0;
const fail = msg => { fails++; if (fails < 40) console.log('   FAIL', msg); };

// ---------------------------------------------------------------- links
let k = 0;
for (const w of Object.keys(T.WORLDS)) {
  const W = T.WORLDS[w];
  for (const r of W.right) for (const x of W.wrong) for (const s of W.size) {
    k++;
    const g = T.clean({ n: 'Héllo game ' + k, src: T.SOURCES[k % 6][0], ans: T.ANSWERS[k % 4][0], t: k % 3, f: (k + 1) % 3, o: 2 + k % 3, ch: [29, 31],
      w, r: r[0], x: x[0], s, p: k % 5 ? A.players[k % A.players.length].id : 'make', d: [k % 8, k % 8, k % 7, k % 12, k % 6], c: k % 10,
      op: k % 4 ? A.rivals[k % A.rivals.length].id : 'make', od: [(k + 3) % 8, k % 8, (k + 1) % 7, (k + 2) % 12, k % 6], oc: (k + 5) % 10,
      pl: A.places[k % A.places.length].id, th: [['star', 20, 30], ['tree', 80, 84]], e: k % 3 });
    const back = T.decode(T.encode(g));
    n++;
    if (JSON.stringify(back) !== JSON.stringify(g)) fail(`${w}/${r[0]}/${x[0]}/${s}: the link gives back ${JSON.stringify(back)}`);
  }
}
{
  n += 4;
  if (T.decode('%%%not base64') !== null) fail('a broken link should give nothing');
  const g = T.decode(T.encode({ n: '<img src=x onerror=alert(1)>', src: 'everything', ans: 'essay', t: 7, f: -1, o: 9, w: 'lava', r: 'fly', x: 'boom', s: 99, p: 'dragon', d: [99, -1, 'x'], c: 40,
    op: 'shark', pl: 'mars', th: [['bomb', 1, 1], ['star', -50, 400], 'x', ['tree', 50]], e: 9, ch: [1, 2] }));
  const d = T.defaults();
  if (!g || /[<>]/.test(g.n) || g.src !== d.src || g.ans !== d.ans || g.t !== d.t || g.f !== d.f || g.o !== d.o || g.w !== 'race' || g.r !== 'step1' || g.x !== 'him1' || g.s !== 8 ||
    g.p !== d.p || g.d.join() !== '0,0,0,0,0' || g.c !== 0 || g.op !== d.op || g.pl !== d.pl || g.e !== 1 || g.ch.length !== 5)
    fail(`an altered link should fall back to real cards: ${JSON.stringify(g)}`);
  if (!g || JSON.stringify(g.th) !== JSON.stringify([['star', 3, 84], ['tree', 50, 84]])) fail(`things off the picture should come back on it: ${JSON.stringify(g && g.th)}`);
  const seven = T.clean({ th: new Array(9).fill(['rock', 50, 84]) });
  if (seven.th.length !== 6) fail(`a world takes at most 6 things, not ${seven.th.length}`);
  const old = T.decode(Buffer.from(JSON.stringify({ v: 1, n: 'Old', w: 'battle', r: 'hit1', x: 'hurt1', s: 5, c: 2, a: 2, b: 2, e: 0, ch: [30], q: 'type' })).toString('base64'));
  if (!old || old.p !== 'cat' || old.pl !== 'night' || old.ans !== 'type' || old.w !== 'battle' || old.c !== 2 || old.ch.join() !== '30') fail(`a first-version link doesn't open as it was: ${JSON.stringify(old)}`);
  const mix = T.clean({ v: 1, q: 'mix' });
  if (mix.ans !== 'own' || mix.t !== 1 || mix.f !== 0) fail(`a first-version "boxes and typed" game isn't typing sometimes with no diagrams: ${JSON.stringify(mix)}`);
}

// ---------------------------------------------------------------- rules
for (const w of Object.keys(T.WORLDS)) {
  const W = T.WORLDS[w];
  for (const r of W.right) for (const x of W.wrong) for (const s of W.size) {
    const g = T.clean({ w, r: r[0], x: x[0], s });
    for (const typed of [false, true]) {
      let st = T.fresh(g), k = 0;
      while (!T.over(g, st) && k < s + 1) { st = T.step(g, st, true, typed).st; k++; }
      n++;
      if (T.over(g, st) !== 'win') fail(`${w}/${r[0]}/${x[0]}/${s}: ${k} right answers${typed ? ' (typed)' : ''} didn't win`);
      const most = w === 'points' ? Math.ceil(s / 100) : s;
      if (k > most) fail(`${w}/${r[0]}: took ${k} right answers, more than ${most}`);
    }
    let st = T.fresh(g), k = 0;
    while (!T.over(g, st) && k < 40) { st = T.step(g, st, false, false).st; k++; }
    n++;
    if (st.you < 0 || st.him < -2 || st.lives < 0) fail(`${w}/${x[0]}: a count went below zero ${JSON.stringify(st)}`);
    if (x[0] === 'life' && (T.over(g, st) !== 'lose' || k !== 3)) fail(`${w}/life: lost after ${k} wrong answers (${T.over(g, st)}), not 3`);
    if (w === 'race' && x[0] === 'him1' && T.over(g, st) !== 'lose') fail('race/him1: wrong answers never let him catch you');
    if (w === 'battle' && x[0] === 'hurt1' && (T.over(g, st) !== 'lose' || k !== s)) fail(`battle/hurt1: lost after ${k}, not ${s}`);
    if (['back1', 'fall1', 'm50', 'save', 'wilt'].indexOf(x[0]) >= 0 && T.over(g, st)) fail(`${w}/${x[0]}: wrong answers alone ended the game`);
    if (x[0] === 'hgoal' && (T.over(g, st) !== 'lose' || k !== s)) fail(`shoot/hgoal: lost after ${k} of his goals, not ${s}`);
  }
}
{
  const say = (w, x) => T.step(T.clean({ w, x }), T.fresh(T.clean({ w, x })), false, false).said;
  n++;
  if (say('race', 'him1') !== 'He moves a step closer.' || say('battle', 'hurt1') !== 'He hits you.' || say('tower', 'life') !== 'You lose a life.' ||
    say('shoot', 'save') !== 'He saves it.' || say('shoot', 'hgoal') !== 'He scores.' || say('grow', 'wilt') !== 'Nothing to fall off yet.') fail('wrong-answer cards say the wrong thing');
  n++;
  if (Object.keys(T.WORLDS).length < 6) fail('fewer than six kinds of game');
}

// ---------------------------------------------------------------- assets
// Whole SVG: every opened tag closed, in order.
function whole(svg, what) {
  n++;
  if (/undefined|NaN/.test(svg)) return fail(`${what}: draws "undefined" or "NaN"`);
  const stack = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (!m[1]) stack.push(m[2]);
    else if (stack.pop() !== m[2]) return fail(`${what}: </${m[2]}> doesn't close what's open`);
  }
  if (stack.length) fail(`${what}: <${stack.join('>, <')}> left open`);
}
A.players.forEach(p => A.colours.forEach((c, i) => whole(A.playerSvg({ p: p.id, c: i }, 64), `character ${p.id} in ${A.colourNames[i]}`)));
['body', 'eyes', 'mouth', 'top', 'extra'].forEach((row, ri) => A.parts[row].forEach((part, pi) => {
  A.parts.body.forEach((b, bi) => {
    const d = [bi, 0, 0, 0, 0]; d[ri] = pi;
    whole(A.playerSvg({ p: 'make', d, c: (pi + bi) % 10 }, 64), `designed: ${row} ${part} on ${b}`);
    whole(A.partSvg(row, d, 3, 58), `part button: ${row} ${part} on ${b}`);
  });
  n++;
  if (!A.partName(row, part)) fail(`${row} ${part} has no name`);
}));
A.rivals.forEach(r => { if (r.id !== 'examiner') whole(A.rivalSvg(r.id, 64), `opponent ${r.id}`); });
A.places.forEach(p => whole(A.placeSvg(p.id), `place ${p.id}`));
A.things.forEach(t => whole(A.thingSvg(t.id), `thing ${t.id}`));
n++;
if (A.players.length < 16 || A.rivals.length < 6 || A.places.length < 12 || A.things.length < 18) fail('the library is smaller than it should be');
A.players.forEach(p => { n++; if (A.playerColour[p.id] == null) fail(`character ${p.id} has no colour of its own`); });
// The world draws for every world with every place and the things on it, from the start to the end (Grow's flower).
Object.keys(T.WORLDS).forEach(w => A.places.forEach((p, i) => {
  const g = T.clean({ w, pl: p.id, th: [['star', 20, 26]], x: 'life', op: i % 2 ? 'make' : A.rivals[i % A.rivals.length].id });
  let st = T.fresh(g);
  whole(T.worldHtml(g, st), `world ${w} in ${p.id}`);
  while (!T.over(g, st)) st = T.step(g, st, true, true).st;
  whole(T.worldHtml(g, st), `world ${w} in ${p.id}, won`);
}));

// ---------------------------------------------------------------- questions
const bank = T.bank();
const byKind = {};
bank.forEach(it => { byKind[it.kind] = (byKind[it.kind] || 0) + 1; });
n++;
if (!(byKind.exam > 250 && byKind.diagram > 80 && byKind.new > 80 && byKind.long > 5)) fail(`too few questions: ${JSON.stringify(byKind)}`);
const ids = new Set();
bank.forEach(it => {
  n++;
  if (ids.has(it.id)) fail(`${it.id} is in the bank twice`);
  ids.add(it.id);
  if (it.earned(it.right) < it.need) fail(`${it.id}: its right answer "${it.right}" doesn't earn full marks`);
  const w = it.wrong.find(x => it.earned(x) >= it.need);
  if (w) fail(`${it.id}: the wrong answer "${w}" earns full marks`);
  if (D.cancelled(it, it.right)) fail(`${it.id}: its right answer is cancelled`);
  if (it.wrong.length < 3) fail(`${it.id}: only ${it.wrong.length} wrong options`);
  if (it.kind === 'diagram') {
    const spots = T.tapSpots(it);
    if (spots.indexOf(it.spot) < 0) fail(`${it.id}: its part isn't one to tap`);
  }
});
for (const ch of [[28], [29], [30], [31], [32], [28, 29, 30, 31, 32]]) {
  const kinds = {
    short: it => it.kind === 'exam' && it.need === 1, long: it => it.kind !== 'new' && it.kind !== 'diagram' && it.size === 'long', new: it => it.kind === 'new', all: it => it.kind !== 'diagram'
  };
  for (const src of Object.keys(kinds)) {
    const Q = T.questionsFor(T.clean({ src, ans: 'box', ch }));
    n++;
    if (!Q.main.length) fail(`${src} in ${ch}: no questions`);
    const odd = Q.main.find(it => !kinds[src](it) || ch.indexOf(it.ch) < 0);
    if (odd) fail(`${src} in ${ch}: asks ${odd.id} (${odd.kind}, ${odd.need} points, chapter ${odd.ch})`);
    if (Q.figs.length) fail(`${src} in ${ch}: diagrams mixed in without asking for them`);
  }
  const F = T.questionsFor(T.clean({ src: 'short', ans: 'fig', ch }));
  n++;
  if (!F.main.length || F.main.some(it => it.kind !== 'diagram')) fail(`diagrams in ${ch}: ${F.main.length} questions, not all diagrams`);
  const O = T.questionsFor(T.clean({ src: 'long', ans: 'own', f: 2, ch }));
  n++;
  if (!O.main.length || !O.figs.length || O.figs.some(it => it.kind !== 'diagram')) fail(`design your own with diagrams in ${ch}: ${O.main.length} questions, ${O.figs.length} diagrams`);
  const none = T.questionsFor(T.clean({ src: 'long', ans: 'own', f: 0, ch }));
  if (none.figs.length) fail(`design your own with no diagrams in ${ch}: diagrams mixed in`);
}
// What I got wrong / haven't done: by the shared memory.
{
  for (const k of Object.keys(saved)) delete saved[k];
  const W0 = T.questionsFor(T.clean({ src: 'wrong', ans: 'box', ch: [31] }));
  n++;
  if (!W0.note || !W0.main.length) fail('with nothing wrong yet, "What I got wrong" should say so and ask them all');
  const some = bank.filter(it => it.ch === 31 && it.kind === 'exam').slice(0, 4), st = {};
  some.forEach(it => { st[it.id] = { s: 'box', t: 1 }; });
  st[bank.filter(it => it.ch === 31 && it.kind === 'exam')[5].id] = { s: 'done', t: 1 };
  saved['bio-drill'] = JSON.stringify(st);
  const W1 = T.questionsFor(T.clean({ src: 'wrong', ans: 'box', ch: [31] }));
  n++;
  if (W1.note || W1.main.map(it => it.id).sort().join() !== some.map(it => it.id).sort().join()) fail(`"What I got wrong" asks ${W1.main.length}, not the ${some.length} got wrong`);
  const F1 = T.questionsFor(T.clean({ src: 'fresh', ans: 'box', ch: [31] }));
  n++;
  if (F1.main.some(it => st[it.id])) fail('"What I haven\'t done" asks one already done');
}
// The memory: a wrong one comes back as options three questions on; a right one comes back typed five on.
{
  for (const k of Object.keys(saved)) delete saved[k];
  const g = T.clean({ src: 'short', ans: 'own', t: 1, f: 0, ch: [30] }), S = { asked: 0, recent: {}, qs: T.questionsFor(g) };
  const ask = () => { const m = T.nextQuestion(S, g); S.asked += 1; return m; };
  const first = ask();
  window.BioBoard.memSet(first.it.id, first.typed, false, true);
  const log = [];
  for (let i = 0; i < 6; i++) { const m = ask(); log.push(m); window.BioBoard.memSet(m.it.id, m.typed, true, true); }
  const at = log.findIndex(m => m.it.id === first.it.id);
  n++;
  if (at !== 3) fail(`a wrong one came back after ${at} others, not 3`);
  else if (log[at].typed) fail('a wrong one came back typed, not as options');
  // log[0] was right as options: it comes back typed after five others.
  const right = log.find(m => !m.typed && m.it.id !== first.it.id), more = [];
  for (let i = 0; i < 8; i++) { const m = ask(); more.push(m); window.BioBoard.memSet(m.it.id, m.typed, true, true); }
  const all = log.concat(more), from = all.indexOf(right), back = all.findIndex((m, i) => i > from && m.it.id === right.it.id);
  n++;
  if (back < 0) fail('a right one never came back to type');
  else if (!all[back].typed) fail('a right one came back as options, not typed');
  else if (back - from - 1 < 5) fail(`a right one came back after ${back - from - 1} others, before 5`);
  for (const [t, want] of [[0, false], [2, true]]) {
    const g2 = T.clean({ src: 'short', ans: 'own', t, f: 0, ch: [29] }), S2 = { asked: 0, recent: {}, qs: T.questionsFor(g2) };
    let odd = 0;
    for (let i = 0; i < 20; i++) { const m = T.nextQuestion(S2, g2); S2.asked += 1; if (m.typed !== want) odd++; window.BioBoard.memSet(m.it.id, m.typed, i % 3 > 0, true); }
    n++;
    if (odd) fail(`typing ${t ? 'always' : 'never'}: ${odd} of 20 questions came ${want ? 'as options' : 'typed'}`);
  }
}
// Names it suggests fit the box.
Object.keys(T.WORLDS).forEach(w => A.rivals.forEach(r => {
  const ideas = T.nameIdeas(T.clean({ w, op: r.id, ch: [32] }));
  n++;
  if (!ideas.length || ideas.some(x => x.length > 24)) fail(`name ideas for ${w} against ${r.id}: ${JSON.stringify(ideas)}`);
}));
console.log(fails ? `${fails} failures` : `ok: ${n} checks: links come back the same and altered ones stay safe, every card's rules, every asset draws, ` +
  `${bank.length} questions (${JSON.stringify(byKind)}) earn full marks with their right answers, sources and memory as promised`);
process.exit(fails ? 1 : 0);

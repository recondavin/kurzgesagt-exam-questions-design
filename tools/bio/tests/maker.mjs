// Checks Make your own games (bio/bio-maker.js):
//   Links    every game made of the cards goes into a link and comes back the same; a broken or altered link (bad
//            base64, unknown cards, a name with markup, no chapters) still gives a game made of real cards.
//   Rules    in every world, with every card: right answers alone always win, in no more answers than the size; a
//            wrong answer does what its card says; "Lose a life" loses after three; in a Race where he moves, enough
//            wrong answers mean he catches you; scores and hearts never go below zero.
// Run: node tools/bio/tests/maker.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: { store() { return null; }, later() {} } }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
global.location = { origin: 'https://example.org', pathname: '/biology.html' };
global.btoa = s => Buffer.from(s, 'binary').toString('base64');
global.atob = s => Buffer.from(s, 'base64').toString('binary');
window.BioKit = { esc: String, shuffle: a => a.slice(), pick: a => a[0], buttons() {}, body() {}, host() {} };
window.BioBoard = { chapters: [28, 29, 30, 31, 32], names: {}, colours: {}, memNext() {}, memRecord() {}, memLine() {}, pools() {}, nearMascot() {}, reveal() {} };
require('../../../bio/bio-maker.js');
const T = window.BioMaker.test;
let fails = 0, n = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };

// Links.
for (const w of Object.keys(T.WORLDS)) {
  const W = T.WORLDS[w];
  for (const r of W.right) for (const x of W.wrong) for (const s of W.size) {
    const g = T.clean({ n: 'Héllo game', w, r: r[0], x: x[0], s, c: 2, a: 3, b: 1, e: 2, ch: [29, 31], q: 'type' });
    const back = T.decode(T.encode(g));
    n++;
    if (JSON.stringify(back) !== JSON.stringify(g)) fail(`${w}/${r[0]}/${x[0]}/${s}: the link gives back ${JSON.stringify(back)}`);
  }
}
const odd = [
  T.decode('%%%not base64'),
  T.decode(T.encode({ n: '<img src=x onerror=alert(1)>', w: 'lava', r: 'fly', x: 'boom', s: 99, c: 40, a: -1, b: 'x', e: 9, ch: [1, 2], q: 'essay' })),
  T.decode(Buffer.from('{"w":"battle","ch":"28"}').toString('base64'))
];
n += 3;
if (odd[0] !== null) fail('a broken link should give nothing');
const g1 = odd[1];
if (!g1 || /[<>]/.test(g1.n) || g1.w !== 'race' || g1.r !== 'step1' || g1.x !== 'him1' || g1.s !== 8 || g1.c !== 0 || g1.a !== 0 || g1.b !== 0 || g1.e !== 1 || g1.ch.length !== 5 || g1.q !== 'mix')
  fail(`an altered link should fall back to real cards: ${JSON.stringify(g1)}`);
if (!odd[2] || odd[2].w !== 'battle' || odd[2].ch.length !== 5) fail(`a link with bad chapters should use them all: ${JSON.stringify(odd[2])}`);

// Rules.
for (const w of Object.keys(T.WORLDS)) {
  const W = T.WORLDS[w];
  for (const r of W.right) for (const x of W.wrong) for (const s of W.size) {
    const g = T.clean({ w, r: r[0], x: x[0], s });
    // Right answers alone win, within `size` answers (typed or not).
    for (const typed of [false, true]) {
      let st = T.fresh(g), k = 0;
      while (!T.over(g, st) && k < s + 1) { st = T.step(g, st, true, typed).st; k++; }
      n++;
      if (T.over(g, st) !== 'win') fail(`${w}/${r[0]}/${x[0]}/${s}: ${k} right answers${typed ? ' (typed)' : ''} didn't win`);
      const most = w === 'points' ? Math.ceil(s / 100) : s;
      if (k > most) fail(`${w}/${r[0]}: took ${k} right answers, more than ${most}`);
    }
    // Wrong answers.
    let st = T.fresh(g), k = 0;
    while (!T.over(g, st) && k < 40) { st = T.step(g, st, false, false).st; k++; }
    n++;
    if (st.you < 0 || st.him < -2 || st.lives < 0) fail(`${w}/${x[0]}: a count went below zero ${JSON.stringify(st)}`);
    if (x[0] === 'life' && (T.over(g, st) !== 'lose' || k !== 3)) fail(`${w}/life: lost after ${k} wrong answers (${T.over(g, st)}), not 3`);
    if (w === 'race' && x[0] === 'him1' && T.over(g, st) !== 'lose') fail('race/him1: wrong answers never let him catch you');
    if (w === 'battle' && x[0] === 'hurt1' && (T.over(g, st) !== 'lose' || k !== s)) fail(`battle/hurt1: lost after ${k}, not ${s}`);
    if (['back1', 'fall1', 'm50'].indexOf(x[0]) >= 0 && T.over(g, st)) fail(`${w}/${x[0]}: wrong answers alone ended the game`);
  }
}
// A wrong answer does what its card says.
const say = (w, x) => T.step(T.clean({ w, x }), T.fresh(T.clean({ w, x })), false, false).said;
n++;
if (say('race', 'him1') !== 'He moves a step closer.' || say('battle', 'hurt1') !== 'He hits you.' || say('tower', 'life') !== 'You lose a life.') fail('wrong-answer cards say the wrong thing');
console.log(fails ? `${fails} failures` : `ok: ${n} checks: links come back the same, altered links stay safe, every card's rules win and lose as they say`);
process.exit(fails ? 1 : 0);

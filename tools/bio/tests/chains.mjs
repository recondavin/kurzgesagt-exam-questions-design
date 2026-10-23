// Checks each chain's "Now say it as one explanation" (Biology's in bio/learn<N>.js games.chains[].why, Geography's in
// answer-mode.js, both played by answer-mode.js) follows its own steps, in the same order and words (the user: "why doesn't the explanation match the
// steps in the order... it's kind of confusing and not good for memory"). Every step's words (bar little ones) must turn
// up in the explanation in order, at least 3 in 4 of them, each step after the one before.
// Run: node tools/bio/tests/chains.mjs [-v]
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
global.window = {};
const STOP = new Set('the a an and or it its is are be of to in into on onto by from with as at for this that these them they their there which then so but you your than e g'.split(' '));
const verbose = process.argv.includes('-v');
let fails = 0, chains = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
// Words, lower case, without tags or apostrophes, a plural's s dropped (cells / cell).
function words(t) {
  return (t.replace(/<[^>]+>/g, '').toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [])
    .map(w => w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
}
// Biology's chains (bio/learn<N>.js) and Geography's (written in answer-mode.js).
const all = [];
for (const ch of [28, 29, 30, 31, 32]) {
  require(`../../../bio/learn${ch}.js`);
  window.BioLearn[ch].games.chains.forEach(c => all.push([ch, c]));
}
const unq = t => t.replace(/\\'/g, "'");
for (const m of readFileSync(new URL('../../../answer-mode.js', import.meta.url), 'utf8').matchAll(/\{ title: '((?:[^'\\]|\\.)*)', steps: \[(.*?)\],\s*why: '((?:[^'\\]|\\.)*)'/g)) {
  all.push(['Geography', { title: unq(m[1]), steps: [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => unq(x[1])), why: unq(m[3]) }]);
}
all.forEach(([ch, c]) => {
  chains++;
  const W = words(c.why);
  let at = 0;
  c.steps.forEach((s, k) => {
    const want = words(s).filter(w => !STOP.has(w) && (w.length >= 3 || /\d/.test(w)));
    let got = 0, pos = at;
    want.forEach(w => { const i = W.indexOf(w, pos); if (i >= 0) { got++; pos = i + 1; } });
    if (got < Math.ceil(want.length * 0.75)) fail(`${ch} "${c.title}" step ${k + 1} isn't in the explanation in its place: "${s}" (${got} of ${want.length} words)`);
    at = pos;
  });
  if (verbose) console.log(`   ${ch} ${c.title}: ${c.steps.length} steps in order`);
});
console.log(fails ? `${fails} failures` : `ok: ${chains} chains, each explanation follows its steps in order`);
process.exit(fails ? 1 : 0);

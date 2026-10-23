// Checks "Don't Say It" (bio/bio-quizgames.js): describe a term without saying it or its banned words, and the examiner
// guesses it when the description has enough of its ideas. Each chapter's terms are in tools/bio/taboo/ch<N>.json:
// [{term, ban: [3-5 words], ideas: [{a, k: [{w: [stems], n}]}], need, model}]. For every term: the model description
// doesn't use the term or a banned word, it has at least `need` ideas (marked like the answer sheet: BioApp.hasPoint),
// a vague description doesn't, and no other term's model in the chapter would pass for it.
// Run: node tools/bio/tests/taboo.mjs [-v] [chapter]
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.window = { ExamAnswerMode: { kit: {} }, addEventListener() {} };
global.document = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
for (const ch of [28, 29, 30, 31, 32]) require(`../../../bio/q${ch}.js`);
require('../../../bio/bio.js');
// The game's own rule for banned words (bio-quizgames.js), loaded with just enough of the site around it.
window.BioKit = { esc: String, shuffle: a => a, pick: a => a[0], buttons() {} };
window.BioBoard = { pools() {}, chapters: [28, 29, 30, 31, 32], names: {}, colours: {} };
require('../../../bio/bio-quizgames.js');
const B = window.BioApp, G = window.BioQuizGames, verbose = process.argv.includes('-v'), only = +process.argv.find(a => /^\d\d$/.test(a)) || 0;
let fails = 0, terms = 0;
const fail = msg => { fails++; console.log('   FAIL', msg); };
export const banned = G.banned;
export function ideas(text, t) { const words = B.words(text); return t.ideas.filter(i => B.hasPoint(i, words)).length; }
for (const ch of [28, 29, 30, 31, 32].filter(c => !only || c === only)) {
  const src = new URL(`../taboo/ch${ch}.json`, import.meta.url);
  if (!existsSync(src)) { fail(`chapter ${ch}: no terms yet`); continue; }
  const list = JSON.parse(readFileSync(src));
  if (list.length < 8) fail(`chapter ${ch}: only ${list.length} terms`);
  list.forEach(t => {
    terms++;
    const at = `${ch}/${t.term}`;
    if (!t.term || !Array.isArray(t.ban) || t.ban.length < 3 || t.ban.length > 5) fail(`${at}: needs 3 to 5 banned words`);
    if (!Array.isArray(t.ideas) || t.ideas.length < 2 || t.ideas.length > 4) fail(`${at}: needs 2 to 4 ideas`);
    if (!(t.need >= 1 && t.need <= (t.ideas || []).length)) fail(`${at}: need ${t.need}`);
    if (!t.model || t.model.length > 200) fail(`${at}: model missing or over 200 letters`);
    (t.ideas || []).forEach(i => { if (!i.a || !Array.isArray(i.k) || !i.k.length) fail(`${at}: an idea without its text or keys`); });
    const used = banned(t.model || '', t), got = ideas(t.model || '', t);
    if (used.length) fail(`${at}: the model says ${used.join(', ')}`);
    if (got < t.need) fail(`${at}: the model has ${got} of ${t.need} ideas`);
    ['It is a part of the body that does an important job.', 'It helps the body work properly and keeps you healthy.'].forEach(v => {
      if (ideas(v, t) >= t.need) fail(`${at}: a vague description passes: "${v}"`);
    });
    list.forEach(o => { if (o !== t && o.model && ideas(o.model, t) >= t.need && !banned(o.model, t).length) fail(`${at}: ${o.term}'s model would pass for it`); });
    if (verbose) console.log(`   ${at}: ${got}/${t.need} ideas, bans ${G.banList(t).join(', ')}`);
  });
}
console.log(fails ? `${fails} failures` : `ok: ${terms} terms`);
process.exit(fails ? 1 : 0);

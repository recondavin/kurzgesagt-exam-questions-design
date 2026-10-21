// Tests the Irish oral marker (orals/engine/marker.js with orals/ga/grammar.js and questions.js).
//   node tools/orals/tests/marker.mjs [-v]
// 1. Every accepted pattern, expanded many ways, is marked right: no mistake rule fires on an accepted answer.
// 2. Real correct answers (Leaving Cert oral notes, every dialect) are right, never a mistake.
// 3. Known mistakes are caught by the rule that should catch them, and the fix it offers is itself right.
// 4. Each question's model answer is right, can be built from its word tiles, and its "say more" line has no mistake.
// 5. Every county's "Tá mé i mo chónaí ..." is right.
// 6. Every question line in the story is one of the question's listed phrasings.
import { readFileSync } from 'node:fs';
import { createMarker } from '../../../orals/engine/marker.js';
import { GA } from '../../../orals/ga/grammar.js';
import { QUESTIONS as MAIRIN, SHOP_QUESTIONS, SLOTS, COUNTIES } from '../../../orals/ga/questions.js';
const QUESTIONS = MAIRIN.concat(SHOP_QUESTIONS);
import { RIGHT, WRONG } from './answers.mjs';

const verbose = process.argv.includes('-v');
const lang = Object.assign({}, GA, { slots: Object.assign({}, GA.slots, SLOTS) });
const m = createMarker(lang, QUESTIONS);
let fails = 0, checks = 0;
const fail = (...a) => { fails++; console.log('FAIL', ...a); };
const ok = (...a) => { checks++; if (verbose) console.log('ok  ', ...a); };

// ---------------------------------------------------------------- 1. expansions of the patterns
// Sample words for the open slots.
const SAMPLE = { name: ['Davin', 'Aoife Ní Bhriain', 'Seán'], place: ['nGaillimh', 'gCorcaigh', 'mBaile Átha Cliath'], '*': ['scoil'], tail: ['', 'agus is breá liom é'] };
function rnd(n) { return Math.floor(Math.random() * n); }
function lex(src) { const out = []; const re = /\s*(\(|\)|\[|\]|\||\{[^}]+\}|[^\s()[\]|{}]+)/g; let x; while ((x = re.exec(src))) out.push(x[1]); return out; }
function expand(p, slots, depth = 0) {
  const toks = lex(p);
  let i = 0;
  function seq(stop) {
    const alts = [[]];
    while (i < toks.length && !stop.includes(toks[i])) {
      const t = toks[i++];
      if (t === '|') alts.push([]);
      else if (t === '(') { const s = seq([')']); i++; alts[alts.length - 1].push(s); }
      else if (t === '[') { const s = seq([']']); i++; alts[alts.length - 1].push(Math.random() < 0.5 ? s : ''); }
      else if (t[0] === '{') {
        const name = t.slice(1, -1);
        if (name === 'tail') alts[alts.length - 1].push(SAMPLE.tail[rnd(2)]);
        else if (name[0] === '*') alts[alts.length - 1].push(SAMPLE['*'][0]);
        else if (SAMPLE[name]) alts[alts.length - 1].push(SAMPLE[name][rnd(SAMPLE[name].length)]);
        else {
          const def = slots[name];
          const list = [].concat(def);
          alts[alts.length - 1].push(depth > 6 ? '' : expand(list[rnd(list.length)], slots, depth + 1));
        }
      } else alts[alts.length - 1].push(t);
    }
    const pick = alts[rnd(alts.length)];
    return pick.filter(Boolean).join(' ');
  }
  return seq([]);
}
for (const q of QUESTIONS) {
  const slots = Object.assign({}, lang.slots, q.slots || {});
  for (const a of q.accept) {
    const p = typeof a === 'string' ? a : a.p;
    const seen = new Set();
    for (let k = 0; k < 60; k++) {
      const text = expand(p, slots).replace(/\s+/g, ' ').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      const r = m.mark(q.id, text);
      if (r.verdict === 'right') ok(q.id, text);
      else fail('expansion not right', q.id, JSON.stringify(text), r.verdict, (r.mistakes || []).map(x => x.rule).join(','));
    }
  }
}

// ---------------------------------------------------------------- 2. real correct answers
for (const [qid, text] of RIGHT) {
  const r = m.mark(qid, text);
  if (r.verdict === 'mistake') fail('right answer marked as a mistake', qid, JSON.stringify(text), r.mistakes.map(x => x.rule).join(','));
  else if (r.verdict !== 'right') { checks++; console.log('note: not recognised (shown as "can\'t check", never wrong):', qid, JSON.stringify(text), r.verdict); }
  else ok(qid, text);
}

// ---------------------------------------------------------------- 3. known mistakes
for (const [qid, text, rule] of WRONG) {
  const r = m.mark(qid, text);
  if (r.verdict !== 'mistake') { fail('mistake not caught', qid, JSON.stringify(text), r.verdict); continue; }
  const rules = r.mistakes.map(x => x.rule);
  if (rule && !rules.includes(rule)) fail('caught by the wrong rule', qid, JSON.stringify(text), rules.join(','), 'expected', rule);
  else ok(qid, text, rules.join(','));
  if (r.fixed) {
    const fixed = r.fixed.map(p => p.w).join(' ');
    const again = m.mark(qid, fixed);
    if (again.verdict === 'mistake') fail('the offered fix is still a mistake', qid, JSON.stringify(fixed), again.mistakes.map(x => x.rule).join(','));
    else ok('fix', fixed, again.verdict);
  }
}

// ---------------------------------------------------------------- 4. models and tiles
const profile = { name: 'Davin', county: 'galway' };
const county = COUNTIES.find(c => c.id === profile.county);
const fill = t => t.replace(/\{name\}/g, profile.name).replace(/\{county\}/g, county.ga).replace(/\{county_en\}/g, county.en);
for (const q of QUESTIONS) {
  const model = fill(q.model.ga);
  const r = m.mark(q.id, model);
  if (r.verdict !== 'right') fail('model answer not right', q.id, model, r.verdict, (r.mistakes || []).map(x => x.rule).join(','));
  else ok('model', q.id, model);
  if (r.tips && r.tips.length) fail('model answer gets a spelling tip', q.id, model, r.tips.map(t => t.word).join(','));
  if (q.more) {
    const more = m.mark(q.id, fill(q.more.ga));
    if (more.verdict === 'mistake') fail('"say more" line has a mistake', q.id, q.more.ga, more.mistakes.map(x => x.rule).join(','));
    else ok('more', q.id);
  }
  if (!q.en || !q.model.en || (q.more && !q.more.en)) fail('missing English', q.id);
  // The model answer can be built from the tiles.
  const bank = [].concat(...q.tiles.map(t => (t === '{name}' ? profile.name.split(' ') : t === '{county_tiles}' ? county.ga.split(' ').concat('Gaillimh') : [t])));
  const need = model.replace(/[.,!?]/g, '').split(/\s+/);
  const left = bank.slice();
  const missing = need.filter(w => { const i = left.indexOf(w); if (i < 0) return true; left.splice(i, 1); return false; });
  if (missing.length) fail('model answer cannot be built from the tiles', q.id, missing.join(' '));
  else ok('tiles', q.id);
}

// ---------------------------------------------------------------- 5. counties
for (const c of COUNTIES) {
  const text = 'Tá mé i mo chónaí ' + c.ga + '.';
  const r = m.mark('conai', text);
  if (r.verdict !== 'right') fail('county', text, r.verdict, (r.mistakes || []).map(x => x.rule).join(','));
  else ok('county', text);
}

// ---------------------------------------------------------------- 6. the story's questions
// Every "#ask:id" line in the story is one of that question's listed phrasings.
const ink = readFileSync(new URL('../../../orals/ga/story.ink', import.meta.url), 'utf8');
for (const line of ink.split('\n')) {
  const mm = /^\s*\w+:\s*(.+?)\s*#ask:(\w+)/.exec(line);
  if (!mm) continue;
  const q = QUESTIONS.find(x => x.id === mm[2]);
  if (!q) fail('story asks an unknown question', mm[2]);
  else if (!q.ask.includes(mm[1])) fail('story phrasing not in the question\'s ask list', mm[2], mm[1]);
  else ok('story', mm[2], mm[1]);
}

console.log(fails ? `${fails} failed of ${checks + fails}` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);

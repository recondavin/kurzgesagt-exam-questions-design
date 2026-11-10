// Checks eng/eng-data.js (built by tools/eng/build_eng.py): the four texts' notes, the past questions and the games'
// content, so english.html never shows a broken page or a game round without its answers.
// Run: node tools/eng/tests/eng.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const box = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('../../../eng/eng-data.js', import.meta.url), 'utf8'), box);
const D = box.window.EngData;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

// The comparative: three modes, criteria adding up to 100% and to 70 marks, PACE in order, a language bank.
const C = D.comparative;
ok(C.modes.map(m => m.id).join() === 'theme,cc,gvv', 'the 2027 modes are Theme or Issue, Cultural Context and General Vision and Viewpoint');
ok(C.marks.criteria.reduce((s, c) => s + c.pct, 0) === 100, 'P, C, L and M add up to 100%');
ok(C.marks.criteria.reduce((s, c) => s + c.of70, 0) === 70, 'P, C, L and M add up to 70 marks');
ok(C.structure.pace.map(p => p.k).join('') === 'PACE', 'PACE is Point, Anchor, Compare, Evaluate');
const phrases = new Set(C.language.flatMap(g => g.items));

// The official 2027 arrangements: Paper 2 adds up to 200 (60 + 70 + 70), every mode quotes its official definition,
// and the sources are links.
ok(C.year === 2027 && C.paper && C.paper.sections.reduce((s, x) => s + x.marks, 0) === 200, 'Paper 2 sections add up to 200 marks');
ok(/assets\.gov\.ie/.test(C.paper.source.url) && C.paper.seventy && C.paper.split, 'the 2027 arrangements are cited, with the 70-mark and 30 + 40 rules');
ok(C.modes.every(m => m.official && m.official.quote.length > 40 && m.official.src), 'every mode quotes its official definition and source');
ok(C.sources.length >= 4 && C.sources.every(x => /^https:\/\//.test(x.url)), 'sources are links');

// The texts.
ok(D.order.join() === 'sive,othello,shawshank,stlt', 'all four texts have notes');
for (const id of D.order) {
  const t = D.texts[id], ids = new Set(t.moments.map(m => m.id));
  ok(t.moments.length >= 10, `${id}: at least 10 key moments`);
  ok(['opening', 'ending'].every(w => t.moments.some(m => m.when === w)), `${id}: key moments from the opening and the ending`);
  ok(t.moments.every(m => m.what && m.why && m.where && m.modes.length), `${id}: every key moment has what, why, where and modes`);
  ok(t.people.every(p => p.group && p.tag && p.wants && p.end && p.who) && new Set(t.people.map(p => p.tag)).size === t.people.length, `${id}: every character has a group, a role (all different), what they want and how they end`);
  ok(t.people.every(p => !p.face || (p.face.file && p.face.x >= 0 && p.face.x <= 1 && p.face.y >= 0 && p.face.y <= 1 && p.face.zoom >= 1 && p.face.ar > 0 && fs.existsSync(new URL('../../../assets/eng/img/' + p.face.file, import.meta.url)))), `${id}: every face crop is on a picture that exists`);
  ok(t.people.every(p => !p.face || (typeof p.face.from === 'string' && p.face.from.length > 4)), `${id}: every face says which production or film it's from`);
  ok(t.moments.every(m => m.chain && m.chain.happens && m.chain.shows && m.chain.leads), `${id}: every key moment has its chain (happens, shows, leads to)`);
  // The cast map: everyone has a place on it, no two too close, and every line joins two people in the cast.
  const names = new Set(t.people.map(p => p.name));
  ok(t.people.every(p => Array.isArray(p.pos) && p.pos[0] >= 50 && p.pos[0] <= 950 && p.pos[1] >= 50 && p.pos[1] <= 525), `${id}: everyone has a place on the cast map, with room for their name below`);
  ok(t.people.every((p, i) => t.people.every((q, j) => j <= i || Math.hypot(p.pos[0] - q.pos[0], p.pos[1] - q.pos[1]) >= 150)), `${id}: no two people sit on top of each other on the cast map`);
  ok(Array.isArray(t.links) && t.links.length >= 8 && t.links.every(l => names.has(l[0]) && names.has(l[1]) && l[0] !== l[1] && l[2].length > 2), `${id}: every line on the cast map joins two people and says how`);
  ok(t.people.every(p => t.links.some(l => l[0] === p.name || l[1] === p.name)), `${id}: everyone on the cast map is linked to someone`);
  ok(t.people.every(p => typeof p.trait === 'string' && p.trait.length > 6 && p.trait.length <= 45), `${id}: every character has their personality in a few words`);
  ok(t.people.every(p => p.check && ['like', 'want'].every(k => Array.isArray(p.check[k]) && p.check[k].length >= 5 && p.check[k].every(w => /^[a-z0-9£]{3,}$/.test(w)))), `${id}: every character has the words accepted when you write what they're like and what they want`);
  ok(t.moments.every(m => Array.isArray(m.tell) && m.tell.length >= 2 && m.tell.length <= 4 && m.tell.every(s => s.length > 5)), `${id}: every key moment is told in 2 to 4 beats`);
  const groups = [...t.modes.theme.themes, ...t.modes.cc.aspects, { name: 'vision', points: t.modes.gvv.points }];
  ok(t.modes.theme.themes.length === 3, `${id}: the three themes`);
  ok(t.modes.cc.aspects.length >= 6, `${id}: at least six cultural-context aspects`);
  ok(['bleak', 'hopeful', 'mixed'].includes(t.modes.gvv.outlook) && t.modes.gvv.opening && t.modes.gvv.ending, `${id}: vision has an opening, an ending and an outlook`);
  for (const g of groups) {
    ok(g.points.length >= 1, `${id} ${g.name}: has points`);
    for (const p of g.points) {
      const refs = [...p.matchAll(/\[([a-z]+-\d+)\]/g)].map(r => r[1]);
      ok(refs.length >= 1, `${id} ${g.name}: "${p.slice(0, 50)}…" is anchored in a key moment`);
      refs.forEach(r => ok(ids.has(r), `${id} ${g.name}: cites [${r}], a key moment that exists`));
    }
  }
}

// Past questions: every mode, sane years and marks.
for (const m of ['theme', 'cc', 'gvv']) ok(D.questions.filter(q => q.mode === m).length >= 5, `at least 5 past questions for ${m}`);
ok(D.questions.every(q => q.year >= 2000 && q.year <= 2026 && q.text.length > 30 && (q.marks === 70 || (Array.isArray(q.marks) && q.marks.reduce((a, b) => a + b, 0) === 70))), 'every past question has a year, its wording and 70 marks');
// Each one in normal English (both parts of a 30 + 40), and key moments from Sive, Small Things Like These and
// Shawshank that exist, with why; a 30 + 40 says which text goes in part (a), a Theme or Issue question which theme.
ok(D.questions.every(q => Array.isArray(q.marks) ? q.parts && q.plain && q.plain.a && q.plain.b : typeof q.plain === 'string' && q.plain.length > 20), 'every past question is in normal English');
ok(D.questions.every(q => ['sive', 'stlt', 'shawshank'].every(id => {
  const k = q.picks && q.picks[id], ids = new Set(D.texts[id].moments.map(m => m.id));
  return k && k.why && (k.skip || (k.m.length && k.m.every(m => ids.has(m))));
})), 'every past question has key moments to use from Sive, Small Things Like These and Shawshank');
ok(D.questions.every(q => !Array.isArray(q.marks) || q.picks[q.best]), 'every 30 + 40 question says which text goes in part (a)');
ok(D.questions.every(q => (q.mode === 'theme') === !!q.theme), 'every Theme or Issue question says which theme to use');

// The games.
const G = D.games, known = new Set(D.order);
ok(G.link.length >= 20 && G.level.length >= 12 && G.chains.length >= 6 && G.spot.length >= 9, 'enough items for every game');
for (const kind of ['link', 'level', 'chains', 'spot']) ok(G[kind].every(it => it.texts.length && it.texts.every(t => known.has(t))), `${kind}: every item names texts that exist`);
ok(G.link.every(it => phrases.has(it.link)), 'Link it: every right link is a phrase from the language bank');
ok(G.link.every(it => it.texts.includes(it.a.t) && it.texts.includes(it.b.t) && it.a.t !== it.b.t), 'Link it: two different texts');
ok(G.level.every(it => it.steps.length === 2 && it.steps.every(lv => lv[0].length === 1 && lv.slice(1).every(o => 'fovw'.includes(o[1]) && o[2]))), 'Build a point: a right answer and explained traps at both levels');
ok(G.chains.every(it => it.steps.length === 5), 'Order the paragraph: five PACE sentences');
ok(G.chains.every(it => it.steps.every(s => it.why.replace(/<\/?b>/g, '').includes(s.slice(0, 25)))), 'Order the paragraph: the whole paragraph is its steps in order');
ok(G.spot.every(it => it.weak >= 0 && it.weak < it.lines.length && it.fix && it.why), 'Spot the weak line: a weak line, why, and a better one');
for (const m of ['theme', 'cc', 'gvv']) ok(['link', 'level', 'chains', 'spot'].every(k => G[k].some(it => it.mode === m)), `every game has ${m} items`);

ok((C.upgrades || []).length >= 25 && C.upgrades.every(u => u.plain && u.exam.length >= 2 && u.eg), 'Say it well: 25+ plain phrases, each with exam versions and an example');

// The glossary: every entry explained, its examples for real texts, and the hard words of every past question covered.
const GL = D.glossary || [];
ok(GL.length >= 50 && GL.every(g => g.def && g.term && g.match.length && ['task', 'topic', 'word'].includes(g.kind)), 'glossary: 50+ words, each with its meaning');
ok(GL.every(g => !g.eg || Object.keys(g.eg).every(t => D.order.includes(t))), 'glossary: examples only for the four texts');
const glIds = new Set(GL.map(g => g.id));
for (const id of ['mobility', 'position', 'extent', 'discuss', 'compare', 'cc', 'gvv', 'patriarchal', 'catalyst', 'intervention']) ok(glIds.has(id), `glossary has ${id}`);
const matchesIn = q => GL.filter(g => g.match.some(m => new RegExp('(^|[^a-z’\'-])' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^a-z’\'-])').test(q.toLowerCase())));
ok(D.questions.every(q => matchesIn(q.text).length >= 2), 'every past question has at least two words you can tap');
ok(matchesIn(D.questions.find(q => /social mobility/.test(q.text)).text).some(g => g.id === 'mobility'), 'social mobility is explained');

// Pictures: each one on disk with a free licence, its author and source; every text has some; the key moments they
// link to exist; their spots sit on the picture; enough of your texts' pictures for Picture it.
for (const p of D.images) {
  ok(fs.existsSync(new URL('../../../assets/eng/img/' + p.file, import.meta.url)), `picture ${p.file} exists`);
  const free = /^(CC0|Public domain|CC BY(-SA)? [234]\.0|Free Art Licence)$/.test(p.licence), still = p.licence === 'Copyright: used here for study' && ['film', 'production'].includes(p.kind);
  ok(p.author && (free ? /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.source) : still && /^https:\/\//.test(p.source)), `picture ${p.file} is credited: free with its Commons page, or a film still or stage photo with its source`);
  const ids = new Set(D.texts[p.text].moments.map(m => m.id));
  ok(!p.moment || ids.has(p.moment), `picture ${p.file}: its key moment exists`);
  ok(p.spots.every(s => s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100 && s.label && s.note && (!s.moment || ids.has(s.moment))), `picture ${p.file}: every spot is on it, with a note and a real key moment`);
}
for (const id of D.order) ok(D.images.filter(p => p.text === id).length >= 3 && D.images.some(p => p.text === id && p.hero), `${id}: at least 3 pictures and one for its tile`);
for (const trio of [['sive', 'othello', 'shawshank'], ['sive', 'othello', 'stlt'], ['sive', 'shawshank', 'stlt'], ['othello', 'shawshank', 'stlt']])
  ok(D.images.filter(p => p.moment && trio.includes(p.text)).length >= 4, `Picture it has 4+ pictures for ${trio.join(', ')}`);

if (fails.length) { console.log(fails.slice(0, 30).join('\n')); console.log(fails.length + ' failures'); process.exit(1); }
// Compare it (#compare): every theme has a best text for part (a), 3+ points per text on real moments, and 4+ links
// for every pair of texts, each a pair of real moments from two different texts, listed once, with a kind and a sentence.
for (const th of D.compare || []) {
  const tids = Object.keys(th.points), mid = new Map(tids.flatMap(t => D.texts[t].moments.map(m => [m.id, t])));
  ok(tids.includes(th.best) && th.bestWhy, `${th.id}: a best text for part (a), and why`);
  ok(tids.every(t => th.points[t].length >= 3 && th.points[t].every(p => p.title && p.say && p.m.every(n => n >= 1 && n <= D.texts[t].moments.length))), `${th.id}: 3+ points for each text, on real moments`);
  const keys = th.links.map(l => [l.a, l.b].sort().join());
  ok(new Set(keys).size === keys.length, `${th.id}: no link listed twice`);
  ok(th.links.every(l => mid.has(l.a) && mid.has(l.b) && mid.get(l.a) !== mid.get(l.b) && ['same', 'differ', 'degree'].includes(l.rel) && l.aspect && l.say.length > 40), `${th.id}: every link joins two texts, with a kind and a sentence`);
  // The writing guide: every scene of a guided text says what it represents and gives 10 words with meanings.
  for (const [t, wr] of Object.entries(th.write || {})) {
    ok(Object.keys(wr.scenes).length === D.texts[t].moments.length && Object.values(wr.scenes).every(sc => sc.details.length >= 2 && sc.reps.length && sc.reps.every(r => r.title && r.say && r.start && r.ideas.length >= 2) && sc.words.length === 10 && sc.words.every(x => x[0] && x[1])), `${th.id} ${t}: every scene has details, what it represents with ideas, and 10 words`);
    ok(wr.open.parts.map(x => x.k).join() === 'film,idea,points' && wr.end.parts.map(x => x.k).join() === 'sum,final,last' && ['open', 'end'].every(k => wr[k].words.length === 10 && wr[k].parts.every(x => x.label && x.hint && (x.ideas || x.auto))) && th.instead.length >= 8, `${th.id} ${t}: an opening and ending in three parts, and words instead of "shows"`);
  }
  for (let i = 0; i < tids.length; i++) for (let j = i + 1; j < tids.length; j++) {
    const pair = [tids[i], tids[j]].sort();
    ok(th.links.filter(l => [mid.get(l.a), mid.get(l.b)].sort().join() === pair.join()).length >= 4 && th.ends[pair.join('|')], `${th.id}: 4+ links and an ending for ${pair.join(' and ')}`);
  }
}

console.log(`ok: ${D.order.length} texts, ${D.order.reduce((n, id) => n + D.texts[id].moments.length, 0)} key moments, ${D.questions.length} past questions, ` +
  `games: link ${G.link.length}, level ${G.level.length}, chains ${G.chains.length}, spot ${G.spot.length}; ${D.images.length} pictures`);

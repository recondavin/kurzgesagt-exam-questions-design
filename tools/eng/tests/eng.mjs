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

// Pictures: each one on disk with a free licence, its author and source; every text has some; the key moments they
// link to exist; their spots sit on the picture; enough of your texts' pictures for Picture it.
for (const p of D.images) {
  ok(fs.existsSync(new URL('../../../assets/eng/img/' + p.file, import.meta.url)), `picture ${p.file} exists`);
  ok(p.licence && p.author && /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.source) && /^(CC0|Public domain|CC BY(-SA)? [234]\.0|Free Art Licence)$/.test(p.licence), `picture ${p.file} is free to use and credited`);
  const ids = new Set(D.texts[p.text].moments.map(m => m.id));
  ok(!p.moment || ids.has(p.moment), `picture ${p.file}: its key moment exists`);
  ok(p.spots.every(s => s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100 && s.label && s.note && (!s.moment || ids.has(s.moment))), `picture ${p.file}: every spot is on it, with a note and a real key moment`);
}
for (const id of D.order) ok(D.images.filter(p => p.text === id).length >= 3 && D.images.some(p => p.text === id && p.hero), `${id}: at least 3 pictures and one for its tile`);
for (const trio of [['sive', 'othello', 'shawshank'], ['sive', 'othello', 'stlt'], ['sive', 'shawshank', 'stlt'], ['othello', 'shawshank', 'stlt']])
  ok(D.images.filter(p => p.moment && trio.includes(p.text)).length >= 4, `Picture it has 4+ pictures for ${trio.join(', ')}`);

if (fails.length) { console.log(fails.slice(0, 30).join('\n')); console.log(fails.length + ' failures'); process.exit(1); }
console.log(`ok: ${D.order.length} texts, ${D.order.reduce((n, id) => n + D.texts[id].moments.length, 0)} key moments, ${D.questions.length} past questions, ` +
  `games: link ${G.link.length}, level ${G.level.length}, chains ${G.chains.length}, spot ${G.spot.length}; ${D.images.length} pictures`);

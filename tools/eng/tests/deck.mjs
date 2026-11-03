// The English deck for the golf and pool games (eng/eng-deck.js): five slots, each with questions, every question a
// right answer and three different wrong ones, and none of the wrong ones the right answer.
// Run: node tools/eng/tests/deck.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../../../', import.meta.url), fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
for (const picked of [[], ['sive', 'othello', 'shawshank'], ['stlt', 'sive', 'othello'], ['shawshank', 'stlt', 'othello']]) {
  const store = { 'eng-texts': JSON.stringify(picked) };
  const box = { console, localStorage: { getItem: k => store[k] ?? null }, location: { search: '' } };
  box.window = box;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(new URL('eng/eng-data.js', root), 'utf8'), box);
  vm.runInContext(fs.readFileSync(new URL('eng/eng-deck.js', root), 'utf8'), box);
  const B = box.BoardDeck, items = B.items(), by = {};
  ok(B.chapters.join() === '28,29,30,31,32' && B.chapters.every(c => B.names[c] && /^#[0-9A-F]{6}$/i.test(B.colours[c])), `${picked}: five slots with names and colours`);
  ok(new Set(Object.values(B.colours)).size === 5 && !Object.values(B.colours).some(c => /^#(58CC02|FF4B4B)$/i.test(c)), `${picked}: five different colours, none the games' green or red`);
  if (picked.length) ok(picked.every((t, i) => B.names[B.chapters[i]] === box.EngData.texts[t].title), `${picked}: the slots are the texts picked`);
  items.forEach(it => { (by[it.ch] = by[it.ch] || []).push(it); });
  B.chapters.forEach(c => ok((by[c] || []).length >= 20, `${picked}: ${B.names[c]} has 20+ questions (${(by[c] || []).length})`));
  items.forEach(it => ok(it.c.right && it.c.wrong.length === 3 && new Set(it.c.wrong).size === 3 && !it.c.wrong.includes(it.c.right) && it.text && it.c.why, `${picked}: ${it.qid}: a right answer and three different wrong ones`));
  ok(new Set(items.map(it => it.ch + it.qid)).size === items.length, `${picked}: every question once`);
  ok(B.memory === 'eng-drill' && B.prefix === 'eng-' && B.holes.length === 5, `${picked}: its own memory, keys and hole names`);
}
// One text's story (?story=...): five parts in order, every moment in one of them, each part with questions.
for (const t of ['sive', 'othello', 'shawshank', 'stlt']) {
  const box = { console, localStorage: { getItem: () => null }, location: { search: '?story=' + t } };
  box.window = box;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(new URL('eng/eng-data.js', root), 'utf8'), box);
  vm.runInContext(fs.readFileSync(new URL('eng/eng-deck.js', root), 'utf8'), box);
  const B = box.BoardDeck, items = B.items(), ms = box.EngData.texts[t].moments.map(m => m.id);
  ok(B.story === t && B.holes.length === 5 && B.chapters.every(c => B.names[c]), `${t} story: five named holes`);
  const story = items.filter(it => !/^(who|wants):/.test(it.qid));
  const seen = story.map(it => it.qid.split(':')[0]), order = B.chapters.map(c => story.filter(it => it.ch === c).map(it => ms.indexOf(it.qid.split(':')[0])));
  const people = box.EngData.texts[t].people.filter(p => p.tag).map(p => p.name), asked = new Set(items.filter(it => /^who:/.test(it.qid)).map(it => it.qid.slice(4)));
  ok(people.filter(n => asked.has(n)).length >= people.length - 2, `${t} story: who's who questions on the people as they turn up (${asked.size} of ${people.length})`);
  ok(ms.every(id => seen.includes(id)), `${t} story: every key moment is asked about`);
  ok(order.every(o => o.length >= 10) && order.every((o, i) => !i || Math.min(...o) > Math.max(...order[i - 1])), `${t} story: 10+ questions a hole, the holes in story order`);
  items.forEach(it => ok(it.c.wrong.length === 3 && new Set(it.c.wrong).size === 3 && !it.c.wrong.includes(it.c.right), `${t} story: ${it.qid}: three different wrong answers`));
  ok(B.prefix === 'eng-' + t + '-', `${t} story: its own bests`);
}
if (fails.length) { console.log(fails.slice(0, 20).join('\n')); console.log(fails.length + ' failures'); process.exit(1); }
console.log('ok: five slots, 20+ questions each, every question with three different wrong answers, for any three texts');

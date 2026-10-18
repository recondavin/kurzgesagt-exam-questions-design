// Lists every line the Biology desk's guide reads out (bio/guide.js steps for each exam question on a real paper)
// in tools/narration/bio_lines.json, which tools/narration/generate_narration.py voices with the narrator's voice.
// Lines with the same words share one clip. Run: node tools/bio/build_bio_narration.mjs
import { createRequire } from 'module';
import { writeFileSync, existsSync } from 'fs';
const require = createRequire(import.meta.url);
const R = p => new URL('../../' + p, import.meta.url).pathname;
global.window = {};
require(R('bio/papers.js'));
require(R('bio/guide.js'));
const CH = [28, 29, 30, 31, 32];
for (const ch of CH) {
  require(R(`bio/q${ch}.js`));
  if (existsSync(R(`bio/guide${ch}.js`))) require(R(`bio/guide${ch}.js`));
}
const G = window.BioGuide, lines = new Map(), clash = [];
let questions = 0;
for (const ch of CH) for (const q of window.BioQuestions[ch].questions) {
  if (!window.BioPapers[`${ch}/${q.id}`]) continue;
  questions++;
  for (const step of G.steps(ch, q)) for (const l of G.lines(step)) {
    const had = lines.get(l.id);
    if (had && had.say !== l.say) clash.push(`${l.id}: "${had.say}" / "${l.say}"`);
    if (!had) lines.set(l.id, l);
  }
}
if (clash.length) { console.log('Clip ids with two different lines:\n  ' + clash.join('\n  ')); process.exit(1); }
const out = [...lines.values()];
writeFileSync(R('tools/narration/bio_lines.json'), JSON.stringify(out, null, 1) + '\n');
const words = out.reduce((n, l) => n + l.say.split(/\s+/).length, 0);
console.log(`${questions} questions, ${out.length} narrated lines (${words} words) in tools/narration/bio_lines.json`);

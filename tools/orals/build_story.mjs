// Compiles a pack's Ink story to the JSON the game runs, as an ES module.
//   npm install --no-save inkjs@2.3.2      (once, anywhere above this folder, or set INKJS to its folder)
//   node tools/orals/build_story.mjs [ga]
// Reads orals/<pack>/story.ink and writes orals/<pack>/story.js (export default { ...compiled story... }).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pack = process.argv[2] || 'ga';
const require = createRequire(process.env.INKJS ? join(process.env.INKJS, 'x.js') : import.meta.url);
const { Compiler, CompilerOptions } = require('inkjs/full');

const src = readFileSync(join(root, 'orals', pack, 'story.ink'), 'utf8');
const problems = [];
const compiler = new Compiler(src, new CompilerOptions(null, [], false, (msg, type) => problems.push({ msg, type })));
let story = null;
try { story = compiler.Compile(); } catch (e) { /* the problems list says why */ }
for (const p of problems) console.error(p.type === 2 ? 'error:' : 'warning:', p.msg);
if (!story || problems.some(p => p.type === 2)) process.exit(1);
const json = story.ToJson();
writeFileSync(join(root, 'orals', pack, 'story.js'), '// Compiled from story.ink by tools/orals/build_story.mjs. Do not edit by hand.\nexport default ' + json + ';\n');
console.log('wrote orals/' + pack + '/story.js', json.length, 'bytes');

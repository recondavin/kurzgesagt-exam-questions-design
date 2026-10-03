// Accuracy check for the answer-mode marker: does each good sentence earn an SRP, and does
// each vague or wrong one earn nothing? Run with: node tools/answer-mode-tests/run.mjs [-v]
import { TESTS } from './first-set.mjs';
import { HOLD } from './held-out.mjs';
import { FRESH } from './fresh.mjs';
import { fileURLToPath } from 'url';
global.window = { matchMedia: () => ({ matches: false }), addEventListener() {} };
global.document = { createElement: () => ({}), head: { appendChild() {} } };
await import(fileURLToPath(new URL('../../answer-mode.js', import.meta.url)));
const A = window.ExamAnswerMode;
for (const [name, set] of [['first set', TESTS], ['held-out', HOLD], ['fresh', FRESH]]) {
  let ok = 0, n = 0; const bad = [];
  for (const q of Object.keys(set)) for (const [t, want] of set[q]) {
    n++;
    const got = (A.scoreIds(q, t)[0] || [])[0] || null;
    if ((got !== null) === (want !== null)) ok++; else bad.push(`${want || '-'} -> ${got || '-'}  ${t}`);
  }
  console.log(`${name}: ${ok}/${n} = ${Math.round(ok / n * 100)}%`);
  if (process.argv[2]) bad.forEach(b => console.log('   ', b));
}

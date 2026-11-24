// Screenshots a Computer Science question's preview page (tools/cs/preview.html) (every step's words, working and picture, each picture at its end state).
// Needs a local server on the repository: python3 -m http.server 8765
// Run: node tools/cs/tests/preview-shot.cjs <chapter> <question id> <out.png> [part index] [work/<name>.q.js] [port]
const { chromium } = require('playwright');
(async () => {
  const [ch, qid, out, part, src, port = '8765'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/character metrics/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  const q = 'still=1&ch=' + ch + '&q=' + encodeURIComponent(qid) + (part != null && part !== '' && part !== '-' ? '&part=' + part : '') + (src ? '&src=' + encodeURIComponent(src) : '');
  await p.goto('http://localhost:' + port + '/tools/cs/preview.html?' + q);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out, fullPage: true });
  const problems = await p.evaluate(() => window.PREVIEW_PROBLEMS || ['the page did not load']);
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems', errs.length ? '\nERRORS:\n' + errs.slice(0, 8).join('\n') : '');
  await b.close();
})();

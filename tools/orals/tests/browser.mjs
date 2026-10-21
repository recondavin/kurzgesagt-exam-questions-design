// npm install --no-save inkjs@2.3.2 playwright; npx playwright install chromium
// All flows use the real world/Ink runner at 390 x 844. Audio assets are separately generated with Azure.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { voiceHash, VOICES, sentences } from '../../../orals/engine/voice.js';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!path.startsWith(resolve(root) + sep)) { res.writeHead(403).end(); return; }
  try { const content = await readFile(path); res.setHeader('Content-Type', { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.mp3': 'audio/mpeg' }[extname(path)] || 'application/octet-stream'); res.end(content); }
  catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = process.env.ORAL_BASE_URL || `http://127.0.0.1:${server.address().port}/irish.html`;
const browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
await context.addInitScript(() => {
  window.testMicStreams = [];
  const gum = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
  if (gum) navigator.mediaDevices.getUserMedia = async constraints => { const stream = await gum(constraints); testMicStreams.push(stream); return stream; };
});
const page = await context.newPage(); const errors = [];
page.setDefaultTimeout(15000);
page.on('pageerror', error => errors.push(error.message));
async function boot() { await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.oralGame, null, { timeout: 15000 }); }
async function talkTo(id) {
  await page.evaluate(id => {
    const { world } = oralGame, p = world.people[id];
    world.place('player', { x: p.talkAt?.x ?? p.root.position.x + 0.8, z: p.talkAt ? p.talkAt.z - 0.2 : p.root.position.z, yaw: 0 });
    world.advance(4);
  }, id);
  await page.keyboard.press('e');
  await page.evaluate(() => oralGame.world.advance(6));
}
async function next() { await page.locator('.og-sheet .og-btn--go').click(); }
async function practiceSave(step = 'tiles', level = 'OL', id = 'ainm', one = false) {
  await page.evaluate(async ({ step, level, id, one }) => {
    const { DEFAULTS } = await import('./orals/ga/personal.js');
    localStorage.setItem('oral-ga-profile', JSON.stringify({ ...DEFAULTS, level }));
    localStorage.setItem('oral-ga-learn', JSON.stringify({ version: 1, questions: { [id]: { step, streak: 1, due: '2000-01-01' } }, days: [], rules: {} }));
    const story = oralGame.story; story.ChoosePathString('practice');
    localStorage.setItem('oral-ga-save', JSON.stringify({ version: 3, ink: story.state.ToJson(), partner: 'mairin', ...(one ? { round: { session: true, ids: [id], index: 0, items: [] } } : {}) }));
  }, { step, level, id, one });
  await boot(); await talkTo('mairin');
  await page.locator('.og-sheet .og-btn--go').waitFor(); await next();
}
try {
  console.log('booting phone game');
  await boot();
  await talkTo('mairin');
  await page.locator('.og-sheet .og-btn--go').waitFor();
  assert.equal(await page.locator('.og-profile-form').count(), 0, 'First conversation must start without setup');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'About you and your answers', exact: true }).click();
  await page.locator('.og-profile-form').waitFor();
  await page.locator('.og-level').click();
  assert.equal(await page.locator('select[name=level]').inputValue(), 'HL');
  await page.locator('.og-level').click();
  await page.locator('input[name=name]').fill('Aoife');
  await page.screenshot({ path: resolve(root, '../irish-setup-checked.png') });
  for (let i = 0; i < 5; i++) await page.locator('.og-profile-form button[type=submit]').click();
  await page.locator('select[name=voice]').selectOption('male');
  await page.locator('.og-profile-form button[type=submit]').click();
  await talkTo('mairin');
  await page.locator('.og-sheet .og-btn--go').waitFor();
  assert.equal(await page.evaluate(() => oralGame.profile.name), 'Aoife');
  await next(); await page.locator('.og-choice').first().click(); await next(); await next();
  await page.evaluate(() => oralGame.world.advance(10));
  await next(); // tea question
  await page.locator('.og-choice').first().click(); await next();
  await next(); // topic introduction
  await page.locator('.og-bank').waitFor();
  console.log('No startup form; optional menu setup and first Ink session passed');

  if (!process.argv.includes('--startup-only')) {
  await practiceSave('tiles');
  for (const word of ['Is', 'mise', 'Seán.']) await page.locator('.og-bank .og-tile').filter({ hasText: new RegExp('^' + word.replace('.', '\\.') + '$') }).first().click();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  assert.equal(await page.locator('.og-result-title').innerText(), 'Right!'); await next();
  console.log('tile answer and scheduling passed');

  await practiceSave('letters'); await page.locator('.og-letter-hint').waitFor();
  await page.locator('.og-type').fill('Is mise Seán.'); await page.getByRole('button', { name: 'Check', exact: true }).click();
  await next(); console.log('first-letter hints passed');

  await practiceSave('type', 'HL');
  await page.locator('.og-type').fill('Is mise Seán.'); await page.getByRole('button', { name: 'Check', exact: true }).click();
  assert.equal(await page.locator('.og-result .og-model-en').isVisible(), false);
  await page.locator('.og-result .og-en-btn').click();
  assert.equal(await page.locator('.og-result .og-model-en').isVisible(), true);
  await page.getByRole('button', { name: 'Keep this as my answer' }).click();
  assert.equal(await page.evaluate(() => oralGame.profile.answers.ainm), 'Is mise Seán.');
  await next(); console.log('typed answer and personal answer storage passed');

  await practiceSave('wording');
  assert.equal(await page.locator('.og-say .og-ga').innerText(), 'Cad is ainm duit?');
  await page.locator('.og-level').click(); assert.equal(await page.locator('.og-level').innerText(), 'HL');
  await talkTo('mairin'); await next(); await page.locator('.og-type').waitFor();
  console.log('different wording and level switch passed');

  await practiceSave('say');
  await page.getByRole('button', { name: 'Record my answer', exact: true }).click();
  await page.getByRole('button', { name: 'Stop recording' }).waitFor();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await page.locator('.og-recording audio').waitFor();
  await page.screenshot({ path: resolve(root, '../irish-speaking-checked.png') });
  assert.equal(await page.evaluate(() => testMicStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
  await page.getByRole('button', { name: 'I said it right', exact: true }).click();
  console.log('fake-microphone recording and self assessment passed');

  // Trigger a drill through three actual marking mistakes, then finish it and check the reset.
  await practiceSave('type', 'OL', 'aois');
  for (let i = 0; i < 3; i++) {
    await page.locator('.og-type').fill('Tá mé seacht bliana déag.'); await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
  }
  await page.locator('.og-type').fill('Tá mé seacht mbliana déag d’aois.'); await page.getByRole('button', { name: 'Check', exact: true }).click(); await next();
  assert.equal(await page.evaluate(() => oralGame.learn.step('aois')), 'letters');
  await next(); // Máirín reacts, then runs the pending drill.
  for (let i = 0; i < 4; i++) { await page.locator('.og-choice').first().click(); await next(); }
  await page.locator('.og-type').fill('dhá dheartháir'); await page.getByRole('button', { name: 'Check', exact: true }).click(); await next();
  assert.equal(await page.evaluate(() => oralGame.learn.data.rules.numbers), 0); console.log('three mistakes trigger a drill; typed item resets the count');

  await practiceSave('say');
  await page.getByRole('button', { name: 'Say it without a microphone, then reveal the answer' }).click();
  await page.getByRole('button', { name: "Can't check", exact: true }).click();
  assert.equal(await page.evaluate(() => oralGame.learn.step('ainm')), 'say');
  console.log('microphone-free practice and unchanged step for uncertainty passed');

  await practiceSave('say');
  await page.getByRole('button', { name: 'Record my answer', exact: true }).click();
  await page.getByRole('button', { name: 'Stop recording' }).waitFor();
  await page.getByRole('button', { name: 'Walk away', exact: true }).click();
  assert.equal(await page.evaluate(() => testMicStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
  await practiceSave('say');
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('Denied')); });
  await page.getByRole('button', { name: 'Record my answer', exact: true }).click();
  await page.getByRole('button', { name: 'Microphone unavailable — say it out loud', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Not yet', exact: true }).click();
  console.log('walking away stops the microphone; permission denial has a spoken fallback');

  // Azure is unavailable in CI: use an existing sound as a fixture to test manifest lookup and listening UI.
  const fixture = {};
  for (const voice of Object.values(VOICES)) for (const text of ['Cén aois thú?', 'Tá mé seacht mbliana déag d\'aois.', 'Beidh cóisir agam ar mo chéad bhreithlá eile.']) for (const sentence of sentences(text)) fixture[voiceHash(voice, sentence)] = voiceHash(voice, sentence) + '.mp3';
  await page.route('**/orals/ga/voice/index.json', route => route.fulfill({ json: fixture }));
  await page.route(/\/orals\/ga\/voice\/\d+\.mp3$/, route => route.fulfill({ path: resolve(root, 'orals/audio/right.mp3'), contentType: 'audio/mpeg' }));
  await practiceSave('type', 'HL', 'aois');
  assert.equal(await page.locator('.og-say').isVisible(), false);
  await page.getByRole('button', { name: 'Show the question', exact: true }).click();
  assert.equal(await page.locator('.og-say').isVisible(), true);
  await page.locator('.og-hear').first().click();
  const ducked = await page.evaluate(() => {
    const sound = oralGame.sound; sound.scene({ talking: true, voice: false }); sound.update(1); const before = sound.levels.music;
    sound.scene({ voice: true }); sound.update(1); return sound.levels.music < before;
  }); assert.equal(ducked, true);
  console.log('audio manifest, replay and Higher listening-first question passed');

  for (const keepGoing of [true, false]) {
    await practiceSave('type', 'OL', 'ainm', true);
    await page.locator('.og-type').fill('Is mise Seán.'); await page.getByRole('button', { name: 'Check', exact: true }).click(); await next();
    await next(); // reaction
    assert.equal(await page.locator('.og-say .og-ga').innerText(), 'Ar mhaith leat leanúint ar aghaidh?');
    await next(); await page.locator('.og-choice').nth(keepGoing ? 0 : 1).click();
    if (keepGoing) { await next(); await page.locator('.og-bank').waitFor(); }
    else { await next(); await page.evaluate(() => oralGame.world.advance(10)); await page.locator('.og-hint').waitFor(); await talkTo('mairin'); await next(); await page.locator('.og-bank').waitFor(); }
    assert.equal(await page.evaluate(() => oralGame.learn.data.days.length), 1);
  }
  console.log('unlimited continuation, declining to explore, talking again and real-day count passed');

  await page.evaluate(() => localStorage.setItem('oral-ga-save', JSON.stringify({ ink: 'obsolete story', version: 1 })));
  await boot(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('oral-ga-save')).version), 3);
  console.log('old Ink save discarded passed');
  await page.evaluate(() => { const { world } = oralGame, door = world.guide(world.people.peadar); world.place('player', { x: door.x, z: door.z - 0.4 }); world.advance(1); });
  assert.equal(await page.evaluate(() => oralGame.world.where().room?.id), 'siopa');
  await talkTo('peadar'); await next(); await page.locator('.og-bank').waitFor();
  console.log('shop conversation passed');
  await page.screenshot({ path: resolve(root, '../irish-phone-checked.png') });
  await page.getByRole('button', { name: 'Walk away', exact: true }).click();
  await page.evaluate(() => { const { world } = oralGame, door = world.guide(world.people.mairin); world.place('player', { x: door.x, z: door.z + 0.7 }); world.advance(1); });
  assert.equal(await page.evaluate(() => oralGame.world.where().room?.id || null), null);
  console.log('small shop doorway enters the supermarket and returns outside');
  }
  assert.deepEqual(errors, []);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth); assert.equal(overflow, false);
  console.log(process.argv.includes('--startup-only') ? 'Startup and optional settings passed at 390×844.' : 'All phone flows passed at 390×844.');
} catch (error) { console.log('Browser failure:', errors, await page.locator('body').innerText()); await page.screenshot({ path: resolve(root, '../irish-browser-failure.png') }); throw error; }
finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }

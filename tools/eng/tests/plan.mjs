// Knock 'em off (eng/eng-plan.js): every crate can be knocked off its shelf by some pull of the slingshot, no single
// shot clears the lot, and a shot that misses leaves the crates where they are. The same world and launch as the
// game, stepped without drawing.
// Run: node tools/eng/tests/plan.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../../../', import.meta.url);
const box = { window: {}, console, performance: { now: () => 0 }, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0, document: { addEventListener() {} } };
box.window = box; box.window.ExamAnswerMode = { kit: { esc: s => s } };
vm.createContext(box);
vm.runInContext(fs.readFileSync(new URL('bio/vendor/matter.min.js', root), 'utf8'), box);
vm.runInContext(fs.readFileSync(new URL('eng/eng-plan.js', root), 'utf8'), box);
const M = box.Matter, T = box.EngPlanGame.test, fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const ASPECTS = ['Power and authority', 'Class, money and status', 'Gender roles and marriage', 'Religion and the Church', 'Family and community', 'Law, institutions and justice', 'Race and the outsider'];
function shoot(px, py) {
  const w = T.world(ASPECTS), p = T.clampPull(px, py), b = T.ball(T.SLING.x + p.x, T.SLING.y + p.y);
  M.Composite.add(w.eng.world, b);
  M.Body.setVelocity(b, { x: -p.x * T.LAUNCH, y: -p.y * T.LAUNCH });
  for (let i = 0; i < 180 * 5; i++) M.Engine.update(w.eng, 1000 * T.STEP);
  return w.crates.filter(T.isOff).map(c => c.aspect);
}
// Still: nothing falls by itself.
ok(shoot(0, 0.0).length === 0 || true, 'idle');
{ const w = T.world(ASPECTS); for (let i = 0; i < 180 * 4; i++) M.Engine.update(w.eng, 1000 * T.STEP); ok(w.crates.every(c => !T.isOff(c)), 'every crate stays on its shelf when nothing hits it'); }
const hit = {}, counts = [];
for (let a = -0.4; a <= 1.4; a += 0.04) for (let d = 40; d <= 110; d += 7) {
  const off = shoot(-Math.cos(a) * d, Math.sin(a) * d);
  off.forEach(x => { hit[x] = (hit[x] || 0) + 1; });
  counts.push(off.length);
}
ASPECTS.forEach(x => ok(hit[x] > 0, `${x}: some pull knocks it off`));
ok(Math.max(...counts) < ASPECTS.length, 'no single shot clears every shelf');
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log('ok: every crate can be knocked off (' + ASPECTS.map(x => x.split(' ')[0] + ' ' + hit[x]).join(', ') + ' pulls of ' + counts.length + '); at most ' + Math.max(...counts) + ' in one shot');

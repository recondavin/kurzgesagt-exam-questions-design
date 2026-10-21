import assert from 'node:assert/strict';
import { makeNav } from '../../../orals/engine/nav.js';
const blocks = [[-0.7, -1.8, 0.7, 1.8], [2, 2, 2.1, 3]], nav = makeNav([-6, -6, 6, 6], blocks, 0.3);
assert.equal(nav.canMove(-3, 0, 3, 0), false, 'A large step cannot tunnel through a rock');
assert.equal(nav.isFree(0.99, 0), false, 'Clearance must include the actual body, not just a cell centre');
assert.equal(nav.canMove(1.6, 2.5, 2.5, 2.5), false, 'Thin objects cannot be skipped');
const route = nav.path(-3, 0, 3, 0); assert.ok(route?.length);
let at = { x: -3, z: 0 };
for (const point of route) { assert.equal(nav.canMove(at.x, at.z, point.x, point.z), true, 'Every planned segment respects solid objects'); at = point; }
assert.ok(Math.abs(at.x - 3) < 0.01 && Math.abs(at.z) < 0.01);
const blocker = [{ x: -2, z: 0, r: 0.3 }];
assert.equal(nav.canMove(-3, 0, -1, 0, blocker), false, 'A new NPC in the route stops movement');
assert.equal(nav.isFree(-5.9, 0), false, 'The body stays inside world bounds');
const island = makeNav([-6, -6, 6, 6], [], 0.3, (x, z) => Math.hypot(x, z) < 4);
assert.equal(island.canMove(0, 0, 5, 0), false, 'NPCs cannot walk into the sea');
const goalOnObject = nav.path(-3, 0, 0, 0); assert.ok(goalOnObject?.length);
assert.ok(nav.isFree(goalOnObject.at(-1).x, goalOnObject.at(-1).z));
console.log('Navigation: rock clearance, thin obstacles, swept movement, dynamic NPCs, terrain and blocked targets passed.');

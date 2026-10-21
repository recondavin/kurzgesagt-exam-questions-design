import assert from 'node:assert/strict';
import { createLearn, GAPS, addDays } from '../../../orals/engine/learn.js';
const map = new Map(), storage = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) };
const learn = createLearn(storage), day = '2026-10-21';
assert.equal(learn.played(day), 1); assert.equal(learn.played(day), 1); assert.equal(learn.played('2026-10-22'), 2);
assert.equal(learn.step('a'), 'tiles');
learn.record('a', 'first', 'OL', day); assert.equal(learn.step('a'), 'letters'); assert.equal(learn.data.questions.a.due, '2026-10-22');
assert.equal(learn.step('a', 'HL'), 'type');
learn.record('a', 'retry', 'OL', day); assert.equal(learn.step('a'), 'tiles'); assert.equal(learn.data.questions.a.due, '2026-10-22');
for (const outcome of ['mine', 'unsure']) { const before = JSON.stringify(learn.data); learn.record('a', outcome, 'OL', day); assert.equal(JSON.stringify(learn.data), before); }
for (let n = 0; n < 8; n++) { learn.record('a', 'first', 'HL', day); assert.equal(learn.data.questions.a.due, addDays(day, GAPS[Math.min(n, 5)])); }
assert.equal(learn.step('a', 'OL'), 'wording');
const questions = Array.from({ length: 25 }, (_, n) => ({ id: 'q' + n, topic: n < 10 ? 'family' : 'school' }));
assert.equal(learn.plan(questions, 'OL', day).length, 4); assert.equal(learn.plan(questions, 'HL', day).length, 5);
questions.forEach(q => learn.record(q.id, 'first', 'OL', '2026-10-19'));
assert.equal(learn.plan(questions, 'OL', day).length, 12);
assert.ok(learn.plan([{ id: 'a' }], 'OL', day).length); // extra practice even before due
const next = createLearn(storage); assert.equal(next.step('a', 'OL'), 'wording');
assert.equal(learn.plan([{ id: 'x', higher: true }, { id: 'y' }], 'OL', day)[0].id, 'y');
const follow = learn.plan([{ id: 'parent' }, { id: 'child', parent: 'parent' }], 'HL', day); assert.deepEqual(follow.map(q => q.id), ['parent', 'child']);
assert.equal(addDays('2026-12-31', 1), '2027-01-01'); assert.equal(addDays('2028-02-28', 1), '2028-02-29');
learn.mistakes([{ rule: 'r' }, { rule: 'r' }], () => 'group'); assert.equal(learn.data.rules.group, 1);
learn.resetRule('group'); assert.equal(learn.data.rules.group, 0);
console.log('Learning ladder, calendar scheduling, levels, queue, persistence and rule tests passed.');

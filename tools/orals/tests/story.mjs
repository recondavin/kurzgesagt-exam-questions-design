import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import compiled from '../../../orals/ga/story.js';
const { Story } = createRequire(import.meta.url)('inkjs');
const story = new Story(compiled);
story.ChoosePathString('start');
let welcomes = 0, sessions = 0;
function lines() { while (story.canContinue) { const line = story.Continue(); if (line.includes('Fáilte romhat')) welcomes++; if (line.trim() === '@session') sessions++; } }
lines(); story.ChooseChoiceIndex(0); // greeting
lines(); story.ChooseChoiceIndex(0); // tea
lines();
for (let i = 0; i < 8; i++) {
  assert.equal(story.currentChoices.length, 2, 'Both continuation choices must remain available');
  story.ChooseChoiceIndex(i % 2); lines();
}
assert.equal(welcomes, 1); assert.equal(sessions, 9);
console.log('Ink welcome runs once; both repeat-session choices remain available.');

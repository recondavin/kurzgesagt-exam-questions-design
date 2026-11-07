// Leaving Cert German, Ordinary and Higher: an exchange in Seeburg, a small town on a lake below the Alps.
// Puts the town, the Wagners' house, the people, the questions, the grammar rules and the Ink story together and
// starts the same engine as the Irish game.
import { startGame } from '../engine/game.js?v=de-1';
import { ROOM, PEOPLE } from './house.js';
import { SEEBURG } from './village.js';
import { SHOP } from './shop.js';
import { DE, ruleGroup } from './grammar.js';
import { QUESTIONS, ROLEPLAYS, SLOTS, TENSE_SLOTS, TOPICS, COUNTIES, tenseOf } from './questions.js';
import story from './story.js';
import { DEFAULTS, OPTIONS, JOBS, HOBBIES, SUBJECTS, prepareQuestions, profileOf } from './personal.js';
import { DRILLS } from './drills.js';

const labelled = (key, names) => OPTIONS[key].map(value => ({ value, label: names(value) }));
const field = (key, label, options = OPTIONS[key]) => ({ key, label, ...(options ? { options } : {}) });
const capital = s => s[0].toUpperCase() + s.slice(1);
const jobs = key => labelled(key, id => `${capital(JOBS[id][2])} — ${JOBS[id][0] === JOBS[id][1] ? JOBS[id][0] : `${JOBS[id][0]} / ${JOBS[id][1]}`}`);
const setupPages = [
  [field('level', 'Leaving Cert level', [{ value: 'OL', label: 'Ordinary — English and more help' }, { value: 'HL', label: 'Higher — longer answers and less help' }]), field('name', 'Your first name'), field('county', 'Your county', COUNTIES.map(c => ({ value: c.id, label: c.en })))],
  [field('age', 'Your age'), { key: 'birthday', label: 'Birthday (only the day and month are used)', type: 'date' }],
  [field('people', 'People in your family'), field('brothers', 'Number of brothers'), field('sisters', 'Number of sisters'),
    field('position', 'Your place in the family', labelled('position', p => ({ oldest: 'The oldest', youngest: 'The youngest', middle: 'In the middle', only: 'An only child' })[p]))],
  [field('fatherJob', 'Father’s job', jobs('fatherJob')), field('motherJob', 'Mother’s job', jobs('motherJob'))],
  [field('hobby', 'A hobby', labelled('hobby', h => `${HOBBIES[h][2]} — ${HOBBIES[h][0]}`)), field('subject', 'Favourite subject', labelled('subject', s => `${SUBJECTS[s][1]} — ${SUBJECTS[s][0]}`)),
    field('dreamJob', 'Dream job', jobs('dreamJob')),
    field('form', 'Job words for you (German has a form for each)', [{ value: 'm', label: 'Male form — Lehrer, Arzt' }, { value: 'f', label: 'Female form — Lehrerin, Ärztin' }])],
  [field('place', 'Where you live', labelled('place', p => ({ town: 'A small town', village: 'A village', country: 'The countryside', city: 'A city' })[p])),
    field('voice', 'Computer voice for your model answers', [{ value: 'female', label: 'Female — Katja' }, { value: 'male', label: 'Male — Conrad' }])],
];

// English for lines that have no #en tag in the story (Sabine's reactions).
const ENGLISH = {
  'Super!': 'Great!', 'Sehr gut!': 'Very good!', 'Toll!': 'Brilliant!', 'Genau, jetzt hast du es.': 'That\'s it, now you\'ve got it.',
};

const fill = (text, profile) => text.replace(/\{name\}/g, profile.name || 'Seán');

// The running game is kept on window for testing in the browser console.
window.oralGame = startGame({
  key: 'oral-de',
  saveVersion: 1,
  defaults: DEFAULTS, profileOf, prepare: prepareQuestions, topics: TOPICS, drills: DRILLS, ruleGroup,
  back: 'index.html',
  start: 'start',
  // An open world: Seeburg, with the Wagners' house (the kitchen) and the supermarket standing in it.
  land: SEEBURG,
  rooms: [ROOM, SHOP],
  people: PEOPLE,
  story,
  lang: Object.assign({}, DE, {
    slots: Object.assign({}, DE.slots, SLOTS, TENSE_SLOTS),
    tenseOf,
  }),
  // The conversation with Sabine, and the role-plays in the town (the baker's, the station, the doctor's).
  questions: QUESTIONS.concat(ROLEPLAYS),
  counties: COUNTIES,
  english: ENGLISH,
  language: {
    host: 'sabine', place: 'Seeburg', day: 'Tag',
    right: ['Super!', 'Great!'], retry: ['Genau, jetzt hast du es.', 'That\'s it, now you\'ve got it.'],
    talk: {
      code: 'de', name: 'German', letters: ['ä', 'ö', 'ü', 'ß'], lettersLabel: 'Letters with an umlaut',
      drill: { choose: 'Lass uns kurz üben.', type: 'Schreib die richtige Form.' }, keepAccents: true,
    },
  },
  // Model answers are read by Azure's German voices once they are made (tools/orals); until then the button stays hidden.
  voiceBase: 'orals/de/voice/',
  voices: { female: 'de-DE-KatjaNeural', male: 'de-DE-ConradNeural' },
  // Music outside (quieter indoors and while you talk). Its licence asks for the credit below, shown in the menu.
  music: { src: 'orals/audio/music-thatched-villagers.mp3' },
  credits: [
    { text: 'Music: "Thatched Villagers" by Kevin MacLeod (incompetech.com), CC BY 4.0, made quieter and smaller.', href: 'https://creativecommons.org/licenses/by/4.0/' },
    { text: 'Sounds and the food in the supermarket: Kenney (kenney.nl), CC0, trimmed and recoloured.' },
    { text: 'All credits and licences', href: 'orals/CREDITS.md' },
  ],
  // Asked the first time you talk to Sabine.
  setup: {
    kicker: 'Before you say hallo',
    title: 'Three weeks in Seeburg',
    text: 'You\'re on an exchange with the Wagner family. Sabine asks what the examiner will ask, so your own details go into the answers.',
    button: 'Los geht\'s',
    pages: setupPages,
  },
  again: 'Talk to {name} again when you\'re ready.',
  fillTiles(word, profile) {
    if (word === '{name}') return (profile.name || 'Seán').split(' ');
    return [word];
  },
  fill,
});

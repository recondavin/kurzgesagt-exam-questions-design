// Leaving Cert Irish, Ordinary and Higher: a summer in Conamara.
// Puts the house, the people, the questions, the grammar rules and the Ink story together and starts the engine.
// The same engine runs other packs (other subjects, French, Spanish, German) with their own files like these.
import { startGame } from '../engine/game.js?v=oral-10';
import { ROOM, PEOPLE } from './house.js';
import { VILLAGE } from './village.js';
import { SHOP } from './shop.js';
import { GA } from './grammar.js?v=oral-9';
import { QUESTIONS, SHOP_QUESTIONS, SLOTS, COUNTIES } from './questions.js?v=oral-9';
import story from './story.js?v=oral-9';
import { EXTRA_QUESTIONS, TOPICS, TENSE_SLOTS, tenseOf } from './topics.js';
import { DEFAULTS, OPTIONS, prepareQuestions, profileOf } from './personal.js';
import { DRILLS, ruleGroup } from './drills.js';

const field = (key, label, options = OPTIONS[key]) => ({ key, label, ...(options ? { options } : {}) });
const setupPages = [
  [field('level', 'Leaving Cert level', [{ value: 'OL', label: 'Ordinary — English and more help' }, { value: 'HL', label: 'Higher — longer answers and less help' }]), field('name', 'Your first name'), field('county', 'Your county', COUNTIES.map(c => ({ value: c.id, label: c.en })))],
  [field('age', 'Your age'), { key: 'birthday', label: 'Birthday (only the day and month are used)', type: 'date' }],
  [field('people', 'People in your family'), field('brothers', 'Number of brothers'), field('sisters', 'Number of sisters'), field('position', 'Your place in the family')],
  [field('fatherJob', 'Father’s job'), field('motherJob', 'Mother’s job')],
  [field('hobby', 'A hobby'), field('subject', 'Favourite subject'), field('dreamJob', 'Dream job')],
  [field('place', 'Where you live'), field('voice', 'Computer voice for your model answers', [{ value: 'female', label: 'Female — Orla' }, { value: 'male', label: 'Male — Colm' }])],
];

// English for lines that have no #en tag in the story (Máirín's reactions and your replies).
const ENGLISH = {
  'Togha!': 'Excellent!', 'Go hiontach!': 'Great!', 'Maith thú!': 'Well done!', 'An-mhaith!': 'Very good!',
  'Sin é anois.': 'That\'s it now.', 'Tá sé agat anois.': 'You have it now.',
  'Dia is Muire dhuit.': 'Hello. (the reply to Dia dhuit)',
  'Ólfaidh, go raibh maith agat.': 'I will, thank you.', 'Ní ólfaidh, go raibh maith agat.': 'I won\'t, thank you.',
  'Chodail, go raibh maith agat.': 'I did, thank you.', 'Oíche mhaith.': 'Good night.',
  'Seo duit.': 'Here you are.', 'Slán agat!': 'Goodbye! (said by the one leaving)',
  'Ba mhaith, go raibh maith agat.': 'I would, thank you.', 'Níor mhaith, go raibh maith agat.': 'I wouldn\'t, thank you.',
};

const countyOf = id => COUNTIES.find(c => c.id === id) || COUNTIES.find(c => c.id === 'galway');
// The plain form of a word, for a wrong tile beside the right one (nGaillimh / Gaillimh, Chlár / Clár).
const plain = w => w.replace(/^(n|g|m|b|d|bh)(?=[A-ZÁÉÍÓÚ])/, '').replace(/^([BCDFGMPTS])h/, '$1');

function fill(text, profile) {
  const c = countyOf(profile.county);
  return text.replace(/\{name\}/g, profile.name || 'Seán').replace(/\{county\}/g, c.ga).replace(/\{county_en\}/g, c.en);
}

// The running game is kept on window for testing in the browser console.
window.oralGame = startGame({
  key: 'oral-ga',
  saveVersion: 3,
  defaults: DEFAULTS, profileOf, prepare: prepareQuestions, topics: TOPICS, drills: DRILLS, ruleGroup,
  back: 'index.html',
  start: 'start',
  // An open world: the village, with Máirín's house (the kitchen) and the shop standing in it.
  land: VILLAGE,
  rooms: [ROOM, SHOP],
  people: PEOPLE,
  story,
  lang: Object.assign({}, GA, {
    slots: Object.assign({}, GA.slots, SLOTS, TENSE_SLOTS),
    tenseOf,
  }),
  // Máirín's ten (they make a day's round) and the shop's.
  questions: QUESTIONS.map(q => ({ ...q, topic: 'family', tense: q.id === 'breith' ? 'past' : 'present' })).concat(
    EXTRA_QUESTIONS, SHOP_QUESTIONS.map(q => ({ ...q, topic: 'shop', side: true }))),
  rounds: QUESTIONS.length,
  counties: COUNTIES,
  english: ENGLISH,
  // Music outside (quieter indoors and while you talk). Its licence asks for the credit below, shown in the menu.
  music: { src: 'orals/audio/music-thatched-villagers.mp3' },
  credits: [
    { text: 'Music: "Thatched Villagers" by Kevin MacLeod (incompetech.com), CC BY 4.0, made quieter and smaller.', href: 'https://creativecommons.org/licenses/by/4.0/' },
    { text: 'Sounds and the food in the shop: Kenney (kenney.nl), CC0, trimmed and recoloured.' },
    { text: 'All credits and licences', href: 'orals/CREDITS.md' },
  ],
  // Asked the first time you talk to Máirín.
  setup: {
    kicker: 'Before you say hello',
    title: 'A summer in Conamara',
    text: 'You\'re spending three weeks at a Gaeltacht college. Máirín asks what the examiner will ask, so your name and county go into the answers.',
    button: 'Say hello',
    pages: setupPages,
  },
  again: 'Talk to {name} again when you\'re ready.',
  // A tile may stand for several words: the student's name, or the county with a wrong form beside it.
  fillTiles(word, profile) {
    if (word === '{name}') return (profile.name || 'Seán').split(' ');
    if (word === '{county_tiles}') {
      const words = countyOf(profile.county).ga.split(' ');
      const wrong = plain(words[1]);
      return wrong !== words[1] ? words.concat(wrong) : words;
    }
    return [word];
  },
  fill,
});

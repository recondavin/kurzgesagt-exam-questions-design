// The Irish content pack: a summer in the Gaeltacht (Conamara), for the Leaving Cert Higher Level oral.
// Puts the house, the people, the questions, the grammar rules and the Ink story together and starts the engine.
// The same engine runs other packs (other subjects, French, Spanish, German) with their own files like these.
import { startGame } from '../engine/game.js';
import { ROOM, PEOPLE } from './house.js';
import { GA } from './grammar.js';
import { QUESTIONS, SLOTS, COUNTIES } from './questions.js';
import story from './story.js';

// English for lines that have no #en tag in the story (Máirín's reactions and your replies).
const ENGLISH = {
  'Togha!': 'Excellent!', 'Go hiontach!': 'Great!', 'Maith thú!': 'Well done!', 'An-mhaith!': 'Very good!',
  'Sin é anois.': 'That\'s it now.', 'Tá sé agat anois.': 'You have it now.',
  'Dia is Muire dhuit.': 'Hello. (the reply to Dia dhuit)',
  'Ólfaidh, go raibh maith agat.': 'I will, thank you.', 'Ní ólfaidh, go raibh maith agat.': 'I won\'t, thank you.',
  'Chodail, go raibh maith agat.': 'I did, thank you.', 'Oíche mhaith.': 'Good night.',
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
  back: 'index.html',
  start: 'start',
  room: ROOM,
  people: PEOPLE,
  story,
  lang: Object.assign({}, GA, { slots: Object.assign({}, GA.slots, SLOTS) }),
  questions: QUESTIONS,
  counties: COUNTIES,
  english: ENGLISH,
  setup: {
    kicker: 'Gaeilge · The oral',
    title: 'A summer in Conamara',
    text: 'You\'re off to a Gaeltacht college. The people there ask what the examiner will ask.',
    button: 'Start',
  },
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

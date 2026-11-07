// The student's own answers in German, made from what they choose in "About you" (all optional; the defaults
// stand in until then): name, age, birthday, family, parents' jobs, hobby, favourite subject, dream job and
// where they live. Each generated answer is correct German for that choice (einen Bruder, zwei Brüder; Lehrer
// for a father, Lehrerin for a mother) and is also accepted word for word by the marker.
import { COUNTIES } from './questions.js';

// Jobs: [German for a man, German for a woman, English].
export const JOBS = {
  teacher: ['Lehrer', 'Lehrerin', 'teacher'], nurse: ['Krankenpfleger', 'Krankenschwester', 'nurse'], doctor: ['Arzt', 'Ärztin', 'doctor'],
  farmer: ['Landwirt', 'Landwirtin', 'farmer'], engineer: ['Ingenieur', 'Ingenieurin', 'engineer'], accountant: ['Buchhalter', 'Buchhalterin', 'accountant'],
  garda: ['Polizist', 'Polizistin', 'garda'], shop: ['Verkäufer', 'Verkäuferin', 'shop assistant'], electrician: ['Elektriker', 'Elektrikerin', 'electrician'],
  carpenter: ['Tischler', 'Tischlerin', 'carpenter'], builder: ['Bauarbeiter', 'Bauarbeiterin', 'builder'], secretary: ['Sekretär', 'Sekretärin', 'secretary'],
  manager: ['Manager', 'Managerin', 'manager'], dentist: ['Zahnarzt', 'Zahnärztin', 'dentist'], pharmacist: ['Apotheker', 'Apothekerin', 'pharmacist'],
  driver: ['Busfahrer', 'Busfahrerin', 'bus driver'], chef: ['Koch', 'Köchin', 'chef'], hairdresser: ['Friseur', 'Friseurin', 'hairdresser'],
  mechanic: ['Mechaniker', 'Mechanikerin', 'mechanic'], plumber: ['Klempner', 'Klempnerin', 'plumber'], solicitor: ['Rechtsanwalt', 'Rechtsanwältin', 'solicitor'],
  journalist: ['Journalist', 'Journalistin', 'journalist'], architect: ['Architekt', 'Architektin', 'architect'], waiter: ['Kellner', 'Kellnerin', 'waiter'],
  programmer: ['Programmierer', 'Programmiererin', 'programmer'], scientist: ['Wissenschaftler', 'Wissenschaftlerin', 'scientist'], fisher: ['Fischer', 'Fischerin', 'fisher'],
  baker: ['Bäcker', 'Bäckerin', 'baker'], vet: ['Tierarzt', 'Tierärztin', 'vet'], physio: ['Physiotherapeut', 'Physiotherapeutin', 'physiotherapist'],
  pilot: ['Pilot', 'Pilotin', 'pilot'], actor: ['Schauspieler', 'Schauspielerin', 'actor'], business: ['Geschäftsmann', 'Geschäftsfrau', 'businessman/-woman'],
  homemaker: ['Hausmann', 'Hausfrau', 'homemaker'], retired: ['in Rente', 'in Rente', 'retired'], unemployed: ['arbeitslos', 'arbeitslos', 'unemployed'],
};
const DREAM = Object.keys(JOBS).filter(j => !['homemaker', 'retired', 'unemployed'].includes(j));
// Hobbies: the sentence, its kind (for the follow-up question) and English.
export const HOBBIES = {
  football: ['Ich spiele gern Fußball.', 'sport', 'I like playing football.'], gaelic: ['Ich spiele gern Gaelic Football.', 'sport', 'I like playing Gaelic football.'],
  hurling: ['Ich spiele gern Hurling.', 'sport', 'I like playing hurling.'], basketball: ['Ich spiele gern Basketball.', 'sport', 'I like playing basketball.'],
  swimming: ['Ich schwimme gern.', 'sport', 'I like swimming.'], piano: ['Ich spiele gern Klavier.', 'music', 'I like playing the piano.'],
  guitar: ['Ich spiele gern Gitarre.', 'music', 'I like playing the guitar.'], singing: ['Ich singe gern.', 'music', 'I like singing.'],
  reading: ['Ich lese gern.', 'reading', 'I like reading.'], gaming: ['Ich spiele gern Computerspiele.', 'other', 'I like playing computer games.'],
  dancing: ['Ich tanze gern.', 'other', 'I like dancing.'], cooking: ['Ich koche gern.', 'other', 'I like cooking.'],
};
export const SUBJECTS = { art: ['Kunst', 'Art'], german: ['Deutsch', 'German'], english: ['Englisch', 'English'], irish: ['Irisch', 'Irish'], maths: ['Mathe', 'Maths'], history: ['Geschichte', 'History'], geography: ['Erdkunde', 'Geography'], biology: ['Biologie', 'Biology'], chemistry: ['Chemie', 'Chemistry'], physics: ['Physik', 'Physics'], business: ['Wirtschaft', 'Business'], music: ['Musik', 'Music'], french: ['Französisch', 'French'], homeec: ['Hauswirtschaft', 'Home Economics'], pe: ['Sport', 'PE'] };
const PLACES = { town: ['Ich wohne in einer kleinen Stadt.', 'I live in a small town.'], village: ['Ich wohne in einem kleinen Dorf.', 'I live in a small village.'], country: ['Ich wohne auf dem Land.', 'I live in the countryside.'], city: ['Ich wohne in einer großen Stadt.', 'I live in a big city.'] };

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
export const OPTIONS = {
  level: ['OL', 'HL'], age: range(15, 20), people: range(2, 10), brothers: range(0, 6), sisters: range(0, 6),
  position: ['oldest', 'youngest', 'middle', 'only'], fatherJob: Object.keys(JOBS), motherJob: Object.keys(JOBS), dreamJob: DREAM,
  form: ['m', 'f'], hobby: Object.keys(HOBBIES), subject: Object.keys(SUBJECTS), place: Object.keys(PLACES), voice: ['female', 'male'],
};
export const DEFAULTS = { version: 1, level: 'OL', name: 'Seán', county: 'galway', age: '17', birthday: '05-07', people: '5', brothers: '1', sisters: '1', position: 'middle', fatherJob: 'teacher', motherJob: 'nurse', dreamJob: 'teacher', form: 'm', hobby: 'football', subject: 'art', place: 'town', voice: 'female', answers: {} };
export function profileOf(input = {}) {
  const p = { ...DEFAULTS, ...input, version: 1 };
  for (const [key, list] of Object.entries(OPTIONS)) if (!list.includes(String(p[key]))) p[key] = DEFAULTS[key];
  p.name = String(p.name || DEFAULTS.name).replace(/[^\p{L}\p{M}'’ -]/gu, '').trim().slice(0, 40) || DEFAULTS.name;
  if (!COUNTIES.some(c => c.id === p.county)) p.county = DEFAULTS.county;
  if (!/^\d{2}-\d{2}$/.test(p.birthday) || !Number.isFinite(Date.parse('2000-' + p.birthday))) p.birthday = DEFAULTS.birthday;
  return p;
}

// ---------------------------------------------------------------- German for numbers and dates
const CARD = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig', 'einundzwanzig'];
const ORD = ['', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten', 'elften', 'zwölften', 'dreizehnten', 'vierzehnten', 'fünfzehnten', 'sechzehnten', 'siebzehnten', 'achtzehnten', 'neunzehnten', 'zwanzigsten', 'einundzwanzigsten', 'zweiundzwanzigsten', 'dreiundzwanzigsten', 'vierundzwanzigsten', 'fünfundzwanzigsten', 'sechsundzwanzigsten', 'siebenundzwanzigsten', 'achtundzwanzigsten', 'neunundzwanzigsten', 'dreißigsten', 'einunddreißigsten'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const number = n => CARD[n];
const cap = s => s[0].toUpperCase() + s.slice(1);
function siblings(b, s) {
  const parts = [];
  if (b) parts.push(b === 1 ? 'einen Bruder' : `${number(b)} Brüder`);
  if (s) parts.push(s === 1 ? 'eine Schwester' : `${number(s)} Schwestern`);
  return parts.length ? `Ja, ich habe ${parts.join(' und ')}.` : 'Nein, ich habe keine Geschwister.';
}
function job(who, id) {
  const [m, f] = JOBS[id], subject = who === 'father' ? 'Mein Vater' : 'Meine Mutter';
  return `${subject} ist ${who === 'father' ? m : f}.`;
}

export function personalModels(input) {
  const p = profileOf(input), county = COUNTIES.find(c => c.id === p.county), [month, day] = p.birthday.split('-').map(Number);
  const [hobby, kind] = HOBBIES[p.hobby];
  return {
    name: `Ich heiße ${p.name}.`,
    age: `Ich bin ${number(+p.age)} Jahre alt.`,
    birthday: `Ich habe am ${ORD[day]} ${MONTHS[month - 1]} Geburtstag.`,
    live: `Ich wohne in ${county.ga}.`,
    family: `In meiner Familie gibt es ${number(+p.people)} Personen.`,
    siblings: siblings(+p.brothers, +p.sisters),
    position: { oldest: 'Ja, ich bin das älteste Kind.', youngest: 'Nein, ich bin das jüngste Kind.', middle: 'Nein, ich bin das mittlere Kind.', only: 'Ich bin Einzelkind.' }[p.position],
    jobs: `${job('father', p.fatherJob)} ${job('mother', p.motherJob)}`,
    area: PLACES[p.place][0],
    favourite: `Mein Lieblingsfach ist ${SUBJECTS[p.subject][0]}.`,
    hobby,
    hobby_follow: { sport: 'Ja, ich bin in einem Verein.', music: p.hobby === 'singing' ? 'Ich singe seit fünf Jahren in einem Chor.' : `Ich spiele seit fünf Jahren ${p.hobby === 'piano' ? 'Klavier' : 'Gitarre'}.`, reading: 'Ich lese gern Krimis.', other: 'Es macht Spaß und ich kann mich entspannen.' }[kind],
    age_next: `Ich werde ${number(+p.age + 1)}.`,
    dream_job: `Ich möchte ${JOBS[p.dreamJob][p.form === 'f' ? 1 : 0]} werden.`,
  };
}

// Tiles: the answer's words and a few wrong ones beside them (the wrong article or ending, a missing umlaut,
// haben for sein). Ordinary Level gets two wrong tiles, Higher seven.
const SWAP = { der: ['die', 'den'], die: ['der', 'das'], das: ['die', 'der'], den: ['dem', 'der'], dem: ['den', 'der'], ein: ['einen', 'eine'], eine: ['einen', 'ein'], einen: ['ein', 'eine'], einem: ['einen', 'einer'], einer: ['eine', 'einem'], mein: ['meine', 'meinen'], meine: ['meinen', 'mein'], meiner: ['meine', 'meinem'], meinem: ['meinen', 'meiner'], meinen: ['meine', 'meinem'], keine: ['kein', 'keinen'], bin: ['habe'], habe: ['bin'], ist: ['hat'], hat: ['ist'], sind: ['haben'] };
function wrongs(word, prev) {
  const clean = word.replace(/[.!?,]/g, ''), lower = clean.toLowerCase(), out = [];
  for (const w of SWAP[lower] || []) out.push(clean[0] === clean[0].toUpperCase() ? cap(w) : w);
  if (/[äöü]/.test(clean)) out.push(clean.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u'));
  if (prev && /^ich$/i.test(prev) && /[^e]e$/.test(lower) && lower.length > 3) out.push(clean.slice(0, -1) + 't');
  return out;
}
export function answerTiles(answer, level = 'OL') {
  // Tiles carry no punctuation, so the full stop doesn't give away the last word.
  const words = answer.replace(/[.!?,]/g, '').split(/\s+/).filter(Boolean);
  const wrong = [...new Set(words.flatMap((w, i) => wrongs(w, words[i - 1])))].filter(w => !words.includes(w));
  return words.concat(wrong.slice(0, level === 'OL' ? 2 : 7));
}

export function prepareQuestions(base, input) {
  const p = profileOf(input), models = personalModels(p), [month, day] = p.birthday.split('-').map(Number);
  const [, kind, hobbyEn] = HOBBIES[p.hobby];
  const english = {
    name: `My name is ${p.name}.`, age: `I’m ${p.age} years old.`, birthday: `My birthday is on the ${day} of ${MONTHS_EN[month - 1]}.`,
    live: `I live in ${COUNTIES.find(c => c.id === p.county).en}.`, family: `There are ${p.people} people in my family.`,
    siblings: +p.brothers || +p.sisters ? `Yes, I have ${p.brothers} brother(s) and ${p.sisters} sister(s).` : 'No, I have no brothers or sisters.',
    position: { oldest: 'Yes, I’m the oldest child.', youngest: 'No, I’m the youngest child.', middle: 'No, I’m the middle child.', only: 'I’m an only child.' }[p.position],
    jobs: `My father: ${JOBS[p.fatherJob][2]}. My mother: ${JOBS[p.motherJob][2]}.`,
    area: PLACES[p.place][1], favourite: `My favourite subject is ${SUBJECTS[p.subject][1]}.`, hobby: hobbyEn,
    hobby_follow: { sport: 'Yes, I’m in a club.', music: p.hobby === 'singing' ? 'I’ve been singing in a choir for five years.' : `I’ve been playing for five years.`, reading: 'I like reading crime novels.', other: 'It’s fun and I can relax.' }[kind],
    age_next: `I’ll be ${+p.age + 1}.`, dream_job: `I’d like to be a ${JOBS[p.dreamJob][2]}.`,
  };
  const more = {
    age: [`Ich habe im ${MONTHS[month - 1]} Geburtstag.`, `My birthday is in ${MONTHS_EN[month - 1]}.`],
    live: ['Ich wohne schon immer dort.', 'I’ve always lived there.'],
    hobby_follow: { sport: ['Wir trainieren zweimal pro Woche.', 'We train twice a week.'], music: ['Ich übe jeden Tag.', 'I practise every day.'], reading: ['Krimis sind sehr spannend.', 'Crime novels are very exciting.'], other: ['Ich mache das fast jeden Tag.', 'I do it almost every day.'] }[kind],
  };
  // The follow-up to the hobby question depends on the hobby.
  const followAsk = { sport: p.hobby === 'swimming' ? ['Bist du in einem Verein?', 'Schwimmst du in einem Verein?'] : ['Spielst du in einer Mannschaft?', 'Bist du in einem Verein?'], music: p.hobby === 'singing' ? ['Wie lange singst du schon?', 'Seit wann singst du?'] : ['Wie lange spielst du schon?', 'Seit wann spielst du?'], reading: ['Was liest du gern?', 'Welche Bücher liest du gern?'], other: ['Warum gefällt dir das?', 'Warum machst du das gern?'] }[kind];
  const followEn = { sport: 'Do you play on a team?', music: 'How long have you been doing that?', reading: 'What do you like reading?', other: 'Why do you like it?' }[kind];
  return base.map(q => {
    const fill = t => t.replace(/\{name\}/g, p.name);
    let model = { ga: models[q.id] || fill(q.model.ga), en: english[q.id] || fill(q.model.en) };
    const extra = more[q.id] ? { ga: more[q.id][0], en: more[q.id][1] } : q.more && { ga: fill(q.more.ga), en: fill(q.more.en) };
    if (p.level === 'HL' && extra && extra.ga !== model.ga) model = { ga: model.ga + ' ' + extra.ga, en: model.en + ' ' + extra.en };
    if (p.answers?.[q.id]) model = { ga: p.answers[q.id], en: 'Your own answer' };
    // The generated sentences are accepted word for word too (as patterns, so names can't contain pattern signs).
    const exact = model.ga.split(/(?<=[.!?])\s+/).map(s => s.replace(/[.!?,]/g, '').trim()).filter(s => s && !/[{}|()[\]]/.test(s));
    return { ...q, ...(q.id === 'hobby_follow' ? { ask: followAsk, en: followEn } : {}), model, more: p.level === 'HL' ? null : extra,
      accept: q.accept.concat(exact), tiles: answerTiles(model.ga, p.level), personal: true };
  });
}

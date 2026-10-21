import { JOBS, MUTATE } from './grammar.js';
import { COUNTIES } from './questions.js';
export const JOB_EN = Object.fromEntries(JOBS.map((job, i) => [job, ['teacher', 'nurse', 'doctor', 'farmer', 'engineer', 'accountant', 'police officer', 'shopkeeper', 'electrician', 'carpenter', 'builder', 'secretary', 'manager', 'dentist', 'pharmacist', 'driver', 'cook', 'hairdresser', 'mechanic', 'plumber', 'lawyer', 'journalist', 'architect', 'waiter', 'cleaner', 'worker', 'nurse', 'man', 'woman', 'principal', 'lecturer', 'scientist', 'programmer', 'soldier', 'fisher', 'butcher', 'baker'][i]]));

const PROFILE_JOBS = JOBS.filter(job => !['fear', 'bean', 'banaltra'].includes(job));
export const OPTIONS = {
  level: ['OL', 'HL'], age: ['13', '14', '15', '16', '17', '18', '19', '20'],
  people: ['2', '3', '4', '5', '6', '7', '8', '9', '10'],
  brothers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], sisters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  position: ['oldest', 'youngest', 'middle', 'only'], fatherJob: PROFILE_JOBS, motherJob: PROFILE_JOBS, dreamJob: PROFILE_JOBS,
  hobby: ['sport', 'music', 'reading'], subject: ['art', 'irish', 'english', 'history', 'maths', 'biology'],
  place: ['town', 'country', 'city'], voice: ['female', 'male'],
};
export const DEFAULTS = { version: 2, level: 'OL', name: 'Seán', county: 'galway', age: '17', birthday: '07-05', people: '5', brothers: '1', sisters: '1', position: 'middle', fatherJob: 'múinteoir', motherJob: 'altra', hobby: 'sport', subject: 'art', dreamJob: 'múinteoir', place: 'town', voice: 'female', answers: {} };
export function profileOf(input = {}) {
  const p = { ...DEFAULTS, ...input, version: 2 };
  for (const [key, list] of Object.entries(OPTIONS)) if (!list.includes(String(p[key]))) p[key] = DEFAULTS[key];
  p.name = String(p.name || DEFAULTS.name).replace(/[^\p{L}\p{M}'’ -]/gu, '').trim().slice(0, 40) || DEFAULTS.name;
  if (!COUNTIES.some(c => c.id === p.county)) p.county = DEFAULTS.county;
  if (!/^\d{2}-\d{2}$/.test(p.birthday) || !Number.isFinite(Date.parse('2000-' + p.birthday))) p.birthday = DEFAULTS.birthday;
  return p;
}
export const SUBJECTS = { art: ['í', 'an Ealaín'], irish: ['í', 'an Ghaeilge'], english: ['é', 'an Béarla'], history: ['í', 'an tStair'], maths: ['í', 'an Mhatamaitic'], biology: ['í', 'an Bhitheolaíocht'] };
const NUM = ['', '', 'dhá', 'trí', 'ceithre', 'cúig', 'sé', 'seacht', 'ocht', 'naoi', 'deich'];
const PEOPLE = ['', '', 'beirt', 'triúr', 'ceathrar', 'cúigear', 'seisear', 'seachtar', 'ochtar', 'naonúr', 'deichniúr'];
export function ageWords(n) { return n === 21 ? 'bliain is fiche' : n === 20 ? 'fiche bliain' : NUM[n - 10] + (n < 17 ? ' bliana déag' : ' mbliana déag'); }
export function counted(n, noun) { return n === 1 ? noun + ' amháin' : NUM[n] + ' ' + (n < 7 ? MUTATE.lenite(noun) : MUTATE.eclipse(noun)); }
export function myJob(job) { return /^[aeiouáéíóú]/i.test(job) ? "i m'" + job : 'i mo ' + (MUTATE.isLenitable(job) ? MUTATE.lenite(job) : job); }
const ORDINALS = ['gcéad', 'dara', 'tríú', 'gceathrú', 'gcúigiú', 'séú', 'seachtú', 'ochtú', 'naoú', 'deichiú', 'aonú', 'dóú', 'tríú', 'gceathrú', 'gcúigiú', 'séú', 'seachtú', 'ochtú', 'naoú', 'bhfichiú', 'aonú', 'dóú', 'tríú', 'gceathrú', 'gcúigiú', 'séú', 'seachtú', 'ochtú', 'naoú', 'tríochadú', 'aonú'];
const MONTHS = ['Eanáir', 'Feabhra', 'an Mhárta', 'Aibreáin', 'na Bealtaine', 'an Mheithimh', 'Iúil', 'Lúnasa', 'Mheán Fómhair', 'Dheireadh Fómhair', 'na Samhna', 'na Nollag'];
export function birthdayWords(date) {
  const [month, day] = date.split('-').map(Number);
  const after = day === 31 ? ' is tríocha' : day > 20 && day < 30 ? ' is fiche' : day > 10 && day < 20 ? ' déag' : '';
  return `ar an ${ORDINALS[day - 1]} lá${after} de mhí ${MONTHS[month - 1]}`;
}
export function personalModels(input) {
  const p = profileOf(input), county = COUNTIES.find(c => c.id === p.county), subject = SUBJECTS[p.subject];
  const sibs = [];
  if (+p.brothers) sibs.push(counted(+p.brothers, 'deartháir'));
  if (+p.sisters) sibs.push(counted(+p.sisters, 'deirfiúr'));
  return {
    ainm: `Is mise ${p.name}.`, aois: `Tá mé ${ageWords(+p.age)} d'aois.`, breith: `Rugadh mé ${birthdayWords(p.birthday)}.`,
    conai: `Tá mé i mo chónaí ${county.ga}.`, teaghlach: `Tá ${PEOPLE[+p.people]} i mo theaghlach.`,
    siblini: sibs.length ? `Tá ${sibs.join(' agus ')} agam.` : 'Níl deartháir ná deirfiúr agam.',
    sine: { oldest: 'Is mise an duine is sine sa chlann.', youngest: 'Is mise an duine is óige sa chlann.', middle: 'Is mise an páiste sa lár.', only: 'Is páiste aonair mé.' }[p.position],
    post: `Is ${p.fatherJob} é m'athair. Is ${p.motherJob} í mo mháthair.`,
    age_next: `Beidh mé ${ageWords(+p.age + 1)} ar mo chéad bhreithlá eile.`,
    area_describe: `Tá mé i mo chónaí ${ { town: 'i mbaile beag', country: 'faoin tuath', city: 'i gcathair mhór' }[p.place]}.`,
    school_subject: `Is ${subject[0]} ${subject[1]} an t-ábhar is fearr liom.`,
    hobby: { sport: 'Is í an pheil an caitheamh aimsire is fearr liom.', music: 'Is é an ceol an caitheamh aimsire is fearr liom.', reading: 'Is í an léitheoireacht an caitheamh aimsire is fearr liom.' }[p.hobby],
    hobby_follow: { sport: 'Imrím le club áitiúil.', music: 'Seinnim an pianó.', reading: 'Taitníonn sí liom mar tá sí suimiúil.' }[p.hobby],
    future_job: `Ba mhaith liom a bheith ${myJob(p.dreamJob)}.`,
  };
}
function mutations(word) {
  const clean = word.replace(/[.!?,]/g, '');
  const out = [];
  if (MUTATE.isLenitable(clean)) out.push(MUTATE.lenite(clean));
  if (/^([bcdfgmpt])h/i.test(clean)) out.push(clean.replace(/^([bcdfgmpt])h/i, '$1'));
  if (/^(mb|gc|nd|bhf|ng|bp|dt)/i.test(clean)) out.push(clean.replace(/^(m|g|n|bh|b|d)(?=[bcdfgpt])/i, ''));
  else if (/^[bcdfgpt]/i.test(clean)) out.push(MUTATE.eclipse(clean));
  return out.filter(w => w && w !== word);
}
export function answerTiles(answer, level = 'OL') {
  const words = answer.split(/\s+/).filter(Boolean);
  const wrong = [...new Set(words.flatMap(mutations))].filter(w => !words.includes(w));
  return words.concat(wrong.slice(0, level === 'OL' ? 2 : 7));
}
export function prepareQuestions(base, input) {
  const p = profileOf(input), models = personalModels(p);
  const personalEnglish = {
    ainm: `I'm ${p.name}.`, aois: `I'm ${p.age} years old.`, breith: `I was born on ${p.birthday.slice(3)} / ${p.birthday.slice(0, 2)}.`,
    conai: `I live in ${COUNTIES.find(c => c.id === p.county).en}.`, teaghlach: `There are ${p.people} people in my family.`,
    siblini: +p.brothers || +p.sisters ? `I have ${p.brothers} brother(s) and ${p.sisters} sister(s).` : 'I have no brothers or sisters.',
    sine: { oldest: 'I am the oldest in the family.', youngest: 'I am the youngest in the family.', middle: 'I am the middle child.', only: 'I am an only child.' }[p.position],
    post: `My father is a ${JOB_EN[p.fatherJob]}. My mother is a ${JOB_EN[p.motherJob]}.`, age_next: `I will be ${+p.age + 1} on my next birthday.`,
    area_describe: `I live ${ { town: 'in a small town', country: 'in the countryside', city: 'in a large city' }[p.place]}.`,
    school_subject: `${ { art: 'Art', irish: 'Irish', english: 'English', history: 'History', maths: 'Maths', biology: 'Biology' }[p.subject]} is my favourite subject.`,
    hobby: `${ { sport: 'Football', music: 'Music', reading: 'Reading' }[p.hobby]} is my favourite hobby.`,
    hobby_follow: { sport: 'I play with a local club.', music: 'I play the piano.', reading: 'I like it because it is interesting.' }[p.hobby],
    future_job: `I would like to be a ${JOB_EN[p.dreamJob]}.`,
  };
  const personalMore = {
    aois: ['Beidh cóisir agam ar mo chéad bhreithlá eile.', 'I will have a party on my next birthday.'],
    breith: ['Bíonn cóisir agam gach bliain.', 'I have a party every year.'],
    teaghlach: ['Réitím go maith le mo mhuintir.', 'I get on well with my family.'],
    siblini: ['Tá mo mhuintir an-chineálta.', 'My family is very kind.'],
    sine: ['Is maith liom am a chaitheamh le mo mhuintir.', 'I like spending time with my family.'],
    post: ['Oibríonn mo thuismitheoirí go dian.', 'My parents work hard.'],
    school_subject: [`Tá ${SUBJECTS[p.subject][0] === 'í' ? 'sí' : 'sé'} an-suimiúil.`, 'It is very interesting.'],
    hobby: [`Cabhraíonn ${p.hobby === 'music' ? 'sé' : 'sí'} liom mo scíth a ligean.`, 'It helps me relax.'],
  };
  return base.map(q => {
    const fill = t => t.replace(/\{name\}/g, p.name).replace(/\{county\}/g, COUNTIES.find(c => c.id === p.county).ga).replace(/\{county_en\}/g, COUNTIES.find(c => c.id === p.county).en);
    let model = { ga: models[q.id] || fill(q.model.ga), en: personalEnglish[q.id] || q.model.en };
    const replacement = personalMore[q.id];
    const more = replacement ? { ga: replacement[0], en: replacement[1] } : q.more && { ...q.more, ga: fill(q.more.ga) };
    if (p.level === 'HL' && more && more.ga !== model.ga) { model.ga += ' ' + more.ga; model.en += ' ' + more.en; }
    if (p.answers?.[q.id]) model = { ga: p.answers[q.id], en: 'Your own answer' };
    const tailored = q.id === 'hobby_follow' ? { sport: ['An imríonn tú le club nó le foireann?', 'Do you play with a club or team?'], music: ['Cén uirlis a sheinneann tú?', 'What instrument do you play?'], reading: ['Cén fáth a dtaitníonn sé leat?', 'Why do you enjoy it?'] }[p.hobby] : null;
    // Literal generated answers supplement broad accepted patterns; escape pattern metacharacters in names.
    const exact = model.ga.split(/[.!?]/).map(s => s.trim()).filter(Boolean).filter(s => !/[{}|()[\]]/.test(s));
    return { ...q, ...(tailored ? { ask: [tailored[0], { sport: 'An bhfuil tú i do bhall de chlub spóirt?', music: 'Cén uirlis cheoil a sheinneann tú?', reading: 'Cén fáth a bhfuil dúil agat sa léitheoireacht?' }[p.hobby]], en: tailored[1] } : {}), model, more: p.level === 'HL' ? null : more,
      accept: q.accept.concat(exact), tiles: answerTiles(model.ga, p.level), personal: true };
  });
}

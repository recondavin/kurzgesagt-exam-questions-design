// Tests the German oral marker (orals/engine/marker.js with orals/de/grammar.js, questions.js and personal.js).
//   node tools/orals/tests/de-marker.mjs [-v]
// 1. Every question's model answer is right, with no mistake rule firing.
// 2. Every personal answer, for every choice in "About you" and both levels, is right.
// 3. Real correct answers are never called a mistake.
// 4. Known mistakes are caught by the rule that should catch them, and the fix offered is not itself a mistake.
// 5. Every accepted pattern, expanded many ways, is never called a mistake.
import { createMarker } from '../../../orals/engine/marker.js';
import { DE } from '../../../orals/de/grammar.js';
import { QUESTIONS, ROLEPLAYS, SLOTS, TENSE_SLOTS, tenseOf } from '../../../orals/de/questions.js';
import { OPTIONS, DEFAULTS, prepareQuestions } from '../../../orals/de/personal.js';

const verbose = process.argv.includes('-v');
const lang = Object.assign({}, DE, { slots: Object.assign({}, DE.slots, SLOTS, TENSE_SLOTS), tenseOf });
const ALL = QUESTIONS.concat(ROLEPLAYS);
let fails = 0, checks = 0;
const fail = (...a) => { fails++; console.log('FAIL', ...a); };
const ok = (...a) => { checks++; if (verbose) console.log('ok  ', ...a); };

// 1 and 2: models and personal answers.
function checkModels(profile, label) {
  const qs = prepareQuestions(ALL, profile), m = createMarker(lang, qs);
  for (const q of qs) {
    const r = m.mark(q.id, q.model.ga);
    if (r.verdict !== 'right') fail(label, q.id, JSON.stringify(q.model.ga), r.verdict, r.mistakes ? r.mistakes.map(x => x.rule).join(',') : '');
    else ok(label, q.id);
    if (q.more) { const r2 = m.mark(q.id, q.more.ga); if (r2.verdict === 'mistake') fail(label, q.id, 'more', q.more.ga, r2.mistakes.map(x => x.rule)); else ok(label, q.id, 'more'); }
  }
}
checkModels(DEFAULTS, 'default');
checkModels({ ...DEFAULTS, level: 'HL' }, 'HL');
for (const [key, list] of Object.entries(OPTIONS)) for (const v of list) for (const level of ['OL', 'HL']) checkModels({ ...DEFAULTS, [key]: v, level }, `${key}=${v}/${level}`);
for (const day of ['01-01', '02-28', '03-31', '12-22', '07-20']) checkModels({ ...DEFAULTS, birthday: day }, 'birthday ' + day);

const m = createMarker(lang, prepareQuestions(ALL, DEFAULTS));
// 3. Real right answers.
const RIGHT = [
  ['name', 'Ich heiße Davin.'], ['name', 'Mein Name ist Aoife Murphy.'], ['name', 'Ich heiße Seán und ich komme aus Irland.'],
  ['age', 'Ich bin siebzehn Jahre alt.'], ['age', 'Ich bin achtzehn.'], ['age', 'Siebzehn.'],
  ['birthday', 'Ich habe am dritten März Geburtstag.'], ['birthday', 'Mein Geburtstag ist am zwanzigsten Juli.'], ['birthday', 'Ich habe im Dezember Geburtstag.'], ['birthday', 'Ich bin am ersten Mai geboren.'],
  ['live', 'Ich wohne in Dublin.'], ['live', 'Ich wohne auf dem Land in der Nähe von Cork.'], ['live', 'Ich wohne in einem kleinen Dorf im Westen von Irland.'],
  ['family', 'In meiner Familie gibt es vier Personen.'], ['family', 'Wir sind fünf Personen.'], ['family', 'Es gibt sechs Personen in meiner Familie.'], ['family', 'Wir sind zu viert.'],
  ['siblings', 'Ja, ich habe zwei Brüder und eine Schwester.'], ['siblings', 'Nein, ich habe keine Geschwister.'], ['siblings', 'Ich bin Einzelkind.'], ['siblings', 'Ja, ich habe einen Bruder.'], ['siblings', 'Ich habe drei Schwestern.'], ['siblings', 'Ich habe zwei Brueder.'],
  ['position', 'Ja, ich bin das älteste Kind.'], ['position', 'Nein, ich bin das jüngste Kind.'], ['position', 'Nein, mein Bruder ist älter.'], ['position', 'Ich bin die Älteste.'],
  ['jobs', 'Mein Vater ist Lehrer und meine Mutter ist Ärztin.'], ['jobs', 'Meine Mutter arbeitet als Krankenschwester.'], ['jobs', 'Mein Vater ist arbeitslos.'], ['jobs', 'Meine Mutter ist Hausfrau.'], ['jobs', 'Mein Vater arbeitet bei einer Bank.'],
  ['describe', 'Meine Mutter ist sehr nett und lustig.'], ['describe', 'Sie hat lange braune Haare.'], ['describe', 'Mein Vater ist ziemlich streng.'],
  ['get_on', 'Ja, ich verstehe mich gut mit meinen Eltern.'], ['get_on', 'Ich komme gut mit meiner Familie aus.'], ['get_on', 'Meistens verstehen wir uns gut.'],
  ['birthday_past', 'Ich habe mit meinen Freunden gefeiert.'], ['birthday_past', 'Wir sind ins Restaurant gegangen.'], ['birthday_past', 'Ich hatte eine Party.'],
  ['age_next', 'Ich werde achtzehn Jahre alt.'], ['lotto', 'Ich würde ein Haus kaufen.'], ['lotto', 'Wenn ich im Lotto gewinnen würde, würde ich um die Welt reisen.'],
  ['area', 'Meine Stadt ist ruhig und schön.'], ['area', 'Ich wohne in einem Dorf. Es ist sehr klein.'], ['area', 'Ich wohne in den Bergen.'],
  ['area_do', 'Man kann schwimmen gehen.'], ['area_do', 'Es gibt ein Kino und einen Park.'], ['area_missing', 'Es gibt kein Schwimmbad.'], ['area_missing', 'Es fehlt ein Jugendzentrum.'],
  ['area_past', 'Ich bin ins Kino gegangen.'], ['area_past', 'Ich habe meine Großeltern besucht.'], ['area_past', 'Am Samstag habe ich Fußball gespielt.'], ['area_past', 'Ich habe mich umgezogen und bin ausgegangen.'],
  ['area_future', 'Ich werde meine Freunde treffen.'], ['area_future', 'Nächstes Wochenende gehe ich ins Kino.'], ['area_change', 'Ich würde mehr Busse einsetzen.'],
  ['school', 'Meine Schule ist eine gemischte Schule.'], ['school', 'Ich gehe auf eine Gesamtschule in Galway.'], ['school', 'Ich gehe gern zur Schule.'],
  ['subjects', 'Ich habe acht Fächer.'], ['subjects', 'Ich lerne Deutsch, Englisch und Mathe.'], ['favourite', 'Mein Lieblingsfach ist Geschichte.'], ['favourite', 'Ich mag Deutsch am liebsten.'],
  ['teachers', 'Die Lehrer sind meistens nett.'], ['teachers', 'Ich finde die Lehrer sehr hilfsbereit.'], ['uniform', 'Ich finde die Uniform hässlich.'], ['uniform', 'Meiner Meinung nach ist die Schuluniform praktisch.'],
  ['school_past', 'Ich habe einen Test geschrieben.'], ['school_past', 'Gestern hatte ich Sport.'], ['school_future', 'Ich werde Deutsch und Biologie haben.'], ['principal', 'Ich würde die Hausaufgaben abschaffen.'],
  ['hobby', 'Ich spiele gern Fußball.'], ['hobby', 'In meiner Freizeit lese ich gern.'], ['hobby', 'Meine Hobbys sind Lesen und Schwimmen.'], ['hobby', 'Ich gehe gern mit meinen Freunden aus.'], ['hobby', 'Ich mag Fußball.'],
  ['hobby_won', 'Ja, ich habe einen Pokal gewonnen.'], ['hobby_won', 'Nein, noch nie.'], ['hobby_tonight', 'Ich werde fernsehen.'], ['hobby_time', 'Ich würde mehr Sport treiben.'],
  ['summer_past', 'Ich bin nach Frankreich geflogen.'], ['summer_past', 'Ich habe in einem Café gearbeitet.'], ['summer_past', 'Ich war in der Gaeltacht.'], ['summer_past', 'Ich habe das Auto meines Vaters gefahren.'],
  ['holiday_where', 'Ich war in Spanien.'], ['holiday_where', 'Wir waren in Italien.'], ['holiday_weather', 'Das Wetter war schön.'], ['holiday_weather', 'Es hat viel geregnet.'],
  ['holiday_enjoy', 'Ja, es hat mir gut gefallen.'], ['holiday_enjoy', 'Es war toll.'], ['summer_next', 'Ich werde nach Deutschland fahren.'], ['summer_next', 'Im Sommer arbeite ich in einem Geschäft.'],
  ['holiday_choice', 'Ich würde nach Australien fliegen.'], ['after_school', 'Ich werde Medizin studieren.'], ['after_school', 'Ich möchte an der Uni studieren.'],
  ['dream_job', 'Ich möchte Ärztin werden.'], ['dream_job', 'Ich will Ingenieur werden.'], ['dream_job', 'Ich weiß es noch nicht.'], ['dream_job', 'Ich möchte studieren, weil ich Ärztin werden will.'],
  ['why_job', 'Weil ich gern Menschen helfe.'], ['why_job', 'Weil das Gehalt gut ist.'], ['why_job', 'Denn ich arbeite gern mit Kindern.'],
  ['summer_job', 'Ja, ich werde in einem Café arbeiten.'], ['summer_job', 'Nein, ich werde nicht arbeiten.'], ['work_experience', 'Ja, ich habe in einem Krankenhaus gearbeitet.'],
  ['live_where', 'Ich würde gern in Berlin wohnen.'], ['ten_years', 'In zehn Jahren werde ich Lehrerin sein.'],
  ['why_german', 'Ich lerne Deutsch, weil ich nach Deutschland fahren möchte.'], ['why_german', 'Deutsch ist eine schöne Sprache.'], ['been_germany', 'Ja, ich war letztes Jahr in München.'], ['been_germany', 'Nein, noch nie.'],
  ['differences', 'In Deutschland ist das Essen anders.'],
  ['baecker_bestellen', 'Ich hätte gern drei Brötchen, bitte.'], ['baecker_bestellen', 'Zwei Brezeln, bitte.'], ['baecker_bestellen', 'Ich möchte ein Brot und ein Stück Kuchen, bitte.'],
  ['baecker_sonst', 'Nein, danke. Das ist alles.'], ['baecker_sonst', 'Ja, noch ein Croissant, bitte.'], ['baecker_preis', 'Was kostet das?'], ['baecker_preis', 'Wie viel macht das zusammen?'],
  ['bahn_fahrkarte', 'Ich möchte eine Fahrkarte nach Berlin, bitte.'], ['bahn_fahrkarte', 'Einmal nach Ulm, bitte.'], ['bahn_einfach', 'Hin und zurück, bitte.'], ['bahn_einfach', 'Einfach, bitte.'],
  ['bahn_abfahrt', 'Wann fährt der nächste Zug?'], ['bahn_abfahrt', 'Um wie viel Uhr fährt der nächste Zug nach München?'], ['bahn_umsteigen', 'Muss ich umsteigen?'],
  ['arzt_problem', 'Ich habe Halsschmerzen.'], ['arzt_problem', 'Mir ist schlecht.'], ['arzt_problem', 'Mir tut der Kopf weh.'], ['arzt_problem', 'Ich habe Fieber und Husten.'], ['arzt_problem', 'Ich bin schlecht in Mathe.'],
  ['arzt_seit', 'Seit zwei Tagen.'], ['arzt_seit', 'Seit gestern Abend.'], ['arzt_schlimm', 'Ist es schlimm?'],
];
let unsure = 0;
for (const [q, text] of RIGHT) {
  const r = m.mark(q, text);
  if (r.verdict === 'mistake') fail('right answer called a mistake:', q, text, r.mistakes.map(x => x.rule + ': ' + x.why).join(' | '));
  else { ok(q, text, r.verdict); if (r.verdict !== 'right') { unsure++; if (verbose) console.log('     (not recognised:', r.verdict + ')'); } }
}

// 4. Known mistakes.
const WRONG = [
  ['age', 'Ich habe siebzehn Jahre.', 'age-haben'], ['age', 'Ich habe achtzehn Jahre alt.', 'age-haben'],
  ['siblings', 'Ich habe ein Bruder.', 'acc-ein'], ['siblings', 'Ja, ich habe einen Schwester.', 'acc-ein'], ['area_do', 'Es gibt ein Park.', 'acc-ein'],
  ['siblings', 'Ich habe zwei Bruder.', 'plural'], ['siblings', 'Ich habe drei Schwester.', 'plural'], ['family', 'Es gibt fünf Person in meiner Familie.', 'plural'],
  ['arzt_problem', 'Ich bin heiß.', 'mir-ist'], ['arzt_problem', 'Ich bin kalt.', 'mir-ist'],
  ['area_past', 'Ich habe ins Kino gegangen.', 'perfekt-sein'], ['summer_past', 'Wir haben in Spanien geblieben.', 'perfekt-sein'],
  ['area_past', 'Am Samstag ich habe Fußball gespielt.', 'v2'], ['summer_past', 'Letzten Sommer ich bin nach Spanien gefahren.', 'v2'],
  ['dream_job', 'Ich möchte werden Lehrer.', 'infinitive-end'], ['area_future', 'Ich werde spielen Fußball am Samstag.', 'infinitive-end'],
  ['hobby', 'Ich mag spielen Fußball.', 'gern'], ['hobby', 'Ich mag lesen.', 'gern'],
  ['why_german', 'Ich lerne Deutsch, weil es ist nützlich.', 'weil'], ['why_job', 'Weil ich arbeite gern mit Kindern.', 'weil'],
  ['school', 'Ich gehe zu Schule in Galway.', 'zur'], ['arzt_seit', 'Seit zwei Tage.', 'seit'], ['arzt_seit', 'Seit eine Woche.', 'seit'],
  ['area', 'Ich wohne in die Stadt.', 'wohnen-dativ'], ['area', 'Ich wohne auf das Land.', 'wohnen-dativ'],
  ['get_on', 'Ich verstehe mich gut mit meine Eltern.', 'mit-dativ'], ['birthday_past', 'Ich habe mit meine Familie gefeiert.', 'mit-dativ'],
  ['bahn_fahrkarte', 'Eine Fahrkarte zu München, bitte.', 'question'], ['bahn_abfahrt', 'Wann der nächste Zug fährt?', 'question'], ['arzt_problem', 'Ich bin schlecht.', 'question'],
];
for (const [q, text, rule] of WRONG) {
  const r = m.mark(q, text);
  if (r.verdict !== 'mistake' || !r.mistakes.some(x => x.rule === rule)) { fail('mistake not caught:', q, text, 'expected', rule, 'got', r.verdict, r.mistakes ? r.mistakes.map(x => x.rule) : ''); continue; }
  ok('caught', rule, text);
  if (r.fixed) {
    const fixed = r.fixed.map(p => p.w).join(' '), r2 = m.mark(q, fixed);
    if (r2.verdict === 'mistake') fail('fix is itself a mistake:', text, '->', fixed, r2.mistakes.map(x => x.rule)); else ok('fix', fixed, r2.verdict);
  }
}

// 5. Expansions of the accepted patterns.
const SAMPLE = { name: ['Davin', 'Aoife Murphy'], place: ['Galway', 'Cork'], '*': ['Fußball'], tail: ['', 'und es macht Spaß'] };
const rnd = n => Math.floor(Math.random() * n);
function lex(src) { const out = []; const re = /\s*(\(|\)|\[|\]|\||\{[^}]+\}|[^\s()[\]|{}]+)/g; let x; while ((x = re.exec(src))) out.push(x[1]); return out; }
function expand(p, slots, depth = 0) {
  const toks = lex(p); let i = 0;
  function seq(stop) {
    const alts = [[]];
    while (i < toks.length && !stop.includes(toks[i])) {
      const t = toks[i++];
      if (t === '|') alts.push([]);
      else if (t === '(') { const s = seq([')']); i++; alts[alts.length - 1].push(s); }
      else if (t === '[') { const s = seq([']']); i++; alts[alts.length - 1].push(Math.random() < 0.5 ? s : ''); }
      else if (t[0] === '{') {
        const name = t.slice(1, -1);
        if (SAMPLE[name]) alts[alts.length - 1].push(SAMPLE[name][rnd(SAMPLE[name].length)]);
        else if (name[0] === '*') alts[alts.length - 1].push(SAMPLE['*'][0]);
        else { const def = slots[name]; if (!def || def.re) { alts[alts.length - 1].push(name === 'ord' ? 'siebten' : name === 'pp' ? 'gespielt' : ''); continue; } const list = [].concat(def); alts[alts.length - 1].push(depth > 6 ? '' : expand(list[rnd(list.length)], slots, depth + 1)); }
      } else alts[alts.length - 1].push(t);
    }
    return alts[rnd(alts.length)].filter(Boolean).join(' ');
  }
  return seq([]);
}
for (const q of ALL) {
  const slots = Object.assign({}, lang.slots, q.slots || {});
  for (const a of q.accept) {
    const p = typeof a === 'string' ? a : a.p;
    for (let k = 0; k < 40; k++) {
      const text = expand(p, slots);
      if (!text.trim()) continue;
      const r = m.mark(q.id, text);
      if (r.verdict === 'mistake') { fail('pattern expansion called a mistake:', q.id, JSON.stringify(text), r.mistakes.map(x => x.rule)); break; }
      ok(q.id, text);
    }
  }
}

console.log(fails ? `${fails} failures out of ${checks + fails} checks` : `all ${checks} checks passed (${unsure} of ${RIGHT.length} real answers not recognised, never called wrong)`);
process.exit(fails ? 1 : 0);

// German for the marker (orals/engine/marker.js): how words are compared, shared patterns, and the rules for mistakes.
// As with Irish, a rule may only fire when the mistake is certain, so a right answer is never marked wrong. Each
// rule names the fix in plain English and, where it can, rewrites the student's own words. These are the errors
// Leaving Cert German examiners see most: age with haben, ein for einen, haben for sein in the Perfekt, the verb
// not second, the second verb not at the end, mag for gern, weil without the verb at the end, zu for zur/zum,
// seit or mit without the dative, wohnen in with the accusative, and ich bin for mir ist.

// Words are compared without case, without accents, ß as ss, and an umlaut typed as ae, oe or ue (after a
// consonant) the same as one typed as a, o or u. A missing umlaut then only gives a spelling tip.
export function fold(w) {
  return w.toLowerCase().replace(/ß/g, 'ss').replace(/(?<=^|[^aeiouäöü])(ae|oe|ue)/g, m => m[0])
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, '');
}
const f = t => t && t.fold;
const low = t => t && t.low;
const cap = (like, word) => (/^[A-ZÄÖÜ]/.test(like) ? word[0].toUpperCase() + word.slice(1) : word);
function hit(start, end, tokens, why, rule) { return { start, end, tokens, why, rule }; }

// ---------------------------------------------------------------- word lists (folded)
const NUM = ['zwei', 'drei', 'vier', 'funf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwolf'];
const AGE = ['zwolf', 'dreizehn', 'vierzehn', 'funfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig', 'einundzwanzig'];
const HABEN = { habe: 'bin', hab: 'bin', hast: 'bist', hat: 'ist', haben: 'sind', habt: 'seid' };
const SEIN_AUX = new Set(['bin', 'bist', 'ist', 'sind', 'seid']);
// Participles that only take sein (gefahren, geflogen, gelaufen and umgezogen are left out: "Ich habe das Auto
// gefahren" and "Ich habe mich umgezogen" are right).
const SEIN_PP = new Set(['gegangen', 'gekommen', 'geblieben', 'gewesen', 'geworden', 'passiert', 'gestorben', 'aufgestanden', 'angekommen', 'abgefahren', 'losgegangen', 'gereist', 'eingeschlafen', 'aufgewacht', 'zuruckgekommen', 'zuruckgefahren', 'ausgegangen', 'mitgekommen', 'hingegangen', 'spazierengegangen']);
// Nouns after ein/kein/mein: masculine ones take -en after haben and es gibt; feminine ones never do.
const MASC = new Set(['bruder', 'hund', 'vater', 'freund', 'onkel', 'cousin', 'sohn', 'opa', 'grossvater', 'park', 'garten', 'kater', 'hamster', 'computer', 'fernseher', 'bahnhof', 'supermarkt', 'sportplatz', 'verein', 'job', 'lehrer', 'stiefbruder', 'halbbruder', 'zwillingsbruder', 'nebenjob', 'fussballplatz', 'strand', 'see', 'balkon', 'keller']);
const FEM = new Set(['schwester', 'mutter', 'katze', 'oma', 'grossmutter', 'tante', 'stadt', 'schule', 'kirche', 'bibliothek', 'freundin', 'cousine', 'stiefschwester', 'halbschwester', 'zwillingsschwester', 'tochter', 'wohnung', 'kuche']);
// Singular nouns after a number above one, by how they are typed (lower case), with the plural to use.
const PLURAL = { bruder: 'Brüder', schwester: 'Schwestern', jahr: 'Jahre', person: 'Personen', kind: 'Kinder', katze: 'Katzen', hund: 'Hunde', stunde: 'Stunden', woche: 'Wochen', monat: 'Monate', fach: 'Fächer', freund: 'Freunde', freundin: 'Freundinnen', tag: 'Tage' };
// Phrases that can start a sentence; the verb must come straight after them.
const OPENERS = ['gestern', 'heute', 'morgen', 'letztes jahr', 'letzten sommer', 'letzte woche', 'letztes wochenende', 'nachstes jahr', 'nachsten sommer', 'nachste woche', 'nachstes wochenende', 'am wochenende', 'im sommer', 'im winter', 'in den ferien', 'nach der schule', 'normalerweise', 'manchmal', 'oft', 'jeden tag', 'dann', 'danach', 'spater', 'in zukunft', 'in zehn jahren', 'heute abend', 'zuerst', 'am montag', 'am dienstag', 'am mittwoch', 'am donnerstag', 'am freitag', 'am samstag', 'am sonntag', 'abends', 'morgens', 'in irland', 'in deutschland', 'zu hause'].map(p => p.split(' '));
const ICH_VERBS = new Set(['bin', 'war', 'kann', 'will', 'muss', 'darf', 'soll', 'mag', 'weiss', 'hab']);
const MODALS = new Set(['mochte', 'will', 'kann', 'muss', 'werde', 'darf', 'soll', 'wurde', 'konnte', 'wollte']);
const INFINITIVES = new Set(['werden', 'spielen', 'lernen', 'studieren', 'gehen', 'fahren', 'arbeiten', 'reisen', 'sehen', 'machen', 'kaufen', 'besuchen', 'wohnen', 'bleiben', 'schwimmen', 'lesen', 'essen', 'trinken', 'haben', 'sein', 'treffen', 'verbringen', 'sparen', 'bauen', 'andern', 'abschaffen', 'verdienen', 'finden', 'suchen', 'helfen', 'leben', 'werden', 'bekommen', 'schreiben', 'horen', 'singen', 'tanzen', 'kochen', 'geben', 'verbessern', 'sprechen', 'schauen', 'gewinnen']);
const CONJ = new Set(['und', 'oder', 'aber', 'weil', 'dass', 'denn', 'wenn', 'obwohl', 'damit', 'sondern', 'als']);
const NOT_AFTER_INF = new Set([...CONJ, 'nach', 'in', 'im', 'an', 'am', 'auf', 'mit', 'zu', 'zum', 'zur', 'fur', 'bei', 'aus', 'von', 'vom', 'uber', 'wie', 'um']);
// mag + infinitive: the ich form to use with gern.
const ICH_FORM = { spielen: 'spiele', lesen: 'lese', schwimmen: 'schwimme', tanzen: 'tanze', singen: 'singe', kochen: 'koche', reisen: 'reise', fahren: 'fahre', gehen: 'gehe', schauen: 'schaue', horen: 'höre', malen: 'male', zeichnen: 'zeichne', laufen: 'laufe', wandern: 'wandere', backen: 'backe', lernen: 'lerne', schreiben: 'schreibe', essen: 'esse', reiten: 'reite', segeln: 'segle', surfen: 'surfe', joggen: 'jogge' };
const FINITE = new Set(['bin', 'bist', 'ist', 'sind', 'seid', 'war', 'waren', 'habe', 'hast', 'hat', 'haben', 'hatte', 'mochte', 'will', 'kann', 'muss', 'werde', 'wird', 'spiele', 'spielt', 'gefallt', 'mag', 'finde', 'lerne', 'liebe', 'wohne', 'gehe', 'macht', 'gibt', 'kommt', 'arbeite', 'arbeitet', 'lese', 'fahre', 'reise', 'wurde']);
const SUBJ = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man', 'das']);

// ---------------------------------------------------------------- rules
// Each returns [{ start, end, tokens: [replacement words] or null, why, rule }] for one sentence (a list of words).
const RULES = [
  // Age is said with sein: Ich bin siebzehn Jahre alt (not: Ich habe siebzehn Jahre).
  function age(s) {
    return s.flatMap((t, i) => {
      const n = s[i + 1], j = s[i + 2];
      if (!(f(t) in HABEN) || !n || !AGE.concat(NUM).includes(f(n)) || !j || !/^jahre?$/.test(f(j))) return [];
      return [hit(i, i + 1, [cap(t.raw, HABEN[f(t)])], 'Age is said with sein, not haben: Ich bin siebzehn Jahre alt.', 'age-haben')];
    });
  },
  // After haben and es gibt, ein/kein/mein + a masculine noun is einen/keinen/meinen; a feminine noun never takes -en.
  function accusative(s) {
    const out = [];
    s.forEach((t, i) => {
      const a = s[i + 1], n = s[i + 2];
      if (!a || !n || !(f(t) in HABEN || f(t) === 'gibt')) return;
      const art = f(a);
      if (['ein', 'kein', 'mein', 'dein'].includes(art) && MASC.has(f(n))) out.push(hit(i + 1, i + 2, [a.raw + 'en'], 'After haben and es gibt, a masculine noun takes -en: Ich habe einen Bruder. Es gibt einen Park.', 'acc-ein'));
      if (['einen', 'keinen', 'meinen', 'deinen'].includes(art) && FEM.has(f(n))) out.push(hit(i + 1, i + 2, [a.raw.slice(0, -1)], 'A feminine noun takes eine, not einen: Ich habe eine Schwester.', 'acc-ein'));
    });
    return out;
  },
  // After a number above one, the noun is plural: zwei Brüder, drei Schwestern, zwei Jahre.
  function plural(s) {
    return s.flatMap((t, i) => {
      const n = s[i + 1], prev = s[i - 1];
      if (!n || !NUM.includes(f(t)) || !(low(n) in PLURAL)) return [];
      // "seit zwei Tage" is the seit rule's job; "ein Jahr" never gets here.
      if (prev && f(prev) === 'seit') return [];
      return [hit(i + 1, i + 2, [PLURAL[low(n)]], 'After a number above one, the noun is plural: zwei Brüder, drei Schwestern, zwei Jahre.', 'plural')];
    });
  },
  // How you feel: Mir ist heiß, mir ist kalt (Ich bin heiß means something else).
  function mirIst(s) {
    return s.flatMap((t, i) => {
      const n = s[i + 1], a = s[i + 2];
      if (f(t) !== 'ich' || !n || f(n) !== 'bin' || !a || s[i + 3] || !/^(heiss|kalt|ubel|schwindlig)$/.test(f(a))) return [];
      return [hit(i, i + 3, [cap(t.raw, 'mir'), 'ist', a.raw], 'For how you feel, German says "mir ist": Mir ist kalt. Mir ist heiß. ("Ich bin heiß" means something else.)', 'mir-ist')];
    });
  },
  // Verbs of movement and change take sein in the Perfekt: Ich bin gegangen, ich bin geblieben.
  function perfektSein(s) {
    if (s.some(t => SEIN_AUX.has(f(t)))) return [];
    const pp = s.findIndex(t => SEIN_PP.has(f(t)));
    if (pp < 0) return [];
    const aux = s.findIndex((t, i) => i < pp && f(t) in HABEN);
    if (aux < 0) return [];
    return [hit(aux, aux + 1, [cap(s[aux].raw, HABEN[f(s[aux])])], `"${s[pp].raw}" takes sein in the Perfekt: Ich bin gegangen, wir sind geblieben, es ist passiert.`, 'perfekt-sein')];
  },
  // The verb is the second idea: after a time or place phrase at the start, the verb comes before ich.
  function verbSecond(s) {
    let i = 0;
    while (s[i] && /^(ja|nein|also|naja|gut|okay|ok)$/.test(f(s[i]))) i++;
    const open = OPENERS.find(p => p.every((w, k) => s[i + k] && f(s[i + k]) === w));
    if (!open) return [];
    const at = i + open.length, sub = s[at], verb = s[at + 1];
    if (!sub || !verb || f(sub) !== 'ich') return [];
    if (!(ICH_VERBS.has(f(verb)) || /e$/.test(f(verb))) || /^(gerne|alleine|manche|viele|keine|meine|eine|seine|diese|jede|beide|ganze)$/.test(f(verb))) return [];
    return [hit(at, at + 2, [verb.raw, sub.raw], 'The verb is always the second idea. After a time or place phrase at the start, put the verb before ich: Am Wochenende spiele ich Fußball.', 'v2')];
  },
  // With möchte, will, kann, muss, werde and würde, the second verb goes to the end: Ich möchte Arzt werden.
  function infinitiveEnd(s) {
    for (let i = 0; i < s.length - 2; i++) {
      // "schwimmen gehen", "einkaufen gehen": two verbs together at the end are right.
      if (!MODALS.has(f(s[i])) || !INFINITIVES.has(f(s[i + 1])) || NOT_AFTER_INF.has(f(s[i + 2])) || INFINITIVES.has(f(s[i + 2])) || /^(gehen|lassen|bleiben|fahren|kommen)$/.test(f(s[s.length - 1])) && i + 3 === s.length) continue;
      let end = i + 2;
      while (end < s.length && !CONJ.has(f(s[end]))) end++;
      const moved = s.slice(i + 2, end).map(t => t.raw).concat(s[i + 1].raw);
      return [hit(i + 1, end, moved, 'With möchte, will, kann, muss, werde and würde, the second verb goes to the end: Ich möchte Arzt werden. Ich werde Fußball spielen.', 'infinitive-end')];
    }
    return [];
  },
  // "Ich mag spielen" is "Ich spiele gern": to say you like doing something, use the verb with gern.
  function gern(s) {
    return s.flatMap((t, i) => {
      const v = s[i + 1], inf = s[i + 2];
      if (f(t) !== 'ich' || !v || f(v) !== 'mag' || !inf || !(f(inf) in ICH_FORM)) return [];
      return [hit(i, i + 3, [t.raw, ICH_FORM[f(inf)], 'gern'], 'To say you like doing something, use the verb with gern: Ich spiele gern Fußball. Ich lese gern.', 'gern')];
    });
  },
  // After weil and dass, the verb goes to the end of the clause: weil es nützlich ist.
  function verbLast(s) {
    const out = [];
    s.forEach((t, i) => {
      if (!/^(weil|dass)$/.test(f(t))) return;
      let subj = i + 1;
      if (!s[subj]) return;
      if (/^(der|die|das|mein|meine|dein|deine)$/.test(f(s[subj])) && s[subj + 1] && /^[A-ZÄÖÜ]/.test(s[subj + 1].raw)) subj++;
      else if (!SUBJ.has(f(s[subj]))) return;
      const v = subj + 1;
      if (!s[v] || !FINITE.has(f(s[v])) || !s[v + 1] || CONJ.has(f(s[v + 1]))) return;
      let end = v + 1;
      while (end < s.length && !CONJ.has(f(s[end]))) end++;
      out.push(hit(v, end, s.slice(v + 1, end).map(x => x.raw).concat(s[v].raw), `After ${low(t)}, the verb goes to the end: weil es nützlich ist, weil ich gern Fußball spiele.`, 'weil'));
    });
    return out;
  },
  // zu + der = zur, zu + dem = zum: Ich gehe zur Schule, zum Arzt ("zu Hause" is right).
  function zur(s) {
    return s.flatMap((t, i) => {
      const n = s[i + 1];
      if (f(t) !== 'zu' || !n) return [];
      if (/^(schule|arbeit|uni|universitat|kirche|bank|post|apotheke|bibliothek|bushaltestelle)$/.test(f(n))) return [hit(i, i + 1, ['zur'], 'Zu + der = zur: Ich gehe zur Schule, zur Arbeit.', 'zur')];
      if (/^(arzt|bahnhof|supermarkt|training|zahnarzt|flughafen|strand|sportplatz|backer|friseur)$/.test(f(n))) return [hit(i, i + 1, ['zum'], 'Zu + dem = zum: Ich gehe zum Arzt, zum Bahnhof.', 'zur')];
      return [];
    });
  },
  // Seit takes the dative: seit zwei Tagen, seit einer Woche, seit einem Jahr.
  function seit(s) {
    const out = [];
    s.forEach((t, i) => {
      const a = s[i + 1], n = s[i + 2];
      if (f(t) !== 'seit' || !a || !n) return;
      const why = 'Seit takes the dative: seit zwei Tagen, seit einer Woche, seit einem Jahr.';
      if ((NUM.includes(f(a)) || /^(einigen|vielen|paar)$/.test(f(a))) && /^(tage|jahre|monate)$/.test(f(n))) out.push(hit(i + 2, i + 3, [n.raw + 'n'], why, 'seit'));
      else if (f(a) === 'eine' && /^(woche|stunde)$/.test(f(n))) out.push(hit(i + 1, i + 2, [a.raw + 'r'], why, 'seit'));
      else if (f(a) === 'ein' && /^(jahr|monat|tag)$/.test(f(n))) out.push(hit(i + 1, i + 2, [a.raw + 'em'], why, 'seit'));
    });
    return out;
  },
  // Where you live is said with the dative: Ich wohne in der Stadt, im Westen, auf dem Land. ("in den Bergen" is
  // dative plural, so den is left alone.)
  function wohnen(s) {
    const out = [];
    s.forEach((t, i) => {
      const p = s[i + 1], a = s[i + 2];
      if (!/^(wohne|wohnst|wohnt|wohnen)$/.test(f(t)) || !p || !a || !/^(in|auf)$/.test(f(p))) return;
      const why = 'Where you live takes the dative: Ich wohne in der Stadt, im Westen, auf dem Land.';
      const art = f(a);
      if (art === 'die') out.push(hit(i + 2, i + 3, ['der'], why, 'wohnen-dativ'));
      else if (art === 'das') out.push(hit(i + 1, i + 3, f(p) === 'in' ? ['im'] : [p.raw, 'dem'], why, 'wohnen-dativ'));
      else if (art === 'eine') out.push(hit(i + 2, i + 3, [a.raw + 'r'], why, 'wohnen-dativ'));
    });
    return out;
  },
  // Mit takes the dative: mit meinen Eltern, mit meiner Mutter, mit meinem Vater.
  function mit(s) {
    return s.flatMap((t, i) => {
      const a = s[i + 1], n = s[i + 2];
      if (f(t) !== 'mit' || !a || !n) return [];
      const m = /^(mein|dein|sein|ihr)(e?)$/.exec(f(a));
      if (!m) return [];
      const noun = f(n), stem = a.raw.replace(/e$/, '');
      let ending = null;
      if (m[2] && /^(eltern|geschwister|freunde|grosseltern|freundinnen|cousins)$/.test(noun)) ending = 'en';
      else if (m[2] && /^(mutter|schwester|familie|freundin|oma|grossmutter|tante|klasse|cousine)$/.test(noun)) ending = 'er';
      else if (!m[2] && /^(vater|bruder|freund|opa|grossvater|onkel|hund|cousin)$/.test(noun)) ending = 'em';
      return ending ? [hit(i + 1, i + 2, [stem + ending], 'Mit takes the dative: mit meinen Eltern, mit meiner Mutter, mit meinem Vater.', 'mit-dativ')] : [];
    });
  },
];

// Common English words that aren't also German words (to spot an answer given in English).
const ENGLISH = new Set('my the and years year old live lives living brother brothers sister sisters mother father mum mom dad parents family have has of with get gets well he she works work job born from we they very im it its are there people house only child oldest youngest along fine thanks yes funny nice tall short hair eyes blue brown his our eldest middle twins twin called county town city because like play school subject favourite would going went'.split(' '));

// Words often typed without their apostrophe or umlaut-free spellings the lexicon can't guess.
const ALIASES = { gehts: "geht's", wars: "war's", gibts: "gibt's" };

export const DE = {
  fold,
  detectors: RULES,
  english: ENGLISH,
  aliases: ALIASES,
  fillers: ['(ja|nein|also|na ja|naja|ähm|äh|hmm|gut|okay|ok|ach|tja|ehrlich gesagt|na|genau|stimmt)'],
  slots: {},
};

// A rule's family, for the drills (orals/de/drills.js).
export function ruleGroup(rule = '') {
  return { 'age-haben': 'age', 'acc-ein': 'accusative', plural: 'plural', 'mir-ist': 'mir', 'perfekt-sein': 'sein', v2: 'v2', 'infinitive-end': 'infinitive', gern: 'gern', weil: 'weil', zur: 'zur', seit: 'seit', 'wohnen-dativ': 'dative', 'mit-dativ': 'dative' }[rule] || null;
}

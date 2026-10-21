// Irish for the marker (orals/engine/marker.js): how words are compared, shared patterns, and the rules for mistakes.
// A rule here may only fire when the mistake is certain in every dialect, so a right
// answer is never marked wrong. Each rule names the fix in plain English and rewrites the student's own words.
// Dialect forms that differ from the standard model are right: "sa gcathair", "ar an chéad lá".

const VOWELS = 'aeiouáéíóú';
export function fold(w) { return w.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ''); }
const f = t => t && t.fold;
const low = t => t && t.low;

// ---------------------------------------------------------------- mutations
function isLenitable(w) {
  const a = fold(w.toLowerCase());
  if (/^[bcdfgmpt]/.test(a)) return a[1] !== 'h';
  return /^s[aeiounlr]/.test(a);
}
function lenite(raw) { return raw[0] + (raw[0] === raw[0].toUpperCase() && raw[1] && raw[1] === raw[1].toUpperCase() ? 'H' : 'h') + raw.slice(1); }
const ECLIPSE = { b: 'm', c: 'g', d: 'n', f: 'bh', g: 'n', p: 'b', t: 'd' };
function isEclipsed(w) { return /^(mb|gc|nd|bhf|ng|bp|dt|n-?[aeiouáéíóú])/i.test(w); }
function canEclipse(w) { const a = fold(w.toLowerCase()); return /^[bcdfgpt]/.test(a) || VOWELS.includes(w[0].toLowerCase()); }
function eclipse(raw) {
  const c = raw[0].toLowerCase();
  if (ECLIPSE[c]) return ECLIPSE[c] + raw;
  return raw[0] === raw[0].toUpperCase() ? 'n' + raw : 'n-' + raw;
}
// "an-" lenites everything but d, t and s.
const notAfterAn = w => /^[dts]/i.test(fold(w));

// ---------------------------------------------------------------- word lists
// Nouns counted with numbers: singular and plural.
const NOUNS = {
  ábhar: 'ábhair',
  deartháir: 'deartháireacha', deirfiúr: 'deirfiúracha', duine: 'daoine', páiste: 'páistí', peata: 'peataí',
  madra: 'madraí', cat: 'cait', uncail: 'uncailí', aintín: 'aintíní', coinín: 'coiníní', iasc: 'éisc', capall: 'capaill',
};
const SING = new Map(Object.keys(NOUNS).map(s => [fold(s), s]));
const PLUR = new Map(Object.entries(NOUNS).map(([s, p]) => [fold(p), s]));
const nounOf = t => SING.get(f(t)) || SING.get(fold(f(t).replace(/^(.)h/, '$1'))) || null;
const pluralOf = t => PLUR.get(f(t)) || PLUR.get(fold(f(t).replace(/^(.)h/, '$1'))) || null;

// Jobs (said with "Is ... é/í", or "ina"/"mar" with lenition).
export const JOBS = ['múinteoir', 'altra', 'dochtúir', 'feirmeoir', 'innealtóir', 'cuntasóir', 'garda', 'siopadóir', 'leictreoir', 'siúinéir', 'tógálaí', 'rúnaí', 'bainisteoir', 'fiaclóir', 'cógaiseoir', 'tiománaí', 'cócaire', 'gruagaire', 'meicneoir', 'pluiméir', 'dlíodóir', 'iriseoir', 'ailtire', 'freastalaí', 'glantóir', 'oibrí', 'banaltra', 'fear', 'bean', 'príomhoide', 'léachtóir', 'eolaí', 'ríomhchláraitheoir', 'saighdiúir', 'iascaire', 'búistéir', 'báicéir'];
const JOB = new Set(JOBS.map(fold));
const jobAt = t => t && (JOB.has(f(t)) || JOB.has(f(t).replace(/^(.)h/, '$1')));

const FEMALE = [['mo', 'mháthair'], ['mo', 'dheirfiúr'], ["m'aintín"], ['mo', 'mham'], ['mo', 'mhamaí'], ['mo', 'mhamó'], ['mo', 'sheanmháthair'], ['mo', 'leasmháthair']];
const MALE = [["m'athair"], ['mo', 'dheartháir'], ["m'uncail"], ['mo', 'dhaid'], ['mo', 'dhaidí'], ['mo', 'dhaideó'], ['mo', 'sheanathair'], ['mo', 'leasathair']];
function subjectAt(s, i, list) {
  for (const words of list) if (words.every((w, k) => s[i + k] && f(s[i + k]) === fold(w))) return words.length;
  return 0;
}

// Places after "i" (in): these nouns and names start with a consonant that takes an eclipsis.
const IN_PLACES = new Set(['gaillimh', 'corcaigh', 'contae', 'baile', 'cathair', 'ceantar', 'port', 'ciarrai', 'cill', 'dun', 'doire', 'beal', 'tiobraid', 'teach', 'gleann', 'ceatharlach', 'tra', 'droichead', 'caislean', 'carraig', 'bun', 'cluain', 'cnoc', 'tamhlacht', 'tir', 'bealach', 'gort', 'pairc', 'bothar', 'sraidbhaile', 'conamara', 'bungalo', 'teachin']);
// These start with a vowel, so "in" comes before them.
const IN_VOWEL = new Set(['arasan', 'eastat', 'eirinn', 'uibh', 'oilean', 'ospideal', 'oifig', 'iarthar', 'oirthear', 'ionad', 'ostan', 'albain', 'aontroim']);

// "sé" after a verb is "he", not six.
const pronounSe = p => p && /^(ta|bhi|nil|bionn|beidh|an|is|go|nach|ni|ba|bheadh|mar|ach)$/.test(f(p));

// ---------------------------------------------------------------- rules
// Each returns [{ start, end, tokens: [replacement words], why, rule }] for one sentence (a list of words).
function hit(start, end, tokens, why, rule) { return { start, end, tokens, why, rule }; }

const RULES = [
  // mo + vowel -> m' ; mo/do + consonant -> lenition
  function mo(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n || (low(t) !== 'mo' && low(t) !== 'do')) return;
      // "is mo" / "níos mo" typed without the fada is "mó" (most, more), not "mo" (my).
      if (s[i - 1] && /^(is|nios|ba)$/.test(f(s[i - 1]))) return;
      const isMo = low(t) === 'mo';
      if (isMo && VOWELS.includes(fold(low(n))[0])) out.push(hit(i, i + 2, ["m'" + n.raw], 'Before a vowel, "mo" becomes m\': m\'athair, m\'aintín.', 'mo-vowel'));
      else if (isMo && isLenitable(n.raw) && /^[a-záéíóú]/i.test(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], '"Mo" (my) adds a h after the first letter: mo mháthair, mo dheartháir, mo theaghlach.', 'mo-lenition'));
      else if (!isMo && low(t) === 'do' && /^(mathair|deartháir|dearthair|deirfiur|teaghlach|clann|tuismitheoiri|muintir)$/.test(f(n)) && isLenitable(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], '"Do" (your) adds a h after the first letter: do mháthair, do theaghlach.', 'do-lenition'));
    });
    return out;
  },
  // Numbers with nouns: dhá + lenited singular; "dó" is only for counting; 3-6 lenite; 7-10 eclipse.
  function numbers(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n) return;
      const sing = nounOf(n), plur = pluralOf(n), num = f(t);
      if (low(t) === 'dó' && (sing || plur)) {
        const w = sing || plur;
        out.push(hit(i, i + 2, ['dhá', lenite(w)], 'Before a noun, two is "dhá" (not "dó", which is only for counting), with a h after the first letter: dhá dheartháir.', 'do-noun'));
      } else if (num === 'dha') {
        if (plur) out.push(hit(i, i + 2, [t.raw, isLenitable(plur) ? lenite(plur) : plur], 'After "dhá" the noun stays singular: dhá dheartháir, dhá dheirfiúr (not the plural).', 'dha-plural'));
        else if (isLenitable(n.raw) && /^[a-záéíóú]/i.test(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], 'After "dhá", add a h after the first letter: dhá dheartháir, dhá dheirfiúr, dhá bhliain.', 'dha-lenition'));
      } else if (['tri', 'ceithre', 'cuig', 'se'].includes(num) && (sing || plur) && !(num === 'se' && pronounSe(s[i - 1]))) {
        if (plur) out.push(hit(i, i + 2, [t.raw, lenite(plur)], 'After trí, ceithre, cúig and sé the noun stays singular, with a h after the first letter: trí dheartháir.', 'num-plural'));
        else if (isLenitable(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], 'After trí, ceithre, cúig and sé, add a h after the first letter: trí dheartháir, ceithre dhuine.', 'num-lenition'));
      } else if (['seacht', 'ocht', 'naoi', 'deich'].includes(num)) {
        const b = f(n);
        if (b === 'bliain' || b === 'mbliain') out.push(hit(i, i + 2, [t.raw, 'mbliana'], 'With numbers, years is "bliana", and after seacht, ocht, naoi and deich it takes an m: ocht mbliana déag.', 'num-bliain'));
        else if (b === 'bliana') out.push(hit(i, i + 2, [t.raw, 'mbliana'], 'After seacht, ocht, naoi and deich, put an m before bliana: seacht mbliana déag, ocht mbliana déag.', 'num-eclipsis'));
        else if (plur) out.push(hit(i, i + 2, [t.raw, eclipse(plur)], 'After seacht, ocht, naoi and deich the noun stays singular and is eclipsed: seacht ndeartháir.', 'num-plural'));
        else if (sing && !isEclipsed(n.raw) && canEclipse(n.raw)) out.push(hit(i, i + 2, [t.raw, eclipse(n.raw)], 'After seacht, ocht, naoi and deich the noun is eclipsed: seacht ndeartháir, ocht nduine.', 'num-eclipsis'));
      } else if (['tri', 'ceithre', 'cuig', 'se'].includes(num) && f(n) === 'bliain' && !(num === 'se' && pronounSe(s[i - 1]))) {
        out.push(hit(i, i + 2, [t.raw, 'bliana'], 'With trí to sé, years is "bliana": sé bliana déag.', 'num-bliain'));
      }
    });
    return out;
  },
  // i + place: eclipsis (i nGaillimh, i gContae...), "in" before a vowel, and "in" is wrong before a consonant.
  function inPlace(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n) return;
      const w = f(n);
      if (f(t) === 'i' && low(t) === 'i' && IN_PLACES.has(w) && !isEclipsed(n.raw)) out.push(hit(i, i + 2, [t.raw, eclipse(n.raw)], '"I" (in) eclipses the next word: i nGaillimh, i gCorcaigh, i gContae, i mbaile beag.', 'i-eclipsis'));
      else if (f(t) === 'i' && low(t) === 'i' && IN_VOWEL.has(w)) out.push(hit(i, i + 1, ['in'], 'Before a vowel, "i" becomes "in": in árasán, in eastát, in Éirinn.', 'i-vowel'));
      else if (f(t) === 'in' && IN_PLACES.has(w)) out.push(hit(i, i + 2, ['i', eclipse(n.raw)], 'Use "in" only before a vowel. Before a consonant it\'s "i" with an eclipsis: i nGaillimh.', 'in-consonant'));
    });
    return out;
  },
  // sa + consonant: standard lenition (sa chathair), or dialect eclipsis (sa gcathair); sa + vowel is "san".
  function sa(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n || f(t) !== 'sa') return;
      const a = fold(low(n));
      if (/^[bcfgp]/.test(a) && a[1] !== 'h' && !isEclipsed(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], 'After "sa", add a h after the first letter: sa chathair, sa bhaile (dialect eclipsis, as in sa gcathair, is also accepted).', 'sa-lenition'));
      else if (VOWELS.includes(a[0]) && ['arasan', 'eastat', 'oifig', 'ospideal', 'ostan', 'ionad', 'iarthar', 'oirthear'].includes(a)) out.push(hit(i, i + 1, ['san'], 'Before a vowel, "sa" becomes "san": san árasán, san ospidéal.', 'sa-vowel'));
    });
    return out;
  },
  // ar an + c/g/b/f/p must change: ar an gcéad lá (or ar an chéad lá in Ulster).
  function arAn(s) {
    const out = [];
    s.forEach((t, i) => {
      const a = s[i + 1], n = s[i + 2];
      if (!n || f(t) !== 'ar' || f(a) !== 'an') return;
      const w = fold(low(n));
      // "fichiú" is left alone: the Caighdeán keeps f unchanged after the article in ordinals (an fichiú).
      if (/^[bcfgp]/.test(w) && w[1] !== 'h' && !isEclipsed(n.raw) && !/^fichiu/.test(w)) out.push(hit(i, i + 3, [t.raw, a.raw, eclipse(n.raw)], 'After "ar an", the next word changes: ar an gcéad lá, ar an gcúigiú lá (or ar an chéad lá in Ulster).', 'ar-an'));
    });
    return out;
  },
  // "de" (of) lenites: de mhí Iúil, de Mhárta (An Caighdeán Oifigiúil 2017, 10.2.5).
  function de(s) {
    return s.flatMap((t, i) => {
      const n = s[i + 1];
      if (!n || low(t) !== 'de' || !/^(mi|marta|bealtaine|meitheamh|samhain)$/.test(f(n))) return [];
      return [hit(i, i + 2, [t.raw, lenite(n.raw)], '"De" adds a h after the first letter: de mhí Iúil, de Mhárta.', 'de-lenition')];
    });
  },
  // an- (very) lenites: an-chairdiúil, an-mhaith (but an-deas, an-te, an-sásta).
  function anIntensifier(s) {
    return s.flatMap((t, i) => {
      const m = /^(an-)(.+)$/i.exec(t.raw);
      if (!m || notAfterAn(m[2]) || !isLenitable(m[2])) return [];
      return [hit(i, i + 1, [m[1] + lenite(m[2])], '"An-" (very) adds a h after the first letter: an-chairdiúil, an-mhaith (but an-deas, an-sásta).', 'an-lenition')];
    });
  },
  // Hair is feminine, so its colour takes a h: gruaig dhonn. Plural eyes take a plural colour: súile gorma.
  function looks(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n) return;
      if (f(t) === 'gruaig' && /^(donn|dubh|fionn|gearr|fada|catach|bán|ban|breá|brea|dorcha|glas|cíordhubh|ciordhubh)$/.test(f(n)) && isLenitable(n.raw)) out.push(hit(i, i + 2, [t.raw, lenite(n.raw)], '"Gruaig" (hair) is feminine, so the colour after it takes a h: gruaig dhonn, gruaig fhionn, gruaig dhubh.', 'gruaig'));
      const pl = { gorm: 'gorma', donn: 'donna', glas: 'glasa', liath: 'liatha', dubh: 'dubha' }[f(n)];
      if (f(t) === 'suile' && pl) out.push(hit(i, i + 2, [t.raw, pl], '"Súile" (eyes) is plural, so the colour is plural too: súile gorma, súile donna, súile glasa.', 'suile'));
    });
    return out;
  },
  // Jobs: "Tá m'athair feirmeoir" needs "Is": Is feirmeoir é m'athair. And é for a man, í for a woman.
  function jobs(s) {
    const out = [];
    s.forEach((t, i) => {
      if (/^(ta|taim|bionn)$/.test(f(t))) {
        let k = i + 1, len = subjectAt(s, k, FEMALE) || subjectAt(s, k, MALE);
        if (!len && /^(se|si|me|mise)$/.test(f(s[k])) && f(t) === 'ta') len = 1;
        if (f(t) === 'taim') len = 0;
        const j = s[k + len];
        if ((len || f(t) === 'taim') && jobAt(j)) out.push(hit(i, k + len + 1, null, 'For a job, use "Is", not "Tá": Is múinteoir í mo mháthair. Is feirmeoir é m\'athair. (Or: Tá sé ina fheirmeoir.)', 'ta-job'));
      }
      // Is + a job (or "duine" and a few describing words) + é/í + who.
      let at = -1;
      if (low(t) === 'mar' && s[i + 1] && JOB.has(f(s[i + 1])) && isLenitable(s[i + 1].raw)) out.push(hit(i + 1, i + 2, [lenite(s[i + 1].raw)], '"Mar" (as) adds a h after the first letter: ag obair mar mhúinteoir, mar fheirmeoir.', 'mar-lenition'));
      if (f(t) === 'is' && jobAt(s[i + 1])) at = i + 2;
      else if (f(t) === 'is' && f(s[i + 1]) === 'duine') for (let k = i + 2; k < Math.min(s.length, i + 7); k++) if (low(s[k]) === 'é' || low(s[k]) === 'í') { at = k; break; }
      if (at > 0) {
        const p = s[at];
        if (!p) return;
        const fem = subjectAt(s, at + 1, FEMALE), masc = subjectAt(s, at + 1, MALE);
        if (low(p) === 'é' && fem) out.push(hit(at, at + 1, ['í'], 'For a woman, say "í": Is múinteoir í mo mháthair. ("É" is for a man.)', 'is-gender'));
        if (low(p) === 'í' && masc) out.push(hit(at, at + 1, ['é'], 'For a man, say "é": Is feirmeoir é m\'athair. ("Í" is for a woman.)', 'is-gender'));
      }
    });
    return out;
  },
  // "an duine is sean" -> is sine; "is óg" -> is óige; "Tá mé an duine is sine" -> Is mise an duine is sine.
  function oldest(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1], p = s[i - 1];
      if (f(t) === 'is' && p && /^(duine|paiste|dearthair|deirfiur|ceann|mac|inion)$/.test(f(p)) && n) {
        const right = { sean: 'sine', og: 'óige', sinne: 'sine' }[f(n)];
        if (right) out.push(hit(i + 1, i + 2, [right], 'Oldest is "is sine" and youngest is "is óige": an duine is sine, an duine is óige.', 'superlative'));
      }
      if ((f(t) === 'ta' && f(n) === 'me' && f(s[i + 2]) === 'an') || (f(t) === 'taim' && f(n) === 'an')) {
        const at = f(t) === 'taim' ? i + 2 : i + 3;
        if (s[at] && /^(duine|paiste|dara|triu|chead|ceathru)$/.test(f(s[at]))) out.push(hit(i, f(t) === 'taim' ? i + 1 : i + 2, ['Is', 'mise'], 'To say who you are ("the oldest"), use "Is mise", not "Tá mé": Is mise an duine is sine.', 'ta-the'));
      }
    });
    return out;
  },
  // "Réitím maith" and "Tá mé maith" need "go": go maith.
  function goMaith(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1];
      if (!n || f(n) !== 'maith') return;
      const prev = s[i - 1];
      const ok = /^(reitim|reitimid|taim)$/.test(f(t)) || (f(t) === 'me' && prev && /^(ta|reitionn)$/.test(f(prev)));
      if (ok) out.push(hit(i + 1, i + 2, ['go', n.raw], 'Put "go" before "maith" here: réitím go maith, tá mé go maith.', 'go-maith'));
    });
    return out;
  },
  // "Ba mhaith mé" (I'd like) is "Ba mhaith liom"; so is "Is maith le mé" and "Is breá le mé".
  function liom(s) {
    const out = [];
    s.forEach((t, i) => {
      const n = s[i + 1], m = s[i + 2];
      if (!n || !m || !/^(ba|is)$/.test(f(t)) || !/^(mhaith|maith|brea|bhrea)$/.test(f(n))) return;
      const why = 'With "maith" and "breá" it\'s "liom" (with me), not "mé": Ba mhaith liom..., Is maith liom...';
      if (f(t) === 'ba' && (f(m) === 'me' || f(m) === 'mise')) out.push(hit(i + 2, i + 3, ['liom'], why, 'liom'));
      else if (f(m) === 'le' && s[i + 3] && (f(s[i + 3]) === 'me' || f(s[i + 3]) === 'mise')) out.push(hit(i + 2, i + 4, ['liom'], why, 'liom'));
    });
    return out;
  },
  // "le an" is "leis an"; "le na" is "leis na".
  function leis(s) {
    return s.flatMap((t, i) => (f(t) === 'le' && s[i + 1] && /^(an|na)$/.test(f(s[i + 1])) ? [hit(i, i + 1, ['leis'], 'Before "an" or "na", "le" becomes "leis": leis an múinteoir.', 'leis')] : []));
  },
];

// Common English words that aren't also Irish words (to spot an answer given in English).
const ENGLISH = new Set('my name am the and years year old live lives living brother brothers sister sisters mother father mum mom dad parents family have has of with get gets well he she works work job born from we they very im it its was are there people house only child oldest youngest along fine thanks hello hi yes kind funny nice tall short hair eyes blue brown his her our youngest eldest middle twins twin called county town city'.split(' '));

// Words often typed without their apostrophe.
const ALIASES = { daois: "d'aois", mainm: "m'ainm", dainm: "d'ainm", dathair: "d'athair", maintin: "m'aintín", daintin: "d'aintín", muncail: "m'uncail", duncail: "d'uncail", minion: "m'iníon", miníon: "m'iníon" };

export const GA = {
  fold,
  detectors: RULES,
  english: ENGLISH,
  aliases: ALIASES,
  fillers: ['(bhuel|ó|á|em|um|eh|sea|is ea|ní hea|ceart go leor|go raibh maith agat|a mháirín|a bhean an tí|maith go leor|le fírinne|i ndáiríre|go deimhin)'],
  slots: {},
};
export const MUTATE = { lenite, eclipse, isLenitable, isEclipsed };

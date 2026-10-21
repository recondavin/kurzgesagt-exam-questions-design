// Family comhrá for the Leaving Cert: standard Irish models, with forms from every dialect accepted.
// For each: how it's asked, its English, the accepted answers (patterns, see
// orals/engine/marker.js), mistakes particular to it, a model answer and a "say more" line with hand-written
// English, and the word tiles. {name}, {county} and {county_en} are filled from the student's details.
// The rules for mistakes that can happen in any answer are in grammar.js.
import { JOBS, MUTATE } from './grammar.js?v=oral-9';

const { lenite, isLenitable } = MUTATE;
const VOWEL = /^[aeiouáéíóú]/i;

// ---------------------------------------------------------------- shared slots
// Words that can't be a name, so "Is mise go maith" isn't read as a name.
const NOT_NAME = 'is|mise|me|ta|taim|go|maith|an|i|in|ag|ar|mo|do|sa|ainm|dom|orm|bliana|mbliana|deag|aois|agam|agus|ach|seo|sin|e|nil|ann|sea|duine|ait|chonai';
const AGE = '(trí bliana déag|ceithre bliana déag|cúig bliana déag|sé bliana déag|seacht mbliana déag|ocht mbliana déag|naoi mbliana déag|fiche bliain|fiche is a haon|bliain is fiche)';
const ADJ = ['sásta', 'sona', 'cúramach', 'dílis', 'tuirseach', 'neirbhíseach', 'cairdiúil', 'cineálta', 'greannmhar', 'cabhrach', 'foighneach', 'dian', 'ciúin', 'cainteach', 'spórtúil', 'cliste', 'deas', 'flaithiúil', 'macánta', 'fial', 'dícheallach', 'ceolmhar', 'gealgháireach', 'cróga', 'leisciúil', 'crosta', 'glic', 'réchúiseach', 'tuisceanach', 'ard', 'beag', 'íseal', 'tanaí', 'láidir', 'sláintiúil', 'óg', 'sean', 'dathúil', 'álainn', 'grámhar', 'gnóthach', 'ciallmhar', 'diongbháilte', 'éirimiúil', 'ealaíonta', 'stuama', 'cneasta', 'lách', 'cúthail', 'fuinniúil', 'spraíúil', 'dáiríre'];
// an- (very) lenites all but d, t and s.
const veryForm = a => 'an-' + (/^[dts]/i.test(a) ? a : lenite(a));
const ADJS = '(' + ADJ.concat(ADJ.map(veryForm)).join('|') + ')';
const JOB = '(' + JOBS.join('|') + ')';
// "ina" (in his) lenites; "ina" (in her) puts h before a vowel.
const JOB_HIS = '(' + JOBS.map(j => (VOWEL.test(j) ? j : lenite(j))).join('|') + ')';
const JOB_HER = '(' + JOBS.map(j => (VOWEL.test(j) ? 'h' + j : j)).join('|') + ')';
const JOB_MAR = JOB_HIS;
const FEMALE = "(mo mháthair|mo mham|mo mhamaí|mo dheirfiúr|m'aintín|mo mhamó|mo sheanmháthair)";
const MALE = "(m'athair|mo dhaid|mo dhaidí|mo dheartháir|m'uncail|mo dhaideó|mo sheanathair)";
const WHO = '(' + FEMALE.slice(1, -1) + '|' + MALE.slice(1, -1) + ')';
const FAMILY = "(le ({name}|mo mhuintir|mo theaghlach|mo chlann|mo thuismitheoirí|mo dheartháir|mo dheirfiúr|mo dheartháireacha|mo dheirfiúracha|mo mháthair|m'athair|mo mham|mo dhaid|m'uncail|m'aintín|gach duine (sa teaghlach|sa chlann|sa gclann|i mo theaghlach|i mo chlann|sa bhaile|sa mbaile)|gach duine acu)|leo [(go léir|ar fad|uile)]|léi|leis)";
const HOW_WELL = '(go maith|go han-mhaith|go breá|go réasúnta maith|go measartha maith|go hiontach|go dona)';
const PERS = '(beirt|triúr|ceathrar|cúigear|seisear|seachtar|ochtar|naonúr|deichniúr)';
const PEOPLE_N = '(dhá dhuine|trí dhuine|ceithre dhuine|cúig dhuine|sé dhuine|seacht nduine|ocht nduine|naoi nduine|deich nduine)';
const IN_FAMILY = '(i mo theaghlach|i mo chlann|sa teaghlach|sa chlann|sa gclann|i mo mhuintir|sa bhaile|sa mbaile|ionainn)';
const SIB_ONE = '(deartháir|deirfiúr|leasdeartháir|leasdeirfiúr)';
const SIB_PL = '(deartháireacha|deirfiúracha)';
const SIBS = '(' + [
  SIB_ONE + ' [amháin] [(níos sine|níos óige|atá níos sine|atá níos óige|amháin)]',
  'aon ' + SIB_ONE + ' amháin',
  'dhá (dheartháir|dheirfiúr)', '(trí|ceithre|cúig) (dheartháir|dheirfiúr)', '(seacht|ocht) (ndeartháir|ndeirfiúr)',
  // After beirt: the genitive plural, not lenited on d (An Caighdeán Oifigiúil 2017, 9.4.3); "beirt deartháir" is in a
  // State Examiner's own notes, so it is right too.
  'beirt ' + SIB_PL, 'beirt (deartháir|deirfiúr)', PERS + ' ' + SIB_PL, '(cúpla|leathchúpla)',
].join('|') + ')';
// "de mhí Iúil" is the Caighdeán's own example; Márta, Bealtaine, Meitheamh, Samhain and Nollaig take the article
// (mí an Mhárta), but "de mhí Márta" and "de Mhárta" are what most students say, so they are right too.
const MONTH = "(d'eanáir|d'fheabhra|de mhárta|d'aibreán|de bhealtaine|de mheitheamh|d'iúil|de lúnasa|de mheán fómhair|de dheireadh fómhair|de shamhain|de nollaig|de mhí (eanáir|feabhra|márta|an mhárta|aibreáin|aibreán|bealtaine|na bealtaine|meitheamh|an mheithimh|iúil|lúnasa|mheán fómhair|dheireadh fómhair|samhain|na samhna|nollaig|na nollag))";
const ORD = '(gcéad|chéad|dara|tríú|gceathrú|cheathrú|gcúigiú|chúigiú|séú|seachtú|ochtú|naoú)';
// After "ar an": standard eclipsis or dialect lenition; no t- before a vowel.
const DAY = '(' + ORD + ' [lá]|deichiú [lá]|(bhfichiú|fhichiú|fichiú) [lá]|tríochadú [lá]|(aonú|dóú|' + ORD.slice(1, -1) + ') lá déag|(aonú|dóú|' + ORD.slice(1, -1) + ') lá (is fiche|fichead)|aonú lá (is tríocha|tríochad))';
const YEAR = '[sa bhliain] dhá mhíle [(is|agus)] a (cúig|sé|seacht|hocht|naoi|deich)';
// Anything may follow a right answer (another clause, more detail); the mistake rules still check all of it.
const TAIL = '[[(agus|ach|mar|is|nuair|cé go|freisin|chomh maith|mar sin)] {*20}]';

export const SLOTS = {
  name: { re: '(?:(?!(?:' + NOT_NAME + ') )[^ ]+ ){1,3}' },
  ta_me: '(tá mé|táim|tá mise)',
  age: AGE, adjs: ADJS, job: JOB, job_his: JOB_HIS, job_her: JOB_HER, job_mar: JOB_MAR,
  female: FEMALE, male: MALE, who: WHO, family: FAMILY, how_well: HOW_WELL,
  pers: PERS, people_n: PEOPLE_N, in_family: IN_FAMILY, sibs: SIBS, month: MONTH, day: DAY, year: YEAR, tail: TAIL,
  place: '{*8}',
};

// ---------------------------------------------------------------- the questions
export const QUESTIONS = [
  {
    id: 'ainm',
    ask: ['Cén t-ainm atá ort?', 'Cad is ainm duit?'],
    en: 'What\'s your name?',
    accept: [
      'is mise {name} {tail}', '{name} is ainm dom {tail}', '{name} an t-ainm atá orm {tail}', '{name} atá orm {tail}',
      "is é {name} m'ainm {tail}", "is é m'ainm ná {name} {tail}", 'glaotear {name} orm {tail}', '{name} a thugtar orm {tail}', '{name} a thugann siad orm {tail}',
    ],
    mistakes: [
      { when: '(tá mé|táim|tá mise) {name}', why: 'To say who you are, use "Is mise", not "Tá mé": Is mise Seán. ("Tá mé" is for how or where you are.)' },
      { when: "(mo ainm|m'ainm) (is|ná) {name}", why: 'Irish doesn\'t say "My name is" word for word. Say: Is mise Seán, or Seán is ainm dom.' },
    ],
    model: { ga: 'Is mise {name}.', en: 'I\'m {name}.' },
    more: { ga: 'Is mise {name}, agus tá áthas orm a bheith anseo.', en: 'I\'m {name}, and I\'m happy to be here.' },
    tiles: ['Is', 'mise', '{name}', 'is', 'ainm', 'dom', 'Tá', 'mé'],
  },
  {
    id: 'aois',
    ask: ['Cén aois thú?', 'Cén aois atá agat?', 'Cén aois tú?'],
    en: 'How old are you?',
    accept: [
      "{ta_me} {age} [d'aois] {tail}",
      { p: '{ta_me} (sé|seacht|ocht|naoi) déag {tail}', tip: 'People say this, but in the exam say it in full: ocht mbliana déag d\'aois.' },
      { p: "{age} [d'aois] {tail}", tip: 'Right, but answer in a full sentence in the exam: Tá mé seacht mbliana déag d\'aois.' },
    ],
    mistakes: [
      { when: "(tá|tá mé|táim) {age} [d'aois] agam {tail}", why: 'In Irish you don\'t "have" years. Say: Tá mé ocht mbliana déag d\'aois.' },
    ],
    model: { ga: 'Tá mé seacht mbliana déag d\'aois.', en: 'I\'m seventeen years old.' },
    more: { ga: 'Beidh mé ocht mbliana déag i mí Lúnasa.', en: 'I\'ll be eighteen in August.' },
    tiles: ['Tá', 'mé', 'sé', 'seacht', 'ocht', 'bliana', 'mbliana', 'déag', 'd\'aois', 'agam'],
  },
  {
    id: 'breith',
    ask: ['Cén uair a rugadh thú?', 'Cathain a rugadh thú?', 'Cad é do dháta breithe?'],
    en: 'When were you born?',
    accept: [
      'rugadh mé ar an {day} {month} [{year}] {tail}',
      '(is é|tá) mo bhreithlá ar an {day} {month} {tail}',
      'rugadh mé [ar an {day} {month}] {year} {tail}',
    ],
    mistakes: [
      { when: 'rugadh mé ar an (aon|haon|dó|trí|ceathair|cúig|sé|seacht|ocht|naoi|deich|fiche) {*12}', why: 'For the day of a date, use the ordinal: ar an tríú lá, ar an gcúigiú lá, ar an tríú lá déag.' },
    ],
    model: { ga: 'Rugadh mé ar an gcúigiú lá de mhí Iúil.', en: 'I was born on the fifth of July.' },
    more: { ga: 'Rugadh mé ar an gcúigiú lá de mhí Iúil, dhá mhíle is a hocht.', en: 'I was born on the fifth of July, two thousand and eight.' },
    tiles: ['Rugadh', 'mé', 'ar', 'an', 'gcúigiú', 'cúigiú', 'lá', 'de', 'mhí', 'mí', 'Iúil'],
  },
  {
    id: 'conai',
    ask: ['Cá bhfuil tú i do chónaí?', 'Cén áit a bhfuil tú i do chónaí?'],
    en: 'Where do you live?',
    accept: [
      '{ta_me} (i mo|im) chónaí {where} {tail}',
      'tá cónaí orm {where} {tail}',
      'cónaím {where} {tail}',
      { p: 'is as {place} mé {tail}', tip: 'That says where you\'re from. Where you live is: Tá mé i mo chónaí i...' },
    ],
    slots: {
      where: '((i|in|sa|san) {place}|faoin tuath|ar an mbaile mór|ar fheirm|ar an bhfeirm|gar do {place}|in aice le {place}|cois farraige|cois na farraige)',
    },
    mistakes: [
      { when: '{ta_me} (i mo|im) cónaí {*6}', why: 'After "i mo", add a h: i mo chónaí.' },
    ],
    model: { ga: 'Tá mé i mo chónaí {county}.', en: 'I live in {county_en}.' },
    more: { ga: 'Is ceantar ciúin é, agus is breá liom é.', en: 'It\'s a quiet area, and I love it.' },
    tiles: ['Tá', 'mé', 'i', 'mo', 'chónaí', 'cónaí', '{county_tiles}'],
  },
  {
    id: 'teaghlach',
    ask: ['Cé mhéad duine atá i do theaghlach?', 'Cé mhéad duine atá sa teaghlach?', 'Cé mhéad duine atá sa chlann?'],
    en: 'How many people are in your family?',
    accept: [
      'tá {pers} {in_family} [(mé féin|mise) san áireamh] {tail}',
      'tá {people_n} {in_family} [(mé féin|mise) san áireamh] {tail}',
      'tá {pers} againn [{in_family}] [(mé féin|mise) san áireamh] {tail}',
      '{pers} [ar fad] atá {in_family} [(mé féin|mise) san áireamh] {tail}',
      '{pers} [ar fad] atá againn [{in_family}] {tail}',
      { p: '{pers} {tail}', tip: 'Right, but answer in a full sentence in the exam: Tá cúigear i mo theaghlach.' },
    ],
    mistakes: [],
    model: { ga: 'Tá cúigear i mo theaghlach.', en: 'There are five people in my family.' },
    more: { ga: 'Mo thuismitheoirí, mo dheartháir, mo dheirfiúr agus mé féin.', en: 'My parents, my brother, my sister and me.' },
    tiles: ['Tá', 'ceathrar', 'cúigear', 'seisear', 'i', 'mo', 'theaghlach', 'teaghlach', 'daoine'],
  },
  {
    id: 'siblini',
    ask: ['An bhfuil deartháireacha nó deirfiúracha agat?', 'An bhfuil deartháir nó deirfiúr agat?'],
    en: 'Do you have brothers or sisters?',
    accept: [
      'tá {sibs} agam [agus {sibs}] {tail}',
      'tá {sibs} agus {sibs} agam {tail}',
      'níl ach {sibs} agam {tail}',
      'níl aon (deartháir|deirfiúr) agam {tail}',
      'níl (deartháir|deartháireacha|aon deartháir) ná (deirfiúr|deirfiúracha) agam {tail}',
      'is páiste aonair mé {tail}', '{ta_me} i mo pháiste aonair {tail}',
    ],
    mistakes: [],
    model: { ga: 'Tá deartháir amháin agam agus deirfiúr amháin.', en: 'I have one brother and one sister.' },
    more: { ga: 'Tá mo dheartháir níos sine ná mé, ach tá mo dheirfiúr níos óige.', en: 'My brother is older than me, but my sister is younger.' },
    tiles: ['Tá', 'deartháir', 'dheartháir', 'deirfiúr', 'amháin', 'amháin', 'dhá', 'agam', 'agus', 'Níl'],
  },
  {
    id: 'sine',
    ask: ['An tusa an duine is sine sa chlann?', 'Cén áit atá agat sa chlann?'],
    en: 'Are you the oldest in the family?',
    accept: [
      'is mise an (duine|páiste) is (sine|óige) [{in_family}] {tail}',
      'is mise an (dara|tríú) (duine|páiste) is (sine|óige) [{in_family}] {tail}',
      'is mé an (duine|páiste) is (sine|óige) [{in_family}] {tail}',
      'is mise an (duine|páiste) (sa lár|láir) [{in_family}] {tail}',
      '{ta_me} (sa lár|i lár na clainne) {tail}',
      '[ní mé] (is é|is í) ({who}|{name}) an (duine|páiste) is (sine|óige) [{in_family}] {tail}',
      'is páiste aonair mé {tail}',
      { p: '(is mé|ní mé|sea|ní hea)', tip: 'That answers it, but add a full sentence in the exam: Is mise an duine is sine sa chlann.' },
    ],
    mistakes: [],
    model: { ga: 'Is mise an duine is sine sa chlann.', en: 'I\'m the oldest in the family.' },
    more: { ga: 'Uaireanta bíonn orm aire a thabhairt do mo dheartháir beag.', en: 'Sometimes I have to look after my little brother.' },
    tiles: ['Is', 'mise', 'an', 'duine', 'is', 'sine', 'óige', 'sean', 'sa', 'chlann', 'Tá', 'mé'],
  },
  {
    id: 'post',
    ask: ['Cén obair a dhéanann do thuismitheoirí?', 'Cad a dhéanann do thuismitheoirí?'],
    en: 'What work do your parents do?',
    accept: [
      '{one} [agus {one}] {tail}',
      'is {job_pl} iad [mo thuismitheoirí] [beirt|araon] {tail}',
    ],
    slots: {
      one: '(' + [
        'is {job} (í {female}|é {male})',
        'tá {male} ina {job_his} [{*4}]', 'tá {female} ina {job_her} [{*4}]',
        "(oibríonn|bíonn) ({who}|sé|sí) (ag obair mar|mar) {job_mar} [{*4}]",
        "(oibríonn|bíonn) ({who}|sé|sí) ag obair (i|in|sa|san|le|ar) {*4}",
        "tá ({who}|sé|sí) ag obair (mar {job_mar}|i|in|sa|san|le|ar) [{*4}]",
        "tá ({who}|sé|sí) (dífhostaithe|ar scor|ag obair sa bhaile|ag obair ón mbaile|ag fanacht sa bhaile)",
        "fanann ({who}|sé|sí) sa bhaile", "tá post ag {who} (mar {job_mar}|i|in|sa|san) [{*4}]",
      ].join('|') + ')',
      job_pl: '(múinteoirí|altraí|dochtúirí|feirmeoirí|innealtóirí|cuntasóirí|gardaí|siopadóirí)',
    },
    mistakes: [
      { when: "tá {male} ina (" + JOBS.filter(isLenitable).join('|') + ') [{*4}]', why: 'For a man, "ina" means "in his", so the job takes a h: Tá m\'athair ina fheirmeoir.' },
      { when: "tá {female} ina (" + JOBS.filter(isLenitable).map(lenite).join('|') + ') [{*4}]', why: 'For a woman, "ina" means "in her", so no h: Tá mo mháthair ina múinteoir.' },
    ],
    model: { ga: 'Is múinteoir í mo mháthair agus is feirmeoir é m\'athair.', en: 'My mother is a teacher and my father is a farmer.' },
    more: { ga: 'Oibríonn mo mháthair i scoil sa bhaile mór.', en: 'My mother works in a school in the town.' },
    tiles: ['Is', 'múinteoir', 'í', 'mo', 'mháthair', 'agus', 'is', 'feirmeoir', 'é', 'm\'athair', 'Tá', 'máthair'],
  },
  {
    id: 'cursios',
    ask: ['Déan cur síos ar dhuine de do mhuintir.', 'Inis dom faoi dhuine de do mhuintir.'],
    en: 'Describe someone in your family.',
    accept: [
      'tá ({who}|sé|sí) {adjs} [[,] [agus] {adjs}] [[,] [agus] {adjs}] {tail}',
      'is duine {adjs} [agus {adjs}] (é [{male}]|í [{female}]) {tail}',
      'tá gruaig {hair} (air|uirthi|ar {who}) [agus tá súile {eyes} (aige|aici|ag {who})] {tail}',
      'tá súile {eyes} (aige|aici) {tail}',
      'tá ({who}|sé|sí) (níos sine|níos óige|níos airde) ná mé {tail}',
      "tá ({who}|sé|sí) {age} [d'aois] {tail}", "tá ({who}|sé|sí) (aon|dhá) bhliain [déag] d'aois {tail}",
      'tá ({who}|sé|sí) ag freastal ar {place}',
      'is breá le {who} {*8}', 'is maith le {who} {*8}',
    ],
    slots: {
      hair: '[(fhada|ghearr)] (dhonn|dhubh|fhionn|rua|liath|chatach|dhíreach|fhada|ghearr) [(dhonn|dhubh|fhionn|rua|liath|chatach|dhíreach)]',
      eyes: '(gorma|donna|glasa|liatha|dubha|móra)',
    },
    mistakes: [],
    model: { ga: 'Tá mo mháthair cineálta agus an-ghreannmhar.', en: 'My mother is kind and very funny.' },
    more: { ga: 'Is duine cabhrach í, agus bíonn sí i gcónaí ag gáire.', en: 'She\'s a helpful person, and she\'s always laughing.' },
    tiles: ['Tá', 'mo', 'mháthair', 'm\'athair', 'cineálta', 'agus', 'an-ghreannmhar', 'an-greannmhar', 'ard', 'Is', 'duine', 'í'],
  },
  {
    id: 'reiteach',
    ask: ['An réitíonn tú go maith le do mhuintir?', 'An réitíonn tú go maith le do thuismitheoirí?'],
    en: 'Do you get on well with your family?',
    accept: [
      '[ní] (réitím|réitíonn mé) {how_well} {family} [(den chuid is mó|formhór an ama|an chuid is mó den am)] {tail}',
      'ní (réitím|réitíonn mé) {family} {tail}',
      '[ní] (réitímid|réitíonn muid) {how_well} le chéile {tail}',
      '(bíonn|bímid|bíonn muid) ag argóint {*8}', 'bíonn (argóint|argóintí) againn {*8}',
      { p: '[ní] (réitím|réitíonn mé) {tail}', tip: 'That answers it, but add more in the exam: Réitím go maith le mo thuismitheoirí.' },
    ],
    mistakes: [
      { when: '[ní] (réitím|réitíonn mé|réitímid) go an-mhaith {*8}', why: 'After "go", put a h before a vowel: go han-mhaith.' },
    ],
    model: { ga: 'Réitím go han-mhaith le mo mhuintir.', en: 'I get on very well with my family.' },
    more: { ga: 'Bíonn argóint againn ó am go chéile, ach is gnáthrud é sin.', en: 'We argue now and then, but that\'s normal.' },
    tiles: ['Réitím', 'go', 'han-mhaith', 'an-mhaith', 'maith', 'le', 'mo', 'mhuintir', 'muintir', 'thuismitheoirí'],
  },
];

// ---------------------------------------------------------------- in the shop (Peadar, talk_peadar in story.ink)
// Things you can buy (as you'd ask for them, with no article), and "please".
const ITEM = '(buidéal uisce|buidéal bainne|buidéal cóc|buidéal sú oráiste|lítear bainne|cartán bainne|bainne|uisce|builín aráin|arán|arán donn|seacláid|barra seacláide|uachtar reoite|cóc|mála criospaí|paicéad criospaí|criospaí|pacáiste brioscaí|paicéad brioscaí|brioscaí|úll|úlla|oráiste|oráistí|banana|bananaí|ceapaire|nuachtán|irisleabhar|im|cáis|uibheacha|dosaen uibheacha|tae|caife|cupán tae|cupán caife|siúcra|sú oráiste|milseáin|mála milseán|stampa|cárta poist|peann|dhá bhuidéal uisce|dhá bharra seacláide|dhá úll|dhá cheapaire)';
const SHOP_SLOTS = { item: ITEM, items: '{item} [agus {item}]', please: '(le do thoil|más é do thoil é)' };

export const SHOP_QUESTIONS = [
  {
    id: 'siopa_ceannach',
    ask: ['Cad ba mhaith leat?', 'Cad atá uait?'],
    en: 'What would you like?',
    slots: SHOP_SLOTS,
    accept: [
      'ba mhaith liom {items} [{please}] {tail}', '{items} [{please}]', 'an bhféadfainn {items} a fháil [{please}]',
      'an bhfuil {items} agat', '(tá|teastaíonn) {items} uaim [{please}] {tail}',
    ],
    mistakes: [
      { when: 'is maith liom {items} {tail}', why: '"Is maith liom" means "I like". To ask for something, say "Ba mhaith liom...": Ba mhaith liom buidéal uisce, le do thoil.' },
    ],
    model: { ga: 'Ba mhaith liom buidéal uisce, le do thoil.', en: 'I\'d like a bottle of water, please.' },
    more: { ga: 'Ba mhaith liom buidéal uisce agus barra seacláide, le do thoil.', en: 'I\'d like a bottle of water and a bar of chocolate, please.' },
    tiles: ['Ba', 'mhaith', 'liom', 'buidéal', 'uisce', 'le', 'do', 'thoil', 'mé', 'Is'],
  },
  {
    id: 'siopa_praghas',
    ask: ['Ask Peadar how much it is.'],
    en: 'Ask how much it is.',
    slots: SHOP_SLOTS,
    accept: [
      '[gabh mo leithscéal] (cé|cá) mhéad atá (air|uirthi|orthu|orm|air sin|ar sin) {tail}', '[gabh mo leithscéal] cé mhéad (é|é sin|sin|iad)',
      '[gabh mo leithscéal] cén praghas atá (air|uirthi|orthu|air sin)', 'cad é an praghas [atá air]', 'cé mhéad a chosnaíonn (sé|sí|siad|sin)',
    ],
    mistakes: [
      { when: '(conas|cad) mhéad {*4}', why: '"How much" is "Cé mhéad": Cé mhéad atá air?' },
    ],
    model: { ga: 'Cé mhéad atá air?', en: 'How much is it?' },
    more: { ga: 'Gabh mo leithscéal, cé mhéad atá air sin?', en: 'Excuse me, how much is that?' },
    tiles: ['Cé', 'mhéad', 'atá', 'air', 'orm', 'Conas', 'é'],
  },
  {
    id: 'siopa_eile',
    ask: ['Aon rud eile?', 'An bhfuil aon rud eile uait?'],
    en: 'Anything else?',
    slots: SHOP_SLOTS,
    accept: [
      'níl [(go raibh maith agat|sin é|sin an méid)] {tail}', '(sin é|sin an méid) [go raibh maith agat] {tail}',
      'ba mhaith liom {items} [freisin] [{please}] {tail}', '{items} freisin [{please}]',
    ],
    mistakes: [],
    model: { ga: 'Níl, go raibh maith agat.', en: 'No, thank you.' },
    more: { ga: 'Níl, sin é, go raibh maith agat.', en: 'No, that\'s it, thank you.' },
    tiles: ['Níl', 'go', 'raibh', 'maith', 'agat', 'Sin', 'é', 'Tá'],
  },
];

// ---------------------------------------------------------------- counties
// Where you live: the form after "Tá mé i mo chónaí" ("i" with an eclipsis, "in" before a vowel, "sa" for the
// counties that take the article).
export const COUNTIES = [
  ['antrim', 'Antrim', 'in Aontroim'], ['armagh', 'Armagh', 'in Ard Mhacha'], ['carlow', 'Carlow', 'i gCeatharlach'],
  ['cavan', 'Cavan', 'sa Chabhán'], ['clare', 'Clare', 'sa Chlár'], ['cork', 'Cork', 'i gCorcaigh'], ['derry', 'Derry', 'i nDoire'],
  ['donegal', 'Donegal', 'i nDún na nGall'], ['down', 'Down', 'sa Dún'], ['dublin', 'Dublin', 'i mBaile Átha Cliath'],
  ['fermanagh', 'Fermanagh', 'i bhFear Manach'], ['galway', 'Galway', 'i nGaillimh'], ['kerry', 'Kerry', 'i gCiarraí'],
  ['kildare', 'Kildare', 'i gCill Dara'], ['kilkenny', 'Kilkenny', 'i gCill Chainnigh'], ['laois', 'Laois', 'i Laois'],
  ['leitrim', 'Leitrim', 'i Liatroim'], ['limerick', 'Limerick', 'i Luimneach'], ['longford', 'Longford', 'sa Longfort'],
  ['louth', 'Louth', 'i Lú'], ['mayo', 'Mayo', 'i Maigh Eo'], ['meath', 'Meath', 'sa Mhí'], ['monaghan', 'Monaghan', 'i Muineachán'],
  ['offaly', 'Offaly', 'in Uíbh Fhailí'], ['roscommon', 'Roscommon', 'i Ros Comáin'], ['sligo', 'Sligo', 'i Sligeach'],
  ['tipperary', 'Tipperary', 'i dTiobraid Árann'], ['tyrone', 'Tyrone', 'i dTír Eoghain'], ['waterford', 'Waterford', 'i bPort Láirge'],
  ['westmeath', 'Westmeath', 'san Iarmhí'], ['wexford', 'Wexford', 'i Loch Garman'], ['wicklow', 'Wicklow', 'i gCill Mhantáin'],
].map(([id, en, ga]) => ({ id, en, ga }));

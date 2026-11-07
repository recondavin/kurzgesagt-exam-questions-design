// The general-conversation questions for the Leaving Cert German oral, as Sabine (your host mother) asks them, by
// topic, with the present, the Perfekt, the future and the conditional in every topic; Higher-only questions are
// marked. For each: how it's asked (and a second wording), its English, accepted answers (patterns, see
// orals/engine/marker.js), a model answer and an extra sentence for Higher Level, with hand-written English.
// Model answers that depend on the student (name, age, family, jobs, hobby...) are made in personal.js.
// The role-plays (bakery, station, doctor) are here too: polite Sie, as in the exam.
// German forms are standard Hochdeutsch.

// ---------------------------------------------------------------- shared slots
const NOT_NAME = 'ich|bin|heisse|heisst|mein|name|ist|und|ja|nein|du|der|die|das|komme|aus|wohne|in|alt|jahre|bitte|danke';
const JOBWORDS = ['lehrer', 'lehrerin', 'krankenpfleger', 'krankenschwester', 'pfleger', 'pflegerin', 'arzt', 'ärztin', 'landwirt', 'landwirtin', 'bauer', 'bäuerin', 'ingenieur', 'ingenieurin', 'buchhalter', 'buchhalterin', 'polizist', 'polizistin', 'verkäufer', 'verkäuferin', 'elektriker', 'elektrikerin', 'tischler', 'tischlerin', 'bauarbeiter', 'bauarbeiterin', 'sekretär', 'sekretärin', 'manager', 'managerin', 'zahnarzt', 'zahnärztin', 'apotheker', 'apothekerin', 'busfahrer', 'busfahrerin', 'koch', 'köchin', 'friseur', 'friseurin', 'mechaniker', 'mechanikerin', 'klempner', 'klempnerin', 'rechtsanwalt', 'rechtsanwältin', 'anwalt', 'anwältin', 'journalist', 'journalistin', 'architekt', 'architektin', 'kellner', 'kellnerin', 'programmierer', 'programmiererin', 'wissenschaftler', 'wissenschaftlerin', 'fischer', 'fischerin', 'bäcker', 'bäckerin', 'informatiker', 'informatikerin', 'beamter', 'beamtin', 'geschäftsmann', 'geschäftsfrau', 'tierarzt', 'tierärztin', 'physiotherapeut', 'physiotherapeutin', 'soldat', 'soldatin', 'pilot', 'pilotin', 'schauspieler', 'schauspielerin', 'musiker', 'musikerin', 'sportler', 'sportlerin', 'designer', 'designerin', 'hausmann', 'hausfrau', 'rentner', 'rentnerin'];
const ADJ = ['nett', 'freundlich', 'lustig', 'witzig', 'hilfsbereit', 'streng', 'ruhig', 'sportlich', 'klug', 'intelligent', 'groß', 'klein', 'schlank', 'geduldig', 'fleißig', 'faul', 'ehrlich', 'großzügig', 'kreativ', 'laut', 'sympathisch', 'toll', 'super', 'cool', 'liebevoll', 'fröhlich', 'lieb', 'ordentlich', 'chaotisch', 'musikalisch', 'gesprächig', 'schüchtern', 'selbstbewusst', 'jung', 'alt'];
const TAIL = '[[(und|aber|weil|denn|also|auch|deshalb|dann|außerdem|oder|da|wenn|obwohl)] {*24}]';
// Past, future and conditional answers are right when they are in that tense (and no rule finds a mistake).
const PP = '(?:[a-z]*ge[a-z]+(?:t|en)|[a-z]+iert|besucht|bekommen|verbracht|verloren|erlebt|erzahlt|vergessen|entschieden|beschlossen|bestanden|besichtigt|verpasst|empfohlen|erreicht|verdient|gewonnen|vorbereitet|ubernachtet) ';
export const TENSE_SLOTS = {
  pp: { re: PP },
  past_verb: ['[{*8}] (habe|hab|hast|hat|haben|habt|bin|bist|ist|sind|seid) [{*14}] {pp} [{*14}]', '[{*8}] (war|waren|warst|wart|hatte|hatten|hattest|ging|fuhr|gab|kam|blieb|sah|machte|spielte|wollte|konnte|musste) {*20}'],
  future_verb: ['[{*8}] (werde|wirst|wird|werden|werdet) {*20}', '[{*6}] (morgen|übermorgen|nächstes|nächste|nächsten|heute abend|bald|später|in zukunft|im sommer|nach dem|nach der|dieses wochenende|am wochenende) {*20}', '[{*8}] (möchte|will|plane|hoffe) {*20}'],
  conditional_verb: ['[{*8}] (würde|würdest|würden|wäre|wären|wärst|hätte|hätten|hättest|möchte|möchten|könnte|könnten|sollte) {*20}'],
};
export const SLOTS = {
  name: { re: '(?:(?!(?:' + NOT_NAME + ') )[^ ]+ ){1,3}' },
  num: '(zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)',
  age: '(zwölf|dreizehn|vierzehn|fünfzehn|sechzehn|siebzehn|achtzehn|neunzehn|zwanzig|einundzwanzig)',
  month: '(januar|jänner|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)',
  ord: { re: '[a-z]+(?:ten|sten) ' },
  job: '[(ein|eine)] (' + JOBWORDS.join('|') + ')',
  adj: '(' + ADJ.join('|') + ')',
  fam: '(meinen eltern|meiner familie|meiner mutter|meinem vater|meinem bruder|meiner schwester|meinen geschwistern|meinen brüdern|meinen schwestern|ihnen|allen)',
  sib: '((einen|keinen) (bruder|stiefbruder|halbbruder|zwillingsbruder)|eine (schwester|stiefschwester|halbschwester|zwillingsschwester)|{num} (brüder|schwestern|geschwister)|keine (schwester|geschwister|brüder|schwestern))',
  where: '(auf dem land|in einer (kleinen|großen) stadt|in einer stadt|in einem [kleinen] dorf|in einem vorort|am stadtrand|in der stadt|in der nähe von {*3}|im (norden|süden|osten|westen) [(von irland|irlands)]|an der küste|am meer)',
  place: '{*6}',
  tail: TAIL,
};

// ---------------------------------------------------------------- the topics
export const TOPICS = {
  ich: ['Erzähl mal von dir und deiner Familie.', 'Tell me about yourself and your family.'],
  wohnort: ['Jetzt erzähl mal von deinem Wohnort.', 'Now tell me about where you live.'],
  schule: ['Wie ist es in der Schule?', 'What is school like?'],
  freizeit: ['Und was machst du gern in deiner Freizeit?', 'And what do you like doing in your free time?'],
  ferien: ['Reden wir über die Ferien.', 'Let’s talk about the holidays.'],
  zukunft: ['Und jetzt zur Zukunft.', 'And now to the future.'],
  deutsch: ['Reden wir über Irland und Deutschland.', 'Let’s talk about Ireland and Germany.'],
};

// id, topic, tense, Higher only, question, second wording, meaning, model answer, meaning, extra sentence, meaning,
// accepted answers besides the model (and besides the tense's own), parent (a follow-up is asked straight after it).
const ROWS = [
  // Ich und meine Familie
  ['name', 'ich', 'present', false, 'Wie heißt du?', 'Wie ist dein Name?', 'What’s your name?', 'Ich heiße {name}.', 'My name is {name}.', 'Ich komme aus Irland.', 'I’m from Ireland.',
    ['ich heiße {name} {tail}', 'mein name ist {name} {tail}', 'ich bin {name} {tail}', 'man nennt mich {name} {tail}', { p: '{name}', tip: 'Right, but answer in a full sentence in the exam: Ich heiße …' }]],
  ['age', 'ich', 'present', false, 'Wie alt bist du?', 'Wie alt bist du jetzt?', 'How old are you?', 'Ich bin siebzehn Jahre alt.', 'I’m seventeen years old.', 'Ich habe im Mai Geburtstag.', 'My birthday is in May.',
    ['ich bin {age} [jahre alt] {tail}', { p: '{age} [jahre alt]', tip: 'Right, but answer in a full sentence in the exam: Ich bin siebzehn Jahre alt.' }]],
  ['birthday', 'ich', 'present', false, 'Wann hast du Geburtstag?', 'Wann ist dein Geburtstag?', 'When is your birthday?', 'Ich habe am siebten Mai Geburtstag.', 'My birthday is on the seventh of May.', 'Meistens feiere ich mit meiner Familie.', 'I usually celebrate with my family.',
    ['(ich habe|ich hab) am {ord} [({month}|{ord})] geburtstag {tail}', 'mein geburtstag ist am {ord} [({month}|{ord})] {tail}', '(ich habe|ich hab) im {month} geburtstag {tail}', 'ich bin am {ord} [({month}|{ord})] [{*4}] geboren {tail}', { p: 'am {ord} [({month}|{ord})]', tip: 'Right, but answer in a full sentence in the exam: Ich habe am siebten Mai Geburtstag.' }]],
  ['live', 'ich', 'present', false, 'Wo wohnst du?', 'Wo wohnst du in Irland?', 'Where do you live?', 'Ich wohne in Galway.', 'I live in Galway.', 'Ich wohne in einer kleinen Stadt.', 'I live in a small town.',
    ['ich wohne in {place} {tail}', 'ich wohne {where} {tail}', 'ich komme aus {place} {tail}', 'wir wohnen in {place} {tail}']],
  ['family', 'ich', 'present', false, 'Wie viele Personen sind in deiner Familie?', 'Wie groß ist deine Familie?', 'How many people are in your family?', 'In meiner Familie gibt es fünf Personen.', 'There are five people in my family.', 'Wir verstehen uns gut.', 'We get on well.',
    ['in meiner familie gibt es {num} personen {tail}', 'es gibt {num} personen in meiner familie {tail}', 'wir sind {num} [personen] [(in meiner familie|zu hause)] {tail}', 'in meiner familie sind (wir|es) {num} [personen] {tail}', 'wir sind zu (zweit|dritt|viert|fünft|sechst|siebt|acht) {tail}', 'in meiner familie sind {num} personen {tail}', { p: '{num} [personen]', tip: 'Right, but answer in a full sentence in the exam: In meiner Familie gibt es fünf Personen.' }]],
  ['siblings', 'ich', 'present', false, 'Hast du Geschwister?', 'Hast du Brüder oder Schwestern?', 'Do you have brothers or sisters?', 'Ja, ich habe einen Bruder und eine Schwester.', 'Yes, I have a brother and a sister.', 'Mein Bruder ist älter als ich.', 'My brother is older than me.',
    ['[ja] ich habe {sib} [und {sib}] {tail}', '[nein] ich habe keine geschwister {tail}', '[nein] ich bin einzelkind {tail}', '(ja|nein) [{sib} [und {sib}]]']],
  ['position', 'ich', 'present', false, 'Bist du das älteste Kind?', 'Bist du das älteste oder das jüngste Kind?', 'Are you the oldest child?', 'Ich bin das mittlere Kind.', 'I’m the middle child.', 'Ich verstehe mich gut mit meinen Geschwistern.', 'I get on well with my brothers and sisters.',
    ['[(ja|nein)] ich bin das (älteste|jüngste|mittlere|zweitälteste|zweitjüngste) kind {tail}', '[(ja|nein)] ich bin (der|die) (älteste|jüngste|zweitälteste) {tail}', '[(ja|nein)] ich bin einzelkind {tail}', '[nein] (mein bruder|meine schwester) ist (älter|der älteste|die älteste) {tail}', { p: '(ja|nein)', tip: 'Add a full sentence in the exam: Ja, ich bin das älteste Kind.' }]],
  ['jobs', 'ich', 'present', false, 'Was sind deine Eltern von Beruf?', 'Was machen deine Eltern beruflich?', 'What do your parents do?', 'Mein Vater ist Lehrer. Meine Mutter ist Krankenschwester.', 'My father is a teacher. My mother is a nurse.', 'Meine Eltern arbeiten sehr hart.', 'My parents work very hard.',
    ['(mein vater|meine mutter) ist {job} {tail}', '(mein vater|meine mutter) arbeitet als {job} {tail}', '(mein vater|meine mutter) arbeitet (in|bei|im|für) {*6}', '(mein vater|meine mutter) ist (arbeitslos|in rente|selbstständig) {tail}', 'meine eltern sind (beide) {*4}', '(er|sie) ist {job} {tail}']],
  ['describe', 'ich', 'present', false, 'Wie ist deine Mutter?', 'Beschreib mal deine Mutter.', 'What is your mother like?', 'Meine Mutter ist sehr nett und lustig.', 'My mother is very nice and funny.', 'Sie hat braune Haare und blaue Augen.', 'She has brown hair and blue eyes.',
    ['(meine mutter|mein vater|meine schwester|mein bruder|sie|er) ist [(sehr|ziemlich|echt|total|immer|oft|manchmal)] {adj} [und [(sehr|ziemlich)] {adj}] {tail}', '(meine mutter|mein vater|sie|er) hat {*4} (haare|augen) {tail}', '(sie|er) ist {*8}']],
  ['get_on', 'ich', 'present', false, 'Verstehst du dich gut mit deinen Eltern?', 'Kommst du gut mit deiner Familie aus?', 'Do you get on well with your parents?', 'Ja, ich verstehe mich gut mit meinen Eltern.', 'Yes, I get on well with my parents.', 'Manchmal streiten wir, aber das ist normal.', 'Sometimes we argue, but that’s normal.',
    ['[(ja|nein)] ich verstehe mich {*3} mit {fam} {tail}', '[(ja|nein)] ich komme {*3} mit {fam} aus {tail}', '[(ja|nein)] [(meistens|normalerweise|eigentlich)] (wir verstehen uns|verstehen wir uns) {*3} {tail}', '[(ja|nein)] manchmal streiten wir {tail}', '(ja|nein) [(meistens|immer|nicht immer)]']],
  ['birthday_past', 'ich', 'past', false, 'Was hast du an deinem letzten Geburtstag gemacht?', 'Wie hast du deinen letzten Geburtstag gefeiert?', 'What did you do on your last birthday?', 'Ich habe mit meiner Familie gefeiert.', 'I celebrated with my family.', 'Wir sind essen gegangen.', 'We went out to eat.', []],
  ['age_next', 'ich', 'future', false, 'Wie alt wirst du an deinem nächsten Geburtstag?', 'Wie alt wirst du dieses Jahr?', 'How old will you be on your next birthday?', 'Ich werde achtzehn.', 'I’ll be eighteen.', 'Ich werde eine Party machen.', 'I’ll have a party.',
    ['ich werde {age} [jahre alt] {tail}', { p: '{age}', tip: 'Right, but answer in a full sentence in the exam: Ich werde achtzehn.' }]],
  ['lotto', 'ich', 'conditional', true, 'Was würdest du machen, wenn du im Lotto gewinnen würdest?', 'Was würdest du mit einer Million Euro machen?', 'What would you do if you won the lottery?', 'Ich würde meinen Eltern ein neues Haus kaufen.', 'I’d buy my parents a new house.', 'Ich würde auch eine Weltreise machen.', 'I’d also travel round the world.', []],

  // Mein Wohnort
  ['area', 'wohnort', 'present', false, 'Wie ist dein Wohnort?', 'Beschreib mal deinen Wohnort.', 'What is the place where you live like?', 'Ich wohne in einer kleinen Stadt.', 'I live in a small town.', 'Es gefällt mir dort sehr gut.', 'I like it there a lot.',
    ['ich wohne {*12}', '(es|er|sie|mein wohnort|meine stadt|mein dorf|die stadt|das dorf|die gegend) ist {*10}', 'es gibt {*12}']],
  ['area_do', 'wohnort', 'present', false, 'Was kann man in deiner Stadt machen?', 'Was gibt es in deiner Gegend zu tun?', 'What can you do in your town?', 'Man kann ins Kino gehen oder Sport treiben.', 'You can go to the cinema or do sport.', 'Es gibt auch ein Schwimmbad und einen Park.', 'There’s also a swimming pool and a park.',
    ['man kann {*14}', 'es gibt {*14}', 'wir können {*12}', 'man kann nicht viel machen {tail}']],
  ['area_missing', 'wohnort', 'present', true, 'Was fehlt in deiner Stadt?', 'Was gibt es in deiner Gegend nicht?', 'What’s missing in your town?', 'Es gibt kein Jugendzentrum.', 'There’s no youth centre.', 'Für junge Leute gibt es nicht viel zu tun.', 'There’s not much for young people to do.',
    ['es gibt (kein|keine|keinen) {*8}', 'es fehlt {*8}', 'uns fehlt {*8}', 'wir brauchen {*8}', 'es gibt nicht (viel|genug) {*8}']],
  ['area_past', 'wohnort', 'past', false, 'Was hast du letztes Wochenende gemacht?', 'Wie hast du das letzte Wochenende verbracht?', 'What did you do last weekend?', 'Ich habe Fußball gespielt.', 'I played football.', 'Danach bin ich mit Freunden in die Stadt gegangen.', 'After that I went into town with friends.', []],
  ['area_future', 'wohnort', 'future', false, 'Was wirst du nächstes Wochenende machen?', 'Was hast du nächstes Wochenende vor?', 'What will you do next weekend?', 'Ich werde ins Kino gehen.', 'I’ll go to the cinema.', 'Ich werde auch für die Schule lernen.', 'I’ll also study for school.', []],
  ['area_change', 'wohnort', 'conditional', false, 'Was würdest du in deiner Stadt ändern?', 'Was würdest du in deiner Gegend verbessern?', 'What would you change in your town?', 'Ich würde ein Jugendzentrum bauen.', 'I’d build a youth centre.', 'Das wäre gut für junge Leute.', 'That would be good for young people.', []],

  // Die Schule
  ['school', 'schule', 'present', false, 'Erzähl mal von deiner Schule.', 'Wie ist deine Schule?', 'Tell me about your school.', 'Meine Schule ist ziemlich groß.', 'My school is quite big.', 'Es gibt ungefähr achthundert Schüler.', 'There are about eight hundred pupils.',
    ['(meine schule|sie|es|unsere schule) ist {*10}', 'ich gehe [{*3}] (auf|in|zur) {*8}', 'es gibt {*10}', '(meine schule|sie) heißt {*5}', 'ich besuche {*8}']],
  ['subjects', 'schule', 'present', false, 'Wie viele Fächer hast du?', 'Welche Fächer lernst du?', 'How many subjects do you do?', 'Ich habe sieben Fächer.', 'I have seven subjects.', 'Ich lerne Deutsch, Englisch, Irisch und Mathe.', 'I study German, English, Irish and maths.',
    ['ich (habe|mache|lerne) {num} fächer {tail}', 'ich lerne {*12}', 'ich habe {*12}', 'ich mache {*12}']],
  ['favourite', 'schule', 'present', false, 'Was ist dein Lieblingsfach?', 'Welches Fach magst du am liebsten?', 'What is your favourite subject?', 'Mein Lieblingsfach ist Kunst.', 'My favourite subject is art.', 'Es ist sehr interessant.', 'It is very interesting.',
    ['mein lieblingsfach ist {*4} {tail}', 'ich mag {*4} am liebsten {tail}', '{*3} ist mein lieblingsfach {tail}', 'am liebsten (mag ich|habe ich|lerne ich) {*4} {tail}', 'ich (mag|liebe) {*6}']],
  ['teachers', 'schule', 'present', false, 'Wie findest du die Lehrer?', 'Magst du deine Lehrer?', 'What do you think of the teachers?', 'Die Lehrer sind sehr nett.', 'The teachers are very nice.', 'Sie helfen uns immer.', 'They always help us.',
    ['(die|meine|unsere) lehrer sind {*8}', 'ich finde (die|meine|unsere) lehrer {*8}', '(die meisten|einige|viele) lehrer sind {*8}', 'ich mag (die|meine|unsere) lehrer {tail}', '(sie|die lehrer) helfen {*8}']],
  ['uniform', 'schule', 'present', true, 'Was hältst du von der Schuluniform?', 'Wie findest du die Schuluniform?', 'What do you think of the school uniform?', 'Ich finde die Schuluniform praktisch.', 'I think the school uniform is practical.', 'Man muss morgens nicht überlegen, was man anzieht.', 'You don’t have to think about what to wear in the morning.',
    ['ich finde (die|unsere|meine) [schul]uniform {*8}', '(die|unsere|meine) [schul]uniform ist {*10}', 'ich (mag|hasse) (die|unsere|meine) [schul]uniform {tail}', 'meiner meinung nach {*14}', 'ich (denke|glaube|finde) {*14}']],
  ['school_past', 'schule', 'past', false, 'Was hast du gestern in der Schule gemacht?', 'Wie war die Schule gestern?', 'What did you do at school yesterday?', 'Gestern hatte ich eine Deutschprüfung.', 'Yesterday I had a German exam.', 'Sie war ziemlich schwer.', 'It was quite hard.', []],
  ['school_future', 'schule', 'future', false, 'Was wirst du morgen in der Schule machen?', 'Was hast du morgen in der Schule?', 'What will you do at school tomorrow?', 'Morgen werde ich eine Mathearbeit schreiben.', 'Tomorrow I’ll do a maths test.', 'Ich werde heute Abend dafür lernen.', 'I’ll study for it this evening.', []],
  ['principal', 'schule', 'conditional', false, 'Was würdest du ändern, wenn du die Schule leiten würdest?', 'Was würdest du an deiner Schule ändern?', 'What would you change if you ran the school?', 'Ich würde die Schuluniform abschaffen.', 'I’d get rid of the school uniform.', 'Ich würde auch weniger Hausaufgaben geben.', 'I’d also give less homework.', []],

  // Freizeit
  ['hobby', 'freizeit', 'present', false, 'Was machst du in deiner Freizeit?', 'Was sind deine Hobbys?', 'What do you do in your free time?', 'Ich spiele gern Fußball.', 'I like playing football.', 'Das macht mir viel Spaß.', 'I really enjoy it.',
    ['ich (spiele|lese|schwimme|tanze|singe|koche|male|zeichne|reite|laufe|jogge|surfe|fahre|gehe|treffe|höre|sehe|schaue|mache|backe|segle) {*10}', '(meine hobbys sind|mein hobby ist) {*10}', 'ich (mag|liebe) {*8}', 'in meiner freizeit {*14}', 'ich {*3} gern {*8}', 'am liebsten {*12}']],
  ['hobby_follow', 'freizeit', 'present', false, 'Spielst du in einer Mannschaft?', 'Bist du in einem Verein?', 'Do you play on a team?', 'Ja, ich spiele in einem Verein.', 'Yes, I play in a club.', 'Wir trainieren zweimal pro Woche.', 'We train twice a week.',
    ['(ja|nein) [{*14}]', 'ich (spiele|lese|trainiere|bin) {*12}', 'seit {*8}', '(es|das) macht {*10}', '(weil|denn) {*14}', 'wir trainieren {*10}', 'am liebsten {*10}'], 'hobby'],
  ['hobby_won', 'freizeit', 'past', false, 'Hast du schon einmal einen Preis gewonnen?', 'Hast du schon einmal einen Wettbewerb gewonnen?', 'Have you ever won a prize?', 'Ja, ich habe letztes Jahr einen Preis gewonnen.', 'Yes, I won a prize last year.', 'Ich war sehr stolz.', 'I was very proud.',
    ['nein [{*14}]', 'noch nie {*8}']],
  ['hobby_tonight', 'freizeit', 'future', false, 'Was wirst du heute Abend machen?', 'Was hast du heute Abend vor?', 'What will you do this evening?', 'Ich werde meine Hausaufgaben machen.', 'I’ll do my homework.', 'Dann werde ich fernsehen.', 'Then I’ll watch television.', []],
  ['hobby_time', 'freizeit', 'conditional', true, 'Was würdest du machen, wenn du mehr Zeit hättest?', 'Was würdest du mit mehr Freizeit machen?', 'What would you do if you had more time?', 'Ich würde mehr Zeit mit meinen Freunden verbringen.', 'I’d spend more time with my friends.', 'Ich würde auch ein Instrument lernen.', 'I’d also learn an instrument.', []],

  // Ferien
  ['summer_past', 'ferien', 'past', false, 'Was hast du letzten Sommer gemacht?', 'Wie hast du den letzten Sommer verbracht?', 'What did you do last summer?', 'Ich bin nach Spanien gefahren.', 'I went to Spain.', 'Ich war zwei Wochen dort.', 'I was there for two weeks.', []],
  ['holiday_where', 'ferien', 'past', false, 'Wo warst du in den Ferien?', 'Bist du in den Ferien weggefahren?', 'Where were you on holiday?', 'Ich war in Frankreich.', 'I was in France.', 'Ich bin mit meiner Familie dorthin geflogen.', 'I flew there with my family.', ['ich war {*10}', 'wir waren {*10}', 'nein [{*14}]'], 'summer_past'],
  ['holiday_weather', 'ferien', 'past', false, 'Wie war das Wetter?', 'Wie war das Wetter dort?', 'What was the weather like?', 'Das Wetter war sonnig und heiß.', 'The weather was sunny and hot.', 'Es hat kein einziges Mal geregnet.', 'It didn’t rain once.', ['(das wetter|es) war {*8}', 'es hat {*4} geregnet {tail}'], 'holiday_where'],
  ['holiday_enjoy', 'ferien', 'past', false, 'Hat es dir gefallen?', 'Hat dir der Urlaub gefallen?', 'Did you like it?', 'Ja, es hat mir sehr gut gefallen.', 'Yes, I liked it a lot.', 'Ich möchte gern zurückfahren.', 'I’d like to go back.', ['(ja|nein) [{*14}]', 'es war {*8}'], 'holiday_weather'],
  ['summer_next', 'ferien', 'future', false, 'Was wirst du nächsten Sommer machen?', 'Was hast du nächsten Sommer vor?', 'What will you do next summer?', 'Ich werde einen Ferienjob suchen.', 'I’ll look for a summer job.', 'Ich möchte Geld verdienen.', 'I want to earn money.', []],
  ['holiday_choice', 'ferien', 'conditional', false, 'Wohin würdest du fahren, wenn du die Wahl hättest?', 'Wohin würdest du am liebsten reisen?', 'Where would you go if you had the choice?', 'Ich würde nach Italien fahren.', 'I’d go to Italy.', 'Ich würde gern Rom sehen.', 'I’d like to see Rome.', []],

  // Die Zukunft
  ['after_school', 'zukunft', 'future', false, 'Was wirst du nach dem Leaving Cert machen?', 'Was hast du nach der Schule vor?', 'What will you do after the Leaving Cert?', 'Ich werde auf die Uni gehen.', 'I’ll go to university.', 'Ich möchte in Dublin studieren.', 'I’d like to study in Dublin.', []],
  ['dream_job', 'zukunft', 'conditional', false, 'Was möchtest du später werden?', 'Welchen Beruf möchtest du später haben?', 'What would you like to be later?', 'Ich möchte Lehrer werden.', 'I’d like to be a teacher.', 'Ich möchte gern anderen Menschen helfen.', 'I’d like to help other people.',
    ['ich (möchte|will|würde gern) {*4} werden {tail}', 'ich (möchte|will) {*12}', 'ich weiß [es] noch nicht {tail}']],
  ['why_job', 'zukunft', 'present', false, 'Warum?', 'Warum möchtest du das machen?', 'Why?', 'Weil ich gern mit Menschen arbeite.', 'Because I like working with people.', 'Der Beruf ist auch sehr interessant.', 'The job is also very interesting.',
    ['(weil|denn|da) {*20}', 'ich {*15}', '(es|das) ist {*10}', 'der beruf {*10}'], 'dream_job'],
  ['summer_job', 'zukunft', 'future', false, 'Wirst du im Sommer arbeiten?', 'Hast du vor, im Sommer zu arbeiten?', 'Will you work in the summer?', 'Ja, ich werde in einem Supermarkt arbeiten.', 'Yes, I’ll work in a supermarket.', 'Ich will Geld für die Uni sparen.', 'I want to save money for university.', ['(ja|nein) [{*14}]']],
  ['work_experience', 'zukunft', 'past', false, 'Hast du schon einmal ein Praktikum gemacht?', 'Hast du schon einmal gearbeitet?', 'Have you ever done work experience?', 'Ja, ich habe ein Praktikum in einer Schule gemacht.', 'Yes, I did work experience in a school.', 'Es hat mir sehr gut gefallen.', 'I liked it a lot.', ['nein [{*14}]', 'noch nie {*8}']],
  ['live_where', 'zukunft', 'conditional', true, 'Wo würdest du am liebsten wohnen?', 'Wo würdest du gern leben?', 'Where would you most like to live?', 'Ich würde am liebsten in Deutschland wohnen.', 'I’d most like to live in Germany.', 'Ich würde gern mein Deutsch verbessern.', 'I’d like to improve my German.', []],
  ['ten_years', 'zukunft', 'future', true, 'Wo wirst du in zehn Jahren sein?', 'Was machst du in zehn Jahren?', 'Where will you be in ten years?', 'In zehn Jahren werde ich in Dublin arbeiten.', 'In ten years I’ll be working in Dublin.', 'Ich werde hoffentlich einen guten Job haben.', 'Hopefully I’ll have a good job.', []],

  // Irland und Deutschland
  ['why_german', 'deutsch', 'present', false, 'Warum lernst du Deutsch?', 'Warum hast du Deutsch gewählt?', 'Why are you learning German?', 'Ich lerne Deutsch, weil es nützlich ist.', 'I’m learning German because it’s useful.', 'Deutschland ist ein wichtiges Land in Europa.', 'Germany is an important country in Europe.',
    ['ich lerne deutsch {*15}', '(weil|denn) {*15}', 'deutsch ist {*12}', 'ich finde deutsch {*10}', 'ich habe deutsch gewählt {*15}']],
  ['been_germany', 'deutsch', 'past', false, 'Warst du schon einmal in Deutschland?', 'Bist du schon einmal in Deutschland gewesen?', 'Have you ever been to Germany?', 'Nein, ich war noch nie in Deutschland.', 'No, I’ve never been to Germany.', 'Aber ich möchte bald hinfahren.', 'But I’d like to go soon.', ['(ja|nein) [{*14}]', 'ich war {*10}', 'noch nie {*6}']],
  ['differences', 'deutsch', 'present', true, 'Was ist der größte Unterschied zwischen Irland und Deutschland?', 'Was ist in Deutschland anders als in Irland?', 'What is the biggest difference between Ireland and Germany?', 'In Deutschland beginnt die Schule früher als in Irland.', 'In Germany school starts earlier than in Ireland.', 'Das Wetter ist in Deutschland im Sommer wärmer.', 'The weather in Germany is warmer in summer.',
    ['(in deutschland|in irland) {*16}', 'der [größte] unterschied ist {*14}', '(die deutschen|die iren) {*14}', 'ich (glaube|denke|finde) {*14}']],
];

// The model's first sentence is accepted word for word (commas are not words to the marker).
const literal = model => model.split(/(?<=[.!?]) /)[0].replace(/[.!?,]/g, '');
export const QUESTIONS = ROWS.map(([id, topic, tense, higher, ask, alt, en, model, modelEn, more, moreEn, accept = [], parent]) => ({
  id, topic, tense, higher, ask: [ask, alt], en, ...(parent ? { parent } : {}),
  accept: [...(/\{name\}/.test(model) ? [] : [literal(model)]), ...accept, ...(tense !== 'present' ? [`{${tense}_verb}`] : [])],
  mistakes: [], model: { ga: model, en: modelEn }, more: { ga: more, en: moreEn }, tiles: model.split(/\s+/),
}));

// ---------------------------------------------------------------- the role-plays (polite Sie)
const SHOP_SLOTS = {
  qty: '(ein|eine|einen|zwei|drei|vier|fünf|sechs|zehn|ein paar|ein halbes|einmal|zweimal)',
  item: '(brötchen|brot|brote|stück kuchen|stück apfelkuchen|stücke kuchen|stück torte|brezel|brezeln|croissant|croissants|berliner|krapfen|flasche wasser|flaschen wasser|kaffee|tee|kakao|vollkornbrot|roggenbrot|laugenbrezel|apfelstrudel|muffin|muffins|semmel|semmeln|schwarzbrot|toastbrot|kuchen)',
  items: '{qty} {item} [(und|und noch) {qty} {item}]',
  please: '(bitte|bitte schön)',
  ail: '(kopfschmerzen|kopfweh|halsschmerzen|bauchschmerzen|ohrenschmerzen|zahnschmerzen|rückenschmerzen|fieber|husten|schnupfen|eine erkältung|die grippe|grippe|durchfall|einen sonnenbrand)',
  since: '(gestern|vorgestern|heute morgen|heute früh|gestern abend|zwei tagen|drei tagen|vier tagen|einer woche|einem tag|ein paar tagen|letzter woche|dem wochenende|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)',
};
export const ROLEPLAYS = [
  { id: 'baecker_bestellen', ask: ['Was darf es sein?', 'Was möchten Sie?'], en: 'What would you like?',
    accept: ['ich hätte gern {items} [{please}] {tail}', 'ich möchte {items} [{please}] {tail}', '{items} [{please}]', 'ich nehme {items} [{please}]', '(kann|könnte) ich {items} haben [{please}]'],
    mistakes: [], model: { ga: 'Ich hätte gern zwei Brötchen, bitte.', en: 'I’d like two bread rolls, please.' }, more: { ga: 'Ich hätte gern zwei Brötchen und ein Stück Apfelkuchen, bitte.', en: 'I’d like two bread rolls and a piece of apple cake, please.' } },
  { id: 'baecker_sonst', ask: ['Sonst noch etwas?', 'Darf es noch etwas sein?'], en: 'Anything else?',
    accept: ['nein [danke] [das ist alles] [danke]', 'das ist alles [danke]', 'nein das wars [danke]', '[ja] {items} [{please}]', '[ja] noch {items} [{please}]', '[ja] ich (hätte gern|möchte) [noch] {items} [{please}]'],
    mistakes: [], model: { ga: 'Nein, danke. Das ist alles.', en: 'No, thanks. That’s all.' }, more: { ga: 'Ja, noch eine Brezel, bitte.', en: 'Yes, a pretzel too, please.' } },
  { id: 'baecker_preis', ask: ['Ask how much it costs.'], en: 'Ask how much it costs.',
    accept: ['[entschuldigung] (was|wie viel) (kostet|macht) (das|es|alles) [zusammen]', 'wie teuer ist das', '(was|wie viel) bin ich schuldig'],
    mistakes: [], model: { ga: 'Was kostet das?', en: 'How much is it?' }, more: { ga: 'Entschuldigung, was macht das zusammen?', en: 'Excuse me, what does that come to?' } },
  { id: 'bahn_fahrkarte', ask: ['Wie kann ich Ihnen helfen?', 'Was kann ich für Sie tun?'], en: 'How can I help you?',
    accept: ['ich (möchte|hätte gern) eine fahrkarte nach {*3} [{please}]', 'eine fahrkarte nach {*3} [{please}]', 'einmal nach {*3} [{please}]', 'ich möchte nach {*3} fahren [{please}]', '(kann|könnte) ich eine fahrkarte nach {*3} [haben] [{please}]'],
    mistakes: [{ when: '{*6} fahrkarte zu {*3}', why: 'For a town or city, use nach: eine Fahrkarte nach München.' }],
    model: { ga: 'Ich möchte eine Fahrkarte nach München, bitte.', en: 'I’d like a ticket to Munich, please.' }, more: { ga: 'Ich möchte eine Fahrkarte nach München für heute, bitte.', en: 'I’d like a ticket to Munich for today, please.' } },
  { id: 'bahn_einfach', ask: ['Einfach oder hin und zurück?'], en: 'Single or return?',
    accept: ['[(einmal|eine fahrkarte)] (hin und zurück|einfach) [{please}]'],
    mistakes: [], model: { ga: 'Hin und zurück, bitte.', en: 'Return, please.' }, more: { ga: 'Hin und zurück, bitte. Ich komme morgen zurück.', en: 'Return, please. I’m coming back tomorrow.' } },
  { id: 'bahn_abfahrt', ask: ['Ask when the next train leaves.'], en: 'Ask when the next train leaves.',
    accept: ['[entschuldigung] (wann|um wie viel uhr) (fährt|geht) der nächste zug [nach {*3}] [ab]', 'wann fährt der zug [nach {*3}] [ab]'],
    mistakes: [{ when: '(wann|um wie viel uhr) der nächste zug {*4}', why: 'In a question, the verb comes straight after the question word: Wann fährt der nächste Zug?' }],
    model: { ga: 'Wann fährt der nächste Zug?', en: 'When does the next train leave?' }, more: { ga: 'Entschuldigung, wann fährt der nächste Zug nach München?', en: 'Excuse me, when does the next train to Munich leave?' } },
  { id: 'bahn_umsteigen', ask: ['Ask if you have to change trains.'], en: 'Ask if you have to change trains.',
    accept: ['muss (ich|man) umsteigen', 'gibt es eine direkte verbindung', 'ist das eine direkte verbindung', 'fährt der zug direkt [nach {*3}]'],
    mistakes: [], model: { ga: 'Muss ich umsteigen?', en: 'Do I have to change?' }, more: { ga: 'Muss ich unterwegs umsteigen?', en: 'Do I have to change on the way?' } },
  { id: 'arzt_problem', ask: ['Was fehlt Ihnen denn?', 'Was haben Sie für Beschwerden?'], en: 'What’s the matter?',
    accept: ['ich habe {ail} [und {ail}] {tail}', 'mir ist (schlecht|übel|schwindlig|kalt|heiß) {tail}', 'mir tut {*3} weh {tail}', '(mein|meine) {*2} (tut|tun) weh {tail}', 'ich fühle mich (nicht wohl|krank|schlecht) {tail}', 'ich bin krank {tail}'],
    mistakes: [{ when: 'ich bin schlecht', why: 'Say "Mir ist schlecht" (I feel sick). "Ich bin schlecht" means "I am bad".' }],
    model: { ga: 'Ich habe Kopfschmerzen und Fieber.', en: 'I have a headache and a temperature.' }, more: { ga: 'Ich habe Kopfschmerzen und Fieber, und mir ist schlecht.', en: 'I have a headache and a temperature, and I feel sick.' } },
  { id: 'arzt_seit', ask: ['Seit wann haben Sie die Beschwerden?', 'Wie lange haben Sie das schon?'], en: 'How long have you had the symptoms?',
    accept: ['seit {since} {tail}', 'ich habe {*6} seit {since} {tail}', 'seit {*4}'],
    mistakes: [], model: { ga: 'Seit gestern.', en: 'Since yesterday.' }, more: { ga: 'Seit gestern Abend. Ich habe auch schlecht geschlafen.', en: 'Since yesterday evening. I also slept badly.' } },
  { id: 'arzt_schlimm', ask: ['Ask if it’s serious.'], en: 'Ask if it’s serious.',
    accept: ['ist (es|das) (schlimm|gefährlich|ernst)', 'ist es etwas ernstes', 'muss ich mir sorgen machen'],
    mistakes: [], model: { ga: 'Ist es schlimm?', en: 'Is it serious?' }, more: { ga: 'Ist es schlimm, Frau Doktor?', en: 'Is it serious, doctor?' } },
].map(q => ({ ...q, slots: SHOP_SLOTS, topic: 'rollenspiel', side: true, tiles: q.model.ga.split(/\s+/) }));

// Irish counties, as a German speaker names them (the English names, after "Ich wohne in").
export const COUNTIES = [
  ['antrim', 'Antrim'], ['armagh', 'Armagh'], ['carlow', 'Carlow'], ['cavan', 'Cavan'], ['clare', 'Clare'], ['cork', 'Cork'], ['derry', 'Derry'],
  ['donegal', 'Donegal'], ['down', 'Down'], ['dublin', 'Dublin'], ['fermanagh', 'Fermanagh'], ['galway', 'Galway'], ['kerry', 'Kerry'],
  ['kildare', 'Kildare'], ['kilkenny', 'Kilkenny'], ['laois', 'Laois'], ['leitrim', 'Leitrim'], ['limerick', 'Limerick'], ['longford', 'Longford'],
  ['louth', 'Louth'], ['mayo', 'Mayo'], ['meath', 'Meath'], ['monaghan', 'Monaghan'], ['offaly', 'Offaly'], ['roscommon', 'Roscommon'], ['sligo', 'Sligo'],
  ['tipperary', 'Tipperary'], ['tyrone', 'Tyrone'], ['waterford', 'Waterford'], ['westmeath', 'Westmeath'], ['wexford', 'Wexford'], ['wicklow', 'Wicklow'],
].map(([id, en]) => ({ id, en, ga: en }));

// Which tense an answer is in, for the "check the tense" hint (never a mistake).
// The conditional is told apart by its umlaut (würde, hätte, wäre), so it reads the words as typed, not folded.
export function tenseOf(sents) {
  const text = ' ' + sents.flat().map(t => t.fold).join(' ') + ' ', typed = ' ' + sents.flat().map(t => t.low).join(' ') + ' ';
  if (/ (würde|würdest|würden|wuerde|wuerdest|wuerden|wäre|wären|waere|hätte|hätten|hättest|haette|möchte|möchten|moechte|könnte|könnten) /.test(typed)) return 'conditional';
  if (/ (werde|wirst|wird|werdet) /.test(text)) return 'future';
  if (/ (habe|hab|hast|hat|haben|bin|bist|ist|sind) /.test(text) && new RegExp(' ' + PP).test(text)) return 'past';
  if (/ (war|waren|warst|hatte|hatten) /.test(text)) return 'past';
  if (/^ (ich|wir|meine?|es|das|die|der) [a-z]+(e|t|en|bin|ist|sind|habe|hat) /.test(text)) return 'present';
  return null;
}

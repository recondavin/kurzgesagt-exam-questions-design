// Standard Irish models. Open slots allow students' own details and dialect verb forms.
export const TENSE_SLOTS = {
  past_verb: '(bhí|bhíos|rinne|rinneas|chuaigh|chuas|chuamar|bhain|d’imir|d’imríomar|d’imir mé|d’ól|cheannaigh|bhuaigh|chaith|d’fhan|d’oibrigh|thaitin|ní raibh|ní dhearna|ní dheachaigh|níor {*2})',
  future_verb: '(beidh|beimid|déanfaidh|déanfaidh mé|rachaidh|rachaidh mé|rachad|imreoidh|imreoidh mé|caithfidh|caithfidh mé|oibreoidh|oibreoidh mé|ní bheidh|ní dhéanfaidh|ní rachaidh)',
  conditional_verb: '(bheadh|bheinn|bheimis|dhéanfainn|dhéanfadh|cheannóinn|thógfainn|chuirfinn|thabharfainn|rachainn|d’imreoinn|chaithfinn|ba mhaith|ní bheadh|ní dhéanfainn)',
};
export function tenseOf(sents) {
  const text = sents.flat().map(t => t.fold).join(' ');
  if (/\b(bheinn|bheadh|dheanfainn|cheannoinn|thogfainn|chuirfinn|rachainn|ba mhaith)\b/.test(text)) return 'conditional';
  if (/\b(beidh|beimid|deanfaidh|rachaidh|imreoidh|caithfidh|oibreoidh)\b/.test(text)) return 'future';
  if (/\b(bhi|rinne|chuaigh|bhuaigh|chaith|thaitin)\b/.test(text)) return 'past';
  if (/^(ta |taim |is |imrim |seinnim )/.test(text)) return 'present';
  return null;
}
export const TOPICS = {
  family: ['Labhraímis faoi do theaghlach.', 'Let’s talk about your family.'],
  area: ['Anois, labhraímis faoi do cheantar.', 'Now, let’s talk about your area.'],
  school: ['Inis dom faoi do shaol ar scoil.', 'Tell me about your school life.'],
  hobbies: ['Labhraímis faoi do chaitheamh aimsire.', 'Let’s talk about your hobbies.'],
  summer: ['Labhraímis faoin samhradh.', 'Let’s talk about summer.'],
  future: ['Anois, labhraímis faoin todhchaí.', 'Now, let’s talk about the future.'],
};
// id, topic, tense, Higher only, question, meaning, short answer, meaning, extra sentence
const rows = [
  ['birthday_past','family','past',false,'Cad a rinne tú do do bhreithlá anuraidh?','What did you do for your birthday last year?','Chuaigh mé go dtí an phictiúrlann.','I went to the cinema.','Bhí mo chairde liom.'],
  ['age_next','family','future',false,'Cén aois a bheidh tú ar do chéad bhreithlá eile?','How old will you be on your next birthday?','Beidh mé ocht mbliana déag.','I will be eighteen.','Beidh cóisir agam.'],
  ['lottery','family','conditional',true,'Dá mbuafá an Crannchur Náisiúnta, cad a dhéanfá?','If you won the National Lottery, what would you do?','Cheannóinn teach nua do mo thuismitheoirí.','I would buy my parents a new house.','Bheinn an-sásta.'],
  ['family_wish','family','conditional',false,'Cad ba mhaith leat a dhéanamh le do mhuintir?','What would you like to do with your family?','Ba mhaith liom dul ar saoire leo.','I would like to go on holiday with them.','Rachainn go dtí an Spáinn.'],
  ['area_describe','area','present',false,'Déan cur síos ar do cheantar.','Describe your area.','Tá mé i mo chónaí i mbaile beag.','I live in a small town.','Tá an ceantar ciúin agus álainn.'],
  ['area_facilities','area','present',false,'Cad iad na háiseanna atá i do cheantar?','What facilities are in your area?','Tá páirc agus leabharlann sa cheantar.','There is a park and a library in the area.','Téim go dtí an leabharlann go minic.'],
  ['area_missing','area','present',true,'Cad atá in easnamh i do cheantar?','What is missing in your area?','Níl ionad óige sa cheantar.','There is no youth centre in the area.','Tá gá le háiseanna do dhaoine óga.'],
  ['area_past','area','past',false,'Cad a rinne tú i do cheantar an deireadh seachtaine seo caite?','What did you do locally last weekend?','D’imir mé peil le mo chairde.','I played football with my friends.','Bhí an aimsir go deas.'],
  ['area_future','area','future',false,'Cad a dhéanfaidh tú an deireadh seachtaine seo chugainn?','What will you do next weekend?','Rachaidh mé go dtí an baile mór.','I will go to town.','Buailfidh mé le mo chairde.'],
  ['area_wish','area','conditional',false,'Cad ba mhaith leat a fheiceáil i do cheantar?','What would you like to see in your area?','Ba mhaith liom ionad óige a fheiceáil.','I would like to see a youth centre.','Bheadh sé úsáideach do dhaoine óga.'],
  ['taoiseach','area','conditional',true,'Dá mbeifeá i do Thaoiseach, cad a dhéanfá do do cheantar?','As Taoiseach, what would you do for your area?','Thógfainn ionad óige nua sa cheantar.','I would build a new youth centre locally.','Chuirfinn feabhas ar an iompar poiblí.'],
  ['school_about','school','present',false,'Inis dom faoi do scoil.','Tell me about your school.','Freastalaím ar mheánscoil áitiúil.','I attend a local secondary school.','Tá na múinteoirí an-chabhrach.'],
  ['school_number','school','present',false,'Cé mhéad ábhar atá á ndéanamh agat?','How many subjects are you studying?','Tá seacht n-ábhar á ndéanamh agam.','I am studying seven subjects.','Tá go leor oibre baile agam.'],
  ['school_subject','school','present',false,'Cén t-ábhar is fearr leat?','What is your favourite subject?','Is í an Ealaín an t-ábhar is fearr liom.','Art is my favourite subject.','Tá sí an-suimiúil.'],
  ['school_teachers','school','present',false,'An maith leat na múinteoirí?','Do you like the teachers?','Is maith liom na múinteoirí.','I like the teachers.','Cabhraíonn siad liom gach lá.'],
  ['school_uniform','school','present',true,'Cad é do thuairim faoin éide scoile?','What do you think of the uniform?','Ceapaim go bhfuil an éide scoile compordach.','I think the uniform is comfortable.','Ní gá dom éadaí a roghnú ar maidin.'],
  ['school_ty','school','past',false,'An ndearna tú an Idirbhliain?','Did you do Transition Year?','Rinne mé an Idirbhliain.','I did Transition Year.','Rinne mé taithí oibre in oifig.'],
  ['school_future','school','future',false,'Cad a dhéanfaidh tú ar scoil amárach?','What will you do at school tomorrow?','Déanfaidh mé staidéar ar an nGaeilge.','I will study Irish.','Beidh rang Ealaíne agam freisin.'],
  ['principal','school','conditional',false,'Dá mbeifeá i do phríomhoide, cad a dhéanfá?','As principal, what would you do?','Chuirfinn deireadh leis an éide scoile.','I would abolish the uniform.','Thabharfainn níos lú oibre baile do na daltaí.'],
  ['hobby','hobbies','present',false,'Cad é an caitheamh aimsire is fearr leat?','What is your favourite hobby?','Is í an pheil an caitheamh aimsire is fearr liom.','Football is my favourite hobby.','Cabhraíonn sí liom mo scíth a ligean.'],
  ['hobby_follow','hobbies','present',false,'An imríonn tú le club nó le foireann?','Do you play with a club or team?','Imrím le club áitiúil.','I play with a local club.','Bím ag cleachtadh gach seachtain.'],
  ['hobby_won','hobbies','past',false,'Ar bhuaigh tú aon chomórtas riamh?','Have you ever won a competition?','Bhuaigh mé comórtas anuraidh.','I won a competition last year.','Bhí áthas an domhain orm.'],
  ['hobby_tonight','hobbies','future',false,'Cad a dhéanfaidh tú anocht?','What will you do tonight?','Déanfaidh mé mo chuid oibre baile.','I will do my homework.','Rachaidh mé a chodladh go luath.'],
  ['hobby_time','hobbies','conditional',true,'Dá mbeadh níos mó ama agat, cad a dhéanfá?','With more time, what would you do?','Chaithfinn níos mó ama le mo chairde.','I would spend more time with my friends.','Rachainn ag snámh leo.'],
  ['hobby_wish','hobbies','conditional',false,'Cén caitheamh aimsire ba mhaith leat a thriail?','What hobby would you like to try?','Ba mhaith liom an snámh a thriail.','I would like to try swimming.','Bheadh sé go maith do mo shláinte.'],
  ['summer_past','summer','past',false,'Cad a rinne tú an samhradh seo caite?','What did you do last summer?','Chaith mé seachtain sa Ghaeltacht.','I spent a week in the Gaeltacht.','Bhí an-spraoi agam.'],
  ['summer_holiday','summer','past',false,'An ndeachaigh tú ar saoire?','Did you go on holiday?','Chuaigh mé go dtí an Spáinn.','I went to Spain.','Bhí mo mhuintir liom.'],
  ['summer_weather','summer','past',false,'Cén sórt aimsire a bhí ann?','What was the weather like?','Bhí sé te agus grianmhar.','It was hot and sunny.','Ní raibh báisteach ar bith ann.'],
  ['summer_enjoy','summer','past',false,'Ar thaitin sé leat?','Did you enjoy it?','Thaitin sé go mór liom.','I enjoyed it very much.','Ba bhreá liom dul ar ais.'],
  ['summer_next','summer','future',false,'Cad a dhéanfaidh tú an samhradh seo chugainn?','What will you do next summer?','Rachaidh mé go dtí an Ghaeltacht.','I will go to the Gaeltacht.','Beidh mé ag foghlaim Gaeilge.'],
  ['summer_choice','summer','conditional',false,'Dá mbeadh an rogha agat, cá rachfá ar saoire?','Given the choice, where would you go on holiday?','Rachainn go dtí an Iodáil.','I would go to Italy.','Ba mhaith liom an Róimh a fheiceáil.'],
  ['future_after','future','future',false,'Cad a dhéanfaidh tú tar éis na hArdteistiméireachta?','What will you do after the Leaving Cert?','Rachaidh mé go dtí an ollscoil.','I will go to university.','Beidh mé ag staidéar go dian.'],
  ['future_course','future','conditional',false,'Cén cúrsa ba mhaith leat a dhéanamh?','What course would you like to do?','Ba mhaith liom cúrsa Ealaíne a dhéanamh.','I would like to do an art course.','Bheinn sásta san ollscoil.'],
  ['future_job','future','conditional',false,'Cén post ba mhaith leat amach anseo?','What job would you like in the future?','Ba mhaith liom a bheith i mo mhúinteoir.','I would like to be a teacher.','Ba mhaith liom cabhrú le daoine.'],
  ['future_why','future','present',false,'Cén fáth?','Why?','Is maith liom cabhrú le daoine.','I like helping people.','Tá an obair suimiúil.'],
  ['future_work','future','future',false,'An mbeidh tú ag obair i rith an tsamhraidh?','Will you work during the summer?','Beidh mé ag obair i siopa.','I will work in a shop.','Beidh mé ag sábháil airgid.'],
  ['future_experience','future','past',false,'An ndearna tú taithí oibre riamh?','Have you done work experience?','Rinne mé taithí oibre i scoil.','I did work experience in a school.','Thaitin an obair liom.'],
  ['future_home','future','conditional',true,'Dá mbeadh an rogha agat, cá mbeifeá i do chónaí?','Given the choice, where would you live?','Bheinn i mo chónaí in Éirinn.','I would live in Ireland.','Rachainn abhaile go minic.'],
  ['future_ten','future','future',true,'Cá mbeidh tú i gceann deich mbliana?','Where will you be in ten years?','Beidh mé i mo chónaí i mBaile Átha Cliath.','I will live in Dublin.','Beidh post maith agam.'],
];
const MORE_EN = {
  birthday_past: 'My friends were with me.', age_next: 'I will have a party.', lottery: 'I would be very happy.', family_wish: 'I would go to Spain.',
  area_describe: 'The area is quiet and beautiful.', area_facilities: 'I go to the library often.', area_missing: 'Young people need facilities.', area_past: 'The weather was nice.', area_future: 'I will meet my friends.', area_wish: 'It would be useful for young people.', taoiseach: 'I would improve public transport.',
  school_about: 'The teachers are very helpful.', school_number: 'I have a lot of homework.', school_subject: 'It is very interesting.', school_teachers: 'They help me every day.', school_uniform: 'I do not need to choose clothes in the morning.', school_ty: 'I did work experience in an office.', school_future: 'I will also have an art class.', principal: 'I would give pupils less homework.',
  hobby: 'It helps me relax.', hobby_follow: 'I practise every week.', hobby_won: 'I was delighted.', hobby_tonight: 'I will go to bed early.', hobby_time: 'I would go swimming with them.', hobby_wish: 'It would be good for my health.',
  summer_past: 'I had great fun.', summer_holiday: 'My family were with me.', summer_weather: 'There was no rain at all.', summer_enjoy: 'I would love to go back.', summer_next: 'I will be learning Irish.', summer_choice: 'I would like to see Rome.',
  future_after: 'I will be studying hard.', future_course: 'I would be happy at university.', future_job: 'I would like to help people.', future_why: 'The work is interesting.', future_work: 'I will be saving money.', future_experience: 'I enjoyed the work.', future_home: 'I would go home often.', future_ten: 'I will have a good job.',
};
const ALTERNATE = {
  birthday_past: 'Conas a chaith tú do bhreithlá anuraidh?', age_next: 'Cén aois a bheidh tú ar do bhreithlá?', lottery: 'Cad a dhéanfá dá mbuafá an Crannchur Náisiúnta?', family_wish: 'Cad ba mhaith leat féin agus do mhuintir a dhéanamh le chéile?',
  area_describe: 'Inis dom faoin áit ina bhfuil tú i do chónaí.', area_facilities: 'Cén sórt áiseanna atá ar fáil i do cheantar?', area_missing: 'Cad iad na háiseanna nach bhfuil i do cheantar?', area_past: 'Conas a chaith tú an deireadh seachtaine seo caite?', area_future: 'Cad atá beartaithe agat don deireadh seachtaine seo chugainn?', area_wish: 'Cén áis nua ba mhaith leat i do cheantar?', taoiseach: 'Cad a dhéanfá ar son do cheantair dá mbeifeá i do Thaoiseach?',
  school_about: 'Déan cur síos ar do scoil.', school_number: 'Cé mhéad ábhar a dhéanann tú ar scoil?', school_subject: 'Cén t-ábhar scoile is mó a thaitníonn leat?', school_teachers: 'An dtaitníonn na múinteoirí leat?', school_uniform: 'An gceapann tú gur rud maith í an éide scoile?', school_ty: 'Ar chaith tú bliain san Idirbhliain?', school_future: 'Cad atá beartaithe agat don scoil amárach?', principal: 'Cad a d’athrófá dá mbeifeá i do phríomhoide?',
  hobby: 'Cad is maith leat a dhéanamh i d’am saor?', hobby_follow: 'An bhfuil tú i do bhall de chlub spóirt?', hobby_won: 'Ar éirigh leat comórtas a bhuachan riamh?', hobby_tonight: 'Cad atá beartaithe agat don oíche anocht?', hobby_time: 'Cad ba mhaith leat a dhéanamh dá mbeadh níos mó ama agat?', hobby_wish: 'An bhfuil caitheamh aimsire nua ba mhaith leat a thriail?',
  summer_past: 'Conas a chaith tú an samhradh seo caite?', summer_holiday: 'An raibh tú ar laethanta saoire?', summer_weather: 'Cén aimsir a bhí ann?', summer_enjoy: 'Ar bhain tú taitneamh as?', summer_next: 'Cad iad na pleananna atá agat don samhradh seo chugainn?', summer_choice: 'Cá rachfá ar saoire dá mbeadh an rogha agat?',
  future_after: 'Cad iad na pleananna atá agat tar éis na hArdteistiméireachta?', future_course: 'Cén cúrsa ar mhaith leat tabhairt faoi?', future_job: 'Cén ghairm ba mhaith leat a bheith agat?', future_why: 'Cén fáth a bhfuil suim agat sa phost sin?', future_work: 'An bhfuil sé ar intinn agat post samhraidh a fháil?', future_experience: 'Ar chaith tú seal ar thaithí oibre?', future_home: 'Cá roghnófá a bheith i do chónaí?', future_ten: 'Cá bhfeiceann tú thú féin i gceann deich mbliana?',
};
const PRESENT_ACCEPT = {
  area_describe: ['{ta_me} i mo chónaí {place}', 'tá {place} (ciúin|álainn|beag|mór) {tail}'],
  area_facilities: ['tá {*15} (sa cheantar|i mo cheantar|ann|anseo) {tail}'],
  area_missing: ['níl {*15} (sa cheantar|i mo cheantar|ann) {tail}', 'tá {*8} in easnamh {tail}'],
  school_about: ['freastalaím ar {place}', '{ta_me} ag freastal ar {place}'],
  school_number: ['tá {*4} á ndéanamh agam {tail}'],
  school_subject: ['is (é|í) {*5} an t-ábhar is fearr liom {tail}', 'is (maith|breá) liom {*8}'],
  school_teachers: ['(is|ní) (maith|breá) liom na múinteoirí {tail}', 'taitníonn na múinteoirí liom {tail}'],
  school_uniform: ['ceapaim go bhfuil {*15}', 'tá an éide scoile {*12}', '(is|ní) maith liom an éide scoile {tail}'],
  hobby: ['is (é|í) {*5} an caitheamh aimsire is fearr liom {tail}', 'is (maith|breá) liom {*12}'],
  hobby_follow: ['imrím le {*10}', 'seinnim {*10}', 'taitníonn (sé|sí) liom {tail}', 'ní imrím {tail}'],
  future_why: ['(mar|toisc|ó) {*20}', 'is maith liom {*15}', 'tá {*15}'],
};
export const EXTRA_QUESTIONS = rows.map(([id, topic, tense, higher, question, en, answer, meaning, more]) => ({
  id, topic, tense, higher, ask: [question, ALTERNATE[id]], en,
  ...(id === 'hobby_follow' ? { parent: 'hobby' } : id === 'future_why' ? { parent: 'future_job' } : ['summer_holiday','summer_weather','summer_enjoy'].includes(id) ? { parent: id === 'summer_holiday' ? 'summer_past' : 'summer_holiday' } : {}),
  accept: [answer.replace(/[.!?]$/,''), ...(PRESENT_ACCEPT[id] || []), ...(tense !== 'present' ? [`{${tense}_verb} {*25}`] : [])],
  mistakes: [], model: { ga: answer, en: meaning }, more: { ga: more, en: MORE_EN[id] }, tiles: answer.split(/\s+/),
}));

// The Gaeltacht story, first slice: arriving at the house in Conamara and getting to know the bean an tí, Máirín.
// You arrive on the bus and are free to walk about the village; talking to Máirín (in the kitchen of the thatched
// cottage) starts the conversation, and you can walk away from it. The others in the village say hello
// (talk_<id> knots at the end: the engine runs them on their own copy of the story).
// Day 1 she asks the ten questions and you answer with word tiles; day 2 she asks again and you type.
// Lines are "who: text"; English meanings are in #en tags or in orals/ga/main.js (ENGLISH).
// @ lines are stage directions for the engine (see orals/engine/game.js). Questions are in orals/ga/questions.js.
// Build: node tools/orals/build_story.mjs ga

VAR first_try = false

=== start ===
@place Lá 1 · Conamara
@roam mairin ^ Have a look around. Máirín's house is the thatched cottage with the red door.
@focus mairin player
mairin: Dia dhuit! Fáilte romhat go Conamara. #en:Hello! Welcome to Connemara.
* [Dia is Muire dhuit.]
- mairin: Is mise Máirín, bean an tí. #en:I'm Máirín, the woman of the house.
mairin: Suigh síos ansin, a stór. #en:Sit down there, love.
@do player sit cathaoir-n1 & mairin sit cathaoir-n2
@focus mairin player
mairin: An ólfaidh tú cupán tae? #en:Will you have a cup of tea?
* [Ólfaidh, go raibh maith agat.]
    mairin: Seo dhuit. #en:Here you are.
* [Ní ólfaidh, go raibh maith agat.]
    mairin: Ceart go leor. #en:That's fine.
- mairin: Anois, inis dom fút féin. #en:Now, tell me about yourself.
@round Lá 1
@mode tiles
mairin: Cén t-ainm atá ort? #ask:ainm
-> react ->
mairin: Cén aois thú? #ask:aois
-> react ->
mairin: Cén uair a rugadh thú? #ask:breith
-> react ->
mairin: Cá bhfuil tú i do chónaí? #ask:conai
-> react ->
mairin: Cé mhéad duine atá i do theaghlach? #ask:teaghlach
-> react ->
mairin: An bhfuil deartháireacha nó deirfiúracha agat? #ask:siblini
-> react ->
mairin: An tusa an duine is sine sa chlann? #ask:sine
-> react ->
mairin: Cén obair a dhéanann do thuismitheoirí? #ask:post
-> react ->
mairin: Déan cur síos ar dhuine de do mhuintir. #ask:cursios
-> react ->
mairin: An réitíonn tú go maith le do mhuintir? #ask:reiteach
-> react ->
@summary Lá 1 ^ Máirín knows you now
mairin: Go raibh maith agat. Is breá liom an comhrá. #en:Thank you. I love the chat.
mairin: Tá tú tuirseach tar éis an aistir. #en:You're tired after the journey.
mairin: Oíche mhaith, a stór. Feicfidh mé ar maidin thú. #en:Good night, love. I'll see you in the morning.
* [Oíche mhaith.]
- -> day2

=== day2 ===
@note Lá 2 ^ An mhaidin dár gcionn ^ The next morning. The teacher is calling to the house later, so Máirín wants to practise again. No word tiles this time: type your answers. ^ Go down to the kitchen
@place Lá 2 · An teach
@do player stand & mairin stand
@do player walk -2.3 1.6 & mairin walk -0.9 -1.7
@roam mairin ^ Say good morning to Máirín when you're ready.
@focus mairin player
mairin: Dia dhuit ar maidin! Ar chodail tú go maith? #en:Good morning! Did you sleep well?
* [Chodail, go raibh maith agat.]
- mairin: Beidh an múinteoir anseo tráthnóna. Déanaimis cleachtadh arís. #en:The teacher will be here this afternoon. Let's practise again.
@round Lá 2
@mode type
mairin: Cad is ainm duit? #ask:ainm
-> react ->
mairin: Cén aois atá agat? #ask:aois
-> react ->
mairin: Cén áit a bhfuil tú i do chónaí? #ask:conai
-> react ->
mairin: Cad é do dháta breithe? #ask:breith
-> react ->
mairin: Cé mhéad duine atá sa teaghlach? #ask:teaghlach
-> react ->
mairin: An bhfuil deartháir nó deirfiúr agat? #ask:siblini
-> react ->
mairin: Cén áit atá agat sa chlann? #ask:sine
-> react ->
mairin: Cad a dhéanann do thuismitheoirí? #ask:post
-> react ->
mairin: Inis dom faoi dhuine de do mhuintir. #ask:cursios
-> react ->
mairin: An réitíonn tú go maith le do thuismitheoirí? #ask:reiteach
-> react ->
@summary Lá 2 ^ Ready for the teacher
mairin: Maith thú! Beidh tú thar barr sa scrúdú. #en:Well done! You'll be excellent in the exam.
@end Críoch ^ That's the first part ^ Next: the shop, the céilí and the mock oral with the teacher.
-> END

// Máirín's reaction after each answer.
=== react ===
{ first_try:
    mairin: {~Togha!|Go hiontach!|Maith thú!|An-mhaith!}
- else:
    mairin: {~Sin é anois.|Tá sé agat anois.}
}
->->

// ---------------------------------------------------------------- the others in the village say hello
=== talk_aoife ===
aoife: Haigh! Is mise Aoife. #en:Hi! I'm Aoife.
aoife: Is as Corcaigh mé. Tá mé ag fanacht sa teach thall ansin. #en:I'm from Cork. I'm staying in the house over there.
aoife: Feicfidh mé ag an gcéilí thú! #en:I'll see you at the céilí!
-> DONE

=== talk_cormac ===
cormac: Dia dhuit! Is breá liom an fharraige anseo. #en:Hello! I love the sea here.
cormac: Ar mhaith leat dul ag snámh amárach? #en:Would you like to go swimming tomorrow?
* [Ba mhaith, go raibh maith agat.]
    cormac: Togha! Buailfimid le chéile ag an gcéibh. #en:Great! We'll meet at the pier.
* [Níor mhaith, go raibh maith agat.]
    cormac: Ceart go leor. Tá an t-uisce an-fhuar ar aon nós! #en:Fair enough. The water's very cold anyway!
- -> DONE

=== talk_peadar ===
peadar: Dia dhuit! Is mise Peadar, fear an tsiopa. #en:Hello! I'm Peadar, the shopkeeper.
peadar: Tá an siopa dúnta anois. Tar ar ais amárach! #en:The shop is closed now. Come back tomorrow!
-> DONE

=== talk_brid ===
brid: Dia dhuit! Is mise Bríd, an múinteoir. #en:Hello! I'm Bríd, the teacher.
brid: Beidh ranganna againn sa choláiste amárach. Ná bí déanach! #en:We'll have classes in the college tomorrow. Don't be late!
-> DONE

// The Gaeltacht story, first slice: arriving at the house in Conamara and getting to know the bean an tí, Máirín.
// Day 1 she asks the ten questions and you answer with word tiles; day 2 she asks again and you type.
// Lines are "who: text"; English meanings are in #en tags or in orals/ga/main.js (ENGLISH).
// @ lines are stage directions for the engine (see orals/engine/game.js). Questions are in orals/ga/questions.js.
// Build: node tools/orals/build_story.mjs ga

VAR first_try = false

=== start ===
@place Lá 1 · An teach
@note Lá 1 ^ Coláiste samhraidh i gConamara ^ You're spending three weeks in the Gaeltacht. This is the house you'll stay in. Everything here happens in Irish. ^ Go in
@roam mairin ^ Tap Máirín to talk to her
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
@roam mairin ^ Tap Máirín to say good morning
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
mairin: Cathain a rugadh thú? #ask:breith
-> react ->
mairin: Cé mhéad duine atá sa chlann? #ask:teaghlach
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

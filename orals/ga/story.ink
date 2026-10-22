// Standard Irish models; all dialects accepted. Build: node tools/orals/build_story.mjs ga
VAR first_try = false

=== start ===
@place Conamara
@roam mairin ^ Have a look around. Talk to Máirín in the thatched cottage when you're ready.
@focus mairin player
mairin: Dia duit! Fáilte romhat go Conamara. #en:Hello! Welcome to Connemara.
* [Dia is Muire duit.] #en:Hello to you too.
- mairin: Is mise Máirín, bean an tí. #en:I'm Máirín, the woman of the house.
mairin: Suigh síos ansin, a stór. #en:Sit down there, love.
@do player sit cathaoir-n1 & mairin sit cathaoir-n2
mairin: An ólfaidh tú cupán tae? #en:Will you have a cup of tea?
* [Ólfaidh, go raibh maith agat.]
    mairin: Seo duit. #en:Here you are.
* [Ní ólfaidh, go raibh maith agat.]
    mairin: Ceart go leor. #en:That's fine.
- -> practice

=== practice ===
@focus mairin player
@session
mairin: Ar mhaith leat leanúint ar aghaidh? #en:Would you like to continue?
+ [Ba mhaith, go raibh maith agat.] #en:Yes, please.
    -> practice
+ [Níor mhaith, go raibh maith agat.] #en:No, thank you.
    mairin: Ceart go leor. Feicfidh mé ar ball thú. #en:All right. I'll see you later.
    @do player stand & mairin stand
    @roam mairin ^ Explore the village. Talk to Máirín when you'd like more practice.
    -> practice

=== talk_aoife ===
aoife: Haigh! Is mise Aoife. #en:Hi! I'm Aoife.
aoife: Is as Corcaigh mé. Tá mé ag fanacht sa teach thall ansin. #en:I'm from Cork. I'm staying in the house over there.
aoife: Feicfidh mé ag an gcéilí thú! #en:I'll see you at the céilí!
-> DONE

=== talk_cormac ===
cormac: Dia duit! Is breá liom an fharraige anseo. #en:Hello! I love the sea here.
cormac: Ar mhaith leat dul ag snámh amárach? #en:Would you like to go swimming tomorrow?
* [Ba mhaith, go raibh maith agat.]
    cormac: Togha! Buailfimid le chéile ag an gcéibh. #en:Great! We'll meet at the pier.
* [Níor mhaith, go raibh maith agat.]
    cormac: Ceart go leor. Tá an t-uisce an-fhuar ar aon nós! #en:Fair enough. The water's very cold anyway!
- -> DONE

// In the shop: buying something from Peadar. The three questions are marked (questions.js, siopa_*).
=== talk_peadar ===
peadar: Dia duit! Fáilte isteach. #en:Hello! Welcome in.
peadar: Cad ba mhaith leat? #ask:siopa_ceannach
peadar: Cinnte. #en:Sure.
peadar: Aon rud eile? #ask:siopa_eile
player: Ask Peadar how much it is. #ask:siopa_praghas #prompt
peadar: Trí euro caoga, le do thoil. #en:Three euro fifty, please.
* [Seo duit.]
- peadar: Go raibh maith agat. Slán leat! #en:Thank you. Goodbye! (Slán leat is said by the one staying.) #sfx:coins
* [Slán agat!]
- -> DONE

=== talk_brid ===
brid: Dia duit! Is mise Bríd, an múinteoir. #en:Hello! I'm Bríd, the teacher.
brid: Beidh ranganna againn sa choláiste amárach. Ná bí déanach! #en:We'll have classes in the college tomorrow. Don't be late!
-> DONE

// ---------------------------------------------------------------- the east of the village
=== talk_tomas ===
tomas: Dia duit! Is mise Tomás, an traenálaí. #en:Hello! I'm Tomás, the coach.
tomas: An imríonn tú peil? #en:Do you play football?
* [Imrím.] #en:I do.
    tomas: Togha! Bíonn traenáil againn anseo gach Céadaoin. #en:Great! We have training here every Wednesday.
* [Ní imrím.] #en:I don't.
    tomas: Ná bí buartha. Tar chuig an bpáirc am ar bith! #en:Don't worry. Come down to the pitch any time!
- -> DONE

=== talk_nora ===
nora: Dia duit, a stór! Fáilte go dtí an caifé. #en:Hello, love! Welcome to the café.
nora: Ar mhaith leat cupán tae? #en:Would you like a cup of tea?
* [Ba mhaith, go raibh maith agat.] #en:Yes, thank you.
    nora: Seo duit. Bí cúramach, tá sé te! #en:Here you are. Careful, it's hot!
* [Níor mhaith, go raibh maith agat.] #en:No, thank you.
    nora: Ceart go leor. Feicfidh mé ar ball thú. #en:All right. I'll see you later.
- -> DONE

=== talk_seosamh ===
seosamh: Dia duit! Is iascaire mé. #en:Hello! I'm a fisherman.
seosamh: Bhí mé amuigh ar an bhfarraige ó mhaidin. #en:I've been out on the sea since this morning.
seosamh: Tá an teach solais sin ann le céad bliain. #en:That lighthouse has been there for a hundred years.
seosamh: Bí cúramach ar na carraigeacha! #en:Be careful on the rocks!
-> DONE

=== talk_ciara ===
ciara: Haigh! Is mise Ciara. Tá mé ocht mbliana d'aois. #en:Hi! I'm Ciara. I'm eight years old.
ciara: An bhfuil tú ag fanacht le Máirín? #en:Are you staying with Máirín?
* [Tá.] #en:I am.
    ciara: Is í mo mhamó í! #en:She's my granny!
* [Níl.] #en:I'm not.
    ciara: Ó! Is í Máirín mo mhamó. #en:Oh! Máirín is my granny.
- ciara: Slán! #en:Bye!
-> DONE

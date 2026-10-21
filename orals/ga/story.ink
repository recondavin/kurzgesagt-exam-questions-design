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

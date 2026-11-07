// Ein Sommer in Seeburg: the Leaving Cert German oral as a school exchange. You arrive by train and stay with the
// Wagners; Sabine (your host mother) asks the conversation questions in her kitchen (@session, questions in
// questions.js). Around the town: Lukas, Mia, Herr Brandt and Herr Maier say hello, and the role-plays are at the
// bakery stall (Frau Huber), the station (Herr Schulz) and the doctor's (Dr. Klein), in polite Sie.
// Lines are "who: text" with #en for the English. Build: node tools/orals/build_story.mjs de
VAR first_try = false

=== start ===
@place Seeburg
@roam sabine ^ Willkommen in Seeburg! Have a look around. Walk along the street past the market square: Sabine's house is the first one after it.
@focus sabine player
sabine: Hallo! Herzlich willkommen in Seeburg! #en:Hello! Welcome to Seeburg!
* [Hallo! Vielen Dank.] #en:Hello! Thanks very much.
- sabine: Ich bin Sabine, deine Gastmutter. Sag einfach Sabine zu mir. #en:I'm Sabine, your host mother. Just call me Sabine.
sabine: Wie war die Reise? #en:How was the journey?
* [Gut, danke, aber ein bisschen lang.] #en:Good, thanks, but a bit long.
    sabine: Das glaube ich! Du bist sicher müde. #en:I bet! You must be tired.
* [Sehr gut, danke!] #en:Very good, thanks!
    sabine: Super! #en:Great!
- sabine: Setz dich. Möchtest du etwas trinken? #en:Sit down. Would you like something to drink?
@do player sit stuhl-1 & sabine sit stuhl-2
* [Ja, gern. Ein Glas Wasser, bitte.] #en:Yes, please. A glass of water, please.
    sabine: Bitte schön. #en:Here you are.
* [Nein, danke.] #en:No, thanks.
    sabine: Kein Problem. #en:No problem.
- sabine: Lukas ist noch beim Training. Erzähl mal ein bisschen von dir! #en:Lukas is still at training. Tell me a bit about yourself!
-> practice

=== practice ===
@focus sabine player
@session
sabine: Möchtest du weitermachen? #en:Would you like to keep going?
+ [Ja, gern.] #en:Yes, please.
    -> practice
+ [Nein, danke. Ich gehe ein bisschen spazieren.] #en:No, thanks. I'll go for a little walk.
    sabine: Gute Idee! Bis später! #en:Good idea! See you later!
    @do player stand & sabine stand
    @roam sabine ^ Explore Seeburg. Talk to Sabine when you'd like more practice.
    -> practice

// ---------------------------------------------------------------- role-plays (Sie)
// At the bakery stall on the market square.
=== talk_huber ===
huber: Guten Tag! #en:Hello!
huber: Was darf es sein? #ask:baecker_bestellen
huber: Gern. #en:Sure.
huber: Sonst noch etwas? #ask:baecker_sonst
player: Ask how much it costs. #ask:baecker_preis #prompt
huber: Das macht drei Euro zwanzig, bitte. #en:That's three euro twenty, please.
* [Hier sind fünf Euro.] #en:Here's five euro.
- huber: Danke. Und eins achtzig zurück. #en:Thanks. And one eighty change. #sfx:coins
huber: Einen schönen Tag noch! #en:Have a nice day!
* [Danke, Ihnen auch! Auf Wiedersehen!] #en:Thanks, you too! Goodbye!
- -> DONE

// At the ticket window of the station.
=== talk_schulz ===
schulz: Guten Tag! #en:Hello!
schulz: Wie kann ich Ihnen helfen? #ask:bahn_fahrkarte
schulz: Einfach oder hin und zurück? #ask:bahn_einfach
player: Ask when the next train leaves. #ask:bahn_abfahrt #prompt
schulz: Der nächste Zug fährt um zehn Uhr fünfzehn von Gleis drei. #en:The next train leaves at ten fifteen from platform three.
player: Ask if you have to change trains. #ask:bahn_umsteigen #prompt
schulz: Ja, in Ulm. Das macht achtundvierzig Euro. #en:Yes, in Ulm. That's forty-eight euro.
* [Kann ich mit Karte zahlen?] #en:Can I pay by card?
- schulz: Ja, natürlich. Gute Reise! #en:Yes, of course. Have a good trip! #sfx:coins
* [Danke schön! Auf Wiedersehen!] #en:Thank you! Goodbye!
- -> DONE

// At the door of the doctor's.
=== talk_klein ===
klein: Guten Tag! Kommen Sie herein. #en:Hello! Come in.
klein: Was fehlt Ihnen denn? #ask:arzt_problem
klein: Oje. #en:Oh dear.
klein: Seit wann haben Sie die Beschwerden? #ask:arzt_seit
player: Ask if it's serious. #ask:arzt_schlimm #prompt
klein: Nein, keine Sorge. Es ist nur eine Erkältung. #en:No, don't worry. It's only a cold.
klein: Trinken Sie viel Wasser und bleiben Sie zwei Tage im Bett. #en:Drink plenty of water and stay in bed for two days.
klein: Hier ist ein Rezept für die Apotheke. Gute Besserung! #en:Here's a prescription for the pharmacy. Get well soon!
* [Vielen Dank, Frau Doktor!] #en:Thank you very much, doctor!
- -> DONE

// ---------------------------------------------------------------- people around the town
=== talk_lukas ===
lukas: Hey! Ich bin Lukas. Schön, dass du da bist! #en:Hey! I'm Lukas. Great that you're here!
lukas: Spielst du Fußball? #en:Do you play football?
* [Ja, ich spiele gern Fußball.] #en:Yes, I like playing football.
    lukas: Cool! Am Samstag haben wir ein Spiel. Kommst du mit? #en:Cool! We have a match on Saturday. Will you come along?
* [Nein, aber in Irland spiele ich Gaelic Football.] #en:No, but in Ireland I play Gaelic football.
    lukas: Gaelic Football? Das musst du mir zeigen! #en:Gaelic football? You'll have to show me!
- lukas: Morgen gehen wir zusammen in die Schule. Der Bus fährt um halb acht. #en:Tomorrow we're going to school together. The bus leaves at half past seven.
-> DONE

=== talk_mia ===
mia: Hallo! Du kommst aus Irland, oder? #en:Hi! You're from Ireland, right?
* [Ja, genau!] #en:Yes, exactly!
- mia: Wie findest du Deutschland bis jetzt? #en:How do you like Germany so far?
* [Sehr gut! Die Leute sind sehr freundlich.] #en:Very good! The people are very friendly.
* [Toll, aber das Wetter ist hier viel wärmer als in Irland!] #en:Great, but the weather's much warmer here than in Ireland!
- mia: Ich möchte nächstes Jahr nach Irland fahren. Ich will mein Englisch verbessern. #en:I'd like to go to Ireland next year. I want to improve my English.
mia: Vielleicht kann ich dich besuchen! #en:Maybe I can visit you!
-> DONE

=== talk_brandt ===
brandt: Guten Morgen! Ich bin Herr Brandt, der Englischlehrer. #en:Good morning! I'm Mr Brandt, the English teacher.
brandt: Herzlich willkommen an unserer Schule! Bei uns beginnt der Unterricht um acht Uhr und endet um Viertel nach eins. #en:Welcome to our school! Here lessons start at eight and finish at quarter past one.
brandt: Wie ist das in Irland? #en:How is it in Ireland?
* [In Irland beginnt die Schule um neun Uhr.] #en:In Ireland school starts at nine.
* [Bei uns endet die Schule um vier Uhr.] #en:Our school finishes at four.
- brandt: Interessant! Viel Spaß heute! #en:Interesting! Have fun today!
-> DONE

=== talk_maier ===
maier: Guten Tag! Schönes Wetter heute, nicht wahr? #en:Hello! Lovely weather today, isn't it?
maier: Ich fahre jeden Morgen mit meinem Boot auf den See. #en:I go out on the lake in my boat every morning.
maier: Heute habe ich drei große Fische gefangen! #en:Today I caught three big fish!
-> DONE

=== talk_jonas ===
jonas: Hallo! Haben Sie alles gefunden? #en:Hello! Did you find everything?
* [Ja, danke.] #en:Yes, thanks.
* [Nein. Wo finde ich die Milch?] #en:No. Where do I find the milk?
    jonas: Die Milch ist hinten links im Kühlregal. #en:The milk is at the back on the left, in the fridge.
- jonas: Einen schönen Tag noch! #en:Have a nice day!
-> DONE

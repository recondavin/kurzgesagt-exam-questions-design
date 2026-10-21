# Credits for the oral games (irish.html)

The bundled art and sounds below permit use in a paid product. Only the music needs a credit, and it's shown in the game's menu
(the ••• button).

## Computer voices and personal recordings

The selected service is Microsoft Azure Speech: `ga-IE-OrlaNeural` and `ga-IE-ColmNeural`.
The generated assets are subject to the user's Azure service agreement; they are not represented as CC0.
See Microsoft's [Text to speech REST documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech).
No ABAIR voices, recordings or assets are used.

`tools/orals/make_voice.mjs` synthesizes individual sentences, with the shared `voiceHash(voice, text)`
in `orals/engine/voice.js`. It writes `ga/voice/<hash>.mp3` and a resumable `index.json` manifest.
Names, birthday dates and arbitrary student-written answers may have no cached audio; their text remains visible.
The shipped manifest is empty until Azure credentials are supplied and the voice build is run.

Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` on the build machine, then run
`node tools/orals/make_voice.mjs` (or `--dry-run` to count assets without making requests).
Keys must never be committed or put in browser code. The voice build enumerates the independent fields
of every generated answer; parents' jobs are separate sentences so every job combination is covered.
Both voices are generated. The computer reads questions/dialogue and model answers; the model voice is
selected in About you. Music ducks further while a voice is actually playing.

Student microphone recordings stay on the device, use temporary object URLs, and are not uploaded.
The microphone tracks are stopped on Stop, self assessment, walking away, and page navigation.
There is no automatic speech scoring: students compare their recording with the model and assess themselves.

## Music

| File | Source | Licence | Changes |
| --- | --- | --- | --- |
| `audio/music-thatched-villagers.mp3` | "Thatched Villagers" by Kevin MacLeod, [incompetech.com](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Made quieter (levelled to sit under the game) and re-encoded smaller (96 kbps) |

Credit as the licence asks: *"Thatched Villagers" Kevin MacLeod (incompetech.com). Licensed under Creative Commons:
By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/*

## Sounds

From packs by Kenney ([kenney.nl](https://kenney.nl)), [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
(public domain, no credit needed, credited anyway). All trimmed, made mono and levelled; the interface sounds are
also softened a little. Built by `tools/orals/make_audio.py`.

| Files in `audio/` | Kenney pack | Original files |
| --- | --- | --- |
| `step-grass-0…3` | [Impact Sounds](https://kenney.nl/assets/impact-sounds) | `footstep_grass_000…003` |
| `step-wood-0…3` | Impact Sounds | `footstep_wood_000…003` |
| `step-stone-0…3` | Impact Sounds | `footstep_concrete_000…003` |
| `step-sand-0…3` | Impact Sounds | `footstep_snow_000…003` (snow crunch, for sand) |
| `door-open`, `door-close`, `coins` | [RPG Audio](https://kenney.nl/assets/rpg-audio) | `doorOpen_1`, `doorClose_4`, `handleCoins` |
| `tap`, `untap`, `next`, `talk` | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | `select_002`, `drop_002`, `click_002`, `bong_001` |
| `right`, `nearly`, `other` | Interface Sounds | `confirmation_004`, `question_004`, `question_002` |

Made for this game from scratch (by `tools/orals/make_audio.py`, no outside source): `audio/sea.mp3` (the waves),
`audio/bell.mp3` (the shop door's bell) and `audio/harp.mp3` (the end of a day).

## Models

The food in the shop is from Kenney's [Food Kit](https://kenney.nl/assets/food-kit),
[CC0](https://creativecommons.org/publicdomain/zero/1.0/). `tools/orals/convert_food.py` restyles it for the game
(one flat colour per face, softer colours, the game's own toon shading and ink outlines) into `models/food.js`.

| In the game | Kenney model | Changed |
| --- | --- | --- |
| milk | `carton` | purple to blue |
| juice | `carton-small` | pink to orange |
| water | `soda-bottle` | brown bottle to clear blue, blue label |
| cola | `soda-bottle` | |
| tomatoes, beans | `can` | beans: red label to green |
| tuna | `can-small` | purple band to blue |
| fizzy, lemonade | `soda-can` | lemonade: red to green |
| bread, sodabread, flour | `loaf`, `loaf-round`, `bag` | |
| honey, jam, ketchup | `honey`, `peanut-butter`, `bottle-ketchup` | jam: filling to red |
| chocolate | `chocolate` | |
| apple, orange, banana, pear, lemon, carrot, cabbage, onion, tomato, broccoli, mushroom | the models of the same names | |
| pepper, oil | `paprika`, `bottle-oil` | |
| croissant, muffin, donut, cake, pie | `croissant`, `muffin`, `donut-chocolate`, `cake`, `pie` | |
| lolly, chocice | `popsicle`, `popsicle-chocolate` | |

On the supermarket's shelves the models are also simplified a little at load time (`kit.js` `model`, nearby
corners joined), since there are over a thousand of them and each is only a few pixels high. The packets (cereal,
tea, crisps and so on) and bottles of washing-up liquid are simple shapes made in code.

Everything else in the game (the people, the village, the houses, the furniture, the supermarket) is built in code for this game.

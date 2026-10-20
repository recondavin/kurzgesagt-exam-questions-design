# Project State

Updated: 2026-09-02

## Project location

- Root: `/Users/davin/Documents/project/kurzgesagt-exam-questions-design`
- Primary page: `/Users/davin/Documents/project/kurzgesagt-exam-questions-design/Geography Questions.dc.html`
- Focus controller: `/Users/davin/Documents/project/kurzgesagt-exam-questions-design/hyper-focus.js`

## Current active paper

- The PE Question 7 version is preserved in Git commit `1f903e7` (`Save PE Question 7 page before Geography swap`).
- The visible paper is now page 5 of the official 2024 Leaving Certificate Geography Higher Level Part Two paper, containing the complete Question 3 page.
- The source PDF is `assets/source/geography-2024-hl-part2.pdf`.
- The rendered page asset is `assets/geography-2024-hl-part2-question-3-page.png`.
- Focus mode targets Question 3C and gives four concise steps: decoding the two-part task, balancing the 13 explained SRPs, structuring one SRP, and small non-answering prompts.

## What currently exists

The project is a top-down exam-desk scene containing:

- A cartoon wooden desk texture.
- A shaded white exam paper.
- An animated resting left hand.
- An animated right writing hand holding a blue pen.
- White school-shirt sleeves fitted to both wrists.
- A rowing question context and rowing figure.
- Force arrows and diagram annotations.
- A focus mode that moves between the context and image.
- A looping rowing video during image focus.
- A lower three-part Newton's laws question area.

## Approved visual work

The hand work was developed and approved before it was placed into this exam page.

- Left hand: layered SVG with subtle whole-hand and finger movement.
- Right hand: writing-hand rig with subtle movement while retaining the pen grip.
- Skin colour: matching peach/tan palette on both hands.
- Sleeves: white school-shirt sleeves; excess fabric was removed and the wrists were centred in the cuffs.
- The current hand assets in `assets/hands/` are the source of truth. Do not rebuild them from screenshots.

## Locked page behaviour

- Keep the rowing context and image in their current positions when changing the lower questions.
- Keep the cartoon desk, page shading, hands, sleeves, pen and motion unchanged.
- Keep the arrow and diagram overlays.
- Keep the staged arrow/diagram sequence and looping focus video.
- Keep the hyper-focus interaction unless the user explicitly requests a behaviour change.

## Latest completed task

The rejected hand-built lower question layout has been replaced by the real exam screenshot crop.

Completed:

1. Cropped the `(a)`, `(b)` and `(c)` block from the supplied authority screenshot.
2. Removed the original rugby figure caption from the crop.
3. Placed the crop beneath the existing rowing context and image.
4. Replaced the original part `(a)` rugby wording inside a copy of the source PDF, using the PDF's own embedded font and native text coordinates.
5. Preserved the crop's original `(a)`, `(b)`, `(c)` labels, bold `one`, typography, spacing and ruled answer boxes.
6. Added transparent HTML textareas over the raster answer boxes so answers remain typeable.
7. Rasterized `(a)`, `(b)` and `(c)` together so all three use the identical PDF rendering pipeline.
8. Reworded `(b)` to apply another law to Cian's stroke and `(c)` to ask why a coach uses Newton's laws; `(a)` was preserved unchanged.
9. Replaced the stylized top-right `Question 7` heading with a raster extracted directly from the same source exam PDF (`assets/exam-question-7-heading.png`). It preserves the embedded Calibri Bold face at 12 pt and the original title spacing while keeping the surrounding layout fixed.
10. Re-rendered the rowing context through the original exam PDF's embedded Calibri resource and Poppler, then placed the transparent raster in the context panel as `assets/exam-context-pdf.png`. The current version uses the larger 20 pt font over seven longer lines. The generator crops the transparent tail after the final glyph, and the panel extends 65 CSS pixels left before being right-aligned in its column. This matches part `(a)`'s PDF rendering path while preserving staged yellow evidence highlights and accessible text. The reproducible generator is `tools/generate_exam_context.py`; its preserved source PDF is under `assets/source/`.
11. Removed the `3a / Fixed stem / scrolling question rail` header and its progress strip. Reduced the exam paper height from 1743 to 1530 scene pixels so it ends immediately after the real question card with normal padding and no large blank footer.
12. At the user's request, changed the paper to an exact A4 portrait proportion: 1370 × 1938 scene pixels (210:297 rounded to the nearest whole pixel). Extended the desk scene to 1992 pixels high so the complete sheet remains visible with a 27-pixel lower desk margin; no question, image, context, hand, or interaction markup changed.
13. Replaced the truncated 1370 × 973 question raster with a 1370 × 1320 crop rendered from page 9 of the edited source PDF, so part (c) and its complete answer box continue into the A4 sheet. Recalibrated the three transparent answer hotspots to the taller asset and bumped its cache key to `v=5`.
14. Verified the rugby Leaving Cert source gives part (c) six writing rows (seven horizontal rules). Locked the 1370 × 1320 question reference against flex shrinking and bumped its cache key to `v=6`, ensuring the full authentic part (c) answer space is displayed rather than a cached or compressed crop.
15. Verified `assets/exam-question-7-heading.png` is pixel-for-pixel identical to the Question 7 heading crop rendered from the original exam PDF. Removed the decorative `Higher · Strand 1` and `15 marks` badge row that made the surrounding area look like an app rather than an exam, and bumped the heading cache key to `v=2`.
16. Lowered both approved 900 × 900 hand assets together by 100 scene pixels, from `top: 880px` to `top: 980px`. Their scale, horizontal position, sleeves, rigging and animation remain unchanged; both frames end at 1880px within the 1992px scene.
17. Extended both hand SVG canvases from 1254 × 1254 to 1254 × 1410 and added matching white-school-shirt forearm extensions behind the approved wrist/cuff artwork. Changed the scene render boxes from 900 × 900 to 900 × 1012, preserving the original 900/1254 scale while carrying both arms naturally to the 1992px scene bottom; hand and finger animation remains unchanged.
18. Replaced the generic vector forearm shapes after visual rejection. Extracted each approved cuff's exact embedded PNG, preserved the upper 220-pixel cuff/seam region, and vertically extended its real lower-shirt pixels into `left-shirt-sleeve-extended.png` and `right-shirt-sleeve-extended.png`. Each extension uses the original cuff transform and renders in front of the wrist, so the approved fabric gradient, edge shading, seam and angle continue down the forearm while the cuff visibly covers the skin. The original embedded cuff groups remain hidden in the SVGs for recovery.
19. Lengthened both approved shirt sleeves without redesigning their cuffs. Extended only the lower shirt-fabric region from 230 to 350 source pixels, increased both SVG canvases from 1410 to 1600 units, and kept each hand render bottom-anchored in the 1992-pixel scene. This reveals more forearm while preserving cuff size, wrist coverage, hand scale, color, pen geometry, and existing animation.
20. Eliminated floating wrists in browser-rendered pages by embedding each approved extended sleeve PNG directly inside its corresponding hand SVG as a data URI. The SVGs no longer depend on external sleeve-image requests, so the complete cuff and forearm remain visible when the SVG is used through an HTML `<img>` element or opened from a local file. Geometry, animation, hand art, pen art, and placement were not changed.
21. Normalized both school-shirt sleeves after visual QA. Reduced the cuff section from 220/570 to 150/570 pixels and reassigned that space to the flexible sleeve body, changing the cuff-to-sleeve ratio from 39% to 26% without changing total length or wrist coverage. Re-embedded the corrected rasters in both hand SVGs and added `normal-sleeves-1` cache-busting URLs in the page so local previews load the corrected artwork immediately.

Exact part `(a)` typography:

- Source paper: 2023 Leaving Certificate Physical Education, Higher Level, page 9.
- Font: embedded Calibri Regular.
- PDF size: 12 pt.
- PDF line interval: 14.6 pt.
- Web crop equivalent: 28 px type with a 34.1 px line interval.
- Prompt origin in the PDF: x = 85.08 pt; the web overlay maps this to 7.15% from the crop's left edge.
- Extracted reference font: `assets/fonts/exam-calibri-regular.ttf`.
- The browser does not typeset part `(a)` separately; its finished text is baked into `assets/exam-question-reference.png` with the rest of the exam block.

Authority screenshot:

- `/Users/davin/Desktop/Screenshot 2026-07-26 at 01.09.34.png`

Implementation detail:

- The literal crop preserves the real exam typography but its printed question text and rules are raster pixels.
- Interactive answer entry is retained with transparent HTML textareas positioned over the cropped answer boxes.
- Do not claim the crop is editable text unless the printed text is separately rebuilt.

## Current lower-question implementation

`Geography Questions.dc.html` presently contains an HTML/CSS approximation with:

- Bold `(a)`, `(b)` and `(c)` labels.
- A specially emphasised word `one` in part `(b)`.
- Ruled answer textareas.
- A submit row that appears when an answer is active.

This version is functional but visually rejected. Preserve it only as a fallback until the screenshot-based replacement is working.

## Bad Request diagnosis

The recurring `{"detail":"Bad Request"}` message is not caused by the webpage or by the user's requests.

Observed trigger:

- A broad command scanned the large Codex session JSONL, which contains embedded screenshot data.
- Another overly large documentation fetch also returned excessive output.
- The oversized task/tool payload was rejected by the Codex backend.

Prevention:

- Do not inspect or search `.codex/sessions`.
- Do not fetch large documentation pages for routine local edits.
- Keep every tool call and its output narrow.
- Reuse project files and this state document instead of mining conversation logs.

No session files need to be deleted. Project history and assets live in this project folder; task transcripts remain separate.

## Git and recovery

- The worktree already contains user changes. Never discard them wholesale.
- `Geography Questions.dc.html` and `hyper-focus.js` are modified.
- The desk, hand assets, rower still and rower video may be untracked depending on the current Git state.
- Before a new edit, run a bounded `git status --short` from this project folder.
- Use Git commits for reliable design checkpoints; do not rely on the Codex session transcript as version control.

## Recommended next action

Continue from the screenshot-based question block. Do not return to the rejected hand-built CSS version unless the user explicitly asks.

## Answer mode (answer-mode.js)
- Colours (chosen by the user from three mock-ups): slate like Duolingo's dark mode, used by `answer-mode.js`, the Biology CSS and the Biology scripts (not by generated art: diagrams, mini-games art, Draw it). Page #131F24, panels #18272D, cards #202F36, raised #2B3B42, lines #37464F; text #F1F7FB / #DCE6EC / #B9C7CF / #93A5AE / #7C8F98 / #5D7079; yellow #FFC800 (edge #E0A000), green #58CC02 (edge #58A700, light #89E219 / #A5ED6E), red #FF4B4B (#EA2B2B), blue #1CB0F6 (#1899D6), orange #FF9600 (#E08500). The exam paper keeps its cream #FFFEF8 and navy ink #13294A, so it matches the diagrams. The desk scene is unchanged; only the guide's green Next button and step bars on the desk page follow the new green.

- Finishing the 3B or 3C focus guide opens answer mode: the page clears, the real question crop (`assets/answer/q3b.png`, `q3c.png`) flies to the top of a ruled sheet, and the student types on the lines.
- Nothing is marked while typing. "Check my answer" marks the whole answer against an SRP bank written in the SEC style (15 SRPs x 2 marks): scoring sentences turn green one by one with a tick and +2, non-scoring ones get an orange wavy underline. The coach then shows the result with Continue writing / Finish / Still don't get it; Finish opens a results card (points made, points to add).
- Sentences are found even without full stops (a capital after an ordinary word starts a new one; place names and capitalised runs like Old Red Sandstone don't). Awarded points are saved in localStorage `am-granted-<question>`.
- Best upgrade: send the answer to Claude through a small server (e.g. a Cloudflare Worker holding the API key) from the same Check button, for marking that understands any wording.
- The answer is written on ruled pages (22 lines on page 1, 28 on each later page); text that overflows a page moves onto the next, and "+ Add a page" adds more.
- Page 1 starts with one worked SRP already written in (`example` in each question).
- The blinking cursor is drawn by the page (`.am-caret`) so it sits on the line; the textarea's own caret is hidden.
- Practise → "Training run" opens Training (`openTraining` in `answer-mode.js`). The old Learn → Real or vague → Sprint rounds felt like homework, so it's now one fast run of 12 mixed cards:
  - The deck (`runDeck`) takes the 4 points you know least (`am-master-<id>`, 0–3 per point; typing a point right adds 1, a miss takes 1 off) and goes: tap A, tap B, real-or-vague, gap A, tap C, type B, real-or-vague, tap D, gap C, type A, real-or-vague, type D. Easy first, harder later.
  - Tap cards use TEACH `a` (shuffled). A point you haven't typed right yet shows a "New point" box with its `say` text first. Gap cards (`gapCard`) blank one key word of the QUIZ `drag` sentence, with other key words from the question as the other choices (place names against place names, never words in `SAME_WORDS`). Real-or-vague uses `TRAIN`, with the verdict from the marker. Type cards use `learnAnswerRight` (the acc/rej keys), with a Show hint button and "I was right".
  - 3 hearts (lose one per miss, every 5 in a row wins one back). Points: 10 a card (typing 20, half with a hint), x2 from 3 in a row, x3 from 6, +5 within the speed bar (6s, 12s on a new point, 15s typing), +50 for a perfect run. Best in `am-run-<id>`, shown on the side tile.
  - Each right answer drops a layer onto a rock (3B) or a floor onto a building (3C). At the end the rock is squeezed into solid rock, or the building shakes in a quake. Feedback is a bottom sheet with Continue; keys 1–4 answer.
  - The 90-second SRP Sprint is still there from the end screen (best in `am-sprint-<id>`).
- Help only appears when the student clicks Stuck?. It opens a "Let's go over it" card for the next uncovered point: the guide's picture for that idea (`ExamHyperFocus.pictures()`), a short simple explanation, then "Test me": the explanation hides, question 1 is a multiple choice with believable wrong answers, and question 2 asks for one exam sentence that is checked by the real marker for that point (`teachMarks`). After two misses "Show me how" shows a model sentence; a passing sentence can go straight onto the answer lines (`TEACH` in `answer-mode.js`, one entry per point). "Not this bit?" chips switch to another uncovered point.
- Marks follow the official SEC 2024 Geography HL marking scheme (copy found at educateplus.ie, `Geography HL.pdf`):
  - 3B: 2 + 2 marks for two sedimentary rocks named, 13 SRPs for formation; Irish locations max 2 SRPs; no formation explained means max 2 SRPs.
  - 3C: 2 marks for a reference to prediction, 2 for reducing effects, 13 SRPs; a 2nd reference on a side earns 1 SRP; one side only is capped at 7 SRPs.
  - See `officialMarks()` in `answer-mode.js`.
- Marker accuracy is measured with `node tools/answer-mode-tests/run.mjs -v` on three sets of student-style sentences (the third was written after all word-list changes): all 100% at last run. A free in-browser meaning model (all-MiniLM, bge-small, gte-small) was tested and was less accurate than the word lists, so it is not used.
- Test the matcher with `window.ExamAnswerMode.score('question-3b', text)`.
- Answer plans (`PLANS` in `answer-mode.js`): a step checklist in the side panel (3B: name two rocks, sandstone's full story, what's different about limestone, two extras; 3C: predicting / reducing halves). Steps tick green as they are earned. Each step has Start my sentence and Confused? (`QUIZ`): drag word boxes into the gaps of a model sentence; a wrong word shows the hint. Right/wrong get tick/X animations.
- Brain dump (side panel): 4-minute timed free recall, marked against the plan ("You remembered X of 15"), then "How to phrase it" (student line vs exam version with key words highlighted, plus tips) and "What you missed" with Practise buttons that open the drag-the-words help. Last result saved in localStorage `am-dump-<question>` for future spaced review.
- Right panel order: score and pips, Check my answer, coach feedback, "What to cover" (`COVER` groups: 5 for 3B, 4 for 3C, each with x/y or Complete; tapping one opens the breakdown at its next step), "View full marking breakdown" toggle (the detailed `PLANS` checklist, hidden by default), then "Need help?" with Brain dump and Stuck?.
- Practise → "Draw it" (`openDraw` in `answer-mode.js`): study a diagram, then draw it from memory. 4 exam diagrams per question, shuffled. Each one:
  1. Prompt ("Study, then draw: a seismograph"), Go.
  2. Study (20 seconds, blue ring clock, or "I'm ready"): the exam diagram builds itself part by part and pops its labels on.
  3. It disappears and its labels fly into a label bank (right of the paper, or below it on narrow screens). 60 seconds to draw it from memory (Undo, Clear, Ctrl+Z; the clock turns red for the last 10 seconds and ticks for the last 5). Tap a label, then tap where it goes; tapping a placed label picks it up again. From the keyboard, a label goes down the left side of the paper.
  4. "Yours" replays beside the "Exam version". One tick row per label; unplaced labels can't be ticked. `goodSpots` auto-ticks labels in a good spot: on the same side (left/right, above/below) of the other labels as on the exam diagram wherever the diagram has them clearly apart, after setting aside the most out-of-place third. The rest are ticked by hand. Pointing at a row picks that label out on both drawings.
  - The score is labels ticked; the best total is in `am-draw-<id>`, shown on the tile. The end screen is a sketchbook of the run (hover to replay).
  - Diagrams live in `draw-it-diagrams.js`, generated by `tools/draw_it/build_diagrams.py` (flat side-on SVGs, 480 x 320, the diagram palette, Lexend labels on dark tags). `data-part` sets the build order and `data-label` the label order; each label also carries `tag` (its words) and `at` (the point it labels), read from the SVG. Any SVG can be swapped for new art. 3B: strata, sediment to rock, limestone, mountain to sea bed. 3C: seismograph, earthquake-proof building, seismic gap, monitoring a fault.
  - Drawings are saved Quick, Draw!-style in `am-sketchbook` (last 40, this device only): `{v: 2, subject, topic, thing, name, w, h, studyMs, ms, strokes: [[[x, y, ms], ...]], labels: [{i, s, x, y, t}], ticked, goodSpot, at}`. Step 2 is sending these (with consent) to a small server to build the Leaving Cert drawing dataset.
- Practise → "Beat the Examiner" (`openExaminer` in `answer-mode.js`): the examiner asks for the points of the answer plan (`PLANS[...].sections[].items`, using each item's `ask`) in essay order, 5 per round. You write one sentence; `examVerdict` judges it with the marker (`evaluate`) and the agreed SRP rules:
  - It earns an SRP (green "//") if it hits the point asked for, or any other point not yet banked ("Not what I asked for, but it's valid"; the one he wanted is asked again later). Up to 2 points per sentence.
  - Otherwise it gets a green-pen note (Caveat font): "Full sentence?" (under 5 words), "Surplus" (point already banked), "Incorrect" (the point's `rej` mix-ups, with its `why`), "Not relevant" (`EXAM_OFF` words for another topic, like volcanoes in an earthquake answer), "Vague" (the marker's near miss), or "?" with the point's hint. 3 tries, then he shows a sentence that would have got it (`examVersion`). "Teach me first" shows the plan's `why`.
  - The gain shown is the change in official marks (`marksFor`, the same function `officialMarks` now uses), so naming marks, first-mention marks, second references and caps count as in the scheme.
  - Banked sentences are kept per question in `am-bank-<id>`; the top bar is the essay map (one slot per plan item) and the marks /30. The end screen lists your essay; "Put it on my lines" adds the banked sentences in plan order, skipping points the answer already makes.
- Practise → "Mini games" (`openGames`, only for questions in `GAMES`): a hub card with three short games, each training one thing examiners reward. Content per question is in `GAMES[id]` (3B and 3C). Bests are kept as "score/out of" in `am-chain-<id>`, `am-level-<id>` and `am-mark-<id>` and shown on the hub tiles.
  - Chain reaction (`chainStart`): 3 processes per round (`chains`: title, steps in order, `why`). Tap a step to put it in the next empty slot, tap a filled slot to take it out, then Check: right ones lock green, wrong ones shake and go back. Solved, the chain falls like dominoes (one climbing ding per step) and its `why` shows it as one "because... so..." explanation with the key words highlighted. 3 stars right first time, 2 on the second try, else 1.
  - Level up (`levelStart`): 4 points per round (`level`: a statement, then two steps of three options). Pick the development, then the example, place or number; each good pick adds a new line to the paper and 2 marks (2 → 4 → 6). Wrong picks are traps with a type: f filler, o not relevant, v too vague, w wrong (with its own why); they turn red, say why and you pick again. Score is picks right first time (out of 8); the end screen shows the full points built.
  - Be the examiner (`markStart`): a made-up student's answer (`student`) in blue handwriting, one sentence per line: 5 real points from `TRAIN.real` (each about a different plan point, in plan order), one of them made again in other words later (`repeats`), 2 `TRAIN.vague`, 1 `off` and 1 `wrong`. Mark each line // or X, then "Hand back". The truth comes from the marker reading the answer in order (`markEarned`: a line earns an SRP if it adds a point the lines before haven't), and any line the marker reads differently from its type is left out. Each line then shows its verdict (SRP + point, No SRP, Not relevant, Wrong, Repeat of line N) and the summary compares the SRPs you gave with the scheme's.
  - Typing it out and from memory (asked for by the user): in Level up you type the statement and each sentence you pick out in full (`typeIt`: the sentence stays in view, 85% of its words in order passes, one-letter slips are fine, pasting is blocked); in Chain reaction you type the solved chain's explanation. After the round, a from-memory round (`recallStart`) asks for each point (cue: the item's `cue`) or chain (cue: its title) with nothing in view; a sentence or key term (the chain's bold words) counts if 60% of its key words come back (`recallKeys`, linking words ignored), and the model answer shows each key word green or red. The end screen adds "From memory: X of Y".
  - Fix it (Be the examiner, after handing back): up to three lines that earned nothing, those whose own better version would earn a new mark first. You rewrite each (or, for an off-topic line or a repeat, replace it with a new point); it passes if the marker finds a point the answer doesn't already have. Two tries, then the better version: `TRAIN.vague` and `GAMES.wrong` entries carry their own as a third item; off-topic lines and repeats get an unused real sentence.
  - The examiner mascot greets the hub ("Games? In my day we had textbooks.") and reacts to every check, pick and result.
  - Art (`mini-games-art.js`, generated by `tools/mini_games/build_game_art.py`, `window.ExamGameArt`): one flat, side-on picture per chain (400 x 300, Draw it palette, keyed by question and chain title) and the students' faces. In Chain reaction the picture sits beside the slots (the card widens to 900px; on narrow screens it goes above them) and builds up from the first step: `data-step="k"` parts show once steps 1 to k+1 are all in place, `data-until="k"` parts go when step k+1 changes the scene (flat layers folding, the sea draining), `data-live="k"` starts a CSS animation (`x-sway`: the base-isolated building sways), and `data-badge="k"` puts the step's number on the picture. Solving the chain builds the rest in time with the dominoes. Loops are SMIL; with reduced motion they are paused.
  - Level up shows the point's picture from the guide (`TEACH[id].pic`, or the item's own `pic`) beside the statement. Be the examiner shows the student (moods m-wait while you mark; then m-upset if you gave fewer SRPs than the scheme, m-smug if more, m-happy if the same) with a line in their handwriting.
- Marking decisions agreed with the user (from the SEC 2024 and 2026 schemes, kept in the scratchpad as ms2024.txt / ms2026.txt): an SRP is one specific, correct fact that answers the exact question (no three-part rule); vague, wrong, repeated or off-question lines earn nothing; each question uses its own scheme rules; a labelled diagram is 1 SRP plus up to 2 for new information on it. 3C (2024) is the same question as 2026 1B.
- The examiner is a strict cartoon teacher with round glasses, a pointer stick and an armful of books (chosen by the user; `examiner-art.js`, `window.ExamTeacher.svg(faces)`, generated by `tools/examiner/build_teacher.py` from the small two-tone picture `assets/examiner/teacher-source.png`: cut out, traced at 8x, coloured). A white sticker edge keeps his dark suit visible on the dark blue (removed once, then brought back by the user). The user's rule: always show all of him, never a crop or a frame (no square). He always faces into the page: he is drawn facing left, so `ExamTeacher.svg(faces)` mirrors him (`.tch--right`, CSS `scale:-1 1`) unless `faces` is 'left'; every place he appears today is on the left, so he faces right there (put him on the right of the screen with 'left'). `examinerFace()` in `answer-mode.js` puts all of him in Beat the Examiner (84 x 104 beside the question, 124 x 153 on the intro and end screens) and as the watching mascot. The Biology hub header shows just his head (`K.face` = `ExamTeacher.head()`: face, hair and ears cut off at the jaw, with its own white edge, never cropped by a box; `.bio-face` 96 x 109), as the user asked. Waiting, he breathes, blinks, glances round, lifts his brows now and then and sways the stick; `talk(face, ms)` (class `is-talking`) works his jaw, wags the stick from the wrist and lifts his brows on the beat. Moods via `data-mood` on `.am-exam__face` (set by `examMood` and `mascot`): ok, happy (brows up, his own mouth turned upside down into a smile, a little lower, with its one tooth, the same size, hanging from the top lip; his lower lip line and chin mark hide while he smiles; hop), angry (brows down, face reddens, shake) and furious (redder, steam). The brows lift off the round glasses with bottoms that follow the rims' curve (agreed with the user after several rounds; at rest he matches the source picture exactly). His lines (`EXAM_SAYS`) match the mood; the intro and end screens show a line in his handwriting ("Impress me.", "Hmph. Not bad.", "Disappointing...").
- Logo: still the original examiner's head (the earlier grumpy face) in his angry mood, no circle. `tools/logo/build_logo.py` builds `assets/logo/examiner.svg` from `tools/logo/examiner-face.svg` (that face's SVG); it is the browser tab icon and sits on the desk at the top left of the scene (`.site-logo`, 380 scene px, rotated, hard drop shadow, z-index 1). `assets/logo/apple-touch-icon.png` (180 x 180) is the head on the desk colour.
- The examiner also watches every activity: `.am-mascot` (in the answer-mode root) rises from the bottom-left corner whenever a card is open, except Beat the Examiner (he's in that card already), sized to the space beside the card (`placeMascot`, up to 220px wide and 1.23 times as tall, hidden below 110px, so not on phones, and then no speech bubble either). `mascot(mood, line)` sets his mood, talks, and shows his line in a white speech bubble above him (Nunito, rounded corners, a small rounded tail pointing down at his head; Beat the Examiner's question bubble is the same white with the tail pointing left at his face): training run right/wrong/out of hearts/end, sprint, Draw it study/draw/time's up/ticks/end, Stuck? quiz, Brain dump results, the mini games and the final results card.

## Biology (biology.html)

- Leaving Cert Biology, Higher Level, for the 2027 exam: chapters 28 Breathing, 29 Urinary, 30 Digestive, 31 Circulatory, 32 Infectious disease and the immune response. All five are built the same way: real questions on the desk, Build it / Draw it for every diagram to memorise, an action game, Chain reaction and Level up (with pictures), Be the examiner, Learn it drills, practice questions for the syllabus points no exam has asked, and the guide's science explainers (`bio/guideNN.js`). Each chapter has its own test, `node tools/bio/tests/chNN.mjs`.
- Action games: 28 Breath of air (an oxygen molecule down the airway, gas exchange at the alveolus, breathing control through exercise), 29 Nephron run, 30 Gut run (the right enzyme catches its food in the mouth, stomach and duodenum, then nutrients into the capillary or lacteal), 31 Red cell run (through the chambers and valves in time with the heartbeat, oxygen at the lungs, delivering it to body cells), 32 Immune chase (mark viruses with antibodies as a B cell, destroy infected cells as a killer T cell, then the faster memory response).
- Page: `biology.html` loads `bio/bio.css` and `bio/chNN.css`, `answer-mode.js` (the practice host and its games kit), `mini-games-art.js`, then per chapter `bio/dNN.js` (diagrams), `bio/qNN.js` (questions) and `bio/learnNN.js` (game and drill content), then `bio/bio-games.js` (Build it, Learn it, `BioKit`), `bio/actNN.js` (each chapter's action game) and `bio/bio.js`. Everything for one chapter is in its own files, so chapters can be worked on separately. Each chapter is `#chNN`, with tabs for Questions, Diagrams, Games and Learn it.
- Questions: every higher-level question on these chapters from the 2004–2026 papers and the SEC sample papers for 2027, extracted by hand into `tools/bio/questions/chNN.json` (the source of truth), then `tools/bio/build_bio_questions.py` writes `bio/qNN.js` (`window.BioQuestions[N]`). Each marking-scheme point keeps its official marks and gets keys: alternatives of word stems with how many are needed. Sample-paper points have no official scheme and are shown as unofficial. `notCovered` lists syllabus items no real question asks; `learnNN.js` has practice questions for those.
- `tools/bio/chapters/chNN.py` holds a chapter's diagrams (`MAKERS`, drawn with the helpers in `tools/bio/bio_art.py`) and how its questions use them: `base_of` (which diagram a question's picture is), `ANCHOR_WORDS` and `OVERRIDES`, which fixes per-question things: diagram panels and graphs, which parts are "tap the diagram" answers (`tap`), and parts that are really drawings (`kind: 'draw'`).
- Marking (`bio/bio.js`): the same stemming in Python and JS (`bioStem`, `sameStem`: shared prefix of 75% or one letter off, with `CONFUSE` pairs like artery/arteriole and pepsin/pepsinogen kept apart). A point counts when one of its alternatives has enough of its stems. Old-course schemes give 3 marks a point. The result shows each point ticked or not, with "I said this" self-ticks; scores save as you go in `bio-q-<id>`. Tests: `node tools/bio/tests/marking.mjs`.
- Questions, games and drills open in the answer-mode practice host: `ExamAnswerMode.practice(id, kind, onClose)` makes a bare answer-mode root (no sheet), `addGames(id, data)` registers Chain reaction and Level up content for Biology, and `kit` exposes the card, HUD, typing and recall helpers to `bio-games.js`.
- Diagrams: `python3 tools/bio/build_bio_diagrams.py [NN]` writes `bio/dNN.js`: Draw it SVGs (480 x 320, `ExamDrawDiagrams['bio-NN']`) and `BioArt[id]` with anchors (where each part is) for question diagrams and Build it. Chapter 29: urinary system, kidney section, nephron. `python3 tools/bio/build_bio_questions.py [NN]` rebuilds `bio/qNN.js`.
- Build it (`BioBuild` in `bio-games.js`): study the diagram, then build it from its parts (tap a part, then its spot; "Show me where" after misses), then label it (4 options per pin), then questions on what you built (tap a part or 4 options). Best in `bio-build-<id>`.
- Action games: each is `bio/actNN.js`, registered in `window.BioActions[NN]` and listed from `BioLearn[NN].action` (name, what); they reuse the `.nr-*` stage, canvas, overlay and hearts styles. Chapter 29 is Nephron run (canvas): catch what gets filtered in Bowman's capsule, take back glucose and amino acids at the proximal tubule, then set the collecting duct for the day with ADH; a quiz between rounds, 3 hearts. Best in `bio-act-29`. Planned: an immune chase for 32 (mark the pathogen, then chase infected cells as a killer T cell), an oxygen route for 28, enzymes and villi for 30, a red blood cell route for 31.
- Learn it (`BioMemory`): vanishing words for definitions, sort cards into groups (keys 1–9), and fill-the-table drills. Best in `bio-learn-<ch>-<k>`.
- Be the examiner (`bio/bio-examiner.js`, content in `BioLearn[NN].examiner`): a made-up student's answer to a real exam part, one line each. You tick or cross each line; the marker decides, reading the answer in order (a line earns when it makes a scheme point the lines before haven't, until the part has as many points as it asks for; a correct extra point is "no marks"). Each line then shows its verdict (+marks with the scheme point, Vague, Wrong, Repeat of line N). Fix it: rewrite up to three lines that got nothing; a rewrite passes if it earns a point the answer doesn't have, else after two tries the line's `fix` is shown. Best in `bio-exam-NN`. `node tools/bio/tests/marking.mjs` checks every examiner item: `ok` lines earn, the rest don't, each `fix` earns a new point.
- Be the examiner shows the part's marking scheme with the question: every point it accepts and "Any N of these M, X marks each" (or the marks per point when they differ). After Hand back, the points the answer earned turn green; in Fix it, a rewrite that earns a new point turns that point green too.
- Quick games (`bio/bio-quick.js`, `window.BioQuick.open(kind, ch)`, tiles on the Games tab after Be the examiner), content in `BioLearn[NN]`:
  - Match pairs (`match`: 12 `[word, what it means]`): three rounds of four, tap a word then its meaning; score is pairs matched first time; best in `bio-match-NN`, fastest perfect time in `bio-match-time-NN`.
  - Spot the mistake (`spot`: `{ s, fix, opts, why }`, the wrong words in `*stars*`, `opts` two wrong choices): 8 sentences a run; tap the wrong words (1 point), then pick the fix (1 point, keys 1-3). Best in `bio-spot-NN`.
  - Label sprint (`sprint`: diagram ids from `bio/dNN.js`): 12 different parts across the diagrams; the labels are hidden and a dot sits on each part's label point (`at`); tap the named part before the bar runs out (8 s, 0.45 s less per answer in a row, down to 3.5 s). A tap takes the nearest dot. Labels that describe a process (numbered steps, "diffuses", "Cut here") are left out. Best in `bio-sprint-NN`.
  - `node tools/bio/tests/quick.mjs` checks the content: 12 pairs with no meaning giving away its word, at least 8 well-formed mistakes, and 12 different tappable parts per chapter.
- Biology hub layout (`biology.html`, `bio/bio-shell.css`, built with the taste-skill app-screen rules, style `true-black-flat` with the site's own slate palette kept): a 232px sidebar (the examiner's head and "Leaving Cert", Progress, the five chapters with your % of marks) and a 64px top bar (breadcrumb, Geography / Biology switch) around the canvas. Surfaces step up in lightness with no borders; colour only on data (yellow = the predicted grade and its line). Under 1100px the sidebar folds into a menu sheet behind a button in a 56px top bar. Blocks rise in, numbers count up, bars grow and the line draws (all off with reduced motion, and not repeated when a card closes: `is-settled`).
- Progress (the hub's home, `bio/bio-progress.js`): predicted grade (H1-H8 with CAO points and a likely range), "Prediction over time" on a grade ladder, a Chapters table (your % of marks, questions tried, drills tried, grade) and the last 14 days. A target grade (`bio-target`) highlights its band and says the gap. The title row is just "Progress" and one button (the user cut the sentence under it): "Answer a question on <chapter>", an untried chapter else your weakest, which opens that chapter's next question on the desk. With no answers yet there's no Predicted grade card at all (the user cut its explanation and grade table) and the chart takes the whole row.
  - The model: marks got / marks answered per chapter, pulled towards your overall rate by 40 marks (the overall rate towards 50% by 30 marks); untried chapters count at your overall rate; chapters weighted by their number of real exam questions; the range is +/- 1.28 sd from the marks answered plus 12% of the untried weight. Grades are read from the whole percentage shown. `node tools/bio/tests/progress.mjs`.
  - Scores are now kept per chapter, `bio-q-<chapter>-<id>` (31 exam questions are split across chapters with different parts and used to overwrite each other); an old `bio-q-<id>` still counts where its total marks match. Each save also records `tried` (the marks of the parts checked).
  - `bio-log`: one entry per chapter, question and day, the day's best `{ d, n, id, got, tried }` (last 800), written by `bio.js` on every check, on the desk too. The trend replays it; its last point is set to the current prediction so the two always agree.
- The chapter page (`renderChapter`, `chapterRail` in bio.js): just the chapter's title (no line under it, no intro above the questions or diagrams: the user cut them), then the tabs and their list on the left (805px at 1440), and on the right (320px) "Your progress" (your % of the marks in the chapter and its grade, questions tried, drills tried, last answered, and "Answer the next question", which opens the first untried real question, else your lowest score) and "Not tried yet" (up to six drills with no saved best; they open from there). Under 1100px the progress card goes above the tabs and the list below them. Questions are tiles (about five across at 1440, three on a phone): the year (or "Sample" with "P1 Q1e"), the marks or your score, and any old-course tag. The user had the question's text removed from the list; it stays as screen-reader text only. Games and Learn it are one column of rows, each with its best ("Best 10/12", points for an action game, or "Not played yet"); every drill and its best key come from `drillItems(n)`.
- No subtext anywhere on the hub (the user's rule): no lines under titles or card headings, no descriptions on game and drill rows, no notes under charts or lists. Show names, figures and controls only.
- Biology paper pages are 2055 px wide (1.5x the desk's paper, so they stay sharp zoomed in), and each `BioPapers` entry has `content`: the box around everything printed on the page, without the page number. The desk puts a `[data-hf-fit]` box over content plus question, and `fitSceneToViewport` in hyper-focus.js fits that box to the screen between the desk's bars (66/70 px top, 70/16 px bottom) instead of the whole desk, never smaller than the whole-desk fit: the paper and its text get bigger with no font change (on a phone about 2.5x). Pages without a fit box (Geography) are unchanged. Rebuild: `python3 tools/bio/build_bio_papers.py <papers dir> <sample dir> --render`.
- The taste skill is installed at `.claude/skills/taste-skill/` (MIT, from github.com/Leonxlnx/taste-skill). Its inspector needs Chrome without the sandbox here: point `CHROME_PATH` at a wrapper that runs `/opt/pw-browsers/chromium --no-sandbox --ignore-certificate-errors --proxy-server="$HTTPS_PROXY" "$@"`, then `node .claude/skills/taste-skill/scripts/inspect.mjs --app biology.html --out <dir>`. Last run: 0 FAIL, 0 WARN.
- Chain reaction pictures for Biology: `CHAIN_ART` in `tools/bio/chapters/chNN.py` (400 x 300, the step/until/badge helpers of `tools/mini_games/build_game_art.py`), written into `bio/dNN.js` as `ExamGameArt.chains['bio-NN']`, keyed by chain title. Chapter 29 has all four.
- Exam graphs (`graphSvg` in `bio/bio.js`): `{title, x, y, xt, yt, series: [{name, pts}], marks, key}`, x and y 0-100, smooth curves, later series dashed; the old `{title, trend}` still works.

## Biology on the desk (Geography Questions.dc.html#bio/NN/QID)

- The desk page is shared: a Geography / Biology switch sits top right on the desk and on `biology.html`. A real Biology exam question opens on the desk: `biology.html` links to `Geography Questions.dc.html#bio/29/2016-Q12b`, and `bio/bio-desk.js` (loaded by the desk page) loads the chapter's files, puts the question's real SEC paper page on the desk in place of the Geography page (same desk, hands, pen, logo), and moves the 3C focus target onto the question's box (3B's is hidden). Practice questions have no paper and open as a card on `biology.html`.
- Paper pages: `python3 tools/bio/build_bio_papers.py <papers dir> <sample dir>` finds every question in the SEC PDFs (text layer: "12.", "Question 3", "Ceist 3", "(b)", "(iii)"; 2019 on there are two booklets) and renders its page at 1370 px wide to `assets/bio/papers/*.webp` (106 pages, about 10 MB), with `bio/papers.js` (`BioPapers['NN/QID'] = {img, page, box %, label}`). A first part's box starts at its question, so the stem and diagram are in it. Sample paper 2 is the Irish version (no English Higher Level copy was found). The PDFs are not in the repository.
- The guide: after a moment the narrated guide (hyper-focus.js) starts on the question, one slide per part (the user asked for it to go by the question, not the same three slides each time; built in `bio/guide.js`): the part's own question, then the chapter concept it needs (its diagram, three bullets) and a last line with its points and marks and what earns them; a part whose concept an earlier slide already taught, or that none fits, gets the three tips for its command word instead. Which concept each part needs was chosen by reading every part and its scheme: `BioGuide.chapters[N].parts` in `bio/guideNN.js` ({question id: [concept id or null per part]}); questions without it fall back to key-word matching. Narration reuses the voiced clips (concept and command lines, and the per-part line in the old overview's words); `node tools/bio/build_bio_narration.mjs` lists every line, and 109 per-part lines still need voicing.
- hyper-focus.js hooks for this (Geography unchanged): `ExamHyperFocus.use(steps)` adds another page's steps, a step's `voice` names its narration clips, `spotlight` uses the 3B/3C spotlight, the last step's `finish(rect, exit)` replaces answer mode, and `data-hf-still` items (pictures) fade in instead of typing.
- Narration: `node tools/bio/build_bio_narration.mjs` writes `tools/narration/bio_lines.json` (every guide line with what the narrator says); the voice updater makes the MP3s. Until then the guide types without sound.
- Sheet styles are in `bio/bio-sheet.css` (colours on `.am-root`), desk extras in `bio/bio-desk.css` (the desk page forces Verdana, so the sheet's fonts are put back there).
- Marker details added with the chapters: a fact the scheme lists twice with the same keys earns once per sentence that says it (`onePerSentence` in bio.js; Be the examiner gives a line one copy). "carbon dioxide" = co2, o2 = oxygen, h2o = water, "rib cage" = ribcage, in both bio.js and the builder (`PHRASES`, `SYNONYMS`). A chapter's `OVERRIDES['points'][part id][point index]` gives a point its own keys (marked `own`, skipped by the wording test) or `'self'`.
- Diagram details: Biology label pills are sized from measured Lexend letter widths (`bio_art.label`). `flow()` dashes (and chapter arrows marked `bio-flow`) are hidden on exam-question diagrams, which often ask the direction of flow. So are zone names drawn on the art (class `bio-zone`: the nephron's CORTEX / MEDULLA), which questions give as labels or ask (2008-Q13b: where is B?); the dashed boundary stays. Given tags on question diagrams stay inside the frame, and a tag sitting right on its spot ("Medulla") has no leader line. A question can show another chapter's diagram (2025-Q17a uses chapter 31's circulation).

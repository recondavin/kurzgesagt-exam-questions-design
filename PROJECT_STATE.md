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
- Marking decisions agreed with the user (from the SEC 2024 and 2026 schemes, kept in the scratchpad as ms2024.txt / ms2026.txt): an SRP is one specific, correct fact that answers the exact question (no three-part rule); vague, wrong, repeated or off-question lines earn nothing; each question uses its own scheme rules; a labelled diagram is 1 SRP plus up to 2 for new information on it. 3C (2024) is the same question as 2026 1B.
- The examiner is a grumpy, slightly ugly cartoon (`EXAMINER_FACE`: comb-over, ear hair, big nose with a hairy wart, mole, stubble, crooked teeth with a gold one) with moods set by `examMood` through `data-mood` on `.am-exam__face`: ok (asking, blinks), happy (earned marks: grin, blush, hop), angry (rejected: red face, anger mark, shake) and furious (out of tries: redder, steam). His lines (`EXAM_SAYS`) match the mood; the intro and end screens show a line in his handwriting ("Impress me.", "Hmph. Not bad.", "Disappointing...").
- Logo: the examiner in his angry mood. `tools/logo/build_logo.py` builds `assets/logo/examiner.svg` (browser tab icon) and `assets/logo/examiner-sticker.svg` (a white sticker) from `EXAMINER_FACE`; `assets/logo/apple-touch-icon.png` (180 x 180, phone home screen) is the sticker on the desk colour. The sticker sits on the desk in the scene (`.site-sticker`, top left, rotated, z-index 1 under the paper and overlays). Both pages link the icons.

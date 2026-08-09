# Project State

Updated: 2026-08-09

## Project location

- Root: `/Users/davin/Documents/study app/kurzgesagt-exam-questions-design`
- Primary page: `/Users/davin/Documents/study app/kurzgesagt-exam-questions-design/Geography Questions.dc.html`
- Focus controller: `/Users/davin/Documents/study app/kurzgesagt-exam-questions-design/hyper-focus.js`

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

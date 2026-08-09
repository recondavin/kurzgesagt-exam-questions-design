# Kurzgesagt Exam Questions — Agent Instructions

This file applies to everything inside `kurzgesagt-exam-questions-design/`.

## Start here

- Read `PROJECT_STATE.md` before editing.
- Preserve the user's existing work and inspect `git status --short` before changing files.
- The primary page is `Geography Questions.dc.html`.
- The current preview is the local file URL for that page. Reuse the existing preview tab; do not create another tab for every refresh.

## Source map

- `Geography Questions.dc.html`: scene, paper, question content, styling and component state.
- `hyper-focus.js`: guided focus/camera behaviour.
- `assets/cartoon-desk.svg`: approved cartoon desk texture.
- `assets/hands/left-resting-layered.svg`: approved animated left hand.
- `assets/hands/right-writing-gentle-rig.svg`: approved animated writing hand and pen.
- `assets/rower-focus-still.png`: rowing figure still.
- `assets/rower-layered-perfect-loop.mp4`: loop shown during image focus.

## Preservation rules

- Do not redesign the hands, pen, sleeves, desk texture, paper, rowing context, arrows, diagram or focus animation unless the user explicitly asks.
- When editing the lower question section, keep the existing context and rowing image in their current positions.
- Treat the user's latest supplied screenshot as the visual authority over earlier approximations.
- Do not replace approved project assets with newly generated substitutes.
- Do not reset, checkout or overwrite unrelated user changes.

## Current question-layout direction

- The hand-built HTML/CSS imitation of the exam questions was rejected.
- The real question block is now cropped from the reference screenshot and placed on the paper rather than reconstructed from scratch.
- Authority reference: `/Users/davin/Desktop/Screenshot 2026-07-26 at 01.09.34.png`.
- Applied crop: `assets/exam-question-reference.png`.
- Part (a) is updated inside a copy of the original exam PDF using that PDF's embedded Calibri Regular font at 12 pt and its native coordinates. The full `(a)`/`(b)`/`(c)` block is then rasterized as one image.
- Approved visible wording: `(a)` asks for the law calculating the boat's acceleration; `(b)` asks for one other law and its application to Cian's stroke; `(c)` asks why a coach uses Newton's laws when analysing movement.
- Never add a live HTML question sentence over part (a); doing so duplicates the raster text, makes it look bold and causes horizontal clipping.
- Transparent HTML textareas sit over the photographed answer boxes so answers remain typeable.

## Safe tool rules

- Never scan, print or summarize `~/.codex/sessions`, especially its JSONL contents.
- Never run broad searches across `/Users/davin/.codex`, `/Users/davin/Library`, or the home directory.
- Keep command output narrowly bounded; default to at most 4,000 output tokens.
- Never print base64 image data, embedded conversation images or full application logs.
- Search only the project paths needed for the current change.
- Do not use web/docs/browser tools unless the user explicitly needs them for the task.
- A `{"detail":"Bad Request"}` message is a Codex task transport failure, not a rejection of the user's request. Continue with small local operations where possible.

## Editing and QA

- Use `apply_patch` for text-file edits.
- Make the smallest coherent change and preserve unrelated geometry and behaviour.
- For visual work: compare the full page and a focused crop against the supplied reference.
- Verify asset paths, clipping, overflow and cache freshness.
- Run `git diff --check` and `node --check hyper-focus.js` after relevant edits.
- Do not claim an exact visual match without inspecting the rendered result.

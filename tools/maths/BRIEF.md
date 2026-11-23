# Leaving Cert Maths, Ordinary Level: how the exam questions were extracted (the brief each extraction agent followed)

Kept so a later chapter (15 Statistics II next) is done the same way. The papers came from simplestudy.com's past-papers page (see PROJECT_STATE.md); the paths below were the session's scratch folders.

You are extracting real SEC exam questions for a revision site, and writing a step-by-step explanation of how to do
each one. The student is an Ordinary Level Leaving Cert student. The site shows the real paper page, then walks through
each part with animated working, then lets the student type the answer to check it.

## Sources (already downloaded; do not fetch anything from the web)
- Papers: `/tmp/claude-0/-home-user-kurzgesagt-exam-questions-design/a22a37c4-8fad-50d4-b7ae-0316b30a57fd/scratchpad/maths/pdf/YYYY-pN-qp.pdf`
  (N = 1 or 2, YYYY = 2015..2025), English, Ordinary Level.
- Marking schemes: same folder, `YYYY-pN-ms.pdf`. NOTE: some scheme PDFs (2015) contain Higher Level too, and some
  contain both papers: make sure you read the ORDINARY LEVEL section of the right paper.
- Text layers (`pdftotext -layout`): `../txt/YYYY-pN-qp.txt` and `-ms.txt` next to the pdf folder. Maths symbols are often
  missing or garbled in the text, so ALWAYS look at the rendered page before transcribing. Render pages yourself, e.g.
  `pdftoppm -f 7 -l 7 -r 100 -png YYYY-p1-qp.pdf /your/own/folder/YYYY-p1-p07` and view the PNG with the Read tool
  (100 dpi is enough to read; crop with python PIL if you need to zoom on a formula). Keep your images in your own
  folder under the scratchpad (e.g. `.../scratchpad/maths/work-chNN/`), never in the repository.

## Your output
Write ONE JSON file: `/home/user/kurzgesagt-exam-questions-design/tools/maths/questions/chNN.json` (UTF-8, 2-space indent).
Do not touch any other file in the repository. Do not commit.

```json
{
  "chapter": 10,
  "title": "Calculus",
  "questions": [
    {
      "id": "2019-P1-Q7",            // year-Ppaper-Qnumber
      "year": 2019, "paper": 1, "q": 7,
      "section": "A" | "B",
      "total": 50,                   // total marks for the whole question, from the scheme (or printed on the paper)
      "pages": [19, 20],             // 1-based PDF page numbers the question is printed on (first page first)
      "topic": "short topic name, e.g. Maximum and minimum points",
      "stem": "Text printed before part (a), word for word, with maths in $...$",
      "fig": "If the question has a diagram/graph/table on the paper, one line saying what it shows, else null",
      "table": null,                 // or {"head": [...], "rows": [[...], ...]} if the paper gives a table of data
      "parts": [
        {
          "l": "(a)(i)",             // label exactly as printed: (a), (b)(ii), (c)(iii) ...
          "q": "The part's question, word for word, with maths in $...$",
          "marks": 10,               // this part's marks from the scheme (null if the scheme groups parts: then put the
                                     // group's marks on its first part and "markNote": "(a) and (b) together: 15 marks")
          "chapter": 10,             // the Active Maths chapter this PART belongs to (see the chapter list below)
          "answer": { ... },         // what the student types to be checked (see "Answers" below)
          "scheme": "What the marking scheme gives full marks for, short and close to its own words (the final answer and
                     any must-show working). Include accepted alternatives the scheme lists.",
          "idea": { "title": "What a derivative tells you", "text": "1–3 short sentences: HOW the concept works, in plain
                    words, for a student who has forgotten it", "vis": null } | null,   // only where a concept first
                    // matters in this question; null on later parts that use the same idea
          "steps": [                 // the worked solution: 2–8 steps, one small idea each, in the order you'd write it
            { "say": "One or two short sentences, spoken to the student: WHAT you do and WHY.",
              "math": ["LaTeX line", "next LaTeX line"],   // lines this step adds to the working (KaTeX), may be []
              "vis": null }                                  // optional visual (see "Visuals")
          ],
          "tip": "Optional one-line exam tip that genuinely helps on THIS part (e.g. 'Always write the units: cm³'), or null"
        }
      ]
    }
  ]
}
```

## Chapter list (Active Maths 3, the student's book) — decide which questions are yours
- 10 Calculus: first and second derivatives, slopes and tangent lines, increasing/decreasing functions, maxima and
  minima (turning points), max/min problems, rates of change. (Paper 1.)
- 11 Applied Measure: perimeter/area of triangles, quadrilaterals, circles (arcs, sectors), rectangular solids, prisms,
  cylinders, cones, spheres/hemispheres, finding a missing dimension, the trapezoidal rule. (Paper 2, sometimes Paper 1.)
- 12 Counting and Arrangements: listing outcomes, the fundamental principle of counting, arrangements. (Paper 2.)
- 13 Probability: probability, relative frequency/experimental probability, fairness, expected frequency, theoretical
  probability, set theory/Venn diagrams in probability, sample spaces, AND/OR multiple events, Bernoulli trials,
  expected value. (Paper 2.)
- 14 Statistics I: statistics in the world, statistical investigations, collecting data (types of data, sampling,
  questionnaires, bias), frequency tables, bar charts, pie charts, stem-and-leaf plots, histograms, distribution/shape
  of data, scatter graphs and correlation. (Paper 2.) NOT yours: mean/median/mode/range/standard deviation, the normal
  distribution, margin of error, hypothesis testing (that is chapter 15) — but if a question is mostly chapter 14 and
  has a chapter-15 part, include the WHOLE question and set that part's "chapter": 15.
- A whole exam question goes in your file if most of it is your chapter. Include ALL its parts (every part gets
  explained), each tagged with its own "chapter".

## Answers (for checking what the student types)
- `{"type": "number", "value": 12.57, "tol": 0.01, "unit": "cm³"}` — tol is the absolute tolerance (use the rounding the
  question asks for: "correct to two decimal places" → tol 0.005; whole number → 0.5; exact → 1e-9).
  Fractions: `"value": 0.375, "show": "3/8"` (show = how to display the right answer).
- `{"type": "numbers", "values": [1, 3], "tol": 0.001, "show": "x = 1 or x = 3"}` — several numbers, any order.
- `{"type": "point", "value": [2, -5], "show": "(2, −5)"}`
- `{"type": "expr", "value": "3*x^2-12*x+9", "show": "f′(x) = 3x² − 12x + 9", "var": "x"}` — an expression in one
  variable, checked by evaluating at several values. Use * for multiplication and ^ for powers; sqrt(), exp(), ln().
- `{"type": "equation", "value": "y=4*x-7", "show": "y = 4x − 7"}` — a line; checked as equivalent equations.
- `{"type": "choice", "options": ["Positive correlation", "Negative correlation", "No correlation"], "value": 0}`
  — when the answer is one of a few words (increasing/decreasing, strong/weak, discrete/continuous, Yes/No...).
- `{"type": "none", "show": "the model answer in one line"}` — explain/justify/draw/plot parts that can't be typed:
  the student compares with the model answer.
Every numeric answer MUST equal the marking scheme's answer. Verify every number with Python (sympy is installed:
differentiate, solve, evaluate volumes, probabilities with fractions.Fraction, etc.). Put your checks in
`.../scratchpad/maths/work-chNN/check.py` and make it print OK for every part; run it before you finish.

## Steps: how to explain (this is the most important part)
- The student must come away knowing HOW to do this kind of question and WHY each step works. Write for an Ordinary
  Level student who is scared of maths: short sentences, plain words, no jargon without saying what it means.
- Follow the method the marking scheme uses. Show the same working the scheme expects (an examiner must be happy).
- One idea per step. Say what you do, then do it in `math`. E.g. `say`: "Differentiate: bring each power down in front
  and take one off the power. A number on its own disappears." `math`: ["f(x) = x^3 - 6x^2 + 9x + 2",
  "f'(x) = 3x^2 - 12x + 9"].
- Use these KaTeX macros (the site defines them):
  - `\hl{...}` highlights the bit that just changed or matters (use it on 1–2 things per line, not everything).
  - `\mv{key}{...}` tags a piece so that, when the NEXT math line contains the same key, the piece slides from its old
    place to its new one (a morph). E.g. "x^{\mv{p}{3}}" then "\mv{p}{3}x^{2}" makes the 3 fly down in front. Use it
    for the moments that teach: a power coming down, a number being substituted in, a term moving across the "=".
    Keys only need to be unique within one step-to-step pair. Don't overuse it.
  - Use `\times`, `\frac{}{}`, `\sqrt{}`, `\pi`, `\text{cm}^3`, `\approx`. No `\begin{align}` (one equation per line).
- The last step ends on the final answer, written as the exam wants it (rounded as asked, with units), and its `say`
  says it plainly ("So the volume is 452.39 cm³.").
- If the scheme accepts several methods, use the simplest one for an Ordinary Level student.
- Never invent. If you cannot read something, look again at a higher resolution. If a part depends on something only
  on the paper (e.g. "use the graph"), describe what to read off it in the steps.

## Visuals (optional `vis` on a step or idea; the site draws and animates them)
Use them where a picture makes the method click. Coordinates are real values (not pixels).
- Graph: `{"t":"graph","x":[-1,5],"y":[-3,10],"fns":[{"f":"x^3-6*x^2+9*x+2","c":"main"}],
  "pts":[{"x":1,"y":6,"label":"(1, 6)"}],"tangent":{"f":"x^3-6*x^2+9*x+2","x":1},"lines":[{"m":4,"c":-7}],
  "hl":"max"|"min"|null,"shade":null}` — fns use * and ^; draws axes, the curve(s), points, a tangent at x, lines y=mx+c.
- Number line / sign of f′: `{"t":"signs","x":[-1,5],"roots":[1,3],"signs":["+","-","+"],"label":"f′(x)"}`.
- Shape (measure): `{"t":"shape","kind":"cylinder"|"cone"|"sphere"|"hemisphere"|"cuboid"|"tri-prism"|"circle"|
  "sector"|"rectangle"|"triangle"|"trapezium"|"parallelogram"|"composite","dims":{"r":5,"h":12},
  "labels":{"r":"5 cm","h":"12 cm"},"hl":"r"}` (for composite give "parts":[{shape objects}]).
  Trapezoidal rule: `{"t":"trap","h":2,"ys":[0,3.2,4.5,5,4.1,0],"labels":true}`.
- Table: `{"t":"table","head":["x","0","1"],"rows":[["P(x)","0.2","0.8"]],"hl":[[0,1]]}` (hl = [row, col] cells).
- Sample space grid: `{"t":"grid","rowsLabel":"Die 1","colsLabel":"Die 2","rows":["1","2","3"],"cols":["1","2"],
  "cells":null,"hl":[[0,1],[2,0]]}` (cells defaults to "r,c" pairs; or give a 2D array).
- Tree diagram: `{"t":"tree","levels":[[{"label":"R","p":"3/5"},{"label":"B","p":"2/5"}],[...per branch...]],
  "hl":[["R","B"]]}` — levels[1] is a list with one list of children per level-0 branch.
- Venn: `{"t":"venn","sets":["A","B"],"only":[12,8],"both":5,"none":3,"hl":"both"}`.
- Bar/histogram: `{"t":"bars","kind":"bar"|"hist","labels":["0–10","10–20"],"vals":[4,7],"ylab":"Frequency"}`.
- Pie: `{"t":"pie","labels":["Car","Bus"],"vals":[12,8],"show":"angles"}`.
- Stem and leaf: `{"t":"stem","rows":[["2","1 4 7"],["3","0 2 2 9"]],"key":"2 | 1 = 21"}` (back-to-back: add "left").
- Scatter: `{"t":"scatter","x":[0,10],"y":[0,50],"pts":[[1,5],[2,9]],"line":{"m":4.5,"c":1},"xlab":"","ylab":""}`.
If none fits, leave vis null. Never invent data for a visual: use the question's numbers.

## Quality bar
- Every question in 2015–2025 (Ordinary Level, both papers) that belongs to your chapter(s). Check every paper; list
  in your final report which papers you checked and which questions you took (and anything you skipped and why).
- Transcribe the question text word for word (including "Give your answer correct to ..."), maths in LaTeX.
- Marks per part from the scheme. Answers equal to the scheme. check.py passes.
- JSON must parse (`python3 -m json.tool`). Keep LaTeX backslashes escaped in JSON (`"\\frac{1}{2}"`).
- Final report (under 300 words): questions taken per year, skipped items, anything uncertain.

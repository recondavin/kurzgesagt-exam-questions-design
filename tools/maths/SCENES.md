# Maths scenes: the animated pictures on each step, and how to give a question its scenes

The maths desk walks a student through a real exam question part by part. Each step has one or two sentences (`say`),
lines of working (`math`, KaTeX) and a picture (`vis`). The pictures are animated scenes drawn by
`maths/maths-scenes.js`. They should show **what the question is about and what the step is doing**: the jar of balls
being picked from, the dice grid with the totals that count lit up, the spinner landing, the water rising in the tank,
the counting boxes filling, the ball flying along its curve, the dot sliding along the graph with its tangent until the
slope is 0. A student who ignores the words should still see what is going on.

See every kind working: `tools/maths/gallery.html` (on a local server: `python3 -m http.server 8765` in the
repository, then http://localhost:8765/tools/maths/gallery.html; add `?still=1` to see the end states).

## How a part's scenes work

- A part's steps share one scene that **builds up**. Each step gives the whole picture for that moment, repeating
  what was already there and adding or changing one thing (a point, a highlight, a reading, a water level, a picked
  ball). Pieces that were in the last step's picture are drawn still; only what's new animates. So repeating the
  same spec with one change gives exactly the animation you want for that step.
- `"vis": null` on a step keeps the last picture on screen with no change. Use it when the step is pure algebra and
  the picture has nothing new to show. Do not use it on the first step unless the idea has a picture (the idea's
  picture then stays).
- The **idea** box (`part.idea`, when a part has one) explains HOW a concept works. Its picture should show the idea
  itself with the small example from the idea's own text (e.g. "4 starters and 6 mains give 24 pairs" → a grid of 4 × 6
  pairs, or slots 4 × 6 = 24). Never leave an idea without a picture.
- Every part should have at least one picture, and most steps should show something new. A step that finds a value
  the picture can show (a turning point, a reading, a probability, a volume's water level) should show it.
- The picture must be **true to the question**: its real function, data, dimensions, labels, colours and numbers.
  Work every number out (python) before you put it in. Never invent data the question doesn't give; if you need an
  example (in an idea), keep it tiny and generic.
- Keep pictures uncluttered: at most 2–3 labelled points on a graph, short labels.
- Text inside pictures is plain Unicode, not LaTeX: `x²`, `√2`, `π`, `−3` (a real minus), `×`, `÷`, `≈`, `½`, `°`,
  `cm³`. Only `cap` (a caption under any picture) may contain `$...$` maths.
- Labels: about 12 characters on a graph or solid, about 22 in a legend or a `say` line.

## The kinds

Every picture is an object with `t` (the kind) and the fields below. Any picture can also have `cap`: a short caption
under it (one line, may use `$...$`).

### Calculus

**graph**: axes, curves and everything you do on a graph.
```json
{"t": "graph", "x": [-1, 5], "y": [-4, 6], "xlab": "x", "ylab": "f(x)",
 "fns": [{"f": "x^2-4x+1", "label": "f(x)"}],
 "pts": [{"x": 2, "y": -3, "label": "(2, −3)", "hl": true}]}
```
- `x`, `y`: [low, high] of the axes. Choose them so everything that matters is in view with a little margin.
- `fns`: up to 3 curves `{f, label?, c?: "faint", from?, to?}`. `f` is in **x only** (write `-4.9x^2+11x+1.2`, not t).
  It understands `^`, implicit multiplying (`3x^2`, `2(x+1)`), `sqrt`, `pi`, `e^x`, `ln`. `from`/`to` limit the curve
  (e.g. a domain 0 ≤ t ≤ 2.4).
- `lines`: straight lines `{m, c, label?}` (y = mx + c), e.g. a tangent's equation once found.
- `pts`: points `{x, y, label?, hl?}` (hl = yellow).
- `plot`: `[[x, y], ...]` table points that pop on one at a time (for "draw the graph"; list `plot` and then the curve
  in `fns`: the points come first and the curve joins them).
- `tangent`: `{f, x, label?}` the tangent at x, with its point and "slope = m" (or your label).
- `ride`: `{f?, from, to, label?: false}` a dot slides along the curve from `from` to `to` with its tangent attached,
  the slope reading out live; at a turning point it reads "slope = 0 (turning point)". Defaults to the first curve.
  Use it for what a derivative is, finding a turning point, and the slope at a point (ride to that x).
- `shade`: `[{from, to, sign: "+" | "-"}]` colours the first curve green where it is increasing and red where it is
  decreasing, with labels (for questions about increasing or decreasing).
- `roots`: `[x, ...]` rings pulse where the curve meets the x-axis.
- `reads`: `[{x, y, from?: "x" | "y", label?}]` reading off the graph: a dashed line from the x-axis up to the curve and
  across to the y-axis (`from: "x"`: you know x, read y), or from the y-axis across and down (`from: "y"`). The value
  read shows on the axis. Use for every "use your graph to estimate".
- `obj`: `{f?, from, to, c?, label?}` something moving along the curve over time (a ball, a sliotar, a diver), with a
  dotted trail: for context questions about height against time.

**signs**: where f′(x) is positive (going up) or negative (going down).
```json
{"t": "signs", "x": [0, 9], "roots": [6], "signs": ["+", "-"], "label": "C′(t)"}
```

### Applied measure

**shape**: one solid or flat shape, each dimension labelled; `hl` makes the one in use glow (a key or a list).
```json
{"t": "shape", "kind": "cylinder", "dims": {"r": 5, "h": 8}, "labels": {"r": "5 cm", "h": "8 cm"}, "hl": "h"}
```
- `kind`: `cylinder`, `cone` (add `"inverted": true` for point-down, like a funnel or a cone being filled), `sphere`,
  `hemisphere`, `cuboid`, `tri-prism`, `circle`, `semicircle`, `sector`, `rectangle`, `square`, `triangle`,
  `right-triangle`, `trapezium`, `parallelogram`, `composite`.
- `labels` keys by kind: cylinder `r d h`; cone `r h l`; sphere/hemisphere `r d`; cuboid `l w h`; tri-prism `b h l s`;
  circle/semicircle/sector `r d` (sector also `angle`, `arc`, with `dims.angle` in degrees); rectangle/square `b h`;
  triangle/trapezium/parallelogram `b h` (trapezium also `a`, the top); right-triangle `b h c`.
- `dims`: real sizes, used for the cylinder's proportions (`r`, `h`) and to scale balls inside it.
- `fill`: `{from, to, label?, rise?}` water rising (or falling, when `to` < `from`) inside a cylinder, cone, sphere,
  hemisphere or cuboid. `from`/`to` are fractions of the height (0 = empty, 1 = full), so work them out from the real
  depths. `label` names the water (e.g. "water", "18 cm"); `rise` draws a bracket between the two levels with that label
  (e.g. "rise = 1.2 cm").
- `inside`: `{n, r?, c?, label?, out?}` balls in a cylinder: `n` balls drop in one by one (tennis balls in a tube); `r`
  is the ball's real radius (scaled against `dims.r`); `label` is written on the ball; `out: true` lifts the top ball out
  (a sphere removed from a tank). With `fill` as well, the ball drops first and then the water moves.
- `composite`: `{"kind": "composite", "parts": [{kind, dims, labels, hl}, ...]}` solids or flat shapes stacked on one
  upright axis, top to bottom (a hemisphere on a cylinder, a cone on a hemisphere, a triangle on a rectangle). Each part's
  `hl` is one key.

**net**: a solid's surface laid flat.
```json
{"t": "net", "kind": "cylinder", "dims": {"r": 3, "h": 10}, "labels": {"w": "2πr = 6π cm", "h": "10 cm", "r": "3 cm"}, "hl": "w"}
{"t": "net", "kind": "cone", "dims": {"r": 4, "l": 10}, "labels": {"l": "l = 10 cm", "arc": "2πr = 8π cm", "angle": "144°"}, "hl": "arc"}
```
The cylinder's curved side unrolls into a rectangle (`w` its width, `h` its height) with the two circles (`r`); the
cone opens into a sector (`l` radius, `arc`, `angle`) with its base circle (`r`).

**trap**: the trapezoidal rule.
```json
{"t": "trap", "h": 3, "ys": [4, 5.8, 7, 6.5, 6, 4.8, 6, 6.5, 8], "hl": "ends"}
```
`hl`: `"ends"` (first + last, once each) or `"middle"` (the rest, twice). `names` replaces y₁, y₂... under the heights;
`labels: false` hides the values.

### Counting

**slots**: the fundamental principle of counting: one box per choice, its number of options inside, × between.
```json
{"t": "slots", "pool": ["R", "A", "I", "N", "B", "O", "W"],
 "boxes": [{"n": 7, "fill": "R", "label": "1st"}, {"n": 6, "fill": "A", "label": "2nd"}, {"n": 5, "fill": "I", "label": "3rd"}],
 "result": "7 × 6 × 5 = 210"}
```
- `boxes`: 1–10 `{n, label?, note?, fill?, hl?}`. `n` is the number of options (a number or short text like "1").
- `pool`: the things being chosen from, as tiles. With `fill` on a box, that tile flies from the pool into the box and
  stays used, so the pool visibly shrinks (choices without repeats). Leave out `pool` when repeats are allowed.
- `order`: `[2, 0, 1]` fills the boxes in that order (do the restricted box first: "must start with a vowel").
- `hl`: box indices to glow (the restricted ones). `op`: "×" (default) or "+". `result`: the answer line.

**list**: outcomes or arrangements written out, the ones that count lit up and counted.
```json
{"t": "list", "head": ["1st", "2nd"], "rows": [["H", "H"], ["H", "T"], ["T", "H"], ["T", "T"]], "hl": [1, 2], "count": true, "colors": {"H": "blue", "T": "pink"}}
```
Up to 40 rows of short tokens. `hl`: row indices that count. `count`: true shows "2 of 4" (or your own text).
`colors`: token → colour for its tiles.

### Probability

**bag**: a jar of balls (or counters, sweets, discs). They drop in; `hl` lights up the ones that count and the fraction
shows; `pick` lifts one out; `out` shows balls already taken (without replacement).
```json
{"t": "bag", "groups": [{"label": "red", "n": 3}, {"label": "blue", "n": 5}], "hl": "red", "pick": "red", "say": "P(red)"}
```
- `groups`: `{label, n, c?}`; colour comes from `c` or from a colour-name label (red, blue, green, yellow, purple,
  pink, orange, white, black, grey, brown). 1–60 balls in all.
- `hl`: label(s) that count. The fraction is worked out (count / total); `frac` and `of` override the top and bottom
  (e.g. after one is taken out), `frac: false` hides it, `say` is a word beside it ("P(red)").
- `pick`: a label: one of those balls is lifted out of the jar. `pickLabel` renames "picked".
- `out`: `[{label, c?, n}]` balls already taken out, shown beside the jar. For "without replacement" show the second
  draw with the jar's groups reduced and the first ball in `out`.
- `unit`: replaces "in the bag" (e.g. "people").

**dice**: two dice (or any two lists): the grid of outcomes fills in, the ones that count light up and are counted.
```json
{"t": "dice", "op": "+", "hl": [7, 11], "rowsLabel": "Die 2", "colsLabel": "Die 1"}
```
`rows`/`cols` default to 1–6 (drawn as dice faces); give other lists for other experiments (a coin
`["H", "T"]`, a spinner's numbers). `op`: "+", "×", "-" (difference), "max", or "pair" (shows "3,H"). `cells`: your own
grid (rows × cols). `hl`: the values that count; `hlCells`: `[[row, col], ...]` instead. `frac`, `of` and `say` as in bag.
With no `hl` it shows the count of outcomes ("6 × 6 = 36").

**spinner**: it spins and stops on a sector; the sectors that count light up and the fraction shows.
```json
{"t": "spinner", "sectors": [{"label": "Red"}, {"label": "Blue"}, {"label": "Red", "w": 2}], "land": 2, "hl": ["Red"]}
```
`sectors`: `{label, c?, w?, t?}` (w = relative size, default 1; `t` = short text written on the sector, e.g. a number;
labels of 3 characters or fewer are written on it anyway). `land`: index of the sector it stops on (leave it out for
no spin). `hl`: labels or indices that count. `frac`, `of`, `say` as in bag.

**pscale**: the probability scale from 0 to 1 with markers sliding to their places.
```json
{"t": "pscale", "marks": [{"v": 0.25, "label": "P(red)"}, {"v": 0.8, "label": "P(not 6)", "show": "4/5", "hl": true}]}
```

**tree**: a tree diagram, any number of stages. Branches draw stage by stage; each path in `hl` lights up branch by
branch (multiply along it) and its result at the end pops.
```json
{"t": "tree", "root": [
   {"label": "W", "p": "0.6", "kids": [{"label": "W", "p": "0.6", "out": "WW 0.36"}, {"label": "L", "p": "0.4", "out": "WL 0.24"}]},
   {"label": "L", "p": "0.4", "kids": [{"label": "W", "p": "0.6", "out": "LW 0.24"}, {"label": "L", "p": "0.4", "out": "LL 0.16"}]}],
 "hl": [["W", "L"], ["L", "W"]]}
```
`p` and `out` are text. `hl`: paths of labels from the first branch. (The older `levels` form still works.)

**venn**: 2 or 3 sets; the regions that count fill with colour, every region's number pops in.
```json
{"t": "venn", "sets": ["Cats", "Dogs"], "u": "U", "n": {"a": 37, "ab": 64, "b": 48, "none": 19}, "hl": "none"}
```
Regions: `a` (only A), `b`, `c`, `ab` (A and B, not C), `ac`, `bc`, `abc`, `none`. Numbers may be text ("x", "?",
"20 − x"). `hl`: region keys, or `"A"`/`"B"`/`"C"` for a whole set, or `"AorB"`. `total`: text shown top right.

### Statistics

**dots**: a list of values as chips: they appear, sort themselves into order, then show the median, mean, range, mode
or quartiles (worked out for you, with the sum written underneath).
```json
{"t": "dots", "vals": [23, 19, 31, 27, 19, 35, 22], "show": "median", "unit": "years"}
```
2–30 numbers. `show`: `median` (pairs cross off from both ends), `mean`, `range`, `mode`, `quartiles`. `sort: false`
keeps the given order. `say` replaces the line underneath.

**bars**: a bar chart or histogram.
```json
{"t": "bars", "vals": [4, 8, 3, 9, 6], "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"], "level": true, "ylab": "cars"}
```
`kind: "hist"` (bars touching), `hl`: bar indices, `level: true` (the bars even out to the mean: what a mean is),
`line: {v, label}` (a reference line), `values: false` hides the numbers, `xlab`/`ylab`.

**pie**: slices sweep round; `hl` slices pull out. Slices named after colours get that colour.
```json
{"t": "pie", "labels": ["Car", "Bus", "Walk"], "vals": [45, 30, 25], "show": "angles", "hl": [0]}
```
`show`: `angles` (degrees), `pct`, or the values.

**stem**: a stem-and-leaf plot; leaves drop in; `hl` leaves light up; `count` writes a line under it.
```json
{"t": "stem", "rows": [["1", "8 8 9"], ["2", "0 1 1 2"]], "key": "1 | 8 = 18 years", "hl": [[1, 0], [1, 1]], "count": "2 are in their twenties"}
```
Back to back: `"left": true` and each row `[stem, right leaves, left leaves]`; `hl` for a left leaf is `[row, i, "L"]`.

**scatter**: points pop on, a line of best fit swings into place, a label for the correlation.
```json
{"t": "scatter", "x": [0, 14], "y": [0, 14], "pts": [[2.5, 2.5], [5, 4.5]], "line": {"m": 0.95, "c": 0.1}, "label": "strong positive", "xlab": "height", "ylab": "arm span"}
```

**normal**: the normal curve and the empirical rule: the region opens out from its middle and the % counts up.
```json
{"t": "normal", "mean": 165, "sd": 8, "shade": [149, 181], "label": "95%", "unit": "cm"}
```
`shade`: [low, high] in the data's units (`null` for an open end: `[181, null]` is the top tail). The axis marks μ ± 1,
2, 3 σ with their values.

**ci**: a margin of error (1/√n) and a hypothesis test.
```json
{"t": "ci", "p": 0.54, "n": 1000, "claim": 0.5, "pLabel": "sample", "claimLabel": "claim"}
```
The interval opens out around the sample's result, the claim drops in, and the verdict (inside: no evidence to reject;
outside: reject) is written underneath (`verdict` replaces it). `pct: false` shows decimals instead of %.

**table** and **grid**: when the data really is a table (a frequency table, values of f(x) to fill in).
```json
{"t": "table", "head": ["x", "0", "1", "2"], "rows": [["f(x)", "7", "5", "3"]], "hl": [[0, 2]]}
{"t": "grid", "rowsLabel": "Coin", "colsLabel": "Die", "rows": ["H", "T"], "cols": ["1", "2", "3"], "hl": [[0, 2]]}
```
Table cells may use `$...$`. Prefer a scene that shows the situation (dice, bag, slots, dots, bars) over a table when
there is one; use tables for tables of values being filled in, and frequency tables.

## Choosing scenes (examples)

- "Find the turning point / maximum / minimum": graph of the function; a step that sets f′(x) = 0 rides the dot to the
  turning point; the step that finds y adds the point with its label.
- "Find the slope of the tangent at x = 2 / the equation of the tangent": `ride` to x = 2 (or `tangent`), then `lines`
  with the tangent's equation.
- "Draw the graph for 0 ≤ x ≤ 6" from a table: the table step fills a `table`, the drawing step `plot`s the points and
  joins them with the curve. "Use your graph to estimate": `reads`.
- A ball's or diver's height: `obj` flying along the curve; the maximum height: `ride` to the top; when it lands:
  `roots`.
- Rates of change / increasing or decreasing: `signs`, or `shade` on the graph.
- Volume and surface area: the `shape` with the dimension in use glowing per step (radius, then height); water
  questions with `fill` and `rise`; balls in a tube with `inside`; a curved surface or a cone's net with `net`.
- Counting: `slots` (with `pool` when things get used up), `list` for small listings, `grid` for pairs.
- Probability: `bag` for counters/balls/people picked at random, `dice` for two dice or two-way outcomes, `spinner`
  for spinners, `tree` for stages, `venn` for overlapping groups, `pscale` to place a probability, `list` for sample
  spaces.
- Data: `dots` (mean, median, mode, range on a list), `stem`, `bars` (and `level` to show a mean), `pie`, `scatter`,
  `normal` (empirical rule), `ci` (margin of error and hypothesis tests).
- A question in another chapter's topic inside this chapter (e.g. a hypothesis test in a measure question) gets the
  scene for its own topic.

## Writing a patch

Never edit `tools/maths/questions/ch<N>.json` yourself. Write a patch (pictures only) and check it with
`tools/maths/apply_scenes.py`:

```json
{"chapter": 12, "questions": {"2015-P2-Q1": {"parts": [
  {"idea": {"t": "grid", "rowsLabel": "Starter", "colsLabel": "Main", "rows": ["S1","S2","S3","S4"], "cols": ["M1","M2","M3","M4","M5","M6"], "cap": "4 rows × 6 columns = 24 pairs"},
   "steps": [{"t": "slots", "boxes": [...]}, {"t": "slots", "boxes": [...], "result": "10⁶"}, null]},
  null,
  {"steps": [...]}
]}}}
```
- `parts` lines up with the question's parts in order; `null` (or leaving the rest off) keeps a part as it is.
- `idea` only on a part that has an idea. `steps` must have exactly one entry per step.
- Then: `python3 tools/maths/apply_scenes.py tools/maths/work/<name>.json`. It reports problems, runs the checker,
  and writes a preview. Look at every question you did:
  `node tools/maths/tests/preview-shot.cjs <chapter> <question id> <out.png> - work/<name>.q.js` and view the PNG
  (each picture's end state, under its step's words and working). Fix anything that is wrong, overlapping, cut off,
  unreadable or not true to the question.

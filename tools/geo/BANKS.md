# Writing a Geography SRP bank

The Geography section (geography.html) teaches Leaving Certificate Higher Level Geography essays the way the English
section teaches English essays: the student gets a clue, writes a sentence, and the marker corrects it as they type.
Every point a student can earn is an SRP (significant relevant point, 2 marks). This file is the brief for writing a
topic's bank. Read all of it, then read `geo/data/volcanoes.js` (the reference topic, whole file) and
`geo/geo-mark.js` (the marker).

## What a bank is

`geo/data/<topic>.js` pushes one topic onto `window.GEO.topics`:

```js
(window.GEO = window.GEO || { topics: [] }).topics.push({
  id: 'plates', name: 'Plate tectonics', unit: 'physical', colour: '#5B8DEF',
  blurb: 'One sentence on what the topic covers.',
  srps: [ ...SRPs... ],
  essays: [ ...essays... ]
});
```

### An SRP

```js
{ id: 'plates.convection', a: 'Convection currents move plates',
  t: 'Convection currents in the mantle, caused by heat from the core, drag the plates along at a few centimetres a year.',
  n: ['stationary', 'do not move'],                      // optional: cancelling stems (a sentence with any of them earns nothing)
  k: [['convection'], ['mantle', 'heat', 'core', 'drag', 'move', 'centimet']],
  c: ['What moves the plates, and where does the energy come from?', 'convection currents · mantle · heat from the core · drag'],
  v: 'The plates move because of currents.',
  w: 'Convection currents in the ocean push the plates along.',
  why: 'The currents are in the mantle, not the ocean: heat from the core makes the rock circulate.' }
```

- `id` starts with the topic id and a dot.
- `a`: the point's name, 2-6 words. It is what the student sees in their bank.
- `t`: the model SRP. One sentence, 12-30 words, one fact (or one cause and its effect), written the way a strong
  student writes it. It must be TRUE and exam-accurate for the Irish syllabus. Named examples must be real and the
  ones the textbooks use (Planet Earth, Today's World, Essentials, Geography in Action). Numbers: only ones you are
  sure of, and round them. Never invent a statistic.
- `k`: the marker's key. A list of word groups; a sentence earns the SRP when it hits EVERY group. A stem matches any
  word that starts with it ("erod" matches erode/eroded/eroding but NOT erosion: list both), with small typos
  allowed for stems of 6+ letters. A stem of 3 letters or fewer, or one starting with "=", must be a whole word. A stem
  with a space is a phrase. All lower case, no leading or trailing spaces. Usually 2-3 groups: the point's own term,
  then the fact that makes it a point rather than a mention. A one-group key is only right for a named example or a
  term that is a point on its own.
- `n` (optional): cancelling stems for the common wrong version (e.g. "heavier" for magma rising).
- `c`: two clues. `c[0]` asks for the point without giving it away. `c[1]` is the key words, joined with " · ".
- `v`: a vague version a weak student writes. It must NOT earn the SRP (it mentions the topic but not the fact).
- `w`: a plausible wrong version (a real misconception). It must NOT earn the SRP; add `n` stems if needed.
- `why`: one sentence saying what is wrong with `w`.
- `x: 1`: the SRP is a named example or location (schemes usually credit one named example as one SRP).

Write SRPs that work across many essays: the same point (e.g. "subduction melts the plate") belongs in every essay
that can use it. Put shared points once and list their ids in each essay's parts.

### An essay

One essay object per essay id the past papers use (they are listed in your brief). Model it on the most recent
scheme for that kind of question (2019-2025 schemes; older ones gave "overall coherence" marks the site does not mark).

```js
{ id: 'plates-destructive', name: 'Short name for the essay type',
  ask: 'The question as the papers ask it (the most recent wording).',
  head: [ { label: 'Boundary named', marks: 2, k: [['destructive', 'convergent']], say: 'A sentence that earns this mark.' } ],
  need: 13,                       // SRPs to full marks: 30 = named marks + 2 x need
  parts: [ { id: 'disc', name: 'Discussion', srps: ['plates.subduction', ...] } ],
  notes: ['The scheme in plain words: what is named, how the SRPs split, the caps.'] }
```

- `head`: the "named/identified" marks (2 each). Forms: `k` (words that earn it) + `say`; `any: [{n, k}]` with a
  shared `grp` when the student can name any one of several things and two heads must name different ones (see
  `volc-positive`); `pick: '<part id>'` when the name comes from the option the student picks (see `volc-landforms`;
  the option's `say` then earns it).
- `parts`: how the SRPs split. A part's `max` caps the SRPs it can earn (a "7/6" split: max 7 each; "8/7": max 8 each;
  "max 7 if only one side": max 7). A part with `opts` lets the student choose (a landform, a process, an
  interaction); each option has `id`, `name`, `k` (words that show the student is writing about it), `say` (a
  sentence that names it) and its own `srps`. Option ids the past papers name must exist (your brief lists them).
- Every essay, for every option, must have at least need + 3 SRPs to choose from (aim for 18-25 in a one-part essay).
- `notes`: 2-4 short sentences: the scheme's rules (naming marks, splits, example and diagram credit, caps).

## The pass condition

```bash
node tools/geo/check.mjs <topic>
```

It must print `all checks passed`. It fails when an SRP's own `t` does not earn it, when its `v` or `w` does, when an
essay's model answer (its heads' `say` sentences, then its SRPs' `t` sentences in order) does not reach full marks for
every option, or when a past question maps to an essay or option you have not written. Warnings saying an SRP's model
sentence "is credited to" another SRP mean two keys overlap: tighten the keys so each sentence earns its own point
(they matter: the student is told which point they earned). Keep the command's output short (`| tail -40`).

Other people are writing other topic files at the same time. Run the checker with your topic id only and ignore
anything about other topics. Edit only your own topic file(s). Do not edit the marker, the checker, `volcanoes.js` or
`papers.js`; if the marker seems wrong, say so in your report. Do not use git.

## Past questions

`tools/geo/research/questions.json` has every past question: `year`, `id` (e.g. "3C"), `title`, `text`, `rules`
(the scheme), `scheme_full`, and `ask` (the essay id, and option id when the question fixes one). Read the ones whose
`ask` essays are yours, e.g.

```bash
node -e "const q=require('./tools/geo/research/questions.json');q.filter(x=>x.ask.some(a=>a.essay.startsWith('plates-'))).forEach(x=>console.log(x.year,x.id,JSON.stringify(x.ask),'\n ',x.text,'\n  RULES:',x.rules))"
```

## Option ids (fixed: the diagrams, photos and videos are matched to them)

Use exactly these ids for these options (add others only for options not listed):

- landforms, erosion: `vvalley`, `waterfall`, `gorge`, `cliff` (with wave-cut platform), `stack` (sea cave, arch, stack and stump), `corrie`, `uvalley`, `arete`, `pyramidal`; deposition: `floodplain`, `levee`, `delta`, `oxbow`, `beach`, `spit`, `tombolo`, `dunes`, `drumlin`, `esker`, `moraine`, `outwash`
- mass movement: `creep`, `solifluction`, `landslide`, `rockfall`, `slump`, `mudflow`, `bogburst`; factors are heads/SRPs, not options
- weathering: `freezethaw`, `exfoliation`, `salt`, `carbonation`, `oxidation`, `hydrolysis`, `hydration`; and for "physical or chemical" `physical`, `chemical`
- karst: `pavement`, `swallowhole`, `cave` (stalactites, stalagmites, pillars), `turlough`, `dryvalley`, `polje`; and `surface`, `underground`
- rocks: `granite`, `basalt`, `limestone`, `sandstone`, `shale`, `marble`, `quartzite`, `slate`, `schist`
- plates: `earthquakes`, `volcanoes`, `foldmountains`; boundaries as options where needed: `constructive`, `destructive`, `conservative`
- folding and faulting: `folding`, `faulting`; isostasy: `coastal`, `fluvial`
- humans and the rock cycle: `mining`, `quarrying`, `oilgas`, `geothermal`; humans and surface processes: `dams`, `flood`, `coastal`, `mass`

## 2026

The 2026 paper's 30-mark questions are in `papers.js` as the reviews report them (`rev`, no wording or scheme): sedimentary
and metamorphic rock formation (rocks-sed-met), karst landscapes (karst-landscape), erosion (landform-erosion),
constructive plate boundaries (plates-constructive), human interaction with surface processes (surface-human), the role
of temperature in physical weathering (weather-temp). Make sure those essay types are strong.

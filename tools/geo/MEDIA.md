# Geography media: diagrams, photos, videos

The Geography section (geography.html) teaches Leaving Certificate Higher Level Geography essays. Beside each essay the
student sees the diagram they should draw, a photo of the real example, and a good short video. The student asked for
"diagrams images and yt videos GOOD ONES". Everything here must be accurate for the Irish syllabus: a beautiful thing
that shows a process wrongly is worse than nothing.

## Where it goes and how it is matched

Each kind of media is listed in a registry file that pushes onto `window.GEO_MEDIA`:

```js
(window.GEO_MEDIA = window.GEO_MEDIA || { figs: [], photos: [], videos: [] }).figs.push(
  { id: 'waterfall', name: 'How a waterfall forms', topic: 'landforms', tags: ['waterfall', 'gorge'], file: 'geo/fig/waterfall.svg' }
);
```

- `topic`: the topic id (plates, quakes, volcanoes, deform, isostasy, rocks, landscape, rockuse, weathering, karst,
  landforms, massmove, surfacehuman, india).
- `tags`: what the item shows, using the option ids in `tools/geo/BANKS.md` ("Option ids"), and/or essay ids from
  `geo/papers.js` (e.g. `plates-constructive`, `rocks-sed-met`, `weather-temp`). The writing desk shows an item when its
  tags include the essay being written or an option the student picked; the topic page shows every item of its topic.
- Write only your own registry file(s) and assets. Do not edit anything else; do not use git.

## Diagrams (`geo/fig/<id>.svg`, registry `geo/media/figs-<yourgroup>.js`)

Load and follow the `anthropic-skills:lc-geography-visuals` skill (Skill tool) before drawing anything. There are no
background renders for these, so each diagram is a full-SVG scene in that skill's flat-vector style and palette:

- `viewBox="0 0 1600 900"`, flat side-on cross-section (never isometric, never a cutaway block): a diagram a student can
  copy with a pencil in the exam. Accuracy of structure first: work from what the textbooks and marking schemes show.
- Labels: the exam terms (ocean trench, plunge pool, magma chamber, wave-cut platform...), `font-family="Lexend, Nunito,
  sans-serif"`, weight 600, on a solid pill (`#FFFFFF` with ink `#13233A`), with a thin leader line to the feature. Key
  terms in caps; longer labels in sentence case. Labels never overlap each other or the thing they point at.
- Animation (SMIL only, no script): labels fade in one after another in the order a student would draw and label it
  (`begin` 0.6s apart, `fill="freeze"`), then everything rests on the complete diagram; slow ambient motion where it
  helps (water flowing as a dashed stroke with animated `stroke-dashoffset`, magma pulsing, plates' arrows). Motion
  slower than feels right. Nothing moves out of frame.
- `role="img"`, `<title>` and `<desc>` (the desc says what the diagram shows, in one or two sentences).
- Arrows for movement (plate motion, longshore drift, ice flow) drawn as simple solid arrows.
- No text baked into shapes, no gradients on objects, no shadows, no external files or fonts, under 40 KB each.
- Check every diagram by rendering it (Chromium and Playwright are installed: `require('playwright')`, set the page's
  font with `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600&display=swap" rel="stylesheet">`,
  inline the SVG, wait 15 s for the animations to finish, screenshot at 1600x900) and LOOK at the screenshot with the Read
  tool: fix overlaps, cut-off labels, wrong geometry. A diagram you have not looked at is not done.

Registry entry: `{ id, name, topic, tags, file, desc }` (`desc` the same sentence as the SVG's desc).

## Photos (`assets/geo/photos/<id>.jpg`, registry `geo/media/photos.js`)

Real photographs of the real examples students name (Irish ones first): from Wikimedia Commons only (its API at
https://commons.wikimedia.org/w/api.php, files from upload.wikimedia.org), with a free licence (CC BY, CC BY-SA, CC0,
public domain). Use a plain User-Agent like `LC-Geography-revision/1.0` (no names or emails). Take the 1280px-wide
thumbnail, save it as JPEG under 250 KB (resize with Python/PIL if needed). LOOK at each photo (Read tool) before keeping
it: it must clearly show the feature, be the right place, and not be a map, a diagram or a photo with text on it.

Registry entry: `{ id, topic, tags, file, w, h, caption, credit, licence, source }` — `caption` names the feature and
place ("Dún Briste sea stack, Downpatrick Head, Co. Mayo"), `credit` the author as Commons gives it, `licence` (e.g.
"CC BY-SA 4.0"), `source` the file's Commons page URL.

## Videos (registry `geo/media/videos.js`)

Good YouTube videos: accurate, clear, short (ideally 2-12 minutes) and well made, from channels that know geography
(e.g. Time for Geography, BBC Teach / Bitesize, National Geographic, TED-Ed, Cool Geography, the Geological Society,
the British Geological Survey, Geography Focus, or a good Irish Leaving Cert teacher channel). Find them with web search
(load WebSearch with ToolSearch "select:WebSearch"). For each candidate check it exists and can be embedded with
`curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"` (200 with its title and
channel; 401/404 means not embeddable or gone: drop it). Read the watch page's title and description
(`curl -s -A "Mozilla/5.0" "https://www.youtube.com/watch?v=<ID>"`, grep `"lengthSeconds"` and `"shortDescription"`)
to be sure it is about the right thing and how long it is. Never guess an id.

Registry entry: `{ id: '<YouTube id>', topic, tags, title, channel, secs, start: 0, why }` — `why` one plain line on
what the student will see ("A waterfall's hard and soft rock, the plunge pool and the gorge it leaves as it retreats").
Aim for one to three videos per topic and one for each of the most-asked landforms and processes.

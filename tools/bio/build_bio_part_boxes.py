"""Finds where each part of each Biology exam question is printed on its real paper page, so the desk guide can focus
one part at a time (bio/bio-desk.js): its own lines, the lead-in and the diagram or table it needs, and nothing else.

Two steps:
  extract  reads the SEC PDFs (as build_bio_papers.py does). For each question it writes its printed rows of text (r1,
           r2, ...) and its figures (f1, ...: diagrams, graphs, tables, answer boxes: ink that isn't plain text), what's
           around it (c1, ...: lead-ins above it, the page's other drawings, bare axes), a first guess at whose each one
           is, every line printed on its pages, and a picture of the page with the ids drawn on:
             <work>/ch<N>.json   {"<ch>/<qid>": {rows, figs, ctx, parts, guess}}
             <work>/pages.json   {"<pdf>-p<page>": [line boxes]}
             <work>/look/<ch>-<qid>.png
  apply    reads the checked lists, tools/bio/parts/ch<N>.json = {"<ch>/<qid>": {own: {id: 'stem' | 'x' | part index},
           needs: [[ids part 1 needs besides its own], ...]}} and the hand fixes in tools/bio/parts/fix.json (a part is
           shown on the page of its own first row),
           draws each part's view as the desk will show it to <work>/views/ (to check again), and adds to each
           bio/papers.js entry  parts: [{img, box, dim: [[left, top, width, height], ...]}]  (% of the page):
           box is what the camera and spotlight go to, dim covers everything else printed inside it.
  views    only draws one chapter's part views to <work>/views/ (to check the lists while making them).
Run: python3 tools/bio/build_bio_part_boxes.py extract <papers dir> <sample dir> <work dir>
     python3 tools/bio/build_bio_part_boxes.py views <work dir> <chapter>
     python3 tools/bio/build_bio_part_boxes.py apply <papers dir> <sample dir> <work dir>
"""
import io, json, os, re, subprocess, sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build_bio_papers import ROMAN, ROOT, OUT_DIR, WIDTH, headings, labels, paper_for, paths_of, pdf_lines  # noqa: E402

CHAPTERS = (28, 29, 30, 31, 32)
SHOW = os.path.join(HERE, 'parts')  # the checked lists: ch<N>.json and fix.json
FOOT = re.compile(r'(Page \d+ of \d+|^\d+$|Leaving Certificate|Higher Level|Sections? [ABC]|Answerbook|M44|Turn over|^OVER$|^\[?Blank Page)', re.I)
SECTION = re.compile(r'^\s*(Section|SECTION|Roinn)\s+[ABC]\b')
DOTS = re.compile(r'^[\s._…·\-]+$')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
COLOURS = [(37, 99, 235), (22, 163, 74), (234, 88, 12), (147, 51, 234), (13, 148, 136), (190, 18, 60), (161, 98, 7), (79, 70, 229)]


# ---------- part labels and a first guess ----------
LEAD = re.compile(r'^\s*(?:\(([a-h])\)|\((' + ROMAN + r')\)|(\d)\.?(?=\s))\s*')


# ---------- the question's printed region ----------
def span(lines, qnum, paths):
    """(page, y) where the question (or its asked parts) starts, and where the next label after it starts (None at the
    end of the paper: then it runs to the end of the page with its last label). Same rules as build_bio_papers.locate."""
    labs = labels(lines)
    hs = headings(labs)
    start = next((i for i in hs if labs[i][1] == qnum), None)
    if start is None:
        return None
    nxt = next((i for i in hs if i > start), len(labs))
    first = last_end = None
    for p in paths or [[]]:
        a, b = start, nxt
        chain = [start]
        for depth, name in enumerate(p):
            kind = 'p' if depth == 0 else 's'
            hit = next((i for i in range(a, b) if labs[i][0] == kind and labs[i][1] == name), None)
            if hit is None:
                return None
            end = next((i for i in range(hit + 1, b) if labs[i][0] == kind or (kind == 's' and labs[i][0] == 'p')), b)
            chain.append(chain[-1] if not any(labs[i][0] == kind for i in range(a + 1, hit)) else hit)
            a, b = hit, end
        if first is None:
            first = chain[-1]
        last_end = b
    s = labs[first]
    if last_end < len(labs):
        e = labs[last_end]
        return (s[2], s[4]), (e[2], e[4])
    last_page = max(l[2] for l in labs[first:])
    return (s[2], s[4]), (last_page + 1, 0)


def leads(lines, qnum, paths):
    """The lead-ins above where the question's region starts, as ((page, y) from, (page, y) to) ranges: the question's
    own lead-in (from its number to its first part letter: "6. Give a brief biological explanation for each of the
    following:") when the region starts at a later part, and the part letter's lead-in (from "(b)" to its first
    "(i)": a passage, a diagram) when the region starts at a later sub-part."""
    labs = labels(lines)
    hs = headings(labs)
    head = next((i for i in hs if labs[i][1] == qnum), None)
    if head is None or not paths:
        return []
    nxt = next((i for i in hs if i > head), len(labs))
    at = lambda i: (labs[i][2], labs[i][4])
    out = []
    first_p = next((i for i in range(head + 1, nxt) if labs[i][0] == 'p'), None)
    hit_p = next((i for i in range(head, nxt) if labs[i][0] == 'p' and labs[i][1] == paths[0][0]), None)
    if first_p is not None and hit_p is not None and hit_p != first_p:
        out.append((at(head), at(first_p)))
    if hit_p is not None and len(paths[0]) > 1:
        end = next((i for i in range(hit_p + 1, nxt) if labs[i][0] == 'p'), nxt)
        first_s = next((i for i in range(hit_p + 1, end) if labs[i][0] == 's'), None)
        hit_s = next((i for i in range(hit_p + 1, end) if labs[i][0] == 's' and labs[i][1] == paths[0][1]), None)
        if first_s is not None and hit_s is not None and hit_s != first_s:
            out.append((at(hit_p), at(first_s)))
    return out


def rows_of(lines, pw, ph):
    """Fragments on one line of print make one row: (box in % of the page, text, its lines)."""
    group = []
    for l in sorted(lines, key=lambda l: (l[2], l[1])):
        if group and abs(l[2] - group[-1][0][2]) < 4:
            group[-1].append(l)
        else:
            group.append([l])
    out = []
    for g in group:
        g.sort(key=lambda l: l[1])
        x0, y0, x1, y1 = min(l[1] for l in g), min(l[2] for l in g), max(l[3] for l in g), max(l[4] for l in g)
        out.append(([round(x0 / pw * 100, 2), round(y0 / ph * 100, 2), round((x1 - x0) / pw * 100, 2), round((y1 - y0) / ph * 100, 2)],
                    ' '.join(l[5] for l in g), g))
    return out


INSTRUCTION = re.compile(r'(Answer any|is compulsory|Ceist 1|^\(?\d+\s*marks?\)?$|^\d+\s*marc|^\(\d+(,\s*\d+)*\)$)', re.I)


def render(pdf, pg, work):
    path = os.path.join(work, 'pages', '%s-p%02d.png' % (re.sub(r'\W', '', os.path.basename(pdf))[:24], pg))
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        png = subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-scale-to-x', str(WIDTH), '-scale-to-y', '-1', '-png', pdf],
                             capture_output=True).stdout
        Image.open(io.BytesIO(png)).convert('L').save(path)
    return path


def figures(png, page_lines, pw):
    """Ink on the page that isn't a line of text: diagrams, graphs, tables, as pixel boxes [x0, y0, x1, y1] with the
    text lines that sit on them (their labels). Thin rules (answer lines, underlines) and empty boxes are left out."""
    g = np.array(Image.open(png))
    H, W = g.shape
    s = W / pw
    ink = g < 200
    text = np.zeros_like(ink)
    for l in page_lines:
        x0, y0, x1, y1 = int(l[1] * s) - 2, int(l[2] * s) - 2, int(l[3] * s) + 3, int(l[4] * s) + 3
        text[max(0, y0):y1, max(0, x0):x1] = True
    rest = ink & ~text
    lab, n = ndimage.label(ndimage.binary_dilation(rest, structure=np.ones((9, 9), bool)))
    comps = []
    for sl in ndimage.find_objects(lab):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if x1 - x0 < 40 and y1 - y0 < 40:
            continue
        comps.append([x0, y0, x1, y1])
    # Pieces of one drawing (a label's leader line, a detached arrow) close together become one figure.
    merged = True
    while merged:
        merged = False
        for i in range(len(comps)):
            for j in range(i + 1, len(comps)):
                a, b = comps[i], comps[j]
                if a[0] - 18 < b[2] and b[0] - 18 < a[2] and a[1] - 18 < b[3] and b[1] - 18 < a[3]:
                    comps[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]
                    del comps[j]
                    merged = True
                    break
            if merged:
                break
    out, empty = [], []
    for c in comps:
        w, h = c[2] - c[0], c[3] - c[1]
        if h < 18 and w > 60:
            continue  # a rule: answer line or underline
        if h < 30 and w < 30:
            continue
        inner = [l for l in page_lines if l[1] * s >= c[0] - 2 and l[3] * s <= c[2] + 2 and l[2] * s >= c[1] - 2 and l[4] * s <= c[3] + 2]
        dens = rest[c[1]:c[3], c[0]:c[2]].mean()
        if not inner and dens < 0.02 and w > W * 0.3:
            empty.append(c)  # an empty box to write in, a page frame, or a graph's bare axes
            continue
        if w > W * 0.8 and h > H * 0.5 and dens < 0.02:
            continue
        out.append(c)
    # Labels on and around a drawing belong to it: the lines inside it and short labels (four words at most) touching
    # it, a few times over so axis numbers and then the axis title come in. A question's sentence above a box stays text.
    own = [[] for _ in out]
    for _ in range(3):
        for k, c in enumerate(out):
            for l in page_lines:
                if l in own[k]:
                    continue
                lx0, ly0, lx1, ly1 = l[1] * s, l[2] * s, l[3] * s, l[4] * s
                inside = lx0 >= c[0] - 2 and lx1 <= c[2] + 2 and ly0 >= c[1] - 2 and ly1 <= c[3] + 2
                touch = lx0 < c[2] + 14 and c[0] - 14 < lx1 and ly0 < c[3] + 12 and c[1] - 12 < ly1
                if inside or (touch and len(l[5].split()) <= 4 and not LEAD.match(l[5] + ' ')):
                    own[k].append(l)
                    out[k] = c = [min(c[0], int(lx0)), min(c[1], int(ly0)), max(c[2], int(lx1) + 1), max(c[3], int(ly1) + 1)]
    return [(c, own[k]) for k, c in enumerate(out)], (W, H, s), empty


def lead_labels(text):
    out = []
    while True:
        m = LEAD.match(text)
        if not m or not m.group(0).strip():
            return out, text
        out.append(m.group(1) or m.group(2) or m.group(3))
        text = text[m.end():]


def words(t):
    return re.findall(r'[a-z0-9]+', t.lower())


def match(part_text, row_text):
    """How well a row's text starts like the part's question (0-1)."""
    a = words(lead_labels(part_text)[1])[:6]
    b = words(lead_labels(row_text)[1])[:12]
    if not a or not b:
        return 0
    hit = sum(1 for w in a if w in b)
    return hit / len(a) * (1 if b[0] == a[0] else 0.8)


NEEDS_STEM = re.compile(r'\b(diagram|graph|table|figure|fig\.?|shown|above|below|labelled|structures?\s+[A-H]\b|parts?\s+[A-H]\b|[A-H]\s+and\s+[A-H]\b|letters?|data|results|experiment|investigation|curve|photograph|image)', re.I)


def guess(rows, figs, parts):
    """Whose each row and figure is (own: 'stem', a part's index, or 'x' for print no part here owns), from the row
    each part's text starts on to the next part's; and what else each part needs to be read (needs: the stem, for the
    first part and any part that points at a diagram, graph or table)."""
    anchors, at = [], 0
    for p in parts:
        best, bi = 0, None
        for i in range(at, len(rows)):
            sc = match(p['label'] + ' ' + p['text'], rows[i]['text'])
            if sc > best + 0.05:
                best, bi = sc, i
            if sc >= 0.99:
                break
        if bi is None or best < 0.5:
            anchors.append(None)
            continue
        # The part's labels may sit on the row above its text ("(b)" alone, or "(i)" then the text below).
        while bi > at and lead_labels(rows[bi - 1]['text'])[0] and not words(lead_labels(rows[bi - 1]['text'])[1]):
            bi -= 1
        anchors.append(bi)
        at = bi + 1
    owner = ['stem'] * len(rows)
    found = [a for a in anchors if a is not None]
    for k, a in enumerate(anchors):
        if a is None:
            continue
        nxt = min([b for b in found if b > a] + [len(rows)])
        for i in range(a, nxt):
            owner[i] = k
    if found:
        for i in range(found[0]):
            owner[i] = 'stem'
    def place(f):
        """The last row starting above the figure's top decides whose it is."""
        top = (f['pg'], f['box'][1] + 0.3)
        above = [i for i, r in enumerate(rows) if (r['pg'], r['box'][1]) <= top]
        return owner[above[-1]] if above else 'stem'
    own = {r['id']: owner[i] for i, r in enumerate(rows)}
    own.update({f['id']: place(f) for f in figs})
    stem = [i for i, o in own.items() if o == 'stem']
    needs = [stem if k == 0 or NEEDS_STEM.search(p['text']) else [] for k, p in enumerate(parts)]
    return {'own': own, 'needs': needs, 'anchors': [rows[a]['id'] if a is not None else None for a in anchors]}


# ---------- extract ----------
def pct(c, W, H):
    return [round(c[0] / W * 100, 2), round(c[1] / H * 100, 2), round((c[2] - c[0]) / W * 100, 2), round((c[3] - c[1]) / H * 100, 2)]


def context(lines, sizes, pdf, work, figcache, qnum, paths, rows, figs, boxes_of, page_store):
    """What's printed around the question, with ids c1, c2, ... (the rows' and figures' ids stay as they were):
      lead  the lead-in above a question that starts at a later part (rows and figures): the first part shows it;
            also a drawing that starts inside the question but reaches below it (after: the row above it);
      fig   the page's other drawings (another part's diagram a part may point at);
      box   empty boxes and bare axes (a graph to draw on), shown only where a part needs them.
    Every line printed on the question's pages goes to page_store, so the desk can cover whatever a slide doesn't show."""
    ctx = []
    def add(pg, box, kind, text, **more):
        ctx.append(dict({'id': 'c%d' % (len(ctx) + 1), 'pg': pg, 'box': box, 'kind': kind, 'text': text[:160]}, **more))
    def page(pg):
        pw, ph = sizes[pg - 1]
        page_lines = [l for l in lines if l[0] == pg]
        if (pdf, pg) not in figcache:
            figcache[(pdf, pg)] = figures(render(pdf, pg, work), page_lines, pw)
        page_store.setdefault('%s-p%d' % (os.path.basename(pdf), pg), [[round(l[1] / pw * 100, 2), round(l[2] / ph * 100, 2),
                              round((l[3] - l[1]) / pw * 100, 2), round((l[4] - l[2]) / ph * 100, 2)] for l in page_lines])
        return page_lines, figcache[(pdf, pg)], pw, ph
    have = {(f['pg'], tuple(f['box'])) for f in figs}
    for (fp, fy), (tp, ty) in leads(lines, qnum, paths):
        got_rows, got_figs = [], []
        for pg in range(fp, tp + 1):
            page_lines, (found, (W, H, sc), empty), pw, ph = page(pg)
            lo = fy - 3 if pg == fp else -1
            hi = ty - 3 if pg == tp else 1e9
            taken = set()
            for c, own in found:
                if lo <= c[1] / sc < hi and (pg, tuple(pct(c, W, H))) not in have:
                    taken.update(own)
                    got_figs.append((pg, pct(c, W, H), ' | '.join(l[5] for l in own)))
                    have.add((pg, tuple(pct(c, W, H))))
            ls = [l for l in page_lines if lo <= l[2] < hi and l not in taken and not DOTS.match(l[5])
                  and not (FOOT.search(l[5]) and (l[2] > ph * 0.88 or l[4] < ph * 0.06))]
            got_rows += [(pg, box, text) for box, text, g in rows_of(ls, pw, ph) if not INSTRUCTION.search(text.strip())]
        # A lead-in that is only the question's number is no lead-in.
        if any(len(re.sub(r'^(Question|Ceist)\s+\d+|^\d+\.', '', t).split()) >= 3 for _, _, t in got_rows):
            for pg, box, text in got_rows:
                add(pg, box, 'lead', text)
            for pg, box, text in got_figs:
                add(pg, box, 'lead', text)
    for pg in sorted({r['pg'] for r in rows} | {f['pg'] for f in figs} | set(boxes_of)):
        page_lines, (found, (W, H, sc), empty), pw, ph = page(pg)
        lo, hi = boxes_of.get(pg, (-1, -1))
        for c, own in found:
            b = pct(c, W, H)
            if (pg, tuple(b)) in have:
                continue
            have.add((pg, tuple(b)))
            if lo <= c[1] / sc < hi:
                above = [r['id'] for r in rows if (r['pg'], r['box'][1]) <= (pg, b[1] + 0.3)]
                add(pg, b, 'lead', ' | '.join(l[5] for l in own), after=above[-1] if above else None)
            else:
                add(pg, b, 'fig', ' | '.join(l[5] for l in own))
        for c in empty:
            add(pg, pct(c, W, H), 'box', '')
    return ctx



def entries(pdirs):
    cache = {}
    for ch in CHAPTERS:
        src = json.load(open(os.path.join(HERE, 'questions', 'ch%d.json' % ch)))
        for q in src['questions']:
            m = re.search(r'Question\s+(\d+)(.*)$', q['source'])
            y = re.match(r'(\d{4})', q['id'])
            if not m:
                continue
            qnum, paths = int(m.group(1)), paths_of(m.group(2))
            for key, pdf in paper_for(q['id'], int(y.group(1)) if y else 2027, qnum, pdirs):
                if pdf not in cache:
                    cache[pdf] = pdf_lines(pdf)
                lines, sizes = cache[pdf]
                used = paths
                got = span(lines, qnum, paths)
                if not got and paths:
                    got, used = span(lines, qnum, []), []
                if got:
                    yield ch, q, key, pdf, lines, sizes, got, qnum, used
                    break


def extract(pdirs, work):
    os.makedirs(os.path.join(work, 'look'), exist_ok=True)
    figcache = {}
    font = ImageFont.truetype(FONT, 26)
    out = {ch: {} for ch in CHAPTERS}
    many, page_store = 0, {}
    for ch, q, key, pdf, lines, sizes, (s, e), qnum, paths in entries(pdirs):
        pages = list(range(s[0], e[0] + 1 if e[1] > 0 else e[0]))
        rows, figs, used, boxes_of = [], [], set(), {}
        for pg in pages:
            pw, ph = sizes[pg - 1]
            lo = s[1] - 3 if pg == s[0] else -1
            hi = e[1] - 3 if pg == e[0] else 1e9
            page_lines = [l for l in lines if l[0] == pg]
            # The next section's heading ends the question too (the last question of Section A).
            cut = [l[2] for l in page_lines if lo <= l[2] < hi and SECTION.match(l[5])]
            if cut:
                hi = min(cut) - 3
            if (pdf, pg) not in figcache:
                figcache[(pdf, pg)] = figures(render(pdf, pg, work), page_lines, pw)
            boxes_of[pg] = (lo, hi)
            found, (W, H, sc), _ = figcache[(pdf, pg)]
            for c, own in found:
                mid = (c[1] + c[3]) / 2 / sc
                if lo <= mid < hi:
                    used.update(own)
                    figs.append({'id': 'f%d' % (len(figs) + 1), 'pg': pg, 'box': [round(c[0] / W * 100, 2), round(c[1] / H * 100, 2),
                                 round((c[2] - c[0]) / W * 100, 2), round((c[3] - c[1]) / H * 100, 2)],
                                 'labels': ' | '.join(l[5] for l in own)[:160]})
            mine = [l for l in page_lines if lo <= l[2] < hi and l not in used and not DOTS.match(l[5])
                    and not (FOOT.search(l[5]) and (l[2] > ph * 0.88 or l[4] < ph * 0.06))]
            # Fragments on one line of print make one row.
            group = []
            for l in sorted(mine, key=lambda l: (l[2], l[1])):
                if group and abs(l[2] - group[-1][0][2]) < 4:
                    group[-1].append(l)
                else:
                    group.append([l])
            for g in group:
                g.sort(key=lambda l: l[1])
                x0, y0, x1, y1 = min(l[1] for l in g), min(l[2] for l in g), max(l[3] for l in g), max(l[4] for l in g)
                rows.append({'id': 'r%d' % (len(rows) + 1), 'pg': pg, 'box': [round(x0 / pw * 100, 2), round(y0 / ph * 100, 2),
                             round((x1 - x0) / pw * 100, 2), round((y1 - y0) / ph * 100, 2)], 'text': ' '.join(l[5] for l in g)})
            if cut:
                break
        item_ctx = context(lines, sizes, pdf, work, figcache, qnum, paths, rows, figs, boxes_of, page_store)
        if len({r['pg'] for r in rows} | {f['pg'] for f in figs}) > 1:
            many += 1
        parts = [{'label': p['label'], 'text': p['text']} for p in q['parts']]
        item = {'source': q['source'], 'pdf': os.path.basename(pdf), 'key': key, 'stem': q.get('stem') or '', 'rows': rows, 'figs': figs, 'parts': parts,
                'ctx': item_ctx}
        item['guess'] = guess(rows, figs, parts)
        name = '%d/%s' % (ch, q['id'])
        out[ch][name] = item
        look(item, pdf, work, font, os.path.join(work, 'look', '%d-%s.png' % (ch, q['id'])))
    for ch in CHAPTERS:
        with open(os.path.join(work, 'ch%d.json' % ch), 'w') as f:
            json.dump(out[ch], f, ensure_ascii=False, indent=1)
    with open(os.path.join(work, 'pages.json'), 'w') as f:
        json.dump(page_store, f, separators=(',', ':'))
    print(sum(len(v) for v in out.values()), 'questions;', many, 'run over more than one page')


def look(item, pdf, work, font, path):
    """The question's page(s) with every row and figure boxed and named, coloured by whose the first guess says it
    is (grey: the stem, then one colour per part: blue, green, orange, purple, teal, red, brown, indigo)."""
    own = item['guess']['own']
    col = {i: (110, 110, 110) if o == 'stem' else COLOURS[o % len(COLOURS)] for i, o in own.items()}
    crops = []
    for pg in sorted({r['pg'] for r in item['rows']} | {f['pg'] for f in item['figs']} | {c['pg'] for c in item.get('ctx', []) if c['kind'] == 'lead'}):
        img = Image.open(render(pdf, pg, work)).convert('RGB')
        W, H = img.size
        d = ImageDraw.Draw(img, 'RGBA')
        tags = []
        boxes = [(r['id'], r['box']) for r in item['rows'] if r['pg'] == pg] + [(f['id'], f['box']) for f in item['figs'] if f['pg'] == pg]
        boxes += [(c['id'], c['box']) for c in item.get('ctx', []) if c['pg'] == pg and c['kind'] != 'box' or c['pg'] == pg and c['kind'] == 'box']
        for i, b in boxes:
            x0, y0, x1, y1 = b[0] * W / 100, b[1] * H / 100, (b[0] + b[2]) * W / 100, (b[1] + b[3]) * H / 100
            c = col.get(i, (220, 38, 38)) if not i.startswith('c') else (200, 0, 200)
            d.rectangle([x0 - 3, y0 - 3, x1 + 3, y1 + 3], outline=c + (255,), width=3 if i.startswith('f') else 2)
            if i.startswith('r') or (i.startswith('c') and b[3] < 3):
                d.text((max(2, x0 - 78), y0 - 4), i, fill=c + (255,), font=font)
            else:
                tags.append((x1 + 8 if x1 + 70 < W else x0 - 8 - 60, y0, i, c))
        for x, y, i, c in tags:
            d.rectangle([x - 4, y - 2, x + 56, y + 30], fill=(255, 255, 255, 255), outline=c + (255,), width=2)
            d.text((x, y), i, fill=c + (255,), font=font)
        ys = [b[1] * H / 100 for _, b in boxes] + [(b[1] + b[3]) * H / 100 for _, b in boxes]
        crops.append(img.crop((0, max(0, int(min(ys)) - 40), W, min(H, int(max(ys)) + 40))))
    if not crops:
        return
    W = crops[0].size[0]
    sheet = Image.new('RGB', (W, sum(c.size[1] for c in crops) + 30 * (len(crops) - 1)), (60, 60, 60))
    y = 0
    for c in crops:
        sheet.paste(c, (0, y))
        y += c.size[1] + 30
    scale = 1100 / W
    sheet = sheet.resize((1100, int(sheet.size[1] * scale)), Image.LANCZOS)
    sheet.save(path)


# ---------- apply ----------
def inter(a, b):
    return a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]


def pad(b, x, y):
    return [b[0] - x, b[1] - y, b[2] + 2 * x, b[3] + 2 * y]


def trim(d, shown):
    """A cover never lies over anything shown: cut it back from each shown box it overlaps, on the side it overlaps least."""
    l, t, r, b = d[0], d[1], d[0] + d[2], d[1] + d[3]
    for s in shown:
        sl, st, sr, sb = s[0], s[1], s[0] + s[2], s[1] + s[3]
        if not (l < sr and sl < r and t < sb and st < b):
            continue
        if min(r, sr) - max(l, sl) >= min(b, sb) - max(t, st):
            if st + (sb - st) / 2 < t + (b - t) / 2:
                t = sb
            else:
                b = st
        elif sl + (sr - sl) / 2 < l + (r - l) / 2:
            l = sr
        else:
            r = sl
        if r <= l or b <= t:
            return None
    return [l, t, r - l, b - t]


def view(item, k, plan, page_lines=None):
    """One part's view on its page: box (the camera and spotlight) and dim (everything else inside the box). The box
    is as wide as the whole question's print, so the camera only moves up and down between parts; it runs from the
    first to the last thing the part shows. Everything else printed inside it (the other parts, the questions next to
    it: every line on the page, from page_lines) is covered, in bands across the box where nothing shown sits beside
    them, and never over anything shown."""
    own, needs = plan['own'], plan['needs']
    items = {r['id']: r for r in item['rows']}
    items.update({f['id']: f for f in item['figs']})
    items.update({c['id']: c for c in item.get('ctx', [])})
    ids = [i for i in list(items) if own.get(i) == k] + [i for i in needs[k] if own.get(i) != k]
    ids = [i for i in dict.fromkeys(ids) if i in items]
    if not ids:
        return None, 'part %d shows nothing' % (k + 1)
    texts = [i for i in ids if i.startswith('r') and own.get(i) == k]
    pg = items[(texts or ids)[0]]['pg']
    gone = [i for i in ids if items[i]['pg'] != pg]
    raw = [items[i]['box'] for i in ids if items[i]['pg'] == pg]
    shown = [pad(b, 0.35, 0.25) for b in raw]
    every = list(item['rows']) + list(item['figs']) + [items[i] for i in ids if i.startswith('c')]
    left = min(it['box'][0] for it in every) - 1.2
    right = max(it['box'][0] + it['box'][2] for it in every) + 1.2
    top = min(b[1] for b in shown) - 0.6
    bottom = max(b[1] + b[3] for b in shown) + 0.6
    box = [left, top, right - left, bottom - top]
    others = [it['box'] for i, it in items.items() if i not in ids and it['pg'] == pg and it.get('kind') != 'box']
    near = [pad(b, 0.3, 0.3) for b in raw]
    for l in page_lines or []:
        cx, cy = l[0] + l[2] / 2, l[1] + l[3] / 2
        if not any(n[0] <= cx <= n[0] + n[2] and n[1] <= cy <= n[1] + n[3] for n in near):
            others.append(l)
    dims = []
    for ob in others:
        if not inter(ob, box):
            continue
        # Across the whole box when nothing shown is beside it (tight lines: trimmed back off the shown ones below).
        band = [left, ob[1], right - left, ob[3]]
        dims.append(pad(band, 0, 0.3) if not any(inter(band, rb) for rb in raw) else pad(ob, 0.4, 0.3))
    # Neighbouring bands with nothing shown between them become one.
    dims.sort(key=lambda d: d[1])
    out = []
    for d in dims:
        if out and out[-1][0] == left and d[0] == left and out[-1][2] == d[2]:
            gap = [left, out[-1][1] + out[-1][3], right - left, d[1] - out[-1][1] - out[-1][3]]
            if gap[3] <= 0 or not any(inter(gap, rb) for rb in raw):
                o = out[-1]
                out[-1] = [o[0], o[1], o[2], max(o[1] + o[3], d[1] + d[3]) - o[1]]
                continue
        out.append(d)
    clip = []
    for d in out:
        d = trim(d, raw)
        if not d:
            continue
        l, t = max(d[0], box[0]), max(d[1], box[1])
        r, b = min(d[0] + d[2], box[0] + box[2]), min(d[1] + d[3], box[1] + box[3])
        if r - l > 0.05 and b - t > 0.05:
            clip.append([round(l, 2), round(t, 2), round(r - l, 2), round(b - t, 2)])
    # A cover inside another one adds nothing.
    clip = [c for i, c in enumerate(clip) if not any(j != i and o[0] <= c[0] and o[1] <= c[1] and o[0] + o[2] >= c[0] + c[2]
                                                       and o[1] + o[3] >= c[1] + c[3] and (o != c or j < i) for j, o in enumerate(clip))]
    note = ('part %d: %s on another page left out' % (k + 1, ', '.join(gone))) if gone else None
    return {'pg': pg, 'box': [round(v, 2) for v in box], 'dim': clip}, note


def plan_of(item, checked, name, fixes=None):
    """The checked lists (or the first guess), with the context ids' defaults (a lead-in: the stem, shown by the first
    part; a drawing reaching below the question: whoever owns the row above it; the page's other drawings: nobody's)
    and then the hand fixes: {"own": {id: owner}, "add": [[ids] per part], "drop": [[ids] per part], "needs": all of
    them, "extra": [items the cut missed: {id, pg, box, kind, text}]}."""
    plan = checked.get(name) or item['guess']
    own = {i: (o if o in ('stem', 'x') else int(o)) for i, o in plan['own'].items()}
    needs = [list(n) for n in plan['needs']]
    for c in item.get('ctx', []):
        if c['id'] in own:
            continue
        if c['kind'] == 'lead' and c.get('after'):
            own[c['id']] = own.get(c['after'], 'x')
        elif c['kind'] == 'lead':
            own[c['id']] = 'stem'
            if needs:
                needs[0].append(c['id'])
        else:
            own[c['id']] = 'x'
    fix = (fixes or {}).get(name, {})
    own.update({i: (o if o in ('stem', 'x') else int(o)) for i, o in fix.get('own', {}).items()})
    for k, ids in enumerate(fix.get('add', [])):
        needs[k] += [i for i in ids if i not in needs[k]]
    for k, ids in enumerate(fix.get('drop', [])):
        needs[k] = [i for i in needs[k] if i not in ids]
    if fix.get('needs'):
        needs = [list(n) for n in fix['needs']]
    return {'own': own, 'needs': needs}


def load_plans(work, ch):
    path = os.path.join(SHOW, 'ch%d.json' % ch)
    fix = os.path.join(SHOW, 'fix.json')
    pages = os.path.join(work, 'pages.json')
    return (json.load(open(path)) if os.path.exists(path) else {}, json.load(open(fix)) if os.path.exists(fix) else {},
            json.load(open(pages)) if os.path.exists(pages) else {})


def part_views(item, name, checked, fixes, pages):
    extra = (fixes or {}).get(name, {}).get('extra')
    if extra:
        item = dict(item, ctx=item.get('ctx', []) + extra)
    plan = plan_of(item, checked, name, fixes)
    got, notes = [], []
    for k in range(len(item['parts'])):
        v, note = view(item, k, plan, None)
        if v:
            v, note = view(item, k, plan, pages.get('%s-p%d' % (item['pdf'], v['pg'])))
        if note:
            notes.append('%s %s' % (name, note))
        got.append(v)
    return got, notes


def views(work, ch, only=None):
    """Only draws one chapter's part views to <work>/views/ (from the checked lists where there are some), to look at."""
    data = json.load(open(os.path.join(work, 'ch%d.json' % ch)))
    checked, fixes, pages = load_plans(work, ch)
    os.makedirs(os.path.join(work, 'views'), exist_ok=True)
    for name, item in data.items():
        if only and name not in only:
            continue
        got, notes = part_views(item, name, checked, fixes, pages)
        for n in notes:
            print(n)
        sheet(item, got, item['pdf'], work, os.path.join(work, 'views', name.replace('/', '-') + '.png'))
    print('drew', len(data), 'questions to', os.path.join(work, 'views'), '(%d checked)' % len([n for n in data if n in checked]))


def apply(pdirs, work):
    papers_js = os.path.join(ROOT, 'bio', 'papers.js')
    src = open(papers_js).read()
    papers = json.loads(src[src.index('{'):src.rindex('}') + 1])
    pdf_of = {}
    for ch, q, key, pdf, lines, sizes, got, _, _ in entries(pdirs):
        pdf_of['%d/%s' % (ch, q['id'])] = (key, pdf)
    os.makedirs(os.path.join(work, 'views'), exist_ok=True)
    notes, guessed = [], []
    for ch in CHAPTERS:
        data = json.load(open(os.path.join(work, 'ch%d.json' % ch)))
        checked, fixes, pages = load_plans(work, ch)
        for name, item in data.items():
            if name not in checked:
                guessed.append(name)
            key, pdf = pdf_of[name]
            views, more = part_views(item, name, checked, fixes, pages)
            notes += more
            for v in views:
                if v:
                    img = 'assets/bio/papers/%s-p%02d.webp' % (key, v['pg'])
                    if not os.path.exists(os.path.join(ROOT, img)):
                        Image.open(render(pdf, v['pg'], work)).convert('RGB').save(os.path.join(ROOT, img), 'WEBP', quality=80, method=6)
                    v['img'] = img
            if name in papers and all(views):
                papers[name]['parts'] = [{'img': v['img'], 'box': v['box'], 'dim': v['dim']} for v in views]
            sheet(item, views, pdf, work, os.path.join(work, 'views', name.replace('/', '-') + '.png'))
    with open(papers_js, 'w') as f:
        f.write(src[:src.index('window.BioPapers')])
        f.write('window.BioPapers = ' + json.dumps(papers, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(sum(1 for v in papers.values() if 'parts' in v), 'of', len(papers), 'questions have part views;',
          len(guessed), 'from the first guess (not checked)')
    for n in notes:
        print('  ', n)


def sheet(item, views, pdf, work, path):
    """Every part's view of one question as the desk shows it (cropped to the box, others covered), one under another."""
    font = ImageFont.truetype(FONT, 22)
    tiles = []
    for k, v in enumerate(views):
        if not v:
            continue
        img = Image.open(render(pdf, v['pg'], work)).convert('RGB')
        W, H = img.size
        d = ImageDraw.Draw(img, 'RGBA')
        for b in v['dim']:
            d.rectangle([b[0] * W / 100, b[1] * H / 100, (b[0] + b[2]) * W / 100, (b[1] + b[3]) * H / 100], fill=(0, 0, 0, 249))
        b = v['box']
        crop = img.crop((int(max(0, b[0]) * W / 100), int(max(0, b[1]) * H / 100), int(min(100, b[0] + b[2]) * W / 100), int(min(100, b[1] + b[3]) * H / 100)))
        head = Image.new('RGB', (crop.size[0], 34), (30, 30, 30))
        ImageDraw.Draw(head).text((8, 5), 'Slide %d: part %s  %s' % (k + 1, item['parts'][k]['label'], item['parts'][k]['text'][:90]), fill=(255, 200, 0), font=font)
        tiles += [head, crop]
    if not tiles:
        return
    w = max(t.size[0] for t in tiles)
    out = Image.new('RGB', (w, sum(t.size[1] for t in tiles) + 14 * len(tiles)), (90, 90, 90))
    y = 0
    for t in tiles:
        out.paste(t, (0, y))
        y += t.size[1] + 14
    if w > 1000:
        out = out.resize((1000, int(out.size[1] * 1000 / w)), Image.LANCZOS)
    out.save(path)


if __name__ == '__main__':
    if len(sys.argv) >= 4 and sys.argv[1] == 'views':
        views(sys.argv[2], int(sys.argv[3]), sys.argv[4:])
        sys.exit()
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    mode, pdirs, work = sys.argv[1], (sys.argv[2], sys.argv[3]), sys.argv[4]
    if mode == 'extract':
        extract(pdirs, work)
    elif mode == 'apply':
        apply(pdirs, work)
    else:
        sys.exit(__doc__)

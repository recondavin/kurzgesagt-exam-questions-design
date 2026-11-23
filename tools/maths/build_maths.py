"""Builds the Maths section from tools/maths/questions/ch<N>.json (the source of truth, extracted by hand from the SEC
Ordinary Level papers 2015-2025 and their marking schemes).

Writes:
  maths/q<N>.js        window.MathsQuestions[N] = {chapter, title, questions: [...]} (the JSON, as is)
  maths/papers.js      window.MathsPapers['<N>/<question id>'] = {img, page, box, label, parts: [{img, page, box}]}
                       (box = [left, top, width, height] in % of the page: the whole question on its first page, and
                       each part from its label to the next label)
  assets/maths/papers/<year>-p<paper>-p<page>.webp   the paper pages, 2055 px wide (sharp when the desk zooms in)

The boxes come from the PDF's text layer: "Question 4" at the left margin starts a question, "(a)" at the left margin
starts a part, "(i)" a little further in starts a sub-part.
The PDFs are not in the repository; pass their folder (files named <year>-p<paper>-qp.pdf):
Run: python3 tools/maths/build_maths.py <pdf dir> [--render: redraw pages already there] [--check: no writing]
"""
import glob, io, json, os, re, subprocess, sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT_DIR = os.path.join(ROOT, 'assets', 'maths', 'papers')
WIDTH = 2055
TOP = re.compile(r'^\(([a-h])\)(?=\s|$)')
SUB = re.compile(r'^\((i{1,3}|iv|vi{0,3}|ix|x)\)(?=\s|$)')
FOOT = 785  # page points: below this is the page footer ("Leaving Certificate 2015 ... Page 8")


def lines_of(pdf):
    """Every page's text lines: {page: [(x, y, x2, y2, text)]} and page sizes."""
    html = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
    pages, sizes = {}, {}
    for pi, page in enumerate(html.split('<page ')[1:]):
        w, h = re.match(r'width="([\d.]+)" height="([\d.]+)"', page).groups()
        sizes[pi + 1] = (float(w), float(h))
        rows = []
        for x, y, x2, y2, body in re.findall(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', page, re.S):
            words = re.findall(r'>([^<]*)</word>', body)
            rows.append((float(x), float(y), float(x2), float(y2), ' '.join(words).strip()))
        rows.sort(key=lambda r: (round(r[1]), r[0]))
        pages[pi + 1] = rows
    return pages, sizes


def labels(rows, qnum):
    """Part labels on one page, in reading order: (y, 'a' or None, 'ii' or None). Also where Question N starts/ends."""
    out, start, end = [], None, None
    for x, y, x2, y2, t in rows:
        m = re.match(r'^Question\s+(\d+)\b', t)
        if m and x < 80:
            if int(m.group(1)) == qnum and start is None:
                start = y
            elif start is not None and int(m.group(1)) != qnum and end is None:
                end = y
            continue
        if y >= FOOT:
            continue
        if TOP.match(t) and x < 75:
            out.append([y, TOP.match(t).group(1), None])
            rest = t[TOP.match(t).end():].strip()
            if SUB.match(rest):  # "(c) (i) Find ..." read as one line
                out[-1][2] = SUB.match(rest).group(1)
        elif SUB.match(t) and (x < 130 or (x < 360 and len(t) <= 6)):  # a bare "(ii)" can label a second column
            # "(c)" and "(i)" on the same line are one label: (c)(i).
            if out and abs(out[-1][0] - y) < 3 and out[-1][2] is None:
                out[-1][2] = SUB.match(t).group(1)
            else:
                out.append([y, None, SUB.match(t).group(1)])
    if start is not None:
        out = [l for l in out if l[0] >= start - 2]
    if end is not None:
        out = [l for l in out if l[0] < end]
    return out, start, end


def lead_in(rows, y):
    """A part's lead-in: lines printed just above its label at the margin ("Three animals were picked at random...
    (c) (i) Find ..."), joined to it with no gap. Returns the top of the first of them, or y."""
    top = y
    for x, ly, x2, y2, t in sorted(rows, key=lambda r: -r[1]):
        if ly >= top or x > 100 or TOP.match(t) or SUB.match(t) or re.match(r'^Question\s+\d', t):
            if ly < top and (TOP.match(t) or re.match(r'^Question\s+\d', t)) and x < 100:
                break
            continue
        if 0 <= top - y2 <= 9:
            top = ly
        elif top - y2 > 9:
            break
    return top


def parse_label(l):
    m = re.match(r'^\(([a-h])\)(?:\s*\((i{1,3}|iv|vi{0,3}|ix|x)\))?$', l.strip())
    if m:
        return m.group(1), m.group(2)
    m = re.match(r'^\((i{1,3}|iv|vi{0,3}|ix|x)\)$', l.strip())
    return (None, m.group(1)) if m else (None, None)


def boxes(q, pages, sizes):
    """The question's box on its first page, and each part's page and box (in % of the page)."""
    seq = []  # (page, y, top, sub) every label across the question's pages
    first_start, ends = None, {}
    for pg in q['pages']:
        found, start, end = labels(pages.get(pg, []), q['q'])
        if pg == q['pages'][0]:
            first_start = start
        ends[pg] = end
        for y, a, s in found:
            seq.append((pg, y, a, s))
    # Carry the top-level letter onto sub-labels: (ii) after (c) is (c)(ii).
    cur, full = None, []
    for pg, y, a, s in seq:
        if a:
            cur = a
        full.append((pg, y, cur, s))
    w0, h0 = sizes[q['pages'][0]]

    def pct(pg, y1, y2):
        w, h = sizes[pg]
        y1, y2 = max(0, y1), min(h, y2)
        return [round(48 / w * 100, 2), round(y1 / h * 100, 2), round((w - 96) / w * 100, 2), round((y2 - y1) / h * 100, 2)]

    def end_of(pg):
        return ends.get(pg) or FOOT

    qtop = (first_start if first_start is not None else 50) - 8
    qbox = pct(q['pages'][0], qtop, end_of(q['pages'][0]) - 4)
    parts, used = [], 0
    for p in q['parts']:
        a, s = parse_label(p['l'])
        hit = None
        for j in range(used, len(full)):
            pg, y, ca, cs = full[j]
            if (a is None or ca == a) and (s is None or cs == s):
                hit = j
                break
        if hit is None:
            parts.append({'page': q['pages'][0], 'box': qbox, 'found': False})
            continue
        used = hit + 1
        pg, y = full[hit][0], full[hit][1]
        # (c)(i) starts at "(c)" when (c) has its own line above (i): that line is (c)'s instruction for all its parts.
        if s == 'i' and hit and full[hit - 1][0] == pg and full[hit - 1][2] == a and full[hit - 1][3] is None:
            y = full[hit - 1][1]
        # The part runs to the next label on the same page that isn't a sub-label of it, else the end of the page.
        nxt = None
        for j in range(hit + 1, len(full)):
            if full[j][0] != pg:
                break
            if s is None and a is not None and full[j][2] == a and full[j][3] is not None:
                continue  # (b) (i) (ii) all belong to "(b)" when the part is the whole of (b)
            if abs(full[j][1] - y) < 3:
                continue  # a label beside this one (two columns): the part runs on below both
            nxt = full[j][1]
            break
        bottom = (lead_in(pages.get(pg, []), nxt) - 6) if nxt is not None else end_of(pg) - 4
        top = lead_in(pages.get(pg, []), y) - 8
        if pg == q['pages'][0] and first_start is not None and a == 'a' and (s in (None, 'i')):
            top = min(top, first_start - 8)  # the first part takes the question's stem with it
        parts.append({'page': pg, 'box': pct(pg, top, bottom), 'found': True})
    return qbox, parts


def render(pdf, year, paper, pg, redo):
    name = '%d-p%d-p%02d.webp' % (year, paper, pg)
    out = os.path.join(OUT_DIR, name)
    if redo or not os.path.exists(out):
        png = subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-scale-to-x', str(WIDTH), '-scale-to-y', '-1', '-png', pdf],
                             capture_output=True).stdout
        Image.open(io.BytesIO(png)).convert('RGB').save(out, 'WEBP', quality=72, method=6)
    return 'assets/maths/papers/' + name


def main():
    argv = sys.argv[1:]
    qdir = os.path.join(HERE, 'questions')
    if '--questions' in argv:  # another folder of ch<N>.json (for trying things out)
        k = argv.index('--questions'); qdir = argv[k + 1]; del argv[k:k + 2]
    args = [a for a in argv if not a.startswith('--')]
    redo, check = '--render' in argv, '--check' in argv
    pdf_dir = args[0] if args else None
    os.makedirs(OUT_DIR, exist_ok=True)
    papers, problems, cache = {}, [], {}
    for path in sorted(glob.glob(os.path.join(qdir, 'ch*.json'))):
        data = json.load(open(path, encoding='utf-8'))
        ch = data['chapter']
        if not check:
            with open(os.path.join(ROOT, 'maths', 'q%d.js' % ch), 'w', encoding='utf-8') as f:
                f.write('// Built by tools/maths/build_maths.py from tools/maths/questions/ch%d.json. Do not edit by hand.\n' % ch)
                f.write('window.MathsQuestions = window.MathsQuestions || {};\n')
                f.write('window.MathsQuestions[%d] = %s;\n' % (ch, json.dumps(data, ensure_ascii=False, separators=(',', ':'))))
        if not pdf_dir:
            continue
        for q in data['questions']:
            pdf = os.path.join(pdf_dir, '%d-p%d-qp.pdf' % (q['year'], q['paper']))
            if pdf not in cache:
                cache[pdf] = lines_of(pdf)
            pages, sizes = cache[pdf]
            qbox, parts = boxes(q, pages, sizes)
            for k, p in enumerate(parts):
                if not p['found']:
                    problems.append('%d/%s %s: label not found on the paper (uses the whole question)' % (ch, q['id'], q['parts'][k]['l']))
            if check:
                continue
            img = render(pdf, q['year'], q['paper'], q['pages'][0], redo)
            papers['%d/%s' % (ch, q['id'])] = {
                'img': img, 'page': q['pages'][0], 'box': qbox,
                'label': 'Leaving Certificate %d, Mathematics Ordinary Level, Paper %d, Question %d' % (q['year'], q['paper'], q['q']),
                'parts': [{'img': render(pdf, q['year'], q['paper'], p['page'], redo), 'page': p['page'], 'box': p['box']} for p in parts]}
    if pdf_dir and not check:
        with open(os.path.join(ROOT, 'maths', 'papers.js'), 'w', encoding='utf-8') as f:
            f.write('// Built by tools/maths/build_maths.py: each question\'s real paper page and where it and its parts are.\n')
            f.write('window.MathsPapers = %s;\n' % json.dumps(papers, separators=(',', ':')))
    for p in problems:
        print(p)
    print('%d questions on the desk, %d problems' % (len(papers), len(problems)))


if __name__ == '__main__':
    main()

"""Builds the real exam paper pages for the Biology desk: assets/bio/papers/*.webp and bio/papers.js.

For every exam question in tools/bio/questions/ch<N>.json, finds the page of the SEC paper it is on and the
box around it (from the PDF's text layer: question numbers like "12." or "Question 3", part labels "(b)" and
sub-parts "(iii)"), renders that page 1.5 times the desk's paper size (2055 px wide, A4, so it stays sharp when the
desk zooms in) and records:
  window.BioPapers['<chapter>/<question id>'] = {img, page, box: [left, top, width, height] as % of the page,
                                                 content: the same for everything printed on the page, label}
(the desk fits the content box to the screen, so the paper is as big as the screen allows)
(the same question can be in two chapters, each about different parts of it)
The desk (bio/bio-desk.js) puts the page on the desk and the question's box becomes its focus target.

The PDFs are the SEC papers (examinations.ie; 2019 on, two booklets: A1 = Sections A and B, A2 = Section C)
and the 2027 sample papers. They are not in the repository; pass their folders:
Run: python3 tools/bio/build_bio_papers.py <papers dir> <sample dir> [--check] [--render: redraw pages already there]
"""
import glob, io, json, os, re, subprocess, sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT_DIR = os.path.join(ROOT, 'assets', 'bio', 'papers')
WIDTH = 2055
ROMAN = r'(?:i{1,3}|iv|vi{0,3}|ix|x)'
SAMPLES = {'S1': 'lc-biology-2027-1-qp-smlwu.pdf', 'S2': 'lc-biology-2027-2-qp-buv2z.pdf'}


def pdf_lines(pdf):
    """Every text line: (page, x, y, x2, y2, text), plus each page's size."""
    html = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
    lines, sizes = [], []
    for pi, page in enumerate(html.split('<page ')[1:]):
        w, h = re.match(r'width="([\d.]+)" height="([\d.]+)"', page).groups()
        sizes.append((float(w), float(h)))
        for x, y, x2, y2, body in re.findall(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', page, re.S):
            words = re.findall(r'>([^<]*)</word>', body)
            lines.append((pi + 1, float(x), float(y), float(x2), float(y2), ' '.join(words).strip()))
    lines.sort(key=lambda l: (l[0], l[2], l[1]))
    return lines, sizes


def labels(lines):
    """Question headings, part letters and roman sub-parts, in reading order."""
    out = []
    for pg, x, y, x2, y2, t in lines:
        m = re.match(r'^(?:(?:Question|Ceist)\s+(\d+)|(\d+)\.)(?:\s|$)', t)
        if m and (m.group(1) or x < 62):
            out.append(('q', int(m.group(1) or m.group(2)), pg, x, y))
            t = t[m.end():].strip()
        for m in re.finditer(r'^\(([a-h])\)\s*', t):
            out.append(('p', m.group(1), pg, x, y))
            t = t[m.end():].strip()
        m = re.match(r'^\((' + ROMAN + r')\)(?:\s|$)', t)
        if m and x < 150:
            out.append(('s', m.group(1), pg, x, y))
    return out


def headings(labs):
    """Question headings in order, skipping stray numbers: each one must follow the last (allowing one gap).
    A Section C booklet starts at its own first question (11 from 2019). When a number is printed twice, the later one
    is the heading (2023's Section C misprints 15(b) as "16.", a page before the real Question 16)."""
    keep, last = [], None
    for i, l in enumerate(labs):
        if l[0] != 'q':
            continue
        if keep and l[1] == last:
            keep[-1] = i
        elif last is None or last < l[1] <= last + 2:
            keep.append(i)
            last = l[1]
    return keep


def paths_of(rest):
    """'(b) (i)-(iii)' -> [['b', 'i'], ['b', 'iii']]; '(e), (f)' -> [['e'], ['f']]."""
    paths = []
    for tok in re.findall(r'\(([a-h]|' + ROMAN + r')\)', rest):
        if re.fullmatch(r'[a-h]', tok):
            paths.append([tok])
        elif paths and len(paths[-1]) == 1:
            paths[-1].append(tok)
        elif paths:
            paths.append([paths[-1][0], tok])
    return paths


def locate(lines, sizes, qnum, paths):
    labs = labels(lines)
    hs = headings(labs)
    start = next((i for i in hs if labs[i][1] == qnum), None)
    if start is None:
        return None
    nxt = next((i for i in hs if i > start), len(labs))
    lo, hi = start, nxt
    first = last_end = None
    for p in paths or [[]]:
        a, b = lo, hi
        chain = [lo]
        for depth, name in enumerate(p):
            kind = 'p' if depth == 0 else 's'
            hit = next((i for i in range(a, b) if labs[i][0] == kind and labs[i][1] == name), None)
            if hit is None:
                return None
            end = next((i for i in range(hit + 1, b) if labs[i][0] == kind or (kind == 's' and labs[i][0] == 'p')), b)
            # A first part (or first sub-part) starts where its parent does, so the stem and diagram come too.
            chain.append(chain[-1] if not any(labs[i][0] == kind for i in range(a + 1, hit)) else hit)
            a, b = hit, end
        if first is None:
            first = chain[-1]
        last_end = b
    s = labs[first]
    e = labs[last_end] if last_end < len(labs) else None
    pg = s[2]
    pw, ph = sizes[pg - 1]
    on_page = [l for l in lines if l[0] == pg]
    # The question's text runs from its first label to the next label (or the bottom of the page's text).
    if e and e[2] == pg:
        bottom = e[4] - 3
    else:
        foot = [l for l in on_page if l[2] > s[4] and not re.search(r'(Page \d+ of \d+|^\d+$|Leaving Certificate|M44)', l[5])]
        bottom = max([l[4] for l in foot] or [s[4] + 40]) + 4
    top = s[4] - 6
    left = min(36.0, s[3] - 8)
    right = pw - left
    return {'page': pg, 'box': [round(left / pw * 100, 2), round(top / ph * 100, 2), round((right - left) / pw * 100, 2),
                                round((bottom - top) / ph * 100, 2)]}


def content_box(img):
    """Everything printed on the page, as [left, top, width, height] % with a small margin. The page number at the
    foot is left out, so a half-empty page zooms to its questions."""
    g = img.convert('L')
    w, h = g.size
    small = g.resize((w // 4, h // 4))
    sw, sh = small.size
    px = small.load()
    rows = [y for y in range(sh) if sum(1 for x in range(sw) if px[x, y] < 170) > 1]
    cols = [x for x in range(sw) if sum(1 for y in range(sh) if px[x, y] < 170) > 1]
    if not rows or not cols:
        return [0, 0, 100, 100]
    # Blocks of rows with ink; a last block in the bottom 8% is the page number.
    blocks, start = [], rows[0]
    for a, b in zip(rows, rows[1:] + [None]):
        if b is None or b - a > 6:
            blocks.append((start, a))
            if b is not None:
                start = b
    if len(blocks) > 1 and blocks[-1][0] > sh * 0.92:
        blocks.pop()
    top, bottom = blocks[0][0], blocks[-1][1]
    m = 0.02
    left, right = max(0, cols[0] / sw - m), min(1, (cols[-1] + 1) / sw + m)
    top, bottom = max(0, top / sh - m), min(1, (bottom + 1) / sh + m)
    return [round(left * 100, 2), round(top * 100, 2), round((right - left) * 100, 2), round((bottom - top) * 100, 2)]


def paper_for(qid, year, qnum, pdirs):
    papers, sample = pdirs
    if qid.startswith('S'):
        return [(qid[:2].lower(), os.path.join(sample, SAMPLES[qid[:2]]))]
    files = sorted(glob.glob(os.path.join(papers, '%d_ep_*.pdf' % year)))
    if len(files) == 1:
        return [(str(year), files[0])]
    # Two booklets from 2019: 038 (A1, Sections A and B), 040 (A2, Section C).
    return [('%d%s' % (year, 'c' if '040' in f else 'a'), f) for f in files]


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    pdirs = (sys.argv[1], sys.argv[2])
    check = '--check' in sys.argv
    cache, out, missing, pages = {}, {}, [], {}
    for ch in (28, 29, 30, 31, 32):
        src = json.load(open(os.path.join(HERE, 'questions', 'ch%d.json' % ch)))
        for q in src['questions']:
            m = re.search(r'Question\s+(\d+)(.*)$', q['source'])
            y = re.match(r'(\d{4})', q['id'])
            if not m:
                missing.append(q['id'] + ' (no question number)')
                continue
            qnum, paths = int(m.group(1)), paths_of(m.group(2))
            found = None
            for key, pdf in paper_for(q['id'], int(y.group(1)) if y else 2027, qnum, pdirs):
                if pdf not in cache:
                    cache[pdf] = pdf_lines(pdf)
                got = locate(*cache[pdf], qnum, paths) or (paths and locate(*cache[pdf], qnum, []))
                if got:
                    found = (key, pdf, got)
                    break
            if not found:
                missing.append('%s  %s' % (q['id'], q['source']))
                continue
            key, pdf, got = found
            name = '%s-p%02d.webp' % (key, got['page'])
            pages[name] = (pdf, got['page'])
            out['%d/%s' % (ch, q['id'])] = {'img': 'assets/bio/papers/' + name, 'page': got['page'], 'box': got['box'],
                            'label': re.sub(r'^LC Biology HL |^SEC ', '', q['source'])}
    print(len(out), 'questions placed on', len(pages), 'pages;', len(missing), 'not found')
    for m in missing:
        print('  not found:', m)
    if check:
        return
    os.makedirs(OUT_DIR, exist_ok=True)
    content = {}
    for name, (pdf, pg) in sorted(pages.items()):
        path = os.path.join(OUT_DIR, name)
        if not os.path.exists(path) or '--render' in sys.argv:
            png = subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-scale-to-x', str(WIDTH), '-scale-to-y', '-1', '-png', pdf],
                                 capture_output=True).stdout
            Image.open(io.BytesIO(png)).convert('RGB').save(path, 'WEBP', quality=80, method=6)
        content[name] = content_box(Image.open(path))
    for v in out.values():
        v['content'] = content[os.path.basename(v['img'])]
    with open(os.path.join(ROOT, 'bio', 'papers.js'), 'w') as f:
        f.write('// Generated by tools/bio/build_bio_papers.py: the real SEC paper page for each Biology exam question\n')
        f.write('// and the box around the question on it (left, top, width, height, as % of the page).\n')
        f.write('window.BioPapers = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    size = sum(os.path.getsize(os.path.join(OUT_DIR, n)) for n in pages)
    print('wrote bio/papers.js and', len(pages), 'pages,', size // 1024, 'KB')


if __name__ == '__main__':
    main()

"""Builds Computer Science (Higher Level, chapters 6 and 7) from tools/cs/questions/ch<N>.json.

  python3 tools/cs/build_cs.py --merge             first joins the extraction agents' files
                                                   (tools/cs/questions/parts/*-ch<N>.json) into ch<N>.json
  python3 tools/cs/build_cs.py <pdf dir> [--render] writes cs/q<N>.js (window.CsQuestions[N]), cs/papers.js
                                                   (window.CsPapers['<N>/<id>'] = {img, page, box, label, parts}) and
                                                   the pages, 2055 px wide, to assets/cs/papers/<year>-p<page>.webp
The PDFs are not in the repository; their folder has <year>-hl-qp.pdf. Part boxes come from the PDF's text layer,
the same way as Maths (tools/maths/build_maths.py): "Question 8" at the margin, "(a)", then "(i)".
"""
import glob, io, json, os, subprocess, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'maths'))
import build_maths as B  # noqa: E402

B.FOOT = 775  # CS pages' footer starts at about 779 pt
OUT = os.path.join(ROOT, 'assets', 'cs', 'papers')
TITLES = {6: 'Computer systems', 7: 'Computational thinking, algorithms and data representation', 8: 'Databases'}


def keep_pictures(dest, qs):
    """The pictures (apply_scenes.py) live only in questions/ch<N>.json, so a re-merge copies them across onto the
    same question's same part, step by step, wherever the part still has that many steps."""
    if not os.path.exists(dest):
        return 0
    old = {q['id']: q for q in json.load(open(dest, encoding='utf-8')).get('questions', [])}
    kept = 0
    for q in qs:
        o = old.get(q['id'])
        if not o:
            continue
        for k, part in enumerate(q.get('parts') or []):
            if k >= len(o.get('parts') or []):
                break
            op = o['parts'][k]
            if op.get('l') != part.get('l'):
                continue
            hit = False
            if part.get('idea') and (op.get('idea') or {}).get('vis') and not part['idea'].get('vis'):
                part['idea']['vis'] = op['idea']['vis']
                hit = True
            ns, os_ = part.get('steps') or [], op.get('steps') or []
            if len(ns) == len(os_):
                for a, b in zip(ns, os_):
                    if b.get('vis') and not a.get('vis'):
                        a['vis'] = b['vis']
                        hit = True
            kept += hit
    return kept


def merge():
    for ch in (6, 7, 8):
        qs, seen = [], set()
        for f in sorted(glob.glob(os.path.join(HERE, 'questions', 'parts', '*-ch%d.json' % ch))):
            for q in json.load(open(f, encoding='utf-8')).get('questions', []):
                if q['id'] in seen:
                    print('twice:', q['id'])
                    continue
                seen.add(q['id'])
                qs.append(q)
        qs.sort(key=lambda q: (q['year'], q['q']))
        dest = os.path.join(HERE, 'questions', 'ch%d.json' % ch)
        kept = keep_pictures(dest, qs)
        if kept:
            print('ch%d: kept the pictures on %d parts' % (ch, kept))
        data = {'chapter': ch, 'title': TITLES[ch], 'questions': qs}
        with open(dest, 'w', encoding='utf-8') as fh:
            fh.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print('ch%d: %d questions, %d parts' % (ch, len(qs), sum(len(q['parts']) for q in qs)))


def render(pdf, year, pg, redo):
    name = '%d-p%02d.webp' % (year, pg)
    out = os.path.join(OUT, name)
    if redo or not os.path.exists(out):
        png = subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-scale-to-x', str(B.WIDTH), '-scale-to-y', '-1', '-png', pdf], capture_output=True).stdout
        Image.open(io.BytesIO(png)).convert('RGB').save(out, 'WEBP', quality=72, method=6)
    return 'assets/cs/papers/' + name


def main():
    if '--merge' in sys.argv:
        merge()
        return
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    redo = '--render' in sys.argv
    pdf_dir = args[0] if args else None
    os.makedirs(OUT, exist_ok=True)
    papers, problems, cache = {}, [], {}
    for path in sorted(glob.glob(os.path.join(HERE, 'questions', 'ch*.json'))):
        data = json.load(open(path, encoding='utf-8'))
        ch = data['chapter']
        with open(os.path.join(ROOT, 'cs', 'q%d.js' % ch), 'w', encoding='utf-8') as f:
            f.write('// Built by tools/cs/build_cs.py from tools/cs/questions/ch%d.json. Do not edit by hand.\n' % ch)
            f.write('window.CsQuestions = window.CsQuestions || {};\n')
            f.write('window.CsQuestions[%d] = %s;\n' % (ch, json.dumps(data, ensure_ascii=False, separators=(',', ':'))))
        if not pdf_dir:
            continue
        for q in data['questions']:
            pdf = os.path.join(pdf_dir, '%d-hl-qp.pdf' % q['year'])
            if pdf not in cache:
                cache[pdf] = B.lines_of(pdf)
            pages, sizes = cache[pdf]
            qbox, parts = B.boxes(q, pages, sizes)
            for k, p in enumerate(parts):
                if not p['found'] and q['parts'][k]['l']:
                    problems.append('%d/%s %s: label not found (uses the whole question)' % (ch, q['id'], q['parts'][k]['l']))
            papers['%d/%s' % (ch, q['id'])] = {
                'img': render(pdf, q['year'], q['pages'][0], redo), 'page': q['pages'][0], 'box': qbox,
                'label': 'Leaving Certificate %d, Computer Science Higher Level, Question %d' % (q['year'], q['q']),
                'parts': [{'img': render(pdf, q['year'], p['page'], redo), 'page': p['page'], 'box': p['box']} for p in parts]}
    if pdf_dir:
        with open(os.path.join(ROOT, 'cs', 'papers.js'), 'w', encoding='utf-8') as f:
            f.write("// Built by tools/cs/build_cs.py: each question's real paper page and where it and its parts are.\n")
            f.write('window.CsPapers = %s;\n' % json.dumps(papers, separators=(',', ':')))
    for p in problems:
        print(p)
    print('%d questions on the desk, %d problems' % (len(papers), len(problems)))


if __name__ == '__main__':
    main()

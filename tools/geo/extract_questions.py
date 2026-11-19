# Pulls every 30-mark physical geography question (Section 1 / Core: Patterns and Processes in the Physical
# Environment, Questions 1-3, parts B and C) and every question on colonialism out of the Higher Level papers,
# with the marking scheme's rules for each. Reads geo-src/txt/hl-<year>-<part>-qp.txt and -ms.txt.
# Usage: python3 -I geo-extract.py <geo-src dir> <out.json>
import json, os, re, sys

src, out = sys.argv[1], sys.argv[2]
T = os.path.join(src, 'txt')
PAPERS = []
for f in sorted(os.listdir(T)):
    m = re.match(r'hl-(\d{4})-(\d)-qp\.txt$', f)
    if not m: continue
    y, part = int(m.group(1)), m.group(2)
    if (y, part) in ((2025, '2'),): continue                      # the Irish-language copy
    ms = os.path.join(T, 'hl-%d-%s-ms.txt' % (y, part))
    PAPERS.append((y, part, os.path.join(T, f), ms if os.path.exists(ms) else None))

def clean(s):
    s = s.replace('¾', '-').replace('', '-').replace('•', '-')
    s = re.sub(r'Page \d+ of \d+', ' ', s)
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()

HEAD_NEW = re.compile(r'^\s*(\d{1,2})([ABC])\.\s+(\S.*?)\s*$')
HEAD_OLD = re.compile(r'^\s*([ABC])\.?\s+([A-Z][^\n]*?)\s*$')
QLINE = re.compile(r'^\s*Question\s+(\d{1,2})\s*$', re.I)

def parts_of(text):
    """Split the Part Two of a paper into (question number, part letter, title, body)."""
    lines = text.split('\n'); res = []; qn = None; cur = None
    for ln in lines:
        mq = QLINE.match(ln)
        if mq: qn = int(mq.group(1));
        mh = HEAD_NEW.match(ln)
        if mh and 1 <= int(mh.group(1)) <= 30:
            if cur: res.append(cur)
            qn = int(mh.group(1)); cur = [qn, mh.group(2), mh.group(3), []]; continue
        mo = HEAD_OLD.match(ln)
        if mo and qn is not None and len(mo.group(2)) < 70 and not re.search(r'[.?:;,]$', mo.group(2).strip()) and not re.search(r'\[\d', mo.group(2)):
            if cur: res.append(cur)
            cur = [qn, mo.group(1), mo.group(2).title() if mo.group(2).isupper() else mo.group(2), []]; continue
        if mq:
            if cur: res.append(cur); cur = None
            continue
        if cur: cur[3].append(ln)
    if cur: res.append(cur)
    out = []
    for qn, letter, title, body in res:
        b = '\n'.join(body)
        mk = re.search(r'\[(\d{2})\s*m(arks)?\]', b)
        if not mk: continue
        out.append({'q': qn, 'part': letter, 'title': clean(title), 'text': clean(b[:mk.start()]), 'marks': int(mk.group(1))})
    return out

def part_two(text):
    # Part Two starts at the first long-question section (the second time Question 1 begins in newer papers).
    i = [m.start() for m in re.finditer(r'(?m)^\s*(Question\s+1\s*$|1A\.\s)', text)]
    return text[i[-1]:] if i else text

def scheme_for(ms, qn, letter, qtext=''):
    """The scheme's part for a question: found by the question's own words, which every scheme repeats."""
    if not ms: return ''
    t = open(ms, encoding='utf8', errors='replace').read()
    flat = re.sub(r'\s+', ' ', t)
    words = re.sub(r'\s+', ' ', qtext).strip()
    for n in (60, 40, 28):
        key = words[:n]
        i = flat.find(key) if len(key) >= 20 else -1
        if i >= 0: break
    if i < 0:
        m = re.search(r'(?<![0-9])%d%s\.?\s' % (qn, letter), flat)
        if not m: return ''
        i = m.start()
    seg = flat[i:i + 3500]
    # up to the next part: a heading like "1C. Title", "C TITLE", "C. Title" or "Question 3"
    nxt = re.search(r'\s(\d{1,2}[ABC]\.\s+[A-Z]|[ABC]\.?\s+[A-Z][A-Za-z]+[ A-Z&]{0,30}\s+[A-Z][a-z].{0,200}?\[(20|30)m\]|[ABC]\s+[A-Z]{4,}[A-Z &\-]*\s|Question\s+\d+\s)', seg[len(words[:60]) + 40:])
    if nxt: seg = seg[:len(words[:60]) + 40 + nxt.start()]
    return seg.strip() if re.search(r'SRP|mark', seg, re.I) else ''

rows = []
for y, part, qp, ms in PAPERS:
    text = open(qp, encoding='utf8', errors='replace').read()
    for p in parts_of(part_two(text)):
        phys = 1 <= p['q'] <= 3 and p['part'] in 'BC' and p['marks'] == 30
        colo = bool(re.search(r'coloni', p['title'] + ' ' + p['text'], re.I))
        if not (phys or colo): continue
        p.update({'year': y, 'paper': part, 'kind': 'physical' if phys else 'colonialism', 'scheme': scheme_for(ms, p['q'], p['part'], p['text'])})
        rows.append(p)
json.dump(rows, open(out, 'w'), indent=1, ensure_ascii=False)
from collections import Counter
print(len(rows), 'questions', Counter(r['kind'] for r in rows), '| years', sorted(Counter(r['year'] for r in rows).items()))
print('no scheme found for', [(r['year'], '%d%s' % (r['q'], r['part'])) for r in rows if not r['scheme']])

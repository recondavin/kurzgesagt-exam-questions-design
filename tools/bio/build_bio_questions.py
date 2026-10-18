"""Builds bio/q<chapter>.js: the real Leaving Cert Biology Higher Level exam questions for each chapter.

Source: tools/bio/questions/ch<N>.json, extracted from the SEC papers and marking schemes (2004-2026 and the
two 2027 sample papers). This turns each marking-scheme point into words the site can look for in a typed
answer (k: alternatives, each a list of word stems and how many of them must appear), decides how each part
is answered (one box, a box per letter or number, a tick list for drawings, tapping the diagram, true/false),
and works out which diagram a question shows and where its letters go (each chapter's diagrams, anchor words and
per-question OVERRIDES are in tools/bio/chapters/ch<N>.py).
Run: python3 tools/bio/build_bio_questions.py [chapter ...]   (no chapter: all of them)
"""
import importlib, json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
STOP = set('the a an of to and or in on at is are was were be been by for with as that this these those it its their there they them from into '
           'than then so such which who what when where can could will would may might has have had not no also very more most much some any '
           'each other over under about after before during while because between both but if until e.g eg i.e ie etc accept allow named name '
           'explained explain described describe correct answer answers mark marks reference ref given one two three four five six '
           # Filler nouns a student can swap for another word ("undigested material" / "undigested food").
           'material materials substance substances thing things stuff matter part parts item items way ways'.split())
SYNONYMS = {'big': 'large', 'huge': 'large', 'tiny': 'small', 'lots': 'many', 'quick': 'fast', 'quicker': 'faster', 'o2': 'oxygen', 'h2o': 'water'}
# Two-word names written as one (the same list in bio/bio.js).
PHRASES = [(re.compile(r'carbon\s*dioxide'), 'co2'), (re.compile(r'rib\s+cage'), 'ribcage')]
WORDS = re.compile(r"[a-z0-9]+")


def words(text):
    text = text.lower().replace("'", '').replace('’', '')
    for pat, one in PHRASES:
        text = pat.sub(one, text)
    return [SYNONYMS.get(w, w) for w in WORDS.findall(text)]


# Word endings: the same rules run in bio/bio.js (bioStem) on what students type, so a key word and a typed
# word meet in the middle ("filtered", "filtration" -> "filt"/"filtr", matched by their shared start).
SUFFIXES = ['ation', 'ition', 'tion', 'sion', 'ment', 'ing', 'ous', 'ive', 'ed', 'er', 'ly', 'al']


def stem(w):
    if w.isdigit() or len(w) <= 3:
        return w
    if len(w) > 4 and w.endswith('ies'):
        w = w[:-3] + 'y'
    elif len(w) > 4 and (w.endswith('ches') or w.endswith('shes') or w.endswith('xes') or w.endswith('ses')):
        w = w[:-2]
    elif w.endswith('s') and not w.endswith(('ss', 'us', 'is')):
        w = w[:-1]
    for suf in SUFFIXES:
        if w.endswith(suf) and len(w) - len(suf) >= 4:
            return w[:-len(suf)]
    return w


def clean(answer, key=False):
    """The answer text without scheme notation: leading field markers, stars, 'Diagram:' and the like.
    For key words, a leading 'Term:' (the thing being defined or described) goes too."""
    a = answer.strip()
    a = re.sub(r'^\*+', '', a)
    a = re.sub(r'^(?:[A-Z]|\d{1,2})\s*(?:[=:.)]|\s-)\s*', '', a)
    a = re.sub(r'^(?:Diagram|Drawing|Labels?|Label)\s*:\s*', '', a, flags=re.I)
    if key:
        a = re.sub(r"^\(?[A-Za-z][A-Za-z' ]{2,30}\)?\s*:\s+", '', a)
    a = a.replace('*', '')
    return a.strip()


def field_of(answer):
    m = re.match(r'^\*?\s*([A-Z]|\d{1,2})\s*(?:[=:.)]|\s-)\s', answer.strip() + ' ')
    return m.group(1) if m else None


def alternatives(answer):
    """Key words for a point: one alternative per 'or' / '/' option, parenthesised words optional."""
    a = clean(answer, True)
    a = re.sub(r'\([^)]*\)', ' ', a)
    alts = []
    for part in re.split(r'\s+or\s+|\s*/\s*|\s*;\s*', a):
        ws = [w for w in words(part) if w not in STOP and (len(w) > 2 or w.isdigit())]
        if not ws:
            single = words(part)
            if len(single) == 1 and len(single[0]) == 1:
                ws = single  # a diagram letter, like "B"
            else:
                continue
        seen = []
        for w in ws:
            s = stem(w)
            if s not in seen:
                seen.append(s)
        # Short points need every key word ("porous capillary walls" without "porous" is a different point);
        # longer ones all but one, and long explanations 70% of them.
        need = len(seen) if len(seen) <= 3 else len(seen) - 1 if len(seen) <= 5 else math.ceil(len(seen) * 0.7)
        alts.append({'w': seen, 'n': need})
    return alts


def rule_count(rule, part):
    """How many points count towards the part's marks."""
    r = (rule or '').lower()
    m = re.search(r'any\s+(one|two|three|four|five|six)', r)
    if m:
        return ['one', 'two', 'three', 'four', 'five', 'six'].index(m.group(1)) + 1
    m = re.match(r'\s*(\d+)\s*\(\s*\d+\s*\)\s*$', r)
    if m:
        return int(m.group(1))
    pts = part['points']
    if part.get('marks') and all(p.get('marks') for p in pts):
        total, n = 0, 0
        for p in sorted(pts, key=lambda p: -p['marks']):
            if total >= part['marks']:
                break
            total += p['marks']
            n += 1
        return n
    return len(pts)


def kind_of(part):
    text = part['text'].lower()
    pts = part['points']
    if re.search(r'\bt\s+f\b|true or false|\(true\)|\(false\)', text) or all(clean(p['answer']).lower() in ('true', 'false') for p in pts):
        return 'tf'
    if re.match(r'^\s*(?:\d\.\s*)?draw', text) and not re.search(r'on the diagram|arrow on|line from', text):
        return 'draw'
    if re.search(r'on the diagram|line from the|indicate clearly on|write the letter', text):
        return 'tap'
    fields = [field_of(p['answer']) for p in pts]
    if len(pts) > 1 and all(fields) and len(set(fields)) > 1:
        return 'fields'
    return 'text'


def chapter_module(ch, own=True):
    """tools/bio/chapters/ch<N>.py: the chapter's diagrams, the words naming their anchors, and its OVERRIDES."""
    if not os.path.exists(os.path.join(HERE, 'chapters', 'ch%d.py' % ch)):
        return None
    if own:
        return importlib.import_module('chapters.ch%d' % ch)
    try:
        return importlib.import_module('chapters.ch%d' % ch)
    except Exception as err:  # another chapter's file mid-edit shouldn't stop this one
        print('  (skipped chapters/ch%d.py: %s)' % (ch, err))
        return None


def chapter_bits(ch):
    mods = [chapter_module(ch)] + [chapter_module(n, False) for n in CHAPTERS if n != ch]
    anchor_words = {}
    for m in mods:
        if m is not None:
            for base, keys in getattr(m, 'ANCHOR_WORDS', {}).items():
                anchor_words.setdefault(base, keys)
    own = mods[0]

    def base_of(what):
        # The chapter's own diagrams first, then another chapter's (an alveolus in an immunity question).
        for m in mods:
            b = m and hasattr(m, 'base_of') and m.base_of(what)
            if b:
                return b
        return None
    return base_of, anchor_words, (getattr(own, 'OVERRIDES', {}) if own else {})


def anchor_for(anchor_words, base, text):
    # The structure's own name comes first; words in brackets ("traced from Bowman's capsule") only if nothing else matches.
    for t in (text.split('(')[0].lower(), text.lower()):
        for name, keys in anchor_words.get(base, []):
            if any(k in t for k in keys):
                return name
    return None


def diagram_of(q, overrides, base_of, anchor_words):
    if q['id'] in overrides.get('dia', {}):
        return overrides['dia'][q['id']]
    d = q.get('diagram')
    if not d:
        return None
    base = base_of(d.get('what', ''))
    if not base:
        return {'note': d.get('what', '')}
    marks, missing = [], []
    for key, desc in (d.get('labels') or {}).items():
        letter = re.match(r'^([A-Z]|\d{1,2})$', key.strip())
        given = 'given' in desc.lower()
        if not letter and not given:
            continue
        a = anchor_for(anchor_words, base, key if given else desc)
        if not a:
            missing.append(key)
            continue
        marks.append({'t': key if letter else key, 'a': a, 'given': given})
    out = {'base': base, 'marks': marks}
    if missing:
        out['missing'] = missing
    return out


CHAPTERS = (28, 29, 30, 31, 32)


def build(ch):
    src = json.load(open(os.path.join(HERE, 'questions', 'ch%d.json' % ch)))
    base_of, anchor_words, ov = chapter_bits(ch)
    out = []
    for q in src['questions']:
        y = re.match(r'(\d{4})', q['id'])
        rec = {'id': q['id'], 'src': q['source'], 'year': int(y.group(1)) if y else 2027, 'sec': q['section'],
               'fresh': q.get('new_course', 'yes'), 'why': q.get('why', ''), 'stem': q.get('stem', ''), 'parts': []}
        dia = diagram_of(q, ov, base_of, anchor_words)
        if dia:
            rec['dia'] = dia
        for p in q['parts']:
            pid = q['id'] + p['label'].split()[0]
            kind = ov.get('kind', {}).get(pid) or kind_of(p)
            if pid in ov.get('tap', {}):
                kind = 'tap'
            max_n = rule_count(p.get('rule'), p)
            per = None if p.get('marks') is None else None
            pts = []
            for j, pt in enumerate(p['points']):
                item = {'a': pt['answer'], 'm': pt.get('marks')}
                f = field_of(pt['answer'])
                if kind == 'fields' and f:
                    item['f'] = f
                alts = alternatives(pt['answer'])
                fix = ov.get('points', {}).get(pid, {}).get(j)  # the chapter's own keys, or 'self'
                if fix == 'self':
                    alts = None
                elif fix:
                    alts = fix
                    item['own'] = True  # keys written for the chapter, not from the scheme's wording
                if alts and kind != 'draw':
                    item['k'] = alts
                else:
                    item['self'] = True  # the student ticks it (drawings, or answers the words can't pin down)
                pts.append(item)
            part = {'l': p['label'], 'q': p['text'], 'm': p.get('marks'), 'n': max_n, 'kind': kind, 'pts': pts}
            if pid in ov.get('tap', {}):
                part['tap'] = ov['tap'][pid]
            if p.get('rule'):
                part['rule'] = p['rule']
            if p.get('scheme_note'):
                part['note'] = p['scheme_note']
            if p.get('unofficial'):
                part['unofficial'] = True
            if p.get('outcomes'):
                part['out'] = p['outcomes']
            rec['parts'].append(part)
        out.append(rec)
    out.sort(key=lambda r: (-r['year'], r['id']))
    return {'chapter': ch, 'topic': src['topic'], 'questions': out, 'notCovered': src.get('not_covered', []),
            'diagrams': src.get('diagrams_to_memorise', [])}


def main():
    os.makedirs(os.path.join(HERE, '..', '..', 'bio'), exist_ok=True)
    for ch in [int(a) for a in sys.argv[1:]] or CHAPTERS:
        data = build(ch)
        path = os.path.join(HERE, '..', '..', 'bio', 'q%d.js' % ch)
        with open(path, 'w') as f:
            f.write('// Generated by tools/bio/build_bio_questions.py from tools/bio/questions/ch%d.json: real SEC exam questions\n' % ch)
            f.write('// and their marking-scheme points (k = the words a typed answer needs, n = how many of them).\n')
            f.write('window.BioQuestions = window.BioQuestions || {};\nwindow.BioQuestions[%d] = ' % ch + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
        kinds = {}
        for q in data['questions']:
            for p in q['parts']:
                kinds[p['kind']] = kinds.get(p['kind'], 0) + 1
        print('chapter', ch, len(data['questions']), 'questions', kinds, os.path.getsize(path) // 1024, 'KB')


if __name__ == '__main__':
    main()

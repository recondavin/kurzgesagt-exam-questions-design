"""Builds eng/eng-data.js for english.html (the Leaving Cert English comparative study) from:

  tools/eng/comparative.json        the modes, the marking criteria, the essay structure (PACE) and the language bank
  tools/eng/texts/<id>.json         each text's notes: key moments and points for every mode (sive, othello, shawshank, stlt)
  tools/eng/research/questions.json real past Higher Level comparative questions (optional)
  tools/eng/research/picks.json     each question in normal English, and the key moments to use from each text (optional)
  assets/eng/img/credits.json       free-licence pictures for the texts, with their credits (optional)
  tools/eng/games.json              the games' content: link, level, chains, spot (optional; see eng/eng-games.js)
  tools/eng/compare.json            the interactive comparative: a theme as a 30 + 40 question (optional; #compare)

It checks each text: the fields every page uses, 8+ key moments, every point anchored in a key moment that exists
([id] in the point), all three modes covered. Run: python3 tools/eng/build_eng.py
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
ORDER = ['sive', 'othello', 'shawshank', 'stlt']


def load(path, default=None):
    full = os.path.join(ROOT, path)
    if not os.path.exists(full):
        return default
    with open(full, encoding='utf-8') as f:
        return json.load(f)


def check_text(t, problems):
    need = ['id', 'title', 'author', 'kind', 'setting', 'gist', 'people', 'moments', 'modes']
    missing = [k for k in need if not t.get(k)]
    if missing:
        problems.append('%s: missing %s' % (t.get('id'), ', '.join(missing)))
        return
    ids = {m['id'] for m in t['moments']}
    if len(t['moments']) < 8:
        problems.append('%s: only %d key moments' % (t['id'], len(t['moments'])))
    for m in t['moments']:
        for k in ('id', 'title', 'where', 'what', 'why', 'modes'):
            if not m.get(k):
                problems.append('%s %s: moment without %s' % (t['id'], m.get('id'), k))
    modes = t['modes']
    for mode in ('theme', 'cc', 'gvv'):
        if mode not in modes:
            problems.append('%s: no %s notes' % (t['id'], mode))
    groups = [(g['name'], g['points']) for g in modes.get('theme', {}).get('themes', [])] + \
             [(g['name'], g['points']) for g in modes.get('cc', {}).get('aspects', [])] + \
             [('vision', modes.get('gvv', {}).get('points', []))]
    for name, points in groups:
        for p in points:
            for ref in re.findall(r'\[([a-z]+-\d+)\]', p):
                if ref not in ids:
                    problems.append('%s %s: point cites [%s], which is not a key moment' % (t['id'], name, ref))


# Free licences, and film stills and stage photos kept for the user's own study (the user: "its for me for now").
LICENCES = ('Public domain', 'CC0', 'CC BY 2.0', 'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'Free Art Licence', 'Copyright: used here for study')


def check_pictures(pics, texts, problems):
    """Every picture: a text, a free licence, a source, a caption; its key moment and each spot's are real; spots on it."""
    for p in pics:
        where = 'picture %s' % p['file']
        if p.get('text') not in texts: problems.append('%s: unknown text %r' % (where, p.get('text')))
        if p.get('licence') not in LICENCES: problems.append('%s: licence %r is not one of %s' % (where, p.get('licence'), ', '.join(LICENCES)))
        if not (p.get('source', '').startswith('https://') and p.get('author') and p.get('title') and p.get('caption')):
            problems.append('%s: needs a title, author, https source and caption' % where)
        ids = {m['id'] for m in texts.get(p.get('text'), {}).get('moments', [])}
        for m in [p.get('moment')] + [s.get('moment') for s in p.get('spots', [])]:
            if m and m not in ids: problems.append('%s: key moment %r does not exist' % (where, m))
        for s in p.get('spots', []):
            if not (0 <= s['x'] <= 100 and 0 <= s['y'] <= 100 and s.get('label') and s.get('note')):
                problems.append('%s: spot %r needs a place on the picture, a label and a note' % (where, s.get('label')))


def check_games(g, texts, problems):
    known = set(texts)
    for kind in ('link', 'level', 'chains', 'spot'):
        for n, it in enumerate(g.get(kind, [])):
            where = 'games %s %d' % (kind, n + 1)
            bad = [t for t in it.get('texts', []) if t not in known]
            if not it.get('texts') or bad:
                problems.append('%s: texts %s' % (where, bad or 'missing'))
            if kind == 'link' and not (it.get('a', {}).get('s') and it.get('b', {}).get('s') and it.get('rel') in ('same', 'differ', 'degree') and it.get('link') and it.get('why')):
                problems.append('%s: needs a, b, rel, link and why' % where)
            if kind == 'level':
                st = it.get('steps', [])
                if not it.get('statement') or len(st) != 2 or any(len(lv) < 3 or len(lv[0]) != 1 or any(len(o) < 2 or o[1] not in 'fovw' for o in lv[1:]) for lv in st):
                    problems.append('%s: needs a statement and two levels of [right], [trap, f|o|v|w, why]' % where)
            if kind == 'chains' and not (it.get('title') and len(it.get('steps', [])) >= 4 and it.get('why')):
                problems.append('%s: needs a title, 4+ steps and why' % where)
            if kind == 'spot' and not (len(it.get('lines', [])) >= 4 and 0 <= it.get('weak', -1) < len(it.get('lines', [])) and it.get('kind') and it.get('why')):
                problems.append('%s: needs 4+ lines, weak, kind and why' % where)


def check_compare(cmp, texts, problems):
    """Each theme: a best text for part (a), 3+ points for each text with real moments, and links between real moments
    of two different texts (each pair once, rel same, differ or degree, with an aspect and a model sentence), 4+ for
    every pair of texts, and a closing judgement for every pair."""
    for th in cmp.get('themes', []):
        where = 'compare %s' % th.get('id')
        if not (th.get('id') and th.get('name') and th.get('what') and th.get('bestWhy')):
            problems.append('%s: needs id, name, what and bestWhy' % where)
        tids = sorted(th.get('points', {}))
        if th.get('best') not in tids:
            problems.append('%s: best should be one of its texts' % where)
        for tid in tids:
            t = texts.get(tid)
            if not t:
                problems.append('%s: unknown text %r' % (where, tid))
                continue
            pts = th['points'][tid]
            if len(pts) < 3:
                problems.append('%s %s: needs 3+ points for part (a)' % (where, tid))
            for pt in pts:
                if not (pt.get('title') and pt.get('say') and pt.get('m')) or any(not 1 <= n <= len(t['moments']) for n in pt['m']):
                    problems.append('%s %s %r: needs a title, say and real moments' % (where, tid, pt.get('title')))
        # The writing guide (part (a)): for each scene, details for the anchor, what it represents (title, say, start and
        # ideas) and exactly 10 words with their meanings; an opening and an ending, each in three parts with a label, a
        # hint and ideas (or ideas made from your scenes: auto), and 10 words; and the words to use instead of 'shows'.
        if th.get('write') and len(th.get('instead', [])) < 8:
            problems.append('%s: needs 8+ words to use instead of shows' % where)
        for tid, wr in th.get('write', {}).items():
            t = texts.get(tid)
            if tid not in tids or not t:
                problems.append('%s write: %r is not one of its texts' % (where, tid))
                continue
            for n, sc in wr.get('scenes', {}).items():
                if not n.isdigit() or not 1 <= int(n) <= len(t['moments']):
                    problems.append('%s write %s: no key moment %s' % (where, tid, n))
                if not sc.get('reps') or any(not (r.get('title') and r.get('say') and r.get('start') and len(r.get('ideas', [])) >= 2) for r in sc['reps']):
                    problems.append('%s write %s %s: each thing it represents needs a title, say, start and 2+ ideas' % (where, tid, n))
                if len(sc.get('details', [])) < 2:
                    problems.append('%s write %s %s: needs 2+ details for the anchor' % (where, tid, n))
                tq = sc.get('techniques', [])
                if len(tq) < 2 or any(not (q.get('name') and q.get('say') and q.get('what')) or re.search(r'\bshow', q['say'], re.I) for q in tq):
                    problems.append('%s write %s %s: needs 2+ film techniques (name, say without "show", what)' % (where, tid, n))
                for r in sc.get('reps', []):
                    if not (0 <= r.get('d', -1) < len(sc.get('details', [])) and 0 <= r.get('t', -1) < len(tq)):
                        problems.append('%s write %s %s %r: d and t must point at one of its details and techniques' % (where, tid, n, r.get('title')))
                if len(sc.get('words', [])) != 10 or any(len(x) != 2 or not x[0] or not x[1] for x in sc['words']):
                    problems.append('%s write %s %s: needs exactly 10 words, each with its meaning' % (where, tid, n))
            for part, keys in (('open', ['film', 'idea', 'points']), ('end', ['sum', 'final', 'last'])):
                x = wr.get(part, {})
                if [pt.get('k') for pt in x.get('parts', [])] != keys or len(x.get('words', [])) != 10 or \
                        any(not (pt.get('label') and pt.get('hint') and (pt.get('ideas') or pt.get('auto'))) for pt in x.get('parts', [])):
                    problems.append('%s write %s: the %s needs parts %s (label, hint, ideas or auto) and 10 words' % (where, tid, part, ', '.join(keys)))
        ids = {m['id']: tid for tid in tids if tid in texts for m in texts[tid]['moments']}
        seen, per = set(), {}
        for ln in th.get('links', []):
            ta, tb = ids.get(ln.get('a')), ids.get(ln.get('b'))
            if not ta or not tb or ta == tb:
                problems.append('%s link %s-%s: moments of two different texts' % (where, ln.get('a'), ln.get('b')))
                continue
            key = tuple(sorted([ln['a'], ln['b']]))
            if key in seen:
                problems.append('%s link %s-%s: twice' % (where, ln['a'], ln['b']))
            seen.add(key)
            if ln.get('rel') not in ('same', 'differ', 'degree') or not ln.get('aspect') or not ln.get('say'):
                problems.append('%s link %s-%s: needs rel (same, differ, degree), aspect and say' % (where, ln['a'], ln['b']))
            pair = '|'.join(sorted([ta, tb]))
            per[pair] = per.get(pair, 0) + 1
        for i, x in enumerate(tids):
            for y in tids[i + 1:]:
                pair = '%s|%s' % (x, y)
                if per.get(pair, 0) < 4:
                    problems.append('%s: only %d links between %s and %s' % (where, per.get(pair, 0), x, y))
                if not th.get('ends', {}).get(pair):
                    problems.append('%s: no closing judgement for %s' % (where, pair))


def qkey(q):
    return '%s-%s-%s-%s' % (q['year'], q['paper'], q['mode'], 'split' if isinstance(q['marks'], list) else '70')


def add_picks(questions, picks, texts, problems):
    """Puts each question's plain English, theme, best text for (a), note and key moments (as moment ids) on it."""
    by = {qkey(q): q for q in questions}
    for p in picks:
        q = by.get(p['key'])
        if not q:
            problems.append('picks %s: no such question' % p['key'])
            continue
        split = isinstance(q['marks'], list)
        plain = p.get('plain')
        if not plain or split != isinstance(plain, dict) or (split and not (plain.get('a') and plain.get('b'))):
            problems.append('picks %s: plain should be %s' % (p['key'], '{a, b}' if split else 'one sentence'))
        if (q['mode'] == 'theme') != bool(p.get('theme')):
            problems.append('picks %s: a theme goes with Theme or Issue questions only' % p['key'])
        if split and p.get('best') not in p.get('picks', {}):
            problems.append('picks %s: best (the text for part (a)) should be one of its texts' % p['key'])
        out = {}
        for tid, k in p.get('picks', {}).items():
            t = texts.get(tid)
            if not t:
                problems.append('picks %s: unknown text %r' % (p['key'], tid))
                continue
            if not k.get('why') or not (k.get('skip') or k.get('m')):
                problems.append('picks %s %s: needs moments (m) or skip, and why' % (p['key'], tid))
            ms = []
            for n in k.get('m', []):
                if not 1 <= n <= len(t['moments']):
                    problems.append('picks %s %s: no key moment %s' % (p['key'], tid, n))
                else:
                    ms.append(t['moments'][n - 1]['id'])
            out[tid] = {'m': ms, 'why': k.get('why', '')}
            if k.get('skip'):
                out[tid]['skip'] = True
        q['plain'] = plain
        q['picks'] = out
        for f in ('theme', 'best', 'note'):
            if p.get(f):
                q[f] = p[f]
    missing = [qkey(q) for q in questions if 'picks' not in q]
    if picks and missing:
        problems.append('picks: none for %s' % ', '.join(missing))


def main():
    problems = []
    comp = load('tools/eng/comparative.json')
    texts = {}
    for tid in ORDER:
        t = load('tools/eng/texts/%s.json' % tid)
        if t is None:
            print('%s: no notes yet' % tid)
            continue
        check_text(t, problems)
        texts[tid] = t
    questions = [q for q in load('tools/eng/research/questions.json', []) if q.get('mode') in ('theme', 'cc', 'gvv')]
    add_picks(questions, load('tools/eng/research/picks.json', {}).get('picks', []), texts, problems)
    games = load('tools/eng/games.json', {})
    glossary = load('tools/eng/glossary.json', {}).get('terms', [])
    seen = set()
    for g in glossary:
        if g['id'] in seen: problems.append('glossary: %s twice' % g['id'])
        seen.add(g['id'])
        if g.get('kind') not in ('task', 'topic', 'word') or not g.get('match') or not g.get('def') or not g.get('term'):
            problems.append('glossary %s: needs kind (task, topic or word), match, term and def' % g['id'])
        for t in g.get('eg', {}):
            if t not in ORDER: problems.append('glossary %s: an example for %r, not one of the texts' % (g['id'], t))
    check_games(games, texts, problems)
    compare = load('tools/eng/compare.json', {})
    check_compare(compare, texts, problems)
    credits = load('assets/eng/img/credits.json', [])
    credits = [c for c in credits if os.path.exists(os.path.join(ROOT, 'assets', 'eng', 'img', c['file']))]
    check_pictures(credits, texts, problems)
    data = {'comparative': comp, 'order': [t for t in ORDER if t in texts], 'texts': texts,
            'questions': questions, 'images': credits, 'games': games, 'glossary': glossary,
            'compare': compare.get('themes', [])}
    with open(os.path.join(ROOT, 'eng', 'eng-data.js'), 'w', encoding='utf-8') as f:
        f.write('// Generated by tools/eng/build_eng.py from tools/eng/ (comparative.json, texts/, research/) and assets/eng/img/credits.json.\n')
        f.write('window.EngData = %s;\n' % json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    for p in problems:
        print(p)
    print('texts: %s; questions: %d; pictures: %d; games: %s' % (', '.join(data['order']) or 'none', len(data['questions']), len(credits),
          ', '.join('%s %d' % (k, len(v)) for k, v in games.items()) or 'none'))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()

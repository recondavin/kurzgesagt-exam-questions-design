"""Builds eng/eng-data.js for english.html (the Leaving Cert English comparative study) from:

  tools/eng/comparative.json        the modes, the marking criteria, the essay structure (PACE) and the language bank
  tools/eng/texts/<id>.json         each text's notes: key moments and points for every mode (sive, othello, shawshank, stlt)
  tools/eng/research/questions.json real past Higher Level comparative questions (optional)
  assets/eng/img/credits.json       free-licence pictures for the texts, with their credits (optional)
  tools/eng/games.json              the games' content: link, level, chains, spot (optional; see eng/eng-games.js)

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
    questions = load('tools/eng/research/questions.json', [])
    games = load('tools/eng/games.json', {})
    check_games(games, texts, problems)
    credits = load('assets/eng/img/credits.json', [])
    credits = [c for c in credits if os.path.exists(os.path.join(ROOT, 'assets', 'eng', 'img', c['file']))]
    check_pictures(credits, texts, problems)
    data = {'comparative': comp, 'order': [t for t in ORDER if t in texts], 'texts': texts,
            'questions': [q for q in questions if q.get('mode') in ('theme', 'cc', 'gvv')], 'images': credits, 'games': games}
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

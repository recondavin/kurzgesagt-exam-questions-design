"""Checks the maths game cards (tools/maths/cards/*.json, written to tools/maths/GAMES.md) and writes
maths/maths-cards.js: window.MathsCards = {10: [cards], 11: [...], ...} (the real exam parts) and window.MathsWarm
(the Warm-up level's basics, from the files with "warm": true), read by maths/maths-deck.js for the games.

  python3 tools/maths/build_cards.py            check every file and write maths/maths-cards.js
  python3 tools/maths/build_cards.py --check    check only (also: --only <file> to check one file)
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
FIELDS = ['id', 'from', 'q', 'right', 'wrong', 'why']
TEXISH = re.compile(r'\$|\\[a-zA-Z]+|\^\{|_\{')


def parts_of():
    """Every real part: (chapter, question id) -> {part label: the part's own book chapter}."""
    out = {}
    for path in glob.glob(os.path.join(HERE, 'questions', 'ch*.json')):
        d = json.load(open(path, encoding='utf-8'))
        for q in d['questions']:
            out[(d['chapter'], q['id'])] = {p['l']: p.get('chapter') for p in q['parts']}
    return out


def topic(ch, part_ch):
    """The game slot a card goes in: its part's own chapter (10-14; 15, Statistics II, goes with 14), else the
    chapter its question is filed under (parts on functions, algebra, geometry)."""
    if part_ch in (10, 11, 12, 13, 14):
        return part_ch
    if part_ch == 15:
        return 14
    return ch


def norm(s):
    return re.sub(r'\s+', '', str(s)).lower()


def check_card(c, ch, real, seen, warm=False):
    p = []
    where = c.get('id', '?')
    for f in FIELDS:
        if not c.get(f):
            p.append('missing ' + f)
    if p:
        return p
    if c['id'] in seen:
        p.append('id used twice')
    seen.add(c['id'])
    bits = c['id'].split(':')
    if warm:
        if len(bits) != 3 or bits[0] != 'warm' or bits[1] != str(ch) or c['from'] != 'warm':
            p.append('a warm-up card\'s id is warm:<chapter>:<n>, from = "warm"')
        if c.get('lvl') not in (1, 2):
            p.append('lvl must be 1 or 2')
    elif len(bits) != 3 or bits[0] != c['from']:
        p.append('id should be <question id>:<part label>:<n>, from = the question id')
    elif (ch, c['from']) not in real:
        p.append('no question %s in chapter %s' % (c['from'], ch))
    elif bits[1] not in real[(ch, c['from'])]:
        p.append('no part %s in %s' % (bits[1], c['from']))
    if not isinstance(c['wrong'], list) or len(c['wrong']) != 3:
        p.append('wrong needs exactly 3 options')
    else:
        opts = [c['right']] + c['wrong']
        if len({norm(o) for o in opts}) != 4:
            p.append('the four options are not all different')
        for o in opts:
            if len(str(o)) > 60:
                p.append('option too long (%d): %s' % (len(str(o)), str(o)[:40]))
    if len(c['q']) > 300:
        p.append('question too long (%d)' % len(c['q']))
    if len(c['why']) > 230:
        p.append('why too long (%d)' % len(c['why']))
    if c.get('hook') and len(c['hook']) > 110:
        p.append('hook too long (%d)' % len(c['hook']))
    for k in c.get('keys') or []:
        if k not in c['why']:
            p.append('key "%s" is not in why' % k)
    for f in ['q', 'right', 'why', 'hook']:
        if c.get(f) and TEXISH.search(str(c[f])):
            p.append('%s has LaTeX in it (use plain Unicode)' % f)
    for o in c['wrong'] if isinstance(c['wrong'], list) else []:
        if TEXISH.search(str(o)):
            p.append('an option has LaTeX in it')
    return [where + ': ' + x for x in p]


def main():
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    files = [only] if only else sorted(glob.glob(os.path.join(HERE, 'cards', '*.json')))
    real, out, warm, problems, seen = parts_of(), {}, {}, [], set()
    for path in files:
        d = json.load(open(path, encoding='utf-8'))
        ch = int(d['chapter'])
        if d.get('warm'):
            for c in d.get('cards', []):
                problems += check_card(c, ch, real, seen, warm=True)
                warm.setdefault(ch, []).append({k: c[k] for k in FIELDS + ['lvl', 'hook', 'keys'] if c.get(k)})
            continue
        for c in d.get('cards', []):
            problems += check_card(c, ch, real, seen)
            card = {k: c[k] for k in FIELDS + ['hook', 'keys'] if c.get(k)}
            bits = str(c.get('id', '')).split(':')
            part_ch = real.get((ch, c.get('from')), {}).get(bits[1]) if len(bits) == 3 else None
            out.setdefault(topic(ch, part_ch), []).append(card)
    for p in problems:
        print(p)
    print('%d cards (%s), %d warm-up cards (%s), %d problems' % (sum(len(v) for v in out.values()), ', '.join('ch%d %d' % (k, len(out[k])) for k in sorted(out)),
          sum(len(v) for v in warm.values()), ', '.join('ch%d %d' % (k, len(warm[k])) for k in sorted(warm)), len(problems)))
    if '--check' in sys.argv or only:
        sys.exit(1 if problems else 0)
    if problems:
        print('Not written: fix the problems first.')
        sys.exit(1)
    with open(os.path.join(ROOT, 'maths', 'maths-cards.js'), 'w', encoding='utf-8') as f:
        f.write('// Built by tools/maths/build_cards.py from tools/maths/cards/*.json (see tools/maths/GAMES.md). Do not edit by hand.\n')
        f.write('window.MathsCards = %s;\n' % json.dumps({str(k): out[k] for k in sorted(out)}, ensure_ascii=False, separators=(',', ':')))
        f.write('window.MathsWarm = %s;\n' % json.dumps({str(k): warm[k] for k in sorted(warm)}, ensure_ascii=False, separators=(',', ':')))
    print('written maths/maths-cards.js')


if __name__ == '__main__':
    main()

"""Checks the Computer Science game cards (tools/cs/cards/*.json, written to tools/cs/GAMES.md: the same card rules as
Maths, tools/maths/GAMES.md) and writes cs/cs-cards.js: window.CsCards = {28: [cards], ..., 32: [...]}, the games'
five topics (from each card's question's "sub"): 28 computer systems and architecture, 29 electronics and logic gates,
30 operating systems and the Internet, 31 computational thinking and algorithms, 32 representing data; and
window.CsWarm (warm-up cards, files with "warm": true; their "slot" says the topic). Read by cs/cs-deck.js.

  python3 tools/cs/build_cards.py            check every file and write cs/cs-cards.js
  python3 tools/cs/build_cards.py --check    check only (also: --only <file> to check one file)
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
FIELDS = ['id', 'from', 'q', 'right', 'wrong', 'why']
TEXISH = re.compile(r'\$|\\[a-zA-Z]+|\^\{|_\{')


SLOT_OF = {'systems': 28, 'architecture': 28, 'electronics': 29, 'os': 30, 'internet': 30, 'thinking': 31, 'algorithms': 31, 'data': 32,
           'databases': 32, 'sql': 32, 'analytics': 32}  # chapter 8 (Databases) plays in the Data topic
SUBS = {}


def parts_of():
    """Every real part: (chapter, question id) -> {part label: the part's own book chapter}; and each question's sub."""
    out = {}
    for path in glob.glob(os.path.join(HERE, 'questions', 'ch*.json')):
        d = json.load(open(path, encoding='utf-8'))
        for q in d['questions']:
            out[(d['chapter'], q['id'])] = {p['l']: p.get('chapter') for p in q['parts']}
            SUBS[q['id']] = q.get('sub')
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
        if c.get(f) and TEXISH.search(str(c[f])) and not re.search(r'```|`', str(c[f])):
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
                warm.setdefault(int(c.get('slot') or 31), []).append({k: c[k] for k in FIELDS + ['lvl', 'hook', 'keys'] if c.get(k)})
            continue
        for c in d.get('cards', []):
            problems += check_card(c, ch, real, seen)
            card = {k: c[k] for k in FIELDS + ['hook', 'keys'] if c.get(k)}
            bits = str(c.get('id', '')).split(':')
            part_ch = real.get((ch, c.get('from')), {}).get(bits[1]) if len(bits) == 3 else None
            if part_ch not in (6, 7, 8):
                problems.append('%s: its part is not on chapter 6, 7 or 8' % c.get('id'))
                continue
            out.setdefault(SLOT_OF.get(SUBS.get(c.get('from')), 31), []).append(card)
    for p in problems:
        print(p)
    print('%d cards (%s), %d warm-up cards (%s), %d problems' % (sum(len(v) for v in out.values()), ', '.join('slot %d %d' % (k, len(out[k])) for k in sorted(out)),
          sum(len(v) for v in warm.values()), ', '.join('slot %d %d' % (k, len(warm[k])) for k in sorted(warm)), len(problems)))
    if '--check' in sys.argv or only:
        sys.exit(1 if problems else 0)
    if problems:
        print('Not written: fix the problems first.')
        sys.exit(1)
    with open(os.path.join(ROOT, 'cs', 'cs-cards.js'), 'w', encoding='utf-8') as f:
        f.write('// Built by tools/cs/build_cards.py from tools/cs/cards/*.json (see tools/cs/GAMES.md). Do not edit by hand.\n')
        f.write('window.CsCards = %s;\n' % json.dumps({str(k): out[k] for k in sorted(out)}, ensure_ascii=False, separators=(',', ':')))
        f.write('window.CsWarm = %s;\n' % json.dumps({str(k): warm[k] for k in sorted(warm)}, ensure_ascii=False, separators=(',', ':')))
    print('written cs/cs-cards.js')


if __name__ == '__main__':
    main()

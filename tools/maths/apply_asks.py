"""Puts each part's short "ask" into the chapter files: one plain line saying what you have to do, shown at the top of
the part's card on the desk instead of the question copied from the paper (the user: "it would be so much easier if
you didnt copy and paste the question"; the paper is on the desk beside it with the part lit up).

  python3 tools/maths/apply_asks.py tools/maths/work/asks-10-11.json [more files] [--write]

Each file is {"<question id>": {"<part label>": "<ask>"}}. Checks every part of the chapters it touches has one, each
is one line of at most 90 characters; --write puts them in tools/maths/questions/ch<N>.json (then build_maths.py).
"""
import glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    files = [a for a in sys.argv[1:] if not a.startswith('--')]
    asks = {}
    for f in files:
        asks.update(json.load(open(f, encoding='utf-8')))
    problems, touched, n = [], {}, 0
    for path in sorted(glob.glob(os.path.join(HERE, 'questions', 'ch*.json'))):
        d = json.load(open(path, encoding='utf-8'))
        hit = False
        for q in d['questions']:
            if q['id'] not in asks:
                continue
            hit = True
            mine = asks[q['id']]
            for p in q['parts']:
                a = mine.get(p['l'])
                if not a:
                    problems.append('%s %s: no ask' % (q['id'], p['l']))
                    continue
                a = ' '.join(str(a).split())
                if len(a) > 90:
                    problems.append('%s %s: %d characters (at most 90)' % (q['id'], p['l'], len(a)))
                if a.count('$') % 2:
                    problems.append('%s %s: odd number of $' % (q['id'], p['l']))
                p['ask'] = a
                n += 1
            extra = set(mine) - {p['l'] for p in q['parts']}
            if extra:
                problems.append('%s: no parts %s' % (q['id'], sorted(extra)))
        if hit:
            missing = [q['id'] for q in d['questions'] if q['id'] not in asks]
            for m in missing:
                problems.append('%s: no asks for this question' % m)
            touched[path] = d
    unknown = set(asks) - {q['id'] for d in touched.values() for q in d['questions']}
    for u in sorted(unknown):
        problems.append('%s: no such question' % u)
    for p in problems:
        print(p)
    print('%d asks, %d problems' % (n, len(problems)))
    if '--write' in sys.argv:
        if problems:
            print('Not written: fix the problems first.')
            sys.exit(1)
        for path, d in touched.items():
            with open(path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
            print('written', os.path.relpath(path, os.path.join(HERE, '..', '..')))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()

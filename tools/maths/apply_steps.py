"""Rewrites the explanation of chosen parts: their idea, steps and tip (the question, answer, scheme, marks and short
line stay as they are). For when a part's explanation needs redoing, not only its pictures (that is apply_scenes.py).

  {"chapter": 10, "questions": {"2025-P1-Q8": {"parts": {"(a)(iii)": {
      "idea": {"title": ..., "text": ..., "vis": ...} or null,
      "steps": [{"say": ..., "math": [...], "vis": ... or null}, ...],
      "tip": "..." (optional)}}}}}

  python3 tools/maths/apply_steps.py tools/maths/work/<name>.json          check it, run the checker, write a preview:
      tools/maths/preview.html?still=1&src=work/<name>.q.js&ch=<N>&q=<id>
  python3 tools/maths/apply_steps.py tools/maths/work/<name>.json --write  put it in the chapter (then build_maths.py)
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))


def merge(data, patch):
    problems = []
    qs = {q['id']: q for q in data['questions']}
    for qid, qp in (patch.get('questions') or {}).items():
        q = qs.get(qid)
        if not q:
            problems.append('%s: no such question in chapter %s' % (qid, data['chapter']))
            continue
        parts = {p['l']: p for p in q['parts']}
        for label, pp in ((qp or {}).get('parts') or {}).items():
            part = parts.get(label)
            if not part:
                problems.append('%s: no part %s' % (qid, label))
                continue
            where = '%s %s' % (qid, label)
            extra = set(pp) - {'idea', 'steps', 'tip'}
            if extra:
                problems.append('%s: unknown keys %s (idea, steps and tip only)' % (where, sorted(extra)))
            if 'idea' in pp:
                idea = pp['idea']
                if idea is not None and not (isinstance(idea, dict) and idea.get('title') and idea.get('text')):
                    problems.append(where + ': an idea needs a title and a text')
                part['idea'] = idea
            if 'steps' in pp:
                st = pp['steps']
                if not isinstance(st, list) or not 2 <= len(st) <= 9:
                    problems.append(where + ': 2 to 9 steps')
                    continue
                for i, s in enumerate(st):
                    if not isinstance(s, dict) or not s.get('say') or not isinstance(s.get('math', []), list):
                        problems.append('%s step %d: needs "say" and a "math" list' % (where, i + 1))
                part['steps'] = [{'say': s.get('say'), 'math': s.get('math') or [], 'vis': s.get('vis')} for s in st if isinstance(s, dict)]
            if 'tip' in pp:
                part['tip'] = pp['tip']
    return problems


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(2)
    path = args[0]
    patch = json.load(open(path, encoding='utf-8'))
    ch = int(patch['chapter'])
    src = os.path.join(HERE, 'questions', 'ch%d.json' % ch)
    data = json.load(open(src, encoding='utf-8'))
    problems = merge(data, patch)
    for p in problems:
        print('PATCH:', p)
    name = os.path.splitext(os.path.basename(path))[0]
    work = os.path.join(HERE, 'work')
    os.makedirs(os.path.join(work, name + '.check'), exist_ok=True)
    with open(os.path.join(work, name + '.check', 'ch%d.json' % ch), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    r = subprocess.run(['node', os.path.join(HERE, 'tests', 'check.mjs'), str(ch)], capture_output=True, text=True,
                       env=dict(os.environ, MATHS_Q=os.path.join(work, name + '.check')))
    lines = [l for l in r.stdout.splitlines() if not l.startswith('No character metrics')]
    print('\n'.join(lines[-40:]))
    if '--write' in sys.argv:
        if problems or r.returncode:
            print('Not written: fix the problems first.')
            sys.exit(1)
        with open(src, 'w', encoding='utf-8') as f:
            f.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print('written', os.path.relpath(src, ROOT))
    else:
        with open(os.path.join(work, name + '.q.js'), 'w', encoding='utf-8') as f:
            f.write('window.MathsQuestions = window.MathsQuestions || {};\nwindow.MathsQuestions[%d] = %s;\n' % (ch, json.dumps(data, ensure_ascii=False)))
        print('preview: tools/maths/preview.html?still=1&src=work/%s.q.js&ch=%d&q=<question id>' % (name, ch))
    sys.exit(1 if problems or r.returncode else 0)


if __name__ == '__main__':
    main()

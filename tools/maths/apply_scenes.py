"""Applies a scenes patch (the pictures for a chapter's steps) to tools/maths/questions/ch<N>.json.

A patch changes pictures only, never the words or the maths:
  {"chapter": 13,
   "questions": {"2018-P2-Q1": {"parts": [
       {"idea": <picture or null>,            (only when the part has an idea)
        "steps": [<picture or null>, ...]},   (one for each step; null keeps the last picture on screen)
       ...]}}}
A part left out of "parts" (or given as null) keeps the pictures it has. See tools/maths/SCENES.md for the pictures.

  python3 tools/maths/apply_scenes.py tools/maths/work/ch13.json          check it, and write a preview copy:
      tools/maths/work/ch13.q.js (open tools/maths/preview.html?src=work/ch13.q.js&ch=13&q=<id>) and run the
      checker (tools/maths/tests/check.mjs) on the result
  python3 tools/maths/apply_scenes.py tools/maths/work/ch13.json --write  write it into the chapter (then build_maths.py)
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
        parts = (qp or {}).get('parts') or []
        if len(parts) > len(q['parts']):
            problems.append('%s: the patch has %d parts, the question has %d' % (qid, len(parts), len(q['parts'])))
        for k, pp in enumerate(parts[:len(q['parts'])]):
            if pp is None:
                continue
            part = q['parts'][k]
            where = '%s %s' % (qid, part['l'])
            if 'idea' in pp:
                if not part.get('idea'):
                    if pp['idea'] is not None:
                        problems.append(where + ': has no idea to give a picture to')
                else:
                    part['idea']['vis'] = pp['idea']
            if 'steps' in pp:
                st = pp['steps']
                if not isinstance(st, list) or len(st) != len(part['steps']):
                    problems.append('%s: "steps" needs %d entries (one per step), has %s' % (where, len(part['steps']), len(st) if isinstance(st, list) else st))
                    continue
                for s, vis in zip(part['steps'], st):
                    s['vis'] = vis
            extra = set(pp) - {'idea', 'steps', 'note'}
            if extra:
                problems.append('%s: unknown keys %s (a patch changes pictures only)' % (where, sorted(extra)))
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

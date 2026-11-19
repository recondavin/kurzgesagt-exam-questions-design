# Writes geo/papers.js (every past Higher Level essay on physical geography and on colonialism, 2006-2025, with the
# marking scheme's rules and the essay type(s) on the site that answer it) and tools/geo/research/questions.json.
# Usage: python3 -I geo-papers.py <geo-questions.json> <repo root>
import json, os, re, sys

rows = json.load(open(sys.argv[1]))
ROOT = sys.argv[2]

# (year, question): [(label, essay id, option id or None)]. An option is what the student is asked to choose (a landform,
# an interaction...); None leaves the choice to the student.
MAP = {
 (2006,'1B'): [('', 'landscape-rocks', None)], (2006,'1C'): [('', 'rockuse', None)], (2006,'2B'): [('', 'landform-any', None)],
 (2006,'2C'): [('', 'surface-human', None)], (2006,'3B'): [('', 'plates-distribution', 'earthquakes')], (2006,'3C'): [('', 'volc-landforms', None)],
 (2006,'8C'): [('', 'colonial-impact', None)],
 (2007,'1B'): [('', 'plates-boundaries', None)], (2007,'1C'): [('', 'karst-landform', None)], (2007,'2B'): [('', 'landform-any', None)],
 (2007,'2C'): [('', 'rockuse', None)], (2007,'3B'): [('', 'deform-fold-fault', None)], (2007,'3C'): [('', 'surface-human', None)],
 (2008,'1B'): [('', 'landform-any', None)], (2008,'1C'): [('', 'surface-human', None)], (2008,'2B'): [('', 'plates-distribution', 'volcanoes')],
 (2008,'2C'): [('', 'karst-landform', None)], (2008,'3B'): [('', 'landscape-rocks', None)], (2008,'3C'): [('', 'quakes-measure', None)],
 (2008,'7C'): [('', 'colonial-impact', None)],
 (2009,'1B'): [('', 'plates-boundaries', None)], (2009,'1C'): [('', 'landform-any', None)], (2009,'2B'): [('', 'rocks-sedimentary', None)],
 (2009,'2C'): [('', 'rockuse', None)], (2009,'3B'): [('', 'isostasy', None)], (2009,'3C'): [('', 'surface-human', None)], (2009,'7C'): [('', 'colonial-impact', None)],
 (2010,'1B'): [('(i)', 'landform-any', None), ('(ii)', 'mass-process', None)], (2010,'1C'): [('', 'rocks-metamorphic', None)],
 (2010,'2B'): [('', 'plates-distribution', 'foldmountains')], (2010,'2C'): [('', 'rockuse', None)], (2010,'3B'): [('', 'surface-human', None)],
 (2010,'3C'): [('', 'karst-landform', None)],
 (2011,'1B'): [('', 'volc-positive', None)], (2011,'1C'): [('', 'surface-human', None)], (2011,'2B'): [('(i)', 'landform-any', None)],
 (2011,'2C'): [('', 'rockuse', None)], (2011,'3B'): [('', 'rocks-igneous', None)], (2011,'3C'): [('', 'isostasy', None)], (2011,'7C'): [('', 'colonial-impact', None)],
 (2012,'1B'): [('', 'rocks-sed-met', None)], (2012,'1C'): [('', 'plates-distribution', 'earthquakes')], (2012,'2B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-process', None)],
 (2012,'2C'): [('', 'surface-human', None)], (2012,'3B'): [('', 'karst-landform', 'pavement')], (2012,'3C'): [('', 'deform-one', 'folding')], (2012,'8B'): [('', 'colonial-posneg', None)],
 (2013,'1B'): [('', 'rocks-metamorphic', None)], (2013,'1C'): [('', 'fluvial-adjust', None)], (2013,'2B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-process', None)],
 (2013,'2C'): [('', 'rockuse', None)], (2013,'3B'): [('', 'weather-one', None)], (2013,'3C'): [('', 'quakes-predict', None)],
 (2014,'1B'): [('', 'rocks-igneous', None)], (2014,'1C'): [('', 'surface-human', None)], (2014,'2B'): [('(i)', 'landform-two', None), ('(ii)', 'mass-two', None)],
 (2014,'2C'): [('', 'landscape-rocks', None)], (2014,'3B'): [('', 'plates-destructive', None)], (2014,'3C'): [('', 'landscape-structures', None)],
 (2015,'1B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-factors', None)], (2015,'1C'): [('', 'deform-ireland', None)], (2015,'2B'): [('', 'rocks-sedimentary', None)],
 (2015,'2C'): [('', 'isostasy', None)], (2015,'3B'): [('', 'deform-one', None)], (2015,'3C'): [('', 'rockuse', None)], (2015,'7C'): [('', 'colonial-impact', None)],
 (2016,'1B'): [('', 'rocks-ign-met', None)], (2016,'1C'): [('', 'weather-both', None)], (2016,'2B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-factors', None)],
 (2016,'2C'): [('', 'fluvial-adjust', None)], (2016,'3B'): [('', 'landscape-rocks', None)], (2016,'3C'): [('', 'plates-constructive', None)],
 (2017,'1B'): [('', 'volc-ireland', None)], (2017,'1C'): [('', 'surface-human', None)], (2017,'2B'): [('', 'karst-landscape', None)],
 (2017,'2C'): [('', 'plates-distribution', None)], (2017,'3B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-factors', None)], (2017,'3C'): [('', 'quakes-predict', None)],
 (2017,'7C'): [('', 'colonial-challenges', None)],
 (2018,'1B'): [('', 'isostasy-coast-river', None)], (2018,'1C'): [('', 'volc-positive', None)], (2018,'2B'): [('', 'weather-temp', None)],
 (2018,'2C'): [('(i)', 'landform-any', None)], (2018,'3B'): [('', 'rockuse', None)], (2018,'3C'): [('', 'plates-destructive', None)],
 (2019,'1B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-factors', None)], (2019,'1C'): [('', 'deform-ireland', None)], (2019,'2B'): [('', 'rocks-sed-met', None)],
 (2019,'2C'): [('', 'surface-human', None)], (2019,'3B'): [('', 'landscape-rocks', None)], (2019,'3C'): [('', 'plates-theory', None)], (2019,'7B'): [('', 'colonial-impact', None)],
 (2020,'1B'): [('', 'rocks-ign-met', None)], (2020,'1C'): [('', 'plates-constructive', None)], (2020,'2B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-factors', None)],
 (2020,'2C'): [('', 'weather-both', None)], (2020,'3B'): [('', 'isostasy', None)], (2020,'3C'): [('', 'rockuse', None)],
 (2021,'1B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-factors', None)], (2021,'1C'): [('', 'quakes-predict', None)], (2021,'2B'): [('', 'landscape-rocks', None)],
 (2021,'2C'): [('', 'surface-human', None)], (2021,'3B'): [('', 'fluvial-adjust', None)], (2021,'3C'): [('', 'rocks-igneous', None)], (2021,'8B'): [('', 'colonial-challenges', None)],
 (2022,'1B'): [('', 'deform-ireland', None)], (2022,'1C'): [('', 'rockuse', None)], (2022,'2B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-factors', None)],
 (2022,'2C'): [('', 'rocks-metamorphic', None)], (2022,'3B'): [('', 'weather-temp', None)], (2022,'3C'): [('', 'surface-human', None)],
 (2023,'1B'): [('', 'rocks-igneous', None)], (2023,'1C'): [('', 'isostasy-coast-river', None)], (2023,'2B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-factors', None)],
 (2023,'2C'): [('', 'karst-landscape', None)], (2023,'3B'): [('', 'plates-distribution', None)], (2023,'3C'): [('', 'rockuse', None)], (2023,'9B'): [('', 'colonial-impact', None)],
 (2024,'1B'): [('', 'surface-human', None)], (2024,'1C'): [('', 'plates-destructive-impacts', None)], (2024,'2B'): [('(i)', 'landform-erosion', None), ('(ii)', 'mass-factors', None)],
 (2024,'2C'): [('', 'volc-ireland', None)], (2024,'3B'): [('', 'rocks-sedimentary', None)], (2024,'3C'): [('', 'quakes-predict', None)],
 (2025,'1B'): [('', 'landscape-rocks', None)], (2025,'1C'): [('', 'isostasy', None)], (2025,'2B'): [('(i)', 'landform-deposition', None), ('(ii)', 'mass-factors', None)],
 (2025,'2C'): [('', 'weather-both', None)], (2025,'3B'): [('', 'rockuse', None)], (2025,'3C'): [('', 'deform-one', None)], (2025,'7C'): [('', 'colonial-challenges', None)],
}
SKIP = {(2024, '8A')}
# Schemes the extractor could not cut out cleanly, copied from the marking schemes by hand.
RULES = {
 (2006,'1C'): 'Interaction identified: 2 marks. Discussion: 11 x SRPs. Overall coherence: 6 marks graded. A second interaction may be credited from the SRPs. Amalgamate all relevant discussion points. Credit examples / locations to a maximum of 2 SRPs. Accept positive or negative aspects of the interaction.',
 (2012,'3C'): 'Examples 2 + 2 marks. Discussion 13 x SRPs. Credit 1 SRP for relevant labelled diagram. Credit extra relevant information on labelled diagram for 2 x SRPs. Diagram without labelling = 0 marks. If no link between folding and impacting on the landscape max 6 x SRPs.',
 (2014,'2B'): '(i) Landform of erosion named 2 marks. Landform of deposition named 2 marks. Formation landform of erosion 6/7 x SRPs. Formation landform of deposition 6/7 x SRPs. For each landform credit relevant labelled diagram for 1 x SRP; extra relevant information on it 1 x SRP. Max 1 x SRP per landform if merely a description with no reference to formation. Credit 2 x SRP for examples, one example of each landform. Credit 1 x SRP per landform for explanation of a named process; all further discussion of processes must be tied to formation. (ii) Two processes named 2 + 2 marks. Examination of process 1 6/7 x SRPs. Examination of process 2 6/7 x SRPs. For each process credit relevant labelled diagram for 1 x SRP.',
 (2015,'2C'): 'Impact identified 2 marks. Examination 14 x SRPs. Credit 2nd impact identified for 1 x SRP from examination. All further impacts require examination. Credit two named Irish examples for 2 x SRPs from examination. Credit 1 x SRP for relevant labelled diagram; extra relevant information on labelled diagram for 2 x SRPs. Accept features of coastal emergence and features of rejuvenation. Question is tied to Ireland. Max 2 x SRPs if merely a description of isostasy with no reference to impact on Irish landscape.',
}   # a 20-mark map question

def tidy(s):
    s = re.sub(r'[ \t]+', ' ', s.replace('', '-').replace('¾', '-').replace('•', '-').replace('➢', '-'))
    s = re.sub(r'\s*\n\s*', '\n', s).strip()
    return s

def question_text(t):
    t = tidy(t)
    # join wrapped lines; keep bullet lists and (i)/(ii) on their own lines
    out = []
    for ln in t.split('\n'):
        if out and not re.match(r'^(-|\(i+\)|Or\b|OR\b|or\b|Answer)', ln) and not re.match(r'^(-|\(i+\))', out[-1][:4] if out else ''):
            out[-1] += ' ' + ln
        else:
            out.append(ln)
    return '\n'.join(x.strip() for x in out if x.strip())

def scheme_rules(s):
    s = re.sub(r'\s+', ' ', s or '')
    s = re.sub(r'Annotation Use Marks.*$', '', s)
    s = re.sub(r'(Page \d+ of \d+|Leaving Certificate Examination \d{4}.*?Part Two \d+ \d+|SECTION \d.*$|QUESTION \d+.*$|REGIONAL GEOGRAPHY.*$)', '', s)
    # after the [30m] or (30 marks), the scheme's own lines
    m = re.search(r'(\[30m\]|\(30 marks\))', s)
    body = s[m.end():] if m else s
    return body.strip()

# 2026: the paper's topics as the exam reviews report them (The Irish Times, 5 June 2026; the Institute of Education's
# review; examai.ie's list of the 2026 paper's topics). The SEC paper itself (examinations.ie) could not be fetched from
# here, so these carry no wording, question number or scheme yet: the site shows the essay type's own question for them.
# Earthquakes (in Question 1) and mass movement (in Question 2) were also on the paper, but not which 30-mark question.
REVIEWED_2026 = [
 ('rocks', 'Rock formation', 'rocks-sed-met', 'The Irish Times: "a question asking about the formation of sedimentary and metamorphic rocks" (Question 1).'),
 ('karst', 'Karst landscapes', 'karst-landscape', 'The Irish Times: "karst landscapes"; examai.ie: karst and chemical weathering (Question 2).'),
 ('erosion', 'Erosion', 'landform-erosion', 'The Irish Times: "erosion"; the Institute of Education: "the predicted appearance of Erosion".'),
 ('plates', 'Constructive plate boundaries', 'plates-constructive', 'The Irish Times: "constructive plate boundaries"; the Institute of Education: "one question on Plate Boundaries" (Question 2).'),
 ('human', 'Human interaction with surface processes', 'surface-human', 'The Irish Times: "human interaction with surface processes" (Question 3).'),
 ('temp', 'The role of temperature in physical weathering', 'weather-temp', 'The Irish Times: "the role of temperature in physical weathering" (Question 3).'),
]
out, research = [], []
for r in rows:
    key = (r['year'], '%d%s' % (r['q'], r['part']))
    if key in SKIP: continue
    if key not in MAP: print('NOT MAPPED', key, r['title']); continue
    q = {'id': key[1], 'year': r['year'], 'title': r['title'], 'text': question_text(r['text']), 'marks': r['marks'], 'kind': r['kind'],
         'rules': RULES.get(key) or scheme_rules(r['scheme']), 'ask': [{'label': a, 'essay': e} if not o else {'label': a, 'essay': e, 'opt': o} for a, e, o in MAP[key]]}
    out.append(q)
    research.append(dict(q, scheme_full=tidy(r['scheme'])))
for rid, title, essay, src in REVIEWED_2026:
    q = {'id': rid, 'year': 2026, 'title': title, 'text': '', 'marks': 30, 'kind': 'physical', 'rules': '', 'rev': src, 'ask': [{'label': '', 'essay': essay}]}
    out.append(q); research.append(dict(q, scheme_full=''))
missing = [k for k in MAP if k not in {(q['year'], q['id']) for q in out}]
print(len(out), 'questions written;', 'mapped but not found:', missing)
os.makedirs(os.path.join(ROOT, 'tools', 'geo', 'research'), exist_ok=True)
json.dump(research, open(os.path.join(ROOT, 'tools', 'geo', 'research', 'questions.json'), 'w'), indent=1, ensure_ascii=False)
js = ('// Geography: every Higher Level essay on physical geography (Section 1, Questions 1-3, parts B and C) and on\n'
      '// colonialism from 2006 to 2025 (and 2026 as the reviews report it: see tools/geo/build_papers.py), with the marking scheme\'s own rules and the essay type(s) on the site that answer it.\n'
      '// Generated by tools/geo/build_papers.py from the SEC papers and marking schemes; do not edit by hand.\n'
      'window.GEO_PAPERS = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
open(os.path.join(ROOT, 'geo', 'papers.js'), 'w').write(js)
from collections import Counter
c = Counter(a['essay'] for q in out for a in q['ask'])
print(len(c), 'essay types:', ', '.join('%s %d' % kv for kv in sorted(c.items())))

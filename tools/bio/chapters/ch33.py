"""Chapter 33, the nervous system: how its exam questions are marked and shown.

No drawn diagrams yet (MAKERS is empty): each question's picture is cut from the exam paper itself (OVERRIDES['dia']).
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is (none yet),
  ANCHOR_WORDS  the words that name each anchor on those diagrams (none yet),
  OVERRIDES     per-question corrections: the paper's pictures, answer types, counts and hand-written keys.
"""
from itertools import product

CHAPTER = 33
TOPIC = 'The Nervous System'

MAKERS = []
ANCHOR_WORDS = {}


def base_of(what):
    return None


def _keys(*groups):
    """Every way of saying a point: one word from each group (a group lists the ways to say that word)."""
    groups = [g if isinstance(g, (list, tuple)) else [g] for g in groups]
    return [{'w': list(c), 'n': len(c)} for c in product(*groups)]


def _said(*alts):
    """Hand-written keys: each string is one way of saying the point, every word of it needed."""
    return [{'w': a.split(), 'n': len(a.split())} for a in alts]


def _one(*words):
    """Each word is enough on its own."""
    return [{'w': [w], 'n': 1} for w in words]


def _together(*groups):
    """Like _keys, but said in one part of a sentence (no full stop, comma, colon or joining word between): "sensory
    neurons carry impulses to the CNS", not "sensory neurons ..., and ... to the CNS"."""
    return [dict(k, c=True) for k in _keys(*groups)]


def _in_order(*alts):
    """Each string's words in this order, with only small words between them: "to the CNS", not "to the effector from the CNS"."""
    return [{'w': a.split(), 'n': len(a.split()), 'o': True} for a in alts]



def _with(names, alts):
    """Keys that also need one of the names (a disorder named in the same answer): "Parkinson's ... lack of dopamine"."""
    return [{'w': [n] + k['w'], 'n': k['n'] + 1} for n in names for k in alts]


# Words the hand-written keys share. Stems, as the marker compares them (bio/bio.js): 'sensor' is sensory (and sense),
# 'paraly' paralysis or paralysed. Not 'cerebr', which the marker reads as cerebellum too: the brain's parts go whole.
_IMPULSE = ['impuls', 'messag', 'signal']
_GREY = ['grey', 'gray']

# Nervous v hormonal (2007, 2012, 2013, 2021): the schemes' differences, said of either side ("hormones are slower",
# "nerves are faster").
_FAST = _one('fast', 'rapid', 'instant', 'immediat') + _keys(['nerv', 'neuron'], 'quick')
_SLOW = _one('slow')
_ELECTRIC = _one('electr')
_CHEMICAL = _one('chemic')
_SHORT = _keys('short', ['live', 'last', 'term', 'durat', 'time']) + _one('brief')
_LONG = _keys('long', ['live', 'last', 'term', 'durat', 'time']) + _one('prolong')
_MANY = _keys(['many', 'several', 'multipl', 'more', 'wide', 'number', 'variety', 'range'], ['target', 'organ', 'tissu', 'area', 'part']) + _one('widespread')

# The neuron's parts and what they do (the schemes of 2006, 2008, 2018, 2020, 2025, 2026).
_SPEED = _one('speed', 'fast', 'rapid') + _keys('increas', ['speed', 'rate'])
_MYELIN_DOES = _one('insul', 'protect') + _SPEED
_SCHWANN_DOES = _keys(['make', 'form', 'secret', 'wrap'], 'myelin')         # 'make' is also produce, create (bio.js SAME)
_RECEIVE = _keys(['receiv', 'pick', 'collect', 'detect', 'accept', 'bring'], _IMPULSE)
_TO_CELL_BODY = _keys(['carr', 'bring', 'transmit', 'send', 'pass', 'conduct', 'take', 'toward'], _IMPULSE + ['toward'], 'cell', 'body')
_AWAY_FROM_BODY = _keys('away', ['cell', 'body', 'soma'])
_TO_EFFECTOR = _keys(_IMPULSE + ['carr', 'transmit', 'send', 'conduct', 'take'], ['effector', 'muscl', 'gland'])
_NEUROTRANSMITTER = _one('neurotransmitt', 'acetylcholin', 'dopamine', 'serotonin', 'noradrenalin') + _keys('transmitt', ['substanc', 'chemic'])

# The synapse, step by step: the impulse arrives, neurotransmitter is released, crosses the cleft, binds to receptors and
# sets off an impulse in the next neuron; then it is broken down by enzymes or taken back (recycled).
_ARRIVES = _keys(_IMPULSE, ['arriv', 'reach'])
_RELEASED = _keys(['releas', 'secret', 'discharg'], ['neurotransmitt', 'transmitt', 'chemic', 'vesicl', 'acetylcholin', 'dopamine', 'serotonin'])
_SECRETED_BY = _keys(['secret', 'releas'], ['neuron', 'vesicl', 'knob', 'bulb', 'termin', 'presynapt', 'axon', 'neurotransmitt', 'transmitt', 'chemic'])
_CROSSES = _keys(['diffus', 'cross', 'across', 'travel', 'mov', 'pass', 'into'], ['gap', 'cleft']) + _keys(['cross', 'across'], 'synaps') + _one('diffus')
_BINDS = _keys(['bind', 'bound', 'attach', 'combin', 'fit', 'lock', 'join', 'react', 'dock'], 'receptor')
_NEXT = ['next', 'postsynapt', 'second', 'other', 'another', 'follow', 'adjacent']
_STARTS = ['start', 'make', 'generat', 'set', 'trigger', 'initiat', 'fire', 'continu', 'caus', 'new']
_STARTS_NEXT = _keys(_IMPULSE, _STARTS, _NEXT)
_STARTS_ANY = _keys(_IMPULSE, _STARTS)
_ON_NEXT = _keys(_NEXT, ['neuron', 'cell', 'membran', 'nerve']) + _one('postsynapt')
_BROKEN = ['broke', 'break', 'destroy', 'degrad', 'inactiv', 'digest', 'remov']
_ENZYME = _keys(_BROKEN, 'enzym') + _keys(['broke', 'break'], 'down') + _one('inactiv', 'acetylcholinesteras', 'cholinesteras')
_RECYCLED = _one('reabsorb', 'recycl', 'reuptak', 'uptak') + _keys(['taken', 'absorb', 'pump', 'return'], 'back')
_PRE_POST = _one('presynapt', 'postsynapt') + _keys(['pre', 'post'], 'synapt')

# Neurons by type: sensory (to the CNS, from receptors), motor (away from it, to effectors), interneurons (within the
# CNS, linking the other two).
_SENSORY_ROLE = _keys('sensor', ['toward', 'receptor', 'stimul', 'skin']) + _keys('sensor', ['to', 'into'], ['cns', 'brain', 'spin', 'central'])
_MOTOR_ROLE = _keys('motor', ['away', 'effector', 'muscl', 'gland'])
_INTER = ['interneuron', 'inter', 'relay', 'associat', 'connector']
_INTER_ROLE = (_keys(_INTER, ['link', 'connect', 'join', 'between', 'within', 'inside']) + _keys(_INTER, 'cns') +
               _keys(_INTER, 'sensor', 'motor'))
# A part found only in neurons and what it does (2012-Q13b(ii), which names none).
_PART_DOES = (_keys('dendrit', ['receiv', 'pick', 'toward', 'collect']) + _keys('axon', ['away', 'effector', 'muscl', 'carr', 'transmit', 'conduct']) +
              _keys('myelin', ['insul', 'protect', 'speed', 'fast']) + _keys('schwann', ['myelin', 'insul', 'protect']) +
              _keys('vesicl', ['neurotransmitt', 'stor', 'releas', 'transmitt']) + _keys(['knob', 'bulb', 'termin'], ['neurotransmitt', 'releas', 'vesicl']))

# The CNS and PNS. The PNS: nerves outside the CNS, leading to and from it, throughout the body.
_CNS = _keys('brain', ['spin', 'cord'])
_PNS = _keys(['nerv', 'neuron'], ['outsid', 'throughout', 'rest', 'beyond', 'lead', 'connect', 'link', 'branch', 'everywher', 'not', 'ganglia', 'from'])

# The brain's parts (2012, 2014, 2019, 2026).
_CEREBELLUM_DOES = (_one('coordin', 'balanc', 'postur', 'walk', 'writ', 'speech') + _keys(['control', 'regul'], ['voluntar', 'movement', 'muscl']) +
                    _keys('fine', ['movement', 'muscl']) + _in_order('co ordin'))
_BACK = ['hind', 'back', 'rear', 'behind', 'below', 'under', 'beneath', 'bottom', 'posterior', 'lower']
_FRONT = ['fore', 'front', 'top', 'above', 'upper', 'over', 'anterior']
_MEDULLA_DOES = (_keys(['control', 'regul'], 'involuntar') + _one('involuntar', 'breath', 'heart', 'digest', 'sneez', 'cough', 'swallow', 'vomit') +
                 _keys('blood', 'pressur'))

# Reflexes (2010, 2015, 2021, 2026).
_REFLEX = _keys(['automat', 'involuntar', 'unconscious'], ['respons', 'react', 'action'], 'stimul')
_REFLEX_EG = (_one('blink', 'cough', 'sneez', 'grasp', 'startl', 'withdraw', 'swallow', 'gag') + _keys('knee', ['jerk', 'reflex', 'kick', 'tap']) +
              _keys(['iris', 'pupil'], ['light', 'respons', 'constrict', 'dilat', 'react', 'narrow']) +
              _keys(['hand', 'finger', 'foot'], ['hot', 'sharp', 'pain', 'away', 'pull', 'remov']))
_PROTECT = _one('protect', 'safe') + _keys(['prevent', 'avoid', 'reduc', 'less', 'minimi'], ['injur', 'damag', 'harm'])
_RECEPTOR = _keys(['stimul', 'detect', 'pick', 'sens', 'receiv'], 'receptor')
_SET_UP = _keys(_IMPULSE, ['set', 'generat', 'start', 'make', 'trigger', 'initiat', 'fire', 'form'])
_SENSORY = _keys('sensor', ['neuron', 'nerve', 'fibr'])
_INTERNEURON = _one('interneuron', 'relay') + _keys(['inter', 'associat', 'connector'], 'neuron')
_MOTOR = _keys('motor', ['neuron', 'nerve', 'fibr'])
_IN_CNS = _one('cns', 'grey', 'gray') + _keys('central', 'nervous') + _keys('spin', 'cord')
_EFFECTOR_REACTS = _keys(['effector', 'muscl', 'gland'], ['react', 'respond', 'contract', 'secret', 'act', 'mov', 'pull'])

# Disorders of the nervous system: what the schemes accept as a cause or a treatment of Parkinson's disease and of
# paralysis (2005, 2006, 2012, 2020, 2022), each said with the disorder it belongs to where the answer names it.
_LACK = ['lack', 'decreas', 'low', 'less', 'loss', 'lose', 'deficien', 'short', 'insufficien', 'declin', 'little']
_PARK, _PARA = ['parkinson'], ['paraly']
_PARK_CAUSE = (_keys(_LACK, ['dopamine', 'serotonin']) + _keys(['die', 'death', 'dead', 'damag', 'degenerat', 'destroy'], 'dopamine') +
               _one('genet', 'gene', 'inherit', 'mutat', 'toxin', 'toxic', 'poison', 'environ', 'unknown', 'age', 'stroke') + _keys('old', 'age') +
               _keys('drug', ['induc', 'side', 'abus', 'misus']))
_DAMAGE = ['damag', 'injur', 'break', 'broke', 'sever', 'cut', 'trauma', 'crush']
_PARA_CAUSE = (_keys(_DAMAGE, ['spin', 'cord', 'nerv', 'brain', 'neuron', 'back', 'neck']) + _one('stroke', 'palsy', 'sclerosis', 'ms') +
               _keys('multipl', 'scleros'))
_GIVE = ['drug', 'give', 'replac', 'tablet', 'medic', 'treat', 'inject', 'suppl', 'boost', 'increas', 'take', 'pill', 'rais']
_PARK_TREAT = (_one('levodopa', 'carbidopa', 'physio', 'exercis', 'implant') + _in_order('l dopa') + _keys('physic', 'therap') +
               _together(_GIVE, ['dopamine', 'serotonin']) + _keys('drug', 'mimic') + _keys('deep', 'brain', 'stimul') + _keys('stem', 'cell'))
_PARA_TREAT = (_one('physio', 'surg', 'implant') + _keys(['physic', 'occupation'], 'therap') + _keys('electr', 'stimul') + _keys('stem', 'cell'))
_NAMED = _one('parkinson', 'paraly')


def _cause(paired=True, accident=True):
    """A cause of Parkinson's disease or of paralysis: with the disorder's name (paired), or any of them. "Other than
    accident" (2012) leaves out an accident or injury said alone."""
    park, para = _PARK_CAUSE, _PARA_CAUSE + (_one('injur', 'accident', 'trauma') if accident else [])
    return _with(_PARK, park) + _with(_PARA, para) if paired else park + para


def _treat(paired=True):
    return _with(_PARK, _PARK_TREAT) + _with(_PARA, _PARA_TREAT) if paired else _PARK_TREAT + _PARA_TREAT


# 2005 and 2006 list causes without the disorder: "injury / genetic / disease / lack of dopamine" ("disease" said as a
# cause, not "Parkinson's disease").
_DISEASE = _in_order('by disease', 'from disease', 'another disease', 'other disease', 'viral disease', 'virus', 'infection')


# Per-question corrections the general rules can't work out: the paper's pictures, answer types, how many points count,
# and keys written by hand.
OVERRIDES = {
    # The picture each question's answer needs, cut from its paper page (box: left, top, width, height in % of the page).
    'dia': {
        '2008-Q4': {'fig': [{'img': 'assets/bio/papers/2008-p03.webp', 'box': [17.3, 47.8, 73.6, 18.2]}]},     # the motor neuron, A, B, C
        '2015-Q14b': {'fig': [{'img': 'assets/bio/papers/2015-p13.webp', 'box': [25.4, 26.7, 46.3, 16.4]}]},   # spinal cord section, A, B, C
        '2019-Q14a': {'fig': [{'img': 'assets/bio/papers/2019c-p07.webp', 'box': [21.1, 19.8, 61.4, 19.4]}]},  # the brain, A-F
        '2020-Q6': {'fig': [{'img': 'assets/bio/papers/2020a-p08.webp', 'box': [14.0, 8.1, 64.8, 23.5]}]},     # sensory neuron, A, B, arrow box
        '2021-Q17c': {'fig': [{'img': 'assets/bio/papers/2021c-p10.webp', 'box': [23.3, 10.7, 54.7, 21.6]}]},  # spinal cord and reflex arc
        '2023-Q17b': {'fig': [{'img': 'assets/bio/papers/2023c-p09.webp', 'box': [30.8, 48.7, 48.9, 17.2]}]},  # two neurons, A, B
        '2025-Q14b': {'fig': [{'img': 'assets/bio/papers/2025c-p05.webp', 'box': [54.0, 24.9, 36.1, 10.7]}]},  # eyes A and B
        '2025-Q14c': {'fig': [{'img': 'assets/bio/papers/2025c-p05.webp', 'box': [56.6, 52.8, 34.2, 27.9]}]},  # neurons X, Y, Z
        '2026-Q17d': {'fig': [{'img': 'assets/bio/papers/2026c-p10.webp', 'box': [57.0, 53.6, 34.0, 18.5]}]},  # spinal cord, P, Q, Y
        'S1-Q1b': {'fig': [{'img': 'assets/bio/papers/s1-p03.webp', 'box': [67.5, 54.5, 24.0, 21.5]}]},        # the synapse, A, B
    },
    # Drawings, labels on the student's own drawing and arrows on it: the student ticks the scheme.
    'kind': {'2010-Q11b(iv)': 'draw', '2012-Q13b(iii)': 'draw', '2026-Q17d(iv)': 'draw'},
    # Keys written by hand (part id -> {point index: alternatives}): the words that carry each point, where the ones made
    # from the scheme's sentence needed words a student leaves out ("travels along", "consists of"), let a word that turns
    # up in wrong answers through ("disease" in "Parkinson's disease", "gland" alone), or were a note to the examiner
    # ("Relevant cause", "Correct matching treatment", "Function of first named part").
    'points': {
        'S1-Q1b(i)': {0: _NEUROTRANSMITTER, 1: _one('vesicl')},
        'S1-Q1b(iii)': {0: _ENZYME, 1: _RECYCLED},
        '2026-Q17d(iii)': {1: _one(*_GREY)},
        '2026-Q17d(v)': {0: _RECEPTOR + _keys('receptor', ['detect', 'sens', 'pick', 'receiv']) + _SET_UP, 1: _SENSORY,
                         2: _INTERNEURON + _IN_CNS, 3: _MOTOR, 4: _one('effector') + _EFFECTOR_REACTS},
        '2026-Q7e(e)': {0: _keys(['back', 'rear', 'behind', 'posterior', 'hind', 'bottom'], ['brain', 'head', 'skull']) +
                           _keys(['below', 'under', 'beneath', 'behind'], 'cerebrum'),
                        1: _CEREBELLUM_DOES},
        '2025-Q14a(i)': {0: _CNS, 1: _PNS},
        '2025-Q14a(ii)': {0: _one('skull', 'cranium', 'spine', 'vertebr', 'backbon', 'mening', 'cerebrospin', 'csf') + _keys('spin', 'column')},
        '2025-Q14b(i)': {0: _one('refract') + _keys(['allow', 'let', 'admit', 'enter', 'transmit', 'pass'], 'light') + _keys('bend', 'light'),
                         1: _keys(['convert', 'chang', 'turn', 'transform', 'make', 'generat'], _IMPULSE) + _keys('light', _IMPULSE),
                         2: _keys(_IMPULSE + ['inform'], 'brain') + _keys(['carr', 'send', 'transmit', 'take', 'pass'], 'brain'),
                         3: _one('focus') + _keys(['bend', 'refract'], 'light')},
        '2025-Q14b(ii)': {1: _keys('pupil', ['larg', 'dilat', 'wide', 'open']) + _one('dilat')},
        '2025-Q14b(iii)': {0: _keys(['transf', 'transmit', 'carr', 'pass', 'amplif'], ['sound', 'vibrat']) + _one('amplif'),
                           1: _keys(['convert', 'chang', 'turn', 'make', 'generat'], _IMPULSE) + _keys(['sound', 'vibrat'], _IMPULSE),
                           2: _keys(['equal', 'balanc'], 'pressur')},
        '2025-Q14b(iv)': {0: _keys(['long', 'hyperop', 'farsight'], ['convex', 'converg']) + _keys(['short', 'myop', 'nearsight'], ['concav', 'diverg']) +
                             _keys(['hear', 'deaf'], ['aid', 'implant', 'grommet'])},
        '2025-Q14c(i)': {1: _one('muscl', 'effector') + _keys('cell', 'body', ['top', 'end', 'start', 'begin', 'dendrit']),
                         3: _one('skin', 'receptor') + _keys('cell', 'body', ['side', 'middle', 'branch', 'off', 'halfway', 'along', 'stalk'])},
        '2025-Q14c(ii)': {0: _ARRIVES, 1: _RELEASED, 2: _CROSSES, 3: _BINDS, 4: _STARTS_NEXT, 5: _ENZYME + _RECYCLED},
        '2025-Q14c(iii)': {0: _SCHWANN_DOES},
        '2025-Q14c(iv)': {0: _cause(), 1: _treat()},
        '2023-Q17b(v)': {0: _ARRIVES, 1: _RELEASED + _keys(['a'], ['releas', 'secret']), 2: _CROSSES, 3: _BINDS, 4: _STARTS_ANY,
                         5: _ENZYME + _RECYCLED, 6: _PRE_POST},
        '2023-Q17b(vii)': {0: _treat(False)},
        '2022-Q16a(i)': {0: _one('cns', 'central'), 1: _one('pns', 'peripher')},
        '2022-Q16a(iii)': {0: _INTER_ROLE, 1: _SENSORY_ROLE},
        '2022-Q16a(iv)': {0: _one('ion', 'ionic', 'sodium', 'potassium', 'na', 'k')},
        '2022-Q16a(vi)': {0: _cause()},
        '2021-Q17c(ii)': {0: _REFLEX},
        '2021-Q17c(iii)': {0: _REFLEX_EG},
        '2021-Q17c(iv)': {0: _PROTECT + _FAST + _one('involuntar', 'automat')},
        '2021-Q17c(v)': {0: _RECEPTOR, 1: _SET_UP, 2: _one('sensor') + _keys(['neuron', 'along', 'through', 'via', 'to', 'travel', 'pass', 'sent'], 'b'),
                         3: _INTERNEURON + _keys(['neuron', 'to', 'through', 'via', 'pass', 'travel', 'along'], 'c'), 4: _IN_CNS,
                         5: _one('motor') + _keys(['neuron', 'to', 'through', 'via', 'pass', 'travel', 'along'], 'a'),
                         6: _one('effector', 'muscl', 'gland'), 7: _EFFECTOR_REACTS},
        '2021-Q17c(vi)': {0: _FAST + _SLOW, 1: _ELECTRIC + _CHEMICAL, 2: _SHORT + _LONG},
        '2020-Q6(b)': {0: _NEUROTRANSMITTER},
        '2020-Q6(d)': {0: _SPEED + _one('insul', 'quick')},
        '2020-Q6(f)': {0: _cause(), 1: _treat()},
        '2019-Q14a(i)': {2: _one('pituitar'), 3: _one('medulla', 'oblongata')},
        '2019-Q14a(ii)': {0: _MEDULLA_DOES, 1: _CEREBELLUM_DOES},
        '2019-Q14a(iii)': {0: _keys('cell', 'body'), 1: _one('myelin', 'axon')},
        '2018-Q11c(i)': {0: _RECEIVE + _TO_CELL_BODY, 1: _AWAY_FROM_BODY + _TO_EFFECTOR,
                         2: _RECEIVE + _keys(['make', 'synthes'], ['neurotransmitt', 'transmitt']) + _keys('control', _IMPULSE) +
                            _keys(['pass', 'send', 'transmit'], 'axon')},
        '2018-Q11c(ii)': {0: _ARRIVES, 1: _NEUROTRANSMITTER, 2: _RELEASED + _keys(['releas', 'secret'], ['synaps', 'synapt', 'cleft', 'gap']),
                          3: _CROSSES, 4: _BINDS, 5: _STARTS_NEXT, 6: _ENZYME + _RECYCLED},
        '2018-Q11c(iii)': {0: _SPEED + _one('quick')},
        '2017-Q14c(ii)': {1: _one('insul', 'myelin'), 4: _NEUROTRANSMITTER},
        '2015-Q14b(i)': {0: _one(*_GREY), 2: _keys('central', 'canal') + _one('cerebrospin', 'csf')},
        '2015-Q14b(ii)': {0: _keys('cell', 'body') + _keys(['no', 'littl', 'few', 'less', 'without', 'lack', 'not'], 'myelin') + _one('unmyelin', 'nonmyelin'),
                          1: _one('axon', 'myelin')},
        '2015-Q14b(iii)': {1: _one('three', '3')},
        '2015-Q14b(iv) 1.': {0: _REFLEX},
        '2015-Q14b(iv) 2.': {0: _RECEPTOR, 1: _SENSORY, 2: _INTERNEURON, 3: _MOTOR, 4: _one('effector', 'muscl', 'gland'),
                             5: _keys(_IMPULSE + ['also', 'another', 'second', 'later', 'awar', 'inform', 'copy'], 'brain')},
        '2014-Q11b(ii)': {0: _SECRETED_BY, 1: _keys(['synapt', 'synaps'], ['cleft', 'gap']) + _keys(['cross', 'across', 'diffus', 'into'], ['cleft', 'gap']),
                          2: _BINDS, 3: _ON_NEXT, 4: _STARTS_ANY, 5: _ENZYME, 6: _RECYCLED},
        # The cerebellum at the back (or below), the cerebrum at the front (or top), each said in one part of a sentence
        # ("the cerebrum is at the back and the cerebellum at the front" has all the words). Either half earns it.
        '2014-Q11b(iii) 1.': {0: _together('cerebellum', _BACK) + _together('cerebrum', _FRONT) +
                                 _in_order(*['cerebellum ' + w for w in _BACK], *['cerebrum ' + w for w in _FRONT],
                                           'cerebrum above cerebellum', 'cerebrum over cerebellum', 'cerebellum below cerebrum', 'cerebellum under cerebrum',
                                           'cerebellum beneath cerebrum', 'cerebellum behind cerebrum')},
        '2014-Q11c(i)': {0: _one('worse', 'deteriorat', 'progressiv', 'declin')},
        '2014-Q11c(ii)': {0: _one('many', 'group', 'several', 'multipl', 'polygen', 'more')},
        '2014-Q11c(iii)': {0: _one('plaqu') + _keys('protein', ['build', 'accumul', 'deposit', 'clump', 'lump'])},
        '2014-Q11c(iv)': {0: _keys('memor', ['loss', 'lose', 'poor', 'fail', 'declin', 'problem', 'bad']) + _one('forget', 'confus', 'disorient', 'dementia')},
        '2014-Q11c(v)': {0: _one('scan') + _keys(['early', 'first'], ['detect', 'sign', 'diagnos'])},
        '2014-Q11c(vi)': {0: _keys(['larg', 'more', 'increas', 'grow', 'bigger', 'high'], 'popul') + _keys('live', ['long', 'old', 'age']) +
                             _keys('life', ['expect', 'span']) + _keys(['older', 'ageing', 'aging'], ['popul', 'people'])},
        # Another disorder (not Alzheimer's) and a treatment for it.
        '2014-Q11c(vii)': {0: _NAMED + _one('sclerosis', 'ms', 'palsy'), 1: _treat() + _with(['sclerosis', 'ms', 'palsy'], _one('physio') + _keys('physic', 'therap'))},
        '2013-Q10b(iv)': {0: _one('blood', 'circulat') + _CHEMICAL, 1: _ELECTRIC},
        '2012-Q13a(i)': {0: _CNS, 1: _PNS},
        '2012-Q13a(ii)': {0: _FAST + _SHORT + _ELECTRIC},
        '2012-Q13b(ii)': {0: _PART_DOES, 1: _PART_DOES},
        '2012-Q13b(iv)': {0: _SENSORY_ROLE, 1: _INTER_ROLE},
        # Each function said with its part of the brain; "or other" / "or example" filled from the 2014 and 2019 schemes.
        '2012-Q13c(i)': {0: _keys('cerebrum', ['languag', 'reason', 'conscious', 'sens', 'memor', 'intellig', 'emotion', 'think', 'thought', 'learn',
                                               'speech', 'vision', 'logic', 'personal']),
                         1: _keys('hypothalamus', ['homeosta', 'temperatur', 'thirst', 'hunger', 'water', 'endocrin', 'hormon', 'pituitar', 'adh', 'sleep',
                                                   'appetit']),
                         2: _with(['cerebellum'], _CEREBELLUM_DOES + _one('movement', 'mov')),
                         3: _with(['medulla', 'oblongata'], _MEDULLA_DOES + _keys(['control', 'regul'], 'muscl'))},
        '2012-Q13c(ii)': {0: _keys(_GREY, 'cell', 'body') + _keys(_GREY, ['few', 'littl', 'no', 'less', 'lack', 'without'], ['axon', 'myelin']),
                          1: _keys('white', ['axon', 'myelin', 'fibr']) + _keys('white', 'few', 'cell')},
        '2012-Q13c(iii)': {0: _cause(accident=False), 1: _treat()},
        '2010-Q11a(i)': {0: _NAMED + _one('alzheimer', 'sclerosis', 'ms', 'palsy')},
        '2010-Q11a(ii)': {0: _cause(False) + _one('injur', 'accident', 'plaqu'), 1: _treat(False)},
        '2010-Q11b(i)': {0: _one('automat'), 1: _keys(['respons', 'react'], 'stimul'),
                         2: _one('involuntar', 'unconscious') + _keys(['not', 'without'], ['control', 'think', 'conscious'])},
        '2010-Q11b(ii)': {0: _REFLEX_EG},
        '2010-Q11b(iii)': {0: _PROTECT + _FAST},
        '2009-Q15c(ii)': {0: _SECRETED_BY, 1: _PRE_POST[:1] + _keys('pre', 'synapt'), 2: _keys(['respons', 'arriv', 'reach'], _IMPULSE),
                          3: _CHEMICAL, 4: _CROSSES + _keys(['cross', 'across'], 'synapt'), 5: _STARTS_NEXT, 6: _ENZYME, 7: _RECYCLED},
        '2008-Q4(a)': {0: _one('myelin', 'schwann'), 1: _one('myelin', 'axon')},
        '2008-Q4(b)': {0: _MYELIN_DOES, 1: _SCHWANN_DOES + _MYELIN_DOES},
        '2008-Q4(d)': {0: _RECEIVE + _TO_CELL_BODY},
        '2008-Q4(f)': {0: _TO_EFFECTOR + _in_order('from cns', 'from brain', 'from spinal', 'from central')},
        '2007-Q15b(ii)': {0: _CHEMICAL, 1: _SLOW + _FAST, 2: _LONG + _keys(['nerv', 'neuron'], ['short', 'brief']), 3: _MANY},
        '2006-Q14b(i)': {0: _keys('nerv', 'cell')},
        '2006-Q14b(ii)': {0: _SENSORY_ROLE, 1: _MOTOR_ROLE, 2: _INTER_ROLE + _keys(_INTER, 'two', 'neuron')},
        '2006-Q14b(iii)': {0: _keys(['carr', 'transmit', 'pass', 'transfer', 'send', 'relay', 'conduct'], _IMPULSE), 1: _CROSSES + _keys(['cross', 'across'], 'synapt'),
                           2: _STARTS_NEXT},
        '2006-Q14b(iv)': {0: _SCHWANN_DOES, 1: _MYELIN_DOES},
        '2006-Q14b(v)': {0: _cause(False) + _DISEASE, 1: _treat(False)},
        '2005-Q14c(iii)': {0: _NAMED, 1: _cause() + _with(_PARK + _PARA, _DISEASE), 2: _treat()},
        '2004-Q12c(iv)': {0: _one('receptor', 'detect'), 1: _keys(['receptor', 'detect', 'sens', 'nerv'], 'skin'),
                          2: _keys(['receptor', 'detect', 'sens', 'control', 'monitor'], ['medulla', 'brain', 'hypothalamus']) + _one('hypothalamus', 'medulla'),
                          4: _keys(['make', 'generat', 'releas'], 'heat'), 5: _keys('hair', ['stand', 'erect', 'rais', 'upright']) + _keys('goose', ['bump', 'pimpl', 'flesh']) +
                          _one('piloerect'), 6: _keys('air', ['trap', 'insul']),
                          7: _one('vasoconstrict') + _keys(['arteriol', 'vessel', 'capillar'], ['constrict', 'narrow', 'smaller', 'close']),
                          8: _keys(['increas', 'more', 'rais', 'high', 'fast'], ['metabol', 'respir']), 9: _one('thyroxin', 'adrenalin')},
        '2004-Q15a(ii)': {0: _keys(['arriv', 'reach', 'come'], _IMPULSE), 1: _one('bulb', 'vesicl', 'knob'),
                          2: _one('neurotransmitt') + _keys('transmitt', ['substanc', 'chemic']) + _keys(['secret', 'releas'], ['transmitt', 'chemic']),
                          3: _CROSSES + _keys(['passag', 'diffus', 'cross', 'mov', 'travel'], ['neurotransmitt', 'transmitt', 'chemic']),
                          4: _STARTS_NEXT, 5: _keys(_BROKEN, ['down', 'neurotransmitt', 'transmitt']) + _one('inactiv')},
        '2004-Q15a(iii)': {0: _keys(['inhibit', 'enhanc', 'block', 'stop', 'prevent', 'increas', 'decreas', 'boost', 'slow', 'speed', 'mimic', 'reduc', 'imitat'],
                                    ['transmi', 'impuls', 'neurotransmitt', 'synaps', 'synapt', 'receptor', 'enzym', 'signal', 'messag', 'reabsorb', 'reuptak'])},
    },
}

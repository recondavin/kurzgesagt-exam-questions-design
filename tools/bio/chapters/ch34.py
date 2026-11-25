"""Chapter 34, the endocrine system: how its exam questions are marked.

No drawn diagrams (MAKERS is empty): a question whose answer needs its picture shows it cut from the paper page.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       None: the chapter has no diagram of its own for a question's picture to be,
  OVERRIDES     per-question corrections: the paper pictures, answer types and hand-written marking keys.
"""

CHAPTER = 34
TOPIC = 'The endocrine system'
MAKERS = []
ANCHOR_WORDS = {}


def base_of(what):
    return None


# Hand-written marking keys (OVERRIDES['points']): each string is one alternative, every word of it needed; word stems
# are matched as bio/bio.js does (so 'secret' is secrete/secretes/secretion, 'make' is also produce/made, 'increas' is
# also rise/raise, 'decreas' is also fall/drop/reduce). Each alternative is the marking scheme's own answer (or an accept)
# in a student's words; where the scheme's answer is a note to the examiner ("named hormone", "correct matching
# function", "deficiency symptom to match hormone named") the keys are the answers that note stands for.
# The marker can't tell "adrenal" from "adrenaline" (one is the start of the other), so a gland point and a hormone
# point that both turn on that word are earned together; the same goes for "duct" and "ductless".
def _k(*alts):
    return [{'w': a.split(), 'n': len(a.split())} for a in alts]


def _o(*alts):
    """Keys whose words must come in this order, only small words between them: 'growth hormon' is "growth hormone",
    not "a hormone that controls growth"."""
    return [{'w': a.split(), 'n': len(a.split()), 'o': True} for a in alts]


def _c(*alts):
    """Keys whose words must all be in one part of a sentence: 'inhibit tsh' is "high thyroxine inhibits TSH", not "TSH
    is made in the pituitary, and insulin inhibits ..."."""
    return [{'w': a.split(), 'n': len(a.split()), 'c': True} for a in alts]


def _sx(*alts):
    """Each alternative with 'sex' also with 'sexu': "sexual" is stemmed to 'sexu', which 'sex' (three letters) doesn't match."""
    out = []
    for a in alts:
        out.append(a)
        if 'sex' in a.split():
            out.append(' '.join('sexu' if w == 'sex' else w for w in a.split()))
    return out


def _x(firsts, seconds):
    """Every pairing of a word from firsts with one from seconds ('insulin diabet', 'insulin thirst', ...)."""
    return [f'{a} {b}' for a in firsts for b in seconds]


# ---------------------------------------------------------------- what the keys share
# Hormones by name. Sex hormones apart, for 2013's "hormones, other than sex hormones".
_SEX = ['testosteron', 'oestrogen', 'estrogen', 'progesteron']
_OTHER = ['insulin', 'glucagon', 'thyrox', 'adrenalin', 'epinephrin', 'noradrenalin', 'adh', 'vasopressin', 'antidiuret', 'fsh', 'lh', 'tsh',
          'acth', 'oxytocin', 'prolactin', 'somatotrop', 'parathormon', 'pth', 'calcitonin', 'cortisol', 'aldosteron', 'melatonin', 'msh',
          'trh', 'gh', 'luteini']
_PHRASES = ['growth hormon', 'anti diuret', 'follic stimul', 'thyroid stimul', 'parathyroid hormon']
_NAMES = _k(*_OTHER, *_SEX) + _o(*_PHRASES)
_NAMES_NON_SEX = _k(*_OTHER) + _o(*_PHRASES)
# The pituitary's own (2019's list: ACTH, FSH, GH, LH, TSH, ADH, oxytocin, prolactin, MSH).
_PIT_NAMES = _k('acth', 'fsh', 'gh', 'lh', 'tsh', 'adh', 'vasopressin', 'antidiuret', 'oxytocin', 'prolactin', 'msh', 'somatotrop', 'luteini',
                'corticotrop') + _o('growth hormon', 'anti diuret', 'follic stimul', 'thyroid stimul')
# Endocrine glands, and where each one is ("precise location": the neck, the base of the brain, on the kidneys ...).
_GLANDS = _k('pituitar', 'hypophys', 'thyroid', 'parathyroid', 'adrenal', 'pancrea', 'islet', 'langerhan', 'testis', 'ovary', 'hypothalam',
             'pineal', 'thymus')
_LOCATIONS = _k('neck', 'throat', 'trachea', 'larynx', 'windpipe', 'voice box', 'brain', 'skull', 'hypothalam', 'kidney', 'abdomen', 'stomach',
                'duodenum', 'intestin', 'liver', 'scrotum', 'groin', 'pelvi', 'uterus', 'womb', 'fallopian', 'oviduct', 'chest', 'sternum',
                'breastbone', 'thyroid')
# Blood sugar regulated: insulin's (or glucagon's) role, "regulates blood sugar or explained".
_SUGAR_FN = _k(*_x(['lower', 'decreas', 'regul', 'control', 'increas', 'balanc', 'keep', 'convert'], ['sugar', 'glucose']),
               'glycogen', 'uptake glucose', 'absorb glucose', 'glucose cell')
# What adrenaline (or another adrenal hormone) does: "fight or flight or other correct function".
_ADR_FN = _k('fight flight', 'heart rate', 'heartbeat', 'breath', 'emergenc', 'stress', 'danger', 'threat', 'pupil', 'prepar body',
             'prepar action', 'blood pressur', 'blood sugar', 'blood glucose', 'glycogen', 'alert', 'salt', 'sodium')
# What the pituitary's hormones do (2019's "correct matching function").
_PIT_FN = _k('growth', 'water', 'urine', 'permeab', 'reabsorb', 'follic', 'egg', 'ovum', 'oestrogen', 'estrogen', 'ovulat', 'corpus luteum',
             'progesteron', 'sperm', 'testosteron', 'thyroid', 'thyrox', 'adrenal', 'cortisol', 'uterus contract', 'contract uterus',
             'uterine contract', 'labour', 'birth', 'milk', 'lactat', 'pigment', 'melanin', 'skin')
# What any hormone does (2010's "role of hormone", 2013's "hormone function").
_FN = _SUGAR_FN + _PIT_FN + _ADR_FN + _k(*_sx('metabol', 'develop', 'heat', 'energy releas', 'respir', 'conserv water', 'osmoregul', 'calcium',
                                         'secondary sex', 'sex characterist', 'endometri', 'lining', 'pregnan', 'menstrua', 'sleep', 'immun'))
# Oestrogen's or progesterone's role ("secondary sexual characteristics or other correct").
_OVA_FN = _k(*_sx('secondary sex', 'sex characterist', 'female characterist', 'endometri', 'lining', 'thicken', 'pregnan', 'menstrua', 'breast',
             'hip', 'puberty', 'inhibit fsh', 'inhibit lh', 'stimul lh'))
# Testosterone's: secondary sexual characteristics or an example of one; the sex organs developing.
_SEC_SEX = _k(*_sx('secondary sex', 'sex characterist', 'male characterist', 'deep voice', 'voice deep', 'voice break', 'broken voice', 'larynx',
              'adam apple', 'facial hair', 'body hair', 'pubic hair', 'beard', 'hair', 'muscle', 'broad shoulder', 'shoulder'))
_SEX_ORGANS = _k(*_sx('sex organ', 'reproduct organ', 'genital', 'penis', 'scrotum', 'testis develop', 'testis grow'))
# Signs of too little of a hormone, of too much, and how either is put right (the generic lists, for an answer box of its
# own: the hormone is named in another box).
_DEF_WORDS = _k('diabet', 'hyperglyc', 'thirst', 'cretin', 'myxoedema', 'myxedema', 'goitre', 'goiter', 'tired', 'lethargi', 'fatigue',
                'sluggish', 'cold', 'dwarf', 'stunt', 'infertil', 'osteoporo', 'menopaus', 'hypothyroid', 'addison', 'tetany', 'spasm', 'cramp',
                'mental', 'dehydr', 'depress', 'hair loss', 'dry skin', 'weight gain', 'gain weight', 'obes', 'weight loss', 'lose weight',
                'short', 'high sugar', 'high glucose', 'glucose urine', 'sugar urine', 'frequent urin', 'slow metabol', 'low metabol',
                'slow heart', 'low heart', 'dilute urine', 'much urine', 'lot urine', 'low sperm', 'irregular period', 'slow growth',
                'poor growth', 'low calcium')
_EXC_WORDS = _k('hyperthyroid', 'grave', 'bulg', 'goitre', 'goiter', 'anxi', 'nervous', 'restless', 'hyperactiv', 'sweat', 'irritab',
                'insomnia', 'tremb', 'shak', 'gigant', 'acromegal', 'tall', 'hypoglyc', 'faint', 'dizz', 'coma', 'confus', 'unconscious',
                'cushing', 'aggress', 'acne', 'bald', 'hairy', 'panic', 'agitat', 'weight loss', 'lose weight', 'weight gain', 'heat', 'hot',
                'kidney stone', 'brittle', 'osteoporo', 'fast heart', 'high heart', 'rapid heart', 'heart rate', 'racing heart', 'blood pressur',
                'low sugar', 'low glucose', 'high metabol', 'fast metabol', 'increas metabol', 'water retent')
_COR_WORDS = _k('inject', 'tablet', 'pill', 'supplement', 'pump', 'surgery', 'surgic', 'operat', 'remov', 'iodine', 'iodis', 'insulin',
                'thyrox', 'hrt', 'diet', 'drug', 'medic', 'radioactiv', 'radiother', 'implant', 'transplant', 'desmopressin', 'carbimazol',
                'synthetic', 'artificial', 'replac', 'glucose', 'sugar', 'eat', 'beta block', 'exercis', 'treat')
# The same signs said with the hormone they belong to, where one answer box has both ("symptom to match hormone named").
_DEF_PAIRS = _k(*_x(['insulin'], ['diabet', 'hyperglyc', 'thirst', 'tired', 'fatigue', 'weight loss', 'lose weight', 'high sugar', 'high glucose',
                                  'glucose urine', 'sugar urine', 'frequent urin', 'lot urine', 'much urine']),
                *_x(['thyrox'], ['cretin', 'myxoedema', 'myxedema', 'goitre', 'goiter', 'tired', 'lethargi', 'fatigue', 'sluggish', 'cold',
                                 'weight gain', 'gain weight', 'obes', 'slow metabol', 'low metabol', 'slow heart', 'low heart', 'dry skin',
                                 'hair loss', 'mental', 'stunt', 'depress', 'hypothyroid', 'slow growth', 'poor growth']),
                *_x(['growth', 'somatotrop'], ['dwarf', 'short', 'stunt', 'small']),
                *_x(['adh', 'antidiuret', 'vasopressin'], ['diabet', 'dilute urine', 'much urine', 'lot urine', 'large volume', 'thirst',
                                                           'dehydr', 'frequent urin']),
                *_x(['testosteron'], ['infertil', 'low sperm', 'sperm count', 'secondary sex', 'secondary sexu', 'impoten', 'erectil', 'libido', 'breast',
                                      'muscle', 'hair']),
                *_x(['oestrogen', 'estrogen'], ['infertil', 'osteoporo', 'menopaus', 'irregular', 'period', 'hot flush', 'secondary sex', 'secondary sexu',
                                                'breast']),
                *_x(['progesteron'], ['miscarr', 'infertil', 'irregular', 'period']),
                *_x(['parathormon', 'pth'], ['calcium', 'tetany', 'spasm', 'cramp']),
                *_x(['cortisol', 'aldosteron'], ['addison'])) + _o('anti diuret diabet', 'parathyroid hormon calcium')
_EXC_PAIRS = _k(*_x(['thyrox'], ['hyperthyroid', 'grave', 'bulg', 'goitre', 'goiter', 'anxi', 'nervous', 'restless', 'hyperactiv', 'sweat',
                                 'irritab', 'insomnia', 'tremb', 'shak', 'weight loss', 'lose weight', 'thin', 'heat', 'fast heart', 'high heart',
                                 'rapid heart', 'heart rate', 'high metabol', 'fast metabol', 'increas metabol']),
                *_x(['growth', 'somatotrop'], ['gigant', 'acromegal', 'tall']),
                *_x(['insulin'], ['hypoglyc', 'low sugar', 'low glucose', 'faint', 'dizz', 'coma', 'shak', 'tremb', 'sweat', 'confus',
                                  'unconscious']),
                *_x(['adrenalin'], ['heart rate', 'fast heart', 'rapid heart', 'racing heart', 'blood pressur', 'anxi', 'sweat', 'pale',
                                    'stress', 'tremb', 'shak', 'panic', 'breath']),
                *_x(['testosteron'], ['aggress', 'acne', 'bald', 'hair', 'muscle']),
                *_x(['cortisol'], ['cushing', 'weight gain']),
                *_x(['adh', 'antidiuret', 'vasopressin'], ['water retent', 'concentr urine', 'little urine', 'less urine', 'dark urine']),
                *_x(['oestrogen', 'estrogen'], ['breast', 'weight gain', 'clot', 'bloat']),
                *_x(['parathormon', 'pth'], ['calcium', 'kidney stone', 'bone', 'osteoporo']))
# Feedback: one hormone's level acting on another's making (or on its own). Said in one part of a sentence, so "insulin
# lowers blood sugar" (nothing made or stopped) isn't it.
_FB_H = ['tsh', 'thyrox', 'insulin', 'glucagon', 'fsh', 'lh', 'oestrogen', 'estrogen', 'progesteron', 'testosteron', 'adh', 'trh', 'cortisol',
         'adrenalin']
_MADE = ['make', 'secret', 'releas']
_STRONG = ['inhibit', 'stimul', 'block', 'prevent', 'stop', 'switch', 'caus', 'trigger', 'suppress']


def _acts_on(targets):
    """A hormone (or 'itself') inhibited or stimulated: 'inhibits TSH', or 'decreases the release of TSH'."""
    main = [t for t in targets if t in ('tsh', 'thyrox', 'insulin', 'glucagon', 'fsh', 'lh', 'oestrogen', 'progesteron', 'hormon', 'itself', 'own')]
    return _c(*_x(_STRONG, targets)) + _c(*[f'{v} {t} {m}' for v in ('decreas', 'increas', 'lower') for t in main for m in _MADE])


# Nervous against hormonal: faster (or the hormone slower), shorter-lived (or the hormone's effect prolonged), electrical.
_FASTER = _k('fast', 'quick', 'rapid', 'slow', 'immediat', 'instant')
_LASTS = _k('short liv', 'short last', 'short term', 'short time', 'brief', 'prolong', 'long last', 'last long', 'long term', 'long time',
            'last longer')
_TARGETS = _k('many organ', 'many target', 'many tissue', 'many part', 'many cell', 'many place', 'several organ', 'widespread', 'whole body',
              'throughout body', 'diffuse')
# Hormone supplements in use (2018's list, and 2010's examples).
_TREAT_DEFICIENCY = _k(*_x(['treat', 'cure', 'correct', 'replac', 'inject', 'supplement'], ['deficien', 'diabet', 'lack', 'low', 'dwarf',
                                                                                             'cretin', 'myxoedema', 'condit']),
                       'insulin diabet', 'insulin inject', 'thyrox tablet', 'diabet', 'deficien')

OVERRIDES = {
    # The picture each answer needs, cut from the paper page (box: left, top, width, height in % of the page).
    'dia': {
        '2007-Q15b': {'fig': [{'img': 'assets/bio/papers/2007-p10.webp', 'box': [15.0, 29.6, 73.9, 14.0]}]},  # the table to fill in
        '2023-Q17a': {'fig': [{'img': 'assets/bio/papers/2023c-p09.webp', 'box': [73.6, 9.9, 16.4, 23.3]}]},  # the body outline to draw on
        '2024-Q16b': {'fig': [{'img': 'assets/bio/papers/2024c-p07.webp', 'box': [61.8, 42.9, 29.3, 44.2]}]},  # glands X, Y and Z
        'S1-Q1d': {'fig': [{'img': 'assets/bio/papers/s1-p05.webp', 'box': [20.2, 39.6, 59.2, 30.2]}]},  # blood glucose after a meal
    },
    # "Copy the outline ... Draw in each of the following endocrine glands": a drawing (the student ticks the scheme).
    'kind': {'2023-Q17a(iii)': 'draw'},
    'points': {
        '2004-Q12c(iv)': {
            0: _k('receptor', 'detect'),
            1: _k('receptor skin', 'detect skin', 'sensor skin'),
            2: _k('receptor medulla', 'receptor brain', 'detect brain', 'brain detect', 'hypothalam'),
            3: _k('shiver'),
            4: _k('generat heat', 'make heat', 'releas heat', 'heat generat', 'more heat'),
            5: _k('hair stand', 'hair erect', 'hair rais', 'hair up', 'goose', 'piloerect'),
            6: _k('air trap', 'trap air'),
            7: _k('vasoconstric', 'constrict', 'vessel narrow', 'arteriol narrow', 'capillar narrow', 'narrow vessel', 'narrow arteriol',
                  'less blood skin', 'blood away skin'),
            8: _k('increas metabol', 'increas respir', 'more metabol', 'more respir', 'fast metabol', 'high metabol', 'speed metabol'),
            9: _k(*_x(['thyrox', 'adrenalin'], ['metabol', 'respir', 'heat', 'energy', 'releas', 'secret', 'increas', 'make']))},
        '2005-Q13a(ii)': {0: _SEC_SEX, 1: _SEX_ORGANS, 2: _k('sperm', 'spermatogen')},
        # Exocrine: ducts ("ducted" is duct / ducts, not "ductless"). Endocrine: ductless, said of the endocrine gland (a
        # plain "duct" would earn the word "ductless"), or hormone-producing.
        '2005-Q14c(i)': {0: _k('ducted', 'tube'),
                         1: _k('hormon') + _c('endocrine ductless', 'no ducted', 'not ducted', 'without ducted', 'lack ducted')},
        '2005-Q14c(ii)': {1: _SUGAR_FN},
        '2007-Q15a(iv)': {0: _k('growth'), 1: _k(*_sx('primary sex')) + _SEX_ORGANS, 2: _SEC_SEX, 3: _k('sperm'),
                          4: _k(*_sx('behav', 'aggress', 'libido', 'sex drive', 'sex desire'))},
        '2007-Q15b(i)': {0: _k('ductless', 'blood')},
        '2007-Q15b(ii)': {0: _k('chemic'), 1: _k('slow') + _o(*_x(['nerv', 'nerv action', 'nerv impuls', 'nerv respons', 'nerv transmis'], ['fast', 'quick', 'rapid', 'immediat'])),
                          2: _k('prolong', 'long last', 'last long', 'long term', 'long time', 'last longer') + _o(*_x(['nerv', 'nerv action', 'nerv impuls', 'nerv respons', 'nerv effect'], ['short', 'brief'])),
                          3: _TARGETS},
        '2007-Q15b(iii)': {0: _k('islet', 'langerhan'), 1: _SUGAR_FN, 2: _k('neck', 'throat', 'trachea', 'larynx', 'windpipe'), 3: _k('thyrox'),
                           4: _k('growth', 'metabol'), 5: _k('adrenal'), 6: _k('kidney'), 7: _k('adrenalin', 'epinephrin')},
        '2007-Q15b(iv)': {0: _NAMES, 1: _DEF_PAIRS, 2: _COR_WORDS},
        '2010-Q11c(ii)': {0: _GLANDS, 1: _LOCATIONS, 2: _NAMES, 3: _FN, 4: _DEF_WORDS},
        '2010-Q11c(iii)': {0: _k('diabet', 'insulin'), 1: _k('contracep', 'pill', 'birth control')},
        '2011-Q11c(i)': {0: _k('messeng', 'product endocrine', 'endocrine gland', 'ductless gland')},
        '2011-Q11c(ii)': {
            0: _k(*_x(['make', 'secret', 'releas', 'form'], ['one place', 'one site', 'one location', 'one part', 'one area', 'one region',
                                                              'one tissue', 'one organ', 'specif place', 'specif site', 'specif part'])),
            1: _k(*_x(['act', 'work', 'effect', 'function'], ['differ', 'another', 'elsewhere', 'other', 'distant', 'away']),
                  'differ place', 'differ site', 'differ location', 'differ part', 'another place', 'another site', 'another location',
                  'another part', 'elsewhere', 'target'),
            2: _k('prolong', 'long last', 'last long', 'long term', 'long time', 'last longer')},
        '2011-Q11c(iii)': {
            0: _k('level hormon', 'amount hormon', 'concentr hormon', 'hormon blood'),
            1: _k('control', 'regul', 'inhibit', 'stimul', 'switch off', 'affect', 'influenc', 'determin') +
               _c(*[f'{v} {m}' for v in ('stop', 'decreas', 'increas', 'lower') for m in _MADE]),
            2: _NAMES,
            3: _acts_on(_FB_H)},
        '2011-Q11c(iv)': {0: _DEF_PAIRS},
        '2012-Q13a(ii)': {0: _FASTER + _k('short liv', 'short last', 'short term', 'short time', 'brief', 'electric')},
        '2013-Q1d(d)': {0: _k('catalys', 'speed up', 'speed reaction', 'fast reaction', 'increas rate reaction', 'activ energy'),
                        1: _k('messeng', 'carri blood', 'travel blood', 'transport blood', 'endocrine gland', 'ductless gland', 'target organ')},
        '2013-Q10a(ii)': {0: _k('ductless')},
        '2013-Q10a(iii)': {0: _k('endocrine exocrine', *_x(['hormon', 'insulin', 'glucagon'], ['enzyme', 'digest', 'juice', 'amylase', 'lipase',
                                                                                           'trypsin', 'protease']))},
        '2013-Q10b(ii)': {0: _NAMES_NON_SEX, 1: _NAMES_NON_SEX, 2: _LOCATIONS, 3: _LOCATIONS, 4: _FN, 5: _FN},
        '2013-Q10b(iii)': {0: _DEF_WORDS, 1: _EXC_WORDS, 2: _COR_WORDS},
        '2013-Q10b(iv)': {0: _k('blood', 'chemic'), 1: _k('electric')},
        '2016-Q15c(ii)': {0: _EXC_PAIRS},
        '2018-Q14c(i)': {0: _k('ductless', 'blood', 'no ducted', 'without ducted')},
        '2018-Q14c(ii)': {1: _k('islet', 'langerhan'), 3: _SUGAR_FN},
        '2018-Q14c(iii)': {
            0: _k(*_x(['make', 'secret', 'releas', 'level', 'amount', 'concentr', 'inhibit'],
                      ['hormon', 'thyrox', 'tsh', 'insulin', 'fsh', 'lh', 'oestrogen', 'progesteron'])),
            1: _k('inhibit', 'stimul', 'suppress', 'switch off', 'block') +
               _c(*[f'{v} {m}' for v in ('stop', 'decreas', 'increas', 'lower', 'prevent') for m in _MADE]),
            2: _k('itself', 'another hormon', 'other hormon', 'second hormon', 'differ hormon', 'own make', 'own secret', 'own releas') +
               _acts_on(_FB_H),
            3: _k('positiv', 'negativ')},
        '2018-Q14c(iv)': {0: _TREAT_DEFICIENCY, 1: _k('contracep', 'pill', 'birth control'), 2: _k('fertil', 'infertil', 'ivf'),
                          3: _k('hrt', 'menopaus') + _o('hormon replac'), 4: 'self'},
        '2019-Q14a(iv)': {0: _k('ductless', 'blood', 'lymph', 'no ducted', 'without ducted')},
        '2019-Q14a(v)': {0: _PIT_NAMES, 1: _PIT_FN},
        '2021-Q17c(vi)': {0: _FASTER, 1: _k('electric', 'chemic'), 2: _LASTS},
        '2023-Q17a(i)': {0: _k('ductless'), 1: _k('blood')},
        '2023-Q17a(ii)': {0: _k('pancrea', 'testis', 'ovary', 'kidney', 'liver'),
                          1: _k('insulin', 'glucagon', 'testosteron', 'oestrogen', 'estrogen', 'progesteron', 'erythropoietin', 'renin',
                                'calcitriol'),
                          2: _k('juice', 'enzyme', 'amylase', 'lipase', 'trypsin', 'protease', 'bicarbon', 'sperm', 'egg', 'ova', 'ovum',
                                'urine', 'bile')},
        '2023-Q17a(iv)': {0: _k('thyrox'), 1: _k('metabol'), 2: _k('adrenalin', 'epinephrin'), 3: _ADR_FN},
        '2024-Q16b(ii)': {0: _k('thyrox', 'calcitonin', 'triiodothyronin'),
                          1: _k('metabol', 'calcitonin calcium', *_x(['thyrox', 'thyroid'], ['growth', 'grow', 'heat', 'respir'])),
                          2: _k('adrenalin', 'epinephrin', 'noradrenalin', 'cortisol', 'aldosteron'), 3: _ADR_FN,
                          4: _k('oestrogen', 'estrogen', 'progesteron'), 5: _OVA_FN},
        '2024-Q16b(iii)': {0: _DEF_WORDS, 1: _EXC_WORDS, 2: _COR_WORDS},
        '2024-Q16b(iv)': {
            0: _k(*_x(['concentr', 'secret', 'level', 'amount', 'make', 'releas', 'high', 'low', 'increas', 'decreas'],
                      ['hormon', 'thyrox', 'tsh', 'insulin', 'glucagon', 'fsh', 'lh', 'oestrogen', 'progesteron', 'testosteron', 'adh'])),
            1: _acts_on(_FB_H + ['hormon', 'itself', 'own'])},
        '2026-Q7d(d)': {0: _k('top kidney', 'above kidney', 'on kidney', 'over kidney', 'upon kidney'), 1: _k('adrenalin', 'epinephrin')},
        # A time on the axis: from about 20 to 30 minutes, where the glucose starts to rise (X); about 80 to 100, where it
        # has fallen back to or below the resting level (Y).
        'S1-Q1d(iii)': {0: _k(*[str(t) for t in range(20, 31)], 'glucose increas', 'sugar increas', 'start increas', 'begin increas', 'after eat')},
        'S1-Q1d(iv)': {0: _k(*[str(t) for t in range(80, 101)], 'below rest', 'below start', 'below normal', 'below origin', 'fall back',
                             'back normal', 'glucose low', 'sugar low', 'lowest', 'minimum')},
    },
}

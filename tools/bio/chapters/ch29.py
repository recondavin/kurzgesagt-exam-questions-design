"""Chapter 29, the urinary system: its diagrams and how its exam questions use them.

Diagrams (tools/bio/build_bio_diagrams.py builds them into bio/d29.js):
  MAKERS        one function per diagram to memorise, each returning finish(...) from bio_art.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is, from its description,
  ANCHOR_WORDS  the words that name each anchor on those diagrams (exam letters go to that anchor),
  OVERRIDES     per-question corrections: two-panel diagrams and graphs, tap answers, answer types.
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from bio_art import label, part, tube, vessel, flow, finish, RED, BLUE, TUBE_D, BG  # noqa: E402

CHAPTER = 29
TOPIC = 'The urinary system'


def bean(cx, cy, w, h, flip=False):
    """A kidney outline with its hilum (the dent) facing the middle of the body."""
    s = -1 if flip else 1
    x0 = cx - s * w / 2
    x1 = cx + s * w / 2
    return (f'M{cx} {cy - h / 2}C{x0 - s * w * .15:.1f} {cy - h / 2} {x0 - s * w * .1:.1f} {cy + h / 2} {cx} {cy + h / 2}'
            f'C{x1 + s * w * .05:.1f} {cy + h / 2} {x1:.1f} {cy + h * .18:.1f} {cx + s * w * .22:.1f} {cy:.1f}'
            f'C{x1:.1f} {cy - h * .18:.1f} {x1 + s * w * .05:.1f} {cy - h / 2} {cx} {cy - h / 2}Z')


def urinary():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Kidneys: the right kidney (on the left as you look) sits a little lower, under the liver.
    kid = ''
    for cx, cy, flip in [(132, 104, False), (348, 92, True)]:
        kid += f'<path d="{bean(cx, cy, 78, 112, flip)}" fill="#C4683F" stroke="#7A3A2A" stroke-width="2.4"/>'
        kid += f'<path d="{bean(cx, cy, 52, 84, flip)}" fill="#D9895F"/>'
    body += part(0, kid)
    # The aorta (on the body's left) and its renal arteries.
    art = vessel('M262 10V300', RED, 12) + vessel('M262 98H420', RED, 6) + vessel('M262 112H156', RED, 6)
    body += part(1, art)
    # The vena cava (on the body's right) and the renal veins.
    vein = vessel('M218 10V300', BLUE, 14) + vessel('M218 84H420', BLUE, 6) + vessel('M218 98H158', BLUE, 6)
    body += part(2, vein)
    # Ureters run down from each renal pelvis to the bladder.
    ure = tube('M154 128C170 190 196 226 226 250', 6) + tube('M326 118C312 190 286 226 256 250', 6)
    ure += flow('M154 128C170 190 196 226 226 250', '#FFFFFF', 3) + flow('M326 118C312 190 286 226 256 250', '#FFFFFF', 3)
    body += part(3, ure)
    body += part(4, '<path d="M200 252C200 228 280 228 280 252C280 286 258 296 240 296C222 296 200 286 200 252Z" fill="#F2948C" stroke="#B5543A" stroke-width="2.4"/>'
                    '<path d="M214 262Q240 276 266 262" fill="none" stroke="#E07A70" stroke-width="2"/>')
    body += part(5, tube('M240 296V318', 7) + '<rect x="230" y="298" width="20" height="6" rx="3" fill="#5B3172"/>')
    labels = [
        {'text': 'Kidney', 'keys': [['kidney']]},
        {'text': 'Renal artery', 'keys': [['renal', 'arter'], ['artery']]},
        {'text': 'Renal vein', 'keys': [['renal', 'vein'], ['vein']]},
        {'text': 'Ureter', 'keys': [['ureter']]},
        {'text': 'Bladder', 'keys': [['bladder']]},
        {'text': 'Urethra', 'keys': [['urethra']]},
    ]
    body += label(0, 'KIDNEY', 'end', 76, 160, 112, 140)
    body += label(1, 'RENAL ARTERY', 'end', 472, 140, 412, 98)
    body += label(2, 'RENAL VEIN', 'end', 472, 40, 412, 84)
    body += label(3, 'URETER', 'end', 120, 214, 176, 192)
    body += label(4, 'BLADDER', 'start', 300, 262, 274, 262)
    body += label(5, 'URETHRA', 'start', 270, 308, 244, 310)
    anchors = {'kidney': [112, 140], 'renalArtery': [412, 98], 'renalVein': [412, 84], 'aorta': [262, 40], 'venaCava': [218, 40],
               'ureter': [176, 192], 'bladder': [262, 262], 'urethra': [242, 312], 'sphincter': [240, 301]}
    parts = ['Kidneys', 'Aorta and renal arteries', 'Vena cava and renal veins', 'Ureters', 'Bladder', 'Urethra and sphincter']
    return finish('urinary', 'The urinary system', 'the human urinary system',
                  'Two kidneys, a ureter from each one down to the bladder, and the urethra leading out. Show the renal artery and vein at each kidney.',
                  'The urinary system', 'Two kidneys, each with a renal artery from the aorta and a renal vein to the vena cava. A ureter runs from each kidney down to the bladder, and the urethra leads out of the bladder.',
                  body, labels, anchors, parts)


def kidney():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    outline = 'M200 22C110 22 70 92 72 166C74 244 120 300 196 300C250 300 280 268 284 232C288 206 262 196 262 166C262 136 288 124 284 98C280 52 252 22 200 22Z'
    cortex = f'<path d="{outline}" fill="#C4683F" stroke="#6B2D3A" stroke-width="3"/>'
    inner = 'M198 46C128 46 98 104 100 166C102 230 136 276 194 276C234 276 254 252 256 228C258 210 236 196 236 166C236 138 258 124 256 104C252 68 236 46 198 46Z'
    cortex += f'<path d="{inner}" fill="#E9A47F"/>'
    body += part(0, cortex)
    # Medulla: cone-shaped pyramids pointing in towards the pelvis.
    pyr = ''
    for (x1, y1), (x2, y2), (tx, ty) in [((118, 92), (168, 64), (196, 120)), ((104, 156), (110, 104), (190, 146)), ((110, 220), (104, 172), (190, 184)),
                                          ((154, 262), (116, 236), (196, 210)), ((214, 266), (176, 270), (206, 222))]:
        pyr += f'<path d="M{x1} {y1}Q{(x1 + x2) / 2 - 6} {(y1 + y2) / 2 - 6} {x2} {y2}L{tx} {ty}Z" fill="#9C3F2C"/>'
        pyr += f'<path d="M{(x1 + x2) / 2:.0f} {(y1 + y2) / 2:.0f}L{tx} {ty}" stroke="#B5543A" stroke-width="1.2"/>'
    body += part(1, pyr)
    # The renal pelvis gathers urine and funnels it into the ureter.
    pelvis = ('<path d="M196 112C214 104 236 120 242 140C250 160 252 176 244 196C236 214 214 228 196 222C204 206 206 186 206 168C206 150 204 128 196 112Z" fill="#F2C25C" stroke="#A9822F" stroke-width="2"/>'
              '<path d="M196 112C188 126 184 140 194 148M190 150C182 162 182 174 194 182M196 222C190 210 186 200 194 190" fill="none" stroke="#A9822F" stroke-width="2"/>')
    body += part(2, pelvis)
    body += part(3, tube('M244 196C264 214 274 236 272 270C270 290 268 304 268 320', 12) + flow('M244 196C264 214 274 236 272 270C270 290 268 304 268 320', '#FFFFFF', 3))
    body += part(4, vessel('M246 150H330C352 150 362 140 380 140H480', RED, 12) + vessel('M222 132L246 150', RED, 6) + vessel('M222 168L246 150', RED, 6))
    body += part(5, vessel('M250 176H330C352 176 362 186 380 186H480', BLUE, 14) + vessel('M226 196L250 176', BLUE, 6))
    labels = [
        {'text': 'Cortex', 'keys': [['cortex']]},
        {'text': 'Medulla (pyramids)', 'keys': [['medulla'], ['pyramid']]},
        {'text': 'Renal pelvis', 'keys': [['pelvis']]},
        {'text': 'Ureter', 'keys': [['ureter']]},
        {'text': 'Renal artery', 'keys': [['arter']]},
        {'text': 'Renal vein', 'keys': [['vein']]},
    ]
    body += label(0, 'CORTEX', 'start', 300, 34, 262, 64)
    body += label(1, 'MEDULLA', 'top', 52, 268, 128, 196)
    body += label(2, 'RENAL PELVIS', 'start', 300, 84, 222, 150)
    body += label(3, 'URETER', 'start', 296, 290, 270, 284)
    body += label(4, 'RENAL ARTERY', 'end', 472, 118, 430, 140)
    body += label(5, 'RENAL VEIN', 'end', 472, 214, 430, 186)
    anchors = {'cortex': [262, 64], 'medulla': [128, 196], 'pyramid': [128, 196], 'pelvis': [222, 150], 'ureter': [270, 284],
               'renalArtery': [430, 140], 'renalVein': [430, 186], 'capsule': [200, 24]}
    parts = ['Cortex', 'Medulla (pyramids)', 'Renal pelvis', 'Ureter', 'Renal artery', 'Renal vein']
    return finish('kidney', 'A section through the kidney', 'a vertical section through a kidney',
                  'An outer cortex, the medulla with its cone-shaped pyramids, and the pelvis in the middle draining into the ureter. The renal artery and vein join at the dent.',
                  'Vertical section through a kidney', 'A kidney cut in half from top to bottom. The outer layer is the cortex; inside it the medulla is made of cone-shaped pyramids. They drain into the renal pelvis, which leads into the ureter. The renal artery brings blood in and the renal vein takes it away.',
                  body, labels, anchors, parts)


def nephron():
    body = f'<rect width="480" height="320" fill="#FBEFE3"/><rect y="168" width="480" height="152" fill="#F3DCCB"/>'
    # The zone names are class bio-zone: hidden on exam-question diagrams, which give them as labels or ask where a part is.
    body += part(0, '<path d="M0 168H480" stroke="#C4683F" stroke-width="2" stroke-dasharray="8 6"/>'
                    '<text class="bio-zone" x="8" y="160" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11" fill="#9C3F2C">CORTEX</text>'
                    '<text class="bio-zone" x="8" y="184" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11" fill="#9C3F2C">MEDULLA</text>')
    # The art is drawn in its own space and moved right and down, leaving room for labels at the top and left.
    def at(x):
        return f'<g transform="translate(40 18)">{x}</g>'
    # Blood in: the wide afferent arteriole into the glomerulus, a knot of capillaries.
    aff = 'M-40 34C10 34 56 46 78 60'
    glom = ('<g fill="none" stroke="#E5484D" stroke-width="3" stroke-linecap="round">'
            '<path d="M80 62c6-12 22-12 24 0s-16 14-12 2 18-14 22-2-12 16-18 6M86 76c4 8 18 8 20-2s-14-10-12 0 14 6 16-4"/></g>')
    body += part(1, at(vessel(aff, RED, 7) + flow(aff) + glom))
    # Bowman's capsule: the cup around the glomerulus, open where the arterioles go in.
    cap = ('<path d="M79 54C88 36 112 32 126 44C140 56 140 84 126 96C112 108 88 104 79 88" fill="none" stroke="#A9822F" stroke-width="12" stroke-linecap="round"/>'
           '<path d="M79 54C88 36 112 32 126 44C140 56 140 84 126 96C112 108 88 104 79 88" fill="none" stroke="#F7D27A" stroke-width="8" stroke-linecap="round"/>')
    body += part(2, at(cap))
    # Blood out: the narrower efferent arteriole, which then forms capillaries around the tubule.
    eff = 'M80 82C66 96 62 112 80 126C100 140 150 128 176 140'
    body += part(3, at(vessel(eff, '#C2364A', 4.5) + flow(eff)))
    # Proximal convoluted tubule: coiled, in the cortex.
    pct = 'M134 70C152 66 160 48 176 50C194 52 188 76 172 84C156 92 160 116 180 112C200 108 196 84 212 80C230 76 236 100 226 116C218 128 214 140 214 150'
    body += part(4, at(tube(pct) + flow(pct, TUBE_D, 3)))
    # Loop of Henle: down into the medulla and back up.
    loop = 'M214 150V276C214 290 242 290 242 276V150'
    body += part(5, at(tube(loop) + flow(loop, TUBE_D, 3.4)))
    # Distal convoluted tubule: coiled again, back in the cortex, then into the collecting duct.
    dct = 'M242 150C242 132 262 132 266 116C270 98 252 90 260 76C268 62 290 70 292 88C294 104 312 108 322 96C334 82 344 64 372 64'
    body += part(6, at(tube(dct) + flow(dct, TUBE_D, 3)))
    # Collecting duct: carries urine down through the medulla to the pelvis; other nephrons join it too.
    duct = tube('M386 -18V302', 15) + tube('M372 64H386', 11) + ''.join(tube(f'M386 {y}H{x}', 6) for x, y in [(410, 120), (404, 200), (412, 262)])
    body += part(7, at(duct + flow('M386 -10V300', TUBE_D, 3)))
    # Capillaries wrap the tubules, and the renal venule takes the blood away.
    caps = ('<path d="M176 140C192 146 200 156 202 172V276C202 298 254 298 254 276V160C254 140 290 124 300 112" fill="none" stroke="#9B4A8C" stroke-width="2.4"/>'
            '<path d="M202 190H214M202 226H214M202 258H214M242 200H254M242 236H254M242 266H254" stroke="#9B4A8C" stroke-width="2"/>')
    ven = 'M300 112C316 128 330 150 330 180C330 200 300 214 270 214H150C110 214 70 210 -40 210'
    body += part(8, at(caps + vessel(ven, BLUE, 6) + flow(ven)))
    labels = [
        {'text': 'Afferent arteriole', 'keys': [['afferent']]},
        {'text': 'Glomerulus', 'keys': [['glomerul']]},
        {'text': "Bowman's capsule", 'keys': [['bowman'], ['capsule']]},
        {'text': 'Efferent arteriole', 'keys': [['efferent']]},
        {'text': 'Proximal convoluted tubule (PCT)', 'keys': [['proximal'], ['pct']]},
        {'text': 'Loop of Henle', 'keys': [['henle'], ['loop']]},
        {'text': 'Distal convoluted tubule (DCT)', 'keys': [['distal'], ['dct']]},
        {'text': 'Collecting duct', 'keys': [['collecting'], ['duct']]},
        {'text': 'Capillaries and renal venule', 'keys': [['capillar'], ['venule'], ['vein']]},
    ]
    body += label(0, 'AFFERENT ARTERIOLE', 'start', 6, 16, 64, 55)
    body += label(1, 'GLOMERULUS', 'top', 60, 108, 132, 88)
    body += label(2, "BOWMAN'S CAPSULE", 'start', 186, 16, 164, 60)
    body += label(3, 'EFFERENT ARTERIOLE', 'start', 6, 262, 106, 122)
    body += label(4, 'PCT', 'bottom', 214, 50, 214, 102)
    body += label(5, 'LOOP OF HENLE', 'end', 236, 292, 268, 305)
    body += label(6, 'DCT', 'start', 344, 16, 330, 100)
    body += label(7, 'COLLECTING DUCT', 'end', 410, 304, 426, 290)
    body += label(8, 'CAPILLARIES', 'start', 310, 252, 294, 246)
    anchors = {'afferent': [64, 55], 'glomerulus': [134, 88], 'capsule': [164, 60], 'efferent': [106, 122], 'pct': [214, 102],
               'descending': [254, 248], 'loop': [268, 305], 'ascending': [282, 248], 'dct': [330, 100], 'duct': [426, 50],
               'capillaries': [294, 246], 'venule': [100, 228], 'cortex': [36, 150], 'medulla': [36, 200]}
    parts = ['Cortex and medulla', 'Afferent arteriole and glomerulus', "Bowman's capsule", 'Efferent arteriole', 'Proximal convoluted tubule',
             'Loop of Henle', 'Distal convoluted tubule', 'Collecting duct', 'Capillaries and renal venule']
    return finish('nephron', 'A nephron and its blood supply', 'a nephron and its blood supply',
                  "Start with Bowman's capsule round the glomerulus, then the coiled PCT, the loop of Henle dipping into the medulla, the coiled DCT and the collecting duct. Add the arterioles and capillaries.",
                  'A nephron and its blood supply', "Blood arrives in the wide afferent arteriole and enters the glomerulus, a knot of capillaries inside Bowman's capsule, and leaves in the narrower efferent arteriole, which forms capillaries around the tubule and drains into the renal venule. From the capsule the tubule runs as the coiled proximal convoluted tubule, down into the medulla and back as the loop of Henle, then the coiled distal convoluted tubule, into the collecting duct.",
                  body, labels, anchors, parts)


MAKERS = [urinary, kidney, nephron]


# Where each structure is on a base diagram: the words that name it, in the order they are checked.
ANCHOR_WORDS = {
    'nephron': [('ascending', ['ascending']), ('descending', ['descending']), ('efferent', ['efferent', 'narrower arteriole']),
                ('afferent', ['afferent', 'arteriole']), ('glomerulus', ['glomerul']), ('capsule', ['bowman', 'capsule']),
                ('pct', ['proximal', 'pct']), ('dct', ['distal', 'dct']), ('capillaries', ['capillar', 'blood vessel']), ('loop', ['henle', 'loop']),
                ('duct', ['collecting']), ('venule', ['venule', 'vein']), ('cortex', ['cortex']), ('medulla', ['medulla'])],
    'kidney': [('cortex', ['cortex']), ('medulla', ['medulla', 'pyramid']), ('pelvis', ['pelvis']), ('ureter', ['ureter']),
               ('renalArtery', ['artery']), ('renalVein', ['vein'])],
    'urinary': [('kidney', ['kidney']), ('ureter', ['ureter']), ('bladder', ['bladder']), ('urethra', ['urethra']), ('renalArtery', ['artery']),
                ('renalVein', ['vein']), ('aorta', ['aorta']), ('venaCava', ['vena cava']), ('sphincter', ['sphincter'])],
}


def base_of(what):
    w = what.lower()
    if 'graph' in w and 'nephron' not in w:
        return None
    if 'nephron' in w:
        return 'nephron'
    if 'urinary system' in w:
        return 'urinary'
    if 'kidney' in w:
        return 'kidney'
    return None


def _keys(*groups):
    """Every way of saying a point: one word from each group (a group lists the ways to say that word)."""
    from itertools import product
    groups = [g if isinstance(g, (list, tuple)) else [g] for g in groups]
    return [{'w': list(c), 'n': len(c)} for c in product(*groups)]


# Words the hand-written keys share. Stems, as the marker compares them (bio/bio.js).
_STEADY = ['constant', 'stable', 'steady', 'same', 'balanc']       # the internal environment kept the same
_KEEP = ['maint', 'keep', 'regul']                                 # maintain / maintenance, keep, regulate / regulation
# Homeostasis: keeping a constant internal environment ("conditions inside the body steady"); "external" never earns it.
_HOMEO = _keys(['intern', 'inside'], ['environ', 'condi'], _STEADY + _KEEP)
# Excretion: removing (eliminating, getting rid of) waste made by metabolism (or made by the body / its cells).
_REMOVE = ['remov', 'elimin']
_EXCRETION = _keys(_REMOVE, 'waste', ['metabol', 'make']) + _keys(_REMOVE, 'product', 'metabol')
# Less urine: the volume is lowered.
_LESS_URINE = _keys(['low', 'lower', 'less', 'decreas', 'small'], ['volume', 'urine', 'amount'])
_FACTORS = ['temperature', 'ph', 'water', 'glucose', 'sugar', 'salt', 'co2']


def _one(*words):
    """Each word is enough on its own."""
    return [{'w': [w], 'n': 1} for w in words]


# "Maintenance (of ...)": keeping something steady, not just "keeping the body healthy".
_MAINTAIN = _one('maint') + _keys(['keep', 'regul'], _STEADY + ['intern', 'inside', 'environ', 'condi', 'level'])


# Per-question corrections the general rules can't work out: diagrams with two panels or graphs, the right
# answer areas for 'tap' parts, and answer types.
OVERRIDES = {
    'dia': {
        '2022-Q15b': {'panels': [
            {'base': 'kidney', 'marks': [{'t': 'A', 'a': 'cortex'}, {'t': 'B', 'a': 'medulla'}, {'t': 'C', 'a': 'pelvis'}]},
            {'base': 'nephron', 'marks': [{'t': 'Glomerulus', 'a': 'glomerulus', 'given': True}, {'t': 'DCT', 'a': 'dct', 'given': True},
                                          {'t': 'PCT', 'a': 'pct', 'given': True}, {'t': 'Capillary', 'a': 'capillaries', 'given': True},
                                          {'t': 'Loop of Henle', 'a': 'loop', 'given': True}]}]},
        '2025-Q17c': {'graphs': [{'title': 'X: Blood volume', 'trend': 'down'}, {'title': 'Y: ADH levels', 'trend': 'up'}]},
        '2018-Q6': {'base': 'nephron', 'marks': [{'t': 'X', 'a': 'capsule'}, {'t': 'Y', 'a': 'dct'}]},
    },
    'tap': {  # part id -> anchors that are right
        '2018-Q6(b)': ['dct', 'duct'],
        'S1-Q1e(ii)': ['glomerulus', 'capsule'],
    },
    # 2024's "Draw a large labelled diagram of the human nephron" is a drawing, like 2020's (the student ticks the scheme).
    'kind': {'2011-Q12b(ii)': 'draw', '2024-Q17c(ii)': 'draw'},
    # How many points count, where the scheme's rule reads wrong: 2005's "any five" is all of Q1 (this part is one
    # answer); the others count "any three" (or two) in each of two halves, so twice that over the part.
    'n': {'2005-Q1f(f)': 1, '2004-Q12b(ii)': 6, '2024-Q17c(iv)': 4, '2020-Q13c(iii)': 4},
    # Keys written by hand where the scheme's sentence made keys too strict for an answer in the student's own words.
    'points': {
        'S1-Q1e(iv)': {
            1: _keys('concentr', 'urine') + _keys(['conserv', 'save'], 'water'),
            2: _keys(['surv', 'live'], ['desert', 'dry', 'arid']) + _keys('surv', ['little', 'less', 'without', 'lack'], ['water', 'drink'])},
        '2026-Q17b(vii)': {0: _one('enzyme', 'metabol')},
        '2026-Q17c(i)': {0: _EXCRETION},
        '2026-Q17c(iv)': {0: _keys('too', 'large') + _keys('large', ['molecul', 'pass', 'fit', 'through'])},
        '2025-Q17c(i)': {0: _HOMEO},
        '2025-Q17c(iii)': {0: _keys('dist', ['tubul', 'convolut']) + _one('dct') + _keys('collect', 'duct')},
        '2025-Q17c(iv)': {0: _one('lower', 'decreas') + _LESS_URINE},
        '2025-Q17c(v)': {
            0: _keys('decreas', 'increas') + _keys('up', 'down') + _one('invers', 'opposit') + _keys('negat', ['correl', 'relation']),
            2: _keys('line', 'reduc') + _one('decreas', 'down', 'lower'),
            3: _keys('level', 'off') + _keys('same', 'start') + _keys('back', ['normal', 'start']) + _one('original', 'plateau', 'flat', 'steady', 'constant')},
        '2024-Q17c(iii)': {0: _keys(['cell', 'protein'], ['filtrate', 'blood']) + _one('platelet') + _keys('large', 'molecul')},
        '2023-Q6d(d)': {0: _keys('water', ['reabsorb', 'absorb']) + _keys('adh', 'permeab')},
        '2022-Q15a(i)': {0: _EXCRETION + _keys(_REMOVE, 'waste', 'cell'), 1: _HOMEO},
        '2022-Q15b(iv)': {0: _keys('forc', 'filter') + _one('ultrafiltr') + _keys('small', ['molecul', 'substanc'], ['forc', 'push', 'squeez'])},
        '2022-Q15b(vi)': {0: _keys('collect', 'duct') + _keys('dist', 'tubul') + _one('dct') + _keys(['more', 'increas'], 'permeab') + _keys('water', ['reabsorb', 'absorb']),
                          1: _LESS_URINE + _one('lower')},
        '2021-Q15a(i)': {0: _HOMEO},
        '2020-Q13a(i)': {0: _HOMEO},
        '2020-Q13a(iii)': {0: _EXCRETION + _keys(_REMOVE, 'waste', ['cell', 'body'])},
        '2020-Q13c(i)': {0: _keys('protein', ['none', 'no', 'not', 'doesnt', 'without', 'absent', 'lack']),
                         1: _keys('protein', 'large', ['too', 'molecul', 'cannot', 'pass', 'fit', 'through'])},
        '2020-Q13c(ii)': {0: _one('small', 'freely') + _keys('all', 'glucose', ['pass', 'filter'])},
        '2018-Q6(c)': {0: _keys(['more', 'increas'], 'permeab') + _keys('water', ['reabsorb', 'absorb'])},
        '2018-Q6(d)': {0: _keys(['high', 'increas'], ['salt', 'concentr', 'solute']) + _keys(['less', 'low', 'decreas', 'lack'], 'water') + _one('dehydr')},
        '2017-Q15a(i)': {0: _HOMEO},
        '2017-Q15a(ii)': {0: _one('enzyme', 'metabol')},
        '2016-Q12a(i)': {0: _EXCRETION},
        # The scheme lists no locations: urea is made in the liver, carbon dioxide in all cells (by respiration).
        '2016-Q12b(ii)': {0: _one('liver'), 1: _keys('co2', ['cell', 'mitochondri', 'respir', 'tissue'])},
        '2016-Q12b(iii)': {
            0: _keys(['high', 'increas'], ['salt', 'concentr', 'solute']) + _keys(['less', 'low', 'decreas', 'lack'], 'water') + _one('dehydr'),
            4: _LESS_URINE + [{'w': ['more', 'concentr', 'urine'], 'n': 3}]},
        '2016-Q12c(i)': {0: _HOMEO},
        '2012-Q15c(i)': {0: _HOMEO},
        '2011-Q12a(i)': {0: _keys(_REMOVE, 'waste'), 1: _keys('make', ['body', 'cell']) + _one('metabol')},
        '2010-Q15c(iv)': {
            0: _one('sweat', 'exhal', 'perspir') + _keys('water', ['lost', 'loss', 'lose']),
            1: _keys(['less', 'low', 'decreas', 'lack'], 'water') + _one('dehydr'),
            2: _keys('adh', ['secret', 'releas', 'make', 'more']),
            3: _keys('collect', 'duct') + _keys('dist', 'tubul') + _one('dct') + _keys('kidney', ['reabsorb', 'adh'])},
        # "example how": how a factor is kept steady; "example why": why it matters (the note lists pH, solutes, temperature, water).
        '2009-Q15c(iii)': {
            0: _MAINTAIN,
            1: _keys(['intern', 'inside'], ['environ', 'condi'], _STEADY),
            2: _one('sweat', 'vasodil', 'vasoconstric', 'adh', 'insulin', 'glucagon', 'feedback', 'kidney', 'osmoregul', 'thermoregul') +
               _keys('shiver', ['warm', 'heat', 'cold']),
            3: _one('enzyme', 'metabol', 'denatur', 'optimum')},
        '2008-Q13a(i)': {0: _EXCRETION},
        '2008-Q13a(ii)': {1: _one('carbohydrate', 'glucose', 'sugar', 'starch', 'glycogen', 'sucrose', 'fructose', 'maltose', 'lactose', 'fat', 'lipid', 'oil') +
                          _keys('fatty', 'acid')},
        '2008-Q13b(v)': {1: _one('porous', 'pore')},
        '2008-Q13c(i)': {
            1: _one('hot', 'heat', 'sweat', 'perspir', 'exercis'),
            2: _keys('salt', ['high', 'eat', 'food', 'diet', 'intake', 'much', 'lot', 'more', 'increas']),
            3: _keys('not', 'drink') + _keys('not', 'enough', 'water') + _keys('lack', ['water', 'drink', 'fluid']) + _keys('without', ['water', 'drink']) +
               _keys(['little', 'less', 'low'], ['drink', 'intake']) + _keys('little', 'water'),
            4: _one('diuretic', 'alcohol', 'caffein', 'coffee')},
        # One point (6 marks): the walls become more permeable AND more water is reabsorbed.
        '2008-Q13c(iv)': {0: _keys('permeab', ['reabsor', 'absor'], 'water')},
        # "or example" (of the reason): a named factor the body keeps steady.
        '2007-Q15c(i)': {
            0: _MAINTAIN,
            1: _keys(['intern', 'inside'], ['environ', 'condi'], _STEADY) + [{'w': _FACTORS + [s], 'n': 3} for s in _STEADY + _KEEP],
            2: _one('enzyme', 'metabol', 'denatur', 'optimum') + _keys('cell', ['function', 'work']) + _keys('example', _FACTORS)},
        '2006-Q13b(i)': {
            0: _keys(['liquid', 'fluid'], ['blood', 'part']),
            1: _keys('plasma', ['minus', 'without', 'no', 'less'], 'protein') + _keys('bowman', 'capsule') + _keys(['enter', 'into'], 'capsule') +
               _keys(['left', 'leave'], 'glomerul')},
        '2004-Q12a(a)': {
            0: _HOMEO,
            1: _keys(['salt', 'ion', 'mineral', 'sodium'], ['balanc', 'regul', 'control', 'level', 'concentr', 'reabsor', 'excret'] + _KEEP) + _one('osmoregul'),
            2: _keys('water', ['balanc', 'regul', 'control', 'level', 'content', 'reabsor', 'excret', 'conserv'] + _KEEP) + _one('osmoregul')},
        '2004-Q12b(ii)': {10: _one('hormon', 'adh')},
    },
}


# ---------------------------------------------------------------- Chain reaction pictures (400 x 300)
# Each builds up as the chain's steps go into place (step/until/badge from tools/mini_games/build_game_art.py).
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'mini_games'))
import build_game_art as ga  # noqa: E402

INK, SNOW, PURP, YEL = ga.INK, ga.SNOW, ga.PURP, ga.YEL
SALT, WATER, UREA, GLU, AMINO, ADH = '#E3E9F4', '#45C4EE', '#B5A642', '#FFC42E', '#2BC46F', '#9B4A8C'


def dots(path, colors, dur, r=3.2, stroke=INK):
    """Molecules moving along a path, evenly spaced in time."""
    n = len(colors)
    # Negative begins start every molecule at once, spread along the path (none wait at the corner).
    return ''.join(f'<circle r="{r}" fill="{c}" stroke="{stroke}" stroke-width=".8"><animateMotion path="{path}" dur="{dur}s" begin="-{k * dur / n:.2f}s" repeatCount="indefinite"/></circle>'
                   for k, c in enumerate(colors))


def out_of(x, y, dx, dy, color, dur=1.8, begin=0.0, r=3):
    """A molecule leaving a tube sideways and fading (reabsorbed)."""
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" stroke="{INK}" stroke-width=".8">'
            f'<animate attributeName="cx" values="{x};{x + dx}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="cy" values="{y};{y + dy}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/></circle>')


def urine_chain():
    b = '<rect width="400" height="300" fill="#FBEFE3"/><rect y="170" width="400" height="130" fill="#F3DCCB"/>'
    b += '<path d="M0 170H400" stroke="#C4683F" stroke-width="2" stroke-dasharray="8 6"/>'
    # 1 The wide afferent arteriole brings blood into the glomerulus.
    aff = 'M-4 62C30 62 54 66 80 74'
    glom = ('<g fill="none" stroke="#E5484D" stroke-width="3.6" stroke-linecap="round">'
            '<path d="M80 74c4-16 26-18 30-4s-20 18-16 2 24-18 30-2-14 22-24 10M84 92c6 12 28 12 30-2s-20-14-18 0 20 8 22-6"/></g>')
    b += ga.step(0, vessel(aff, RED, 11) + flow(aff) + glom)
    # 2 The narrower efferent arteriole leaves: the blood backs up, so the pressure in the glomerulus is high.
    eff = 'M82 98C64 116 66 132 88 138C112 144 150 134 178 138'
    s1 = vessel(eff, '#C2364A', 5) + flow(eff)
    s1 += ''.join(ga.arrow(100 + 22 * dx, 82 + 22 * dy, 100 + 34 * dx, 82 + 34 * dy, PURP, 2.4) for dx, dy in [(0, -1), (.8, -.6), (.8, .6), (0, 1)])
    b += ga.step(1, s1)
    # 3 Bowman's capsule: small molecules are forced in; cells and proteins stay in the blood.
    cup = 'M72 54C84 30 120 28 136 44C150 58 150 104 136 118C120 134 86 130 74 108'
    s2 = (f'<path d="{cup}" fill="none" stroke="{TUBE_D}" stroke-width="12" stroke-linecap="round"/>'
          f'<path d="{cup}" fill="none" stroke="#F7D27A" stroke-width="8" stroke-linecap="round"/>')
    s2 += dots('M112 64Q126 52 134 46Q140 42 146 44', [GLU, WATER, UREA, SALT], 2.4, 2.6)
    s2 += '<circle cx="44" cy="62" r="6" fill="#E5484D" stroke="#B3262B" stroke-width="1.4"/><circle cx="44" cy="62" r="2.4" fill="#B3262B"/>'
    b += ga.step(2, s2)
    # 4 The PCT: all the glucose and amino acids go back into the blood.
    pct = 'M142 46C156 44 160 30 172 32C188 34 184 58 170 64C156 70 160 92 178 90C196 88 192 66 206 62C222 58 222 84 214 100C208 112 206 124 206 140'
    s3 = tube(pct, 10) + flow(pct, TUBE_D, 3)
    s3 += '<path d="M150 18C176 14 196 22 230 18" fill="none" stroke="#9B4A8C" stroke-width="2.4"/>'
    s3 += ''.join(out_of(x, y, 0, -28, c, 1.8, k * .45) for k, (x, y, c) in enumerate([(160, 44, GLU), (182, 52, AMINO), (196, 70, GLU), (174, 80, AMINO)]))
    b += ga.step(3, s3)
    # 5 Water leaves the loop of Henle (into the salty medulla) and the DCT.
    loop = 'M206 140V262C206 280 236 280 236 262V140'
    dct = 'M236 140C236 122 254 120 258 106C262 90 246 82 254 68C262 56 282 62 284 78C286 94 302 98 312 86C322 74 330 60 346 60'
    s4 = tube(loop, 10) + flow(loop, TUBE_D, 3.4) + tube(dct, 10) + flow(dct, TUBE_D, 3)
    s4 += ''.join(out_of(x, y, dx, 0, WATER, 1.6, k * .4) for k, (x, y, dx) in enumerate([(200, 196, -26), (200, 236, -26), (242, 214, 24), (292, 82, 0)]))
    s4 += out_of(292, 82, 0, 26, WATER, 1.6, .8)
    b += ga.step(4, s4)
    # 6 What is left is urine: down the collecting duct to the pelvis.
    duct = 'M356 -6V306'
    s5 = tube(duct, 16) + tube('M346 60H356', 10) + flow(duct, TUBE_D, 2.6)
    s5 += dots('M356 120V300', [UREA, SALT, WATER, UREA], 2.8, 3)
    s5 += f'<rect x="300" y="276" width="44" height="18" rx="9" fill="{INK}"/><text x="322" y="285" text-anchor="middle" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="10" fill="#FFFFFF">URINE</text>'
    b += ga.step(5, s5)
    b += ga.badge(0, 24, 44) + ga.badge(1, 52, 150) + ga.badge(2, 158, 126) + ga.badge(3, 236, 34) + ga.badge(4, 260, 244) + ga.badge(5, 380, 240)
    return ga.svg('How urine is made', "Blood comes into the glomerulus in the wide afferent arteriole and leaves in the narrow efferent arteriole, so the pressure is high and small molecules are pushed into Bowman's capsule. Glucose and amino acids go back into the blood from the PCT, water leaves the loop of Henle and the DCT, and urine flows down the collecting duct.", b)


def head():
    """A head in profile, facing right, with the hypothalamus and the pituitary gland showing."""
    h = ('<path d="M34 150C18 120 20 70 52 48C82 28 128 36 140 70C146 86 144 96 150 106C154 112 150 118 144 118C146 128 142 138 132 140C126 150 116 152 104 150L100 176H50Z" fill="#F2C9A0" stroke="#7A4A35" stroke-width="2"/>'
         '<path d="M44 92C40 64 64 46 92 46C120 46 136 62 134 84C132 104 112 112 90 112C66 112 46 108 44 92Z" fill="#F6B8C4" stroke="#C26A7E" stroke-width="1.6"/>'
         '<path d="M58 72Q72 60 88 70T118 70M54 92Q70 82 86 92T124 90" fill="none" stroke="#C26A7E" stroke-width="1.4"/>'
         '<circle cx="124" cy="82" r="3.5" fill="#14243B"/>')
    return h


def adh_chain(more):
    b = f'<rect width="400" height="300" fill="{ga.BG}"/>'
    b += head()
    hyp, pit = (92, 104), (92, 122)
    b += f'<ellipse cx="{hyp[0]}" cy="{hyp[1]}" rx="11" ry="6" fill="#7E5BA3"/><path d="M92 110V116" stroke="#7E5BA3" stroke-width="3"/><ellipse cx="{pit[0]}" cy="{pit[1]}" rx="7" ry="6" fill="#E07A70" stroke="#B5543A" stroke-width="1.4"/>'
    # The blood vessel across the bottom and the collecting duct on the right.
    vessel_d = 'M0 228H400'
    b += vessel(vessel_d, RED, 16)
    if more:
        # 1 Sweating on a hot day.
        s0 = ga.star(36, 28, 18, 12, 10, YEL) + '<circle cx="36" cy="28" r="11" fill="#FFC42E" stroke="#E89B1A" stroke-width="1.6"/>'
        s0 += ''.join(ga.fall(x, y, 3, WATER, 1.4, k * .35, 22) for k, (x, y) in enumerate([(40, 64), (30, 110), (146, 126)]))
    else:
        # 1 Drinking lots of water.
        s0 = ('<path d="M154 108L160 150H184L190 108Z" fill="#CFEFFB" stroke="#7FB8D0" stroke-width="2"/>'
              '<path d="M157 124L160 150H184L187 124Z" fill="#45C4EE"/>' + ga.rise(172, 140, 2, '#FFFFFF', '#7FB8D0', 1.6, 0, 14))
    b += ga.step(0, s0)
    # 2 The blood becomes too concentrated (salty) or too dilute (watery).
    mix = [SALT, SALT, WATER, SALT, SALT, SALT] if more else [WATER, WATER, SALT, WATER, WATER, WATER]
    s1 = dots('M-6 228H406', mix, 5, 3.6)
    s1 += (f'<rect x="{134 if more else 150}" y="248" width="{132 if more else 100}" height="22" rx="11" fill="{INK}"/><text x="200" y="259" text-anchor="middle" dominant-baseline="central" '
           f'font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="10.5" fill="#FFFFFF">{"TOO CONCENTRATED" if more else "TOO DILUTE"}</text>')
    b += ga.step(1, s1)
    # 3 The hypothalamus detects it.
    b += ga.step(2, ga.rings(hyp[0], hyp[1], '#7E5BA3', 2.4, 1.6, 26))
    # 4 The pituitary releases more (or less) ADH into the blood.
    path = f'M{pit[0]} {pit[1] + 6}C{pit[0]} 180 120 214 150 222C200 230 260 228 300 222'
    s3 = vessel(path, '#C2364A', 3)
    s3 += dots(path, [ADH] * (5 if more else 1), 3, 4.2, '#5B3172')
    s3 += (f'<rect x="108" y="160" width="{88 if more else 82}" height="22" rx="11" fill="{INK}"/><text x="{152 if more else 149}" y="171" text-anchor="middle" dominant-baseline="central" '
           f'font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="10.5" fill="#FFFFFF">{"MORE ADH" if more else "LESS ADH"}</text>')
    b += ga.step(3, s3)
    # 5 The collecting duct: its wall lets water through (more ADH) or not (less ADH).
    duct = 'M318 20V204'
    s4 = tube(duct, 22) + vessel('M352 20V210', '#9B4A8C', 3)
    if more:
        s4 += ''.join(f'<rect x="326" y="{y}" width="8" height="6" fill="#F7D27A"/>' for y in (50, 90, 130, 170))
        s4 += ''.join(out_of(320, y + 3, 30, 0, WATER, 1.5, k * .3) for k, y in enumerate((50, 90, 130, 170)))
    else:
        s4 += ''.join(ga.fall(318, y, 3, WATER, 1.6, k * .4, 30) for k, y in enumerate((40, 90, 140)))
    b += ga.step(4, s4)
    # 6 The urine: a little, dark (more ADH) or a lot, pale (less ADH).
    level, colour = (276, '#E8A21A') if more else (240, '#FBE7A1')
    s5 = (f'<path d="M296 228V292H340V228" fill="#FFFFFF" fill-opacity=".6" stroke="{INK}" stroke-width="2.4"/>'
          f'<rect x="297.2" y="{level}" width="41.6" height="{291 - level}" fill="{colour}"/>'
          f'<path d="M296 228V292H340V228" fill="none" stroke="{INK}" stroke-width="2.4"/>')
    s5 += tube('M318 204V226', 8)
    b += ga.step(5, s5)
    b += ga.badge(0, 70 if more else 200, 20 if more else 112) + ga.badge(1, 30, 254) + ga.badge(2, 120, 98) + ga.badge(3, 210, 172) + ga.badge(4, 372, 104) + ga.badge(5, 362, 266)
    title = 'Short of water: ADH' if more else 'Too much water: less ADH'
    desc = ('After sweating, the blood is too concentrated. The hypothalamus detects it and the pituitary releases more ADH, so the collecting ducts let more water back into the blood and a small volume of dark, concentrated urine is made.'
            if more else 'After drinking a lot, the blood is too dilute. The hypothalamus detects it and the pituitary releases less ADH, so the collecting ducts keep their water and a large volume of pale, dilute urine is made.')
    return ga.svg(title, desc, b)


def urea_chain():
    b = f'<rect width="400" height="300" fill="{ga.BG}"/>'
    # 1 A protein-rich meal.
    s0 = ('<ellipse cx="62" cy="58" rx="46" ry="16" fill="#FFFFFF" stroke="#B8C2D4" stroke-width="2"/>'
          '<path d="M34 54C34 40 58 36 72 42C84 46 82 58 70 60C58 62 34 64 34 54Z" fill="#B5543A" stroke="#7A3A2A" stroke-width="1.6"/>'
          '<ellipse cx="90" cy="52" rx="12" ry="8" fill="#FFFFFF" stroke="#D5DCE8" stroke-width="1.2"/><circle cx="90" cy="52" r="4.4" fill="#FFC42E"/>')
    b += ga.step(0, s0)
    # 2 Spare amino acids are carried to the liver.
    portal = 'M62 80C62 110 80 130 104 146'
    s1 = vessel(portal, BLUE, 6) + dots(portal, [AMINO] * 4, 2.4, 3.4)
    b += ga.step(1, s1)
    # 3 The liver breaks them down (deamination), making urea.
    liver = ('<path d="M30 168C30 146 70 138 120 140C170 142 196 150 194 166C192 186 150 200 112 214C80 226 52 224 40 208C32 198 30 184 30 168Z" fill="#9C3F2C" stroke="#6B2D3A" stroke-width="2.4"/>'
             '<path d="M120 142C118 170 112 196 108 214" fill="none" stroke="#6B2D3A" stroke-width="1.8"/>')
    s2 = liver + ''.join(ga.rise(x, y, 3.2, UREA, INK, 1.8, k * .5, 16) for k, (x, y) in enumerate([(80, 178), (140, 170), (110, 196)]))
    b += ga.step(2, s2)
    # 4 Urea travels in the blood to the kidneys.
    art = 'M190 162C230 150 250 120 286 116'
    s3 = vessel(art, RED, 6) + dots(art, [UREA] * 3, 2.2, 3.2)
    s3 += f'<path d="{bean(312, 110, 50, 74, False)}" fill="#C4683F" stroke="#7A3A2A" stroke-width="2.2"/><path d="{bean(312, 110, 32, 54, False)}" fill="#D9895F"/>'
    b += ga.step(3, s3)
    # 5 It is filtered into Bowman's capsule.
    zin = ('<rect x="300" y="0" width="100" height="100" fill="#FBEFE3"/>'
           '<path d="M330 50c6-12 22-12 24 0s-16 14-12 2 18-14 22-2" fill="none" stroke="#E5484D" stroke-width="3" stroke-linecap="round"/>'
           '<path d="M326 36C336 22 362 20 372 34C382 46 380 66 370 74C360 82 336 80 328 68" fill="none" stroke="#A9822F" stroke-width="7" stroke-linecap="round"/>'
           + ga.fall(346, 50, 3.2, UREA, 1.6, 0, 18) + ga.fall(356, 46, 3.2, UREA, 1.6, .8, 18))
    b += ga.step(4, ga.zoom(352, 50, 34, zin, 'b29-urea-z', (318, 104)))
    # 6 It leaves in urine: ureter, bladder, urethra.
    ure = 'M300 140C292 180 270 206 254 232'
    s5 = tube(ure, 6) + flow(ure, '#FFFFFF', 2.6)
    s5 += '<path d="M222 236C222 216 286 216 286 236C286 266 268 276 254 276C240 276 222 266 222 236Z" fill="#F2948C" stroke="#B5543A" stroke-width="2.2"/>'
    s5 += tube('M254 276V298', 6) + dots('M254 276V304', [UREA, UREA], 1.6, 2.6)
    b += ga.step(5, s5)
    b += ga.badge(0, 112, 34) + ga.badge(1, 92, 104) + ga.badge(2, 172, 196) + ga.badge(3, 234, 120) + ga.badge(4, 388, 92) + ga.badge(5, 310, 252)
    return ga.svg('Where urea comes from', 'Protein you do not need is broken down: the amino acids go to the liver, which removes their amino groups (deamination) and makes urea. Urea travels in the blood to the kidneys, is filtered into Bowman\'s capsule and leaves in urine through the ureter, bladder and urethra.', b)


def CHAIN_ART():
    return {'How urine is made': urine_chain(), 'Short of water: ADH': adh_chain(True), 'Too much water: less ADH': adh_chain(False),
            'Where urea comes from': urea_chain()}

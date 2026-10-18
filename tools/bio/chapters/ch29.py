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
    body += part(0, '<path d="M0 168H480" stroke="#C4683F" stroke-width="2" stroke-dasharray="8 6"/>'
                    '<text x="8" y="160" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11" fill="#9C3F2C">CORTEX</text>'
                    '<text x="8" y="184" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11" fill="#9C3F2C">MEDULLA</text>')
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
    body += label(1, 'GLOMERULUS', 'top', 52, 108, 132, 88)
    body += label(2, "BOWMAN'S CAPSULE", 'start', 186, 16, 164, 60)
    body += label(3, 'EFFERENT ARTERIOLE', 'start', 6, 262, 106, 122)
    body += label(4, 'PCT', 'bottom', 214, 50, 214, 102)
    body += label(5, 'LOOP OF HENLE', 'end', 236, 292, 268, 305)
    body += label(6, 'DCT', 'start', 344, 16, 330, 100)
    body += label(7, 'COLLECTING DUCT', 'end', 410, 304, 426, 290)
    body += label(8, 'CAPILLARIES', 'start', 310, 252, 294, 246)
    anchors = {'afferent': [64, 55], 'glomerulus': [134, 88], 'capsule': [164, 60], 'efferent': [106, 122], 'pct': [214, 102],
               'descending': [254, 248], 'loop': [268, 305], 'ascending': [282, 248], 'dct': [330, 100], 'duct': [426, 280],
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
                ('pct', ['proximal', 'pct']), ('dct', ['distal', 'dct']), ('loop', ['henle', 'loop']), ('duct', ['collecting']),
                ('capillaries', ['capillar', 'blood vessel']), ('venule', ['venule', 'vein']), ('cortex', ['cortex']), ('medulla', ['medulla'])],
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
    'kind': {'2011-Q12b(ii)': 'draw'},
}

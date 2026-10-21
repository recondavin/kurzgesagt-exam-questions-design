"""Chapter 31, the circulatory system: its diagrams and how its exam questions use them.

Diagrams (tools/bio/build_bio_diagrams.py builds them into bio/d31.js):
  MAKERS        one function per diagram to memorise, each returning finish(...) from bio_art.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is, from its description,
  ANCHOR_WORDS  the words that name each anchor on those diagrams (exam letters go to that anchor),
  OVERRIDES     per-question corrections: graphs, tap answers, answer types.
The heart is drawn the exam way: its right side on the viewer's left. Blue is deoxygenated blood, red oxygenated.
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'mini_games'))
import re  # noqa: E402
from bio_art import label as _label, part, flow, finish, arrow, INK, RED, BLUE, BG  # noqa: E402
import build_game_art as GA  # noqa: E402  (Chain reaction pictures: step, until, badge, svg)


def text_w(text):
    """Width of a tag in Lexend 600 at 12.5px, from measured letters (the shared helper guesses 7.4 a letter)."""
    narrow, wide = {'I': 4.2, 'J': 6.5, ' ': 4, ':': 4, '(': 5, ')': 5, "'": 3.5, 'L': 7.6, 'T': 8.2, 'F': 8}, {'M': 11, 'W': 12, 'O': 9.6, 'Q': 9.6, 'C': 9.2, 'G': 9.4}
    return sum(narrow.get(c, wide.get(c, 8.6)) for c in text)


def label(i, text, side, ax, ay, fx, fy):
    """bio_art's label, with the pill sized to the text."""
    s = _label(i, text, side, ax, ay, fx, fy)
    w = text_w(text) + 20
    rx = ax if side == 'start' else ax - w if side == 'end' else ax - w / 2
    assert -1 <= rx and rx + w <= 481, (text, rx, rx + w)
    return re.sub(r'<rect x="[\d.-]+" y="([\d.-]+)" width="[\d.]+"', lambda m: f'<rect x="{rx:.1f}" y="{m.group(1)}" width="{w:.1f}"', s, count=1)

CHAPTER = 31
TOPIC = 'The circulatory system'

MUSCLE, MUSCLE_D = '#C4683F', '#7A3A2A'
BLUE_L, RED_L, BLUE_D, RED_D = '#7EA2EC', '#F0898C', '#24479E', '#B3262B'
VALVE = '#FDF3D6'
NODE = '#FFC42E'
CELL = '#F3DCCB'


def tube(d, color, w=12, edge=None):
    """A blood vessel with a darker edge, so it reads as a tube."""
    edge = edge or (BLUE_D if color == BLUE else RED_D if color == RED else INK)
    return (f'<path d="{d}" fill="none" stroke="{edge}" stroke-width="{w + 3}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')


# ---------------------------------------------------------------- the heart in vertical section
def flap(x0, y0, x1, y1, bend):
    """A valve flap: a thin curved leaf from the ring (x0, y0) down to its tip (x1, y1)."""
    mx, my = (x0 + x1) / 2 + bend, (y0 + y1) / 2
    return (f'<path d="M{x0} {y0}Q{mx} {my} {x1} {y1}" fill="none" stroke="{INK}" stroke-width="6.2" stroke-linecap="round"/>'
            f'<path d="M{x0} {y0}Q{mx} {my} {x1} {y1}" fill="none" stroke="{VALVE}" stroke-width="3.6" stroke-linecap="round"/>')


def pockets(x0, x1, y):
    """Semilunar valve: two half-moon pockets across the base of an artery."""
    m = (x0 + x1) / 2
    d = f'M{x0} {y}Q{(x0 + m) / 2} {y + 13} {m} {y}Q{(m + x1) / 2} {y + 13} {x1} {y}'
    return f'<path d="{d}Z" fill="{VALVE}"/><path d="{d}" fill="none" stroke="{INK}" stroke-width="1.6"/>'


def heart():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Heart muscle: the outer wall and the septum. The left ventricle's wall is the thickest.
    outer = ('M174 84Q160 88 158 114L158 164C160 212 180 256 218 284C234 296 250 302 262 298'
             'C294 286 322 240 324 190L324 114Q322 88 310 84Z')
    body += part(0, f'<path d="{outer}" fill="{MUSCLE}" stroke="{MUSCLE_D}" stroke-width="2.4" stroke-linejoin="round"/>'
                    '<path d="M244 100V280" stroke="#A9532F" stroke-width="1.4" stroke-dasharray="3 5"/>')
    # Right atrium (blue), with the opening down to the right ventricle.
    ra = 'M182 98Q170 100 169 116L169 146L212 146L212 98Z'
    body += part(1, f'<path d="{ra}" fill="{BLUE_L}"/><rect x="183" y="144" width="18" height="24" fill="{BLUE_L}"/>')
    # Right ventricle (blue), with its outflow channel up to the pulmonary artery.
    rv = 'M169 166L218 166L218 86L234 86L234 246C230 262 216 270 204 262C184 246 172 212 169 166Z'
    body += part(2, f'<path d="{rv}" fill="{BLUE_L}"/>')
    # Left atrium (red).
    la = 'M274 98L302 98Q314 100 314 116L314 146L274 146Z'
    body += part(3, f'<path d="{la}" fill="{RED_L}"/><rect x="279" y="144" width="16" height="26" fill="{RED_L}"/>')
    # Left ventricle (red): a smaller space inside a much thicker wall, with its outflow channel up to the aorta.
    lv = 'M254 86L270 86L270 168L300 168C302 210 290 246 268 266C258 258 254 236 254 200Z'
    body += part(4, f'<path d="{lv}" fill="{RED_L}"/>')
    # Tricuspid valve: flaps from the ring hanging into the right ventricle, held by tendons to small muscles.
    tri = (flap(183, 162, 186, 196, -6) + flap(201, 162, 198, 196, 6) +
           '<path d="M186 196L183 228M198 196L201 228" stroke="#FDF3D6" stroke-width="1.4"/>'
           f'<path d="M176 238Q183 222 190 238Z M194 238Q201 222 208 238Z" fill="{MUSCLE}"/>')
    body += part(5, tri)
    # Bicuspid (mitral) valve: two flaps on the left side.
    bi = (flap(279, 164, 282, 196, -6) + flap(295, 164, 292, 196, 6) +
          '<path d="M282 196L279 226M292 196L295 226" stroke="#FDF3D6" stroke-width="1.4"/>'
          f'<path d="M272 236Q279 220 286 236Z M288 236Q295 220 302 236Z" fill="{MUSCLE}"/>')
    body += part(6, bi)
    # Semilunar valves: pockets at the base of the pulmonary artery and the aorta.
    body += part(7, pockets(218, 234, 112) + pockets(254, 270, 112))
    # Aorta: up out of the left ventricle and over in an arch (oxygenated blood to the body).
    aorta = 'M262 92V42Q262 22 282 22H296Q314 22 314 42V62'
    body += part(8, tube(aorta, RED, 14) + flow(aorta))
    # Pulmonary artery: up out of the right ventricle, in front of the aorta, to the lungs.
    pa = 'M226 92V64Q226 54 238 54H294'
    body += part(9, tube(pa, BLUE, 13) + flow(pa))
    # Vena cava: deoxygenated blood from the body into the right atrium.
    vc = 'M196 30V104'
    body += part(10, tube(vc, BLUE, 16) + flow(vc))
    # Pulmonary veins: oxygenated blood from the lungs into the left atrium.
    body += part(11, tube('M310 106H334', RED, 9) + tube('M310 130H334', RED, 9) + flow('M334 106H306') + flow('M334 130H306'))
    # The pacemaker (SA node) in the right atrium's wall, and the AV node low in the wall between the atria.
    body += part(12, f'<ellipse cx="180" cy="92" rx="7" ry="4.5" fill="{NODE}" stroke="{INK}" stroke-width="1.4"/>'
                     f'<ellipse cx="240" cy="160" rx="5" ry="6" fill="{NODE}" stroke="{INK}" stroke-width="1.4"/>')
    labels = [
        {'text': 'Vena cava', 'keys': [['vena', 'cava'], ['cava']]},
        {'text': 'SA node (pacemaker)', 'keys': [['sa', 'node'], ['sino'], ['pacemaker']]},
        {'text': 'Right atrium', 'keys': [['right', 'atri']]},
        {'text': 'Semilunar valve', 'keys': [['semilunar'], ['semi', 'lunar']]},
        {'text': 'Tricuspid valve', 'keys': [['tricuspid']]},
        {'text': 'Right ventricle', 'keys': [['right', 'ventricl']]},
        {'text': 'Aorta', 'keys': [['aorta']]},
        {'text': 'Pulmonary artery', 'keys': [['pulmonary', 'arter']]},
        {'text': 'Pulmonary vein', 'keys': [['pulmonary', 'vein']]},
        {'text': 'Left atrium', 'keys': [['left', 'atri']]},
        {'text': 'Bicuspid valve', 'keys': [['bicuspid'], ['mitral']]},
        {'text': 'AV node', 'keys': [['av', 'node'], ['atrioventricular', 'node']]},
        {'text': 'Septum', 'keys': [['septum']]},
        {'text': 'Left ventricle', 'keys': [['left', 'ventricl']]},
    ]
    body += label(0, 'VENA CAVA', 'end', 150, 30, 196, 40)
    body += label(1, 'SA NODE', 'end', 150, 70, 178, 92)
    body += label(2, 'RIGHT ATRIUM', 'end', 150, 112, 184, 124)
    body += label(3, 'SEMILUNAR VALVE', 'end', 150, 148, 222, 116)
    body += label(4, 'TRICUSPID VALVE', 'end', 150, 190, 186, 186)
    body += label(5, 'RIGHT VENTRICLE', 'end', 150, 246, 196, 244)
    body += label(6, 'AORTA', 'start', 334, 16, 314, 40)
    body += label(7, 'PULMONARY ARTERY', 'start', 322, 76, 286, 54)
    body += label(8, 'PULMONARY VEIN', 'start', 340, 108, 330, 106)
    body += label(9, 'LEFT ATRIUM', 'start', 334, 140, 296, 128)
    body += label(10, 'BICUSPID VALVE', 'start', 334, 176, 292, 184)
    body += label(11, 'AV NODE', 'start', 334, 210, 242, 162)
    body += label(12, 'SEPTUM', 'start', 334, 250, 246, 244)
    body += label(13, 'LEFT VENTRICLE', 'start', 334, 292, 278, 230)
    anchors = {'venaCava': [196, 40], 'sa': [180, 92], 'rightAtrium': [190, 124], 'semilunar': [226, 116], 'aorticValve': [262, 116],
               'tricuspid': [190, 186], 'rightVentricle': [204, 232], 'aorta': [288, 22], 'pulmonaryArtery': [272, 54],
               'pulmonaryVein': [330, 106], 'leftAtrium': [294, 126], 'bicuspid': [288, 184], 'av': [240, 160],
               'septum': [244, 244], 'leftVentricle': [276, 226], 'lvWall': [312, 210]}
    parts = ['Heart muscle and septum', 'Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle', 'Tricuspid valve',
             'Bicuspid valve', 'Semilunar valves', 'Aorta', 'Pulmonary artery', 'Vena cava', 'Pulmonary veins', 'SA node and AV node']
    return finish('heart', 'The heart in section', 'a vertical section through the human heart',
                  'Right side on the left of the page, in blue. Four chambers; the left ventricle has the thickest wall. Valves between the atria and ventricles, and at the base of the aorta and pulmonary artery.',
                  'The heart in vertical section', 'The right atrium receives deoxygenated blood from the vena cava and passes it through the tricuspid valve to the right ventricle, which pumps it through a semilunar valve into the pulmonary artery. Oxygenated blood from the pulmonary veins enters the left atrium, passes the bicuspid valve into the thick-walled left ventricle, and leaves through the aorta. The septum keeps the two sides apart. The SA node (pacemaker) in the wall of the right atrium starts each beat; the AV node passes it on to the ventricles.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- dissecting the heart: the front (ventral) surface
def scissors(x, y, rot=0):
    return (f'<g transform="translate({x} {y}) rotate({rot})"><circle cx="-6" cy="-9" r="4.2" fill="none" stroke="{INK}" stroke-width="2"/>'
            f'<circle cx="-6" cy="9" r="4.2" fill="none" stroke="{INK}" stroke-width="2"/>'
            f'<path d="M-2 -7L12 3M-2 7L12 -3" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/></g>')


def dissection():
    body = f'<rect width="480" height="320" fill="{BG}"/><ellipse cx="244" cy="306" rx="150" ry="10" fill="#C9DCE6"/>'
    # The ventricles from the front. The left ventricle (on the right of the page) is firmer, with a thicker wall.
    rv = 'M166 140C152 196 172 258 226 290C244 300 262 302 274 296C252 250 240 180 244 112C210 110 176 118 166 140Z'
    lv = 'M244 112C240 180 252 250 274 296C292 290 304 280 312 266C334 222 334 170 322 140C312 120 282 110 244 112Z'
    body += part(0, f'<path d="{rv}" fill="{MUSCLE}" stroke="{MUSCLE_D}" stroke-width="2.4" stroke-linejoin="round"/>'
                    f'<path d="{lv}" fill="#B25A36" stroke="{MUSCLE_D}" stroke-width="2.4" stroke-linejoin="round"/>'
                    '<path d="M300 150Q312 200 296 250" fill="none" stroke="#9C4A2C" stroke-width="2" stroke-linecap="round"/>')
    # Right atrium: the ear-shaped flap (auricle) at the top left. Left atrium: a smaller flap peeping out on the right.
    ra = 'M168 146C146 140 138 112 152 96C166 82 192 86 204 98C214 110 206 132 190 140C182 144 176 146 168 146Z'
    body += part(1, f'<path d="{ra}" fill="#D9895F" stroke="{MUSCLE_D}" stroke-width="2.2" stroke-linejoin="round"/>'
                    '<path d="M154 112Q160 108 164 116Q170 108 176 116" fill="none" stroke="#A9532F" stroke-width="1.6"/>')
    la = 'M300 128C304 112 322 104 336 112C346 120 340 134 326 138C316 140 306 136 300 128Z'
    body += part(2, f'<path d="{la}" fill="#D9895F" stroke="{MUSCLE_D}" stroke-width="2.2" stroke-linejoin="round"/>')
    # Coronary artery: from the base of the aorta, down the groove between the ventricles, with fat along it.
    cor = 'M236 108C236 170 252 240 276 292'
    body += part(3, f'<path d="{cor}" fill="none" stroke="#F2D48F" stroke-width="12" stroke-linecap="round"/>' + tube(cor, RED, 4) +
                    tube('M240 170Q262 176 280 196', RED, 3) + tube('M246 214Q228 222 212 244', RED, 3))
    # Aorta: rising behind the pulmonary artery and arching over to the left of the body (right of the page).
    aorta = 'M226 110V44Q226 26 244 26H284Q300 26 300 44V50'
    body += part(4, tube(aorta, RED, 15))
    # Pulmonary artery: out of the right ventricle in front, splitting to the two lungs.
    body += part(5, tube('M256 114V60', BLUE, 22) + tube('M256 62Q256 50 244 50H238', BLUE, 11) + tube('M256 62Q256 50 268 50H288', BLUE, 11))
    # Vena cava into the right atrium.
    body += part(6, tube('M184 20V96', BLUE, 18))
    # Where to cut: down the right side to open the right atrium and ventricle (tricuspid valve), and into an artery
    # (semilunar valves at its base).
    cut1 = 'M162 124C160 178 184 236 220 268'
    body += part(7, f'<path d="{cut1}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>'
                    f'<path d="{cut1}" fill="none" stroke="{INK}" stroke-width="2.4" stroke-dasharray="7 6" stroke-linecap="round"/>' + scissors(160, 110, 90))
    body += part(8, f'<path d="M240 88H272" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>'
                    f'<path d="M240 88H272" stroke="{INK}" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="round"/>' + scissors(286, 88, 180))
    labels = [
        {'text': 'Vena cava', 'keys': [['vena', 'cava'], ['cava']]},
        {'text': 'Right atrium', 'keys': [['right', 'atri']]},
        {'text': 'Cut here to see the tricuspid valve', 'keys': [['tricuspid'], ['cut', 'right']]},
        {'text': 'Right ventricle', 'keys': [['right', 'ventricl']]},
        {'text': 'Aorta', 'keys': [['aorta']]},
        {'text': 'Pulmonary artery', 'keys': [['pulmonary', 'arter']]},
        {'text': 'Cut into the artery to see a semilunar valve', 'keys': [['semilunar'], ['semi', 'lunar']]},
        {'text': 'Coronary artery (front surface)', 'keys': [['coronary']]},
        {'text': 'Left ventricle (firmer, thicker wall)', 'keys': [['left', 'ventricl']]},
    ]
    body += label(0, 'VENA CAVA', 'end', 150, 22, 184, 34)
    body += label(1, 'RIGHT ATRIUM', 'end', 132, 76, 150, 100)
    body += label(2, 'CUT: TRICUSPID', 'end', 150, 176, 164, 176)
    body += label(3, 'RIGHT VENTRICLE', 'end', 150, 252, 206, 238)
    body += label(4, 'AORTA', 'start', 330, 22, 300, 40)
    body += label(5, 'PULMONARY ARTERY', 'start', 320, 66, 282, 50)
    body += label(6, 'CUT: SEMILUNAR', 'start', 344, 158, 266, 88)
    body += label(7, 'CORONARY ARTERY', 'start', 330, 206, 260, 186)
    body += label(8, 'LEFT VENTRICLE', 'start', 334, 268, 300, 236)
    anchors = {'venaCava': [184, 34], 'rightAtrium': [152, 100], 'cutRight': [164, 176], 'rightVentricle': [206, 234], 'aorta': [298, 40],
               'pulmonaryArtery': [256, 100], 'cutArtery': [262, 88], 'coronary': [254, 200], 'leftVentricle': [300, 236], 'leftAtrium': [322, 124]}
    parts = ['Ventricles', 'Right atrium', 'Left atrium', 'Coronary artery', 'Aorta', 'Pulmonary artery', 'Vena cava',
             'Cut to the tricuspid valve', 'Cut to a semilunar valve']
    return finish('dissection', 'Dissecting the heart', 'the front (ventral) surface of a sheep\'s or ox\'s heart, with where you cut',
                  'The front is the side with the coronary artery groove running down it. The left ventricle is on the right of the page and feels firmer. Cut down the right side to see the tricuspid valve; cut into the aorta or pulmonary artery to see a semilunar valve.',
                  'Dissecting a heart: the front surface', 'A sheep\'s heart from the front (ventral side), which has the coronary artery running down a groove between the ventricles. The right atrium\'s ear-shaped flap is at the top left, with the vena cava; the pulmonary artery leaves the right ventricle in front of the aorta. The left ventricle feels firmer because its wall is thicker. A dashed line down the right side shows the cut that opens the right atrium and ventricle to show the tricuspid valve, and a cut across the pulmonary artery exposes a semilunar valve.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- artery, vein and capillary
COAT, WALL, WALL_D = '#EED9CF', '#D9776A', '#B8574C'


def vessels():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Artery (T.S.): a thick wall of muscle and elastic fibres round a narrow lumen.
    ax, ay = 92, 104
    body += part(0, f'<circle cx="{ax}" cy="{ay}" r="50" fill="{COAT}" stroke="{WALL_D}" stroke-width="2"/>'
                    f'<circle cx="{ax}" cy="{ay}" r="43" fill="{WALL}"/>' +
                    ''.join(f'<circle cx="{ax}" cy="{ay}" r="{r}" fill="none" stroke="{WALL_D}" stroke-width="1.3" stroke-dasharray="5 4"/>' for r in (24, 31, 38)))
    body += part(1, f'<circle cx="{ax}" cy="{ay}" r="17" fill="{VALVE}" stroke="{WALL_D}" stroke-width="1.2"/>'
                    f'<circle cx="{ax}" cy="{ay}" r="13" fill="{RED_L}"/><circle cx="{ax - 3}" cy="{ay + 2}" r="5" fill="{RED}"/>')
    # Vein (T.S.): a thin wall round a wide lumen; it is often squashed out of round.
    vx, vy = 246, 104
    vout = f'M{vx - 54} {vy + 4}C{vx - 54} {vy - 34} {vx - 22} {vy - 44} {vx + 6} {vy - 42}C{vx + 40} {vy - 40} {vx + 56} {vy - 22} {vx + 54} {vy + 6}C{vx + 52} {vy + 34} {vx + 26} {vy + 44} {vx - 4} {vy + 42}C{vx - 34} {vy + 40} {vx - 54} {vy + 30} {vx - 54} {vy + 4}Z'
    body += part(2, f'<path d="{vout}" fill="{WALL}" stroke="{WALL_D}" stroke-width="2"/>')
    vin = f'M{vx - 45} {vy + 4}C{vx - 45} {vy - 28} {vx - 18} {vy - 35} {vx + 6} {vy - 33}C{vx + 34} {vy - 32} {vx + 46} {vy - 17} {vx + 45} {vy + 6}C{vx + 43} {vy + 28} {vx + 22} {vy + 35} {vx - 4} {vy + 33}C{vx - 28} {vy + 32} {vx - 45} {vy + 24} {vx - 45} {vy + 4}Z'
    body += part(3, f'<path d="{vin}" fill="{BLUE_L}" stroke="{VALVE}" stroke-width="2"/>'
                    + ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="{RED}"/>' for x, y in [(vx - 14, vy - 6), (vx + 12, vy + 10), (vx + 18, vy - 14)]))
    # Capillary (T.S.): a wall only one cell thick, just wide enough for one red blood cell.
    cx, cy = 398, 104
    body += part(4, f'<circle cx="{cx}" cy="{cy}" r="19" fill="{RED_L}" stroke="#E9A47F" stroke-width="6"/>'
                    + ''.join(f'<ellipse cx="{cx + 19 * dx:.1f}" cy="{cy + 19 * dy:.1f}" rx="4" ry="2.6" fill="#7A3A2A" transform="rotate({rot} {cx + 19 * dx:.1f} {cy + 19 * dy:.1f})"/>'
                              for dx, dy, rot in [(0, -1, 0), (0.87, 0.5, 60), (-0.87, 0.5, -60)])
                    + f'<circle cx="{cx}" cy="{cy}" r="10" fill="{RED}"/><circle cx="{cx}" cy="{cy}" r="4" fill="#C2364A"/>')
    # Vein (L.S.): a valve stops blood flowing backwards.
    body += part(5, f'<rect x="62" y="212" width="356" height="52" fill="{BLUE_L}"/>'
                    f'<rect x="62" y="206" width="356" height="9" fill="{WALL}" stroke="{WALL_D}" stroke-width="1.4"/>'
                    f'<rect x="62" y="261" width="356" height="9" fill="{WALL}" stroke="{WALL_D}" stroke-width="1.4"/>')
    body += part(6, f'<path d="M232 215Q252 222 266 236L262 240Q246 228 232 222Z" fill="{VALVE}" stroke="{INK}" stroke-width="1.4"/>'
                    f'<path d="M232 261Q252 254 266 240L262 236Q246 248 232 254Z" fill="{VALVE}" stroke="{INK}" stroke-width="1.4"/>')
    body += part(7, arrow(96, 238, 196, 238, '#FFFFFF', 5) + arrow(296, 238, 396, 238, '#FFFFFF', 5))
    labels = [
        {'text': 'Artery', 'keys': [['arter']]},
        {'text': 'Thick wall of muscle and elastic fibres', 'keys': [['thick', 'wall'], ['muscl'], ['elastic']]},
        {'text': 'Endothelium (lining)', 'keys': [['endotheli'], ['lining']]},
        {'text': 'Vein', 'keys': [['vein']]},
        {'text': 'Wide lumen', 'keys': [['lumen'], ['wide']]},
        {'text': 'Capillary', 'keys': [['capillar']]},
        {'text': 'Wall one cell thick', 'keys': [['one', 'cell'], ['thin', 'wall']]},
        {'text': 'Thin wall (vein)', 'keys': [['thin', 'wall'], ['thin']]},
        {'text': 'Valve', 'keys': [['valve']]},
    ]
    body += label(0, 'ARTERY', 'top', 68, 166, 92, 154)
    body += label(1, 'THICK MUSCLE WALL', 'bottom', 92, 34, 108, 72)
    body += label(2, 'ENDOTHELIUM', 'top', 168, 166, 104, 116)
    body += label(3, 'VEIN', 'top', 262, 166, 246, 146)
    body += label(4, 'WIDE LUMEN', 'bottom', 252, 34, 252, 84)
    body += label(5, 'CAPILLARY', 'top', 398, 166, 398, 126)
    body += label(6, 'WALL ONE CELL THICK', 'bottom', 394, 34, 404, 86)
    body += label(7, 'THIN WALL', 'top', 120, 290, 130, 266)
    body += label(8, 'VALVE', 'top', 262, 290, 250, 256)
    anchors = {'artery': [92, 154], 'arteryWall': [108, 72], 'arteryLumen': [92, 104], 'endothelium': [104, 116], 'vein': [246, 146],
               'veinLumen': [252, 96], 'veinWall': [296, 104], 'capillary': [398, 126], 'capillaryWall': [404, 86],
               'lsWall': [130, 266], 'valve': [250, 252], 'flow': [146, 238]}
    parts = ['Artery wall', 'Artery lumen and lining', 'Vein wall', 'Vein lumen', 'Capillary', 'Vein cut lengthways', 'Valve', 'Direction of blood flow']
    return finish('vessels', 'Artery, vein and capillary', 'an artery, a vein and a capillary in cross-section, and a vein cut lengthways',
                  'Artery: thick muscle wall, narrow lumen. Vein: thin wall, wide lumen, valves. Capillary: a wall one cell thick.',
                  'Artery, vein and capillary', 'Cross-sections of an artery, with a thick wall of muscle and elastic fibres round a narrow lumen; a vein, with a thin wall and a wide lumen; and a capillary, whose wall is only one cell thick. Below, a vein cut lengthways shows a valve whose flaps let blood flow only towards the heart.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- a capillary network in a tissue
PURPLE_V = '#9B4A8C'
LYMPH, LYMPH_D = '#EFE6A0', '#A99F3A'


def body_cell(x, y, w=40, h=28, tilt=0):
    return (f'<g transform="rotate({tilt} {x} {y})"><rect x="{x - w / 2}" y="{y - h / 2}" width="{w}" height="{h}" rx="11" fill="{CELL}" stroke="#C9A58C" stroke-width="1.6"/>'
            f'<circle cx="{x + 3}" cy="{y}" r="5" fill="#B5838F"/></g>')


def capillaries():
    body = f'<rect width="480" height="320" fill="#FBEFE3"/>'
    cells = [(150, 62, -6), (238, 58, 4), (330, 62, -3), (150, 128, 3), (250, 134, -4), (340, 128, 5),
             (150, 180, -4), (250, 172, 3), (342, 182, -5), (70, 214, 6), (196, 236, -3), (300, 238, 4), (410, 222, -6)]
    body += part(0, ''.join(body_cell(x, y, tilt=t) for x, y, t in cells))
    # Arteriole in (red), capillaries (red, then purple as they give up oxygen, then blue), venule out (blue).
    body += part(1, tube('M0 150H96', RED, 15) + flow('M0 150H96'))
    segs = [('M96 146C130 96 170 92 200 102', RED), ('M200 102C232 112 268 114 300 102', PURPLE_V), ('M300 102C334 90 370 100 386 146', BLUE),
            ('M96 150C140 150 164 164 200 158', RED), ('M200 158C236 152 266 148 300 156', PURPLE_V), ('M300 156C336 162 362 160 386 150', BLUE),
            ('M96 154C130 204 168 210 200 198', RED), ('M200 198C234 186 268 186 300 198', PURPLE_V), ('M300 198C334 210 370 204 386 154', BLUE),
            ('M200 104V156', PURPLE_V), ('M300 158V196', PURPLE_V), ('M224 108V154', PURPLE_V)]
    caps = ''.join(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>' for d, c in segs)
    caps += ''.join(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="5.5" stroke-linecap="round"/>' for d, c in segs)
    body += part(2, caps)
    body += part(3, tube('M386 150H480', BLUE, 16) + flow('M386 150H480'))
    # Lymph vessel: starts closed among the cells and takes up spare tissue fluid.
    lym = 'M128 276H452'
    body += part(4, f'<path d="{lym}" fill="none" stroke="{LYMPH_D}" stroke-width="17" stroke-linecap="round"/>'
                    f'<path d="{lym}" fill="none" stroke="{LYMPH}" stroke-width="13" stroke-linecap="round"/>' + flow(lym, LYMPH_D, 3.4))
    # Tissue fluid: forced out of the capillaries, it bathes the cells.
    dots = [(118, 104), (128, 196), (176, 150), (240, 112), (226, 192), (276, 168), (318, 128), (360, 208), (174, 260), (250, 214), (338, 252), (98, 250), (402, 186)]
    body += part(5, ''.join(f'<circle cx="{x}" cy="{y}" r="3.2" fill="#6FC3E6"/>' for x, y in dots)
                    + arrow(112, 182, 104, 204, '#4FA9CF', 2.5) + arrow(178, 212, 182, 234, '#4FA9CF', 2.5) + arrow(210, 246, 222, 266, '#4FA9CF', 2.5))
    body += part(6, arrow(12, 124, 70, 124, INK, 3.5) + arrow(410, 124, 468, 124, INK, 3.5))
    labels = [
        {'text': 'Arteriole (blood in)', 'keys': [['arteriol'], ['arter']]},
        {'text': 'Capillaries', 'keys': [['capillar']]},
        {'text': 'Venule (blood out)', 'keys': [['venule'], ['vein']]},
        {'text': 'Body cells', 'keys': [['cell']]},
        {'text': 'Lymph vessel', 'keys': [['lymph']]},
        {'text': 'Tissue fluid', 'keys': [['tissue', 'fluid'], ['fluid']]},
    ]
    body += label(0, 'ARTERIOLE', 'bottom', 54, 102, 40, 150)
    body += label(1, 'CAPILLARIES', 'bottom', 232, 22, 216, 106)
    body += label(2, 'VENULE', 'bottom', 434, 102, 440, 150)
    body += label(3, 'BODY CELLS', 'bottom', 396, 22, 346, 56)
    body += label(4, 'LYMPH VESSEL', 'top', 330, 290, 318, 276)
    body += label(5, 'TISSUE FLUID', 'top', 84, 290, 98, 250)
    anchors = {'arteriole': [40, 150], 'capillary': [216, 106], 'venule': [440, 150], 'cells': [346, 62], 'lymph': [318, 276],
               'fluid': [98, 250], 'flowIn': [40, 124], 'flowOut': [440, 124]}
    parts = ['Body cells', 'Arteriole', 'Capillary network', 'Venule', 'Lymph vessel', 'Tissue fluid', 'Direction of blood flow']
    return finish('capillaries', 'A capillary network', 'a capillary network in a tissue',
                  'An arteriole brings blood in, it spreads through a network of capillaries between the cells, and a venule takes it away. Fluid leaks out to bathe the cells; a lymph vessel collects what is left over.',
                  'A capillary network in a tissue', 'Blood enters a tissue in an arteriole and flows through a network of narrow capillaries between the body cells, giving up oxygen, then leaves in a venule. Fluid forced out of the capillaries (tissue fluid) bathes the cells; a blind-ended lymph vessel takes up the extra fluid.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- the double circulation
def bed(x0, x1, y, n=5, color=PURPLE_V):
    """A capillary bed between an artery end (right) and a vein end (left): a few loops."""
    step = (x1 - x0) / n
    d = f'M{x0} {y}' + ''.join(f'Q{x0 + step * (k + .5):.1f} {y - 9 if k % 2 else y + 9} {x0 + step * (k + 1):.1f} {y}' for k in range(n))
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round"/>'


def circulation():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # The heart as its two sides: the right side (blue) pumps to the lungs, the left side (red) to the body.
    body += part(0, '<rect x="194" y="118" width="92" height="70" rx="22" fill="#C4683F" stroke="#7A3A2A" stroke-width="2.4"/>'
                    f'<rect x="202" y="126" width="34" height="54" rx="12" fill="{BLUE_L}"/><rect x="244" y="126" width="34" height="54" rx="12" fill="{RED_L}"/>')
    # Pulmonary circuit: lungs at the top.
    body += part(1, '<rect x="176" y="10" width="128" height="44" rx="20" fill="#F4B6B9" stroke="#C25E6A" stroke-width="2"/>' + bed(190, 290, 32, 6))
    pa, pv = 'M214 126V54', 'M266 54V126'
    body += part(2, tube(pa, BLUE, 11) + flow(pa))
    body += part(3, tube(pv, RED, 11) + flow(pv))
    # Systemic circuit: the aorta down the right, the vena cava up the left, organs in between.
    ao = 'M266 180V200H360V308'
    vc = 'M120 308V200H214V180'
    body += part(4, tube(ao, RED, 12) + flow(ao))
    body += part(5, tube(vc, BLUE, 12) + flow(vc))
    # Liver: blood from the hepatic artery and from the gut (hepatic portal vein); out by the hepatic vein.
    body += part(6, tube('M354 230H304', RED, 6) + tube('M176 230H126', BLUE, 6) +
                    '<rect x="176" y="216" width="128" height="28" rx="12" fill="#9C4A3A" stroke="#6B2D3A" stroke-width="2"/>' + bed(186, 294, 230, 5, '#E7B9A6'))
    # Intestine, and the hepatic portal vein carrying its blood (and digested food) to the liver.
    gut = 'M182 266C182 254 200 254 200 266C200 278 218 278 218 266C218 254 236 254 236 266C236 278 254 278 254 266C254 254 272 254 272 266C272 278 290 278 290 266'
    body += part(7, f'<path d="{gut}" fill="none" stroke="#C25E6A" stroke-width="14" stroke-linecap="round"/><path d="{gut}" fill="none" stroke="#F4B6B9" stroke-width="10" stroke-linecap="round"/>' +
                    tube('M354 266H298', RED, 6))
    body += part(8, tube('M182 266Q164 266 164 252Q164 244 186 244', BLUE, 6) + flow('M182 266Q164 266 164 252Q164 244 186 244', '#FFFFFF', 2))
    # Kidneys: the renal artery in, the renal vein out.
    kid = ''.join(f'<path d="M{x} 286C{x - 16 * s} 286 {x - 16 * s} 308 {x} 308C{x + 10 * s} 308 {x + 8 * s} 300 {x + 4 * s} 297C{x + 8 * s} 294 {x + 10 * s} 286 {x} 286Z" fill="#C4683F" stroke="#7A3A2A" stroke-width="1.8"/>'
                  for x, s in ((222, -1), (260, 1)))
    body += part(9, tube('M354 297H262', RED, 5) + tube('M222 297H126', BLUE, 5) + bed(226, 256, 297, 2) + kid)
    labels = [
        {'text': 'Lungs', 'keys': [['lung']]},
        {'text': 'Pulmonary artery', 'keys': [['pulmonary', 'arter']]},
        {'text': 'Pulmonary vein', 'keys': [['pulmonary', 'vein']]},
        {'text': 'Right side of the heart', 'keys': [['right']]},
        {'text': 'Left side of the heart', 'keys': [['left']]},
        {'text': 'Vena cava', 'keys': [['vena', 'cava'], ['cava']]},
        {'text': 'Aorta', 'keys': [['aorta']]},
        {'text': 'Liver', 'keys': [['liver']]},
        {'text': 'Hepatic portal vein', 'keys': [['portal']]},
        {'text': 'Intestine', 'keys': [['intestin'], ['gut']]},
        {'text': 'Kidneys', 'keys': [['kidney']]},
    ]
    body += label(0, 'LUNGS', 'start', 316, 22, 300, 30)
    body += label(1, 'PULMONARY ARTERY', 'end', 196, 88, 214, 88)
    body += label(2, 'PULMONARY VEIN', 'start', 284, 88, 266, 88)
    body += label(3, 'RIGHT SIDE', 'end', 180, 150, 212, 150)
    body += label(4, 'LEFT SIDE', 'start', 300, 150, 268, 150)
    body += label(5, 'VENA CAVA', 'end', 106, 214, 120, 214)
    body += label(6, 'AORTA', 'start', 372, 200, 360, 200)
    body += label(7, 'LIVER', 'start', 386, 232, 296, 224)
    body += label(8, 'PORTAL VEIN', 'end', 110, 262, 164, 254)
    body += label(9, 'INTESTINE', 'start', 386, 266, 284, 266)
    body += label(10, 'KIDNEYS', 'start', 386, 300, 270, 298)
    anchors = {'lungs': [300, 30], 'pulmonaryArtery': [214, 88], 'pulmonaryVein': [266, 88], 'rightSide': [214, 150], 'leftSide': [266, 150],
               'heart': [240, 122], 'venaCava': [120, 214], 'aorta': [360, 200], 'liver': [296, 224], 'hepaticArtery': [332, 230],
               'hepaticVein': [148, 230], 'portal': [164, 254], 'intestine': [284, 266], 'kidneys': [270, 298], 'renalArtery': [330, 297],
               'renalVein': [160, 297], 'pulmonaryCircuit': [182, 40], 'systemicCircuit': [240, 280]}
    parts = ['Heart: right and left sides', 'Lungs', 'Pulmonary artery', 'Pulmonary vein', 'Aorta', 'Vena cava', 'Liver', 'Intestine',
             'Hepatic portal vein', 'Kidneys']
    return finish('circulation', 'The double circulation', 'the double circulation: the pulmonary and systemic circuits',
                  'Two circuits. The right side pumps blood to the lungs and back to the left side (pulmonary); the left side pumps it round the body and back to the right side (systemic). The hepatic portal vein takes blood from the intestine to the liver.',
                  'The double circulation', 'The right side of the heart pumps deoxygenated blood along the pulmonary artery to the lungs; oxygenated blood returns in the pulmonary vein to the left side (the pulmonary circuit). The left side pumps it along the aorta to the organs, and the vena cava brings it back to the right side (the systemic circuit). Blood from the intestine goes to the liver in the hepatic portal vein before returning to the heart.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- the liver's blood supply: the hepatic portal system
LIVER, LIVER_D = '#9C4A3A', '#6B2D3A'


def portal():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Small intestine: a loop of gut, with branches of the portal vein collecting digested food from it.
    gut = 'M118 266C118 236 160 230 196 240C236 252 270 270 312 262C350 254 372 234 372 214'
    body += part(0, f'<path d="{gut}" fill="none" stroke="#C25E6A" stroke-width="30" stroke-linecap="round"/>'
                    f'<path d="{gut}" fill="none" stroke="#F4B6B9" stroke-width="24" stroke-linecap="round"/>'
                    '<path d="M134 258Q150 244 170 246M214 250Q232 258 250 262M292 264Q316 262 334 252" fill="none" stroke="#E6939C" stroke-width="2"/>')
    # Liver: a large organ above.
    liv = 'M110 112C110 72 170 52 250 54C330 56 384 70 388 96C392 120 360 134 312 146C262 158 190 162 146 152C122 146 110 132 110 112Z'
    body += part(1, f'<path d="{liv}" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="2.6" stroke-linejoin="round"/>'
                    '<path d="M150 112Q220 120 300 100M186 136Q240 140 300 124" fill="none" stroke="#B8604E" stroke-width="2"/>')
    # Hepatic portal vein: from the intestine up into the liver, where it splits into capillaries.
    hpv = 'M236 248C238 220 230 190 226 150'
    body += part(2, tube(hpv, BLUE, 12) + tube('M170 244Q196 236 234 238', BLUE, 6) + tube('M314 258Q276 252 240 240', BLUE, 6) +
                    tube('M226 150Q206 130 186 124M226 150Q248 132 270 128', BLUE, 5) + flow(hpv))
    # Hepatic artery: oxygenated blood into the liver.
    ha = 'M470 190C420 190 330 186 316 140'
    body += part(3, tube(ha, RED, 9) + flow(ha))
    # Hepatic vein: blood out of the liver to the vena cava.
    hv = 'M292 70C294 44 300 26 316 8'
    body += part(4, tube(hv, BLUE, 10) + flow(hv))
    labels = [
        {'text': 'Liver', 'keys': [['liver']]},
        {'text': 'Small intestine', 'keys': [['intestin'], ['gut'], ['ileum']]},
        {'text': 'Hepatic portal vein', 'keys': [['portal']]},
        {'text': 'Hepatic artery', 'keys': [['hepatic', 'arter'], ['arter']]},
        {'text': 'Hepatic vein', 'keys': [['hepatic', 'vein']]},
    ]
    body += label(0, 'LIVER', 'end', 96, 96, 140, 104)
    body += label(1, 'SMALL INTESTINE', 'top', 220, 288, 200, 244)
    body += label(2, 'HEPATIC PORTAL VEIN', 'end', 196, 200, 230, 196)
    body += label(3, 'HEPATIC ARTERY', 'bottom', 400, 166, 400, 190)
    body += label(4, 'HEPATIC VEIN', 'start', 330, 26, 302, 40)
    anchors = {'liver': [140, 104], 'intestine': [200, 244], 'portal': [230, 196], 'hepaticArtery': [400, 190], 'hepaticVein': [302, 40]}
    parts = ['Small intestine', 'Liver', 'Hepatic portal vein', 'Hepatic artery', 'Hepatic vein']
    return finish('portal-system', 'The liver\'s blood supply', 'the liver, the small intestine and the hepatic portal vein',
                  'The hepatic portal vein runs from the small intestine to the liver. The hepatic artery brings oxygenated blood in; the hepatic vein takes blood out.',
                  'The hepatic portal system', 'Blood from the small intestine, carrying digested food, goes straight to the liver in the hepatic portal vein. The liver also gets oxygenated blood from the hepatic artery, and blood leaves it in the hepatic vein, which joins the vena cava.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- blood cells
def rbc(x, y, r=13):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{RED}" stroke="{RED_D}" stroke-width="1.4"/><circle cx="{x}" cy="{y}" r="{r * .45:.1f}" fill="#F27C80"/>'


def blood():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Plasma: the pale yellow liquid the cells float in.
    body += part(0, '<rect x="40" y="44" width="400" height="232" rx="30" fill="#F7E7A6" stroke="#D9C26A" stroke-width="2"/>')
    # Red blood cells, face on: no nucleus, so the middle is thin and pale.
    body += part(1, ''.join(rbc(x, y) for x, y in [(92, 150), (128, 196), (84, 232), (170, 240), (204, 110), (176, 160), (106, 104),
                                                    (222, 206), (318, 238), (398, 172), (360, 250), (264, 84)]))
    # A red blood cell seen from the side: biconcave.
    body += part(2, f'<path d="M136 64C136 54 146 52 152 58C156 62 164 62 168 58C174 52 184 54 184 64C184 74 174 76 168 70C164 66 156 66 152 70C146 76 136 74 136 64Z" fill="{RED}" stroke="{RED_D}" stroke-width="1.4"/>')
    # Lymphocyte: a white cell with a big round nucleus.
    body += part(3, f'<circle cx="284" cy="166" r="25" fill="#F5F0FF" stroke="{PURPLE_V}" stroke-width="2"/><circle cx="286" cy="166" r="19" fill="#7E5BA3"/>')
    # Monocyte (a phagocyte): a bigger white cell with a kidney-shaped nucleus.
    body += part(4, f'<circle cx="370" cy="104" r="32" fill="#F5F0FF" stroke="{PURPLE_V}" stroke-width="2"/>'
                    '<path d="M352 96C352 82 372 78 382 86C388 92 384 98 378 100C386 104 390 114 382 120C372 128 352 122 352 108Z" fill="#7E5BA3"/>')
    # Platelets: tiny fragments of cells.
    body += part(5, ''.join(f'<path d="M{x} {y}l5 -3l4 4l-2 5l-6 0z" fill="#B58BC9" stroke="#7E5BA3" stroke-width="1"/>'
                            for x, y in [(244, 248), (258, 256), (250, 236), (316, 194), (330, 204), (214, 152), (112, 268)]))
    labels = [
        {'text': 'Red blood cell (no nucleus)', 'keys': [['red']]},
        {'text': 'Biconcave shape (side view)', 'keys': [['biconcav'], ['concav']]},
        {'text': 'Lymphocyte (white blood cell)', 'keys': [['lymphocyt']]},
        {'text': 'Monocyte (white blood cell)', 'keys': [['monocyt'], ['phagocyt']]},
        {'text': 'Platelets', 'keys': [['platelet']]},
        {'text': 'Plasma', 'keys': [['plasma']]},
    ]
    body += label(0, 'RED BLOOD CELL', 'top', 90, 288, 92, 232)
    body += label(1, 'BICONCAVE', 'bottom', 160, 30, 160, 58)
    body += label(2, 'LYMPHOCYTE', 'top', 334, 288, 288, 190)
    body += label(3, 'MONOCYTE', 'bottom', 390, 30, 380, 74)
    body += label(4, 'PLATELETS', 'top', 226, 288, 246, 250)
    body += label(5, 'PLASMA', 'top', 430, 288, 414, 224)
    anchors = {'rbc': [92, 232], 'rbcSide': [160, 58], 'lymphocyte': [288, 190], 'monocyte': [380, 74], 'wbc': [284, 166],
               'platelets': [246, 250], 'plasma': [410, 224]}
    parts = ['Plasma', 'Red blood cells', 'Red blood cell, side view', 'Lymphocyte', 'Monocyte', 'Platelets']
    return finish('blood', 'Blood cells', 'the parts of blood: red blood cells, white blood cells, platelets and plasma',
                  'Red cells: biconcave discs with no nucleus. White cells: bigger, with a nucleus (lymphocytes: a big round one; monocytes: kidney-shaped). Platelets: tiny cell fragments. All in plasma.',
                  'Blood cells', 'Blood seen under a microscope: many red blood cells, biconcave discs with no nucleus; two kinds of white blood cell, a lymphocyte with a large round nucleus and a larger monocyte with a kidney-shaped nucleus; tiny platelets; all in the liquid plasma.',
                  body, labels, anchors, parts)


MAKERS = [heart, dissection, vessels, capillaries, circulation, portal, blood]


# ---------------------------------------------------------------- Chain reaction pictures (400 x 300)
# Each builds up as the chain's steps go into place: GA.step(k, ...) shows once steps 1 to k+1 are in place,
# GA.until(k, ...) goes when step k+1 changes the scene, and GA.badge(k, x, y) puts the step's number on it.
PALE = '#E8DED6'


def chambers(fills, y0=96):
    """A simple four-chamber heart: fills = (right atrium, left atrium, right ventricle, left ventricle)."""
    ra, la, rv, lv = fills
    return (f'<path d="M126 {y0}H274Q286 {y0} 286 {y0 + 12}V{y0 + 92}C286 {y0 + 140} 236 {y0 + 168} 206 {y0 + 172}C176 {y0 + 168} 114 {y0 + 140} 114 {y0 + 92}V{y0 + 12}Q114 {y0} 126 {y0}Z" fill="{MUSCLE}" stroke="{MUSCLE_D}" stroke-width="2.4"/>'
            f'<rect x="124" y="{y0 + 10}" width="70" height="52" rx="12" fill="{ra}"/><rect x="206" y="{y0 + 10}" width="70" height="52" rx="12" fill="{la}"/>'
            f'<path d="M124 {y0 + 74}H194V{y0 + 150}C170 {y0 + 146} 126 {y0 + 124} 124 {y0 + 90}Z" fill="{rv}"/>'
            f'<path d="M206 {y0 + 74}H276V{y0 + 90}C274 {y0 + 124} 230 {y0 + 146} 206 {y0 + 156}Z" fill="{lv}"/>')


def chain_heart_route():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    b += '<rect x="120" y="10" width="160" height="40" rx="18" fill="#F4E4E6" stroke="#C25E6A" stroke-width="2"/>'
    b += f'<text x="200" y="35" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#C25E6A">LUNGS</text>'
    b += f'<text x="40" y="118" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="12" fill="{INK}">FROM BODY</text>'
    b += f'<text x="352" y="292" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="12" fill="{INK}">TO BODY</text>'
    b += chambers((PALE, PALE, PALE, PALE))
    vc = 'M10 134H124'
    b += GA.step(0, tube(vc, BLUE, 12) + flow(vc))
    b += GA.step(1, f'<rect x="124" y="106" width="70" height="52" rx="12" fill="{BLUE_L}"/>')
    b += GA.step(2, f'<path d="M124 170H194V246C170 242 126 220 124 186Z" fill="{BLUE_L}"/>' + flap(140, 158, 146, 184, -4) + flap(178, 158, 172, 184, 4))
    pa = 'M186 176L200 162V50'
    b += GA.step(3, tube(pa, BLUE, 10) + flow(pa) + pockets(194, 206, 84))
    pv = 'M280 30H310V128H276'
    b += GA.step(4, '<rect x="120" y="10" width="160" height="40" rx="18" fill="#F6B1B3" stroke="#E5484D" stroke-width="2"/>'
                    f'<text x="200" y="35" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#B3262B">LUNGS + O2</text>' +
                 tube(pv, RED, 10) + flow(pv) + f'<rect x="206" y="106" width="70" height="52" rx="12" fill="{RED_L}"/>')
    ao = 'M276 210H352V276'
    b += GA.step(5, f'<path d="M206 170H276V186C274 220 230 242 206 252Z" fill="{RED_L}"/>' + flap(222, 158, 228, 184, -4) + flap(260, 158, 254, 184, 4) +
                 tube(ao, RED, 12) + flow(ao))
    b += GA.badge(0, 40, 154) + GA.badge(1, 160, 132) + GA.badge(2, 160, 214) + GA.badge(3, 220, 70) + GA.badge(4, 330, 80) + GA.badge(5, 330, 236)
    return GA.svg('Blood through the heart', 'Deoxygenated blood from the body enters the right atrium, passes the tricuspid valve into the right ventricle and is pumped into the pulmonary artery to the lungs. It comes back oxygenated in the pulmonary vein to the left atrium, passes the bicuspid valve into the left ventricle and is pumped into the aorta.', b)


def chain_heartbeat():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    b += tube('M150 96V30', BLUE, 12) + tube('M250 96V30', RED, 12)
    b += chambers((BLUE_L, RED_L, BLUE_L, RED_L), 96)
    sa = f'<circle cx="132" cy="112" r="7" fill="{NODE}" stroke="{INK}" stroke-width="1.6"/>'
    av = f'<circle cx="200" cy="164" r="6" fill="{NODE}" stroke="{INK}" stroke-width="1.6"/>'
    b += sa.replace(NODE, '#F3E7B0') + av.replace(NODE, '#F3E7B0')
    spark = '' if False else '<animate attributeName="r" values="7;10;7" dur="1s" repeatCount="indefinite"/>'
    b += GA.step(0, sa.replace('/>', '>' + spark + '</circle>'))
    waves = ''.join(f'<path d="M{132 + r} 112A{r} {r} 0 0 1 {132 + r * .2:.0f} {112 + r * .98:.0f}" fill="none" stroke="{NODE}" stroke-width="3" stroke-linecap="round"/>' for r in (24, 44, 64))
    b += GA.step(1, waves + f'<path d="M150 106Q200 92 262 112" fill="none" stroke="{NODE}" stroke-width="3" stroke-dasharray="6 5"/>')
    squeeze = ''.join(arrow(x1, y1, x2, y2, INK, 3) for x1, y1, x2, y2 in [(106, 134, 122, 134), (294, 134, 278, 134)])
    b += GA.step(2, squeeze + arrow(160, 150, 160, 186, '#FFFFFF', 4) + arrow(240, 150, 240, 186, '#FFFFFF', 4))
    b += GA.step(3, av.replace('/>', '><animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite"/></circle>'))
    b += GA.step(4, f'<path d="M200 170V252M200 252Q160 238 132 200M200 252Q240 238 268 200" fill="none" stroke="{NODE}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="7 5"/>')
    b += GA.step(5, ''.join(arrow(x1, y1, x2, y2, INK, 3) for x1, y1, x2, y2 in [(98, 210, 118, 204), (302, 210, 282, 204)]) +
                 arrow(150, 150, 150, 60, '#FFFFFF', 4) + arrow(250, 150, 250, 60, '#FFFFFF', 4))
    b += GA.badge(0, 112, 92) + GA.badge(1, 92, 160) + GA.badge(2, 312, 134) + GA.badge(3, 222, 176) + GA.badge(4, 200, 282) + GA.badge(5, 330, 210)
    return GA.svg('One heartbeat', 'The SA node (pacemaker) in the wall of the right atrium sends an impulse across both atria, which contract and push blood into the ventricles. The AV node passes the impulse down the septum to the ventricles, which contract and push blood up into the arteries.', b)


def chain_tissue_fluid():
    b = f'<rect width="400" height="300" fill="#FBEFE3"/>'
    cells = [(70, 70), (170, 62), (270, 70), (350, 64), (90, 214), (200, 222), (310, 212)]
    b += ''.join(body_cell(x, y, 46, 32) for x, y in cells)
    cap = 'M0 140H400'
    b += f'<path d="{cap}" stroke="{INK}" stroke-width="22"/>' + f'<path d="M0 140H134" stroke="{RED}" stroke-width="18"/><path d="M134 140H266" stroke="{PURPLE_V}" stroke-width="18"/><path d="M266 140H400" stroke="{BLUE}" stroke-width="18"/>'
    b += GA.step(0, flow(cap) + '<text x="10" y="144" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">HIGH PRESSURE →</text>')
    b += GA.step(1, ''.join(arrow(x, 128, x + 6, 98, '#4FA9CF', 3) + arrow(x, 152, x + 6, 182, '#4FA9CF', 3) for x in (60, 110)))
    dots = [(24, 104), (130, 100), (240, 108), (316, 112), (44, 176), (150, 182), (250, 188), (366, 182), (140, 250), (256, 254)]
    b += GA.step(2, ''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#6FC3E6"/>' for x, y in dots))
    b += GA.step(3, f'<text x="164" y="102" text-anchor="end" font-family="Nunito, sans-serif" font-weight="800" font-size="11" fill="#14243B">O2 + food</text>' +
                 arrow(170, 126, 170, 82, '#E5484D', 3) + arrow(214, 74, 214, 122, '#6E6676', 3) +
                 f'<text x="222" y="102" font-family="Nunito, sans-serif" font-weight="800" font-size="11" fill="#14243B">waste</text>')
    b += GA.step(4, ''.join(arrow(x, 96, x - 4, 124, '#4FA9CF', 3) + arrow(x, 184, x - 4, 156, '#4FA9CF', 3) for x in (300, 350)))
    lym = 'M60 286H392'
    b += GA.step(5, f'<path d="{lym}" stroke="{LYMPH_D}" stroke-width="16" stroke-linecap="round"/><path d="{lym}" stroke="{LYMPH}" stroke-width="12" stroke-linecap="round"/>' +
                 flow(lym, LYMPH_D, 3) + arrow(150, 250, 150, 274, '#4FA9CF', 3))
    b += GA.badge(0, 20, 118) + GA.badge(1, 128, 182) + GA.badge(2, 40, 252) + GA.badge(3, 260, 120) + GA.badge(4, 380, 120) + GA.badge(5, 30, 286)
    return GA.svg('Tissue fluid and lymph', 'Blood under pressure in a capillary forces fluid out through its thin walls. This tissue fluid bathes the cells, which take in oxygen and food and give out waste. Most of the fluid goes back into the capillary; the extra drains into a lymph vessel and returns to the blood.', b)


def chain_coronary():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    hrt = 'M60 120C50 180 80 240 150 276C170 286 192 286 204 278C238 250 252 190 236 130C226 100 190 86 140 88C100 90 66 100 60 120Z'
    b += f'<path d="{hrt}" fill="{MUSCLE}" stroke="{MUSCLE_D}" stroke-width="2.4"/>' + tube('M150 80V40', RED, 14) + tube('M120 84V30', BLUE, 12)
    cor = 'M150 92C150 150 168 210 196 262'
    b += tube(cor, RED, 5) + tube('M156 150Q180 156 206 176', RED, 4)
    # A close-up of the artery in cross-section.
    b += f'<circle cx="318" cy="118" r="62" fill="#FFFFFF" stroke="{INK}" stroke-width="2.4"/><path d="M200 156L262 140" stroke="{INK}" stroke-width="1.6" stroke-dasharray="4 4"/>'
    b += f'<circle cx="318" cy="118" r="46" fill="{WALL}" stroke="{WALL_D}" stroke-width="2"/><circle cx="318" cy="118" r="30" fill="{RED_L}"/>'
    b += GA.until(1, GA.step(0, f'<path d="M290 104Q300 96 312 92L310 100Q300 102 294 110Z" fill="#F2D48F" stroke="#C9A65A" stroke-width="1.4"/>'))
    b += GA.step(1, f'<path d="M288 118C288 96 306 88 330 90C318 100 312 112 314 130C306 134 294 132 288 118Z" fill="#F2D48F" stroke="#C9A65A" stroke-width="1.6"/>')
    b += GA.step(2, f'<path d="M314 130C312 112 318 100 330 90C342 96 348 108 346 122C342 138 326 144 314 130Z" fill="#7A1F2B"/>'
                    f'<text x="318" y="198" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="12" fill="{INK}">BLOCKED</text>')
    dead = 'M176 196C196 210 210 236 204 262C190 268 170 262 160 246C156 226 160 206 176 196Z'
    b += GA.step(3, f'<path d="{dead}" fill="#C9B9AE"/>' + tube('M156 150Q180 156 206 176', '#B9A9A0', 4))
    b += GA.step(4, f'<circle cx="270" cy="236" r="16" fill="#45C4EE" stroke="{INK}" stroke-width="2"/><text x="270" y="237" text-anchor="middle" dominant-baseline="central" font-family="Nunito, sans-serif" font-weight="800" font-size="11" fill="{INK}">O2</text>'
                    f'<path d="M256 222L284 250M284 222L256 250" stroke="#E5484D" stroke-width="4" stroke-linecap="round"/>')
    b += GA.step(5, f'<path d="{dead}" fill="#4A3A3A"/><text x="300" y="284" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="14" fill="#B3262B">HEART ATTACK</text>')
    b += GA.badge(0, 280, 88) + GA.badge(1, 274, 140) + GA.badge(2, 362, 134) + GA.badge(3, 226, 214) + GA.badge(4, 296, 222) + GA.badge(5, 160, 274)
    return GA.svg('A blocked coronary artery', 'Fatty deposits build up in the wall of a coronary artery and narrow it, then a clot blocks it. The heart muscle beyond the block gets no blood, so no oxygen for respiration, and it dies: a heart attack.', b)


def chain_gut_to_heart():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    gut = 'M40 262C40 238 80 236 120 244C170 254 210 268 260 260C300 254 330 240 352 236'
    b += f'<path d="{gut}" fill="none" stroke="#C25E6A" stroke-width="28" stroke-linecap="round"/><path d="{gut}" fill="none" stroke="#F4B6B9" stroke-width="22" stroke-linecap="round"/>'
    b += f'<path d="M220 112C220 82 270 66 330 70C376 74 392 94 386 114C380 134 344 146 300 150C258 154 220 142 220 112Z" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="2.4"/>'
    small = 'translate(-48 -8) scale(.6)'  # the heart, small, at the top left
    b += f'<g transform="{small}">' + chambers((PALE, PALE, PALE, PALE), 30) + '</g>'
    b += GA.step(0, ''.join(f'<path d="M{x} 250q6 -16 12 0" fill="#F4B6B9" stroke="#C25E6A" stroke-width="1.6"/>' for x in (90, 130, 170, 210)) +
                 ''.join(f'<circle cx="{x}" cy="232" r="3.4" fill="{NODE}"/>' for x in (96, 136, 176)))
    hpv = 'M190 248C200 210 240 190 262 150'
    b += GA.step(1, tube(hpv, BLUE, 9) + ''.join(f'<circle r="3.2" fill="{NODE}"><animateMotion path="{hpv}" dur="2.4s" begin="{-k * .8}s" repeatCount="indefinite"/></circle>' for k in range(3)))
    b += GA.step(2, ''.join(f'<g transform="translate({x} {y})"><path d="M0 -6V6M-5 -3L5 3M5 -3L-5 3" stroke="{NODE}" stroke-width="2.4" stroke-linecap="round"/></g>' for x, y in [(276, 98), (306, 112), (336, 94), (300, 128)]) +
                    f'<text x="306" y="86" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="11" fill="#FFFFFF">glycogen</text>')
    hv = 'M244 84C226 64 200 52 172 50'
    b += GA.step(3, tube(hv, BLUE, 8) + flow(hv))
    vc = 'M172 50H96V32H70'
    b += GA.step(4, tube(vc, BLUE, 12) + flow(vc))
    b += GA.step(5, f'<g transform="{small}"><rect x="124" y="40" width="70" height="52" rx="12" fill="{BLUE_L}"/></g>' +
                 f'<text x="72" y="134" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="11" fill="{INK}">RIGHT ATRIUM</text>')
    b += GA.badge(0, 60, 226) + GA.badge(1, 220, 210) + GA.badge(2, 360, 130) + GA.badge(3, 206, 74) + GA.badge(4, 136, 34) + GA.badge(5, 14, 60)
    return GA.svg('From the gut to the heart', 'Digested food absorbed in the villi of the small intestine is carried in the hepatic portal vein to the liver, which stores glucose as glycogen. Blood leaves the liver in the hepatic vein, joins the vena cava and returns to the right atrium.', b)


def CHAIN_ART():
    return {'Blood through the heart': chain_heart_route(), 'One heartbeat': chain_heartbeat(), 'Tissue fluid and lymph': chain_tissue_fluid(),
            'A blocked coronary artery': chain_coronary(), 'From the gut to the heart': chain_gut_to_heart()}


# Where each structure is on a base diagram: the words that name it, in the order they are checked.
ANCHOR_WORDS = {
    'heart': [('sa', ['sino', 'sa node', 'pacemaker']), ('av', ['atrioventricular node', 'av node']), ('tricuspid', ['tricuspid']),
              ('bicuspid', ['bicuspid', 'mitral']), ('semilunar', ['semilunar', 'semi-lunar', 'comhla', 'valve']),
              ('pulmonaryArtery', ['pulmonary artery', 'pulmonary trunk']), ('pulmonaryVein', ['pulmonary vein']), ('aorta', ['aorta']),
              ('venaCava', ['vena cava']), ('rightAtrium', ['right atrium']), ('leftAtrium', ['left atrium']),
              ('rightVentricle', ['right ventricle']), ('leftVentricle', ['left ventricle']), ('septum', ['septum'])],
    'dissection': [('cutRight', ['tricuspid', 'cut']), ('cutArtery', ['semilunar']), ('coronary', ['coronary']), ('aorta', ['aorta']),
                   ('pulmonaryArtery', ['pulmonary']), ('venaCava', ['vena cava']), ('rightAtrium', ['right atrium']),
                   ('rightVentricle', ['right ventricle']), ('leftVentricle', ['left ventricle']), ('leftAtrium', ['left atrium'])],
    'vessels': [('valve', ['valve']), ('endothelium', ['endotheli', 'lining']), ('capillaryWall', ['one cell']), ('capillary', ['capillar']),
                ('arteryWall', ['muscle', 'elastic']), ('artery', ['artery']), ('veinLumen', ['lumen']), ('vein', ['vein'])],
    'capillaries': [('arteriole', ['arteriole', 'artery']), ('venule', ['venule', 'vein']), ('lymph', ['lymph']), ('fluid', ['tissue fluid', 'fluid']),
                    ('cells', ['cell']), ('capillary', ['capillar'])],
    'circulation': [('portal', ['portal']), ('pulmonaryArtery', ['pulmonary artery']), ('pulmonaryVein', ['pulmonary vein']), ('lungs', ['lung']),
                    ('aorta', ['aorta']), ('venaCava', ['vena cava']), ('hepaticArtery', ['hepatic artery']), ('hepaticVein', ['hepatic vein']),
                    ('liver', ['liver']), ('intestine', ['intestin', 'gut']), ('renalArtery', ['renal artery']), ('renalVein', ['renal vein']),
                    ('kidneys', ['kidney']), ('rightSide', ['right']), ('leftSide', ['left'])],
    'portal-system': [('portal', ['portal']), ('hepaticArtery', ['hepatic artery', 'artery']), ('hepaticVein', ['hepatic vein']),
                      ('liver', ['liver']), ('intestine', ['intestin', 'gut'])],
    'blood': [('rbcSide', ['biconcave', 'side']), ('rbc', ['red']), ('lymphocyte', ['lymphocyte']), ('monocyte', ['monocyte', 'phagocyte']),
              ('wbc', ['white']), ('platelets', ['platelet']), ('plasma', ['plasma'])],
}


def base_of(what):
    """Kept narrow: other chapters' questions (an alveolus with its capillary, a villus) must not land on these diagrams."""
    w = what.lower()
    if any(k in w for k in ('graph', 'axes', 'nephron', 'villus', 'alveol', 'kidney cut')):
        return None
    if 'double circulation' in w or 'two circuits' in w:
        return 'circulation'
    if 'capillary network' in w or 'capillary bed' in w:
        return 'capillaries'
    if 'digestive system' not in w and ('hepatic portal' in w or ('hepatic' in w and 'intestine' in w)):
        return 'portal-system'
    if 'heart' in w and ('section' in w or 'cut-away' in w or 'chambers' in w) and 'three' not in w:
        return 'heart'
    return None


# Per-question corrections the general rules can't work out: diagrams with given labels, graphs, the right answer
# areas for 'tap' parts, and answer types.
OVERRIDES = {
    'dia': {
        '2006-Q5': {'base': 'portal-system', 'marks': [{'t': 'X', 'a': 'liver'}, {'t': 'Y', 'a': 'portal'}, {'t': 'Hepatic artery', 'a': 'hepaticArtery', 'given': True},
                                                       {'t': 'Hepatic vein', 'a': 'hepaticVein', 'given': True}, {'t': 'Intestine', 'a': 'intestine', 'given': True}]},
        '2014-Q3': {'base': 'capillaries', 'marks': [{'t': 'A', 'a': 'arteriole'}, {'t': 'B', 'a': 'venule'}, {'t': 'C', 'a': 'lymph'},
                                                     {'t': 'Body cells', 'a': 'cells', 'given': True}]},
        '2026-Q17a': {'base': 'capillaries', 'marks': [{'t': 'X', 'a': 'arteriole'}, {'t': 'Y', 'a': 'venule'}]},
        '2019-Q5': {'base': 'blood', 'marks': [{'t': 'Red blood cells', 'a': 'rbc', 'given': True}]},
        '2025-Q17a': {'base': 'circulation', 'marks': []},
        'S1-Q5d': {'fig': [{'img': 'assets/bio/papers/s1-p23.webp', 'box': [55.7, 7.8, 35.3, 14.6]}]},  # the photo of red blood cells
        '2022-Q17d': {'fig': [{'img': 'assets/bio/papers/2022c-p10.webp', 'box': [19.0, 43.2, 69.5, 16.6]}]},  # hearts X, Y and Z
        '2016-Q8': {},  # blank axes to draw on: nothing to show
        'S2-Q5a': {'base': 'heart', 'marks': [{'t': 'A', 'a': 'aorta'}, {'t': 'B', 'a': 'pulmonaryArtery'}, {'t': 'Valve', 'a': 'semilunar', 'given': True}]},
        # Relative arterial pressure over one second: two beats, a steep rise as the left ventricle contracts, then a slow fall.
        'S2-Q5c': {'graphs': [{'title': 'Arterial pressure', 'x': 'Time (s)', 'y': 'Relative arterial pressure',
                               'xt': [[0, '0'], [50, '0.5'], [100, '1.0']],
                               'series': [{'name': 'Pressure', 'straight': True, 'pts': [[0, 20], [4, 55], [8, 82], [12, 78], [20, 60], [32, 42], [44, 28], [50, 20],
                                                                                         [54, 55], [58, 82], [62, 78], [70, 60], [82, 42], [94, 28], [100, 20]]}]}]},
    },
    'tap': {  # part id -> anchors that are right
        'S2-Q5a(iii)': ['sa', 'rightAtrium'],
    },
    # 2010-Q7(b)(iii) is "draw and label sufficient of your dissection": a drawing (diagram 3 + labels 3(2)).
    'kind': {'2026-Q17a(iii)': 'text', '2016-Q8(b)(iii)': 'draw', '2006-Q5(b)': 'arrows', '2010-Q7(b)(iii)': 'draw'},
    # Points a part needs where the scheme's rule reads wrong: "Give two functions" (the scheme lists five to pick from);
    # one circuit's pathway (the scheme gives the pulmonary OR the systemic path); three diagrams + any two labels.
    'n': {'2014-Q3(d)': 2, 'S2-Q5b(ii)': 1, '2026-Q17a(iv)': 5},
    'arrows': {  # see ch28.py
        '2006-Q5(b)': {'max': 3, 'zones': {'liver': [[115, 58, 270, 92]], 'portal': [[210, 150, 40, 100]],
                                           'artery': [[308, 128, 45, 50], [340, 165, 135, 32]], 'vein': [[278, 0, 48, 72]]},
                       'rules': [{'on': 'portal', 'toward': 'liver', 'show': [234, 236, 226, 168]},
                                 {'on': 'artery', 'toward': 'liver', 'show': [452, 189, 352, 171]},
                                 {'on': 'vein', 'away': 'liver', 'show': [292, 64, 312, 16]}]},
    },
    # Keys written by hand (part id -> {point index: alternatives, or 'self'}): the few words that carry each point, where
    # the ones made from the scheme's sentence needed 4+ exact words, a descriptor ("Named cutting instrument") no student
    # writes, or a word that also turns up in wrong answers ("artery" alone, "oxygen" alone). Words: see bio/bio.js.
    # Note '2004-Q9(b)' is the id of five parts (their labels all start "(b)"), so only points 1-6 are set there: they
    # exist only in the dissection part (point 1 of the diagram part is a drawing tick, which stays one).
    'points': {
        'S1-Q3c(i)1': {0: [{'w': [w], 'n': 1} for w in ('hydrogencarbonate', 'bicarbonate', 'hco3')] +
                          [{'w': ['hydrogen', 'carbonate'], 'n': 2}, {'w': ['dissolv', 'plasma'], 'n': 2}]},
        'S1-Q3c(i)2': {0: [{'w': ['haemoglobin'], 'n': 1}, {'w': ['oxyhaemoglobin'], 'n': 1}]},
        'S1-Q5d(ii)': {0: [{'w': [w], 'n': 1} for w in ('transfus', 'donor', 'donat', 'compatib', 'agglutin', 'clump')],
                       1: [{'w': [a, b], 'n': 2} for a in ('rhesus', 'rh') for b in ('mother', 'baby', 'pregnan', 'fetus', 'foetus', 'unborn', 'newborn')] +
                          [{'w': [a, 'antibod'], 'n': 2} for a in ('pregnan', 'mother', 'baby')] + [{'w': ['haemolytic'], 'n': 1}]},
        'S2-Q5a(iv)': {0: [{'w': ['co2', w], 'n': 2} for w in ('high', 'increase', 'more', 'great', 'low', 'lower')],
                       1: [{'w': [a, 'co2'], 'n': 2} for a in ('respir', 'tissue', 'lost', 'lose', 'remove', 'excret', 'exhal')] +
                          [{'w': [a, 'co2', 'lung'], 'n': 3} for a in ('releas', 'diffus')]},
        'S2-Q5a(v)': {0: [{'w': ['artery', w], 'n': 2} for w in ('thick', 'muscle', 'elastic')] + [{'w': ['vein', 'thin'], 'n': 2}],
                      1: [{'w': ['artery', 'narrow'], 'n': 2}, {'w': ['vein', 'wide'], 'n': 2},
                          {'w': ['artery', 'small', 'lumen'], 'n': 3}, {'w': ['vein', 'large', 'lumen'], 'n': 3}],
                      2: [{'w': ['vein', 'valve'], 'n': 2}]},  # was also "artery" alone, which every answer to this part says
        # One circuit, its structures in order (n is 1): the vessels or the chambers either side of the lungs or body.
        'S2-Q5b(ii)': {0: [{'w': ['artery', 'lung', 'vein'], 'n': 3}, {'w': ['ventricle', 'lung', 'atrium'], 'n': 3}],
                       1: [{'w': ['aorta', 'vena', w], 'n': 3} for w in ('capillar', 'body', 'tissue', 'organ', 'cell', 'arteriol', 'venul')] +
                          [{'w': ['ventricle', 'aorta', 'atrium'], 'n': 3}, {'w': ['ventricle', 'body', 'atrium'], 'n': 3}]},
        # "Oxygen" alone was enough for point 0, so "the heart muscle gets extra oxygen" earned it.
        'S2-Q5b(iii)': {0: [{'w': [a, b], 'n': 2} for a in ('no', 'not', 'lack', 'less', 'low', 'lower', 'without', 'depriv', 'starv', 'cut',
                                                             'insuffic', 'cannot', 'little', 'decrease')
                            for b in ('oxygen', 'blood', 'nutrient', 'food', 'glucose')],
                        1: [{'w': [a, b], 'n': 2} for a in ('die', 'dying', 'dead', 'death', 'damag') for b in ('muscle', 'cell', 'tissue', 'cardiac')] +
                           [{'w': ['cannot', 'respir'], 'n': 2}, {'w': ['respir', 'stop'], 'n': 2}, {'w': ['necro'], 'n': 1}],
                        2: [{'w': ['heart', 'attack'], 'n': 2}, {'w': ['infarct'], 'n': 1}, {'w': ['cardiac', 'arrest'], 'n': 2},
                            {'w': ['heart', 'stop', 'pump'], 'n': 3}, {'w': ['heart', 'stop', 'beat'], 'n': 3}]},
        'S2-Q5b(iv)': {0: [{'w': [a, b], 'n': 2} for a in ('force', 'push', 'exert') for b in ('wall', 'vessel', 'artery')] +
                          [{'w': ['pressur', 'wall'], 'n': 2}]},
        'S2-Q5c(iii)': {1: [{'w': [a, b], 'n': 2} for a in ('high', 'above', 'fast', 'great', 'exceed', 'increase') for b in ('rest', 'normal', 'exercis')]},
        'S2-Q5d(i)': {0: [{'w': [a, b], 'n': 2} for a in ('lot', 'much', 'more', 'large', 'plenty', 'great', 'high', 'continu', 'constant', 'never') for b in ('energy', 'atp')] +
                         [{'w': ['contract', w], 'n': 2} for w in ('continu', 'constant', 'nonstop', 'always')] + [{'w': ['never', 'rest'], 'n': 2}],
                      # Not "respiration" + "ATP" alone: "ATP made by anaerobic respiration" says that too.
                      1: [{'w': ['aerob', 'respir'], 'n': 2}] +
                         [{'w': ['mitochondri', w], 'n': 2} for w in ('respir', 'releas', 'make', 'provid', 'suppl', 'generat')]},
        '2026-Q16b(iv)': {0: [{'w': [w], 'n': 1} for w in ('nucleus', 'organelle', 'ribosom', 'dna')] + [{'w': ['genetic', 'material'], 'n': 2}]},
        '2026-Q17a(ii)': {0: [{'w': [a, b], 'n': 2} for a in ('force', 'push', 'exert') for b in ('wall', 'vessel', 'artery')] +
                             [{'w': ['pressur', 'wall'], 'n': 2}],
                          1: [{'w': [a, 'artery'], 'n': 2} for a in ('stretch', 'expan', 'vibrat', 'throb', 'dilat')]},
        # "Correct matching effect described": any valid effect, which words can't pin down.
        '2026-Q17a(vi)': {0: 'self', 1: 'self'},
        '2025-Q17a(iv)': {0: [{'w': ['artery', w], 'n': 2} for w in ('thick', 'muscle', 'elastic')] + [{'w': ['vein', 'thin'], 'n': 2}],
                          1: [{'w': ['vein', 'valve'], 'n': 2}],
                          2: [{'w': ['artery', 'narrow'], 'n': 2}, {'w': ['vein', 'wide'], 'n': 2},
                              {'w': ['artery', 'small', 'lumen'], 'n': 3}, {'w': ['vein', 'large', 'lumen'], 'n': 3}]},
        '2024-Q6(e)': {0: [{'w': ['contract'], 'n': 1}, {'w': ['squeez'], 'n': 1}], 1: [{'w': ['relax'], 'n': 1}]},
        '2023-Q6(g)': {0: [{'w': [a, b], 'n': 2} for a in ('mix', 'apart', 'separ') for b in ('oxygen', 'deoxygen')]},
        '2020-Q9(a)(i)': {0: [{'w': [a, b], 'n': 2} for a in ('mix', 'apart', 'separ') for b in ('oxygen', 'deoxygen')] +
                             [{'w': ['oxygen', 'left'], 'n': 2}, {'w': ['deoxygen', 'right'], 'n': 2}, {'w': ['oxygen', 'lhs'], 'n': 2},
                              {'w': ['deoxygen', 'rhs'], 'n': 2}, {'w': ['differ', 'pressur'], 'n': 2}]},
        # Lub and dub, and which valves shut for each (a sound tied to the valves opening earns nothing).
        '2019-Q14b(v)': {0: [{'w': ['lub', 'dub'], 'n': 2}],
                         1: [{'w': ['valve', c], 'n': 2} for c in ('clos', 'shut', 'snap')],
                         2: [{'w': [v, c], 'n': 2} for v in ('tricuspid', 'bicuspid', 'atrioventricular', 'mitral', 'av') for c in ('clos', 'shut', 'snap')],
                         3: [{'w': [s, v, c], 'n': 3} for s in ('lub', 'first') for v in ('tricuspid', 'bicuspid', 'atrioventricular', 'mitral', 'av')
                             for c in ('clos', 'shut', 'snap')],
                         4: [{'w': ['semilunar', c], 'n': 2} for c in ('clos', 'shut', 'snap')],
                         5: [{'w': [s, 'semilunar', c], 'n': 3} for s in ('dub', 'second') for c in ('clos', 'shut', 'snap')]},
        '2018-Q11a(ii)': {0: [{'w': ['urea', 'liver'], 'n': 2}],
                          1: [{'w': ['hormone', 'gland'], 'n': 2}, {'w': ['hormone', 'endocrine'], 'n': 2}, {'w': ['insulin', 'pancrea'], 'n': 2}],
                          2: [{'w': ['antibod', w], 'n': 2} for w in ('lymphocyte', 'lymph', 'white')],
                          3: [{'w': ['oxygen', 'lung'], 'n': 2}, {'w': ['oxygen', 'alveol'], 'n': 2}],
                          4: [{'w': ['co2', 'cell'], 'n': 2}, {'w': ['co2', 'tissue'], 'n': 2}],
                          5: [{'w': [w, 'liver'], 'n': 2} for w in ('enzyme', 'clott', 'protein', 'fibrinogen', 'prothrombin')]},
        # Not "generates impulses" alone for the AV node: the SA node's line says that too.
        '2018-Q11b(ii)': {3: [{'w': ['generat', 'impuls'], 'n': 2}, {'w': ['impuls', 'ventricle'], 'n': 2}, {'w': ['contract', 'ventricle'], 'n': 2},
                              {'w': ['ventricle', 'systole'], 'n': 2}, {'w': ['control', 'heart', 'rate'], 'n': 3}]},
        '2016-Q8(a)(i)': {0: [{'w': [a, 'artery'], 'n': 2} for a in ('stretch', 'expan', 'vibrat', 'throb', 'dilat')]},
        '2016-Q8(a)(ii)': {0: [{'w': ['artery', w], 'n': 2} for w in ('surface', 'skin', 'superfic')]},
        '2016-Q8(b)(iv)': {0: [{'w': ['immediate'], 'n': 1}] + [{'w': [a, 'after'], 'n': 2} for a in ('right', 'straight', 'just', 'direct', 'soon')],
                           3: [{'w': [a, b], 'n': 2} for a in ('time', 'until', 'till', 'long') for b in ('rest', 'normal')]},
        '2016-Q15a(iii)': {0: [{'w': ['muscle', w], 'n': 2} for w in ('contract', 'squeez', 'press', 'push')],
                           1: [{'w': ['valve', 'back'], 'n': 2}, {'w': ['valve', 'direction'], 'n': 2}]},
        '2014-Q12c(iv)': {0: [{'w': ['pulmonary', 'vein'], 'n': 2}, {'w': ['pulmonary', 'artery'], 'n': 2}],  # was all three words
                          1: [{'w': ['lung', 'co2'], 'n': 2}, {'w': ['alveol', 'co2'], 'n': 2}]},
        # "Valve" alone also gave the mark to "A has valves", the wrong way round.
        '2014-Q3(c)': {0: [{'w': ['narrow', 'lumen'], 'n': 2}, {'w': ['small', 'lumen'], 'n': 2}, {'w': ['thick', 'wall'], 'n': 2}, {'w': ['more', 'muscle'], 'n': 2}] +
                          [{'w': [a, 'valve'], 'n': 2} for a in ('no', 'not', 'without', 'lack', 'absent', 'dont', 'doesnt')]},
        '2014-Q3(d)': {0: [{'w': ['maintain', 'constant', 'level', 'ecf'], 'n': 3}] +
                          [{'w': [a, 'fluid'], 'n': 2} for a in ('return', 'drain', 'tissue', 'excess', 'collect')],
                       2: [{'w': ['filt', w], 'n': 2} for w in ('bacteri', 'pathogen', 'germ', 'microb')],
                       3: [{'w': ['fight', 'infec'], 'n': 2}, {'w': ['fight', 'disease'], 'n': 2}, {'w': ['defen'], 'n': 1}, {'w': ['immun'], 'n': 1}],
                       # "Transport of named material", not "transport" alone ("transports oxygen" is wrong).
                       4: [{'w': [a, b], 'n': 2} for a in ('transport', 'carr', 'move', 'absorb') for b in ('fat', 'lipid', 'hormone', 'lymphocyte', 'excret')]},
        '2014-Q9b(i)2': {0: [{'w': [a, 'right'], 'n': 2} for a in ('cut', 'incis', 'open', 'slice')],
                         1: [{'w': ['scalpel'], 'n': 1}, {'w': ['blade'], 'n': 1}]},
        '2014-Q9b(ii)2': {0: [{'w': [a, 'pulse'], 'n': 2} for a in ('feel', 'locat', 'find')] +
                             [{'w': ['finger', 'wrist'], 'n': 2}, {'w': ['finger', 'neck'], 'n': 2}, {'w': ['observ', 'breath'], 'n': 2}, {'w': ['watch', 'breath'], 'n': 2}],
                          1: [{'w': [a, b], 'n': 2} for a in ('count', 'number', 'record') for b in ('minute', 'min', 'second', 'sec', 'time', 'bpm', 'period')]},
        '2010-Q15b(ii)': {0: [{'w': [w], 'n': 1} for w in ('glucose', 'amino', 'sugar', 'vitamin', 'mineral', 'fructose', 'galactose', 'monosacchar',
                                                           'nutrient', 'food', 'salt', 'co2')]},
        '2010-Q7(a)(ii)': {0: [{'w': [a, b], 'n': 2} for a in ('never', 'not', 'doesnt', 'dont', 'no', 'cannot', 'without') for b in ('tire', 'fatigu')] +
                              [{'w': ['involuntar'], 'n': 1}]},
        # Dissection steps the scheme only describes ("Named cutting instrument"): the words a student would write.
        '2010-Q7(b)(i)': {0: [{'w': [w], 'n': 1} for w in ('front', 'ventr', 'dorsal')] + [{'w': ['left', 'right'], 'n': 2}],
                          1: [{'w': [w], 'n': 1} for w in ('coronary', 'thick', 'firm', 'diagonal')],
                          2: [{'w': [w], 'n': 1} for w in ('scalpel', 'blade', 'scissors', 'knife')],
                          3: [{'w': [a, b], 'n': 2} for a in ('cut', 'incis') for b in ('right', 'left', 'atri', 'ventricle', 'side', 'septum', 'apex')],
                          4: [{'w': [a, b], 'n': 2} for a in ('second', 'another', 'then', 'next', 'again') for b in ('cut', 'incis')],
                          5: [{'w': [w], 'n': 1} for w in ('valve', 'tricuspid', 'bicuspid', 'semilunar', 'chord', 'septum', 'tendin', 'papillar')],
                          6: [{'w': [w], 'n': 1} for w in ('safe', 'glove', 'care', 'wash', 'disinfect', 'goggle', 'coat')]},
        '2004-Q9(b)': {1: [{'w': [w], 'n': 1} for w in ('coronary', 'thick', 'firm', 'diagonal')],
                       2: [{'w': [a, b], 'n': 2} for a in ('ventr', 'front') for b in ('upper', 'up', 'top')],
                       4: [{'w': [w], 'n': 1} for w in ('scalpel', 'blade', 'scissors', 'knife')],
                       5: [{'w': [w], 'n': 1} for w in ('cut', 'incis', 'slice')],
                       6: [{'w': [w], 'n': 1} for w in ('safe', 'glove', 'care', 'wash', 'disinfect', 'goggle', 'coat')]},
        '2009-Q13a(i)': {0: [{'w': ['pulmonary'], 'n': 1}], 1: [{'w': ['systemic'], 'n': 1}]},
        '2009-Q13b(i)': {1: [{'w': [a, b], 'n': 2} for a in ('force', 'push', 'exert') for b in ('wall', 'vessel', 'artery', 'blood', 'heart')] +
                            [{'w': ['pressur', 'wall'], 'n': 2}]},
        '2009-Q13b(ii)': {0: 'self', 1: 'self'},  # "dietary factor + matching effect", "comment + matching effect"
        '2009-Q13b(iii)': {0: [{'w': ['haemoglobin'], 'n': 1}],
                           1: [{'w': ['nucleus'], 'n': 1}] + [{'w': [a, b], 'n': 2} for a in ('no', 'not', 'lack', 'without', 'absent') for b in ('mitochondri', 'organelle', 'ribosom')],
                           2: [{'w': [w], 'n': 1} for w in ('biconcave', 'concave', 'disc', 'disk')]},
        '2009-Q13b(iv)': {0: [{'w': [w], 'n': 1} for w in ('impuls', 'pacemak', 'signal')] +
                             [{'w': ['contract', w], 'n': 2} for w in ('caus', 'make', 'start', 'trigger', 'stimul', 'initiat')] +
                             [{'w': ['control', 'rate'], 'n': 2}, {'w': ['set', 'rate'], 'n': 2}, {'w': ['control', 'beat'], 'n': 2}]},
        '2006-Q13a(ii)': {2: [{'w': [w], 'n': 1} for w in ('biconcave', 'concave', 'disc', 'disk')], 3: [{'w': ['small'], 'n': 1}]},
        '2006-Q13b(i)': {0: [{'w': ['liquid', 'blood'], 'n': 2}, {'w': ['fluid', 'blood'], 'n': 2}],
                         1: [{'w': ['bowman'], 'n': 1}, {'w': ['capsule'], 'n': 1}, {'w': ['left', 'glomerul'], 'n': 2}] +
                            [{'w': [a, 'protein'], 'n': 2} for a in ('less', 'minus', 'without', 'no', 'except', 'lack', 'remove')]},
    },
}

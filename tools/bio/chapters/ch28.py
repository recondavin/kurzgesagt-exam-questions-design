"""Chapter 28, the breathing system: its diagrams and how its exam questions use them.

Diagrams (tools/bio/build_bio_diagrams.py builds them into bio/d28.js):
  MAKERS        one function per diagram to memorise, each returning finish(...) from bio_art.
  CHAIN_ART     the Chain reaction pictures (400 x 300), one per chain in bio/learn28.js, built step by step.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is, from its description,
  ANCHOR_WORDS  the words that name each anchor on those diagrams (exam letters go to that anchor),
  OVERRIDES     per-question corrections: graphs, tap answers, answer types.
"""
import math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'mini_games'))
from bio_art import part, tube, vessel, flow, arrow, finish, RED, BLUE, BG, INK  # noqa: E402
import build_game_art as ga  # noqa: E402

CHAPTER = 28
TOPIC = 'The breathing system'

SKIN, SKIN_D = '#F6D5C0', '#C98F72'
AIR, AIR_D = '#FFF6EC', '#C4683F'
CART, CART_D = '#D6E6F5', '#5E83AD'
LUNG, LUNG_D, LUNG_CUT = '#F2948C', '#B5543A', '#F9D3CC'
MUSCLE, MUSCLE_D = '#C2364A', '#8E2433'
BONE, BONE_D = '#FDF7E8', '#A89A7E'
O2C, CO2C = '#2E9E5B', '#E8551F'


def f(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')


# Lexend 600 at 12.5px, measured in the browser: the shared label() guesses 7.4px a letter, which is too narrow
# for capitals, so the pills here are sized from these widths. Same markup as label(), so Draw it reads them.
LEX = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '(),-.:/+", [9, 9, 9, 10, 8, 8, 10, 10, 7, 8, 9, 8, 11, 10, 10, 8, 10, 9, 8, 8, 9, 9, 12, 9, 8, 8,
                                                                   8, 7, 7, 7, 8, 7, 7, 7, 7, 7, 4, 3, 5, 5, 4, 5, 3, 3, 7, 7]))


def tag(i, text, side, ax, ay, fx, fy):
    """As build_diagrams.label: side start = pill runs right from (ax, ay); end = pill ends at (ax, ay);
    top = pill hangs below (ax, ay); bottom = pill sits above (ax, ay). (fx, fy) is the feature."""
    w = sum(LEX.get(c, 9) for c in text) + 20
    if side == 'start':
        tx, ty, anchor, rx = ax + 10, ay, 'start', ax
    elif side == 'end':
        tx, ty, anchor, rx = ax - 10, ay, 'end', ax - w
    elif side == 'top':
        tx, ty, anchor, rx = ax, ay + 11, 'middle', ax - w / 2
    else:
        tx, ty, anchor, rx = ax, ay - 11, 'middle', ax - w / 2
    assert -0.5 <= rx and rx + w <= 480.5 and 0 <= ty - 11 and ty + 11 <= 320, (text, rx, rx + w, ty)
    return (f'<g data-label="{i}"><path d="M{fx} {fy}L{ax} {ay}" stroke="{INK}" stroke-width="1.6" fill="none"/>'
            f'<circle cx="{fx}" cy="{fy}" r="3" fill="{INK}" stroke="#FFFFFF" stroke-width="1.2"/>'
            f'<rect x="{f(rx)}" y="{ty - 11}" width="{w}" height="22" rx="11" fill="{INK}"/>'
            f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" '
            f'font-weight="600" font-size="12.5" fill="#FFFFFF">{text}</text></g>')


label = tag


# ---------------------------------------------------------------- the breathing system
CX = 222  # the middle of the chest


def lung_path(side, cx=CX, w=1.0, top=146, bottom=288, base_mid=280):
    """One lung, side -1 (on the left as you look) or 1. Its base is hollowed to sit on the diaphragm."""
    def X(dx):
        return f(cx + side * dx * w)
    return (f'M{X(12)} {top + 8}C{X(30)} {top} {X(56)} {top + 6} {X(68)} {top + 32}C{X(80)} {top + 58} {X(84)} {bottom - 42} {X(82)} {bottom}'
            f'C{X(62)} {bottom - 12} {X(30)} {base_mid - 10} {X(6)} {base_mid}C{X(2)} {top + 94} {X(2)} {top + 50} {X(8)} {top + 20}Z')


def diaphragm_path(cx=CX, y_side=300, y_dome=270, y_mid=282, half=90):
    return (f'M{cx - half} {y_side}C{cx - half + 24} {y_dome + 6} {cx - 26} {y_dome - 2} {cx - 8} {y_mid - 2}Q{cx} {y_mid + 3} {cx + 8} {y_mid - 2}'
            f'C{cx + 26} {y_dome - 2} {cx + half - 24} {y_dome + 6} {cx + half} {y_side}')


def alveoli_bunch(x, y, r=3.8):
    return ''.join(f'<circle cx="{f(x + dx)}" cy="{f(y + dy)}" r="{r}" fill="{LUNG}" stroke="{LUNG_D}" stroke-width="1.3"/>'
                   for dx, dy in [(0, 0), (5.5, -3), (4.5, 4.5), (-2.5, 5.5), (-4, -2)])


def breathing():
    cx = CX
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    DX = -16  # the art is drawn round x = CX and moved left, to leave room for the long labels on the right

    def part(n, x):
        return f'<g data-part="{n}"><g transform="translate({DX} 0)">{x}</g></g>'

    def label(i, text, side, ax, ay, fx, fy):
        return tag(i, text, side, ax, ay, fx + DX, fy)
    # The body: a head cut down the middle (facing left) on top of the chest seen from the front.
    sil = (f'<path d="M207 128L203 106C192 103 182 101 177 98C171 95 169 88 170 82C169 78 170 75 171 73C168 70 166 66 167 62C164 60 156 58 151 55'
           f'C155 47 162 40 167 34C170 24 174 18 179 14C192 5 207 3 221 4C245 5 266 9 278 22C288 34 289 56 282 78C277 92 270 100 263 106L257 128'
           f'C280 132 300 134 312 140C320 146 322 152 322 160V320H122V160C122 152 124 146 132 140C144 134 184 132 207 128Z" fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2.2" stroke-linejoin="round"/>'
           f'<path d="M151 55L160 57" stroke="{SKIN_D}" stroke-width="2" stroke-linecap="round"/>')
    body += part(0, sil)
    # Nasal cavity above the palate, the mouth (with the tongue) below it.
    nose = (f'<path d="M159 58C165 46 181 38 203 36C221 35 235 38 245 44L245 58C229 54 213 56 195 58C183 59 171 60 159 58Z" fill="{AIR}" stroke="{AIR_D}" stroke-width="2"/>'
            f'<path d="M190 44C198 40 210 40 214 46M196 52C204 47 216 47 222 52M226 42C232 40 238 42 240 46" fill="none" stroke="{AIR_D}" stroke-width="1.6" stroke-linecap="round"/>'
            f'<path d="M171 70C185 66 211 64 237 66L241 84C219 88 193 86 175 79Z" fill="{AIR}" stroke="{AIR_D}" stroke-width="2"/>'
            f'<path d="M180 80C194 72 220 70 238 76C238 86 222 92 200 91C190 90 183 86 180 80Z" fill="#E8737A" stroke="#B5543A" stroke-width="1.6"/>')
    body += part(1, nose)
    # Pharynx: the back of the throat, where the nose and mouth meet. Food goes on down the oesophagus behind.
    phar = (tube('M246 46V96', 12, AIR, AIR_D) + tube('M248 98C248 118 240 132 228 146', 8, '#E9A8A0', '#B5543A')
            + f'<path d="M224 99Q228 88 240 85" fill="none" stroke="{LUNG_D}" stroke-width="7" stroke-linecap="round"/>'
            + '<path d="M224 99Q228 88 240 85" fill="none" stroke="#E8737A" stroke-width="4" stroke-linecap="round"/>')
    body += part(2, phar)
    # Larynx (the voice box) at the top of the trachea.
    body += part(3, f'<path d="M210 100H234L232 123H212Z" fill="{CART}" stroke="{CART_D}" stroke-width="2" stroke-linejoin="round"/>'
                    f'<path d="M215 110L222 116L229 110" fill="none" stroke="{CART_D}" stroke-width="1.6"/>')
    # Lungs: the one on the right (as you look) is cut open to show the airways inside.
    lungs = (f'<path d="{lung_path(-1)}" fill="{LUNG}" stroke="{LUNG_D}" stroke-width="2.4" stroke-linejoin="round"/>'
             f'<path d="{lung_path(1)}" fill="{LUNG_CUT}" stroke="{LUNG_D}" stroke-width="2.4" stroke-linejoin="round"/>')
    body += part(4, lungs)
    # Trachea, held open by C-shaped rings of cartilage.
    tra = (f'<rect x="213" y="122" width="18" height="66" rx="3" fill="{CART}" stroke="{CART_D}" stroke-width="2"/>'
           + ''.join(f'<path d="M214 {y}H230" stroke="#FFFFFF" stroke-width="3"/>' for y in range(128, 186, 7)))
    body += part(5, tra)
    # Bronchi: one into each lung.
    bro = (tube(f'M{cx} 184C{cx - 8} 194 {cx - 18} 200 {cx - 28} 212', 9, CART, CART_D)
           + tube(f'M{cx} 184C{cx + 8} 194 {cx + 18} 200 {cx + 28} 212', 9, CART, CART_D))
    body += part(6, bro)
    # Bronchioles branch again and again, ending in bunches of alveoli.
    br = [('M250 212C258 204 268 198 280 192', 3.2), ('M250 212C260 220 272 226 286 234C292 238 296 244 298 250', 3.2),
          ('M250 212C254 226 258 242 262 258', 3.2), ('M270 222C276 216 282 214 288 212', 2.4), ('M257 236C264 246 272 254 278 262', 2.4),
          ('M280 192C284 186 286 180 286 174', 2.4), ('M262 258C262 266 258 272 254 276', 2.4)]
    bron = ''.join(f'<path d="{d}" fill="none" stroke="{AIR_D}" stroke-width="{w}" stroke-linecap="round"/>' for d, w in br)
    bron += ''.join(alveoli_bunch(x, y) for x, y in [(286, 172), (290, 211), (299, 252), (279, 264), (253, 278), (282, 194)])
    body += part(7, bron)
    # Ribs (in section) down each side of the chest wall, with the intercostal muscles between them.
    ribs = ''
    for wx in (cx - 92, cx + 92):
        for k, y in enumerate(range(156, 290, 24)):
            if k:
                ribs += f'<path d="M{wx} {y - 17}V{y - 7}" stroke="{MUSCLE_D}" stroke-width="7" stroke-linecap="round"/><path d="M{wx} {y - 17}V{y - 7}" stroke="{MUSCLE}" stroke-width="4" stroke-linecap="round"/>'
            ribs += f'<ellipse cx="{wx}" cy="{y}" rx="5.5" ry="7" fill="{BONE}" stroke="{BONE_D}" stroke-width="1.8"/>'
    body += part(8, ribs)
    # Diaphragm: the sheet of muscle under the lungs, domed when relaxed.
    dia = diaphragm_path()
    body += part(9, f'<path d="{dia}" fill="none" stroke="{MUSCLE_D}" stroke-width="10" stroke-linecap="round"/><path d="{dia}" fill="none" stroke="{MUSCLE}" stroke-width="6" stroke-linecap="round"/>')
    labels = [
        {'text': 'Nasal cavity', 'keys': [['nasal'], ['nose']]},
        {'text': 'Pharynx', 'keys': [['pharynx'], ['throat']]},
        {'text': 'Epiglottis', 'keys': [['epiglottis']]},
        {'text': 'Larynx (voice box)', 'keys': [['larynx'], ['voice', 'box']]},
        {'text': 'Trachea (windpipe), with rings of cartilage', 'keys': [['trachea'], ['windpipe']]},
        {'text': 'Bronchus', 'keys': [['bronchus'], ['bronchi']]},
        {'text': 'Bronchiole', 'keys': [['bronchiole']]},
        {'text': 'Alveoli', 'keys': [['alveol'], ['air', 'sac']]},
        {'text': 'Lung', 'keys': [['lung']]},
        {'text': 'Rib', 'keys': [['rib']]},
        {'text': 'Intercostal muscle', 'keys': [['intercostal']]},
        {'text': 'Diaphragm', 'keys': [['diaphragm']]},
    ]
    body += label(0, 'NASAL CAVITY', 'end', 124, 30, 192, 50)
    body += label(1, 'PHARYNX', 'start', 312, 30, 246, 60)
    body += label(2, 'EPIGLOTTIS', 'start', 312, 72, 232, 89)
    body += label(3, 'LARYNX', 'end', 104, 108, 212, 111)
    body += label(4, 'TRACHEA', 'end', 104, 144, 214, 152)
    body += label(5, 'BRONCHUS', 'end', 104, 180, 200, 206)
    body += label(6, 'BRONCHIOLE', 'start', 312, 150, 274, 196)
    body += label(7, 'ALVEOLI', 'start', 312, 196, 291, 212)
    body += label(8, 'LUNG', 'end', 104, 224, 166, 232)
    body += label(9, 'RIB', 'end', 104, 258, 130, 252)
    body += label(10, 'INTERCOSTAL MUSCLE', 'start', 309, 268, 314, 264)
    body += label(11, 'DIAPHRAGM', 'end', 104, 302, 146, 290)
    anchors = {'nasal': [192, 50], 'mouth': [206, 74], 'pharynx': [246, 60], 'epiglottis': [232, 89], 'larynx': [222, 111], 'oesophagus': [247, 124],
               'trachea': [222, 152], 'cartilage': [222, 141], 'bronchus': [200, 206], 'bronchusR': [244, 206], 'bronchiole': [274, 196],
               'alveoli': [291, 212], 'lung': [166, 232], 'lungR': [282, 238], 'rib': [130, 252], 'intercostal': [314, 264], 'diaphragm': [146, 290],
               'thorax': [222, 236]}
    anchors = {k: [v[0] + DX, v[1]] for k, v in anchors.items()}
    parts = ['The body', 'Nasal cavity and mouth', 'Pharynx and epiglottis', 'Larynx', 'Lungs', 'Trachea', 'Bronchi',
             'Bronchioles and alveoli', 'Ribs and intercostal muscles', 'Diaphragm']
    return finish('breathing', 'The breathing system', 'the human breathing system',
                  'Air goes in the nasal cavity, down the pharynx past the epiglottis, through the larynx and the trachea, into a bronchus, then bronchioles, to the alveoli. Show the ribs with the intercostal muscles between them, and the diaphragm under the lungs.',
                  'The human breathing system', 'A head cut in half shows the nasal cavity, the mouth and the pharynx, with the epiglottis over the larynx. The trachea, held open by rings of cartilage, runs down into the chest and splits into two bronchi, one to each lung. In the lung cut open, the bronchi branch into bronchioles that end in bunches of alveoli. Ribs and intercostal muscles form the chest wall, and the domed diaphragm lies under the lungs.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- an alveolus and its capillary
ACX, ACY, AR = 230, 140, 82   # the alveolus: centre and radius
CR = AR + 12                  # the capillary runs round it at this radius


def on_circle(r, deg):
    a = math.radians(deg)
    return ACX + r * math.cos(a), ACY + r * math.sin(a)


def alveolus():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    gap = (212.2, 237.8)  # degrees: where the bronchiole opens into the alveolus (upper left)
    p1, p2 = on_circle(AR, gap[1]), on_circle(AR, gap[0])
    m1, m2 = on_circle(AR - 5, gap[1] - 2), on_circle(AR - 5, gap[0] + 2)
    wall = f'M{f(p1[0])} {f(p1[1])}A{AR} {AR} 0 1 1 {f(p2[0])} {f(p2[1])}'
    # The alveolus: a tiny air sac with a wall one cell thick.
    body += part(0, f'<circle cx="{ACX}" cy="{ACY}" r="{AR}" fill="{AIR}"/>'
                    f'<path d="{wall}" fill="none" stroke="{LUNG_D}" stroke-width="7" stroke-linecap="round"/>'
                    f'<path d="{wall}" fill="none" stroke="{LUNG}" stroke-width="4" stroke-linecap="round"/>')
    # The bronchiole brings air in and out; it meets the alveolus at the gap in its wall.
    o, c, i = on_circle(AR, 225), on_circle(AR + 50, 225), on_circle(AR - 4, 225)
    bro = f'M10 0C40 22 {f(c[0])} {f(c[1])} {f(o[0])} {f(o[1])}'
    body += part(1, f'<path d="{bro}" fill="none" stroke="{LUNG_D}" stroke-width="39"/>'
                    f'<path d="{bro}L{f(i[0])} {f(i[1])}" fill="none" stroke="{AIR}" stroke-width="32"/>')
    # A film of moisture lines the wall: gases dissolve in it first.
    body += part(2, f'<path d="M{f(m1[0])} {f(m1[1])}A{AR - 5} {AR - 5} 0 1 1 {f(m2[0])} {f(m2[1])}" fill="none" stroke="#5BC0EB" stroke-width="3" stroke-linecap="round"/>')
    # The capillary hugs the bottom of the alveolus: in from the pulmonary artery (left), out to the pulmonary vein (right).
    a, b = on_circle(CR, 150), on_circle(CR, 30)
    cap = f'M{f(a[0])} {f(a[1])}A{CR} {CR} 0 0 0 {f(b[0])} {f(b[1])}'
    body += part(3, vessel(cap, '#9B4A8C', 18) + vessel(cap, '#F7E3EA', 12))
    # Red blood cells: dark (low in oxygen) coming in, bright red (full of oxygen) going out.
    cells = ''
    for deg in (142, 124, 106, 88, 70, 52, 36):
        x, y = on_circle(CR, deg)
        col = '#A33245' if deg > 95 else RED
        cells += f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="6.5" ry="4.2" transform="rotate({deg - 90} {f(x)} {f(y)})" fill="{col}" stroke="#7A1E2E" stroke-width="1"/>'
    body += part(4, cells)
    art = f'M4 252C56 252 112 232 {f(a[0])} {f(a[1])}'
    body += part(5, vessel(art, BLUE, 14) + flow(art, '#FFFFFF', 2.6))
    ven = f'M{f(b[0])} {f(b[1])}C{f(b[0] + 52)} {f(b[1] + 45)} 404 252 476 252'
    body += part(6, vessel(ven, RED, 14) + flow(ven, '#FFFFFF', 2.6) + flow(cap, '#9B4A8C', 2.6))
    # Gases diffuse across: oxygen from the air into the blood, carbon dioxide from the blood into the air.
    body += part(7, arrow(206, 172, 208, 236, O2C, 5))
    body += part(8, arrow(256, 236, 254, 172, CO2C, 5))
    # A macrophage on the inside of the wall eats any microbes that get this far.
    mx, my = on_circle(AR - 16, -42)
    mac = (f'<path d="M{f(mx - 12)} {f(my)}C{f(mx - 14)} {f(my - 9)} {f(mx - 4)} {f(my - 13)} {f(mx + 2)} {f(my - 10)}C{f(mx + 10)} {f(my - 15)} {f(mx + 16)} {f(my - 5)} {f(mx + 12)} {f(my + 2)}'
           f'C{f(mx + 16)} {f(my + 9)} {f(mx + 6)} {f(my + 14)} {f(mx)} {f(my + 10)}C{f(mx - 8)} {f(my + 14)} {f(mx - 15)} {f(my + 7)} {f(mx - 12)} {f(my)}Z" fill="#D9C3EC" stroke="#7E5BA3" stroke-width="1.8"/>'
           f'<circle cx="{f(mx + 1)}" cy="{f(my)}" r="4.2" fill="#7E5BA3"/>')
    body += part(9, mac)
    labels = [
        {'text': 'Bronchiole', 'keys': [['bronchiole']]},
        {'text': 'Alveolus (air space)', 'keys': [['alveol'], ['air', 'sac']]},
        {'text': 'Thin, moist wall (one cell thick)', 'keys': [['moist'], ['thin', 'wall'], ['one', 'cell']]},
        {'text': 'Capillary', 'keys': [['capillar']]},
        {'text': 'Red blood cell', 'keys': [['red', 'cell'], ['red', 'blood'], ['erythrocyte'], ['rbc']]},
        {'text': 'Blood from the pulmonary artery', 'keys': [['pulmonary', 'artery'], ['arteriole'], ['deoxygenat']]},
        {'text': 'Blood to the pulmonary vein', 'keys': [['pulmonary', 'vein'], ['venule'], ['oxygenat']]},
        {'text': 'Oxygen diffuses into the blood', 'keys': [['oxygen'], ['o2']]},
        {'text': 'Carbon dioxide diffuses into the alveolus', 'keys': [['carbon', 'dioxide'], ['co2']]},
        {'text': 'Macrophage', 'keys': [['macrophage'], ['phagocyt'], ['white']]},
    ]
    w = on_circle(AR, -8)
    rbc = on_circle(CR, 52)
    cp = on_circle(CR, 118)
    feat = {'bronchiole': (66, 26), 'alveolus': (198, 116), 'wall': (round(w[0] - 1, 1), round(w[1], 1)), 'capillary': (round(cp[0], 1), round(cp[1] + 6, 1)),
            'rbc': (round(rbc[0], 1), round(rbc[1], 1)), 'arteriole': (60, 248), 'venule': (420, 252), 'o2': (207, 196), 'co2': (255, 204),
            'macrophage': (round(mx + 8, 1), round(my - 6, 1))}
    body += label(0, 'BRONCHIOLE', 'top', 60, 62, *feat['bronchiole'])
    body += label(1, 'ALVEOLUS', 'end', 136, 108, *feat['alveolus'])
    body += label(2, 'THIN MOIST WALL', 'start', 330, 116, *feat['wall'])
    body += label(3, 'CAPILLARY', 'top', 176, 296, *feat['capillary'])
    body += label(4, 'RED BLOOD CELL', 'top', 300, 296, *feat['rbc'])
    body += label(5, 'FROM PULMONARY ARTERY', 'top', 104, 270, *feat['arteriole'])
    body += label(6, 'TO PULMONARY VEIN', 'top', 392, 270, *feat['venule'])
    body += label(7, 'O2 INTO BLOOD', 'end', 136, 160, *feat['o2'])
    body += label(8, 'CO2 INTO ALVEOLUS', 'start', 322, 166, *feat['co2'])
    body += label(9, 'MACROPHAGE', 'start', 330, 62, *feat['macrophage'])
    anchors = {k: [float(v[0]), float(v[1])] for k, v in feat.items()}
    lumen = on_circle(CR, 90)
    # Exam letters sit outside their anchor (away from the middle), so these are placed to keep the letters apart.
    cl = on_circle(CR, 140)
    anchors.update({'moist': anchors['wall'], 'lumen': [round(lumen[0], 1), round(lumen[1], 1)], 'bloodFlow': [446.0, 252.0],
                    'macrophage': [round(mx, 1), round(my, 1)], 'capillary': [round(cl[0], 1), round(cl[1], 1)],
                    'o2': [206.0, 186.0], 'co2': [255.0, 186.0], 'alveolus': [246.0, 118.0]})
    parts = ['Alveolus', 'Bronchiole', 'Moist lining', 'Capillary', 'Red blood cells', 'Arteriole (from the pulmonary artery)',
             'Venule (to the pulmonary vein)', 'Oxygen arrow', 'Carbon dioxide arrow', 'Macrophage']
    return finish('alveolus', 'An alveolus and its capillary', 'an alveolus and its blood supply, with the directions the gases move',
                  'Draw the alveolus at the end of a bronchiole, with a thin, moist wall. Wrap a capillary close around it: blood in from the pulmonary artery, out to the pulmonary vein. Arrows: oxygen into the blood, carbon dioxide out of it.',
                  'An alveolus and its capillary', 'A bronchiole opens into an alveolus, an air sac with a wall one cell thick and lined with moisture. A capillary full of red blood cells wraps closely round it, carrying blood from the pulmonary artery to the pulmonary vein. Oxygen diffuses from the air in the alveolus into the blood; carbon dioxide diffuses from the blood into the alveolus. A macrophage sits on the inside of the wall.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- inhalation and exhalation
L, R = 120, 360   # the middles of the two chests: breathing in (left) and out (right)


def chest(cx, inhale):
    """The chest from the front: trachea, bronchi and lungs, breathing in or out."""
    top, bottom, base, k = (44, 196, 188, 0.86) if inhale else (52, 176, 160, 0.72)
    out = tube(f'M{cx} 24V{top + 16}', 10, CART, CART_D)
    for side in (-1, 1):
        out += f'<path d="{lung_path(side, cx, k, top, bottom, base)}" fill="{LUNG}" stroke="{LUNG_D}" stroke-width="2.2" stroke-linejoin="round"/>'
        out += tube(f'M{cx} {top + 14}C{cx + side * 8} {top + 24} {cx + side * 14} {top + 30} {cx + side * 22} {top + 40}', 6, CART, CART_D)
    return out


def ribs(cx, inhale):
    # Ribs curve round the chest; breathing in swings them up and out, breathing out lets them fall down and in.
    out = ''
    half, drop, y0 = (84, 8, 64) if inhale else (68, 22, 66)
    for y in range(y0, y0 + 5 * 26, 26):
        d = f'M{cx - half + 6} {y + drop}C{cx - half} {y - 8} {cx - 20} {y - 10} {cx} {y + 2}C{cx + 20} {y - 10} {cx + half} {y - 8} {cx + half - 6} {y + drop}'
        out += f'<path d="{d}" fill="none" stroke="{BONE_D}" stroke-width="5" stroke-linecap="round"/><path d="{d}" fill="none" stroke="{BONE}" stroke-width="2.6" stroke-linecap="round"/>'
    return out


def breathing_moves():
    body = f'<rect width="480" height="320" fill="{BG}"/><path d="M240 34V236" stroke="#B9D3E3" stroke-width="2" stroke-dasharray="6 6"/>'
    body += part(0, chest(L, True) + chest(R, False))
    body += part(1, ribs(L, True) + ribs(R, False))
    dl = diaphragm_path(L, 208, 192, 196, 90)
    dr = diaphragm_path(R, 200, 152, 162, 74)
    body += part(2, f'<path d="{dl}" fill="none" stroke="{MUSCLE_D}" stroke-width="9" stroke-linecap="round"/><path d="{dl}" fill="none" stroke="{MUSCLE}" stroke-width="5" stroke-linecap="round"/>'
                    f'<path d="{dr}" fill="none" stroke="{MUSCLE_D}" stroke-width="9" stroke-linecap="round"/><path d="{dr}" fill="none" stroke="{MUSCLE}" stroke-width="5" stroke-linecap="round"/>')
    ink = '#14243B'
    # Breathing in: air in, ribs up and out, diaphragm down. Breathing out: the reverse.
    body += part(3, arrow(L, 0, L, 24, ink, 4) + arrow(L + 70, 112, L + 96, 90, ink, 4) + arrow(L - 70, 112, L - 96, 90, ink, 4) + arrow(L, 206, L, 238, ink, 4))
    body += part(4, arrow(R, 24, R, 0, ink, 4) + arrow(R + 90, 86, R + 64, 110, ink, 4) + arrow(R - 90, 86, R - 64, 110, ink, 4) + arrow(R, 214, R, 176, ink, 4))
    labels = [
        {'text': 'Inhalation: air in', 'keys': [['inhal'], ['inspir'], ['breath', 'in']]},
        {'text': 'Rib cage moves up and out (intercostal muscles contract)', 'keys': [['up', 'out'], ['intercostal', 'contract']]},
        {'text': 'Diaphragm contracts, flattens and moves down', 'keys': [['diaphragm', 'down'], ['diaphragm', 'flat'], ['diaphragm', 'contract']]},
        {'text': 'Exhalation: air out', 'keys': [['exhal'], ['expir'], ['breath', 'out']]},
        {'text': 'Rib cage moves down and in (intercostal muscles relax)', 'keys': [['down', 'in'], ['intercostal', 'relax']]},
        {'text': 'Diaphragm relaxes and domes up', 'keys': [['diaphragm', 'up'], ['diaphragm', 'dome'], ['diaphragm', 'relax']]},
    ]
    body += label(0, 'INHALATION', 'end', L - 10, 14, L - 3, 12)
    body += label(1, 'RIBS UP AND OUT', 'start', 40, 258, L - 83, 101)
    body += label(2, 'DIAPHRAGM DOWN', 'end', L + 82, 290, L + 58, 202)
    body += label(3, 'EXHALATION', 'start', R + 10, 14, R + 3, 12)
    body += label(4, 'RIBS DOWN AND IN', 'end', R + 80, 258, R + 77, 98)
    body += label(5, 'DIAPHRAGM UP', 'start', R - 82, 290, R - 52, 178)
    anchors = {'inhale': [L, 130], 'exhale': [R, 130], 'airIn': [L - 2, 14], 'airOut': [R + 2, 14], 'ribsUp': [L - 83, 101], 'ribsDown': [R + 77, 98],
               'diaphragmDown': [L + 58, 202], 'diaphragmUp': [R - 52, 178], 'lungIn': [L - 40, 130], 'lungOut': [R - 30, 120]}
    anchors = {k: [float(v[0]), float(v[1])] for k, v in anchors.items()}
    parts = ['Trachea and lungs', 'Ribs', 'Diaphragm', 'Arrows: breathing in', 'Arrows: breathing out']
    return finish('breathingMoves', 'Breathing in and out', 'the movements of the chest in inhalation and exhalation',
                  'Two chests side by side. Breathing in: air in, the rib cage moves up and out, and the diaphragm flattens and moves down, so the lungs get bigger. Breathing out: air out, the rib cage moves down and in, and the diaphragm domes up.',
                  'Inhalation and exhalation', 'On the left, breathing in: air comes in, the intercostal muscles contract and swing the rib cage up and out, and the diaphragm contracts, flattens and moves down, so the chest and lungs get bigger. On the right, breathing out: the muscles relax, the rib cage moves down and in, the diaphragm domes up, and air is pushed out.',
                  body, labels, anchors, parts)


MAKERS = [breathing, alveolus, breathing_moves]


# Where each structure is on a base diagram: the words that name it, in the order they are checked.
ANCHOR_WORDS = {
    'breathing': [('nasal', ['nasal', 'nose']), ('epiglottis', ['epiglottis']), ('pharynx', ['pharynx', 'throat']), ('larynx', ['larynx', 'voice box']),
                  ('oesophagus', ['oesophagus', 'gullet']), ('bronchiole', ['bronchiole']), ('bronchus', ['bronch']), ('cartilage', ['cartilage', 'ring']),
                  ('trachea', ['trachea', 'windpipe']), ('alveoli', ['alveol', 'air sac']), ('intercostal', ['intercostal']), ('diaphragm', ['diaphragm']),
                  ('thorax', ['thora', 'chest cavity']), ('lung', ['lung']), ('rib', ['rib']), ('mouth', ['mouth'])],
    'alveolus': [('macrophage', ['macrophage']), ('bronchiole', ['bronchiole']), ('co2', ['carbon dioxide', 'co2']), ('o2', ['oxygen', 'o2']),
                 ('rbc', ['red blood', 'red cell', 'erythrocyte']), ('arteriole', ['arteriole', 'pulmonary artery']), ('venule', ['venule', 'pulmonary vein']),
                 ('bloodFlow', ['blood flow', 'direction']), ('capillary', ['capillar', 'lumen']), ('wall', ['wall', 'moist']),
                 ('alveolus', ['alveol', 'air space', 'air sac'])],
    'breathingMoves': [('inhale', ['inhal', 'breathing in']), ('exhale', ['exhal', 'breathing out'])],
}


def base_of(what):
    w = what.lower()
    if any(k in w for k in ('graph', 'axes', 'grid', 'trace', 'heart')):
        return None
    if any(k in w for k in ('head in section', 'nasal', 'breathing system', 'breathing tract')):
        return 'breathing'
    if 'alveol' in w:
        return 'alveolus'
    if any(k in w for k in ('rib cage', 'inhalation', 'exhalation')):
        return 'breathingMoves'
    return None


def spirometer():
    """S1-Q3d: volume of air in an athlete's lungs (0-5 L) over 40 seconds: at rest, exercising, then resting again."""
    pts, t, v = [], 0.0, 2.0
    while t < 15:                       # at rest: shallow breaths, 2.0 to 2.5 L, one every 4.5 s
        pts.append((t, v))
        t, v = t + 2.25, 4.5 - v
    t, v = 15.6, 3.5
    while t < 30:                       # exercising: deep, fast breaths, 1.1 to 3.5 L, one every 1.2 s
        pts.append((t, v))
        t, v = t + 0.6, 4.6 - v
    pts += [(31.0, 2.6), (32.4, 2.0)]   # recovering
    t, v = 34.65, 2.5
    while t <= 40:
        pts.append((t, v))
        t, v = t + 2.25, 4.5 - v
    return [[round(t * 2.5, 1), round(v * 20, 1)] for t, v in pts]


# Per-question corrections the general rules can't work out: given labels, graphs, and answer types.
OVERRIDES = {
    'dia': {
        '2026-Q3': {'base': 'breathing', 'marks': [{'t': 'Epiglottis', 'a': 'epiglottis', 'given': True}, {'t': 'Trachea', 'a': 'trachea', 'given': True}]},
        '2019-Q6': {'base': 'alveolus', 'marks': [{'t': 'Capillary', 'a': 'capillary', 'given': True}, {'t': 'Alveolus', 'a': 'alveolus', 'given': True},
                                                  {'t': 'Blood flow', 'a': 'bloodFlow', 'given': True}]},
        # The paper's own picture has no gas arrows: part (i) asks you to draw them, so ours (which has them) isn't shown.
        'S1-Q3a': {'note': 'A section through an alveolus: a large air space surrounded by a thin wall, an alveolar macrophage on the wall, '
                           'and a capillary below separated from the air space by a very thin barrier. A dashed arrow labelled H2O runs from '
                           'the capillary into the alveolus: water vapour moves out of the blood.'},
        'S1-Q3d': {'graphs': [{'title': 'Volume of air in the lungs of an athlete', 'x': 'Time (s)', 'y': 'Volume (L)',
                               'xt': [[0, '0'], [25, '10'], [50, '20'], [75, '30'], [100, '40']],
                               'yt': [[0, '0'], [20, '1'], [40, '2'], [60, '3'], [80, '4'], [100, '5']],
                               'series': [{'name': 'Volume', 'pts': spirometer()}]}]},
    },
    'tap': {},
    # Parts that say "on the diagram" but are drawn on the paper, or are a written answer.
    'kind': {'S1-Q3a(i)': 'draw', 'S1-Q3d(iii)': 'draw', '2026-Q3(d)(i)': 'draw', '2026-Q3(d)(ii)': 'draw', '2026-Q3(f)': 'text'},
    # Points whose scheme wording can't be keyed: the disorder is named by the student, and its cause, prevention
    # and treatment depend on which one, so those are ticked by the student.
    'points': {'2009-Q13c(iii)': {
        0: [{'w': [w], 'n': 1} for w in ('asthma', 'bronchit', 'emphysema', 'pneumonia', 'tubercul', 'copd')] +
           [{'w': ['lung', 'cancer'], 'n': 2}, {'w': ['cystic', 'fibrosis'], 'n': 2}],
        1: 'self', 2: 'self', 3: 'self'}},
}


# ---------------------------------------------------------------- Chain reaction pictures (400 x 300)
# Each builds up as the chain's steps go into place: ga.step(k) shows once steps 1 to k+1 are in place,
# ga.until(k) goes at that point, ga.badge(k) puts the step's number on the picture.
def c_lungs(cx, cy, rx, ry, gap):
    return ''.join(f'<ellipse cx="{cx + s * gap}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{LUNG}" stroke="{LUNG_D}" stroke-width="2.4"/>' for s in (-1, 1))


def c_airway(cx, top, fork, spread):
    d = f'M{cx} {top}V{fork}M{cx} {fork}L{cx - spread} {fork + 22}M{cx} {fork}L{cx + spread} {fork + 22}'
    return (f'<path d="{d}" fill="none" stroke="{CART_D}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{CART}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')


def c_ribs(cx, y0, half, droop, n=4, gap=26):
    out = ''
    for k in range(n):
        y = y0 + k * gap
        d = f'M{cx - half} {y + droop}Q{cx - half * 0.5} {y - 14} {cx} {y}Q{cx + half * 0.5} {y - 14} {cx + half} {y + droop}'
        out += f'<path d="{d}" fill="none" stroke="{BONE_D}" stroke-width="5" stroke-linecap="round"/><path d="{d}" fill="none" stroke="{BONE}" stroke-width="2.6" stroke-linecap="round"/>'
    return out


def c_diaphragm(cx, y_side, y_mid, half, color=MUSCLE):
    d = f'M{cx - half} {y_side}Q{cx - half * 0.5} {y_mid - (y_side - y_mid) * 0.6} {cx} {y_mid}Q{cx + half * 0.5} {y_mid - (y_side - y_mid) * 0.6} {cx + half} {y_side}'
    return f'<path d="{d}" fill="none" stroke="{MUSCLE_D}" stroke-width="10" stroke-linecap="round"/><path d="{d}" fill="none" stroke="{color}" stroke-width="6" stroke-linecap="round"/>'


def c_brain(x, y, medulla=None):
    out = (f'<path d="M{x - 34} {y + 6}C{x - 40} {y - 20} {x - 14} {y - 34} {x + 4} {y - 28}C{x + 26} {y - 36} {x + 44} {y - 14} {x + 36} {y + 8}'
           f'C{x + 34} {y + 22} {x + 10} {y + 24} {x - 2} {y + 18}C{x - 16} {y + 26} {x - 34} {y + 20} {x - 34} {y + 6}Z" fill="#F2B6C6" stroke="#B5546E" stroke-width="2.2"/>'
           f'<path d="M{x - 18} {y - 12}q8 6 0 14M{x + 2} {y - 22}q-6 10 4 16M{x + 20} {y - 14}q-8 8 2 16" fill="none" stroke="#B5546E" stroke-width="1.8" stroke-linecap="round"/>')
    stem = f'<path d="M{x + 4} {y + 16}Q{x + 8} {y + 32} {x + 4} {y + 44}" fill="none" stroke="#B5546E" stroke-width="9" stroke-linecap="round"/>'
    return stem + out if medulla is None else stem.replace('#B5546E', medulla) + out


def c_zigzag(points, color='#FFC42E'):
    d = 'M' + 'L'.join(f'{x} {y}' for x, y in points)
    return f'<path d="{d}" fill="none" stroke="#8A6400" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="{d}" fill="none" stroke="{color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'


def c_gauge(x, y, value):
    """A pressure gauge: value 0 (low) to 1 (high)."""
    a = math.radians(200 - value * 220)
    return (f'<circle cx="{x}" cy="{y}" r="24" fill="#FFFFFF" stroke="{INK}" stroke-width="2.4"/>'
            f'<path d="M{x - 17} {y + 9}A19 19 0 0 1 {x - 9} {y - 16}" fill="none" stroke="#5BC0EB" stroke-width="5"/>'
            f'<path d="M{x + 9} {y - 16}A19 19 0 0 1 {x + 17} {y + 9}" fill="none" stroke="#E5484D" stroke-width="5"/>'
            f'<path d="M{x} {y}L{f(x + 17 * math.cos(a))} {f(y - 17 * math.sin(a))}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
            f'<circle cx="{x}" cy="{y}" r="3.5" fill="{INK}"/>')


def c_dots(pts, color, r=5):
    return ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" stroke="{INK}" stroke-width="1.2"/>' for x, y in pts)


def chain_inhale():
    cx = 250
    b = f'<rect width="400" height="300" fill="{BG}"/>' + c_airway(cx, 46, 104, 26)
    b += ga.until(3, c_lungs(cx, 168, 40, 58, 46)) + ga.step(3, c_lungs(cx, 172, 50, 70, 54))
    b += ga.until(2, c_ribs(cx, 120, 98, 24)) + ga.step(2, c_ribs(cx, 112, 118, 6) + ga.arrow(cx + 118, 168, cx + 140, 146, INK, 4) + ga.arrow(cx - 118, 168, cx - 140, 146, INK, 4))
    b += ga.until(1, c_diaphragm(cx, 252, 214, 92)) + ga.step(1, c_diaphragm(cx, 256, 246, 110) + ga.arrow(cx, 262, cx, 290, INK, 4))
    b += c_brain(66, 62)
    b += ga.step(0, c_zigzag([(78, 104), (96, 130), (86, 152), (110, 178), (102, 200), (140, 230)]))
    b += ga.until(4, c_gauge(352, 52, 0.5)) + ga.step(4, c_gauge(352, 52, 0.08))
    b += ga.step(5, ga.arrow(cx, 0, cx, 38, '#3E9BD8', 5) + c_dots([(cx - 18, 14), (cx + 18, 24), (cx - 14, 34)], '#BFE6F7', 4))
    b += ga.badge(0, 44, 108) + ga.badge(1, 366, 262) + ga.badge(2, 120, 112) + ga.badge(3, 318, 128) + ga.badge(4, 352, 96) + ga.badge(5, 284, 22)
    return ga.svg('Breathing in (inhalation)', 'The brain sends impulses to the breathing muscles. The diaphragm contracts and flattens, the intercostal muscles pull the rib cage up and out, the chest gets bigger, the pressure inside falls and air rushes in.', b)


def chain_exhale():
    cx = 250
    b = f'<rect width="400" height="300" fill="{BG}"/>' + c_airway(cx, 46, 104, 26)
    b += ga.until(3, c_lungs(cx, 172, 50, 70, 54)) + ga.step(3, c_lungs(cx, 168, 40, 58, 46))
    b += ga.until(2, c_ribs(cx, 112, 118, 6)) + ga.step(2, c_ribs(cx, 120, 98, 24) + ga.arrow(cx + 140, 140, cx + 118, 164, INK, 4) + ga.arrow(cx - 140, 140, cx - 118, 164, INK, 4))
    b += ga.until(0, c_diaphragm(cx, 256, 246, 110))
    b += ga.step(0, c_diaphragm(cx, 256, 246, 110, '#E58A97'), ' data-until="1"')
    b += ga.step(1, c_diaphragm(cx, 252, 214, 92, '#E58A97') + ga.arrow(cx, 286, cx, 254, INK, 4))
    b += ga.step(0, ''.join(f'<path d="M{x} 274q6 -6 12 0t12 0" fill="none" stroke="{MUSCLE}" stroke-width="2.4" stroke-linecap="round"/>' for x in (150, 326)))
    b += ga.until(4, c_gauge(352, 52, 0.08)) + ga.step(4, c_gauge(352, 52, 0.92))
    b += ga.step(5, ga.arrow(cx, 38, cx, 0, '#3E9BD8', 5) + c_dots([(cx - 18, 10), (cx + 18, 20), (cx - 14, 30)], '#BFE6F7', 4))
    b += ga.badge(0, 132, 276) + ga.badge(1, 286, 230) + ga.badge(2, 120, 124) + ga.badge(3, 318, 128) + ga.badge(4, 352, 96) + ga.badge(5, 284, 22)
    return ga.svg('Breathing out (exhalation)', 'The diaphragm and intercostal muscles relax. The diaphragm domes back up and the rib cage falls down and in, the chest gets smaller, the pressure inside rises and air is pushed out.', b)


def chain_path():
    # The breathing-system diagram, small, with the air's route drawn in step by step.
    d = breathing()
    inner = re.sub(r'^<svg[^>]*>|</svg>$', '', d['plain'])
    inner = re.sub(r'<title>.*?</title><desc>.*?</desc>', '', inner)
    inner = re.sub(r'<rect width="480" height="320" fill="[^"]+"/>', '', inner, count=1)
    s, tx, ty = 0.86, -2, 6
    b = f'<rect width="400" height="300" fill="{BG}"/><g transform="translate({tx} {ty}) scale({s})">{inner}</g>'

    def P(x, y):
        return f(x * s + tx), f(y * s + ty)
    route = [[(143, 57), (186, 47), (226, 47)], [(230, 52), (230, 94)], [(229, 98), (210, 104), (206, 112)], [(206, 126), (206, 182)],
             [(206, 188), (230, 206)], [(236, 213), (252, 222), (270, 234)], [(272, 238), (280, 248)]]
    for k, pts in enumerate(route):
        d_ = 'M' + 'L'.join('%s %s' % P(x, y) for x, y in pts)
        body = (f'<path d="{d_}" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<path d="{d_}" fill="none" stroke="#3E9BD8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 7"/>')
        ex, ey = P(*pts[-1])
        body += f'<circle cx="{ex}" cy="{ey}" r="5" fill="#3E9BD8" stroke="#FFFFFF" stroke-width="2"/>'
        b += ga.step(k, body)
    spots = [(150, 30), (262, 70), (178, 112), (176, 164), (196, 214), (262, 170), (302, 250)]
    b += ''.join(ga.badge(k, *P(x, y)) for k, (x, y) in enumerate(spots))
    return ga.svg('The path of air', 'Air goes in through the nasal cavity, then the pharynx, the larynx and the trachea, into a bronchus, along the bronchioles and finally into the alveoli.', b)


def chain_exchange():
    cx, cy, r = 196, 112, 68
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    b += f'<path d="M30 0C60 30 110 40 {cx - 46} {cy - 46}" fill="none" stroke="{LUNG_D}" stroke-width="36"/><path d="M30 0C60 30 110 40 {cx - 46} {cy - 46}" fill="none" stroke="{AIR}" stroke-width="29"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{AIR}" stroke="{LUNG_D}" stroke-width="6"/><circle cx="{cx}" cy="{cy}" r="{r - 3}" fill="{AIR}" stroke="{LUNG}" stroke-width="3"/>'
    b += f'<path d="M{cx - 46} {cy - 46}l18 18" stroke="{AIR}" stroke-width="27"/>'
    cap = f'M0 {cy + r + 40}C80 {cy + r + 40} 120 {cy + r + 14} {cx} {cy + r + 14}C272 {cy + r + 14} 312 {cy + r + 40} 400 {cy + r + 40}'
    b += vessel(cap, '#9B4A8C', 30) + vessel(cap, '#F7E3EA', 23)
    cells = [(70, 226), (128, 206), (196, 196), (262, 206), (326, 226)]
    dark = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="13" ry="7" fill="#A33245" stroke="#7A1E2E" stroke-width="1.2"/>' for x, y in cells)
    bright = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="13" ry="7" fill="{RED}" stroke="#7A1E2E" stroke-width="1.2"/>' for x, y in cells)
    b += ga.until(3, dark) + ga.step(3, bright + c_dots([(x + 7, y - 4) for x, y in cells[1:4]], O2C, 3.6))
    # 1 Fresh air comes down the bronchiole.
    b += ga.step(0, ga.arrow(48, 8, 108, 52, '#3E9BD8', 5) + c_dots([(170, 84), (206, 70), (224, 100), (186, 118)], O2C, 5), ' data-until="2"')
    # 2 Oxygen dissolves in the moist lining.
    b += ga.step(1, f'<circle cx="{cx}" cy="{cy}" r="{r - 6}" fill="none" stroke="#5BC0EB" stroke-width="5"/>' + c_dots([(168, 166), (200, 172), (230, 164)], O2C, 4.6), ' data-until="2"')
    # 3 It diffuses across the thin wall into the capillary.
    b += ga.step(2, ga.arrow(184, 150, 184, 206, O2C, 6) + c_dots([(170, 84), (224, 100)], O2C, 5))
    # 5 Carbon dioxide diffuses the other way.
    b += ga.step(4, ga.arrow(232, 206, 232, 150, CO2C, 6) + c_dots([(214, 120), (244, 92)], CO2C, 5))
    # 6 And is breathed out.
    b += ga.step(5, ga.arrow(108, 52, 48, 8, '#3E9BD8', 5) + c_dots([(86, 40), (120, 56)], CO2C, 5))
    b += ga.badge(0, 132, 30) + ga.badge(1, 268, 136) + ga.badge(2, 158, 178) + ga.badge(3, 300, 236) + ga.badge(4, 258, 176) + ga.badge(5, 66, 52)
    return ga.svg('Gas exchange in an alveolus', 'Fresh air reaches the alveolus. Oxygen dissolves in the moist lining, diffuses across the thin wall into the capillary and joins haemoglobin in the red blood cells. Carbon dioxide diffuses the other way, into the alveolus, and is breathed out.', b)


def chain_control():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    # A blood vessel from the working muscles to the brain.
    ves = 'M20 214H300C330 214 344 196 344 170V104'
    b += vessel(ves, '#9B4A8C', 20) + vessel(ves, '#F7E3EA', 13)
    # The leg muscle (bottom left) and the chest (top left).
    b += (f'<path d="M40 262C40 238 64 228 92 230C120 232 140 244 140 262C140 280 118 290 92 290C64 290 40 284 40 262Z" fill="{MUSCLE}" stroke="{MUSCLE_D}" stroke-width="2.4"/>'
          f'<path d="M58 252Q92 244 124 254M56 266Q92 258 126 268M62 280Q92 272 120 280" fill="none" stroke="{MUSCLE_D}" stroke-width="1.6"/>')
    chest = c_airway(130, 14, 50, 18)
    b += ga.until(5, chest + c_lungs(130, 104, 28, 40, 32) + c_ribs(130, 76, 62, 14, 3, 24) + c_diaphragm(130, 160, 136, 64))
    b += ga.step(5, chest + c_lungs(130, 108, 34, 50, 38) + c_ribs(130, 70, 74, 4, 3, 28) + c_diaphragm(130, 166, 158, 76)
                 + ''.join(f'<path d="M{x} {y}q-10 10 0 20" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>' for x, y in ((40, 92), (30, 86))))
    b += ga.until(3, c_brain(338, 62)) + ga.step(3, c_brain(338, 62, '#E8551F'))
    # 1 Muscles respire faster.
    b += ga.step(0, ga.star(92, 258, 18, 8, 8, '#FFC42E') + ga.star(92, 258, 8, 4, 8, '#FFFFFF'))
    # 2 More carbon dioxide goes into the blood.
    b += ga.step(1, c_dots([(120, 214), (176, 214), (232, 214), (290, 214), (344, 150)], CO2C, 6) + ga.arrow(140, 236, 140, 222, CO2C, 4))
    # 3 The blood gets more acidic: a pH scale with its arrow at the acid end.
    scale = ''.join(f'<rect x="{214 + k * 18}" y="246" width="18" height="12" fill="{c}"/>' for k, c in enumerate(['#E5484D', '#F5A03C', '#FFC42E', '#83C468', '#3E9BD8']))
    b += ga.step(2, scale + f'<rect x="214" y="246" width="90" height="12" fill="none" stroke="{INK}" stroke-width="1.6"/>' + ga.arrow(250, 282, 226, 262, INK, 3.4))
    # 4 The medulla detects it: rings round the brainstem.
    b += ga.step(3, ''.join(f'<path d="M{342 + s * rr} {96}a{rr} {rr} 0 0 {1 if s > 0 else 0} 0 {12}" fill="none" stroke="#E8551F" stroke-width="2.4" stroke-linecap="round"/>' for rr in (12, 20) for s in (1, -1)))
    # 5 Impulses to the diaphragm and intercostal muscles.
    b += ga.step(4, c_zigzag([(330, 112), (300, 122), (280, 108), (250, 126), (222, 116), (196, 140)]) + c_zigzag([(300, 122), (280, 150), (240, 150), (212, 166)]))
    b += ga.badge(0, 60, 236) + ga.badge(1, 206, 194) + ga.badge(2, 318, 252) + ga.badge(3, 380, 104) + ga.badge(4, 268, 92) + ga.badge(5, 40, 128)
    return ga.svg('Carbon dioxide controls breathing', 'Working muscles respire faster and put more carbon dioxide into the blood, which becomes more acidic. The medulla oblongata in the brain detects this and sends impulses to the diaphragm and intercostal muscles, so breathing becomes faster and deeper.', b)


def CHAIN_ART():
    return {'Breathing in (inhalation)': chain_inhale(), 'Breathing out (exhalation)': chain_exhale(), 'The path of air': chain_path(),
            'Gas exchange in an alveolus': chain_exchange(), 'Carbon dioxide controls breathing': chain_control()}

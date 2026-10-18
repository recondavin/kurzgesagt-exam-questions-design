"""Builds bio/bio-diagrams.js: the Biology exam diagrams, in the Draw it format (480 x 320, flat, side-on).

Each diagram goes into window.ExamDrawDiagrams['bio-<chapter>'] so Draw it can use it, and into
window.BioArt[<id>] with:
  plain    the art with no labels (exam questions put their own letters on it),
  anchors  where each structure is, by name (exam-question letters and Build it pins go there),
  parts    the data-part groups in build order, named (Build it drags these into place).
Labels carry data-label, keys (words that count when you name it) and tag (the words on its pill).
Run: python3 tools/bio/build_bio_diagrams.py
"""
import json, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'draw_it'))
from build_diagrams import label, part, svg, arrow, INK  # noqa: E402

RED, RED_D, BLUE, BLUE_D, PURPLE = '#E5484D', '#B3262B', '#3E6FD8', '#24479E', '#7E5BA3'
TUBE, TUBE_L, TUBE_D = '#F7D27A', '#FCE9B8', '#A9822F'
BG = '#E3F5FC'


def tube(d, w=11, fill=TUBE, edge=TUBE_D):
    """A hollow-looking tube along a path: a dark edge with a lighter core."""
    return (f'<path d="{d}" fill="none" stroke="{edge}" stroke-width="{w + 3}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')


def vessel(d, color, w=6):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def flow(d, color='#FFFFFF', dur=2.4):
    """A dashed stroke moving along a path: blood or urine flowing."""
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="1.6" stroke-dasharray="4 10" stroke-linecap="round" opacity=".85">'
            f'<animate attributeName="stroke-dashoffset" values="0;-28" dur="{dur}s" repeatCount="indefinite"/></path>')


def finish(did, name, say, tip, title, desc, body, labels, anchors, parts):
    s = svg(title, desc, body)
    plain = re.sub(r'<g data-label="\d+">.*?</text></g>', '', s)
    for i, fx, fy, tag in re.findall(r'<g data-label="(\d+)"><path d="M([\d.]+) ([\d.]+)L.*?<text [^>]*>([^<]+)</text>', s):
        labels[int(i)]['at'] = [float(fx), float(fy)]
        labels[int(i)]['tag'] = tag
    assert all('at' in l for l in labels), did
    return {'id': did, 'name': name, 'say': say, 'tip': tip, 'labels': labels, 'svg': s, 'plain': plain, 'anchors': anchors, 'parts': parts}


# ---------------------------------------------------------------- Chapter 29: the urinary system
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


CHAPTERS = {
    29: ('The urinary system', [urinary, kidney, nephron]),
}


def main():
    draw, art = {}, {}
    for ch, (topic, makers) in CHAPTERS.items():
        ds = [m() for m in makers]
        draw['bio-%d' % ch] = {'subject': 'biology', 'topic': topic,
                               'diagrams': [{k: d[k] for k in ('id', 'name', 'say', 'tip', 'labels', 'svg')} for d in ds]}
        for d in ds:
            art[d['id']] = {'chapter': ch, 'name': d['name'], 'plain': d['plain'], 'anchors': d['anchors'], 'parts': d['parts'], 'labels': d['labels']}
    out = os.path.join(os.path.dirname(__file__), '..', '..', 'bio', 'bio-diagrams.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w') as f:
        f.write('// Generated by tools/bio/build_bio_diagrams.py: the Biology exam diagrams.\n')
        f.write('// Swap any svg for your own art: keep data-part (build order), data-label (label order) and the anchors.\n')
        f.write('window.ExamDrawDiagrams = window.ExamDrawDiagrams || {};\n')
        for k, v in draw.items():
            f.write('window.ExamDrawDiagrams[' + json.dumps(k) + '] = ' + json.dumps(v, ensure_ascii=False, indent=1) + ';\n')
        f.write('window.BioArt = ' + json.dumps(art, ensure_ascii=False, indent=1) + ';\n')
    print('wrote', os.path.normpath(out), sum(len(v['diagrams']) for v in draw.values()), 'diagrams')


if __name__ == '__main__':
    main()

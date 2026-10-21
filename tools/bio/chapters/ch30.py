"""Chapter 30, the digestive system: its diagrams and how its exam questions use them.

Diagrams (tools/bio/build_bio_diagrams.py builds them into bio/d30.js):
  MAKERS        one function per diagram to memorise, each returning finish(...) from bio_art.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is, from its description,
  ANCHOR_WORDS  the words that name each anchor on those diagrams (exam letters go to that anchor),
  OVERRIDES     per-question corrections: graphs, answer types, diagrams that belong to another chapter.
"""
import math, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from bio_art import label, part, tube, vessel, flow, finish, INK, RED, RED_D, BLUE, PURPLE, BG  # noqa: E402

CHAPTER = 30
TOPIC = 'The digestive system'

# The gut and its organs.
GUT, GUT_D, GUT_L = '#F4A99B', '#B5543A', '#FAD0C6'      # oesophagus, stomach, small intestine
COLON, COLON_D = '#D9826B', '#9C4A35'                      # large intestine, appendix, rectum
LIVER, LIVER_D = '#A8432F', '#6B2D2A'
GALL, GALL_D, BILE = '#7CC45A', '#3F7F2A', '#4FA83A'
PANC, PANC_D = '#F2C25C', '#A9822F'
SKIN, SKIN_D = '#F9E0CF', '#E2B79A'
LYMPH, LYMPH_D = '#FFF9E6', '#C9B27A'


def head_arrow(x, y, angle, color, size=7):
    """A small solid arrowhead at (x, y) pointing along angle (degrees): which way the blood flows."""
    a = math.radians(angle)
    bx, by = x - size * math.cos(a), y - size * math.sin(a)
    px, py = -math.sin(a) * size * .7, math.cos(a) * size * .7
    return f'<path class="bio-flow" d="M{x:.1f} {y:.1f}L{bx + px:.1f} {by + py:.1f}L{bx - px:.1f} {by - py:.1f}Z" fill="{color}"/>'


def haustra(points, w):
    """The pouches of the large intestine: short lines across the tube at each point (x, y, angle of the tube)."""
    out = ''
    for x, y, ang in points:
        a = math.radians(ang + 90)
        dx, dy = math.cos(a) * w / 2, math.sin(a) * w / 2
        out += f'<path d="M{x - dx:.1f} {y - dy:.1f}L{x + dx:.1f} {y + dy:.1f}" stroke="{COLON_D}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>'
    return out


# ---------------------------------------------------------------- the whole digestive system
def digestive():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # The body outline: head, neck and trunk, so the organs sit in the right places.
    outline = (f'<ellipse cx="240" cy="34" rx="25" ry="29" fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2"/>'
               f'<path d="M229 58H251V86H229Z" fill="{SKIN}"/>'
               f'<path d="M229 82H251C292 84 322 88 330 104L334 250C334 292 300 314 240 314C180 314 146 292 146 250L150 104C158 88 188 84 229 82Z" fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2"/>'
               f'<path d="M229 60V84M251 60V84" stroke="{SKIN_D}" stroke-width="2"/>')
    body += part(0, outline)
    # Mouth: the lips, and the tongue behind them.
    body += part(1, '<ellipse cx="240" cy="48" rx="10" ry="5" fill="#C2364A"/><path d="M231 48Q240 51 249 48" stroke="#7A1E3A" stroke-width="1.6" fill="none"/>')
    # Salivary glands, below the jaw on each side, with ducts to the mouth.
    sal = ''
    for cx, s in ((219, 1), (261, -1)):
        sal += f'<path d="M{cx + s * 4} {52}Q{cx + s * 10} {49} {240 - s * 9} {49}" stroke="{GUT_D}" stroke-width="1.4" fill="none"/>'
        for dx, dy in ((0, 0), (-5 * s, 5), (5 * s, 6), (0, 10)):
            sal += f'<circle cx="{cx + dx}" cy="{56 + dy}" r="4.6" fill="#E9A47F" stroke="{GUT_D}" stroke-width="1.3"/>'
    body += part(2, sal)
    # Oesophagus: down the neck and chest to the stomach.
    oes = 'M240 55V98C240 107 246 112 256 112'
    body += part(3, tube(oes, 7, GUT, GUT_D))
    # Liver: the big organ on the body's right (your left as you look), above the stomach and gall bladder.
    liver = (f'<path d="M158 108C164 94 212 90 262 98C270 100 270 108 263 113C246 124 222 134 196 140C178 144 162 142 157 132C154 124 155 114 158 108Z" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="2"/>'
             f'<path d="M214 104Q222 118 210 136" stroke="{LIVER_D}" stroke-width="1.4" fill="none" opacity=".6"/>')
    body += part(4, liver)
    # Stomach: a J-shaped bag on the body's left, from the oesophagus to the pylorus.
    stomach = (f'<path d="M256 106C266 92 296 88 310 100C324 114 322 140 308 152C294 164 272 166 258 160C252 157 248 154 244 150L248 142C256 146 266 147 273 142C282 135 281 121 270 114C266 112 262 112 258 114Z" fill="#EE8E86" stroke="{GUT_D}" stroke-width="2"/>'
               f'<path d="M282 108Q300 116 300 136M290 104Q310 116 306 140" stroke="#D96F67" stroke-width="1.3" fill="none"/>')
    body += part(5, stomach)
    # Gall bladder and bile duct, under the liver, draining into the duodenum.
    gall = (f'<path d="M204 134C198 140 199 152 207 155C215 158 221 150 219 140C218 134 212 131 204 134Z" fill="{GALL}" stroke="{GALL_D}" stroke-width="1.6"/>'
            f'<path d="M216 152Q224 162 226 170" stroke="{BILE}" stroke-width="2.6" fill="none" stroke-linecap="round"/>')
    body += part(6, gall)
    # Duodenum, the first part of the small intestine, curving round the pancreas.
    duo = 'M244 150C228 152 220 162 222 172C224 182 236 186 252 184'
    body += part(7, tube(duo, 8, GUT, GUT_D))
    # Pancreas: a long gland under the stomach, its head in the curve of the duodenum.
    panc = (f'<path d="M230 170C238 164 254 168 268 168C284 168 300 164 310 160C318 158 320 166 313 171C298 180 278 182 258 180C246 179 234 180 230 176Z" fill="{PANC}" stroke="{PANC_D}" stroke-width="1.6"/>'
            f'<path d="M248 170v8M262 170v9M276 169v9M290 167v8M302 164v7" stroke="{PANC_D}" stroke-width="1" opacity=".6"/>')
    body += part(8, panc)
    # Small intestine (ileum): long and coiled, filling the middle of the abdomen.
    ileum = ('M252 184C264 190 270 200 266 210C258 220 214 210 206 222C200 234 280 226 284 238'
             'C288 252 210 244 206 256C202 268 262 262 270 270C276 278 220 284 188 270')
    body += part(9, tube(ileum, 7, GUT, GUT_D))
    # Large intestine: the caecum and appendix, then the colon up, across and down.
    colon = 'M176 266V202C176 196 180 194 186 194H298C304 194 306 198 306 204V258C306 274 292 280 270 282'
    col = tube(colon, 15, COLON, COLON_D)
    col += f'<circle cx="176" cy="268" r="11" fill="{COLON}" stroke="{COLON_D}" stroke-width="1.6"/>'
    col += haustra([(176, y, 90) for y in (248, 232, 216)] + [(x, 194, 0) for x in (206, 226, 246, 266, 286)] + [(306, y, 90) for y in (218, 234, 250)], 15)
    col += tube('M170 278C166 288 160 292 158 300', 4.5, COLON, COLON_D)
    body += part(10, col)
    # Rectum, then the anus with its ring of muscle.
    body += part(11, tube('M270 282C252 284 242 288 241 296V304', 12, COLON, COLON_D) + '<rect x="230" y="304" width="22" height="6" rx="3" fill="#5B3172"/>')
    labels = [
        {'text': 'Mouth', 'keys': [['mouth']]},
        {'text': 'Salivary gland', 'keys': [['saliva']]},
        {'text': 'Oesophagus', 'keys': [['oesophag'], ['esophag'], ['gullet']]},
        {'text': 'Stomach', 'keys': [['stomach']]},
        {'text': 'Liver', 'keys': [['liver']]},
        {'text': 'Pancreas', 'keys': [['pancrea']]},
        {'text': 'Small intestine (ileum)', 'keys': [['small', 'intestin'], ['ileum']]},
        {'text': 'Large intestine (colon)', 'keys': [['large', 'intestin'], ['colon']]},
        {'text': 'Caecum', 'keys': [['caecum'], ['cecum']]},
        {'text': 'Appendix', 'keys': [['appendix']]},
        {'text': 'Rectum', 'keys': [['rectum']]},
        {'text': 'Anus', 'keys': [['anus']]},
    ]
    body += label(0, 'MOUTH', 'end', 200, 30, 231, 47)
    body += label(1, 'SALIVARY GLAND', 'end', 200, 70, 216, 60)
    body += label(2, 'OESOPHAGUS', 'start', 262, 66, 240, 76)
    body += label(3, 'STOMACH', 'start', 344, 108, 314, 120)
    body += label(4, 'LIVER', 'end', 136, 112, 168, 118)
    body += label(5, 'PANCREAS', 'start', 344, 150, 308, 166)
    body += label(6, 'SMALL INTESTINE', 'start', 336, 246, 280, 240)
    body += label(7, 'COLON', 'start', 344, 200, 306, 214)
    body += label(8, 'CAECUM', 'end', 136, 246, 166, 264)
    body += label(9, 'APPENDIX', 'end', 136, 290, 160, 296)
    body += label(10, 'RECTUM', 'start', 344, 290, 252, 292)
    body += label(11, 'ANUS', 'end', 214, 302, 232, 308)
    anchors = {'mouth': [240, 48], 'salivary': [218, 60], 'oesophagus': [244, 100], 'stomach': [300, 120], 'liver': [184, 118],
               'gallBladder': [210, 148], 'duodenum': [222, 176], 'pancreas': [290, 172], 'ileum': [226, 226], 'colon': [306, 226],
               'caecum': [176, 262], 'appendix': [160, 296], 'rectum': [254, 286], 'anus': [240, 310]}
    parts = ['Body outline', 'Mouth', 'Salivary glands', 'Oesophagus', 'Liver', 'Stomach', 'Gall bladder and bile duct', 'Duodenum', 'Pancreas',
             'Small intestine (ileum)', 'Large intestine, caecum and appendix', 'Rectum and anus']
    return finish('digestive', 'The human digestive system', 'the human digestive system',
                  'One continuous tube from mouth to anus: oesophagus, stomach, small intestine, then the large intestine framing it. Add the glands: salivary glands, liver (with the gall bladder) and pancreas.',
                  'The human digestive system', 'The alimentary canal runs from the mouth down the oesophagus to the stomach, then the small intestine (duodenum and the long, coiled ileum) and the large intestine (caecum with the appendix, colon and rectum) to the anus. The salivary glands, liver, gall bladder and pancreas pass their secretions into it.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- the duodenum and the organs that drain into it
def duodenum():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Stomach: the oesophagus enters at the top; it narrows to the pylorus at the duodenum.
    body += part(0, tube('M338 0V36', 16, GUT, GUT_D)
                 + f'<path d="M260 146C286 138 300 124 306 102C312 74 326 42 362 32C404 22 452 44 460 86C466 122 436 146 396 150C356 154 312 156 286 160L260 162Z" fill="#EE8E86" stroke="{GUT_D}" stroke-width="2.4"/>'
                 + '<path d="M354 52Q400 50 424 92M332 70Q380 72 400 112" stroke="#D96F67" stroke-width="1.6" fill="none"/>')
    # Duodenum: a C-shaped tube from the pylorus, curving round the head of the pancreas.
    duo = 'M258 154C228 156 204 164 194 184C184 204 184 236 196 254C208 272 236 278 266 274C292 270 310 260 326 246'
    body += part(1, tube(duo, 24, GUT, GUT_D) + f'<path d="{duo}" fill="none" stroke="{GUT_L}" stroke-width="6" stroke-linecap="round" opacity=".7"/>')
    # Pancreas: head in the curve of the duodenum, body and tail running to the right.
    panc = (f'<path d="M216 200C220 186 238 184 254 192C278 204 308 202 342 194C380 184 420 178 446 188C460 194 458 210 442 216C412 226 372 228 342 232C312 236 290 242 272 252C256 260 232 260 222 250C212 238 210 214 216 200Z" fill="{PANC}" stroke="{PANC_D}" stroke-width="2"/>'
            f'<path d="M262 206q6 10 0 20M300 210q6 10 0 20M338 206q6 10 0 18M376 196q6 10 0 20M414 190q6 10 0 20M236 222q6 10 0 18" stroke="{PANC_D}" stroke-width="1.2" fill="none" opacity=".55"/>')
    body += part(2, panc)
    # Liver: above, with the gall bladder tucked under it.
    body += part(3, f'<path d="M14 36C40 12 150 8 222 22C240 26 244 40 232 50C206 70 166 84 120 94C80 102 40 100 24 86C10 72 6 50 14 36Z" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="2.4"/>'
                    f'<path d="M120 18Q130 50 112 90" stroke="{LIVER_D}" stroke-width="1.6" fill="none" opacity=".55"/>')
    body += part(4, f'<path d="M126 100C114 112 114 136 128 146C142 156 160 146 162 130C164 116 156 104 146 98C138 94 130 96 126 100Z" fill="{GALL}" stroke="{GALL_D}" stroke-width="2"/>'
                    f'<path d="M134 114Q138 128 146 136" stroke="#A7DA8C" stroke-width="3" fill="none" stroke-linecap="round"/>')
    # Bile duct: from the liver and gall bladder down into the duodenum.
    bile = 'M176 84V118M150 100C160 108 170 116 176 120M176 120C180 150 196 172 204 196C208 208 208 218 208 226'
    body += part(5, vessel(bile, GALL_D, 7) + vessel(bile, BILE, 4) + flow('M176 120C180 150 196 172 204 196C208 208 208 218 208 226', '#E8F6DF', 2.6))
    # Pancreatic duct: along the pancreas, joining the bile duct where it enters the duodenum.
    pd = 'M440 200C400 202 360 212 320 216C290 220 260 224 236 226L208 227'
    body += part(6, vessel(pd, PANC_D, 5) + vessel(pd, '#FCE9B8', 2.6) + flow(pd, PANC_D, 3))
    labels = [
        {'text': 'Stomach', 'keys': [['stomach']]},
        {'text': 'Duodenum', 'keys': [['duoden']]},
        {'text': 'Pancreas', 'keys': [['pancrea']]},
        {'text': 'Liver', 'keys': [['liver']]},
        {'text': 'Gall bladder', 'keys': [['gall']]},
        {'text': 'Bile duct', 'keys': [['bile', 'duct'], ['bile']]},
        {'text': 'Pancreatic duct', 'keys': [['pancreatic', 'duct']]},
    ]
    body += label(0, 'STOMACH', 'bottom', 412, 178, 412, 130)
    body += label(1, 'DUODENUM', 'end', 160, 286, 184, 250)
    body += label(2, 'PANCREAS', 'top', 420, 244, 420, 214)
    body += label(3, 'LIVER', 'start', 34, 120, 60, 80)
    body += label(4, 'GALL BLADDER', 'top', 74, 188, 128, 140)
    body += label(5, 'BILE DUCT', 'start', 222, 108, 184, 140)
    body += label(6, 'PANCREATIC DUCT', 'top', 300, 288, 300, 219)
    anchors = {'stomach': [400, 90], 'oesophagus': [338, 18], 'pylorus': [262, 154], 'duodenum': [186, 236], 'pancreas': [400, 208], 'liver': [80, 56],
               'gallBladder': [140, 126], 'bileDuct': [188, 150], 'pancreaticDuct': [340, 214], 'ulcer': [300, 140]}
    parts = ['Stomach', 'Duodenum', 'Pancreas', 'Liver', 'Gall bladder', 'Bile duct', 'Pancreatic duct']
    return finish('duodenum', 'The duodenum, pancreas and bile duct', 'the duodenum with the liver, gall bladder and pancreas',
                  'The duodenum curves out of the stomach round the head of the pancreas. Bile comes down the bile duct from the liver and gall bladder, and joins the pancreatic duct just where it opens into the duodenum.',
                  'The duodenum, pancreas and bile duct', 'The stomach empties through the pylorus into the duodenum, a C-shaped tube. The pancreas lies in its curve; its duct runs along it and joins the bile duct, which brings bile from the liver and gall bladder, where they open into the duodenum.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- a villus, cut lengthways
def villus():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Part 0: the lining between villi (the base of the wall) and the neighbouring villi.
    base = f'<path d="M0 236H480V256H0Z" fill="#F3C7BE"/>'
    for x0, x1 in ((40, 132), (348, 440)):
        cx, r = (x0 + x1) / 2, (x1 - x0) / 2
        base += f'<path d="M{x0} 240V{150 + r}A{r} {r} 0 0 1 {x1} {150 + r}V240Z" fill="#F7C6A8" stroke="{GUT_D}" stroke-width="1.6"/>'
        base += f'<path d="M{x0 + 12} 240V{150 + r}A{r - 12} {r - 12} 0 0 1 {x1 - 12} {150 + r}V240Z" fill="#FBE3D2"/>'
    body += part(0, base)
    # Part 1: the muscle layers of the wall: circular (cut across, so dots) and longitudinal (lines).
    mus = '<path d="M0 256H480V284H0Z" fill="#C9505A"/><path d="M0 284H480V306H0Z" fill="#A63D48"/><path d="M0 306H480V320H0Z" fill="#E9A47F"/>'
    mus += ''.join(f'<ellipse cx="{x}" cy="{270 + (6 if (x // 20) % 2 else -4)}" rx="6" ry="3" fill="#E07A70"/>' for x in range(10, 480, 20))
    mus += '<path d="' + ''.join(f'M{x0} {y}H{x0 + 60}' for y in (291, 299) for x0 in range(5, 480, 80)) + '" stroke="#D3606A" stroke-width="2" stroke-linecap="round"/>'
    body += part(1, mus)
    # Part 2: the villus: a finger with a lining (epithelium) one cell thick.
    outer = 'M180 240V96A60 60 0 0 1 300 96V240Z'
    inner = 'M194 240V96A46 46 0 0 1 286 96V240Z'
    vil = f'<path d="{outer}" fill="#F7C6A8" stroke="{GUT_D}" stroke-width="2"/><path d="{inner}" fill="#FBE3D2" stroke="#E2A68A" stroke-width="1.2"/>'
    walls, nuclei = '', ''
    for y in range(104, 240, 14):
        walls += f'M180 {y}H194M286 {y}H300'
        nuclei += f'<ellipse cx="187" cy="{y + 7}" rx="2.4" ry="3.6" fill="#B5543A"/><ellipse cx="293" cy="{y + 7}" rx="2.4" ry="3.6" fill="#B5543A"/>'
    for k in range(0, 13):
        a = math.radians(180 + k * 15)
        walls += f'M{240 + 60 * math.cos(a):.1f} {96 + 60 * math.sin(a):.1f}L{240 + 46 * math.cos(a):.1f} {96 + 46 * math.sin(a):.1f}'
        if k < 12:
            b = math.radians(180 + k * 15 + 7.5)
            nuclei += f'<circle cx="{240 + 53 * math.cos(b):.1f}" cy="{96 + 53 * math.sin(b):.1f}" r="2.8" fill="#B5543A"/>'
    vil += f'<path d="{walls}" stroke="#D9906E" stroke-width="1.2"/>' + nuclei
    body += part(2, vil)
    # Part 3: microvilli: a brush border on the outside of every lining cell.
    mv = ''
    for y in range(100, 238, 4):
        mv += f'M180 {y}h-5M300 {y}h5'
    for k in range(0, 46):
        a = math.radians(180 + k * 4)
        mv += f'M{240 + 60 * math.cos(a):.1f} {96 + 60 * math.sin(a):.1f}L{240 + 66 * math.cos(a):.1f} {96 + 66 * math.sin(a):.1f}'
    body += part(3, f'<path d="{mv}" stroke="{GUT_D}" stroke-width="1.5" stroke-linecap="round"/>')
    # Part 4: the lacteal: a lymph vessel up the middle, for fats.
    body += part(4, f'<path d="M240 250H370" stroke="{LYMPH_D}" stroke-width="9" stroke-linecap="round"/><path d="M240 250H370" stroke="{LYMPH}" stroke-width="5" stroke-linecap="round"/>'
                    + f'<path d="M232 252V92A8 8 0 0 1 248 92V252Z" fill="{LYMPH}" stroke="{LYMPH_D}" stroke-width="2"/>'
                    + flow('M240 96V250H370', LYMPH_D, 3))
    # Part 5: the blood capillary network: in from an arteriole (red), out by a venule (blue).
    cap = (vessel('M110 246H192C200 246 206 240 206 230V104', RED, 5) + vessel('M206 104A34 34 0 0 1 274 104', PURPLE, 5)
           + vessel('M274 104V226C274 236 280 242 290 242H470', BLUE, 5))
    cap += ''.join(vessel(f'M206 {y}C220 {y - 8} 226 {y + 8} 240 {y}C254 {y - 8} 260 {y + 8} 274 {y}', '#B5507A', 2.4) for y in (128, 156, 184, 212))
    cap += flow('M110 246H192C200 246 206 240 206 230V104A34 34 0 0 1 274 104V226C274 236 280 242 290 242H470', '#FFFFFF', 3)
    body += part(5, cap)
    labels = [
        {'text': 'Villus', 'keys': [['villus'], ['villi']]},
        {'text': 'Epithelium (one cell thick)', 'keys': [['epitheli'], ['lining']]},
        {'text': 'Microvilli', 'keys': [['microvill']]},
        {'text': 'Blood capillary network', 'keys': [['capillar'], ['blood']]},
        {'text': 'Lacteal', 'keys': [['lacteal']]},
        {'text': 'Muscle layers', 'keys': [['muscle']]},
    ]
    body += label(0, 'VILLUS', 'end', 150, 34, 204, 48)
    body += label(1, 'EPITHELIUM', 'end', 150, 92, 186, 130)
    body += label(2, 'MICROVILLI', 'start', 330, 40, 290, 52)
    body += label(3, 'CAPILLARIES', 'start', 330, 92, 274, 160)
    body += label(4, 'LACTEAL', 'end', 150, 130, 236, 180)
    body += label(5, 'MUSCLE LAYERS', 'start', 326, 296, 306, 272)
    anchors = {'villus': [240, 36], 'epithelium': [187, 150], 'microvilli': [296, 60], 'capillaries': [274, 160], 'lacteal': [240, 200],
               'muscle': [100, 280], 'lumen': [160, 196], 'arteriole': [150, 246], 'venule': [330, 242]}
    parts = ['Lining and neighbouring villi', 'Muscle layers', 'Villus and its epithelium', 'Microvilli', 'Lacteal', 'Blood capillaries']
    return finish('villus', 'A villus', 'a villus (L.S.) from the small intestine',
                  'A finger-shaped villus with a lining one cell thick and microvilli on it. Inside: a lacteal up the middle and a network of blood capillaries round it. The muscle layers of the wall are underneath.',
                  'A villus', 'A villus is a finger-like fold of the small intestine wall. Its lining (epithelium) is one cell thick, with microvilli on the outside. Inside, a lacteal (lymph vessel) runs up the middle and a network of blood capillaries surrounds it. The circular and longitudinal muscle layers of the wall are underneath.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- the liver's blood supply
def liver_blood():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # Part 0: the vena cava (back to the heart) and the aorta (from the heart).
    body += part(0, vessel('M44 320V0', BLUE, 16) + flow('M44 320V0', '#FFFFFF', 3) + head_arrow(44, 136, -90, '#FFFFFF', 7)
                 + vessel('M444 0V320', RED, 16) + flow('M444 0V320', '#FFFFFF', 3) + head_arrow(444, 200, 90, '#FFFFFF', 7))
    # Part 1: the liver.
    body += part(1, f'<path d="M146 56C158 36 220 30 290 32C334 34 360 44 360 64C360 92 324 112 280 120C244 127 200 128 168 120C144 114 134 96 136 78C137 68 140 62 146 56Z" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="2.4"/>'
                    f'<path d="M238 34Q250 76 234 124" stroke="{LIVER_D}" stroke-width="1.8" fill="none" opacity=".55"/>')
    # Part 2: the small intestine, coiled.
    gut = 'M136 206C160 198 320 198 336 210C350 222 306 230 236 230C166 230 128 232 132 246C136 260 310 254 330 262C342 268 326 276 296 276'
    body += part(2, tube(gut, 16, GUT, GUT_D) + f'<path d="{gut}" stroke="{GUT_L}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>')
    # Part 3: the hepatic portal vein: veins from the intestine join and carry digested food to the liver.
    hpv = 'M240 196V122'
    trib = 'M166 204C188 186 224 190 240 182M314 204C292 186 256 190 240 182M240 230V196'
    body += part(3, vessel(trib, PURPLE, 6) + vessel(hpv, PURPLE, 11) + flow(hpv, '#FFFFFF', 2.6) + head_arrow(240, 136, -90, '#FFFFFF', 7))
    # Part 4: the hepatic artery: oxygenated blood from the aorta into the liver.
    ha = 'M436 86H392C380 86 370 84 356 80'
    body += part(4, vessel(ha, RED, 7) + flow(ha, '#FFFFFF', 2.4) + head_arrow(380, 86, 180, RED_D, 8))
    # Part 5: the hepatic vein: blood out of the liver to the vena cava.
    hv = 'M138 64H52'
    body += part(5, vessel(hv, BLUE, 8) + flow(hv, '#FFFFFF', 2.4) + head_arrow(70, 64, 180, '#FFFFFF', 7))
    labels = [
        {'text': 'Vena cava', 'keys': [['vena', 'cava']]},
        {'text': 'Aorta', 'keys': [['aorta']]},
        {'text': 'Liver', 'keys': [['liver']]},
        {'text': 'Small intestine', 'keys': [['intestin'], ['ileum'], ['gut']]},
        {'text': 'Hepatic portal vein', 'keys': [['portal']]},
        {'text': 'Hepatic artery', 'keys': [['hepatic', 'arter']]},
        {'text': 'Hepatic vein', 'keys': [['hepatic', 'vein']]},
    ]
    body += label(0, 'VENA CAVA', 'start', 64, 170, 50, 170)
    body += label(1, 'AORTA', 'end', 424, 300, 438, 300)
    body += label(2, 'LIVER', 'bottom', 250, 26, 250, 56)
    body += label(3, 'SMALL INTESTINE', 'top', 200, 292, 200, 274)
    body += label(4, 'HEPATIC PORTAL VEIN', 'start', 254, 166, 242, 166)
    body += label(5, 'HEPATIC ARTERY', 'bottom', 400, 26, 400, 86)
    body += label(6, 'HEPATIC VEIN', 'bottom', 110, 26, 96, 64)
    anchors = {'venaCava': [44, 220], 'aorta': [444, 240], 'liver': [250, 76], 'intestine': [236, 230], 'portal': [240, 150],
               'hepaticArtery': [372, 82], 'hepaticVein': [96, 64]}
    parts = ['Vena cava and aorta', 'Liver', 'Small intestine', 'Hepatic portal vein', 'Hepatic artery', 'Hepatic vein']
    return finish('liver', "The liver's blood supply", "the liver's blood supply and the hepatic portal vein",
                  'Blood comes into the liver two ways: the hepatic artery (oxygen, from the aorta) and the hepatic portal vein (digested food, from the intestine). It all leaves by the hepatic vein to the vena cava.',
                  "The liver's blood supply", 'The hepatic portal vein carries blood rich in digested food from the small intestine to the liver. The hepatic artery brings oxygenated blood from the aorta. The hepatic vein carries blood from the liver to the vena cava.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- the adult teeth: the upper jaw from below
ENAMEL, ENAMEL_D, GROOVE = '#FDF7E8', '#B8AE96', '#D6CDB4'


def tooth(kind):
    """One tooth seen from below (biting surface), centred on 0 0; x runs along the jaw, -y is the lip or cheek side."""
    st = f'fill="{ENAMEL}" stroke="{ENAMEL_D}" stroke-width="2" stroke-linejoin="round"'
    if kind == 'incisor':    # chisel-shaped: thin, with a straight cutting edge
        return f'<rect x="-10" y="-6" width="20" height="12" rx="3" {st}/><path d="M-7 -1H7" stroke="{GROOVE}" stroke-width="1.6"/>'
    if kind == 'canine':     # one long point
        return f'<path d="M-11 4C-11 -6 -3 -13 0 -14C3 -13 11 -6 11 4C11 11 -11 11 -11 4Z" {st}/><circle cx="0" cy="-3" r="2" fill="{GROOVE}"/>'
    if kind == 'premolar':   # two cusps
        return f'<rect x="-12" y="-13" width="24" height="26" rx="9" {st}/><path d="M-8 0H8" stroke="{GROOVE}" stroke-width="1.8"/>'
    return f'<rect x="-16" y="-16" width="32" height="32" rx="10" {st}/><path d="M-11 0H11M0 -11V11" stroke="{GROOVE}" stroke-width="1.8"/>'


TEETH = [('incisor', 20), ('incisor', 20), ('canine', 22), ('premolar', 24), ('premolar', 24), ('molar', 32), ('molar', 32), ('molar', 32)]


def jaw_spots():
    """Where each tooth goes along the arch (an ellipse), front first: (kind, x, y, angle) on the right-hand side."""
    cx, cy, rx, ry = 240, 300, 110, 240
    walk, s, prev, th = [], 0.0, None, 90.0
    while th > 0:
        t = math.radians(th)
        x, y = cx + rx * math.cos(t), cy - ry * math.sin(t)
        if prev:
            s += math.hypot(x - prev[0], y - prev[1])
        walk.append((s, x, y, math.degrees(math.atan2(ry * math.cos(t), rx * math.sin(t)))))
        prev, th = (x, y), th - 0.1
    out, at = [], 4
    for kind, w in TEETH:
        p = min(walk, key=lambda q: abs(q[0] - (at + w / 2)))
        out.append((kind, round(p[1], 1), round(p[2], 1), round(p[3], 1)))
        at += w + 4
    return out


def teeth():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    arch = 'M130 300A110 240 0 0 1 350 300'
    gums = (f'<path d="{arch}" fill="none" stroke="#D9826B" stroke-width="54"/><path d="{arch}" fill="none" stroke="#F2A39A" stroke-width="48"/>'
            '<path d="M154 300A86 214 0 0 1 326 300Z" fill="#F7C9C0"/>'
            '<path d="M240 110V296M214 140Q240 150 266 140M206 170Q240 182 274 170M202 200Q240 214 278 200" stroke="#EBA89C" stroke-width="2" fill="none"/>')
    # The dental formula, written the usual way: teeth in one half of the upper jaw over the lower jaw.
    form = '<g font-family="Fredoka, Nunito, sans-serif" font-weight="700" fill="#14243B" text-anchor="middle">'
    form += '<text x="70" y="30" font-family="Nunito, sans-serif" font-weight="800" font-size="12" fill="#26395A">DENTAL FORMULA</text>'
    for k, (t, n) in enumerate((('I', 2), ('C', 1), ('PM', 2), ('M', 3))):
        x = 28 + k * 28
        form += f'<text x="{x}" y="56" font-size="15">{t}</text><text x="{x}" y="78" font-size="15">{n}</text><text x="{x}" y="102" font-size="15">{n}</text>'
        form += f'<path d="M{x - 9} 84H{x + 9}" stroke="#14243B" stroke-width="2"/>'
    form += '<text x="70" y="126" font-family="Nunito, sans-serif" font-weight="800" font-size="11.5" fill="#26395A">x 2 sides = 32 teeth</text></g>'
    body += part(0, gums + form)
    spots = jaw_spots()
    for k, kind in enumerate(('incisor', 'canine', 'premolar', 'molar')):
        g = ''
        for kd, x, y, ang in spots:
            if kd != kind:
                continue
            for xx, aa in ((x, ang), (480 - x, -ang)):
                g += f'<g transform="translate({xx:.1f} {y}) rotate({aa})">{tooth(kind)}</g>'
        body += part(1 + k, g)
    labels = [
        {'text': 'Incisors (cut)', 'keys': [['incisor']]},
        {'text': 'Canine (tears)', 'keys': [['canine']]},
        {'text': 'Premolars (grind)', 'keys': [['premolar']]},
        {'text': 'Molars (grind and crush)', 'keys': [['molar']]},
    ]
    sp = {}
    for kd, x, y, ang in spots:
        sp.setdefault(kd, []).append((x, y))
    body += label(0, 'INCISORS', 'start', 300, 36, sp['incisor'][1][0], sp['incisor'][1][1] - 2)
    body += label(1, 'CANINE', 'start', 372, 84, sp['canine'][0][0] + 8, sp['canine'][0][1])
    body += label(2, 'PREMOLARS', 'start', 372, 126, sp['premolar'][1][0] + 8, sp['premolar'][1][1] - 6)
    body += label(3, 'MOLARS', 'start', 380, 202, sp['molar'][1][0] + 12, sp['molar'][1][1])

    def r(p, mirror=False):
        return [480 - round(p[0]) if mirror else round(p[0]), round(p[1])]
    anchors = {'incisors': r(sp['incisor'][0]), 'canine': r(sp['canine'][0]), 'premolars': r(sp['premolar'][1]), 'molars': r(sp['molar'][1]),
               'incisorsL': r(sp['incisor'][0], True), 'canineL': r(sp['canine'][0], True), 'premolarsL': r(sp['premolar'][1], True),
               'molarsL': r(sp['molar'][1], True), 'palate': [240, 250]}
    parts = ['Gums and the dental formula', 'Incisors', 'Canines', 'Premolars', 'Molars']
    return finish('teeth', 'The adult teeth', 'the adult human teeth (the upper jaw seen from below)',
                  'From the front of each side of the jaw: 2 incisors (cut), 1 canine (tears), 2 premolars and 3 molars (grind). The dental formula is I 2/2, C 1/1, PM 2/2, M 3/3: 32 teeth.',
                  'The adult teeth', 'The upper jaw seen from below. From the front of each side: two chisel-shaped incisors, one pointed canine, two premolars with two cusps and three wide molars with four cusps. The dental formula is I 2/2, C 1/1, PM 2/2, M 3/3, so an adult has 32 teeth.',
                  body, labels, anchors, parts)


MAKERS = [digestive, duodenum, villus, liver_blood, teeth]


# Where each structure is on a base diagram: the words that name it, in the order they are checked.
ANCHOR_WORDS = {
    'digestive': [('oesophagus', ['oesophag', 'gullet']), ('stomach', ['stomach']), ('liver', ['liver']), ('gallBladder', ['gall']),
                  ('pancreas', ['pancrea']), ('duodenum', ['duoden']), ('rectum', ['rectum']), ('appendix', ['appendix']), ('caecum', ['caecum']),
                  ('colon', ['large intestine', 'colon']), ('ileum', ['small intestine', 'ileum']), ('anus', ['anus']), ('mouth', ['mouth']),
                  ('salivary', ['saliva'])],
    'duodenum': [('pancreaticDuct', ['pancreatic duct']), ('bileDuct', ['bile duct']), ('gallBladder', ['gall']), ('duodenum', ['duoden', 'c-shaped']),
                 ('pancreas', ['pancrea']), ('liver', ['liver']), ('ulcer', ['ulcer']), ('pylorus', ['pylor', 'sphincter']), ('stomach', ['stomach']),
                 ('oesophagus', ['oesophag'])],
    'villus': [('lacteal', ['lacteal', 'lymph']), ('microvilli', ['microvill']), ('epithelium', ['epitheli', 'lining']), ('capillaries', ['capillar', 'blood']),
               ('muscle', ['muscle']), ('villus', ['villus', 'villi'])],
    'liver': [('portal', ['portal']), ('hepaticArtery', ['hepatic artery']), ('hepaticVein', ['hepatic vein']), ('liver', ['liver']),
              ('intestine', ['intestine', 'gut']), ('aorta', ['aorta']), ('venaCava', ['vena cava'])],
    'teeth': [('incisors', ['incisor']), ('canine', ['canine']), ('premolars', ['premolar']), ('molars', ['molar'])],
}


def base_of(what):
    w = what.lower()
    if 'graph' in w or 'double circulation' in w or 'photograph' in w:
        return None
    if 'villus' in w or 'villi' in w:
        return 'villus'
    if 'hepatic' in w:
        return 'liver'
    if 'gall bladder' in w or 'bile duct' in w or 'ulcer' in w:
        return 'duodenum'
    if 'digestive system' in w or 'alimentary canal' in w:
        return 'digestive'
    return None


# Per-question corrections the general rules can't work out: the graphs (x and y from 0 to 100), and a circulation
# diagram that mentions the gut and kidneys but is not one of this chapter's diagrams.
OVERRIDES = {
    'dia': {
        '2006-Q3': {'graphs': [{'title': 'A carbohydrate-digesting enzyme', 'x': 'pH', 'y': 'Rate of reaction',
                                'series': [{'pts': [[30, 3], [48, 14], [58, 56], [66, 92], [74, 56], [84, 14], [100, 3]]}],
                                'marks': [{'t': 'A', 'at': [66, 100]}]}]},
        '2022-Q6': {'graphs': [{'title': 'Lipid digestion', 'x': 'Time', 'y': 'Mass of lipid digested', 'key': 'left',
                                'series': [{'name': 'Lipase and bile salts', 'pts': [[0, 0], [12, 44], [26, 76], [42, 90], [62, 94], [100, 95]]},
                                           {'name': 'Lipase', 'pts': [[0, 0], [25, 24], [50, 50], [75, 76], [100, 94]]}]}]},
        '2024-Q17a': {'graphs': [{'title': 'Two digestive enzymes', 'x': 'pH', 'y': 'Enzyme activity',
                                  'xt': [[k * 10, str(k)] for k in range(11)],
                                  'series': [{'pts': [[8, 2], [14, 40], [20, 94], [26, 40], [32, 2]]}, {'pts': [[58, 2], [64, 40], [70, 94], [76, 40], [82, 2]]}],
                                  'marks': [{'t': 'A', 'at': [28, 72]}, {'t': 'B', 'at': [78, 72]}]}]},
        '2025-Q17a': {'base': 'circulation', 'marks': []},  # chapter 31's double circulation (no letters on the paper)
        '2015-Q11c': {'fig': [{'img': 'assets/bio/papers/2015-p10.webp', 'box': [32.6, 58.5, 45.3, 17.6]}]},  # the photo of the teeth
    },
    # A villus to draw on paper: the student ticks the scheme's points. The arrows go on the diagram (see ch28.py).
    'kind': {'2006-Q5(b)': 'arrows', '2025-Q6(e)': 'draw'},
    'arrows': {
        '2006-Q5(b)': {'max': 3, 'zones': {'liver': [[140, 32, 220, 92]], 'portal': [[225, 118, 30, 82]], 'artery': [[352, 68, 90, 30]],
                                           'vein': [[50, 52, 92, 24]]},
                       'rules': [{'on': 'portal', 'toward': 'liver', 'show': [240, 192, 240, 135]},
                                 {'on': 'artery', 'toward': 'liver', 'show': [432, 86, 372, 84]},
                                 {'on': 'vein', 'away': 'liver', 'show': [128, 64, 66, 64]}]},
    },
    # Parts that are one point each, where the scheme's mark rule was read as a count for the whole question.
    'n': {'2024-Q17a(i)': 1, '2006-Q1f(f)': 1},
    # Keys written by hand where the scheme's wording made keys too strict ("Transport food to the stomach", 3 words),
    # missed what the scheme accepts ([accept ...] lists, named examples) or let wrong answers in ("rais" alone for
    # neutralising bile, "living" alone for symbiosis). Each keeps the 1-3 words that carry the point.
    # Parts whose labels share a first word ("(ii) 1.", "(ii) 2.") use their full label as the id ('2015-Q11b(ii) 2.').
    'points': {
        # The liver's role: making bile, and what bile does (unofficial scheme).
        'S1-Q1a(ii)': {0: [{'w': ['make', 'bile'], 'n': 2}, {'w': ['secret', 'bile'], 'n': 2}],
                       1: [{'w': ['emulsif'], 'n': 1}, {'w': ['surface', 'area'], 'n': 2}, {'w': ['neutralis'], 'n': 1}] +
                          [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')]},
        'S1-Q6c(ii)': {0: [{'w': ['kill', x], 'n': 2} for x in ('bacteri', 'germ', 'pathogen', 'micro')] +
                          [{'w': ['pepsin'], 'n': 1}, {'w': ['denatur'], 'n': 1}, {'w': ['break', 'protein'], 'n': 2}]},
        # Diet and the circulatory system: a dietary factor with its effect (raised pressure, clogged arteries, heart
        # disease), so "salt lowers blood pressure" or "fat keeps arteries clear" earn nothing.
        '2026-Q17a(vi)': {0: [{'w': [f, e], 'n': 2} for f in ('salt', 'sodium', 'fat', 'fatty', 'saturat', 'cholesterol', 'sugar', 'junk', 'fried')
                              for e in ('clog', 'block', 'plaque', 'deposit', 'atheroma', 'atheroscl', 'narrow', 'harden', 'hypertens', 'stroke', 'coronary', 'thromb')] +
                             [{'w': [f, a, b], 'n': 3} for f in ('salt', 'sodium', 'fat', 'fatty', 'saturat', 'cholesterol', 'sugar', 'junk', 'fried')
                              for a, b in (('increase', 'pressure'), ('high', 'pressure'), ('heart', 'disease'), ('heart', 'attack'))]},
        '2009-Q13b(ii)': {0: [{'w': [f, e], 'n': 2} for f in ('salt', 'sodium', 'fat', 'fatty', 'saturat', 'cholesterol', 'sugar', 'junk', 'fried')
                              for e in ('clog', 'block', 'plaque', 'deposit', 'atheroma', 'atheroscl', 'narrow', 'harden', 'hypertens', 'stroke', 'coronary', 'thromb')] +
                             [{'w': [f, a, b], 'n': 3} for f in ('salt', 'sodium', 'fat', 'fatty', 'saturat', 'cholesterol', 'sugar', 'junk', 'fried')
                              for a, b in (('increase', 'pressure'), ('high', 'pressure'), ('heart', 'disease'), ('heart', 'attack'))]},
        # Hepatic portal vein: "portal vein" names it too (the 2006 scheme writes "(hepatic) portal vein").
        '2025-Q17a(i)': {0: [{'w': ['hepatic', 'port'], 'n': 2}, {'w': ['port', 'vein'], 'n': 2}]},
        '2023-Q17c(i)': {0: [{'w': ['hepatic', 'port'], 'n': 2}, {'w': ['port', 'vein'], 'n': 2}]},
        '2021-Q14b(iv)': {0: [{'w': ['hepatic', 'port'], 'n': 2}, {'w': ['port', 'vein'], 'n': 2}]},
        '2019-Q15b(viii)': {0: [{'w': ['hepatic', 'port'], 'n': 2}, {'w': ['port', 'vein'], 'n': 2}]},
        '2016-Q15a(ii)': {0: [{'w': ['hepatic', 'port'], 'n': 2}, {'w': ['port', 'vein'], 'n': 2}]},
        '2026-Q7c(c)': {0: [{'w': [x, 'liver'], 'n': 2} for x in ('under', 'below', 'beneath', 'behind')]},
        # Peristalsis described: muscle contractions (muscular = muscle in bio.js), or contractions of the wall.
        '2025-Q6(b)': {1: [{'w': ['muscle', x], 'n': 2} for x in ('contrac', 'squeez', 'push')] +
                          [{'w': ['contrac', x], 'n': 2} for x in ('wave', 'relax', 'wall')]},
        '2021-Q14b(vii)': {1: [{'w': ['muscle', x], 'n': 2} for x in ('contrac', 'squeez', 'push')] +
                              [{'w': ['contrac', x], 'n': 2} for x in ('wave', 'relax', 'wall')]},
        '2019-Q15b(iii)': {1: [{'w': ['muscle', x], 'n': 2} for x in ('contrac', 'squeez', 'push')] +
                              [{'w': ['contrac', x], 'n': 2} for x in ('wave', 'relax', 'wall')]},
        '2004-Q61': {0: [{'w': ['muscle', x], 'n': 2} for x in ('contrac', 'squeez', 'push', 'activit')] +
                        [{'w': ['contrac', x], 'n': 2} for x in ('wave', 'relax', 'wall', 'food')] +
                        [{'w': ['move', 'food'], 'n': 2}, {'w': ['push', 'food'], 'n': 2}]},  # [allow 'movement of food']
        '2025-Q6(c)': {0: [{'w': ['lower'], 'n': 1}, {'w': ['low'], 'n': 1}, {'w': ['decrease'], 'n': 1}, {'w': ['acid'], 'n': 1}]},
        '2024-Q17a(ii)': {1: [{'w': ['stomach', x], 'n': 2} for x in ('acid', 'low', 'lower', '2')] +
                             [{'w': ['acid', 'environ'], 'n': 2}, {'w': ['gastric', 'acid'], 'n': 2}]},
        '2024-Q3(b)': {0: [{'w': [v, x], 'n': 2} for v in ('transport', 'carry', 'move', 'push', 'pass', 'take', 'bring', 'convey', 'deliver')
                           for x in ('food', 'bolus', 'stomach')]},
        # The liver: any correct function ([accept stores vitamins / minerals / glycogen, plasma proteins, detoxifies]).
        '2024-Q3(c)': {0: [{'w': ['make', 'bile'], 'n': 2}, {'w': ['secret', 'bile'], 'n': 2}, {'w': ['glucose', 'glycogen'], 'n': 2},
                           {'w': ['detox'], 'n': 1}, {'w': ['toxin'], 'n': 1}, {'w': ['poison'], 'n': 1}, {'w': ['break', 'alcohol'], 'n': 2},
                           {'w': ['deamin'], 'n': 1}, {'w': ['amino', 'urea'], 'n': 2}, {'w': ['make', 'urea'], 'n': 2}, {'w': ['form', 'urea'], 'n': 2},
                           {'w': ['break', 'red'], 'n': 2}, {'w': ['destroy', 'red'], 'n': 2}, {'w': ['plasma', 'protein'], 'n': 2},
                           {'w': ['make', 'fibrinogen'], 'n': 2}, {'w': ['cholesterol', 'make'], 'n': 2}] +
                          [{'w': ['stor', x], 'n': 2} for x in ('vitamin', 'glycogen', 'mineral', 'iron', 'copper')] +
                          [{'w': ['heat', x], 'n': 2} for x in ('gener', 'make', 'releas')]},
        '2024-Q3(d)': {0: [{'w': ['pancreatic', 'juice'], 'n': 2}, {'w': ['enzyme'], 'n': 1}] +  # [accept named substance, named enzyme]
                          [{'w': [x], 'n': 1} for x in ('lipase', 'amylase', 'trypsin', 'trypsinog', 'protease', 'peptidase', 'nuclease',
                                                        'carbonat', 'bicarbonat', 'hydrogencarbonat', 'nahco3')]},
        # A structural feature of the small intestine ([accept villi, capillary network, thin walls, other correct]).
        '2024-Q3(e)': {0: [{'w': [x], 'n': 1} for x in ('long', 'length', 'villi', 'microvill', 'lacte', 'fold')] +
                          [{'w': [x, 'surface'], 'n': 2} for x in ('large', 'bigg', 'increase', 'great', 'maxim', 'more', 'vast')] +
                          [{'w': [x, y], 'n': 2} for x in ('rich', 'good', 'many', 'network', 'plenty', 'extensive', 'dense', 'large') for y in ('blood', 'capillar')] +
                          [{'w': ['one', 'cell', 'thick'], 'n': 3}, {'w': ['single', 'cell'], 'n': 2}, {'w': ['single', 'layer'], 'n': 2}] +
                          [{'w': ['thin', x], 'n': 2} for x in ('wall', 'lining', 'membrane', 'epitheli', 'layer')]},
        # Gut bacteria: making vitamins, and competing with (or inhibiting) pathogens.
        '2024-Q3(f)': {0: [{'w': ['vitamin', x], 'n': 2} for x in ('make', 'synthes', 'provid', 'source', 'secret', 'releas')],
                       1: [{'w': [c, x], 'n': 2} for c in ('compet', 'outcompet') for x in ('pathogen', 'harm', 'micro', 'bacteri', 'germ')] +
                          [{'w': [i, x], 'n': 2} for i in ('inhibit', 'prevent', 'stop', 'block') for x in ('pathogen', 'harm', 'germ')]},
        '2022-Q6(a)': {0: [{'w': ['bile', x], 'n': 2} for x in ('fast', 'speed', 'rate')] + [{'w': ['slow', 'alone'], 'n': 2}]},
        '2022-Q6(c)': {0: [{'w': [x], 'n': 1} for x in ('duodenum', 'jejunum', 'ileum', 'stomach')] + [{'w': ['small', 'intestine'], 'n': 2}]},
        # The pH for the site in (c): 7-9 for the small intestine, or 1-5 matched to the stomach.
        '2022-Q6(d)': {0: [{'w': [x], 'n': 1} for x in ('7', '8', '9')] + [{'w': ['stomach', x], 'n': 2} for x in ('1', '2', '3', '4', '5')]},
        '2022-Q6(e)': {0: [{'w': ['emulsif'], 'n': 1}, {'w': ['surface', 'area'], 'n': 2}] +
                          [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')]},
        # Digestion: breaking food (or its molecules) down.
        '2021-Q14a(i)': {0: [{'w': ['break', x], 'n': 2} for x in ('food', 'molecul', 'nutrient')]},
        '2019-Q15b(i)': {0: [{'w': ['break', x], 'n': 2} for x in ('food', 'molecul', 'nutrient')]},
        '2011-Q5(a)(i)': {0: [{'w': ['break', x], 'n': 2} for x in ('food', 'molecul', 'nutrient')]},
        # Why digest: solubility ([accept for absorption, for transport]). "Before absorption" is not a reason, so
        # absorbing needs a word that makes it the purpose.
        '2021-Q14a(ii)': {0: [{'w': ['solub'], 'n': 1}, {'w': ['dissolv'], 'n': 1}, {'w': ['transport'], 'n': 1}, {'w': ['carry', 'blood'], 'n': 2}] +
                             [{'w': ['absorb', x], 'n': 2} for x in ('can', 'small', 'allow', 'enable', 'blood', 'easi', 'able', 'cell')]},
        '2011-Q5(a)(ii)': {0: [{'w': ['solub'], 'n': 1}, {'w': ['dissolv'], 'n': 1}, {'w': ['transport'], 'n': 1}, {'w': ['carry', 'blood'], 'n': 2}] +
                              [{'w': ['absorb', x], 'n': 2} for x in ('can', 'small', 'allow', 'enable', 'blood', 'easi', 'able', 'cell')]},
        '2019-Q15b(ii)': {0: [{'w': ['solub'], 'n': 1}, {'w': ['dissolv'], 'n': 1}], 1: [{'w': ['absorb'], 'n': 1}],
                          2: [{'w': ['transport'], 'n': 1}, {'w': ['carry', 'blood'], 'n': 2}]},
        '2021-Q14b(i)': {0: [{'w': ['small', 'intestine'], 'n': 2}] + [{'w': [x], 'n': 1} for x in ('ileum', 'duodenum', 'jejunum')]},
        '2021-Q14b(ii)': {0: [{'w': ['surface', 'area'], 'n': 2}, {'w': ['absorb'], 'n': 1}]},  # [accept for absorption]
        '2021-Q14b(iii)': {1: [{'w': [v, x], 'n': 2} for v in ('absorb', 'take', 'carry', 'transport') for x in ('fat', 'fatty', 'lipid', 'glycerol')]},
        # The liver, other than storing nutrients ([accept bile, breaking down red blood cells, deamination, any valid]).
        '2021-Q14b(vi)': {0: [{'w': ['make', 'bile'], 'n': 2}, {'w': ['secret', 'bile'], 'n': 2},
                              {'w': ['detox'], 'n': 1}, {'w': ['toxin'], 'n': 1}, {'w': ['poison'], 'n': 1}, {'w': ['break', 'alcohol'], 'n': 2},
                              {'w': ['deamin'], 'n': 1}, {'w': ['amino', 'urea'], 'n': 2}, {'w': ['make', 'urea'], 'n': 2}, {'w': ['form', 'urea'], 'n': 2},
                              {'w': ['break', 'red'], 'n': 2}, {'w': ['destroy', 'red'], 'n': 2}, {'w': ['plasma', 'protein'], 'n': 2},
                              {'w': ['make', 'fibrinogen'], 'n': 2}, {'w': ['cholesterol', 'make'], 'n': 2}] +
                             [{'w': ['heat', x], 'n': 2} for x in ('gener', 'make', 'releas')]},
        '2020-Q13b(ii)': {0: [{'w': ['protein'], 'n': 1}, {'w': ['amino'], 'n': 1}]},
        '2019-Q15b(iv)': {0: [{'w': [x], 'n': 1} for x in ('protease', 'pepsin', 'trypsin', 'peptidase', 'rennin')]},
        # Must match (iv): the stomach for pepsin, the pancreas or small intestine for the others.
        '2019-Q15b(v)': {0: [{'w': [x], 'n': 1} for x in ('stomach', 'pancrea', 'duodenum', 'ileum')] + [{'w': ['small', 'intestine'], 'n': 2}]},
        '2019-Q15b(vi)': {0: [{'w': [x], 'n': 1} for x in ('stomach', 'duodenum', 'ileum')] + [{'w': ['small', 'intestine'], 'n': 2}]},
        # Bile: emulsifying fats (not "emulsify proteins"), neutralising acid, and the right pH for enzymes.
        '2018-Q15b(i)': {0: [{'w': ['emulsif', x], 'n': 2} for x in ('fat', 'fatty', 'lipid', 'oil')] +
                            [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')],
                         1: [{'w': ['neutralis'], 'n': 1}, {'w': ['increase', 'ph'], 'n': 2}, {'w': ['alkalin'], 'n': 1}],
                         2: [{'w': [a, b], 'n': 2} for a in ('optim', 'suitab', 'right', 'correct', 'best', 'ideal') for b in ('ph', 'enzyme')]},
        # Villi: one cell thick ("many cells thick" earns nothing), a LARGE surface area, a RICH blood supply.
        '2017-Q14c(iii)': {0: [{'w': ['one', 'cell', 'thick'], 'n': 3}, {'w': ['single', 'cell'], 'n': 2}, {'w': ['single', 'layer'], 'n': 2}] +
                              [{'w': ['thin', x], 'n': 2} for x in ('wall', 'lining', 'membrane', 'epitheli', 'layer')],
                           1: [{'w': ['microvill'], 'n': 1}] + [{'w': [x, 'surface'], 'n': 2} for x in ('large', 'bigg', 'increase', 'great', 'maxim', 'more', 'vast')],
                           3: [{'w': [x, y], 'n': 2} for x in ('rich', 'good', 'many', 'network', 'plenty', 'extensive', 'dense', 'large') for y in ('blood', 'capillar')]},
        '2005-Q6(b)': {0: [{'w': [x, 'surface'], 'n': 2} for x in ('large', 'bigg', 'increase', 'great', 'maxim', 'more', 'vast')],
                       1: [{'w': [x, y], 'n': 2} for x in ('rich', 'good', 'many', 'network', 'plenty', 'extensive', 'dense', 'large') for y in ('blood', 'capillar')],
                       3: [{'w': ['one', 'cell', 'thick'], 'n': 3}, {'w': ['single', 'cell'], 'n': 2}, {'w': ['single', 'layer'], 'n': 2}] +
                          [{'w': ['thin', x], 'n': 2} for x in ('wall', 'lining', 'membrane', 'epitheli', 'layer')]},
        '2008-Q12c(v)': {0: [{'w': [x], 'n': 1} for x in ('long', 'length', 'villi', 'microvill', 'lacte', 'lymph', 'fold')] +
                            [{'w': [x, 'surface'], 'n': 2} for x in ('large', 'bigg', 'increase', 'great', 'maxim', 'more', 'vast')] +
                            [{'w': [x, y], 'n': 2} for x in ('rich', 'good', 'many', 'network', 'plenty', 'extensive', 'dense', 'large') for y in ('blood', 'capillar')] +
                            [{'w': ['one', 'cell', 'thick'], 'n': 3}, {'w': ['single', 'cell'], 'n': 2}, {'w': ['single', 'layer'], 'n': 2}] +
                            [{'w': ['thin', x], 'n': 2} for x in ('wall', 'lining', 'membrane', 'epitheli', 'layer')]},
        # Wholegrain food: its fibre stimulates peristalsis ([accept moves food through the alimentary canal]).
        '2016-Q15c(iii)': {0: [{'w': ['peristalsis', x], 'n': 2} for x in ('stimulat', 'encourag', 'increase', 'speed', 'fast', 'promot', 'aid', 'help',
                                                                         'boost', 'more', 'trigger', 'improv')] +
                              [{'w': ['move', 'food'], 'n': 2}]},
        '2015-Q11a(i)': {1: [{'w': [p, a], 'n': 2} for p in ('plant', 'vegeta') for a in ('anim', 'meat', 'flesh')]},
        # A balanced diet: the RIGHT amounts of each food type ("equal amounts" earns nothing).
        '2015-Q11a(ii)': {0: [{'w': [r, 'amount', x], 'n': 3}
                              for r in ('correct', 'right', 'proper', 'appropriate', 'suitab', 'enough', 'sufficient', 'adequate', 'need', 'requir')
                              for x in ('type', 'nutrient', 'group', 'all', 'each', 'every', 'variety', 'different')]},
        # Lipase: what it is; where it's secreted ([accept small intestine, ileum, salivary glands, pancreas]); the pH
        # there (below 7 matched to the stomach, 7-9 for the small intestine: "duodenum" alone is not a pH).
        '2015-Q11b(ii) 1.': {0: [{'w': [v, x], 'n': 2} for v in ('enzyme', 'digest', 'break') for x in ('lipid', 'fat', 'oil')]},
        '2015-Q11b(ii) 2.': {0: [{'w': [x], 'n': 1} for x in ('stomach', 'duodenum', 'ileum', 'pancrea', 'salivar')] + [{'w': ['small', 'intestine'], 'n': 2}]},
        '2015-Q11b(ii) 3.': {0: [{'w': [x], 'n': 1} for x in ('7', '8', '9')] + [{'w': ['stomach', x], 'n': 2} for x in ('1', '2', '3', '4', '5', '6')]},
        # The dental formula: words can't check the order, but all three numbers must be there (no 4s-only or 2s-only).
        '2015-Q11c(i) 1.': {0: [{'w': ['1', '2', '3'], 'n': 3}]},
        '2015-Q11c(i) 2.': {0: [{'w': [f, t], 'n': 2} for f in ('fewer', 'less') for t in ('incisor', 'canine')]},
        '2015-Q11c(i) 3.': {1: [{'w': ['fang'], 'n': 1}] +
                               [{'w': [a, t], 'n': 2} for a in ('long', 'sharp', 'point', 'large', 'bigg', 'extra') for t in ('canine', 'incisor')]},
        '2015-Q11c(ii)': {2: [{'w': ['eges'], 'n': 1}, {'w': ['remove', 'faec'], 'n': 2}, {'w': ['remove', 'undigest'], 'n': 2}]},
        '2015-Q11c(iii)': {1: [{'w': [c, x], 'n': 2} for c in ('compet', 'outcompet') for x in ('pathogen', 'harm', 'micro', 'bacteri', 'germ')] +
                              [{'w': [i, x], 'n': 2} for i in ('inhibit', 'prevent', 'stop', 'block') for x in ('pathogen', 'harm', 'germ')],
                           3: [{'w': ['immun'], 'n': 1}]},
        # Pancreas, dual function: a hormone (or endocrine) AND an enzyme (or exocrine) secretion.
        '2013-Q10a(iii)': {0: [{'w': [h, e], 'n': 2} for h in ('hormone', 'insulin', 'glucagon', 'endocrine')
                               for e in ('enzyme', 'exocrine', 'lipase', 'amylase', 'trypsin', 'protease', 'juice')]},
        '2012-Q15a(v)': {1: [{'w': [c, x], 'n': 2} for c in ('compet', 'outcompet') for x in ('pathogen', 'harm', 'micro', 'bacteri', 'germ')] +
                            [{'w': [i, x], 'n': 2} for i in ('inhibit', 'prevent', 'stop', 'block') for x in ('pathogen', 'harm', 'germ')],
                         3: [{'w': ['canc', x], 'n': 2} for x in ('inhibit', 'prevent', 'decrease', 'lower', 'stop', 'fight', 'protect', 'against')]},
        '2012-Q15a(vi)': {0: [{'w': ['colon'], 'n': 1}, {'w': ['large', 'intestine'], 'n': 2}]},
        # The liver in homeostasis: taking up or releasing glucose ([accept heat generation]).
        '2012-Q15c(iii)': {0: [{'w': [g, x], 'n': 2} for g in ('glucose', 'sugar') for x in ('absorb', 'take', 'releas', 'stor', 'remove', 'convert')] +
                              [{'w': ['glycogen'], 'n': 1}] + [{'w': ['heat', x], 'n': 2} for x in ('gener', 'make', 'releas')]},
        '2011-Q5(b)(i)': {0: [{'w': ['duodenum'], 'n': 1}, {'w': ['small', 'intestine'], 'n': 2}]},
        '2011-Q5(b)(ii)': {0: [{'w': ['gall', 'bladd'], 'n': 2}, {'w': ['liver'], 'n': 1}]},
        '2011-Q5(b)(iv)': {0: [{'w': ['pancreatic', 'juice'], 'n': 2}, {'w': ['enzyme'], 'n': 1}, {'w': ['neutralis'], 'n': 1}] +
                              [{'w': [x], 'n': 1} for x in ('lipase', 'amylase', 'trypsin', 'trypsinog', 'protease', 'peptidase', 'nuclease')]},
        # A named food (or CO2) in the hepatic portal vein: the products of digestion, not "food".
        '2010-Q15b(ii)': {0: [{'w': [x], 'n': 1} for x in ('glucose', 'amino', 'vitamin', 'mineral', 'water', 'co2', 'fructose', 'galactose',
                                                           'monosaccharide', 'sugar', 'salt', 'iron', 'calcium', 'sodium')]},
        '2010-Q15b(iv)': {0: [{'w': ['above'], 'n': 1}, {'w': ['behind'], 'n': 1}]},
        '2010-Q15b(vi)': {0: [{'w': ['emulsif'], 'n': 1}, {'w': ['surface', 'area'], 'n': 2}, {'w': ['neutralis'], 'n': 1},
                              {'w': ['increase', 'ph'], 'n': 2}, {'w': ['alkalin'], 'n': 1}] +
                             [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')]},
        # Two liver functions: storing vitamins, glycogen or minerals; deamination; heat; detox; plasma proteins; cholesterol.
        '2010-Q15b(vii)': {0: [{'w': ['stor', x], 'n': 2} for x in ('vitamin', 'glycogen', 'mineral', 'iron', 'copper')] + [{'w': ['glucose', 'glycogen'], 'n': 2}],
                           1: [{'w': ['deamin'], 'n': 1}, {'w': ['amino', 'urea'], 'n': 2}, {'w': ['make', 'urea'], 'n': 2}, {'w': ['form', 'urea'], 'n': 2},
                               {'w': ['break', 'amino'], 'n': 2}],
                           2: [{'w': ['heat', x], 'n': 2} for x in ('gener', 'make', 'releas')],
                           3: [{'w': ['detox'], 'n': 1}, {'w': ['toxin'], 'n': 1}, {'w': ['poison'], 'n': 1}, {'w': ['break', 'alcohol'], 'n': 2},
                               {'w': ['break', 'drug'], 'n': 2}],
                           4: [{'w': ['plasma', 'protein'], 'n': 2}] + [{'w': ['make', x], 'n': 2} for x in ('fibrinogen', 'albumin', 'prothrombin')],
                           5: [{'w': ['cholesterol', 'make'], 'n': 2}]},
        # Wholegrain and constipation: fibre, which holds water, encourages peristalsis and speeds transit.
        '2010-Q15c(iii)': {0: [{'w': ['fibre'], 'n': 1}, {'w': ['fiber'], 'n': 1}, {'w': ['roughage'], 'n': 1}],
                           1: [{'w': [v, 'water'], 'n': 2} for v in ('absorb', 'hold', 'retain', 'soak', 'keep')],
                           2: [{'w': ['peristalsis', x], 'n': 2} for x in ('stimulat', 'encourag', 'increase', 'speed', 'fast', 'promot', 'aid', 'help',
                                                                         'boost', 'more', 'trigger', 'improv')],
                           3: [{'w': [f, m], 'n': 2} for f in ('fast', 'speed') for m in ('transit', 'move', 'pass', 'through')]},
        '2008-Q12a(i)': {1: [{'w': [x], 'n': 1} for x in ('enzyme', 'acid', 'hydrochloric', 'amylase', 'lipase', 'pepsin', 'protease', 'trypsin')] +
                            [{'w': ['molecul', 'break'], 'n': 2}]},
        # Mechanical digestion other than teeth: tongue ([accept oesophagus, stomach, small intestine or a named part]).
        '2008-Q12a(ii)': {0: [{'w': [x], 'n': 1} for x in ('tongue', 'oesophag', 'esophag', 'stomach', 'duodenum', 'ileum', 'jejunum')] +
                             [{'w': ['small', 'intestine'], 'n': 2}]},
        '2008-Q12b(ii)': {0: [{'w': ['emulsif'], 'n': 1}, {'w': ['surface', 'area'], 'n': 2}] +
                             [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')],
                          1: [{'w': ['neutralis'], 'n': 1}, {'w': ['increase', 'ph'], 'n': 2}, {'w': ['alkalin'], 'n': 1}]},
        # Symbiotic bacteria: living in or on another organism, with benefit.
        '2008-Q12c(i)': {0: [{'w': ['mutual'], 'n': 1}] +
                            [{'w': ['benefi', x], 'n': 2} for x in ('live', 'host', 'organism', 'both', 'each', 'other')]},
        '2008-Q12c(ii)': {2: [{'w': ['immun'], 'n': 1}],
                          3: [{'w': [c, x], 'n': 2} for c in ('compet', 'outcompet') for x in ('pathogen', 'harm', 'micro', 'bacteri', 'germ')] +
                             [{'w': [i, x], 'n': 2} for i in ('inhibit', 'prevent', 'stop', 'block') for x in ('pathogen', 'harm', 'germ')]},
        '2008-Q12c(iv)': {0: [{'w': ['diffu'], 'n': 1}, {'w': ['passive'], 'n': 1}]},
        '2005-Q6(c)': {0: [{'w': ['diffu'], 'n': 1}, {'w': ['passive'], 'n': 1}]},
        '2006-Q3(a)': {0: [{'w': [x], 'n': 1} for x in ('amylase', 'maltase', 'sucrase', 'lactase', 'carbohydrase')]},
        '2006-Q3(b)': {0: [{'w': [x], 'n': 1} for x in ('mouth', 'duodenum', 'ileum', 'jejunum')] + [{'w': ['small', 'intestine'], 'n': 2}]},
        # The product matching the enzyme named in (a).
        '2006-Q3(c)': {0: [{'w': [x], 'n': 1} for x in ('maltose', 'glucose', 'fructose', 'galactose', 'disaccharide', 'monosaccharide', 'dextrin')]},
        '2006-Q3(d)': {0: [{'w': [x], 'n': 1} for x in ('7', '8', '9')]},
        '2006-Q5(c)': {0: [{'w': ['upper', 'abdomen'], 'n': 2}, {'w': ['above', 'stomach'], 'n': 2}] +
                          [{'w': ['diaphragm', x], 'n': 2} for x in ('under', 'below', 'beneath')]},
        '2006-Q5(f)': {0: [{'w': [x], 'n': 1} for x in ('bile', 'emulsif', 'neutralis', 'carbonat', 'bicarbonat', 'hydrogencarbonat', 'nahco3')]},
        '2005-Q6(d)': {0: [{'w': [x], 'n': 1} for x in ('fat', 'fatty', 'glycerol', 'lipid', 'oil')]},
        '2004-Q62': {0: [{'w': ['kill', x], 'n': 2} for x in ('bacteri', 'germ', 'pathogen', 'micro')] +
                        [{'w': ['optim', x], 'n': 2} for x in ('enzyme', 'pepsin')] +
                        [{'w': ['pepsin'], 'n': 1}, {'w': ['denatur'], 'n': 1}, {'w': ['hydrolys', 'starch'], 'n': 2}]},
        '2004-Q63': {0: [{'w': [x], 'n': 1} for x in ('peristalsis', 'bulk', 'constipat')] + [{'w': ['bowel', 'canc'], 'n': 2}]},
        '2004-Q65': {0: [{'w': ['fatty', 'acid'], 'n': 2}, {'w': ['glycerol'], 'n': 1}]},
        '2004-Q66': {0: [{'w': ['emulsific'], 'n': 1}, {'w': ['neutralis'], 'n': 1}, {'w': ['increase', 'ph'], 'n': 2}, {'w': ['alkalin'], 'n': 1}] +
                        [{'w': [a, b], 'n': 2} for a in ('small', 'break', 'split') for b in ('droplet', 'globule')]},
        '2004-Q67': {0: [{'w': ['vitamin', x], 'n': 2} for x in ('make', 'synthes', 'provid', 'source', 'secret', 'releas')] +
                        [{'w': ['diges'], 'n': 1}] +
                        [{'w': [c, x], 'n': 2} for c in ('compet', 'outcompet') for x in ('pathogen', 'harm', 'micro', 'bacteri', 'germ')] +
                        [{'w': [i, x], 'n': 2} for i in ('inhibit', 'prevent', 'stop', 'block') for x in ('pathogen', 'harm', 'germ')]},
    },
}


# ---------------------------------------------------------------- Chain reaction pictures (400 x 300)
# A small map of the gut on the left rings where each step happens; on the right, a numbered panel per step shows what
# the molecules are doing. Both build up as the chain's steps go into place (step/badge from build_game_art.py).
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'mini_games'))
import build_game_art as ga  # noqa: E402

GLU, AMINO, SALIVA, WATER, FAECES = '#FFC42E', '#2BC46F', '#8FD3F4', '#45C4EE', '#8B5A3C'
BEAD = ['#2BC46F', '#7E5BA3', '#E5484D', '#3E6FD8', '#F5A03C']
PANELS = [(182, 6), (290, 6), (182, 104), (290, 104), (182, 202), (290, 202)]


def gut_map():
    """The digestive system diagram, small, on the left: returns (svg, where) with where(anchor) = its spot on the map."""
    d = digestive()
    inner = re.search(r'</desc>(.*)</svg>', d['plain'], re.S).group(1).replace(f'<rect width="480" height="320" fill="{BG}"/>', '', 1)
    inner = re.sub(r'<g data-part="\d+">', '<g>', inner)
    s, tx, ty = 0.9, -125.4, 6.4

    def where(a):
        x, y = d['anchors'][a]
        return round(tx + s * x, 1), round(ty + s * y, 1)
    return f'<g transform="translate({tx} {ty}) scale({s})">{inner}</g>', where


def hexes(x, y, n, r=5.5, fill=GLU, gap=10):
    out = ''
    for k in range(n):
        cx, cy = x + k * gap, y + (2.5 if k % 2 else -2.5)
        pts = ' '.join(f'{cx + r * math.cos(math.pi / 3 * i + math.pi / 6):.1f},{cy + r * math.sin(math.pi / 3 * i + math.pi / 6):.1f}' for i in range(6))
        out += f'<polygon points="{pts}" fill="{fill}" stroke="{INK}" stroke-width="1.3"/>'
    return out


def beads(x, y, n, r=4.5, gap=8, start=0):
    return ''.join(f'<circle cx="{x + k * gap}" cy="{y + (3 if k % 2 else -3)}" r="{r}" fill="{BEAD[(k + start) % 5]}" stroke="{INK}" stroke-width="1.3"/>' for k in range(n))


def blob(cx, cy, color, name):
    """An enzyme: a rounded body with the notch of its active site on top."""
    return (f'<path d="M{cx - 24} {cy - 4}H{cx - 8}L{cx - 5} {cy + 2}H{cx + 5}L{cx + 8} {cy - 4}H{cx + 24}Q{cx + 26} {cy + 12} {cx} {cy + 13}Q{cx - 26} {cy + 12} {cx - 24} {cy - 4}Z" '
            f'fill="{color}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<text x="{cx}" y="{cy + 6}" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="7.5" fill="#FFFFFF">{name}</text>')


def drop(cx, cy, r, color):
    return (f'<path d="M{cx} {cy - 1.7 * r}Q{cx + r} {cy - .3 * r} {cx + r} {cy + .3 * r}A{r} {r} 0 0 1 {cx - r} {cy + .3 * r}Q{cx - r} {cy - .3 * r} {cx} {cy - 1.7 * r}Z" '
            f'fill="{color}" stroke="{INK}" stroke-width="1"/>')


def falling(cx, cy, r, color, dur, begin, drop_by=14):
    return (f'<g opacity="0">{drop(cx, cy, r, color)}<animateTransform attributeName="transform" type="translate" values="0 0;0 {drop_by}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.75;1" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/></g>')


def moving(x1, y1, x2, y2, body, dur=1.8, begin=0.0):
    """Something sliding from one point to another and fading: a molecule being absorbed, water leaving."""
    return (f'<g opacity="0"><g transform="translate({x1} {y1})">{body}</g><animateTransform attributeName="transform" type="translate" values="0 0;{x2 - x1} {y2 - y1}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.75;1" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/></g>')


def mini_arrow(x1, y1, x2, y2, color=INK, w=2.2):
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 7 * math.cos(a), y2 - 7 * math.sin(a)
    px, py = -math.sin(a) * 4.5, math.cos(a) * 4.5
    return (f'<path d="M{x1} {y1}L{hx:.1f} {hy:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
            f'<path d="M{x2} {y2}L{hx + px:.1f} {hy + py:.1f}L{hx - px:.1f} {hy - py:.1f}Z" fill="{color}"/>')


def cross(cx, cy, s=9):
    return f'<path d="M{cx - s} {cy - s}L{cx + s} {cy + s}M{cx + s} {cy - s}L{cx - s} {cy + s}" stroke="#E5484D" stroke-width="3.2" stroke-linecap="round"/>'


def pill(cx, cy, text, fill=INK, color='#FFFFFF'):
    w = len(text) * 6.4 + 14
    return (f'<rect x="{cx - w / 2:.1f}" y="{cy - 8}" width="{w:.1f}" height="16" rx="8" fill="{fill}"/>'
            f'<text x="{cx}" y="{cy}" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="10" fill="{color}">{text}</text>')


def fatty(x, y, color='#C9972B'):
    return f'<path d="M{x} {y}l5 -4l5 4l5 -4l5 4l5 -4" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'


def glycerol(x, y):
    return f'<path d="M{x} {y - 9}V{y + 9}M{x} {y - 8}H{x + 8}M{x} {y}H{x + 8}M{x} {y + 8}H{x + 8}" stroke="#A9822F" stroke-width="2.6" stroke-linecap="round" fill="none"/>'


def liver_mini(cx, cy):
    return (f'<path d="M{cx - 30} {cy - 4}C{cx - 26} {cy - 16} {cx + 10} {cy - 18} {cx + 30} {cy - 12}C{cx + 34} {cy - 8} {cx + 30} {cy - 2} {cx + 24} {cy + 2}'
            f'C{cx + 10} {cy + 10} {cx - 10} {cy + 16} {cx - 22} {cy + 14}C{cx - 32} {cy + 12} {cx - 34} {cy + 4} {cx - 30} {cy - 4}Z" fill="{LIVER}" stroke="{LIVER_D}" stroke-width="1.8"/>')


def gall_mini(cx, cy):
    return (f'<path d="M{cx - 2} {cy - 16}C{cx - 14} {cy - 6} {cx - 14} {cy + 12} {cx} {cy + 16}C{cx + 14} {cy + 12} {cx + 12} {cy - 6} {cx + 2} {cy - 16}Z" fill="{GALL}" stroke="{GALL_D}" stroke-width="1.6"/>'
            f'<path d="M{cx - 4} {cy - 4}Q{cx - 4} {cy + 6} {cx + 2} {cy + 10}" stroke="#A7DA8C" stroke-width="2.4" fill="none" stroke-linecap="round"/>')


def pancreas_mini(cx, cy):
    return (f'<path d="M{cx - 30} {cy + 2}C{cx - 28} {cy - 8} {cx - 14} {cy - 8} {cx} {cy - 6}C{cx + 14} {cy - 4} {cx + 26} {cy - 10} {cx + 32} {cy - 4}'
            f'C{cx + 36} {cy + 4} {cx + 20} {cy + 8} {cx} {cy + 8}C{cx - 14} {cy + 8} {cx - 30} {cy + 12} {cx - 30} {cy + 2}Z" fill="{PANC}" stroke="{PANC_D}" stroke-width="1.6"/>')


def stomach_mini(cx, cy):
    # The stomach from the digestive system diagram (centred near 284 128), at three quarters size.
    s = .75
    return (f'<g transform="translate({cx - 284 * s} {cy - 128 * s}) scale({s})">'
            f'<path d="M256 106C266 92 296 88 310 100C324 114 322 140 308 152C294 164 272 166 258 160C252 157 248 154 244 150L248 142C256 146 266 147 273 142C282 135 281 121 270 114C266 112 262 112 258 114Z" fill="#EE8E86" stroke="{GUT_D}" stroke-width="2.4"/>'
            f'{tube("M246 84V100C246 106 250 110 256 110", 7, GUT, GUT_D)}</g>')


def villus_mini(cx, cy, lacteal_on=False):
    out = (f'<path d="M{cx - 20} {cy + 30}V{cy - 10}A20 20 0 0 1 {cx + 20} {cy - 10}V{cy + 30}Z" fill="#F7C6A8" stroke="{GUT_D}" stroke-width="1.6"/>'
           f'<path d="M{cx - 11} {cy + 30}V{cy - 10}A11 11 0 0 1 {cx + 11} {cy - 10}V{cy + 30}" fill="none" stroke="{RED}" stroke-width="3"/>'
           f'<path d="M{cx + 11} {cy - 8}V{cy + 30}" stroke="{BLUE}" stroke-width="3"/>'
           f'<rect x="{cx - 3.5}" y="{cy - 14}" width="7" height="44" rx="3.5" fill="{LYMPH}" stroke="{LYMPH_D}" stroke-width="{2.2 if lacteal_on else 1.2}"/>')
    return out


def panel(k, caption, art):
    x, y = PANELS[k]
    return ga.step(k, f'<rect x="{x}" y="{y}" width="104" height="94" rx="10" fill="#FFFFFF" stroke="#C9D6E8" stroke-width="1.5"/>' + art +
                   f'<text x="{x + 52}" y="{y + 84}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="10" fill="{INK}">{caption}</text>')


def chain_picture(title, desc, steps, spots):
    """steps: [(caption, art)] for the six panels; spots: the gut-map anchor each step happens at."""
    gmap, where = gut_map()
    b = f'<rect width="400" height="300" fill="{BG}"/>' + gmap
    for k, (caption, art) in enumerate(steps):
        b += panel(k, caption, art)
        mx, my = where(spots[k])
        b += ga.step(k, f'<circle cx="{mx}" cy="{my}" r="9" fill="none" stroke="#FFC42E" stroke-width="3.2"/>')
    b += ''.join(ga.badge(k, x + 12, y + 12) for k, (x, y) in enumerate(PANELS))
    return ga.svg(title, desc, b)


def P(k):
    """The middle of panel k's picture area."""
    x, y = PANELS[k]
    return x + 52, y + 40


def starch_chain():
    s = []
    x, y = P(0)
    s.append(('Saliva added', hexes(x - 20, y + 14, 5) + ''.join(falling(x - 18 + 18 * i, y - 22, 3.2, SALIVA, 1.6, i * .5) for i in range(3))
              + ''.join(f'<rect x="{x - 32 + 16 * i}" y="{y - 34}" width="13" height="10" rx="3" fill="#FDF7E8" stroke="#B8AE96" stroke-width="1.2"/>' for i in range(5))))
    x, y = P(1)
    s.append(('Starch to maltose', hexes(x - 22, y - 14, 3) + hexes(x + 16, y - 14, 2) + hexes(x - 8, y + 1, 2) + blob(x, y + 20, '#3E6FD8', 'AMYLASE')))
    x, y = P(2)
    s.append(('Acid stops amylase', blob(x, y + 12, '#9C9484', 'AMYLASE') + cross(x, y + 14, 10) + pill(x, y - 20, 'pH 2', '#E5484D')))
    x, y = P(3)
    s.append(('Pancreatic amylase', pancreas_mini(x + 8, y - 18) + hexes(x - 30, y + 2, 2) + hexes(x + 12, y + 2, 2) + blob(x, y + 22, '#3E6FD8', 'AMYLASE')))
    x, y = P(4)
    s.append(('Maltose to glucose', hexes(x - 36, y, 2) + mini_arrow(x - 10, y, x + 10, y) + hexes(x + 18, y - 8, 1) + hexes(x + 30, y + 8, 1)))
    x, y = P(5)
    s.append(('Into the blood', villus_mini(x + 16, y) + ''.join(moving(x - 36, y - 10 + 14 * i, x + 6, y - 10 + 14 * i, hexes(0, 0, 1, 5), 2, i * .6) for i in range(2))))
    return chain_picture('Digesting starch', 'Saliva adds amylase in the mouth, which starts breaking starch into maltose. The stomach acid stops it; amylase from the pancreas finishes the job in the duodenum. Maltose is broken into glucose, which is absorbed into the blood capillaries of the villi.',
                         s, ['mouth', 'mouth', 'stomach', 'pancreas', 'ileum', 'ileum'])


def protein_chain():
    s = []
    x, y = P(0)
    s.append(('Gastric juice', stomach_mini(x + 4, y + 4) + ''.join(falling(x + 8 + 12 * i, y - 30, 3, '#C9E27A', 1.6, i * .5, 10) for i in range(3))))
    x, y = P(1)
    rod = f'<rect x="{x - 14}" y="{y + 6}" width="28" height="13" rx="6.5" fill="#9B4A8C" stroke="{INK}" stroke-width="1.3"/>'
    s.append(('Acid kills bacteria', pill(x, y - 18, 'pH 2', '#E5484D') + rod + cross(x, y + 12, 11)))
    x, y = P(2)
    s.append(('Protein to peptides', beads(x - 30, y - 16, 3) + beads(x + 8, y - 16, 3, start=3) + blob(x, y + 18, '#7E5BA3', 'PEPSIN')))
    x, y = P(3)
    s.append(('Pancreatic protease', pancreas_mini(x + 8, y - 18) + beads(x - 26, y + 2, 2, start=1) + beads(x + 14, y + 2, 2, start=3) + blob(x, y + 22, '#7E5BA3', 'PROTEASE')))
    x, y = P(4)
    s.append(('Amino acids', beads(x - 38, y, 3) + mini_arrow(x - 8, y, x + 8, y) + ''.join(f'<circle cx="{x + 18 + 12 * i}" cy="{y + (6 if i % 2 else -6)}" r="4.5" fill="{BEAD[i]}" stroke="{INK}" stroke-width="1.3"/>' for i in range(3))))
    x, y = P(5)
    s.append(('Into the blood', villus_mini(x + 16, y) + ''.join(moving(x - 36, y - 10 + 14 * i, x + 6, y - 10 + 14 * i, f'<circle r="4.5" fill="{BEAD[i]}" stroke="{INK}" stroke-width="1.3"/>', 2, i * .6) for i in range(2))))
    return chain_picture('Digesting protein', 'The stomach churns food with gastric juice. Hydrochloric acid gives pH 2 and kills bacteria, and pepsin breaks proteins into peptides. A protease from the pancreas carries on in the duodenum until they are amino acids, which are absorbed into the blood in the villi.',
                         s, ['stomach', 'stomach', 'stomach', 'pancreas', 'ileum', 'ileum'])


def fat_chain():
    s = []
    x, y = P(0)
    s.append(('Liver makes bile', liver_mini(x, y - 6) + ''.join(falling(x - 10 + 20 * i, y + 14, 3.2, BILE, 1.6, i * .7, 10) for i in range(2))))
    x, y = P(1)
    s.append(('Stored: gall bladder', gall_mini(x, y)))
    x, y = P(2)
    s.append(('Down the bile duct', tube(f'M{x - 40} {y + 20}H{x + 40}', 14, GUT, GUT_D) + vessel(f'M{x} {y - 30}V{y + 12}', GALL_D, 6) + vessel(f'M{x} {y - 30}V{y + 12}', BILE, 3)
              + flow(f'M{x} {y - 30}V{y + 12}', '#E8F6DF', 2)))
    x, y = P(3)
    s.append(('Emulsified', f'<circle cx="{x - 24}" cy="{y}" r="15" fill="#FFD166" stroke="{INK}" stroke-width="1.4"/>' + mini_arrow(x - 4, y, x + 12, y)
              + ''.join(f'<circle cx="{x + 22 + 9 * (i % 3)}" cy="{y - 9 + 9 * (i // 3)}" r="3.6" fill="#FFD166" stroke="{INK}" stroke-width="1.1"/>' for i in range(6))))
    x, y = P(4)
    s.append(('Fatty acids + glycerol', fatty(x - 34, y - 14) + glycerol(x + 18, y - 14) + fatty(x - 6, y - 4) + blob(x, y + 20, '#2BC46F', 'LIPASE')))
    x, y = P(5)
    s.append(('Into the lacteal', villus_mini(x + 16, y, True) + moving(x - 40, y - 8, x + 4, y - 8, fatty(0, 0), 2, 0) + moving(x - 36, y + 8, x + 6, y + 8, glycerol(0, 0), 2, .9)))
    return chain_picture('Digesting fat', 'The liver makes bile, stored in the gall bladder and released down the bile duct into the duodenum. Bile salts emulsify fat into tiny droplets; lipase from the pancreas digests them into fatty acids and glycerol, which are absorbed into the lacteals.',
                         s, ['liver', 'gallBladder', 'duodenum', 'duodenum', 'pancreas', 'ileum'])


def villus_chain():
    s = []
    x, y = P(0)
    s.append(('The ileum', tube(f'M{x - 36} {y - 18}H{x + 30}C{x + 44} {y - 18} {x + 44} {y + 2} {x + 30} {y + 2}H{x - 30}C{x - 44} {y + 2} {x - 44} {y + 22} {x - 30} {y + 22}H{x + 36}', 9, GUT, GUT_D)))
    x, y = P(1)
    fringe = ''.join(f'M{x - 20} {y + 26 - 6 * i}h-4M{x + 20} {y + 26 - 6 * i}h4' for i in range(7)) + ''.join(
        f'M{x + 20 * math.cos(math.radians(a)):.1f} {y - 10 + 20 * math.sin(math.radians(a)):.1f}L{x + 25 * math.cos(math.radians(a)):.1f} {y - 10 + 25 * math.sin(math.radians(a)):.1f}' for a in range(185, 360, 15))
    s.append(('Villi + microvilli', villus_mini(x, y) + f'<path d="{fringe}" stroke="{GUT_D}" stroke-width="1.3" stroke-linecap="round"/>'))
    x, y = P(2)
    s.append(('Into the capillaries', villus_mini(x + 16, y) + moving(x - 38, y - 8, x + 4, y - 8, hexes(0, 0, 1, 5), 2, 0)
              + moving(x - 38, y + 8, x + 4, y + 8, f'<circle r="4.5" fill="{AMINO}" stroke="{INK}" stroke-width="1.3"/>', 2, 1)))
    x, y = P(3)
    hpv = f'M{x - 34} {y + 26}C{x - 10} {y + 26} {x - 6} {y + 4} {x + 4} {y - 6}'
    s.append(('Hepatic portal vein', liver_mini(x + 14, y - 18) + vessel(hpv, PURPLE, 6) + flow(hpv, '#FFFFFF', 2)))
    x, y = P(4)
    s.append(('Stored as glycogen', liver_mini(x, y - 10) + hexes(x - 20, y - 10, 5, 4.5, GLU, 9)))
    x, y = P(5)
    s.append(('Deamination: urea', f'<circle cx="{x - 30}" cy="{y}" r="6" fill="{AMINO}" stroke="{INK}" stroke-width="1.4"/>' + mini_arrow(x - 18, y, x - 2, y) + pill(x + 22, y, 'UREA', '#B5A642')))
    return chain_picture('From the villus to the liver', 'In the ileum, villi and microvilli give a huge surface area. Glucose and amino acids pass into the blood capillaries, and the hepatic portal vein carries them to the liver, which stores spare glucose as glycogen and deaminates spare amino acids, forming urea.',
                         s, ['ileum', 'ileum', 'ileum', 'liver', 'liver', 'liver'])


def fibre_chain():
    s = []
    strand = lambda x, y: f'<path d="M{x} {y}l6 -5l6 5l6 -5l6 5l6 -5l6 5" fill="none" stroke="#3F7F2A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    x, y = P(0)
    s.append(('Can\'t be digested', strand(x - 20, y) + cross(x + 28, y - 2, 8)))
    x, y = P(1)
    s.append(('Adds bulk', tube(f'M{x - 44} {y}H{x + 44}', 30, COLON, COLON_D) + strand(x - 30, y - 4) + strand(x - 4, y + 6)))
    x, y = P(2)
    squeeze = (f'<path d="M{x - 44} {y - 15}H{x + 44}M{x - 44} {y + 15}H{x + 44}" stroke="{COLON_D}" stroke-width="3"/>'
               f'<rect x="{x - 44}" y="{y - 13}" width="88" height="26" fill="{COLON}"/>'
               f'<g><rect x="{x - 14}" y="{y - 15}" width="10" height="30" fill="{COLON_D}"/>'
               f'<animateTransform attributeName="transform" type="translate" values="-24 0;24 0" dur="2.2s" repeatCount="indefinite"/></g>')
    s.append(('Peristalsis', squeeze + mini_arrow(x - 20, y + 26, x + 22, y + 26)))
    x, y = P(3)
    s.append(('Water absorbed', tube(f'M{x - 44} {y + 6}H{x + 44}', 26, COLON, COLON_D)
              + ''.join(moving(x - 24 + 24 * i, y + 2, x - 24 + 24 * i, y - 28, drop(0, 0, 3.4, WATER), 1.8, i * .6) for i in range(3))))
    x, y = P(4)
    s.append(('Stored in the rectum', tube(f'M{x} {y - 34}V{y + 22}', 26, COLON, COLON_D) + f'<ellipse cx="{x}" cy="{y + 4}" rx="9" ry="14" fill="{FAECES}"/>'))
    x, y = P(5)
    s.append(('Egestion', tube(f'M{x} {y - 34}V{y + 2}', 22, COLON, COLON_D) + f'<rect x="{x - 14}" y="{y + 2}" width="28" height="7" rx="3.5" fill="#5B3172"/>' + mini_arrow(x, y + 14, x, y + 32, FAECES, 3)))
    return chain_picture('Fibre and the large intestine', 'Fibre cannot be digested, so it adds bulk, giving the gut muscles something to push against: peristalsis. Water is absorbed in the colon, and the faeces are stored in the rectum until they leave through the anus (egestion).',
                         s, ['ileum', 'ileum', 'colon', 'colon', 'rectum', 'anus'])


def CHAIN_ART():
    return {'Digesting starch': starch_chain(), 'Digesting protein': protein_chain(), 'Digesting fat': fat_chain(),
            'From the villus to the liver': villus_chain(), 'Fibre and the large intestine': fibre_chain()}

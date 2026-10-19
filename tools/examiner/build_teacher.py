"""Builds the examiner (the strict teacher with the pointer stick) for the site: examiner-art.js.

Input: assets/examiner/teacher-source.png, a small two-tone cartoon of him (dark ink on a light blue background).
He is cut out, scaled up 8 times and traced into smooth vector shapes, coloured, and the parts that move are split
off: the hand and stick (wag from the wrist), the brows (lift at their inner ends), the pupils (blink and look
round) and the mouth (talks). A white sticker edge keeps his dark suit visible on the site's dark blue. No frame:
he is always shown whole.

Output: examiner-art.js, window.ExamTeacher.svg(faces): his SVG, all of him, facing 'right' (the default: he
stands on the left of the screen, looking in) or 'left' (as drawn, for the right of the screen), plus the CSS that
animates him. ExamTeacher.head(faces) is just his head (face, hair and ears, cut off at the jaw) with its own white
edge, for small spots. Never a crop in a box. Moods come from data-mood on any parent (ok, happy, angry,
furious) and talking from the class is-talking on any parent (answer-mode.js sets both).

Run: python3 tools/examiner/build_teacher.py   (needs numpy, scipy, pillow and potracer: pip install potracer)
"""
import os
import numpy as np
import potrace
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SRC = os.path.join(ROOT, 'assets', 'examiner', 'teacher-source.png')
OUT = os.path.join(ROOT, 'examiner-art.js')
S = 8

# ---------- cut him out of the background ----------
im = np.asarray(Image.open(SRC).convert('RGB')).astype(float)
lum = im @ [0.299, 0.587, 0.114]
ink0 = lum < 120
wall = ndi.binary_dilation(ink0, iterations=1)          # thicken the ink so small gaps don't let the outside in
lab, n = ndi.label(~wall)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
outside = np.isin(lab, list(edge))
outside |= ~outside & ndi.binary_dilation(outside) & ~ink0
fig0 = ~outside
ys, xs = np.where(fig0)
x0, y0, x1, y1 = xs.min() - 3, ys.min() - 3, xs.max() + 4, ys.max() + 4
W, H = (x1 - x0) * S, (y1 - y0) * S


def big(a):
    a = Image.fromarray((np.clip(a[y0:y1, x0:x1], 0, 1) * 255).astype(np.uint8))
    return np.asarray(a.resize((W, H), Image.BICUBIC)).astype(float) / 255


ink = big(np.clip((232 - lum) / (232 - 30), 0, 1)) > 0.5
fig = ndi.gaussian_filter(big(fig0.astype(float)), 4) > 0.5
fig |= ink
yy, xx = np.mgrid[0:H, 0:W]
light = fig & ~ink
llab, _ = ndi.label(light)                              # every light area inside him, numbered (the ids below)

# ---------- the pointer stick, redrawn as a clean line behind his fist ----------
hand = np.isin(llab, [190, 197, 211, 233, 239, 249])    # the fingers and knuckles of the hand holding the stick
fist = ndi.binary_dilation(ndi.binary_fill_holes(hand), iterations=22)
ty, tx = np.where(ink & (xx < 120) & (yy < 540))
a_, b_ = np.polyfit(ty, tx, 1)                          # x = a*y + b along the stick
y_top = ty.min()
below = ink & (yy > 690) & (yy < 800) & (np.abs(xx - (a_ * yy + b_)) < 14) & ~fist
y_end = np.where(below)[0].max() if below.any() else 760
P0, P1 = (a_ * y_top + b_, y_top), (a_ * y_end + b_, y_end)
stick = (np.abs(xx - (a_ * yy + b_)) / np.sqrt(1 + a_ * a_) < 15) & (yy >= y_top - 12) & (yy <= y_end + 12) & ~fist
widths = [ink[y, int(a_ * y + b_) - 20:int(a_ * y + b_) + 20].sum() for y in range(y_top + 40, 520, 20)]
SW = max(16, float(np.median(widths)) + 2)

# ---------- the hand turns at the wrist: everything left of a line just inside his shirt cuff ----------
WA, WB = (196, 600), (160, 712)
cross = (WB[0] - WA[0]) * (yy - WA[1]) - (WB[1] - WA[1]) * (xx - WA[0])
handR = (cross > 0) & (yy > 545) & (yy < 760) & (xx < 210) & fig & ~stick
WRIST = (178, 656)
filler = handR & ((xx - WRIST[0]) ** 2 + (yy - WRIST[1]) ** 2 < 36 ** 2)  # a dark wrist under the hand, so no gap opens
handD = ndi.binary_dilation(handR, iterations=4) & fig & ~stick           # overlaps the arm a little, so no seam shows

# ---------- pupils, mouth ----------
ilab, _ = ndi.label(ink)


def pick(xa, xb, ya, yb):
    sub = ilab[ya:yb, xa:xb]
    ids, cnt = np.unique(sub[sub > 0], return_counts=True)
    return ilab == ids[cnt.argmax()]


pupilL, pupilR, mouth = pick(263, 297, 248, 285), pick(423, 459, 253, 290), pick(322, 462, 362, 425)
lip = pick(350, 401, 422, 446) | pick(463, 486, 431, 452)    # his lower lip line and chin mark, hidden while he smiles

# ---------- the brows: the ink above and between the two round lenses, down to the bridge ----------
LENS_L, LENS_R = (277.9, 271.8, 58.5), (456.3, 280.5, 69.7)  # centre and outer radius of each rim, plus a pixel
rimL = np.hypot(xx - LENS_L[0], yy - LENS_L[1]) < LENS_L[2]
rimR = np.hypot(xx - LENS_R[0], yy - LENS_R[1]) < LENS_R[2]
bcand = (ink & (yy > 160) & (yy < 266) & ~((xx > 326) & (xx < 396) & (yy > 246)) & (xx >= 272) & (xx <= 530)
         & ~rimL & ~rimR & ~((xx > 522) & (yy > 225)))
blab, bn = ndi.label(bcand)
bsize = ndi.sum(bcand, blab, range(1, bn + 1))
brow = np.isin(blab, [i + 1 for i, v in enumerate(bsize) if v > 1500])
brow &= ~((yy < 171) & (xx > 292) & (xx < 340))         # the hair stroke above the left brow stays with the head
# the dark wedge between the left brow's outer end and the side of his head is brow too; his head's outline stays
deep = ndi.distance_transform_edt(fig)
brow |= ink & (xx >= 228) & (xx < 300) & (yy > 150) & (yy < 232) & (deep > 7) & ~rimL
edge_line = fig & (deep <= 16) & (xx >= 228) & (xx < 300) & (yy > 150) & (yy < 232)   # his outline there, kept whole
browL = (ndi.binary_dilation(brow & (xx < 386), iterations=3) & ink) | (brow & (xx < 386))
browR = (ndi.binary_dilation(brow & (xx >= 386), iterations=3) & ink) | (brow & (xx >= 386))


def solid(m, d=11):
    # A lifted brow's bottom follows the curve of the top of the glasses, a little lower than the rim's edge, so the
    # brow keeps a good thickness. Only rim ink is added, so at rest nothing changes.
    ys_, xs_ = np.where(m)
    pts = np.c_[xs_, ys_]
    canvas = Image.new('1', (W, H), 0)
    ImageDraw.Draw(canvas).polygon([tuple(int(v) for v in q) for q in pts[ConvexHull(pts).vertices]], fill=1)
    full = m | (np.asarray(canvas) & ink & (rimL | rimR))
    out = full & ~(np.hypot(xx - LENS_L[0], yy - LENS_L[1]) < LENS_L[2] - 1 - d) & ~(np.hypot(xx - LENS_R[0], yy - LENS_R[1]) < LENS_R[2] - 1 - d)
    k = np.hypot(*np.mgrid[-5:6, -5:6]) <= 5
    return ndi.binary_opening(out, structure=k)


browL, browR = solid(browL), solid(browR)
moving = pupilL | pupilR | mouth | brow | lip


def trace(bm):
    if not bm.any():
        return ''
    out = []
    for c in potrace.Bitmap(~bm).trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.2):
        d = ['M%.0f %.0f' % (c.start_point.x, c.start_point.y)]
        for s in c.segments:
            if s.is_corner:
                d.append('L%.0f %.0fL%.0f %.0f' % (s.c.x, s.c.y, s.end_point.x, s.end_point.y))
            else:
                d.append('C%.0f %.0f %.0f %.0f %.0f %.0f' % (s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.end_point.x, s.end_point.y))
        out.append(''.join(d) + 'Z')
    return ''.join(out)


def areas(ids, holes=False):
    m = np.isin(llab, ids)
    if holes:
        m = ndi.binary_fill_holes(m)
    return ndi.binary_dilation(m, iterations=3) & fig & ~stick & ~handR


SKIN, INK, FILL, EDGE = '#F2C9A0', '#13233A', '#F6F3EC', '#FFFFFF'
# Colour for each light area (x-skin: his face, which reddens when he's angry).
COLOURS = [
    (SKIN, 'x-skin', areas([29, 91, 87, 4], holes=True)),                  # head and face
    (SKIN, 'x-skin', ndi.binary_dilation(brow, iterations=4) & fig),       # skin under the brows, seen when they lift
    (SKIN, '', areas([254, 261, 275])),                                    # the hand holding the books
    ('#FFFFFF', '', areas([81, 83], holes=True)),                          # eyes behind the glasses
    ('#FFFFFF', '', areas([142, 169, 185, 243, 183, 232])),                # shirt, collar and cuff
    ('#E3B23C', '', areas([179])), ('#D9534F', '', areas([209])), ('#4A7FC1', '', areas([237])), ('#5FB37A', '', areas([263])),  # books
    ('#6F86A8', '', areas([139, 167, 221, 274, 291, 298, 301])),           # creases in his suit
]
PATCHES = ''.join('<path%s d="%s" fill="%s"/>' % (' class="%s"' % k if k else '', trace(m), c) for c, k, m in COLOURS)
tooth = ndi.binary_dilation(np.isin(llab, [121]), iterations=3)


face_r = ndi.binary_fill_holes(np.isin(llab, [29, 91, 87, 4, 81, 83, 121]))
head = fig & ((yy < 380) | ndi.binary_dilation(face_r, iterations=18))
hlab, hn = ndi.label(head)
head = hlab == (np.argmax(ndi.sum(head, hlab, range(1, hn + 1))) + 1)


def centre(m):
    ys_, xs_ = np.where(m)
    return (xs_.min() + xs_.max() + 1) / 2, (ys_.min() + ys_.max() + 1) / 2


pl, pr = centre(pupilL), centre(pupilR)
# His smile: his mouth (its tooth hole filled) turned upside down, so the frown becomes a smile, moved down a little;
# then the same tooth hangs just under its top edge.
SMILE_DROP = 14
solid_m = ndi.binary_fill_holes(mouth)
my_, mx_ = np.where(solid_m)
mx0, mx1, my0, my1 = mx_.min(), mx_.max(), my_.min(), my_.max()
smile = np.zeros_like(mouth)
smile[my0 + SMILE_DROP:my1 + 1 + SMILE_DROP, mx0:mx1 + 1] = solid_m[my0:my1 + 1, mx0:mx1 + 1][::-1, :]
ty_, tx_ = np.where(np.isin(llab, [121]))                         # the tooth as it shows in his mouth, no bigger
t_cx = int(round(tx_.mean()))
new_cx = t_cx                                                     # the same place along his mouth
new_top = np.where(smile[:, new_cx])[0].min() + 7                # just under his top lip
smile_tooth = np.zeros_like(mouth)
smile_tooth[ty_ - ty_.min() + new_top, tx_ - t_cx + new_cx] = True
SMILE_TOP = my0 + SMILE_DROP
my, mx = np.where(mouth)[0].min(), centre(mouth)[0]
fig_d = trace(fig & ~stick & ~(handR & ~filler))
hfig = trace(handD)
line = 'M%.0f %.0fL%.0f %.0f' % (P0[0], P0[1], P1[0], P1[1])
turn = 'style="transform-origin:%dpx %dpx"' % WRIST
BODY = '-14 -14 %d %d' % (W + 28, H + 28)
svg = (
    '<svg class="tch" xmlns="http://www.w3.org/2000/svg" viewBox="' + BODY + '" aria-hidden="true" focusable="false">'
    '<g class="x-steam"><circle cx="300" cy="40" r="24"/><circle cx="262" cy="-6" r="17"/><circle cx="590" cy="40" r="24"/><circle cx="628" cy="-6" r="17"/></g>'
    '<g class="tch-body">'
    # the white sticker edge: the hand and stick's part turns with them
    '<g class="tch-hand" ' + turn + '><path d="' + hfig + '" fill="' + EDGE + '" stroke="' + EDGE + '" stroke-width="22" stroke-linejoin="round"/>'
    '<path d="' + line + '" stroke="' + EDGE + '" stroke-width="%.0f" stroke-linecap="round"/></g>' % (SW + 22) +
    '<path d="' + fig_d + '" fill="' + EDGE + '" stroke="' + EDGE + '" stroke-width="22" stroke-linejoin="round" fill-rule="evenodd"/>'
    # the stick, behind his fist
    '<g class="tch-hand" ' + turn + ' fill="none" stroke-linecap="round"><path d="' + line + '" stroke="' + INK + '" stroke-width="%.0f"/>' % SW +
    '<path d="' + line + '" stroke="#A8743F" stroke-width="%.0f"/></g>' % (SW - 8) +
    '<path d="' + fig_d + '" fill="' + FILL + '" fill-rule="evenodd"/>' + PATCHES +
    '<path d="' + trace((ink & ~stick & ~moving & ~handR) | filler | edge_line) + '" fill="' + INK + '" fill-rule="evenodd"/>'
    # the hand holding the stick
    '<g class="tch-hand" ' + turn + '><path d="' + trace(ndi.binary_dilation(handR & ~ink, iterations=2) & handD) + '" fill="' + FILL + '"/>'
    '<path d="' + trace(ndi.binary_dilation(hand, iterations=3) & handR) + '" fill="' + SKIN + '"/>'
    '<path d="' + trace(ink & handD) + '" fill="' + INK + '" fill-rule="evenodd"/></g>'
    # brows (kept inside his head), pupils, mouth
    '<clipPath id="tch-head"><path d="' + fig_d + '"/></clipPath><g clip-path="url(#tch-head)">'
    '<path class="tch-brow" d="' + trace(browL) + '" fill="' + INK + '" style="transform-origin:280px 192px;--tilt:-9deg"/>'
    '<path class="tch-brow" d="' + trace(browR) + '" fill="' + INK + '" style="transform-origin:515px 197px;--tilt:9deg"/></g>'
    '<g class="tch-look"><path class="tch-eye" d="' + trace(pupilL) + '" fill="' + INK + '" style="transform-origin:%.0fpx %.0fpx"/>' % pl +
    '<path class="tch-eye" d="' + trace(pupilR) + '" fill="' + INK + '" style="transform-origin:%.0fpx %.0fpx"/></g>' % pr +
    '<path class="tch-lip" d="' + trace(lip) + '" fill="' + INK + '"/>'
    '<g class="tch-mouth" style="transform-origin:%.0fpx %dpx"><path d="' % (mx, my) + trace(tooth) + '" fill="#FFFFFF"/>'
    '<path d="' + trace(mouth) + '" fill="' + INK + '" fill-rule="evenodd"/></g>'
    # his smile, shown instead of his mouth when he's pleased: his mouth upside down, a little lower, with its tooth on top
    '<g class="tch-smile" style="transform-origin:%.0fpx %dpx">' % (mx, SMILE_TOP) +
    '<path d="' + trace(smile) + '" fill="' + INK + '"/><path d="' + trace(smile_tooth) + '" fill="#FFFFFF"/></g>'
    '</g></svg>'
)
# The head on its own: the same face, brows, eyes and mouth, kept inside the head's outline, with its own white edge.
hy, hx = np.where(head)
hx0, hy0 = hx.min() - 16, min(hy.min() - 16, -30)
HEAD_BOX = '%d %d %d %d' % (hx0, hy0, hx.max() + 16 - hx0, hy.max() + 16 - hy0)
head_d = trace(head)
hk = ndi.binary_dilation(head, iterations=4)                 # a little past the edge, then clipped to it
static_ink = (ink & ~stick & ~moving & ~handR) | filler | edge_line
inner = ('<path d="' + trace(fig & hk) + '" fill="' + FILL + '"/>'
         + ''.join('<path%s d="%s" fill="%s"/>' % (' class="%s"' % k if k else '', trace(m & hk), c) for c, k, m in COLOURS if (m & hk).any())
         + '<path d="' + trace(static_ink & hk) + '" fill="' + INK + '" fill-rule="evenodd"/>'
         + svg[svg.index('<clipPath id="tch-head">'):svg.index('</g></svg>')])
head_svg = (
    '<svg class="tch tch--head" xmlns="http://www.w3.org/2000/svg" viewBox="' + HEAD_BOX + '" aria-hidden="true" focusable="false">'
    + svg[svg.index('<g class="x-steam">'):svg.index('<g class="tch-body">')] +
    '<g class="tch-body"><path d="' + head_d + '" fill="' + EDGE + '" stroke="' + EDGE + '" stroke-width="22" stroke-linejoin="round"/>'
    '<clipPath id="tch-headonly"><path d="' + head_d + '"/></clipPath><g clip-path="url(#tch-headonly)">' + inner + '</g></g></svg>'
)

# How he moves. Waiting: he breathes, blinks, glances round, lifts his brows now and then and sways the stick.
# Talking (is-talking): his jaw works, the stick wags from the wrist and his brows lift on the beat.
# Happy: brows up and a grin. Angry and furious: brows down (answer-mode.js reddens his face, shakes him and adds steam).
CSS = ''.join([
    'svg.tch{display:block;width:100%;height:100%;overflow:visible}',
    'svg.tch.tch--right{scale:-1 1}',
    'svg.tch .x-steam{display:none;fill:#E8EEFA}',
    '[data-mood="furious"] svg.tch .x-steam{display:inline}',
    '.tch-body{transform-box:view-box;transform-origin:440px 1100px;animation:tchBreathe 3.6s ease-in-out infinite}',
    '.tch-hand{transform-box:view-box;animation:tchSway 3.6s ease-in-out infinite}',
    '.tch-eye{transform-box:view-box;animation:tchBlink 4.8s infinite}',
    '.tch-look{transform-box:view-box;animation:tchLook 7.2s ease-in-out infinite}',
    '.tch-brow{transform-box:view-box;animation:tchBrows 7.2s ease-in-out infinite;transition:transform .25s ease}',
    '.tch-mouth{transform-box:view-box}',
    '@keyframes tchBreathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.008,1.018)}}',
    '@keyframes tchSway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-2deg)}}',
    '@keyframes tchBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}',
    '@keyframes tchLook{0%,24%{transform:translate(0,0)}30%,44%{transform:translate(7px,-3px)}52%,64%{transform:translate(-7px,2px)}72%,100%{transform:translate(0,0)}}',
    '@keyframes tchBrows{0%,26%,48%,100%{transform:translateY(0) rotate(0deg)}31%,43%{transform:translateY(-8px) rotate(var(--tilt,0deg))}}',
    '.is-talking .tch-mouth{animation:tchJaw .44s ease-in-out infinite}',
    '.is-talking .tch-hand{animation:tchWag .9s ease-in-out infinite}',
    '.is-talking .tch-brow{animation:tchBrowTalk 1.8s ease-in-out infinite}',
    '.is-talking .tch-look{animation:none;transform:translate(-7px,0)}',
    '@keyframes tchJaw{0%,100%{transform:scaleY(1)}30%{transform:scaleY(.3)}55%{transform:scaleY(.85)}80%{transform:scaleY(.45)}}',
    '@keyframes tchWag{0%,100%{transform:rotate(3deg)}50%{transform:rotate(-7deg)}}',
    '@keyframes tchBrowTalk{0%,55%,100%{transform:translateY(0) rotate(0deg)}12%,35%{transform:translateY(-6px) rotate(calc(var(--tilt,0deg) * .8))}}',
    '[data-mood="happy"] .tch-brow{animation:none;transform:translateY(-8px) rotate(var(--tilt,0deg))}',
    '.tch-smile{display:none;transform-box:view-box}',
    '[data-mood="happy"] .tch-smile{display:inline}',
    '[data-mood="happy"] .tch-mouth,[data-mood="happy"] .tch-lip{display:none}',
    '.is-talking[data-mood="happy"] .tch-smile,[data-mood="happy"] .is-talking .tch-smile{animation:tchGrin .44s ease-in-out infinite}',
    '@keyframes tchGrin{0%,100%{transform:scaleY(1)}40%{transform:scaleY(.72)}}',
    '[data-mood="angry"] .tch-brow,[data-mood="furious"] .tch-brow{animation:none;transform:translateY(5px) rotate(calc(var(--tilt,0deg) * -.4))}',
    'svg.tch .x-steam circle{transform-box:fill-box;transform-origin:center;animation:tchSteam 1.1s ease-out infinite}',
    'svg.tch .x-steam circle:nth-child(2n){animation-delay:.45s}',
    '@keyframes tchSteam{0%{opacity:0;transform:translateY(40px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-110px) scale(1.4)}}',
    'svg.tch .x-skin{transition:fill .3s ease}',
    '[data-mood="angry"] svg.tch .x-skin{fill:#F4AE90}',
    '[data-mood="furious"] svg.tch .x-skin{fill:#EE8366}',
    '@media (prefers-reduced-motion:reduce){svg.tch *{animation:none !important}}',
])

js = ('// The examiner: a strict teacher with a pointer stick. Generated by tools/examiner/build_teacher.py from\n'
      '// assets/examiner/teacher-source.png; do not edit by hand.\n'
      '// ExamTeacher.svg() is all of him (never cropped), facing right, into the page from its left side;\n'
      '// ExamTeacher.svg("left") faces left, for the right of the screen. ExamTeacher.head() is just his head, cut\n'
      '// out at the jaw with its own white edge. Moods come from\n'
      '// data-mood on a parent (ok, happy, angry, furious); talking from the class is-talking on a parent.\n'
      '(function () {\n'
      "  'use strict';\n"
      '  var SVG = ' + repr(svg) + ';\n'
      '  var HEAD = ' + repr(head_svg) + ';\n'
      '  var CSS = ' + repr(CSS) + ';\n'
      '  var styled = false;\n'
      '  function svg(faces) {\n'
      '    if (!styled && typeof document !== "undefined") {\n'
      '      styled = true;\n'
      '      var st = document.createElement("style");\n'
      '      st.textContent = CSS;\n'
      '      document.head.appendChild(st);\n'
      '    }\n'
      "    return faces === 'left' ? SVG : SVG.replace('class=\"tch\"', 'class=\"tch tch--right\"');\n"
      '  }\n'
      '  function head(faces) {\n'
      '    svg();\n'
      "    return faces === 'left' ? HEAD : HEAD.replace('class=\"tch tch--head\"', 'class=\"tch tch--head tch--right\"');\n"
      '  }\n'
      '  window.ExamTeacher = { svg: svg, head: head };\n'
      '})();\n')
open(OUT, 'w').write(js)
print('wrote', OUT, len(js) // 1024, 'KB; size', W, H)

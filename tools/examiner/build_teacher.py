"""Builds the examiner ("bro", the strict teacher with the pointer stick) for the site: examiner-art.js and his pictures.

HE IS THE USER'S OWN DRAWING NOW. The user sent two pictures, each already on a see-through background:
  assets/examiner/src/bro-figure.webp   all of him ("this is bro")
  assets/examiner/src/bro-heads.webp    his head four times: ok, happy / angry, furious (top row, bottom row)
Before this he was a rough tracing of a 178-pixel copy of the same drawing, with a white "sticker" edge round him.
The user wanted the white gone ("i need to gigure out a way to fully get rid of white backround") and then gave these.
Nothing here redraws him: the pictures are used as they are, cut to size, with NO white edge and nothing behind him.

What is written:
  assets/examiner/bro.webp                 all of him
  assets/examiner/bro-head-<mood>.webp     his head in each mood, all four on the same canvas so the head does not
                                           jump when the mood changes
  assets/examiner/teacher-head.svg         his head facing right, all of it, in one file, for the logo on the desk
  assets/examiner/bro-icon.svg             the tab icon: a square that his head fills (see ICON_CUT)
  examiner-art.js                          window.ExamTeacher, the same two calls as before:
      ExamTeacher.svg(faces)   all of him, never cropped. He is drawn facing left; he is mirrored to face right unless
                               `faces` is 'left' (he always faces into the page).
      ExamTeacher.head(faces)  just his head.
  Moods come from data-mood on any parent (ok, happy, angry, furious): the head for that mood is shown, and on the
  whole figure it is laid over his own head, at the place found by lining the "ok" head up with the figure. Talking is
  the class is-talking on any parent. He breathes while he waits and rocks a little while he talks; the old traced
  one also blinked and moved his jaw, which a picture cannot do.

Run: python3 tools/examiner/build_teacher.py            (needs numpy and pillow)
     python3 tools/examiner/build_teacher.py --refit    (line the head up with the figure again, about a minute)
"""
import base64
import io
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
EX = os.path.join(ROOT, 'assets', 'examiner')
MOODS = ['ok', 'happy', 'angry', 'furious']
VER = '2'   # goes on the picture addresses: raise it when a picture changes

# "make bro less tan" (the user, the day after sending the drawings; his skin as drawn is a strong orange-peach,
# 252 186 126). TAN is how much of that colour is kept: 1 is as drawn, 0.66 gives a light peach (252 208 169).
# Only his skin moves: the pointer, the books, the papers and the red of the furious head are outside the window.
TAN = 0.66
# "and bigger head ... asm in bigger in the tab bar": the tab icon is its own file, a square that his head fills from
# side to side and chin to crown. Only the tips of his tufts of hair, this many pixels of the head drawing, run off
# the top (on a dark tab bar they could not be seen anyway). The logo on the desk still shows all of his head.
ICON_CUT = 44

# Where the "ok" head sits on the figure, in the figure picture's own pixels: its scale and the top-left corner of
# its own outline box. Found by --refit (the dark ink of the two agrees over 88.5% of the head).
FIT = {'scale': 1.075, 'x': 400, 'y': 35}


def solid(im):
    """Alpha tidied: what is all but solid becomes solid, what is all but clear becomes clear."""
    a = np.asarray(im.convert('RGBA')).copy()
    al = a[..., 3]
    al[al >= 250] = 255
    al[al <= 4] = 0
    a[al == 0] = 0
    return Image.fromarray(a)


def less_tan(im, keep):
    """His skin with less colour in it: same hue, saturation brought down to `keep` of what it was."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a[..., :3].max(-1), a[..., :3].min(-1)
    d = mx - mn
    sat = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    hue = np.where((mx == r) & (d > 1e-6), 60 * (g - b) / np.maximum(d, 1e-6), -999)      # warm colours only

    def win(x, a0, a1, b1, b0):
        return np.clip((x - a0) / (a1 - a0), 0, 1) * np.clip((b0 - x) / (b0 - b1), 0, 1)
    w = win(hue, 14, 20, 34, 40) * win(sat, 0.15, 0.25, 0.55, 0.68) * np.clip((mx - 0.45) / 0.30, 0, 1)
    mn2 = mx * (1 - sat * (1 - (1 - keep) * w))
    fg = np.where(d > 1e-6, (g - mn) / np.maximum(d, 1e-6), 0)
    fb = np.where(d > 1e-6, (b - mn) / np.maximum(d, 1e-6), 0)
    out = a.copy()
    out[..., 1] = np.where(w > 0, mn2 + (mx - mn2) * fg, g)
    out[..., 2] = np.where(w > 0, mn2 + (mx - mn2) * fb, b)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8))


def ink(im):
    a = np.asarray(im).astype(float)
    lum = a[..., :3] @ [0.299, 0.587, 0.114]
    return (a[..., 3] > 128) & (lum < 70), a[..., 3] > 128


def refit(fig, ok):
    """Scale and place of the ok head on the figure where their dark ink agrees best."""
    fi, _ = ink(fig)
    fi = fi.astype(np.float32)

    def small(m, k=4):
        h, w = m.shape
        return m[:h // k * k, :w // k * k].reshape(h // k, k, w // k, k).mean((1, 3))
    fs, best = small(fi), None
    for s in np.arange(0.90, 1.31, 0.02):
        o = ok.resize((int(ok.size[0] * s), int(ok.size[1] * s)), Image.LANCZOS)
        oi, oa = ink(o)
        os_, oas = small(oi.astype(np.float32)), small(oa.astype(np.float32))
        hh, ww = os_.shape
        for ty in range(0, 60):
            for tx in range(40, 180):
                if ty + hh > fs.shape[0] or tx + ww > fs.shape[1]:
                    continue
                sc = float((1 - np.abs(fs[ty:ty + hh, tx:tx + ww] - os_))[oas > 0.5].mean())
                if best is None or sc > best[0]:
                    best = (sc, float(s), tx * 4, ty * 4)
    _, s0, x0, y0 = best
    fine = None
    for s in np.arange(s0 - 0.02, s0 + 0.021, 0.005):
        o = ok.resize((int(round(ok.size[0] * s)), int(round(ok.size[1] * s))), Image.LANCZOS)
        oi, oa = ink(o)
        hh, ww = oi.shape
        for ty in range(max(0, y0 - 6), y0 + 7):
            for tx in range(x0 - 6, x0 + 7):
                if ty + hh > fi.shape[0] or tx + ww > fi.shape[1]:
                    continue
                sc = float((1 - np.abs(fi[ty:ty + hh, tx:tx + ww] - oi))[oa > 0.5].mean())
                if fine is None or sc > fine[0]:
                    fine = (sc, float(s), tx, ty)
    print('fit: agreement %.4f, scale %.3f, x %d, y %d' % fine)
    return {'scale': round(fine[1], 3), 'x': fine[2], 'y': fine[3]}


def webp(im, path):
    # Not lossless: that is three times the size for no difference that can be seen (the drawings arrived as WebP).
    # The see-through edge is kept exactly.
    im.save(path, 'WEBP', quality=90, alpha_quality=100, method=6)
    return os.path.getsize(path)


# ---------- the two drawings ----------
fig = less_tan(solid(Image.open(os.path.join(EX, 'src', 'bro-figure.webp'))), TAN)
sheet = less_tan(solid(Image.open(os.path.join(EX, 'src', 'bro-heads.webp'))), TAN)
W, H = sheet.size
quarters = {'ok': (0, 0, W // 2, H // 2), 'happy': (W // 2, 0, W, H // 2), 'angry': (0, H // 2, W // 2, H), 'furious': (W // 2, H // 2, W, H)}
raw = {}
for m in MOODS:
    q = sheet.crop(quarters[m])
    raw[m] = q.crop(q.split()[3].point(lambda v: 255 if v > 40 else 0).getbbox())
if '--refit' in sys.argv:
    FIT = refit(fig, raw['ok'])

# ---------- the four heads on one canvas ----------
# Each head is its own drawing, so they are lined up with the ok head by their dark ink (hair, glasses, outline),
# a few pixels either way, and then all put on a canvas big enough for every one of them.
ok_i, ok_a = ink(raw['ok'])
PAD = 12
off = {'ok': (0, 0)}
for m in MOODS[1:]:
    mi, ma = ink(raw[m])
    best = None
    for dy in range(-10, 11):
        for dx in range(-10, 11):
            # overlap of the two pictures when this head is moved by (dx, dy) against the ok head's top-left corner
            x0, y0 = max(0, dx), max(0, dy)
            x1, y1 = min(ok_i.shape[1], mi.shape[1] + dx), min(ok_i.shape[0], mi.shape[0] + dy)
            a = ok_i[y0:y1, x0:x1]
            b = mi[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
            top = slice(0, int(a.shape[0] * 0.62))          # the mouth changes with the mood: go by the top of the head
            sc = float((a[top] == b[top]).mean())
            if best is None or sc > best[0]:
                best = (sc, dx, dy)
    off[m] = (best[1], best[2])
minx = min(o[0] for o in off.values()); miny = min(o[1] for o in off.values())
cw = max(off[m][0] - minx + raw[m].size[0] for m in MOODS) + 2 * PAD
ch = max(off[m][1] - miny + raw[m].size[1] for m in MOODS) + 2 * PAD
heads = {}
for m in MOODS:
    c = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    c.paste(raw[m], (PAD + off[m][0] - minx, PAD + off[m][1] - miny))
    heads[m] = c
okx, oky = PAD + off['ok'][0] - minx, PAD + off['ok'][1] - miny      # where the ok head's own box starts on the canvas

# ---------- all of him, trimmed ----------
bb = fig.split()[3].point(lambda v: 255 if v > 40 else 0).getbbox()
M = 6
bb = (max(0, bb[0] - M), max(0, bb[1] - M), min(fig.size[0], bb[2] + M), min(fig.size[1], bb[3] + M))
body = fig.crop(bb)
bw, bh = body.size

sizes = {'bro.webp': webp(body, os.path.join(EX, 'bro.webp'))}
for m in MOODS:
    sizes['bro-head-%s.webp' % m] = webp(heads[m], os.path.join(EX, 'bro-head-%s.webp' % m))

# ---------- where things go in the drawing's box ----------
# The box is the old one (-14 -14 908 1116: the figure stood in 0..880 by 0..1088), so he takes the same room on
# every page: he is fitted into that room standing on the same floor.
k = min(880.0 / bw, 1088.0 / bh)
fx, fy, fw, fh = (880 - bw * k) / 2, 1088 - bh * k, bw * k, bh * k
s = FIT['scale']
# the head canvas on the figure: the ok head's own box goes to FIT, the canvas round it follows
hx = fx + (FIT['x'] - okx * s - bb[0]) * k
hy = fy + (FIT['y'] - oky * s - bb[1]) * k
hw, hh = cw * s * k, ch * s * k
# the head on its own: the old head's box was 489 x 555
k2 = min(481.0 / cw, 547.0 / ch)
ox, oy, ow, oh = (489 - cw * k2) / 2, (555 - ch * k2) / 2, cw * k2, ch * k2


def n(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def steam(cx, top, u):
    pts = [(-150, 30, 24), (-188, -16, 17), (150, 30, 24), (188, -16, 17)]
    return '<g class="x-steam">' + ''.join('<circle cx="%s" cy="%s" r="%s"/>' % (n(cx + dx * u), n(top + dy * u), n(r * u)) for dx, dy, r in pts) + '</g>'


def img(name, x, y, w, h, cls=''):
    return '<image%s href="assets/examiner/%s?v=%s" x="%s" y="%s" width="%s" height="%s"/>' % (' class="%s"' % cls if cls else '', name, VER, n(x), n(y), n(w), n(h))


SVG = ('<svg class="tch" xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 908 1116" aria-hidden="true" focusable="false">' +
       steam(hx + hw / 2, hy, hw / 520.0) + '<g class="tch-body">' + img('bro.webp', fx, fy, fw, fh) +
       ''.join(img('bro-head-%s.webp' % m, hx, hy, hw, hh, 'tch-m tch-m--' + m) for m in MOODS[1:]) + '</g></svg>')
HEAD = ('<svg class="tch tch--head" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489 555" aria-hidden="true" focusable="false">' +
        steam(ox + ow / 2, oy, ow / 520.0) + '<g class="tch-body">' +
        ''.join(img('bro-head-%s.webp' % m, ox, oy, ow, oh, 'tch-m tch-m--' + m) for m in MOODS) + '</g></svg>')

CSS = ''.join([
    'svg.tch{display:block;width:100%;height:100%;overflow:visible}',
    'svg.tch.tch--right{scale:-1 1}',
    # the mood: on the whole figure a mood's head is laid over his own; on the head alone exactly one head shows
    'svg.tch .tch-m{display:none}',
    'svg.tch.tch--head .tch-m--ok{display:inline}',
] + ['[data-mood="%s"] svg.tch .tch-m--%s{display:inline}[data-mood="%s"] svg.tch.tch--head .tch-m--ok{display:none}' % (m, m, m) for m in MOODS[1:]] + [
    'svg.tch .x-steam{display:none;fill:#E8EEFA}[data-mood="furious"] svg.tch .x-steam{display:inline}',
    # waiting he breathes; talking he rocks a little on his feet (the head alone nods)
    '.tch-body{transform-box:view-box;transform-origin:440px 1100px;animation:tchBreathe 3.6s ease-in-out infinite}',
    '.tch--head .tch-body{transform-origin:244px 540px}',
    '@keyframes tchBreathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.008,1.018)}}',
    '.is-talking svg.tch .tch-body{animation:tchTalk .44s ease-in-out infinite}',
    '.is-talking svg.tch.tch--head .tch-body{animation:tchNod .44s ease-in-out infinite}',
    '@keyframes tchTalk{0%,100%{transform:rotate(0deg) scale(1,1)}30%{transform:rotate(-.9deg) scale(1,1.012)}65%{transform:rotate(.6deg) scale(1,.994)}}',
    '@keyframes tchNod{0%,100%{transform:rotate(0deg) translateY(0)}30%{transform:rotate(-2.4deg) translateY(-6px)}65%{transform:rotate(1.6deg) translateY(2px)}}',
    'svg.tch .x-steam circle{transform-box:fill-box;transform-origin:center;animation:tchSteam 1.1s ease-out infinite}',
    'svg.tch .x-steam circle:nth-child(2n){animation-delay:.45s}',
    '@keyframes tchSteam{0%{opacity:0;transform:translateY(40px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-110px) scale(1.4)}}',
    '@media (prefers-reduced-motion:reduce){svg.tch *{animation:none !important}}',
])

JS = '''// The examiner ("bro"): a strict teacher with a pointer stick. Generated by tools/examiner/build_teacher.py from the
// user's own drawings (assets/examiner/src/); do not edit by hand.
// ExamTeacher.svg() is all of him (never cropped), facing right, into the page from its left side;
// ExamTeacher.svg("left") faces left, for the right of the screen. ExamTeacher.head() is just his head.
// He is the drawing itself (pictures in assets/examiner/), with no white edge and nothing behind him. Moods come from
// data-mood on a parent (ok, happy, angry, furious); talking from the class is-talking on a parent.
(function () {
  'use strict';
  var SVG = %s;
  var HEAD = %s;
  var CSS = %s;
  var styled = false;
  function svg(faces) {
    if (!styled && typeof document !== "undefined") {
      styled = true;
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    return faces === 'left' ? SVG : SVG.replace('class="tch"', 'class="tch tch--right"');
  }
  function head(faces) {
    svg();
    return faces === 'left' ? HEAD : HEAD.replace('class="tch tch--head"', 'class="tch tch--head tch--right"');
  }
  window.ExamTeacher = { svg: svg, head: head };
})();
'''


def q(t):
    return "'" + t.replace('\\', '\\\\').replace("'", "\\'") + "'"


open(os.path.join(ROOT, 'examiner-art.js'), 'w', encoding='utf8').write(JS % (q(SVG), q(HEAD), q(CSS)))

# ---------- the logo: his head facing right, in one file (an <img> and a tab icon cannot fetch a second file) ----------
lw = 256
logo = heads['ok'].resize((lw, int(round(ch * lw / float(cw)))), Image.LANCZOS)
buf = io.BytesIO()
logo.save(buf, 'WEBP', lossless=True, quality=100, method=6)
k3 = min(481.0 / lw, 547.0 / logo.size[1])
lx, ly = (489 - lw * k3) / 2, (555 - logo.size[1] * k3) / 2
open(os.path.join(EX, 'teacher-head.svg'), 'w', encoding='utf8').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489 555" width="489" height="555"><g transform="translate(489 0) scale(-1 1)">'
    '<image href="data:image/webp;base64,%s" x="%s" y="%s" width="%s" height="%s"/></g></svg>\n'
    % (base64.b64encode(buf.getvalue()).decode('ascii'), n(lx), n(ly), n(lw * k3), n(logo.size[1] * k3)))

# ---------- the tab icon: a square his head fills ----------
ih = raw['ok']
iw_, ih_ = ih.size
ik = 100.0 / max(iw_, ih_ - ICON_CUT)
small = ih.resize((192, int(round(ih_ * 192.0 / iw_))), Image.LANCZOS)
buf = io.BytesIO()
small.save(buf, 'WEBP', lossless=True, quality=100, method=6)
open(os.path.join(EX, 'bro-icon.svg'), 'w', encoding='utf8').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><g transform="translate(100 0) scale(-1 1)">'
    '<image href="data:image/webp;base64,%s" x="%s" y="%s" width="%s" height="%s"/></g></svg>\n'
    % (base64.b64encode(buf.getvalue()).decode('ascii'), n((100 - iw_ * ik) / 2), n(100 - ih_ * ik), n(iw_ * ik), n(ih_ * ik)))

print('figure %dx%d, heads %dx%d (moved to match ok: %s)' % (bw, bh, cw, ch, {m: off[m] for m in MOODS[1:]}))
print('files:', ', '.join('%s %d KB' % (f, round(v / 1024.0)) for f, v in sizes.items()), '| logo %d KB' % round(os.path.getsize(os.path.join(EX, 'teacher-head.svg')) / 1024.0))
print('in the box: figure at %s,%s %sx%s | head over it at %s,%s %sx%s | head alone at %s,%s %sx%s' % tuple(n(v) for v in (fx, fy, fw, fh, hx, hy, hw, hh, ox, oy, ow, oh)))

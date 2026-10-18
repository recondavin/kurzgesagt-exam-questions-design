"""Builds mini-games-art.js: the pictures for the mini games.

Chain reaction: one flat, side-on picture (400 x 300) per chain, in the Draw it palette, keyed by the
chain's title. The picture builds up as the steps go into place, from the first step on:
  data-step="k"   appears once steps 1 to k+1 are all in place;
  data-until="k"  disappears at that point (where the picture changes, like flat layers being folded);
  data-live="k"   starts its CSS animation then (class x-sway: rocks gently, like a building in a quake);
  data-badge="k"  the step's number on the picture, next to the part it explains (it pops in with class x-pop).
Be the examiner: the students' faces (100 x 100). Moods are groups m-wait, m-happy, m-upset and m-smug.
Swap any svg for your own art, keeping those attributes. Run: python3 tools/mini_games/build_game_art.py
"""
import json, math, os

W, H = 400, 300
INK = '#14243B'
BG = '#E3F5FC'
SEA, SEAL = '#4FC3E8', '#A8E4F5'
LAND = '#83C468'
ROCK, ROCKL = '#6B2D3A', '#5B3A5E'
MTN, MTN2, SNOW = '#6B2D4A', '#8C4A55', '#FDF7E8'
SAND, SANDL, MUD, PALE, REDR, GREY = '#E9C46A', '#A9822F', '#A48A6A', '#DCD5C3', '#C4683F', '#6E6676'
PURP, DARK, DEEP = '#5B3172', '#241428', '#3E2154'
ORANGE, ORL, YEL = '#E8551F', '#F5A03C', '#FFC42E'
LIME, LIMEL = '#C9C3B5', '#9C9484'
GREEN = '#2BC46F'


_defs = []


def step(k, body, extra=''):
    return f'<g data-step="{k}"{extra}>{body}</g>'


def until(k, body):
    return f'<g data-until="{k}">{body}</g>'


def badge(k, x, y, gone=None):
    # gone: the step whose change removes what this number points at.
    hide = f' data-until="{gone}"' if gone is not None else ''
    return (f'<g data-badge="{k}"{hide}><g transform="translate({x} {y})"><g class="x-pop"><circle r="11" fill="{INK}" stroke="#FFFFFF" stroke-width="2.2"/>'
            f'<text y="1" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" '
            f'font-size="13" fill="#FFFFFF">{k + 1}</text></g></g></g>')


def svg(title, desc, body, view=f'0 0 {W} {H}'):
    defs = f'<defs>{"".join(_defs)}</defs>' if _defs else ''
    _defs.clear()
    return (f'<svg viewBox="{view}" role="img" xmlns="http://www.w3.org/2000/svg"><title>{title}</title><desc>{desc}</desc>'
            + defs + body + '</svg>')


def wave(y, x0=0, x1=W, amp=5, seg=30):
    d = f'M{x0} {y}Q{x0 + seg / 2} {y - amp} {x0 + seg} {y}'
    x = x0 + seg
    while x + seg <= x1:
        x += seg
        d += f'T{x} {y}'
    if x < x1:
        d += f'L{x1} {y}'
    return d


def sea(y, bottom, x0=0, x1=W):
    return (f'<path d="{wave(y, x0, x1)}V{bottom}H{x0}Z" fill="{SEA}"/>'
            f'<path d="{wave(y, x0, x1)}" fill="none" stroke="{SEAL}" stroke-width="3"/>')


def ground(y, deep=ROCK, top=LAND, lines=True):
    g = f'<rect y="{y}" width="{W}" height="{H - y}" fill="{deep}"/><rect y="{y - 6}" width="{W}" height="8" fill="{top}"/>'
    if lines:
        g += ''.join(f'<path d="M0 {ly}Q50 {ly - 4} 100 {ly}T200 {ly}T300 {ly}T400 {ly}" fill="none" stroke="{ROCKL}" stroke-width="1.6"/>'
                     for ly in range(y + 26, H, 28))
    return g


def cloud(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})"><ellipse cx="0" cy="0" rx="24" ry="10" fill="{SNOW}"/>'
            f'<ellipse cx="-11" cy="-7" rx="13" ry="9" fill="{SNOW}"/><ellipse cx="9" cy="-8" rx="12" ry="9" fill="{SNOW}"/></g>')


def rain(xs, y, drop=20, dur=1.1):
    return ''.join(f'<path d="M{x} {y}v7" stroke="#45C4EE" stroke-width="2" stroke-linecap="round">'
                   f'<animateTransform attributeName="transform" type="translate" values="0 0;0 {drop}" dur="{dur}s" begin="{k * .27:.2f}s" repeatCount="indefinite"/>'
                   f'<animate attributeName="opacity" values="1;0" dur="{dur}s" begin="{k * .27:.2f}s" repeatCount="indefinite"/></path>'
                   for k, x in enumerate(xs))


def fall(cx, cy, r, fill, dur, begin, drop=26):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}">'
            f'<animate attributeName="cy" values="{cy};{cy + drop}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.8;1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></circle>')


def rise(cx, cy, r, fill, stroke, dur, begin, up):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.2">'
            f'<animate attributeName="cy" values="{cy};{cy - up}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></circle>')


def shell(x, y, s=1.0, fill='#FDF7E8', line='#B8AE96'):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-7 0Q-7 -9 0 -9Q7 -9 7 0Z" fill="{fill}" stroke="{line}" stroke-width="1.2"/>'
            f'<path d="M0 0V-8M-3.5 0L-5 -7M3.5 0L5 -7" stroke="{line}" stroke-width="1"/><rect x="-2.5" y="0" width="5" height="2" fill="{line}"/></g>')


def arrow(x1, y1, x2, y2, color, width=5):
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 12 * math.cos(a), y2 - 12 * math.sin(a)
    px, py = -math.sin(a) * 8, math.cos(a) * 8
    return (f'<path d="M{x1} {y1}L{hx:.1f} {hy:.1f}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
            f'<path d="M{x2} {y2}L{hx + px:.1f} {hy + py:.1f}L{hx - px:.1f} {hy - py:.1f}Z" fill="{color}"/>')


def arrow_down(x, y1, y2, fill, w=10):
    return f'<path d="M{x - w / 2} {y1}H{x + w / 2}V{y2 - 9}H{x + w}L{x} {y2}L{x - w} {y2 - 9}H{x - w / 2}Z" fill="{fill}"/>'


def both_ways(x1, x2, y, color, width=4):
    m = (x1 + x2) / 2
    return arrow(m, y, x1, y, color, width) + arrow(m, y, x2, y, color, width)


def zoom(cx, cy, r, inner, cid, to=None):
    """A magnifying circle showing a close-up; `to` is the point it looks at."""
    g = ''
    if to:
        a = math.atan2(to[1] - cy, to[0] - cx)
        g += (f'<path d="M{cx + r * math.cos(a):.1f} {cy + r * math.sin(a):.1f}L{to[0]} {to[1]}" stroke="{INK}" stroke-width="1.8" stroke-dasharray="4 4"/>'
              f'<circle cx="{to[0]}" cy="{to[1]}" r="3" fill="{INK}" stroke="#FFFFFF" stroke-width="1.2"/>')
    _defs.append(f'<clipPath id="{cid}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>')
    g += f'<g clip-path="url(#{cid})">{inner}</g>'
    g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFFFFF" stroke-width="5"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{INK}" stroke-width="2.4"/>'
    return g


def grains(cx, cy, r, fill, coat, coat_w, cement=None):
    """Packed sand grains filling a zoom circle, with an optional cement between them."""
    g = f'<rect x="{cx - r}" y="{cy - r}" width="{2 * r}" height="{2 * r}" fill="{cement or SEA}"/>'
    for row in range(-3, 4):
        for col in range(-3, 4):
            x = cx + col * 17 + (row % 2) * 8.5
            y = cy + row * 13
            g += f'<ellipse cx="{x:.1f}" cy="{y}" rx="8" ry="6.2" fill="{fill}" stroke="{coat}" stroke-width="{coat_w}"/>'
    return g


def band_paths(bounds, colors, x0=0, x1=W, dx=8):
    """Rock layers between curves: bounds[i](x) is the top of layer i, bounds[i + 1](x) its bottom."""
    xs = list(range(x0, x1 + 1, dx))
    out = ''
    for i, c in enumerate(colors):
        top = [(x, bounds[i](x)) for x in xs]
        bot = [(x, bounds[i + 1](x)) for x in reversed(xs)]
        d = 'M' + 'L'.join(f'{x} {y:.1f}' for x, y in top + bot) + 'Z'
        out += f'<path d="{d}" fill="{c}"/>'
        out += '<path d="M' + 'L'.join(f'{x} {y:.1f}' for x, y in top) + f'" fill="none" stroke="{DEEP}" stroke-width="1.3"/>'
    return out


def person(x, y, shirt, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})"><rect x="-6" y="-24" width="12" height="16" rx="5" fill="{shirt}"/>'
            f'<rect x="-5" y="-10" width="4" height="10" rx="2" fill="{INK}"/><rect x="1" y="-10" width="4" height="10" rx="2" fill="{INK}"/>'
            f'<circle cx="0" cy="-30" r="6" fill="#F2C9A0" stroke="#7A4A35" stroke-width="1.2"/></g>')


def star(cx, cy, r1, r2, n, fill):
    pts = []
    for k in range(n * 2):
        r = r1 if k % 2 == 0 else r2
        a = math.pi * k / n - math.pi / 2
        pts.append(f'{cx + r * math.cos(a):.1f} {cy + r * math.sin(a):.1f}')
    return f'<path d="M{"L".join(pts)}Z" fill="{fill}"/>'


def rings(cx, cy, color, width, dur, to, n=3, clip=None):
    g = ''
    for k in range(n):
        b = f'{k * dur / n:.2f}s'
        g += (f'<circle cx="{cx}" cy="{cy}" r="6" fill="none" stroke="{color}" stroke-width="{width}">'
              f'<animate attributeName="r" values="6;{to}" dur="{dur}s" begin="{b}" repeatCount="indefinite"/>'
              f'<animate attributeName="opacity" values="1;0" dur="{dur}s" begin="{b}" repeatCount="indefinite"/></circle>')
    return f'<g clip-path="url(#{clip})">{g}</g>' if clip else g


# ---------------------------------------------------------------- 3B: sedimentary rocks
def coast_x(y):
    # The coast slopes from (208, 200) down to the sea bed at (242, 282).
    return 208 + (y - 200) * 34 / 82


def sandstone():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>'
    b += sea(196, 282, 200, W)
    b += f'<rect y="282" width="{W}" height="18" fill="{GREY}"/>'
    b += f'<path d="M0 198H208L242 282V300H0Z" fill="{ROCK}"/><path d="M0 190H206L211 200H0Z" fill="{LAND}"/>'
    b += f'<path d="M0 230Q50 226 100 230T200 230M0 262Q60 258 120 262T224 262" fill="none" stroke="{ROCKL}" stroke-width="1.6"/>'
    b += (f'<path d="M0 192V104L34 76L70 30L104 70L140 116L176 160L206 192Z" fill="{MTN}"/>'
          f'<path d="M70 30L104 70L140 116L176 160L206 192H158L118 132L86 80Z" fill="{MTN2}"/>'
          f'<path d="M70 30L86 48L78 54L70 46L60 56L54 48Z" fill="{SNOW}"/>')
    # 1 Weathering: rain and frost on the peak; the rock cracks and breaks into pieces.
    s0 = cloud(52, 22) + rain([40, 50, 60, 70], 36)
    s0 += f'<g stroke="{SNOW}" stroke-width="1.6" stroke-linecap="round"><path d="M88 52l6 6M94 52l-6 6M91 50v10"/><path d="M58 70l6 6M64 70l-6 6M61 68v10"/></g>'
    s0 += f'<path d="M80 60l6 8-4 7 5 6M96 84l-5 7 4 6" fill="none" stroke="{DARK}" stroke-width="1.6" stroke-linecap="round"/>'
    s0 += f'<path d="M112 98l7-3 3 6-7 2zM124 112l6-2 2 5-6 2zM104 112l5-1 1 4-5 1z" fill="{ROCKL}"/>'
    b += step(0, s0)
    # 2 Transport: a river carries the grains down to the sea.
    river = 'M100 68Q114 94 130 112T162 150T192 178T222 198'
    s1 = (f'<path d="{river}" fill="none" stroke="{SEA}" stroke-width="8" stroke-linecap="round"/>'
          f'<path d="{river}" fill="none" stroke="{SEAL}" stroke-width="2" stroke-dasharray="6 12" stroke-linecap="round">'
          '<animate attributeName="stroke-dashoffset" values="0;-36" dur="2.4s" repeatCount="indefinite"/></path>')
    for k, c in enumerate([SAND, MUD, SAND]):
        s1 += f'<circle r="2.6" fill="{c}"><animateMotion path="{river}" dur="3.6s" begin="{k * 1.2}s" repeatCount="indefinite"/></circle>'
    b += step(1, s1)
    # 3 Deposition: the river slows at the sea and drops its sand.
    s2 = f'<path d="M216 198Q246 198 270 210Q246 214 222 206Z" fill="{SAND}"/>'
    s2 += ''.join(fall(x, y, 2.6, c, 3.6, bg, 30) for x, y, c, bg in [(240, 206, SAND, 0), (262, 212, MUD, 1.2), (284, 208, SAND, 2.4), (304, 214, MUD, .6)])
    b += step(2, s2)
    # 4 Layers (strata) build up on the sea bed, oldest at the bottom.
    s3 = ''
    for k, (y1, y2, c) in enumerate([(268, 282, MUD), (254, 268, SAND), (240, 254, PALE)]):
        s3 += f'<path d="M{coast_x(y1):.1f} {y1}H{W}V{y2}H{coast_x(y2):.1f}Z" fill="{c}"/><path d="M{coast_x(y1):.1f} {y1}H{W}" stroke="{DEEP}" stroke-width="1.3"/>'
    b += step(3, s3)
    # 5 Compaction: the weight of the new layers squeezes the ones below.
    b += step(4, ''.join(arrow_down(x, 206, 236, PURP, 8) for x in (300, 336, 372)))
    # 6 Cementation: a close-up of the grains glued by minerals.
    b += step(5, zoom(318, 96, 40, grains(318, 96, 40, SAND, SANDL, 1.4, ORL), 'ga-sand-z', (300, 262)))
    b += badge(0, 98, 22) + badge(1, 178, 136) + badge(2, 240, 230) + badge(3, 386, 232) + badge(4, 372, 196) + badge(5, 366, 66)
    return svg('How sandstone forms', 'Rain and frost break up the rock of a mountain. A river carries the sand grains to the sea, slows down and drops them. Layers build up on the sea bed, the weight of new layers squeezes them, and minerals glue the grains together into sandstone.', b)


def limestone():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>'
    b += sea(44, 250)
    b += f'<rect y="250" width="{W}" height="50" fill="{GREY}"/><path d="M0 272Q50 268 100 272T200 272T300 272T400 272" fill="none" stroke="#5A5262" stroke-width="1.6"/>'
    # 1 Sea creatures in a warm, shallow sea.
    s0 = f'<circle cx="360" cy="20" r="13" fill="{YEL}"/>'
    s0 += (f'<path d="M50 250V214M50 226L38 208M50 222L64 202M64 202V192M38 208V198M76 250V222M76 232L88 214M88 214V204" stroke="{ORANGE}" stroke-width="5" stroke-linecap="round" fill="none"/>'
           f'<path d="M330 250V226M330 234L320 220M330 230L342 214M356 250V228M356 236L366 222" stroke="{ORL}" stroke-width="5" stroke-linecap="round" fill="none"/>')
    s0 += shell(116, 248, 1.1) + shell(290, 249, 1.1)
    for fx, fy, d, bg in [(140, 96, 46, 0), (250, 150, -40, 1.5)]:
        flip = '' if d > 0 else ' scale(-1 1)'
        s0 += (f'<g><animateTransform attributeName="transform" type="translate" values="0 0;{d} 0;0 0" dur="9s" begin="{bg}s" repeatCount="indefinite"/>'
               f'<g transform="translate({fx} {fy}){flip}"><path d="M0 0q10 -8 22 0q-12 8 -22 0z" fill="{YEL}"/><path d="M0 0l-7 -5v10z" fill="{YEL}"/><circle cx="15" cy="-1" r="1.6" fill="{INK}"/></g></g>')
    b += step(0, s0)
    # 2 They die and their shells sink.
    s1 = ''
    for x, y, bg in [(176, 100, 0), (206, 124, 1.7), (232, 96, 3.2)]:
        s1 += (f'<g><animateTransform attributeName="transform" type="translate" values="0 0;0 70" dur="5s" begin="{bg}s" repeatCount="indefinite"/>'
               f'{shell(x, y, .9)}<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="5s" begin="{bg}s" repeatCount="indefinite"/></g>')
    b += step(1, s1)
    # 3 The shells pile up on the sea floor.
    s2 = f'<rect y="236" width="{W}" height="14" fill="#E8E0CC"/><path d="M0 236H{W}" stroke="#B8AE96" stroke-width="1.4"/>'
    s2 += ''.join(shell(x, 248, .75, '#FFFEF8') for x in range(14, W, 30))
    b += step(2, s2)
    # 4 New layers bury and squeeze them.
    s3 = f'<rect y="222" width="{W}" height="14" fill="#D9CFB8"/><rect y="208" width="{W}" height="14" fill="#E8E0CC"/>'
    s3 += f'<path d="M0 208H{W}M0 222H{W}" stroke="#B8AE96" stroke-width="1.4"/>' + ''.join(shell(x, 220, .6, '#FFFEF8') for x in range(30, W, 46))
    s3 += ''.join(arrow_down(x, 150, 200, PURP, 8) for x in (150, 196, 242))
    b += step(3, s3)
    # 5 Calcium carbonate cements the lower layers into limestone.
    s4 = f'<rect y="236" width="{W}" height="64" fill="{LIME}"/><path d="M0 236H{W}M0 258H{W}M0 280H{W}" stroke="{LIMEL}" stroke-width="1.6"/>'
    s4 += f'<path d="M80 236v22M230 258v22M350 236v22M150 280v20M300 280v20" stroke="{LIMEL}" stroke-width="1.4"/>'
    b += step(4, s4)
    # 6 Fossils of the shells and coral stay in the rock.
    s5 = (f'<g fill="none" stroke="#544C40" stroke-width="2.4" stroke-linecap="round"><path d="M318 274a9 9 0 1 1 -9 -9a6 6 0 1 1 6 6a3 3 0 1 1 -3 -3"/>'
          '<path d="M112 266q8 -12 16 0q-8 6 -16 0M120 258v14"/><path d="M200 292q6 -9 12 0z"/><path d="M40 288v-10M40 282l-6 -6M40 280l6 -6"/></g>')
    b += step(5, s5)
    b += badge(0, 112, 70) + badge(1, 256, 104) + badge(2, 22, 222) + badge(3, 272, 168) + badge(4, 372, 252) + badge(5, 340, 284)
    return svg('How limestone forms', 'Sea creatures and coral live in a warm, shallow sea. When they die their shells sink and pile up on the sea floor. New layers bury and squeeze them, calcium carbonate cements them into limestone, and fossils of the shells stay in the rock.', b)


def old_red():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>'
    b += f'<rect y="236" width="{W}" height="64" fill="{ROCK}"/><rect y="230" width="{W}" height="8" fill="#B9A06E"/>'
    b += f'<path d="M0 270Q50 266 100 270T200 270T300 270T400 270" fill="none" stroke="{ROCKL}" stroke-width="1.6"/>'
    # 1 Ireland lay in a hot desert.
    s0 = f'<rect width="{W}" height="231" fill="#FCEBC8"/>'
    s0 += f'<circle cx="352" cy="44" r="20" fill="{YEL}"/>' + ''.join(
        f'<path d="M{352 + 27 * math.cos(a):.1f} {44 + 27 * math.sin(a):.1f}L{352 + 35 * math.cos(a):.1f} {44 + 35 * math.sin(a):.1f}" stroke="{YEL}" stroke-width="3" stroke-linecap="round"/>'
        for a in [k * math.pi / 4 for k in range(8)])
    s0 += f'<path d="M0 232Q40 206 90 226T200 222T300 228T400 216V234H0Z" fill="#F2D58B"/>'
    for k, (x, y) in enumerate([(70, 180), (250, 176)]):
        s0 += (f'<path d="M{x} {y}q8 -5 16 0t16 0M{x + 6} {y + 10}q8 -5 16 0t16 0" fill="none" stroke="{ORL}" stroke-width="2" stroke-linecap="round">'
               f'<animate attributeName="opacity" values=".2;1;.2" dur="2.4s" begin="{k * 1.2}s" repeatCount="indefinite"/></path>')
    b += step(0, s0)
    # 2 Rivers dropped sand in desert basins.
    river = 'M40 178Q70 200 100 212T158 234'
    s1 = f'<path d="M0 234V160Q26 140 54 160T98 196L118 234Z" fill="{MTN2}"/>'
    s1 += f'<path d="M150 236Q226 268 300 236Z" fill="{SAND}"/>'
    s1 += (f'<path d="{river}" fill="none" stroke="{SEA}" stroke-width="6" stroke-linecap="round"/>'
           f'<path d="{river}" fill="none" stroke="{SEAL}" stroke-width="2" stroke-dasharray="6 12" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="0;-36" dur="2.4s" repeatCount="indefinite"/></path>')
    s1 += ''.join(fall(x, 212, 2.4, SAND, 3, bg, 22) for x, bg in [(176, 0), (198, 1), (220, 2)])
    b += step(1, s1)
    # 3 Iron in the sand rusted, staining it red.
    s2 = f'<path d="M150 236Q226 268 300 236Z" fill="{REDR}"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="1.6" fill="#A9542F"/>' for x, y in [(180, 242), (204, 250), (230, 246), (256, 252), (278, 242), (216, 240)])
    s2 += zoom(320, 132, 32, grains(320, 132, 32, SAND, '#B5442A', 3.4, '#F2D58B'), 'ga-ors-z', (262, 246))
    b += step(2, s2)
    # 4 The sand was compacted and cemented.
    s3 = ''.join(arrow_down(x, 168, 222, PURP, 8) for x in (190, 226))
    s3 += f'<path d="M168 242Q226 262 284 242M184 250Q226 264 268 250" fill="none" stroke="#8E3A22" stroke-width="1.6"/>'
    b += step(3, s3)
    # 5 Old Red Sandstone, about 400 million years ago.
    s4 = (f'<path d="M226 258L226 272" stroke="{INK}" stroke-width="1.6"/><circle cx="226" cy="258" r="3" fill="{INK}" stroke="#FFFFFF" stroke-width="1.2"/>'
          f'<rect x="6" y="272" width="294" height="22" rx="11" fill="{INK}" stroke="#FFFFFF" stroke-width="1.5"/>'
          f'<text x="153" y="283" text-anchor="middle" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11.5" fill="#FFFFFF">OLD RED SANDSTONE: 400 MILLION YEARS AGO</text>')
    b += step(4, s4)
    b += badge(0, 320, 24) + badge(1, 120, 190) + badge(2, 356, 104) + badge(3, 162, 176) + badge(4, 316, 283)
    return svg('Old Red Sandstone', 'About 400 million years ago Ireland lay in a hot desert. Rivers dropped sand in desert basins, iron in the sand rusted and stained it red, and the sand was compacted and cemented into Old Red Sandstone.', b)


def bump(x, c=200, w=80):
    return math.exp(-((x - c) / w) ** 2)


def curve(f, x0=0, x1=W, dx=8):
    return 'L'.join(f'{x} {f(x):.1f}' for x in range(x0, x1 + 1, dx))


def uplift():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>'
    colors = [SAND, MUD, PALE, REDR]
    flat = [232, 242, 252, 262]
    # Older rock layers lie under the new ones, all the way down.
    old = ['#8E8697', GREY] * 5
    b += until(2, ''.join(f'<rect y="{272 + k * 10}" width="{W}" height="10" fill="{c}"/>' for k, c in enumerate(old[:3])))
    # 1 Sediment settles on the sea bed in flat, loose layers.
    sea_g = sea(80, 262) + ''.join(fall(x, 120, 2.6, c, 4.5, bg, 60) for x, c, bg in [(110, SAND, 0), (190, MUD, 1.5), (270, SAND, 3), (330, MUD, .8)])
    loose = ''.join(f'<rect y="{y}" width="{W}" height="10" fill="{c}" opacity=".8"/>'
                    + ''.join(f'<circle cx="{x}" cy="{y + 5}" r="1.6" fill="{DEEP}" opacity=".35"/>' for x in range(10 + k * 7, W, 26))
                    for k, (y, c) in enumerate(zip(flat, colors)))
    b += step(0, until(3, sea_g) + until(1, loose))
    # 2 The layers are compacted and cemented into rock.
    b += step(1, until(2, ''.join(f'<rect y="{y}" width="{W}" height="10" fill="{c}"/><path d="M0 {y}H{W}" stroke="{DEEP}" stroke-width="1.3"/>' for y, c in zip(flat, colors))))
    # 3 Plates collide and fold the layers, still under the sea.
    fb = [lambda x, y0=y0: y0 - 46 * bump(x) for y0 in range(232, 352, 10)]
    b += step(2, until(3, band_paths(fb, colors + old[:7])))
    # 4 The folded rock is pushed up above sea level.
    ub = [lambda x, y0=y0: y0 - 168 * bump(x, 200, 84) for y0 in range(246, 246 + 14 * 17, 14)]
    rock = band_paths(ub, colors + old[:10] + [GREY, '#8E8697'])
    b += step(3, until(4, rock + f'<path d="M{curve(ub[0])}" fill="none" stroke="{LAND}" stroke-width="6"/>' + sea(244, 300, 344, W)))
    # 5 Weathering and erosion wear the top away, so the folded layers show at the surface.
    top = lambda x: 246 - 142 * bump(x, 200, 100)
    _defs.append(f'<clipPath id="ga-up-cut"><path d="M{curve(top)}V300H0Z"/></clipPath>')
    eroded = f'<g clip-path="url(#ga-up-cut)">{rock}</g>'
    eroded += f'<path d="M{curve(top, 0, 96)}M{curve(top, 304, W)}" fill="none" stroke="{LAND}" stroke-width="6"/>'
    eroded += sea(244, 300, 344, W) + cloud(118, 36) + rain([106, 116, 126, 136], 50, 26)
    eroded += f'<path d="M146 {top(146) + 6:.1f}l6-3 3 5-6 2zM252 {top(252) + 5:.1f}l6-2 2 5-6 2z" fill="{ROCKL}"/>'
    b += step(4, eroded)
    b += step(2, arrow(14, 214, 64, 214, YEL, 6) + arrow(386, 214, 336, 214, YEL, 6))
    b += badge(0, 30, 110, 3) + badge(1, 30, 220, 2) + badge(2, 54, 182) + badge(3, 330, 150) + badge(4, 160, 26)
    return svg('From sea bed to mountain', 'Sediment settles on the sea bed in flat layers, which are compacted and cemented into rock. Plates collide and fold the layers, push them up above sea level into mountains, and weathering and erosion wear the top away so the folded layers show at the surface.', b)


# ---------------------------------------------------------------- 3C: earthquakes
QLINE = '#B0707A'


def fault_x(y, top=92, x_top=226, x_bot=176):
    return x_top - (y - top) * (x_top - x_bot) / (300 - top)


def quake():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/><defs><clipPath id="ga-q-ground"><rect y="96" width="{W}" height="{H - 96}"/></clipPath></defs>'
    b += ground(96, lines=False)
    b += f'<path d="M226 92L176 300" stroke="{DARK}" stroke-width="2.4"/>'
    levels = [140, 180, 220, 260]
    straight = ''.join(f'<path d="M0 {y}H{W}" stroke="{QLINE}" stroke-width="2.6"/>' for y in levels)
    b += until(2, straight)
    house = (f'<g transform="translate(310 88)"><path d="M-16 0V-18L0 -30L16 -18V0Z" fill="{SNOW}" stroke="{INK}" stroke-width="1.6"/>'
             f'<path d="M-20 -16L0 -33L20 -16" fill="none" stroke="{ORANGE}" stroke-width="4" stroke-linecap="round"/><rect x="-4" y="-11" width="8" height="11" fill="{ROCK}"/></g>')
    b += house
    # 1 The plates push against each other.
    b += step(0, arrow(20, 200, 96, 200, YEL, 6) + arrow(380, 200, 304, 200, YEL, 6))
    # 2 Friction locks them together at the fault.
    teeth = 'M226 92' + ''.join(f'L{fault_x(y) + (6 if k % 2 else -6):.1f} {y}' for k, y in enumerate(range(104, 300, 12))) + 'L176 300'
    lock = (f'<g transform="translate({fault_x(166):.1f} 166)"><path d="M-6 -4V-10A6 6 0 0 1 6 -10V-4" fill="none" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="-10" y="-4" width="20" height="15" rx="3" fill="{YEL}" stroke="{INK}" stroke-width="2"/><circle cx="0" cy="3" r="2.2" fill="{INK}"/></g>')
    b += step(1, until(3, f'<path d="{teeth}" fill="none" stroke="{DARK}" stroke-width="3.4" stroke-linejoin="round"/>' + lock))
    # 3 Stress builds up: the layers bend next to the locked fault.
    bent = ''
    for y in levels:
        xf = fault_x(y)
        bent += (f'<path d="M0 {y}H{xf - 46:.1f}Q{xf - 12:.1f} {y} {xf - 3:.1f} {y - 12}" fill="none" stroke="{QLINE}" stroke-width="2.6"/>'
                 f'<path d="M{xf + 3:.1f} {y + 12}Q{xf + 12:.1f} {y} {xf + 46:.1f} {y}H{W}" fill="none" stroke="{QLINE}" stroke-width="2.6"/>')
    stress = ''.join(f'<path d="M{fault_x(y) - 14:.1f} {y}l6 -5 4 6 6 -5 4 6 6 -5" fill="none" stroke="{ORANGE}" stroke-width="2.2" stroke-linecap="round">'
                     f'<animate attributeName="opacity" values=".25;1;.25" dur="1.6s" begin="{k * .4}s" repeatCount="indefinite"/></path>' for k, y in enumerate([130, 200, 250]))
    b += step(2, until(3, bent + stress))
    # 4 The rocks snap and slip: the layers are now offset across the fault.
    slip = ''
    for y in levels:
        slip += f'<path d="M0 {y}H{fault_x(y):.1f}" stroke="{QLINE}" stroke-width="2.6"/><path d="M{fault_x(y + 16):.1f} {y + 16}H{W}" stroke="{QLINE}" stroke-width="2.6"/>'
    fx, fy = fault_x(230), 230
    slip += star(fx, fy, 16, 7, 8, ORANGE) + star(fx, fy, 8, 4, 8, YEL)
    slip += f'<path d="M{fx + 6:.1f} {fy - 18}l6 -8 -2 -6M{fx - 10:.1f} {fy + 16}l-8 6 2 7" fill="none" stroke="{DARK}" stroke-width="1.8" stroke-linecap="round"/>'
    b += step(3, slip)
    # 5 The energy travels out as seismic waves; the surface above the focus shakes.
    waves = rings(fx, fy, ORANGE, 2.6, 3, 190, 3, 'ga-q-ground')
    waves += f'<g transform="translate({fault_x(96) - 30:.1f} 92)"><path d="M0 0C-7 -10 -7 -18 0 -18S7 -10 0 0Z" fill="{ORANGE}" stroke="{INK}" stroke-width="1.4"/><circle cx="0" cy="-12" r="2.6" fill="#FFFFFF"/></g>'
    waves += f'<path d="M290 50q-4 6 0 12M286 46q-7 10 0 20M330 50q4 6 0 12M334 46q7 10 0 20" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round"/>'
    b += step(4, waves)
    b += badge(0, 58, 176) + badge(1, 240, 150) + badge(2, 176, 126) + badge(3, fx + 28, fy + 6) + badge(4, 350, 120)
    return svg('Why an earthquake happens', 'Two plates push against each other, but friction locks them together at the fault, so stress builds up and the rock layers bend. The rocks suddenly snap and slip, and the energy travels out from the focus as seismic waves that shake the surface.', b)


def radon():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>' + ground(112)
    b += f'<path d="M196 106L176 300" stroke="{DARK}" stroke-width="3"/>'
    well = (f'<rect x="296" y="104" width="22" height="160" fill="#9EA4AE"/><rect x="300" y="110" width="14" height="150" fill="{BG}"/>'
            f'<rect x="300" y="210" width="14" height="50" fill="{SEA}"/><rect x="290" y="98" width="34" height="8" rx="2" fill="#9EA4AE"/>')
    b += well
    # 1 Stress builds up along the fault.
    s0 = arrow(30, 276, 110, 276, YEL, 6) + arrow(388, 284, 330, 284, YEL, 6)
    s0 += ''.join(f'<path d="M{176 + (300 - y) * 20 / 194 - 12:.1f} {y}l5 -4 4 5 5 -4 4 5 5 -4" fill="none" stroke="{ORANGE}" stroke-width="2.2" stroke-linecap="round">'
                  f'<animate attributeName="opacity" values=".25;1;.25" dur="1.6s" begin="{k * .5}s" repeatCount="indefinite"/></path>' for k, y in enumerate([150, 210, 262]))
    b += step(0, s0)
    # 2 The rocks start to crack.
    cracks = 'M190 160l16 6 8 12 20 4M186 204l18 4 10 12 24 2 14 10 20 2M182 246l-16 8-8 12M188 180l-18 4-10 10'
    b += step(1, f'<path d="{cracks}" fill="none" stroke="{DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
    # 3 Radon gas escapes up through the cracks.
    gas = ''.join(rise(x, 280, 3.2, '#D9CCF2', '#7E5BA3', 4, bg, 150) for x, bg in [(185, 0), (189, 1.3), (183, 2.6)])
    gas += ''.join(rise(x, y, 2.8, '#D9CCF2', '#7E5BA3', 3, bg, 40) for x, y, bg in [(240, 226, .4), (266, 232, 1.6)])
    b += step(2, gas)
    # 4 Radon levels rise in the well water: the meter climbs.
    meter = ''.join(rise(x, 256, 2.4, '#D9CCF2', '#7E5BA3', 2.4, bg, 44) for x, bg in [(304, 0), (309, .8), (306, 1.6)])
    meter += (f'<path d="M307 98V82" stroke="{INK}" stroke-width="2.4"/><circle cx="307" cy="64" r="20" fill="#FFFFFF" stroke="{INK}" stroke-width="2.4"/>'
              f'<path d="M293 70A15 15 0 0 1 321 70" fill="none" stroke="{GREEN}" stroke-width="4"/><path d="M314 57A15 15 0 0 1 321 70" fill="none" stroke="{ORANGE}" stroke-width="4"/>'
              f'<g transform="translate(307 68)"><path d="M0 0L-1.5 -14L1.5 -14Z" fill="{INK}"><animateTransform attributeName="transform" type="rotate" values="-60;55;40;55" keyTimes="0;.6;.8;1" dur="3s" repeatCount="indefinite"/></path><circle r="2.6" fill="{INK}"/></g>')
    b += step(3, meter)
    # 5 Scientists see the rise and warn people.
    screen = (f'<rect x="40" y="44" width="78" height="54" rx="6" fill="{DEEP}"/><rect x="46" y="50" width="66" height="40" rx="3" fill="#1E3B5A"/>'
              f'<path d="M50 84L62 82L72 83L82 78L92 70L100 58L108 54" fill="none" stroke="{ORANGE}" stroke-width="2.4" stroke-linecap="round"/>'
              f'<rect x="74" y="98" width="10" height="8" fill="{DEEP}"/>')
    sign = (f'<g transform="translate(150 70)"><path d="M0 -20L18 12H-18Z" fill="{YEL}" stroke="{INK}" stroke-width="2.4" stroke-linejoin="round"/>'
            f'<path d="M0 -8V2" stroke="{INK}" stroke-width="3.2" stroke-linecap="round"/><circle cx="0" cy="7" r="1.9" fill="{INK}"/>'
            f'<path d="M24 -14q8 10 0 20M30 -18q12 14 0 28" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite"/></path></g>')
    b += step(4, screen + sign)
    b += badge(0, 70, 252) + badge(1, 254, 168) + badge(2, 214, 132) + badge(3, 346, 44) + badge(4, 30, 30)
    return svg('Radon as a warning sign', 'Stress builds up along a fault and the rocks begin to crack. Radon gas escapes up through the cracks into the water in wells, where a meter shows the level rising, and scientists watching the readings warn people.', b)


def warning():
    b = (f'<rect width="{W}" height="{H}" fill="{BG}"/><defs><clipPath id="ga-w-ground"><rect y="152" width="{W}" height="{H - 152}"/></clipPath></defs>'
         + ground(152))
    fx, fy = 70, 262
    # 1 The earthquake starts deep underground (the focus).
    b += step(0, star(fx, fy, 18, 8, 8, ORANGE) + star(fx, fy, 9, 4, 8, YEL))
    # 2 Sensors pick up the first, faster waves.
    s1 = rings(fx, fy, '#45C4EE', 2.2, 1.6, 150, 3, 'ga-w-ground')
    s1 += (f'<rect x="126" y="130" width="28" height="18" rx="2" fill="{DEEP}"/><path d="M140 130V112" stroke="{DEEP}" stroke-width="2.4"/>'
           f'<circle cx="140" cy="110" r="3.6" fill="{ORANGE}"><animate attributeName="fill" values="{ORANGE};{YEL};{ORANGE}" dur=".8s" repeatCount="indefinite"/></circle>')
    b += step(1, s1)
    # 3 Alerts go out to phones and trains.
    mast = (f'<path d="M196 150L206 76L216 150M199 128H213M202 104H210" fill="none" stroke="{PURP}" stroke-width="3" stroke-linejoin="round"/>'
            f'<circle cx="206" cy="74" r="4" fill="{PURP}"/>')
    mast += ''.join(f'<path d="M{206 + s * r:.0f} {74 - r}q{s * r * .6:.1f} {r:.0f} 0 {2 * r:.0f}" fill="none" stroke="{PURP}" stroke-width="2.2" stroke-linecap="round">'
                    f'<animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="{k * .3:.1f}s" repeatCount="indefinite"/></path>'
                    for k, r in enumerate([10, 17]) for s in (1, -1))
    phone = (f'<g transform="translate(262 50)"><rect x="-13" y="-22" width="26" height="44" rx="5" fill="{INK}"/><rect x="-10" y="-17" width="20" height="32" rx="2" fill="#FFFFFF"/>'
             f'<path d="M0 -10L8 6H-8Z" fill="{YEL}" stroke="{ORANGE}" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -5V1" stroke="{INK}" stroke-width="2"/></g>')
    b += step(2, mast + phone)
    # 4 Trains brake and people take cover.
    train = (f'<rect x="300" y="120" width="96" height="26" rx="6" fill="{ORANGE}"/><path d="M300 126Q300 120 308 120H322V146H300Z" fill="{ORL}"/>'
             + ''.join(f'<rect x="{x}" y="125" width="12" height="9" rx="2" fill="#FFFFFF"/>' for x in (330, 350, 370))
             + ''.join(f'<circle cx="{x}" cy="147" r="4.4" fill="{INK}"/>' for x in (316, 340, 366, 386))
             + f'<path d="M296 150l-8 -5M300 152l-10 1M382 150l8 -5" stroke="{YEL}" stroke-width="2.4" stroke-linecap="round"><animate attributeName="opacity" values="1;.1;1" dur=".5s" repeatCount="indefinite"/></path>')
    house = (f'<path d="M232 148V112L258 94L284 112V148Z" fill="{SNOW}" stroke="{INK}" stroke-width="1.8"/>'
             f'<path d="M240 130H276M244 130V148M272 130V148" stroke="{ROCK}" stroke-width="3.4"/>'
             f'<circle cx="256" cy="139" r="4" fill="#F2C9A0" stroke="#7A4A35" stroke-width="1"/><path d="M250 148q0 -6 6 -6t8 6z" fill="{SEA}"/>')
    b += step(3, train + house)
    # 5 The strong shaking arrives seconds later.
    s4 = rings(fx, fy, ORANGE, 4.2, 3, 300, 3, 'ga-w-ground')
    s4 += f'<path d="M226 104q-5 8 0 16M222 100q-8 12 0 24M290 104q5 8 0 16M294 100q8 12 0 24" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round"/>'
    b += step(4, s4)
    b += badge(0, 104, 270) + badge(1, 112, 112) + badge(2, 236, 30) + badge(3, 338, 104) + badge(4, 168, 220)
    return svg('An early warning system', 'An earthquake starts deep underground. Sensors pick up the first, faster waves and alerts are sent to phones and trains, so trains brake and people take cover before the strong shaking arrives a few seconds later.', b)


def base_isolation():
    b = f'<rect width="{W}" height="{H}" fill="{BG}"/>' + ground(238)
    b += f'<rect x="128" y="238" width="144" height="36" fill="#D3EEF8"/><path d="M128 232V274H272V232" fill="none" stroke="{ROCKL}" stroke-width="3"/>'
    b += f'<rect x="128" y="266" width="144" height="8" fill="#9EA4AE"/>'
    pads = [152, 178, 204, 230]
    b += ''.join(f'<rect x="{x}" y="246" width="18" height="20" rx="3" fill="#B8C2D4"/>' for x in pads)
    building = '<rect x="140" y="238" width="120" height="8" fill="#9EA4AE"/>'
    building += f'<rect x="150" y="70" width="100" height="168" fill="{YEL}"/><rect x="144" y="64" width="112" height="8" rx="2" fill="{ORANGE}"/>'
    floors = [80, 112, 144, 176, 208]
    building += ''.join(f'<rect x="{x}" y="{y + 6}" width="16" height="14" rx="1.5" fill="#45C4EE"/>' for y in floors for x in (162, 192, 222))
    building += '<path d="' + ''.join(f'M150 {y}H250' for y in [104, 136, 168, 200]) + f'" stroke="{ORL}" stroke-width="2"/>'
    building += f'<path d="M150 70V238M250 70V238" stroke="{ORANGE}" stroke-width="4"/>'
    building += f'<path d="M200 64V44" stroke="{INK}" stroke-width="2"/><path d="M200 44h16l-4 5 4 5h-16z" fill="{GREEN}"/>'
    b += f'<g class="x-sway" data-live="3">{building}</g>'
    # 1 The ground shakes.
    s0 = ''
    for x1, x2 in [(16, 100), (300, 384)]:
        s0 += (f'<g><animateTransform attributeName="transform" type="translate" values="-4 0;4 0;-4 0" dur=".7s" repeatCount="indefinite"/>{both_ways(x1, x2, 260, ORANGE, 4)}</g>')
    b += step(0, s0)
    # 2 Rubber pads under the building flex.
    s1 = ''
    for x in pads:
        s1 += (f'<g transform="translate({x} 266)"><g><animateTransform attributeName="transform" type="skewX" values="0;14;0;-14;0" dur="1.4s" repeatCount="indefinite"/>'
               f'<rect x="0" y="-20" width="18" height="20" rx="3" fill="{DARK}"/><path d="M0 -14H18M0 -7H18" stroke="#7E5BA3" stroke-width="2"/></g></g>')
    b += step(1, s1)
    # 3 They absorb most of the movement: big movement below, little above.
    b += step(2, both_ways(120, 280, 288, ORANGE, 6) + both_ways(186, 214, 226, GREEN, 3.4))
    # 4 The building above sways gently (data-live on the building).
    b += step(3, f'<path d="M134 96q-6 10 0 20M128 92q-10 14 0 28M266 96q6 10 0 20M272 92q10 14 0 28" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round"/>')
    # 5 It stays standing and people are safe.
    s4 = person(48, 232, SEA) + person(70, 232, ORANGE, .9) + person(330, 232, GREEN) + person(352, 232, PURP, .85)
    s4 += f'<g transform="translate(300 40)"><circle r="16" fill="{GREEN}"/><path d="M-7 0.5l4.5 4.5 9-9" fill="none" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>'
    b += step(4, s4)
    b += badge(0, 58, 286) + badge(1, 112, 254) + badge(2, 300, 286) + badge(3, 116, 70) + badge(4, 340, 40)
    return svg('A base-isolated building', 'The ground shakes. Rubber pads under the building flex and absorb most of the movement, so the building above only sways gently, stays standing, and the people are safe.', b)


# ---------------------------------------------------------------- Be the examiner: the students
def student(hair_back, hair_front, jumper, extra=''):
    skin, line = '#F2C9A0', '#7A4A35'
    s = hair_back
    s += f'<path d="M12 100Q14 80 36 76H64Q86 80 88 100Z" fill="{jumper}"/><path d="M40 76L50 90L60 76Z" fill="#FFFFFF"/><path d="M48 80h4l2 14h-8z" fill="#B3262B"/>'
    s += f'<rect x="43" y="64" width="14" height="14" fill="{skin}"/>'
    s += f'<g fill="{skin}" stroke="{line}" stroke-width="2"><ellipse cx="24" cy="48" rx="5" ry="7"/><ellipse cx="76" cy="48" rx="5" ry="7"/></g>'
    s += f'<ellipse cx="50" cy="46" rx="26" ry="29" fill="{skin}" stroke="{line}" stroke-width="2.2"/>'
    s += extra + hair_front
    # Moods: waiting (nervous), happy (fairly marked), upset (marked too harshly), smug (marked too kindly).
    s += ('<g class="m-wait"><path d="M34 37q5 -4 10 -1M56 36q5 -3 10 1" fill="none" stroke="#3A2A22" stroke-width="2.4" stroke-linecap="round"/>'
          '<circle cx="42" cy="47" r="3.4" fill="#1E1E24"/><circle cx="62" cy="47" r="3.4" fill="#1E1E24"/>'
          '<path d="M42 62q4 -3 8 0t8 0" fill="none" stroke="#5A2A24" stroke-width="2.4" stroke-linecap="round"/>'
          '<path d="M74 30q4 6 0 9q-4 -3 0 -9z" fill="#7FD8F2" stroke="#2C8FC0" stroke-width="1"/></g>')
    s += ('<g class="m-happy"><path d="M34 37q6 -4 11 -1M55 36q5 -3 11 1" fill="none" stroke="#3A2A22" stroke-width="2.4" stroke-linecap="round"/>'
          '<path d="M36 48q4 -5 8 0M56 48q4 -5 8 0" fill="none" stroke="#1E1E24" stroke-width="2.6" stroke-linecap="round"/>'
          '<path d="M38 58q12 12 24 0z" fill="#5A1E24" stroke="#5A2A24" stroke-width="1.6" stroke-linejoin="round"/><path d="M41 58.5h18l-1 2.5h-16z" fill="#FFFFFF"/>'
          '<ellipse cx="32" cy="56" rx="4" ry="2.4" fill="#F2948C"/><ellipse cx="68" cy="56" rx="4" ry="2.4" fill="#F2948C"/></g>')
    s += ('<g class="m-upset"><path d="M33 34l12 5M67 34l-12 5" fill="none" stroke="#3A2A22" stroke-width="2.8" stroke-linecap="round"/>'
          '<circle cx="40" cy="47" r="3.2" fill="#1E1E24"/><circle cx="60" cy="47" r="3.2" fill="#1E1E24"/>'
          '<path d="M40 64q10 -9 20 0" fill="none" stroke="#5A2A24" stroke-width="2.8" stroke-linecap="round"/>'
          '<path d="M86 10v12M86 27v1" stroke="#E5484D" stroke-width="4" stroke-linecap="round"/></g>')
    s += ('<g class="m-smug"><path d="M34 38q5 -2 10 0M56 32q5 -4 11 0" fill="none" stroke="#3A2A22" stroke-width="2.4" stroke-linecap="round"/>'
          '<path d="M36 47h9M56 46h9" stroke="#1E1E24" stroke-width="2.6" stroke-linecap="round"/><circle cx="41" cy="48.5" r="2.2" fill="#1E1E24"/><circle cx="61" cy="47.5" r="2.2" fill="#1E1E24"/>'
          '<path d="M40 60q12 6 22 -4" fill="none" stroke="#5A2A24" stroke-width="2.8" stroke-linecap="round"/></g>')
    return f'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{s}</svg>'


def ciaran():
    hair = ('<path d="M23 42Q20 15 50 14Q80 15 77 42Q74 30 66 28Q63 35 56 29Q50 36 43 29Q36 35 30 30Q25 34 23 42Z" fill="#D9622B" stroke="#A8461C" stroke-width="1.6" stroke-linejoin="round"/>'
            '<path d="M47 15q1 -8 9 -9q-4 3 -3 9z" fill="#D9622B" stroke="#A8461C" stroke-width="1.6" stroke-linejoin="round"/>')
    freckles = ''.join(f'<circle cx="{x}" cy="{y}" r=".9" fill="#C27A52"/>' for x, y in [(32, 54), (35, 57), (29, 57), (68, 54), (65, 57), (71, 57)])
    return student('', hair, '#2E4A7A', freckles)


def aoife():
    back = ('<path d="M74 22Q94 26 90 52Q88 64 80 70Q82 52 74 36Z" fill="#4A2C1E"/>'
            '<path d="M22 46Q20 66 26 72L30 50Z" fill="#4A2C1E"/>')
    front = ('<path d="M22 48Q18 14 50 14Q82 14 78 48Q76 32 68 26Q56 33 42 25Q30 30 26 38Z" fill="#4A2C1E" stroke="#2E1A12" stroke-width="1.4" stroke-linejoin="round"/>'
             '<circle cx="74" cy="24" r="4" fill="#E5484D"/>')
    return student(back, front, '#7A1E3A')


def main():
    data = {
        'chains': {
            'question-3b': {'How sandstone forms': sandstone(), 'How limestone forms': limestone(), 'Old Red Sandstone': old_red(), 'From sea bed to mountain': uplift()},
            'question-3c': {'Why an earthquake happens': quake(), 'Radon as a warning sign': radon(), 'An early warning system': warning(), 'A base-isolated building': base_isolation()},
        },
        'students': {'Ciarán': ciaran(), 'Aoife': aoife()},
    }
    out = os.path.join(os.path.dirname(__file__), '..', '..', 'mini-games-art.js')
    with open(out, 'w') as f:
        f.write('// Generated by tools/mini_games/build_game_art.py: the pictures for the mini games.\n')
        f.write('// Swap any svg for your own art: keep data-step, data-until, data-live and data-badge (chains) and the m-* mood groups (students).\n')
        f.write('window.ExamGameArt = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    print('wrote', os.path.normpath(out), sum(len(v) for v in data['chains'].values()), 'chain pictures,', len(data['students']), 'students')


main()

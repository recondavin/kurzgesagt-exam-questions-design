"""Builds draw-it-diagrams.js: the exam diagrams for the "Draw it" game.

Each diagram is a flat, side-on SVG (480 x 320) in the site's diagram palette. Art groups carry
data-part="n" (the order they appear in), labels carry data-label="n" (the order they pop in, which
is also the order of the label checklist). Pills are resized to their text in the browser, so the
widths here are only a first guess. Run: python3 tools/draw_it/build_diagrams.py
"""
import json, os

W, H = 480, 320
INK = '#14243B'


def label(i, text, side, ax, ay, fx, fy, outline=False):
    """side: where the leader joins the pill. start = pill runs right from (ax, ay); end = pill ends at
    (ax, ay); top = pill hangs below (ax, ay); bottom = pill sits above (ax, ay). (fx, fy) is the feature."""
    guess = len(text) * 7.4 + 18
    if side == 'start':
        tx, ty, anchor = ax + 9, ay, 'start'
        rx = ax
    elif side == 'end':
        tx, ty, anchor = ax - 9, ay, 'end'
        rx = ax - guess
    elif side == 'top':
        tx, ty, anchor = ax, ay + 11, 'middle'
        rx = ax - guess / 2
    else:
        tx, ty, anchor = ax, ay - 11, 'middle'
        rx = ax - guess / 2
    stroke = ' stroke="#FFFFFF" stroke-width="1.5"' if outline else ''
    return (f'<g data-label="{i}"><path d="M{fx} {fy}L{ax} {ay}" stroke="{INK}" stroke-width="1.6" fill="none"/>'
            f'<circle cx="{fx}" cy="{fy}" r="3" fill="{INK}" stroke="#FFFFFF" stroke-width="1.2"/>'
            f'<rect x="{rx:.1f}" y="{ty - 11}" width="{guess:.1f}" height="22" rx="11" fill="{INK}"{stroke}/>'
            f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" '
            f'font-weight="600" font-size="12.5" fill="#FFFFFF">{text}</text></g>')


def part(n, body):
    return f'<g data-part="{n}">{body}</g>'


def svg(title, desc, body):
    return (f'<svg viewBox="0 0 {W} {H}" role="img" xmlns="http://www.w3.org/2000/svg"><title>{title}</title><desc>{desc}</desc>'
            + body + '</svg>')


def fall(cx, cy, r, fill, dur, begin, drop=26, shape=None):
    anim = (f'<animate attributeName="cy" values="{cy};{cy + drop}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.8;1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>')
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}">{anim}</circle>'


def shell(x, y, s=1.0, fill='#FDF7E8', line='#B8AE96'):
    # A little scallop: a fan with ribs.
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-7 0Q-7 -9 0 -9Q7 -9 7 0Z" fill="{fill}" stroke="{line}" stroke-width="1.2"/>'
            f'<path d="M0 0V-8M-3.5 0L-5 -7M3.5 0L5 -7" stroke="{line}" stroke-width="1"/><rect x="-2.5" y="0" width="5" height="2" fill="{line}"/></g>')


def arrow_down(x, y1, y2, fill, w=10):
    return f'<path d="M{x - w / 2} {y1}H{x + w / 2}V{y2 - 9}H{x + w}L{x} {y2}L{x - w} {y2 - 9}H{x - w / 2}Z" fill="{fill}"/>'


def arrow(x1, y1, x2, y2, color, width=5):
    import math
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 12 * math.cos(a), y2 - 12 * math.sin(a)
    px, py = -math.sin(a) * 8, math.cos(a) * 8
    return (f'<path d="M{x1} {y1}L{hx:.1f} {hy:.1f}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
            f'<path d="M{x2} {y2}L{hx + px:.1f} {hy + py:.1f}L{hx - px:.1f} {hy - py:.1f}Z" fill="{color}"/>')


def both_ways(x, y1, y2, color):
    return arrow(x, (y1 + y2) / 2, x, y1, color, 3.5) + arrow(x, (y1 + y2) / 2, x, y2, color, 3.5)


# ---------------------------------------------------------------- 3B: sedimentary rocks
def strata():
    layers = [  # oldest first: they are laid down from the bottom up
        (262, 320, '#6E6676', '<path d="M20 284h14M70 300h16M130 280h12M190 296h14M250 284h16M318 302h12M372 282h14M430 298h16" stroke="#5A5262" stroke-width="2" stroke-linecap="round"/>'),
        (228, 262, '#C4683F', ''.join(f'<circle cx="{x}" cy="{y}" r="1.6" fill="#A9542F"/>' for x, y in [(18,240),(52,252),(96,238),(140,250),(186,240),(232,254),(280,238),(326,250),(372,240),(418,252),(460,240),(70,242),(300,256),(440,246)])),
        (196, 228, '#DCD5C3', ''.join(f'<path d="M{x} {y}a5 4 0 0 1 10 0" fill="none" stroke="#B8AE96" stroke-width="1.4"/>' for x, y in [(24,214),(84,206),(150,218),(214,208),(276,216),(340,206),(400,218),(450,208)])),
        (172, 196, '#A48A6A', '<path d="M30 184h12M92 190h14M160 182h12M226 190h14M292 182h12M356 190h14M420 184h12" stroke="#8A7055" stroke-width="2" stroke-linecap="round"/>'),
        (160, 172, '#E9C46A', ''.join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="#C9A24E"/>' for x in range(14, 480, 22) for y in [165 + (x // 22) % 2 * 3])),
    ]
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    body += part(0, '<path d="M0 60Q30 52 60 60T120 60T180 60T240 60T300 60T360 60T420 60T480 60V160H0Z" fill="#4FC3E8"/>'
                    '<path d="M0 60Q30 52 60 60T120 60T180 60T240 60T300 60T360 60T420 60T480 60" fill="none" stroke="#A8E4F5" stroke-width="3"/>')
    for k, (y1, y2, fill, deco) in enumerate(layers):
        body += part(k + 1, f'<rect y="{y1}" width="480" height="{y2 - y1}" fill="{fill}"/>{deco}'
                            f'<path d="M0 {y1}H480" stroke="#3E2154" stroke-width="1.4"/>')
    body += part(6, ''.join(fall(x, y, 3, c, 5, b) for x, y, c, b in [(120, 84, '#E9C46A', 0), (290, 78, '#A48A6A', 1.6), (360, 104, '#E9C46A', 3.1), (430, 86, '#A48A6A', .8), (40, 118, '#E9C46A', 2.4)])
                    + '<circle cx="205" cy="128" r="3.4" fill="#A48A6A"/><circle cx="214" cy="140" r="3" fill="#E9C46A"/>')
    body += part(7, arrow_down(60, 176, 250, '#FFFEF8') + f'<path d="M55 176H65V241H70L60 250L50 241H55Z" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>')
    body += label(0, 'SEA', 'end', 78, 86, 104, 102)
    body += label(1, 'Sediment settles', 'start', 236, 112, 208, 132)
    body += label(2, 'STRATA (LAYERS)', 'start', 100, 212, 84, 214)
    body += label(3, 'BEDDING PLANE', 'start', 318, 184, 296, 196)
    body += label(4, 'Weight squeezes lower layers', 'start', 90, 246, 68, 238)
    body += label(5, 'Oldest layer at the bottom', 'end', 400, 292, 424, 292)
    return {
        'id': 'strata', 'name': 'Layers of sedimentary rock', 'say': 'the layers (strata) of sedimentary rock on a sea bed',
        'tip': 'Draw the layers flat, one on top of the other. The oldest layer is at the bottom.',
        'labels': [
            {'text': 'Sea (or lake) above', 'keys': [['sea'], ['lake'], ['water'], ['ocean']]},
            {'text': 'Sediment settles', 'keys': [['sediment'], ['settl'], ['deposit'], ['sink']]},
            {'text': 'Strata (layers)', 'keys': [['strat'], ['layer']]},
            {'text': 'Bedding plane', 'keys': [['bedding'], ['plane']]},
            {'text': 'Weight squeezes lower layers', 'keys': [['weight'], ['squeez'], ['compact'], ['press']]},
            {'text': 'Oldest layer at the bottom', 'keys': [['old'], ['bottom'], ['first']]},
        ],
        'svg': svg('Layers of sedimentary rock', 'Sediment settles through the sea onto the sea bed and builds up in flat layers called strata. Bedding planes separate the layers, the weight above squeezes the lower layers, and the oldest layer is at the bottom.', body),
    }


def lithify():
    loose = [(42, 92), (84, 84), (124, 98), (50, 136), (96, 128), (134, 146), (40, 178), (84, 170), (124, 186)]
    packed = []
    for row, y in enumerate([118, 142, 166, 188]):
        for k in range(5):
            packed.append((186 + k * 26 + (row % 2) * 12, y))
    packed = [(x, y) for x, y in packed if x <= 296]

    def panel(n, x, fill, caption, grains, rx, ry):
        cid = f'dd-lith-{n}'
        g = f'<clipPath id="{cid}"><rect x="{x}" y="56" width="136" height="162" rx="12"/></clipPath>'
        g += f'<g clip-path="url(#{cid})"><rect x="{x}" y="56" width="136" height="162" fill="{fill}"/>'
        g += ''.join(f'<ellipse cx="{gx + x - 172 if n else gx}" cy="{gy}" rx="{rx}" ry="{ry}" fill="#E9C46A" stroke="#A9822F" stroke-width="1.6"/>' for gx, gy in grains)
        g += f'<rect x="{x}" y="196" width="136" height="22" fill="{INK}"/></g>'
        g += f'<rect x="{x}" y="56" width="136" height="162" rx="12" fill="none" stroke="{INK}" stroke-width="2"/>'
        g += f'<text x="{x + 10}" y="207" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11" fill="#FFFFFF" letter-spacing=".5">{caption}</text>'
        return g

    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    body += part(0, panel(0, 18, '#4FC3E8', '1 LOOSE', loose, 15, 15))
    body += part(1, arrow(160, 132, 170, 132, INK, 4))
    body += part(2, panel(1, 172, '#7FD8F2', '2 COMPACTION', packed, 14, 11)
                    + ''.join(arrow_down(x, 14, 52, '#5B3172', 8) for x in (212, 240, 268))
                    + '<path d="M176 92q-10 0-12 8" fill="none" stroke="#2C8FC0" stroke-width="2.4" stroke-linecap="round"/><circle cx="163" cy="104" r="3.4" fill="#4FC3E8" stroke="#2C8FC0" stroke-width="1.2"/>'
                    + '<path d="M304 92q10 0 12 8" fill="none" stroke="#2C8FC0" stroke-width="2.4" stroke-linecap="round"/><circle cx="317" cy="104" r="3.4" fill="#4FC3E8" stroke="#2C8FC0" stroke-width="1.2"/>')
    body += part(3, arrow(314, 132, 324, 132, INK, 4))
    body += part(4, panel(2, 326, '#F5A03C', '3 CEMENTATION', packed, 14, 11))
    body += label(0, 'SEDIMENT GRAINS', 'bottom', 92, 40, 84, 80)
    body += label(1, 'Weight of layers above', 'start', 294, 26, 274, 30)
    body += label(2, 'Water between grains', 'top', 112, 238, 106, 152)
    body += label(3, 'Compaction squeezes water out', 'top', 282, 272, 282, 180)
    body += label(4, 'Minerals glue the grains', 'end', 470, 249, 452, 152)
    return {
        'id': 'lithify', 'name': 'Sediment turning into rock', 'say': 'loose sediment turning into rock: compaction, then cementation',
        'tip': 'Draw three boxes: loose grains, the same grains squeezed together, then the gaps filled with mineral glue.',
        'labels': [
            {'text': 'Sediment grains', 'keys': [['grain'], ['sediment'], ['particle'], ['sand']]},
            {'text': 'Weight of layers above', 'keys': [['weight'], ['pressure'], ['press'], ['above']]},
            {'text': 'Water between grains', 'keys': [['water']]},
            {'text': 'Compaction squeezes water out', 'keys': [['compact'], ['squeez'], ['squash']]},
            {'text': 'Minerals glue the grains (cementation)', 'keys': [['mineral'], ['cement'], ['glue'], ['calcite'], ['silica']]},
        ],
        'svg': svg('Sediment turning into rock', 'Three boxes. 1: loose sediment grains with water between them. 2: the weight of the layers above squeezes the grains together and pushes the water out (compaction). 3: minerals glue the grains together into solid rock (cementation).', body),
    }


def limestone():
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    body += part(0, '<path d="M0 48Q30 40 60 48T120 48T180 48T240 48T300 48T360 48T420 48T480 48V200H0Z" fill="#4FC3E8"/>'
                    '<path d="M0 48Q30 40 60 48T120 48T180 48T240 48T300 48T360 48T420 48T480 48" fill="none" stroke="#A8E4F5" stroke-width="3"/>'
                    '<circle cx="440" cy="22" r="13" fill="#FFC42E"/>')
    rock = '<rect y="226" width="480" height="94" fill="#C9C3B5"/><path d="M0 226H480M0 260H480M0 292H480" stroke="#9C9484" stroke-width="1.6"/>'
    rock += '<path d="M90 226v34M250 260v32M400 226v34M160 292v28M330 292v28" stroke="#9C9484" stroke-width="1.4"/>'
    fossils = ('<g fill="none" stroke="#7D7566" stroke-width="1.8" stroke-linecap="round"><path d="M336 304a9 9 0 1 1 -9 -9a6 6 0 1 1 6 6a3 3 0 1 1 -3 -3"/>'
               '<path d="M196 278q8 -12 16 0q-8 6 -16 0M204 270v14"/><path d="M60 306q6 -9 12 0z"/></g>')
    body += part(1, rock + fossils)
    layer = '<rect y="198" width="480" height="28" fill="#E8E0CC"/><path d="M0 198H480" stroke="#B8AE96" stroke-width="1.4"/>'
    layer += ''.join(shell(x, y, .8, '#FFFEF8') for x, y in [(16, 212), (44, 220), (74, 210), (104, 220), (138, 212), (172, 221), (206, 211), (238, 220), (272, 212), (306, 221), (338, 211), (370, 220), (404, 212), (436, 221), (466, 211)])
    body += part(2, layer)
    coral = ('<path d="M70 198V172M70 182L58 166M70 178L84 160M84 160V150M58 166V156M96 198V176M96 186L108 170M108 170V160" stroke="#E8551F" stroke-width="5" stroke-linecap="round" fill="none"/>'
             '<path d="M380 198V180M380 186L370 172M380 184L392 168M410 198V178M410 186L420 174" stroke="#F5A03C" stroke-width="5" stroke-linecap="round" fill="none"/>'
             + shell(200, 196, 1.1) + shell(262, 197, 1.1) + shell(150, 197, .9)
             + '<g transform="translate(300 108)"><path d="M0 0q10 -8 22 0q-12 8 -22 0z" fill="#FFC42E"/><path d="M0 0l-7 -5v10z" fill="#FFC42E"/><circle cx="15" cy="-1" r="1.6" fill="#14243B"/></g>')
    body += part(3, coral)
    sinking = ''
    for x, y, b in [(340, 92, 0), (366, 120, 1.7), (318, 140, 3.2)]:
        sinking += (f'<g><animateTransform attributeName="transform" type="translate" values="0 0;0 34" dur="5s" begin="{b}s" repeatCount="indefinite"/>'
                    f'{shell(x, y, .8)}<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.2;.8;1" dur="5s" begin="{b}s" repeatCount="indefinite"/></g>')
    body += part(4, sinking + shell(352, 164, .9))
    body += label(0, 'Warm, shallow, clear sea', 'start', 170, 72, 146, 86)
    body += label(1, 'Sea creatures and coral', 'start', 116, 132, 88, 156)
    body += label(2, 'Shells sink when they die', 'end', 330, 172, 352, 160)
    body += label(3, 'Layers of shells build up', 'end', 404, 248, 430, 214)
    body += label(4, 'LIMESTONE', 'start', 96, 304, 76, 284)
    body += label(5, 'FOSSILS', 'start', 352, 276, 332, 298)
    return {
        'id': 'limestone', 'name': 'How limestone forms', 'say': 'limestone forming on the floor of a warm, shallow sea',
        'tip': 'Show the shells piling up on the sea floor, and draw a fossil or two in the rock below.',
        'labels': [
            {'text': 'Warm, shallow, clear sea', 'keys': [['warm'], ['shallow'], ['clear'], ['tropical']]},
            {'text': 'Sea creatures and coral', 'keys': [['creature'], ['coral'], ['animal'], ['organism'], ['fish']]},
            {'text': 'Shells sink when they die', 'keys': [['sink'], ['die'], ['dead'], ['skeleton']]},
            {'text': 'Layers of shells build up', 'keys': [['layer'], ['build'], ['pile'], ['accumul']]},
            {'text': 'Limestone', 'keys': [['limestone'], ['calcium']]},
            {'text': 'Fossils', 'keys': [['fossil']]},
        ],
        'svg': svg('How limestone forms', 'A warm, shallow, clear sea with coral and sea creatures. When they die their shells sink and pile up in layers on the sea floor. Below, older layers have been squeezed and cemented into limestone, with fossils in it.', body),
    }


def process():
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    land = ('<path d="M0 236H330Q346 236 350 262H0Z" fill="#83C468"/><rect y="262" width="350" height="58" fill="#6B2D3A"/>'
            '<path d="M0 280Q60 276 120 280T240 280T350 280M0 302Q80 298 160 302T350 302" fill="none" stroke="#5B3A5E" stroke-width="1.6"/>')
    body += part(0, land)
    mountain = ('<path d="M0 240V150L40 116L86 66L132 112L176 150L232 206L262 240Z" fill="#6B2D4A"/>'
                '<path d="M86 66L132 112L176 150L232 206L262 240H200L150 170L110 120Z" fill="#8C4A55"/>'
                '<path d="M86 66L104 84L94 90L84 82L72 92L64 84Z" fill="#FDF7E8"/>'
                '<g stroke="#FDF7E8" stroke-width="1.6" stroke-linecap="round"><path d="M112 100l6 6M118 100l-6 6M115 98v10"/><path d="M58 104l6 6M64 104l-6 6M61 102v10"/></g>'
                '<path d="M150 150l7 -3 3 6 -7 2zM166 166l6 -2 2 5 -6 2zM120 130l6 -1 1 5 -6 1z" fill="#5B3A5E"/>')
    body += part(1, mountain)
    rain = ('<g transform="translate(70 30)"><ellipse cx="0" cy="0" rx="26" ry="11" fill="#FDF7E8"/><ellipse cx="-12" cy="-7" rx="14" ry="10" fill="#FDF7E8"/><ellipse cx="10" cy="-9" rx="13" ry="10" fill="#FDF7E8"/></g>')
    for x, b in [(58, 0), (72, .4), (86, .8), (64, 1.1), (80, .2)]:
        rain += (f'<path d="M{x} 46v7" stroke="#45C4EE" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 0;0 18" dur="1.2s" begin="{b}s" repeatCount="indefinite"/>'
                 f'<animate attributeName="opacity" values="1;0" dur="1.2s" begin="{b}s" repeatCount="indefinite"/></path>')
    body += part(2, rain)
    river_d = 'M140 142Q168 170 186 190T236 214T300 228T336 232'
    river = (f'<path d="{river_d}" fill="none" stroke="#4FC3E8" stroke-width="8" stroke-linecap="round"/>'
             f'<path d="{river_d}" fill="none" stroke="#A8E4F5" stroke-width="2" stroke-dasharray="6 12" stroke-linecap="round">'
             '<animate attributeName="stroke-dashoffset" values="0;-36" dur="2.4s" repeatCount="indefinite"/></path>'
             '<circle cx="190" cy="193" r="2.2" fill="#A48A6A"/><circle cx="252" cy="219" r="2.2" fill="#A48A6A"/><circle cx="300" cy="228" r="2.2" fill="#A48A6A"/>')
    body += part(3, river)
    sea = ('<path d="M330 204Q350 198 370 204T410 204T450 204T480 204V262H350Q346 236 330 236Z" fill="#4FC3E8"/>'
           '<path d="M330 204Q350 198 370 204T410 204T450 204T480 204" fill="none" stroke="#A8E4F5" stroke-width="3"/>')
    body += part(4, sea + ''.join(fall(x, y, 2.6, c, 4.5, b, 18) for x, y, c, b in [(360, 230, '#A48A6A', 0), (392, 222, '#E9C46A', 1.4), (424, 236, '#A48A6A', 2.6), (452, 226, '#E9C46A', .7)]))
    beds = ''
    for k, (y, c) in enumerate([(300, '#A48A6A'), (281, '#DCD5C3'), (262, '#E9C46A')]):
        beds += f'<path d="M350 {y}H480V{y + 19}H350Z" fill="{c}"/><path d="M350 {y}H480" stroke="#3E2154" stroke-width="1.3"/>'
    body += part(5, beds)
    body += label(0, 'Rain and frost weather the rock', 'start', 132, 62, 102, 80)
    body += label(1, 'River erodes and transports sediment', 'start', 168, 150, 180, 184)
    body += label(2, 'River slows down', 'start', 330, 176, 316, 228)
    body += label(3, 'SEDIMENT DEPOSITED', 'end', 330, 262, 372, 240, outline=True)
    body += label(4, 'Layers build up over millions of years', 'end', 472, 304, 440, 286, outline=True)
    return {
        'id': 'journey', 'name': 'From mountain to sea bed', 'say': 'sediment\'s journey from a mountain to the sea bed',
        'tip': 'Draw it left to right: mountain, river, then the sea with layers on its bed.',
        'labels': [
            {'text': 'Rain and frost weather the rock', 'keys': [['weather'], ['frost'], ['rain'], ['break']]},
            {'text': 'River erodes and transports sediment', 'keys': [['transport'], ['erod'], ['erosion'], ['river'], ['carr']]},
            {'text': 'River slows down', 'keys': [['slow'], ['energy']]},
            {'text': 'Sediment deposited', 'keys': [['deposit'], ['settl'], ['drop']]},
            {'text': 'Layers build up over millions of years', 'keys': [['million'], ['years'], ['time'], ['layer']]},
        ],
        'svg': svg('From mountain to sea bed', 'Rain and frost weather the rock of a mountain. A river erodes and carries the sediment down to the sea. Where it reaches the sea the river slows down and deposits its sediment, which builds up in layers on the sea bed over millions of years.', body),
    }


# ---------------------------------------------------------------- 3C: seismic activity
def seismograph():
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    ground = ('<rect y="244" width="480" height="16" fill="#83C468"/><rect y="258" width="480" height="62" fill="#6B2D3A"/>'
              '<path d="M0 280Q60 276 120 280T240 280T360 280T480 280M0 302Q80 298 160 302T320 302T480 302" fill="none" stroke="#5B3A5E" stroke-width="1.6"/>')
    body += part(0, ground + both_ways(26, 266, 314, '#FFC42E') + both_ways(456, 266, 314, '#FFC42E'))
    frame = ('<rect x="60" y="228" width="370" height="16" rx="3" fill="#5B3172"/>'
             '<rect x="88" y="244" width="12" height="44" fill="#3E2154"/><rect x="388" y="244" width="12" height="44" fill="#3E2154"/>'
             '<rect x="84" y="52" width="16" height="176" fill="#5B3172"/><rect x="84" y="52" width="210" height="12" rx="2" fill="#5B3172"/>')
    body += part(1, frame)
    body += part(2, '<path d="M262 64V70L250 75L274 81L250 87L274 93L250 99L274 105L250 111L262 115V120" fill="none" stroke="#241428" stroke-width="2.6" stroke-linejoin="round"/>')
    body += part(3, '<rect x="234" y="120" width="56" height="48" rx="6" fill="#241428"/><rect x="242" y="128" width="40" height="6" rx="3" fill="#3E2154"/>')
    body += part(4, '<rect x="290" y="141" width="40" height="5" fill="#241428"/><path d="M330 138L342 143.5L330 149Z" fill="#E8551F"/>')
    drum = ('<rect x="372" y="196" width="10" height="32" fill="#3E2154"/>'
            '<rect x="338" y="104" width="100" height="92" fill="#FDF7E8" stroke="#3E2154" stroke-width="2"/>'
            '<ellipse cx="438" cy="150" rx="8" ry="46" fill="#7E5BA3" stroke="#3E2154" stroke-width="2"/>'
            '<path d="M340 122H436M340 164H436M340 180H436" stroke="#CDEFF9" stroke-width="1"/>'
            '<path d="M342 143.5H352L356 136L360 152L364 130L368 158L372 140L376 147L380 143.5H392L395 139L398 148L401 143.5H430" fill="none" stroke="#E8551F" stroke-width="1.8" stroke-linejoin="round"/>'
            '<path d="M446 116a14 14 0 0 1 0 22" fill="none" stroke="#14243B" stroke-width="2"/><path d="M441 135l6 5 3 -7z" fill="#14243B"/>')
    body += part(5, drum)
    body += label(0, 'Frame fixed to bedrock', 'start', 116, 298, 96, 278, outline=True)
    body += label(1, 'SPRING', 'end', 242, 92, 256, 92)
    body += label(2, 'Heavy weight stays still', 'top', 214, 184, 246, 166)
    body += label(3, 'PEN', 'bottom', 318, 116, 336, 141)
    body += label(4, 'ROTATING DRUM', 'top', 404, 280, 404, 196, outline=True)
    body += label(5, 'SEISMOGRAM', 'bottom', 404, 86, 384, 140)
    return {
        'id': 'seismograph', 'name': 'A seismograph', 'say': 'a seismograph',
        'tip': 'The weight hangs still while the frame and drum shake with the ground. That difference is what the pen records.',
        'labels': [
            {'text': 'Frame fixed to bedrock', 'keys': [['frame'], ['bedrock'], ['base'], ['fixed']]},
            {'text': 'Spring', 'keys': [['spring'], ['wire']]},
            {'text': 'Heavy weight stays still', 'keys': [['weight'], ['mass'], ['heavy']]},
            {'text': 'Pen', 'keys': [['pen'], ['needle'], ['stylus']]},
            {'text': 'Rotating drum', 'keys': [['drum'], ['rotat'], ['roll'], ['cylinder']]},
            {'text': 'Seismogram (the trace)', 'keys': [['seismogram'], ['trace'], ['graph'], ['zigzag'], ['record']]},
        ],
        'svg': svg('A seismograph', 'A frame fixed to the bedrock holds a heavy weight on a spring. A pen on the weight touches a rotating drum. When the ground shakes, the frame and drum move but the weight stays still, so the pen draws a zigzag trace called a seismogram.', body),
    }


def building():
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    ground = '<rect y="236" width="480" height="14" fill="#83C468"/><rect y="250" width="480" height="70" fill="#6B2D3A"/><path d="M0 276Q60 272 120 276T240 276T360 276T480 276M0 300Q80 296 160 300T320 300T480 300" fill="none" stroke="#5B3A5E" stroke-width="1.6"/>'
    body += part(0, ground + arrow(60, 243, 30, 243, '#E8551F', 3.5) + arrow(60, 243, 90, 243, '#E8551F', 3.5) + arrow(420, 243, 390, 243, '#E8551F', 3.5) + arrow(420, 243, 450, 243, '#E8551F', 3.5))
    body += part(1, '<rect x="176" y="228" width="128" height="8" fill="#9EA4AE"/>' + ''.join(f'<rect x="{x}" y="236" width="10" height="66" fill="#9EA4AE"/>' for x in (190, 235, 280)))
    body += part(2, ''.join(f'<rect x="{x}" y="220" width="22" height="8" fill="#241428"/><path d="M{x} 224H{x + 22}" stroke="#7E5BA3" stroke-width="1.4"/>' for x in (182, 218, 240, 276)))
    floors = [70, 100, 130, 160, 190]
    b = '<rect x="180" y="40" width="120" height="180" fill="#FFC42E"/>'
    b += ''.join(f'<rect x="{228}" y="{y + 8}" width="24" height="14" rx="1.5" fill="#45C4EE"/>' for y in floors)
    b += '<path d="' + ''.join(f'M180 {y}H300' for y in floors) + '" stroke="#F5A03C" stroke-width="2"/>'
    brace = ''.join(f'M{x1} {y}L{x2} {y + 30}M{x2} {y}L{x1} {y + 30}' for y in floors[:-1] + [190] for x1, x2 in [(180, 220), (260, 300)])
    b += f'<path d="{brace}" stroke="#6B2D3A" stroke-width="1.8"/>'
    b += '<path d="M180 40V220M220 40V220M260 40V220M300 40V220" stroke="#E8551F" stroke-width="4"/>'
    b += '<rect x="174" y="34" width="132" height="7" rx="2" fill="#E8551F"/>'
    body += part(3, b)
    body += part(4, '<path d="M240 42V54" stroke="#3E2154" stroke-width="1.6"/><circle cx="240" cy="61" r="8" fill="#5B3172"/>')
    body += label(0, 'COUNTERWEIGHT', 'start', 318, 30, 247, 58)
    body += label(1, 'CROSS-BRACING', 'end', 160, 116, 200, 115)
    body += label(2, 'Flexible steel frame', 'start', 318, 150, 300, 150)
    body += label(3, 'Rubber shock absorbers', 'start', 300, 204, 287, 224)
    body += label(4, 'Deep foundations', 'start', 304, 290, 285, 290, outline=True)
    return {
        'id': 'building', 'name': 'An earthquake-proof building', 'say': 'an earthquake-proof building',
        'tip': 'Label each feature, and say what it does in your answer: it lets the building sway without collapsing.',
        'labels': [
            {'text': 'Counterweight on the roof', 'keys': [['counterweight'], ['damper'], ['counter']]},
            {'text': 'Cross-bracing', 'keys': [['brac'], ['cross']]},
            {'text': 'Flexible steel frame', 'keys': [['steel'], ['frame'], ['flex']]},
            {'text': 'Rubber shock absorbers', 'keys': [['rubber'], ['shock'], ['absorb'], ['isolat'], ['pad'], ['bearing']]},
            {'text': 'Deep foundations', 'keys': [['foundation'], ['deep'], ['pile']]},
        ],
        'svg': svg('An earthquake-proof building', 'A tall building with a flexible steel frame and cross-bracing, a counterweight hanging at the top to stop it swaying, rubber shock absorbers between the building and its base, and deep foundations going down into the bedrock.', body),
    }


def gap():
    body = '<rect width="480" height="320" fill="#A8D98A"/>'
    body += part(0, '<path d="M0 0H120Q90 60 40 80T0 150Z" fill="#83C468"/><path d="M380 320Q400 250 480 230V320Z" fill="#83C468"/>'
                    '<g fill="#FDF7E8" stroke="#3E2154" stroke-width="1.2"><rect x="300" y="236" width="10" height="9"/><rect x="314" y="232" width="9" height="13"/><rect x="306" y="226" width="7" height="8"/></g>')
    fault = 'M30 290L120 236L200 190L280 140L360 92L450 40'
    body += part(1, '<path d="M206 186L306 124" stroke="#FFE45C" stroke-width="26" stroke-linecap="round" opacity=".85"/>'
                    f'<path d="{fault}" fill="none" stroke="#241428" stroke-width="4" stroke-linejoin="round"/>')
    body += part(2, arrow(150, 150, 96, 182, '#5B3172', 6) + arrow(382, 246, 436, 214, '#5B3172', 6))
    quakes = [(52, 277), (78, 261), (104, 246), (136, 227), (162, 214), (186, 199), (322, 115), (346, 101), (372, 85), (398, 70), (424, 55)]
    body += part(3, ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="#E8551F" stroke="#FFFFFF" stroke-width="1.6"/>' for x, y in quakes))
    body += label(0, 'FAULT LINE', 'end', 404, 26, 430, 52)
    body += label(1, 'Plates slide past each other', 'bottom', 112, 128, 124, 165)
    body += label(2, 'Recent earthquakes', 'start', 96, 296, 78, 262)
    body += label(3, 'SEISMIC GAP', 'start', 292, 190, 268, 158)
    body += label(4, 'Stress building up', 'bottom', 262, 100, 254, 150)
    return {
        'id': 'gap', 'name': 'A seismic gap', 'say': 'a seismic gap on a fault line, seen from above',
        'tip': 'Draw the fault, dots for past earthquakes, and leave a gap. The gap is where the next big quake is likely.',
        'labels': [
            {'text': 'Fault line', 'keys': [['fault'], ['boundary']]},
            {'text': 'Plates slide past each other', 'keys': [['plate'], ['slide'], ['slid'], ['move']]},
            {'text': 'Recent earthquakes', 'keys': [['recent'], ['past'], ['earthquake'], ['quake'], ['epicent']]},
            {'text': 'Seismic gap', 'keys': [['gap']]},
            {'text': 'Stress building up', 'keys': [['stress'], ['build'], ['next'], ['likely'], ['due']]},
        ],
        'svg': svg('A seismic gap', 'A map of a fault line where two plates slide past each other. Dots show recent earthquakes along most of the fault, but one stretch has had none. That seismic gap is where stress is building up, so a big earthquake is likely there next.', body),
    }


def monitor():
    body = '<rect width="480" height="320" fill="#E3F5FC"/>'
    surface = 'M0 210H140Q190 192 240 206H480'
    body += part(0, f'<path d="{surface}V320H0Z" fill="#6B2D3A"/><path d="{surface}V222Q190 206 140 224H0Z" fill="#83C468"/>'
                    '<path d="M0 262Q60 258 120 262T240 262T360 262T480 262M0 292Q80 288 160 292T320 292T480 292" fill="none" stroke="#5B3A5E" stroke-width="1.6"/>')
    body += part(1, '<path d="M240 206L198 320" stroke="#241428" stroke-width="3.5"/>'
                    + arrow(110, 276, 168, 276, '#FFC42E', 5) + arrow(350, 276, 292, 276, '#FFC42E', 5))
    sat = ('<g transform="translate(330 38)"><rect x="-26" y="-5" width="16" height="10" fill="#45C4EE"/><rect x="10" y="-5" width="16" height="10" fill="#45C4EE"/>'
           '<path d="M-10 0H-26M10 0H26" stroke="#3E2154" stroke-width="1.2"/><rect x="-7" y="-8" width="14" height="16" rx="2.5" fill="#5B3172"/><circle cx="0" cy="11" r="2.4" fill="#FFC42E"/></g>'
           '<path d="M326 52L122 196M334 52L392 196" stroke="#45C4EE" stroke-width="1.8" stroke-dasharray="5 6"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1.6s" repeatCount="indefinite"/></path>'
           '<g fill="#5B3172"><rect x="119" y="196" width="6" height="14"/><path d="M112 196a10 10 0 0 1 20 0Z"/><rect x="389" y="192" width="6" height="14"/><path d="M382 192a10 10 0 0 1 20 0Z"/></g>')
    body += part(2, sat)
    laser = ('<rect x="214" y="176" width="6" height="26" fill="#3E2154"/><rect x="292" y="180" width="6" height="26" fill="#3E2154"/>'
             '<path d="M220 184H292" stroke="#E8551F" stroke-width="2.4" stroke-dasharray="7 4"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1s" repeatCount="indefinite"/></path>')
    body += part(3, laser)
    tilt = '<g transform="translate(176 196) rotate(-10)"><rect x="-14" y="-10" width="28" height="12" rx="2" fill="#5B3172"/><rect x="-8" y="-7" width="16" height="5" rx="2.5" fill="#A8E4F5"/><circle cx="-2" cy="-4.5" r="2" fill="#FFFFFF"/></g>'
    body += part(4, tilt)
    well = ('<rect x="410" y="206" width="20" height="92" fill="#3E2154"/><rect x="414" y="206" width="12" height="88" fill="#E3F5FC"/><rect x="414" y="246" width="12" height="48" fill="#4FC3E8"/>'
            '<rect x="406" y="200" width="28" height="7" rx="2" fill="#9EA4AE"/>')
    for cx, b in [(418, 0), (422, 1.1), (419, 2.2)]:
        well += (f'<circle cx="{cx}" cy="290" r="2" fill="#C9D6EE"><animate attributeName="cy" values="290;250" dur="3.3s" begin="{b}s" repeatCount="indefinite"/>'
                 f'<animate attributeName="opacity" values="0;1;0" dur="3.3s" begin="{b}s" repeatCount="indefinite"/></circle>')
    body += part(5, well)
    body += label(0, 'GPS satellites track movement', 'end', 298, 30, 316, 40)
    body += label(1, 'Laser measures movement', 'bottom', 300, 128, 262, 184)
    body += label(2, 'Tiltmeter measures bulging', 'bottom', 100, 160, 170, 192)
    body += label(3, 'Radon gas and water levels in wells', 'end', 400, 236, 420, 256, outline=True)
    body += label(4, 'FAULT', 'start', 232, 300, 212, 284, outline=True)
    body += label(5, 'Stress builds up', 'start', 346, 304, 330, 278, outline=True)
    return {
        'id': 'monitor', 'name': 'Monitoring a fault', 'say': 'the instruments used to monitor a fault',
        'tip': 'Each instrument is a separate point in your answer. Label what each one measures.',
        'labels': [
            {'text': 'GPS satellites track movement', 'keys': [['gps'], ['satellite']]},
            {'text': 'Laser measures movement', 'keys': [['laser']]},
            {'text': 'Tiltmeter measures bulging', 'keys': [['tilt'], ['bulg']]},
            {'text': 'Radon gas and water levels in wells', 'keys': [['radon'], ['well'], ['water level']]},
            {'text': 'Fault', 'keys': [['fault']]},
            {'text': 'Stress builds up', 'keys': [['stress'], ['pressure'], ['strain']]},
        ],
        'svg': svg('Monitoring a fault', 'A fault in the ground where stress is building up. GPS satellites track movement of the ground on both sides. A laser beam across the fault measures movement, a tiltmeter measures the ground bulging, and a well is checked for changes in water level and radon gas.', body),
    }


def main():
    data = {
        'question-3b': {'subject': 'geography', 'topic': 'Sedimentary rocks', 'diagrams': [strata(), lithify(), limestone(), process()]},
        'question-3c': {'subject': 'geography', 'topic': 'Earthquakes', 'diagrams': [seismograph(), building(), gap(), monitor()]},
    }
    import re
    for q in data.values():
        for d in q['diagrams']:
            assert d['svg'].count('data-label=') == len(d['labels']), d['id']
            # Where each label points (its feature) and the words on its tag, for placing labels from memory.
            for i, fx, fy, tag in re.findall(r'<g data-label="(\d+)"><path d="M([\d.]+) ([\d.]+)L.*?<text [^>]*>([^<]+)</text>', d['svg']):
                d['labels'][int(i)]['at'] = [float(fx), float(fy)]
                d['labels'][int(i)]['tag'] = tag
            assert all('at' in l for l in d['labels']), d['id']
    out = os.path.join(os.path.dirname(__file__), '..', '..', 'draw-it-diagrams.js')
    with open(out, 'w') as f:
        f.write('// Generated by tools/draw_it/build_diagrams.py: the exam diagrams for the "Draw it" game.\n')
        f.write('// Swap any svg for your own art: keep data-part (build order) and data-label (label order).\n')
        f.write('window.ExamDrawDiagrams = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    print('wrote', os.path.normpath(out), sum(len(q['diagrams']) for q in data.values()), 'diagrams')


main()

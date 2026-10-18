"""Shared drawing helpers for the Biology diagrams (tools/bio/chapters/ch<N>.py use these).

Everything is drawn in the Draw it format: 480 x 320, flat, side-on, the diagram palette, Lexend labels on dark tags.
"""
import os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'draw_it'))
from build_diagrams import part, svg, arrow, INK  # noqa: E402,F401

# Lexend 600 at 12.5px, measured in the browser (tools/draw_it's label() guesses 7.4px a letter, too narrow for
# capitals). Same markup as that label(), so Draw it reads it the same way.
LEX = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '(),-.:/+", [9, 9, 9, 10, 8, 8, 10, 10, 7, 8, 9, 8, 11, 10, 10, 8, 10, 9, 8, 8, 9, 9, 12, 9, 8, 8,
                                                                   8, 7, 7, 7, 8, 7, 7, 7, 7, 7, 4, 3, 5, 5, 4, 5, 3, 3, 7, 7]))


def label(i, text, side, ax, ay, fx, fy, outline=False):
    """A label pill joined to a feature. side: start = pill runs right from (ax, ay); end = pill ends at (ax, ay);
    top = pill hangs below (ax, ay); bottom = pill sits above (ax, ay). (fx, fy) is the feature."""
    text = text.strip('\u00a0 ')
    w = sum(LEX.get(c, 9) for c in text) + 20
    if side == 'start':
        tx, ty, anchor, rx = ax + 10, ay, 'start', ax
    elif side == 'end':
        tx, ty, anchor, rx = ax - 10, ay, 'end', ax - w
    elif side == 'top':
        tx, ty, anchor, rx = ax, ay + 11, 'middle', ax - w / 2
    else:
        tx, ty, anchor, rx = ax, ay - 11, 'middle', ax - w / 2
    stroke = ' stroke="#FFFFFF" stroke-width="1.5"' if outline else ''
    return (f'<g data-label="{i}"><path d="M{fx} {fy}L{ax} {ay}" stroke="{INK}" stroke-width="1.6" fill="none"/>'
            f'<circle cx="{fx}" cy="{fy}" r="3" fill="{INK}" stroke="#FFFFFF" stroke-width="1.2"/>'
            f'<rect x="{rx:.1f}" y="{ty - 11}" width="{w}" height="22" rx="11" fill="{INK}"{stroke}/>'
            f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" '
            f'font-weight="600" font-size="12.5" fill="#FFFFFF">{text}</text></g>')

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
    """A dashed stroke moving along a path: blood or urine flowing. Class bio-flow: hidden on exam-question
    diagrams, where the direction of flow is often what the question asks."""
    return (f'<path class="bio-flow" d="{d}" fill="none" stroke="{color}" stroke-width="1.6" stroke-dasharray="4 10" stroke-linecap="round" opacity=".85">'
            f'<animate attributeName="stroke-dashoffset" values="0;-28" dur="{dur}s" repeatCount="indefinite"/></path>')


def finish(did, name, say, tip, title, desc, body, labels, anchors, parts):
    s = svg(title, desc, body)
    plain = re.sub(r'<g data-label="\d+">.*?</text></g>', '', s)
    for i, fx, fy, tag in re.findall(r'<g data-label="(\d+)"><path d="M([\d.]+) ([\d.]+)L.*?<text [^>]*>([^<]+)</text>', s):
        labels[int(i)]['at'] = [float(fx), float(fy)]
        labels[int(i)]['tag'] = tag
    assert all('at' in l for l in labels), did
    return {'id': did, 'name': name, 'say': say, 'tip': tip, 'labels': labels, 'svg': s, 'plain': plain, 'anchors': anchors, 'parts': parts}

"""Shared drawing helpers for the Biology diagrams (tools/bio/chapters/ch<N>.py use these).

Everything is drawn in the Draw it format: 480 x 320, flat, side-on, the diagram palette, Lexend labels on dark tags.
"""
import os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'draw_it'))
from build_diagrams import label, part, svg, arrow, INK  # noqa: E402,F401

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

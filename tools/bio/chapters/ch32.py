"""Chapter 32, infectious disease and the human immune response: its diagrams and how its exam questions use them.

Diagrams (tools/bio/build_bio_diagrams.py builds them into bio/d32.js):
  MAKERS        one function per diagram to memorise, each returning finish(...) from bio_art.
Exam questions (tools/bio/build_bio_questions.py reads these):
  base_of       which of this chapter's diagrams a question's picture is, from its description,
  ANCHOR_WORDS  the words that name each anchor on those diagrams (exam letters go to that anchor),
  OVERRIDES     per-question corrections: two-panel diagrams and graphs, tap answers, answer types.
Chain reaction pictures: CHAIN_ART.
"""
import math, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from bio_art import label, part, vessel, finish, RED, RED_D, BLUE, PURPLE, BG, INK  # noqa: E402

CHAPTER = 32
TOPIC = 'Infectious disease and the human immune response'

# The chapter's colours: the virus's parts, cells and the tissue they sit in.
NUC, NUC_D = '#E5484D', '#B3262B'            # nucleic acid (DNA or RNA)
COAT, COAT_D = '#F5A03C', '#B5652A'          # protein coat (capsid)
ENV, ENV_D = '#D9C6EC', '#5B3172'            # envelope
SPIKE, SPIKE_D = '#2BC46F', '#17824A'        # spike proteins (antigens)
CELL, CELL_D = '#FDF3E3', '#C9A27A'          # a body cell's cytoplasm and membrane
NUCLEUS, NUCLEUS_D = '#B9A6D6', '#5B3172'    # a cell's nucleus
WBC, WBC_D = '#EAF2FF', '#3E6FD8'            # white blood cells
BACT, BACT_D = '#A8D86E', '#4E7A23'          # bacteria
AB = '#3E6FD8'                               # antibodies
TISSUE = '#FBEFE3'


def lab(i, text, side, ax, ay, fx, fy):
    """label() from bio_art (its pills are sized from Lexend's measured letter widths)."""
    return label(i, text, side, ax, ay, fx, fy)


def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def coil(x0, y0, x1, y1, amp=7, waves=6, color=NUC, w=3.2):
    """A wavy strand of nucleic acid from (x0, y0) to (x1, y1)."""
    n = waves * 8
    dx, dy = x1 - x0, y1 - y0
    ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / ln, dx / ln
    d = []
    for i in range(n + 1):
        t = i / n
        s = math.sin(t * waves * 2 * math.pi) * amp
        d.append(f'{"M" if i == 0 else "L"}{x0 + dx * t + nx * s:.1f} {y0 + dy * t + ny * s:.1f}')
    return f'<path d="{"".join(d)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def blob_coil(cx, cy, r, color=NUC, w=3.2, turns=5):
    """A tangled thread of nucleic acid packed inside a round core."""
    d = []
    n = 160
    for i in range(n + 1):
        t = i / n * 4 * math.pi
        rr = r * (0.5 + 0.28 * math.sin(3 * t + turns) + 0.17 * math.sin(5.3 * t + 1.1))
        a = t + 0.35 * math.sin(2 * t)
        d.append(f'{"M" if i == 0 else "L"}{cx + rr * math.cos(a):.1f} {cy + rr * math.sin(a):.1f}')
    return f'<path d="{"".join(d)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def capsid(cx, cy, r, n=14, bead=None, fill=COAT, edge=COAT_D):
    """A protein coat drawn as a ring of capsomeres (protein units)."""
    bead = bead or r * 0.22
    out = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{edge}" stroke-width="{bead * 2 + 3:.1f}"/>'
    for i in range(n):
        x, y = pt(cx, cy, r, i * 360 / n)
        out += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{bead:.1f}" fill="{fill}" stroke="{edge}" stroke-width="1.6"/>'
    return out


def spikes(cx, cy, r0, r1, n=12, head=6.5, start=0):
    out = ''
    for i in range(n):
        a = start + i * 360 / n
        x0, y0 = pt(cx, cy, r0, a)
        x1, y1 = pt(cx, cy, r1, a)
        out += (f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="{SPIKE_D}" stroke-width="4" stroke-linecap="round"/>'
                f'<circle cx="{x1:.1f}" cy="{y1:.1f}" r="{head}" fill="{SPIKE}" stroke="{SPIKE_D}" stroke-width="1.8"/>')
    return out


def small_virus(cx, cy, r=16, n_spikes=8, strand=True):
    """A small round virus: spikes, coat and a strand inside."""
    out = spikes(cx, cy, r, r + 7, n_spikes, 3.2, 10)
    out += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{COAT}" stroke="{COAT_D}" stroke-width="2.4"/>'
    out += f'<circle cx="{cx}" cy="{cy}" r="{r * .62:.1f}" fill="#FFF4E0"/>'
    if strand:
        out += blob_coil(cx, cy, r * .5, NUC, 2, 3)
    return out


def antibody(x, y, deg=0, s=1.0, color=AB):
    """A Y-shaped antibody: stem at (x, y), arms pointing along deg (0 = up)."""
    return (f'<g transform="translate({x} {y}) rotate({deg}) scale({s})"><path d="M0 0V-12M0 -12L-7 -21M0 -12L7 -21" fill="none" '
            f'stroke="{color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>')


def bacterium(cx, cy, w, h, deg=0, fill=BACT, edge=BACT_D):
    r = h / 2
    return (f'<g transform="rotate({deg} {cx} {cy})"><rect x="{cx - w / 2}" y="{cy - r}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
            f'stroke="{edge}" stroke-width="2.4"/><path d="M{cx - w / 4} {cy - 2}q6 5 12 0t12 0" fill="none" stroke="{edge}" stroke-width="1.6" '
            f'stroke-linecap="round"/></g>')


def caption(x, y, text, anchor='start', size=11, color='#5B6B84'):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="{size}" '
            f'fill="{color}">{text}</text>')


# ---------------------------------------------------------------- the structure of a virus
def virus():
    cx, cy = 186, 164
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    body += caption(16, 304, 'About 100 nm across: far smaller than a bacterium')
    # Nucleic acid first: the core of the virus (its genes, DNA or RNA).
    body += part(0, f'<circle cx="{cx}" cy="{cy}" r="52" fill="#FFF4E0"/>' + blob_coil(cx, cy, 44, NUC, 3.4, 5))
    body += part(1, capsid(cx, cy, 64, 16, 9))
    body += part(2, f'<circle cx="{cx}" cy="{cy}" r="88" fill="none" stroke="{ENV_D}" stroke-width="15"/>'
                    f'<circle cx="{cx}" cy="{cy}" r="88" fill="none" stroke="{ENV}" stroke-width="11"/>')
    body += part(3, spikes(cx, cy, 95, 118, 14, 7.5, 8))
    labels = [
        {'text': 'Nucleic acid (DNA or RNA)', 'keys': [['nucleic'], ['dna'], ['rna']]},
        {'text': 'Protein coat (capsid)', 'keys': [['protein'], ['coat'], ['capsid']]},
        {'text': 'Envelope (some viruses)', 'keys': [['envelope'], ['membrane']]},
        {'text': 'Spike proteins (antigens)', 'keys': [['spike'], ['antigen']]},
    ]
    nx, ny = pt(cx, cy, 30, -20)
    cxp, cyp = pt(cx, cy, 64, 28)
    ex, ey = pt(cx, cy, 88, 140)
    sx, sy = pt(cx, cy, 118, -46 + 3.4)
    body += lab(0, 'NUCLEIC ACID', 'start', 330, 128, round(nx, 1), round(ny, 1))
    body += lab(1, 'PROTEIN COAT', 'start', 330, 196, round(cxp, 1), round(cyp, 1))
    body += lab(2, 'ENVELOPE', 'start', 330, 262, round(ex, 1) + 0, round(ey, 1))
    body += lab(3, 'SPIKE (ANTIGEN)', 'start', 318, 52, round(sx, 1), round(sy, 1))
    anchors = {'nucleic': [round(nx, 1), round(ny, 1)], 'coat': [round(cxp, 1), round(cyp, 1)], 'envelope': [round(ex, 1), round(ey, 1)],
               'spike': [round(sx, 1), round(sy, 1)]}
    parts = ['Nucleic acid (DNA or RNA)', 'Protein coat (capsid)', 'Envelope', 'Spike proteins (antigens)']
    return finish('virus', 'The structure of a virus', 'the structure of a virus',
                  'Nucleic acid (DNA or RNA) in the middle, a protein coat (capsid) around it, then an envelope in some viruses, with spike proteins sticking out: they are the antigens.',
                  'The structure of a virus', 'A round virus. In the middle is its nucleic acid, DNA or RNA. Around it is the protein coat, or capsid. Some viruses have an envelope outside that, and spike proteins stick out of the surface: these are the antigens the immune system recognises.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- a bacteriophage injecting its DNA
def phage():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    # The host cell: a bacterium, its wall along the bottom and its own DNA loop inside.
    host = f'<path d="M-10 214C120 202 360 202 490 214V330H-10Z" fill="{BACT}" stroke="{BACT_D}" stroke-width="5"/>'
    body += part(0, host)
    hx, hy, hr = 240, 62, 46
    hexa = ' '.join(f'{x:.1f},{y:.1f}' for x, y in (pt(hx, hy, hr, a) for a in range(-90, 270, 60)))
    inner = ' '.join(f'{x:.1f},{y:.1f}' for x, y in (pt(hx, hy, hr - 10, a) for a in range(-90, 270, 60)))
    head = (f'<polygon points="{hexa}" fill="{COAT}" stroke="{COAT_D}" stroke-width="3" stroke-linejoin="round"/>'
            f'<polygon points="{inner}" fill="#FFF4E0"/>'
            + ''.join(f'<path d="M{hx:.1f} {hy:.1f}L{x:.1f} {y:.1f}" stroke="{COAT_D}" stroke-width="1.2" opacity=".35"/>'
                      for x, y in (pt(hx, hy, hr, a) for a in range(-90, 270, 60))))
    body += part(1, head)
    body += part(2, blob_coil(hx, hy, 28, NUC, 3, 4))
    tail = (f'<rect x="{hx - 8}" y="{hy + hr - 2}" width="16" height="10" rx="2" fill="{COAT_D}"/>'
            f'<rect x="{hx - 10}" y="{hy + hr + 8}" width="20" height="58" rx="4" fill="#E9C46A" stroke="{COAT_D}" stroke-width="2.4"/>'
            + ''.join(f'<path d="M{hx - 10} {y}H{hx + 10}" stroke="{COAT_D}" stroke-width="1.6"/>' for y in range(hy + hr + 16, hy + hr + 64, 8))
            + f'<rect x="{hx - 22}" y="{hy + hr + 64}" width="44" height="9" rx="3" fill="{COAT_D}"/>')
    body += part(3, tail)
    by = hy + hr + 72
    # The fibres reach down and rest on the cell surface (y about 205).
    fib = ''.join(f'<path d="M{hx + sx * 16} {by}L{hx + sx * 50} {by + 12}L{hx + sx * 42} 205" fill="none" stroke="{COAT_D}" stroke-width="3.2" '
                  f'stroke-linecap="round" stroke-linejoin="round"/>' for sx in (-1, 1))
    fib += ''.join(f'<path d="M{hx + sx * 10} {by + 2}L{hx + sx * 30} {by + 14}L{hx + sx * 24} 205" fill="none" stroke="{COAT_D}" stroke-width="2.6" '
                   f'stroke-linecap="round" stroke-linejoin="round"/>' for sx in (-1, 1))
    body += part(4, fib)
    # The phage's DNA going in through the tail, into the host cell.
    inj = coil(hx, by + 8, hx, 222, 3, 2, NUC, 3) + coil(hx, 222, hx + 64, 270, 6, 3, NUC, 3)
    body += part(5, inj)
    labels = [
        {'text': 'Host cell (a bacterium)', 'keys': [['host'], ['bacteri'], ['cell']]},
        {'text': 'Protein coat (head)', 'keys': [['protein'], ['coat'], ['capsid'], ['head']]},
        {'text': 'Nucleic acid (DNA)', 'keys': [['nucleic'], ['dna']]},
        {'text': 'Tail', 'keys': [['tail']]},
        {'text': 'Tail fibres (attach to the host)', 'keys': [['fibre'], ['fiber'], ['leg']]},
        {'text': 'Viral DNA entering the host', 'keys': [['enter'], ['inject'], ['dna']]},
    ]
    body += lab(0, 'HOST CELL', 'start', 40, 296, 110, 250)
    body += lab(1, 'PROTEIN COAT', 'start', 314, 30, 278, 40)
    body += lab(2, 'NUCLEIC ACID', 'end', 168, 44, 224, 62)
    body += lab(3, 'TAIL', 'start', 314, 136, 250, 138)
    body += lab(4, 'TAIL FIBRES', 'end', 166, 162, 202, 192)
    body += lab(5, 'DNA GOING IN', 'start', 330, 270, 300, 268)
    anchors = {'host': [110, 250], 'coat': [278, 40], 'nucleic': [224, 62], 'tail': [250, 138], 'fibres': [202, 192], 'injected': [300, 268],
               'virus': [196, 40]}
    parts = ['Host cell (a bacterium)', 'Protein coat (head)', 'Nucleic acid (DNA)', 'Tail', 'Tail fibres', 'Viral DNA entering']
    return finish('phage', 'A virus attacking a host cell', 'a bacteriophage virus attached to its host cell',
                  'A six-sided head of protein holding the DNA, a tail and tail fibres gripping the host cell. The DNA is injected through the tail into the cell.',
                  'A bacteriophage on its host cell', 'A bacteriophage, a virus that attacks bacteria. Its six-sided head is a protein coat with its nucleic acid (DNA) inside. Below it is a tail and tail fibres, which grip the surface of the host cell, a bacterium. The virus injects its DNA through the tail into the host cell.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- how a virus multiplies in a host cell
def replication():
    body = f'<rect width="480" height="320" fill="{BG}"/>'
    cell = (f'<path d="M86 64C150 30 330 26 404 62C452 86 460 230 410 270C340 312 160 314 92 278C40 248 36 92 86 64Z" fill="{CELL}" '
            f'stroke="{CELL_D}" stroke-width="5"/>')
    body += part(0, cell)
    body += part(1, f'<ellipse cx="318" cy="178" rx="48" ry="40" fill="{NUCLEUS}" stroke="{NUCLEUS_D}" stroke-width="2.6"/>'
                    f'<path d="M296 168c8-8 18 4 26-2s18-6 22 4M300 192c10 6 20-4 30 2" fill="none" stroke="{NUCLEUS_D}" stroke-width="1.6" opacity=".6"/>')
    # 1: a virus attaches to the cell membrane.
    body += part(2, small_virus(66, 52, 17))
    # 2: it gets in and its nucleic acid is released into the cytoplasm.
    enter = (f'<path d="M112 82a16 16 0 1 1 26 14" fill="none" stroke="{COAT}" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/>'
             + coil(130, 96, 176, 140, 5, 3, NUC, 3))
    body += part(3, enter)
    # 3: the host cell's ribosomes, enzymes and energy copy the viral nucleic acid and make coat proteins.
    made = ''.join(coil(x, y, x + 30, y + 6, 3.5, 2, NUC, 2.6) for x, y in [(206, 102), (220, 128), (196, 150)])
    made += ''.join(f'<circle cx="{x}" cy="{y}" r="4.6" fill="{COAT}" stroke="{COAT_D}" stroke-width="1.4"/>'
                    for x, y in [(252, 98), (262, 112), (246, 120), (270, 130), (256, 140), (238, 108)])
    made += ''.join(f'<circle cx="{x}" cy="{y}" r="2.6" fill="#7E5BA3"/>' for x, y in [(232, 94), (244, 132), (276, 104), (224, 146), (266, 148)])
    body += part(4, made)
    # 4: new viruses are put together.
    asm = ''.join(small_virus(x, y, 14, 7) for x, y in [(160, 218), (206, 246), (250, 214)])
    asm += (f'<circle cx="122" cy="186" r="14" fill="none" stroke="{COAT_D}" stroke-width="2.4" stroke-dasharray="5 4"/>'
            + coil(116, 186, 128, 186, 2.5, 1, NUC, 2))
    body += part(5, asm)
    # 5: they burst out (or bud off), killing the cell, and go on to infect more cells.
    rel = ''.join(small_virus(x, y, 13, 7) for x, y in [(428, 104), (456, 146), (452, 204), (424, 244)])
    rel += ''.join(f'<path d="M{x0} {y0}L{x1} {y1}" stroke="#5B6B84" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/>'
                   for x0, y0, x1, y1 in [(398, 150, 438, 146), (402, 200, 434, 204)])
    body += part(6, rel)
    labels = [
        {'text': 'Host cell', 'keys': [['host'], ['cell']]},
        {'text': 'Host nucleus', 'keys': [['nucleus']]},
        {'text': '1. The virus attaches to the host cell', 'keys': [['attach']]},
        {'text': '2. Its nucleic acid enters the cell', 'keys': [['enter'], ['inject'], ['nucleic']]},
        {'text': '3. The host cell copies the nucleic acid and makes viral proteins', 'keys': [['cop'], ['replicat'], ['protein'], ['made']]},
        {'text': '4. New viruses are assembled', 'keys': [['assembl'], ['new']]},
        {'text': '5. New viruses are released (the cell bursts)', 'keys': [['releas'], ['burst']]},
    ]
    body += lab(0, 'HOST CELL', 'start', 40, 304, 104, 276)
    body += lab(1, 'HOST NUCLEUS', 'top', 318, 236, 318, 206)
    body += lab(2, '1 ATTACHES', 'start', 98, 18, 80, 40)
    body += lab(3, '2 NUCLEIC ACID ENTERS', 'start', 222, 18, 168, 132)
    body += lab(4, '3 COPIES MADE', 'start', 300, 70, 262, 112)
    body += lab(5, '4 ASSEMBLED', 'end', 140, 238, 152, 214)
    body += lab(6, '5 RELEASED', 'end', 470, 290, 424, 252)
    anchors = {'host': [104, 276], 'nucleus': [318, 206], 'attach': [80, 40], 'virus': [66, 52], 'enter': [168, 132], 'made': [262, 112],
               'assemble': [152, 214], 'release': [424, 252], 'membrane': [404, 62]}
    parts = ['Host cell', 'Host nucleus', '1. Virus attaches', '2. Nucleic acid enters', '3. Copies are made', '4. New viruses assembled',
             '5. New viruses released']
    return finish('replication', 'How a virus multiplies', 'how a virus multiplies inside a host cell',
                  'Five steps round the cell: the virus attaches, its nucleic acid gets in, the host cell copies it and makes viral proteins, new viruses are assembled, then they are released.',
                  'How a virus multiplies inside a host cell', 'A virus attaches to a host cell and its nucleic acid enters the cell. The host cell is then used to copy the viral nucleic acid and to make the viral proteins. New viruses are assembled from these parts and released, often bursting the cell, to infect more cells.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- a B lymphocyte making antibodies
def lymphocyte():
    body = f'<rect width="480" height="320" fill="{TISSUE}"/>'
    cx, cy = 128, 168
    cell = f'<circle cx="{cx}" cy="{cy}" r="82" fill="{WBC}" stroke="{WBC_D}" stroke-width="4"/>'
    # Antibody receptors sit in its membrane, arms out.
    cell += ''.join(antibody(*[round(v, 1) for v in pt(cx, cy, 82, a)], deg=a + 90, s=0.9) for a in range(-150, 210, 40))
    body += part(0, cell)
    body += part(1, f'<circle cx="{cx - 6}" cy="{cy + 4}" r="58" fill="{NUCLEUS}" stroke="{NUCLEUS_D}" stroke-width="2.6"/>'
                    f'<path d="M96 150c10-10 24 4 36-2s22-8 28 4M100 186c12 8 26-6 40 2" fill="none" stroke="{NUCLEUS_D}" stroke-width="1.8" opacity=".55"/>')
    # Antibodies released into the blood or lymph.
    free = ''.join(antibody(x, y, d, 1.1) for x, y, d in [(236, 112, 70), (252, 168, 95), (240, 222, 120), (288, 136, 80), (290, 204, 105)])
    body += part(2, free)
    # The pathogen: a bacterium with antigens on its surface.
    bx, by = 392, 168
    body += part(3, bacterium(bx, by, 132, 64, 90))
    ants = [(bx - 32, by - 52), (bx + 32, by - 36), (bx - 32, by + 8), (bx + 32, by + 40), (bx - 32, by + 58)]
    body += part(4, ''.join(f'<path d="M{x} {y - 6}l{6 if x > bx else -6} 6l{-6 if x > bx else 6} 6z" fill="#E5484D" stroke="{RED_D}" stroke-width="1.6" '
                            f'stroke-linejoin="round"/>' for x, y in ants))
    # Antibodies locked onto the antigens: the bacterium is marked for destruction.
    bound = ''.join(antibody(x + (27 if x > bx else -27), y, -90 if x > bx else 90, 1.0) for x, y in ants[1:4])
    body += part(5, bound)
    labels = [
        {'text': 'B lymphocyte', 'keys': [['lymphocyte'], ['b', 'cell']]},
        {'text': 'Nucleus', 'keys': [['nucleus']]},
        {'text': 'Antibodies (Y-shaped proteins)', 'keys': [['antibod']]},
        {'text': 'Pathogen (a bacterium)', 'keys': [['pathogen'], ['bacteri']]},
        {'text': 'Antigen', 'keys': [['antigen']]},
        {'text': 'Antibody bound to an antigen', 'keys': [['bound'], ['bind'], ['attach'], ['lock']]},
    ]
    body += lab(0, 'B LYMPHOCYTE', 'start', 24, 26, 70, 100)
    body += lab(1, 'NUCLEUS', 'start', 24, 300, 108, 214)
    body += lab(2, 'ANTIBODY', 'bottom', 252, 70, 240, 104)
    body += lab(3, 'PATHOGEN', 'end', 472, 26, 392, 112)
    body += lab(4, 'ANTIGEN', 'end', 472, 300, 430, 214)
    body += lab(5, 'BOUND ANTIBODY', 'top', 300, 262, 344, 178)
    anchors = {'lymphocyte': [70, 100], 'nucleus': [108, 214], 'antibody': [240, 104], 'receptor': [128, 82], 'pathogen': [392, 112],
               'antigen': [430, 214], 'bound': [344, 178]}
    parts = ['B lymphocyte', 'Nucleus', 'Antibodies released', 'Pathogen (bacterium)', 'Antigens', 'Antibodies bound to antigens']
    return finish('lymphocyte', 'A B lymphocyte making antibodies', 'a B lymphocyte making antibodies against a pathogen',
                  'A round B lymphocyte with a big nucleus and antibodies on its surface. It releases Y-shaped antibodies, which lock onto the antigens on a pathogen.',
                  'A B lymphocyte making antibodies', 'A B lymphocyte: a round white blood cell with a large nucleus and antibody receptors in its membrane. It releases Y-shaped antibodies. On the right a pathogen, a bacterium, has antigens on its surface, and antibodies have locked onto them, marking it for destruction.',
                  body, labels, anchors, parts)


# ---------------------------------------------------------------- an alveolar macrophage
def macrophage():
    body = f'<rect width="480" height="320" fill="#F3DCCB"/>'
    # The alveolus: an air space with a thin wall, one cell thick.
    air = ('<path d="M40 -10H440V196C440 236 404 246 360 246H120C76 246 40 236 40 196Z" fill="#EAF7FD" stroke="#F2948C" stroke-width="9"/>')
    body += part(0, air + caption(240, 40, 'AIR', 'middle', 13, '#7FA9C2'))
    cap = ('<path d="M-10 270H490V312H-10Z" fill="#F7B5AE" stroke="#C2364A" stroke-width="3"/>'
           + ''.join(f'<ellipse cx="{x}" cy="291" rx="15" ry="9" fill="{RED}" stroke="{RED_D}" stroke-width="1.6"/>'
                     f'<ellipse cx="{x}" cy="291" rx="6" ry="3" fill="{RED_D}" opacity=".5"/>' for x in (60, 150, 250, 330, 420)))
    body += part(1, cap)
    # The macrophage on the inner wall, reaching out pseudopods round the bacteria.
    mac = ('<path d="M100 236C92 206 112 182 140 178C150 156 176 150 194 162C214 150 246 156 248 176C268 170 288 186 282 204C296 214 292 236 276 238Z" '
           f'fill="#E9DDF5" stroke="{PURPLE}" stroke-width="3.4" stroke-linejoin="round"/>'
           f'<path d="M246 178C262 158 294 150 326 160" fill="none" stroke="{PURPLE}" stroke-width="9" stroke-linecap="round"/>'
           f'<path d="M246 178C262 158 294 150 326 160" fill="none" stroke="#E9DDF5" stroke-width="4" stroke-linecap="round"/>'
           f'<path d="M278 206C298 198 318 198 334 186" fill="none" stroke="{PURPLE}" stroke-width="9" stroke-linecap="round"/>'
           f'<path d="M278 206C298 198 318 198 334 186" fill="none" stroke="#E9DDF5" stroke-width="4" stroke-linecap="round"/>'
           f'<ellipse cx="160" cy="210" rx="26" ry="17" fill="{NUCLEUS}" stroke="{NUCLEUS_D}" stroke-width="2"/>')
    # Inside: a bacterium already taken in, being digested in a vesicle.
    mac += (f'<circle cx="222" cy="206" r="15" fill="#F6E7C8" stroke="{PURPLE}" stroke-width="1.8"/>'
            + bacterium(222, 206, 18, 9, 30, '#C9DFA8', BACT_D))
    body += part(2, mac)
    bact = ''.join(bacterium(x, y, 30, 14, d) for x, y, d in [(304, 178, 4), (364, 118, -30), (398, 172, 70), (318, 92, 10)])
    body += part(3, bact)
    labels = [
        {'text': 'Alveolus (air space)', 'keys': [['alveol'], ['air']]},
        {'text': 'Capillary (with red blood cells)', 'keys': [['capillar'], ['blood']]},
        {'text': 'Alveolar macrophage (a monocyte)', 'keys': [['macrophage'], ['monocyte'], ['phagocyte']]},
        {'text': 'Bacteria (pathogens)', 'keys': [['bacteri'], ['pathogen']]},
        {'text': 'Bacterium being digested', 'keys': [['digest'], ['lysosome'], ['engulf']]},
    ]
    body += lab(0, 'ALVEOLUS', 'start', 60, 28, 120, 80)
    body += lab(1, 'CAPILLARY', 'end', 470, 304 - 50, 430, 280)
    body += lab(2, 'MACROPHAGE', 'start', 54, 146, 130, 196)
    body += lab(3, 'BACTERIA', 'end', 470, 64, 372, 110)
    body += lab(4, 'BEING DIGESTED', 'top', 214, 252, 222, 214)
    anchors = {'alveolus': [120, 80], 'wall': [440, 120], 'capillary': [430, 280], 'rbc': [250, 291], 'macrophage': [130, 196],
               'bacteria': [372, 110], 'digested': [222, 214], 'pseudopod': [300, 156], 'engulfed': [304, 178]}
    parts = ['Alveolus (air space)', 'Capillary', 'Alveolar macrophage', 'Bacteria']
    return finish('macrophage', 'A macrophage in an alveolus', 'an alveolar macrophage engulfing bacteria in an alveolus',
                  'The air space of the alveolus, the capillary below it, and a macrophage on the inner wall reaching round bacteria to engulf and digest them.',
                  'An alveolar macrophage', 'An alveolus with its thin wall and a capillary of red blood cells below. On the inside of the wall sits an alveolar macrophage, a monocyte that has left the blood. It reaches out round bacteria in the air space, engulfs them and digests them inside.',
                  body, labels, anchors, parts)


MAKERS = [virus, phage, replication, lymphocyte, macrophage]


# Where each structure is on a base diagram: the words that name it, in the order they are checked.
ANCHOR_WORDS = {
    'virus': [('spike', ['spike', 'antigen', 'surface protein']), ('nucleic', ['nucleic', 'dna', 'rna', 'strand']),
              ('coat', ['protein', 'coat', 'capsid']), ('envelope', ['envelope', 'membrane', 'lipid'])],
    'phage': [('host', ['host']), ('nucleic', ['nucleic', 'dna', 'rna', 'strand']), ('coat', ['protein', 'coat', 'capsid', 'head']),
              ('fibres', ['fibre', 'fiber']), ('tail', ['tail']), ('virus', ['virus'])],
    'replication': [('nucleus', ['nucleus']), ('attach', ['attach']), ('enter', ['enter', 'inject']), ('made', ['cop', 'replicat', 'protein']),
                    ('assemble', ['assembl']), ('release', ['releas', 'burst']), ('host', ['host', 'cell'])],
    'lymphocyte': [('antigen', ['antigen']), ('bound', ['bound']), ('antibody', ['antibod']), ('nucleus', ['nucleus']),
                   ('pathogen', ['pathogen', 'bacteri']), ('lymphocyte', ['lymphocyte', 'cell'])],
    'macrophage': [('macrophage', ['macrophage', 'monocyte', 'phagocyte']), ('capillary', ['capillar']), ('rbc', ['red blood']),
                   ('bacteria', ['bacteri', 'pathogen']), ('alveolus', ['alveol', 'air space'])],
}


def base_of(what):
    # Strict, because other chapters' questions are checked against these too.
    w = what.lower()
    if re.search(r'\bgraph', w) or 'prion' in w:  # (a micrograph is fine)
        return None
    if 'bacteriophage' in w:
        return 'phage'
    if 'lymphocyte' in w and 'antibod' in w:
        return 'lymphocyte'
    if 'alveol' in w and 'macrophage' in w:
        return 'macrophage'
    if 'virus' in w and ('spike' in w or 'strand' in w or 'coat' in w or 'helix' in w):
        return 'virus'
    return None


# Hand-written marking keys (OVERRIDES['points']): each string is one alternative, every word of it needed; word
# stems are matched as bio/bio.js does (so 'infec' is infect/infected/infection, 'make' is also produce/made).
def _k(*alts):
    return [{'w': a.split(), 'n': len(a.split())} for a in alts]


def _x(firsts, seconds):
    """Every pairing of a word from firsts with one from seconds ('mucus trap', 'mucus catch', ...)."""
    return [f'{a} {b}' for a in firsts for b in seconds]


# Answers several parts share.
_VIRUS_NAMES = ['hiv', 'aid', 'flu', 'influenza', 'measle', 'mump', 'rubella', 'polio', 'raby', 'cold', 'ebola', 'hepatitis', 'herpe',
                'zika', 'smallpox', 'chickenpox', 'chicken pox', 'hpv', 'papilloma', 'wart', 'shingle', 'norovirus', 'rotavirus', 'dengue',
                'yellow fever', 'glandular fever', 'myxoma', 'mosaic', 'foot mouth', 'monkeypox', 'mpox', 'epstein']
_CORONA = ['corona', 'covid', 'sar']   # SARS-CoV-2 and COVID-19 (left out where the question rules SARS-CoV-2 out)
_BACTERIA_NAMES = ['salmonella', 'mrsa', 'staph', 'strep', 'coli', 'ecoli', 'listeria', 'clostrid', 'tetanus', 'tubercul', 'tb',
                   'cholera', 'mycobact', 'anthrax', 'typhoid', 'syphilis', 'gonorrh', 'chlamydia', 'whooping cough', 'diphtheria',
                   'lepros', 'botulism', 'legion', 'campylobact', 'pneumococc', 'meningococc', 'helicobact', 'pylori', 'lyme', 'impetigo',
                   'scarlet fever', 'plague', 'shigella', 'vibrio', 'bacteri disease', 'bacteri meningit', 'bacteri pneumonia']
# Beneficial uses of viruses (schemes that accept 'any other valid answer').
_VIRUS_USES = ['genetic engineer', 'genetic modif', 'vector', 'gene therapy', 'carry gene', 'deliver gene', 'insert gene', 'vaccin',
               'phage', 'bacteriophage', 'kill bacteria', 'treat bacteri infec', 'cancer', 'tumour', 'tumor', 'biological control',
               'pest control', 'control rabbit', 'myxoma', 'research']
# A vaccine: a harmless (weakened, dead, ...) form or dose of the pathogen or its antigen.
_VACCINE = (_x(['harmless', 'weak', 'attenuat', 'dead', 'inactiv', 'mild', 'modif'],
               ['pathogen', 'antigen', 'virus', 'microb', 'bacteri', 'germ', 'dose', 'form', 'strain', 'version', 'toxin', 'toxoid'])
            + ['non harmful pathogen', 'non harmful antigen', 'non harmful dose', 'non disease caus', 'non disease dose', 'non disease pathogen',
               'non living dose', 'non living pathogen', 'part pathogen', 'part virus', 'administr attenuat pathogen'])
# The body making its own antibodies (not 'ready-made antibodies').
_OWN_ANTIBODIES = ['stimulate antibody', 'trigger antibody', 'body make antibody', 'b make antibody', 'lymphocyte make antibody',
                   'immune make antibody', 'own antibody']
_NON_CELLULAR = ['non cellular', 'noncellular', 'acellular', 'not made cell', 'arent made cell', 'isnt made cell', 'not compos cell',
                 'not consist cell']
_HOST_ONLY = ['host reproduc', 'host replicat', 'host multipl', 'need host', 'only reproduc', 'only replicat', 'only multipl',
              'cannot reproduc', 'cannot replicat', 'cannot multipl']
_ONE_NUCLEIC = ['one nucleic', 'one type nucleic', 'either dna', 'either rna', 'not both']
_NO_ORGANELLES = _x(['no', 'lack', 'without', 'not'], ['organelle', 'ribosome', 'mitochondri'])
# The virus's nucleic acid going into the host cell.
_NUCLEIC_IN = _x(['nucleic', 'dna', 'rna', 'genetic', 'genome'], ['inject', 'enter', 'entry', 'insert', 'introduc'])
_USES_HOST = ['use host structure', 'host organelle', 'use organelle', 'host ribosome', 'host machinery', 'host enzyme', 'host resource']
_ASSEMBLE = ['assembl', 'put together']
_RELEASED = ['releas', 'lysis', 'lyse', 'burst', 'bud']
_NOT_ON_VIRUSES = ['affect virus', 'work virus', 'useless virus', 'ineffect virus', 'only bacteri', 'not kill virus', 'dont kill virus',
                   'cannot kill virus', 'no effect']
_BY_MICROBES = ['make micro', 'make fung', 'make mould', 'make by bacteri']
_ANTIGEN = ['caus antibody', 'trigger antibody', 'stimulate antibody', 'foreign molecul', 'foreign substance', 'foreign particle',
            'foreign protein']
_ANTIBODY = ['protein response', 'protein antigen', 'make response antigen', 'make against antigen', 'protein lymphocyte',
             'protein inactivat', 'protein b']
# T cells' jobs.
_HELPER = ['recogn antigen', 'interferon', 'stimulate b', 'activat b', 'stimulate antibody', 'activat kill', 'stimulate kill']
_KILLER = ['attack infect', 'kill infect', 'destroy infect', 'burst infect', 'recogn infect', 'perforin', 'kill cancer', 'destroy cancer']
_SUPPRESSOR = ['stop response', 'stop immune', 'switch off', 'turn off', 'suppress response', 'suppress immune', 'inhibit b',
               'inhibit t', 'end response', 'shut down']
_MEMORY = ['rememb', 'long term', 'long last']
_B_ROLE = ['make antibody', 'secrete antibody', 'release antibody']
_LYMPHOCYTE_ROLES = _B_ROLE + _HELPER + _KILLER + _SUPPRESSOR + _MEMORY
_LYMPHOCYTE_NAMES = ['b cell', 'b lymphocyte', 't cell', 't lymphocyte', 'suppressor']


# Per-question corrections the general rules can't work out: diagrams with two panels or graphs, the right
# answer areas for 'tap' parts, answer types, how many points a part needs ('n') and hand-written keys ('points').
# A part whose label has two words ('(iv) 1.') is named by its full label, so it doesn't share the short id.
OVERRIDES = {
    'dia': {
        # A bacteriophage on its host cell: A the head's protein coat, B the coiled nucleic acid.
        '2010-Q6': {'base': 'phage', 'marks': [{'t': 'A', 'a': 'coat'}, {'t': 'B', 'a': 'nucleic'}, {'t': 'Virus', 'a': 'virus', 'given': True},
                                                {'t': 'Host cell', 'a': 'host', 'given': True}]},
        # Only A is marked: the box X is where the candidate draws an arrow to an antigen (part b).
        '2022-Q7': {'base': 'virus', 'marks': [{'t': 'A', 'a': 'nucleic'}]},
        # Diagram 1: the virus (X coat, Y nucleic acid). Diagram 2: a virus at a host cell, its nucleic acid going in.
        '2026-Q16b': {'panels': [{'base': 'virus', 'marks': [{'t': 'X', 'a': 'coat'}, {'t': 'Y', 'a': 'nucleic'}]},
                                 {'base': 'phage', 'marks': []}]},
        'S2-Q1e': {'fig': [{'img': 'assets/bio/papers/s2-p07.webp', 'box': [64.2, 10.2, 24.0, 18.0]}]},  # the normal protein and the prion
        '2025-Q16d': {'base': 'lymphocyte', 'marks': [{'t': 'Lymphocyte', 'a': 'lymphocyte', 'given': True}]},
        'S1-Q3b': {'base': 'macrophage', 'marks': [{'t': 'Alveolus (air space)', 'a': 'alveolus', 'given': True},
                                                   {'t': 'Alveolar macrophage', 'a': 'macrophage', 'given': True},
                                                   {'t': 'Capillary lumen', 'a': 'capillary', 'given': True}]},
        # The antibody response: a small, slow rise after the vaccine (A), a fast, big one after infection (B).
        '2021-Q16c': {'graphs': [{'title': 'Antibodies after a vaccine (A) and an infection (B)', 'x': 'Time (days)',
                                  'y': 'Relative antibody concentration',
                                  'series': [{'name': 'Antibodies', 'pts': [[0, 2], [6, 3], [14, 12], [22, 16], [32, 9], [44, 4], [50, 4], [56, 40],
                                                                            [62, 88], [70, 80], [82, 52], [100, 34]]}],
                                  'marks': [{'t': 'A', 'at': [4, 30]}, {'t': 'B', 'at': [50, 30]}]}]},
    },
    'tap': {  # part id -> anchors that are right
        '2022-Q7(b)': ['spike'],
    },
    'n': {
        'S1-Q3b(ii)': 1,         # one response, named and described: each scheme line is a whole response
        'S2-Q1b(i)': 1,          # 'likely one point': the three lines are three different reasons
        '2005-Q15a(iii)': 4,     # two names + two roles
        '2023-Q16c(v)': 4,       # two general + two specific
        '2024-Q16d(ii) 3.': 4,   # two names + two matching functions
        '2017-Q14b(iv)': 3,      # one role for each of three T cells (the rule's 'any one' reads as 1)
    },
    'points': {
        'S1-Q3b(i)': {
            0: _k('engulf', 'phagocyt', 'ingest'),
            2: _k('non specific', 'nonspecific', 'not specific', 'any pathogen', 'any microb', 'any germ', 'any foreign', 'all pathogen'),
            4: _k('present antigen', 'display antigen', 'show antigen', 'activat lymphocyte', 'activat t'),
        },
        # One innate response, named and described (each needs its name and a word of how it works).
        'S1-Q3b(ii)': {
            0: _k(*_x(['inflamm'], ['histamine', 'dilat', 'widen', 'leak', 'swell', 'swollen', 'red', 'redness', 'heat', 'warm', 'blood',
                                    'phagocyt', 'white', 'mast']), 'histamine dilat', 'histamine leak', 'mast histamine'),
            1: _k(*_x(['fever'], ['enzyme', 'denatur', 'slow', 'growth', 'kill', 'multipl', 'reproduc', 'stop']),
                  'temperature denatur', 'temperature enzyme', 'temperature slow'),
            2: _k(*_x(['skin'], ['barri', 'block', 'keratin', 'sebum', 'sweat', 'entry', 'enter', 'stop', 'tough', 'dead', 'waterproof', 'intact'])),
            3: _k('mucus trap', 'mucus catch', 'mucus stick', 'mucus cilia', 'mucus sweep', 'cilia sweep', 'cilia trap', 'cilia mov',
                  'cilia waft', 'cilia beat'),
            4: _k('acid kill', 'acid destroy', 'acid denatur', 'hydrochlor kill'),
            5: _k(*_x(['lysozyme'], ['tear', 'saliva', 'bacteri', 'destroy', 'kill', 'digest', 'break', 'wall']),
                  'tear enzyme', 'saliva enzyme', 'tear kill', 'tear destroy'),
            6: _k(*_x(['clot'], ['wound', 'seal', 'entry', 'enter', 'block', 'plug', 'scab', 'cut'])),
            7: _k('natur kill infect', 'natur kill virus', 'natur kill cancer', 'natur kill tumour', 'nk infect', 'nk virus', 'nk cancer'),
            8: _k(*_x(['interferon'], ['neighbour', 'protect', 'infect', 'virus', 'spread', 'release', 'nearby'])),
        },
        'S2-Q1b(i)': {
            0: _k('genetic differ', 'genetic vary', 'genetic vari', 'genetic respond', 'gene differ', 'ethnic', 'differ respond'),
            1: _k('represent', 'apply world', 'apply everyone', 'apply all people', 'valid world', 'global popul'),
            2: _k('different strain', 'strain vary', 'variant pathogen', 'variant virus', 'different environ country', 'environ differ'),
        },
        'S2-Q1b(ii)': {
            0: _k('control placebo', 'control dummy', 'control fake', 'control saline', 'placebo injec', 'placebo jab', 'dummy injec',
                  'dummy jab', 'placebo without vaccine', 'placebo no vaccine'),
            1: _k('compar group', 'compar control', 'compar placebo', 'compar unvaccin', 'due vaccine', 'placebo effect'),
        },
        'S2-Q1b(iii)': {
            0: _k('large reliab', 'more reliab', 'increas reliab', 'high reliab'),
            1: _k('effect chance', 'reduce chance', 'cut chance', 'anomal', 'outlier', 'individu vari', 'individu differ', 'odd result',
                  'random error'),
        },
        'S2-Q1e(ii)': {0: _k('eating beef', 'beef product infect cattle', 'eat meat', 'eat infect', 'eat contaminat', 'eat beef')},
        'S2-Q1e(iii)': {
            0: _k('specific shape', '3d shape', '3d structure', 'three dimension', 'fold shape', 'tertiary', 'particular shape', 'unique shape'),
            1: _k('shape func', 'structure func', 'shape work', 'shape determine', 'misfold func', 'misfold work', 'cause disease', 'active site'),
        },
        'S2-Q1e(iv)': {0: _k('virus', 'phage', 'bacteriophage', *_VIRUS_NAMES, *_CORONA)},
        '2026-Q16b(ii)': {0: _k('rod', 'complex', 'helic', 'spiral', 'polyhedr', 'icosahedr')},
        '2026-Q16b(iii)': {
            0: _k(*_NUCLEIC_IN),
            1: _k(*_USES_HOST, 'cell organelle', 'use host nucleic', 'use host dna', 'use host rna'),
            2: _k('make nucleic', 'make viral dna', 'make viral rna', 'make dna', 'make rna', 'make protein', 'copy dna', 'copy rna', 'copy nucleic', 'replicat dna', 'replicat rna',
                  'replicat nucleic', 'make coat', 'make capsid'),
            3: _k(*_ASSEMBLE),
            4: _k(*_RELEASED),
        },
        '2026-Q16b(iv)': {0: _k('contain nucleus', 'no nucleus', 'lack nucleus', 'without nucleus', 'doesnt nucleus', 'not nucleus',
                                'nucleus absent', 'anucleate', *_NO_ORGANELLES)},
        '2026-Q16b(v)': {0: _k(*_VIRUS_NAMES, *_CORONA)},
        '2026-Q16b(vi)': {0: _k(*_VIRUS_USES)},
        # Two lymphocytes, each named with its role: the two names have the same keys, as do the two roles, so one
        # sentence earns one of each and a second sentence earns the other.
        '2025-Q16d(iii)': {0: _k(*_LYMPHOCYTE_NAMES), 1: _k(*_LYMPHOCYTE_ROLES), 2: _k(*_LYMPHOCYTE_NAMES), 3: _k(*_LYMPHOCYTE_ROLES)},
        '2025-Q16d(iv)': {0: _k(*_VACCINE)},
        # "(Antibiotic) resistance or described" plus "other correct": the word, resistance described (sensitive ones
        # killed, the rest left to multiply; the antibiotic stops working), or killing the good bacteria.
        '2024-Q14b(v)': {0: _k('resist', 'superbug', 'mrsa', 'sensitiv kill multipl', 'sensitiv kill surviv', 'sensitiv kill reproduc',
                               'sensitiv kill left', 'antibiot stop work', 'antibiot no longer work', 'antibiot not work', 'antibiot ineffect',
                               'antibiot less effect', 'kill good bacteri', 'kill benefic', 'kill friendly', 'kill useful bacteri',
                               'kill harmless bacteri', 'kill normal flora', 'kill gut bacteri')},
        '2024-Q14c(i)': {0: _k(*_NON_CELLULAR, 'metabol', *_HOST_ONLY, *_NO_ORGANELLES, *_ONE_NUCLEIC)},
        '2024-Q14c(iii)': {
            0: _k('attach', *_NUCLEIC_IN),
            2: _k('using host cell organelle', *_USES_HOST),
            3: _k(*_ASSEMBLE),
            4: _k(*_RELEASED),
        },
        '2024-Q14c(iv) 1.': {0: _k(*_VIRUS_NAMES, *_CORONA)},
        '2024-Q14c(iv) 2.': {0: _k(*_VIRUS_USES)},
        '2024-Q16d(i) 2.': {0: _k('spleen', 'thymus', 'lymph node', 'lymph gland', 'tonsil', 'adenoid', 'bone marrow')},
        '2024-Q16d(ii) 1.': {0: _k(*_ANTIGEN), 1: _k(*_ANTIBODY)},
        '2024-Q16d(ii) 3.': {4: _k(*_HELPER, *_KILLER, *_SUPPRESSOR, *_MEMORY)},
        '2023-Q11b(ii)': {0: _k('gene bank', 'seed bank', 'resist tree', 'toleran tree', 'breed resist', 'breed toleran', 'thin',
                                'divers species', 'remov infect', 'destroy infect', 'burn infect', 'ban import', 'stop import',
                                'quarantin', 'biosecur', 'fungicid')},
        '2023-Q16c(ii)': {0: _k(*_NON_CELLULAR, 'metabol')},
        '2023-Q16c(iv)': {0: _k(*_VIRUS_USES)},
        '2023-Q16c(v)': {
            0: _k('skin barri', 'skin block', 'skin keratin', 'skin entry', 'skin enter', 'skin stop'),
            1: _k('mucus trap', 'mucus catch', 'mucus cilia', 'mucus stick'),
            2: _k('phagocyt', 'engulf', 'macrophage'),
            3: _k('infect release chemic', 'interferon'),
            4: _k('white release chemic', 'white cell chemic', 'white blood chemic', 'cytokine'),
            5: _k('stomach acid', 'acid kill', 'acid destroy'),
            6: _k('tear', 'lysozyme'),
            7: _k('clot'),
            8: _k('fever enzyme', 'fever denatur', 'fever temperature', 'fever kill', 'fever slow', 'fever stop', 'high temperature'),
            11: _k('memory cell', 'memory recogn', 'memory rememb'),
            12: _k('help t', 'coordinat response', 'coordinat immune', 'help stimulate'),
            13: _k('kill cell infect', 'kill t infect', 'destroy infect', 'burst infect', 'perforin'),
            14: _k('suppressor', 'regulatory', 'stop response', 'switch off'),
        },
        '2023-Q5e(e)': {0: _k(*_BACTERIA_NAMES)},
        '2023-Q6e(e)': {0: _k(*_NOT_ON_VIRUSES)},
        '2022-Q11b(iii) 1.': {0: _k(*_BACTERIA_NAMES)},
        '2022-Q11b(iii) 2.': {0: _k('chemic kill bacteria', 'kill bacteria', 'inhibit bacteria', 'destroy bacteria', 'stop bacteri growth',
                                    'slow bacteri growth')},
        '2022-Q11b(iii) 3.': {0: _k('overuse', 'overus', 'misuse', 'overprescri', 'mutat', 'dont finish course', 'didnt finish course', 'unfinish course', 'stop course', 'complete course',
                                    'incomplete course')},
        '2022-Q17b(v)': {
            0: _k('nutrient', 'balanc diet', 'balanc food'),
            1: _k('antibody', 'pass immun'),
            3: _k('bond', 'sterile', 'uterus', 'contracep', 'delay ovul', 'cancer', 'easi digest', 'cheap', 'convenient', 'allerg',
                  'obes', 'less infec'),
        },
        '2022-Q7(c)': {0: _k(*_HOST_ONLY)},
        '2022-Q7(d)': {0: _k(*_VACCINE), 1: _k('stimulate produc antibody', *_OWN_ANTIBODIES, 'active immun', 'memory cell')},
        '2022-Q7(e)': {0: _k(*_VIRUS_NAMES)},   # other than SARS-CoV-2
        '2022-Q7(f)': {0: _k(*_VIRUS_USES)},
        '2021-Q16c(iv)': {0: _k('monocyte', 'macrophage', 'phagocyt', 'neutrophil', 'granulocyte', 'eosinophil', 'basophil')},
        '2021-Q16c(v) 1.': {
            0: _k('slow vaccine fast infec', 'slow fast', 'fast b', 'slow a', 'fast infec', 'slow vaccin', 'rapid b'),
            1: _k('more antibody', 'high antibody', 'large antibody', 'great antibody', 'numb high', 'high infec', 'low vaccin', 'level high',
                  'concentrat high', 'high b', 'large b', 'more b', 'low a', 'small a'),
        },
        '2021-Q16c(v) 2.': {0: _k('1st time infect', 'first time', 'memory')},
        '2021-Q16c(vi)': {0: _k('protein', 'capsid', 'antigen')},
        '2021-Q16c(vii)': {0: _k('antibiotic effect against virus', *_NOT_ON_VIRUSES)},
        '2020-Q15b(ii)': {0: _k('nucleic acid', 'dna', 'rna')},
        '2020-Q15b(iii)': {0: _k(*_HOST_ONLY)},
        '2020-Q15b(iv)': {
            1: _k(*_NUCLEIC_IN),
            2: _k(*_USES_HOST),
            3: _k(*_ASSEMBLE),
            4: _k('virus produc', *_RELEASED),
        },
        '2020-Q15b(vii)': {0: _k('active long last', 'body make antibody', 'receiv antibody', 'given antibody')},
        '2019-Q14b(i)': {0: _k(*_VACCINE)},
        '2019-Q14b(ii)': {
            0: _k('affect', 'not kill', 'arent kill', 'isnt kill', 'survive antibiotic'),
            1: _k('overuse', 'overus', 'misuse', 'overprescri', 'failure complete course', 'dont finish course', 'didnt finish course', 'unfinish course', 'stop course', 'complete course',
                  'incomplete course'),
            2: _k('bacteria mutat', 'bacteria evolv', 'bacteria change'),
        },
        '2018-Q15a(iii) 2.': {0: _k('develop resistant bacteria', 'resist bacteria', 'resist strain', 'resist popul', 'superbug', 'mrsa')},
        '2018-Q15b(iv)': {0: _k('antibiotic effect against virus', *_NOT_ON_VIRUSES)},
        '2017-Q14a(i)': {0: _k('microcepha', 'small head', 'birth defect', 'pass baby', 'pass fetus', 'pass foetus', 'pass unborn',
                               'placenta', 'transmi')},
        '2017-Q14a(ii)': {
            0: _k('mosquito net', 'repell', 'mosquito bite', 'long sleeve', 'cover skin', 'protect mosquito', 'avoid mosquito'),
            1: _k('time day', 'indoor', 'daytime'),
            2: _k('condom', 'delay pregnan', 'delay concep', 'abstain', 'avoid sex', 'no sex', 'safe sex'),
        },
        '2017-Q14a(iii)': {0: _k('bacteriophage', 'phage', 'kill bacteria', 'cancer', 'tumour', 'tumor', 'gene therapy', 'vector',
                                 'genetic engineer', 'genetic modif', 'carry gene', 'biological control', 'pest control', 'control rabbit',
                                 'myxoma', 'tulip')},
        '2017-Q14a(iv)': {
            0: _k('attach'),
            1: _k('nucleic acid cell', *_NUCLEIC_IN),
            2: _k('host structure used', 'virus replicat', *_USES_HOST),
            3: _k(*_ASSEMBLE),
            4: _k(*_RELEASED),
        },
        '2017-Q14a(v)': {
            0: _k(*_HOST_ONLY, 'obligate'),
            1: _k(*_NON_CELLULAR, 'metabol', *_NO_ORGANELLES, *_ONE_NUCLEIC),
        },
        '2017-Q14b(i)': {0: _k('non vaccin', 'unvaccin', 'not vaccin', 'never vaccin', 'weak immun', 'immunocompromis', 'baby', 'infant',
                               'newborn', 'no immun')},
        '2017-Q14b(ii)': {0: _k(*_VACCINE), 2: _k('stimulate antibody produc', *_OWN_ANTIBODIES)},
        '2017-Q14b(iv)': {0: _k(*_HELPER), 1: _k(*_KILLER), 2: _k(*_SUPPRESSOR), 3: _k(*_MEMORY)},
        '2017-Q4(d)': {0: _k(*[f'{m} {k}' for m in _BY_MICROBES for k in ('kill', 'inhibit', 'destroy', 'stop growth', 'slow growth')])},
        '2016-Q15c(ii) 4.': {0: _k(*_x(['measle'], ['rash', 'spot', 'fever', 'temperature', 'koplik']),
                                   *_x(['flu', 'influenza'], ['fever', 'temperature', 'ache', 'muscle', 'cough', 'tired', 'fatigue', 'chill', 'shiver']),
                                   *_x(['cold'], ['runny', 'nose', 'sneez', 'sore throat', 'cough', 'congest', 'block']),
                                   *_x(['chickenpox', 'pox'], ['spot', 'blister', 'itch', 'rash']),
                                   *_x(['mump'], ['swell', 'swollen', 'gland', 'jaw', 'face', 'cheek']),
                                   *_x(['polio'], ['paralys', 'paralyz', 'weak', 'muscle']),
                                   *_x(['hiv', 'aid'], ['test', 'antibody', 'weight', 'infec', 'immun']),
                                   *_x(['hepatitis'], ['jaundice', 'yellow']),
                                   *_x(['covid', 'corona'], ['cough', 'fever', 'temperature', 'taste', 'smell', 'breath', 'test']),
                                   *_x(['rubella'], ['rash', 'spot']),
                                   *_x(['wart'], ['lump', 'growth']),
                                   *_x(['herpe'], ['blister', 'sore']), 'cold sore blister',
                                   *_x(['raby'], ['foam', 'water', 'aggress', 'bite']))},
        '2016-Q15c(iii) 2.': {0: _k('stimulate antibody produc', *_OWN_ANTIBODIES, 'stimulate active immun')},
        # One named general defence and how it works: the mechanism has to fit the feature.
        '2015-Q14a(i)': {
            0: _k('skin', 'mucus', 'cilia', 'acid', 'lysozyme', 'tear', 'saliva', 'sebum', 'sweat', 'clot', 'phagocyt', 'macrophage',
                  'inflamm', 'fever', 'interferon', 'wax'),
            1: _k(*_x(['mucus'], ['trap', 'stick', 'catch', 'cilia', 'sweep']),
                  *_x(['cilia'], ['sweep', 'mov', 'beat', 'waft', 'push', 'trap']),
                  *_x(['skin'], ['barri', 'block', 'entry', 'enter', 'keratin', 'tough', 'waterproof']),
                  *_x(['acid'], ['kill', 'destroy', 'denatur']),
                  *_x(['lysozyme'], ['kill', 'destroy', 'digest', 'break']),
                  *_x(['tear', 'saliva'], ['lysozyme', 'wash', 'kill', 'enzyme']),
                  *_x(['sebum', 'sweat'], ['kill', 'antimicrob', 'inhibit', 'acid']),
                  *_x(['clot'], ['seal', 'wound', 'block', 'plug', 'scab', 'entry', 'enter']),
                  *_x(['phagocyt', 'macrophage'], ['engulf', 'digest', 'ingest', 'lysosom']),
                  *_x(['inflamm'], ['histamine', 'swell', 'dilat', 'phagocyt', 'white', 'blood']),
                  *_x(['fever'], ['enzyme', 'denatur', 'slow']),
                  *_x(['interferon'], ['neighbour', 'protect', 'spread'])),
        },
        '2015-Q14a(iii)': {0: _k(*_ANTIGEN, *_ANTIBODY)},
        '2015-Q14a(iv) 1.': {0: _k(*_KILLER, 'perforat', 'kill cell'), 1: _k(*_HELPER)},
        '2015-Q3(c)': {0: _k('rna', 'dna')},
        '2015-Q3(e)': {0: _k('shape', 'size', 'structure', 'type nucleic', 'dna rna', 'host', 'antibody', 'antigen')},
        '2015-Q3(f)': {0: _k(*_NON_CELLULAR, *_NO_ORGANELLES)},
        '2015-Q3(g)': {0: _k('manufacture vaccine', *_VIRUS_USES, 'pathogen', 'caus disease', 'harm plant', 'harm anim', 'harm crop',
                             'damag crop', 'livestock', 'crop disease', 'plant disease', 'anim disease', 'tulip')},
        '2013-Q12a(i)': {0: _k('nucleic acid', 'dna', 'rna', 'genetic material')},
        '2013-Q12a(iii)': {0: _k('genetic engineer', 'genetic modif', 'vector', 'gene therapy', 'carry gene', 'vaccin', 'cancer', 'tumour',
                                 'tumor', 'pest control', 'biological control', 'control disease', 'disease control', 'kill bacteria',
                                 'phage', 'bacteriophage')},
        '2012-Q15b(ii)': {0: _k('phagocyt', 'monocyte', 'macrophage', 'neutrophil', 'granulocyte', 'eosinophil', 'basophil')},
        '2012-Q15b(iii) 3.': {0: _k(*_HELPER), 1: _k(*_KILLER), 2: _k('stop immune respons', *_SUPPRESSOR), 3: _k('long term protec', *_MEMORY)},
        '2011-Q10b(ii)': {0: _k('immunity develop', 'immun', 'natur selec', 'virulent', 'vaccin', 'resist host')},
        '2010-Q6(a) (ii)': {0: _k('nucleic acid', 'dna', 'rna')},
        '2010-Q6(b)': {1: _k('nucleic acid cell', *_NUCLEIC_IN), 2: _k('use host structure', 'host ribosom', 'host organell', 'host enzym', 'host machin',
                                                                     'host materi', 'take over host', 'control host', 'use host cell'),
                       4: _k(*_ASSEMBLE), 5: _k(*_RELEASED)},
        # "To inactivate antigens (or described)".
        '2012-Q15b(iii) 1.': {0: _k('inactivate antigen', 'bind antigen', 'attach antigen', 'lock antigen', 'stick antigen', 'combin antigen',
                                    'neutralis antigen', 'neutralis pathogen', 'neutralis toxin', 'clump antigen', 'agglutin', 'destroy antigen',
                                    'mark antigen')},
        '2010-Q6(c)': {
            0: _k(*_x(['previ', 'earli', 'before', 'already', 'past', 'older'], ['expos', 'infect', 'caught', 'flu', 'strain']), 'similar virus',
                  'similar flu', 'similar strain'),
            1: _k('antibody', 'memory cell', 'active immun'),
        },
        '2009-Q15c(i)': {
            0: _k('immun', 'defence', 'fight infec', 'fight disease', 'fight pathogen'),
            1: _k('b cell', 'b lymphocyte'),
            3: _k('t cell', 't lymphocyte'),
            4: _k(*_HELPER, *_KILLER, *_SUPPRESSOR, 'rememb'),
        },
        '2008-Q15b(i)': {2: _k('rapid spread', 'high popul', 'dense popul', 'large popul')},
        '2008-Q15b(ii)': {0: _k('natur immun', 'natur selec', 'virus mutat', 'immun')},
        # Yes or no, with a plausible reason.
        '2008-Q15b(iv)': {0: _k('resist surviv', 'immun surviv', 'natur selec', 'resist reproduc', 'immun reproduc', 'resist children',
                                'immun children', 'mutat fast', 'mutat rapid', 'long generation', 'generation time', 'slow reproduc',
                                'drug alive', 'treatment alive', 'antiretrovir')},
        '2008-Q15b(v)': {
            1: _k('introduce nucleic acid', *_NUCLEIC_IN),
            3: _k('viral dna', 'rna replicat', 'dna replicat', 'nucleic replicat', 'dna copy', 'rna copy', 'dna copi', 'rna copi',
                  'nucleic copy'),
            4: _k('using resource host cell', *_USES_HOST),
        },
        '2007-Q14b(i)': {0: _k('obligate', *_HOST_ONLY), 1: _k(*_NON_CELLULAR), 4: _k(*_ONE_NUCLEIC)},
        '2007-Q14b(iii)': {7: _k('hiv', 'aid', 'mump', 'rubella', 'raby', 'hepatitis', 'herpe', 'ebola', 'zika', 'covid', 'corona', 'sar',
                                 'hpv', 'wart', 'dengue', 'yellow fever', 'glandular fever', 'shingle', 'norovirus', 'rotavirus',
                                 'influenza', 'myxoma', 'foot mouth')},
        '2007-Q14b(iv)': {0: _k('bacteriophage', 'phage', 'kill bacteria', 'genetic engineer', 'genetic modif', 'vector', 'gene therapy',
                                'carry gene', 'deliver gene', 'vaccin')},
        '2007-Q14b(v)': {0: _k('produc micro organism', *_BY_MICROBES)},
        '2007-Q14b(vi)': {0: _k('effect', 'resist')},
        '2007-Q14c(i)': {0: _k('resistance infec', 'antigen', 'resist disease', 'resist pathogen', 'resist microb', 'fight infec')},
        '2007-Q14c(iii)': {1: _k('antibody introduc body', 'antibody introduc', 'antibody give', 'antibody put', 'antibody inject',
                                 'antibody receiv', 'antibody donat', 'ready antibody', 'antibody mother', 'antibody milk')},
        '2007-Q14c(iv)': {0: _k('antigen', *_VACCINE), 1: _k('caus antibody produc', *_OWN_ANTIBODIES)},
        '2007-Q14c(v) 2.': {0: _k('infec already occurr', 'already infec', 'infec occurr', 'dangerous infec', 'no vaccin', 'vaccin expens',
                                  'tetanus', 'raby', 'snake', 'venom')},
        '2006-Q15b(iii)': {0: _k('produc bacteria', 'fungi', *_BY_MICROBES)},
        '2006-Q15b(iv)': {
            0: _k('not kill', 'arent kill', 'isnt kill', 'bacteria surviv', 'surviv antibiotic', 'not affect', 'unaffect', 'not inhibit',
                  'bacteria immune'),
            1: _k('natur selec', 'surviv multipl', 'surviv reproduc', 'overuse', 'misuse', 'plasmid'),
        },
        '2006-Q15c(ii)': {6: _k('temperature')},
        '2006-Q6e(e)': {
            0: _k('cell membrane', 'surface', *_ANTIGEN),
            1: _k('produc response antigen', 'make against', 'make response', 'response antigen', 'destroy antigen', 'defence protein',
                  'make lymphocyte', 'protein antigen'),
        },
        '2005-Q15a(i)': {0: _k(*_NON_CELLULAR), 1: _k(*_ONE_NUCLEIC), 2: _k('reproduce host cell only', 'obligate', *_HOST_ONLY),
                         3: _k(*_NO_ORGANELLES, 'possess organelle', 'no nucleus')},
        '2005-Q15a(ii)': {1: _k('flu', 'influenza'), 6: _k('aid', 'hiv')},
        '2005-Q15a(iii)': {
            0: _k('b cell', 'b lymphocyte'),
            1: _k('t cell', 't lymphocyte', 'suppressor'),
            2: _k('cell produce antibody', 'agglutin', 'lysis', 'memory', *_B_ROLE),
            3: _k('cell recognise', 'destroy infect', 'damag cell', 'memory', 'suppress immune system', *_HELPER, *_KILLER, *_SUPPRESSOR),
            4: _k('help stimulate cell', 'stimulate kill cell', 'recognise antigen', 'stimulate b', 'activat b', 'activat kill'),
            5: _k('kill destroy infect', 'damag cell', 'kill infect', 'burst infect', 'perforin'),
            6: _k('suppressor switch', 'switch off', 'turn off', 'suppress immune', 'suppress response', 'stop immune', 'stop response'),
            7: _k('memory memorise antigen', 'rememb'),
        },
        '2005-Q15a(iv)': {1: _k('both antibody', *_OWN_ANTIBODIES)},
        '2005-Q15b(v)': {
            0: _k('produc micro organism', *_BY_MICROBES),
            1: _k('inhibit bacteria', 'fungi', 'kill bacteria', 'destroy bacteria', 'stop growth', 'kill fung', 'kill micro'),
        },
    },
}


# ---------------------------------------------------------------- Chain reaction pictures (400 x 300)
# Each picture builds up as the chain's steps go into place: data-step k shows once steps 1 to k+1 are in place,
# data-until k goes then, and badge k puts the step's number by the part it explains (tools/mini_games/build_game_art.py).
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'mini_games'))
from build_game_art import step, until, badge, svg as art_svg  # noqa: E402


def y_ab(x, y, deg, s=1.0, color=AB):
    return antibody(x, y, deg, s, color)


def b_cell(x, y, r=20, ring=WBC_D):
    out = ''.join(antibody(*[round(v, 1) for v in pt(x, y, r, a)], deg=a + 90, s=0.55) for a in range(-150, 210, 60))
    return out + f'<circle cx="{x}" cy="{y}" r="{r}" fill="{WBC}" stroke="{ring}" stroke-width="3"/><circle cx="{x - 2}" cy="{y + 1}" r="{r * .66:.1f}" fill="{NUCLEUS}"/>'


def t_cell(x, y, r=18, fill='#D9C6EC', edge=ENV_D):
    hooks = ''.join(f'<path d="M{pt(x, y, r, a)[0]:.1f} {pt(x, y, r, a)[1]:.1f}L{pt(x, y, r + 6, a)[0]:.1f} {pt(x, y, r + 6, a)[1]:.1f}" '
                    f'stroke="{edge}" stroke-width="3" stroke-linecap="round"/>' for a in range(0, 360, 36))
    return hooks + f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{edge}" stroke-width="3"/><circle cx="{x - 2}" cy="{y + 1}" r="{r * .6:.1f}" fill="{PURPLE}"/>'


def body_cell(x, y, r=46, infected=False):
    out = ''
    if infected:
        out += spikes(x, y, r, r + 9, 10, 4.5, 8)
    out += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{CELL}" stroke="{CELL_D}" stroke-width="3"/>'
    out += f'<circle cx="{x - 8}" cy="{y + 4}" r="{r * .36:.1f}" fill="{NUCLEUS}" stroke="{NUCLEUS_D}" stroke-width="1.6"/>'
    return out


def word(x, y, text, size=12, color=INK, anchor='middle'):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="{size}" '
            f'fill="{color}">{text}</text>')


def chain_virus():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    membrane = 'M70 60C130 30 300 30 350 70C392 104 392 226 344 258C280 294 120 294 64 256C22 226 22 92 70 60Z'
    b += until(5, f'<path d="{membrane}" fill="{CELL}" stroke="{CELL_D}" stroke-width="4"/>')
    b += step(5, f'<path d="{membrane}" fill="{CELL}" stroke="{CELL_D}" stroke-width="4" stroke-dasharray="40 14"/>')
    b += f'<ellipse cx="262" cy="170" rx="44" ry="36" fill="{NUCLEUS}" stroke="{NUCLEUS_D}" stroke-width="2.4"/>'
    b += word(200, 290, 'HOST CELL', 11, '#9C7A55')
    b += step(0, small_virus(64, 44, 15, 8))
    b += step(1, coil(92, 74, 140, 116, 4, 3, NUC, 3))
    b += until(4, step(2, ''.join(coil(x, y, x + 28, y + 5, 3, 2, NUC, 2.4) for x, y in [(160, 96), (170, 126), (150, 150)])))
    b += until(4, step(3, ''.join(f'<circle cx="{x}" cy="{y}" r="4.4" fill="{COAT}" stroke="{COAT_D}" stroke-width="1.4"/>'
                                  for x, y in [(206, 94), (216, 108), (200, 118), (222, 124), (210, 136)])))
    b += step(4, ''.join(small_virus(x, y, 12, 7) for x, y in [(130, 206), (176, 230), (218, 206), (160, 170)]))
    b += step(5, ''.join(small_virus(x, y, 12, 7) for x, y in [(372, 120), (384, 176), (364, 230), (330, 276)]))
    b += badge(0, 92, 26) + badge(1, 150, 84) + badge(2, 186, 166, 4) + badge(3, 236, 96, 4) + badge(4, 108, 236) + badge(5, 370, 92)
    return art_svg('How a virus multiplies', 'A virus attaches to a host cell and its nucleic acid enters. The cell copies the nucleic acid and makes protein coats, new viruses are assembled, then they burst out of the cell.', b)


def chain_antibody():
    b = f'<rect width="400" height="300" fill="{TISSUE}"/>'
    bact_spots = [(318, 74, 20), (346, 136, -30), (304, 196, 60)]
    ants = lambda x, y: ''.join(f'<path d="M{x + dx} {y + dy - 4}l5 4l-5 4z" fill="{RED}" stroke="{RED_D}" stroke-width="1.2"/>' for dx, dy in [(-20, -2), (14, -10), (-8, 12)])
    b += step(0, ''.join(bacterium(x, y, 46, 22, d) + ants(x, y) for x, y, d in bact_spots) + word(330, 30, 'PATHOGEN', 11))
    b += step(1, '<path d="M30 110C30 80 64 66 88 76C110 64 140 80 132 106C150 118 140 148 116 146C104 160 70 160 56 146C34 146 24 128 30 110Z" '
                 f'fill="#E9DDF5" stroke="{PURPLE}" stroke-width="3"/><path d="M128 100l8 5l-8 5z" fill="{RED}" stroke="{RED_D}" stroke-width="1.2"/>'
                 + word(84, 178, 'MACROPHAGE', 11))
    b += step(2, t_cell(176, 86) + word(176, 128, 'HELPER T', 11))
    b += step(3, b_cell(150, 220) + b_cell(200, 252, 17) + b_cell(206, 196, 17) + word(120, 286, 'B CELLS', 11, anchor='start'))
    b += step(4, ''.join(y_ab(x, y, d, 0.9) for x, y, d in [(276, 70, 90), (356, 58, -90), (304, 136, 90), (386, 130, -90), (262, 200, 90), (330, 182, -90)]))
    b += step(5, '<path d="M300 268C292 244 316 226 340 232C360 220 392 236 386 262C394 284 360 296 336 288C318 296 296 286 300 268Z" '
                 f'fill="#E9DDF5" stroke="{PURPLE}" stroke-width="3"/>' + word(344, 262, 'PHAGOCYTE', 9))
    b += badge(0, 372, 52) + badge(1, 30, 70) + badge(2, 204, 64) + badge(3, 236, 230) + badge(4, 300, 102) + badge(5, 290, 282)
    return art_svg('The antibody response', 'A pathogen with antigens gets in. A macrophage engulfs it and shows the antigen, a helper T cell recognises it and switches on B cells, which multiply and make antibodies. The antibodies lock onto the antigens and a phagocyte engulfs the marked pathogens.', b)


def chain_killer():
    b = f'<rect width="400" height="300" fill="#F3DCCB"/>'
    b += until(5, body_cell(206, 150, 54) + step(1, spikes(206, 150, 54, 63, 12, 4.6, 8)))
    b += step(5, f'<circle cx="206" cy="150" r="54" fill="none" stroke="{CELL_D}" stroke-width="3" stroke-dasharray="14 16"/>'
                 + ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="{CELL_D}"/>' for x, y in [(160, 120), (250, 118), (236, 196), (176, 190), (206, 90)]))
    b += step(0, small_virus(206, 52, 12, 7) + until(5, coil(206, 70, 214, 134, 3, 2, NUC, 2.4)))
    b += step(2, t_cell(52, 70) + word(52, 112, 'HELPER T', 11))
    b += step(3, t_cell(58, 214, 17, '#C9B6E4') + t_cell(98, 250, 15, '#C9B6E4') + word(76, 290, 'KILLER T CELLS', 11))
    b += step(4, t_cell(124, 196, 18, '#C9B6E4'))
    b += step(5, ''.join(f'<path d="M{x0} {y0}L{x1} {y1}" stroke="{RED}" stroke-width="3" stroke-linecap="round"/>' for x0, y0, x1, y1 in [(140, 186, 158, 172), (142, 200, 162, 196)])
              + word(206, 230, 'PERFORIN: IT BURSTS', 11, RED_D))
    b += step(6, t_cell(340, 236, 17, '#E3E9F4', '#5B6B84') + f'<rect x="318" y="262" width="44" height="18" rx="9" fill="{INK}"/>' + word(340, 275, 'STOP', 11, '#FFFFFF'))
    b += badge(0, 232, 30) + badge(1, 276, 116) + badge(2, 88, 52) + badge(3, 30, 192) + badge(4, 120, 166) + badge(5, 206, 252) + badge(6, 370, 214)
    return art_svg('Killer T cells and infected cells', 'A virus infects a body cell, which shows the viral antigens on its membrane. A helper T cell recognises them and switches on killer T cells, which multiply, bind to the infected cell and burst it with perforin. Suppressor T cells then switch the response off.', b)


def chain_vaccine():
    b = f'<rect width="400" height="300" fill="{BG}"/>'
    # A small graph along the bottom: the antibody level, a little after the vaccine, a lot after the real infection.
    b += '<rect x="20" y="206" width="360" height="84" rx="10" fill="#FFFFFF"/><path d="M40 216V276H364" fill="none" stroke="#14243B" stroke-width="2"/>'
    b += word(44, 228, 'ANTIBODIES', 9, '#5B6B84', 'start')
    b += step(0, '<path d="M30 70h70v26H30z" fill="#FFFFFF" stroke="#5B6B84" stroke-width="2.4"/><path d="M100 76h22v14h-22zM122 82h20" stroke="#5B6B84" stroke-width="2.4" fill="#E3E9F4"/>'
                 '<path d="M20 74v18M30 83H20" stroke="#5B6B84" stroke-width="3"/>' + small_virus(64, 140, 13, 7, False) + word(66, 176, 'HARMLESS FORM', 10))
    b += step(1, b_cell(160, 92, 20) + word(160, 132, 'B CELL', 10))
    b += step(2, ''.join(y_ab(x, y, d, 0.8) for x, y, d in [(196, 70, 70), (204, 104, 100), (190, 134, 130)])
              + '<path d="M44 274C70 274 80 252 96 252S118 272 140 274" fill="none" stroke="#3E6FD8" stroke-width="3"/>')
    b += step(3, b_cell(250, 130, 16, '#FFC42E') + b_cell(286, 108, 16, '#FFC42E') + word(268, 164, 'MEMORY CELLS', 10))
    b += step(4, small_virus(346, 60, 15, 8) + word(340, 100, 'REAL VIRUS', 10))
    b += step(5, ''.join(y_ab(x, y, d, 0.8) for x, y, d in [(330, 50, -60), (340, 84, -120), (374, 86, 160), (326, 70, -90)])
              + '<path d="M140 274C200 274 206 218 230 218S270 250 360 254" fill="none" stroke="#3E6FD8" stroke-width="3.4"/>' + word(236, 212, 'FAST AND BIG', 10, BLUE))
    b += badge(0, 26, 56) + badge(1, 186, 70) + badge(2, 92, 242) + badge(3, 308, 132) + badge(4, 380, 38) + badge(5, 268, 226)
    return art_svg('How a vaccine gives immunity', 'A harmless form of the pathogen is injected. B cells recognise its antigen and make a few antibodies, and memory cells stay. When the real virus gets in, the memory cells make a fast, big antibody response.', b)


def chain_resistance():
    b = f'<rect width="400" height="300" fill="#FDF7E8"/>'
    spots = [(70, 70, 10), (150, 56, -20), (230, 74, 30), (310, 60, -10), (90, 150, 60), (170, 136, 0), (250, 160, -40), (330, 140, 20)]
    res = (170, 136, 0)
    alive = ''.join(bacterium(x, y, 46, 22, d) for x, y, d in spots if (x, y, d) != res)
    b += until(2, alive)
    b += step(2, ''.join(bacterium(x, y, 46, 22, d, '#E3E9F4', '#9AA6BA') for x, y, d in spots if (x, y, d) != res))
    b += until(0, bacterium(res[0], res[1], 46, 22, res[2]))
    b += step(0, bacterium(res[0], res[1], 46, 22, res[2], '#F5A03C', COAT_D))
    b += step(1, '<g transform="rotate(-20 330 236)"><rect x="296" y="222" width="68" height="28" rx="14" fill="#FFFFFF" stroke="#5B6B84" stroke-width="2.4"/>'
                 '<path d="M330 222h20a14 14 0 0 1 0 28h-20z" fill="#E5484D"/></g>' + word(330, 280, 'ANTIBIOTIC', 10))
    b += step(3, ''.join(bacterium(x, y, 46, 22, d, '#F5A03C', COAT_D) for x, y, d in [(120, 216, 20), (200, 236, -10), (60, 250, 40)]))
    b += step(4, f'<circle cx="160" cy="226" r="9" fill="none" stroke="{PURPLE}" stroke-width="3"/><path d="M174 226h12" stroke="{PURPLE}" stroke-width="2.4" '
                 f'stroke-linecap="round"/><path d="M186 221l6 5l-6 5z" fill="{PURPLE}"/>' + word(160, 206, 'PLASMID', 10, PURPLE))
    b += step(5, f'<rect x="20" y="10" width="360" height="26" rx="13" fill="{INK}"/>' + word(200, 28, 'A RESISTANT POPULATION', 12, '#FFFFFF')
              + '<path d="M300 218L360 258M360 218L300 258" stroke="#E5484D" stroke-width="5" stroke-linecap="round"/>')
    b += badge(0, 200, 112) + badge(1, 372, 210) + badge(2, 40, 108) + badge(3, 92, 196) + badge(4, 132, 250) + badge(5, 30, 23)
    return art_svg('How antibiotic resistance spreads', 'One bacterium becomes resistant by a random mutation. An antibiotic kills the others, but the resistant one survives and reproduces, and its resistance gene spreads on plasmids, so a resistant population builds up and the antibiotic stops working.', b)


def CHAIN_ART():
    return {'How a virus multiplies': chain_virus(), 'The antibody response': chain_antibody(), 'Killer T cells and infected cells': chain_killer(),
            'How a vaccine gives immunity': chain_vaccine(), 'How antibiotic resistance spreads': chain_resistance()}

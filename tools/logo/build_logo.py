"""Builds the site logo from the original examiner's face (tools/logo/examiner-face.svg), in his angry mood:
assets/logo/examiner.svg, used for the browser tab icon and on the desk.
Run: python3 tools/logo/build_logo.py  (then render apple-touch-icon.png: the face on the desk colour)."""
import os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
face = open(os.path.join(os.path.dirname(__file__), 'examiner-face.svg')).read().strip()
inner = re.search(r'<svg viewBox="0 0 100 100">(.*)</svg>', face).group(1)


def drop(svg, cls):
    # Remove every <g class="cls ...">...</g> (these groups never nest another <g> deeper than one level).
    out, i = '', 0
    pat = re.compile(r'<g class="' + cls + r'[^"]*"')
    while True:
        m = pat.search(svg, i)
        if not m:
            return out + svg[i:]
        out += svg[i:m.start()]
        depth, j = 0, m.start()
        while True:
            o, c = svg.find('<g', j + 1), svg.find('</g>', j + 1)
            if o != -1 and o < c:
                depth, j = depth + 1, o
            else:
                if depth == 0:
                    i = c + 4
                    break
                depth, j = depth - 1, c


angry = drop(drop(drop(inner, 'm-ok'), 'm-happy'), 'x-steam')
angry = angry.replace('class="m-angry"', '').replace('class="m-ok x-eyes"', '')
angry = angry.replace('class="x-skin" d=', 'd=').replace('fill="#F2C9A0" stroke="#7A4A35" stroke-width="2.4"', 'fill="#F4AE90" stroke="#7A4A35" stroke-width="2.4"', 1)
angry = re.sub(r' class="x-lines"', '', angry)

head = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
open(os.path.join(ROOT, 'assets/logo/examiner.svg'), 'w').write(head + '<title>The Examiner</title>' + angry + '</svg>\n')
print('wrote assets/logo/examiner.svg')

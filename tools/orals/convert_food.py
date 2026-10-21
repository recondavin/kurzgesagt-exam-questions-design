# Converts models from Kenney's Food Kit (CC0, kenney.nl/assets/food-kit) into orals/models/food.js, restyled for
# the game: each face gets one flat colour (Kenney's texture has shaded strips; the game does its own toon
# shading), the colours are softened a little, some are recoloured (an Irish milk carton, a bottle of water, a jar
# of jam) and the shapes are stored small (millimetre positions, shared corners).
#
#   python3 tools/orals/convert_food.py "<unzipped food kit>/Models/GLB format" orals/models/food.js
import colorsys, json, struct, sys
import numpy as np
from PIL import Image

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

# name in the game: (Kenney model, {colour in the model: new colour}). The colour keys are matched to the
# nearest flat colour of the model.
MODELS = {
    'milk': ('carton', {'#885DD4': '#2F6FB0', '#6944C0': '#24578C'}),
    'juice': ('carton-small', {'#F8A3E2': '#E8932F'}),
    'cola': ('soda-bottle', {}),
    'water': ('soda-bottle', {'#885541': '#A9CFDB', '#F46743': '#2F6FB0'}),
    'tomatoes': ('can', {}),
    'beans': ('can', {'#F46743': '#3E8E7E'}),
    'tuna': ('can-small', {'#8258D0': '#2F5D8A'}),
    'fizzy': ('soda-can', {}),
    'lemonade': ('soda-can', {'#F46743': '#4C9A5B'}),
    'bread': ('loaf', {}),
    'sodabread': ('loaf-round', {}),
    'flour': ('bag', {}),
    'honey': ('honey', {}),
    'jam': ('peanut-butter', {'#E5AC85': '#B33A3A'}),
    'ketchup': ('bottle-ketchup', {}),
    'chocolate': ('chocolate', {}),
    'apple': ('apple', {}),
    'orange': ('orange', {}),
    'banana': ('banana', {}),
    'pear': ('pear', {}),
    'lemon': ('lemon', {}),
    'carrot': ('carrot', {}),
    'cabbage': ('cabbage', {}),
    'onion': ('onion', {}),
    'tomato': ('tomato', {}),
    'broccoli': ('broccoli', {}),
    'mushroom': ('mushroom', {}),
    'pepper': ('paprika', {}),
    'oil': ('bottle-oil', {}),
    'croissant': ('croissant', {}),
    'muffin': ('muffin', {}),
    'donut': ('donut-chocolate', {}),
    'cake': ('cake', {}),
    'pie': ('pie', {}),
    'lolly': ('popsicle', {}),
    'chocice': ('popsicle-chocolate', {}),
}


def load(path):
    b = open(path, 'rb').read()
    off, js, bin_ = 12, None, None
    while off < len(b):
        ln, typ = struct.unpack_from('<I4s', b, off)
        if typ == b'JSON': js = json.loads(b[off + 8: off + 8 + ln])
        elif typ == b'BIN\x00': bin_ = b[off + 8: off + 8 + ln]
        off += 8 + ln
    return js, bin_


def accessor(js, bin_, i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]
    dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride', 0) or dt.itemsize * n
    return np.array([np.frombuffer(bin_, dtype=dt, count=n, offset=start + k * stride) for k in range(a['count'])], dtype=np.float64)


def matrix(node):
    if 'matrix' in node: return np.array(node['matrix']).reshape(4, 4).T
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M = np.eye(4); M[:3, :3] = R * np.array(node.get('scale', [1, 1, 1])); M[:3, 3] = node.get('translation', [0, 0, 0])
    return M


def triangles(path):
    js, bin_ = load(path)
    out = []
    def walk(ni, M):
        node = js['nodes'][ni]; M = M @ matrix(node)
        for prim in (js['meshes'][node['mesh']]['primitives'] if 'mesh' in node else []):
            P = accessor(js, bin_, prim['attributes']['POSITION'])
            U = accessor(js, bin_, prim['attributes']['TEXCOORD_0'])
            I = accessor(js, bin_, prim['indices']).astype(int).ravel() if 'indices' in prim else np.arange(len(P))
            Pw = (M @ np.c_[P, np.ones(len(P))].T).T[:, :3]
            out.extend((Pw[I[t:t + 3]], U[I[t:t + 3]]) for t in range(0, len(I), 3))
        for c in node.get('children', []): walk(c, M)
    for n in js['scenes'][js.get('scene', 0)]['nodes']: walk(n, np.eye(4))
    return out


def rgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=float)
def hexc(c): return '#%02X%02X%02X' % tuple(int(round(v)) for v in np.clip(c, 0, 255))


# A little softer than Kenney's bright colours, like the rest of the game.
def soften(c):
    h, s, v = colorsys.rgb_to_hsv(*(c / 255))
    return np.array(colorsys.hsv_to_rgb(h, s * 0.85, 0.1 + v * 0.86)) * 255


def convert(folder, name, recolour):
    tex = np.array(Image.open(folder + '/Textures/colormap.png').convert('RGB')).astype(float)
    H, W, _ = tex.shape
    tris = triangles(f'{folder}/{name}.glb')
    cols = [tex[min(H - 1, int(U[:, 1].mean() * H)), min(W - 1, int(U[:, 0].mean() * W))] for _, U in tris]
    # Each strip of shades becomes one flat colour: the most used shade of each group of near colours.
    count = {}
    for c in cols: count[hexc(c)] = count.get(hexc(c), 0) + 1
    groups = []
    for h, _ in sorted(count.items(), key=lambda kv: -kv[1]):
        c = rgb(h)
        g = next((g for g in groups if np.linalg.norm(g[0] - c) < 46), None)
        if g: g[1].append(h)
        else: groups.append([c, [h]])
    flat = {h: g[0] for g in groups for h in g[1]}
    for old, new in recolour.items():
        g = min(groups, key=lambda g: np.linalg.norm(g[0] - rgb(old)))
        for h in g[1]: flat[h] = rgb(new)
        g[0] = rgb(new)
    palette, face = [], []
    for c in cols:
        base = flat[hexc(c)]
        out = hexc(base if any(np.allclose(base, rgb(n)) for n in recolour.values()) else soften(base))
        if out not in palette: palette.append(out)
        face.append(palette.index(out))
    # Shared corners, in millimetres of the model, standing on y = 0 and centred.
    P = np.concatenate([t[0] for t in tris])
    lo, hi = P.min(0), P.max(0)
    P = P - np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    q = np.round(P * 1000).astype(int).tolist()
    verts, index = {}, []
    for v in map(tuple, q):
        if v not in verts: verts[v] = len(verts)
        index.append(verts[v])
    return {'p': [c for v in verts for c in v], 'i': index, 'f': face, 'c': palette}


def main(folder, out):
    lines = ['// Food for the shop, from Kenney\'s Food Kit (CC0, https://kenney.nl/assets/food-kit), restyled for the game by',
             '// tools/orals/convert_food.py: one flat colour per face, softer colours, some recoloured. Made by that script:',
             '// change it there, not here. Each: p corners (x, y, z in thousandths), i three corners a face, f a colour a face,',
             '// c the colours. Built into shapes by kit.js (model).', 'export const FOOD = {']
    for name, (src, recolour) in MODELS.items():
        m = convert(folder, src, recolour)
        lines.append(f'  {name}: ' + json.dumps(m, separators=(',', ':')).replace('"p"', 'p').replace('"i"', 'i').replace('"f"', 'f').replace('"c"', 'c') + ',')
    lines.append('};')
    open(out, 'w').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])

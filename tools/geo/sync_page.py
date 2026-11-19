# Lists every topic bank (geo/data/*.js) and media registry (geo/media/*.js) in geography.html, between its
# <!-- GEO-DATA --> and <!-- GEO-MEDIA --> markers, with a cache key from each file's contents.
# Usage: python3 tools/geo/sync_page.py [name ...]   (only these files, e.g. volcanoes india videos; default: all)
import hashlib, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
page = os.path.join(ROOT, 'geography.html')
s = open(page, encoding='utf8').read()
ORDER = ['plates', 'quakes', 'volcanoes', 'deform', 'isostasy', 'rocks', 'landscape', 'rockuse', 'weathering', 'karst',
         'landforms', 'massmove', 'surfacehuman', 'india']

def tags(folder, order=None):
    d = os.path.join(ROOT, 'geo', folder)
    if not os.path.isdir(d): return ''
    only = sys.argv[1:]
    files = sorted(f for f in os.listdir(d) if f.endswith('.js') and (not only or f[:-3] in only))
    if order: files.sort(key=lambda f: order.index(f[:-3]) if f[:-3] in order else 99)
    out = []
    for f in files:
        key = hashlib.md5(open(os.path.join(d, f), 'rb').read()).hexdigest()[:8]
        out.append('<script src="./geo/%s/%s?v=%s"></script>' % (folder, f, key))
    return '\n'.join(out)

for marker, folder, order in (('GEO-DATA', 'data', ORDER), ('GEO-MEDIA', 'media', None)):
    body = tags(folder, order)
    s = re.sub(r'<!-- %s -->.*?<!-- /%s -->' % (marker, marker), '<!-- %s -->\n%s%s<!-- /%s -->' % (marker, body, '\n' if body else '', marker), s, flags=re.S)
open(page, 'w', encoding='utf8').write(s)
print(re.findall(r'geo/(?:data|media)/[^"?]+', s))

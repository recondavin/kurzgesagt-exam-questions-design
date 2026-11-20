# Fetches photos from Openverse (Flickr and other open collections; free licences only) for the Geography section: for each wanted subject, one
# search that returns the files' 1280px thumbnails with their licence and author; keeps the first JPEG with a free
# licence, saves it under assets/geo/photos/<id>.jpg (resized to stay under 250 KB) and writes
# tools/geo/research/photos-new.json for review. Requests are paced (Wikimedia rate-limits bursts).
# Usage: python3 tools/geo/fetch_photos.py
import io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
UA = {'User-Agent': 'LC-Geography-revision/1.0 (educational use)'}
WANT = [
 # id, topic, tags, search, caption
 ('killary-harbour', 'isostasy', ['isostasy', 'coastal', 'isostasy-coast-river'], 'Killary Harbour', 'Killary Harbour, Co. Galway and Mayo, a drowned glacial valley'),
 ('malin-raised-beach', 'isostasy', ['isostasy', 'coastal', 'isostasy-coast-river'], 'Malin Head raised beach', 'Raised beach at Malin Head, Co. Donegal'),
 ('burren-pavement', 'karst', ['pavement', 'surface', 'karst-landform', 'karst-landscape', 'limestone', 'carbonation'], 'Burren limestone pavement grikes', 'Limestone pavement with clints and grikes, the Burren, Co. Clare'),
 ('burren-landscape', 'landscape', ['limestone', 'landscape-rocks'], 'Burren landscape Mullaghmore', 'The bare limestone landscape of the Burren, Co. Clare'),
 ('connemara-marble', 'rocks', ['marble', 'rocks-metamorphic', 'rocks-sed-met', 'rocks-ign-met'], 'Connemara marble', 'Connemara marble, Co. Galway'),
 ('errigal-quartzite', 'rocks', ['quartzite', 'rocks-metamorphic', 'rocks-sed-met'], 'Errigal mountain Donegal', 'Errigal, Co. Donegal: a quartzite peak with scree slopes'),
 ('old-red-sandstone', 'rocks', ['sandstone', 'rocks-sedimentary', 'rocks-sed-met'], 'Old Red Sandstone cliff', 'Old Red Sandstone'),
 ('limestone-quarry', 'rockuse', ['quarrying', 'rockuse'], 'limestone quarry face', 'A limestone quarry in Ireland'),
 ('torc-waterfall', 'landforms', ['waterfall', 'gorge', 'landform-erosion', 'landform-any'], 'Torc Waterfall cascade Killarney', 'Torc Waterfall, Killarney, Co. Kerry'),
 ('coumshingaun', 'landforms', ['corrie', 'landform-erosion', 'landform-any'], 'Coumshingaun Lough', 'Coumshingaun corrie lake, Comeragh Mountains, Co. Waterford'),
 ('cliffs-of-moher', 'landforms', ['cliff', 'landform-erosion', 'landform-any'], 'Cliffs of Moher', 'The Cliffs of Moher, Co. Clare'),
 ('dun-briste', 'landforms', ['stack', 'landform-erosion', 'landform-any'], 'Dun Briste sea stack Downpatrick Head', 'Dún Briste sea stack, Downpatrick Head, Co. Mayo'),
 ('inch-strand', 'landforms', ['spit', 'beach', 'landform-deposition', 'landform-any'], 'Inch beach Dingle sand dunes', 'Inch Strand, a sand spit on Dingle Bay, Co. Kerry'),
 ('clew-bay-drumlins', 'landforms', ['drumlin', 'landform-deposition', 'landform-any'], 'Clew Bay drumlins', 'Drowned drumlins in Clew Bay, Co. Mayo'),
 ('esker', 'landforms', ['esker', 'landform-deposition', 'landform-any'], 'esker ridge glacial', 'An esker in the Irish midlands'),
 ('oxbow-lake', 'landforms', ['oxbow', 'floodplain', 'landform-deposition', 'landform-any'], 'oxbow lake aerial', 'A meander and oxbow lake'),
 ('shannon-callows', 'landforms', ['floodplain', 'levee', 'landform-deposition', 'landform-any'], 'Shannon callows', 'The River Shannon\'s floodplain, the Shannon Callows'),
 ('delta-aerial', 'landforms', ['delta', 'landform-deposition', 'landform-any'], 'river delta aerial', 'A river delta'),
 ('terminal-moraine', 'landforms', ['moraine', 'outwash', 'landform-deposition', 'landform-any'], 'terminal moraine', 'A glacier\'s terminal moraine'),
 ('terracettes hillside sheep tracks', 'massmove', ['creep', 'mass-process', 'mass-factors', 'mass-two'], 'terracettes hillside sheep tracks', 'Terracettes on a grassy slope, a sign of soil creep'),
 ('landslide-scar', 'massmove', ['landslide', 'slump', 'mass-process', 'mass-factors', 'mass-two'], 'landslide scar', 'A landslide scar'),
 ('bog-slide', 'massmove', ['bogburst', 'mudflow', 'mass-process', 'mass-factors'], 'bog burst peat landslide', 'The Derrybrien bog slide, Co. Galway, 2003'),
 ('groynes', 'surfacehuman', ['coastal', 'surface-human', 'beach'], 'groynes beach', 'Groynes trapping sand on a beach'),
 ('ardnacrusha', 'surfacehuman', ['dams', 'surface-human'], 'Ardnacrusha power station', 'Ardnacrusha hydroelectric station on the River Shannon, Co. Clare'),
 ('aswan-dam', 'surfacehuman', ['dams', 'surface-human'], 'Aswan High Dam', 'The Aswan High Dam on the Nile, Egypt'),
 ('csmt-mumbai', 'india', ['colonial-impact', 'colonial-posneg', 'colonial-challenges'], 'Chhatrapati Shivaji Terminus', 'Victoria Terminus (Chhatrapati Shivaji Terminus), Mumbai, built by the British in 1888'),
 ('darjeeling-tea', 'india', ['colonial-impact', 'colonial-posneg'], 'Darjeeling tea garden', 'A tea plantation at Darjeeling, first planted under British rule'),
 ('bangalore-it', 'india', ['colonial-challenges', 'colonial-posneg'], 'Infosys campus Bangalore', 'Electronic City, Bengaluru (Bangalore), India\'s IT centre'),
 ('andes', 'plates', ['destructive', 'plates-destructive', 'foldmountains'], 'Andes mountains Aconcagua', 'The Andes, fold mountains at a destructive boundary'),
]
FREE = re.compile(r'^(cc[ -]by|cc[ -]by-sa|cc0|public domain|pd)', re.I)

def get(url, binary=False):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read() if binary else json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(5); continue
            raise
    raise RuntimeError('rate limited')

def strip(h): return re.sub(r'<[^>]+>', '', h or '').strip()

out_dir = os.path.join(ROOT, 'assets', 'geo', 'photos'); os.makedirs(out_dir, exist_ok=True)
# skip only photos already in the registry (a file without its credit is fetched again)
have = set(re.findall(r'"id": "([a-z0-9-]+)"', open(os.path.join(ROOT, 'geo', 'media', 'photos.js')).read()))
LIC = {'by': 'CC BY', 'by-sa': 'CC BY-SA', 'cc0': 'CC0', 'pdm': 'Public domain'}
res = []
only = sys.argv[1:]
for pid, topic, tags, q, cap in WANT:
    if pid in have or (only and pid not in only): continue
    api = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license': 'by,by-sa,cc0,pdm', 'page_size': 12, 'mature': 'false'})
    try: data = get(api)
    except Exception as e: print('FAIL search', pid, e); time.sleep(3); continue
    cands = [r for r in data.get('results', []) if (r.get('width') or 0) >= 900 and (r.get('width') or 0) >= (r.get('height') or 0) and r.get('url', '').endswith('.jpg')]
    if not cands: cands = [r for r in data.get('results', []) if (r.get('width') or 0) >= 700 and r.get('url', '').endswith('.jpg')]
    if not cands: print('none', pid); time.sleep(2); continue
    r = cands[0]
    try: raw = get(r['url'], binary=True)
    except Exception as e: print('FAIL download', pid, e); time.sleep(2); continue
    im = Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((1280, 1280))
    q_ = 82
    while True:
        b = io.BytesIO(); im.save(b, 'JPEG', quality=q_, optimize=True)
        if b.tell() < 250000 or q_ < 50: break
        q_ -= 8
    open(os.path.join(out_dir, pid + '.jpg'), 'wb').write(b.getvalue())
    lic = LIC.get(r.get('license'), r.get('license', '').upper()) + ((' ' + r['license_version']) if r.get('license_version') and r.get('license') not in ('cc0', 'pdm') else '')
    res.append({'id': pid, 'topic': topic, 'tags': tags, 'file': 'assets/geo/photos/' + pid + '.jpg', 'w': im.width, 'h': im.height, 'caption': cap,
                'credit': (r.get('creator') or 'Flickr')[:120], 'licence': lic, 'source': r.get('foreign_landing_url'), 'title': r.get('title')})
    print('ok', pid, '|', r.get('title'), '|', lic, flush=True)
    json.dump(res, open(os.path.join(ROOT, 'tools', 'geo', 'research', 'photos-new.json'), 'w'), indent=1, ensure_ascii=False)
    time.sleep(4)
json.dump(res, open(os.path.join(ROOT, 'tools', 'geo', 'research', 'photos-new.json'), 'w'), indent=1, ensure_ascii=False)
print(len(res), 'saved')

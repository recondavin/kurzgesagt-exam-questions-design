(function () {
  // Answer mode: opens when the focus guide for 3B or 3C finishes.
  // The page clears, the question flies to the top of a ruled answer sheet, and every sentence
  // the student writes is checked against an SRP bank written in the style of the SEC marking
  // scheme (15 SRPs x 2 marks). A coach panel on the side gives clues that can be broken down
  // further, and a ghost-text hint appears for the first point only when the student is stuck.

  var LINE = 46; // ruled line spacing in px; the textarea uses the same line height
  var FIRST_ROWS = 22; // lines on the first page (under the question)
  var PAGE_ROWS = 28; // lines on every page after it
  var MIN_WORDS = 5; // a single sentence must say at least this much to count as an explained point
  var MAX_PER_SENTENCE = 1;

  // Each point lists word groups; a sentence earns the point when it hits every group.
  // A stem matches any word starting with it (small typos allowed for longer stems);
  // stems of three letters or fewer must be whole words; stems with a space are phrases.
  var QUESTIONS = {
    'question-3b': {
      code: '3B', title: 'Sedimentary Rocks', image: 'assets/answer/q3b.png?v=1', total: 15,
      normalise: [[/sedimentary\s+rocks?/g, ' srock '], [/sedimentary/g, ' srock ']],
      example: 'Sedimentary rocks begin when older rocks are weathered and eroded into small pieces called sediment.',
      ghost: 'This sediment is then transported by rivers, wind and ice to lakes and seas.',
      path: ['weather', 'transport', 'deposit', 'compact', 'cement', 'sandstone', 'sandEx', 'limestone', 'limeEx', 'warmSea', 'redDesert', 'shale', 'shaleEx', 'fossils', 'time', 'uplift', 'caco3', 'coal'],
      examples: ['sandEx', 'limeEx', 'shaleEx', 'coalEx'],
      points: [
        { id: 'define', label: 'What sedimentary rock is made from', all: [['srock'], ['sediment', 'fragment', 'particle', 'grain', 'remains', 'pieces', 'bits'], ['form', 'made', 'compos', 'consist', 'creat', 'build']] },
        { id: 'weather', label: 'Weathering and erosion make sediment', all: [['weather', 'erod', 'erosion', 'broken', 'break', 'worn'], ['rock', 'sediment', 'particle', 'piece', 'bits', 'sand', 'grain', 'fragment']],
          clue: ['Start at the very beginning. Where do the bits that make up a sedimentary rock come from?',
            'Older rocks get broken down by <b>weathering</b> (rain, frost, plant roots) and <b>erosion</b>. The broken bits are called <b>sediment</b>: sand, mud and pebbles.',
            'Picture a rock slowly crumbling into sand. Try: <i>"Sedimentary rocks begin when older rocks are weathered and eroded into sediment."</i>'] },
        { id: 'transport', label: 'Sediment is transported', all: [['transport', 'carried', 'carry', 'carries', 'washed', 'blown', 'moved'], ['river', 'wind', 'ice', 'glacier', 'water', 'sea', 'current', 'wave', 'stream']],
          clue: ['Once the rock is broken into bits, how do those bits travel?',
            '<b>Rivers</b>, <b>wind</b>, <b>ice</b> and sea currents carry the sediment away. Say what carries it and where it ends up.',
            'Picture a river carrying sand down to the sea. Try: <i>"The sediment is transported by rivers and wind to lakes and seas."</i>'] },
        { id: 'deposit', label: 'Deposited in layers', all: [['deposit', 'laid down', 'settle', 'accumulat', 'build up', 'built up', 'piled', 'pile up', 'dropped'], ['layer', 'strata', 'stratum', 'bed', 'sea', 'ocean', 'lake', 'floor', 'bottom']],
          clue: ['When the river slows down, what happens to the sediment it was carrying?',
            'It drops: it is <b>deposited</b>. Over time the bits pile up in flat <b>layers</b>, called <b>strata</b>, on the sea or lake floor.',
            'Like sand settling at the bottom of a glass of water. Try: <i>"The sediment is deposited in layers called strata on the sea floor."</i>'] },
        { id: 'compact', label: 'Compaction', all: [['compact', 'compress', 'squeez', 'squash', 'weight', 'pressure', 'pressed'], ['layer', 'sediment', 'grain', 'particle', 'water', 'above', 'overlying', 'together', 'below', 'beneath']],
          clue: ['The layers keep piling up for millions of years. What does all that weight do to the layers underneath?',
            'The weight <b>squeezes</b> the lower layers. Water is pushed out and the grains press tightly together. This is <b>compaction</b>.',
            'Like stacking heavy books on a sponge. Try: <i>"The weight of the layers above compacts the sediment and squeezes out the water."</i>'] },
        { id: 'cement', label: 'Cementation', all: [['cement', 'glue', 'bind', 'bound', 'stuck', 'stick'], ['calcite', 'silica', 'iron', 'mineral', 'grain', 'particle', 'together', 'sediment']],
          clue: ['The grains are squeezed together, but what glues them into solid rock?',
            'Minerals like <b>calcite</b> or <b>silica</b> come out of the water and stick the grains together. This is <b>cementation</b>.',
            'Like glue on sand. Try: <i>"Minerals such as calcite cement the grains together, turning the sediment into solid rock."</i>'] },
        { id: 'lithify', label: 'Lithification', all: [['lithif', 'turn into rock', 'turns into rock', 'turned into rock', 'harden', 'solid rock', 'becomes rock', 'become rock']] },
        { id: 'sandstone', label: 'Sandstone forms from sand', all: [['sandstone'], ['sand', 'grain', 'quartz', 'desert', 'river', 'compact', 'cement']],
          clue: ['Time to name a rock. Which sedimentary rock is made of sand?',
            '<b>Sandstone</b>. Sand grains (mostly quartz) were laid down by rivers or in deserts, then compacted and cemented.',
            'Try: <i>"Sandstone is formed from grains of sand that were compacted and cemented together."</i>'] },
        { id: 'redDesert', label: 'Red colour from desert conditions', all: [['red', 'iron', 'rust', 'oxid'], ['desert', 'arid', 'hot', 'dry', 'stain', 'iron', 'oxid', 'rust']],
          clue: ['Why is a lot of Irish sandstone red?',
            'It formed in <b>hot desert</b> conditions about 400 million years ago, when <b>iron</b> in the sand rusted and stained it red.',
            'Try: <i>"Old Red Sandstone is red because iron in the sand oxidised in hot desert conditions."</i>'] },
        { id: 'sandEx', label: 'Irish sandstone example', all: [['sandstone'], ['munster', 'kerry', 'cork', 'macgillycuddy', 'galtee', 'comeragh', 'knockmealdown', 'carrauntoohil', 'mountain', 'mourne', 'slieve']],
          clue: ['The question asks for Irish examples. Where in Ireland is there sandstone?',
            '<b>Old Red Sandstone</b> forms the mountains of Munster, like the <b>MacGillycuddy\'s Reeks</b> in Co. Kerry and the Galtees.',
            'Try: <i>"Old Red Sandstone is found in the MacGillycuddy\'s Reeks in Co. Kerry."</i>'] },
        { id: 'limestone', label: 'Limestone from shells and skeletons', all: [['limestone'], ['shell', 'skeleton', 'coral', 'organism', 'creature', 'marine', 'animal', 'remains', 'calcium', 'fish']],
          clue: ['Not every sedimentary rock comes from broken rock. Which one is made from sea creatures?',
            '<b>Limestone</b>. The <b>shells and skeletons</b> of tiny sea creatures and coral piled up on the sea floor, then were compacted and cemented.',
            'Try: <i>"Limestone is formed from the shells and skeletons of sea creatures that built up on the sea floor."</i>'] },
        { id: 'warmSea', label: 'Warm, shallow tropical seas', all: [['warm', 'shallow', 'tropical', 'clear', 'equator'], ['sea', 'ocean', 'water', 'limestone', 'coral', 'ireland']],
          clue: ['What kind of sea did those creatures live in?',
            '<b>Warm, clear, shallow</b> tropical seas. Ireland was near the <b>equator</b> about 350 million years ago.',
            'Try: <i>"This happened in warm, shallow seas when Ireland was near the equator."</i>'] },
        { id: 'limeEx', label: 'Irish limestone example', all: [['limestone', 'karst'], ['burren', 'clare', 'midland', 'central lowland', 'aran', 'ben bulben', 'benbulben', 'fermanagh', 'sligo', 'marble arch', 'ailwee', 'aillwee', 'lowlands']],
          clue: ['Where is the most famous limestone in Ireland?',
            'The <b>Burren</b> in Co. Clare. Most of the <b>Central Lowlands</b> (the Midlands) also sit on limestone.',
            'Try: <i>"Limestone can be seen at the Burren in Co. Clare."</i>'] },
        { id: 'caco3', label: 'Calcium carbonate', all: [['calcium carbonate', 'caco3']],
          clue: ['What chemical is limestone mostly made of?',
            '<b>Calcium carbonate</b>. It comes from the shells of the sea creatures.',
            'Try: <i>"Limestone is made mainly of calcium carbonate from the shells."</i>'] },
        { id: 'shale', label: 'Shale forms from mud', all: [['shale', 'mudstone', 'siltstone'], ['mud', 'clay', 'silt', 'fine']],
          clue: ['Which sedimentary rock forms from the finest mud?',
            '<b>Shale</b>. Very fine <b>mud and clay</b> settle in calm water and are compacted into thin layers.',
            'Try: <i>"Shale is formed when fine mud and clay are compacted into thin layers."</i>'] },
        { id: 'shaleEx', label: 'Irish shale example', all: [['shale', 'flagstone'], ['moher', 'clare', 'liscannor']],
          clue: ['Where can you see layers of shale in Ireland?',
            'The <b>Cliffs of Moher</b> in Co. Clare show layers of shale and sandstone.',
            'Try: <i>"Layers of shale can be seen at the Cliffs of Moher in Co. Clare."</i>'] },
        { id: 'fossils', label: 'Fossils', all: [['fossil']],
          clue: ['What can sometimes be found trapped inside sedimentary rocks?',
            '<b>Fossils</b>: the remains of plants and animals pressed into the layers as they formed.',
            'Try: <i>"Limestone often contains fossils of sea creatures."</i>'] },
        { id: 'time', label: 'Takes millions of years', all: [['million', 'carboniferous', 'devonian', 'geological time', 'long time', 'thousands of years']],
          clue: ['How long does all of this take?',
            '<b>Millions of years</b>. Irish limestone formed about 350 million years ago.',
            'Try: <i>"This process takes millions of years."</i>'] },
        { id: 'uplift', label: 'Uplift brings the rock to the surface', all: [['uplift', 'folded', 'folding', 'exposed', 'pushed up', 'raised', 'lifted'], ['rock', 'layer', 'sea', 'surface', 'mountain', 'limestone', 'sandstone', 'land', 'plate']],
          clue: ['If these rocks formed under the sea, how are they on land today?',
            'Plate movements <b>folded and uplifted</b> them, so we can see them at the surface.',
            'Try: <i>"The rocks were later uplifted by plate movements and are now on land."</i>'] },
        { id: 'bedding', label: 'Bedding planes and joints', all: [['bedding plane', 'bedding planes', 'joints', 'horizontal']] },
        { id: 'chemical', label: 'Chemically formed rocks', all: [['chemical', 'evaporat', 'precipitat', 'rock salt', 'gypsum']] },
        { id: 'coal', label: 'Coal forms from plants', all: [['coal'], ['plant', 'vegetation', 'swamp', 'peat', 'forest', 'tree']],
          clue: ['Which sedimentary rock is made from ancient plants?',
            '<b>Coal</b>. Swamp plants died, were buried and compacted, and slowly turned into coal.',
            'Try: <i>"Coal formed from swamp plants that were buried and compacted, as at Castlecomer in Co. Kilkenny."</i>'] },
        { id: 'coalEx', label: 'Irish coal example', all: [['coal'], ['arigna', 'leitrim', 'roscommon', 'castlecomer', 'kilkenny', 'tipperary']] },
        { id: 'types', label: 'Types of sedimentary rock', all: [['mechanical', 'clastic', 'organic', 'biogenic', 'inorganic'], ['srock', 'rock', 'formed', 'type', 'group']] }
      ]
    },
    'question-3c': {
      code: '3C', title: 'Seismic Activity', image: 'assets/answer/q3c.png?v=1', total: 15,
      sides: { p: 'Predict', r: 'Reduce' },
      normalise: [],
      example: 'Seismologists use seismographs to record small tremors called foreshocks, which can warn that a bigger earthquake may follow.',
      ghost: 'Buildings are designed to sway with the shaking so that they do not collapse.',
      path: ['seismo', 'build', 'gaps', 'base', 'tilt', 'damper', 'radon', 'drills', 'laser', 'warning', 'animals', 'zoning', 'difficult', 'emergency', 'shutoff', 'retrofit', 'tsunami'],
      points: [
        { id: 'seismo', side: 'p', label: 'Seismographs record tremors', all: [['seismograph', 'seismometer', 'seismic monitor', 'sensors'], ['record', 'measur', 'detect', 'vibration', 'tremor', 'movement', 'shak', 'monitor', 'foreshock']],
          clue: ['How do scientists keep watch for earthquakes? What instrument do they use?',
            'A <b>seismograph</b> records vibrations in the ground. Small tremors (<b>foreshocks</b>) can warn that a bigger earthquake may follow.',
            'Try: <i>"Seismographs record small tremors called foreshocks, which may warn of a bigger earthquake."</i>'] },
        { id: 'foreshock', side: 'p', label: 'Foreshocks as a warning', all: [['foreshock', 'small tremor', 'minor tremor', 'small earthquake', 'tremors before'], ['warn', 'before', 'bigger', 'larger', 'main', 'follow', 'sign', 'coming']] },
        { id: 'gaps', side: 'p', label: 'Seismic gaps and past patterns', all: [['gap', 'pattern', 'history', 'historic', 'previous', 'past', 'records', 'frequency'], ['earthquake', 'fault', 'area', 'quake', 'happen', 'occur', 'region', 'place']],
          clue: ['Can the past help us guess where the next earthquake will be?',
            'Scientists map where earthquakes have happened before. A part of a fault that has not moved for a long time, a <b>seismic gap</b>, is likely to be next.',
            'Try: <i>"Scientists study seismic gaps, parts of a fault that have not moved in a long time, because stress is building there."</i>'] },
        { id: 'tilt', side: 'p', label: 'Tiltmeters measure ground bulging', all: [['tiltmeter', 'tilt', 'bulg', 'deform', 'swell', 'creepmeter']],
          clue: ['Does the ground change shape before an earthquake?',
            'Stress can make the ground <b>bulge or tilt</b> very slightly. <b>Tiltmeters</b> measure these tiny changes.',
            'Try: <i>"Tiltmeters measure small changes in the slope of the ground as stress builds up."</i>'] },
        { id: 'laser', side: 'p', label: 'Lasers and GPS track movement', all: [['laser', 'gps', 'satellite'], ['movement', 'measur', 'monitor', 'move', 'shift', 'plate', 'fault', 'track', 'distance']],
          clue: ['How can satellites help scientists?',
            '<b>Lasers</b> and <b>GPS satellites</b> measure how far the ground moves along a fault, showing where stress is building.',
            'Try: <i>"GPS satellites measure tiny movements along fault lines to show where stress is building."</i>'] },
        { id: 'radon', side: 'p', label: 'Radon gas and well water', all: [['radon', 'gas', 'water level', 'well', 'groundwater', 'water table']],
          clue: ['Are there clues coming out of the ground itself?',
            'As rocks crack under stress, <b>radon gas</b> can escape and <b>water levels in wells</b> can change.',
            'Try: <i>"A rise in radon gas in wells may show that rocks are cracking before an earthquake."</i>'] },
        { id: 'animals', side: 'p', label: 'Unusual animal behaviour', all: [['animal', 'dog', 'cat', 'toad', 'snake', 'bird', 'fish', 'pets', 'horse'], ['behav', 'strange', 'unusual', 'restless', 'flee', 'leave', 'odd', 'nervous', 'act']],
          clue: ['Have people noticed animals acting strangely?',
            'Some reports say animals become <b>restless</b> before earthquakes, maybe sensing tiny vibrations. It is not reliable though.',
            'Try: <i>"Strange animal behaviour, such as dogs becoming restless, has been reported before earthquakes."</i>'] },
        { id: 'stress', side: 'p', label: 'Monitoring stress on faults', all: [['stress', 'strain', 'creep', 'pressure'], ['fault', 'rock', 'build', 'measur', 'plate', 'monitor']] },
        { id: 'plates', side: 'p', label: 'Plate boundaries show where', all: [['plate boundar', 'boundary', 'boundaries', 'fault line', 'fault zone', 'ring of fire', 'san andreas', 'subduction'], ['likely', 'occur', 'predict', 'risk', 'map', 'where', 'zone', 'happen', 'common']] },
        { id: 'magnetic', side: 'p', label: 'Magnetic and electrical changes', all: [['magnetic', 'electrical', 'electromagnetic', 'conductiv']] },
        { id: 'difficult', side: 'p', label: 'Prediction is not exact', all: [['difficult', 'hard', 'impossible', 'cannot', 'can t', 'not possible', 'unreliable', 'not accurate', 'inaccurate', 'not exact'], ['predict', 'forecast', 'when', 'exact', 'time', 'tell']],
          clue: ['Can scientists say exactly when an earthquake will strike?',
            'No. They can say <b>where</b> one is likely, but not the <b>exact time</b>. That is why reducing the effects matters too.',
            'Try: <i>"Scientists cannot predict the exact time of an earthquake, only the areas most at risk."</i>'] },
        { id: 'build', side: 'r', label: 'Earthquake-proof building design', all: [['building', 'structure', 'skyscraper', 'house', 'bridge'], ['proof', 'resist', 'design', 'flexib', 'sway', 'absorb', 'strong', 'regulation', 'code', 'collaps', 'standard', 'law']],
          clue: ['Now the other half. How can we stop buildings from falling down?',
            'Buildings can be designed to <b>bend and sway</b> instead of cracking, and strict <b>building codes</b> make sure they are built that way.',
            'Try: <i>"Buildings are designed to sway with the shaking so that they do not collapse."</i>'] },
        { id: 'base', side: 'r', label: 'Base isolation and shock absorbers', all: [['base isolat', 'shock absorb', 'rubber', 'spring', 'roller', 'pads', 'isolator', 'foundation'], ['absorb', 'reduce', 'shak', 'movement', 'vibration', 'building', 'ground', 'stop']],
          clue: ['What could you put under a building so the ground shakes but the building shakes less?',
            '<b>Rubber pads</b> or <b>springs</b> (base isolators) sit between the building and its foundations and <b>absorb</b> the shaking.',
            'Try: <i>"Rubber shock absorbers in the foundations absorb the movement of the ground."</i>'] },
        { id: 'bracing', side: 'r', label: 'Steel frames and cross-bracing', all: [['steel', 'cross brac', 'cross-brac', 'bracing', 'reinforc', 'frame'], ['building', 'strong', 'support', 'collaps', 'shak', 'stop', 'hold', 'wall', 'concrete']] },
        { id: 'damper', side: 'r', label: 'Counterweights steady tall buildings', all: [['counterweight', 'counter weight', 'damper', 'pendulum', 'weight on the roof', 'weight at the top'], ['sway', 'building', 'reduce', 'shak', 'movement', 'balance', 'steady']],
          clue: ['What can stop a tall skyscraper swaying too much?',
            'A huge <b>counterweight</b> near the top moves the opposite way to the shaking and steadies the building.',
            'Try: <i>"Tall buildings use counterweights on the roof to reduce swaying."</i>'] },
        { id: 'shape', side: 'r', label: 'Pyramid shapes and wide bases', all: [['pyramid', 'transamerica', 'wide base', 'tapered']] },
        { id: 'drills', side: 'r', label: 'Earthquake drills and education', all: [['drill', 'educat', 'practi', 'train', 'aware', 'teach', 'school', 'taught'], ['earthquake', 'people', 'children', 'student', 'drop', 'cover', 'shelter', 'hold', 'what to do', 'safe']],
          clue: ['What can people practise so they know what to do?',
            '<b>Earthquake drills</b> in schools and workplaces teach people to <b>drop, cover and hold on</b>.',
            'Try: <i>"In Japan, people practise earthquake drills so they know to drop, cover and hold on."</i>'] },
        { id: 'dropcover', side: 'r', label: 'Drop, cover and hold on', all: [['drop', 'duck', 'cover', 'hold on', 'under a table', 'under a desk', 'doorway'], ['table', 'desk', 'head', 'shelter', 'safe', 'hold', 'protect']] },
        { id: 'warning', side: 'r', label: 'Early warning systems', all: [['warning', 'alert', 'alarm', 'siren', 'text message', 'phone'], ['people', 'second', 'train', 'evacuat', 'cover', 'system', 'send', 'stop', 'time']],
          clue: ['Even a few seconds of warning helps. How could people be warned?',
            'Sensors detect the first waves and send <b>alerts</b> to phones, TV and trains before the strong shaking arrives.',
            'Try: <i>"Early warning systems send alerts to phones so trains can stop and people can take cover."</i>'] },
        { id: 'emergency', side: 'r', label: 'Emergency kits and services', all: [['emergency', 'kit', 'supplies', 'rescue', 'first aid', 'torch', 'tinned food', 'bottled water'], ['food', 'water', 'torch', 'team', 'service', 'ready', 'prepar', 'keep', 'survive', 'help']],
          clue: ['After the shaking stops, what helps people survive?',
            '<b>Emergency kits</b> with water, food and a torch, and trained <b>rescue teams</b> ready to go.',
            'Try: <i>"Families keep emergency kits with food, water and a torch in case of an earthquake."</i>'] },
        { id: 'shutoff', side: 'r', label: 'Automatic gas and power shut-off', all: [['shut off', 'shut-off', 'shuts off', 'automatic', 'switch off', 'cut off', 'turned off', 'turn off'], ['gas', 'electric', 'power', 'train', 'pipe', 'fire']],
          clue: ['Fires often break out after earthquakes. What can stop that happening?',
            'Gas and electricity can <b>shut off automatically</b> when shaking is detected, so broken pipes do not start fires.',
            'Try: <i>"Gas pipes shut off automatically during an earthquake to prevent fires."</i>'] },
        { id: 'zoning', side: 'r', label: 'Land-use planning', all: [['land use', 'zoning', 'liquefaction', 'liquefy', 'soft ground', 'reclaimed', 'landfill', 'planning', 'planners'], ['build', 'avoid', 'ground', 'stop', 'land', 'soft', 'liquid']],
          clue: ['Where should we avoid building?',
            'Soft or reclaimed ground can turn to liquid when shaken (<b>liquefaction</b>), so planners keep big buildings off it.',
            'Try: <i>"Planners stop people building on soft ground, which can turn to liquid during an earthquake."</i>'] },
        { id: 'retrofit', side: 'r', label: 'Retrofitting old buildings', all: [['retrofit', 'strengthen', 'upgrade', 'renovat'], ['building', 'old', 'older', 'existing', 'house', 'bridge']],
          clue: ['What about old buildings that were built before the rules?',
            'Old buildings can be <b>retrofitted</b>: strengthened with steel braces or new foundations.',
            'Try: <i>"Older buildings are retrofitted with steel braces to make them stronger."</i>'] },
        { id: 'tsunami', side: 'r', label: 'Tsunami defences', all: [['tsunami'], ['warning', 'wall', 'barrier', 'evacuat', 'buoy', 'sea wall', 'high ground', 'alert']],
          clue: ['Earthquakes under the sea cause another danger. What is it and how can coasts be protected?',
            'A <b>tsunami</b>. Warning buoys, sea walls and evacuation routes to high ground protect coastal towns.',
            'Try: <i>"Japan has tsunami warning systems and sea walls to protect coastal towns."</i>'] },
        { id: 'fire', side: 'r', label: 'Fire prevention', all: [['fire'], ['break', 'hydrant', 'prevent', 'spread', 'gas', 'service', 'brigade', 'stop']] },
        { id: 'aid', side: 'r', label: 'Aid and recovery', all: [['insurance', 'aid', 'recovery', 'rebuild', 'donation', 'donate']] }
      ]
    }
  };

  var state = null;

  // ---------- matching ----------
  function lev(a, b) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > 1) return 2;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function normalise(q, text) {
    var t = ' ' + text.toLowerCase().replace(/[‘’']/g, ' ').replace(/[^a-z0-9]+/g, ' ') + ' ';
    q.normalise.forEach(function (rule) { t = t.replace(rule[0], rule[1]); });
    return t.replace(/\s+/g, ' ');
  }
  function stemHit(stem, norm, tokens) {
    if (stem.indexOf(' ') >= 0) return norm.indexOf(' ' + stem) >= 0;
    if (stem.length <= 3) return tokens.some(function (t) { return t === stem || t === stem + 's'; });
    return tokens.some(function (t) {
      if (t.indexOf(stem) === 0) return true;
      if (stem.length < 6 || t.length < stem.length - 1 || t[0] !== stem[0]) return false;
      for (var L = stem.length - 1; L <= stem.length + 1; L++) if (lev(stem, t.slice(0, L)) <= 1) return true;
      return false;
    });
  }
  function groupHits(point, norm, tokens) {
    return point.all.map(function (group) { return group.some(function (stem) { return stemHit(stem, norm, tokens); }); });
  }
  // ---------- sentence detection ----------
  // Students often skip full stops, so sentences are also found from the words themselves:
  // a capital letter after an ordinary word starts a new sentence (place names and words like
  // "the" or "and" before it don't count), and a sentence still being typed counts as finished once
  // it has a doing-word, at least six words, a space after its last word and no dangling ending.
  function wordSet(list) { var o = {}; list.split(' ').forEach(function (w) { o[w] = true; }); return o; }
  var LINKING = wordSet('and or but nor the a an of to from by into onto which that because so as such with in on at is are was were be been can could will would may might called when where while than then their its this these those his her our your my if since until unless like through over under about for after before during between also very more most');
  var PROPER = wordSet('i ireland irish burren clare co county kerry cork munster leinster ulster connacht midlands central lowlands macgillycuddy macgillycuddys reeks galtee galtees comeragh knockmealdown carrauntoohil mourne mournes slieve aran moher cliffs liscannor fermanagh sligo benbulben ben bulben marble arch arigna leitrim roscommon castlecomer kilkenny tipperary dublin antrim giants causeway old red sandstone carboniferous devonian atlantic pacific europe european africa african american america eurasian japan japanese tokyo kobe fukushima tohoku california san francisco andreas los angeles chile new zealand christchurch turkey haiti nepal italy iceland indonesia china mexico ring fire richter mercalli gps usgs transamerica');
  var VERB_WORDS = wordSet('is are was were be been am has have had can will may might could would do does did lay laid made make makes built ran sank rose fell took gave saw seen got went came kept stuck broke broken found ground hit cut shut put set sent taught bent wore swept');
  var VERB_STEMS = 'becom form compact compress cement carr transport deposit settl build erod weather break turn contain occur caus use record measur detect predict reduc design sway absorb warn send stop prevent practi protect collaps shak mov rise releas help tak happen call squeez press pile glue stick harden lithif creat develop show appear give fold uplift expos sink die live chang kill destroy monitor stud look watch bend evacuat train teach keep store plan strengthen need allow mean tell say get come wear grind accumulat build drop wash blow flow erupt crack split slip shift strike hit ris fall bulg tilt leak emit indicat suggest mak find lead result produc dissolv precipitat evaporat bind bond fill cover bury buri sit lie remain fossilis fossiliz compos consist includ involv requir reinforc retrofit install fit add place equip educat inform alert notif track map identif analys analyz' .split(' ');
  function hasVerb(words) {
    return words.some(function (w) {
      var t = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!t) return false;
      if (VERB_WORDS[t] || (t.length > 4 && /ed$/.test(t))) return true;
      return VERB_STEMS.some(function (stem) { return t.indexOf(stem) === 0 && t.length <= stem.length + 4; });
    });
  }
  function bare(w) { return w.toLowerCase().replace(/'s$/, '').replace(/[^a-z']/g, ''); }
  // Offsets inside `body` where a new sentence starts without punctuation.
  function capitalBreaks(body) {
    var out = [];
    var re = /(\S+)(\s+)(?=[A-Z])/g, m;
    while ((m = re.exec(body))) {
      var prev = m[1];
      var next = body.slice(m.index + m[0].length).match(/^[A-Za-z']+/);
      if (!next) continue;
      if (/[,;:(\-]$/.test(prev)) continue;
      var p = bare(prev), n = bare(next[0]);
      if (!p || LINKING[p] || PROPER[n] || n.length < 2 && n !== 'a') continue;
      if (/^[A-Z]/.test(prev) && PROPER[p] && PROPER[n]) continue;
      out.push(m.index + m[0].length);
    }
    return out;
  }
  function looksFinished(body, followedBySpace) {
    var words = body.trim().split(/\s+/);
    if (words.length < 6 || !followedBySpace) return false;
    if (LINKING[bare(words[words.length - 1])]) return false;
    return hasVerb(words);
  }
  function splitSentences(text) {
    var out = [];
    // Dots in abbreviations (Co. Clare, Mt. Fuji, e.g.) do not end a sentence.
    var masked = text.replace(/\b(Co|St|Mt|Mr|Mrs|Dr|approx|etc|e\.g|i\.e|eg|ie|vs)\./gi, function (w) { return w.slice(0, -1) + '\u2024'; });
    var re = /[^.!?\n]+[.!?]*/g, m;
    while ((m = re.exec(masked))) {
      var raw = text.slice(m.index, m.index + m[0].length);
      var punct = /[.!?]\s*$/.test(raw);
      var cuts = [0].concat(capitalBreaks(raw), [raw.length]);
      for (var c = 0; c < cuts.length - 1; c++) {
        var piece = raw.slice(cuts[c], cuts[c + 1]);
        var lead = piece.match(/^\s*/)[0].length;
        var body = piece.slice(lead).replace(/\s+$/, '');
        if (!body) continue;
        var start = m.index + cuts[c] + lead;
        var end = start + body.length;
        var lastPiece = c === cuts.length - 2;
        var followed = end < text.length && /\s/.test(text.charAt(end));
        var finishedByText = !lastPiece || punct || m.index + raw.length < text.length;
        out.push({ start: start, end: end, text: body,
          complete: finishedByText || looksFinished(body, followed),
          open: lastPiece && !punct && m.index + raw.length >= text.length,
          words: body.split(/\s+/).length, hits: [] });
      }
    }
    return out;
  }
  // `open` decides whether an unfinished sentence (no full stop yet) may count.
  function evaluate(q, text, open) {
    var sentences = splitSentences(text);
    var used = {};
    sentences.forEach(function (s) {
      var norm = normalise(q, s.text);
      var tokens = norm.trim().split(' ');
      var counts = s.words >= MIN_WORDS && (s.complete || (open && s.words >= 6 && open(s)));
      for (var i = 0; counts && i < q.points.length && s.hits.length < MAX_PER_SENTENCE; i++) {
        var p = q.points[i];
        if (used[p.id]) continue;
        if (groupHits(p, norm, tokens).every(Boolean)) { used[p.id] = true; s.hits.push(p); }
      }
      if (!s.hits.length && s.complete) {
        // A near miss: the key term is there but the point is not explained yet.
        s.near = q.points.filter(function (p) {
          if (used[p.id] || p.all.length < 2) return false;
          var g = groupHits(p, norm, tokens);
          return g[0] && !g.every(Boolean);
        })[0] || null;
      }
    });
    return sentences;
  }

  // ---------- helpers ----------
  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function later(fn, ms) { var t = setTimeout(fn, ms); state.timers.push(t); return t; }
  function pointById(id) { return state.q.points.filter(function (p) { return p.id === id; })[0]; }
  function store(key, value) { try { if (value == null) return window.localStorage.getItem(key); window.localStorage.setItem(key, value); } catch (err) {} return null; }

  // ---------- coach ----------
  function nextPoint() {
    var q = state.q, got = state.got;
    var open = q.path.map(pointById).filter(function (p) { return p && !got[p.id]; });
    if (!open.length) return null;
    if (q.examples && state.count >= 6 && !q.examples.some(function (id) { return got[id]; })) {
      var ex = open.filter(function (p) { return q.examples.indexOf(p.id) >= 0; })[0];
      if (ex) return ex;
    }
    if (q.sides) {
      var counts = { p: 0, r: 0 };
      Object.keys(got).forEach(function (id) { var p = pointById(id); if (p) counts[p.side]++; });
      var side = counts.p <= counts.r ? 'p' : 'r';
      var pick = open.filter(function (p) { return p.side === side; })[0];
      if (pick) return pick;
    }
    return open[0];
  }
  // A message has a title and up to three levels; "Still don't get it" steps down a level.
  function say(title, levels, tone) {
    var coach = state.coach;
    state.msg = { title: title, levels: levels, level: 0, tone: tone || '' };
    coach.classList.remove('am-coach--min');
    renderMsg(true);
  }
  function renderMsg(fresh) {
    var msg = state.msg, coach = state.coach;
    var box = coach.querySelector('.am-coach__msg');
    box.className = 'am-coach__msg' + (msg.tone ? ' am-coach__msg--' + msg.tone : '');
    var html = '<h4 class="am-coach__title">' + msg.title + '</h4>';
    for (var i = 0; i <= msg.level; i++) {
      html += '<p class="am-coach__p' + (i === msg.level ? ' am-coach__p--new' : '') + (i > 0 ? ' am-coach__p--deeper' : '') + '">' + msg.levels[i] + '</p>';
    }
    box.innerHTML = html;
    if (fresh) { box.classList.remove('am-pop'); void box.offsetWidth; box.classList.add('am-pop'); }
    var more = coach.querySelector('[data-am-more]');
    more.hidden = msg.level >= msg.levels.length - 1;
    coach.querySelector('.am-coach__body').scrollTop = fresh ? 0 : 1e6;
  }
  function clueFor(p) {
    return p && p.clue ? p.clue : ['Read your last sentence again. Does it say <b>what</b> happens and <b>why</b>?', 'Pick one idea and explain it fully in one sentence: the point, then how or why it happens.', 'Use a short pattern: <i>"[Idea] happens because [reason], so [result]."</i>'];
  }
  function offerClue(fromButton) {
    var p = nextPoint();
    if (!p) { say('You\'ve covered everything!', ['There\'s nothing left that I can hint at. Read your answer over and make every sentence clear.']); return; }
    var c = clueFor(p);
    say('Here\'s a hand', [c[0], c[1], c[2]], 'clue');
    if (!state.firstDone) showGhost(true);
  }
  function refreshScore() {
    var q = state.q;
    var marks = Math.min(q.total, state.count) * 2;
    var score = state.coach.querySelector('.am-score');
    score.querySelector('[data-am-marks]').textContent = marks;
    var pips = score.querySelector('.am-pips');
    if (pips.children.length !== q.total) pips.innerHTML = new Array(q.total + 1).join('<i></i>');
    Array.prototype.forEach.call(pips.children, function (pip, k) { pip.classList.toggle('on', k < state.count); });
    var meta = score.querySelector('.am-score__meta');
    if (q.sides) {
      var counts = { p: 0, r: 0 };
      Object.keys(state.got).forEach(function (id) { var p = pointById(id); if (p) counts[p.side]++; });
      meta.innerHTML = '<span class="am-tag am-tag--p">Predict ' + counts.p + '</span><span class="am-tag am-tag--r">Reduce ' + counts.r + '</span>';
    } else {
      var hasEx = q.examples.some(function (id) { return state.got[id]; });
      meta.innerHTML = '<span class="am-tag ' + (hasEx ? 'am-tag--ok' : '') + '">Irish example ' + (hasEx ? '&#10003;' : 'needed') + '</span>';
    }
  }

  // ---------- writing area ----------
  // The answer is written across ruled pages. Each page is its own textarea with a fixed number
  // of lines; when a page fills up, the overflow moves onto the next page (a new one is added if needed).
  // The pages are joined with a space for marking, so a sentence can run over a page break.
  function fullText() {
    // Join up to the last page with writing on it, so empty pages don't add a fake trailing space.
    var values = state.pages.map(function (p) { return p.ta.value; });
    while (values.length > 1 && !values[values.length - 1]) values.pop();
    return values.join(' ');
  }
  function rowsFor(text) {
    var m = state.measure;
    m.textContent = text + '​';
    return Math.round(m.scrollHeight / LINE);
  }
  function addPage(silent) {
    var k = state.pages.length;
    var q = state.q;
    var node = el('div', 'am-sheet am-page' + (k ? ' am-page--more' : ''));
    node.innerHTML = (k === 0
      ? '<img class="am-question" alt="Question ' + q.code + ': ' + q.title + '" src="' + q.image + '"><div class="am-label">Your answer</div>'
      : '<div class="am-page__head">' + q.code + ' &middot; ' + q.title + ' (continued)</div>') +
      '<div class="am-write"><div class="am-lines" aria-hidden="true"></div><div class="am-mirror" aria-hidden="true"></div>' +
      '<textarea class="am-input" spellcheck="true" aria-label="Answer to question ' + q.code + ', page ' + (k + 1) + '"></textarea>' +
      '<div class="am-badges" aria-hidden="true"></div><div class="am-caret" aria-hidden="true"></div></div>' +
      '<div class="am-page__num">' + (k + 1) + '</div>';
    state.pagesEl.insertBefore(node, state.addBtn);
    var page = { el: node, ta: node.querySelector('.am-input'), mirror: node.querySelector('.am-mirror'), lines: node.querySelector('.am-lines'),
      badges: node.querySelector('.am-badges'), caret: node.querySelector('.am-caret'), rows: k ? PAGE_ROWS : FIRST_ROWS, index: k };
    page.ta.style.height = page.rows * LINE + 'px';
    page.mirror.style.height = page.rows * LINE + 'px';
    for (var i = 0; i < page.rows; i++) {
      var line = el('div', 'am-line' + (state.linesDrawn ? ' am-line--now' : ''));
      line.style.top = (i * LINE + 35) + 'px';
      line.style.setProperty('--i', i);
      page.lines.appendChild(line);
    }
    var ta = page.ta;
    ta.addEventListener('input', function () { reflow(page.index); onInput(); });
    ta.addEventListener('focus', function () { state.active = page.index; render(); });
    ta.addEventListener('blur', function () { later(render, 0); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !e.shiftKey && acceptGhost()) { e.preventDefault(); return; }
      if (e.key === 'Escape') { e.stopPropagation(); if (state.ghostOn) { state.ghostOn = false; render(); } else close(); return; }
      // Backspace or Up at the very start of a page carries on at the end of the page before.
      if (page.index > 0 && ta.selectionStart === 0 && ta.selectionEnd === 0 && (e.key === 'Backspace' || e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        focusPage(page.index - 1, Infinity);
      }
      if (e.key === 'ArrowDown' && ta.selectionStart === ta.value.length && state.pages[page.index + 1]) {
        e.preventDefault();
        focusPage(page.index + 1, 0);
      }
    });
    ['keyup', 'click', 'mouseup', 'select'].forEach(function (type) { ta.addEventListener(type, render); });
    state.pages.push(page);
    if (!silent) node.classList.add('am-page--new');
    return page;
  }
  function focusPage(k, caret) {
    var ta = state.pages[k].ta;
    ta.focus({ preventScroll: true });
    var at = caret === Infinity ? ta.value.length : Math.min(caret, ta.value.length);
    ta.selectionStart = ta.selectionEnd = at;
    state.active = k;
    render();
    var caret = state.pages[k].caret;
    if (caret.scrollIntoView) caret.scrollIntoView({ block: 'nearest' });
  }
  function reflow(k) {
    for (; k < state.pages.length; k++) {
      var page = state.pages[k], t = page.ta.value;
      if (rowsFor(t) <= page.rows) return;
      var lo = 0, hi = t.length;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (rowsFor(t.slice(0, mid)) <= page.rows) lo = mid; else hi = mid - 1; }
      var cut = lo;
      var space = t.slice(0, cut + 1).search(/\s\S*$/);
      if (space > 0) cut = space;
      var drop = /\s/.test(t.charAt(cut)) ? 1 : 0;
      var rest = t.slice(cut + drop);
      var caret = page.ta.selectionStart, focused = document.activeElement === page.ta;
      page.ta.value = t.slice(0, cut);
      var next = state.pages[k + 1] || addPage();
      next.ta.value = rest + (rest && next.ta.value ? ' ' : '') + next.ta.value;
      if (focused) {
        if (caret > cut) focusPage(k + 1, Math.max(0, caret - cut - drop));
        else { page.ta.selectionStart = page.ta.selectionEnd = caret; }
      }
    }
  }
  function render() {
    if (!state) return;
    var off = 0;
    state.pages.forEach(function (page, k) {
      var v = page.ta.value;
      page.off = off;
      var focused = document.activeElement === page.ta;
      var caretAt = focused && page.ta.selectionStart === page.ta.selectionEnd ? page.ta.selectionStart : -1;
      var CARET = '<span class="am-cm"></span>';
      var slice = function (a, b) {
        if (caretAt >= a && caretAt < b) return esc(v.slice(a, caretAt)) + CARET + esc(v.slice(caretAt, b));
        return esc(v.slice(a, b));
      };
      var html = '', p = 0;
      state.sentences.forEach(function (s, i) {
        if (!s.hits.length) return;
        var a = Math.max(s.start - off, 0), b = Math.min(s.end - off, v.length);
        if (b <= a) return;
        if (a > p) html += slice(p, a);
        var fresh = s.hits.some(function (h) { return state.fresh[h.id]; });
        html += '<mark class="am-hit' + (fresh ? ' am-hit--new' : '') + '">' + slice(a, b) + '</mark>';
        if (s.end - off <= v.length) html += '<span class="am-end" data-am-s="' + i + '"></span>';
        p = b;
      });
      html += slice(p, v.length);
      if (caretAt === v.length) html += CARET;
      var ghost = k === state.active ? ghostText(page) : '';
      if (ghost) html += '<span class="am-ghost">' + esc(ghost) + '<span class="am-ghost__key">Tab</span></span>';
      page.mirror.innerHTML = html + '​';
      var mark = page.mirror.querySelector('.am-cm');
      if (mark) {
        var row = Math.round(mark.offsetTop / LINE);
        var pos = row + ':' + mark.offsetLeft;
        page.caret.style.transform = 'translate(' + (mark.offsetLeft - 1) + 'px,' + (row * LINE + 8) + 'px)';
        if (pos !== page.caretPos) { page.caret.classList.remove('am-caret--on'); void page.caret.offsetWidth; }
        page.caret.classList.add('am-caret--on');
        page.caretPos = pos;
      } else {
        page.caret.classList.remove('am-caret--on');
        page.caretPos = null;
      }
      placeBadges(page);
      off += v.length + 1;
    });
  }
  function ghostText(page) {
    if (!state.ghostOn || state.firstDone || !page) return '';
    var ta = page.ta, text = ta.value;
    if (ta.selectionStart !== text.length || ta.selectionEnd !== text.length) return '';
    var tail = text.slice(Math.max(text.lastIndexOf('.'), text.lastIndexOf('\n'), text.lastIndexOf('!'), text.lastIndexOf('?')) + 1);
    var typed = tail.replace(/^\s+/, '');
    var g = state.q.ghost;
    if (typed.toLowerCase() !== g.slice(0, typed.length).toLowerCase()) return '';
    var rest = g.slice(typed.length);
    if (!typed && tail.length === 0 && text.length && !/\s$/.test(text)) rest = ' ' + rest;
    return rest;
  }
  function showGhost(on) {
    state.ghostOn = on && !state.firstDone;
    var page = state.pages[state.active];
    if (on && page && document.activeElement !== page.ta) focusPage(state.active, Infinity);
    else render();
  }
  function acceptGhost() {
    var page = state.pages[state.active];
    var g = ghostText(page);
    if (!g) return false;
    var ta = page.ta;
    ta.value = ta.value + g + ' ';
    ta.selectionStart = ta.selectionEnd = ta.value.length;
    state.ghostOn = false;
    reflow(page.index);
    onInput();
    return true;
  }
  function placeBadges(page) {
    var layer = page.badges;
    var keep = {};
    var lastTop = -1, shift = 0;
    state.sentences.forEach(function (s, i) {
      if (!s.hits.length) return;
      var end = page.mirror.querySelector('[data-am-s="' + i + '"]');
      if (!end) return;
      var top = Math.round(end.offsetTop / LINE) * LINE;
      shift = top === lastTop ? shift + 1 : 0;
      lastTop = top;
      s.hits.forEach(function (p, k) {
        var key = p.id;
        keep[key] = true;
        var badge = layer.querySelector('[data-am-b="' + key + '"]');
        if (!badge) {
          badge = el('div', 'am-badge', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
          badge.setAttribute('data-am-b', key);
          badge.title = p.label;
          if (state.fresh[key]) {
            badge.classList.add('am-badge--new');
            badge.appendChild(el('span', 'am-plus', '+2'));
            var colours = ['#2BC46F', '#FFD43B', '#5CD6FF', '#2BC46F', '#FF8A6B', '#2BC46F', '#C6A8FF', '#FFD43B'];
            for (var d = 0; d < 8; d++) {
              var dot = el('i', 'am-burst');
              var a = d / 8 * Math.PI * 2;
              dot.style.setProperty('--dx', Math.round(Math.cos(a) * 46) + 'px');
              dot.style.setProperty('--dy', Math.round(Math.sin(a) * 46) + 'px');
              dot.style.background = colours[d];
              badge.appendChild(dot);
            }
          }
          layer.appendChild(badge);
        }
        badge.style.top = (top + 6) + 'px';
        badge.style.right = (-50 - (shift + k) * 40) + 'px';
      });
      shift += s.hits.length - 1;
    });
    Array.prototype.slice.call(layer.children).forEach(function (b) { if (!keep[b.getAttribute('data-am-b')]) b.remove(); });
  }
  // `settled` is true once the student has paused: then a sentence without a full stop can count too.
  function check(silent, settled) {
    var before = state.got;
    state.sentences = evaluate(state.q, fullText(), function (s) { return settled || s.start === state.openStart; });
    state.sentences.forEach(function (s) { if (s.open && s.hits.length) state.openStart = s.start; });
    var got = {}, newly = [];
    state.sentences.forEach(function (s) { s.hits.forEach(function (p) { got[p.id] = true; if (!before[p.id]) newly.push(p); }); });
    state.got = got;
    state.count = Object.keys(got).length;
    if (!silent) newly.forEach(function (p) { state.fresh[p.id] = true; });
    render();
    refreshScore();
    store('am-answer-' + state.id, JSON.stringify(state.pages.map(function (p) { return p.ta.value; })));
    if (silent) { state.firstDone = state.count > state.base; return; }
    if (newly.length) {
      state.firstDone = state.count > state.base;
      state.ghostOn = false;
      celebrate(newly);
      return;
    }
    var done = state.sentences.filter(function (s) { return s.complete; });
    var last = done[done.length - 1];
    if (!last || last.hits.length || last.text === state.lastJudged) return;
    state.lastJudged = last.text;
    if (last.near) {
      var c = clueFor(last.near);
      say('Nearly there!', ['You mentioned the right idea. Now <b>explain</b> it: say what it does, how it works or why it matters.', c[1], c[2]], 'near');
    }
  }
  function celebrate(points) {
    var sheet = (state.pages[state.active] || state.pages[0]).el;
    sheet.classList.remove('am-sheet--yay'); void sheet.offsetWidth; sheet.classList.add('am-sheet--yay');
    later(function () {
      points.forEach(function (p) { delete state.fresh[p.id]; });
      state.root.querySelectorAll('.am-badge--new').forEach(function (b) { b.classList.remove('am-badge--new'); });
      state.root.querySelectorAll('.am-hit--new').forEach(function (m) { m.classList.remove('am-hit--new'); });
    }, 1400);
    later(function () {
      var names = points.map(function (p) { return '<b>' + p.label + '</b>'; }).join(' and ');
      if (state.count >= state.q.total) {
        say('Full marks! ' + state.q.total * 2 + ' / ' + state.q.total * 2, ['That\'s ' + state.q.total + ' SRPs. Read it over once and check every sentence explains its point clearly.'], 'yay');
        return;
      }
      var p = nextPoint(), c = clueFor(p);
      var first = state.count - state.base === points.length;
      say((first ? 'Your first SRP! ' : 'Nice! ') + '+' + points.length * 2 + ' marks',
        [names + ' matches the marking scheme.<span class="am-next"><b>Next:</b> ' + c[0] + '</span>', c[1], c[2]], 'yay');
    }, 900);
  }
  function onInput() {
    if (state.ghostOn && !ghostText(state.pages[state.active])) state.ghostOn = false;
    render();
    clearTimeout(state.checkTimer);
    state.checkTimer = later(function () { check(false, false); }, 700);
  }

  // ---------- open / close ----------
  function build(id) {
    var q = QUESTIONS[id];
    var root = el('div', 'am-root');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Answer question ' + q.code);
    root.innerHTML =
      '<div class="am-backdrop"></div>' +
      '<button type="button" class="am-close" data-am-close aria-label="Close and go back to the paper"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg></button>' +
      '<div class="am-stage">' +
        '<div class="am-sheet-wrap"><div class="am-pages">' +
          '<button type="button" class="am-addpage" data-am-addpage>+ Add a page</button>' +
        '</div></div>' +
        '<aside class="am-coach" aria-live="polite">' +
          '<div class="am-score"><div class="am-score__top"><span class="am-score__num"><b data-am-marks>0</b> / ' + q.total * 2 + '</span><span class="am-score__unit">marks</span></div><div class="am-pips"></div><div class="am-score__meta"></div></div>' +
          '<div class="am-coach__body">' +
            '<div class="am-coach__head"><span class="am-coach__face" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#FFD43B"/><circle cx="17" cy="21" r="3.2" fill="#10243B"/><circle cx="31" cy="21" r="3.2" fill="#10243B"/><path d="M15 29q9 8 18 0" fill="none" stroke="#10243B" stroke-width="3.2" stroke-linecap="round"/></svg></span><span>Coach</span></div>' +
            '<div class="am-coach__msg"></div>' +
          '</div>' +
          '<div class="am-coach__buttons"><button type="button" class="am-btn am-btn--ok" data-am-ok>OK</button><button type="button" class="am-btn am-btn--more" data-am-more>Still don\'t get it</button></div>' +
          '<button type="button" class="am-btn am-btn--clue" data-am-clue>Stuck?</button>' +
          '<div class="am-coach__foot"><button type="button" class="am-link" data-am-guide>Watch the guide again</button><span>Checked against SEC-style SRP marking. A practice guide, not an official grade.</span></div>' +
        '</aside>' +
      '</div>';
    document.body.appendChild(root);
    return root;
  }

  function open(id, fromRect, whenCovered) {
    var q = QUESTIONS[id];
    if (!q) return false;
    if (state) close(true);
    var root = build(id);
    state = { id: id, q: q, root: root, timers: [], got: {}, fresh: {}, count: 0, sentences: [], pages: [], active: 0, base: 0,
      firstDone: false, ghostOn: false, linesDrawn: false,
      pagesEl: root.querySelector('.am-pages'), addBtn: root.querySelector('[data-am-addpage]'), coach: root.querySelector('.am-coach') };
    addPage(true);
    addPage(true);
    state.measure = el('div', 'am-mirror am-measure');
    state.measure.setAttribute('aria-hidden', 'true');
    state.pages[0].el.querySelector('.am-write').appendChild(state.measure);

    // Restore a saved answer, or start with one worked SRP already written in.
    var saved = store('am-answer-' + id), values = null;
    if (saved) { try { values = saved.charAt(0) === '[' ? JSON.parse(saved) : [saved]; } catch (err) { values = [saved]; } }
    if (!values || !values.join('').trim()) { values = [q.example + ' ']; state.base = 1; }
    else if (values.join(' ').indexOf(q.example) >= 0) state.base = 1;
    values.forEach(function (v, k) { (state.pages[k] || addPage(true)).ta.value = v; });
    reflow(0);
    check(true, true);
    state.coach.classList.add('am-coach--min');
    refreshScore();

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-am-close]')) { close(); return; }
      if (e.target.closest('[data-am-ok]')) { state.coach.classList.add('am-coach--min'); focusPage(state.active, Infinity); return; }
      if (e.target.closest('[data-am-more]')) {
        if (state.msg.level < state.msg.levels.length - 1) { state.msg.level += 1; renderMsg(false); }
        return;
      }
      if (e.target.closest('[data-am-clue]')) { offerClue(true); return; }
      if (e.target.closest('[data-am-addpage]')) {
        var page = addPage();
        state.root.classList.add('am-lines-in');
        focusPage(page.index, 0);
        requestAnimationFrame(function () { state.pagesEl.parentNode.scrollTo({ top: page.el.offsetTop - 12, behavior: reduced() ? 'auto' : 'smooth' }); });
        return;
      }
      if (e.target.closest('[data-am-guide]')) {
        close();
        if (window.ExamHyperFocus) window.ExamHyperFocus.start(id);
      }
    });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', state.onResize = function () { if (state) { reflow(0); render(); } });
    document.addEventListener('selectionchange', state.onSelect = function () { if (state) render(); });

    // 1. The page clears behind the question. 2. The question flies to the top of the sheet.
    // 3. The ruled lines draw in one by one. 4. The coach slides in and the cursor is ready.
    var fast = reduced();
    var fly = null;
    var finalImg = root.querySelector('.am-question');
    if (fromRect && fromRect.width && !fast) {
      fly = el('img', 'am-fly');
      fly.src = q.image;
      fly.alt = '';
      fly.style.left = fromRect.left + 'px';
      fly.style.top = fromRect.top + 'px';
      fly.style.width = fromRect.width + 'px';
      root.appendChild(fly);
      finalImg.style.visibility = 'hidden';
    }
    requestAnimationFrame(function () { root.classList.add('am-in'); });
    later(function () { if (whenCovered) whenCovered(); }, fast ? 0 : 380);
    later(function () {
      root.classList.add('am-sheet-in');
      if (!fly) return;
      var to = finalImg.getBoundingClientRect();
      var from = fly.getBoundingClientRect();
      fly.style.transition = 'none';
      fly.style.left = to.left + 'px';
      fly.style.top = to.top + 'px';
      fly.style.width = to.width + 'px';
      fly.style.transform = 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + (from.width / to.width) + ')';
      void fly.offsetWidth;
      fly.style.transition = '';
      fly.classList.add('am-fly--go');
      fly.style.transform = 'none';
    }, fast ? 0 : 440);
    later(function () {
      if (fly) { finalImg.style.visibility = ''; fly.remove(); }
      root.classList.add('am-lines-in');
    }, fast ? 0 : 1260);
    later(function () {
      state.linesDrawn = true;
      root.classList.add('am-coach-in');
      var last = 0;
      state.pages.forEach(function (p, k) { if (p.ta.value.trim()) last = k; });
      focusPage(last, Infinity);
    }, fast ? 0 : 1700);
    return true;
  }

  function close(instant) {
    if (!state) return;
    var s = state;
    state = null;
    s.timers.forEach(clearTimeout);
    window.removeEventListener('resize', s.onResize);
    document.removeEventListener('selectionchange', s.onSelect);
    if (instant || reduced()) { s.root.remove(); return; }
    s.root.classList.add('am-out');
    setTimeout(function () { s.root.remove(); }, 420);
  }

  window.ExamAnswerMode = {
    has: function (id) { return Boolean(QUESTIONS[id]); },
    open: open,
    close: close,
    // Exposed for testing: how text splits into sentences, and which points each one earns.
    sentences: function (text) { return splitSentences(text).map(function (s) { return [s.text, s.complete]; }); },
    score: function (id, text) {
      return evaluate(QUESTIONS[id], text, function () { return true; }).map(function (s) { return { text: s.text, points: s.hits.map(function (p) { return p.label; }), near: s.near ? s.near.label : null }; });
    }
  };

  var css = [
    '.am-root{position:fixed;inset:0;z-index:2147483200;font-family:Nunito,system-ui,sans-serif;color:#10243B}',
    '.am-backdrop{position:absolute;inset:0;background:#0C1628;opacity:0;transition:opacity .38s ease}',
    '.am-in .am-backdrop{opacity:1}',
    '.am-out{transition:opacity .38s ease;opacity:0}',
    '.am-stage{position:absolute;inset:0;display:flex;justify-content:center;align-items:stretch;gap:28px;padding:24px 28px;box-sizing:border-box}',
    '.am-sheet-wrap{flex:1 1 auto;max-width:980px;min-width:0;overflow-y:auto;overflow-x:hidden;border-radius:18px;scrollbar-width:thin}',
    '.am-pages{display:flex;flex-direction:column;gap:22px;padding-bottom:24px}',
    '.am-sheet{position:relative;flex:0 0 auto;background:#FFFEF8;border-radius:18px;padding:34px 118px 56px 56px;box-sizing:border-box;clip-path:inset(0 0 100% 0 round 18px);transition:clip-path .7s cubic-bezier(.22,.8,.2,1)}',
    '.am-page--new{animation:amIn .45s cubic-bezier(.22,.8,.2,1) both}',
    '.am-page__head{font:600 15px Fredoka,Nunito,sans-serif;letter-spacing:.04em;color:#7A8BA6;margin:0 0 6px}',
    '.am-page__num{position:absolute;left:0;right:0;bottom:18px;text-align:center;font:600 15px Fredoka,Nunito,sans-serif;color:#9AA8BD}',
    '.am-addpage{align-self:center;border:0;border-radius:14px;padding:12px 22px;background:#1B2E4B;color:#CFE0FF;font:700 17px Fredoka,Nunito,sans-serif;cursor:pointer;box-shadow:0 4px 0 #0A1220}',
    '.am-addpage:active{transform:translateY(3px);box-shadow:0 1px 0 #0A1220}',
    '.am-measure{visibility:hidden;height:auto !important;right:0;pointer-events:none}',
    '.am-caret{position:absolute;left:0;top:0;width:3px;height:28px;border-radius:2px;background:#2E6BD6;opacity:0;pointer-events:none}',
    '.am-caret--on{animation:amBlink 1.06s steps(1) infinite}',
    '@keyframes amBlink{0%{opacity:1}50%{opacity:0}}',
    '.am-cm{display:inline}',
    '.am-sheet-in .am-sheet{clip-path:inset(0 0 0 0 round 18px)}',
    '.am-question{display:block;width:100%;height:auto;margin:0 0 10px -10px;mix-blend-mode:multiply}',
    '.am-fly{position:fixed;z-index:3;height:auto;transform-origin:0 0;border-radius:6px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35);transition:transform .8s cubic-bezier(.22,.8,.2,1),box-shadow .8s ease}',
    '.am-fly--go{box-shadow:0 0 0 rgba(0,0,0,0)}',
    '.am-label{font-family:Fredoka,Nunito,sans-serif;font-weight:600;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#7A8BA6;margin:4px 0 2px;opacity:0;transition:opacity .4s ease}',
    '.am-lines-in .am-label{opacity:1}',
    '.am-write{position:relative}',
    '.am-lines{position:absolute;inset:0;pointer-events:none}',
    '.am-line{position:absolute;left:0;right:0;height:2px;background:#C7D3E6;border-radius:2px;transform:scaleX(0);transform-origin:left center}',
    '.am-lines-in .am-line{animation:amLine .5s cubic-bezier(.3,.7,.2,1) both;animation-delay:calc(var(--i) * 30ms)}',
    '.am-lines-in .am-line--now{animation-delay:0s}',
    '@keyframes amLine{to{transform:scaleX(1)}}',
    '.am-mirror,.am-input{display:block;width:100%;box-sizing:border-box;margin:0;padding:0 4px;border:0;font:600 22px/46px Nunito,system-ui,sans-serif;letter-spacing:.01em;word-spacing:.04em;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;tab-size:4}',
    '.am-root .am-input,.am-root .am-mirror,.am-root .am-mirror *{font-family:Nunito,system-ui,sans-serif !important;font-weight:600 !important;font-size:22px !important;line-height:46px !important;letter-spacing:.01em !important}',
    '.am-root .am-ghost__key{font-family:Fredoka,Nunito,sans-serif !important;font-weight:700 !important;font-size:13px !important;line-height:24px !important}',
    '.am-root .am-coach__p,.am-root .am-coach__p *,.am-root .am-coach__foot span{font-family:Nunito,system-ui,sans-serif !important;font-weight:700 !important}',
    '.am-root .am-coach__title,.am-root .am-coach__head span,.am-root .am-btn,.am-root .am-link,.am-root .am-tag,.am-root .am-score span,.am-root .am-score b,.am-root .am-coach__p b,.am-root .am-plus,.am-root .am-label{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-coach__p b{font-weight:600 !important}',
    '.am-mirror{position:absolute;left:0;top:0;color:#13294A;pointer-events:none}',
    '.am-input{position:relative;background:transparent;color:transparent;caret-color:transparent;resize:none;outline:none;overflow:hidden}',
    '.am-root textarea.am-input,.am-root textarea.am-input:focus,.am-root textarea.am-input:focus-visible{outline:none !important;border:0 !important;box-shadow:none !important;background:transparent !important}',
    '.am-input::selection{background:rgba(46,107,214,.25);color:transparent}',
    '.am-hit{background:transparent;color:#118A4C;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}',
    '.am-hit--new{animation:amHit 1.2s ease both}',
    '@keyframes amHit{0%{background:rgba(43,196,111,0);color:#13294A}20%{background:rgba(43,196,111,.35);color:#0B6B3A}100%{background:rgba(43,196,111,0);color:#118A4C}}',
    '.am-ghost{color:#A3AFC2}',
    '.am-ghost__key{display:inline-block;margin-left:10px;padding:0 8px;line-height:24px;font:700 13px/24px Fredoka,Nunito,sans-serif;color:#7A8BA6;border:2px solid #C7D3E6;border-radius:7px;vertical-align:3px}',
    '.am-badges{position:absolute;inset:0;pointer-events:none}',
    '.am-badge{position:absolute;width:34px;height:34px;border-radius:50%;background:#2BC46F;box-shadow:0 3px 0 #1E9A55;display:grid;place-items:center}',
    '.am-badge svg{width:22px;height:22px}',
    '.am-badge--new{animation:amPop .6s cubic-bezier(.3,1.6,.5,1) both}',
    '@keyframes amPop{0%{transform:scale(0) rotate(-30deg)}100%{transform:scale(1) rotate(0)}}',
    '.am-plus{position:absolute;left:50%;top:-6px;font:700 20px Fredoka,Nunito,sans-serif;color:#1E9A55;transform:translateX(-50%);animation:amPlus 1.3s ease-out both;white-space:nowrap}',
    '@keyframes amPlus{0%{opacity:0;transform:translate(-50%,6px)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-34px)}}',
    '.am-burst{position:absolute;left:50%;top:50%;width:9px;height:9px;margin:-4.5px;border-radius:50%;animation:amBurst .75s cubic-bezier(.2,.7,.3,1) both}',
    '@keyframes amBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.3);opacity:0}}',
    '.am-sheet--yay{animation:amYay .5s ease}',
    '@keyframes amYay{0%,100%{box-shadow:0 0 0 0 rgba(43,196,111,0)}35%{box-shadow:0 0 0 6px rgba(43,196,111,.55)}}',
    '.am-close{position:absolute;z-index:4;top:22px;right:24px;width:48px;height:48px;border-radius:16px;border:0;background:#FFFFFF;color:#10243B;box-shadow:0 4px 0 #B8C4D6;cursor:pointer;display:grid;place-items:center;opacity:0;transition:opacity .3s ease .9s}',
    '.am-close svg{width:22px;height:22px}',
    '.am-in .am-close{opacity:1}',
    '.am-close:active{transform:translateY(3px);box-shadow:0 1px 0 #B8C4D6}',
    '.am-coach{flex:0 0 380px;display:flex;flex-direction:column;gap:14px;margin-right:56px;align-self:flex-start;max-height:100%;box-sizing:border-box;background:#14243B;border-radius:20px;padding:20px;color:#F4F7FF;transform:translateX(40px);opacity:0;transition:transform .5s cubic-bezier(.22,.8,.2,1),opacity .4s ease}',
    '.am-coach-in .am-coach{transform:none;opacity:1}',
    '.am-score{background:#0C1628;border-radius:14px;padding:12px 14px}',
    '.am-score__top{display:flex;align-items:baseline;gap:8px;font-family:Fredoka,Nunito,sans-serif}',
    '.am-score__num{font-size:30px;font-weight:600;color:#fff}',
    '.am-score__num b{color:#5BE39A;font-weight:700}',
    '.am-score__unit{font-size:16px;color:#9FB0CC;font-weight:600}',
    '.am-pips{display:grid;grid-template-columns:repeat(15,1fr);gap:4px;margin:8px 0 10px}',
    '.am-pips i{height:10px;border-radius:5px;background:#26395A;transition:background .3s ease}',
    '.am-pips i.on{background:#2BC46F}',
    '.am-score__meta{display:flex;gap:8px;flex-wrap:wrap}',
    '.am-tag{font:700 14px Fredoka,Nunito,sans-serif;padding:4px 10px;border-radius:999px;background:#26395A;color:#C9D6EE}',
    '.am-tag--p{background:#163E5C;color:#8FE3FF}',
    '.am-tag--r{background:#4A2A22;color:#FFB59E}',
    '.am-tag--ok{background:#174A31;color:#7DF0B0}',
    '.am-coach__body{overflow-y:auto;min-height:0;flex:0 1 auto;scrollbar-width:thin}',
    '.am-coach__head{display:flex;align-items:center;gap:10px;font:700 18px Fredoka,Nunito,sans-serif;color:#FFE14D;margin-bottom:8px}',
    '.am-coach__face svg{width:38px;height:38px;display:block}',
    '.am-coach__title{margin:0 0 8px;font:700 24px/1.15 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-coach__msg--yay .am-coach__title{color:#5BE39A}',
    '.am-coach__msg--near .am-coach__title{color:#FFD43B}',
    '.am-coach__msg--clue .am-coach__title{color:#8FE3FF}',
    '.am-coach__p{margin:0 0 12px;font:700 18px/1.45 Nunito,sans-serif;color:#E8EEFA}',
    '.am-coach__p b{font-family:Fredoka,Nunito,sans-serif;font-weight:600;color:#FFE14D}',
    '.am-coach__p i{font-style:normal;color:#BFF5D6}',
    '.am-coach__p--deeper{border-left:4px solid #5CD6FF;padding-left:12px}',
    '.am-coach__p--new{animation:amIn .45s cubic-bezier(.22,.8,.2,1) both}',
    '@keyframes amIn{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:none}}',
    '.am-pop .am-coach__title{animation:amIn .4s cubic-bezier(.22,.8,.2,1) both}',
    '.am-next{display:block;margin-top:10px}',
    '.am-green{color:#5BE39A !important}',
    '.am-coach__buttons{display:flex;gap:10px}',
    '.am-btn{font:700 17px Fredoka,Nunito,sans-serif;border:0;border-radius:14px;padding:12px 16px;cursor:pointer;letter-spacing:.02em}',
    '.am-btn:active{transform:translateY(3px)}',
    '.am-btn--ok{flex:0 0 96px;background:#2BC46F;color:#fff;box-shadow:0 4px 0 #1E9A55}',
    '.am-btn--ok:active{box-shadow:0 1px 0 #1E9A55}',
    '.am-btn--more{flex:1;background:#fff;color:#14243B;box-shadow:0 4px 0 #9FB0CC}',
    '.am-btn--more:active{box-shadow:0 1px 0 #9FB0CC}',
    '.am-btn--clue{background:#FFD43B;color:#14243B;box-shadow:0 4px 0 #C9A215}',
    '.am-btn--clue:active{box-shadow:0 1px 0 #C9A215}',
    '.am-coach:not(.am-coach--min) .am-btn--clue{display:none}',
    '.am-coach--min .am-coach__body,.am-coach--min .am-coach__buttons{display:none}',
    
    '.am-coach__foot{display:flex;flex-direction:column;gap:6px;font:600 12.5px/1.35 Nunito,sans-serif;color:#7F92B3}',
    '.am-link{align-self:flex-start;background:none;border:0;padding:0;color:#8FE3FF;font:700 14px Fredoka,Nunito,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}',
    '@media (max-width:1100px){.am-stage{flex-direction:column;padding:72px 12px 12px;gap:12px}.am-sheet-wrap{max-width:none}.am-sheet{padding:22px 60px 40px 22px}.am-coach{flex:0 0 auto;margin:0;align-self:stretch;max-height:42vh}.am-close{top:12px;right:12px}}',
    '@media (max-width:600px){.am-root .am-mirror,.am-root .am-input,.am-root .am-mirror *{font-size:19px !important}.am-sheet{padding-right:52px}.am-coach{padding:14px;gap:10px;max-height:48vh}.am-score{padding:8px 12px}.am-score__num{font-size:22px}.am-pips{margin:6px 0}.am-coach__head{display:none}.am-coach__title{font-size:20px}.am-coach__p{font-size:16px}.am-coach__foot span{display:none}.am-btn{padding:10px 12px}}',
    '@media (prefers-reduced-motion:reduce){.am-root *{animation-duration:.01ms !important;transition-duration:.01ms !important}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

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
      code: '3B', title: 'Sedimentary Rocks', image: 'assets/answer/q3b.png?v=1', imageHeight: 194, total: 13,
      normalise: [[/sedimentary\s+rocks?/g, ' srock '], [/sedimentary/g, ' srock ']],
      example: 'Sedimentary rocks begin when older rocks are weathered and eroded into small pieces called sediment.',
      ghost: 'This sediment is then transported by rivers, wind and ice to lakes and seas.',
      path: ['weather', 'transport', 'deposit', 'compact', 'cement', 'redDesert', 'sandEx', 'limestone', 'warmSea', 'caco3', 'fossils', 'limeEx', 'time', 'uplift', 'sandstone', 'shale', 'shaleEx', 'fossils', 'time', 'uplift', 'caco3', 'coal'],
      examples: ['sandEx', 'limeEx', 'shaleEx', 'coalEx'],
      points: [
        { id: 'define', label: 'What sedimentary rock is made from', all: [['srock'], ['sediment', 'fragment', 'particle', 'grain', 'remains', 'pieces', 'bits', 'creature', 'shell'], ['form', 'made', 'compos', 'consist', 'creat', 'build', 'from', 'come']] },
        { id: 'weather', label: 'Weathering and erosion make sediment', all: [['weather', 'erod', 'erosion', 'broken', 'break', 'worn', 'wear', 'freeze thaw', 'crumbl'], ['rock', 'sediment', 'particle', 'piece', 'bits', 'sand', 'grain', 'fragment', 'smaller', 'mountain', 'debris']],
          clue: ['Start at the very beginning. Where do the bits that make up a sedimentary rock come from?',
            'Older rocks get broken down by <b>weathering</b> (rain, frost, plant roots) and <b>erosion</b>. The broken bits are called <b>sediment</b>: sand, mud and pebbles.',
            'Picture a rock slowly crumbling into sand. Try: <i>"Sedimentary rocks begin when older rocks are weathered and eroded into sediment."</i>'] },
        { id: 'transport', label: 'Sediment is transported', all: [['transport', 'carried', 'carry', 'carries', 'wash', 'blow', 'blew', 'moved', 'travel', 'flow', 'swept'], ['river', 'wind', 'ice', 'glacier', 'water', 'sea', 'current', 'wave', 'stream', 'desert', 'downstream', 'ocean']],
          clue: ['Once the rock is broken into bits, how do those bits travel?',
            '<b>Rivers</b>, <b>wind</b>, <b>ice</b> and sea currents carry the sediment away. Say what carries it and where it ends up.',
            'Picture a river carrying sand down to the sea. Try: <i>"The sediment is transported by rivers and wind to lakes and seas."</i>'] },
        { id: 'deposit', label: 'Deposited in layers', all: [['deposit', 'laid down', 'settl', 'accumulat', 'build up', 'builds up', 'built up', 'building up', 'pile', 'piling', 'drop', 'layer upon layer', 'collect'], ['layer', 'strata', 'stratum', 'bed', 'seabed', 'sea', 'ocean', 'lake', 'floor', 'bottom', 'delta', 'estuary', 'load']],
          clue: ['When the river slows down, what happens to the sediment it was carrying?',
            'It drops: it is <b>deposited</b>. Over time the bits pile up in flat <b>layers</b>, called <b>strata</b>, on the sea or lake floor.',
            'Like sand settling at the bottom of a glass of water. Try: <i>"The sediment is deposited in layers called strata on the sea floor."</i>'] },
        { id: 'compact', label: 'Compaction', all: [['compact', 'compress', 'squeez', 'squash', 'weight', 'pressure', 'press', 'crush'], ['layer', 'sediment', 'grain', 'particle', 'water', 'above', 'overlying', 'together', 'below', 'beneath', 'upper', 'lower', 'down', 'underneath', 'top', '=them', 'remains', 'ocean', 'sea', 'rock', 'sand', 'mud']],
          clue: ['The layers keep piling up for millions of years. What does all that weight do to the layers underneath?',
            'The weight <b>squeezes</b> the lower layers. Water is pushed out and the grains press tightly together. This is <b>compaction</b>.',
            'Like stacking heavy books on a sponge. Try: <i>"The weight of the layers above compacts the sediment and squeezes out the water."</i>'] },
        { id: 'cement', label: 'Cementation', all: [['cement', 'glue', 'bind', 'bound', 'stuck', 'stick', 'join', 'fuse'], ['calcite', 'silica', 'iron', 'mineral', 'grain', 'particle', 'together', 'sediment']],
          clue: ['The grains are squeezed together, but what glues them into solid rock?',
            'Minerals like <b>calcite</b> or <b>silica</b> come out of the water and stick the grains together. This is <b>cementation</b>.',
            'Like glue on sand. Try: <i>"Minerals such as calcite cement the grains together, turning the sediment into solid rock."</i>'] },
        { id: 'lithify', label: 'Lithification', all: [['lithif', 'turn into rock', 'turns into rock', 'turned into rock', 'harden', 'solid rock', 'becomes rock', 'become rock']] },
        { id: 'sandstone', label: 'Sandstone forms from sand', all: [['sandstone'], ['=sand', 'grain', 'quartz', 'desert', 'river', 'compact', 'cement', 'deposit', 'form']],
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
        { id: 'limestone', label: 'Limestone from shells and skeletons', all: [['limestone'], ['shell', 'skeleton', 'coral', 'organism', 'creature', 'marine', 'animal', 'remains', 'calcium', 'fish', 'organic', 'dead']],
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
        { id: 'shale', label: 'Shale forms from mud', all: [['shale', 'mudstone', 'siltstone'], ['mud', 'clay', 'silt', 'fine', 'compact', 'compress', 'thin layer']],
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
        { id: 'coal', label: 'Coal forms from plants', all: [['coal'], ['plant', 'vegetation', 'swamp', 'peat', 'forest', 'tree', 'marsh', 'bog']],
          clue: ['Which sedimentary rock is made from ancient plants?',
            '<b>Coal</b>. Swamp plants died, were buried and compacted, and slowly turned into coal.',
            'Try: <i>"Coal formed from swamp plants that were buried and compacted, as at Castlecomer in Co. Kilkenny."</i>'] },
        { id: 'coalEx', label: 'Irish coal example', all: [['coal'], ['arigna', 'leitrim', 'roscommon', 'castlecomer', 'kilkenny', 'tipperary']] },
        { id: 'types', label: 'Types of sedimentary rock', all: [['mechanical', 'clastic', 'organic', 'biogenic', 'inorganic'], ['srock', 'rock', 'formed', 'type', 'group']] }
      ]
    },
    'question-3c': {
      code: '3C', title: 'Seismic Activity', image: 'assets/answer/q3c.png?v=1', imageHeight: 192, total: 13,
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
        { id: 'foreshock', side: 'p', label: 'Foreshocks as a warning', all: [['foreshock', 'tremor', 'shake', 'shaking', 'quake', 'vibration'], ['warn', 'before', 'bigger', 'larger', 'major', 'main', 'follow', 'sign', 'coming', 'precede']] },
        { id: 'gaps', side: 'p', label: 'Seismic gaps and past patterns', all: [['gap', 'pattern', 'history', 'historic', 'previous', 'past', 'records', 'frequency', 'not moved', 'quiet', 'locked', 'stuck', 'ages', 'long time'], ['earthquake', 'fault', 'area', 'quake', 'happen', 'occur', 'region', 'place', 'risk', 'next', 'soon', 'due', 'likely', 'boundar']],
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
        { id: 'animals', side: 'p', label: 'Unusual animal behaviour', all: [['animal', 'dog', 'cat', 'toad', 'snake', 'bird', 'fish', 'pets', 'horse', 'frog', 'cow'], ['behav', 'strange', 'unusual', 'restless', 'flee', 'fled', 'leav', 'odd', 'weird', 'nervous', 'act', 'panic', 'escap', 'disappear', 'seen']],
          clue: ['Have people noticed animals acting strangely?',
            'Some reports say animals become <b>restless</b> before earthquakes, maybe sensing tiny vibrations. It is not reliable though.',
            'Try: <i>"Strange animal behaviour, such as dogs becoming restless, has been reported before earthquakes."</i>'] },
        { id: 'stress', side: 'p', label: 'Monitoring stress on faults', all: [['stress', 'strain', 'creep', 'pressure'], ['fault', 'rock', 'build', 'measur', 'plate', 'monitor']] },
        { id: 'plates', side: 'p', label: 'Plate boundaries show where', all: [['plate boundar', 'boundary', 'boundaries', 'fault line', 'fault zone', 'ring of fire', 'san andreas', 'subduction'], ['likely', 'predict', 'risk', 'map', 'where', 'expect', 'monitor', 'watch']] },
        { id: 'magnetic', side: 'p', label: 'Magnetic and electrical changes', all: [['magnetic', 'electrical', 'electromagnetic', 'conductiv']] },
        { id: 'difficult', side: 'p', label: 'Prediction is not exact', all: [['difficult', 'hard', 'impossible', 'can not', 'not possible', 'unreliable', 'not accurate', 'inaccurate', 'not exact', 'no way', 'not know'], ['predict', 'forecast', 'when', 'exact', 'time', 'tell', 'say', 'know', 'date']],
          clue: ['Can scientists say exactly when an earthquake will strike?',
            'No. They can say <b>where</b> one is likely, but not the <b>exact time</b>. That is why reducing the effects matters too.',
            'Try: <i>"Scientists cannot predict the exact time of an earthquake, only the areas most at risk."</i>'] },
        { id: 'build', side: 'r', label: 'Earthquake-proof building design', all: [['building', 'structure', 'skyscraper', 'house', 'bridge'], ['proof', 'resist', 'design', 'flexib', 'flex', 'bend', 'sway', 'absorb', 'strong', 'regulation', 'code', 'collaps', 'standard', 'law', 'safe']],
          clue: ['Now the other half. How can we stop buildings from falling down?',
            'Buildings can be designed to <b>bend and sway</b> instead of cracking, and strict <b>building codes</b> make sure they are built that way.',
            'Try: <i>"Buildings are designed to sway with the shaking so that they do not collapse."</i>'] },
        { id: 'base', side: 'r', label: 'Base isolation and shock absorbers', all: [['base isolat', 'shock absorb', 'rubber', 'spring', 'roller', 'pads', 'isolator', 'foundation'], ['absorb', 'reduce', 'shak', 'movement', 'vibration', 'building', 'ground', 'stop']],
          clue: ['What could you put under a building so the ground shakes but the building shakes less?',
            '<b>Rubber pads</b> or <b>springs</b> (base isolators) sit between the building and its foundations and <b>absorb</b> the shaking.',
            'Try: <i>"Rubber shock absorbers in the foundations absorb the movement of the ground."</i>'] },
        { id: 'bracing', side: 'r', label: 'Steel frames and cross-bracing', all: [['steel', 'cross brac', 'cross-brac', 'bracing', 'reinforc', 'frame'], ['building', 'strong', 'support', 'collaps', 'shak', 'stop', 'hold', 'wall', 'concrete']] },
        { id: 'damper', side: 'r', label: 'Counterweights steady tall buildings', all: [['counterweight', 'counter weight', 'damper', 'pendulum', 'weight'], ['sway', 'swing', 'building', 'skyscraper', 'tower', 'reduce', 'shak', 'movement', 'balance', 'steady', 'top', 'roof']],
          clue: ['What can stop a tall skyscraper swaying too much?',
            'A huge <b>counterweight</b> near the top moves the opposite way to the shaking and steadies the building.',
            'Try: <i>"Tall buildings use counterweights on the roof to reduce swaying."</i>'] },
        { id: 'shape', side: 'r', label: 'Pyramid shapes and wide bases', all: [['pyramid', 'transamerica', 'wide base', 'tapered']] },
        { id: 'drills', side: 'r', label: 'Earthquake drills and education', all: [['drill', 'educat', 'practi', 'train', 'aware', 'teach', 'school', 'taught', 'learn', 'hide', 'hiding'], ['earthquake', 'people', 'children', 'kids', 'student', 'drop', 'cover', 'shelter', 'hold', 'what to do', 'safe', 'desk', 'table', 'under']],
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
        { id: 'tsunami', side: 'r', label: 'Tsunami defences', all: [['tsunami'], ['warning', 'wall', 'barrier', 'evacuat', 'buoy', 'sea wall', 'high ground', 'alert', 'protect', 'defen']],
          clue: ['Earthquakes under the sea cause another danger. What is it and how can coasts be protected?',
            'A <b>tsunami</b>. Warning buoys, sea walls and evacuation routes to high ground protect coastal towns.',
            'Try: <i>"Japan has tsunami warning systems and sea walls to protect coastal towns."</i>'] },
        { id: 'fire', side: 'r', label: 'Fire prevention', all: [['fire'], ['break', 'hydrant', 'prevent', 'spread', 'gas', 'service', 'brigade', 'stop']] },
        { id: 'aid', side: 'r', label: 'Aid and recovery', all: [['insurance', 'aid', 'recovery', 'rebuild', 'donation', 'donate']] }
      ]
    }
  };

  // ---------- answer plans ----------
  // A step-by-step plan for each question, shown in the side panel. Each step is one SRP (or, for
  // "_named", the marks for naming two rocks) and ticks green once the student has earned it.
  // `why` explains what is actually happening, so students understand the point, not just copy it.
  var PLANS = {
    'question-3b': {
      overview: [
        ['Name two sedimentary rocks', '4 marks'],
        ['Sandstone: tell its full story', 'up to 7 SRPs'],
        ['Limestone: say what is different about it', 'up to 5 SRPs'],
        ['Finish strong: two extra facts', 'up to 2 SRPs']
      ],
      rules: ['You can earn up to 13 SRPs (26 marks) plus 4 for the names, so 30 in total.', 'Every sentence should say <b>what happens</b> and <b>why or how</b>.', 'Irish examples count for 2 SRPs at most. Describing a rock without saying how it formed earns almost nothing.'],
      sections: [
        { title: 'Name your two rocks', items: [
          { id: '_named', title: 'Name sandstone and limestone', ask: 'Which two rocks will you write about?', why: 'The marking scheme gives 2 marks for each sedimentary rock you name. Sandstone and limestone are the easiest pair: one is made from broken rock, the other from sea life.', starter: 'Two examples of sedimentary rocks are sandstone and limestone. ' }
        ] },
        { title: 'Rock 1: Sandstone, the full story', items: [
          { id: 'weather', title: 'Broken down', ask: 'Where do the sand grains come from?', why: 'Sandstone is made of bits of older rock. Weathering (rain, frost, plant roots) and erosion break rocks like granite into grains of sand.', starter: 'Sandstone begins when older rocks are weathered and eroded into ' },
          { id: 'transport', title: 'Carried away', ask: 'How do the grains move?', why: 'Rivers, wind and ice carry the sand away from the rock it broke off.', starter: 'The sand is transported by ' },
          { id: 'deposit', title: 'Laid down in layers', ask: 'Where do the grains settle?', why: 'When a river slows down it drops the sand. Over time it builds up in flat layers called strata on the sea or lake floor.', starter: 'When the river slows down, the sand is deposited in ' },
          { id: 'compact', title: 'Squeezed', ask: 'What does the weight of new layers do?', why: 'New layers keep piling on top. Their weight presses the grains together and squeezes the water out. This is compaction.', starter: 'The weight of the layers above ' },
          { id: 'cement', title: 'Glued', ask: 'What sticks the grains together?', why: 'Minerals left by the water, like silica or iron oxide, act like glue between the grains. This is cementation, and the sand becomes solid rock.', starter: 'Minerals such as silica cement ' },
          { id: 'redDesert', title: 'Why it is red', ask: 'Why is Irish sandstone often red?', why: 'Old Red Sandstone formed in hot desert conditions about 400 million years ago, when iron in the sand rusted and stained it red.', starter: 'Old Red Sandstone is red because ' },
          { id: 'sandEx', title: 'Irish example', ask: 'Where can you see it in Ireland?', why: 'The mountains of Munster are made of Old Red Sandstone, like the MacGillycuddy\'s Reeks in Co. Kerry.', starter: 'Old Red Sandstone can be seen in ' }
        ] },
        { title: 'Rock 2: Limestone, what is different', note: 'Don\'t repeat the squeezing and gluing. Say what is special about limestone.', items: [
          { id: 'limestone', title: 'Made from sea life', ask: 'What is limestone made from?', why: 'Limestone forms from the shells and skeletons of sea creatures and coral that piled up on the sea floor when they died.', starter: 'Limestone is formed from ' },
          { id: 'warmSea', title: 'Warm, shallow seas', ask: 'What kind of sea did those creatures live in?', why: 'About 350 million years ago Ireland was near the equator and covered by warm, clear, shallow seas full of life.', starter: 'This happened in ' },
          { id: 'caco3', title: 'Calcium carbonate', ask: 'What chemical is it mostly made of?', why: 'The shells are made of calcium carbonate, so limestone is mostly calcium carbonate too.', starter: 'Limestone is made mainly of ' },
          { id: 'fossils', title: 'Fossils', ask: 'What can you still find inside it?', why: 'Shells trapped in the layers are often preserved as fossils that you can still see today.', starter: 'Limestone often contains ' },
          { id: 'limeEx', title: 'Irish example', ask: 'Where can you see it in Ireland?', why: 'The Burren in Co. Clare is Ireland\'s most famous limestone landscape. Most of the Midlands sit on limestone too.', starter: 'Limestone can be seen at ' }
        ] },
        { title: 'Finish strong', items: [
          { id: 'time', title: 'How long it takes', ask: 'How long does all of this take?', why: 'The whole process, from loose bits to solid rock, takes millions of years.', starter: 'This process takes ' },
          { id: 'uplift', title: 'How they reached land', ask: 'They formed under the sea, so how are they on land now?', why: 'Plate movements later folded and uplifted the rocks, so we can see them at the surface today.', starter: 'The rocks were later ' }
        ] }
      ]
    },
    'question-3c': {
      overview: [
        ['Mention a way to predict earthquakes', '2 marks'],
        ['Mention a way to reduce their effects', '2 marks'],
        ['Explain 6 or 7 prediction methods', 'about 7 SRPs'],
        ['Explain 6 or 7 ways to reduce the effects', 'about 7 SRPs']
      ],
      rules: ['You can earn up to 13 SRPs (26 marks) plus 4 for the two mentions, so 30 in total.', 'Every sentence should say <b>what the method is</b> and <b>how it helps</b>.', 'If you only explain one half, you are capped at 7 SRPs, so always do both.'],
      sections: [
        { title: 'Predicting earthquakes', items: [
          { id: 'seismo', title: 'Seismographs', ask: 'What do seismographs record?', why: 'A seismograph records vibrations in the ground. Scientists watch for small tremors (foreshocks) that can come before a big earthquake.', starter: 'Seismographs are used to ' },
          { id: 'gaps', title: 'Seismic gaps', ask: 'Which parts of a fault are most at risk?', why: 'A part of a fault that hasn\'t moved for a long time is storing up stress, so it is likely to slip next. This is called a seismic gap.', starter: 'Scientists study seismic gaps, which are ' },
          { id: 'tilt', title: 'Tiltmeters', ask: 'Does the ground change shape before a quake?', why: 'Stress can make the ground bulge or tilt very slightly. Tiltmeters measure these tiny changes.', starter: 'Tiltmeters measure ' },
          { id: 'laser', title: 'Lasers and GPS', ask: 'How can satellites help?', why: 'Lasers and GPS satellites measure tiny movements along a fault, showing where stress is building up.', starter: 'Lasers and GPS satellites are used to ' },
          { id: 'radon', title: 'Radon gas', ask: 'What can come out of the ground before a quake?', why: 'As rocks crack under stress, radon gas escapes into well water, so a rise in radon can be a warning sign.', starter: 'An increase in radon gas ' },
          { id: 'animals', title: 'Animal behaviour', ask: 'Have animals ever warned of a quake?', why: 'Animals have been reported acting strangely before earthquakes, perhaps because they sense small vibrations. It isn\'t reliable though.', starter: 'Unusual animal behaviour ' },
          { id: 'difficult', title: 'The limits', ask: 'Can scientists say exactly when a quake will hit?', why: 'No. They can say where an earthquake is likely, but not the exact time. That is why reducing the effects matters so much.', starter: 'However, scientists cannot predict ' }
        ] },
        { title: 'Reducing the effects', items: [
          { id: 'build', title: 'Building design', ask: 'How can buildings survive shaking?', why: 'Buildings are designed to sway with the shaking instead of cracking, and building codes make this the law.', starter: 'Buildings are designed to ' },
          { id: 'base', title: 'Shock absorbers', ask: 'What can go under a building?', why: 'Rubber pads (base isolators) sit between the building and the ground and absorb the shaking.', starter: 'Rubber shock absorbers in the foundations ' },
          { id: 'damper', title: 'Counterweights', ask: 'How do skyscrapers stop swaying?', why: 'A huge weight near the top moves against the sway and steadies the building.', starter: 'Tall buildings have counterweights ' },
          { id: 'drills', title: 'Earthquake drills', ask: 'How do people learn what to do?', why: 'In Japan people practise drills so they know to drop, cover and hold on.', starter: 'People practise earthquake drills so ' },
          { id: 'warning', title: 'Early warnings', ask: 'How can people get a few seconds\' warning?', why: 'Sensors detect the first waves and send alerts to phones and trains seconds before the strong shaking arrives.', starter: 'Early warning systems ' },
          { id: 'emergency', title: 'Emergency kits', ask: 'What helps after the shaking stops?', why: 'Families keep water, food and a torch ready, because services may be cut off for days.', starter: 'Families keep emergency kits ' },
          { id: 'shutoff', title: 'Gas shut-off', ask: 'How can fires be prevented?', why: 'Gas and electricity shut off automatically, so broken pipes don\'t start fires.', starter: 'Gas supplies are shut off automatically ' }
        ] }
      ]
    }
  };

  // ---------- "Confused?" help for each plan step ----------
  // chain: three boxes, "this -> this -> leads to this", with '?' marking the one to choose.
  // options[answer] is right; hint shows after a wrong answer; drag is a sentence whose
  // [bracketed] words become gaps to fill by dragging word boxes.
  var QUIZ = {
    _named: { chain: ['Rock made of layers', '?', '2 marks each'], options: ['Limestone and sandstone', 'Granite and basalt', 'Marble and slate'], answer: 0, hint: 'Sedimentary rocks are made from layers of sediment. Granite and basalt cool from magma (igneous). Marble and slate are changed by heat (metamorphic).', drag: 'Two examples of sedimentary rocks are [sandstone] and [limestone].' },
    weather: { chain: ['Rain, frost and plant roots', '?', 'Small grains called sediment'], options: ['Break old rock down', 'Melt the rock', 'Glue the rock together'], answer: 0, hint: 'Weathering means rock being broken down. Think of frost: water in a crack freezes, swells and splits the rock.', drag: 'Older rocks are [weathered] and [eroded] into small pieces called [sediment].' },
    transport: { chain: ['Loose sediment', '?', 'Ends up in the sea'], options: ['Rivers and wind carry it', 'It sinks into the ground', 'It turns into lava'], answer: 0, hint: 'Transport just means moving. Rivers, wind and ice are like conveyor belts for sediment.', drag: 'The sediment is [transported] by [rivers] and wind to the [sea].' },
    deposit: { chain: ['The river slows down', '?', 'Flat layers called strata'], options: ['It drops the sand', 'It speeds up', 'It digs deeper'], answer: 0, hint: 'A slow river has less energy, so it can\'t carry its load any more. It drops it, layer after layer.', drag: 'When the river slows down, the sand is [deposited] in [layers] called [strata].' },
    compact: { chain: ['More layers pile on top', '?', 'Water squeezed out'], options: ['Their weight presses down', 'They float away', 'They melt'], answer: 0, hint: 'Picture heavy books stacked on a sponge: the weight squeezes the water out. That is compaction.', drag: 'The [weight] of the layers above [compacts] the sediment and squeezes out the [water].' },
    cement: { chain: ['Minerals in the water', '?', 'Solid rock'], options: ['Glue the grains together', 'Wash the grains away', 'Turn the grains to gas'], answer: 0, hint: 'Minerals like silica act like glue between the grains, the way cement holds bricks together.', drag: 'Minerals such as [silica] [cement] the grains together into solid [rock].' },
    redDesert: { chain: ['Hot desert conditions', '?', 'Red sandstone'], options: ['Iron in the sand rusts', 'Plants grow on it', 'Snow covers it'], answer: 0, hint: 'Rust is red. Iron in the sand rusted (oxidised) in the hot, dry desert and stained the rock red.', drag: 'Old Red Sandstone is red because [iron] in the sand [oxidised] in hot [desert] conditions.' },
    sandEx: { chain: ['Old Red Sandstone', '?', 'An Irish example'], options: ['MacGillycuddy\'s Reeks, Kerry', 'The Burren, Clare', 'Giant\'s Causeway, Antrim'], answer: 0, hint: 'The Burren is limestone and the Giant\'s Causeway is basalt. The mountains of Munster are sandstone.', drag: 'Old Red Sandstone can be seen in the [MacGillycuddy\'s] Reeks in Co. [Kerry].' },
    limestone: { chain: ['Sea creatures die', '?', 'Limestone'], options: ['Their shells pile up on the sea floor', 'Birds eat them', 'They wash onto the beach'], answer: 0, hint: 'Limestone is made of life: the shells and skeletons of sea creatures and coral piled up on the sea floor.', drag: 'Limestone is formed from the [shells] and [skeletons] of sea creatures on the sea [floor].' },
    warmSea: { chain: ['Ireland near the equator', '?', 'Lots of sea life'], options: ['Warm, shallow seas covered it', 'It was covered in ice', 'It was a dry desert'], answer: 0, hint: 'About 350 million years ago Ireland sat near the equator under warm, clear, shallow seas where sea life thrived.', drag: 'This happened in [warm] [shallow] seas when Ireland was near the [equator].' },
    caco3: { chain: ['Shells', '?', 'What limestone is made of'], options: ['Calcium carbonate', 'Iron oxide', 'Salt'], answer: 0, hint: 'Shells are made of calcium carbonate, so the rock made from them is mostly calcium carbonate too.', drag: 'Limestone is made mainly of [calcium] [carbonate] from the shells.' },
    fossils: { chain: ['Shells buried in layers', '?', 'Fossils'], options: ['Their shape is kept in the rock', 'They dissolve away', 'They turn into sand'], answer: 0, hint: 'When shells are buried in layers, their shape is preserved in the rock. That is a fossil.', drag: 'Limestone often contains [fossils] of [sea] creatures.' },
    limeEx: { chain: ['Limestone', '?', 'An Irish example'], options: ['The Burren, Clare', 'MacGillycuddy\'s Reeks, Kerry', 'Mourne Mountains, Down'], answer: 0, hint: 'The Burren in Clare is a famous bare limestone landscape. The Reeks are sandstone and the Mournes are granite.', drag: 'Limestone can be seen at the [Burren] in Co. [Clare].' },
    time: { chain: ['Loose sediment', '?', 'Solid rock'], options: ['Millions of years', 'A few days', 'One winter'], answer: 0, hint: 'Rock forms incredibly slowly: millions of years of layering, squeezing and gluing.', drag: 'This process takes [millions] of [years].' },
    uplift: { chain: ['Rock formed under the sea', '?', 'Rock on land today'], options: ['Plate movements lift it up', 'The sea dries up in a day', 'People dig it up'], answer: 0, hint: 'Moving plates push rock layers up and fold them, lifting old sea floor onto land.', drag: 'The rocks were later [uplifted] by [plate] movements and are now on [land].' },
    seismo: { chain: ['The ground vibrates', '?', 'Warning of a bigger quake'], options: ['A seismograph records it', 'A thermometer measures it', 'A barometer measures it'], answer: 0, hint: 'Seismographs record shaking. Small tremors (foreshocks) can come before a big earthquake.', drag: 'Seismographs [record] small [tremors] called [foreshocks].' },
    gaps: { chain: ['A fault hasn\'t moved for years', '?', 'Likely to have the next quake'], options: ['Stress keeps building up', 'The fault disappears', 'The plates stop moving'], answer: 0, hint: 'The plates keep pushing. If part of a fault hasn\'t slipped, stress is building there like a stretched elastic band.', drag: 'A [seismic] [gap] is part of a fault that has not moved, so [stress] is building up.' },
    tilt: { chain: ['Stress builds underground', '?', 'A tiltmeter detects it'], options: ['The ground bulges and tilts', 'The ground turns red', 'Rivers dry up'], answer: 0, hint: 'Rock under stress bends very slightly, so the surface bulges. Tiltmeters measure the tiny tilt.', drag: '[Tiltmeters] measure [bulging] of the ground as [stress] builds up.' },
    laser: { chain: ['Plates creep along a fault', '?', 'We see where stress builds'], options: ['Lasers and GPS measure it', 'Telescopes watch the moon', 'Radios listen to the ground'], answer: 0, hint: 'Satellites and lasers can measure movements of just millimetres along a fault.', drag: '[GPS] satellites measure tiny [movements] along [fault] lines.' },
    radon: { chain: ['Rocks crack under stress', '?', 'A warning sign in wells'], options: ['Radon gas escapes', 'The water freezes', 'Gold appears'], answer: 0, hint: 'Cracking rock lets radon gas escape into well water, so more radon can mean a quake is coming.', drag: 'As rocks [crack], [radon] gas escapes into well [water].' },
    animals: { chain: ['Tiny vibrations before a quake', '?', 'A possible warning'], options: ['Animals act strangely', 'Plants grow faster', 'The sky turns green'], answer: 0, hint: 'Animals may sense small vibrations people can\'t, so they act restless. It isn\'t reliable though.', drag: '[Unusual] animal [behaviour] has been reported before [earthquakes].' },
    difficult: { chain: ['We know where quakes happen', '?', 'Reducing effects matters'], options: ['But not exactly when', 'And exactly when', 'So they never happen'], answer: 0, hint: 'Scientists know the risky places but can\'t name the day or hour, so people must always be ready.', drag: 'Scientists cannot predict the [exact] [time] of an earthquake.' },
    build: { chain: ['The ground shakes', '?', 'The building stays up'], options: ['It is designed to sway, not crack', 'It is painted brighter', 'It is made taller'], answer: 0, hint: 'A building that bends with the shaking survives; a stiff one cracks. Building codes make this the law.', drag: 'Buildings are [designed] to [sway] so they do not [collapse].' },
    base: { chain: ['The ground shakes', '?', 'The building shakes less'], options: ['Rubber pads absorb it', 'Windows are opened', 'The roof is removed'], answer: 0, hint: 'Base isolators work like shock absorbers in a car, soaking up the jolts.', drag: 'Rubber [shock] [absorbers] in the foundations absorb the [shaking].' },
    damper: { chain: ['A skyscraper sways', '?', 'The building steadies'], options: ['A counterweight moves against it', 'People run to the top', 'The lights go off'], answer: 0, hint: 'A heavy weight near the top swings the opposite way to the sway, cancelling it out.', drag: 'Tall buildings use [counterweights] on the roof to reduce [swaying].' },
    drills: { chain: ['People practise drills', '?', 'Fewer injuries'], options: ['They know to drop, cover, hold on', 'They forget what to do', 'They run outside while it shakes'], answer: 0, hint: 'Practice makes the safe response automatic: drop, cover and hold on.', drag: 'People practise earthquake [drills] so they know to [drop], cover and hold on.' },
    warning: { chain: ['The first waves are detected', '?', 'Trains stop, people take cover'], options: ['Alerts go out to phones', 'Nothing happens', 'The waves are stopped'], answer: 0, hint: 'The first, weaker waves travel ahead of the strong shaking, giving a few seconds of warning.', drag: 'Early [warning] systems send [alerts] to phones.' },
    emergency: { chain: ['Power and water are cut off', '?', 'Families get through the first days'], options: ['They use emergency kits', 'They wait for summer', 'They move house'], answer: 0, hint: 'Kits with water, food and a torch keep people going until help arrives.', drag: 'Families keep [emergency] kits with [food] and [water].' },
    shutoff: { chain: ['Pipes break in the shaking', '?', 'No fires start'], options: ['Gas shuts off by itself', 'Gas flows faster', 'People light candles'], answer: 0, hint: 'Leaking gas causes fires after earthquakes, so valves shut it off as soon as shaking starts.', drag: 'Gas supplies [shut] off [automatically] to prevent [fires].' }
  };

  // ---------- "Stuck?": re-teach one point simply, then one quick check ----------
  // pic: the guide picture to reuse (its bold key word). say: the short explanation.
  // q/a: the check question; a[0] is right. why: shown after a wrong pick.
  var TEACH = {
    define: { pic: 'Sediment', say: 'Sedimentary rocks are made from <b>sediment</b>: bits of older rock, sand, mud and the <b>remains</b> of plants and sea creatures. These pile up and slowly turn into new rock.',
      q: 'What are sedimentary rocks made from?', a: ['Sediment: bits of older rock and remains of living things', 'Magma that cooled slowly underground', 'Older rock changed by great heat and pressure', 'Lava that cooled quickly on the surface'], why: 'Cooled magma or lava makes igneous rock, and rock changed by heat and pressure is metamorphic.', hint: 'Think of the bits that pile up on a sea floor.', acc: [['sediment'], ['bits', 'rock'], ['pieces', 'rock'], ['fragment'], ['remains'], ['shell'], ['sand'], ['mud'], ['grain']], rej: ['magma', 'lava', 'heat'] },
    weather: { pic: 'Sediment', say: 'It starts with older rock being broken down by <b>weathering</b> (rain, frost, plant roots) and worn away by <b>erosion</b>. The small broken bits are called sediment.',
      q: 'How is sediment first made?', a: ['Older rock is broken down by weathering and erosion', 'Minerals glue loose grains together', 'Layers are squeezed by the weight above', 'Sea creatures build shells on the sea bed'], why: 'Gluing is cementation and squeezing is compaction. Those come later: sediment starts as broken-down rock.', hint: 'Rain, frost and plant roots attack the rock first.', acc: [['weather'], ['erosion'], ['erod'], ['broken'], ['break'], ['frost'], ['worn'], ['wear'], ['crumbl']], rej: ['glue', 'cement', 'squeez', 'compact', 'shell'] },
    transport: { pic: 'Sediment', say: '<b>Rivers</b>, <b>wind</b> and <b>ice</b> carry the sediment away. Most of it ends up in <b>lakes</b> and the <b>sea</b>.',
      q: 'What carries sediment to lakes and the sea?', a: ['Rivers, wind and ice', 'Plate movements', 'Cementing minerals', 'Groundwater seeping through rock'], why: 'Moving water, wind and ice carry (transport) sediment. Plates move solid rock, not loose sediment.', hint: 'Think of what moves across the land: water, air and ice.', acc: [['river'], ['wind'], ['ice'], ['glacier'], ['wave'], ['stream'], ['current']], rej: ['plate', 'mineral', 'groundwater'] },
    deposit: { pic: 'Sediment', say: 'When the water slows down it drops the sediment. It settles on the sea or lake bed in flat <b>layers</b> called <b>strata</b>.',
      q: 'Why does a river drop its sediment?', a: ['It slows down and loses energy', 'The water gets colder', 'The sediment dissolves', 'The river freezes over'], why: 'A slower river has less energy, so it can\'t carry its load and drops it in layers called strata.', hint: 'A fast river carries a lot. What happens when it gets slower?', acc: [['slow'], ['energy'], ['speed']], rej: ['cold', 'dissolv', 'freez'] },
    compact: { pic: 'Compaction', say: 'As more layers pile on top, their <b>weight</b> squeezes the layers below. Water is pushed out and the grains are packed tight. This is <b>compaction</b>.',
      q: 'What happens during compaction?', a: ['The weight of layers above squeezes out water and packs the grains', 'Minerals glue the grains together', 'Heat melts the grains together', 'Rivers wear the grains down'], why: 'Gluing is cementation, and melting would make igneous rock. Compaction is squeezing by weight.', hint: 'Picture a stack of heavy books pressing on a sponge.', acc: [['weight'], ['squeez'], ['press'], ['compress'], ['squash'], ['water', 'out']], rej: ['glue', 'mineral', 'melt', 'heat', 'wear', 'worn', 'cement'] },
    cement: { pic: 'Cementation', say: 'Water seeping through the layers carries dissolved <b>minerals</b> like <b>calcite</b> and <b>silica</b>. They glue the grains together, like cement in a wall. This is <b>cementation</b>.',
      q: 'What happens during cementation?', a: ['Minerals like calcite and silica glue the grains together', 'The weight above squeezes out the water', 'Heat bakes the grains into rock', 'Rivers round the grains off'], why: 'Squeezing is compaction. Cementation is the gluing step, done by minerals left by water.', hint: 'Something in the water acts like glue between the grains.', acc: [['glue'], ['stick'], ['bind'], ['cement'], ['calcite'], ['silica'], ['mineral']], rej: ['weight', 'squeez', 'heat', 'bake', 'round'] },
    lithify: { pic: 'Cementation', say: 'Compaction and cementation turn loose sediment into <b>solid rock</b>. This whole change is called <b>lithification</b>.',
      q: 'What is lithification?', a: ['Loose sediment turning into solid rock', 'Rock breaking down into sediment', 'Sediment being carried to the sea', 'Rock being pushed up into mountains'], why: 'Breaking down is weathering, carrying is transport and pushing up is uplift. "Litho" means stone.', hint: '"Litho" means stone.', acc: [['solid', 'rock'], ['hard'], ['into', 'rock'], ['become', 'rock'], ['turn', 'rock'], ['form', 'rock']], rej: ['melt', 'break', 'carr', 'push', 'uplift', 'magma'] },
    sandstone: { pic: 'Sandstone', say: '<b>Sandstone</b> forms from grains of <b>sand</b> that were compacted and cemented together. You can often feel the grains on its surface.',
      q: 'How does sandstone form?', a: ['Sand grains are compacted and cemented together', 'Shells pile up on a warm sea floor', 'Fine mud settles in calm water', 'Plants are buried in swamps'], why: 'Shells make limestone, mud makes shale and plants make coal.', hint: 'The name gives it away.', acc: [['sand', 'cement'], ['sand', 'compact'], ['sand', 'grain'], ['sand', 'together'], ['sand', 'press'], ['sand', 'squeez'], ['sand', 'glue']], rej: ['shell', 'mud', 'plant', 'lava'] },
    redDesert: { pic: 'Sandstone', say: 'Ireland\'s <b>Old Red Sandstone</b> formed about 400 million years ago in hot <b>desert</b> conditions. Iron in the sand <b>oxidised</b> (rusted), which turned it red.',
      q: 'Why is Old Red Sandstone red?', a: ['Iron in it oxidised (rusted) in hot desert conditions', 'It was baked by nearby lava', 'It is full of red coral', 'Rivers mixed red clay into it'], why: 'The red is rust: iron oxide formed in a hot, dry desert about 400 million years ago.', hint: 'Leave a bike out in the rain and it turns red-brown.', acc: [['iron'], ['rust'], ['oxid'], ['desert']], rej: ['lava', 'coral', 'clay', 'bake'] },
    sandEx: { pic: 'Sandstone', say: 'Old Red Sandstone makes many of Munster\'s mountains, like the <b>MacGillycuddy\'s Reeks</b> in Co. Kerry and the <b>Comeragh Mountains</b> in Co. Waterford.',
      q: 'Which is an Irish sandstone area?', a: ['MacGillycuddy\'s Reeks, Co. Kerry', 'The Burren, Co. Clare', 'Giant\'s Causeway, Co. Antrim', 'The Mourne Mountains, Co. Down'], why: 'The Burren is limestone, the Causeway is basalt and the Mournes are granite.', hint: 'Think of Ireland\'s highest mountains, in Co. Kerry.', acc: [['macgillycudd'], ['reeks'], ['kerry'], ['comeragh'], ['galtee'], ['waterford'], ['cork'], ['carrauntoohil'], ['dingle']], rej: ['burren', 'causeway', 'mourne', 'clare'] },
    limestone: { pic: 'Limestone', say: '<b>Limestone</b> forms from the <b>shells and skeletons</b> of sea creatures. When they die they sink and pile up on the sea floor, then get compacted and cemented.',
      q: 'How does limestone form?', a: ['Shells and skeletons of sea creatures pile up and are cemented', 'Sand grains are cemented in a desert', 'Fine mud settles in calm water', 'Lava cools on the sea floor'], why: 'Sand makes sandstone, mud makes shale and lava makes basalt. Limestone is built from sea life.', hint: 'Think of what sea creatures leave behind when they die.', acc: [['shell'], ['skeleton'], ['coral'], ['sea creature'], ['marine'], ['remains']], rej: ['sand', 'mud', 'lava', 'desert'] },
    warmSea: { pic: 'Limestone', say: 'Irish limestone formed about 350 million years ago in <b>warm, shallow, clear seas</b>, when Ireland lay near the <b>equator</b>.',
      q: 'In what conditions did Irish limestone form?', a: ['Warm, shallow, clear seas near the equator', 'Cold, deep oceans near the North Pole', 'Hot, dry deserts', 'Freshwater lakes in the mountains'], why: 'Shelled sea creatures thrive in warm, shallow, clear water, and Ireland lay near the equator then. Deserts made the Old Red Sandstone.', hint: 'Ireland was much nearer the equator back then.', acc: [['warm'], ['shallow'], ['tropical'], ['equator'], ['clear']], rej: ['cold', 'deep', 'desert', 'lake'] },
    limeEx: { pic: 'Limestone', say: 'The <b>Burren</b> in Co. Clare is Ireland\'s most famous limestone area. Limestone also lies under much of the <b>Central Lowlands</b>.',
      q: 'Which is an Irish limestone area?', a: ['The Burren, Co. Clare', 'MacGillycuddy\'s Reeks, Co. Kerry', 'Giant\'s Causeway, Co. Antrim', 'The Wicklow Mountains'], why: 'The Reeks are sandstone, the Causeway is basalt and the Wicklow Mountains are granite.', hint: 'A famous bare, rocky landscape in Co. Clare.', acc: [['burren'], ['clare'], ['central lowland'], ['midland'], ['aran']], rej: ['macgill', 'reeks', 'kerry', 'causeway', 'wicklow'] },
    caco3: { pic: 'Limestone', say: 'Limestone is mostly <b>calcium carbonate</b>, the same stuff as the shells it came from. That\'s why weak acid in rainwater can slowly dissolve it.',
      q: 'What is limestone mainly made of?', a: ['Calcium carbonate', 'Silica', 'Iron oxide', 'Sodium chloride'], why: 'Shells are calcium carbonate, so limestone is too. Silica is quartz, iron oxide is rust and sodium chloride is salt.', hint: 'The same chemical as seashells and chalk: calcium c…', acc: [['calcium'], ['carbonate'], ['caco3'], ['calcite']], rej: ['silica', 'iron', 'sodium', 'salt'] },
    shale: { pic: 'Shale', say: '<b>Shale</b> forms from very fine <b>mud</b> and <b>clay</b> that settled in calm water. It splits easily into thin layers.',
      q: 'How does shale form?', a: ['Fine mud and clay settle in calm water and are compacted', 'Sand is cemented together in a desert', 'Shells pile up on a warm sea floor', 'Salty water evaporates'], why: 'Only calm water lets the finest mud settle. Sand makes sandstone, shells make limestone and evaporation makes rock salt.', hint: 'The finest, softest sediment, settling in calm water.', acc: [['mud'], ['clay'], ['silt']], rej: ['sand', 'shell', 'evaporat', 'salt'] },
    shaleEx: { pic: 'Shale', say: 'You can see dark layers of shale and sandstone in the <b>Cliffs of Moher</b> in Co. Clare.',
      q: 'Where can you see shale in Ireland?', a: ['The Cliffs of Moher, Co. Clare', 'The Mourne Mountains, Co. Down', 'Giant\'s Causeway, Co. Antrim', 'The Wicklow Mountains'], why: 'The Mournes and Wicklow Mountains are granite and the Causeway is basalt: all igneous.', hint: 'Famous sea cliffs in Co. Clare.', acc: [['moher'], ['clare'], ['loop head'], ['kilkee']], rej: ['mourne', 'causeway', 'wicklow'] },
    fossils: { pic: 'Cementation', say: 'Plants and animals trapped in the layers can be preserved as <b>fossils</b>. Limestone often has fossils of shells and coral.',
      q: 'Why are fossils found in sedimentary rock but not in igneous rock?', a: ['Remains are buried gently in layers instead of being melted', 'Fossils only form in cold places', 'Igneous rock is too young', 'Sedimentary rock is harder'], why: 'Igneous rock comes from melted rock, which would destroy any remains.', hint: 'Think about what melting would do to a shell.', acc: [['buried'], ['bury'], ['trapped'], ['layer'], ['melt'], ['gentl'], ['heat', 'destroy']], rej: ['cold', 'young', 'harder'] },
    time: { pic: 'Compaction', say: 'All of this is very slow. The layers build up and harden over <b>millions of years</b>.',
      q: 'How long does sedimentary rock take to form?', a: ['Millions of years', 'Thousands of years', 'About 100 years', 'A few days'], why: 'Layers build up only millimetres a year, so it takes millions of years.', hint: 'Much longer than a human lifetime. Way, way longer.', acc: [['million']], rej: ['thousand', 'hundred', 'day'] },
    uplift: { pic: 'Sandstone', say: 'Rocks that formed under the sea are on land today because <b>plate movements</b> pushed them up (<b>uplift</b>) and folded them into mountains.',
      q: 'Why is rock that formed under the sea now on land?', a: ['Plate movements pushed it up (uplift)', 'Sea levels dropped by thousands of metres', 'Rivers carried it there', 'It floated up as it hardened'], why: 'Colliding plates push and fold rock upwards: that is uplift.', hint: 'Plates crashing together push rock upwards.', acc: [['plate'], ['uplift'], ['push', 'up'], ['tectonic'], ['fold'], ['raised'], ['lifted']], rej: ['sea level', 'river', 'float'] },
    bedding: { pic: 'Shale', say: 'The layers are separated by <b>bedding planes</b>, and cracks called <b>joints</b> run across them. That gives the rock its layered, blocky look.',
      q: 'What separates the layers in sedimentary rock?', a: ['Bedding planes', 'Fault lines', 'Joints', 'Contour lines'], why: 'Joints are the cracks that run across the layers. The lines between the layers are bedding planes.', hint: 'Each layer is called a bed.', acc: [['bedding']], rej: ['fault', 'joint', 'contour'] },
    chemical: { say: 'Some sedimentary rocks form <b>chemically</b>. When salty water <b>evaporates</b>, minerals are left behind as rock, like <b>rock salt</b> and <b>gypsum</b>.',
      q: 'How does a chemical sedimentary rock like rock salt form?', a: ['Salty water evaporates and leaves minerals behind', 'Shells pile up on the sea floor', 'Sand is compacted and cemented', 'Plants are buried in swamps'], why: 'Chemical sedimentary rocks come from minerals left behind when water evaporates.', hint: 'Think of what\'s left in a pan when salty water boils away.', acc: [['evaporat'], ['dries up'], ['dry up'], ['dried up']], rej: ['shell', 'sand', 'plant'] },
    coal: { say: '<b>Coal</b> forms from the remains of <b>plants</b> in ancient swamp forests. They were buried, squashed and slowly turned to rock.',
      q: 'What is coal made from?', a: ['Remains of plants from ancient swamp forests', 'Shells of sea creatures', 'Fine mud from lake beds', 'Oil that hardened underground'], why: 'Coal is squashed plant material, which is why it burns.', hint: 'It burns, so it came from something that grew.', acc: [['plant'], ['tree'], ['vegetation'], ['forest'], ['swamp'], ['peat']], rej: ['shell', 'mud', 'oil'] },
    coalEx: { model: '<b>Coal</b> was mined at <b>Arigna</b> in Co. Roscommon, where it formed from buried swamp plants.', say: 'Coal was mined at <b>Arigna</b> in Co. Roscommon and around <b>Castlecomer</b> in Co. Kilkenny.',
      q: 'Where was coal mined in Ireland?', a: ['Arigna, Co. Roscommon', 'The Burren, Co. Clare', 'The Cliffs of Moher, Co. Clare', 'Giant\'s Causeway, Co. Antrim'], why: 'Arigna was Ireland\'s last working coal mine. Castlecomer in Co. Kilkenny is another.', hint: 'A mine near Lough Allen, on the Roscommon–Leitrim border.', acc: [['arigna'], ['roscommon'], ['leitrim'], ['castlecomer'], ['kilkenny'], ['tipperary'], ['slieveardagh']], rej: ['burren', 'moher', 'causeway'] },
    types: { model: 'Sedimentary rocks are formed in three ways: <b>mechanical</b> (sandstone), <b>organic</b> (limestone) and <b>chemical</b> (rock salt).', say: 'There are three main types: <b>mechanical</b> (from bits of rock, like sandstone), <b>organic</b> (from living things, like limestone and coal) and <b>chemical</b> (from minerals left by water, like rock salt).',
      q: 'Which type of sedimentary rock is limestone?', a: ['Organic: made from living things', 'Chemical: left by evaporating water', 'Mechanical: made from bits of rock', 'Igneous: made from cooled lava'], why: 'Limestone comes from shells and skeletons, so it is organic.', hint: 'What was limestone made from: living things or not?', acc: [['organic'], ['biological'], ['biogenic']], rej: ['chemical', 'mechanical', 'igneous'] },

    seismo: { pic: 'Predict earthquakes', say: 'A <b>seismograph</b> records how much the ground shakes. Scientists watch for small tremors that might warn of a bigger quake.',
      q: 'What does a seismograph record?', a: ['How much the ground shakes', 'Gas levels in the ground', 'How much the ground tilts', 'Changes in the magnetic field'], why: 'Gas is measured in wells, tilt by a tiltmeter and magnetism by a magnetometer. A seismograph records shaking.', hint: '"Seismic" means to do with earthquakes. What does the ground do?', acc: [['shak'], ['vibrat'], ['tremor'], ['mov'], ['quake'], ['wave']], rej: ['gas', 'tilt', 'magnet', 'radon'] },
    foreshock: { pic: 'Predict earthquakes', say: '<b>Foreshocks</b> are small tremors that sometimes come before a big earthquake. A sudden rise in them can be a <b>warning sign</b>.',
      q: 'What are foreshocks?', a: ['Small tremors that can come before a big quake', 'Smaller shocks that follow the main quake', 'The first wave of a tsunami', 'Shaking felt far from the epicentre'], why: 'Fore means before. Shocks after the main quake are aftershocks.', hint: '"Fore" means before.', acc: [['before'], ['warning'], ['precede'], ['first'], ['earlier'], ['ahead']], rej: ['after', 'follow', 'tsunami', 'far from'] },
    gaps: { pic: 'Monitor', say: 'A <b>seismic gap</b> is part of a fault that hasn\'t moved for a long time. Stress is building there, so a quake is more likely. Scientists also study <b>past patterns</b> of quakes.',
      q: 'Why is a seismic gap a warning sign?', a: ['The fault hasn\'t moved in a long time, so stress is building', 'It has lots of small quakes every day', 'It is far from any plate boundary', 'The plates there have stopped moving'], why: 'A quiet stretch of an active fault is storing stress that will be released one day.', hint: 'A part of a fault that has gone quiet for a long time is storing something up.', acc: [['stress'], ['not moved'], ['hasnt moved'], ['long time'], ['build'], ['locked'], ['overdue'], ['due']], rej: ['every day', 'far from', 'stopped'] },
    tilt: { pic: 'Monitor', say: 'A <b>tiltmeter</b> measures tiny changes in the slope of the ground. The ground can <b>bulge</b> as stress builds up before a quake.',
      q: 'What does a tiltmeter detect?', a: ['The ground bulging or tilting as stress builds', 'Shaking of the ground', 'Radon gas in wells', 'Movement measured from satellites'], why: 'Shaking is the seismograph, radon is a gas test and satellites are GPS. A tiltmeter measures tilt.', hint: 'The name says what it measures.', acc: [['tilt'], ['bulg'], ['slope'], ['swell'], ['deform'], ['rise'], ['rising'], ['shape']], rej: ['shak', 'radon', 'gas', 'satellite'] },
    laser: { pic: 'Monitor', say: '<b>Lasers</b> and <b>GPS satellites</b> measure tiny movements along faults, sometimes only millimetres. Sudden changes can warn of a quake.',
      q: 'What do lasers and GPS satellites measure?', a: ['Tiny movements of the ground along faults', 'The temperature of rocks', 'How deep earthquakes start', 'Gas escaping from the ground'], why: 'They track how far the ground on each side of a fault has moved, sometimes just millimetres.', hint: 'They track tiny shifts along a fault line.', acc: [['movement'], ['move'], ['shift'], ['displace'], ['distance']], rej: ['temperature', 'deep', 'depth', 'gas'] },
    radon: { say: 'Before some quakes, <b>radon gas</b> levels in the ground and in <b>well water</b> rise as cracks open in the rock. Water levels in wells can change too.',
      q: 'Why can radon levels in wells warn of a quake?', a: ['Cracks opening in stressed rock release the gas', 'Earthquakes heat the water', 'Animals stir up the water', 'Rain washes radon into wells'], why: 'Stressed rock cracks, letting radon escape into the ground and the well water.', hint: 'Stressed rock starts to crack. What could leak out?', acc: [['crack'], ['stress'], ['fractur'], ['escape'], ['releas']], rej: ['heat', 'animal', 'rain'] },
    animals: { say: 'People have reported <b>animals acting strangely</b> (dogs barking, snakes leaving their burrows) before quakes. It isn\'t <b>reliable</b>, but it is often mentioned.',
      q: 'How useful is strange animal behaviour for predicting quakes?', a: ['It has been reported but isn\'t reliable', 'It is the most accurate method', 'Scientists use it to give exact times', 'It has never been reported'], why: 'There are many stories, but it can\'t be used to predict quakes reliably.', hint: 'Lots of stories, but would you bet your life on them?', acc: [['not', 'reliab'], ['nt reliab'], ['nt very'], ['unreliab'], ['not', 'trust'], ['cant', 'trust'], ['not', 'useful'], ['not', 'accurate'], ['not', 'proven'], ['no', 'proof'], ['not', 'very'], ['not', 'scien']], rej: ['most', 'exact', 'never'] },
    stress: { pic: 'Monitor', say: '<b>Stress</b> builds where plates lock together along a <b>fault</b>. Instruments like <b>strainmeters</b> and <b>creepmeters</b> measure how much the rock is bending or slipping.',
      q: 'Why do scientists monitor stress on faults?', a: ['Stress builds until the rocks suddenly slip', 'Stress makes the plates stop moving', 'Stress cools the magma below', 'Stress is what makes tsunamis'], why: 'An earthquake is the sudden release of stress that has built up along a fault.', hint: 'Stress builds and builds until the rock suddenly…', acc: [['slip'], ['release'], ['snap'], ['break'], ['ruptur'], ['sudden'], ['build']], rej: ['stop', 'cool', 'tsunami'] },
    plates: { pic: 'Predict earthquakes', say: 'Most earthquakes happen at <b>plate boundaries</b>, like the San Andreas Fault in California. So we can predict <b>where</b> quakes are likely, but not exactly when.',
      q: 'What can plate boundaries tell us about earthquakes?', a: ['Where they are likely, but not when', 'The exact time of the next one', 'How strong every one will be', 'Nothing: quakes happen everywhere equally'], why: 'Most quakes happen at plate boundaries, so we know where, but not exactly when.', hint: 'Most quakes happen at the edges of plates. Does that tell us where, or when?', acc: [['where'], ['location'], ['likely'], ['area'], ['place']], rej: ['exact time', 'strong', 'everywhere'] },
    magnetic: { pic: 'Monitor', say: 'Some scientists measure changes in the <b>magnetic</b> field and <b>electrical</b> currents in rocks, which can change as stress builds.',
      q: 'What can change in rocks as stress builds?', a: ['Their magnetism and electrical currents', 'Their colour', 'Their age', 'Their fossils'], why: 'Squeezed rock can change its magnetic and electrical signals.', hint: 'Think of invisible forces: magnets and electricity.', acc: [['magnet'], ['electric'], ['conductiv']], rej: ['colour', 'color', 'age', 'fossil'] },
    difficult: { pic: 'Predict earthquakes', say: 'Even with all this, scientists <b>cannot predict the exact time</b> of an earthquake. They can only say where one is likely and how probable it is.',
      q: 'What can scientists predict about earthquakes today?', a: ['Where one is likely and how probable it is', 'The exact day and time', 'The exact strength a week ahead', 'Nothing at all'], why: 'No method can give an exact time yet. Saying so is a valid point in the exam.', hint: 'Scientists can\'t give a date. What can they give?', acc: [['where'], ['likely'], ['probab'], ['chance'], ['area'], ['not exact'], ['roughly']], rej: ['the exact', 'exact day', 'exact strength', 'minute', 'nothing'] },
    build: { pic: 'Build safely', say: '<b>Earthquake-proof buildings</b> are designed to bend and sway, not snap. Strict <b>building codes</b> make sure new buildings follow these rules.',
      q: 'Why are earthquake-proof buildings designed to sway?', a: ['So they bend instead of breaking', 'So they can be built taller', 'So wind can pass through', 'So they cost less'], why: 'A stiff building cracks. One that can sway absorbs the shaking.', hint: 'Think of a tree in the wind: it bends instead of snapping.', acc: [['bend'], ['not', 'break'], ['not', 'snap'], ['absorb'], ['flex'], ['crack'], ['collaps']], rej: ['taller', 'wind', 'cost', 'cheap'] },
    base: { pic: 'Reduce the effects', say: 'In <b>base isolation</b>, the building sits on <b>rubber bearings</b> (shock absorbers). The ground shakes, but the building above stays steadier.',
      q: 'How does base isolation protect a building?', a: ['Rubber bearings absorb the shaking, so the building above moves less', 'Deep foundations stop the ground shaking', 'A heavy weight on the roof steadies it', 'Steel braces stop the walls bending'], why: 'A weight on the roof is a damper and braces are cross-bracing. Base isolation uses rubber bearings underneath.', hint: 'Think of a car\'s shock absorbers, but under a building.', acc: [['rubber'], ['bearing'], ['absorb'], ['pad'], ['isolator'], ['spring'], ['roller']], rej: ['roof', 'brace', 'deep foundation'] },
    bracing: { pic: 'Build safely', model: 'Buildings are strengthened with <b>steel frames</b> and diagonal <b>cross-bracing</b> so they hold together when they shake.', say: '<b>Steel frames</b> and diagonal <b>cross-bracing</b> make buildings stronger, so they hold together while they sway.',
      q: 'What does diagonal cross-bracing do?', a: ['Strengthens the frame so it holds together while swaying', 'Absorbs shaking at the foundations', 'Swings against the sway at the top', 'Makes the building lighter'], why: 'Absorbing at the base is base isolation, and swinging at the top is a damper.', hint: 'Diagonal steel bars make an X shape in the frame.', acc: [['strength'], ['stronger'], ['hold', 'together'], ['support'], ['stiff'], ['reinforc'], ['collaps']], rej: ['absorb', 'foundation', 'swing', 'lighter'] },
    damper: { pic: 'Build safely', say: 'Tall buildings can have a huge <b>counterweight</b> (a <b>damper</b>) near the top. It swings the opposite way to the building and steadies it. Taipei 101 in Taiwan has one.',
      q: 'What does a counterweight (damper) at the top of a tower do?', a: ['Swings the opposite way to the sway and steadies the building', 'Holds the roof down in storms', 'Absorbs shaking at the foundations', 'Stores water for firefighting'], why: 'It moves against the building\'s sway and cancels much of it out, as in Taipei 101.', hint: 'A giant weight near the top moves against the building\'s sway.', acc: [['opposite'], ['against'], ['other way'], ['stead'], ['stabil'], ['cancel'], ['reduce', 'sway'], ['stop', 'sway'], ['less', 'sway'], ['balance']], rej: ['roof down', 'storm', 'foundation', 'water'] },
    shape: { pic: 'Build safely', say: 'Buildings with a <b>wide base</b> that narrow towards the top, like a <b>pyramid</b>, are more stable when the ground shakes.',
      q: 'Which building shape is most stable in an earthquake?', a: ['Wide at the base, narrow at the top', 'Narrow at the base, wide at the top', 'Tall and thin all the way up', 'Raised up on stilts'], why: 'A wide base keeps the weight low, so it is harder to topple.', hint: 'Think of the pyramids: still standing after thousands of years.', acc: [['wide', 'base'], ['wide', 'bottom'], ['pyramid'], ['wider', 'bottom'], ['wider', 'base'], ['narrow', 'top'], ['triangle']], rej: ['narrow at the base', 'narrow at the bottom', 'wide at the top', 'stilts', 'tall and thin'] },
    drills: { pic: 'Prepare', say: 'In places like <b>Japan</b> and <b>California</b>, people practise <b>earthquake drills</b> in schools and workplaces so they know what to do. <b>Education</b> saves lives.',
      q: 'Why do schools in Japan hold earthquake drills?', a: ['So people react quickly and safely when one hits', 'To predict the next quake', 'To test if buildings are earthquake-proof', 'To measure the shaking'], why: 'Practice means people act fast instead of panicking.', hint: 'Practising means people don\'t panic.', acc: [['know what to do'], ['react'], ['practi'], ['prepar'], ['panic'], ['safe'], ['quick']], rej: ['predict', 'test', 'measure'] },
    dropcover: { pic: 'Prepare', say: 'People are taught to <b>drop, cover and hold on</b>: get down, get under a strong table, and hold on until the shaking stops.',
      q: 'What should you do when the shaking starts indoors?', a: ['Drop, get under a strong table and hold on', 'Run outside straight away', 'Stand by a window', 'Take the lift to the ground floor'], why: 'Running, windows and lifts are dangerous: falling glass and debris cause most injuries.', hint: 'Three short instructions: drop, …, hold on.', acc: [['drop'], ['cover'], ['under', 'table'], ['under', 'desk'], ['hold on']], rej: ['run', 'window', 'lift', 'outside'] },
    warning: { say: '<b>Early warning systems</b> detect the first, fast waves and send <b>alerts to phones</b> seconds before the strong shaking arrives. Trains can stop and gas can be shut off.',
      q: 'How do early warning systems work?', a: ['They detect the first fast waves and send alerts seconds before strong shaking', 'They predict quakes weeks in advance', 'They stop the shaking from spreading', 'They measure radon in wells'], why: 'They only work once a quake has started, so they give seconds, but seconds save lives.', hint: 'The first waves are fast but weak, so phones can get a message before the strong shaking.', acc: [['seconds'], ['first wave'], ['p wave'], ['alert'], ['phone'], ['detect'], ['sensor'], ['before', 'shaking']], rej: ['weeks', 'stop the shaking', 'radon'] },
    emergency: { pic: 'Prepare', say: 'Families keep <b>emergency kits</b> with water, food, a torch and first aid. <b>Emergency services</b> train and plan so they can respond fast.',
      q: 'Why do families keep emergency kits?', a: ['Water, power and help may be cut off for days', 'To predict the next quake', 'To strengthen their house', 'To stop tsunamis'], why: 'After a big quake, water and power can be off for days before help arrives.', hint: 'After a big quake, shops, water and power may be gone for days.', acc: [['water'], ['power'], ['food'], ['days'], ['cut off'], ['supplies'], ['survive'], ['help']], rej: ['predict', 'strengthen', 'tsunami'] },
    shutoff: { say: 'Gas and power can be fitted with <b>automatic shut-off valves</b>. They close when the shaking starts, which stops <b>fires</b> breaking out.',
      q: 'Why are automatic gas shut-off valves fitted?', a: ['To stop fires from broken gas pipes', 'To save money on gas bills', 'To warn people a quake is coming', 'To stop buildings swaying'], why: 'Broken gas pipes plus sparks cause fires after quakes.', hint: 'Broken gas pipes plus a spark equals…', acc: [['fire'], ['explo'], ['leak']], rej: ['money', 'bill', 'warn', 'sway'] },
    zoning: { say: '<b>Land-use planning</b> keeps big buildings, schools and hospitals off the most dangerous ground, like <b>soft soil</b> or right on a fault line.',
      q: 'How does land-use planning reduce earthquake damage?', a: ['It keeps key buildings off dangerous ground like soft soil and fault lines', 'It predicts when the next quake will happen', 'It builds sea walls on the coast', 'It adds rubber bearings to buildings'], why: 'Soft ground shakes more, so planners keep schools and hospitals off it.', hint: 'Soft ground shakes more. Where should hospitals not be built?', acc: [['soft'], ['dangerous', 'ground'], ['fault'], ['away from'], ['not build'], ['avoid'], ['safe', 'area'], ['zone']], rej: ['predict', 'sea wall', 'rubber', 'bearing'] },
    retrofit: { pic: 'Build safely', say: '<b>Retrofitting</b> means strengthening <b>old buildings</b>, for example adding steel braces, so they meet modern earthquake rules.',
      q: 'What is retrofitting?', a: ['Strengthening old buildings to modern earthquake rules', 'Knocking down old buildings', 'Building new towns away from faults', 'Fitting early warning sirens'], why: 'Retro means going back: fixing up buildings that already exist.', hint: '"Retro" means going back: to buildings that already exist.', acc: [['strength'], ['stronger'], ['upgrad'], ['reinforc'], ['improv'], ['fix'], ['safer']], rej: ['knock', 'demolish', 'new town', 'siren'] },
    tsunami: { say: 'Earthquakes under the sea can cause <b>tsunamis</b>. <b>Sea walls</b>, warning sirens and marked <b>escape routes</b> to high ground reduce the damage.',
      q: 'Which of these reduces tsunami damage?', a: ['Sea walls and marked escape routes to high ground', 'Rubber bearings under buildings', 'Tiltmeters on faults', 'Counterweights in towers'], why: 'Tsunamis are huge waves, so the defences are on the coast and help people reach high ground.', hint: 'Think walls, sirens and high ground.', acc: [['sea wall'], ['wall'], ['escape'], ['high ground'], ['siren'], ['warning'], ['evacuat'], ['buoy']], rej: ['rubber', 'tiltmeter', 'counterweight'], tq: 'How can coastal towns reduce tsunami damage?' },
    fire: { say: 'After a quake, broken gas pipes can start big <b>fires</b>, as in San Francisco in 1906. <b>Fire-resistant</b> materials and quick fire services cut the damage.',
      q: 'Why are fires a big danger after an earthquake?', a: ['Broken gas pipes and power lines can start them', 'Earthquakes heat the air', 'Lava comes up through cracks', 'Friction on the fault sets towns alight'], why: 'In big city quakes, fire can do more damage than the shaking, as in San Francisco in 1906.', hint: 'San Francisco, 1906: what broke underground?', acc: [['gas'], ['pipe'], ['power line'], ['wire'], ['electric'], ['spark']], rej: ['heat the air', 'lava', 'friction'] },
    aid: { say: 'After a quake, <b>search and rescue</b> teams, field hospitals and <b>international aid</b> (food, water, shelter) help people survive and rebuild.',
      q: 'What helps people most in the days after a big quake?', a: ['Search and rescue teams, and aid like food, water and shelter', 'Seismographs and tiltmeters', 'Earthquake drills', 'New building codes'], why: 'Instruments, drills and codes help before a quake. Afterwards, rescue and aid save lives.', hint: 'Who comes to help after a disaster?', acc: [['rescue'], ['aid'], ['food'], ['water'], ['shelter'], ['medical'], ['hospital']], rej: ['seismograph', 'tiltmeter', 'drill', 'code'] }
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
    var t = ' ' + text.toLowerCase()
      .replace(/\b(can)['’]?t\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
      .replace(/\b(has|have|had|is|are|was|were|does|do|did|could|would|should)n['’]?t\b/g, '$1 not')
      .replace(/\bwon['’]?t\b/g, 'will not')
      .replace(/[‘’']/g, ' ').replace(/[^a-z0-9]+/g, ' ') + ' ';
    q.normalise.forEach(function (rule) { t = t.replace(rule[0], rule[1]); });
    return t.replace(/\s+/g, ' ');
  }
  function stemHit(stem, norm, tokens) {
    if (stem.indexOf(' ') >= 0) return norm.indexOf(' ' + stem) >= 0;
    // "=word" means the whole word only (so "=sand" doesn't match "sandstone").
    if (stem.charAt(0) === '=') { stem = stem.slice(1); return tokens.some(function (t) { return t === stem || t === stem + 's' || t === stem + 'y'; }); }
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
  var PROPER = wordSet('i ireland irish burren clare co county kerry cork munster leinster ulster connacht midlands central lowlands macgillycuddy macgillycuddys reeks galtee galtees comeragh knockmealdown carrauntoohil mourne mournes slieve aran moher cliffs liscannor fermanagh sligo benbulben ben bulben marble arch arigna leitrim roscommon castlecomer kilkenny tipperary dublin antrim giants causeway carboniferous devonian atlantic pacific europe european africa african american america eurasian japan japanese tokyo kobe fukushima tohoku california san francisco andreas los angeles chile new zealand christchurch turkey haiti nepal italy iceland indonesia china mexico ring fire richter mercalli gps usgs transamerica');
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
      if (/^[A-Z]/.test(prev)) continue; // inside a run of capitalised words, e.g. Old Red Sandstone
      // Only split when the words before the capital already make a whole sentence, so a stray
      // capital ("This process takes Millions of years") doesn't cut a sentence in half.
      var before = body.slice(out.length ? out[out.length - 1] : 0, m.index + prev.length).trim().split(/\s+/);
      if (before.length < 5 || !hasVerb(before)) continue;
      out.push(m.index + m[0].length);
    }
    return out;
  }
  // A long sentence joined by commas often holds several facts ("…sea creatures, the sand is
  // carried by rivers, the weight compacts it…"). Split at a comma or semicolon when both sides
  // are a real clause (5+ words before, 4+ words after), so each fact can earn its own SRP.
  function clauseBreaks(raw, cuts) {
    var out = cuts.slice();
    var re = /[,;]\s+/g, m;
    while ((m = re.exec(raw))) {
      var pos = m.index + m[0].length;
      var prev = 0, next = raw.length;
      out.forEach(function (c) { if (c <= m.index && c > prev) prev = c; if (c >= pos && c < next) next = c; });
      var rest = raw.slice(pos, next);
      var nextComma = rest.search(/[,;]\s/);
      if (nextComma > 0) rest = rest.slice(0, nextComma);
      var left = raw.slice(prev, m.index).trim().split(/\s+/).length;
      var right = rest.trim().split(/\s+/).filter(Boolean).length;
      if (left >= 5 && right >= 4) out.push(pos);
    }
    return out.sort(function (a, b) { return a - b; }).filter(function (c, k, a) { return k === 0 || c !== a[k - 1]; });
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
      var cuts = clauseBreaks(raw, [0].concat(capitalBreaks(raw), [raw.length]));
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
      var counts = s.words >= MIN_WORDS && (s.complete || (open && open(s)));
      // A long clause (20+ words) can hold two facts, so it may earn two SRPs.
      var cap = s.words >= 20 ? 2 : MAX_PER_SENTENCE;
      for (var i = 0; counts && i < q.points.length && s.hits.length < cap; i++) {
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
  // The guided walkthrough can make the same elements inert; an element stays inert until every owner lets go.
  function holdInert(el, owner, on) {
    var owners = el.inertOwners || (el.inertOwners = {});
    if (on) owners[owner] = true; else delete owners[owner];
    el.inert = Object.keys(owners).length > 0;
  }
  function later(fn, ms) { var t = setTimeout(fn, ms); state.timers.push(t); return t; }
  function pointById(id) { return state.q.points.filter(function (p) { return p.id === id; })[0]; }
  function store(key, value) { try { if (value == null) return window.localStorage.getItem(key); window.localStorage.setItem(key, value); } catch (err) {} return null; }

  // ---------- sound: a soft ding per SRP, climbing in pitch as points land in a row ----------
  var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
  var audio = null;
  function soundOn() { return store('am-sound') !== 'off'; }
  function tone(freq, at, length, level) {
    var ctx = audio, osc = ctx.createOscillator(), over = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    over.type = 'sine';
    osc.frequency.value = freq;
    over.frequency.value = freq * 2.01;
    var overGain = ctx.createGain();
    overGain.gain.value = 0.25;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain);
    over.connect(overGain).connect(gain);
    gain.connect(ctx.destination);
    osc.start(at); over.start(at);
    osc.stop(at + length + 0.05); over.stop(at + length + 0.05);
  }
  // n: how many points in a row so far (0 = first). gold: a perfect sentence gets a sparkle on top.
  function ding(n, gold) {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var now = audio.currentTime + 0.01, f = NOTES[Math.min(n, NOTES.length - 1)];
      tone(f, now, 0.5, 0.16);
      if (gold) { tone(f * 1.5, now + 0.09, 0.45, 0.1); tone(f * 2, now + 0.18, 0.6, 0.08); }
    } catch (err) {}
  }
  function fanfare() {
    if (!soundOn()) return;
    [1046.5, 1318.51, 1567.98, 2093].forEach(function (f, k) {
      try { tone(f, audio.currentTime + 0.05 + k * 0.11, k === 3 ? 0.9 : 0.4, 0.13); } catch (err) {}
    });
  }
  function updateSoundButton() {
    var b = state.root.querySelector('[data-am-sound]');
    if (b) b.setAttribute('aria-pressed', String(soundOn()));
  }

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
  // `result` swaps OK for Continue writing / Finish after the answer has been checked.
  function say(title, levels, tone, result) {
    var coach = state.coach;
    state.msg = { title: title, levels: levels, level: 0, tone: tone || '' };
    coach.classList.remove('am-coach--min');
    coach.classList.toggle('am-coach--result', Boolean(result));
    coach.querySelector('[data-am-ok]').textContent = result ? 'Continue writing' : 'OK';
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
    var last = msg.level >= msg.levels.length - 1;
    if (last && document.activeElement === more) coach.querySelector('[data-am-ok]').focus();
    more.hidden = last;
    coach.querySelector('.am-coach__body').scrollTop = fresh ? 0 : 1e6;
  }
  function clueFor(p) {
    return p && p.clue ? p.clue : ['Read your last sentence again. Does it say <b>what</b> happens and <b>why</b>?', 'Pick one idea and explain it fully in one sentence: the point, then how or why it happens.', 'Use a short pattern: <i>"[Idea] happens because [reason], so [result]."</i>'];
  }
  // ---------- "Stuck?": go over one point again simply, with the guide's picture and one quick check ----------
  var pictureCache = null;
  function pictureFor(name) {
    if (!name) return '';
    if (!pictureCache) {
      try { pictureCache = window.ExamHyperFocus && window.ExamHyperFocus.pictures ? window.ExamHyperFocus.pictures() : {}; } catch (err) { pictureCache = {}; }
    }
    return pictureCache[name] || '';
  }
  // Points not yet covered, in the order the answer should go.
  function stuckList() {
    var seen = {};
    return state.q.path.concat(state.q.points.map(function (p) { return p.id; })).filter(function (id) {
      if (seen[id] || state.got[id] || !TEACH[id]) return false;
      seen[id] = true;
      return true;
    });
  }
  // Learn it (picture + explanation), then a proper test with the explanation hidden:
  // 1. a multiple-choice question with believable wrong answers, 2. write it as one exam
  // sentence, checked by the real marker for this point.
  function openTeach(id) {
    var list = stuckList();
    if (!id) { var p = nextPoint(); id = p && TEACH[p.id] && !state.got[p.id] ? p.id : list[0]; }
    if (!id) { say('You\'ve covered everything!', ['There\'s nothing left to go over. Read your answer again and make every sentence clear.']); return; }
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var t = TEACH[id], point = pointById(id), pic = pictureFor(t.pic);
    var opts = shuffle(t.a.map(function (text, k) { return { text: text, ok: !k }; }), id.length * 11 + 3);
    var others = list.filter(function (k) { return k !== id; }).slice(0, 6);
    var card = el('div', 'am-finish am-teach');
    card.setAttribute('data-am-teachid', id);
    card.innerHTML = '<div class="am-finish__card am-teach__card" role="dialog" aria-label="Go over this point">' +
      '<div class="am-finish__kicker" data-am-teachkicker>' + state.q.code + ' &middot; Let\'s go over it</div>' +
      '<h3 class="am-teach__title">' + esc(point ? point.label : '') + '</h3>' +
      '<div class="am-teach__learn">' +
        (pic ? '<div class="am-teach__pic">' + pic + '</div>' : '') +
        '<p class="am-teach__say">' + t.say + '</p>' +
      '</div>' +
      '<div class="am-teach__test" hidden>' +
        '<p class="am-teach__step">Question 1 of 2</p>' +
        '<p class="am-teach__q">' + esc(t.q) + '</p>' +
        '<div class="am-quiz">' + opts.map(function (o) {
          return '<button type="button" class="am-quiz__opt" data-am-teachopt="' + (o.ok ? 1 : 0) + '">' + esc(o.text) + '</button>';
        }).join('') + '</div>' +
        '<p class="am-teach__why" role="status" hidden></p>' +
      '</div>' +
      '<div class="am-teach__write" hidden>' +
        '<p class="am-teach__step">Question 2 of 2</p>' +
        '<p class="am-teach__q">Now write it as one exam sentence, in your own words.</p>' +
        '<textarea class="am-teach__box" rows="3" spellcheck="true" aria-label="Your exam sentence"></textarea>' +
        '<p class="am-teach__why" role="status" data-am-teachfb hidden></p>' +
        '<p class="am-teach__model" hidden></p>' +
      '</div>' +
      (others.length ? '<div class="am-teach__others"><span>Not this bit?</span>' + others.map(function (k) {
        return '<button type="button" class="am-teach__chip" data-am-teach="' + k + '">' + esc(pointById(k).label) + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="am-finish__buttons" data-am-teachbtns></div>' +
      '</div>';
    teachButtons(card, [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-teachgo="test"', 'Test me']]);
    showCard(card);
  }
  function teachButtons(card, list) {
    card.querySelector('[data-am-teachbtns]').innerHTML = list.map(function (b) {
      return '<button type="button" class="am-btn am-btn--' + b[0] + '" ' + b[1] + '>' + b[2] + '</button>';
    }).join('');
  }
  function teachStage(card, stage) {
    card.querySelector('.am-teach__learn').hidden = stage !== 'learn';
    card.querySelector('.am-teach__test').hidden = stage !== 'test';
    card.querySelector('.am-teach__write').hidden = stage !== 'write';
    var others = card.querySelector('.am-teach__others');
    if (others) others.hidden = stage !== 'learn';
    card.querySelector('[data-am-teachkicker]').innerHTML = state.q.code + ' &middot; ' + (stage === 'learn' ? 'Let\'s go over it' : 'Test yourself');
    card.querySelector('.am-finish__card').scrollTop = 0;
    var reached = card.getAttribute('data-am-reached');
    if (stage === 'learn') {
      // Reading it again mid-test is allowed, but it no longer counts as from memory.
      if (reached) card.setAttribute('data-am-missed', '');
      teachButtons(card, [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-teachgo="' + (reached || 'test') + '"', reached ? 'Back to the test' : 'Test me']]);
      card.querySelector('.am-finish__card').focus({ preventScroll: true });
      return;
    }
    card.setAttribute('data-am-reached', stage);
    if (stage === 'test') {
      var solved = card.querySelector('.am-quiz__opt--ok');
      teachButtons(card, solved ? [['ok', 'data-am-teachgo="write"', 'Next question']] : [['more', 'data-am-teachgo="learn"', 'Read it again']]);
      (solved ? card.querySelector('[data-am-teachgo]') : card.querySelector('.am-quiz__opt:not([aria-disabled="true"])')).focus();
    } else {
      var box = card.querySelector('.am-teach__box');
      teachButtons(card, box.readOnly ? [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-teachuse', 'Put it on my lines']]
        : [['more', 'data-am-teachgo="learn"', 'Read it again'], ['ok', 'data-am-teachcheck', 'Check']]);
      (box.readOnly ? card.querySelector('[data-am-teachuse]') : box).focus();
    }
  }
  function answerTeach(btn) {
    var card = btn.closest('.am-teach'), ok = btn.getAttribute('data-am-teachopt') === '1';
    if (btn.getAttribute('aria-disabled') === 'true') return;
    var why = card.querySelector('.am-teach__test .am-teach__why');
    stamp(btn, ok);
    why.hidden = false;
    if (ok) {
      card.querySelectorAll('.am-quiz__opt').forEach(function (b) { b.setAttribute('aria-disabled', 'true'); });
      btn.classList.add('am-quiz__opt--ok');
      why.className = 'am-teach__why am-teach__why--ok';
      why.textContent = card.hasAttribute('data-am-missed') ? 'That\'s it.' : 'Right first time.';
      ding(0);
      mascot('happy', card.hasAttribute('data-am-missed') ? 'Finally.' : 'Correct. First time, even.');
      teachButtons(card, [['ok', 'data-am-teachgo="write"', 'Next question']]);
      card.querySelector('[data-am-teachgo]').focus();
    } else {
      card.setAttribute('data-am-missed', '');
      btn.classList.add('am-quiz__opt--no');
      btn.setAttribute('aria-disabled', 'true');
      why.className = 'am-teach__why';
      why.textContent = 'Not quite. ' + TEACH[card.getAttribute('data-am-teachid')].why;
      mascot('angry', 'No. Read it again.');
    }
  }
  // Would this sentence earn this point's SRP? Uses the same rules as the answer marking.
  function teachMarks(id, text) {
    var p = pointById(id), norm = normalise(state.q, text), tokens = norm.trim().split(' ');
    var g = groupHits(p, norm, tokens);
    return { ok: g.every(Boolean), near: g[0] && !g.every(Boolean) };
  }
  function checkTeachWrite(card) {
    var id = card.getAttribute('data-am-teachid'), box = card.querySelector('.am-teach__box');
    var text = box.value.trim(), fb = card.querySelector('[data-am-teachfb]');
    fb.hidden = false;
    var words = text ? text.split(/\s+/).length : 0;
    var result = words >= MIN_WORDS ? teachMarks(id, text) : { ok: false, near: false };
    if (result.ok) {
      stamp(box.parentNode, true);
      fb.className = 'am-teach__why am-teach__why--ok';
      fb.innerHTML = 'That earns the mark. ' + (card.hasAttribute('data-am-missed') ? 'You got there.' : 'Two out of two!');
      ding(card.hasAttribute('data-am-missed') ? 1 : 2, !card.hasAttribute('data-am-missed'));
      box.readOnly = true;
      teachButtons(card, [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-teachuse', 'Put it on my lines']]);
      card.querySelector('[data-am-teachuse]').focus();
      return;
    }
    stamp(box.parentNode, false);
    var tries = (+card.getAttribute('data-am-tries') || 0) + 1;
    card.setAttribute('data-am-tries', tries);
    var keys = (TEACH[id].say.match(/<b>[^<]+<\/b>/g) || []).slice(0, 2).map(function (k) {
      var word = k.replace(/<\/?b>/g, '');
      // Only the explanation's first word is capitalised for the sentence; names keep theirs.
      return TEACH[id].say.indexOf(k) === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word;
    });
    var tip;
    if (words < MIN_WORDS) tip = 'Write a full sentence: say what happens, and how or why.';
    else if (result.near) tip = 'Close! You\'ve got the key idea. Now add <b>how</b> or <b>why</b> it happens.';
    else tip = 'Not yet. Try using ' + (keys.length > 1 ? 'the key words <b>' + esc(keys[0]) + '</b> and <b>' + esc(keys[1]) + '</b>' : 'the key word <b>' + esc(keys[0] || '') + '</b>') + '.';
    fb.className = 'am-teach__why';
    fb.innerHTML = tip;
    if (tries >= 2) {
      teachButtons(card, [['more', 'data-am-teachmodel', 'Show me how'], ['ok', 'data-am-teachcheck', 'Check']]);
    }
    box.focus();
  }
  function showTeachModel(card) {
    var id = card.getAttribute('data-am-teachid'), model = card.querySelector('.am-teach__model');
    model.hidden = false;
    model.innerHTML = '<span>One way to say it</span>' + (TEACH[id].model || examVersion(id)) + '<em>Read it, then write it your own way.</em>';
    teachButtons(card, [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-teachcheck', 'Check']]);
    card.querySelector('.am-teach__box').focus();
  }
  // Add a sentence to the end of the answer and put the cursor after it.
  function appendToAnswer(text) {
    var k = 0;
    state.pages.forEach(function (p, i) { if (p.ta.value.trim()) k = i; });
    var ta = state.pages[k].ta, v = ta.value;
    ta.value = v + (v && !/\s$/.test(v) ? ' ' : '') + text + ' ';
    reflow(k);
    var last = 0;
    state.pages.forEach(function (p, i) { if (p.ta.value.trim()) last = i; });
    focusPage(last, Infinity);
    onInput();
  }
  function useTeachSentence(card) {
    var text = card.querySelector('.am-teach__box').value.trim().replace(/\s+/g, ' ');
    if (!/[.!?]$/.test(text)) text += '.';
    closeCard();
    appendToAnswer(text.charAt(0).toUpperCase() + text.slice(1));
  }
  // ---------- Real-or-vague sentences for the training run ----------
  // real: [sentence, what it earns]; vague: [sentence, why it earns nothing]. Verdicts always come from the marker.
  var TRAIN = {
    'question-3b': {
      real: [
        ['Mechanical weathering like frost shattering breaks the rock into fragments.', 'Weathering'],
        ['The sediment is carried by the river current to the sea.', 'Transport'],
        ['When rivers lose energy they deposit their load in layers.', 'Deposition in layers'],
        ['The layers at the bottom are compressed by the weight above them.', 'Compaction'],
        ['Minerals in the water cement the particles together.', 'Cementation'],
        ['Old Red Sandstone formed in desert conditions when Ireland was hot and dry.', 'Old Red Sandstone'],
        ['Limestone formed from the shells of dead sea creatures.', 'Limestone from shells'],
        ['Limestone can be found in the Burren in Co. Clare.', 'An Irish example'],
        ['Limestone often contains fossils of shells and coral.', 'Fossils'],
        ['Shale is formed from mud and clay that was deposited in calm water.', 'Shale from mud']
      ],
      vague: [
        ['Sedimentary rocks are very common in Ireland.', 'True, but it doesn\'t say how they form.'],
        ['Limestone is a very useful rock.', 'An opinion, not a fact about how it forms.'],
        ['The Burren is a beautiful place to visit.', 'It names a place but says nothing about the rock.'],
        ['Sandstone is red.', 'Too short: say why it\'s red (iron rusted in desert conditions).'],
        ['Rocks can be different colours.', 'Too general: which rock, and why?'],
        ['Marble is formed when limestone is heated.', 'That\'s a metamorphic rock, not a sedimentary one.'],
        ['Sandstone is used for building houses.', 'A use of the rock, not how it forms.'],
        ['The rocks are very old.', 'Too vague: say how long (millions of years) and what happened.'],
        ['Cementation is an important part of how rocks form.', 'It names cementation but doesn\'t explain it: what glues the grains?']
      ]
    },
    'question-3c': {
      real: [
        ['Seismographs are used to detect small movements in the crust.', 'Seismographs'],
        ['A series of small tremors may come before a larger earthquake.', 'Foreshocks'],
        ['A tiltmeter measures any bulging of the ground.', 'Tiltmeters'],
        ['Water levels in wells sometimes change before an earthquake.', 'Well water'],
        ['It\'s impossible to say exactly when an earthquake will strike.', 'Prediction isn\'t exact'],
        ['Rubber shock absorbers are built into the foundations of buildings.', 'Base isolation'],
        ['A counterweight on the roof stops the building swaying.', 'Counterweights'],
        ['Schools hold earthquake drills so students know what to do.', 'Drills'],
        ['Warning systems alert people seconds before the shaking arrives.', 'Early warning'],
        ['Gas pipes automatically shut off during an earthquake to prevent fires.', 'Gas shut-off']
      ],
      vague: [
        ['Earthquakes are very dangerous.', 'True, but it\'s not about predicting quakes or reducing their effects.'],
        ['The 2011 earthquake in Japan killed thousands.', 'A fact about damage, not a way to predict or reduce it.'],
        ['Earthquakes are measured on the Richter scale.', 'Measuring a quake\'s size doesn\'t predict it or reduce its effects.'],
        ['Plates move apart at constructive boundaries.', 'About plates in general, not prediction or reduction.'],
        ['Many people die in earthquakes each year.', 'It describes the problem, not a solution.'],
        ['Japan has a lot of earthquakes.', 'It names a place but gives no method.'],
        ['Seismographs are used.', 'It names the tool but not what it does: say it records tremors.'],
        ['Scientists try to predict earthquakes.', 'Too general: say how they predict them.']
      ]
    }
  };
  var SPRINT_SECONDS = 90;
  function fillButtons(box, list, keepFocus) {
    box.innerHTML = list.map(function (b) {
      return '<button type="button" class="am-btn am-btn--' + b[0] + '" ' + b[1] + '>' + b[2] + '</button>';
    }).join('');
    var last = box.lastElementChild;
    if (last && !keepFocus) last.focus({ preventScroll: true });
  }
  // ---------- Training run: 12 quick cards of mixed kinds, 3 hearts, combos and a speed bonus ----------
  // Each run takes the four points you know least, meets each one easy first (tap an answer) and
  // harder later (fill a gap, then type it). Every right answer adds a layer to the rock (3B) or a
  // floor to the building (3C) beside the cards.
  var RUN_HEARTS = 3;
  var RUN_KINDS = {
    pick: { title: 'Tap the right answer', base: 10, fast: 6000 },
    gap: { title: 'Fill the gap', base: 10, fast: 6000 },
    judge: { title: 'Would this earn a mark?', base: 10, fast: 6000 },
    type: { title: 'Type the answer', base: 20, fast: 15000 }
  };
  var HEART_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.6-4.7-9.5-9.5C1.1 7.4 3.4 3.8 7 3.8c2.2 0 3.9 1.2 5 2.9 1.1-1.7 2.8-2.9 5-2.9 3.6 0 5.9 3.6 4.5 7.2-1.9 4.8-9.5 9.5-9.5 9.5z"/></svg>';
  function mastery() { try { return JSON.parse(store('am-master-' + state.id) || '{}') || {}; } catch (err) { return {}; } }
  function trainIds() {
    var seen = {};
    return state.q.path.filter(function (id) {
      if (seen[id] || !TEACH[id]) return false;
      seen[id] = true;
      return true;
    });
  }
  // The four points you know least (the question's own order breaks ties), so runs move on through the list.
  function runPoints() {
    var known = mastery();
    return trainIds().map(function (id, k) { return { id: id, k: k, m: known[id] || 0 }; })
      .sort(function (a, b) { return a.m - b.m || a.k - b.k; }).slice(0, 4).map(function (x) { return x.id; });
  }
  // A gap card blanks one key word of the point's exam sentence. The other choices are key words from
  // the rest of the question, written the same way (place names against place names), never one
  // that would also fit (SAME_WORDS).
  var SAME_WORDS = [['shaking', 'sway', 'swaying', 'tremors', 'movements', 'bulging'], ['sea', 'water']];
  function gapCard(id, seed) {
    if (!QUIZ[id]) return null;
    var parts = QUIZ[id].drag.split(/\[([^\]]+)\]/), keys = [];
    parts.forEach(function (p, k) { if (k % 2 && (k > 1 || parts[0].trim())) keys.push(k); });
    var lower = keys.filter(function (k) { return parts[k].charAt(0) === parts[k].charAt(0).toLowerCase(); });
    var pool = lower.length ? lower : keys;
    if (!pool.length) return null;
    var blank = pool[seed % pool.length], word = parts[blank], cap = word.charAt(0) !== word.charAt(0).toLowerCase();
    var mine = parts.filter(function (p, k) { return k % 2; }).map(function (w) { return w.toLowerCase(); });
    SAME_WORDS.forEach(function (group) { if (group.indexOf(word.toLowerCase()) >= 0) mine = mine.concat(group); });
    var seen = {}, others = [];
    trainIds().forEach(function (other) {
      if (other === id || !QUIZ[other]) return;
      var op = QUIZ[other].drag.split(/\[([^\]]+)\]/);
      op.forEach(function (w, k) {
        var low = w.toLowerCase();
        if (!(k % 2) || (k === 1 && !op[0].trim()) || seen[low] || mine.indexOf(low) >= 0) return;
        if ((w.charAt(0) !== low.charAt(0)) !== cap) return;
        seen[low] = true;
        others.push(w);
      });
    });
    if (others.length < 2) return null;
    var options = shuffle([word].concat(shuffle(others, seed + 5).slice(0, 3)), seed + 9);
    return { kind: 'gap', id: id, before: parts.slice(0, blank).join(''), after: parts.slice(blank + 1).join(''), options: options, answer: options.indexOf(word) };
  }
  // A point you haven't typed right yet is taught on its first card: read it, then answer.
  function pickCard(id, seed) {
    var opts = shuffle(TEACH[id].a.map(function (text, k) { return { text: text, ok: !k }; }), seed);
    return { kind: 'pick', id: id, teach: !mastery()[id], options: opts.map(function (o) { return o.text; }), answer: opts.map(function (o) { return o.ok; }).indexOf(true) };
  }
  function runDeck() {
    var p = runPoints(), seed = Date.now() % 997 + 1, data = TRAIN[state.id];
    var real = shuffle(data.real, seed).map(function (r) { return { kind: 'judge', text: r[0], label: r[1], answer: 1 }; });
    var vague = shuffle(data.vague, seed + 7).map(function (v) { return { kind: 'judge', text: v[0], why: v[1], answer: 0 }; });
    var judges = shuffle([real[0], vague[0], real[1], vague[1], seed % 2 ? real[2] : vague[2]], seed + 13);
    var gap = function (id, k) { return gapCard(id, seed + k) || judges.pop(); };
    return [pickCard(p[0], seed), pickCard(p[1], seed + 1), judges.shift(), gap(p[0], 2), pickCard(p[2], seed + 3), { kind: 'type', id: p[1] },
      judges.shift(), pickCard(p[3], seed + 4), gap(p[2], 5), { kind: 'type', id: p[0] }, judges.shift(), { kind: 'type', id: p[3] }];
  }
  function openTraining() {
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var tower = Boolean(state.q.sides);
    var card = el('div', 'am-finish am-train');
    card.innerHTML = '<div class="am-finish__card am-train__card am-run" role="dialog" aria-label="Training run">' +
      '<div class="am-run__hud">' +
        '<button type="button" class="am-run__quit" data-am-keep aria-label="Stop training"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="am-run__segs" data-am-segs aria-hidden="true"></div>' +
        '<div class="am-run__hearts" data-am-hearts role="img"></div>' +
        '<div class="am-run__score"><b data-am-rscore>0</b><span>pts</span></div></div>' +
      '<div class="am-run__timer" aria-hidden="true"><i data-am-rtimer></i></div>' +
      '<div class="am-run__main"><div class="am-run__stage">' +
          '<div class="am-run__top"><h3 class="am-run__kind" data-am-rkind></h3><span class="am-run__combo" data-am-combo hidden></span></div>' +
          '<div class="am-train__body" data-am-tbody></div></div>' +
        '<div class="am-run__side" aria-hidden="true"><div class="am-build' + (tower ? ' am-build--tower' : '') + '" data-am-build></div>' +
          '<p class="am-build__cap" data-am-bcap>' + (tower ? 'Build it up' : 'Build the rock') + '</p></div></div>' +
      '<div class="am-finish__buttons am-run__btns" data-am-tbtns></div></div>';
    state.train = { deck: runDeck(), i: 0, hearts: RUN_HEARTS, score: 0, streak: 0, best: 0, right: 0, fast: 0, results: [] };
    later(function () { mascot('ok', 'Let\'s see what you actually know.'); }, 400);
    card.querySelector('[data-am-segs]').innerHTML = new Array(state.train.deck.length + 1).join('<i></i>');
    card.addEventListener('keydown', runKeys);
    showCard(card);
    drawHearts(card, false);
    showRunCard(card);
  }
  // 1-4 pick an answer on tap and gap cards (1 and 2 on real-or-vague cards).
  function runKeys(e) {
    var t = state && state.train;
    if (!t || t.answered || t.deck === undefined || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    var b = /^[1-4]$/.test(e.key) && e.currentTarget.querySelector('[data-am-ropt="' + (e.key - 1) + '"]');
    if (b) { e.preventDefault(); b.click(); }
  }
  function drawHearts(card, lost) {
    var t = state.train, box = card.querySelector('[data-am-hearts]');
    box.setAttribute('aria-label', t.hearts + (t.hearts === 1 ? ' heart' : ' hearts') + ' left');
    box.innerHTML = '';
    for (var k = 0; k < RUN_HEARTS; k++) {
      var h = el('i', 'am-run__heart' + (k >= t.hearts ? ' is-lost' : ''), HEART_ICON);
      if (lost && k === t.hearts && !reduced()) h.classList.add('am-run__heart--break');
      if (lost === 'gain' && k === t.hearts - 1 && !reduced()) h.classList.add('am-run__heart--gain');
      box.appendChild(h);
    }
  }
  function runTimer(card, ms) {
    var bar = card.querySelector('[data-am-rtimer]'), fresh = bar.cloneNode(false);
    fresh.style.width = '';
    // The drain is a countdown, not decoration, so it keeps its real length even with reduced motion.
    fresh.style.setProperty('animation-duration', ms + 'ms', 'important');
    fresh.className = ms ? 'is-running' : '';
    bar.parentNode.replaceChild(fresh, bar);
  }
  function showRunCard(card) {
    var t = state.train;
    if (t.i >= t.deck.length || t.hearts <= 0) { endRun(card); return; }
    var c = t.deck[t.i], kind = RUN_KINDS[c.kind], body = card.querySelector('[data-am-tbody]');
    t.answered = false;
    t.hinted = false;
    t.started = performance.now();
    card.querySelector('[data-am-rkind]').textContent = t.i === t.deck.length - 1 ? 'Last card! ' + kind.title : kind.title;
    Array.prototype.forEach.call(card.querySelectorAll('[data-am-segs] i'), function (seg, k) {
      seg.className = k < t.i ? (t.results[k] ? 'is-ok' : 'is-no') : k === t.i ? 'is-current' : '';
    });
    t.window = c.teach ? kind.fast * 2 : kind.fast;
    runTimer(card, t.window);
    var keys = function (list) {
      return list.map(function (text, k) {
        return '<button type="button" class="am-run__opt" data-am-ropt="' + k + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(text) + '</span></button>';
      }).join('');
    };
    var pic = c.id ? pictureFor(TEACH[c.id].pic) : '';
    if (c.kind === 'pick') {
      body.innerHTML = (c.teach ? '<div class="am-run__ask am-run__ask--teach">' + (pic ? '<div class="am-run__pic">' + pic + '</div>' : '') +
          '<div><span class="am-run__new">New point</span><p class="am-run__say">' + TEACH[c.id].say + '</p></div></div>' +
          '<p class="am-run__q am-run__q--small" id="am-run-q">' + esc(TEACH[c.id].q) + '</p>'
        : '<div class="am-run__ask">' + (pic ? '<div class="am-run__pic">' + pic + '</div>' : '') +
          '<p class="am-run__q" id="am-run-q">' + esc(TEACH[c.id].q) + '</p></div>') +
        '<div class="am-run__opts" role="group" aria-labelledby="am-run-q">' + keys(c.options) + '</div>';
    } else if (c.kind === 'gap') {
      body.innerHTML = '<p class="am-run__gap" id="am-run-q">' + esc(c.before) + '<span class="am-run__slot" data-am-slot><span class="am-sr">blank</span></span>' + esc(c.after) + '</p>' +
        '<div class="am-run__opts am-run__opts--tiles" role="group" aria-labelledby="am-run-q">' + keys(c.options) + '</div>';
    } else if (c.kind === 'judge') {
      body.innerHTML = '<p class="am-judge__s" id="am-run-q">“' + esc(c.text) + '”</p>' +
        '<div class="am-run__opts am-run__opts--two" role="group" aria-labelledby="am-run-q">' + keys(['Too vague', 'Earns a mark']) + '</div>';
    } else {
      var T = TEACH[c.id];
      body.innerHTML = '<div class="am-run__ask">' + (pic ? '<div class="am-run__pic">' + pic + '</div>' : '') +
        '<p class="am-run__q" id="am-run-q">' + esc(T.tq || T.q) + '</p></div>' +
        '<input class="am-flip__input am-run__input" type="text" autocomplete="off" spellcheck="true" placeholder="Type your answer…" aria-labelledby="am-run-q">' +
        '<p class="am-flip__hint" data-am-fliphint>A few words is enough.</p>' +
        (T.hint ? '<p class="am-flip__hintline" data-am-hintline><button type="button" class="am-flip__hintbtn" data-am-thint>Show hint</button></p>' : '');
    }
    var btns = card.querySelector('[data-am-tbtns]');
    if (c.kind === 'type') {
      fillButtons(btns, [['more', 'data-am-rskip', 'I don\'t know'], ['ok', 'data-am-rcheck', 'Check']], true);
      var input = body.querySelector('.am-run__input');
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkRunType(card, false); } });
      input.focus({ preventScroll: true });
    } else {
      btns.innerHTML = '';
      // Focus the question, not an answer, so the keyboard doesn't lean towards any choice.
      var q = body.querySelector('#am-run-q');
      q.setAttribute('tabindex', '-1');
      q.focus({ preventScroll: true });
    }
    if (!reduced()) { body.classList.remove('am-run__in'); void body.offsetWidth; body.classList.add('am-run__in'); }
  }
  function answerRun(card, k) {
    var t = state.train, c = t.deck[t.i];
    if (t.answered) return;
    // Real or vague: the marker has the final say, so a card can never disagree with the marking.
    if (c.kind === 'judge') c.answer = evaluate(state.q, c.text, always).some(function (s) { return s.hits.length > 0; }) ? 1 : 0;
    var right = k === c.answer;
    var opts = card.querySelectorAll('[data-am-ropt]');
    Array.prototype.forEach.call(opts, function (b, n) {
      b.setAttribute('aria-disabled', 'true');
      if (n === c.answer) b.classList.add('am-run__opt--ok');
    });
    opts[k].classList.add(right ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (c.kind === 'gap') {
      var slot = card.querySelector('[data-am-slot]');
      slot.textContent = c.options[c.answer];
      slot.classList.add(right ? 'am-run__slot--ok' : 'am-run__slot--no');
    }
    var host = c.kind === 'judge' ? card.querySelector('.am-judge__s') : opts[k];
    stamp(host, right);
    var fb;
    if (c.kind === 'pick') fb = right ? '' : esc(TEACH[c.id].why);
    else if (c.kind === 'gap') fb = right ? '' : 'The word is <b>' + esc(c.options[c.answer]) + '</b>.';
    else fb = c.answer ? 'It earns a mark: <b>' + esc(c.label || 'a valid point') + '</b>.' : esc(c.why || 'It\'s too vague to earn a mark.');
    scoreRun(card, right, fb);
  }
  function checkRunType(card, skipped) {
    var t = state.train, c = t.deck[t.i], T = TEACH[c.id], input = card.querySelector('.am-run__input');
    if (t.answered) return;
    var answer = input.value.trim();
    if (!skipped && !answer) {
      var hint = card.querySelector('[data-am-fliphint]');
      hint.textContent = 'Type what you remember first, or tap I don\'t know.';
      hint.classList.add('am-flip__hint--warn');
      input.focus();
      return;
    }
    var right = !skipped && learnAnswerRight(c.id, T.tq || T.q, answer);
    input.readOnly = true;
    input.classList.add(right ? 'am-run__input--ok' : 'am-run__input--no');
    if (!right && !skipped) stamp(input.parentNode.querySelector('.am-run__q'), false);
    var known = mastery();
    known[c.id] = right ? Math.min(3, (known[c.id] || 0) + 1) : Math.max(0, (known[c.id] || 0) - 1);
    store('am-master-' + state.id, JSON.stringify(known));
    t.typed = answer;
    scoreRun(card, right, '<span class="am-run__exam"><span>In the exam</span>' + (T.model || examVersion(c.id)) + '</span>');
  }
  // Points: 10 a card (20 for typing), doubled from 3 in a row and tripled from 6, +5 for a fast answer.
  // A hint halves a typed card. Every 5 in a row wins back a lost heart.
  function scoreRun(card, right, feedback) {
    var t = state.train, c = t.deck[t.i], kind = RUN_KINDS[c.kind];
    t.answered = true;
    t.results[t.i] = right;
    var bar = card.querySelector('[data-am-rtimer]'), quick = performance.now() - t.started <= t.window;
    bar.style.width = getComputedStyle(bar).width;
    bar.className = '';
    var gained = 0, extra = [];
    if (right) {
      t.streak += 1;
      t.right += 1;
      t.best = Math.max(t.best, t.streak);
      var times = t.streak >= 6 ? 3 : t.streak >= 3 ? 2 : 1;
      gained = (c.kind === 'type' && t.hinted ? kind.base / 2 : kind.base) * times;
      if (times > 1) extra.push('x' + times + ' combo');
      if (quick) { gained += 5; t.fast += 1; extra.push('fast +5'); }
      t.score += gained;
      rollTo(card.querySelector('[data-am-rscore]'), t.score);
      ding(t.streak - 1, t.streak >= 6);
      addLayer(card);
      if (t.streak % 5 === 0 && t.hearts < RUN_HEARTS) { t.hearts += 1; drawHearts(card, 'gain'); extra.push('+1 heart'); }
      mascot('happy', pick(t.streak >= 3 ? MASCOT.hot : MASCOT.right));
    } else {
      t.streak = 0;
      t.hearts -= 1;
      drawHearts(card, true);
      bonk();
      if (t.hearts <= 0) mascot('furious', 'Out of hearts! Again!'); else mascot('angry', pick(MASCOT.wrong));
    }
    var combo = card.querySelector('[data-am-combo]'), times2 = t.streak >= 6 ? 3 : t.streak >= 3 ? 2 : 1;
    combo.hidden = t.streak < 2;
    if (t.streak >= 2) {
      combo.textContent = t.streak + ' in a row' + (times2 > 1 ? ' · x' + times2 : '');
      if (!reduced()) { combo.classList.remove('am-bump'); void combo.offsetWidth; combo.classList.add('am-bump'); }
    }
    var seg = card.querySelectorAll('[data-am-segs] i')[t.i];
    if (seg) seg.className = right ? 'is-ok' : 'is-no';
    var last = t.i >= t.deck.length - 1 || t.hearts <= 0;
    var head = right ? (c.kind === 'type' && t.hinted ? 'Right, with a hint!' : ['Right!', 'Nice!', 'Yes!', 'Spot on!'][t.right % 4])
      : c.kind === 'type' && !t.typed ? 'Here\'s the answer' : 'Not quite';
    var sheet = '<div class="am-run__sheet ' + (right ? 'am-run__sheet--ok' : 'am-run__sheet--no') + '" role="status">' +
      '<div class="am-run__sheettext"><p class="am-run__verdict">' + head + (gained ? ' <b>+' + gained + '</b>' : '') +
        (extra.length ? '<span>' + extra.join(' · ') + '</span>' : '') + (!right && t.hearts > 0 ? '<span>' + t.hearts + (t.hearts === 1 ? ' heart' : ' hearts') + ' left</span>' : '') + '</p>' +
        (feedback ? '<p class="am-run__fb">' + feedback + '</p>' : '') + '</div>' +
      '<div class="am-run__sheetbtns">' + (!right && c.kind === 'type' && t.typed ? '<button type="button" class="am-run__override" data-am-rright>I was right</button>' : '') +
        '<button type="button" class="am-btn am-btn--ok" data-am-rnext>' + (last ? 'See my score' : 'Continue') + '</button></div></div>';
    var btns = card.querySelector('[data-am-tbtns]');
    btns.innerHTML = sheet;
    btns.querySelector('[data-am-rnext]').focus({ preventScroll: true });
    t.typed = '';
  }
  // "I was right": the typed answer counts after all, and the lost heart comes back.
  function overrideRun(card) {
    var t = state.train, c = t.deck[t.i];
    t.hearts = Math.min(RUN_HEARTS, t.hearts + 1);
    drawHearts(card, false);
    var known = mastery();
    known[c.id] = Math.min(3, (known[c.id] || 0) + 2);
    store('am-master-' + state.id, JSON.stringify(known));
    t.results[t.i] = true;
    t.right += 1;
    t.score += RUN_KINDS.type.base;
    rollTo(card.querySelector('[data-am-rscore]'), t.score);
    addLayer(card);
    nextRun(card);
  }
  function nextRun(card) {
    state.train.i += 1;
    showRunCard(card);
  }
  function bonk() {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var now = audio.currentTime + 0.01;
      tone(220, now, 0.18, 0.1);
      tone(174.61, now + 0.12, 0.3, 0.1);
    } catch (err) {}
  }
  // One more layer of rock (3B) or floor of the building (3C) drops onto the pile.
  function addLayer(card) {
    var build = card.querySelector('[data-am-build]'), n = build.children.length;
    var layer = el('i', 'am-build__l am-build__l--' + (n % 5));
    build.appendChild(layer);
    if (!reduced()) layer.classList.add('am-build__l--drop');
  }
  function endRun(card) {
    var t = state.train, n = t.deck.length, out = t.hearts <= 0;
    var bonus = !out && t.right === n ? 50 : 0;
    t.score += bonus;
    var best = +store('am-run-' + state.id) || 0, newBest = t.score > best;
    if (newBest) store('am-run-' + state.id, String(t.score));
    store('am-trained-' + state.id, '1');
    updateTrainTile();
    var tower = Boolean(state.q.sides), layers = card.querySelectorAll('[data-am-build] i').length;
    var build = card.querySelector('[data-am-build]'), cap = card.querySelector('[data-am-bcap]');
    cap.textContent = tower ? layers + (layers === 1 ? ' floor' : ' floors') : layers + (layers === 1 ? ' layer' : ' layers');
    if (layers) {
      later(function () {
        build.classList.add(tower ? 'am-build--quake' : 'am-build--rock');
        cap.textContent = tower ? (out ? layers + (layers === 1 ? ' floor' : ' floors') : 'It stood up to the quake!') : 'Squeezed and glued into rock!';
      }, reduced() ? 0 : 500);
    }
    card.querySelector('[data-am-rkind]').textContent = out ? 'Out of hearts' : newBest && best ? 'New best!' : 'Run complete!';
    if (!out) mascot(newBest && best ? 'happy' : t.right * 3 >= n * 2 ? 'happy' : 'ok', newBest && best ? 'A new best? I\'m... impressed.' : t.right * 3 >= n * 2 ? 'Hmph. Decent.' : 'Again. Properly this time.');
    card.querySelector('[data-am-combo]').hidden = true;
    card.querySelector('.am-run').classList.add('am-run--end');
    runTimer(card, 0);
    var known = mastery(), points = [];
    t.deck.forEach(function (c) { if (c.id && points.indexOf(c.id) < 0) points.push(c.id); });
    card.querySelector('[data-am-tbody]').innerHTML = '<div class="am-run__end">' +
      '<div class="am-run__big" data-am-rbig>0</div>' +
      '<p class="am-run__sub">points' + (bonus ? ' &middot; includes +50 for a perfect run' : '') +
        (newBest ? (best ? ' &middot; beat your best of ' + best : '') : best ? ' &middot; your best is ' + best : '') + '</p>' +
      '<div class="am-run__stats"><span><b>' + t.right + '/' + n + '</b> right</span><span><b>' + t.best + '</b> best streak</span><span><b>' + t.fast + '</b> fast answers</span></div>' +
      '<div class="am-run__points"><p class="am-run__pointsh">Points this run</p>' + points.map(function (id) {
        var m = known[id] || 0;
        return '<div class="am-run__point"><span>' + esc(pointById(id).label) + '</span><span class="am-run__dots" role="img" aria-label="Known ' + m + ' of 3">' +
          [0, 1, 2].map(function (k) { return '<i' + (k < m ? ' class="on"' : '') + '></i>'; }).join('') + '</span></div>';
      }).join('') + '<p class="am-run__pointsnote">Type a point right to fill a dot. Next run brings in points you know less.</p></div></div>';
    rollTo(card.querySelector('[data-am-rbig]'), t.score);
    rollTo(card.querySelector('[data-am-rscore]'), t.score);
    fillButtons(card.querySelector('[data-am-tbtns]'), [['more', 'data-am-keep', 'Back to writing'], ['more', 'data-am-rsprint', '90s sprint'], ['ok', 'data-am-rrun', 'Play again']]);
    if (newBest && t.score) later(fanfare, 300);
  }
  function updateTrainTile() {
    var line = state.root.querySelector('[data-am-tilebest]'), best = +store('am-run-' + state.id) || 0;
    if (line) line.textContent = best ? 'Your best: ' + best + ' points' : '12 quick cards, 3 hearts';
    var drawLine = state.root.querySelector('[data-am-drawbest]'), drawBest = +store('am-draw-' + state.id) || 0;
    if (drawLine) drawLine.textContent = drawBest ? 'Your best: ' + drawBest + ' labels' : 'Sketch the exam diagrams';
    var examLine = state.root.querySelector('[data-am-exambest]'), bank = examBank(), slots = planItems(), n = slots.filter(function (it) { return bank[it.id]; }).length;
    if (examLine) examLine.textContent = n ? 'Your essay: ' + n + ' of ' + slots.length + ' points, ' + examMarks(bank).marks + '/30' : 'Get each point past a strict examiner';
  }
  function sprintIntro(card) {
    var best = +store('am-sprint-' + state.id) || 0;
    clearInterval(state.dumpTimer);
    state.train = { sprint: true };
    var run = card.querySelector('.am-run');
    run.classList.remove('am-run--end');
    run.classList.add('am-run--sprint');
    card.querySelector('[data-am-rkind]').textContent = 'SRP Sprint';
    card.querySelector('[data-am-combo]').hidden = true;
    runTimer(card, 0);
    card.querySelector('[data-am-tbody]').innerHTML = '<div class="am-sprint__intro">' +
      '<p><b>' + SPRINT_SECONDS + ' seconds.</b> Write as many different SRPs as you can, one per sentence. Each new one dings.</p>' +
      (best ? '<p class="am-sprint__best">Your best: <b>' + best + '</b> SRPs</p>' : '') + '</div>';
    fillButtons(card.querySelector('[data-am-tbtns]'), [['more', 'data-am-rrun', 'Training run'], ['ok', 'data-am-tsprint', 'Start']]);
    mascot('ok', 'Ninety seconds. Impress me.');
  }
  // Is a short typed answer right? Each point has an answer key: acc lists the words that make it
  // right (any one group, all words in it), rej the classic mix-ups that make it wrong. Words copied
  // from the question don't count.
  function learnAnswerRight(id, question, answer) {
    var t = TEACH[id], clean = function (x) { return ' ' + x.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; };
    var qWords = {};
    clean(question).split(' ').forEach(function (w) { if (w) qWords[w] = true; });
    var mine = clean(answer.split(/\s+/).filter(function (w) { return !qWords[clean(w).trim()]; }).join(' '));
    if (!mine.trim()) return false;
    if ((t.rej || []).some(function (r) { return mine.indexOf(r) >= 0; })) return false;
    return (t.acc || []).some(function (alt) { return alt.every(function (stem) { return mine.indexOf(stem) >= 0; }); });
  }
  function startSprint(card) {
    var t = state.train;
    t.round = 'sprint';
    t.got = [];
    t.left = SPRINT_SECONDS;
    card.querySelector('[data-am-rkind]').textContent = 'SRP Sprint';
    var bar = card.querySelector('[data-am-rtimer]');
    bar.className = 'is-clock';
    bar.style.width = '100%';
    card.querySelector('[data-am-tbody]').innerHTML = '<div class="am-sprint__head"><div class="am-sprint__count"><b data-am-scount>0</b> SRPs</div>' +
      '<div class="am-sprint__clock" data-am-sclock role="timer">1:30</div></div>' +
      '<textarea class="am-sprint__box" spellcheck="true" aria-label="Sprint: write as many SRPs as you can"></textarea>' +
      '<div class="am-sprint__chips" aria-live="polite"></div>';
    fillButtons(card.querySelector('[data-am-tbtns]'), [['more', 'data-am-tstop', 'Stop']]);
    var box = card.querySelector('.am-sprint__box');
    box.focus();
    var wait = 0;
    box.addEventListener('input', function () { clearTimeout(wait); wait = setTimeout(function () { if (state && box.isConnected) scoreSprint(card, false); }, 250); });
    state.dumpTimer = setInterval(function () {
      if (!state || !card.isConnected) { clearInterval(state && state.dumpTimer); return; }
      t.left -= 1;
      bar.style.width = (t.left / SPRINT_SECONDS * 100) + '%';
      var clock = card.querySelector('[data-am-sclock]');
      clock.textContent = Math.floor(t.left / 60) + ':' + ('0' + (t.left % 60)).slice(-2);
      clock.classList.toggle('am-sprint__clock--low', t.left <= 10);
      if (t.left <= 0) endSprint(card);
    }, 1000);
  }
  // Every new point that lands dings and drops a chip; finished sentences count as you type.
  function scoreSprint(card, final) {
    var t = state.train, box = card.querySelector('.am-sprint__box');
    var sentences = evaluate(state.q, box.value, final ? always : function () { return false; });
    sentences.forEach(function (s) {
      s.hits.forEach(function (p) {
        if (t.got.indexOf(p.id) >= 0) return;
        t.got.push(p.id);
        var gold = isPerfect(s, p);
        ding(t.got.length - 1, gold);
        mascot('happy', t.got.length % 3 ? '' : pick(MASCOT.hot));
        card.querySelector('.am-sprint__chips').appendChild(el('span', 'am-sprint__chip' + (gold ? ' am-sprint__chip--gold' : ''), (gold ? '&#9733; ' : '') + esc(p.label)));
        rollTo(card.querySelector('[data-am-scount]'), t.got.length);
      });
    });
  }
  function endSprint(card) {
    clearInterval(state.dumpTimer);
    var t = state.train;
    scoreSprint(card, true);
    var n = t.got.length, best = +store('am-sprint-' + state.id) || 0, newBest = n > best;
    if (newBest) store('am-sprint-' + state.id, String(n));
    store('am-trained-' + state.id, '1');
    var missing = state.q.path.filter(function (id, k, all) { return all.indexOf(id) === k && t.got.indexOf(id) < 0; }).slice(0, 3);
    card.querySelector('[data-am-rkind]').textContent = newBest && n ? 'New best!' : 'Time!';
    runTimer(card, 0);
    card.querySelector('[data-am-tbody]').innerHTML = '<div class="am-sprint__result"><div class="am-sprint__big">' + n + '</div>' +
      '<p class="am-sprint__sub">' + (n === 1 ? 'SRP' : 'SRPs') + ' in ' + SPRINT_SECONDS + ' seconds' +
        (newBest ? (best ? ' &middot; beat your best of ' + best : '') : ' &middot; your best is ' + best) + '</p>' +
      (n ? '<div class="am-sprint__chips">' + t.got.map(function (id) { return '<span class="am-sprint__chip">' + esc(pointById(id).label) + '</span>'; }).join('') + '</div>' : '') +
      (missing.length ? '<p class="am-sprint__next">Try these next time: ' + missing.map(function (id) { return '<b>' + esc(pointById(id).label) + '</b>'; }).join(', ') + '.</p>' : '') +
      '</div>';
    fillButtons(card.querySelector('[data-am-tbtns]'), [['more', 'data-am-keep', 'Back to writing'], ['more', 'data-am-rrun', 'Training run'], ['ok', 'data-am-tsprint', 'Sprint again']]);
    if (newBest && n) later(fanfare, 200);
    mascot(newBest && n ? 'happy' : n < 3 ? 'angry' : 'ok', newBest && n ? 'Fine. That\'s a lot of points.' : n < 3 ? 'That\'s it?' : 'Hmph. Faster next time.');
  }

  // ---------- Draw it: study an exam diagram, then draw it from memory using its labels ----------
  // 1. The diagram builds itself and you study it. 2. It disappears, its labels fly into a label bank,
  // and you draw it from memory, placing each label where it belongs. 3. Yours and the exam version side
  // by side: labels in a sensible spot tick themselves, the rest you tick.
  // Drawings are kept the way Quick, Draw! keeps them: pen strokes, each a list of [x, y, ms] points, in
  // the same 480 x 320 space as the diagrams (draw-it-diagrams.js), plus where each label went. For now
  // they stay on this device (am-sketchbook), in the shape a shared dataset would want later.
  var STUDY_SECONDS = 20, DRAW_SECONDS = 60, DRAW_W = 480, DRAW_H = 320, DRAW_INK = '#1F3FA8';
  var PEN_CURSOR = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'26\' height=\'26\'%3E%3Cpath d=\'M3 23l2.2-6.6L18 3.6l4.4 4.4L9.6 20.8z\' fill=\'%231F3FA8\' stroke=\'white\' stroke-width=\'1.6\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M3 23l2.2-6.6 4.4 4.4z\' fill=\'%23FFE14D\'/%3E%3C/svg%3E") 3 23, crosshair';
  function drawSet() { return window.ExamDrawDiagrams && window.ExamDrawDiagrams[state.id]; }
  function openDraw() {
    var set = drawSet();
    if (!set) return;
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var card = el('div', 'am-finish am-draw');
    card.innerHTML = '<div class="am-finish__card am-draw__card" role="dialog" aria-label="Draw it">' +
      '<div class="am-run__hud am-draw__hud">' +
        '<button type="button" class="am-run__quit" data-am-keep aria-label="Stop drawing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="am-run__segs am-draw__segs" data-am-dsegs aria-hidden="true"></div>' +
        '<div class="am-draw__clock" data-am-dclock role="timer" hidden><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="am-draw__ring" cx="22" cy="22" r="19" pathLength="100"/></svg><b data-am-dsecs></b></div>' +
        '<div class="am-run__score"><b data-am-dscore>0</b><span>labels</span></div></div>' +
      '<div class="am-draw__body" data-am-dbody></div>' +
      '<div class="am-finish__buttons am-draw__btns" data-am-dbtns></div></div>';
    state.draw = { list: shuffle(set.diagrams, Date.now() % 997 + 1), set: set, i: 0, results: [], total: 0, step: 0 };
    card.querySelector('[data-am-dsegs]').innerHTML = new Array(state.draw.list.length + 1).join('<i></i>');
    card.addEventListener('keydown', function (e) {
      var d = state && state.draw;
      if (d && d.drawing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); drawUndo(card); }
    });
    showCard(card);
    drawIntro(card);
    later(function () { mascot('ok', 'Draw. Neatly.'); }, 400);
    if (document.fonts && document.fonts.load) document.fonts.load('600 12.5px Lexend').catch(function () {});
  }
  function drawIntro(card) {
    var d = state.draw, book = sketchbook().length;
    card.querySelector('[data-am-dbody]').innerHTML = '<div class="am-draw__intro">' +
      '<div class="am-draw__fan" aria-hidden="true">' + d.list.map(function (x, k) { return '<i style="--k:' + k + '">?</i>'; }).join('') + '</div>' +
      '<h3 class="am-draw__title">Draw it</h3>' +
      '<p>' + d.list.length + ' exam diagrams. Study each one for <b>' + STUDY_SECONDS + ' seconds</b>, then it disappears.</p>' +
      '<p>Draw it from memory in <b>' + DRAW_SECONDS + ' seconds</b> and put its labels in the right places.</p>' +
      (book ? '<p class="am-draw__note">Your sketchbook has ' + book + (book === 1 ? ' drawing' : ' drawings') + ' on this device.</p>' : '') + '</div>';
    fillButtons(card.querySelector('[data-am-dbtns]'), [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-dgo', 'Let\'s draw']]);
  }
  function drawSegs(card) {
    var d = state.draw;
    Array.prototype.forEach.call(card.querySelectorAll('[data-am-dsegs] i'), function (seg, k) {
      var r = d.results[k];
      seg.className = r ? (r.got * 2 >= r.max ? 'is-ok' : 'is-no') : k === d.i ? 'is-current' : '';
    });
  }
  // Quick, Draw!-style prompt: the thing to learn, big, then Go.
  function drawPrompt(card) {
    var d = state.draw, item = d.list[d.i];
    drawSegs(card);
    stopClock(card);
    card.querySelector('[data-am-dbody]').innerHTML = '<div class="am-draw__prompt">' +
      '<p class="am-draw__pk">Diagram ' + (d.i + 1) + ' of ' + d.list.length + '</p>' +
      '<p class="am-draw__pdraw">Study, then draw</p><h3 class="am-draw__pname">' + esc(item.say) + '</h3>' +
      '<p class="am-draw__psub">' + STUDY_SECONDS + ' seconds to study it, then ' + DRAW_SECONDS + ' seconds to draw it from memory.</p></div>';
    fillButtons(card.querySelector('[data-am-dbtns]'), [['ok', 'data-am-dstudy', 'Go!']]);
  }
  // The ring clock in the top bar. Study time is blue; drawing time turns red and ticks at the end.
  function runClock(card, seconds, study, done) {
    var d = state.draw, clock = card.querySelector('[data-am-dclock]'), ring = clock.querySelector('.am-draw__ring'), secs = clock.querySelector('[data-am-dsecs]');
    var shown = seconds, t0 = performance.now(), step = d.step = d.step + 1;
    clock.hidden = false;
    clock.classList.toggle('am-draw__clock--study', study);
    clock.classList.remove('am-draw__clock--low');
    clock.setAttribute('aria-label', study ? 'Study time left' : 'Drawing time left');
    ring.style.strokeDashoffset = 0;
    secs.textContent = seconds;
    clearInterval(state.dumpTimer);
    var id = state.dumpTimer = setInterval(function () {
      if (!state || state.draw !== d || d.step !== step || !card.isConnected) { clearInterval(id); return; }
      var left = Math.max(0, seconds * 1000 - (performance.now() - t0)), s = Math.ceil(left / 1000);
      ring.style.strokeDashoffset = 100 - left / (seconds * 10);
      if (s !== shown) {
        shown = s;
        secs.textContent = s;
        if (!study) {
          clock.classList.toggle('am-draw__clock--low', s <= 10);
          if (s <= 10 && !reduced()) { secs.classList.remove('am-bump'); void secs.offsetWidth; secs.classList.add('am-bump'); }
          if (s <= 5 && s > 0) clockTick();
        }
      }
      if (left <= 0) { clearInterval(id); done(); }
    }, 100);
    return t0;
  }
  function stopClock(card) {
    state.draw.step += 1;
    clearInterval(state.dumpTimer);
    card.querySelector('[data-am-dclock]').hidden = true;
  }
  // The paper (and the diagram you study) keep the diagrams' 3:2 shape and fit the window.
  function drawWidth(card, withBank) {
    var room = card.querySelector('[data-am-dbody]').clientWidth, side = withBank && room >= 700 ? 200 : 0;
    var high = Math.max(220, window.innerHeight - (withBank && !side ? 390 : 300));
    return Math.floor(Math.min(room - side, high * 1.5));
  }
  function drawStudy(card) {
    var d = state.draw, item = d.list[d.i];
    d.actions = [];
    d.armed = null;
    d.over = false;
    d.drawing = false;
    var body = card.querySelector('[data-am-dbody]');
    body.innerHTML = '<div class="am-draw__study"><div class="am-draw__ref am-draw__fig" data-am-dref>' + item.svg + '</div>' +
      '<p class="am-draw__studyhint">Study it. Then it disappears and you draw it from memory, using these labels.</p></div>';
    var fig = body.querySelector('[data-am-dref]');
    fig.style.width = drawWidth(card, false) + 'px';
    buildDiagram(card, fig.querySelector('svg'));
    fillButtons(card.querySelector('[data-am-dbtns]'), [['ok', 'data-am-dready', 'I\'m ready']]);
    d.studyT0 = runClock(card, STUDY_SECONDS, true, function () { drawHide(card); });
    mascot('ok', 'Memorise it. All of it.');
  }
  // The exam diagram builds itself in the order it would be drawn, then its labels pop on one by one.
  function buildDiagram(card, svg) {
    sizeTags(svg);
    var parts = Array.prototype.slice.call(svg.querySelectorAll('[data-part]')), labels = Array.prototype.slice.call(svg.querySelectorAll('[data-label]'));
    if (reduced()) { svg.querySelectorAll('animate,animateTransform,animateMotion').forEach(function (a) { a.remove(); }); return; }
    parts.concat(labels).forEach(function (g) { g.classList.add('dd-wait'); });
    parts.forEach(function (g, k) { later(function () { g.classList.remove('dd-wait'); }, 250 + k * 230); });
    var from = 250 + parts.length * 230 + 200;
    labels.forEach(function (g, k) { later(function () { g.classList.remove('dd-wait'); }, from + k * 420); });
  }
  // Each label's tag fits its text, measured again once the label font has loaded.
  function sizeTags(svg) {
    var fit = function () {
      if (!svg.isConnected) return;
      svg.querySelectorAll('[data-label]').forEach(function (g) {
        var t = g.querySelector('text'), r = g.querySelector('rect'), bb = t.getBBox();
        r.setAttribute('x', bb.x - 9);
        r.setAttribute('width', bb.width + 18);
      });
    };
    fit();
    if (document.fonts && document.fonts.load) document.fonts.load('600 12.5px Lexend').then(fit, function () {});
  }
  function drawHide(card) {
    var d = state.draw;
    if (!card.querySelector('.am-draw__study')) return;
    d.studyMs = Math.round(Math.min(STUDY_SECONDS * 1000, performance.now() - d.studyT0));
    var rects = Array.prototype.map.call(card.querySelectorAll('[data-am-dref] [data-label] rect'), function (r) { return r.getBoundingClientRect(); });
    drawStart(card, rects);
  }
  function drawStart(card, rects) {
    var d = state.draw, item = d.list[d.i];
    d.drawing = true;
    var order = shuffle(item.labels.map(function (l, k) { return k; }), d.i * 7 + 5);
    card.querySelector('[data-am-dbody]').innerHTML = '<div class="am-draw__stage">' +
      '<div class="am-draw__left"><div class="am-draw__paper" data-am-paper><canvas class="am-draw__canvas" role="img" aria-label="Your drawing of ' + esc(item.say) + '"></canvas>' +
        '<p class="am-draw__ghost" data-am-dghost aria-hidden="true">Draw it from memory. Then tap a label and tap where it goes.</p></div>' +
        '<div class="am-draw__tools" role="toolbar" aria-label="Drawing tools">' +
          '<button type="button" class="am-draw__tool" data-am-dundo><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12"/></svg>Undo</button>' +
          '<button type="button" class="am-draw__tool" data-am-dclear><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>Clear</button></div></div>' +
      '<div class="am-draw__bank" role="group" aria-label="Labels to place"><p class="am-draw__bankh">Labels</p>' + order.map(function (k) {
        return '<button type="button" class="am-draw__chip" data-am-dchip="' + k + '" aria-pressed="false">' + esc(item.labels[k].tag) + '</button>';
      }).join('') + '</div></div>';
    fillButtons(card.querySelector('[data-am-dbtns]'), [['ok', 'data-am-ddone', 'Done']], true);
    var paper = card.querySelector('[data-am-paper]'), canvas = paper.querySelector('canvas');
    drawSize(card);
    canvas.style.cursor = PEN_CURSOR;
    // The labels fly from where they sat on the diagram into the label bank.
    if (rects && !reduced()) {
      card.querySelectorAll('[data-am-dchip]').forEach(function (chip, n) {
        var from = rects[+chip.getAttribute('data-am-dchip')], to = chip.getBoundingClientRect();
        if (!from || !from.width) return;
        chip.style.transition = 'none';
        chip.style.transform = 'translate(' + Math.round(from.left - to.left) + 'px,' + Math.round(from.top - to.top) + 'px)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            chip.style.transition = 'transform .7s cubic-bezier(.3,1.2,.5,1) ' + (n * 70) + 'ms';
            chip.style.transform = '';
            later(function () { chip.style.transition = ''; }, 800 + n * 70);
          });
        });
      });
    }
    var frame = 0, paintSoon = function () { if (!frame) frame = requestAnimationFrame(function () { frame = 0; drawPaint(canvas, d.actions); }); };
    var at = function (e) {
      var r = canvas.getBoundingClientRect();
      return [Math.round(Math.max(0, Math.min(DRAW_W, (e.clientX - r.left) / r.width * DRAW_W)) * 10) / 10,
        Math.round(Math.max(0, Math.min(DRAW_H, (e.clientY - r.top) / r.height * DRAW_H)) * 10) / 10,
        Math.round(performance.now() - d.t0)];
    };
    canvas.addEventListener('pointerdown', function (e) {
      if (d.over || e.button > 0) return;
      e.preventDefault();
      var p = at(e);
      card.querySelector('[data-am-dghost]').hidden = true;
      if (d.armed != null) { placeLabel(card, d.armed, p[0], p[1]); return; }
      canvas.setPointerCapture(e.pointerId);
      d.stroke = { k: 's', p: [p] };
      d.actions.push(d.stroke);
      paintSoon();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!d.stroke) return;
      (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(function (ev) {
        var p = at(ev), last = d.stroke.p[d.stroke.p.length - 1];
        if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) >= 0.8) d.stroke.p.push(p);
      });
      paintSoon();
    });
    var lift = function () { d.stroke = null; paintSoon(); };
    canvas.addEventListener('pointerup', lift);
    canvas.addEventListener('pointercancel', lift);
    d.t0 = runClock(card, DRAW_SECONDS, false, function () { drawFinish(card, true); });
    mascot('ok', 'From memory. No peeking.');
  }
  function drawSize(card) {
    var paper = card.querySelector('[data-am-paper]');
    if (!paper) return;
    var w = drawWidth(card, true);
    paper.style.width = w + 'px';
    paper.style.height = Math.round(w / 1.5) + 'px';
    fitCanvas(paper.querySelector('canvas'), w);
    drawPaint(paper.querySelector('canvas'), state.draw.actions);
  }
  function fitCanvas(canvas, w) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = w + 'px';
    canvas.style.height = Math.round(w / 1.5) + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w / 1.5 * dpr);
  }
  // Labels are drawn as little tags, the same as the exam diagram's. hl: a label to pick out in yellow.
  function labelTag(ctx, act, s, hl) {
    ctx.font = '800 ' + (12 * s) + 'px Nunito, sans-serif';
    var w = ctx.measureText(act.s).width + 16 * s, h = 20 * s, x = act.x * s - w / 2, y = act.y * s - h / 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.rect(x, y, w, h);
    ctx.fillStyle = hl === act.i ? '#FFE14D' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
    ctx.fillStyle = DRAW_INK;
    ctx.fillText(act.s, act.x * s, act.y * s);
  }
  // Paints the strokes and placed labels. limit: how many points to draw (for replays).
  function drawPaint(canvas, actions, limit, hl) {
    var ctx = canvas.getContext('2d'), s = canvas.width / DRAW_W, n = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = DRAW_INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var a = 0; a < actions.length; a++) {
      var act = actions[a];
      if (limit != null && n >= limit) return;
      if (act.k === 'l') { labelTag(ctx, act, s, hl); n += 1; continue; }
      var p = act.p, m = limit == null ? p.length : Math.min(p.length, limit - n);
      ctx.lineWidth = 2.6 * s;
      ctx.beginPath();
      if (m === 1 || p.length === 1) {
        ctx.arc(p[0][0] * s, p[0][1] * s, 1.4 * s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(p[0][0] * s, p[0][1] * s);
        for (var i = 1; i < m - 1; i++) ctx.quadraticCurveTo(p[i][0] * s, p[i][1] * s, (p[i][0] + p[i + 1][0]) / 2 * s, (p[i][1] + p[i + 1][1]) / 2 * s);
        ctx.lineTo(p[m - 1][0] * s, p[m - 1][1] * s);
        ctx.stroke();
      }
      n += m;
    }
  }
  function replayDrawing(canvas, actions, ms) {
    var total = actions.reduce(function (n, a) { return n + (a.k === 'l' ? 1 : a.p.length); }, 0);
    cancelAnimationFrame(canvas.replayFrame);
    if (!total || reduced()) { drawPaint(canvas, actions); return; }
    var start = performance.now();
    (function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      drawPaint(canvas, actions, Math.ceil(total * t));
      if (t < 1 && canvas.isConnected) canvas.replayFrame = requestAnimationFrame(frame);
    })(start);
  }
  // Tap a label, then tap the paper to put it there. Tapping a placed label picks it up again.
  function armLabel(card, chip, byKeyboard) {
    var d = state.draw, k = +chip.getAttribute('data-am-dchip');
    if (!d.drawing || d.over) return;
    if (chip.classList.contains('is-placed')) {
      d.actions = d.actions.filter(function (a) { return !(a.k === 'l' && a.i === k); });
      chip.classList.remove('is-placed');
      drawPaint(card.querySelector('.am-draw__canvas'), d.actions);
    }
    d.armed = d.armed === k && !byKeyboard ? null : k;
    card.querySelectorAll('[data-am-dchip]').forEach(function (c) {
      var on = +c.getAttribute('data-am-dchip') === d.armed;
      c.classList.toggle('is-armed', on);
      c.setAttribute('aria-pressed', String(on));
    });
    card.querySelector('.am-draw__canvas').style.cursor = d.armed == null ? PEN_CURSOR : 'copy';
    // From the keyboard there's no spot to tap, so the label goes down the left side of the paper.
    if (byKeyboard && d.armed != null) {
      var n = d.actions.filter(function (a) { return a.k === 'l'; }).length;
      placeLabel(card, k, 0, 24 + (n % 11) * 27);
    }
  }
  function placeLabel(card, k, x, y) {
    var d = state.draw, item = d.list[d.i], canvas = card.querySelector('.am-draw__canvas'), ctx = canvas.getContext('2d');
    ctx.font = '800 12px Nunito, sans-serif';
    var half = (ctx.measureText(item.labels[k].tag).width + 16) / 2;
    d.actions.push({ k: 'l', i: k, x: Math.round(Math.max(half + 2, Math.min(DRAW_W - half - 2, x)) * 10) / 10, y: Math.round(Math.max(12, Math.min(DRAW_H - 12, y)) * 10) / 10, s: item.labels[k].tag, t: Math.round(performance.now() - d.t0) });
    d.armed = null;
    var chip = card.querySelector('[data-am-dchip="' + k + '"]');
    chip.classList.remove('is-armed');
    chip.classList.add('is-placed');
    chip.setAttribute('aria-pressed', 'false');
    canvas.style.cursor = PEN_CURSOR;
    card.querySelector('[data-am-dghost]').hidden = true;
    drawPaint(canvas, d.actions);
    ding(d.actions.filter(function (a) { return a.k === 'l'; }).length - 1);
  }
  function syncChips(card) {
    var d = state.draw, placed = {};
    d.actions.forEach(function (a) { if (a.k === 'l') placed[a.i] = true; });
    card.querySelectorAll('[data-am-dchip]').forEach(function (c) { c.classList.toggle('is-placed', Boolean(placed[+c.getAttribute('data-am-dchip')])); });
  }
  function drawUndo(card) {
    var d = state.draw;
    if (!d.drawing || d.over) return;
    d.actions.pop();
    syncChips(card);
    drawPaint(card.querySelector('.am-draw__canvas'), d.actions);
  }
  function drawClear(card) {
    var d = state.draw;
    if (!d.drawing || d.over) return;
    d.actions = [];
    syncChips(card);
    drawPaint(card.querySelector('.am-draw__canvas'), d.actions);
  }
  function clockTick() {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      tone(1318.51, audio.currentTime + 0.01, 0.07, 0.05);
    } catch (err) {}
  }
  function drawFinish(card, timeUp) {
    var d = state.draw;
    if (d.over || !d.drawing) return;
    d.over = true;
    d.drawing = false;
    d.armed = null;
    d.ms = Math.round(Math.min(DRAW_SECONDS * 1000, performance.now() - d.t0));
    stopClock(card);
    card.querySelector('[data-am-dbtns]').innerHTML = '';
    if (timeUp) {
      bonk();
      mascot('furious', 'Time\'s up! Pens down!');
      card.querySelector('[data-am-paper]').appendChild(el('div', 'am-draw__timesup', 'Time\'s up!'));
      later(function () { if (card.isConnected) drawCompare(card); }, reduced() ? 400 : 1100);
    } else drawCompare(card);
  }
  // A label is in a good spot when it sits on the same side of the other labels (left or right, above or
  // below) as on the exam diagram, wherever the diagram has them clearly apart. Drawings differ in size
  // and position, so only the layout is compared, never exact places. The most out-of-place labels (up to
  // a third) are set aside first, so one wrong label can't drag the right ones down with it.
  function goodSpots(item, placed) {
    var out = {}, ids = item.labels.map(function (l, k) { return k; }).filter(function (k) { return placed[k]; });
    var score = function (k) {
      var l = item.labels[k], me = placed[k], votes = 0, agree = 0;
      ids.forEach(function (j) {
        if (j === k || out[j]) return;
        var o = item.labels[j], other = placed[j], rx = o.at[0] - l.at[0], ry = o.at[1] - l.at[1];
        if (Math.abs(rx) > 90) { votes += 1; if (rx * (other.x - me.x) > 0) agree += 1; }
        if (Math.abs(ry) > 60) { votes += 1; if (ry * (other.y - me.y) > 0) agree += 1; }
      });
      return { votes: votes, ratio: votes ? agree / votes : 0 };
    };
    for (var n = 0; n < Math.floor(ids.length / 3); n++) {
      var worst = null;
      ids.forEach(function (k) {
        if (out[k]) return;
        var sc = score(k);
        if (sc.votes && sc.ratio < 0.8 && (!worst || sc.ratio < worst.ratio)) worst = { k: k, ratio: sc.ratio };
      });
      if (!worst) break;
      out[worst.k] = true;
    }
    return item.labels.map(function (l, k) {
      if (!placed[k] || out[k]) return false;
      var sc = score(k);
      return sc.votes >= 2 && sc.ratio >= 0.8;
    });
  }
  function drawCompare(card) {
    var d = state.draw, item = d.list[d.i], placed = {};
    d.actions.forEach(function (a) { if (a.k === 'l') placed[a.i] = a; });
    d.ticked = item.labels.map(function () { return false; });
    d.auto = goodSpots(item, placed);
    var empty = !d.actions.length;
    card.querySelector('[data-am-dbody]').innerHTML = '<div class="am-draw__compare">' +
      '<figure class="am-draw__panel"><figcaption>Yours</figcaption><div class="am-draw__mine">' +
        (empty ? '<p class="am-draw__blank">Nothing drawn this time. Have a good look at the exam version, then try the next one.</p>' : '<canvas aria-label="Your drawing"></canvas>') +
        (empty ? '' : '<button type="button" class="am-draw__replay" data-am-dreplay aria-label="Replay your drawing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>') + '</div></figure>' +
      '<figure class="am-draw__panel"><figcaption>Exam version</figcaption><div class="am-draw__ref" data-am-dref>' + item.svg + '</div></figure></div>' +
      '<div class="am-draw__checks"><p class="am-draw__checksh">Tick each label you put on the right part</p>' +
        '<div class="am-draw__checklist" role="group" aria-label="Labels">' + item.labels.map(function (l, k) {
          return '<button type="button" class="am-draw__check" data-am-dtick="' + k + '" aria-pressed="false"' + (placed[k] ? '' : ' aria-disabled="true"') + '>' +
            '<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i><span>' + esc(l.tag) + '</span><em>' + (placed[k] ? '' : 'Not placed') + '</em></button>';
        }).join('') + '</div></div>' +
      '<p class="am-draw__tip"><b>Tip</b>' + esc(item.tip) + '</p>';
    fillButtons(card.querySelector('[data-am-dbtns]'), [['ok', 'data-am-dnext', d.i >= d.list.length - 1 ? 'See my sketchbook' : 'Next diagram']], true);
    card.querySelector('.am-finish__card').scrollTop = 0;
    var mine = card.querySelector('.am-draw__mine canvas');
    if (mine) {
      fitCanvas(mine, mine.parentNode.clientWidth);
      replayDrawing(mine, d.actions, Math.min(3200, Math.max(1400, d.ms / 6)));
    }
    var svg = card.querySelector('[data-am-dref] svg');
    sizeTags(svg);
    if (reduced()) svg.querySelectorAll('animate,animateTransform,animateMotion').forEach(function (a) { a.remove(); });
    // Pointing at a label row picks it out on both drawings.
    card.querySelectorAll('[data-am-dtick]').forEach(function (row) {
      var k = +row.getAttribute('data-am-dtick');
      var on = function () { drawHighlight(card, k); }, off = function () { drawHighlight(card, null); };
      row.addEventListener('mouseenter', on);
      row.addEventListener('focus', on);
      row.addEventListener('mouseleave', off);
      row.addEventListener('blur', off);
    });
    var step = d.step, n = 0;
    item.labels.forEach(function (l, k) {
      if (!d.auto[k]) return;
      later(function () {
        if (!card.isConnected || d.step !== step || state.draw !== d) return;
        setTick(card, k, true);
        card.querySelector('[data-am-dtick="' + k + '"] em').textContent = 'Good spot';
      }, reduced() ? 0 : 900 + (n++) * 380);
    });
  }
  function drawHighlight(card, k) {
    var d = state.draw, mine = card.querySelector('.am-draw__mine canvas');
    card.querySelectorAll('[data-am-dref] [data-label]').forEach(function (g) { g.classList.toggle('dd-hl', +g.getAttribute('data-label') === k); });
    if (mine) { cancelAnimationFrame(mine.replayFrame); drawPaint(mine, d.actions, null, k); }
  }
  function setTick(card, k, on) {
    var d = state.draw, row = card.querySelector('[data-am-dtick="' + k + '"]');
    if (!row || d.ticked[k] === on || row.getAttribute('aria-disabled') === 'true') return;
    d.ticked[k] = on;
    row.setAttribute('aria-pressed', String(on));
    row.classList.toggle('is-on', on);
    var got = d.ticked.filter(Boolean).length;
    if (on) {
      ding(got - 1, got === d.ticked.length);
      mascot('happy', got === d.ticked.length ? 'Every label. Hmph.' : '');
      if (!reduced()) { row.classList.remove('am-bump'); void row.offsetWidth; row.classList.add('am-bump'); }
    }
    rollTo(card.querySelector('[data-am-dscore]'), d.total + got);
  }
  function drawNext(card) {
    var d = state.draw, item = d.list[d.i], got = d.ticked.filter(Boolean).length;
    d.results.push({ item: item, actions: d.actions, got: got, max: item.labels.length });
    d.total += got;
    d.step += 1;
    saveSketch({
      v: 2, subject: d.set.subject, topic: d.set.topic, thing: item.id, name: item.name, w: DRAW_W, h: DRAW_H, studyMs: d.studyMs, ms: d.ms,
      strokes: d.actions.filter(function (a) { return a.k === 's'; }).map(function (a) { return a.p; }),
      labels: d.actions.filter(function (a) { return a.k === 'l'; }).map(function (a) { return { i: a.i, s: a.s, x: a.x, y: a.y, t: a.t }; }),
      ticked: item.labels.filter(function (l, k) { return d.ticked[k]; }).map(function (l) { return l.tag; }),
      goodSpot: item.labels.filter(function (l, k) { return d.auto[k]; }).map(function (l) { return l.tag; }),
      at: new Date().toISOString()
    });
    d.i += 1;
    if (d.i >= d.list.length) drawEnd(card); else drawPrompt(card);
  }
  function sketchbook() { try { return JSON.parse(store('am-sketchbook') || '[]') || []; } catch (err) { return []; } }
  function saveSketch(record) {
    var book = sketchbook();
    book.push(record);
    store('am-sketchbook', JSON.stringify(book.slice(-40)));
  }
  function drawEnd(card) {
    var d = state.draw, max = d.results.reduce(function (n, r) { return n + r.max; }, 0);
    var best = +store('am-draw-' + state.id) || 0, newBest = d.total > best;
    if (newBest) store('am-draw-' + state.id, String(d.total));
    updateTrainTile();
    drawSegs(card);
    stopClock(card);
    card.querySelector('[data-am-dbody]').innerHTML = '<div class="am-draw__end">' +
      '<p class="am-draw__pk">Your sketchbook</p>' +
      '<div class="am-run__big"><span data-am-dbig>0</span><small>/' + max + '</small></div>' +
      '<p class="am-run__sub">labels in the right place' + (newBest ? (best ? ' &middot; beat your best of ' + best : '') : best ? ' &middot; your best is ' + best : '') + '</p>' +
      '<div class="am-draw__book">' + d.results.map(function (r, k) {
        return '<figure class="am-draw__page" tabindex="0" data-am-dpage="' + k + '"><div class="am-draw__thumb"><canvas aria-label="Your drawing of ' + esc(r.item.say) + '"></canvas></div>' +
          '<figcaption><b>' + esc(r.item.name) + '</b><span>' + r.got + ' of ' + r.max + '</span></figcaption></figure>';
      }).join('') + '</div>' +
      '<p class="am-draw__note">Saved in your sketchbook on this device. Hover over a drawing to watch it again.</p></div>';
    card.querySelectorAll('[data-am-dpage]').forEach(function (page) {
      var r = d.results[+page.getAttribute('data-am-dpage')], c = page.querySelector('canvas');
      fitCanvas(c, page.querySelector('.am-draw__thumb').clientWidth);
      drawPaint(c, r.actions);
      var again = function () { replayDrawing(c, r.actions, 1600); };
      page.addEventListener('mouseenter', again);
      page.addEventListener('focus', again);
    });
    rollTo(card.querySelector('[data-am-dbig]'), d.total);
    fillButtons(card.querySelector('[data-am-dbtns]'), [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-dagain', 'Draw again']]);
    if (newBest && d.total) later(fanfare, 300);
    mascot(d.total * 2 >= max ? 'happy' : 'angry', d.total * 2 >= max ? 'Hmph. Decent drawings.' : 'My cat draws better than that.');
  }

  // ---------- Beat the Examiner: get each point of the essay past a strict examiner ----------
  // The examiner asks for the points of the answer plan in order. A sentence that earns an SRP under the
  // marking rules (specific, correct, on the question, not a repeat) gets a "//" and is banked into your
  // essay (am-bank-<id>); anything else gets a short note in green pen ("Vague", "Not relevant"...) and
  // you fix it. Three tries per point, then the examiner shows a sentence that would have got it.
  var EXAM_ROUND = 5, EXAM_TRIES = 3;
  // Words that give away a sentence about another topic, and what that topic is.
  var EXAM_OFF = {
    'question-3b': { topic: 'how sedimentary rocks form', words: [['volcan', 'volcanoes'], ['magma', 'volcanoes'], ['lava', 'volcanoes'], ['earthquake', 'earthquakes'], ['granite', 'igneous rock'], ['basalt', 'igneous rock'], ['igneous', 'igneous rock'], ['marble', 'metamorphic rock'], ['slate', 'metamorphic rock'], ['metamorphic', 'metamorphic rock']] },
    'question-3c': { topic: 'predicting earthquakes and reducing their effects', words: [['volcan', 'volcanoes'], ['magma', 'volcanoes'], ['lava', 'volcanoes'], ['erupt', 'volcanoes'], ['fold mountain', 'fold mountains'], ['subduct', 'how plates move'], ['convection', 'how plates move'], ['sediment', 'rocks']] }
  };
  var EXAM_SAYS = {
    ok: ['Fine. Two marks. Don\'t get used to it.', 'Hmph. Specific. I\'ll allow it.', 'Correct, relevant, specific. Two marks.', 'Well, well. That\'s actually an SRP.', 'Good. That one counts.'],
    two: 'Two points in one go? Fine. Four marks.',
    other: 'Not what I asked for. But it\'s valid, so I have to give it to you.',
    surplus: 'You already have marks for that! I don\'t pay twice.',
    short: 'That\'s not a sentence! Notes don\'t get marks.',
    wrong: 'Incorrect. Wrong. No.',
    off: 'NOT RELEVANT. Answer the question asked!',
    vague: 'Vague! What does it actually DO?',
    none: 'No marks for that. None.',
    lost: 'NO. Here\'s what would have got it.',
    hello: 'Impress me.',
    good: 'Hmph. Not bad. Not bad at all.',
    bad: 'Disappointing. Come back when you\'ve studied.',
    done: 'Nothing left to correct. I\'m... impressed.'
  };
  // His mood: ok while he asks, happy when you earn marks, angry when you don't, furious when you run out of tries.
  function examMood(card, mood) {
    card.querySelectorAll('.am-exam__face').forEach(function (f) {
      f.setAttribute('data-mood', mood);
      if (!reduced()) { f.classList.remove('is-react'); void f.offsetWidth; f.classList.add('is-react'); }
    });
  }
  var GREEN_TICK = '<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M8 34L22 6M26 34L40 6"/></svg>';
  function examBank() { try { return JSON.parse(store('am-bank-' + state.id) || '{}') || {}; } catch (err) { return {}; } }
  function examSlots() { return planItems(); }
  // The banked sentences in essay order, each once (one sentence can earn two points).
  function examEssay(bank, skip) {
    var seen = {};
    return examSlots().filter(function (it) {
      var text = bank[it.id];
      if (!text || seen[text] || (skip && skip[it.id])) return false;
      seen[text] = true;
      return true;
    }).map(function (it) { return { id: it.id, text: bank[it.id] }; });
  }
  function examMarks(bank) {
    var ids = Object.keys(bank).filter(function (id) { return pointById(id); });
    return marksFor(ids, Object.keys(bank).map(function (id) { return bank[id]; }).join(' '));
  }
  function openExaminer() {
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var card = el('div', 'am-finish am-exam');
    card.innerHTML = '<div class="am-finish__card am-exam__card" role="dialog" aria-label="Beat the Examiner">' +
      '<div class="am-run__hud">' +
        '<button type="button" class="am-run__quit" data-am-keep aria-label="Stop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="am-exam__map" data-am-emap aria-hidden="true"></div>' +
        '<div class="am-run__score"><b data-am-emarks>0</b><span>/30</span></div></div>' +
      '<div class="am-exam__body" data-am-ebody></div>' +
      '<div class="am-finish__buttons am-exam__btns" data-am-ebtns></div></div>';
    state.exam = { round: [], i: 0, beaten: 0, banked: [] };
    showCard(card);
    examMap(card, false);
    examIntro(card);
  }
  // The essay map: one slot per point of the plan, filled as points are banked.
  function examMap(card, popId) {
    var bank = examBank(), slots = examSlots(), box = card.querySelector('[data-am-emap]');
    box.innerHTML = slots.map(function (it) {
      return '<i class="' + (bank[it.id] ? 'is-on' : '') + (it.id === popId ? ' am-exam__pop' : '') + '" title="' + esc(it.title) + '"></i>';
    }).join('');
    rollTo(card.querySelector('[data-am-emarks]'), examMarks(bank).marks);
  }
  function examIntro(card) {
    var bank = examBank(), slots = examSlots(), n = slots.filter(function (it) { return bank[it.id]; }).length;
    card.querySelector('[data-am-ebody]').innerHTML = '<div class="am-exam__intro">' +
      '<div class="am-exam__face am-exam__face--big" aria-hidden="true">' + EXAMINER_FACE + '</div>' +
      '<p class="am-exam__line">“' + EXAM_SAYS.hello + '”</p><h3 class="am-exam__title">Beat the Examiner</h3>' +
      '<p>He asks for one point at a time. Write it in one sentence. He only ticks it if it\'s <b>specific</b>, <b>correct</b> and <b>about the question</b>.</p>' +
      '<p>If he says no, fix it. Every point you get past him goes into your essay. All ' + slots.length + ' and you\'ve written a full-marks answer.</p>' +
      (n ? '<p class="am-exam__note">Your essay so far: ' + n + ' of ' + slots.length + ' points, ' + examMarks(bank).marks + '/30.</p>' : '') + '</div>';
    var left = slots.filter(function (it) { return !bank[it.id]; }).length;
    fillButtons(card.querySelector('[data-am-ebtns]'), left ? [['more', 'data-am-keep', 'Back to writing'], ['ok', 'data-am-estart', n ? 'Keep going' : 'Start']]
      : [['more', 'data-am-ereset', 'Start a new essay'], ['ok', 'data-am-elines', 'Put my essay on my lines']]);
    examMood(card, 'ok');
  }
  // A round is the next few points of the plan you haven't banked yet, in essay order.
  function examRound(card) {
    var bank = examBank();
    state.exam = { round: examSlots().filter(function (it) { return !bank[it.id]; }).slice(0, EXAM_ROUND), i: 0, beaten: 0, banked: [] };
    examAsk(card);
  }
  function examAsk(card) {
    var x = state.exam, it = x.round[x.i];
    x.tries = 0;
    x.done = false;
    card.querySelector('[data-am-ebody]').innerHTML = '<div class="am-exam__desk">' +
      '<div class="am-exam__who"><div class="am-exam__face" aria-hidden="true">' + EXAMINER_FACE + '</div>' +
        '<div class="am-exam__bubble"><span class="am-exam__k">Point ' + (x.i + 1) + ' of ' + x.round.length + ' &middot; ' + esc(it.title) + '</span>' +
        '<p class="am-exam__ask" id="am-exam-ask">' + esc(it.ask) + '</p></div></div>' +
      '<div class="am-exam__paper"><textarea class="am-exam__box" rows="3" spellcheck="true" aria-labelledby="am-exam-ask" placeholder="Write one sentence…"></textarea>' +
        '<div class="am-exam__mark" data-am-emark aria-hidden="true"></div></div>' +
      '<div class="am-exam__tries" aria-hidden="true">' + new Array(EXAM_TRIES + 1).join('<i></i>') + '</div>' +
      '<p class="am-exam__says" data-am-esays role="status"></p></div>';
    fillButtons(card.querySelector('[data-am-ebtns]'), [['more', 'data-am-ehelp', 'Teach me first'], ['ok', 'data-am-ehand', 'Hand it in']], true);
    var box = card.querySelector('.am-exam__box');
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); examJudge(card); } });
    box.focus({ preventScroll: true });
    examMood(card, 'ok');
    if (!reduced()) { var desk = card.querySelector('.am-exam__desk'); desk.classList.add('am-run__in'); }
  }
  // What the examiner makes of a sentence: { ids: SRPs it earns, note: green-pen note, say: his line, why: the reason in plain words }.
  function examVerdict(it, text) {
    var x = state.exam, bank = examBank(), q = state.q, low = ' ' + text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    var words = text.split(/\s+/).filter(Boolean).length;
    if (words < MIN_WORDS) return { note: 'Full sentence?', say: EXAM_SAYS.short, why: 'An examiner can only credit a sentence that says something. Write the whole point out.' };
    if (it.id === '_named') {
      if (namesRocks(text)) return { ids: ['_named'], note: '', say: 'Two sedimentary rocks named. Two marks each.' };
      var wrongRock = EXAM_OFF[state.id].words.filter(function (w) { return low.indexOf(' ' + w[0]) >= 0; })[0];
      return { note: wrongRock ? 'Not sedimentary' : 'Name two', say: wrongRock ? EXAM_SAYS.wrong : EXAM_SAYS.none,
        why: wrongRock ? 'That\'s ' + wrongRock[1] + '. Sedimentary rocks are ones like sandstone, limestone and shale.' : 'Name two sedimentary rocks in the sentence, for example sandstone and limestone.' };
    }
    var hits = [], near = null;
    evaluate(q, text, always).forEach(function (s) {
      s.hits.forEach(function (p) { if (hits.indexOf(p.id) < 0) hits.push(p.id); });
      if (!near && s.near) near = s.near;
    });
    var fresh = hits.filter(function (id) { return !bank[id]; });
    if (fresh.indexOf(it.id) >= 0) fresh = [it.id].concat(fresh.filter(function (id) { return id !== it.id; }));
    if (fresh.length) {
      fresh = fresh.slice(0, 2);
      return { ids: fresh, note: '', say: fresh.length > 1 ? EXAM_SAYS.two : fresh[0] === it.id ? pick(EXAM_SAYS.ok) : EXAM_SAYS.other,
        why: fresh[0] !== it.id ? 'It earns marks for "' + pointById(fresh[0]).label + '". He\'ll still ask for the one he wanted later.' : '' };
    }
    if (hits.length) return { note: 'Surplus', say: EXAM_SAYS.surplus, why: 'Your essay already has a mark for "' + pointById(hits[0]).label + '". The same point only counts once, so say something new.' };
    var T = TEACH[it.id];
    var wrong = T && (T.rej || []).filter(function (r) { return low.indexOf(r) >= 0; })[0];
    if (wrong) return { note: 'Incorrect', say: EXAM_SAYS.wrong, why: T.why };
    var off = EXAM_OFF[state.id].words.filter(function (w) { return low.indexOf(' ' + w[0]) >= 0; })[0];
    if (off) return { note: 'Not relevant', say: EXAM_SAYS.off, why: 'That\'s about ' + off[1] + '. The question is about ' + EXAM_OFF[state.id].topic + ', so it can\'t earn marks here.' };
    if (near) return { note: 'Vague', say: EXAM_SAYS.vague, why: 'That\'s heading towards "' + esc(near.label) + '", but it isn\'t explained yet. Say what it does or why it matters.' };
    return { note: '?', say: EXAM_SAYS.none, why: T && T.hint ? 'Hint: ' + T.hint : 'Say exactly what happens, and how or why.' };
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function examJudge(card) {
    var x = state.exam, it = x.round[x.i], box = card.querySelector('.am-exam__box');
    if (x.done) return;
    var text = box.value.trim().replace(/\s+/g, ' ');
    var says = card.querySelector('[data-am-esays]');
    if (!text) { says.textContent = 'Write your sentence first.'; box.focus(); return; }
    if (!/[.!?]$/.test(text)) text += '.';
    var v = examVerdict(it, text), mark = card.querySelector('[data-am-emark]');
    mark.className = 'am-exam__mark';
    void mark.offsetWidth;
    if (v.ids) {
      x.done = true;
      // The gain comes from the official marks before and after, so naming marks, second references
      // and caps all count the way the marking scheme counts them.
      var bank = examBank(), before = examMarks(bank);
      v.ids.forEach(function (id) { bank[id] = text.charAt(0).toUpperCase() + text.slice(1); x.banked.push(id); });
      store('am-bank-' + state.id, JSON.stringify(bank));
      var after = examMarks(bank), gain = after.marks - before.marks;
      if (gain <= 0) { v.say = 'Valid, but it adds no marks yet.'; v.why = after.note || 'This part of the question has already earned all it can.'; }
      else if (gain > 2 && it.id !== '_named') {
        // Say where the marks came from: SRPs, and the marks for a first mention of each side.
        var srps = after.srps - before.srps, mention = (after.marks - after.srps * 2) - (before.marks - before.srps * 2), parts = [];
        if (srps) parts.push(srps === 1 ? '1 SRP' : srps + ' SRPs');
        if (mention > 0) parts.push(mention + ' for your first ' + (pointById(v.ids[0]).side === 'r' ? 'way to reduce the effects' : 'way to predict'));
        v.say = gain + ' marks: ' + parts.join(' and ') + '.';
      }
      if (v.ids.indexOf(it.id) >= 0) x.beaten += 1;
      mark.innerHTML = GREEN_TICK + '<span>+' + Math.max(0, gain) + '</span>';
      mark.classList.add('am-exam__mark--ok');
      box.readOnly = true;
      card.querySelector('.am-exam__paper').classList.add('is-ticked');
      says.innerHTML = '<b>' + esc(v.say) + '</b>' + (v.why ? ' <span>' + v.why + '</span>' : '');
      ding(x.banked.length - 1, v.ids.length > 1);
      examMood(card, gain > 0 ? 'happy' : 'ok');
      examMap(card, v.ids[0]);
      var stillWanted = v.ids.indexOf(it.id) < 0;
      if (stillWanted) x.round.splice(x.i + 1, 0, it);
      fillButtons(card.querySelector('[data-am-ebtns]'), [['ok', 'data-am-enext', x.i + 1 >= x.round.length ? 'See my essay' : 'Next point']]);
      return;
    }
    x.tries += 1;
    var dots = card.querySelectorAll('.am-exam__tries i');
    for (var k = 0; k < x.tries && k < dots.length; k++) dots[k].className = 'is-used';
    mark.innerHTML = '<span>' + esc(v.note) + '</span>';
    mark.classList.add('am-exam__mark--no');
    bonk();
    examMood(card, x.tries >= EXAM_TRIES ? 'furious' : 'angry');
    var paper = card.querySelector('.am-exam__paper');
    if (!reduced()) { paper.classList.remove('am-shake'); void paper.offsetWidth; paper.classList.add('am-shake'); }
    if (x.tries >= EXAM_TRIES) {
      x.done = true;
      box.readOnly = true;
      says.innerHTML = '<b>' + esc(EXAM_SAYS.lost) + '</b><span class="am-exam__model">' + examVersion(it.id === '_named' ? '_named' : it.id) + '</span>';
      fillButtons(card.querySelector('[data-am-ebtns]'), [['ok', 'data-am-enext', x.i + 1 >= x.round.length ? 'See my essay' : 'Next point']]);
      return;
    }
    says.innerHTML = '<b>' + esc(v.say) + '</b> <span>' + v.why + '</span> <em>Fix it and hand it in again (' + (EXAM_TRIES - x.tries) + (EXAM_TRIES - x.tries === 1 ? ' try' : ' tries') + ' left).</em>';
    box.focus();
  }
  // "Teach me first": the plan's explanation of the point, before you try it.
  function examHelp(card) {
    var x = state.exam, it = x.round[x.i], says = card.querySelector('[data-am-esays]');
    says.innerHTML = '<span class="am-exam__teach"><b>' + esc(it.title) + ':</b> ' + esc(it.why) + '</span>';
    card.querySelector('[data-am-ehelp]').remove();
    card.querySelector('.am-exam__box').focus();
  }
  function examNext(card) {
    var x = state.exam;
    x.i += 1;
    if (x.i >= x.round.length) examEnd(card); else examAsk(card);
  }
  function examEnd(card) {
    var x = state.exam, bank = examBank(), slots = examSlots(), o = examMarks(bank);
    var n = slots.filter(function (it) { return bank[it.id]; }).length, done = n >= slots.length, pleased = done || x.beaten * 2 >= x.round.length;
    card.querySelector('[data-am-ebody]').innerHTML = '<div class="am-exam__end">' +
      '<div class="am-exam__face am-exam__face--big" aria-hidden="true">' + EXAMINER_FACE + '</div>' +
      '<p class="am-exam__line">“' + (done ? EXAM_SAYS.done : pleased ? EXAM_SAYS.good : EXAM_SAYS.bad) + '”</p>' +
      '<h3 class="am-exam__title">' + (done ? 'Full essay. He has nothing left to say.' : 'You beat him ' + x.beaten + ' of ' + x.round.length + ' times') + '</h3>' +
      '<p class="am-exam__sum">Your essay: <b>' + n + ' of ' + slots.length + '</b> points, <b>' + o.marks + '/30</b></p>' +
      '<ol class="am-exam__essay">' + examEssay(bank).map(function (e) {
        return '<li' + (x.banked.indexOf(e.id) >= 0 ? ' class="is-new"' : '') + '>' + esc(e.text) + '</li>';
      }).join('') + '</ol></div>';
    var btns = [['more', 'data-am-keep', 'Back to writing']];
    if (n) btns.push(['more', 'data-am-elines', 'Put it on my lines']);
    btns.push(done ? ['ok', 'data-am-ereset', 'New essay'] : ['ok', 'data-am-estart', 'Next 5 points']);
    fillButtons(card.querySelector('[data-am-ebtns]'), btns);
    updateTrainTile();
    examMood(card, pleased ? 'happy' : 'angry');
    if (done) later(fanfare, 300);
  }
  // Your banked sentences go onto the answer lines in the order of the plan, except points the answer
  // already makes (they would only be surplus).
  function examToLines() {
    var answer = fullText(), have = {};
    evaluate(state.q, answer, always).forEach(function (s) { s.hits.forEach(function (p) { have[p.id] = true; }); });
    if (namesRocks(answer)) have._named = true;
    var text = examEssay(examBank(), have).map(function (e) { return e.text; }).join(' ');
    closeCard();
    if (text) appendToAnswer(text);
  }
  function examReset(card) {
    store('am-bank-' + state.id, '{}');
    examMap(card, false);
    updateTrainTile();
    examRound(card);
  }
  // The examiner: a grumpy, slightly ugly cartoon whose face follows his mood (data-mood on .am-exam__face):
  // m-ok, m-happy and m-angry parts swap in, the skin reddens when he's angry, and steam (x-steam) shows
  // when he's furious.
  var EXAMINER_FACE = '<svg viewBox="0 0 100 100"> <g class="x-steam"><circle cx="9" cy="40" r="4.5"/><circle cx="5" cy="30" r="3.5"/><circle cx="91" cy="40" r="4.5"/><circle cx="95" cy="30" r="3.5"/></g> <g stroke="#7A4A35" stroke-width="2.2"><ellipse cx="15" cy="54" rx="8" ry="11" fill="#E9B48C"/><ellipse cx="85" cy="54" rx="8" ry="11" fill="#E9B48C"/></g> <path d="M11 52q4-3 6 2M89 52q-4-3-6 2" fill="none" stroke="#7A4A35" stroke-width="1.6"/> <path d="M12 49l-5-3M12 52l-6 0M88 49l5-3M88 52l6 0" stroke="#5E6F8A" stroke-width="1.3" stroke-linecap="round"/> <path class="x-skin" d="M50 11C73 11 84 27 84 50C84 74 73 91 50 91C27 91 16 74 16 50C16 27 27 11 50 11Z" fill="#F2C9A0" stroke="#7A4A35" stroke-width="2.4"/> <path d="M35 87q15 8 30 0" fill="none" stroke="#7A4A35" stroke-width="1.8" stroke-linecap="round"/> <g fill="#B08A72"><circle cx="34" cy="80" r=".8"/><circle cx="38" cy="84" r=".8"/><circle cx="43" cy="86" r=".8"/><circle cx="57" cy="86" r=".8"/><circle cx="62" cy="84" r=".8"/><circle cx="66" cy="80" r=".8"/><circle cx="40" cy="80" r=".8"/><circle cx="60" cy="80" r=".8"/><circle cx="50" cy="87" r=".8"/></g> <path d="M18 46q-3-15 8-23q-2 9 3 13zM82 46q3-15-8-23q2 9-3 13z" fill="#9AA3B2"/> <path d="M23 31Q45 15 75 24M26 35Q48 21 77 30M31 27Q50 13 70 18" fill="none" stroke="#5E6F8A" stroke-width="1.9" stroke-linecap="round"/> <path class="x-lines" d="M40 30q10-3 20 0M42 34q8-2 16 0" fill="none" stroke="#C99778" stroke-width="1.3" stroke-linecap="round"/> <g class="m-ok" stroke="#2E2A2A" stroke-width="4.2" stroke-linecap="round" fill="none"><path d="M28 37q8-9 17-4"/><path d="M55 37h17"/></g> <g class="m-happy" stroke="#2E2A2A" stroke-width="4.2" stroke-linecap="round" fill="none"><path d="M28 36q8-7 17-2"/><path d="M55 34q9-5 17 2"/></g> <g class="m-angry" stroke="#2E2A2A" stroke-width="4.6" stroke-linecap="round" fill="none"><path d="M27 33L47 41"/><path d="M73 33L53 41"/></g> <g stroke="#1E1E24" stroke-width="3.4" fill="#FDFDF8"><circle cx="38" cy="48" r="10"/><circle cx="62" cy="48" r="10"/></g> <path d="M48 47q2-2.5 4 0M28 47L19 45M72 47L81 45" fill="none" stroke="#1E1E24" stroke-width="3"/> <g class="m-ok x-eyes" fill="#1E1E24"><circle cx="39" cy="49" r="2.4"/><circle cx="61" cy="48.5" r="3.2"/></g> <g class="m-happy" fill="none" stroke="#1E1E24" stroke-width="2.4" stroke-linecap="round"><path d="M34 50q4-5 8 0M57 50q4-5 8 0"/></g> <g class="m-angry"><g fill="#1E1E24"><circle cx="40" cy="50" r="2"/><circle cx="60" cy="50" r="2"/></g><path d="M30 45L46 48M70 45L54 48" stroke="#1E1E24" stroke-width="2.4" stroke-linecap="round"/></g> <path d="M50 51q-10 12-6 19q6 5 12 0q4-7-6-19z" fill="#E8A07E" stroke="#7A4A35" stroke-width="2"/> <g fill="#7A4A35"><circle cx="46.5" cy="68" r="1.3"/><circle cx="53.5" cy="68" r="1.3"/></g> <circle cx="55.5" cy="62" r="2.1" fill="#8B5E46"/><path d="M55.5 60.5l1.5-4.5M55.5 60.5l-.8-3.8" stroke="#1E1E24" stroke-width=".8" stroke-linecap="round"/> <circle cx="30" cy="66" r="1.9" fill="#6B4436"/> <g class="m-ok"><path d="M37 78q12-2 25 1.5" fill="none" stroke="#5A2A24" stroke-width="3" stroke-linecap="round"/></g> <g class="m-happy"><path d="M33 72q17 16 34 0z" fill="#5A1E24" stroke="#5A2A24" stroke-width="2" stroke-linejoin="round"/><path d="M37 72.5h26l-1 3.5h-24z" fill="#FFF3C4"/><path d="M45 72.5v3.4M53 72.5v3.4" stroke="#5A1E24" stroke-width="1.6"/><rect x="48.4" y="72.5" width="2.2" height="3.5" fill="#E2B33C"/><ellipse cx="27" cy="63" rx="5" ry="3" fill="#F2948C"/><ellipse cx="73" cy="63" rx="5" ry="3" fill="#F2948C"/></g> <g class="m-angry"><path d="M32 85q18-20 36 0q-18-7-36 0z" fill="#5A1E24" stroke="#5A2A24" stroke-width="2" stroke-linejoin="round"/><path d="M38 78.5q12-6.5 24 0" fill="none" stroke="#FFF3C4" stroke-width="2.6"/><path d="M66 13v4h-4M71 13v4h4M66 23v-4h-4M71 23v-4h4" fill="none" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g> <path d="M84 97l12-13" stroke="#2BC46F" stroke-width="5" stroke-linecap="round"/><path d="M96 84l2-2" stroke="#1E9A55" stroke-width="5" stroke-linecap="round"/> </svg>';

  // ---------- The examiner, watching: his head rises from the bottom corner during every activity ----------
  // and reacts to what you do: happy when you get it right, angry when you don't, furious when you run out
  // of hearts or time. Beat the Examiner already has him in the card, so there he stays down.
  var MASCOT = {
    right: ['Hmph. Correct.', 'Fine.', 'Not bad.', 'Lucky guess?', 'Correct. Don\'t get cocky.'],
    hot: ['Hmph. You\'re on a roll.', 'Fine, fine. Keep going.', 'Who taught you that? Not me.'],
    wrong: ['Wrong!', 'No!', 'Did you even study?', 'Read the question!', 'Nope.']
  };
  function mascotEl() {
    var m = state.root.querySelector('.am-mascot');
    if (!m) {
      m = el('div', 'am-mascot', '<p class="am-mascot__say" data-am-msay></p><div class="am-exam__face am-mascot__face" data-mood="ok">' + EXAMINER_FACE + '</div>');
      m.setAttribute('aria-hidden', 'true');
      state.root.appendChild(m);
    }
    return m;
  }
  function mascot(mood, line) {
    if (!state) return;
    var m = mascotEl(), face = m.querySelector('.am-mascot__face'), say = m.querySelector('[data-am-msay]');
    face.setAttribute('data-mood', mood);
    if (!reduced()) { face.classList.remove('is-react'); void face.offsetWidth; face.classList.add('is-react'); }
    clearTimeout(m.sayTimer);
    // No bubble while he's hidden (on phones there's no room beside the card).
    if (!line || !m.classList.contains('is-on')) return;
    say.textContent = line;
    say.classList.remove('is-on');
    void say.offsetWidth;
    say.classList.add('is-on');
    m.sayTimer = setTimeout(function () { say.classList.remove('is-on'); }, 2800);
  }
  // He only comes up beside an open card, sized to the space left next to it.
  function placeMascot() {
    var m = mascotEl(), card = state.root.querySelector('.am-finish'), box = card && card.querySelector('.am-finish__card');
    // offsetWidth, not the on-screen size: the card pops in from a small scale.
    var room = box ? (state.root.clientWidth - box.offsetWidth) / 2 - 24 : 0;
    var size = Math.min(220, room);
    var show = Boolean(box) && !card.classList.contains('am-exam') && size >= 110;
    if (show) m.style.setProperty('--size', Math.round(size) + 'px');
    var arriving = show && !m.classList.contains('is-on');
    m.classList.toggle('is-on', show);
    if (arriving) mascot('ok', card.classList.contains('am-teach') ? 'Stuck? Typical. Fine, I\'ll explain.' : card.classList.contains('am-dump') ? 'Everything you know. Go.' : card.classList.contains('am-games') ? 'Games? In my day we had textbooks.' : '');
    if (!show) m.querySelector('[data-am-msay]').classList.remove('is-on');
  }

  // ---------- Mini games: short games that each train one thing examiners reward ----------
  // Chain reaction: put a process in order, then read it as one "because... so..." explanation.
  // Level up: grow one bare SRP into three (development, then an example, place or number), avoiding
  // the traps (filler, off-question, vague, wrong). Be the examiner: mark a made-up student's answer.
  // Each trap in Level up has a type: f = filler, o = off the question, v = vague, w = wrong (with why).
  // A Level up point shows its picture from the guide (TEACH[id].pic, or its own pic).
  var GAMES = {
    'question-3b': {
      student: 'Ciarán',
      chains: [
        { title: 'How sandstone forms', steps: ['Rain and frost break up older rock', 'Rivers carry the sand grains away', 'The river slows and drops the sand', 'Layers (strata) build up on the sea bed', 'The weight of new layers squeezes them (compaction)', 'Minerals glue the grains together (cementation)'],
          why: 'Older rock is <b>weathered</b>, so rivers can <b>carry</b> the grains away. When a river slows it <b>deposits</b> them in <b>layers</b>; the weight of new layers <b>compacts</b> them and minerals <b>cement</b> them into sandstone.' },
        { title: 'How limestone forms', steps: ['Sea creatures live in warm, shallow seas', 'They die and their shells sink', 'Shells pile up on the sea floor', 'New layers bury and squeeze them', 'Calcium carbonate cements them together', 'Limestone forms, often with fossils'],
          why: 'Sea creatures in <b>warm, shallow seas</b> die and their shells <b>sink</b> and <b>pile up</b>. Buried under new layers, they are <b>compacted</b> and cemented by <b>calcium carbonate</b> into limestone, often keeping <b>fossils</b>.' },
        { title: 'Old Red Sandstone', steps: ['Ireland lay in a hot desert', 'Rivers dropped sand in desert basins', 'Iron in the sand rusted red', 'The sand was compacted and cemented', 'Old Red Sandstone formed about 400 million years ago'],
          why: 'About 400 million years ago Ireland was a <b>hot desert</b>. Rivers dropped sand in basins, <b>iron</b> in it <b>rusted</b> and stained it red, and the sand was <b>compacted and cemented</b> into Old Red Sandstone.' },
        { title: 'From sea bed to mountain', steps: ['Sediment settles on the sea bed', 'Layers are compacted and cemented into rock', 'Plates collide and fold the rock layers', 'The rock is uplifted above sea level', 'Weathering and erosion expose it at the surface'],
          why: 'Sediment <b>settles</b> under the sea and becomes rock. Later, <b>plate collisions fold</b> the layers and <b>uplift</b> them, and <b>weathering and erosion</b> expose them, which is why we see sedimentary rock in mountains.' }
      ],
      level: [
        { id: 'weather', pic: 'Sandstone', statement: 'Sandstone is made from grains of sand.',
          steps: [
            [['The grains come from older rocks like granite, broken down by weathering such as frost action.'], ['Sand is something you can find on beaches and in deserts.', 'f'], ['Granite forms when magma cools slowly underground.', 'o']],
            [['For example, the Old Red Sandstone of the MacGillycuddy\'s Reeks in Co. Kerry formed from sand worn off older mountains.'], ['For example, there is sandstone in lots of places in Ireland.', 'v'], ['For example, the Burren in Co. Clare is made of sandstone.', 'w', 'The Burren is limestone. Sandstone examples are in Munster, like the MacGillycuddy\'s Reeks.']]
          ] },
        { id: 'compact', statement: 'The sand is deposited in layers.',
          steps: [
            [['As more layers pile on top, their weight squeezes the grains together and pushes out the water (compaction).'], ['Layers are very common in geography.', 'f'], ['Lava builds up in layers on the sides of a volcano.', 'o']],
            [['This takes millions of years: Irish Old Red Sandstone formed around 400 million years ago.'], ['This takes a really long time.', 'v'], ['This process only takes a few years.', 'w', 'It takes millions of years, not a few.']]
          ] },
        { id: 'cement', statement: 'The grains are then cemented together.',
          steps: [
            [['Minerals such as silica and calcite, carried by water seeping through, glue the grains into solid rock.'], ['Cement is used to build houses and walls.', 'f'], ['Marble forms when limestone is heated and squeezed.', 'o']],
            [['In Old Red Sandstone, iron oxide (rust) coats the grains, which gives the rock its red colour.'], ['This makes the rock very strong.', 'v'], ['The red colour comes from red sea creatures in the sand.', 'w', 'The red comes from iron oxide (rust), formed in hot desert conditions.']]
          ] },
        { id: 'limestone', statement: 'Limestone forms from the remains of sea creatures.',
          steps: [
            [['Their shells and skeletons, made of calcium carbonate, pile up on the sea floor and are compacted and cemented.'], ['Sea creatures are very interesting animals.', 'f'], ['Basalt forms when lava cools quickly.', 'o']],
            [['This happened in warm, shallow seas about 350 million years ago, when Ireland lay near the equator.'], ['This happened a long time ago in the sea.', 'v'], ['This happened in freezing seas near the North Pole.', 'w', 'Irish limestone formed in warm, shallow seas near the equator.']]
          ] },
        { id: 'fossils', pic: 'Limestone', statement: 'Limestone often contains fossils.',
          steps: [
            [['Shells and corals trapped in the layers are preserved, so their shapes can still be seen in the rock.'], ['Fossils are very old and can be seen in museums.', 'f'], ['Dinosaurs lived millions of years ago.', 'o']],
            [['For example, fossil corals and shells can be found in the limestone of the Burren in Co. Clare.'], ['For example, you can find fossils in Ireland.', 'v'], ['For example, fossils are found in the granite of the Wicklow Mountains.', 'w', 'Granite is igneous: it cooled from magma, so it has no fossils.']]
          ] }
      ],
      // Be the examiner: [a sentence that earns an SRP, the same point again in other words, the point].
      repeats: [['The layers at the bottom are compressed by the weight above them.', 'The weight of the sediment on top squeezes the layers underneath.', 'Compaction'],
        ['Minerals in the water cement the particles together.', 'The grains are glued together by minerals such as silica.', 'Cementation'],
        ['Limestone formed from the shells of dead sea creatures.', 'Limestone is made up of the remains of sea animals like shells.', 'Limestone from shells'],
        ['When rivers lose energy they deposit their load in layers.', 'The river drops its sediment in layers when it slows down.', 'Deposition in layers'],
        ['The sediment is carried by the river current to the sea.', 'Rivers transport the sediment down to the sea.', 'Transport'],
        ['Mechanical weathering like frost shattering breaks the rock into fragments.', 'Freeze-thaw weathering breaks rocks up into small pieces.', 'Weathering']],
      off: ['Granite forms when magma cools slowly deep underground.', 'Volcanoes erupt where plates pull apart.', 'The Giant\'s Causeway is made of basalt columns.'],
      wrong: [['Limestone is formed when lava cools on the sea floor.', 'Lava makes igneous rock. Limestone forms from shells and skeletons of sea creatures.'], ['Sandstone is made from the shells of sea creatures.', 'That\'s limestone. Sandstone is made of sand grains.'], ['Sedimentary rocks form in just a few weeks.', 'They take millions of years to form.']]
    },
    'question-3c': {
      student: 'Aoife',
      chains: [
        { title: 'Why an earthquake happens', steps: ['Plates push against each other', 'Friction locks them together at the fault', 'Stress builds up over many years', 'The rocks suddenly snap and slip', 'Energy travels out as seismic waves'],
          why: 'Plates <b>push</b> against each other, but <b>friction</b> locks them, so <b>stress builds</b>. When the rocks finally <b>snap</b>, the stored energy travels out as <b>seismic waves</b>. That build-up is what prediction tries to spot.' },
        { title: 'Radon as a warning sign', steps: ['Stress builds up along a fault', 'Rocks begin to crack under the strain', 'Radon gas escapes through the cracks', 'Radon levels rise in well water', 'Scientists measure the rise and warn people'],
          why: '<b>Stress</b> makes the rocks <b>crack</b>, so <b>radon gas</b> escapes into groundwater. A rise in radon in <b>wells</b> can be measured, which may <b>warn</b> that an earthquake is coming.' },
        { title: 'An early warning system', steps: ['The earthquake starts deep underground', 'Sensors detect the first, faster waves', 'Alerts are sent to phones and trains', 'Trains brake and people take cover', 'The strong shaking arrives seconds later'],
          why: 'The <b>first waves</b> travel faster than the damaging ones, so <b>sensors</b> pick them up and send <b>alerts</b>. That buys a few <b>seconds</b> for trains to brake and people to take cover <b>before</b> the strong shaking.' },
        { title: 'A base-isolated building', steps: ['The ground starts to shake', 'Rubber pads under the building flex', 'They absorb most of the movement', 'The building above sways gently', 'It stays standing and people are safe'],
          why: 'When the ground <b>shakes</b>, <b>rubber pads</b> (base isolators) flex and <b>absorb</b> the movement, so the building above only <b>sways gently</b> and <b>stays standing</b>.' }
      ],
      level: [
        { id: 'seismo', statement: 'Seismographs record vibrations in the ground.',
          steps: [
            [['They pick up small tremors called foreshocks, which can come before a big earthquake.'], ['This is a very important and useful job for scientists.', 'f'], ['Volcanoes also erupt where plates meet.', 'o']],
            [['For example, a network of seismographs monitors the San Andreas Fault in California.'], ['For example, they are used in lots of countries.', 'v'], ['For example, seismographs told scientists the exact date of the 2011 Japan earthquake.', 'w', 'No earthquake has been predicted to the exact date. Seismographs show where risk is high, not when.']]
          ] },
        { id: 'gaps', statement: 'Scientists study seismic gaps along fault lines.',
          steps: [
            [['A seismic gap is a part of a fault that hasn\'t moved for a long time, so stress is building up there.'], ['This helps them a lot with their important work.', 'f'], ['Fold mountains form where two plates collide.', 'o']],
            [['For example, the 1999 Izmit earthquake in Turkey struck a known seismic gap on the North Anatolian Fault.'], ['For example, there are gaps in many places.', 'v'], ['For example, seismic gaps tell scientists the exact hour of the next quake.', 'w', 'A gap shows where a quake is likely, not when it will happen.']]
          ] },
        { id: 'radon', statement: 'Radon gas levels are monitored in wells.',
          steps: [
            [['As stress cracks the rocks, radon escapes into groundwater, so a sudden rise can warn of an earthquake.'], ['Gas is something that can be found in lots of places.', 'f'], ['Volcanoes give off gases like sulphur dioxide.', 'o']],
            [['For example, radon in groundwater rose sharply in the months before the 1995 Kobe earthquake in Japan.'], ['For example, this has happened in some places before.', 'v'], ['For example, radon gas is what causes earthquakes.', 'w', 'Radon doesn\'t cause earthquakes. It escapes because the rocks are cracking under stress.']]
          ] },
        { id: 'build', statement: 'Buildings in earthquake zones are designed to sway.',
          steps: [
            [['A flexible steel frame bends with the shaking instead of cracking, so the building doesn\'t collapse.'], ['Buildings are very important for people to live and work in.', 'f'], ['Tall buildings are built in big cities like New York.', 'o']],
            [['For example, Taipei 101 in Taiwan has a huge steel ball near the top that steadies it as it sways.'], ['For example, lots of buildings are built like this now.', 'v'], ['For example, buildings in Japan are built completely rigid so they can\'t move at all.', 'w', 'Rigid buildings crack. Earthquake-proof buildings are designed to flex and sway.']]
          ] },
        { id: 'drills', statement: 'People take part in earthquake drills.',
          steps: [
            [['They practise "drop, cover and hold on", so they react quickly when the shaking starts.'], ['Drills are a good idea and everyone should do them.', 'f'], ['Schools hold fire drills every year.', 'o']],
            [['For example, Japan holds national earthquake drills every year on 1 September, Disaster Prevention Day.'], ['For example, they happen in some schools.', 'v'], ['For example, people are taught to run outside as soon as the shaking starts.', 'w', 'Running during shaking is dangerous. The advice is drop, cover and hold on.']]
          ] },
        { id: 'warning', statement: 'Early warning systems alert people before strong shaking.',
          steps: [
            [['Sensors detect the first, faster waves and send alerts to phones seconds before the strongest shaking arrives.'], ['Warnings are always useful for everyone.', 'f'], ['Volcanoes can be watched for swelling ground before they erupt.', 'o']],
            [['For example, Japan\'s system braked bullet trains before the strongest shaking of the 2011 Tohoku earthquake.'], ['For example, phones sometimes get messages.', 'v'], ['For example, the warnings arrive several days before the earthquake.', 'w', 'Warnings come seconds before the shaking, not days.']]
          ] }
      ],
      repeats: [['Seismographs are used to detect small movements in the crust.', 'Small vibrations in the ground are picked up by seismographs.', 'Seismographs'],
        ['A tiltmeter measures any bulging of the ground.', 'Tiltmeters are used to detect the ground bulging upwards.', 'Tiltmeters'],
        ['Schools hold earthquake drills so students know what to do.', 'Students practise earthquake drills in school so they know how to react.', 'Drills'],
        ['A series of small tremors may come before a larger earthquake.', 'Small foreshocks often happen before a big earthquake.', 'Foreshocks']],
      off: ['Volcanoes erupt when magma rises through the crust.', 'Fold mountains like the Andes form where plates collide.', 'The Burren in Co. Clare is made of limestone.'],
      wrong: [['Scientists can predict the exact day and hour of an earthquake.', 'They can say where one is likely, but not exactly when.'], ['People should run outside as soon as the shaking starts.', 'That\'s dangerous. The advice is drop, cover and hold on.'], ['Buildings should be made completely rigid so they cannot move.', 'Rigid buildings crack. Safe buildings are designed to flex and sway.']]
    }
  };
  var CHAIN_ROUND = 3, LEVEL_ROUND = 4, MARK_REAL = 5;
  // What each Level up trap is called, why it earns nothing, and what the examiner shouts.
  var GAME_TRAPS = {
    f: ['Filler', 'It sounds fine, but it adds no geography.', 'Waffle!'],
    o: ['Not relevant', 'True, but it isn\'t about this question.', 'Not relevant!'],
    v: ['Too vague', 'No name, place or number, so it can\'t earn a mark.', 'Vague!'],
    w: ['Wrong', '', 'Wrong!']
  };
  var GAME_INFO = {
    chain: { name: 'Chain reaction', what: 'Put the steps of a process in order.', unit: 'stars',
      icon: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="5" height="12" rx="1.4" fill="currentColor"/><rect x="9.5" y="7" width="5" height="12" rx="1.4" fill="currentColor" transform="rotate(14 12 19)"/><rect x="17" y="7" width="5" height="12" rx="1.4" fill="currentColor" transform="rotate(32 19.5 19)"/></svg>' },
    level: { name: 'Level up', what: 'Turn one point into three SRPs.', unit: 'right first time',
      icon: '<svg viewBox="0 0 24 24"><path d="M3 20h5v-5h5v-5h5V5h3" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    mark: { name: 'Be the examiner', what: 'Mark a student\'s answer. Spot the SRPs.', unit: 'lines right',
      icon: '<svg viewBox="0 0 24 24"><path d="M5 19L10.5 5M12 19L17.5 5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/></svg>' }
  };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7z"/></svg>';
  var CROSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SLASHES = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20L11 4M13 20L18 4"/></svg>';
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  // Best scores are kept as "score/out of" (am-chain-<id>, am-level-<id>, am-mark-<id>).
  function gameBest(kind) {
    var v = (store('am-' + kind + '-' + state.id) || '').split('/');
    return v.length === 2 && +v[1] ? { score: +v[0], out: +v[1] } : null;
  }
  function saveBest(kind, score, out) {
    var b = gameBest(kind), better = !b || score / out > b.score / b.out;
    if (better) store('am-' + kind + '-' + state.id, score + '/' + out);
    return better && Boolean(b);
  }
  function openGames() {
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var card = el('div', 'am-finish am-games');
    card.innerHTML = '<div class="am-finish__card am-games__card" role="dialog" aria-label="Mini games">' +
      '<div class="am-run__hud">' +
        '<button type="button" class="am-run__quit" data-am-keep aria-label="Stop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="am-run__segs" data-am-gsegs aria-hidden="true"></div>' +
        '<div class="am-run__score" data-am-gscorebox hidden><b data-am-gscore>0</b><span data-am-gunit></span></div></div>' +
      '<div class="am-games__body" data-am-gbody></div>' +
      '<div class="am-finish__buttons am-games__btns" data-am-gbtns></div></div>';
    card.addEventListener('keydown', gameKeys);
    showCard(card);
    gamesHub(card);
  }
  // 1-3 pick an answer in Level up.
  function gameKeys(e) {
    var x = state && state.game;
    if (!x || x.kind !== 'level' || x.done || e.altKey || e.ctrlKey || e.metaKey) return;
    var b = /^[1-3]$/.test(e.key) && e.currentTarget.querySelector('[data-am-lopt="' + (e.key - 1) + '"]');
    if (b) { e.preventDefault(); b.click(); }
  }
  // The top bar: one segment per item of the round, and the score so far.
  function gameHud(card, segs, unit) {
    card.querySelector('[data-am-gsegs]').innerHTML = new Array(segs + 1).join('<i></i>');
    card.querySelector('[data-am-gscorebox]').hidden = !unit;
    card.querySelector('[data-am-gunit]').textContent = unit || '';
    rollTo(card.querySelector('[data-am-gscore]'), 0, true);
  }
  function gameSeg(card, k, cls) {
    var seg = card.querySelectorAll('[data-am-gsegs] i')[k];
    if (seg) seg.className = cls;
  }
  function gameBody(card, html, wide) {
    var body = card.querySelector('[data-am-gbody]'), box = card.querySelector('.am-finish__card');
    body.innerHTML = html;
    // A chain with its picture needs a wider card; the examiner beside it is resized to fit.
    if (box.classList.contains('am-games__card--wide') !== Boolean(wide)) { box.classList.toggle('am-games__card--wide', Boolean(wide)); placeMascot(); }
    box.scrollTop = 0;
    if (!reduced()) body.firstChild.classList.add('am-run__in');
    else body.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
    return body;
  }
  // The pictures (mini-games-art.js): one per chain, and the students' faces.
  function gameArt() { return window.ExamGameArt || {}; }
  function gamesHub(card) {
    state.game = null;
    gameHud(card, 0, '');
    var g = GAMES[state.id];
    gameBody(card, '<div class="am-games__hub">' +
      '<h3 class="am-games__title">Mini games</h3>' +
      '<p class="am-games__sub">Quick games. Each one trains something examiners give marks for.</p>' +
      '<div class="am-games__list">' + ['chain', 'level', 'mark'].map(function (kind) {
        var info = GAME_INFO[kind], b = gameBest(kind);
        return '<button type="button" class="am-games__tile am-games__tile--' + kind + '" data-am-game="' + kind + '">' +
          '<span class="am-games__icon" aria-hidden="true">' + info.icon + '</span>' +
          '<span class="am-games__text"><b>' + info.name + '</b><span>' + (kind === 'mark' ? 'Mark ' + esc(g.student) + '\'s answer. Spot the SRPs.' : info.what) + '</span>' +
            (b ? '<em>Your best: ' + b.score + ' of ' + b.out + ' ' + info.unit + '</em>' : '') + '</span>' +
          '<i class="am-train-tile__go" aria-hidden="true"></i></button>';
      }).join('') + '</div></div>');
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-keep', 'Back to writing']], true);
    card.querySelector('[data-am-game]').focus({ preventScroll: true });
  }
  function startGame(card, kind) {
    if (kind === 'chain') chainStart(card); else if (kind === 'level') levelStart(card); else markStart(card);
  }
  // A round's end for Chain reaction and Level up.
  function gameEnd(card) {
    var x = state.game, chain = x.kind === 'chain', score = chain ? x.stars : x.right, out = x.list.length * (chain ? 3 : 2);
    var before = gameBest(x.kind), newBest = saveBest(x.kind, score, out), perfect = score === out, good = score >= out * 0.75;
    gameBody(card, '<div class="am-games__end">' +
      '<p class="am-games__big">' + score + '<span>/' + out + '</span></p>' +
      '<h3 class="am-games__title">' + (perfect ? 'Perfect!' : good ? 'Nice work!' : 'Keep practising') + '</h3>' +
      '<p class="am-games__sub">' + (chain ? '3 stars for a chain right first time, 2 for the second try.' : 'Your picks that were right first time.') +
        (newBest ? ' <b>New best!</b>' : before ? ' Your best: ' + before.score + ' of ' + before.out + '.' : '') + '</p>' +
      (chain ? '' : '<div class="am-games__built"><h4>The points you built</h4>' + x.list.map(function (it) {
        return '<p>' + esc([it.statement, it.steps[0][0][0], it.steps[1][0][0]].join(' ')) + '</p>';
      }).join('') + '<p class="am-games__built-note">Each one is a statement, a development and an example: three SRPs, 6 marks.</p></div>') + '</div>');
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-ghub', 'Mini games'], ['ok', 'data-am-gagain', 'Play again']]);
    mascot(good ? 'happy' : 'angry', perfect ? 'Perfect. I\'m almost proud.' : good ? 'Hmph. Not bad.' : 'Again. Properly this time.');
    if (perfect) later(fanfare, 300);
    updateTrainTile();
  }

  // Chain reaction: tap the steps into order. Right ones lock, wrong ones go back; then the chain falls
  // like dominoes and you read it as one "because... so..." explanation.
  function chainStart(card) {
    state.game = { kind: 'chain', list: shuffle(GAMES[state.id].chains, Date.now() % 233280).slice(0, CHAIN_ROUND), i: 0, stars: 0 };
    gameHud(card, state.game.list.length, 'stars');
    mascot('ok', 'Order matters. Like in my class.');
    chainShow(card);
  }
  function chainShow(card) {
    var x = state.game, c = x.list[x.i];
    // A starting order that isn't already the answer.
    var order = c.steps.map(function (s, k) { return k; }), seed = (Date.now() + x.i * 97) % 233280;
    do { order = shuffle(order, seed++); } while (order.every(function (v, k) { return v === k; }));
    x.pool = order;
    x.placed = c.steps.map(function () { return -1; });
    x.locked = c.steps.map(function () { return false; });
    x.tries = 0;
    x.solved = false;
    x.busy = false;
    x.shown = 0;
    gameSeg(card, x.i, 'is-current');
    var art = ((gameArt().chains || {})[state.id] || {})[c.title];
    gameBody(card, '<div class="am-order">' +
      '<div class="am-run__top"><h3 class="am-run__kind">' + esc(c.title) + '</h3><span class="am-games__step">' + (x.i + 1) + ' of ' + x.list.length + '</span></div>' +
      '<p class="am-games__ask">Tap the steps in the right order.' + (art ? ' The picture builds as they go in.' : '') + '</p>' +
      '<div class="am-order__main"><ol class="am-chain__slots" data-am-cslots></ol>' +
        (art ? '<div class="am-order__art" data-am-cart>' + art + '</div>' : '') + '</div>' +
      '<div class="am-chain__pool" data-am-cpool></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>', Boolean(art));
    chainArt(card.querySelector('[data-am-cart]'), 0);
    chainRender(card);
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-ghub', 'Mini games'], ['ok', 'data-am-ccheck', 'Check']], true);
    chainSync(card);
    card.querySelector('[data-am-ctile]').focus({ preventScroll: true });
  }
  // The picture builds up from the first step: a part shows once every step up to it is in place,
  // so it always tells the story in order.
  function chainArt(box, lv) {
    if (!box || !box.isConnected) return;
    box.querySelectorAll('[data-step],[data-badge]').forEach(function (g) { g.classList.toggle('is-on', +(g.getAttribute('data-step') || g.getAttribute('data-badge')) < lv); });
    box.querySelectorAll('[data-until]').forEach(function (g) { g.classList.toggle('is-off', +g.getAttribute('data-until') < lv); });
    box.querySelectorAll('[data-live]').forEach(function (g) { g.classList.toggle('is-live', +g.getAttribute('data-live') < lv); });
  }
  function chainLevel(x) {
    var lv = 0;
    while (lv < x.locked.length && x.locked[lv]) lv += 1;
    return lv;
  }
  function chainRender(card, fresh) {
    var x = state.game, c = x.list[x.i];
    card.querySelector('[data-am-cslots]').innerHTML = c.steps.map(function (s, k) {
      var v = x.placed[k], filled = v >= 0;
      return '<li><button type="button" class="am-chain__slot' + (x.locked[k] ? ' is-lock' : filled ? ' is-filled' : '') + (k === fresh ? ' is-in' : '') + '" data-am-cslot="' + k + '"' +
        (x.locked[k] || !filled ? ' aria-disabled="true"' : '') + '>' +
        '<span class="am-chain__n">' + (k + 1) + '</span><span class="am-chain__t">' + (filled ? esc(c.steps[v]) : '<span class="am-sr">Empty</span>') + '</span>' +
        (filled && !x.locked[k] ? '<span class="am-sr">, tap to take it out</span>' : '') + '</button></li>';
    }).join('');
    var pool = card.querySelector('[data-am-cpool]');
    if (pool) pool.innerHTML = x.pool.map(function (v) {
      return '<button type="button" class="am-chain__tile" data-am-ctile="' + v + '">' + esc(c.steps[v]) + '</button>';
    }).join('');
  }
  function chainSync(card) {
    var btn = card.querySelector('[data-am-ccheck]');
    if (btn) btn.disabled = state.game.placed.indexOf(-1) >= 0;
  }
  function chainPlace(card, v) {
    var x = state.game, k = x.placed.indexOf(-1);
    if (x.solved || x.busy || k < 0 || x.pool.indexOf(v) < 0) return;
    x.placed[k] = v;
    x.pool.splice(x.pool.indexOf(v), 1);
    chainRender(card, k);
    chainSync(card);
    var next = card.querySelector('[data-am-ctile]') || card.querySelector('[data-am-ccheck]');
    if (next) next.focus({ preventScroll: true });
  }
  function chainTakeOut(card, k) {
    var x = state.game;
    if (x.solved || x.busy || x.locked[k] || x.placed[k] < 0) return;
    x.pool.push(x.placed[k]);
    x.placed[k] = -1;
    chainRender(card);
    chainSync(card);
    card.querySelector('[data-am-ctile="' + x.pool[x.pool.length - 1] + '"]').focus({ preventScroll: true });
  }
  function chainCheck(card) {
    var x = state.game;
    if (x.solved || x.busy || x.placed.indexOf(-1) >= 0) return;
    x.tries += 1;
    var bad = [];
    x.placed.forEach(function (v, k) { if (v === k) x.locked[k] = true; else bad.push(k); });
    if (!bad.length) { chainSolved(card); return; }
    // The right ones lock green straight away; the wrong ones shake, then go back to the pool.
    x.busy = true;
    x.shown = chainLevel(x);
    chainArt(card.querySelector('[data-am-cart]'), x.shown);
    x.locked.forEach(function (on, k) { if (on) card.querySelector('[data-am-cslot="' + k + '"]').className = 'am-chain__slot is-lock'; });
    bad.forEach(function (k) {
      var s = card.querySelector('[data-am-cslot="' + k + '"]');
      s.classList.add('is-bad');
      if (!reduced()) s.classList.add('am-shake');
    });
    bonk();
    mascot('angry', pick(['Wrong order!', 'No. What causes what?', 'Not in that order!']));
    var right = x.placed.length - bad.length;
    card.querySelector('[data-am-gnote]').textContent = right ? right + ' in the right place. They stay. Try the rest again.' : 'None in the right place yet. Think: what has to happen first?';
    later(function () {
      if (state.game !== x || !card.isConnected) return;
      bad.forEach(function (k) { x.pool.push(x.placed[k]); x.placed[k] = -1; });
      x.busy = false;
      chainRender(card);
      chainSync(card);
      var tile = card.querySelector('[data-am-ctile]');
      if (tile) tile.focus({ preventScroll: true });
    }, reduced() ? 300 : 700);
  }
  function chainSolved(card) {
    var x = state.game, c = x.list[x.i], stars = x.tries === 1 ? 3 : x.tries === 2 ? 2 : 1;
    x.solved = true;
    x.stars += stars;
    chainRender(card);
    // The chain falls like dominoes, one ding per step, climbing, and the rest of the picture builds with it.
    var art = card.querySelector('[data-am-cart]');
    card.querySelectorAll('.am-chain__slot').forEach(function (s, k) {
      if (!reduced()) { s.style.animationDelay = k * 0.12 + 's'; s.classList.add('is-fall'); }
      later(function () { ding(k, k === c.steps.length - 1 && stars === 3); if (k >= x.shown) chainArt(art, k + 1); }, k * 120);
    });
    card.querySelector('[data-am-cpool]').outerHTML = '<div class="am-chain__why">' +
      '<div class="am-chain__stars" role="img" aria-label="' + stars + ' of 3 stars">' + [0, 1, 2].map(function (k) { return '<i' + (k < stars ? ' class="is-on"' : '') + '>' + STAR + '</i>'; }).join('') + '</div>' +
      '<p><b class="am-chain__say">Now say it as one explanation:</b> ' + c.why + '</p></div>';
    card.querySelector('[data-am-gnote]').textContent = stars === 3 ? 'Right first time!' : 'All in order.';
    gameSeg(card, x.i, stars === 3 ? 'is-ok' : 'is-half');
    rollTo(card.querySelector('[data-am-gscore]'), x.stars);
    mascot('happy', stars === 3 ? 'First try? Hmph. Fine.' : pick(MASCOT.right));
    fillButtons(card.querySelector('[data-am-gbtns]'), [['ok', 'data-am-cnext', x.i + 1 >= x.list.length ? 'See my score' : 'Next chain']]);
  }
  function chainNext(card) {
    var x = state.game;
    x.i += 1;
    if (x.i >= x.list.length) gameEnd(card); else chainShow(card);
  }

  // Level up: start from a bare statement (one SRP) and add a development, then an example, place or
  // number. Each step is a new fact, so a new SRP: 2, then 4, then 6 marks. The wrong picks are traps.
  var LEVEL_STEPS = [['Development', 'Add a development: which sentence explains it further?'], ['Example', 'Add an example: which one gives a real place, name or number?']];
  function levelStart(card) {
    state.game = { kind: 'level', list: shuffle(GAMES[state.id].level, Date.now() % 233280).slice(0, LEVEL_ROUND), i: 0, right: 0 };
    gameHud(card, state.game.list.length, 'right');
    mascot('ok', 'Make it worth marks.');
    levelShow(card);
  }
  function levelRow(tag, text, fresh) {
    return '<div class="am-level__row' + (fresh ? ' is-new' : '') + '"><span class="am-level__tag">' + tag + '</span><p>' + esc(text) + '</p></div>';
  }
  function levelShow(card) {
    var x = state.game, it = x.list[x.i];
    x.step = 0;
    x.clean = true;
    gameSeg(card, x.i, 'is-current');
    var pic = pictureFor(it.pic || (TEACH[it.id] && TEACH[it.id].pic));
    gameBody(card, '<div class="am-level">' +
      '<div class="am-run__top"><h3 class="am-run__kind">Level up</h3><span class="am-games__step">' + (x.i + 1) + ' of ' + x.list.length + '</span></div>' +
      '<div class="am-level__paper' + (pic ? ' has-pic' : '') + '">' + (pic ? '<div class="am-level__pic" aria-hidden="true">' + pic + '</div>' : '') +
        '<div class="am-level__rows" data-am-lrows>' + levelRow('Statement', it.statement) + '</div>' +
        '<div class="am-level__meter" aria-hidden="true"><i class="is-on">2</i><i>4</i><i>6</i><span>marks</span></div></div>' +
      '<p class="am-games__ask" data-am-lask></p>' +
      '<div class="am-run__opts" data-am-lopts></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>');
    levelStep(card);
  }
  function levelStep(card) {
    var x = state.game, it = x.list[x.i];
    x.first = true;
    x.done = false;
    x.opts = shuffle(it.steps[x.step], (Date.now() + x.step * 31) % 233280);
    card.querySelector('[data-am-lask]').innerHTML = '<b>Level ' + (x.step + 2) + '.</b> ' + LEVEL_STEPS[x.step][1];
    card.querySelector('[data-am-lopts]').innerHTML = x.opts.map(function (o, n) {
      return '<button type="button" class="am-run__opt am-level__opt" data-am-lopt="' + n + '"><kbd aria-hidden="true">' + (n + 1) + '</kbd><span>' + esc(o[0]) + '</span></button>';
    }).join('');
    card.querySelector('[data-am-gnote]').textContent = '';
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-ghub', 'Mini games']], true);
    card.querySelector('[data-am-lopt]').focus({ preventScroll: true });
  }
  function levelPick(card, n) {
    var x = state.game, o = x.opts[n], btn = card.querySelector('[data-am-lopt="' + n + '"]');
    if (x.done || !btn || btn.getAttribute('aria-disabled') === 'true') return;
    if (!o[1]) {
      x.done = true;
      if (x.first) { x.right += 1; rollTo(card.querySelector('[data-am-gscore]'), x.right); } else x.clean = false;
      btn.classList.add('am-run__opt--ok');
      card.querySelectorAll('[data-am-lopt]').forEach(function (b) { b.setAttribute('aria-disabled', 'true'); });
      card.querySelector('[data-am-lrows]').insertAdjacentHTML('beforeend', levelRow(LEVEL_STEPS[x.step][0], o[0], !reduced()));
      var pip = card.querySelectorAll('.am-level__meter i')[x.step + 1];
      pip.classList.add('is-on');
      if (!reduced()) pip.classList.add('am-bump');
      ding(x.step + 1, x.step === 1);
      mascot('happy', pick(MASCOT.right));
      var last = x.step === 1;
      card.querySelector('[data-am-gnote]').innerHTML = '<b>+2 marks.</b> ' + (last ? 'A real example: that\'s three SRPs from one point.' : 'It explains the point with a new fact, so it\'s a new SRP.');
      if (last) gameSeg(card, x.i, x.clean ? 'is-ok' : 'is-half');
      fillButtons(card.querySelector('[data-am-gbtns]'), [['ok', 'data-am-lnext', !last ? 'Next level' : x.i + 1 >= x.list.length ? 'See my score' : 'Next point']]);
      return;
    }
    // A trap: say what kind, and why it earns nothing. Pick again.
    var trap = GAME_TRAPS[o[1]];
    x.first = false;
    btn.classList.add('am-run__opt--no');
    btn.setAttribute('aria-disabled', 'true');
    btn.querySelector('span').insertAdjacentHTML('beforeend', '<small class="am-level__why"><b>' + trap[0] + '.</b> ' + esc(o[2] || trap[1]) + '</small>');
    if (!reduced()) { btn.classList.remove('am-shake'); void btn.offsetWidth; btn.classList.add('am-shake'); }
    bonk();
    mascot('angry', trap[2]);
    card.querySelector('[data-am-gnote]').textContent = 'No marks for that one. Pick again.';
  }
  function levelNext(card) {
    var x = state.game;
    if (x.step === 0) { x.step = 1; levelStep(card); return; }
    x.i += 1;
    if (x.i >= x.list.length) gameEnd(card); else levelShow(card);
  }

  // Be the examiner: a made-up student's answer, one sentence per line. You mark each line // (an SRP)
  // or X (no marks), then see what the marking scheme says. The truth comes from the marker reading the
  // whole answer in order, so a point made twice only counts the first time.
  function markEarned(lines) {
    var prev = 0;
    lines.forEach(function (l, k) {
      var ids = {};
      evaluate(state.q, lines.slice(0, k + 1).map(function (m) { return m.text; }).join(' '), always).forEach(function (s) {
        s.hits.forEach(function (p) { ids[p.id] = true; });
      });
      var n = Object.keys(ids).length;
      l.srp = n > prev;
      prev = n;
    });
  }
  function markAnswer() {
    var g = GAMES[state.id], T = TRAIN[state.id], q = state.q, seed = Date.now() % 233280;
    function idOf(text) {
      var ids = [];
      evaluate(q, text, always).forEach(function (s) { s.hits.forEach(function (p) { ids.push(p.id); }); });
      return ids.length === 1 ? ids[0] : null;
    }
    // One point the student makes twice, then more real points, each about a different part of the plan.
    var pair = shuffle(g.repeats, seed).filter(function (r) { return idOf(r[0]) && idOf(r[0]) === idOf(r[1]); })[0];
    var used = {}, real = [], first = null;
    if (pair) { used[idOf(pair[0])] = true; first = { text: pair[0], type: 'srp', label: pair[2], id: idOf(pair[0]) }; real.push(first); }
    shuffle(T.real, seed + 1).forEach(function (r) {
      var id = idOf(r[0]);
      if (real.length >= MARK_REAL || !id || used[id] || (pair && r[0] === pair[0])) return;
      used[id] = true;
      real.push({ text: r[0], type: 'srp', label: r[1], id: id });
    });
    // The real points go in the order of the plan, as a student would write them; the rest go anywhere.
    var order = q.points.map(function (p) { return p.id; });
    real.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
    var lines = real.slice();
    shuffle(T.vague, seed + 2).slice(0, 2).map(function (r) { return { text: r[0], type: 'vague', why: r[1] }; })
      .concat([{ text: pick(g.off), type: 'off' }], shuffle(g.wrong, seed + 3).slice(0, 1).map(function (r) { return { text: r[0], type: 'wrong', why: r[1] }; }))
      .forEach(function (l) { lines.splice(Math.floor(Math.random() * (lines.length + 1)), 0, l); });
    if (first) {
      var at = lines.indexOf(first) + 2;
      lines.splice(at + Math.floor(Math.random() * (lines.length - at + 1)), 0, { text: pair[1], type: 'repeat', of: first });
    }
    // Safety net: a line the marker reads differently from its type is left out.
    for (var guard = 0; guard < lines.length; guard++) {
      markEarned(lines);
      var odd = lines.filter(function (l) { return l.srp !== (l.type === 'srp'); })[0];
      if (!odd) break;
      lines.splice(lines.indexOf(odd), 1);
    }
    return lines;
  }
  function markStart(card) {
    var g = GAMES[state.id], q = state.q, lines = markAnswer(), face = (gameArt().students || {})[g.student];
    state.game = { kind: 'mark', lines: lines, calls: lines.map(function () { return null; }), done: false };
    gameHud(card, 0, '');
    mascot('ok', 'Now YOU mark. See how you like it.');
    gameBody(card, '<div class="am-mark">' +
      '<div class="am-run__top"><h3 class="am-run__kind">Be the examiner</h3><span class="am-games__step">Question ' + esc(q.code) + '</span></div>' +
      '<div data-am-msum></div>' +
      '<p class="am-games__ask">' + esc(g.student) + ' answered the question on ' + esc(q.title.toLowerCase()) + '. Mark each line: <b>//</b> if it earns an SRP, <b>X</b> if it doesn\'t.</p>' +
      '<button type="button" class="am-games__rules" data-am-mrules aria-expanded="false">What counts as an SRP?</button>' +
      '<p class="am-games__rulebox" data-am-mrulebox hidden>One <b>specific</b>, <b>correct</b> fact that <b>answers the question</b>. No marks for vague lines, wrong facts, other topics, or a point already made.</p>' +
      '<div class="am-mark__paper"><div class="am-mark__who">' + (face ? '<div class="am-student" data-mood="wait" aria-hidden="true">' + face + '</div>' : '') +
        '<span class="am-mark__name">' + esc(g.student) + '</span><p class="am-mark__says" data-am-msays aria-live="polite"></p></div>' + lines.map(function (l, k) {
        return '<div class="am-mark__row" data-am-mrow="' + k + '"><span class="am-mark__n" aria-hidden="true">' + (k + 1) + '</span>' +
          '<p class="am-mark__text"><span class="am-sr">Line ' + (k + 1) + ': </span>' + esc(l.text) + '</p>' +
          '<div class="am-mark__btns" role="group" aria-label="Mark line ' + (k + 1) + '">' +
            '<button type="button" class="am-mark__btn" data-am-mcall="' + k + ':1" aria-pressed="false" aria-label="SRP">' + SLASHES + '</button>' +
            '<button type="button" class="am-mark__btn am-mark__btn--x" data-am-mcall="' + k + ':0" aria-pressed="false" aria-label="No SRP">' + CROSS + '</button></div></div>';
      }).join('') + '</div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>');
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-ghub', 'Mini games'], ['ok', 'data-am-mhand', 'Hand back']], true);
    card.querySelector('[data-am-mcall]').focus({ preventScroll: true });
  }
  function markRules(card) {
    var btn = card.querySelector('[data-am-mrules]'), box = card.querySelector('[data-am-mrulebox]');
    box.hidden = !box.hidden;
    btn.setAttribute('aria-expanded', String(!box.hidden));
  }
  function markCall(card, k, v) {
    var x = state.game, row = card.querySelector('[data-am-mrow="' + k + '"]');
    if (x.done || !row) return;
    x.calls[k] = v;
    row.classList.remove('is-yes', 'is-no');
    row.classList.add(v ? 'is-yes' : 'is-no');
    row.querySelectorAll('[data-am-mcall]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-am-mcall') === k + ':' + v)); });
    var left = x.calls.filter(function (c) { return c === null; }).length;
    card.querySelector('[data-am-gnote]').textContent = left ? '' : 'All marked. Hand it back when you\'re sure.';
  }
  function markHand(card) {
    var x = state.game, left = x.calls.indexOf(null);
    if (x.done) return;
    if (left >= 0) {
      card.querySelector('[data-am-gnote]').textContent = 'Mark every line first (' + x.calls.filter(function (c) { return c === null; }).length + ' left).';
      card.querySelector('[data-am-mcall="' + left + ':1"]').focus();
      return;
    }
    x.done = true;
    var right = 0, gave = 0, real = 0, off = EXAM_OFF[state.id].topic;
    x.lines.forEach(function (l, k) {
      var ok = x.calls[k] === (l.srp ? 1 : 0), row = card.querySelector('[data-am-mrow="' + k + '"]');
      if (ok) right += 1;
      if (x.calls[k]) gave += 1;
      if (l.srp) real += 1;
      var tag = l.srp ? 'SRP' : l.type === 'off' ? 'Not relevant' : l.type === 'wrong' ? 'Wrong' : l.type === 'repeat' ? 'Repeat' : 'No SRP';
      var why = l.srp ? esc(l.label) : l.type === 'off' ? 'True, but the question is about ' + esc(off) + '.'
        : l.type === 'repeat' ? 'Line ' + (x.lines.indexOf(l.of) + 1) + ' already made this point. It only counts once.' : esc(l.why);
      row.classList.add(ok ? 'is-right' : 'is-wrong');
      row.querySelector('.am-mark__n').innerHTML = ok ? TICK : CROSS;
      row.querySelectorAll('[data-am-mcall]').forEach(function (b) { b.setAttribute('aria-disabled', 'true'); });
      row.insertAdjacentHTML('beforeend', '<p class="am-mark__why"><b class="am-mark__tag am-mark__tag--' + (l.srp ? 'srp' : 'no') + '">' + tag + '</b> ' +
        (ok ? '' : '<span class="am-sr">You marked this wrong. </span>') + why + '</p>');
      if (!reduced()) row.style.animationDelay = k * 0.06 + 's';
    });
    var n = x.lines.length, newBest = saveBest('mark', right, n), great = right >= n - 1;
    card.querySelector('[data-am-gscorebox]').hidden = false;
    card.querySelector('[data-am-gunit]').textContent = '/' + n;
    rollTo(card.querySelector('[data-am-gscore]'), right);
    card.querySelector('[data-am-msum]').innerHTML = '<div class="am-mark__sum ' + (great ? 'is-good' : '') + '"><b>' + right + ' of ' + n + ' lines marked right.</b> ' +
      'You gave ' + gave + (gave === 1 ? ' SRP' : ' SRPs') + '. The marking scheme gives ' + real + ' (' + real * 2 + ' marks).' + (newBest ? ' New best!' : '') + '</div>';
    card.querySelector('.am-mark').classList.add('is-marked');
    // The student reacts to the total you gave: too few SRPs is unfair on them, too many is free marks.
    var student = card.querySelector('.am-student');
    if (student) {
      student.setAttribute('data-mood', gave < real ? 'upset' : gave > real ? 'smug' : 'happy');
      if (!reduced()) student.classList.add('is-react');
    }
    card.querySelector('[data-am-msays]').textContent = gave < real ? 'Hey! Some of those were worth marks!' : gave > real ? 'Free marks. Cheers!'
      : right === n ? 'That\'s fair.' : 'Right total. Wrong lines, though.';
    card.querySelector('[data-am-gnote]').textContent = '';
    card.querySelector('.am-finish__card').scrollTop = 0;
    mascot(great ? 'happy' : right >= n * 0.7 ? 'ok' : 'angry', great ? 'You\'d make a decent examiner. Better than some.' : right >= n * 0.7 ? 'Not bad. Not good either.' : 'You\'d be a terrible examiner.');
    if (right === n) later(fanfare, 300);
    fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-ghub', 'Mini games'], ['ok', 'data-am-magain', 'Mark another']]);
    updateTrainTile();
  }

  // ---------- official marks (SEC 2024 Leaving Certificate marking scheme, Geography HL) ----------
  // 3B: 2 + 2 marks for two sedimentary rocks named, then 13 SRPs examining their formation.
  //     Irish locations earn at most 2 SRPs; with no formation explained, at most 2 SRPs.
  // 3C: 2 marks for a reference to prediction, 2 for a reference to reducing effects, then 13 SRPs.
  //     A 2nd reference on a side earns 1 SRP even unexplained; explaining only one side caps at 7 SRPs.
  var ROCKS = ['sandstone', 'limestone', 'shale', 'mudstone', 'siltstone', 'conglomerate', 'breccia', 'coal', 'chalk', 'chert', 'flint', 'rock salt', 'gypsum'];
  var METHODS = {
    p: ['seismograph', 'seismometer', 'tiltmeter', 'creepmeter', 'radon', 'foreshock', 'laser', 'gps', 'satellite', 'seismic gap', 'water level', 'animal behav', 'predict', 'forecast'],
    r: ['earthquake proof', 'building code', 'base isolat', 'shock absorb', 'rubber', 'counterweight', 'damper', 'cross brac', 'steel frame', 'retrofit', 'drill', 'drop cover', 'early warning', 'warning system', 'emergency', 'evacuat', 'sea wall', 'shut off', 'land use', 'zoning']
  };
  // A sentence that names two rocks has done its job (it earns the naming marks), so it is not underlined.
  function namesRocks(text) {
    if (state.q.sides) return false;
    var t = ' ' + text.toLowerCase().replace(/[^a-z]+/g, ' ');
    return ROCKS.filter(function (rock) { return t.indexOf(' ' + rock) >= 0; }).length >= 2;
  }
  function officialMarks() { return marksFor(Object.keys(state.got), fullText()); }
  // The marks for a set of awarded points (ids) and the text they came from.
  function marksFor(ids, raw) {
    var q = state.q;
    var text = ' ' + raw.toLowerCase().replace(/[^a-z]+/g, ' ');
    var out = { tags: [] };
    if (!q.sides) {
      var named = Math.min(2, ROCKS.filter(function (rock) { return text.indexOf(' ' + rock) >= 0; }).length);
      var examples = ids.filter(function (id) { return q.examples.indexOf(id) >= 0; }).length;
      var formation = ids.length - examples;
      var srps = formation + Math.min(2, examples);
      if (!formation) srps = Math.min(2, srps);
      out.srps = Math.min(13, srps);
      out.marks = named * 2 + out.srps * 2;
      out.tags.push(['Rocks named ' + named + '/2', named >= 2 ? 'ok' : '']);
      out.tags.push(['Irish example ' + (examples ? '&#10003;' : 'needed'), examples ? 'ok' : '']);
      if (named < 2) out.note = 'Name two sedimentary rocks (for example sandstone and limestone): 2 marks each.';
    } else {
      var side = { p: 0, r: 0 };
      ids.forEach(function (id) { var p = pointById(id); if (p) side[p.side]++; });
      var refs = {};
      ['p', 'r'].forEach(function (k) {
        refs[k] = METHODS[k].filter(function (m) { return text.indexOf(' ' + m) >= 0; }).length;
      });
      var refMarks = (side.p || refs.p ? 2 : 0) + (side.r || refs.r ? 2 : 0);
      var bonus = (refs.p >= 2 && refs.p > side.p ? 1 : 0) + (refs.r >= 2 && refs.r > side.r ? 1 : 0);
      var cap = side.p && side.r ? 13 : 7;
      out.srps = Math.min(cap, side.p + side.r + bonus);
      out.marks = refMarks + out.srps * 2;
      out.tags.push(['Predict ' + side.p, 'p']);
      out.tags.push(['Reduce ' + side.r, 'r']);
      if (cap === 7 && side.p + side.r + bonus > 7) out.note = 'Explain both prediction and reducing effects: one side alone is capped at 7 SRPs.';
    }
    out.marks = Math.min(30, out.marks);
    return out;
  }
  function refreshScore() {
    var q = state.q;
    var o = officialMarks();
    state.marks = o.marks;
    var score = state.coach.querySelector('.am-score');
    var first = !state.scoreShown;
    state.scoreShown = true;
    rollTo(score.querySelector('[data-am-marks]'), o.marks, first);
    var pips = score.querySelector('.am-pips');
    if (pips.children.length !== q.total) pips.innerHTML = new Array(q.total + 1).join('<i></i>');
    Array.prototype.forEach.call(pips.children, function (pip, k) {
      var was = pip.classList.contains('on'), on = k < o.srps;
      pip.classList.toggle('on', on);
      if (on && !was && !first && !reduced()) { pip.classList.remove('am-pip--pop'); void pip.offsetWidth; pip.classList.add('am-pip--pop'); }
    });
    updatePlan(o);
    updateCover(o);
    score.querySelector('.am-score__meta').innerHTML = o.tags.map(function (t) { return '<span class="am-tag ' + (t[1] ? 'am-tag--' + t[1] : '') + '">' + t[0] + '</span>'; }).join('');
    return o;
  }

  // The marks count up (or down) to the new total instead of jumping, with a little bump when they rise.
  function rollTo(node, to, instant) {
    var from = +node.textContent || 0;
    cancelAnimationFrame(node.rollFrame);
    if (from === to || instant || reduced()) { node.textContent = to; return; }
    var start = performance.now(), length = Math.min(900, 250 + Math.abs(to - from) * 70);
    function tick(now) {
      var t = Math.min(1, (now - start) / length), eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) { node.rollFrame = requestAnimationFrame(tick); return; }
      if (to > from) { node.classList.remove('am-bump'); void node.offsetWidth; node.classList.add('am-bump'); }
    }
    node.rollFrame = requestAnimationFrame(tick);
  }

  // ---------- plan panel ----------
  function planItems() {
    var list = [];
    PLANS[state.id].sections.forEach(function (sec) { sec.items.forEach(function (it) { list.push(it); }); });
    return list;
  }
  function planDone(item, o) {
    if (item.id === '_named') return /Rocks named 2\/2/.test(o.tags.map(function (t) { return t[0]; }).join(' '));
    return Boolean(state.got[item.id]);
  }
  function renderPlan() {
    var plan = PLANS[state.id];
    var html = '';
    plan.sections.forEach(function (sec) {
      html += '<div class="am-plan__sec"><h5>' + sec.title + '</h5>' + (sec.note ? '<p class="am-plan__note">' + sec.note + '</p>' : '');
      sec.items.forEach(function (it) {
        html += '<div class="am-plan__item" data-am-item="' + it.id + '">' +
          '<button type="button" class="am-plan__row" data-am-plan="' + it.id + '" aria-expanded="false"><i class="am-plan__dot"></i><span>' + it.title + '</span></button>' +
          '<div class="am-plan__more"><p class="am-plan__ask">' + it.ask + '</p>' +
          '<div class="am-plan__btns"><button type="button" class="am-btn am-btn--mini" data-am-starter="' + it.id + '">Start my sentence</button>' +
          '<button type="button" class="am-btn am-btn--mini am-btn--ghost" data-am-confused="' + it.id + '">Confused?</button></div>' +
          '<div class="am-help" hidden></div></div></div>';
      });
      html += '</div>';
    });
    state.planEl.innerHTML = html;
  }
  function updatePlan(o) {
    if (!state.planEl) return;
    var nextOpen = null;
    planItems().forEach(function (it) {
      var row = state.planEl.querySelector('[data-am-item="' + it.id + '"]');
      if (!row) return;
      var done = planDone(it, o);
      row.classList.toggle('am-plan__item--done', done);
      if (!done && !nextOpen) nextOpen = it.id;
    });
    state.planEl.querySelectorAll('.am-plan__item--next').forEach(function (r) { r.classList.remove('am-plan__item--next'); });
    if (nextOpen) state.planEl.querySelector('[data-am-item="' + nextOpen + '"]').classList.add('am-plan__item--next');
  }
  function togglePlanItem(id) {
    var row = state.planEl.querySelector('[data-am-item="' + id + '"]');
    var open = !row.classList.contains('am-plan__item--open');
    state.planEl.querySelectorAll('.am-plan__item--open').forEach(function (r) { r.classList.remove('am-plan__item--open'); });
    if (open) row.classList.add('am-plan__item--open');
    state.planEl.querySelectorAll('[data-am-plan]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(b.closest('.am-plan__item').classList.contains('am-plan__item--open')));
    });
  }
  function insertStarter(id) {
    var it = planItems().filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    var k = 0;
    state.pages.forEach(function (p, i) { if (p.ta.value.trim()) k = i; });
    var ta = state.pages[k].ta;
    var v = ta.value;
    ta.value = v + (v && !/\s$/.test(v) ? ' ' : '') + it.starter;
    reflow(k);
    var last = 0;
    state.pages.forEach(function (p, i) { if (p.ta.value.trim()) last = i; });
    focusPage(last, Infinity);
    onInput();
  }
  // ---------- "Confused?": quiz, then drag the words into the sentence ----------
  function shuffle(list, seed) {
    var a = list.slice(), s = seed || 7;
    for (var i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // A green tick or red cross that draws itself over `host`.
  function stamp(host, ok) {
    var mark = el('span', 'am-stamp ' + (ok ? 'am-stamp--ok' : 'am-stamp--no'),
      ok ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M6.5 12.5l3.6 3.6L17.5 8.5"/></svg>'
         : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M8 8l8 8M16 8l-8 8"/></svg>');
    host.appendChild(mark);
    if (!ok) { host.classList.remove('am-shake'); void host.offsetWidth; host.classList.add('am-shake'); }
    later(function () { mark.remove(); }, 1100);
  }
  function helpBox(id) { return state.planEl.querySelector('[data-am-item="' + id + '"] .am-help'); }
  function showDrag(id) {
    var qz = QUIZ[id], box = helpBox(id);
    if (!qz || !box) return;
    var parts = qz.drag.split(/\[([^\]]+)\]/);
    var words = parts.filter(function (p, k) { return k % 2; });
    var others = Object.keys(QUIZ).filter(function (k) { return k !== id; }).map(function (k) { return QUIZ[k].drag.match(/\[([^\]]+)\]/)[1]; });
    var decoy = shuffle(others, id.length * 17)[0];
    var tiles = shuffle(words.concat([decoy]), id.length * 13);
    box.innerHTML = '<p class="am-help__q">Drag the words into the gaps.</p>' +
      '<p class="am-drag__sentence">' + parts.map(function (p, k) {
        return k % 2 ? '<span class="am-drag__gap" data-am-gap="' + esc(p.toLowerCase()) + '" aria-label="blank ' + ((k + 1) / 2) + '"></span>' : esc(p);
      }).join('') + '</p>' +
      '<div class="am-drag__tiles">' + tiles.map(function (w) { return '<button type="button" class="am-drag__tile" data-am-tile="' + esc(w.toLowerCase()) + '">' + esc(w) + '</button>'; }).join('') + '</div>' +
      '<p class="am-help__hint" role="status" hidden></p>' +
      '<div class="am-help__foot"></div>';
    box.hidden = false;
    box.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    box.querySelectorAll('.am-drag__tile').forEach(function (tile) {
      tile.addEventListener('pointerdown', function (e) { startTileDrag(e, tile, id); });
      // A tap, Enter or Space places the word in the first empty gap.
      tile.addEventListener('click', function () {
        if (tile.hasAttribute('data-am-dragged')) { tile.removeAttribute('data-am-dragged'); return; }
        if (tile.classList.contains('am-drag__tile--used')) return;
        var gap = helpBox(id).querySelector('.am-drag__gap:not(.am-drag__gap--full)');
        if (gap) dropTile(tile, gap, id);
      });
    });
  }
  function startTileDrag(e, tile, id) {
    if (tile.classList.contains('am-drag__tile--used')) return;
    e.preventDefault();
    var startX = e.clientX, startY = e.clientY, moved = false;
    var ghost = null;
    function move(ev) {
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 6) {
        moved = true;
        ghost = tile.cloneNode(true);
        ghost.classList.add('am-drag__tile--ghost');
        document.body.appendChild(ghost);
        tile.classList.add('am-drag__tile--lifted');
      }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
    }
    function stop() {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', stop);
      tile.classList.remove('am-drag__tile--lifted');
      if (ghost) ghost.remove();
    }
    function up(ev) {
      stop();
      // Without movement this was a tap: the click handler places the word.
      if (!ghost) return;
      tile.setAttribute('data-am-dragged', '');
      var under = document.elementFromPoint(ev.clientX, ev.clientY);
      var gap = under && under.closest('.am-drag__gap');
      if (gap && !gap.classList.contains('am-drag__gap--full')) dropTile(tile, gap, id);
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', stop);
  }
  function dropTile(tile, gap, id) {
    if (tile.getAttribute('data-am-tile') !== gap.getAttribute('data-am-gap')) {
      stamp(tile, false);
      stamp(gap, false);
      var hint = helpBox(id).querySelector('.am-help__hint');
      if (hint) { hint.hidden = false; hint.textContent = 'Not quite. ' + QUIZ[id].hint; }
      return;
    }
    gap.textContent = tile.textContent;
    gap.removeAttribute('aria-label');
    gap.classList.add('am-drag__gap--full');
    var hadFocus = document.activeElement === tile;
    tile.classList.add('am-drag__tile--used');
    stamp(gap, true);
    var box = helpBox(id);
    // The used tile disappears, so keyboard focus moves on to the next word.
    var nextTile = box.querySelector('.am-drag__tile:not(.am-drag__tile--used)');
    if (hadFocus && nextTile) nextTile.focus();
    if (box.querySelector('.am-drag__gap:not(.am-drag__gap--full)')) return;
    later(function () {
      var sentence = box.querySelector('.am-drag__sentence');
      sentence.classList.add('am-drag__sentence--done');
      stamp(sentence, true);
      box.querySelector('.am-drag__tiles').remove();
      var hint = box.querySelector('.am-help__hint');
      hint.hidden = false;
      hint.classList.add('am-help__hint--ok');
      hint.textContent = QUIZ[id].hint;
      box.querySelector('.am-help__foot').innerHTML = '<span class="am-help__well">You built it! That is one SRP.</span><button type="button" class="am-btn am-btn--mini" data-am-use="' + id + '">Put it on my lines</button>';
      if (hadFocus || !state.root.contains(document.activeElement)) box.querySelector('[data-am-use]').focus();
    }, 450);
  }
  function useSentence(id) {
    appendToAnswer(QUIZ[id].drag.replace(/\[([^\]]+)\]/g, '$1'));
  }

  // ---------- Brain dump: write everything you remember, then learn how to phrase it ----------
  var DUMP_SECONDS = 240;
  function keyWords(id) {
    var qz = QUIZ[id];
    return qz ? (qz.drag.match(/\[([^\]]+)\]/g) || []).map(function (k) { return k.slice(1, -1); }) : [];
  }
  // The exam version of a step, with its key words highlighted.
  function examVersion(id) {
    var qz = QUIZ[id];
    if (qz) return esc(qz.drag).replace(/\[([^\]]+)\]/g, '<b>$1</b>');
    var p = pointById(id);
    var m = p && p.clue && p.clue[2].match(/<i>"?(.*?)"?<\/i>/);
    if (m) return m[1];
    if (id === 'define') return 'Sedimentary rocks are formed from <b>sediment</b>: broken bits of older rock and the <b>remains</b> of plants and animals.';
    return p ? esc(p.label) + '.' : '';
  }
  function phraseTips(id, line) {
    var low = line.toLowerCase();
    var missing = keyWords(id).filter(function (k) {
      var root = k.toLowerCase().replace(/[^a-z']/g, '');
      return root && low.indexOf(root.slice(0, Math.max(4, root.length - 3))) < 0;
    });
    var tips = [];
    if (missing.length) tips.push('Use the key word' + (missing.length > 1 ? 's' : '') + ': <b>' + missing.map(esc).join('</b>, <b>') + '</b>');
    var isExample = id === '_named' || (state.q.examples || []).indexOf(id) >= 0;
    if (!isExample && line.trim().split(/\s+/).length < 8) tips.push('Add the why or how: "&hellip;<b>because</b>&hellip;" or "&hellip;<b>so</b>&hellip;"');
    return tips;
  }
  function openBrainDump() {
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    clearInterval(state.dumpTimer);
    var card = el('div', 'am-finish am-dump');
    card.innerHTML = '<div class="am-finish__card am-dump__card" role="dialog" aria-label="Brain dump">' +
      '<div class="am-dump__top"><div><div class="am-finish__kicker">' + state.q.code + ' &middot; ' + state.q.title + '</div>' +
      '<h3 class="am-dump__title">Brain dump</h3></div><div class="am-dump__clock" data-am-clock>4:00</div></div>' +
      '<div class="am-dump__bar"><i data-am-bar></i></div>' +
      '<p class="am-dump__how">Write every fact you remember. <b>One fact per line.</b> Don\'t worry about wording yet.</p>' +
      '<textarea class="am-dump__box" spellcheck="true" aria-label="Write everything you remember"></textarea>' +
      '<div class="am-finish__buttons"><button type="button" class="am-btn am-btn--more" data-am-keep>Cancel</button><button type="button" class="am-btn am-btn--ok" data-am-dumpdone>I\'m done</button></div>' +
      '</div>';
    var box = card.querySelector('.am-dump__box');
    box.value = store('am-dumpdraft-' + state.id) || '';
    showCard(card, box);
    var left = DUMP_SECONDS;
    var clock = card.querySelector('[data-am-clock]'), bar = card.querySelector('[data-am-bar]');
    state.dumpTimer = setInterval(function () {
      if (!state || !card.isConnected) { clearInterval(state && state.dumpTimer); return; }
      left -= 1;
      clock.textContent = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
      bar.style.width = (left / DUMP_SECONDS * 100) + '%';
      if (left <= 30) clock.classList.add('am-dump__clock--low');
      if (left <= 0) finishBrainDump();
    }, 1000);
  }
  function finishBrainDump() {
    clearInterval(state.dumpTimer);
    var card = state.root.querySelector('.am-dump');
    if (!card) return;
    var text = card.querySelector('.am-dump__box').value;
    var sentences = evaluate(state.q, text, always);
    var got = {}, gotLines = [], misses = [];
    sentences.forEach(function (s) {
      if (s.hits.length) s.hits.forEach(function (p) { if (!got[p.id]) { got[p.id] = true; gotLines.push({ id: p.id, line: s.text }); } });
      else if (s.words >= 3) misses.push(s);
    });
    var named = !state.q.sides && ROCKS.filter(function (r) { return (' ' + text.toLowerCase()).indexOf(' ' + r) >= 0; }).length >= 2;
    if (named) got._named = true;
    var items = planItems();
    var remembered = items.filter(function (it) { return got[it.id]; });
    var forgot = items.filter(function (it) { return !got[it.id]; });
    store('am-dump-' + state.id, JSON.stringify({ at: Date.now(), got: Object.keys(got) }));

    var html = '<div class="am-finish__kicker">' + state.q.code + ' &middot; ' + state.q.title + '</div>' +
      '<h3 class="am-dump__title">You remembered ' + remembered.length + ' of ' + items.length + '</h3>' +
      '<div class="am-dump__bar am-dump__bar--score"><i style="width:' + Math.round(remembered.length / items.length * 100) + '%"></i></div>';
    if (gotLines.length) {
      html += '<h4 class="am-dump__h">How to phrase it</h4><p class="am-dump__sub">Your words, then the exam version. The <b>highlighted</b> words are the ones that earn the mark.</p>';
      gotLines.forEach(function (g) {
        var tips = phraseTips(g.id, g.line);
        html += '<div class="am-dump__pair">' +
          '<div class="am-dump__yours"><span>You wrote</span>' + esc(g.line) + '</div>' +
          '<div class="am-dump__exam"><span>Exam version</span>' + examVersion(g.id) + '</div>' +
          '<div class="am-dump__tips">' + (!QUIZ[g.id] ? '<em class="am-dump__tip am-dump__tip--ok">Good point. Use the exam version\'s wording if it helps.</em>' : tips.length ? tips.map(function (t) { return '<em class="am-dump__tip">' + t + '</em>'; }).join('') : '<em class="am-dump__tip am-dump__tip--ok">Exam-ready. Nothing to change.</em>') + '</div></div>';
      });
    }
    if (misses.length) {
      html += '<h4 class="am-dump__h">Didn\'t count yet</h4>';
      misses.forEach(function (s) {
        html += '<div class="am-dump__miss"><div class="am-dump__yours"><span>You wrote</span>' + esc(s.text) + '</div>' +
          '<em class="am-dump__tip">' + (s.near ? 'Close to <b>' + esc(s.near.label) + '</b>: say what happens and why.' : 'Too vague to earn a mark. Be specific: say exactly what happens, how, or how long.') + '</em></div>';
      });
    }
    if (forgot.length) {
      html += '<h4 class="am-dump__h">What you missed</h4><p class="am-dump__sub">Learn these. Tap Practise to fill one in.</p>';
      forgot.forEach(function (it) {
        html += '<div class="am-dump__forgot"><div><b class="am-dump__step">' + it.title + '</b><p>' + examVersion(it.id) + '</p></div>' +
          '<button type="button" class="am-btn am-btn--mini" data-am-practise="' + it.id + '">Practise</button></div>';
      });
    }
    html += '<div class="am-finish__buttons"><button type="button" class="am-btn am-btn--more" data-am-dump>Try again</button><button type="button" class="am-btn am-btn--ok" data-am-keep>Back to my answer</button></div>';
    store('am-dumpdraft-' + state.id, '');
    var cardEl = card.querySelector('.am-finish__card');
    cardEl.classList.add('am-dump__card--results');
    cardEl.setAttribute('aria-label', 'Brain dump results');
    cardEl.innerHTML = html;
    cardEl.scrollTop = 0;
    showCard(card);
    mascot(remembered.length * 2 >= items.length ? 'happy' : 'angry', remembered.length * 2 >= items.length ? 'You know more than I thought.' : 'Is that all you remember?');
  }
  // A card (results, brain dump, "Let's go over it") covers the sheet: the sheet behind it is
  // inert, and focus moves into the card.
  function syncCard() {
    if (!state) return;
    var open = Boolean(state.root.querySelector('.am-finish'));
    state.root.querySelector('.am-stage').inert = open;
    state.root.querySelector('.am-close').inert = open;
    placeMascot();
  }
  function showCard(card, focusEl) {
    var dialog = card.querySelector('[role="dialog"]');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('tabindex', '-1');
    if (!card.isConnected) state.root.appendChild(card);
    syncCard();
    (focusEl || dialog).focus({ preventScroll: true });
  }
  function closeCard() {
    clearInterval(state.dumpTimer);
    var card = state.root.querySelector('.am-finish');
    if (!card) return;
    var howto = card.classList.contains('am-howto');
    var draft = card.querySelector('.am-dump__box');
    if (draft) store('am-dumpdraft-' + state.id, draft.value);
    card.remove();
    syncCard();
    state.coach.classList.add('am-coach--min');
    if (howto) {
      var next = state.planEl.querySelector('.am-plan__item--next');
      if (next && !next.classList.contains('am-plan__item--open')) togglePlanItem(next.getAttribute('data-am-item'));
    }
    focusPage(state.active, Infinity);
  }
  function practiseStep(id) {
    var card = state.root.querySelector('.am-finish');
    if (card) card.remove();
    syncCard();
    state.coach.classList.add('am-coach--min');
    setBreakdown(true);
    var row = state.planEl.querySelector('[data-am-item="' + id + '"]');
    if (!row) return;
    if (!row.classList.contains('am-plan__item--open')) togglePlanItem(id);
    showDrag(id);
    var tile = helpBox(id) && helpBox(id).querySelector('.am-drag__tile');
    if (tile) tile.focus({ preventScroll: true });
    row.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }

  // ---------- "What to cover": a short summary of the plan ----------
  // Each group bundles several plan steps; the full step list stays in the breakdown below it.
  var COVER = {
    'question-3b': [
      { title: 'Name two rocks', ids: ['_named'] },
      { title: 'Explain sandstone', ids: ['weather', 'transport', 'deposit', 'compact', 'cement', 'redDesert'] },
      { title: 'Explain limestone', ids: ['limestone', 'warmSea', 'caco3', 'fossils'] },
      { title: 'Give Irish examples', ids: ['sandEx', 'limeEx'] },
      { title: 'Explain the timescale', ids: ['time', 'uplift'] }
    ],
    'question-3c': [
      { title: 'Monitoring instruments', ids: ['seismo', 'tilt', 'laser'] },
      { title: 'Warning signs', ids: ['gaps', 'radon', 'animals', 'difficult'] },
      { title: 'Safer buildings', ids: ['build', 'base', 'damper'] },
      { title: 'Being prepared', ids: ['drills', 'warning', 'emergency', 'shutoff'] }
    ]
  };
  function renderCover() {
    state.coverEl.innerHTML = COVER[state.id].map(function (g, k) {
      return '<button type="button" class="am-cover__row" data-am-group="' + k + '"><svg class="am-ring" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle class="am-ring__track" cx="12" cy="12" r="9.5"/><circle class="am-ring__fill" cx="12" cy="12" r="9.5" pathLength="100" stroke-dasharray="0 100"/>' +
        '<path class="am-ring__tick" d="M7.6 12.4l3 3 5.8-6.2"/></svg>' +
        '<span class="am-cover__title">' + g.title + '</span><span class="am-cover__count"></span></button>';
    }).join('');
  }
  function updateCover(o) {
    if (!state.coverEl) return;
    var items = {};
    planItems().forEach(function (it) { items[it.id] = it; });
    COVER[state.id].forEach(function (g, k) {
      var done = g.ids.filter(function (id) { return items[id] && planDone(items[id], o); }).length;
      var row = state.coverEl.querySelector('[data-am-group="' + k + '"]');
      var wasDone = row.classList.contains('am-cover__row--done');
      var isDone = done === g.ids.length;
      row.classList.toggle('am-cover__row--done', isDone);
      row.classList.toggle('am-cover__row--part', done > 0 && !isDone);
      row.querySelector('.am-cover__count').textContent = isDone ? 'Complete' : done + '/' + g.ids.length;
      row.querySelector('.am-ring__fill').setAttribute('stroke-dasharray', Math.round(done / g.ids.length * 100) + ' 100');
      if (isDone && !wasDone && state.coverReady && !reduced()) { row.classList.remove('am-cover__row--pop'); void row.offsetWidth; row.classList.add('am-cover__row--pop'); }
    });
    state.coverReady = true;
  }
  function setBreakdown(open) {
    state.planEl.hidden = !open;
    var btn = state.root.querySelector('[data-am-breakdown]');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.querySelector('span').textContent = open ? 'Hide full marking breakdown' : 'View full marking breakdown';
    state.coach.classList.toggle('am-coach--detail', open);
  }
  function openGroup(k) {
    var g = COVER[state.id][k];
    setBreakdown(true);
    var next = g.ids.map(function (id) { return state.planEl.querySelector('[data-am-item="' + id + '"]'); })
      .filter(function (row) { return row && !row.classList.contains('am-plan__item--done'); })[0] ||
      state.planEl.querySelector('[data-am-item="' + g.ids[0] + '"]');
    if (!next) return;
    if (!next.classList.contains('am-plan__item--open')) togglePlanItem(next.getAttribute('data-am-item'));
    next.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
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
      ? '<img class="am-question" alt="Question ' + q.code + ': ' + q.title + '" src="' + q.image + '" width="1431" height="' + q.imageHeight + '"><div class="am-label">Your answer</div>'
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
    ta.addEventListener('blur', function () { if (state) later(render, 0); });
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
    ['keyup', 'click', 'mouseup', 'select'].forEach(function (type) { ta.addEventListener(type, renderSoon); });
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
        if (!s.hits.length && !s.miss) return;
        var a = Math.max(s.start - off, 0), b = Math.min(s.end - off, v.length);
        if (b <= a) return;
        if (a > p) html += slice(p, a);
        if (!s.hits.length) { html += '<mark class="am-miss">' + slice(a, b) + '</mark>'; p = b; return; }
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
  // A sentence that earns its point using all of the exam's key words, in a full sentence, is "perfect".
  var CHECK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var STAR_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7z" fill="#fff"/></svg>';
  function perfectKeys(id) {
    var keys = keyWords(id);
    if (!keys.length && TEACH[id]) keys = (TEACH[id].say.match(/<b>[^<]+<\/b>/g) || []).slice(0, 3).map(function (k) { return k.replace(/<\/?b>/g, ''); });
    return keys;
  }
  function isPerfect(s, p) {
    if (s.words < 8) return false;
    var low = s.text.toLowerCase().replace(/[^a-z ]/g, ''), keys = perfectKeys(p.id);
    return keys.length > 0 && keys.every(function (k) {
      var root = k.toLowerCase().replace(/[^a-z ]/g, '').trim();
      return root && low.indexOf(root.slice(0, Math.max(4, root.length - 3))) >= 0;
    });
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
          var gold = isPerfect(s, p);
          badge = el('div', 'am-badge' + (gold ? ' am-badge--gold' : ''), gold ? STAR_ICON : CHECK_ICON);
          badge.setAttribute('data-am-b', key);
          badge.title = p.label + (gold ? ': perfect exam wording' : '');
          if (state.fresh[key]) {
            badge.classList.add('am-badge--new');
            badge.appendChild(el('span', 'am-plus' + (gold ? ' am-plus--gold' : ''), gold ? '+2 Perfect!' : '+2'));
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
        } else {
          // Rewording a sentence can win or lose its gold.
          var nowGold = isPerfect(s, p);
          if (nowGold !== badge.classList.contains('am-badge--gold')) {
            badge.classList.toggle('am-badge--gold', nowGold);
            badge.querySelector('svg').outerHTML = nowGold ? STAR_ICON : CHECK_ICON;
          }
        }
        badge.style.top = (top + 6) + 'px';
        badge.style.right = (-50 - (shift + k) * 40) + 'px';
      });
      shift += s.hits.length - 1;
    });
    Array.prototype.slice.call(layer.children).forEach(function (b) { if (!keep[b.getAttribute('data-am-b')]) b.remove(); });
  }
  // ---------- marking ----------
  // Writing is not marked while the student types. "Check my answer" marks the whole answer:
  // each sentence that earns an SRP turns green in turn, and sentences that don't are underlined.
  // Awarded points stay green while the student keeps editing.
  function always() { return true; }
  function save() {
    store('am-answer-' + state.id, JSON.stringify(state.pages.map(function (p) { return p.ta.value; })));
    store('am-granted-' + state.id, JSON.stringify(Object.keys(state.granted)));
  }
  function refresh() {
    state.sentences = evaluate(state.q, fullText(), always);
    var got = {};
    state.hitCache = {};
    state.sentences.forEach(function (s) {
      s.hits = s.hits.filter(function (p) { return state.granted[p.id]; });
      s.hits.forEach(function (p) { got[p.id] = true; });
      s.miss = !s.hits.length && Boolean(state.missed[s.text]);
      if (s.hits.length) state.hitCache[s.text] = s.hits;
    });
    state.got = got;
    state.count = Object.keys(got).length;
    state.firstDone = state.count > state.base;
    render();
    refreshScore();
  }
  function markAll() {
    if (state.marking) return;
    var all = evaluate(state.q, fullText(), always);
    var queue = [], missed = {}, near = null;
    all.forEach(function (s) {
      var fresh = s.hits.filter(function (p) { return !state.granted[p.id]; });
      if (fresh.length) queue.push(fresh);
      else if (!s.hits.length && s.words >= 3 && !namesRocks(s.text)) { missed[s.text] = true; if (!near && s.near) near = s; }
    });
    state.marking = true;
    state.marksBefore = state.marks || 0;
    state.missed = {};
    state.ghostOn = false;
    state.coach.classList.add('am-coach--min');
    var btn = state.root.querySelector('[data-am-check]');
    btn.setAttribute('aria-disabled', 'true');
    btn.querySelector('span').textContent = 'Checking…';
    var gained = [];
    function step(i) {
      if (!state) return;
      if (i >= queue.length) { later(function () { doneMarking(gained, missed, near); }, queue.length ? 650 : 250); return; }
      queue[i].forEach(function (p) { state.granted[p.id] = true; state.fresh[p.id] = true; gained.push(p); });
      refresh();
      var badge = state.root.querySelector('[data-am-b="' + queue[i][0].id + '"]');
      ding(i, Boolean(badge && badge.classList.contains('am-badge--gold')));
      if (badge) {
        badge.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
        var sheet = badge.closest('.am-page');
        if (sheet) { sheet.classList.remove('am-sheet--yay'); void sheet.offsetWidth; sheet.classList.add('am-sheet--yay'); }
      }
      later(function () { step(i + 1); }, reduced() ? 0 : 650);
    }
    step(0);
  }
  function doneMarking(gained, missed, near) {
    if (!state) return;
    state.marking = false;
    var btn = state.root.querySelector('[data-am-check]');
    btn.removeAttribute('aria-disabled');
    btn.querySelector('span').textContent = 'Check my answer';
    state.missed = missed;
    refresh();
    save();
    // Close finished plan steps and open the next one to work on.
    var open = state.planEl.querySelector('.am-plan__item--open');
    if (open && open.classList.contains('am-plan__item--done')) {
      open.classList.remove('am-plan__item--open');
      var next = state.planEl.querySelector('.am-plan__item--next');
      if (next) { next.classList.add('am-plan__item--open'); next.scrollIntoView({ block: 'nearest' }); }
    }
    later(function () {
      state.fresh = {};
      state.root.querySelectorAll('.am-badge--new').forEach(function (b) { b.classList.remove('am-badge--new'); });
      state.root.querySelectorAll('.am-hit--new').forEach(function (m) { m.classList.remove('am-hit--new'); });
    }, 1400);
    var total = 30;
    var o = officialMarks();
    var marks = o.marks;
    var delta = marks - (state.marksBefore || 0);
    var misses = Object.keys(missed).length;
    var first = 'You have <b>' + marks + ' / ' + total + '</b>.';
    if (gained.length) first += ' New: ' + gained.map(function (p) { return '<b>' + p.label + '</b>'; }).join(', ') + '.';
    var golds = gained.filter(function (p) { var b = state.root.querySelector('[data-am-b="' + p.id + '"]'); return b && b.classList.contains('am-badge--gold'); }).length;
    if (golds) first += '<span class="am-next">&#9733; ' + (golds === 1 ? '1 perfect sentence' : golds + ' perfect sentences') + ': exam wording, every key word.</span>';
    var quote = function (t) { return '“' + esc(t.slice(0, 60)) + (t.length > 60 ? '…' : '') + '”'; };
    if (misses) first += '<span class="am-next">' + (misses === 1 ? '1 sentence' : misses + ' sentences') + ' (underlined in orange) didn\'t match the marking scheme yet' +
      (near ? '. ' + quote(near.text) + ' is close: explain <b>how</b> or <b>why</b>.' : ', starting with ' + quote(Object.keys(missed)[0]) + '.') + '</span>';
    if (o.note) first += '<span class="am-next">' + o.note + '</span>';
    var levels = [first];
    var title;
    if (marks >= 30) {
      title = 'Full marks!';
      if (delta > 0) later(fanfare, 250);
    } else {
      title = delta > 0 ? '+' + delta + ' marks!' : 'No new marks yet';
      var c = clueFor(nextPoint());
      levels[0] += '<span class="am-next"><b>Next:</b> ' + c[0] + '</span>';
      levels.push(c[1], c[2]);
    }
    say(title, levels, gained.length ? 'yay' : 'near', true);
  }
  function showResults() {
    var q = state.q;
    var old = state.root.querySelector('.am-finish');
    if (old) old.remove();
    var o = officialMarks();
    var marks = o.marks;
    var made = state.sentences.reduce(function (list, s) { return list.concat(s.hits); }, []);
    var missing = marks >= 30 ? [] : q.path.map(pointById).filter(function (p) { return p && !state.got[p.id]; }).slice(0, 4);
    var card = el('div', 'am-finish');
    card.innerHTML = '<div class="am-finish__card" role="dialog" aria-label="Your result">' +
      '<div class="am-finish__kicker">' + q.code + ' &middot; ' + q.title + '</div>' +
      '<div class="am-finish__score"><b>' + marks + '</b> / 30</div>' +
      '<div class="am-pips am-finish__pips">' + new Array(q.total + 1).join('<i></i>') + '</div>' +
      '<div class="am-finish__cols"><div><h4>Points you made</h4><ul>' + (made.length ? made.map(function (p) { return '<li class="ok">' + p.label + '</li>'; }).join('') : '<li>None yet</li>') + '</ul></div>' +
      '<div><h4>Points you could add</h4><ul>' + (missing.length ? missing.map(function (p) { return '<li>' + p.label + '</li>'; }).join('') : '<li class="ok">Nothing: full marks!</li>') + '</ul></div></div>' +
      '<div class="am-finish__buttons"><button type="button" class="am-btn am-btn--more" data-am-keep>Keep working</button><button type="button" class="am-btn am-btn--ok" data-am-close>Back to the paper</button></div>' +
      '</div>';
    showCard(card);
    mascot(marks >= 24 ? 'happy' : marks >= 15 ? 'ok' : 'angry', marks >= 24 ? 'Hmph. That\'s a strong answer.' : marks >= 15 ? 'Passable. Not great.' : 'That would not pass.');
    Array.prototype.forEach.call(card.querySelectorAll('.am-pips i'), function (pip, k) {
      if (k < o.srps) later(function () { pip.classList.add('on'); }, reduced() ? 0 : 250 + k * 70);
    });
  }
  // Typing must feel instant, so each key press only re-splits the text (cheap) and keeps the
  // green highlights of sentences it already knows. The full marking and saving run once the
  // student pauses for a moment.
  function quickRefresh() {
    var cache = state.hitCache || {};
    state.sentences = splitSentences(fullText());
    state.sentences.forEach(function (s) {
      s.hits = cache[s.text] || [];
      s.miss = !s.hits.length && Boolean(state.missed[s.text]);
    });
    render();
  }
  function renderSoon() {
    if (!state || state.renderFrame) return;
    state.renderFrame = requestAnimationFrame(function () { if (!state) return; state.renderFrame = 0; render(); });
  }
  function onInput() {
    if (state.ghostOn && !ghostText(state.pages[state.active])) state.ghostOn = false;
    quickRefresh();
    clearTimeout(state.refreshTimer);
    state.refreshTimer = later(function () { refresh(); save(); }, 450);
  }

  // ---------- open / close ----------
  function build(id) {
    var q = QUESTIONS[id];
    var root = el('div', 'am-root');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Answer question ' + q.code);
    root.innerHTML =
      '<div class="am-backdrop"></div>' +
      '<button type="button" class="am-close" data-am-close aria-label="Close and go back to the paper"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg></button>' +
      '<div class="am-stage">' +
        '<div class="am-sheet-wrap"><div class="am-pages">' +
          '<button type="button" class="am-addpage" data-am-addpage>+ Add a page</button>' +
        '</div></div>' +
        '<aside class="am-coach" aria-label="Marks and help">' +
          '<div class="am-score"><div class="am-score__top"><span class="am-score__num"><b data-am-marks>0</b> / 30</span><span class="am-score__unit">marks</span>' +
            '<button type="button" class="am-sound" data-am-sound aria-pressed="true" aria-label="Sound effects"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="am-sound__waves" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="am-sound__mute" d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div><div class="am-pips"></div><div class="am-score__meta"></div></div>' +
          '<button type="button" class="am-btn am-btn--check" data-am-check><svg class="am-check-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg><span>Check my answer</span></button>' +
          '<div class="am-coach__body">' +
            '<div class="am-coach__msg" role="status"></div>' +
          '</div>' +
          '<div class="am-coach__buttons"><button type="button" class="am-btn am-btn--ok" data-am-ok>OK</button><button type="button" class="am-btn am-btn--finish" data-am-finish>Finish</button><button type="button" class="am-btn am-btn--more" data-am-more>Still don\'t get it</button></div>' +
          '<div class="am-cover"><h5 class="am-cover__h">What to cover</h5><div class="am-cover__list"></div>' +
            '<button type="button" class="am-cover__toggle" data-am-breakdown aria-expanded="false"><span>View full marking breakdown</span><i></i></button></div>' +
          '<div class="am-plan" hidden></div>' +
          '<div class="am-practise"><h5 class="am-needhelp__h">Practise</h5><button type="button" class="am-train-tile" data-am-train>' +
            '<span class="am-train-tile__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z" fill="currentColor"/></svg></span>' +
            '<span class="am-train-tile__text"><b>Training run</b><span data-am-tilebest>12 quick cards, 3 hearts</span></span>' +
            '<i class="am-train-tile__go" aria-hidden="true"></i></button>' +
            (window.ExamDrawDiagrams && window.ExamDrawDiagrams[id] ? '<button type="button" class="am-train-tile am-train-tile--draw" data-am-draw>' +
              '<span class="am-train-tile__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20l1.6-4.8L16 4.8l3.2 3.2L8.8 18.4z" fill="currentColor"/><path d="M14.4 6.4l3.2 3.2" stroke="#5CD6FF" stroke-width="1.6"/></svg></span>' +
              '<span class="am-train-tile__text"><b>Draw it</b><span data-am-drawbest>Sketch the exam diagrams</span></span>' +
              '<i class="am-train-tile__go" aria-hidden="true"></i></button>' : '') +
            '<button type="button" class="am-train-tile am-train-tile--exam" data-am-exam>' +
              '<span class="am-train-tile__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 19L10.5 5M12 19L17.5 5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/></svg></span>' +
              '<span class="am-train-tile__text"><b>Beat the Examiner</b><span data-am-exambest>Get each point past a strict examiner</span></span>' +
              '<i class="am-train-tile__go" aria-hidden="true"></i></button>' +
            (GAMES[id] ? '<button type="button" class="am-train-tile am-train-tile--games" data-am-games>' +
              '<span class="am-train-tile__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 7.5h10a4.5 4.5 0 0 1 4.5 4.5v3a2.6 2.6 0 0 1-4.7 1.5L15.2 14.5H8.8l-1.6 2A2.6 2.6 0 0 1 2.5 15v-3A4.5 4.5 0 0 1 7 7.5z" fill="currentColor"/><path d="M7.8 10.2v3.6M6 12h3.6" stroke="#FF7B54" stroke-width="1.8" stroke-linecap="round"/><circle cx="15.6" cy="10.9" r="1.1" fill="#FF7B54"/><circle cx="17.8" cy="13.1" r="1.1" fill="#FF7B54"/></svg></span>' +
              '<span class="am-train-tile__text"><b>Mini games</b><span>Chain reaction, Level up, Be the examiner</span></span>' +
              '<i class="am-train-tile__go" aria-hidden="true"></i></button>' : '') + '</div>' +
          '<div class="am-needhelp"><h5 class="am-needhelp__h">Need help?</h5><div class="am-needhelp__btns">' +
            '<button type="button" class="am-btn am-btn--dump" data-am-dump>Brain dump</button>' +
            '<button type="button" class="am-btn am-btn--clue" data-am-clue>Stuck?</button></div></div>' +
          '<div class="am-coach__foot"><span>Marked with the rules of the SEC 2024 marking scheme. A practice guide, not an official grade.</span></div>' +
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
      pagesEl: root.querySelector('.am-pages'), addBtn: root.querySelector('[data-am-addpage]'), coach: root.querySelector('.am-coach'),
      planEl: root.querySelector('.am-plan'), coverEl: root.querySelector('.am-cover__list') };
    // The page behind the answer sheet can't be reached by Tab or a screen reader while it's open.
    state.inerted = Array.prototype.filter.call(document.body.children, function (n) { return n !== root; });
    state.inerted.forEach(function (n) { holdInert(n, 'am', true); });
    renderPlan();
    renderCover();
    updateSoundButton();
    updateTrainTile();
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
    state.missed = {};
    state.granted = {};
    var granted = null;
    try { granted = JSON.parse(store('am-granted-' + id) || 'null'); } catch (err) {}
    if (granted) granted.forEach(function (pid) { state.granted[pid] = true; });
    else evaluate(q, fullText(), always).forEach(function (s) { s.hits.forEach(function (p) { state.granted[p.id] = true; }); });
    refresh();
    state.coach.classList.add('am-coach--min');
    refreshScore();

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-am-close]')) { close(); return; }
      if (e.target.closest('[data-am-ok]')) { state.coach.classList.add('am-coach--min'); focusPage(state.active, Infinity); return; }
      if (e.target.closest('[data-am-more]')) {
        if (state.msg.level < state.msg.levels.length - 1) { state.msg.level += 1; renderMsg(false); }
        return;
      }
      if (e.target.closest('[data-am-clue]')) { openTeach(); return; }
      var teachOpt = e.target.closest('[data-am-teachopt]');
      if (teachOpt) { answerTeach(teachOpt); return; }
      if (e.target.closest('[data-am-train]')) { openTraining(); return; }
      if (e.target.closest('[data-am-draw]')) { openDraw(); return; }
      if (e.target.closest('[data-am-exam]')) { openExaminer(); return; }
      if (e.target.closest('[data-am-games]')) { openGames(); return; }
      var gamesCard = e.target.closest('.am-games');
      if (gamesCard) {
        var gameBtn = e.target.closest('[data-am-game]');
        if (gameBtn) { startGame(gamesCard, gameBtn.getAttribute('data-am-game')); return; }
        if (e.target.closest('[data-am-ghub]')) { gamesHub(gamesCard); return; }
        if (e.target.closest('[data-am-gagain]')) { startGame(gamesCard, state.game.kind); return; }
        var cTile = e.target.closest('[data-am-ctile]');
        if (cTile) { chainPlace(gamesCard, +cTile.getAttribute('data-am-ctile')); return; }
        var cSlot = e.target.closest('[data-am-cslot]');
        if (cSlot) { chainTakeOut(gamesCard, +cSlot.getAttribute('data-am-cslot')); return; }
        if (e.target.closest('[data-am-ccheck]')) { chainCheck(gamesCard); return; }
        if (e.target.closest('[data-am-cnext]')) { chainNext(gamesCard); return; }
        var lOpt = e.target.closest('[data-am-lopt]');
        if (lOpt) { levelPick(gamesCard, +lOpt.getAttribute('data-am-lopt')); return; }
        if (e.target.closest('[data-am-lnext]')) { levelNext(gamesCard); return; }
        var mCall = e.target.closest('[data-am-mcall]');
        if (mCall) { var mc = mCall.getAttribute('data-am-mcall').split(':'); markCall(gamesCard, +mc[0], +mc[1]); return; }
        if (e.target.closest('[data-am-mrules]')) { markRules(gamesCard); return; }
        if (e.target.closest('[data-am-mhand]')) { markHand(gamesCard); return; }
        if (e.target.closest('[data-am-magain]')) { markStart(gamesCard); return; }
      }
      var examCard = e.target.closest('.am-exam');
      if (examCard) {
        if (e.target.closest('[data-am-estart]')) { examRound(examCard); return; }
        if (e.target.closest('[data-am-ehand]')) { examJudge(examCard); return; }
        if (e.target.closest('[data-am-ehelp]')) { examHelp(examCard); return; }
        if (e.target.closest('[data-am-enext]')) { examNext(examCard); return; }
        if (e.target.closest('[data-am-elines]')) { examToLines(); return; }
        if (e.target.closest('[data-am-ereset]')) { examReset(examCard); return; }
      }
      var drawCard = e.target.closest('.am-draw');
      if (drawCard) {
        if (e.target.closest('[data-am-dgo]')) { drawPrompt(drawCard); return; }
        if (e.target.closest('[data-am-dstudy]')) { drawStudy(drawCard); return; }
        if (e.target.closest('[data-am-dready]')) { drawHide(drawCard); return; }
        var chip = e.target.closest('[data-am-dchip]');
        if (chip) { armLabel(drawCard, chip, e.detail === 0); return; }
        if (e.target.closest('[data-am-dundo]')) { drawUndo(drawCard); return; }
        if (e.target.closest('[data-am-dclear]')) { drawClear(drawCard); return; }
        if (e.target.closest('[data-am-ddone]')) { drawFinish(drawCard, false); return; }
        var tickBtn = e.target.closest('[data-am-dtick]');
        if (tickBtn) { var tk = +tickBtn.getAttribute('data-am-dtick'); setTick(drawCard, tk, !state.draw.ticked[tk]); return; }
        if (e.target.closest('[data-am-dreplay]')) { replayDrawing(drawCard.querySelector('.am-draw__mine canvas'), state.draw.actions, 1800); return; }
        if (e.target.closest('[data-am-dnext]')) { drawNext(drawCard); return; }
        if (e.target.closest('[data-am-dagain]')) { openDraw(); return; }
      }
      var trainCard = e.target.closest('.am-train');
      if (trainCard) {
        if (e.target.closest('[data-am-thint]')) {
          var line = trainCard.querySelector('[data-am-hintline]');
          line.classList.add('am-flip__hintline--open');
          line.innerHTML = '<b>Hint –</b> ' + esc(TEACH[state.train.deck[state.train.i].id].hint);
          state.train.hinted = true;
          trainCard.querySelector('.am-run__input').focus();
          return;
        }
        var runOpt = e.target.closest('[data-am-ropt]');
        if (runOpt) { answerRun(trainCard, +runOpt.getAttribute('data-am-ropt')); return; }
        if (e.target.closest('[data-am-rcheck]')) { checkRunType(trainCard, false); return; }
        if (e.target.closest('[data-am-rskip]')) { checkRunType(trainCard, true); return; }
        if (e.target.closest('[data-am-rnext]')) { nextRun(trainCard); return; }
        if (e.target.closest('[data-am-rright]')) { overrideRun(trainCard); return; }
        if (e.target.closest('[data-am-rrun]')) { openTraining(); return; }
        if (e.target.closest('[data-am-rsprint]')) { sprintIntro(trainCard); return; }
        if (e.target.closest('[data-am-tsprint]')) { startSprint(trainCard); return; }
        if (e.target.closest('[data-am-tstop]')) { endSprint(trainCard); return; }
      }
      var teachGo = e.target.closest('[data-am-teachgo]');
      if (teachGo) { teachStage(teachGo.closest('.am-teach'), teachGo.getAttribute('data-am-teachgo')); return; }
      var teachCheck = e.target.closest('[data-am-teachcheck]');
      if (teachCheck) { checkTeachWrite(teachCheck.closest('.am-teach')); return; }
      var teachModel = e.target.closest('[data-am-teachmodel]');
      if (teachModel) { showTeachModel(teachModel.closest('.am-teach')); return; }
      var teachUse = e.target.closest('[data-am-teachuse]');
      if (teachUse) { useTeachSentence(teachUse.closest('.am-teach')); return; }
      var teachChip = e.target.closest('[data-am-teach]');
      if (teachChip) { openTeach(teachChip.getAttribute('data-am-teach')); return; }
      if (e.target.closest('[data-am-check]')) { markAll(); return; }
      if (e.target.closest('[data-am-sound]')) { store('am-sound', soundOn() ? 'off' : 'on'); updateSoundButton(); if (soundOn()) ding(0); return; }
      if (e.target.closest('[data-am-breakdown]')) { setBreakdown(state.planEl.hidden); return; }
      var group = e.target.closest('[data-am-group]');
      if (group) { openGroup(+group.getAttribute('data-am-group')); return; }
      if (e.target.closest('[data-am-dump]')) { openBrainDump(); return; }
      if (e.target.closest('[data-am-dumpdone]')) { finishBrainDump(); return; }
      var practise = e.target.closest('[data-am-practise]');
      if (practise) { practiseStep(practise.getAttribute('data-am-practise')); return; }
      var planBtn = e.target.closest('[data-am-plan]');
      if (planBtn) { togglePlanItem(planBtn.getAttribute('data-am-plan')); return; }
      var starter = e.target.closest('[data-am-starter]');
      if (starter) { insertStarter(starter.getAttribute('data-am-starter')); return; }
      var confused = e.target.closest('[data-am-confused]');
      if (confused) { showDrag(confused.getAttribute('data-am-confused')); return; }
      var use = e.target.closest('[data-am-use]');
      if (use) { useSentence(use.getAttribute('data-am-use')); return; }
      if (e.target.closest('[data-am-finish]')) { showResults(); return; }
      if (e.target.closest('[data-am-keep]')) { closeCard(); return; }
      if (e.target.closest('[data-am-addpage]')) {
        var page = addPage();
        state.root.classList.add('am-lines-in');
        focusPage(page.index, 0);
        requestAnimationFrame(function () { state.pagesEl.parentNode.scrollTo({ top: page.el.offsetTop - 12, behavior: reduced() ? 'auto' : 'smooth' }); });
        return;
      }
    });
    // Escape closes an open card first, then the whole answer sheet.
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (state.root.querySelector('.am-finish')) { e.stopPropagation(); closeCard(); return; }
      close();
    });
    window.addEventListener('resize', state.onResize = function () {
      if (!state) return;
      reflow(0);
      render();
      var drawCard = state.root.querySelector('.am-draw');
      if (drawCard && state.draw && state.draw.drawing) drawSize(drawCard);
      placeMascot();
    });
    document.addEventListener('selectionchange', state.onSelect = function () {
      if (state && document.activeElement && document.activeElement.classList.contains('am-input')) renderSoon();
    });

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
    try { save(); } catch (err) {}
    var draft = s.root.querySelector('.am-dump__box');
    if (draft) store('am-dumpdraft-' + s.id, draft.value);
    state = null;
    s.timers.forEach(clearTimeout);
    clearInterval(s.dumpTimer);
    window.removeEventListener('resize', s.onResize);
    document.removeEventListener('selectionchange', s.onSelect);
    s.inerted.forEach(function (n) { holdInert(n, 'am', false); });
    // Put focus back on the question this answer belongs to.
    var back = document.querySelector('[data-hf-target="' + s.id + '"]');
    if (back) back.focus({ preventScroll: true });
    if (instant || reduced()) { s.root.remove(); return; }
    s.root.classList.add('am-out');
    setTimeout(function () { s.root.remove(); }, 420);
  }

  window.ExamAnswerMode = {
    has: function (id) { return Boolean(QUESTIONS[id]); },
    open: open,
    close: close,
    // Exposed for testing: how text splits into sentences, and which points each one earns.
    scoreIds: function (id, text) { return evaluate(QUESTIONS[id], text, function () { return true; }).map(function (s) { return s.hits.map(function (p) { return p.id; }); }); },
    sentences: function (text) { return splitSentences(text).map(function (s) { return [s.text, s.complete]; }); },
    score: function (id, text) {
      return evaluate(QUESTIONS[id], text, function () { return true; }).map(function (s) { return { text: s.text, points: s.hits.map(function (p) { return p.label; }), near: s.near ? s.near.label : null }; });
    }
  };

  var css = [
    '.am-root{position:fixed;inset:0;z-index:2147483200;font-family:Nunito,system-ui,sans-serif;color:#10243B}',
    // Writing happens on the same wooden desk as the rest of the page.
    '.am-backdrop{position:absolute;inset:0;background:#BF7843 url(assets/cartoon-desk.svg?v=straight-1) center/cover no-repeat;opacity:0;transition:opacity .38s ease}',
    '.am-in .am-backdrop{opacity:1}',
    '.am-out{transition:opacity .38s ease;opacity:0}',
    '.am-stage{position:absolute;inset:0;display:flex;justify-content:center;align-items:stretch;gap:28px;padding:24px 28px;box-sizing:border-box}',
    '.am-sheet-wrap{flex:1 1 auto;max-width:980px;min-width:0;overflow-y:auto;overflow-x:hidden;border-radius:18px;scrollbar-width:thin}',
    '.am-pages{display:flex;flex-direction:column;gap:22px;padding-bottom:24px}',
    '.am-sheet{position:relative;flex:0 0 auto;background:#FFFEF8;border-radius:18px;padding:34px 118px 56px 56px;box-sizing:border-box;clip-path:inset(0 0 100% 0 round 18px);transition:clip-path .7s cubic-bezier(.22,.8,.2,1)}',
    '.am-page--new{animation:amIn .45s cubic-bezier(.22,.8,.2,1) both}',
    '.am-page__head{font:700 15px Fredoka,Nunito,sans-serif;letter-spacing:.04em;color:#5E6F8A;margin:0 0 6px}',
    '.am-page__num{position:absolute;left:0;right:0;bottom:18px;text-align:center;font:700 15px Fredoka,Nunito,sans-serif;color:#9AA8BD}',
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
    '.am-label{font-family:Fredoka,Nunito,sans-serif;font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#5E6F8A;margin:4px 0 2px;opacity:0;transition:opacity .4s ease}',
    '.am-lines-in .am-label{opacity:1}',
    '.am-write{position:relative}',
    '.am-lines{position:absolute;inset:0;pointer-events:none}',
    '.am-line{position:absolute;left:0;right:0;height:2px;background:#C7D3E6;border-radius:2px;transform:scaleX(0);transform-origin:left center}',
    '.am-lines-in .am-line{animation:amLine .5s cubic-bezier(.3,.7,.2,1) both;animation-delay:calc(var(--i) * 30ms)}',
    '.am-lines-in .am-line--now{animation-delay:0s}',
    '@keyframes amLine{to{transform:scaleX(1)}}',
    '.am-mirror,.am-input{display:block;width:100%;box-sizing:border-box;margin:0;padding:0 4px;border:0;font:800 22px/46px Nunito,system-ui,sans-serif;letter-spacing:0;word-spacing:0;white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;tab-size:4}',
    '.am-root .am-input,.am-root .am-mirror,.am-root .am-mirror *{font-family:Nunito,system-ui,sans-serif !important;font-weight:800 !important;font-size:22px !important;line-height:46px !important;letter-spacing:0 !important}',
    '.am-root :is(p,span,button,label,a,h1,h2,h3,li,strong,b):not(#am-weight){font-weight:800 !important}',
    '.am-root .am-ghost__key{font-family:Fredoka,Nunito,sans-serif !important;font-weight:700 !important;font-size:13px !important;line-height:24px !important}',
    '.am-root .am-coach__p,.am-root .am-coach__p *,.am-root .am-coach__foot span{font-family:Nunito,system-ui,sans-serif !important;font-weight:800 !important}',
    '.am-root .am-coach__title,.am-root .am-coach__head span,.am-root .am-btn,.am-root .am-link,.am-root .am-tag,.am-root .am-score span,.am-root .am-score b,.am-root .am-coach__p b,.am-root .am-plus,.am-root .am-label{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-coach__p b{font-weight:700 !important}',
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
    '.am-coach{flex:0 0 380px;display:flex;flex-direction:column;gap:14px;margin-right:56px;align-self:flex-start;max-height:100%;box-sizing:border-box;background:transparent;border-radius:0;padding:4px 0;color:#F4F7FF;transform:translateX(40px);opacity:0;transition:transform .5s cubic-bezier(.22,.8,.2,1),opacity .4s ease}',
    '.am-coach-in .am-coach{transform:none;opacity:1}',
    '.am-score{background:#0C1628;border-radius:14px;padding:12px 14px}',
    '.am-score__top{display:flex;align-items:baseline;gap:8px;font-family:Fredoka,Nunito,sans-serif}',
    '.am-score__num{font-size:30px;font-weight:700;color:#fff}',
    '.am-score__num b{color:#5BE39A;font-weight:700}',
    '.am-score__unit{font-size:16px;color:#9FB0CC;font-weight:700}',
    '.am-sound{margin-left:auto;align-self:center;width:34px;height:34px;padding:0;border:2px solid #2A3D5E;border-radius:50%;background:transparent;color:#C9D6EE;display:grid;place-items:center;cursor:pointer}',
    '.am-sound:hover{border-color:#5CD6FF;color:#fff}',
    '.am-sound svg{width:18px;height:18px}',
    '.am-sound .am-sound__mute,.am-sound[aria-pressed="false"] .am-sound__waves{display:none}',
    '.am-sound[aria-pressed="false"] .am-sound__mute{display:inline}',
    '.am-score__num b{display:inline-block}',
    '.am-score__num b.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '@keyframes amBump{40%{transform:scale(1.3)}100%{transform:none}}',
    '.am-pips i.am-pip--pop{animation:amPip .45s cubic-bezier(.3,1.6,.5,1)}',
    '@keyframes amPip{40%{transform:scaleY(1.8)}100%{transform:none}}',
    '.am-badge--gold{background:#FFC42E;box-shadow:0 3px 0 #C98E00}',
    '.am-plus--gold{color:#B57F00}',
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
    '.am-coach__p{margin:0 0 12px;font:800 18px/1.45 Nunito,sans-serif;color:#E8EEFA}',
    '.am-coach__p b{font-family:Fredoka,Nunito,sans-serif;font-weight:700;color:#FFE14D}',
    '.am-coach__p i{font-style:normal;color:#BFF5D6}',
    '.am-coach__p--deeper{border-left:4px solid #5CD6FF;padding-left:12px}',
    '.am-coach__p--new{animation:amIn .45s cubic-bezier(.22,.8,.2,1) both}',
    '@keyframes amIn{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:none}}',
    '.am-pop .am-coach__title{animation:amIn .4s cubic-bezier(.22,.8,.2,1) both}',
    '.am-next{display:block;margin-top:10px}',
    '.am-green{color:#5BE39A !important}',
    '.am-plan{flex:1 1 auto;min-height:140px;overflow-y:auto;padding:4px 2px 0}',
    '.am-root .am-plan,.am-root .am-coach,.am-root .am-coach__body,.am-root .am-sheet-wrap,.am-root .am-finish__card{scrollbar-width:none}',
    '.am-root .am-plan::-webkit-scrollbar,.am-root .am-coach::-webkit-scrollbar,.am-root .am-coach__body::-webkit-scrollbar,.am-root .am-sheet-wrap::-webkit-scrollbar,.am-root .am-finish__card::-webkit-scrollbar{display:none}',
    '.am-plan__head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}',
    '.am-plan__head span{font:700 19px Fredoka,Nunito,sans-serif;color:#C9D6EE;letter-spacing:.02em}',
    '.am-plan__sec{margin-bottom:8px}',
    '.am-plan__sec h5{margin:14px 0 4px;font:700 14px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8496B6}',
    '.am-plan__note{margin:0 0 4px;font:700 13px/1.35 Nunito,sans-serif;color:#9FB0CC}',
    '.am-plan__row{display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;border-radius:8px;padding:7px 4px;color:#8D9FBF;font:800 18px/1.25 Nunito,sans-serif;text-align:left;cursor:pointer;transition:color .2s ease}',
    '.am-plan__row:hover{color:#E8EEFA}',
    '.am-plan__dot{flex:0 0 20px;height:20px;border-radius:50%;border:2px solid #3A5175;box-sizing:border-box;position:relative}',
    '.am-plan__item--next .am-plan__dot{border-color:#FFD43B}',
    '.am-plan__item--next .am-plan__row{color:#fff}',
    '.am-plan__item--done .am-plan__dot{background:#2BC46F;border-color:#2BC46F}',
    '.am-plan__item--done .am-plan__dot::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}',
    '.am-plan__item--done .am-plan__row span{color:#5E9C7C}',
    '.am-plan__more{display:none;margin:2px 0 10px 30px;padding:2px 0 2px 12px;border-left:2px solid #2A3D5E}',
    '.am-plan__item--open .am-plan__more{display:block;animation:amIn .3s ease both}',
    '.am-plan__more p{margin:0 0 10px;font:800 16px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-plan__ask{color:#FFE14D !important}',
    '.am-plan__example{color:#BFF5D6 !important;border-left:3px solid #2BC46F;padding-left:10px}',
    '.am-plan__btns{display:flex;gap:8px;flex-wrap:wrap}',
    '.am-root .am-btn--mini{font-size:13px;padding:6px 11px;border-radius:9px;background:#2BC46F;color:#fff;box-shadow:0 2px 0 #1E9A55}',
    '.am-root .am-btn--ghost{background:transparent;color:#C9D6EE;border:2px solid #2A3D5E;box-shadow:none;padding:4px 10px}',
    '.am-howto__title{margin:4px 0 14px;font:700 32px/1.1 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-howto__map{display:grid;gap:8px;margin-bottom:16px}',
    '.am-howto__row{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#0C1628;border-radius:12px;padding:12px 14px;animation:amIn .4s cubic-bezier(.22,.8,.2,1) both;animation-delay:calc(var(--k) * 120ms + 150ms)}',
    '.am-howto__row span{font:800 17px/1.3 Nunito,sans-serif;color:#E8EEFA}',
    '.am-howto__row b{flex:0 0 auto;font:700 16px Fredoka,Nunito,sans-serif;color:#5BE39A}',
    '.am-howto__rules{margin:0 0 20px;padding-left:20px;display:grid;gap:6px}',
    '.am-howto__rules li{font:800 15px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-howto__rules b{color:#FFE14D;font-family:Fredoka,Nunito,sans-serif;font-weight:700}',
    '.am-root .am-plan__row,.am-root .am-plan__more p,.am-root .am-plan__note,.am-root .am-howto__row span,.am-root .am-howto__rules li{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-plan__head span,.am-root .am-plan__sec h5,.am-root .am-howto__title,.am-root .am-howto__row b{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-help{margin-top:12px}',
    '.am-chain{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:12px}',
    '.am-chain__box{position:relative;background:#1B2E4B;color:#E8EEFA;border-radius:10px;padding:7px 10px;font:800 14px/1.3 Nunito,sans-serif}',
    '.am-chain__box--gap{background:transparent;border:2px dashed #FFD43B;color:#FFD43B;min-width:28px;text-align:center}',
    '.am-chain__box--filled{border:2px solid #2BC46F;background:#173B2A;color:#7DF0B0;animation:amPop .45s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-chain__arrow{font-style:normal;color:#8496B6;font-weight:900;padding-left:14px;line-height:1}',
    '.am-help__q{color:#FFE14D !important;margin-bottom:8px !important}',
    '.am-quiz{display:grid;gap:8px}',
    '.am-quiz__opt{position:relative;text-align:left;border:2px solid #2A3D5E;background:transparent;color:#E8EEFA;border-radius:12px;padding:10px 12px;font:800 15px/1.3 Nunito,sans-serif;cursor:pointer;transition:border-color .2s ease,background .2s ease}',
    '.am-quiz__opt:hover:not([aria-disabled="true"]){border-color:#5CD6FF}',
    '.am-quiz__opt[aria-disabled="true"]{cursor:default}',
    '.am-quiz__opt--ok{border-color:#2BC46F;background:#173B2A;color:#7DF0B0}',
    '.am-quiz__opt--no{border-color:#E5484D;color:#FF9A9D;opacity:.75}',
    '.am-help__hint{margin-top:10px !important;color:#FFC9A8 !important}',
    '.am-help__hint--ok{color:#BFF5D6 !important}',
    '.am-help__foot{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:6px}',
    '.am-help__well{font:700 15px Fredoka,Nunito,sans-serif;color:#7DF0B0}',
    '.am-drag__sentence{position:relative;font:800 17px/2.3 Nunito,sans-serif !important;color:#E8EEFA !important;border-radius:10px;transition:background .3s ease}',
    '.am-drag__sentence--done{background:#173B2A;padding:4px 10px}',
    '.am-drag__gap{position:relative;display:inline-block;min-width:74px;height:30px;line-height:26px;vertical-align:middle;border:2px dashed #FFD43B;border-radius:9px;margin:0 3px;padding:0 8px;box-sizing:border-box;color:#7DF0B0;text-align:center}',
    '.am-drag__gap--full{border:2px solid #2BC46F;background:#173B2A;animation:amPop .4s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-drag__tiles{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 4px}',
    '.am-drag__tile{position:relative;user-select:none;touch-action:none;cursor:grab;background:#E8EEFA;color:#14243B;border-radius:10px;padding:6px 12px;font:800 16px Nunito,sans-serif;box-shadow:0 3px 0 #9FB0CC}',
    '.am-drag__tile--lifted{opacity:.35}',
    '.am-drag__tile--used{visibility:hidden}',
    '.am-drag__tile--ghost{position:fixed;z-index:2147483647;pointer-events:none;transform:translate(-50%,-60%) rotate(-3deg) scale(1.08);box-shadow:0 10px 24px rgba(0,0,0,.4)}',
    '.am-stamp{position:absolute;right:-10px;top:-12px;width:28px;height:28px;pointer-events:none;animation:amStamp 1.1s ease both;z-index:2}',
    '.am-stamp svg{width:100%;height:100%;display:block}',
    '.am-stamp--ok circle{fill:#2BC46F}',
    '.am-stamp--no circle{fill:#E5484D}',
    '.am-stamp path{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:30;stroke-dashoffset:30;animation:amDraw .35s .12s ease forwards}',
    '@keyframes amDraw{to{stroke-dashoffset:0}}',
    '@keyframes amStamp{0%{transform:scale(0)}18%{transform:scale(1.25)}30%{transform:scale(1)}80%{opacity:1}100%{opacity:0}}',
    '.am-shake{animation:amShake .4s ease}',
    '@keyframes amShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}',
    '.am-root .am-chain__box,.am-root .am-quiz__opt,.am-root .am-drag__tile,.am-root .am-drag__gap{font-family:Nunito,system-ui,sans-serif !important}',
    'body > .am-drag__tile--ghost{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-btn--dump{background:transparent;color:#8FE3FF;border:2px solid #2A5D7A;box-shadow:none;padding:10px 14px}',
    '.am-root .am-btn--dump:hover{border-color:#5CD6FF;color:#fff}',
    '.am-practise{margin:0 0 4px}',
    '.am-root .am-btn--train{width:100%;background:#FFC42E;color:#14243B;box-shadow:0 4px 0 #C98E00}',
    '.am-train__card{width:min(680px,100%)}',
    '.am-train-tile + .am-train-tile{margin-top:10px}',
    '.am-train-tile--draw .am-train-tile__icon{background:#5CD6FF;color:#0C1628;box-shadow:0 3px 0 #2A9BC4}',
    '.am-train-tile--draw:hover{border-color:#5CD6FF}',
    '.am-train-tile--draw .am-train-tile__go{border-color:#5CD6FF}',
    '.am-finish__card.am-draw__card{width:min(980px,100%)}',
    '.am-draw__clock{position:relative;flex:none;display:grid;place-items:center;width:44px;height:44px}',
    '.am-draw__clock[hidden]{display:none}',
    '.am-draw__clock svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}',
    '.am-draw__clock circle{fill:none;stroke:#26395A;stroke-width:4}',
    '.am-draw__clock .am-draw__ring{stroke:#FFC42E;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:0;transition:stroke-dashoffset .1s linear}',
    '.am-draw__clock b{position:relative;display:inline-block;font:700 16px Fredoka,Nunito,sans-serif;color:#fff;font-variant-numeric:tabular-nums}',
    '.am-draw__clock b.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-draw__clock--low .am-draw__ring{stroke:#FF8A6B}',
    '.am-draw__clock--low b{color:#FF8A6B}',
    '.am-draw__body{min-height:340px;margin:6px 0 0}',
    '.am-draw__btns{margin-top:16px}',
    '.am-draw__btns:empty{display:none}',
    '.am-draw__intro{padding:6px 0 0;text-align:center}',
    '.am-draw__fan{position:relative;width:220px;height:124px;margin:0 auto 18px}',
    '.am-draw__fan i{position:absolute;left:50%;top:12px;display:grid;place-items:center;width:72px;height:96px;margin-left:-36px;box-sizing:border-box;border:3px solid #5CD6FF;border-radius:12px;background:#FFFEF8;color:#2A9BC4;box-shadow:0 4px 0 #2A9BC4;font:700 34px Fredoka,Nunito,sans-serif;font-style:normal;transform:translateX(calc((var(--k) - 1.5) * 40px)) rotate(calc((var(--k) - 1.5) * 10deg));animation:amFan .6s cubic-bezier(.3,1.4,.5,1) both;animation-delay:calc(var(--k) * 90ms)}',
    '@keyframes amFan{0%{opacity:0;translate:0 40px}100%{opacity:1;translate:0 0}}',
    '.am-draw__title{margin:0 0 10px;font:700 34px/1.1 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-draw__intro p{max-width:540px;margin:0 auto 10px;font:800 17px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-draw__intro b{color:#FFE14D}',
    '.am-draw__intro .am-draw__note,.am-draw__note{margin:12px auto 0;font:800 14px/1.45 Nunito,sans-serif;color:#8496B6}',
    '.am-draw__prompt{display:grid;place-content:center;min-height:340px;text-align:center}',
    '.am-draw__pk{margin:0 0 6px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8496B6}',
    '.am-draw__pdraw{margin:0;font:700 24px Fredoka,Nunito,sans-serif;color:#5CD6FF;animation:amIn .4s ease both}',
    '.am-draw__pname{max-width:640px;margin:4px auto 14px;font:700 44px/1.1 Fredoka,Nunito,sans-serif;color:#fff;animation:amZoom .6s .12s cubic-bezier(.3,1.5,.5,1) both}',
    '@keyframes amZoom{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:none}}',
    '.am-draw__psub{margin:0;font:800 16px Nunito,sans-serif;color:#9FB0CC;animation:amIn .4s .35s ease both}',
    '.am-draw__stage{display:flex;justify-content:center;align-items:flex-start;gap:16px}',
    '.am-draw__left{display:flex;flex-direction:column;align-items:center;gap:12px;min-width:0}',
    '.am-draw__bank{flex:0 0 184px;display:flex;flex-direction:column;align-items:flex-start;gap:8px}',
    '.am-draw__bankh{margin:0 0 2px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8496B6}',
    '.am-draw__chip{max-width:100%;padding:6px 12px;border:2px solid #1F3FA8;border-radius:999px;background:#FFFFFF;color:#1F3FA8;text-align:left;font:800 13.5px/1.25 Nunito,sans-serif;box-shadow:0 3px 0 #8FA3D6;cursor:pointer;transition:transform .15s ease,background .15s ease,opacity .2s ease}',
    '.am-draw__chip:hover{transform:translateY(-1px)}',
    '.am-draw__chip:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-draw__chip.is-armed{border-color:#14243B;background:#FFE14D;color:#14243B;box-shadow:0 3px 0 #C98E00;transform:scale(1.06)}',
    '.am-draw__chip.is-placed{opacity:.45;box-shadow:none}',
    '.am-draw__chip.is-placed::before{content:"\\2713\\00a0"}',
    '.am-draw__study{display:flex;flex-direction:column;align-items:center;gap:12px}',
    '.am-draw__fig{box-shadow:0 0 0 3px #2A3D5E}',
    '.am-draw__studyhint{margin:0;font:800 16px/1.45 Nunito,sans-serif;color:#C9D6EE;text-align:center}',
    '.am-draw__clock--study .am-draw__ring{stroke:#5CD6FF}',
    '.am-draw__ref [data-label].dd-hl rect{fill:#FFE14D}',
    '.am-draw__ref [data-label].dd-hl text{fill:#14243B}',
    '.am-draw__check[aria-disabled="true"]{opacity:.55;cursor:default}',
    '.am-draw__check[aria-disabled="true"]:hover{border-color:#2A3D5E}',
    '.am-draw__check[aria-disabled="true"] em{color:#9FB0CC}',
    '@media (max-width:790px){.am-draw__stage{flex-direction:column;align-items:center}.am-draw__bank{flex:none;flex-direction:row;flex-wrap:wrap;justify-content:center;width:100%}.am-draw__bankh{width:100%;text-align:center}}',
    '.am-draw__paper{animation:amIn .35s ease both;position:relative;overflow:hidden;border-radius:14px;background-color:#FFFEF8;background-image:radial-gradient(#D5DCE8 1.2px,transparent 1.5px);background-size:22px 22px;box-shadow:0 0 0 3px #2A3D5E}',
    '.am-draw__canvas{display:block;touch-action:none}',
    '.am-draw__ghost{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:24px;text-align:center;font:800 22px Nunito,sans-serif;color:#BFC8D8;pointer-events:none}',
    '.am-draw__ghost[hidden]{display:none}',
    '.am-draw__tools{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}',
    '.am-draw__tool{display:flex;align-items:center;gap:7px;padding:8px 14px;border:2px solid #2A3D5E;border-radius:12px;background:#1B3150;color:#C9D6EE;font:700 15px Fredoka,Nunito,sans-serif;cursor:pointer}',
    '.am-draw__tool svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}',
    '.am-draw__tool:hover{border-color:#5CD6FF;color:#fff}',
    '.am-draw__tool:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-draw__timesup{position:absolute;left:50%;top:50%;padding:10px 24px;border-radius:16px;background:#E5484D;color:#FFFFFF;font:700 32px Fredoka,Nunito,sans-serif;white-space:nowrap;transform:translate(-50%,-50%) rotate(-6deg);animation:amStampIn .5s cubic-bezier(.3,1.6,.5,1) both}',
    '@keyframes amStampIn{0%{opacity:0;scale:2}100%{opacity:1;scale:1}}',
    '.am-draw__compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
    '.am-draw__panel{min-width:0;margin:0}',
    '.am-draw__panel figcaption{margin:0 0 6px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8496B6}',
    '.am-draw__mine{position:relative;overflow:hidden;aspect-ratio:3/2;border-radius:12px;background:#FFFEF8}',
    '.am-draw__mine canvas{display:block}',
    '.am-draw__blank{display:grid;place-items:center;height:100%;box-sizing:border-box;margin:0;padding:20px;text-align:center;font:800 15px/1.45 Nunito,sans-serif;color:#5E6F8A}',
    '.am-draw__replay{position:absolute;right:8px;bottom:8px;display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:50%;background:#14243B;color:#FFFFFF;cursor:pointer}',
    '.am-draw__replay svg{width:16px;height:16px;fill:currentColor}',
    '.am-draw__replay:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-draw__ref{overflow:hidden;border-radius:12px;line-height:0}',
    '.am-draw__ref svg{display:block;width:100%;height:auto}',
    '.am-draw__ref [data-part]{transition:opacity .5s ease,transform .6s cubic-bezier(.3,1.3,.5,1)}',
    '.am-draw__ref [data-part].dd-wait{opacity:0;transform:translateY(12px)}',
    '.am-draw__ref [data-label]{transform-box:fill-box;transform-origin:center;transition:opacity .25s ease,transform .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-draw__ref [data-label].dd-wait{opacity:0;transform:scale(.4)}',
    '.am-draw__checks{margin:16px 0 0}',
    '.am-draw__checksh{margin:0 0 8px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8496B6}',
    '.am-draw__checklist{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.am-draw__check{display:flex;align-items:center;gap:10px;padding:8px 12px;border:2px solid #2A3D5E;border-radius:12px;background:#1B3150;color:#E8EEFA;text-align:left;font:800 15px/1.3 Nunito,sans-serif;cursor:pointer;transition:border-color .15s ease,background .15s ease,opacity .3s ease}',
    '.am-draw__check i{flex:none;display:grid;place-items:center;width:24px;height:24px;box-sizing:border-box;border:2px solid #3A5078;border-radius:7px}',
    '.am-draw__check i svg{width:16px;height:16px;fill:none;stroke:#FFFFFF;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:0}',
    '.am-draw__check span{flex:1}',
    '.am-draw__check em{font:700 12px Fredoka,Nunito,sans-serif;font-style:normal;color:#7DF0B0;white-space:nowrap}',
    '.am-draw__check:hover{border-color:#5CD6FF}',
    '.am-draw__check:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-draw__check.is-on{border-color:#2BC46F;background:#173B2A}',
    '.am-draw__check.is-on i{border-color:#2BC46F;background:#2BC46F}',
    '.am-draw__check.is-on i svg{opacity:1}',
    '.am-draw__check.am-bump i{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-draw__tip{margin:14px 0 0;font:800 15px/1.5 Nunito,sans-serif;color:#C9D6EE}',
    '.am-draw__tip b{margin-right:8px;padding:2px 9px;border-radius:999px;background:#FFE14D;color:#14243B;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase}',
    '.am-draw__end{text-align:center}',
    '.am-draw__end .am-run__big small{font-size:.42em;color:#8496B6}',
    '.am-draw__book{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:4px 0 0}',
    '.am-draw__page{margin:0;padding:8px;border-radius:14px;background:#1B3150;text-align:left;cursor:pointer;animation:amIn .4s ease both}',
    '.am-draw__page:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-draw__thumb{overflow:hidden;aspect-ratio:3/2;border-radius:10px;background:#FFFEF8}',
    '.am-draw__thumb canvas{display:block}',
    '.am-draw__page figcaption{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 8px;margin:8px 2px 0;font:800 13px Nunito,sans-serif;color:#9FB0CC}',
    '.am-draw__page figcaption b{font:700 14px Fredoka,Nunito,sans-serif;color:#FFFFFF}',
    '.am-root .am-draw__intro p,.am-root .am-draw__intro b,.am-root .am-draw__note,.am-root .am-draw__psub,.am-root .am-draw__ghost,.am-root .am-draw__check span,.am-root .am-draw__tip,.am-root .am-draw__blank,.am-root .am-draw__page figcaption span,.am-root .am-draw__chip,.am-root .am-draw__studyhint{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-draw__title,.am-root .am-draw__pk,.am-root .am-draw__pdraw,.am-root .am-draw__pname,.am-root .am-draw__clock b,.am-root .am-draw__tool,.am-root .am-draw__bankh,.am-root .am-draw__panel figcaption,.am-root .am-draw__checksh,.am-root .am-draw__check em,.am-root .am-draw__tip b,.am-root .am-draw__timesup,.am-root .am-draw__fan i,.am-root .am-draw__page figcaption b,.am-root .am-run__big span,.am-root .am-run__big small{font-family:Fredoka,Nunito,sans-serif !important}',
    '@media (max-width:640px){.am-draw__compare,.am-draw__checklist{grid-template-columns:1fr}.am-draw__pname{font-size:32px}.am-draw__tool{padding:7px 10px}.am-draw__title{font-size:28px}}',
    '.am-train-tile--exam .am-train-tile__icon{background:#2BC46F;color:#FFFFFF;box-shadow:0 3px 0 #1E9A55}',
    '.am-train-tile--exam:hover{border-color:#2BC46F}',
    '.am-train-tile--exam .am-train-tile__go{border-color:#2BC46F}',
    '.am-finish__card.am-exam__card{width:min(720px,100%)}',
    '.am-exam__map{flex:1;display:flex;gap:4px}',
    '.am-exam__map i{flex:1;height:10px;border-radius:5px;background:#26395A;transition:background .3s ease}',
    '.am-exam__map i.is-on{background:#2BC46F}',
    '.am-exam__map i.am-exam__pop{animation:amPip .5s ease}',
    '.am-exam__body{min-height:330px;margin:4px 0 0}',
    '.am-exam__btns{margin-top:16px}',
    '.am-exam__intro,.am-exam__end{text-align:center}',
    '.am-exam__face{flex:none;width:76px;height:76px}',
    '.am-exam__face svg{display:block;width:100%;height:100%}',
    '.am-exam__face--big{width:112px;height:112px;margin:4px auto 6px}',
    '.am-exam__title{margin:0 0 10px;font:700 30px/1.15 Fredoka,Nunito,sans-serif;color:#FFFFFF}',
    '.am-exam__intro p{max-width:540px;margin:0 auto 10px;font:800 17px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-exam__intro b{color:#FFE14D}',
    '.am-exam__intro .am-exam__note{margin-top:14px;font-size:14px;color:#8496B6}',
    '.am-exam__who{display:flex;align-items:flex-start;gap:14px;margin:0 0 14px}',
    '.am-exam__bubble{position:relative;flex:1;padding:12px 16px;border-radius:16px;background:#FFFEF8;color:#13294A}',
    '.am-exam__bubble::before{content:"";position:absolute;left:-9px;top:20px;border:9px solid transparent;border-left:0;border-right-color:#FFFEF8}',
    '.am-exam__k{display:block;margin:0 0 2px;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#5E6F8A}',
    '.am-exam__ask{margin:0;font:800 20px/1.35 Nunito,sans-serif;color:#13294A}',
    '.am-exam__paper{position:relative;border-radius:12px;background-color:#FFFEF8;background-image:repeating-linear-gradient(#FFFEF8 0 31px,#CDEFF9 31px 32px);background-position:0 8px;box-shadow:0 0 0 2px #2A3D5E;transition:box-shadow .2s ease}',
    '.am-exam__paper:focus-within{box-shadow:0 0 0 2px #FFE14D}',
    '.am-exam__paper.is-ticked{box-shadow:0 0 0 3px #2BC46F}',
    '.am-exam__box{display:block;width:100%;min-height:104px;box-sizing:border-box;margin:0;padding:8px 150px 8px 14px;border:0;background:transparent;color:#13294A;font:800 18px/32px Nunito,sans-serif;resize:none;outline:none}',
    '.am-exam__mark{position:absolute;right:14px;top:10px;color:#14A04A;font:700 32px/1 Caveat,"Segoe Print","Comic Sans MS",cursive;text-align:right;transform:rotate(-6deg);pointer-events:none}',
    '.am-exam__mark:empty{display:none}',
    '.am-exam__mark--ok,.am-exam__mark--no{animation:amStampIn .45s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-exam__mark svg{display:block;width:62px;height:42px;fill:none;stroke:#14A04A;stroke-width:4.5;stroke-linecap:round}',
    '.am-exam__mark--ok span{position:absolute;right:-10px;top:-16px;font-size:26px}',
    '.am-exam__mark--no span{display:block;max-width:150px}',
    '.am-exam__tries{display:flex;justify-content:flex-end;gap:6px;margin:8px 2px 0}',
    '.am-exam__tries i{width:10px;height:10px;border-radius:50%;background:#33476A}',
    '.am-exam__tries i.is-used{background:#E5484D}',
    '.am-exam__says{min-height:50px;margin:8px 0 0;font:800 16px/1.5 Nunito,sans-serif;color:#C9D6EE}',
    '.am-exam__says b{margin-right:4px;font:700 17px Fredoka,Nunito,sans-serif;color:#FFFFFF}',
    '.am-exam__says em{display:block;margin-top:2px;font-style:normal;color:#FFE14D}',
    '.am-exam__model{display:block;margin-top:8px;padding:10px 12px;border-radius:12px;background:#173B2A;color:#E8EEFA}',
    '.am-exam__model b{color:#7DF0B0}',
    '.am-exam__teach{display:block;padding:10px 12px;border-radius:12px;background:#1B3150;color:#E8EEFA}',
    '.am-exam__teach b{color:#FFE14D}',
    '.am-exam__sum{margin:0 0 12px;font:800 17px Nunito,sans-serif;color:#C9D6EE}',
    '.am-exam__sum b{color:#FFFFFF}',
    '.am-exam__essay{max-height:230px;overflow:auto;margin:0;padding:12px 14px 12px 34px;border-radius:14px;background:#FFFEF8;color:#13294A;text-align:left;font:800 15px/1.5 Nunito,sans-serif}',
    '.am-exam__essay li{margin:0 0 6px;padding:0 4px}',
    '.am-exam__essay li.is-new{border-radius:4px;background:#D4F7E2}',
    '.am-root .am-exam__ask,.am-root .am-exam__intro p,.am-root .am-exam__intro b,.am-root .am-exam__says,.am-root .am-exam__says span,.am-root .am-exam__says em,.am-root .am-exam__model,.am-root .am-exam__model *,.am-root .am-exam__teach,.am-root .am-exam__teach b,.am-root .am-exam__sum,.am-root .am-exam__sum b,.am-root .am-exam__box{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-exam__k,.am-root .am-exam__says > b,.am-root .am-exam__title{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-exam__mark span{font-family:Caveat,"Segoe Print","Comic Sans MS",cursive !important}',
    '@media (max-width:600px){.am-exam__box{padding-right:14px;padding-bottom:44px}.am-exam__mark{top:auto;bottom:6px}.am-exam__face{width:56px;height:56px}.am-exam__ask{font-size:18px}.am-exam__title{font-size:24px}}',
    '.am-exam__face svg{overflow:visible}',
    '.am-exam__face .m-happy,.am-exam__face .m-angry,.am-exam__face .x-steam{display:none}',
    '.am-exam__face[data-mood="happy"] .m-ok,.am-exam__face[data-mood="angry"] .m-ok,.am-exam__face[data-mood="furious"] .m-ok{display:none}',
    '.am-exam__face[data-mood="happy"] .m-happy{display:inline}',
    '.am-exam__face[data-mood="angry"] .m-angry,.am-exam__face[data-mood="furious"] .m-angry{display:inline}',
    '.am-exam__face[data-mood="happy"] .x-lines{display:none}',
    '.am-exam__face[data-mood="furious"] .x-steam{display:inline}',
    '.am-exam__face .x-steam circle{fill:#E8EEFA;transform-box:fill-box;transform-origin:center;animation:amSteam 1.1s ease-out infinite}',
    '.am-exam__face .x-steam circle:nth-child(2n){animation-delay:.45s}',
    '@keyframes amSteam{0%{opacity:0;transform:translateY(6px) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translateY(-16px) scale(1.4)}}',
    '.am-exam__face .x-skin{transition:fill .3s ease}',
    '.am-exam__face[data-mood="angry"] .x-skin{fill:#F4AE90}',
    '.am-exam__face[data-mood="furious"] .x-skin{fill:#EE8366}',
    '.am-exam__face[data-mood="ok"] .x-eyes{transform-box:fill-box;transform-origin:center;animation:amExamBlink 4.5s infinite}',
    '@keyframes amExamBlink{0%,93%,100%{transform:none}95%{transform:scaleY(.1)}}',
    '.am-exam__face.is-react[data-mood="angry"] svg{animation:amShake .4s ease}',
    '.am-exam__face.is-react[data-mood="furious"] svg{animation:amShake .35s ease 3}',
    '.am-exam__face.is-react[data-mood="happy"] svg{animation:amHop .55s cubic-bezier(.3,1.6,.5,1)}',
    '@keyframes amHop{40%{transform:translateY(-8px) rotate(-5deg)}100%{transform:none}}',
    '.am-exam__line{margin:0 0 4px;font:700 20px Caveat,"Segoe Print","Comic Sans MS",cursive;color:#7DF0B0}',
    '.am-root .am-exam__line,.am-root .am-exam__intro .am-exam__line{margin:0 0 4px;font-family:Caveat,"Segoe Print","Comic Sans MS",cursive !important;font-size:26px;color:#7DF0B0}',
    '.am-mascot{--size:200px;position:absolute;left:14px;bottom:10px;z-index:6;width:var(--size);pointer-events:none;transform:translateY(calc(100% + 20px));transition:transform .55s cubic-bezier(.3,1.3,.5,1)}',
    '.am-mascot.is-on{transform:none}',
    '.am-mascot__face.am-exam__face{width:var(--size);height:var(--size)}',
    '.am-mascot__say{position:absolute;left:4px;bottom:calc(100% + 4px);width:max-content;max-width:calc(var(--size) + 60px);margin:0;padding:8px 14px;border-radius:16px 16px 16px 4px;background:#FFFEF8;color:#13294A;font:700 26px/1.1 Caveat,"Segoe Print","Comic Sans MS",cursive;opacity:0;transform:translateY(8px) scale(.9);transform-origin:0 100%;transition:opacity .2s ease,transform .3s cubic-bezier(.3,1.6,.5,1)}',
    '.am-mascot__say.is-on{opacity:1;transform:none}',
    '.am-root .am-mascot__say{font-family:Caveat,"Segoe Print","Comic Sans MS",cursive !important}',
    '.am-train-tile--games .am-train-tile__icon{background:#FF7B54;color:#FFFFFF;box-shadow:0 3px 0 #C9502E}',
    '.am-train-tile--games:hover{border-color:#FF7B54}',
    '.am-train-tile--games .am-train-tile__go{border-color:#FF7B54}',
    '.am-finish__card.am-games__card{width:min(720px,100%)}',
    '.am-games [hidden]{display:none !important}',
    '.am-games__body{min-height:300px}',
    '.am-games__btns{margin-top:16px}',
    '.am-games__btns .am-btn:disabled{opacity:.4;cursor:default;box-shadow:none;transform:none}',
    '.am-games .am-run__segs i.is-half{background:#FFC42E}',
    '.am-games__hub,.am-games__end{text-align:center}',
    '.am-games__title{margin:4px 0 6px;font:700 30px/1.15 Fredoka,Nunito,sans-serif;color:#FFFFFF}',
    '.am-games__sub{max-width:520px;margin:0 auto 18px;font:800 16px/1.5 Nunito,sans-serif;color:#C9D6EE}',
    '.am-games__sub b{color:#FFE14D}',
    '.am-games__list{display:grid;gap:10px;text-align:left}',
    '.am-games__tile{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border:2px solid #2A3D5E;border-bottom-width:4px;border-radius:16px;background:#1B3150;color:#FFFFFF;text-align:left;cursor:pointer;transition:border-color .2s ease}',
    '.am-games__tile:active{transform:translateY(2px)}',
    '.am-games__tile:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-games__icon{flex:0 0 48px;height:48px;border-radius:14px;display:grid;place-items:center;color:#14243B}',
    '.am-games__icon svg{width:26px;height:26px}',
    '.am-games__tile--chain .am-games__icon{background:#FFC42E;box-shadow:0 3px 0 #C98E00}',
    '.am-games__tile--level .am-games__icon{background:#5CD6FF;box-shadow:0 3px 0 #2A9BC4}',
    '.am-games__tile--mark .am-games__icon{background:#2BC46F;color:#FFFFFF;box-shadow:0 3px 0 #1E9A55}',
    '.am-games__tile--chain:hover{border-color:#FFC42E}',
    '.am-games__tile--level:hover{border-color:#5CD6FF}',
    '.am-games__tile--mark:hover{border-color:#2BC46F}',
    '.am-games__text{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}',
    '.am-games__text b{font:700 20px Fredoka,Nunito,sans-serif;color:#FFFFFF}',
    '.am-games__text span{font:800 14.5px/1.35 Nunito,sans-serif;color:#9FB0CC}',
    '.am-games__text em{font:800 13.5px Nunito,sans-serif;font-style:normal;color:#FFE14D}',
    '.am-games__step{flex:none;font:700 14px Fredoka,Nunito,sans-serif;color:#8496B6}',
    '.am-games__ask{margin:0 0 12px;font:800 17px/1.45 Nunito,sans-serif;color:#E8EEFA}',
    '.am-games__ask b{color:#FFE14D}',
    '.am-games__note{min-height:24px;margin:10px 0 0;font:800 15px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-games__note b{color:#7DF0B0}',
    '.am-games__big{margin:6px 0 0;font:700 72px/1 Fredoka,Nunito,sans-serif;color:#FFE14D}',
    '.am-games__big span{font-size:30px;color:#8496B6}',
    '.am-games__built{margin:6px 0 0;padding:14px 16px;border-radius:14px;background:#FFFEF8;text-align:left}',
    '.am-games__built h4{margin:0 0 8px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#5E6F8A}',
    '.am-games__built p{margin:0 0 8px;font:800 15px/1.5 Nunito,sans-serif;color:#13294A}',
    '.am-games__built .am-games__built-note{margin:0;color:#0B6B3A}',
    '.am-chain__slots{display:grid;gap:6px;margin:0 0 14px;padding:0;list-style:none}',
    '.am-chain__slots li{margin:0}',
    '.am-chain__slot{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;box-sizing:border-box;padding:6px 12px 6px 7px;border:2px dashed #33476A;border-radius:12px;background:transparent;color:#E8EEFA;text-align:left;font:800 16px/1.3 Nunito,sans-serif;cursor:default}',
    '.am-chain__slot.is-filled{border:2px solid #5CD6FF;background:#1B3150;cursor:pointer}',
    '.am-chain__slot.is-filled:hover{background:#22406A}',
    '.am-chain__slot.is-in{animation:amChainIn .3s cubic-bezier(.3,1.5,.5,1)}',
    '@keyframes amChainIn{0%{transform:scale(.95)}100%{transform:none}}',
    '.am-chain__slot.is-lock{border:2px solid #2BC46F;background:#173B2A;color:#7DF0B0}',
    '.am-chain__slot.is-bad{border:2px solid #E5484D;background:#3A1E26;color:#FFB3B5}',
    '.am-chain__slot.is-fall{animation:amDomino .5s cubic-bezier(.3,1.5,.5,1) both}',
    '@keyframes amDomino{0%{transform:none}35%{transform:translateY(-5px) rotate(-1.5deg)}100%{transform:none}}',
    '.am-chain__n{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#26395A;color:#9FB0CC;font:700 16px Fredoka,Nunito,sans-serif}',
    '.am-chain__slot.is-filled .am-chain__n{background:#5CD6FF;color:#0C1628}',
    '.am-chain__slot.is-lock .am-chain__n{background:#2BC46F;color:#FFFFFF}',
    '.am-chain__slot.is-bad .am-chain__n{background:#E5484D;color:#FFFFFF}',
    '.am-chain__pool{display:flex;flex-wrap:wrap;gap:8px}',
    '.am-chain__tile{padding:10px 14px;border:2px solid #D5DCE8;border-bottom-width:4px;border-radius:12px;background:#FFFEF8;color:#13294A;font:800 15.5px/1.3 Nunito,sans-serif;text-align:left;cursor:pointer;animation:amIn .25s ease both}',
    '.am-chain__tile:hover{border-color:#5CD6FF}',
    '.am-chain__tile:active{transform:translateY(2px)}',
    '.am-chain__tile:focus-visible,.am-chain__slot:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-chain__why{padding:14px 16px;border-radius:14px;background:#FFFEF8;animation:amIn .35s ease .3s both}',
    '.am-chain__why p{margin:0;font:800 16px/1.6 Nunito,sans-serif;color:#13294A}',
    '.am-chain__why p b{color:#13294A;box-shadow:inset 0 -.42em 0 #FFE98A}',
    '.am-chain__why .am-chain__say{display:block;margin:0 0 2px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#5E6F8A;box-shadow:none}',
    '.am-chain__stars{display:flex;gap:6px;margin:0 0 8px}',
    '.am-chain__stars i{width:30px;height:30px;color:#D5DCE8}',
    '.am-chain__stars svg{display:block;width:100%;height:100%;fill:currentColor}',
    '.am-chain__stars i.is-on{color:#FFC42E;animation:amPop .45s cubic-bezier(.3,1.6,.5,1) .35s both}',
    '.am-chain__stars i.is-on:nth-child(2){animation-delay:.5s}',
    '.am-chain__stars i.is-on:nth-child(3){animation-delay:.65s}',
    '.am-level__paper{margin:0 0 14px;padding:14px 16px 12px;border-radius:14px;background:#FFFEF8}',
    '.am-level__rows{display:grid;gap:8px}',
    '.am-level__row{display:flex;align-items:baseline;gap:10px}',
    '.am-level__row p{margin:0;font:800 17px/1.45 Nunito,sans-serif;color:#13294A}',
    '.am-level__row.is-new{animation:amIn .4s ease both}',
    '.am-level__tag{flex:none;width:100px;padding:3px 0;border-radius:6px;background:#E3E9F4;color:#4A5B78;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;text-align:center}',
    '.am-level__row:nth-child(2) .am-level__tag{background:#D7F1FF;color:#1D6E8E}',
    '.am-level__row:nth-child(3) .am-level__tag{background:#D4F7E2;color:#0B6B3A}',
    '.am-level__meter{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:12px}',
    '.am-level__meter i{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#E3E9F4;color:#8496B6;font:700 14px/1 Fredoka,Nunito,sans-serif;font-style:normal;transition:background .3s ease,color .3s ease}',
    '.am-level__meter i.is-on{background:#2BC46F;color:#FFFFFF}',
    '.am-level__meter i.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-level__meter span{margin-left:2px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#5E6F8A}',
    '.am-level__why{display:block;margin-top:4px;font:800 14px/1.4 Nunito,sans-serif;color:#FFB3B5}',
    '.am-level__why b{color:#FF9A9D}',
    '.am-games__rules{display:inline-block;margin:-4px 0 12px;padding:0;border:0;background:none;color:#8FE3FF;font:800 15px Nunito,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
    '.am-games__rules:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-games__rulebox{margin:-2px 0 14px;padding:10px 12px;border-radius:12px;background:#1B3150;font:800 15px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-games__rulebox b{color:#FFE14D}',
    '.am-mark__paper{position:relative;padding:6px 12px 6px 0;border-radius:14px;background:#FFFEF8;box-shadow:inset 46px 0 0 #FFFEF8,inset 47px 0 0 #F4B6B6}',
    '.am-mark__who{display:flex;align-items:center;gap:10px;min-height:40px;padding:2px 0 6px 58px}',
    '.am-mark__name{font:700 26px/1 Caveat,"Segoe Print","Comic Sans MS",cursive;color:#1F3FA8}',
    '.am-student{flex:none;width:60px;height:60px}',
    '.am-student svg{display:block;width:100%;height:100%;overflow:visible}',
    '.am-student .m-wait,.am-student .m-happy,.am-student .m-upset,.am-student .m-smug{display:none}',
    '.am-student[data-mood="wait"] .m-wait,.am-student[data-mood="happy"] .m-happy,.am-student[data-mood="upset"] .m-upset,.am-student[data-mood="smug"] .m-smug{display:inline}',
    '.am-student.is-react svg{animation:amHop .55s cubic-bezier(.3,1.6,.5,1)}',
    '.am-student[data-mood="upset"].is-react svg{animation:amShake .4s ease}',
    '.am-mark__says{position:relative;margin:0 0 0 6px;padding:6px 12px;border-radius:12px;background:#E6EEFF;color:#1F3FA8;font:700 22px/1.1 Caveat,"Segoe Print","Comic Sans MS",cursive;animation:amIn .3s ease both}',
    '.am-mark__says:empty{display:none}',
    '.am-mark__says::before{content:"";position:absolute;left:-7px;top:50%;margin-top:-7px;border:7px solid transparent;border-left:0;border-right-color:#E6EEFF}',
    '.am-mark__row{display:grid;grid-template-columns:46px 1fr auto;align-items:start;column-gap:12px;padding:7px 0;border-top:1px solid #CDEFF9}',
    '.am-mark__n{display:grid;place-items:center;height:32px;font:700 13px Fredoka,Nunito,sans-serif;color:#B8C2D4}',
    '.am-mark__n svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}',
    '.am-mark__row.is-right .am-mark__n{color:#14A04A}',
    '.am-mark__row.is-wrong .am-mark__n{color:#E5484D}',
    '.am-mark__row.is-wrong{background:#FFF0F0}',
    '.am-mark__row.is-right,.am-mark__row.is-wrong{animation:amIn .35s ease both}',
    '.am-mark__text{margin:0;padding-top:3px;font:700 24px/1.2 Caveat,"Segoe Print","Comic Sans MS",cursive;color:#1F3FA8}',
    '.am-mark__btns{display:flex;gap:6px}',
    '.am-mark__btn{display:grid;place-items:center;width:46px;height:40px;padding:0;border:2px solid #D5DCE8;border-radius:10px;background:#FFFFFF;color:#8496B6;cursor:pointer;transition:background .15s ease,border-color .15s ease}',
    '.am-mark__btn svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3.2;stroke-linecap:round}',
    '.am-mark__btn:hover:not([aria-disabled="true"]){border-color:#14A04A;color:#14A04A}',
    '.am-mark__btn--x:hover:not([aria-disabled="true"]){border-color:#E5484D;color:#E5484D}',
    '.am-mark__btn[aria-pressed="true"]{border-color:#14A04A;background:#14A04A;color:#FFFFFF !important}',
    '.am-mark__btn--x[aria-pressed="true"]{border-color:#E5484D;background:#E5484D}',
    '.am-mark__btn[aria-disabled="true"]{cursor:default}',
    '.am-mark.is-marked .am-mark__btn[aria-pressed="false"]{opacity:.3}',
    '.am-mark__btn:focus-visible{outline:2px solid #1F3FA8;outline-offset:2px}',
    '.am-mark__why{grid-column:2 / 4;margin:4px 0 2px;font:800 14.5px/1.45 Nunito,sans-serif;color:#3A4A66}',
    '.am-mark__tag{display:inline-block;margin-right:6px;padding:1px 8px;border-radius:6px;font:700 12.5px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase}',
    '.am-mark__tag--srp{background:#D4F7E2;color:#0B6B3A}',
    '.am-mark__tag--no{background:#FFE1E1;color:#B3262B}',
    '.am-mark__sum{margin:0 0 14px;padding:12px 14px;border-radius:14px;background:#3A1E26;font:800 16px/1.5 Nunito,sans-serif;color:#E8EEFA;animation:amIn .35s ease both}',
    '.am-mark__sum.is-good{background:#173B2A}',
    '.am-mark__sum b{color:#FFE14D}',
    '.am-root .am-games__sub,.am-root .am-games__text span,.am-root .am-games__ask,.am-root .am-games__note,.am-root .am-chain__slot,.am-root .am-chain__t,.am-root .am-chain__tile,.am-root .am-chain__why p,.am-root .am-level__row p,.am-root .am-games__rules,.am-root .am-games__rulebox,.am-root .am-mark__why,.am-root .am-mark__sum,.am-root .am-games__built p{font-family:Nunito,system-ui,sans-serif !important;font-weight:800 !important}',
    '.am-root .am-games__title,.am-root .am-games__step,.am-root .am-chain__n,.am-root .am-level__tag,.am-root .am-level__meter span,.am-root .am-mark__n,.am-root .am-games__big,.am-root .am-games__big span{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-mark__text,.am-root .am-mark__name,.am-root .am-mark__says{font-family:Caveat,"Segoe Print","Comic Sans MS",cursive !important}',
    '@media (max-width:600px){.am-games__title{font-size:25px}.am-games__icon{flex-basis:42px;height:42px}.am-chain__slot{font-size:15px}.am-chain__tile{font-size:14.5px}.am-level__row{flex-direction:column;gap:3px}.am-level__tag{width:auto;padding:2px 8px}.am-mark__paper{box-shadow:inset 30px 0 0 #FFFEF8,inset 31px 0 0 #F4B6B6}.am-mark__who{padding-left:38px;flex-wrap:wrap}.am-student{width:50px;height:50px}.am-mark__row{grid-template-columns:30px 1fr;column-gap:8px}.am-mark__btns{grid-column:2;justify-content:flex-end;margin-top:4px}.am-mark__why{grid-column:2}.am-mark__text{font-size:22px}.am-games__big{font-size:60px}}',
    '.am-finish__card.am-games__card.am-games__card--wide{width:min(900px,100%)}',
    '.am-order__main{display:flex;align-items:flex-start;gap:18px;margin:0 0 14px}',
    '.am-order__main .am-chain__slots{flex:1;min-width:0;margin:0}',
    '.am-order__art{flex:0 0 330px;border-radius:14px;overflow:hidden;line-height:0;background:#E3F5FC}',
    '.am-order__art svg{display:block;width:100%;height:auto}',
    '.am-order__art [data-step],.am-order__art [data-badge]{opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease,visibility 0s linear .5s}',
    '.am-order__art [data-step].is-on,.am-order__art [data-badge].is-on{opacity:1;visibility:visible;transform:none;transition:opacity .5s ease,transform .5s cubic-bezier(.3,1.4,.5,1)}',
    '.am-order__art [data-until].is-off{opacity:0;visibility:hidden;transition:opacity .5s ease,visibility 0s linear .5s}',
    '.am-order__art .x-pop{transform-box:fill-box;transform-origin:center}',
    '.am-order__art [data-badge].is-on .x-pop{animation:amPop .45s cubic-bezier(.3,1.6,.5,1) .15s both}',
    '.am-order__art .x-sway{transform-box:fill-box;transform-origin:50% 100%}',
    '.am-order__art .x-sway.is-live{animation:amSway 2.8s ease-in-out infinite}',
    '@keyframes amSway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}',
    '@media (prefers-reduced-motion:reduce){.am-order__art .is-live,.am-order__art .x-pop{animation:none !important}.am-order__art [data-step],.am-order__art [data-badge]{transform:none}}',
    '@media (max-width:760px){.am-order__main{flex-direction:column;align-items:stretch}.am-order__art{flex:none;order:-1;width:100%;max-width:380px;margin:0 auto}}',
    '.am-level__paper.has-pic{display:grid;grid-template-columns:minmax(0,1fr) 200px;column-gap:16px;align-items:start}',
    '.am-level__paper.has-pic .am-level__rows,.am-level__paper.has-pic .am-level__meter{grid-column:1}',
    '.am-level__pic{grid-column:2;grid-row:1 / span 2;border-radius:10px;overflow:hidden;line-height:0}',
    '.am-level__pic svg{display:block;width:100%;height:auto}',
    '@media (max-width:600px){.am-level__paper.has-pic{grid-template-columns:1fr}.am-level__pic{grid-column:1;grid-row:auto;width:100%;max-width:260px;margin:0 0 12px}}',
    '.am-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',
    '.am-run{position:relative}',
    '.am-run__hud{display:flex;align-items:center;gap:12px;margin:-6px 0 8px}',
    '.am-run__quit{flex:none;display:grid;place-items:center;width:36px;height:36px;margin-left:-8px;border:0;border-radius:10px;background:transparent;color:#8496B6;cursor:pointer}',
    '.am-run__quit svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round}',
    '.am-run__quit:hover{color:#fff;background:#1B3150}',
    '.am-run__quit:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-run__segs{flex:1;display:flex;gap:4px}',
    '.am-run__segs i{flex:1;height:10px;border-radius:5px;background:#26395A;transition:background .3s ease}',
    '.am-run__segs i.is-current{background:#5CD6FF}',
    '.am-run__segs i.is-ok{background:#2BC46F}',
    '.am-run__segs i.is-no{background:#E5484D}',
    '.am-run__hearts{flex:none;display:flex;gap:2px}',
    '.am-run__heart{display:block;width:24px;height:24px;color:#FF5A6E}',
    '.am-run__heart svg{display:block;width:100%;height:100%;fill:currentColor}',
    '.am-run__heart.is-lost{color:#33476A}',
    '.am-run__heart--break{animation:amHeartOut .5s ease}',
    '.am-run__heart--gain{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '@keyframes amHeartOut{0%{transform:scale(1);color:#FF5A6E}35%{transform:scale(1.35) rotate(-12deg);color:#FF5A6E}100%{transform:none}}',
    '.am-run__score{flex:none;display:flex;align-items:baseline;justify-content:flex-end;gap:4px;min-width:76px}',
    '.am-run__score b{display:inline-block;font:700 26px Fredoka,Nunito,sans-serif;color:#FFE14D;font-variant-numeric:tabular-nums}',
    '.am-run__score b.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-run__score span{font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8496B6}',
    '.am-run__timer{height:4px;margin:0 0 16px;border-radius:2px;overflow:hidden}',
    '.am-run__timer i{display:block;height:100%;width:0;border-radius:2px;background:#FFC42E}',
    '.am-run__timer i.is-running{width:100%;animation:amDrain 6s linear forwards}',
    '.am-run__timer i.is-clock{transition:width 1s linear}',
    '@keyframes amDrain{from{width:100%}to{width:0}}',
    '.am-run__main{display:flex;gap:18px;align-items:stretch}',
    '.am-run__stage{flex:1;min-width:0}',
    '.am-run__top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px}',
    '.am-run__kind{margin:0;font:700 24px/1.15 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-run__combo{flex:none;padding:5px 12px;border-radius:999px;background:#FFC42E;color:#14243B;box-shadow:0 3px 0 #C98E00;font:700 14px Fredoka,Nunito,sans-serif;white-space:nowrap}',
    '.am-run__combo[hidden]{display:none}',
    '.am-run__combo.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-run .am-train__body{min-height:330px}',
    '.am-run__in{animation:amCardIn .35s cubic-bezier(.3,1.3,.5,1) both}',
    '@keyframes amCardIn{0%{opacity:0;transform:translateX(28px)}100%{opacity:1;transform:none}}',
    '.am-run__ask{display:flex;align-items:center;gap:16px;margin:0 0 16px}',
    '.am-run__pic{flex:none;width:118px;border-radius:12px;overflow:hidden;line-height:0}',
    '.am-run__pic svg{display:block;width:100%;height:auto}',
    '.am-run__q{position:relative;margin:0;font:800 20px/1.35 Nunito,sans-serif;color:#fff}',
    '#am-run-q:focus{outline:none}',
    '.am-run__ask--teach{align-items:flex-start;margin:0 0 14px;padding:14px;border-radius:16px;background:#1B3150}',
    '.am-run__new{display:inline-block;margin:0 0 6px;padding:2px 10px;border-radius:999px;background:#5CD6FF;color:#0C1628;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase}',
    '.am-run__say{margin:0;font:800 16px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-run__say b{color:#FFE14D}',
    '.am-run__q--small{margin:0 0 12px;font-size:18px}',
    '.am-run__opts{display:grid;gap:8px}',
    '.am-run__opts--tiles,.am-run__opts--two{grid-template-columns:1fr 1fr;gap:10px}',
    '.am-run__opt{position:relative;display:flex;align-items:center;gap:12px;text-align:left;border:2px solid #2A3D5E;border-bottom-width:4px;border-radius:14px;background:#1B3150;color:#E8EEFA;padding:10px 12px;font:800 16px/1.3 Nunito,sans-serif;cursor:pointer;transition:border-color .15s ease,background .15s ease}',
    '.am-run__opt:hover:not([aria-disabled="true"]){border-color:#5CD6FF}',
    '.am-run__opt:active:not([aria-disabled="true"]){transform:translateY(2px)}',
    '.am-run__opt:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-run__opt[aria-disabled="true"]{cursor:default}',
    '.am-run__opt kbd{flex:none;display:grid;place-items:center;width:24px;height:24px;border:2px solid #3A5078;border-radius:7px;font:700 13px Fredoka,Nunito,sans-serif;color:#8496B6}',
    '.am-run__opt--ok{border-color:#2BC46F !important;background:#173B2A;color:#7DF0B0}',
    '.am-run__opt--ok kbd{border-color:#2BC46F;color:#7DF0B0}',
    '.am-run__opt--no{border-color:#E5484D !important;background:#3A1E26;color:#FFB3B5}',
    '.am-run__opt--no kbd{border-color:#E5484D;color:#FFB3B5}',
    '.am-run__opts--tiles .am-run__opt{font-size:18px;padding:12px}',
    '.am-run__opts--two .am-run__opt{justify-content:center;padding:16px 12px;font:700 19px Fredoka,Nunito,sans-serif}',
    '.am-run__gap{margin:4px 0 22px;padding:22px 20px;border-radius:18px;background:#FFFEF8;color:#13294A;text-align:center;font:800 21px/1.7 Nunito,sans-serif}',
    '.am-run__slot{display:inline-block;min-width:110px;margin:0 3px;padding:0 8px;border-bottom:3px solid #13294A;line-height:1.35;vertical-align:baseline}',
    '.am-run__slot--ok{border-color:#2BC46F;border-radius:6px 6px 0 0;background:#D4F7E2;color:#14763F}',
    '.am-run__slot--no{border-color:#C98E00;border-radius:6px 6px 0 0;background:#FFE45C;color:#13294A}',
    '.am-run .am-judge__s{margin:4px 0 22px}',
    '.am-run .am-run__input{display:block;width:100%;text-align:left}',
    '.am-run__input--ok{border-color:#2BC46F;background:#E9FBEF}',
    '.am-run__input--no{border-color:#E5484D;background:#FFF1EC}',
    '.am-run .am-flip__hint{margin:8px 0 0}',
    '.am-run .am-flip__hintline{margin:12px 0 0;max-width:none}',
    '.am-run__side{flex:none;width:84px;display:flex;flex-direction:column;align-items:center}',
    '.am-build{flex:1;width:100%;min-height:220px;display:flex;flex-direction:column-reverse;gap:2px;box-sizing:border-box;padding:0 6px;border-bottom:4px solid #4B5E80;overflow:hidden;transform-origin:50% 100%;transition:transform .7s cubic-bezier(.3,1.4,.5,1),gap .7s ease}',
    '.am-build__l{display:block;flex:none;height:20px;border-radius:3px;background:#E9C46A}',
    '.am-build__l--1{height:15px;background:#A48A6A}',
    '.am-build__l--2{height:22px;background:#DCD5C3}',
    '.am-build__l--3{height:17px;background:#C4683F}',
    '.am-build__l--4{height:13px;background:#8A8390}',
    '.am-build__l--drop{animation:amDrop .55s cubic-bezier(.3,1.3,.5,1) both}',
    '@keyframes amDrop{0%{transform:translateY(-260px)}100%{transform:none}}',
    '.am-build--rock{gap:0;transform:scaleY(.84)}',
    '.am-build--tower{align-items:center;border-bottom-color:#5B7A4A}',
    '.am-build--tower .am-build__l{position:relative;width:60px;height:22px;border-radius:2px;background:#C9D6EE}',
    '.am-build--tower .am-build__l--1,.am-build--tower .am-build__l--3{background:#AFC0DD}',
    '.am-build--tower .am-build__l::before,.am-build--tower .am-build__l::after{content:"";position:absolute;top:7px;width:10px;height:8px;border-radius:1px;background:#14243B}',
    '.am-build--tower .am-build__l::before{left:11px}',
    '.am-build--tower .am-build__l::after{right:11px}',
    '.am-build--quake{animation:amQuake 1s ease}',
    '@keyframes amQuake{0%,100%{transform:none}10%{transform:translateX(-5px) rotate(-1.5deg)}25%{transform:translateX(5px) rotate(1.5deg)}40%{transform:translateX(-4px) rotate(-1deg)}55%{transform:translateX(4px) rotate(1deg)}70%{transform:translateX(-2px)}85%{transform:translateX(2px)}}',
    '.am-build__cap{margin:8px 0 0;font:800 12px/1.3 Nunito,sans-serif;color:#8496B6;text-align:center}',
    '.am-run__btns{margin-top:18px;min-height:52px}',
    '.am-run__sheet{flex:1;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;animation:amSheet .3s cubic-bezier(.3,1.3,.5,1) both}',
    '@keyframes amSheet{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:none}}',
    '.am-run__sheet--ok{background:#173B2A}',
    '.am-run__sheet--no{background:#3A1E26}',
    '.am-run__sheettext{flex:1;min-width:0}',
    '.am-run__verdict{margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;font:700 21px Fredoka,Nunito,sans-serif;color:#7DF0B0}',
    '.am-run__sheet--no .am-run__verdict{color:#FF9A9D}',
    '.am-run__verdict b{color:#FFE14D}',
    '.am-run__verdict span{font:800 14px Nunito,sans-serif;color:#C9D6EE}',
    '.am-run__fb{margin:4px 0 0;font:800 15px/1.45 Nunito,sans-serif;color:#E8EEFA}',
    '.am-run__fb b{color:#FFE14D}',
    '.am-run__exam{display:block}',
    '.am-run__exam > span{display:block;margin:0 0 2px;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#8496B6}',
    '.am-run__sheetbtns{flex:none;display:flex;flex-direction:column;align-items:stretch;gap:4px}',
    '.am-root .am-run__sheet .am-btn{flex:none;min-width:140px}',
    '.am-run__sheet--no .am-btn--ok{background:#E5484D;box-shadow:0 4px 0 #A8282C}',
    '.am-run__sheet--no .am-btn--ok:active{box-shadow:0 1px 0 #A8282C}',
    '.am-run__override{border:0;background:transparent;padding:4px;color:#C9D6EE;font:700 14px Fredoka,Nunito,sans-serif;text-decoration:underline;cursor:pointer}',
    '.am-run__override:hover{color:#fff}',
    '.am-run__end{text-align:center}',
    '.am-run__big{font:700 84px/1 Fredoka,Nunito,sans-serif;color:#FFE14D;font-variant-numeric:tabular-nums;animation:amPop .6s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-run__sub{margin:6px 0 14px;font:800 16px/1.4 Nunito,sans-serif;color:#C9D6EE}',
    '.am-run__stats{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 16px}',
    '.am-run__stats span{padding:6px 12px;border-radius:12px;background:#1B3150;font:800 14px Nunito,sans-serif;color:#C9D6EE}',
    '.am-run__stats b{margin-right:4px;font:700 18px Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-run__points{padding:12px 14px;border-radius:14px;background:#1B3150;text-align:left}',
    '.am-run__pointsh{margin:0 0 6px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#8496B6}',
    '.am-run__point{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0;font:800 15px Nunito,sans-serif;color:#E8EEFA}',
    '.am-run__dots{flex:none;display:flex;gap:4px}',
    '.am-run__dots i{width:10px;height:10px;border-radius:50%;background:#33476A}',
    '.am-run__dots i.on{background:#2BC46F}',
    '.am-run__pointsnote{margin:8px 0 0;font:800 13px/1.4 Nunito,sans-serif;color:#8496B6}',
    '.am-run--end .am-run__timer i{visibility:hidden}',
    '.am-run--sprint .am-run__segs,.am-run--sprint .am-run__hearts,.am-run--sprint .am-run__score,.am-run--sprint .am-run__side{display:none}',
    '.am-run--sprint .am-run__hud{justify-content:space-between}',
    '.am-root .am-run__q,.am-root .am-run__say,.am-root .am-run__say b,.am-root .am-run__opt span,.am-root .am-run__gap,.am-root .am-run__gap span,.am-root .am-run__fb,.am-root .am-run__fb *,.am-root .am-run__verdict span,.am-root .am-run__sub,.am-root .am-run__stats span,.am-root .am-run__point span,.am-root .am-run__pointsnote,.am-root .am-build__cap{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-run__kind,.am-root .am-run__new,.am-root .am-run__combo,.am-root .am-run__score b,.am-root .am-run__score span,.am-root .am-run__opt kbd,.am-root .am-run__opts--two .am-run__opt span,.am-root .am-run__verdict,.am-root .am-run__verdict b,.am-root .am-run__exam > span,.am-root .am-run__big,.am-root .am-run__stats b,.am-root .am-run__pointsh,.am-root .am-run__override{font-family:Fredoka,Nunito,sans-serif !important}',
    '@media (max-width:600px){.am-run__kind{font-size:20px}.am-run__side{width:52px}.am-build__cap{display:none}.am-run__main{gap:12px}.am-run__ask{flex-direction:column;align-items:flex-start}.am-run__pic{width:96px}.am-run__opts--tiles{grid-template-columns:1fr}.am-run__sheet{flex-direction:column;align-items:stretch}.am-run__big{font-size:64px}}',
    '.am-judge__s:focus{outline:none}',
    '.am-flip__hint{margin:0;font:800 14px Nunito,sans-serif;color:#8496B6}',
    '.am-flip__input{width:min(420px,100%);box-sizing:border-box;padding:12px 16px;border:2px solid #2A3D5E;border-radius:14px;background:#FFFEF8;color:#13294A;font:800 18px Nunito,sans-serif;text-align:center}',
    '.am-flip__input:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-flip__hintline{margin:2px 0 0;font:800 15px/1.4 Nunito,sans-serif;color:#C9D6EE;max-width:440px}',
    '.am-flip__hintline b{color:#FFE14D}',
    '.am-flip__hintline--open{animation:amIn .3s ease both}',
    '.am-flip__hintbtn{border:2px solid #2A3D5E;border-radius:999px;background:transparent;color:#FFE14D;padding:4px 14px;font:700 14px Fredoka,Nunito,sans-serif;cursor:pointer}',
    '.am-flip__hintbtn:hover{border-color:#FFE14D}',
    '.am-root .am-flip__hintline,.am-root .am-flip__hintline *:not(button){font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-flip__hintbtn,.am-root .am-flip__hintline b{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-flip__hint--warn{color:#FFB18F !important}',
    '.am-judge__s{position:relative;margin:28px 0 18px;padding:24px;border-radius:18px;background:#FFFEF8;color:#13294A;text-align:center;font:800 22px/1.45 Nunito,sans-serif}',
    '.am-sprint__intro p{margin:0 0 12px;font:800 19px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-sprint__intro b,.am-sprint__next b{color:#FFE14D}',
    '.am-sprint__best{color:#9FB0CC !important}',
    '.am-sprint__head{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 10px}',
    '.am-sprint__count{font:700 20px Fredoka,Nunito,sans-serif;color:#9FB0CC}',
    '.am-sprint__count b{display:inline-block;font-size:46px;color:#5BE39A;font-variant-numeric:tabular-nums}',
    '.am-sprint__count b.am-bump{animation:amBump .45s cubic-bezier(.3,1.6,.5,1)}',
    '.am-sprint__clock{font:700 36px Fredoka,Nunito,sans-serif;color:#fff;font-variant-numeric:tabular-nums}',
    '.am-sprint__clock--low{color:#FF8A6B}',
    '.am-sprint__box{display:block;width:100%;box-sizing:border-box;min-height:190px;resize:vertical;border:2px solid #2A3D5E;border-radius:12px;background:#FFFEF8;color:#13294A;padding:12px 14px;font:800 18px/1.5 Nunito,sans-serif;overscroll-behavior:contain}',
    '.am-sprint__box:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-sprint__chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}',
    '.am-sprint__chip{padding:4px 10px;border:2px solid #2BC46F;border-radius:999px;background:#173B2A;color:#7DF0B0;font:800 13px Nunito,sans-serif;animation:amPop .4s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-sprint__chip--gold{border-color:#FFC42E;background:#3A2E05;color:#FFD86B}',
    '.am-sprint__result{text-align:center}',
    '.am-sprint__big{font:700 84px/1 Fredoka,Nunito,sans-serif;color:#5BE39A;animation:amPop .6s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-sprint__sub{margin:6px 0 14px;font:800 17px Nunito,sans-serif;color:#C9D6EE}',
    '.am-sprint__result .am-sprint__chips{justify-content:center}',
    '.am-sprint__next{margin:16px 0 0;font:800 16px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-root .am-flip__hint,.am-root .am-flip__input,.am-root .am-judge__s,.am-root .am-sprint__intro p,.am-root .am-sprint__intro b,.am-root .am-sprint__box,.am-root .am-sprint__chip,.am-root .am-sprint__sub,.am-root .am-sprint__next,.am-root .am-sprint__next b{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-sprint__count,.am-root .am-sprint__count b,.am-root .am-sprint__clock,.am-root .am-sprint__big{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-teach__card{width:min(600px,100%)}',
    '.am-teach__title{margin:4px 0 14px;font:700 28px/1.15 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-teach__pic{width:min(300px,70%);margin:0 0 16px;border-radius:14px;overflow:hidden;line-height:0}',
    '.am-teach__pic svg{width:100%;height:auto;display:block}',
    '.am-teach__say{margin:0 0 20px;font:800 18px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-teach__say b{color:#FFE14D}',
    '.am-teach__test,.am-teach__write{margin:0 0 18px}',
    '.am-teach__step{margin:0 0 6px;font:700 14px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8496B6}',
    '.am-teach__box{display:block;width:100%;box-sizing:border-box;resize:vertical;min-height:96px;border:2px solid #2A3D5E;border-radius:12px;background:#FFFEF8;color:#13294A;padding:10px 12px;font:800 18px/1.45 Nunito,sans-serif;overscroll-behavior:contain}',
    '.am-teach__box:focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-teach__write{position:relative}',
    '.am-teach__model{margin:12px 0 0;padding:12px 14px;border-radius:12px;background:#1B3150;font:800 16px/1.5 Nunito,sans-serif;color:#E8EEFA}',
    '.am-teach__model span{display:block;margin-bottom:4px;font:700 13px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#8496B6}',
    '.am-teach__model b{color:#FFE14D}',
    '.am-teach__model em{display:block;margin-top:6px;font-style:normal;color:#9FB0CC;font-size:14px}',
    '.am-teach__q{margin:0 0 10px;font:800 17px/1.4 Nunito,sans-serif;color:#5CD6FF}',
    '.am-teach__why{margin:10px 0 0;font:800 15px/1.45 Nunito,sans-serif;color:#FF9A9D}',
    '.am-teach__why--ok{color:#7DF0B0}',
    '.am-teach__others{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 20px}',
    '.am-teach__others[hidden]{display:none}',
    '.am-teach__others span{font:700 14px Fredoka,Nunito,sans-serif;color:#9FB0CC;margin-right:4px}',
    '.am-teach__chip{border:2px solid #2A3D5E;background:transparent;color:#C9D6EE;border-radius:999px;padding:5px 12px;font:800 13px Nunito,sans-serif;cursor:pointer}',
    '.am-teach__chip:hover{border-color:#5CD6FF;color:#fff}',
    '.am-root .am-teach__say,.am-root .am-teach__say *,.am-root .am-teach__q,.am-root .am-teach__why,.am-root .am-teach__why *,.am-root .am-teach__chip,.am-root .am-teach__box,.am-root .am-teach__model,.am-root .am-teach__model *:not(span){font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-teach__step,.am-root .am-teach__model span{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-teach__title,.am-root .am-teach__others span{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-dump__card{width:min(820px,100%);max-height:calc(100% - 24px)}',
    '.am-dump__top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}',
    '.am-dump__title{margin:4px 0 10px;font:700 32px/1.1 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-dump__clock{font:700 40px Fredoka,Nunito,sans-serif;color:#5BE39A;font-variant-numeric:tabular-nums}',
    '.am-dump__clock--low{color:#FF8A6B;animation:amShake .4s ease}',
    '.am-dump__bar{height:8px;border-radius:4px;background:#26395A;overflow:hidden;margin-bottom:14px}',
    '.am-dump__bar i{display:block;height:100%;width:100%;background:#5BE39A;border-radius:4px;transition:width 1s linear}',
    '.am-dump__bar--score i{background:#2BC46F;transition:width .8s cubic-bezier(.22,.8,.2,1)}',
    '.am-dump__how{margin:0 0 12px;font:800 18px/1.4 Nunito,sans-serif;color:#C9D6EE}',
    '.am-dump__how b{color:#FFE14D}',
    '.am-dump__box{display:block;width:100%;box-sizing:border-box;height:352px;resize:none;border:0;border-radius:14px;padding:0 14px;margin-bottom:16px;background-color:#FFFEF8;background-image:repeating-linear-gradient(transparent 0 36px,#C7D3E6 36px 38px,transparent 38px 44px);background-attachment:local;color:#13294A;font:800 20px/44px Nunito,sans-serif;outline:none;overflow-y:auto}',
    '.am-root .am-dump__box{line-height:44px !important;font-size:20px !important;font-weight:800 !important;letter-spacing:0 !important}',
    '.am-dump__h{margin:22px 0 4px;font:700 22px Fredoka,Nunito,sans-serif;color:#FFE14D}',
    '.am-dump__sub{margin:0 0 10px;font:800 15px/1.4 Nunito,sans-serif;color:#9FB0CC}',
    '.am-dump__sub b{color:#7DF0B0}',
    '.am-dump__pair,.am-dump__miss{border-left:3px solid #2BC46F;padding:4px 0 4px 14px;margin:0 0 16px}',
    '.am-dump__miss{border-left-color:#F5A03C}',
    '.am-dump__yours,.am-dump__exam{font:800 17px/1.45 Nunito,sans-serif;color:#E8EEFA;margin-bottom:6px}',
    '.am-dump__yours span,.am-dump__exam span{display:block;font:700 12px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8496B6;margin-bottom:2px}',
    '.am-dump__exam{color:#BFF5D6}',
    '.am-dump__exam b,.am-dump__forgot p b{color:#5BE39A;background:rgba(43,196,111,.16);border-radius:5px;padding:0 4px}',
    '.am-dump__tips{display:flex;flex-direction:column;gap:4px}',
    '.am-dump__tip{display:block;font:800 15px/1.4 Nunito,sans-serif;font-style:normal;color:#FFC9A8}',
    '.am-dump__tip b{color:#FFE14D}',
    '.am-dump__tip--ok{color:#7DF0B0}',
    '.am-dump__forgot{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:10px 0;border-top:1px solid #23365A}',
    '.am-dump__forgot p{margin:4px 0 0;font:800 16px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-dump__step{font:700 17px Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-root .am-dump__box,.am-root .am-dump__yours,.am-root .am-dump__exam,.am-root .am-dump__tip,.am-root .am-dump__forgot p,.am-root .am-dump__how,.am-root .am-dump__sub{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-dump__title,.am-root .am-dump__clock,.am-root .am-dump__h,.am-root .am-dump__step,.am-root .am-dump__yours span,.am-root .am-dump__exam span{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-coach__buttons{display:flex;gap:10px;flex-wrap:wrap}',
    '.am-btn--finish{display:none;flex:1;background:#5CD6FF;color:#0C1628;box-shadow:0 4px 0 #2A9BC4}',
    '.am-btn--finish:active{box-shadow:0 1px 0 #2A9BC4}',
    '.am-coach--result .am-btn--finish{display:block}',
    '.am-coach--result .am-btn--ok{flex:1 1 auto}',
    '.am-coach--result .am-btn--more{flex:1 1 100%}',
    '.am-btn--check{background:#2BC46F;color:#fff;box-shadow:0 4px 0 #1E9A55;font-size:19px;padding:14px 16px;display:flex;align-items:center;justify-content:center;gap:10px}',
    '.am-check-ico{flex:none;width:24px;height:24px;fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}',
    '.am-btn--check[aria-disabled="true"] .am-check-ico{opacity:.6}',
    '.am-root .am-btn--check span{font-family:Fredoka,Nunito,sans-serif !important;font-size:inherit}',
    '.am-btn--check:active{box-shadow:0 1px 0 #1E9A55}',
    '.am-btn--check[aria-disabled="true"]{opacity:.75;cursor:wait;transform:none}',
    '.am-miss{background:transparent;color:inherit;text-decoration:underline wavy #F5A03C;text-decoration-thickness:2px;text-underline-offset:7px}',
    '.am-finish{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(8,14,24,.72);animation:amIn .3s ease both;padding:16px;box-sizing:border-box}',
    '.am-finish__card{width:min(640px,100%);max-height:100%;overflow:auto;box-sizing:border-box;background:#14243B;border-radius:22px;padding:28px;color:#F4F7FF;animation:amPop .5s cubic-bezier(.3,1.4,.5,1) both}',
    '.am-finish__kicker{font:700 16px Fredoka,Nunito,sans-serif;color:#9FB0CC;letter-spacing:.04em}',
    '.am-finish__score{font:700 64px/1.1 Fredoka,Nunito,sans-serif;color:#fff;margin:6px 0 8px}',
    '.am-finish__score b{color:#5BE39A}',
    '.am-finish__cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:14px 0 22px}',
    '.am-finish__cols h4{margin:0 0 8px;font:700 18px Fredoka,Nunito,sans-serif;color:#FFE14D}',
    '.am-finish__cols ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}',
    '.am-finish__cols li{font:800 16px/1.35 Nunito,sans-serif;color:#C9D6EE;padding-left:24px;position:relative}',
    '.am-finish__cols li::before{content:"+";position:absolute;left:4px;color:#5CD6FF;font-weight:900}',
    '.am-finish__cols li.ok::before{content:"\\2713";color:#5BE39A}',
    '.am-finish__buttons{display:flex;gap:12px}',
    '.am-finish__buttons .am-btn{flex:1}',
    '@media (max-width:600px){.am-finish__cols{grid-template-columns:1fr}.am-finish__score{font-size:48px}}',
    '.am-btn{font:700 17px Fredoka,Nunito,sans-serif;border:0;border-radius:14px;padding:12px 16px;cursor:pointer;letter-spacing:.02em}',
    '.am-btn:active{transform:translateY(3px)}',
    '.am-btn--ok{flex:0 0 96px;background:#2BC46F;color:#fff;box-shadow:0 4px 0 #1E9A55}',
    '.am-btn--ok:active{box-shadow:0 1px 0 #1E9A55}',
    '.am-btn--more{flex:1;background:#fff;color:#14243B;box-shadow:0 4px 0 #9FB0CC}',
    '.am-btn--more:active{box-shadow:0 1px 0 #9FB0CC}',
    '.am-root .am-btn--clue{background:transparent;color:#C9D6EE;border:2px solid #2A3D5E;box-shadow:none;font-size:15px;padding:9px 14px}',
    '.am-btn--clue:hover{border-color:#5CD6FF;color:#fff}',
    '.am-btn--clue:active{box-shadow:none}',
    '.am-coach--min .am-coach__body,.am-coach--min .am-coach__buttons{display:none}',
    
    '.am-coach__foot{display:flex;flex-direction:column;gap:6px;font:700 12.5px/1.35 Nunito,sans-serif;color:#7F92B3}',
    '.am-link{align-self:flex-start;background:none;border:0;padding:0;color:#8FE3FF;font:700 14px Fredoka,Nunito,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}',
    // Bigger side text (desktop); the phone layout below keeps its own sizes.
    '@media (min-width:1101px){' +
      '.am-root .am-coach{flex-basis:450px}' +
      '.am-root .am-plan__head span{font-size:23px !important}' +
      '.am-root .am-plan__sec h5{font-size:16px !important}' +
      '.am-root .am-plan__note{font-size:15px !important}' +
      '.am-root .am-plan__row{font-size:21px !important;padding:8px 4px}' +
      '.am-root .am-plan__dot{flex-basis:24px;height:24px}' +
      '.am-root .am-plan__item--done .am-plan__dot::after{left:7px;top:3px;width:6px;height:11px}' +
      '.am-root .am-plan__more{margin-left:36px}' +
      '.am-root .am-plan__more p{font-size:19px !important}' +
      '.am-root .am-btn--mini{font-size:16px !important;padding:8px 14px !important}' +
      '.am-root .am-drag__sentence{font-size:20px !important;line-height:2.4 !important}' +
      '.am-root .am-drag__gap{min-width:90px;height:36px;line-height:32px}' +
      '.am-root .am-drag__tile{font-size:19px !important;padding:8px 14px}' +
      '.am-root .am-help__well{font-size:18px !important}' +
      '.am-root .am-coach__title{font-size:28px !important}' +
      '.am-root .am-coach__p{font-size:20px !important}' +
      '.am-root .am-btn{font-size:19px}' +
      '.am-root .am-btn--check{font-size:22px !important}' +
      '.am-root .am-score__num{font-size:36px}' +
      '.am-root .am-tag{font-size:16px !important}' +
      '.am-root .am-coach__foot span{font-size:14px !important}' +
    '}',
    // ---- calmer right panel: score, Check, What to cover, breakdown, help ----
    '.am-root .am-coach{gap:22px}',
    '.am-root .am-score{background:transparent;padding:0}',
    '.am-root .am-score__num{font-size:46px !important}',
    '.am-root .am-coach__body{flex:0 0 auto;max-height:300px}',
    '.am-root .am-coach__buttons{flex:0 0 auto}',
    '.am-root .am-score__meta{display:none}',
    '.am-root .am-pips{margin:10px 0 0}',
    '.am-cover{display:flex;flex-direction:column;gap:4px}',
    '.am-cover__h,.am-needhelp__h{margin:0 0 6px;font:700 14px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#7F92B3}',
    '.am-cover__row{display:flex;align-items:center;gap:14px;width:100%;background:transparent;border:0;border-radius:14px;padding:11px 12px;cursor:pointer;text-align:left;transition:background .2s ease}',
    '.am-cover__row:hover{background:#15243C}',
    '.am-cover__dot{position:relative;flex:0 0 24px;height:24px;border-radius:50%;border:2px solid #3A5175;box-sizing:border-box}',
    '.am-cover__row--part .am-cover__dot{border-color:#8FB3E0}',
    '.am-cover__row--part .am-cover__dot::after{content:"";position:absolute;left:5px;top:5px;width:10px;height:10px;border-radius:50%;background:#8FB3E0}',
    '.am-cover__row--part .am-cover__count{color:#C9D6EE}',
    '.am-cover__row--done .am-cover__dot{background:#2BC46F;border-color:#2BC46F}',
    '.am-cover__row--done .am-cover__dot::after{content:"";position:absolute;left:7px;top:3px;width:6px;height:11px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}',
    '.am-cover__title{flex:1;font:800 20px/1.25 Nunito,sans-serif;color:#E8EEFA}',
    '.am-cover__count{font:700 15px Fredoka,Nunito,sans-serif;color:#7F92B3}',
    '.am-cover__row--done .am-cover__title{color:#9FB0CC}',
    '.am-cover__row--done .am-cover__count{color:#5E9C7C}',
    '.am-cover__row--pop .am-cover__dot{animation:amPop .5s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-cover__toggle{align-self:flex-start;display:flex;align-items:center;gap:8px;margin:8px 0 0 12px;background:none;border:0;padding:4px 0;cursor:pointer;color:#8FB3E0;font:700 16px Fredoka,Nunito,sans-serif}',
    '.am-cover__toggle:hover{color:#fff}',
    '.am-cover__toggle i{display:inline-block;width:8px;height:8px;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg) translateY(-2px);transition:transform .25s ease}',
    '.am-cover__toggle[aria-expanded="true"] i{transform:rotate(-135deg) translateY(-2px)}',
    '.am-root .am-plan[hidden]{display:none}',
    '.am-root .am-plan{border-top:1px solid #1E3050;padding-top:10px}',
    '.am-root .am-plan__item--done .am-plan__row span{color:#8496B6}',
    '.am-root .am-plan__item--done .am-plan__dot{background:#2A6B4A;border-color:#2A6B4A}',
    '.am-needhelp{border-top:1px solid #1E3050;padding-top:16px}',
    '.am-needhelp__btns{display:flex;gap:10px}',
    '.am-root .am-needhelp .am-btn{flex:1;background:transparent;color:#C9D6EE;border:2px solid #2A3D5E;box-shadow:none;font-size:16px !important;padding:9px 12px !important}',
    '.am-root .am-needhelp .am-btn:hover{border-color:#5CD6FF;color:#fff}',
    '.am-root .am-cover__title{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-cover__h,.am-root .am-needhelp__h,.am-root .am-cover__count,.am-root .am-cover__toggle{font-family:Fredoka,Nunito,sans-serif !important}',
    '@media (max-width:1100px){.am-cover__title{font-size:17px}.am-cover__row{padding:8px 10px}}',
    // ---- on the desk: paper sheets with a shadow, the side panel as a dark card ----
    '.am-root .am-sheet-wrap{padding:6px 18px 30px;border-radius:0}',
    '.am-root .am-sheet{border-radius:8px;box-shadow:0 14px 30px rgba(70,35,10,.35),0 2px 4px rgba(70,35,10,.25)}',
    '.am-root .am-sheet{clip-path:inset(0 -40px 100% -40px round 8px)}',
    '.am-root.am-sheet-in .am-sheet{clip-path:inset(-40px -40px -40px -40px round 8px)}',
    '.am-root .am-coach{background:#14243B;border-radius:22px;padding:24px 22px;box-shadow:0 16px 36px rgba(40,18,4,.45)}',
    '.am-root .am-addpage{box-shadow:0 4px 0 #0A1220,0 10px 20px rgba(70,35,10,.3)}',
    '@media (max-width:1100px){.am-stage{flex-direction:column;padding:72px 12px 12px;gap:12px}.am-sheet-wrap{max-width:none}.am-sheet{padding:22px 60px 40px 22px}.am-coach{flex:0 0 auto;margin:0;align-self:stretch;max-height:42vh}.am-close{top:12px;right:12px}}',
    '@media (max-width:600px){.am-root .am-mirror,.am-root .am-input,.am-root .am-mirror *{font-size:19px !important}.am-sheet{padding-right:52px}.am-coach{padding:14px;gap:10px;max-height:48vh}.am-score{padding:8px 12px}.am-score__num{font-size:22px}.am-pips{margin:6px 0}.am-coach__head{display:none}.am-coach__title{font-size:20px}.am-coach__p{font-size:16px}.am-coach__foot span{display:none}.am-btn{padding:10px 12px}}',
    // Keyboard focus is always visible; a card that takes focus doesn't draw a ring around itself.
    '.am-root :is(button,a,[tabindex="0"]):focus-visible{outline:2px solid #FFE14D;outline-offset:2px}',
    '.am-root .am-finish__card:focus{outline:none}',
    '.am-root .am-dump__box:focus-visible{box-shadow:inset 0 0 0 2px #5CD6FF}',
    '.am-root .am-drag__tile{border:0}',
    '.am-root .am-sheet-wrap,.am-root .am-coach__body,.am-root .am-plan,.am-root .am-dump__box,.am-root .am-finish__card{overscroll-behavior:contain}',
    '.am-root button:not(.am-drag__tile){touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.am-root .am-btn:not([aria-disabled="true"]):hover{filter:brightness(1.07)}',
    '.am-root .am-score__num,.am-root .am-finish__score{font-variant-numeric:tabular-nums}',
    '.am-root .am-dump__yours{overflow-wrap:anywhere}',
    // ---- side panel polish ----
    '.am-root .am-pips{display:flex;gap:5px}',
    '.am-root .am-pips i{flex:1}',
    '.am-root .am-cover__row{padding:9px 12px}',
    '.am-ring{flex:0 0 26px;width:26px;height:26px;transform:rotate(-90deg)}',
    '.am-ring__track{fill:none;stroke:#2A3D5E;stroke-width:3}',
    '.am-ring__fill{fill:none;stroke:#5CD6FF;stroke-width:3;stroke-linecap:round;transition:stroke-dasharray .5s ease}',
    '.am-ring__tick{fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:0;transform:rotate(90deg);transform-origin:12px 12px}',
    '.am-cover__row--done .am-ring__track{fill:#2BC46F;stroke:#2BC46F}',
    '.am-cover__row--done .am-ring__fill{stroke:#2BC46F}',
    '.am-cover__row--done .am-ring__tick{opacity:1}',
    '.am-cover__row--pop .am-ring{animation:amPop .5s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-root .am-plan__row,.am-root .am-plan__row *,.am-root .am-cover__toggle,.am-root .am-cover__toggle *{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-cover__toggle,.am-root .am-cover__toggle *{font-weight:800 !important;font-size:15px !important}',
    '.am-root .am-plan__row{font-size:17px !important;padding:6px 4px;color:#C9D6EE}',
    '.am-root .am-plan__dot{flex-basis:18px;height:18px}',
    '.am-root .am-plan__item--done .am-plan__dot::after{left:5px;top:2px;width:4px;height:8px}',
    '.am-root .am-plan__sec h5{font-size:13px !important}',
    '.am-root .am-plan__more{margin-left:28px}',
    '.am-root .am-coach{gap:18px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#2A3D5E transparent}',
    '.am-root .am-coach > *{flex-shrink:0}',
    '.am-cover__row:not(.am-cover__row--part):not(.am-cover__row--done) .am-ring__fill{stroke:transparent}',
    '.am-root .am-practise{border-top:1px solid #1E3050;padding-top:16px;margin:0}',
    '.am-root .am-needhelp{padding-top:14px}',
    '.am-train-tile{display:flex;align-items:center;gap:14px;width:100%;padding:12px 14px;border:2px solid #2A3D5E;border-radius:16px;background:#1B3150;color:#fff;text-align:left;cursor:pointer;transition:border-color .2s ease,transform .15s ease}',
    '.am-train-tile:hover{border-color:#FFC42E}',
    '.am-train-tile:active{transform:translateY(1px)}',
    '.am-train-tile__icon{flex:0 0 40px;height:40px;border-radius:12px;background:#FFC42E;color:#14243B;display:grid;place-items:center;box-shadow:0 3px 0 #C98E00}',
    '.am-train-tile__icon svg{width:22px;height:22px}',
    '.am-train-tile__text{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}',
    '.am-train-tile__text b{font:700 18px Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-train-tile__text span{font:800 13.5px/1.3 Nunito,sans-serif;color:#9FB0CC}',
    '.am-train-tile__go{flex:none;width:9px;height:9px;margin-right:4px;border:solid #FFC42E;border-width:2.5px 2.5px 0 0;transform:rotate(45deg)}',
    '.am-root .am-train-tile__text b{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-root .am-train-tile__text span{font-family:Nunito,system-ui,sans-serif !important;font-weight:800 !important}',
    '@media (prefers-reduced-motion:reduce){.am-root *,.am-root *::before,.am-root *::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;animation-delay:0s !important;transition-duration:.01ms !important;transition-delay:0s !important}' +
      '.am-root .am-caret--on{animation:none !important;opacity:1}.am-root .am-stamp{animation:none !important}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

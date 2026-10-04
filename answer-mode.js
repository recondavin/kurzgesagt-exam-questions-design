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
      code: '3B', title: 'Sedimentary Rocks', image: 'assets/answer/q3b.png?v=1', total: 13,
      normalise: [[/sedimentary\s+rocks?/g, ' srock '], [/sedimentary/g, ' srock ']],
      example: 'Sedimentary rocks begin when older rocks are weathered and eroded into small pieces called sediment.',
      ghost: 'This sediment is then transported by rivers, wind and ice to lakes and seas.',
      path: ['weather', 'transport', 'deposit', 'compact', 'cement', 'redDesert', 'sandEx', 'limestone', 'warmSea', 'caco3', 'fossils', 'limeEx', 'time', 'uplift', 'sandstone', 'shale', 'shaleEx', 'fossils', 'time', 'uplift', 'caco3', 'coal'],
      examples: ['sandEx', 'limeEx', 'shaleEx', 'coalEx'],
      points: [
        { id: 'define', label: 'What sedimentary rock is made from', all: [['srock'], ['sediment', 'fragment', 'particle', 'grain', 'remains', 'pieces', 'bits'], ['form', 'made', 'compos', 'consist', 'creat', 'build']] },
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
        { id: 'compact', label: 'Compaction', all: [['compact', 'compress', 'squeez', 'squash', 'weight', 'pressure', 'press', 'crush'], ['layer', 'sediment', 'grain', 'particle', 'water', 'above', 'overlying', 'together', 'below', 'beneath', 'upper', 'lower', 'down', 'underneath', 'top']],
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
      code: '3C', title: 'Seismic Activity', image: 'assets/answer/q3c.png?v=1', total: 13,
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
      var counts = s.words >= MIN_WORDS && (s.complete || (open && open(s)));
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
  function officialMarks() {
    var q = state.q, got = state.got, ids = Object.keys(got);
    var text = ' ' + fullText().toLowerCase().replace(/[^a-z]+/g, ' ');
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
    score.querySelector('[data-am-marks]').textContent = o.marks;
    var pips = score.querySelector('.am-pips');
    if (pips.children.length !== q.total) pips.innerHTML = new Array(q.total + 1).join('<i></i>');
    Array.prototype.forEach.call(pips.children, function (pip, k) { pip.classList.toggle('on', k < o.srps); });
    updatePlan(o);
    score.querySelector('.am-score__meta').innerHTML = o.tags.map(function (t) { return '<span class="am-tag ' + (t[1] ? 'am-tag--' + t[1] : '') + '">' + t[0] + '</span>'; }).join('');
    return o;
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
    var html = '<div class="am-plan__head"><span>Your plan</span></div>';
    plan.sections.forEach(function (sec) {
      html += '<div class="am-plan__sec"><h5>' + sec.title + '</h5>' + (sec.note ? '<p class="am-plan__note">' + sec.note + '</p>' : '');
      sec.items.forEach(function (it) {
        html += '<div class="am-plan__item" data-am-item="' + it.id + '">' +
          '<button type="button" class="am-plan__row" data-am-plan="' + it.id + '"><i class="am-plan__dot"></i><span>' + it.title + '</span></button>' +
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
      ok ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11"/><path d="M6.5 12.5l3.6 3.6L17.5 8.5"/></svg>'
         : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11"/><path d="M8 8l8 8M16 8l-8 8"/></svg>');
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
        return k % 2 ? '<span class="am-drag__gap" data-am-gap="' + esc(p.toLowerCase()) + '"></span>' : esc(p);
      }).join('') + '</p>' +
      '<div class="am-drag__tiles">' + tiles.map(function (w) { return '<span class="am-drag__tile" data-am-tile="' + esc(w.toLowerCase()) + '">' + esc(w) + '</span>'; }).join('') + '</div>' +
      '<p class="am-help__hint" hidden></p>' +
      '<div class="am-help__foot"></div>';
    box.hidden = false;
    box.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    box.querySelectorAll('.am-drag__tile').forEach(function (tile) { tile.addEventListener('pointerdown', function (e) { startTileDrag(e, tile, id); }); });
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
    function up(ev) {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      tile.classList.remove('am-drag__tile--lifted');
      var gap = null;
      if (ghost) {
        ghost.remove();
        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        gap = under && under.closest('.am-drag__gap');
      } else {
        // A tap places the word in the first empty gap.
        gap = helpBox(id).querySelector('.am-drag__gap:not(.am-drag__gap--full)');
      }
      if (gap && !gap.classList.contains('am-drag__gap--full')) dropTile(tile, gap, id);
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
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
    gap.classList.add('am-drag__gap--full');
    tile.classList.add('am-drag__tile--used');
    stamp(gap, true);
    var box = helpBox(id);
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
    }, 450);
  }
  function useSentence(id) {
    var text = QUIZ[id].drag.replace(/\[([^\]]+)\]/g, '$1');
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

  // ---------- Brain dump: write everything you remember, then learn how to phrase it ----------
  var DUMP_SECONDS = 240;
  function keyWords(id) {
    var qz = QUIZ[id];
    return qz ? (qz.drag.match(/\[([^\]]+)\]/g) || []).map(function (k) { return k.slice(1, -1); }) : [];
  }
  // The exam version of a step, with its key words highlighted.
  function examVersion(id) {
    var qz = QUIZ[id];
    return qz ? esc(qz.drag).replace(/\[([^\]]+)\]/g, '<b>$1</b>') : '';
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
    state.root.appendChild(card);
    var box = card.querySelector('.am-dump__box');
    box.focus();
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
          '<div class="am-dump__tips">' + (tips.length ? tips.map(function (t) { return '<em class="am-dump__tip">' + t + '</em>'; }).join('') : '<em class="am-dump__tip am-dump__tip--ok">Exam-ready. Nothing to change.</em>') + '</div></div>';
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
    var cardEl = card.querySelector('.am-finish__card');
    cardEl.classList.add('am-dump__card--results');
    cardEl.innerHTML = html;
    cardEl.scrollTop = 0;
  }
  function practiseStep(id) {
    var card = state.root.querySelector('.am-finish');
    if (card) card.remove();
    state.coach.classList.add('am-coach--min');
    var row = state.planEl.querySelector('[data-am-item="' + id + '"]');
    if (!row) return;
    if (!row.classList.contains('am-plan__item--open')) togglePlanItem(id);
    showDrag(id);
    row.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
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
    state.sentences.forEach(function (s) {
      s.hits = s.hits.filter(function (p) { return state.granted[p.id]; });
      s.hits.forEach(function (p) { got[p.id] = true; });
      s.miss = !s.hits.length && Boolean(state.missed[s.text]);
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
    btn.disabled = true;
    btn.textContent = 'Checking…';
    var gained = [];
    function step(i) {
      if (!state) return;
      if (i >= queue.length) { later(function () { doneMarking(gained, missed, near); }, queue.length ? 650 : 250); return; }
      queue[i].forEach(function (p) { state.granted[p.id] = true; state.fresh[p.id] = true; gained.push(p); });
      refresh();
      var badge = state.root.querySelector('[data-am-b="' + queue[i][0].id + '"]');
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
    btn.disabled = false;
    btn.textContent = 'Check my answer';
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
    if (misses) first += '<span class="am-next">' + (misses === 1 ? '1 sentence' : misses + ' sentences') + ' underlined in orange didn\'t match the marking scheme yet.' +
      (near ? ' "' + esc(near.text.slice(0, 60)) + (near.text.length > 60 ? '…' : '') + '" is close: explain <b>how</b> or <b>why</b>.' : '') + '</span>';
    if (o.note) first += '<span class="am-next">' + o.note + '</span>';
    var levels = [first];
    var title;
    if (marks >= 30) {
      title = 'Full marks!';
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
    state.root.appendChild(card);
    Array.prototype.forEach.call(card.querySelectorAll('.am-pips i'), function (pip, k) {
      if (k < o.srps) later(function () { pip.classList.add('on'); }, 250 + k * 70);
    });
  }
  function onInput() {
    if (state.ghostOn && !ghostText(state.pages[state.active])) state.ghostOn = false;
    refresh();
    save();
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
          '<div class="am-score"><div class="am-score__top"><span class="am-score__num"><b data-am-marks>0</b> / 30</span><span class="am-score__unit">marks</span></div><div class="am-pips"></div><div class="am-score__meta"></div></div>' +
          '<button type="button" class="am-btn am-btn--check" data-am-check>Check my answer</button>' +
          '<button type="button" class="am-btn am-btn--dump" data-am-dump>Brain dump</button>' +
          '<div class="am-plan"></div>' +
          '<div class="am-coach__body">' +
            '<div class="am-coach__msg"></div>' +
          '</div>' +
          '<div class="am-coach__buttons"><button type="button" class="am-btn am-btn--ok" data-am-ok>OK</button><button type="button" class="am-btn am-btn--finish" data-am-finish>Finish</button><button type="button" class="am-btn am-btn--more" data-am-more>Still don\'t get it</button></div>' +
          '<button type="button" class="am-btn am-btn--clue" data-am-clue>Stuck?</button>' +
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
      planEl: root.querySelector('.am-plan') };
    renderPlan();
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
      if (e.target.closest('[data-am-clue]')) { offerClue(true); return; }
      if (e.target.closest('[data-am-check]')) { markAll(); return; }
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
      if (e.target.closest('[data-am-keep]')) {
        clearInterval(state.dumpTimer);
        var card = state.root.querySelector('.am-finish');
        var howto = card && card.classList.contains('am-howto');
        if (card) card.remove();
        state.coach.classList.add('am-coach--min');
        if (howto) {
          var next = state.planEl.querySelector('.am-plan__item--next');
          if (next && !next.classList.contains('am-plan__item--open')) togglePlanItem(next.getAttribute('data-am-item'));
        }
        focusPage(state.active, Infinity);
        return;
      }
      if (e.target.closest('[data-am-addpage]')) {
        var page = addPage();
        state.root.classList.add('am-lines-in');
        focusPage(page.index, 0);
        requestAnimationFrame(function () { state.pagesEl.parentNode.scrollTo({ top: page.el.offsetTop - 12, behavior: reduced() ? 'auto' : 'smooth' }); });
        return;
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
    clearInterval(s.dumpTimer);
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
    scoreIds: function (id, text) { return evaluate(QUESTIONS[id], text, function () { return true; }).map(function (s) { return s.hits.map(function (p) { return p.id; }); }); },
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
    '.am-coach{flex:0 0 380px;display:flex;flex-direction:column;gap:14px;margin-right:56px;align-self:flex-start;max-height:100%;box-sizing:border-box;background:transparent;border-radius:0;padding:4px 0;color:#F4F7FF;transform:translateX(40px);opacity:0;transition:transform .5s cubic-bezier(.22,.8,.2,1),opacity .4s ease}',
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
    '.am-plan{flex:1 1 auto;min-height:140px;overflow-y:auto;padding:4px 2px 0}',
    '.am-root .am-plan,.am-root .am-coach,.am-root .am-coach__body,.am-root .am-sheet-wrap,.am-root .am-finish__card{scrollbar-width:none}',
    '.am-root .am-plan::-webkit-scrollbar,.am-root .am-coach::-webkit-scrollbar,.am-root .am-coach__body::-webkit-scrollbar,.am-root .am-sheet-wrap::-webkit-scrollbar,.am-root .am-finish__card::-webkit-scrollbar{display:none}',
    '.am-plan__head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}',
    '.am-plan__head span{font:600 19px Fredoka,Nunito,sans-serif;color:#C9D6EE;letter-spacing:.02em}',
    '.am-plan__sec{margin-bottom:8px}',
    '.am-plan__sec h5{margin:14px 0 4px;font:600 14px Fredoka,Nunito,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#6F84A6}',
    '.am-plan__note{margin:0 0 4px;font:600 13px/1.35 Nunito,sans-serif;color:#9FB0CC}',
    '.am-plan__row{display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;border-radius:8px;padding:7px 4px;color:#8D9FBF;font:700 18px/1.25 Nunito,sans-serif;text-align:left;cursor:pointer;transition:color .2s ease}',
    '.am-plan__row:hover{color:#E8EEFA}',
    '.am-plan__dot{flex:0 0 20px;height:20px;border-radius:50%;border:2px solid #3A5175;box-sizing:border-box;position:relative}',
    '.am-plan__item--next .am-plan__dot{border-color:#FFD43B}',
    '.am-plan__item--next .am-plan__row{color:#fff}',
    '.am-plan__item--done .am-plan__dot{background:#2BC46F;border-color:#2BC46F}',
    '.am-plan__item--done .am-plan__dot::after{content:"";position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}',
    '.am-plan__item--done .am-plan__row span{color:#5E9C7C}',
    '.am-plan__more{display:none;margin:2px 0 10px 30px;padding:2px 0 2px 12px;border-left:2px solid #2A3D5E}',
    '.am-plan__item--open .am-plan__more{display:block;animation:amIn .3s ease both}',
    '.am-plan__more p{margin:0 0 10px;font:700 16px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-plan__ask{color:#FFE14D !important}',
    '.am-plan__example{color:#BFF5D6 !important;border-left:3px solid #2BC46F;padding-left:10px}',
    '.am-plan__btns{display:flex;gap:8px;flex-wrap:wrap}',
    '.am-root .am-btn--mini{font-size:13px;padding:6px 11px;border-radius:9px;background:#2BC46F;color:#fff;box-shadow:0 2px 0 #1E9A55}',
    '.am-root .am-btn--ghost{background:transparent;color:#C9D6EE;border:2px solid #2A3D5E;box-shadow:none;padding:4px 10px}',
    '.am-howto__title{margin:4px 0 14px;font:700 32px/1.1 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-howto__map{display:grid;gap:8px;margin-bottom:16px}',
    '.am-howto__row{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#0C1628;border-radius:12px;padding:12px 14px;animation:amIn .4s cubic-bezier(.22,.8,.2,1) both;animation-delay:calc(var(--k) * 120ms + 150ms)}',
    '.am-howto__row span{font:700 17px/1.3 Nunito,sans-serif;color:#E8EEFA}',
    '.am-howto__row b{flex:0 0 auto;font:700 16px Fredoka,Nunito,sans-serif;color:#5BE39A}',
    '.am-howto__rules{margin:0 0 20px;padding-left:20px;display:grid;gap:6px}',
    '.am-howto__rules li{font:700 15px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-howto__rules b{color:#FFE14D;font-family:Fredoka,Nunito,sans-serif;font-weight:600}',
    '.am-root .am-plan__row,.am-root .am-plan__more p,.am-root .am-plan__note,.am-root .am-howto__row span,.am-root .am-howto__rules li{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-plan__head span,.am-root .am-plan__sec h5,.am-root .am-howto__title,.am-root .am-howto__row b{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-help{margin-top:12px}',
    '.am-chain{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:12px}',
    '.am-chain__box{position:relative;background:#1B2E4B;color:#E8EEFA;border-radius:10px;padding:7px 10px;font:700 14px/1.3 Nunito,sans-serif}',
    '.am-chain__box--gap{background:transparent;border:2px dashed #FFD43B;color:#FFD43B;min-width:28px;text-align:center}',
    '.am-chain__box--filled{border:2px solid #2BC46F;background:#173B2A;color:#7DF0B0;animation:amPop .45s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-chain__arrow{font-style:normal;color:#6F84A6;font-weight:900;padding-left:14px;line-height:1}',
    '.am-help__q{color:#FFE14D !important;margin-bottom:8px !important}',
    '.am-quiz{display:grid;gap:8px}',
    '.am-quiz__opt{position:relative;text-align:left;border:2px solid #2A3D5E;background:transparent;color:#E8EEFA;border-radius:12px;padding:10px 12px;font:700 15px/1.3 Nunito,sans-serif;cursor:pointer;transition:border-color .2s ease,background .2s ease}',
    '.am-quiz__opt:hover:not(:disabled){border-color:#5CD6FF}',
    '.am-quiz__opt--ok{border-color:#2BC46F;background:#173B2A;color:#7DF0B0}',
    '.am-quiz__opt--no{border-color:#E5484D;color:#FF9A9D;opacity:.75}',
    '.am-help__hint{margin-top:10px !important;color:#FFC9A8 !important}',
    '.am-help__hint--ok{color:#BFF5D6 !important}',
    '.am-help__foot{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:6px}',
    '.am-help__well{font:700 15px Fredoka,Nunito,sans-serif;color:#7DF0B0}',
    '.am-drag__sentence{position:relative;font:700 17px/2.3 Nunito,sans-serif !important;color:#E8EEFA !important;border-radius:10px;transition:background .3s ease}',
    '.am-drag__sentence--done{background:#173B2A;padding:4px 10px}',
    '.am-drag__gap{position:relative;display:inline-block;min-width:74px;height:30px;line-height:26px;vertical-align:middle;border:2px dashed #FFD43B;border-radius:9px;margin:0 3px;padding:0 8px;box-sizing:border-box;color:#7DF0B0;text-align:center}',
    '.am-drag__gap--full{border:2px solid #2BC46F;background:#173B2A;animation:amPop .4s cubic-bezier(.3,1.6,.5,1) both}',
    '.am-drag__tiles{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 4px}',
    '.am-drag__tile{position:relative;user-select:none;touch-action:none;cursor:grab;background:#E8EEFA;color:#14243B;border-radius:10px;padding:6px 12px;font:700 16px Nunito,sans-serif;box-shadow:0 3px 0 #9FB0CC}',
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
    '.am-dump__card{width:min(820px,100%);max-height:calc(100% - 24px)}',
    '.am-dump__top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}',
    '.am-dump__title{margin:4px 0 10px;font:700 32px/1.1 Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-dump__clock{font:700 40px Fredoka,Nunito,sans-serif;color:#5BE39A;font-variant-numeric:tabular-nums}',
    '.am-dump__clock--low{color:#FF8A6B;animation:amShake .4s ease}',
    '.am-dump__bar{height:8px;border-radius:4px;background:#26395A;overflow:hidden;margin-bottom:14px}',
    '.am-dump__bar i{display:block;height:100%;width:100%;background:#5BE39A;border-radius:4px;transition:width 1s linear}',
    '.am-dump__bar--score i{background:#2BC46F;transition:width .8s cubic-bezier(.22,.8,.2,1)}',
    '.am-dump__how{margin:0 0 12px;font:700 18px/1.4 Nunito,sans-serif;color:#C9D6EE}',
    '.am-dump__how b{color:#FFE14D}',
    '.am-dump__box{display:block;width:100%;box-sizing:border-box;min-height:340px;resize:vertical;border:0;border-radius:14px;padding:6px 14px;margin-bottom:16px;background:#FFFEF8 repeating-linear-gradient(transparent 0 39px,#C7D3E6 39px 41px);color:#13294A;font:600 20px/41px Nunito,sans-serif;outline:none}',
    '.am-dump__h{margin:22px 0 4px;font:700 22px Fredoka,Nunito,sans-serif;color:#FFE14D}',
    '.am-dump__sub{margin:0 0 10px;font:700 15px/1.4 Nunito,sans-serif;color:#9FB0CC}',
    '.am-dump__sub b{color:#7DF0B0}',
    '.am-dump__pair,.am-dump__miss{border-left:3px solid #2BC46F;padding:4px 0 4px 14px;margin:0 0 16px}',
    '.am-dump__miss{border-left-color:#F5A03C}',
    '.am-dump__yours,.am-dump__exam{font:700 17px/1.45 Nunito,sans-serif;color:#E8EEFA;margin-bottom:6px}',
    '.am-dump__yours span,.am-dump__exam span{display:block;font:600 12px Fredoka,Nunito,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6F84A6;margin-bottom:2px}',
    '.am-dump__exam{color:#BFF5D6}',
    '.am-dump__exam b,.am-dump__forgot p b{color:#5BE39A;background:rgba(43,196,111,.16);border-radius:5px;padding:0 4px}',
    '.am-dump__tips{display:flex;flex-direction:column;gap:4px}',
    '.am-dump__tip{display:block;font:700 15px/1.4 Nunito,sans-serif;font-style:normal;color:#FFC9A8}',
    '.am-dump__tip b{color:#FFE14D}',
    '.am-dump__tip--ok{color:#7DF0B0}',
    '.am-dump__forgot{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:10px 0;border-top:1px solid #23365A}',
    '.am-dump__forgot p{margin:4px 0 0;font:700 16px/1.45 Nunito,sans-serif;color:#C9D6EE}',
    '.am-dump__step{font:600 17px Fredoka,Nunito,sans-serif;color:#fff}',
    '.am-root .am-dump__box,.am-root .am-dump__yours,.am-root .am-dump__exam,.am-root .am-dump__tip,.am-root .am-dump__forgot p,.am-root .am-dump__how,.am-root .am-dump__sub{font-family:Nunito,system-ui,sans-serif !important}',
    '.am-root .am-dump__title,.am-root .am-dump__clock,.am-root .am-dump__h,.am-root .am-dump__step,.am-root .am-dump__yours span,.am-root .am-dump__exam span{font-family:Fredoka,Nunito,sans-serif !important}',
    '.am-coach__buttons{display:flex;gap:10px;flex-wrap:wrap}',
    '.am-btn--finish{display:none;flex:1;background:#5CD6FF;color:#0C1628;box-shadow:0 4px 0 #2A9BC4}',
    '.am-btn--finish:active{box-shadow:0 1px 0 #2A9BC4}',
    '.am-coach--result .am-btn--finish{display:block}',
    '.am-coach--result .am-btn--ok{flex:1 1 auto}',
    '.am-coach--result .am-btn--more{flex:1 1 100%}',
    '.am-btn--check{background:#2BC46F;color:#fff;box-shadow:0 4px 0 #1E9A55;font-size:19px;padding:14px 16px}',
    '.am-btn--check:active{box-shadow:0 1px 0 #1E9A55}',
    '.am-btn--check:disabled{opacity:.75;cursor:wait;transform:none}',
    '.am-miss{background:transparent;color:inherit;text-decoration:underline wavy #F5A03C;text-decoration-thickness:2px;text-underline-offset:7px}',
    '.am-finish{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(8,14,24,.72);animation:amIn .3s ease both;padding:16px;box-sizing:border-box}',
    '.am-finish__card{width:min(640px,100%);max-height:100%;overflow:auto;box-sizing:border-box;background:#14243B;border-radius:22px;padding:28px;color:#F4F7FF;animation:amPop .5s cubic-bezier(.3,1.4,.5,1) both}',
    '.am-finish__kicker{font:600 16px Fredoka,Nunito,sans-serif;color:#9FB0CC;letter-spacing:.04em}',
    '.am-finish__score{font:600 64px/1.1 Fredoka,Nunito,sans-serif;color:#fff;margin:6px 0 8px}',
    '.am-finish__score b{color:#5BE39A}',
    '.am-finish__cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:14px 0 22px}',
    '.am-finish__cols h4{margin:0 0 8px;font:700 18px Fredoka,Nunito,sans-serif;color:#FFE14D}',
    '.am-finish__cols ul{margin:0;padding:0;list-style:none;display:grid;gap:6px}',
    '.am-finish__cols li{font:700 16px/1.35 Nunito,sans-serif;color:#C9D6EE;padding-left:24px;position:relative}',
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
    '.am-coach:not(.am-coach--min) .am-btn--clue{display:none}',
    '.am-coach--min .am-coach__body,.am-coach--min .am-coach__buttons{display:none}',
    
    '.am-coach__foot{display:flex;flex-direction:column;gap:6px;font:600 12.5px/1.35 Nunito,sans-serif;color:#7F92B3}',
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
    '@media (max-width:1100px){.am-stage{flex-direction:column;padding:72px 12px 12px;gap:12px}.am-sheet-wrap{max-width:none}.am-sheet{padding:22px 60px 40px 22px}.am-coach{flex:0 0 auto;margin:0;align-self:stretch;max-height:42vh}.am-close{top:12px;right:12px}}',
    '@media (max-width:600px){.am-root .am-mirror,.am-root .am-input,.am-root .am-mirror *{font-size:19px !important}.am-sheet{padding-right:52px}.am-coach{padding:14px;gap:10px;max-height:48vh}.am-score{padding:8px 12px}.am-score__num{font-size:22px}.am-pips{margin:6px 0}.am-coach__head{display:none}.am-coach__title{font-size:20px}.am-coach__p{font-size:16px}.am-coach__foot span{display:none}.am-btn{padding:10px 12px}}',
    '@media (prefers-reduced-motion:reduce){.am-root *{animation-duration:.01ms !important;transition-duration:.01ms !important}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

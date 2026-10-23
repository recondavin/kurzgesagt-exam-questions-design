// Chapter 28, the breathing system: what the games and memory drills use. Written to the new course's learning
// outcomes 2.6.7 (the breathing system and gas exchange in the lungs) and 2.6.8 (carbon dioxide controlling breathing).
window.BioLearn = window.BioLearn || {};
window.BioLearn[28] = {
  // Breath of air: the airway in order, gas exchange at the alveolus, then carbon dioxide setting the breathing rate (bio/act28.js).
  action: { name: 'Breath of air', what: 'Be an oxygen molecule: find your way to an alveolus, cross into the blood, then keep the breathing going through a workout.' },

  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'Breathing in (inhalation)', steps: ['The brain sends impulses to the breathing muscles', 'The diaphragm contracts, flattens and moves down', 'The intercostal muscles contract: the rib cage moves up and out', 'The volume of the chest (thoracic cavity) increases', 'The pressure inside the chest decreases', 'Air rushes into the lungs'],
        why: 'The <b>brain</b> sends <b>impulses</b> to the breathing muscles. The <b>diaphragm</b> <b>contracts</b>, <b>flattens</b> and moves <b>down</b>, and the <b>intercostal muscles</b> contract: the <b>rib cage</b> moves <b>up and out</b>. The <b>volume</b> of the chest (<b>thoracic cavity</b>) <b>increases</b>, so the <b>pressure</b> inside the chest <b>decreases</b> and <b>air</b> rushes into the <b>lungs</b>.' },
      { title: 'Breathing out (exhalation)', steps: ['The diaphragm and intercostal muscles relax', 'The diaphragm domes back up', 'The rib cage moves down and in', 'The volume of the chest decreases', 'The pressure inside the chest increases', 'Air is pushed out of the lungs'],
        why: 'The <b>diaphragm</b> and <b>intercostal muscles</b> <b>relax</b>. The diaphragm <b>domes</b> back <b>up</b> and the <b>rib cage</b> moves <b>down and in</b>. The <b>volume</b> of the chest <b>decreases</b>, so the <b>pressure</b> inside the chest <b>increases</b> and <b>air</b> is pushed <b>out</b> of the lungs.' },
      { title: 'The path of air', steps: ['Nasal cavity: the air is filtered, warmed and moistened', 'Pharynx (the throat)', 'Larynx (the voice box)', 'Trachea, held open by rings of cartilage', 'Bronchus', 'Bronchioles', 'Alveoli'],
        why: 'In the <b>nasal cavity</b> the air is <b>filtered</b>, <b>warmed</b> and <b>moistened</b>. It passes through the <b>pharynx</b> (the throat), the <b>larynx</b> (the voice box) and the <b>trachea</b>, held open by <b>rings of cartilage</b>, then a <b>bronchus</b>, the <b>bronchioles</b> and finally the <b>alveoli</b>.' },
      { title: 'Gas exchange in an alveolus', steps: ['Fresh air reaches the alveolus', 'Oxygen dissolves in the moisture lining the alveolus', 'Oxygen diffuses across the thin wall into the capillary', 'It joins haemoglobin in a red blood cell (oxyhaemoglobin)', 'Carbon dioxide diffuses the other way, into the alveolus', 'The carbon dioxide is breathed out'],
        why: 'Fresh <b>air</b> reaches the <b>alveolus</b>. <b>Oxygen</b> <b>dissolves</b> in the <b>moisture</b> lining the alveolus. The oxygen <b>diffuses</b> across the <b>thin wall</b> into the <b>capillary</b> and joins <b>haemoglobin</b> in a <b>red blood cell</b> (<b>oxyhaemoglobin</b>). <b>Carbon dioxide</b> diffuses the other way, into the alveolus, and the carbon dioxide is <b>breathed out</b>.' },
      { title: 'Carbon dioxide controls breathing', steps: ['During exercise, muscles respire faster', 'More carbon dioxide goes into the blood', 'The blood becomes more acidic (its pH falls)', 'The medulla oblongata in the brain detects this', 'It sends impulses to the diaphragm and intercostal muscles', 'Breathing becomes faster and deeper'],
        why: 'During <b>exercise</b>, muscles <b>respire</b> faster, so more <b>carbon dioxide</b> goes into the <b>blood</b>. The blood becomes more <b>acidic</b> (its <b>pH</b> falls). The <b>medulla oblongata</b> in the <b>brain</b> detects this and sends <b>impulses</b> to the <b>diaphragm</b> and <b>intercostal muscles</b>, so breathing becomes <b>faster</b> and <b>deeper</b>.' }
    ],
    // Level up for Biology: a point, then its explanation, then the exact detail (3 marks each).
    levelText: {
      steps: [['Explanation', 'Add the explanation: which sentence says how or why?'], ['Detail', 'Add the detail: which one names the exact molecules, structures or numbers?']],
      tags: ['Point', 'Explanation', 'Detail'], per: 3,
      start: 'Here\'s the point: worth 3 marks. Type it out in full.',
      gain: ['It explains how or why with a new fact: another marking-scheme point.', 'Exact names: three scheme points from one idea.'],
      note: 'Each one is a point, an explanation and a detail: three marking-scheme points, 9 marks.',
      recall: 'Write the whole answer from memory: the point, the explanation and the detail.'
    },
    level: [
      { id: 'inhale', cue: 'Inhalation', statement: 'During inhalation the diaphragm and the intercostal muscles contract.',
        steps: [
          [['The diaphragm flattens and moves down, and the rib cage moves up and out.'], ['Breathing is essential for all living things.', 'f'], ['The heart beats faster during exercise.', 'o']],
          [['This increases the volume of the thoracic cavity, so the pressure inside falls and air rushes into the lungs.'], ['Then the air goes in.', 'v'], ['The lungs push the ribs outwards, and that pulls the air in.', 'w', 'The lungs have no muscle: the diaphragm and ribs move, the lungs follow, and the lower pressure draws air in.']]
        ] },
      { id: 'exhale', cue: 'Exhalation', statement: 'During exhalation the diaphragm and the intercostal muscles relax.',
        steps: [
          [['The diaphragm domes back up and the rib cage moves down and in.'], ['Exhalation is the opposite of inhalation.', 'v'], ['Oxygen is carried by haemoglobin.', 'o']],
          [['The volume of the chest decreases, so the pressure rises above the air outside and air is pushed out.'], ['The air then leaves the body.', 'v'], ['The volume of the chest increases, which pushes the air out.', 'w', 'In exhalation the volume of the chest decreases and the pressure increases.']]
        ] },
      { id: 'alveoli', cue: 'Alveoli and gas exchange', statement: 'Gas exchange takes place in the alveoli, by diffusion.',
        steps: [
          [['Their walls are only one cell thick, so the gases have a very short distance to diffuse.'], ['Alveoli are very important structures in the body.', 'f'], ['The trachea is held open by rings of cartilage.', 'o']],
          [['There are millions of alveoli, giving a huge surface area, and each is wrapped in a dense network of capillaries.'], ['There are lots of them.', 'v'], ['Alveoli have thick, muscular walls that pump the air into the blood.', 'w', 'Alveolar walls are thin (one cell thick), not muscular. Gases cross by diffusion, which needs no pumping.']]
        ] },
      { id: 'moist', cue: 'The moist lining', statement: 'The inside of each alveolus is moist.',
        steps: [
          [['Oxygen dissolves in this moisture before it diffuses across the wall into the blood.'], ['All cells need water.', 'f'], ['Mucus in the trachea traps dust.', 'o']],
          [['In the blood, oxygen joins haemoglobin in the red blood cells, forming oxyhaemoglobin.'], ['Then it goes somewhere in the blood.', 'v'], ['Oxygen is carried mainly in the plasma as hydrogencarbonate.', 'w', 'Oxygen is carried by haemoglobin in red blood cells. It is carbon dioxide that is carried mainly as hydrogencarbonate in the plasma.']]
        ] },
      { id: 'co2', cue: 'Carbon dioxide and the breathing rate', statement: 'Carbon dioxide controls the rate of breathing.',
        steps: [
          [['A high level of carbon dioxide makes the blood more acidic, and this is detected by the medulla oblongata in the brain.'], ['The brain controls lots of things in the body.', 'v'], ['A low level of oxygen in the blood is the main trigger for faster breathing.', 'w', 'Carbon dioxide (making the blood acidic) is the main trigger, not oxygen.']],
          [['The brain sends impulses to the diaphragm and intercostal muscles, so we breathe faster and more deeply.'], ['So the breathing changes.', 'v'], ['Regular exercise is good for your health.', 'f']]
        ] },
      { id: 'trachea', cue: 'The trachea', statement: 'The trachea carries air down to the bronchi.',
        steps: [
          [['Rings of cartilage in its wall keep it open, so it does not collapse.'], ['It is a very important tube.', 'f'], ['The oesophagus carries food to the stomach.', 'o']],
          [['It is lined with mucus, which traps dust and germs, and cilia, which sweep the mucus up and away from the lungs.'], ['It is lined with things that help to keep it clean.', 'v'], ['The cilia sweep dust down into the lungs.', 'w', 'Cilia sweep the mucus and dust UP, away from the lungs, to the throat.']]
        ] }
    ]
  },

  // Build it: after building and labelling, questions on the diagram. tap = structures (anchor names) that are right.
  build: {
    breathing: [
      { q: 'Tap the flap that stops food going into the trachea.', tap: ['epiglottis'] },
      { q: 'Tap the tube held open by rings of cartilage.', tap: ['trachea', 'cartilage'] },
      { q: 'Tap the muscle that flattens and moves down when you breathe in.', tap: ['diaphragm'] },
      { q: 'Tap the muscles between the ribs.', tap: ['intercostal'] },
      { q: 'Tap where gas exchange takes place.', tap: ['alveoli'] },
      { q: 'Tap where the air is filtered, warmed and moistened.', tap: ['nasal'] },
      { q: 'In which body cavity are the lungs?', opts: ['The thoracic cavity (thorax)', 'The abdominal cavity', 'The pelvic cavity', 'The nasal cavity'], a: 0 },
      { q: 'What is the larynx for?', opts: ['Making sounds: it is the voice box', 'Stopping food going into the trachea', 'Filtering the air', 'Gas exchange'], a: 0 }
    ],
    alveolus: [
      { q: 'Tap the arrow showing oxygen moving into the blood.', tap: ['o2'] },
      { q: 'Tap the arrow showing carbon dioxide leaving the blood.', tap: ['co2'] },
      { q: 'Tap the vessel bringing deoxygenated blood from the pulmonary artery.', tap: ['arteriole'] },
      { q: 'Tap a cell that carries oxygen around the body.', tap: ['rbc'] },
      { q: 'Tap the moist lining that gases dissolve in.', tap: ['wall', 'moist'] },
      { q: 'Tap the cell that eats microbes that reach the alveolus.', tap: ['macrophage'] },
      { q: 'How do oxygen and carbon dioxide cross the alveolus wall?', opts: ['By diffusion', 'By active transport', 'By osmosis', 'The heart pumps them across'], a: 0 }
    ],
    breathingMoves: [
      { q: 'Tap the chest that is breathing in.', tap: ['inhale', 'lungIn', 'airIn', 'ribsUp', 'diaphragmDown'] },
      { q: 'Tap the diaphragm when it has contracted and flattened.', tap: ['diaphragmDown'] },
      { q: 'Tap the ribs moving down and in.', tap: ['ribsDown'] },
      { q: 'Tap the diaphragm when it has relaxed and domed up.', tap: ['diaphragmUp'] },
      { q: 'When you breathe in, what happens to the pressure inside the chest?', opts: ['It falls, so air rushes in', 'It rises, so air rushes in', 'It stays the same', 'It falls, so air is pushed out'], a: 0 },
      { q: 'Which muscles contract when you breathe in?', opts: ['The diaphragm and the intercostal muscles', 'The heart and the diaphragm', 'Only the muscles of the abdomen', 'The lungs themselves'], a: 0 }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Diffusion', 'Diffusion is the movement of molecules from a region of high concentration to a region of low concentration.'],
        ['Gas exchange', 'Gas exchange is the diffusion of oxygen into the blood and carbon dioxide out of it, in the alveoli.'],
        ['Inhalation', 'Inhalation is breathing in: the diaphragm and intercostal muscles contract, the chest gets bigger and air rushes in.'],
        ['Exhalation', 'Exhalation is breathing out: the diaphragm and intercostal muscles relax, the chest gets smaller and air is pushed out.'],
        ['Alveolus', 'An alveolus is a tiny air sac in the lungs where gas exchange takes place.'],
        ['Epiglottis', 'The epiglottis is a flap that covers the trachea when you swallow, so food goes down the oesophagus.']
      ] },
    { type: 'sort', name: 'Breathing in or out?', what: 'Quick: does it happen when you breathe in, or when you breathe out?',
      bins: ['Inhalation', 'Exhalation'],
      items: [['Diaphragm contracts', 0], ['Diaphragm relaxes', 1], ['Rib cage moves up and out', 0], ['Rib cage moves down and in', 1], ['Volume of the chest increases', 0],
        ['Volume of the chest decreases', 1], ['Pressure in the chest falls', 0], ['Pressure in the chest rises', 1], ['Intercostal muscles contract', 0], ['Diaphragm domes up', 1]],
      why: 'Breathing in: the muscles contract, the chest gets bigger, the pressure falls and air rushes in. Breathing out (at rest): the muscles relax and it all goes back.' },
    { type: 'sort', name: 'Which part does this job?', what: 'Send each job to the part of the breathing system that does it.',
      bins: ['Nasal cavity', 'Epiglottis', 'Trachea', 'Alveoli'],
      items: [['Filters the air with hairs and mucus', 0], ['Warms and moistens the air', 0], ['Covers the trachea when you swallow', 1], ['Stops food going down into the lungs', 1],
        ['Held open by rings of cartilage', 2], ['Cilia sweep mucus up, away from the lungs', 2], ['Gas exchange happens here', 3], ['Walls one cell thick', 3]],
      why: 'Clean, warm, moist air from the nose; the epiglottis guards the airway; the trachea stays open and keeps itself clean; the alveoli do the gas exchange.' },
    { type: 'sort', name: 'Why the alveolus works so well', what: 'Each feature helps gas exchange in one of four ways. Which one?',
      bins: ['Short distance', 'Big surface area', 'Keeps the gradient steep', 'Gases dissolve'],
      items: [['Alveolus wall one cell thick', 0], ['Capillary wall one cell thick', 0], ['Capillaries pressed close against the alveoli', 0], ['Millions of alveoli', 1], ['Bunches of tiny air sacs', 1],
        ['Breathing keeps bringing fresh air', 2], ['Blood keeps carrying the oxygen away', 2], ['Dense network of capillaries', 2], ['Moist lining', 3]],
      why: 'Diffusion is fast when the distance is short, the surface is large, the concentration difference stays big, and the gas can dissolve first.' },
    { type: 'table', name: 'Inhalation and exhalation', what: 'Fill the table from memory.',
      cols: ['Inhalation', 'Exhalation'], choices: ['Contracts', 'Relaxes', 'Up', 'Down', 'Increases', 'Decreases'],
      rows: [['Diaphragm muscle', ['Contracts', 'Relaxes']], ['Intercostal muscles', ['Contracts', 'Relaxes']], ['Diaphragm moves', ['Down', 'Up']],
        ['Rib cage moves', ['Up', 'Down']], ['Volume of the chest', ['Increases', 'Decreases']], ['Pressure in the chest', ['Decreases', 'Increases']]],
      why: 'Breathing in: both sets of muscles contract, the diaphragm moves down and the ribs up (and out), the volume goes up and the pressure goes down. Breathing out is the reverse.' },
    { type: 'table', name: 'Oxygen and carbon dioxide in the blood', what: 'High or low? Think about where each blood vessel\'s blood has just been.',
      cols: ['Pulmonary artery (to the lungs)', 'Pulmonary vein (from the lungs)', 'Aorta (to the body)', 'Vena cava (from the body)'], choices: ['High', 'Low'],
      rows: [['Oxygen', ['Low', 'High', 'High', 'Low']], ['Carbon dioxide', ['High', 'Low', 'Low', 'High']]],
      why: 'Blood picks up oxygen and loses carbon dioxide in the lungs, then gives up oxygen and collects carbon dioxide (from respiration) in the body. The pulmonary vessels are the exception to "arteries carry oxygenated blood".' }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one line each. The marker decides which lines
  // earn marks, in order; lines that earn nothing carry why (shown after marking) and fix (a better line).
  examiner: [
    { q: '2021-Q16d', part: 5, student: 'Aoife', lines: [
      { t: 'The brain sends an impulse to the breathing muscles.', ok: true },
      { t: 'The intercostal muscles and the diaphragm contract.', ok: true },
      { t: 'Then the chest changes shape.', why: 'Vague: how does it change? Say what happens to the volume of the chest.', fix: 'The volume of the thoracic cavity increases.' },
      { t: 'The ribcage moves up and out.', ok: true },
      { t: 'This raises the pressure in the chest.', why: 'Wrong: the pressure inside the chest decreases. That is why air rushes in.', fix: 'The pressure inside the chest decreases.' },
      { t: 'The muscles between the ribs contract.', why: 'Repeat of line 2: the intercostal muscles are the muscles between the ribs. No new marks.', fix: 'The diaphragm moves down and flattens.' }
    ] },
    { q: '2025-Q16b', part: 5, student: 'Ciarán', lines: [
      { t: 'The intercostal muscles and the diaphragm relax.', ok: true },
      { t: 'The rib cage moves down and inwards.', ok: true },
      { t: 'The diaphragm goes flat.', why: 'Wrong: that is breathing in. When you breathe out the diaphragm relaxes and domes up.', fix: 'The diaphragm moves up into a dome.' },
      { t: 'Everything goes back to normal.', why: 'Vague: say what happens to the volume of the chest.', fix: 'The volume of the chest decreases.' },
      { t: 'The pressure inside the lungs increases.', ok: true },
      { t: 'Oxygen gets pushed out.', why: 'Wrong: it is air that is pushed out, and it is the air you breathe out that is high in carbon dioxide.', fix: 'Air moves out of the lungs.' }
    ] },
    { q: '2019-Q6', part: 1, student: 'Aoife', lines: [
      { t: 'The alveoli have a very large surface area.', ok: true },
      { t: 'They are good for gas exchange.', why: 'Vague: that is what the question asks you to explain. Name a feature.', fix: 'The walls of the capillaries are thin, only one cell thick.' },
      { t: 'The inside surface of an alveolus is moist.', ok: true },
      { t: 'The capillaries have thick muscular walls.', why: 'Wrong: capillary walls are one cell thick, so the gases cross quickly.', fix: 'The alveoli are surrounded by a network of capillaries.' },
      { t: 'The capillaries are in close contact with the alveoli.', ok: true },
      { t: 'There are lots of air sacs so there is a big surface.', why: 'Repeat of line 1: the surface area is already marked.', fix: 'There is a large number of alveoli in each lung.' }
    ] },
    { q: '2017-Q15a', part: 0, student: 'Ciarán', lines: [
      { t: 'An increase in CO2 in the blood is detected.', ok: true },
      { t: 'A message is sent from the brain to the breathing muscles.', ok: true },
      { t: 'The diaphragm contracts and flattens.', ok: true },
      { t: 'The ribs do their job.', why: 'Vague: which muscles act on the ribs, and which way do the ribs move?', fix: 'The intercostal muscles contract and the rib cage moves up and out.' },
      { t: 'The volume of the chest gets smaller.', why: 'Wrong: in inhalation the volume of the chest increases.', fix: 'The volume of the thoracic cavity increases.' },
      { t: 'The pressure in the thorax goes up.', why: 'Wrong: the pressure in the thorax decreases, so air rushes in.', fix: 'The pressure in the thorax decreases, so air rushes in.' }
    ] },
    { q: '2021-Q16d', part: 1, student: 'Ciarán', lines: [
      { t: 'They have a large surface area.', ok: true },
      { t: 'They are really small.', why: 'Vague: being small is not the adaptation. Name a feature that helps gas exchange.', fix: 'They have a moist surface.' },
      { t: 'They have thick walls so they do not burst.', why: 'Wrong: the walls of the alveoli are thin (one cell thick), so gases diffuse across quickly.', fix: 'Their membranes are thin, only one cell thick.' },
      { t: 'They have a rich capillary supply.', ok: true }
    ] }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P28-1', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Give two ways the nasal cavity prepares the air before it reaches the lungs.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Filters it: hairs and mucus trap dust and microbes', m: 3, k: [{ w: ['filter'], n: 1 }, { w: ['trap'], n: 1 }, { w: ['hair'], n: 1 }, { w: ['mucus'], n: 1 }] },
        { a: 'Warms it', m: 3, k: [{ w: ['warm'], n: 1 }, { w: ['heat'], n: 1 }] },
        { a: 'Moistens it', m: 3, k: [{ w: ['moist'], n: 1 }, { w: ['damp'], n: 1 }, { w: ['wet'], n: 1 }, { w: ['humid'], n: 1 }] }] },
      { l: '(b)', q: 'Suggest why breathing through the nose is better for the lungs than breathing through the mouth.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The air is filtered, warmed and moistened in the nose (but not in the mouth)', m: 3, k: [{ w: ['filter'], n: 1 }, { w: ['warm'], n: 1 }, { w: ['moist'], n: 1 }, { w: ['clean'], n: 1 }] }] }
    ] },
    { id: 'P28-2', src: 'Practice question (not from a real paper)', stem: 'The trachea and bronchi are lined with mucus and with cells that have cilia.', parts: [
      { l: '(a)', q: 'Explain how the mucus and the cilia protect the lungs.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Mucus traps dust and microbes', m: 3, k: [{ w: ['mucus', 'trap'], n: 2 }, { w: ['mucus', 'dust'], n: 2 }, { w: ['mucus', 'microb'], n: 2 }, { w: ['mucus', 'germ'], n: 2 }, { w: ['mucus', 'bacteria'], n: 2 }] },
        { a: 'Cilia sweep (beat) the mucus up, towards the throat, away from the lungs', m: 3, k: [{ w: ['cilia', 'sweep'], n: 2 }, { w: ['cilia', 'up'], n: 2 }, { w: ['cilia', 'away'], n: 2 }, { w: ['cilia', 'beat'], n: 2 }, { w: ['cilia', 'move'], n: 2 }, { w: ['cilia', 'throat'], n: 2 }] }] },
      { l: '(b)', q: 'Smoke damages the cilia. Suggest why smokers often cough.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The mucus is not swept away, so it builds up and has to be coughed up', m: 3, k: [{ w: ['mucus', 'build'], n: 2 }, { w: ['mucus', 'collect'], n: 2 }, { w: ['mucus', 'stay'], n: 2 }, { w: ['mucus', 'remov'], n: 2 }, { w: ['mucus', 'cough'], n: 2 }, { w: ['mucus', 'swept'], n: 2 }] }] }
    ] },
    { id: 'P28-3', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Name, in order, the five structures air passes through between the nasal cavity and the alveoli.', m: 10, n: 5, kind: 'text', pts: [
        { a: 'Pharynx', m: 2, k: [{ w: ['pharynx'], n: 1 }, { w: ['throat'], n: 1 }] },
        { a: 'Larynx', m: 2, k: [{ w: ['larynx'], n: 1 }, { w: ['voice', 'box'], n: 2 }] },
        { a: 'Trachea', m: 2, k: [{ w: ['trachea'], n: 1 }, { w: ['windpipe'], n: 1 }] },
        { a: 'Bronchus', m: 2, k: [{ w: ['bronchus'], n: 1 }, { w: ['bronchi'], n: 1 }] },
        { a: 'Bronchioles', m: 2, k: [{ w: ['bronchiole'], n: 1 }] }] },
      { l: '(b)', q: 'State the function of the bronchioles.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Carry air to (and from) the alveoli', m: 3, k: [{ w: ['air', 'alveol'], n: 2 }, { w: ['carry', 'air'], n: 2 }, { w: ['air', 'sac'], n: 2 }] }] },
      { l: '(c)', q: 'The pharynx is part of two body systems. Explain.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Both air and food pass through it (breathing and digestive systems)', m: 3, k: [{ w: ['air', 'food'], n: 2 }, { w: ['breath', 'digest'], n: 2 }] }] }
    ] },
    { id: 'P28-4', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What is meant by a concentration gradient?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'A difference in concentration between two regions', m: 3, k: [{ w: ['differ', 'concentr'], n: 2 }, { w: ['high', 'low', 'concentr'], n: 3 }] }] },
      { l: '(b)', q: 'Explain how breathing and the flow of blood keep the concentration gradients steep at the alveolus.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'Breathing keeps bringing in fresh air, high in oxygen', m: 3, k: [{ w: ['fresh', 'air'], n: 2 }, { w: ['new', 'air'], n: 2 }, { w: ['renew', 'air'], n: 2 }, { w: ['replac', 'air'], n: 2 }] },
        { a: 'Blood flow carries the oxygen away, so the blood arriving is always low in oxygen', m: 3, k: [{ w: ['blood', 'oxygen', 'away'], n: 3 }, { w: ['blood', 'low', 'oxygen'], n: 3 }] },
        { a: 'Blood keeps bringing carbon dioxide, and breathing out removes it from the alveolus', m: 3, k: [{ w: ['bring', 'carbon', 'dioxid'], n: 3 }, { w: ['breath', 'out', 'carbon', 'dioxid'], n: 4 }, { w: ['remov', 'carbon', 'dioxid'], n: 3 }, { w: ['bring', 'co2'], n: 2 }, { w: ['remov', 'co2'], n: 2 }] }] }
    ] },
    { id: 'P28-5', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Explain how a rise in carbon dioxide in the blood leads to faster breathing.', m: 12, n: 4, kind: 'text', pts: [
        { a: 'Carbon dioxide makes the blood more acidic (its pH falls)', m: 3, k: [{ w: ['acid'], n: 1 }, { w: ['ph'], n: 1 }] },
        { a: 'This is detected by the medulla oblongata in the brain', m: 3, k: [{ w: ['medulla'], n: 1 }, { w: ['brain', 'detect'], n: 2 }] },
        { a: 'Nerve impulses are sent to the diaphragm and intercostal muscles', m: 3, k: [{ w: ['impuls'], n: 1 }, { w: ['nerve'], n: 1 }, { w: ['message', 'muscle'], n: 2 }, { w: ['signal', 'muscle'], n: 2 }] },
        { a: 'They contract faster and harder: breathing becomes faster and deeper', m: 3, k: [{ w: ['fast'], n: 1 }, { w: ['deep'], n: 1 }, { w: ['rate', 'increas'], n: 2 }] }] },
      { l: '(b)', q: 'Name the process in body cells that produces this carbon dioxide.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Respiration (aerobic respiration)', m: 3, k: [{ w: ['respir'], n: 1 }] }] }
    ] }
  ],
  // Quick games: match pairs (term, what it means), spot the mistake (the wrong words are in *stars*; fix is the right
  // words, opts are wrong ones to choose from), and which diagrams label sprint uses.
  match: [
    ['Nasal cavity', 'Warms, moistens and filters the air'],
    ['Epiglottis', 'Covers the trachea when you swallow'],
    ['Larynx', 'The voice box'],
    ['Trachea', 'Held open by rings of cartilage'],
    ['Cilia', 'Sweep mucus up, away from the lungs'],
    ['Bronchi', 'Carry air into each lung'],
    ['Alveoli', 'Where gas exchange happens'],
    ['Diaphragm', 'Contracts and flattens when you breathe in'],
    ['Intercostal muscles', 'Lift the ribs up and out'],
    ['Medulla oblongata', 'Detects carbon dioxide and controls breathing'],
    ['Haemoglobin', 'Carries oxygen in red blood cells'],
    ['Diffusion', 'Gases moving from high to low concentration']
  ],
  spot: [
    { s: 'When you breathe in, the diaphragm *relaxes* and moves down.', fix: 'contracts', opts: ['domes up', 'stops moving'],
      why: 'The diaphragm contracts, flattens and moves down when you breathe in. It relaxes when you breathe out.' },
    { s: 'Gas exchange happens across the walls of the *bronchioles*.', fix: 'alveoli', opts: ['trachea', 'ribs'],
      why: 'Gas exchange happens in the alveoli: their walls are one cell thick, moist and wrapped in capillaries.' },
    { s: 'Oxygen moves from the alveoli into the blood by *osmosis*.', fix: 'diffusion', opts: ['active transport', 'peristalsis'],
      why: 'Gases move by diffusion, from high to low concentration. Osmosis is only for water.' },
    { s: 'The *larynx* covers the trachea when you swallow.', fix: 'epiglottis', opts: ['diaphragm', 'bronchus'],
      why: 'The epiglottis is the flap that covers the trachea. The larynx is the voice box.' },
    { s: 'Rings of *muscle* keep the trachea open.', fix: 'cartilage', opts: ['bone', 'mucus'],
      why: 'Rings of cartilage stop the trachea collapsing.' },
    { s: 'When you breathe in, the chest gets bigger and the air pressure inside it *rises*.', fix: 'falls', opts: ['stays the same', 'doubles'],
      why: 'More volume means lower pressure inside, so air is pushed in from outside.' },
    { s: 'The wall of an alveolus is *two cells* thick, so gases cross it quickly.', fix: 'one cell', opts: ['ten cells', 'a millimetre'],
      why: 'The wall is one cell thick, so gases only have a short distance to diffuse.' },
    { s: 'A rise in *oxygen* in the blood makes you breathe faster and deeper.', fix: 'carbon dioxide', opts: ['glucose', 'red blood cells'],
      why: 'The medulla oblongata detects more carbon dioxide (the blood\'s pH falls) and speeds up breathing.' },
    { s: 'Cilia sweep mucus and trapped dust *down into the lungs*.', fix: 'up, away from the lungs', opts: ['into the alveoli', 'into the blood'],
      why: 'Cilia beat to move mucus up and out of the airways, where it is swallowed or coughed up.' },
    { s: 'Blood arrives at the alveoli in the *pulmonary vein*, low in oxygen.', fix: 'pulmonary artery', opts: ['aorta', 'vena cava'],
      why: 'The pulmonary artery brings deoxygenated blood to the lungs. The pulmonary vein takes oxygenated blood back to the heart.' },
    { s: 'When you breathe in, the intercostal muscles pull the ribs *down and in*.', fix: 'up and out', opts: ['backwards', 'towards the diaphragm'],
      why: 'The intercostal muscles contract and lift the rib cage up and out. The ribs move down and in when you breathe out.' }
  ],
  sprint: ['breathing', 'alveolus']
};

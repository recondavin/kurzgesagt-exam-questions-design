// Chapter 29, the urinary system: what the games and memory drills use. Written to the new course's learning
// outcome 2.6.3 (kidneys, nephron, filtration, reabsorption, ADH and osmoregulation) and 1.1.1/2.4.5 (homeostasis).
window.BioLearn = window.BioLearn || {};
window.BioLearn[29] = {
  // Nephron run: catch what gets filtered, then reabsorb what the body needs (bio/bio-games.js).
  action: { name: 'Nephron run', what: 'Be the nephron: catch what gets filtered, take back what the body needs, then be ADH.' },

  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'How urine is made', steps: ['Blood arrives in the wide afferent arteriole', 'The narrow efferent arteriole keeps the pressure high', 'Small molecules are forced into Bowman\'s capsule', 'Glucose and amino acids are reabsorbed in the PCT', 'Water is reabsorbed in the loop of Henle and DCT', 'Urine flows down the collecting duct'],
        why: 'Blood enters the glomerulus in the wide <b>afferent arteriole</b> and leaves in the narrower <b>efferent arteriole</b>, so the <b>pressure</b> is high and small molecules are forced into <b>Bowman\'s capsule</b> (<b>filtration</b>). All the <b>glucose</b> and <b>amino acids</b> are <b>reabsorbed</b> in the <b>proximal convoluted tubule</b>, <b>water</b> is reabsorbed along the <b>loop of Henle</b> and <b>distal tubule</b>, and what is left flows down the <b>collecting duct</b> as urine.' },
      { title: 'Short of water: ADH', steps: ['You sweat a lot or don\'t drink enough', 'Your blood becomes too concentrated', 'The hypothalamus detects the change', 'The pituitary gland releases more ADH', 'Collecting ducts become more permeable to water', 'More water is reabsorbed: a little concentrated urine'],
        why: 'When you lose water (<b>sweating</b>, not drinking), the blood becomes too <b>concentrated</b>. The <b>hypothalamus</b> detects it and the <b>pituitary gland</b> releases more <b>ADH</b>, which makes the <b>collecting ducts</b> more <b>permeable</b>, so more <b>water is reabsorbed</b> and you make a <b>small volume</b> of <b>concentrated urine</b>.' },
      { title: 'Too much water: less ADH', steps: ['You drink a lot of water', 'Your blood becomes too dilute', 'The hypothalamus detects the change', 'The pituitary gland releases less ADH', 'Collecting ducts become less permeable to water', 'Less water is reabsorbed: lots of dilute urine'],
        why: 'After drinking a lot, the blood is too <b>dilute</b>. The <b>hypothalamus</b> detects it and the <b>pituitary</b> releases <b>less ADH</b>, so the <b>collecting ducts</b> are <b>less permeable</b>, <b>less water</b> is reabsorbed and you make a <b>large volume</b> of <b>dilute urine</b>.' },
      { title: 'Where urea comes from', steps: ['You eat more protein than you need', 'Spare amino acids reach the liver', 'The liver breaks them down (deamination), making urea', 'Urea travels in the blood to the kidneys', 'It is filtered into Bowman\'s capsule', 'It leaves in urine: ureter, bladder, urethra'],
        why: 'Spare <b>amino acids</b> from <b>protein</b> are broken down in the <b>liver</b> by <b>deamination</b>, which makes <b>urea</b>. Urea travels in the <b>blood</b> to the <b>kidneys</b>, is <b>filtered</b> into Bowman\'s capsule and leaves the body in <b>urine</b> through the <b>ureter</b>, <b>bladder</b> and <b>urethra</b>.' }
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
      { id: 'filter', cue: 'Filtration', statement: 'Filtration takes place in the glomerulus and Bowman\'s capsule.',
        steps: [
          [['The blood is under high pressure because the efferent arteriole is narrower than the afferent arteriole.'], ['Filtration is a very important process for the body.', 'f'], ['The heart pumps blood around the body.', 'o']],
          [['Small molecules such as water, glucose, urea and salts are forced into the capsule, but proteins and blood cells stay in the blood.'], ['Some things go into the capsule and some don\'t.', 'v'], ['Red blood cells and proteins are filtered into the capsule.', 'w', 'They are too big: they stay in the blood. A protein in urine is a sign of kidney damage.']]
        ] },
      { id: 'pct', cue: 'Reabsorption in the PCT', statement: 'Useful substances are reabsorbed in the proximal convoluted tubule.',
        steps: [
          [['All the glucose and amino acids are taken back into the blood by active transport.'], ['This happens in the kidney.', 'v'], ['The liver stores glucose as glycogen.', 'o']],
          [['The PCT\'s cells have microvilli for a large surface area and many mitochondria to supply the energy.'], ['The cells are well suited to this job.', 'v'], ['Glucose is reabsorbed in the collecting duct under the control of ADH.', 'w', 'All the glucose is reabsorbed in the PCT. ADH controls water, not glucose.']]
        ] },
      { id: 'loop', cue: 'The loop of Henle', statement: 'The loop of Henle helps the kidney reabsorb water.',
        steps: [
          [['It makes the medulla very salty, so water passes out of the tubule by osmosis.'], ['Water is very important to all living things.', 'f'], ['Glomerular filtrate contains glucose.', 'o']],
          [['Desert animals such as camels and desert rats have longer loops, so they reabsorb more water and make very concentrated urine.'], ['Some animals have longer ones.', 'v'], ['Animals in wet places have the longest loops of Henle.', 'w', 'Desert animals have the longest loops: they need to save the most water.']]
        ] },
      { id: 'adh', cue: 'ADH', statement: 'ADH controls how much water the kidneys reabsorb.',
        steps: [
          [['It makes the walls of the collecting ducts (and DCT) more permeable to water.'], ['It is a hormone that does a lot.', 'v'], ['Insulin lowers the level of glucose in the blood.', 'o']],
          [['So more water returns to the blood and a small volume of concentrated urine is made.'], ['This changes the urine.', 'v'], ['More ADH makes a large volume of dilute urine.', 'w', 'More ADH means more water reabsorbed, so less urine and more concentrated.']]
        ] },
      { id: 'homeo', cue: 'The kidneys and homeostasis', statement: 'The kidneys help to keep the internal environment constant (homeostasis).',
        steps: [
          [['They control the amount of water and salt in the blood, which is called osmoregulation.'], ['Homeostasis is needed by every organism.', 'f'], ['The skin controls body temperature by sweating.', 'o']],
          [['They also excrete urea, a waste made in the liver from spare amino acids.'], ['They get rid of some waste too.', 'v'], ['They excrete carbon dioxide made in respiration.', 'w', 'Carbon dioxide is excreted by the lungs. The kidneys excrete urea, salts and water.']]
        ] }
    ]
  },

  // Build it: after building and labelling, questions on the diagram. tap = structures (anchor names) that are right.
  build: {
    nephron: [
      { q: 'Tap where the blood is filtered.', tap: ['glomerulus', 'capsule'] },
      { q: 'Tap where all the glucose and amino acids are reabsorbed.', tap: ['pct'] },
      { q: 'Tap the part that is longer in desert animals like camels.', tap: ['loop', 'descending', 'ascending'] },
      { q: 'Tap a place where ADH acts.', tap: ['duct', 'dct'] },
      { q: 'Tap the narrower arteriole that keeps the pressure in the glomerulus high.', tap: ['efferent'] },
      { q: 'Why does blood enter the glomerulus under high pressure?', opts: ['The efferent arteriole is narrower than the afferent arteriole', 'The loop of Henle squeezes it', 'ADH raises the pressure', 'The collecting duct pumps it'], a: 0 },
      { q: 'Which of these is NOT normally in the glomerular filtrate?', opts: ['Plasma proteins', 'Glucose', 'Urea', 'Salts'], a: 0 }
    ],
    kidney: [
      { q: 'Tap the region where the glomeruli and Bowman\'s capsules are.', tap: ['cortex'] },
      { q: 'Tap the region where the loops of Henle are.', tap: ['medulla', 'pyramid'] },
      { q: 'Tap where urine collects before it leaves the kidney.', tap: ['pelvis'] },
      { q: 'Tap the vessel that carries blood with the least urea.', tap: ['renalVein'] },
      { q: 'Tap the tube that carries urine to the bladder.', tap: ['ureter'] },
      { q: 'Which blood vessel does the renal artery branch from?', opts: ['The aorta', 'The vena cava', 'The hepatic portal vein', 'The pulmonary artery'], a: 0 }
    ],
    urinary: [
      { q: 'Tap where urine is stored until it leaves the body.', tap: ['bladder'] },
      { q: 'Tap the tube that carries urine from a kidney to the bladder.', tap: ['ureter'] },
      { q: 'Tap the tube urine leaves the body through.', tap: ['urethra'] },
      { q: 'Tap the vessel bringing blood to be filtered.', tap: ['renalArtery'] },
      { q: 'Tap the ring of muscle that controls when urine is let out.', tap: ['sphincter'] },
      { q: 'In which cavity of the body are the kidneys?', opts: ['The abdomen', 'The thorax (chest)', 'The pelvis', 'The cranium'], a: 0 }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Excretion', 'Excretion is the removal of the waste products of metabolism from the body.'],
        ['Egestion', 'Egestion is the removal of undigested food (faeces) from the body.'],
        ['Homeostasis', 'Homeostasis is the maintenance of a constant internal environment.'],
        ['Osmoregulation', 'Osmoregulation is the control of the water and salt balance of the body.'],
        ['Nephron', 'The nephron is the functional unit of the kidney.'],
        ['Deamination', 'Deamination is the breakdown of spare amino acids in the liver, which forms urea.']
      ] },
    { type: 'sort', name: 'Filtered or not?', what: 'Quick: does it get filtered into Bowman\'s capsule, or stay in the blood?',
      bins: ['Filtered', 'Stays in the blood'],
      items: [['Glucose', 0], ['Water', 0], ['Urea', 0], ['Salts', 0], ['Amino acids', 0], ['Vitamins', 0], ['Red blood cells', 1], ['White blood cells', 1], ['Platelets', 1], ['Plasma proteins', 1]],
      why: 'Only small molecules fit through the capillary walls and the capsule\'s inner lining. Cells and proteins are too big.' },
    { type: 'sort', name: 'Where is it reabsorbed?', what: 'Send each one to the part of the nephron where it\'s taken back into the blood.',
      bins: ['PCT', 'Loop of Henle', 'DCT and collecting duct'],
      items: [['All the glucose', 0], ['All the amino acids', 0], ['Most of the salts', 0], ['Water (descending limb)', 1], ['Salts (ascending limb)', 1], ['Water, controlled by ADH', 2], ['More water when you\'re dehydrated', 2]],
      why: 'Everything useful comes back in the PCT; the loop of Henle sets up the salty medulla; ADH fine-tunes water in the DCT and collecting duct.' },
    { type: 'table', name: 'Plasma, filtrate and urine', what: 'Fill the table from memory: is each one there?',
      cols: ['Blood plasma', 'Glomerular filtrate', 'Urine'], choices: ['Yes', 'No', 'More'],
      rows: [['Proteins', ['Yes', 'No', 'No']], ['Glucose', ['Yes', 'Yes', 'No']], ['Urea', ['Yes', 'Yes', 'More']], ['Salts', ['Yes', 'Yes', 'Yes']], ['Water', ['Yes', 'Yes', 'Yes']]],
      why: 'Proteins are too big to be filtered. Glucose is filtered but all of it is reabsorbed, so none is in urine. Urea is filtered and not taken back, so it is more concentrated in urine.' }
  ],

  // Be the examiner (bio/bio-examiner.js): a made-up student's answer to a real exam part, one line each. ok: written
  // to earn a scheme point. Lines that earn nothing have why (the examiner's note) and fix (a line that earns a new point).
  examiner: [
    { q: '2016-Q12b', part: 2, student: 'Aoife', lines: [
      { t: 'ADH is released by the pituitary when you are dehydrated.', ok: true },
      { t: 'It works somewhere in the kidney.', why: 'Vague: where exactly does it act?', fix: 'It acts on the collecting ducts and the distal convoluted tubules.' },
      { t: 'It makes the walls of the tubules more permeable.', ok: true },
      { t: 'So more water is reabsorbed back into the blood.', ok: true },
      { t: 'ADH makes you produce more urine.', why: 'Wrong: more ADH means less urine, and it is more concentrated.', fix: 'The volume of urine is lowered, so the urine is more concentrated.' }
    ] },
    { q: '2006-Q13b', part: 4, student: 'Ciarán', lines: [
      { t: 'The athlete loses a lot of water by sweating.', ok: true },
      { t: 'So the concentration of the blood increases.', ok: true },
      { t: 'The brain knows about it.', why: 'Vague: how does the brain find out?', fix: 'The change is detected by receptors in the brain.' },
      { t: 'The kidneys release ADH, which makes the urine concentrated.', why: 'Wrong: ADH is made in the brain and released by the pituitary gland, not the kidneys.', fix: 'ADH is secreted by the pituitary gland.' },
      { t: 'ADH causes more water to be reabsorbed.', ok: true },
      { t: 'He loses water by sweating.', why: 'Repeat of line 1.', fix: 'The water is taken back in the collecting duct.' }
    ] },
    { q: '2004-Q12a', part: 0, student: 'Aoife', lines: [
      { t: 'Homeostasis is maintaining a constant internal environment.', ok: true },
      { t: 'The kidneys keep the body healthy.', why: 'Vague: how do the kidneys help?', fix: 'The kidneys maintain the water balance of the blood.' },
      { t: 'The kidneys maintain the salt balance of the body.', ok: true },
      { t: 'The kidneys control body temperature by sweating.', why: 'Wrong: the skin controls temperature. The kidneys control water and salt.', fix: 'They maintain the water balance by changing how much water is reabsorbed.' },
      { t: 'It is about maintaining the internal environment.', why: 'Repeat of line 1.', fix: 'The kidneys maintain the water balance of the body.' }
    ] },
    { q: '2010-Q15c', part: 0, student: 'Ciarán', lines: [
      { t: 'The athlete lost water by exhaling and sweating.', ok: true },
      { t: 'So there is less water in the blood.', ok: true },
      { t: 'ADH is secreted by the pituitary gland.' },
      { t: 'The kidneys stop working when you exercise.', why: 'Wrong: the kidneys keep working. They save water when you are short of it.', fix: 'ADH causes the collecting ducts to reabsorb water.' }
    ] },
    { q: '2007-Q15c', part: 0, student: 'Aoife', lines: [
      { t: 'Homeostasis is the maintenance of a constant internal environment.', ok: true },
      { t: 'It is important because it is good for you.', why: 'Vague: say what it lets the body do.', fix: 'It allows normal metabolic activities to happen in the cells.' },
      { t: 'Homeostasis is when your temperature goes up and down.', why: 'Wrong: homeostasis keeps things steady. It doesn\'t let them swing.', fix: 'It keeps the temperature suitable for enzyme reactions.' },
      { t: 'Keeping the internal environment constant is very important.', why: 'Repeat of line 1.', fix: 'For example, it keeps the water and salt balance of the blood steady.' }
    ] }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P29-1', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Explain the term osmoregulation.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Control of the water and salt balance (of the body)', m: 3, k: [{ w: ['control', 'water', 'salt'], n: 2 }, { w: ['regul', 'water', 'salt'], n: 2 }] }] },
      { l: '(b)', q: 'Describe how ADH helps the body when the blood is too dilute, for example after drinking a lot of water.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'Less ADH is released (by the pituitary)', m: 3, k: [{ w: ['less', 'adh'], n: 2 }, { w: ['adh', 'decreas'], n: 2 }, { w: ['adh', 'low'], n: 2 }] },
        { a: 'Collecting ducts (or DCT) become less permeable to water', m: 3, k: [{ w: ['less', 'permeab'], n: 2 }] },
        { a: 'Less water reabsorbed, so a large volume of dilute urine', m: 3, k: [{ w: ['large', 'volum'], n: 2 }, { w: ['dilut', 'urine'], n: 2 }, { w: ['less', 'water', 'reabsorb'], n: 3 }] }] }
    ] },
    { id: 'P29-2', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Name the part of the nephron where glucose is reabsorbed, and state how it is reabsorbed.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Proximal convoluted tubule (PCT)', m: 3, k: [{ w: ['proxim'], n: 1 }, { w: ['pct'], n: 1 }] },
        { a: 'Active transport', m: 3, k: [{ w: ['activ', 'transport'], n: 2 }] }] },
      { l: '(b)', q: 'Give two ways the cells of this part are adapted for reabsorption.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Microvilli (large surface area)', m: 3, k: [{ w: ['microvill'], n: 1 }, { w: ['large', 'surfac', 'area'], n: 3 }] },
        { a: 'Many mitochondria (energy for active transport)', m: 3, k: [{ w: ['mitochondri'], n: 1 }] }] },
      { l: '(c)', q: 'What is the role of the urinary bladder?', m: 3, n: 1, kind: 'text', pts: [{ a: 'Stores urine (until it is released through the urethra)', m: 3, k: [{ w: ['stor', 'urine'], n: 2 }] }] }
    ] }
  ],
  // Quick games: match pairs (term, what it means), spot the mistake (the wrong words are in *stars*; fix is the right
  // words, opts are wrong ones to choose from), and which diagrams label sprint uses.
  match: [
    ['Renal artery', 'Brings blood to the kidney'],
    ['Renal vein', 'Takes filtered blood away from the kidney'],
    ['Ureter', 'Carries urine from the kidney to the bladder'],
    ['Bladder', 'Stores urine'],
    ['Urethra', 'Carries urine out of the body'],
    ['Glomerulus', 'Knot of capillaries where blood is filtered'],
    ['Bowman\'s capsule', 'Collects the filtrate'],
    ['PCT', 'Takes back all the glucose and amino acids'],
    ['Loop of Henle', 'Makes the medulla salty'],
    ['Collecting duct', 'The last place water is taken back'],
    ['ADH', 'Makes the kidneys take back more water'],
    ['Deamination', 'The liver turns spare amino acids into urea']
  ],
  spot: [
    { s: 'Urine flows from the kidney to the bladder in the *urethra*.', fix: 'ureter', opts: ['renal vein', 'collecting duct'],
      why: 'The ureter carries urine from the kidney to the bladder. The urethra carries it out of the body.' },
    { s: 'Blood reaches the glomerulus in the *efferent* arteriole.', fix: 'afferent', opts: ['hepatic', 'coronary'],
      why: 'Afferent arrives, efferent exits. The afferent arteriole brings blood in; the narrower efferent arteriole takes it away.' },
    { s: 'All the glucose is reabsorbed in the *loop of Henle*.', fix: 'proximal convoluted tubule', opts: ['bladder', 'ureter'],
      why: 'All the glucose and amino acids are taken back in the PCT. The loop of Henle takes back water and salts.' },
    { s: '*Proteins* are small enough to be filtered into Bowman\'s capsule.', fix: 'Urea and glucose', opts: ['Red blood cells', 'Platelets'],
      why: 'Proteins and blood cells are too big to be filtered. Water, glucose, salts and urea are filtered.' },
    { s: 'When you are dehydrated, the pituitary gland releases *less* ADH.', fix: 'more', opts: ['no', 'half as much'],
      why: 'When you are dehydrated the blood is too concentrated, so more ADH is released and more water is taken back.' },
    { s: 'ADH is released by the *kidneys*.', fix: 'pituitary gland', opts: ['liver', 'bladder'],
      why: 'The hypothalamus detects the change and the pituitary gland releases ADH. ADH then acts on the kidneys.' },
    { s: 'Urea is made in the *kidneys* by deamination.', fix: 'liver', opts: ['bladder', 'pancreas'],
      why: 'The liver deaminates spare amino acids, forming urea. The kidneys only remove it from the blood.' },
    { s: 'The pyramids are found in the *cortex* of the kidney.', fix: 'medulla', opts: ['pelvis', 'ureter'],
      why: 'The medulla is made of pyramids. The cortex is the outer layer.' },
    { s: 'Filtration happens because the blood pressure in the glomerulus is *low*.', fix: 'high', opts: ['zero', 'the same as in a vein'],
      why: 'The efferent arteriole is narrower than the afferent, so pressure builds up and forces small molecules out.' },
    { s: 'Excretion is the removal of *undigested food* from the body.', fix: 'the waste products of metabolism', opts: ['all the water', 'blood cells'],
      why: 'Removing undigested food is egestion. Excretion removes the waste products of metabolism, like urea and carbon dioxide.' },
    { s: 'The renal *vein* brings blood to the kidney to be filtered.', fix: 'artery', opts: ['pelvis', 'capsule'],
      why: 'The renal artery brings blood in. The renal vein takes the filtered blood away.' }
  ],
  sprint: ['urinary', 'kidney', 'nephron']
};

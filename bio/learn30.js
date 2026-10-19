// Chapter 30, the digestive system: what the games and memory drills use. Written to the new course's learning
// outcomes 2.6.4 (digesting fats, carbohydrates and proteins), 2.6.5 (absorption, transport and storage) and 2.6.6 (diet).
window.BioLearn = window.BioLearn || {};
window.BioLearn[30] = {
  // Gut run: be each enzyme on the way through the gut, then absorb the products (bio/act30.js).
  action: { name: 'Gut run', what: 'Ride a meal through the gut: be amylase, pepsin and lipase, then send the products into the blood or the lacteal.' },

  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'Digesting starch', steps: ['You chew food and the salivary glands add saliva', 'Salivary amylase starts breaking starch into maltose (pH 7)', 'The acid in the stomach stops amylase working', 'In the duodenum, amylase from the pancreas digests the rest of the starch', 'Maltose is broken down into glucose in the small intestine', 'Glucose is absorbed into the blood in the villi'],
        why: 'Saliva from the <b>salivary glands</b> contains <b>amylase</b>, which starts breaking <b>starch</b> into <b>maltose</b> in the <b>mouth</b> at about <b>pH 7</b>. The <b>acid</b> in the stomach stops it, then <b>pancreatic amylase</b> finishes the job in the <b>duodenum</b>. Maltose is broken down into <b>glucose</b>, which is <b>absorbed</b> into the <b>blood capillaries</b> of the <b>villi</b>.' },
      { title: 'Digesting protein', steps: ['The stomach churns the food with gastric juice', 'Hydrochloric acid makes the pH about 2 and kills bacteria', 'Pepsin, a protease, breaks proteins into peptides', 'In the duodenum, a protease from the pancreas keeps going', 'Peptides are broken down into amino acids', 'Amino acids are absorbed into the blood in the villi'],
        why: 'The <b>stomach</b> churns food with <b>gastric juice</b>. Its <b>hydrochloric acid</b> gives a <b>pH of about 2</b> and <b>kills bacteria</b>, and <b>pepsin</b>, a <b>protease</b>, breaks <b>proteins</b> into <b>peptides</b>. A <b>protease from the pancreas</b> carries on in the <b>duodenum</b> until they are <b>amino acids</b>, which are <b>absorbed</b> into the <b>blood</b> in the villi.' },
      { title: 'Digesting fat', steps: ['The liver makes bile', 'Bile is stored in the gall bladder', 'Bile flows down the bile duct into the duodenum', 'Bile salts emulsify fat into tiny droplets', 'Lipase from the pancreas digests the droplets', 'Fatty acids and glycerol are absorbed into the lacteals'],
        why: 'The <b>liver</b> makes <b>bile</b>, which is stored in the <b>gall bladder</b> and released down the <b>bile duct</b> into the <b>duodenum</b>. <b>Bile salts emulsify</b> fat into tiny droplets, giving a large <b>surface area</b> for <b>lipase</b> from the <b>pancreas</b>, which digests it into <b>fatty acids</b> and <b>glycerol</b>. These are absorbed into the <b>lacteals</b>.' },
      { title: 'From the villus to the liver', steps: ['Digested food reaches the ileum', 'Villi and microvilli give a huge surface area', 'Glucose and amino acids pass into the blood capillaries', 'The hepatic portal vein carries them to the liver', 'Spare glucose is stored as glycogen', 'Spare amino acids are deaminated, forming urea'],
        why: 'In the <b>ileum</b>, <b>villi</b> and <b>microvilli</b> give a huge <b>surface area</b>. <b>Glucose</b> and <b>amino acids</b> pass into the <b>blood capillaries</b> by <b>diffusion</b> and <b>active transport</b>, and the <b>hepatic portal vein</b> carries them to the <b>liver</b>. The liver stores spare glucose as <b>glycogen</b> and <b>deaminates</b> spare amino acids, forming <b>urea</b>.' },
      { title: 'Fibre and the large intestine', steps: ['Fibre (cellulose) cannot be digested', 'It adds bulk to the food in the gut', 'The gut muscles have something to push against: peristalsis', 'Water is absorbed in the colon', 'Faeces are stored in the rectum', 'Faeces leave through the anus: egestion'],
        why: 'We cannot digest <b>fibre</b> (<b>cellulose</b>), so it adds <b>bulk</b>. That gives the gut muscles something to push against, so <b>peristalsis</b> moves food along and prevents <b>constipation</b>. In the <b>colon</b>, <b>water is absorbed</b>; the <b>faeces</b> are stored in the <b>rectum</b> and leave through the <b>anus</b> (<b>egestion</b>).' }
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
      { id: 'bile', cue: 'Bile and fat', statement: 'Bile salts emulsify fats.',
        steps: [
          [['They break large fat droplets into many tiny droplets, giving lipase a much larger surface area to work on.'], ['Bile is a very useful liquid in the body.', 'f'], ['The stomach makes hydrochloric acid.', 'o']],
          [['Bile is made in the liver, stored in the gall bladder and released down the bile duct into the duodenum.'], ['It is made in one place and stored in another.', 'v'], ['Bile is an enzyme that digests fat into fatty acids and glycerol.', 'w', 'Bile is not an enzyme: it only emulsifies the fat. Lipase digests it.']]
        ] },
      { id: 'villus', cue: 'Villi and absorption', statement: 'The villi of the ileum are adapted for absorbing digested food.',
        steps: [
          [['They give the small intestine a huge surface area, and microvilli on their cells increase it even more.'], ['The small intestine is a very important organ.', 'f'], ['The large intestine absorbs water.', 'o']],
          [['Their wall is one cell thick, with a rich capillary network for glucose and amino acids and a lacteal for fats.'], ['They have lots of blood and other things in them.', 'v'], ['Fats go into the blood capillaries and glucose goes into the lacteal.', 'w', 'The other way round: glucose and amino acids go into the blood capillaries; fatty acids and glycerol go into the lacteal.']]
        ] },
      { id: 'stomach', cue: 'Protein in the stomach', statement: 'Protein digestion begins in the stomach.',
        steps: [
          [['Pepsin, a protease made by the stomach wall, breaks proteins down into peptides.'], ['Proteins are needed for growth and repair.', 'o'], ['The stomach is a really important part of digestion.', 'f']],
          [['Hydrochloric acid keeps the pH at about 2, the optimum for pepsin, and kills bacteria in the food.'], ['The conditions in the stomach suit it.', 'v'], ['The stomach is alkaline, about pH 8, which suits pepsin.', 'w', 'The stomach is acidic, about pH 2. It is the duodenum that is slightly alkaline.']]
        ] },
      { id: 'peristalsis', cue: 'Peristalsis', statement: 'Food is moved along the gut by peristalsis.',
        steps: [
          [['Waves of muscle contraction in the gut wall squeeze the food along.'], ['Peristalsis is a very important process.', 'f'], ['Villi absorb the products of digestion.', 'o']],
          [['The circular muscle contracts behind the food and relaxes in front of it, and fibre gives the muscles something to push against.'], ['The muscles do something to the food.', 'v'], ['Gravity pulls the food down through the gut.', 'w', 'It is muscle contraction, not gravity: you can swallow standing on your head.']]
        ] },
      { id: 'liver', cue: 'The hepatic portal vein', statement: 'Digested food is carried to the liver in the hepatic portal vein.',
        steps: [
          [['It takes blood rich in glucose and amino acids from the capillaries of the villi straight to the liver.'], ['Blood carries lots of things around the body.', 'f'], ['The kidneys filter urea out of the blood.', 'o']],
          [['The liver stores spare glucose as glycogen and deaminates spare amino acids, which forms urea.'], ['The liver deals with them somehow.', 'v'], ['The liver stores spare glucose as starch.', 'w', 'Starch is the store in plants. Humans store glucose as glycogen, in the liver and muscles.']]
        ] },
      { id: 'pancreas', cue: 'Pancreatic juice', statement: 'The pancreas makes pancreatic juice for digestion.',
        steps: [
          [['The pancreatic duct carries the juice into the duodenum, where its enzymes digest food.'], ['The pancreas is a gland in the body.', 'f'], ['The gall bladder stores bile.', 'o']],
          [['It contains amylase (starch to maltose), a protease (protein to peptides) and lipase (fat to fatty acids and glycerol).'], ['It has a few different enzymes in it.', 'v'], ['Pancreatic juice is acidic, like gastric juice.', 'w', 'It is alkaline (it contains sodium hydrogencarbonate), which helps neutralise the acid from the stomach.']]
        ] }
    ]
  },

  // Build it: after building and labelling, questions on the diagram. tap = structures (anchor names) that are right.
  build: {
    digestive: [
      { q: 'Tap where bile is made.', tap: ['liver'] },
      { q: 'Tap where bile is stored.', tap: ['gallBladder'] },
      { q: 'Tap where protein digestion begins.', tap: ['stomach'] },
      { q: 'Tap where most digested food is absorbed.', tap: ['ileum'] },
      { q: 'Tap where most water is absorbed.', tap: ['colon'] },
      { q: 'Tap the gland that makes lipase for the duodenum.', tap: ['pancreas'] },
      { q: 'Tap where faeces are stored before egestion.', tap: ['rectum'] },
      { q: 'How is food moved down the oesophagus?', opts: ['By peristalsis: waves of muscle contraction', 'By gravity only', 'By cilia sweeping it', 'By bile pushing it'], a: 0 }
    ],
    duodenum: [
      { q: 'Tap where bile is made.', tap: ['liver'] },
      { q: 'Tap where bile is stored.', tap: ['gallBladder'] },
      { q: 'Tap the tube that carries bile into the duodenum.', tap: ['bileDuct'] },
      { q: 'Tap the gland that makes both digestive enzymes and the hormone insulin.', tap: ['pancreas'] },
      { q: 'Tap the first part of the small intestine.', tap: ['duodenum'] },
      { q: 'Tap where the pH is about 2.', tap: ['stomach', 'ulcer', 'pylorus'] },
      { q: 'What is the pH in the duodenum?', opts: ['About 8: slightly alkaline', 'About 2: very acidic', 'About 5: slightly acidic', 'About 12: very alkaline'], a: 0 }
    ],
    villus: [
      { q: 'Tap where fats are absorbed.', tap: ['lacteal'] },
      { q: 'Tap the vessels that absorb glucose and amino acids.', tap: ['capillaries', 'arteriole', 'venule'] },
      { q: 'Tap the tiny folds that increase the surface area even more.', tap: ['microvilli'] },
      { q: 'Tap the lining that is only one cell thick.', tap: ['epithelium'] },
      { q: 'Tap the muscles that cause peristalsis.', tap: ['muscle'] },
      { q: 'Where in the gut are villi found?', opts: ['The small intestine (ileum)', 'The stomach', 'The large intestine', 'The oesophagus'], a: 0 },
      { q: 'How do glucose and amino acids pass into the villus?', opts: ['By diffusion and active transport', 'By osmosis only', 'By peristalsis', 'By emulsification'], a: 0 }
    ],
    liver: [
      { q: 'Tap the vessel carrying blood richest in digested food.', tap: ['portal'] },
      { q: 'Tap the vessel bringing oxygenated blood to the liver.', tap: ['hepaticArtery'] },
      { q: 'Tap the vessel taking blood away from the liver.', tap: ['hepaticVein'] },
      { q: 'Tap the vein with capillaries at both ends.', tap: ['portal'] },
      { q: 'Tap where spare glucose is stored as glycogen.', tap: ['liver'] },
      { q: 'What does the liver make from spare amino acids?', opts: ['Urea, by deamination', 'Glycogen', 'Bile pigments only', 'Insulin'], a: 0 }
    ],
    teeth: [
      { q: 'Tap a tooth that cuts food.', tap: ['incisors', 'incisorsL'] },
      { q: 'Tap a tooth that tears food.', tap: ['canine', 'canineL'] },
      { q: 'Tap a tooth with two cusps that grinds food.', tap: ['premolars', 'premolarsL'] },
      { q: 'Tap one of the biggest grinding teeth at the back.', tap: ['molars', 'molarsL'] },
      { q: 'What is the adult human dental formula?', opts: ['I 2/2, C 1/1, PM 2/2, M 3/3', 'I 3/3, C 1/1, PM 4/4, M 2/2', 'I 2/2, C 0/0, PM 3/3, M 3/3', 'I 1/1, C 1/1, PM 2/2, M 4/4'], a: 0 },
      { q: 'A meat-eating mammal\'s teeth differ from ours mainly because it has...', opts: ['Long, pointed canines for gripping and tearing', 'No canines at all', 'Flat molars for grinding grass', 'No incisors'], a: 0 }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Ingestion', 'Ingestion is the taking in of food.'],
        ['Digestion', 'Digestion is the breakdown of food into small soluble molecules.'],
        ['Absorption', 'Absorption is the passage of digested food into the blood or lymph.'],
        ['Egestion', 'Egestion is the removal of undigested food (faeces) from the body.'],
        ['Peristalsis', 'Peristalsis is waves of muscle contraction that push food along the gut.'],
        ['Emulsification', 'Emulsification is the breaking of large fat droplets into tiny droplets.']
      ] },
    { type: 'table', name: 'Enzymes: where they are made and where they work', what: 'Fill the table from memory.',
      cols: ['Made in', 'Works in'], choices: ['Salivary glands', 'Mouth', 'Stomach', 'Pancreas', 'Duodenum'],
      rows: [['Salivary amylase', ['Salivary glands', 'Mouth']], ['Pepsin', ['Stomach', 'Stomach']], ['Pancreatic amylase', ['Pancreas', 'Duodenum']], ['Lipase', ['Pancreas', 'Duodenum']], ['Pancreatic protease', ['Pancreas', 'Duodenum']]],
      why: 'Saliva\'s amylase works in the mouth. Pepsin is made by the stomach wall and works there. The pancreas makes amylase, protease and lipase, and its duct carries them into the duodenum.' },
    { type: 'table', name: 'Enzymes: what goes in, what comes out', what: 'Fill in each enzyme\'s substrate and product.',
      cols: ['Substrate', 'Product'], choices: ['Starch', 'Protein', 'Fat', 'Maltose', 'Peptides', 'Fatty acids and glycerol'],
      rows: [['Amylase', ['Starch', 'Maltose']], ['Pepsin (a protease)', ['Protein', 'Peptides']], ['Lipase', ['Fat', 'Fatty acids and glycerol']]],
      why: 'Amylase: starch to maltose. Protease (pepsin): protein to peptides, then amino acids. Lipase: fat to fatty acids and glycerol.' },
    { type: 'sort', name: 'Acid or alkaline?', what: 'Quick: is it about pH 2, about pH 7, or about pH 8?',
      bins: ['About pH 2 (acid)', 'About pH 7 (neutral)', 'About pH 8 (alkaline)'],
      items: [['The stomach', 0], ['Pepsin works best', 0], ['Gastric juice', 0], ['The mouth', 1], ['Salivary amylase works best', 1], ['Saliva', 1], ['The duodenum', 2], ['Lipase works best', 2], ['Pancreatic juice', 2], ['Bile', 2]],
      why: 'The stomach\'s hydrochloric acid gives about pH 2. Saliva is neutral. Bile and pancreatic juice are alkaline: they neutralise the stomach acid, so the duodenum is about pH 8.' },
    { type: 'sort', name: 'Where does it happen?', what: 'Send each one to the part of the gut where it happens.',
      bins: ['Mouth', 'Stomach', 'Small intestine', 'Large intestine'],
      items: [['Teeth chew the food', 0], ['Amylase starts digesting starch', 0], ['Food is churned with acid', 1], ['Pepsin digests protein', 1], ['Bile emulsifies fat', 2], ['Lipase digests fat', 2], ['Villi absorb digested food', 2], ['Most water is absorbed', 3], ['Bacteria make vitamins B and K', 3], ['Faeces are formed', 3]],
      why: 'Mouth: chewing and amylase. Stomach: churning, acid and pepsin. Small intestine: bile, the pancreatic enzymes and absorption through the villi. Large intestine: water absorbed, bacteria make vitamins, faeces formed.' },
    { type: 'sort', name: 'Into the blood or the lacteal?', what: 'Which way does each product go into a villus?',
      bins: ['Blood capillary', 'Lacteal'],
      items: [['Glucose', 0], ['Amino acids', 0], ['Water', 0], ['Salts (minerals)', 0], ['Vitamin C', 0], ['Fatty acids', 1], ['Glycerol', 1], ['Vitamins A and D', 1]],
      why: 'Glucose, amino acids, water, minerals and water-soluble vitamins go into the blood capillaries. Fatty acids, glycerol and the fat-soluble vitamins (A, D, E, K) go into the lacteal.' },
    { type: 'sort', name: 'Is it the liver\'s job?', what: 'The liver does many jobs. Which ones are the liver\'s?',
      bins: ['The liver does it', 'Something else does it'],
      items: [['Makes bile', 0], ['Stores glycogen', 0], ['Deamination: forms urea', 0], ['Breaks down poisons such as alcohol', 0], ['Stores vitamins A, D and B12, and iron', 0], ['Makes plasma proteins', 0], ['Produces heat', 0], ['Stores bile', 1], ['Makes lipase', 1], ['Filters urea out of the blood', 1], ['Makes insulin', 1]],
      why: 'The liver makes bile, stores glycogen, vitamins and iron, deaminates amino acids (forming urea), detoxifies poisons, makes plasma proteins and produces heat. The gall bladder stores bile, the pancreas makes lipase and insulin, and the kidneys filter urea out.' },
    { type: 'table', name: 'The dental formula', what: 'How many of each tooth on one side of each jaw?',
      cols: ['Upper jaw (one side)', 'Lower jaw (one side)'], choices: ['1', '2', '3'],
      rows: [['Incisors', ['2', '2']], ['Canines', ['1', '1']], ['Premolars', ['2', '2']], ['Molars', ['3', '3']]],
      why: 'I 2/2, C 1/1, PM 2/2, M 3/3: 8 teeth on each side of each jaw, 32 in all. Incisors cut, canines tear, premolars and molars grind.' }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one point per line (bio/bio-examiner.js).
  // ok lines earn a scheme point; the others earn nothing new, and carry why and a fix that would earn one.
  examiner: [
    { q: '2018-Q15b', part: 0, student: 'Aoife', lines: [
      { t: 'Bile salts emulsify fats, breaking them into tiny droplets.', ok: true },
      { t: 'They help with digestion in the body.', why: 'Vague: help how? Say what they do to fat or to the acid.', fix: 'They provide the optimum pH for the enzymes in the duodenum.' },
      { t: 'Sodium hydrogencarbonate neutralises the acid that comes from the stomach.', ok: true },
      { t: 'Bile salts are enzymes that digest fat into fatty acids and glycerol.', why: 'Wrong: bile salts are not enzymes. They only emulsify fat; lipase digests it.', fix: 'Being alkaline, they provide the optimum pH for the enzymes in the duodenum.' },
      { t: 'They break the fat up into small droplets, which is emulsification.', why: 'Repeat of line 1: no new marks.', fix: 'They provide the optimum pH (about 8) for the enzymes in the small intestine.' }
    ] },
    { q: '2017-Q14c', part: 0, student: 'Ciarán', lines: [
      { t: 'The wall of the villus is only one cell thick.', ok: true },
      { t: 'It is very good at absorbing.', why: 'Vague: say which feature makes it good at absorbing.', fix: 'Villi and their microvilli give a large surface area.' },
      { t: 'It has a rich blood supply to carry away the glucose.', ok: true },
      { t: 'It has a thick muscular wall to push the food in.', why: 'Wrong: the wall of a villus is thin, one cell thick, so food passes in easily. The muscle layers are in the gut wall below.', fix: 'It has a lacteal to absorb the fats.' },
      { t: 'Its lining is just one cell thick.', why: 'Repeat of line 1: no new marks.', fix: 'Microvilli on its cells give a large surface area.' }
    ] },
    { q: '2010-Q15b', part: 6, student: 'Aoife', lines: [
      { t: 'The liver stores glycogen and vitamins such as vitamins A and D.', ok: true },
      { t: 'It cleans the blood.', why: 'Vague: cleans it how? Name the process.', fix: 'It breaks down poisons such as alcohol: detoxification.' },
      { t: 'It makes insulin to control the blood sugar.', why: 'Wrong: insulin is made by the pancreas, not the liver.', fix: 'It generates heat, which keeps the body warm.' },
      { t: 'It breaks down spare amino acids by deamination, making urea.', ok: true },
      { t: 'It stores glycogen.', why: 'Repeat of line 1: no new marks.', fix: 'It produces plasma proteins such as fibrinogen.' }
    ] },
    { q: '2015-Q11c', part: 4, student: 'Ciarán', lines: [
      { t: 'They produce vitamins such as vitamin K and some B vitamins.', ok: true },
      { t: 'They are good bacteria.', why: 'Vague: good how? Give something they do for us.', fix: 'They help in the digestion of food we cannot digest ourselves.' },
      { t: 'They make hydrochloric acid to kill germs in the stomach.', why: 'Wrong: the stomach lining makes the acid, not bacteria.', fix: 'They benefit the immune system.' },
      { t: 'They compete with harmful micro-organisms, so pathogens cannot grow.', ok: true },
      { t: 'They make vitamins for us.', why: 'Repeat of line 1: no new marks.', fix: 'They help digestion by breaking down some of the food.' }
    ] },
    { q: '2024-Q17a', part: 3, student: 'Aoife', lines: [
      { t: 'Amylase breaks starch down into maltose.', ok: true },
      { t: 'Protease turns protein into glucose.', why: 'Wrong: glucose comes from carbohydrates. Protein is broken down into amino acids.', fix: 'Protease breaks protein down into amino acids.' },
      { t: 'Lipase digests fats into fatty acids and glycerol.', ok: true },
      { t: 'Protease makes smaller molecules.', why: 'Vague: name the product.', fix: 'Protease breaks proteins into peptides.' }
    ] },
    { q: '2010-Q15c', part: 0, student: 'Ciarán', lines: [
      { t: 'Wholegrain cereal adds fibre to the diet.', ok: true },
      { t: 'It is healthy for you.', why: 'Vague: healthy how? Say what fibre does in the gut.', fix: 'Fibre encourages peristalsis.' },
      { t: 'Fibre absorbs water, which makes the faeces softer.', ok: true },
      { t: 'Fibre is digested into glucose for energy.', why: 'Wrong: we cannot digest fibre (cellulose). That is why it adds bulk.', fix: 'It gives a faster digestive transit, so food moves through more quickly.' },
      { t: 'It puts more fibre in your diet.', why: 'Repeat of line 1: no new marks.', fix: 'The fibre encourages peristalsis, so the faeces keep moving.' }
    ] },
    { q: '2019-Q15b', part: 1, student: 'Aoife', lines: [
      { t: 'Digestion makes food soluble.', ok: true },
      { t: 'So that the body can use the food.', why: 'Vague: use it how? Say what digestion does to the molecules.', fix: 'Small soluble molecules are easier to transport in the blood.' },
      { t: 'Small molecules are easier to absorb into the blood.', ok: true },
      { t: 'Digestion makes food molecules bigger so they last longer.', why: 'Wrong: digestion breaks large molecules into small ones.', fix: 'Digested food is easier to transport around the body.' }
    ] }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P30-1', src: 'Practice question (not from a real paper)', stem: 'Ingestion, digestion, absorption and egestion.', parts: [
      { l: '(a)', q: 'Explain the term ingestion.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Taking in food (eating)', m: 3, k: [{ w: ['taking', 'food'], n: 2 }, { w: ['take', 'food'], n: 2 }, { w: ['eating', 'food'], n: 2 }, { w: ['eat', 'food'], n: 2 }, { w: ['intake', 'food'], n: 2 }] }] },
      { l: '(b)', q: 'Explain the term absorption.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Digested food passing into the blood (or lymph)', m: 3, k: [{ w: ['food', 'blood'], n: 2 }, { w: ['food', 'lymph'], n: 2 }, { w: ['nutrient', 'blood'], n: 2 }, { w: ['molecul', 'blood'], n: 2 }, { w: ['product', 'blood'], n: 2 }] }] },
      { l: '(c)', q: 'What is egestion, and through which part of the body does it happen?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Removal of undigested food (faeces) from the body', m: 3, k: [{ w: ['undigest'], n: 1 }, { w: ['faeces', 'remov'], n: 2 }, { w: ['faeces', 'leav'], n: 2 }] },
        { a: 'Through the anus', m: 3, k: [{ w: ['anus'], n: 1 }] }] }
    ] },
    { id: 'P30-2', src: 'Practice question (not from a real paper)', stem: 'Teeth and mechanical digestion.', parts: [
      { l: '(a)', q: 'Give the job of each of these types of teeth.', m: 9, n: 3, kind: 'fields', pts: [
        { a: 'Cut (bite) food', m: 3, f: 'Incisors', k: [{ w: ['cut'], n: 1 }, { w: ['cutt'], n: 1 }, { w: ['bite'], n: 1 }, { w: ['biting'], n: 1 }, { w: ['snip'], n: 1 }] },
        { a: 'Tear food', m: 3, f: 'Canines', k: [{ w: ['tear'], n: 1 }, { w: ['rip'], n: 1 }, { w: ['ripp'], n: 1 }, { w: ['grip'], n: 1 }, { w: ['pierc'], n: 1 }] },
        { a: 'Grind (crush) food', m: 3, f: 'Molars', k: [{ w: ['grind'], n: 1 }, { w: ['crush'], n: 1 }, { w: ['chew'], n: 1 }, { w: ['mash'], n: 1 }] }] },
      { l: '(b)', q: 'Is chewing mechanical or chemical digestion? Explain your answer.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Mechanical', m: 3, k: [{ w: ['mechanic'], n: 1 }, { w: ['physic'], n: 1 }] },
        { a: 'It breaks food into smaller pieces without changing the molecules (no enzymes)', m: 3, k: [{ w: ['small', 'piec'], n: 2 }, { w: ['small', 'bit'], n: 2 }, { w: ['surfac', 'area'], n: 2 }, { w: ['without', 'enzym'], n: 2 }, { w: ['no', 'enzym'], n: 2 }] }] }
    ] },
    { id: 'P30-3', src: 'Practice question (not from a real paper)', stem: 'The stomach.', parts: [
      { l: '(a)', q: 'Describe how the stomach breaks food down mechanically.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Its muscular walls contract: churning', m: 3, k: [{ w: ['churn'], n: 1 }, { w: ['muscl', 'contract'], n: 2 }, { w: ['muscular', 'wall'], n: 2 }, { w: ['squeez'], n: 1 }] },
        { a: 'mixing the food with gastric juice into a liquid (chyme)', m: 3, k: [{ w: ['chyme'], n: 1 }, { w: ['liquid'], n: 1 }, { w: ['mix', 'juice'], n: 2 }, { w: ['mixing', 'juice'], n: 2 }, { w: ['mixed', 'juice'], n: 2 }, { w: ['mix', 'acid'], n: 2 }, { w: ['mixing', 'acid'], n: 2 }] }] },
      { l: '(b)', q: 'Give two functions of the hydrochloric acid in the stomach.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Kills bacteria (micro-organisms) in the food', m: 3, k: [{ w: ['kill', 'bacteri'], n: 2 }, { w: ['kill', 'germ'], n: 2 }, { w: ['kill', 'microb'], n: 2 }, { w: ['kill', 'micro'], n: 2 }, { w: ['kill', 'pathogen'], n: 2 }] },
        { a: 'Gives the low pH (about 2) that pepsin needs', m: 3, k: [{ w: ['ph', 'pepsin'], n: 2 }, { w: ['optimum', 'ph'], n: 2 }, { w: ['activ', 'pepsin'], n: 2 }, { w: ['low', 'ph'], n: 2 }] }] }
    ] },
    { id: 'P30-4', src: 'Practice question (not from a real paper)', stem: 'The digestion of carbohydrates, proteins and fats from the mouth to the small intestine.', parts: [
      { l: '(a)', q: 'Starch: name the enzyme that digests it, where that enzyme is made, and the product.', m: 9, n: 3, kind: 'fields', pts: [
        { a: 'Amylase', m: 3, f: 'Enzyme', k: [{ w: ['amylase'], n: 1 }] },
        { a: 'Salivary glands (or pancreas)', m: 3, f: 'Made in', k: [{ w: ['saliva'], n: 1 }, { w: ['pancrea'], n: 1 }] },
        { a: 'Maltose', m: 3, f: 'Product', k: [{ w: ['maltose'], n: 1 }] }] },
      { l: '(b)', q: 'Protein: name the enzyme that starts digesting it, where that enzyme is made, and the product.', m: 9, n: 3, kind: 'fields', pts: [
        { a: 'Pepsin (a protease)', m: 3, f: 'Enzyme', k: [{ w: ['pepsin'], n: 1 }, { w: ['protease'], n: 1 }] },
        { a: 'Stomach (wall)', m: 3, f: 'Made in', k: [{ w: ['stomach'], n: 1 }, { w: ['gastric'], n: 1 }] },
        { a: 'Peptides (then amino acids)', m: 3, f: 'Product', k: [{ w: ['peptide'], n: 1 }, { w: ['amino'], n: 1 }] }] },
      { l: '(c)', q: 'Fat: name the enzyme that digests it, where that enzyme is made, and the products.', m: 9, n: 3, kind: 'fields', pts: [
        { a: 'Lipase', m: 3, f: 'Enzyme', k: [{ w: ['lipase'], n: 1 }] },
        { a: 'Pancreas', m: 3, f: 'Made in', k: [{ w: ['pancrea'], n: 1 }] },
        { a: 'Fatty acids and glycerol', m: 3, f: 'Product', k: [{ w: ['fatty', 'glycerol'], n: 2 }] }] },
      { l: '(d)', q: 'Give the pH where pepsin works and where lipase works.', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'About 2', m: 3, f: 'Pepsin', k: [{ w: ['2'], n: 1 }, { w: ['1'], n: 1 }] },
        { a: 'About 8 (7 to 9)', m: 3, f: 'Lipase', k: [{ w: ['8'], n: 1 }, { w: ['7'], n: 1 }, { w: ['9'], n: 1 }] }] }
    ] },
    { id: 'P30-5', src: 'Practice question (not from a real paper)', stem: 'Spare amino acids.', parts: [
      { l: '(a)', q: 'The body cannot store amino acids. Describe what happens to amino acids that the body does not need.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'They are broken down in the liver', m: 3, k: [{ w: ['liver'], n: 1 }] },
        { a: 'The amino (nitrogen) group is removed: deamination', m: 3, k: [{ w: ['deamin'], n: 1 }, { w: ['amino', 'group', 'remov'], n: 3 }, { w: ['nitrogen', 'remov'], n: 2 }] },
        { a: 'forming urea', m: 3, k: [{ w: ['urea'], n: 1 }] },
        { a: 'The rest of the molecule is used for energy (respiration)', m: 3, k: [{ w: ['energy'], n: 1 }, { w: ['respir'], n: 1 }] }] },
      { l: '(b)', q: 'Name the organ that removes urea from the blood.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Kidney', m: 3, k: [{ w: ['kidney'], n: 1 }] }] }
    ] },
    { id: 'P30-6', src: 'Practice question (not from a real paper)', stem: 'What happens to glucose after it is absorbed.', parts: [
      { l: '(a)', q: 'Trace the path of a glucose molecule from the ileum to the liver, and say what happens to it there if the body does not need it yet.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'Absorbed into the blood capillaries of the villi', m: 3, k: [{ w: ['capillar'], n: 1 }, { w: ['villi'], n: 1 }, { w: ['villus'], n: 1 }] },
        { a: 'Carried in the hepatic portal vein to the liver', m: 3, k: [{ w: ['portal'], n: 1 }] },
        { a: 'Stored as glycogen', m: 3, k: [{ w: ['glycogen'], n: 1 }] }] },
      { l: '(b)', q: 'Why is it useful for the liver to store glucose?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'To keep the blood glucose level constant: it is released when needed', m: 3, k: [{ w: ['constant'], n: 1 }, { w: ['steady'], n: 1 }, { w: ['level', 'blood'], n: 2 }, { w: ['release', 'need'], n: 2 }, { w: ['later'], n: 1 }] }] }
    ] },
    { id: 'P30-7', src: 'Practice question (not from a real paper)', stem: 'The large intestine.', parts: [
      { l: '(a)', q: 'Describe how faeces are formed in the large intestine.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Water is absorbed (in the colon)', m: 3, k: [{ w: ['water', 'absorb'], n: 2 }, { w: ['water', 'reabsorb'], n: 2 }] },
        { a: 'leaving undigested material (fibre), dead cells and bacteria', m: 3, k: [{ w: ['undigest'], n: 1 }, { w: ['fibre'], n: 1 }, { w: ['bacteri'], n: 1 }, { w: ['dead', 'cell'], n: 2 }] }] },
      { l: '(b)', q: 'Where are faeces stored, and how do they leave the body?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Stored in the rectum', m: 3, k: [{ w: ['rectum'], n: 1 }] },
        { a: 'They leave through the anus (egestion)', m: 3, k: [{ w: ['anus'], n: 1 }, { w: ['eges'], n: 1 }] }] }
    ] },
    { id: 'P30-8', src: 'Practice question (not from a real paper)', stem: 'A balanced diet.', parts: [
      { l: '(a)', q: 'What is meant by a balanced diet?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The correct amounts of each type of food (for health)', m: 3, k: [{ w: ['correct', 'amount'], n: 2 }, { w: ['right', 'amount'], n: 2 }, { w: ['each', 'food'], n: 2 }, { w: ['all', 'food', 'group'], n: 3 }, { w: ['all', 'nutrient'], n: 2 }] }] },
      { l: '(b)', q: 'Explain why a teenage athlete needs a different diet from an elderly person.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'More energy (carbohydrate) because they are more active', m: 3, k: [{ w: ['more', 'energy'], n: 2 }, { w: ['activ'], n: 1 }] },
        { a: 'More protein for growth (and repair of muscle)', m: 3, k: [{ w: ['protein', 'growth'], n: 2 }, { w: ['protein', 'grow'], n: 2 }, { w: ['protein', 'muscle'], n: 2 }, { w: ['protein', 'repair'], n: 2 }] },
        { a: 'More calcium for growing bones', m: 3, k: [{ w: ['calcium'], n: 1 }] }] },
      { l: '(c)', q: 'Why are fibre and enough water important in the diet?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Fibre adds bulk so peristalsis can push food along (no constipation)', m: 3, k: [{ w: ['peristalsis'], n: 1 }, { w: ['bulk'], n: 1 }, { w: ['constip'], n: 1 }] },
        { a: 'Water is needed for reactions and transport, and to replace water lost in urine and sweat', m: 3, k: [{ w: ['water', 'reac'], n: 2 }, { w: ['water', 'transport'], n: 2 }, { w: ['water', 'lost'], n: 2 }, { w: ['water', 'replac'], n: 2 }, { w: ['dehydrat'], n: 1 }, { w: ['water', 'solvent'], n: 2 }] }] }
    ] },
    { id: 'P30-9', src: 'Practice question (not from a real paper)', stem: 'Diet and health.', parts: [
      { l: '(a)', q: 'Give two possible effects on health of a diet high in sugar and fat.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Obesity (weight gain)', m: 3, k: [{ w: ['obes'], n: 1 }, { w: ['weight'], n: 1 }, { w: ['overweight'], n: 1 }] },
        { a: 'Type 2 diabetes', m: 3, k: [{ w: ['diabet'], n: 1 }] },
        { a: 'Heart disease (fatty deposits in the arteries, high cholesterol)', m: 3, k: [{ w: ['heart'], n: 1 }, { w: ['cholesterol'], n: 1 }, { w: ['arter'], n: 1 }] },
        { a: 'Tooth decay', m: 3, k: [{ w: ['tooth', 'decay'], n: 2 }, { w: ['teeth', 'decay'], n: 2 }] }] },
      { l: '(b)', q: 'Give one effect of too much salt in the diet.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'High blood pressure', m: 3, k: [{ w: ['blood', 'pressure'], n: 2 }, { w: ['pressure'], n: 1 }] }] },
      { l: '(c)', q: 'A vegan eats no animal products. Name a nutrient a vegan must take care to get enough of, and a food that gives it.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Vitamin B12 (or iron, calcium or protein)', m: 3, k: [{ w: ['b12'], n: 1 }, { w: ['iron'], n: 1 }, { w: ['calcium'], n: 1 }, { w: ['protein'], n: 1 }] },
        { a: 'A plant source: fortified cereal, beans, lentils, nuts, tofu or green vegetables', m: 3, k: [{ w: ['bean'], n: 1 }, { w: ['lentil'], n: 1 }, { w: ['nut'], n: 1 }, { w: ['tofu'], n: 1 }, { w: ['fortifi'], n: 1 }, { w: ['spinach'], n: 1 }, { w: ['soya'], n: 1 }, { w: ['green'], n: 1 }, { w: ['cereal'], n: 1 }] }] }
    ] }
  ],
  // Quick games: match pairs (term, what it means), spot the mistake (the wrong words are in *stars*; fix is the right
  // words, opts are wrong ones to choose from), and which diagrams label sprint uses.
  match: [
    ['Salivary amylase', 'Breaks starch into maltose'],
    ['Pepsin', 'Breaks protein into peptides in the stomach'],
    ['Lipase', 'Breaks fat into fatty acids and glycerol'],
    ['Bile', 'Emulsifies fat into small droplets'],
    ['Gall bladder', 'Stores bile'],
    ['Pancreas', 'Sends its enzymes into the duodenum'],
    ['Villi', 'Give the ileum a huge surface area'],
    ['Lacteal', 'Absorbs fatty acids and glycerol'],
    ['Hepatic portal vein', 'Carries digested food to the liver'],
    ['Large intestine', 'Absorbs water'],
    ['Peristalsis', 'Waves of muscle that push food along'],
    ['Molars', 'Grind and crush food']
  ],
  spot: [
    { s: 'Salivary amylase breaks *protein* down into maltose.', fix: 'starch', opts: ['fat', 'glucose'],
      why: 'Amylase digests starch into maltose.' },
    { s: 'Bile is made in the *gall bladder*.', fix: 'liver', opts: ['pancreas', 'stomach'],
      why: 'The liver makes bile. The gall bladder only stores it.' },
    { s: 'Most digested food is absorbed in the *large intestine*.', fix: 'small intestine', opts: ['stomach', 'oesophagus'],
      why: 'The ileum, with its villi, absorbs most digested food. The large intestine mainly absorbs water.' },
    { s: 'Fatty acids and glycerol are absorbed into the *blood capillaries* of a villus.', fix: 'lacteal', opts: ['microvilli', 'muscle layers'],
      why: 'Fatty acids and glycerol go into the lacteal. Glucose and amino acids go into the blood capillaries.' },
    { s: 'The stomach is *alkaline*, at about pH 2.', fix: 'acidic', opts: ['neutral', 'basic'],
      why: 'pH 2 is strongly acidic: the stomach wall makes hydrochloric acid.' },
    { s: 'Digested food travels from the intestine to the liver in the *hepatic artery*.', fix: 'hepatic portal vein', opts: ['hepatic vein', 'vena cava'],
      why: 'The hepatic portal vein carries food-rich blood from the intestine to the liver. The hepatic vein takes blood from the liver to the vena cava.' },
    { s: 'Peristalsis is a wave of *enzymes* that pushes food along the gut.', fix: 'muscle contractions', opts: ['bile', 'saliva'],
      why: 'Peristalsis is waves of muscle contraction in the wall of the gut.' },
    { s: 'Bacteria in the large intestine make vitamin *C*.', fix: 'K', opts: ['A', 'D'],
      why: 'Gut bacteria make vitamin K and some B vitamins.' },
    { s: 'Molars are used to *cut* food.', fix: 'grind and crush', opts: ['tear', 'swallow'],
      why: 'Incisors cut, canines tear, and premolars and molars grind and crush.' },
    { s: 'Pepsin works in the *mouth*.', fix: 'stomach', opts: ['duodenum', 'large intestine'],
      why: 'Pepsin is made by the stomach wall and works in the acid there.' },
    { s: 'The pancreas sends its enzymes into the *stomach*.', fix: 'duodenum', opts: ['liver', 'large intestine'],
      why: 'The pancreatic duct carries amylase, protease and lipase into the duodenum.' }
  ],
  sprint: ['digestive', 'duodenum', 'villus', 'liver', 'teeth']
};

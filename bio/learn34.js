// Chapter 34, the endocrine system: what the games and memory drills use. Written to the new course's learning
// outcomes 2.4.1 (the hormonal system as a system for response), 2.4.5 (nervous and hormonal coordination compared,
// homeostasis and negative feedback), 2.4.10 (the major glands, where they are, their hormones and what they do) and
// 2.4.11 (hormonal manipulation in health, sport and agriculture). The deficiency and excess symptoms of a hormone are
// not on the new course, so nothing here teaches them. No action game, Build it or Label sprint: no drawn diagrams.
window.BioLearn = window.BioLearn || {};
window.BioLearn[34] = {
  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'Blood glucose after a meal', steps: ['Blood glucose rises after a meal', 'The pancreas detects the rise', 'Its islets of Langerhans secrete insulin into the blood', 'Insulin makes body cells take in glucose', 'The liver stores glucose as glycogen', 'Blood glucose falls back to normal, so less insulin is secreted'],
        why: '<b>Blood glucose</b> rises after a <b>meal</b>, and the <b>pancreas</b> detects the rise. Its <b>islets of Langerhans</b> secrete <b>insulin</b> into the blood. Insulin makes body <b>cells</b> take in glucose, and the <b>liver</b> stores glucose as <b>glycogen</b>. Blood glucose falls back to <b>normal</b>, so <b>less insulin</b> is secreted: negative feedback.' },
      { title: 'The thyroxine feedback loop', steps: ['The pituitary secretes TSH', 'TSH travels in the blood to the thyroid', 'The thyroid secretes thyroxine', 'Thyroxine raises the metabolic rate', 'A high level of thyroxine inhibits TSH secretion', 'Less TSH means less thyroxine is made'],
        why: 'The <b>pituitary</b> secretes <b>TSH</b>, and TSH travels in the <b>blood</b> to the <b>thyroid</b>. The thyroid secretes <b>thyroxine</b>, and thyroxine raises the <b>metabolic rate</b>. A <b>high level</b> of thyroxine <b>inhibits</b> TSH secretion, and less TSH means <b>less thyroxine</b> is made: <b>negative feedback</b> keeps the level steady.' },
      { title: 'When body temperature drops', steps: ['Body temperature drops below normal', 'Receptors in the skin and brain detect the change', 'The brain sends impulses along nerves to the muscles', 'The muscles shiver, generating heat', 'Thyroxine raises the metabolic rate, releasing more heat', 'Body temperature rises back to normal'],
        why: 'Body <b>temperature</b> drops below normal, and <b>receptors</b> in the <b>skin</b> and <b>brain</b> detect the change. The brain, the control centre, sends <b>impulses</b> along <b>nerves</b> to the <b>muscles</b>, and the muscles <b>shiver</b>, generating <b>heat</b>. <b>Thyroxine</b> raises the <b>metabolic rate</b>, releasing more heat, and body temperature rises back to <b>normal</b>.' },
      { title: 'Short of water: ADH', steps: ['The water content of the blood drops', 'The brain detects the change', 'The pituitary secretes ADH into the blood', 'ADH travels in the blood to the kidneys', 'The collecting ducts reabsorb more water', 'Less urine is made, and it is more concentrated'],
        why: 'The <b>water content</b> of the blood drops, and the <b>brain</b> detects the change. The <b>pituitary</b> secretes <b>ADH</b> into the blood. ADH travels in the blood to the <b>kidneys</b>, where the <b>collecting ducts</b> <b>reabsorb</b> more water. Less <b>urine</b> is made, and it is more <b>concentrated</b>.' },
      { title: 'Fight or flight', steps: ['The brain detects a threat', 'Nerves carry impulses to the adrenal glands', 'The adrenal glands secrete adrenaline into the blood', 'The heart rate and breathing rate increase', 'The liver releases glucose into the blood', 'The muscles get more oxygen and glucose for action'],
        why: 'The <b>brain</b> detects a <b>threat</b>, and <b>nerves</b> carry impulses to the <b>adrenal glands</b>. The adrenal glands secrete <b>adrenaline</b> into the blood. The <b>heart rate</b> and <b>breathing rate</b> increase, and the <b>liver</b> releases <b>glucose</b> into the blood, so the <b>muscles</b> get more <b>oxygen</b> and glucose for action: <b>fight or flight</b>.' }
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
      { id: 'endocrine', cue: 'Endocrine glands', statement: 'Endocrine glands are ductless glands that secrete hormones.',
        steps: [
          [['They secrete their hormones straight into the blood, which carries them to their target organs.'], ['Glands are found all over the body.', 'f'], ['The stomach makes hydrochloric acid.', 'o']],
          [['Exocrine glands, such as the salivary glands, release their products through ducts instead.'], ['Other glands work in a different way.', 'v'], ['Exocrine glands secrete hormones straight into the blood.', 'w', 'Exocrine glands empty through ducts. It is endocrine glands that secrete into the blood.']]
        ] },
      { id: 'insulin', cue: 'Insulin', statement: 'Insulin is a hormone secreted by the pancreas.',
        steps: [
          [['It is made by the islets of Langerhans and passes straight into the blood.'], ['The pancreas is a very important organ.', 'f'], ['Bile is made in the liver.', 'o']],
          [['It makes body cells take in glucose, and the liver store it as glycogen, so blood glucose falls.'], ['It changes the amount of sugar.', 'v'], ['Insulin raises blood glucose by breaking down glycogen.', 'w', 'Insulin lowers blood glucose. Glucagon is the hormone that raises it again.']]
        ] },
      { id: 'thyroxine', cue: 'Thyroxine', statement: 'The thyroid gland secretes thyroxine.',
        steps: [
          [['The thyroid is in the neck, wrapped around the front of the trachea.'], ['The thyroid is a gland in the body.', 'f'], ['The heart pumps blood around the body.', 'o']],
          [['Thyroxine controls the metabolic rate, and growth and development in the young.'], ['It controls how the body works.', 'v'], ['Thyroxine lowers the level of glucose in the blood.', 'w', 'That is insulin. Thyroxine controls the metabolic rate.']]
        ] },
      { id: 'adrenaline', cue: 'Adrenaline', statement: 'The adrenal glands secrete adrenaline when we face a threat.',
        steps: [
          [['An adrenal gland sits on top of each kidney.'], ['Adrenaline is a well-known hormone.', 'f'], ['The kidneys filter the blood.', 'o']],
          [['Adrenaline prepares the body for fight or flight: a faster heart rate, faster breathing and more glucose in the blood.'], ['It gets you ready.', 'v'], ['Adrenaline slows the heart so you stay calm.', 'w', 'Adrenaline speeds the heart up, so the muscles get more oxygen and glucose.']]
        ] },
      { id: 'pituitary', cue: 'The pituitary', statement: 'The pituitary gland is called the master gland.',
        steps: [
          [['It hangs from the base of the brain.'], ['It is a very small gland.', 'f'], ['The spinal cord runs down the back.', 'o']],
          [['Its hormones control other glands: TSH stimulates the thyroid, and FSH and LH act on the ovaries and testes.'], ['It makes lots of things happen.', 'v'], ['It secretes insulin to control the pancreas.', 'w', 'Insulin is made by the pancreas itself. The pituitary makes FSH, LH, TSH, ADH and oxytocin.']]
        ] },
      { id: 'slower', cue: 'Hormones and nerves', statement: 'Hormonal responses are slower than nervous responses.',
        steps: [
          [['Hormones are chemicals carried in the blood, while nerve impulses are electrical and travel along neurons.'], ['Hormones and nerves are both important.', 'f'], ['Neurons have a cell body and an axon.', 'o']],
          [['But hormonal effects last longer and can reach many target organs at once.'], ['They also act differently.', 'v'], ['Hormonal effects are shorter-lived than nervous ones.', 'w', 'Hormonal effects last longer. Nervous responses are fast but short-lived.']]
        ] },
      { id: 'feedback', cue: 'Feedback', statement: 'Thyroxine is controlled by negative feedback.',
        steps: [
          [['The pituitary secretes TSH, which stimulates the thyroid to secrete thyroxine.'], ['Feedback happens a lot in the body.', 'f'], ['Insulin is made by the pancreas.', 'o']],
          [['A high level of thyroxine inhibits TSH secretion, so less thyroxine is made and the level stays steady.'], ['Then things go back to how they were.', 'v'], ['A high level of thyroxine makes the pituitary secrete more TSH.', 'w', 'High thyroxine inhibits TSH. That switching-off is what makes it negative feedback.']]
        ] },
      { id: 'testosterone', cue: 'Testosterone', statement: 'The testes secrete testosterone.',
        steps: [
          [['It starts sperm production and the development of the male sex organs.'], ['It is a hormone found in males.', 'f'], ['Oestrogen is made in the ovaries.', 'o']],
          [['It causes, and keeps up for life, the male secondary sexual characteristics: facial hair, a deeper voice, more muscle.'], ['It changes the body.', 'v'], ['It causes ovulation every month.', 'w', 'Ovulation is caused by LH, in females. Testosterone works in males.']]
        ] }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Hormone', 'A hormone is a chemical messenger produced by an endocrine gland and carried in the blood to a target organ.'],
        ['Endocrine gland', 'An endocrine gland is a ductless gland that secretes hormones directly into the bloodstream.'],
        ['Exocrine gland', 'An exocrine gland secretes its products through a duct.'],
        ['Dual-function gland', 'A dual-function gland has both an endocrine and an exocrine function, like the pancreas.'],
        ['Feedback', 'Feedback is when the level of a hormone in the blood controls the production of another hormone or of itself.'],
        ['Homeostasis', 'Homeostasis is the maintenance of a constant internal environment.'],
        ['Negative feedback', 'Negative feedback is when a change causes a response that reverses it, bringing conditions back to normal.']
      ] },
    { type: 'sort', name: 'Which gland secretes it?', what: 'Quick: which gland does each hormone come from?',
      bins: ['Pituitary', 'Thyroid', 'Adrenals', 'Pancreas', 'Ovaries', 'Testes'],
      items: [['FSH', 0], ['LH', 0], ['TSH', 0], ['ADH', 0], ['Oxytocin', 0], ['Thyroxine', 1], ['Adrenaline', 2], ['Insulin', 3], ['Oestrogen', 4], ['Progesterone', 4], ['Testosterone', 5]],
      why: 'The pituitary makes FSH, LH, TSH, ADH and oxytocin. The thyroid makes thyroxine, the adrenals adrenaline, the pancreas insulin, the ovaries oestrogen and progesterone, and the testes testosterone.' },
    { type: 'table', name: 'Where each gland is', what: 'Fill the table from memory.',
      cols: ['Where it is'], choices: ['Base of the brain', 'In the neck', 'On the back of the thyroid', 'On top of each kidney', 'Behind the stomach', 'Either side of the uterus', 'In the scrotum'],
      rows: [['Pituitary', ['Base of the brain']], ['Thyroid', ['In the neck']], ['Parathyroids', ['On the back of the thyroid']], ['Adrenal glands', ['On top of each kidney']], ['Pancreas', ['Behind the stomach']], ['Ovaries', ['Either side of the uterus']], ['Testes', ['In the scrotum']]],
      why: 'Top to bottom: the pituitary hangs from the base of the brain; the thyroid is in the neck, with the parathyroids on its back; an adrenal gland sits on top of each kidney; the pancreas lies behind the stomach; the ovaries are either side of the uterus; the testes are in the scrotum.' },
    { type: 'sort', name: 'Endocrine or exocrine?', what: 'Straight into the blood, or down a duct?',
      bins: ['Endocrine', 'Exocrine'],
      items: [['Ductless', 0], ['Secretes into the blood', 0], ['Thyroid gland', 0], ['Pituitary gland', 0], ['Adrenal glands', 0], ['Pancreas: insulin', 0],
        ['Has a duct', 1], ['Salivary glands', 1], ['Sweat glands', 1], ['Tear glands', 1], ['Pancreas: digestive enzymes', 1]],
      why: 'Endocrine glands are ductless and secrete hormones into the blood. Exocrine glands empty through ducts. The pancreas is both: insulin into the blood, enzymes down its duct.' },
    { type: 'sort', name: 'Nervous or hormonal?', what: 'Which kind of response is it?',
      bins: ['Nervous', 'Hormonal'],
      items: [['Electrical impulses', 0], ['Very fast', 0], ['Short-lived', 0], ['Travels along neurons', 0], ['Acts on one precise effector', 0], ['Pulling your hand off a hot plate', 0],
        ['Chemical messengers', 1], ['Carried in the blood', 1], ['Slower', 1], ['Long-lasting', 1], ['Can reach many target organs', 1], ['Growing up at puberty', 1]],
      why: 'Nervous responses are electrical, fast, short-lived and precise. Hormonal responses are chemical, carried in the blood, slower and longer-lasting, and can reach many target organs.' },
    { type: 'sort', name: 'Hormones at work: health, sport or agriculture?', what: 'Where is the hormone being used?',
      bins: ['Health', 'Sport', 'Agriculture'],
      items: [['Insulin injections for diabetes', 0], ['The contraceptive pill', 0], ['HRT at the menopause', 0], ['Fertility treatment with FSH', 0], ['Thyroxine tablets', 0],
        ['Anabolic steroids to build muscle', 1], ['EPO for more red blood cells', 1], ['Testosterone doping', 1],
        ['Growth hormones for more meat', 2], ['Bringing a flock into breeding condition together', 2], ['Hormones for higher milk yields', 2]],
      why: 'In health, hormones replace what the body lacks or control fertility. In sport, steroids and EPO are banned cheating. On farms, hormones time breeding or boost meat and milk, though growth hormones are banned in the EU.' }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P34-1', src: 'Practice question (not from a real paper)', stem: 'The parathyroid glands are small endocrine glands.', parts: [
      { l: '(a)', q: 'Where in the body are the parathyroid glands?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'On the back of the thyroid gland, in the neck', m: 3, k: [{ w: ['thyroid'], n: 1 }, { w: ['neck'], n: 1 }] }] },
      { l: '(b)', q: 'Name the hormone they secrete and state its function.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Parathyroid hormone (PTH)', m: 3, k: [{ w: ['parathyroid', 'hormon'], n: 2 }, { w: ['pth'], n: 1 }, { w: ['parathormon'], n: 1 }] },
        { a: 'It raises the level of calcium in the blood', m: 3, k: [{ w: ['calcium', 'increas'], n: 2 }, { w: ['calcium', 'more'], n: 2 }, { w: ['calcium', 'high'], n: 2 }] }] },
      { l: '(c)', q: 'Explain why the parathyroid glands are described as endocrine glands.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'They are ductless and secrete their hormone into the blood', m: 3, k: [{ w: ['ductless'], n: 1 }, { w: ['no', 'duct'], n: 2 }, { w: ['secret', 'blood'], n: 2 }, { w: ['hormon', 'blood'], n: 2 }] }] }
    ] },
    { id: 'P34-2', src: 'Practice question (not from a real paper)', stem: 'The pituitary gland is sometimes called the master gland.', parts: [
      { l: '(a)', q: 'Where is the pituitary gland?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'At the base of the brain', m: 3, k: [{ w: ['brain'], n: 1 }, { w: ['skull'], n: 1 }, { w: ['head'], n: 1 }] }] },
      { l: '(b)', q: 'Describe the role of the pituitary hormone TSH.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'It stimulates the thyroid gland to secrete thyroxine', m: 3, k: [{ w: ['stimul', 'thyroid'], n: 2 }, { w: ['thyroid', 'secret'], n: 2 }, { w: ['thyroid', 'releas'], n: 2 }, { w: ['thyroxine', 'secret'], n: 2 }, { w: ['thyroxine', 'releas'], n: 2 }, { w: ['thyroxine', 'make'], n: 2 }] }] },
      { l: '(c)', q: 'Give two functions of the pituitary hormone oxytocin.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'It makes the uterus contract during birth', m: 3, k: [{ w: ['uterus', 'contract'], n: 2 }, { w: ['womb', 'contract'], n: 2 }, { w: ['labour'], n: 1 }, { w: ['birth'], n: 1 }] },
        { a: 'It makes the breasts release milk', m: 3, k: [{ w: ['milk'], n: 1 }] }] },
      { l: '(d)', q: 'Name a pituitary hormone that acts on the ovaries.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'FSH or LH', m: 3, k: [{ w: ['fsh'], n: 1 }, { w: ['lh'], n: 1 }, { w: ['follic', 'stimul'], n: 2 }, { w: ['luteini'], n: 1 }] }] }
    ] },
    { id: 'P34-3', src: 'Practice question (not from a real paper)', stem: 'Some athletes misuse hormones to improve their performance.', parts: [
      { l: '(a)', q: 'Name a hormone that endurance athletes, such as cyclists, have misused.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'EPO (erythropoietin)', m: 3, k: [{ w: ['epo'], n: 1 }, { w: ['erythropoietin'], n: 1 }] }] },
      { l: '(b)', q: 'Explain how this hormone improves an endurance athlete\'s performance.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'It increases the number of red blood cells', m: 3, k: [{ w: ['red', 'cell'], n: 2 }, { w: ['red', 'blood'], n: 2 }] },
        { a: 'So more oxygen is carried to the muscles for respiration', m: 3, k: [{ w: ['oxygen'], n: 1 }] }] },
      { l: '(c)', q: 'Anabolic steroids act like testosterone. Give one effect that helps an athlete and one harmful effect.', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'Helps: builds muscle and strength', f: 'Helps', m: 3, k: [{ w: ['muscl'], n: 1 }, { w: ['strength'], n: 1 }, { w: ['strong'], n: 1 }] },
        { a: 'Harm: liver damage, heart disease or infertility', f: 'Harm', m: 3, k: [{ w: ['liver'], n: 1 }, { w: ['heart'], n: 1 }, { w: ['infertil'], n: 1 }, { w: ['aggress'], n: 1 }, { w: ['blood', 'pressur'], n: 2 }] }] },
      { l: '(d)', q: 'Give one reason why using these hormones is banned in sport.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'It is cheating: it gives an unfair advantage, and it can damage health', m: 3, k: [{ w: ['unfair'], n: 1 }, { w: ['cheat'], n: 1 }, { w: ['advantag'], n: 1 }, { w: ['health'], n: 1 }, { w: ['harm'], n: 1 }, { w: ['damag'], n: 1 }, { w: ['danger'], n: 1 }] }] }
    ] },
    { id: 'P34-4', src: 'Practice question (not from a real paper)', stem: 'Hormones are also used in agriculture.', parts: [
      { l: '(a)', q: 'Give one way in which hormones are used in farming.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Growth hormones make livestock grow faster, giving more meat or milk', m: 3, k: [{ w: ['growth'], n: 1 }, { w: ['meat'], n: 1 }, { w: ['milk'], n: 1 }] },
        { a: 'Hormones make animals come into breeding condition at the same time', m: 3, k: [{ w: ['breed'], n: 1 }, { w: ['synchron'], n: 1 }, { w: ['heat'], n: 1 }] }] },
      { l: '(b)', q: 'Explain why a farmer might use hormones so that all the sheep in a flock breed at the same time.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The lambs are all born together, so they are easier to look after and sell', m: 3, k: [{ w: ['born', 'together'], n: 2 }, { w: ['lamb', 'together'], n: 2 }, { w: ['easier'], n: 1 }, { w: ['manag'], n: 1 }, { w: ['sold'], n: 1 }, { w: ['sell'], n: 1 }] }] },
      { l: '(c)', q: 'Growth hormones are banned for livestock in the EU. Give one concern about their use.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Hormone residues in the meat could affect the health of people who eat it', m: 3, k: [{ w: ['residu'], n: 1 }, { w: ['human', 'health'], n: 2 }, { w: ['people', 'health'], n: 2 }, { w: ['harm', 'people'], n: 2 }, { w: ['consumer'], n: 1 }] },
        { a: 'The welfare of the animals', m: 3, k: [{ w: ['welfar'], n: 1 }, { w: ['suffer'], n: 1 }] }] }
    ] },
    { id: 'P34-5', src: 'Practice question (not from a real paper)', stem: 'Blood glucose is kept steady by homeostasis.', parts: [
      { l: '(a)', q: 'What is meant by homeostasis?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Keeping a constant internal environment', m: 3, k: [{ w: ['constant'], n: 1 }, { w: ['steady'], n: 1 }, { w: ['stable'], n: 1 }] }] },
      { l: '(b)', q: 'After a meal, blood glucose rises. Describe how the body brings it back to normal.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'The pancreas detects the rise', m: 3, k: [{ w: ['pancrea', 'detect'], n: 2 }, { w: ['islet', 'detect'], n: 2 }] },
        { a: 'It secretes insulin into the blood', m: 3, k: [{ w: ['secret', 'insulin'], n: 2 }, { w: ['releas', 'insulin'], n: 2 }, { w: ['make', 'insulin'], n: 2 }] },
        { a: 'Insulin makes body cells take in glucose', m: 3, k: [{ w: ['take', 'glucose'], n: 2 }, { w: ['absorb', 'glucose'], n: 2 }, { w: ['uptake'], n: 1 }] },
        { a: 'The liver stores glucose as glycogen', m: 3, k: [{ w: ['glycogen'], n: 1 }] }] },
      { l: '(c)', q: 'Explain why this is an example of negative feedback.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The response reverses the change: as glucose falls back to normal, less insulin is secreted', m: 3, k: [{ w: ['revers'], n: 1 }, { w: ['back', 'normal'], n: 2 }, { w: ['less', 'insulin'], n: 2 }, { w: ['cancel'], n: 1 }] }] },
      { l: '(d)', q: 'In this example, name: 1. the organ that detects the change and responds, 2. an effector.', m: 6, n: 2, kind: 'fields', pts: [
        { a: '1. The pancreas (its islets of Langerhans)', f: '1', m: 3, k: [{ w: ['pancrea'], n: 1 }, { w: ['islet'], n: 1 }] },
        { a: '2. The liver (or muscle cells)', f: '2', m: 3, k: [{ w: ['liver'], n: 1 }, { w: ['muscl'], n: 1 }] }] }
    ] }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one point per line. The marker decides which
  // lines earn marks (in order: a line earns if it makes a scheme point the lines before haven't). Lines that earn
  // nothing carry why (shown after marking) and fix (a better line that earns a point the answer still lacks).
  examiner: [
    { q: '2004-Q12c', part: 0, student: 'Aoife', lines: [
      { t: 'Receptors in the brain detect that the body temperature has dropped.', ok: true },
      { t: 'The body tries to warm itself up.', why: 'Vague: how? Name the response that makes the heat.', fix: 'Thyroxine increases the metabolic rate, releasing more heat.' },
      { t: 'The muscles shiver, which generates heat.', ok: true },
      { t: 'Insulin is released to warm the blood.', why: 'Wrong: insulin lowers blood glucose. The hormone that raises the metabolic rate is thyroxine.', fix: 'Thyroxine increases the metabolic rate, releasing more heat.' }
    ] },
    { q: '2007-Q15b', part: 1, student: 'Ciarán', lines: [
      { t: 'Hormones are chemical messengers but nerves carry electrical impulses.', ok: true },
      { t: 'Hormones are different from nerves.', why: 'Vague: different how? Say what differs: the speed, how long it lasts, or how many targets.', fix: 'Hormone action is slower than nerve action.' },
      { t: 'Hormones act faster than nerves.', why: 'Wrong: hormones travel in the blood, so they act more slowly than nerves.', fix: 'Hormone action is slower than nerve action.' },
      { t: 'The effects of hormones last longer.', ok: true }
    ] },
    { q: '2018-Q14c', part: 2, student: 'Aoife', lines: [
      { t: 'The pituitary secretes TSH, which makes the thyroid produce thyroxine.', ok: true },
      { t: 'When the thyroxine level is high, it inhibits TSH production.', ok: true },
      { t: 'This is called a feedback loop.', why: 'Vague: say which kind of feedback it is.', fix: 'This is negative feedback, so the thyroxine level stays steady.' },
      { t: 'Thyroxine is broken down by enzymes in the stomach.', why: 'Wrong: hormones are carried in the blood, and the thyroxine level is controlled through TSH.', fix: 'This is negative feedback, so the thyroxine level stays steady.' }
    ] },
    { q: '2024-Q16b', part: 1, student: 'Ciarán', lines: [
      { t: 'The thyroid secretes thyroxine, which controls the metabolic rate.', ok: true },
      { t: 'The adrenal gland secretes adrenaline for fight or flight.', ok: true },
      { t: 'The ovaries are found either side of the uterus.', why: 'Not asked: the question wants a hormone and its function, not where the gland is.', fix: 'The ovaries secrete oestrogen, which causes the female secondary sexual characteristics.' },
      { t: 'The ovaries are important for having a baby.', why: 'Vague: name the hormone and say what it does.', fix: 'The ovaries secrete oestrogen, which causes the female secondary sexual characteristics.' }
    ] },
    { q: '2007-Q15a', part: 0, student: 'Aoife', lines: [
      { t: 'Testosterone causes sperm production.', ok: true },
      { t: 'It is the male hormone.', why: 'Vague: that names it, but doesn\'t give a function.', fix: 'It makes the male sex organs develop.' },
      { t: 'It makes the voice deeper and facial hair grow at puberty.', ok: true },
      { t: 'It makes eggs mature in the ovary.', why: 'Wrong: that is FSH, in females. Testosterone works in males.', fix: 'It makes the male sex organs develop.' }
    ] }
  ],

  // Quick games: match pairs (term, what it means) and spot the mistake (the wrong words are in *stars*; fix is the
  // right words, opts are wrong ones to choose from).
  match: [
    ['Pituitary', 'The master gland at the base of the brain'],
    ['Thyroxine', 'Controls the metabolic rate'],
    ['Adrenaline', 'Prepares the body for fight or flight'],
    ['Insulin', 'Lowers blood glucose'],
    ['ADH', 'Makes the kidneys reabsorb more water'],
    ['TSH', 'Stimulates the thyroid gland'],
    ['FSH', 'Starts an egg developing in the ovary'],
    ['Oxytocin', 'Makes the uterus contract at birth'],
    ['Parathyroid hormone', 'Raises the calcium level in the blood'],
    ['Testosterone', 'Starts sperm production in males'],
    ['Oestrogen', 'Gives female secondary sexual characteristics'],
    ['Endocrine gland', 'Ductless: secretes straight into the blood']
  ],
  spot: [
    { s: 'The *thyroid* gland, at the base of the brain, secretes FSH and LH.', fix: 'pituitary', opts: ['adrenal', 'parathyroid'],
      why: 'The pituitary hangs from the base of the brain and secretes FSH and LH. The thyroid is in the neck.' },
    { s: 'Insulin *raises* the level of glucose in the blood.', fix: 'lowers', opts: ['doubles', 'has no effect on'],
      why: 'Insulin lowers blood glucose by making cells take it in and the liver store it as glycogen.' },
    { s: 'Endocrine glands release their hormones *through ducts*.', fix: 'straight into the blood', opts: ['into the gut', 'onto the skin'],
      why: 'Endocrine glands are ductless: their hormones go straight into the blood. Exocrine glands use ducts.' },
    { s: 'The adrenal glands sit on top of the *lungs*.', fix: 'kidneys', opts: ['liver', 'heart'],
      why: 'An adrenal gland sits on top of each kidney.' },
    { s: 'Thyroxine controls the *level of blood glucose*.', fix: 'metabolic rate', opts: ['heart valves', 'water balance'],
      why: 'Thyroxine controls the metabolic rate. Insulin lowers blood glucose.' },
    { s: 'Hormones act more *quickly* than nerve impulses, but their effects last longer.', fix: 'slowly', opts: ['sharply', 'electrically'],
      why: 'Hormones travel in the blood, so they act more slowly than nerves, but their effects last longer.' },
    { s: 'ADH is secreted by the *thyroid* gland when the blood is short of water.', fix: 'pituitary', opts: ['salivary', 'parathyroid'],
      why: 'The pituitary secretes ADH, which makes the kidneys reabsorb more water.' },
    { s: 'A high level of thyroxine *stimulates* the secretion of TSH.', fix: 'inhibits', opts: ['doubles', 'speeds up'],
      why: 'High thyroxine inhibits TSH secretion, so less thyroxine is made: negative feedback.' },
    { s: 'Parathyroid hormone raises the level of *glucose* in the blood.', fix: 'calcium', opts: ['oxygen', 'urea'],
      why: 'Parathyroid hormone raises the calcium level in the blood.' },
    { s: 'Oestrogen is made in the *pituitary gland*.', fix: 'ovaries', opts: ['adrenal glands', 'pancreas'],
      why: 'Oestrogen is made in the ovaries, by the developing Graafian follicle.' },
    { s: 'Athletes misuse EPO because it makes more *white blood cells*, so more oxygen is carried.', fix: 'red blood cells', opts: ['platelets', 'antibodies'],
      why: 'EPO makes the body produce more red blood cells, so the blood carries more oxygen to the muscles.' },
    { s: 'The pancreas is a dual-function gland because it makes insulin and *bile*.', fix: 'digestive enzymes', opts: ['saliva', 'urea'],
      why: 'The pancreas secretes insulin into the blood and digestive enzymes down a duct. Bile is made by the liver.' }
  ]
};

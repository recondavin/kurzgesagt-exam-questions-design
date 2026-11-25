// Chapter 34, the endocrine system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2). Each
// concept: keys (words that mark a question as being about it), pic (null: this chapter has no drawn diagrams) and three
// bullets [bold, on screen, what the narrator says]. questions: concept for a question when its key words would pick
// the wrong one. parts: for every exam question, the concept each part needs (or null), chosen by reading each part and
// its marking scheme; a concept is taught on the first part that needs it. The deficiency and excess symptoms of a
// hormone are not on the new course, so no concept teaches them (those parts get null, or the hormone treatment).
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[34] = {
  concepts: [
    { id: 'hormone', title: 'What a hormone is', summary: 'A chemical message sent through the blood.',
      say: 'Your body has two ways of sending messages. Hormones are the slow, chemical one.',
      keys: ['what is a hormone', 'chemical messenger', 'messenger', 'chemical nature', 'nature of many hormones', 'target', 'plant growth regulator', 'growth regulators', 'enzymes', 'reach the target'],
      pic: null,
      bullets: [
        ['Chemical messenger', 'made by an endocrine gland.', 'A hormone is a chemical messenger. An endocrine gland makes it and releases it straight into the blood.'],
        ['Target organ', 'carried in the blood to where it acts.', 'The blood carries it all round the body, but only its target organ responds, like a letter only one house can open. Many hormones, like insulin, are proteins.'],
        ['Like plant regulators', 'made in one place, acting in another.', 'Plant growth regulators work the same way: made in one place, acting somewhere else, with an effect that lasts. And unlike an enzyme, which is a catalyst, a hormone is a messenger.']
      ] },
    { id: 'glands', title: 'Endocrine and exocrine glands', summary: 'With a duct, or straight into the blood.',
      say: 'Glands make things. The difference is how they deliver them.',
      keys: ['endocrine', 'exocrine', 'ductless', 'duct', 'dual', 'both endocrine', 'glands that secrete hormones', 'term is used'],
      pic: null,
      bullets: [
        ['Endocrine', 'ductless: straight into the blood.', 'Endocrine glands have no ducts. They secrete their hormones directly into the blood.'],
        ['Exocrine', 'empties through a duct.', 'Exocrine glands, like the salivary and sweat glands, send their products down a duct, a little tube, to where they are needed.'],
        ['Both at once', 'the pancreas does both.', 'Some glands do both. The pancreas sends insulin into the blood and digestive enzymes down a duct, so it is called a dual-function gland.']
      ] },
    { id: 'map', title: 'Where the glands are', summary: 'From the brain down to the pelvis.',
      say: 'Let\'s take a tour of the endocrine glands, from the top of your body down.',
      keys: ['location', 'located', 'where in the body', 'precise location', 'outline', 'draw in', 'x, y and z', 'table', 'hormone-producing gland', 'two named hormones'],
      pic: null,
      bullets: [
        ['Head and neck', 'pituitary, thyroid, parathyroids.', 'The pituitary hangs from the base of the brain. The thyroid sits in the neck, in front of the trachea, making thyroxine for the metabolic rate, and the tiny parathyroids sit on its back.'],
        ['Abdomen', 'adrenals and pancreas.', 'An adrenal gland sits on top of each kidney, making adrenaline for fight or flight. The pancreas lies behind the stomach; its islets of Langerhans make insulin, which lowers blood glucose.'],
        ['Sex organs', 'ovaries and testes.', 'The ovaries, either side of the uterus, make oestrogen and progesterone. The testes, in the scrotum, make testosterone.']
      ] },
    { id: 'pituitary', title: 'The pituitary: the master gland', summary: 'A pea-sized gland that runs the others.',
      say: 'Hanging under your brain is a gland the size of a pea, and it bosses the others around.',
      keys: ['pituitary', 'fsh', 'lh', 'tsh', 'adh', 'oxytocin', 'water content', 'anti-diuretic', 'master gland'],
      pic: null,
      bullets: [
        ['FSH and LH', 'control the ovaries and testes.', 'FSH and LH travel in the blood to the ovaries, where FSH starts an egg developing and LH triggers ovulation. In males they act on the testes.'],
        ['TSH', 'stimulates the thyroid.', 'TSH, thyroid stimulating hormone, tells the thyroid to make thyroxine. Its name is its job.'],
        ['ADH and oxytocin', 'saving water; birth and milk.', 'When the blood is short of water, the pituitary releases ADH, and the collecting ducts of the kidney reabsorb more water. Oxytocin makes the uterus contract at birth, and releases milk.']
      ] },
    { id: 'thyroid', title: 'The thyroid and parathyroids', summary: 'Setting the pace, and keeping calcium up.',
      say: 'In your neck there\'s a gland that sets how fast your whole body runs.',
      keys: ['thyroid', 'thyroxine', 'parathyroid', 'calcium', 'metabolism', 'metabolic'],
      pic: null,
      bullets: [
        ['The thyroid', 'in the neck, in front of the trachea.', 'The thyroid is a butterfly-shaped gland in the neck, wrapped around the front of the trachea.'],
        ['Thyroxine', 'controls the metabolic rate.', 'It secretes thyroxine, which controls the metabolic rate: how fast your cells respire and release energy. In children it also controls growth and development.'],
        ['Parathyroids', 'raise blood calcium.', 'Four tiny parathyroid glands sit on the back of the thyroid. Their hormone, parathyroid hormone, raises the level of calcium in the blood.']
      ] },
    { id: 'adrenal', title: 'Adrenaline: fight or flight', summary: 'The emergency hormone.',
      say: 'You get a fright, and within seconds your heart is pounding. That\'s adrenaline.',
      keys: ['adrenal', 'adrenaline', 'fight or flight', 'threat', 'emergency', 'stress'],
      pic: null,
      bullets: [
        ['Adrenal glands', 'on top of each kidney.', 'An adrenal gland sits like a cap on top of each kidney.'],
        ['Fight or flight', 'released when you face a threat.', 'When you face a threat, the adrenal glands secrete adrenaline into the blood, getting the body ready to fight or to run.'],
        ['Its effects', 'faster heart, faster breathing, more glucose.', 'The heart rate and breathing rate rise, the liver releases glucose into the blood, and the pupils widen, so the muscles get extra oxygen and fuel.']
      ] },
    { id: 'pancreas', title: 'The pancreas and insulin', summary: 'Bringing blood glucose back down.',
      say: 'Every time you eat, sugar floods into your blood. Something has to bring it back down.',
      keys: ['pancreas', 'insulin', 'islets', 'langerhans', 'glucose', 'blood sugar', 'endocrine portion', 'endocrine tissue', 'dual-function'],
      pic: null,
      bullets: [
        ['Islets of Langerhans', 'the endocrine tissue of the pancreas.', 'Scattered through the pancreas are little clusters of cells, the islets of Langerhans. They secrete insulin into the blood.'],
        ['Insulin', 'lowers blood glucose.', 'As soon as blood glucose starts to rise after a meal, insulin is secreted. It makes body cells, especially muscle and liver cells, take in glucose, and the liver stores it as glycogen.'],
        ['Two jobs', 'a hormone in, enzymes out.', 'The rest of the pancreas makes digestive enzymes that flow down a duct to the duodenum. A hormone into the blood, enzymes down a duct: that\'s why it\'s a dual-function gland.']
      ] },
    { id: 'sex', title: 'The sex hormones', summary: 'Testosterone, oestrogen and progesterone.',
      say: 'At puberty, two pairs of glands switch on and change the body.',
      keys: ['testosterone', 'oestrogen', 'progesterone', 'secondary sexual', 'sex characteristics', 'testis', 'testes', 'ovary', 'ovaries', 'puberty'],
      pic: null,
      bullets: [
        ['Testosterone', 'from the testes.', 'The testes, in the scrotum, secrete testosterone. It starts sperm production and the development of the male sex organs.'],
        ['Secondary sexual characteristics', 'kept up for life.', 'Testosterone causes, and keeps up for life, the male secondary sexual characteristics: facial and body hair, a deeper voice and more muscle.'],
        ['Oestrogen and progesterone', 'from the ovaries.', 'The ovaries make oestrogen, which gives the female secondary sexual characteristics, like breasts and wider hips, and repairs the uterus lining. Progesterone keeps the lining in place.']
      ] },
    { id: 'compare', title: 'Nerves and hormones compared', summary: 'A phone call versus a letter.',
      say: 'Nerves and hormones both carry messages, but in very different ways.',
      keys: ['nervous response', 'nerve action', 'nervous responses', 'slower than', 'differs from'],
      pic: null,
      bullets: [
        ['Nerves', 'electrical, fast, short-lived.', 'Nerve impulses are electrical. They race along neurons to one precise place, so a nervous response is fast but short-lived.'],
        ['Hormones', 'chemical, slower, long-lasting.', 'Hormones are chemicals carried in the blood, so they act more slowly, but their effects last longer and they can reach many target organs.'],
        ['Why slower?', 'the blood is slower than a wire.', 'A hormone has to travel round the body in the blood before it acts, while a nerve impulse is electrical and goes straight to its target.']
      ] },
    { id: 'feedback', title: 'Feedback', summary: 'One hormone\'s level controls another.',
      say: 'How does a gland know when to stop? It listens for feedback.',
      keys: ['feedback', 'inhibit', 'level of a hormone'],
      pic: null,
      bullets: [
        ['Feedback', 'a hormone\'s level controls production.', 'Feedback is when the level of a hormone in the blood controls the production of another hormone, or of itself.'],
        ['Thyroxine and TSH', 'high thyroxine inhibits TSH.', 'The pituitary secretes TSH, which makes the thyroid secrete thyroxine. When the thyroxine level is high, it inhibits TSH, so less thyroxine is made.'],
        ['Negative or positive', 'usually negative: it keeps levels steady.', 'That\'s negative feedback: the change switches itself off, keeping the level steady. Positive feedback, like oxytocin during birth, pushes a change further.']
      ] },
    { id: 'homeostasis', title: 'Homeostasis: keeping things steady', summary: 'Receptors, a control centre and effectors.',
      say: 'Inside you, temperature, water and glucose are kept almost perfectly steady. That\'s homeostasis.',
      keys: ['homeostasis', 'temperature', 'receptor', 'effector', 'control centre', 'negative feedback', 'glucose concentration', 'glucagon', 'stimulus'],
      pic: null,
      bullets: [
        ['Stimulus and response', 'receptor, control centre, effector.', 'Homeostasis is keeping a constant internal environment. Receptors detect a change, a control centre decides, and effectors respond, through nerves or hormones.'],
        ['Negative feedback', 'the response reverses the change.', 'The response reverses the change. After a meal, rising glucose makes the pancreas secrete insulin; as glucose falls, less insulin is made. If glucose falls below its resting level, glucagon brings it back up.'],
        ['When you\'re cold', 'shiver, and more thyroxine.', 'If your temperature drops, receptors in the skin and brain detect it. Nerves make your muscles shiver to generate heat, and thyroxine raises the metabolic rate.']
      ] },
    { id: 'uses', title: 'Hormones as tools', summary: 'In medicine, in sport and on the farm.',
      say: 'Hormones are such powerful messengers that people use them, for good and for bad.',
      keys: ['supplement', 'corrective', 'treatment', 'diabetes', 'contracept', 'hrt', 'sport', 'steroid', 'athlete', 'agricultur', 'farm', 'livestock', 'deficiency'],
      pic: null,
      bullets: [
        ['Health', 'giving a hormone the body lacks.', 'If a gland makes too little, the hormone can be given: insulin injections for diabetes, or thyroxine tablets. The contraceptive pill, fertility treatment and HRT are hormones too.'],
        ['Sport', 'banned: steroids and EPO.', 'Some athletes cheat with anabolic steroids, which act like testosterone to build muscle, or EPO, which makes more red blood cells. Both are banned, and can harm the heart, liver and blood.'],
        ['Agriculture', 'timed breeding, more meat.', 'Farmers use hormones to time breeding, so the young are born together. Growth hormones that make livestock grow faster are banned in the EU, as residues could end up in our food.']
      ] }
  ],
  questions: { '2016-Q15c': 'thyroid', '2008-Q13c': 'pituitary', '2004-Q12c': 'homeostasis', 'S1-Q1d': 'pancreas',
    'P34-1': 'thyroid', 'P34-2': 'pituitary', 'P34-3': 'uses', 'P34-4': 'uses', 'P34-5': 'homeostasis' },
  parts: {
    'S1-Q1d': ['pancreas', 'homeostasis'],
    '2026-Q7d': ['adrenal'],
    '2025-Q17c': ['pituitary'],
    '2024-Q16b': ['map', 'adrenal', 'uses', 'feedback'],
    '2023-Q17a': ['glands', 'pancreas', 'map', 'thyroid'],
    '2021-Q17c': ['compare'],
    '2021-Q16b': ['sex'],
    '2021-Q6a': ['adrenal'],
    '2020-Q14a': ['sex'],
    '2019-Q14a': ['glands', 'pituitary', 'pancreas'],
    '2018-Q14c': ['glands', 'pancreas', 'feedback', 'uses'],
    '2018-Q6': ['pituitary'],
    '2016-Q15c': [null],
    '2016-Q15b': ['pituitary'],
    '2013-Q13a': ['sex'],
    '2013-Q10b': ['hormone', 'map', 'uses', 'compare'],
    '2013-Q10a': ['glands', 'glands', 'pancreas'],
    '2013-Q1d': ['hormone'],
    '2012-Q13a': ['compare'],
    '2011-Q11c': ['hormone', 'hormone', 'feedback', 'uses'],
    '2010-Q15a': ['sex'],
    '2010-Q11c': ['glands', 'map', 'uses'],
    '2008-Q13c': ['pituitary', 'hormone'],
    '2007-Q15b': ['glands', 'compare', 'map', 'uses'],
    '2007-Q15a': ['sex'],
    '2007-Q4': ['pituitary'],
    '2005-Q14c': ['glands', 'pancreas'],
    '2005-Q13a': ['sex', 'sex'],
    '2005-Q3c': ['glands'],
    '2004-Q12c': ['homeostasis']
  }
};

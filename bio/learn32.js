// Chapter 32, infectious disease and the human immune response: what the games and memory drills use. Written to
// the new course's learning outcomes 2.4.12 (innate and acquired immunity, pathogens, preventing and treating microbial
// disease), 2.4.13 (how viruses replicate, DNA and RNA viruses), 2.4.14 (white blood cells), 2.4.15 (how infectious
// diseases emerge and spread) and 2.4.16 (emerging diseases, novel viruses, autoimmune diseases).
window.BioLearn = window.BioLearn || {};
window.BioLearn[32] = {
  // Immune chase: mark the invaders, hunt infected cells as a killer T cell, then beat the second wave (bio/act32.js).
  action: { name: 'Immune chase', what: 'Be the immune system: mark the virus with antibodies, hunt down infected cells as a killer T cell, then beat it again with memory cells.' },

  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'How a virus multiplies', steps: ['The virus attaches to a host cell', 'Its nucleic acid (DNA or RNA) enters the cell', 'The host cell copies the viral nucleic acid', 'The host cell makes new viral protein coats', 'New viruses are assembled', 'The new viruses are released and the cell bursts'],
        why: 'A virus <b>attaches</b> to a <b>host cell</b> and its <b>nucleic acid</b> (DNA or RNA) <b>enters</b> the cell. The host cell\'s <b>organelles</b> are used to <b>copy</b> the viral nucleic acid and make new <b>protein coats</b>. New viruses are <b>assembled</b> and <b>released</b>, often <b>bursting</b> the cell, to infect more cells.' },
      { title: 'The antibody response', steps: ['A pathogen with foreign antigens gets into the body', 'A macrophage engulfs it and shows its antigens', 'Helper T cells recognise the antigen and switch on B cells', 'B lymphocytes multiply and make antibodies', 'The antibodies lock onto the antigens on the pathogen', 'Phagocytes engulf and destroy the marked pathogens'],
        why: 'A <b>pathogen</b> carries foreign <b>antigens</b>. A <b>macrophage</b> engulfs it and shows its antigens, <b>helper T cells</b> recognise them and switch on <b>B lymphocytes</b>, which multiply and make <b>antibodies</b>. The antibodies are <b>specific</b>: they <b>lock onto</b> that antigen, so the pathogens clump together and <b>phagocytes</b> engulf and destroy them.' },
      { title: 'Killer T cells and infected cells', steps: ['A virus infects a body cell', 'The infected cell shows viral antigens on its membrane', 'Helper T cells recognise the antigen', 'Killer T cells are switched on and multiply', 'Killer T cells bind to the infected cells', 'They release perforin, which bursts the infected cell', 'Suppressor T cells switch off the response'],
        why: 'An <b>infected cell</b> shows <b>viral antigens</b> on its <b>membrane</b>. <b>Helper T cells</b> recognise them and switch on <b>killer T cells</b>, which bind to the infected cells and release <b>perforin</b>: it makes holes in the membrane, the cell <b>bursts</b> and the virus can\'t multiply in it. When the infection is over, <b>suppressor T cells</b> switch the response off and <b>memory T cells</b> remain. This is the <b>cell-mediated</b> response.' },
      { title: 'How a vaccine gives immunity', steps: ['A harmless (weakened or dead) form of the pathogen is injected', 'The immune system recognises its antigens as foreign', 'B lymphocytes make antibodies against the antigen', 'Memory cells are made and stay in the body', 'Later, the real pathogen gets in', 'Memory cells cause a fast, large antibody response: no illness'],
        why: 'A <b>vaccine</b> is a <b>harmless</b> (weakened or dead) form of the pathogen, or its <b>antigens</b>. The body makes its own <b>antibodies</b> and <b>memory cells</b> against it: <b>active immunity</b>. When the real pathogen gets in later, the memory cells cause a <b>fast</b>, <b>large</b> antibody response and it is destroyed before you become ill.' },
      { title: 'How antibiotic resistance spreads', steps: ['A random mutation makes one bacterium resistant', 'Antibiotics are overused, or a course isn\'t finished', 'The antibiotic kills the bacteria that are not resistant', 'The resistant bacteria survive and reproduce', 'The resistance gene spreads, even to other bacteria on plasmids', 'A resistant population builds up: the antibiotic no longer works'],
        why: 'A random <b>mutation</b> makes a bacterium <b>resistant</b>. When antibiotics are <b>overused</b> or a course isn\'t finished, the others are killed but the resistant ones <b>survive</b> and <b>reproduce</b> (<b>natural selection</b>). The resistance gene can pass to other bacteria on <b>plasmids</b>, so a <b>resistant population</b> builds up and the antibiotic stops working.' }
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
      { id: 'alive', cue: 'Are viruses living?', statement: 'It is difficult to describe viruses as living organisms.',
        steps: [
          [['They are not made of cells: just nucleic acid inside a protein coat.'], ['Viruses are a very interesting topic in biology.', 'f'], ['Bacteria have a cell wall, a cell membrane and a plasmid.', 'o']],
          [['They can only reproduce inside a living host cell, so they are obligate parasites.'], ['They need other things to survive.', 'v'], ['They reproduce by binary fission, like bacteria.', 'w', 'Bacteria divide by binary fission. New viruses can only be made inside a host cell.']]
        ] },
      { id: 'antibiotics', cue: 'Antibiotics and the flu', statement: 'Antibiotics should not be prescribed for a viral disease such as the flu.',
        steps: [
          [['Antibiotics kill bacteria or stop them growing, but they have no effect on viruses.'], ['Antibiotics don\'t work on everything.', 'v'], ['Doctors are very busy in the winter.', 'f']],
          [['Overusing them lets resistant bacteria survive and multiply, so the antibiotics stop working.'], ['It could cause problems later on.', 'v'], ['The flu virus becomes resistant to the antibiotic.', 'w', 'Resistance builds up in bacteria, by natural selection. Antibiotics have no effect on viruses at all.']]
        ] },
      { id: 'vaccine', cue: 'Vaccination', statement: 'Vaccination gives active immunity.',
        steps: [
          [['A harmless (weakened or dead) form of the pathogen, or its antigens, is put into the body.'], ['You get an injection from the nurse.', 'v'], ['Antibiotics are made by fungi and bacteria.', 'o']],
          [['The body makes its own antibodies and memory cells, so it reacts fast if the real pathogen gets in.'], ['Then your body is ready for it.', 'v'], ['The vaccine gives you ready-made antibodies.', 'w', 'Ready-made antibodies give passive immunity (an antibody injection, or breast milk). A vaccine makes your body produce its own: active immunity.']]
        ] },
      { id: 'killer', cue: 'Killer T cells', statement: 'Killer T cells destroy body cells infected by viruses.',
        steps: [
          [['They recognise the viral antigens shown on the membrane of the infected cell.'], ['They can tell which cells are the bad ones.', 'v'], ['Red blood cells carry oxygen using haemoglobin.', 'o']],
          [['They release perforin, which makes holes in its membrane so the infected cell bursts.'], ['Then they attack it.', 'v'], ['They release antibodies that kill the infected cell.', 'w', 'Antibodies are made by B lymphocytes. Killer T cells release perforin.']]
        ] },
      { id: 'skin', cue: 'The skin as a defence', statement: 'The skin is part of the general (innate) defence system.',
        steps: [
          [['It is a tough physical barrier that stops pathogens getting into the body.'], ['The body has lots of different defences.', 'f'], ['Lymphocytes are made in the bone marrow.', 'o']],
          [['Its dead outer layer contains keratin, and sebum and sweat on it contain chemicals that kill bacteria.'], ['It has other things in it too.', 'v'], ['The skin makes antibodies that kill bacteria.', 'w', 'Antibodies are made by B lymphocytes, in the specific (adaptive) system. The skin is general: it stops any pathogen.']]
        ] },
      { id: 'memory', cue: 'A second infection', statement: 'A second infection by the same virus is beaten much faster than the first.',
        steps: [
          [['Memory cells made during the first infection recognise its antigen straight away.'], ['The body remembers it from before.', 'v'], ['Viruses are made of protein and nucleic acid.', 'o']],
          [['So antibodies are made far faster and in larger numbers, and the virus is destroyed before you feel ill.'], ['So it goes better the second time.', 'v'], ['The antibodies from the first infection stay in the blood for life.', 'w', 'Antibodies fade away within weeks. It is the memory cells that last, and make new antibodies fast.']]
        ] }
    ]
  },

  // Build it: after building and labelling, questions on the diagram. tap = structures (anchor names) that are right.
  build: {
    virus: [
      { q: 'Tap an antigen: the part an antibody recognises.', tap: ['spike'] },
      { q: 'Tap the part made of protein that surrounds the genes.', tap: ['coat'] },
      { q: 'Tap the virus\'s genetic material.', tap: ['nucleic'] },
      { q: 'Tap the layer that only some viruses have.', tap: ['envelope'] },
      { q: 'What are the two chemicals all viruses are made of?', opts: ['Protein and nucleic acid', 'Protein and cellulose', 'Lipid and starch', 'Nucleic acid and chitin'], a: 0 },
      { q: 'Why are viruses called obligate parasites?', opts: ['They can only reproduce inside a living host cell', 'They always kill their host', 'They are made of only one cell', 'They feed on dead organisms'], a: 0 }
    ],
    phage: [
      { q: 'Tap the part that grips the host cell.', tap: ['fibres'] },
      { q: 'Tap the part the DNA is pushed down through.', tap: ['tail'] },
      { q: 'Tap the protein coat.', tap: ['coat', 'virus'] },
      { q: 'Tap where the virus\'s DNA is stored before it attacks.', tap: ['nucleic', 'virus'] },
      { q: 'Tap the viral DNA on its way into the host.', tap: ['injected'] },
      { q: 'A bacteriophage attacks which kind of cell?', opts: ['Bacteria', 'Red blood cells', 'Fungi', 'Plant cells'], a: 0 },
      { q: 'Which is a beneficial use of viruses?', opts: ['Carrying genes in genetic engineering', 'Making antibiotics', 'Digesting food in the gut', 'Fixing nitrogen in the soil'], a: 0 }
    ],
    replication: [
      { q: 'Tap the virus attaching to the host cell.', tap: ['attach', 'virus'] },
      { q: 'Tap where the viral nucleic acid enters the cell.', tap: ['enter'] },
      { q: 'Tap where the host cell is making copies of the viral nucleic acid and proteins.', tap: ['made'] },
      { q: 'Tap the new viruses being assembled.', tap: ['assemble'] },
      { q: 'Tap the new viruses leaving to infect more cells.', tap: ['release'] },
      { q: 'Why is a red blood cell no use as a host for a virus?', opts: ['It has no nucleus', 'It is too small', 'It has no cell membrane', 'It moves too fast'], a: 0 }
    ],
    lymphocyte: [
      { q: 'Tap the cell that makes antibodies.', tap: ['lymphocyte', 'receptor'] },
      { q: 'Tap a free antibody.', tap: ['antibody'] },
      { q: 'Tap an antigen.', tap: ['antigen'] },
      { q: 'Tap an antibody locked onto an antigen.', tap: ['bound'] },
      { q: 'Tap the pathogen.', tap: ['pathogen'] },
      { q: 'Where in the body are lymphocytes made?', opts: ['In the bone marrow', 'In the spleen', 'In the liver', 'In the stomach wall'], a: 0 },
      { q: 'What are antibodies made of?', opts: ['Protein', 'Carbohydrate', 'Lipid', 'Nucleic acid'], a: 0 }
    ],
    macrophage: [
      { q: 'Tap the alveolar macrophage.', tap: ['macrophage'] },
      { q: 'Tap a bacterium being engulfed.', tap: ['engulfed', 'pseudopod'] },
      { q: 'Tap a bacterium being digested inside the macrophage.', tap: ['digested'] },
      { q: 'Tap the capillary.', tap: ['capillary', 'rbc'] },
      { q: 'An alveolar macrophage is a white blood cell that has left the blood. Which kind?', opts: ['A monocyte', 'A lymphocyte', 'A red blood cell', 'A platelet'], a: 0 },
      { q: 'Engulfing any pathogen like this is part of which system?', opts: ['The innate (general) system: it isn\'t specific', 'The adaptive system: one antigen only', 'Passive immunity', 'The cell-mediated response'], a: 0 }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Pathogen', 'A pathogen is an organism or agent that causes disease.'],
        ['Antigen', 'An antigen is a foreign molecule, usually a protein, that causes the body to make antibodies.'],
        ['Antibody', 'An antibody is a protein made by B lymphocytes in response to a specific antigen.'],
        ['Immunity', 'Immunity is the ability to resist infection.'],
        ['Vaccination', 'Vaccination is giving a harmless form of a pathogen, or its antigens, so the body makes antibodies and memory cells.'],
        ['Antibiotic', 'An antibiotic is a substance made by a micro-organism that kills or stops the growth of other micro-organisms.'],
        ['Obligate parasite', 'An obligate parasite can only reproduce inside a living host cell.']
      ] },
    { type: 'sort', name: 'Innate or adaptive?', what: 'Quick: is it part of the general (innate) defence, or the specific (adaptive) response?',
      bins: ['Innate (general)', 'Adaptive (specific)'],
      items: [['Skin as a barrier', 0], ['Mucus and cilia in the airways', 0], ['Acid in the stomach', 0], ['Lysozyme in tears', 0], ['Phagocytes engulfing any pathogen', 0], ['Inflammation', 0], ['Fever', 0], ['Natural killer cells', 0],
        ['Antibodies from B cells', 1], ['Killer T cells', 1], ['Helper T cells', 1], ['Memory cells', 1]],
      why: 'Innate defences are always there and work against any pathogen. The adaptive response is specific: lymphocytes target one antigen, and memory cells remember it.' },
    { type: 'sort', name: 'Which white blood cell?', what: 'Send each job to the white blood cell that does it.',
      bins: ['B lymphocyte', 'Helper T cell', 'Killer T cell', 'Suppressor T cell', 'Memory cell', 'Monocyte (macrophage)'],
      items: [['Makes antibodies', 0], ['Recognises antigens and switches on B and killer T cells', 1], ['Releases perforin to burst infected cells', 2], ['Destroys body cells infected by a virus', 2],
        ['Switches off the immune response when the infection is over', 3], ['Remembers an antigen for years', 4], ['Makes the response to a second infection fast', 4],
        ['Engulfs and digests any pathogen', 5], ['Shows antigens to lymphocytes', 5]],
      why: 'B cells make antibodies. Helper T cells recognise antigens and switch the others on. Killer T cells burst infected cells with perforin. Suppressor T cells switch it off. Memory cells give long-term protection. Monocytes (macrophages) engulf.' },
    { type: 'sort', name: 'What causes it?', what: 'Which kind of pathogen causes each disease?',
      bins: ['Virus', 'Bacterium', 'Fungus', 'Protist', 'Prion', 'Parasitic animal'],
      items: [['The common cold', 0], ['COVID-19', 0], ['Measles', 0], ['AIDS (HIV)', 0], ['Tuberculosis (TB)', 1], ['Salmonella food poisoning', 1], ['Tetanus', 1],
        ['Athlete\'s foot', 2], ['Ash dieback in trees', 2], ['Malaria', 3], ['BSE (mad cow disease)', 4], ['Tapeworm infection', 5]],
      why: 'Antibiotics only work on bacteria. Viral diseases need vaccines or antivirals, fungal ones antifungals. Prions are misfolded proteins: no cells and no nucleic acid at all.' },
    { type: 'table', name: 'Four ways to be immune', what: 'For each one: active or passive, natural or artificial?',
      cols: ['Active or passive?', 'Natural or artificial?'], choices: ['Active', 'Passive', 'Natural', 'Artificial'],
      rows: [['You catch measles and recover', ['Active', 'Natural']], ['You get the MMR vaccine', ['Active', 'Artificial']], ['A baby gets antibodies in breast milk', ['Passive', 'Natural']], ['You get an injection of antibodies', ['Passive', 'Artificial']]],
      why: 'Active: your own body makes the antibodies and memory cells, so it lasts. Passive: you are given ready-made antibodies, so it works at once but fades within weeks.' },
    { type: 'table', name: 'Antibodies or antibiotics?', what: 'Which of these is true of antibodies, and which of antibiotics?',
      cols: ['Antibodies', 'Antibiotics'], choices: ['Yes', 'No'],
      rows: [['Made of protein', ['Yes', 'No']], ['Made by your own B lymphocytes', ['Yes', 'No']], ['Made by micro-organisms such as fungi', ['No', 'Yes']], ['Each one fits only one antigen', ['Yes', 'No']], ['Work against viruses', ['Yes', 'No']], ['Can be given as a medicine', ['Yes', 'Yes']]],
      why: 'Antibodies are proteins your B cells make against one antigen, viral ones too. Antibiotics are made by micro-organisms (penicillin comes from a fungus) and kill bacteria or stop them growing, but have no effect on viruses.' }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P32-1', src: 'Practice question (not from a real paper)', stem: 'Pathogens include viruses and bacteria, but also fungi, protists and parasitic animals.', parts: [
      { l: '(a)', q: 'Name a disease caused by a protist.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Malaria (caused by Plasmodium), or amoebic dysentery, or sleeping sickness', m: 3, k: [{ w: ['malaria'], n: 1 }, { w: ['plasmodium'], n: 1 }, { w: ['dysentery'], n: 1 }, { w: ['sleep', 'sick'], n: 2 }] }] },
      { l: '(b)', q: 'Name a fungal disease of humans.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Athlete\'s foot, or ringworm, or thrush', m: 3, k: [{ w: ['athlete'], n: 1 }, { w: ['ringworm'], n: 1 }, { w: ['thrush'], n: 1 }] }] },
      { l: '(c)', q: 'Name a parasitic animal that can cause disease in humans.', m: 3, n: 1, kind: 'text', pts: [{ a: 'A tapeworm, roundworm (nematode) or hookworm', m: 3, k: [{ w: ['tapeworm'], n: 1 }, { w: ['roundworm'], n: 1 }, { w: ['hookworm'], n: 1 }, { w: ['nematod'], n: 1 }, { w: ['threadworm'], n: 1 }] }] },
      { l: '(d)', q: 'Antibiotics cannot treat a viral infection. Why not, and what kind of medicine can be used instead?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Antibiotics have no effect on viruses (they work on bacteria)', m: 3, k: [{ w: ['antibiotic', 'no', 'effect', 'virus'], n: 3 }, { w: ['antibiotic', 'not', 'work', 'virus'], n: 3 }, { w: ['antibiotic', 'not', 'affect', 'virus'], n: 3 }, { w: ['antibiotic', 'only', 'bacteri'], n: 3 }] },
        { a: 'Antiviral drugs', m: 3, k: [{ w: ['antiviral'], n: 1 }] }] },
      { l: '(e)', q: 'What type of medicine is used to treat athlete\'s foot?', m: 3, n: 1, kind: 'text', pts: [{ a: 'An antifungal (cream or drug)', m: 3, k: [{ w: ['antifungal'], n: 1 }] }] }
    ] },
    { id: 'P32-2', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Natural killer (NK) cells are white blood cells of the innate system. What do they do?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'They destroy body cells infected by viruses (and cancer cells)', m: 3, k: [{ w: ['destroy', 'infect', 'cell'], n: 2 }, { w: ['kill', 'infect', 'cell'], n: 2 }, { w: ['kill', 'cancer'], n: 2 }, { w: ['destroy', 'cancer'], n: 2 }] },
        { a: 'They act against any infected cell: they don\'t need a specific antigen (non-specific)', m: 3, k: [{ w: ['non', 'specific'], n: 2 }, { w: ['not', 'specific'], n: 2 }, { w: ['any', 'infect'], n: 2 }, { w: ['without', 'antigen'], n: 2 }] }] },
      { l: '(b)', q: 'Distinguish between the roles of B lymphocytes and T lymphocytes when a virus infects the body.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'B lymphocytes make antibodies (the antibody or humoral response)', m: 3, k: [{ w: ['b', 'antibody'], n: 2 }, { w: ['humoral'], n: 1 }] },
        { a: 'Antibodies lock onto the antigens of free viruses in the blood and lymph', m: 3, k: [{ w: ['antibody', 'antigen'], n: 2 }, { w: ['antibody', 'free', 'virus'], n: 3 }] },
        { a: 'Killer T cells destroy infected body cells directly (the cell-mediated response)', m: 3, k: [{ w: ['killer', 'infect', 'cell'], n: 3 }, { w: ['t', 'destroy', 'infect'], n: 3 }, { w: ['t', 'kill', 'infect'], n: 3 }, { w: ['cell', 'mediat'], n: 2 }] },
        { a: 'Helper T cells recognise the antigen and switch on the B cells and killer T cells', m: 3, k: [{ w: ['helper', 'recognis'], n: 2 }, { w: ['helper', 'activat'], n: 2 }, { w: ['helper', 'stimulat'], n: 2 }, { w: ['helper', 'switch'], n: 2 }] }] }
    ] },
    { id: 'P32-3', src: 'Practice question (not from a real paper)', stem: 'Every virus has DNA or RNA as its genetic material, never both.', parts: [
      { l: '(a)', q: 'Give one example of an RNA virus and one example of a DNA virus.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'RNA virus: e.g. flu, HIV, a coronavirus, measles or the common cold', m: 3, k: [{ w: ['flu'], n: 1 }, { w: ['influenza'], n: 1 }, { w: ['hiv'], n: 1 }, { w: ['coronavirus'], n: 1 }, { w: ['covid'], n: 1 }, { w: ['measl'], n: 1 }, { w: ['cold'], n: 1 }] },
        { a: 'DNA virus: e.g. herpes (cold sores), chickenpox, smallpox or HPV', m: 3, k: [{ w: ['herpes'], n: 1 }, { w: ['chickenpox'], n: 1 }, { w: ['chicken', 'pox'], n: 2 }, { w: ['smallpox'], n: 1 }, { w: ['hpv'], n: 1 }, { w: ['papilloma'], n: 1 }] }] },
      { l: '(b)', q: 'RNA viruses such as flu mutate faster than DNA viruses. Why does this matter?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Their RNA is copied with more mistakes, so mutations happen often', m: 3, k: [{ w: ['mistake'], n: 1 }, { w: ['error'], n: 1 }, { w: ['mutat', 'often'], n: 2 }, { w: ['mutat', 'more'], n: 2 }] },
        { a: 'New strains appear that antibodies (and memory cells, or last year\'s vaccine) don\'t recognise: a new flu vaccine is needed every year', m: 3, k: [{ w: ['new', 'strain'], n: 2 }, { w: ['new', 'vaccin', 'year'], n: 2 }, { w: ['not', 'recognis'], n: 2 }, { w: ['dont', 'recognis'], n: 2 }] }] },
      { l: '(c)', q: 'HIV is an RNA virus called a retrovirus. Name the enzyme it uses to make DNA from its RNA.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Reverse transcriptase', m: 3, k: [{ w: ['reverse', 'transcriptase'], n: 2 }] }] }
    ] },
    { id: 'P32-4', src: 'Practice question (not from a real paper)', stem: 'Whether an infectious disease spreads depends on the pathogen, the people it infects and how they move about.', parts: [
      { l: '(a)', q: 'A disease has a reproduction number (R value) of 3. What does this mean?', m: 3, n: 1, kind: 'text', pts: [{ a: 'Each infected person passes it on to 3 other people, on average', m: 3, k: [{ w: ['each', 'infect', '3'], n: 3 }, { w: ['each', 'infect', 'three'], n: 3 }, { w: ['average', '3'], n: 2 }, { w: ['average', 'three'], n: 2 }, { w: ['pass', '3', 'people'], n: 3 }, { w: ['pass', 'three', 'people'], n: 3 }] }] },
      { l: '(b)', q: 'Explain why the number of cases grows when R is above 1 and falls when R is below 1.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Above 1: each case causes more than one new case, so the numbers keep growing', m: 3, k: [{ w: ['more', 'than', 'one', 'new'], n: 3 }, { w: ['more', 'one', 'grow'], n: 3 }, { w: ['above', 'grow'], n: 2 }, { w: ['above', 'increas'], n: 2 }] },
        { a: 'Below 1: each case causes less than one new case, so the outbreak dies out', m: 3, k: [{ w: ['less', 'than', 'one'], n: 3 }, { w: ['fewer', 'one'], n: 2 }, { w: ['die', 'out'], n: 2 }, { w: ['below', 'fall'], n: 2 }, { w: ['below', 'decreas'], n: 2 }] }] },
      { l: '(c)', q: 'Some people carry a pathogen for a long time without feeling ill. How does this help the disease spread?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'They don\'t know they are infected, so they don\'t stay away from others', m: 3, k: [{ w: ['dont', 'know'], n: 2 }, { w: ['not', 'know'], n: 2 }, { w: ['unaware'], n: 1 }, { w: ['no', 'symptom', 'mix'], n: 3 }, { w: ['not', 'isolat'], n: 2 }] },
        { a: 'The pathogen persists in them for a long time, so they can infect people over a long period', m: 3, k: [{ w: ['persist'], n: 1 }, { w: ['long', 'time', 'infect'], n: 3 }, { w: ['long', 'period'], n: 2 }] }] },
      { l: '(d)', q: 'How does the movement of people and organisms help a disease spread?', m: 3, n: 1, kind: 'text', pts: [{ a: 'Travel carries the pathogen (or infected people, animals, plants or vectors) to new places, locally and around the world', m: 3, k: [{ w: ['new', 'place'], n: 2 }, { w: ['new', 'area'], n: 2 }, { w: ['new', 'countr'], n: 2 }, { w: ['carry', 'pathogen'], n: 2 }, { w: ['spread', 'world'], n: 2 }] }] }
    ] },
    { id: 'P32-5', src: 'Practice question (not from a real paper)', stem: 'A farmer sprays the same pesticide on a crop every year. After a few years it no longer kills the insect pests.', parts: [
      { l: '(a)', q: 'Use the theory of natural selection to explain why the pesticide stopped working.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'A few insects had a mutation (variation) that made them resistant', m: 3, k: [{ w: ['mutat'], n: 1 }, { w: ['variat', 'resistant'], n: 2 }, { w: ['few', 'resistant'], n: 2 }, { w: ['some', 'resistant'], n: 2 }] },
        { a: 'The pesticide killed the others, but the resistant ones survived and reproduced', m: 3, k: [{ w: ['surviv', 'reproduc'], n: 2 }, { w: ['surviv', 'breed'], n: 2 }] },
        { a: 'They passed on the resistance gene, so the population became resistant', m: 3, k: [{ w: ['pass', 'gene'], n: 2 }, { w: ['offspring', 'resistant'], n: 2 }, { w: ['inherit'], n: 1 }, { w: ['resistant', 'population'], n: 2 }] }] },
      { l: '(b)', q: 'Give one other example of chemical resistance, apart from antibiotic resistance in bacteria.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Fungicide resistance in fungi, herbicide resistance in weeds, insecticide resistance in mosquitoes, or antiviral resistance in viruses', m: 3, k: [{ w: ['fungicid'], n: 1 }, { w: ['herbicid'], n: 1 }, { w: ['insecticid'], n: 1 }, { w: ['antiviral'], n: 1 }, { w: ['weedkiller'], n: 1 }] }] }
    ] },
    { id: 'P32-6', src: 'Practice question (not from a real paper)', stem: 'New infectious diseases keep emerging in plants and animals, including humans.', parts: [
      { l: '(a)', q: 'What is meant by a novel virus? Give an example.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'A new virus that has not been seen before in that species (often one that jumps from animals to humans)', m: 3, k: [{ w: ['new', 'virus'], n: 2 }, { w: ['not', 'seen', 'before'], n: 3 }, { w: ['jump', 'animal'], n: 2 }] },
        { a: 'SARS-CoV-2 (COVID-19), bird flu, swine flu, Ebola or Zika', m: 3, k: [{ w: ['sar'], n: 1 }, { w: ['covid'], n: 1 }, { w: ['coronavirus'], n: 1 }, { w: ['bird', 'flu'], n: 2 }, { w: ['swine', 'flu'], n: 2 }, { w: ['ebola'], n: 1 }, { w: ['zika'], n: 1 }] }] },
      { l: '(b)', q: 'Apart from vaccines and medicines, give three ways to control the spread of a new disease.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'Isolating infected people (quarantine)', m: 3, k: [{ w: ['isolat'], n: 1 }, { w: ['quarantin'], n: 1 }] },
        { a: 'Contact tracing', m: 3, k: [{ w: ['contact', 'trac'], n: 2 }] },
        { a: 'Testing and surveillance to find cases early', m: 3, k: [{ w: ['test'], n: 1 }, { w: ['surveillanc'], n: 1 }, { w: ['monitor'], n: 1 }] },
        { a: 'Controlling vectors such as mosquitoes (nets, repellent, draining standing water)', m: 3, k: [{ w: ['mosquito'], n: 1 }, { w: ['vector'], n: 1 }] },
        { a: 'Hygiene: washing hands, masks', m: 3, k: [{ w: ['wash', 'hand'], n: 2 }, { w: ['mask'], n: 1 }, { w: ['hygien'], n: 1 }] },
        { a: 'Limiting travel (border controls)', m: 3, k: [{ w: ['travel'], n: 1 }, { w: ['border'], n: 1 }, { w: ['lockdown'], n: 1 }] }] },
      { l: '(c)', q: 'Why is it important for society to know about emerging diseases?', m: 3, n: 1, kind: 'text', pts: [{ a: 'So they can be found and controlled early, before an epidemic or pandemic, and vaccines and treatments developed in time', m: 3, k: [{ w: ['early'], n: 1 }, { w: ['pandemic'], n: 1 }, { w: ['epidemic'], n: 1 }, { w: ['prepar'], n: 1 }, { w: ['vaccin', 'develop'], n: 2 }, { w: ['control', 'spread'], n: 2 }] }] }
    ] },
    { id: 'P32-7', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What is an autoimmune disease?', m: 3, n: 1, kind: 'text', pts: [{ a: 'A disease in which the immune system attacks the body\'s own cells (it treats self as foreign)', m: 3, k: [{ w: ['attack', 'own', 'cell'], n: 3 }, { w: ['attack', 'own', 'tissue'], n: 3 }, { w: ['attack', 'own', 'body'], n: 3 }, { w: ['self', 'foreign'], n: 2 }] }] },
      { l: '(b)', q: 'Name one autoimmune disease.', m: 3, n: 1, kind: 'text', pts: [{ a: 'Type 1 diabetes, rheumatoid arthritis, multiple sclerosis or coeliac disease', m: 3, k: [{ w: ['type', '1', 'diabet'], n: 3 }, { w: ['type', 'one', 'diabet'], n: 3 }, { w: ['rheumatoid'], n: 1 }, { w: ['multiple', 'sclerosis'], n: 2 }, { w: ['coeliac'], n: 1 }, { w: ['lupus'], n: 1 }] }] },
      { l: '(c)', q: 'In type 1 diabetes, which cells are attacked, and what is the result?', m: 6, n: 2, kind: 'text', pts: [
        { a: 'The cells of the pancreas that make insulin', m: 3, k: [{ w: ['pancrea'], n: 1 }] },
        { a: 'Little or no insulin is made, so blood glucose stays too high', m: 3, k: [{ w: ['no', 'insulin'], n: 2 }, { w: ['less', 'insulin'], n: 2 }, { w: ['little', 'insulin'], n: 2 }, { w: ['glucose', 'high'], n: 2 }] }] }
    ] }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one point per line. The marker decides which
  // lines earn marks (in order: a line earns if it makes a scheme point the lines before haven't). Lines that earn
  // nothing carry why (shown after marking) and fix (a better line that earns a point the answer still lacks).
  examiner: [
    { q: '2020-Q15b', part: 3, student: 'Aoife', lines: [
      { t: 'First the virus attaches itself onto the outside of a host cell.', ok: true },
      { t: 'Then the virus does its thing inside the cell.', why: 'Vague: what does it do? Name the nucleic acid going in.', fix: 'The viral nucleic acid (DNA or RNA) makes its entry into the cell.' },
      { t: 'The virus uses the host cell\'s structures, like its ribosomes, to copy itself.', ok: true },
      { t: 'The virus divides in two by binary fission.', why: 'Wrong: bacteria divide by binary fission. Viruses are assembled from parts made by the host cell.', fix: 'The new virus parts assemble into new virus particles.' },
      { t: 'In the end the cell gets damaged.', why: 'Vague: what happens to the new viruses? Say they are made and released.', fix: 'Finally new virus particles are produced and released from the cell.' },
      { t: 'The virus attaches to the host cell first.', why: 'Repeat of line 1: no new marks.', fix: 'New protein coats and nucleic acid assemble into new virus particles.' }
    ] },
    { q: '2019-Q14b', part: 0, student: 'Ciarán', lines: [
      { t: 'Vaccination stimulates immunity in the person who gets it.', ok: true },
      { t: 'You get an injection and then you are fine.', why: 'Vague: an injection of what? Say it is a harmless dose of the pathogen.', fix: 'A non-harmful dose of the pathogen is introduced into the organism.' },
      { t: 'The body then produces antibodies against the antigen.', ok: true },
      { t: 'The vaccine has antibodies in it that fight the disease.', why: 'Wrong: ready-made antibodies are passive immunity. A vaccine makes the body produce its own.', fix: 'Memory cells are produced, so the body reacts fast next time.' },
      { t: 'It is good for everyone.', why: 'Vague: good how? Say what it prevents.', fix: 'It prevents the spread of the disease through the population.' }
    ] },
    { q: '2019-Q14b', part: 1, student: 'Aoife', lines: [
      { t: 'Antibiotic resistant bacteria are not affected by the antibiotic.', ok: true },
      { t: 'It can be caused by the overuse of antibiotics.', ok: true },
      { t: 'The antibiotics make the bacteria get used to them.', why: 'Wrong: antibiotics don\'t change bacteria. Resistance comes from random mutations, and natural selection picks them out.', fix: 'The bacteria mutate, and the resistant ones survive.' },
      { t: 'This is a big problem for hospitals everywhere.', why: 'Not relevant: it says nothing about how resistance works.', fix: 'Soon a resistant population of bacteria builds up.' },
      { t: 'Overusing antibiotics causes it.', why: 'Repeat of line 2: no new marks.', fix: 'Resistance can be acquired by bacteria from other bacteria, on a plasmid.' }
    ] },
    { q: '2013-Q12c', part: 0, student: 'Ciarán', lines: [
      { t: 'Antibodies are proteins.', ok: true },
      { t: 'Antibodies are produced by the body.', ok: true },
      { t: 'Antibiotics are produced by microbes such as fungi.', ok: true },
      { t: 'Antibiotics are used to kill viruses like the flu.', why: 'Wrong: antibiotics have no effect on viruses.', fix: 'Antibiotics do not affect viruses at all.' },
      { t: 'Both of them help you get better.', why: 'Vague: this doesn\'t tell them apart.', fix: 'Antibodies are made in response to a specific antigen.' }
    ] },
    { q: '2012-Q15b', part: 4, student: 'Aoife', lines: [
      { t: 'Helper T cells recognise antigens.', ok: true },
      { t: 'Killer T cells kill things.', why: 'Vague: kill what? Say they attack infected cells.', fix: 'Killer T cells attack infected cells.' },
      { t: 'Suppressor T cells stop the immune response once the infection is gone.', ok: true },
      { t: 'Memory T cells make antibodies.', why: 'Wrong: B lymphocytes make antibodies. Memory cells give long-term protection.', fix: 'Memory T cells give long term protection against the same antigen.' }
    ] },
    { q: '2017-Q14b', part: 1, student: 'Ciarán', lines: [
      { t: 'A vaccine is a non-disease-causing dose of the pathogen.', ok: true },
      { t: 'It helps your body to fight off germs.', why: 'Vague: how does it help? Say what the body makes.', fix: 'It stimulates the production of antibodies.' },
      { t: 'It introduces the antigen into the body.', ok: true },
      { t: 'The vaccine kills the virus straight away.', why: 'Wrong: a vaccine doesn\'t kill anything. It makes the body produce its own antibodies and memory cells.', fix: 'It stimulates antibody production by the B lymphocytes.' }
    ] }
  ],
  // Quick games: match pairs (term, what it means), spot the mistake (the wrong words are in *stars*; fix is the right
  // words, opts are wrong ones to choose from), and which diagrams label sprint uses.
  match: [
    ['Pathogen', 'Anything that causes disease'],
    ['Antigen', 'Foreign molecule that triggers antibodies'],
    ['Antibody', 'Y-shaped protein that binds one antigen'],
    ['B lymphocyte', 'Makes antibodies'],
    ['Helper T cell', 'Switches on B cells and killer T cells'],
    ['Killer T cell', 'Destroys body cells infected by a virus'],
    ['Suppressor T cell', 'Switches the response off'],
    ['Memory cell', 'Remembers an antigen for years'],
    ['Macrophage', 'Engulfs and digests pathogens'],
    ['Vaccine', 'Gives you active immunity without the disease'],
    ['Antibiotic', 'Kills bacteria, but not viruses'],
    ['Lysozyme', 'Enzyme in tears that kills bacteria']
  ],
  spot: [
    { s: 'Antibiotics are used to treat infections caused by *viruses*.', fix: 'bacteria', opts: ['prions', 'vaccines'],
      why: 'Antibiotics kill bacteria or stop them growing. They don\'t work on viruses.' },
    { s: 'Antibodies are made by *T lymphocytes*.', fix: 'B lymphocytes', opts: ['red blood cells', 'platelets'],
      why: 'B lymphocytes make antibodies. T cells help, kill or switch the response off.' },
    { s: '*Helper* T cells destroy body cells infected by a virus.', fix: 'Killer', opts: ['Suppressor', 'Memory'],
      why: 'Killer T cells destroy infected cells. Helper T cells switch on B cells and killer T cells.' },
    { s: '*Suppressor* T cells stay in the body for years, so a second infection is beaten quickly.', fix: 'Memory', opts: ['Helper', 'Killer'],
      why: 'Memory cells remain after an infection. Suppressor T cells switch the response off.' },
    { s: 'A vaccine gives you *passive* immunity.', fix: 'active', opts: ['innate', 'no'],
      why: 'A vaccine makes your own B lymphocytes make antibodies and memory cells: that is active immunity.' },
    { s: 'Antibodies in a mother\'s milk give her baby *active* immunity.', fix: 'passive', opts: ['innate', 'lifelong'],
      why: 'The baby is given ready-made antibodies, so it is passive immunity, and it doesn\'t last.' },
    { s: 'A virus can only reproduce *outside* a host cell.', fix: 'inside', opts: ['without', 'next to'],
      why: 'Viruses are obligate parasites: they can only reproduce inside a living host cell.' },
    { s: 'Macrophages destroy bacteria by *osmosis*.', fix: 'phagocytosis', opts: ['diffusion', 'filtration'],
      why: 'Macrophages engulf and digest pathogens. This is phagocytosis.' },
    { s: 'An *antibody* is a foreign molecule that makes the body produce antibodies.', fix: 'antigen', opts: ['enzyme', 'hormone'],
      why: 'An antigen triggers the response. Antibodies are the proteins made to bind to it.' },
    { s: 'Skin, mucus and stomach acid are part of the *adaptive* immune system.', fix: 'innate', opts: ['specific', 'memory'],
      why: 'These are general defences that work against any pathogen: that is innate immunity.' },
    { s: 'A virus is a protein coat around *a nucleus*.', fix: 'nucleic acid', opts: ['cytoplasm', 'a cell wall'],
      why: 'A virus is nucleic acid (DNA or RNA) inside a protein coat. It has no nucleus or cytoplasm.' },
    { s: 'Penicillin is an antibiotic made by a *bacterium*.', fix: 'fungus', opts: ['virus', 'plant'],
      why: 'Penicillin comes from a fungus, Penicillium.' }
  ],
  sprint: ['virus', 'phage', 'lymphocyte', 'macrophage']
};

// Chapter 32, infectious disease and the human immune response: the ideas the narrated guide explains on the desk
// (bio/guide.js, step 2). Each concept: keys (words that mark a question as being about it), the diagram it shows
// (pic: a BioArt id and the anchors to ring), and three bullets [bold, on screen, what the narrator says]. questions:
// concept for a question when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[32] = {
  concepts: [
    { id: 'virus', title: 'What is a virus?', summary: 'Genes in a protein shell, and not quite alive.',
      say: 'A virus is one of the strangest things in biology. It\'s not even made of cells.',
      keys: ['capsid', 'protein coat', 'coat', 'nucleic', 'biomolecule', 'biochemical', 'constituent', 'obligate', 'non-cellular', 'non cellular', 'as living', 'living organism', 'classify', 'kingdom', 'rod-shaped', 'rod shaped', 'crystal', 'genetic material', 'rna virus', 'dna virus', 'reverse transcriptase'],
      pic: { base: 'virus', hi: ['nucleic', 'coat', 'spike'] },
      bullets: [
        ['Two parts', 'nucleic acid in a protein coat.', 'Every virus has just two main parts: its genes, made of DNA or RNA, packed inside a coat of protein called the capsid.'],
        ['No cells', 'so is it living?', 'It has no cells, no organelles and no metabolism of its own. That\'s why biologists find it so hard to call a virus living.'],
        ['Obligate parasite', 'it needs a host cell.', 'A virus can only reproduce inside a living host cell. On its own, it simply waits. That makes it an obligate parasite.']] },
    { id: 'replicate', title: 'How a virus multiplies', summary: 'It hijacks your cells to make copies of itself.',
      say: 'A virus can\'t make anything by itself. So it borrows a cell, and takes it over.',
      keys: ['replicat', 'reproduc', 'attach', 'assembl', 'host structure', 'host cell', 'released', 'lysis', 'burst', 'entry', 'enters', 'large number of viruses', 'red blood cell'],
      pic: { base: 'replication', hi: ['attach', 'enter', 'made', 'assemble', 'release'] },
      bullets: [
        ['Attach and enter', 'its nucleic acid gets in.', 'First, the virus attaches to a host cell, and its DNA or RNA gets inside.'],
        ['Copies', 'made by the host cell.', 'Then the host cell\'s own ribosomes, enzymes and energy are used to copy the viral genes and make new protein coats.'],
        ['Assembled and released', 'the cell often bursts.', 'The parts are assembled into hundreds of new viruses, which burst out of the cell to infect the next one.']] },
    { id: 'uses', title: 'Harmful and helpful viruses', summary: 'Most cause disease, but some are useful.',
      say: 'Viruses are famous for making us ill. But some of them are surprisingly useful.',
      keys: ['harmful virus', 'harmful viruses', 'beneficial', 'genetic engineering', 'vector', 'bacteriophage', 'mosaic', 'economic', 'common cold', 'hiv', 'smallpox', 'polio', 'measles', 'diseases caused by viruses', 'medical importance'],
      pic: { base: 'phage', hi: ['virus', 'injected'] },
      bullets: [
        ['Harmful', 'colds, flu, measles, HIV.', 'Viruses cause the common cold, flu, measles, COVID-19 and AIDS in people, and diseases like tobacco mosaic in plants.'],
        ['Helpful', 'carrying genes.', 'But scientists can use them to carry useful genes into cells. That\'s genetic engineering, with the virus as the vector.'],
        ['Bacteriophages', 'viruses that kill bacteria.', 'Some viruses, called bacteriophages, attack only bacteria. They could be used to treat infections that antibiotics can no longer cure.']] },
    { id: 'pathogens', title: 'Pathogens: what makes us ill', summary: 'Anything that causes disease.',
      say: 'A pathogen is anything that causes disease. And they come in surprisingly different shapes and sizes.',
      keys: ['pathogen', 'disease-causing', 'disease causing', 'pathogenic', 'prion', 'bse', 'cjd', 'misfold', 'harmful bacteri', 'protist', 'fungi', 'fungus', 'parasitism', 'ash dieback', 'disease in humans', 'named disease'],
      pic: { base: 'lymphocyte', hi: ['pathogen', 'antigen'] },
      bullets: [
        ['Many kinds', 'bacteria, viruses, fungi and more.', 'Pathogens include bacteria, viruses, fungi, protists like the one that causes malaria, and even parasitic worms.'],
        ['Prions', 'misfolded proteins.', 'The oddest are prions: proteins folded into the wrong shape. They cause brain diseases like BSE and CJD, with no cells and no genes at all.'],
        ['Foreign markers', 'antigens give them away.', 'Every pathogen carries molecules on its surface that your body doesn\'t recognise. These antigens are how your immune system knows something is wrong.']] },
    { id: 'general', title: 'The general defence system', summary: 'Always on guard, against anything.',
      say: 'Before your immune system even notices an invader, it has to get past your general defences.',
      keys: ['general defence', 'innate', 'skin', 'mucus', 'mucous', 'cilia', 'stomach', 'phagocyt', 'monocyte', 'macrophage', 'inflammation', 'fever', 'lysozyme', 'tears', 'barrier', 'clotting', 'sebum', 'interferon'],
      pic: { base: 'macrophage', hi: ['macrophage', 'engulfed', 'digested'] },
      bullets: [
        ['Barriers', 'skin, mucus, acid.', 'Your skin is a tough barrier. Mucus traps microbes, cilia sweep them away, and acid in your stomach kills most of what you swallow.'],
        ['Phagocytes', 'engulf and digest.', 'Any pathogen that gets through meets the phagocytes, like monocytes and macrophages. They engulf it, and digest it with enzymes.'],
        ['Not specific', 'the same for every invader.', 'These defences treat every invader the same way, and they\'re always ready. That\'s why this is called the general, or innate, system.']] },
    { id: 'antibody', title: 'Antigens and antibodies', summary: 'A lock, and the key made to fit it.',
      say: 'Your specific defences work a bit like a lock and a key.',
      keys: ['antigen', 'antibod', 'recognised by', 'y-shaped', 'agglutinat', 'clump'],
      pic: { base: 'lymphocyte', hi: ['antigen', 'antibody', 'bound'] },
      bullets: [
        ['Antigen', 'a foreign molecule.', 'An antigen is a foreign molecule, usually a protein on the surface of a pathogen, that makes your body produce antibodies.'],
        ['Antibody', 'a protein made to fit it.', 'An antibody is a Y-shaped protein, made by B lymphocytes, with a shape that fits one antigen, and only that one.'],
        ['Locked on', 'marked for destruction.', 'When antibodies lock onto antigens, the pathogens clump together and are marked, so phagocytes can find them and destroy them.']] },
    { id: 'lymph', title: 'B and T lymphocytes', summary: 'The specific defence system\'s special forces.',
      say: 'Lymphocytes are the specialists of your immune system. Each one is trained to recognise just one antigen.',
      keys: ['lymphocyte', 'b cell', 'b-cell', 't cell', 't-cell', 'helper', 'killer', 'suppressor', 'perforin', 'bone marrow', 'thymus', 'lymph', 'spleen', 'tonsil', 'adenoid', 'specific defence', 'white blood cell', 'specific to the immune system'],
      pic: { base: 'lymphocyte', hi: ['lymphocyte', 'nucleus'] },
      bullets: [
        ['B cells', 'make antibodies.', 'Lymphocytes are made in the bone marrow. B lymphocytes make antibodies against the antigens they recognise.'],
        ['T cells', 'helper, killer, suppressor, memory.', 'Helper T cells recognise antigens and switch the other lymphocytes on. Killer T cells find infected cells and burst them with a chemical called perforin.'],
        ['Off, and remember', 'suppressor and memory cells.', 'Suppressor T cells switch the attack off when it\'s over. Memory cells stay for years, ready for the next time.']] },
    { id: 'immunity', title: 'Vaccination and immunity', summary: 'Meeting the enemy safely, ahead of time.',
      say: 'What if your body could practise fighting a disease, without ever getting sick? That\'s exactly what a vaccine does.',
      keys: ['vaccin', 'immunity', 'active', 'passive', 'induced', 'attenuat', 'non-disease', 'non-harmful', 'memory', 'breastfe', 'breast', 'previous exposure', 'booster', 'second exposure', 'first exposure', 'resist infection'],
      pic: { base: 'lymphocyte', hi: ['lymphocyte', 'antibody'] },
      bullets: [
        ['Harmless dose', 'a weakened or dead pathogen.', 'A vaccine is a harmless form of a pathogen, weakened, dead, or just its antigens, put into the body.'],
        ['Active immunity', 'your own antibodies and memory cells.', 'Your body makes its own antibodies and memory cells against it. That\'s active immunity, and it can last for years.'],
        ['Passive immunity', 'ready-made antibodies.', 'Passive immunity is when you\'re given ready-made antibodies, from an injection, or from breast milk. It works straight away, but fades within weeks.']] },
    { id: 'antibiotics', title: 'Antibiotics and resistance', summary: 'Powerful against bacteria, useless against viruses.',
      say: 'Antibiotics are one of medicine\'s greatest discoveries. But bacteria are fighting back.',
      keys: ['antibiotic', 'resistan', 'overuse', 'misuse', 'natural selection', 'course of', 'plasmid', 'penicillin', 'prescribe'],
      pic: { base: 'macrophage', hi: ['bacteria'] },
      bullets: [
        ['Antibiotics', 'made by microbes, kill bacteria.', 'An antibiotic is a substance made by a micro-organism, like penicillin from a fungus, that kills bacteria or stops them growing.'],
        ['Not viruses', 'no effect on them at all.', 'They have no effect on viruses. So antibiotics won\'t cure a cold, the flu or COVID-19.'],
        ['Resistance', 'natural selection at work.', 'When antibiotics are overused, a few bacteria with resistance genes survive and multiply. Soon the whole population is resistant, and the antibiotic stops working.']] },
    { id: 'spread', title: 'How diseases spread', summary: 'A pathogen needs to reach new hosts.',
      say: 'For a disease to spread, the pathogen has to keep finding new people to infect.',
      keys: ['spread', 'outbreak', 'transmi', 'mosquito', 'zika', 'microcephaly', 'travel', 'epidemic', 'pandemic', 'myxomatosis', 'rabbit', 'mortality', 'decimated', 'non-vaccinated', 'precaution', 'swine flu', 'at risk'],
      pic: { base: 'replication', hi: ['release'] },
      bullets: [
        ['Getting about', 'travel, touch, water, mosquitoes.', 'Pathogens spread through the air, through touch, food and water, or carried by animals like mosquitoes, and travel takes them around the world.'],
        ['No immunity', 'and it spreads fast.', 'In a population with no immunity, like the rabbits hit by myxomatosis, or people who haven\'t been vaccinated, a disease can spread very quickly.'],
        ['Immunity builds', 'and the death rate falls.', 'Over time the survivors, and their offspring, can be immune, so the disease kills fewer of them.']] },
    { id: 'trials', title: 'Testing a new vaccine', summary: 'A fair test, on a lot of people.',
      say: 'Before a new vaccine is used, it has to be tested very carefully. Here\'s how scientists make that test fair.',
      keys: ['placebo', 'sample', 'trial', 'representative', 'reliab', 'control group', 'took part', 'conclusion', 'all over the world'],
      pic: { base: 'virus', hi: ['spike'] },
      bullets: [
        ['A control group', 'gets a placebo.', 'Half the volunteers get the vaccine. The other half, the control group, get a placebo: a harmless injection with no vaccine in it, so the two groups can be compared fairly.'],
        ['A big sample', 'from everywhere.', 'Tens of thousands of people, from many countries, take part. A large, varied sample makes the results more reliable, and true for everyone.'],
        ['Only who was tested', 'no further than the data.', 'And the conclusion can only cover the people who were tested. If no children took part, we can\'t say it works for children.']] }
  ],
  // Questions that mix several ideas, where the key words pick the wrong one.
  questions: {
    '2024-Q14b': 'antibiotics', '2022-Q11b': 'antibiotics', '2022-Q7': 'virus', '2021-Q16c': 'immunity', '2014-Q15b': 'spread',
    '2011-Q10b': 'spread', '2007-Q14c': 'immunity', '2016-Q15c': 'immunity', '2006-Q15b': 'antibiotics', 'P32-3': 'virus', 'P32-7': 'lymph'
  }
};
// For each exam question, the concept each part is about (null: none fits), chosen by reading every part and its
// marking scheme. The guide teaches a concept on the first part that needs it (bio/guide.js).
window.BioGuide.chapters[32].parts = {"S1-Q3b":["general","general"],"S2-Q1b":["trials","trials","trials","trials"],"S2-Q1e":["pathogens","spread",null,"virus"],"2026-Q16b":["virus",null,"replicate","replicate","uses","uses"],"2025-Q16d":[null,null,"lymph","lymph","immunity"],"2024-Q14b":["pathogens","antibiotics"],"2024-Q14c":["virus","virus","replicate","uses","uses"],"2024-Q16d":["general",null,"antibody","lymph","lymph"],"2023-Q11b":[null,null],"2023-Q16c":["virus","virus","uses","uses","general"],"2023-Q5e":[null],"2023-Q6e":["antibiotics"],"2022-Q11b":[null,"antibiotics","antibiotics"],"2022-Q17b":["immunity"],"2022-Q5d":["lymph"],"2022-Q7":["virus","antibody","virus","immunity","uses","uses"],"2021-Q16c":["general","lymph","lymph","general","immunity","immunity","antibody","antibiotics"],"2020-Q15b":["virus","virus","virus","replicate","immunity","immunity","immunity"],"2019-Q14b":["immunity","antibiotics"],"2018-Q13a":["virus"],"2018-Q15a":["antibiotics"],"2018-Q15b":["immunity","antibiotics"],"2017-Q14a":[null,"spread","uses","replicate","virus"],"2017-Q14b":["spread","immunity","lymph","lymph"],"2017-Q4":["pathogens","antibiotics"],"2016-Q15c":["uses","immunity"],"2015-Q14a":["general",null,"antibody","lymph","lymph"],"2015-Q15c":["pathogens"],"2015-Q3":["virus","virus","virus","uses",null,"virus","uses"],"2014-Q15b":["spread"],"2013-Q12a":["virus","virus","uses"],"2013-Q12c":["antibiotics","immunity","antibiotics"],"2012-Q15b":[null,"general","antibody","lymph","lymph"],"2011-Q10b":["spread"],"2010-Q15c":["antibiotics"],"2010-Q6":["virus","virus","replicate","immunity"],"2009-Q15c":["lymph","uses"],"2008-Q15b":["spread","spread","spread","replicate"],"2008-Q6d":["immunity"],"2007-Q14b":["virus","virus","uses","uses","antibiotics","antibiotics"],"2007-Q14c":["immunity","lymph","immunity","immunity","immunity","immunity","immunity"],"2006-Q15b":["antibiotics","antibiotics"],"2006-Q15c":["immunity"],"2006-Q6e":["antibody"],"2005-Q15a":["virus","uses","lymph","immunity"],"2005-Q15b":["pathogens","antibiotics"]};

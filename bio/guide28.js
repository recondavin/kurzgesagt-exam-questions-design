// Chapter 28, the breathing system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2).
// Each concept: keys (words that mark a question as being about it), the diagram it shows (pic: a BioArt id and the
// anchors to ring), and three bullets [bold, on screen, what the narrator says]. questions: concept for a question
// when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[28] = {
  concepts: [
    { id: 'exhale', title: 'Breathing out', summary: 'Let the muscles go, and the air follows.',
      say: 'Breathing out, when you\'re resting, takes almost no effort at all. You just let go.',
      keys: ['exhal', 'expir', 'relax', 'down and in', 'moves up', 'domes', 'pushed out', 'moves out', 'air out'],
      pic: { base: 'breathingMoves', hi: ['exhale', 'ribsDown', 'diaphragmUp'] },
      bullets: [
        ['Muscles relax', 'diaphragm and intercostals.', 'The diaphragm and the intercostal muscles between your ribs relax.'],
        ['Chest shrinks', 'ribs down and in, diaphragm up.', 'Your rib cage falls down and in, and the diaphragm springs back up into its dome. The chest gets smaller.'],
        ['Air out', 'volume down, pressure up.', 'Less volume means more pressure inside the lungs than outside, so the air is pushed out.']] },
    { id: 'inhale', title: 'Breathing in', summary: 'Make the chest bigger, and air rushes in.',
      say: 'Your lungs have no muscles of their own. So how do they fill with air?',
      keys: ['inhal', 'inspir', 'diaphragm', 'intercostal', 'rib', 'volume', 'pressure', 'contract', 'muscles directly involved'],
      pic: { base: 'breathingMoves', hi: ['inhale', 'ribsUp', 'diaphragmDown'] },
      bullets: [
        ['Muscles contract', 'the brain sends the signal.', 'Your brain sends impulses to two sets of muscles: the diaphragm under your lungs, and the intercostal muscles between your ribs. Both contract.'],
        ['Chest grows', 'diaphragm down, ribs up and out.', 'The diaphragm flattens and moves down, and the rib cage swings up and out. The space inside your chest gets bigger.'],
        ['Air rushes in', 'volume up, pressure down.', 'More volume means lower pressure inside the lungs than in the air outside, so air rushes in to fill them.']] },
    { id: 'tract', title: 'The airway: nose to alveoli', summary: 'Every breath takes the same route.',
      say: 'Every breath you take follows the same path, from your nose down into the depths of your lungs.',
      keys: ['nasal', 'nose', 'pharynx', 'larynx', 'trachea', 'cartilage', 'epiglottis', 'bronch', 'thoracic', 'thorax', 'cavity', 'breathing system', 'breathing tract', 'mucus', 'cilia'],
      pic: { base: 'breathing', hi: ['nasal', 'epiglottis', 'trachea', 'bronchus'] },
      bullets: [
        ['The nose', 'filters, warms and moistens.', 'In the nasal cavity, hairs and mucus filter the air, and it\'s warmed and moistened on its way in.'],
        ['Throat to chest', 'pharynx, larynx, trachea.', 'It passes the pharynx and the larynx, your voice box, into the trachea. Rings of cartilage hold the trachea open, and the epiglottis closes over it when you swallow.'],
        ['Into the lungs', 'bronchi, bronchioles, alveoli.', 'The trachea splits into two bronchi, which branch into thousands of bronchioles, ending in tiny air sacs: the alveoli. It all sits in your chest, the thoracic cavity.']] },
    { id: 'alveolus', title: 'The alveolus: built for diffusion', summary: 'Thin, moist and huge, all at once.',
      say: 'Deep in your lungs are hundreds of millions of tiny air sacs. This is where the air finally meets your blood.',
      keys: ['alveol', 'surface area', 'moist', 'thin', 'one cell', 'capillar', 'diffus', 'gas exchange', 'gaseous exchange', 'network', 'close contact', 'proximity'],
      pic: { base: 'alveolus', hi: ['alveolus', 'wall', 'capillary'] },
      bullets: [
        ['Diffusion', 'high to low concentration.', 'Oxygen moves from the air into your blood, and carbon dioxide moves the other way, by diffusion: from where there\'s a lot of it to where there\'s less.'],
        ['Thin and moist', 'one cell thick.', 'The wall of each alveolus is just one cell thick, and lined with moisture for the gases to dissolve in. So the distance is tiny.'],
        ['Huge and busy', 'big surface, many capillaries.', 'Together the alveoli have a huge surface area, and each one is wrapped in a dense net of capillaries that keeps carrying the oxygen away.']] },
    { id: 'transport', title: 'Carrying the gases', summary: 'Oxygen rides on red blood cells.',
      say: 'Once the gases are in your blood, they need a ride.',
      keys: ['haemoglobin', 'hydrogencarbonate', 'bicarbonate', 'plasma', 'red blood', 'pulmonary', 'aorta', 'venous', 'arterial', 'mitochondri', 'respiration', 'transported', 'concentration'],
      pic: { base: 'alveolus', hi: ['rbc', 'arteriole', 'venule'] },
      bullets: [
        ['Oxygen', 'joins haemoglobin.', 'Oxygen joins haemoglobin inside your red blood cells, forming oxyhaemoglobin, and is carried to every cell in your body.'],
        ['Carbon dioxide', 'mostly in the plasma.', 'Carbon dioxide, made by respiration in your cells\' mitochondria, travels back mostly dissolved in the plasma, as hydrogencarbonate.'],
        ['The odd ones out', 'pulmonary artery and vein.', 'Usually arteries carry oxygen-rich blood. But the pulmonary artery carries blood low in oxygen to the lungs, and the pulmonary vein brings oxygen-rich blood back.']] },
    { id: 'control', title: 'Carbon dioxide sets the pace', summary: 'Your brain watches the carbon dioxide.',
      say: 'You don\'t have to think about breathing. Something else is keeping count.',
      keys: ['medulla', 'brain', 'co2', 'carbon dioxide', 'acid', ' ph', 'rate of breathing', 'breathing rate', 'deeper', 'faster', 'trigger'],
      pic: { base: 'breathing', hi: ['diaphragm', 'intercostal'] },
      bullets: [
        ['More carbon dioxide', 'makes the blood acidic.', 'When you exercise, your muscles make more carbon dioxide, and it makes your blood more acidic.'],
        ['The medulla', 'notices.', 'A part of your brain called the medulla oblongata detects the change.'],
        ['Faster and deeper', 'impulses to the muscles.', 'It sends impulses to your diaphragm and intercostal muscles, so you breathe faster and deeper, until the carbon dioxide is back to normal.']] },
    { id: 'exercise', title: 'Exercise and breathing rate', summary: 'The investigation: measure, exercise, measure again.',
      say: 'You can see all of this happen in your own body, with a simple experiment.',
      keys: ['exercise', 'pulse', 'at rest', 'resting', 'recovery', 'per minute', 'heart rate', 'spirometer', 'athlete', 'fit', 'investigation', 'average'],
      pic: { base: 'breathingMoves', hi: ['inhale', 'exhale'] },
      bullets: [
        ['Resting rate first', 'that\'s the control.', 'First, measure the breathing rate or pulse at rest. That\'s your control, to compare with.'],
        ['Count and repeat', 'breaths per minute, then average.', 'Count the breaths or beats for a set time, work out the rate per minute, and repeat it to get an average.'],
        ['After exercise', 'it rises: muscles need more energy and oxygen, and make more CO₂.', 'After exercise the rate rises, because the muscles need more oxygen and make more carbon dioxide. A fitter person rises less and gets back to resting sooner.']] }
  ],
  // Questions whose key words point at the wrong idea.
  questions: {
    '2019-Q6': 'alveolus',     // the diagram and the biggest part are the alveolus; the disorder part only outvotes it on points
    '2012-Q15c': 'alveolus',   // the lungs' part in homeostasis: excreting carbon dioxide by gas exchange
    '2011-Q8b': 'exercise'     // why heart and breathing rates rise in exercise
  }
};
// For each exam question, the concept each part is about (null: none fits), chosen by reading every part and its
// marking scheme. The guide teaches a concept on the first part that needs it (bio/guide.js).
window.BioGuide.chapters[28].parts = {"S1-Q3a":["alveolus","alveolus","alveolus"],"S1-Q3c":["transport","transport","transport",null,"control"],"S1-Q3d":["inhale",null,"exercise","control"],"S2-Q5a":["transport"],"2026-Q3":["tract","tract","tract","inhale","inhale","inhale","inhale"],"2025-Q16b":["alveolus","alveolus","alveolus","alveolus","inhale","exhale",null],"2023-Q17c":["alveolus","inhale"],"2021-Q16d":["alveolus","alveolus","control","control","control","inhale"],"2019-Q6":["transport","alveolus",null],"2017-Q15a":["inhale",null,null],"2016-Q8b":["exercise","exercise","exercise","exercise"],"2014-Q12b":["tract","inhale"],"2014-Q12c":["transport","alveolus","transport","transport","control"],"2014-Q9b":["exercise","exercise"],"2012-Q15c":["alveolus"],"2011-Q8b":["exercise"],"2010-Q7a":["tract"],"2009-Q13c":["alveolus","alveolus",null,"control"],"2007-Q13a":["transport","transport"],"2007-Q13b":["tract","tract","inhale"],"2007-Q13c":["alveolus","alveolus",null,null]};

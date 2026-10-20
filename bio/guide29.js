// Chapter 29, the urinary system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2).
// Each concept: keys (words that mark a question as being about it), the diagram it shows (pic: a BioArt id and the
// anchors to ring), and three bullets [bold, on screen, what the narrator says]. questions: concept for a question
// when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[29] = {
  concepts: [
    { id: 'adh', title: 'ADH: the water dial', summary: 'Your brain decides how much water to keep.',
      say: 'Your kidneys don\'t decide on their own how much water to keep. Your brain turns the dial.',
      keys: ['adh', 'vasopressin', 'anti-diuretic', 'antidiuretic', 'pituitary', 'hypothalamus', 'permeab', 'dehydrat', 'concentrated urine', 'dilute'],
      pic: { base: 'nephron', hi: ['duct', 'dct'] },
      bullets: [
        ['Short of water', 'the hypothalamus notices.', 'When you\'re short of water, after sweating or not drinking enough, your blood gets more concentrated. A part of your brain called the hypothalamus notices.'],
        ['More ADH', 'from the pituitary gland.', 'It gets the pituitary gland to release more of a hormone called ADH into the blood.'],
        ['Leakier ducts', 'more water goes back.', 'ADH makes the collecting ducts more permeable, so more water goes back into the blood. You make a little concentrated urine. Drink a lot, and the opposite happens.']] },
    { id: 'loop', title: 'The loop of Henle: saving water', summary: 'A salty medulla pulls the water out.',
      say: 'The loop of Henle is the kidney\'s water-saving trick.',
      keys: ['henle', 'loop', 'desert', 'camel', 'longer in', 'descending', 'ascending'],
      pic: { base: 'nephron', hi: ['loop', 'descending', 'ascending'] },
      bullets: [
        ['Salty medulla', 'the loop pumps salt out.', 'As it dips down into the medulla, the loop pumps salt out around itself, making the medulla very salty.'],
        ['Osmosis', 'water follows the salt.', 'Water then leaves the tubule by osmosis, drawn towards all that salt, and goes back into the blood.'],
        ['Desert animals', 'have longer loops.', 'Camels and desert rats have extra long loops, so they save more water and make very concentrated urine.']] },
    { id: 'reabsorb', title: 'Reabsorption: taking back the good stuff', summary: 'The proximal tubule rescues what you need.',
      say: 'Filtering is messy. Lots of useful things get pushed out too, so the kidney takes them back.',
      keys: ['reabsor', 'proximal', 'pct', 'glucose', 'amino', 'microvill', 'active transport', 'mitochondria'],
      pic: { base: 'nephron', hi: ['pct'] },
      bullets: [
        ['All the glucose', 'and amino acids go back.', 'In the proximal convoluted tubule, all of the glucose and amino acids are taken back into the blood.'],
        ['Active transport', 'which needs energy.', 'This is done by active transport, which needs energy, so the cells here are packed with mitochondria.'],
        ['Microvilli', 'a huge surface area.', 'Their walls are folded into microvilli, which gives a huge surface area to take things back through.']] },
    { id: 'filter', title: 'Filtration: squeezing the blood', summary: 'High pressure pushes small molecules out.',
      say: 'It all starts with a squeeze.',
      keys: ['filtrat', 'filter', 'glomerul', 'bowman', 'afferent', 'efferent', 'pressure', 'capsule'],
      pic: { base: 'nephron', hi: ['glomerulus', 'capsule', 'afferent', 'efferent'] },
      bullets: [
        ['Narrow exit', 'efferent narrower than afferent.', 'Blood comes into the glomerulus through a wide vessel, the afferent arteriole, and leaves through a narrower one, the efferent arteriole. That squeeze builds up pressure.'],
        ['Pushed out', 'water, glucose, salts, urea.', 'The pressure pushes small molecules out of the blood and into Bowman\'s capsule: water, glucose, salts, amino acids and urea.'],
        ['Too big', 'cells and proteins stay.', 'Blood cells and proteins are too big to fit through, so they stay in the blood. Protein in urine is a sign that something is wrong.']] },
    { id: 'urea', title: 'Where urea comes from', summary: 'Spare protein becomes waste.',
      say: 'Urea starts its journey somewhere you might not expect: the liver.',
      keys: ['urea', 'deaminat', 'liver', 'protein'],
      pic: { base: 'urinary', hi: ['kidney', 'renalArtery'] },
      bullets: [
        ['Spare amino acids', 'can\'t be stored.', 'Your body can\'t store spare amino acids, so the liver breaks them down. This is called deamination.'],
        ['Urea', 'is made in the liver.', 'The part with nitrogen becomes urea, which travels in the blood to the kidneys.'],
        ['Filtered out', 'and leaves in urine.', 'There it\'s filtered out of the blood, and leaves the body in urine.']] },
    { id: 'failure', title: 'When kidneys fail', summary: 'A machine or a new kidney takes over.',
      say: 'Without working kidneys, waste and water would build up in the blood.',
      keys: ['dialysis', 'transplant', 'kidney failure', 'treatment'],
      pic: { base: 'kidney', hi: ['cortex', 'medulla'] },
      bullets: [
        ['Dialysis', 'a machine filters the blood.', 'In dialysis, blood flows through a machine that does the kidney\'s filtering, a few times a week.'],
        ['Transplant', 'a kidney from a donor.', 'A transplant gives the person a healthy kidney from a donor, usually a close match.'],
        ['Why it matters', 'waste and water build up.', 'Either way, the goal is the same: remove urea and keep the water and salt balance right.']] },
    { id: 'inside', title: 'Inside a kidney', summary: 'Three zones, each with a job.',
      say: 'Cut a kidney in half, and you can see three different zones.',
      keys: ['cortex', 'medulla', 'pelvis', 'pyramid', 'section through', 'nephron'],
      pic: { base: 'kidney', hi: ['cortex', 'medulla', 'pelvis'] },
      bullets: [
        ['Cortex', 'the outer layer: filtering.', 'The outer layer is the cortex. That\'s where the filtering happens, in about a million tiny tubes called nephrons.'],
        ['Medulla', 'the pyramids: saving water.', 'Inside is the medulla, made of cone-shaped pyramids. The long loops of the nephrons dip down here to save water.'],
        ['Pelvis', 'collects the urine.', 'In the middle is the pelvis, a funnel that collects the urine and pours it into the ureter.']] },
    { id: 'organs', title: 'The urinary system', summary: 'Two kidneys clean your blood, all day.',
      say: 'Your urinary system is small, but it cleans all of your blood many times a day.',
      keys: ['ureter', 'urethra', 'bladder', 'renal artery', 'renal vein', 'urinary system', 'sphincter'],
      pic: { base: 'urinary', hi: ['kidney', 'ureter', 'bladder', 'urethra'] },
      bullets: [
        ['Kidneys', 'clean the blood.', 'Blood arrives at each kidney in the renal artery, gets cleaned, and leaves in the renal vein.'],
        ['Ureters', 'carry urine down.', 'The waste becomes urine, which trickles down two thin tubes, the ureters, to the bladder.'],
        ['Bladder and urethra', 'store it, then let it out.', 'The bladder stores it until a ring of muscle, the sphincter, relaxes and lets it out through the urethra.']] },
    { id: 'homeo', title: 'Homeostasis and excretion', summary: 'Keeping the inside of you steady.',
      say: 'This chapter is really about one big idea: keeping your insides steady.',
      keys: ['homeosta', 'internal environment', 'constant', 'osmoregul', 'excret', 'egest', 'metabol', 'vasoconstrict', 'sweat'],
      pic: { base: 'urinary', hi: ['kidney'] },
      bullets: [
        ['Homeostasis', 'a constant internal environment.', 'Homeostasis means keeping your internal environment constant: the same temperature, the same water and salt, whatever is happening outside.'],
        ['Excretion', 'removing waste from metabolism.', 'Excretion is getting rid of waste made by your own cells, like urea and carbon dioxide.'],
        ['Not egestion', 'that\'s undigested food.', 'Don\'t mix it up with egestion. That\'s just getting rid of food you never digested.']] }
  ]
};
// For each exam question, the concept each part is about (null: none fits), chosen by reading every part and its
// marking scheme. The guide teaches a concept on the first part that needs it (bio/guide.js).
window.BioGuide.chapters[29].parts = {"S1-Q1e":[null,"filter","filter","loop"],"2026-Q17b":["homeo",null],"2026-Q17c":["homeo","organs","filter","filter"],"2025-Q17c":["homeo","adh","adh","adh","adh",null],"2024-Q17c":["homeo",null,"filter","reabsorb"],"2023-Q17c":["organs"],"2023-Q6d":["adh"],"2022-Q15a":["homeo"],"2022-Q15b":[null,"inside","inside","filter","reabsorb","adh","organs"],"2021-Q15a":["homeo"],"2020-Q13a":["homeo",null,"homeo"],"2020-Q13b":["urea","urea","inside",null],"2020-Q13c":["filter","reabsorb","adh"],"2018-Q6":[null,"adh","adh","adh","adh","failure"],"2017-Q14c":["filter"],"2017-Q15a":["homeo",null],"2016-Q12a":["homeo"],"2016-Q12b":["homeo","urea","adh"],"2016-Q12c":["homeo"],"2016-Q15a":["organs"],"2012-Q15c":["homeo",null],"2011-Q12a":["homeo"],"2011-Q12b":["inside","inside","organs",null,"urea",null],"2011-Q12c":["filter","filter","reabsorb"],"2010-Q15c":["adh"],"2009-Q15c":["homeo"],"2008-Q13a":["homeo","urea"],"2008-Q13b":[null,"organs","inside","reabsorb","filter","filter"],"2008-Q13c":["adh","adh","adh","adh"],"2007-Q15c":["homeo"],"2006-Q13b":["filter","filter","filter","reabsorb","adh"],"2006-Q6b":["organs"],"2005-Q1f":["homeo"],"2005-Q3a":["urea"],"2004-Q12a":["homeo"],"2004-Q12b":[null,"filter"]};

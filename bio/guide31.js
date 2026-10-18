// Chapter 31, the circulatory system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2).
// Each concept: keys (words that mark a question as being about it), the diagram it shows (pic: a BioArt id and the
// anchors to ring), and three bullets [bold, on screen, what the narrator says]. questions: concept for a question
// when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[31] = {
  concepts: [
    { id: 'heart', title: 'The heart: two pumps in one', summary: 'Four chambers, kept apart by a wall.',
      say: 'Your heart is really two pumps, side by side, beating together.',
      keys: ['atri', 'ventricle', 'septum', 'chamber', 'tricuspid', 'bicuspid', 'mitral', 'semilunar', 'semi-lunar', 'valve', 'backflow', 'back flow', 'lub', 'dub', 'sounds'],
      pic: { base: 'heart', hi: ['rightAtrium', 'leftAtrium', 'rightVentricle', 'leftVentricle', 'septum'] },
      bullets: [
        ['Four chambers', 'two atria on top, two ventricles below.', 'Blood comes into the two atria at the top, then drops into the two ventricles below, which do the hard pumping.'],
        ['The septum', 'keeps the two sides apart.', 'A wall of muscle called the septum keeps the two sides apart, so oxygenated and deoxygenated blood never mix. The left ventricle has the thickest wall, because it pumps blood all the way round the body.'],
        ['Valves', 'keep blood going one way.', 'The tricuspid and bicuspid valves stop blood flowing back into the atria, and the semilunar valves stop it flowing back from the arteries. The valves snapping shut make the lub-dub sound of your heartbeat.']] },
    { id: 'beat', title: 'The pacemaker: the heart\'s own rhythm', summary: 'A tiny patch of cells sets the pace.',
      say: 'Your heart doesn\'t wait to be told when to beat. It starts every beat by itself.',
      keys: ['sino', 'sa node', 'pacemaker', 'av node', 'atrioventricular', 'systole', 'diastole', 'heart cycle', 'cardiac cycle', 'impulse', 'contractile', 'mitochondria', 'tire', 'relax'],
      pic: { base: 'heart', hi: ['sa', 'av'] },
      bullets: [
        ['SA node', 'the pacemaker, in the right atrium.', 'In the wall of the right atrium there\'s a small patch of cells called the SA node: the pacemaker. It sends out an electrical impulse, and the atria contract.'],
        ['AV node', 'passes it on to the ventricles.', 'The AV node, low in the septum, picks up the impulse and passes it down to the ventricles, so they contract just after the atria.'],
        ['Systole and diastole', 'contracting, then relaxing.', 'When heart muscle contracts, that\'s systole. When it relaxes and fills up again, that\'s diastole. Heart muscle never tires, and it\'s packed with mitochondria for the energy it needs.']] },
    { id: 'circuits', title: 'Two circuits: the double circulation', summary: 'Through the heart twice on every trip.',
      say: 'Follow a single red blood cell, and you\'ll find it passes through your heart twice on every trip around your body.',
      keys: ['circuit', 'pulmonary', 'systemic', 'double', 'aorta', 'vena cava', 'renal', 'pathway', 'returns blood', 'oxygenated', 'jugular', 'subclavian'],
      pic: { base: 'circulation', hi: ['rightSide', 'leftSide', 'lungs', 'aorta'] },
      bullets: [
        ['Pulmonary circuit', 'right side to the lungs and back.', 'The right ventricle pumps blood along the pulmonary artery to the lungs, where it picks up oxygen. It comes back in the pulmonary vein to the left atrium.'],
        ['Systemic circuit', 'left side to the body and back.', 'The left ventricle pumps that oxygenated blood into the aorta and out to the whole body, at a much higher pressure. It returns, low in oxygen, through the vena cava.'],
        ['Named vessels', 'renal, hepatic, coronary.', 'Each organ has its own vessels, like the renal artery and vein for the kidneys. Arteries always carry blood away from the heart, and veins always bring it back.']] },
    { id: 'portal', title: 'The hepatic portal vein', summary: 'Food goes to the liver first.',
      say: 'Everything you absorb from a meal takes a detour before it reaches the rest of your body.',
      keys: ['portal', 'hepatic', 'liver', 'digest', 'nutrient', 'intestin', 'villi', 'villus', 'absorbed'],
      pic: { base: 'portal-system', hi: ['portal', 'liver', 'intestine'] },
      bullets: [
        ['From the intestine', 'digested food enters the blood.', 'Digested food, like glucose and amino acids, is absorbed into the blood in the villi of the small intestine.'],
        ['Hepatic portal vein', 'carries it to the liver.', 'The hepatic portal vein carries that blood straight to the liver. It\'s called a portal vein because it runs from one set of capillaries to another, without going through the heart.'],
        ['The liver', 'sorts it, then sends it on.', 'The liver stores spare glucose as glycogen and deals with what isn\'t needed. It also gets oxygenated blood from the hepatic artery, and the hepatic vein takes blood away.']] },
    { id: 'vessels', title: 'Arteries, veins and capillaries', summary: 'Three kinds of tube, three different jobs.',
      say: 'Your blood travels through three very different kinds of tube.',
      keys: ['arteries', 'arteriole', 'veins', 'venule', 'capillar', 'lumen', 'wall', 'elastic', 'muscular', 'one cell', 'transverse', 'longitudinal'],
      pic: { base: 'vessels', hi: ['artery', 'vein', 'capillary'] },
      bullets: [
        ['Arteries', 'thick, elastic, high pressure.', 'Arteries carry blood away from the heart. Their walls are thick, with muscle and elastic fibres to take the high pressure, and their lumen is narrow.'],
        ['Veins', 'thin walls, wide lumen, valves.', 'Veins bring blood back to the heart at low pressure. They have thin walls, a wide lumen and valves, and the squeeze of the muscles around them keeps the blood moving.'],
        ['Capillaries', 'one cell thick: for exchange.', 'Capillaries link the two. Their walls are just one cell thick, so oxygen, food and waste pass easily between the blood and the cells.']] },
    { id: 'pressure', title: 'Pulse and blood pressure', summary: 'You can feel every heartbeat in an artery.',
      say: 'Press two fingers gently on your wrist, and you can feel your heart at work.',
      keys: ['pulse', 'blood pressure', 'heart rate', 'pulse rate', 'breathing rate', 'exercise', 'recovery', 'resting', 'beats per minute', 'bpm', 'wrist', 'athlete', 'measured', 'force'],
      pic: { base: 'vessels', hi: ['artery', 'arteryWall'] },
      bullets: [
        ['Pulse', 'an artery stretching with each beat.', 'Your pulse is an artery stretching and relaxing each time the left ventricle pumps. You can feel it where an artery runs close to the surface, like your wrist or your neck.'],
        ['Blood pressure', 'the push on the vessel walls.', 'Blood pressure is the force the blood puts on the walls of the blood vessels. It\'s highest in the arteries, and it falls as the blood moves on through the capillaries into the veins.'],
        ['Exercise', 'a faster rate, then recovery.', 'When you exercise, your heart rate rises to bring more oxygen to your muscles and carry away carbon dioxide. A fitter person\'s rate rises less, and recovers faster.']] },
    { id: 'dissection', title: 'Dissecting a heart', summary: 'What a real heart shows you.',
      say: 'A real sheep\'s heart is the best way to see how all of this fits together.',
      keys: ['dissect', 'scalpel', 'incision', 'instrument', 'expose', 'ventral', 'firmer', 'identif', 'cut', 'board'],
      pic: { base: 'dissection', hi: ['cutRight', 'cutArtery', 'coronary'] },
      bullets: [
        ['Find the front', 'the coronary artery groove.', 'First, find the front, or ventral side: a groove with the coronary artery runs down it. The left side feels firmer, because its wall is thicker.'],
        ['Cut with a scalpel', 'down the right side.', 'On a dissecting board, cut carefully with a scalpel down the right side, to open the right atrium and ventricle. You\'ll see the tricuspid valve between them.'],
        ['Semilunar valves', 'cut into the artery.', 'To find a semilunar valve, cut open the pulmonary artery or the aorta near its base. Take care with the blade, and wash your hands afterwards.']] },
    { id: 'redcells', title: 'Red blood cells: built to carry oxygen', summary: 'No nucleus, lots of haemoglobin.',
      say: 'Red blood cells are some of the simplest cells in your body, and that\'s exactly what makes them so good at their job.',
      keys: ['red blood cell', 'red cell', 'haemoglobin', 'biconcave', 'concave', 'nucleus', 'iron', 'marrow', 'mitosis', 'oxygen', 'flexible', 'spleen', 'carbon dioxide'],
      pic: { base: 'blood', hi: ['rbc', 'rbcSide'] },
      bullets: [
        ['Haemoglobin', 'with iron, picks up oxygen.', 'They\'re packed with haemoglobin, a protein containing iron. It picks up oxygen in the lungs and lets it go in the tissues. Most carbon dioxide travels back in the plasma.'],
        ['No nucleus', 'more room, but a short life.', 'A mature red blood cell has no nucleus, which leaves more room for haemoglobin. But it can\'t divide or repair itself, so it only lives about 120 days. New ones are made in the bone marrow.'],
        ['Biconcave and flexible', 'a big surface for gases.', 'Their biconcave shape gives a large surface for oxygen to pass through, and they\'re flexible enough to squeeze through the narrowest capillaries.']] },
    { id: 'blood', title: 'What blood is made of', summary: 'Cells floating in a busy river.',
      say: 'Blood looks like a simple red liquid, but it\'s really a crowd of different cells floating in a busy river.',
      keys: ['plasma', 'white blood', 'lymphocyte', 'monocyte', 'phagocyt', 'platelet', 'clot', 'transport medium', 'hormone', 'urea', 'antibod', 'glomerular filtrate', 'composition'],
      pic: { base: 'blood', hi: ['plasma', 'lymphocyte', 'monocyte', 'platelets'] },
      bullets: [
        ['Plasma', 'the liquid that carries almost everything.', 'Just over half of your blood is plasma, a watery liquid. It carries dissolved food, hormones, urea, carbon dioxide and heat around the body.'],
        ['White blood cells', 'fight infection.', 'White blood cells have a nucleus and fight infection. Phagocytes, like monocytes, swallow germs, and lymphocytes make antibodies.'],
        ['Platelets', 'help blood to clot.', 'Platelets are tiny pieces of cells. At a cut, they help the blood to clot, which stops the bleeding and keeps germs out.']] },
    { id: 'lymph', title: 'The lymphatic system: the body\'s drain', summary: 'Collecting the fluid that leaks out.',
      say: 'Every day, fluid leaks out of your capillaries. Something has to bring it back.',
      keys: ['lymph vessel', 'lymph node', 'lymphatic', 'lymph ', 'tissue fluid', 'lacteal', 'thymus', 'tonsil', 'adenoid', 'excess fluid', 'ecf', 'fluid', 'filter', 'fats', 'defence'],
      pic: { base: 'capillaries', hi: ['lymph', 'fluid'] },
      bullets: [
        ['Tissue fluid', 'leaks out and bathes the cells.', 'Blood pressure forces fluid out of the capillaries. This tissue fluid bathes your cells, bringing them food and oxygen.'],
        ['Lymph vessels', 'drain the extra back to the blood.', 'Most of it goes back into the capillaries. The rest drains into lymph vessels, where it\'s called lymph, and it rejoins the blood in veins near the heart.'],
        ['Lymph nodes', 'filter it and fight infection.', 'On the way, lymph nodes filter out bacteria, and the lymphocytes there help fight infection. Lacteals in the villi carry absorbed fats into the lymph too.']] },
    { id: 'coronary', title: 'The heart\'s own blood supply', summary: 'The coronary arteries feed the heart muscle.',
      say: 'Your heart pumps blood to every part of you, including itself.',
      keys: ['coronary', 'heart attack', 'blocked', 'cholesterol', 'smok', 'diet', 'heart muscle', 'cardiac muscle'],
      pic: { base: 'dissection', hi: ['coronary', 'aorta'] },
      bullets: [
        ['Coronary arteries', 'branch off the aorta.', 'The coronary arteries branch off the aorta, right at its base, and spread over the surface of the heart, bringing oxygen and food to the heart muscle.'],
        ['A blockage', 'fat, then a clot.', 'Fatty deposits of cholesterol can build up inside a coronary artery and narrow it. A blood clot can then block it completely.'],
        ['Heart attack', 'muscle without oxygen dies.', 'The heart muscle beyond the block gets no oxygen, can\'t respire, and dies. That\'s a heart attack. Not smoking, a healthy diet and regular exercise all lower the risk.']] },
    { id: 'groups', title: 'Blood groups', summary: 'Markers on the surface of your red cells.',
      say: 'Your red blood cells carry tiny markers on their surface, and they decide whose blood you can safely receive.',
      keys: ['blood group', 'abo ', 'rhesus', 'transfusion', 'antigen', 'agglutin', 'donor', 'grouping', 'compatib', 'group o', 'group a', 'anti-b', 'pregnan', 'placenta'],
      pic: { base: 'blood', hi: ['rbc'] },
      bullets: [
        ['ABO', 'antigens A, B, both or neither.', 'In the ABO system, your red cells carry antigen A, antigen B, both, or neither. That makes you group A, B, AB or O.'],
        ['Antibodies', 'against the ones you don\'t have.', 'Your plasma has antibodies against the antigens you don\'t have. Give someone the wrong group, and their antibodies make the donated cells clump together.'],
        ['Rhesus', 'positive or negative.', 'The Rhesus system is a second marker. It matters in pregnancy, when a Rhesus negative mother carries a Rhesus positive baby.']] }
  ],
  // Questions whose key words pull towards a side topic.
  questions: {
    'S2-Q5a': 'heart', '2026-Q17a': 'vessels', '2025-Q16b': 'redcells', '2023-Q17c': 'circuits', '2016-Q15a': 'vessels', '2014-Q12c': 'vessels',
    '2014-Q9b': 'dissection', '2007-Q13a': 'circuits', '2004-Q9': 'dissection', 'P31-2': 'groups', 'P31-5': 'circuits'
  }
};

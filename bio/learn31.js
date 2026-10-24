// Chapter 31, the circulatory system: what the games and memory drills use. Written to the new course's learning
// outcomes 2.6.9-2.6.13 (the heart, the two circuits and the portal system, the pacemaker, pulse and blood pressure,
// the blood and blood groups, arteries, veins and capillaries), with the lymphatic system from the old course's papers.
window.BioLearn = window.BioLearn || {};
window.BioLearn[31] = {
  // Red cell run: through the heart and its valves to the lungs, then out to the body (bio/act31.js).
  action: { name: 'Red cell run', what: 'Be a red blood cell: find your way through the heart and its valves, load up with oxygen in the lungs, then deliver it.' },

  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'Blood through the heart', steps: ['Deoxygenated blood arrives from the body in the vena cava', 'It enters the right atrium', 'It passes the tricuspid valve into the right ventricle', 'The right ventricle pumps it through a semilunar valve into the pulmonary artery', 'It picks up oxygen in the lungs and returns in the pulmonary vein to the left atrium', 'It passes the bicuspid valve into the left ventricle, which pumps it into the aorta'],
        why: '<b>Deoxygenated</b> blood arrives from the body in the <b>vena cava</b> and enters the <b>right atrium</b>. It passes the <b>tricuspid valve</b> into the <b>right ventricle</b>. The right ventricle pumps it through a <b>semilunar valve</b> into the <b>pulmonary artery</b>. It picks up <b>oxygen</b> in the <b>lungs</b> and returns in the <b>pulmonary vein</b> to the <b>left atrium</b>, then passes the <b>bicuspid valve</b> into the <b>left ventricle</b>, which pumps it into the <b>aorta</b>.' },
      { title: 'One heartbeat', steps: ['The SA node (pacemaker) in the right atrium sends out an impulse', 'The impulse spreads across both atria', 'The atria contract, pushing blood into the ventricles', 'The AV node picks up the impulse', 'The impulse travels down the septum to the ventricles', 'The ventricles contract and push blood into the arteries'],
        why: 'The <b>SA node</b> (<b>pacemaker</b>) in the <b>right atrium</b> sends out an <b>impulse</b>. The impulse spreads across both <b>atria</b>, and the atria <b>contract</b>, pushing blood into the <b>ventricles</b>. The <b>AV node</b> picks up the impulse. The impulse travels down the <b>septum</b> to the ventricles, and the ventricles contract and push blood into the <b>arteries</b>.' },
      { title: 'Tissue fluid and lymph', steps: ['Blood arrives in a capillary under pressure', 'Fluid is forced out through the thin capillary walls', 'This tissue fluid bathes the cells', 'Oxygen and food diffuse into the cells; waste diffuses out', 'Most of the fluid goes back into the capillaries', 'The extra fluid drains into lymph vessels and returns to the blood'],
        why: 'Blood arrives in a <b>capillary</b> under <b>pressure</b>, so fluid is forced out through the thin <b>capillary walls</b>. This <b>tissue fluid</b> bathes the <b>cells</b>: <b>oxygen</b> and <b>food</b> <b>diffuse</b> into the cells and <b>waste</b> diffuses out. Most of the fluid goes back into the capillaries, and the extra fluid drains into <b>lymph vessels</b> and returns to the <b>blood</b>.' },
      { title: 'A blocked coronary artery', steps: ['Fatty deposits (cholesterol) build up in a coronary artery', 'The artery gets narrower', 'A blood clot blocks it completely', 'Part of the heart muscle gets no blood', 'Those cells get no oxygen, so they cannot respire', 'The heart muscle dies: a heart attack'],
        why: '<b>Fatty deposits</b> (<b>cholesterol</b>) build up in a <b>coronary artery</b>, and the artery gets <b>narrower</b>. A <b>blood clot</b> <b>blocks</b> it completely, so part of the <b>heart muscle</b> gets no blood. Those cells get no <b>oxygen</b>, so they cannot <b>respire</b>, and the heart muscle dies: a <b>heart attack</b>.' },
      { title: 'From the gut to the heart', steps: ['Digested food is absorbed into the blood in the villi', 'The hepatic portal vein carries it to the liver', 'The liver processes it, e.g. stores glucose as glycogen', 'The hepatic vein carries the blood out of the liver', 'It joins the vena cava', 'It returns to the right atrium of the heart'],
        why: 'Digested food is <b>absorbed</b> into the blood in the <b>villi</b>, and the <b>hepatic portal vein</b> carries it to the <b>liver</b>. The liver processes it, e.g. stores <b>glucose</b> as <b>glycogen</b>. The <b>hepatic vein</b> carries the blood out of the liver; it joins the <b>vena cava</b> and returns to the <b>right atrium</b> of the heart.' }
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
      { id: 'leftwall', cue: 'The left ventricle', statement: 'The left ventricle has the thickest wall of the four chambers.',
        steps: [
          [['It has to pump blood all the way round the body (the systemic circuit), so it needs more muscle.'], ['The heart is a very important organ.', 'f'], ['Veins carry blood back to the heart.', 'o']],
          [['The right ventricle only pumps blood to the nearby lungs, so its wall is thinner and its pressure is lower.'], ['The other side is different.', 'v'], ['The right ventricle pumps blood to the body at high pressure.', 'w', 'The right ventricle pumps to the lungs, at lower pressure. The left ventricle pumps to the body.']]
        ] },
      { id: 'valves', cue: 'Valves in the heart', statement: 'Valves in the heart keep the blood flowing in one direction.',
        steps: [
          [['The tricuspid and bicuspid valves stop blood flowing back from the ventricles into the atria.'], ['Valves are found in lots of places.', 'v'], ['The lungs exchange oxygen and carbon dioxide.', 'o']],
          [['Semilunar valves at the base of the aorta and pulmonary artery stop blood flowing back into the ventricles.'], ['There are some other valves as well.', 'v'], ['Semilunar valves are found between the atria and the ventricles.', 'w', 'Semilunar valves are at the base of the aorta and pulmonary artery. The tricuspid and bicuspid are between the atria and ventricles.']]
        ] },
      { id: 'pacemaker', cue: 'The pacemaker', statement: 'The heartbeat is started by the pacemaker (SA node).',
        steps: [
          [['It is in the wall of the right atrium and sends out electrical impulses that make the atria contract.'], ['It is in charge of the heart.', 'v'], ['The brain controls the breathing rate.', 'o']],
          [['The AV node passes the impulse down the septum to the ventricles, so they contract just after the atria.'], ['Then the rest of the heart beats.', 'v'], ['The impulse goes straight from the SA node into the aorta.', 'w', 'The AV node passes the impulse on to the ventricles. The aorta is a blood vessel, not part of the heart\'s wiring.']]
        ] },
      { id: 'artery', cue: 'Arteries', statement: 'Arteries carry blood away from the heart at high pressure.',
        steps: [
          [['They have thick walls of muscle and elastic fibres to withstand the pressure.'], ['Arteries are a type of blood vessel.', 'f'], ['Plasma is mostly water.', 'o']],
          [['They have a narrow lumen and no valves, except at the base of the aorta and pulmonary artery.'], ['They are shaped differently from veins.', 'v'], ['Arteries have valves all along them to stop backflow.', 'w', 'Veins have valves along them. Arteries have none except at their base.']]
        ] },
      { id: 'vein', cue: 'Veins', statement: 'Veins carry blood back to the heart at low pressure.',
        steps: [
          [['They have thin walls and a wide lumen, so the blood flows easily.'], ['Veins are important for the circulation.', 'f'], ['Red blood cells carry oxygen.', 'o']],
          [['They have valves to stop the blood flowing backwards, helped by the squeeze of the muscles around them.'], ['They have something that helps the blood.', 'v'], ['Veins have thick muscular walls to pump the blood along.', 'w', 'Veins have thin walls. Valves and the squeeze of nearby muscles keep the blood moving.']]
        ] },
      { id: 'capillary', cue: 'Capillaries', statement: 'Capillaries are where materials pass between the blood and the cells.',
        steps: [
          [['Their walls are only one cell thick, so substances diffuse in and out easily.'], ['They are very small.', 'v'], ['The heart has four chambers.', 'o']],
          [['Oxygen and glucose pass out to the cells; carbon dioxide and wastes such as urea pass into the blood.'], ['Things go in and out.', 'v'], ['Red blood cells pass out of the capillaries into the cells.', 'w', 'Red blood cells stay in the capillaries. The oxygen they carry diffuses out.']]
        ] },
      { id: 'rbc', cue: 'Red blood cells', statement: 'Red blood cells are adapted to carry oxygen.',
        steps: [
          [['They contain haemoglobin, which picks up oxygen in the lungs and releases it in the tissues.'], ['They are red in colour.', 'f'], ['White blood cells fight infection.', 'o']],
          [['They have no nucleus and a biconcave shape, so there is more room for haemoglobin and a large surface area.'], ['They have a special shape.', 'v'], ['They have a large nucleus to control how much oxygen they take in.', 'w', 'Mature red blood cells have no nucleus, which leaves more room for haemoglobin.']]
        ] }
    ]
  },

  // Build it: after building and labelling, questions on the diagram. tap = structures (anchor names) that are right.
  build: {
    heart: [
      { q: 'Tap the chamber that pumps blood to the lungs.', tap: ['rightVentricle'] },
      { q: 'Tap the chamber with the thickest wall.', tap: ['leftVentricle', 'lvWall'] },
      { q: 'Tap the pacemaker.', tap: ['sa'] },
      { q: 'Tap the valve between the left atrium and the left ventricle.', tap: ['bicuspid'] },
      { q: 'Tap the vessel that brings oxygenated blood to the heart.', tap: ['pulmonaryVein'] },
      { q: 'Tap the wall that keeps oxygenated and deoxygenated blood apart.', tap: ['septum'] },
      { q: 'What do the semilunar valves do?', opts: ['Stop blood flowing back from the arteries into the ventricles', 'Stop blood flowing back into the atria', 'Start each heartbeat', 'Pump blood into the aorta'], a: 0 },
      { q: 'Which vessel carries deoxygenated blood away from the heart?', opts: ['The pulmonary artery', 'The pulmonary vein', 'The aorta', 'The vena cava'], a: 0 }
    ],
    dissection: [
      { q: 'Tap where you would cut to see the tricuspid valve.', tap: ['cutRight'] },
      { q: 'Tap a vessel you could cut open to find a semilunar valve.', tap: ['cutArtery', 'pulmonaryArtery', 'aorta'] },
      { q: 'Tap the coronary artery.', tap: ['coronary'] },
      { q: 'Tap the side that feels firmer.', tap: ['leftVentricle'] },
      { q: 'How do you know you are looking at the front (ventral) surface?', opts: ['The coronary artery groove runs down it', 'The aorta is on top', 'It is the darker side', 'The vena cava is at the bottom'], a: 0 },
      { q: 'Which instrument do you use to cut the heart?', opts: ['A scalpel', 'A forceps', 'A seeker', 'A dropper'], a: 0 }
    ],
    vessels: [
      { q: 'Tap the vessel with a thick muscular wall.', tap: ['artery', 'arteryWall', 'arteryLumen', 'endothelium'] },
      { q: 'Tap the vessel where materials are exchanged with the cells.', tap: ['capillary', 'capillaryWall'] },
      { q: 'Tap what stops blood flowing backwards in a vein.', tap: ['valve'] },
      { q: 'Tap the lining (endothelium).', tap: ['endothelium'] },
      { q: 'Tap a wide lumen.', tap: ['veinLumen'] },
      { q: 'Why do arteries need thick, elastic walls?', opts: ['The blood in them is at high pressure', 'They carry more oxygen', 'They exchange gases with the cells', 'They carry blood back to the heart'], a: 0 }
    ],
    capillaries: [
      { q: 'Tap the vessel bringing blood into the capillary network.', tap: ['arteriole', 'flowIn'] },
      { q: 'Tap the vessel taking blood away.', tap: ['venule', 'flowOut'] },
      { q: 'Tap the vessel that drains away extra tissue fluid.', tap: ['lymph'] },
      { q: 'Tap the liquid that bathes the cells.', tap: ['fluid'] },
      { q: 'How does the blood pressure change as blood flows from the arteriole to the venule?', opts: ['It decreases', 'It increases', 'It stays the same', 'It doubles'], a: 0 },
      { q: 'Where does lymph go back into the blood?', opts: ['Into veins near the heart', 'Into the capillaries', 'Into the kidneys', 'Into the aorta'], a: 0 }
    ],
    circulation: [
      { q: 'Tap the vessel carrying blood from the intestine to the liver.', tap: ['portal'] },
      { q: 'Tap the vessel carrying oxygenated blood back to the heart.', tap: ['pulmonaryVein'] },
      { q: 'Tap the side of the heart that pumps blood round the body.', tap: ['leftSide'] },
      { q: 'Tap where the blood picks up oxygen.', tap: ['lungs', 'pulmonaryCircuit'] },
      { q: 'Tap the main artery to the body.', tap: ['aorta'] },
      { q: 'Which circuit is at the higher pressure?', opts: ['The systemic circuit', 'The pulmonary circuit', 'The portal system', 'They are the same'], a: 0 },
      { q: 'Why is it called a double circulation?', opts: ['Blood passes through the heart twice on each trip round the body', 'There are two hearts', 'Blood goes round twice as fast', 'Each vessel has two walls'], a: 0 }
    ],
    'portal-system': [
      { q: 'Tap the vessel carrying digested food to the liver.', tap: ['portal'] },
      { q: 'Tap the vessel bringing oxygenated blood to the liver.', tap: ['hepaticArtery'] },
      { q: 'Tap the vessel taking blood out of the liver.', tap: ['hepaticVein'] },
      { q: 'Tap where glucose is stored as glycogen.', tap: ['liver'] },
      { q: 'Where does the hepatic vein take the blood?', opts: ['Into the vena cava', 'Into the aorta', 'Back to the intestine', 'To the kidneys'], a: 0 }
    ],
    blood: [
      { q: 'Tap a cell with no nucleus.', tap: ['rbc', 'rbcSide'] },
      { q: 'Tap a cell that makes antibodies.', tap: ['lymphocyte'] },
      { q: 'Tap a cell that engulfs (eats) germs.', tap: ['monocyte'] },
      { q: 'Tap what helps the blood to clot.', tap: ['platelets'] },
      { q: 'Tap the liquid part of the blood.', tap: ['plasma'] },
      { q: 'Where are red blood cells made?', opts: ['In the bone marrow', 'In the liver', 'In the heart', 'In the spleen'], a: 0 },
      { q: 'Why does a red blood cell only live for about 120 days?', opts: ['It has no nucleus, so it cannot repair itself or divide', 'It runs out of oxygen', 'It is too big for the capillaries', 'Antibodies destroy it'], a: 0 }
    ]
  },

  // Learn it: drills for the chunks you have to know word for word, or as a set.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Pulse', 'The pulse is the rhythmic expansion and contraction of an artery as blood is pumped through it.'],
        ['Blood pressure', 'Blood pressure is the force the blood exerts on the walls of the blood vessels.'],
        ['Systole', 'Systole is when the heart muscle is contracting.'],
        ['Diastole', 'Diastole is when the heart muscle is relaxing.'],
        ['Pacemaker', 'The pacemaker (SA node) is a group of cells in the wall of the right atrium that controls the heartbeat.'],
        ['Double circulation', 'A double circulation means the blood passes through the heart twice on each trip round the body.'],
        ['Portal system', 'A portal system carries blood from one capillary bed to another without going through the heart.']
      ] },
    { type: 'sort', name: 'Artery, vein or capillary?', what: 'Quick: which kind of blood vessel is it?',
      bins: ['Artery', 'Vein', 'Capillary'],
      items: [['Thick muscular wall', 0], ['Narrow lumen', 0], ['Blood at high pressure', 0], ['You can feel a pulse', 0], ['Carries blood away from the heart', 0],
        ['Thin wall, wide lumen', 1], ['Valves all along it', 1], ['Blood at low pressure', 1], ['Carries blood back to the heart', 1],
        ['Wall one cell thick', 2], ['Where materials pass to the cells', 2], ['Joins an arteriole to a venule', 2]],
      why: 'Arteries take blood away from the heart at high pressure; veins bring it back at low pressure, with valves; capillaries are where the exchange happens.' },
    { type: 'sort', name: 'Oxygenated or deoxygenated?', what: 'Which kind of blood does each one hold?',
      bins: ['Oxygenated', 'Deoxygenated'],
      items: [['Aorta', 0], ['Pulmonary vein', 0], ['Left atrium', 0], ['Left ventricle', 0], ['Hepatic artery', 0], ['Renal artery', 0],
        ['Pulmonary artery', 1], ['Vena cava', 1], ['Right atrium', 1], ['Right ventricle', 1], ['Hepatic portal vein', 1], ['Renal vein', 1]],
      why: 'The left side and the arteries to the body carry oxygenated blood. The pulmonary vessels are the odd ones out: the pulmonary artery takes deoxygenated blood to the lungs, and the pulmonary vein brings oxygenated blood back.' },
    { type: 'sort', name: 'Pulmonary or systemic?', what: 'Which circuit is it part of?',
      bins: ['Pulmonary circuit', 'Systemic circuit'],
      items: [['Pulmonary artery', 0], ['Pulmonary vein', 0], ['Lung capillaries', 0], ['Pumped by the right ventricle', 0], ['The lower-pressure circuit', 0],
        ['Aorta', 1], ['Vena cava', 1], ['Hepatic portal vein', 1], ['Renal artery', 1], ['Pumped by the left ventricle', 1], ['The higher-pressure circuit', 1]],
      why: 'The pulmonary circuit runs from the right ventricle to the lungs and back to the left atrium. The systemic circuit runs from the left ventricle round the body and back to the right atrium.' },
    { type: 'table', name: 'What each part of the blood does', what: 'Fill the table from memory: yes or no?',
      cols: ['Red cells', 'White cells', 'Platelets', 'Plasma'], choices: ['Yes', 'No'],
      rows: [['Carries oxygen', ['Yes', 'No', 'No', 'No']], ['Has a nucleus', ['No', 'Yes', 'No', 'No']], ['Fights infection', ['No', 'Yes', 'No', 'No']],
        ['Helps blood to clot', ['No', 'No', 'Yes', 'No']], ['Carries dissolved food, hormones and urea', ['No', 'No', 'No', 'Yes']], ['Made in the bone marrow', ['Yes', 'Yes', 'Yes', 'No']]],
      why: 'Red cells carry oxygen on haemoglobin and have no nucleus. White cells have a nucleus and fight infection. Platelets are cell fragments that help blood clot. Plasma is the liquid: it carries dissolved food, hormones, urea, carbon dioxide and heat.' },
    { type: 'table', name: 'ABO blood groups', what: 'Which antigens are on the red cells, and which antibodies are in the plasma?',
      cols: ['A antigen on cells', 'B antigen on cells', 'Anti-A in plasma', 'Anti-B in plasma'], choices: ['Yes', 'No'],
      rows: [['Group A', ['Yes', 'No', 'No', 'Yes']], ['Group B', ['No', 'Yes', 'Yes', 'No']], ['Group AB', ['Yes', 'Yes', 'No', 'No']], ['Group O', ['No', 'No', 'Yes', 'Yes']]],
      why: 'Your plasma has antibodies against the antigens you don\'t have. Group O cells have no A or B antigens, so O can be given to anyone; group AB plasma has no anti-A or anti-B, so AB can receive any group. Rhesus positive means the Rhesus (D) antigen is on the cells too.' }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P31-1', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What are platelets?', m: 3, n: 1, kind: 'text', pts: [{ a: 'Fragments (pieces) of cells, with no nucleus', m: 3, k: [{ w: ['fragment'], n: 1 }, { w: ['piece', 'cell'], n: 2 }] }] },
      { l: '(b)', q: 'State the role of platelets in the blood.', m: 3, n: 1, kind: 'text', pts: [{ a: 'They help the blood to clot', m: 3, k: [{ w: ['clot'], n: 1 }] }] },
      { l: '(c)', q: 'Give two reasons why blood clotting is important.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'It stops blood loss (bleeding)', m: 3, k: [{ w: ['bleed'], n: 1 }, { w: ['blood', 'loss'], n: 2 }, { w: ['lose', 'blood'], n: 2 }] },
        { a: 'It stops germs (pathogens) getting into the body', m: 3, k: [{ w: ['germ'], n: 1 }, { w: ['pathogen'], n: 1 }, { w: ['bacteri'], n: 1 }, { w: ['infec'], n: 1 }, { w: ['microb'], n: 1 }] }] }
    ] },
    { id: 'P31-2', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'A person is blood group A. Name the antigen on their red blood cells and the antibody in their plasma.', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'Antigen: A', f: 'Antigen', m: 3, k: [{ w: ['a'], n: 1 }] },
        { a: 'Antibody: anti-B', f: 'Antibody', m: 3, k: [{ w: ['b'], n: 1 }] }] },
      { l: '(b)', q: 'Why can blood of group O be given to people of any ABO group?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Its red cells have no A or B antigens, so the antibodies in the patient\'s plasma do not attack them', m: 3, k: [{ w: ['no', 'antigen'], n: 2 }, { w: ['lack', 'antigen'], n: 2 }, { w: ['without', 'antigen'], n: 2 }] }] },
      { l: '(c)', q: 'What does Rhesus positive mean?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The Rhesus (D) antigen is on the red blood cells', m: 3, k: [{ w: ['rhesus', 'antigen'], n: 2 }, { w: ['rhesus', 'protein'], n: 2 }, { w: ['rh', 'antigen'], n: 2 }, { w: ['rhesus', 'factor', 'red'], n: 3 }] }] },
      { l: '(d)', q: 'Explain why knowing the Rhesus group matters in pregnancy.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'A Rhesus negative mother can make antibodies against her Rhesus positive baby\'s blood', m: 3, k: [{ w: ['negative', 'mother', 'antibod'], n: 3 }, { w: ['mother', 'make', 'antibod'], n: 3 }] },
        { a: 'In a later pregnancy the antibodies cross the placenta and destroy the baby\'s red blood cells', m: 3, k: [{ w: ['destroy', 'red'], n: 2 }, { w: ['attack', 'red'], n: 2 }, { w: ['cross', 'placenta'], n: 2 }, { w: ['later', 'pregnan'], n: 2 }, { w: ['next', 'pregnan'], n: 2 }] }] }
    ] },
    { id: 'P31-3', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What is plasma?', m: 3, n: 1, kind: 'text', pts: [{ a: 'The liquid part of the blood (mostly water)', m: 3, k: [{ w: ['liquid'], n: 1 }, { w: ['fluid'], n: 1 }, { w: ['water'], n: 1 }] }] },
      { l: '(b)', q: 'Name three substances carried dissolved in the plasma.', m: 9, n: 3, kind: 'text', pts: [
        { a: 'Glucose (or amino acids, or other digested food)', m: 3, k: [{ w: ['glucos'], n: 1 }, { w: ['amino'], n: 1 }, { w: ['food'], n: 1 }, { w: ['nutrient'], n: 1 }] },
        { a: 'Hormones', m: 3, k: [{ w: ['hormon'], n: 1 }, { w: ['insulin'], n: 1 }, { w: ['adrenalin'], n: 1 }] },
        { a: 'Urea', m: 3, k: [{ w: ['urea'], n: 1 }] },
        { a: 'Carbon dioxide', m: 3, k: [{ w: ['carbon', 'dioxid'], n: 2 }, { w: ['co2'], n: 1 }] },
        { a: 'Plasma proteins (e.g. antibodies)', m: 3, k: [{ w: ['protein'], n: 1 }, { w: ['antibod'], n: 1 }, { w: ['fibrinogen'], n: 1 }] },
        { a: 'Salts (minerals)', m: 3, k: [{ w: ['salt'], n: 1 }, { w: ['mineral'], n: 1 }] }] },
      { l: '(c)', q: 'In what form is most carbon dioxide carried in the plasma?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'As hydrogencarbonate (bicarbonate) ions', m: 3, k: [{ w: ['hydrogencarbonat'], n: 1 }, { w: ['bicarbonat'], n: 1 }, { w: ['hydrogen', 'carbonat'], n: 2 }] }] }
    ] },
    { id: 'P31-4', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Name the four parts that make up blood.', m: 12, n: 4, kind: 'text', pts: [
        { a: 'Red blood cells', m: 3, k: [{ w: ['red'], n: 1 }] },
        { a: 'White blood cells', m: 3, k: [{ w: ['white'], n: 1 }] },
        { a: 'Platelets', m: 3, k: [{ w: ['platelet'], n: 1 }] },
        { a: 'Plasma', m: 3, k: [{ w: ['plasma'], n: 1 }] }] },
      { l: '(b)', q: 'Which part makes up just over half (about 55%) of the volume of blood?', m: 3, n: 1, kind: 'text', pts: [{ a: 'Plasma', m: 3, k: [{ w: ['plasma'], n: 1 }] }] },
      { l: '(c)', q: 'Relate the structure of white blood cells to their job of fighting infection.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Phagocytes (monocytes) can change shape to engulf pathogens', m: 3, k: [{ w: ['engulf'], n: 1 }, { w: ['change', 'shape'], n: 2 }, { w: ['surround'], n: 1 }, { w: ['phagocyt'], n: 1 }] },
        { a: 'Lymphocytes make antibodies', m: 3, k: [{ w: ['antibod'], n: 1 }] }] }
    ] },
    { id: 'P31-5', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Trace the path of blood from the right ventricle to the left ventricle, naming each vessel, organ and chamber it passes through.', m: 12, n: 4, kind: 'text', pts: [
        { a: 'Pulmonary artery', m: 3, k: [{ w: ['pulmonary', 'arter'], n: 2 }] },
        { a: 'Lungs', m: 3, k: [{ w: ['lung'], n: 1 }] },
        { a: 'Pulmonary vein', m: 3, k: [{ w: ['pulmonary', 'vein'], n: 2 }] },
        { a: 'Left atrium', m: 3, k: [{ w: ['left', 'atri'], n: 2 }] }] },
      { l: '(b)', q: 'Name the valve the blood passes on its way from the left atrium to the left ventricle.', m: 3, n: 1, kind: 'text', pts: [{ a: 'The bicuspid (mitral) valve', m: 3, k: [{ w: ['bicuspid'], n: 1 }, { w: ['mitral'], n: 1 }] }] },
      { l: '(c)', q: 'Why is the human circulation called a double circulation?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Blood passes through the heart twice on each complete trip round the body', m: 3, k: [{ w: ['twice'], n: 1 }, { w: ['two', 'times'], n: 2 }, { w: ['two', 'circuit'], n: 2 }] }] }
    ] },
    { id: 'P31-6', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What is the job of the coronary arteries?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'They supply the heart muscle with blood (oxygen and food)', m: 3, k: [{ w: ['heart', 'muscl'], n: 2 }, { w: ['cardiac'], n: 1 }, { w: ['heart', 'blood', 'suppl'], n: 3 }] }] },
      { l: '(b)', q: 'A pressure trace shows one heartbeat every 0.8 seconds. Calculate the heart rate in beats per minute.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Heart rate = 60 / 0.8', m: 3, k: [{ w: ['60', '0.8'], n: 2 }] },
        { a: '= 75 beats per minute', m: 3, k: [{ w: ['75'], n: 1 }] }] },
      { l: '(c)', q: 'Give two things about a person\'s lifestyle that make a blocked coronary artery more likely.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Smoking', m: 3, k: [{ w: ['smok'], n: 1 }, { w: ['cigarett'], n: 1 }] },
        { a: 'A diet high in (saturated) fat or cholesterol', m: 3, k: [{ w: ['fat'], n: 1 }, { w: ['cholesterol'], n: 1 }, { w: ['saturat'], n: 1 }] },
        { a: 'Lack of exercise', m: 3, k: [{ w: ['exercis'], n: 1 }, { w: ['inactiv'], n: 1 }] },
        { a: 'Being overweight (obesity)', m: 3, k: [{ w: ['overweight'], n: 1 }, { w: ['obes'], n: 1 }] },
        { a: 'Stress', m: 3, k: [{ w: ['stress'], n: 1 }] }] }
    ] }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one point per line. The marker decides which
  // lines earn marks (in order: a line earns if it makes a scheme point the lines before haven't). Lines that earn
  // nothing carry why (shown after marking) and fix (a better line that earns a point the answer still lacks).
  examiner: [
    { q: '2025-Q17a', part: 3, student: 'Aoife', lines: [
      { t: 'Arteries have thick walls but veins have thin walls.', ok: true },
      { t: 'Arteries and veins are different sizes.', why: 'Vague: different how? Name the structure that differs.', fix: 'Arteries have a narrow lumen and veins have a wide lumen.' },
      { t: 'Veins have valves to stop backflow but arteries do not have valves.', ok: true },
      { t: 'Veins carry blood away from the heart and arteries carry it back.', why: 'Wrong: arteries carry blood away from the heart and veins bring it back. And that is a job, not a structure.', fix: 'Arteries have a narrow lumen and veins have a wide lumen.' },
      { t: 'The walls of arteries are thicker than the walls of veins.', why: 'Repeat of line 1: no new marks.', fix: 'Arteries have a narrow lumen and veins have a wide lumen.' }
    ] },
    { q: '2025-Q16d', part: 1, student: 'Ciarán', lines: [
      { t: 'It returns the extra tissue fluid to the blood.', ok: true },
      { t: 'It helps the body to stay healthy.', why: 'Vague: how? Name the job.', fix: 'It fights infection, because lymph nodes are full of lymphocytes.' },
      { t: 'It pumps blood around the body.', why: 'Wrong: the heart pumps blood. Lymph is not blood, and there is no pump.', fix: 'It fights infection: the lymph nodes filter out bacteria.' },
      { t: 'It transports fats from the lacteals in the villi.', ok: true }
    ] },
    { q: 'S2-Q5b', part: 2, student: 'Aoife', lines: [
      { t: 'The heart muscle would not get enough oxygen.', ok: true },
      { t: 'The heart would be badly affected.', why: 'Vague: affected how? Say what happens to the muscle cells.', fix: 'The cardiac muscle cells cannot respire, so they die.' },
      { t: 'This would cause a heart attack.', ok: true },
      { t: 'The coronary artery carries blood to the lungs, so breathing would stop.', why: 'Wrong: the coronary arteries supply the heart muscle itself, not the lungs.', fix: 'The cardiac muscle cells cannot respire, so they die.' }
    ] },
    { q: '2018-Q11b', part: 1, student: 'Ciarán', lines: [
      { t: 'The SA node is in the wall of the right atrium.', ok: true },
      { t: 'It sends out impulses that cause the atria to contract.', ok: true },
      { t: 'The AV node is somewhere in the middle of the heart.', why: 'Vague: give the precise location.', fix: 'The AV node is in the septum between the right atrium and the right ventricle.' },
      { t: 'The AV node makes the atria contract first.', why: 'Wrong: the SA node sets off the atria. The AV node passes the impulse on to the ventricles.', fix: 'The AV node passes the impulse on, causing the ventricles to contract.' }
    ] },
    { q: '2012-Q15b', part: 0, student: 'Aoife', lines: [
      { t: 'Red blood cells have no nucleus.', ok: true },
      { t: 'Red blood cells look different.', why: 'Vague: and the question says other than colour. Name a real difference.', fix: 'Red blood cells are smaller than white blood cells.' },
      { t: 'Red blood cells contain haemoglobin to carry oxygen.', ok: true },
      { t: 'Red blood cells are bigger than white blood cells.', why: 'Wrong: red blood cells are smaller than white blood cells.', fix: 'Red blood cells are biconcave discs.' }
    ] },
    { q: '2011-Q8b', part: 0, student: 'Ciarán', lines: [
      { t: 'The muscles need more energy when you exercise.', ok: true },
      { t: 'Exercise is hard work for the body.', why: 'Vague: say what the muscles need more of, or make more of.', fix: 'More CO2 is made in respiration and has to be removed.' },
      { t: 'More oxygen is needed for respiration in the muscles.', ok: true },
      { t: 'The heart beats faster to cool the body down.', why: 'Wrong: the faster heartbeat delivers oxygen and removes CO2. Sweating cools you.', fix: 'More CO2 is made in respiration and has to be removed.' }
    ] },
    { q: '2014-Q12c', part: 1, student: 'Aoife', lines: [
      { t: 'Venous blood has collected CO2 from the cells.', ok: true },
      { t: 'Veins are different from arteries.', why: 'Vague: this doesn\'t explain anything about CO2.', fix: 'Arterial blood has been cleared of CO2 in the lungs.' },
      { t: 'The body cells make CO2 in respiration.', ok: true },
      { t: 'Venous blood picks up oxygen in the body.', why: 'Wrong: blood gives up oxygen to the body cells and picks up CO2.', fix: 'Arterial blood has been cleared of CO2 in the lungs.' }
    ] }
  ],
  // Quick games: match pairs (term, what it means), spot the mistake (the wrong words are in *stars*; fix is the right
  // words, opts are wrong ones to choose from), and which diagrams label sprint uses.
  match: [
    ['Right ventricle', 'Pumps blood to the lungs'],
    ['Left ventricle', 'Pumps blood around the body'],
    ['Tricuspid valve', 'Between the right atrium and right ventricle'],
    ['Bicuspid valve', 'Between the left atrium and left ventricle'],
    ['Semilunar valves', 'Stop blood flowing back into the ventricles'],
    ['SA node', 'The pacemaker: starts each heartbeat'],
    ['Septum', 'Keeps the two sides of the heart apart'],
    ['Pulmonary artery', 'Takes deoxygenated blood to the lungs'],
    ['Coronary artery', 'Supplies the heart muscle'],
    ['Red blood cells', 'Carry oxygen'],
    ['Platelets', 'Help the blood to clot'],
    ['Veins', 'Have valves and carry blood to the heart']
  ],
  spot: [
    { s: 'The *right ventricle* has the thickest wall because it pumps blood all around the body.', fix: 'left ventricle', opts: ['left atrium', 'right atrium'],
      why: 'The left ventricle pumps blood around the whole body, so it has the thickest wall.' },
    { s: 'The *pulmonary vein* carries deoxygenated blood to the lungs.', fix: 'pulmonary artery', opts: ['aorta', 'vena cava'],
      why: 'The pulmonary artery takes deoxygenated blood to the lungs. The pulmonary vein brings oxygenated blood back.' },
    { s: 'The *tricuspid* valve is between the left atrium and the left ventricle.', fix: 'bicuspid', opts: ['semilunar', 'pulmonary'],
      why: 'Bicuspid on the left, tricuspid on the right.' },
    { s: 'Each heartbeat starts at the *AV node*, the heart\'s pacemaker.', fix: 'SA node', opts: ['septum', 'aorta'],
      why: 'The SA node is the pacemaker. The AV node passes the impulse on to the ventricles.' },
    { s: '*Veins* carry blood away from the heart under high pressure.', fix: 'Arteries', opts: ['Capillaries', 'Lymph vessels'],
      why: 'Arteries carry blood away from the heart under high pressure. Veins bring it back under low pressure.' },
    { s: '*Arteries* have valves along them to stop blood flowing backwards.', fix: 'Veins', opts: ['Capillaries', 'Platelets'],
      why: 'Veins have valves because the blood in them is under low pressure.' },
    { s: '*White blood cells* carry oxygen using haemoglobin.', fix: 'Red blood cells', opts: ['Platelets', 'Lymphocytes'],
      why: 'Red blood cells are full of haemoglobin, which carries oxygen.' },
    { s: 'Platelets help the blood to *carry oxygen*.', fix: 'clot', opts: ['flow faster', 'digest fat'],
      why: 'Platelets help the blood to clot. Red blood cells carry oxygen.' },
    { s: 'The septum keeps oxygenated and deoxygenated blood *mixed*.', fix: 'apart', opts: ['warm', 'moving'],
      why: 'The septum is the wall between the left and right sides of the heart.' },
    { s: 'Red blood cells have *a large nucleus*, leaving room for more haemoglobin.', fix: 'no nucleus', opts: ['two nuclei', 'a cell wall'],
      why: 'Red blood cells have no nucleus, so there is more room for haemoglobin.' },
    { s: 'The coronary artery supplies blood to the *lungs*.', fix: 'heart muscle', opts: ['brain', 'liver'],
      why: 'The coronary arteries supply the heart muscle itself with oxygen and food.' },
    { s: 'During diastole, the heart muscle *contracts*.', fix: 'relaxes', opts: ['beats faster', 'pumps blood out'],
      why: 'Diastole is when the heart muscle is relaxing and the heart fills. Systole is when it contracts.' }
  ],
  sprint: ['heart', 'vessels', 'capillaries', 'circulation', 'blood']
};

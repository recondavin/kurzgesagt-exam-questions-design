// Chapter 33, the nervous system: what the games and memory drills use. Written to the new course's learning
// outcomes 2.4.4-2.4.9 (the CNS and PNS, the reflex action, nervous and hormonal coordination and homeostasis, the
// neuron's parts, neurotransmission at the synapse and its disorders and drugs, dopamine and endorphins). No action
// game, Build it or Label sprint: this chapter has no drawn diagrams.
window.BioLearn = window.BioLearn || {};
window.BioLearn[33] = {
  // Chain reaction and Level up, run by answer-mode.js. Bold words in "why" are the key terms for the from-memory round.
  games: {
    chains: [
      { title: 'A reflex action', steps: ['A receptor in the skin detects the stimulus', 'An impulse travels along the sensory neuron into the spinal cord', 'It passes to an interneuron in the grey matter', 'The interneuron passes it to a motor neuron', 'The motor neuron carries it out to the effector', 'The effector, a muscle, responds and pulls the hand away'],
        why: 'A <b>receptor</b> in the skin detects the <b>stimulus</b>. An <b>impulse</b> travels along the <b>sensory neuron</b> into the <b>spinal cord</b>. It passes to an <b>interneuron</b> in the <b>grey matter</b>, and the interneuron passes it to a <b>motor neuron</b>. The motor neuron carries it out to the <b>effector</b>, and the effector, a <b>muscle</b>, responds and pulls the hand away, all without the brain having to decide.' },
      { title: 'An impulse crosses a synapse', steps: ['The impulse arrives at the synaptic knob', 'Vesicles release neurotransmitter into the cleft', 'The neurotransmitter diffuses across the cleft', 'It binds to receptors on the next neuron', 'This starts an impulse in the next neuron', 'An enzyme breaks the neurotransmitter down, or it is reabsorbed'],
        why: 'The <b>impulse</b> arrives at the <b>synaptic knob</b>, and <b>vesicles</b> release <b>neurotransmitter</b> into the <b>cleft</b>. The neurotransmitter <b>diffuses</b> across the cleft and <b>binds</b> to <b>receptors</b> on the next neuron. This starts an impulse in the next neuron. Then an <b>enzyme</b> breaks the neurotransmitter down, or it is <b>reabsorbed</b>, so the next neuron isn\'t stimulated non-stop.' },
      { title: 'An impulse through a motor neuron', steps: ['The dendrites receive the impulse', 'It passes to the cell body', 'It travels away from the cell body along the axon', 'The myelin sheath insulates the axon and speeds the impulse up', 'The impulse reaches the axon terminals', 'Neurotransmitter is released onto the muscle'],
        why: 'The <b>dendrites</b> receive the impulse, and it passes to the <b>cell body</b>. It travels away from the cell body along the <b>axon</b>, where the <b>myelin sheath</b> insulates the axon and speeds the impulse up. The impulse reaches the <b>axon terminals</b>, and <b>neurotransmitter</b> is released onto the <b>muscle</b>.' },
      { title: 'Negative feedback in homeostasis', steps: ['A change moves a condition away from normal', 'Receptors detect the change', 'They send impulses to the control centre in the brain', 'The control centre sends messages along nerves or by hormones', 'Effectors respond to reverse the change', 'The condition returns to normal and the response stops'],
        why: 'A <b>change</b> moves a condition away from <b>normal</b>, and <b>receptors</b> detect the change. They send <b>impulses</b> to the <b>control centre</b> in the <b>brain</b>. The control centre sends messages along <b>nerves</b> or by <b>hormones</b>, and <b>effectors</b> respond to <b>reverse</b> the change. The condition returns to normal and the response stops: that is <b>negative feedback</b>.' },
      { title: 'How a reuptake inhibitor works', steps: ['Neurotransmitter is released into the cleft', 'It binds to receptors on the next neuron', 'Normally the presynaptic neuron reabsorbs it', 'The drug blocks this reuptake', 'More neurotransmitter stays in the cleft for longer', 'The next neuron is stimulated more: an enhanced effect'],
        why: '<b>Neurotransmitter</b> is released into the <b>cleft</b> and binds to <b>receptors</b> on the next neuron. Normally the <b>presynaptic neuron</b> <b>reabsorbs</b> it, but the drug blocks this <b>reuptake</b>. More neurotransmitter stays in the cleft for longer, so the next neuron is stimulated more: an <b>enhanced effect</b>.' }
    ],
    // Level up for Biology: a point, then its explanation, then the exact detail (3 marks each).
    levelText: {
      steps: [['Explanation', 'Add the explanation: which sentence says how or why?'], ['Detail', 'Add the detail: which one names the exact neurons, parts or chemicals?']],
      tags: ['Point', 'Explanation', 'Detail'], per: 3,
      start: 'Here\'s the point: worth 3 marks. Type it out in full.',
      gain: ['It explains how or why with a new fact: another marking-scheme point.', 'Exact names: three scheme points from one idea.'],
      note: 'Each one is a point, an explanation and a detail: three marking-scheme points, 9 marks.',
      recall: 'Write the whole answer from memory: the point, the explanation and the detail.'
    },
    level: [
      { id: 'myelin', cue: 'The myelin sheath', statement: 'The axon of a neuron is covered by a myelin sheath.',
        steps: [
          [['It insulates the axon, so the impulse travels faster.'], ['It is an important part of the neuron.', 'f'], ['Hormones are carried in the blood.', 'o']],
          [['The myelin is made by Schwann cells, which wrap themselves around the axon.'], ['Something else makes it.', 'v'], ['The myelin is made by the dendrites.', 'w', 'Schwann cells make the myelin sheath. Dendrites receive impulses.']]
        ] },
      { id: 'synapse', cue: 'The synapse', statement: 'Neurons meet at a synapse, where there is a tiny gap.',
        steps: [
          [['The gap is the synaptic cleft, so the impulse is carried across it by a neurotransmitter.'], ['The two neurons are very close together.', 'v'], ['The cerebellum controls balance.', 'o']],
          [['The neurotransmitter binds to receptors on the next neuron and starts a new impulse there.'], ['Then something happens in the next neuron.', 'v'], ['The neurotransmitter travels in the blood to the next neuron.', 'w', 'Neurotransmitter diffuses across the tiny cleft. Hormones are the messengers carried in the blood.']]
        ] },
      { id: 'reflex', cue: 'A reflex action', statement: 'A reflex action is an automatic response to a stimulus.',
        steps: [
          [['It is fast and involuntary, so it protects the body from harm.'], ['Reflexes are useful to have.', 'v'], ['The pituitary gland makes hormones.', 'o']],
          [['The impulse goes from a sensory neuron through an interneuron in the spinal cord to a motor neuron.'], ['It goes through some nerves.', 'v'], ['The brain must decide on the response first.', 'w', 'In a reflex the interneuron in the spinal cord passes the impulse straight on; the brain does not have to decide.']]
        ] },
      { id: 'sensory', cue: 'Sensory neurons', statement: 'A sensory neuron carries impulses to the central nervous system.',
        steps: [
          [['Its dendrites begin at a receptor, for example in the skin, which detects the stimulus.'], ['It is a type of nerve cell.', 'f'], ['Insulin lowers blood sugar.', 'o']],
          [['Its cell body is on a side branch, in a ganglion just outside the spinal cord.'], ['It is a different shape from other neurons.', 'v'], ['Its cell body is at one end, with the dendrites on it.', 'w', 'That describes a motor neuron. A sensory neuron\'s cell body is on a side branch.']]
        ] },
      { id: 'greywhite', cue: 'Grey and white matter', statement: 'The spinal cord is made of grey matter and white matter.',
        steps: [
          [['Grey matter is mostly cell bodies, with little myelin.'], ['They are two different colours.', 'v'], ['The heart has four chambers.', 'o']],
          [['White matter is mostly axons wrapped in myelin, which is white and fatty.'], ['White matter is important too.', 'f'], ['White matter is mostly cell bodies.', 'w', 'Cell bodies make up the grey matter. White matter is myelinated axons.']]
        ] },
      { id: 'nervhorm', cue: 'Nerves and hormones', statement: 'Nervous responses differ from hormonal responses.',
        steps: [
          [['Nervous responses are electrical and fast; hormonal responses are chemical and slower.'], ['They work in different ways.', 'v'], ['The kidneys filter the blood.', 'o']],
          [['Nervous responses are short-lived; hormonal responses last longer and can act on many target organs.'], ['One lasts a different time from the other.', 'v'], ['Hormones travel along neurons to their target.', 'w', 'Hormones are carried in the blood. Neurons carry electrical impulses.']]
        ] },
      { id: 'parkinsons', cue: 'Parkinson\'s disease', statement: 'Parkinson\'s disease is caused by a lack of dopamine in the brain.',
        steps: [
          [['Neurons in the brain that release dopamine die, so less of it crosses the synapses.'], ['It is a serious disease.', 'f'], ['Antibodies fight infection.', 'o']],
          [['It is treated with L-dopa, which the brain turns into dopamine, or with physiotherapy.'], ['There are treatments for it.', 'v'], ['It is treated with antibiotics.', 'w', 'Antibiotics kill bacteria. Parkinson\'s is treated with L-dopa or physiotherapy.']]
        ] },
      { id: 'mood', cue: 'Dopamine and endorphins', statement: 'Dopamine and endorphins are neurotransmitters that affect mood.',
        steps: [
          [['Dopamine gives a feeling of pleasure (reward); endorphins relieve pain and give a feeling of well-being.'], ['They make you feel things.', 'v'], ['Red blood cells carry oxygen.', 'o']],
          [['Exercise raises endorphins, and drugs such as cocaine raise dopamine, which can lead to addiction.'], ['Lifestyle can change them.', 'v'], ['Exercise lowers endorphins, so you feel worse afterwards.', 'w', 'Exercise raises endorphins: that is the runner\'s high.']]
        ] }
    ]
  },

  // Learn it: definitions word for word, sort into groups, fill a table.
  learn: [
    { type: 'vanish', name: 'Definitions: word for word', what: 'Type each definition as the words disappear, until you can write it from memory.',
      items: [
        ['Neuron', 'A neuron is a nerve cell.'],
        ['Reflex action', 'A reflex action is an automatic (involuntary) response to a stimulus.'],
        ['Synapse', 'A synapse is the region where two neurons come into close contact.'],
        ['Synaptic cleft', 'The synaptic cleft is the gap between two neurons at a synapse.'],
        ['Neurotransmitter', 'A neurotransmitter is a chemical released by a neuron that carries the impulse across the synaptic cleft to the next neuron.'],
        ['Central nervous system', 'The central nervous system (CNS) is the brain and spinal cord.'],
        ['Peripheral nervous system', 'The peripheral nervous system (PNS) is the nerves leading to and from the CNS, throughout the body.'],
        ['Negative feedback', 'Negative feedback is when a change from normal sets off a response that reverses the change.'],
        ['Degenerative illness', 'A degenerative illness is one that gets worse over time.']
      ] },
    { type: 'sort', name: 'Sensory, motor or interneuron?', what: 'Quick: which kind of neuron is it?',
      bins: ['Sensory neuron', 'Motor neuron', 'Interneuron'],
      items: [['Carries impulses towards the CNS', 0], ['Starts at a receptor', 0], ['Cell body on a side branch', 0], ['Enters the cord by the dorsal root', 0],
        ['Carries impulses away from the CNS', 1], ['Ends on a muscle or gland', 1], ['Cell body at one end, with dendrites', 1], ['Leaves the cord by the ventral root', 1],
        ['Found only inside the CNS', 2], ['Links sensory and motor neurons', 2], ['Also called a relay neuron', 2]],
      why: 'Sensory neurons bring impulses in from receptors to the CNS; motor neurons carry them out to effectors; interneurons, inside the CNS, link the two.' },
    { type: 'sort', name: 'Nervous or hormonal?', what: 'Which kind of response is it?',
      bins: ['Nervous', 'Hormonal'],
      items: [['Electrical impulses', 0], ['Very fast', 0], ['Short-lived', 0], ['Travels along neurons', 0], ['Neurotransmitters cross a cleft', 0],
        ['Chemical messengers', 1], ['Slower', 1], ['Long-lasting', 1], ['Carried in the blood', 1], ['Can act on many target organs', 1]],
      why: 'Nervous responses are electrical, fast and short-lived. Hormonal responses are chemical, carried in the blood, slower and longer-lasting.' },
    { type: 'sort', name: 'Grey matter or white matter?', what: 'Which one is it?',
      bins: ['Grey matter', 'White matter'],
      items: [['Mostly cell bodies', 0], ['Little myelin', 0], ['The core of the spinal cord', 0], ['The outer layer of the brain', 0], ['Where interneurons are', 0],
        ['Mostly axons', 1], ['Lots of myelin', 1], ['The outer part of the spinal cord', 1], ['The inner part of the brain', 1], ['Pale, because myelin is fatty', 1]],
      why: 'Grey matter is mostly cell bodies with little myelin; white matter is mostly myelinated axons. In the spinal cord the grey matter is inside, in the brain it is outside.' },
    { type: 'table', name: 'Three kinds of neuron', what: 'Fill the table from memory: yes or no?',
      cols: ['Sensory neuron', 'Motor neuron', 'Interneuron'], choices: ['Yes', 'No'],
      rows: [['Carries impulses to the CNS', ['Yes', 'No', 'No']], ['Carries impulses away from the CNS', ['No', 'Yes', 'No']], ['Lies entirely inside the CNS', ['No', 'No', 'Yes']],
        ['Cell body on a side branch', ['Yes', 'No', 'No']], ['Releases neurotransmitter at its endings', ['Yes', 'Yes', 'Yes']], ['Part of a reflex arc', ['Yes', 'Yes', 'Yes']]],
      why: 'Every neuron passes its impulse on with a neurotransmitter, and all three are in a reflex arc. Only the sensory neuron brings impulses in, only the motor neuron takes them out, and only the interneuron stays inside the CNS.' },
    { type: 'table', name: 'Parkinson\'s disease or paralysis?', what: 'Which disorder does each one fit?',
      cols: ['Parkinson\'s disease', 'Paralysis'], choices: ['Yes', 'No'],
      rows: [['Caused by a lack of dopamine', ['Yes', 'No']], ['Caused by damage to the spinal cord', ['No', 'Yes']], ['Treated with L-dopa', ['Yes', 'No']],
        ['Helped by physiotherapy', ['Yes', 'Yes']], ['Shaking (a tremor) is a symptom', ['Yes', 'No']], ['Loss of feeling and movement below an injury', ['No', 'Yes']]],
      why: 'Parkinson\'s disease: dopamine-releasing neurons die, causing shaking and stiffness; treated with L-dopa or physiotherapy. Paralysis: damage to the spinal cord (or a stroke) cuts the messages; treated with physiotherapy or surgery.' }
  ],

  // Practice questions for parts of the course no exam has asked yet (our questions and answer keys, not the SEC's).
  practice: [
    { id: 'P33-1', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Name two neurotransmitters that affect mood and behaviour.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Dopamine', m: 3, k: [{ w: ['dopamine'], n: 1 }] },
        { a: 'Endorphins', m: 3, k: [{ w: ['endorphin'], n: 1 }] },
        { a: 'Serotonin', m: 3, k: [{ w: ['serotonin'], n: 1 }] }] },
      { l: '(b)', q: 'State one role of endorphins in the body.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'They relieve pain (they are natural painkillers)', m: 3, k: [{ w: ['pain'], n: 1 }, { w: ['analges'], n: 1 }] },
        { a: 'They give a feeling of well-being (euphoria)', m: 3, k: [{ w: ['well', 'being'], n: 2 }, { w: ['euphor'], n: 1 }, { w: ['happ'], n: 1 }] }] },
      { l: '(c)', q: 'Explain how a drug such as cocaine changes dopamine levels at synapses, and why this can lead to addiction.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'It raises the dopamine at synapses, by stopping its reuptake', m: 3, k: [{ w: ['rais', 'dopamine'], n: 2 }, { w: ['increas', 'dopamine'], n: 2 }, { w: ['more', 'dopamine'], n: 2 },
          { w: ['reuptak'], n: 1 }, { w: ['reabsorb'], n: 1 }] },
        { a: 'The extra dopamine gives intense pleasure; the brain adapts, so more of the drug is needed and the user craves it', m: 3, k: [{ w: ['pleasur'], n: 1 }, { w: ['reward'], n: 1 },
          { w: ['crav'], n: 1 }, { w: ['need', 'more'], n: 2 }, { w: ['toleran'], n: 1 }, { w: ['depend'], n: 1 }] }] },
      { l: '(d)', q: 'Give two lifestyle choices, other than taking drugs, that raise dopamine or endorphin levels.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'Exercise', m: 3, k: [{ w: ['exercis'], n: 1 }, { w: ['sport'], n: 1 }, { w: ['run'], n: 1 }] },
        { a: 'Eating sugary or fatty food', m: 3, k: [{ w: ['sugar'], n: 1 }, { w: ['fat'], n: 1 }, { w: ['fatty'], n: 1 }, { w: ['eat'], n: 1 }, { w: ['food'], n: 1 }] },
        { a: 'Laughing, or listening to music', m: 3, k: [{ w: ['laugh'], n: 1 }, { w: ['music'], n: 1 }] }] }
    ] },
    { id: 'P33-2', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'A drug inhibits the enzyme that breaks down a neurotransmitter. Explain the effect this has on transmission at the synapse.', m: 6, n: 2, kind: 'text', pts: [
        { a: 'The neurotransmitter is not broken down, so it stays in the cleft longer', m: 3, k: [{ w: ['not', 'broke'], n: 2 }, { w: ['not', 'break'], n: 2 }, { w: ['stay', 'longer'], n: 2 },
          { w: ['stay', 'cleft'], n: 2 }, { w: ['build', 'up'], n: 2 }, { w: ['accumul'], n: 1 }] },
        { a: 'It keeps binding to the receptors, so the next neuron is stimulated more: an enhanced effect', m: 3, k: [{ w: ['enhanc'], n: 1 }, { w: ['stronger'], n: 1 },
          { w: ['keep', 'bind'], n: 2 }, { w: ['keep', 'stimul'], n: 2 }, { w: ['stimul', 'more'], n: 2 }] }] },
      { l: '(b)', q: 'Some antidepressants are reuptake inhibitors. What is meant by reuptake?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The presynaptic neuron taking the neurotransmitter back in (reabsorbing it) to make new neurotransmitter', m: 3, k: [{ w: ['reabsorb'], n: 1 }, { w: ['taking', 'back'], n: 2 },
          { w: ['take', 'back'], n: 2 }, { w: ['absorb', 'back'], n: 2 }, { w: ['recycl'], n: 1 }] }] },
      { l: '(c)', q: 'Why is the effect of a reuptake inhibitor described as enhanced?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'More neurotransmitter stays in the cleft for longer, so the next neuron is stimulated more', m: 3, k: [{ w: ['more', 'cleft'], n: 2 }, { w: ['stay', 'cleft'], n: 2 },
          { w: ['stay', 'longer'], n: 2 }, { w: ['stimul', 'more'], n: 2 }, { w: ['stronger'], n: 1 }, { w: ['keep', 'stimul'], n: 2 }] }] },
      { l: '(d)', q: 'Painkillers act at synapses in the pain pathways. Give one way in which a drug can reduce transmission at a synapse.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'It blocks the receptors on the postsynaptic neuron', m: 3, k: [{ w: ['block', 'receptor'], n: 2 }] },
        { a: 'It stops the neurotransmitter being released', m: 3, k: [{ w: ['stop', 'releas'], n: 2 }, { w: ['block', 'releas'], n: 2 }, { w: ['prevent', 'releas'], n: 2 },
          { w: ['less', 'releas'], n: 2 }, { w: ['reduc', 'releas'], n: 2 }] }] }
    ] },
    { id: 'P33-3', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'Disruptions to synaptic transmission can cause acute and chronic disorders. Distinguish between an acute and a chronic disorder.', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'Acute: comes on suddenly and is short-lived', f: 'Acute', m: 3, k: [{ w: ['sudden'], n: 1 }, { w: ['short'], n: 1 }, { w: ['quick'], n: 1 }, { w: ['brief'], n: 1 }] },
        { a: 'Chronic: develops slowly and lasts a long time', f: 'Chronic', m: 3, k: [{ w: ['long'], n: 1 }, { w: ['slow'], n: 1 }, { w: ['gradual'], n: 1 }, { w: ['permanent'], n: 1 }, { w: ['year'], n: 1 }] }] },
      { l: '(b)', q: 'Parkinson\'s disease is a chronic disorder in which the neurons that release dopamine die. Suggest why levodopa (L-dopa) is used to treat it.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The brain turns levodopa into dopamine, replacing what is lost', m: 3, k: [{ w: ['turn', 'dopamine'], n: 2 }, { w: ['convert', 'dopamine'], n: 2 }, { w: ['make', 'dopamine'], n: 2 },
          { w: ['replac', 'dopamine'], n: 2 }, { w: ['more', 'dopamine'], n: 2 }, { w: ['rais', 'dopamine'], n: 2 }, { w: ['increas', 'dopamine'], n: 2 }] }] },
      { l: '(c)', q: 'Suggest one symptom of Parkinson\'s disease.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Shaking (a tremor), stiffness or slow movement', m: 3, k: [{ w: ['shak'], n: 1 }, { w: ['tremor'], n: 1 }, { w: ['stiff'], n: 1 }, { w: ['slow'], n: 1 }] }] }
    ] },
    { id: 'P33-4', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'What is meant by homeostasis?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'Keeping the internal environment of the body constant', m: 3, k: [{ w: ['constant'], n: 1 }, { w: ['stabl'], n: 1 }, { w: ['steady'], n: 1 }, { w: ['keep', 'same'], n: 2 },
          { w: ['regulat', 'internal'], n: 2 }] }] },
      { l: '(b)', q: 'In homeostasis, name the part that detects a change and the part that carries out the response.', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'Detects: the receptor', f: 'Detects', m: 3, k: [{ w: ['receptor'], n: 1 }] },
        { a: 'Responds: the effector (a muscle or gland)', f: 'Responds', m: 3, k: [{ w: ['effector'], n: 1 }, { w: ['muscl'], n: 1 }, { w: ['gland'], n: 1 }] }] },
      { l: '(c)', q: 'Name the control centre that links the receptors with the effectors.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'The brain (the central nervous system)', m: 3, k: [{ w: ['brain'], n: 1 }, { w: ['cns'], n: 1 }, { w: ['central', 'nervous'], n: 2 }, { w: ['hypothalamus'], n: 1 }] }] },
      { l: '(d)', q: 'What is meant by negative feedback?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'A change from normal sets off a response that reverses the change', m: 3, k: [{ w: ['revers'], n: 1 }, { w: ['oppos'], n: 1 }, { w: ['counter'], n: 1 },
          { w: ['back', 'normal'], n: 2 }, { w: ['return', 'normal'], n: 2 }, { w: ['restor'], n: 1 }, { w: ['correct'], n: 1 }] }] }
    ] },
    { id: 'P33-5', src: 'Practice question (not from a real paper)', stem: '', parts: [
      { l: '(a)', q: 'A spinal nerve joins the spinal cord by two roots. Which fibres, sensory or motor, pass through the dorsal root, and which through the ventral root?', m: 6, n: 2, kind: 'fields', pts: [
        { a: 'Dorsal root: sensory fibres', f: 'Dorsal root', m: 3, k: [{ w: ['sensor'], n: 1 }] },
        { a: 'Ventral root: motor fibres', f: 'Ventral root', m: 3, k: [{ w: ['motor'], n: 1 }] }] },
      { l: '(b)', q: 'What is a ganglion?', m: 3, n: 1, kind: 'text', pts: [
        { a: 'A swelling made of a group of nerve cell bodies, outside the CNS', m: 3, k: [{ w: ['cell', 'body'], n: 2 }, { w: ['swell'], n: 1 }, { w: ['group', 'cell'], n: 2 }, { w: ['cluster', 'cell'], n: 2 }] }] },
      { l: '(c)', q: 'A student models a synapse by passing a ball between two people across a gap. Give one limitation of this model.', m: 3, n: 1, kind: 'text', pts: [
        { a: 'In a real synapse many neurotransmitter molecules diffuse across, not one thrown object', m: 3, k: [{ w: ['diffus'], n: 1 }, { w: ['many', 'molecul'], n: 2 }, { w: ['million'], n: 1 }] },
        { a: 'The model has no receptors to bind to, and no enzyme to break it down', m: 3, k: [{ w: ['receptor'], n: 1 }, { w: ['enzym'], n: 1 }] },
        { a: 'In a real synapse an impulse (the movement of ions) sets it off', m: 3, k: [{ w: ['impuls'], n: 1 }, { w: ['ion'], n: 1 }] }] }
    ] }
  ],

  // Be the examiner: a made-up student's answer to a real exam part, one point per line. The marker decides which
  // lines earn marks (in order: a line earns if it makes a scheme point the lines before haven't). Lines that earn
  // nothing carry why (shown after marking) and fix (a better line that earns a point the answer still lacks).
  examiner: [
    { q: '2023-Q17b', part: 4, student: 'Aoife', lines: [
      { t: 'The impulse arrives at the end of the axon.', ok: true },
      { t: 'The message gets passed over somehow.', why: 'Vague: passed over how? Name the chemical and say how it crosses.', fix: 'Neurotransmitter is released and diffuses across the gap.' },
      { t: 'Vesicles release neurotransmitter.', ok: true },
      { t: 'It travels through the blood to the next neuron.', why: 'Wrong: neurotransmitter diffuses across the tiny cleft. Hormones are the ones carried in the blood.', fix: 'It binds to receptors on the next neuron.' },
      { t: 'This sets up a new impulse in the next neuron.', ok: true }
    ] },
    { q: '2021-Q17c', part: 5, student: 'Ciarán', lines: [
      { t: 'Nervous responses are faster than hormonal ones.', ok: true },
      { t: 'Nervous responses are better.', why: 'Vague: better how? Compare the speed, the kind of signal or how long it lasts.', fix: 'Nervous responses are electrical; hormonal ones are chemical.' },
      { t: 'Hormonal responses travel along nerves.', why: 'Wrong: hormones are carried in the blood. Nerves carry electrical impulses.', fix: 'Nervous responses are electrical; hormonal ones are chemical.' },
      { t: 'Hormonal responses last longer.', ok: true }
    ] },
    { q: '2006-Q14b', part: 1, student: 'Aoife', lines: [
      { t: 'Sensory neurons carry impulses from receptors to the CNS.', ok: true },
      { t: 'Motor neurons carry impulses to the brain.', why: 'Wrong: that is the sensory neuron\'s direction. Motor neurons carry impulses away from the CNS.', fix: 'Motor neurons carry impulses from the CNS to effectors such as muscles.' },
      { t: 'Interneurons link sensory and motor neurons in the CNS.', ok: true },
      { t: 'Motor neurons are the most important type.', why: 'Vague: this says nothing about what a motor neuron does.', fix: 'Motor neurons carry impulses from the CNS to effectors such as muscles.' }
    ] },
    { q: '2010-Q11b', part: 0, student: 'Ciarán', lines: [
      { t: 'A reflex is a response to a stimulus.', ok: true },
      { t: 'It is something your body does.', why: 'Vague: everything is something your body does. Say what makes a reflex different.', fix: 'It is automatic: it happens without thinking.' },
      { t: 'It is a movement you decide to make.', why: 'Wrong: you don\'t decide on a reflex. It happens before the brain has thought about it.', fix: 'It is automatic: it happens without thinking.' },
      { t: 'It is involuntary.', ok: true }
    ] },
    { q: '2026-Q17d', part: 6, student: 'Aoife', lines: [
      { t: 'A receptor in the skin detects the stimulus.', ok: true },
      { t: 'An impulse travels along the sensory neuron.', ok: true },
      { t: 'The brain then decides what to do.', why: 'Wrong: in a reflex the impulse passes through an interneuron in the spinal cord. The brain doesn\'t decide.', fix: 'It passes to a motor neuron, which takes it to the effector.' },
      { t: 'It goes through a relay neuron in the grey matter.', ok: true },
      { t: 'Then the muscle does something.', why: 'Vague: say the impulse passes along the motor neuron to the effector, which responds.', fix: 'It passes to a motor neuron, which takes it to the effector.' }
    ] }
  ],
  // Quick games: match pairs (term, what it means) and spot the mistake (the wrong words are in *stars*; fix is the
  // right words, opts are wrong ones to choose from).
  match: [
    ['Myelin sheath', 'Insulates the axon and speeds up impulses'],
    ['Schwann cell', 'Makes the fatty coat round the axon'],
    ['Dendrite', 'Picks up impulses and carries them to the cell body'],
    ['Axon', 'Carries impulses away from the cell body'],
    ['Synaptic cleft', 'The gap between two neurons'],
    ['Neurotransmitter', 'Chemical that carries the impulse across the gap'],
    ['Sensory neuron', 'Carries impulses from receptors to the CNS'],
    ['Motor neuron', 'Carries impulses from the CNS to effectors'],
    ['Interneuron', 'Links sensory and motor neurons inside the CNS'],
    ['Reflex action', 'An automatic response to a stimulus'],
    ['Dopamine', 'Gives a feeling of pleasure and reward'],
    ['Endorphins', 'The body\'s natural painkillers']
  ],
  spot: [
    { s: '*Sensory neurons* carry impulses from the CNS to muscles and glands.', fix: 'Motor neurons', opts: ['Interneurons', 'Schwann cells'],
      why: 'Motor neurons carry impulses from the CNS out to effectors. Sensory neurons carry them in, from receptors.' },
    { s: 'The myelin sheath is made by the *dendrites*.', fix: 'Schwann cells', opts: ['interneurons', 'synapses'],
      why: 'Schwann cells wrap around the axon and make the myelin sheath. Dendrites receive impulses.' },
    { s: 'Neurotransmitter crosses the synaptic cleft by *travelling in the blood*.', fix: 'diffusing', opts: ['being pumped', 'moving along the axon'],
      why: 'Neurotransmitter diffuses across the tiny cleft. Hormones are the messengers carried in the blood.' },
    { s: 'Grey matter is made mostly of *axons wrapped in myelin*.', fix: 'cell bodies', opts: ['cerebrospinal fluid', 'Schwann cells'],
      why: 'Grey matter is mostly cell bodies. White matter is axons wrapped in myelin.' },
    { s: 'In a reflex arc, the interneuron is in the *white matter* of the spinal cord.', fix: 'grey matter', opts: ['meninges', 'central canal'],
      why: 'The interneuron, like the motor neuron\'s cell body, is in the grey matter at the core of the cord.' },
    { s: 'After transmission, the neurotransmitter is broken down by *a hormone*.', fix: 'an enzyme', opts: ['the myelin sheath', 'a Schwann cell'],
      why: 'An enzyme in the cleft breaks the neurotransmitter down, or it is reabsorbed by the presynaptic neuron.' },
    { s: 'Hormonal responses are *faster* than nervous responses.', fix: 'slower', opts: ['more electrical', 'shorter-lived'],
      why: 'Hormones travel in the blood, so hormonal responses are slower, but they last longer.' },
    { s: 'Parkinson\'s disease is caused by a lack of *insulin* in the brain.', fix: 'dopamine', opts: ['myelin', 'adrenaline'],
      why: 'In Parkinson\'s disease the neurons that release dopamine die; it is treated with L-dopa, which becomes dopamine.' },
    { s: 'Endorphins *increase* the feeling of pain.', fix: 'reduce', opts: ['carry', 'cause'],
      why: 'Endorphins are the body\'s natural painkillers: they reduce pain and give a feeling of well-being.' },
    { s: 'A reuptake inhibitor *speeds up* the reabsorption of neurotransmitter, so more stays in the cleft.', fix: 'blocks', opts: ['triggers', 'copies'],
      why: 'A reuptake inhibitor blocks reabsorption, so more neurotransmitter stays in the cleft: an enhanced effect.' },
    { s: 'The central nervous system is made of the brain and the *nerves*.', fix: 'spinal cord', opts: ['meninges', 'skull'],
      why: 'The CNS is the brain and spinal cord. The nerves throughout the body are the peripheral nervous system.' },
    { s: 'Impulses can cross a synapse in *both directions*.', fix: 'one direction', opts: ['the blood', 'the myelin'],
      why: 'Only the presynaptic neuron has vesicles and only the postsynaptic one has receptors, so impulses cross one way.' }
  ]
};

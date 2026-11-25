// Chapter 33, the nervous system: the ideas the narrated guide explains on the desk (bio/guide.js, step 2).
// Each concept: keys (words that mark a question as being about it), no diagram (pic: null: this chapter has no drawn
// diagrams; the paper's own picture is on the desk), and three bullets [bold, on screen, what the narrator says].
// questions: concept for a question when its key words would pick the wrong one.
window.BioGuide = window.BioGuide || {};
window.BioGuide.chapters = window.BioGuide.chapters || {};
window.BioGuide.chapters[33] = {
  concepts: [
    { id: 'divisions', title: 'Two parts: the CNS and the PNS', summary: 'A control centre, and the wiring out to the body.',
      say: 'Your nervous system has two parts: a control centre, and the cables that reach every corner of your body.',
      keys: ['central nervous', 'peripheral', 'cns', 'pns', 'brain and spinal', 'ganglia', 'ganglion', 'divided into two'],
      pic: null,
      bullets: [
        ['The CNS', 'the brain and spinal cord.', 'The central nervous system is the brain and the spinal cord. It takes in information, decides what to do, and sends out instructions.'],
        ['The PNS', 'the nerves throughout the body.', 'The peripheral nervous system is all the nerves outside the CNS, leading to and from it, everywhere in the body, with clusters of cell bodies called ganglia.'],
        ['Two roots', 'in at the back, out at the front.', 'Each spinal nerve joins the cord by two roots: sensory fibres come in through the dorsal root at the back, and motor fibres leave through the ventral root at the front.']] },
    { id: 'neuron', title: 'The neuron: a living cable', summary: 'Dendrites in, a cell body, and a long axon out.',
      say: 'A neuron is a nerve cell, and it is built to carry a message a long way, fast.',
      keys: ['neuron', 'dendrite', 'axon', 'cell body', 'myelin', 'schwann', 'nerve cell', 'sheath', 'insulat', 'only in neurons', 'adapted'],
      pic: null,
      bullets: [
        ['Dendrites', 'pick up impulses.', 'The short branches on the cell body are the dendrites. They receive impulses and carry them towards the cell body, which holds the nucleus.'],
        ['The axon', 'carries them away.', 'From the cell body one long fibre, the axon, carries the impulse away, to swollen endings whose vesicles hold neurotransmitter.'],
        ['Myelin', 'insulates and speeds it up.', 'Schwann cells wrap around the axon and make the myelin sheath. It insulates and protects the axon, and speeds up the impulse.']] },
    { id: 'types', title: 'Sensory, motor and interneurons', summary: 'In, across and out.',
      say: 'There are three kinds of neuron, and you can tell them apart by where they carry the impulse.',
      keys: ['sensory', 'motor', 'interneuron', 'relay', 'association', 'types of neuron', 'other two types'],
      pic: null,
      bullets: [
        ['Sensory neurons', 'from receptors to the CNS.', 'A sensory neuron carries impulses from a receptor, say in the skin, into the CNS. Its cell body sits on a side branch, in a ganglion beside the cord.'],
        ['Motor neurons', 'from the CNS to effectors.', 'A motor neuron carries impulses out of the CNS to an effector, a muscle or a gland. Its cell body is at one end, with the dendrites.'],
        ['Interneurons', 'link the two, inside the CNS.', 'An interneuron lies only inside the CNS, in the grey matter, and passes the impulse from a sensory neuron to a motor neuron.']] },
    { id: 'impulse', title: 'The impulse: one way along the neuron', summary: 'Ions on the move.',
      say: 'An impulse is a wave of electrical charge, and it always travels the same way.',
      keys: ['ion', 'particle', 'conduct', 'direction', 'arrow', 'electrical'],
      pic: null,
      bullets: [
        ['Ions', 'move in and out.', 'An impulse is carried by ions, charged particles such as sodium and potassium, moving in and out of the neuron along its membrane.'],
        ['One way', 'dendrites, cell body, axon.', 'The impulse enters at the dendrites, passes the cell body, and runs away from it along the axon to the endings. Draw your arrow that way.'],
        ['Sensory neurons', 'point towards the CNS.', 'In a sensory neuron the arrow runs from the receptor end towards the CNS; in a motor neuron, from the CNS out to the muscle.']] },
    { id: 'synapse', title: 'The synapse: a chemical bridge', summary: 'Neurotransmitter carries the message across the gap.',
      say: 'Two neurons never quite touch. So how does the message get from one to the next?',
      keys: ['synapse', 'synaptic', 'cleft', 'neurotransmitter', 'vesicle', 'receptor', 'reabsorb', 'close contact', 'two neurons'],
      pic: null,
      bullets: [
        ['Release', 'vesicles empty into the cleft.', 'When the impulse arrives at the synaptic knob, vesicles release neurotransmitter into the narrow gap between the neurons: the synaptic cleft.'],
        ['Cross and bind', 'a new impulse starts.', 'The neurotransmitter diffuses across the cleft and binds to receptors on the next neuron, which sets up a new impulse there. It only works one way.'],
        ['Clear away', 'an enzyme, or reabsorbed.', 'Then an enzyme breaks the neurotransmitter down, or the presynaptic neuron reabsorbs it to make more, so the next neuron isn\'t stimulated non-stop.']] },
    { id: 'drugs', title: 'Drugs at the synapse', summary: 'Block, boost or copy the chemical step.',
      say: 'Most drugs that act on your nerves work at one place: the synapse.',
      keys: ['drug', 'inhibit', 'enhance', 'reuptake', 'painkiller', 'psychoactive', 'antidepressant'],
      pic: null,
      bullets: [
        ['Block the enzyme', 'it stays in the cleft.', 'A drug that inhibits the enzyme stops the neurotransmitter being broken down, so it stays in the cleft for longer.'],
        ['Block reuptake', 'more stays, for longer.', 'A reuptake inhibitor stops the presynaptic neuron taking the neurotransmitter back. Either way the effect on the next neuron is enhanced.'],
        ['Block or copy', 'painkillers and other drugs.', 'Other drugs block receptors or mimic a neurotransmitter. Painkillers such as morphine block transmission in the pain pathways.']] },
    { id: 'disorders', title: 'When transmission goes wrong', summary: 'Parkinson\'s disease, paralysis and their treatments.',
      say: 'When neurons or synapses are damaged, the messages stop getting through.',
      keys: ['parkinson', 'paralysis', 'disorder', 'alzheimer', 'treatment', 'physiotherapy', 'degenerative', 'cause'],
      pic: null,
      bullets: [
        ['Parkinson\'s disease', 'too little dopamine.', 'In Parkinson\'s disease the neurons that release dopamine die, so dopamine runs low; genes can be a cause. It is treated with L-dopa, which the brain turns into dopamine, or physiotherapy.'],
        ['Paralysis', 'the cable is cut.', 'Paralysis follows damage to the spinal cord, a stroke or multiple sclerosis. It is treated with physiotherapy or surgery.'],
        ['Match them up', 'the cause fits the disorder.', 'Say which disorder you mean, and give a cause and a treatment for that one. A cause of paralysis won\'t earn a mark for Parkinson\'s.']] },
    { id: 'mood', title: 'Dopamine, endorphins and mood', summary: 'The chemicals of pleasure and pain relief.',
      say: 'Some neurotransmitters change how you feel, and your choices change them.',
      keys: ['dopamine', 'endorphin', 'mood', 'behaviour', 'pleasure', 'reward', 'lifestyle', 'addict'],
      pic: null,
      bullets: [
        ['Dopamine', 'pleasure and reward.', 'Dopamine gives a feeling of pleasure, or reward, which makes us want to repeat what caused it. It also helps control movement.'],
        ['Endorphins', 'natural painkillers.', 'Endorphins are released during exercise, stress and pain. They block pain and give a feeling of well-being.'],
        ['Lifestyle', 'drugs, exercise, diet.', 'Exercise raises endorphins. Drugs such as cocaine flood the synapses with dopamine, which can lead to addiction; sugary, fatty food gives a burst of dopamine too.']] },
    { id: 'reflex', title: 'The reflex action', summary: 'Stimulus in, response out, no thinking.',
      say: 'Touch something hot, and your hand is gone before you even feel the pain.',
      keys: ['reflex', 'automatic', 'involuntary', 'reflex arc', 'effector', 'stimulus'],
      pic: null,
      bullets: [
        ['A reflex', 'automatic, fast, protective.', 'A reflex action is an automatic, involuntary response to a stimulus, like blinking or the knee jerk. It is fast, so it protects the body.'],
        ['The arc', 'receptor to effector.', 'A receptor detects the stimulus, an impulse travels along the sensory neuron into the spinal cord, through an interneuron, and out along the motor neuron to the effector.'],
        ['Say impulse', 'and name each neuron.', 'Describe it step by step, naming the receptor, the three neurons and the effector, and use the word impulse.']] },
    { id: 'cord', title: 'Inside the spinal cord', summary: 'Grey matter, white matter, and its protection.',
      say: 'Cut the spinal cord across, and you see a grey butterfly wrapped in white.',
      keys: ['grey matter', 'white matter', 'meninges', 'cerebrospinal', 'central canal', 'vertebra', 'skull', 'protect', 'spinal cord'],
      pic: null,
      bullets: [
        ['Grey matter', 'mostly cell bodies.', 'Grey matter is mostly cell bodies, with little myelin. In the spinal cord it is the butterfly-shaped core; in the brain it is on the outside.'],
        ['White matter', 'mostly myelinated axons.', 'White matter is mostly axons wrapped in myelin, which is white and fatty. In the spinal cord it lies around the grey matter.'],
        ['Protection', 'bone, meninges and fluid.', 'The CNS is protected by the skull and vertebrae, by three membranes called the meninges, and by cerebrospinal fluid, which fills the central canal.']] },
    { id: 'brain', title: 'The parts of the brain', summary: 'Who does what.',
      say: 'Your brain isn\'t one organ doing one job. Each part has its own work.',
      keys: ['cerebrum', 'cerebellum', 'medulla', 'hypothalamus', 'pituitary', 'brain'],
      pic: null,
      bullets: [
        ['The cerebrum', 'thinking, at the front and top.', 'The cerebrum, the big folded forebrain, handles memory, learning, speech, intelligence, emotion and the senses.'],
        ['The cerebellum', 'balance, at the back.', 'The cerebellum sits at the back, under the cerebrum, and coordinates movement, balance and posture.'],
        ['Medulla and hypothalamus', 'the body on autopilot.', 'The medulla oblongata controls involuntary actions such as breathing and the heartbeat; the hypothalamus controls homeostasis, such as body temperature.']] },
    { id: 'coordination', title: 'Nerves, hormones and homeostasis', summary: 'Two ways to send a message.',
      say: 'Your body can send a message two ways: by nerve, or by hormone.',
      keys: ['hormon', 'hormonal', 'slower', 'faster', 'homeostasis', 'feedback', 'temperature', 'differs'],
      pic: null,
      bullets: [
        ['Nervous', 'electrical, fast, brief.', 'A nervous response is electrical, very fast and short-lived, carried along neurons.'],
        ['Hormonal', 'chemical, slow, lasting.', 'A hormonal response is chemical: hormones are carried in the blood, so it is slower, but it lasts longer and can act on many target organs.'],
        ['Homeostasis', 'negative feedback.', 'In homeostasis, receptors detect a change, a control centre in the brain responds, and nerves or hormones make effectors reverse it: negative feedback.']] }
  ],
  // Questions whose key words pull towards a side topic.
  questions: {
    '2025-Q14b': 'types', '2004-Q12c': 'coordination', '2014-Q11c': 'disorders', 'P33-1': 'mood', 'P33-2': 'drugs', 'P33-3': 'disorders', 'P33-4': 'coordination'
  }
};
// For each exam question, the concept each part is about (null: none fits), chosen by reading every part and its
// marking scheme. The guide teaches a concept on the first part that needs it (bio/guide.js).
window.BioGuide.chapters[33].parts = {
  '2004-Q12c': ['coordination'],
  '2004-Q15a': ['synapse', 'synapse', 'drugs'],
  '2005-Q3b': ['types'],
  '2005-Q14c': ['disorders'],
  '2006-Q14b': ['neuron', 'types', 'synapse', 'neuron', 'disorders'],
  '2007-Q15b': ['coordination'],
  '2008-Q4': ['neuron', 'neuron', 'impulse', 'neuron', 'synapse', 'types'],
  '2009-Q15c': ['synapse'],
  '2010-Q11a': ['disorders', 'disorders'],
  '2010-Q11b': ['reflex', 'reflex', 'reflex', 'reflex', 'divisions'],
  '2012-Q13a': ['divisions', 'coordination'],
  '2012-Q13b': ['neuron', 'neuron', 'impulse', 'types'],
  '2012-Q13c': ['brain', 'cord', 'disorders'],
  '2013-Q10b': ['coordination'],
  '2014-Q11b': ['impulse', 'synapse', 'brain', 'brain'],
  '2014-Q11c': ['disorders', 'disorders', 'disorders', 'disorders', 'disorders', 'disorders', 'disorders'],
  '2015-Q14b': ['cord', 'cord', 'cord', 'reflex', 'reflex'],
  '2017-Q14c': ['neuron'],
  '2018-Q11c': ['neuron', 'synapse', 'neuron'],
  '2019-Q14a': ['brain', 'brain', 'cord'],
  '2020-Q6': ['neuron', 'synapse', 'neuron', 'neuron', 'impulse', 'disorders'],
  '2021-Q6c': ['synapse'],
  '2021-Q17c': ['cord', 'reflex', 'reflex', 'reflex', 'reflex', 'coordination'],
  '2022-Q16a': ['divisions', 'neuron', 'types', 'impulse', 'synapse', 'disorders'],
  '2023-Q17b': ['synapse', 'synapse', 'synapse', 'synapse', 'synapse', 'types', 'disorders'],
  '2025-Q14a': ['divisions', 'cord'],
  '2025-Q14b': [null, null, null, null],
  '2025-Q14c': ['types', 'synapse', 'neuron', 'disorders'],
  '2026-Q7e': ['brain'],
  '2026-Q17d': ['cord', 'cord', 'cord', 'neuron', 'neuron', 'impulse', 'reflex'],
  'S1-Q1b': ['synapse', 'synapse', 'synapse']
};

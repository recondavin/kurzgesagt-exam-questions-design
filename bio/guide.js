// The narrated guide for a Biology exam question on the desk (hyper-focus.js reads it out in the narrator's voice).
// One step per part of the question: the part's question, the chapter's idea it needs (BioGuide.chapters[N], in
// bio/guide<N>.js) with its diagram and what earns its marks, or, for an idea already taught, how to answer it (CMD).
// Every line has text (on screen) and say (what the narrator says). Lines the same in many questions share one clip:
// its id is made from the words (bio-<hash>), or named (bio-cmd-describe-1, bio-29-adh-title).
// tools/bio/build_bio_narration.mjs lists every line in tools/narration/bio_lines.json for the voice generator.
(function () {
  'use strict';
  var G = window.BioGuide = window.BioGuide || {};
  G.chapters = G.chapters || {};

  // How to answer each kind of question. Bullets: [bold, text, say].
  G.CMD = {
    name: { title: 'Name it: short and exact', summary: 'A word or a short phrase is enough.',
      say: 'Name, state, give. These just want the fact, and nothing more.',
      bullets: [
        ['Exact name', 'glomerulus, not "the filter".', 'Examiners want the exact biological name. Glomerulus, not the filter. Collecting duct, not the tube.'],
        ['No essay', 'the fact earns the marks.', 'There is no need for a long answer here. The right name earns the marks, so save your time for the longer parts.'],
        ['Count them', 'two asked, give two.', 'If it asks for two, give two. Extra answers don\'t earn extra marks.']] },
    meant: { title: 'Say what it means', summary: 'One clear sentence.',
      say: 'When a question asks what a word means, it wants one clear, complete sentence.',
      bullets: [
        ['Start with the word', '"Excretion is…"', 'Start with the word itself. Excretion is, and then finish the sentence. It keeps you on track.'],
        ['The key idea', 'the one thing it\'s about.', 'Every definition has one key idea. For homeostasis, it\'s keeping the inside of the body constant. Make sure yours has it.'],
        ['Learn it word for word', 'the Learn it drills help.', 'Definitions come up again and again, so they\'re worth learning word for word. The Learn it drills are made for exactly that.']] },
    explain: { title: 'Explain: say why', summary: 'Each point is a fact and its reason.',
      say: 'Explain means the examiner wants to see the reason, not just the fact.',
      bullets: [
        ['Fact', 'what happens.', 'First, the fact: what actually happens.'],
        ['Because', 'why it happens.', 'Then the reason. Use the word because, or so, and the examiner can follow your thinking.'],
        ['One idea a sentence', 'each can earn marks.', 'Keep one idea to each sentence. Every separate, correct idea is another chance at marks.']] },
    describe: { title: 'Describe: what happens, in order', summary: 'Walk through it step by step.',
      say: 'Describing is a bit like telling a story, one step after another.',
      bullets: [
        ['In order', 'start to finish.', 'Start at the beginning and go step by step to the end, so nothing gets left out.'],
        ['Name the parts', 'where each step happens.', 'Name the exact structure where each step happens. Those names are what the examiner is looking for.'],
        ['Count the marks', 'nine marks, three points.', 'Count the marks. Nine marks usually means three separate points, so make sure you have at least three.']] },
    compare: { title: 'Tell them apart', summary: 'Say something about each one.',
      say: 'A difference always has two sides, and you need both of them.',
      bullets: [
        ['Both sides', 'A does this, B does that.', 'Say what the first one is like, and then what the second one is like.'],
        ['Same feature', 'compare like with like.', 'Compare the same feature on both. Wall thickness against wall thickness, not against colour.'],
        ['Use whereas', 'one sentence, both halves.', 'The word whereas is your friend. Arteries have thick walls, whereas veins have thin walls.']] },
    suggest: { title: 'Suggest: use what you know', summary: 'A sensible, specific answer.',
      say: 'Suggest means the answer won\'t be in your notes word for word. You have to think it through.',
      bullets: [
        ['Apply it', 'use the biology you know.', 'Take the biology you know and apply it to the situation in the question.'],
        ['Be specific', 'say exactly what and why.', 'A vague guess gets nothing. A specific, sensible reason gets the marks.'],
        ['Link it back', 'to the question.', 'Finish by linking your answer back to what the question described.']] },
    draw: { title: 'Draw it big, label it well', summary: 'The labels earn most of the marks.',
      say: 'In a drawing question, most of the marks are in the labels.',
      bullets: [
        ['Large and clear', 'half a page, in pencil.', 'Make your diagram large and clear, in pencil, so the examiner can see every part.'],
        ['Label lines', 'straight, touching the part.', 'Each label needs a straight line that touches the exact part it names.'],
        ['Count the labels', 'as many as it asks for.', 'Count how many labels the question asks for, and make sure every one is there.']] },
    label: { title: 'Find it on the diagram', summary: 'Point to the exact spot.',
      say: 'This one is about reading the diagram carefully.',
      bullets: [
        ['Look first', 'trace the structure.', 'Before you write anything, follow the structure on the diagram and work out what each part does.'],
        ['Exact name', 'spelled right.', 'Give the exact name, spelled correctly. Close isn\'t enough when two parts have similar names.'],
        ['On the diagram', 'a clear letter or arrow.', 'If you have to mark the diagram, put a clear letter or arrow right on the part.']] },
    calculate: { title: 'Show your working', summary: 'The sum, the answer, the units.',
      say: 'Calculations are some of the easiest marks on the paper, if you show your work.',
      bullets: [
        ['Write the sum', 'before the answer.', 'Write down the sum you\'re doing before you write the answer.'],
        ['Units', 'always.', 'Always finish with the units, like beats per minute or millilitres.'],
        ['Check it', 'does it make sense?', 'Then check it makes sense. A heart rate of seven thousand is a sign to look again.']] },
    tf: { title: 'True or false?', summary: 'Read every word.',
      say: 'True or false questions are quick, but they hide their traps in single words.',
      bullets: [
        ['One word', 'can make it false.', 'One word, like all, never or only, can turn a true statement false.'],
        ['Picture it', 'think of the real thing.', 'Picture the real structure or process, and check the statement against it.'],
        ['Move on', 'don\'t overthink it.', 'Decide, and move on. Don\'t spend long on a single mark.']] }
  };
  // The tips' examples from each chapter's own biology (a digestion question shouldn't say "glomerulus"): [chapter]
  // [command][bullet index] = [bold, text, say]. A tip a chapter doesn't list here uses the one in G.CMD.
  G.CMD_EX = {
    28: {
      name: { 0: ['Exact name', 'diaphragm, not "the muscle under the lungs".', 'Examiners want the exact biological name. Diaphragm, not the muscle under the lungs. Alveoli, not the little air bags.'] },
      meant: { 0: ['Start with the word', '"Gas exchange is…"', 'Start with the word itself. Gas exchange is, and then finish the sentence. It keeps you on track.'],
        1: ['The key idea', 'the one thing it\'s about.', 'Every definition has one key idea. For gas exchange, it\'s gases moving by diffusion between the alveoli and the blood. Make sure yours has it.'] },
      compare: { 2: ['Use whereas', 'one sentence, both halves.', 'The word whereas is your friend. Inhalation is active, whereas normal exhalation is passive.'] }
    },
    29: {
      compare: { 2: ['Use whereas', 'one sentence, both halves.', 'The word whereas is your friend. Excretion removes waste made by the body\'s cells, whereas egestion gets rid of undigested food.'] }
    },
    30: {
      name: { 0: ['Exact name', 'oesophagus, not "the food pipe".', 'Examiners want the exact biological name. Oesophagus, not the food pipe. Duodenum, not the start of the gut.'] },
      meant: { 0: ['Start with the word', '"Digestion is…"', 'Start with the word itself. Digestion is, and then finish the sentence. It keeps you on track.'],
        1: ['The key idea', 'the one thing it\'s about.', 'Every definition has one key idea. For digestion, it\'s breaking food down into small, soluble molecules that can be absorbed. Make sure yours has it.'] },
      compare: { 2: ['Use whereas', 'one sentence, both halves.', 'The word whereas is your friend. Mechanical digestion breaks food into smaller pieces, whereas chemical digestion uses enzymes.'] }
    },
    31: {
      name: { 0: ['Exact name', 'aorta, not "the big artery".', 'Examiners want the exact biological name. Aorta, not the big artery. Tricuspid valve, not the valve on the right.'] },
      meant: { 0: ['Start with the word', '"The pulse is…"', 'Start with the word itself. The pulse is, and then finish the sentence. It keeps you on track.'],
        1: ['The key idea', 'the one thing it\'s about.', 'Every definition has one key idea. For the pulse, it\'s the artery wall stretching each time the heart pumps blood into it. Make sure yours has it.'] }
    },
    32: {
      name: { 0: ['Exact name', 'antibody, not "the defender".', 'Examiners want the exact biological name. Antibody, not the defender. Phagocyte, not the white cell that eats germs.'] },
      meant: { 0: ['Start with the word', '"A pathogen is…"', 'Start with the word itself. A pathogen is, and then finish the sentence. It keeps you on track.'],
        1: ['The key idea', 'the one thing it\'s about.', 'Every definition has one key idea. For a pathogen, it\'s that it causes disease. Make sure yours has it.'] },
      compare: { 2: ['Use whereas', 'one sentence, both halves.', 'The word whereas is your friend. Active immunity makes its own antibodies, whereas passive immunity is given them.'] }
    }
  };
  var CMD_ORDER = ['draw', 'compare', 'describe', 'explain', 'suggest', 'meant', 'calculate', 'label', 'tf', 'name'];
  var CMD_VERB = { name: 'Name', meant: 'Define', explain: 'Explain', describe: 'Describe', compare: 'Compare', suggest: 'Suggest', draw: 'Draw', label: 'Use the diagram', calculate: 'Calculate', tf: 'True or false' };
  var CMD_SAY = {
    name: 'just name it: a word or a short phrase is enough',
    meant: 'say what it means, in one clear sentence',
    explain: 'explain it: say what happens, and why',
    describe: 'describe it: say what happens, step by step',
    compare: 'say how they differ, with something about each one',
    suggest: 'suggest a sensible reason, using what you know',
    draw: 'draw it large, and label it clearly',
    label: 'read the diagram and find the exact part',
    calculate: 'work it out, and show your working',
    tf: 'decide if each statement is true or false'
  };

  // The command word of a part, from how its question starts.
  G.command = function (part) {
    var t = String(part.q || '').toLowerCase().replace(/^\s*(\(?[a-z0-9]{1,4}\)|\d\.)\s*/, '');
    if (part.kind === 'tf' || /true or false|\(t\)|\bt\s+f\b/.test(t)) return 'tf';
    if (part.kind === 'draw' || (/^(draw|sketch)\b/.test(t) && !/\b(line|arrow)s?\b|on the diagram/.test(t))) return 'draw';
    if (/meant by|^define|^what is (a|an|the term)\b|explain (the|what is meant)|^what are .* called/.test(t)) return 'meant';
    if (/^(distinguish|compare|contrast)|difference/.test(t)) return 'compare';
    if (/^(calculate|work out|how many)/.test(t)) return 'calculate';
    if (part.kind === 'tap' || part.kind === 'fields' || /^(label|identify the (part|structure)s?|indicate)|on the diagram|labelled [a-z]\b/.test(t)) return 'label';
    if (/^suggest/.test(t)) return 'suggest';
    if (/^(describe|outline|give an account|write (short )?notes|how (is|are|does|do)|what happens)/.test(t)) return 'describe';
    if (/^(explain|why|account for|give (a|one|two) reasons?)/.test(t)) return 'explain';
    return 'name';
  };

  // A short id for a line, from its words (FNV-1a), so the same sentence anywhere uses the same clip.
  function hash(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  G.lineId = function (say) { return 'bio-' + hash(say); };
  var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  function spokenNumber(n) {
    if (n <= 12) return WORDS[n];
    var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (n < 20) return ['thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'][n - 13];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + WORDS[n % 10] : '');
    return String(n);
  }
  // "(b)(iii)" -> "b three", so the narrator reads labels naturally.
  var ROMAN = { i: 'one', ii: 'two', iii: 'three', iv: 'four', v: 'five', vi: 'six', vii: 'seven', viii: 'eight', ix: 'nine', x: 'ten' };
  function spokenLabel(l) {
    return String(l).replace(/[()]/g, ' ').trim().split(/\s+/).map(function (w) { return ROMAN[w] || w; }).join(' ');
  }
  function partMarks(part) { return part.m || part.n * 3; }

  // The concept the whole question is about: the chapter's concept whose key words match it best (or the one named
  // for it in BioGuide.chapters[N].questions, when its words would pick the wrong one).
  function hits(c, text) { return (c.keys || []).reduce(function (n, k) { return n + (text.indexOf(k) >= 0 ? 1 : 0); }, 0); }
  function conceptFor(ch, q) {
    var C = G.chapters[ch];
    if (!C || !C.concepts) return null;
    if (C.questions && C.questions[q.id]) return C.concepts.filter(function (c) { return c.id === C.questions[q.id]; })[0] || null;
    // Each part votes for the concept its words match best, weighted by its marks; the stem breaks ties.
    var votes = {};
    q.parts.forEach(function (p) { var top = partConcept(C, p); if (top) votes[top.id] = (votes[top.id] || 0) + partMarks(p); });
    var stem = String(q.stem || '').toLowerCase(), best = null, score = 0;
    C.concepts.forEach(function (c) {
      var s = (votes[c.id] || 0) + hits(c, stem) * 0.5;
      if (s > score) { best = c; score = s; }
    });
    return best;
  }
  // How strongly a part is about a concept: its question's words count twice its scheme answers' words.
  function partScore(c, p) { return 2 * hits(c, String(p.q).toLowerCase()) + hits(c, p.pts.map(function (pt) { return pt.a; }).join(' ').toLowerCase()); }
  // The concept one part is about: the one it matches best.
  function partConcept(C, p) {
    var top = null, most = 0;
    C.concepts.forEach(function (c) { var h = partScore(c, p); if (h > most) { top = c; most = h; } });
    return top;
  }

  // One slide for each part of the question: the part's question, then the science it needs (the chapter's concept,
  // with its diagram) and what earns its marks. A part about an idea an earlier slide already taught, or that no
  // concept matches, gets the three tips for its command word instead.
  function partStep(ch, p, c, k) {
    var cmd = G.command(p), d = G.CMD[cmd], marks = partMarks(p);
    var asked = String(p.q).replace(/\s*\[[^\]]*\]/g, '');
    var summary = p.l + ' ' + (asked.length > 110 ? asked.slice(0, 107).replace(/\s+\S*$/, '') + '…' : asked);
    // Read out the way the old overview read a part, so the clips already voiced are reused.
    var sumSay = 'For part ' + spokenLabel(p.l) + ', ' + CMD_SAY[cmd] + '. ' + (p.n === 1 ? 'That\'s one point' : 'That\'s ' + spokenNumber(p.n) + ' points') +
      ', for ' + spokenNumber(marks) + ' marks.';
    var step = { id: k ? 'question-bio-part-' + (k + 1) : 'question-bio-ask', summary: summary, pic: null };
    if (c) {
      var base = 'bio-' + ch + '-' + c.id, tip = { b: (p.n === 1 ? 'One point' : p.n + ' points') + ', ' + marks + ' marks', t: d.summary, say: d.say };
      step.title = c.title;
      step.pic = c.pic || null;
      step.bullets = c.bullets.map(function (b) { return { b: b[0], t: b[1], say: b[2] }; }).concat([tip]);
      step.voice = [base + '-title', G.lineId(sumSay)].concat(c.bullets.map(function (b, i) { return base + '-' + (i + 1); }), ['bio-cmd-' + cmd + '-summary']);
      step.says = [c.titleSay || c.title, sumSay].concat(c.bullets.map(function (b) { return b[2]; }), [tip.say]);
    } else {
      var cb = 'bio-cmd-' + cmd, ex = (G.CMD_EX[ch] || {})[cmd] || {};
      var list = d.bullets.map(function (b, i) { return ex[i] || b; });
      step.title = d.title;
      step.bullets = list.map(function (b) { return { b: b[0], t: b[1], say: b[2] }; });
      // A chapter's own example is its own clip.
      step.voice = [cb + '-title', G.lineId(sumSay)].concat(list.map(function (b, i) { return cb + '-' + (i + 1) + (ex[i] ? '-ch' + ch : ''); }));
      step.says = [d.title, sumSay].concat(list.map(function (b) { return b[2]; }));
    }
    return step;
  }

  // The guide's steps for one question (plain data; bio/bio-desk.js turns them into the guide's cards).
  // Each concept is taught once, on the part that matches it most strongly; the question's own concept covers a
  // first part that matches none.
  G.steps = function (ch, q) {
    var C = G.chapters[ch], whole = conceptFor(ch, q), fixed = C && C.questions && C.questions[q.id];
    // Chosen by hand for every part (BioGuide.chapters[N].parts): taught on the first part that needs it.
    var chosen = C && C.parts && C.parts[q.id];
    if (chosen) {
      var taught = {};
      return q.parts.map(function (p, k) {
        var id = chosen[k], c = id && !taught[id] ? C.concepts.filter(function (x) { return x.id === id; })[0] || null : null;
        if (c) taught[c.id] = true;
        return partStep(ch, p, c, k);
      });
    }
    var pick = q.parts.map(function (p) {
      if (!C || !C.concepts) return null;
      if (fixed) return whole;
      return partConcept(C, p);
    });
    if (!fixed && whole && pick.every(function (c) { return !c; })) pick[0] = whole;
    var best = {};
    pick.forEach(function (c, k) {
      if (!c) return;
      var sc = fixed ? -k : partScore(c, q.parts[k]);
      if (!best[c.id] || sc > best[c.id].sc) best[c.id] = { k: k, sc: sc };
    });
    return q.parts.map(function (p, k) {
      var c = pick[k] && best[pick[k].id].k === k ? pick[k] : null;
      return partStep(ch, p, c, k);
    });
  };
  // Every narrated line of a step, for the voice generator: [{id, text, say}].
  G.lines = function (step) {
    var texts = [step.title, step.summary].concat(step.bullets.map(function (b) { return b.b + ': ' + b.t; }));
    return step.voice.map(function (id, k) { return { id: id, text: texts[k], say: step.says[k] }; });
  };
})();

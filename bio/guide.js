// The narrated guide for a Biology exam question on the desk (hyper-focus.js reads it out in the narrator's voice).
// Three steps per question:
//   1. What it's asking: built here from the question's parts, marks and command words.
//   2. The science: the chapter's idea behind the question (BioGuide.chapters[N], in bio/guide<N>.js), with its diagram.
//   3. Get the marks: how to answer the main part's command word (CMD below).
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

  // Step 1: what the question is asking, part by part (parts with the same command word share a bullet).
  function askStep(q) {
    var total = q.parts.reduce(function (s, p) { return s + partMarks(p); }, 0), groups = [];
    q.parts.forEach(function (p) {
      var c = G.command(p), g = groups.filter(function (x) { return x.c === c; })[0];
      if (!g) groups.push(g = { c: c, parts: [] });
      g.parts.push(p);
    });
    var bullets = groups.slice(0, 4).map(function (g) {
      var labels = g.parts.map(function (p) { return p.l; }), n = g.parts.reduce(function (s, p) { return s + p.n; }, 0);
      var marks = g.parts.reduce(function (s, p) { return s + partMarks(p); }, 0);
      var bold = (labels.length > 3 ? labels[0] + '–' + labels[labels.length - 1] : labels.join(', ')) + ' ' + CMD_VERB[g.c];
      var text = (n === 1 ? 'one point' : n + ' points') + ', ' + marks + ' marks.';
      var say = (labels.length === 1 ? 'For part ' : 'For parts ') + labels.map(spokenLabel).join(', ') + ', ' + CMD_SAY[g.c] + '. ' +
        (n === 1 ? 'That\'s one point' : 'That\'s ' + spokenNumber(n) + ' points') + ', for ' + spokenNumber(marks) + ' marks.';
      return { b: bold, t: text, say: say };
    });
    var summary = total + ' marks' + (q.parts.length > 1 ? ' in ' + q.parts.length + ' parts.' : '.');
    var sumSay = 'This one is worth ' + spokenNumber(total) + ' marks' + (q.parts.length > 1 ? ', in ' + spokenNumber(q.parts.length) + ' parts' : '') + '. Here\'s what each part wants.';
    return { id: 'question-bio-ask', title: 'What it\'s asking', summary: summary, bullets: bullets,
      voice: ['bio-ask-title', G.lineId(sumSay)].concat(bullets.map(function (b) { return G.lineId(b.say); })),
      says: ['So, what is this question really asking for?', sumSay].concat(bullets.map(function (b) { return b.say; })) };
  }

  // Step 2: the idea behind the question, the chapter's concept whose key words match it best.
  function conceptFor(ch, q) {
    var C = G.chapters[ch];
    if (!C || !C.concepts) return null;
    if (C.questions && C.questions[q.id]) return C.concepts.filter(function (c) { return c.id === C.questions[q.id]; })[0] || null;
    // Each part votes for the concept its words match best, weighted by its marks; the stem breaks ties.
    var votes = {}, hits = function (c, text) { return (c.keys || []).reduce(function (n, k) { return n + (text.indexOf(k) >= 0 ? 1 : 0); }, 0); };
    q.parts.forEach(function (p) {
      var text = (p.q + ' ' + p.pts.map(function (pt) { return pt.a; }).join(' ')).toLowerCase(), top = null, most = 0;
      C.concepts.forEach(function (c) { var h = hits(c, text); if (h > most) { top = c; most = h; } });
      if (top) votes[top.id] = (votes[top.id] || 0) + partMarks(p);
    });
    var stem = String(q.stem || '').toLowerCase(), best = null, score = 0;
    C.concepts.forEach(function (c) {
      var s = (votes[c.id] || 0) + hits(c, stem) * 0.5;
      if (s > score) { best = c; score = s; }
    });
    return best;
  }
  function scienceStep(ch, c) {
    var base = 'bio-' + ch + '-' + c.id;
    return { id: 'question-bio-science', title: c.title, summary: c.summary, pic: c.pic || null,
      bullets: c.bullets.map(function (b) { return { b: b[0], t: b[1], say: b[2] }; }),
      voice: [base + '-title', base + '-summary'].concat(c.bullets.map(function (b, k) { return base + '-' + (k + 1); })),
      says: [c.titleSay || c.title, c.say || c.summary].concat(c.bullets.map(function (b) { return b[2]; })) };
  }

  // Step 3: how to answer the question's main command word (the hardest kind in it).
  function marksStep(q) {
    var cmds = q.parts.map(G.command), c = CMD_ORDER.filter(function (k) { return cmds.indexOf(k) >= 0; })[0] || 'name', d = G.CMD[c];
    var base = 'bio-cmd-' + c;
    return { id: 'question-bio-marks', title: d.title, summary: d.summary,
      bullets: d.bullets.map(function (b) { return { b: b[0], t: b[1], say: b[2] }; }),
      voice: [base + '-title', base + '-summary'].concat(d.bullets.map(function (b, k) { return base + '-' + (k + 1); })),
      says: [d.title, d.say].concat(d.bullets.map(function (b) { return b[2]; })) };
  }

  // The guide's steps for one question (plain data; bio/bio-desk.js turns them into the guide's cards).
  G.steps = function (ch, q) {
    var c = conceptFor(ch, q), list = [askStep(q)];
    if (c) list.push(scienceStep(ch, c));
    list.push(marksStep(q));
    return list;
  };
  // Every narrated line of a step, for the voice generator: [{id, text, say}].
  G.lines = function (step) {
    var texts = [step.title, step.summary].concat(step.bullets.map(function (b) { return b.b + ': ' + b.t; }));
    return step.voice.map(function (id, k) { return { id: id, text: texts[k], say: step.says[k] }; });
  };
})();

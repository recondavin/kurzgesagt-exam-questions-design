// Make your own games (the user: "is there a way i can design something where students get to design their own games
// but in a very simple way", "the questions are the same they just design the game", "call it 'make your own games'",
// then "build an asset library and make it like this 'do you want it to be based off....' 'Shorter questions' 'longer
// questions' 'more options', do you want it to pick from 4 options, type out answers, diagrams, design your own").
// The examiner asks you one thing at a time, and you tap an answer:
//   Questions  What do you want it based off? Shorter questions (one mark point), longer questions (two or more), or
//              more options: a bit of everything, what you got wrong, what you haven't done, new-course questions.
//              How do you want to answer? Pick from 4 options, type out answers, diagrams (name the part, or tap it
//              on the real exam diagram), or design your own (how often you type, how many diagrams, 2 to 4 options).
//              Which chapters?
//   Game       What kind of game (Race, Battle, Tower, Points), what a right answer does, what a wrong one does, how
//              long it is.
//   Look       Who you are (a character from the asset library, bio/maker-assets.js, or one you design: body, eyes,
//              mouth, something on top, an extra, a colour), who you're up against, where it is, things to put in
//              your world (tap to add, tap the picture to move), how cross the examiner is.
//   Name       Then play it, save it, or share it as a link: the whole game is in the link (#play=...).
// The questions are always the real exam questions and Exam drill's (bio/bio-drill.js: the papers' short parts, their
// diagrams, the new-course questions; and here the longer parts too), marked by the marking scheme, and what comes
// next is the memory shared with Exam drill and every game ('bio-drill': wrong ones come back as boxes, right ones
// come back to type).
// Saved here: 'bio-made' (your games). bio.js routes #make and #play=.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard, A = window.BioMakerArt, DR = window.BioMakerDraw;
  if (!K || !BK || !BB || !BB.memSet || !A) return;
  var esc = BK.esc, pick = BK.pick, shuffle = BK.shuffle;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours;

  // ======================================================================== the cards
  // Each world's cards: what a right answer does, what a wrong one does (name, what it means), and its sizes.
  var WORLDS = {
    race: { name: 'Race', what: 'Get to the flag first', right: [['step1', 'Move 1 step', 'Every right answer'], ['step2', 'Move 2 steps', 'A quicker race']],
      wrong: [['him1', 'He moves 1 step', 'He starts two behind. If he catches you, you lose'], ['back1', 'You go back 1 step', 'You can\'t lose, only slow down'], ['life', 'Lose a life', 'Three wrong and it\'s over']],
      size: [6, 8, 10], unit: 'steps' },
    battle: { name: 'Battle', what: 'Take all his hearts', right: [['hit1', 'Hit him', 'He loses a heart'], ['hit2t', 'Hit him (twice if typed)', 'Typed answers do double']],
      wrong: [['hurt1', 'He hits you', 'You lose a heart'], ['life', 'Lose a life', 'Three wrong and it\'s over']], size: [3, 5, 8], unit: 'hearts' },
    tower: { name: 'Tower', what: 'Build up to the line', right: [['add1', 'Add a block', 'One block a right answer'], ['add2t', 'Add a block (two if typed)', 'Typed answers build double']],
      wrong: [['fall1', 'A block falls off', 'You can\'t lose, only slow down'], ['life', 'Lose a life', 'Three wrong and it\'s over']], size: [6, 8, 10], unit: 'blocks' },
    points: { name: 'Points', what: 'Score to the target', right: [['p100', '+100', 'A hundred a right answer'], ['p100t', '+100 (+200 if typed)', 'Typed answers score double']],
      wrong: [['m50', '−50', 'You can\'t lose, only slow down'], ['life', 'Lose a life', 'Three wrong and it\'s over']], size: [500, 1000, 1500], unit: 'points' },
    shoot: { name: 'Shootout', what: 'Score past him in goal', right: [['goal1', 'You score', 'A goal a right answer'], ['goal2t', 'You score (twice if typed)', 'Typed answers count double']],
      wrong: [['save', 'He saves it', 'You can\'t lose, only slow down'], ['hgoal', 'He scores', 'First to the goals wins'], ['life', 'Lose a life', 'Three wrong and it\'s over']], size: [3, 5, 7], unit: 'goals' },
    grow: { name: 'Grow', what: 'Grow your plant till it flowers', right: [['leaf1', 'A new leaf', 'A leaf a right answer'], ['leaf2t', 'A new leaf (two if typed)', 'Typed answers grow double']],
      wrong: [['wilt', 'A leaf falls off', 'You can\'t lose, only slow down'], ['life', 'Lose a life', 'Three wrong and it\'s over']], size: [5, 7, 9], unit: 'leaves' }
  };
  var ORDER = ['race', 'battle', 'tower', 'points', 'shoot', 'grow'];
  var SIZE_NAMES = ['Short', 'Medium', 'Long'];
  // Where the questions come from: the first two, then the rest under "More options".
  var SOURCES = [
    ['short', 'Shorter questions', 'One mark point: a word or a line'],
    ['long', 'Longer questions', 'Two or more points: explain, describe, compare'],
    ['all', 'A bit of everything', 'Shorter, longer and new-course questions'],
    ['wrong', 'What I got wrong', 'The ones you missed, in any game or the drill'],
    ['fresh', 'What I haven\'t done', 'Questions you haven\'t met yet'],
    ['new', 'New-course questions', 'On what no exam has asked yet']
  ];
  var ANSWERS = [
    ['box', 'Pick from 4 options', 'Tap the right answer'],
    ['type', 'Type out answers', 'Marked by the marking scheme'],
    ['fig', 'Diagrams', 'Real exam diagrams: name the part, or tap it'],
    ['own', 'Design your own', 'Mix them how you like']
  ];
  var TYPE_HOW = [[0, 'Never'], [1, 'Sometimes'], [2, 'Always']], FIG_HOW = [[0, 'None'], [1, 'Some'], [2, 'Lots']], CHOICES = [[2, '2'], [3, '3'], [4, '4']];
  var MOODS = [['calm', 'Calm'], ['strict', 'Strict'], ['furious', 'Furious']];
  var LIVES = 3, NAME_MAX = 24, THINGS_MAX = 6, LATER = { box: 3, type: 5 };
  // What he says, by his mood: when you're right, when you're wrong, when you win and when you lose.
  var SAY = {
    calm: { right: ['Good.', 'That\'s right.', 'Well done.'], wrong: ['Not quite.', 'Have another look at that one.'], win: 'Well played.', lose: 'Better luck next time.' },
    strict: { right: ['Hmph. Correct.', 'Fine.', 'Acceptable.'], wrong: ['Wrong.', 'Learn it.', 'No marks.'], win: 'Hmph. You won.', lose: 'As expected.' },
    furious: { right: ['WHAT? Correct?!', 'Lucky. Very lucky.', 'I don\'t believe it.'], wrong: ['WRONG!', 'Did you even study?!', 'Unbelievable.'],
      win: 'IMPOSSIBLE!', lose: 'HA! Again!' }
  };
  // The steps, in order: the part of the game each belongs to, and what he asks.
  var STEPS = [
    ['src', 'Questions', 'What do you want it based off?'],
    ['ans', 'Questions', 'How do you want to answer?'],
    ['ch', 'Questions', 'Which chapters?'],
    ['w', 'Game', 'What kind of game?'],
    ['r', 'Game', 'When you get one right...'],
    ['x', 'Game', 'When you get one wrong...'],
    ['s', 'Game', 'How long is it?'],
    ['you', 'Look', 'Who are you?'],
    ['op', 'Look', 'Who are you up against?'],
    ['pl', 'Look', 'Where is it?'],
    ['th', 'Look', 'Want to add some things?'],
    ['e', 'Look', 'How cross am I?'],
    ['n', 'Name', 'What\'s it called?']
  ];
  var PARTS = ['Questions', 'Game', 'Look', 'Name'];
  // What he says to some picks.
  var REACT = {
    src: { short: 'Quick ones. Fine.', long: 'Longer ones. Brave.', all: 'A bit of everything. Sensible.', wrong: 'Good. Face them.', fresh: 'Something new, then.', new: 'Questions no exam has asked. Yet.' },
    ans: { box: 'Four options. One is right.', type: 'Typed. Marked properly.', fig: 'Real exam diagrams. Good.', own: 'Your own mix. Go on.' },
    w: { race: 'A race. I\'m fast.', battle: 'A battle. Bring it.', tower: 'Build away.', points: 'Points. I like points.', shoot: 'I\'m a great goalkeeper.', grow: 'A plant. How calming.' },
    op: { examiner: 'Me. Obviously.', virus: 'A virus. Bold.', bacterium: 'A bacterium. Hmph.', mould: 'Mould. Lovely.', paper: 'An exam paper. Fitting.', clock: 'The clock. Always running.', king: 'The germ king.', robo: 'A robot me? Flattering.' },
    e: { 0: 'Calm. I can do calm.', 1: 'Strict. As usual.', 2: 'You asked for it.' }
  };
  var OLD_PLAYERS = ['blob', 'robot', 'cat', 'star'], OLD_PLACES = ['class', 'lab', 'night', 'beach'];

  function ids(list) { return list.map(function (x) { return String(x[0]); }); }
  function idsOf(list) { return list.map(function (x) { return x.id; }); }
  function defaults() {
    return { v: 2, n: 'My game', src: 'short', ans: 'box', t: 1, f: 1, o: 4, ch: CH.slice(), w: 'race', r: 'step1', x: 'him1', s: 8,
      p: 'blob', d: [0, 0, 0, 0, 0], c: 0, op: 'examiner', od: [7, 3, 5, 4, 0], oc: 4, pl: 'class', pd: [0, 0, 1, 1], dy: '', dr: '', dp: '', th: [], e: 1 };
  }
  function oneOf(v, list, d) { return list.indexOf(String(v)) >= 0 ? v : d; }
  function num(v, lo, hi, d) { v = Math.round(+v); return v >= lo && v <= hi ? v : d; }
  function clamp(v, lo, hi, d) { v = Math.round(+v); return isNaN(v) ? d : Math.max(lo, Math.min(hi, v)); }
  // A game from anywhere (your saved games, a shared link) is checked card by card: anything unknown becomes the
  // default, so a broken or altered link still plays. The first version's links (v 1: a character and a background
  // by number, answers as 'box', 'mix' or 'type') still open.
  function clean(g) {
    var d = defaults(), o = { v: 2 };
    g = g && typeof g === 'object' ? g : {};
    var old = g.v === 1 || (g.q != null && g.ans == null);
    o.n = String(g.n || d.n).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NAME_MAX) || d.n;
    o.src = oneOf(g.src, ids(SOURCES), old ? 'all' : d.src);
    o.ans = old ? ({ box: 'box', type: 'type' }[g.q] || 'own') : oneOf(g.ans, ids(ANSWERS), d.ans);
    o.t = num(g.t, 0, 2, old ? 1 : d.t);
    o.f = num(g.f, 0, 2, old ? 0 : d.f);
    o.o = num(g.o, 2, 4, d.o);
    o.ch = (Array.isArray(g.ch) ? g.ch : []).map(Number).filter(function (c, i, all) { return CH.indexOf(c) >= 0 && all.indexOf(c) === i; });
    if (!o.ch.length) o.ch = CH.slice();
    o.ch.sort();
    o.w = WORLDS[g.w] ? g.w : d.w;
    var W = WORLDS[o.w];
    o.r = oneOf(g.r, ids(W.right), W.right[0][0]);
    o.x = oneOf(g.x, ids(W.wrong), W.wrong[0][0]);
    o.s = W.size.indexOf(+g.s) >= 0 ? +g.s : W.size[1];
    // Drawings (bio/maker-draw.js): a code that isn't a drawing is none, and what was drawn falls back to the default.
    var drawn = function (v, kind) { return DR && typeof v === 'string' && v && DR.decode(v, kind) ? v : ''; };
    var colour = function (v, def) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : num(v, 0, A.colours.length - 1, def); };
    o.dy = drawn(g.dy, 'char');
    o.dr = drawn(g.dr, 'char');
    o.dp = drawn(g.dp, 'place');
    o.p = g.p === 'draw' ? (o.dy ? 'draw' : d.p) : g.p === 'make' ? 'make' : oneOf(g.p, idsOf(A.players), old ? OLD_PLAYERS[num(g.a, 0, 3, 0)] : d.p);
    o.d = partsOf(g.d, d.d);
    o.c = colour(g.c, 0);
    o.op = g.op === 'draw' ? (o.dr ? 'draw' : d.op) : g.op === 'make' ? 'make' : oneOf(g.op, idsOf(A.rivals), d.op);
    o.od = partsOf(g.od, d.od);
    o.oc = colour(g.oc, d.oc);
    o.pl = g.pl === 'draw' ? (o.dp ? 'draw' : d.pl) : g.pl === 'make' ? 'make' : oneOf(g.pl, idsOf(A.places), old ? OLD_PLACES[num(g.b, 0, 3, 0)] : d.pl);
    var pd = Array.isArray(g.pd) ? g.pd : d.pd, PP = A.placeParts;
    o.pd = [num(pd[0], 0, PP.sky.length - 1, 0), num(pd[1], 0, PP.ground.length - 1, 0), num(pd[2], 0, PP.behind.length - 1, 1), num(pd[3], 0, PP.above.length - 1, 1)];
    o.th = (Array.isArray(g.th) ? g.th : []).filter(function (t) { return Array.isArray(t) && idsOf(A.things).indexOf(String(t[0])) >= 0; })
      .slice(0, THINGS_MAX).map(function (t) { return [String(t[0]), clamp(t[1], 3, 97, 50), clamp(t[2], 8, 84, 84)]; });
    o.e = num(g.e, 0, MOODS.length - 1, d.e);
    return o;
  }
  // A designed character: body, eyes, mouth, on top, extra (each a number into the library's parts).
  function partsOf(dd, def) {
    dd = Array.isArray(dd) ? dd : def;
    return ['body', 'eyes', 'mouth', 'top', 'extra'].map(function (k, i) { return num(dd[i], 0, A.parts[k].length - 1, def[i] || 0); });
  }
  // The link: the game as JSON in base64url after #play=.
  function encode(g) {
    var b = btoa(unescape(encodeURIComponent(JSON.stringify(clean(g)))));
    return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(code) {
    try {
      var b = String(code).replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      return clean(JSON.parse(decodeURIComponent(escape(atob(b)))));
    } catch (e) { return null; }
  }
  function linkOf(g) { return location.origin + location.pathname + '#play=' + encode(g); }

  // ======================================================================== the rules
  // A game's state: you (steps, blocks or points; your hearts in Battle), him (his steps in Race, his hearts in
  // Battle), lives (when a wrong answer costs one).
  function fresh(g) {
    return { you: g.w === 'battle' ? g.s : 0, him: g.w === 'race' ? -2 : g.w === 'battle' ? g.s : 0, lives: g.x === 'life' ? LIVES : 0, asked: 0, right: 0 };
  }
  // One answer: the new state and what happened, in a few words.
  function step(g, st, ok, typed) {
    var s = { you: st.you, him: st.him, lives: st.lives, asked: st.asked + 1, right: st.right + (ok ? 1 : 0) }, said;
    if (ok) {
      var two = g.r === 'step2' || (/t$/.test(g.r) && typed);
      if (g.w === 'race') { s.you = Math.min(g.s, s.you + (two ? 2 : 1)); said = two ? 'You move 2 steps.' : 'You move a step.'; }
      else if (g.w === 'battle') { s.him = Math.max(0, s.him - (two ? 2 : 1)); said = two ? 'A double hit!' : 'You hit him!'; }
      else if (g.w === 'tower') { s.you = Math.min(g.s, s.you + (two ? 2 : 1)); said = two ? 'Two blocks on.' : 'A block on.'; }
      else if (g.w === 'shoot') { s.you = Math.min(g.s, s.you + (two ? 2 : 1)); said = two ? 'Two goals!' : 'GOAL!'; }
      else if (g.w === 'grow') { s.you = Math.min(g.s, s.you + (two ? 2 : 1)); said = two ? 'Two new leaves.' : 'A new leaf.'; }
      else { s.you += two ? 200 : 100; said = two ? '+200' : '+100'; }
    } else if (g.x === 'life') { s.lives = Math.max(0, s.lives - 1); said = 'You lose a life.'; }
    else if (g.x === 'him1') { s.him += 1; said = 'He moves a step closer.'; }
    else if (g.x === 'back1') { s.you = Math.max(0, s.you - 1); said = 'You go back a step.'; }
    else if (g.x === 'hurt1') { s.you = Math.max(0, s.you - 1); said = 'He hits you.'; }
    else if (g.x === 'fall1') { s.you = Math.max(0, s.you - 1); said = s.you === st.you ? 'Nothing to fall off yet.' : 'A block falls off.'; }
    else if (g.x === 'wilt') { s.you = Math.max(0, s.you - 1); said = s.you === st.you ? 'Nothing to fall off yet.' : 'A leaf falls off.'; }
    else if (g.x === 'save') said = 'He saves it.';
    else if (g.x === 'hgoal') { s.him += 1; said = 'He scores.'; }
    else { s.you = Math.max(0, s.you - 50); said = '−50'; }
    return { st: s, said: said };
  }
  // 'win', 'lose' or '' (go on).
  function over(g, st) {
    if (g.w === 'battle') { if (st.him <= 0) return 'win'; if (st.you <= 0) return 'lose'; }
    else if (st.you >= g.s) return 'win';
    if (g.x === 'life' && st.lives <= 0) return 'lose';
    if (g.w === 'race' && g.x === 'him1' && st.him >= st.you) return 'lose';
    if (g.x === 'hgoal' && st.him >= g.s) return 'lose';
    return '';
  }

  // ======================================================================== the questions
  // Every question the games can ask, for every chapter, once: Exam drill's (the papers' short parts, their diagrams and
  // the new-course questions) and the papers' longer parts (more than two points, or a full-marks answer over 70
  // letters), each with its scheme points, a right answer that earns full marks and wrong ones that don't. Each has
  // the drill's id, so the memory is shared. size: 'short' (one point) or 'long'.
  var BANK = null;
  function B() { return window.BioApp; }
  function earner(pts) { return function (text) { var w = B().words(text || ''); return pts.filter(function (p) { return p.k && B().hasPoint(p, w); }).length; }; }
  function plain(t) { return String(t).replace(/\s*\(((\d+|one|two|three) of )?\d+ points?\)\s*$/i, ''); }
  function where(q, label) {
    var m = q.id.match(/^(?:(\d{4})|S(\d))-Q(\d+)([a-z]?)/);
    if (!m) return q.id;
    return (m[1] || 'Sample Paper ' + m[2] + ' (2027)') + ' · Question ' + m[3] + (m[4] ? '(' + m[4] + ')' : '') + label.replace(/\s+/g, '').replace(/\.$/, '');
  }
  function longItems(ch, have) {
    var Q = ((window.BioQuestions || {})[ch] || {}).questions || [], C = (window.BioChecks || {})[ch] || {}, OFF = window.BioDrillOff || { parts: {} }, out = [];
    Q.forEach(function (q) {
      q.parts.forEach(function (p, k) {
        var c = (C[q.id] || [])[k], id = 'e' + ch + ':' + q.id + ':' + k;
        if (!c || have[id] || !p.out || (OFF.parts[ch] || []).indexOf(q.id + ':' + k) >= 0 || p.kind !== 'text' || c.board === false || /^(True|False)$/.test(c.right)) return;
        var keyed = p.pts.filter(function (t) { return t.k && !t.self; });
        if (!keyed.length) return;
        var asked = c.q.match(/\((\d) points\)$/), full = Math.min(p.n || 1, keyed.length), need = Math.min(asked ? +asked[1] : 1, full);
        if (c.right.length <= 70 && need <= 2) return;
        var per = p.m && p.n ? p.m / p.n : keyed[0].m || 3;
        var it = { id: id, kind: 'long', ch: ch, from: (need < full ? 'Based on ' : '') + where(q, p.l), q: plain(typeof c.board === 'string' ? c.board : c.q),
          marks: Math.round(per * need), need: need, pts: keyed, right: c.right, wrong: c.wrong.slice(), why: c.why };
        it.earned = earner(keyed);
        if (it.earned(it.right) < need || it.wrong.some(function (w) { return it.earned(w) >= need; })) return;
        out.push(it);
      });
    });
    return out;
  }
  function bank() {
    if (BANK) return BANK;
    var D = window.BioDrill;
    if (!D || !B()) return [];
    BANK = [];
    CH.forEach(function (ch) {
      var have = {}, list = D.items(ch);
      list.forEach(function (it) { have[it.id] = 1; });
      list.concat(longItems(ch, have)).forEach(function (it) {
        it.size = it.kind === 'diagram' || it.need === 1 ? 'short' : 'long';
        BANK.push(it);
      });
    });
    return BANK;
  }
  function stages() { try { return JSON.parse(K.store('bio-drill') || '{}') || {}; } catch (e) { return {}; } }
  function isFig(it) { return it.kind === 'diagram'; }
  // The questions a game asks: main (the source's) and figs (diagrams mixed in, when you design your own). A source
  // that comes up empty (nothing wrong yet, nothing left to do) falls back to all of them, with a note.
  function questionsFor(g) {
    var all = bank().filter(function (it) { return g.ch.indexOf(it.ch) >= 0; }), st = stages();
    var base = g.ans === 'fig' ? all.filter(isFig) : all.filter(function (it) {
      if (isFig(it)) return false;
      if (g.src === 'short') return it.kind === 'exam' && it.size === 'short';
      if (g.src === 'long') return it.kind !== 'new' && it.size === 'long';
      if (g.src === 'new') return it.kind === 'new';
      return true;
    });
    var figs = g.ans === 'own' && g.f > 0 ? all.filter(isFig) : [];
    var by = function (list) {
      if (g.src === 'wrong') return list.filter(function (it) { return st[it.id] && st[it.id].s === 'box'; });
      if (g.src === 'fresh') return list.filter(function (it) { return !st[it.id]; });
      return list;
    };
    var main = by(base), more = by(figs), note = '';
    if (!main.length && !more.length && (g.src === 'wrong' || g.src === 'fresh')) {
      note = g.src === 'wrong' ? 'You haven\'t got any wrong yet. All of them, then.' : 'You\'ve met them all. All of them, then.';
      main = base;
      more = figs;
    }
    if (!main.length) { main = more; more = []; }
    return { main: main, figs: more, note: note };
  }
  // How a game asks: typing 0 never, 1 sometimes (every third, and whenever one is due to type), 2 always.
  function typing(g) { return g.ans === 'own' ? g.t : g.ans === 'type' ? 2 : g.ans === 'box' ? 0 : 1; }
  function choices(g) { return g.ans === 'own' ? g.o : 4; }
  // The next question: the best-ranked one not asked in the last few (due to type, then wrong, then new, then learnt;
  // a slot that wants typing takes due-to-type, then new, then wrong), one of those at random.
  function nextQuestion(S, g) {
    var mode = typing(g), k = S.asked, st = stages();
    var figTurn = S.qs.figs.length && (g.f === 2 ? k % 2 === 1 : k % 4 === 3);
    var list = figTurn ? S.qs.figs : S.qs.main, slot = mode === 2 || (mode === 1 && k % 3 === 2), best = [], rank = 99;
    list.forEach(function (it) {
      var s = st[it.id] && st[it.id].s, r;
      if (s === 'type') r = mode ? 0 : 4;
      else if (s === 'box') r = slot ? 2 : 1;
      else if (!s) r = slot ? 1 : 2;
      else r = 3;
      var last = S.recent[it.id];
      if (last != null && k - last < (r === 0 ? LATER.type : LATER.box)) r += 5;
      if (r < rank) { rank = r; best = []; }
      if (r === rank) best.push(it);
    });
    if (!best.length) return null;
    var it = pick(best);
    S.recent[it.id] = k + 1;
    return { it: it, typed: mode === 2 || (mode === 1 && (slot || rank === 0)) };
  }
  // A diagram question can also be asked by tapping the part on the diagram, when it has at least three parts to tap.
  function tapSpots(it) {
    return bank().filter(function (x) { return x.kind === 'diagram' && x.fig === it.fig; }).map(function (x) { return x.spot; })
      .filter(function (s, i, all) { return all.indexOf(s) === i; });
  }

  // ======================================================================== drawing
  function drawnImg(code, kind, cls) { return '<img class="' + cls + '" src="' + (DR ? DR.image(code, kind) : '') + '" alt="">'; }
  function meIcon(g, size) { return g.p === 'draw' ? drawnImg(g.dy, 'char', 'mk-drawn-icon') : A.playerSvg({ p: g.p, d: g.d, c: g.c }, size); }
  function you(g, size) { return '<span class="mk-me' + (g.p === 'draw' ? ' mk-me--drawn' : '') + '">' + meIcon(g, size || 64) + '</span>'; }
  function rival(g) {
    if (g.op === 'draw') return '<span class="mk-him mk-him--drawn" aria-hidden="true">' + drawnImg(g.dr, 'char', '') + '</span>';
    return '<span class="mk-him" aria-hidden="true">' + (g.op === 'make' ? A.playerSvg({ p: 'make', d: g.od, c: g.oc }, 80) : g.op === 'examiner' ? K.face || '' : A.rivalSvg(g.op, 80)) + '</span>';
  }
  function rivalName(g) { return g.op === 'draw' ? 'your drawn opponent' : g.op === 'make' ? 'your own opponent' : nameOf(A.rivals, g.op); }
  // Grow: a plant in a pot, a leaf for each right answer, a flower when it's grown.
  function plant(g, st) {
    var base = 188, gap = 150 / g.s, done = st.you >= g.s, top = base - Math.max(14, st.you * gap) - (done ? 12 : 0), out = '';
    out += '<path d="M50 ' + base + 'V' + top.toFixed(1) + '" stroke="' + A.INK + '" stroke-width="10" stroke-linecap="round"/><path d="M50 ' + base + 'V' + top.toFixed(1) + '" stroke="#3E9B4F" stroke-width="5" stroke-linecap="round"/>';
    for (var i = 0; i < st.you; i++) {
      var y = base - (i + 0.75) * gap, k = i % 2 ? 1 : -1, x = function (v) { return (50 + k * v).toFixed(1); };
      out += '<path class="mk-leaf' + (i === st.you - 1 ? ' is-new' : '') + '" style="transform-origin:50px ' + y.toFixed(1) + 'px" d="M50 ' + y.toFixed(1) + 'Q' + x(18) + ' ' + (y - 20).toFixed(1) + ' ' + x(40) + ' ' + (y - 8).toFixed(1) +
        'Q' + x(22) + ' ' + (y + 8).toFixed(1) + ' 50 ' + y.toFixed(1) + 'Z" fill="#4CB944" stroke="' + A.INK + '" stroke-width="2.6" stroke-linejoin="round"/>';
    }
    if (done) {
      var c = A.colourOf(g.c) === '#58CC02' ? '#FF86D0' : A.colourOf(g.c);
      for (var p = 0; p < 6; p++) { var a = p * Math.PI / 3; out += '<circle cx="' + (50 + 11 * Math.cos(a)).toFixed(1) + '" cy="' + (top + 11 * Math.sin(a)).toFixed(1) + '" r="8" fill="' + c + '" stroke="' + A.INK + '" stroke-width="2.4"/>'; }
      out += '<circle cx="50" cy="' + top.toFixed(1) + '" r="7" fill="#FFC800" stroke="' + A.INK + '" stroke-width="2.4"/>';
    }
    return '<svg viewBox="0 0 100 220" aria-hidden="true">' + out + '<path d="M26 184H74V194H26Z" fill="#FF9600" stroke="' + A.INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M30 194H70L65 219H35Z" fill="#FF9600" stroke="' + A.INK + '" stroke-width="3" stroke-linejoin="round"/></svg>';
  }
  var BALL = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10.5" fill="#FFFFFF" stroke="#13294A" stroke-width="2.4"/><path d="M0 -4L3.8 -1.2L2.4 3.2H-2.4L-3.8 -1.2Z" fill="#13294A"/></svg>';
  var NET = (function () {
    var lines = '';
    for (var v = 21; v < 110; v += 13) lines += 'M' + v + ' 10V88';
    for (var h = 23; h < 88; h += 13) lines += 'M12 ' + h + 'H108';
    return '<svg class="mk-net" viewBox="0 0 120 90" aria-hidden="true"><path d="' + lines + '" stroke="#C9D2DA" stroke-width="1.6"/><path d="M8 89V6H112V89" fill="none" stroke="#13294A" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M8 89V6H112V89" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/></svg>';
  })();
  function heart(on) { return '<svg class="mk-heart' + (on ? '' : ' is-gone') + '" viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17S1 11 1 5.5A4.5 4.5 0 0 1 10 3.5A4.5 4.5 0 0 1 19 5.5C19 11 10 17 10 17Z"/></svg>'; }
  function placeOf(g) {
    if (g.pl === 'draw') return { id: 'draw', name: 'Your drawn place', dark: DR ? DR.isDark(g.dp) : false };
    return g.pl === 'make' ? { id: 'make', name: 'Your own place', dark: A.placeDark(g.pd) } : A.places.filter(function (p) { return p.id === g.pl; })[0] || A.places[0];
  }
  function nameOf(list, id) { var x = list.filter(function (o) { return o.id === id; })[0]; return x ? x.name : ''; }
  function playerName(g) { return g.p === 'draw' ? 'your drawing' : g.p === 'make' ? 'your own character' : nameOf(A.players, g.p); }
  // The world as the game stands: the place, your things, the pieces where they are, and the counters. edit: the things
  // can be tapped (to pick one) and the picture tapped (to move it).
  function worldHtml(g, st, edit) {
    var W = WORLDS[g.w], x = '';
    if (g.w === 'race') {
      // He starts two squares behind you, so those two squares are drawn before yours (greyed).
      var back = g.x === 'him1' ? 2 : 0, n = g.s + 1 + back,
        at = function (v) { return 'calc(30px + (100% - 60px) * ' + ((Math.max(-back, v) + back + 0.5) / n).toFixed(4) + ')'; };
      x += '<div class="mk-track">' + new Array(back + 1).join('<i class="is-back"></i>') + new Array(g.s + 2).join('<i></i>') + '</div><span class="mk-flag" aria-hidden="true"></span>' +
        (g.x === 'him1' ? '<span class="mk-tok mk-tok--him" style="left:' + at(st.him) + '">' + rival(g) + '</span>' : '') +
        '<span class="mk-tok mk-tok--you" style="left:' + at(st.you) + '">' + you(g) + '</span>';
    } else if (g.w === 'battle') {
      var hearts = function (v) { var h = ''; for (var i = 0; i < g.s; i++) h += heart(i < v); return '<span class="mk-hearts">' + h + '</span>'; };
      x += '<span class="mk-side mk-side--you">' + hearts(st.you) + you(g) + '</span><span class="mk-vs">VS</span>' +
        '<span class="mk-side mk-side--him">' + hearts(st.him) + rival(g) + '</span>';
    } else if (g.w === 'tower') {
      var b = '';
      for (var i = 0; i < st.you; i++) b += '<i style="background:' + A.colourOf(g.c) + '"></i>';
      x += '<span class="mk-goal"></span><span class="mk-stack" style="--n:' + g.s + '">' + b + '</span>' +
        '<span class="mk-tok mk-tok--builder">' + you(g) + '</span><span class="mk-watch">' + rival(g) + '</span>';
    } else if (g.w === 'shoot') {
      x += '<span class="mk-score" aria-label="You ' + st.you + ', him ' + st.him + '"><b class="num">' + st.you + '</b><i>\u2013</i><b class="num">' + st.him + '</b><span>first to ' + g.s + '</span></span>' +
        '<span class="mk-goalbox">' + NET + '<span class="mk-keeper">' + rival(g) + '</span></span><span class="mk-tok mk-tok--kicker">' + you(g) + '</span><span class="mk-ball">' + BALL + '</span>';
    } else if (g.w === 'grow') {
      x += '<span class="mk-count"><b class="num">' + st.you + '</b> of ' + g.s + ' leaves</span><span class="mk-plant">' + plant(g, st) + '</span>' +
        '<span class="mk-tok mk-tok--builder">' + you(g) + '</span><span class="mk-watch">' + rival(g) + '</span>';
    } else {
      x += '<span class="mk-points"><b class="num">' + st.you + '</b><span>of ' + g.s + '</span></span>' +
        '<span class="mk-bar"><i style="width:' + Math.min(100, st.you / g.s * 100) + '%;background:' + A.colourOf(g.c) + '"></i></span>' +
        '<span class="mk-tok mk-tok--score">' + you(g) + '</span><span class="mk-watch">' + rival(g) + '</span>';
    }
    var lives = '';
    if (g.x === 'life') { for (var l = 0; l < LIVES; l++) lives += heart(l < st.lives); lives = '<span class="mk-lives" aria-label="' + st.lives + ' lives">' + lives + '</span>'; }
    var things = g.th.map(function (t, i) {
      return '<span class="mk-thing' + (edit && M && M.sel === i ? ' is-sel' : '') + '" style="left:' + t[1] + '%;top:' + t[2] + '%"' + (edit ? ' data-mk-thing="' + i + '"' : '') + '>' + A.thingSvg(t[0]) + '</span>';
    }).join('');
    return '<div class="mk-world mk-world--' + g.w + (placeOf(g).dark ? ' is-dark' : '') + (edit ? ' is-edit' : '') + '" role="img" aria-label="' +
      esc(W.name + ': ' + playerName(g) + ' against ' + rivalName(g) + ', ' + placeOf(g).name) + '"' + (edit ? ' data-mk-stage' : '') + '>' +
      (g.pl === 'draw' ? drawnImg(g.dp, 'place', 'mk-place mk-place--drawn') : A.placeSvg(g.pl, g.pd)) + '<div class="mk-things">' + things + '</div>' + x + lives + '</div>';
  }
  // Small pictures for the question cards.
  var ICON = {
    short: '<rect x="8" y="12" width="32" height="24" rx="4" fill="#FFFFFF"/><path d="M14 21H34" stroke="#13294A" stroke-width="3" stroke-linecap="round"/><path d="M14 28H26" stroke="#1CB0F6" stroke-width="3" stroke-linecap="round"/>',
    long: '<rect x="8" y="6" width="32" height="36" rx="4" fill="#FFFFFF"/><path d="M14 14H34M14 20H34M14 26H34M14 32H28" stroke="#13294A" stroke-width="3" stroke-linecap="round"/><path d="M14 38H22" stroke="#1CB0F6" stroke-width="3" stroke-linecap="round"/>',
    more: '<circle cx="12" cy="24" r="4" fill="#FFFFFF"/><circle cx="24" cy="24" r="4" fill="#FFFFFF"/><circle cx="36" cy="24" r="4" fill="#FFFFFF"/>',
    all: '<rect x="6" y="8" width="16" height="14" rx="3" fill="#1CB0F6"/><rect x="26" y="8" width="16" height="14" rx="3" fill="#FFC800"/><rect x="6" y="26" width="16" height="14" rx="3" fill="#CE82FF"/><rect x="26" y="26" width="16" height="14" rx="3" fill="#FF9600"/>',
    wrong: '<circle cx="24" cy="24" r="16" fill="#FF4B4B"/><path d="M18 18L30 30M30 18L18 30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>',
    fresh: '<path d="M24 6L28.5 18.5L42 19L31.5 27L35 40L24 32.5L13 40L16.5 27L6 19L19.5 18.5Z" fill="#FFC800"/>',
    new: '<rect x="8" y="10" width="32" height="28" rx="5" fill="#2BD4BD"/><path d="M15 30V18L22 30V18M27 18H33M27 24H32M27 30H33" stroke="#13294A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    box: '<rect x="6" y="6" width="16" height="16" rx="3" fill="#FFFFFF"/><rect x="26" y="6" width="16" height="16" rx="3" fill="#58CC02"/><path d="M29.5 14L33 17.5L39 10.5" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="26" width="16" height="16" rx="3" fill="#FFFFFF"/><rect x="26" y="26" width="16" height="16" rx="3" fill="#FFFFFF"/>',
    type: '<rect x="4" y="12" width="40" height="24" rx="4" fill="#FFFFFF"/><path d="M10 20H14M18 20H22M26 20H30M34 20H38M10 28H38" stroke="#13294A" stroke-width="3" stroke-linecap="round"/>',
    fig: '<path d="M10 40C4 30 8 14 18 10C22 9 23 14 23 20V40ZM38 40C44 30 40 14 30 10C26 9 25 14 25 20V40Z" fill="#FF86D0"/><path d="M24 4V22" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="26" r="6" fill="#13294A" stroke="#FFFFFF" stroke-width="2.4"/>',
    own: '<path d="M8 14H40M8 24H40M8 34H40" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="14" r="5" fill="#FFC800"/><circle cx="32" cy="24" r="5" fill="#1CB0F6"/><circle cx="14" cy="34" r="5" fill="#FF86D0"/>',
    race: '<path d="M4 38H11M14 38H21M24 38H31" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/><path d="M34 38H43" stroke="#FFC800" stroke-width="4" stroke-linecap="round"/><path d="M38 34V8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/><path d="M39 8H48L44 13L48 18H39Z" fill="#FF4B4B"/><circle cx="12" cy="28" r="6" fill="#1CB0F6"/>',
    battle: '<path d="M13 30S3 23 3 16A5.5 5.5 0 0 1 13 13A5.5 5.5 0 0 1 23 16C23 23 13 30 13 30Z" fill="#FF4B4B"/><path d="M35 40S25 33 25 26A5.5 5.5 0 0 1 35 23A5.5 5.5 0 0 1 45 26C45 33 35 40 35 40Z" fill="#C9D2DA"/><path d="M28 6L20 20" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>',
    tower: '<rect x="14" y="32" width="20" height="10" rx="2" fill="#1CB0F6"/><rect x="14" y="21" width="20" height="10" rx="2" fill="#FFC800"/><rect x="14" y="10" width="20" height="10" rx="2" fill="#CE82FF"/><path d="M6 6H42" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="4 4"/>',
    points: '<rect x="4" y="14" width="40" height="20" rx="10" fill="#FFFFFF"/><text x="24" y="29" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="14" fill="#13294A">+100</text>',
    shoot: '<path d="M18 40V8H46V40" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/><path d="M24 14V40M30 14V40M36 14V40M42 14V40M22 20H44M22 28H44" stroke="#5B6B80" stroke-width="1.5"/><circle cx="9" cy="34" r="6" fill="#FFFFFF" stroke="#13294A" stroke-width="2"/>',
    grow: '<path d="M24 42V16" stroke="#4CB944" stroke-width="4" stroke-linecap="round"/><path d="M24 30Q12 22 6 28Q14 36 24 30ZM24 22Q36 12 42 18Q34 28 24 22Z" fill="#4CB944"/><circle cx="24" cy="12" r="6" fill="#FF86D0"/><circle cx="24" cy="12" r="2.6" fill="#FFC800"/>'
  };
  function icon(k) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + ICON[k] + '</svg>'; }
  // A real exam diagram cut from its page (as in Exam drill), its printed names covered: an X with a letter on the part
  // (name it), or a ring on every part (tap it).
  function figure(it, tap) {
    var r = it.fig, P = [2055, 2908], px = function (x, y) { return [x * P[0] / 100, y * P[1] / 100]; }, n = function (v) { return v.toFixed(1); };
    var a = px(r.box[0], r.box[1]), b = px(r.box[2], r.box[3]), k = b[0] / 480;
    var marks = '';
    if (tap) marks = tap.map(function (si, i) {
      var s = px(r.spots[si].at[0], r.spots[si].at[1]);
      return '<g class="mk-spot" data-mk-spot="' + si + '" tabindex="0" role="button" aria-label="Part ' + (i + 1) + '"><circle cx="' + n(s[0]) + '" cy="' + n(s[1]) + '" r="' + n(20 * k) + '" fill="#FFFFFF" fill-opacity=".01" stroke="#13294A" stroke-width="' + n(4.5 * k) + '"/>' +
        '<circle cx="' + n(s[0]) + '" cy="' + n(s[1]) + '" r="' + n(6 * k) + '" fill="#13294A"/><circle cx="' + n(s[0]) + '" cy="' + n(s[1]) + '" r="' + n(30 * k) + '" fill="transparent"/></g>';
    }).join('');
    else if (it.mark) {
      var s = px(r.spots[it.spot].at[0], r.spots[it.spot].at[1]);
      marks = '<circle cx="' + n(s[0]) + '" cy="' + n(s[1]) + '" r="' + n(15 * k) + '" fill="#13294A" stroke="#FFFFFF" stroke-width="' + n(3 * k) + '"/>' +
        '<text x="' + n(s[0]) + '" y="' + n(s[1]) + '" font-size="' + n(18 * k) + '" font-family="Nunito, sans-serif" font-weight="800" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">' + it.letter + '</text>';
    }
    return '<div class="ed-fig mk-fig"><svg viewBox="' + [a[0], a[1], b[0], b[1]].map(n).join(' ') + '" role="img"><title>' + esc(r.src) + '</title>' +
      '<image href="' + esc(r.img) + '" width="' + P[0] + '" height="' + P[1] + '" preserveAspectRatio="none"/>' +
      (r.cover || []).map(function (c) { var p = px(c[0], c[1]), q2 = px(c[2], c[3]); return '<rect x="' + n(p[0]) + '" y="' + n(p[1]) + '" width="' + n(q2[0]) + '" height="' + n(q2[1]) + '" fill="' + (c[4] || '#FFFFFF') + '"/>'; }).join('') +
      marks + '</svg></div>';
  }

  // ======================================================================== the maker
  var M = null;
  function live() { return M && M.card.isConnected; }
  function q(sel) { return M.card.querySelector(sel); }
  // Your best at each game (by its link): how many times you've won, and the fewest answers you won in.
  function bests() { try { return JSON.parse(K.store('bio-made-best') || '{}') || {}; } catch (e) { return {}; } }
  function bestOf(g) { return bests()[encode(g)] || null; }
  function record(g, won, asked) {
    var all = bests(), k = encode(g), b = all[k] || { won: 0, best: 0 }, out = {};
    if (won) { b.won += 1; if (!b.best || asked < b.best) b.best = asked; }
    b.t = Date.now();
    all[k] = b;
    Object.keys(all).sort(function (x, y) { return all[y].t - all[x].t; }).slice(0, 50).forEach(function (x) { out[x] = all[x]; });
    K.store('bio-made-best', JSON.stringify(out));
    return b;
  }
  function saved() { try { var l = JSON.parse(K.store('bio-made') || '[]'); return Array.isArray(l) ? l.map(clean) : []; } catch (e) { return []; } }
  function keep(list) { K.store('bio-made', JSON.stringify(list.slice(0, 20))); }
  function host(label) {
    M = { card: BK.host(28, label), g: defaults(), st: null, step: 0, more: false, tab: 'ready', otab: 'ready', ptab: 'ready', sel: -1, lib: 'players', libSel: null, phase: '' };
    K.gameHud(M.card, 0, '');
    return M;
  }
  function show(html, btns) {
    BK.body(M.card, html, true);
    var card = M.card.querySelector('.am-finish__card');
    card.classList.add('tb-wide');
    // Making it (not playing): Back and Continue stay at the bottom of the card while you scroll.
    card.classList.toggle('mk-host', ['wizard', 'summary', 'library', 'home', 'link', 'draw'].indexOf(M.phase) >= 0);
    BK.buttons(M.card, btns || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(M.card);
  }
  function keepScroll(fn) { var y = M.card.querySelector('.am-games__body, [data-am-gbody]'), top = y ? y.scrollTop : 0; fn(); y = M.card.querySelector('.am-games__body, [data-am-gbody]'); if (y) y.scrollTop = top; }
  // A card to tap: picture, title, a line under it.
  function opt(key, val, title, desc, art, on, cls) {
    return '<button type="button" class="mk-opt' + (cls ? ' ' + cls : '') + (on ? ' is-on' : '') + '" aria-pressed="' + Boolean(on) + '" data-mk-pick="' + key + '" data-mk-val="' + esc(String(val)) + '">' +
      (art ? '<span class="mk-opt__art">' + art + '</span>' : '') + '<span class="mk-opt__t">' + title + '</span>' + (desc ? '<span class="mk-opt__d">' + desc + '</span>' : '') + '</button>';
  }
  // A row of small choices.
  function chips(label, key, list, now) {
    return '<fieldset class="mk-row"><legend>' + label + '</legend><div class="mk-chips">' + list.map(function (o) {
      var on = String(o[0]) === String(now);
      return '<button type="button" class="mk-chip' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-mk-pick="' + key + '" data-mk-val="' + esc(String(o[0])) + '">' + o[1] + '</button>';
    }).join('') + '</div></fieldset>';
  }
  // The site's colours, then More colours: the colour wheel (any colour at all).
  var WHEEL_ICON = '<svg viewBox="-14 -14 28 28" aria-hidden="true">' + ['#FF4B4B', '#FF9600', '#FFC800', '#58CC02', '#1CB0F6', '#CE82FF'].map(function (c, i) {
    var a = i * Math.PI / 3, b = a + Math.PI / 3;
    return '<path d="M0 0L' + (12 * Math.cos(a)).toFixed(1) + ' ' + (12 * Math.sin(a)).toFixed(1) + 'A12 12 0 0 1 ' + (12 * Math.cos(b)).toFixed(1) + ' ' + (12 * Math.sin(b)).toFixed(1) + 'Z" fill="' + c + '"/>';
  }).join('') + '<circle r="12" fill="none" stroke="#13294A" stroke-width="2"/></svg>';
  function swatches(now, key) {
    var any = typeof now === 'string';
    return '<fieldset class="mk-row"><legend>Colour</legend><div class="mk-chips">' + A.colours.map(function (c, i) {
      return '<button type="button" class="mk-chip mk-chip--sw' + (i === now ? ' is-on' : '') + '" aria-pressed="' + (i === now) + '" aria-label="' + A.colourNames[i] + '" data-mk-pick="' + key + '" data-mk-val="' + i + '"><i class="mk-swatch" style="background:' + c + '"></i></button>';
    }).join('') + (DR ? '<button type="button" class="mk-chip mk-chip--wheel' + (any ? ' is-on' : '') + '" aria-expanded="' + (M.wheel === key) + '" data-mk-wheel="' + key + '">' +
      (any ? '<i class="mk-swatch" style="background:' + now + '"></i>' : WHEEL_ICON) + 'More colours</button>' : '') + '</div>' +
      (DR && M.wheel === key ? '<div class="mk-wheelbox" data-mk-wheelbox="' + key + '"></div>' : '') + '</fieldset>';
  }
  // Ready-made, design your own, or draw your own (for you: key 'tab'; for him: 'otab'; the place: 'ptab').
  function tabs(key, now, ready) {
    return '<div class="mk-tabs" role="tablist">' + [['ready', ready], ['make', 'Design your own']].concat(DR ? [['draw', 'Draw your own']] : []).map(function (t) {
      return '<button type="button" role="tab" class="mk-tab' + (now === t[0] ? ' is-on' : '') + '" aria-selected="' + (now === t[0]) + '" data-mk-' + key + '="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  // Draw your own (bio/maker-draw.js): which is 'y' (you), 'r' (him) or 'p' (the place).
  var DRAW = {
    y: { field: 'dy', pick: 'p', kind: 'char', title: 'Draw yourself', hint: 'Draw yourself, big: it\'s shrunk to fit the game. Tidy up can neaten your lines into shapes.', say: 'Draw yourself. Go on.' },
    r: { field: 'dr', pick: 'op', kind: 'char', title: 'Draw who you\'re up against', hint: 'Draw who you\'re up against. Make them scary.', say: 'Draw me. Flatteringly.' },
    p: { field: 'dp', pick: 'pl', kind: 'place', title: 'Draw your place', hint: 'Draw your own place. The dashed line is the ground the players stand on.', say: 'Draw me a world.' }
  };
  var PENCIL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32L10 24L26 8L32 14L16 30Z" fill="#FFC800" stroke="#13294A" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 32L10 24L16 30Z" fill="#13294A"/></svg>';
  function drawPanel(which) {
    var g = M.g, W = DRAW[which], code = g[W.field];
    return '<div class="mk-drawn">' + (code ? drawnImg(code, W.kind, 'mk-drawn__img mk-drawn__img--' + W.kind) : '') + '<p class="mk-hint">' + (code ? 'Your drawing.' + (g[W.pick] === 'draw' ? '' : ' Tap it to use it.') : W.hint) + '</p>' +
      (which === 'p' && !code ? '<div class="mk-chips mk-starts">' + Object.keys(DR.STARTS).map(function (k) {
        var S = DR.STARTS[k];
        return '<button type="button" class="mk-chip" data-mk-draw="p" data-mk-start="' + k + '"><i class="mk-start"><b style="background:' + S[1] + '"></b><b style="background:' + S[2] + '"></b></i>' + S[0] + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="mk-chips">' + (code && g[W.pick] !== 'draw' ? '<button type="button" class="mk-opt mk-opt--new" data-mk-usedraw="' + which + '"><span class="mk-opt__t">Use my drawing</span></button>' : '') +
      '<button type="button" class="mk-opt mk-opt--draw' + (code ? '' : ' mk-opt--new') + '" data-mk-draw="' + which + '"><span class="mk-opt__art">' + PENCIL + '</span><span class="mk-opt__t">' + (code ? 'Change my drawing' : which === 'p' ? 'Start drawing (sky and grass)' : 'Start drawing') + '</span></button>' +
      (code ? '<button type="button" class="mk-mini" data-mk-undraw="' + which + '">Rub it out</button>' : '') + '</div></div>';
  }
  // The tab picks what's on it: Design your own uses the designed one; Draw your own uses your drawing, if there is one.
  function pickTab(key, tab) {
    var field = { p: 'dy', op: 'dr', pl: 'dp' }[key];
    if (tab === 'make') M.g[key] = 'make';
    else if (tab === 'draw' && M.g[field]) M.g[key] = 'draw';
    keepScroll(wizard);
  }
  function studio(which, start) {
    var W = DRAW[which];
    if (!DR || !W) return;
    M.phase = 'draw';
    show('<div class="mk mk-draw"><h3 class="mk-ask">' + W.title + '</h3><div data-mk-studio></div></div>', [['more', 'data-mk-dcancel', 'Cancel'], ['ok', 'data-mk-ddone', 'Done']]);
    M.studio = { which: which, it: DR.mount(q('[data-mk-studio]'), { kind: W.kind, code: start ? '' : M.g[W.field], start: start || 'g', say: function (line) { K.mascot('ok', line); } }) };
    K.mascot('ok', W.say);
  }
  function drawn() {
    if (!M.studio) return;
    var W = DRAW[M.studio.which], r = M.studio.it.code();
    if (r.error) { K.mascot('ok', r.error); return; }
    M.g[W.field] = r.code;
    M.g[W.pick] = 'draw';
    M.g = clean(M.g);
    M.studio = null;
    tabsFor();
    wizard();
    K.mascot('ok', pick(['Hmph. Not bad.', 'A masterpiece. Nearly.', 'I\'ve seen worse.']));
  }
  function undraw(which) {
    var W = DRAW[which];
    M.g[W.field] = '';
    if (M.g[W.pick] === 'draw') M.g[W.pick] = defaults()[W.pick];
    M.g = clean(M.g);
    keepScroll(wizard);
  }
  // Design your own place: the sky and the ground (colours), what's behind and what's in the sky (small pictures).
  function placeBuilder() {
    var g = M.g, PP = A.placeParts;
    var row = function (label, i, names, art) {
      return '<fieldset class="mk-row"><legend>' + label + '</legend><div class="mk-chips">' + names.map(function (name, k) {
        var on = g.pd[i] === k;
        return '<button type="button" class="mk-chip mk-chip--' + (art ? 'place' : 'sw') + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" aria-label="' + esc(name) + '" title="' + esc(name) + '" data-mk-ppart="' + i + '" data-mk-val="' + k + '">' +
          (art ? art(k) : '<i class="mk-swatch" style="background:' + (i ? PP.groundColours[k] : PP.skyColours[k]) + '"></i>') + '</button>';
      }).join('') + '</div></fieldset>';
    };
    var thumb = function (i) { return function (k) { var pd = g.pd.slice(); pd[i] = k; return A.placeSvg('make', pd); }; };
    return '<div class="mk-build__rows">' + row('Sky', 0, PP.sky) + row('Ground', 1, PP.ground) + row('Behind', 2, PP.behind, thumb(2)) + row('In the sky', 3, PP.above, thumb(3)) + '</div>';
  }
  // Design your own character (who: 'p' you, 'o' him): a big picture, then a row of each part, zoomed on that part.
  var ROWS = [['body', 'Body'], ['eyes', 'Eyes'], ['mouth', 'Mouth'], ['top', 'On top'], ['extra', 'Extra']];
  function builder(who) {
    var g = M.g, d = who === 'o' ? g.od : g.d, c = who === 'o' ? g.oc : g.c;
    return '<div class="mk-build"><div class="mk-build__me">' + A.playerSvg({ p: 'make', d: d, c: c }, 132) +
      '<button type="button" class="mk-mini" data-mk-random="' + who + '">Surprise me</button></div><div class="mk-build__rows">' +
      ROWS.map(function (row, ri) {
        return '<fieldset class="mk-row"><legend>' + row[1] + '</legend><div class="mk-chips mk-chips--parts">' + A.parts[row[0]].map(function (part, pi) {
          var dd = d.slice(), on = d[ri] === pi;
          dd[ri] = pi;
          return '<button type="button" class="mk-chip mk-chip--part' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" aria-label="' + esc(A.partName(row[0], part)) + '" title="' + esc(A.partName(row[0], part)) + '" data-mk-part="' + who + ri + '" data-mk-val="' + pi + '">' +
            A.partSvg(row[0], dd, c, 58) + '</button>';
        }).join('') + '</div></fieldset>';
      }).join('') + swatches(c, who === 'o' ? 'oc' : 'c') + '</div></div>';
  }
  // How many questions a source has in your chapters (for the cards).
  function count(g) { var Q = questionsFor(g); return Q.note ? 0 : Q.main.length + Q.figs.length; }
  function plural(n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); }

  // The home: your games, a new one, the library. With no games yet, it starts on the first question.
  function open(g) {
    if (!live()) host('Make your own games');
    if (g) { M.g = clean(g); summary(); return; }
    if (!saved().length) { start(); return; }
    home();
  }
  function home() {
    M.phase = 'home';
    var mine = saved();
    show('<div class="mk"><h3 class="mk-title">Make your own games</h3><div class="mk-big">' +
      '<button type="button" class="mk-opt mk-opt--new" data-mk-new><span class="mk-opt__art">' + A.playerSvg({ p: 'blob', c: 1 }, 56) + '</span><span class="mk-opt__t">Make a new game</span></button>' +
      '<button type="button" class="mk-opt" data-mk-lib><span class="mk-opt__art">' + A.thingSvg('books') + '</span><span class="mk-opt__t">Asset library</span></button></div>' +
      (mine.length ? '<section class="mk-mine" aria-label="Your games"><h3 class="mk-h">Your games</h3><ul>' + mine.map(function (x, i) {
        var best = bestOf(x);
        return '<li><span class="mk-mine__av">' + meIcon(x, 40) + '</span><b>' + esc(x.n) + '</b><span class="mk-mine__w">' + WORLDS[x.w].name +
          (best && best.best ? ' · best ' + best.best : '') + '</span>' +
          '<button type="button" class="mk-mini mk-mini--go" data-mk-play="' + i + '">Play</button><button type="button" class="mk-mini" data-mk-edit="' + i + '">Edit</button>' +
          '<button type="button" class="mk-mini" data-mk-del="' + i + '" aria-label="Delete ' + esc(x.n) + '">Delete</button></li>';
      }).join('') + '</ul></section>' : '') + '</div>');
    K.mascot('ok', pick(['Make it hard. I dare you.', 'Design away. The questions are still mine.']));
  }
  function start(preset) {
    M.g = clean(preset || defaults());
    M.step = 0;
    M.more = false;
    tabsFor();
    wizard();
  }
  function tabsFor() {
    var t = function (v) { return v === 'make' || v === 'draw' ? v : 'ready'; };
    M.tab = t(M.g.p); M.otab = t(M.g.op); M.ptab = t(M.g.pl); M.wheel = '';
  }

  // ---------------------------------------------------------------- the steps
  function wizard() {
    M.phase = 'wizard';
    var at = M.step, id = STEPS[at][0], part = STEPS[at][1], g = M.g;
    var bar = '<div class="mk-progress" aria-label="Step ' + (at + 1) + ' of ' + STEPS.length + '">' + PARTS.map(function (p) {
      var mine = STEPS.filter(function (s) { return s[1] === p; }), done = mine.filter(function (s) { return STEPS.indexOf(s) < at; }).length + (part === p ? 1 : 0);
      return '<span class="mk-progress__part' + (part === p ? ' is-now' : '') + '"><b>' + p + '</b><i><em style="width:' + Math.round(done / mine.length * 100) + '%"></em></i></span>';
    }).join('') + '</div>';
    var preview = id === 'th' ? '' : '<div class="mk-preview">' + worldHtml(g, fresh(g)) + '</div>';
    show('<div class="mk mk-wiz">' + bar + preview + '<h3 class="mk-ask">' + STEPS[at][2] + '</h3>' + body(id) + '</div>',
      [at ? ['more', 'data-mk-back', 'Back'] : saved().length ? ['more', 'data-mk-home', 'Your games'] : ['more', 'data-am-keep', 'Close'], ['ok', 'data-mk-next', at === STEPS.length - 1 ? 'Done' : 'Continue']]);
    K.mascot('ok', STEPS[at][2]);
    // The colour wheel, when it's open under a colour row: picking a colour (letting go) sets it.
    var box = q('[data-mk-wheelbox]');
    if (box && DR) DR.wheel(box, A.colourOf(M.g[M.wheel]), function (h, done) { if (done) set(M.wheel, h); });
  }
  function body(id) {
    var g = M.g, W = WORLDS[g.w];
    if (id === 'src') {
      var first = SOURCES.slice(0, 2), rest = SOURCES.slice(2), open = M.more || ids(rest).indexOf(g.src) >= 0;
      var card = function (s) { var n = count(clean(Object.assign({}, g, { src: s[0], ans: g.ans === 'fig' ? 'box' : g.ans }))); return opt('src', s[0], s[1], s[2] + ' · ' + plural(n, 'question'), icon(s[0]), g.src === s[0]); };
      return '<div class="mk-opts">' + first.map(card).join('') +
        (open ? rest.map(card).join('') : '<button type="button" class="mk-opt mk-opt--more" data-mk-more><span class="mk-opt__art">' + icon('more') + '</span><span class="mk-opt__t">More options</span><span class="mk-opt__d">Everything, what you got wrong, what you haven\'t done, new-course questions</span></button>') + '</div>' +
        '<button type="button" class="mk-mini mk-lucky" data-mk-lucky>Or make one for me</button>';
    }
    if (id === 'ans') {
      return '<div class="mk-opts">' + ANSWERS.map(function (a) { return opt('ans', a[0], a[1], a[2], icon(a[0]), g.ans === a[0]); }).join('') + '</div>' +
        (g.ans === 'own' ? '<div class="mk-own">' + chips('Type the answer', 't', TYPE_HOW, g.t) + chips('Diagrams', 'f', FIG_HOW, g.f) + chips('Options to pick from', 'o', CHOICES, g.o) + '</div>' : '');
    }
    if (id === 'ch') {
      return '<div class="mk-opts mk-opts--ch">' + CH.map(function (c) {
        var on = g.ch.indexOf(c) >= 0, n = count(clean(Object.assign({}, g, { ch: [c], src: g.src === 'wrong' || g.src === 'fresh' ? 'all' : g.src })));
        return '<button type="button" class="mk-opt mk-opt--ch' + (on ? ' is-on' : '') + '" style="--c:' + COL[c] + '" aria-pressed="' + on + '" data-mk-ch="' + c + '"><span class="mk-opt__t">' + esc(NAME[c]) + '</span><span class="mk-opt__d">' + plural(n, 'question') + '</span><i class="mk-tick" aria-hidden="true"></i></button>';
      }).join('') + '<button type="button" class="mk-opt mk-opt--ch mk-opt--all' + (g.ch.length === CH.length ? ' is-on' : '') + '" aria-pressed="' + (g.ch.length === CH.length) + '" data-mk-chall><span class="mk-opt__t">All of them</span><i class="mk-tick" aria-hidden="true"></i></button></div>';
    }
    if (id === 'w') return '<div class="mk-opts">' + ORDER.map(function (k) { return opt('w', k, WORLDS[k].name, WORLDS[k].what, icon(k), g.w === k); }).join('') + '</div>';
    if (id === 'r') return '<div class="mk-opts">' + W.right.map(function (o) { return opt('r', o[0], o[1], o[2], '', g.r === o[0]); }).join('') + '</div>';
    if (id === 'x') return '<div class="mk-opts">' + W.wrong.map(function (o) { return opt('x', o[0], o[1], o[2], '', g.x === o[0]); }).join('') + '</div>';
    if (id === 's') return '<div class="mk-opts mk-opts--3">' + W.size.map(function (v, i) { return opt('s', v, SIZE_NAMES[i], v + ' ' + W.unit, '', g.s === v); }).join('') + '</div>';
    if (id === 'you') {
      if (M.tab === 'draw') return tabs('tab', M.tab, 'Characters') + drawPanel('y');
      if (M.tab === 'make') return tabs('tab', M.tab, 'Characters') + builder('p');
      return tabs('tab', M.tab, 'Characters') + '<div class="mk-tiles">' + A.players.map(function (p) {
        return '<button type="button" class="mk-tile' + (g.p === p.id ? ' is-on' : '') + '" aria-pressed="' + (g.p === p.id) + '" data-mk-pick="p" data-mk-val="' + p.id + '">' + A.playerSvg({ p: p.id, c: g.p === p.id ? g.c : A.playerColour[p.id] }, 64) + '<span>' + esc(p.name) + '</span></button>';
      }).join('') + '</div>' + swatches(g.c, 'c');
    }
    if (id === 'op') {
      if (M.otab === 'draw') return tabs('otab', M.otab, 'Opponents') + drawPanel('r');
      if (M.otab === 'make') return tabs('otab', M.otab, 'Opponents') + builder('o');
      return tabs('otab', M.otab, 'Opponents') + '<div class="mk-tiles">' + A.rivals.map(function (r) {
        return '<button type="button" class="mk-tile' + (g.op === r.id ? ' is-on' : '') + '" aria-pressed="' + (g.op === r.id) + '" data-mk-pick="op" data-mk-val="' + r.id + '">' +
          (r.id === 'examiner' ? '<span class="mk-face">' + (K.face || '') + '</span>' : A.rivalSvg(r.id, 64)) + '<span>' + esc(r.name) + '</span></button>';
      }).join('') + '</div>';
    }
    if (id === 'pl') {
      if (M.ptab === 'draw') return tabs('ptab', M.ptab, 'Places') + drawPanel('p');
      if (M.ptab === 'make') return tabs('ptab', M.ptab, 'Places') + placeBuilder();
      return tabs('ptab', M.ptab, 'Places') + '<div class="mk-tiles mk-tiles--wide">' + A.places.map(function (p) {
        return '<button type="button" class="mk-tile mk-tile--place' + (g.pl === p.id ? ' is-on' : '') + '" aria-pressed="' + (g.pl === p.id) + '" data-mk-pick="pl" data-mk-val="' + p.id + '">' + A.placeSvg(p.id) + '<span>' + esc(p.name) + '</span></button>';
      }).join('') + '</div>';
    }
    if (id === 'th') {
      var full = g.th.length >= THINGS_MAX;
      return '<p class="mk-hint">' + (g.th.length ? 'Tap a thing in the picture, then tap where it goes.' : 'Tap a thing to put it in your world. Or skip this.') + '</p>' +
        '<div class="mk-preview">' + worldHtml(g, fresh(g), true) + '</div>' +
        (g.th.length ? '<div class="mk-chips mk-placed">' + g.th.map(function (t, i) {
          return '<span class="mk-chip mk-chip--placed' + (M.sel === i ? ' is-on' : '') + '"><button type="button" class="mk-placed__pick" data-mk-thing="' + i + '">' + A.thingSvg(t[0]) + esc(nameOf(A.things, t[0])) + '</button>' +
            '<button type="button" class="mk-placed__rm" data-mk-rm="' + i + '" aria-label="Take out ' + esc(nameOf(A.things, t[0])) + '">×</button></span>';
        }).join('') + '</div>' : '') +
        '<div class="mk-tiles mk-tiles--things">' + A.things.map(function (t) {
          return '<button type="button" class="mk-tile mk-tile--thing" data-mk-add="' + t.id + '"' + (full ? ' disabled' : '') + '>' + A.thingSvg(t.id) + '<span>' + esc(t.name) + '</span></button>';
        }).join('') + '</div>' + (full ? '<p class="mk-hint">That\'s ' + THINGS_MAX + ': take one out to add another.</p>' : '');
    }
    if (id === 'e') return '<div class="mk-opts mk-opts--3">' + MOODS.map(function (m, i) { return opt('e', i, m[1], '“' + SAY[m[0]].right[0] + '”', '', g.e === i); }).join('') + '</div>';
    // The name, with ideas.
    var ideas = nameIdeas(g);
    return '<label class="mk-name"><span>Name</span><input type="text" maxlength="' + NAME_MAX + '" value="' + esc(g.n) + '" data-mk-name></label>' +
      '<div class="mk-chips">' + ideas.map(function (n) { return '<button type="button" class="mk-chip" data-mk-idea="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>';
  }
  function nameIdeas(g) {
    var rv = g.op === 'make' || g.op === 'draw' ? 'the monster' : 'the ' + nameOf(A.rivals, g.op).replace(/^The /, '').toLowerCase(), me = g.p === 'make' || g.p === 'draw' ? 'Me' : nameOf(A.players, g.p);
    var by = { race: ['Race to the flag', 'Outrun ' + rv], battle: ['Boss battle', 'Beat ' + rv], tower: ['Tower of power', 'Sky high'], points: ['Score rush', 'High score'],
      shoot: ['Penalty shootout', 'Score past ' + rv], grow: ['Green fingers', 'Grow it'] };
    var out = [(g.ch.length === 1 ? NAME[g.ch[0]] : 'Biology') + ' ' + WORLDS[g.w].name.toLowerCase(), me + ' vs ' + rv].concat(by[g.w]);
    return out.map(function (n) { return n.charAt(0).toUpperCase() + n.slice(1); }).filter(function (n, i, all) { return n.length <= NAME_MAX && all.indexOf(n) === i; }).slice(0, 4);
  }
  function set(key, val) {
    var g = M.g;
    if (key === 'w') { g.w = val; g.r = ''; g.x = ''; g.s = 0; }
    else if (key === 'src' || key === 'ans' || key === 'r' || key === 'x' || key === 'op' || key === 'pl') g[key] = val;
    else if (key === 'p') { if (g.p !== val) g.c = A.playerColour[val] || 0; g.p = val; }
    else if ((key === 'c' || key === 'oc') && /^#/.test(val)) g[key] = val;
    else g[key] = +val;
    M.g = clean(g);
    keepScroll(wizard);
    var line = REACT[key] && REACT[key][val];
    if (line) K.mascot(key === 'e' && +val === 2 ? 'angry' : 'ok', line);
  }
  function go(at) {
    readName();
    if (at >= STEPS.length) { summary(); return; }
    M.step = at;
    M.more = false;
    M.sel = -1;
    wizard();
    var y = M.card.querySelector('.am-games__body, [data-am-gbody]');
    if (y) y.scrollTop = 0;
  }
  function readName() { var n = q('[data-mk-name]'); if (n) M.g.n = clean({ n: n.value }).n; return M.g; }
  function chapter(c) {
    var i = M.g.ch.indexOf(c);
    if (M.g.ch.length === CH.length) M.g.ch = [c];
    else if (i >= 0 && M.g.ch.length > 1) M.g.ch.splice(i, 1);
    else if (i < 0) M.g.ch.push(c);
    M.g = clean(M.g);
    keepScroll(wizard);
  }
  // Things: added where there's room (floating ones up in the air), then moved by tapping the picture.
  var SPOTS = [[14, 84], [86, 84], [32, 84], [68, 84], [50, 84], [6, 84]];
  function addThing(id) {
    if (M.g.th.length >= THINGS_MAX) return;
    var floats = A.things.filter(function (t) { return t.id === id; })[0].floats, used = M.g.th.map(function (t) { return t[1]; });
    var spot = SPOTS.filter(function (s) { return used.indexOf(s[0]) < 0; })[0] || [50, 84];
    M.g.th.push([id, spot[0], floats ? 26 : spot[1]]);
    M.sel = M.g.th.length - 1;
    keepScroll(wizard);
  }
  function moveThing(e, stage) {
    if (M.sel < 0 || !M.g.th[M.sel]) return;
    var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    M.g.th[M.sel][1] = Math.round(Math.max(3, Math.min(97, x)));
    M.g.th[M.sel][2] = Math.round(Math.max(8, Math.min(84, y + 6)));
    keepScroll(wizard);
  }
  // A whole game at random (every card from the library), for "Or make one for me".
  function randomGame() {
    var r = function (list) { return list[Math.floor(Math.random() * list.length)]; }, parts = function () { return ['body', 'eyes', 'mouth', 'top', 'extra'].map(function (k) { return Math.floor(Math.random() * A.parts[k].length); }); };
    var w = r(ORDER), W = WORLDS[w], p = Math.random() < 0.3 ? 'make' : r(A.players).id;
    var g = clean({ src: r(['short', 'short', 'long', 'all']), ans: r(['box', 'box', 'type', 'fig', 'own']), t: 1, f: r([1, 2]), o: 4, ch: CH.slice(), w: w, r: r(W.right)[0], x: r(W.wrong)[0], s: W.size[1],
      p: p, d: parts(), c: p === 'make' ? Math.floor(Math.random() * A.colours.length) : A.playerColour[p], op: Math.random() < 0.2 ? 'make' : r(A.rivals).id, od: parts(), oc: Math.floor(Math.random() * A.colours.length),
      pl: Math.random() < 0.2 ? 'make' : r(A.places).id, pd: [r([0, 1, 2, 3, 4, 5]), r([0, 1, 2, 3, 4, 5]), r([1, 2, 3, 4, 5, 6]), r([1, 2, 3, 4, 5])], th: [], e: r([0, 1, 2]) });
    g.n = nameIdeas(g)[0];
    return g;
  }
  function surprise(who) {
    var d = ['body', 'eyes', 'mouth', 'top', 'extra'].map(function (k) { return Math.floor(Math.random() * A.parts[k].length); }), c = Math.floor(Math.random() * A.colours.length);
    if (who === 'o') { M.g.od = d; M.g.oc = c; M.g.op = 'make'; } else { M.g.d = d; M.g.c = c; M.g.p = 'make'; }
    keepScroll(wizard);
  }

  // ---------------------------------------------------------------- your game, done
  function rulesHtml(g) {
    var W = WORLDS[g.w], name = function (list, id) { return list.filter(function (x) { return x[0] === id; })[0][1]; };
    var asks = g.ans === 'own' ? ['typing ' + TYPE_HOW[g.t][1].toLowerCase(), FIG_HOW[g.f][1].toLowerCase() === 'none' ? 'no diagrams' : FIG_HOW[g.f][1].toLowerCase() + ' diagrams', g.o + ' options'].join(', ') : name(ANSWERS, g.ans);
    var chs = g.ch.length === CH.length ? 'all chapters' : g.ch.map(function (c) { return NAME[c]; }).join(', ');
    return [
      ['Questions', (g.ans === 'fig' ? 'Real exam diagrams: name the part, or tap it' : name(SOURCES, g.src) + ' · ' + asks) + ' · ' + chs, 0],
      ['Game', W.name + ' · Right: ' + name(W.right, g.r) + ' · Wrong: ' + name(W.wrong, g.x) + ' · ' + (g.w === 'battle' ? g.s + ' hearts each' : g.s + ' ' + W.unit + ' to win'), 3],
      ['Look', playerName(g).charAt(0).toUpperCase() + playerName(g).slice(1) + ' vs ' + rivalName(g).replace(/^The /, 'the ') + ' · ' + placeOf(g).name + (g.th.length ? ' · ' + plural(g.th.length, 'thing') : '') + ' · ' + MOODS[g.e][1], 7]
    ].map(function (r) { return '<li><b>' + r[0] + '</b><span>' + esc(r[1]) + '</span><button type="button" class="mk-mini" data-mk-jump="' + r[2] + '">Change</button></li>'; }).join('');
  }
  function summary() {
    M.phase = 'summary';
    var g = M.g;
    show('<div class="mk mk-done"><div class="mk-preview">' + worldHtml(g, fresh(g)) + '</div><h3 class="mk-title">' + esc(g.n) + '</h3><ul class="mk-sum">' + rulesHtml(g) + '</ul>' +
      '<div class="mk-share" data-mk-share hidden><input type="text" readonly data-mk-link aria-label="Link to your game"><span data-mk-copied></span></div></div>',
      [['more', 'data-mk-save', 'Save'], ['more', 'data-mk-link-btn', 'Share link'], ['ok', 'data-mk-go', 'Play']]);
    K.mascot('ok', pick(['Ready when you are.', 'Hmph. Not bad. Now play it.']));
  }
  function save(g) {
    var list = saved().filter(function (x) { return encode(x) !== encode(g); });
    list.unshift(clean(g));
    keep(list);
  }
  function share() {
    var g = M.g, box = q('[data-mk-share]'), input = q('[data-mk-link]'), note = q('[data-mk-copied]'), url = linkOf(g);
    if (!box) return;
    box.hidden = false;
    input.value = url;
    input.focus();
    input.select();
    var done = function (ok) { note.textContent = ok ? 'Copied. Send it to a friend.' : 'Copy the link and send it to a friend.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
    else done(false);
    // On a phone, its own share sheet too.
    if (navigator.share && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) navigator.share({ title: g.n, text: 'Try my Biology game: ' + g.n, url: url }).catch(function () {});
  }

  // ---------------------------------------------------------------- the library
  var LIB = [['players', 'Characters'], ['parts', 'Build parts'], ['rivals', 'Opponents'], ['places', 'Places'], ['things', 'Things']];
  function library() {
    M.phase = 'library';
    var t = M.lib, s = M.libSel, tile = function (kind, id, art, name, wide) {
      var on = s && s.kind === kind && s.id === id;
      return '<button type="button" class="mk-tile' + (wide ? ' mk-tile--place' : '') + (on ? ' is-on' : '') + '" aria-pressed="' + Boolean(on) + '" data-mk-libsel="' + kind + ':' + id + '">' + art + '<span>' + esc(name) + '</span></button>';
    };
    var grid;
    if (t === 'players') grid = '<div class="mk-tiles">' + A.players.map(function (p) { return tile('p', p.id, A.playerSvg({ p: p.id, c: A.playerColour[p.id] }, 64), p.name); }).join('') + '</div>';
    else if (t === 'rivals') grid = '<div class="mk-tiles">' + A.rivals.map(function (r) { return tile('op', r.id, r.id === 'examiner' ? '<span class="mk-face">' + (K.face || '') + '</span>' : A.rivalSvg(r.id, 64), r.name); }).join('') + '</div>';
    else if (t === 'places') grid = '<div class="mk-tiles mk-tiles--wide">' + A.places.map(function (p) { return tile('pl', p.id, A.placeSvg(p.id), p.name, true); }).join('') + '</div>';
    else if (t === 'things') grid = '<div class="mk-tiles mk-tiles--things">' + A.things.map(function (x) { return tile('th', x.id, A.thingSvg(x.id), x.name); }).join('') + '</div>';
    else grid = [['body', 'Bodies'], ['eyes', 'Eyes'], ['mouth', 'Mouths'], ['top', 'On top'], ['extra', 'Extras']].map(function (row, ri) {
      return '<h4 class="mk-h4">' + row[1] + '</h4><div class="mk-tiles mk-tiles--parts">' + A.parts[row[0]].map(function (part, pi) {
        var d = [0, 0, 0, 0, 0]; d[ri] = pi;
        return tile('d' + ri, pi, A.playerSvg({ p: 'make', d: d, c: (pi + ri * 3) % A.colours.length }, 56), A.partName(row[0], part));
      }).join('') + '</div>';
    }).join('');
    show('<div class="mk mk-lib"><h3 class="mk-title">Asset library</h3><div class="mk-tabs" role="tablist">' + LIB.map(function (x) {
      return '<button type="button" role="tab" class="mk-tab' + (t === x[0] ? ' is-on' : '') + '" aria-selected="' + (t === x[0]) + '" data-mk-libtab="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div>' + grid + '</div>', [['more', 'data-mk-home', 'Back'], ['ok', 'data-mk-libuse', s ? 'Make a game with it' : 'Make a new game']]);
    K.mascot('ok', 'Everything you can put in a game. Pick one.');
  }
  // A game that starts with what you picked in the library.
  function fromLibrary() {
    var g = defaults(), s = M.libSel;
    if (s) {
      if (s.kind === 'p') { g.p = s.id; g.c = A.playerColour[s.id] || 0; }
      else if (s.kind === 'op') g.op = s.id;
      else if (s.kind === 'pl') g.pl = s.id;
      else if (s.kind === 'th') g.th = [[s.id, 14, A.things.filter(function (t) { return t.id === s.id; })[0].floats ? 26 : 84]];
      else if (/^d\d$/.test(s.kind)) { g.p = 'make'; g.d[+s.kind.slice(1)] = +s.id; }
    }
    M.libSel = null;
    start(g);
  }

  // ======================================================================== playing
  // A friend's link opens on a card with their game, ready to play or keep.
  function fromLink(code) {
    var g = decode(code);
    if (!g) return false;
    host('Make your own games');
    M.g = g;
    M.phase = 'link';
    show('<div class="mk mk-done"><div class="mk-preview">' + worldHtml(g, fresh(g)) + '</div><h3 class="mk-title">' + esc(g.n) + '</h3><ul class="mk-sum mk-sum--plain">' + rulesHtml(g) + '</ul></div>',
      [['more', 'data-mk-keep', 'Save'], ['more', 'data-mk-remix', 'Change it'], ['ok', 'data-mk-go', 'Play']]);
    K.mascot('ok', 'Someone made this for you. Let\'s see.');
    return true;
  }
  function play(g) {
    M.g = clean(g);
    M.st = fresh(M.g);
    M.qs = questionsFor(M.g);
    M.play = { asked: 0, recent: {}, qs: M.qs };
    M.n = 0;
    K.gameHud(M.card, 0, 'right');
    if (!M.qs.main.length) { M.phase = 'over'; frame('<p class="tb-say">No questions in those chapters.</p>', [['more', 'data-mk-remix', 'Change it']]); return; }
    turn();
    if (M.qs.note) K.mascot('ok', M.qs.note);
  }
  function frame(panel, btns) {
    show('<div class="mk-play">' + worldHtml(M.g, M.st) + '<div class="tb-panel" data-mk-panel aria-live="polite">' + panel + '</div></div>', btns || [['more', 'data-am-keep', 'Close']]);
  }
  function turn() {
    var g = M.g, m = nextQuestion(M.play, g);
    if (!m) { frame('<p class="tb-say">No questions in those chapters.</p>'); return; }
    M.play.asked += 1;
    M.n += 1;
    var it = m.it, fig = isFig(it), spots = fig && !m.typed ? tapSpots(it) : [];
    M.item = it;
    M.typed = m.typed;
    M.tap = fig && !m.typed && spots.length >= 3 && Math.random() < 0.5 ? shuffle(spots) : null;
    M.phase = 'ask';
    var text = M.tap ? 'Tap the ' + lower(it.right) + '.' : it.q, label = M.typed ? 'Type it' : M.tap ? 'Tap it' : 'Question ' + M.n;
    var opts = shuffle([it.right].concat(shuffle(it.wrong).slice(0, choices(g) - 1)));
    frame('<div class="tb-card mk-card" style="--c:' + COL[it.ch] + '"><div class="tb-card__in"><div class="tb-card__face"><div class="tb-card__band"><b>' + esc(NAME[it.ch]) + '</b><span>' + label + '</span></div><div class="tb-card__body">' +
      '<p class="mk-from">' + esc(it.from) + '</p>' + (fig ? figure(it, M.tap) : '') +
      '<p class="tb-q">' + esc(text) + (M.typed && it.need > 1 ? ' <span class="mk-need">(' + it.need + ' points)</span>' : '') + '</p>' +
      (M.typed ? '<textarea class="tb-text" data-mk-text rows="' + (it.need > 1 ? 4 : 2) + '" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-mk-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-mk-pass>I don\'t know</button></div>'
        : M.tap ? '' : '<div class="tb-opts">' + opts.map(function (o) { return '<button type="button" class="tb-opt" data-mk-opt="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>') +
      '<div class="qg-after" data-mk-after></div></div></div></div></div>');
    BB.reveal(q('.tb-card'), function () { var t = q('[data-mk-text]'); if (t) t.focus({ preventScroll: true }); });
  }
  function lower(t) { return /^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t; }
  function choose(btn) {
    if (M.phase !== 'ask') return;
    var mine = btn.getAttribute('data-mk-opt'), ok = mine === M.item.right;
    M.card.querySelectorAll('[data-mk-opt]').forEach(function (b) {
      var o = b.getAttribute('data-mk-opt');
      b.disabled = true;
      if (o === M.item.right) b.classList.add('is-ok'); else if (o === mine) b.classList.add('is-no');
    });
    answered(ok, ok ? '' : 'You said: ' + mine);
  }
  function tapped(spot) {
    if (M.phase !== 'ask' || !M.tap) return;
    var si = +spot.getAttribute('data-mk-spot'), ok = si === M.item.spot, it = M.item;
    M.card.querySelectorAll('[data-mk-spot]').forEach(function (s) {
      var k = +s.getAttribute('data-mk-spot');
      s.classList.add(k === it.spot ? 'is-ok' : k === si ? 'is-no' : 'is-off');
      s.removeAttribute('tabindex');
    });
    var name = bank().filter(function (x) { return x.kind === 'diagram' && x.fig === it.fig && x.spot === si; })[0];
    answered(ok, ok ? '' : 'You tapped: ' + (name ? name.right : 'another part'));
  }
  function check(pass) {
    if (M.phase !== 'ask') return;
    var it = M.item, box = q('[data-mk-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    // A wrong answer added to a right one cancels it, as the scheme does for its starred terms (as in Exam drill).
    var bad = text && window.BioDrill ? window.BioDrill.cancelled(it, text) : '', got = text && !bad ? it.earned(text) : 0, ok = got >= it.need;
    box.disabled = true;
    var r = q('[data-mk-check]');
    if (r) r.closest('.tb-row').remove();
    answered(ok, text ? 'You wrote: ' + (text.length > 160 ? text.slice(0, 157) + '...' : text) +
      (bad ? ' (cancelled: "' + bad + '" is wrong, and a wrong answer added cancels the right one)' : got && !ok ? ' (' + got + ' of ' + it.need + ' points)' : '') : '');
  }
  // After an answer: the answer, the scheme's points (typed), why, when it comes back, then your rule happens.
  function answered(ok, mine) {
    M.phase = 'shown';
    var g = M.g, it = M.item, out = step(g, M.st, ok, M.typed), mood = MOODS[g.e][0], line = BB.memLine(BB.memSet(it.id, M.typed, ok, true));
    M.st = out.st;
    K.rollTo(q('[data-am-gscore]'), M.st.right);
    if (ok) K.ding(M.typed ? 4 : 2, true); else K.bonk();
    K.mascot(ok ? 'angry' : 'happy', pick(SAY[mood][ok ? 'right' : 'wrong']));
    var scheme = M.typed && !isFig(it) ? '<p class="ed-scheme mk-scheme"><span>Marking scheme</span>' + it.pts.slice(0, Math.max(it.need, 3)).map(function (p) {
      return esc(p.a.replace(/\*/g, '')) + (/\*/.test(p.a) ? ' <em>(only this term)</em>' : '') + (p.accept && p.accept.length ? ' <em>(accept: ' + esc(p.accept.join('; ')) + ')</em>' : '');
    }).join('<br>') + (it.need < it.pts.length ? '<br><em>Any ' + it.need + ' for full marks.</em>' : '') + '</p>' : '';
    q('[data-mk-after]').innerHTML = '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + (ok ? 'Correct' : 'Not quite') + '</p>' + (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>' + (M.typed ? 'A full-marks answer' : 'Answer') + '</span>' + esc(it.right) + '</p>' + scheme + '<p class="tb-why"><span>Why</span>' + esc(it.why) + '</p>' + line;
    var world = q('.mk-world');
    if (world) world.outerHTML = worldHtml(g, M.st);
    var w = q('.mk-world');
    if (w) w.classList.add(ok ? 'is-good' : 'is-bad');
    var end = over(g, M.st), rowEl = document.createElement('div');
    rowEl.className = 'tb-row tb-row--next';
    rowEl.innerHTML = '<p class="mk-said">' + esc(out.said) + '</p><button type="button" class="tb-btn tb-btn--go" ' + (end ? 'data-mk-end="' + end + '"' : 'data-mk-nextq') + '>' + (end ? 'See how you did' : 'Next question') + '</button>';
    q('[data-mk-panel]').appendChild(rowEl);
    rowEl.querySelector('button').focus({ preventScroll: true });
  }
  function finish(how) {
    var g = M.g, won = how === 'win', mood = MOODS[g.e][0], was = bestOf(g), b = record(g, won, M.st.asked);
    var best = won && (!was || !was.best || M.st.asked < was.best) && b.won > 1 ? 'A new best: won in ' + M.st.asked + ' answers.' :
      b.best ? 'Your best: won in ' + b.best + ' answers' + (b.won > 1 ? ' (won ' + b.won + ' times)' : '') + '.' : '';
    M.phase = 'over';
    show('<div class="am-games__end mk-end"><div class="mk-preview">' + worldHtml(g, M.st) + '</div><h3 class="am-games__title">' + (won ? 'You won!' : 'He won.') + '</h3>' +
      '<p class="am-games__sub">' + esc(g.n) + ': ' + M.st.right + ' right of ' + M.st.asked + '.</p>' + (best ? '<p class="mk-best">' + best + '</p>' : '') + '</div>',
      [['more', 'data-mk-remix', 'Change it'], ['more', 'data-mk-link-end', 'Share link'], ['ok', 'data-mk-go', 'Play again']]);
    K.mascot(won ? 'angry' : 'happy', SAY[mood][won ? 'win' : 'lose']);
    if (won) K.later(K.fanfare, 300);
  }

  // ======================================================================== clicks and keys
  document.addEventListener('click', function (e) {
    if (!live() || !M.card.contains(e.target)) return;
    var t;
    // Making it.
    if ((t = e.target.closest('[data-mk-pick]'))) { set(t.getAttribute('data-mk-pick'), t.getAttribute('data-mk-val')); return; }
    if (e.target.closest('[data-mk-more]')) { M.more = true; keepScroll(wizard); return; }
    if (e.target.closest('[data-mk-lucky]')) { M.g = randomGame(); summary(); K.mascot('ok', 'There. One game. You\'re welcome.'); return; }
    if ((t = e.target.closest('[data-mk-ch]'))) { chapter(+t.getAttribute('data-mk-ch')); return; }
    if (e.target.closest('[data-mk-chall]')) { M.g.ch = CH.slice(); keepScroll(wizard); return; }
    if ((t = e.target.closest('[data-mk-tab]'))) { M.tab = t.getAttribute('data-mk-tab'); pickTab('p', M.tab); return; }
    if ((t = e.target.closest('[data-mk-ptab]'))) { M.ptab = t.getAttribute('data-mk-ptab'); pickTab('pl', M.ptab); return; }
    if ((t = e.target.closest('[data-mk-ppart]'))) { M.g.pd[+t.getAttribute('data-mk-ppart')] = +t.getAttribute('data-mk-val'); M.g.pl = 'make'; M.g = clean(M.g); keepScroll(wizard); return; }
    if ((t = e.target.closest('[data-mk-otab]'))) { M.otab = t.getAttribute('data-mk-otab'); pickTab('op', M.otab); return; }
    // Drawing.
    if ((t = e.target.closest('[data-mk-draw]'))) { studio(t.getAttribute('data-mk-draw'), t.getAttribute('data-mk-start')); return; }
    if ((t = e.target.closest('[data-mk-undraw]'))) { undraw(t.getAttribute('data-mk-undraw')); return; }
    if ((t = e.target.closest('[data-mk-usedraw]'))) { var U = DRAW[t.getAttribute('data-mk-usedraw')]; M.g[U.pick] = 'draw'; M.g = clean(M.g); keepScroll(wizard); return; }
    if (e.target.closest('[data-mk-ddone]')) { drawn(); return; }
    if (e.target.closest('[data-mk-dcancel]')) { M.studio = null; wizard(); return; }
    if ((t = e.target.closest('[data-mk-wheel]'))) { M.wheel = M.wheel === t.getAttribute('data-mk-wheel') ? '' : t.getAttribute('data-mk-wheel'); keepScroll(wizard); return; }
    if ((t = e.target.closest('[data-mk-part]'))) {
      var part = t.getAttribute('data-mk-part'), who = part.charAt(0);
      M.g[who === 'o' ? 'od' : 'd'][+part.slice(1)] = +t.getAttribute('data-mk-val');
      M.g[who === 'o' ? 'op' : 'p'] = 'make';
      M.g = clean(M.g);
      keepScroll(wizard);
      return;
    }
    if ((t = e.target.closest('[data-mk-random]'))) { surprise(t.getAttribute('data-mk-random')); return; }
    if ((t = e.target.closest('[data-mk-add]'))) { addThing(t.getAttribute('data-mk-add')); return; }
    if ((t = e.target.closest('[data-mk-rm]'))) { M.g.th.splice(+t.getAttribute('data-mk-rm'), 1); M.sel = -1; keepScroll(wizard); return; }
    if ((t = e.target.closest('[data-mk-thing]'))) { M.sel = +t.getAttribute('data-mk-thing'); keepScroll(wizard); return; }
    if ((t = e.target.closest('[data-mk-stage]'))) { moveThing(e, t); return; }
    if ((t = e.target.closest('[data-mk-idea]'))) { M.g.n = clean({ n: t.getAttribute('data-mk-idea') }).n; q('[data-mk-name]').value = M.g.n; return; }
    if (e.target.closest('[data-mk-next]')) { go(M.step + 1); return; }
    if (e.target.closest('[data-mk-back]')) { go(Math.max(0, M.step - 1)); return; }
    if ((t = e.target.closest('[data-mk-jump]'))) { M.step = +t.getAttribute('data-mk-jump'); M.more = false; M.sel = -1; tabsFor(); wizard(); return; }
    if (e.target.closest('[data-mk-new]')) { start(); return; }
    if (e.target.closest('[data-mk-home]')) { home(); return; }
    // The library.
    if (e.target.closest('[data-mk-lib]')) { M.libSel = null; library(); return; }
    if ((t = e.target.closest('[data-mk-libtab]'))) { M.lib = t.getAttribute('data-mk-libtab'); M.libSel = null; library(); return; }
    if ((t = e.target.closest('[data-mk-libsel]'))) { var v = t.getAttribute('data-mk-libsel').split(':'); M.libSel = { kind: v[0], id: v[1] }; keepScroll(library); return; }
    if (e.target.closest('[data-mk-libuse]')) { fromLibrary(); return; }
    // Your games.
    if (e.target.closest('[data-mk-go]')) { play(M.g); return; }
    if (e.target.closest('[data-mk-save]')) { save(M.g); K.mascot('ok', 'Saved. It\'s in your games.'); return; }
    if (e.target.closest('[data-mk-keep]')) { save(M.g); summary(); K.mascot('ok', 'Saved to your games.'); return; }
    if (e.target.closest('[data-mk-remix]')) { summary(); return; }
    if (e.target.closest('[data-mk-link-btn]')) { share(); return; }
    if (e.target.closest('[data-mk-link-end]')) { summary(); share(); return; }
    if ((t = e.target.closest('[data-mk-play]'))) { play(saved()[+t.getAttribute('data-mk-play')]); return; }
    if ((t = e.target.closest('[data-mk-edit]'))) { M.g = saved()[+t.getAttribute('data-mk-edit')]; summary(); return; }
    if ((t = e.target.closest('[data-mk-del]'))) { var l = saved(); l.splice(+t.getAttribute('data-mk-del'), 1); keep(l); if (l.length) home(); else start(); return; }
    // Playing.
    if ((t = e.target.closest('[data-mk-opt]'))) { choose(t); return; }
    if ((t = e.target.closest('[data-mk-spot]'))) { tapped(t); return; }
    if (e.target.closest('[data-mk-check]')) { check(false); return; }
    if (e.target.closest('[data-mk-pass]')) { check(true); return; }
    if (e.target.closest('[data-mk-nextq]') && M.phase === 'shown') { turn(); return; }
    if ((t = e.target.closest('[data-mk-end]'))) { finish(t.getAttribute('data-mk-end')); }
  });
  document.addEventListener('input', function (e) {
    if (!live() || !e.target.closest || !e.target.closest('[data-mk-name]')) return;
    M.g.n = clean({ n: e.target.value }).n;
  });
  document.addEventListener('keydown', function (e) {
    if (!live() || e.key !== 'Enter' || !e.target.closest) return;
    if (e.target.closest('[data-mk-spot]')) { e.preventDefault(); tapped(e.target.closest('[data-mk-spot]')); return; }
    if (e.target.closest('[data-mk-name]')) { e.preventDefault(); go(M.step + 1); return; }
    if (e.shiftKey || !e.target.closest('[data-mk-text]')) return;
    e.preventDefault();
    check(false);
  });
  window.addEventListener('resize', function () { if (live()) BB.nearMascot(M.card); });

  window.BioMaker = { open: function () { M = null; open(); }, fromLink: fromLink, state: function () { return M; },
    // For tools/bio/tests/maker.mjs.
    test: { WORLDS: WORLDS, SOURCES: SOURCES, ANSWERS: ANSWERS, STEPS: STEPS, clean: clean, encode: encode, decode: decode, fresh: fresh, step: step, over: over, defaults: defaults,
      bank: bank, questionsFor: questionsFor, nextQuestion: nextQuestion, typing: typing, tapSpots: tapSpots, worldHtml: worldHtml, nameIdeas: nameIdeas, randomGame: randomGame } };
})();

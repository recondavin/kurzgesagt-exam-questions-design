// Make your own games (the user: "is there a way i can design something where students get to design their own games
// but in a very simple way", "the questions are the same they just design the game", "call it 'make your own games'").
// You pick cards, nothing else: a world (Race, Battle, Tower, Points), what a right answer does, what a wrong one does,
// how big the game is, your character and colour, the background, how cross the examiner is, the chapters and whether
// answers are ticked, typed or both. Then play it, save it, or share it as a link: the whole game is in the link
// (#play=...), so a friend opens it and plays your game. The questions are always the real exam questions (the trivia
// board's pools), marked like the answer sheet, and which come next is the memory shared with Exam drill (wrong ones
// come back as boxes, right ones come back typed).
// Saved here: 'bio-made' (your games). bio.js routes #make and #play=.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.memNext) return;
  var esc = BK.esc, pick = BK.pick, shuffle = BK.shuffle;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours;

  // ======================================================================== the cards
  // Each world's cards: what a right answer does, what a wrong one does, and its sizes.
  var WORLDS = {
    race: { name: 'Race', right: [['step1', 'Move 1 step'], ['step2', 'Move 2 steps']],
      wrong: [['him1', 'He moves 1 step'], ['back1', 'You go back 1 step'], ['life', 'Lose a life']], size: [6, 8, 10], unit: 'steps' },
    battle: { name: 'Battle', right: [['hit1', 'Hit him'], ['hit2t', 'Hit him (twice if typed)']],
      wrong: [['hurt1', 'He hits you'], ['life', 'Lose a life']], size: [3, 5, 8], unit: 'hearts' },
    tower: { name: 'Tower', right: [['add1', 'Add a block'], ['add2t', 'Add a block (two if typed)']],
      wrong: [['fall1', 'A block falls off'], ['life', 'Lose a life']], size: [6, 8, 10], unit: 'blocks' },
    points: { name: 'Points', right: [['p100', '+100'], ['p100t', '+100 (+200 if typed)']],
      wrong: [['m50', '−50'], ['life', 'Lose a life']], size: [500, 1000, 1500], unit: 'points' }
  };
  var ORDER = ['race', 'battle', 'tower', 'points'];
  var COLOURS = ['#1CB0F6', '#58CC02', '#FF4B4B', '#FF9600', '#CE82FF', '#FF86D0'];
  var AVATARS = ['blob', 'robot', 'cat', 'star'];
  var BACKS = [['class', 'Classroom'], ['lab', 'Lab'], ['night', 'Night'], ['beach', 'Beach']];
  var MOODS = [['calm', 'Calm'], ['strict', 'Strict'], ['furious', 'Furious']];
  var ANSWERS = [['box', 'Tick boxes'], ['mix', 'Boxes and typed'], ['type', 'Typed']];
  var LIVES = 3, NAME_MAX = 24;
  // What he says, by his mood: when you're right, when you're wrong, when you win and when you lose.
  var SAY = {
    calm: { right: ['Good.', 'That\'s right.', 'Well done.'], wrong: ['Not quite.', 'Have another look at that one.'], win: 'Well played.', lose: 'Better luck next time.' },
    strict: { right: ['Hmph. Correct.', 'Fine.', 'Acceptable.'], wrong: ['Wrong.', 'Learn it.', 'No marks.'], win: 'Hmph. You won.', lose: 'As expected.' },
    furious: { right: ['WHAT? Correct?!', 'Lucky. Very lucky.', 'I don\'t believe it.'], wrong: ['WRONG!', 'Did you even study?!', 'Unbelievable.'],
      win: 'IMPOSSIBLE!', lose: 'HA! Again!' }
  };

  function defaults() {
    return { v: 1, n: 'My game', w: 'race', r: 'step1', x: 'him1', s: 8, c: 0, a: 0, b: 0, e: 1, ch: CH.slice(), q: 'mix' };
  }
  // A game from anywhere (your saved games, a shared link) is checked card by card: anything unknown becomes the
  // default, so a broken or altered link still plays.
  function clean(g) {
    var d = defaults(), o = {};
    g = g && typeof g === 'object' ? g : {};
    o.v = 1;
    o.n = String(g.n || d.n).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NAME_MAX) || d.n;
    o.w = WORLDS[g.w] ? g.w : d.w;
    var W = WORLDS[o.w], ids = function (list) { return list.map(function (x) { return x[0]; }); };
    o.r = ids(W.right).indexOf(g.r) >= 0 ? g.r : W.right[0][0];
    o.x = ids(W.wrong).indexOf(g.x) >= 0 ? g.x : W.wrong[0][0];
    o.s = W.size.indexOf(+g.s) >= 0 ? +g.s : W.size[1];
    o.c = +g.c >= 0 && +g.c < COLOURS.length ? +g.c : 0;
    o.a = +g.a >= 0 && +g.a < AVATARS.length ? +g.a : 0;
    o.b = +g.b >= 0 && +g.b < BACKS.length ? +g.b : 0;
    o.e = +g.e >= 0 && +g.e < MOODS.length ? +g.e : 1;
    o.ch = (Array.isArray(g.ch) ? g.ch : []).map(Number).filter(function (c, i, all) { return CH.indexOf(c) >= 0 && all.indexOf(c) === i; });
    if (!o.ch.length) o.ch = CH.slice();
    o.q = ids(ANSWERS).indexOf(g.q) >= 0 ? g.q : 'mix';
    return o;
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
      else { s.you += two ? 200 : 100; said = two ? '+200' : '+100'; }
    } else if (g.x === 'life') { s.lives = Math.max(0, s.lives - 1); said = 'You lose a life.'; }
    else if (g.x === 'him1') { s.him += 1; said = 'He moves a step closer.'; }
    else if (g.x === 'back1') { s.you = Math.max(0, s.you - 1); said = 'You go back a step.'; }
    else if (g.x === 'hurt1') { s.you = Math.max(0, s.you - 1); said = 'He hits you.'; }
    else if (g.x === 'fall1') { s.you = Math.max(0, s.you - 1); said = s.you === st.you ? 'Nothing to fall off yet.' : 'A block falls off.'; }
    else { s.you = Math.max(0, s.you - 50); said = '−50'; }
    return { st: s, said: said };
  }
  // 'win', 'lose' or '' (go on).
  function over(g, st) {
    if (g.w === 'battle') { if (st.him <= 0) return 'win'; if (st.you <= 0) return 'lose'; }
    else if (st.you >= g.s) return 'win';
    if (g.x === 'life' && st.lives <= 0) return 'lose';
    if (g.w === 'race' && g.x === 'him1' && st.him >= st.you) return 'lose';
    return '';
  }

  // ======================================================================== drawing
  var INK = '#13294A';
  function avatar(g, size) {
    var c = COLOURS[g.c], a = AVATARS[g.a], body;
    if (a === 'robot') body = '<rect x="-20" y="-18" width="40" height="38" rx="9" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><path d="M0 -18V-27" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="-29" r="4" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    else if (a === 'cat') body = '<path d="M-19 -6L-17 -26L-6 -17M19 -6L17 -26L6 -17" fill="' + c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><circle r="20" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    else if (a === 'star') body = '<path d="M0 -25L7 -9L24 -8L11 3L15 20L0 11L-15 20L-11 3L-24 -8L-7 -9Z" fill="' + c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
    else body = '<circle r="20" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>';
    return '<svg class="mk-av" viewBox="-30 -34 60 62" width="' + size + '" height="' + size + '" aria-hidden="true">' + body +
      '<circle cx="-7" cy="-2" r="5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/><circle cx="7" cy="-2" r="5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="-6" cy="-1" r="2.2" fill="' + INK + '"/><circle cx="8" cy="-1" r="2.2" fill="' + INK + '"/><path d="M-5 9Q0 12 5 9" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></svg>';
  }
  function him() { return '<span class="mk-him" aria-hidden="true">' + (K.face || '') + '</span>'; }
  function heart(on) { return '<svg class="mk-heart' + (on ? '' : ' is-gone') + '" viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17S1 11 1 5.5A4.5 4.5 0 0 1 10 3.5A4.5 4.5 0 0 1 19 5.5C19 11 10 17 10 17Z"/></svg>'; }
  // The world as the game stands: its background, the pieces where they are, and the counters.
  function worldHtml(g, st) {
    var W = WORLDS[g.w], x = '';
    if (g.w === 'race') {
      // He starts two squares behind you, so those two squares are drawn before yours (greyed).
      var back = g.x === 'him1' ? 2 : 0, n = g.s + 1 + back,
        at = function (v) { return 'calc(30px + (100% - 60px) * ' + ((Math.max(-back, v) + back + 0.5) / n).toFixed(4) + ')'; };
      x += '<div class="mk-track">' + new Array(back + 1).join('<i class="is-back"></i>') + new Array(g.s + 2).join('<i></i>') + '</div><span class="mk-flag" aria-hidden="true"></span>' +
        '<span class="mk-tok mk-tok--you" style="left:' + at(st.you) + '">' + avatar(g, 52) + '</span>' +
        (g.x === 'him1' ? '<span class="mk-tok mk-tok--him" style="left:' + at(st.him) + '">' + him() + '</span>' : '');
    } else if (g.w === 'battle') {
      var hearts = function (v) { var h = ''; for (var i = 0; i < g.s; i++) h += heart(i < v); return '<span class="mk-hearts">' + h + '</span>'; };
      x += '<span class="mk-side mk-side--you">' + hearts(st.you) + avatar(g, 78) + '</span><span class="mk-vs">VS</span>' +
        '<span class="mk-side mk-side--him">' + hearts(st.him) + him() + '</span>';
    } else if (g.w === 'tower') {
      var b = '';
      for (var i = 0; i < st.you; i++) b += '<i style="--k:' + i + ';background:' + COLOURS[g.c] + '"></i>';
      x += '<span class="mk-goal" style="--h:' + g.s + '"></span><span class="mk-stack" style="--n:' + g.s + '">' + b + '</span>' +
        '<span class="mk-tok mk-tok--builder">' + avatar(g, 52) + '</span><span class="mk-watch">' + him() + '</span>';
    } else {
      x += '<span class="mk-points"><b class="num">' + st.you + '</b><span>of ' + g.s + '</span></span>' +
        '<span class="mk-bar"><i style="width:' + Math.min(100, st.you / g.s * 100) + '%;background:' + COLOURS[g.c] + '"></i></span>' +
        '<span class="mk-tok mk-tok--score">' + avatar(g, 64) + '</span><span class="mk-watch">' + him() + '</span>';
    }
    var lives = '';
    if (g.x === 'life') { for (var l = 0; l < LIVES; l++) lives += heart(l < st.lives); lives = '<span class="mk-lives" aria-label="' + st.lives + ' lives">' + lives + '</span>'; }
    return '<div class="mk-world mk-world--' + g.w + ' mk-back--' + BACKS[g.b][0] + '" role="img" aria-label="' + esc(W.name) + '">' + x + lives + '</div>';
  }

  // ======================================================================== the maker
  var M = null;
  function live() { return M && M.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return M.card.querySelector(sel); }
  function saved() { try { var l = JSON.parse(K.store('bio-made') || '[]'); return Array.isArray(l) ? l.map(clean) : []; } catch (e) { return []; } }
  function keep(list) { K.store('bio-made', JSON.stringify(list.slice(0, 20))); }
  function host(label) {
    M = { card: BK.host(28, label), g: null, st: null, pools: null };
    K.gameHud(M.card, 0, '');
    return M;
  }
  function show(html, btns) {
    BK.body(M.card, html, true);
    M.card.querySelector('.am-finish__card').classList.add('tb-wide');
    BK.buttons(M.card, btns || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(M.card);
  }
  // A row of cards to pick one from.
  function row(label, key, list, now, extra) {
    return '<fieldset class="mk-row"><legend>' + label + '</legend><div class="mk-chips">' + list.map(function (o) {
      var on = String(o[0]) === String(now);
      return '<button type="button" class="mk-chip' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-mk-set="' + key + '" data-mk-val="' + esc(String(o[0])) + '"' +
        (extra ? extra(o) : '') + '>' + o[1] + '</button>';
    }).join('') + '</div></fieldset>';
  }
  function open(g) {
    if (!live()) host('Make your own games');
    M.g = clean(g || M.g || defaults());
    draw();
  }
  function draw() {
    var g = M.g, W = WORLDS[g.w], mine = saved();
    var list = mine.length ? '<section class="mk-mine" aria-label="Your games"><h3 class="mk-h">Your games</h3><ul>' + mine.map(function (x, i) {
      return '<li><span class="mk-mine__av">' + avatar(x, 34) + '</span><b>' + esc(x.n) + '</b><span class="mk-mine__w">' + WORLDS[x.w].name + '</span>' +
        '<button type="button" class="mk-mini mk-mini--go" data-mk-play="' + i + '">Play</button><button type="button" class="mk-mini" data-mk-edit="' + i + '">Edit</button>' +
        '<button type="button" class="mk-mini" data-mk-del="' + i + '" aria-label="Delete ' + esc(x.n) + '">Delete</button></li>';
    }).join('') + '</ul></section>' : '';
    show('<div class="mk">' + list +
      '<h3 class="mk-h">' + (mine.length ? 'Make a new one' : 'Make your own game') + '</h3>' +
      '<div class="mk-preview">' + worldHtml(g, fresh(g)) + '</div>' +
      '<label class="mk-name"><span>Name</span><input type="text" maxlength="' + NAME_MAX + '" value="' + esc(g.n) + '" data-mk-name></label>' +
      row('World', 'w', ORDER.map(function (k) { return [k, WORLDS[k].name]; }), g.w) +
      row('Right answer', 'r', W.right, g.r) +
      row('Wrong answer', 'x', W.wrong, g.x) +
      row(W.unit.charAt(0).toUpperCase() + W.unit.slice(1) + ' to win', 's', W.size.map(function (v) { return [v, String(v)]; }), g.s) +
      row('You', 'a', AVATARS.map(function (a, i) { return [i, avatar({ c: g.c, a: i }, 40)]; }), g.a) +
      row('Colour', 'c', COLOURS.map(function (c, i) { return [i, '<i class="mk-swatch" style="background:' + c + '"></i>']; }), g.c, function (o) { return ' aria-label="Colour ' + (o[0] + 1) + '"'; }) +
      row('Background', 'b', BACKS.map(function (b, i) { return [i, b[1]]; }), g.b) +
      row('Examiner', 'e', MOODS.map(function (m, i) { return [i, m[1]]; }), g.e) +
      '<fieldset class="mk-row"><legend>Chapters</legend><div class="mk-chips">' + CH.map(function (c) {
        var on = g.ch.indexOf(c) >= 0;
        return '<button type="button" class="mk-chip mk-chip--ch' + (on ? ' is-on' : '') + '" style="--c:' + COL[c] + '" aria-pressed="' + on + '" data-mk-ch="' + c + '">' + esc(NAME[c]) + '</button>';
      }).join('') + '</div></fieldset>' +
      row('Answers', 'q', ANSWERS, g.q) +
      '<div class="mk-share" data-mk-share hidden><input type="text" readonly data-mk-link aria-label="Link to your game"><span data-mk-copied></span></div>' +
      '</div>', [['more', 'data-mk-save', 'Save'], ['more', 'data-mk-link-btn', 'Share link'], ['ok', 'data-mk-go', 'Play']]);
    K.mascot('ok', pick(['Make it hard. I dare you.', 'Design away. The questions are still mine.']));
  }
  function set(key, val) {
    var g = M.g;
    if (key === 'w') { g.w = val; g.r = ''; g.x = ''; g.s = 0; }
    else if (key === 'r' || key === 'x' || key === 'q') g[key] = val;
    else if (key !== 'ch') g[key] = +val;
    M.g = clean(g);
    var name = q('[data-mk-name]');
    if (name) M.g.n = clean({ n: name.value }).n;
    var y = M.card.querySelector('.am-games__body, [data-am-gbody]'), top = y ? y.scrollTop : 0;
    draw();
    if (y) y.scrollTop = top;
  }
  function chapter(c) {
    var i = M.g.ch.indexOf(c);
    if (i >= 0 && M.g.ch.length > 1) M.g.ch.splice(i, 1); else if (i < 0) M.g.ch.push(c);
    M.g.ch.sort();
    set('ch', null);
  }
  function named() { var n = q('[data-mk-name]'); if (n) M.g.n = clean({ n: n.value }).n; return M.g; }
  function save(g) {
    var list = saved().filter(function (x) { return encode(x) !== encode(g); });
    list.unshift(clean(g));
    keep(list);
  }
  function share() {
    var g = named(), box = q('[data-mk-share]'), input = q('[data-mk-link]'), note = q('[data-mk-copied]'), url = linkOf(g);
    box.hidden = false;
    input.value = url;
    input.focus();
    input.select();
    var done = function (ok) { note.textContent = ok ? 'Copied. Send it to a friend.' : 'Copy the link and send it to a friend.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
    else done(false);
  }

  // ======================================================================== playing
  // A friend's link opens on a card with their game, ready to play or keep.
  function fromLink(code) {
    var g = decode(code);
    if (!g) return false;
    host('Make your own games');
    M.g = g;
    show('<div class="am-games__end mk-start"><div class="mk-preview">' + worldHtml(g, fresh(g)) + '</div><h3 class="am-games__title">' + esc(g.n) + '</h3>' +
      '<p class="mk-rules">' + rules(g) + '</p></div>',
      [['more', 'data-mk-keep', 'Save'], ['more', 'data-mk-remix', 'Change it'], ['ok', 'data-mk-go', 'Play']]);
    K.mascot('ok', 'Someone made this for you. Let\'s see.');
    return true;
  }
  function rules(g) {
    var W = WORLDS[g.w], name = function (list, id) { return list.filter(function (x) { return x[0] === id; })[0][1]; };
    return '<span><b>Right:</b> ' + esc(name(W.right, g.r)) + '</span><span><b>Wrong:</b> ' + esc(name(W.wrong, g.x)) + '</span>' +
      '<span><b>Win:</b> ' + (g.w === 'battle' ? 'his ' + g.s + ' hearts gone' : g.s + ' ' + W.unit) + '</span>' +
      '<span><b>Chapters:</b> ' + (g.ch.length === CH.length ? 'all' : g.ch.map(function (c) { return esc(NAME[c]); }).join(', ')) + '</span>';
  }
  function play(g) {
    M.g = clean(g);
    M.st = fresh(M.g);
    M.pools = BB.pools();
    M.mem = null;
    M.n = 0;
    K.gameHud(M.card, 0, 'right');
    turn();
  }
  function frame(panel, btns) {
    show('<div class="mk-play">' + worldHtml(M.g, M.st) + '<div class="tb-panel" data-mk-panel aria-live="polite">' + panel + '</div></div>', btns);
  }
  // Your question, from the memory you share with Exam drill. Typed: always (Typed), never (Tick boxes), or every
  // third question and whenever one is due to type (Boxes and typed).
  function turn() {
    var g = M.g, want = g.q === 'type' || (g.q === 'mix' && M.n % 3 === 2), only = function (it) { return g.ch.indexOf(it.ch) >= 0; };
    var m = BB.memNext(M, M.pools, null, want, only);
    if (!m) { frame('<p class="tb-say">No questions in those chapters.</p>'); return; }
    M.n += 1;
    M.item = m.item;
    M.typed = g.q !== 'box' && Boolean(m.typed && m.item.want);
    M.phase = 'ask';
    var it = m.item, text = M.typed ? it.text : it.text.replace(/\s*\((\d+ of )?\d+ points?\)$/, '');
    frame('<div class="tb-card" style="--c:' + COL[it.ch] + '"><div class="tb-card__in"><div class="tb-card__face"><div class="tb-card__band"><b>' + esc(NAME[it.ch]) + '</b><span>' +
      (M.typed ? 'Type it' : 'Question ' + M.n) + '</span></div><div class="tb-card__body"><p class="tb-q">' + esc(text) + '</p>' +
      (M.typed ? '<textarea class="tb-text" data-mk-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-mk-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-mk-pass>I don\'t know</button></div>'
        : '<div class="tb-opts">' + shuffle([it.c.right].concat(it.c.wrong)).map(function (o) { return '<button type="button" class="tb-opt" data-mk-opt="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>') +
      '<div class="qg-after" data-mk-after></div></div></div></div></div>');
    BB.reveal(q('.tb-card'), function () { var t = q('[data-mk-text]'); if (t) t.focus({ preventScroll: true }); });
  }
  function choose(btn) {
    if (M.phase !== 'ask') return;
    var mine = btn.getAttribute('data-mk-opt'), ok = mine === M.item.c.right;
    M.card.querySelectorAll('[data-mk-opt]').forEach(function (b) {
      var o = b.getAttribute('data-mk-opt');
      b.disabled = true;
      if (o === M.item.c.right) b.classList.add('is-ok'); else if (o === mine) b.classList.add('is-no');
    });
    answered(ok, ok ? '' : 'You said: ' + mine);
  }
  function check(pass) {
    if (M.phase !== 'ask') return;
    var box = q('[data-mk-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    var got = text && window.BioApp ? window.BioApp.check(M.item.src, M.item.qid, M.item.k, text).filter(Boolean).length : 0, ok = got >= M.item.want;
    box.disabled = true;
    var r = q('[data-mk-check]');
    if (r) r.closest('.tb-row').remove();
    answered(ok, text ? 'You wrote: ' + (text.length > 120 ? text.slice(0, 117) + '...' : text) + (got && !ok ? ' (' + got + ' of ' + M.item.want + ' points)' : '') : '');
  }
  // After an answer: the answer and why, when it comes back, then your rule happens in the world.
  function answered(ok, mine) {
    M.phase = 'shown';
    var g = M.g, it = M.item, out = step(g, M.st, ok, M.typed), mood = MOODS[g.e][0], line = BB.memLine(BB.memRecord(M.pools, it, M.typed, ok));
    M.st = out.st;
    K.rollTo(q('[data-am-gscore]'), M.st.right);
    if (ok) K.ding(M.typed ? 4 : 2, true); else K.bonk();
    K.mascot(ok ? 'angry' : 'happy', pick(SAY[mood][ok ? 'right' : 'wrong']));
    q('[data-mk-after]').innerHTML = '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + (ok ? 'Correct' : 'Not quite') + '</p>' + (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>Answer</span>' + esc(it.c.right) + '</p><p class="tb-why"><span>Why</span>' + esc(it.c.why) + '</p>' + line;
    var world = q('.mk-world');
    if (world) world.outerHTML = worldHtml(g, M.st);
    var w = q('.mk-world');
    if (w) { w.classList.add(ok ? 'is-good' : 'is-bad'); w.setAttribute('data-said', out.said); }
    var end = over(g, M.st);
    var rowEl = document.createElement('div');
    rowEl.className = 'tb-row tb-row--next';
    rowEl.innerHTML = '<p class="mk-said">' + esc(out.said) + '</p><button type="button" class="tb-btn tb-btn--go" ' + (end ? 'data-mk-end="' + end + '"' : 'data-mk-next') + '>' + (end ? 'See how you did' : 'Next question') + '</button>';
    q('[data-mk-panel]').appendChild(rowEl);
    rowEl.querySelector('button').focus({ preventScroll: true });
  }
  function finish(how) {
    var g = M.g, won = how === 'win', mood = MOODS[g.e][0];
    M.phase = 'over';
    show('<div class="am-games__end mk-end"><div class="mk-preview">' + worldHtml(g, M.st) + '</div><h3 class="am-games__title">' + (won ? 'You won!' : 'He won.') + '</h3>' +
      '<p class="am-games__sub">' + esc(g.n) + ': ' + M.st.right + ' right of ' + M.st.asked + '.</p></div>',
      [['more', 'data-mk-remix', 'Change it'], ['more', 'data-mk-link-end', 'Share link'], ['ok', 'data-mk-go', 'Play again']]);
    K.mascot(won ? 'angry' : 'happy', SAY[mood][won ? 'win' : 'lose']);
    if (won) K.later(K.fanfare, 300);
  }

  // ======================================================================== clicks and keys
  document.addEventListener('click', function (e) {
    if (!live() || !M.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-mk-set]'))) { set(t.getAttribute('data-mk-set'), t.getAttribute('data-mk-val')); return; }
    if ((t = e.target.closest('[data-mk-ch]'))) { chapter(+t.getAttribute('data-mk-ch')); return; }
    if (e.target.closest('[data-mk-go]')) { play(M.phase === 'over' || !q('[data-mk-name]') ? M.g : named()); return; }
    if (e.target.closest('[data-mk-save]')) { save(named()); draw(); K.mascot('ok', 'Saved.'); return; }
    if (e.target.closest('[data-mk-keep]')) { save(M.g); open(M.g); K.mascot('ok', 'Saved to your games.'); return; }
    if (e.target.closest('[data-mk-remix]')) { M.phase = ''; open(M.g); return; }
    if (e.target.closest('[data-mk-link-btn]')) { share(); return; }
    if (e.target.closest('[data-mk-link-end]')) { M.phase = ''; open(M.g); share(); return; }
    if ((t = e.target.closest('[data-mk-play]'))) { play(saved()[+t.getAttribute('data-mk-play')]); return; }
    if ((t = e.target.closest('[data-mk-edit]'))) { M.g = saved()[+t.getAttribute('data-mk-edit')]; draw(); return; }
    if ((t = e.target.closest('[data-mk-del]'))) { var l = saved(); l.splice(+t.getAttribute('data-mk-del'), 1); keep(l); named(); draw(); return; }
    if ((t = e.target.closest('[data-mk-opt]'))) { choose(t); return; }
    if (e.target.closest('[data-mk-check]')) { check(false); return; }
    if (e.target.closest('[data-mk-pass]')) { check(true); return; }
    if (e.target.closest('[data-mk-next]') && M.phase === 'shown') { turn(); return; }
    if ((t = e.target.closest('[data-mk-end]'))) { finish(t.getAttribute('data-mk-end')); }
  });
  document.addEventListener('input', function (e) {
    if (!live() || !e.target.closest || !e.target.closest('[data-mk-name]')) return;
    M.g.n = clean({ n: e.target.value }).n;
  });
  document.addEventListener('keydown', function (e) {
    if (!live() || e.key !== 'Enter' || e.shiftKey || !e.target.closest || !e.target.closest('[data-mk-text]')) return;
    e.preventDefault();
    check(false);
  });
  window.addEventListener('resize', function () { if (live()) BB.nearMascot(M.card); });

  window.BioMaker = { open: function () { M = null; open(); }, fromLink: fromLink, state: function () { return M; },
    // For tools/bio/tests/maker.mjs.
    test: { WORLDS: WORLDS, clean: clean, encode: encode, decode: decode, fresh: fresh, step: step, over: over, defaults: defaults } };
})();

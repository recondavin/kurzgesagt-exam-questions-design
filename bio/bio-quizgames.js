// Three more question games on the Biology hub, one move at a time like the trivia board (the user, pasting quiz shows
// with questions: "add these"). Each under its own name:
//   Outrun the Examiner  A corridor of ten steps to home's door. You start a few steps ahead of the examiner and you
//                        both answer each question (pick the answer). Your right answer moves you a step towards home;
//                        his moves him a step after you, and two right in a row he leaps two. Home first and you win;
//                        caught and he does. No question twice in a chase.
//   Points Grid          Five chapters by 100 to 500 points. 100 to 300 are pick-the-answer, 400 and 500 typed and marked
//                        against the scheme (500 asks for two points where it can; part marks earn part of the value).
//                        Right adds the points, wrong takes them off, passing costs nothing. At the end, each chapter's
//                        points and what to work on.
//   Don't Say It         Describe a term without saying it or its banned words (they turn red as you type); the examiner
//                        thinks, then guesses it if the description has enough of its key ideas, marked like the answer
//                        sheet (one more go when it's not enough). Afterwards, the ideas you gave and the ones you
//                        missed. The terms: tools/bio/taboo/ch<N>.json, built into bio/taboo.js; tools/bio/tests/taboo.mjs
//                        checks them.
// The questions are the trivia board's (BioBoard.pools: the quick checks that make sense on their own, under the chapter
// they're about), on its cards, with its stamp.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.pools) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, buttons = BK.buttons;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours;
  var S = null;
  function live() { return S && S.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return S.card.querySelector(sel); }
  function start(kind, label, segs, unit) {
    S = { kind: kind, card: BK.host(28, label) };
    K.gameHud(S.card, segs || 0, unit || '');
    return S;
  }
  // The card is as wide as the trivia board's, with the examiner beside it.
  function show(html, close) {
    BK.body(S.card, html, true);
    S.card.querySelector('.am-finish__card').classList.add('tb-wide');
    buttons(S.card, close || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(S.card);
  }
  function score(n) { K.rollTo(q('[data-am-gscore]'), n); }
  function into(node) { if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: K.reduced() ? 'auto' : 'smooth' }); }
  // A question card like the board's: the chapter's band, then the question.
  function card(ch, label, inner) {
    K.sfx('whoosh', 0.35);
    return '<div class="tb-card" style="--c:' + COL[ch] + '"><div class="tb-card__in"><div class="tb-card__face">' +
      '<div class="tb-card__band"><b>' + esc(NAME[ch]) + '</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div>' +
      '<div class="tb-card__body">' + inner + '</div></div></div></div>';
  }
  // A pick-the-answer question doesn't need the typed answer's "(2 points)".
  function asked(item, typed) { return esc(typed ? item.text : BB.plain(item.text)); }
  // The same question can be filed under two exam questions; this is how it's known as the same one.
  function same(item) { return BB.plain(item.text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function options(item) {
    return '<div class="tb-opts">' + shuffle([item.c.right].concat(item.c.wrong)).map(function (o) {
      return '<button type="button" class="tb-opt" data-qg-opt="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div>';
  }
  // Mark the options: the right one green, yours red if it wasn't.
  function markOptions(item, said) {
    S.card.querySelectorAll('[data-qg-opt]').forEach(function (b) {
      var o = b.getAttribute('data-qg-opt');
      b.disabled = true;
      if (o === item.c.right) b.classList.add('is-ok');
      else if (o === said) b.classList.add('is-no');
    });
  }
  // What you said, the answer (not when the options show it already, marked green) and why.
  function answer(item, mine, shown) {
    return (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      (shown ? '' : '<p class="tb-ans"><span>Right answer</span>' + esc(item.c.right) + '</p>') + window.BioBoard.why(item.c);
  }
  // The board's stamp slams on; it thuds as it lands, and a wrong one shakes the card.
  function stamp(ok, text, cls) { return BB.stamp(ok, text, 0, cls); }
  function thud(ok, delay) {
    K.later(function () {
      if (!live()) return;
      K.sfx('stamp', ok ? 0.8 : 1);
      var c = q('.tb-card');
      if (!ok && c && !K.reduced()) { c.classList.remove('is-shake'); void c.offsetWidth; c.classList.add('is-shake'); }
    }, K.reduced() ? 0 : (delay || 0) + 170);
  }
  function next(label, attr) {
    var row = document.createElement('div');
    row.className = 'tb-row tb-row--next';
    row.innerHTML = '<button type="button" class="tb-btn tb-btn--go" ' + attr + '>' + label + '</button>';
    q('[data-qg-panel]').appendChild(row);
    row.querySelector('button').focus({ preventScroll: true });
    into(row);
  }
  // A typed answer, marked against its part of the scheme like the answer sheet; it needs the points the check asks for.
  function marked(item, text) {
    var got = text && window.BioApp ? window.BioApp.check(item.src, item.qid, item.k, text).filter(Boolean).length : 0;
    return { got: got, ok: got >= item.want };
  }
  function typedBox() {
    return '<textarea class="tb-text" data-qg-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
      '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-qg-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-qg-pass>I don\'t know</button></div>';
  }
  function said(text, got, want) {
    return 'You wrote: ' + (text.length > 120 ? text.slice(0, 117) + '...' : text) + (got && got < want ? ' (' + got + ' of ' + want + ' points)' : '');
  }

  // ======================================================================== Outrun the Examiner
  // Ten steps along a corridor, then home's door. He starts at the far end, you a head start ahead of him (3, 4 or 5
  // steps: the fewer, the harder). He's right 68 in 100, and his second right answer in a row is a leap of two. Tuned by
  // simulating 200,000 chases each: a player right 7 in 10 gets home about 46, 67 and 85 times in 100 (Hard, Normal,
  // Easy); right 9 in 10, 78, 93 and 98; a chase is about 7 questions. (It was 8 steps, 2/3/4 ahead and no leap, which
  // the same player escaped 69, 88 and 97 times in 100.) The smallest head start you've escaped from is kept.
  var STEPS = 10, HIS_ODDS = 0.68, HEADS = [[3, 'Hard'], [4, 'Normal'], [5, 'Easy']], BEST = 'bio-chase-best10';
  var CHASE_SAY = {
    start: ['Run, if you like. I\'m faster.', 'I\'ll catch you. I always do.'],
    youRight: ['Hmph. Lucky.', 'Fine. One step.'],
    youWrong: ['Wrong. I\'m coming.', 'Careful now.'],
    leap: ['Two in a row. Here I come.', 'Faster than you think.'],
    hisWrong: ['A slip. It won\'t happen twice.', 'That question was badly worded.'],
    caught: 'Caught you. Again?',
    home: 'Hmph. You got away. This time.'
  };
  function chaseOpen() {
    start('chase', 'Outrun the Examiner');
    K.playing(false);
    var best = +(K.store(BEST) || 0);
    show('<div class="am-games__end oe-start"><div class="oe-face" aria-hidden="true">' + K.face + '</div>' +
      '<h3 class="am-games__title">Outrun the Examiner</h3>' +
      '<p class="am-games__sub">Right answers move you a step towards home. He answers too, and two right in a row he leaps two.</p>' +
      '<p class="oe-ask">How big a head start?</p><div class="oe-heads">' + HEADS.map(function (h) {
        return '<button type="button" class="oe-head" data-oe-head="' + h[0] + '"><b class="num">' + h[0] + '</b><span>steps ahead</span><i>' + h[1] + '</i></button>';
      }).join('') + '</div>' + (best ? '<p class="oe-best">Best: escaped from ' + best + ' steps ahead</p>' : '') + '</div>');
    K.mascot('happy', pick(CHASE_SAY.start));
  }
  function chaseGo(head) {
    S.pools = BB.pools();
    S.head = head;
    S.you = head;
    S.him = 0;
    S.streak = 0;
    S.right = 0;
    S.his = 0;
    S.asked = 0;
    S.seen = {};
    K.playing(true);
    show('<div class="oe"><div class="oe-run" data-oe-track>' + track() + '</div><div class="tb-panel oe-q" data-qg-panel aria-live="polite"></div></div>');
    chaseAsk();
  }
  // The corridor, always in view above the question (it sticks to the top of the card as it scrolls): his start at the
  // far end, the steps, then home (a house whose door opens when you get there). His piece is his face, yours a blue
  // "You"; the steps between you are marked, and the line above says how far home is and how close he is.
  var HOUSE = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 30L32 7l26 23" fill="#FF9600" stroke="#13294A" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M12 27v30h40V27L32 10Z" fill="#FFC800" stroke="#13294A" stroke-width="3.5" stroke-linejoin="round"/><rect x="25" y="36" width="14" height="21" fill="#13294A"/>' +
    '<g class="oe-door"><rect x="25" y="36" width="14" height="21" fill="#FFFFFF" stroke="#13294A" stroke-width="3"/><circle cx="35" cy="47" r="1.8" fill="#13294A"/></g></svg>';
  function track() {
    var tiles = '';
    for (var i = 0; i < STEPS; i++) tiles += '<li class="oe-tile" data-oe-step="' + i + '"></li>';
    return '<p class="oe-line" data-oe-line>' + line() + '</p><div class="oe-lane" style="--n:' + (STEPS + 1) + '"><ol class="oe-floor">' + tiles +
      '<li class="oe-home" data-oe-home>' + HOUSE + '<span>Home</span></li></ol>' +
      '<div class="oe-tok oe-tok--him" data-oe-tok="him" style="--at:' + S.him + '"><span class="oe-tok__body"><span class="oe-tok__face">' + K.face + '</span></span><i class="oe-tok__hot">On a roll</i></div>' +
      '<div class="oe-tok oe-tok--you" data-oe-tok="you" style="--at:' + S.you + '"><span class="oe-tok__body"><b>You</b></span></div></div>';
  }
  function line() {
    var left = STEPS - S.you, gap = S.you - S.him;
    if (left <= 0) return '<b>Home!</b>';
    if (gap <= 0) return '<b>Caught!</b>';
    return '<b class="num">' + left + '</b> ' + (left === 1 ? 'step' : 'steps') + ' to home · he\'s <b class="num">' + gap + '</b> behind';
  }
  function paint() {
    var t = q('[data-oe-track]');
    if (!t) return;
    t.querySelector('[data-oe-line]').innerHTML = line();
    t.querySelectorAll('[data-oe-step]').forEach(function (li) {
      var i = +li.getAttribute('data-oe-step');
      li.classList.toggle('is-passed', i < S.him);
      li.classList.toggle('is-gap', i > S.him && i < S.you);
    });
    t.querySelector('[data-oe-tok="him"]').classList.toggle('is-hot', S.streak === 1);
  }
  // A piece hops to its new step, with what it moved floating up.
  function hop(who, at, label) {
    var tok = q('[data-oe-tok="' + who + '"]');
    if (!tok) return;
    tok.style.setProperty('--at', at);
    var b = tok.querySelector('.oe-tok__body');
    if (!K.reduced()) { b.classList.remove('is-hop'); void b.offsetWidth; b.classList.add('is-hop'); }
    if (label) {
      var pop = document.createElement('span');
      pop.className = 'oe-pop';
      pop.textContent = label;
      tok.appendChild(pop);
      K.later(function () { pop.remove(); }, 1100);
    }
    paint();
  }
  // Your questions come from the memory you share with Exam drill (bio-board.js): one due to type first, then one
  // you got wrong, then a new one; never one already asked in this chase. He answers the same question from its boxes.
  function chaseAsk() {
    var fresh = function (i) { return i.c.wrong.length >= 2 && !S.seen[BB.memKey(i)] && !S.seen[same(i)]; };
    var m = BB.memNext(S, S.pools, null, false, fresh) || BB.memNext(S, S.pools, null, false, function (i) { return i.c.wrong.length >= 2; }), item = m.item;
    S.seen[BB.memKey(item)] = S.seen[same(item)] = 1;
    S.item = item;
    S.typed = Boolean(m.typed && item.want);
    S.phase = 'ask';
    q('[data-qg-panel]').innerHTML = card(item.ch, S.typed ? 'Type it' : 'Question ' + (S.asked + 1), '<p class="tb-q">' + asked(item, S.typed) + '</p>' +
      (S.typed ? typedBox() : options(item)) + '<div class="qg-after" data-oe-after></div>');
    S.card.querySelector('.am-finish__card').scrollTop = 0;
    BB.reveal(q('.tb-card'), function () {
      var t = q('[data-qg-text]');
      if (t) t.focus({ preventScroll: true });
    });
  }
  function chaseChoose(btn) {
    if (S.phase !== 'ask') return;
    var mine = btn.getAttribute('data-qg-opt');
    markOptions(S.item, mine);
    chaseResult(mine === S.item.c.right, '');
  }
  function chaseCheck(pass) {
    if (S.phase !== 'ask') return;
    var box = q('[data-qg-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    var m = text ? marked(S.item, text) : { got: 0, ok: false };
    box.disabled = true;
    var row = q('[data-qg-check]');
    if (row) row.closest('.tb-row').remove();
    chaseResult(m.ok, text ? said(text, m.got, S.item.want) : '');
  }
  // Your answer, then his pick, then the move as its own beat (you first: home is safe even if he moves after), then
  // the why. The corridor stays in view throughout.
  function chaseResult(ok, mine) {
    S.phase = 'shown';
    var item = S.item, hisOk = Math.random() < HIS_ODDS, his = hisOk ? item.c.right : pick(item.c.wrong);
    S.asked += 1;
    if (ok) S.right += 1;
    if (hisOk) S.his += 1;
    var later = BB.memLine(BB.memRecord(S.pools, item, S.typed, ok));
    if (ok) K.ding(S.typed ? 4 : 2, true); else K.bonk();
    var after = q('[data-oe-after]');
    after.innerHTML = '<p class="tb-say tb-think">He answers…</p>';
    wait(function () {
      var tagged = false;
      S.card.querySelectorAll('[data-qg-opt]').forEach(function (b) {
        if (b.getAttribute('data-qg-opt') !== his) return;
        b.classList.add('is-his');
        b.insertAdjacentHTML('beforeend', '<span class="tb-his">Examiner</span>');
        tagged = true;
      });
      after.innerHTML = tagged ? '' : '<p class="tb-mine">He said: ' + esc(his) + '</p>';
      K.sfx('tick', 0.8);
      wait(function () { chaseMove(ok, hisOk, function () { chaseExplain(ok, hisOk, mine, later); }); }, 450);
    }, 750);
  }
  function chaseMove(ok, hisOk, done) {
    if (ok && S.you + 1 >= STEPS) { S.you = STEPS; escape(done); return; }
    if (ok) { S.you += 1; hop('you', S.you, '+1'); K.sfx('whoosh', 0.6); }
    wait(function () {
      if (!hisOk) { S.streak = 0; paint(); wait(done, 250); return; }
      S.streak += 1;
      var leap = S.streak === 2;
      if (leap) { S.streak = 0; K.mascot('happy', pick(CHASE_SAY.leap)); }
      hisSteps(leap ? 2 : 1, done);
    }, ok ? 600 : 100);
  }
  function hisSteps(n, done) {
    var k = 0;
    (function step() {
      S.him = Math.min(S.him + 1, S.you);
      hop('him', S.him, k ? '' : '+' + n);
      K.sfx('thud', 0.55);
      k += 1;
      if (S.him >= S.you) { wait(function () { caught(done); }, 380); return; }
      if (k < n) { wait(step, 330); return; }
      wait(done, 550);
    })();
  }
  // Caught: he lunges onto your piece and the corridor shakes.
  function caught(done) {
    var t = q('[data-oe-track]');
    t.classList.add('is-caught');
    paint();
    K.sfx('crash', 1);
    wait(done, 900);
  }
  // Home: the door opens, you go in, it shuts behind you.
  function escape(done) {
    var t = q('[data-oe-track]'), home = t.querySelector('[data-oe-home]');
    home.classList.add('is-open');
    K.sfx('whoosh', 0.8);
    wait(function () {
      hop('you', STEPS, '');
      wait(function () {
        t.classList.add('is-home');
        wait(function () { home.classList.remove('is-open'); K.sfx('thud', 0.5); K.fanfare(); wait(done, 500); }, 450);
      }, 450);
    }, 250);
  }
  function chaseExplain(ok, hisOk, mine, later) {
    var item = S.item, over = S.you >= STEPS ? 'home' : S.him >= S.you ? 'caught' : '';
    q('[data-oe-after]').insertAdjacentHTML('beforeend', '<div class="oe-result">' + stamp(ok, ok ? 'You: right' : 'You: wrong') + stamp(hisOk, hisOk ? 'Him: right' : 'Him: wrong') + '</div>' +
      answer(item, mine, !S.typed) + later);
    thud(ok);
    // The last why is read before the end, so the end waits for a click.
    if (over) {
      K.mascot(over === 'home' ? 'angry' : 'happy', over === 'home' ? CHASE_SAY.home : CHASE_SAY.caught);
      next('See how you did', 'data-oe-end');
      return;
    }
    if (!K.reduced()) K.mascot(ok ? 'angry' : 'happy', pick(ok ? CHASE_SAY.youRight : hisOk ? CHASE_SAY.youWrong : CHASE_SAY.hisWrong));
    next('Next question', 'data-oe-next');
  }
  function chaseEnd() {
    var home = S.you >= STEPS;
    S.phase = 'over';
    K.playing(false);
    var best = +(K.store(BEST) || 0), better = home && (!best || S.head < best);
    if (better) K.store(BEST, String(S.head));
    show('<div class="oe-end"><div class="oe-run oe-run--end' + (home ? ' is-home' : ' is-caught') + '">' + track() + '</div><div class="am-games__end">' +
      '<h3 class="am-games__title">' + (home ? 'You got home!' : 'Caught!') + '</h3>' +
      '<p class="am-games__sub">' + (home ? 'You escaped from ' + S.head + ' steps ahead' + (better ? ', your best yet.' : '.') : 'He caught you ' + (STEPS - S.you) + (STEPS - S.you === 1 ? ' step' : ' steps') + ' from home.') +
      ' You got <b>' + S.right + ' of ' + S.asked + '</b> right; he got ' + S.his + '.' + (home && S.head > HEADS[0][0] ? ' Try a smaller head start.' : '') + '</p></div></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-oe-again', 'Play again']]);
  }

  // ======================================================================== Points Grid
  var VALUES = [100, 200, 300, 400, 500];
  // On a phone the five columns are too narrow for the chapters' names.
  var SHORT = { 28: 'Lungs', 29: 'Urine', 30: 'Gut', 31: 'Blood', 32: 'Immune' };
  function gridOpen() {
    start('grid', 'Points Grid', 25, 'points');
    var P = BB.pools(), used = {};
    S.pools = P;
    S.score = 0;
    S.cells = {};
    // No question twice in a grid, even one filed under two exam questions.
    var free = function (i) { return !used[BB.memKey(i)] && !used[same(i)]; };
    var take = function (list, ok) {
      var got = list.filter(function (i) { return free(i) && (!ok || ok(i)); })[0] || list.filter(free)[0];
      if (got) used[BB.memKey(got)] = used[same(got)] = 1;
      return got || null;
    };
    // Each chapter's column: a true-or-false for 100 where there is one, pick-the-answer for 200 and 300, typed for
    // 400 and 500 (a two-point answer for 500 where there is one; never one that needs its options to make sense,
    // which BioBoard.pools leaves out of the typed ones). Dealt in the order of the memory you share with Exam drill:
    // the typed 400 and 500 from questions due to type, the boxes from ones you got wrong, then new ones.
    S.cols = CH.map(function (ch) {
      var typedList = BB.memOrder(P, P[ch].typed, true), boxList = BB.memOrder(P, P[ch].mc, false);
      var five = take(typedList, function (i) { return i.want >= 2; }), four = take(typedList, function (i) { return i.want === 1; });
      var tf = function (i) { return /^(True|False)$/.test(i.c.right); }, mc = function (i) { return !tf(i); };
      return { ch: ch, items: [take(boxList, tf), take(boxList, mc), take(boxList, mc), four, five] };
    });
    K.playing(true);
    gridShow();
    K.mascot('ok', 'Pick a chapter and a value. Wrong answers cost you.');
  }
  function cellText(done, v) {
    return done.how === 'ok' ? '+' + v : done.how === 'no' ? '−' + v : done.how === 'part' ? '+' + done.pts : 'Pass';
  }
  function gridShow() {
    S.phase = 'grid';
    var left = 0;
    var html = '<div class="pts"><div class="pts-grid" role="grid" aria-label="Points Grid">' + S.cols.map(function (col) {
      return '<div class="pts-col" role="row"><p class="pts-head" style="--c:' + COL[col.ch] + '"><span class="pts-head__long">' + esc(NAME[col.ch]) + '</span><span class="pts-head__short" aria-hidden="true">' + SHORT[col.ch] + '</span></p>' + VALUES.map(function (v, r) {
        var id = col.ch + ':' + r, done = S.cells[id], item = col.items[r];
        if (!done && item) left += 1;
        if (!item) return '<span class="pts-cell is-none" role="gridcell"></span>';
        if (done) return '<span class="pts-cell is-' + done.how + '" role="gridcell" data-pts-done="' + id + '" aria-label="' + v + ': ' + cellText(done, v) + '"><b class="num">' + cellText(done, v) + '</b></span>';
        return '<button type="button" class="pts-cell" role="gridcell" data-pts-cell="' + id + '" aria-label="' + esc(NAME[col.ch]) + ' for ' + v + '"><b class="num">' + v + '</b></button>';
      }).join('') + '</div>';
    }).join('') + '</div><div class="tb-panel" data-qg-panel aria-live="polite"></div></div>';
    if (!left) { gridEnd(); return; }
    show(html, [['more', 'data-am-keep', 'Close'], ['more', 'data-pts-finish', 'Finish']]);
    q('[data-qg-panel]').innerHTML = '<p class="tb-say pts-total"><b class="num">' + left + '</b> left · finish any time</p>';
    // Coming back, the grid is already there (no slide in), so the points start from the cell.
    if (S.last) { q('.pts').classList.remove('am-run__in'); flyPoints(S.last); S.last = null; }
  }
  // Back at the grid, the cell you answered pops and its points fly up into the score.
  function flyPoints(last) {
    var cell = q('[data-pts-done="' + last.id + '"]'), to = q('[data-am-gscore]');
    if (cell && !K.reduced()) cell.classList.add('is-new');
    var land = function () {
      score(S.score);
      if (!last.pts) return;
      K.sfx('pop', 0.9);
      if (last.pts > 0) K.ding(2); else K.sfx('thud', 0.5);
      if (to && !K.reduced()) { to.classList.remove('am-bump'); void to.offsetWidth; to.classList.add('am-bump'); }
    };
    if (!cell || !to || !last.pts || K.reduced() || !cell.animate) { land(); return; }
    var host = S.card.getBoundingClientRect(), a = cell.getBoundingClientRect(), b = to.getBoundingClientRect();
    var chip = document.createElement('div');
    chip.className = 'pts-fly' + (last.pts < 0 ? ' is-down' : '');
    chip.textContent = (last.pts > 0 ? '+' : '−') + Math.abs(last.pts);
    chip.style.left = (a.left + a.width / 2 - host.left) + 'px';
    chip.style.top = (a.top + a.height / 2 - host.top) + 'px';
    S.card.appendChild(chip);
    var dx = Math.round(b.left + b.width / 2 - a.left - a.width / 2), dy = Math.round(b.top + b.height / 2 - a.top - a.height / 2);
    chip.animate([
      { transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%, -90%) scale(1.35)', opacity: 1, offset: 0.3 },
      { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.7)', opacity: 1 }
    ], { duration: 850, delay: 200, easing: 'cubic-bezier(.5, 0, .3, 1)', fill: 'backwards' }).onfinish = function () { chip.remove(); if (live()) land(); };
  }
  // The cell zooms open into the question: a copy of it grows from where it was to where the card is, then gives way to
  // the card (FLIP), and the question types in.
  function zoom(from, v, c, done) {
    if (!from || K.reduced() || !c || !c.animate) { done(); return; }
    // The card doesn't slide or drop in as well (answer-mode.js's entrance, the card's own), so it is where it's measured.
    var view = c.closest('.pts-q');
    if (view) view.classList.remove('am-run__in');
    c.style.animation = 'none';
    var host = S.card.getBoundingClientRect(), to = c.getBoundingClientRect();
    var box = function (r, size) { return { left: (r.left - host.left) + 'px', top: (r.top - host.top) + 'px', width: r.width + 'px', height: r.height + 'px', fontSize: size + 'px' }; };
    var z = document.createElement('div');
    z.className = 'pts-zoom';
    z.innerHTML = '<b class="num">' + v + '</b>';
    S.card.appendChild(z);
    c.style.visibility = 'hidden';
    K.sfx('whoosh', 0.6);
    z.animate([box(from, 32), box(to, 96)], { duration: 430, easing: 'cubic-bezier(.3, .7, .2, 1)', fill: 'forwards' }).onfinish = function () {
      c.style.visibility = '';
      z.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = function () { z.remove(); };
      if (live()) done();
    };
  }
  function gridAsk(id, cell) {
    var at = id.split(':'), col = S.cols.filter(function (c) { return c.ch === +at[0]; })[0], r = +at[1], item = col.items[r], v = VALUES[r];
    var from = cell && cell.getBoundingClientRect();
    S.phase = 'ask';
    S.id = id;
    S.item = item;
    S.value = v;
    S.typed = r >= 3;
    show('<div class="pts-q"><div class="tb-panel" data-qg-panel aria-live="polite">' +
      card(item.ch, v + ' points', '<p class="tb-q">' + asked(item, S.typed) + '</p>' + (S.typed ? typedBox() : options(item) + '<div class="tb-row"><button type="button" class="tb-btn tb-btn--ghost" data-qg-pass>Pass</button></div>') + '<div class="qg-after" data-pts-after></div>') +
      '</div></div>', [['more', 'data-am-keep', 'Close']]);
    var c = q('.tb-card');
    zoom(from, v, c, function () {
      BB.reveal(c, function () {
        var t = q('[data-qg-text]');
        if (t) t.focus({ preventScroll: true });
      });
    });
  }
  // Right adds the points, wrong takes them off, passing costs nothing; a typed answer with some of its points earns that
  // share of the value (2 of 3 points on 300: +200), rounded to 10. You see the answer either way.
  function gridAnswered(how, mine, part) {
    S.phase = 'shown';
    var item = S.item, v = S.value, at = S.id.split(':');
    var pts = how === 'ok' ? v : how === 'no' ? -v : how === 'part' ? part : 0;
    S.cells[S.id] = { how: how, v: v, pts: pts };
    S.score += pts;
    S.last = { id: S.id, pts: pts };
    K.gameSeg(S.card, CH.indexOf(+at[0]) * 5 + +at[1], how === 'ok' ? 'is-ok' : how === 'no' ? 'is-no' : how === 'part' ? 'is-half' : '');
    // The answer buttons go; the options stay, marked.
    S.card.querySelectorAll('[data-qg-pass], [data-qg-check]').forEach(function (b) { var row = b.closest('.tb-row'); if (row) row.remove(); });
    if (!S.typed) markOptions(item, null);
    var t = q('[data-qg-text]');
    if (t) t.disabled = true;
    if (how === 'ok') { K.ding(S.typed ? 4 : 2, true); K.mascot('angry', 'Hmph. ' + v + ' points.'); }
    else if (how === 'part') { K.ding(1); K.mascot('ok', 'Part marks. ' + pts + ' of ' + v + '.'); }
    else if (how === 'no') { K.bonk(); K.mascot('happy', 'Wrong. That\'s ' + v + ' off.'); }
    else K.mascot('ok', 'Wise, maybe.');
    q('[data-pts-after]').innerHTML = stamp(how === 'ok' || how === 'part', how === 'pass' ? 'Passed: 0' : (pts > 0 ? '+' : '−') + Math.abs(pts), how === 'part' ? 'is-part' : how === 'pass' ? 'is-pass' : '') +
      answer(item, mine, !S.typed) + BB.memLine(BB.memRecord(S.pools, item, S.typed, how === 'ok'));
    if (how !== 'pass') thud(how !== 'no');
    next('Back to the grid', 'data-pts-back');
  }
  function gridChoose(btn) {
    if (S.phase !== 'ask') return;
    var mine = btn.getAttribute('data-qg-opt'), ok = mine === S.item.c.right;
    markOptions(S.item, mine);
    gridAnswered(ok ? 'ok' : 'no', ok ? '' : 'You said: ' + mine);
  }
  function gridCheck() {
    if (S.phase !== 'ask') return;
    var box = q('[data-qg-text]'), text = (box.value || '').trim();
    if (!text) { box.focus(); return; }
    var m = marked(S.item, text), part = Math.round(S.value * Math.min(m.got, S.item.want) / S.item.want / 10) * 10;
    gridAnswered(m.ok ? 'ok' : m.got ? 'part' : 'no', said(text, m.got, S.item.want), part);
  }
  // The end: the score once (big; the bar's is hidden) and each chapter's points. Only chapters with something wrong,
  // short of full marks or passed are picked out in gold to work on; cells you didn't get to are just "not tried".
  function gridEnd() {
    S.phase = 'over';
    K.playing(false);
    var best = K.store('bio-grid-best'), better = best == null || S.score > +best;
    if (better) K.store('bio-grid-best', String(S.score));
    var rows = S.cols.map(function (col) {
      var pts = 0, n = { ok: 0, no: 0, part: 0, pass: 0, left: 0, all: 0 };
      VALUES.forEach(function (v, r) {
        if (!col.items[r]) return;
        var d = S.cells[col.ch + ':' + r];
        n.all += 1;
        if (!d) { n.left += 1; return; }
        n[d.how] += 1;
        pts += d.pts;
      });
      var work = [n.no ? n.no + ' wrong' : '', n.part ? n.part + ' short of full marks' : '', n.pass ? n.pass + ' passed' : ''].filter(Boolean);
      var note = work.length ? 'Work on this: ' + work.join(', ') : n.left === n.all ? 'Not tried' : n.left ? n.ok + ' right · ' + n.left + ' not tried' : 'All right';
      return '<li class="pts-row' + (work.length ? ' is-weak' : n.left === n.all ? ' is-untried' : '') + '" style="--c:' + COL[col.ch] + '"><span class="pts-row__n">' + esc(NAME[col.ch]) + '</span>' +
        '<b class="num">' + (pts > 0 ? '+' : pts < 0 ? '−' : '') + Math.abs(pts) + '</b><span class="pts-row__note">' + note + '</span></li>';
    }).join('');
    show('<div class="am-games__end pts-end"><p class="pts-big num">' + (S.score < 0 ? '−' : '') + Math.abs(S.score) + '<span>points</span></p>' +
      '<p class="am-games__sub">' + (better && best != null ? 'Your best yet.' : best != null ? 'Best: ' + best + ' points.' : 'Your first game.') + '</p><ul class="pts-rows">' + rows + '</ul></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-pts-again', 'Play again']]);
    var box = q('[data-am-gscorebox]');
    if (box) box.hidden = true;
    K.mascot(S.score >= 1500 ? 'angry' : 'happy', S.score >= 1500 ? 'Hmph. Not bad.' : 'I expected more.');
    if (S.score >= 1500) K.later(K.fanfare, 300);
  }

  // ======================================================================== Don't Say It
  // A round is eight terms from a chapter (or all five). Banned: the listed words and the term's own words (not "of"
  // or "and"), matched like the marker matches words (so "kidneys" is "kidney"), and a banned word with an ending
  // ("fatty" for "fat", "airy" for "air"). tools/bio/tests/taboo.mjs checks the terms with this same rule.
  var ROUND = 8, END = /^(|s|es|y|ty|ier|iest|ly|er|ers|est|ed|d|ing|ish|ness|ful)$/;
  function banList(t) {
    return t.ban.concat(t.term.split(/[^A-Za-z]+/).filter(function (w) { return w.length >= 3 && !/^(and|the|for)$/i.test(w); }).map(function (w) { return w.toLowerCase(); }))
      .filter(function (b, i, all) { return all.indexOf(b) === i; });
  }
  function banned(text, t) {
    var B = window.BioApp, words = B.words(text), raw = String(text).toLowerCase().match(/[a-z]+/g) || [];
    return banList(t).filter(function (b) {
      var stem = B.words(b)[0];
      return stem && B.hasPoint({ k: [{ w: [stem], n: 1 }] }, words) || raw.some(function (w) { return w.indexOf(b) === 0 && END.test(w.slice(b.length)); });
    });
  }
  function gotIdeas(text, t) { var words = window.BioApp.words(text); return t.ideas.map(function (i) { return window.BioApp.hasPoint(i, words); }); }
  // Each word of a text that's banned for the term, marked (the box's highlight, and the ideas, where a banned word is
  // crossed out: say it another way).
  function markBanned(text, t, tag) {
    return esc(text).replace(/[A-Za-z’']+/g, function (w) { return banned(w, t).length ? '<' + tag + '>' + w + '</' + tag + '>' : w; });
  }
  function tabooOpen() {
    start('taboo', 'Don\'t Say It');
    K.playing(false);
    var T = window.BioTaboo || {};
    show('<div class="am-games__end dsi-start"><h3 class="am-games__title">Don\'t Say It</h3>' +
      '<p class="am-games__sub">Describe the term without its banned words. Get its key ideas across and he\'ll guess it.</p>' +
      '<div class="dsi-chs">' + CH.filter(function (ch) { return (T[ch] || []).length; }).map(function (ch) {
        var best = K.store('bio-taboo-best-' + ch);
        return '<button type="button" class="tb-pick" data-dsi-ch="' + ch + '" style="--c:' + COL[ch] + '"><span class="tb-pick__ch">' + esc(NAME[ch]) + '</span><span class="tb-pick__what">' + T[ch].length + ' terms' + (best ? ' · best ' + best + '/' + ROUND : '') + '</span></button>';
      }).join('') + '<button type="button" class="tb-pick" data-dsi-ch="all" style="--c:#F1F7FB"><span class="tb-pick__ch">All chapters</span><span class="tb-pick__what">A mix' + (K.store('bio-taboo-best-all') ? ' · best ' + K.store('bio-taboo-best-all') + '/' + ROUND : '') + '</span></button></div></div>');
    K.mascot('ok', 'Describe it. Don\'t say it. I\'ll guess.');
  }
  function tabooGo(which) {
    var T = window.BioTaboo || {}, list = [];
    (which === 'all' ? CH : [+which]).forEach(function (ch) { (T[ch] || []).forEach(function (t) { list.push({ ch: ch, t: t }); }); });
    S.which = which;
    S.terms = BB.missFirst('taboo', shuffle(list), function (x) { return x.t.term; }).slice(0, ROUND);
    S.at = 0;
    S.got = 0;
    S.log = [];
    K.gameHud(S.card, S.terms.length, 'guessed');
    K.playing(true);
    tabooAsk();
  }
  function tabooAsk() {
    var x = S.terms[S.at], t = x.t;
    S.phase = 'ask';
    S.term = x;
    S.tries = 0;
    K.gameSeg(S.card, S.at, 'is-current');
    var bans = banList(t);
    show('<div class="dsi"><div class="tb-panel" data-qg-panel aria-live="polite">' + card(x.ch, 'Term ' + (S.at + 1) + ' of ' + S.terms.length,
      '<p class="dsi-term">' + esc(t.term) + '</p><div class="dsi-ban"><span>Don\'t say</span>' + bans.map(function (b) { return '<i data-dsi-ban="' + esc(b) + '">' + esc(b) + '</i>'; }).join('') + '</div>' +
      '<div class="dsi-box"><div class="dsi-hl" data-dsi-hl aria-hidden="true"></div><textarea class="tb-text dsi-text" data-dsi-text rows="3" placeholder="Describe it in your own words" aria-label="Your description" spellcheck="true"></textarea></div>' +
      '<p class="dsi-warn" data-dsi-warn aria-live="polite"></p>' +
      '<div class="tb-row" data-dsi-btns><button type="button" class="tb-btn tb-btn--go" data-dsi-go>Let him guess</button><button type="button" class="tb-btn tb-btn--ghost" data-dsi-skip>Skip</button></div><div class="qg-after" data-dsi-after></div>') + '</div></div>');
    var box = q('[data-dsi-text]');
    if (box) box.focus({ preventScroll: true });
  }
  // As you type, every banned word you've said turns red, in the box and in the list, and he won't guess until it's out.
  function tabooType() {
    var box = q('[data-dsi-text]'), hl = q('[data-dsi-hl]');
    if (!box || !hl) return;
    var t = S.term.t, text = box.value, used = banned(text, t);
    // The box grows with the text, so the copy behind it lines up.
    box.style.height = 'auto';
    box.style.height = box.scrollHeight + 'px';
    hl.innerHTML = markBanned(text, t, 'mark') + '\n';
    S.card.querySelectorAll('[data-dsi-ban]').forEach(function (i) { i.classList.toggle('is-said', used.indexOf(i.getAttribute('data-dsi-ban')) >= 0); });
    q('[data-dsi-warn]').textContent = used.length ? 'Take out: ' + used.join(', ') : '';
    q('[data-dsi-go]').disabled = Boolean(used.length);
  }
  // His guess when it isn't enough: the term in the round's chapter the description sounds most like, or none.
  function wrongGuess(text, x) {
    var best = null;
    ((window.BioTaboo || {})[x.ch] || []).forEach(function (o) {
      if (o.term === x.t.term) return;
      var m = gotIdeas(text, o).filter(Boolean).length;
      if (m && (!best || m > best.m)) best = { term: o.term, m: m };
    });
    return best ? best.term : '';
  }
  // He thinks ("Hmm…", a second), then says his guess: enough ideas and he names it. Not enough the first time and you
  // get one more go to add to it; the second time, the turn ends with the ideas, ticked if you gave them.
  function tabooGuess(skip) {
    if (S.phase !== 'ask') return;
    var x = S.term, t = x.t, box = q('[data-dsi-text]'), text = skip ? '' : (box.value || '').trim();
    if (!skip && (!text || banned(text, t).length)) { box.focus(); return; }
    var got = gotIdeas(text, t), n = got.filter(Boolean).length, ok = !skip && n >= t.need;
    box.disabled = true;
    q('[data-dsi-btns]').hidden = true;
    if (skip) { tabooDone(false, true, got); return; }
    S.phase = 'thinking';
    var guess = ok ? t.term : wrongGuess(text, x), after = q('[data-dsi-after]');
    after.innerHTML = '<div class="dsi-think"><span class="dsi-think__face" aria-hidden="true">' + K.face + '</span><p class="dsi-think__say" data-dsi-say>Hmm<span class="dsi-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p></div>';
    K.mascot('ok', 'Hmm…');
    into(after);
    [0, 380, 760].forEach(function (ms) { wait(function () { K.sfx('tick', 0.35); }, ms); });
    wait(function () {
      var say = q('[data-dsi-say]');
      say.innerHTML = guess ? 'Is it… <b>' + esc(guess) + '</b>?' : 'No idea.';
      say.classList.add('is-said');
      K.sfx('pop', 0.7);
      wait(function () {
        if (ok) tabooDone(true, false, got);
        else if (!S.tries) tabooMore(n, guess);
        else tabooDone(false, false, got, guess);
      }, guess ? 900 : 600);
    }, 1100);
  }
  function tabooMore(n, guess) {
    var t = S.term.t, box = q('[data-dsi-text]');
    S.tries = 1;
    S.phase = 'ask';
    K.bonk();
    K.mascot('happy', guess ? 'Not it? Then explain it better.' : 'Not enough to go on.');
    q('[data-dsi-after]').insertAdjacentHTML('beforeend', '<p class="dsi-more"><b>Not enough for him. Add a bit more?</b> He heard ' + n + ' of the ' + t.need + ' ideas he needs.</p>');
    q('[data-dsi-go]').textContent = 'Let him guess again';
    q('[data-dsi-skip]').textContent = 'Show me';
    q('[data-dsi-btns]').hidden = false;
    box.disabled = false;
    box.focus({ preventScroll: true });
    box.setSelectionRange(box.value.length, box.value.length);
    into(q('[data-dsi-btns]'));
  }
  // The ideas he listens for: the ones you gave ticked, the ones you missed marked to learn (a banned word in them
  // crossed out).
  function ideasList(t, got, missedOnly) {
    return '<ul class="dsi-ideas">' + t.ideas.map(function (i, k) {
      if (missedOnly && got[k]) return '';
      return '<li class="' + (got[k] ? 'is-ok' : 'is-no') + '">' + (got[k] ? markBanned(i.a, t, 's') : '<mark>' + markBanned(i.a, t, 's') + '</mark>') + '</li>';
    }).join('') + '</ul>';
  }
  function tabooDone(ok, skip, got, guess) {
    var x = S.term, t = x.t;
    S.phase = 'shown';
    BB.missMark('taboo', t.term, ok);
    S.log.push({ x: x, ok: ok, skip: skip, got: got });
    if (ok) { S.got += 1; score(S.got); K.ding(3, true); K.mascot('angry', 'Is it… ' + t.term + '? Hmph. Obviously.'); }
    else if (!skip) { K.bonk(); K.mascot('happy', guess ? 'Wrong guess. Your fault.' : 'Explain it better next time.'); }
    K.gameSeg(S.card, S.at, ok ? 'is-ok' : 'is-no');
    var btns = q('[data-dsi-btns]');
    if (btns) btns.remove();
    q('[data-dsi-text]').disabled = true;
    var n = got.filter(Boolean).length, more = q('.dsi-more');
    if (more) more.remove();
    q('[data-dsi-after]').insertAdjacentHTML('beforeend', stamp(ok, ok ? 'He guessed it' : skip ? 'Skipped' : 'He didn\'t get it', skip ? 'is-pass' : '') +
      (!ok && !skip && n ? '<p class="tb-mine">You gave ' + n + ' of the ' + t.need + ' ideas he needed.</p>' : '') +
      '<p class="dsi-label">The ideas he listens for</p>' + ideasList(t, got) +
      '<p class="tb-why"><span>A description that works</span>' + esc(t.model) + '</p>');
    if (!skip) thud(ok);
    next(S.at + 1 < S.terms.length ? 'Next term' : 'See how you did', 'data-dsi-next');
  }
  // The end: how many he guessed, then the ideas he didn't hear, term by term: the ones to learn.
  function tabooEnd() {
    S.phase = 'over';
    K.playing(false);
    var key = 'bio-taboo-best-' + S.which, best = +(K.store(key) || 0), better = S.got > best;
    if (better) K.store(key, String(S.got));
    var learn = S.log.filter(function (l) { return l.got.some(function (g) { return !g; }); });
    var guessed = S.log.filter(function (l) { return l.ok; }).map(function (l) { return esc(l.x.t.term); });
    show('<div class="am-games__end dsi-end"><h3 class="am-games__title">He guessed ' + S.got + ' of ' + S.terms.length + '</h3>' +
      '<p class="am-games__sub">' + (better && best ? 'Your best yet. ' : best ? 'Best: ' + best + ' of ' + ROUND + '. ' : '') + (learn.length ? 'The ideas he didn\'t hear are the ones to learn.' : 'He heard every idea. Nothing to learn here.') + '</p>' +
      (learn.length ? '<ul class="dsi-recap">' + learn.map(function (l) {
        return '<li class="' + (l.ok ? 'is-ok' : 'is-no') + '" style="--c:' + COL[l.x.ch] + '"><p class="dsi-recap__term"><b>' + esc(l.x.t.term) + '</b><span>' + (l.ok ? 'Guessed' : l.skip ? 'Skipped' : 'Not guessed') + '</span></p>' + ideasList(l.x.t, l.got, true) + '</li>';
      }).join('') + '</ul>' : '') +
      (guessed.length ? '<p class="dsi-guessed"><b>Guessed:</b> ' + guessed.join(', ') + '</p>' : '') + '</div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-dsi-again', 'Play again']]);
    K.mascot(S.got >= 6 ? 'angry' : 'happy', S.got >= 6 ? 'Hmph. You can explain things.' : 'Explain it better next time.');
    if (S.got >= 6) K.later(K.fanfare, 300);
  }

  // ======================================================================== clicks and keys
  document.addEventListener('click', function (e) {
    if (!live() || !S.card.contains(e.target)) return;
    var t;
    if (S.kind === 'chase') {
      if ((t = e.target.closest('[data-oe-head]'))) { chaseGo(+t.getAttribute('data-oe-head')); return; }
      if ((t = e.target.closest('[data-qg-opt]'))) { chaseChoose(t); return; }
      if (e.target.closest('[data-qg-check]')) { chaseCheck(false); return; }
      if (e.target.closest('[data-qg-pass]')) { chaseCheck(true); return; }
      if (e.target.closest('[data-oe-next]') && S.phase === 'shown') { chaseAsk(); return; }
      if (e.target.closest('[data-oe-end]') && S.phase === 'shown') { chaseEnd(); return; }
      if (e.target.closest('[data-oe-again]')) { chaseOpen(); return; }
    } else if (S.kind === 'grid') {
      if ((t = e.target.closest('[data-pts-cell]')) && S.phase === 'grid') { gridAsk(t.getAttribute('data-pts-cell'), t); return; }
      if ((t = e.target.closest('[data-qg-opt]'))) { gridChoose(t); return; }
      if (e.target.closest('[data-qg-check]')) { gridCheck(); return; }
      if (e.target.closest('[data-qg-pass]') && S.phase === 'ask') { gridAnswered('pass', ''); return; }
      if (e.target.closest('[data-pts-back]') && S.phase === 'shown') { gridShow(); return; }
      if (e.target.closest('[data-pts-finish]') && S.phase === 'grid') { gridEnd(); return; }
      if (e.target.closest('[data-pts-again]')) { gridOpen(); return; }
    } else if (S.kind === 'taboo') {
      if ((t = e.target.closest('[data-dsi-ch]'))) { tabooGo(t.getAttribute('data-dsi-ch')); return; }
      if (e.target.closest('[data-dsi-go]')) { tabooGuess(false); return; }
      if (e.target.closest('[data-dsi-skip]')) { tabooGuess(true); return; }
      if (e.target.closest('[data-dsi-next]') && S.phase === 'shown') { S.at += 1; if (S.at < S.terms.length) tabooAsk(); else tabooEnd(); return; }
      if (e.target.closest('[data-dsi-again]')) { tabooOpen(); return; }
    }
  });
  document.addEventListener('input', function (e) { if (live() && e.target.closest && e.target.closest('[data-dsi-text]')) tabooType(); });
  // Enter checks a typed answer or lets him guess (Shift+Enter for a new line).
  document.addEventListener('keydown', function (e) {
    if (!live() || e.key !== 'Enter' || e.shiftKey || !e.target.closest) return;
    if (e.target.closest('[data-qg-text]')) { e.preventDefault(); if (S.kind === 'grid') gridCheck(); else if (S.kind === 'chase') chaseCheck(false); }
    else if (e.target.closest('[data-dsi-text]')) { e.preventDefault(); tabooGuess(false); }
  });
  window.addEventListener('resize', function () { if (live()) BB.nearMascot(S.card); });
  var OPEN = { chase: chaseOpen, grid: gridOpen, taboo: function () { if (window.BioTaboo) tabooOpen(); } };
  window.BioQuizGames = { open: function (kind) { if (OPEN[kind]) OPEN[kind](); }, state: function () { return S; }, banned: banned, banList: banList };
})();

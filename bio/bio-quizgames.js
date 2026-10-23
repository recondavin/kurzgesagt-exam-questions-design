// Three more question games on the Biology hub, one move at a time like the trivia board (the user, pasting quiz shows
// with questions: "add these"). Each under its own name:
//   Outrun the Examiner  A track down to home. You start a few steps ahead of the examiner and you both answer each
//                        question (pick the answer). Your right answer moves you a step towards home; his (he gets about
//                        7 in 10) moves him a step after you. Home first and you win; caught and he does.
//   Points Grid          Five chapters by 100 to 500 points. 100 to 300 are pick-the-answer, 400 and 500 typed and marked
//                        against the scheme (500 asks for two points where it can). Right adds the points, wrong takes
//                        them off, passing costs nothing. At the end, each chapter's points and what to work on.
//   Don't Say It         Describe a term without saying it or its banned words (they turn red as you type); the examiner
//                        guesses it if the description has enough of its key ideas, marked like the answer sheet.
//                        Afterwards, the ideas you gave and the ones you missed. The terms: tools/bio/taboo/ch<N>.json,
//                        built into bio/taboo.js; tools/bio/tests/taboo.mjs checks them.
// The questions are the trivia board's (BioBoard.pools: the quick checks that make sense on their own, under the chapter
// they're about).
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
  function into(node) { if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  // A question card like the board's: the chapter's band, then the question.
  function card(ch, label, inner) {
    return '<div class="tb-card" style="--c:' + COL[ch] + '"><div class="tb-card__in"><div class="tb-card__face">' +
      '<div class="tb-card__band"><b>' + esc(NAME[ch]) + '</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div>' +
      '<div class="tb-card__body">' + inner + '</div></div></div></div>';
  }
  // A pick-the-answer question doesn't need the typed answer's "(2 points)".
  function asked(item, typed) { return esc(typed ? item.text : item.text.replace(/\s*\((\d+ of )?\d+ points?\)$/, '')); }
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
  function answer(item, mine) {
    return (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>Answer</span>' + esc(item.c.right) + '</p><p class="tb-why"><span>Why</span>' + esc(item.c.why) + '</p>';
  }
  function stamp(ok, text) { return '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + esc(text) + '</p>'; }
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
  // Eight steps, then home. He starts on the top step, you a head start below him (2, 3 or 4 steps: the fewer, the
  // harder; the best you've escaped from is kept).
  var STEPS = 8, HIS_ODDS = 0.7;
  var CHASE_SAY = {
    start: ['Run, if you like. I\'m faster.', 'I\'ll catch you. I always do.'],
    youRight: ['Hmph. Lucky.', 'Fine. One step.'],
    youWrong: ['Wrong. I\'m coming.', 'Careful now.'],
    hisWrong: ['A slip. It won\'t happen twice.', 'That question was badly worded.'],
    caught: 'Caught you. Again?',
    home: 'Hmph. You got away. This time.'
  };
  function chaseOpen() {
    start('chase', 'Outrun the Examiner');
    var best = +(K.store('bio-chase-best') || 0);
    show('<div class="am-games__end oe-start"><div class="oe-face" aria-hidden="true">' + K.face + '</div>' +
      '<h3 class="am-games__title">Outrun the Examiner</h3>' +
      '<p class="am-games__sub">Get home before he catches you. A right answer moves you a step towards home. He answers every question too, and each one he gets right moves him a step closer.</p>' +
      '<p class="oe-ask">How big a head start?</p><div class="oe-heads">' + [[2, 'Hard'], [3, 'Normal'], [4, 'Easy']].map(function (h) {
        return '<button type="button" class="oe-head" data-oe-head="' + h[0] + '"><b class="num">' + h[0] + '</b><span>steps ahead</span><i>' + h[1] + '</i></button>';
      }).join('') + '</div>' + (best ? '<p class="oe-best">Best: escaped from ' + best + ' steps ahead</p>' : '') + '</div>');
    var b = q('[data-oe-head="3"]');
    if (b) b.focus({ preventScroll: true });
    K.mascot('happy', pick(CHASE_SAY.start));
  }
  function chaseGo(head) {
    var all = [];
    var P = BB.pools();
    CH.forEach(function (ch) { all = all.concat(P[ch].mc.filter(function (i) { return i.c.wrong.length >= 2; })); });
    S.head = head;
    S.you = head;
    S.him = 0;
    S.qs = shuffle(all);
    S.at = 0;
    S.right = 0;
    S.asked = 0;
    show('<div class="oe"><div class="oe-track" data-oe-track style="--rows:' + (STEPS + 1) + '" aria-label="The track">' + track() + '</div><div class="tb-panel" data-qg-panel aria-live="polite"></div></div>');
    chaseAsk();
  }
  // The track, top to bottom: the steps, then home. The two pieces sit on their steps and slide when they move.
  function track() {
    var rows = '';
    for (var i = 0; i < STEPS; i++) rows += '<li class="oe-step' + (i < S.him ? ' is-passed' : '') + (i > S.him && i < S.you ? ' is-gap' : '') + '" data-oe-step="' + i + '"></li>';
    rows += '<li class="oe-step oe-step--home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11L12 3l9 8M5.5 9v11h13V9"/><path d="M10 20v-6h4v6"/></svg><span>Home</span></li>';
    return '<ol class="oe-steps">' + rows + '</ol>' +
      '<div class="oe-tok oe-tok--him" style="--at:' + S.him + '"><span class="oe-tok__face" aria-hidden="true">' + K.face + '</span><b>Examiner</b></div>' +
      '<div class="oe-tok oe-tok--you" style="--at:' + Math.min(S.you, STEPS) + '"><b>You</b><span class="oe-tok__gap num">' + gapText() + '</span></div>';
  }
  function gapText() { return S.you >= STEPS ? '' : (S.you - S.him) + ' ahead'; }
  function moveTokens() {
    var t = q('[data-oe-track]');
    t.querySelector('.oe-tok--him').style.setProperty('--at', S.him);
    t.querySelector('.oe-tok--you').style.setProperty('--at', Math.min(S.you, STEPS));
    t.querySelector('.oe-tok__gap').textContent = gapText();
    t.querySelectorAll('[data-oe-step]').forEach(function (li) {
      var i = +li.getAttribute('data-oe-step');
      li.classList.toggle('is-passed', i < S.him);
      li.classList.toggle('is-gap', i > S.him && i < S.you);
    });
  }
  function status() {
    var left = STEPS - S.you;
    return '<p class="tb-say tb-turn"><b>' + left + (left === 1 ? ' step' : ' steps') + '</b> to home. He\'s <b>' + (S.you - S.him) + '</b> behind.</p>';
  }
  function chaseAsk() {
    var item = S.qs[S.at++ % S.qs.length];
    S.item = item;
    S.phase = 'ask';
    q('[data-qg-panel]').innerHTML = status() + card(item.ch, 'Question ' + (S.asked + 1), '<p class="tb-q">' + asked(item) + '</p>' + options(item) + '<div class="qg-after" data-oe-after></div>');
    into(q('.tb-card'));
    BB.reveal(q('.tb-card'));
  }
  function chaseChoose(btn) {
    if (S.phase !== 'ask') return;
    S.phase = 'shown';
    var item = S.item, mine = btn.getAttribute('data-qg-opt'), ok = mine === item.c.right;
    var hisOk = Math.random() < HIS_ODDS, his = hisOk ? item.c.right : pick(item.c.wrong);
    S.asked += 1;
    if (ok) S.right += 1;
    markOptions(item, mine);
    if (ok) K.ding(2, true); else K.bonk();
    var after = q('[data-oe-after]');
    after.innerHTML = '<p class="tb-say tb-think">He answers…</p>';
    // His pick comes a moment after yours, tagged on its option.
    wait(function () {
      S.card.querySelectorAll('[data-qg-opt]').forEach(function (b) {
        if (b.getAttribute('data-qg-opt') === his) b.insertAdjacentHTML('beforeend', '<span class="oe-his">Examiner</span>');
      });
      after.innerHTML = '<div class="oe-result">' + stamp(ok, ok ? 'You: right' : 'You: wrong') + stamp(hisOk, hisOk ? 'Him: right' : 'Him: wrong') + '</div>' + answer(item, '');
      into(after);
      // You move first: home is safe even if he moves after.
      if (ok) S.you += 1;
      moveTokens();
      wait(function () {
        if (hisOk && S.you < STEPS) S.him += 1;
        moveTokens();
        if (S.you >= STEPS) { wait(function () { chaseEnd(true); }, 900); return; }
        if (S.him >= S.you) { wait(function () { chaseEnd(false); }, 900); return; }
        K.mascot(ok ? 'angry' : 'happy', pick(ok ? CHASE_SAY.youRight : hisOk ? CHASE_SAY.youWrong : CHASE_SAY.hisWrong));
        next('Next question', 'data-oe-next');
      }, ok ? 500 : 150);
    }, 800);
  }
  function chaseEnd(home) {
    S.phase = 'over';
    var best = +(K.store('bio-chase-best') || 0), better = home && (!best || S.head < best);
    if (better) K.store('bio-chase-best', String(S.head));
    show('<div class="am-games__end"><div class="oe-face" aria-hidden="true">' + K.face + '</div>' +
      '<h3 class="am-games__title">' + (home ? 'You got home!' : 'Caught!') + '</h3>' +
      '<p class="am-games__sub">' + (home ? 'You escaped from ' + S.head + ' steps ahead' + (better ? ', your best yet' : '') + '. ' : 'He caught you ' + (STEPS - S.you) + (STEPS - S.you === 1 ? ' step' : ' steps') + ' from home. ') +
      'You got ' + S.right + ' of ' + S.asked + ' right.' + (home && S.head > 2 ? ' Try a smaller head start.' : '') + '</p></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-oe-again', 'Play again']]);
    K.mascot(home ? 'angry' : 'happy', home ? CHASE_SAY.home : CHASE_SAY.caught);
    if (home) K.later(K.fanfare, 300);
  }

  // ======================================================================== Points Grid
  var VALUES = [100, 200, 300, 400, 500];
  // On a phone the five columns are too narrow for the chapters' names.
  var SHORT = { 28: 'Lungs', 29: 'Urine', 30: 'Gut', 31: 'Blood', 32: 'Immune' };
  function gridOpen() {
    start('grid', 'Points Grid', 25, 'points');
    var P = BB.pools();
    S.score = 0;
    S.cells = {};
    // Each chapter's column: a true-or-false for 100 where there is one, pick-the-answer for 200 and 300, typed for
    // 400 and 500 (a two-point answer for 500 where there is one). No question twice.
    S.cols = CH.map(function (ch) {
      var used = {}, key = function (i) { return i.src + i.qid + ':' + i.k; };
      var take = function (list, ok) {
        var got = list.filter(function (i) { return !used[key(i)] && (!ok || ok(i)); })[0] || list.filter(function (i) { return !used[key(i)]; })[0];
        if (got) used[key(got)] = 1;
        return got || null;
      };
      var five = take(P[ch].typed, function (i) { return i.want >= 2; }), four = take(P[ch].typed, function (i) { return i.want === 1; });
      var tf = function (i) { return /^(True|False)$/.test(i.c.right); }, mc = function (i) { return !tf(i); };
      return { ch: ch, items: [take(P[ch].mc, tf), take(P[ch].mc, mc), take(P[ch].mc, mc), four, five] };
    });
    gridShow();
    K.mascot('ok', 'Pick a chapter and a value. Wrong answers cost you.');
  }
  function gridShow() {
    S.phase = 'grid';
    var left = 0;
    var html = '<div class="pts"><div class="pts-grid" role="grid" aria-label="Points Grid">' + S.cols.map(function (col) {
      return '<div class="pts-col" role="row"><p class="pts-head" style="--c:' + COL[col.ch] + '"><span class="pts-head__long">' + esc(NAME[col.ch]) + '</span><span class="pts-head__short" aria-hidden="true">' + SHORT[col.ch] + '</span></p>' + VALUES.map(function (v, r) {
        var id = col.ch + ':' + r, done = S.cells[id], item = col.items[r];
        if (!done && item) left += 1;
        if (!item) return '<span class="pts-cell is-none" role="gridcell"></span>';
        if (done) return '<span class="pts-cell is-' + done.how + '" role="gridcell" aria-label="' + v + ': ' + done.how + '"><b class="num">' + (done.how === 'ok' ? '+' + v : done.how === 'no' ? '−' + v : 'Pass') + '</b></span>';
        return '<button type="button" class="pts-cell" role="gridcell" data-pts-cell="' + id + '" aria-label="' + esc(NAME[col.ch]) + ' for ' + v + '"><b class="num">' + v + '</b></button>';
      }).join('') + '</div>';
    }).join('') + '</div><div class="tb-panel" data-qg-panel aria-live="polite"></div></div>';
    if (!left) { gridEnd(); return; }
    show(html, [['more', 'data-am-keep', 'Close'], ['more', 'data-pts-finish', 'Finish']]);
    q('[data-qg-panel]').innerHTML = '<p class="tb-say pts-total">Score <b class="num">' + S.score + '</b> · ' + left + ' left</p>';
  }
  function gridAsk(id) {
    var at = id.split(':'), col = S.cols.filter(function (c) { return c.ch === +at[0]; })[0], r = +at[1], item = col.items[r], v = VALUES[r];
    S.phase = 'ask';
    S.id = id;
    S.item = item;
    S.value = v;
    S.typed = r >= 3;
    show('<div class="pts-q"><div class="tb-panel" data-qg-panel aria-live="polite">' +
      card(item.ch, v + ' points', '<p class="tb-q">' + asked(item, S.typed) + '</p>' + (S.typed ? typedBox() : options(item) + '<div class="tb-row"><button type="button" class="tb-btn tb-btn--ghost" data-qg-pass>Pass</button></div>') + '<div class="qg-after" data-pts-after></div>') +
      '</div></div>', [['more', 'data-am-keep', 'Close']]);
    BB.reveal(q('.tb-card'), function () {
      var t = q('[data-qg-text]');
      if (t) t.focus({ preventScroll: true });
    });
  }
  // Right adds the points, wrong takes them off, passing costs nothing; you see the answer either way.
  function gridAnswered(how, mine) {
    S.phase = 'shown';
    var item = S.item, v = S.value, at = S.id.split(':');
    S.cells[S.id] = { how: how, v: v };
    S.score += how === 'ok' ? v : how === 'no' ? -v : 0;
    score(S.score);
    K.gameSeg(S.card, CH.indexOf(+at[0]) * 5 + +at[1], how === 'ok' ? 'is-ok' : how === 'no' ? 'is-no' : '');
    // The answer buttons go; the options stay, marked.
    S.card.querySelectorAll('[data-qg-pass], [data-qg-check]').forEach(function (b) { var row = b.closest('.tb-row'); if (row) row.remove(); });
    if (!S.typed) markOptions(item, null);
    var t = q('[data-qg-text]');
    if (t) t.disabled = true;
    if (how === 'ok') { K.ding(S.typed ? 4 : 2, true); K.mascot('angry', 'Hmph. ' + v + ' points.'); }
    else if (how === 'no') { K.bonk(); K.mascot('happy', 'Wrong. That\'s ' + v + ' off.'); }
    else K.mascot('ok', 'Wise, maybe.');
    q('[data-pts-after]').innerHTML = stamp(how === 'ok', how === 'ok' ? '+' + v : how === 'no' ? '−' + v : 'Passed: 0') + answer(item, mine);
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
    var m = marked(S.item, text);
    gridAnswered(m.ok ? 'ok' : 'no', said(text, m.got, S.item.want));
  }
  // The end: your score and each chapter's, with the ones to work on (lost points, passed or left) picked out.
  function gridEnd() {
    S.phase = 'over';
    var best = K.store('bio-grid-best'), better = best == null || S.score > +best;
    if (better) K.store('bio-grid-best', String(S.score));
    var rows = S.cols.map(function (col) {
      var pts = 0, ok = 0, no = 0, skip = 0;
      VALUES.forEach(function (v, r) {
        if (!col.items[r]) return;
        var d = S.cells[col.ch + ':' + r];
        if (!d || d.how === 'pass') skip += 1;
        else if (d.how === 'ok') { ok += 1; pts += v; } else { no += 1; pts -= v; }
      });
      var note = no ? 'Work on this: ' + no + ' wrong' : skip ? (skip === 5 ? 'Not tried' : skip + ' passed or left') : 'All right';
      return '<li class="pts-row' + (no || skip ? ' is-weak' : '') + '" style="--c:' + COL[col.ch] + '"><span class="pts-row__n">' + esc(NAME[col.ch]) + '</span>' +
        '<b class="num">' + (pts > 0 ? '+' : pts < 0 ? '−' : '') + Math.abs(pts) + '</b><span class="pts-row__note">' + note + '</span></li>';
    }).join('');
    show('<div class="am-games__end pts-end"><h3 class="am-games__title">' + (S.score > 0 ? S.score + ' points' : S.score < 0 ? '−' + -S.score + ' points' : '0 points') + '</h3>' +
      '<p class="am-games__sub">' + (better && best != null ? 'Your best yet.' : best != null ? 'Best: ' + best + ' points.' : 'Your first game.') + '</p><ul class="pts-rows">' + rows + '</ul></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-pts-again', 'Play again']]);
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
  function tabooOpen() {
    start('taboo', 'Don\'t Say It');
    var T = window.BioTaboo || {};
    show('<div class="am-games__end dsi-start"><h3 class="am-games__title">Don\'t Say It</h3>' +
      '<p class="am-games__sub">Describe the term without saying it or any of its banned words. If you get its key ideas across, the examiner guesses it.</p>' +
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
    S.terms = shuffle(list).slice(0, ROUND);
    S.at = 0;
    S.got = 0;
    K.gameHud(S.card, S.terms.length, 'guessed');
    tabooAsk();
  }
  function tabooAsk() {
    var x = S.terms[S.at], t = x.t;
    S.phase = 'ask';
    S.term = x;
    K.gameSeg(S.card, S.at, 'is-current');
    var bans = banList(t);
    show('<div class="dsi"><div class="tb-panel" data-qg-panel aria-live="polite">' + card(x.ch, 'Term ' + (S.at + 1) + ' of ' + S.terms.length,
      '<p class="dsi-term">' + esc(t.term) + '</p><div class="dsi-ban"><span>Don\'t say</span>' + bans.map(function (b) { return '<i data-dsi-ban="' + esc(b) + '">' + esc(b) + '</i>'; }).join('') + '</div>' +
      '<div class="dsi-box"><div class="dsi-hl" data-dsi-hl aria-hidden="true"></div><textarea class="tb-text dsi-text" data-dsi-text rows="3" placeholder="Describe it in your own words" aria-label="Your description" spellcheck="true"></textarea></div>' +
      '<p class="dsi-warn" data-dsi-warn aria-live="polite"></p>' +
      '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-dsi-go>Let him guess</button><button type="button" class="tb-btn tb-btn--ghost" data-dsi-skip>Skip</button></div><div class="qg-after" data-dsi-after></div>') + '</div></div>');
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
    hl.innerHTML = esc(text).replace(/[A-Za-z’']+/g, function (w) { return banned(w, t).length ? '<mark>' + w + '</mark>' : w; }) + '\n';
    S.card.querySelectorAll('[data-dsi-ban]').forEach(function (i) { i.classList.toggle('is-said', used.indexOf(i.getAttribute('data-dsi-ban')) >= 0); });
    q('[data-dsi-warn]').textContent = used.length ? 'Take out: ' + used.join(', ') : '';
    q('[data-dsi-go]').disabled = Boolean(used.length);
  }
  // He guesses: enough ideas and he names it; otherwise he guesses the term in the round the description sounds most
  // like, or gives up. Then the ideas, ticked if you gave them, and a description that works.
  function tabooGuess(skip) {
    if (S.phase !== 'ask') return;
    var x = S.term, t = x.t, box = q('[data-dsi-text]'), text = skip ? '' : (box.value || '').trim();
    if (!skip && (!text || banned(text, t).length)) { box.focus(); return; }
    S.phase = 'shown';
    box.disabled = true;
    var row = q('[data-dsi-go]').closest('.tb-row');
    if (row) row.remove();
    var got = gotIdeas(text, t), n = got.filter(Boolean).length, ok = !skip && n >= t.need;
    var guess = '';
    if (!ok && !skip) {
      var best = null;
      ((window.BioTaboo || {})[x.ch] || []).forEach(function (o) {
        if (o.term === t.term) return;
        var m = gotIdeas(text, o).filter(Boolean).length;
        if (m && (!best || m > best.m)) best = { term: o.term, m: m };
      });
      guess = best ? 'Is it… ' + best.term + '?' : 'No idea.';
    }
    if (ok) { S.got += 1; score(S.got); K.ding(3, true); K.mascot('angry', 'Is it… ' + t.term + '? Hmph. Obviously.'); }
    else if (!skip) { K.bonk(); K.mascot('happy', guess); }
    K.gameSeg(S.card, S.at, ok ? 'is-ok' : 'is-no');
    q('[data-dsi-after]').innerHTML = stamp(ok, ok ? 'He guessed it' : skip ? 'Skipped' : 'He didn\'t get it') +
      (!ok && !skip ? '<p class="tb-mine">He said: ' + esc(guess) + (n ? ' You gave ' + n + ' of the ' + t.need + ' ideas he needed.' : '') + '</p>' : '') +
      '<ul class="dsi-ideas">' + t.ideas.map(function (i, k) { return '<li class="' + (got[k] ? 'is-ok' : 'is-no') + '">' + esc(i.a) + '</li>'; }).join('') + '</ul>' +
      '<p class="tb-why"><span>A description that works</span>' + esc(t.model) + '</p>';
    next(S.at + 1 < S.terms.length ? 'Next term' : 'See how you did', 'data-dsi-next');
  }
  function tabooEnd() {
    S.phase = 'over';
    var key = 'bio-taboo-best-' + S.which, best = +(K.store(key) || 0), better = S.got > best;
    if (better) K.store(key, String(S.got));
    show('<div class="am-games__end"><h3 class="am-games__title">He guessed ' + S.got + ' of ' + S.terms.length + '</h3>' +
      '<p class="am-games__sub">' + (better && best ? 'Your best yet.' : best ? 'Best: ' + best + ' of ' + ROUND + '.' : '') + ' The ideas he didn\'t hear are the ones to learn.</p></div>',
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
      if (e.target.closest('[data-oe-next]') && S.phase === 'shown') { chaseAsk(); return; }
      if (e.target.closest('[data-oe-again]')) { chaseOpen(); return; }
    } else if (S.kind === 'grid') {
      if ((t = e.target.closest('[data-pts-cell]')) && S.phase === 'grid') { gridAsk(t.getAttribute('data-pts-cell')); return; }
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
    if (e.target.closest('[data-qg-text]')) { e.preventDefault(); if (S.kind === 'grid') gridCheck(); }
    else if (e.target.closest('[data-dsi-text]')) { e.preventDefault(); tabooGuess(false); }
  });
  window.addEventListener('resize', function () { if (live()) BB.nearMascot(S.card); });
  var OPEN = { chase: chaseOpen, grid: gridOpen, taboo: function () { if (window.BioTaboo) tabooOpen(); } };
  window.BioQuizGames = { open: function (kind) { if (OPEN[kind]) OPEN[kind](); }, state: function () { return S; }, banned: banned, banList: banList };
})();

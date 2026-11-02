// Three more turn-at-a-time games against the examiner, in 2D (the user: "build them and angry birds", after picking
// battleships, an artillery duel and an Angry Birds-like game; pool and mini golf wait until they can be 3D). Each under
// its own name:
//   Sea Battle           Two fleets on 7x7 seas, a ship for each chapter. Answer your question right and you fire a
//                        salvo of two shells at his sea, and answer again for two more; wrong, it's his turn. He answers
//                        his own question out loud and fires when he gets it right, hunting round his hits.
//   Cannon Duel          Two cannons on the hills, the wind blowing. Answer right and you aim with the first third of
//                        your shot's path drawn as dots (no mark where it lands) and the wind read out, and answer again
//                        for a second shot; wrong, no shot and it's his turn. Every third question is typed: right, a big
//                        shell. Shells dig craters; knock his health to nothing first.
// Turns in both (the user: "if you get them wrong then u dont rlly get to continue and u can get 2 right then its
// capped"): each right answer is a shot (a salvo in Sea Battle), two right answers a turn at most; a wrong answer ends
// the turn. He plays by the same rule, and his turn plays by itself.
//   Topple the Examiner  He sits on a tower of exam papers and desks. A right answer loads the slingshot (a typed one, a
//                        heavy textbook), and dots show the first moment of its flight as you pull back; knock him off
//                        within eight questions. A level for each chapter, its questions from that chapter, each tower a
//                        little harder than the one before. matter.js (bio/vendor/matter.min.js) does the physics.
// The questions are the trivia board's (BioBoard.pools), on its cards: beside the sea, or over the part of the hills
// or the tower that doesn't matter; on a phone a sheet along the bottom, the field shrinking into the space above it.
// Everything that moves runs on the frame clock by elapsed time (the same speed at 60Hz and 120Hz) and holds while the
// "Leave the game?" box is open.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.pools) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours, INK = '#13294A';
  var A = null;
  function live() { return A && A.card.isConnected; }
  // Timers belong to the game that set them (Play again starts a new one), and wait while the leave box is open so his
  // turn doesn't play on behind it.
  function wait(fn, ms) {
    var a = A, gen = A.gen;
    return K.later(function () {
      if (!live() || A !== a || A.gen !== gen) return;
      if (A.paused) { wait(fn, 250); return; }
      fn();
    }, ms);
  }
  function q(sel) { return A.card.querySelector(sel); }
  // A phone or a narrow window: the stacked layout, the question as a sheet and (on the hills and the tower) a camera.
  function narrow() { return window.matchMedia('(max-width: 760px)').matches; }
  function sfx(name, power) { if (K.sfx) K.sfx(name, power); }
  function start(kind, label) {
    A = { kind: kind, card: BK.host(28, label), pools: BB.pools(), right: 0, asked: 0, gen: 0 };
    K.gameHud(A.card, 0, '');
    watchLeave();
    return A;
  }
  // The card is as wide as the trivia board's, with the examiner beside it.
  function show(html, close) {
    BK.body(A.card, html, true);
    A.card.querySelector('.am-finish__card').classList.add('tb-wide');
    BK.buttons(A.card, close || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(A.card);
  }
  function into(node) { if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  // The turn's line and its button sit in a box of fixed height, so nothing around them moves as the text changes.
  function turnBox() { return '<div class="ar-turn"><p class="tb-say tb-turn ar-say" data-ar-say aria-live="polite"></p><div class="tb-row ar-row" data-ar-row></div></div>'; }
  function say(html) { q('[data-ar-say]').innerHTML = html; }
  function row(html) { q('[data-ar-row]').innerHTML = html || ''; }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function end(won, title, sub, again, stats) {
    A.phase = 'over';
    A.step = null;
    K.playing(false);
    show('<div class="am-games__end"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">' + title + '</h3>' +
      '<p class="am-games__sub">' + sub + (A.asked ? ' You got ' + A.right + ' of ' + plural(A.asked, 'question') + ' right.' : '') + '</p>' +
      (stats ? '<ul class="ar-stats">' + stats.map(function (s) { return '<li><b>' + s[0] + '</b>' + esc(s[1]) + '</li>'; }).join('') + '</ul>' : '') + '</div>',
      [['more', 'data-am-keep', 'Close'], ['ok', again, 'Play again']]);
    if (won) K.later(K.fanfare, 300);
  }
  // A big word slammed over the field ("Sunk", "Toppled!"), gone after a moment.
  function banner(box, small, big, colour, ms) {
    var b = document.createElement('div');
    b.className = 'ar-banner';
    b.setAttribute('aria-hidden', 'true');
    if (colour) b.style.setProperty('--c', colour);
    b.innerHTML = (small ? '<span>' + esc(small) + '</span>' : '') + '<b>' + esc(big) + '</b>';
    box.appendChild(b);
    K.later(function () { b.classList.add('is-out'); K.later(function () { b.remove(); }, 400); }, ms || 1500);
    return b;
  }

  // ======================================================================== the frame clock and the leave box
  // A.step(dt) moves the game on by dt seconds and draws it; the clock runs while it returns true and is started again
  // by kick() when something new moves.
  function kick() {
    if (!live() || A.ticking || A.paused || !A.step) return;
    var a = A, last = null;
    a.ticking = true;
    requestAnimationFrame(function frame(now) {
      if (a !== A || !live() || A.paused || !A.step) { a.ticking = false; return; }
      // A slow phone (down to 10 frames a second) still plays in real time; slower than that, in slow motion.
      var dt = last === null ? 1 / 60 : Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      if (A.step(dt)) requestAnimationFrame(frame); else a.ticking = false;
    });
  }
  // While the "Leave the game?" box is open everything holds: the clock, the shells' flights and the CSS effects.
  function watchLeave() {
    var root = K.root && K.root();
    if (!root || root.arLeave) return;
    root.arLeave = true;
    root.addEventListener('am:leave', function (e) {
      if (!live()) return;
      A.paused = Boolean(e.detail && e.detail.open);
      if (A.paused) {
        A.held = A.card.getAnimations ? A.card.getAnimations({ subtree: true }).filter(function (an) { return an.playState === 'running'; }) : [];
        A.held.forEach(function (an) { an.pause(); });
      } else {
        (A.held || []).forEach(function (an) { if (an.playState === 'paused') an.play(); });
        A.held = null;
        kick();
      }
    });
  }

  // ======================================================================== the questions
  // The next question of a chapter (any chapter if none), pick-the-answer or typed, round the shuffled pool.
  function nextItem(ch, typed) {
    var p = A.pools[ch || pick(CH)], list = typed ? p.typed : p.mc, key = typed ? 'tat' : 'at';
    if (!list.length) return typed ? nextItem(ch, false) : null;
    var item = list[p[key] % list.length];
    p[key] += 1;
    return item;
  }
  function card(ch, label, inner) {
    return '<div class="tb-card" style="--c:' + COL[ch] + '"><div class="tb-card__in"><div class="tb-card__face">' +
      '<div class="tb-card__band"><b>' + esc(NAME[ch]) + '</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div>' +
      '<div class="tb-card__body">' + inner + '</div></div></div></div>';
  }
  function answerHtml(item, mine) {
    return (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>Right answer</span>' + esc(item.c.right) + '</p>' + window.BioBoard.why(item.c);
  }
  function stamp(ok, text) { return '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + esc(text) + '</p>'; }
  function layer(html) {
    var l = q('[data-ar-ask]');
    l.innerHTML = html;
    l.hidden = false;
    l.scrollTop = 0;
    q('[data-ar-stage]').classList.add('is-asking');
    if (A.onAsk) A.onAsk(true);
    return l;
  }
  function hideAsk() {
    var l = q('[data-ar-ask]');
    if (!l || l.hidden) return;
    l.hidden = true;
    l.innerHTML = '';
    q('[data-ar-stage]').classList.remove('is-asking');
    if (A.onAsk) A.onAsk(false);
  }
  // Your question pops up (pick the answer, or type it, marked like the answer sheet, needing the points the check asks
  // for). done(ok) once the answer and why are showing; the game then adds its button to go on.
  function ask(label, typed, ch, done) {
    // Your question comes from the memory you share with Exam drill: one due to type first (it's typed even when the
    // game wanted boxes), then one you got wrong, then a new one.
    var m = BB.memNext(A, A.pools, ch, typed), item = m.item;
    if (m.typed && !typed) label = 'Type it';
    A.item = item;
    A.typed = Boolean(m.typed && item.want);
    A.done = done;
    A.phase = 'ask';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(A.typed ? item.text : item.text.replace(/\s*\((\d+ of )?\d+ points?\)$/, '')) + '</p>' + (A.typed
      ? '<textarea class="tb-text" data-ar-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-ar-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-ar-pass>I don\'t know</button></div>'
      : '<div class="tb-opts">' + shuffle([item.c.right].concat(item.c.wrong)).map(function (o) {
        return '<button type="button" class="tb-opt" data-ar-opt="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div>') + '<div class="qg-after" data-ar-after></div>'));
    BB.reveal(q('[data-ar-ask] .tb-card'), function () {
      var t = q('[data-ar-text]');
      if (t) t.focus({ preventScroll: true });
    });
  }
  function choose(btn) {
    var item = A.item, mine = btn.getAttribute('data-ar-opt'), ok = mine === item.c.right;
    A.card.querySelectorAll('[data-ar-opt]').forEach(function (b) {
      var o = b.getAttribute('data-ar-opt');
      b.disabled = true;
      if (o === item.c.right) b.classList.add('is-ok');
      else if (o === mine) b.classList.add('is-no');
      // Only your pick and the right one stay, so the answer and why fit beside the field.
      else b.classList.add('ar-gone');
    });
    answered(ok, ok ? '' : 'You said: ' + mine);
  }
  function check(pass) {
    var box = q('[data-ar-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    var got = text && window.BioApp ? window.BioApp.check(A.item.src, A.item.qid, A.item.k, text).filter(Boolean).length : 0, ok = got >= A.item.want;
    box.disabled = true;
    answered(ok, text ? 'You wrote: ' + (text.length > 120 ? text.slice(0, 117) + '...' : text) + (got && !ok ? ' (' + got + ' of ' + A.item.want + ' points)' : '') : '');
  }
  function answered(ok, mine) {
    A.phase = 'answered';
    A.asked += 1;
    if (ok) A.right += 1;
    var btns = q('[data-ar-check]');
    if (btns) btns.closest('.tb-row').remove();
    q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'Correct' : 'Not quite') + answerHtml(A.item, mine) + BB.memLine(BB.memRecord(A.pools, A.item, A.typed, ok));
    if (ok) K.ding(A.typed ? 4 : 2, true); else K.bonk();
    if (A.onAsk) A.onAsk(true);
    A.done(ok);
  }
  // His question: you see it, he thinks, then whether he got it (right odds of the time) and the answer either way.
  function hisAsk(label, odds, ch, done) {
    var item = nextItem(ch, false), ok = Math.random() < odds;
    A.phase = 'him';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(item.text.replace(/\s*\((\d+ of )?\d+ points?\)$/, '')) + '</p><p class="tb-say tb-think">He thinks…</p><div class="qg-after" data-ar-after></div>'));
    BB.reveal(q('[data-ar-ask] .tb-card'), function () { wait(function () {
      var t = q('.tb-think');
      if (t) t.remove();
      q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'He got it' : 'He got it wrong') + answerHtml(item, '');
      sfx('stamp', 0.5);
      if (A.onAsk) A.onAsk(true);
      K.mascot(ok ? 'happy' : 'angry', ok ? pick(['Obviously.', 'Too easy.']) : pick(['Hmph. A slip.', 'Badly worded.']));
      done(ok);
    }, 1300); });
  }
  // The button under the answer to go on (to fire, or to the next turn).
  function go(label, then) {
    var r = document.createElement('div');
    r.className = 'tb-row tb-row--next';
    r.innerHTML = '<button type="button" class="tb-btn tb-btn--go" data-ar-go>' + label + '</button>';
    q('[data-ar-ask] .tb-card__body').appendChild(r);
    A.then = then;
    r.querySelector('button').focus({ preventScroll: true });
    if (A.onAsk) A.onAsk(true);
    into(r);
  }

  // ======================================================================== Sea Battle
  // A 7x7 sea with a ship for each chapter (3, 3, 2, 2 and 1 squares). It was 8x8 with ships of 4, 3, 3, 2 and 2 and a
  // shot per right answer: about 32 rounds and 104 question cards for a player right 7 times in 10. Now a right answer
  // fires a salvo of two shells, and as ships never touch, the water round a sunk one is marked clear: about 11 rounds
  // (tools/bio/tests/arcade.mjs plays it out).
  var SEA = 7, FLEET = [3, 3, 2, 2, 1], ROWS = 'ABCDEFG', SALVO = 2, ANSWERS = 2;
  function around(x, all) {
    var r = Math.floor(x / SEA), c = x % SEA, out = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if ((!dr && !dc) || (!all && dr && dc)) continue;
        if (r + dr >= 0 && r + dr < SEA && c + dc >= 0 && c + dc < SEA) out.push((r + dr) * SEA + c + dc);
      }
    }
    return out;
  }
  // A fleet: a ship for each chapter, none touching another, even at a corner.
  function place(rand) {
    for (;;) {
      var at = {}, ships = [], ok = FLEET.every(function (len, i) {
        for (var tries = 0; tries < 200; tries++) {
          var across = rand() < 0.5, r = Math.floor(rand() * (across ? SEA : SEA - len + 1)), c = Math.floor(rand() * (across ? SEA - len + 1 : SEA)), cells = [];
          for (var k = 0; k < len; k++) cells.push((r + (across ? 0 : k)) * SEA + c + (across ? k : 0));
          if (cells.some(function (x) { return at[x] || around(x, true).some(function (n) { return at[n]; }); })) continue;
          cells.forEach(function (x) { at[x] = i + 1; });
          ships.push({ cells: cells, ch: CH[i], across: across, hits: 0 });
          return true;
        }
        return false;
      });
      if (ok) return { ships: ships, at: at, shot: {}, clear: {} };
    }
  }
  function sunk(ship) { return ship.hits === ship.cells.length; }
  function afloat(sea) { return sea.ships.filter(function (s) { return !sunk(s); }).length; }
  // A shell lands: 'miss', 'hit' or 'sunk'. A sunk ship's surrounding water is marked clear (ship.clear lists it).
  function fire(sea, x) {
    sea.shot[x] = true;
    var s = sea.at[x];
    if (!s) return 'miss';
    var ship = sea.ships[s - 1];
    ship.hits += 1;
    if (!sunk(ship)) return 'hit';
    ship.clear = [];
    ship.cells.forEach(function (c) {
      around(c, true).forEach(function (n) { if (!sea.shot[n] && !sea.clear[n] && !sea.at[n]) { sea.clear[n] = true; ship.clear.push(n); } });
    });
    return 'sunk';
  }
  function open(sea, x) { return !sea.shot[x] && !sea.clear[x]; }
  // Where he fires: along the line of a ship he's hit twice, round one he's hit once, otherwise every other square (never
  // the clear water round a sunk ship).
  function aim(sea, rand) {
    var hurt = sea.ships.filter(function (s) { return s.hits && !sunk(s); })[0];
    if (hurt) {
      var hits = hurt.cells.filter(function (x) { return sea.shot[x]; }).sort(function (a, b) { return a - b; }), cand = [];
      if (hits.length > 1) {
        var across = Math.floor(hits[0] / SEA) === Math.floor(hits[1] / SEA), lo = hits[0], hi = hits[hits.length - 1], step = across ? 1 : SEA;
        [lo - step, hi + step].forEach(function (x) {
          if (x >= 0 && x < SEA * SEA && (!across || Math.floor(x / SEA) === Math.floor(lo / SEA)) && open(sea, x)) cand.push(x);
        });
      }
      if (!cand.length) hits.forEach(function (h) { around(h, false).forEach(function (n) { if (open(sea, n) && cand.indexOf(n) < 0) cand.push(n); }); });
      if (cand.length) return cand[Math.floor(rand() * cand.length)];
    }
    var free = [], any = [];
    for (var x = 0; x < SEA * SEA; x++) {
      if (!open(sea, x)) continue;
      any.push(x);
      if ((Math.floor(x / SEA) + x % SEA) % 2 === 0) free.push(x);
    }
    var list = free.length ? free : any;
    return list[Math.floor(rand() * list.length)];
  }
  function cellName(x) { return ROWS[Math.floor(x / SEA)] + (x % SEA + 1); }
  // The marks: a hit is an orange burst, a miss a splash, clear water a small dot.
  var BURST = (function () {
    var pts = [];
    for (var i = 0; i < 16; i++) { var r = i % 2 ? 8 : 17, a = i * Math.PI / 8; pts.push((20 + r * Math.sin(a)).toFixed(1) + ' ' + (20 - r * Math.cos(a)).toFixed(1)); }
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M' + pts.join('L') + 'Z" fill="#FF9600" stroke="#13294A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="5.5" fill="#FFE14D"/></svg>';
  })();
  var SPLASH = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="8" fill="none" stroke="#FFFFFF" stroke-width="3.5"/><circle cx="8" cy="11" r="2.6" fill="#FFFFFF"/><circle cx="32" cy="9" r="2.2" fill="#FFFFFF"/><circle cx="31" cy="32" r="2.6" fill="#FFFFFF"/></svg>';
  // The big moment a shell lands: a white column of water for a miss, a flat orange and yellow blast for a hit.
  var SPOUT = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8C42 26 30 30 26 52C22 70 34 80 50 80C66 80 78 70 74 52C70 30 58 26 50 8Z" fill="#FFFFFF" stroke="#13294A" stroke-width="4" stroke-linejoin="round"/><path d="M50 30C46 42 42 48 42 58" stroke="#BFE3F7" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="18" cy="40" r="6" fill="#FFFFFF" stroke="#13294A" stroke-width="3"/><circle cx="84" cy="34" r="5" fill="#FFFFFF" stroke="#13294A" stroke-width="3"/><circle cx="86" cy="66" r="4" fill="#FFFFFF" stroke="#13294A" stroke-width="3"/><circle cx="12" cy="70" r="4" fill="#FFFFFF" stroke="#13294A" stroke-width="3"/></svg>';
  var BLAST = (function () {
    function starPath(r1, r2) {
      var pts = [];
      for (var i = 0; i < 20; i++) { var r = i % 2 ? r2 : r1, a = i * Math.PI / 10; pts.push((50 + r * Math.sin(a)).toFixed(1) + ' ' + (50 - r * Math.cos(a)).toFixed(1)); }
      return 'M' + pts.join('L') + 'Z';
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="' + starPath(46, 26) + '" fill="#FF9600" stroke="#13294A" stroke-width="4" stroke-linejoin="round"/><path d="' + starPath(26, 14) + '" fill="#FFE14D" stroke="#13294A" stroke-width="3" stroke-linejoin="round"/></svg>';
  })();
  // A ship drawn across its squares: a hull with a pointed bow in its chapter's colour, a deck line, a white cabin and
  // (if it's long enough) a gun.
  function hull(n, ch) {
    var W = n * 100, cab = Math.min(110, W * 0.3), cx = W * 0.58;
    return '<path d="M6 50L34 20H' + (W - 18) + 'Q' + (W - 6) + ' 20 ' + (W - 6) + ' 32V68Q' + (W - 6) + ' 80 ' + (W - 18) + ' 80H34Z" fill="' + COL[ch] + '" stroke="#13294A" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="M42 50H' + (W - 22) + '" stroke="#13294A" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="' + (cx - cab / 2) + '" y="34" width="' + cab + '" height="32" rx="6" fill="#F1F7FB" stroke="#13294A" stroke-width="5"/>' +
      (n > 2 ? '<circle cx="' + (W * 0.24 + 8) + '" cy="50" r="12" fill="#13294A"/>' : '');
  }
  function shipSvg(sh) {
    var n = sh.cells.length, W = n * 100, art = hull(n, sh.ch);
    return '<svg viewBox="0 0 ' + (sh.across ? W + ' 100' : '100 ' + W) + '" preserveAspectRatio="none" aria-hidden="true">' + (sh.across ? art : '<g transform="translate(100 0) rotate(90)">' + art + '</g>') + '</svg>';
  }
  function shipEl(sh, fresh) {
    var r = Math.floor(sh.cells[0] / SEA), c = sh.cells[0] % SEA, n = sh.cells.length;
    return '<span class="sea-ship' + (sunk(sh) ? ' is-sunk' : '') + (fresh ? ' is-new' : '') + '" style="grid-row:' + (r + 1) + ' / span ' + (sh.across ? 1 : n) + ';grid-column:' + (c + 1) + ' / span ' + (sh.across ? n : 1) + '" aria-hidden="true">' + shipSvg(sh) + '</span>';
  }
  function wave(x) { return (Math.floor(x / SEA) * 5 + (x % SEA) * 3) % 7 === 0 ? ' is-wave' : ''; }
  // A sea in its frame (cream, like a board game's, the squares' names printed on it), the ships lying over the water,
  // and a layer on top for the shells and splashes.
  function seaBoard(who) {
    var sea = A[who], mine = who === 'mine', cells = '';
    for (var x = 0; x < SEA * SEA; x++) {
      var at = ' data-x="' + x + '" style="grid-row:' + (Math.floor(x / SEA) + 1) + ';grid-column:' + (x % SEA + 1) + '" role="gridcell"';
      cells += mine
        ? '<span class="sea-c' + wave(x) + '"' + at + ' aria-label="' + cellName(x) + '"><i></i></span>'
        : '<button type="button" class="sea-c' + wave(x) + '"' + at + ' data-sea-x="' + x + '" aria-label="Fire at ' + cellName(x) + '"><i></i></button>';
    }
    return '<section class="sea-side sea-side--' + who + '"><p class="sea-name">' + (mine ? 'Your fleet' : 'His sea') + '</p>' +
      '<div class="sea-board" data-board="' + who + '"><span class="sea-cols" aria-hidden="true">' + ROWS.split('').map(function (l, i) { return '<i>' + (i + 1) + '</i>'; }).join('') + '</span>' +
      '<span class="sea-rows" aria-hidden="true">' + ROWS.split('').map(function (l) { return '<i>' + l + '</i>'; }).join('') + '</span>' +
      '<div class="sea-grid" role="grid" aria-label="' + (mine ? 'Your fleet' : 'His sea') + '" data-sea="' + who + '">' + cells +
      (mine ? sea.ships.map(function (sh) { return shipEl(sh); }).join('') : '') + '<div class="sea-fx" aria-hidden="true"></div></div></div></section>';
  }
  // Ships left: a little ship for each, in its chapter's colour; a sunk one goes dark with a cross.
  function seaPips(who, fresh) {
    q('[data-sea-pips="' + who + '"]').innerHTML = A[who].ships.map(function (sh) {
      return '<i class="sea-pip' + (sunk(sh) ? ' is-sunk' : '') + (sh === fresh ? ' is-new' : '') + '" style="--n:' + sh.cells.length + '" title="' + esc(NAME[sh.ch]) + (sunk(sh) ? ' (sunk)' : '') + '">' +
        '<svg viewBox="0 0 ' + sh.cells.length * 100 + ' 100" preserveAspectRatio="none" aria-hidden="true">' + hull(sh.cells.length, sh.ch) + '</svg></i>';
    }).join('');
    q('[data-sea-left="' + who + '"]').textContent = afloat(A[who]) + ' of ' + FLEET.length + ' afloat';
  }
  // One square's look after a shot (or the clear water round a sunk ship).
  function seaMark(who, x, fresh, delay) {
    var sea = A[who], c = q('[data-sea="' + who + '"] [data-x="' + x + '"]'), s = sea.at[x], ship = s && sea.ships[s - 1], shot = sea.shot[x];
    c.className = 'sea-c' + wave(x) + (shot ? (s ? ' is-hit' : ' is-miss') : sea.clear[x] ? ' is-clear' : '') + (shot && s && who === 'his' && !sunk(ship) ? ' is-wreck' : '') + (s && sunk(ship) ? ' is-sunk' : '') + (fresh ? ' is-new' : '');
    c.querySelector('i').innerHTML = shot ? (s ? BURST : SPLASH) : '';
    c.style.setProperty('--d', (delay || 0) + 'ms');
    if (c.tagName === 'BUTTON' && !open(sea, x)) c.disabled = true;
    c.setAttribute('aria-label', cellName(x) + (shot ? (s ? (sunk(ship) ? ' sunk' : ' hit') : ' miss') : sea.clear[x] ? ' clear' : ''));
  }
  // Which sea is big: on a phone the one being fired at fills the width and the other sits small beside the turn's line.
  function seaView(who) {
    var st = q('.sea-stage');
    st.setAttribute('data-view', who);
    st.querySelectorAll('.sea-side').forEach(function (s) { s.classList.toggle('is-target', s.classList.contains('sea-side--' + who)); });
    seaFit();
  }
  // On a phone the stage fills the screen; while a question's up (a sheet along the bottom) the big sea shrinks into the
  // space above it.
  function seaFit() {
    var st = q('.sea-stage');
    if (!st) return;
    var big = q('.sea-side--' + st.getAttribute('data-view')), ask = q('[data-ar-ask]');
    A.card.querySelectorAll('.sea-side').forEach(function (s) { if (s !== big) s.style.transform = ''; });
    if (!narrow()) { st.style.height = ''; big.style.transform = ''; return; }
    st.style.height = Math.max(420, window.innerHeight - st.getBoundingClientRect().top - 30) + 'px';
    if (ask.hidden) { big.style.transform = ''; return; }
    var room = ask.offsetTop - big.offsetTop - 10;
    big.style.transform = 'scale(' + Math.max(0.3, Math.min(1, room / big.offsetHeight)).toFixed(3) + ')';
  }
  function seaOpen() {
    start('sea', 'Sea Battle');
    K.playing(true);
    A.mine = place(Math.random);
    A.his = place(Math.random);
    A.fired = [0, 0];
    A.hits = [0, 0];
    show('<div class="ar ar--sea"><div class="sea-top">' +
      '<div class="sea-fleet sea-fleet--mine"><b class="sea-who">You</b><span class="sea-pips" data-sea-pips="mine"></span><span class="sea-left" data-sea-left="mine"></span></div>' +
      '<div class="sea-fleet sea-fleet--his"><span class="sea-left" data-sea-left="his"></span><span class="sea-pips" data-sea-pips="his"></span><b class="sea-who sea-who--him"><span class="sea-head" aria-hidden="true">' + K.face + '</span>Him</b></div></div>' +
      '<div class="ar-stage sea-stage" data-ar-stage data-view="mine">' + seaBoard('his') + seaBoard('mine') + turnBox() + '<div class="ar-ask" data-ar-ask hidden></div></div></div>');
    seaPips('mine');
    seaPips('his');
    A.onAsk = function () { seaFit(); };
    A.fit = seaFit;
    if (window.ResizeObserver) { A.ro = new ResizeObserver(function () { if (live()) seaFit(); }); A.ro.observe(q('[data-ar-ask]')); }
    // The board first: your ships sail in, then (on a phone) the view turns to his sea and your first question comes.
    seaView('mine');
    A.phase = 'intro';
    A.card.querySelectorAll('.sea-side--mine .sea-ship').forEach(function (s, i) { s.classList.add('is-new'); s.style.animationDelay = (120 + i * 110) + 'ms'; });
    say('<b>Your fleet is ready.</b> Find his five ships first.');
    K.mascot('happy', 'My fleet. Your guesses. Go on.');
    wait(seaYourTurn, narrow() ? 1900 : 1500);
  }
  function ammo() {
    var out = '';
    for (var i = 0; i < SALVO; i++) out += '<i class="' + (i < A.shells ? '' : 'is-spent') + '"></i>';
    return '<span class="sea-ammo" aria-label="' + plural(A.shells, 'shell') + ' left">' + out + '</span>';
  }
  function seaYourTurn() { A.answers = 0; seaView('his'); seaYours(); }
  function seaYours() {
    A.turn = 0;
    A.answers += 1;
    say(A.answers > 1 ? '<b>Another question.</b> Right: two more shells.' : '<b>Your turn.</b> Answer right for two shells.');
    row('');
    ask(A.answers > 1 ? 'Second salvo' : 'Your salvo', false, null, function (ok) {
      if (!ok) {
        K.mascot('happy', 'No shells for you.');
        say('<b>Wrong:</b> no shells this time.');
        go('His turn', function () { hideAsk(); seaHisTurn(); });
        return;
      }
      A.shells = SALVO;
      // Beside the sea the card stays up while you fire; on a phone it's a sheet over the sea, so it goes first.
      if (narrow()) go('Fire!', function () { hideAsk(); seaAim(); });
      else seaAim();
    });
  }
  function seaAim() {
    A.phase = 'aim';
    q('.sea-side--his').classList.add('is-aiming');
    say('<b>Fire!</b> Pick a square on his sea. ' + ammo());
  }
  function seaShoot(x) {
    if (A.phase !== 'aim' || !open(A.his, x)) return;
    A.phase = 'boom';
    A.shells -= 1;
    A.fired[0] += 1;
    q('.sea-side--his').classList.remove('is-aiming');
    say('<b>' + cellName(x) + '…</b> ' + ammo());
    lob('his', x, function () {
      var r = fire(A.his, x), ship = A.his.ships[(A.his.at[x] || 1) - 1];
      if (r !== 'miss') A.hits[0] += 1;
      seaLand('his', x, r);
      if (!afloat(A.his)) { seaFinal(true, ship); return; }
      var more = A.shells > 0, again = A.answers < ANSWERS;
      say((r === 'miss' ? '<b>' + cellName(x) + ': miss.</b> ' : r === 'hit' ? '<b>' + cellName(x) + ': hit!</b> ' : '<b>You sank his ' + esc(NAME[ship.ch]) + ' ship!</b> ') +
        (more ? 'One more shell. ' + ammo() : again ? 'Next question.' : 'His turn.'));
      if (r === 'sunk') K.mascot('angry', pick(['Hmph. One ship.', 'My ' + NAME[ship.ch] + ' ship!']));
      else if (r === 'hit' && Math.random() < 0.6) K.mascot('angry', pick(['A scratch.', 'Lucky.']));
      else if (r === 'miss' && Math.random() < 0.4) K.mascot('happy', pick(['Splash. Nothing.', 'Cold water.']));
      wait(more ? seaAim : function () { hideAsk(); if (again) seaYours(); else seaHisTurn(); }, r === 'sunk' ? 2000 : more ? 650 : 1100);
    });
  }
  // A shell flies to a square: up from the near edge of the board and down onto it, bigger at the top of its arc (as if
  // coming towards you), its shadow sliding over the water underneath. Web animations, so it's timed, not per frame.
  function lob(who, x, then) {
    var grid = q('[data-sea="' + who + '"]'), cell = grid.querySelector('[data-x="' + x + '"]'), lay = grid.querySelector('.sea-fx');
    var W = grid.clientWidth, H = grid.clientHeight, tx = cell.offsetLeft + cell.offsetWidth / 2, ty = cell.offsetTop + cell.offsetHeight / 2;
    var sx = W / 2 + (tx - W / 2) * 0.35, sy = who === 'his' ? H + 24 : -10, size = Math.max(12, cell.offsetWidth * 0.34);
    var shell = document.createElement('i'), shadow = document.createElement('i'), path = [], shade = [], ms = K.reduced() ? 60 : 640;
    shell.className = 'sea-shell';
    shadow.className = 'sea-shadow';
    shell.style.width = shell.style.height = shadow.style.width = size + 'px';
    shadow.style.height = (size * 0.5) + 'px';
    for (var k = 0; k <= 12; k++) {
      var p = k / 12, px = sx + (tx - sx) * p, py = sy + (ty - sy) * p, lift = Math.sin(Math.PI * p);
      // His shells come in over the top edge, so they arc less (and stay off the bar above the sea).
      path.push({ transform: 'translate(' + px.toFixed(1) + 'px,' + (py - lift * H * (who === 'his' ? 0.3 : 0.12)).toFixed(1) + 'px) translate(-50%,-50%) scale(' + (1 + lift * 0.8).toFixed(3) + ')' });
      shade.push({ transform: 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) translate(-50%,-50%) scale(' + (1 - lift * 0.45).toFixed(3) + ')', opacity: (0.15 + 0.3 * p).toFixed(2) });
    }
    lay.appendChild(shadow);
    lay.appendChild(shell);
    sfx('whoosh', 0.7);
    shadow.animate(shade, { duration: ms, fill: 'forwards' });
    shell.animate(path, { duration: ms, fill: 'forwards' }).onfinish = function () {
      shell.remove();
      shadow.remove();
      if (live()) then();
    };
  }
  // Where it lands: a spout of water (a miss), or a blast and the board shaking (a hit); a sunk ship shows (his) or goes
  // dark (yours), the water round it is marked clear and its name is slammed across the sea.
  function seaLand(who, x, r) {
    var sea = A[who], ship = sea.at[x] && sea.ships[sea.at[x] - 1], grid = q('[data-sea="' + who + '"]'), cell = grid.querySelector('[data-x="' + x + '"]');
    var fx = document.createElement('i'), size = cell.offsetWidth * (r === 'miss' ? 1.5 : r === 'sunk' ? 2.6 : 2);
    fx.className = 'sea-boom sea-boom--' + (r === 'miss' ? 'miss' : 'hit');
    fx.style.width = fx.style.height = size + 'px';
    fx.style.left = (cell.offsetLeft + cell.offsetWidth / 2) + 'px';
    fx.style.top = (cell.offsetTop + cell.offsetHeight / 2) + 'px';
    fx.innerHTML = r === 'miss' ? SPOUT : BLAST;
    fx.addEventListener('animationend', function () { fx.remove(); });
    grid.querySelector('.sea-fx').appendChild(fx);
    seaMark(who, x, true);
    if (r === 'miss') { sfx('splash', 0.8); return; }
    sfx('blast', r === 'sunk' ? 1 : 0.65);
    var board = grid.closest('.sea-board');
    board.classList.remove('is-shake', 'is-quake');
    void board.offsetWidth;
    board.classList.add(r === 'sunk' ? 'is-quake' : 'is-shake');
    if (r !== 'sunk') return;
    ship.cells.forEach(function (c) { seaMark(who, c); });
    if (who === 'his') grid.insertAdjacentHTML('afterbegin', shipEl(ship, true));
    else grid.querySelectorAll('.sea-ship').forEach(function (s, i) { if (sea.ships[i] === ship) s.classList.add('is-sunk', 'is-down'); });
    ship.clear.forEach(function (n, i) { seaMark(who, n, true, 350 + i * 45); });
    seaPips(who, ship);
    wait(function () { sfx('thud', 0.8); banner(board, who === 'his' ? 'Sunk' : 'He sank your', NAME[ship.ch], COL[ship.ch], 1500); }, 260);
  }
  // His turn: his question first; right, he fires a salvo (along a ship he's hit, round a hit, or every other square),
  // and answers again for a second. It plays by itself.
  function seaHisTurn() { A.answers = 0; seaHis(); }
  function seaHis() {
    A.turn = 1;
    A.answers += 1;
    row('');
    say(A.answers > 1 ? '<b>His second question.</b>' : '<b>His turn.</b> Right, and he fires two shells.');
    hisAsk(A.answers > 1 ? 'His second salvo' : 'His salvo', 0.6, null, function (ok) {
      if (!ok) { say('<b>He got it wrong:</b> no shells. Your turn next.'); wait(function () { hideAsk(); seaYourTurn(); }, 2800); return; }
      say('<b>He got it right:</b> two shells at your fleet.');
      wait(function () { hideAsk(); seaView('mine'); A.shells = SALVO; wait(seaHisShot, 450); }, 2200);
    });
  }
  function seaHisShot() {
    var x = aim(A.mine, Math.random);
    A.shells -= 1;
    A.fired[1] += 1;
    say('He fires at <b>' + cellName(x) + '</b>…');
    lob('mine', x, function () {
      var r = fire(A.mine, x), ship = A.mine.ships[(A.mine.at[x] || 1) - 1], more = A.shells > 0, again = A.answers < ANSWERS;
      if (r !== 'miss') A.hits[1] += 1;
      seaLand('mine', x, r);
      if (!afloat(A.mine)) { seaFinal(false, ship); return; }
      say((r === 'miss' ? 'He fired at <b>' + cellName(x) + '</b>: miss.' : r === 'hit' ? 'He fired at <b>' + cellName(x) + '</b>: <b>hit.</b>' : 'He sank your <b>' + esc(NAME[ship.ch]) + '</b> ship.') +
        (more ? '' : again ? ' He answers again.' : ' Your turn next.'));
      if (r === 'sunk') K.mascot('happy', pick(['Down she goes.', 'Glug glug.']));
      else if (r === 'hit') K.mascot('happy', pick(['Bullseye.', 'Found you.']));
      wait(more ? seaHisShot : again ? seaHis : seaYourTurn, r === 'sunk' ? 2100 : more ? 900 : 1500);
    });
  }
  // The last ship: its banner and the whole fleet's, held a moment before the end card.
  function seaFinal(won, ship) {
    A.phase = 'over';
    say(won ? '<b>You sank his whole fleet!</b>' : '<b>He sank your whole fleet.</b>');
    K.mascot(won ? 'furious' : 'happy', won ? 'My whole fleet!' : 'Sunk. All of them.');
    wait(function () { banner(q('[data-board="' + (won ? 'his' : 'mine') + '"]'), won ? 'You win' : 'He wins', 'Fleet sunk!', won ? '#FFE14D' : '#FF9600', 1700); sfx('crash', 0.9); }, 1900);
    wait(function () { seaEnd(won); }, 3900);
  }
  function seaEnd(won) {
    var wins = +(K.store('bio-sea-wins') || 0) + (won ? 1 : 0);
    if (won) K.store('bio-sea-wins', String(wins));
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. My whole fleet.' : 'Sunk. All of them. Again?');
    end(won, won ? 'You sank his fleet!' : 'He sank your fleet.', won ? 'Games won: ' + wins + '.' : 'His fleet still had ' + afloat(A.his) + ' of ' + FLEET.length + ' ships afloat.', 'data-sea-again',
      [[A.fired[0], 'shells fired'], [A.fired[0] ? Math.round(A.hits[0] / A.fired[0] * 100) + '%' : '0%', 'on target'], [FLEET.length - afloat(A.his), 'of his ships sunk']]);
  }

  // ======================================================================== the scenery, effects and camera
  // Cannon Duel and the tower are cartoon daytime scenes (the user: "make them look better"): a pale sky with the sun and
  // clouds, something far off (mountains, the school), grass on layers of soil, flat colours with navy outlines like the
  // site's art. No gradients or glows.
  var SKY = '#CDEBFA', FAR = '#A9CFE0', FAR2 = '#BEDDEA', GRASS = '#74C043', GRASS_DK = '#4E9A2E', SOIL = '#D9A066', SOIL2 = '#BF844D', SOIL3 = '#9C6A3C';
  function backdrop(g, W, sunX) {
    g.fillStyle = '#FFE14D';
    g.beginPath();
    g.arc(sunX, 72, 34, 0, 6.3);
    g.fill();
    // More clouds up high, for a phone's tall view.
    [[150, 96, 1], [390, 58, 0.75], [640, 104, 1.05], [880, 150, 0.8], [260, -120, 0.9], [760, -60, 0.8], [520, -230, 1], [90, -300, 0.75], [900, -280, 0.9]].forEach(function (c) { if (c[0] < W + 80) cloud(g, c[0], c[1], c[2]); });
  }
  function cloud(g, x, y, s) {
    g.fillStyle = '#FFFFFF';
    [[-30, 6, 20], [-8, -8, 26], [20, -2, 22], [40, 8, 16], [4, 10, 20]].forEach(function (p) { g.beginPath(); g.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, 6.3); g.fill(); });
  }
  function tufts(g, at, from, to, step) {
    g.strokeStyle = GRASS_DK;
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (var x = from; x < to; x += step) {
      var y = at(x);
      if (y == null) continue;
      g.beginPath();
      g.moveTo(x - 6, y - 3);
      g.lineTo(x - 3, y - 12);
      g.lineTo(x, y - 4);
      g.lineTo(x + 3, y - 13);
      g.lineTo(x + 6, y - 3);
      g.stroke();
    }
  }
  // Effects, all made of flat shapes: smoke puffs, flying bits (soil, paper sheets), floating numbers and a shake. Times
  // in seconds, speeds in px a second.
  function fx() { return A.fx || (A.fx = { puffs: [], bits: [], pops: [], shake: 0 }); }
  function puff(x, y, r, n) {
    for (var i = 0; i < (n || 1); i++) fx().puffs.push({ x: x + (Math.random() - 0.5) * r, y: y + (Math.random() - 0.5) * r, r: r * (0.4 + Math.random() * 0.4), t: 0, life: 0.6 + Math.random() * 0.35 });
  }
  function bits(x, y, n, colours, kind, speed) {
    for (var i = 0; i < n; i++) {
      fx().bits.push({ x: x, y: y, vx: (Math.random() - 0.5) * speed * 60, vy: (-Math.random() * speed - 1) * 60, a: Math.random() * 6, va: (Math.random() - 0.5) * 18, c: pick(colours), kind: kind, t: 0, life: kind === 'paper' ? 2 : 1.2 });
    }
  }
  function popText(x, y, text) { fx().pops.push({ x: x, y: y, text: text, t: 0 }); }
  // dt seconds on; true while anything's still going.
  function stepFx(dt) {
    var F = fx();
    F.puffs = F.puffs.filter(function (p) { return (p.t += dt) < p.life; });
    F.bits = F.bits.filter(function (b) {
      b.t += dt;
      if (b.kind === 'paper') { b.vx *= Math.pow(0.16, dt); b.vy = Math.min(78, b.vy + 216 * dt); b.x += Math.sin(b.t * 6.7) * 36 * dt; } else b.vy += 1440 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.va * dt;
      return b.t < b.life;
    });
    F.pops = F.pops.filter(function (p) { return (p.t += dt) < 1.2; });
    if (F.shake > 0) F.shake = Math.max(0, F.shake - dt * 60);
    return F.puffs.length || F.bits.length || F.pops.length || F.shake > 0;
  }
  function drawFx(g) {
    var F = fx();
    g.fillStyle = '#FFFFFF';
    F.puffs.forEach(function (p) {
      g.globalAlpha = 0.8 * (1 - p.t / p.life);
      g.beginPath();
      g.arc(p.x, p.y - p.t * 12, p.r + p.t * 18, 0, 6.3);
      g.fill();
    });
    g.globalAlpha = 1;
    F.bits.forEach(function (b) {
      g.save();
      g.translate(b.x, b.y);
      g.rotate(b.a);
      g.fillStyle = b.c;
      if (b.kind === 'paper') {
        g.strokeStyle = INK;
        g.lineWidth = 1.5;
        g.fillRect(-7, -5, 14, 10);
        g.strokeRect(-7, -5, 14, 10);
      } else g.fillRect(-3.5, -3.5, 7, 7);
      g.restore();
    });
  }
  // Floating numbers, drawn at the screen's size (readable on a phone however far the camera is back).
  function drawPops(g) {
    var F = fx(), size = narrow() ? 30 : 36;
    g.font = '800 ' + size + 'px Nunito, sans-serif';
    g.textAlign = 'center';
    g.lineJoin = 'round';
    F.pops.forEach(function (p) {
      var s = toScreen(p.x, p.y), y = s[1] - p.t * 50;
      g.globalAlpha = p.t > 0.75 ? Math.max(0, 1 - (p.t - 0.75) / 0.45) : 1;
      g.strokeStyle = '#FFFFFF';
      g.lineWidth = 8;
      g.strokeText(p.text, s[0], y);
      g.fillStyle = INK;
      g.fillText(p.text, s[0], y);
    });
    g.globalAlpha = 1;
    g.textAlign = 'left';
  }
  function shakeOf() { var s = fx().shake; return s ? [(Math.random() - 0.5) * s * 1.2, (Math.random() - 0.5) * s * 1.2] : [0, 0]; }
  // A ten-pointed burst, for explosions.
  function star(g, x, y, r, inner, fill) {
    g.beginPath();
    for (var i = 0; i < 20; i++) {
      var a = i * Math.PI / 10, rr = i % 2 ? r * inner : r;
      if (i) g.lineTo(x + rr * Math.sin(a), y - rr * Math.cos(a)); else g.moveTo(x, y - rr);
    }
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.stroke();
  }
  // The camera: world units to the screen. On a computer it always shows the whole 1000x500 field. On a phone (a tall,
  // narrow screen) it comes in close and moves to what matters (A.frame gives the view for a kind), easing there.
  function toScreen(x, y) { return [(x - A.cam.x) * A.cam.s, (y - A.cam.y) * A.cam.s]; }
  function toWorld(cx, cy) { return [cx / A.cam.s + A.cam.x, cy / A.cam.s + A.cam.y]; }
  function look(kind, arg) {
    A.camKind = kind;
    A.camArg = arg;
    A.camTo = A.frame(kind, arg);
    if (!A.cam) A.cam = { x: A.camTo.x, y: A.camTo.y, s: A.camTo.s };
    kick();
  }
  function camStep(dt) {
    if (!A.cam || !A.camTo) return false;
    var c = A.cam, t = A.camTo, k = 1 - Math.exp(-dt * 5.5), moving = Math.abs(t.x - c.x) * c.s > 0.4 || Math.abs(t.y - c.y) * c.s > 0.4 || Math.abs(t.s - c.s) > 0.002;
    if (!moving) { c.x = t.x; c.y = t.y; c.s = t.s; return false; }
    c.x += (t.x - c.x) * k;
    c.y += (t.y - c.y) * k;
    c.s += (t.s - c.s) * k;
    return true;
  }
  // The canvas (and the effects one over it) at the screen's sharpness; on a phone the field fills the card's height
  // under its top bar, above the turn's line.
  function fitCanvas() {
    var sky = q('.cd-sky') || q('.tw-sky');
    if (!sky) return;
    var turn = q('.ar-turn'), ask = q('[data-ar-ask]');
    if (narrow()) sky.style.height = Math.max(320, Math.round(window.innerHeight - sky.getBoundingClientRect().top - (turn ? turn.offsetHeight : 0) - 40)) + 'px';
    else sky.style.height = '';
    var w = sky.clientWidth, h = sky.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    sky.querySelectorAll('canvas').forEach(function (c) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); });
    A.vw = w;
    A.vh = h;
    A.dpr = dpr;
    // With a question up on a phone, only the part above its sheet is seen.
    A.viewH = narrow() && ask && !ask.hidden ? Math.max(120, Math.min(h, ask.offsetTop - sky.offsetTop - 6)) : h;
    // On a computer the card lies over the field and reaches below it: the game grows down to hold it (the dialog is
    // pinned at the top, so the field doesn't move and nothing scrolls).
    var ar = q('.ar');
    ar.style.minHeight = '';
    if (!narrow() && ask && !ask.hidden) ar.style.minHeight = Math.ceil(ask.getBoundingClientRect().bottom - ar.getBoundingClientRect().top + 4) + 'px';
    if (A.frame) { A.camTo = A.frame(A.camKind || 'wide', A.camArg); if (!A.cam || !narrow()) A.cam = { x: A.camTo.x, y: A.camTo.y, s: A.camTo.s }; }
    if (A.draw) A.draw();
    kick();
  }
  // The world drawn through the camera onto a canvas, with an optional shake.
  function worldCtx(c, sh, clear) {
    var g = c.getContext('2d'), k = A.dpr * A.cam.s;
    g.setTransform(A.dpr, 0, 0, A.dpr, 0, 0);
    if (clear) g.clearRect(0, 0, A.vw, A.vh);
    g.setTransform(k, 0, 0, k, (sh[0] - A.cam.x * A.cam.s) * A.dpr, (sh[1] - A.cam.y * A.cam.s) * A.dpr);
    return g;
  }
  function screenCtx(g, sh) { g.setTransform(A.dpr, 0, 0, A.dpr, sh[0] * A.dpr, sh[1] * A.dpr); }
  // An HTML piece riding on the field (your tag, his face) at a world point, sized with the camera (but never tiny).
  function ride(node, x, y, w, min) {
    if (!node) return;
    var s = toScreen(x, y);
    node.style.left = s[0].toFixed(1) + 'px';
    node.style.top = s[1].toFixed(1) + 'px';
    if (w) node.style.width = Math.max(min || 0, w * A.cam.s).toFixed(1) + 'px';
  }

  // ======================================================================== Cannon Duel
  var CW = 1000, CHH = 500, GRAV = 420, SPEED = 760, POS = [110, 890], BARREL = 44, PLAY = 1.5;
  var LOOK = [['#1CB0F6', '#1899D6'], ['#8FA3BD', '#5E7290']];
  // The hills: a big one in the middle and rolling ground, flat where the cannons stand.
  function hills(rand) {
    var h = [], big = 110 + rand() * 70, p1 = rand() * 6.3, p2 = rand() * 6.3;
    for (var x = 0; x <= CW; x++) {
      var t = x / CW, y = 410 - big * Math.exp(-Math.pow((t - 0.5) / 0.15, 2)) - 22 * Math.sin(t * 12.6 + p1) - 12 * Math.sin(t * 31 + p2);
      h.push(Math.max(190, Math.min(470, y)));
    }
    POS.forEach(function (px) { var y = h[px]; for (var d = -30; d <= 30; d++) h[px + d] = y; });
    return h;
  }
  // The far mountains, every 20px.
  function ridge(rand) {
    var r = [], p1 = rand() * 6.3, p2 = rand() * 6.3;
    for (var i = 0; i <= CW / 20; i++) r.push(255 + 34 * Math.sin(i * 0.33 + p1) + 18 * Math.sin(i * 0.97 + p2));
    return r;
  }
  // Where a shell leaves a cannon: the end of its barrel, which turns about a point 22px up.
  function muzzle(t, angle) { return { x: t.x + Math.cos(angle) * BARREL, y: t.y - 22 - Math.sin(angle) * BARREL }; }
  // A shell's flight from (x, y) at an angle (radians, 0 = right, up is positive) and power (0 to 1) with the wind
  // (pushing right if positive): its path (a point every 1/40s), where it stops, and who it hit directly.
  function flight(h, tanks, x, y, angle, power, wind) {
    var vx = Math.cos(angle) * power * SPEED, vy = -Math.sin(angle) * power * SPEED, dt = 1 / 120, path = [[x, y]];
    for (var i = 0; i < 3000; i++) {
      vx += wind * dt;
      vy += GRAV * dt;
      x += vx * dt;
      y += vy * dt;
      if (i % 3 === 0) path.push([x, y]);
      if (x < -60 || x > CW + 60 || y > CHH + 60) return { path: path, x: x, y: y, out: true };
      for (var p = 0; p < tanks.length; p++) {
        if (i > 8 && Math.hypot(x - tanks[p].x, y - (tanks[p].y - 18)) < 24) return { path: path, x: x, y: y, direct: p };
      }
      if (x >= 0 && x <= CW && y >= h[Math.round(x)]) return { path: path, x: x, y: y };
    }
    return { path: path, x: x, y: y, out: true };
  }
  // A shell bursts: a crater in the hills and damage to anyone near (more for a direct hit or a big shell).
  function burst(h, tanks, f, big) {
    var R = big ? 60 : 38, hurt = [];
    if (!f.out) {
      for (var x = Math.max(0, Math.round(f.x - R)); x <= Math.min(CW, Math.round(f.x + R)); x++) {
        var dy = Math.sqrt(Math.max(0, R * R - (x - f.x) * (x - f.x)));
        if (f.y - dy <= h[x]) h[x] = Math.min(CHH - 8, Math.max(h[x], f.y + dy));
      }
    }
    tanks.forEach(function (t, p) {
      var d = Math.hypot(f.x - t.x, f.y - (t.y - 18)), most = big ? 60 : 40;
      var dmg = f.out ? 0 : f.direct === p ? most : d < R + 18 ? Math.round(most * (1 - d / (R + 18)) * 0.9) : 0;
      hurt.push(dmg);
      t.hp = Math.max(0, t.hp - dmg);
      t.y = h[t.x];
    });
    return hurt;
  }
  // His aim: the angle and power that land his shell nearest a spot (on you, or a set distance short of or past you),
  // tried across the sky, through the wind and over the hill.
  function solve(h, tanks, wind, offset) {
    var me = tanks[1], at = tanks[0].x + offset, best = null;
    for (var a = 100; a <= 170; a += 2) {
      for (var pw = 0.2; pw <= 1.001; pw += 0.01) {
        var rad = a * Math.PI / 180, m = muzzle(me, rad), f = flight(h, tanks, m.x, m.y, rad, pw, wind);
        var miss = f.direct === 0 ? (offset ? 9999 : 0) : f.direct === 1 || f.out ? 9999 : Math.abs(f.x - at);
        if (!best || miss < best.miss) best = { angle: rad, power: pw, miss: miss };
      }
    }
    return best;
  }
  // Where he aims (he only fires after a right answer): half the time it's on you, three times in ten close (a little
  // damage) and twice in ten it misses anyway.
  function hisOffset(rand) {
    var side = rand() < 0.5 ? -1 : 1, r = rand();
    return side * (r < 0.5 ? rand() * 12 : r < 0.8 ? 35 + rand() * 30 : 110 + rand() * 90);
  }
  // The phone camera's views: 'wide' (the whole field above a question), 'aim' (both cannons, the sky above for the
  // shot), 'his' (close on his cannon as it swings round), 'shell' (closer, following a shell in flight).
  function cdFrame(kind, at) {
    var W = A.vw || 1000, H = A.viewH || A.vh || 500, s, x, y;
    if (!narrow()) return { x: 0, y: 0, s: W / CW };
    if (kind === 'wide') { s = W / CW; return { x: 0, y: CHH + 6 - H / s, s: s }; }
    if (kind === 'aim') { s = W / 930; return { x: 35, y: Math.max(A.tanks[0].y, A.tanks[1].y) - 0.8 * H / s, s: s }; }
    s = W / (kind === 'shell' ? 640 : 560);
    if (kind === 'shell') { x = at.x - W / s / 2; y = Math.min(A.tanks[0].y - 0.76 * H / s, at.y - 0.22 * H / s); } else {
      var t = A.tanks[kind === 'his' ? 1 : 0];
      x = t.x - (kind === 'his' ? 0.8 : 0.2) * W / s;
      y = t.y - 0.74 * H / s;
    }
    return { x: Math.max(-10, Math.min(CW + 10 - W / s, x)), y: y, s: s };
  }
  function cdOpen() {
    start('cannon', 'Cannon Duel');
    K.playing(true);
    A.h = hills(Math.random);
    A.far = ridge(Math.random);
    A.grass = A.h.map(function () { return true; });
    A.tanks = POS.map(function (x) { return { x: x, y: A.h[x], hp: 100 }; });
    A.aim = { angle: 50 * Math.PI / 180, power: 0.7 };
    A.ang = [A.aim.angle, 130 * Math.PI / 180];
    A.angTo = A.ang.slice();
    A.kick = [0, 0];
    A.turns = 0;
    A.dealt = [0, 0];
    A.shots = [0, 0];
    A.wind = 0;
    show('<div class="ar ar--cd"><div class="cd-hp">' + ['You', 'Him'].map(function (n, p) {
      return '<div class="cd-hp__one cd-hp__one--' + p + '"><b>' + n + '</b><span class="cd-hp__bar"><i data-cd-hp="' + p + '"></i></span><span class="num" data-cd-hpn="' + p + '">100</span></div>';
    }).join('') + '<p class="cd-wind" data-cd-wind></p></div>' +
    '<div class="ar-stage cd-stage" data-ar-stage><div class="ar-field cd-sky"><canvas class="cd-canvas" data-cd-canvas width="1000" height="500" tabindex="0" aria-label="The hills: drag to aim, let go to fire"></canvas>' +
      '<span class="cd-you" data-cd-tag="0">You</span><span class="cd-him am-exam__face" data-cd-tag="1" data-mood="ok" aria-hidden="true">' + K.face + '</span>' +
      '<canvas class="cd-fx" data-cd-fx aria-hidden="true"></canvas></div><div class="ar-ask" data-ar-ask hidden></div></div>' + turnBox() + '</div>');
    A.frame = cdFrame;
    A.draw = draw;
    A.step = cdStep;
    A.fit = fitCanvas;
    A.onAsk = function (on) { fitCanvas(); if (on) look('wide'); };
    if (window.ResizeObserver) { A.ro = new ResizeObserver(function () { if (live() && !q('[data-ar-ask]').hidden) fitCanvas(); }); A.ro.observe(q('[data-ar-ask]')); }
    A.camKind = 'wide';
    fitCanvas();
    hp();
    windText(false);
    // The field first (on a phone the camera starts on him, then pulls back), then your first question.
    say('<b>Two cannons, one hill.</b> Knock his health to nothing.');
    if (narrow()) { A.cam = null; look('his'); wait(function () { look('wide'); }, 900); }
    K.mascot('happy', 'Two cannons. One winner. Me.');
    wait(cdTurn, narrow() ? 2000 : 1400);
  }
  function hp() {
    A.tanks.forEach(function (t, p) {
      q('[data-cd-hp="' + p + '"]').style.width = t.hp + '%';
      q('[data-cd-hpn="' + p + '"]').textContent = t.hp;
    });
  }
  function windText(known) {
    var w = Math.round(A.wind / 10);
    q('[data-cd-wind]').innerHTML = known ? '<span>Wind</span><b>' + (w === 0 ? 'calm' : (w < 0 ? '← ' : '') + Math.abs(w) + (w > 0 ? ' →' : '')) + '</b>' : '<span>Wind</span><b>?</b>';
  }
  // His face on his cannon: pleased when he hits you, cross when you hit him, furious when he's nearly out.
  function cdMood(m) {
    var t = q('[data-cd-tag="1"]');
    if (!t) return;
    t.setAttribute('data-mood', m);
    t.classList.remove('is-react');
    void t.offsetWidth;
    t.classList.add('is-react');
  }
  // Two shots a turn at most, each after a right answer; the wind changes each turn.
  function cdTurn() { A.shotsTurn = 0; A.wind = (Math.random() * 2 - 1) * 70; cdYours(); }
  function cdYours() {
    A.turn = 0;
    A.turns += 1;
    A.big = false;
    windText(false);
    look('wide');
    say(A.shotsTurn ? '<b>Your second shot.</b> Answer to fire again.' : '<b>Your turn.</b> Answer to fire.');
    row('');
    var typed = A.turns % 3 === 0;
    ask(typed ? 'Big shell question' : 'Your shot', typed, null, function (ok) {
      if (!ok) { K.mascot('happy', 'Wrong. No shot for you.'); say('<b>Wrong:</b> no shot. His turn next.'); go('His turn', function () { hideAsk(); cdHisTurn(); }); return; }
      A.big = A.typed;
      K.mascot('angry', 'Hmph. Aim, then.');
      go(A.big ? 'Load the big shell' : 'Aim', function () {
        hideAsk();
        A.phase = 'aim';
        A.drag = null;
        windText(true);
        look('aim');
        say('<b>Drag to aim</b> and let go to fire. The dots show the start of your shot.');
        row('<button type="button" class="tb-btn tb-btn--go" data-cd-fire>Fire</button>');
        draw();
        q('[data-cd-canvas]').focus({ preventScroll: true });
      });
    });
  }
  function cdFire() {
    if (A.phase !== 'aim') return;
    A.phase = 'flying';
    A.drag = null;
    row('');
    say(A.big ? '<b>Big shell away!</b>' : '<b>Fire!</b>');
    A.shotsTurn += 1;
    cdShoot(0, A.aim.angle, A.aim.power, A.big, A.shotsTurn < 2 ? cdYours : cdHisTurn);
  }
  function cdHisTurn() { A.shotsTurn = 0; A.wind = (Math.random() * 2 - 1) * 70; cdHis(); }
  // His turn plays by itself: his question; right, the camera goes to him, his barrel swings round to his aim and he
  // fires; wrong, back to you.
  function cdHis() {
    A.turn = 1;
    windText(true);
    look('wide');
    row('');
    say(A.shotsTurn ? '<b>His second shot.</b>' : '<b>His turn.</b> He answers to fire.');
    hisAsk(A.shotsTurn ? 'His second shot' : 'His shot', 0.65, null, function (ok) {
      if (!ok) { say('<b>He got it wrong:</b> no shot. Your turn next.'); cdMood('angry'); wait(function () { hideAsk(); cdTurn(); }, 2800); return; }
      say('<b>He got it right.</b> He takes careful aim…');
      wait(function () {
        hideAsk();
        A.phase = 'flying';
        A.shotsTurn += 1;
        var s = solve(A.h, A.tanks, A.wind, hisOffset(Math.random));
        look('his');
        wait(function () { A.angTo[1] = s.angle; sfx('tick', 0.6); kick(); }, 450);
        wait(function () { cdShoot(1, s.angle, s.power, false, A.shotsTurn < 2 ? cdHis : cdTurn); }, 1400);
      }, 2000);
    });
  }
  // A shot: boom, the barrel kicks back, smoke at the muzzle, and the shell flies (trailing smoke).
  function cdShoot(who, angle, power, big, then) {
    var m = muzzle(A.tanks[who], angle), f = flight(A.h, A.tanks, m.x, m.y, angle, power, A.wind);
    A.ang[who] = A.angTo[who] = angle;
    A.kick[who] = 1;
    A.shots[who] += 1;
    A.flash = { x: m.x, y: m.y, a: angle, t: 0 };
    puff(m.x + Math.cos(angle) * 10, m.y - Math.sin(angle) * 10, 20, 6);
    sfx('boom', big ? 1 : 0.8);
    A.shell = { path: f.path, t: 0, puff: 0, big: big, who: who, f: f, then: then, x: m.x, y: m.y };
    if (narrow()) look('shell', { x: m.x, y: m.y });
    kick();
  }
  // The frame clock for the hills: the camera, the barrels swinging and springing back, the shell, the blast, the bits.
  function cdStep(dt) {
    var busy = camStep(dt);
    for (var p = 0; p < 2; p++) {
      var d = A.angTo[p] - A.ang[p];
      if (Math.abs(d) > 0.002) { A.ang[p] += d * (1 - Math.exp(-dt * 5)); busy = true; } else A.ang[p] = A.angTo[p];
      if (A.kick[p] > 0) { A.kick[p] = Math.max(0, A.kick[p] - dt * 2.4); busy = true; }
    }
    if (A.flash && (A.flash.t += dt) > 0.1) A.flash = null;
    var S = A.shell;
    if (S) {
      busy = true;
      S.t = Math.min(S.path.length - 1, S.t + dt * PLAY * 40);
      var i = Math.floor(S.t), k = S.t - i, a = S.path[i], b = S.path[Math.min(i + 1, S.path.length - 1)];
      S.x = a[0] + (b[0] - a[0]) * k;
      S.y = a[1] + (b[1] - a[1]) * k;
      if ((S.puff += dt) > 0.035) { S.puff = 0; puff(S.x, S.y, 7, 1); }
      if (narrow()) { A.camArg = { x: S.x, y: S.y }; A.camTo = cdFrame('shell', A.camArg); }
      if (S.t >= S.path.length - 1) { A.shell = null; cdLand(S); }
    }
    if (A.boom && (A.boom.t += dt) > 0.37) A.boom = null;
    busy = stepFx(dt) || busy || Boolean(A.boom) || A.dragging;
    draw();
    return busy;
  }
  // The shell bursts (a flash, soil flying, the ground shaking), digs its crater and hurts whoever's near; then the next
  // turn (or the end).
  function cdLand(S) {
    var f = S.f, big = S.big, who = S.who, before = A.h.slice(), hurt = burst(A.h, A.tanks, f, big), R = big ? 60 : 38, other = 1 - who;
    A.h.forEach(function (y, x) { if (y > before[x] + 1) A.grass[x] = false; });
    if (!f.out) {
      A.boom = { x: f.x, y: f.y, r: R, t: 0 };
      bits(f.x, f.y, big ? 28 : 18, [SOIL, SOIL2, SOIL3, GRASS], 'soil', big ? 13 : 10);
      puff(f.x, f.y - 10, R * 0.7, 6);
      fx().shake = big ? 18 : 12;
      sfx('blast', big ? 1 : 0.7);
    }
    if (hurt[0] || hurt[1]) wait(function () { sfx('crash', 0.8); }, 90);
    A.tanks.forEach(function (t, p) { if (hurt[p]) popText(t.x, t.y - 90, '−' + hurt[p]); });
    A.dealt[who] += hurt[other];
    hp();
    if (hurt[1]) cdMood(A.tanks[1].hp < 40 ? 'furious' : 'angry');
    else if (who && hurt[0]) cdMood('happy');
    else if (who) cdMood('angry');
    say(f.out ? (who ? 'His shot flew off the hills.' : 'Your shot flew off the hills.') : hurt[other] ? (who ? 'He hit you: <b>−' + hurt[other] + '</b>.' : 'You hit him: <b>−' + hurt[other] + '</b>!') + (hurt[who] ? ' (And ' + (who ? 'himself' : 'yourself') + ': −' + hurt[who] + '.)' : '') : (who ? 'He missed.' : 'You missed.'));
    if (!who && hurt[1]) K.mascot('angry', pick(['Ow. Hmph.', 'Lucky shot.']));
    if (who && hurt[0]) K.mascot('happy', pick(['Direct hit. Obviously.', 'Bullseye.']));
    if (narrow()) look('shell', { x: f.x, y: Math.min(f.y, A.tanks[0].y) });
    var dead = A.tanks.map(function (t) { return t.hp <= 0; });
    if (dead[0] || dead[1]) {
      A.phase = 'over';
      wait(function () { banner(q('.cd-sky'), dead[1] ? 'You win' : 'He wins', 'Knockout!', dead[1] ? '#FFE14D' : '#FF9600', 1600); sfx('thud', 1); }, 700);
      wait(function () { cdEnd(!dead[0]); }, 2900);
      return;
    }
    wait(S.then, 1700);
  }
  function cdEnd(won) {
    var wins = +(K.store('bio-cannon-wins') || 0) + (won ? 1 : 0);
    if (won) K.store('bio-cannon-wins', String(wins));
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. My cannon was faulty.' : 'Boom. Again?');
    end(won, won ? 'You knocked him out!' : 'He knocked you out.', won ? 'Games won: ' + wins + '.' : 'He had ' + A.tanks[1].hp + ' health left.', 'data-cd-again',
      [[A.shots[0], 'shots fired'], [A.dealt[0], 'damage done'], [A.tanks[0].hp, 'health left']]);
  }
  // A field cannon: a barrel on a carriage with a wooden wheel; yours blue, his grey. kick (0 to 1) pushes the barrel back
  // along itself and rocks the carriage, just after it fires.
  function cannon(g, t, angle, look, kick) {
    var back = kick * kick * 11, dir = Math.cos(angle) >= 0 ? 1 : -1;
    g.save();
    g.translate(t.x - dir * kick * kick * 3, t.y);
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.lineJoin = 'round';
    g.save();
    g.translate(0, -22);
    g.rotate(-angle);
    g.translate(-back, 0);
    g.fillStyle = look[0];
    g.beginPath();
    g.roundRect(-8, -9, BARREL + 2, 18, 7);
    g.fill();
    g.stroke();
    g.fillStyle = look[1];
    g.beginPath();
    g.roundRect(BARREL - 8, -11, 10, 22, 4);
    g.fill();
    g.stroke();
    g.restore();
    g.fillStyle = look[1];
    g.beginPath();
    g.moveTo(-28, -4);
    g.lineTo(-15, -30);
    g.lineTo(15, -30);
    g.lineTo(28, -4);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#C98A4B';
    g.beginPath();
    g.arc(0, -13, 14, 0, 6.3);
    g.fill();
    g.stroke();
    g.lineWidth = 2;
    g.beginPath();
    for (var k = 0; k < 4; k++) { var a = k * Math.PI / 4 + kick * 0.6 * dir; g.moveTo(-Math.cos(a) * 12, -13 - Math.sin(a) * 12); g.lineTo(Math.cos(a) * 12, -13 + Math.sin(a) * 12); }
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.arc(0, -13, 3.5, 0, 6.3);
    g.fill();
    g.restore();
  }
  function draw() {
    var c = q('[data-cd-canvas]'), cf = q('[data-cd-fx]');
    if (!c || !A.cam) return;
    var sh = shakeOf(), g = c.getContext('2d'), h = A.h, x, vx0 = A.cam.x - 30, vx1 = A.cam.x + A.vw / A.cam.s + 30, deep = A.cam.y + A.vh / A.cam.s + 40;
    // The sky fills the screen; the rest is drawn in the world through the camera.
    g.setTransform(A.dpr, 0, 0, A.dpr, 0, 0);
    g.fillStyle = SKY;
    g.fillRect(0, 0, A.vw, A.vh);
    g = worldCtx(c, sh);
    backdrop(g, CW, 860);
    g.fillStyle = FAR;
    g.beginPath();
    g.moveTo(vx0, deep);
    g.lineTo(vx0, A.far[0]);
    A.far.forEach(function (y, i) { g.lineTo(i * 20, y); });
    g.lineTo(vx1, A.far[A.far.length - 1]);
    g.lineTo(vx1, deep);
    g.fill();
    // The ground: three layers of soil, then grass along the top where no shell has dug it away.
    [[0, SOIL], [28, SOIL2], [78, SOIL3]].forEach(function (l) {
      g.beginPath();
      g.moveTo(vx0, deep);
      g.lineTo(vx0, h[0] + l[0]);
      for (x = 0; x <= CW; x += 5) g.lineTo(x, h[x] + l[0]);
      g.lineTo(vx1, h[CW] + l[0]);
      g.lineTo(vx1, deep);
      g.closePath();
      g.fillStyle = l[1];
      g.fill();
    });
    g.lineCap = 'round';
    g.lineJoin = 'round';
    [[GRASS_DK, 4, 6], [GRASS, 11, 0]].forEach(function (s) {
      g.strokeStyle = s[0];
      g.lineWidth = s[1];
      g.beginPath();
      var on = false;
      for (x = 0; x <= CW; x += 3) {
        if (A.grass[x]) { if (on) g.lineTo(x, h[x] + s[2]); else g.moveTo(x, h[x] + s[2]); on = true; } else on = false;
      }
      g.stroke();
    });
    tufts(g, function (x) { return A.grass[x] ? h[x] : null; }, 37, CW, 71);
    A.tanks.forEach(function (t, p) { cannon(g, t, A.ang[p], LOOK[p], A.kick[p]); });
    // While you aim: the first third of the shell's flight as dots, big enough to see on a phone, and no mark where it
    // lands (the user: "it shows a bit of where you're going, but it doesn't mark a dot on the target that shows you will
    // hit it; just a small trail is fine"). Dragged back onto your cannon, the shot is off (let go to cancel).
    var me = A.tanks[0], cancel = A.drag && A.drag.cancel;
    if (A.phase === 'aim' && !cancel) {
      var a = A.aim.angle, m = muzzle(me, a), f = flight(A.h, A.tanks, m.x, m.y, a, A.aim.power, A.wind), n = Math.min(f.path.length - 1, Math.max(6, Math.floor(f.path.length * 0.33)));
      var r = Math.max(5.5, 4.5 / A.cam.s);
      g.fillStyle = '#FFFFFF';
      g.strokeStyle = INK;
      g.lineWidth = Math.max(2.5, 2 / A.cam.s);
      for (var i = 3; i < n; i += 2) { g.beginPath(); g.arc(f.path[i][0], f.path[i][1], r, 0, 6.3); g.fill(); g.stroke(); }
    }
    // The power, on the ground under your cannon (off the dots' way), at the screen's size.
    if (A.phase === 'aim') {
      screenCtx(g, sh);
      var at = toScreen(me.x, me.y + 18), label = cancel ? 'Let go to cancel' : 'Power ' + Math.round(A.aim.power * 100) + '%';
      g.font = '800 ' + (narrow() ? 15 : 17) + 'px Nunito, sans-serif';
      var tw = g.measureText(label).width + 22, lx = Math.max(6, Math.min(A.vw - tw - 6, at[0] - tw / 2));
      g.fillStyle = '#FFFFFF';
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.beginPath();
      g.roundRect(lx, at[1], tw, 28, 14);
      g.fill();
      g.stroke();
      g.fillStyle = INK;
      g.fillText(label, lx + 11, at[1] + 20);
      // Where your finger or pointer is, while you drag.
      if (A.drag && A.drag.on && !cancel) {
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(A.drag.cx, A.drag.cy, 13, 0, 6.3);
        g.moveTo(A.drag.cx - 20, A.drag.cy);
        g.lineTo(A.drag.cx - 7, A.drag.cy);
        g.moveTo(A.drag.cx + 7, A.drag.cy);
        g.lineTo(A.drag.cx + 20, A.drag.cy);
        g.stroke();
      }
    }
    // Over his face: the shell, the muzzle flash, the blast, smoke, soil and the damage floating up.
    g = worldCtx(cf, sh, true);
    g.strokeStyle = INK;
    if (A.flash) {
      g.lineWidth = 2.5;
      star(g, A.flash.x + Math.cos(A.flash.a) * 8, A.flash.y - Math.sin(A.flash.a) * 8, 18, 0.5, '#FFE14D');
    }
    if (A.shell) {
      var rr = A.shell.big ? 10 : 7;
      g.fillStyle = INK;
      g.beginPath();
      g.arc(A.shell.x, A.shell.y, rr, 0, 6.3);
      g.fill();
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      g.arc(A.shell.x - rr * 0.35, A.shell.y - rr * 0.35, rr * 0.28, 0, 6.3);
      g.fill();
    }
    if (A.boom) {
      var b = A.boom, t = b.t * 60, s = Math.min(1, (t + 1) / 5) * (1 + t / 40);
      g.globalAlpha = t > 12 ? Math.max(0, 1 - (t - 12) / 10) : 1;
      g.strokeStyle = INK;
      g.lineWidth = 3;
      star(g, b.x, b.y, b.r * 1.15 * s, 0.55, '#FF9600');
      star(g, b.x, b.y, b.r * 0.62 * s, 0.5, '#FFE14D');
      g.globalAlpha = 1;
    }
    drawFx(g);
    screenCtx(g, sh);
    drawPops(g);
    // Your tag and his face ride on the cannons (HTML, so his face is the site's drawing, with his moods).
    var tag = q('[data-cd-tag="0"]');
    ride(tag, me.x - 30, me.y - 36);
    // Kept inside the field when the phone's camera has your cannon near the edge.
    if (tag) tag.style.left = Math.max(tag.offsetWidth / 2 + 4, parseFloat(tag.style.left)).toFixed(1) + 'px';
    ride(q('[data-cd-tag="1"]'), A.tanks[1].x + 16, A.tanks[1].y - 26, 70, 40);
  }
  // Aiming is a drag (the user found a single tap fired a wasted shot): press anywhere, move over 20px and the barrel
  // follows (point where to shoot; further from the cannon is more power), let go to fire. Back onto the cannon, it's
  // called off.
  function aimDown(e) {
    var r = q('[data-cd-canvas]').getBoundingClientRect();
    A.drag = { x0: e.clientX, y0: e.clientY, cx: e.clientX - r.left, cy: e.clientY - r.top, on: false, cancel: false };
    A.dragging = true;
  }
  function aimMove(e) {
    var c = q('[data-cd-canvas]'), r = c.getBoundingClientRect(), D = A.drag;
    D.cx = e.clientX - r.left;
    D.cy = e.clientY - r.top;
    if (!D.on && Math.hypot(e.clientX - D.x0, e.clientY - D.y0) < 20) return;
    D.on = true;
    var w = toWorld(D.cx, D.cy), t = A.tanks[0], dx = w[0] - t.x, dy = t.y - 22 - w[1], piv = toScreen(t.x, t.y - 22);
    D.cancel = Math.hypot(D.cx - piv[0], D.cy - piv[1]) < 34;
    if (!D.cancel) {
      A.aim.angle = Math.max(0.05, Math.min(Math.PI - 0.05, Math.atan2(Math.max(dy, 1), dx)));
      A.aim.power = Math.max(0.15, Math.min(1, Math.hypot(dx, dy) / 320));
      A.ang[0] = A.angTo[0] = A.aim.angle;
    }
    kick();
  }
  function aimUp() {
    var D = A.drag;
    A.dragging = false;
    A.drag = null;
    if (D && D.on && !D.cancel) { cdFire(); return; }
    if (D && !D.on) say('<b>Drag</b> to aim (a tap doesn\'t fire), then let go. Or use the arrow keys and Fire.');
    draw();
  }

  // ======================================================================== Topple the Examiner
  var TW = 1000, TH = 500, GROUND = 470, SLING = { x: 170, y: 352 }, PULL = 110, QUESTIONS = 8, LAUNCH = 0.17, STEP = 1 / 180;
  // The towers, a level for each chapter, bottom up: desk legs (tall), desks (long and thin) and stacks of papers
  // (square). [x, bottom, w, h, kind]: x is the middle; he sits on the top. The user found level 1 fell to the first
  // paper ball and level 2 harder than level 3, so the towers are in order of how many shots a steady player needs
  // (about 3.8, 4.6, 5.5, 6.3 and 6.7 on average, the textbook every third shot), and level 1 has a stack of papers in
  // front of him (tools/bio/tests/arcade.mjs checks the order and that hard paper balls rarely win level 1).
  function tower(level) {
    var out = [], top = GROUND;
    function leg(x, b, h) { out.push([x, b, 20, h, 'leg']); return b - h; }
    function desk(x, b, w) { out.push([x, b, w, 16, 'desk']); return b - 16; }
    function paper(x, b, n, s) { for (var i = 0; i < n; i++) out.push([x, b - i * s, s, s, 'paper']); return b - n * s; }
    if (level === 0) {
      // A desk on two legs, a stack of papers in front of him.
      leg(700, GROUND, 90); top = leg(820, GROUND, 90);
      top = desk(760, top, 160);
      paper(700, top, 1, 30);
    } else if (level === 1) {
      // Papers, a desk, a storey of legs, a desk with papers in front of him; more papers to the side.
      [0, 1, 2, 3, 4].forEach(function (i) { paper(680 + i * 40, GROUND, 1, 40); });
      [0, 1, 2, 3].forEach(function (i) { paper(700 + i * 40, GROUND - 40, 1, 40); });
      top = desk(760, GROUND - 80, 190);
      leg(700, top, 80); top = leg(820, top, 80);
      top = desk(760, top, 190);
      paper(688, top, 1, 30);
      paper(560, GROUND, 4, 36); paper(600, GROUND, 2, 36);
    } else if (level === 2) {
      // Two storeys of desks on legs.
      leg(660, GROUND, 90); leg(760, GROUND, 90); top = leg(860, GROUND, 90);
      top = desk(760, top, 240);
      leg(700, top, 80); top = leg(820, top, 80);
      top = desk(760, top, 170);
      paper(570, GROUND, 4, 36);
    } else if (level === 3) {
      // A pyramid of papers under a desk.
      [0, 1, 2, 3, 4].forEach(function (i) { paper(680 + i * 40, GROUND, 1, 40); });
      [0, 1, 2, 3].forEach(function (i) { paper(700 + i * 40, GROUND - 40, 1, 40); });
      [0, 1, 2].forEach(function (i) { paper(720 + i * 40, GROUND - 80, 1, 40); });
      top = desk(760, GROUND - 120, 150);
      paper(560, GROUND, 3, 36);
    } else {
      // A desk on legs, two stacks of papers on it, a desk on those.
      leg(680, GROUND, 80); top = leg(840, GROUND, 80);
      top = desk(760, top, 210);
      paper(705, top, 2, 36); top = paper(815, top, 2, 36);
      top = desk(760, top, 190);
    }
    return { blocks: out, top: top };
  }
  // The world for a level: the ground, the tower's blocks and him on top. He's a box with well-rounded corners (his face
  // rides on it): as a ball he rolled off at the first knock; now he slides and tips over.
  function world(level) {
    var M = window.Matter, eng = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 }), t = tower(level);
    var ground = M.Bodies.rectangle(TW / 2, GROUND + 40, TW * 3, 80, { isStatic: true, label: 'ground', friction: 0.9 });
    var blocks = t.blocks.map(function (b) {
      var body = M.Bodies.rectangle(b[0], b[1] - b[3] / 2, b[2], b[3], { label: b[4], density: b[4] === 'paper' ? 0.002 : 0.0015, friction: 0.7, frictionStatic: 1, restitution: 0.02 });
      body.size = [b[2], b[3]];
      return body;
    });
    var him = M.Bodies.rectangle(760, t.top - 24, 44, 48, { chamfer: { radius: 16 }, label: 'him', density: 0.0015, friction: 0.8, frictionStatic: 1, restitution: 0.05 });
    M.Composite.add(eng.world, [ground].concat(blocks, [him]));
    return { eng: eng, him: him, blocks: blocks, startY: him.position.y, shots: [] };
  }
  function tick(w, n) { for (var i = 0; i < (n || 1); i++) window.Matter.Engine.update(w.eng, 1000 * STEP); }
  function off(w) { var p = w.him.position; return p.y > w.startY + 70 || p.x < -40 || p.x > TW + 40; }
  function still(w) {
    return window.Matter.Composite.allBodies(w.eng.world).every(function (b) { return b.isStatic || b.isSleeping || b.speed < 0.12 && b.angularSpeed < 0.01; });
  }
  // A shot's body: a crumpled paper ball, or (a typed answer) a heavy textbook.
  function shotBody(x, y, heavy) {
    var M = window.Matter;
    return heavy ? M.Bodies.rectangle(x, y, 44, 32, { label: 'book', density: 0.009, friction: 0.6, restitution: 0.1 })
      : M.Bodies.circle(x, y, 14, { label: 'ball', density: 0.0035, friction: 0.5, restitution: 0.3 });
  }
  // A pull is only ever backwards (the shot goes forwards, up to steeply up or a little down: the user's click on the
  // examiner launched one backwards), and no further than PULL.
  function clampPull(x, y) {
    var d = Math.hypot(x, y), a = Math.atan2(y, -x), lo = -0.45, hi = 1.4;
    if (d < 0.01) return { x: 0, y: 0 };
    if (x > 0 || a < lo || a > hi) { a = Math.max(lo, Math.min(hi, x > 0 ? (y > 0 ? hi : lo) : a)); }
    d = Math.min(PULL, d);
    return { x: -Math.cos(a) * d, y: Math.sin(a) * d };
  }
  function twOpen() {
    start('tower', 'Topple the Examiner');
    K.playing(false);
    var open = Math.max(1, +(K.store('bio-tower-level') || 1));
    show('<div class="am-games__end tw-start"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">Topple the Examiner</h3>' +
      '<p class="am-games__sub">He\'s sitting on a tower of exam papers. Each right answer gives you a shot with the slingshot; a typed one, a heavy textbook. Knock him off within ' + QUESTIONS + ' questions.</p>' +
      '<div class="dsi-chs">' + CH.map(function (ch, i) {
        var best = +(K.store('bio-tower-best-' + i) || 0), locked = i + 1 > open;
        return '<button type="button" class="tb-pick" data-tw-level="' + i + '" style="--c:' + COL[ch] + '"' + (locked ? ' disabled' : '') + '><span class="tb-pick__dir">Level ' + (i + 1) + '</span><span class="tb-pick__ch">' + esc(NAME[ch]) + '</span>' +
          '<span class="tb-pick__what">' + (locked ? 'Beat level ' + i + ' first' : best ? 'Done in ' + plural(best, 'question') : 'Not done yet') + '</span></button>';
      }).join('') + '</div></div>');
    K.mascot('happy', 'Up here? You\'ll never reach me.');
  }
  // His face on his body: smug up there, cross when something hits near him, furious as he falls.
  function twMood(m) {
    var h = q('[data-tw-him]');
    if (!h || h.getAttribute('data-mood') === m) return;
    h.setAttribute('data-mood', m);
    h.classList.remove('is-react');
    void h.offsetWidth;
    h.classList.add('is-react');
  }
  // The phone camera's views: 'scene' (the slingshot and the tower), 'tower' (close on him), 'shot' (following the shot).
  function twFrame(kind, at) {
    var W = A.vw || 1000, H = A.viewH || A.vh || 500, s, x;
    if (!narrow()) return { x: 0, y: 0, s: W / TW };
    if (kind === 'tower') { s = W / 520; x = 760 - 260; } else if (kind === 'shot' && at) { s = W / 700; x = at.x - 0.4 * W / s; } else { s = W / 960; x = 25; }
    return { x: Math.max(0, Math.min(TW - W / s, x)), y: TH + 4 - H / s, s: s };
  }
  function twGo(level) {
    if (!window.Matter) return;
    var M = window.Matter;
    K.playing(true);
    A.gen += 1;
    A.right = A.asked = A.fired = 0;
    A.level = level;
    A.ch = CH[level];
    A.qs = 0;
    A.w = world(level);
    tick(A.w, 240);
    A.w.startY = A.w.him.position.y;
    A.pull = null;
    A.toppled = false;
    A.trail = null;
    A.fx = null;
    A.cam = null;
    A.acc = 0;
    A.simT = 0;
    A.heard = -1;
    // Hard knocks throw paper sheets off the stacks, puff dust off the ground, shake the screen and make a noise: a
    // crash into papers, a thud into wood, metal or him.
    M.Events.on(A.w.eng, 'collisionStart', function (ev) {
      if (!live() || (A.phase !== 'flying' && A.phase !== 'over')) return;
      ev.pairs.forEach(function (pr) {
        var a = pr.bodyA, b = pr.bodyB, sp = a.speed + b.speed, L = [a.label, b.label];
        if (sp < 3) return;
        var at = pr.collision && pr.collision.supports && pr.collision.supports[0] || { x: (a.position.x + b.position.x) / 2, y: (a.position.y + b.position.y) / 2 };
        if (L.indexOf('paper') >= 0) bits(at.x, at.y, Math.min(6, Math.round(sp)), ['#FFFFFF', '#FFFDF6', '#EEF2F6'], 'paper', 5);
        if (L.indexOf('ground') >= 0) puff(at.x, Math.min(at.y, GROUND) - 6, 14, 2);
        if (L.indexOf('ball') >= 0 || L.indexOf('book') >= 0) fx().shake = Math.max(fx().shake, Math.min(10, Math.round(sp)));
        if (L.indexOf('him') >= 0) twMood('angry');
        if (A.simT - A.heard > 0.07 && sp > 4) {
          A.heard = A.simT;
          sfx(L.indexOf('paper') >= 0 ? 'crash' : 'thud', Math.min(1, sp / 14));
        }
      });
    });
    show('<div class="ar ar--tw"><p class="tw-top"><b>Level ' + (level + 1) + ': ' + esc(NAME[A.ch]) + '</b><span data-tw-left></span></p>' +
      '<div class="ar-stage tw-stage" data-ar-stage><div class="ar-field tw-sky"><canvas class="tw-canvas" data-tw-canvas width="1000" height="500" tabindex="0" aria-label="The tower: drag the slingshot back and let go"></canvas>' +
      '<span class="tw-him am-exam__face" data-tw-him data-mood="happy" aria-hidden="true">' + K.face + '</span></div><div class="ar-ask" data-ar-ask hidden></div></div>' + turnBox() + '</div>');
    K.gameHud(A.card, QUESTIONS, '');
    A.frame = twFrame;
    A.draw = twDraw;
    A.step = twStep;
    A.fit = fitCanvas;
    A.onAsk = function (on) { fitCanvas(); if (on) look('scene'); };
    if (window.ResizeObserver) { A.ro = new ResizeObserver(function () { if (live() && !q('[data-ar-ask]').hidden) fitCanvas(); }); A.ro.observe(q('[data-ar-ask]')); }
    A.camKind = 'scene';
    A.phase = 'intro';
    fitCanvas();
    twLeft();
    // The tower first (on a phone the camera starts close on him, then pulls back to the slingshot), then question 1.
    say('<b>Knock him off the tower.</b> ' + QUESTIONS + ' questions, a shot for each right answer.');
    if (narrow()) { A.cam = null; look('tower'); wait(function () { look('scene'); }, 1100); }
    K.mascot('happy', pick(['Up here? You\'ll never reach me.', 'Comfy up here.', 'Go on. Try.']));
    wait(twNext, narrow() ? 2300 : 1600);
  }
  function twLeft() { q('[data-tw-left]').textContent = A.qs ? 'Question ' + A.qs + ' of ' + QUESTIONS : QUESTIONS + ' questions'; }
  function twNext() {
    if (A.qs >= QUESTIONS) { twEnd(false); return; }
    A.qs += 1;
    twLeft();
    K.gameSeg(A.card, A.qs - 1, 'is-current');
    var typed = A.qs % 3 === 0;
    say('Answer to load the slingshot.');
    row('');
    ask(typed ? 'Textbook question' : 'Question ' + A.qs, typed, A.ch, function (ok) {
      A.heavy = ok && A.typed;
      K.gameSeg(A.card, A.qs - 1, ok ? 'is-ok' : 'is-no');
      if (!ok) { K.mascot('happy', 'No shot. Ha.'); say('<b>Wrong:</b> no shot.'); go(A.qs >= QUESTIONS ? 'See how you did' : 'Next question', function () { hideAsk(); twNext(); }); return; }
      K.mascot('angry', A.heavy ? 'Not the textbook!' : 'Hmph. One shot.');
      go(A.heavy ? 'Load the textbook' : 'Load the slingshot', function () {
        hideAsk();
        A.phase = 'aim';
        A.pull = { x: 0, y: 0 };
        look('scene');
        say(narrow() ? '<b>Drag anywhere</b> to pull back, let go to shoot. Back to the start to cancel.' : '<b>Drag the shot back</b> and let go. The dots show the start of its flight.');
        twDraw();
        q('[data-tw-canvas]').focus({ preventScroll: true });
      });
    });
  }
  function twLaunch() {
    var M = window.Matter, p = A.pull;
    if (A.phase !== 'aim' || !p) return;
    // Let go near the pouch: no shot (pull again).
    if (Math.hypot(p.x, p.y) < 22) { A.pull = { x: 0, y: 0 }; twDraw(); return; }
    A.phase = 'flying';
    var shot = shotBody(SLING.x + p.x, SLING.y + p.y, A.heavy);
    M.Composite.add(A.w.eng.world, shot);
    M.Body.setVelocity(shot, { x: -p.x * LAUNCH, y: -p.y * LAUNCH });
    A.w.shots.push(shot);
    A.shot = shot;
    A.fired = (A.fired || 0) + 1;
    A.pull = null;
    A.trail = [];
    A.simT = 0;
    A.heard = -1;
    A.calm = 0;
    A.acc = 0;
    sfx('twang', Math.hypot(p.x, p.y) / PULL);
    say('');
    if (narrow()) look('shot', shot.position);
    kick();
  }
  // The frame clock for the tower: matter.js in fixed 1/180s steps, as many as the time that's passed; the camera; the
  // effects. A shot is done when everything's still for a third of a second (or after nine seconds).
  function twStep(dt) {
    var busy = camStep(dt);
    if (A.phase === 'flying' || A.phase === 'over' && A.toppled && !A.rested) {
      busy = true;
      A.acc += dt;
      for (var n = 0; A.acc >= STEP && n < 20; n++) { tick(A.w, 1); A.acc -= STEP; A.simT += STEP; }
      if (A.acc > STEP) A.acc = 0;
      if (A.trail && A.simT < 2.5 && A.simT - (A.trail.t || 0) >= 0.05) { A.trail.push([A.shot.position.x, A.shot.position.y]); A.trail.t = A.simT; }
      if (A.w.him.speed > 2.5 && A.w.him.position.y > A.w.startY + 15) twMood('furious');
      if (narrow()) {
        var sx = A.shot.position.x;
        if (sx > 560 || A.simT > 1.6) look('tower'); else { A.camArg = A.shot.position; A.camTo = twFrame('shot', A.camArg); }
      }
      if (off(A.w) && !A.toppled) twToppled();
      A.calm = still(A.w) ? A.calm + dt : 0;
      if (A.phase === 'over' && (A.calm > 0.33 || A.simT > 12)) A.rested = true;
      if (A.phase === 'flying' && (A.calm > 0.33 || A.simT > 9)) { A.phase = 'settled'; wait(twAfter, 10); }
    }
    busy = stepFx(dt) || busy;
    twDraw();
    return busy || A.dragging;
  }
  // He's off: "Toppled!" over the scene, held there a moment before the end card.
  // Once he's off, the scene plays on for about a second and a half (by the clock, however fast the physics runs) with
  // the banner up, then the end card.
  function twToppled() {
    A.toppled = true;
    K.mascot('furious', pick(['Whoa!', 'Nooo!']));
    twMood('furious');
    wait(function () { banner(q('.tw-sky'), 'Level ' + (A.level + 1), 'Toppled!', '#FFE14D', 4000); sfx('stamp', 1); }, 350);
    wait(function () { if (A.phase === 'flying') { A.phase = 'settled'; twAfter(); } }, 1300);
  }
  function twAfter() {
    var M = window.Matter;
    if (A.toppled || off(A.w)) {
      if (!A.toppled) twToppled();
      puff(A.w.him.position.x, A.w.him.position.y + 18, 22, 6);
      A.phase = 'over';
      A.rested = false;
      kick();
      wait(function () { twEnd(true); }, 1300);
      return;
    }
    // The shot's done: it's cleared away for the next one.
    A.w.shots.forEach(function (s) { M.Composite.remove(A.w.eng.world, s); });
    A.w.shots = [];
    A.shot = null;
    twMood('happy');
    K.mascot('happy', pick(['Still here.', 'Missed me.', 'Is that all?']));
    wait(twNext, 900);
  }
  function twEnd(won) {
    var lv = A.level, best = +(K.store('bio-tower-best-' + lv) || 0);
    A.toppled = false;
    if (won) {
      if (!best || A.qs < best) K.store('bio-tower-best-' + lv, String(best = A.qs));
      if (+(K.store('bio-tower-level') || 1) < lv + 2) K.store('bio-tower-level', String(Math.min(CH.length, lv + 2)));
    }
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. I was getting down anyway.' : 'Still up here. Try again.');
    end(won, won ? 'He\'s off the tower!' : 'He\'s still up there.', won ? 'Level ' + (lv + 1) + ' done in ' + plural(A.qs, 'question') + '.' : 'Out of questions for level ' + (lv + 1) + '.', won && lv + 1 < CH.length ? 'data-tw-next' : 'data-tw-again',
      won ? [[A.qs, A.qs === 1 ? 'question' : 'questions'], [A.fired, A.fired === 1 ? 'shot' : 'shots'], [best, 'your fewest']] : null);
    if (won && lv + 1 < CH.length) q('[data-tw-next]').textContent = 'Next level';
    else if (!won) q('[data-tw-again]').textContent = 'Try again';
  }
  // The school in the distance, behind the tower, with trees.
  function school(g) {
    g.fillStyle = FAR;
    [[70, 1], [420, 0.8], [960, 0.9]].forEach(function (t) {
      g.fillRect(t[0] - 5 * t[1], GROUND - 76 * t[1], 10 * t[1], 76 * t[1]);
      g.beginPath();
      g.arc(t[0], GROUND - 96 * t[1], 36 * t[1], 0, 6.3);
      g.fill();
    });
    g.fillRect(540, 262, 400, GROUND - 262);
    g.fillRect(530, 252, 420, 14);
    g.fillRect(712, 160, 96, 110);
    g.beginPath();
    g.moveTo(700, 164);
    g.lineTo(760, 112);
    g.lineTo(820, 164);
    g.closePath();
    g.fill();
    g.fillStyle = FAR2;
    for (var r = 0; r < 3; r++) for (var i = 0; i < 8; i++) { var x = 556 + i * 50; if (x > 690 && x < 800) continue; g.fillRect(x, 288 + r * 58, 26, 34); }
    g.fillRect(740, 396, 40, GROUND - 396);
    g.fillStyle = '#FFFFFF';
    g.beginPath();
    g.arc(760, 208, 24, 0, 6.3);
    g.fill();
    g.strokeStyle = FAR;
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(760, 208);
    g.lineTo(760, 192);
    g.moveTo(760, 208);
    g.lineTo(771, 214);
    g.stroke();
  }
  // The slingshot, wood with navy outlines: the back prong and its band behind the shot, the front ones in front.
  function sling(g, front) {
    var px = SLING.x, py = SLING.y, p = A.phase === 'aim' ? A.pull : null, sx = px + (p ? p.x : 0), sy = py + (p ? p.y : 0);
    function stick(pts, wood) {
      [[INK, 17], [wood, 11]].forEach(function (s) {
        g.strokeStyle = s[0];
        g.lineWidth = s[1];
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        pts.forEach(function (pt, i) { if (i) g.lineTo(pt[0], pt[1]); else g.moveTo(pt[0], pt[1]); });
        g.stroke();
      });
    }
    function band(x, y) {
      g.strokeStyle = '#5A3214';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(sx, sy);
      g.stroke();
    }
    if (!front) {
      stick([[px, py + 34], [px + 18, py - 8]], '#8A5426');
      if (p) {
        band(px + 18, py - 8);
        g.fillStyle = '#5A3214';
        g.beginPath();
        g.roundRect(sx - 12, sy - 8, 24, 16, 6);
        g.fill();
        shotShape(g, sx, sy, 0, A.heavy);
      } else {
        g.strokeStyle = '#5A3214';
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(px + 18, py - 8);
        g.lineTo(px - 16, py - 8);
        g.stroke();
      }
      return;
    }
    if (p) band(px - 16, py - 8);
    stick([[px, GROUND + 4], [px, py + 34], [px - 16, py - 8]], '#B0723A');
  }
  function twDraw() {
    var c = q('[data-tw-canvas]');
    if (!c || !A.w || !A.cam) return;
    var M = window.Matter, sh = shakeOf(), g = c.getContext('2d'), deep = A.cam.y + A.vh / A.cam.s + 40, x0 = A.cam.x - 40, x1 = A.cam.x + A.vw / A.cam.s + 40;
    g.setTransform(A.dpr, 0, 0, A.dpr, 0, 0);
    g.fillStyle = SKY;
    g.fillRect(0, 0, A.vw, A.vh);
    g = worldCtx(c, sh);
    backdrop(g, TW, 300);
    school(g);
    g.fillStyle = SOIL;
    g.fillRect(x0, GROUND, x1 - x0, deep - GROUND);
    g.fillStyle = SOIL2;
    g.fillRect(x0, GROUND + 20, x1 - x0, deep - GROUND);
    g.fillStyle = GRASS_DK;
    g.fillRect(x0, GROUND + 4, x1 - x0, 8);
    g.fillStyle = GRASS;
    g.fillRect(x0, GROUND - 4, x1 - x0, 10);
    tufts(g, function () { return GROUND - 3; }, 30, TW, 83);
    sling(g, false);
    if (A.trail) {
      g.fillStyle = 'rgba(19,41,74,.35)';
      A.trail.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 3.5, 0, 6.3); g.fill(); });
    }
    M.Composite.allBodies(A.w.eng.world).forEach(function (b) {
      if (b.label === 'ground' || b.label === 'him') return;
      if (b.label === 'ball' || b.label === 'book') { shotShape(g, b.position.x, b.position.y, b.angle, b.label === 'book'); return; }
      block(g, b);
    });
    // While you pull back: a bit of where the shot will go (the user: "it shows a bit of where you're going, but it
    // doesn't mark a dot on the target that shows you will hit it; just a small trail is fine").
    if (A.phase === 'aim' && A.pull && Math.hypot(A.pull.x, A.pull.y) >= 22) {
      var r = Math.max(5, 4 / A.cam.s);
      g.fillStyle = '#FFFFFF';
      g.strokeStyle = INK;
      g.lineWidth = Math.max(2, 1.8 / A.cam.s);
      twTrail().forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], r, 0, 6.3); g.fill(); g.stroke(); });
    }
    sling(g, true);
    // Where a mouse can grab the shot: a ring round the pouch while you're aiming and not pulling.
    if (A.phase === 'aim' && !A.dragging && !narrow() && A.pull && !A.pull.x && !A.pull.y) {
      g.strokeStyle = '#FFFFFF';
      g.lineWidth = 3;
      g.setLineDash([8, 7]);
      g.beginPath();
      g.arc(SLING.x, SLING.y, 34, 0, 6.3);
      g.stroke();
      g.setLineDash([]);
    }
    drawFx(g);
    var h = q('[data-tw-him]'), p = A.w.him.position;
    if (h) { ride(h, p.x, p.y, 56, 34); h.style.transform = 'translate(-50%, -54%) rotate(' + A.w.him.angle + 'rad)'; }
  }
  // A block of the tower: a stack of exam papers (its sheets, a tab in the chapter's colour), a wooden desk top or a
  // metal desk leg, each with a navy outline.
  function block(g, b) {
    var w = b.size[0], h = b.size[1];
    g.save();
    g.translate(b.position.x, b.position.y);
    g.rotate(b.angle);
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.lineJoin = 'round';
    if (b.label === 'paper') {
      g.fillStyle = COL[A.ch];
      g.fillRect(w / 2 - 3, -h / 2 + 5, 8, 10);
      g.strokeRect(w / 2 - 3, -h / 2 + 5, 8, 10);
      g.fillStyle = '#FFFDF6';
      g.fillRect(-w / 2, -h / 2, w, h);
      g.strokeStyle = '#C5D0D8';
      g.lineWidth = 1.5;
      g.beginPath();
      for (var y = -h / 2 + 6; y < h / 2 - 2; y += 6) { g.moveTo(-w / 2 + 3, y); g.lineTo(w / 2 - 3, y); }
      g.stroke();
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.strokeRect(-w / 2, -h / 2, w, h);
    } else if (b.label === 'leg') {
      g.fillStyle = '#A7B6C1';
      g.fillRect(-w / 2, -h / 2, w, h);
      g.fillStyle = '#7F909C';
      g.fillRect(-2, -h / 2 + 4, 4, h - 8);
      g.strokeRect(-w / 2, -h / 2, w, h);
    } else {
      g.fillStyle = '#D69A5B';
      g.fillRect(-w / 2, -h / 2, w, h);
      g.fillStyle = '#EBC08A';
      g.fillRect(-w / 2, -h / 2, w, 4);
      g.strokeStyle = '#B37940';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-w / 2 + 10, 2);
      g.lineTo(-w / 6, 2);
      g.moveTo(w / 10, 4);
      g.lineTo(w / 2 - 14, 4);
      g.stroke();
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.strokeRect(-w / 2, -h / 2, w, h);
    }
    g.restore();
  }
  // The shot's first 0.4 seconds of flight, worked out in an empty world with the same body and launch as twLaunch.
  function twTrail() {
    var M = window.Matter, p = A.pull, eng = M.Engine.create(), out = [];
    var b = shotBody(SLING.x + p.x, SLING.y + p.y, A.heavy);
    M.Composite.add(eng.world, b);
    M.Body.setVelocity(b, { x: -p.x * LAUNCH, y: -p.y * LAUNCH });
    for (var i = 1; i <= 72; i++) {
      M.Engine.update(eng, 1000 * STEP);
      if (i % 8 === 0) out.push([b.position.x, b.position.y]);
    }
    return out;
  }
  // A crumpled paper ball, or a textbook: its cover in the chapter's colour, its pages showing at the edge.
  function shotShape(g, x, y, a, book) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.lineJoin = 'round';
    if (book) {
      g.fillStyle = '#FFFDF6';
      g.fillRect(-20, -16, 42, 32);
      g.strokeRect(-20, -16, 42, 32);
      g.fillStyle = COL[A.ch];
      g.beginPath();
      g.roundRect(-22, -16, 38, 32, 3);
      g.fill();
      g.stroke();
      g.fillStyle = '#FFFFFF';
      g.fillRect(-14, -8, 22, 5);
      g.fillRect(-14, 0, 14, 4);
    } else {
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      for (var i = 0; i < 9; i++) { var an = i * Math.PI * 2 / 9, r = i % 2 ? 13 : 15.5; if (i) g.lineTo(Math.cos(an) * r, Math.sin(an) * r); else g.moveTo(r, 0); }
      g.closePath();
      g.fill();
      g.stroke();
      g.strokeStyle = '#B9C7CF';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-8, -4);
      g.lineTo(2, 2);
      g.lineTo(7, -6);
      g.moveTo(-5, 8);
      g.lineTo(6, 5);
      g.stroke();
    }
    g.restore();
  }
  // Pulling: with a mouse you grab the shot in the pouch (within 60px) and pull it back. On a touch screen a drag
  // anywhere pulls (the pouch is small on a phone): the pull is how far your finger has gone, a full pull at 110px.
  function pullDown(e) {
    var c = q('[data-tw-canvas]'), r = c.getBoundingClientRect(), pouch = toScreen(SLING.x, SLING.y);
    var touch = e.pointerType === 'touch' || e.pointerType === 'pen' && narrow();
    if (!touch && Math.hypot(e.clientX - r.left - pouch[0], e.clientY - r.top - pouch[1]) > 60) {
      say('<b>Grab the shot</b> in the slingshot\'s pouch and pull it back.');
      return false;
    }
    A.drag = { touch: touch, x0: e.clientX, y0: e.clientY };
    A.dragging = true;
    pullMove(e);
    return true;
  }
  function pullMove(e) {
    var D = A.drag, c = q('[data-tw-canvas]'), r = c.getBoundingClientRect(), x, y;
    if (D.touch) { x = (e.clientX - D.x0) * PULL / 110; y = (e.clientY - D.y0) * PULL / 110; } else {
      var w = toWorld(e.clientX - r.left, e.clientY - r.top);
      x = w[0] - SLING.x;
      y = w[1] - SLING.y;
    }
    A.pull = clampPull(x, y);
    kick();
  }
  function pullUp() {
    A.dragging = false;
    A.drag = null;
    twLaunch();
  }

  // ======================================================================== clicks, drags and keys
  document.addEventListener('click', function (e) {
    if (!live() || !A.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-ar-opt]')) && A.phase === 'ask') { choose(t); return; }
    if (e.target.closest('[data-ar-check]') && A.phase === 'ask') { check(false); return; }
    if (e.target.closest('[data-ar-pass]') && A.phase === 'ask') { check(true); return; }
    if (e.target.closest('[data-ar-go]') && A.then) { var then = A.then; A.then = null; then(); return; }
    if ((t = e.target.closest('[data-sea-x]')) && A.kind === 'sea') { seaShoot(+t.getAttribute('data-sea-x')); return; }
    if (e.target.closest('[data-sea-again]')) { seaOpen(); return; }
    if (e.target.closest('[data-cd-fire]')) { cdFire(); return; }
    if (e.target.closest('[data-cd-again]')) { cdOpen(); return; }
    if ((t = e.target.closest('[data-tw-level]'))) { twGo(+t.getAttribute('data-tw-level')); return; }
    if (e.target.closest('[data-tw-next]')) { twGo(A.level + 1); return; }
    if (e.target.closest('[data-tw-again]')) { twGo(A.level); return; }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!live() || A.phase !== 'aim' || A.paused || !e.target.closest) return;
    if (A.kind === 'cannon' && e.target.closest('.cd-sky')) { aimDown(e); e.preventDefault(); }
    else if (A.kind === 'tower' && e.target.closest('.tw-sky')) { if (pullDown(e)) e.preventDefault(); }
  });
  document.addEventListener('pointermove', function (e) {
    if (!live() || !A.dragging || A.phase !== 'aim') return;
    if (A.kind === 'cannon') aimMove(e); else pullMove(e);
  });
  function letGo() {
    if (!live() || !A.dragging) return;
    if (A.phase !== 'aim') { A.dragging = false; A.drag = null; return; }
    if (A.kind === 'cannon') aimUp(); else pullUp();
  }
  document.addEventListener('pointerup', letGo);
  document.addEventListener('pointercancel', function () { if (live() && A.dragging) { A.dragging = false; A.drag = null; if (A.kind === 'tower') A.pull = { x: 0, y: 0 }; kick(); } });
  document.addEventListener('keydown', function (e) {
    if (!live() || !e.target.closest) return;
    if (e.key === 'Enter' && !e.shiftKey && e.target.closest('[data-ar-text]')) { e.preventDefault(); if (A.phase === 'ask') check(false); return; }
    if (A.phase !== 'aim') return;
    var k = e.key;
    if (A.kind === 'cannon' && e.target.closest('[data-cd-canvas]')) {
      if (k === 'ArrowLeft' || k === 'ArrowRight') A.aim.angle = Math.max(0.05, Math.min(Math.PI - 0.05, A.aim.angle + (k === 'ArrowLeft' ? 0.035 : -0.035)));
      else if (k === 'ArrowUp' || k === 'ArrowDown') A.aim.power = Math.max(0.15, Math.min(1, A.aim.power + (k === 'ArrowUp' ? 0.02 : -0.02)));
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); cdFire(); return; } else return;
      e.preventDefault();
      A.ang[0] = A.angTo[0] = A.aim.angle;
      draw();
    } else if (A.kind === 'tower' && e.target.closest('[data-tw-canvas]')) {
      var p = A.pull || { x: 0, y: 0 }, d = 6;
      if (k === 'ArrowLeft') p.x -= d; else if (k === 'ArrowRight') p.x += d; else if (k === 'ArrowUp') p.y -= d; else if (k === 'ArrowDown') p.y += d;
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); twLaunch(); return; } else return;
      e.preventDefault();
      A.pull = clampPull(p.x, p.y);
      twDraw();
    }
  });
  window.addEventListener('resize', function () { if (live()) { BB.nearMascot(A.card); if (A.fit) A.fit(); } });
  var OPEN = { sea: seaOpen, cannon: cdOpen, tower: function () { if (window.Matter) twOpen(); } };
  window.BioArcade = {
    open: function (kind) { if (OPEN[kind]) OPEN[kind](); },
    state: function () { return A; },
    // For tools/bio/tests/arcade.mjs.
    test: { place: place, fire: fire, aim: aim, afloat: afloat, SEA: SEA, FLEET: FLEET, SALVO: SALVO, ANSWERS: ANSWERS, hills: hills, flight: flight, burst: burst, solve: solve, tower: tower, world: world, tick: tick, off: off, still: still, POS: POS, LAUNCH: LAUNCH, SLING: SLING, PULL: PULL, STEP: STEP, muzzle: muzzle, hisOffset: hisOffset, shotBody: shotBody, clampPull: clampPull }
  };
})();

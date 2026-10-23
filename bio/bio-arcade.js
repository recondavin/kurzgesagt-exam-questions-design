// Three more turn-at-a-time games against the examiner, in 2D (the user: "build them and angry birds", after picking
// battleships, an artillery duel and an Angry Birds-like game; pool and mini golf wait until they can be 3D). Each under
// its own name:
//   Sea Battle           Two fleets on 8x8 seas, a ship for each chapter. Answer your question right and you fire at
//                        his sea (a hit, and you answer again for another shot); wrong, it's his turn. He answers his
//                        own question out loud and fires when he gets it right, hunting round his hits.
//   Cannon Duel          Two cannons on the hills, the wind blowing. Answer right and you aim with the start of your
//                        shot's path drawn and the wind read out; wrong and you aim blind. Every third question is
//                        typed: right, a big shell. Shells dig craters; knock his health to nothing first.
//   Topple the Examiner  He sits on a tower of exam papers and desks. A right answer loads the slingshot (a typed one, a
//                        heavy textbook); knock him off within eight questions. A level for each chapter, its questions
//                        from that chapter, the towers growing. matter.js (bio/vendor/matter.min.js) does the physics.
// The questions are the trivia board's (BioBoard.pools), on its cards, which pop up over the field.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.pools) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours, INK = '#13294A';
  var A = null;
  function live() { return A && A.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return A.card.querySelector(sel); }
  function start(kind, label) {
    A = { kind: kind, card: BK.host(28, label), pools: BB.pools(), right: 0, asked: 0 };
    K.gameHud(A.card, 0, '');
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
  // The field (a sea, the hills, the tower) with the question layer over it, and the turn's line and buttons below.
  function stage(top, field) {
    return '<div class="ar">' + top + '<div class="ar-stage" data-ar-stage><div class="ar-field">' + field + '</div><div class="ar-ask" data-ar-ask hidden></div></div>' +
      '<div class="ar-turn"><p class="tb-say tb-turn" data-ar-say aria-live="polite"></p><div class="tb-row" data-ar-row></div></div></div>';
  }
  function say(html) { q('[data-ar-say]').innerHTML = html; }
  function row(html) { q('[data-ar-row]').innerHTML = html || ''; }
  function end(won, title, sub, again) {
    A.phase = 'over';
    show('<div class="am-games__end"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">' + title + '</h3>' +
      '<p class="am-games__sub">' + sub + (A.asked ? ' You got ' + A.right + ' of ' + A.asked + ' questions right.' : '') + '</p></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', again, 'Play again']]);
    if (won) K.later(K.fanfare, 300);
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
      '<p class="tb-ans"><span>Answer</span>' + esc(item.c.right) + '</p><p class="tb-why"><span>Why</span>' + esc(item.c.why) + '</p>';
  }
  function stamp(ok, text) { return '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + esc(text) + '</p>'; }
  function layer(html) {
    var l = q('[data-ar-ask]');
    l.innerHTML = html;
    l.hidden = false;
    q('[data-ar-stage]').classList.add('is-asking');
    into(l.querySelector('.tb-card'));
    return l;
  }
  function hideAsk() {
    var l = q('[data-ar-ask]');
    l.hidden = true;
    l.innerHTML = '';
    q('[data-ar-stage]').classList.remove('is-asking');
  }
  // Your question pops up over the field: pick the answer, or type it (marked like the answer sheet, needing the points
  // the check asks for). done(ok) once the answer and why are showing; the game then adds its button to go on.
  function ask(label, typed, ch, done) {
    var item = nextItem(ch, typed);
    A.item = item;
    A.typed = Boolean(typed && item.want);
    A.done = done;
    A.phase = 'ask';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(A.typed ? item.text : item.text.replace(/\s*\(\d points?\)$/, '')) + '</p>' + (A.typed
      ? '<textarea class="tb-text" data-ar-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-ar-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-ar-pass>I don\'t know</button></div>'
      : '<div class="tb-opts">' + shuffle([item.c.right].concat(item.c.wrong)).map(function (o) {
        return '<button type="button" class="tb-opt" data-ar-opt="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div>') + '<div class="qg-after" data-ar-after></div>'));
    var t = q('[data-ar-text]');
    if (t) t.focus({ preventScroll: true });
  }
  function choose(btn) {
    var item = A.item, mine = btn.getAttribute('data-ar-opt'), ok = mine === item.c.right;
    A.card.querySelectorAll('[data-ar-opt]').forEach(function (b) {
      var o = b.getAttribute('data-ar-opt');
      b.disabled = true;
      if (o === item.c.right) b.classList.add('is-ok');
      else if (o === mine) b.classList.add('is-no');
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
    q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'Correct' : 'Not quite') + answerHtml(A.item, mine);
    if (ok) K.ding(A.typed ? 4 : 2, true); else K.bonk();
    A.done(ok);
  }
  // His question: you see it, he thinks, then whether he got it (right odds of the time) and the answer either way.
  function hisAsk(label, odds, ch, done) {
    var item = nextItem(ch, false), ok = Math.random() < odds;
    A.phase = 'him';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(item.text.replace(/\s*\(\d points?\)$/, '')) + '</p><p class="tb-say tb-think">He thinks…</p><div class="qg-after" data-ar-after></div>'));
    wait(function () {
      var t = q('.tb-think');
      if (t) t.remove();
      q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'He got it' : 'He got it wrong') + answerHtml(item, '');
      K.mascot(ok ? 'happy' : 'angry', ok ? pick(['Obviously.', 'Too easy.']) : pick(['Hmph. A slip.', 'Badly worded.']));
      done(ok);
    }, 1300);
  }
  // The button under the answer to go on (to fire, or to the next turn).
  function go(label, then) {
    var r = document.createElement('div');
    r.className = 'tb-row tb-row--next';
    r.innerHTML = '<button type="button" class="tb-btn tb-btn--go" data-ar-go>' + label + '</button>';
    q('[data-ar-ask] .tb-card__body').appendChild(r);
    A.then = then;
    r.querySelector('button').focus({ preventScroll: true });
    into(r);
  }

  // ======================================================================== Sea Battle
  var SEA = 8, FLEET = [4, 3, 3, 2, 2], ROWS = 'ABCDEFGH';
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
  // A fleet: a ship for each chapter (4, 3, 3, 2 and 2 squares), none touching another, even at a corner.
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
      if (ok) return { ships: ships, at: at, shot: {} };
    }
  }
  function fire(sea, x) {
    sea.shot[x] = true;
    var s = sea.at[x];
    if (!s) return 'miss';
    var ship = sea.ships[s - 1];
    ship.hits += 1;
    return ship.hits === ship.cells.length ? 'sunk' : 'hit';
  }
  function sunk(ship) { return ship.hits === ship.cells.length; }
  function afloat(sea) { return sea.ships.filter(function (s) { return !sunk(s); }).length; }
  // Where he fires: along the line of a ship he's hit twice, round one he's hit once, otherwise every other square.
  function aim(sea, rand) {
    var open = function (x) { return !sea.shot[x]; };
    var hurt = sea.ships.filter(function (s) { return s.hits && !sunk(s); })[0];
    if (hurt) {
      var hits = hurt.cells.filter(function (x) { return sea.shot[x]; }).sort(function (a, b) { return a - b; }), cand = [];
      if (hits.length > 1) {
        var across = Math.floor(hits[0] / SEA) === Math.floor(hits[1] / SEA), lo = hits[0], hi = hits[hits.length - 1], step = across ? 1 : SEA;
        [lo - step, hi + step].forEach(function (x) {
          if (x >= 0 && x < SEA * SEA && (!across || Math.floor(x / SEA) === Math.floor(lo / SEA)) && open(x)) cand.push(x);
        });
      }
      if (!cand.length) hits.forEach(function (h) { around(h, false).forEach(function (n) { if (open(n) && cand.indexOf(n) < 0) cand.push(n); }); });
      if (cand.length) return cand[Math.floor(rand() * cand.length)];
    }
    var free = [], any = [];
    for (var x = 0; x < SEA * SEA; x++) {
      if (!open(x)) continue;
      any.push(x);
      if ((Math.floor(x / SEA) + x % SEA) % 2 === 0) free.push(x);
    }
    var list = free.length ? free : any;
    return list[Math.floor(rand() * list.length)];
  }
  function cellName(x) { return ROWS[Math.floor(x / SEA)] + (x % SEA + 1); }
  function seaGrid(who, last) {
    var sea = A[who], mine = who === 'mine', cells = '';
    for (var x = 0; x < SEA * SEA; x++) {
      var s = sea.at[x], ship = s && sea.ships[s - 1], shot = sea.shot[x], show = ship && (mine || sunk(ship));
      var cls = 'sea-c' + (show ? ' is-ship' : '') + (shot ? (s ? ' is-hit' : ' is-miss') : '') + (ship && sunk(ship) ? ' is-sunk' : '') + (x === last ? ' is-new' : '');
      var style = show ? ' style="--c:' + COL[ship.ch] + '"' : '';
      cells += mine || shot
        ? '<span class="' + cls + '"' + style + ' role="gridcell" aria-label="' + cellName(x) + (shot ? (s ? ' hit' : ' miss') : '') + '"><i></i></span>'
        : '<button type="button" class="' + cls + '" data-sea-x="' + x + '" role="gridcell" aria-label="Fire at ' + cellName(x) + '"><i></i></button>';
    }
    return '<div class="sea-side sea-side--' + who + '"><p class="sea-name">' + (mine ? 'Your fleet' : 'His sea') + '<span class="num">' + afloat(sea) + ' of 5 afloat</span></p>' +
      '<div class="sea-wrap"><span></span><span class="sea-cols" aria-hidden="true">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<i>' + n + '</i>'; }).join('') + '</span>' +
      '<span class="sea-rows" aria-hidden="true">' + ROWS.split('').map(function (l) { return '<i>' + l + '</i>'; }).join('') + '</span>' +
      '<div class="sea-grid" role="grid" data-sea="' + who + '">' + cells + '</div></div>' +
      '<ul class="sea-key">' + sea.ships.map(function (sh) { return '<li class="' + (sunk(sh) ? 'is-sunk' : '') + '" style="--c:' + COL[sh.ch] + '">' + esc(NAME[sh.ch]) + '</li>'; }).join('') + '</ul></div>';
  }
  function seaDraw(who, last) {
    var side = q('.sea-side--' + who);
    side.outerHTML = seaGrid(who, last);
  }
  function seaOpen() {
    start('sea', 'Sea Battle');
    A.mine = place(Math.random);
    A.his = place(Math.random);
    A.run = 0;
    show(stage('', '<div class="sea">' + seaGrid('his') + seaGrid('mine') + '</div>'));
    K.mascot('happy', 'My fleet. Your guesses. Go on.');
    seaYours();
  }
  function seaYours() {
    A.turn = 0;
    say('<b>Your turn.</b> Answer to fire.');
    row('');
    ask('Your shot', false, null, function (ok) {
      if (ok) go('Fire', function () { hideAsk(); A.phase = 'aim'; q('.sea-side--his').classList.add('is-aiming'); say('<b>Pick a square</b> on his sea.'); });
      else { K.mascot('happy', 'No shot for you.'); go('His turn', function () { hideAsk(); seaHis(); }); }
    });
  }
  function seaShoot(x) {
    if (A.phase !== 'aim' || A.his.shot[x]) return;
    A.phase = 'boom';
    var r = fire(A.his, x), ship = A.his.ships[(A.his.at[x] || 1) - 1];
    seaDraw('his', x);
    if (r === 'miss') {
      say('<b>' + cellName(x) + ': miss.</b> His turn.');
      K.mascot('happy', 'Splash. Nothing.');
      wait(seaHis, 1300);
      return;
    }
    K.ding(3, true);
    if (!afloat(A.his)) { wait(function () { seaEnd(true); }, 1200); return; }
    say(r === 'sunk' ? '<b>You sank his ' + esc(NAME[ship.ch]) + ' ship!</b> Answer again to fire again.' : '<b>' + cellName(x) + ': hit!</b> Answer again to fire again.');
    K.mascot('angry', r === 'sunk' ? 'Hmph. One ship.' : 'A scratch.');
    wait(seaYours, 1300);
  }
  // His turn: his question first; right, he fires (and goes again after a hit, three shots at most).
  function seaHis() {
    A.turn = 1;
    say('<b>His turn.</b>');
    row('');
    hisAsk('His shot', 0.6, null, function (ok) {
      if (!ok) { A.run = 0; go('Your turn', function () { hideAsk(); seaYours(); }); return; }
      go('Watch him fire', function () {
        hideAsk();
        var x = aim(A.mine, Math.random), r = fire(A.mine, x), ship = A.mine.ships[(A.mine.at[x] || 1) - 1];
        seaDraw('mine', x);
        into(q('.sea-side--mine'));
        if (r === 'miss') { A.run = 0; say('He fired at <b>' + cellName(x) + '</b>: miss.'); wait(seaYours, 1500); return; }
        K.bonk();
        if (!afloat(A.mine)) { wait(function () { seaEnd(false); }, 1200); return; }
        say(r === 'sunk' ? 'He sank your <b>' + esc(NAME[ship.ch]) + '</b> ship.' : 'He fired at <b>' + cellName(x) + '</b>: hit.');
        A.run += 1;
        if (A.run < 3) { say(q('[data-ar-say]').innerHTML + ' He goes again.'); wait(seaHis, 1600); } else { A.run = 0; wait(seaYours, 1600); }
      });
    });
  }
  function seaEnd(won) {
    var wins = +(K.store('bio-sea-wins') || 0) + (won ? 1 : 0);
    if (won) K.store('bio-sea-wins', String(wins));
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. My whole fleet.' : 'Sunk. All of them. Again?');
    end(won, won ? 'You sank his fleet!' : 'He sank your fleet.', won ? 'Games won: ' + wins + '.' : 'His fleet still had ' + afloat(A.his) + ' of 5 ships afloat.', 'data-sea-again');
  }

  // ======================================================================== Cannon Duel
  var CW = 1000, CHH = 500, GRAV = 420, SPEED = 760, POS = [110, 890];
  // The hills: a big one in the middle and rolling ground, flat where the cannons stand.
  function hills(rand) {
    var h = [], big = 110 + rand() * 70, p1 = rand() * 6.3, p2 = rand() * 6.3;
    for (var x = 0; x <= CW; x++) {
      var t = x / CW, y = 410 - big * Math.exp(-Math.pow((t - 0.5) / 0.15, 2)) - 22 * Math.sin(t * 12.6 + p1) - 12 * Math.sin(t * 31 + p2);
      h.push(Math.max(190, Math.min(470, y)));
    }
    POS.forEach(function (px) { var y = h[px]; for (var d = -24; d <= 24; d++) h[px + d] = y; });
    return h;
  }
  // A shell's flight from (x, y) at an angle (radians, 0 = right, up is positive) and power (0 to 1) with the wind
  // (pushing right if positive): its path (every third step), where it stops, and who it hit directly.
  function flight(h, tanks, x, y, angle, power, wind) {
    var vx = Math.cos(angle) * power * SPEED, vy = -Math.sin(angle) * power * SPEED, dt = 1 / 120, path = [];
    for (var i = 0; i < 3000; i++) {
      vx += wind * dt;
      vy += GRAV * dt;
      x += vx * dt;
      y += vy * dt;
      if (i % 3 === 0) path.push([x, y]);
      if (x < -60 || x > CW + 60 || y > CHH + 60) return { path: path, x: x, y: y, out: true };
      for (var p = 0; p < tanks.length; p++) {
        if (i > 8 && Math.hypot(x - tanks[p].x, y - (tanks[p].y - 10)) < 17) return { path: path, x: x, y: y, direct: p };
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
      var d = Math.hypot(f.x - t.x, f.y - (t.y - 10)), most = big ? 60 : 40;
      var dmg = f.out ? 0 : f.direct === p ? most : d < R + 14 ? Math.round(most * (1 - d / (R + 14)) * 0.9) : 0;
      hurt.push(dmg);
      t.hp = Math.max(0, t.hp - dmg);
      t.y = h[t.x];
    });
    return hurt;
  }
  // His aim: the angle and power that land nearest you (tried across the sky, through the wind and over the hill), then
  // off a little if he got his question right and a lot if he got it wrong.
  function solve(h, tanks, wind, good, rand) {
    var me = tanks[1], you = tanks[0], best = null;
    for (var a = 100; a <= 170; a += 3) {
      for (var pw = 0.2; pw <= 1.001; pw += 0.02) {
        var f = flight(h, tanks, me.x, me.y - 14, a * Math.PI / 180, pw, wind), miss = f.direct === 0 ? 0 : f.out ? 9999 : Math.abs(f.x - you.x);
        if (!best || miss < best.miss) best = { a: a, pw: pw, miss: miss };
      }
    }
    var n = function () { return (rand() + rand() + rand() - 1.5) / 1.5; };
    return { angle: (best.a + n() * (good ? 1.2 : 5)) * Math.PI / 180, power: Math.max(0.15, Math.min(1, best.pw * (1 + n() * (good ? 0.025 : 0.1)))) };
  }
  function cdOpen() {
    start('cannon', 'Cannon Duel');
    A.h = hills(Math.random);
    A.tanks = POS.map(function (x) { return { x: x, y: A.h[x], hp: 100 }; });
    A.aim = { angle: 50 * Math.PI / 180, power: 0.7 };
    A.hisAngle = 130 * Math.PI / 180;
    A.turns = 0;
    show(stage('<div class="cd-hp">' + ['You', 'Examiner'].map(function (n, p) {
      return '<div class="cd-hp__one cd-hp__one--' + p + '"><b>' + n + '</b><span class="cd-hp__bar"><i data-cd-hp="' + p + '"></i></span><span class="num" data-cd-hpn="' + p + '">100</span></div>';
    }).join('') + '<p class="cd-wind" data-cd-wind></p></div>',
    '<div class="cd-sky"><canvas class="cd-canvas" data-cd-canvas width="1000" height="500" tabindex="0" aria-label="The hills: drag to aim, let go to fire"></canvas>' +
      '<span class="cd-you" data-cd-tag="0">You</span><span class="cd-him" data-cd-tag="1" aria-hidden="true">' + K.face + '</span></div>'));
    size();
    K.mascot('happy', 'Two cannons. One winner. Me.');
    cdYours();
  }
  function hp() {
    A.tanks.forEach(function (t, p) {
      q('[data-cd-hp="' + p + '"]').style.width = t.hp + '%';
      q('[data-cd-hpn="' + p + '"]').textContent = t.hp;
    });
  }
  function windText(known) {
    var w = Math.round(A.wind / 10);
    q('[data-cd-wind]').innerHTML = known ? 'Wind <b>' + (w === 0 ? 'calm' : (w < 0 ? '← ' : '') + Math.abs(w) + (w > 0 ? ' →' : '')) + '</b>' : 'Wind <b>?</b>';
  }
  function cdYours() {
    A.turn = 0;
    A.turns += 1;
    A.wind = (Math.random() * 2 - 1) * 70;
    A.guide = false;
    A.big = false;
    windText(false);
    say('<b>Your turn.</b> Answer for a good shot.');
    var typed = A.turns % 3 === 0;
    ask(typed ? 'Big shell question' : 'Your shot', typed, null, function (ok) {
      A.guide = ok;
      A.big = ok && A.typed;
      K.mascot(ok ? 'angry' : 'happy', ok ? 'Hmph. Aim, then.' : 'Wrong. Fire blind.');
      go(ok ? (A.big ? 'Load the big shell' : 'Aim') : 'Aim blind', function () {
        hideAsk();
        A.phase = 'aim';
        windText(A.guide);
        say(A.guide ? '<b>Drag to aim</b>, let go to fire. The dots show the start of your shot.' : '<b>Drag to aim</b>, let go to fire. No help this time.');
        row('<button type="button" class="tb-btn tb-btn--go" data-cd-fire>Fire</button>');
        draw();
        q('[data-cd-canvas]').focus({ preventScroll: true });
      });
    });
  }
  function cdFire() {
    if (A.phase !== 'aim') return;
    A.phase = 'flying';
    row('');
    var t = A.tanks[0];
    shoot(0, flight(A.h, A.tanks, t.x, t.y - 14, A.aim.angle, A.aim.power, A.wind), A.big, cdHis);
  }
  function cdHis() {
    A.turn = 1;
    A.wind = (Math.random() * 2 - 1) * 70;
    windText(true);
    say('<b>His turn.</b>');
    hisAsk('His shot', 0.65, null, function (ok) {
      go('Watch him fire', function () {
        hideAsk();
        A.phase = 'flying';
        var me = A.tanks[1], s = solve(A.h, A.tanks, A.wind, ok, Math.random);
        A.hisAngle = s.angle;
        draw();
        wait(function () { shoot(1, flight(A.h, A.tanks, me.x, me.y - 14, s.angle, s.power, A.wind), false, cdYours); }, 500);
      });
    });
  }
  // The shell flies, bursts, digs its crater and hurts whoever's near; then the next turn (or the end).
  function shoot(who, f, big, then) {
    var i = 0;
    A.shell = { path: f.path, at: 0, big: big };
    (function step() {
      if (!live()) return;
      A.shell.at = i;
      draw();
      if ((i += 1) < f.path.length) { requestAnimationFrame(step); return; }
      A.shell = null;
      var hurt = burst(A.h, A.tanks, f, big);
      A.boom = { x: f.x, y: f.y, r: big ? 60 : 38, t: 0 };
      (function bloom() {
        if (!live() || !A.boom) return;
        A.boom.t += 1;
        draw();
        if (A.boom.t < 18) requestAnimationFrame(bloom); else { A.boom = null; draw(); }
      })();
      hp();
      var other = 1 - who;
      if (hurt[other]) { if (who) K.bonk(); else K.ding(3, true); }
      say(f.out ? (who ? 'His shot flew off the hills.' : 'Your shot flew off the hills.') : hurt[other] ? (who ? 'He hit you: <b>−' + hurt[other] + '</b>.' : 'You hit him: <b>−' + hurt[other] + '</b>!') + (hurt[who] ? ' (And ' + (who ? 'himself' : 'yourself') + ': −' + hurt[who] + '.)' : '') : (who ? 'He missed.' : 'You missed.'));
      if (!who && hurt[1]) K.mascot('angry', pick(['Ow. Hmph.', 'Lucky shot.']));
      if (who && hurt[0]) K.mascot('happy', pick(['Direct hit. Obviously.', 'Bullseye.']));
      var dead = A.tanks.map(function (t) { return t.hp <= 0; });
      if (dead[0] || dead[1]) { wait(function () { cdEnd(!dead[0]); }, 1400); return; }
      wait(then, 1500);
    })();
  }
  function cdEnd(won) {
    var wins = +(K.store('bio-cannon-wins') || 0) + (won ? 1 : 0);
    if (won) K.store('bio-cannon-wins', String(wins));
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. My cannon was faulty.' : 'Boom. Again?');
    end(won, won ? 'You knocked him out!' : 'He knocked you out.', won ? 'Games won: ' + wins + '.' : 'He had ' + A.tanks[1].hp + ' health left.', 'data-cd-again');
  }
  // The canvas is drawn in the world's 1000x500 units at the screen's sharpness.
  function size() {
    var c = q('[data-cd-canvas]') || q('[data-tw-canvas]');
    if (!c) return;
    var w = c.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w) return;
    c.width = Math.round(w * dpr);
    c.height = Math.round(w / 2 * dpr);
    if (A.kind === 'cannon') draw(); else if (A.kind === 'tower') twDraw();
  }
  function ctx2(c, W) { var g = c.getContext('2d'); g.setTransform(c.width / W, 0, 0, c.width / W, 0, 0); return g; }
  function draw() {
    var c = q('[data-cd-canvas]');
    if (!c) return;
    var g = ctx2(c, CW);
    g.fillStyle = '#1B3346';
    g.fillRect(0, 0, CW, CHH);
    g.beginPath();
    g.moveTo(0, CHH);
    A.h.forEach(function (y, x) { g.lineTo(x, y); });
    g.lineTo(CW, CHH);
    g.closePath();
    g.fillStyle = '#C8A26B';
    g.fill();
    g.lineWidth = 5;
    g.strokeStyle = '#8A6A3E';
    g.beginPath();
    A.h.forEach(function (y, x) { if (x) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
    // The cannons, a third bigger than their size in the world so they read on a phone.
    A.tanks.forEach(function (t, p) {
      var ang = p ? A.hisAngle : A.aim.angle;
      g.save();
      g.translate(t.x, t.y);
      g.scale(1.35, 1.35);
      g.lineCap = 'round';
      g.strokeStyle = INK;
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(0, -14);
      g.lineTo(Math.cos(ang) * 28, -14 - Math.sin(ang) * 28);
      g.stroke();
      g.fillStyle = p ? '#F1F7FB' : '#1CB0F6';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(0, -12, 13, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
      g.beginPath();
      g.roundRect(-24, -14, 48, 14, 6);
      g.fill();
      g.stroke();
      g.restore();
    });
    // Your aim: an arrow out of your cannon as long as the power, and with a right answer the start of the shell's path.
    if (A.phase === 'aim') {
      var t = A.tanks[0], a = A.aim.angle, len = 40 + A.aim.power * 90, ex = t.x + Math.cos(a) * len, ey = t.y - 14 - Math.sin(a) * len;
      g.strokeStyle = '#FFFFFF';
      g.lineWidth = 4;
      g.setLineDash([10, 8]);
      g.beginPath();
      g.moveTo(t.x, t.y - 14);
      g.lineTo(ex, ey);
      g.stroke();
      g.setLineDash([]);
      if (A.guide) {
        var f = flight(A.h, A.tanks, t.x, t.y - 14, a, A.aim.power, A.wind), n = Math.floor(f.path.length * 0.4);
        g.fillStyle = '#FFE14D';
        for (var i = 2; i < n; i += 2) { g.beginPath(); g.arc(f.path[i][0], f.path[i][1], 4, 0, 6.3); g.fill(); }
      }
      g.fillStyle = '#FFFFFF';
      g.font = '800 22px Nunito, sans-serif';
      g.fillText(Math.round(A.aim.power * 100) + '%', Math.min(CW - 70, ex + 10), Math.max(24, ey - 8));
    }
    if (A.shell) {
      var pth = A.shell.path, k = A.shell.at;
      g.fillStyle = 'rgba(255,255,255,.35)';
      for (var j = Math.max(0, k - 30); j < k; j += 3) { g.beginPath(); g.arc(pth[j][0], pth[j][1], 2.5, 0, 6.3); g.fill(); }
      g.fillStyle = '#FFFFFF';
      g.strokeStyle = INK;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(pth[k][0], pth[k][1], A.shell.big ? 9 : 6, 0, 6.3);
      g.fill();
      g.stroke();
    }
    if (A.boom) {
      g.fillStyle = 'rgba(255,150,0,' + (1 - A.boom.t / 18) + ')';
      g.beginPath();
      g.arc(A.boom.x, A.boom.y, A.boom.r * (0.4 + A.boom.t / 30), 0, 6.3);
      g.fill();
    }
    // Your label and his face ride on the cannons (HTML over the canvas, so his face is the site's drawing).
    A.tanks.forEach(function (t, p) {
      var tag = q('[data-cd-tag="' + p + '"]');
      if (tag) { tag.style.left = (t.x / CW * 100) + '%'; tag.style.top = ((t.y - (p ? 46 : 52)) / CHH * 100) + '%'; }
    });
  }
  function aimAt(e) {
    var c = q('[data-cd-canvas]'), r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * CW, y = (e.clientY - r.top) / r.height * CHH, t = A.tanks[0];
    var dx = x - t.x, dy = t.y - 14 - y;
    if (Math.hypot(dx, dy) < 8) return;
    A.aim.angle = Math.max(0.05, Math.min(Math.PI - 0.05, Math.atan2(Math.max(dy, 1), dx)));
    A.aim.power = Math.max(0.15, Math.min(1, Math.hypot(dx, dy) / 320));
    draw();
  }

  // ======================================================================== Topple the Examiner
  var TW = 1000, TH = 500, GROUND = 470, SLING = { x: 170, y: 352 }, PULL = 110, QUESTIONS = 8, LAUNCH = 0.17;
  // The towers, a level for each chapter, bottom up: desk legs (tall), desks (long and thin) and stacks of papers (square).
  // [x, bottom, w, h, kind]: x is the middle; he sits on the top.
  function tower(level) {
    var out = [], top = GROUND;
    function leg(x, b, h) { out.push([x, b, 20, h, 'desk']); return b - h; }
    function desk(x, b, w) { out.push([x, b, w, 16, 'desk']); return b - 16; }
    function paper(x, b, n, s) { for (var i = 0; i < n; i++) out.push([x, b - i * s, s, s, 'paper']); return b - n * s; }
    if (level === 0) {
      leg(700, GROUND, 90); top = leg(820, GROUND, 90);
      top = desk(760, top, 170);
    } else if (level === 1) {
      leg(680, GROUND, 80); top = leg(840, GROUND, 80);
      top = desk(760, top, 210);
      paper(705, top, 2, 36); top = paper(815, top, 2, 36);
      top = desk(760, top, 170);
    } else if (level === 2) {
      [0, 1, 2, 3, 4].forEach(function (i) { paper(680 + i * 40, GROUND, 1, 40); });
      [0, 1, 2, 3].forEach(function (i) { paper(700 + i * 40, GROUND - 40, 1, 40); });
      [0, 1, 2].forEach(function (i) { paper(720 + i * 40, GROUND - 80, 1, 40); });
      top = desk(760, GROUND - 120, 150);
      paper(560, GROUND, 3, 36);
    } else if (level === 3) {
      leg(660, GROUND, 90); leg(760, GROUND, 90); top = leg(860, GROUND, 90);
      top = desk(760, top, 240);
      leg(700, top, 80); top = leg(820, top, 80);
      top = desk(760, top, 170);
      paper(570, GROUND, 4, 36);
    } else {
      [0, 1, 2, 3, 4].forEach(function (i) { paper(680 + i * 40, GROUND, 1, 40); });
      [0, 1, 2, 3].forEach(function (i) { paper(700 + i * 40, GROUND - 40, 1, 40); });
      top = desk(760, GROUND - 80, 190);
      leg(700, top, 80); top = leg(820, top, 80);
      top = desk(760, top, 170);
      paper(560, GROUND, 4, 36); paper(600, GROUND, 2, 36);
    }
    return { blocks: out, top: top };
  }
  // The world for a level: the ground, the tower's blocks and him on top (circle, radius 24).
  function world(level) {
    var M = window.Matter, eng = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 }), t = tower(level);
    var ground = M.Bodies.rectangle(TW / 2, GROUND + 40, TW * 3, 80, { isStatic: true, label: 'ground', friction: 0.9 });
    var blocks = t.blocks.map(function (b) {
      return M.Bodies.rectangle(b[0], b[1] - b[3] / 2, b[2], b[3], { label: b[4], density: b[4] === 'paper' ? 0.002 : 0.0015, friction: 0.7, frictionStatic: 1, restitution: 0.02 });
    });
    var him = M.Bodies.circle(760, t.top - 24, 24, { label: 'him', density: 0.0012, friction: 0.8, frictionStatic: 1, restitution: 0.05 });
    M.Composite.add(eng.world, [ground].concat(blocks, [him]));
    return { eng: eng, him: him, blocks: blocks, startY: him.position.y, shots: [] };
  }
  function tick(w, n) { for (var i = 0; i < (n || 1); i++) window.Matter.Engine.update(w.eng, 1000 / 180); }
  function off(w) { var p = w.him.position; return p.y > w.startY + 70 || p.x < -40 || p.x > TW + 40; }
  function still(w) {
    return window.Matter.Composite.allBodies(w.eng.world).every(function (b) { return b.isStatic || b.isSleeping || b.speed < 0.12 && b.angularSpeed < 0.01; });
  }
  function twOpen() {
    start('tower', 'Topple the Examiner');
    var open = Math.max(1, +(K.store('bio-tower-level') || 1));
    show('<div class="am-games__end tw-start"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">Topple the Examiner</h3>' +
      '<p class="am-games__sub">He\'s sitting on a tower of exam papers. Each right answer gives you a shot with the slingshot; a typed one, a heavy textbook. Knock him off within ' + QUESTIONS + ' questions.</p>' +
      '<div class="dsi-chs">' + CH.map(function (ch, i) {
        var best = K.store('bio-tower-best-' + i), locked = i + 1 > open;
        return '<button type="button" class="tb-pick" data-tw-level="' + i + '" style="--c:' + COL[ch] + '"' + (locked ? ' disabled' : '') + '><span class="tb-pick__dir">Level ' + (i + 1) + '</span><span class="tb-pick__ch">' + esc(NAME[ch]) + '</span>' +
          '<span class="tb-pick__what">' + (locked ? 'Beat level ' + i + ' first' : best ? 'Done in ' + best + ' questions' : 'Not done yet') + '</span></button>';
      }).join('') + '</div></div>');
    K.mascot('happy', 'Up here? You\'ll never reach me.');
  }
  function twGo(level) {
    if (!window.Matter) return;
    A.level = level;
    A.ch = CH[level];
    A.qs = 0;
    A.w = world(level);
    tick(A.w, 240);
    A.w.startY = A.w.him.position.y;
    A.pull = null;
    A.toppled = false;
    A.trail = null;
    show(stage('<p class="tw-top"><b>Level ' + (level + 1) + ': ' + esc(NAME[A.ch]) + '</b><span data-tw-left></span></p>',
      '<div class="tw-sky"><canvas class="tw-canvas" data-tw-canvas width="1000" height="500" tabindex="0" aria-label="The tower: drag the slingshot back and let go"></canvas>' +
      '<span class="tw-him" data-tw-him aria-hidden="true">' + K.face + '</span></div>'));
    size();
    twDraw();
    twNext();
  }
  function twLeft() { q('[data-tw-left]').textContent = (QUESTIONS - A.qs) + ' question' + (QUESTIONS - A.qs === 1 ? '' : 's') + ' left'; }
  function twNext() {
    if (A.qs >= QUESTIONS) { twEnd(false); return; }
    A.qs += 1;
    twLeft();
    var typed = A.qs % 3 === 0;
    say('Answer to load the slingshot.');
    row('');
    ask(typed ? 'Textbook question' : 'Question ' + A.qs + ' of ' + QUESTIONS, typed, A.ch, function (ok) {
      A.heavy = ok && A.typed;
      if (!ok) { K.mascot('happy', 'No shot. Ha.'); go(A.qs >= QUESTIONS ? 'See how you did' : 'Next question', function () { hideAsk(); twNext(); }); return; }
      K.mascot('angry', A.heavy ? 'Not the textbook!' : 'Hmph. One shot.');
      go(A.heavy ? 'Load the textbook' : 'Load the slingshot', function () {
        hideAsk();
        A.phase = 'aim';
        A.pull = { x: 0, y: 0 };
        say('<b>Drag the shot back</b> and let go.');
        twDraw();
        q('[data-tw-canvas]').focus({ preventScroll: true });
      });
    });
  }
  function twLaunch() {
    var M = window.Matter, p = A.pull;
    if (A.phase !== 'aim' || !p || Math.hypot(p.x, p.y) < 15) return;
    A.phase = 'flying';
    var x = SLING.x + p.x, y = SLING.y + p.y;
    var shot = A.heavy
      ? M.Bodies.rectangle(x, y, 44, 32, { label: 'book', density: 0.009, friction: 0.6, restitution: 0.1 })
      : M.Bodies.circle(x, y, 14, { label: 'ball', density: 0.004, friction: 0.5, restitution: 0.3 });
    M.Composite.add(A.w.eng.world, shot);
    M.Body.setVelocity(shot, { x: -p.x * LAUNCH, y: -p.y * LAUNCH });
    A.w.shots.push(shot);
    A.pull = null;
    A.trail = [];
    say('');
    var frames = 0, calm = 0;
    (function run() {
      if (!live()) return;
      tick(A.w, 3);
      frames += 1;
      if (frames % 3 === 0) A.trail.push([shot.position.x, shot.position.y]);
      twDraw();
      calm = still(A.w) ? calm + 1 : 0;
      if (off(A.w) && !A.toppled) { A.toppled = true; K.mascot('furious', 'Whoa!'); }
      if (calm < 20 && frames < 60 * 9) { requestAnimationFrame(run); return; }
      if (A.toppled || off(A.w)) { twEnd(true); return; }
      // The shot's done: it's cleared away for the next one.
      A.w.shots.forEach(function (s) { M.Composite.remove(A.w.eng.world, s); });
      A.w.shots = [];
      twDraw();
      K.mascot('happy', pick(['Still here.', 'Missed me.', 'Is that all?']));
      wait(twNext, 600);
    })();
  }
  function twEnd(won) {
    A.toppled = false;
    var lv = A.level;
    if (won) {
      var best = +(K.store('bio-tower-best-' + lv) || 0);
      if (!best || A.qs < best) K.store('bio-tower-best-' + lv, String(A.qs));
      if (+(K.store('bio-tower-level') || 1) < lv + 2) K.store('bio-tower-level', String(Math.min(CH.length, lv + 2)));
    }
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. I was getting down anyway.' : 'Still up here. Try again.');
    end(won, won ? 'He\'s off the tower!' : 'He\'s still up there.', won ? 'Level ' + (lv + 1) + ' done in ' + A.qs + ' questions.' : 'Out of questions for level ' + (lv + 1) + '.', won && lv + 1 < CH.length ? 'data-tw-next' : 'data-tw-again');
    if (won && lv + 1 < CH.length) q('[data-tw-next]').textContent = 'Next level';
    else if (!won) q('[data-tw-again]').textContent = 'Try again';
  }
  function twDraw() {
    var c = q('[data-tw-canvas]');
    if (!c || !A.w) return;
    var g = ctx2(c, TW), M = window.Matter;
    g.fillStyle = '#1B3346';
    g.fillRect(0, 0, TW, TH);
    g.fillStyle = '#2B3B42';
    g.fillRect(0, GROUND, TW, TH - GROUND);
    g.fillStyle = '#4B5B62';
    g.fillRect(0, GROUND, TW, 5);
    // The slingshot: its stem and two prongs; the band back to the shot while you pull.
    var px = SLING.x, py = SLING.y, sx = px + (A.pull ? A.pull.x : 0), sy = py + (A.pull ? A.pull.y : 0);
    g.lineCap = 'round';
    g.strokeStyle = '#8A6A3E';
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(px, GROUND);
    g.lineTo(px, py + 30);
    g.lineTo(px - 16, py - 4);
    g.moveTo(px, py + 30);
    g.lineTo(px + 16, py - 4);
    g.stroke();
    if (A.pull) {
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(px - 16, py - 4);
      g.lineTo(sx, sy);
      g.lineTo(px + 16, py - 4);
      g.stroke();
      shotShape(g, sx, sy, 0, A.heavy);
    }
    if (A.trail) {
      g.fillStyle = 'rgba(255,255,255,.4)';
      A.trail.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 3, 0, 6.3); g.fill(); });
    }
    M.Composite.allBodies(A.w.eng.world).forEach(function (b) {
      if (b.label === 'ground' || b.label === 'him') return;
      if (b.label === 'ball' || b.label === 'book') { shotShape(g, b.position.x, b.position.y, b.angle, b.label === 'book'); return; }
      g.beginPath();
      b.vertices.forEach(function (v, i) { if (i) g.lineTo(v.x, v.y); else g.moveTo(v.x, v.y); });
      g.closePath();
      g.fillStyle = b.label === 'paper' ? '#FFFDF6' : COL[A.ch];
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.stroke();
      // A stack of papers shows its sheets.
      if (b.label === 'paper') {
        g.save();
        g.translate(b.position.x, b.position.y);
        g.rotate(b.angle);
        g.strokeStyle = '#B9C7CF';
        g.lineWidth = 1.5;
        [-8, 0, 8].forEach(function (y) { g.beginPath(); g.moveTo(-14, y); g.lineTo(14, y); g.stroke(); });
        g.restore();
      }
    });
    var h = q('[data-tw-him]'), p = A.w.him.position;
    if (h) { h.style.left = (p.x / TW * 100) + '%'; h.style.top = (p.y / TH * 100) + '%'; h.style.transform = 'translate(-50%, -50%) rotate(' + A.w.him.angle + 'rad)'; }
  }
  // A paper ball, or a textbook in the chapter's colour.
  function shotShape(g, x, y, a, book) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    if (book) {
      g.fillStyle = COL[A.ch];
      g.fillRect(-22, -16, 44, 32);
      g.strokeRect(-22, -16, 44, 32);
      g.fillStyle = '#FFFDF6';
      g.fillRect(-16, -16, 34, 6);
    } else {
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      g.arc(0, 0, 14, 0, 6.3);
      g.fill();
      g.stroke();
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-7, -4);
      g.lineTo(3, 2);
      g.lineTo(6, -6);
      g.moveTo(-4, 7);
      g.lineTo(5, 5);
      g.stroke();
    }
    g.restore();
  }
  function twPullTo(e) {
    var c = q('[data-tw-canvas]'), r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * TW - SLING.x, y = (e.clientY - r.top) / r.height * TH - SLING.y, d = Math.hypot(x, y);
    if (d > PULL) { x = x / d * PULL; y = y / d * PULL; }
    A.pull = { x: x, y: y };
    twDraw();
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
  // Aiming: on the hills you point where to shoot (further means more power); at the slingshot you pull the shot back
  // (the further, the harder) and let go.
  var dragging = false;
  document.addEventListener('pointerdown', function (e) {
    if (!live() || A.phase !== 'aim' || !e.target.closest) return;
    if (e.target.closest('[data-cd-canvas]')) { dragging = true; aimAt(e); e.preventDefault(); }
    else if (e.target.closest('[data-tw-canvas]')) { dragging = true; twPullTo(e); e.preventDefault(); }
  });
  document.addEventListener('pointermove', function (e) {
    if (!dragging || !live() || A.phase !== 'aim') return;
    if (A.kind === 'cannon') aimAt(e); else twPullTo(e);
  });
  document.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false;
    if (!live() || A.phase !== 'aim') return;
    if (A.kind === 'cannon') cdFire(); else twLaunch();
  });
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
      draw();
    } else if (A.kind === 'tower' && e.target.closest('[data-tw-canvas]')) {
      var p = A.pull || { x: 0, y: 0 }, d = 6;
      if (k === 'ArrowLeft') p.x -= d; else if (k === 'ArrowRight') p.x += d; else if (k === 'ArrowUp') p.y -= d; else if (k === 'ArrowDown') p.y += d;
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); twLaunch(); return; } else return;
      e.preventDefault();
      var len = Math.hypot(p.x, p.y);
      if (len > PULL) { p.x = p.x / len * PULL; p.y = p.y / len * PULL; }
      A.pull = p;
      twDraw();
    }
  });
  window.addEventListener('resize', function () { if (live()) { BB.nearMascot(A.card); size(); } });
  var OPEN = { sea: seaOpen, cannon: cdOpen, tower: function () { if (window.Matter) twOpen(); } };
  window.BioArcade = {
    open: function (kind) { if (OPEN[kind]) OPEN[kind](); },
    state: function () { return A; },
    // For tools/bio/tests/arcade.mjs.
    test: { place: place, fire: fire, aim: aim, afloat: afloat, hills: hills, flight: flight, burst: burst, solve: solve, tower: tower, world: world, tick: tick, off: off, still: still, POS: POS, LAUNCH: LAUNCH, SLING: SLING }
  };
})();

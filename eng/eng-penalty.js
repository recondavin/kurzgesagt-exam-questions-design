// Penalty shootout against the examiner (the user: "penalty would be fun although we need to make it in a way thats
// challenging but possible"). In answer-mode's game card. Any page can open it with its own questions:
//   PenaltyShootout.open({ title, store, next() -> { head, text, ask, opts: [{ t, ok }], why } })
// The English games (eng-games.js) ask about the key moments' chains.
//   Real rules: five kicks each, taking turns, over early when one side can't catch up; level after five, sudden death.
//   Your kick: answer first. Right, and the aiming marker sweeps slowly and the examiner has to guess which way to dive;
//   wrong, and it sweeps fast and he reads you (dives your way 2 times in 3). Stop the marker across, then up. He
//   saves a shot on his side unless it's in a top corner; the corners are close to the woodwork.
//   His kick: answer first. Right, and you see where he's looking (true 2 times in 3); wrong, and you guess. Then two
//   seconds to dive left, stay or dive right. He's on target 9 times in 10 and goes for a top corner 1 time in 4.
// The goal, in the scene's own units (1000 x 560): mouth 262-738 across, bar 170 to the line at 420.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit;
  if (!K) return;
  var X0 = 262, X1 = 738, Y0 = 170, Y1 = 420, SPOT = { x: 500, y: 520 }, KICKS = 5;
  var AIM = { x: [205, 795], y: [422, 120] }, SWEEP = { ok: 2.6, no: 1.25 }, DIVE_MS = 2000;
  var S = null;
  function esc(s) { return K.esc(String(s == null ? '' : s)); }
  function q(sel) { return S && S.card.querySelector(sel); }
  function rnd() { return Math.random(); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function zoneOf(x) { return x < 420 ? 'L' : x > 580 ? 'R' : 'C'; }
  function topCorner(x, y) { return y < 235 && (x < 350 || x > 650); }
  // What a shot at (x, y) does against a keeper diving to zone kz.
  function outcome(x, y, kz) {
    if ((Math.abs(x - 256) < 9 || Math.abs(x - 744) < 9) && y >= 158) return 'post';
    if (Math.abs(y - 164) < 9 && x > 250 && x < 750) return 'post';
    if (x < 250 || x > 750) return 'wide';
    if (y < 158) return 'over';
    if (kz === zoneOf(x) && !topCorner(x, y)) return 'save';
    return 'goal';
  }
  function place(el, x, y) { el.style.left = x / 10 + '%'; el.style.top = y / 5.6 + '%'; }

  // ---------- the scene ----------
  var CROWD = ['#E5534B', '#F2A93B', '#FFD43B', '#6BC5F8', '#C792EA', '#59B88A', '#FFFFFF', '#8EA2BC'];
  function scene() {
    var out = '<rect width="1000" height="190" fill="#24394A"/>', seed = 7;
    for (var r = 0; r < 6; r++) for (var c = 0; c < 46; c++) {
      seed = (seed * 9301 + 49297) % 233280;
      out += '<circle cx="' + (12 + c * 22 + (r % 2) * 11) + '" cy="' + (22 + r * 22) + '" r="7" fill="' + CROWD[seed % CROWD.length] + '" opacity=".85"/>';
    }
    out += '<rect y="150" width="1000" height="34" fill="#13212A"/>';
    ['#FFD43B', '#6BC5F8', '#E5534B', '#59B88A', '#C792EA'].forEach(function (cl, i) { out += '<rect x="' + (30 + i * 196) + '" y="158" width="150" height="18" rx="4" fill="' + cl + '"/>'; });
    out += '<rect y="184" width="1000" height="376" fill="#6DBA4C"/>';
    [[260, 330], [420, 500]].forEach(function (b) { out += '<rect y="' + b[0] + '" width="1000" height="' + (b[1] - b[0]) + '" fill="#63AE44"/>'; });
    // The net (it ripples on a goal), the frame, the lines.
    out += '<g data-pk-net><rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (Y1 - Y0) + '" fill="#FFFFFF" opacity=".16"/><g stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.6">';
    for (var x = X0 + 22; x < X1; x += 22) out += '<line x1="' + x + '" y1="' + Y0 + '" x2="' + x + '" y2="' + Y1 + '"/>';
    for (var y = Y0 + 22; y < Y1; y += 22) out += '<line x1="' + X0 + '" y1="' + y + '" x2="' + X1 + '" y2="' + y + '"/>';
    out += '</g></g><g stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".9"><line x1="80" y1="422" x2="920" y2="422"/><path d="M300 422 L250 476 L750 476 L700 422"/></g>' +
      '<ellipse cx="' + SPOT.x + '" cy="' + SPOT.y + '" rx="11" ry="5" fill="#FFFFFF"/>' +
      '<g fill="#FFFFFF" stroke="#1E2A3A" stroke-width="3"><rect x="250" y="158" width="12" height="266"/><rect x="738" y="158" width="12" height="266"/><rect x="250" y="158" width="500" height="12"/></g>';
    return '<svg class="pk-scene" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  }
  var YOU = '<svg viewBox="0 0 120 150" aria-hidden="true"><g stroke="#1E2A3A" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M40 56 L14 30" stroke-width="13"/><path d="M80 56 L106 30" stroke-width="13"/><path d="M40 56 L14 30" stroke="#3C8DDE" stroke-width="6"/><path d="M80 56 L106 30" stroke="#3C8DDE" stroke-width="6"/>' +
    '<rect x="44" y="100" width="13" height="40" rx="5" fill="#F2C9A0"/><rect x="63" y="100" width="13" height="40" rx="5" fill="#F2C9A0"/>' +
    '<rect x="42" y="122" width="17" height="20" rx="5" fill="#3C8DDE"/><rect x="61" y="122" width="17" height="20" rx="5" fill="#3C8DDE"/>' +
    '<rect x="40" y="86" width="40" height="22" rx="6" fill="#1E2A3A"/><rect x="34" y="46" width="52" height="48" rx="13" fill="#3C8DDE"/>' +
    '<circle cx="12" cy="27" r="11" fill="#FFFFFF"/><circle cx="108" cy="27" r="11" fill="#FFFFFF"/>' +
    '<circle cx="60" cy="30" r="16" fill="#F2C9A0"/><path d="M44 27 Q60 6 76 27 Q66 18 44 27Z" fill="#5A3214"/>' +
    '<text x="60" y="80" font-size="22" font-weight="700" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="Fredoka, Nunito, sans-serif">1</text></g></svg>';
  var BALL = '<svg viewBox="-20 -20 40 40" aria-hidden="true"><circle r="18" fill="#FFFFFF" stroke="#1E2A3A" stroke-width="3"/>' +
    '<path d="M0 -6 L5.7 -1.9 L3.5 4.9 L-3.5 4.9 L-5.7 -1.9Z" fill="#1E2A3A"/><path d="M0 -6 L0 -15 M5.7 -1.9 L14 -4.6 M3.5 4.9 L8.5 12 M-3.5 4.9 L-8.5 12 M-5.7 -1.9 L-14 -4.6" stroke="#1E2A3A" stroke-width="2.2"/></svg>';

  // ---------- the game ----------
  function open(o) {
    AM.practice('eng', 'none', function () { stop(); S = null; });
    S = { o: o, card: K.gameCard(o.title || 'Penalty shootout'), you: [], him: [], sd: false, t: [] };
    K.playing(true);
    K.gameBody(S.card, '<div class="pk"><div class="pk-score" data-pk-score></div>' +
      '<div class="pk-stage" data-pk-stage>' + scene() +
        '<div class="pk-keeper" data-pk-keeper></div><div class="pk-ret" data-pk-ret hidden></div><div class="pk-tell" data-pk-tell hidden><i></i><span>He\'s looking here</span></div>' +
        '<div class="pk-ball" data-pk-ball>' + BALL + '</div><div class="pk-say" data-pk-say hidden></div><div class="pk-who" data-pk-who></div></div>' +
      '<div class="pk-panel" data-pk-panel></div></div>', true);
    K.fillButtons(S.card.querySelector('[data-am-gbtns]'), [['more', 'data-am-keep', 'Close']], true);
    score();
    K.mascot('ok', 'Five kicks each. Know your chains and you\'ll score.');
    turn();
  }
  function stop() { if (!S) return; S.t.forEach(clearTimeout); cancelAnimationFrame(S.raf); S.t = []; }
  function later(fn, ms) { S.t.push(setTimeout(function () { if (S && S.card.isConnected) fn(); }, ms)); }
  function goals(a) { return a.filter(function (x) { return x === 'g'; }).length; }
  function score() {
    var row = function (name, a) {
      var n = Math.max(KICKS, a.length, S.you.length, S.him.length);
      var dots = ''; for (var i = 0; i < n; i++) dots += '<i class="' + (a[i] === 'g' ? 'is-g' : a[i] === 'm' ? 'is-m' : '') + (i >= KICKS ? ' is-sd' : '') + '">' + (a[i] === 'g' ? '✓' : a[i] === 'm' ? '×' : '') + '</i>';
      return '<div class="pk-row"><b>' + name + '</b><span>' + dots + '</span><em>' + goals(a) + '</em></div>';
    };
    q('[data-pk-score]').innerHTML = row('You', S.you) + row('Examiner', S.him) + (S.sd ? '<p class="pk-sd">Sudden death</p>' : '');
  }
  function decided() {
    var y = goals(S.you), h = goals(S.him), ky = S.you.length, kh = S.him.length;
    if (!S.sd) {
      if (y > h + (KICKS - kh)) return 'you';
      if (h > y + (KICKS - ky)) return 'him';
      if (ky === KICKS && kh === KICKS) { if (y !== h) return y > h ? 'you' : 'him'; S.sd = true; }
      return null;
    }
    if (ky === kh && S.you[ky - 1] !== S.him[kh - 1]) return S.you[ky - 1] === 'g' ? 'you' : 'him';
    return null;
  }
  // Whose kick: you go first in each round.
  function turn() {
    var w = decided();
    score();
    if (w) { later(function () { end(w); }, 900); return; }
    S.mine = S.you.length === S.him.length;
    keeper(S.mine ? 'him' : 'you');
    resetBall();
    q('[data-pk-who]').innerHTML = S.mine ? '<span class="pk-who__you">Your kick</span>' : '<span class="pk-who__him">' + (window.ExamTeacher ? window.ExamTeacher.head() : '') + '</span><b>His kick</b>';
    ask();
  }
  function keeper(who) {
    var k = q('[data-pk-keeper]');
    k.className = 'pk-keeper pk-keeper--' + who;
    k.innerHTML = who === 'him' ? (window.ExamTeacher ? window.ExamTeacher.svg() : '') : YOU;
    k.removeAttribute('data-dive');
  }
  function resetBall() {
    var b = q('[data-pk-ball]');
    b.style.transition = 'none'; b.style.opacity = '1';
    place(b, SPOT.x, SPOT.y - 12); b.style.width = '5.2%'; b.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    q('[data-pk-say]').hidden = true; q('[data-pk-tell]').hidden = true; q('[data-pk-ret]').hidden = true;
  }

  // ---------- the question before each kick ----------
  function ask() {
    var x = S.o.next();
    S.q = x;
    q('[data-pk-panel]').innerHTML = '<div class="pk-q"><p class="pk-q__k">' + (S.mine ? 'Answer right for an easy shot' : 'Answer right to read his kick') + '</p>' +
      '<p class="pk-q__h" style="--c:' + (x.colour || '#FFE45C') + '"><b>' + esc(x.head) + '</b>' + esc(x.text) + '</p><p class="pk-q__a">' + esc(x.ask) + '</p>' +
      '<div class="pk-opts">' + x.opts.map(function (o, k) { return '<button type="button" class="pk-opt" data-pk-opt="' + k + '"><kbd>' + (k + 1) + '</kbd><span>' + esc(o.t) + '</span></button>'; }).join('') + '</div><div data-pk-after></div></div>';
    S.phase = 'ask';
  }
  function answer(k) {
    if (S.phase !== 'ask') return;
    var x = S.q, ok = !!x.opts[k].ok;
    S.ok = ok; S.phase = 'answered';
    S.card.querySelectorAll('[data-pk-opt]').forEach(function (b, i) { b.disabled = true; if (x.opts[i].ok) b.classList.add('is-ok'); else if (i === k) b.classList.add('is-no'); });
    if (ok) { K.ding(3); K.sfx('stamp', 0.4); } else K.bonk();
    q('[data-pk-after]').innerHTML = '<p class="pk-res ' + (ok ? 'is-ok' : 'is-no') + '">' + (S.mine ? (ok ? 'Right: the marker moves slowly and he has to guess.' : 'Not quite: the marker\'s fast and he reads you.') : (ok ? 'Right: you\'ll see where he\'s looking.' : 'Not quite: you\'ll have to guess.')) + '</p>' +
      (x.why ? '<p class="pk-why">' + esc(x.why) + '</p>' : '') +
      '<button type="button" class="am-btn am-btn--ok pk-big" data-pk-go>' + (S.mine ? 'Take your kick' : 'Get in goal') + '</button>';
    var go = q('[data-pk-go]'); if (go) go.focus({ preventScroll: true });
  }

  // ---------- your kick: stop the marker across, then up ----------
  function aim() {
    S.phase = 'aimx'; S.ax = null; S.t0 = performance.now();
    q('[data-pk-panel]').innerHTML = '<p class="pk-help">Stop the marker: <b>first across, then up</b>. Tap the goal or press Space.</p><button type="button" class="am-btn am-btn--ok pk-big" data-pk-lock>Stop</button>';
    var r = q('[data-pk-ret]'); r.hidden = false; r.classList.remove('is-locked');
    q('[data-pk-lock]').focus({ preventScroll: true });
    var period = SWEEP[S.ok ? 'ok' : 'no'] * 1000;
    var tri = function (t) { var f = (t % period) / period; return f < 0.5 ? f * 2 : 2 - f * 2; };
    (function frame(now) {
      if (!S || !S.card.isConnected || (S.phase !== 'aimx' && S.phase !== 'aimy')) return;
      var f = tri(now - S.t0), x = S.phase === 'aimx' ? AIM.x[0] + f * (AIM.x[1] - AIM.x[0]) : S.ax, y = S.phase === 'aimx' ? 300 : AIM.y[0] + f * (AIM.y[1] - AIM.y[0]);
      S.cur = { x: x, y: y };
      place(r, x, y);
      r.setAttribute('data-axis', S.phase === 'aimx' ? 'x' : 'y');
      S.raf = requestAnimationFrame(frame);
    })(performance.now());
  }
  function lock() {
    if (S.phase === 'aimx') { S.ax = S.cur.x; S.phase = 'aimy'; S.t0 = performance.now(); K.sfx('tick', 0.4); return; }
    if (S.phase !== 'aimy') return;
    var x = S.cur.x, y = S.cur.y;
    S.phase = 'kick';
    q('[data-pk-ret]').classList.add('is-locked');
    // The keeper: a guess, or (a wrong answer) your way 2 times in 3.
    var bz = zoneOf(x), kz = !S.ok && rnd() < 0.67 ? bz : pick(['L', 'C', 'R']);
    kick(x, y, kz, function (res) { S.you.push(res === 'goal' ? 'g' : 'm'); turn(); });
  }

  // ---------- his kick: dive ----------
  function dive() {
    S.phase = 'dive';
    var tz = pick(['L', 'C', 'R']), top = tz !== 'C' && rnd() < 0.25, onTarget = rnd() < 0.9;
    var x = tz === 'L' ? (top ? 292 : 300 + rnd() * 100) : tz === 'R' ? (top ? 708 : 600 + rnd() * 100) : 440 + rnd() * 120;
    var y = top ? 196 : 250 + rnd() * 150;
    if (!onTarget) { var m = pick(['wide', 'over', 'post']); if (m === 'wide') x = tz === 'R' || (tz === 'C' && rnd() < 0.5) ? 772 : 228; else if (m === 'over') y = 132; else x = tz === 'R' ? 744 : 256; }
    S.his = { x: x, y: y, tz: tz };
    var tell = S.ok ? (rnd() < 0.67 ? tz : pick(['L', 'C', 'R'].filter(function (z) { return z !== tz; }))) : null;
    var t = q('[data-pk-tell]');
    if (tell) { t.hidden = false; place(t, tell === 'L' ? 340 : tell === 'R' ? 660 : 500, 118); }
    q('[data-pk-panel]').innerHTML = '<p class="pk-help">' + (tell ? 'He\'s looking <b>' + ({ L: 'left', C: 'down the middle', R: 'right' })[tell] + '</b>. He doesn\'t always go where he looks.' : 'No idea where he\'s going. <b>Guess.</b>') + '</p>' +
      '<div class="pk-dive"><button type="button" data-pk-dive="L"><kbd>←</kbd>Dive left</button><button type="button" data-pk-dive="C"><kbd>↓</kbd>Stay</button><button type="button" data-pk-dive="R"><kbd>→</kbd>Dive right</button></div>' +
      '<div class="pk-timer"><i style="animation-duration:' + DIVE_MS + 'ms"></i></div>';
    S.diveAt = later(function () { if (S.phase === 'dive') dived('C'); }, DIVE_MS);
  }
  function dived(kz) {
    if (S.phase !== 'dive') return;
    S.phase = 'kick';
    q('[data-pk-tell]').hidden = true;
    S.card.querySelectorAll('[data-pk-dive]').forEach(function (b) { b.disabled = true; if (b.getAttribute('data-pk-dive') === kz) b.classList.add('is-on'); });
    kick(S.his.x, S.his.y, kz, function (res) { S.him.push(res === 'goal' ? 'g' : 'm'); turn(); });
  }

  // ---------- the kick: the ball flies, the keeper dives, the result ----------
  function kick(x, y, kz, done) {
    var res = outcome(x, y, kz), b = q('[data-pk-ball]'), k = q('[data-pk-keeper]'), mine = S.mine;
    K.sfx('thud', 0.55);
    later(function () { k.setAttribute('data-dive', kz); }, 90);
    // Where it ends: in the net, off the keeper, off the woodwork or past the frame.
    var path = [[SPOT.x, SPOT.y - 12, 5.2], [x, y, 2.4]];
    if (res === 'save') path.push([x + (x < 500 ? -150 : 150), Math.min(560, y + 120), 2.8]);
    else if (res === 'post') path.push([x + (x < 500 ? 60 : -60), 470, 2.6]);
    else if (res === 'wide' || res === 'over') path.push([x + (x < 500 ? -90 : 90), y - 50, 2]);
    else path.push([x + (x - 500) * 0.04, y + 6, 2.1]);
    var t0 = performance.now(), d1 = 430, d2 = 330;
    (function frame(now) {
      if (!S || !S.card.isConnected) return;
      var t = now - t0, a, p, f;
      if (t < d1) { f = t / d1; a = path[0]; p = path[1]; f = 1 - Math.pow(1 - f, 1.6); }
      else { f = Math.min(1, (t - d1) / d2); a = path[1]; p = path[2]; }
      var lift = t < d1 ? Math.sin(f * Math.PI) * 34 : 0;
      place(b, a[0] + (p[0] - a[0]) * f, a[1] + (p[1] - a[1]) * f - lift);
      b.style.width = (a[2] + (p[2] - a[2]) * f) + '%';
      b.style.transform = 'translate(-50%, -50%) rotate(' + Math.round(t * 1.4) + 'deg)';
      if (t >= d1 && !S.hitSound) { S.hitSound = true; K.sfx(res === 'goal' ? 'cushion' : res === 'post' ? 'clack' : res === 'save' ? 'thud' : 'whoosh', 0.6); if (res === 'goal') ripple(); }
      if (t < d1 + d2) S.raf = requestAnimationFrame(frame);
      else { S.hitSound = false; if (res === 'wide' || res === 'over') b.style.opacity = '0'; result(res, mine, done); }
    })(t0);
  }
  function ripple() { var n = q('[data-pk-net]'); n.classList.remove('is-ripple'); void n.getBBox(); n.classList.add('is-ripple'); }
  function result(res, mine, done) {
    var say = q('[data-pk-say]'), scored = res === 'goal';
    say.hidden = false;
    say.className = 'pk-say ' + (scored === mine ? 'is-good' : 'is-bad');
    say.textContent = { goal: 'GOAL!', save: 'SAVED!', post: 'Off the post!', wide: 'Wide!', over: 'Over the bar!' }[res];
    if (mine) {
      if (scored) { K.ding(5); K.mascot('angry', pick(['Lucky.', 'Hmph.', 'Fine. One.'])); }
      else K.mascot('happy', res === 'save' ? pick(['Mine.', 'Read it.', 'Too easy.']) : pick(['Ha.', 'Aim, maybe?']));
    } else {
      if (scored) K.mascot('happy', pick(['Too easy.', 'Top bins.', 'Learn your chains.']));
      else { K.ding(5); K.mascot('angry', res === 'save' ? pick(['You read that.', 'Hmph. Saved.']) : 'That slipped.'); }
    }
    q('[data-pk-panel]').innerHTML = '<p class="pk-help">' + (mine ? (scored ? 'You scored.' : 'No goal.') : (scored ? 'He scored.' : 'He didn\'t score.')) + '</p>';
    later(function () { done(res); }, 1500);
  }

  // ---------- the end ----------
  function end(w) {
    stop();
    K.playing(false);
    var rec = {}; try { rec = JSON.parse(K.store(S.o.store || 'penalty') || '{}') || {}; } catch (e) {}
    rec.played = (rec.played || 0) + 1; if (w === 'you') rec.won = (rec.won || 0) + 1;
    K.store(S.o.store || 'penalty', JSON.stringify(rec));
    K.gameBody(S.card, '<div class="am-games__end"><p class="am-games__big">' + goals(S.you) + '<span>–' + goals(S.him) + '</span></p>' +
      '<h3 class="am-games__title">' + (w === 'you' ? 'You win the shootout!' : 'He wins this one') + '</h3>' +
      '<p class="am-games__sub">' + (S.sd ? 'Won in sudden death. ' : '') + 'You\'ve won ' + (rec.won || 0) + ' of ' + rec.played + '.' + (w === 'you' ? '' : ' Answer right and the shots get easier.') + '</p></div>', true);
    K.fillButtons(S.card.querySelector('[data-am-gbtns]'), [['more', 'data-am-keep', 'Close'], ['ok', 'data-pk-again', 'Play again']]);
    K.mascot(w === 'you' ? 'angry' : 'happy', w === 'you' ? 'Rematch. Now.' : 'Back to the chains.');
    if (w === 'you') K.later(K.fanfare, 300);
  }

  // ---------- input ----------
  document.addEventListener('click', function (e) {
    if (!S || !S.card.isConnected || !S.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-pk-opt]'))) { answer(+t.getAttribute('data-pk-opt')); return; }
    if (e.target.closest('[data-pk-go]')) { if (S.mine) aim(); else dive(); return; }
    if (e.target.closest('[data-pk-lock]')) { lock(); return; }
    if ((t = e.target.closest('[data-pk-dive]'))) { dived(t.getAttribute('data-pk-dive')); return; }
    if (e.target.closest('[data-pk-again]')) { var o = S.o; open(o); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!S || !S.card.isConnected) return;
    var st = e.target.closest && e.target.closest('[data-pk-stage]');
    if (!st) return;
    if (S.phase === 'aimx' || S.phase === 'aimy') { e.preventDefault(); lock(); return; }
    if (S.phase === 'dive') { var r = st.getBoundingClientRect(), f = (e.clientX - r.left) / r.width; dived(f < 0.42 ? 'L' : f > 0.58 ? 'R' : 'C'); }
  });
  document.addEventListener('keydown', function (e) {
    if (!S || !S.card.isConnected || e.altKey || e.ctrlKey || e.metaKey) return;
    if (S.phase === 'ask' && /^[1-4]$/.test(e.key)) { e.preventDefault(); answer(+e.key - 1); return; }
    if ((S.phase === 'aimx' || S.phase === 'aimy') && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); lock(); return; }
    if (S.phase === 'dive') {
      var z = { ArrowLeft: 'L', a: 'L', ArrowDown: 'C', s: 'C', ArrowRight: 'R', d: 'R' }[e.key];
      if (z) { e.preventDefault(); dived(z); }
    }
  });
  window.PenaltyShootout = { open: open, test: { outcome: outcome, zoneOf: zoneOf, topCorner: topCorner, AIM: AIM, state: function () { return S; } } };
})();

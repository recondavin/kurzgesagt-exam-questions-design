// Three quick games for every Biology chapter, in answer-mode.js's practice host (cards, the examiner, sounds).
//   Match pairs       Tap a word, then what it means. Three rounds of four pairs, against the clock.
//   Spot the mistake  One sentence, one wrong word or phrase. Tap it, then pick what it should say.
//   Label sprint      A part's name comes up: tap it on the diagram before the bar runs out. A streak makes it faster.
// Their content is in bio/learn<N>.js (match, spot and sprint); the diagrams are bio/d<N>.js's.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, body = BK.body, buttons = BK.buttons;
  var G = null;
  function learn(ch) { return (window.BioLearn || {})[ch] || {}; }
  function live() { return G && G.card.isConnected; }
  // Saves got/out when it beats the last best. True when there was a best and this beat it.
  function best(key, got, out) {
    var prev = (K.store(key) || '').split('/'), had = prev.length === 2, better = !had || got / out > +prev[0] / +prev[1];
    if (better) K.store(key, got + '/' + out);
    return had && better;
  }
  function end(got, out, sub, praise) {
    var perfect = got === out;
    body(G.card, '<div class="am-games__end"><p class="am-games__big">' + got + '<span>/' + out + '</span></p>' +
      '<h3 class="am-games__title">' + (perfect ? 'Perfect!' : got >= out * 0.75 ? 'Nice work!' : 'Keep practising') + '</h3>' +
      '<p class="am-games__sub">' + sub + '</p></div>');
    buttons(G.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-qg-again', 'Play again']]);
    K.mascot(perfect ? 'happy' : 'ok', perfect ? praise : pick(['Again. Until it\'s perfect.', 'Not bad. Not good either.']));
    if (perfect) K.later(K.fanfare, 300);
  }

  // ======================================================================== Match pairs
  var ROUND = 4;
  function matchOpen(ch) {
    var pairs = learn(ch).match || [];
    if (pairs.length < ROUND) return;
    G = { kind: 'match', ch: ch, card: BK.host(ch, 'Match pairs'), list: shuffle(pairs), round: 0, first: 0, t0: Date.now() };
    G.rounds = Math.min(3, Math.floor(G.list.length / ROUND));
    G.out = G.rounds * ROUND;
    K.gameHud(G.card, G.rounds, '/' + G.out);
    K.mascot('ok', 'Match them. Quickly.');
    matchRound();
  }
  function matchRound() {
    var set = G.list.slice(G.round * ROUND, (G.round + 1) * ROUND), L = shuffle(set.map(function (p, i) { return i; })), R = shuffle(L);
    G.set = set;
    G.left = set.length;
    G.sel = null;
    G.missed = {};
    K.gameSeg(G.card, G.round, 'is-current');
    // One grid, word and meaning side by side on each row, so the rows line up.
    body(G.card, '<div class="mp"><div class="am-run__top"><h3 class="am-run__kind">Match pairs</h3><span class="am-games__step">Round ' + (G.round + 1) + ' of ' + G.rounds + '</span></div>' +
      '<p class="am-games__ask">Tap a word, then what it means.</p><div class="mp-grid">' + L.map(function (i, row) {
        return '<button type="button" class="mp-tile mp-tile--word" data-mp="w' + i + '" aria-pressed="false">' + esc(set[i][0]) + '</button>' +
          '<button type="button" class="mp-tile" data-mp="m' + R[row] + '" aria-pressed="false">' + esc(set[R[row]][1]) + '</button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p></div>');
    buttons(G.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function matchTap(btn) {
    var id = btn.getAttribute('data-mp'), side = id.charAt(0), i = +id.slice(1);
    if (btn.classList.contains('is-ok') || G.busy) return;
    if (G.sel === btn) { btn.setAttribute('aria-pressed', 'false'); G.sel = null; return; }
    if (!G.sel || G.sel.getAttribute('data-mp').charAt(0) === side) {
      if (G.sel) G.sel.setAttribute('aria-pressed', 'false');
      G.sel = btn;
      btn.setAttribute('aria-pressed', 'true');
      return;
    }
    var other = G.sel, j = +other.getAttribute('data-mp').slice(1), pair = [other, btn];
    G.sel = null;
    pair.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    var note = G.card.querySelector('[data-am-gnote]');
    if (i === j) {
      if (!G.missed[i]) G.first += 1;
      pair.forEach(function (b) { b.classList.add('is-ok'); b.setAttribute('aria-disabled', 'true'); });
      K.ding(Math.min(G.first, 8), false);
      K.rollTo(G.card.querySelector('[data-am-gscore]'), G.first);
      note.textContent = G.set[i][0] + ': ' + G.set[i][1] + '.';
      G.left -= 1;
      if (!G.left) {
        K.gameSeg(G.card, G.round, Object.keys(G.missed).length ? 'is-half' : 'is-ok');
        G.busy = true;
        K.later(function () {
          if (!live() || G.kind !== 'match') return;
          G.busy = false;
          G.round += 1;
          if (G.round < G.rounds) matchRound(); else matchEnd();
        }, 650);
      }
    } else {
      G.missed[i] = G.missed[j] = true;
      K.bonk();
      if (Math.random() < 0.5) K.mascot('angry', pick(['No!', 'Those don\'t go together.', 'Wrong.']));
      note.textContent = 'Those don\'t go together.';
      pair.forEach(function (b) { b.classList.remove('is-no'); void b.offsetWidth; b.classList.add('is-no'); });
      K.later(function () { pair.forEach(function (b) { b.classList.remove('is-no'); }); }, 600);
    }
  }
  function matchEnd() {
    var secs = Math.round((Date.now() - G.t0) / 1000), key = 'bio-match-time-' + G.ch, fast = +K.store(key);
    var quicker = !fast || secs < fast;
    if (quicker && G.first === G.out) K.store(key, String(secs));
    var newBest = best('bio-match-' + G.ch, G.first, G.out);
    end(G.first, G.out, 'Matched first time: <b>' + G.first + '/' + G.out + '</b> · Time: <b>' + secs + ' s</b>' +
      (fast && G.first === G.out ? (quicker ? ' <b>Fastest yet!</b>' : ' · Best: <b>' + fast + ' s</b>') : '') + (newBest ? ' <b>New best!</b>' : ''),
      quicker && fast ? 'Faster than before. Hmph.' : 'Every pair, first time.');
  }

  // ======================================================================== Spot the mistake
  var SPOT_N = 8;
  function spotOpen(ch) {
    var items = learn(ch).spot || [];
    if (!items.length) return;
    G = { kind: 'spot', ch: ch, card: BK.host(ch, 'Spot the mistake'), list: shuffle(items).slice(0, SPOT_N), i: 0, found: 0, fixed: 0 };
    K.gameHud(G.card, G.list.length, '/' + G.list.length * 2);
    K.mascot('ok', 'One word is wrong. Find it.');
    spotShow();
  }
  // The sentence as tappable words. The wrong words are between *stars*; punctuation after them stays put.
  function spotWords(s) {
    var m = /^(.*?)\*(.+?)\*(\S*)(.*)$/.exec(s), k = 0;
    function chips(text, bad) {
      return text.trim() ? text.trim().split(/\s+/).map(function (w) {
        return '<button type="button" class="sp-w' + (bad ? ' sp-w--bad' : '') + '" data-sp-w="' + (k++) + '"' + (bad ? ' data-sp-bad' : '') + '>' + esc(w) + '</button>';
      }).join(' ') : '';
    }
    return chips(m[1]) + (m[1] ? ' ' : '') + '<span class="sp-bad">' + chips(m[2], true) + '</span>' +
      '<span class="sp-fix" data-sp-fix hidden></span>' + esc(m[3]) + (m[4].trim() ? ' ' + chips(m[4]) : '');
  }
  function spotShow() {
    var it = G.list[G.i];
    G.stage = 'find';
    G.got = 0;
    K.gameSeg(G.card, G.i, 'is-current');
    body(G.card, '<div class="sp"><div class="am-run__top"><h3 class="am-run__kind">Spot the mistake</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<p class="am-games__ask" data-sp-ask>One word or phrase is wrong. Tap it.</p>' +
      '<p class="sp-text">' + spotWords(it.s) + '</p><div class="am-run__opts sp-opts" data-sp-opts></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>');
    buttons(G.card, [['more', 'data-am-keep', 'Close']], true);
    G.card.querySelector('[data-sp-w]').focus({ preventScroll: true });
  }
  function spotTap(btn) {
    if (G.stage !== 'find') return;
    var ok = btn.hasAttribute('data-sp-bad'), it = G.list[G.i];
    G.stage = 'fix';
    G.card.querySelector('.sp-text').classList.add('is-found');
    G.card.querySelectorAll('[data-sp-bad]').forEach(function (b) { b.classList.add('is-bad'); });
    if (ok) { G.found += 1; G.got += 1; K.ding(G.found + G.fixed, false); K.rollTo(G.card.querySelector('[data-am-gscore]'), G.found + G.fixed); }
    else { btn.classList.add('is-no'); K.bonk(); K.mascot('angry', pick(['No. That one.', 'Wrong word.', 'Look again. Properly.'])); }
    G.card.querySelector('[data-sp-ask]').textContent = ok ? 'Yes! What should it say?' : 'Not that one: the red words are wrong. What should they say?';
    G.card.querySelector('[data-sp-opts]').innerHTML = shuffle([it.fix].concat(it.opts)).map(function (o, k) {
      return '<button type="button" class="am-run__opt" data-sp-opt="' + esc(o) + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(o) + '</span></button>';
    }).join('');
    G.card.querySelector('[data-sp-opt]').focus({ preventScroll: true });
  }
  function spotFix(btn) {
    if (G.stage !== 'fix') return;
    var it = G.list[G.i], ok = btn.getAttribute('data-sp-opt') === it.fix, fix = G.card.querySelector('[data-sp-fix]');
    G.stage = 'done';
    G.card.querySelectorAll('[data-sp-opt]').forEach(function (b) {
      b.setAttribute('aria-disabled', 'true');
      if (b.getAttribute('data-sp-opt') === it.fix) b.classList.add('am-run__opt--ok');
    });
    if (!ok) btn.classList.add('am-run__opt--no');
    fix.textContent = it.fix;
    fix.hidden = false;
    if (ok) {
      G.fixed += 1;
      G.got += 1;
      K.ding(G.found + G.fixed, G.got === 2);
      K.rollTo(G.card.querySelector('[data-am-gscore]'), G.found + G.fixed);
      if (G.got === 2) K.mascot('happy', pick(['Correct.', 'Hmph. Yes.', 'That\'s the one.']));
    } else {
      K.bonk();
      K.mascot('angry', pick(['No!', 'Wrong fix.', 'Learn it.']));
    }
    K.gameSeg(G.card, G.i, G.got === 2 ? 'is-ok' : G.got ? 'is-half' : 'is-no');
    G.card.querySelector('[data-am-gnote]').innerHTML = '<span class="sp-why">' + esc(it.why) + '</span>';
    var last = G.i + 1 >= G.list.length;
    buttons(G.card, [['ok', 'data-sp-next', last ? 'See my score' : 'Next sentence']]);
  }
  function spotEnd() {
    var got = G.found + G.fixed, out = G.list.length * 2, newBest = best('bio-spot-' + G.ch, got, out);
    end(got, out, 'Mistakes found: <b>' + G.found + '/' + G.list.length + '</b> · Fixed: <b>' + G.fixed + '/' + G.list.length + '</b>' + (newBest ? ' <b>New best!</b>' : ''),
      'Not one mistake got past you.');
  }

  // ======================================================================== Label sprint
  var SPRINT_N = 12, SLOW = 8000, FAST = 3500, STEP = 450;
  // Labels that describe a process, not a part, can't be tapped.
  var NOT_A_PART = /^\d+\.|:|diffuses|entering|^Cut |^Blood (from|to) /;
  function sprintOpen(ch) {
    var set = window.ExamDrawDiagrams && window.ExamDrawDiagrams['bio-' + ch], ids = learn(ch).sprint || [];
    var pool = shuffle(ids.map(function (id) { return set && set.diagrams.filter(function (d) { return d.id === id; })[0]; }).filter(Boolean)).map(function (d) {
      return { d: d, parts: d.labels.filter(function (l) { return !NOT_A_PART.test(l.text); }) };
    }).filter(function (x) { return x.parts.length >= 3; });
    if (!pool.length) return;
    // A few parts from each diagram in turn, so the picture changes now and then.
    // A part on two diagrams (the ureter, say) is asked once.
    var per = Math.max(3, Math.ceil(SPRINT_N / pool.length)), qs = [], asked = {};
    function take(n) {
      pool.forEach(function (x) {
        shuffle(x.parts).filter(function (l) { return !asked[l.text]; }).slice(0, n).forEach(function (l) { asked[l.text] = true; qs.push({ x: x, l: l }); });
      });
    }
    take(per);
    if (qs.length < SPRINT_N) take(SPRINT_N);
    G = { kind: 'sprint', ch: ch, card: BK.host(ch, 'Label sprint'), qs: qs.slice(0, SPRINT_N), i: 0, right: 0, streak: 0, top: 0, shown: null };
    K.gameHud(G.card, G.qs.length, '/' + G.qs.length);
    K.mascot('ok', 'Fast. Before the bar runs out.');
    sprintAsk();
  }
  function sprintFrame(x) {
    G.shown = x;
    body(G.card, '<div class="ls"><div class="am-run__top"><h3 class="am-run__kind">Label sprint</h3><span class="am-games__step" data-ls-step></span></div>' +
      '<div class="ls-ask"><span class="ls-ask__k">Tap the</span> <b data-ls-name></b><span class="ls-streak" data-ls-streak hidden></span></div>' +
      '<div class="ls-bar" aria-hidden="true"><i data-ls-bar></i></div>' +
      '<div class="bb-frame ls-frame" data-ls-frame>' + x.d.svg + '</div><p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    var svg = G.card.querySelector('[data-ls-frame] svg'), ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
    svg.querySelectorAll('[data-label]').forEach(function (n) { n.style.display = 'none'; });
    svg.removeAttribute('aria-hidden');
    g.setAttribute('class', 'ls-dots');
    g.innerHTML = x.parts.map(function (l, j) {
      return '<g class="ls-dot" data-ls-dot="' + j + '" transform="translate(' + l.at[0] + ' ' + l.at[1] + ')" tabindex="0" role="button" aria-label="Spot ' + (j + 1) + '">' +
        '<circle class="ls-dot__ring" r="9"/><circle class="ls-dot__core" r="4"/></g>';
    }).join('');
    svg.appendChild(g);
    buttons(G.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function sprintAsk() {
    var q = G.qs[G.i];
    if (G.shown !== q.x) sprintFrame(q.x);
    G.answered = false;
    G.card.querySelectorAll('.ls-dot').forEach(function (d) { d.classList.remove('is-ok', 'is-no', 'is-show'); });
    G.card.querySelector('[data-ls-step]').textContent = (G.i + 1) + ' of ' + G.qs.length;
    G.card.querySelector('[data-ls-name]').textContent = q.l.text;
    G.card.querySelector('[data-am-gnote]').textContent = '';
    K.gameSeg(G.card, G.i, 'is-current');
    // The bar drains in the time allowed: less on a streak.
    var ms = Math.max(FAST, SLOW - G.streak * STEP), bar = G.card.querySelector('[data-ls-bar]'), at = G.i;
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(1)';
    void bar.offsetWidth;
    bar.style.transition = 'transform ' + ms + 'ms linear';
    bar.style.transform = 'scaleX(0)';
    G.timer = K.later(function () { if (live() && G.kind === 'sprint' && G.i === at && !G.answered) sprintAnswer(-1); }, ms);
  }
  function sprintAnswer(j) {
    if (G.answered) return;
    G.answered = true;
    clearTimeout(G.timer);
    var q = G.qs[G.i], want = q.x.parts.indexOf(q.l), bar = G.card.querySelector('[data-ls-bar]');
    bar.style.transform = getComputedStyle(bar).transform;
    bar.style.transition = 'none';
    // Two labels can share a name; either spot is right.
    var ok = j >= 0 && q.x.parts[j].text === q.l.text, dot = function (k) { return G.card.querySelector('[data-ls-dot="' + k + '"]'); };
    if (ok) {
      G.right += 1;
      G.streak += 1;
      G.top = Math.max(G.top, G.streak);
      dot(j).classList.add('is-ok');
      K.ding(Math.min(G.streak, 8), G.streak >= 5);
      K.rollTo(G.card.querySelector('[data-am-gscore]'), G.right);
      if (G.streak === 5) K.mascot('happy', 'Five in a row. Hmph.');
    } else {
      G.streak = 0;
      if (j >= 0) dot(j).classList.add('is-no');
      dot(want).classList.add('is-show');
      K.bonk();
      K.mascot('angry', j < 0 ? pick(['Too slow.', 'Faster!']) : pick(['No! That one.', 'Wrong part.']));
      G.card.querySelector('[data-am-gnote]').textContent = j < 0 ? 'Out of time. It\'s the green spot.' : 'Not there. It\'s the green spot.';
    }
    var streak = G.card.querySelector('[data-ls-streak]');
    streak.hidden = G.streak < 2;
    streak.textContent = G.streak + ' in a row';
    K.gameSeg(G.card, G.i, ok ? 'is-ok' : 'is-no');
    K.later(function () {
      if (!live() || G.kind !== 'sprint') return;
      G.i += 1;
      if (G.i < G.qs.length) sprintAsk(); else sprintEnd();
    }, ok ? 500 : 1500);
  }
  // A tap on the diagram picks the nearest spot, so spots close together still work.
  function sprintTap(e) {
    var svg = G.card.querySelector('[data-ls-frame] svg'), dots = G.shown.parts;
    if (!svg || G.answered) return;
    var p = BK.svgPoint(svg, e), near = -1, dist = 40;
    dots.forEach(function (l, j) {
      var d = Math.sqrt(Math.pow(l.at[0] - p.x, 2) + Math.pow(l.at[1] - p.y, 2));
      if (d < dist) { dist = d; near = j; }
    });
    if (near >= 0) sprintAnswer(near);
  }
  function sprintEnd() {
    var newBest = best('bio-sprint-' + G.ch, G.right, G.qs.length);
    end(G.right, G.qs.length, 'Longest streak: <b>' + G.top + '</b>' + (newBest ? ' <b>New best!</b>' : ''), 'Every part, on time. I\'m almost impressed.');
  }

  // ======================================================================== shared
  var OPEN = { match: matchOpen, spot: spotOpen, sprint: sprintOpen };
  document.addEventListener('click', function (e) {
    if (!live() || !G.card.contains(e.target)) return;
    var t;
    if (G.kind === 'match' && (t = e.target.closest('[data-mp]'))) { matchTap(t); return; }
    if (G.kind === 'spot') {
      if ((t = e.target.closest('[data-sp-w]'))) { spotTap(t); return; }
      if ((t = e.target.closest('[data-sp-opt]'))) { spotFix(t); return; }
      if (e.target.closest('[data-sp-next]')) { G.i += 1; if (G.i < G.list.length) spotShow(); else spotEnd(); return; }
    }
    if (G.kind === 'sprint' && e.target.closest('[data-ls-frame] svg')) { sprintTap(e); return; }
    if (e.target.closest('[data-qg-again]')) OPEN[G.kind](G.ch);
  });
  document.addEventListener('keydown', function (e) {
    if (!live() || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target.closest && e.target.closest('[data-ls-dot]');
    if (G.kind === 'sprint' && t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sprintAnswer(+t.getAttribute('data-ls-dot')); return; }
    if (G.kind === 'spot' && G.stage === 'fix' && /^[1-3]$/.test(e.key)) {
      var b = G.card.querySelectorAll('[data-sp-opt]')[e.key - 1];
      if (b) { e.preventDefault(); b.click(); }
    }
  });
  window.BioQuick = { open: function (kind, ch) { if (OPEN[kind]) OPEN[kind](ch); } };
})();

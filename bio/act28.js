// The stage kit the five action games share (act28.js to act32.js): this file loads first, so it lives here, as
// window.BioStage. What it gives every game:
//   fit       the canvas fills the card's width and the height left on the screen, sharp at the screen's pixel density;
//             the game draws in its own units (at least 640 x 400 on a big screen, scaled up to fill it), so a bigger
//             card shows everything bigger rather than a small picture in a big box.
//   now       the game clock: it stops while the "Leave the game?" box is open (answer-mode.js's am:leave), so nothing
//             moves or runs out behind it.
//   pop       a number or a word floating up from where something happened (+12, Wrong way!), drawn on the canvas.
//   hearts    the hearts as pictures; the one just lost cracks and falls, and the stage shakes.
//   head      the round's top: its name, the hearts, one line of rules; then the stage, with the first frame drawn
//             behind a card that says how to move.
//   end       the end: a picture of the last moment with the score on it, a title, one line, and how each round went.
//   thumbs    each game's row on a chapter's Games tab gets a small picture of the game and a few words (decorated
//             here when the row appears, since the list itself is bio.js's).
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit;
  if (!K) return;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // ---------------------------------------------------------------- the clock, paused while "Leave the game?" is up
  var paused = 0, pausedAt = 0;
  function now() { var t = performance.now(); return t - paused - (pausedAt ? t - pausedAt : 0); }
  function watch(root) {
    if (!root || root.bioStage) return;
    root.bioStage = true;
    pausedAt = 0;
    root.addEventListener('am:leave', function (e) {
      if (e.detail && e.detail.open) { if (!pausedAt) pausedAt = performance.now(); }
      else if (pausedAt) { paused += performance.now() - pausedAt; pausedAt = 0; }
    });
  }

  // ---------------------------------------------------------------- the canvas, filling the card
  // The stage is as wide as the card and as tall as the screen allows under it (the note line and the buttons stay
  // in view), at most 3:4 on a wide card or about 3:2 tall on a phone. k: how much the game's units are scaled up.
  function fit(canvas) {
    var stage = canvas.parentNode, card = stage.closest('.am-finish__card'), dpr = Math.min(3, window.devicePixelRatio || 1);
    // Layout sizes, not the on-screen ones: the card pops in from a small scale.
    var w = Math.max(260, stage.offsetWidth), phone = window.innerWidth <= 600, top = 0;
    for (var el = stage; el; el = el.offsetParent) top += el.offsetTop;
    if (card) top -= card.scrollTop;
    var btns = card && card.querySelector('[data-am-gbtns]'), below = (btns ? btns.offsetHeight + 16 : 70) + (phone ? 52 : 78);
    var room = window.innerHeight - top - below;
    var h = Math.round(Math.max(phone ? 300 : 320, Math.min(room, w * (phone ? 1.5 : 0.72))));
    var k = Math.max(1, Math.min(w / 640, h / 400, 1.7));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    canvas.bioW = w / k;
    return { ctx: ctx, W: w / k, H: h / k, k: k };
  }
  // A pointer event in the game's units.
  function point(canvas, e) {
    var b = canvas.getBoundingClientRect(), s = (canvas.bioW || b.width) / (b.width || 1);
    return { x: (e.clientX - b.left) * s, y: (e.clientY - b.top) * s };
  }

  // ---------------------------------------------------------------- floating words and numbers
  function pop(g, x, y, text, color, big) {
    (g.pops = g.pops || []).push({ x: x, y: y, text: String(text), color: color || '#2BA864', t: now(), big: Boolean(big) });
  }
  function drawPops(ctx, g) {
    if (!g.pops || !g.pops.length) return;
    var t = now(), calm = K.reduced();
    g.pops = g.pops.filter(function (p) { return t - p.t < 1000; });
    g.pops.forEach(function (p) {
      var k = (t - p.t) / 1000, s = calm ? 1 : k < 0.15 ? 0.6 + k / 0.15 * 0.6 : k < 0.3 ? 1.2 - (k - 0.15) / 0.15 * 0.2 : 1;
      var y = Math.max(52, p.y) - (calm ? 0 : 30 * Math.min(1, k * 1.4)), size = (p.big ? 30 : 22) * s;
      ctx.save();
      ctx.globalAlpha = k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1;
      ctx.font = '800 ' + size.toFixed(1) + 'px Fredoka, Nunito, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var x = Math.max(ctx.measureText(p.text).width / 2 + 6, Math.min((g.W || 640) - ctx.measureText(p.text).width / 2 - 6, p.x));
      ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(p.text, x, y);
      ctx.fillStyle = p.color; ctx.fillText(p.text, x, y);
      ctx.restore();
    });
  }
  // A label drawn at 14px or more, on a white pill so it reads on any background.
  function label(ctx, text, x, y, opt) {
    opt = opt || {};
    var size = opt.size || 14;
    ctx.font = '800 ' + size + 'px Nunito, sans-serif';
    var w = ctx.measureText(text).width + size, h = size + 8, W = opt.W || 9999;
    x = Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, x));
    ctx.fillStyle = opt.bg || 'rgba(255,255,255,.92)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); else ctx.rect(x - w / 2, y - h / 2, w, h);
    ctx.fill();
    if (opt.edge) { ctx.lineWidth = 1.5; ctx.strokeStyle = opt.edge; ctx.stroke(); }
    ctx.fillStyle = opt.fg || '#18272D'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
    return { x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 };
  }

  // ---------------------------------------------------------------- hearts
  var HEART = 'M12 21s-8.6-5.3-10.6-10.6C0 6.4 2.6 2.6 6.6 2.6c2.4 0 4.3 1.3 5.4 3.2 1.1-1.9 3-3.2 5.4-3.2 4 0 6.6 3.8 5.2 7.8C20.6 15.7 12 21 12 21z';
  function heartsHtml(n, lost) {
    var out = '', svg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + HEART + '"/></svg>';
    for (var i = 0; i < 3; i++) {
      // The one just lost: an empty heart, and over it the two halves of the full one, split along a crack, falling away.
      out += '<i class="act-heart' + (i < n ? '' : ' is-gone') + (lost && i === n ? ' is-crack' : '') + '">' + svg +
        (lost && i === n ? '<span class="act-heart__l">' + svg + '</span><span class="act-heart__r">' + svg + '</span>' : '') + '</i>';
    }
    return '<span class="act-hearts" data-act-hearts role="img" aria-label="' + n + ' of 3 hearts">' + out + '</span>';
  }
  function hearts(card, n, lost) {
    var h = card && card.querySelector('[data-act-hearts]');
    if (h) h.outerHTML = heartsHtml(n, lost);
    if (lost) {
      K.sfx('crash', 0.7);
      var st = card.querySelector('.nr-stage');
      if (st && !K.reduced()) { st.classList.remove('is-shake'); void st.offsetWidth; st.classList.add('is-shake'); }
    }
  }

  // ---------------------------------------------------------------- the round's top, and the stage
  // title: the round's name; rule: one line; how: how to move (on the card over the first frame), more: the longer
  // explanation on that card. canvas: the data attribute the game finds its canvas by.
  function head(o) {
    return '<div class="am-run__top act-top"><h3 class="am-run__kind">' + esc(o.title) + '</h3>' + heartsHtml(o.hearts) + '</div>' +
      (o.rule ? '<p class="act-rule">' + o.rule + '</p>' : '');
  }
  function stage(o) {
    return '<div class="nr-stage act-stage ' + (o.cls || '') + '"><canvas class="nr-canvas" ' + o.canvas + ' aria-label="' + esc(o.label || o.title) + '"></canvas>' +
      '<div class="nr-overlay act-go" ' + o.overlay + '><div class="act-go__card"><b>' + esc(o.title) + '</b>' + (o.more ? '<p>' + o.more + '</p>' : '') +
      '<span class="act-go__how">' + esc(o.how) + '</span></div></div></div><p class="am-games__note act-note" data-am-gnote role="status"></p>';
  }

  // ---------------------------------------------------------------- the end
  // A picture of the last moment (taken from the canvas as the game ended), the score on it, a title, one line,
  // and a chip for each round.
  function snap(canvas) {
    try {
      if (!canvas || !canvas.width) return '';
      var w = Math.min(760, canvas.width), c = document.createElement('canvas');
      c.width = w; c.height = Math.round(canvas.height * w / canvas.width);
      c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    } catch (err) { return ''; }
  }
  function end(o) {
    return '<div class="act-end">' + (o.snap ? '<div class="act-end__pic' + (o.out ? ' is-out' : '') + '"><img src="' + o.snap + '" alt="">' : '<div class="act-end__pic is-blank">') +
      '<span class="act-end__score"><b class="num">' + o.score + '</b> pts</span>' + (o.best ? '<span class="act-end__best">' + esc(o.best) + '</span>' : '') + '</div>' +
      '<h3 class="am-games__title">' + esc(o.title) + '</h3><p class="act-end__line">' + o.line + '</p>' +
      (o.rounds && o.rounds.length ? '<ul class="act-end__rounds">' + o.rounds.map(function (r) {
        return '<li class="' + (r.ok ? 'is-ok' : r.ok === false ? 'is-no' : '') + '">' + esc(r.name) + '</li>';
      }).join('') + '</ul>' : '') + '</div>';
  }
  // The best so far, as a short line: "New best!" or "Best 120".
  function best(key, score) {
    var b = +K.store(key) || 0, better = score > b;
    if (better) K.store(key, String(score));
    return better && b ? 'New best!' : b ? 'Best ' + Math.max(b, score) : '';
  }

  // The examiner stands to the left of the card with his bubble kept off it (as on the trivia board), not over the
  // card's buttons.
  function place(card) { if (window.BioBoard && window.BioBoard.nearMascot && card) window.BioBoard.nearMascot(card); }

  // ---------------------------------------------------------------- the Games tab: a picture and a few words
  var THUMBS = {};
  function thumb(ch, pitch, draw) { THUMBS[ch] = { pitch: pitch, draw: draw }; decorate(); }
  function decorate() {
    var m = /^#ch(\d+)/.exec(location.hash), T = m && THUMBS[+m[1]];
    if (!T) return;
    document.querySelectorAll('.bio-g[data-bio-game="action"]:not(.act-row)').forEach(function (row) {
      row.classList.add('act-row');
      var c = document.createElement('canvas'), w = 132, h = 84, dpr = Math.min(3, window.devicePixelRatio || 1);
      c.className = 'act-thumb'; c.width = w * dpr; c.height = h * dpr; c.setAttribute('aria-hidden', 'true');
      var ctx = c.getContext('2d');
      ctx.setTransform(dpr * w / 320, 0, 0, dpr * w / 320, 0, 0);
      try { T.draw(ctx, 320, 204); } catch (err) { /* a picture is a nice-to-have */ }
      row.insertBefore(c, row.firstChild);
      var name = row.querySelector('b');
      if (name) name.insertAdjacentHTML('afterend', '<span class="act-pitch">' + esc(T.pitch) + '</span>');
    });
  }
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; decorate(); }, 0);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.BioStage = { now: now, watch: watch, fit: fit, point: point, pop: pop, drawPops: drawPops, label: label, hearts: hearts, heartsHtml: heartsHtml,
    head: head, stage: stage, snap: snap, end: end, best: best, thumb: thumb, place: place, esc: esc };
})();

// Chapter 28's action game, Breath of air, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[28].
//   Round 1: you are an oxygen molecule. Pick the right door at each fork of the airway, nose to alveolus,
//            and dodge the dust the mucus missed.
//   Round 2: you are the alveolus wall. Send each molecule the way it diffuses: oxygen down into the blood,
//            carbon dioxide and water vapour up into the alveolus to be breathed out.
//   Round 3: you are the breathing centre in the brain. Hold to breathe in, let go to breathe out, and keep the
//            carbon dioxide in the blood in the safe zone through a workout.
// A question after each round. Three hearts.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, S = window.BioStage;
  if (!K || !BK || !S) return;
  var esc = BK.esc, shuffle = BK.shuffle, host = BK.host, body = BK.body, buttons = BK.buttons;
  var INK = '#18272D', O2C = '#2E9E5B', CO2C = '#E8551F', H2OC = '#3E9BD8';

  // ---------- round 1: the airway, in order ----------
  var GATES = [
    { at: 'the nasal cavity', say: 'Hairs and mucus filter you; the air is warmed and moistened.', next: 'Pharynx', opts: ['Pharynx', 'Larynx', 'Bronchus'] },
    { at: 'the pharynx', say: 'The back of the throat: food and air both pass here.', next: 'Larynx', opts: ['Larynx', 'Oesophagus'],
      why: { Oesophagus: 'That\'s the food pipe! Air goes through the larynx; the epiglottis covers it only when you swallow.' } },
    { at: 'the larynx', say: 'The voice box. Next: the windpipe.', next: 'Trachea', opts: ['Bronchiole', 'Trachea', 'Pharynx'] },
    { at: 'the trachea', say: 'Rings of cartilage hold it open. Cilia sweep mucus up and away.', next: 'Bronchus', opts: ['Alveolus', 'Bronchus'] },
    { at: 'a bronchus', say: 'One to each lung. It branches again and again.', next: 'Bronchiole', opts: ['Trachea', 'Bronchiole', 'Larynx'] },
    { at: 'a bronchiole', say: 'Tiny tubes ending in bunches of air sacs.', next: 'Alveolus', opts: ['Alveolus', 'Bronchus'] }
  ];
  // ---------- round 2: which way does it diffuse? ----------
  var MOLS = {
    o2: { label: 'O2', name: 'Oxygen', color: O2C, way: 'down', right: 'Oxygen diffuses into the blood and joins haemoglobin.', wrong: 'Oxygen goes DOWN: from the alveolus into the blood.' },
    co2: { label: 'CO2', name: 'Carbon dioxide', color: CO2C, way: 'up', right: 'Carbon dioxide diffuses into the alveolus, to be breathed out.', wrong: 'Carbon dioxide goes UP: out of the blood into the alveolus.' },
    h2o: { label: 'H2O', name: 'Water vapour', color: H2OC, way: 'up', right: 'Water vapour leaves the blood too, and is breathed out.', wrong: 'Water vapour goes UP: out of the blood into the alveolus (that\'s why breath is damp).' }
  };
  var MIX = ['o2', 'co2', 'o2', 'co2', 'h2o', 'o2', 'co2', 'o2', 'co2', 'h2o', 'o2', 'co2', 'o2', 'co2'];
  // ---------- round 3: the workout ----------
  var PHASES = [
    { until: 7, name: 'Resting', make: 3.2, say: 'Resting. Slow, shallow breaths are enough.' },
    { until: 15, name: 'Jogging', make: 7, say: 'Jogging: your muscles are respiring faster.' },
    { until: 24, name: 'Sprinting!', make: 11, say: 'Sprint! Carbon dioxide is pouring into the blood.' },
    { until: 32, name: 'Cooling down', make: 4, say: 'Cooling down. Let your breathing slow again.' }
  ];
  var ROUNDS = [
    { title: 'Round 1: You are an oxygen molecule', rule: 'At each fork, steer into the <b>next part of the airway</b>. Dodge the dust.',
      ask: 'Find your way from the nose to an alveolus: at each fork, steer into the next part of the airway. Dodge the dust the mucus missed.',
      hint: 'Drag, or use the arrow keys', name: 'The airway',
      quiz: { q: 'What stops food going into the trachea when you swallow?', opts: ['The epiglottis', 'The larynx', 'The diaphragm', 'The rings of cartilage'], a: 0 } },
    { title: 'Round 2: You are the alveolus wall', rule: 'Send each molecule the way it diffuses: <b>up</b> into the air, or <b>down</b> into the blood.',
      ask: 'Oxygen, carbon dioxide and water vapour arrive at the wall one at a time. Send each the way it diffuses before it reaches the line.',
      hint: 'Tap the top or bottom half, or use the up and down arrows', name: 'Gas exchange',
      quiz: { q: 'What is the name of the process that moves gases across the alveolus wall?', opts: ['Diffusion', 'Active transport', 'Osmosis', 'Breathing'], a: 0 } },
    { title: 'Round 3: You are the breathing centre', rule: 'Hold to breathe in, let go to breathe out. Keep the CO\u2082 in the <b>green zone</b>.',
      ask: 'Breathing in, the diaphragm and intercostal muscles contract; breathing out, they relax. Keep the carbon dioxide in the blood in the green zone through a workout.',
      hint: 'Press and hold on the picture, or hold the space bar', name: 'The workout',
      quiz: { q: 'Which part of the brain detects a rise in carbon dioxide in the blood?', opts: ['The medulla oblongata', 'The cerebellum', 'The hypothalamus', 'The pituitary gland'], a: 0 } }
  ];

  var A = null;
  function actionOpen(ch) {
    if (ch !== 28) return;
    if (A) cancelAnimationFrame(A.raf);
    var card = host(ch, 'Breath of air');
    card.querySelector('.am-finish__card').classList.add('act-card');
    S.watch(K.root());
    A = { card: card, round: 0, score: 0, hearts: 3, raf: 0, res: [] };
    K.root().addEventListener('click', actionClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    actionIntro();
  }
  // Each round opens on its first frame, drawn behind a card that says how to move; Start (or a tap on it) plays.
  function actionIntro() {
    var r = ROUNDS[A.round];
    K.gameSeg(A.card, A.round, 'is-current');
    body(A.card, '<div class="nr ba">' + S.head({ title: r.title, hearts: A.hearts, rule: r.rule }) +
      S.stage({ cls: 'ba-stage', canvas: 'data-ba-canvas', overlay: 'data-ba-overlay', title: r.title, more: esc(r.ask), how: r.hint }) + '<p class="am-sr" data-ba-live aria-live="polite"></p></div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ba-play', A.round ? 'Go' : 'Start']]);
    if (!A.round) K.mascot('ok', 'Every breath you take. Get it right.');
    S.place(A.card);
    prepare();
  }
  function hearts(lost) { S.hearts(A.card, A.hearts, lost); }
  function flash(text, good) {
    var note = A.card.querySelector('[data-am-gnote]');
    if (note) { note.textContent = text; note.className = 'am-games__note act-note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  // What's on the canvas, for screen readers: the doors at each fork, the molecule at the wall, the workout.
  function say(t) {
    var live = A.card.querySelector('[data-ba-live]');
    if (live) live.textContent = t;
  }
  function score(n, x, y) {
    A.score = Math.max(0, A.score + n);
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
    if (x != null && n) S.pop(A.g, x, y, (n > 0 ? '+' : '\u2212') + Math.abs(n), n > 0 ? '#1E8A50' : '#EA2B2B');
  }
  function hurt(line, x, y) {
    A.hearts -= 1;
    A.combo = 0;
    A.res[A.round] = false;
    hearts(true);
    K.bonk();
    flash(line, false);
    if (x != null) S.pop(A.g, x, y, line.split(/[.!:]/)[0] + '!', '#EA2B2B', true);
    K.mascot('angry', line.split(/[.!:]/)[0] + '!');
  }
  function good(line, n, x, y) {
    A.combo = (A.combo || 0) + 1;
    K.ding(Math.min(10, A.combo), false);
    score(n, x, y);
    flash(line, true);
  }

  // ---------- the play loop, shared by all three rounds ----------
  // The canvas is sized and the round set up and drawn once, under the "how to move" card, before it starts.
  function prepare() {
    var canvas = A.card.querySelector('[data-ba-canvas]'), f = S.fit(canvas);
    var g = A.g = { W: f.W, H: f.H, ctx: f.ctx, x: f.W / 2, t0: S.now(), last: S.now(), keys: {}, done: false, canvas: canvas, still: K.reduced(), pops: [] };
    [setupAirway, setupWall, setupControl][A.round](g);
    if (g.preview) g.preview();
    g.draw(f.ctx);
  }
  function actionPlay() {
    var g = A.g, canvas = g.canvas, ctx = g.ctx, W = g.W, H = g.H;
    if (!g || g.started) return;
    g.started = true;
    K.playing(true);
    if (A.res[A.round] == null) A.res[A.round] = true;
    A.card.querySelector('[data-ba-overlay]').hidden = true;
    g.t0 = g.last = S.now();
    var point = function (e) { return S.point(canvas, e); };
    canvas.onpointermove = function (e) { if (g.move) g.move(point(e)); };
    canvas.onpointerdown = function (e) { e.preventDefault(); if (g.down) g.down(point(e)); else if (g.move) g.move(point(e)); };
    canvas.onpointerup = canvas.onpointercancel = canvas.onpointerleave = function () { if (g.up) g.up(); };
    A.onKey = function (e) {
      if (!canvas.isConnected) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); return; }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].indexOf(e.key) < 0 || document.querySelector('.am-leave')) return;
      e.preventDefault();
      var down = e.type === 'keydown';
      if (g.key) g.key(e.key, down, e.repeat);
      g.keys[e.key] = down;
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    var loop = function () {
      if (!A || A.g !== g || !canvas.isConnected) return;
      var now = S.now(), dt = Math.min(50, now - g.last);
      g.last = now;
      if (dt > 0) g.step(dt, now - g.t0);
      ctx.clearRect(0, 0, W, H);
      g.draw(ctx);
      S.drawPops(ctx, g);
      if (!g.done && A.hearts <= 0) g.done = true;
      if (g.done) { roundEnd(); return; }
      A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  function text(ctx, s, x, y, size, color, align, weight, max) {
    ctx.font = (weight || 800) + ' ' + size + 'px Nunito, sans-serif';
    ctx.fillStyle = color || INK;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    if (max) ctx.fillText(s, x, y, max); else ctx.fillText(s, x, y);
  }
  function pill(ctx, s, x, y, bg, fg, size) {
    size = size || 15;
    ctx.font = '800 ' + size + 'px Nunito, sans-serif';
    var w = ctx.measureText(s).width + size * 1.3, h = size + 12;
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); else ctx.rect(x - w / 2, y - h / 2, w, h);
    ctx.fill();
    text(ctx, s, x, y + 0.5, size, fg || '#FFFFFF');
  }
  function molecule(ctx, x, y, kind, r) {
    var m = MOLS[kind] || MOLS.o2;
    r = r || 15;
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.fillStyle = m.color;
    ctx.beginPath(); ctx.arc(x - r * 0.45, y, r * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + r * 0.45, y, r * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    text(ctx, m.label, x, y + 1, Math.max(14, r * 0.8), '#FFFFFF');
  }

  // ---------- round 1 ----------
  function setupAirway(g) {
    g.px = g.W / 2; g.py = 74;
    g.gates = []; g.dust = []; g.next = 0; g.spawn = 900; g.dustIn = 1200; g.passed = 0; g.speed = g.H / 3.1 / 1000;
    g.where = 'the nasal cavity';
    g.move = function (p) { g.px = Math.max(20, Math.min(g.W - 20, p.x)); };
    g.step = function (dt, el) {
      if (g.keys.ArrowLeft) g.px = Math.max(20, g.px - dt * 0.42);
      if (g.keys.ArrowRight) g.px = Math.min(g.W - 20, g.px + dt * 0.42);
      g.spawn -= dt; g.dustIn -= dt;
      if (g.spawn <= 0 && g.next < GATES.length) {
        var G = GATES[g.next], opts = G.opts.slice();
        // Shuffle the doors, but never leave the right one straight below the molecule.
        do { opts = shuffle(G.opts); } while (opts.length > 1 && Math.floor(g.px / (g.W / opts.length)) === opts.indexOf(G.next));
        g.gates.push({ y: g.H + 30, gate: G, opts: opts, done: false });
        say('Fork ahead. Doors from left to right: ' + opts.join(', ') + '.');
        g.next += 1;
        g.spawn = 3300;
      }
      if (g.dustIn <= 0 && g.next <= GATES.length && g.passed < GATES.length) {
        g.dust.push({ x: 24 + Math.random() * (g.W - 48), y: g.H + 10, r: 6 + Math.random() * 4, drift: (Math.random() - 0.5) * 0.04 });
        g.dustIn = 900 + Math.random() * 700;
      }
      var v = g.speed * dt;
      g.gates.forEach(function (gt) {
        gt.y -= v;
        if (!gt.done && gt.y <= g.py) {
          gt.done = true;
          var k = Math.min(gt.opts.length - 1, Math.floor(g.px / (g.W / gt.opts.length))), chose = gt.opts[k], G = gt.gate;
          if (chose === G.next) { good('Into the ' + G.next.toLowerCase() + '. ' + (GATES[GATES.indexOf(G) + 1] ? GATES[GATES.indexOf(G) + 1].say : 'You made it to an alveolus!'), 10, g.px, g.py - 30); K.sfx('whoosh', 0.6); }
          else hurt((G.why && G.why[chose]) || ('Wrong way: after ' + G.at + ' comes the ' + G.next.toLowerCase() + '.'), g.px, g.py - 30);
          g.where = G.next === 'Alveolus' ? 'an alveolus' : 'the ' + G.next.toLowerCase();
          g.passed += 1;
          if (g.passed >= GATES.length) g.finishAt = el + 900;
        }
      });
      g.gates = g.gates.filter(function (gt) { return gt.y > -40; });
      g.dust.forEach(function (d) {
        d.y -= v * 1.1; d.x += d.drift * dt;
        if (!d.hit && Math.abs(d.x - g.px) < d.r + 13 && Math.abs(d.y - g.py) < d.r + 10) {
          d.hit = true;
          score(-3, g.px, g.py - 30);
          A.combo = 0;
          K.bonk();
          K.sfx('thud', 0.5);
          flash('Dust! Mucus should trap it, and cilia sweep it back up.', false);
        }
      });
      g.dust = g.dust.filter(function (d) { return d.y > -20 && !d.hit; });
      if (g.finishAt && el >= g.finishAt) { g.done = true; g.reached = true; }
    };
    g.draw = function (ctx) {
      var W = g.W, H = g.H, t = S.now();
      ctx.fillStyle = '#FFF4EA'; ctx.fillRect(0, 0, W, H);
      // The airway walls, lined with cilia that beat upwards.
      ctx.fillStyle = '#F2948C'; ctx.fillRect(0, 0, 10, H); ctx.fillRect(W - 10, 0, 10, H);
      ctx.strokeStyle = '#B5543A'; ctx.lineWidth = 2;
      var off = g.still ? 0 : (t / 30) % 16;
      for (var y = -16 + (16 - off); y < H + 16; y += 16) {
        ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(18, y - 6); ctx.moveTo(W - 10, y); ctx.lineTo(W - 18, y - 6); ctx.stroke();
      }
      // Gates: a fork in the airway, with a labelled opening for each choice and tissue between them.
      g.gates.forEach(function (gt) {
        var n = gt.opts.length, w = W / n;
        ctx.fillStyle = '#F2948C'; ctx.strokeStyle = '#B5543A'; ctx.lineWidth = 2;
        for (var k = 0; k <= n; k++) {
          var x0 = k === 0 ? 0 : w * k - w * 0.16, x1 = k === n ? W : w * k + w * 0.16;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x0, gt.y - 16, x1 - x0, 32, 10); else ctx.rect(x0, gt.y - 16, x1 - x0, 32);
          ctx.fill(); ctx.stroke();
        }
        gt.opts.forEach(function (o, k) {
          pill(ctx, o, w * k + w / 2, gt.y, gt.done ? (o === gt.gate.next ? '#2BA864' : '#8A93A6') : INK, '#FFFFFF', w < 120 ? 14 : 16);
        });
      });
      g.dust.forEach(function (d) {
        ctx.fillStyle = '#8C6A4F'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#A8876A'; ctx.beginPath(); ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2); ctx.fill();
      });
      molecule(ctx, g.px, g.py, 'o2', 19);
      pill(ctx, 'You are in ' + g.where, W / 2, 24, 'rgba(24,39,45,.85)');
      var left = g.passed / GATES.length;
      ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#58CC02'; ctx.fillRect(0, H - 6, W * left, 6);
    };
  }

  // ---------- round 2 ----------
  function setupWall(g) {
    g.queue = MIX.slice(); g.mols = []; g.spawn = 300; g.sent = 0; g.total = MIX.length;
    g.wallY = g.H / 2; g.lineX = g.W * 0.66;
    var send = function (way) {
      var m = g.mols.filter(function (o) { return !o.way; })[0];
      if (!m) return;
      m.way = way;
      var M = MOLS[m.kind];
      if (way === M.way) { m.ok = true; good(M.right, 6, m.x, m.y + (way === 'up' ? -40 : 40)); K.sfx('pop', 0.6); } else { m.ok = false; hurt(M.wrong, m.x, m.y - 40); }
      g.sent += 1;
    };
    g.down = function (p) { send(p.y < g.wallY ? 'up' : 'down'); };
    g.key = function (key, down, repeat) {
      if (!down || repeat) return;
      if (key === 'ArrowUp') send('up');
      if (key === 'ArrowDown') send('down');
    };
    g.step = function (dt) {
      g.spawn -= dt;
      var speed = 0.075 + g.sent * 0.006;
      if (g.spawn <= 0 && g.queue.length) {
        g.mols.push({ kind: g.queue.shift(), x: -20, y: g.wallY });
        g.spawn = Math.max(900, 1700 - g.sent * 60);
      }
      g.mols.forEach(function (m) {
        if (!m.way) {
          m.x += speed * dt;
          if (m.x >= g.lineX) {
            // Too slow: it never crossed.
            m.way = 'late'; g.sent += 1; score(-3, m.x, m.y - 40); A.combo = 0; K.bonk();
            flash('Too slow! ' + MOLS[m.kind].wrong.split(':')[0] + '.', false);
          }
        } else {
          var dir = m.way === 'up' ? -1 : m.way === 'down' ? 1 : 0;
          m.y += dir * dt * 0.22;
          if (m.way === 'late') m.x += speed * dt;
          m.fade = (m.fade || 0) + dt;
        }
      });
      g.mols = g.mols.filter(function (m) { return m.fade === undefined || m.fade < 900; });
      var cur = g.mols.filter(function (o) { return !o.way; })[0];
      if (cur && cur !== g.cur) { g.cur = cur; say(MOLS[cur.kind].name + ' at the wall.'); }
      if (!g.queue.length && !g.mols.some(function (m) { return !m.way; }) && !g.endAt) g.endAt = S.now() + 700;
      if (g.endAt && S.now() >= g.endAt) g.done = true;
    };
    g.draw = function (ctx) {
      var W = g.W, H = g.H, wy = g.wallY, t = S.now();
      // The alveolus air above, the capillary below, the thin moist wall between.
      ctx.fillStyle = '#FFF4EA'; ctx.fillRect(0, 0, W, wy);
      ctx.fillStyle = '#F7E3EA'; ctx.fillRect(0, wy, W, H - wy);
      ctx.fillStyle = '#F2948C'; ctx.fillRect(0, wy - 6, W, 12);
      ctx.fillStyle = '#5BC0EB'; ctx.fillRect(0, wy - 9, W, 3);
      // Red blood cells drift along the capillary.
      for (var i = 0; i < 6; i++) {
        var x = ((g.still ? 0 : t / 22) + i * (W / 5)) % (W + 60) - 30, y = wy + (H - wy) * 0.62 + (i % 2) * 22;
        ctx.fillStyle = '#FF4B4B'; ctx.beginPath(); ctx.ellipse(x, y, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#C2364A'; ctx.beginPath(); ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, 'ALVEOLUS (air)', 14, 22, 15, '#9C5A3C', 'left');
      text(ctx, 'BLOOD in the capillary', 14, H - 22, 15, '#9C3F5C', 'left');
      if (W >= 520) { text(ctx, '\u25B2 up: into the alveolus', W - 14, 22, 15, INK, 'right'); text(ctx, '\u25BC down: into the blood', W - 14, H - 22, 15, INK, 'right'); }
      else { text(ctx, '\u25B2 tap up here', W - 14, 50, 15, INK, 'right'); text(ctx, '\u25BC tap down here', W - 14, H - 50, 15, INK, 'right'); }
      // The line a molecule must be sent before.
      ctx.strokeStyle = 'rgba(24,39,45,.35)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(g.lineX, wy - 40); ctx.lineTo(g.lineX, wy + 40); ctx.stroke(); ctx.setLineDash([]);
      var first = true;
      g.mols.forEach(function (m) {
        ctx.globalAlpha = m.fade ? Math.max(0, 1 - m.fade / 900) : 1;
        if (!m.way && first) {
          ctx.strokeStyle = '#FFC800'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(m.x, m.y, 24, 0, Math.PI * 2); ctx.stroke();
          first = false;
        }
        molecule(ctx, m.x, m.y, m.kind, 20);
        if (m.way && m.way !== 'late') text(ctx, m.ok ? '\u2713' : '\u2717', m.x + 32, m.y, 22, m.ok ? '#2BA864' : '#FF4B4B');
        ctx.globalAlpha = 1;
      });
      var left = g.sent / g.total;
      ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#58CC02'; ctx.fillRect(0, H - 6, W * left, 6);
    };
  }

  // ---------- round 3 ----------
  function setupControl(g) {
    g.co2 = 50; g.fill = 0.25; g.hold = false; g.red = 0; g.green = 0; g.phase = -1; g.end = PHASES[PHASES.length - 1].until * 1000;
    g.down = function () { g.hold = true; };
    g.up = function () { g.hold = false; };
    g.key = function (key, down) { if (key === ' ' || key === 'Spacebar' || key === 'ArrowDown' || key === 'ArrowUp') g.hold = down; };
    g.step = function (dt, el) {
      var s = dt / 1000, ph = 0;
      while (ph < PHASES.length - 1 && el / 1000 >= PHASES[ph].until) ph += 1;
      if (ph !== g.phase) { g.phase = ph; K.mascot(ph === 2 ? 'angry' : 'ok', PHASES[ph].say); flash(PHASES[ph].say, true); say(PHASES[ph].say); }
      // Breathing in fills the lungs (about 1.2 s for a full, deep breath); breathing out empties them and takes CO2 with it.
      var was = g.fill;
      g.fill = g.hold ? Math.min(1, g.fill + s / 1.2) : Math.max(0.12, g.fill - s / 0.9);
      if (g.fill < was) g.co2 -= (was - g.fill) * 34 * (g.co2 / 50);
      g.co2 += PHASES[ph].make * s;
      g.co2 = Math.max(0, Math.min(100, g.co2));
      if (g.co2 >= 35 && g.co2 <= 65) { g.green += dt; if (g.green >= 1000) { g.green -= 1000; score(2, g.W - 43, g.H * 0.4); } }
      if (g.co2 > 75) {
        g.red += dt;
        if (g.red > 2200) { g.red = 0; g.co2 = 62; hurt('Too much carbon dioxide: the blood is too acidic! Breathe faster and deeper.', (g.W - 70) / 2, g.H * 0.3); }
      } else g.red = Math.max(0, g.red - dt);
      if (g.co2 < 18 && !g.dizzy) { g.dizzy = true; flash('Too little carbon dioxide: you\'re over-breathing. Slow down.', false); }
      if (g.co2 > 25) g.dizzy = false;
      if (el >= g.end) g.done = true;
    };
    g.draw = function (ctx) {
      var W = g.W, H = g.H, cx = (W - 70) / 2, cy = H * 0.5, f = g.fill, ph = PHASES[Math.max(0, g.phase)], k = Math.min(1, (W - 90) / 300);
      ctx.fillStyle = '#E3F5FC'; ctx.fillRect(0, 0, W, H);
      pill(ctx, ph.name, cx, 22, ph.make > 8 ? '#C2364A' : INK);
      // The chest: lungs grow as you breathe in; the diaphragm flattens; the ribs swing up and out.
      var lw = (52 + f * 20) * k, lh = 104 + f * 36, top = cy - 78, dia = top + lh + 10;
      ctx.fillStyle = '#F2948C'; ctx.strokeStyle = '#B5543A'; ctx.lineWidth = 2.5;
      [-1, 1].forEach(function (side) {
        ctx.beginPath(); ctx.ellipse(cx + side * (lw * 0.62 + 8), top + lh / 2, lw * 0.62, lh / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.strokeStyle = '#5E83AD'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx, top - 30); ctx.lineTo(cx, top + 14); ctx.lineTo(cx - 22, top + 34);
      ctx.moveTo(cx, top + 14); ctx.lineTo(cx + 22, top + 34); ctx.stroke();
      ctx.strokeStyle = '#D6E6F5'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, top - 30); ctx.lineTo(cx, top + 14); ctx.lineTo(cx - 22, top + 34);
      ctx.moveTo(cx, top + 14); ctx.lineTo(cx + 22, top + 34); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = '#A89A7E'; ctx.lineWidth = 4;
      for (var i = 0; i < 4; i++) {
        var ry = top + 16 + i * (lh / 4.2), droop = 18 - f * 12;
        ctx.beginPath(); ctx.moveTo(cx - lw * 1.45, ry + droop); ctx.quadraticCurveTo(cx, ry - 12, cx + lw * 1.45, ry + droop); ctx.stroke();
      }
      ctx.strokeStyle = '#8E2433'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(cx - lw * 1.5, dia + 8); ctx.quadraticCurveTo(cx, dia - 30 * (1 - f), cx + lw * 1.5, dia + 8); ctx.stroke();
      var cap = g.hold ? ['Breathing in: muscles contract', 'diaphragm down, ribs up and out'] : ['Breathing out: muscles relax', 'the diaphragm domes up again'];
      if (W < 640) { text(ctx, cap[0], cx, H - 46, 15, INK, 'center', 800, W - 90); text(ctx, cap[1], cx, H - 25, 14, INK, 'center', 700, W - 90); }
      else text(ctx, cap.join(', '), cx, H - 25, 15, INK, 'center', 800, W - 90);
      // The CO2 meter, with its safe (green) zone.
      var mx = W - 58, mt = 46, mh = H - 110;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx, mt, 30, mh);
      ctx.fillStyle = '#C9F2DA'; ctx.fillRect(mx, mt + mh * 0.35, 30, mh * 0.3);
      ctx.fillStyle = '#FFD1D3'; ctx.fillRect(mx, mt, 30, mh * 0.25);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, mt, 30, mh);
      var ly = mt + mh * (1 - g.co2 / 100);
      ctx.fillStyle = g.co2 > 75 ? '#FF4B4B' : g.co2 >= 35 && g.co2 <= 65 ? '#2BA864' : '#E8A13C';
      ctx.beginPath(); ctx.moveTo(mx - 12, ly - 8); ctx.lineTo(mx - 2, ly); ctx.lineTo(mx - 12, ly + 8); ctx.fill();
      ctx.fillRect(mx, ly - 2, 30, 4);
      text(ctx, 'CO\u2082', mx + 15, mt - 16, 15, INK);
      text(ctx, 'acid', mx + 15, mt + 13, 14, '#EA2B2B');
      var left = Math.max(0, 1 - (g.last - g.t0) / g.end);
      ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#58CC02'; ctx.fillRect(0, H - 6, W * left, 6);
    };
  }

  // ---------- between rounds and the end ----------
  function roundEnd() {
    cancelAnimationFrame(A.raf);
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    var g = A.g, extra = '';
    // The last moment, for the end's picture.
    if (A.hearts <= 0 || A.round + 1 >= ROUNDS.length) A.snap = S.snap(g.canvas);
    if (A.round === 0 && g.reached) extra = '<p class="nr-result nr-good">You reached an alveolus: nose, pharynx, larynx, trachea, bronchus, bronchiole, alveolus.</p>';
    if (A.round === 2 && A.hearts > 0) { A.calm = true; extra = '<p class="nr-result nr-good">More carbon dioxide made the blood more acidic; the medulla sent impulses to the diaphragm and intercostal muscles to breathe faster and deeper.</p>'; }
    K.gameSeg(A.card, A.round, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { actionEnd(); return; }
    var q = ROUNDS[A.round].quiz;
    A.card.querySelector('.nr').innerHTML = S.head({ title: 'Quick question', hearts: A.hearts }) + extra +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-ba-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p>';
    buttons(A.card, [['more', 'data-am-keep', 'Close']], true);
    A.answered = false;
  }
  function actionQuiz(k, btn) {
    if (A.answered) return;
    A.answered = true;
    var q = ROUNDS[A.round].quiz, ok = k === q.a;
    btn.classList.add(ok ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (!ok) A.card.querySelector('[data-ba-opt="' + q.a + '"]').classList.add('am-run__opt--ok');
    if (ok) { score(10); K.ding(6, true); K.mascot('happy', 'Correct. Next.'); } else { K.bonk(); K.mascot('angry', 'Wrong. Learn that one.'); }
    var last = A.round + 1 >= ROUNDS.length;
    buttons(A.card, [['ok', last ? 'data-ba-end' : 'data-ba-next', last ? 'See my score' : 'Next round']]);
  }
  function actionEnd() {
    cancelAnimationFrame(A.raf);
    K.playing(false);
    var out = A.hearts <= 0;
    body(A.card, S.end({ snap: A.snap, out: out, score: A.score, best: S.best('bio-act-28', A.score),
      title: out ? 'Out of breath!' : A.calm ? 'Breathing like a pro' : 'Nearly there',
      line: out ? 'The airway in order, oxygen down into the blood, and CO\u2082 setting the pace.' : 'Nose to alveolus, across a wall one cell thick, and CO\u2082 setting how fast you breathe.',
      rounds: ROUNDS.map(function (r, i) { return { name: r.name, ok: A.res[i] }; }) }));
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ba-again', 'Play again']]);
    S.place(A.card);
    K.mascot(out ? 'furious' : 'happy', out ? 'Out of breath. Pathetic.' : 'Hmph. Your lungs would be proud.');
    if (!out && A.calm) K.later(K.fanfare, 300);
  }
  function actionClick(e) {
    if (!A || !A.card.isConnected) return;
    var t;
    if (e.target.closest('[data-ba-play]') || e.target.closest('[data-ba-overlay]')) { actionPlay(); return; }
    if ((t = e.target.closest('[data-ba-opt]'))) { actionQuiz(+t.getAttribute('data-ba-opt'), t); return; }
    if (e.target.closest('[data-ba-next]')) { A.round += 1; actionIntro(); return; }
    if (e.target.closest('[data-ba-end]')) { actionEnd(); return; }
    if (e.target.closest('[data-ba-again]')) { actionOpen(28); }
  }

  // The Games tab's picture: a fork in the airway, the molecule above it, a speck of dust.
  S.thumb(28, 'Steer oxygen to the blood', function (ctx, W, H) {
    var g = { W: W, H: H, keys: {}, still: true };
    setupAirway(g);
    g.gates.push({ y: H * 0.7, gate: GATES[1], opts: ['Larynx', 'Oesophagus'], done: false });
    g.dust.push({ x: W * 0.78, y: H * 0.42, r: 9 });
    g.px = W * 0.34; g.py = H * 0.36;
    g.draw(ctx);
  });

  window.BioActions = window.BioActions || {};
  window.BioActions[28] = { open: actionOpen };
})();

// Chapter 30's action game, Gut run, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[30].
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, S = window.BioStage;
  if (!K || !BK || !S) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  // Ride a meal through the gut. The first stop starts straight away; after each stop, a question on the next one
  // (and a last one on where the blood goes).
  // 1 mouth: you're salivary amylase: catch starch, leave the rest (enzymes are specific).
  // 2 stomach: you're pepsin: catch protein while the stomach churns; the acid kills bacteria as they fall.
  // 3 duodenum: you're lipase: fat globules must fall through the bile (emulsified) before you can digest them.
  // 4 ileum: send each product into the villus: the blood capillary or the lacteal.
  // Then where the blood goes next. Three hearts.
  var FOOD = {
    starch: { label: 'Starch', r: 24 },
    protein: { label: 'Protein', r: 22 },
    fat: { label: 'Fat globule', r: 22 },
    drop: { label: 'Fat droplet', r: 10 },
    fibre: { label: 'Fibre', r: 22 },
    bacteria: { label: 'Bacteria', r: 15 },
    glucose: { label: 'Glucose', r: 15, side: 0 },
    amino: { label: 'Amino acid', r: 13, side: 0 },
    fatty: { label: 'Fatty acid', r: 16, side: 1 },
    glycerol: { label: 'Glycerol', r: 14, side: 1 }
  };
  var STOPS = [
    { key: 'mouth', place: 'the mouth', title: 'Stop 1: The mouth', name: 'Mouth', rule: 'You are <b>amylase</b> (pH 7): catch the starch, leave the rest.', enzyme: 'AMYLASE', color: '#3E6FD8', ph: 'pH 7', bg: '#F7D0C8', secs: 20,
      ask: 'You are salivary amylase. Catch the starch and break it into maltose. Leave everything else: an enzyme only works on its own substrate.',
      gate: { q: 'The food is in your mouth. What does saliva add to it?', opts: ['Amylase, which works at about pH 7', 'Pepsin, which works at about pH 2', 'Lipase, which works at about pH 8', 'Bile, which emulsifies fat'], a: 0,
        why: 'The salivary glands add saliva with amylase. It starts breaking starch into maltose, and works best at about pH 7.' },
      mix: ['starch', 'starch', 'starch', 'protein', 'fat', 'fibre'], good: { starch: 1 }, makes: 'maltose',
      badLine: 'Not starch! Amylase only digests starch.', fibreLine: 'Fibre! Nothing in us digests it.' },
    { key: 'stomach', place: 'the stomach', title: 'Stop 2: The stomach', name: 'Stomach', rule: 'You are <b>pepsin</b> (pH 2): catch the proteins. The acid kills the bacteria.', enzyme: 'PEPSIN', color: '#7E5BA3', ph: 'pH 2', bg: '#F2A99F', secs: 20, churn: true,
      ask: 'You are pepsin. Catch the proteins and break them into peptides. The stomach churns the food from side to side, and its acid kills the bacteria as they fall.',
      gate: { q: 'Next stop, the stomach. What does gastric juice add?', opts: ['Hydrochloric acid and pepsin', 'Bile and lipase', 'Saliva and amylase', 'Insulin and glucagon'], a: 0,
        why: 'The stomach makes hydrochloric acid (pH about 2: it kills bacteria) and pepsin, a protease. The churning muscles break the food up too.' },
      mix: ['protein', 'protein', 'protein', 'starch', 'fat', 'bacteria'], good: { protein: 1 }, makes: 'peptides',
      badLine: 'Not protein! Pepsin is a protease.', fibreLine: 'Fibre! Nothing in us digests it.' },
    { key: 'duodenum', place: 'the duodenum', title: 'Stop 3: The duodenum', name: 'Duodenum', rule: 'You are <b>lipase</b> (pH 8): let fat fall through the bile, then catch the droplets.', enzyme: 'LIPASE', color: '#58CC02', ph: 'pH 8', bg: '#FBE6CC', secs: 22, bile: true,
      ask: 'You are lipase, from the pancreas. Big fat globules are too big for you: let them fall through the green bile, which emulsifies them. Catch the small droplets.',
      gate: { q: 'In the duodenum, bile arrives from the gall bladder. What does it do to fat?', opts: ['Emulsifies it into tiny droplets', 'Digests it into fatty acids and glycerol', 'Turns it into glycogen', 'Makes it more acidic'], a: 0,
        why: 'Bile salts emulsify fat: big globules become tiny droplets, a much bigger surface area for lipase. Bile also neutralises the acid from the stomach.' },
      mix: ['fat', 'fat', 'fat', 'fat', 'protein', 'starch'], good: { drop: 1 }, makes: 'fatty acids + glycerol',
      badLine: 'Not fat! Lipase only digests fat.', bigLine: 'Too big! Let the bile emulsify it first.' },
    { key: 'ileum', place: 'the ileum', title: 'Stop 4: A villus in the ileum', name: 'Ileum', rule: 'Send <b>glucose and amino acids</b> into the blood, <b>fats</b> into the lacteal.', bg: '#FBE7DA', secs: 24, sort: true,
      ask: 'Send each product into the villus: glucose and amino acids into the blood capillary, fatty acids and glycerol into the lacteal.',
      gate: { q: 'Where in the gut is most digested food absorbed?', opts: ['The ileum, through its villi', 'The stomach', 'The large intestine', 'The oesophagus'], a: 0,
        why: 'Most digested food is absorbed in the ileum (small intestine). Villi and microvilli give it a huge surface area.' },
      mix: ['glucose', 'amino', 'fatty', 'glycerol'] }
  ];
  var FINAL = { q: 'The glucose and amino acids are in the blood now. Which vessel takes them to the liver first?',
    opts: ['The hepatic portal vein', 'The hepatic artery', 'The hepatic vein', 'The vena cava'], a: 0,
    why: 'The hepatic portal vein carries blood rich in digested food from the intestine straight to the liver, which stores spare glucose as glycogen.' };
  var A = null;

  function open(ch) {
    if (ch !== 30) return;
    stopLoop();
    var card = host(ch, 'Gut run');
    card.querySelector('.am-finish__card').classList.add('act-card');
    S.watch(K.root());
    A = { card: card, stop: 0, score: 0, hearts: 3, combo: 0, made: [0, 0, 0, 0], raf: 0, res: [] };
    K.root().addEventListener('click', onClick);
    K.gameHud(card, STOPS.length, 'pts');
    intro();
    K.mascot('ok', 'Digest it properly. No shortcuts.');
  }
  function stopLoop() {
    if (!A) return;
    cancelAnimationFrame(A.raf);
    if (A.onKey) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); A.onKey = null; }
  }
  function hearts(lost) { S.hearts(A.card, A.hearts, lost); }
  function note(text, good) {
    var n = A.card.querySelector('[data-am-gnote]');
    if (n) { n.textContent = text; n.className = 'am-games__note act-note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  // The question after each stop: on the next stop (or, at the end, where the blood goes). extra: how the stop went.
  // Right answers score; the why shows either way.
  function ask(q, kind, title, extra) {
    A.q = q;
    A.qKind = kind;
    A.answered = false;
    body(A.card, '<div class="nr gr">' + S.head({ title: title, hearts: A.hearts }) + (extra || '') +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-gr-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="gr-why" data-gr-why hidden></p><p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function answer(k, btn) {
    if (A.answered) return;
    A.answered = true;
    var q = A.q, ok = k === q.a;
    btn.classList.add(ok ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (!ok) A.card.querySelector('[data-gr-opt="' + q.a + '"]').classList.add('am-run__opt--ok');
    var why = A.card.querySelector('[data-gr-why]');
    why.hidden = false;
    why.textContent = q.why;
    if (ok) { A.score += 10; K.ding(6, true); K.mascot('happy', pick(['Correct. In you go.', 'Right. Carry on.'])); }
    else { K.bonk(); K.mascot('angry', 'Wrong. Read why, then remember it.'); }
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score);
    if (A.qKind === 'final') buttons(A.card, [['ok', 'data-gr-end', 'See my score']]);
    else buttons(A.card, [['ok', 'data-gr-intro', 'Go in']]);
  }
  // A stop opens on its first frame (the place, the enzyme you are) under a card that says how to move.
  function intro() {
    var s = STOPS[A.stop];
    K.gameSeg(A.card, A.stop, 'is-current');
    body(A.card, '<div class="nr gr">' + S.head({ title: s.title, hearts: A.hearts, rule: s.rule }) +
      S.stage({ cls: 'gr-stage', canvas: 'data-gr-canvas', overlay: 'data-gr-overlay', title: s.title, more: esc(s.ask), how: s.sort ? 'Tap the left or right side, or use the arrow keys' : 'Drag, or use the arrow keys' }) + '</div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-gr-play', A.stop ? 'Go' : 'Start']]);
    S.place(A.card);
    prepare();
  }

  // ---------------------------------------------------------------- playing a stop
  function prepare() {
    var s = STOPS[A.stop], canvas = A.card.querySelector('[data-gr-canvas]'), f = S.fit(canvas), now0 = S.now();
    A.g = { s: s, W: f.W, H: f.H, ctx: f.ctx, canvas: canvas, x: f.W / 2, items: [], t0: now0, last: now0, spawn: 400, end: s.secs * 1000, keys: {}, done: false,
      bx: f.W * 0.3, bdir: 1, seen: {}, pops: [] };
    draw(A.g, f.ctx);
  }
  function play() {
    var g = A.g, s = g.s, canvas = g.canvas, ctx = g.ctx, W = g.W;
    if (g.started) return;
    g.started = true;
    K.playing(true);
    if (A.res[A.stop] == null) A.res[A.stop] = true;
    A.card.querySelector('[data-gr-overlay]').hidden = true;
    g.t0 = g.last = S.now();
    if (s.sort) {
      canvas.onpointerdown = function (e) { steer(S.point(canvas, e).x < W / 2 ? 0 : 1); };
    } else {
      canvas.onpointermove = function (e) { g.x = Math.max(54, Math.min(W - 54, S.point(canvas, e).x)); };
      canvas.onpointerdown = canvas.onpointermove;
    }
    A.onKey = function (e) {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || document.querySelector('.am-leave')) return;
      e.preventDefault();
      if (s.sort) { if (e.type === 'keydown' && !e.repeat) steer(e.key === 'ArrowLeft' ? 0 : 1); }
      else g.keys[e.key] = e.type === 'keydown';
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    var loop = function () {
      if (!A || A.g !== g) return;
      if (!canvas.isConnected) { stopLoop(); return; }
      step(g, S.now());
      draw(g, ctx);
      if (!g.done) A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  // Ileum: the lowest product not yet sent anywhere goes to the side chosen.
  function steer(side) {
    var g = A && A.g;
    if (!g || g.done) return;
    var free = g.items.filter(function (o) { return o.side == null && !o.done; }).sort(function (a, b) { return b.y - a.y; })[0];
    if (free) free.side = side;
  }
  function step(g, now) {
    var s = g.s, dt = Math.min(50, now - g.last), el = now - g.t0;
    g.last = now;
    if (g.keys.ArrowLeft) g.x = Math.max(54, g.x - dt * 0.45);
    if (g.keys.ArrowRight) g.x = Math.min(g.W - 54, g.x + dt * 0.45);
    if (s.bile) {
      // The bile duct opens at a point that drifts across the top.
      g.bx += g.bdir * dt * 0.05;
      if (g.bx > g.W * 0.72) g.bdir = -1;
      if (g.bx < g.W * 0.28) g.bdir = 1;
    }
    g.spawn -= dt;
    if (g.spawn <= 0 && el < g.end - 1500) {
      var kind = pick(s.mix), f = FOOD[kind];
      var x = s.sort ? g.W / 2 + (Math.random() - 0.5) * 40 : 34 + Math.random() * (g.W - 68);
      // The first three of each kind carry their name; after that you know them by sight.
      g.seen[kind] = (g.seen[kind] || 0) + 1;
      g.items.push({ kind: kind, x: x, x0: x, y: -f.r, vy: (s.sort ? 0.07 : 0.075 + Math.random() * 0.045) + el / g.end * 0.05, ph: Math.random() * 6, born: el, named: g.seen[kind] <= 3 });
      g.spawn = s.sort ? Math.max(900, 1500 - el / g.end * 500) : Math.max(450, 950 - el / g.end * 420);
    }
    var catchY = g.H - 58, mouthY = g.H - 64;
    g.items.forEach(function (o) {
      if (o.done) return;
      o.y += o.vy * dt;
      if (s.churn) o.x = Math.max(20, Math.min(g.W - 20, o.x0 + Math.sin(el / 520 + o.ph) * 46));
      if (s.sort && o.side != null) {
        var tx = o.side ? g.W * 0.75 : g.W * 0.25;
        o.x += (tx - o.x) * Math.min(1, dt * 0.006);
      }
      if (o.kind === 'bacteria' && !o.dead && o.y > g.H * 0.45) { o.dead = true; o.deadAt = el; }
      if (s.bile && o.kind === 'fat' && o.y > 40 && o.y < g.H * 0.55 && Math.abs(o.x - g.bx) < 30) { emulsify(g, o); return; }
      var r = FOOD[o.kind].r;
      if (s.sort) {
        if (o.y >= mouthY) { o.done = true; o.gone = true; absorbed(g, o); }
        return;
      }
      if (o.y + r >= catchY - 6 && o.y - r <= catchY + 14 && Math.abs(o.x - g.x) < 54 + r * 0.4) { o.done = true; o.gone = true; caught(g, o); }
      else if (o.y - r > g.H) o.done = true;
    });
    g.items = g.items.filter(function (o) { return !o.gone && !(o.done && o.y - 40 > g.H) && !(o.dead && el - o.deadAt > 700); });
    if (el >= g.end || A.hearts <= 0) { g.done = true; draw(g, g.ctx); roundEnd(); }
  }
  function emulsify(g, o) {
    o.gone = true;
    o.done = true;
    for (var k = 0; k < 3; k++) {
      g.items.push({ kind: 'drop', x: Math.max(20, Math.min(g.W - 20, o.x + (k - 1) * 26)), x0: o.x, y: o.y + 6, vy: o.vy * (0.9 + k * 0.08), ph: 0, born: 0, named: !g.dropNamed });
    }
    g.dropNamed = true;
    S.pop(g, o.x, o.y - 20, 'Emulsified!', '#2E7D32');
    K.sfx('splash', 0.4);
  }
  function caught(g, o) {
    var s = g.s;
    if (s.good[o.kind]) {
      A.combo += 1;
      A.score += 5;
      A.made[A.stop] += 1;
      K.ding(Math.min(10, A.combo), false);
      S.pop(g, o.x, g.H - 92, '+5 ' + s.makes, '#1E8A50');
      K.sfx('pop', 0.5);
    } else if (o.kind === 'bacteria' && o.dead) {
      return;
    } else if (o.kind === 'fat' && s.bile) {
      A.combo = 0;
      K.bonk();
      note(s.bigLine, false);
      S.pop(g, o.x, g.H - 92, 'Too big!', '#EA2B2B');
    } else {
      A.combo = 0;
      A.hearts -= 1;
      A.res[A.stop] = false;
      hearts(true);
      K.bonk();
      var line = o.kind === 'fibre' ? s.fibreLine : o.kind === 'bacteria' ? 'Bacteria! The acid kills those. Wait for it.' : s.badLine;
      note(line, false);
      S.pop(g, o.x, g.H - 92, line.split(/[!.]/)[0] + '!', '#EA2B2B', true);
      K.mascot('angry', line);
    }
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function absorbed(g, o) {
    var want = FOOD[o.kind].side;
    if (o.side == null) { A.combo = 0; note(FOOD[o.kind].label + ' was not absorbed. Send each one in!', false); S.pop(g, o.x, o.y - 30, 'Missed!', '#EA2B2B'); return; }
    if (o.side === want) {
      A.combo += 1;
      A.score += 5;
      A.made[A.stop] += 1;
      K.ding(Math.min(10, A.combo), false);
      S.pop(g, o.x, o.y - 30, '+5', '#1E8A50');
      K.sfx('pop', 0.5);
    } else {
      A.combo = 0;
      A.hearts -= 1;
      A.res[A.stop] = false;
      hearts(true);
      K.bonk();
      S.pop(g, o.x, o.y - 30, want ? 'Lacteal!' : 'Blood!', '#EA2B2B', true);
      var line = want ? FOOD[o.kind].label + 's go into the lacteal, like all the products of fat.' : FOOD[o.kind].label + 's go into the blood capillaries.';
      note(line, false);
      K.mascot('angry', want ? 'Fats go into the lacteal!' : 'Into the blood, not the lacteal!');
    }
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }

  // ---------------------------------------------------------------- drawing
  function hexagon(ctx, x, y, r, fill) {
    ctx.beginPath();
    for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k + Math.PI / 6; ctx[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); }
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.8; ctx.strokeStyle = '#18272D'; ctx.stroke();
  }
  function bead(ctx, x, y, r, fill) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.8; ctx.strokeStyle = '#18272D'; ctx.stroke();
  }
  var BEADS = ['#58CC02', '#7E5BA3', '#FF4B4B', '#3E6FD8', '#F5A03C'];
  function molecule(ctx, o) {
    var x = o.x, y = o.y, k;
    ctx.save();
    if (o.dead) ctx.globalAlpha = 0.45;
    switch (o.kind) {
      case 'starch': for (k = 0; k < 5; k++) hexagon(ctx, x - 22 + k * 11, y + (k % 2 ? 4 : -4), 6.5, '#FFC800'); break;
      case 'protein': for (k = 0; k < 6; k++) bead(ctx, x - 20 + k * 8, y + (k % 2 ? 6 : -6), 5.5, BEADS[k % 5]); break;
      case 'fat':
        bead(ctx, x, y, 21, '#FFD166');
        ctx.beginPath(); ctx.arc(x - 7, y - 7, 5, 0, Math.PI * 2); ctx.fillStyle = '#FFF1C2'; ctx.fill();
        break;
      case 'drop': bead(ctx, x, y, 9, '#FFD166'); break;
      case 'fibre':
        ctx.beginPath(); ctx.moveTo(x - 24, y);
        for (k = 1; k <= 6; k++) ctx.lineTo(x - 24 + k * 8, y + (k % 2 ? -6 : 6));
        ctx.lineWidth = 6; ctx.strokeStyle = '#3F7F2A'; ctx.lineCap = 'round'; ctx.stroke();
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#7CC45A'; ctx.stroke();
        break;
      case 'bacteria':
        ctx.beginPath(); ctx.moveTo(x - 9, y - 7); ctx.lineTo(x + 9, y - 7); ctx.arc(x + 9, y, 7, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x - 9, y + 7); ctx.arc(x - 9, y, 7, Math.PI / 2, Math.PI * 1.5);
        ctx.fillStyle = o.dead ? '#9C9484' : '#9B4A8C'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = '#18272D'; ctx.stroke();
        break;
      case 'glucose': hexagon(ctx, x, y, 12, '#FFC800'); break;
      case 'amino': bead(ctx, x, y, 11, '#58CC02'); break;
      case 'fatty':
        ctx.beginPath(); ctx.moveTo(x - 16, y);
        for (k = 1; k <= 4; k++) ctx.lineTo(x - 16 + k * 8, y + (k % 2 ? -5 : 5));
        ctx.lineWidth = 5; ctx.strokeStyle = '#C9972B'; ctx.lineCap = 'round'; ctx.stroke();
        break;
      default:
        ctx.beginPath(); ctx.moveTo(x - 4, y - 12); ctx.lineTo(x - 4, y + 12); ctx.moveTo(x - 4, y - 10); ctx.lineTo(x + 8, y - 10); ctx.moveTo(x - 4, y); ctx.lineTo(x + 8, y); ctx.moveTo(x - 4, y + 10); ctx.lineTo(x + 8, y + 10);
        ctx.lineWidth = 4; ctx.strokeStyle = '#A9822F'; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
    if (o.dead || o.named) S.label(ctx, o.dead ? 'Killed by acid' : FOOD[o.kind].label, x, y + FOOD[o.kind].r + 14, { W: A && A.g ? A.g.W : 640 });
  }
  function backdrop(g, ctx) {
    var s = g.s, W = g.W, H = g.H, t = g.last - g.t0, k;
    ctx.fillStyle = s.bg; ctx.fillRect(0, 0, W, H);
    if (s.key === 'mouth') {
      // A row of top teeth: the food falls in between them.
      ctx.fillStyle = '#FDF7E8'; ctx.strokeStyle = '#B8AE96'; ctx.lineWidth = 2;
      for (k = 0; k * 40 < W; k++) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(k * 40 + 4, -10, 32, 30, 8) : ctx.rect(k * 40 + 4, -10, 32, 30); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = '#E58C93'; ctx.beginPath(); ctx.ellipse(W / 2, H + 30, W * 0.46, 70, 0, Math.PI, 0); ctx.fill();
    } else if (s.key === 'stomach') {
      ctx.strokeStyle = '#E28C83'; ctx.lineWidth = 4;
      for (k = 0; k < 4; k++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 12) ctx.lineTo(x, 60 + k * 70 + Math.sin(x / 40 + t / 600 + k) * 8);
        ctx.stroke();
      }
      if (!K.reduced()) {
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        for (k = 0; k < 8; k++) { var bx = (k * 97 + 23) % W, by = H - ((t / 18 + k * 53) % H); ctx.beginPath(); ctx.arc(bx, by, 3 + (k % 3), 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (s.key === 'duodenum') {
      ctx.fillStyle = 'rgba(79,168,58,.26)'; ctx.fillRect(g.bx - 30, 0, 60, H * 0.55);
      ctx.fillStyle = '#4FA83A'; ctx.fillRect(g.bx - 12, 0, 24, 18);
      S.label(ctx, 'Bile', g.bx, 32, { W: W, bg: '#2E5E22', fg: '#FFFFFF' });
    } else if (s.sort) {
      // The top of a villus: the blood capillary on the left, the lacteal on the right.
      var y = H - 64;
      ctx.fillStyle = '#F7C6A8'; ctx.fillRect(0, y, W, H - y);
      ctx.fillStyle = '#FF4B4B'; ctx.fillRect(14, y + 8, W / 2 - 28, 26);
      ctx.fillStyle = '#FFF9E6'; ctx.strokeStyle = '#C9B27A'; ctx.lineWidth = 2; ctx.fillRect(W / 2 + 14, y + 8, W / 2 - 28, 26); ctx.strokeRect(W / 2 + 14, y + 8, W / 2 - 28, 26);
      ctx.font = '800 15px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('Blood capillary', W / 4, y + 21);
      ctx.fillStyle = '#18272D'; ctx.fillText('Lacteal', W * 0.75, y + 21);
      ctx.strokeStyle = 'rgba(24,39,45,.18)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, y); ctx.stroke(); ctx.setLineDash([]);
    }
    // (The pH is in the round's one line of rules above the stage: a chip here covered the food's names.)
  }
  function enzyme(g, ctx) {
    var s = g.s, x = g.x, y = g.H - 58;
    // The enzyme: a rounded body with its active site, a notch on top that its substrate fits into.
    ctx.beginPath();
    ctx.moveTo(x - 54, y - 8);
    ctx.lineTo(x - 18, y - 8); ctx.lineTo(x - 12, y + 5); ctx.lineTo(x + 12, y + 5); ctx.lineTo(x + 18, y - 8);
    ctx.lineTo(x + 54, y - 8); ctx.quadraticCurveTo(x + 59, y + 26, x, y + 28); ctx.quadraticCurveTo(x - 59, y + 26, x - 54, y - 8);
    ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = '#18272D'; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '700 15px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.enzyme.charAt(0) + s.enzyme.slice(1).toLowerCase(), x, y + 15);
  }
  function draw(g, ctx) {
    ctx.clearRect(0, 0, g.W, g.H);
    backdrop(g, ctx);
    g.items.forEach(function (o) { if (!o.gone) molecule(ctx, o); });
    if (!g.s.sort) enzyme(g, ctx);
    var left = Math.max(0, 1 - (g.last - g.t0) / g.end);
    ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, g.H - 6, g.W, 6);
    ctx.fillStyle = left < 0.2 ? '#FF4B4B' : '#58CC02'; ctx.fillRect(0, g.H - 6, g.W * left, 6);
    S.drawPops(ctx, g);
  }

  // ---------------------------------------------------------------- between stops and the end
  var MADE = ['starch molecules broken into maltose', 'proteins broken into peptides', 'fat droplets broken into fatty acids and glycerol', 'products absorbed into the right vessel'];
  // After a stop: how it went, then the question on the next stop (or the last question).
  function roundEnd() {
    stopLoop();
    var i = A.stop, last = i + 1 >= STOPS.length;
    if (A.hearts <= 0 || last) A.snap = S.snap(A.g.canvas);
    K.gameSeg(A.card, i, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { end(); return; }
    var done = '<p class="nr-result nr-good">' + esc(STOPS[i].title.replace(/^Stop \d: /, '')) + ': <b>' + A.made[i] + '</b> ' + MADE[i] + '.</p>';
    if (last) ask(FINAL, 'final', 'Last question', done);
    else ask(STOPS[i + 1].gate, 'gate', 'Next stop: ' + STOPS[i + 1].place, done);
    K.mascot('happy', pick(['Hmph. Digested.', 'Fine. Keep moving.', 'Acceptable.']));
  }
  function end() {
    stopLoop();
    K.playing(false);
    var out = A.hearts <= 0;
    if (!out && A.hearts === 3) A.score += 20;
    body(A.card, S.end({ snap: A.snap, out: out, score: A.score, best: S.best('bio-act-30', A.score),
      title: out ? 'Indigestion!' : A.hearts === 3 ? 'Fully digested' : 'Digested, mostly',
      line: out ? 'Each enzyme digests only its own substrate, and bile emulsifies fat before lipase can get at it.' : 'Starch to maltose, protein to peptides, fat to fatty acids and glycerol, then into the blood or the lacteal.',
      rounds: STOPS.map(function (s, k) { return { name: s.name, ok: A.res[k] }; }) }));
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-gr-again', 'Play again']]);
    S.place(A.card);
    K.mascot(out ? 'furious' : 'happy', out ? 'Indigestion. Disgraceful.' : 'Hmph. Your gut would be proud.');
    if (!out && A.hearts === 3) K.later(K.fanfare, 300);
  }
  function onClick(e) {
    if (!A || !A.card.isConnected) return;
    var t;
    if ((t = e.target.closest('[data-gr-opt]'))) { answer(+t.getAttribute('data-gr-opt'), t); return; }
    if (e.target.closest('[data-gr-intro]')) { A.stop += 1; intro(); return; }
    if (e.target.closest('[data-gr-play]') || e.target.closest('[data-gr-overlay]')) { play(); return; }
    if (e.target.closest('[data-gr-end]')) { end(); return; }
    if (e.target.closest('[data-gr-again]')) { open(30); }
  }

  // The Games tab's picture: the stomach churning, pepsin catching a protein.
  S.thumb(30, 'Digest a meal, enzyme by enzyme', function (ctx, W, H) {
    var g = { s: STOPS[1], W: W, H: H, x: W * 0.5, items: [{ kind: 'protein', x: W * 0.3, y: H * 0.3 }, { kind: 'starch', x: W * 0.72, y: H * 0.45 }, { kind: 'bacteria', x: W * 0.5, y: H * 0.18 }], t0: 0, last: 0, end: 1, bx: W * 0.3 };
    draw(g, ctx);
  });

  // peek: for tests, what is on the canvas right now.
  function peek() {
    if (!A || !A.g || A.g.done) return null;
    return { stop: A.stop, x: A.g.x, W: A.g.W, H: A.g.H, items: A.g.items.filter(function (o) { return !o.gone && !o.done; }).map(function (o) {
      return { kind: o.kind, x: o.x, y: o.y, dead: Boolean(o.dead), side: o.side };
    }) };
  }
  window.BioActions = window.BioActions || {};
  window.BioActions[30] = { open: open, peek: peek };
})();

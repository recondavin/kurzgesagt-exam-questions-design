// Chapter 30's action game, Gut run, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[30].
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  // Ride a meal through the gut. Before each stop, a question on what happens there; then play it.
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
    { key: 'mouth', place: 'the mouth', title: 'Stop 1: The mouth', enzyme: 'AMYLASE', color: '#3E6FD8', ph: 'pH 7', bg: '#F7D0C8', secs: 20,
      ask: 'You are salivary amylase. Catch the starch and break it into maltose. Leave everything else: an enzyme only works on its own substrate.',
      gate: { q: 'The food is in your mouth. What does saliva add to it?', opts: ['Amylase, which works at about pH 7', 'Pepsin, which works at about pH 2', 'Lipase, which works at about pH 8', 'Bile, which emulsifies fat'], a: 0,
        why: 'The salivary glands add saliva with amylase. It starts breaking starch into maltose, and works best at about pH 7.' },
      mix: ['starch', 'starch', 'starch', 'protein', 'fat', 'fibre'], good: { starch: 1 }, makes: 'maltose',
      badLine: 'Not starch! Amylase only digests starch.', fibreLine: 'Fibre! Nothing in us digests it.' },
    { key: 'stomach', place: 'the stomach', title: 'Stop 2: The stomach', enzyme: 'PEPSIN', color: '#7E5BA3', ph: 'pH 2', bg: '#F2A99F', secs: 20, churn: true,
      ask: 'You are pepsin. Catch the proteins and break them into peptides. The stomach churns the food from side to side, and its acid kills the bacteria as they fall.',
      gate: { q: 'Next stop, the stomach. What does gastric juice add?', opts: ['Hydrochloric acid and pepsin', 'Bile and lipase', 'Saliva and amylase', 'Insulin and glucagon'], a: 0,
        why: 'The stomach makes hydrochloric acid (pH about 2: it kills bacteria) and pepsin, a protease. The churning muscles break the food up too.' },
      mix: ['protein', 'protein', 'protein', 'starch', 'fat', 'bacteria'], good: { protein: 1 }, makes: 'peptides',
      badLine: 'Not protein! Pepsin is a protease.', fibreLine: 'Fibre! Nothing in us digests it.' },
    { key: 'duodenum', place: 'the duodenum', title: 'Stop 3: The duodenum', enzyme: 'LIPASE', color: '#58CC02', ph: 'pH 8', bg: '#FBE6CC', secs: 22, bile: true,
      ask: 'You are lipase, from the pancreas. Big fat globules are too big for you: let them fall through the green bile, which emulsifies them. Catch the small droplets.',
      gate: { q: 'In the duodenum, bile arrives from the gall bladder. What does it do to fat?', opts: ['Emulsifies it into tiny droplets', 'Digests it into fatty acids and glycerol', 'Turns it into glycogen', 'Makes it more acidic'], a: 0,
        why: 'Bile salts emulsify fat: big globules become tiny droplets, a much bigger surface area for lipase. Bile also neutralises the acid from the stomach.' },
      mix: ['fat', 'fat', 'fat', 'fat', 'protein', 'starch'], good: { drop: 1 }, makes: 'fatty acids + glycerol',
      badLine: 'Not fat! Lipase only digests fat.', bigLine: 'Too big! Let the bile emulsify it first.' },
    { key: 'ileum', place: 'the ileum', title: 'Stop 4: A villus in the ileum', bg: '#FBE7DA', secs: 24, sort: true,
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
    A = { card: card, stop: 0, score: 0, hearts: 3, combo: 0, made: [0, 0, 0, 0], raf: 0 };
    K.root().addEventListener('click', onClick);
    K.gameHud(card, STOPS.length, 'pts');
    gate(0);
    K.mascot('ok', 'Digest it properly. No shortcuts.');
  }
  function stopLoop() {
    if (!A) return;
    cancelAnimationFrame(A.raf);
    if (A.onKey) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); A.onKey = null; }
  }
  function hearts() {
    var h = A.card.querySelector('[data-nr-hearts]');
    if (h) h.textContent = '♥'.repeat(Math.max(0, A.hearts)) + '♡'.repeat(Math.max(0, 3 - A.hearts));
  }
  function note(text, good) {
    var n = A.card.querySelector('[data-am-gnote]');
    if (n) { n.textContent = text; n.className = 'am-games__note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  // The question before each stop (and the last one): what happens there. Right answers score; the why shows either way.
  function ask(q, kind, title) {
    A.q = q;
    A.qKind = kind;
    A.answered = false;
    body(A.card, '<div class="nr gr"><div class="am-run__top"><h3 class="am-run__kind">' + esc(title) + '</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-gr-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="gr-why" data-gr-why hidden></p><p class="am-games__note" data-am-gnote role="status"></p></div>');
    hearts();
    buttons(A.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function gate(i) {
    A.stop = i;
    K.gameSeg(A.card, i, 'is-current');
    ask(STOPS[i].gate, 'gate', i ? 'Next stop: ' + STOPS[i].place : 'First stop: ' + STOPS[i].place);
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
  function intro() {
    var s = STOPS[A.stop];
    body(A.card, '<div class="nr gr"><div class="am-run__top"><h3 class="am-run__kind">' + esc(s.title) + '</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + esc(s.ask) + '</p><div class="nr-stage gr-stage"><canvas class="nr-canvas" data-gr-canvas aria-label="' + esc(s.title) + '"></canvas>' +
      '<div class="nr-overlay" data-gr-overlay><p>' + (s.sort ? 'Tap the left or right side, or use the arrow keys.' : 'Move with your finger, the mouse or the arrow keys.') + '</p></div></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    hearts();
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-gr-play', 'Start']]);
  }

  // ---------------------------------------------------------------- playing a stop
  function play() {
    var s = STOPS[A.stop], canvas = A.card.querySelector('[data-gr-canvas]'), ctx = canvas.getContext('2d');
    A.card.querySelector('[data-gr-overlay]').hidden = true;
    var rect = canvas.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var W = Math.min(640, Math.round(rect.width)), H = Math.round(Math.min(420, Math.max(320, W * 0.66)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var now0 = performance.now();
    var g = A.g = { s: s, W: W, H: H, x: W / 2, items: [], bits: [], t0: now0, last: now0, spawn: 400, end: s.secs * 1000, keys: {}, done: false,
      bx: W * 0.3, bdir: 1 };
    if (s.sort) {
      canvas.onpointerdown = function (e) { var b = canvas.getBoundingClientRect(); steer(e.clientX - b.left < b.width / 2 ? 0 : 1); };
    } else {
      canvas.onpointermove = function (e) { var b = canvas.getBoundingClientRect(); g.x = Math.max(46, Math.min(W - 46, (e.clientX - b.left) * W / b.width)); };
      canvas.onpointerdown = canvas.onpointermove;
    }
    A.onKey = function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      if (s.sort) { if (e.type === 'keydown' && !e.repeat) steer(e.key === 'ArrowLeft' ? 0 : 1); }
      else g.keys[e.key] = e.type === 'keydown';
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    var loop = function (now) {
      if (!A || A.g !== g) return;
      if (!canvas.isConnected) { stopLoop(); return; }
      step(g, now);
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
    if (g.keys.ArrowLeft) g.x = Math.max(46, g.x - dt * 0.45);
    if (g.keys.ArrowRight) g.x = Math.min(g.W - 46, g.x + dt * 0.45);
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
      g.items.push({ kind: kind, x: x, x0: x, y: -f.r, vy: (s.sort ? 0.07 : 0.075 + Math.random() * 0.045) + el / g.end * 0.05, ph: Math.random() * 6, born: el });
      g.spawn = s.sort ? Math.max(900, 1500 - el / g.end * 500) : Math.max(450, 950 - el / g.end * 420);
    }
    var catchY = g.H - 46, mouthY = g.H - 64;
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
      if (o.y + r >= catchY - 6 && o.y - r <= catchY + 14 && Math.abs(o.x - g.x) < 46 + r * 0.4) { o.done = true; o.gone = true; caught(g, o); }
      else if (o.y - r > g.H) o.done = true;
    });
    g.items = g.items.filter(function (o) { return !o.gone && !(o.done && o.y - 40 > g.H) && !(o.dead && el - o.deadAt > 700); });
    g.bits = g.bits.filter(function (b) { b.y -= dt * 0.05; b.life -= dt; return b.life > 0; });
    if (el >= g.end || A.hearts <= 0) { g.done = true; roundEnd(); }
  }
  function emulsify(g, o) {
    o.gone = true;
    o.done = true;
    for (var k = 0; k < 3; k++) {
      g.items.push({ kind: 'drop', x: Math.max(20, Math.min(g.W - 20, o.x + (k - 1) * 26)), x0: o.x, y: o.y + 6, vy: o.vy * (0.9 + k * 0.08), ph: 0, born: 0 });
    }
    if (!K.reduced()) g.bits.push({ x: o.x, y: o.y, text: 'Emulsified!', life: 700, color: '#2E7D32' });
  }
  function caught(g, o) {
    var s = g.s;
    if (s.good[o.kind]) {
      A.combo += 1;
      A.score += 5;
      A.made[A.stop] += 1;
      K.ding(Math.min(10, A.combo), false);
      if (!K.reduced()) g.bits.push({ x: o.x, y: g.H - 70, text: '+ ' + s.makes, life: 650, color: '#18272D' });
    } else if (o.kind === 'bacteria' && o.dead) {
      return;
    } else if (o.kind === 'fat' && s.bile) {
      A.combo = 0;
      K.bonk();
      note(s.bigLine, false);
    } else {
      A.combo = 0;
      A.hearts -= 1;
      hearts();
      K.bonk();
      var line = o.kind === 'fibre' ? s.fibreLine : o.kind === 'bacteria' ? 'Bacteria! The acid kills those. Wait for it.' : s.badLine;
      note(line, false);
      K.mascot('angry', line);
    }
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function absorbed(g, o) {
    var want = FOOD[o.kind].side;
    if (o.side == null) { A.combo = 0; note(FOOD[o.kind].label + ' was not absorbed. Send each one in!', false); return; }
    if (o.side === want) {
      A.combo += 1;
      A.score += 5;
      A.made[A.stop] += 1;
      K.ding(Math.min(10, A.combo), false);
    } else {
      A.combo = 0;
      A.hearts -= 1;
      hearts();
      K.bonk();
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
    ctx.fillStyle = '#18272D'; ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.dead ? 'Killed by acid' : FOOD[o.kind].label, x, y + FOOD[o.kind].r + 10);
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
      ctx.fillStyle = '#2E5E22'; ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BILE', g.bx, 30);
    } else if (s.sort) {
      // The top of a villus: the blood capillary on the left, the lacteal on the right.
      var y = H - 64;
      ctx.fillStyle = '#F7C6A8'; ctx.fillRect(0, y, W, H - y);
      ctx.fillStyle = '#FF4B4B'; ctx.fillRect(14, y + 8, W / 2 - 28, 26);
      ctx.fillStyle = '#FFF9E6'; ctx.strokeStyle = '#C9B27A'; ctx.lineWidth = 2; ctx.fillRect(W / 2 + 14, y + 8, W / 2 - 28, 26); ctx.strokeRect(W / 2 + 14, y + 8, W / 2 - 28, 26);
      ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; ctx.fillText('BLOOD CAPILLARY', W / 4, y + 21);
      ctx.fillStyle = '#18272D'; ctx.fillText('LACTEAL', W * 0.75, y + 21);
      ctx.strokeStyle = 'rgba(24,39,45,.18)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, y); ctx.stroke(); ctx.setLineDash([]);
    }
    if (!s.sort) {
      // Which enzyme you are, and the pH here.
      ctx.fillStyle = '#18272D';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(10, 10, 66, 26, 13) : ctx.rect(10, 10, 66, 26); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.font = '700 14px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.ph, 43, 24);
    }
  }
  function enzyme(g, ctx) {
    var s = g.s, x = g.x, y = g.H - 46;
    // The enzyme: a rounded body with its active site, a notch on top that its substrate fits into.
    ctx.beginPath();
    ctx.moveTo(x - 46, y - 8);
    ctx.lineTo(x - 16, y - 8); ctx.lineTo(x - 10, y + 4); ctx.lineTo(x + 10, y + 4); ctx.lineTo(x + 16, y - 8);
    ctx.lineTo(x + 46, y - 8); ctx.quadraticCurveTo(x + 50, y + 20, x, y + 22); ctx.quadraticCurveTo(x - 50, y + 20, x - 46, y - 8);
    ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#18272D'; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = '700 12px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.enzyme, x, y + 12);
  }
  function draw(g, ctx) {
    ctx.clearRect(0, 0, g.W, g.H);
    backdrop(g, ctx);
    g.items.forEach(function (o) { if (!o.gone) molecule(ctx, o); });
    if (!g.s.sort) enzyme(g, ctx);
    g.bits.forEach(function (b) {
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life / 400));
      ctx.fillStyle = b.color; ctx.font = '800 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(b.text, b.x, b.y);
      ctx.globalAlpha = 1;
    });
    var left = Math.max(0, 1 - (g.last - g.t0) / g.end);
    ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, g.H - 6, g.W, 6);
    ctx.fillStyle = '#58CC02'; ctx.fillRect(0, g.H - 6, g.W * left, 6);
  }

  // ---------------------------------------------------------------- between stops and the end
  var MADE = ['starch molecules broken into maltose', 'proteins broken into peptides', 'fat droplets broken into fatty acids and glycerol', 'products absorbed into the right vessel'];
  function roundEnd() {
    stopLoop();
    var i = A.stop;
    K.gameSeg(A.card, i, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { end(); return; }
    var last = i + 1 >= STOPS.length;
    A.card.querySelector('.gr').innerHTML = '<div class="am-run__top"><h3 class="am-run__kind">' + esc(STOPS[i].title) + ': done</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="nr-result nr-good"><b>' + A.made[i] + '</b> ' + MADE[i] + '.</p><p class="am-games__ask">' + esc(last ? 'One last question.' : 'On to ' + STOPS[i + 1].place + '.') + '</p>';
    hearts();
    buttons(A.card, [['ok', 'data-gr-next', last ? 'Last question' : 'Next stop']]);
    K.mascot('happy', pick(['Hmph. Digested.', 'Fine. Keep moving.', 'Acceptable.']));
  }
  function end() {
    stopLoop();
    var best = +K.store('bio-act-30') || 0, out = A.hearts <= 0;
    if (!out && A.hearts === 3) A.score += 20;
    var newBest = A.score > best;
    if (newBest) K.store('bio-act-30', String(A.score));
    body(A.card, '<div class="am-games__end"><p class="am-games__big">' + A.score + '<span> pts</span></p>' +
      '<h3 class="am-games__title">' + (out ? 'Indigestion!' : A.hearts === 3 ? 'Fully digested' : 'Digested, mostly') + '</h3>' +
      '<p class="am-games__sub">' + (out ? 'Out of hearts. Remember: each enzyme digests only its own substrate, and bile emulsifies fat before lipase can get at it.' :
        'Amylase: starch to maltose. Pepsin: protein to peptides. Bile emulsifies fat; lipase makes fatty acids and glycerol. Glucose and amino acids go into the blood, fats into the lacteal, then the hepatic portal vein takes the blood to the liver.') +
      (newBest && best ? ' <b>New best!</b>' : best ? ' Your best: ' + best + '.' : '') + '</p></div>');
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-gr-again', 'Play again']]);
    K.mascot(out ? 'furious' : 'happy', out ? 'Indigestion. Disgraceful.' : 'Hmph. Your gut would be proud.');
    if (!out && A.hearts === 3) K.later(K.fanfare, 300);
  }
  function onClick(e) {
    if (!A) return;
    var t;
    if ((t = e.target.closest('[data-gr-opt]'))) { answer(+t.getAttribute('data-gr-opt'), t); return; }
    if (e.target.closest('[data-gr-intro]')) { intro(); return; }
    if (e.target.closest('[data-gr-play]')) { play(); return; }
    if (e.target.closest('[data-gr-next]')) {
      if (A.stop + 1 >= STOPS.length) ask(FINAL, 'final', 'Last question'); else gate(A.stop + 1);
      return;
    }
    if (e.target.closest('[data-gr-end]')) { end(); return; }
    if (e.target.closest('[data-gr-again]')) { open(30); }
  }

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

// Chapter 32's action game, Immune chase, in answer-mode.js's practice host (cards, the examiner, sounds).
// Three rounds inside the body, each opened by a question you must answer first (label the virus, or four options):
//   1. You are a B lymphocyte: chase the flu viruses and mark them with antibodies (they only fit the flu's antigen);
//      macrophages then engulf the marked ones. Touching your own cells costs a heart.
//   2. You are a killer T cell: hunt the infected body cells (they show the flu antigen on their membrane) before they
//      burst and infect their neighbours. Healthy cells cost a heart.
//   3. The flu is back: as a memory cell you are faster and make more antibodies, so you clear it far quicker
//      (the secondary response). A question after each round. Three hearts.
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[32]. Best in localStorage bio-act-32.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  var INK = '#18272D';
  var KINDS = {
    flu: { label: 'Flu virus', r: 14 },
    cold: { label: 'Cold virus', r: 14 },
    bact: { label: 'Bacterium', r: 17 },
    rbc: { label: 'Red cell', r: 13 },
    body: { label: 'Body cell', r: 23 },
    inf: { label: 'Infected', r: 23 },
    mac: { label: 'Macrophage', r: 20 }
  };
  var ROUNDS = [
    { role: 'b', title: 'Round 1: You are a B lymphocyte', secs: 30, target: 'flu', count: 7, decoys: { cold: 3, bact: 2, rbc: 6 },
      ask: 'Your antibodies fit one antigen only: the flu virus\'s green spikes. Chase the flu viruses to mark them, and keep off your own cells.',
      pre: { q: 'Label it first: what is the ringed part of this flu virus?', pic: ['virus', 'spike'],
        opts: ['An antigen (a spike protein)', 'The nucleic acid', 'An antibody', 'The cell membrane'], a: 0,
        why: 'The spikes are antigens: the shape your antibodies lock onto.' },
      quiz: { q: 'What happens to a pathogen once antibodies have locked onto it?', opts: ['Phagocytes, such as macrophages, engulf and destroy it', 'It turns into a memory cell', 'It is filtered out by the kidneys', 'Its nucleic acid is copied'], a: 0 } },
    { role: 't', title: 'Round 2: You are a killer T cell', secs: 30, target: 'inf',
      ask: 'Infected body cells show the flu antigen on their membrane. Destroy them before they burst and infect their neighbours. Leave healthy cells alone.',
      pre: { q: 'A helper T cell shows you the flu antigen. Which cells do you destroy?',
        opts: ['Body cells showing that antigen on their membrane', 'Every body cell near the virus', 'Red blood cells', 'Free viruses in the blood plasma'], a: 0,
        why: 'Killer T cells destroy infected body cells, so the virus can\'t multiply in them. Free viruses are marked by antibodies.' },
      quiz: { q: 'What does a killer T cell release to burst an infected cell?', opts: ['Perforin', 'Antibodies', 'Antibiotics', 'Haemoglobin'], a: 0 } },
    { role: 'm', title: 'Round 3: The flu is back', secs: 20, target: 'flu', count: 8, decoys: { cold: 2, bact: 2, rbc: 5 },
      ask: 'The same flu virus has got in again. Memory cells recognise it at once: you are faster and make far more antibodies. Mark them all, quick.',
      pre: { q: 'Why will the body beat it so much faster this time?',
        opts: ['Memory cells recognise its antigen straight away', 'The virus is weaker the second time', 'Antibiotics help the second time', 'Red blood cells remember the virus'], a: 0,
        why: 'Memory cells made in the first infection (or by a vaccine) make lots of antibodies fast: the secondary response.' },
      quiz: { q: 'Making your own antibodies and memory cells, as you just did, gives which kind of immunity?', opts: ['Active immunity', 'Passive immunity', 'Innate immunity', 'Autoimmunity'], a: 0 } }
  ];
  var A = null;

  function open(ch) {
    if (ch !== 32) return;
    if (A) stop();
    var card = host(32, 'Immune chase');
    A = { card: card, round: 0, score: 0, hearts: 3, raf: 0, times: [], combo: 0 };
    K.root().addEventListener('click', onClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    intro();
  }
  function stop() {
    if (!A) return;
    cancelAnimationFrame(A.raf);
    if (A.onKey) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); }
  }
  function heartsHtml() { return '<span class="am-games__step nr-hearts" data-ic-hearts>' + '♥'.repeat(Math.max(0, A.hearts)) + '♡'.repeat(Math.max(0, 3 - A.hearts)) + '</span>'; }
  function hearts() { var h = A.card.querySelector('[data-ic-hearts]'); if (h) h.outerHTML = heartsHtml(); }
  function note(text, good) {
    var n = A.card.querySelector('[data-am-gnote]');
    if (n) { n.textContent = text; n.className = 'am-games__note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  function score(add) {
    A.score = Math.max(0, A.score + add);
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }

  // ---------- before each round: label it, or four options
  function picSvg(pic) {
    var art = window.BioArt && window.BioArt[pic[0]];
    if (!art) return '';
    var p = art.anchors[pic[1]];
    return '<div class="ic-pic" aria-hidden="true">' + art.plain.replace(/<\/svg>$/, '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" fill="none" stroke="#FFC800" stroke-width="5"/>' +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + INK + '" stroke="#FFFFFF" stroke-width="2"/></svg>') + '</div>';
  }
  function intro() {
    var r = ROUNDS[A.round], pre = r.pre;
    K.gameSeg(A.card, A.round, 'is-current');
    A.answered = false;
    body(A.card, '<div class="ic"><div class="am-run__top"><h3 class="am-run__kind">' + esc(r.title) + '</h3>' + heartsHtml() + '</div>' +
      '<p class="am-games__ask">' + esc(pre.q) + '</p>' + (pre.pic ? picSvg(pre.pic) : '') +
      '<div class="am-run__opts">' + shuffle(pre.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-ic-pre="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close']], true);
    if (!A.round) K.mascot('ok', 'You are the immune system. Don\'t let me down.');
  }
  function preAnswer(k, btn) {
    if (A.answered) return;
    A.answered = true;
    var pre = ROUNDS[A.round].pre, ok = k === pre.a;
    btn.classList.add(ok ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (!ok) A.card.querySelector('[data-ic-pre="' + pre.a + '"]').classList.add('am-run__opt--ok');
    if (ok) { score(10); K.ding(5, true); K.mascot('happy', 'Correct. Now go.'); } else { K.bonk(); K.mascot('angry', 'Wrong. Read the answer.'); }
    note((ok ? 'Right. ' : 'Not that one. ') + pre.why, ok);
    buttons(A.card, [['ok', 'data-ic-ready', 'Into the body']]);
  }
  function stage() {
    var r = ROUNDS[A.round];
    body(A.card, '<div class="ic"><div class="am-run__top"><h3 class="am-run__kind">' + esc(r.title) + '</h3>' + heartsHtml() + '</div>' +
      '<p class="am-games__ask">' + esc(r.ask) + '</p><div class="nr-stage ic-stage"><canvas class="nr-canvas" data-ic-canvas aria-label="' + esc(r.title) + ': a chase game"></canvas>' +
      '<div class="nr-overlay" data-ic-overlay><p>Move with your finger, the mouse or the arrow keys.</p></div></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ic-play', 'Go']]);
    prepare();
  }

  // ---------- the chase
  function rand(a, b) { return a + Math.random() * (b - a); }
  function spawn(g, kind, x, y) {
    var k = KINDS[kind], sp = g.slow * (kind === 'rbc' ? 0.035 : kind === 'body' || kind === 'inf' ? 0.008 : 0.05);
    var o = { kind: kind, r: k.r, x: x === undefined ? rand(40, g.W - 40) : x, y: y === undefined ? rand(40, g.H - 50) : y,
      vx: rand(-sp, sp), vy: rand(-sp, sp), ang: rand(0, 6.28), spin: rand(-0.001, 0.001) };
    if (kind === 'inf') o.burst = o.full = g.burstMs + rand(-1500, 1500);
    g.items.push(o);
    return o;
  }
  function farFromPlayer(g, x, y) { return Math.hypot(x - g.px, y - g.py) > 110; }
  function setup(g, r) {
    g.px = g.W / 2; g.py = g.H / 2;
    if (r.role === 't') {
      // A sheet of body cells, three of them infected.
      var cols = Math.max(3, Math.floor(g.W / 92)), rows = Math.max(3, Math.floor((g.H - 30) / 86)), cells = [];
      for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
        var x = (i + 0.5) * g.W / cols + rand(-10, 10), y = (j + 0.5) * (g.H - 24) / rows + rand(-8, 8);
        if (Math.hypot(x - g.px, y - g.py) < 40) continue;
        cells.push(spawn(g, 'body', x, y));
      }
      shuffle(cells).slice(0, 3).forEach(function (c) { infect(g, c); });
      // More viruses arrive from the blood every few seconds and infect another cell or two.
      g.waves = [5000, 10000, 15000, 19000];
      return;
    }
    // Fewer of everything on a small screen.
    var fit = Math.max(0.5, Math.min(1, g.W * g.H / (640 * 420)));
    Object.keys(r.decoys).forEach(function (kind) {
      for (var n = 0; n < Math.max(1, Math.round(r.decoys[kind] * fit)); n++) { var o = spawn(g, kind); if (!farFromPlayer(g, o.x, o.y)) { o.x = rand(30, 90); } }
    });
    g.count = Math.round(r.count * (0.6 + 0.4 * fit));
    for (var t = 0; t < g.count; t++) {
      var f = spawn(g, 'flu');
      while (!farFromPlayer(g, f.x, f.y)) { f.x = rand(30, g.W - 30); f.y = rand(30, g.H - 50); }
    }
  }
  function infect(g, c) {
    c.kind = 'inf';
    c.burst = c.full = g.burstMs + rand(-1500, 1500);
    c.born = g.el;
  }
  // Size the canvas, put everything in place and draw it once behind the "how to move" overlay.
  function prepare() {
    var r = ROUNDS[A.round], canvas = A.card.querySelector('[data-ic-canvas]'), ctx = canvas.getContext('2d');
    var rect = canvas.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var W = Math.min(640, Math.round(rect.width)), H = Math.round(Math.min(420, Math.max(320, W * 0.66)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var calm = K.reduced();
    var g = A.g = { W: W, H: H, items: [], fx: [], t0: performance.now(), last: performance.now(), el: 0, end: r.secs * 1000, keys: {}, tx: null, ty: null,
      slow: calm ? 0.7 : 1, burstMs: calm ? 11000 : 9000, marked: 0, eaten: 0, killed: 0, burst: 0, macs: 0, done: false, clearAt: 0, calm: calm };
    g.speed = r.role === 'm' ? 0.3 : 0.22;
    g.pr = r.role === 'm' ? 22 : r.role === 't' ? 19 : 18;
    g.reach = r.role === 'm' ? 26 : 4;
    g.safe = 0;
    setup(g, r);
    draw(r, g, ctx);
  }
  function play() {
    var r = ROUNDS[A.round], canvas = A.card.querySelector('[data-ic-canvas]'), ctx = canvas.getContext('2d'), g = A.g, W = g.W, H = g.H;
    A.card.querySelector('[data-ic-overlay]').hidden = true;
    g.t0 = g.last = performance.now();
    var aim = function (e) { var b = canvas.getBoundingClientRect(); g.tx = Math.max(10, Math.min(W - 10, e.clientX - b.left)); g.ty = Math.max(10, Math.min(H - 16, e.clientY - b.top)); };
    canvas.onpointermove = aim;
    canvas.onpointerdown = function (e) { aim(e); if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not a captureable pointer */ } } };
    A.onKey = function (e) {
      if (/^Arrow/.test(e.key)) { g.keys[e.key] = e.type === 'keydown'; g.tx = null; e.preventDefault(); }
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    if (r.role === 't') K.mascot('ok', 'Infected cells only. Not the healthy ones.');
    else if (r.role === 'm') K.mascot('ok', 'You\'ve seen it before. Prove it.');
    var loop = function (now) {
      if (!A || A.g !== g) return;
      if (!canvas.isConnected) { stop(); return; }
      step(r, g, now);
      draw(r, g, ctx);
      if (!g.done) A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  function step(r, g, now) {
    var dt = Math.min(50, now - g.last);
    g.last = now;
    g.el = now - g.t0;
    // You.
    var mx = (g.keys.ArrowRight ? 1 : 0) - (g.keys.ArrowLeft ? 1 : 0), my = (g.keys.ArrowDown ? 1 : 0) - (g.keys.ArrowUp ? 1 : 0);
    if (mx || my) { var l = Math.hypot(mx, my); g.px += mx / l * g.speed * dt; g.py += my / l * g.speed * dt; }
    else if (g.tx !== null) {
      var dx = g.tx - g.px, dy = g.ty - g.py, d = Math.hypot(dx, dy), s = Math.min(d, g.speed * dt);
      if (d > 0.5) { g.px += dx / d * s; g.py += dy / d * s; }
    }
    g.px = Math.max(g.pr, Math.min(g.W - g.pr, g.px));
    g.py = Math.max(g.pr, Math.min(g.H - 12 - g.pr, g.py));
    // Everything else drifts; the targets run from you.
    g.items.forEach(function (o) {
      if (o.gone) return;
      o.ang += o.spin * dt;
      if (o.kind === 'mac') { macStep(g, o, dt); return; }
      if (o.kind === 'flu' && !o.marked) {
        var ex = o.x - g.px, ey = o.y - g.py, ed = Math.hypot(ex, ey);
        if (ed < 120 && ed > 0) { o.vx += ex / ed * 0.0006 * dt; o.vy += ey / ed * 0.0006 * dt; }
        o.vx += rand(-0.00012, 0.00012) * dt; o.vy += rand(-0.00012, 0.00012) * dt;
        var sp = Math.hypot(o.vx, o.vy), max = (ed < 120 ? 0.13 : 0.06) * g.slow * (r.role === 'm' ? 1.1 : 1);
        if (sp > max) { o.vx *= max / sp; o.vy *= max / sp; }
      } else if (o.marked) { o.vx *= 0.96; o.vy *= 0.96; }
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.x < o.r) { o.x = o.r; o.vx = Math.abs(o.vx); }
      if (o.x > g.W - o.r) { o.x = g.W - o.r; o.vx = -Math.abs(o.vx); }
      if (o.y < o.r) { o.y = o.r; o.vy = Math.abs(o.vy); }
      if (o.y > g.H - 14 - o.r) { o.y = g.H - 14 - o.r; o.vy = -Math.abs(o.vy); }
      // Touching it.
      // Your antibody cloud (reach) only counts for marking the flu; your own cells only count when you really touch them.
      var touch = Math.hypot(o.x - g.px, o.y - g.py) < g.pr + (o.kind === 'flu' ? g.reach + o.r : o.kind === 'inf' ? 4 + o.r : o.kind === 'rbc' ? o.r * 0.6 : o.kind === 'body' ? o.r * 0.7 : o.r * 0.8);
      if (touch) hit(r, g, o, now);
      if (o.kind === 'inf') { o.burst -= dt; if (o.burst <= 0) burst(g, o); }
    });
    g.items = g.items.filter(function (o) { return !o.gone; });
    g.fx = g.fx.filter(function (f) { return now - f.t < 600; });
    // Send a macrophage for anything marked and not yet claimed.
    if (r.role !== 't') {
      var waiting = g.items.filter(function (o) { return o.marked && !o.claimed; });
      var free = g.items.filter(function (o) { return o.kind === 'mac' && !o.prey; });
      waiting.forEach(function (v) {
        var m = free.shift();
        if (!m && g.macs < (r.role === 'm' ? 3 : 2)) { m = spawn(g, 'mac', v.x < g.W / 2 ? -20 : g.W + 20, rand(40, g.H - 60)); g.macs += 1; }
        if (m) { m.prey = v; v.claimed = true; }
      });
    }
    if (g.waves && g.waves.length && g.el >= g.waves[0]) {
      g.waves.shift();
      var healthy = shuffle(g.items.filter(function (o) { return o.kind === 'body'; })).slice(0, g.waves.length % 2 ? 2 : 1);
      healthy.forEach(function (c) { infect(g, c); g.fx.push({ x: c.x, y: c.y, t: now, c: '#58CC02' }); });
      if (healthy.length) note('More viruses from the blood: ' + (healthy.length === 1 ? 'a new cell is' : healthy.length + ' new cells are') + ' infected.', false);
    }
    // Finished?
    var left = r.role === 't' ? g.items.filter(function (o) { return o.kind === 'inf'; }).length
      : g.items.filter(function (o) { return o.kind === 'flu'; }).length;
    if (!left && !g.clearAt && !(g.waves && g.waves.length)) { g.clearAt = g.el; }
    if (g.el >= g.end || A.hearts <= 0 || (g.clearAt && g.el - g.clearAt > 500)) { g.done = true; roundEnd(); }
  }
  function macStep(g, m, dt) {
    var tgt = m.prey && !m.prey.gone ? m.prey : null;
    if (!tgt) {
      m.prey = null;
      // Nothing to eat: wander off the nearest edge.
      var ox = m.x < g.W / 2 ? -40 : g.W + 40;
      m.x += Math.sign(ox - m.x) * 0.1 * dt;
      if (m.x < -30 || m.x > g.W + 30) { m.gone = true; g.macs -= 1; }
      return;
    }
    var dx = tgt.x - m.x, dy = tgt.y - m.y, d = Math.hypot(dx, dy), s = Math.min(d, 0.16 * dt);
    if (d > 0.5) { m.x += dx / d * s; m.y += dy / d * s; }
    if (d < m.r + tgt.r - 4) {
      tgt.gone = true; m.prey = null; g.eaten += 1; score(2);
      g.fx.push({ x: tgt.x, y: tgt.y, t: performance.now(), c: '#7E5BA3' });
    }
  }
  function hit(r, g, o, now) {
    if (o.cool && now - o.cool < 900) return;
    o.cool = now;
    if (o.kind === 'flu' && !o.marked && r.role !== 't') {
      o.marked = true; g.marked += 1; A.combo += 1;
      score(10 + Math.min(10, (A.combo - 1) * 2));
      K.ding(Math.min(10, A.combo), false);
      g.fx.push({ x: o.x, y: o.y, t: now, c: '#3E6FD8' });
      note('Marked! Antibodies locked onto its antigens. A macrophage is on the way.', true);
      if (g.marked === 1) K.mascot('happy', 'Marked. Next.');
    } else if (o.kind === 'inf' && r.role === 't') {
      o.gone = true; g.killed += 1; A.combo += 1;
      score(10 + Math.min(10, (A.combo - 1) * 2));
      K.ding(Math.min(10, A.combo), false);
      g.fx.push({ x: o.x, y: o.y, t: now, c: '#FF4B4B', pop: true });
      note('Perforin! The infected cell bursts before the virus can multiply in it.', true);
    } else if (o.kind === 'rbc' || o.kind === 'body') {
      // Just hurt: a moment to get clear before it counts again.
      if (now < g.safe) return;
      g.safe = now + 1500;
      // Bounce off it, and stop until the pointer moves again.
      var dx = g.px - o.x, dy = g.py - o.y, d = Math.hypot(dx, dy) || 1, keep = g.pr + g.reach + o.r * 0.7 + 8;
      g.px = Math.max(g.pr, Math.min(g.W - g.pr, o.x + dx / d * keep));
      g.py = Math.max(g.pr, Math.min(g.H - 12 - g.pr, o.y + dy / d * keep));
      g.tx = null;
      lose(o.kind === 'rbc' ? 'That\'s one of your own red cells! The immune system must never attack self: that\'s autoimmune disease.'
        : 'That cell is healthy: no viral antigen on it. Killing it damages the tissue.');
    } else if ((o.kind === 'cold' || o.kind === 'bact') && r.role !== 't') {
      A.combo = 0; score(-2); K.bonk();
      note('Your antibodies don\'t fit that one: antibodies are specific to one antigen. Find the green spikes.', false);
      if (Math.random() < 0.5) K.mascot('angry', 'Wrong antigen. Antibodies are specific.');
    }
  }
  function lose(text) {
    A.hearts -= 1; A.combo = 0; hearts(); K.bonk(); note(text, false);
    K.mascot('angry', pick(['That\'s one of YOUR cells!', 'Self! Not foreign!', 'Careful!']));
  }
  function burst(g, o) {
    // The infected cell bursts: new viruses get out and infect the nearest healthy cells.
    o.gone = true; g.burst += 1; score(-5);
    g.fx.push({ x: o.x, y: o.y, t: performance.now(), c: '#F5A03C', pop: true });
    var near = g.items.filter(function (c) { return c.kind === 'body' && !c.gone; })
      .sort(function (a, b) { return Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y); }).slice(0, 2);
    near.forEach(function (c) { infect(g, c); });
    note('Too slow: an infected cell burst and its new viruses infected ' + (near.length === 1 ? 'another cell.' : near.length + ' more cells.'), false);
    if (g.burst === 1) K.mascot('angry', 'It burst! More infected cells now.');
  }

  // ---------- drawing (flat, side-on cells like the diagrams)
  function circle(ctx, x, y, r, fill, stroke, w) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = w || 2; ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  function antigen(ctx, x, y, a, len, shape, color, dark) {
    var ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineWidth = 2.2; ctx.strokeStyle = dark; ctx.stroke();
    if (shape === 'club') circle(ctx, ex, ey, 3.6, color, dark, 1.4);
    else { ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 1.4; ctx.fillRect(-3.2, -3.2, 6.4, 6.4); ctx.strokeRect(-3.2, -3.2, 6.4, 6.4); ctx.restore(); }
  }
  function virus(ctx, o) {
    var flu = o.kind === 'flu';
    for (var i = 0; i < 9; i++) {
      var a = o.ang + i * Math.PI * 2 / 9;
      antigen(ctx, o.x + Math.cos(a) * o.r, o.y + Math.sin(a) * o.r, a, 6, flu ? 'club' : 'square', flu ? '#58CC02' : '#B9A6D6', flu ? '#17824A' : '#5B3172');
    }
    circle(ctx, o.x, o.y, o.r, flu ? '#F5A03C' : '#E9C46A', flu ? '#B5652A' : '#A9822F', 2.4);
    circle(ctx, o.x, o.y, o.r * 0.6, '#FFF4E0');
    ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#FF4B4B';
    for (var t = 0; t <= 16; t++) { var aa = o.ang * 2 + t * 0.8, rr = o.r * (0.2 + 0.25 * Math.abs(Math.sin(t * 1.7))); ctx[t ? 'lineTo' : 'moveTo'](o.x + Math.cos(aa) * rr, o.y + Math.sin(aa) * rr); }
    ctx.stroke();
    if (o.marked) {
      ctx.strokeStyle = '#3E6FD8'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (var k = 0; k < 6; k++) {
        var b = k * Math.PI / 3 + 0.3, sx = o.x + Math.cos(b) * (o.r + 18), sy = o.y + Math.sin(b) * (o.r + 18), fx = o.x + Math.cos(b) * (o.r + 9), fy = o.y + Math.sin(b) * (o.r + 9);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy);
        ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(b + 2.4) * 5, fy + Math.sin(b + 2.4) * 5);
        ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(b - 2.4) * 5, fy + Math.sin(b - 2.4) * 5);
        ctx.stroke();
      }
    }
  }
  function bact(ctx, o) {
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang);
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(10, -8); ctx.arc(10, 0, 8, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-10, 8); ctx.arc(-10, 0, 8, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
    ctx.fillStyle = '#A8D86E'; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = '#4E7A23'; ctx.stroke();
    [[-8, -8], [6, -8], [-2, 8], [12, 7]].forEach(function (p) { circle(ctx, p[0], p[1] + (p[1] < 0 ? -2 : 2), 3, '#F28AB0', '#B3405F', 1.2); });
    ctx.restore();
  }
  function rbc(ctx, o) {
    circle(ctx, o.x, o.y, o.r, '#FF4B4B', '#EA2B2B', 1.8);
    ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * 0.45, o.r * 0.3, o.ang, 0, Math.PI * 2); ctx.fillStyle = '#C2364A'; ctx.fill();
  }
  function cell(ctx, o) {
    var inf = o.kind === 'inf';
    if (inf) {
      for (var i = 0; i < 7; i++) { var a = o.ang + i * Math.PI * 2 / 7; antigen(ctx, o.x + Math.cos(a) * o.r, o.y + Math.sin(a) * o.r, a, 6, 'club', '#58CC02', '#17824A'); }
    }
    circle(ctx, o.x, o.y, o.r, inf ? '#FBE3C8' : '#FDF3E3', '#C9A27A', 2.4);
    circle(ctx, o.x - 4, o.y - 2, o.r * 0.42, '#B9A6D6', '#5B3172', 1.6);
    if (inf) {
      circle(ctx, o.x + 8, o.y + 8, 5, '#F5A03C', '#B5652A', 1.4);
      circle(ctx, o.x + 11, o.y - 6, 4, '#F5A03C', '#B5652A', 1.2);
      // How long until it bursts.
      var left = Math.max(0, o.burst) / (o.full || 9000);
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, left));
      ctx.lineWidth = 3; ctx.strokeStyle = left < 0.35 ? '#FF4B4B' : '#F5A03C'; ctx.stroke();
    }
  }
  function mac(ctx, o) {
    ctx.beginPath();
    for (var i = 0; i <= 24; i++) { var a = i / 24 * Math.PI * 2, rr = o.r * (1 + 0.16 * Math.sin(a * 3 + o.ang * 3)); ctx[i ? 'lineTo' : 'moveTo'](o.x + Math.cos(a) * rr, o.y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#E9DDF5'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#7E5BA3'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(o.x - 4, o.y, 8, 5.5, 0.4, 0, Math.PI * 2); ctx.fillStyle = '#B9A6D6'; ctx.fill();
  }
  function player(ctx, r, g) {
    var x = g.px, y = g.py, R = g.pr, now = performance.now();
    // Blink while just hurt.
    if (now < g.safe && !g.calm && Math.floor(now / 120) % 2) return;
    if (r.role === 'm') circle(ctx, x, y, R + g.reach - 4, 'rgba(62, 111, 216, .12)');
    if (r.role === 't') {
      // A killer T cell: receptors like little hooks all round.
      for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 + g.el * 0.0012; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R); ctx.lineTo(x + Math.cos(a) * (R + 6), y + Math.sin(a) * (R + 6)); ctx.lineWidth = 3; ctx.strokeStyle = '#5B3172'; ctx.stroke(); }
      circle(ctx, x, y, R, '#D9C6EC', '#5B3172', 3);
      circle(ctx, x - 3, y + 1, R * 0.62, '#7E5BA3');
    } else {
      ctx.strokeStyle = '#3E6FD8'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (var k = 0; k < 8; k++) {
        var b = k * Math.PI / 4 + g.el * 0.0008, fx = x + Math.cos(b) * (R + 8), fy = y + Math.sin(b) * (R + 8);
        ctx.beginPath(); ctx.moveTo(x + Math.cos(b) * R, y + Math.sin(b) * R); ctx.lineTo(fx, fy);
        ctx.lineTo(fx + Math.cos(b + 0.7) * 5, fy + Math.sin(b + 0.7) * 5); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(b - 0.7) * 5, fy + Math.sin(b - 0.7) * 5); ctx.stroke();
      }
      circle(ctx, x, y, R, '#EAF2FF', r.role === 'm' ? '#FFC800' : '#3E6FD8', 3);
      circle(ctx, x - 2, y + 1, R * 0.7, '#B9A6D6', '#5B3172', 1.4);
    }
    tag(ctx, r.role === 't' ? 'YOU: KILLER T' : r.role === 'm' ? 'YOU: MEMORY CELL' : 'YOU: B CELL', x, y + R + 18, true);
  }
  function tag(ctx, text, x, y, you) {
    ctx.font = (you ? '800 11px' : '800 10px') + ' Nunito, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var w = ctx.measureText(text).width + 12, cw = A && A.g ? A.g.W : 640;
    x = Math.max(w / 2 + 2, Math.min(cw - w / 2 - 2, x));
    if (you) {
      ctx.fillStyle = INK; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 8, w, 16, 8); else ctx.rect(x - w / 2, y - 8, w, 16);
      ctx.fill(); ctx.fillStyle = '#FFFFFF';
    } else ctx.fillStyle = 'rgba(24,39,45, .78)';
    ctx.fillText(text, x, y + 0.5);
  }
  function draw(r, g, ctx) {
    var W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = r.role === 't' ? '#F3DCCB' : '#FCE9D6';
    ctx.fillRect(0, 0, W, H);
    if (r.role !== 't') {
      // The blood vessel's walls.
      ctx.fillStyle = '#F2B3A6'; ctx.fillRect(0, 0, W, 6); ctx.fillRect(0, H - 18, W, 6);
    }
    g.items.forEach(function (o) {
      if (o.kind === 'rbc') rbc(ctx, o);
      else if (o.kind === 'body' || o.kind === 'inf') cell(ctx, o);
    });
    g.items.forEach(function (o) {
      if (o.kind === 'flu' || o.kind === 'cold') virus(ctx, o);
      else if (o.kind === 'bact') bact(ctx, o);
      else if (o.kind === 'mac') mac(ctx, o);
    });
    g.items.forEach(function (o) {
      if (o.kind === 'mac' && (o.x < 0 || o.x > W)) return;
      var label = o.kind === 'flu' && o.marked ? 'Marked' : KINDS[o.kind].label;
      tag(ctx, label, o.x, o.y + o.r + (o.kind === 'inf' ? 17 : o.kind === 'flu' || o.kind === 'cold' ? 15 : 10));
    });
    var now = performance.now();
    if (!g.calm) g.fx.forEach(function (f) {
      var p = (now - f.t) / 600;
      ctx.beginPath(); ctx.arc(f.x, f.y, 12 + p * 26, 0, Math.PI * 2); ctx.lineWidth = 3 * (1 - p); ctx.strokeStyle = f.c; ctx.stroke();
    });
    player(ctx, r, g);
    // What's left, and the time.
    var left = r.role === 't' ? g.items.filter(function (o) { return o.kind === 'inf'; }).length
      : g.items.filter(function (o) { return o.kind === 'flu' && !o.marked; }).length;
    ctx.font = '700 13px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = INK;
    ctx.fillText(r.role === 't' ? (left ? 'Infected cells: ' + left : 'All clear for now: watch for new infections') : left ? 'Flu viruses to mark: ' + left : 'All marked: the macrophages are engulfing them', 10, 10);
    var t = Math.max(0, 1 - g.el / g.end);
    ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, H - 6, W, 6);
    ctx.fillStyle = t < 0.2 ? '#FF4B4B' : '#58CC02'; ctx.fillRect(0, H - 6, W * t, 6);
  }

  // ---------- after each round
  function roundEnd() {
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    var g = A.g, r = ROUNDS[A.round], extra, clear = g.clearAt ? g.clearAt / 1000 : null, all;
    A.times[A.round] = clear;
    if (r.role === 't') {
      all = !g.items.some(function (o) { return o.kind === 'inf'; });
      extra = 'You destroyed <b>' + g.killed + '</b> infected cell' + (g.killed === 1 ? '' : 's') + '. ' + (g.burst ? g.burst + ' burst before you got there, and infected their neighbours. ' : 'None burst. ') +
        (all ? 'The infection is cleared.' : 'Some infected cells are still there.');
    } else {
      all = !!clear;
      extra = 'You marked <b>' + g.marked + '</b> of ' + g.count + ' flu viruses' + (clear ? ' in <b>' + clear.toFixed(1) + ' s</b>.' : ' before time ran out.');
      if (r.role === 'm' && clear && A.times[0]) extra += ' The first time it took ' + A.times[0].toFixed(1) + ' s: that\'s the secondary response.';
    }
    if (all) score(Math.round((g.end - g.el) / 1000) * 2);
    K.gameSeg(A.card, A.round, A.hearts > 0 && all ? 'is-ok' : A.hearts > 0 ? 'is-half' : 'is-no');
    if (A.hearts <= 0) { end(); return; }
    var q = r.quiz;
    A.answered = false;
    A.card.querySelector('.ic').innerHTML = '<div class="am-run__top"><h3 class="am-run__kind">Quick question</h3>' + heartsHtml() + '</div>' +
      '<p class="nr-result ' + (all ? 'nr-good' : 'nr-bad') + '">' + extra + '</p>' +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-ic-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p>';
    buttons(A.card, [['more', 'data-am-keep', 'Close']], true);
    K.mascot(all ? 'happy' : 'ok', all ? 'Cleared. Hmph.' : 'Not all of them. Answer this.');
  }
  function quiz(k, btn) {
    if (A.answered) return;
    A.answered = true;
    var q = ROUNDS[A.round].quiz, ok = k === q.a;
    btn.classList.add(ok ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (!ok) A.card.querySelector('[data-ic-opt="' + q.a + '"]').classList.add('am-run__opt--ok');
    if (ok) { score(10); K.ding(6, true); K.mascot('happy', 'Correct. Next.'); } else { K.bonk(); K.mascot('angry', 'Wrong. Remember that one.'); }
    var last = A.round + 1 >= ROUNDS.length;
    buttons(A.card, [['ok', last ? 'data-ic-end' : 'data-ic-next', last ? 'See my score' : 'Next round']]);
  }
  function end() {
    stop();
    var best = +K.store('bio-act-32') || 0, newBest = A.score > best, out = A.hearts <= 0;
    if (newBest) K.store('bio-act-32', String(A.score));
    var t1 = A.times[0], t3 = A.times[2], faster = t1 && t3 && t3 < t1;
    body(A.card, '<div class="am-games__end"><p class="am-games__big">' + A.score + '<span> pts</span></p>' +
      '<h3 class="am-games__title">' + (out ? 'The infection wins!' : faster ? 'Immune!' : 'You survived') + '</h3>' +
      '<p class="am-games__sub">' + (out ? 'Out of hearts. Remember: antibodies fit one antigen, killer T cells only destroy infected cells, and the immune system must never attack your own cells.' :
        'B cells made antibodies that marked the virus for the macrophages, killer T cells burst the infected cells with perforin, and memory cells ' + (faster ? 'made the second response far faster (' + t1.toFixed(1) + ' s, then ' + t3.toFixed(1) + ' s).' : 'should make the second response much faster: play again and beat your first time.') +
        ' That is how a vaccine works: the first meeting is with a harmless form of the pathogen.') +
      (newBest && best ? ' <b>New best!</b>' : best ? ' Your best: ' + best + '.' : '') + '</p></div>');
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ic-again', 'Play again']]);
    K.mascot(out ? 'furious' : 'happy', out ? 'Infected. On my watch.' : 'Hmph. Immune. For now.');
    if (!out && faster) K.later(K.fanfare, 300);
  }
  function onClick(e) {
    if (!A || !A.card.isConnected) return;
    var t;
    if ((t = e.target.closest('[data-ic-pre]'))) { preAnswer(+t.getAttribute('data-ic-pre'), t); return; }
    if (e.target.closest('[data-ic-ready]')) { stage(); return; }
    if (e.target.closest('[data-ic-play]')) { play(); return; }
    if ((t = e.target.closest('[data-ic-opt]'))) { quiz(+t.getAttribute('data-ic-opt'), t); return; }
    if (e.target.closest('[data-ic-next]')) { A.round += 1; intro(); return; }
    if (e.target.closest('[data-ic-end]')) { end(); return; }
    if (e.target.closest('[data-ic-again]')) { open(32); return; }
    if (e.target.closest('[data-am-keep]')) stop();
  }

  window.BioActions = window.BioActions || {};
  // peek: for tests, the game's state (round, hearts, things on the canvas).
  window.BioActions[32] = { open: open, peek: function () { return A; } };
})();

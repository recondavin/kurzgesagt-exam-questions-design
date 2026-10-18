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
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, host = BK.host, body = BK.body, buttons = BK.buttons;
  var INK = '#14243B', O2C = '#2E9E5B', CO2C = '#E8551F', H2OC = '#3E9BD8';

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
    { title: 'Round 1: You are an oxygen molecule', ask: 'Find your way from the nose to an alveolus: at each fork, steer into the next part of the airway. Dodge the dust.',
      hint: 'Steer with your finger, the mouse or the arrow keys.',
      quiz: { q: 'What stops food going into the trachea when you swallow?', opts: ['The epiglottis', 'The larynx', 'The diaphragm', 'The rings of cartilage'], a: 0 } },
    { title: 'Round 2: You are the alveolus wall', ask: 'Send each molecule the way it diffuses: up into the alveolus, or down into the blood.',
      hint: 'Up and down arrows, or tap the top or bottom half.',
      quiz: { q: 'What is the name of the process that moves gases across the alveolus wall?', opts: ['Diffusion', 'Active transport', 'Osmosis', 'Breathing'], a: 0 } },
    { title: 'Round 3: You are the breathing centre', ask: 'Hold to breathe in (the diaphragm and intercostal muscles contract), let go to breathe out. Keep the carbon dioxide in the green zone.',
      hint: 'Hold the space bar, or press and hold on the picture.',
      quiz: { q: 'Which part of the brain detects a rise in carbon dioxide in the blood?', opts: ['The medulla oblongata', 'The cerebellum', 'The hypothalamus', 'The pituitary gland'], a: 0 } }
  ];

  var A = null;
  function actionOpen(ch) {
    if (ch !== 28) return;
    var card = host(ch, 'Breath of air');
    A = { card: card, round: 0, score: 0, hearts: 3, raf: 0 };
    K.root().addEventListener('click', actionClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    actionIntro();
  }
  function actionIntro() {
    var r = ROUNDS[A.round];
    K.gameSeg(A.card, A.round, 'is-current');
    body(A.card, '<div class="nr ba"><div class="am-run__top"><h3 class="am-run__kind">' + esc(r.title) + '</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + esc(r.ask) + '</p><div class="nr-stage ba-stage"><canvas class="nr-canvas" data-ba-canvas aria-label="' + esc(r.title) + '"></canvas>' +
      '<div class="nr-overlay" data-ba-overlay><p>' + esc(r.hint) + '</p></div></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p><p class="am-sr" data-ba-live aria-live="polite"></p></div>', true);
    hearts();
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ba-play', A.round ? 'Go' : 'Start']]);
    if (!A.round) K.mascot('ok', 'Every breath you take. Get it right.');
  }
  function hearts() {
    var h = A.card.querySelector('[data-nr-hearts]');
    if (h) h.textContent = '♥'.repeat(Math.max(0, A.hearts)) + '♡'.repeat(Math.max(0, 3 - A.hearts));
  }
  function flash(text, good) {
    var note = A.card.querySelector('[data-am-gnote]');
    if (note) { note.textContent = text; note.className = 'am-games__note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  // What's on the canvas, for screen readers: the doors at each fork, the molecule at the wall, the workout.
  function say(t) {
    var live = A.card.querySelector('[data-ba-live]');
    if (live) live.textContent = t;
  }
  function score(n) {
    A.score = Math.max(0, A.score + n);
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function hurt(line) {
    A.hearts -= 1;
    A.combo = 0;
    hearts();
    K.bonk();
    flash(line, false);
    K.mascot('angry', line.split(/[.!:]/)[0] + '!');
  }
  function good(line, n) {
    A.combo = (A.combo || 0) + 1;
    K.ding(Math.min(10, A.combo), false);
    score(n);
    flash(line, true);
  }

  // ---------- the play loop, shared by all three rounds ----------
  function actionPlay() {
    var canvas = A.card.querySelector('[data-ba-canvas]'), ctx = canvas.getContext('2d');
    A.card.querySelector('[data-ba-overlay]').hidden = true;
    var rect = canvas.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var W = Math.min(640, Math.round(rect.width)), H = Math.round(Math.min(420, Math.max(320, W * 0.66)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = A.g = { W: W, H: H, x: W / 2, t0: performance.now(), last: performance.now(), keys: {}, done: false, canvas: canvas, still: K.reduced() };
    var setup = [setupAirway, setupWall, setupControl][A.round];
    setup(g);
    var point = function (e) { var b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    canvas.onpointermove = function (e) { if (g.move) g.move(point(e)); };
    canvas.onpointerdown = function (e) { e.preventDefault(); if (g.down) g.down(point(e)); else if (g.move) g.move(point(e)); };
    canvas.onpointerup = canvas.onpointercancel = canvas.onpointerleave = function () { if (g.up) g.up(); };
    A.onKey = function (e) {
      if (!canvas.isConnected) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); return; }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].indexOf(e.key) < 0) return;
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
    var loop = function (now) {
      if (!A || A.g !== g || !canvas.isConnected) return;
      var dt = Math.min(50, now - g.last);
      g.last = now;
      g.step(dt, now - g.t0);
      ctx.clearRect(0, 0, W, H);
      g.draw(ctx);
      if (!g.done && A.hearts <= 0) g.done = true;
      if (g.done) { roundEnd(); return; }
      A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  function text(ctx, s, x, y, size, color, align, weight) {
    ctx.font = (weight || 800) + ' ' + size + 'px Nunito, sans-serif';
    ctx.fillStyle = color || INK;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  function pill(ctx, s, x, y, bg, fg, size) {
    size = size || 13;
    ctx.font = '800 ' + size + 'px Nunito, sans-serif';
    var w = ctx.measureText(s).width + size * 1.3;
    ctx.fillStyle = bg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 12, w, 24, 12); else ctx.rect(x - w / 2, y - 12, w, 24);
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
    text(ctx, m.label, x, y + 1, 12, '#FFFFFF');
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
          if (chose === G.next) good('Into the ' + G.next.toLowerCase() + '. ' + (GATES[GATES.indexOf(G) + 1] ? GATES[GATES.indexOf(G) + 1].say : 'You made it to an alveolus!'), 10);
          else hurt((G.why && G.why[chose]) || ('Wrong way: after ' + G.at + ' comes the ' + G.next.toLowerCase() + '.'));
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
          score(-3);
          A.combo = 0;
          K.bonk();
          flash('Dust! Mucus should trap it, and cilia sweep it back up.', false);
        }
      });
      g.dust = g.dust.filter(function (d) { return d.y > -20 && !d.hit; });
      if (g.finishAt && el >= g.finishAt) { g.done = true; g.reached = true; }
    };
    g.draw = function (ctx) {
      var W = g.W, H = g.H, t = performance.now();
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
          pill(ctx, o, w * k + w / 2, gt.y, gt.done ? (o === gt.gate.next ? '#2BA864' : '#8A93A6') : INK, '#FFFFFF', w < 130 ? 11 : 13);
        });
      });
      g.dust.forEach(function (d) {
        ctx.fillStyle = '#8C6A4F'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#A8876A'; ctx.beginPath(); ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2); ctx.fill();
      });
      molecule(ctx, g.px, g.py, 'o2', 15);
      pill(ctx, 'You are in ' + g.where, W / 2, 22, 'rgba(20,36,59,.85)');
      var left = g.passed / GATES.length;
      ctx.fillStyle = '#26395A'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#2BC46F'; ctx.fillRect(0, H - 6, W * left, 6);
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
      if (way === M.way) { m.ok = true; good(M.right, 6); } else { m.ok = false; hurt(M.wrong); }
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
            m.way = 'late'; g.sent += 1; score(-3); A.combo = 0; K.bonk();
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
      if (!g.queue.length && !g.mols.some(function (m) { return !m.way; }) && !g.endAt) g.endAt = performance.now() + 700;
      if (g.endAt && performance.now() >= g.endAt) g.done = true;
    };
    g.draw = function (ctx) {
      var W = g.W, H = g.H, wy = g.wallY, t = performance.now();
      // The alveolus air above, the capillary below, the thin moist wall between.
      ctx.fillStyle = '#FFF4EA'; ctx.fillRect(0, 0, W, wy);
      ctx.fillStyle = '#F7E3EA'; ctx.fillRect(0, wy, W, H - wy);
      ctx.fillStyle = '#F2948C'; ctx.fillRect(0, wy - 6, W, 12);
      ctx.fillStyle = '#5BC0EB'; ctx.fillRect(0, wy - 9, W, 3);
      // Red blood cells drift along the capillary.
      for (var i = 0; i < 6; i++) {
        var x = ((g.still ? 0 : t / 22) + i * (W / 5)) % (W + 60) - 30, y = wy + (H - wy) * 0.62 + (i % 2) * 22;
        ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.ellipse(x, y, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#C2364A'; ctx.beginPath(); ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, 'ALVEOLUS (air)', 14, 20, 13, '#9C5A3C', 'left');
      text(ctx, 'BLOOD in the capillary', 14, H - 18, 13, '#9C3F5C', 'left');
      text(ctx, '▲ up: into the alveolus', W - 14, 20, 13, INK, 'right');
      text(ctx, '▼ down: into the blood', W - 14, H - 18, 13, INK, 'right');
      // The line a molecule must be sent before.
      ctx.strokeStyle = 'rgba(20,36,59,.35)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(g.lineX, wy - 40); ctx.lineTo(g.lineX, wy + 40); ctx.stroke(); ctx.setLineDash([]);
      var first = true;
      g.mols.forEach(function (m) {
        ctx.globalAlpha = m.fade ? Math.max(0, 1 - m.fade / 900) : 1;
        if (!m.way && first) {
          ctx.strokeStyle = '#FFC42E'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(m.x, m.y, 24, 0, Math.PI * 2); ctx.stroke();
          first = false;
        }
        molecule(ctx, m.x, m.y, m.kind, 16);
        if (m.way && m.way !== 'late') text(ctx, m.ok ? '✓' : '✗', m.x + 26, m.y, 18, m.ok ? '#2BA864' : '#E5484D');
        ctx.globalAlpha = 1;
      });
      var left = g.sent / g.total;
      ctx.fillStyle = '#26395A'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#2BC46F'; ctx.fillRect(0, H - 6, W * left, 6);
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
      if (g.co2 >= 35 && g.co2 <= 65) { g.green += dt; if (g.green >= 500) { g.green -= 500; score(1); } }
      if (g.co2 > 75) {
        g.red += dt;
        if (g.red > 2200) { g.red = 0; g.co2 = 62; hurt('Too much carbon dioxide: the blood is too acidic! Breathe faster and deeper.'); }
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
      var cap = g.hold ? ['Breathing in:', 'muscles contract, diaphragm down, ribs up and out'] : ['Breathing out:', 'muscles relax, diaphragm domes up'];
      if (W < 500) { text(ctx, cap[0], W / 2, H - 38, 12, INK); text(ctx, cap[1], W / 2, H - 22, 11, INK); }
      else text(ctx, cap.join(' '), cx, H - 22, 13, INK);
      // The CO2 meter, with its safe (green) zone.
      var mx = W - 58, mt = 46, mh = H - 110;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx, mt, 30, mh);
      ctx.fillStyle = '#C9F2DA'; ctx.fillRect(mx, mt + mh * 0.35, 30, mh * 0.3);
      ctx.fillStyle = '#FFD1D3'; ctx.fillRect(mx, mt, 30, mh * 0.25);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(mx, mt, 30, mh);
      var ly = mt + mh * (1 - g.co2 / 100);
      ctx.fillStyle = g.co2 > 75 ? '#E5484D' : g.co2 >= 35 && g.co2 <= 65 ? '#2BA864' : '#E8A13C';
      ctx.beginPath(); ctx.moveTo(mx - 12, ly - 8); ctx.lineTo(mx - 2, ly); ctx.lineTo(mx - 12, ly + 8); ctx.fill();
      ctx.fillRect(mx, ly - 2, 30, 4);
      text(ctx, 'CO2', mx + 15, mt - 14, 13, INK);
      text(ctx, 'acid', mx + 15, mt + 12, 11, '#B3262B');
      var left = Math.max(0, 1 - (g.last - g.t0) / g.end);
      ctx.fillStyle = '#26395A'; ctx.fillRect(0, H - 6, W, 6);
      ctx.fillStyle = '#2BC46F'; ctx.fillRect(0, H - 6, W * left, 6);
    };
  }

  // ---------- between rounds and the end ----------
  function roundEnd() {
    cancelAnimationFrame(A.raf);
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    var g = A.g, extra = '';
    if (A.round === 0 && g.reached) extra = '<p class="nr-result nr-good">You reached an alveolus: nose, pharynx, larynx, trachea, bronchus, bronchiole, alveolus.</p>';
    if (A.round === 2 && A.hearts > 0) { A.calm = true; extra = '<p class="nr-result nr-good">More carbon dioxide made the blood more acidic; the medulla sent impulses to the diaphragm and intercostal muscles to breathe faster and deeper.</p>'; }
    K.gameSeg(A.card, A.round, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { actionEnd(); return; }
    var q = ROUNDS[A.round].quiz;
    A.card.querySelector('.nr').innerHTML = '<div class="am-run__top"><h3 class="am-run__kind">Quick question</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' + extra +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-ba-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p>';
    hearts();
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
    var best = +K.store('bio-act-28') || 0, newBest = A.score > best;
    if (newBest) K.store('bio-act-28', String(A.score));
    var out = A.hearts <= 0;
    body(A.card, '<div class="am-games__end"><p class="am-games__big">' + A.score + '<span> pts</span></p>' +
      '<h3 class="am-games__title">' + (out ? 'Out of breath!' : A.calm ? 'Breathing like a pro' : 'Nearly there') + '</h3>' +
      '<p class="am-games__sub">' + (out ? 'Out of hearts. Remember: the airway in order, oxygen into the blood, carbon dioxide out, and carbon dioxide sets the breathing rate.' :
        'Nose to alveolus, diffusion across a wall one cell thick, and carbon dioxide controlling how fast you breathe.') +
      (newBest && best ? ' <b>New best!</b>' : best ? ' Your best: ' + best + '.' : '') + '</p></div>');
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-ba-again', 'Play again']]);
    K.mascot(out ? 'furious' : 'happy', out ? 'Out of breath. Pathetic.' : 'Hmph. Your lungs would be proud.');
    if (!out && A.calm) K.later(K.fanfare, 300);
  }
  function actionClick(e) {
    if (!A) return;
    var t;
    if (e.target.closest('[data-ba-play]')) { actionPlay(); return; }
    if ((t = e.target.closest('[data-ba-opt]'))) { actionQuiz(+t.getAttribute('data-ba-opt'), t); return; }
    if (e.target.closest('[data-ba-next]')) { A.round += 1; actionIntro(); return; }
    if (e.target.closest('[data-ba-end]')) { actionEnd(); return; }
    if (e.target.closest('[data-ba-again]')) { actionOpen(28); }
  }

  window.BioActions = window.BioActions || {};
  window.BioActions[28] = { open: actionOpen };
})();

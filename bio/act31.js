// Chapter 31's action game, Red cell run, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[31].
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  // You are a red blood cell doing the double circulation. Three rounds:
  // 1: the right side of the heart: steer into the right exit of each chamber; valves only open at the right moment.
  // 2: the lungs (catch oxygen, dodge carbon monoxide), then back through the left side of the heart.
  // 3: up the aorta and out to the body: hold still beside the cells that need oxygen so it diffuses in.
  // A wrong exit costs a heart; a question between rounds.
  var INK = '#14243B', VALVE = '#FDF3D6', MUSCLE = '#C4683F', MUSCLE_D = '#7A3A2A', BG = '#FBEFE3';
  var BLOOD = { de: { fill: '#9DB6EE', edge: '#3E6FD8', cell: '#B3405A', label: 'deoxygenated' }, ox: { fill: '#F6B1B3', edge: '#E5484D', cell: '#E5484D', label: 'oxygenated' } };

  // The heartbeat: one beat every 2 seconds. The atria contract, then the ventricles, then the heart relaxes.
  // The tricuspid and bicuspid valves are open except while the ventricles contract; the semilunar valves open only then.
  var BEAT = 2000;
  function phase(t) {
    var p = t % BEAT;
    return p < 500 ? 'atria' : p >= 650 && p < 1250 ? 'ventricles' : 'relax';
  }
  function valveOpen(type, t) { return type === 'sl' ? phase(t) === 'ventricles' : phase(t) !== 'ventricles'; }
  var PHASE_TEXT = { atria: 'Atria contract', ventricles: 'Ventricles contract', relax: 'Heart relaxes' };

  var ROOMS = {
    vc: { name: 'Vena cava', kind: 'vessel', blood: 'de', hint: 'The vena cava brings deoxygenated blood from the body into the right side of the heart.',
      exits: [{ t: 'Right atrium', ok: true }, { t: 'Left atrium', why: 'The vena cava empties into the right atrium. The left atrium gets blood from the lungs.' },
        { t: 'Aorta', why: 'The aorta carries blood away from the heart, out to the body.' }] },
    ra: { name: 'Right atrium', kind: 'atrium', blood: 'de', hint: 'From the right atrium, blood goes down into the right ventricle through the valve with three flaps.',
      exits: [{ t: 'Tricuspid valve', ok: true, valve: 'av' }, { t: 'Bicuspid valve', why: 'The bicuspid valve is on the left side, between the left atrium and the left ventricle.' },
        { t: 'Pulmonary vein', why: 'Pulmonary veins bring oxygenated blood from the lungs into the LEFT atrium.' }] },
    rv: { name: 'Right ventricle', kind: 'ventricle', blood: 'de', hint: 'The right ventricle pumps blood up into the pulmonary artery. The valve at its base opens when the ventricles contract.',
      exits: [{ t: 'Semilunar valve', ok: true, valve: 'sl' }, { t: 'Tricuspid valve', back: true, why: 'Backwards! The tricuspid valve shuts when the ventricle contracts, so blood can\'t flow back into the atrium.' },
        { t: 'Septum', why: 'The septum is a solid wall of muscle: it keeps the two sides of the heart apart.' }] },
    pa: { name: 'Pulmonary artery', kind: 'vessel', blood: 'de', hint: 'The pulmonary artery is the only artery that carries deoxygenated blood. Where is it taking you to pick up oxygen?',
      exits: [{ t: 'To the lungs', ok: true }, { t: 'To the body', why: 'The pulmonary artery goes to the lungs. The aorta goes to the body.' },
        { t: 'Right ventricle', back: true, why: 'Backwards! The semilunar valve stops blood flowing back into the ventricle.' }] },
    pv: { name: 'Pulmonary vein', kind: 'vessel', blood: 'ox', hint: 'Oxygenated blood from the lungs returns to the left side of the heart.',
      exits: [{ t: 'Left atrium', ok: true }, { t: 'Right atrium', why: 'The right atrium takes in deoxygenated blood from the body. Blood from the lungs goes to the LEFT atrium.' },
        { t: 'Vena cava', why: 'The vena cava brings blood back from the body, not from the lungs.' }] },
    la: { name: 'Left atrium', kind: 'atrium', blood: 'ox', hint: 'From the left atrium, blood goes down into the left ventricle through the valve with two flaps.',
      exits: [{ t: 'Bicuspid valve', ok: true, valve: 'av' }, { t: 'Tricuspid valve', why: 'The tricuspid valve is on the right side of the heart.' },
        { t: 'Septum', why: 'The septum is a solid wall of muscle: it keeps oxygenated and deoxygenated blood apart.' }] },
    lv: { name: 'Left ventricle', kind: 'ventricle', blood: 'ox', hint: 'The left ventricle has the thickest wall: it pumps blood into the aorta, out to the whole body.',
      exits: [{ t: 'Semilunar valve', ok: true, valve: 'sl' }, { t: 'Bicuspid valve', back: true, why: 'Backwards! The bicuspid valve shuts when the ventricle contracts, so blood can\'t go back into the atrium.' },
        { t: 'Pulmonary artery', why: 'The pulmonary artery leaves the RIGHT ventricle. The left ventricle pumps into the aorta.' }] },
    ao: { name: 'Aorta', kind: 'vessel', blood: 'ox', hint: 'The aorta is the main artery: it carries oxygenated blood at high pressure to the body.',
      exits: [{ t: 'To the body', ok: true }, { t: 'To the lungs', why: 'You have just come from the lungs. The aorta takes oxygenated blood to the body.' },
        { t: 'Left ventricle', back: true, why: 'Backwards! The semilunar valve at the base of the aorta stops blood flowing back.' }] },
    lungs: { name: 'Lung capillary', kind: 'lungs', blood: 'de', hint: 'Oxygen diffuses from the air in the alveolus into the blood, where haemoglobin picks it up. Carbon monoxide in smoke grabs haemoglobin instead.' },
    body: { name: 'Body capillaries', kind: 'body', blood: 'ox', hint: 'Oxygen leaves the blood by diffusion into the cells that need it for respiration. Working muscle needs the most.' }
  };
  var ROUNDS = [
    { title: 'Round 1: The right side of the heart', ask: 'You are a red blood cell, low on oxygen, arriving back at the heart. Read the exits and steer into the right one. Valves only let you through at the right moment in the heartbeat.',
      stages: ['vc', 'ra', 'rv', 'pa'],
      quiz: { q: 'Which valve stops blood flowing back from the right ventricle into the right atrium?', opts: ['The tricuspid valve', 'The bicuspid valve', 'The semilunar valve', 'The pacemaker'], a: 0 } },
    { title: 'Round 2: The lungs, then the left side', ask: 'In the lung capillary, catch oxygen (O₂) to fill your haemoglobin and dodge carbon monoxide (CO) from cigarette smoke. Then back through the left side of the heart.',
      stages: ['lungs', 'pv', 'la', 'lv'],
      quiz: { q: 'Why does the left ventricle have a thicker wall than the right ventricle?', opts: ['It pumps blood all round the body', 'It pumps blood to the lungs', 'It has to hold more blood', 'It makes the blood oxygenated'], a: 0 } },
    { title: 'Round 3: Out to the body', ask: 'Up the aorta and into a capillary bed. Stay above each cell that needs oxygen until it diffuses in. The blood flow keeps pushing you along.',
      stages: ['ao', 'body'],
      quiz: { q: 'In which form does a red blood cell carry oxygen?', opts: ['Joined to haemoglobin', 'Dissolved in its nucleus', 'Stored as glycogen', 'Attached to platelets'], a: 0 } }
  ];
  var CELLS = [['Muscle cell', 2], ['Brain cell', 1], ['Skin cell', 1], ['Liver cell', 1], ['Bone cell', 1]];
  var LOAD = 8;

  var A = null;
  function actionOpen(ch) {
    if (ch !== 31) return;
    var card = host(ch, 'Red cell run');
    A = { card: card, round: 0, score: 0, hearts: 3, raf: 0, o2: 0 };
    K.root().addEventListener('click', actionClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    actionIntro();
  }
  function actionIntro() {
    var r = ROUNDS[A.round];
    K.gameSeg(A.card, A.round, 'is-current');
    body(A.card, '<div class="nr rc"><div class="am-run__top"><h3 class="am-run__kind">' + esc(r.title) + '</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + esc(r.ask) + '</p><div class="nr-stage rc-stage"><canvas class="nr-canvas" data-nr-canvas aria-label="' + esc(r.title) + '"></canvas>' +
      '<div class="nr-overlay" data-nr-overlay><p>Move with your finger, the mouse or the arrow keys.</p></div></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    hearts();
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-rc-play', A.round ? 'Go' : 'Start']]);
    if (!A.round) K.mascot('ok', 'You\'re a red blood cell. Try not to get lost.');
  }
  function hearts() {
    var h = A.card.querySelector('[data-nr-hearts]');
    if (h) h.textContent = '♥'.repeat(Math.max(0, A.hearts)) + '♡'.repeat(Math.max(0, 3 - A.hearts));
  }
  function note(text, good) {
    var n = A.card.querySelector('[data-am-gnote]');
    if (n) { n.textContent = text; n.className = 'am-games__note ' + (good === true ? 'nr-good' : good === false ? 'nr-bad' : ''); }
  }
  function addScore(n) {
    A.score = Math.max(0, A.score + n);
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function loseHeart(line) {
    A.hearts -= 1;
    hearts();
    K.bonk();
    K.mascot(A.hearts > 0 ? 'angry' : 'furious', line);
  }

  // ---------------------------------------------------------------- the play loop
  function actionPlay() {
    var canvas = A.card.querySelector('[data-nr-canvas]'), ctx = canvas.getContext('2d');
    A.card.querySelector('[data-nr-overlay]').hidden = true;
    var rect = canvas.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var W = Math.min(640, Math.round(rect.width)), H = Math.round(Math.min(420, Math.max(320, W * 0.66)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = A.g = { W: W, H: H, ctx: ctx, canvas: canvas, keys: {}, target: null, stage: -1, last: performance.now(), t0: performance.now(), done: false };
    var setTarget = function (e) {
      var b = canvas.getBoundingClientRect();
      g.target = { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    canvas.onpointermove = function (e) { if (e.pointerType === 'mouse' || e.buttons) setTarget(e); };
    canvas.onpointerdown = function (e) { setTarget(e); canvas.focus({ preventScroll: true }); };
    A.onKey = function (e) {
      if (!canvas.isConnected) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); return; }
      if (/^Arrow/.test(e.key)) { g.keys[e.key] = e.type === 'keydown'; g.target = null; e.preventDefault(); }
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop'], ['more', 'data-rc-hint', 'Hint']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    nextStage(g);
    var loop = function (now) {
      if (!A || A.g !== g || !canvas.isConnected) return;
      step(g, now);
      if (g.done) return;
      draw(g, now);
      A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  function nextStage(g) {
    var r = ROUNDS[A.round];
    g.stage += 1;
    if (g.stage >= r.stages.length) { g.done = true; roundEnd(); return; }
    var id = r.stages[g.stage], room = ROOMS[id], now = performance.now();
    g.room = room; g.id = id; g.t0 = now; g.banner = now; g.items = []; g.fx = []; g.slip = 0;
    g.mistake = false; g.leaving = null; g.target = null;
    if (room.kind === 'lungs') setupLungs(g);
    else if (room.kind === 'body') setupBody(g);
    else setupRoom(g);
    note('');
  }

  // ---------------------------------------------------------------- rooms: steer into the right exit
  var SIDES = ['top', 'right', 'bottom', 'left'];
  function setupRoom(g) {
    var room = g.room, W = g.W, H = g.H;
    // The chamber, with room outside its walls to steer through a gap.
    g.box = { x0: 30, y0: 54, x1: W - 30, y1: H - 26 };
    var entry = pick(SIDES), sides = shuffle(SIDES.filter(function (s) { return s !== entry; }));
    g.exits = shuffle(room.exits.slice()).map(function (e, k) { return { e: e, side: sides[k], open: 0, sealed: false }; });
    g.exits.forEach(function (x) { gapOf(g, x); });
    var b = g.box, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    g.entry = entry;
    g.cell = { x: entry === 'left' ? b.x0 + 34 : entry === 'right' ? b.x1 - 34 : cx, y: entry === 'top' ? b.y0 + 34 : entry === 'bottom' ? b.y1 - 34 : cy, r: 14 };
  }
  function gapOf(g, x) {
    var b = g.box, horiz = x.side === 'top' || x.side === 'bottom', len = horiz ? b.x1 - b.x0 : b.y1 - b.y0;
    x.gw = Math.min(104, len * 0.36);
    x.cx = horiz ? (b.x0 + b.x1) / 2 : x.side === 'left' ? b.x0 : b.x1;
    x.cy = horiz ? (x.side === 'top' ? b.y0 : b.y1) : (b.y0 + b.y1) / 2;
    x.n = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[x.side];
    x.tan = horiz ? [1, 0] : [0, 1];
  }
  function roomStep(g, now, dt) {
    var c = g.cell, b = g.box, room = g.room;
    if (g.leaving) {
      c.x += g.leaving[0] * dt * 0.3; c.y += g.leaving[1] * dt * 0.3;
      if (now - g.leaving[2] > 450) nextStage(g);
      return;
    }
    move(g, c, dt, 0.28);
    // The chamber squeezes you towards its way out when it contracts; vessels carry you gently along.
    var right = g.exits.filter(function (x) { return x.e.ok; })[0], ph = phase(now);
    var push = room.kind === 'vessel' ? 0.035 : (room.kind === 'atrium' && ph === 'atria') || (room.kind === 'ventricle' && ph === 'ventricles') ? 0.07 : 0;
    if (push) {
      var dx = right.cx - c.x, dy = right.cy - c.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      c.x += dx / d * push * dt; c.y += dy / d * push * dt;
    }
    g.exits.forEach(function (x) {
      var want = x.e.valve ? (valveOpen(x.e.valve, now) ? 1 : 0) : x.e.back ? 0 : 1;
      x.open += (want - x.open) * Math.min(1, dt / 90);
    });
    // Walls: you can only leave through a gap.
    var r = c.r;
    [['left', c.x - r < b.x0], ['right', c.x + r > b.x1], ['top', c.y - r < b.y0], ['bottom', c.y + r > b.y1]].forEach(function (w) {
      if (!w[1] || g.done || g.leaving) return;
      var x = g.exits.filter(function (e) { return e.side === w[0] && !e.sealed; })[0];
      var along = w[0] === 'top' || w[0] === 'bottom' ? c.x - x_(x) : c.y - y_(x);
      var inGap = x && Math.abs(along) < x.gw / 2 - r * 0.4;
      var past = w[0] === 'left' ? c.x < b.x0 : w[0] === 'right' ? c.x > b.x1 : w[0] === 'top' ? c.y < b.y0 : c.y > b.y1;
      if (inGap && past) { tryExit(g, x, now); return; }
      if (inGap) return;
      if (w[0] === 'left') c.x = b.x0 + r; else if (w[0] === 'right') c.x = b.x1 - r; else if (w[0] === 'top') c.y = b.y0 + r; else c.y = b.y1 - r;
    });
  }
  function x_(x) { return x ? x.cx : 0; }
  function y_(x) { return x ? x.cy : 0; }
  function bounce(g, x) {
    var c = g.cell;
    c.x -= x.n[0] * 46; c.y -= x.n[1] * 46;
    g.target = null;
  }
  function tryExit(g, x, now) {
    var e = x.e;
    if (e.ok && e.valve && !valveOpen(e.valve, now)) {
      bounce(g, x);
      K.bonk();
      g.mistake = true;
      note('Shut! The ' + e.t.toLowerCase() + ' only opens when the ' + (e.valve === 'sl' ? 'ventricles contract' : 'ventricles relax') + '. Watch the heartbeat.', false);
      K.mascot('angry', 'It\'s shut. Timing!');
      return;
    }
    if (e.ok) {
      var gain = g.mistake ? 6 : 12;
      addScore(gain);
      K.ding(4 + g.stage, false);
      note(e.valve ? 'Through the ' + e.t.toLowerCase() + '! +' + gain : 'Into the ' + (e.t.replace(/^To the /, '')).toLowerCase() + '. +' + gain, true);
      K.mascot('happy', pick(['Correct.', 'Right way.', 'Hmph. Yes.']));
      g.leaving = [x.n[0], x.n[1], now];
      return;
    }
    // Wrong way: lose a heart, and that exit is sealed.
    x.sealed = true;
    g.mistake = true;
    bounce(g, x);
    note(e.why, false);
    loseHeart(e.back ? 'Backwards? Valves exist for a reason.' : 'Wrong way!');
    g.fx.push({ kind: 'shake', t: now });
    if (A.hearts <= 0) { g.done = true; roundEnd(); }
  }

  // ---------------------------------------------------------------- the lung capillary: catch oxygen, dodge carbon monoxide
  function setupLungs(g) {
    g.cell = { x: g.W / 2, y: g.H - 52, r: 15 };
    g.spawn = 300; g.secs = 18000; g.co2 = 0; A.o2 = 0;
  }
  function lungStep(g, now, dt) {
    var c = g.cell, el = now - g.t0;
    move(g, c, dt, 0.32, true);
    g.spawn -= dt;
    if (g.spawn <= 0 && el < g.secs - 1200 && A.o2 < LOAD) {
      var co = Math.random() < 0.32;
      g.items.push({ kind: co ? 'co' : 'o2', x: 26 + Math.random() * (g.W - 52), y: 96, vy: 0.07 + Math.random() * 0.05 + el / g.secs * 0.06, r: 13 });
      g.spawn = Math.max(380, 760 - el / g.secs * 300);
    }
    g.co2 -= dt;
    if (g.co2 <= 0) { g.fx.push({ kind: 'co2', x: c.x + (Math.random() - 0.5) * 16, y: c.y - 10, t: now }); g.co2 = 1100; }
    g.items.forEach(function (o) {
      o.y += o.vy * dt;
      if (o.gone || g.done || g.leaving) return;
      var dx = o.x - c.x, dy = o.y - c.y;
      if (dx * dx + dy * dy < (o.r + c.r + 4) * (o.r + c.r + 4)) {
        o.gone = true;
        if (o.kind === 'o2') {
          A.o2 += 1; addScore(3); K.ding(Math.min(10, A.o2 + 1), false);
          if (A.o2 >= LOAD) {
            addScore(15);
            note('Fully loaded: your haemoglobin is carrying all the oxygen it can. +15', true);
            K.mascot('happy', 'Oxyhaemoglobin. Very good.');
            g.leaving = [0, -1, now];
          }
        } else {
          note('Carbon monoxide from cigarette smoke! It sticks to haemoglobin and stops it carrying oxygen.', false);
          loseHeart('Smoke! Disgusting.');
          if (A.hearts <= 0) { g.done = true; roundEnd(); }
        }
      } else if (o.y - o.r > g.H) o.gone = true;
    });
    g.items = g.items.filter(function (o) { return !o.gone; });
    if (g.done) return;
    if (g.leaving) { if (now - g.leaving[2] > 900) nextStage(g); return; }
    if (el >= g.secs) {
      note('Time\'s up with only ' + A.o2 + ' of ' + LOAD + ' oxygen loaded.', false);
      loseHeart('Half empty. Useless.');
      if (A.hearts <= 0) { g.done = true; roundEnd(); return; }
      g.leaving = [0, -1, now];
    }
  }

  // ---------------------------------------------------------------- body capillaries: deliver oxygen by diffusion
  function setupBody(g) {
    var n = CELLS.length, w = (g.W - 24) / n;
    g.cells = CELLS.map(function (c, k) { return { name: c[0], need: c[1], x: 12 + w * (k + 0.5), w: w - 10, hold: 0, glow: 0 }; });
    g.cell = { x: 30, y: 74, r: 15 };
    g.secs = 24000;
    g.cellH = Math.min(130, g.H - 190); g.cellTop = g.H - 26 - g.cellH;
    if (A.o2 < 6) A.o2 = 6;
  }
  function bodyStep(g, now, dt) {
    var c = g.cell, el = now - g.t0;
    move(g, c, dt, 0.24, true);
    c.x += 0.06 * dt;  // the blood flow carries you along the capillary
    if (c.x > g.W + c.r) { c.x = -c.r; }
    var need = 0;
    g.cells.forEach(function (s) {
      s.glow = Math.max(0, s.glow - dt / 600);
      need += s.need;
      if (s.need > 0 && Math.abs(s.x - c.x) < s.w / 2 && A.o2 > 0) {
        s.hold += dt;
        if (s.hold > 650) {
          s.hold = 0; s.need -= 1; s.glow = 1; A.o2 -= 1;
          g.fx.push({ kind: 'o2', x: c.x, y: c.y + 12, to: g.cellTop + 34, t: now });
          addScore(6); K.ding(5, false);
          note(s.need ? s.name + ': it needs more for respiration. Stay there.' : s.name + ' has its oxygen. +6', true);
        }
      } else s.hold = 0;
    });
    if (g.leaving) { if (now - g.leaving[2] > 900) nextStage(g); return; }
    if (need <= 0) {
      addScore(20);
      note('Every cell has its oxygen. You picked up their carbon dioxide on the way: back to the heart in the vena cava. +20', true);
      K.mascot('happy', 'Delivered. Hmph. Efficient.');
      g.leaving = [1, 0, now];
      return;
    }
    if (el >= g.secs) {
      note('Time\'s up: some cells are still short of oxygen.', false);
      loseHeart('Those cells are suffocating!');
      if (A.hearts <= 0) { g.done = true; roundEnd(); return; }
      g.leaving = [1, 0, now];
    }
  }

  // ---------------------------------------------------------------- shared movement and drawing
  function move(g, c, dt, speed, sideways) {
    var k = g.keys, vx = 0, vy = 0;
    if (k.ArrowLeft || k.ArrowRight || k.ArrowUp || k.ArrowDown) {
      vx = ((k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0)) * speed;
      vy = sideways ? 0 : ((k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0)) * speed;
    } else if (g.target) {
      var dx = g.target.x - c.x, dy = sideways ? 0 : g.target.y - c.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 3) { var s = Math.min(speed, d / dt); vx = dx / d * s; vy = dy / d * s; }
    }
    c.x += vx * dt; c.y += vy * dt;
    if (sideways) c.x = Math.max(c.r + 4, Math.min(g.W - c.r - 4, c.x));
  }
  function step(g, now) {
    var dt = Math.min(50, now - g.last);
    g.last = now;
    if (g.done) return;
    if (g.room.kind === 'lungs') lungStep(g, now, dt);
    else if (g.room.kind === 'body') bodyStep(g, now, dt);
    else roomStep(g, now, dt);
  }
  function pill(ctx, text, x, y, fill, align) {
    ctx.font = '600 12px Lexend, Nunito, sans-serif';
    var w = ctx.measureText(text).width + 18, h = 22, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.fillStyle = fill || INK;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x0, y - h / 2, w, h, 11); else ctx.rect(x0, y - h / 2, w, h);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x0 + w / 2, y + 0.5);
    return w;
  }
  function redCell(ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill();
  }
  function header(g, now, name) {
    var ctx = g.ctx, ph = phase(now);
    ctx.fillStyle = INK; ctx.font = '700 14px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(name, 14, 22);
    // The beating heart: it swells while a part of it contracts.
    var beat = ph === 'relax' || K.reduced() ? 1 : 1.18, hx = g.W - 22, hy = 22, s = 8 * beat;
    ctx.fillStyle = '#E5484D';
    ctx.beginPath();
    ctx.moveTo(hx, hy + s);
    ctx.bezierCurveTo(hx - s * 1.6, hy - s * 0.2, hx - s * 0.7, hy - s * 1.3, hx, hy - s * 0.4);
    ctx.bezierCurveTo(hx + s * 0.7, hy - s * 1.3, hx + s * 1.6, hy - s * 0.2, hx, hy + s);
    ctx.fill();
    ctx.fillStyle = ph === 'relax' ? '#5B6B85' : '#B3262B'; ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(PHASE_TEXT[ph], g.W - 38, 23);
  }
  function draw(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    if (g.room.kind === 'lungs') drawLungs(g, now);
    else if (g.room.kind === 'body') drawBody(g, now);
    else drawRoom(g, now);
    // The room's name pops up as you arrive.
    var since = now - g.banner;
    if (since < 1100) {
      ctx.globalAlpha = Math.min(1, (1100 - since) / 300);
      pill(ctx, g.room.name.toUpperCase(), W / 2, H / 2 - 40, '#26395A');
      ctx.globalAlpha = 1;
    }
  }
  function drawRoom(g, now) {
    var ctx = g.ctx, b = g.box, room = g.room, blood = BLOOD[room.blood], ph = phase(now);
    var squeeze = !K.reduced() && ((room.kind === 'atrium' && ph === 'atria') || (room.kind === 'ventricle' && ph === 'ventricles')) ? 5 : 0;
    var shake = g.fx.filter(function (f) { return f.kind === 'shake' && now - f.t < 300; }).length && !K.reduced() ? Math.sin(now / 20) * 3 : 0;
    ctx.save(); ctx.translate(shake, 0);
    header(g, now, 'In the ' + room.name.toLowerCase());
    // Walls: thick heart muscle for a chamber, a thinner wall for a vessel.
    var wall = room.kind === 'vessel' ? 7 : room.kind === 'ventricle' ? (room.blood === 'ox' ? 16 : 10) : 9;
    var wallColor = room.kind === 'vessel' ? blood.edge : MUSCLE;
    ctx.fillStyle = wallColor;
    rrect(ctx, b.x0 - wall + squeeze, b.y0 - wall + squeeze, b.x1 - b.x0 + wall * 2 - squeeze * 2, b.y1 - b.y0 + wall * 2 - squeeze * 2, 22);
    ctx.fill();
    ctx.fillStyle = blood.fill;
    rrect(ctx, b.x0 + squeeze, b.y0 + squeeze, b.x1 - b.x0 - squeeze * 2, b.y1 - b.y0 - squeeze * 2, 16);
    ctx.fill();
    // Where you came in.
    var en = g.entry, ex = en === 'left' ? b.x0 + 10 : en === 'right' ? b.x1 - 10 : (b.x0 + b.x1) / 2, ey = en === 'top' ? b.y0 + 10 : en === 'bottom' ? b.y1 - 10 : (b.y0 + b.y1) / 2;
    ctx.fillStyle = 'rgba(20,36,59,.18)'; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
    // Exits: a gap in the wall, a valve if it has one, and its name.
    g.exits.forEach(function (x) {
      var half = x.gw / 2, thick = wall + squeeze + 4;
      ctx.fillStyle = x.sealed ? '#8B93A3' : BG;
      if (x.side === 'top') ctx.fillRect(x.cx - half, b.y0 - wall - 2, x.gw, thick);
      else if (x.side === 'bottom') ctx.fillRect(x.cx - half, b.y1 - squeeze - 2, x.gw, thick);
      else if (x.side === 'left') ctx.fillRect(b.x0 - wall - 2, x.cy - half, thick, x.gw);
      else ctx.fillRect(b.x1 - squeeze - 2, x.cy - half, thick, x.gw);
      if (x.sealed) return;
      if (x.e.valve || x.e.back) valve(ctx, x, x.e.back ? 0 : x.open);
    });
    g.exits.forEach(function (x) {
      var off = 24, lx = x.cx - x.n[0] * off, ly = x.cy - x.n[1] * off;
      var align = x.side === 'left' ? 'left' : x.side === 'right' ? 'right' : 'center';
      if (x.side === 'left') lx = b.x0 + 8; if (x.side === 'right') lx = b.x1 - 8;
      pill(ctx, (x.sealed ? '✕ ' : '') + x.e.t, lx, ly, x.sealed ? '#8B93A3' : INK, align);
    });
    redCell(ctx, g.cell.x, g.cell.y, g.cell.r, blood.cell);
    ctx.restore();
  }
  function valve(ctx, x, open) {
    var L = (x.gw / 2 - 3) * (1 - open) + Math.min(x.gw / 2 - 3, 24) * open, hinges = [[x.cx - x.tan[0] * x.gw / 2, x.cy - x.tan[1] * x.gw / 2, 1], [x.cx + x.tan[0] * x.gw / 2, x.cy + x.tan[1] * x.gw / 2, -1]];
    hinges.forEach(function (h) {
      var cx = x.tan[0] * h[2], cy = x.tan[1] * h[2], dx = cx + (x.n[0] - cx) * open, dy = cy + (x.n[1] - cy) * open, d = Math.sqrt(dx * dx + dy * dy) || 1;
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0] + dx / d * L, h[1] + dy / d * L); ctx.stroke();
      ctx.strokeStyle = VALVE; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0] + dx / d * L, h[1] + dy / d * L); ctx.stroke();
    });
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function molecule(ctx, o) {
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = o.kind === 'o2' ? '#45C4EE' : '#8A8F98'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = o.kind === 'o2' ? INK : '#FFFFFF'; ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.kind === 'o2' ? 'O₂' : 'CO', o.x, o.y + 0.5);
  }
  function drawLungs(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H, c = g.cell;
    header(g, now, 'Lung capillary');
    // The alveolus (air) above, its thin wall, and the capillary you move along below.
    ctx.fillStyle = '#FBE3E4'; rrect(ctx, 8, 40, W - 16, H - 132, 26); ctx.fill();
    ctx.strokeStyle = '#C25E6A'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#C25E6A'; ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('ALVEOLUS (air)', 22, 60);
    var loaded = Math.min(1, A.o2 / LOAD);
    ctx.fillStyle = loaded >= 1 ? '#F6B1B3' : '#C9B5E0'; rrect(ctx, 8, H - 80, W - 16, 56, 26); ctx.fill();
    ctx.strokeStyle = '#9B4A8C'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#5B3172'; ctx.textAlign = 'right';
    ctx.fillText('CAPILLARY', W - 22, H - 68);
    // Haemoglobin meter.
    ctx.fillStyle = '#26395A'; rrect(ctx, 22, H - 100, 110, 12, 6); ctx.fill();
    ctx.fillStyle = '#E5484D'; rrect(ctx, 22, H - 100, Math.max(6, 110 * loaded), 12, 6); ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.font = '800 11px Nunito, sans-serif';
    ctx.fillText('Haemoglobin ' + A.o2 + '/' + LOAD, 138, H - 94);
    g.items.forEach(function (o) { molecule(ctx, o); });
    g.fx = g.fx.filter(function (f) { return now - f.t < 1400 || f.kind === 'shake'; });
    g.fx.forEach(function (f) {
      if (f.kind !== 'co2') return;
      var k = (now - f.t) / 1400;
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = '#B9C2D0'; ctx.beginPath(); ctx.arc(f.x, f.y - k * 90, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '800 9px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CO₂', f.x, f.y - k * 90 + 0.5);
      ctx.globalAlpha = 1;
    });
    redCell(ctx, c.x, c.y, c.r, A.o2 >= LOAD ? BLOOD.ox.cell : BLOOD.de.cell);
    timeBar(g, now);
  }
  function drawBody(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H, c = g.cell;
    header(g, now, 'Body capillaries');
    ctx.fillStyle = '#F6B1B3'; rrect(ctx, 0, 50, W, 48, 22); ctx.fill();
    ctx.strokeStyle = '#E5484D'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#B3262B'; ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('BLOOD FLOW →', W - 12, 108);
    ctx.fillStyle = INK; ctx.textAlign = 'left';
    ctx.fillText('Oxygen on board: ' + A.o2, 12, 108);
    g.cells.forEach(function (s) {
      var y0 = g.cellTop, h = g.cellH;
      ctx.fillStyle = s.need ? '#F3DCCB' : '#D8EFD9';
      rrect(ctx, s.x - s.w / 2, y0, s.w, h, 14); ctx.fill();
      ctx.lineWidth = s.need ? 2.5 : 2; ctx.strokeStyle = s.need ? (Math.floor(now / 400) % 2 && !K.reduced() ? '#E8551F' : '#C9A58C') : '#2BC46F'; ctx.stroke();
      ctx.fillStyle = '#B5838F'; ctx.beginPath(); ctx.arc(s.x, y0 + 34, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '800 ' + (s.w < 70 ? 9 : 11) + 'px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name.replace(' cell', ''), s.x, y0 + 58);
      ctx.fillStyle = s.need ? '#B3262B' : '#1E8A50';
      ctx.fillText(s.need ? 'needs O₂' + (s.need > 1 ? ' ×' + s.need : '') : '✓', s.x, y0 + 74);
      if (s.hold > 0) { ctx.fillStyle = '#45C4EE'; ctx.fillRect(s.x - s.w / 2 + 6, y0 + 6, (s.w - 12) * Math.min(1, s.hold / 650), 5); }
    });
    g.fx = g.fx.filter(function (f) { return now - f.t < 900 || f.kind === 'shake'; });
    g.fx.forEach(function (f) {
      if (f.kind !== 'o2') return;
      var k = (now - f.t) / 900;
      molecule(ctx, { kind: 'o2', x: f.x, y: f.y + (f.to - f.y) * k, r: 10 });
    });
    redCell(ctx, c.x, c.y, c.r, A.o2 > 0 ? BLOOD.ox.cell : BLOOD.de.cell);
    timeBar(g, now);
  }
  function timeBar(g, now) {
    var ctx = g.ctx, left = Math.max(0, 1 - (now - g.t0) / g.secs);
    ctx.fillStyle = '#26395A'; ctx.fillRect(0, g.H - 6, g.W, 6);
    ctx.fillStyle = left < 0.2 ? '#E5484D' : '#2BC46F'; ctx.fillRect(0, g.H - 6, g.W * left, 6);
  }

  // ---------------------------------------------------------------- between rounds, and the end
  function roundEnd() {
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    cancelAnimationFrame(A.raf);
    K.gameSeg(A.card, A.round, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { actionEnd(); return; }
    var q = ROUNDS[A.round].quiz;
    A.card.querySelector('.nr').innerHTML = '<div class="am-run__top"><h3 class="am-run__kind">Quick question</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-rc-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
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
    if (!ok) A.card.querySelector('[data-rc-opt="' + q.a + '"]').classList.add('am-run__opt--ok');
    if (ok) { addScore(10); K.ding(6, true); K.mascot('happy', 'Correct. Next.'); } else { K.bonk(); K.mascot('angry', 'Wrong. Remember that one.'); }
    var last = A.round + 1 >= ROUNDS.length;
    buttons(A.card, [['ok', last ? 'data-rc-end' : 'data-rc-next', last ? 'See my score' : 'Next round']]);
  }
  function actionEnd() {
    cancelAnimationFrame(A.raf);
    var best = +K.store('bio-act-31') || 0, newBest = A.score > best;
    if (newBest) K.store('bio-act-31', String(A.score));
    var out = A.hearts <= 0;
    body(A.card, '<div class="am-games__end"><p class="am-games__big">' + A.score + '<span> pts</span></p>' +
      '<h3 class="am-games__title">' + (out ? 'Lost in the circulation!' : A.hearts === 3 ? 'A perfect circuit' : 'Round the body and back') + '</h3>' +
      '<p class="am-games__sub">' + (out ? 'Out of hearts. Remember the route: vena cava, right atrium, tricuspid valve, right ventricle, pulmonary artery, lungs, pulmonary vein, left atrium, bicuspid valve, left ventricle, aorta.' :
        'Twice through the heart on one trip round the body: that\'s a double circulation. Pulmonary circuit to the lungs, systemic circuit to the body.') +
      (newBest && best ? ' <b>New best!</b>' : best ? ' Your best: ' + best + '.' : '') + '</p></div>');
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-rc-again', 'Play again']]);
    K.mascot(out ? 'furious' : 'happy', out ? 'A red cell with no sense of direction.' : 'Hmph. You found your way.');
    if (!out && A.hearts === 3) K.later(K.fanfare, 300);
  }
  function actionClick(e) {
    if (!A) return;
    var t;
    if (e.target.closest('[data-rc-play]')) { actionPlay(); return; }
    if (e.target.closest('[data-rc-hint]')) { if (A.g && A.g.room) note(A.g.room.hint); return; }
    if ((t = e.target.closest('[data-rc-opt]'))) { actionQuiz(+t.getAttribute('data-rc-opt'), t); return; }
    if (e.target.closest('[data-rc-next]')) { A.round += 1; actionIntro(); return; }
    if (e.target.closest('[data-rc-end]')) { actionEnd(); return; }
    if (e.target.closest('[data-rc-again]')) { actionOpen(31); }
  }

  window.BioActions = window.BioActions || {};
  // state() is for the browser tests: where the cell is and which exit is right.
  window.BioActions[31] = { open: actionOpen, state: function () { return A; }, valveOpen: valveOpen };
})();

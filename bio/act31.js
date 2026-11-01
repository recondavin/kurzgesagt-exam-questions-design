// Chapter 31's action game, Red cell run, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[31].
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, S = window.BioStage;
  if (!K || !BK || !S) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  // You are a red blood cell doing the double circulation. Three rounds:
  // 1: the right side of the heart: steer into the right exit of each chamber; valves only open at the right moment.
  // 2: the lungs (catch oxygen, dodge carbon monoxide), then back through the left side of the heart.
  // 3: up the aorta and out to the body: hold still beside the cells that need oxygen so it diffuses in.
  // A wrong exit costs a heart; a question between rounds. Each chamber is drawn as the inside of the heart: the cavity
  // full of blood in thick muscle, its valves as big flaps that swing open and shut with the beat, the whole stage
  // pulsing as the chamber squeezes, and a small heart in the corner showing where you are in it.
  var INK = '#18272D', VALVE = '#FDF3D6', MUSCLE = '#C4683F', MUSCLE_D = '#7A3A2A', BG = '#FBEFE3';
  var BLOOD = { de: { fill: '#9DB6EE', edge: '#3E6FD8', cell: '#B3405A', label: 'deoxygenated' }, ox: { fill: '#F6B1B3', edge: '#FF4B4B', cell: '#FF4B4B', label: 'oxygenated' } };

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
    { title: 'Round 1: The right side of the heart', name: 'Right side', rule: 'Steer into the <b>right exit</b>. Valves only open at the right moment in the beat.', ask: 'You are a red blood cell, low on oxygen, arriving back at the heart. Read the exits and steer into the right one. Valves only let you through at the right moment in the heartbeat.',
      stages: ['vc', 'ra', 'rv', 'pa'],
      quiz: { q: 'Which valve stops blood flowing back from the right ventricle into the right atrium?', opts: ['The tricuspid valve', 'The bicuspid valve', 'The semilunar valve', 'The pacemaker'], a: 0 } },
    { title: 'Round 2: The lungs, then the left side', name: 'Lungs and left side', rule: 'Catch <b>oxygen</b>, dodge carbon monoxide, then through the left side.', ask: 'In the lung capillary, catch oxygen (O₂) to fill your haemoglobin and dodge carbon monoxide (CO) from cigarette smoke. Then back through the left side of the heart.',
      stages: ['lungs', 'pv', 'la', 'lv'],
      quiz: { q: 'Why does the left ventricle have a thicker wall than the right ventricle?', opts: ['It pumps blood all round the body', 'It pumps blood to the lungs', 'It has to hold more blood', 'It makes the blood oxygenated'], a: 0 } },
    { title: 'Round 3: Out to the body', name: 'Out to the body', rule: 'Stay over each cell that <b>needs oxygen</b> until it diffuses in.', ask: 'Up the aorta and into a capillary bed. Stay above each cell that needs oxygen until it diffuses in. The blood flow keeps pushing you along.',
      stages: ['ao', 'body'],
      quiz: { q: 'In which form does a red blood cell carry oxygen?', opts: ['Joined to haemoglobin', 'Dissolved in its nucleus', 'Stored as glycogen', 'Attached to platelets'], a: 0 } }
  ];
  var CELLS = [['Muscle cell', 2], ['Brain cell', 1], ['Skin cell', 1], ['Liver cell', 1], ['Bone cell', 1]];
  var LOAD = 8;

  var A = null;
  function actionOpen(ch) {
    if (ch !== 31) return;
    if (A) cancelAnimationFrame(A.raf);
    var card = host(ch, 'Red cell run');
    card.querySelector('.am-finish__card').classList.add('act-card');
    S.watch(K.root());
    A = { card: card, round: 0, score: 0, hearts: 3, raf: 0, o2: 0, res: [] };
    K.root().addEventListener('click', actionClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    actionIntro();
  }
  // A round opens on its first frame (the first chamber, beating), under a card that says how to move.
  function actionIntro() {
    var r = ROUNDS[A.round];
    K.gameSeg(A.card, A.round, 'is-current');
    body(A.card, '<div class="nr rc">' + S.head({ title: r.title, hearts: A.hearts, rule: r.rule }) +
      S.stage({ cls: 'rc-stage', canvas: 'data-nr-canvas', overlay: 'data-nr-overlay', title: r.title, more: esc(r.ask), how: 'Drag, tap where to go, or use the arrow keys' }) + '</div>', true);
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-rc-play', A.round ? 'Go' : 'Start']]);
    if (!A.round) K.mascot('ok', 'You\'re a red blood cell. Try not to get lost.');
    S.place(A.card);
    prepare();
  }
  function hearts(lost) { S.hearts(A.card, A.hearts, lost); }
  function note(text, good) {
    var n = A.card.querySelector('[data-am-gnote]');
    if (n) { n.textContent = text; n.className = 'am-games__note act-note ' + (good === true ? 'nr-good' : good === false ? 'nr-bad' : ''); }
  }
  function addScore(n) {
    A.score = Math.max(0, A.score + n);
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function loseHeart(line) {
    A.hearts -= 1;
    A.res[A.round] = false;
    hearts(true);
    K.bonk();
    K.mascot(A.hearts > 0 ? 'angry' : 'furious', line);
  }

  // ---------------------------------------------------------------- the play loop
  // The canvas is sized and the first room set up and drawn once, beating, under the "how to move" card.
  function prepare() {
    var canvas = A.card.querySelector('[data-nr-canvas]'), f = S.fit(canvas), ctx = f.ctx;
    var g = A.g = { W: f.W, H: f.H, ctx: ctx, canvas: canvas, keys: {}, target: null, stage: -1, last: S.now(), t0: S.now(), done: false, pops: [] };
    nextStage(g);
    g.banner = -1e9;
    draw(g, S.now());
    // The heart keeps beating behind the card until you start.
    var idle = function () {
      if (!A || A.g !== g || g.started || !canvas.isConnected) return;
      draw(g, S.now());
      A.raf = requestAnimationFrame(idle);
    };
    if (!K.reduced()) A.raf = requestAnimationFrame(idle);
  }
  function actionPlay() {
    var g = A.g, canvas = g.canvas;
    if (!g || g.started) return;
    g.started = true;
    cancelAnimationFrame(A.raf);
    K.playing(true);
    if (A.res[A.round] == null) A.res[A.round] = true;
    A.card.querySelector('[data-nr-overlay]').hidden = true;
    g.t0 = g.last = g.banner = S.now();
    var setTarget = function (e) { g.target = S.point(canvas, e); };
    canvas.onpointermove = function (e) { if (e.pointerType === 'mouse' || e.buttons) setTarget(e); };
    canvas.onpointerdown = function (e) { setTarget(e); canvas.focus({ preventScroll: true }); };
    A.onKey = function (e) {
      if (!canvas.isConnected) { document.removeEventListener('keydown', A.onKey); document.removeEventListener('keyup', A.onKey); return; }
      if (/^Arrow/.test(e.key) && !document.querySelector('.am-leave')) { g.keys[e.key] = e.type === 'keydown'; g.target = null; e.preventDefault(); }
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop'], ['more', 'data-rc-hint', 'Hint']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    var loop = function () {
      if (!A || A.g !== g || !canvas.isConnected) return;
      var now = S.now();
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
    var id = r.stages[g.stage], room = ROOMS[id], now = S.now();
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
    // The chamber, with muscle outside its walls to steer through a gap, and room for the heart map: at the right on a
    // wide stage, above the chamber on a narrow one.
    g.box = W >= 560 ? { x0: 34, y0: 62, x1: W - 140, y1: H - 30 } : { x0: 30, y0: 138, x1: W - 30, y1: H - 30 };
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
      K.sfx('clack', 0.7);
      S.pop(g, g.cell.x, g.cell.y - 34, 'Shut!', '#EA2B2B');
      g.mistake = true;
      note('Shut! The ' + e.t.toLowerCase() + ' only opens when the ' + (e.valve === 'sl' ? 'ventricles contract' : 'ventricles relax') + '. Watch the heartbeat.', false);
      K.mascot('angry', 'It\'s shut. Timing!');
      return;
    }
    if (e.ok) {
      var gain = g.mistake ? 6 : 12;
      addScore(gain);
      K.ding(4 + g.stage, false);
      K.sfx('whoosh', 0.6);
      S.pop(g, g.cell.x, g.cell.y - 34, '+' + gain, '#1E8A50');
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
    S.pop(g, g.cell.x, g.cell.y - 34, e.back ? 'Backwards!' : 'Wrong way!', '#EA2B2B', true);
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
      g.items.push({ kind: co ? 'co' : 'o2', x: 26 + Math.random() * (g.W - 52), y: 96, vy: 0.07 + Math.random() * 0.05 + el / g.secs * 0.06, r: 17 });
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
          S.pop(g, o.x, o.y - 26, '+3 O\u2082', '#1E8A50');
          if (A.o2 >= LOAD) {
            addScore(15);
            note('Fully loaded: your haemoglobin is carrying all the oxygen it can. +15', true);
            K.mascot('happy', 'Oxyhaemoglobin. Very good.');
            g.leaving = [0, -1, now];
          }
        } else {
          note('Carbon monoxide from cigarette smoke! It sticks to haemoglobin and stops it carrying oxygen.', false);
          S.pop(g, o.x, o.y - 26, 'Smoke!', '#EA2B2B', true);
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
          S.pop(g, s.x, g.cellTop - 10, '+6', '#1E8A50');
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
    if (g.done || dt <= 0) return;
    if (g.room.kind === 'lungs') lungStep(g, now, dt);
    else if (g.room.kind === 'body') bodyStep(g, now, dt);
    else roomStep(g, now, dt);
  }
  function pill(ctx, text, x, y, fill, align) {
    ctx.font = '800 15px Nunito, sans-serif';
    var w = ctx.measureText(text).width + 20, h = 28, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.fillStyle = fill || INK;
    rrect(ctx, x0, y - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x0 + w / 2, y + 0.5);
    return w;
  }
  function redCell(ctx, x, y, r, color) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.5, r * 0.36, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fill();
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  // How hard each part is squeezing right now, 0 to 1: the atria early in the beat, then the ventricles.
  function squeeze(t, part) {
    if (K.reduced()) return 0;
    var p = t % BEAT;
    if (part === 'atria') return p < 500 ? Math.sin(Math.PI * p / 500) : 0;
    return p >= 650 && p < 1250 ? Math.sin(Math.PI * (p - 650) / 600) : 0;
  }
  // The beat at the top: the room's name, a heart that thumps, and what the heart is doing, in words.
  function header(g, now, name) {
    var ctx = g.ctx, ph = phase(now), env = Math.max(squeeze(now, 'atria') * 0.6, squeeze(now, 'ventricles'));
    pill(ctx, name, 12, 24, 'rgba(24,39,45,.88)', 'left');
    var text = PHASE_TEXT[ph], col = ph === 'relax' ? '#5B6B85' : ph === 'atria' ? '#C2364A' : '#EA2B2B';
    var w = pill(ctx, text, g.W - 12, 24, col, 'right'), hx = g.W - 12 - w - 20, hy = 24, s = 10 * (1 + 0.35 * env);
    ctx.fillStyle = '#FF4B4B'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx, hy + s);
    ctx.bezierCurveTo(hx - s * 1.6, hy - s * 0.2, hx - s * 0.7, hy - s * 1.3, hx, hy - s * 0.4);
    ctx.bezierCurveTo(hx + s * 0.7, hy - s * 1.3, hx + s * 1.6, hy - s * 0.2, hx, hy + s);
    ctx.fill(); ctx.stroke();
  }
  // Where you are, in one heart (front view, so its right side is on the left): the four chambers, the septum, the
  // vessels, the valves opening and shutting with the beat, and the part you're in ringed in white.
  var MAP = { vc: 'vc', ra: 'ra', rv: 'rv', pa: 'pa', pv: 'pv', la: 'la', lv: 'lv', ao: 'ao' };
  function heartMap(g, now, x, y, k) {
    var ctx = g.ctx, at = MAP[g.id], a = squeeze(now, 'atria'), v = squeeze(now, 'ventricles');
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    var de = '#8FA8E0', ox = '#F28B8B';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // Vessels behind: the vena cava, the pulmonary artery, the aorta, the pulmonary veins.
    var tube = function (d, c, part) { ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(d); ctx.lineWidth = 6; ctx.strokeStyle = c; ctx.stroke(d); if (at === part) { ctx.lineWidth = 13; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke(d); ctx.lineWidth = 6; ctx.strokeStyle = c; ctx.stroke(d); } };
    tube(new Path2D('M22 -6V26'), de, 'vc');
    tube(new Path2D('M42 30Q38 8 24 2'), de, 'pa');
    tube(new Path2D('M58 26Q58 0 74 2Q84 3 84 14'), ox, 'ao');
    tube(new Path2D('M98 32H80'), ox, 'pv');
    var heart = new Path2D('M50 92C18 74 4 54 6 36C8 20 22 12 34 14C42 15 47 20 50 24C53 20 58 15 66 14C78 12 92 20 94 36C96 54 82 74 50 92Z');
    ctx.fillStyle = MUSCLE; ctx.fill(heart); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke(heart);
    var cham = function (part, cx, cy, rx, ry, c, sq) {
      ctx.beginPath(); ctx.ellipse(cx, cy, rx * (1 - 0.18 * sq), ry * (1 - 0.18 * sq), 0, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
      ctx.lineWidth = at === part ? 3 : 1.4; ctx.strokeStyle = at === part ? '#FFFFFF' : MUSCLE_D; ctx.stroke();
    };
    cham('ra', 29, 37, 14, 11, de, a); cham('la', 71, 37, 14, 11, ox, a);
    cham('rv', 33, 63, 13, 15, de, v); cham('lv', 66, 64, 13, 17, ox, v);
    ctx.lineWidth = 3; ctx.strokeStyle = MUSCLE_D; ctx.beginPath(); ctx.moveTo(50, 26); ctx.lineTo(51, 86); ctx.stroke();
    // The valves between atria and ventricles: open (a gap) unless the ventricles squeeze.
    var shut = v > 0.05;
    ctx.lineWidth = 2.6; ctx.strokeStyle = VALVE;
    [[29, 49], [69, 50]].forEach(function (p) { ctx.beginPath(); if (shut) { ctx.moveTo(p[0] - 8, p[1]); ctx.lineTo(p[0] + 8, p[1]); } else { ctx.moveTo(p[0] - 8, p[1]); ctx.lineTo(p[0] - 5, p[1] + 5); ctx.moveTo(p[0] + 8, p[1]); ctx.lineTo(p[0] + 5, p[1] + 5); } ctx.stroke(); });
    // You: a red dot where you are.
    var dot = { vc: [22, 8], pa: [32, 6], ao: [72, 3], pv: [90, 32], ra: [29, 37], la: [71, 37], rv: [33, 63], lv: [66, 64] }[at];
    if (dot) { ctx.beginPath(); ctx.arc(dot[0], dot[1], 4.5, 0, Math.PI * 2); ctx.fillStyle = '#FF4B4B'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); }
    ctx.restore();
  }
  function draw(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    // The whole stage pulses as the heart squeezes (the ventricles harder than the atria).
    var env = g.room && g.room.kind !== 'lungs' && g.room.kind !== 'body' ? Math.max(squeeze(now, 'atria') * 0.5, squeeze(now, 'ventricles')) : 0;
    ctx.save();
    if (env) { ctx.translate(W / 2, H / 2); ctx.scale(1 + 0.022 * env, 1 + 0.022 * env); ctx.translate(-W / 2, -H / 2); }
    ctx.fillStyle = BG; ctx.fillRect(-20, -20, W + 40, H + 40);
    if (g.room.kind === 'lungs') drawLungs(g, now);
    else if (g.room.kind === 'body') drawBody(g, now);
    else drawRoom(g, now);
    ctx.restore();
    // The room's name pops up as you arrive.
    var since = now - g.banner;
    if (since < 1100) {
      ctx.globalAlpha = Math.min(1, (1100 - since) / 300);
      ctx.font = '800 15px Nunito, sans-serif';
      pill(ctx, g.room.name, W / 2, H / 2 - 50, '#2B3B42');
      ctx.globalAlpha = 1;
    }
    S.drawPops(ctx, g);
  }
  // A heart's chamber from inside: thick muscle all round (with its fibres), the cavity full of blood, cells drifting
  // to the way out, the openings, and the valves' flaps. The chamber squeezes in as it contracts.
  function drawRoom(g, now) {
    var ctx = g.ctx, b = g.box, room = g.room, blood = BLOOD[room.blood], W = g.W, H = g.H, vessel = room.kind === 'vessel';
    var sq = vessel ? 0 : squeeze(now, room.kind === 'atrium' ? 'atria' : 'ventricles') * (room.kind === 'ventricle' ? 16 : 11);
    var shake = g.fx.filter(function (f) { return f.kind === 'shake' && now - f.t < 300; }).length && !K.reduced() ? Math.sin(now / 20) * 4 : 0;
    ctx.save(); ctx.translate(shake, 0);
    // Muscle (or, round a vessel, the tissue it runs through), with fibres.
    ctx.fillStyle = vessel ? '#F3D9C8' : MUSCLE; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.strokeStyle = vessel ? 'rgba(201,148,120,.35)' : 'rgba(122,58,42,.35)'; ctx.lineWidth = 2;
    for (var f = -2; f < (W + H) / 34; f++) { ctx.beginPath(); ctx.moveTo(f * 34, -10); ctx.quadraticCurveTo(f * 34 - H * 0.3, H * 0.5, f * 34 - H * 0.2, H + 10); ctx.stroke(); }
    // The openings: a channel of blood out through the wall to the stage's edge.
    g.exits.forEach(function (x) {
      var half = x.gw / 2;
      ctx.fillStyle = x.sealed ? '#8B93A3' : blood.fill;
      if (x.side === 'top') ctx.fillRect(x.cx - half, -20, x.gw, b.y0 + 40);
      else if (x.side === 'bottom') ctx.fillRect(x.cx - half, b.y1 - 20, x.gw, H - b.y1 + 40);
      else if (x.side === 'left') ctx.fillRect(-20, x.cy - half, b.x0 + 40, x.gw);
      else ctx.fillRect(b.x1 - 20, x.cy - half, W - b.x1 + 40, x.gw);
    });
    // The cavity: rounder for an atrium, narrowing to the apex for a ventricle, a tube for a vessel.
    var w = b.x1 - b.x0 - sq * 2, h = b.y1 - b.y0 - sq * 2, m = Math.min(w, h);
    var rad = vessel ? m * 0.5 : room.kind === 'atrium' ? m * 0.34 : [m * 0.2, m * 0.2, m * 0.46, m * 0.46];
    ctx.fillStyle = blood.fill; rrect(ctx, b.x0 + sq, b.y0 + sq, w, h, rad); ctx.fill();
    ctx.lineWidth = vessel ? 6 : 4; ctx.strokeStyle = vessel ? blood.edge : MUSCLE_D; ctx.stroke();
    // Blood cells drifting towards the way out.
    var right = g.exits.filter(function (x) { return x.e.ok; })[0];
    if (right && !K.reduced()) {
      ctx.globalAlpha = 0.45;
      for (var i = 0; i < 7; i++) {
        var k = ((now / 2600) + i / 7) % 1, sx = b.x0 + 30 + ((i * 97) % Math.max(1, w - 60)), sy = b.y0 + 30 + ((i * 61) % Math.max(1, h - 60));
        var px = sx + (right.cx - sx) * k, py = sy + (right.cy - sy) * k;
        ctx.beginPath(); ctx.ellipse(px, py, 9, 6, i, 0, Math.PI * 2); ctx.fillStyle = blood.cell; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Valves: big flaps hinged on the opening's edges.
    g.exits.forEach(function (x) {
      if (x.sealed) { ctx.fillStyle = '#8B93A3'; return; }
      if (x.e.valve || x.e.back) valve(ctx, x, x.e.back ? 0 : x.open, x.e.valve === 'av');
    });
    // The exits' names, inside the cavity by each opening.
    g.exits.forEach(function (x) {
      var lx = x.cx - x.n[0] * 46, ly = x.cy - x.n[1] * 40;
      if (x.side === 'top' || x.side === 'bottom') lx = x.cx;
      S.label(ctx, (x.sealed ? '✕ ' : '') + x.e.t, lx, ly, { W: W, size: 15, bg: x.sealed ? '#8B93A3' : '#FFFFFF', fg: x.sealed ? '#FFFFFF' : INK, edge: INK });
    });
    redCell(ctx, g.cell.x, g.cell.y, g.cell.r, blood.cell);
    ctx.restore();
    header(g, now, 'In the ' + room.name.toLowerCase());
    var wide = W >= 560;
    heartMap(g, now, wide ? W - 112 : 16, wide ? 50 : 50, wide ? 1 : 0.8);
  }
  // A valve: two thick flaps hinged on the opening's edges. Shut, they meet across it; open, they swing out the way
  // the blood goes. An atrioventricular valve's flaps are tied down by tendons (they can't turn inside out).
  function valve(ctx, x, open, av) {
    var half = x.gw / 2, L = half - 2, ang = open * 1.25;
    [[-1], [1]].forEach(function (s) {
      var hx = x.cx + x.tan[0] * half * s[0], hy = x.cy + x.tan[1] * half * s[0];
      // Shut: pointing along the opening to its middle; open: turned towards the outward normal.
      var dx = -x.tan[0] * s[0], dy = -x.tan[1] * s[0];
      var ex = dx * Math.cos(ang) + x.n[0] * Math.sin(ang), ey = dy * Math.cos(ang) + x.n[1] * Math.sin(ang);
      var tx = hx + ex * L, ty = hy + ey * L;
      if (av) {
        ctx.strokeStyle = '#FFF4D6'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx + x.n[0] * 44, hy + x.n[1] * 44); ctx.moveTo((hx + tx) / 2, (hy + ty) / 2); ctx.lineTo(hx + x.n[0] * 44, hy + x.n[1] * 44); ctx.stroke();
      }
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 15;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2 + x.n[0] * 6, (hy + ty) / 2 + x.n[1] * 6, tx, ty); ctx.stroke();
      ctx.strokeStyle = VALVE; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2 + x.n[0] * 6, (hy + ty) / 2 + x.n[1] * 6, tx, ty); ctx.stroke();
    });
  }
  function molecule(ctx, o) {
    ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = o.kind === 'o2' ? '#45C4EE' : '#8A8F98'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = o.kind === 'o2' ? INK : '#FFFFFF'; ctx.font = '800 ' + (o.r >= 15 ? 14 : 11) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.kind === 'o2' ? 'O₂' : 'CO', o.x, o.y + 0.5);
  }
  function drawLungs(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H, c = g.cell;
    header(g, now, 'Lung capillary');
    // The alveolus (air) above, its thin wall, and the capillary you move along below.
    ctx.fillStyle = '#FBE3E4'; rrect(ctx, 8, 40, W - 16, H - 132, 26); ctx.fill();
    ctx.strokeStyle = '#C25E6A'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#C25E6A'; ctx.font = '800 15px Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Alveolus (air)', 22, 62);
    var loaded = Math.min(1, A.o2 / LOAD);
    ctx.fillStyle = loaded >= 1 ? '#F6B1B3' : '#C9B5E0'; rrect(ctx, 8, H - 80, W - 16, 56, 26); ctx.fill();
    ctx.strokeStyle = '#9B4A8C'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#5B3172'; ctx.textAlign = 'right';
    ctx.fillText('Capillary', W - 22, H - 66);
    // Haemoglobin meter.
    ctx.fillStyle = '#2B3B42'; rrect(ctx, 22, H - 100, 110, 12, 6); ctx.fill();
    ctx.fillStyle = '#FF4B4B'; rrect(ctx, 22, H - 100, Math.max(6, 110 * loaded), 12, 6); ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.font = '800 14px Nunito, sans-serif';
    ctx.fillText('Haemoglobin ' + A.o2 + '/' + LOAD, 140, H - 94);
    g.items.forEach(function (o) { molecule(ctx, o); });
    g.fx = g.fx.filter(function (f) { return now - f.t < 1400 || f.kind === 'shake'; });
    g.fx.forEach(function (f) {
      if (f.kind !== 'co2') return;
      var k = (now - f.t) / 1400;
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = '#B9C2D0'; ctx.beginPath(); ctx.arc(f.x, f.y - k * 90, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '800 9px Nunito, sans-serif'; ctx.textAlign = 'center';
      if (k < 0.15) ctx.fillText('CO\u2082', f.x, f.y - k * 90 + 0.5);
      ctx.globalAlpha = 1;
    });
    redCell(ctx, c.x, c.y, c.r, A.o2 >= LOAD ? BLOOD.ox.cell : BLOOD.de.cell);
    timeBar(g, now);
  }
  function drawBody(g, now) {
    var ctx = g.ctx, W = g.W, H = g.H, c = g.cell;
    header(g, now, 'Body capillaries');
    ctx.fillStyle = '#F6B1B3'; rrect(ctx, 0, 50, W, 48, 22); ctx.fill();
    ctx.strokeStyle = '#FF4B4B'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#EA2B2B'; ctx.font = '800 14px Nunito, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('Blood flow \u2192', W - 12, 112);
    ctx.fillStyle = INK; ctx.textAlign = 'left';
    ctx.fillText('Oxygen on board: ' + A.o2, 12, 112);
    g.cells.forEach(function (s) {
      var y0 = g.cellTop, h = g.cellH;
      ctx.fillStyle = s.need ? '#F3DCCB' : '#D8EFD9';
      rrect(ctx, s.x - s.w / 2, y0, s.w, h, 14); ctx.fill();
      ctx.lineWidth = s.need ? 2.5 : 2; ctx.strokeStyle = s.need ? (Math.floor(now / 400) % 2 && !K.reduced() ? '#E8551F' : '#C9A58C') : '#58CC02'; ctx.stroke();
      ctx.fillStyle = '#B5838F'; ctx.beginPath(); ctx.arc(s.x, y0 + 34, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK; ctx.font = '800 14px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name.replace(' cell', ''), s.x, y0 + 60, s.w - 6);
      ctx.fillStyle = s.need ? '#EA2B2B' : '#1E8A50';
      ctx.fillText(s.need ? 'O\u2082 \u00d7' + s.need : '\u2713', s.x, y0 + 80, s.w - 6);
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
    ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, g.H - 6, g.W, 6);
    ctx.fillStyle = left < 0.2 ? '#FF4B4B' : '#58CC02'; ctx.fillRect(0, g.H - 6, g.W * left, 6);
  }

  // ---------------------------------------------------------------- between rounds, and the end
  function roundEnd() {
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    cancelAnimationFrame(A.raf);
    if (A.hearts <= 0 || A.round + 1 >= ROUNDS.length) { if (A.g.room) draw(A.g, S.now()); A.snap = S.snap(A.g.canvas); }
    K.gameSeg(A.card, A.round, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { actionEnd(); return; }
    var q = ROUNDS[A.round].quiz;
    A.card.querySelector('.nr').innerHTML = S.head({ title: 'Quick question', hearts: A.hearts }) +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-rc-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p>';
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
    K.playing(false);
    var out = A.hearts <= 0;
    body(A.card, S.end({ snap: A.snap, out: out, score: A.score, best: S.best('bio-act-31', A.score),
      title: out ? 'Lost in the circulation!' : A.hearts === 3 ? 'A perfect circuit' : 'Round the body and back',
      line: out ? 'Vena cava, right atrium, tricuspid, right ventricle, pulmonary artery, lungs, pulmonary vein, left atrium, bicuspid, left ventricle, aorta.' :
        'Twice through the heart on one trip round the body: a double circulation.',
      rounds: ROUNDS.map(function (r, i) { return { name: r.name, ok: A.res[i] }; }) }));
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-rc-again', 'Play again']]);
    S.place(A.card);
    K.mascot(out ? 'furious' : 'happy', out ? 'A red cell with no sense of direction.' : 'Hmph. You found your way.');
    if (!out && A.hearts === 3) K.later(K.fanfare, 300);
  }
  function actionClick(e) {
    if (!A || !A.card.isConnected) return;
    var t;
    if (e.target.closest('[data-rc-play]') || e.target.closest('[data-nr-overlay]')) { actionPlay(); return; }
    if (e.target.closest('[data-rc-hint]')) { if (A.g && A.g.room) note(A.g.room.hint); return; }
    if ((t = e.target.closest('[data-rc-opt]'))) { actionQuiz(+t.getAttribute('data-rc-opt'), t); return; }
    if (e.target.closest('[data-rc-next]')) { A.round += 1; actionIntro(); return; }
    if (e.target.closest('[data-rc-end]')) { actionEnd(); return; }
    if (e.target.closest('[data-rc-again]')) { actionOpen(31); }
  }

  // The Games tab's picture: inside the right ventricle, the semilunar valve's flaps open above, the heart map.
  S.thumb(31, 'Ride the heartbeat round', function (ctx, W, H) {
    var g = { W: W, H: H, ctx: ctx, keys: {}, fx: [], room: ROOMS.rv, id: 'rv' };
    g.box = { x0: 30, y0: 54, x1: W - 30, y1: H - 18 };
    g.exits = [{ e: ROOMS.rv.exits[0], side: 'top', open: 1 }, { e: ROOMS.rv.exits[1], side: 'left', open: 0 }];
    g.exits.forEach(function (x) { gapOf(g, x); });
    g.cell = { x: W * 0.5, y: H * 0.62, r: 14 };
    drawRoom(g, 900);
  });

  window.BioActions = window.BioActions || {};
  // state() is for the browser tests: where the cell is and which exit is right.
  window.BioActions[31] = { open: actionOpen, state: function () { return A; }, valveOpen: valveOpen };
})();

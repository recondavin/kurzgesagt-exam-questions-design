// Chapter 29's action game, Nephron run, in answer-mode.js's practice host (cards, the examiner, sounds).
// Uses window.BioKit from bio/bio-games.js; registers itself in window.BioActions[29].
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, host = BK.host, body = BK.body, buttons = BK.buttons;

  // Three rounds. 1: you're Bowman's capsule: catch what gets filtered, let cells and proteins pass.
  // 2: you're the capillary by the PCT: take back glucose, amino acids, water and salts; leave urea.
  // 3: you're ADH at the collecting duct: reabsorb the right amount of water for the day.
  // A question between rounds. Three hearts.
  var ITEMS = {
    glucose: { label: 'Glucose', color: '#FFC800', r: 16 },
    water: { label: 'Water', color: '#45C4EE', r: 14 },
    urea: { label: 'Urea', color: '#B5A642', r: 15 },
    salt: { label: 'Salt', color: '#E3E9F4', r: 13 },
    amino: { label: 'Amino acid', color: '#58CC02', r: 16 },
    rbc: { label: 'Red cell', color: '#FF4B4B', r: 22 },
    wbc: { label: 'White cell', color: '#F5F0FF', r: 22 },
    platelet: { label: 'Platelet', color: '#C9A0DC', r: 13 },
    protein: { label: 'Protein', color: '#7E5BA3', r: 20 }
  };
  var ROUNDS = [
    { title: 'Round 1: You are Bowman\'s capsule', ask: 'Catch what gets filtered out of the blood. Cells and proteins are too big: let them pass.',
      catcher: 'capsule', secs: 22, mix: ['glucose', 'water', 'urea', 'salt', 'amino', 'rbc', 'wbc', 'platelet', 'protein'],
      good: { glucose: 1, water: 1, urea: 1, salt: 1, amino: 1 },
      badLine: 'Too big to be filtered!', missLine: null,
      quiz: { q: 'Why don\'t red blood cells get into Bowman\'s capsule?', opts: ['They are too big to pass through the walls', 'ADH stops them', 'They are reabsorbed straight away', 'They are broken down in the glomerulus'], a: 0 } },
    { title: 'Round 2: You are the capillary by the PCT', ask: 'Take back what the body needs: catch ALL the glucose and amino acids, and water and salts. Let urea go: it\'s waste.',
      catcher: 'capillary', secs: 22, mix: ['glucose', 'amino', 'water', 'salt', 'urea', 'glucose', 'amino', 'urea'],
      good: { glucose: 1, amino: 1, water: 1, salt: 1 }, must: { glucose: 1, amino: 1 },
      badLine: 'Urea is waste: let it go!', missLine: 'Glucose lost in urine!',
      quiz: { q: 'Where in the nephron are ALL the glucose and amino acids reabsorbed?', opts: ['The proximal convoluted tubule', 'The collecting duct', 'The glomerulus', 'The ureter'], a: 0 } },
    { title: 'Round 3: You are ADH', catcher: 'duct', secs: 20, mix: ['water', 'water', 'water', 'urea'],
      good: { water: 1 }, badLine: 'Urea stays in the urine!',
      quiz: { q: 'Which gland releases ADH?', opts: ['The pituitary gland', 'The pancreas', 'The thyroid gland', 'The adrenal gland'], a: 0 } }
  ];
  var DAYS = [
    { name: 'A hot day: you\'ve been sweating', want: 'high', ask: 'Your blood is too concentrated. Lots of ADH: catch most of the water so it goes back into the blood.' },
    { name: 'You drank two litres of water', want: 'low', ask: 'Your blood is too dilute. Hardly any ADH: let most of the water go into the urine.' }
  ];
  var A = null;
  function actionOpen(ch) {
    if (ch !== 29) return;
    var card = host(ch, 'Nephron run');
    A = { card: card, round: 0, score: 0, hearts: 3, caught: {}, raf: 0, day: pick(DAYS) };
    K.root().addEventListener('click', actionClick);
    K.gameHud(card, ROUNDS.length, 'pts');
    actionIntro();
  }
  function actionIntro() {
    var r = ROUNDS[A.round];
    K.gameSeg(A.card, A.round, 'is-current');
    var ask = A.round === 2 ? '<b>' + esc(A.day.name) + '.</b> ' + esc(A.day.ask) : esc(r.ask);
    body(A.card, '<div class="nr"><div class="am-run__top"><h3 class="am-run__kind">' + esc(r.title) + '</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' +
      '<p class="am-games__ask">' + ask + '</p><div class="nr-stage"><canvas class="nr-canvas" data-nr-canvas aria-label="' + esc(r.title) + '"></canvas>' +
      '<div class="nr-overlay" data-nr-overlay><p>Move with your finger, the mouse or the arrow keys.</p></div></div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    hearts();
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-nr-play', A.round ? 'Go' : 'Start']]);
    if (!A.round) K.mascot('ok', 'You are the nephron. Don\'t mess it up.');
  }
  function hearts() {
    var h = A.card.querySelector('[data-nr-hearts]');
    if (h) h.textContent = '♥'.repeat(Math.max(0, A.hearts)) + '♡'.repeat(Math.max(0, 3 - A.hearts));
  }
  function actionPlay() {
    var r = ROUNDS[A.round], canvas = A.card.querySelector('[data-nr-canvas]'), ctx = canvas.getContext('2d');
    A.card.querySelector('[data-nr-overlay]').hidden = true;
    var rect = canvas.parentNode.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var W = Math.min(640, Math.round(rect.width)), H = Math.round(Math.min(420, Math.max(320, W * 0.66)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = A.g = { W: W, H: H, x: W / 2, items: [], t0: performance.now(), last: performance.now(), spawn: 0, end: r.secs * 1000, keys: {}, water: 0, waterKept: 0, lost: 0, done: false };
    canvas.onpointermove = function (e) { var b = canvas.getBoundingClientRect(); g.x = Math.max(40, Math.min(W - 40, e.clientX - b.left)); };
    canvas.onpointerdown = canvas.onpointermove;
    A.onKey = function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { g.keys[e.key] = e.type === 'keydown'; e.preventDefault(); }
    };
    document.addEventListener('keydown', A.onKey);
    document.addEventListener('keyup', A.onKey);
    buttons(A.card, [['more', 'data-am-keep', 'Stop']], true);
    canvas.setAttribute('tabindex', '0');
    canvas.focus({ preventScroll: true });
    var loop = function (now) {
      if (!A || A.g !== g || !canvas.isConnected) return;
      step(r, g, now);
      draw(r, g, ctx);
      if (!g.done) A.raf = requestAnimationFrame(loop);
    };
    A.raf = requestAnimationFrame(loop);
  }
  function step(r, g, now) {
    var dt = Math.min(50, now - g.last), el = now - g.t0;
    g.last = now;
    if (g.keys.ArrowLeft) g.x = Math.max(40, g.x - dt * 0.45);
    if (g.keys.ArrowRight) g.x = Math.min(g.W - 40, g.x + dt * 0.45);
    g.spawn -= dt;
    if (g.spawn <= 0 && el < g.end - 1500) {
      var kind = pick(r.mix), it = ITEMS[kind];
      g.items.push({ kind: kind, x: 30 + Math.random() * (g.W - 60), y: -it.r, vy: 0.08 + Math.random() * 0.05 + el / g.end * 0.07 });
      g.spawn = Math.max(420, 900 - el / g.end * 400);
    }
    var catchY = g.H - 46;
    g.items.forEach(function (o) {
      o.y += o.vy * dt;
      if (o.done) return;
      var rr = ITEMS[o.kind].r;
      if (o.y + rr >= catchY && o.y - rr <= catchY + 18 && Math.abs(o.x - g.x) < 46 + rr * 0.4) { o.done = true; caught(r, g, o); }
      else if (o.y - rr > g.H) { o.done = true; missed(r, g, o); }
    });
    g.items = g.items.filter(function (o) { return !(o.done && o.y - 40 > g.H) && !o.gone; });
    if (el >= g.end || A.hearts <= 0) { g.done = true; roundEnd(); }
  }
  function flash(text, good) {
    var note = A.card.querySelector('[data-am-gnote]');
    if (note) { note.textContent = text; note.className = 'am-games__note ' + (good ? 'nr-good' : 'nr-bad'); }
  }
  function caught(r, g, o) {
    o.gone = true;
    if (r.good[o.kind]) {
      if (o.kind === 'water') g.waterKept += 1;
      if (A.round === 2 && A.day.want === 'low') { flash('That water should have gone into the urine: hardly any ADH today.', false); A.score = Math.max(0, A.score - 2); }
      else { A.score += 5; K.ding(Math.min(10, (A.combo = (A.combo || 0) + 1)), false); }
    } else {
      A.hearts -= 1; A.combo = 0; hearts(); K.bonk(); flash(r.badLine, false); K.mascot('angry', r.badLine);
    }
    if (o.kind === 'water') g.water += 1;
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score, true);
  }
  function missed(r, g, o) {
    if (o.kind === 'water') g.water += 1;
    if (r.must && r.must[o.kind]) { A.hearts -= 1; A.combo = 0; hearts(); K.bonk(); flash(r.missLine, false); K.mascot('angry', r.missLine); }
    else if (A.round === 2 && o.kind === 'water' && A.day.want === 'low') { A.score += 3; }
  }
  function draw(r, g, ctx) {
    var W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    // Background: the glomerulus at the top (round 1), the tubule wall (round 2), the collecting duct (round 3).
    ctx.fillStyle = A.round === 0 ? '#FBEFE3' : A.round === 1 ? '#FFF6DB' : '#F3DCCB';
    ctx.fillRect(0, 0, W, H);
    if (A.round === 0) {
      ctx.strokeStyle = '#FF4B4B'; ctx.lineWidth = 5;
      for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(W / 2 - 80 + i * 40, 18, 24, 0, Math.PI); ctx.stroke(); }
    } else {
      ctx.fillStyle = A.round === 1 ? '#F7D27A' : '#E9C46A';
      ctx.fillRect(0, 0, 18, H); ctx.fillRect(W - 18, 0, 18, H);
    }
    // Things falling.
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    g.items.forEach(function (o) {
      if (o.gone) return;
      var it = ITEMS[o.kind];
      ctx.beginPath(); ctx.arc(o.x, o.y, it.r, 0, Math.PI * 2);
      ctx.fillStyle = it.color; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#18272D'; ctx.stroke();
      if (o.kind === 'rbc') { ctx.beginPath(); ctx.arc(o.x, o.y, it.r * 0.45, 0, Math.PI * 2); ctx.fillStyle = '#C2364A'; ctx.fill(); }
      ctx.fillStyle = '#18272D'; ctx.font = '800 11px Nunito, sans-serif';
      ctx.fillText(it.label, o.x, o.y + it.r + 10);
    });
    // The catcher.
    var y = H - 46;
    ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.strokeStyle = r.catcher === 'capsule' ? '#A9822F' : r.catcher === 'capillary' ? '#9B4A8C' : '#3E6FD8';
    ctx.beginPath();
    if (r.catcher === 'capsule') { ctx.moveTo(g.x - 48, y - 10); ctx.quadraticCurveTo(g.x, y + 34, g.x + 48, y - 10); }
    else { ctx.moveTo(g.x - 46, y); ctx.lineTo(g.x + 46, y); }
    ctx.stroke();
    ctx.fillStyle = '#18272D'; ctx.font = '700 12px Fredoka, Nunito, sans-serif';
    ctx.fillText(r.catcher === 'capsule' ? 'BOWMAN\'S CAPSULE' : r.catcher === 'capillary' ? 'CAPILLARY (back to the blood)' : 'COLLECTING DUCT WALL', g.x, y + 30);
    // Time left.
    var left = Math.max(0, 1 - (g.last - g.t0) / g.end);
    ctx.fillStyle = '#2B3B42'; ctx.fillRect(0, H - 6, W, 6);
    ctx.fillStyle = '#58CC02'; ctx.fillRect(0, H - 6, W * left, 6);
  }
  function roundEnd() {
    document.removeEventListener('keydown', A.onKey);
    document.removeEventListener('keyup', A.onKey);
    var g = A.g, r = ROUNDS[A.round], extra = '';
    if (A.round === 2) {
      var kept = g.water ? g.waterKept / g.water : 0, ok = A.day.want === 'high' ? kept >= 0.7 : kept <= 0.35;
      A.dayOk = ok;
      extra = '<p class="nr-result ' + (ok ? 'nr-good' : 'nr-bad') + '">You reabsorbed <b>' + Math.round(kept * 100) + '%</b> of the water: ' +
        (A.day.want === 'high' ? 'a small volume of concentrated urine is right on a hot day.' : 'a large volume of dilute urine is right after drinking a lot.') +
        (ok ? ' Just right.' : ' Not quite.') + '</p>';
      if (ok) A.score += 20;
    }
    K.gameSeg(A.card, A.round, A.hearts > 0 ? 'is-ok' : 'is-no');
    if (A.hearts <= 0) { actionEnd(); return; }
    var q = r.quiz;
    A.card.querySelector('.nr').innerHTML = '<div class="am-run__top"><h3 class="am-run__kind">Quick question</h3><span class="am-games__step nr-hearts" data-nr-hearts></span></div>' + extra +
      '<p class="am-games__ask">' + esc(q.q) + '</p><div class="am-run__opts">' + shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-nr-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
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
    if (!ok) A.card.querySelector('[data-nr-opt="' + q.a + '"]').classList.add('am-run__opt--ok');
    if (ok) { A.score += 10; K.ding(6, true); K.mascot('happy', 'Correct. Next.'); } else { K.bonk(); K.mascot('angry', 'Wrong. Remember that one.'); }
    K.rollTo(A.card.querySelector('[data-am-gscore]'), A.score);
    var last = A.round + 1 >= ROUNDS.length;
    buttons(A.card, [['ok', last ? 'data-nr-end' : 'data-nr-next', last ? 'See my score' : 'Next round']]);
  }
  function actionEnd() {
    cancelAnimationFrame(A.raf);
    var best = +K.store('bio-act-29') || 0, newBest = A.score > best;
    if (newBest) K.store('bio-act-29', String(A.score));
    var out = A.hearts <= 0;
    body(A.card, '<div class="am-games__end"><p class="am-games__big">' + A.score + '<span> pts</span></p>' +
      '<h3 class="am-games__title">' + (out ? 'Kidney failure!' : A.dayOk ? 'A healthy nephron' : 'Nearly there') + '</h3>' +
      '<p class="am-games__sub">' + (out ? 'Out of hearts. Remember: cells and proteins stay in the blood, glucose and amino acids all come back, urea leaves.' :
        'Filtration in Bowman\'s capsule, reabsorption in the PCT, and ADH deciding how much water to keep.') +
      (newBest && best ? ' <b>New best!</b>' : best ? ' Your best: ' + best + '.' : '') + '</p></div>');
    buttons(A.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-nr-again', 'Play again']]);
    K.mascot(out ? 'furious' : 'happy', out ? 'Kidney failure. On my watch.' : 'Hmph. Your kidneys would be proud.');
    if (!out && A.dayOk) K.later(K.fanfare, 300);
  }
  function actionClick(e) {
    if (!A) return;
    var t;
    if (e.target.closest('[data-nr-play]')) { actionPlay(); return; }
    if ((t = e.target.closest('[data-nr-opt]'))) { actionQuiz(+t.getAttribute('data-nr-opt'), t); return; }
    if (e.target.closest('[data-nr-next]')) { A.round += 1; actionIntro(); return; }
    if (e.target.closest('[data-nr-end]')) { actionEnd(); return; }
    if (e.target.closest('[data-nr-again]')) { actionOpen(29); }
  }

  window.BioActions = window.BioActions || {};
  window.BioActions[29] = { open: actionOpen };
})();

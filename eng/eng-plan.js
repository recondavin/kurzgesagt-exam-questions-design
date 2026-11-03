// Knock 'em off: the essay builder's Plan, as a slingshot game (the user, of a card game for it: "not a fucking card
// game like the trivia or the slingshot or pool or golf those were superrr fun"). In answer-mode's game card, like
// the Biology arcade's Topple the Examiner (bio/bio-arcade.js), with the same physics (matter.js 0.19.0,
// bio/vendor/matter.min.js) and the same slingshot.
//   Each aspect of the mode is a crate of exam papers on its own shelf. Pull the paper ball back and let go: a crate
//   knocked off its shelf is a paragraph. The examiner rates each one for how well it fits the question (stars, from
//   the builder's planScores) as it falls. Six shots to knock off three; then your plan.
// EngPlanGame.open({ topic, aspects, rank: {aspect: place}, colour, done(picks) }).
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit;
  if (!K) return;
  var TW = 1000, TH = 500, GROUND = 470, SLING = { x: 160, y: 352 }, PULL = 110, LAUNCH = 0.25, STEP = 1 / 180, SHOTS = 6;
  var INK = '#1E2A3A', SKY = '#CFE6F7', GRASS = '#7CC25A', GRASS_DK = '#5FA544', SOIL = '#8A5A33', SOIL2 = '#7A4D2B';
  // Shelves: [middle x, top y], nearest and lowest first.
  // Two staircases, rising away from the slingshot, so each crate has a clear line from it (tools/eng/tests/plan.mjs
  // checks each can be knocked off).
  var SPOTS = [[520, 402], [660, 378], [800, 354], [930, 330], [590, 250], [740, 222], [890, 194]];
  var CW = 132, CH = 50, G = null;
  function esc(s) { return K.esc(String(s == null ? '' : s)); }
  function q(sel) { return G && G.card.querySelector(sel); }
  function stars(a) { var r = G.o.rank[a]; return r == null ? 1 : r < 3 ? 3 : r < 5 ? 2 : 1; }

  function open(o) {
    if (!window.Matter) { o.done(null); return; }
    close();
    AM.practice('eng', 'none', function () { stop(); G = null; });
    G = { o: o, card: K.gameCard('Knock \'em off'), shots: SHOTS, picks: [], phase: 'aim', pull: { x: 0, y: 0 }, fx: [], dragging: false };
    K.playing(true);
    K.gameBody(G.card, '<div class="epl">' +
      '<p class="epl-q"><span>Knock off the 3 that answer the question</span>' + esc(o.topic) + '</p>' +
      '<div class="epl-stage"><canvas class="epl-canvas" data-epl-canvas tabindex="0" aria-label="Pull the paper ball back and let go to knock a crate off its shelf"></canvas>' +
        '<div class="epl-hud"><span class="epl-shots" data-epl-shots></span><span class="epl-picks" data-epl-picks></span></div></div>' +
      '<ol class="epl-key" data-epl-key>' + o.aspects.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol>' +
      '<p class="epl-help">Drag the ball back and let go. Keys: ← → power, ↑ ↓ aim, Space to fire.</p></div>');
    K.fillButtons(G.card.querySelector('[data-am-gbtns]'), [['more', 'data-am-keep', 'Close']], true);
    build();
    hud();
    K.mascot('ok', 'Three crates. The ones that answer the question. Aim.');
    var c = q('[data-epl-canvas]');
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('keydown', key);
    window.addEventListener('resize', size);
    size();
    G.last = performance.now();
    G.raf = requestAnimationFrame(loop);
  }
  function close() { if (G) stop(); }
  function stop() { if (!G) return; cancelAnimationFrame(G.raf); window.removeEventListener('resize', size); }

  // ----- the world: static shelves and their posts, a crate on each.
  function build() { var w = world(G.o.aspects); G.eng = w.eng; G.crates = w.crates; }
  function world(aspects) {
    var M = window.Matter, eng = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    var bodies = [M.Bodies.rectangle(TW / 2, GROUND + 40, TW * 3, 80, { isStatic: true, label: 'ground', friction: 0.9 })], crates = [];
    aspects.forEach(function (a, i) {
      var s = SPOTS[i % SPOTS.length];
      bodies.push(M.Bodies.rectangle(s[0], s[1] + 7, 140, 14, { isStatic: true, label: 'shelf', friction: 0.5 }));
      var c = M.Bodies.rectangle(s[0], s[1] - CH / 2, CW, CH, { label: 'crate', density: 0.0003, friction: 0.15, frictionStatic: 0.3, restitution: 0.1 });
      c.aspect = a; c.homeY = c.position.y; c.shelf = s;
      crates.push(c); bodies.push(c);
    });
    M.Composite.add(eng.world, bodies);
    // A hit sends a crate flying off its shelf (an arcade knock, not a nudge: a ball coming down on a crate's top
    // barely moved it).
    M.Events.on(eng, 'collisionStart', function (ev) {
      ev.pairs.forEach(function (pr) {
        var a = pr.bodyA, b = pr.bodyB, ball = a.label === 'ball' ? a : b.label === 'ball' ? b : null, c = a.label === 'crate' ? a : b.label === 'crate' ? b : null;
        if (!ball || !c || c.hit) return;
        c.hit = true;
        M.Sleeping.set(c, false);
        M.Body.setVelocity(c, { x: Math.max(5, ball.velocity.x * 0.7 + 4), y: Math.min(-4, ball.velocity.y * 0.3 - 5) });
        M.Body.setAngularVelocity(c, 0.18);
      });
    });
    return { eng: eng, crates: crates };
  }
  // Knocked: fallen, shoved well along its shelf, or tipped over.
  function isOff(c) { return c.hit || c.position.y > c.homeY + 40 || Math.abs(c.position.x - c.shelf[0]) > 45 || Math.abs(c.angle) > 0.6 || c.position.x < -80 || c.position.x > TW + 80; }
  function size() {
    var c = q('[data-epl-canvas]');
    if (!c) return;
    var w = c.parentNode.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1);
    G.s = w / TW; G.dpr = dpr;
    c.style.height = Math.round(TH * G.s) + 'px';
    c.width = Math.round(w * dpr); c.height = Math.round(TH * G.s * dpr);
    var k = q('[data-epl-key]'); if (k) k.hidden = G.s >= 0.6;
  }
  function hud() {
    var key = q('[data-epl-key]');
    if (key) [].forEach.call(key.children, function (li, i) { li.classList.toggle('is-on', G.picks.indexOf(G.o.aspects[i]) >= 0); });
    var s = q('[data-epl-shots]'), p = q('[data-epl-picks]');
    if (s) s.innerHTML = 'Shots ' + Array.apply(null, Array(SHOTS)).map(function (x, i) { return '<i' + (i < G.shots ? ' class="is-on"' : '') + '></i>'; }).join('');
    if (p) p.innerHTML = [0, 1, 2].map(function (k) { var a = G.picks[k]; return '<b' + (a ? ' class="is-on"' : '') + '>' + (a ? esc(a) : 'Paragraph ' + (k + 1)) + '</b>'; }).join('');
  }

  // ----- aiming and firing (the pull is only ever backwards, and no further than PULL, as in Topple the Examiner).
  function clampPull(x, y) {
    var d = Math.hypot(x, y), a = Math.atan2(y, -x), lo = -0.45, hi = 1.4;
    if (d < 0.01) return { x: 0, y: 0 };
    if (x > 0 || a < lo || a > hi) a = Math.max(lo, Math.min(hi, x > 0 ? (y > 0 ? hi : lo) : a));
    d = Math.min(PULL, d);
    return { x: -Math.cos(a) * d, y: Math.sin(a) * d };
  }
  function at(ev) { var r = ev.currentTarget.getBoundingClientRect(); return { x: (ev.clientX - r.left) / G.s, y: (ev.clientY - r.top) / G.s }; }
  function down(ev) {
    if (!G || G.phase !== 'aim') return;
    var p = at(ev);
    if (Math.hypot(p.x - SLING.x, p.y - SLING.y) > 90) return;
    G.dragging = true; ev.currentTarget.setPointerCapture(ev.pointerId);
    G.pull = clampPull(p.x - SLING.x, p.y - SLING.y);
  }
  function move(ev) { if (G && G.dragging) { var p = at(ev); G.pull = clampPull(p.x - SLING.x, p.y - SLING.y); } }
  function up() { if (!G || !G.dragging) return; G.dragging = false; if (Math.hypot(G.pull.x, G.pull.y) >= 22) fire(); else G.pull = { x: 0, y: 0 }; }
  function key(ev) {
    if (!G || G.phase !== 'aim') return;
    var p = G.pull.x || G.pull.y ? G.pull : { x: -70, y: 30 }, d = Math.hypot(p.x, p.y), a = Math.atan2(p.y, -p.x);
    if (ev.key === 'ArrowLeft') d -= 6; else if (ev.key === 'ArrowRight') d += 6; else if (ev.key === 'ArrowUp') a += 0.05; else if (ev.key === 'ArrowDown') a -= 0.05;
    else if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); if (Math.hypot(p.x, p.y) >= 22) { G.pull = p; fire(); } return; }
    else return;
    ev.preventDefault();
    G.pull = clampPull(-Math.cos(a) * Math.max(0, d), Math.sin(a) * Math.max(0, d));
  }
  function ball(x, y) { return window.Matter.Bodies.circle(x, y, 14, { label: 'ball', density: 0.007, friction: 0.4, restitution: 0.35 }); }
  function fire() {
    var M = window.Matter, p = G.pull, b = ball(SLING.x + p.x, SLING.y + p.y);
    M.Composite.add(G.eng.world, b);
    M.Body.setVelocity(b, { x: -p.x * LAUNCH, y: -p.y * LAUNCH });
    G.shot = b; G.shotT = 0; G.phase = 'fly'; G.pull = { x: 0, y: 0 };
    G.shots--; hud();
    K.sfx('twang', 0.5);
  }
  // Where the ball will go: its first 0.4 seconds, in an empty world with the same launch.
  function trail() {
    var M = window.Matter, p = G.pull, eng = M.Engine.create(), b = ball(SLING.x + p.x, SLING.y + p.y), out = [];
    M.Composite.add(eng.world, b);
    M.Body.setVelocity(b, { x: -p.x * LAUNCH, y: -p.y * LAUNCH });
    for (var i = 1; i <= 72; i++) { M.Engine.update(eng, 1000 * STEP); if (i % 8 === 0) out.push([b.position.x, b.position.y]); }
    return out;
  }

  // ----- the loop: physics, crates knocked off, the end of a shot, the end of the game.
  function loop(now) {
    if (!G || !G.card.isConnected) { stop(); return; }
    var dt = Math.min(0.05, (now - G.last) / 1000); G.last = now;
    G.acc = (G.acc || 0) + dt;
    while (G.acc >= STEP) { window.Matter.Engine.update(G.eng, 1000 * STEP); G.acc -= STEP; if (G.phase === 'fly') G.shotT += STEP; }
    G.crates.forEach(function (c) {
      if (c.picked) return;
      // Off its shelf: fallen below it, or pushed past its edge (it falls from there).
      if (isOff(c)) knocked(c);
    });
    if (G.phase === 'fly') {
      var b = G.shot, gone = b.position.x > TW + 60 || b.position.x < -60 || b.position.y > TH + 60;
      if (gone || G.shotT > 6 || (G.shotT > 0.8 && b.speed < 0.15) || (G.shotT > 1.2 && settled())) endShot();
    }
    G.fx = G.fx.filter(function (f) { f.t += dt; return f.t < 2.4; });
    draw();
    G.raf = requestAnimationFrame(loop);
  }
  function settled() { return G.crates.every(function (c) { return c.isSleeping || c.speed < 0.12; }); }
  function knocked(c) {
    c.picked = true;
    G.picks.push(c.aspect);
    var n = stars(c.aspect);
    G.fx.push({ x: c.position.x, y: Math.min(c.position.y, GROUND - 60), t: 0, n: n, a: c.aspect });
    K.sfx(n === 3 ? 'stamp' : 'thud', 0.5);
    if (n === 3) K.ding(Math.min(G.picks.length, 6));
    K.mascot(n === 3 ? 'happy' : n === 2 ? 'ok' : 'angry', n === 3 ? ['Spot on.', 'That one answers it.', 'Good. Exactly that.'][G.picks.length % 3] : n === 2 ? 'It\'ll do. There are better.' : 'That\'s not what the question\'s about.');
    hud();
  }
  function endShot() {
    window.Matter.Composite.remove(G.eng.world, G.shot);
    G.shot = null;
    if (G.picks.length >= 3 || G.shots <= 0) { G.phase = 'done'; setTimeout(finish, 700); return; }
    G.phase = 'aim';
    if (G.picks.length < 3 && G.shots === 1) K.mascot('ok', 'Last shot. Make it count.');
  }
  function finish() {
    if (!G || !G.card.isConnected) return;
    stop();
    K.playing(false);
    var picks = G.picks.slice().sort(function (a, b) { return stars(b) - stars(a); }), plan = picks.slice(0, 3), added = [];
    G.o.aspects.slice().sort(function (a, b) { return G.o.rank[a] - G.o.rank[b]; }).forEach(function (a) { if (plan.length < 3 && plan.indexOf(a) < 0) { plan.push(a); added.push(a); } });
    var got = plan.reduce(function (n, a) { return n + (added.indexOf(a) >= 0 ? 0 : stars(a)); }, 0), max = 9;
    G.plan = plan;
    K.gameBody(G.card, '<div class="am-games__end epl-end"><p class="am-games__big">' + got + '<span>/' + max + '</span></p>' +
      '<h3 class="am-games__title">' + (got === max ? 'Perfect plan!' : got >= 7 ? 'Strong plan' : 'It\'ll work') + '</h3>' +
      '<ol class="epl-plan">' + plan.map(function (a) {
        var mine = added.indexOf(a) < 0, n = stars(a);
        return '<li><span>' + esc(a) + (mine ? '' : ' <small>added: you ran out of shots</small>') + '</span>' + (mine ? '<i>' + '★★★'.slice(0, n) + '<s>' + '★★★'.slice(n) + '</s></i>' : '') + '</li>';
      }).join('') + '</ol>' +
      (picks.length > 3 ? '<p class="am-games__sub">You knocked off ' + picks.length + ': the best three are your paragraphs.</p>' : '') + '</div>');
    K.fillButtons(G.card.querySelector('[data-am-gbtns]'), [['more', 'data-epl-again', 'Play again'], ['ok', 'data-epl-use data-am-keep', 'Use this plan']]);
    K.mascot(got === max ? 'happy' : 'ok', got === max ? 'Hmph. Flawless.' : 'Now write it.');
    if (got === max) K.later(K.fanfare, 300);
  }

  // ----- drawing: sky, ground, the shelves and their posts, the crates, the slingshot, the ball, the stars.
  function draw() {
    var c = q('[data-epl-canvas]');
    if (!c) return;
    var g = c.getContext('2d'), s = G.s * G.dpr, M = window.Matter;
    g.setTransform(s, 0, 0, s, 0, 0);
    g.fillStyle = SKY; g.fillRect(0, 0, TW, TH);
    g.fillStyle = '#FFFFFF';
    [[220, 80, 1], [520, 60, 0.8], [760, 100, 1.1]].forEach(function (k) { cloud(g, k[0], k[1], k[2]); });
    g.fillStyle = SOIL; g.fillRect(0, GROUND, TW, TH - GROUND);
    g.fillStyle = SOIL2; g.fillRect(0, GROUND + 18, TW, TH - GROUND);
    g.fillStyle = GRASS_DK; g.fillRect(0, GROUND + 3, TW, 8);
    g.fillStyle = GRASS; g.fillRect(0, GROUND - 5, TW, 10);
    G.o.aspects.forEach(function (a, i) { shelf(g, SPOTS[i % SPOTS.length]); });
    sling(g, false);
    if (G.phase === 'aim' && Math.hypot(G.pull.x, G.pull.y) >= 22) {
      g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 2;
      trail().forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 5, 0, 6.3); g.fill(); g.stroke(); });
    }
    M.Composite.allBodies(G.eng.world).forEach(function (b) { if (b.label === 'crate') crate(g, b); else if (b.label === 'ball') paperBall(g, b.position.x, b.position.y, b.angle); });
    sling(g, true);
    if (G.phase === 'aim' && !G.dragging && !G.pull.x && !G.pull.y) {
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.setLineDash([8, 7]);
      g.beginPath(); g.arc(SLING.x, SLING.y, 34, 0, 6.3); g.stroke(); g.setLineDash([]);
    }
    G.fx.forEach(function (f) {
      var rise = Math.min(1, f.t / 0.4), fade = f.t > 1.8 ? 1 - (f.t - 1.8) / 0.6 : 1;
      g.globalAlpha = Math.max(0, fade);
      g.font = '700 30px Fredoka, Nunito, sans-serif'; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = INK;
      var y = f.y - 40 - rise * 30, txt = '★★★'.slice(0, f.n) + '☆☆☆'.slice(f.n);
      g.strokeText(txt, f.x, y); g.fillStyle = '#FFD43B'; g.fillText(txt, f.x, y);
      g.globalAlpha = 1;
    });
  }
  function cloud(g, x, y, k) { g.beginPath(); g.ellipse(x, y, 60 * k, 22 * k, 0, 0, 6.3); g.ellipse(x + 40 * k, y - 12 * k, 40 * k, 24 * k, 0, 0, 6.3); g.ellipse(x - 38 * k, y - 6 * k, 34 * k, 18 * k, 0, 0, 6.3); g.fill(); }
  function shelf(g, s) {
    g.strokeStyle = INK; g.lineWidth = 2.5;
    [s[0] - 52, s[0] + 52].forEach(function (x) { g.fillStyle = '#9C6A3C'; g.fillRect(x - 5, s[1] + 14, 10, GROUND - s[1] - 14); g.strokeRect(x - 5, s[1] + 14, 10, GROUND - s[1] - 14); });
    g.fillStyle = '#D69A5B'; g.fillRect(s[0] - 70, s[1], 140, 14);
    g.fillStyle = '#EBC08A'; g.fillRect(s[0] - 70, s[1], 140, 4);
    g.strokeRect(s[0] - 70, s[1], 140, 14);
  }
  // A crate of exam papers: the sheets, a tab in the mode's colour, the aspect written on it.
  function crate(g, b) {
    g.save(); g.translate(b.position.x, b.position.y); g.rotate(b.angle);
    g.fillStyle = G.o.colour; g.fillRect(CW / 2 - 14, -CH / 2 - 8, 12, 10);
    g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(CW / 2 - 14, -CH / 2 - 8, 12, 10);
    g.fillStyle = b.picked ? '#FFF6CF' : '#FFFDF6'; g.fillRect(-CW / 2, -CH / 2, CW, CH);
    g.strokeStyle = '#D8DEE3'; g.lineWidth = 1.5; g.beginPath();
    for (var y = -CH / 2 + 7; y < CH / 2; y += 7) { g.moveTo(-CW / 2 + 4, y); g.lineTo(CW / 2 - 4, y); }
    g.stroke();
    g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(-CW / 2, -CH / 2, CW, CH);
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (G.s < 0.6) { g.font = '700 38px Fredoka, Nunito, sans-serif'; g.fillText(String(G.o.aspects.indexOf(b.aspect) + 1), 0, 2); }
    else {
      g.font = '800 14px Nunito, sans-serif';
      var lines = wrap(g, b.aspect, CW - 12);
      lines.forEach(function (l, i) { g.fillText(l, 0, (i - (lines.length - 1) / 2) * 16); });
    }
    g.restore();
  }
  function wrap(g, t, w) {
    var out = [], cur = '';
    t.split(' ').forEach(function (word) { var next = cur ? cur + ' ' + word : word; if (g.measureText(next).width > w && cur) { out.push(cur); cur = word; } else cur = next; });
    if (cur) out.push(cur);
    return out.slice(0, 3);
  }
  function paperBall(g, x, y, a) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = '#FFFDF6'; g.strokeStyle = INK; g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, 14, 0, 6.3); g.fill(); g.stroke();
    g.strokeStyle = '#B9C3CB'; g.lineWidth = 1.5; g.beginPath();
    g.moveTo(-8, -4); g.lineTo(-1, 1); g.lineTo(6, -6); g.moveTo(-6, 7); g.lineTo(2, 4); g.lineTo(8, 8); g.stroke();
    g.restore();
  }
  // The slingshot, wood with navy outlines: the back prong and its band behind the ball, the front ones in front.
  function sling(g, front) {
    var px = SLING.x, py = SLING.y, p = G.phase === 'aim' ? G.pull : null, sx = px + (p ? p.x : 0), sy = py + (p ? p.y : 0);
    function stick(pts, wood) {
      [[INK, 17], [wood, 11]].forEach(function (k) {
        g.strokeStyle = k[0]; g.lineWidth = k[1]; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); pts.forEach(function (pt, i) { if (i) g.lineTo(pt[0], pt[1]); else g.moveTo(pt[0], pt[1]); }); g.stroke();
      });
    }
    function band(x, y) { g.strokeStyle = '#5A3214'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(sx, sy); g.stroke(); }
    if (!front) {
      stick([[px, py + 34], [px + 18, py - 8]], '#8A5426');
      if (p) {
        band(px + 18, py - 8);
        g.fillStyle = '#5A3214'; g.beginPath(); g.roundRect(sx - 12, sy - 8, 24, 16, 6); g.fill();
        paperBall(g, sx, sy, 0);
      }
      return;
    }
    if (p) band(px - 16, py - 8);
    stick([[px, GROUND + 4], [px, py + 34], [px - 16, py - 8]], '#B0723A');
  }

  // Before answer-mode's own click (which closes the card on data-am-keep).
  document.addEventListener('click', function (e) {
    if (!G || !G.card.isConnected) return;
    if (e.target.closest('[data-epl-use]')) { var plan = G.plan, done = G.o.done; setTimeout(function () { if (done) done(plan); }, 0); return; }
    if (e.target.closest('[data-epl-again]')) { var o = G.o; open(o); }
  }, true);
  window.EngPlanGame = { open: open, test: { clampPull: clampPull, SPOTS: SPOTS, LAUNCH: LAUNCH, SLING: SLING, STEP: STEP, state: function () { return G; }, world: world, isOff: isOff, ball: ball, TW: TW, TH: TH, fire: function (x, y) { if (G && G.phase === 'aim') { G.pull = clampPull(x, y); fire(); } } } };
})();

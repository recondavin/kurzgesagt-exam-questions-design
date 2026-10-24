// Pool against the examiner, in 3D (the user: "now 3d pool against him"; they had asked for pool to wait until it could
// be 3D). Nine balls racked in a diamond: your four (blue), his four (orange, striped) and the black in the middle. You
// break. Pot one of yours and you can shoot again (two shots a turn at most); miss, or pot the cue ball, and it's his
// turn (the cue ball goes back on its spot). Clear your four, then pot the black to win; pot it any earlier and you lose.
// You take turns, a question before every shot (from the chapter picked at the start, or all of them; the trivia
// board's cards; every third of yours typed and marked like the answer sheet). The rule for turns (the user: "if you get
// them wrong then u dont rlly get to continue and u can get 2 right then its capped"):
//   right        you shoot, with a short trail of dots showing which way the cue ball starts (no ghost ball, no
//                pocket shown). Pot one of yours and you answer again for a second shot; then it's his turn;
//   wrong        no shot, and it's his turn;
//   typed right  a mulligan as well: take one shot again (the table goes back as it was), kept until you use it.
// He plays by the same rule (right 65 in 100): right, the best pot a search finds (ghost-ball lines to every pocket,
// tried in the physics, the one that still drops when aimed a little off) with a small wobble; wrong, no shot.
// The physics is done here in 2D on the cloth and is deterministic (tools/bio/tests/pool.mjs): balls slow on the cloth,
// bounce off each other and the cushions, and drop when they cross a pocket's mouth. three.js (bio/vendor/three.min.js)
// only draws it.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.pools) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours, INK = '#13294A';
  var SKY = '#CDEBFA', GRASS = '#74C043', GRASS_DK = '#4E9A2E', SOIL = '#D9A066', SOIL2 = '#BF844D';
  var BLUE = '#1CB0F6', ORANGE = '#FF9600';
  var A = null;
  function live() { return A && A.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return A.card.querySelector(sel); }

  // ======================================================================== the table and its physics
  // Units are about 10cm. The cloth inside the cushions runs from -L to L along the table and -W to W across; a ball's
  // radius is R. The cushions stop short of the six pockets: a corner's mouth is GC along each side, a middle's 2 x GM.
  var L = 10, W = 5, R = 0.36, D2 = 4 * R * R, GC = 1.1, GM = 0.7, DT = 1 / 120, ROLL = 1.2, DRAG = 0.06, CUSH = 0.8, KISS = 0.94, VMAX = 30, MAXT = 20;
  var RAILS = [-L + GC, W, -GM, W, GM, W, L - GC, W, -L + GC, -W, -GM, -W, GM, -W, L - GC, -W, -L, -W + GC, -L, W - GC, L, -W + GC, L, W - GC];
  var POCKETS = [[-L, -W], [0, -W], [L, -W], [L, W], [0, W], [-L, W]];
  // Ball 0 is the cue ball, 1 to 4 are yours, 5 to 8 his, 9 the black.
  var N = 10, BLACK = 9;
  function owner(b) { return b === 0 ? -1 : b === BLACK ? 2 : b <= 4 ? 0 : 1; }
  function copy(st) { return { p: st.p.map(function (p) { return p.slice(); }), on: st.on.slice() }; }
  // The rack: a diamond on the foot spot, the black in its middle, the rest shuffled; the cue ball on the head spot.
  function rack(rand) {
    var spots = [], dx = 2 * R * 0.866 + 0.004, dy = 2 * R + 0.004, order = [1, 2, 3, 4, 5, 6, 7, 8], i;
    [1, 2, 3, 2, 1].forEach(function (n, row) { for (var k = 0; k < n; k++) spots.push([5 + row * dx, (k - (n - 1) / 2) * dy]); });
    var mid = spots.splice(4, 1)[0], p = [[-5, 0]];
    for (i = order.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
    order.forEach(function (b, k) { p[b] = spots[k]; });
    p[BLACK] = mid;
    return { p: p, on: p.map(function () { return true; }) };
  }
  // The balls while they move.
  var X = new Float64Array(N), Y = new Float64Array(N), VX = new Float64Array(N), VY = new Float64Array(N), ON = new Uint8Array(N);
  // Ball i against the cushion from a to b: pushed back out and bounced (a little lost along it too). Its speed into
  // the cushion, or -1 if it isn't touching. The cushions' ends are the pockets' rounded knuckles.
  function rail(i, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = ((X[i] - ax) * dx + (Y[i] - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var qx = ax + t * dx, qy = ay + t * dy, ex = X[i] - qx, ey = Y[i] - qy, d2 = ex * ex + ey * ey;
    if (d2 >= R * R) return -1;
    var d = Math.sqrt(d2), nx = d > 1e-9 ? ex / d : -Math.sign(qx) || 1, ny = d > 1e-9 ? ey / d : 0;
    X[i] = qx + nx * R;
    Y[i] = qy + ny * R;
    var vn = VX[i] * nx + VY[i] * ny;
    if (vn >= 0) return 0;
    VX[i] -= (1 + CUSH) * vn * nx;
    VY[i] -= (1 + CUSH) * vn * ny;
    var vt = -VX[i] * ny + VY[i] * nx;
    VX[i] += 0.05 * vt * ny;
    VY[i] -= 0.05 * vt * nx;
    return -vn;
  }
  // A shot: the cue ball struck at an angle (radians: 0 is down the table, towards the rack) and power (0 to 1). Steps
  // of 1/120s (smaller when a ball is fast): the cloth slows every ball (more when it's fast), then they move, knock
  // each other (equal balls, a little lost), bounce off the cushions and drop when a ball's middle crosses the line of
  // the cushions, which it can only do at a pocket's mouth. Nothing random, so the same shot always plays the same way.
  // Returns where everything ends up, what was potted (in order), what the cue ball hit first, every knock (hits: step i,
  // balls a and b, b -1 for a cushion) and, with record, every step's positions (frames: x, y for each ball).
  function shoot(st, angle, power, record) {
    var i, j, k, steps, n = Math.round(MAXT / DT), hits = [], pots = [], first = -1, v = speedOf(power);
    for (i = 0; i < N; i++) { X[i] = st.p[i][0]; Y[i] = st.p[i][1]; VX[i] = VY[i] = 0; ON[i] = st.on[i] ? 1 : 0; }
    VX[0] = Math.cos(angle) * v;
    VY[0] = Math.sin(angle) * v;
    var frames = record ? [] : null;
    function frame() { for (var b = 0; b < N; b++) frames.push(X[b], Y[b]); }
    if (record) frame();
    for (steps = 0; steps < n;) {
      var top = 0;
      for (i = 0; i < N; i++) {
        if (!ON[i] || (!VX[i] && !VY[i])) continue;
        var sp = Math.sqrt(VX[i] * VX[i] + VY[i] * VY[i]), fr = (ROLL + DRAG * sp) * DT;
        if (sp <= fr) { VX[i] = VY[i] = 0; continue; }
        VX[i] *= (sp - fr) / sp;
        VY[i] *= (sp - fr) / sp;
        if (sp > top) top = sp;
      }
      if (!top) break;
      steps += 1;
      var m = Math.max(1, Math.ceil(top * DT / 0.09)), r;
      for (k = 0; k < m; k++) {
        for (i = 0; i < N; i++) if (ON[i]) { X[i] += VX[i] * DT / m; Y[i] += VY[i] * DT / m; }
        for (i = 0; i < N; i++) {
          if (!ON[i]) continue;
          for (j = i + 1; j < N; j++) {
            if (!ON[j]) continue;
            var dx = X[j] - X[i], dy = Y[j] - Y[i], d2 = dx * dx + dy * dy;
            if (d2 >= D2) continue;
            // They're found a little into each other: back both up to the moment they touched, so they knock along the
            // true line of their middles (a cut goes where the ghost ball says), then on again for the time backed up.
            var wx = VX[j] - VX[i], wy = VY[j] - VY[i], ww = wx * wx + wy * wy, dw = dx * wx + dy * wy, back = 0;
            if (ww > 1e-12) back = Math.max(0, Math.min(DT / m, (dw + Math.sqrt(Math.max(0, dw * dw - ww * (d2 - D2)))) / ww));
            X[i] -= VX[i] * back;
            Y[i] -= VY[i] * back;
            X[j] -= VX[j] * back;
            Y[j] -= VY[j] * back;
            dx = X[j] - X[i];
            dy = Y[j] - Y[i];
            var d = Math.sqrt(dx * dx + dy * dy), nx = d > 1e-9 ? dx / d : 1, ny = d > 1e-9 ? dy / d : 0, vn = (VX[i] - VX[j]) * nx + (VY[i] - VY[j]) * ny;
            if (vn > 0) {
              var jj = (1 + KISS) / 2 * vn;
              VX[i] -= jj * nx;
              VY[i] -= jj * ny;
              VX[j] += jj * nx;
              VY[j] += jj * ny;
              hits.push({ i: steps, a: i, b: j, v: vn, x: (X[i] + X[j]) / 2, y: (Y[i] + Y[j]) / 2 });
              if (first < 0 && i === 0) first = j;
            }
            X[i] += VX[i] * back;
            Y[i] += VY[i] * back;
            X[j] += VX[j] * back;
            Y[j] += VY[j] * back;
            // Still into each other (they were resting there): pushed apart.
            dx = X[j] - X[i];
            dy = Y[j] - Y[i];
            d = Math.sqrt(dx * dx + dy * dy);
            if (d < 2 * R) {
              var half = (2 * R - d) / 2;
              nx = d > 1e-9 ? dx / d : 1;
              ny = d > 1e-9 ? dy / d : 0;
              X[i] -= nx * half;
              Y[i] -= ny * half;
              X[j] += nx * half;
              Y[j] += ny * half;
            }
          }
        }
        for (i = 0; i < N; i++) {
          if (!ON[i]) continue;
          for (j = 0; j < RAILS.length; j += 4) {
            if ((r = rail(i, RAILS[j], RAILS[j + 1], RAILS[j + 2], RAILS[j + 3])) > 0.2) {
              hits.push({ i: steps, a: i, b: -1, v: r, x: X[i], y: Y[i] });
              if (first < 0 && i === 0) first = -2;
            }
          }
          // Over the line of the cushions: it's at a pocket's mouth, and drops into the nearest pocket.
          if (Math.abs(X[i]) > L || Math.abs(Y[i]) > W) {
            var best = 0, bd = Infinity;
            POCKETS.forEach(function (p, pk) { var e = Math.hypot(X[i] - p[0], Y[i] - p[1]); if (e < bd) { bd = e; best = pk; } });
            pots.push({ b: i, k: best, i: steps, x: X[i], y: Y[i] });
            ON[i] = 0;
            X[i] = POCKETS[best][0];
            Y[i] = POCKETS[best][1];
            VX[i] = VY[i] = 0;
          }
        }
      }
      if (record) frame();
    }
    var end = { p: [], on: [] };
    for (i = 0; i < N; i++) { end.p.push([X[i], Y[i]]); end.on.push(Boolean(ON[i])); }
    return { frames: frames, steps: steps, end: end, pots: pots, potted: pots.map(function (p) { return p.b; }), first: first, hits: hits, scratch: !ON[0], angle: angle, power: power };
  }
  // A shot's speed for its power (0 to 1): curved, so the softer half of the meter has room for fine shots.
  function speedOf(power) { return VMAX * Math.pow(Math.max(0, Math.min(1, power)), 1.5); }
  function powerOf(v) { return Math.pow(Math.max(0, v) / VMAX, 1 / 1.5); }
  // The balls a player is on: their own still on the table, or the black once they're gone.
  function targets(st, who) {
    var out = [];
    for (var b = 1; b < N; b++) if (owner(b) === who && st.on[b]) out.push(b);
    return out.length ? out : [BLACK];
  }
  // What a shot means for whoever played it: win (the black, after all theirs), lose (the black any earlier, or with the
  // cue ball), foul (the cue ball went in), again (one of theirs went in) or pass.
  function judge(st, r, who) {
    var cleared = targets(st, who)[0] === BLACK, own = r.potted.filter(function (b) { return owner(b) === who; }).length;
    if (r.potted.indexOf(BLACK) >= 0) return cleared && !r.scratch ? 'win' : 'lose';
    if (r.scratch) return 'foul';
    return own ? 'again' : 'pass';
  }
  // After a foul the cue ball goes back on the head spot, or the nearest clear spot to it.
  var SPOTS = [];
  for (var sx = -L + 1; sx <= L - 1; sx += 0.25) for (var sy = -W + 1; sy <= W - 1; sy += 0.25) SPOTS.push([sx, sy]);
  SPOTS.sort(function (a, b) { return Math.hypot(a[0] + 5, a[1]) - Math.hypot(b[0] + 5, b[1]); });
  function respot(st) {
    var spot = SPOTS.filter(function (s) {
      for (var b = 1; b < N; b++) if (st.on[b] && Math.hypot(st.p[b][0] - s[0], st.p[b][1] - s[1]) < 2 * R + 0.02) return false;
      return true;
    })[0];
    st.p[0] = spot.slice();
    st.on[0] = true;
    return st;
  }

  // ======================================================================== the guide (after a right answer)
  // A bit of where the cue ball goes (the user: "make it so that in golf and in pool and in angry birds and cannon it shows a bit of where you're going, but it doesn't mark a dot on the target that shows you will hit it; just a small trail is fine"): its first TRAIL of travel, as dots, stopping before
  // anything it hits. No ghost ball, no path for the ball it hits and no ring on a pocket.
  var TRAIL = 3;
  function guide(r) {
    var F = r.frames, hit = r.hits.filter(function (h) { return h.a === 0 || h.b === 0; }), cuePot = r.pots.filter(function (p) { return p.b === 0; })[0];
    var to = Math.min(hit.length ? hit[0].i - 1 : r.steps, cuePot ? cuePot.i - 1 : r.steps), cue = [], run = -0.25, gone = 0, prev = [F[0], F[1]];
    for (var s = 1; s <= to; s++) {
      var p = [F[s * N * 2], F[s * N * 2 + 1]], d = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      if ((gone += d) > TRAIL) break;
      run += d;
      if (run >= 0.35) { cue.push(p); run = 0; }
      prev = p;
    }
    return { cue: cue };
  }

  // ======================================================================== his shots
  // Is the way from a to b clear for a ball (nothing but skip within a ball's width of the line)?
  function clearLine(st, ax, ay, bx, by, skip1, skip2) {
    var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9;
    for (var k = 0; k < N; k++) {
      if (!st.on[k] || k === skip1 || k === skip2) continue;
      var t = Math.max(0, Math.min(1, ((st.p[k][0] - ax) * dx + (st.p[k][1] - ay) * dy) / l2));
      if (Math.hypot(st.p[k][0] - ax - t * dx, st.p[k][1] - ay - t * dy) < 2 * R - 0.02) return false;
    }
    return true;
  }
  // Where to send a ball into each pocket: past the corner, or just inside it along either cushion; through the middle
  // of a middle pocket's mouth, or a little beyond.
  function mouths(k) {
    var p = POCKETS[k], sx = Math.sign(p[0]), sy = Math.sign(p[1]);
    return k === 1 || k === 4 ? [[0, p[1]], [0, p[1] + sy * 0.3]] : [[p[0] + sx * 0.2, p[1] + sy * 0.2], [p[0] - sx * 0.25, p[1] + sy * 0.1], [p[0] + sx * 0.1, p[1] - sy * 0.25]];
  }
  function mouth(k) { return mouths(k)[0]; }
  // Every straight pot on: the ghost-ball aim for each target ball through each pocket's aim points with both ways
  // clear of balls, a cut under 78 degrees, and a middle pocket come at no more than 55 degrees off straight. (Whether
  // it really drops, off a cushion or past a knuckle, the physics says.)
  function potLines(st, who) {
    var out = [], c = st.p[0];
    targets(st, who).forEach(function (b) {
      POCKETS.forEach(function (pk, k) {
        mouths(k).forEach(function (m, n) {
          var bx = st.p[b][0], by = st.p[b][1], ux = m[0] - bx, uy = m[1] - by, d = Math.hypot(ux, uy);
          ux /= d;
          uy /= d;
          var gx = bx - ux * 2 * R, gy = by - uy * 2 * R, cx = gx - c[0], cy = gy - c[1], dc = Math.hypot(cx, cy);
          if (dc < 1e-6) return;
          var cut = (cx * ux + cy * uy) / dc;
          if (cut < 0.2 || ((k === 1 || k === 4) && Math.abs(ux) > 0.82)) return;
          if (!clearLine(st, c[0], c[1], gx, gy, 0, b) || !clearLine(st, bx, by, m[0], m[1], b, -1)) return;
          out.push({ b: b, k: k, n: n, angle: Math.atan2(cy, cx), dc: dc, d: d, cut: cut });
        });
      });
    });
    return out;
  }
  // The speed a ball needs to roll d and still be going at v1 (the cloth takes ROLL + DRAG x speed off it).
  function need(v1, d) {
    var lo = v1, hi = 60;
    for (var k = 0; k < 40; k++) {
      var v0 = (lo + hi) / 2, run = (v0 - v1) / DRAG - ROLL / (DRAG * DRAG) * Math.log((ROLL + DRAG * v0) / (ROLL + DRAG * v1));
      if (run < d) lo = v0; else hi = v0;
    }
    return lo;
  }
  // Enough power for the ball to reach the pocket still rolling (the cut takes some of the cue ball's speed).
  function powerFor(c) {
    var v = need(need(1.4, c.d) / (Math.max(0.3, c.cut) * (1 + KISS) / 2), c.dc);
    return Math.max(0.1, Math.min(1, powerOf(v)));
  }
  function good(st, r, who) { var v = judge(st, r, who); return v === 'again' || v === 'win'; }
  // His best shot: the ten easiest pots (straightest, shortest), each at its power and a firmer one, tried in the
  // physics with the aim a little off either way too; the one that still drops most often wins. Null when none drops.
  function ease(c) { return c.cut * c.cut / (4 + c.d + 0.5 * c.dc); }
  function plan(st, who) {
    var best = null;
    potLines(st, who).sort(function (a, b) { return ease(b) - ease(a); }).slice(0, 10).forEach(function (c) {
      var p0 = powerFor(c);
      [p0, Math.min(1, p0 * 1.25)].forEach(function (pw) {
        var ok = [-2, -1, 0, 1, 2].map(function (da) { return good(st, shoot(st, c.angle + da * 0.0035, pw, false), who); });
        var safe = ok.filter(Boolean).length;
        if (ok[2] && (!best || safe > best.safe)) best = { angle: c.angle, power: pw, safe: safe, b: c.b, k: c.k };
      });
    });
    return best;
  }
  // No pot on: a firm shot into one of his balls that opens the table up, the one that leaves the most pots on for
  // next time, and never fouls, loses or pots one of yours.
  function safety(st, who, rand) {
    var c = st.p[0], best = null;
    targets(st, who).forEach(function (b) {
      var a0 = Math.atan2(st.p[b][1] - c[1], st.p[b][0] - c[0]);
      [-0.12, -0.05, 0, 0.05, 0.12].forEach(function (da) {
        [0.3, 0.45].forEach(function (pw) {
          var r = shoot(st, a0 + da, pw, false), v = judge(st, r, who);
          if (v === 'lose' || v === 'foul' || r.potted.some(function (k) { return owner(k) === 1 - who; })) return;
          var score = (v === 'again' || v === 'win' ? 100 : 0) + potLines(r.end, who).length + rand() * 0.5;
          if (!best || score > best.score) best = { angle: a0 + da, power: pw, score: score };
        });
      });
    });
    return best || quiet(st, who, rand);
  }
  // A shot that pots nothing (so doesn't foul either), for when nothing else is safe: off a pot line by 1.7 to 4.6
  // degrees, else anything that pots nothing, else barely a touch.
  function quiet(st, who, rand) {
    var tries = [];
    potLines(st, who).forEach(function (c) { [1, -1].forEach(function (s) { [0.03, 0.05, 0.08].forEach(function (o) { tries.push({ angle: c.angle + s * o, power: powerFor(c) }); }); }); });
    tries = shuffled(tries, rand);
    for (var a = 0; a < 72; a++) tries.push({ angle: a * Math.PI / 36 + 0.01, power: 0.2 + (a % 3) * 0.06 });
    for (var t = 0; t < tries.length; t++) {
      var r = shoot(st, tries[t].angle, tries[t].power, false);
      if (!r.potted.length) return tries[t];
    }
    return { angle: 0, power: 0 };
  }
  function shuffled(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // His shot (only after a right answer): the best pot, or an opening shot, with a small wobble (up to 0.45 degrees and
  // 6% power).
  function hisAim(st, who, rand) {
    var s = plan(st, who), g = function () { return (rand() + rand() + rand() - 1.5) / 1.5; };
    if (!s) return safety(st, who, rand);
    return { angle: s.angle + g() * 0.008, power: Math.max(0.05, Math.min(1, s.power * (1 + g() * 0.06))) };
  }
  // ======================================================================== the questions
  // As in bio-arcade.js: the table with the question layer over it, and the turn's line and buttons below.
  function show(html, close) {
    BK.body(A.card, html, true);
    A.card.querySelector('.am-finish__card').classList.add('tb-wide');
    BK.buttons(A.card, close || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(A.card);
  }
  function into(node) { if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function stage(top, field) {
    return '<div class="ar">' + top + '<div class="ar-stage" data-ar-stage><div class="ar-field">' + field + '</div><div class="ar-ask" data-ar-ask hidden></div></div>' +
      '<div class="ar-turn"><p class="tb-say tb-turn" data-ar-say aria-live="polite"></p><div class="tb-row" data-ar-row></div></div></div>';
  }
  function say(html) { var s = q('[data-ar-say]'); if (s) s.innerHTML = html; }
  function row(html) { var r = q('[data-ar-row]'); if (r) r.innerHTML = html || ''; }
  function nextItem(ch, typed) {
    var p = A.pools[ch || pick(CH)], list = typed ? p.typed : p.mc, key = typed ? 'tat' : 'at';
    if (!list.length) return typed ? nextItem(ch, false) : null;
    var item = list[p[key] % list.length];
    p[key] += 1;
    return item;
  }
  function card(ch, label, inner) {
    return '<div class="tb-card" style="--c:' + COL[ch] + '"><div class="tb-card__in"><div class="tb-card__face">' +
      '<div class="tb-card__band"><b>' + esc(NAME[ch]) + '</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div>' +
      '<div class="tb-card__body">' + inner + '</div></div></div></div>';
  }
  function answerHtml(item, mine) {
    return (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>Answer</span>' + esc(item.c.right) + '</p><p class="tb-why"><span>Why</span>' + esc(item.c.why) + '</p>';
  }
  function stamp(ok, text) { return '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + esc(text) + '</p>'; }
  function layer(html) {
    var l = q('[data-ar-ask]');
    l.innerHTML = html;
    l.hidden = false;
    q('[data-ar-stage]').classList.add('is-asking');
    into(l.querySelector('.tb-card'));
    return l;
  }
  function hideAsk() {
    var l = q('[data-ar-ask]');
    l.hidden = true;
    l.innerHTML = '';
    q('[data-ar-stage]').classList.remove('is-asking');
  }
  function bare(text) { return text.replace(/\s*\((\d+ of )?\d+ points?\)$/, ''); }
  function ask(label, typed, ch, done) {
    var item = nextItem(ch, typed);
    A.item = item;
    A.typed = Boolean(typed && item.want);
    A.done = done;
    A.phase = 'ask';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(A.typed ? item.text : bare(item.text)) + '</p>' + (A.typed
      ? '<textarea class="tb-text" data-ar-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-ar-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-ar-pass>I don\'t know</button></div>'
      : '<div class="tb-opts">' + shuffle([item.c.right].concat(item.c.wrong)).map(function (o) {
        return '<button type="button" class="tb-opt" data-ar-opt="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div>') + '<div class="qg-after" data-ar-after></div>'));
    BB.reveal(q('[data-ar-ask] .tb-card'), function () {
      var t = q('[data-ar-text]');
      if (t) t.focus({ preventScroll: true });
    });
  }
  function choose(btn) {
    var item = A.item, mine = btn.getAttribute('data-ar-opt'), ok = mine === item.c.right;
    A.card.querySelectorAll('[data-ar-opt]').forEach(function (b) {
      var o = b.getAttribute('data-ar-opt');
      b.disabled = true;
      if (o === item.c.right) b.classList.add('is-ok');
      else if (o === mine) b.classList.add('is-no');
    });
    answered(ok, ok ? '' : 'You said: ' + mine);
  }
  function check(pass) {
    var box = q('[data-ar-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    var got = text && window.BioApp ? window.BioApp.check(A.item.src, A.item.qid, A.item.k, text).filter(Boolean).length : 0, ok = got >= A.item.want;
    box.disabled = true;
    answered(ok, text ? 'You wrote: ' + (text.length > 120 ? text.slice(0, 117) + '...' : text) + (got && !ok ? ' (' + got + ' of ' + A.item.want + ' points)' : '') : '');
  }
  function answered(ok, mine) {
    A.phase = 'answered';
    A.asked += 1;
    if (ok) A.right += 1;
    var btns = q('[data-ar-check]');
    if (btns) btns.closest('.tb-row').remove();
    q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'Correct' : 'Not quite') + answerHtml(A.item, mine);
    if (ok) K.ding(A.typed ? 4 : 2, true); else K.bonk();
    A.done(ok);
  }
  function hisAsk(label, odds, ch, done) {
    var item = nextItem(ch, false), ok = Math.random() < odds;
    A.phase = 'him';
    layer(card(item.ch, label, '<p class="tb-q">' + esc(bare(item.text)) + '</p><p class="tb-say tb-think">He thinks…</p><div class="qg-after" data-ar-after></div>'));
    BB.reveal(q('[data-ar-ask] .tb-card'), function () { wait(function () {
      var t = q('.tb-think');
      if (t) t.remove();
      q('[data-ar-after]').innerHTML = stamp(ok, ok ? 'He got it' : 'He got it wrong') + answerHtml(item, '');
      K.mascot(ok ? 'happy' : 'angry', ok ? pick(['Obviously.', 'Too easy.']) : pick(['Hmph. A slip.', 'Badly worded.']));
      done(ok);
    }, 900); });
  }
  function go(label, then, auto) {
    var r = document.createElement('div');
    r.className = 'tb-row tb-row--next';
    r.innerHTML = '<button type="button" class="tb-btn tb-btn--go" data-ar-go>' + label + '</button>';
    q('[data-ar-ask] .tb-card__body').appendChild(r);
    A.then = then;
    r.querySelector('button').focus({ preventScroll: true });
    into(r);
    if (auto) wait(function () { if (A.then === then) { A.then = null; then(); } }, auto);
  }

  // ======================================================================== the 3D table (three.js only draws)
  // Flat cartoon colours like the other games: the table out on a lawn under the sky, green cloth and cushions, a wooden
  // rail with white sights, navy pockets and outlines (each shape drawn again a little bigger from inside, so only its
  // rim shows). Toon shading in three flat tones, the top of everything its exact colour; no gradients or glows.
  var TH = null, CLOTH = 0, LAWN = -3.4;
  function at(x, y, z) { return new TH.Vector3(x, z, -y); }
  function keep(o) { A.trash.push(o); return o; }
  function toon(c, map) { return keep(new TH.MeshToonMaterial({ color: map ? '#FFFFFF' : c, map: map || null, gradientMap: A.tones })); }
  function flat(c, more) {
    var m = new TH.MeshBasicMaterial({ color: c });
    Object.keys(more || {}).forEach(function (k) { m[k] = more[k]; });
    return keep(m);
  }
  function add(g, m, to) { var x = new TH.Mesh(keep(g), m); (to || A.world).add(x); return x; }
  function rim(g, to) { return add(g, A.ink, to); }
  function lying(g) { return g.rotateX(-Math.PI / 2); }
  function rrect(x0, y0, x1, y1, r) {
    var s = new TH.Shape();
    s.moveTo(x0 + r, y0);
    s.lineTo(x1 - r, y0);
    s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0);
    s.lineTo(x1, y1 - r);
    s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2);
    s.lineTo(x0 + r, y1);
    s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x0, y0 + r);
    s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5);
    return s;
  }
  function slab(s, top, depth) { return lying(new TH.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 8 })).translate(0, top - depth, 0); }
  // A box from (x0, y0) to (x1, y1) on the table, from height z0 to z1, outlined.
  function box(x0, y0, x1, y1, z0, z1, m, to) {
    var b = add(new TH.BoxGeometry(x1 - x0, z1 - z0, y1 - y0), m, to), o = rim(new TH.BoxGeometry(x1 - x0 + 0.08, z1 - z0 + 0.08, y1 - y0 + 0.08), to);
    b.position.copy(at((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
    o.position.copy(b.position);
    return b;
  }
  function setup3d(canvas) {
    TH = window.THREE;
    var r = new TH.WebGLRenderer({ canvas: canvas, antialias: true });
    r.setClearColor(SKY);
    A.r = r;
    A.trash = [];
    A.scene = new TH.Scene();
    A.tones = new TH.DataTexture(new Uint8Array([0, 140, 255]), 3, 1, TH.RedFormat);
    A.tones.minFilter = A.tones.magFilter = TH.NearestFilter;
    A.tones.needsUpdate = true;
    A.ink = new TH.MeshBasicMaterial({ color: INK, side: TH.BackSide });
    A.scene.add(new TH.AmbientLight(0xffffff, 0.45 * Math.PI));
    var sun = new TH.DirectionalLight(0xffffff, 0.55 * Math.PI);
    sun.position.set(-4, 10, 6);
    A.scene.add(sun);
    A.cam = new TH.PerspectiveCamera(45, 2, 0.1, 400);
    A.camPos = new TH.Vector3();
    A.camLook = new TH.Vector3();
    A.goalPos = new TH.Vector3();
    A.goalLook = new TH.Vector3();
    A.camSpeed = 3;
    A.ray = new TH.Raycaster();
    size();
    build();
  }
  function dispose3d() {
    if (!A || !A.r) return;
    if (A.raf) cancelAnimationFrame(A.raf);
    A.raf = 0;
    A.trash.forEach(function (o) { o.dispose(); });
    A.trash = [];
    A.tones.dispose();
    A.ink.dispose();
    A.r.dispose();
    A.r.forceContextLoss();
    A.r = null;
  }
  var RW = 1.2, CW = 0.42, CH_ = 0.42, RH = 0.52;
  function build() {
    var w = A.world = new TH.Group(), wood = toon(SOIL), wood2 = toon(SOIL2), cush = toon(GRASS_DK), i;
    A.scene.add(w);
    // The lawn, and the table's legs standing on it.
    var lawn = toon(GRASS_DK), soil = toon(SOIL), x0 = -L - RW - 5, y0 = -W - RW - 5;
    add(slab(rrect(x0, y0, -x0, -y0, 2), LAWN, 0.4), [lawn, lawn]);
    add(slab(rrect(x0, y0, -x0, -y0, 2), LAWN - 0.4, 1.4), [soil, soil]);
    rim(slab(rrect(x0 - 0.1, y0 - 0.1, -x0 + 0.1, -y0 + 0.1, 2.1), LAWN + 0.03, 1.86));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { box(s[0] * (L - 0.4) - 0.55, s[1] * (W - 0.2) - 0.55, s[0] * (L - 0.4) + 0.55, s[1] * (W - 0.2) + 0.55, LAWN, -1.1, wood2); });
    // The body under the cloth, the cloth, and the cushions along each stretch between the pockets.
    box(-L - RW, -W - RW, L + RW, W + RW, -1.15, CLOTH - 0.02, wood2);
    var felt = toon(GRASS);
    felt.polygonOffset = true;
    felt.polygonOffsetFactor = felt.polygonOffsetUnits = -1;
    add(lying(new TH.PlaneGeometry(2 * L + 2 * CW, 2 * W + 2 * CW)), felt).position.y = CLOTH;
    for (i = 0; i < RAILS.length; i += 4) {
      var ax = RAILS[i], ay = RAILS[i + 1], bx = RAILS[i + 2], by = RAILS[i + 3];
      if (ay === by) box(Math.min(ax, bx), ay > 0 ? ay : ay - CW, Math.max(ax, bx), ay > 0 ? ay + CW : ay, CLOTH, CLOTH + CH_, cush);
      else box(ax > 0 ? ax : ax - CW, Math.min(ay, by), ax > 0 ? ax + CW : ax, Math.max(ay, by), CLOTH, CLOTH + CH_, cush);
    }
    // The wooden rail round the outside, with white sights.
    box(-L - RW, W + CW, L + RW, W + RW, CLOTH, CLOTH + RH, wood);
    box(-L - RW, -W - RW, L + RW, -W - CW, CLOTH, CLOTH + RH, wood);
    box(-L - RW, -W - CW, -L - CW, W + CW, CLOTH, CLOTH + RH, wood);
    box(L + CW, -W - CW, L + RW, W + CW, CLOTH, CLOTH + RH, wood);
    var sight = flat('#FFFFFF'), sg = keep(lying(new TH.CircleGeometry(0.09, 10)));
    [-7.5, -5, -2.5, 2.5, 5, 7.5].forEach(function (x) { [1, -1].forEach(function (s) { var m = new TH.Mesh(sg, sight); m.position.copy(at(x, s * (W + (CW + RW) / 2), CLOTH + RH + 0.005)); w.add(m); }); });
    [-2.5, 0, 2.5].forEach(function (y) { [1, -1].forEach(function (s) { var m = new TH.Mesh(sg, sight); m.position.copy(at(s * (L + (CW + RW) / 2), y, CLOTH + RH + 0.005)); w.add(m); }); });
    // The pockets: navy holes through the cloth, the cushion and the rail.
    var hole = flat(INK, { polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    A.pocketAt = POCKETS.map(function (p, k) {
      var mid = k === 1 || k === 4, c = [p[0] * (mid ? 1 : 1.012), p[1] + Math.sign(p[1]) * (mid ? 0.28 : 0.1)], r = mid ? 0.66 : 0.78;
      [CLOTH + 0.004, CLOTH + CH_ + 0.004, CLOTH + RH + 0.004].forEach(function (z) { add(lying(new TH.CircleGeometry(r, 28)), hole).position.copy(at(c[0], c[1], z)); });
      return c;
    });
    // The balls: the cue ball white, yours blue, his orange with a white stripe, the black navy with its 8.
    var stripe = ballTex(function (g) { g.fillStyle = ORANGE; g.fillRect(0, 0, 128, 64); g.fillStyle = '#FFFFFF'; g.fillRect(0, 20, 128, 24); });
    var eight = ballTex(function (g) {
      g.fillStyle = INK; g.fillRect(0, 0, 128, 64);
      [32, 96].forEach(function (x) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(x, 32, 13, 15, 0, 0, 7); g.fill(); g.fillStyle = INK; g.font = '800 20px Nunito, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', x, 33); });
    });
    var mats = [toon('#FFFFFF'), toon(BLUE), toon('#FFFFFF', stripe), toon('#FFFFFF', eight)], bg = keep(new TH.SphereGeometry(R, 28, 18)), og = keep(new TH.SphereGeometry(R * 1.12, 20, 14));
    A.shade = flat(INK, { transparent: true, opacity: 0.22, depthWrite: false });
    var sh = keep(lying(new TH.CircleGeometry(R * 0.95, 20)));
    A.balls = [];
    for (i = 0; i < N; i++) {
      var g = new TH.Group(), ball = new TH.Mesh(bg, mats[i === 0 ? 0 : owner(i) === 0 ? 1 : owner(i) === 1 ? 2 : 3]);
      ball.rotation.set(i * 1.3, i * 0.7, i * 2.1);
      g.add(ball);
      g.add(new TH.Mesh(og, A.ink));
      w.add(g);
      var s = new TH.Mesh(sh, A.shade);
      s.renderOrder = 1;
      w.add(s);
      A.balls.push({ g: g, ball: ball, shadow: s, last: null });
    }
    cueStick(w);
    aimPieces(w);
    A.fx = { puffs: [], bits: [] };
    clouds(w);
  }
  function ballTex(paint) {
    var c = document.createElement('canvas');
    c.width = 128;
    c.height = 64;
    paint(c.getContext('2d'));
    var t = keep(new TH.CanvasTexture(c));
    t.colorSpace = TH.SRGBColorSpace;
    return t;
  }
  // The cue: a wooden shaft, a darker butt, a white ferrule and a navy tip, lying behind the cue ball along the aim and
  // drawn back as far as the power.
  function cueStick(w) {
    var g = new TH.Group(), tilt = new TH.Group(), len = 8.6;
    tilt.rotation.z = -0.09;
    g.add(tilt);
    w.add(g);
    function part(r0, r1, from, to, m) {
      var c = add(new TH.CylinderGeometry(r0, r1, to - from, 16).rotateZ(-Math.PI / 2), m, tilt);
      c.position.x = -(from + to) / 2;
      return c;
    }
    part(0.055, 0.06, 0, 0.12, flat(INK));
    part(0.06, 0.065, 0.12, 0.4, toon('#FFFFFF'));
    part(0.065, 0.1, 0.4, len - 2.6, toon(SOIL));
    part(0.1, 0.13, len - 2.6, len, toon(SOIL2));
    rim(new TH.CylinderGeometry(0.1, 0.17, len + 0.1, 12).rotateZ(-Math.PI / 2), tilt).position.x = -len / 2;
    g.visible = false;
    A.cue = { g: g, tilt: tilt };
  }
  function clouds(w) {
    var m = flat('#FFFFFF'), g = keep(new TH.SphereGeometry(1, 16, 10));
    [[-28, 18, 1], [24, 22, -2], [0, 34, 3], [34, -6, -4], [-34, -10, -5], [-14, -30, -9], [18, -32, -8]].forEach(function (p) {
      [[0, 0, 2.2], [2.4, 0.4, 1.7], [-2.3, 0.3, 1.6], [0.9, 1.2, 1.5]].forEach(function (s) {
        var x = new TH.Mesh(g, m);
        x.scale.set(s[2] * 1.6, s[2], s[2] * 1.2);
        x.position.copy(at(p[0] + s[0] * 1.6, p[1], p[2] + s[1]));
        w.add(x);
      });
    });
  }
  // The guide's pieces: the cue ball's dots, white with navy rims.
  function aimPieces(w) {
    var n = flat(INK), mk = function (c, r, count, order) {
      var x = new TH.InstancedMesh(keep(lying(new TH.CircleGeometry(r, 12))), c, count);
      x.count = 0;
      x.frustumCulled = false;
      x.renderOrder = order;
      w.add(x);
      return x;
    };
    var lift = { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
    A.dots = [mk(flat(INK, lift), 0.12, 120, 2), mk(flat('#FFFFFF', lift), 0.075, 120, 3)];
  }
  // The aim now: the cue behind the cue ball (drawn back with the power) and the guide (you only aim after a right
  // answer).
  function drawAim() {
    var on = A.phase === 'aim', c = A.st.p[0], pw = q('[data-pl-power]');
    A.cue.g.visible = on || A.phase === 'strike';
    A.cue.g.position.copy(at(c[0], c[1], CLOTH + R));
    A.cue.g.rotation.y = A.aim.angle;
    A.cue.tilt.position.x = on ? -(R + 0.15 + A.aim.power * 1.6) : A.cue.tilt.position.x;
    if (pw) {
      pw.hidden = !on;
      pw.querySelector('i').style.height = Math.round(A.aim.power * 100) + '%';
      pw.querySelector('b').textContent = Math.round(A.aim.power * 100) + '%';
    }
    var G = on ? guide(shoot(A.st, A.aim.angle, A.aim.power, true)) : null, mtx = new TH.Matrix4(), turn = new TH.Quaternion(), big = A.phone ? 1.5 : 1, sc = new TH.Vector3(big, 1, big);
    var pts = G ? G.cue : [];
    A.dots.forEach(function (d, j) {
      d.count = Math.min(120, pts.length);
      pts.slice(0, 120).forEach(function (p, i) { d.setMatrixAt(i, mtx.compose(at(p[0], p[1], CLOTH + 0.03 + j * 0.004), turn, sc)); });
      d.instanceMatrix.needsUpdate = true;
    });
    kick();
  }
  // The camera: over the whole table from your side (from the end on a phone, so the table runs up the screen), or
  // down behind the cue ball along the aim; it eases to where it's going.
  function tableView() {
    if (A.phone) { A.goalPos.copy(at(-14.4, 0, 15.4)); A.goalLook.copy(at(1.9, 0, -1.6)); } else { A.goalPos.copy(at(0, -16.5, 16)); A.goalLook.copy(at(0, -0.3, -1)); }
  }
  function lineView() {
    var c = A.st.p[0], ux = Math.cos(A.aim.angle), uy = Math.sin(A.aim.angle);
    A.goalPos.copy(at(c[0] - ux * 7.5, c[1] - uy * 7.5, CLOTH + 5));
    A.goalLook.copy(at(c[0] + ux * 4, c[1] + uy * 4, CLOTH));
  }
  function view() { if (A.close) lineView(); else tableView(); kick(); }
  function size() {
    if (!A || !A.r) return;
    var c = A.r.domElement, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    A.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    A.r.setSize(w, h, false);
    A.cam.aspect = w / h;
    A.phone = A.cam.aspect < 1.2;
    A.cam.fov = Math.max(34, Math.min(72, 2 * Math.atan(Math.tan(31 * Math.PI / 180) / A.cam.aspect) * 180 / Math.PI));
    A.cam.updateProjectionMatrix();
    if (A.st) view();
    kick();
  }
  // Effects, all flat: a puff of chalk off the cue, a white puff where balls knock hard, confetti when the game's won.
  function puff3(x, y, n, s) {
    for (var i = 0; i < n; i++) {
      var m = add(new TH.SphereGeometry(1, 10, 8), flat('#FFFFFF', { transparent: true, opacity: 0.85 }));
      m.position.copy(at(x + (Math.random() - 0.5) * 0.3, y + (Math.random() - 0.5) * 0.3, CLOTH + R));
      A.fx.puffs.push({ m: m, t: 0, life: 0.4 + Math.random() * 0.2, r: (s || 0.08) * (0.7 + Math.random() * 0.6) });
    }
  }
  function confetti(x, y) {
    var g = new TH.BoxGeometry(0.2, 0.05, 0.14), mats = [BLUE, '#FFFFFF', '#FFC800', ORANGE].map(function (c) { return toon(c); });
    for (var i = 0; i < 48; i++) {
      var m = new TH.Mesh(i ? g : keep(g), mats[i % 4]), a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 3;
      m.position.copy(at(x, y, CLOTH + 0.6));
      A.world.add(m);
      A.fx.bits.push({ m: m, v: new TH.Vector3(Math.cos(a) * s, 5 + Math.random() * 5, Math.sin(a) * s), spin: new TH.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), t: 0 });
    }
  }
  function stepFx(dt) {
    var F = A.fx;
    F.puffs = F.puffs.filter(function (p) {
      p.t += dt;
      var k = p.t / p.life;
      p.m.scale.setScalar(p.r * (1 + k * 2.4));
      p.m.position.y += dt * 0.4;
      p.m.material.opacity = 0.85 * (1 - k);
      if (k < 1) return true;
      A.world.remove(p.m);
      return false;
    });
    F.bits = F.bits.filter(function (b) {
      b.t += dt;
      b.v.y -= 12 * dt;
      b.m.position.addScaledVector(b.v, dt);
      b.m.rotation.x += b.spin.x * dt;
      b.m.rotation.y += b.spin.y * dt;
      b.m.rotation.z += b.spin.z * dt;
      if (b.t < 2 && b.m.position.y > LAWN) return true;
      A.world.remove(b.m);
      return false;
    });
    return F.puffs.length || F.bits.length;
  }
  function place(x, y, z) {
    var v = at(x, y, z).project(A.cam);
    return { x: (v.x + 1) * 50, y: (1 - v.y) * 50, on: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 };
  }
  function popText(x, y, text) {
    var s = place(x, y, CLOTH + 1.2), el = document.createElement('span'), sky = q('.pl-sky');
    if (!sky) return;
    el.className = 'mg-pop';
    el.textContent = text;
    el.style.left = s.x + '%';
    el.style.top = s.y + '%';
    sky.appendChild(el);
    wait(function () { el.remove(); }, 1900);
  }
  // The loop runs only while something moves (the camera, a shot, the effects) and stops when the card closes.
  function kick() {
    if (!A || !A.r || A.raf) return;
    A.last = 0;
    A.raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    A.raf = 0;
    if (!live()) { dispose3d(); return; }
    if (!A.r || !A.world) return;
    var dt = A.last ? Math.min(0.05, (now - A.last) / 1000) : 1 / 60;
    A.last = now;
    var busy = update(dt);
    render();
    if (busy) { A.raf = requestAnimationFrame(frame); A.last = now; }
  }
  function update(dt) {
    var busy = false, k;
    if (A.strike) { busy = true; stepStrike(dt); }
    if (A.shot) { busy = true; stepShot(dt); }
    k = 1 - Math.exp(-dt * A.camSpeed);
    A.camPos.lerp(A.goalPos, k);
    A.camLook.lerp(A.goalLook, k);
    if (A.camPos.distanceTo(A.goalPos) > 0.01 || A.camLook.distanceTo(A.goalLook) > 0.01) busy = true;
    if (!A.shot) placeBalls(A.st.p, A.st.on, null);
    if (stepFx(dt)) busy = true;
    if (A.shake > 0) { A.shake -= 1; busy = true; }
    return busy;
  }
  // The balls where they are, rolling (turned about the axis across their way by how far they went), and the ones
  // dropping into a pocket.
  var QT = null, AX = null;
  function placeBalls(P, on, drop) {
    QT = QT || new TH.Quaternion();
    AX = AX || new TH.Vector3();
    A.balls.forEach(function (b, i) {
      var d = drop && drop[i], x = P[i][0], y = P[i][1], z = CLOTH + R;
      if (d) { x = d[0]; y = d[1]; z += d[2]; }
      var vis = on[i] || Boolean(d && d[2] > -1.2);
      b.g.visible = vis;
      b.shadow.visible = vis && !d;
      if (!vis) { b.last = null; return; }
      if (b.last) {
        var dx = x - b.last[0], dy = y - b.last[1], m = Math.hypot(dx, dy);
        if (m > 1e-5) { AX.set(-dy / m, 0, -dx / m); QT.setFromAxisAngle(AX, m / R); b.ball.quaternion.premultiply(QT); }
      }
      b.last = [x, y];
      b.g.position.copy(at(x, y, z));
      b.shadow.position.copy(at(x, y, CLOTH + 0.012));
    });
  }
  function render() {
    var c = A.cam;
    c.position.copy(A.camPos);
    if (A.shake > 0) c.position.add(new TH.Vector3((Math.random() - 0.5) * 0.03 * A.shake, (Math.random() - 0.5) * 0.03 * A.shake, 0));
    c.lookAt(A.camLook);
    A.r.render(A.scene, c);
    // Your tag beside the cue ball, and his face: in the corner, or over the cue ball on his turn.
    var p = A.st.p[0], s = place(p[0], p[1], CLOTH + R), you = q('[data-pl-you]'), him = q('[data-pl-him]'), mine = A.who === 0;
    if (you) {
      you.hidden = !(mine && A.st.on[0] && s.on && /aim|strike/.test(A.phase));
      you.style.left = s.x + '%';
      you.style.top = s.y + '%';
    }
    if (him) {
      var follow = !mine && /him|strike|rolling/.test(A.phase) && A.st.on[0] && s.on;
      him.classList.toggle('is-follow', follow);
      him.style.left = follow ? s.x + '%' : '';
      him.style.top = follow ? place(p[0], p[1], CLOTH + R * 2 + 0.4).y + '%' : '';
    }
  }
  // A shot: the cue strikes (it slides into the ball), then the shot plays out from its recorded frames (his at 1.4x).
  function play(r, speed, done) {
    A.phase = 'strike';
    A.strike = { t: 0, r: r, speed: speed, done: done, from: A.cue.tilt.position.x };
    drawAim();
    kick();
  }
  function stepStrike(dt) {
    var s = A.strike;
    s.t = Math.min(1, s.t + dt / 0.16);
    A.cue.tilt.position.x = s.from + (-(R + 0.02) - s.from) * s.t * s.t;
    if (s.t < 1) return;
    A.strike = null;
    A.cue.g.visible = false;
    var c = A.st.p[0];
    puff3(c[0] - Math.cos(s.r.angle) * R, c[1] - Math.sin(s.r.angle) * R, 2, 0.06);
    A.phase = 'rolling';
    // A ball potted near the end still gets to drop out of sight before the shot's over.
    A.shot = { r: s.r, i: 0, speed: s.speed, done: s.done, hit: 0, pot: 0, end: s.r.steps + (s.r.pots.some(function (p) { return p.i > s.r.steps - 24; }) ? 26 : 0) };
  }
  function stepShot(dt) {
    var s = A.shot, r = s.r, F = r.frames, last = r.steps, P = [], drop = [];
    s.i = Math.min(s.end, s.i + dt * 120 * s.speed);
    var at2 = Math.min(last, s.i), k = Math.min(Math.max(0, last - 1), Math.floor(at2)), f = last ? at2 - k : 0, n = last ? k + 1 : 0, on = A.st.on.slice();
    for (var b = 0; b < N; b++) P.push([F[k * N * 2 + b * 2] + (F[n * N * 2 + b * 2] - F[k * N * 2 + b * 2]) * f, F[k * N * 2 + b * 2 + 1] + (F[n * N * 2 + b * 2 + 1] - F[k * N * 2 + b * 2 + 1]) * f]);
    // A potted ball runs on into its pocket's middle and drops out of sight.
    r.pots.forEach(function (p) {
      if (s.i < p.i - 1) return;
      on[p.b] = false;
      var t = Math.min(1, (s.i - p.i + 1) / 24), c = A.pocketAt[p.k];
      drop[p.b] = [p.x + (c[0] - p.x) * t, p.y + (c[1] - p.y) * t, -t * t * 1.4];
    });
    while (s.pot < r.pots.length && r.pots[s.pot].i <= s.i) potted(r.pots[s.pot++]);
    while (s.hit < r.hits.length && r.hits[s.hit].i <= s.i) { var e = r.hits[s.hit++]; if (e.v > 6) { puff3(e.x, e.y, 2, 0.07); A.shake = Math.max(A.shake || 0, 4); } }
    placeBalls(P, on, drop);
    if (s.i < s.end) return;
    A.shot = null;
    A.st = r.end;
    placeBalls(A.st.p, A.st.on, null);
    s.done(r);
  }
  function potted(p) {
    var c = A.pocketAt[p.k], o = owner(p.b);
    popText(c[0], c[1], p.b === 0 ? 'Foul' : p.b === BLACK ? 'The black!' : 'In!');
    if (o === A.who || (o === 2 && targets(A.before, A.who)[0] === BLACK)) K.ding(2, true); else K.bonk();
    board();
  }

  // ======================================================================== the game
  var SAY = {
    start: ['Pool? I could clear this table blindfolded.', 'Rack them up. I\'ll break your heart.'],
    right: ['Hmph. There\'s your guide.', 'Fine. Line it up.'],
    wrong: ['Wrong. No guide for you.', 'Shoot blind, then.'],
    potYou: ['Hmph. Lucky.', 'The pocket was huge.'],
    missYou: ['Not even close.', 'My turn. Watch and learn.'],
    potHim: ['In. Obviously.', 'Textbook.'],
    missHim: ['The cloth is bumpy.', 'Someone moved the pocket.']
  };
  function host() {
    AM.practice('bio-' + CH[0], 'none', function () {
      dispose3d();
      if (window.BioApp && document.getElementById('bio-app')) window.BioApp.refresh();
    });
    return K.gameCard('Pool');
  }
  function mood(m) { var f = q('[data-pl-him]'); if (f) f.setAttribute('data-mood', m); }
  function openPool() {
    if (A) dispose3d();
    var c = host(), wins = +(K.store('bio-pool-wins') || 0), best = K.store('bio-pool-best');
    A = { card: c, pools: BB.pools(), right: 0, asked: 0, qn: 0, mulligans: 0, shots: 0, trash: [] };
    K.gameHud(A.card, 0, '');
    show('<div class="am-games__end pl-start"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">Pool</h3>' +
      '<p class="am-games__sub">You\'re the blue balls, he\'s the orange stripes. You take turns, with a question before every shot. Right: you shoot, and a short trail of dots shows which way the cue ball starts. Pot one of yours and you answer again for one more shot, then it\'s his turn. Wrong: no shot, and it\'s his turn. He plays by the same rules. Clear your four, then pot the black to win; pot the black too early and you lose. Every third question is typed: get it right and you win a mulligan, a shot you can take again.</p>' +
      (wins ? '<p class="mg-best">Games won: <b class="num">' + wins + '</b>' + (best ? ' · Fastest win: <b class="num">' + best + '</b> shots' : '') + '</p>' : '') +
      '<p class="pl-pick">Questions from:</p><div class="dsi-chs pl-chs">' + CH.map(function (ch) {
        return '<button type="button" class="tb-pick" data-pl-ch="' + ch + '" style="--c:' + COL[ch] + '"><span class="tb-pick__ch">' + esc(NAME[ch]) + '</span></button>';
      }).join('') + '<button type="button" class="tb-pick" data-pl-ch="all" style="--c:#F1F7FB"><span class="tb-pick__ch">All chapters</span></button></div></div>');
    K.mascot('happy', pick(SAY.start));
  }
  function start(ch) {
    if (!window.THREE) return;
    A.ch = ch === 'all' ? null : +ch;
    A.st = rack(Math.random);
    A.who = 0;
    A.aim = { angle: 0, power: 0.75 };
    A.close = false;
    show(stage('<div class="pl-head"><p class="mg-top" data-pl-top></p><div class="pl-score" data-pl-score></div></div>',
      '<div class="pl-sky"><canvas class="pl-canvas" data-pl-canvas tabindex="0" aria-label="The table. Drag back from the cue ball and let go to shoot, or turn with the arrow keys, set the power with up and down, and press Enter."></canvas>' +
      '<div class="mg-power pl-power" data-pl-power hidden><b class="num">0%</b><span><i></i></span></div>' +
      '<span class="mg-you" data-pl-you hidden>You</span>' +
      '<span class="mg-him pl-him" data-pl-him data-mood="happy" aria-hidden="true">' + K.face + '</span></div>'));
    setup3d(q('[data-pl-canvas]'));
    tableView();
    A.camPos.copy(A.goalPos).add(new TH.Vector3(0, 6, 6));
    A.camLook.copy(A.goalLook);
    A.camSpeed = 1.6;
    placeBalls(A.st.p, A.st.on, null);
    board();
    kick();
    wait(yourTurn, 900);
  }
  function chapterName() { return A.ch ? NAME[A.ch] : 'All chapters'; }
  function top() {
    var t = q('[data-pl-top]');
    if (t) t.innerHTML = '<b>' + (A.who ? 'His turn' : 'Your turn') + '</b><span>' + esc(chapterName()) + (A.mulligans ? ' · Mulligans: ' + A.mulligans : '') + '</span>';
  }
  // Who has what left: your four, his four and the black.
  function board() {
    var b = q('[data-pl-score]'), st = A.st, before = A.shot ? A.shot.r : null;
    if (!b) return;
    function left(i) { return before ? before.pots.filter(function (p) { return p.b === i && p.i <= A.shot.i; }).length === 0 && st.on[i] : st.on[i]; }
    function side(who, name) {
      var balls = [], k;
      for (k = 1; k < N; k++) if (owner(k) === who) balls.push('<i class="pl-ball pl-ball--' + who + (left(k) ? '' : ' is-in') + '"></i>');
      var n = balls.filter(function (h) { return h.indexOf('is-in') < 0; }).length;
      return '<p class="pl-side pl-side--' + who + (A.who === who ? ' is-turn' : '') + '"><b>' + name + '</b><span class="pl-balls" aria-label="' + n + ' left">' + balls.join('') + '</span>' +
        (n ? '' : '<span class="pl-on8">On the black</span>') + '</p>';
    }
    b.innerHTML = side(0, 'You') + side(1, 'Him');
  }
  // Your turn: up to two shots, each after a right answer (a second only after potting one of yours).
  function yourTurn() { A.turnShots = 0; yourShot(); }
  function yourShot() {
    A.who = 0;
    A.qn += 1;
    var typed = A.qn % 3 === 0;
    top();
    board();
    say('<b>Your ' + (A.turnShots ? 'second shot' : 'turn') + '.</b> Answer to shoot.');
    row('');
    mood('happy');
    ask(typed ? 'Mulligan question' : A.shots ? 'Shot ' + (A.shots + 1) : 'The break', typed, A.ch, function (ok) {
      K.mascot(ok ? 'angry' : 'happy', pick(ok ? SAY.right : SAY.wrong));
      if (!ok) { go('His turn', function () { hideAsk(); say('<b>Wrong:</b> no shot.'); hisTurn(); }); return; }
      if (A.typed) { A.mulligans += 1; top(); }
      go(A.typed ? 'Aim (and a mulligan won)' : 'Aim', function () { hideAsk(); aim(); });
    });
  }
  function aim() {
    A.phase = 'aim';
    A.who = 0;
    // Start pointing at the nearest of the balls you're on.
    var c = A.st.p[0], near = targets(A.st, 0).map(function (b) { return A.st.p[b]; }).sort(function (a, b) { return Math.hypot(a[0] - c[0], a[1] - c[1]) - Math.hypot(b[0] - c[0], b[1] - c[1]); })[0];
    A.aim.angle = Math.atan2(near[1] - c[1], near[0] - c[0]);
    if (!A.shots) A.aim.power = 0.8;
    A.camSpeed = 3;
    view();
    say('<b>Right:</b> the dots show which way the cue ball starts. Drag back from the cue ball and let go.');
    row('<button type="button" class="tb-btn tb-btn--go" data-pl-shoot>Shoot</button>' +
      '<button type="button" class="tb-btn mg-btn2 pl-nudge" data-pl-turn="1" aria-label="Turn the aim left">◀</button><button type="button" class="tb-btn mg-btn2 pl-nudge" data-pl-turn="-1" aria-label="Turn the aim right">▶</button>' +
      '<button type="button" class="tb-btn mg-btn2" data-pl-view>' + (A.close ? 'Whole table' : 'Line it up') + '</button>');
    drawAim();
    q('[data-pl-canvas]').focus({ preventScroll: true });
  }
  function toggleView() {
    if (A.phase !== 'aim') return;
    A.close = !A.close;
    A.camSpeed = 2.6;
    view();
    var b = q('[data-pl-view]');
    if (b) b.textContent = A.close ? 'Whole table' : 'Line it up';
  }
  function fire() {
    if (A.phase !== 'aim' || A.aim.power < 0.02) return;
    A.prev = { st: copy(A.st) };
    A.before = copy(A.st);
    A.shots += 1;
    row('');
    say('<b>Your shot.</b>');
    play(shoot(A.st, A.aim.angle, A.aim.power, true), 1, yourResult);
  }
  function yourResult(r) {
    var v = judge(A.before, r, 0), mine = r.potted.filter(function (b) { return owner(b) === 0; }).length;
    A.phase = 'after';
    A.verdict = v;
    board();
    if (v === 'win') { finish(true, 'You potted the black.'); return; }
    if (v === 'again') {
      mood('angry');
      K.mascot('angry', pick(SAY.potYou));
      A.turnShots += 1;
      if (A.turnShots < 2) { say('<b>You potted ' + (mine === 1 ? 'one' : mine) + '.</b> Answer again for one more shot.'); wait(yourShot, 1200); }
      else { say('<b>You potted ' + (mine === 1 ? 'one' : mine) + '.</b> That\'s your two shots: his turn.'); wait(hisTurn, 1500); }
      return;
    }
    var why = A.why = v === 'lose' ? (r.scratch ? 'The black went in with the cue ball.' : 'The black went in too early.') : v === 'foul' ? '<b>Foul:</b> the cue ball went in.' : '<b>Nothing of yours went in.</b>';
    mood('happy');
    if (A.mulligans) {
      say(why + ' Use a mulligan and take that shot again?');
      row('<button type="button" class="tb-btn tb-btn--go" data-pl-retake>Take it again</button><button type="button" class="tb-btn mg-btn2" data-pl-keep>' + (v === 'lose' ? 'Lose the game' : 'His turn') + '</button>');
      return;
    }
    keepShot(v, why);
  }
  // No mulligan (or not used): the shot stands.
  function keepShot(v, why) {
    if (v === 'lose') { finish(false, why); return; }
    if (v === 'foul') A.st = respot(A.st);
    K.mascot('happy', pick(SAY.missYou));
    say(why + ' His turn.');
    row('');
    wait(hisTurn, 1100);
  }
  function retake() {
    if (A.phase !== 'after' || !A.mulligans) return;
    A.mulligans -= 1;
    A.shots -= 1;
    A.st = copy(A.prev.st);
    placeBalls(A.st.p, A.st.on, null);
    A.balls.forEach(function (b) { b.last = null; });
    board();
    top();
    aim();
  }
  // His turn: up to two shots by the same rule. His own question; right, his shot from where the cue ball lies (a second
  // only after potting one of his); wrong, no shot and it's your turn.
  function hisTurn() { A.turnShots = 0; hisGo(); }
  function hisGo() {
    A.who = 1;
    A.close = false;
    tableView();
    A.camSpeed = 2.4;
    top();
    board();
    say('<b>His ' + (A.turnShots ? 'second shot' : 'turn') + '.</b>');
    row('');
    kick();
    hisAsk('His shot', 0.65, A.ch, function (ok) {
      if (!ok) { go('Your turn', function () { hideAsk(); say('<b>He got it wrong:</b> no shot.'); mood('angry'); wait(yourTurn, 900); }, 2400); return; }
      go('Watch his shot', function () { hideAsk(); hisShot(); }, 2600);
    });
  }
  function hisShot() {
    A.phase = 'him';
    say('<b>He got it right.</b> He lines it up…');
    kick();
    wait(function () {
      var s = hisAim(A.st, 1, Math.random);
      A.before = copy(A.st);
      A.aim = { angle: s.angle, power: s.power };
      A.cue.tilt.position.x = -(R + 0.15 + s.power * 1.6);
      A.cue.g.visible = true;
      A.cue.g.position.copy(at(A.st.p[0][0], A.st.p[0][1], CLOTH + R));
      A.cue.g.rotation.y = s.angle;
      kick();
      wait(function () { play(shoot(A.st, s.angle, s.power, true), 1.4, hisResult); }, 650);
    }, 150);
  }
  function hisResult(r) {
    var v = judge(A.before, r, 1);
    board();
    if (v === 'win') { finish(false, 'He potted the black.'); return; }
    if (v === 'lose') { finish(true, r.scratch ? 'He potted the black with the cue ball.' : 'He potted the black too early.'); return; }
    if (v === 'again') {
      mood('happy');
      K.mascot('happy', pick(SAY.potHim));
      A.turnShots += 1;
      if (A.turnShots < 2) { say('<b>He potted one.</b> He answers again for one more shot.'); wait(hisGo, 1300); }
      else { say('<b>He potted one.</b> That\'s his two shots: your turn.'); wait(yourTurn, 1500); }
      return;
    }
    if (v === 'foul') { A.st = respot(A.st); say('<b>Foul:</b> his cue ball went in. Your turn.'); } else say('<b>He missed.</b> Your turn.');
    mood('angry');
    K.mascot('angry', pick(SAY.missHim));
    wait(yourTurn, 1300);
  }
  function finish(won, why) {
    var wins = +(K.store('bio-pool-wins') || 0) + (won ? 1 : 0), best = +(K.store('bio-pool-best') || 0);
    A.phase = 'over';
    K.store('bio-pool-played', String(+(K.store('bio-pool-played') || 0) + 1));
    if (won) K.store('bio-pool-wins', String(wins));
    if (won && (!best || A.shots < best)) K.store('bio-pool-best', String(A.shots));
    mood(won ? 'furious' : 'happy');
    if (won) { confetti(0, 0); kick(); }
    say(why);
    wait(function () {
      dispose3d();
      K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. The cue was warped.' : 'As expected. Again?');
      show('<div class="am-games__end"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">' + (won ? 'You win!' : 'He wins.') + '</h3>' +
        '<p class="am-games__sub">' + why + ' You took ' + A.shots + ' shot' + (A.shots === 1 ? '' : 's') + (won ? '. Games won: ' + wins + '.' : '.') + ' You got ' + A.right + ' of ' + A.asked + ' questions right.</p></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-pl-again', 'Play again']]);
      if (won) K.later(K.fanfare, 300);
    }, won ? 1900 : 1400);
  }

  // ======================================================================== aiming: drag, keys, buttons
  // Drag back from the cue ball and let go: the shot goes the other way from your finger (where it is on the cloth),
  // harder the further you pull. A tap only turns the aim; pulling back to the ball cancels.
  function pullTo(e) {
    var c = q('[data-pl-canvas]'), r = c.getBoundingClientRect(), p = A.st.p[0];
    var b = place(p[0], p[1], CLOTH + R), bx = b.x / 100 * r.width, by = b.y / 100 * r.height, px = e.clientX - r.left, py = e.clientY - r.top;
    var len = Math.hypot(px - bx, py - by);
    if (len < 6) { A.aim.power = 0; drawAim(); return; }
    A.ray.setFromCamera(new TH.Vector2(px / r.width * 2 - 1, 1 - py / r.height * 2), A.cam);
    var o = A.ray.ray.origin, d = A.ray.ray.direction, t = d.y < -1e-4 ? (CLOTH + R - o.y) / d.y : -1;
    if (t > 0) A.aim.angle = Math.atan2(p[1] + (o.z + d.z * t), p[0] - (o.x + d.x * t));
    A.aim.power = Math.max(0, Math.min(1, len / (0.42 * Math.min(r.width, r.height))));
    drawAim();
  }
  function nudge(dir, fine) { A.aim.angle += dir * (fine ? 0.0015 : 0.006); drawAim(); if (A.close) view(); }
  document.addEventListener('click', function (e) {
    if (!live() || !A.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-ar-opt]')) && A.phase === 'ask') { choose(t); return; }
    if (e.target.closest('[data-ar-check]') && A.phase === 'ask') { check(false); return; }
    if (e.target.closest('[data-ar-pass]') && A.phase === 'ask') { check(true); return; }
    if (e.target.closest('[data-ar-go]') && A.then) { var then = A.then; A.then = null; then(); return; }
    if ((t = e.target.closest('[data-pl-ch]'))) { start(t.getAttribute('data-pl-ch')); return; }
    if (e.target.closest('[data-pl-again]')) { openPool(); return; }
    if (e.target.closest('[data-pl-shoot]')) { fire(); return; }
    if ((t = e.target.closest('[data-pl-turn]')) && A.phase === 'aim') { nudge(+t.getAttribute('data-pl-turn'), e.shiftKey); return; }
    if (e.target.closest('[data-pl-view]')) { toggleView(); return; }
    if (e.target.closest('[data-pl-retake]')) { retake(); return; }
    if (e.target.closest('[data-pl-keep]') && A.phase === 'after') keepShot(A.verdict, A.why);
  });
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (!live() || A.phase !== 'aim' || !e.target.closest || !e.target.closest('[data-pl-canvas]')) return;
    drag = { x: e.clientX, y: e.clientY, moved: false };
    try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    pullTo(e);
    e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || !live() || A.phase !== 'aim') return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true;
    pullTo(e);
  });
  document.addEventListener('pointerup', function () {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (!live() || A.phase !== 'aim') return;
    if (d.moved && A.aim.power >= 0.02) fire(); else if (A.close) view();
  });
  document.addEventListener('pointercancel', function () { drag = null; });
  document.addEventListener('keydown', function (e) {
    if (!live() || !e.target.closest) return;
    if (e.key === 'Enter' && !e.shiftKey && e.target.closest('[data-ar-text]')) { e.preventDefault(); if (A.phase === 'ask') check(false); return; }
    if (A.phase !== 'aim' || !e.target.closest('[data-pl-canvas]')) return;
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); nudge(k === 'ArrowLeft' ? 1 : -1, e.shiftKey); return; }
    if (k === 'ArrowUp' || k === 'ArrowDown') A.aim.power = Math.max(0, Math.min(1, Math.round((A.aim.power + (k === 'ArrowUp' ? 0.02 : -0.02) * (e.shiftKey ? 0.25 : 1)) * 1000) / 1000));
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); fire(); return; } else return;
    e.preventDefault();
    drawAim();
  });
  window.addEventListener('resize', function () { if (live()) { BB.nearMascot(A.card); size(); } });
  window.BioPool = {
    open: openPool,
    state: function () { return A; },
    // For tools/bio/tests/pool.mjs.
    test: { rack: rack, shoot: shoot, judge: judge, respot: respot, targets: targets, guide: guide, TRAIL: TRAIL, potLines: potLines, plan: plan, quiet: quiet, safety: safety, hisAim: hisAim,
      owner: owner, copy: copy, mouth: mouth, POCKETS: POCKETS, L: L, W: W, R: R, N: N, BLACK: BLACK }
  };
})();

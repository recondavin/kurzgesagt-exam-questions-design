// Mini Golf against the examiner, in 3D (the user had asked for mini golf to wait until it could be 3D). Five holes, one
// for each chapter, each lightly themed and walled in the chapter's colour:
//   1 The airways (Breathing)          the windpipe branches in two, each bronchus bending upwards: the cup is up the
//                                      left one, alveoli bumps up the right.
//   2 The kidney (Urinary system)      a kidney-bean green: its notch bulges in between the tee and the cup (tucked in
//                                      above it), so you go round or bank off the far side.
//   3 The gut (Digestion)              three winding legs with villi bumps.
//   4 The heart (Circulation)          atrium, ventricle and artery, with valves between them that only open forwards.
//   5 The white cells (Immunity)       white cells slide across the green while a ball rolls, and knock it about; one
//                                      rests in front of the cup.
// You play each hole, then he does (quickly); fewest strokes over the five wins. Before each of your putts you answer a
// question from the hole's chapter (the trivia board's cards; every third one typed and marked like the answer sheet),
// and the answer decides the putt (the user, of Cannon Duel: the reward has to really help):
//   right        the aim line shows where the putt goes, its first bounce included, and the stroke is steady;
//   wrong        no line, and the putt wobbles off your aim (2 to 6 degrees, 3 to 12% power);
//   typed right  a mulligan as well: take one putt again, kept until you use it.
// He answers his own question before each putt (right 65 in 100). Right, he plays the best putt a search finds, with a
// small wobble; wrong, a putt that clearly misses (it never comes within a ball's width of the cup).
// The ball's physics is done here, in 2.5D, and is deterministic (tools/bio/tests/golf.mjs): the ball rolls on the
// course plane, bumps are heights, walls are segments, a valve is a wall from one side only and the cup catches a slow
// ball. three.js (bio/vendor/three.min.js, r159, MIT) only draws it.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB || !BB.pools) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours, INK = '#13294A';
  var SKY = '#CDEBFA', GRASS = '#74C043', GRASS_DK = '#4E9A2E', SOIL = '#D9A066', SOIL2 = '#BF844D', HIS = '#8FA3BD';
  var A = null;
  function live() { return A && A.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return A.card.querySelector(sel); }

  // ======================================================================== the holes
  // Course units are about 10cm: the ball's radius is 0.3 and the cup's 0.5. x runs across the hole and y down it (up
  // the map). Each hole has its outline (walled all round), bumps [x, y, radius, height], valves (a to b, opening the way
  // n points), white cells (sliding from a to b and back: [ax, ay, bx, by, radius, seconds, phase]), a tee, a cup and par.
  function bean() {
    var out = [];
    for (var i = 0; i < 44; i++) {
      var t = -Math.PI + i * Math.PI / 22;
      out.push([Math.round((5.2 * Math.cos(t) - 6.2 * Math.exp(-t * t / 0.28)) * 1000) / 1000, Math.round(9 * Math.sin(t) * 1000) / 1000]);
    }
    return out;
  }
  var HOLES = [
    { ch: 28, name: 'The airways', par: 3, tee: [0, 1], cup: [-3.3, 20],
      outline: [[-2, -0.2], [-1.2, -1], [1.2, -1], [2, -0.2], [2, 11], [6, 15], [6, 21], [5.5, 21.9], [4.25, 22.3], [3, 21.9], [2.5, 21], [2.5, 16.45], [0, 13.95],
        [-2.5, 16.45], [-2.5, 21], [-3, 21.9], [-4.25, 22.3], [-5.5, 21.9], [-6, 21], [-6, 15], [-2, 11]],
      bumps: [[4.25, 18, 0.9, 0.4], [4.25, 20.3, 0.85, 0.4]] },
    { ch: 29, name: 'The kidney', par: 3, tee: [0.4, -6.6], cup: [1.3, 5.4], outline: bean(), bumps: [[-1.8, 4.3, 0.9, 0.3]] },
    { ch: 30, name: 'The gut', par: 4, tee: [-4.6, 2.4], cup: [4.6, 15.6],
      outline: [[-6.5, 0], [5, 0], [6.5, 1.5], [6.5, 10.1], [5, 11.6], [-3, 11.6], [-3, 12.4], [6.5, 12.4], [6.5, 18], [-5, 18], [-6.5, 16.5],
        [-6.5, 7.9], [-5, 6.4], [3, 6.4], [3, 5.6], [-6.5, 5.6]],
      bumps: [[-0.5, 2.4, 0.95, 0.38], [3, 3.6, 0.8, 0.32], [1.6, 9.4, 0.9, 0.38], [-2.2, 8.4, 0.85, 0.35], [-0.6, 15.6, 0.95, 0.38], [2.2, 14, 0.75, 0.3]] },
    { ch: 31, name: 'The heart', par: 3, tee: [-3.25, 12.2], cup: [3.25, 12],
      outline: [[0, -1.2], [5.2, 1.6], [6, 3.6], [6, 7.4], [4.6, 7.4], [4.6, 8], [6, 8], [6, 13], [5, 14], [1.5, 14], [0.5, 13], [0.5, 8], [1.9, 8],
        [1.9, 7.4], [-1.9, 7.4], [-1.9, 8], [-0.5, 8], [-0.5, 13], [-1.5, 14], [-5, 14], [-6, 13], [-6, 8], [-4.6, 8], [-4.6, 7.4], [-6, 7.4],
        [-6, 3.6], [-5.2, 1.6]],
      gates: [{ a: [-4.6, 7.7], b: [-1.9, 7.7], n: [0, -1] }, { a: [1.9, 7.7], b: [4.6, 7.7], n: [0, 1] }] },
    { ch: 32, name: 'The white cells', par: 3, tee: [0, 1.6], cup: [0, 20],
      outline: [[-3.5, 0], [3.5, 0], [5, 1.5], [5, 20.5], [3.5, 22], [-3.5, 22], [-5, 20.5], [-5, 1.5]],
      cells: [[-3.4, 6.5, 3.4, 6.5, 1, 4.2, 0], [3.4, 11.5, -3.4, 11.5, 1.1, 5, 0.3], [-3.4, 15.6, 3.4, 15.6, 1, 3.6, 0.6], [0, 18.2, 0, 18.2, 0.8, 1, 0]] }
  ];
  // The walls (flat: ax, ay, bx, by for each), anticlockwise round the outline so the green is on their left, and the
  // hole's box.
  function prep(h) {
    if (h.walls) return h;
    var o = h.outline, area = 0, i, w = [], box = [Infinity, Infinity, -Infinity, -Infinity];
    for (i = 0; i < o.length; i++) area += o[i][0] * o[(i + 1) % o.length][1] - o[(i + 1) % o.length][0] * o[i][1];
    if (area < 0) o.reverse();
    for (i = 0; i < o.length; i++) {
      var p = o[i], n = o[(i + 1) % o.length];
      w.push(p[0], p[1], n[0], n[1]);
      box = [Math.min(box[0], p[0]), Math.min(box[1], p[1]), Math.max(box[2], p[0]), Math.max(box[3], p[1])];
    }
    h.walls = w;
    h.box = box;
    h.bumps = h.bumps || [];
    h.gates = h.gates || [];
    h.cells = h.cells || [];
    return h;
  }

  // ======================================================================== the physics
  var R = 0.3, CUP = 0.5, CAP = 3.8, DT = 1 / 120, ROLL = 2.4, DRAG = 0.12, GRAV = 9, BOUNCE = 0.72, MAXT = 15, RANGE = 32, MAX = 7;
  // A putt's speed for its power (0 to 1): on the flat it rolls about power x RANGE.
  function speedOf(power) { return Math.sqrt(2 * ROLL * RANGE * Math.max(0, Math.min(1, power))); }
  // The height of the green: each bump is a smooth mound (a raised cosine).
  function height(h, x, y) {
    var z = 0;
    for (var i = 0; i < h.bumps.length; i++) {
      var b = h.bumps[i], dx = x - b[0], dy = y - b[1], d2 = dx * dx + dy * dy;
      if (d2 < b[2] * b[2]) z += b[3] * (1 + Math.cos(Math.PI * Math.sqrt(d2) / b[2])) / 2;
    }
    return z;
  }
  function slope(h, x, y, out) {
    out[0] = out[1] = 0;
    for (var i = 0; i < h.bumps.length; i++) {
      var b = h.bumps[i], dx = x - b[0], dy = y - b[1], d2 = dx * dx + dy * dy;
      if (d2 >= b[2] * b[2] || d2 < 1e-12) continue;
      var d = Math.sqrt(d2), k = -b[3] * Math.PI / (2 * b[2]) * Math.sin(Math.PI * d / b[2]) / d;
      out[0] += k * dx;
      out[1] += k * dy;
    }
  }
  // Where a white cell is at time t, and how fast it's going: [x, y, vx, vy].
  function cellAt(c, t, out) {
    var w = 2 * Math.PI / c[5], a = w * t + c[6] * 2 * Math.PI, s = Math.sin(a), co = Math.cos(a), hx = (c[2] - c[0]) / 2, hy = (c[3] - c[1]) / 2;
    out[0] = (c[0] + c[2]) / 2 + hx * s;
    out[1] = (c[1] + c[3]) / 2 + hy * s;
    out[2] = hx * w * co;
    out[3] = hy * w * co;
    return out;
  }
  function inPoly(o, x, y) {
    var inside = false;
    for (var i = 0, j = o.length - 1; i < o.length; j = i++) {
      var a = o[i], b = o[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  // How far a point is from the nearest wall.
  function gap(h, x, y) {
    var W = h.walls, best = Infinity;
    for (var i = 0; i < W.length; i += 4) {
      var dx = W[i + 2] - W[i], dy = W[i + 3] - W[i + 1], t = Math.max(0, Math.min(1, ((x - W[i]) * dx + (y - W[i + 1]) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - W[i] - t * dx, y - W[i + 1] - t * dy));
    }
    return best;
  }
  // The ball while it rolls: x, y, vx, vy.
  var S = new Float64Array(4), G2 = [0, 0], C4 = [0, 0, 0, 0];
  // The ball bounces off a surface with normal n that moves at (ux, uy): its speed into it, or 0 if it was moving away.
  function push(nx, ny, ux, uy, e) {
    var vn = (S[2] - ux) * nx + (S[3] - uy) * ny;
    if (vn >= 0) return 0;
    S[2] -= (1 + e) * vn * nx;
    S[3] -= (1 + e) * vn * ny;
    // A little is lost along the surface too.
    var vt = -(S[2] - ux) * ny + (S[3] - uy) * nx;
    S[2] += 0.04 * vt * ny;
    S[3] -= 0.04 * vt * nx;
    return -vn;
  }
  // The ball against the wall from a to b: pushed back out and bounced. -1 if it isn't touching.
  function wall(ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = ((S[0] - ax) * dx + (S[1] - ay) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var qx = ax + t * dx, qy = ay + t * dy, ex = S[0] - qx, ey = S[1] - qy, d2 = ex * ex + ey * ey;
    if (d2 >= R * R) return -1;
    var d = Math.sqrt(d2), nx, ny;
    if (d > 1e-9) { nx = ex / d; ny = ey / d; } else { var l = Math.sqrt(l2); nx = -dy / l; ny = dx / l; }
    S[0] = qx + nx * R;
    S[1] = qy + ny * R;
    return push(nx, ny, 0, 0, BOUNCE);
  }
  // A valve is a wall only to a ball on its far side coming back: it opens forwards and shuts behind.
  function valve(g) {
    if ((S[0] - g.a[0]) * g.n[0] + (S[1] - g.a[1]) * g.n[1] <= 0 || S[2] * g.n[0] + S[3] * g.n[1] >= 0) return -1;
    return wall(g.a[0], g.a[1], g.b[0], g.b[1]);
  }
  // A white cell is a springy round bumper that moves.
  function cell(c, t) {
    cellAt(c, t, C4);
    var ex = S[0] - C4[0], ey = S[1] - C4[1], rr = R + c[4], d2 = ex * ex + ey * ey;
    if (d2 >= rr * rr) return -1;
    var d = Math.sqrt(d2), nx = d > 1e-9 ? ex / d : 0, ny = d > 1e-9 ? ey / d : -1;
    S[0] = C4[0] + nx * rr;
    S[1] = C4[1] + ny * rr;
    return push(nx, ny, C4[2], C4[3], 0.9);
  }
  // A putt from a point at an angle (radians; 0 is across to the right, PI/2 straight down the hole) and power (0 to 1),
  // the white cells starting from clock (seconds). Steps of 1/120s: the slope pulls the ball, the green slows it (more
  // when it's fast), then it moves (in smaller steps when it's fast, so it can't pass through a wall) and bounces off
  // whatever it touches. A slow ball over the cup drops in; a fast one rolls over, pulled a little towards the middle.
  // Nothing random, so the same putt always rolls the same way. With record, every step's place (path: x, y, ...).
  function roll(h, from, angle, power, clock, record) {
    prep(h);
    var v = speedOf(power), W = h.walls, cx = h.cup[0], cy = h.cup[1], n = Math.round(MAXT / DT), step, t = clock || 0;
    S[0] = from[0];
    S[1] = from[1];
    S[2] = Math.cos(angle) * v;
    S[3] = Math.sin(angle) * v;
    var path = record ? [S[0], S[1]] : null, hits = [], sunk = false, minCup = Math.hypot(S[0] - cx, S[1] - cy);
    for (step = 0; step < n; step++) {
      slope(h, S[0], S[1], G2);
      var ax = -GRAV * G2[0], ay = -GRAV * G2[1];
      S[2] += ax * DT;
      S[3] += ay * DT;
      var sp = Math.sqrt(S[2] * S[2] + S[3] * S[3]), fr = (ROLL + DRAG * sp) * DT;
      if (sp <= fr) {
        S[2] = S[3] = 0;
        // It stops, unless it's on a slope too steep to hold it.
        if (ax * ax + ay * ay <= ROLL * ROLL) break;
        sp = 0;
      } else {
        S[2] *= (sp - fr) / sp;
        S[3] *= (sp - fr) / sp;
        sp -= fr;
      }
      var m = Math.max(1, Math.ceil(sp * DT / 0.1)), px = S[0], py = S[1], hit = 0, kind = '', r, k, i;
      for (k = 1; k <= m; k++) {
        S[0] += S[2] * DT / m;
        S[1] += S[3] * DT / m;
        for (i = 0; i < h.cells.length; i++) if ((r = cell(h.cells[i], t + DT * k / m)) > hit) { hit = r; kind = 'cell'; }
        for (i = 0; i < h.gates.length; i++) if ((r = valve(h.gates[i])) > hit) { hit = r; kind = 'valve'; }
        // Twice round the walls, for corners.
        for (var pass = 0; pass < 2; pass++) {
          for (i = 0; i < W.length; i += 4) if ((r = wall(W[i], W[i + 1], W[i + 2], W[i + 3])) > hit) { hit = r; kind = 'wall'; }
        }
      }
      // A safety net: the ball never ends a step off the course.
      if (!inPoly(h.outline, S[0], S[1])) { S[0] = px; S[1] = py; S[2] *= -0.5; S[3] *= -0.5; hit = Math.max(hit, 0.5); kind = kind || 'wall'; }
      t += DT;
      if (hit > 0.4) hits.push({ i: step + 1, v: hit, kind: kind, x: S[0], y: S[1] });
      if (record) path.push(S[0], S[1]);
      var dx = S[0] - cx, dy = S[1] - cy, dc = Math.sqrt(dx * dx + dy * dy);
      if (dc < minCup) minCup = dc;
      if (dc < CUP + R * 0.5) {
        sp = Math.sqrt(S[2] * S[2] + S[3] * S[3]);
        if (dc < CUP && sp < CAP) { sunk = true; step += 1; break; }
        if (sp < CAP * 1.6 && dc > 1e-6) { S[2] -= dx / dc * 7 * DT; S[3] -= dy / dc * 7 * DT; }
      }
    }
    return { path: path, steps: step, end: [S[0], S[1]], sunk: sunk, hits: hits, minCup: minCup, clock: (clock || 0) + step * DT, angle: angle, power: power };
  }
  // What a right answer shows: the putt's path through its first bounce and on for up to AFTER (or to the second bounce,
  // or where it stops), a dot every 0.42, and where it stops if that's in the part shown. So a long putt that only goes
  // in off a bank still has to be judged.
  var AFTER = 3.5;
  function aimLine(r) {
    var P = r.path, first = r.hits.length ? r.hits[0].i : Infinity, upto = r.hits.length > 1 ? r.hits[1].i : r.steps, pts = [], run = -0.3, past = 0, px = P[0], py = P[1], k;
    for (k = 1; k <= upto && pts.length < 220; k++) {
      var x = P[2 * k], y = P[2 * k + 1], d = Math.hypot(x - px, y - py);
      if (k > first && (past += d) > AFTER) break;
      run += d;
      if (run >= 0.42) { pts.push([x, y]); run = 0; }
      px = x;
      py = y;
    }
    var all = k > r.steps;
    return { pts: pts, end: all ? r.end : null, sunk: r.sunk && all };
  }

  // ======================================================================== the search (his putts)
  // How far the ball still has to go round the walls to the cup, on a 0.35 grid (shortest paths from the cup; a valve
  // can only be gone through forwards). next[] points each square a step along its way.
  var GRID = 0.35;
  function cross(ax, ay, bx, by, cx, cy, dx, dy) {
    var d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (Math.abs(d) < 1e-12) return false;
    var s = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d, t = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  }
  function canStep(h, x1, y1, x2, y2) {
    var W = h.walls, i;
    for (i = 0; i < W.length; i += 4) if (cross(x1, y1, x2, y2, W[i], W[i + 1], W[i + 2], W[i + 3])) return false;
    for (i = 0; i < h.gates.length; i++) {
      var g = h.gates[i];
      if ((x2 - x1) * g.n[0] + (y2 - y1) * g.n[1] < 0 && cross(x1, y1, x2, y2, g.a[0], g.a[1], g.b[0], g.b[1])) return false;
    }
    return true;
  }
  function heapPush(hp, c, i) {
    hp.push([c, i]);
    for (var k = hp.length - 1; k;) { var p = (k - 1) >> 1; if (hp[p][0] <= hp[k][0]) break; var t = hp[p]; hp[p] = hp[k]; hp[k] = t; k = p; }
  }
  function heapPop(hp) {
    var top = hp[0], last = hp.pop();
    if (hp.length) {
      hp[0] = last;
      for (var k = 0; ;) {
        var l = 2 * k + 1, r = l + 1, m = k;
        if (l < hp.length && hp[l][0] < hp[m][0]) m = l;
        if (r < hp.length && hp[r][0] < hp[m][0]) m = r;
        if (m === k) break;
        var t = hp[m]; hp[m] = hp[k]; hp[k] = t; k = m;
      }
    }
    return top;
  }
  function paths(h) {
    if (h.paths) return h.paths;
    prep(h);
    var b = h.box, nx = Math.floor((b[2] - b[0]) / GRID) + 2, ny = Math.floor((b[3] - b[1]) / GRID) + 2, n = nx * ny, i;
    var free = new Uint8Array(n), cost = new Float64Array(n), next = new Int32Array(n), hp = [];
    function X(k) { return b[0] + (k % nx) * GRID; }
    function Y(k) { return b[1] + Math.floor(k / nx) * GRID; }
    for (i = 0; i < n; i++) {
      cost[i] = Infinity;
      next[i] = -1;
      if (inPoly(h.outline, X(i), Y(i)) && gap(h, X(i), Y(i)) > R * 0.8) free[i] = 1;
      var d = Math.hypot(X(i) - h.cup[0], Y(i) - h.cup[1]);
      if (free[i] && d < CUP + GRID) { cost[i] = d; heapPush(hp, d, i); }
    }
    while (hp.length) {
      var top = heapPop(hp), u = top[1], ux = u % nx, uy = Math.floor(u / nx);
      if (top[0] > cost[u]) continue;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          var vx = ux + dx, vy = uy + dy, v = vy * nx + vx;
          if ((!dx && !dy) || vx < 0 || vy < 0 || vx >= nx || vy >= ny || !free[v]) continue;
          var c = cost[u] + GRID * Math.sqrt(dx * dx + dy * dy);
          if (c >= cost[v] || !canStep(h, X(v), Y(v), X(u), Y(u))) continue;
          cost[v] = c;
          next[v] = u;
          heapPush(hp, c, v);
        }
      }
    }
    h.paths = { nx: nx, ny: ny, cost: cost, next: next, free: free, x0: b[0], y0: b[1] };
    return h.paths;
  }
  // The nearest grid square to a point that has a way to the cup: [index, distance to it].
  function near(h, x, y) {
    var F = paths(h), i = Math.round((x - F.x0) / GRID), j = Math.round((y - F.y0) / GRID), best = -1, bd = Infinity;
    for (var dj = -1; dj <= 1; dj++) {
      for (var di = -1; di <= 1; di++) {
        var a = i + di, c = j + dj, k = c * F.nx + a;
        if (a < 0 || c < 0 || a >= F.nx || c >= F.ny || !F.free[k] || F.cost[k] === Infinity) continue;
        var d = Math.hypot(x - F.x0 - a * GRID, y - F.y0 - c * GRID);
        if (F.cost[k] + d < bd) { bd = F.cost[k] + d; best = k; }
      }
    }
    return [best, bd];
  }
  function costAt(h, x, y) { var n = near(h, x, y); return n[0] < 0 ? 100 + Math.hypot(x - h.cup[0], y - h.cup[1]) : n[1]; }
  // A point about dist along the way to the cup (where the camera looks and your aim starts): the cup itself if it's in
  // plain sight.
  function ahead(h, p, dist) {
    if (Math.hypot(h.cup[0] - p[0], h.cup[1] - p[1]) < 12 && canStep(h, p[0], p[1], h.cup[0], h.cup[1])) return h.cup.slice();
    var F = paths(h), k = near(h, p[0], p[1])[0], x = p[0], y = p[1], left = dist;
    while (k >= 0 && left > 0) {
      var nx = F.x0 + (k % F.nx) * GRID, ny = F.y0 + Math.floor(k / F.nx) * GRID;
      left -= Math.hypot(nx - x, ny - y);
      x = nx;
      y = ny;
      k = F.next[k];
    }
    return [x, y];
  }
  // Every putt on a coarse grid (every 4 degrees, 14 powers), scored by how far it leaves the ball from the cup.
  var POWERS = [0.03, 0.05, 0.08, 0.11, 0.15, 0.2, 0.26, 0.33, 0.41, 0.5, 0.6, 0.71, 0.84, 1];
  function survey(h, from, clock) {
    var out = [];
    for (var a = 0; a < 90; a++) {
      for (var p = 0; p < POWERS.length; p++) {
        var r = roll(h, from, a * Math.PI / 45, POWERS[p], clock, false);
        out.push({ angle: a * Math.PI / 45, power: POWERS[p], sunk: r.sunk, end: r.end, minCup: r.minCup, score: r.sunk ? -1 : costAt(h, r.end[0], r.end[1]) });
      }
    }
    return out;
  }
  function byScore(a, b) { return a.score - b.score; }
  function turnOf(a) { a %= 2 * Math.PI; return a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a; }
  // The best putt: the four best of the survey, each looked at closely (7 angles by 7 powers round it); a putt that sinks
  // counts for more the more of its neighbours sink too, so a small wobble still sinks it.
  function solve(h, from, clock, all) {
    all = all || survey(h, from, clock);
    var top = all.slice().sort(byScore), seeds = [], best = null;
    for (var i = 0; i < top.length && seeds.length < 4; i++) {
      var s = top[i];
      if (seeds.every(function (o) { return Math.abs(turnOf(o.angle - s.angle)) > 0.09 || Math.abs(Math.log(o.power / s.power)) > 0.2; })) seeds.push(s);
    }
    seeds.forEach(function (s) {
      var grid = [];
      for (var da = -3; da <= 3; da++) {
        for (var dp = -3; dp <= 3; dp++) {
          var ang = s.angle + da * 0.012, pw = Math.max(0.02, Math.min(1, s.power * (1 + dp * 0.05))), r = roll(h, from, ang, pw, clock, false);
          grid.push({ angle: ang, power: pw, sunk: r.sunk, end: r.end, minCup: r.minCup, score: r.sunk ? -1 : costAt(h, r.end[0], r.end[1]), da: da, dp: dp });
        }
      }
      grid.forEach(function (g) {
        g.safe = g.sunk ? grid.filter(function (o) { return o.sunk && Math.abs(o.da - g.da) <= 1 && Math.abs(o.dp - g.dp) <= 1; }).length : 0;
        if (!best || (g.sunk !== best.sunk ? g.sunk : g.sunk ? g.safe > best.safe : g.score < best.score)) best = g;
      });
    });
    return best;
  }
  // His putt when he got his question wrong: one that clearly misses (it stops 1.6 or more from the cup and never comes
  // within a ball's width of it), among the ones that get nearest; never one that goes in.
  function missShot(h, from, clock, rand, all) {
    all = all || survey(h, from, clock);
    var cup = h.cup;
    function wide(s, d, g) { return !s.sunk && Math.hypot(s.end[0] - cup[0], s.end[1] - cup[1]) >= d && s.minCup > g; }
    var list = all.filter(function (s) { return wide(s, 1.6, CUP + R + 0.2); });
    if (!list.length) list = all.filter(function (s) { return wide(s, 1.2, CUP); });
    if (!list.length) list = all.filter(function (s) { return !s.sunk; });
    list.sort(byScore);
    return list[Math.floor(rand() * Math.min(6, list.length))];
  }
  // His putt: right, the best one with a small wobble (up to 2 degrees and 7% power); wrong, a clear miss (played
  // exactly, no wobble).
  function hisAim(h, from, clock, good, rand) {
    var all = survey(h, from, clock);
    if (!good) return missShot(h, from, clock, rand, all);
    var s = solve(h, from, clock, all), g = function () { return (rand() + rand() + rand() - 1.5) / 1.5; };
    return { angle: s.angle + g() * 0.035, power: Math.max(0.02, Math.min(1, s.power * (1 + g() * 0.07))) };
  }
  // Your putt after a wrong answer: off your aim by 2 to 6 degrees and 3 to 12% power, either way.
  function wobble(aim, rand) {
    var side = function () { return rand() < 0.5 ? -1 : 1; };
    return { angle: aim.angle + side() * (0.035 + rand() * 0.07), power: Math.max(0.02, Math.min(1, aim.power * (1 + side() * (0.03 + rand() * 0.09)))) };
  }

  // ======================================================================== the questions
  // As in bio-arcade.js: the field (here the hole) with the question layer over it, and the turn's line and buttons below.
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
  // His question: you see it, he thinks, then whether he got it (right odds of the time) and the answer either way.
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
  // The button under the card to go on; with auto, it goes on by itself after that long (his turns, so they're quick).
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

  // ======================================================================== the 3D scene (three.js only draws)
  // Flat cartoon colours like the other games: a pale sky, the course on a floating island of lawn and soil, walls in the
  // chapter's colour, navy outlines (each shape drawn again a little bigger from inside, so only its rim shows). Toon
  // shading in three flat tones (the top of everything is its exact colour); no gradients, glows or bloom.
  var TH = null;
  function at(x, y, z) { return new TH.Vector3(x, z, -y); }
  function keep(o) { A.trash.push(o); return o; }
  function toon(c) { return keep(new TH.MeshToonMaterial({ color: c, gradientMap: A.tones })); }
  function flat(c, more) {
    var m = new TH.MeshBasicMaterial({ color: c });
    Object.keys(more || {}).forEach(function (k) { m[k] = more[k]; });
    return keep(m);
  }
  function add(g, m, to) { var x = new TH.Mesh(keep(g), m); (to || A.world).add(x); return x; }
  function rim(g, to) { return add(g, A.ink, to); }
  function lying(g) { return g.rotateX(-Math.PI / 2); }
  function shape(pts) { return new TH.Shape(pts.map(function (p) { return new TH.Vector2(p[0], p[1]); })); }
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
  function slab(s, top, depth) {
    var g = new TH.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 8 });
    return lying(g).translate(0, top - depth, 0);
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
    // Lit so the top of everything shows its exact colour: ambient + sun add up to 1 (three.js's lights are x PI).
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
  // A hole: the island, the green, its walls (each a box along its edge, out from the green, mitred at outside
  // corners), the bumps, the cup and flag, the tee, the valves, the white cells, the balls, and the aim's pieces.
  function build(h) {
    if (A.world) A.scene.remove(A.world);
    A.trash.forEach(function (o) { o.dispose(); });
    A.trash = [];
    var w = A.world = new TH.Group(), col = COL[h.ch], b = h.box, M = 1.7, x0 = b[0] - M, y0 = b[1] - M, x1 = b[2] + M, y1 = b[3] + M, i;
    A.scene.add(w);
    var lawn = toon(GRASS_DK), soil = toon(SOIL), soil2 = toon(SOIL2);
    add(slab(rrect(x0, y0, x1, y1, 1.2), -0.04, 0.34), [lawn, lawn]);
    add(slab(rrect(x0, y0, x1, y1, 1.2), -0.38, 1.1), [soil, soil]);
    rim(slab(rrect(x0 - 0.08, y0 - 0.08, x1 + 0.08, y1 + 0.08, 1.28), 0.0, 1.52));
    add(slab(rrect(x0 + 0.5, y0 + 0.5, x1 - 0.5, y1 - 0.5, 0.9), -1.48, 0.7), [soil2, soil2]);
    rim(slab(rrect(x0 + 0.42, y0 + 0.42, x1 - 0.42, y1 - 0.42, 0.98), -1.44, 0.82));
    tufts(h, x0, y0, x1, y1);
    // The green, a little above the lawn.
    var felt = toon(GRASS);
    felt.polygonOffset = true;
    felt.polygonOffsetFactor = felt.polygonOffsetUnits = -1;
    add(lying(new TH.ShapeGeometry(shape(h.outline), 2)), felt);
    walls(h, toon(col));
    // The bumps: mounds of the darker green with a navy rim, so they show on the green.
    var mound = toon(GRASS_DK), edge = flat(INK, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    h.bumps.forEach(function (bp) {
      var pts = [];
      for (var k = 0; k <= 14; k++) { var d = bp[2] * (1 - k / 14); pts.push(new TH.Vector2(d, bp[3] * (1 + Math.cos(Math.PI * d / bp[2])) / 2)); }
      add(new TH.LatheGeometry(pts, 28), mound).position.copy(at(bp[0], bp[1], 0));
      add(lying(new TH.RingGeometry(bp[2] - 0.02, bp[2] + 0.06, 32)), edge).position.copy(at(bp[0], bp[1], 0.004));
    });
    // The tee mat and the cup, with its flag (the hole's number) turned to face the camera.
    var tee = add(lying(new TH.ShapeGeometry(rrect(-0.8, -0.55, 0.8, 0.55, 0.3))), flat(GRASS_DK, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    tee.position.copy(at(h.tee[0], h.tee[1], 0.003));
    var ink = flat(INK, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    add(lying(new TH.CircleGeometry(CUP, 32)), ink).position.copy(at(h.cup[0], h.cup[1], 0.004));
    flag(h, col);
    // The valves: two flaps each, hinged at the valve's ends.
    A.valves = h.gates.map(function (g) {
      var len = Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]), L = len / 2 - 0.04, ux = (g.b[0] - g.a[0]) / len, uy = (g.b[1] - g.a[1]) / len, m = toon(col);
      return { g: g, len: len, open: 0, flaps: [[g.a, ux, uy], [g.b, -ux, -uy]].map(function (f) {
        var piv = new TH.Group();
        piv.position.copy(at(f[0][0], f[0][1], 0));
        w.add(piv);
        add(new TH.BoxGeometry(L, 0.38, 0.12), m, piv).position.set(L / 2, 0.15, 0);
        rim(new TH.BoxGeometry(L + 0.06, 0.44, 0.19), piv).position.set(L / 2, 0.15, 0);
        return { piv: piv, u: [f[1], f[2]] };
      }) };
    });
    // White cells: a squashed white ball with a nucleus of three lobes in the chapter's colour.
    var white = toon('#FFFFFF'), lobe = toon(col);
    A.cells = h.cells.map(function (c) {
      var g = new TH.Group(), r = c[4];
      w.add(g);
      var body = add(new TH.SphereGeometry(r, 28, 16), white, g);
      body.scale.set(1, 0.62, 1);
      body.position.y = r * 0.5;
      var o = rim(new TH.SphereGeometry(r + 0.07, 28, 16), g);
      o.scale.copy(body.scale);
      o.position.copy(body.position);
      [[-0.32, 0.12], [0.04, -0.26], [0.32, 0.14]].forEach(function (p) { add(new TH.SphereGeometry(r * 0.26, 14, 10), lobe, g).position.set(p[0] * r, r * 0.86, p[1] * r); });
      shadow(r * 0.95, g);
      return g;
    });
    // The balls: yours white, his grey.
    A.balls = ['#FFFFFF', HIS].map(function (c) {
      var g = new TH.Group();
      w.add(g);
      add(new TH.SphereGeometry(R, 24, 16), toon(c), g);
      rim(new TH.SphereGeometry(R * 1.14, 24, 16), g);
      g.visible = false;
      return g;
    });
    A.ballShadow = shadow(R * 0.95, w);
    aimPieces(w);
    A.fx = { puffs: [], bits: [] };
    clouds(h, w);
  }
  function shadow(r, to) {
    var s = add(lying(new TH.CircleGeometry(r, 24)), A.shade || (A.shade = flat(INK, { transparent: true, opacity: 0.2, depthWrite: false })), to);
    s.position.y = 0.012;
    s.renderOrder = 1;
    return s;
  }
  function walls(h, m) {
    var W = h.walls, n = W.length / 4, T = 0.4, WH = 0.5, ext = [], i;
    function dir(k) { var dx = W[k * 4 + 2] - W[k * 4], dy = W[k * 4 + 3] - W[k * 4 + 1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; }
    // How far each wall carries on past a corner: an outside corner is mitred so the two walls meet; an inside one
    // isn't (carrying on would poke into the green).
    for (i = 0; i < n; i++) {
      var u1 = dir((i + n - 1) % n), u2 = dir(i), th = Math.atan2(u1[0] * u2[1] - u1[1] * u2[0], u1[0] * u2[0] + u1[1] * u2[1]);
      ext[i] = th > 0 ? Math.min(2 * T, T * Math.tan(th / 2)) : 0;
    }
    for (i = 0; i < n; i++) {
      var ax = W[i * 4], ay = W[i * 4 + 1], bx = W[i * 4 + 2], by = W[i * 4 + 3], len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
      var e1 = ext[i], e2 = ext[(i + 1) % n], L = len + e1 + e2, mx = (ax + bx) / 2 + ux * (e2 - e1) / 2 + uy * T / 2, my = (ay + by) / 2 + uy * (e2 - e1) / 2 - ux * T / 2;
      var box = add(new TH.BoxGeometry(L, WH, T), m), o = rim(new TH.BoxGeometry(L, WH + 0.08, T + 0.08));
      box.position.copy(at(mx, my, WH / 2 - 0.04));
      o.position.copy(box.position);
      box.rotation.y = o.rotation.y = Math.atan2(uy, ux);
    }
  }
  // The flag: a white pole and the hole's number on the chapter's colour (drawn on a little canvas).
  function flag(h, col) {
    var c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = 128;
    c.height = 84;
    g.fillStyle = col;
    g.fillRect(0, 0, 128, 84);
    g.lineWidth = 10;
    g.strokeStyle = INK;
    g.strokeRect(5, 5, 118, 74);
    g.fillStyle = '#FFFFFF';
    g.font = '800 54px Nunito, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(HOLES.indexOf(h) + 1), 64, 46);
    var tex = keep(new TH.CanvasTexture(c));
    tex.colorSpace = TH.SRGBColorSpace;
    var pole = new TH.Group();
    pole.position.copy(at(h.cup[0], h.cup[1], 0));
    A.world.add(pole);
    add(new TH.CylinderGeometry(0.05, 0.05, 2.6, 10), toon('#FFFFFF'), pole).position.y = 1.3;
    rim(new TH.CylinderGeometry(0.095, 0.095, 2.68, 10), pole).position.y = 1.3;
    add(new TH.PlaneGeometry(1.15, 0.75), flat('#FFFFFF', { map: tex, side: TH.DoubleSide }), pole).position.set(0.6, 2.2, 0);
    A.flag = pole;
  }
  // Grass tufts dotted on the lawn round the course.
  function tufts(h, x0, y0, x1, y1) {
    var m = toon(GRASS), g = new TH.ConeGeometry(0.07, 0.34, 5), s = 7;
    keep(g);
    for (var i = 0; i < 46; i++) {
      s = (s * 16807) % 2147483647;
      var x = x0 + 0.4 + (s % 1000) / 1000 * (x1 - x0 - 0.8);
      s = (s * 16807) % 2147483647;
      var y = y0 + 0.4 + (s % 1000) / 1000 * (y1 - y0 - 0.8);
      if (inPoly(h.outline, x, y) || gap(h, x, y) < 0.8) continue;
      [-0.1, 0, 0.1].forEach(function (d, k) {
        var t = new TH.Mesh(g, m);
        t.position.copy(at(x + d, y + (k === 1 ? 0.05 : 0), 0.12));
        t.rotation.z = d * 2.4;
        A.world.add(t);
      });
    }
  }
  // White clouds round the island, below and level with it.
  function clouds(h, w) {
    var m = flat('#FFFFFF'), g = keep(new TH.SphereGeometry(1, 16, 10)), b = h.box, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    [[-24, 6, -3], [22, 14, -5], [-18, 36, -1], [26, 40, -2], [0, 52, -6], [-30, 24, -9], [30, 0, -8]].forEach(function (p) {
      [[0, 0, 2.2], [2.4, 0.4, 1.7], [-2.3, 0.3, 1.6], [0.9, 1.2, 1.5]].forEach(function (s) {
        var x = new TH.Mesh(g, m);
        x.scale.set(s[2] * 1.6, s[2], s[2] * 1.2);
        x.position.copy(at(cx + p[0] + s[0] * 1.6, cy + p[1], p[2] + s[1]));
        w.add(x);
      });
    });
  }
  // The aim: a yellow arrow out of the ball as long as the power, with a navy rim; the line's dots (white with navy
  // rims, like Cannon Duel's); and where the putt stops (orange if it goes in).
  function aimPieces(w) {
    var y = flat('#FFC800'), n = flat(INK), d = flat('#FFFFFF');
    var g = new TH.Group();
    w.add(g);
    var shaftIn = add(lying(new TH.PlaneGeometry(1, 0.2)), y, g), shaftOut = add(lying(new TH.PlaneGeometry(1, 0.36)), n, g);
    var head = add(lying(new TH.ShapeGeometry(shape([[0, -0.32], [0.55, 0], [0, 0.32]]))), y, g), headOut = add(lying(new TH.ShapeGeometry(shape([[-0.08, -0.46], [0.75, 0], [-0.08, 0.46]]))), n, g);
    shaftIn.position.y = head.position.y = 0.02;
    g.visible = false;
    A.arrow = { g: g, parts: [shaftIn, shaftOut, head, headOut] };
    A.dots = [n, d].map(function (m, k) {
      var x = new TH.InstancedMesh(keep(lying(new TH.CircleGeometry(k ? 0.085 : 0.13, 12))), m, 220);
      x.count = 0;
      x.renderOrder = 2 + k;
      x.frustumCulled = false;
      w.add(x);
      return x;
    });
    A.mark = new TH.Group();
    w.add(A.mark);
    add(lying(new TH.CircleGeometry(0.34, 24)), n, A.mark);
    A.markIn = add(lying(new TH.CircleGeometry(0.24, 24)), flat('#FFFFFF'), A.mark);
    A.markIn.position.y = 0.01;
    A.mark.visible = false;
  }
  // The aim's pieces for the aim now: the arrow always, the line only after a right answer.
  function drawAim() {
    var h = A.h, p = A.ball, z = height(h, p[0], p[1]);
    var on = A.phase === 'aim', L = 0.3 + A.aim.power * 3.2, pw = q('[data-mg-power]');
    A.arrow.g.visible = on;
    // On a phone the picture is smaller, so the aim's pieces are bigger.
    var big = A.phone ? 1.6 : 1, sc = new TH.Vector3(big, 1, big), turn = new TH.Quaternion();
    if (on) {
      A.arrow.g.position.copy(at(p[0], p[1], z + 0.03));
      A.arrow.g.rotation.y = A.aim.angle;
      A.arrow.g.scale.set(1, 1, A.phone ? 1.4 : 1);
      var P = A.arrow.parts;
      P[0].scale.x = P[1].scale.x = L;
      P[0].position.x = P[1].position.x = 0.45 + L / 2;
      P[2].position.x = 0.45 + L;
      P[3].position.x = 0.45 + L;
    }
    if (pw) {
      pw.hidden = !on;
      pw.querySelector('i').style.height = Math.round(A.aim.power * 100) + '%';
      pw.querySelector('b').textContent = Math.round(A.aim.power * 100) + '%';
    }
    var line = on && A.guide ? aimLine(roll(h, p, A.aim.angle, A.aim.power, A.clock, true)) : null, mtx = new TH.Matrix4();
    A.dots.forEach(function (d, k) {
      d.count = line ? line.pts.length : 0;
      if (line) line.pts.forEach(function (pt, i) { d.setMatrixAt(i, mtx.compose(at(pt[0], pt[1], height(h, pt[0], pt[1]) + 0.02 + k * 0.004), turn, sc)); });
      d.instanceMatrix.needsUpdate = true;
    });
    A.mark.visible = Boolean(line && line.end);
    if (A.mark.visible) {
      A.mark.position.copy(at(line.end[0], line.end[1], height(h, line.end[0], line.end[1]) + 0.028));
      A.mark.scale.copy(sc);
      A.markIn.material.color.set(line.sunk ? '#FF9600' : '#FFFFFF');
    }
    kick();
  }
  // The camera: behind the ball looking along yaw (3/4 down), or over the whole hole; it eases to where it's going. On a
  // phone it comes closer and looks down more (its picture is taller and narrower).
  function behind(p, yaw) {
    var z = height(A.h, p[0], p[1]) + R, back = A.phone ? 6.2 : 8.4, up = A.phone ? 5.9 : 5.6, on = A.phone ? 3 : 4.4;
    A.goalPos.copy(at(p[0] - yaw[0] * back, p[1] - yaw[1] * back, z + up));
    A.goalLook.copy(at(p[0] + yaw[0] * on, p[1] + yaw[1] * on, z));
  }
  function overview(h) {
    var b = h.box, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, s = Math.max(b[2] - b[0], b[3] - b[1]) * (A.phone ? 1.15 : 1.35);
    A.goalPos.copy(at(cx, b[1] - s * 0.42, s * 0.95));
    A.goalLook.copy(at(cx, cy + s * 0.04, 0));
  }
  function size() {
    if (!A || !A.r) return;
    var c = A.r.domElement, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    A.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    A.r.setSize(w, h, false);
    A.cam.aspect = w / h;
    A.phone = A.cam.aspect < 1.2;
    // The same width of view on a phone as on a computer: a taller picture sees more above and below.
    A.cam.fov = Math.max(34, Math.min(72, 2 * Math.atan(Math.tan(31 * Math.PI / 180) / A.cam.aspect) * 180 / Math.PI));
    A.cam.updateProjectionMatrix();
    kick();
  }
  // Effects, all flat: white dust puffs where the ball hits a wall hard (and a shake for a very hard one), and confetti
  // in the chapter's colours when it drops.
  function puff3(x, y, n) {
    for (var i = 0; i < n; i++) {
      var m = add(new TH.SphereGeometry(1, 10, 8), flat('#FFFFFF', { transparent: true, opacity: 0.85 }));
      m.position.copy(at(x + (Math.random() - 0.5) * 0.5, y + (Math.random() - 0.5) * 0.5, 0.25));
      A.fx.puffs.push({ m: m, t: 0, life: 0.45 + Math.random() * 0.25, r: 0.08 + Math.random() * 0.08 });
    }
  }
  function confetti(x, y) {
    var g = new TH.BoxGeometry(0.16, 0.04, 0.11), mats = [COL[A.h.ch], '#FFFFFF', '#FFC800', COL[CH[(CH.indexOf(A.h.ch) + 2) % 5]]].map(toon);
    for (var i = 0; i < 36; i++) {
      var m = new TH.Mesh(i ? g : keep(g), mats[i % 4]), a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2.5;
      m.position.copy(at(x, y, 0.3));
      A.world.add(m);
      A.fx.bits.push({ m: m, v: new TH.Vector3(Math.cos(a) * s, 4 + Math.random() * 4, Math.sin(a) * s), spin: new TH.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), t: 0 });
    }
  }
  function stepFx(dt) {
    var F = A.fx;
    F.puffs = F.puffs.filter(function (p) {
      p.t += dt;
      var k = p.t / p.life;
      p.m.scale.setScalar(p.r * (1 + k * 2.2));
      p.m.position.y += dt * 0.5;
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
      if (b.t < 1.8 && b.m.position.y > -3) return true;
      A.world.remove(b.m);
      return false;
    });
    return F.puffs.length || F.bits.length;
  }
  // Floating words over the field (Birdie!, Par), HTML like the other games' numbers.
  function popText(x, y, text) {
    var s = place(x, y, height(A.h, x, y) + 1.2), el = document.createElement('span'), sky = q('.mg-sky');
    if (!sky) return;
    el.className = 'mg-pop';
    el.textContent = text;
    el.style.left = s.x + '%';
    el.style.top = s.y + '%';
    sky.appendChild(el);
    wait(function () { el.remove(); }, 1900);
  }
  // Where a point is on the canvas, in %.
  function place(x, y, z) {
    var v = at(x, y, z).project(A.cam);
    return { x: (v.x + 1) * 50, y: (1 - v.y) * 50, on: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 };
  }
  // The loop runs only while something moves (the camera, a putt, the effects) and stops when the card closes.
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
    var busy = false, h = A.h, k;
    if (A.shot) { busy = true; stepShot(dt); }
    if (A.sink) { busy = true; stepSink(dt); }
    k = 1 - Math.exp(-dt * A.camSpeed);
    A.camPos.lerp(A.goalPos, k);
    A.camLook.lerp(A.goalLook, k);
    if (A.camPos.distanceTo(A.goalPos) > 0.01 || A.camLook.distanceTo(A.goalLook) > 0.01) busy = true;
    // The ball, with its shadow.
    var p = A.ball, bz = height(h, p[0], p[1]);
    A.balls.forEach(function (b, i) { b.visible = i === A.who && A.ballOn; });
    A.balls[A.who].position.copy(at(p[0], p[1], bz + R + (A.drop || 0)));
    A.ballShadow.visible = A.ballOn && !A.drop;
    A.ballShadow.position.copy(at(p[0], p[1], bz + 0.012));
    // White cells where the clock says.
    h.cells.forEach(function (c, i) { cellAt(c, A.clock, C4); A.cells[i].position.copy(at(C4[0], C4[1], 0)); });
    // Valves open as the ball comes through forwards and shut behind it.
    A.valves.forEach(function (v) {
      var g = v.g, side = (p[0] - g.a[0]) * g.n[0] + (p[1] - g.a[1]) * g.n[1], mx = (g.a[0] + g.b[0]) / 2, my = (g.a[1] + g.b[1]) / 2;
      var vn = A.shot ? A.shot.vx * g.n[0] + A.shot.vy * g.n[1] : 0, by = Math.hypot(p[0] - mx, p[1] - my) < v.len / 2 + 0.8;
      var want = by && ((side > -1 && side < 0.2 && vn > 0.3) || (side >= 0.2 && side < R + 0.6 && A.shot)) ? 1 : 0;
      v.open += (want - v.open) * Math.min(1, dt * 14);
      if (Math.abs(want - v.open) > 0.01) busy = true;
      var th = v.open * 1.25;
      v.flaps.forEach(function (f) { f.piv.rotation.y = Math.atan2(f.u[1] * Math.cos(th) + g.n[1] * Math.sin(th), f.u[0] * Math.cos(th) + g.n[0] * Math.sin(th)); });
    });
    if (stepFx(dt)) busy = true;
    if (A.shake > 0) { A.shake -= 1; busy = true; }
    return busy;
  }
  function render() {
    var c = A.cam;
    c.position.copy(A.camPos);
    if (A.shake > 0) c.position.add(new TH.Vector3((Math.random() - 0.5) * 0.02 * A.shake, (Math.random() - 0.5) * 0.02 * A.shake, 0));
    c.lookAt(A.camLook);
    if (A.flag) A.flag.rotation.y = Math.atan2(c.position.x - A.flag.position.x, c.position.z - A.flag.position.z);
    A.r.render(A.scene, c);
    // Your tag over your ball, and his face: in the corner, or over his ball on his turn.
    var p = A.ball, z = height(A.h, p[0], p[1]), s = place(p[0], p[1], z + R * 2 + 0.25), b = place(p[0], p[1], z + R), you = q('[data-mg-you]'), him = q('[data-mg-him]');
    if (you) {
      you.hidden = !(A.who === 0 && A.ballOn && b.on && /aim|rolling|after/.test(A.phase));
      you.style.left = b.x + '%';
      you.style.top = b.y + '%';
    }
    if (him) {
      var follow = A.who === 1 && A.ballOn && s.on;
      him.classList.toggle('is-follow', follow);
      him.style.left = follow ? s.x + '%' : '';
      him.style.top = follow ? s.y + '%' : '';
    }
  }
  // A putt playing out from its recorded path (yours as it happens, his at 1.6x), the camera following.
  function play(r, speed, done) {
    A.shot = { r: r, i: 0, speed: speed, done: done, hit: 0, clock0: A.clock, vx: 0, vy: 0 };
    A.phase = 'rolling';
    A.camSpeed = 3.2;
    drawAim();
    puff3(A.ball[0], A.ball[1], 2);
    kick();
  }
  function stepShot(dt) {
    var s = A.shot, r = s.r, P = r.path, last = r.steps;
    s.i = Math.min(last, s.i + dt * 120 * s.speed);
    var k = Math.min(Math.max(0, last - 1), Math.floor(s.i)), f = last ? s.i - k : 0, n = last ? k + 1 : 0;
    A.ball = [P[2 * k] + (P[2 * n] - P[2 * k]) * f, P[2 * k + 1] + (P[2 * n + 1] - P[2 * k + 1]) * f];
    s.vx = (P[2 * n] - P[2 * k]) * 120;
    s.vy = (P[2 * n + 1] - P[2 * k + 1]) * 120;
    A.clock = s.clock0 + s.i * DT;
    while (s.hit < r.hits.length && r.hits[s.hit].i <= s.i) {
      var e = r.hits[s.hit++];
      if (e.v > 2.5) puff3(e.x, e.y, e.v > 6 ? 3 : 1);
      if (e.v > 7) A.shake = 9;
    }
    if (!A.over) behind(A.ball, A.yaw);
    if (s.i < last) return;
    A.shot = null;
    A.clock = r.clock;
    A.ball = r.end.slice();
    if (r.sunk) A.sink = { t: 0, from: A.ball.slice(), done: s.done, r: r };
    else s.done(r);
  }
  // A ball that drops: it runs to the middle of the cup and down out of sight, and the confetti flies.
  function stepSink(dt) {
    var s = A.sink, c = A.h.cup;
    s.t = Math.min(1, s.t + dt / 0.35);
    A.ball = [s.from[0] + (c[0] - s.from[0]) * s.t, s.from[1] + (c[1] - s.from[1]) * s.t];
    A.drop = -s.t * s.t * 0.75;
    if (s.t < 1) return;
    A.sink = null;
    A.ballOn = false;
    A.drop = 0;
    confetti(c[0], c[1]);
    s.done(s.r);
  }

  // ======================================================================== the game
  var SAY = {
    start: ['Mini golf? I was club champion.', 'Five holes. I\'ve never missed a putt.'],
    right: ['Hmph. Line it up, then.', 'Fine. You get the line.'],
    wrong: ['Wrong. Good luck with that putt.', 'No line for you.'],
    in: ['Hmph. Lucky bounce.', 'In. Don\'t celebrate.'],
    out: ['Ha. Not even close.', 'The cup is over there.'],
    hisIn: ['In. Obviously.', 'And that is how it\'s done.'],
    hisOut: ['The green is bumpy.', 'That cup moved.']
  };
  function host() {
    AM.practice('bio-' + CH[0], 'none', function () {
      dispose3d();
      if (window.BioApp && document.getElementById('bio-app')) window.BioApp.refresh();
    });
    return K.gameCard('Mini Golf');
  }
  function mood(m) { var f = q('[data-mg-him]'); if (f) f.setAttribute('data-mood', m); }
  function total(p) { return A.strokes[p].reduce(function (a, b) { return a + b; }, 0); }
  function parAll() { return HOLES.reduce(function (a, h) { return a + h.par; }, 0); }
  function openGolf() {
    if (A) dispose3d();
    var c = host();
    A = { card: c, pools: BB.pools(), right: 0, asked: 0, qn: 0, mulligans: 0, strokes: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], holed: [[], []], hole: 0, trash: [] };
    K.gameHud(A.card, 0, '');
    var best = K.store('bio-golf-best');
    show('<div class="am-games__end mg-start"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">Mini Golf</h3>' +
      '<p class="am-games__sub">Five holes against the examiner, one for each chapter. Before every putt you answer a question. Right: a line shows where your putt will go, first bounce included, and your stroke is steady. Wrong: no line, and your putt wobbles. Every third question is typed: get it right and you win a mulligan, a putt you can take again. Fewest strokes wins.</p>' +
      '<ol class="mg-holes">' + HOLES.map(function (h, i) {
        var b = K.store('bio-golf-hole-' + (i + 1));
        return '<li style="--c:' + COL[h.ch] + '"><b>' + (i + 1) + '. ' + esc(h.name) + '</b><span>' + esc(NAME[h.ch]) + ' · Par ' + h.par + (b ? ' · Best ' + b : '') + '</span></li>';
      }).join('') + '</ol>' + (best ? '<p class="mg-best">Your best round: <b class="num">' + best + '</b> (par ' + parAll() + ')</p>' : '') + '</div>',
    [['more', 'data-am-keep', 'Close'], ['ok', 'data-mg-go', 'Tee off']]);
    K.mascot('happy', pick(SAY.start));
  }
  function teeOff() {
    if (!window.THREE) return;
    show(stage('<div class="mg-head"><p class="mg-top" data-mg-top></p><div class="mg-board" data-mg-score></div></div>',
      '<div class="mg-sky"><canvas class="mg-canvas" data-mg-canvas tabindex="0" aria-label="The hole. Drag back from the ball and let go to putt, or turn with the arrow keys, set the power with up and down, and press Enter."></canvas>' +
      '<div class="mg-power" data-mg-power hidden><b class="num">0%</b><span><i></i></span></div>' +
      '<span class="mg-you" data-mg-you hidden>You</span>' +
      '<span class="mg-him" data-mg-him data-mood="happy" aria-hidden="true">' + K.face + '</span></div>'));
    setup3d(q('[data-mg-canvas]'));
    holeStart(0);
  }
  function holeStart(i) {
    A.hole = i;
    A.h = prep(HOLES[i]);
    A.clock = 0;
    A.who = 0;
    A.ball = A.h.tee.slice();
    A.ballOn = true;
    A.drop = 0;
    A.aim = { angle: Math.PI / 2, power: 0.35 };
    A.over = false;
    build(A.h);
    size();
    // The camera starts over the whole hole and comes down behind the ball.
    overview(A.h);
    A.camPos.copy(A.goalPos);
    A.camLook.copy(A.goalLook);
    A.yaw = yawFrom(A.ball);
    behind(A.ball, A.yaw);
    A.camSpeed = 1.4;
    A.phase = 'intro';
    top();
    board();
    say('<b>Hole ' + (i + 1) + ': ' + esc(A.h.name) + '.</b> Par ' + A.h.par + '.');
    row('');
    mood('happy');
    kick();
    wait(yourShot, 1700);
  }
  function yawFrom(p) {
    var t = ahead(A.h, p, 5), dx = t[0] - p[0], dy = t[1] - p[1], l = Math.hypot(dx, dy);
    return l > 0.01 ? [dx / l, dy / l] : [0, 1];
  }
  function top() {
    var t = q('[data-mg-top]');
    if (t) t.innerHTML = '<b>Hole ' + (A.hole + 1) + ' of 5: ' + esc(A.h.name) + '</b><span>' + esc(NAME[A.h.ch]) + ' · Par ' + A.h.par +
      (A.who ? ' · His stroke ' + (A.strokes[1][A.hole] + 1) : ' · Stroke ' + (A.strokes[0][A.hole] + 1)) + (A.mulligans ? ' · Mulligans: ' + A.mulligans : '') + '</span>';
  }
  // The scorecard: par, your strokes and his for each hole, and the totals.
  function scoreTable() {
    function cell(p, i) {
      var n = A.strokes[p][i], done = A.holed[p][i];
      if (!n && !done) return '<td><span class="dash">–</span></td>';
      return '<td class="' + (done ? (n < HOLES[i].par ? 'is-under' : n > HOLES[i].par ? 'is-over' : '') : 'is-live') + '">' + n + '</td>';
    }
    return '<table class="mg-score"><thead><tr><th scope="col">Hole</th>' + HOLES.map(function (h, i) {
      return '<th scope="col" class="' + (i === A.hole && A.phase !== 'over' ? 'is-now' : '') + '" style="--c:' + COL[h.ch] + '">' + (i + 1) + '</th>';
    }).join('') + '<th scope="col">Total</th></tr></thead><tbody>' +
      '<tr><th scope="row">Par</th>' + HOLES.map(function (h) { return '<td>' + h.par + '</td>'; }).join('') + '<td>' + parAll() + '</td></tr>' +
      ['You', 'Him'].map(function (who, p) { return '<tr class="mg-row--' + p + '"><th scope="row">' + who + '</th>' + HOLES.map(function (h, i) { return cell(p, i); }).join('') + '<td><b>' + total(p) + '</b></td></tr>'; }).join('') +
      '</tbody></table>';
  }
  function board() { var b = q('[data-mg-score]'); if (b) b.innerHTML = scoreTable(); }
  function yourShot() {
    A.who = 0;
    A.qn += 1;
    var typed = A.qn % 3 === 0, n = A.strokes[0][A.hole] + 1;
    top();
    say('<b>Your putt.</b> Answer first.');
    row('');
    ask(typed ? 'Mulligan question' : 'Stroke ' + n, typed, A.h.ch, function (ok) {
      A.guide = ok;
      if (ok && A.typed) { A.mulligans += 1; top(); }
      K.mascot(ok ? 'angry' : 'happy', pick(ok ? SAY.right : SAY.wrong));
      go(ok ? (A.typed ? 'Aim (and a mulligan won)' : 'Aim with the line') : 'Aim', function () { hideAsk(); aim(); });
    });
  }
  function aim() {
    A.phase = 'aim';
    A.who = 0;
    A.over = false;
    A.yaw = yawFrom(A.ball);
    A.aim = { angle: Math.atan2(A.yaw[1], A.yaw[0]), power: A.aim ? A.aim.power : 0.35 };
    A.camSpeed = 3;
    behind(A.ball, A.yaw);
    say(A.guide ? '<b>Right:</b> the dots show your putt, first bounce included. Drag back from the ball and let go.' : '<b>Wrong:</b> no line, and your putt will wobble. Drag back from the ball and let go.');
    row('<button type="button" class="tb-btn tb-btn--go" data-mg-putt>Putt</button><button type="button" class="tb-btn mg-btn2" data-mg-look>See the hole</button>');
    drawAim();
    q('[data-mg-canvas]').focus({ preventScroll: true });
  }
  function look() {
    if (A.phase !== 'aim') return;
    A.over = !A.over;
    A.camSpeed = 2.6;
    if (A.over) overview(A.h); else behind(A.ball, A.yaw);
    var b = q('[data-mg-look]');
    if (b) b.textContent = A.over ? 'Back to the ball' : 'See the hole';
    kick();
  }
  function putt() {
    if (A.phase !== 'aim' || A.aim.power < 0.02) return;
    var shot = A.guide ? A.aim : wobble(A.aim, Math.random);
    A.prev = { from: A.ball.slice(), clock: A.clock, guide: A.guide };
    A.strokes[0][A.hole] += 1;
    board();
    row('');
    say(A.guide ? '<b>Your putt.</b>' : '<b>Your putt.</b> It wobbles…');
    play(roll(A.h, A.ball, shot.angle, shot.power, A.clock, true), 1, yourStop);
  }
  function yourStop(r) {
    var n = A.strokes[0][A.hole];
    A.phase = 'after';
    if (r.sunk) {
      A.holed[0][A.hole] = true;
      board();
      popText(A.h.cup[0], A.h.cup[1], scoreName(n, A.h.par));
      K.ding(4, true);
      mood(n < A.h.par ? 'furious' : 'angry');
      K.mascot('angry', pick(SAY.in));
      say('<b>In, in ' + n + '.</b> ' + scoreName(n, A.h.par) + '. His turn.');
      wait(hisHole, 2000);
      return;
    }
    if (n >= MAX) {
      A.holed[0][A.hole] = true;
      board();
      say('That\'s ' + MAX + ' strokes: you pick up. His turn.');
      wait(hisHole, 1600);
      return;
    }
    mood('happy');
    if (A.mulligans) {
      say('Not in. Use a mulligan and take that putt again?');
      row('<button type="button" class="tb-btn tb-btn--go" data-mg-retake>Take it again</button><button type="button" class="tb-btn mg-btn2" data-mg-keep>Play on</button>');
      return;
    }
    if (Math.hypot(r.end[0] - A.h.cup[0], r.end[1] - A.h.cup[1]) > 4) K.mascot('happy', pick(SAY.out));
    say('Not in.');
    wait(yourShot, 900);
  }
  function retake() {
    if (A.phase !== 'after' || !A.mulligans) return;
    A.mulligans -= 1;
    A.strokes[0][A.hole] -= 1;
    A.ball = A.prev.from.slice();
    A.clock = A.prev.clock;
    A.guide = A.prev.guide;
    board();
    top();
    aim();
  }
  function scoreName(n, par) {
    if (n === 1) return 'Hole in one!';
    return { '-2': 'Eagle!', '-1': 'Birdie!', 0: 'Par', 1: 'Bogey', 2: 'Double bogey' }[n - par] || '+' + (n - par);
  }
  // His go at the hole: his ball from the tee, his own question before each putt, and his putts played quickly.
  function hisHole() {
    A.who = 1;
    A.ball = A.h.tee.slice();
    A.ballOn = true;
    A.drop = 0;
    A.yaw = yawFrom(A.ball);
    A.camSpeed = 2.4;
    behind(A.ball, A.yaw);
    mood('happy');
    top();
    say('<b>His turn.</b>');
    row('');
    kick();
    wait(hisShot, 900);
  }
  function hisShot() {
    top();
    hisAsk('His stroke ' + (A.strokes[1][A.hole] + 1), 0.65, A.h.ch, function (ok) {
      go('Watch his putt', function () { hideAsk(); hisPutt(ok); }, 2600);
    });
  }
  function hisPutt(ok) {
    A.phase = 'him';
    say(ok ? '<b>He got it right.</b> He lines it up…' : '<b>He got it wrong.</b> He lines it up anyway…');
    kick();
    wait(function () {
      var s = hisAim(A.h, A.ball, A.clock, ok, Math.random);
      A.strokes[1][A.hole] += 1;
      A.yaw = [Math.cos(s.angle), Math.sin(s.angle)];
      board();
      play(roll(A.h, A.ball, s.angle, s.power, A.clock, true), 1.6, hisStop);
    }, 120);
  }
  function hisStop(r) {
    var n = A.strokes[1][A.hole];
    A.phase = 'him';
    if (r.sunk) {
      A.holed[1][A.hole] = true;
      popText(A.h.cup[0], A.h.cup[1], scoreName(n, A.h.par));
      K.bonk();
      mood('happy');
      K.mascot('happy', pick(SAY.hisIn));
      say('<b>He\'s in, in ' + n + '.</b>');
      wait(holeDone, 1700);
      return;
    }
    if (n >= MAX) { A.holed[1][A.hole] = true; say('He picks up after ' + MAX + '.'); wait(holeDone, 1400); return; }
    mood('angry');
    say('He\'s not in.');
    wait(hisShot, 700);
  }
  function holeDone() {
    var i = A.hole, you = A.strokes[0][i], him = A.strokes[1][i], best = +(K.store('bio-golf-hole-' + (i + 1)) || 0);
    A.phase = 'between';
    if (!best || you < best) K.store('bio-golf-hole-' + (i + 1), String(you));
    board();
    var msg = you < him ? 'You win the hole.' : you > him ? 'He wins the hole.' : 'A half: you both took ' + you + '.';
    layer(card(A.h.ch, 'Hole ' + (i + 1) + ' done', '<p class="tb-q">' + esc(msg) + '</p><p class="mg-res">You <b class="num">' + you + '</b> · Him <b class="num">' + him +
      '</b> · Par ' + A.h.par + '</p><p class="mg-res">After ' + (i + 1) + (i ? ' holes' : ' hole') + ': you <b class="num">' + total(0) + '</b>, him <b class="num">' + total(1) + '</b>.</p>'));
    if (you < him) mood('angry');
    go(i + 1 < HOLES.length ? 'Next hole: ' + esc(HOLES[i + 1].name) : 'See who won', function () { hideAsk(); if (i + 1 < HOLES.length) holeStart(i + 1); else finish(); });
  }
  function finish() {
    var you = total(0), him = total(1), won = you < him, best = +(K.store('bio-golf-best') || 0), wins = +(K.store('bio-golf-wins') || 0) + (won ? 1 : 0);
    A.phase = 'over';
    if (!best || you < best) K.store('bio-golf-best', String(you));
    if (won) K.store('bio-golf-wins', String(wins));
    dispose3d();
    K.mascot(won ? 'angry' : 'happy', won ? 'Hmph. The greens were too fast.' : you === him ? 'A draw. Hmph.' : 'As expected. Again?');
    show('<div class="am-games__end"><div class="ar-face" aria-hidden="true">' + K.face + '</div><h3 class="am-games__title">' + (won ? 'You win!' : you === him ? 'A draw.' : 'He wins.') + '</h3>' +
      '<p class="am-games__sub">You took ' + you + ', he took ' + him + ' (par ' + parAll() + ').' + (!best || you < best ? ' Your best round yet.' : ' Your best: ' + best + '.') +
      (won ? ' Rounds won: ' + wins + '.' : '') + ' You got ' + A.right + ' of ' + A.asked + ' questions right.</p><div class="mg-board">' + scoreTable() + '</div></div>',
    [['more', 'data-am-keep', 'Close'], ['ok', 'data-mg-again', 'Play again']]);
    if (won) K.later(K.fanfare, 300);
  }

  // ======================================================================== aiming: drag, keys
  // Drag back from the ball and let go: the putt goes the other way from your finger (where it is on the green), harder
  // the further you pull. A tap only turns the aim; pulling back to the ball cancels.
  function pullTo(e) {
    var c = q('[data-mg-canvas]'), r = c.getBoundingClientRect(), p = A.ball, z = height(A.h, p[0], p[1]) + R;
    var b = place(p[0], p[1], z), bx = b.x / 100 * r.width, by = b.y / 100 * r.height, px = e.clientX - r.left, py = e.clientY - r.top;
    var dx = px - bx, dy = py - by, len = Math.hypot(dx, dy);
    if (len < 6) { A.aim.power = 0; drawAim(); return; }
    A.ray.setFromCamera(new TH.Vector2(px / r.width * 2 - 1, 1 - py / r.height * 2), A.cam);
    var o = A.ray.ray.origin, d = A.ray.ray.direction, t = d.y < -1e-4 ? (z - o.y) / d.y : -1, angle;
    if (t > 0) {
      var gx = o.x + d.x * t, gy = -(o.z + d.z * t);
      angle = Math.atan2(p[1] - gy, p[0] - gx);
    } else {
      // Above the horizon: by the screen instead (down is forwards).
      var fx = A.camLook.x - A.camPos.x, fy = -(A.camLook.z - A.camPos.z), fl = Math.hypot(fx, fy) || 1;
      fx /= fl;
      fy /= fl;
      angle = Math.atan2(fy * dy - fx * dx, fx * dy + fy * dx);
    }
    A.aim.angle = angle;
    A.aim.power = Math.max(0, Math.min(1, len / (0.4 * Math.min(r.width, r.height))));
    drawAim();
  }
  document.addEventListener('click', function (e) {
    if (!live() || !A.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-ar-opt]')) && A.phase === 'ask') { choose(t); return; }
    if (e.target.closest('[data-ar-check]') && A.phase === 'ask') { check(false); return; }
    if (e.target.closest('[data-ar-pass]') && A.phase === 'ask') { check(true); return; }
    if (e.target.closest('[data-ar-go]') && A.then) { var then = A.then; A.then = null; then(); return; }
    if (e.target.closest('[data-mg-go]')) { teeOff(); return; }
    if (e.target.closest('[data-mg-again]')) { openGolf(); return; }
    if (e.target.closest('[data-mg-putt]')) { putt(); return; }
    if (e.target.closest('[data-mg-look]')) { look(); return; }
    if (e.target.closest('[data-mg-retake]')) { retake(); return; }
    if (e.target.closest('[data-mg-keep]') && A.phase === 'after') { row(''); yourShot(); }
  });
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (!live() || A.phase !== 'aim' || !e.target.closest || !e.target.closest('[data-mg-canvas]')) return;
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
    if (live() && A.phase === 'aim' && d.moved && A.aim.power >= 0.02) putt();
  });
  document.addEventListener('pointercancel', function () { drag = null; });
  document.addEventListener('keydown', function (e) {
    if (!live() || !e.target.closest) return;
    if (e.key === 'Enter' && !e.shiftKey && e.target.closest('[data-ar-text]')) { e.preventDefault(); if (A.phase === 'ask') check(false); return; }
    if (A.phase !== 'aim' || !e.target.closest('[data-mg-canvas]')) return;
    var k = e.key, fine = e.shiftKey ? 0.25 : 1;
    if (k === 'ArrowLeft' || k === 'ArrowRight') A.aim.angle += (k === 'ArrowLeft' ? 0.035 : -0.035) * fine;
    else if (k === 'ArrowUp' || k === 'ArrowDown') A.aim.power = Math.max(0, Math.min(1, Math.round((A.aim.power + (k === 'ArrowUp' ? 0.02 : -0.02) * fine) * 1000) / 1000));
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); putt(); return; } else return;
    e.preventDefault();
    drawAim();
  });
  window.addEventListener('resize', function () { if (live()) { BB.nearMascot(A.card); size(); } });
  window.BioGolf = {
    open: openGolf,
    state: function () { return A; },
    // For tools/bio/tests/golf.mjs.
    test: { HOLES: HOLES, prep: prep, roll: roll, aimLine: aimLine, survey: survey, solve: solve, missShot: missShot, hisAim: hisAim, wobble: wobble, costAt: costAt, ahead: ahead,
      height: height, inPoly: inPoly, gap: gap, cellAt: cellAt, speedOf: speedOf, R: R, CUP: CUP, MAX: MAX }
  };
})();

// The pictures a maths step shows, as animated scenes: MathsRender.vis(spec, seen) returns a box with .play() and .keys.
// A part's steps share one scene that builds up: each drawn piece has a key, and a piece whose key was in the last
// step's picture (seen) is drawn as it is, with no animation, so only what is new moves. The spec vocabulary is in
// tools/maths/SCENES.md; tools/maths/gallery.html shows every kind.
//   graph   axes, curves drawn in, points, a dot riding the curve with its tangent, reading values off, a ball's flight
//   signs   where f′(x) is + or −         shape / net   solids with water filling, balls dropping in, the net unrolling
//   trap    trapezoidal-rule strips       slots / list  counting boxes filling, outcomes listed
//   bag, dice, spinner, pscale, tree, venn   probability
//   dots, bars, pie, stem, scatter, normal, ci, table, grid   statistics and data
(function () {
  'use strict';
  var R = window.MathsRender;
  if (!R) return;
  var NS = 'http://www.w3.org/2000/svg';
  var PAL = ['#1CB0F6', '#FF86D0', '#FFC800', '#58CC02', '#CE82FF', '#FF9600', '#2BD9C4', '#FF4B4B'];
  var COL = { red: '#FF4B4B', blue: '#1CB0F6', green: '#58CC02', yellow: '#FFC800', purple: '#CE82FF', violet: '#B57BFF', indigo: '#6C7BFF',
    pink: '#FF86D0', orange: '#FF9600', white: '#F1F7FB', black: '#47555C', grey: '#9EB0B9', gray: '#9EB0B9', brown: '#C08552', teal: '#2BD9C4', gold: '#FFC800' };
  function colour(c, i) {
    var k = String(c == null ? '' : c).toLowerCase();
    return COL[k] || (/^#[0-9a-f]{3,8}$/i.test(k) ? k : PAL[(i || 0) % PAL.length]);
  }
  function reduce() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || !!window.MATHS_STILL; }
  var uidN = 0;
  function uid(p) { uidN += 1; return (p || 'mx') + uidN + Math.random().toString(36).slice(2, 6); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = el('text', { x: x, y: y, class: cls || 'mx-t', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = s == null ? '' : String(s);
    return t;
  }
  function svgBox(w, h, cls) { return el('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'mx-svg ' + (cls || ''), role: 'img' }); }
  function defs(s) { return s.querySelector('defs') || s.insertBefore(el('defs', {}), s.firstChild); }
  function minus(s) { return String(s).replace(/(^|[^\w])-(?=[\d.])/g, '$1−'); }
  function nice(v) { if (typeof v !== 'number') return String(v); var r = Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : +v.toFixed(2); return minus(String(r)); }
  function fix1(v) { return Math.abs(v) < .05 ? '0' : minus(String(+v.toFixed(Math.abs(v) >= 10 ? 0 : 1))); }
  function ticks(a, b) {
    var span = b - a, raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(function (m) { return m * mag; }).filter(function (s) { return s >= raw; })[0] || mag * 10;
    var out = [];
    for (var v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
  function linear(k) { return k; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function list(v) { return v == null ? [] : Array.isArray(v) ? v : [v]; }
  function tween(ms, delay, step, e) {
    e = e || ease;
    step(0);
    if (!window.requestAnimationFrame) { step(1); return; }
    var t0 = null;
    requestAnimationFrame(function f(ts) {
      if (t0 == null) t0 = ts + (delay || 0);
      var k = clamp((ts - t0) / ms, 0, 1);
      step(e(k));
      if (k < 1) requestAnimationFrame(f);
    });
  }

  // ---------- the sequence: what animates, and when ----------
  // Every animated piece gets a key. Fresh pieces animate one after another (the clock moves on by "adv" ms for each);
  // pieces the last picture already had are drawn still. Jobs run once the picture is on the page.
  function Seq(seen) { this.t = 120; this.seen = seen || {}; this.keys = {}; this.jobs = []; this.still = reduce(); }
  Seq.prototype.fresh = function (key) {
    if (key != null) this.keys[key] = 1;
    return !this.still && !(key != null && this.seen[key]);
  };
  Seq.prototype.at = function (adv) { var t = this.t; this.t += adv || 0; return t; };
  Seq.prototype.job = function (fn) { this.jobs.push(fn); };
  Seq.prototype.anim = function (node, key, adv, frames, opts) {
    if (!this.fresh(key)) return false;
    var d = this.at(adv);
    this.job(function () {
      if (!node.animate) return;
      node.animate(frames, Object.assign({ duration: 450, delay: d, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }, opts || {}));
    });
    return true;
  };
  Seq.prototype.fade = function (node, key, adv, ms) { return this.anim(node, key, adv == null ? 0 : adv, [{ opacity: 0 }, { opacity: 1 }], { duration: ms || 420 }); };
  Seq.prototype.rise = function (node, key, adv) { return this.anim(node, key, adv == null ? 80 : adv, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 480 }); };
  Seq.prototype.pop = function (node, key, adv, ms) {
    node.style.transformBox = 'fill-box';
    node.style.transformOrigin = 'center';
    return this.anim(node, key, adv == null ? 120 : adv, [{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1.18)', offset: .65 }, { opacity: 1, transform: 'none' }],
      { duration: ms || 480, easing: 'ease-out' });
  };
  // Grows from an edge: origin 'left', 'bottom', 'center'.
  Seq.prototype.grow = function (node, key, adv, origin, ms) {
    node.style.transformBox = 'fill-box';
    node.style.transformOrigin = origin === 'bottom' ? 'center bottom' : origin === 'left' ? 'left center' : 'center';
    var from = origin === 'bottom' ? 'scaleY(0)' : 'scaleX(0)';
    return this.anim(node, key, adv == null ? 200 : adv, [{ transform: from, opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: ms || 650 });
  };
  // Draws a stroke on as if by pen (a dashed line keeps its dashes: a solid copy in a mask uncovers it).
  Seq.prototype.draw = function (node, key, ms, adv) {
    if (!this.fresh(key)) return false;
    ms = ms || 900;
    var d = this.at(adv == null ? ms * .55 : adv);
    this.job(function () { strokeIn(node, d, ms); });
    return true;
  };
  // A frame-by-frame animation: step(k) draws the state at k (0 to 1). It is drawn at k = 1 straight away, so a still
  // picture (or one already seen) shows the end.
  Seq.prototype.tw = function (key, adv, ms, step, e) {
    step(1);
    if (!this.fresh(key)) return false;
    var d = this.at(adv);
    this.job(function () { tween(ms, d, step, e); });
    return true;
  };
  function strokeIn(node, d, ms) {
    if (!node.animate) return;
    var cs = getComputedStyle(node), dash = cs.strokeDasharray, len = 0;
    try { len = node.getTotalLength(); } catch (e) { len = 0; }
    if (!len || !isFinite(len)) { node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: d, fill: 'backwards' }); return; }
    if (dash && dash !== 'none') {
      var svg = node.ownerSVGElement, vb = svg.viewBox.baseVal, id = uid('mxm');
      var m = el('mask', { id: id, maskUnits: 'userSpaceOnUse', x: vb.x - 20, y: vb.y - 20, width: vb.width + 40, height: vb.height + 40 }, defs(svg));
      var c = node.cloneNode(false);
      ['class', 'mask', 'clip-path', 'transform', 'style'].forEach(function (a) { c.removeAttribute(a); });
      c.setAttribute('style', 'fill:none;stroke:#fff;stroke-width:' + ((parseFloat(cs.strokeWidth) || 2) + 8) + 'px;stroke-dasharray:' + len + 'px ' + len + 'px');
      m.appendChild(c);
      node.setAttribute('mask', 'url(#' + id + ')');
      var a = c.animate([{ strokeDashoffset: len + 'px' }, { strokeDashoffset: '0px' }], { duration: ms, delay: d, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' });
      a.onfinish = function () { node.removeAttribute('mask'); m.remove(); };
      return;
    }
    var filled = cs.fill && cs.fill !== 'none' && !/rgba\(.*,\s*0\)$/.test(cs.fill), fo = cs.fillOpacity || '1';
    node.style.strokeDasharray = len + 'px ' + len + 'px';
    var frames = filled ? [{ strokeDashoffset: len + 'px', fillOpacity: 0 }, { strokeDashoffset: '0px', fillOpacity: 0, offset: .7 }, { strokeDashoffset: '0px', fillOpacity: fo }]
      : [{ strokeDashoffset: len + 'px' }, { strokeDashoffset: '0px' }];
    var an = node.animate(frames, { duration: ms, delay: d, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' });
    an.onfinish = function () { node.style.strokeDasharray = ''; };
  }
  // A number that counts up to its value.
  function countTo(node, q, key, adv, to, ms, fmt) {
    var f = fmt || function (v) { return nice(Math.round(v)); };
    return q.tw(key, adv, ms || 900, function (k) { node.textContent = f(to * k, k); }, easeOut);
  }
  function ballGrad(s, c) {
    var id = uid('mxg'), g = el('radialGradient', { id: id, cx: '35%', cy: '30%', r: '75%' }, defs(s));
    el('stop', { offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': '.75' }, g);
    el('stop', { offset: '28%', 'stop-color': c }, g);
    el('stop', { offset: '100%', 'stop-color': c, 'stop-opacity': '.8' }, g);
    return 'url(#' + id + ')';
  }
  function isHl(hl, k) { return list(hl).some(function (h) { return String(h).toLowerCase() === String(k).toLowerCase(); }); }

  // ================= Calculus =================
  function curvePath(f, from, to, X, Y, y0, y1) {
    var d = '', pen = false, span = y1 - y0;
    for (var j = 0; j <= 320; j++) {
      var x = from + (to - from) * j / 320, y;
      try { y = f({ x: x }); } catch (e) { y = NaN; }
      if (!isFinite(y) || y > y1 + span * 2 || y < y0 - span * 2) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1);
      pen = true;
    }
    return d;
  }
  function slopeAt(f, x, span) { var h = 1e-4 * (span || 1); return (f({ x: x + h }) - f({ x: x - h })) / (2 * h); }
  function graph(v, q) {
    var W = 520, H = 340, L = 46, Rm = 16, T = 14, B = 30;
    var x0 = +v.x[0], x1 = +v.x[1], y0 = +v.y[0], y1 = +v.y[1];
    var X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - Rm); }, Y = function (y) { return T + (y1 - y) / (y1 - y0) * (H - T - B); };
    var cy = function (y) { return clamp(y, T + 12, H - B - 6); };
    var s = svgBox(W, H, 'mx-graph'), K = 'g' + [x0, x1, y0, y1].join(',') + ':';
    var AX = X(x0 <= 0 && x1 >= 0 ? 0 : x0), AY = Y(y0 <= 0 && y1 >= 0 ? 0 : y0);
    var grid = el('g', { class: 'mx-grid' }, s), TK = v.ticks || {};
    // ticks: {x: 1, y: 2} draws the paper's own scale (a line every 1 across, every 2 up), so it can be copied.
    var steps = function (a, b, st) { if (!(st > 0)) return ticks(a, b); var out = []; for (var t = Math.ceil(a / st - 1e-9) * st; t <= b + 1e-9; t += st) out.push(+t.toFixed(10)); return out; };
    steps(x0, x1, TK.x).forEach(function (t) { el('line', { x1: X(t), x2: X(t), y1: T, y2: H - B }, grid); if (Math.abs(X(t) - AX) > 2) txt(grid, X(t), Math.min(H - B, AY) + 16, nice(t), 'mx-tick'); });
    steps(y0, y1, TK.y).forEach(function (t) { el('line', { x1: L, x2: W - Rm, y1: Y(t), y2: Y(t) }, grid); if (Math.abs(Y(t) - AY) > 2) txt(grid, Math.max(L, AX) - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    q.fade(grid, K + 'grid', 0, 500);
    var ax = el('g', { class: 'mx-axes' }, s);
    q.draw(el('line', { x1: L, x2: W - Rm, y1: AY, y2: AY }, ax), K + 'xa', 600, 0);
    q.draw(el('line', { x1: AX, x2: AX, y1: T, y2: H - B }, ax), K + 'ya', 600, 300);
    if (v.xlab) txt(s, W - Rm, AY - 8, v.xlab, 'mx-axlab', 'end');
    if (v.ylab) txt(s, AX + 8, T + 12, v.ylab, 'mx-axlab', 'start');
    var cid = uid('mxc');
    el('rect', { x: L, y: T - 4, width: W - L - Rm, height: H - T - B + 8 }, el('clipPath', { id: cid }, defs(s)));
    var plot = el('g', { 'clip-path': 'url(#' + cid + ')' }, s), top = el('g', {}, s);
    // Points from a table, plotted one at a time before the curve joins them.
    // The domain ("for 0 ≤ x ≤ 7"): where the graph starts and stops; outside it is greyed and the curve isn't drawn.
    if (v.domain) {
      var da = +v.domain[0], db = +v.domain[1], dv = v.dvar || 'x', dg = el('g', { class: 'mx-domain' }, s);
      if (da > x0) el('rect', { x: L, y: T, width: Math.max(0, X(da) - L), height: H - T - B, class: 'mx-outside' }, dg);
      if (db < x1) el('rect', { x: X(db), y: T, width: Math.max(0, W - Rm - X(db)), height: H - T - B, class: 'mx-outside' }, dg);
      q.fade(dg, K + 'dom' + da + ',' + db, 200, 500);
      [[da, 'from ' + dv + ' = ' + nice(da), 'start'], [db, 'to ' + dv + ' = ' + nice(db), 'end']].forEach(function (e, i) {
        var ln = el('line', { x1: X(e[0]), x2: X(e[0]), y1: T, y2: H - B, class: 'mx-domline' }, s);
        q.draw(ln, K + 'doml' + i + e[0], 600, 250);
        var t = txt(s, X(e[0]) + (i ? -6 : 6), T + (v.ylab ? 32 : 14), e[1], 'mx-domt', i ? 'end' : 'start');
        q.fade(t, K + 'domt' + i + e[0], 0);
      });
    }
    // Plotting: each point's guide runs from the x-axis straight up (or down) to its height, then the dot goes on.
    (v.plot || []).forEach(function (p) {
      if (v.guides) {
        var gl = el('path', { d: 'M' + X(p[0]) + ' ' + AY + 'V' + Y(p[1]), class: 'mx-guide' }, top);
        q.draw(gl, K + 'guide' + p.join(','), 380, 260);
      }
      var c = el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.5, class: 'mx-pt is-plot' }, top);
      q.pop(c, K + 'plot' + p.join(','), v.guides ? 200 : 130, 380);
      if (v.plotLabels) { var edge = X(p[0]) > W - 80, pl = txt(top, X(p[0]) + (edge ? -8 : 8), clamp(Y(p[1]) + (p[1] >= 0 ? -9 : 18), T + 12, H - B - 4), '(' + nice(p[0]) + ', ' + nice(p[1]) + ')', 'mx-plotlab', edge ? 'end' : 'start'); q.fade(pl, K + 'plotl' + p.join(','), 0); }
    });
    var F = [];
    (v.fns || []).forEach(function (fn, k) {
      var f;
      try { f = R.compile(fn.f); f({ x: (x0 + x1) / 2 }); } catch (e) { F.push(null); return; }
      F.push(f);
      var from = fn.from != null ? +fn.from : x0, to = fn.to != null ? +fn.to : x1;
      var p = el('path', { d: curvePath(f, from, to, X, Y, y0, y1), class: 'mx-curve mx-c' + (k % 3) + (fn.c === 'faint' ? ' is-faint' : '') }, plot);
      q.draw(p, K + 'fn' + fn.f + '|' + from + '|' + to, 1400, 700);
      if (fn.label) {
        var lx = Math.min(X(to), W - Rm) - 4, lyv = f({ x: to }), lt = txt(top, lx, cy(Y(lyv)) - 10, fn.label, 'mx-flabel mx-c' + (k % 3), 'end');
        q.fade(lt, K + 'fl' + fn.label + k, 0);
      }
    });
    (v.lines || []).forEach(function (ln) {
      var p = el('path', { d: 'M' + X(x0) + ' ' + Y(ln.m * x0 + ln.c) + 'L' + X(x1) + ' ' + Y(ln.m * x1 + ln.c), class: 'mx-line2' }, plot);
      q.draw(p, K + 'ln' + ln.m + ',' + ln.c, 900, 400);
      if (ln.label) { var t = txt(top, W - Rm - 4, cy(Y(ln.m * x1 + ln.c)) + (ln.m > 0 ? 18 : -8), ln.label, 'mx-flabel mx-l2', 'end'); q.fade(t, K + 'lnl' + ln.label, 0); }
    });
    // Where the curve goes up (green) and down (red).
    (v.shade || []).forEach(function (sh) {
      var f = sh.f ? R.compile(sh.f) : F[0];
      if (!f) return;
      var up = sh.sign !== '-', a = Math.max(x0, +sh.from), b = Math.min(x1, +sh.to);
      var p = el('path', { d: curvePath(f, a, b, X, Y, y0, y1), class: 'mx-shade ' + (up ? 'is-up' : 'is-down') }, plot);
      q.draw(p, K + 'sh' + a + ',' + b + sh.sign, 900, 500);
      var t = txt(top, (X(a) + X(b)) / 2, H - B - 10, up ? '↗ increasing' : '↘ decreasing', 'mx-shadet ' + (up ? 'is-up' : 'is-down'));
      q.fade(t, K + 'sht' + a + ',' + b + sh.sign, 0);
    });
    (v.roots || []).forEach(function (r) {
      var g = el('g', { class: 'mx-rootmark' }, top);
      el('circle', { cx: X(r), cy: AY, r: 11, class: 'mx-ring' }, g);
      el('circle', { cx: X(r), cy: AY, r: 5.5, class: 'mx-pt is-hl' }, g);
      q.pop(g, K + 'root' + r, 220);
    });
    if (v.tangent) {
      try {
        var g = R.compile(v.tangent.f), a = +v.tangent.x, m = slopeAt(g, a, x1 - x0), ya = g({ x: a }), span = (x1 - x0) * .3;
        var tl = el('path', { d: 'M' + X(a - span) + ' ' + Y(ya - m * span) + 'L' + X(a + span) + ' ' + Y(ya + m * span), class: 'mx-tangent' }, plot);
        q.grow(tl, K + 'tan' + v.tangent.f + '@' + a, 500, 'center', 700);
        var tp = el('circle', { cx: X(a), cy: Y(ya), r: 6.5, class: 'mx-pt is-hl' }, top);
        q.pop(tp, K + 'tanp' + a, 0);
        if (v.tangent.label !== false) {
          var lx2 = X(a + span * .6), right = lx2 < W - 120;
          var lt2 = txt(top, right ? lx2 + 6 : X(a) - 12, cy(Y(ya + m * span * .6)) - 12, v.tangent.label || ('slope = ' + fix1(m)), 'mx-tlabel', right ? 'start' : 'end');
          q.fade(lt2, K + 'tanl' + a + (v.tangent.label || ''), 200);
        }
      } catch (e) { /* not drawable */ }
    }
    // Reading a value off the graph: dashed lines from one axis to the curve and on to the other.
    (v.reads || []).forEach(function (r) {
      var px = X(r.x), py = Y(r.y), fromY = r.from === 'y';
      var p = el('path', { d: fromY ? 'M' + AX + ' ' + py + 'H' + px + 'V' + AY : 'M' + px + ' ' + AY + 'V' + py + 'H' + AX, class: 'mx-read' }, top);
      q.draw(p, K + 'rd' + r.x + ',' + r.y, 1200, 700);
      var c = el('circle', { cx: px, cy: py, r: 6, class: 'mx-pt is-hl' }, top);
      q.pop(c, K + 'rdp' + r.x + ',' + r.y, 150);
      var lab = r.label || (fromY ? 'x ≈ ' + nice(+r.x) : 'y ≈ ' + nice(+r.y));
      var t = fromY ? txt(top, px, AY - 10, lab, 'mx-readt') : txt(top, AX + 8, py - 9, lab, 'mx-readt', 'start');
      q.pop(t, K + 'rdt' + lab, 200);
    });
    (v.pts || []).forEach(function (p) {
      var hl = v.hl && p.kind === v.hl, c = el('circle', { cx: X(p.x), cy: Y(p.y), r: 6, class: 'mx-pt' + (hl || p.hl ? ' is-hl' : '') }, top);
      q.pop(c, K + 'pt' + p.x + ',' + p.y + (hl || p.hl ? 'h' : ''), 220);
      if (p.label) {
        var nearR = X(p.x) > W - 110, t = txt(top, X(p.x) + (nearR ? -10 : 10), Y(p.y) + (Y(p.y) < T + 26 ? 22 : -11), p.label, 'mx-plabel', nearR ? 'end' : 'start');
        q.fade(t, K + 'ptl' + p.label, 80);
      }
    });
    // A dot rides along the curve with its tangent: the slope reads out as it goes, and is 0 at a turning point.
    if (v.ride) {
      var rf = v.ride.f ? R.compile(v.ride.f) : F[0];
      if (rf) {
        var ra = v.ride.from != null ? +v.ride.from : x0, rb = v.ride.to != null ? +v.ride.to : x1;
        var rg = el('g', { class: 'mx-ride' }, top), sx = (W - L - Rm) / (x1 - x0), sy = (H - T - B) / (y1 - y0);
        var rl = el('line', { class: 'mx-tangent' }, rg), rd = el('circle', { r: 7.5, class: 'mx-pt is-hl' }, rg), rt = txt(rg, 0, 0, '', 'mx-tlabel');
        var put = function (k) {
          var x = ra + (rb - ra) * k, y = rf({ x: x }), m = slopeAt(rf, x, x1 - x0);
          var vx = sx, vy = -m * sy, n = Math.sqrt(vx * vx + vy * vy) || 1, len = 64;
          vx = vx / n * len; vy = vy / n * len;
          var px = X(x), py = Y(y);
          rl.setAttribute('x1', px - vx); rl.setAttribute('y1', py - vy); rl.setAttribute('x2', px + vx); rl.setAttribute('y2', py + vy);
          rd.setAttribute('cx', px); rd.setAttribute('cy', py);
          var flat = Math.abs(m) * sy / sx < .03;
          var right = px < W - 150;
          rt.setAttribute('x', px + (right ? 10 : -10)); rt.setAttribute('y', clamp(py + (py < T + 50 ? 34 : -32), T + 12, H - B - 6));
          rt.setAttribute('text-anchor', right ? 'start' : 'end');
          rt.textContent = v.ride.label === false ? '' : 'slope = ' + (flat ? '0' : fix1(m)) + (flat && k === 1 && v.ride.flat !== false ? '  (turning point)' : '');
          rg.classList.toggle('is-flat', flat);
        };
        q.tw(K + 'ride' + ra + '>' + rb, 300, 2600, put, ease);
      }
    }
    // Something flying along the curve (a ball, a diver): it moves steadily across, leaving its path.
    if (v.obj) {
      var of = v.obj.f ? R.compile(v.obj.f) : F[0];
      if (of) {
        var oa = v.obj.from != null ? +v.obj.from : x0, ob = v.obj.to != null ? +v.obj.to : x1;
        var trail = el('path', { class: 'mx-trail' }, plot), ball = el('circle', { r: 9, fill: ballGrad(s, colour(v.obj.c || 'yellow')), class: 'mx-ball' }, top);
        var ol = v.obj.label ? txt(top, 0, 0, v.obj.label, 'mx-plabel', 'start') : null;
        q.tw(K + 'obj' + oa + '>' + ob, 300, 2400, function (k) {
          var x = oa + (ob - oa) * k, y = of({ x: x });
          trail.setAttribute('d', curvePath(of, oa, x, X, Y, y0, y1) || 'M0 0');
          ball.setAttribute('cx', X(x)); ball.setAttribute('cy', Y(y));
          if (ol) { var nr = X(x) > W - 110; ol.setAttribute('x', X(x) + (nr ? -14 : 14)); ol.setAttribute('y', Y(y) - 14); ol.setAttribute('text-anchor', nr ? 'end' : 'start'); }
        }, linear);
      }
    }
    return s;
  }
  function signs(v, q) {
    var W = 520, H = 112, L = 30, Rm = 30, x0 = +v.x[0], x1 = +v.x[1], X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - Rm); };
    var s = svgBox(W, H, 'mx-signs'), K = 'sg' + x0 + ',' + x1 + ':', cuts = [x0].concat(v.roots || [], [x1]);
    (v.signs || []).forEach(function (sg, k) {
      var a = X(cuts[k]), b = X(cuts[k + 1]), up = sg === '+';
      var g = el('g', {}, s);
      el('rect', { x: a, y: 30, width: Math.max(0, b - a), height: 28, rx: 4, class: up ? 'mx-pos' : 'mx-neg' }, g);
      txt(g, (a + b) / 2, 50, (up ? '+   going up ↗' : '−   going down ↘'), 'mx-signt ' + (up ? 'is-up' : 'is-down'));
      q.grow(g, K + 'seg' + k + sg, 420, 'left', 600);
    });
    q.draw(el('line', { x1: L, x2: W - Rm, y1: 58, y2: 58, class: 'mx-axisline' }, s), K + 'ax', 500, 0);
    (v.roots || []).forEach(function (r) {
      var g = el('g', {}, s);
      el('line', { x1: X(r), x2: X(r), y1: 20, y2: 66, class: 'mx-rootline' }, g);
      txt(g, X(r), 86, 'x = ' + nice(r), 'mx-tick is-hl');
      q.pop(g, K + 'r' + r, 200);
    });
    if (v.label) txt(s, L, 16, v.label, 'mx-axlab', 'start');
    return s;
  }

  // ================= Applied measure =================
  // Solids in a simple oblique view. dims give sizes (for scale), labels the words drawn on them, hl the one in use.
  // fill: {from, to, label, rise} water rising (or falling) inside; inside: {n, label, out} balls dropping in (or lifted out).
  function shape(v, q) {
    if (v.kind === 'composite') return composite(v, q);
    var W = 440, H = 290, s = svgBox(W, H, 'mx-shape'), d = v.dims || {}, lab = v.labels || {}, hl = v.hl, k = v.kind, cx = 190;
    var K = 'sh' + k + (v.inverted ? 'i' : '') + ':';
    var under = el('g', {}, s), body = el('g', { class: 'mx-solid' }, s), dg = el('g', {}, s);
    var sil = [], dims = [], geo = null;
    function face(tag, attrs, cls) { return el(tag, Object.assign({ class: cls || 'mx-face' }, attrs), body); }
    function dim(x1, y1, x2, y2, key, off) {
      if (!lab[key]) return;
      var g = el('g', { class: 'mx-dim' + (isHl(hl, key) ? ' is-hl' : '') }, dg);
      el('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, g);
      off = off || [0, -8];
      txt(g, (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], lab[key], 'mx-dimt', off[0] > 0 ? 'start' : off[0] < 0 ? 'end' : 'middle');
      dims.push([g, key]);
    }
    var rw = 92, ry = 24, top = 52, bot = 222;
    if (k === 'cylinder') {
      // A wide, short tank or a tall tube: the drawn height follows the real height when both are given.
      if (d.r && d.h) { var hp = clamp(d.h / d.r * rw, 70, 200); top = (H - hp) / 2 + 6; bot = top + hp; if (d.h / d.r < .8) { rw = 120; ry = 30; } }
      face('path', { d: 'M' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 1 ' + (cx + rw) + ' ' + bot }, 'mx-hidden');
      face('path', { d: 'M' + (cx - rw) + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'L' + (cx + rw) + ' ' + top });
      face('ellipse', { cx: cx, cy: top, rx: rw, ry: ry }, 'mx-face mx-top');
      sil = [['path', { d: 'M' + (cx - rw) + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'L' + (cx + rw) + ' ' + top + 'Z' }], ['ellipse', { cx: cx, cy: top, rx: rw, ry: ry }]];
      geo = { top: top, bot: bot, r: rw, surf: function (f) { return { y: bot - f * (bot - top), rx: rw, ry: ry }; } };
      dim(cx, top, cx + rw, top, 'r', [0, -10]);
      dim(cx - rw, top, cx + rw, top, 'd', [0, -12]);
      dim(cx + rw + 18, top, cx + rw + 18, bot, 'h', [8, 4]);
    } else if (k === 'cone' && v.inverted) {
      face('path', { d: 'M' + (cx - rw) + ' ' + top + 'L' + cx + ' ' + bot + 'L' + (cx + rw) + ' ' + top });
      face('ellipse', { cx: cx, cy: top, rx: rw, ry: ry }, 'mx-face mx-top');
      face('line', { x1: cx, y1: top, x2: cx, y2: bot }, 'mx-hidden');
      sil = [['path', { d: 'M' + (cx - rw) + ' ' + top + 'L' + cx + ' ' + bot + 'L' + (cx + rw) + ' ' + top + 'Z' }], ['ellipse', { cx: cx, cy: top, rx: rw, ry: ry }]];
      geo = { top: top, bot: bot, r: rw, surf: function (f) { return { y: bot - f * (bot - top), rx: rw * f, ry: ry * f }; } };
      dim(cx, top, cx + rw, top, 'r', [0, -10]);
      dim(cx + 4, top, cx + 4, bot, 'h', [8, 0]);
      dim(cx + rw, top, cx, bot, 'l', [14, 8]);
    } else if (k === 'cone') {
      face('path', { d: 'M' + cx + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'Z' });
      face('path', { d: 'M' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 1 ' + (cx + rw) + ' ' + bot }, 'mx-hidden');
      face('line', { x1: cx, y1: top, x2: cx, y2: bot }, 'mx-hidden');
      sil = [['path', { d: 'M' + cx + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'Z' }]];
      geo = { top: top, bot: bot, r: rw, surf: function (f) { return { y: bot - f * (bot - top), rx: rw * (1 - f), ry: ry * (1 - f) }; } };
      dim(cx, bot, cx + rw, bot, 'r', [0, -8]);
      dim(cx + 4, top, cx + 4, bot, 'h', [8, 0]);
      dim(cx, top, cx + rw, bot, 'l', [12, -6]);
    } else if (k === 'hemisphere') {
      var R2 = 112, c2 = 190;
      face('path', { d: 'M' + (cx - R2) + ' ' + c2 + 'A' + R2 + ' ' + R2 + ' 0 0 1 ' + (cx + R2) + ' ' + c2 });
      face('ellipse', { cx: cx, cy: c2, rx: R2, ry: 28 }, 'mx-face mx-top');
      sil = [['path', { d: 'M' + (cx - R2) + ' ' + c2 + 'A' + R2 + ' ' + R2 + ' 0 0 1 ' + (cx + R2) + ' ' + c2 + 'Z' }], ['ellipse', { cx: cx, cy: c2, rx: R2, ry: 28 }]];
      geo = { top: c2 - R2, bot: c2 + 28, r: R2, surf: function (f) { var y = c2 - f * R2, rx = Math.sqrt(Math.max(0, R2 * R2 - (c2 - y) * (c2 - y))); return { y: y, rx: rx, ry: rx * .25 }; } };
      dim(cx, c2, cx + R2, c2, 'r', [0, -8]);
      dim(cx - R2, c2, cx + R2, c2, 'd', [0, 22]);
    } else if (k === 'sphere') {
      var r = 104, c3 = 146;
      face('circle', { cx: cx, cy: c3, r: r });
      face('path', { d: 'M' + (cx - r) + ' ' + c3 + 'A' + r + ' 26 0 0 0 ' + (cx + r) + ' ' + c3 }, 'mx-edge');
      face('path', { d: 'M' + (cx - r) + ' ' + c3 + 'A' + r + ' 26 0 0 1 ' + (cx + r) + ' ' + c3 }, 'mx-hidden');
      sil = [['circle', { cx: cx, cy: c3, r: r }]];
      geo = { top: c3 - r, bot: c3 + r, r: r, surf: function (f) { var y = c3 + r - f * 2 * r, rx = Math.sqrt(Math.max(0, r * r - (y - c3) * (y - c3))); return { y: y, rx: rx, ry: rx * .26 }; } };
      dim(cx, c3, cx + r, c3, 'r', [0, -8]);
      dim(cx - r, c3, cx + r, c3, 'd', [0, -8]);
    } else if (k === 'cuboid' || k === 'tri-prism') {
      var w = 180, h = 126, dx = 64, dy = -42, x = 70, y = 236;
      if (k === 'cuboid') {
        face('path', { d: 'M' + x + ' ' + y + 'h' + w + 'v' + (-h) + 'h' + (-w) + 'Z' });
        face('path', { d: 'M' + x + ' ' + (y - h) + 'l' + dx + ' ' + dy + 'h' + w + 'l' + (-dx) + ' ' + (-dy) + 'Z' }, 'mx-face mx-top');
        face('path', { d: 'M' + (x + w) + ' ' + y + 'l' + dx + ' ' + dy + 'v' + (-h) + 'l' + (-dx) + ' ' + (-dy) + 'Z' }, 'mx-face mx-side');
        geo = { cuboid: true, top: y - h, bot: y, r: w / 2, surf: function (f) { var yl = y - f * h; return { y: yl, poly: [[x, yl], [x + w, yl], [x + w + dx, yl + dy], [x + dx, yl + dy]], front: [x, yl, w, y - yl], side: [[x + w, y], [x + w + dx, y + dy], [x + w + dx, yl + dy], [x + w, yl]] }; } };
        dim(x, y + 16, x + w, y + 16, 'l', [0, 18]);
        dim(x + w + 12, y, x + w + dx + 12, y + dy, 'w', [10, 10]);
        dim(x - 14, y, x - 14, y - h, 'h', [-8, 4]);
      } else {
        face('path', { d: 'M' + x + ' ' + y + 'h' + w + 'l' + (-w / 2) + ' ' + (-h) + 'Z' });
        face('path', { d: 'M' + (x + w / 2) + ' ' + (y - h) + 'l' + dx + ' ' + dy + 'l' + (w / 2) + ' ' + h + 'l' + (-dx) + ' ' + (-dy) + 'Z' }, 'mx-face mx-side');
        face('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y - h }, 'mx-hidden');
        dim(x, y + 16, x + w, y + 16, 'b', [0, 18]);
        dim(x + w / 2 + 4, y, x + w / 2 + 4, y - h, 'h', [8, 0]);
        dim(x + w + 12, y, x + w + dx + 12, y + dy, 'l', [10, 10]);
        dim(x + w / 2, y - h, x + w, y, 's', [14, -4]);
      }
    } else if (k === 'circle' || k === 'sector' || k === 'semicircle') {
      var rr = 108, cc = [cx, k === 'semicircle' ? 200 : 148];
      if (k === 'circle') face('circle', { cx: cc[0], cy: cc[1], r: rr });
      else {
        var ang = (k === 'semicircle' ? 180 : (d.angle || 90)) * Math.PI / 180, ex = cc[0] + rr * Math.cos(-ang), ey = cc[1] + rr * Math.sin(-ang);
        face('path', { d: 'M' + cc[0] + ' ' + cc[1] + 'L' + (cc[0] + rr) + ' ' + cc[1] + 'A' + rr + ' ' + rr + ' 0 ' + (ang > Math.PI ? 1 : 0) + ' 0 ' + ex + ' ' + ey + 'Z' });
        if (lab.angle) { var at = txt(dg, cc[0] + 30, cc[1] - 12, lab.angle, 'mx-dimt' + (isHl(hl, 'angle') ? ' is-hl' : ''), 'start'); dims.push([at, 'angle']); }
        if (lab.arc) { var mid = -ang / 2, an = txt(dg, cc[0] + (rr + 16) * Math.cos(mid), cc[1] + (rr + 16) * Math.sin(mid), lab.arc, 'mx-dimt' + (isHl(hl, 'arc') ? ' is-hl' : ''), 'start'); dims.push([an, 'arc']); }
      }
      dim(cc[0], cc[1], cc[0] + rr, cc[1], 'r', [0, k === 'circle' ? -8 : 20]);
      dim(cc[0] - rr, cc[1], cc[0] + rr, cc[1], 'd', [0, 20]);
    } else if (/^(rectangle|square|parallelogram|trapezium|triangle|right-triangle)$/.test(k)) {
      var x2 = 70, y2 = 230, w2 = 250, h2 = 160, pts;
      if (k === 'square') { w2 = 170; h2 = 170; x2 = 110; y2 = 240; }
      if (k === 'rectangle' || k === 'square') pts = [[x2, y2], [x2 + w2, y2], [x2 + w2, y2 - h2], [x2, y2 - h2]];
      else if (k === 'parallelogram') pts = [[x2, y2], [x2 + w2 - 56, y2], [x2 + w2, y2 - h2], [x2 + 56, y2 - h2]];
      else if (k === 'trapezium') pts = [[x2, y2], [x2 + w2, y2], [x2 + w2 - 64, y2 - h2], [x2 + 64, y2 - h2]];
      else if (k === 'right-triangle') pts = [[x2, y2], [x2 + w2, y2], [x2, y2 - h2]];
      else pts = [[x2, y2], [x2 + w2, y2], [x2 + 96, y2 - h2]];
      face('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L') + 'Z' });
      dim(x2, y2 + 16, x2 + (k === 'parallelogram' ? w2 - 56 : w2), y2 + 16, 'b', [0, 18]);
      if (k === 'trapezium') dim(x2 + 64, y2 - h2 - 14, x2 + w2 - 64, y2 - h2 - 14, 'a', [0, -6]);
      if (k === 'rectangle' || k === 'square') dim(x2 + w2 + 14, y2, x2 + w2 + 14, y2 - h2, 'h', [8, 4]);
      else if (k === 'right-triangle') { dim(x2 - 14, y2, x2 - 14, y2 - h2, 'h', [-8, 4]); dim(x2, y2 - h2, x2 + w2, y2, 'c', [12, -10]); }
      else { var tx = pts[pts.length - 1][0]; face('line', { x1: tx, y1: y2, x2: tx, y2: y2 - h2 }, 'mx-hidden'); dim(tx + 4, y2, tx + 4, y2 - h2, 'h', [8, 0]); }
    }
    Array.prototype.forEach.call(body.children, function (p, i) { q.draw(p, K + 'face' + i + p.getAttribute('d'), 900, i === 0 ? 120 : 160); });
    dims.forEach(function (a) { q.fade(a[0], K + 'dim' + a[1] + lab[a[1]] + (isHl(hl, a[1]) ? 'h' : ''), 200); });
    // Balls inside a cylinder (tennis balls in a tube, a sphere in a tank): they drop in one by one, or one is lifted out.
    if (v.inside && geo && k === 'cylinder') {
      var n = Math.max(1, Math.min(8, v.inside.n || 1)), br = Math.min(geo.r - 3, (geo.bot - geo.top) / (2 * n));
      if (v.inside.r && d.r) br = Math.min(geo.r - 2, geo.r * v.inside.r / d.r);
      var fillc = ballGrad(s, colour(v.inside.c || '#D7F25A'));
      for (var i = 0; i < n; i++) {
        var by = geo.bot - br - i * 2 * br + (n === 1 ? 6 : 0);
        var bg = el('g', {}, under), b = el('circle', { cx: cx, cy: by, r: br, fill: fillc, class: 'mx-ball' }, bg);
        if (v.inside.out && i === n - 1) {
          bg.style.opacity = '0';
          q.anim(bg, K + 'out' + i, 900, [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'translateY(-' + (by - 10) + 'px)', offset: .75 }, { opacity: 0, transform: 'translateY(-' + (by + 20) + 'px)' }], { duration: 1400, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'backwards' });
        } else {
          q.anim(b, K + 'in' + i + 'of' + n, 380, [{ transform: 'translateY(-' + (by + br + 30) + 'px)', opacity: 0, offset: 0 }, { opacity: 1, offset: .15 }, { transform: 'translateY(0)', offset: .72, easing: 'ease-out' }, { transform: 'translateY(-' + Math.min(14, br * .4) + 'px)', offset: .86, easing: 'ease-in' }, { transform: 'none', opacity: 1 }],
            { duration: 820, easing: 'cubic-bezier(.55,0,1,.45)' });
        }
      }
      if (v.inside.label) { var il = txt(dg, cx, geo.bot - br + 5 + (n === 1 ? 6 : 0), v.inside.label, 'mx-dimt is-ball'); q.fade(il, K + 'inl' + v.inside.label, 100); }
    }
    // Water: a clipped body that rises (or falls) between two levels, its surface an ellipse (a slanted top on a box).
    if (v.fill && geo) {
      var F0 = clamp(+(v.fill.from || 0), 0, 1), F1 = clamp(v.fill.to == null ? 1 : +v.fill.to, 0, 1);
      var liq = el('g', { class: 'mx-liquid' }, under), surf, rect, front, side;
      if (geo.cuboid) {
        front = el('rect', {}, liq); side = el('polygon', { class: 'is-side' }, liq); surf = el('polygon', { class: 'mx-liquid-top' }, under);
      } else {
        var cid = uid('mxc'), cp = el('clipPath', { id: cid }, defs(s));
        sil.forEach(function (a) { el(a[0], a[1], cp); });
        liq.setAttribute('clip-path', 'url(#' + cid + ')');
        rect = el('rect', { x: 0, width: W, height: H }, liq);
        surf = el('ellipse', { class: 'mx-liquid-top' }, under);
      }
      var lx = cx - geo.r - 14, fl = v.fill.label ? txt(dg, lx, 0, v.fill.label, 'mx-dimt is-water', 'end') : null;
      var put = function (t) {
        var g = geo.surf(F0 + (F1 - F0) * t);
        if (geo.cuboid) {
          front.setAttribute('x', g.front[0]); front.setAttribute('y', g.front[1]); front.setAttribute('width', g.front[2]); front.setAttribute('height', Math.max(0, g.front[3]));
          side.setAttribute('points', g.side.map(function (p) { return p.join(','); }).join(' '));
          surf.setAttribute('points', g.poly.map(function (p) { return p.join(','); }).join(' '));
        } else {
          rect.setAttribute('y', g.y);
          surf.setAttribute('cx', cx); surf.setAttribute('cy', g.y); surf.setAttribute('rx', Math.max(0, g.rx)); surf.setAttribute('ry', Math.max(0, g.ry));
        }
        if (fl) fl.setAttribute('y', g.y + 5);
      };
      q.tw(K + 'fill' + F0 + '>' + F1, 500, 1800, put, ease);
      if (v.fill.rise) {
        var ya1 = geo.surf(F0).y, ya2 = geo.surf(F1).y, rx2 = cx + geo.r + (lab.h ? 84 : 18), rg2 = el('g', { class: 'mx-dim is-hl' }, dg);
        el('line', { x1: rx2, y1: ya1, x2: rx2, y2: ya2 }, rg2);
        el('line', { x1: rx2 - 6, y1: ya1, x2: rx2 + 6, y2: ya1 }, rg2);
        el('line', { x1: rx2 - 6, y1: ya2, x2: rx2 + 6, y2: ya2 }, rg2);
        txt(rg2, rx2 + 10, (ya1 + ya2) / 2 + 5, v.fill.rise, 'mx-dimt', 'start');
        q.fade(rg2, K + 'rise' + v.fill.rise, 0);
      }
    }
    return s;
  }
  // Solids (or flat shapes) on one upright axis, top to bottom: a hemisphere on a cylinder, a cone on a hemisphere.
  function composite(v, q) {
    var W = 380, H = 290, s = svgBox(W, H, 'mx-shape mx-composite'), parts = v.parts || [], cx = W / 2, K = 'cp' + parts.map(function (p) { return p.kind; }).join('+') + ':';
    var flat = parts.every(function (p) { return /^(triangle|rectangle|trapezium)$/.test(p.kind); });
    var rad = Math.max.apply(null, parts.map(function (p) { var d = p.dims || {}; return d.r || (d.b ? d.b / 2 : 0) || 1; }));
    var units = parts.map(function (p) { var d = p.dims || {}; return p.kind === 'hemisphere' ? (d.r || rad) : p.kind === 'sphere' ? 2 * (d.r || rad) : d.h || rad; });
    var total = sum(units) || 1;
    var k = Math.min(230 / total, 110 / rad), rw = rad * k, ry = flat ? 0 : Math.max(10, rw * .24), y = (H - total * k) / 2 + (flat ? 0 : 6);
    var body = el('g', { class: 'mx-solid' }, s), add = [];
    function lab(x1, y1, x2, y2, t, hl, off, key) {
      if (!t) return;
      var g = el('g', { class: 'mx-dim' + (hl ? ' is-hl' : '') }, s);
      el('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, g);
      txt(g, (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], t, 'mx-dimt', off[0] > 0 ? 'start' : off[0] < 0 ? 'end' : 'middle');
      add.push([g, key + t + (hl ? 'h' : '')]);
    }
    parts.forEach(function (p, i) {
      var d = p.dims || {}, L = p.labels || {}, hu = units[i] * k, top = y, bot = y + hu, first = i === 0, last = i === parts.length - 1, r = (d.r || (d.b ? d.b / 2 : rad)) * k;
      if (p.kind === 'cylinder') {
        el('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + (cx - r) + ' ' + bot + 'A' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + bot + 'L' + (cx + r) + ' ' + top, class: 'mx-face' }, body);
        if (first) el('ellipse', { cx: cx, cy: top, rx: r, ry: ry, class: 'mx-face mx-top' }, body);
        if (last) el('path', { d: 'M' + (cx - r) + ' ' + bot + 'A' + r + ' ' + ry + ' 0 0 1 ' + (cx + r) + ' ' + bot, class: 'mx-hidden' }, body);
      } else if (p.kind === 'hemisphere') {
        el('path', { d: 'M' + (cx - r) + ' ' + (first ? bot : top) + 'A' + r + ' ' + hu + ' 0 0 ' + (first ? 1 : 0) + ' ' + (cx + r) + ' ' + (first ? bot : top), class: 'mx-face' }, body);
      } else if (p.kind === 'cone') {
        if (first) el('path', { d: 'M' + cx + ' ' + top + 'L' + (cx - r) + ' ' + bot + (last ? 'A' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + bot : 'L' + (cx + r) + ' ' + bot) + 'Z', class: 'mx-face' }, body);
        else el('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + cx + ' ' + bot + 'L' + (cx + r) + ' ' + top, class: 'mx-face' }, body);
        el('line', { x1: cx, y1: top, x2: cx, y2: bot, class: 'mx-hidden' }, body);
        if (L.l) lab(first ? cx : cx + r, top, first ? cx + r : cx, bot, L.l, p.hl === 'l', [14, -4], 'l' + i);
      } else if (p.kind === 'triangle') {
        el('path', { d: 'M' + (cx - r) + ' ' + bot + 'L' + cx + ' ' + top + 'L' + (cx + r) + ' ' + bot + (last ? 'Z' : ''), class: 'mx-face' }, body);
      } else if (p.kind === 'rectangle' || p.kind === 'trapezium') {
        el('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + (cx - r) + ' ' + bot + 'L' + (cx + r) + ' ' + bot + 'L' + (cx + r) + ' ' + top + (first ? 'Z' : ''), class: 'mx-face' }, body);
      } else if (p.kind === 'sphere') {
        el('circle', { cx: cx, cy: (top + bot) / 2, r: hu / 2, class: 'mx-face' }, body);
      }
      if (!last) {
        if (flat) el('line', { x1: cx - r, x2: cx + r, y1: bot, y2: bot, class: 'mx-hidden' }, body);
        else el('ellipse', { cx: cx, cy: bot, rx: r, ry: ry, class: 'mx-hidden' }, body);
      }
      if (L.h) { var left = String(L.h).length > 6; lab(left ? cx - rw - 22 : cx + rw + 22, top, left ? cx - rw - 22 : cx + rw + 22, bot, L.h, p.hl === 'h', [left ? -8 : 8, 4], 'h' + i); }
      var join = p.kind === 'triangle' ? bot : (p.kind === 'hemisphere' || p.kind === 'cone') ? (first ? bot : top) : top;
      if (L.r) lab(cx, join, cx + r, join, L.r, p.hl === 'r', [0, -8], 'r' + i);
      if (L.b && last) lab(cx - r, bot + 12, cx + r, bot + 12, L.b, p.hl === 'b', [0, 16], 'b' + i);
      y = bot;
    });
    Array.prototype.forEach.call(body.children, function (n, i) { q.draw(n, K + 'f' + i, 900, 160); });
    add.forEach(function (a) { q.fade(a[0], K + a[1], 200); });
    return s;
  }
  // A net: the solid on the left, then its surface laid flat (a cylinder's curved side unrolls into a rectangle, a cone's
  // into a sector).
  function net(v, q) {
    var W = 520, H = 290, s = svgBox(W, H, 'mx-shape mx-net'), lab = v.labels || {}, d = v.dims || {}, hl = v.hl, K = 'net' + v.kind + ':';
    var sol = el('g', { class: 'mx-solid' }, s), out = el('g', {}, s), dl = [];
    function dim(x1, y1, x2, y2, key, off) {
      if (!lab[key]) return;
      var n = el('g', { class: 'mx-dim' + (isHl(hl, key) ? ' is-hl' : '') }, out);
      el('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, n);
      txt(n, (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], lab[key], 'mx-dimt', off[0] > 0 ? 'start' : off[0] < 0 ? 'end' : 'middle');
      dl.push([n, key]);
    }
    function word(x, y, key, anchor) {
      if (!lab[key]) return;
      var t = txt(out, x, y, lab[key], 'mx-dimt' + (isHl(hl, key) ? ' is-hl' : ''), anchor);
      dl.push([t, key]);
    }
    if (v.kind === 'cone') {
      var cx = 70, top = 80, bot = 200, rw = 46, ry = 12;
      el('path', { d: 'M' + cx + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'Z', class: 'mx-face' }, sol);
      Array.prototype.forEach.call(sol.children, function (n, i) { q.draw(n, K + 's' + i, 800, 200); });
      // The sector: its radius is the slant height, its arc is the base's circumference (angle = 360 × r ÷ l).
      var l = d.l || 10, r = d.r || 4, theta = d.angle || 360 * r / l, wide = theta > 180, Rp = wide ? 96 : 132, ox = wide ? 228 : 290, oy = wide ? 132 : 36, cr = Rp * r / l;
      var sec = el('path', { class: 'mx-face mx-netface' }, out), a0 = Math.PI / 2 - theta * Math.PI / 360;
      q.tw(K + 'sector' + theta, 300, 1600, function (k) {
        var th = theta * k * Math.PI / 180, a = a0 + (theta * Math.PI / 180 - th) / 2, b = a + th;
        sec.setAttribute('d', 'M' + ox + ' ' + oy + 'L' + (ox + Rp * Math.cos(a)) + ' ' + (oy + Rp * Math.sin(a)) + 'A' + Rp + ' ' + Rp + ' 0 ' + (th > Math.PI ? 1 : 0) + ' 1 ' + (ox + Rp * Math.cos(b)) + ' ' + (oy + Rp * Math.sin(b)) + 'Z');
      }, ease);
      var base = el('circle', { cx: W - 14 - cr, cy: oy + Rp - cr + 10, r: cr, class: 'mx-face mx-top' }, out);
      q.pop(base, K + 'base', 300);
      dim(ox, oy, ox + Rp * Math.cos(a0), oy + Rp * Math.sin(a0), 'l', [10, -6]);
      word(ox, Math.min(H - 6, oy + Rp + 24), 'arc');
      word(ox, oy + 40, 'angle');
      dim(W - 14 - cr, oy + Rp - cr + 10, W - 14, oy + Rp - cr + 10, 'r', [0, -6]);
    } else {
      var cx2 = 66, t2 = 86, b2 = 196, rw2 = 40, ry2 = 11;
      el('path', { d: 'M' + (cx2 - rw2) + ' ' + t2 + 'L' + (cx2 - rw2) + ' ' + b2 + 'A' + rw2 + ' ' + ry2 + ' 0 0 0 ' + (cx2 + rw2) + ' ' + b2 + 'L' + (cx2 + rw2) + ' ' + t2, class: 'mx-face' }, sol);
      el('ellipse', { cx: cx2, cy: t2, rx: rw2, ry: ry2, class: 'mx-face mx-top' }, sol);
      Array.prototype.forEach.call(sol.children, function (n, i) { q.draw(n, K + 's' + i, 800, 200); });
      // The curved side unrolls into a rectangle (width = the circumference, 2πr); the two circles sit on its ends.
      var r2 = d.r || 3, h2 = d.h || 8, kk = Math.min(320 / (2 * Math.PI * r2), 270 / (h2 + 4 * r2)), rwid = 2 * Math.PI * r2 * kk, rh = h2 * kk, cr2 = r2 * kk;
      var rx = 140 + (360 - rwid) / 2, ryy = (H - rh) / 2;
      var rect = el('rect', { x: rx, y: ryy, width: rwid, height: rh, class: 'mx-face mx-netface' }, out);
      q.grow(rect, K + 'roll', 300, 'left', 1300);
      var c1 = el('circle', { cx: rx + cr2 + 8, cy: ryy - cr2, r: cr2, class: 'mx-face mx-top' }, out), c2 = el('circle', { cx: rx + cr2 + 8, cy: ryy + rh + cr2, r: cr2, class: 'mx-face mx-top' }, out);
      q.pop(c1, K + 'c1', 250); q.pop(c2, K + 'c2', 250);
      dim(rx + 4, ryy + rh / 2, rx + rwid - 4, ryy + rh / 2, 'w', [0, -8]);
      dim(rx + rwid + 12, ryy, rx + rwid + 12, ryy + rh, 'h', [8, 4]);
      dim(rx + cr2 + 8, ryy - cr2, rx + 2 * cr2 + 8, ryy - cr2, 'r', [12, 5]);
    }
    dl.forEach(function (a) { q.fade(a[0], K + 'd' + a[1] + lab[a[1]] + (isHl(hl, a[1]) ? 'h' : ''), 160); });
    return s;
  }
  // The trapezoidal rule: the heights at equal steps, the strips, and which heights count once (the ends) or twice.
  function trap(v, q) {
    var W = 520, H = 280, L = 30, Rm = 20, T = 24, B = 44, ys = (v.ys || []).map(Number), n = ys.length - 1, topv = Math.max.apply(null, ys.concat([1]));
    var X = function (i) { return L + i / n * (W - L - Rm); }, Y = function (y) { return T + (1 - y / topv) * (H - T - B); };
    var s = svgBox(W, H, 'mx-trap'), K = 'tr' + ys.join(',') + ':';
    q.draw(el('line', { x1: L, x2: W - Rm, y1: Y(0), y2: Y(0), class: 'mx-axisline' }, s), K + 'ax', 400, 0);
    var top = el('path', { d: 'M' + ys.map(function (y, i) { return X(i) + ' ' + Y(y); }).join('L'), class: 'mx-trapedge' }, s);
    ys.forEach(function (y, i) {
      if (i < n) {
        var strip = el('path', { d: 'M' + X(i) + ' ' + Y(0) + 'L' + X(i) + ' ' + Y(y) + 'L' + X(i + 1) + ' ' + Y(ys[i + 1]) + 'L' + X(i + 1) + ' ' + Y(0) + 'Z', class: 'mx-strip' + (i % 2 ? ' is-alt' : '') }, s);
        q.grow(strip, K + 'st' + i, 130, 'bottom', 500);
      }
    });
    s.appendChild(top);
    q.draw(top, K + 'edge', 1000, 300);
    ys.forEach(function (y, i) {
      var end = i === 0 || i === n, grp = v.hl === 'ends' ? end : v.hl === 'middle' ? !end : false;
      var g = el('g', { class: 'mx-hgt' + (grp ? ' is-hl' : '') + (v.hl === 'middle' && !end ? ' is-twice' : '') }, s);
      el('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(y), class: 'mx-height' }, g);
      if (v.labels !== false) txt(g, X(i), Y(y) - 8, nice(y), 'mx-tick');
      txt(g, X(i), Y(0) + 18, v.names ? v.names[i] : 'y' + String(i + 1).split('').map(function (c) { return String.fromCharCode(8320 + +c); }).join(''), 'mx-tick');
      q.fade(g, K + 'h' + i + (grp ? 'h' : ''), 70);
    });
    if (v.h != null) { var ht = txt(s, (X(0) + X(1)) / 2, Y(0) + 36, 'h = ' + v.h, 'mx-dimt is-hl'); q.pop(ht, K + 'hh', 100); }
    if (v.hl === 'ends' || v.hl === 'middle') { var note = txt(s, L, 14, v.hl === 'ends' ? 'first + last: once each' : 'the middle ones: twice', 'mx-shadet is-up', 'start'); q.fade(note, K + 'note' + v.hl, 0); }
    return s;
  }

  // ================= Counting =================
  // Boxes for the choices made one after another: each box gets its number of options (a tile from the pool flies in
  // when there is one), the × signs pop in between, and the answer comes last.
  function slots(v, q) {
    var boxes = v.boxes || [], n = boxes.length || 1, pool = v.pool || null, op = v.op || '×';
    var W = 520, gap = 30, bw = Math.min(68, (W - 40 - (n - 1) * gap) / n), bh = Math.min(76, bw * 1.15);
    var py = pool ? 34 : 0, fills = pool && boxes.some(function (b) { return b.fill != null; }), by = py + (pool ? (fills ? 76 : 46) : 18), H = by + bh + (v.result != null ? 92 : 56);
    var s = svgBox(W, H, 'mx-slots'), K = 'sl:' + (pool ? pool.join('') : '') + ':';
    var x0 = (W - (n * bw + (n - 1) * gap)) / 2, BX = function (i) { return x0 + i * (bw + gap); };
    var tiles = [];
    if (pool) {
      var tw = Math.min(34, (W - 40) / pool.length - 6), tx0 = (W - (pool.length * (tw + 6) - 6)) / 2;
      pool.forEach(function (p, i) {
        var g = el('g', { class: 'mx-tile' }, s);
        el('rect', { x: tx0 + i * (tw + 6), y: py - tw / 2, width: tw, height: tw, rx: 7 }, g);
        txt(g, tx0 + i * (tw + 6) + tw / 2, py + 6, p, 'mx-tilet');
        q.pop(g, K + 'pool' + i, 50, 360);
        tiles.push({ g: g, x: tx0 + i * (tw + 6) + tw / 2, y: py, used: false, label: String(p) });
      });
      if (v.poolLabel) txt(s, 12, 14, v.poolLabel, 'mx-axlab', 'start');
    }
    var order = v.order || boxes.map(function (b, i) { return i; });
    var parts = boxes.map(function (b, i) {
      var g = el('g', { class: 'mx-slot' + (isHl(v.hl, i) || b.hl ? ' is-hl' : '') }, s);
      el('rect', { x: BX(i), y: by, width: bw, height: bh, rx: 10 }, g);
      if (b.label != null) txt(s, BX(i) + bw / 2, by + bh + 20, b.label, 'mx-tick');
      if (b.note) txt(s, BX(i) + bw / 2, by + bh + 36, b.note, 'mx-tick is-soft');
      q.fade(g, K + 'box' + i + n, 40, 300);
      return g;
    });
    order.forEach(function (i, step) {
      var b = boxes[i] || {}, cxb = BX(i) + bw / 2;
      var g = parts[i];
      if (b.fill != null && pool) {
        var t = tiles.filter(function (tt) { return !tt.used && tt.label === String(b.fill); })[0] || tiles.filter(function (tt) { return !tt.used; })[0];
        if (t) {
          t.used = true;
          var ts = Math.min(28, bw * .7), ty = by - ts / 2 - 6;
          var fg = el('g', { transform: 'translate(' + cxb + ',' + ty + ')' }, s), inner = el('g', { class: 'mx-tile is-moved' }, fg);
          el('rect', { x: -ts / 2, y: -ts / 2, width: ts, height: ts, rx: 6 }, inner);
          txt(inner, 0, 6, b.fill, 'mx-tilet');
          q.anim(inner, K + 'fly' + i + b.fill, 300, [{ transform: 'translate(' + (t.x - cxb) + 'px,' + (t.y - ty) + 'px)', opacity: 1 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.5,0,.2,1)' });
          t.g.classList.add('is-used');
          q.anim(t.g, K + 'use' + i + b.fill, 0, [{ opacity: 1 }, { opacity: .25 }], { duration: 300, delay: 0 });
        }
      }
      var big = txt(g, cxb, by + bh / 2 + 10, b.n == null ? '' : String(b.n), 'mx-slotn');
      if (bw < 54 || String(b.n).length > 2) big.style.fontSize = Math.max(14, Math.min(28, bw * .5, bw * 1.6 / Math.max(1, String(b.n).length))) + 'px';
      q.pop(big, K + 'n' + i + ':' + b.n, step === 0 ? 300 : 420, 520);
      if (i < n - 1 && op) { var o = txt(s, BX(i) + bw + gap / 2, by + bh / 2 + 9, op, 'mx-op'); q.pop(o, K + 'op' + i + op, 0, 360); }
    });
    if (v.result != null) {
      var rt = txt(s, W / 2, H - 22, '= ' + v.result, 'mx-slotres');
      q.pop(rt, K + 'res' + v.result, 400, 600);
    }
    return s;
  }
  // Outcomes or arrangements written out, a row at a time; the ones that count light up, and they're counted.
  function listing(v, q) {
    var rows = v.rows || [], N = rows.length, per = v.perCol || (N > 18 ? 9 : N > 8 ? Math.ceil(N / 2) : N), cols = Math.ceil(N / per) || 1;
    var width = Math.max.apply(null, rows.map(function (r) { return list(r).length; }).concat([1]));
    var tw = Math.min(32, ((520 - 30) / cols - 18) / width - 4), rh = tw + 8, colW = width * (tw + 4) + 22;
    var W = 520, x0 = (W - cols * colW) / 2 + 10, y0 = v.head ? 34 : 14, H = y0 + per * rh + (v.count ? 44 : 12);
    var s = svgBox(W, H, 'mx-list'), K = 'li' + N + 'x' + width + ':', cmap = v.colors || {}, hl = list(v.hl), hits = 0;
    if (v.head) list(v.head).forEach(function (h, j) { txt(s, x0 + j * (tw + 4) + tw / 2, 18, h, 'mx-tick'); });
    rows.forEach(function (r, i) {
      var c = Math.floor(i / per), rr = i % per, on = hl.indexOf(i) >= 0;
      var g = el('g', { class: 'mx-lrow' + (on ? ' is-hl' : '') }, s);
      list(r).forEach(function (t, j) {
        var x = x0 + c * colW + j * (tw + 4), y = y0 + rr * rh;
        var tg = el('g', { class: 'mx-tile' }, g);
        var rc = el('rect', { x: x, y: y, width: tw, height: tw, rx: 6 }, tg);
        if (cmap[t]) { rc.setAttribute('style', 'fill:' + colour(cmap[t]) + ';fill-opacity:.85'); }
        txt(tg, x + tw / 2, y + tw / 2 + 5, t, 'mx-tilet');
      });
      q.rise(g, K + 'r' + i + list(r).join(''), N > 12 ? 45 : 90);
      if (on) hits++;
    });
    if (hl.length) {
      rows.forEach(function (r, i) {
        if (hl.indexOf(i) < 0) return;
        var c = Math.floor(i / per), rr = i % per, x = x0 + c * colW - 5, y = y0 + rr * rh - 4;
        var ring = el('rect', { x: x, y: y, width: list(r).length * (tw + 4) + 6, height: tw + 8, rx: 9, class: 'mx-lring' }, s);
        q.pop(ring, K + 'hl' + i, 140, 380);
      });
    }
    if (v.count) {
      var ct = txt(s, W / 2, H - 14, '', 'mx-count');
      var label = typeof v.count === 'string' ? v.count : (hl.length ? ' of ' + N : ' outcomes');
      var target = hl.length ? hits : N;
      countTo(ct, q, K + 'cnt' + target + label, 200, target, 700, function (x) { return Math.round(x) + label; });
    }
    return s;
  }

  // ================= Probability =================
  function rng(seed) { var t = seed >>> 0; return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  // A jar of coloured balls: they drop in, the ones that count light up, a ball can be picked out, and the fraction shows.
  function bag(v, q) {
    var groups = (v.groups || []).map(function (g, i) { return { label: String(g.label == null ? '' : g.label), n: Math.max(0, Math.round(+g.n || 0)), c: colour(g.c || g.label, i) }; });
    var N = sum(groups.map(function (g) { return g.n; })), W = 520, H = 290, s = svgBox(W, H, 'mx-bag'), K = 'bag' + groups.map(function (g) { return g.label + g.n; }).join(',') + ':';
    var r = N <= 6 ? 24 : N <= 12 ? 20 : N <= 20 ? 16 : N <= 32 ? 13 : N <= 50 ? 10 : 8, jx = 24, jw = 262, per = Math.floor((jw - 18) / (2 * r + 3));
    var jh = clamp(Math.ceil(N / per) * (2 * r + 1) + 70, 130, 226), jy = 272 - jh;
    var jar = el('path', { d: 'M' + jx + ' ' + jy + 'L' + jx + ' ' + (jy + jh - 26) + 'Q' + jx + ' ' + (jy + jh) + ' ' + (jx + 26) + ' ' + (jy + jh) + 'L' + (jx + jw - 26) + ' ' + (jy + jh) + 'Q' + (jx + jw) + ' ' + (jy + jh) + ' ' + (jx + jw) + ' ' + (jy + jh - 26) + 'L' + (jx + jw) + ' ' + jy, class: 'mx-jar' }, s);
    el('line', { x1: jx - 8, x2: jx + 10, y1: jy, y2: jy, class: 'mx-jarrim' }, s);
    el('line', { x1: jx + jw - 10, x2: jx + jw + 8, y1: jy, y2: jy, class: 'mx-jarrim' }, s);
    q.draw(jar, K + 'jar', 700, 200);
    var order = [], rand = rng(N * 7919 + groups.length);
    groups.forEach(function (g, gi) { for (var i = 0; i < g.n; i++) order.push(gi); });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
    var hl = list(v.hl).map(String), any = hl.length > 0, pickAt = -1, grads = {};
    if (v.pick != null) for (var p = order.length - 1; p >= 0; p--) if (groups[order[p]] && groups[order[p]].label.toLowerCase() === String(v.pick).toLowerCase()) { pickAt = p; break; }
    var balls = order.map(function (gi, idx) {
      var g = groups[gi], col = idx % per, row = Math.floor(idx / per);
      var x = jx + 10 + r + col * (2 * r + 3) + (row % 2 ? r * .5 : 0) + (rand() - .5) * 2, y = jy + jh - 6 - r - row * (2 * r + 1) + (rand() - .5) * 2;
      if (row % 2 && col === per - 1) x -= r;
      grads[g.c] = grads[g.c] || ballGrad(s, g.c);
      var on = !any || hl.some(function (h) { return h.toLowerCase() === g.label.toLowerCase(); });
      var bw = el('g', { class: 'mx-bwrap' + (any && !on ? ' is-dim' : '') }, s), c = el('circle', { cx: x, cy: y, r: r, fill: grads[g.c], class: 'mx-ball' + (any && on ? ' is-hl' : '') }, bw);
      q.anim(c, K + 'b' + idx, N > 30 ? 22 : 45, [{ transform: 'translateY(-' + (y - jy + 60) + 'px)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'translateY(0)', offset: .75, easing: 'ease-out' }, { transform: 'translateY(-5px)', offset: .87, easing: 'ease-in' }, { transform: 'none', opacity: 1 }],
        { duration: 650, easing: 'cubic-bezier(.55,0,1,.45)' });
      return { c: c, w: bw, x: x, y: y, g: g, on: on };
    });
    if (any) balls.forEach(function (b, i) {
      if (b.on) q.anim(b.c, K + 'hl' + i + hl.join(','), 0, [{ strokeWidth: 0 }, { strokeWidth: 8, offset: .5 }, { strokeWidth: 3 }], { duration: 700, delay: 0 });
      else q.anim(b.w, K + 'dim' + i + hl.join(','), 0, [{ opacity: 1 }, { opacity: .28 }], { duration: 600 });
    });
    if (any) q.at(500);
    if (pickAt >= 0) {
      var pb = balls[pickAt];
      pb.c.setAttribute('class', 'mx-ball is-gap');
      pb.c.setAttribute('fill', 'none');
      var tx = jx + jw / 2, ty = jy - 26;
      var pg = el('g', { transform: 'translate(' + tx + ',' + ty + ')' }, s), pc = el('circle', { cx: 0, cy: 0, r: Math.max(r, 14), fill: grads[pb.g.c], class: 'mx-ball is-picked' }, pg);
      q.anim(pc, K + 'pick' + v.pick, 300, [{ transform: 'translate(' + (pb.x - tx) + 'px,' + (pb.y - ty) + 'px)' }, { transform: 'translate(' + (pb.x - tx) + 'px,' + (pb.y - ty - 20) + 'px)', offset: .2 }, { transform: 'none' }], { duration: 1000, easing: 'cubic-bezier(.4,0,.2,1)' });
      var pl = txt(s, tx + Math.max(r, 14) + 10, ty + 5, v.pickLabel || 'picked', 'mx-plabel', 'start');
      q.fade(pl, K + 'pickl' + v.pick, 600);
    }
    // Beside the jar: what's in it, then the fraction that counts.
    var lx = 312, ly = 52;
    groups.forEach(function (g, gi) {
      var on = !any || hl.some(function (h) { return h.toLowerCase() === g.label.toLowerCase(); }), row = el('g', { class: 'mx-leg' + (any && !on ? ' is-dim' : '') }, s);
      el('circle', { cx: lx + 10, cy: ly + gi * 30 - 5, r: 9, fill: grads[g.c] || ballGrad(s, g.c), class: 'mx-ball' }, row);
      txt(row, lx + 28, ly + gi * 30, g.n + ' ' + g.label, 'mx-legt', 'start');
      q.fade(row, K + 'leg' + gi + (on ? 'h' : ''), 60);
    });
    var ty2 = ly + groups.length * 30 + 10;
    var tot = txt(s, lx, ty2, N + ' ' + (v.unit || 'in the bag'), 'mx-legt is-soft', 'start');
    q.fade(tot, K + 'tot' + N, 0);
    (v.out || []).forEach(function (o, oi) {
      var og = el('g', { class: 'mx-out' }, s), oc = colour(o.c || o.label, 0);
      for (var k2 = 0; k2 < (o.n || 1); k2++) el('circle', { cx: lx + 10 + k2 * 22, cy: ty2 + 30 + oi * 26, r: 9, fill: ballGrad(s, oc), class: 'mx-ball' }, og);
      txt(og, lx + 10 + (o.n || 1) * 22, ty2 + 35 + oi * 26, (o.label || '') + ' taken out', 'mx-tick', 'start');
      q.fade(og, K + 'out' + oi + o.label, 100);
    });
    if (any && v.frac !== false) {
      var hitN = sum(groups.filter(function (g) { return hl.some(function (h) { return h.toLowerCase() === g.label.toLowerCase(); }); }).map(function (g) { return g.n; }));
      var fy = H - 34, fr = el('g', { class: 'mx-frac' }, s);
      txt(fr, lx + 30, fy - 12, String(v.frac || hitN), 'mx-fracn');
      el('line', { x1: lx + 6, x2: lx + 54, y1: fy - 4, y2: fy - 4, class: 'mx-fracbar' }, fr);
      txt(fr, lx + 30, fy + 20, String(v.of || N), 'mx-fracn');
      if (v.say) txt(fr, lx + 66, fy + 4, v.say, 'mx-legt', 'start');
      q.pop(fr, K + 'frac' + hitN + '/' + N + (v.frac || ''), 300, 560);
    }
    return s;
  }
  function dieFace(g, x, y, sz, val) {
    el('rect', { x: x, y: y, width: sz, height: sz, rx: sz * .2, class: 'mx-die' }, g);
    var P = { 1: [[.5, .5]], 2: [[.27, .27], [.73, .73]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.27, .23], [.73, .23], [.27, .5], [.73, .5], [.27, .77], [.73, .77]] }[val] || [];
    P.forEach(function (p) { el('circle', { cx: x + p[0] * sz, cy: y + p[1] * sz, r: sz * .085, class: 'mx-pip' }, g); });
  }
  // Two dice (or any two lists): the grid of outcomes fills in a wave, the ones that count light up and are counted.
  function dice(v, q) {
    var rows = v.rows || [1, 2, 3, 4, 5, 6], cols = v.cols || [1, 2, 3, 4, 5, 6], op = v.op || '+', nR = rows.length, nC = cols.length;
    var val = function (i, j) {
      if (v.cells) return v.cells[i][j];
      var a = +rows[i], b = +cols[j];
      return op === '×' || op === '*' ? a * b : op === '-' || op === '−' ? Math.abs(a - b) : op === 'max' ? Math.max(a, b) : op === 'pair' ? '' + rows[i] + ',' + cols[j] : a + b;
    };
    var lit = (list(v.hl).length || (v.hlCells || []).length) && v.count !== false, cs = Math.min(38, 250 / Math.max(nR, nC)), hx = 58, hy = 62, W = 520, H = Math.max(hy + nR * cs + 26, hy + (lit ? (v.frac === false ? 84 : 166) : 84)), s = svgBox(W, H, 'mx-dice'), K = 'dc' + rows.join('') + '|' + cols.join('') + op + ':';
    var face = function (x) { return v.faces !== false && /^[1-6]$/.test(String(x)); };
    if (v.colsLabel) txt(s, hx + nC * cs / 2, 13, v.colsLabel, 'mx-axlab');
    if (v.rowsLabel) { var rl = txt(s, 14, hy + nR * cs / 2, v.rowsLabel, 'mx-axlab'); rl.setAttribute('transform', 'rotate(-90 14 ' + (hy + nR * cs / 2) + ')'); }
    cols.forEach(function (c, j) {
      var g = el('g', {}, s), x = hx + j * cs + cs * .12, sz = cs * .76;
      if (face(c)) dieFace(g, x, hy - cs * .95, sz, +c); else txt(g, hx + j * cs + cs / 2, hy - 10, c, 'mx-tick is-head');
      q.pop(g, K + 'ch' + j, 40, 320);
    });
    rows.forEach(function (c, i) {
      var g = el('g', {}, s), sz = cs * .76;
      if (face(c)) dieFace(g, hx - cs * .95, hy + i * cs + cs * .12, sz, +c); else txt(g, hx - 10, hy + i * cs + cs / 2 + 5, c, 'mx-tick is-head', 'end');
      q.pop(g, K + 'rh' + i, 40, 320);
    });
    var hits = [], hl = list(v.hl).map(String), hc = (v.hlCells || []).map(function (p) { return p.join(','); });
    var base = q.t, fresh = q.fresh(K + 'cells');
    for (var i = 0; i < nR; i++) for (var j = 0; j < nC; j++) {
      var x = hx + j * cs, y = hy + i * cs, value = val(i, j), on = hl.indexOf(String(value)) >= 0 || hc.indexOf(i + ',' + j) >= 0;
      var g = el('g', { class: 'mx-cell' + (on ? ' is-hl' : '') }, s);
      el('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 5 }, g);
      txt(g, x + cs / 2, y + cs / 2 + 5, value, 'mx-cellt');
      if (fresh) (function (g, dl) { q.job(function () { g.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: dl, fill: 'backwards', easing: 'ease-out' }); }); })(g, base + (i + j) * 40);
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
      if (on) hits.push(g);
    }
    if (fresh) q.t = base + (nR + nC) * 40 + 260;
    var start = q.t, freshHl = q.fresh(K + 'hl' + hl.join(',') + hc.join(';'));
    hits.forEach(function (g, k) {
      if (freshHl) q.job(function () { g.querySelector('rect').animate([{ fill: 'rgba(255,200,0,0)' }, { fill: 'rgba(255,200,0,.9)', offset: .4 }, { fill: 'rgba(255,200,0,.45)' }], { duration: 520, delay: start + k * 110, fill: 'backwards' }); });
    });
    if (freshHl) q.t = start + hits.length * 110 + 200;
    var px = hx + nC * cs + 28, N = nR * nC;
    if (v.count === false) { /* only the cells */ } else if (hl.length || hc.length) {
      var big = txt(s, px, hy + 40, '', 'mx-count is-big', 'start');
      var of = txt(s, px, hy + 66, 'out of ' + N + ' outcomes', 'mx-legt is-soft', 'start');
      if (freshHl) q.job(function () { tween(Math.max(1, hits.length * 110), start, function (k) { big.textContent = String(Math.round(hits.length * k)); }, linear); });
      big.textContent = String(hits.length);
      q.fade(of, K + 'of' + N, 0);
      if (v.frac !== false) {
        var fr = el('g', { class: 'mx-frac' }, s), fy = hy + 120;
        txt(fr, px + 30, fy, String(v.frac || hits.length), 'mx-fracn');
        el('line', { x1: px + 4, x2: px + 56, y1: fy + 8, y2: fy + 8, class: 'mx-fracbar' }, fr);
        txt(fr, px + 30, fy + 32, String(v.of || N), 'mx-fracn');
        if (v.say) txt(fr, px + 70, fy + 16, v.say, 'mx-legt', 'start');
        q.pop(fr, K + 'frac' + hits.length + (v.frac || ''), 200, 560);
      }
    } else {
      var all = txt(s, px, hy + 40, N + ' outcomes', 'mx-legt', 'start');
      var how = txt(s, px, hy + 64, nR + ' × ' + nC + ' = ' + N, 'mx-legt is-soft', 'start');
      q.fade(all, K + 'all', 0); q.fade(how, K + 'how', 100);
    }
    return s;
  }
  // A spinner: it spins and stops on a sector; the sectors that count light up, and the fraction shows.
  function spinner(v, q) {
    var secs = (v.sectors || []).map(function (sc, i) { return { label: String(sc.label == null ? '' : sc.label), w: +sc.w || 1, c: colour(sc.c || sc.label, i), t: sc.t }; });
    var tot = sum(secs.map(function (x) { return x.w; })) || 1, W = 520, H = 290, cx = 148, cy = 150, r = 116, s = svgBox(W, H, 'mx-spinner'), K = 'sp' + secs.map(function (x) { return x.label + x.w; }).join(',') + ':';
    var hl = list(v.hl), any = hl.length > 0, on = function (sc, i) { return hl.some(function (h) { return typeof h === 'number' ? h === i : String(h).toLowerCase() === sc.label.toLowerCase(); }); };
    var wheel = el('g', { class: 'mx-wheel' }, s), a = -90, mids = [];
    secs.forEach(function (sc, i) {
      var sweep = sc.w / tot * 360, a1 = a + sweep, r0 = a * Math.PI / 180, r1 = a1 * Math.PI / 180;
      el('path', { d: 'M' + cx + ' ' + cy + 'L' + (cx + r * Math.cos(r0)) + ' ' + (cy + r * Math.sin(r0)) + 'A' + r + ' ' + r + ' 0 ' + (sweep > 180 ? 1 : 0) + ' 1 ' + (cx + r * Math.cos(r1)) + ' ' + (cy + r * Math.sin(r1)) + 'Z', fill: sc.c, class: 'mx-sector' + (any ? (on(sc, i) ? ' is-hl' : ' is-dim') : '') }, wheel);
      mids.push(a + sweep / 2 + 90);
      a = a1;
    });
    el('circle', { cx: cx, cy: cy, r: r, class: 'mx-wheelrim' }, s);
    el('circle', { cx: cx, cy: cy, r: 9, class: 'mx-hub' }, s);
    el('path', { d: 'M' + (cx - 13) + ' ' + (cy - r - 16) + 'L' + (cx + 13) + ' ' + (cy - r - 16) + 'L' + cx + ' ' + (cy - r + 10) + 'Z', class: 'mx-pointer' }, s);
    wheel.style.transformBox = 'view-box';
    wheel.style.transformOrigin = cx + 'px ' + cy + 'px';
    q.pop(wheel, K + 'wheel', 300, 520);
    var fin = v.land != null && secs[v.land] ? (360 - mids[v.land]) % 360 : 0;
    if (v.land != null && secs[v.land]) {
      wheel.style.transform = 'rotate(' + fin + 'deg)';
      q.anim(wheel, K + 'spin' + v.land, 2700, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (fin + 1080) + 'deg)' }], { duration: 2800, easing: 'cubic-bezier(.12,.68,.22,1)' });
    }
    // The sectors' names or numbers, upright, where the sectors stop.
    var names = el('g', {}, s);
    secs.forEach(function (sc, i) {
      var t = sc.t != null ? String(sc.t) : sc.label.length <= 3 ? sc.label : '';
      if (!t) return;
      var m = (mids[i] - 90 + fin) * Math.PI / 180;
      txt(names, cx + r * .66 * Math.cos(m), cy + r * .66 * Math.sin(m) + 5, t, 'mx-sectort');
    });
    q.fade(names, K + 'names' + fin, 0, 300);
    if (any) secs.forEach(function (sc, i) {
      var p = wheel.children[i * 2];
      if (on(sc, i)) q.anim(p, K + 'hl' + i + hl.join(','), 0, [{ strokeWidth: 0 }, { strokeWidth: 9, offset: .5 }, { strokeWidth: 4 }], { duration: 700 });
      else q.anim(p, K + 'dim' + i + hl.join(','), 0, [{ opacity: 1 }, { opacity: .3 }], { duration: 500 });
    });
    if (any) q.at(450);
    // Beside it: each sector (or colour) and how many, then the fraction.
    var lx = 300, ly = 48, seen = {}, rows = [];
    secs.forEach(function (sc, i) { var k = sc.label.toLowerCase(); if (seen[k] == null) { seen[k] = rows.length; rows.push({ sc: sc, n: 0, w: 0, i: i }); } rows[seen[k]].n++; rows[seen[k]].w += sc.w; });
    var equal = secs.every(function (x) { return x.w === secs[0].w; });
    rows.slice(0, 7).forEach(function (rw, k) {
      var isOn = !any || on(rw.sc, rw.i), g = el('g', { class: 'mx-leg' + (any && !isOn ? ' is-dim' : '') }, s);
      el('rect', { x: lx, y: ly + k * 28 - 15, width: 18, height: 18, rx: 4, fill: rw.sc.c }, g);
      txt(g, lx + 28, ly + k * 28, rw.sc.label + (equal && rw.n > 1 ? '  × ' + rw.n : ''), 'mx-legt', 'start');
      q.fade(g, K + 'leg' + k + (isOn ? 'h' : ''), 50);
    });
    if (any && v.frac !== false) {
      var hitW = sum(secs.filter(on).map(function (x) { return x.w; })), fr = el('g', { class: 'mx-frac' }, s), side = rows.length > 5;
      if (side && rows.some(function (rw) { return rw.sc.label.length > 12; }) && v.frac == null) fr.style.display = 'none';
      var fx = side ? 456 : lx + 30, fy = side ? 96 : Math.min(H - 52, ly + Math.min(rows.length, 7) * 28 + 28);
      txt(fr, fx, fy, String(v.frac || (equal ? secs.filter(on).length : hitW)), 'mx-fracn');
      el('line', { x1: fx - 26, x2: fx + 26, y1: fy + 8, y2: fy + 8, class: 'mx-fracbar' }, fr);
      txt(fr, fx, fy + 32, String(v.of || (equal ? secs.length : tot)), 'mx-fracn');
      if (v.say) txt(fr, side ? fx : fx + 40, side ? fy + 58 : fy + 16, v.say, 'mx-legt', side ? 'middle' : 'start');
      q.pop(fr, K + 'frac' + hl.join(',') + (v.frac || ''), 200, 560);
    }
    return s;
  }
  // The probability scale from 0 to 1, with markers sliding to their places.
  function pscale(v, q) {
    var W = 520, H = 150, L = 36, Rm = 36, y = 70, X = function (p) { return L + p * (W - L - Rm); }, s = svgBox(W, H, 'mx-pscale'), K = 'ps:';
    var bar = el('rect', { x: L, y: y - 6, width: W - L - Rm, height: 12, rx: 6, class: 'mx-pbar' }, s);
    q.grow(bar, K + 'bar', 300, 'left', 700);
    [[0, '0'], [.5, '½'], [1, '1']].forEach(function (t) { txt(s, X(t[0]), y + 30, t[1], 'mx-tick is-head'); });
    if (v.words !== false) [[0, 'impossible'], [.25, 'unlikely'], [.5, 'even chance'], [.75, 'likely'], [1, 'certain']].forEach(function (t) { var w = txt(s, X(t[0]), y + 50, t[1], 'mx-tick is-soft'); q.fade(w, K + 'w' + t[1], 30); });
    (v.marks || []).forEach(function (m, i) {
      var p = clamp(+m.v, 0, 1), g = el('g', { transform: 'translate(' + X(p) + ',0)' }, s), inner = el('g', { class: 'mx-pmark' + (m.hl ? ' is-hl' : '') }, g);
      el('path', { d: 'M-9 ' + (y - 24) + 'L9 ' + (y - 24) + 'L0 ' + (y - 8) + 'Z' }, inner);
      txt(inner, 0, y - 32 - (i % 2) * 22, (m.label ? m.label + ' = ' : '') + (m.show || nice(p)), 'mx-plabel');
      q.anim(inner, K + 'm' + i + m.v + m.label, 500, [{ transform: 'translateX(' + (X(0) - X(p)) + 'px)', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: 'none', opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.3,0,.2,1)' });
    });
    return s;
  }
  // A tree of choices, any number of stages deep: branches draw stage by stage, then the path that counts lights up
  // branch by branch (multiply along it) and its result shows at the end.
  function tree(v, q) {
    var roots = v.root || legacyTree(v.levels || []), leaves = [], depth = 0;
    (function walk(nodes, d) { nodes.forEach(function (n) { depth = Math.max(depth, d + 1); if (n.kids && n.kids.length) walk(n.kids, d + 1); else leaves.push(n); }); })(roots, 0);
    var hasOut = leaves.some(function (n) { return n.out; }), W = 520, rowH = leaves.length > 10 ? 28 : leaves.length > 6 ? 36 : 46;
    var H = Math.max(170, leaves.length * rowH + 24), lw = hasOut ? 132 : 40, x0 = 22, colW = (W - x0 - lw) / depth, s = svgBox(W, H, 'mx-tree'), K = 'tr' + depth + 'x' + leaves.length + ':';
    var hl = (v.hl || []).map(function (p) { return list(p).join('>'); }), row = 0, branches = [];
    function place(nodes, d) {
      nodes.forEach(function (n) {
        if (n.kids && n.kids.length) { place(n.kids, d + 1); n.y = sum(n.kids.map(function (k) { return k.y; })) / n.kids.length; }
        else { n.y = 12 + (row + .5) * ((H - 24) / leaves.length); row++; }
      });
    }
    place(roots, 0);
    var ry = sum(roots.map(function (n) { return n.y; })) / roots.length;
    q.pop(el('circle', { cx: x0, cy: ry, r: 5, class: 'mx-node' }, s), K + 'root', 60);
    function drawLevel(nodes, d, px, py, path) {
      nodes.forEach(function (n) {
        var x = x0 + (d + 1) * colW, sx = d === 0 ? px : px + 26, p2 = path.concat([n.label]), key = p2.join('>');
        var on = hl.some(function (h) { return h === key || h.indexOf(key + '>') === 0; });
        branches.push({ d: d, x1: sx, y1: py, x2: x - 6, y2: n.y, n: n, on: on, key: key, leaf: !(n.kids && n.kids.length) });
        if (n.kids && n.kids.length) drawLevel(n.kids, d + 1, x, n.y, p2);
      });
    }
    drawLevel(roots, 0, x0, ry, []);
    for (var d = 0; d < depth; d++) {
      branches.filter(function (b) { return b.d === d; }).forEach(function (b, i) {
        var g = el('g', {}, s);
        var ln = el('line', { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, class: 'mx-branch' }, g);
        q.draw(ln, K + 'b' + b.key, 420, i === 0 ? 260 : 60);
        var lt = txt(g, b.x2 + 6, b.y2 + 5, b.n.label, 'mx-blabel', 'start');
        q.fade(lt, K + 'bl' + b.key, 0);
        if (b.n.p != null) { var pt = txt(g, (b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2 + (b.y2 > b.y1 + 2 ? 16 : -8), b.n.p, 'mx-bp'); q.fade(pt, K + 'bp' + b.key, 0); b.pt = pt; }
        if (b.leaf && b.n.out) { var ot = txt(g, W - 8, b.y2 + 5, b.n.out, 'mx-bout', 'end'); q.fade(ot, K + 'bo' + b.key, 0); b.ot = ot; }
      });
    }
    // The paths that count: a bright line runs along each one, its probabilities glow, and its result pops.
    hl.forEach(function (h) {
      var parts = h.split('>');
      parts.forEach(function (p, i) {
        var key = parts.slice(0, i + 1).join('>'), b = branches.filter(function (x) { return x.key === key; })[0];
        if (!b) return;
        var ln = el('line', { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, class: 'mx-branch is-hl' }, s);
        q.draw(ln, K + 'hl' + h + '|' + i, 420, 300);
        if (b.pt) { b.pt.classList.add('is-hl'); s.appendChild(b.pt); q.pop(b.pt, K + 'hp' + h + '|' + i, 0, 420); }
        if (i === parts.length - 1) {
          if (b.ot) { b.ot.classList.add('is-hl'); s.appendChild(b.ot); q.pop(b.ot, K + 'ho' + h, 200, 520); }
        }
      });
    });
    return s;
  }
  function legacyTree(levels) {
    var clone = function (n) { return { label: n.label, p: n.p, out: n.out }; };
    var roots = (levels[0] || []).map(clone), prev = roots;
    for (var k = 1; k < levels.length; k++) {
      var next = [];
      prev.forEach(function (n, i) { n.kids = (levels[k][i] || []).map(clone); next = next.concat(n.kids); });
      prev = next;
    }
    return roots;
  }
  // Venn diagrams with 2 or 3 sets: the regions that count fill with colour, and every region's number pops in.
  function venn(v, q) {
    var sets = v.sets || ['A', 'B'], three = sets.length >= 3, W = 440, H = three ? 320 : 256, s = svgBox(W, H, 'mx-venn'), K = 'vn' + sets.join(',') + ':';
    var C = three ? [[180, 118, 80], [262, 118, 80], [221, 188, 80]] : [[166, 132, 90], [268, 132, 90]];
    var n = Object.assign({}, v.n || {});
    if (v.only) { if (v.only[0] != null) n.a = v.only[0]; if (v.only[1] != null) n.b = v.only[1]; }
    if (v.both != null) n.ab = v.both;
    if (v.none != null) n.none = v.none;
    var regions = three ? ['a', 'b', 'c', 'ab', 'ac', 'bc', 'abc', 'none'] : ['a', 'b', 'ab', 'none'];
    var expand = function (h) {
      var H2 = String(h);
      if (H2 === 'onlyA') return ['a']; if (H2 === 'onlyB') return ['b']; if (H2 === 'both') return ['ab'];
      if (/^[ABC]$/.test(H2) || H2 === '0' || H2 === '1' || H2 === '2') { var L = /^\d$/.test(H2) ? 'abc'[+H2] : H2.toLowerCase(); return regions.filter(function (r) { return r !== 'none' && r.indexOf(L) >= 0; }); }
      if (/^[ABC](or|∪)[ABC]$/.test(H2)) { var a = H2[0].toLowerCase(), b = H2[H2.length - 1].toLowerCase(); return regions.filter(function (r) { return r !== 'none' && (r.indexOf(a) >= 0 || r.indexOf(b) >= 0); }); }
      return regions.indexOf(H2) >= 0 ? [H2] : [];
    };
    var hl = []; list(v.hl).forEach(function (h) { expand(h).forEach(function (r) { if (hl.indexOf(r) < 0) hl.push(r); }); });
    var uni = el('rect', { x: 10, y: 10, width: W - 20, height: H - 20, rx: 12, class: 'mx-universal' }, s);
    q.draw(uni, K + 'u', 700, 200);
    txt(s, 28, 36, v.u || 'U', 'mx-axlab', 'start');
    var cids = C.map(function (c) { var id = uid('mxv'); el('circle', { cx: c[0], cy: c[1], r: c[2] }, el('clipPath', { id: id }, defs(s))); return id; });
    var mids = C.map(function (c) { var id = uid('mxk'), m = el('mask', { id: id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs(s)); el('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, m); el('circle', { cx: c[0], cy: c[1], r: c[2], fill: '#000' }, m); return id; });
    var fills = el('g', {}, s);
    hl.forEach(function (r) {
      var inside = r === 'none' ? [] : r.split(''), outside = ['a', 'b', 'c'].slice(0, C.length).filter(function (x) { return inside.indexOf(x) < 0; });
      var g = fills;
      inside.forEach(function (x) { g = el('g', { 'clip-path': 'url(#' + cids['abc'.indexOf(x)] + ')' }, g); });
      outside.forEach(function (x) { g = el('g', { mask: 'url(#' + mids['abc'.indexOf(x)] + ')' }, g); });
      var rect = el('rect', { x: 10, y: 10, width: W - 20, height: H - 20, rx: 12, class: 'mx-region' }, g);
      q.anim(rect, K + 'fill' + r, 120, [{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: .55, offset: .75 }, { opacity: 1 }], { duration: 900 });
    });
    C.forEach(function (c, i) {
      var circ = el('circle', { cx: c[0], cy: c[1], r: c[2], class: 'mx-set is-' + 'abc'[i] }, s);
      q.draw(circ, K + 'c' + i, 800, 260);
    });
    var names = three ? [[112, 46], [330, 46], [221, 294]] : [[110, 40], [324, 40]];
    sets.slice(0, C.length).forEach(function (nm, i) { var t = txt(s, names[i][0], names[i][1], nm, 'mx-setname'); q.fade(t, K + 'n' + i + nm, 60); });
    var at = three ? { a: [146, 100], b: [296, 100], c: [221, 222], ab: [221, 88], ac: [180, 168], bc: [262, 168], abc: [221, 140], none: [404, 296] }
      : { a: [122, 138], ab: [217, 138], b: [312, 138], none: [400, 236] };
    regions.forEach(function (r) {
      if (n[r] == null) return;
      var t = txt(s, at[r][0], at[r][1], String(n[r]), 'mx-vnum' + (hl.indexOf(r) >= 0 ? ' is-hl' : ''));
      q.pop(t, K + 'v' + r + n[r] + (hl.indexOf(r) >= 0 ? 'h' : ''), 150, 420);
    });
    if (v.total) { var tt = txt(s, W - 22, 36, String(v.total), 'mx-legt is-hl', 'end'); q.pop(tt, K + 'tot' + v.total, 200); }
    return s;
  }

  // ================= Statistics =================
  // A list of values as chips: they sort themselves into order, then the median, mean, range, mode or quartiles show.
  function dots(v, q) {
    var vals = (v.vals || []).map(Number), n = vals.length, rows = n > 14 ? 2 : 1, per = Math.ceil(n / rows) || 1;
    var W = 520, cw = Math.min(46, (W - 24) / per - 6), ch = Math.min(40, cw * .95), x0 = (W - (per * (cw + 6) - 6)) / 2, y0 = 54, H = y0 + rows * (ch + 12) + 76;
    var s = svgBox(W, H, 'mx-dots'), K = 'dt' + vals.join(',') + ':';
    var P = function (i) { return [x0 + (i % per) * (cw + 6), y0 + Math.floor(i / per) * (ch + 12)]; };
    var idx = vals.map(function (x, i) { return i; }), sorted = v.sort === false ? idx.slice() : idx.slice().sort(function (a, b) { return vals[a] - vals[b] || a - b; });
    var rank = []; sorted.forEach(function (orig, r) { rank[orig] = r; });
    var chips = vals.map(function (x, i) {
      var p = P(rank[i]), g = el('g', { transform: 'translate(' + p[0] + ',' + p[1] + ')' }, s), drop = el('g', {}, g), inner = el('g', { class: 'mx-chip' }, drop);
      el('rect', { x: 0, y: 0, width: cw, height: ch, rx: 8 }, inner);
      txt(inner, cw / 2, ch / 2 + 6, nice(x), 'mx-chipt');
      return { g: g, drop: drop, inner: inner, i: i, r: rank[i] };
    });
    // In, in the order given; then each slides (with a little hop) to its place in order.
    var moved = v.sort !== false && sorted.some(function (o, r) { return o !== r; });
    chips.forEach(function (c) {
      q.anim(c.drop, K + 'in' + c.i, n > 12 ? 40 : 70, [{ transform: 'translateY(-20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300 });
    });
    if (moved && q.fresh(K + 'sort')) {
      var t0 = q.at(900);
      chips.forEach(function (c) {
        var p0 = P(c.i), p1 = P(c.r);
        q.job(function () { c.g.animate([{ transform: 'translate(' + p0[0] + 'px,' + p0[1] + 'px)' }, { transform: 'translate(' + (p0[0] + p1[0]) / 2 + 'px,' + ((p0[1] + p1[1]) / 2 - 26) + 'px)', offset: .5 }, { transform: 'translate(' + p1[0] + 'px,' + p1[1] + 'px)' }], { duration: 800, delay: t0, easing: 'ease-in-out', fill: 'backwards' }); });
      });
      if (v.sortLabel !== false) { var sl = txt(s, W / 2, 24, 'In order, smallest to biggest', 'mx-axlab'); q.fade(sl, K + 'sl', 0); }
    } else if (v.sort !== false) { var sl2 = txt(s, W / 2, 24, 'In order, smallest to biggest', 'mx-axlab'); q.fade(sl2, K + 'sl', 0); }
    var byRank = sorted.map(function (o) { return chips[o]; }), show = v.show, ly = H - 30, say;
    function mark(c, cls, key, adv) { c.inner.classList.add(cls); q.anim(c.inner.firstChild, key, adv == null ? 0 : adv, [{ strokeWidth: 0 }, { strokeWidth: 7, offset: .5 }, { strokeWidth: 3 }], { duration: 600 }); }
    if (show === 'median' || show === 'quartiles') {
      var pairs = Math.floor((n - 1) / 2);
      for (var k = 0; k < pairs; k++) {
        [byRank[k], byRank[n - 1 - k]].forEach(function (c, j) {
          c.inner.classList.add('is-out');
          q.anim(c.inner, K + 'out' + k + '-' + j, j ? 260 : 0, [{ opacity: 1 }, { opacity: .25 }], { duration: 300 });
        });
      }
      var mids = n % 2 ? [byRank[(n - 1) / 2]] : [byRank[n / 2 - 1], byRank[n / 2]];
      mids.forEach(function (c, j) { mark(c, 'is-hl', K + 'mid' + j, 200); });
      var sv = sorted.map(function (o) { return vals[o]; }), med = n % 2 ? sv[(n - 1) / 2] : (sv[n / 2 - 1] + sv[n / 2]) / 2;
      say = n % 2 ? 'median = ' + nice(med) + (v.unit ? ' ' + v.unit : '') : '(' + nice(sv[n / 2 - 1]) + ' + ' + nice(sv[n / 2]) + ') ÷ 2 = ' + nice(med) + (v.unit ? ' ' + v.unit : '');
      if (show === 'quartiles') {
        var lo = sv.slice(0, Math.floor(n / 2)), hi = sv.slice(Math.ceil(n / 2));
        var qm = function (a) { var m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; };
        say = 'Q1 = ' + nice(qm(lo)) + '   median = ' + nice(med) + '   Q3 = ' + nice(qm(hi)) + '   IQR = ' + nice(qm(hi) - qm(lo));
      }
    } else if (show === 'range') {
      var mn = byRank[0], mx = byRank[n - 1];
      mark(mn, 'is-hl', K + 'min', 300); mark(mx, 'is-hl', K + 'max', 300);
      var a = P(0), b = P(n - 1), br = el('path', { d: 'M' + (a[0] + cw / 2) + ' ' + (y0 - 8) + 'V' + (y0 - 16) + 'H' + (b[0] + cw / 2) + 'V' + (y0 - 8), class: 'mx-bracket' }, s);
      q.draw(br, K + 'br', 700, 300);
      say = 'range = ' + nice(vals[sorted[n - 1]]) + ' − ' + nice(vals[sorted[0]]) + ' = ' + nice(vals[sorted[n - 1]] - vals[sorted[0]]);
    } else if (show === 'mode') {
      var counts = {}; vals.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
      var top = Math.max.apply(null, Object.keys(counts).map(function (k2) { return counts[k2]; })), modes = Object.keys(counts).filter(function (k2) { return counts[k2] === top; });
      chips.forEach(function (c) { if (modes.indexOf(String(vals[c.i])) >= 0) mark(c, 'is-hl', K + 'mode' + c.i, 120); });
      say = 'mode = ' + modes.map(function (m) { return nice(+m); }).join(' and ') + ' (' + top + ' times)';
    } else if (show === 'mean') {
      chips.forEach(function (c) { mark(c, 'is-hl', K + 'all' + c.i, 40); });
      var tot = sum(vals);
      say = 'add them: ' + nice(tot) + '   ÷ ' + n + '   mean = ' + nice(tot / n) + (v.unit ? ' ' + v.unit : '');
    }
    if (v.say) say = v.say;
    if (say) { var st = txt(s, W / 2, ly, say, 'mx-statt'); q.rise(st, K + 'say' + say, 400); }
    return s;
  }
  function bars(v, q) {
    var vals = (v.vals || []).map(Number), labels = v.labels || [], W = 520, H = 300, L = 46, Rm = 14, T = 18, B = 48, topv = Math.max.apply(null, vals.concat([1, v.line ? +v.line.v : 0]));
    var tk = ticks(0, topv * 1.12), n = vals.length || 1;
    if (tk.length > 1 && tk[tk.length - 1] < topv * 1.04) tk.push(+(tk[tk.length - 1] + tk[1] - tk[0]).toFixed(10));
    var ymax = tk[tk.length - 1] || topv;
    var s = svgBox(W, H, 'mx-bars'), slot = (W - L - Rm) / n, bw = v.kind === 'hist' ? slot : slot * .62, K = 'br' + vals.join(',') + ':';
    var Y = function (y) { return T + (1 - y / ymax) * (H - T - B); };
    tk.forEach(function (t) { el('line', { x1: L, x2: W - Rm, y1: Y(t), y2: Y(t), class: 'mx-gridl' }, s); txt(s, L - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    var mean = sum(vals) / n, hl = list(v.hl).map(Number);
    vals.forEach(function (val, i) {
      var x = L + i * slot + (slot - bw) / 2, on = hl.indexOf(i) >= 0;
      if (v.level) el('rect', { x: x, y: Y(val), width: bw, height: Y(0) - Y(val), class: 'mx-ghost' }, s);
      var r = el('rect', { x: x, y: Y(val), width: bw, height: Y(0) - Y(val), class: 'mx-bar' + (on ? ' is-hl' : '') + (v.kind === 'hist' ? ' is-hist' : '') }, s);
      q.grow(r, K + 'b' + i, 110, 'bottom', 650);
      if (v.values !== false) { var vt = v.level ? txt(s, x + bw / 2, Y(0) - 10, nice(val), 'mx-barv') : txt(s, x + bw / 2, Y(val) - 6, nice(val), 'mx-tick'); q.fade(vt, K + 'v' + i, 0); }
      txt(s, x + bw / 2, H - B + 18, labels[i] == null ? '' : String(labels[i]), 'mx-tick');
      if (v.level) q.tw(K + 'lev' + i, i ? 0 : 500, 1300, function (k) { var hgt = val + (mean - val) * k; r.setAttribute('y', Y(hgt)); r.setAttribute('height', Y(0) - Y(hgt)); }, ease);
    });
    el('line', { x1: L, x2: W - Rm, y1: Y(0), y2: Y(0), class: 'mx-axisline' }, s);
    var line = v.level ? { v: mean, label: 'mean = ' + nice(mean) } : v.line;
    if (line) {
      var ln = el('line', { x1: L, x2: W - Rm, y1: Y(+line.v), y2: Y(+line.v), class: 'mx-meanline' }, s);
      q.draw(ln, K + 'ml' + line.v, 700, 200);
      var lt = txt(s, W - Rm, Y(+line.v) - 8, line.label || nice(+line.v), 'mx-tlabel', 'end');
      q.fade(lt, K + 'mlt' + line.label, 0);
    }
    if (v.ylab) txt(s, L, 12, v.ylab, 'mx-axlab', 'start');
    if (v.xlab) txt(s, (W + L) / 2, H - 8, v.xlab, 'mx-axlab');
    return s;
  }
  function pie(v, q) {
    var vals = (v.vals || []).map(Number), labels = v.labels || [], tot = sum(vals) || 1, W = 500, H = 270, cx = 135, cy = 136, r = 112, s = svgBox(W, H, 'mx-pie'), K = 'pi' + vals.join(',') + ':';
    var hl = list(v.hl).map(String), a0 = -Math.PI / 2;
    vals.forEach(function (val, i) {
      var sw = val / tot * Math.PI * 2, from = a0, on = hl.indexOf(String(i)) >= 0 || hl.indexOf(String(labels[i])) >= 0;
      var mid = from + sw / 2, off = on ? 12 : 0, ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
      var p = el('path', { class: 'mx-slice mx-s' + (i % 6) + (on ? ' is-hl' : '') }, s), named = COL[String(labels[i]).toLowerCase()];
      if (named) p.style.fill = named;
      var put = function (k) {
        var b = from + sw * k, cxx = cx + ox * k, cyy = cy + oy * k;
        p.setAttribute('d', 'M' + cxx + ' ' + cyy + 'L' + (cxx + r * Math.cos(from)) + ' ' + (cyy + r * Math.sin(from)) + 'A' + r + ' ' + r + ' 0 ' + (b - from > Math.PI ? 1 : 0) + ' 1 ' + (cxx + r * Math.cos(b)) + ' ' + (cyy + r * Math.sin(b)) + 'Z');
      };
      q.tw(K + 's' + i + (on ? 'h' : ''), Math.max(200, 900 * val / tot), Math.max(260, 1300 * val / tot), put, linear);
      var deg = val / tot * 360, show = v.show === 'angles' ? nice(deg) + '°' : v.show === 'pct' ? nice(val / tot * 100) + '%' : nice(val);
      var lt = txt(s, 272, 34 + i * 27, (labels[i] || '') + ': ' + show, 'mx-plabel mx-s' + (i % 6) + (on ? ' is-hl' : ''), 'start');
      if (named) lt.style.fill = named;
      q.fade(lt, K + 'l' + i, 0);
      if (on && v.show === 'angles' && sw > .35) { var at = txt(s, cx + ox + Math.cos(mid) * r * .6, cy + oy + Math.sin(mid) * r * .6 + 5, nice(deg) + '°', 'mx-pieang'); q.pop(at, K + 'a' + i, 0); }
      a0 += sw;
    });
    return s;
  }
  function stem(v, q) {
    var t = document.createElement('table'), K = 'st' + (v.rows || []).map(function (r) { return r.join('|'); }).join(';') + ':';
    t.className = 'mx-table mx-stem';
    var hl = (v.hl || []).map(function (p) { return p.join(','); });
    var leaves = function (str, ri, side) { return String(str || '').split(/\s+/).filter(Boolean).map(function (d, j) { return '<span class="mx-leafd' + (hl.indexOf(ri + ',' + j + (side ? ',L' : '')) >= 0 ? ' is-hl' : '') + '">' + R.esc(d) + '</span>'; }).join(''); };
    t.innerHTML = '<tbody>' + (v.rows || []).map(function (r, ri) {
      return '<tr>' + (v.left ? '<td class="mx-leaf is-left">' + leaves(r[2], ri, true) + '</td>' : '') + '<th>' + R.esc(r[0]) + '</th><td class="mx-leaf">' + leaves(r[1], ri) + '</td></tr>';
    }).join('') + '</tbody>' + (v.key ? '<caption>Key: ' + R.esc(v.key) + '</caption>' : '');
    var all = t.querySelectorAll('.mx-leafd'), fresh = q.fresh(K + 'leaves'), base = q.t;
    if (fresh) all.forEach(function (n, k) { q.job(function () { n.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: base + k * Math.min(60, 1400 / all.length), fill: 'backwards' }); }); });
    if (fresh) q.t = base + Math.min(1400, all.length * 60);
    var hls = t.querySelectorAll('.mx-leafd.is-hl'), fh = q.fresh(K + 'hl' + hl.join(';')), b2 = q.t;
    if (fh) hls.forEach(function (n, k) { q.job(function () { n.animate([{ backgroundColor: 'rgba(255,200,0,0)', transform: 'scale(1)' }, { backgroundColor: 'rgba(255,200,0,.9)', transform: 'scale(1.3)', offset: .4 }, { backgroundColor: 'rgba(255,200,0,.4)', transform: 'none' }], { duration: 500, delay: b2 + k * 90, fill: 'backwards' }); }); });
    var box = document.createElement('div');
    box.className = 'mx-stembox';
    box.appendChild(t);
    if (v.count) {
      var c = document.createElement('p');
      c.className = 'mx-stemcount';
      c.textContent = v.count;
      box.appendChild(c);
      if (q.fresh(K + 'count' + v.count)) { var dc = q.at(200); q.job(function () { c.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: dc + hls.length * 90, fill: 'backwards' }); }); }
    }
    return box;
  }
  function scatter(v, q) {
    var W = 520, H = 320, L = 46, Rm = 14, T = 16, B = 36, x0 = +v.x[0], x1 = +v.x[1], y0 = +v.y[0], y1 = +v.y[1];
    var X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - Rm); }, Y = function (y) { return T + (y1 - y) / (y1 - y0) * (H - T - B); };
    var s = svgBox(W, H, 'mx-scatter'), K = 'sc' + [x0, x1, y0, y1].join(',') + ':';
    ticks(x0, x1).forEach(function (t) { el('line', { x1: X(t), x2: X(t), y1: T, y2: H - B, class: 'mx-gridl' }, s); txt(s, X(t), H - B + 16, nice(t), 'mx-tick'); });
    ticks(y0, y1).forEach(function (t) { el('line', { x1: L, x2: W - Rm, y1: Y(t), y2: Y(t), class: 'mx-gridl' }, s); txt(s, L - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    el('line', { x1: L, x2: W - Rm, y1: H - B, y2: H - B, class: 'mx-axisline' }, s);
    el('line', { x1: L, x2: L, y1: T, y2: H - B, class: 'mx-axisline' }, s);
    var hl = (v.hl || []).map(Number), pts = v.pts || [];
    pts.forEach(function (p, k) { var c = el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.5, class: 'mx-pt' + (hl.indexOf(k) >= 0 ? ' is-hl' : '') }, s); q.pop(c, K + 'p' + p.join(','), pts.length > 20 ? 30 : 60, 340); });
    if (v.line) {
      var mxv = pts.length ? sum(pts.map(function (p) { return p[0]; })) / pts.length : (x0 + x1) / 2, myv = v.line.m * mxv + v.line.c;
      var ln = el('line', { class: 'mx-line2 is-fit' }, s);
      q.tw(K + 'line' + v.line.m + ',' + v.line.c, 400, 1200, function (k) { var m = v.line.m * k, c = myv - m * mxv; ln.setAttribute('x1', X(x0)); ln.setAttribute('y1', Y(m * x0 + c)); ln.setAttribute('x2', X(x1)); ln.setAttribute('y2', Y(m * x1 + c)); }, ease);
    }
    if (v.label) { var lt = txt(s, L + 12, T + 18, v.label, 'mx-tlabel', 'start'); q.pop(lt, K + 'l' + v.label, 200); }
    if (v.xlab) txt(s, (W + L) / 2, H - 4, v.xlab, 'mx-axlab');
    if (v.ylab) txt(s, L + 6, T + 12, v.ylab, 'mx-axlab', 'start');
    return s;
  }
  // The normal curve and the empirical rule: the bell draws, the region opens out from its middle, the % counts up.
  function normal(v, q) {
    var mu = +v.mean, sd = +v.sd, W = 520, H = 280, L = 20, Rm = 20, T = 40, B = 62, a = mu - 3.6 * sd, b = mu + 3.6 * sd;
    var X = function (x) { return L + (x - a) / (b - a) * (W - L - Rm); }, Y = function (y) { return T + (1 - y) * (H - T - B); }, f = function (x) { var z = (x - mu) / sd; return Math.exp(-z * z / 2); };
    var s = svgBox(W, H, 'mx-normal'), K = 'nm' + mu + ',' + sd + ':', d = '';
    for (var j = 0; j <= 200; j++) { var x = a + (b - a) * j / 200; d += (j ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(x)).toFixed(1); }
    var lo = v.shade ? (v.shade[0] == null ? a : Math.max(a, +v.shade[0])) : null, hi = v.shade ? (v.shade[1] == null ? b : Math.min(b, +v.shade[1])) : null;
    if (v.shade) {
      var cid = uid('mxn'), cr = el('rect', { y: 0, height: H }, el('clipPath', { id: cid }, defs(s)));
      var area = 'M' + X(lo) + ' ' + Y(0);
      for (var k = 0; k <= 120; k++) { var xx = lo + (hi - lo) * k / 120; area += 'L' + X(xx).toFixed(1) + ' ' + Y(f(xx)).toFixed(1); }
      area += 'L' + X(hi) + ' ' + Y(0) + 'Z';
      el('path', { d: area, class: 'mx-narea', 'clip-path': 'url(#' + cid + ')' }, s);
      var c0 = lo <= mu && hi >= mu ? X(mu) : v.shade[0] == null ? X(hi) : X(lo);
      q.tw(K + 'shade' + lo + '>' + hi, 1300, 1300, function (t) {
        var l = c0 - (c0 - X(lo)) * t, r = c0 + (X(hi) - c0) * t;
        cr.setAttribute('x', l); cr.setAttribute('width', Math.max(0, r - l));
      }, ease);
    }
    var curve = el('path', { d: d, class: 'mx-curve mx-c0' }, s);
    q.draw(curve, K + 'curve', 1300, 0);
    q.draw(el('line', { x1: L, x2: W - Rm, y1: Y(0), y2: Y(0), class: 'mx-axisline' }, s), K + 'ax', 500, 0);
    var kk = v.ticks || 3;
    for (var t = -kk; t <= kk; t++) {
      var tx = X(mu + t * sd), g = el('g', {}, s);
      el('line', { x1: tx, x2: tx, y1: Y(0), y2: Y(0) + 6, class: 'mx-axisline' }, g);
      txt(g, tx, Y(0) + 22, nice(mu + t * sd), 'mx-tick');
      txt(g, tx, Y(0) + 40, t === 0 ? 'μ' : (t > 0 ? 'μ+' : 'μ−') + (Math.abs(t) === 1 ? '' : Math.abs(t)) + 'σ', 'mx-tick is-soft');
      q.fade(g, K + 't' + t, 40);
      if (t !== 0 && Math.abs(t) <= kk) { var gl = el('line', { x1: tx, x2: tx, y1: Y(f(mu + t * sd)), y2: Y(0), class: 'mx-nline' }, s); q.fade(gl, K + 'gl' + t, 0); }
    }
    if (v.label) {
      var lx = v.shade ? (X(lo) + X(hi)) / 2 : X(mu), ly2 = v.shade && (hi - lo) < 2.2 * sd && Math.abs((lo + hi) / 2 - mu) > sd ? Y(.35) : T - 12;
      var lt = txt(s, lx, ly2, v.label, 'mx-nlabel'), m = /([\d.]+)\s*%/.exec(v.label);
      if (m) countTo(lt, q, K + 'lab' + v.label, 0, +m[1], 1300, function (x, k) { return k >= 1 ? v.label : v.label.replace(m[1], (+m[1] % 1 ? x.toFixed(1) : Math.round(x))); });
      else q.fade(lt, K + 'lab' + v.label, 0);
    }
    if (v.unit) txt(s, W - Rm, H - 4, v.unit, 'mx-axlab', 'end');
    return s;
  }
  // A margin of error: the interval opens out either side of the sample's result, the claim drops in, and the verdict.
  function ci(v, q) {
    var p = +v.p, n = +v.n, E = v.E != null ? +v.E : 1 / Math.sqrt(n), claim = v.claim != null ? +v.claim : null, pct = v.pct !== false;
    var lo = p - E, hi = p + E, a = Math.min(lo, claim == null ? lo : claim), b = Math.max(hi, claim == null ? hi : claim), pad = (b - a) * .22 + .005;
    a -= pad; b += pad;
    var W = 520, H = 210, L = 30, Rm = 30, y = 110, X = function (x) { return L + (x - a) / (b - a) * (W - L - Rm); }, s = svgBox(W, H, 'mx-ci'), K = 'ci' + p + ',' + n + ':';
    var f = function (x) { return pct ? nice(+(x * 100).toFixed(1)) + '%' : nice(+x.toFixed(3)); };
    q.draw(el('line', { x1: L, x2: W - Rm, y1: y, y2: y, class: 'mx-axisline' }, s), K + 'ax', 500, 0);
    var band = el('rect', { x: X(lo), y: y - 12, width: X(hi) - X(lo), height: 24, rx: 12, class: 'mx-ciband' }, s);
    q.grow(band, K + 'band', 300, 'center', 1000);
    [lo, hi].forEach(function (x, i) { var g = el('g', {}, s); el('line', { x1: X(x), x2: X(x), y1: y - 18, y2: y + 18, class: 'mx-ciend' }, g); txt(g, X(x), y + 38, f(x), 'mx-tick is-head'); q.fade(g, K + 'e' + i, 100); });
    var pd = el('circle', { cx: X(p), cy: y, r: 7, class: 'mx-pt' }, s);
    q.pop(pd, K + 'p', 0);
    var pl = txt(s, X(p), y - 24, (v.pLabel || 'sample') + ' ' + f(p), 'mx-plabel');
    q.fade(pl, K + 'pl', 0);
    var el2 = txt(s, (X(p) + X(hi)) / 2, y + 60, '± ' + (pct ? nice(+(E * 100).toFixed(1)) + '%' : nice(+E.toFixed(3))) + '  (1 ÷ √' + n + ')', 'mx-tick is-soft');
    q.fade(el2, K + 'E', 0);
    if (claim != null) {
      var inside = claim >= lo && claim <= hi, g2 = el('g', {}, s), cg = el('g', { class: 'mx-claim' + (inside ? ' is-in' : ' is-outside') }, g2);
      el('path', { d: 'M' + (X(claim) - 9) + ' ' + (y - 46) + 'L' + (X(claim) + 9) + ' ' + (y - 46) + 'L' + X(claim) + ' ' + (y - 30) + 'Z' }, cg);
      txt(cg, X(claim), y - 54, (v.claimLabel || 'claim') + ' ' + f(claim), 'mx-plabel');
      q.anim(cg, K + 'claim' + claim, 400, [{ transform: 'translateY(-40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      var vt = txt(s, W / 2, H - 14, v.verdict || (inside ? 'The claim is inside the interval: no evidence to reject it.' : 'The claim is outside the interval: reject it.'), 'mx-verdict ' + (inside ? 'is-in' : 'is-outside'));
      q.rise(vt, K + 'verdict' + claim, 400);
    }
    return s;
  }
  function table(v, q) {
    var t = document.createElement('table'), hl = {}, K = 'tb' + JSON.stringify([v.head, v.rows]).length + ':';
    t.className = 'mx-table';
    (v.hl || []).forEach(function (c) { hl[c[0] + ',' + c[1]] = true; });
    var html = '';
    if (v.head) html += '<thead><tr>' + v.head.map(function (h, j) { return '<th' + (hl['-1,' + j] ? ' class="is-hl"' : '') + '>' + R.inline(h) + '</th>'; }).join('') + '</tr></thead>';
    html += '<tbody>' + (v.rows || []).map(function (r, i) {
      return '<tr>' + r.map(function (c, j) { return '<td' + (hl[i + ',' + j] ? ' class="is-hl"' : '') + '>' + R.inline(c) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    t.innerHTML = html;
    var rows = t.querySelectorAll('tr'), fresh = q.fresh(K + JSON.stringify(v.rows)), base = q.t;
    if (fresh) rows.forEach(function (r, k) { q.job(function () { r.animate([{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: base + k * 90, fill: 'backwards' }); }); });
    if (fresh) q.t = base + rows.length * 90;
    var fh = q.fresh(K + 'hl' + JSON.stringify(v.hl)), b2 = q.t;
    if (fh) t.querySelectorAll('.is-hl').forEach(function (c, k) { q.job(function () { c.animate([{ backgroundColor: 'rgba(255,200,0,0)' }, { backgroundColor: 'rgba(255,200,0,.75)', offset: .5 }, { backgroundColor: 'rgba(255,200,0,.3)' }], { duration: 600, delay: b2 + 200 + k * 160, fill: 'backwards' }); }); });
    return t;
  }
  function grid(v, q) {
    var rows = v.rows || [], cols = v.cols || [], cells = v.cells, hl = {}, K = 'gd' + rows.join('') + '|' + cols.join('') + ':';
    (v.hl || []).forEach(function (c) { hl[c[0] + ',' + c[1]] = true; });
    var t = document.createElement('table');
    t.className = 'mx-table mx-grid-t';
    var html = '<thead><tr><th class="mx-corner">' + R.esc(v.rowsLabel || '') + (v.colsLabel ? ' \\ ' + R.esc(v.colsLabel) : '') + '</th>' + cols.map(function (c) { return '<th>' + R.inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += '<tr><th>' + R.inline(r) + '</th>' + cols.map(function (c, j) {
        var val = cells ? cells[i][j] : r + ', ' + c;
        return '<td data-ij="' + (i + j) + '"' + (hl[i + ',' + j] ? ' class="is-hl"' : '') + '>' + R.inline(String(val)) + '</td>';
      }).join('') + '</tr>';
    });
    t.innerHTML = html + '</tbody>';
    var fresh = q.fresh(K + 'cells'), base = q.t;
    if (fresh) t.querySelectorAll('td').forEach(function (c) { q.job(function () { c.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: base + +c.getAttribute('data-ij') * 45, fill: 'backwards' }); }); });
    if (fresh) q.t = base + (rows.length + cols.length) * 45 + 200;
    var fh = q.fresh(K + 'hl' + JSON.stringify(v.hl)), b2 = q.t;
    if (fh) t.querySelectorAll('td.is-hl').forEach(function (c, k) { q.job(function () { c.animate([{ backgroundColor: 'rgba(255,200,0,0)' }, { backgroundColor: 'rgba(255,200,0,.8)', offset: .5 }, { backgroundColor: 'rgba(255,200,0,.35)' }], { duration: 520, delay: b2 + k * 100, fill: 'backwards' }); }); });
    return t;
  }

  // ---------- the kinds, what each needs, and the entry point ----------
  var KINDS = {
    graph: [graph, ['x', 'y']], signs: [signs, ['x', 'signs']], shape: [shape, ['kind']], net: [net, ['kind']], trap: [trap, ['ys']],
    slots: [slots, ['boxes']], list: [listing, ['rows']], bag: [bag, ['groups']], dice: [dice, []], spinner: [spinner, ['sectors']], pscale: [pscale, ['marks']],
    tree: [tree, []], venn: [venn, []], dots: [dots, ['vals']], bars: [bars, ['vals']], pie: [pie, ['vals']], stem: [stem, ['rows']],
    scatter: [scatter, ['x', 'y', 'pts']], normal: [normal, ['mean', 'sd']], ci: [ci, ['p', 'n']], table: [table, ['rows']], grid: [grid, ['rows', 'cols']]
  };
  var SHAPES = ['cylinder', 'cone', 'sphere', 'hemisphere', 'cuboid', 'tri-prism', 'circle', 'sector', 'semicircle', 'rectangle', 'square', 'triangle', 'right-triangle', 'trapezium', 'parallelogram', 'composite'];
  // Problems with a spec (for tools/maths/tests/check.mjs): an unknown kind, a missing field, values that can't be drawn.
  function validate(v) {
    var out = [];
    if (!v || typeof v !== 'object') return ['not a picture'];
    var k = KINDS[v.t];
    if (!k) return ['unknown picture "' + v.t + '"'];
    k[1].forEach(function (f) { if (v[f] == null) out.push(v.t + ' needs "' + f + '"'); });
    var num = function (x) { return typeof x === 'number' && isFinite(x); };
    if ((v.t === 'graph' || v.t === 'scatter') && v.x && v.y && !(num(v.x[0]) && num(v.x[1]) && v.x[1] > v.x[0] && num(v.y[0]) && num(v.y[1]) && v.y[1] > v.y[0])) out.push(v.t + ': x and y must be [low, high] numbers');
    if (v.t === 'graph') {
      (v.fns || []).concat(v.ride ? [v.ride] : [], v.obj ? [v.obj] : [], v.tangent ? [v.tangent] : []).forEach(function (fn) { if (fn.f) { try { var g = R.compile(fn.f); if (!isFinite(g({ x: (v.x[0] + v.x[1]) / 2 })) && !isFinite(g({ x: v.x[0] + .37 }))) out.push('graph: ' + fn.f + ' gives no numbers'); } catch (e) { out.push('graph: cannot read ' + fn.f); } } });
      if ((v.ride || v.obj) && !(v.fns && v.fns.length) && !(v.ride || v.obj).f) out.push('graph: ride/obj needs a curve');
    }
    if (v.t === 'shape' && SHAPES.indexOf(v.kind) < 0) out.push('shape: unknown kind ' + v.kind);
    if (v.t === 'shape' && v.fill && !/^(cylinder|cone|sphere|hemisphere|cuboid)$/.test(v.kind)) out.push('shape: fill works on cylinder, cone, sphere, hemisphere, cuboid');
    if (v.t === 'net' && !/^(cylinder|cone)$/.test(v.kind)) out.push('net: kind is cylinder or cone');
    if (v.t === 'bag') { var N = sum((v.groups || []).map(function (g) { return +g.n || 0; })); if (N < 1 || N > 60) out.push('bag: 1 to 60 balls (has ' + N + ')'); }
    if (v.t === 'dice' && v.cells && !(Array.isArray(v.cells) && v.cells.length === (v.rows || [1, 2, 3, 4, 5, 6]).length)) out.push('dice: cells must have a row for each row');
    if (v.t === 'slots' && (!Array.isArray(v.boxes) || !v.boxes.length || v.boxes.length > 10)) out.push('slots: 1 to 10 boxes');
    if (v.t === 'list' && (v.rows || []).length > 40) out.push('list: at most 40 rows');
    if (v.t === 'dots' && ((v.vals || []).length < 2 || v.vals.length > 30 || v.vals.some(function (x) { return !num(x); }))) out.push('dots: 2 to 30 numbers');
    if (v.t === 'dots' && v.show && !/^(median|mean|range|mode|quartiles)$/.test(v.show)) out.push('dots: show is median, mean, range, mode or quartiles');
    if (v.t === 'normal' && !(num(v.mean) && num(v.sd) && v.sd > 0)) out.push('normal: mean and sd must be numbers');
    if (v.t === 'ci' && !(num(v.p) && num(v.n) && v.n > 0)) out.push('ci: p and n must be numbers');
    if (v.t === 'tree' && !v.root && !v.levels) out.push('tree needs "root" (or "levels")');
    if (v.t === 'pscale' && (v.marks || []).some(function (m) { return !num(+m.v) || m.v < 0 || m.v > 1; })) out.push('pscale: each mark needs v from 0 to 1');
    if ((v.t === 'bars' || v.t === 'pie') && (v.vals || []).some(function (x) { return !num(x); })) out.push(v.t + ': vals must be numbers');
    return out;
  }
  function vis(v, seen) {
    if (!v || !KINDS[v.t] || typeof document === 'undefined') return null;
    var q = new Seq(seen), node;
    try { node = KINDS[v.t][0](v, q); } catch (e) { if (window.console) console.warn('maths picture ' + v.t + ':', e); return null; }
    if (!node) return null;
    var box = document.createElement('div');
    box.className = 'mx-vis mx-vis--' + v.t;
    box.appendChild(node);
    if (v.cap) { var c = document.createElement('p'); c.className = 'mx-cap'; c.innerHTML = R.inline(v.cap); box.appendChild(c); if (q.fresh('cap' + v.cap)) { var d = q.at(0); q.job(function () { c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: d + 200, fill: 'backwards' }); }); } }
    box.keys = q.keys;
    box.length = q.t;
    var played = false;
    box.play = function () { if (played) return; played = true; q.jobs.forEach(function (f) { try { f(); } catch (e) { /* one piece failing leaves the rest */ } }); };
    if (window.requestAnimationFrame) requestAnimationFrame(function () { if (box.isConnected) box.play(); });
    return box;
  }
  R.vis = vis;
  R.kinds = function () { return Object.keys(KINDS); };
  // Another subject adds its own kinds (cs/cs-scenes.js): draw(v, q) gets the spec and the sequence, `need` the fields
  // it must have; the kit is the helpers the kinds here use.
  R.addKind = function (name, draw, need) { KINDS[name] = [draw, need || []]; };
  R.sceneKit = { el: el, txt: txt, svgBox: svgBox, defs: defs, colour: colour, nice: nice, clamp: clamp, tween: tween, ease: ease,
    easeOut: easeOut, linear: linear, list: list, isHl: isHl, uid: uid, ballGrad: ballGrad, countTo: countTo, reduce: reduce };
  R.validate = validate;
  R.shapes = SHAPES;
})();

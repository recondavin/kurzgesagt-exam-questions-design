// Maths rendering for the revision site: KaTeX with two macros, a working board that adds a step's lines and moves the
// pieces that carry over (a morph), the pictures a step can show (graphs, solids, trees, charts...), and the checker
// for what a student types. Used by the maths desk (maths/maths-desk.js) and the maths hub (maths.html).
//   \hl{...}      highlights the bit that matters (it glows as the line arrives)
//   \mv{key}{...} tags a piece: when the next line has the same key, that piece slides from its old place to its new
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // ---------- KaTeX ----------
  var MACROS = { '\\hl': '\\htmlClass{mx-hl}{#1}', '\\mv': '\\htmlData{mv=#1}{#2}' };
  function tex(s, display) {
    if (!window.katex) return '<code>' + esc(s) + '</code>';
    try {
      return window.katex.renderToString(String(s), {
        displayMode: !!display, throwOnError: false, strict: false, macros: Object.assign({}, MACROS),
        trust: function (c) { return c.command === '\\htmlClass' || c.command === '\\htmlData'; }
      });
    } catch (e) { return '<code>' + esc(s) + '</code>'; }
  }
  // Text with $...$ maths in it (the exam's own words).
  function inline(s) {
    return String(s == null ? '' : s).split(/(\$[^$]+\$)/).map(function (bit) {
      return /^\$[^$]+\$$/.test(bit) ? tex(bit.slice(1, -1)) : esc(bit).replace(/\n/g, '<br>');
    }).join('');
  }

  // ---------- expressions (graphs and answer checking) ----------
  // Accepts what students type: 3x^2, 3x², 2(x+1), −4, 36π, √2, 1/2x, ln, e^x. Returns f(vars) or throws.
  function normal(s) {
    return String(s).toLowerCase()
      .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
      .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (r) { return '^(' + r.split('').map(function (c) { return c === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c); }).join('') + ')'; })
      .replace(/\s+/g, '');
  }
  // A number as typed with its units, money signs or percent: "113.10 cm³", "€1,200", "45%".
  function stripUnits(s) {
    // Standard form as people type it: 6.7 × 10²¹, 6.7 x 10^21, 6.7e21.
    s = String(s).replace(/(\d)\s*[x×*]\s*10\s*\^/gi, '$1*10^').replace(/(\d)\s*[x×]\s*10(?=[⁻⁰¹²³⁴⁵⁶⁷⁸⁹])/gi, '$1*10').replace(/(\d)e([+-]?\d+)\b/gi, '$1*10^($2)');
    return String(s).replace(/[€£$%]/g, '').replace(/(\d),(?=\d{3}\b)/g, '$1')
      .replace(/\b(cm|mm|km|m|kg|g|ml|l|litres?|metres?|units?|seconds?|s|minutes?|hours?|days?|years?|degrees?|°)\s*(\^?\s*[23]|[²³])?(?![a-z])/gi, '')
      .replace(/°/g, '').replace(/\b(sq\.?|square|cubic|per|approx\.?|approximately)\b/gi, '')
      // Words after the number ("atoms", "people", "students per class"), but not π.
      .replace(/(\d|\))\s*(?!pi\b)[a-z][a-z\s]*$/i, '$1').trim();
  }
  function compile(src) {
    var s = normal(src), i = 0;
    function peek() { return s[i]; }
    function eat(c) { if (s[i] === c) { i++; return true; } return false; }
    function num() {
      var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (!m) return null;
      i += m[0].length;
      var v = parseFloat(m[0]);
      return function () { return v; };
    }
    function atom() {
      var n = num();
      if (n) return n;
      if (eat('(')) { var e = expr(); if (!eat(')')) throw new Error('bracket'); return e; }
      var m = /^(sqrt|ln|log|exp|sin|cos|tan|pi|e|[a-z])/.exec(s.slice(i));
      if (!m) throw new Error('bad ' + s.slice(i, i + 4));
      i += m[0].length;
      var w = m[0];
      if (w === 'pi') return function () { return Math.PI; };
      if (w === 'e') return function () { return Math.E; };
      if (/^(sqrt|ln|log|exp|sin|cos|tan)$/.test(w)) {
        var arg = power();
        var fn = { sqrt: Math.sqrt, ln: Math.log, log: Math.log10, exp: Math.exp, sin: Math.sin, cos: Math.cos, tan: Math.tan }[w];
        return function (v) { return fn(arg(v)); };
      }
      return function (v) { if (!(w in v)) throw new Error('var ' + w); return v[w]; };
    }
    function power() {
      var b = atom();
      if (eat('^')) { var neg = eat('-'), ex = unary(); return function (v) { var p = ex(v); return Math.pow(b(v), neg ? -p : p); }; }
      return b;
    }
    function unary() { if (eat('-')) { var a = unary(); return function (v) { return -a(v); }; } eat('+'); return power(); }
    function term() {
      var a = unary();
      for (;;) {
        if (eat('*')) { var b = unary(); a = (function (x, y) { return function (v) { return x(v) * y(v); }; })(a, b); }
        else if (eat('/')) { var c = unary(); a = (function (x, y) { return function (v) { return x(v) / y(v); }; })(a, c); }
        else if (i < s.length && /[0-9a-z(.]/.test(peek())) { var d = power(); a = (function (x, y) { return function (v) { return x(v) * y(v); }; })(a, d); }
        else return a;
      }
    }
    function expr() {
      var a = term();
      for (;;) {
        if (eat('+')) { var b = term(); a = (function (x, y) { return function (v) { return x(v) + y(v); }; })(a, b); }
        else if (eat('-')) { var c = term(); a = (function (x, y) { return function (v) { return x(v) - y(v); }; })(a, c); }
        else return a;
      }
    }
    var f = expr();
    if (i !== s.length) throw new Error('left ' + s.slice(i));
    return function (vars) { return f(vars || {}); };
  }
  function evalNum(s) { var f = compile(s); var v = f({}); if (!isFinite(v)) throw new Error('nan'); return v; }

  // ---------- checking an answer ----------
  // Returns { ok, show } (show: the right answer, written for the student) or { error } when it can't be read.
  function close(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1e-6 : tol) + 1e-9 * Math.max(1, Math.abs(b)); }
  function numbersIn(s) {
    var bits = String(s).replace(/\bor\b|\band\b|;|\|/gi, ',').replace(/[a-z]\s*=/gi, '').split(',');
    return bits.map(function (b) { return b.trim(); }).filter(Boolean).map(evalNum);
  }
  function check(ans, input) {
    var raw = String(input == null ? '' : input).trim();
    if (!ans) return { error: 'no answer' };
    var show = ans.show || (ans.value != null ? String(ans.value) : '');
    if (ans.type === 'choice') return { ok: +input === ans.value, show: ans.options[ans.value] };
    if (!raw) return { error: 'Type your answer first.' };
    try {
      if (ans.type === 'number') {
        var v = evalNum(stripUnits(raw.replace(/^[a-z]+\s*=\s*/i, '')));
        return { ok: close(v, ans.value, ans.tol), show: show };
      }
      if (ans.type === 'numbers') {
        var got = numbersIn(stripUnits(raw)), want = ans.values.slice();
        if (got.length !== want.length) return { ok: false, show: show, note: 'There should be ' + want.length + ' answers.' };
        var ok = got.every(function (g) { var k = want.findIndex(function (w) { return close(g, w, ans.tol); }); if (k < 0) return false; want.splice(k, 1); return true; });
        return { ok: ok, show: show };
      }
      if (ans.type === 'point') {
        var p = numbersIn(stripUnits(raw.replace(/[()]/g, '')));
        return { ok: p.length === 2 && close(p[0], ans.value[0], ans.tol || 1e-6) && close(p[1], ans.value[1], ans.tol || 1e-6), show: show };
      }
      if (ans.type === 'expr') {
        var name = (ans.var || 'x').toLowerCase(), user = compile(raw.replace(/^[a-z]+\s*[′'’]*\s*(\([a-z]\))?\s*=\s*/i, '').replace(/^dy\/dx\s*=\s*/i, '')), right = compile(ans.value);
        var xs = [-2.3, -0.7, 0.4, 1.9, 3.1], same = xs.every(function (x) {
          var o = {}; o[name] = x; var a = user(o), b = right(o);
          return isFinite(a) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
        });
        return { ok: same, show: show };
      }
      if (ans.type === 'equation') {
        var side = function (e) { var h = e.split('='); if (h.length !== 2) throw new Error('='); var l = compile(h[0]), r = compile(h[1]); return function (v) { return l(v) - r(v); }; };
        var U = side(raw), R = side(ans.value), pts = [[0.3, 1.7], [-1.2, 2.5], [2.2, -0.9], [1.1, 4.3]], k = null;
        var eq = pts.every(function (p) {
          var u = U({ x: p[0], y: p[1] }), r = R({ x: p[0], y: p[1] });
          if (Math.abs(r) < 1e-9) return Math.abs(u) < 1e-9;
          var ratio = u / r; if (k === null) k = ratio; return Math.abs(ratio - k) < 1e-6 * Math.max(1, Math.abs(k)) && Math.abs(k) > 1e-9;
        });
        return { ok: eq, show: show };
      }
    } catch (e) { return { error: 'I couldn’t read that. Type just the answer, like ' + (ans.type === 'expr' ? '6x − 4' : ans.type === 'point' ? '(2, −5)' : ans.type === 'equation' ? 'y = 2x + 1' : ans.type === 'numbers' ? '1, 3' : '12.5') + '.' }; }
    return { ok: null, show: show };
  }

  // ---------- the working board ----------
  // board.step(lines, opts): adds the lines under what's there; earlier lines dim. A piece tagged \mv{k} in the last
  // line slides from there to its place in the new line; the rest of the new line drops in; \hl parts glow.
  function Board(host) {
    this.host = host;
    host.classList.add('mx-board');
  }
  Board.prototype.clear = function () { this.host.innerHTML = ''; };
  Board.prototype.step = function (lines, opts) {
    var host = this.host, prev = host.lastElementChild, motion = !reduce() && !(opts && opts.still);
    host.querySelectorAll('.mx-line.is-new').forEach(function (n) { n.classList.remove('is-new'); });
    (lines || []).forEach(function (src, k) {
      var line = document.createElement('div');
      line.className = 'mx-line is-new';
      line.innerHTML = tex(src, true);
      host.appendChild(line);
      if (!motion) return;
      var before = prev && prev.querySelectorAll ? Array.prototype.slice.call(prev.querySelectorAll('[data-mv]')) : [];
      var movers = [];
      before.forEach(function (old) {
        var key = old.getAttribute('data-mv'), now = line.querySelector('[data-mv="' + key + '"]');
        if (!now) return;
        var a = old.getBoundingClientRect(), b = now.getBoundingClientRect();
        movers.push(now);
        now.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)', color: '#FFC800' },
          { transform: 'none', color: '#FFC800', offset: .8 }, { transform: 'none' }],
          { duration: 900, delay: 250 + k * 700, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'backwards' });
      });
      // Everything else in the line fades and drops in after the movers have set off.
      var base = line.querySelector('.katex-html') || line;
      base.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, delay: (movers.length ? 700 : 150) + k * 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      movers.forEach(function (m) { m.style.position = 'relative'; m.style.zIndex = '2'; });
      line.querySelectorAll('.mx-hl').forEach(function (h) {
        h.animate([{ backgroundColor: 'rgba(255,200,0,0)' }, { backgroundColor: 'rgba(255,200,0,.42)' }, { backgroundColor: 'rgba(255,200,0,.18)' }],
          { duration: 900, delay: 900 + k * 700, fill: 'backwards' });
      });
      prev = line;
    });
    if (opts && opts.follow) setTimeout(function () { var last = host.lastElementChild; if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' }); }, 60);
  };

  // ---------- pictures ----------
  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function svgBox(w, h, cls) {
    var s = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'mx-svg ' + (cls || ''), role: 'img' });
    return s;
  }
  function text(parent, x, y, s, cls, anchor) {
    var t = svgEl('text', { x: x, y: y, class: cls || 'mx-t', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = s;
    return t;
  }
  function drawIn(node, delay, ms) {
    if (reduce() || !node.getTotalLength) return;
    var len = node.getTotalLength();
    node.style.strokeDasharray = len;
    node.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms || 1100, delay: delay || 0, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' });
  }
  function popIn(node, delay) {
    if (reduce()) return;
    node.style.transformBox = 'fill-box';
    node.style.transformOrigin = 'center';
    node.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1.15)', offset: .7 }, { opacity: 1, transform: 'none' }],
      { duration: 480, delay: delay || 0, easing: 'ease-out', fill: 'backwards' });
  }
  function fadeIn(node, delay) {
    if (reduce()) return;
    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: delay || 0, fill: 'backwards' });
  }
  function nice(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(+v.toFixed(2)); }
  function ticks(a, b) {
    var span = b - a, raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(function (m) { return m * mag; }).filter(function (s) { return s >= raw; })[0] || mag * 10;
    var out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  // A graph: axes, the curve(s) drawn in, points popping on, a tangent sliding out from its point, lines y = mx + c.
  function graph(v) {
    var W = 520, H = 340, L = 44, R = 16, T = 14, B = 30;
    var x0 = v.x[0], x1 = v.x[1], y0 = v.y[0], y1 = v.y[1];
    var X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - R); }, Y = function (y) { return T + (y1 - y) / (y1 - y0) * (H - T - B); };
    var s = svgBox(W, H, 'mx-graph');
    var grid = svgEl('g', { class: 'mx-grid' }, s);
    ticks(x0, x1).forEach(function (t) { svgEl('line', { x1: X(t), x2: X(t), y1: T, y2: H - B }, grid); if (Math.abs(t) > 1e-9) text(s, X(t), Math.min(H - B, Math.max(T, Y(0))) + 16, nice(t), 'mx-tick'); });
    ticks(y0, y1).forEach(function (t) { svgEl('line', { x1: L, x2: W - R, y1: Y(t), y2: Y(t) }, grid); if (Math.abs(t) > 1e-9) text(s, Math.min(W - R, Math.max(L, X(0))) - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    var ax = svgEl('g', { class: 'mx-axes' }, s);
    if (y0 <= 0 && y1 >= 0) svgEl('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0) }, ax);
    if (x0 <= 0 && x1 >= 0) svgEl('line', { x1: X(0), x2: X(0), y1: T, y2: H - B }, ax);
    var clip = 'mxclip' + Math.random().toString(36).slice(2, 8);
    var defs = svgEl('defs', {}, s), cp = svgEl('clipPath', { id: clip }, defs);
    svgEl('rect', { x: L, y: T, width: W - L - R, height: H - T - B }, cp);
    var plot = svgEl('g', { 'clip-path': 'url(#' + clip + ')' }, s);
    var delay = 150;
    (v.fns || []).forEach(function (fn, k) {
      var f; try { f = compile(fn.f); } catch (e) { return; }
      var from = fn.from != null ? fn.from : x0, to = fn.to != null ? fn.to : x1, d = '', pen = false;
      for (var j = 0; j <= 240; j++) {
        var x = from + (to - from) * j / 240, y;
        try { y = f({ x: x }); } catch (e) { y = NaN; }
        if (!isFinite(y) || y > y1 + (y1 - y0) * 2 || y < y0 - (y1 - y0) * 2) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1);
        pen = true;
      }
      var p = svgEl('path', { d: d, class: 'mx-curve mx-c' + (k % 3) + (fn.c === 'faint' ? ' is-faint' : '') }, plot);
      drawIn(p, delay, 1300);
      if (fn.label) text(s, X(to) - 4, Y(f({ x: to })) - 8, fn.label, 'mx-flabel mx-c' + (k % 3), 'end');
      delay += 500;
    });
    (v.lines || []).forEach(function (ln) {
      var p = svgEl('path', { d: 'M' + X(x0) + ' ' + Y(ln.m * x0 + ln.c) + 'L' + X(x1) + ' ' + Y(ln.m * x1 + ln.c), class: 'mx-line2' }, plot);
      drawIn(p, delay, 900);
      delay += 300;
    });
    if (v.tangent) {
      try {
        var g = compile(v.tangent.f), a = v.tangent.x, h = 1e-5, m = (g({ x: a + h }) - g({ x: a - h })) / (2 * h), ya = g({ x: a });
        var span = (x1 - x0) * .32, tl = svgEl('path', { d: 'M' + X(a - span) + ' ' + Y(ya - m * span) + 'L' + X(a + span) + ' ' + Y(ya + m * span), class: 'mx-tangent' }, plot);
        if (!reduce()) {
          tl.style.transformBox = 'fill-box'; tl.style.transformOrigin = 'center';
          tl.animate([{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: delay + 300, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
        }
        if (v.tangent.label !== false) { var lt = text(s, X(a + span * .7), Y(ya + m * span * .7) - 10, v.tangent.label || ('slope = ' + nice(m)), 'mx-tlabel'); fadeIn(lt, delay + 900); }
        delay += 600;
      } catch (e) {}
    }
    (v.pts || []).forEach(function (p, k) {
      var c = svgEl('circle', { cx: X(p.x), cy: Y(p.y), r: 6, class: 'mx-pt' + (v.hl && p.kind === v.hl ? ' is-hl' : '') }, s);
      popIn(c, delay + 200 + k * 250);
      if (p.label) { var t = text(s, X(p.x) + (X(p.x) > W - 90 ? -10 : 10), Y(p.y) + (Y(p.y) < T + 24 ? 20 : -10), p.label, 'mx-plabel', X(p.x) > W - 90 ? 'end' : 'start'); fadeIn(t, delay + 350 + k * 250); }
    });
    if (v.xlab) text(s, W - R, H - B - 6, v.xlab, 'mx-axlab', 'end');
    if (v.ylab) text(s, L + 6, T + 12, v.ylab, 'mx-axlab', 'start');
    return s;
  }
  // The sign of f′(x) on a number line: where it's zero, and + or − between.
  function signs(v) {
    var W = 520, H = 110, L = 30, R = 30, x0 = v.x[0], x1 = v.x[1], X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - R); };
    var s = svgBox(W, H, 'mx-signs');
    var cuts = [x0].concat(v.roots || [], [x1]);
    (v.signs || []).forEach(function (sg, k) {
      var a = X(cuts[k]), b = X(cuts[k + 1]), up = sg === '+';
      var r = svgEl('rect', { x: a, y: 30, width: b - a, height: 26, class: up ? 'mx-pos' : 'mx-neg' }, s);
      fadeIn(r, 200 + k * 350);
      var t = text(s, (a + b) / 2, 49, (up ? '+  increasing' : '−  decreasing'), 'mx-signt');
      fadeIn(t, 300 + k * 350);
    });
    svgEl('line', { x1: L, x2: W - R, y1: 56, y2: 56, class: 'mx-axisline' }, s);
    (v.roots || []).forEach(function (r, k) {
      svgEl('line', { x1: X(r), x2: X(r), y1: 22, y2: 64, class: 'mx-rootline' }, s);
      text(s, X(r), 84, 'x = ' + nice(r), 'mx-tick');
    });
    if (v.label) text(s, L, 16, v.label, 'mx-axlab', 'start');
    return s;
  }
  // Solids and flat shapes, drawn in a simple oblique view, each dimension labelled; the one a step uses (hl) glows.
  function shape(v) {
    var W = 360, H = 280, s = svgBox(W, H, 'mx-shape'), d = v.dims || {}, lab = v.labels || {}, hl = v.hl;
    var add = [];
    function dim(x1, y1, x2, y2, key, side) {
      if (!lab[key]) return;
      var g = svgEl('g', { class: 'mx-dim' + (hl === key ? ' is-hl' : '') }, s);
      svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, g);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, off = side || [0, -8];
      var t = text(g, mx + off[0], my + off[1], lab[key], 'mx-dimt', off[0] > 0 ? 'start' : off[0] < 0 ? 'end' : 'middle');
      add.push(g);
      return t;
    }
    var k = v.kind, cx = W / 2;
    var body = svgEl('g', { class: 'mx-solid' }, s);
    if (k === 'cylinder' || k === 'cone' || k === 'hemisphere') {
      var rw = 90, ry = 24, top = 50, bot = 220;
      if (k === 'cylinder') {
        svgEl('path', { d: 'M' + (cx - rw) + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'L' + (cx + rw) + ' ' + top, class: 'mx-face' }, body);
        svgEl('ellipse', { cx: cx, cy: top, rx: rw, ry: ry, class: 'mx-face mx-top' }, body);
        svgEl('path', { d: 'M' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 1 ' + (cx + rw) + ' ' + bot, class: 'mx-hidden' }, body);
        dim(cx, top, cx + rw, top, 'r', [0, -10]);
        dim(cx + rw + 18, top, cx + rw + 18, bot, 'h', [8, 4]);
        dim(cx - rw, top, cx + rw, top, 'd', [0, -12]);
      } else if (k === 'cone') {
        svgEl('path', { d: 'M' + cx + ' ' + top + 'L' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 0 ' + (cx + rw) + ' ' + bot + 'Z', class: 'mx-face' }, body);
        svgEl('path', { d: 'M' + (cx - rw) + ' ' + bot + 'A' + rw + ' ' + ry + ' 0 0 1 ' + (cx + rw) + ' ' + bot, class: 'mx-hidden' }, body);
        svgEl('line', { x1: cx, y1: top, x2: cx, y2: bot, class: 'mx-hidden' }, body);
        dim(cx, bot, cx + rw, bot, 'r', [0, -8]);
        dim(cx + 4, top, cx + 4, bot, 'h', [8, 0]);
        dim(cx, top, cx + rw, bot, 'l', [12, -6]);
      } else {
        var cy = 170;
        svgEl('path', { d: 'M' + (cx - rw - 20) + ' ' + cy + 'A' + (rw + 20) + ' ' + (rw + 20) + ' 0 0 1 ' + (cx + rw + 20) + ' ' + cy, class: 'mx-face' }, body);
        svgEl('ellipse', { cx: cx, cy: cy, rx: rw + 20, ry: ry, class: 'mx-face mx-top' }, body);
        dim(cx, cy, cx + rw + 20, cy, 'r', [0, -8]);
      }
    } else if (k === 'sphere') {
      var r = 100, c2 = 145;
      svgEl('circle', { cx: cx, cy: c2, r: r, class: 'mx-face' }, body);
      svgEl('path', { d: 'M' + (cx - r) + ' ' + c2 + 'A' + r + ' 26 0 0 0 ' + (cx + r) + ' ' + c2, class: 'mx-edge' }, body);
      svgEl('path', { d: 'M' + (cx - r) + ' ' + c2 + 'A' + r + ' 26 0 0 1 ' + (cx + r) + ' ' + c2, class: 'mx-hidden' }, body);
      dim(cx, c2, cx + r, c2, 'r', [0, -8]);
      dim(cx - r, c2, cx + r, c2, 'd', [0, -8]);
    } else if (k === 'cuboid' || k === 'tri-prism') {
      var w = 170, h = 120, dx = 60, dy = -40, x = 70, y = 220;
      if (k === 'cuboid') {
        svgEl('path', { d: 'M' + x + ' ' + y + 'h' + w + 'v' + (-h) + 'h' + (-w) + 'Z', class: 'mx-face' }, body);
        svgEl('path', { d: 'M' + x + ' ' + (y - h) + 'l' + dx + ' ' + dy + 'h' + w + 'l' + (-dx) + ' ' + (-dy) + 'Z', class: 'mx-face mx-top' }, body);
        svgEl('path', { d: 'M' + (x + w) + ' ' + y + 'l' + dx + ' ' + dy + 'v' + (-h) + 'l' + (-dx) + ' ' + (-dy) + 'Z', class: 'mx-face mx-side' }, body);
        dim(x, y + 14, x + w, y + 14, 'l', [0, 16]);
        dim(x + w + 10, y, x + w + dx + 10, y + dy, 'w', [10, 8]);
        dim(x - 12, y, x - 12, y - h, 'h', [-8, 4]);
      } else {
        svgEl('path', { d: 'M' + x + ' ' + y + 'h' + w + 'l' + (-w / 2) + ' ' + (-h) + 'Z', class: 'mx-face' }, body);
        svgEl('path', { d: 'M' + (x + w / 2) + ' ' + (y - h) + 'l' + dx + ' ' + dy + 'l' + (w / 2) + ' ' + h + 'l' + (-dx) + ' ' + (-dy) + 'Z', class: 'mx-face mx-side' }, body);
        svgEl('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y - h, class: 'mx-hidden' }, body);
        dim(x, y + 14, x + w, y + 14, 'b', [0, 16]);
        dim(x + w / 2 + 4, y, x + w / 2 + 4, y - h, 'h', [8, 0]);
        dim(x + w + 10, y, x + w + dx + 10, y + dy, 'l', [10, 8]);
      }
    } else if (k === 'circle' || k === 'sector') {
      var rr = 105, cc = [cx, 145];
      if (k === 'circle') svgEl('circle', { cx: cc[0], cy: cc[1], r: rr, class: 'mx-face' }, body);
      else {
        var ang = (d.angle || 90) * Math.PI / 180, ex = cc[0] + rr * Math.cos(-ang), ey = cc[1] + rr * Math.sin(-ang);
        svgEl('path', { d: 'M' + cc[0] + ' ' + cc[1] + 'L' + (cc[0] + rr) + ' ' + cc[1] + 'A' + rr + ' ' + rr + ' 0 ' + (ang > Math.PI ? 1 : 0) + ' 0 ' + ex + ' ' + ey + 'Z', class: 'mx-face' }, body);
        if (lab.angle) text(s, cc[0] + 28, cc[1] - 10, lab.angle, 'mx-dimt' + (hl === 'angle' ? ' is-hl' : ''), 'start');
      }
      dim(cc[0], cc[1], cc[0] + rr, cc[1], 'r', [0, k === 'sector' ? 20 : -8]);
      dim(cc[0] - rr, cc[1], cc[0] + rr, cc[1], 'd', [0, 18]);
    } else if (k === 'rectangle' || k === 'parallelogram' || k === 'trapezium' || k === 'triangle') {
      var x2 = 60, y2 = 220, w2 = 240, h2 = 150, pts;
      if (k === 'rectangle') pts = [[x2, y2], [x2 + w2, y2], [x2 + w2, y2 - h2], [x2, y2 - h2]];
      else if (k === 'parallelogram') pts = [[x2, y2], [x2 + w2 - 50, y2], [x2 + w2, y2 - h2], [x2 + 50, y2 - h2]];
      else if (k === 'trapezium') pts = [[x2, y2], [x2 + w2, y2], [x2 + w2 - 60, y2 - h2], [x2 + 60, y2 - h2]];
      else pts = [[x2, y2], [x2 + w2, y2], [x2 + 90, y2 - h2]];
      svgEl('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L') + 'Z', class: 'mx-face' }, body);
      dim(x2, y2 + 14, x2 + w2, y2 + 14, 'b', [0, 16]);
      if (k === 'trapezium') dim(x2 + 60, y2 - h2 - 12, x2 + w2 - 60, y2 - h2 - 12, 'a', [0, -6]);
      if (k === 'rectangle') dim(x2 + w2 + 12, y2, x2 + w2 + 12, y2 - h2, 'h', [8, 0]);
      else { svgEl('line', { x1: pts[pts.length - 1][0], y1: y2, x2: pts[pts.length - 1][0], y2: y2 - h2, class: 'mx-hidden' }, body); dim(pts[pts.length - 1][0] + 4, y2, pts[pts.length - 1][0] + 4, y2 - h2, 'h', [8, 0]); }
    } else if (k === 'composite') {
      return composite(v);
    }
    Array.prototype.forEach.call(body.querySelectorAll('.mx-face,.mx-edge'), function (p, i) { drawIn(p, 100 + i * 160, 900); });
    add.forEach(function (g, i) { fadeIn(g, 800 + i * 220); });
    return s;
  }
  // Solids (or flat shapes) joined on one upright axis, listed top to bottom: a hemisphere on a cylinder (a silo), a cone
  // on a hemisphere (a spinning top), a triangle on a rectangle (a gable end). They share the widest radius or width;
  // each part's height is drawn to scale, with its own labels, and the join is a dashed ellipse.
  function composite(v) {
    var W = 360, H = 290, s = svgBox(W, H, 'mx-shape mx-composite'), parts = v.parts || [], cx = W / 2;
    var flat = parts.every(function (p) { return /^(triangle|rectangle|trapezium)$/.test(p.kind); });
    var rad = Math.max.apply(null, parts.map(function (p) { var d = p.dims || {}; return d.r || (d.b ? d.b / 2 : 0) || 1; }));
    var units = parts.map(function (p) { var d = p.dims || {}; return p.kind === 'hemisphere' ? (d.r || rad) : p.kind === 'sphere' ? 2 * (d.r || rad) : d.h || rad; });
    var total = units.reduce(function (a, b) { return a + b; }, 0) || 1;
    var k = Math.min(230 / total, 110 / rad), rw = rad * k, ry = flat ? 0 : Math.max(10, rw * .24), y = (H - total * k) / 2 + (flat ? 0 : 6);
    var body = svgEl('g', { class: 'mx-solid' }, s), add = [];
    function lab(x1, y1, x2, y2, txt, hl, off) {
      if (!txt) return;
      var g = svgEl('g', { class: 'mx-dim' + (hl ? ' is-hl' : '') }, s);
      svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, g);
      text(g, (x1 + x2) / 2 + off[0], (y1 + y2) / 2 + off[1], txt, 'mx-dimt', off[0] > 0 ? 'start' : off[0] < 0 ? 'end' : 'middle');
      add.push(g);
    }
    parts.forEach(function (p, i) {
      var d = p.dims || {}, L = p.labels || {}, hu = units[i] * k, top = y, bot = y + hu, first = i === 0, last = i === parts.length - 1, r = (d.r || (d.b ? d.b / 2 : rad)) * k;
      if (p.kind === 'cylinder') {
        svgEl('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + (cx - r) + ' ' + bot + 'A' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + bot + 'L' + (cx + r) + ' ' + top, class: 'mx-face' }, body);
        if (first) svgEl('ellipse', { cx: cx, cy: top, rx: r, ry: ry, class: 'mx-face mx-top' }, body);
        if (last) svgEl('path', { d: 'M' + (cx - r) + ' ' + bot + 'A' + r + ' ' + ry + ' 0 0 1 ' + (cx + r) + ' ' + bot, class: 'mx-hidden' }, body);
      } else if (p.kind === 'hemisphere') {
        var up = first || !last && i === 0, dome = first;
        svgEl('path', { d: 'M' + (cx - r) + ' ' + (dome ? bot : top) + 'A' + r + ' ' + hu + ' 0 0 ' + (dome ? 1 : 0) + ' ' + (cx + r) + ' ' + (dome ? bot : top), class: 'mx-face' }, body);
      } else if (p.kind === 'cone') {
        var apexUp = first;
        if (apexUp) svgEl('path', { d: 'M' + cx + ' ' + top + 'L' + (cx - r) + ' ' + bot + (last ? 'A' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + bot : 'L' + (cx + r) + ' ' + bot) + 'Z', class: 'mx-face' }, body);
        else svgEl('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + cx + ' ' + bot + 'L' + (cx + r) + ' ' + top, class: 'mx-face' }, body);
        svgEl('line', { x1: cx, y1: top, x2: cx, y2: bot, class: 'mx-hidden' }, body);
        if (L.l) lab(apexUp ? cx : cx + r, apexUp ? top : top, apexUp ? cx + r : cx, apexUp ? bot : bot, L.l, p.hl === 'l', [14, -4]);
      } else if (p.kind === 'triangle') {
        svgEl('path', { d: 'M' + (cx - r) + ' ' + bot + 'L' + cx + ' ' + top + 'L' + (cx + r) + ' ' + bot + (last ? 'Z' : ''), class: 'mx-face' }, body);
      } else if (p.kind === 'rectangle' || p.kind === 'trapezium') {
        svgEl('path', { d: 'M' + (cx - r) + ' ' + top + 'L' + (cx - r) + ' ' + bot + 'L' + (cx + r) + ' ' + bot + 'L' + (cx + r) + ' ' + top + (first ? 'Z' : ''), class: 'mx-face' }, body);
      } else if (p.kind === 'sphere') {
        svgEl('circle', { cx: cx, cy: (top + bot) / 2, r: hu / 2, class: 'mx-face' }, body);
      }
      // The join with the next part: a dashed ellipse (solids) or line (flat).
      if (!last) {
        if (flat) svgEl('line', { x1: cx - r, x2: cx + r, y1: bot, y2: bot, class: 'mx-hidden' }, body);
        else svgEl('ellipse', { cx: cx, cy: bot, rx: r, ry: ry, class: 'mx-hidden' }, body);
      }
      // Its height beside it; its radius (or width) on its widest line.
      // Long names ("cone height") go on the left, so they aren't cut off at the edge.
      if (L.h) { var left = String(L.h).length > 6; lab(left ? cx - rw - 22 : cx + rw + 22, top, left ? cx - rw - 22 : cx + rw + 22, bot, L.h, p.hl === 'h', [left ? -8 : 8, 4]); }
      var join = p.kind === 'hemisphere' ? (first ? bot : top) : p.kind === 'cone' ? (first ? bot : top) : p.kind === 'triangle' ? bot : top;
      if (L.r) lab(cx, join, cx + r, join, L.r, p.hl === 'r', [0, -8]);
      if (L.b && last) lab(cx - r, bot + 12, cx + r, bot + 12, L.b, p.hl === 'b', [0, 16]);
      y = bot;
    });
    Array.prototype.forEach.call(body.querySelectorAll('.mx-face,.mx-edge'), function (n, i) { drawIn(n, 100 + i * 160, 900); });
    add.forEach(function (g, i) { fadeIn(g, 800 + i * 220); });
    return s;
  }
  // The trapezoidal rule: the curve's heights at equal steps, and the strips under it.
  function trap(v) {
    var W = 520, H = 280, L = 30, R = 20, T = 20, B = 40, ys = v.ys || [], n = ys.length - 1, top = Math.max.apply(null, ys.concat([1]));
    var X = function (i) { return L + i / n * (W - L - R); }, Y = function (y) { return T + (1 - y / top) * (H - T - B); };
    var s = svgBox(W, H, 'mx-trap');
    svgEl('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: 'mx-axisline' }, s);
    ys.forEach(function (y, i) {
      if (i < n) {
        var strip = svgEl('path', { d: 'M' + X(i) + ' ' + Y(0) + 'L' + X(i) + ' ' + Y(y) + 'L' + X(i + 1) + ' ' + Y(ys[i + 1]) + 'L' + X(i + 1) + ' ' + Y(0) + 'Z', class: 'mx-strip' + (i % 2 ? ' is-alt' : '') }, s);
        fadeIn(strip, 300 + i * 140);
      }
      var l = svgEl('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(y), class: 'mx-height' }, s);
      drawIn(l, 200 + i * 140, 500);
      if (v.labels !== false) text(s, X(i), Y(y) - 8, nice(y), 'mx-tick');
      text(s, X(i), Y(0) + 18, (v.names ? v.names[i] : 'y' + String(i + 1).split('').map(function (c) { return String.fromCharCode(8320 + +c); }).join('')), 'mx-tick');
    });
    if (v.h != null) text(s, (X(0) + X(1)) / 2, Y(0) + 34, 'h = ' + v.h, 'mx-dimt is-hl');
    return s;
  }
  function table(v) {
    var t = document.createElement('table');
    t.className = 'mx-table';
    var hl = {};
    (v.hl || []).forEach(function (c) { hl[c[0] + ',' + c[1]] = true; });
    var html = '';
    if (v.head) html += '<thead><tr>' + v.head.map(function (h, j) { return '<th' + (hl['-1,' + j] ? ' class="is-hl"' : '') + '>' + inline(h) + '</th>'; }).join('') + '</tr></thead>';
    html += '<tbody>' + (v.rows || []).map(function (r, i) {
      return '<tr>' + r.map(function (c, j) { return '<td' + (hl[i + ',' + j] ? ' class="is-hl"' : '') + '>' + inline(c) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    t.innerHTML = html;
    if (!reduce()) t.querySelectorAll('.is-hl').forEach(function (c, k) { c.animate([{ backgroundColor: 'rgba(255,200,0,0)' }, { backgroundColor: 'rgba(255,200,0,.45)' }], { duration: 500, delay: 300 + k * 160, fill: 'backwards' }); });
    return t;
  }
  function grid(v) {
    var rows = v.rows || [], cols = v.cols || [], cells = v.cells, hl = {};
    (v.hl || []).forEach(function (c) { hl[c[0] + ',' + c[1]] = true; });
    var t = document.createElement('table');
    t.className = 'mx-table mx-grid-t';
    var html = '<thead><tr><th class="mx-corner">' + esc(v.rowsLabel || '') + (v.colsLabel ? ' \\ ' + esc(v.colsLabel) : '') + '</th>' + cols.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += '<tr><th>' + inline(r) + '</th>' + cols.map(function (c, j) {
        var val = cells ? cells[i][j] : r + ',' + c;
        return '<td' + (hl[i + ',' + j] ? ' class="is-hl"' : '') + '>' + inline(String(val)) + '</td>';
      }).join('') + '</tr>';
    });
    t.innerHTML = html + '</tbody>';
    if (!reduce()) t.querySelectorAll('td.is-hl').forEach(function (c, k) { c.animate([{ transform: 'scale(.6)', backgroundColor: 'rgba(255,200,0,0)' }, { transform: 'none', backgroundColor: 'rgba(255,200,0,.45)' }], { duration: 380, delay: 250 + k * 90, fill: 'backwards' }); });
    return t;
  }
  function tree(v) {
    var lv = v.levels || [], first = lv[0] || [], second = lv[1] || [], leaves = 0;
    first.forEach(function (b, i) { leaves += Math.max(1, (second[i] || []).length); });
    var W = 520, H = Math.max(180, leaves * 46 + 20), s = svgBox(W, H, 'mx-tree'), row = 0, hl = {};
    (v.hl || []).forEach(function (path) { hl[path.join('>')] = true; });
    var y0 = H / 2, x0 = 30, x1 = 200, x2 = 380, delay = 150;
    svgEl('circle', { cx: x0, cy: y0, r: 4, class: 'mx-node' }, s);
    first.forEach(function (b, i) {
      var kids = second[i] || [], n = Math.max(1, kids.length), ys = [];
      for (var k = 0; k < n; k++) ys.push(10 + (row + k + .5) * ((H - 20) / leaves));
      row += n;
      var yb = ys.reduce(function (a, c) { return a + c; }, 0) / n, on = Object.keys(hl).some(function (p) { return p.split('>')[0] === b.label; });
      var e = svgEl('line', { x1: x0, y1: y0, x2: x1, y2: yb, class: 'mx-branch' + (on ? ' is-hl' : '') }, s);
      drawIn(e, delay, 500);
      var tl = text(s, x1 + 10, yb + 5, b.label, 'mx-blabel', 'start'); fadeIn(tl, delay + 350);
      if (b.p) { var tp = text(s, (x0 + x1) / 2, (y0 + yb) / 2 - 8, b.p, 'mx-bp'); fadeIn(tp, delay + 350); }
      delay += 300;
      kids.forEach(function (c, k) {
        var on2 = hl[b.label + '>' + c.label];
        var e2 = svgEl('line', { x1: x1 + 34, y1: yb, x2: x2, y2: ys[k], class: 'mx-branch' + (on2 ? ' is-hl' : '') }, s);
        drawIn(e2, delay, 450);
        var t2 = text(s, x2 + 10, ys[k] + 5, c.label + (c.out ? '   ' + c.out : ''), 'mx-blabel', 'start'); fadeIn(t2, delay + 300);
        if (c.p) { var p2 = text(s, (x1 + 34 + x2) / 2, (yb + ys[k]) / 2 - 7, c.p, 'mx-bp'); fadeIn(p2, delay + 300); }
        delay += 220;
      });
    });
    return s;
  }
  function venn(v) {
    var W = 420, H = 250, s = svgBox(W, H, 'mx-venn'), sets = v.sets || ['A', 'B'], hl = v.hl;
    svgEl('rect', { x: 10, y: 10, width: W - 20, height: H - 20, rx: 10, class: 'mx-universal' + (hl === 'none' ? ' is-hl' : '') }, s);
    text(s, 26, 34, v.u || 'U', 'mx-axlab', 'start');
    var a = svgEl('circle', { cx: 160, cy: 128, r: 86, class: 'mx-set' + (hl === 'A' || hl === 0 ? ' is-hl' : '') }, s);
    var b = svgEl('circle', { cx: 260, cy: 128, r: 86, class: 'mx-set is-b' + (hl === 'B' || hl === 1 ? ' is-hl' : '') }, s);
    drawIn(a, 100, 800); drawIn(b, 300, 800);
    text(s, 110, 40, sets[0], 'mx-setname'); text(s, 310, 40, sets[1], 'mx-setname');
    var only = v.only || [];
    [[118, 134, only[0], hl === 'onlyA'], [210, 134, v.both, hl === 'both'], [302, 134, only[1], hl === 'onlyB'], [370, 225, v.none, hl === 'none']].forEach(function (c, k) {
      if (c[2] == null) return;
      var t = text(s, c[0], c[1], String(c[2]), 'mx-vnum' + (c[3] ? ' is-hl' : '')); popIn(t, 700 + k * 200);
    });
    return s;
  }
  function bars(v) {
    var vals = v.vals || [], labels = v.labels || [], W = 520, H = 300, L = 44, R = 14, T = 16, B = 46, top = Math.max.apply(null, vals.concat([1]));
    var tk = ticks(0, top * 1.1), ymax = tk[tk.length - 1] || top, n = vals.length;
    var s = svgBox(W, H, 'mx-bars'), slot = (W - L - R) / n, bw = v.kind === 'hist' ? slot : slot * .62;
    var Y = function (y) { return T + (1 - y / ymax) * (H - T - B); };
    tk.forEach(function (t) { svgEl('line', { x1: L, x2: W - R, y1: Y(t), y2: Y(t), class: 'mx-gridl' }, s); text(s, L - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    vals.forEach(function (val, i) {
      var x = L + i * slot + (slot - bw) / 2, r = svgEl('rect', { x: x, y: Y(val), width: bw, height: Y(0) - Y(val), class: 'mx-bar' + ((v.hl || []).indexOf(i) >= 0 ? ' is-hl' : '') }, s);
      if (!reduce()) { r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'bottom'; r.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 600, delay: 150 + i * 110, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }); }
      var vt = text(s, x + bw / 2, Y(val) - 6, nice(val), 'mx-tick'); fadeIn(vt, 500 + i * 110);
      text(s, x + bw / 2, H - B + 18, labels[i] == null ? '' : String(labels[i]), 'mx-tick');
    });
    svgEl('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), class: 'mx-axisline' }, s);
    if (v.ylab) text(s, L, 10, v.ylab, 'mx-axlab', 'start');
    if (v.xlab) text(s, (W + L) / 2, H - 6, v.xlab, 'mx-axlab');
    return s;
  }
  function pie(v) {
    var vals = v.vals || [], labels = v.labels || [], sum = vals.reduce(function (a, b) { return a + b; }, 0) || 1;
    var W = 440, H = 260, cx = 130, cy = 130, r = 105, s = svgBox(W, H, 'mx-pie'), a0 = -Math.PI / 2;
    vals.forEach(function (val, i) {
      var a1 = a0 + val / sum * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      var p = svgEl('path', { d: 'M' + cx + ' ' + cy + 'L' + (cx + r * Math.cos(a0)) + ' ' + (cy + r * Math.sin(a0)) + 'A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + (cx + r * Math.cos(a1)) + ' ' + (cy + r * Math.sin(a1)) + 'Z', class: 'mx-slice mx-s' + (i % 6) }, s);
      popIn(p, 150 + i * 160);
      var deg = val / sum * 360;
      var t = text(s, 262, 40 + i * 28, (labels[i] || '') + (v.show === 'angles' ? ': ' + nice(deg) + '°' : ': ' + nice(val)), 'mx-plabel mx-s' + (i % 6), 'start');
      fadeIn(t, 250 + i * 160);
      a0 = a1;
    });
    return s;
  }
  function stem(v) {
    var t = document.createElement('table');
    t.className = 'mx-table mx-stem';
    t.innerHTML = '<tbody>' + (v.rows || []).map(function (r) {
      return '<tr>' + (v.left ? '<td class="mx-leaf is-left">' + esc(r[2] || '') + '</td>' : '') + '<th>' + esc(r[0]) + '</th><td class="mx-leaf">' + esc(r[1]) + '</td></tr>';
    }).join('') + '</tbody>' + (v.key ? '<caption>Key: ' + esc(v.key) + '</caption>' : '');
    if (!reduce()) t.querySelectorAll('tr').forEach(function (r, k) { r.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 120 + k * 110, fill: 'backwards' }); });
    return t;
  }
  function scatter(v) {
    var W = 520, H = 320, L = 44, R = 14, T = 14, B = 34, x0 = v.x[0], x1 = v.x[1], y0 = v.y[0], y1 = v.y[1];
    var X = function (x) { return L + (x - x0) / (x1 - x0) * (W - L - R); }, Y = function (y) { return T + (y1 - y) / (y1 - y0) * (H - T - B); };
    var s = svgBox(W, H, 'mx-scatter');
    ticks(x0, x1).forEach(function (t) { svgEl('line', { x1: X(t), x2: X(t), y1: T, y2: H - B, class: 'mx-gridl' }, s); text(s, X(t), H - B + 16, nice(t), 'mx-tick'); });
    ticks(y0, y1).forEach(function (t) { svgEl('line', { x1: L, x2: W - R, y1: Y(t), y2: Y(t), class: 'mx-gridl' }, s); text(s, L - 6, Y(t) + 4, nice(t), 'mx-tick', 'end'); });
    svgEl('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, class: 'mx-axisline' }, s);
    svgEl('line', { x1: L, x2: L, y1: T, y2: H - B, class: 'mx-axisline' }, s);
    (v.pts || []).forEach(function (p, k) { var c = svgEl('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5, class: 'mx-pt' }, s); popIn(c, 120 + k * 60); });
    if (v.line) { var ln = svgEl('path', { d: 'M' + X(x0) + ' ' + Y(v.line.m * x0 + v.line.c) + 'L' + X(x1) + ' ' + Y(v.line.m * x1 + v.line.c), class: 'mx-line2' }, s); drawIn(ln, 300 + (v.pts || []).length * 60, 900); }
    if (v.xlab) text(s, (W + L) / 2, H - 4, v.xlab, 'mx-axlab');
    if (v.ylab) text(s, L + 4, T + 10, v.ylab, 'mx-axlab', 'start');
    return s;
  }
  var DRAW = { graph: graph, signs: signs, shape: shape, trap: trap, table: table, grid: grid, tree: tree, venn: venn, bars: bars, pie: pie, stem: stem, scatter: scatter };
  function vis(v) {
    if (!v || !DRAW[v.t]) return null;
    try { var n = DRAW[v.t](v); var box = document.createElement('div'); box.className = 'mx-vis mx-vis--' + v.t; box.appendChild(n); return box; }
    catch (e) { return null; }
  }

  window.MathsRender = { tex: tex, inline: inline, compile: compile, check: check, Board: Board, vis: vis, esc: esc };
})();

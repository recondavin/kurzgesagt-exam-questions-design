// Maths rendering for the revision site: KaTeX with two macros, a working board that adds a step's lines and moves the
// pieces that carry over (a morph), and the checker for what a student types (the pictures are maths-scenes.js). Used by the maths desk (maths/maths-desk.js) and the maths hub (maths.html).
//   \hl{...}      highlights the bit that matters (it glows as the line arrives)
//   \mv{key}{...} tags a piece: when the next line has the same key, that piece slides from its old place to its new
(function () {
  'use strict';
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
  // line slides from there to its place in the new line; the rest is written in left to right; \hl parts glow.
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
      // The rest of the line is written in left to right, a symbol at a time, once the movers have set off.
      var start = (movers.length ? 650 : 120) + k * 700, bits = [];
      line.querySelectorAll('.katex-html > .base').forEach(function (b) {
        Array.prototype.forEach.call(b.children, function (c) {
          if (!c.classList.contains('strut') && !c.matches('[data-mv]') && !c.querySelector('[data-mv]')) bits.push(c);
        });
      });
      var gap = bits.length ? Math.min(55, 900 / bits.length) : 0;
      bits.forEach(function (c, j) {
        c.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }],
          { duration: 300, delay: start + j * gap, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
      movers.forEach(function (m) { m.style.position = 'relative'; m.style.zIndex = '2'; });
      line.querySelectorAll('.mx-hl').forEach(function (h) {
        h.animate([{ backgroundColor: 'rgba(255,200,0,0)' }, { backgroundColor: 'rgba(255,200,0,.5)' }, { backgroundColor: 'rgba(255,200,0,.18)' }],
          { duration: 1000, delay: start + bits.length * gap + 150, fill: 'backwards' });
      });
      prev = line;
    });
    if (opts && opts.follow) setTimeout(function () { var last = host.lastElementChild; if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' }); }, 60);
  };

  // The pictures (graphs, solids, bags, dice, spinners, trees, charts...) are in maths/maths-scenes.js, which adds
  // MathsRender.vis when it loads.
  window.MathsRender = { tex: tex, inline: inline, compile: compile, check: check, Board: Board, vis: function () { return null; }, esc: esc };
})();

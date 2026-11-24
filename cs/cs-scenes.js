// Computer Science scenes for the desk, added to the maths scene engine (maths/maths-scenes.js: the same building-up
// steps, where only what's new animates). Kinds (vocabulary in tools/cs/SCENES.md, every kind in tools/cs/gallery.html):
//   bits     place values over a row of bits: the bits set one by one, the total counting up (binary, two's
//            complement, hex nibbles)
//   gates    a logic circuit: AND, OR, NOT, NAND, NOR, XOR; the signals flow through, 1s lit; its truth table
//   cpu      the von Neumann machine: control unit, ALU, registers, RAM, the address, data and control buses; a value
//            travels each step of the fetch-decode-execute cycle
//   network  computers, routers, servers and the cloud; packets travel along the links
//   flow     a flowchart; a token follows the path through it
//   array    a list in boxes: comparisons, swaps, sorted parts, search pointers (lo, mid, hi)
(function () {
  'use strict';
  var R = window.MathsRender;
  if (!R || !R.addKind) return;
  var K = R.sceneKit, el = K.el, txt = K.txt, svgBox = K.svgBox, clamp = K.clamp, list = K.list, tween = K.tween, ease = K.ease;
  var ON = '#FFC800', OFF = '#47555C';

  // ---------- bits ----------
  function bitsOf(v) {
    var n = +v.n || 8, out = [];
    if (v.bits != null) { var b = String(v.bits).replace(/\s+/g, ''); n = b.length; for (var i = 0; i < n; i++) out.push(+b[i]); return { n: n, bits: out }; }
    var val = Math.round(+v.value || 0);
    if (val < 0) val = Math.pow(2, n) + val; // two's complement
    for (var j = n - 1; j >= 0; j--) out.push((val >> j) & 1);
    return { n: n, bits: out };
  }
  function bits(v, q) {
    var B = bitsOf(v), n = B.n, b = B.bits, W = 520, gapN = v.hex ? 14 : 0;
    var cw = Math.min(56, (W - 40 - gapN * Math.max(0, n / 4 - 1)) / n), x0 = (W - (n * cw + gapN * (Math.ceil(n / 4) - 1))) / 2, H = v.hex ? 200 : 168;
    var s = svgBox(W, H, 'mx-bits'), KK = 'bits' + n + (v.signed ? 's' : '') + ':';
    var X = function (i) { return x0 + i * cw + (v.hex ? Math.floor(i / 4) * gapN : 0); };
    var weights = [];
    for (var i = 0; i < n; i++) weights.push((v.signed && i === 0 ? -1 : 1) * Math.pow(2, n - 1 - i));
    var hl = list(v.hl).map(Number), total = 0, terms = [];
    weights.forEach(function (w, i) {
      var g = el('g', { class: 'cs-place' + (b[i] ? ' is-on' : '') + (hl.indexOf(i) >= 0 ? ' is-hl' : '') }, s);
      txt(g, X(i) + cw / 2, 26, (w < 0 ? '−' : '') + Math.abs(w), 'cs-placet');
      q.fade(g, KK + 'w' + i, 25, 300);
      var c = el('g', { class: 'cs-bit' + (b[i] ? ' is-on' : '') + (hl.indexOf(i) >= 0 ? ' is-hl' : '') }, s);
      el('rect', { x: X(i) + 3, y: 38, width: cw - 6, height: cw - 6, rx: 8 }, c);
      txt(c, X(i) + cw / 2, 38 + (cw - 6) / 2 + 9, b[i], 'cs-bitt');
      if (b[i]) { total += w; terms.push((w < 0 ? '−' : '') + Math.abs(w)); }
    });
    // The bits go on left to right, each 1 lighting its place value.
    b.forEach(function (bit, i) {
      var c = s.querySelectorAll('.cs-bit')[i];
      c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center';
      q.anim(c, KK + 'b' + i + bit, bit ? 160 : 70, [{ opacity: 0, transform: 'rotateX(90deg)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    });
    if (v.show !== false) {
      var line = v.sum || (terms.length ? terms.join(' + ').replace(/\+ −/g, '− ') + ' = ' + total : '0');
      var st = txt(s, W / 2, 38 + cw + 26, line, 'cs-sumt');
      q.rise(st, KK + 'sum' + line, 200);
    }
    if (v.hex) {
      for (var k = 0; k < n; k += 4) {
        var nib = b.slice(k, k + 4), val = parseInt(nib.join(''), 2), hx = val.toString(16).toUpperCase();
        var g2 = el('g', { class: 'cs-nib' }, s), xa = X(k) + 3, xb = X(Math.min(n, k + 4) - 1) + cw - 3;
        el('path', { d: 'M' + xa + ' ' + (H - 52) + 'V' + (H - 44) + 'H' + xb + 'V' + (H - 52), class: 'cs-brace' }, g2);
        txt(g2, (xa + xb) / 2, H - 20, nib.join('') + ' = ' + val + ' = ' + hx, 'cs-nibt');
        q.rise(g2, KK + 'nib' + k + hx, 260);
      }
    }
    if (v.label) txt(s, 12, H - 6, v.label, 'mx-axlab', 'start');
    return s;
  }

  // ---------- logic gates ----------
  var OPS = { AND: function (a) { return a.every(Boolean) ? 1 : 0; }, OR: function (a) { return a.some(Boolean) ? 1 : 0; }, NOT: function (a) { return a[0] ? 0 : 1; },
    NAND: function (a) { return a.every(Boolean) ? 0 : 1; }, NOR: function (a) { return a.some(Boolean) ? 0 : 1; }, XOR: function (a) { return a.filter(Boolean).length % 2; },
    XNOR: function (a) { return a.filter(Boolean).length % 2 ? 0 : 1; } };
  function gatePath(type, x, y, w, h) {
    var t = type.replace(/^N(?!OT)/, '').replace(/^X/, ''), my = y + h / 2;
    if (type === 'NOT') return 'M' + x + ' ' + y + 'L' + (x + w - 10) + ' ' + my + 'L' + x + ' ' + (y + h) + 'Z';
    if (t === 'AND') return 'M' + x + ' ' + y + 'H' + (x + w * .5) + 'A' + (w * .5) + ' ' + (h / 2) + ' 0 0 1 ' + (x + w * .5) + ' ' + (y + h) + 'H' + x + 'Z';
    return 'M' + x + ' ' + y + 'Q' + (x + w * .65) + ' ' + y + ' ' + (x + w) + ' ' + my + 'Q' + (x + w * .65) + ' ' + (y + h) + ' ' + x + ' ' + (y + h) + 'Q' + (x + w * .3) + ' ' + my + ' ' + x + ' ' + y + 'Z';
  }
  function gates(v, q) {
    var ins = Array.isArray(v.inputs) ? v.inputs.map(function (n) { return [n, null]; }) : Object.keys(v.inputs || {}).map(function (n) { return [n, v.inputs[n]]; });
    var G = v.gates || [], byId = {}, col = {}, val = {};
    ins.forEach(function (p) { col[p[0]] = 0; val[p[0]] = p[1] == null ? null : +p[1]; });
    G.forEach(function (g) { byId[g.id] = g; });
    var guard = 0;
    while (G.some(function (g) { return col[g.id] == null; }) && guard++ < 50) {
      G.forEach(function (g) { if (col[g.id] == null && g.in.every(function (x) { return col[x] != null; })) { col[g.id] = 1 + Math.max.apply(null, g.in.map(function (x) { return col[x]; })); var vs = g.in.map(function (x) { return val[x]; }); val[g.id] = vs.some(function (x) { return x == null; }) ? null : OPS[g.type](vs); } });
    }
    var depth = Math.max.apply(null, G.map(function (g) { return col[g.id] || 1; }).concat([1])), tableW = v.table ? 170 : 0;
    var W = 520, cw = (W - tableW - 90) / (depth + .3), H = Math.max(180, Math.max(ins.length, G.length) * 52 + 40);
    var s = svgBox(W, H, 'mx-gates'), KK = 'gates' + G.map(function (g) { return g.type + g.in.join(''); }).join(',') + ':';
    var pos = {}, perCol = {};
    ins.forEach(function (p, i) { pos[p[0]] = { x: 36, y: 30 + (i + .5) * ((H - 60) / ins.length), out: [46, 30 + (i + .5) * ((H - 60) / ins.length)] }; });
    G.forEach(function (g) { var c = col[g.id]; (perCol[c] = perCol[c] || []).push(g); });
    Object.keys(perCol).forEach(function (c) {
      perCol[c].forEach(function (g, i) {
        // A gate sits level with the middle of its inputs where it can.
        var ys = g.in.map(function (x) { return pos[x] ? pos[x].y : H / 2; }), y = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;
        if (perCol[c].length > 1) y = 30 + (i + .5) * ((H - 60) / perCol[c].length);
        var x = 60 + c * cw - cw * .45;
        var bub = g.type === 'NOT' ? x + 53 : /^N|^XN/.test(g.type) ? x + 63 + (/^X/.test(g.type) ? 6 : 0) : null;
        pos[g.id] = { x: x, y: y, bub: bub, out: [bub != null ? bub + 5 : x + 58 + (/^X/.test(g.type) ? 6 : 0), y] };
      });
    });
    var wires = el('g', {}, s), parts = el('g', {}, s);
    // Inputs, with their values.
    ins.forEach(function (p) {
      var g = el('g', { class: 'cs-in' + (val[p[0]] ? ' is-on' : '') }, parts);
      txt(g, 14, pos[p[0]].y + 5, p[0], 'cs-gatet', 'start');
      if (val[p[0]] != null) { el('circle', { cx: 38, cy: pos[p[0]].y, r: 9, class: 'cs-led' }, g); txt(g, 38, pos[p[0]].y + 5, val[p[0]], 'cs-ledt'); }
      q.fade(g, KK + 'in' + p[0] + val[p[0]], 60);
    });
    G.forEach(function (g) {
      var P = pos[g.id], h = 40, gx = P.x, gy = P.y - h / 2, grp = el('g', { class: 'cs-gate' + (val[g.id] ? ' is-on' : '') }, parts);
      el('path', { d: gatePath(g.type, gx + (/^X/.test(g.type) ? 6 : 0), gy, 58, h), class: 'cs-gatebody' }, grp);
      if (/^X/.test(g.type)) el('path', { d: 'M' + gx + ' ' + gy + 'Q' + (gx + 17) + ' ' + P.y + ' ' + gx + ' ' + (gy + h), class: 'cs-gateline' }, grp);
      if (P.bub != null) el('circle', { cx: P.bub, cy: P.y, r: 5, class: 'cs-gatebody' }, grp);
      txt(grp, gx + (g.type === 'NOT' ? 18 : 26) + (/^X/.test(g.type) ? 6 : 0), P.y + 4, g.type, 'cs-gatename');
      q.pop(grp, KK + 'g' + g.id, 140, 400);
      // Wires in: from each input's output, across and up/down to this gate's input pins.
      g.in.forEach(function (src, k) {
        var S = pos[src], pinY = g.in.length === 1 ? P.y : gy + h * (k + 1) / (g.in.length + 1), mx = (S.out[0] + gx) / 2 + k * 6;
        var w = el('path', { d: 'M' + S.out[0] + ' ' + S.out[1] + 'H' + mx + 'V' + pinY + 'H' + (gx + (/^X/.test(g.type) ? 6 : 0) + 4), class: 'cs-wire' + (val[src] ? ' is-on' : val[src] === 0 ? ' is-off' : '') }, wires);
        q.draw(w, KK + 'w' + src + '>' + g.id + val[src], 420, 120);
      });
    });
    // The output(s).
    list(v.out || (G.length ? G[G.length - 1].id : null)).forEach(function (o, i) {
      if (!pos[o]) return;
      var P = pos[o], ox = Math.min(W - tableW - 34, P.out[0] + 28), g = el('g', { class: 'cs-in' + (val[o] ? ' is-on' : '') }, parts);
      var w = el('path', { d: 'M' + P.out[0] + ' ' + P.out[1] + 'H' + (ox - 10), class: 'cs-wire' + (val[o] ? ' is-on' : val[o] === 0 ? ' is-off' : '') }, wires);
      q.draw(w, KK + 'wo' + o + val[o], 300, 80);
      var name = (v.outName && list(v.outName)[i]) || 'Q';
      if (val[o] != null) { el('circle', { cx: ox, cy: P.y, r: 11, class: 'cs-led' }, g); txt(g, ox, P.y + 5, val[o], 'cs-ledt'); }
      txt(g, ox + 16, P.y + 5, name, 'cs-gatet', 'start');
      q.pop(g, KK + 'o' + o + val[o], 200, 480);
    });
    // The truth table: every input combination, the current one lit.
    if (v.table) {
      var names = ins.map(function (p) { return p[0]; }), rows = [], tx = W - tableW + 6, rh = Math.min(22, (H - 40) / (Math.pow(2, names.length) + 1)), colw = (tableW - 12) / (names.length + 1);
      var o = list(v.out || G[G.length - 1].id)[0], tg = el('g', { class: 'cs-tt' }, s);
      names.concat([(v.outName && list(v.outName)[0]) || 'Q']).forEach(function (nm, j) { txt(tg, tx + colw * (j + .5), 26, nm, 'cs-ttt is-head'); });
      for (var r = 0; r < Math.pow(2, names.length); r++) {
        var vv = {}, cur = true;
        names.forEach(function (nm, j) { vv[nm] = (r >> (names.length - 1 - j)) & 1; if (val[nm] != null && val[nm] !== vv[nm]) cur = false; });
        var cols = Object.keys(perCol).map(Number).sort(function (a, b) { return a - b; });
        cols.forEach(function (c) { perCol[c].forEach(function (g) { vv[g.id] = OPS[g.type](g.in.map(function (x) { return vv[x]; })); }); });
        var y = 30 + (r + 1) * rh, row = el('g', { class: 'cs-ttrow' + (cur && names.every(function (nm) { return val[nm] != null; }) ? ' is-hl' : '') }, tg);
        el('rect', { x: tx, y: y - rh + 6, width: tableW - 12, height: rh, rx: 4 }, row);
        names.concat([o]).forEach(function (nm, j) { txt(row, tx + colw * (j + .5), y + 1, vv[nm], 'cs-ttt'); });
        rows.push(row);
      }
      q.fade(tg, KK + 'tt' + names.join(''), 200, 500);
    }
    return s;
  }

  // ---------- the CPU (von Neumann) ----------
  var CPU_AT = { cu: [30, 46, 120, 56], alu: [30, 150, 120, 56], pc: [176, 34, 104, 30], mar: [176, 74, 104, 30], mdr: [176, 114, 104, 30], cir: [176, 154, 104, 30], acc: [176, 194, 104, 30],
    ram: [380, 30, 128, 210], input: [30, 268, 110, 34], output: [160, 268, 110, 34], storage: [380, 268, 128, 34], cache: [30, 106, 120, 34] };
  var CPU_NAMES = { cu: 'Control unit', alu: 'ALU', pc: 'PC', mar: 'MAR', mdr: 'MDR', cir: 'CIR', acc: 'ACC', ram: 'RAM', input: 'Input', output: 'Output', storage: 'Storage', cache: 'Cache' };
  var BUS_Y = { address: 92, data: 132, control: 172 };
  function cpu(v, q) {
    var W = 520, H = v.io ? 312 : 256, s = svgBox(W, H, 'mx-cpu'), KK = 'cpu' + (v.io ? 'io' : '') + (v.cache ? 'c' : '') + ':', regs = v.regs || {}, hl = list(v.hl).map(function (x) { return String(x).toLowerCase(); });
    var at = Object.assign({}, CPU_AT);
    var cpuBox = el('rect', { x: 14, y: 14, width: 282, height: 228, rx: 14, class: 'cs-cpubox' }, s);
    q.draw(cpuBox, KK + 'box', 700, 120);
    txt(s, 24, 32, 'CPU', 'cs-cputitle', 'start');
    // The buses between the CPU and memory.
    Object.keys(BUS_Y).forEach(function (b) {
      var y = BUS_Y[b], g = el('g', { class: 'cs-bus is-' + b + (hl.indexOf(b) >= 0 || hl.indexOf(b + ' bus') >= 0 ? ' is-hl' : '') }, s);
      el('line', { x1: 296, x2: 380, y1: y, y2: y }, g);
      txt(g, 338, y - 6, b + ' bus', 'cs-bust');
      q.draw(g.firstChild, KK + 'bus' + b, 400, 80);
    });
    var shown = ['cu', 'alu', 'pc', 'mar', 'mdr', 'cir', 'acc', 'ram'].concat(v.cache ? ['cache'] : [], v.io ? ['input', 'output', 'storage'] : []);
    var nodes = {};
    shown.forEach(function (k) {
      var r = at[k], on = hl.indexOf(k) >= 0, g = el('g', { class: 'cs-unit is-' + k + (on ? ' is-hl' : '') }, s);
      el('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 9 }, g);
      var name = CPU_NAMES[k], rv = regs[k.toUpperCase()] != null ? regs[k.toUpperCase()] : regs[k];
      if (k === 'ram') {
        txt(g, r[0] + r[2] / 2, r[1] + 20, 'RAM', 'cs-unitt');
        (v.mem || []).slice(0, 8).forEach(function (m, i) {
          var y = r[1] + 34 + i * 22, row = el('g', { class: 'cs-memrow' + (hl.indexOf('mem' + i) >= 0 || hl.indexOf(String(m[0]).toLowerCase()) >= 0 ? ' is-hl' : '') }, g);
          el('rect', { x: r[0] + 8, y: y, width: r[2] - 16, height: 19, rx: 4 }, row);
          txt(row, r[0] + 14, y + 14, m[0], 'cs-memaddr', 'start');
          txt(row, r[0] + r[2] - 14, y + 14, m[1], 'cs-memval', 'end');
        });
      } else if (rv != null) {
        txt(g, r[0] + 10, r[1] + r[3] / 2 + 5, name, 'cs-unitt', 'start');
        txt(g, r[0] + r[2] - 8, r[1] + r[3] / 2 + 5, rv, 'cs-regval', 'end');
      } else txt(g, r[0] + r[2] / 2, r[1] + r[3] / 2 + 5, name, 'cs-unitt');
      q.fade(g, KK + 'u' + k, 50, 300);
      if (on) q.anim(g.firstChild, KK + 'hl' + k + hl.join(','), 0, [{ strokeWidth: 2 }, { strokeWidth: 6, offset: .5 }, { strokeWidth: 3 }], { duration: 700 });
      nodes[k] = r;
    });
    if (v.step) { var stp = txt(s, 286, 32, v.step, 'cs-cpustep', 'end'); q.pop(stp, KK + 'step' + v.step, 100); }
    // Values travelling: from one unit to the next, along a bus when there is one.
    var mid = function (k) { var r = nodes[k] || at[k]; return [r[0] + r[2] / 2, r[1] + r[3] / 2]; };
    (v.flow || []).forEach(function (f, i) {
      var a = mid(f[0]), b = mid(f[1]), bus = f[2], pts;
      if (bus && BUS_Y[bus]) { var y = BUS_Y[bus], ax = f[0] === 'ram' ? 380 : 296, bx = f[1] === 'ram' ? 380 : 296; pts = [a, [a[0] < 300 ? 296 : 380, a[1]], [ax, y], [bx === ax ? (ax === 296 ? 380 : 296) : bx, y], [b[0] < 300 ? 296 : 380, b[1]], b]; }
      else pts = [a, b];
      var path = el('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L'), class: 'cs-flowpath' }, s);
      q.draw(path, KK + 'fp' + i + f.join('-'), 500, 60);
      var tok = el('g', { class: 'cs-token' }, s), lbl = f[3] || '';
      el('rect', { x: -Math.max(18, lbl.length * 4.2), y: -11, width: Math.max(36, lbl.length * 8.4), height: 22, rx: 11 }, tok);
      txt(tok, 0, 5, lbl, 'cs-tokent');
      var segs = [], tot = 0;
      for (var j = 1; j < pts.length; j++) { var d = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); segs.push(d); tot += d; }
      var put = function (k) {
        var want = tot * k, j = 0;
        while (j < segs.length - 1 && want > segs[j]) { want -= segs[j]; j++; }
        var t = segs[j] ? want / segs[j] : 1, x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t;
        tok.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        tok.style.opacity = k >= 1 ? '0' : '1';
      };
      q.tw(KK + 'tok' + i + f.join('-'), 900, 1100, put, ease);
    });
    return s;
  }

  // ---------- networks ----------
  function icon(g, kind, x, y) {
    var k = kind || 'pc';
    if (k === 'router' || k === 'switch') {
      el('rect', { x: x - 26, y: y - 12, width: 52, height: 24, rx: 8, class: 'cs-dev' }, g);
      if (k === 'router') { el('line', { x1: x - 14, y1: y - 12, x2: x - 18, y2: y - 26, class: 'cs-devline' }, g); el('line', { x1: x + 14, y1: y - 12, x2: x + 18, y2: y - 26, class: 'cs-devline' }, g); }
      [-12, 0, 12].forEach(function (d) { el('circle', { cx: x + d, cy: y, r: 2.5, class: 'cs-devdot' }, g); });
    } else if (k === 'server' || k === 'dns') {
      [-20, -4, 12].forEach(function (d) { el('rect', { x: x - 20, y: y + d, width: 40, height: 14, rx: 3, class: 'cs-dev' }, g); el('circle', { cx: x + 12, cy: y + d + 7, r: 2.2, class: 'cs-devdot' }, g); });
    } else if (k === 'cloud') {
      el('path', { d: 'M' + (x - 30) + ' ' + (y + 12) + 'a12 12 0 0 1 4-23a16 16 0 0 1 30-6a13 13 0 0 1 24 12a10 10 0 0 1 2 17Z', class: 'cs-dev' }, g);
    } else if (k === 'phone') {
      el('rect', { x: x - 11, y: y - 20, width: 22, height: 40, rx: 5, class: 'cs-dev' }, g);
    } else if (k === 'laptop') {
      el('rect', { x: x - 22, y: y - 18, width: 44, height: 28, rx: 3, class: 'cs-dev' }, g);
      el('path', { d: 'M' + (x - 30) + ' ' + (y + 12) + 'H' + (x + 30) + 'L' + (x + 26) + ' ' + (y + 18) + 'H' + (x - 26) + 'Z', class: 'cs-dev' }, g);
    } else {
      el('rect', { x: x - 24, y: y - 22, width: 48, height: 32, rx: 4, class: 'cs-dev' }, g);
      el('path', { d: 'M' + (x - 8) + ' ' + (y + 10) + 'L' + (x - 12) + ' ' + (y + 20) + 'H' + (x + 12) + 'L' + (x + 8) + ' ' + (y + 10), class: 'cs-dev' }, g);
    }
  }
  function network(v, q) {
    var nodes = v.nodes || [], W = 520, H = v.h || 250, s = svgBox(W, H, 'mx-network'), KK = 'net' + nodes.map(function (n) { return n.id; }).join(',') + ':', at = {}, hl = list(v.hl);
    nodes.forEach(function (n, i) {
      var x = n.x != null ? 56 + n.x / 100 * (W - 112) : 56 + i * (W - 112) / Math.max(1, nodes.length - 1);
      var y = n.y != null ? 34 + n.y / 100 * (H - 90) : H / 2 - 10 + (i % 2 ? 22 : -22) * (nodes.length > 3 ? 1 : 0);
      at[n.id] = [x, y];
    });
    var lg = el('g', {}, s);
    (v.links || []).forEach(function (l, i) {
      var a = at[l[0]], b = at[l[1]];
      if (!a || !b) return;
      var ln = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'cs-link' + (l[2] ? ' is-' + l[2] : '') }, lg);
      q.draw(ln, KK + 'l' + l.join('-'), 400, 70);
    });
    nodes.forEach(function (n) {
      var g = el('g', { class: 'cs-node' + (hl.indexOf(n.id) >= 0 ? ' is-hl' : '') }, s), p = at[n.id];
      icon(g, n.kind, p[0], p[1]);
      if (n.kind === 'dns') txt(g, p[0], p[1] + 46, 'DNS', 'cs-nodet is-tag');
      txt(g, p[0], p[1] + (n.kind === 'dns' ? 62 : 44), n.label || '', 'cs-nodet');
      if (n.ip) txt(g, p[0], p[1] + (n.kind === 'dns' ? 78 : 60), n.ip, 'cs-nodeip');
      q.pop(g, KK + 'n' + n.id + (hl.indexOf(n.id) >= 0 ? 'h' : ''), 110, 420);
    });
    // Packets: each goes along its path, one hop after another, with its label.
    (v.send || []).forEach(function (m, i) {
      var path = m.path || [m.from, m.to], pts = path.map(function (id) { return at[id]; }).filter(Boolean);
      if (pts.length < 2) return;
      var tok = el('g', { class: 'cs-packet' + (m.c ? ' is-' + m.c : '') }, s), lbl = m.label || '';
      el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 3 }, tok);
      el('path', { d: 'M-14 -10L0 2L14 -10', class: 'cs-packetflap' }, tok);
      txt(tok, 0, -16, lbl, 'cs-packett');
      var segs = [], tot = 0;
      for (var j = 1; j < pts.length; j++) { var d = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); segs.push(d); tot += d; }
      var put = function (k) {
        var want = tot * k, j = 0;
        while (j < segs.length - 1 && want > segs[j]) { want -= segs[j]; j++; }
        var t = segs[j] ? want / segs[j] : 1;
        tok.setAttribute('transform', 'translate(' + (pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t) + ',' + (pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t - 6) + ')');
        tok.style.opacity = k >= 1 ? '0' : '1';
      };
      q.tw(KK + 'p' + i + path.join('>') + lbl, 300 + pts.length * 200, 700 + pts.length * 450, put, ease);
    });
    if (v.label) txt(s, 12, H - 8, v.label, 'mx-axlab', 'start');
    return s;
  }

  // ---------- flowcharts ----------
  function flow(v, q) {
    var nodes = v.nodes || [], n = nodes.length, W = 520, rowH = Math.min(62, 420 / Math.max(1, n)), H = 30 + n * rowH, cx = 200;
    var s = svgBox(W, H, 'mx-flow'), KK = 'flow' + nodes.map(function (nd) { return nd.id; }).join(',') + ':', at = {}, idx = {};
    nodes.forEach(function (nd, i) { at[nd.id] = [cx, 20 + i * rowH + rowH / 2]; idx[nd.id] = i; });
    var eg = el('g', {}, s), side = 0;
    (v.edges || []).forEach(function (e, i) {
      var a = at[e[0]], b = at[e[1]];
      if (!a || !b) return;
      var d, la;
      if (idx[e[1]] === idx[e[0]] + 1) { d = 'M' + a[0] + ' ' + (a[1] + 16) + 'V' + (b[1] - 16); la = [a[0] + 8, (a[1] + b[1]) / 2 + 4, 'start']; }
      else { side++; var x = cx + 150 + side * 16; d = 'M' + (a[0] + 76) + ' ' + a[1] + 'H' + x + 'V' + b[1] + 'H' + (b[0] + 76); la = [x + 6, a[1] - 6, 'start']; }
      var p = el('path', { d: d, class: 'cs-fedge', 'marker-end': 'url(#cs-arrow)' }, eg);
      q.draw(p, KK + 'e' + e.join('-'), 300, 40);
      if (e[2]) { var t = txt(eg, la[0], la[1], e[2], 'cs-fedget', la[2]); q.fade(t, KK + 'el' + e.join('-'), 0); }
    });
    var mk = el('marker', { id: 'cs-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, K.defs(s));
    el('path', { d: 'M0 0L10 5L0 10Z', class: 'cs-farrow' }, mk);
    var hl = list(v.hl);
    nodes.forEach(function (nd) {
      var p = at[nd.id], g = el('g', { class: 'cs-fnode is-' + (nd.type || 'process') + (hl.indexOf(nd.id) >= 0 ? ' is-hl' : '') }, s), w = 150, h = Math.min(34, rowH - 18);
      if (nd.type === 'decision') el('path', { d: 'M' + (p[0] - 78) + ' ' + p[1] + 'L' + p[0] + ' ' + (p[1] - h / 2 - 6) + 'L' + (p[0] + 78) + ' ' + p[1] + 'L' + p[0] + ' ' + (p[1] + h / 2 + 6) + 'Z' }, g);
      else if (nd.type === 'start' || nd.type === 'end') el('rect', { x: p[0] - w / 2 + 20, y: p[1] - h / 2, width: w - 40, height: h, rx: h / 2 }, g);
      else if (nd.type === 'io') el('path', { d: 'M' + (p[0] - w / 2 + 12) + ' ' + (p[1] - h / 2) + 'H' + (p[0] + w / 2 + 6) + 'L' + (p[0] + w / 2 - 12) + ' ' + (p[1] + h / 2) + 'H' + (p[0] - w / 2 - 6) + 'Z' }, g);
      else el('rect', { x: p[0] - w / 2, y: p[1] - h / 2, width: w, height: h, rx: 5 }, g);
      txt(g, p[0], p[1] + 5, nd.text || '', 'cs-fnodet');
      q.fade(g, KK + 'n' + nd.id + (hl.indexOf(nd.id) >= 0 ? 'h' : ''), 90, 300);
    });
    // A token runs along the path, stopping at each box it passes.
    if (v.path && v.path.length) {
      var pts = v.path.map(function (id) { return at[id]; }).filter(Boolean), tok = el('circle', { r: 9, class: 'cs-ftoken' }, s);
      q.tw(KK + 'path' + v.path.join('>'), 400 + pts.length * 260, 500 + pts.length * 420, function (k) {
        var f = k * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(f)), t = f - j;
        if (pts.length === 1) { j = 0; t = 0; }
        var a = pts[j], b = pts[Math.min(pts.length - 1, j + 1)];
        tok.setAttribute('cx', a[0] - 96); tok.setAttribute('cy', a[1] + (b[1] - a[1]) * t);
        tok.style.opacity = k >= 1 ? '0' : '1';
      }, K.linear);
    }
    return s;
  }

  // ---------- arrays (searching, sorting) ----------
  function array(v, q) {
    var vals = v.vals || [], n = vals.length, W = 520, bw = Math.min(52, (W - 40) / Math.max(1, n) - 6), x0 = (W - (n * (bw + 6) - 6)) / 2, H = v.ptr ? 170 : 128;
    var s = svgBox(W, H, 'mx-array'), KK = 'arr' + n + ':', X = function (i) { return x0 + i * (bw + 6); };
    var cmp = list(v.cmp).map(Number), hl = list(v.hl).map(Number), done = list(v.done).map(Number), sw = list(v.swap).map(Number);
    if (v.sorted) for (var d = v.sorted[0]; d <= v.sorted[1]; d++) done.push(d);
    vals.forEach(function (x, i) {
      var g = el('g', { transform: 'translate(' + X(i) + ',30)' }, s), inner = el('g', { class: 'cs-cell' + (cmp.indexOf(i) >= 0 ? ' is-cmp' : '') + (hl.indexOf(i) >= 0 ? ' is-hl' : '') + (done.indexOf(i) >= 0 ? ' is-done' : '') + (v.find != null && String(x) === String(v.find) && hl.indexOf(i) >= 0 ? ' is-found' : '') }, g);
      el('rect', { x: 0, y: 0, width: bw, height: bw, rx: 8 }, inner);
      txt(inner, bw / 2, bw / 2 + 6, x, 'cs-cellt');
      txt(g, bw / 2, bw + 18, i, 'cs-idx');
      if (sw.length === 2 && sw.indexOf(i) >= 0) {
        var other = sw[0] === i ? sw[1] : sw[0], dx = X(other) - X(i);
        q.anim(inner, KK + 'sw' + sw.join('-') + i + x, 0, [{ transform: 'translate(' + dx + 'px,0)' }, { transform: 'translate(' + dx / 2 + 'px,' + (i < other ? -26 : 26) + 'px)', offset: .5 }, { transform: 'none' }], { duration: 800, easing: 'ease-in-out' });
      } else q.fade(inner, KK + 'c' + i + x, 30, 260);
      if (cmp.indexOf(i) >= 0) q.anim(inner.firstChild, KK + 'cmp' + cmp.join('-') + i, 0, [{ strokeWidth: 2 }, { strokeWidth: 7, offset: .5 }, { strokeWidth: 3.5 }], { duration: 600 });
    });
    if (v.ptr) Object.keys(v.ptr).forEach(function (k, j) {
      var i = v.ptr[k], g = el('g', { class: 'cs-ptr' }, s), x = X(i) + bw / 2, y = 30 + bw + 28 + (j % 2) * 18;
      el('path', { d: 'M' + x + ' ' + (y - 4) + 'l-6 10h12z' }, g);
      txt(g, x, y + 20, k, 'cs-ptrt');
      q.anim(g, KK + 'ptr' + k + i, 60, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 400 });
    });
    if (v.label) { var lt = txt(s, W / 2, 18, v.label, 'cs-arrlabel'); q.fade(lt, KK + 'lab' + v.label, 0); }
    return s;
  }

  R.addKind('bits', bits, []);
  R.addKind('gates', gates, ['gates']);
  R.addKind('cpu', cpu, []);
  R.addKind('network', network, ['nodes']);
  R.addKind('flow', flow, ['nodes']);
  R.addKind('array', array, ['vals']);
})();

// Draw your own, for Make your own games (bio/bio-maker.js; the user: "they dont just design there own characters they
// can make their own 2d environments too and they can draw them and make an option that a program cleans up the
// drawings for them", "they can also use color fill and make a color wheel for them to choose from also").
//   The studio   a canvas (a place 960 x 300, its floor the dashed line at 252 like the games' floors; a character or
//                opponent 320 x 320 on nothing), a pen and an eraser in three sizes, a fill bucket, undo, redo, clear,
//                and a colour wheel (hue around, how strong out from the middle, a brightness slider, the site's
//                colours, the ones you used).
//   Tidy up      the program cleans the drawing: a wobbly line that's nearly straight becomes straight (level or
//                upright when it's close); a closed loop becomes a circle, an ellipse, a rectangle, a triangle or a
//                neat polygon when it's close to one, else a smooth loop; other lines are smoothed; ends that nearly
//                meet another line are joined to it (so a fill doesn't leak). Once, with the button, or every line as
//                you draw it ("Tidy as I draw").
//   Fill         fills the area you tap, closing gaps of up to 4 pixels in its edge (it doesn't leak through a gap
//                you didn't mean), and colours the soft edge pixels of the lines round it so there's no white rim.
//   The code     a drawing is kept as what you did (each line's points, each fill's spot), not as a picture, so it
//                fits in the game's link: '1', the starting background's letter, then each line and fill.
// window.BioMakerDraw: the studio (mount), the wheel (wheel), pictures of a code (image), and for
// tools/bio/tests/draw.mjs the parts that don't need a screen (encode, decode, tidyStroke, tidyAll, fillRegion, ...).
(function () {
  'use strict';
  var INK = '#13294A';
  var SIZE = { place: [960, 300], char: [320, 320] };
  // LIKE: how close a pixel's colour (each of red, green, blue, out of 255) must be to the one tapped to be the same area.
  var GROUND = 252, MAX_CODE = 9000, MAX_OPS = 400, MAX_PTS = 1500, GAP = 2, LIKE = 15;
  var BRUSH = { place: [4, 9, 18], char: [3, 6, 12] };
  // Backgrounds to start a place from: the sky, the ground under the dashed line, and its edge.
  var STARTS = {
    b: ['Blank', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    g: ['Sky and grass', '#CDEBFA', '#7CC36A', '#4E8F3E'],
    s: ['Sky and sand', '#BFE8FF', '#F6D58E', '#C9AC66'],
    n: ['Night', '#1B2A4A', '#2C3E5C', '#0E1A30'],
    p: ['Inside the body', '#FBE3D6', '#E8828F', '#B85566']
  };
  var PALETTE = ['#13294A', '#FFFFFF', '#5B6B80', '#1CB0F6', '#58CC02', '#FF4B4B', '#FF9600', '#FFC800', '#CE82FF', '#FF86D0', '#2BD4BD', '#8D6E63'];

  // ======================================================================== the code
  // Points: each a step from the last, zigzag varints, as base64url.
  function b64(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64(t) {
    var b = t.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    var s = atob(b), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }
  function packPts(p) {
    var bytes = [], lx = 0, ly = 0;
    for (var i = 0; i < p.length; i += 2) {
      [p[i] - lx, p[i + 1] - ly].forEach(function (d) {
        var z = d < 0 ? -d * 2 - 1 : d * 2;
        while (z >= 128) { bytes.push((z & 127) | 128); z = Math.floor(z / 128); }
        bytes.push(z);
      });
      lx = p[i]; ly = p[i + 1];
    }
    return b64(bytes);
  }
  function unpackPts(t) {
    var bytes = unb64(t), out = [], i = 0, v = [0, 0], k = 0;
    while (i < bytes.length) {
      var z = 0, mul = 1, b;
      do { b = bytes[i++]; if (b == null) throw new Error('cut short'); z += (b & 127) * mul; mul *= 128; } while (b & 128);
      var d = z % 2 ? -(z + 1) / 2 : z / 2;
      v[k] += d;
      out.push(v[k]);
      k = 1 - k;
    }
    if (k) throw new Error('odd');
    return out;
  }
  var HEX = /^[0-9a-f]{6}$/i;
  function encode(d) {
    return '1' + d.start + d.ops.map(function (o) {
      if (o.t === 'f') return ';f' + o.c.slice(1) + ',' + (o.k ? o.k.slice(1) : '') + ',' + o.x.toString(36) + ',' + o.y.toString(36);
      return ';' + o.t + (o.t === 's' ? o.c.slice(1) + ',' : '') + o.w.toString(36) + ',' + o.z + ',' + packPts(o.p);
    }).join('');
  }
  // A code from anywhere (a saved game, a link) is checked: bad colours, sizes or points off the canvas and it's no
  // drawing at all (null).
  function decode(code, kind) {
    try {
      var S = SIZE[kind], m = /^1([bgsnp]);?/.exec(code);
      if (!S || !m || typeof code !== 'string' || code.length > MAX_CODE) return null;
      if (kind === 'char' && m[1] !== 'b') return null;
      var parts = code.slice(2).split(';').filter(Boolean), ops = [];
      if (parts.length > MAX_OPS) return null;
      for (var i = 0; i < parts.length; i++) {
        var t = parts[i].charAt(0), f = parts[i].slice(1).split(','), o;
        if (t === 'f') {
          if (f.length !== 4 || !HEX.test(f[0]) || (f[1] && !HEX.test(f[1]))) return null;
          o = { t: 'f', c: '#' + f[0].toUpperCase(), k: f[1] ? '#' + f[1].toUpperCase() : '', x: parseInt(f[2], 36), y: parseInt(f[3], 36) };
          if (!(o.x >= 0 && o.x < S[0] && o.y >= 0 && o.y < S[1])) return null;
        } else if (t === 's' || t === 'e') {
          var hex = t === 's' ? f.shift() : '';
          if ((t === 's' && !HEX.test(hex)) || f.length !== 3) return null;
          o = t === 's' ? { t: t, c: '#' + hex.toUpperCase(), w: parseInt(f[0], 36), z: +f[1], p: unpackPts(f[2]) } : { t: t, w: parseInt(f[0], 36), z: +f[1], p: unpackPts(f[2]) };
          if (!(o.w >= 1 && o.w <= 40) || [0, 1, 2, 3].indexOf(o.z) < 0 || !o.p.length || o.p.length > MAX_PTS * 2) return null;
          for (var j = 0; j < o.p.length; j++) if (!(o.p[j] >= -40 && o.p[j] <= S[j % 2] + 40)) return null;
        } else return null;
        ops.push(o);
      }
      return { start: m[1], ops: ops };
    } catch (e) { return null; }
  }
  // Made to fit in a link: lines thinned (a little more each time) until the code is short enough; null if it never is.
  function fit(d, kind) {
    var code = encode(d);
    for (var eps = 1; code.length > MAX_CODE && eps <= 6; eps++) {
      d = { start: d.start, ops: d.ops.map(function (o) { return o.p && o.p.length > 4 ? Object.assign({}, o, { p: flat(rdp(pairs(o.p), eps)) }) : o; }) };
      code = encode(d);
    }
    return code.length <= MAX_CODE && decode(code, kind) ? code : null;
  }

  // ======================================================================== tidy up
  function pairs(p) { var out = []; for (var i = 0; i < p.length; i += 2) out.push([p[i], p[i + 1]]); return out; }
  function flat(ps) { var out = []; ps.forEach(function (q) { out.push(Math.round(q[0]), Math.round(q[1])); }); return out; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function length(ps) { var L = 0; for (var i = 1; i < ps.length; i++) L += dist(ps[i - 1], ps[i]); return L; }
  // Ramer-Douglas-Peucker: the fewest points within eps of the line.
  function rdp(ps, eps) {
    if (ps.length < 3) return ps.slice();
    var keep = new Array(ps.length), stack = [[0, ps.length - 1]];
    keep[0] = keep[ps.length - 1] = true;
    while (stack.length) {
      var r = stack.pop(), a = r[0], b = r[1], best = -1, at = -1;
      for (var i = a + 1; i < b; i++) { var d = segDist(ps[i], ps[a], ps[b]); if (d > best) { best = d; at = i; } }
      if (best > eps) { keep[at] = true; stack.push([a, at], [at, b]); }
    }
    return ps.filter(function (p, i) { return keep[i]; });
  }
  function chaikin(ps, closed, times) {
    for (var k = 0; k < times; k++) {
      var out = closed ? [] : [ps[0]], n = ps.length;
      for (var i = 0; i < (closed ? n : n - 1); i++) {
        var p = ps[i], q = ps[(i + 1) % n];
        out.push([p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25], [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]);
      }
      if (!closed) out.push(ps[n - 1]);
      ps = out;
    }
    return ps;
  }
  function box(ps) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    ps.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); });
    return b;
  }
  function angleOf(a, b) { return Math.atan2(b[1] - a[1], b[0] - a[0]); }
  // One line, tidied: { kind, ps (points), closed }. kind: dot, line, circle, ellipse, rect, triangle, polygon, loop,
  // curve.
  function tidyStroke(ps) {
    if (ps.length < 2) return { kind: 'dot', ps: ps.slice(), closed: false };
    var b = box(ps), size = Math.max(b[2] - b[0], b[3] - b[1], 1), L = length(ps);
    if (L < 6) return { kind: 'dot', ps: [ps[0]], closed: false };
    var first = ps[0], last = ps[ps.length - 1];
    var closed = dist(first, last) < Math.max(14, 0.2 * size) && L > 2.2 * size;
    if (!closed) {
      var dev = 0;
      ps.forEach(function (p) { dev = Math.max(dev, segDist(p, first, last)); });
      if (dev < Math.max(3, 0.07 * dist(first, last))) {
        // Nearly level or upright: made exactly so.
        var a = angleOf(first, last) * 180 / Math.PI, end = last.slice();
        if (Math.abs(Math.sin(a * Math.PI / 180)) < Math.sin(8 * Math.PI / 180)) end[1] = first[1];
        else if (Math.abs(Math.cos(a * Math.PI / 180)) < Math.sin(8 * Math.PI / 180)) end[0] = first[0];
        return { kind: 'line', ps: [first, end], closed: false };
      }
      return { kind: 'curve', ps: chaikin(rdp(ps, Math.max(1.2, 0.015 * size)), false, 2), closed: false };
    }
    // A closed loop: an ellipse (or circle) if its points sit on one.
    var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, rx = Math.max(1, (b[2] - b[0]) / 2), ry = Math.max(1, (b[3] - b[1]) / 2), err = 0;
    ps.forEach(function (p) { err += Math.abs(Math.hypot((p[0] - cx) / rx, (p[1] - cy) / ry) - 1); });
    err /= ps.length;
    // The corners: the loop thinned hard. Three is a triangle; four with right angles a rectangle.
    var loop = ps.slice(0, -1).concat([first]), corners = rdp(loop, 0.09 * size).slice(0, -1);
    if (corners.length > 3) {
      // A corner on a nearly straight stretch isn't one.
      corners = corners.filter(function (c, i) {
        var p = corners[(i + corners.length - 1) % corners.length], n = corners[(i + 1) % corners.length], turn = Math.abs(angleOf(p, c) - angleOf(c, n)) % (2 * Math.PI);
        return Math.min(turn, 2 * Math.PI - turn) > 0.35;
      });
    }
    var fits = function (poly) {
      var worst = 0;
      ps.forEach(function (p) { var d = Infinity; for (var i = 0; i < poly.length; i++) d = Math.min(d, segDist(p, poly[i], poly[(i + 1) % poly.length])); worst = Math.max(worst, d); });
      return worst < 0.1 * size;
    };
    // Five or more corners on something nearly round is a wobbly circle, not a polygon.
    if (corners.length >= 3 && corners.length <= 6 && fits(corners) && err > 0.06 && !(corners.length >= 5 && err < 0.15)) {
      if (corners.length === 4) {
        var right = corners.every(function (c, i) {
          var p = corners[(i + 3) % 4], n = corners[(i + 1) % 4], v1 = [p[0] - c[0], p[1] - c[1]], v2 = [n[0] - c[0], n[1] - c[1]];
          return Math.abs((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]) || 1)) < 0.34;
        });
        if (right) {
          var tilt = angleOf(corners[0], corners[1]) % (Math.PI / 2);
          if (Math.min(Math.abs(tilt), Math.PI / 2 - Math.abs(tilt)) < 0.21) return { kind: 'rect', ps: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], closed: true };
          return { kind: 'rect', ps: corners, closed: true };
        }
      }
      return { kind: corners.length === 3 ? 'triangle' : 'polygon', ps: corners, closed: true };
    }
    if (err < 0.15) {
      var circle = Math.abs(rx - ry) / Math.max(rx, ry) < 0.16, r = (rx + ry) / 2, out = [];
      for (var k = 0; k < 48; k++) { var t = k / 48 * Math.PI * 2; out.push([cx + (circle ? r : rx) * Math.cos(t), cy + (circle ? r : ry) * Math.sin(t)]); }
      return { kind: circle ? 'circle' : 'ellipse', ps: out, closed: true };
    }
    return { kind: 'loop', ps: chaikin(rdp(loop.slice(0, -1), Math.max(1.2, 0.015 * size)), true, 2), closed: true };
  }
  // The whole drawing tidied: each raw line (z & 2) tidied once; then ends that nearly meet a line are joined to it.
  // Returns { ops, kinds: { kind: how many } }.
  var SNAP = 12;
  function tidyAll(ops, only) {
    var kinds = {}, out = ops.map(function (o, i) {
      if (o.t !== 's' || !(o.z & 2) || (only != null && i !== only)) return o;
      var r = tidyStroke(pairs(o.p));
      kinds[r.kind] = (kinds[r.kind] || 0) + 1;
      return { t: 's', c: o.c, w: o.w, z: r.closed ? 1 : 0, p: flat(r.ps), kind: r.kind };
    });
    // Join ends: an open line's end within SNAP of another line (or its own start) moves onto it.
    out.forEach(function (o, i) {
      if (o.t !== 's' || o.z & 1 || (only != null && i !== only) || o.p.length < 4) return;
      var ps = pairs(o.p);
      [0, ps.length - 1].forEach(function (e) {
        var end = ps[e], best = null, bd = SNAP;
        out.forEach(function (q, j) {
          if (q.t !== 's') return;
          var qs = pairs(q.p);
          for (var k = 0; k < qs.length - (q.z & 1 ? 0 : 1); k++) {
            if (j === i && Math.abs(k - e) < 3) continue;
            var a = qs[k], b = qs[(k + 1) % qs.length], dx = b[0] - a[0], dy = b[1] - a[1], LL = dx * dx + dy * dy;
            var tt = LL ? Math.max(0, Math.min(1, ((end[0] - a[0]) * dx + (end[1] - a[1]) * dy) / LL)) : 0, pt = [a[0] + tt * dx, a[1] + tt * dy], d = dist(end, pt);
            if (d < bd && d > 0.5) { bd = d; best = pt; }
          }
        });
        if (best) ps[e] = best;
      });
      out[i] = Object.assign({}, o, { p: flat(ps) });
    });
    return { ops: out, kinds: kinds };
  }

  // ======================================================================== fill
  function rgb(hex) { var c = parseInt(hex.slice(1), 16); return [c >> 16, (c >> 8) & 255, c & 255]; }
  function hexOf(r, g, b) { return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); }
  // Grows a mask by r pixels (a square), in two passes.
  function grow(m, W, H, r) {
    var a = new Uint8Array(m.length), out = new Uint8Array(m.length), x, y, n;
    for (y = 0; y < H; y++) {
      n = 0;
      for (x = 0; x < Math.min(W, r); x++) n += m[y * W + x];
      for (x = 0; x < W; x++) {
        if (x + r < W) n += m[y * W + x + r];
        if (x - r - 1 >= 0) n -= m[y * W + x - r - 1];
        a[y * W + x] = n > 0 ? 1 : 0;
      }
    }
    for (x = 0; x < W; x++) {
      n = 0;
      for (y = 0; y < Math.min(H, r); y++) n += a[y * W + x];
      for (y = 0; y < H; y++) {
        if (y + r < H) n += a[(y + r) * W + x];
        if (y - r - 1 >= 0) n -= a[(y - r - 1) * W + x];
        out[y * W + x] = n > 0 ? 1 : 0;
      }
    }
    return out;
  }
  // Fills the area at (x, y) of RGBA pixels d (W x H) with colour fill ('#RRGGBB'). k: the colour that was there when you
  // tapped ('' for nothing, '#RRGGBB'); after Tidy up moved a line onto that spot, the nearest pixel of that colour is
  // used instead. Gaps in the area's edge of up to 2 x GAP pixels are closed. Returns whether it changed anything.
  function fillRegion(d, W, H, x, y, fill, k) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    var N = W * H, F = rgb(fill), clear = function (i) { return d[i * 4 + 3] < 40; };
    var near = function (i, c) {
      if (c === '') return clear(i);
      var C = rgb(c);
      return !clear(i) && Math.max(Math.abs(d[i * 4] - C[0]), Math.abs(d[i * 4 + 1] - C[1]), Math.abs(d[i * 4 + 2] - C[2])) <= LIKE;
    };
    var s = y * W + x;
    if (k != null && !near(s, k)) {
      s = -1;
      for (var r = 1; r <= 10 && s < 0; r++) for (var dy = -r; dy <= r && s < 0; dy++) for (var dx = -r; dx <= r; dx++) {
        var xx = x + dx, yy = y + dy;
        if ((Math.abs(dx) === r || Math.abs(dy) === r) && xx >= 0 && yy >= 0 && xx < W && yy < H && near(yy * W + xx, k)) { s = yy * W + xx; break; }
      }
      if (s < 0) return false;
    }
    var seedClear = clear(s), S = [d[s * 4], d[s * 4 + 1], d[s * 4 + 2]];
    if (!seedClear && S[0] === F[0] && S[1] === F[1] && S[2] === F[2]) return false;
    var diff = function (i) { return seedClear ? (clear(i) ? 0 : d[i * 4 + 3]) : (clear(i) ? 255 : Math.max(Math.abs(d[i * 4] - S[0]), Math.abs(d[i * 4 + 1] - S[1]), Math.abs(d[i * 4 + 2] - S[2]))); };
    var wall = new Uint8Array(N), i;
    for (i = 0; i < N; i++) wall[i] = diff(i) > LIKE ? 1 : 0;
    var walls = grow(wall, W, H, GAP);
    if (walls[s]) walls = wall;
    var region = new Uint8Array(N), stack = [s];
    region[s] = 1;
    while (stack.length) {
      var p = stack.pop(), px = p % W;
      [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1, p - W, p + W].forEach(function (q) {
        if (q >= 0 && q < N && !region[q] && !walls[q]) { region[q] = 1; stack.push(q); }
      });
    }
    // Back over the edge it kept off: what's like the area is filled, a line's soft edge gets the colour behind it.
    var edge = grow(region, W, H, GAP + 1);
    for (i = 0; i < N; i++) {
      if (!edge[i]) continue;
      var o = i * 4, t;
      if (region[i]) t = 1;
      else if (seedClear) t = 1 - d[o + 3] / 255;
      else t = Math.max(0, 1 - diff(i) / 160);
      if (t <= 0) continue;
      if (seedClear) {
        var a = d[o + 3] / 255;
        for (var c = 0; c < 3; c++) d[o + c] = Math.round(d[o + c] * a + F[c] * (1 - a));
        d[o + 3] = 255;
      } else for (var c2 = 0; c2 < 3; c2++) d[o + c2] = Math.round(d[o + c2] + (F[c2] - d[o + c2]) * t);
    }
    return true;
  }

  // ======================================================================== drawing it
  function hasCanvas() { return typeof document !== 'undefined' && document.createElement && typeof document.createElement('canvas').getContext === 'function'; }
  function canvasOf(W, H) { var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  // The background a place starts from (a character's is nothing).
  function base(kind, start) {
    var S = SIZE[kind], c = canvasOf(S[0], S[1]), x = c.getContext('2d');
    if (kind === 'place') {
      var st = STARTS[start] || STARTS.b;
      x.fillStyle = st[1]; x.fillRect(0, 0, S[0], GROUND);
      x.fillStyle = st[2]; x.fillRect(0, GROUND, S[0], S[1] - GROUND);
      if (start !== 'b') { x.fillStyle = st[3]; x.fillRect(0, GROUND - 2, S[0], 4); }
    }
    return c;
  }
  // A line: tidied ones as they are, raw ones smoothed through the middles of their steps.
  function trace(x, p, z) {
    x.beginPath();
    x.moveTo(p[0], p[1]);
    if (p.length === 2) { x.lineTo(p[0] + 0.01, p[1]); return; }
    if (z & 2) {
      for (var i = 2; i < p.length - 2; i += 2) x.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
      x.lineTo(p[p.length - 2], p[p.length - 1]);
    } else for (var j = 2; j < p.length; j += 2) x.lineTo(p[j], p[j + 1]);
    if (z & 1) x.closePath();
  }
  function drawOp(x, o, kind, bg) {
    var S = SIZE[kind];
    if (o.t === 'f') {
      var img = x.getImageData(0, 0, S[0], S[1]);
      if (fillRegion(img.data, S[0], S[1], o.x, o.y, o.c, o.k)) x.putImageData(img, 0, 0);
      return;
    }
    x.save();
    x.lineCap = x.lineJoin = 'round';
    x.lineWidth = o.w;
    if (o.t === 'e') {
      // The eraser takes a character back to nothing, and a place back to its background.
      if (kind === 'char') { x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; }
      else x.strokeStyle = x.createPattern(bg, 'no-repeat');
    } else x.strokeStyle = o.c;
    trace(x, o.p, o.z);
    x.stroke();
    x.restore();
  }
  function render(c, d, kind) {
    var x = c.getContext('2d'), bg = base(kind, d.start);
    x.clearRect(0, 0, c.width, c.height);
    x.drawImage(bg, 0, 0);
    d.ops.forEach(function (o) { drawOp(x, o, kind, bg); });
    return bg;
  }
  // The picture of a code (a data URL), made once. A character is cut to what's drawn, standing on the bottom.
  var PICS = {};
  function image(code, kind) {
    var key = kind + code;
    if (PICS[key]) return PICS[key].url;
    var d = decode(code, kind);
    if (!d || !hasCanvas()) return '';
    var S = SIZE[kind], c = canvasOf(S[0], S[1]), dark = false;
    render(c, d, kind);
    var x = c.getContext('2d'), px = x.getImageData(0, 0, S[0], S[1]).data;
    if (kind === 'place') {
      var lum = 0, n = 0;
      for (var i = 0; i < S[0] * GROUND; i += 7) { lum += 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]; n++; }
      dark = lum / n < 90;
    } else {
      var b = [S[0], S[1], -1, -1];
      for (var yy = 0; yy < S[1]; yy++) for (var xx = 0; xx < S[0]; xx++) if (px[(yy * S[0] + xx) * 4 + 3] > 20) { b[0] = Math.min(b[0], xx); b[1] = Math.min(b[1], yy); b[2] = Math.max(b[2], xx); b[3] = Math.max(b[3], yy); }
      if (b[2] >= 0) {
        var w = b[2] - b[0] + 1, h = b[3] - b[1] + 1, side = Math.max(w, h) + 8, cut = canvasOf(side, side);
        cut.getContext('2d').drawImage(c, b[0], b[1], w, h, (side - w) / 2, side - h - 2, w, h);
        c = cut;
      }
    }
    PICS[key] = { url: c.toDataURL('image/png'), dark: dark };
    return PICS[key].url;
  }
  function isDark(code) { image(code, 'place'); var p = PICS['place' + code]; return Boolean(p && p.dark); }

  // ======================================================================== the colour wheel
  function hsv2rgb(h, s, v) {
    var i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), r, g, b;
    switch (((i % 6) + 6) % 6) { case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; default: r = v; g = p; b = q; }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  function rgb2hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [((h / 6) + 1) % 1, mx ? d / mx : 0, mx];
  }
  var RECENT = [];
  function remember(hex) { RECENT = [hex].concat(RECENT.filter(function (c) { return c !== hex; })).slice(0, 8); }
  // A wheel in el: hue round it, strength out from the middle, brightness on a slider; the site's colours and the ones
  // you've used under it. onPick(hex, done): done is true when you let go (or tap a colour), false while dragging.
  function wheel(el, hex, onPick) {
    // The wheel shows bright colours even when the colour you have is dark (move the slider for dark ones).
    var hsv = rgb2hsv.apply(null, rgb(hex)), R = 110, start = hex;
    if (hsv[2] < 0.5) hsv = [hsv[0], hsv[1], 1];
    el.innerHTML = '<div class="mk-wheel"><canvas class="mk-wheel__disc" width="' + 2 * R + '" height="' + 2 * R + '" role="img" aria-label="Colour wheel: drag to pick a colour"></canvas>' +
      '<div class="mk-wheel__side"><div class="mk-wheel__now"><i data-wh-now></i><span data-wh-hex></span></div>' +
      '<label class="mk-wheel__light"><span>Brightness</span><input type="range" min="8" max="100" data-wh-v></label>' +
      '<div class="mk-wheel__sw">' + PALETTE.map(function (c) { return '<button type="button" style="background:' + c + '" data-wh-sw="' + c + '" aria-label="Colour ' + c + '"></button>'; }).join('') + '</div>' +
      '<div class="mk-wheel__sw mk-wheel__sw--recent" data-wh-recent></div></div></div>';
    var disc = el.querySelector('canvas'), x = disc.getContext('2d'), slider = el.querySelector('[data-wh-v]');
    function paintDisc() {
      var img = x.createImageData(2 * R, 2 * R), dd = img.data;
      for (var yy = 0; yy < 2 * R; yy++) for (var xx = 0; xx < 2 * R; xx++) {
        var dx = xx - R + 0.5, dy = yy - R + 0.5, r = Math.hypot(dx, dy), o = (yy * 2 * R + xx) * 4;
        if (r > R) continue;
        var c = hsv2rgb(((Math.atan2(dy, dx) / (2 * Math.PI)) + 1) % 1, r / R, hsv[2]);
        dd[o] = c[0]; dd[o + 1] = c[1]; dd[o + 2] = c[2]; dd[o + 3] = r > R - 1 ? 255 * (R - r) : 255;
      }
      x.putImageData(img, 0, 0);
      var a = hsv[0] * 2 * Math.PI, mx = R + Math.cos(a) * hsv[1] * R, my = R + Math.sin(a) * hsv[1] * R;
      x.lineWidth = 3; x.strokeStyle = hsv[2] > 0.5 ? INK : '#FFFFFF';
      x.beginPath(); x.arc(mx, my, 8, 0, 2 * Math.PI); x.stroke();
    }
    function now() { var c = hsv2rgb(hsv[0], hsv[1], hsv[2]); return hexOf(c[0], c[1], c[2]); }
    function show(done) {
      paintDisc();
      var h = done === null ? start : now();
      el.querySelector('[data-wh-now]').style.background = h;
      el.querySelector('[data-wh-hex]').textContent = h;
      slider.value = Math.round(hsv[2] * 100);
      el.querySelector('[data-wh-recent]').innerHTML = RECENT.map(function (c) { return '<button type="button" style="background:' + c + '" data-wh-sw="' + c + '" aria-label="Colour ' + c + '"></button>'; }).join('');
      if (onPick && done !== null) onPick(h, done);
    }
    function at(e, done) {
      var r = disc.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width * 2 * R - R, dy = (e.clientY - r.top) / r.height * 2 * R - R;
      hsv[0] = ((Math.atan2(dy, dx) / (2 * Math.PI)) + 1) % 1;
      hsv[1] = Math.min(1, Math.hypot(dx, dy) / R);
      if (hsv[2] < 0.15) hsv[2] = 0.9;
      show(done);
    }
    var dragging = false;
    disc.addEventListener('pointerdown', function (e) { dragging = true; disc.setPointerCapture(e.pointerId); at(e, false); });
    disc.addEventListener('pointermove', function (e) { if (dragging) at(e, false); });
    disc.addEventListener('pointerup', function (e) { if (!dragging) return; dragging = false; at(e, true); remember(now()); });
    slider.addEventListener('input', function () { hsv[2] = slider.value / 100; show(false); });
    slider.addEventListener('change', function () { hsv[2] = slider.value / 100; remember(now()); show(true); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wh-sw]');
      if (!b) return;
      hsv = rgb2hsv.apply(null, rgb(b.getAttribute('data-wh-sw')));
      remember(b.getAttribute('data-wh-sw'));
      show(true);
    });
    show(null);
    return { set: function (h) { start = h; hsv = rgb2hsv.apply(null, rgb(h)); if (hsv[2] < 0.5) hsv[2] = 1; show(null); } };
  }

  // ======================================================================== the studio
  var TOOLS = [['pen', 'Pen'], ['fill', 'Fill'], ['eraser', 'Eraser']];
  var ICONS = {
    pen: '<path d="M8 32L10 24L26 8L32 14L16 30Z" fill="#FFC800" stroke="#13294A" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 32L10 24L16 30Z" fill="#13294A"/>',
    fill: '<path d="M8 18L18 8L30 20L20 30Z" fill="#1CB0F6" stroke="#13294A" stroke-width="2.6" stroke-linejoin="round"/><path d="M30 20C34 26 34 30 31 32C28 30 28 26 30 20Z" fill="#1CB0F6" stroke="#13294A" stroke-width="2"/>',
    eraser: '<path d="M6 26L20 12L32 24L22 34H12Z" fill="#FF86D0" stroke="#13294A" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 34H34" stroke="#13294A" stroke-width="2.6" stroke-linecap="round"/>',
    undo: '<path d="M14 10L7 17L14 24" fill="none" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17H24A8 8 0 0 1 24 33H16" fill="none" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round"/>',
    redo: '<path d="M26 10L33 17L26 24" fill="none" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 17H16A8 8 0 0 0 16 33H24" fill="none" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round"/>',
    tidy: '<g transform="rotate(-40 20 20)"><rect x="3" y="13" width="34" height="13" rx="2" fill="#FFC800" stroke="#13294A" stroke-width="2.4"/><path d="M8 13V18M13 13V20M18 13V18M23 13V20M28 13V18M33 13V20" stroke="#13294A" stroke-width="2"/></g>'
  };
  function icon(k) { return '<svg viewBox="0 0 40 40" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  var KIND_NAMES = { line: ['straight line', 'straight lines'], circle: ['circle', 'circles'], ellipse: ['oval', 'ovals'], rect: ['rectangle', 'rectangles'],
    triangle: ['triangle', 'triangles'], polygon: ['shape', 'shapes'], loop: ['loop', 'loops'], curve: ['smooth line', 'smooth lines'] };
  function said(kinds) {
    var out = Object.keys(KIND_NAMES).filter(function (k) { return kinds[k]; }).map(function (k) { return kinds[k] + ' ' + KIND_NAMES[k][kinds[k] === 1 ? 0 : 1]; });
    return out.length ? 'Tidied: ' + out.join(', ') + '.' : 'Nothing to tidy. It\'s already neat.';
  }
  // The studio in el. opts: kind ('place' or 'char'), code (a drawing to carry on with), start (a place's background
  // letter), say(line) (he says it). Returns { code() -> { code } or { error } }.
  function mount(el, opts) {
    var kind = opts.kind, S = SIZE[kind], d = (opts.code && decode(opts.code, kind)) || { start: kind === 'place' ? opts.start || 'g' : 'b', ops: [] };
    // The pen starts navy, or white on the night background.
    var st = { tool: 'pen', size: 1, colour: d.start === 'n' ? '#FFFFFF' : INK, live: false, undo: [], redo: [], cur: null, wheelOpen: false };
    el.innerHTML = '<div class="mk-st">' +
      '<div class="mk-st__stage mk-st__stage--' + kind + '"><canvas class="mk-st__canvas" width="' + S[0] + '" height="' + S[1] + '" role="img" aria-label="Your drawing"></canvas>' +
      (kind === 'place' ? '<span class="mk-st__ground" aria-hidden="true"><b>Ground</b></span>' : '<span class="mk-st__feet" aria-hidden="true"></span>') + '</div>' +
      '<div class="mk-st__tools" role="toolbar" aria-label="Drawing tools">' +
        '<span class="mk-st__group">' + TOOLS.map(function (t) { return '<button type="button" class="mk-st__btn" data-st-tool="' + t[0] + '" aria-label="' + t[1] + '" title="' + t[1] + '">' + icon(t[0]) + '<span>' + t[1] + '</span></button>'; }).join('') + '</span>' +
        '<span class="mk-st__group mk-st__sizes">' + [0, 1, 2].map(function (i) { return '<button type="button" class="mk-st__size" data-st-size="' + i + '" aria-label="' + ['Thin', 'Medium', 'Thick'][i] + '"><i style="width:' + (6 + i * 6) + 'px;height:' + (6 + i * 6) + 'px"></i></button>'; }).join('') + '</span>' +
        '<button type="button" class="mk-st__colour" data-st-colour aria-label="Colour" aria-expanded="false"><i data-st-now></i><span>Colour</span></button>' +
        '<span class="mk-st__group">' +
          '<button type="button" class="mk-st__btn mk-st__btn--dark" data-st-undo aria-label="Undo" title="Undo">' + icon('undo') + '</button>' +
          '<button type="button" class="mk-st__btn mk-st__btn--dark" data-st-redo aria-label="Redo" title="Redo">' + icon('redo') + '</button>' +
          '<button type="button" class="mk-st__btn mk-st__btn--dark mk-st__btn--text" data-st-clear>Clear</button></span>' +
      '</div>' +
      '<div class="mk-st__wheel" data-st-wheel hidden></div>' +
      '<div class="mk-st__tidy"><button type="button" class="mk-st__tidybtn" data-st-tidy>' + icon('tidy') + '<span>Tidy up my drawing</span></button>' +
        '<label class="mk-st__live"><input type="checkbox" data-st-live> Tidy as I draw</label></div>' +
      (kind === 'place' ? '<div class="mk-st__starts"><span>Start again with</span>' + Object.keys(STARTS).map(function (k) {
        return '<button type="button" class="mk-mini" data-st-start="' + k + '"><i><b style="background:' + STARTS[k][1] + '"></b><b style="background:' + STARTS[k][2] + '"></b></i>' + STARTS[k][0] + '</button>';
      }).join('') + '</div>' : '') +
      '</div>';
    var c = el.querySelector('canvas'), x = c.getContext('2d'), bg = render(c, d, kind), wh = null;
    function redraw() { bg = render(c, d, kind); }
    function keep() { st.undo.push(d.ops.slice()); if (st.undo.length > 60) st.undo.shift(); st.redo = []; tools(); }
    function tools() {
      el.querySelectorAll('[data-st-tool]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-st-tool') === st.tool)); });
      el.querySelectorAll('[data-st-size]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-st-size') === st.size)); });
      el.querySelector('[data-st-now]').style.background = st.colour;
      el.querySelector('[data-st-undo]').disabled = !st.undo.length;
      el.querySelector('[data-st-redo]').disabled = !st.redo.length;
      c.style.cursor = st.tool === 'fill' ? 'cell' : 'crosshair';
    }
    function point(e) { var r = c.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * S[0]), Math.round((e.clientY - r.top) / r.height * S[1])]; }
    c.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var p = point(e);
      if (st.tool === 'fill') {
        var px = x.getImageData(p[0], p[1], 1, 1).data, k = px[3] < 40 ? '' : hexOf(px[0], px[1], px[2]), o = { t: 'f', c: st.colour, k: k, x: p[0], y: p[1] };
        if (k === st.colour) return;
        keep();
        d.ops.push(o);
        drawOp(x, o, kind, bg);
        return;
      }
      if (d.ops.length >= MAX_OPS) { if (opts.say) opts.say('That\'s a lot of lines. Tidy it up, or clear some.'); return; }
      c.setPointerCapture(e.pointerId);
      st.cur = { t: st.tool === 'eraser' ? 'e' : 's', c: st.colour, w: BRUSH[kind][st.size] * (st.tool === 'eraser' ? 2 : 1), z: 2, p: p.slice() };
      x.save(); x.lineCap = x.lineJoin = 'round'; x.lineWidth = st.cur.w;
      if (st.cur.t === 'e') { if (kind === 'char') { x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; } else x.strokeStyle = x.createPattern(bg, 'no-repeat'); }
      else x.strokeStyle = st.cur.c;
      x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + 0.01, p[1]); x.stroke();
    });
    c.addEventListener('pointermove', function (e) {
      if (!st.cur) return;
      var p = point(e), q = st.cur.p, lx = q[q.length - 2], ly = q[q.length - 1];
      if (Math.hypot(p[0] - lx, p[1] - ly) < 2.5 || q.length >= MAX_PTS * 2) return;
      q.push(p[0], p[1]);
      x.beginPath(); x.moveTo(lx, ly); x.lineTo(p[0], p[1]); x.stroke();
    });
    function end() {
      if (!st.cur) return;
      x.restore();
      var o = st.cur;
      st.cur = null;
      keep();
      d.ops.push(o);
      if (st.live && o.t === 's') {
        var r = tidyAll(d.ops, d.ops.length - 1);
        d.ops = r.ops;
        redraw();
      }
    }
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-st-tool]'))) { st.tool = b.getAttribute('data-st-tool'); tools(); return; }
      if ((b = e.target.closest('[data-st-size]'))) { st.size = +b.getAttribute('data-st-size'); tools(); return; }
      if (e.target.closest('[data-st-colour]')) {
        st.wheelOpen = !st.wheelOpen;
        var box = el.querySelector('[data-st-wheel]');
        box.hidden = !st.wheelOpen;
        el.querySelector('[data-st-colour]').setAttribute('aria-expanded', String(st.wheelOpen));
        if (st.wheelOpen && !wh) wh = wheel(box, st.colour, function (h, done) {
          st.colour = h;
          if (st.tool === 'eraser') st.tool = 'pen';
          tools();
          // On a phone the wheel closes once you've picked, so the drawing's back in view.
          if (done && window.innerWidth <= 700) { st.wheelOpen = false; box.hidden = true; el.querySelector('[data-st-colour]').setAttribute('aria-expanded', 'false'); c.scrollIntoView({ block: 'nearest' }); }
        });
        else if (st.wheelOpen && wh) wh.set(st.colour);
        return;
      }
      if (e.target.closest('[data-st-undo]')) undo(); else if (e.target.closest('[data-st-redo]')) redo();
      else if (e.target.closest('[data-st-clear]')) { keep(); d.ops = []; redraw(); }
      else if (e.target.closest('[data-st-tidy]')) {
        keep();
        var r = tidyAll(d.ops);
        d.ops = r.ops;
        redraw();
        if (opts.say) opts.say(said(r.kinds));
      } else if ((b = e.target.closest('[data-st-start]'))) { keep(); d.start = b.getAttribute('data-st-start'); d.ops = []; if (d.start === 'n') st.colour = '#FFFFFF'; redraw(); tools(); }
    });
    el.addEventListener('change', function (e) { if (e.target.closest('[data-st-live]')) st.live = e.target.checked; });
    function undo() { if (!st.undo.length) return; st.redo.push(d.ops.slice()); d.ops = st.undo.pop(); redraw(); tools(); }
    function redo() { if (!st.redo.length) return; st.undo.push(d.ops.slice()); d.ops = st.redo.pop(); redraw(); tools(); }
    function keys(e) {
      if (!el.isConnected) { document.removeEventListener('keydown', keys); return; }
      if (!(e.ctrlKey || e.metaKey) || e.target.closest('input, textarea')) return;
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    }
    document.addEventListener('keydown', keys);
    tools();
    return {
      code: function () {
        if (!d.ops.length && (kind === 'char' || d.start === 'b')) return { error: 'Draw something first.' };
        var code = fit({ start: d.start, ops: d.ops.map(function (o) { var q = Object.assign({}, o); delete q.kind; return q; }) }, kind);
        return code ? { code: code } : { error: 'That drawing\'s too big to fit in a link. Tidy it up, or clear some of it.' };
      },
      // For the browser test: draws a line or fills, as a person would.
      state: function () { return { ops: d.ops, tool: st.tool, colour: st.colour }; }
    };
  }

  window.BioMakerDraw = {
    SIZE: SIZE, GROUND: GROUND, STARTS: STARTS, MAX_CODE: MAX_CODE,
    mount: mount, wheel: wheel, image: image, isDark: isDark,
    encode: encode, decode: decode, fit: fit, tidyStroke: tidyStroke, tidyAll: tidyAll, fillRegion: fillRegion, rdp: rdp, hsv2rgb: hsv2rgb, rgb2hsv: rgb2hsv
  };
})();

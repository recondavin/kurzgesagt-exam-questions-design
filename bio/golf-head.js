// His head as a golf ball, for Mini Golf (the user: "make a head and show me the model before hand", "the head for the
// golf ball"). A 3D model in three.js shapes after the site's drawing of him (ExamTeacher.head): a round, bald head with
// three dots on top (the user: "he has 3 dots on his head not that many", so no golf-ball dimples); spiky dark tufts of
// hair above his ears and three wild strands on top; a heavy frowning brow under thick eyebrows; round glasses with white
// lenses, his eyes looking in; a big round nose; ears that stick out; a wide, open, grumpy mouth with one tooth, and a
// line under it for his lower lip, well clear of it (the user: "make the mouth ... better and more spaced"). Navy
// outlines (inverted hulls) and flat toon colours, as in the game.
// Built at radius 1, facing +z, up +y. It still rolls as a ball: only the nose, ears and hair stand off it.
//   GolfHead.build(THREE, { tones, keep, line }) -> THREE.Group
//     tones: the toon gradient texture (MeshToonMaterial.gradientMap);
//     keep(o): every geometry and material made is passed to it, so the caller can dispose of them;
//     line: how thick its navy outlines are (0.05 by default; the game, drawing it small, uses 0.1).
(function () {
  'use strict';
  var SKIN = '#F2C9A0', INK = '#13294A', HAIR = '#13233A', WHITE = '#FFFFFF';

  function build(TH, opt) {
    opt = opt || {};
    var keep = opt.keep || function (o) { return o; }, root = new TH.Group(), LINE = opt.line || 0.05, i, k;
    var V = function (x, y, z) { return new TH.Vector3(x, y, z); }, Y = V(0, 1, 0), Z = V(0, 0, 1);
    var skin = keep(new TH.MeshToonMaterial({ color: SKIN, gradientMap: opt.tones || null }));
    var ink = keep(new TH.MeshBasicMaterial({ color: INK, side: TH.BackSide }));
    var hair = keep(new TH.MeshBasicMaterial({ color: HAIR }));
    var white = keep(new TH.MeshBasicMaterial({ color: WHITE }));
    var drawn = keep(new TH.MeshBasicMaterial({ color: HAIR, side: TH.DoubleSide })), drawnWhite = keep(new TH.MeshBasicMaterial({ color: WHITE, side: TH.DoubleSide }));
    function mesh(geo, mat, to) { var m = new TH.Mesh(keep(geo), mat); (to || root).add(m); return m; }

    // The head's shape: a ball with a heavy brow, cheeks, a muzzle under the nose and a chin.
    var CHEEKS = [V(0.42, -0.2, 0.88).normalize(), V(-0.42, -0.2, 0.88).normalize()], MUZZLE = V(0, -0.3, 0.95).normalize(), CHIN = V(0, -0.72, 0.69).normalize();
    function bump(n, c, w) { return Math.exp(-n.distanceToSquared(c) / w); }
    function sculpt(n) {
      var brow = Math.exp(-Math.pow((n.y - 0.47) / 0.08, 2) - Math.pow(n.x / 0.5, 2)) * Math.min(1, Math.max(0, (n.z - 0.55) / 0.2));
      return 0.055 * brow + 0.05 * (bump(n, CHEEKS[0], 0.05) + bump(n, CHEEKS[1], 0.05)) + 0.04 * bump(n, MUZZLE, 0.06) + 0.03 * bump(n, CHIN, 0.05);
    }
    // A point on the head in a direction, lifted off it by off.
    function on(x, y, z, off) {
      var n = V(x, y, z).normalize(), r = 1 + sculpt(n) + (off || 0);
      return n.multiplyScalar(r);
    }
    // The orientation that turns +z to face along d.
    function facing(d) { return new TH.Quaternion().setFromUnitVectors(Z, d.clone().normalize()); }
    // A squashed ball with its navy outline (an even LINE all round).
    function blob(rad, s, at, mat, to, q) {
      var b = mesh(new TH.SphereGeometry(rad, 24, 16), mat, to), o = mesh(new TH.SphereGeometry(rad, 24, 16), ink, to);
      b.scale.set(s[0], s[1], s[2]);
      o.scale.set(s[0] + LINE / rad, s[1] + LINE / rad, s[2] + LINE / rad);
      b.position.copy(at);
      o.position.copy(at);
      if (q) { b.quaternion.copy(q); o.quaternion.copy(q); }
      return b;
    }
    // A tube through points, tapering from r0 to r1, its ends rounded.
    function tube(pts, r0, r1, mat, to) {
      var curve = new TH.CatmullRomCurve3(pts), n = 20, rs = 8, geo = new TH.TubeGeometry(curve, n, 1, rs, false), p = geo.attributes.position, c = V(0, 0, 0), v = V(0, 0, 0), j;
      for (i = 0; i <= n; i++) {
        curve.getPointAt(i / n, c);
        var r = r0 + (r1 - r0) * i / n;
        for (j = 0; j <= rs; j++) {
          k = i * (rs + 1) + j;
          v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c);
          p.setXYZ(k, v.x, v.y, v.z);
        }
      }
      mesh(geo, mat, to);
      [[pts[0], r0], [pts[pts.length - 1], r1]].forEach(function (e) { if (e[1] > 0.01) mesh(new TH.SphereGeometry(e[1], 12, 8), mat, to).position.copy(e[0]); });
    }
    // A closed outline smoothed through key points [x, y].
    function smooth(keys, n) {
      return new TH.CatmullRomCurve3(keys.map(function (q) { return V(q[0], q[1], 0); }), true).getSpacedPoints(n).slice(0, n).map(function (q) { return [q.x, q.y]; });
    }
    function round(x, y, r) {
      var o = [], j;
      for (j = 0; j < 20; j++) o.push([x + Math.cos(j / 20 * Math.PI * 2) * r, y + Math.sin(j / 20 * Math.PI * 2) * r]);
      return o;
    }
    // A flat shape drawn on him, as in the drawing: an outline [x, y] in a plane square to the head at dir (x across, y up),
    // filled in rings from its middle and laid onto the head's surface (lifted by off), so it follows the curve.
    function decal(pts, dir, off, mat) {
      var c = dir.clone().normalize(), u = Y.clone().cross(c).normalize(), w = c.clone().cross(u), RINGS = 5, n = pts.length;
      var mx = 0, my = 0, xyz = [], idx = [], j, a, b, q = V(0, 0, 0);
      pts.forEach(function (p) { mx += p[0] / n; my += p[1] / n; });
      function put(x, y) {
        q.copy(c).addScaledVector(u, x).addScaledVector(w, y).normalize();
        q.multiplyScalar(1 + sculpt(q) + off);
        xyz.push(q.x, q.y, q.z);
      }
      put(mx, my);
      for (j = 1; j <= RINGS; j++) pts.forEach(function (p) { put(mx + (p[0] - mx) * j / RINGS, my + (p[1] - my) * j / RINGS); });
      for (a = 0; a < n; a++) {
        b = (a + 1) % n;
        idx.push(0, 1 + a, 1 + b);
        for (j = 1; j < RINGS; j++) idx.push(1 + a + (j - 1) * n, 1 + a + j * n, 1 + b + j * n, 1 + a + (j - 1) * n, 1 + b + j * n, 1 + b + (j - 1) * n);
      }
      var geo = new TH.BufferGeometry();
      geo.setAttribute('position', new TH.Float32BufferAttribute(xyz, 3));
      geo.setIndex(idx);
      return mesh(geo, mat);
    }

    // The head: a ball (its seam turned to the back), shaped.
    var HAIRAT = V(0.84, 0.36, -0.4).normalize();
    var geo = new TH.SphereGeometry(1, 96, 72).rotateY(-Math.PI / 2), pos = geo.attributes.position, n = V(0, 0, 0);
    for (i = 0; i < pos.count; i++) {
      n.fromBufferAttribute(pos, i).normalize();
      n.multiplyScalar(1 + sculpt(n));
      pos.setXYZ(i, n.x, n.y, n.z);
    }
    geo.computeVertexNormals();
    weld(geo);
    mesh(geo, skin);
    // Its outline: the same shape a little bigger, drawn inside out in navy.
    var hull = new TH.SphereGeometry(1, 96, 72).rotateY(-Math.PI / 2), hp = hull.attributes.position;
    for (i = 0; i < hp.count; i++) {
      n.fromBufferAttribute(hp, i).normalize();
      n.multiplyScalar(1 + sculpt(n) + LINE);
      hp.setXYZ(i, n.x, n.y, n.z);
    }
    mesh(hull, ink);

    // Each side (built for his left, on +x, and mirrored for his right): ear, tuft of hair, eyebrow, lens, glasses arm and
    // the crease down from his nose.
    [1, -1].forEach(function (s) {
      var h = new TH.Group();
      h.scale.x = s;
      root.add(h);
      // The ear, turned a little forward, with the curl inside it.
      var ear = new TH.Group(), EW = 0.3 * 0.45, EH = 0.3, ED = 0.3 * 0.7;
      ear.position.set(1.01, -0.02, -0.04);
      ear.rotation.y = -0.65;
      h.add(ear);
      blob(0.3, [0.45, 1, 0.7], V(0, 0, 0), skin, ear);
      var ex = function (y, z) { return V(EW * Math.sqrt(Math.max(0, 1 - Math.pow(y / EH, 2) - Math.pow(z / ED, 2))) + 0.006, y, z); };
      tube([ex(0.17, -0.07), ex(0.18, 0.07), ex(0.05, 0.13), ex(-0.12, 0.07)], 0.022, 0.016, hair, ear);
      // The tuft: a dark patch above and behind the ear, spiky round its top and back.
      var P = HAIRAT, patch = mesh(new TH.SphereGeometry(0.34, 24, 16), hair, h);
      patch.scale.set(1, 1, 0.72);
      patch.quaternion.copy(facing(P));
      patch.position.copy(P).multiplyScalar(0.78);
      var U = Y.clone().addScaledVector(P, -P.dot(Y)).normalize(), W = P.clone().cross(U);
      [-2.1, -1.6, -1.1, -0.6, -0.1, 0.4].forEach(function (a, j) {
        var out = U.clone().multiplyScalar(Math.cos(a)).addScaledVector(W, Math.sin(a));
        var base = P.clone().addScaledVector(out, 0.15).normalize().multiplyScalar(1.01);
        var dir = out.clone().multiplyScalar(0.8).addScaledVector(P, 0.9).addScaledVector(Y, 0.35).normalize(), L = 0.22 + 0.06 * (j % 3);
        tube([base, base.clone().addScaledVector(dir, L * 0.5).addScaledVector(Y, 0.02), base.clone().addScaledVector(dir, L).addScaledVector(Y, 0.07)], 0.07, 0.004, hair, h);
      });
      // A thick eyebrow, its inner end low.
      tube([on(0.06, 0.37, 1, 0.045), on(0.2, 0.47, 0.95, 0.05), on(0.36, 0.53, 0.86, 0.045), on(0.52, 0.52, 0.72, 0.035)], 0.075, 0.04, hair, h);
      // The lens: a white dome in a thick navy rim, set square to the front (so it stands off his cheek at the side), his
      // eye looking in towards his nose.
      var N = V(0.22, 0.03, 1).normalize(), C = V(0.3, 0.15, 1.03), q = facing(N), X = V(1, 0, 0).applyQuaternion(q);
      var lens = mesh(new TH.SphereGeometry(0.225, 28, 14), white, h);
      lens.scale.set(1, 1, 0.28);
      lens.quaternion.copy(q);
      lens.position.copy(C);
      var rim = mesh(new TH.TorusGeometry(0.24, 0.05, 10, 44), hair, h);
      rim.quaternion.copy(q);
      rim.position.copy(C);
      var eye = mesh(new TH.SphereGeometry(0.08, 18, 10), hair, h);
      eye.scale.set(1, 1, 0.4);
      eye.quaternion.copy(q);
      eye.position.copy(C).addScaledVector(X, -0.06).addScaledVector(Y, -0.02).addScaledVector(N, 0.045);
      // The arm, back to the top of his ear.
      tube([C.clone().addScaledVector(X, 0.24), on(0.8, 0.2, 0.62, 0.04), on(0.96, 0.2, 0.2, 0.035), on(0.98, 0.2, -0.1, 0.02)], 0.026, 0.024, hair, h);
      // A short crease beside his nose.
      tube([on(0.21, -0.2, 0.96, 0.012), on(0.27, -0.27, 0.94, 0.012), on(0.3, -0.34, 0.91, 0.012)], 0.02, 0.013, hair, h);
    });

    // The bridge of the glasses.
    tube([V(0.07, 0.22, 1.07), V(0, 0.25, 1.09), V(-0.07, 0.22, 1.07)], 0.032, 0.032, hair);
    // A big round nose: its bridge and its bulb.
    blob(0.13, [1, 1.5, 1], on(0, 0.06, 1, -0.02), skin);
    blob(0.215, [1, 0.95, 0.95], on(0, -0.07, 1, 0.1), skin);
    // The mouth, drawn on as in the drawing: wide open and grumpy (its top arched, a sharp corner on his right, a round
    // one on his left), one tooth hanging from the top, and a short line for his lower lip well below it, with a tick
    // at his chin.
    var MOUTH = V(0, -0.52, 0.85);
    decal(smooth([[-0.4, -0.06], [-0.26, 0.08], [0, 0.18], [0.24, 0.14], [0.37, 0.03], [0.39, -0.09], [0.3, -0.19], [0.1, -0.23], [-0.12, -0.19], [-0.3, -0.12]], 80), MOUTH, 0.008, drawn);
    decal(smooth([[0.05, 0.15], [0.17, 0.14], [0.175, 0.04], [0.15, 0.01], [0.075, 0.015], [0.05, 0.04]], 32), MOUTH, 0.014, drawnWhite);
    tube([on(-0.24, -0.79, 0.58, 0.01), on(-0.09, -0.81, 0.58, 0.014), on(0.06, -0.79, 0.6, 0.01)], 0.036, 0.03, hair);
    tube([on(0.21, -0.78, 0.6, 0.01), on(0.29, -0.71, 0.65, 0.01)], 0.02, 0.016, hair);
    // His three dots, on top towards his left.
    [[0.25, 0.86, 0.4], [0.38, 0.8, 0.42], [0.31, 0.75, 0.56]].forEach(function (d) { decal(round(0, 0, 0.04), V(d[0], d[1], d[2]), 0.004, drawn); });
    // A line on his forehead.
    tube([on(-0.22, 0.63, 0.75, 0.01), on(-0.08, 0.6, 0.79, 0.012), on(0.06, 0.62, 0.78, 0.01)], 0.018, 0.018, hair);
    // Three wild strands on top, curling.
    [[-0.12, 1, -0.06, -1], [0.04, 1, 0.06, 1], [0.2, 0.97, -0.1, 1]].forEach(function (t) {
      var b = on(t[0], t[1], t[2], -0.01), up = b.clone().normalize(), sw = V(t[3] * 0.1, 0, 0.03);
      tube([b, b.clone().addScaledVector(up, 0.13).add(sw), b.clone().addScaledVector(up, 0.23).addScaledVector(sw, 2.4), b.clone().addScaledVector(up, 0.24).addScaledVector(sw, 3.6).addScaledVector(Y, -0.05)], 0.032, 0.004, hair);
    });
    return root;
  }

  // Shares the normals of vertices in the same place (the ball's seam and poles), so it shades without a seam.
  function weld(geo) {
    var p = geo.attributes.position, nr = geo.attributes.normal, at = {}, i;
    for (i = 0; i < p.count; i++) {
      var key = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4);
      (at[key] = at[key] || []).push(i);
    }
    Object.keys(at).forEach(function (key) {
      var l = at[key], x = 0, y = 0, z = 0;
      if (l.length < 2) return;
      l.forEach(function (j) { x += nr.getX(j); y += nr.getY(j); z += nr.getZ(j); });
      var len = Math.hypot(x, y, z) || 1;
      l.forEach(function (j) { nr.setXYZ(j, x / len, y / len, z / len); });
    });
    nr.needsUpdate = true;
  }

  window.GolfHead = { build: build };
})();

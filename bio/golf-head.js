// His head as a golf ball, for Mini Golf (the user: "make a head and show me the model before hand", "the head for the
// golf ball"). A 3D model in three.js shapes after the site's drawing of him (ExamTeacher.head): a round, bald head,
// dimpled like a golf ball everywhere but his face and ears; spiky dark tufts of hair above his ears and three wild
// strands on top; a heavy frowning brow under thick eyebrows; round glasses with white lenses, his eyes looking in; a big
// round nose; ears that stick out; an open, grumpy mouth with one tooth over a pouting lower lip. Navy outlines (inverted
// hulls) and flat toon colours, as in the game.
// Built at radius 1, facing +z, up +y. It still rolls as a ball: only the nose, ears and hair stand off it.
//   GolfHead.build(THREE, { tones, keep }) -> THREE.Group
//     tones: the toon gradient texture (MeshToonMaterial.gradientMap);
//     keep(o): every geometry and material made is passed to it, so the caller can dispose of them.
(function () {
  'use strict';
  var SKIN = '#F2C9A0', DIMPLE = '#DBA97E', INK = '#13294A', HAIR = '#13233A', WHITE = '#FFFFFF';
  // Outline thickness; golf-ball dimples: how many over the whole ball (before his face and ears are left clear), their
  // angular radius and depth.
  var LINE = 0.05, DIMPLES = 400, PIT = 0.075, DEEP = 0.022;

  function build(TH, opt) {
    opt = opt || {};
    var keep = opt.keep || function (o) { return o; }, root = new TH.Group(), i, k;
    var V = function (x, y, z) { return new TH.Vector3(x, y, z); }, Y = V(0, 1, 0), Z = V(0, 0, 1);
    var skin = keep(new TH.MeshToonMaterial({ color: SKIN, gradientMap: opt.tones || null }));
    var ink = keep(new TH.MeshBasicMaterial({ color: INK, side: TH.BackSide }));
    var hair = keep(new TH.MeshBasicMaterial({ color: HAIR }));
    var white = keep(new TH.MeshBasicMaterial({ color: WHITE }));
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

    // Golf-ball dimples, spread evenly (a Fibonacci spiral) over the ball, leaving his face, ears and hair clear.
    var HAIRAT = [V(0.84, 0.36, -0.4).normalize(), V(-0.84, 0.36, -0.4).normalize()];
    function bare(x, y, z) {
      if (z > 0.3 && y < 0.62) return false;
      if (Math.abs(x) > 0.72 && y > -0.42 && y < 0.4 && z > -0.5 && z < 0.6) return false;
      return HAIRAT.every(function (h) { return x * h.x + y * h.y + z * h.z < 0.9; });
    }
    var pits = [];
    for (i = 0; i < DIMPLES; i++) {
      var py = 1 - (i + 0.5) / DIMPLES * 2, pr = Math.sqrt(1 - py * py), pa = i * 2.399963, px = Math.cos(pa) * pr, pz = Math.sin(pa) * pr;
      if (bare(px, py, pz)) pits.push(px, py, pz);
    }

    // The head: a fine ball (its seam turned to the back), shaped, dimpled, and coloured skin with darker dimples.
    var geo = new TH.SphereGeometry(1, 200, 150).rotateY(-Math.PI / 2), pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    var cs = new TH.Color(SKIN), cd = new TH.Color(DIMPLE), n = V(0, 0, 0), cosPit = Math.cos(PIT);
    for (i = 0; i < pos.count; i++) {
      n.fromBufferAttribute(pos, i).normalize();
      var best = -1;
      for (k = 0; k < pits.length; k += 3) {
        var d = n.x * pits[k] + n.y * pits[k + 1] + n.z * pits[k + 2];
        if (d > best) best = d;
      }
      var dip = 0, m = 0;
      if (best > cosPit) {
        var t = Math.acos(Math.min(1, best)) / PIT;
        dip = DEEP * (1 - t * t);
        m = t < 0.8 ? 1 : (1 - t) / 0.2;
      }
      var rad = 1 + sculpt(n) - dip;
      pos.setXYZ(i, n.x * rad, n.y * rad, n.z * rad);
      col[i * 3] = cs.r + (cd.r - cs.r) * m;
      col[i * 3 + 1] = cs.g + (cd.g - cs.g) * m;
      col[i * 3 + 2] = cs.b + (cd.b - cs.b) * m;
    }
    geo.setAttribute('color', new TH.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    weld(geo);
    mesh(geo, keep(new TH.MeshToonMaterial({ color: WHITE, vertexColors: true, gradientMap: opt.tones || null })));
    // Its outline: the same shape without the dimples, a little bigger, drawn inside out in navy.
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
      var P = HAIRAT[0], patch = mesh(new TH.SphereGeometry(0.34, 24, 16), hair, h);
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
      // The crease from beside his nose down past his mouth.
      tube([on(0.21, -0.2, 0.96, 0.012), on(0.29, -0.36, 0.92, 0.012), on(0.27, -0.54, 0.82, 0.012)], 0.022, 0.014, hair, h);
    });

    // The bridge of the glasses.
    tube([V(0.07, 0.22, 1.07), V(0, 0.25, 1.09), V(-0.07, 0.22, 1.07)], 0.032, 0.032, hair);
    // A big round nose: its bridge and its bulb.
    blob(0.13, [1, 1.5, 1], on(0, 0.06, 1, -0.02), skin);
    blob(0.235, [1, 0.95, 0.95], on(0, -0.1, 1, 0.1), skin);
    // The open, grumpy mouth (a thin navy shape just proud of his face, tilted), one tooth, and the pouting lower lip.
    var MOUTH = V(0.05, -0.5, 0.86).normalize(), mq = facing(MOUTH).multiply(new TH.Quaternion().setFromAxisAngle(Z, 0.12));
    var mouth = mesh(new TH.SphereGeometry(1, 28, 14), hair);
    mouth.scale.set(0.33, 0.2, 0.06);
    mouth.quaternion.copy(mq);
    mouth.position.copy(on(0.05, -0.5, 0.86, -0.048));
    var tooth = mesh(new TH.BoxGeometry(0.085, 0.1, 0.05), white);
    tooth.quaternion.copy(mq);
    tooth.position.copy(on(0.12, -0.45, 0.88, 0.012));
    blob(0.1, [2.2, 0.55, 0.8], on(0.05, -0.63, 0.77, -0.02), skin, root, facing(V(0.05, -0.63, 0.77)).multiply(new TH.Quaternion().setFromAxisAngle(Z, 0.12)));
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

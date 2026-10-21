// Walking: a grid over the ground (cells of 0.25 m), blocked where things stand (grown by a person's radius) and
// wherever walkable(x, z) says no (the sea round an island). A* through it (with a binary heap, so a long walk
// across the village stays fast), then the corners are cut wherever the straight line is clear.
const CELL = 0.25;

export function makeNav(bounds, blocks, radius, walkable) {
  const [x0, z0, x1, z1] = bounds, cols = Math.floor((x1 - x0) / CELL), rows = Math.floor((z1 - z0) / CELL);
  const fixed = new Uint8Array(cols * rows);
  const cx = c => x0 + (c + 0.5) * CELL, cz = r => z0 + (r + 0.5) * CELL;
  const col = x => Math.floor((x - x0) / CELL), row = z => Math.floor((z - z0) / CELL);
  // The edges, and anywhere that isn't ground (each cell's corners are tested, grown by the radius).
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = cx(c), z = cz(r);
    let bad = x < x0 + radius || x > x1 - radius || z < z0 + radius || z > z1 - radius;
    if (!bad && walkable) bad = !(walkable(x - radius, z - radius) && walkable(x + radius, z - radius) && walkable(x - radius, z + radius) && walkable(x + radius, z + radius));
    fixed[r * cols + c] = bad ? 1 : 0;
  }
  // Each block marks the cells whose centres fall inside it, grown by the radius.
  for (const b of blocks) {
    const c0 = Math.max(0, col(b[0] - radius)), c1 = Math.min(cols - 1, col(b[2] + radius));
    const r0 = Math.max(0, row(b[1] - radius)), r1 = Math.min(rows - 1, row(b[3] + radius));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const x = cx(c), z = cz(r);
      if (x > b[0] - radius && x < b[2] + radius && z > b[1] - radius && z < b[3] + radius) fixed[r * cols + c] = 1;
    }
  }
  let grid = fixed, activeOthers = [];
  const cell = (x, z) => [Math.max(0, Math.min(cols - 1, col(x))), Math.max(0, Math.min(rows - 1, row(z)))];
  const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !grid[r * cols + c];

  // Other people block a circle round them while a path is planned.
  function withPeople(others) {
    activeOthers = others;
    grid = fixed.slice();
    for (const o of others) {
      const [oc, or] = cell(o.x, o.z), n = Math.ceil((o.r + radius) / CELL);
      for (let r = or - n; r <= or + n; r++) for (let c = oc - n; c <= oc + n; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        if (Math.hypot(cx(c) - o.x, cz(r) - o.z) < o.r + radius) grid[r * cols + c] = 1;
      }
    }
  }

  function nearestFree(c, r) {
    if (free(c, r)) return [c, r];
    for (let d = 1; d < 60; d++) {
      let best = null, bd = 1e9;
      for (let rr = r - d; rr <= r + d; rr++) for (let cc = c - d; cc <= c + d; cc++) {
        if (Math.max(Math.abs(cc - c), Math.abs(rr - r)) !== d || !free(cc, rr)) continue;
        const dd = Math.hypot(cc - c, rr - r);
        if (dd < bd) { bd = dd; best = [cc, rr]; }
      }
      if (best) return best;
    }
    return null;
  }

  function clear(ax, az, bx, bz) {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / (CELL / 3)));
    for (let i = 1; i <= n; i++) {
      const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n;
      const [c, r] = cell(x, z);
      if (!free(c, r) || !isFree(x, z, activeOthers)) return false;
    }
    return true;
  }

  // A binary heap of cell indices ordered by f.
  const N = cols * rows, g = new Float32Array(N), f = new Float32Array(N), from = new Int32Array(N), state = new Uint8Array(N);
  function heapPush(h, i) { h.push(i); let k = h.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (f[h[p]] <= f[h[k]]) break; [h[p], h[k]] = [h[k], h[p]]; k = p; } }
  function heapPop(h) {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = l + 1;
        let m = k;
        if (l < h.length && f[h[l]] < f[h[m]]) m = l;
        if (r < h.length && f[h[r]] < f[h[m]]) m = r;
        if (m === k) break;
        [h[m], h[k]] = [h[k], h[m]];
        k = m;
      }
    }
    return top;
  }

  // A list of points from (ax, az) towards (bx, bz), ending on the nearest free spot. Null if there is no way.
  function path(ax, az, bx, bz, others = []) {
    withPeople(others);
    const start = nearestFree(...cell(ax, az)), goal = nearestFree(...cell(bx, bz));
    if (!start || !goal) return null;
    g.fill(Infinity); from.fill(-1); state.fill(0);
    const si = start[1] * cols + start[0], gi = goal[1] * cols + goal[0];
    const hx = i => { const dx = Math.abs(i % cols - goal[0]), dz = Math.abs(Math.floor(i / cols) - goal[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    const open = [];
    g[si] = 0; f[si] = hx(si); state[si] = 1;
    heapPush(open, si);
    while (open.length) {
      const cur = heapPop(open);
      if (state[cur] === 2) continue;
      if (cur === gi) break;
      state[cur] = 2;
      const c = cur % cols, r = Math.floor(cur / cols);
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nc = c + dc, nr = r + dr;
        if (!free(nc, nr) || (dc && dr && (!free(c + dc, r) || !free(c, r + dr)))) continue;
        if (dc && dr && !canMove(cx(c), cz(r), cx(nc), cz(nr), others)) continue;
        const ni = nr * cols + nc;
        if (state[ni] === 2) continue;
        const ng = g[cur] + (dc && dr ? 1.414 : 1);
        if (ng < g[ni]) { g[ni] = ng; f[ni] = ng + hx(ni); from[ni] = cur; state[ni] = 1; heapPush(open, ni); }
      }
    }
    if (si !== gi && from[gi] < 0) return null;
    const cells = [];
    for (let i = gi; i !== -1 && i !== si; i = from[i]) cells.unshift(i);
    const pts = cells.map(i => ({ x: cx(i % cols), z: cz(Math.floor(i / cols)) }));
    // End exactly on the tapped spot when it is free.
    const [bc, br] = cell(bx, bz);
    if (pts.length && goal[0] === bc && goal[1] === br && isFree(bx, bz, others)) pts[pts.length - 1] = { x: bx, z: bz };
    // Cut corners.
    const out = [];
    let at = { x: ax, z: az }, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !clear(at.x, at.z, pts[j].x, pts[j].z)) j--;
      out.push(pts[j]);
      at = pts[j];
      i = j + 1;
    }
    return out;
  }

  // Free of things and of the people given (as they stand now), not of where people were for an earlier path.
  function isFree(x, z, others = []) {
    const c = col(x), r = row(z);
    if (c < 0 || r < 0 || c >= cols || r >= rows || fixed[r * cols + c]) return false;
    // Test actual coordinates as well as cell centres: a free cell must not let a body clip an edge.
    if (x < x0 + radius || x > x1 - radius || z < z0 + radius || z > z1 - radius) return false;
    if (blocks.some(b => x > b[0] - radius && x < b[2] + radius && z > b[1] - radius && z < b[3] + radius)) return false;
    if (walkable && ![[x - radius, z - radius], [x + radius, z - radius], [x - radius, z + radius], [x + radius, z + radius]].every(([px, pz]) => walkable(px, pz))) return false;
    return others.every(o => Math.hypot(x - o.x, z - o.z) >= o.r + radius);
  }

  // Sweep the whole movement segment, including the destination. Every moving actor uses this.
  function canMove(ax, az, bx, bz, others = []) {
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / (CELL / 4)));
    for (let i = 1; i <= steps; i++) if (!isFree(ax + (bx - ax) * i / steps, az + (bz - az) * i / steps, others)) return false;
    return true;
  }

  // The free spot nearest to a point (somewhere to put someone whose saved spot is now taken), or null.
  function spot(x, z) {
    grid = fixed;
    const c = nearestFree(...cell(x, z));
    return c && { x: cx(c[0]), z: cz(c[1]) };
  }

  return { path, isFree, canMove, spot };
}

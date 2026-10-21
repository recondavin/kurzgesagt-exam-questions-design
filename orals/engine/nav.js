// Walking: a grid over the floor (cells of 0.2 m), blocked where furniture stands (grown by a person's radius),
// A* through it, then the corners are cut wherever the straight line is clear, so people walk in straight runs.
const CELL = 0.2;

export function makeNav(bounds, blocks, radius) {
  const [x0, z0, x1, z1] = bounds, cols = Math.floor((x1 - x0) / CELL), rows = Math.floor((z1 - z0) / CELL);
  const fixed = new Uint8Array(cols * rows);
  const cx = c => x0 + (c + 0.5) * CELL, cz = r => z0 + (r + 0.5) * CELL;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = cx(c), z = cz(r);
    let bad = x < x0 + radius || x > x1 - radius || z < z0 + radius || z > z1 - radius;
    for (const b of blocks) if (!bad && x > b[0] - radius && x < b[2] + radius && z > b[1] - radius && z < b[3] + radius) bad = true;
    fixed[r * cols + c] = bad ? 1 : 0;
  }
  let grid = fixed;
  const cell = (x, z) => [Math.max(0, Math.min(cols - 1, Math.floor((x - x0) / CELL))), Math.max(0, Math.min(rows - 1, Math.floor((z - z0) / CELL)))];
  const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !grid[r * cols + c];

  // Other people block a circle round them while a path is planned.
  function withPeople(others) {
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
    for (let d = 1; d < Math.max(cols, rows); d++) {
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
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / (CELL / 3));
    for (let i = 1; i < n; i++) {
      const [c, r] = cell(ax + (bx - ax) * i / n, az + (bz - az) * i / n);
      if (!free(c, r)) return false;
    }
    return true;
  }

  // A list of points from (ax, az) towards (bx, bz), ending on the nearest free spot. Null if there is no way.
  function path(ax, az, bx, bz, others = []) {
    withPeople(others);
    let [sc, sr] = cell(ax, az);
    const start = nearestFree(sc, sr), goal = nearestFree(...cell(bx, bz));
    if (!start || !goal) return null;
    const N = cols * rows, g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
    const si = start[1] * cols + start[0], gi = goal[1] * cols + goal[0];
    const h = i => Math.hypot(i % cols - goal[0], Math.floor(i / cols) - goal[1]);
    const open = [si];
    g[si] = 0;
    while (open.length) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (g[open[i]] + h(open[i]) < g[open[bi]] + h(open[bi])) bi = i;
      const cur = open.splice(bi, 1)[0];
      if (cur === gi) break;
      shut[cur] = 1;
      const c = cur % cols, r = Math.floor(cur / cols);
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nc = c + dc, nr = r + dr;
        if (!free(nc, nr) || (dc && dr && (!free(c + dc, r) || !free(c, r + dr)))) continue;
        const ni = nr * cols + nc;
        if (shut[ni]) continue;
        const ng = g[cur] + (dc && dr ? 1.414 : 1);
        if (ng < g[ni]) { g[ni] = ng; from[ni] = cur; if (!open.includes(ni)) open.push(ni); }
      }
    }
    if (si !== gi && from[gi] < 0) return null;
    const cells = [];
    for (let i = gi; i !== -1 && i !== si; i = from[i]) cells.unshift(i);
    let pts = cells.map(i => ({ x: cx(i % cols), z: cz(Math.floor(i / cols)) }));
    // End exactly on the tapped spot when it is free.
    const [bc, br] = cell(bx, bz);
    if (pts.length && goal[0] === bc && goal[1] === br) pts[pts.length - 1] = { x: bx, z: bz };
    // Cut corners.
    const out = [];
    let from0 = { x: ax, z: az }, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !clear(from0.x, from0.z, pts[j].x, pts[j].z)) j--;
      out.push(pts[j]);
      from0 = pts[j];
      i = j + 1;
    }
    return out;
  }

  return { path, isFree: (x, z) => free(...cell(x, z)) };
}

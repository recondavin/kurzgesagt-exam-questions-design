// The 3D world, seen from a camera high and tilted down like Overcooked that never turns: the people, tap (or
// press and hold) to walk, W A S D on a keyboard, tap a person to talk.
// A pack gives either one diorama room (pack.room), framed whole, or an open world (pack.land, see land.js) with
// rooms standing in it (pack.rooms, cottages you can walk into). Outside, the camera follows the player; inside a
// room, the roof lifts off, the front wall drops to a stub and the camera frames the room. While two people talk
// it moves in on them. It always frames inside the part of the screen the panels leave free.
// A building outside can lead into a room that is bigger inside (a building with `enter: <room id>`, a room with
// `follow`): the room stands far off, you're moved there going through the door, and the camera follows you round it.
import * as THREE from '../../lib/three.module.min.js';
import { buildRoom } from './room.js';
import { buildLand } from './land.js?v=walk-2';
import { person, animate } from './people.js?v=walk-1';
import { makeNav } from './nav.js?v=walk-1';

const PITCH = THREE.MathUtils.degToRad(40), FOV = 30;
const DIR = new THREE.Vector3(0, Math.sin(PITCH), Math.cos(PITCH)); // from the target towards the camera
// Outside, at least this much of the world is in view (metres across, metres up the screen).
const FOLLOW_W = 10, FOLLOW_H = 11;
// How fast the player walks (metres a second): brisker outside, where the distances are long.
const SPEED_OUT = 3.4, SPEED_IN = 2.2;

export function createWorld(canvas, pack) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const open = !!pack.land;
  scene.background = new THREE.Color((pack.land && pack.land.sky) || (pack.room && pack.room.sky) || '#1B2A30');

  const hemi = new THREE.HemisphereLight('#FFF1DC', '#5E544B', 1.25);
  scene.add(hemi);
  // The sun's shadows cover the area round the camera's target and move with it.
  const sun = new THREE.DirectionalLight('#FFF4E2', 2.1), SUN = new THREE.Vector3(-3.5, 8, 5.5), SHADOW = open ? 13 : 6.5;
  sun.position.copy(SUN);
  sun.castShadow = true;
  sun.shadow.mapSize.set(open ? 2048 : 1024, open ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -SHADOW, right: SHADOW, top: SHADOW, bottom: -SHADOW, near: 1, far: 40 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.025;
  scene.add(sun, sun.target);

  const rooms = (pack.rooms || [pack.room]).map(r => Object.assign(buildRoom(r), { spec: r, lift: 0 }));
  for (const r of rooms) scene.add(r.group);
  const room = rooms[0];
  const seats = Object.assign({}, ...rooms.map(r => r.seats));
  const land = open ? buildLand(pack.land) : null;
  if (land) scene.add(land.group);
  const sky = scene.background.clone();

  // Rooms reached through a door in a building outside (land.portals): the inside can be far bigger than the
  // outside, since it stands somewhere else (out of sight) with its own map for walking. Going through the door
  // puts you just inside; going out of its door puts you back outside the building. Only the side you're on is
  // drawn.
  const portalRooms = [];
  for (const g of (land && land.portals) || []) {
    const r = rooms.find(r => r.spec.id === g.id);
    if (!r || !r.door) continue;
    const { w, d } = r.spec, [ox, oz] = r.spec.at || [0, 0], dw = ((r.spec.house && r.spec.house.door) || {}).w || 1.1;
    r.portal = {
      zone: g.zone, out: g.out,
      in: { x: r.door.x, z: oz + d / 2 - 0.8 },
      exit: [r.door.x - dw / 2, oz + d / 2 + 0.2, r.door.x + dw / 2, oz + d / 2 + 1.2],
      area: [ox - w / 2 - 0.8, oz - d / 2 - 0.8, ox + w / 2 + 0.8, oz + d / 2 + 1.6],
    };
    const inside = (x, z) => x > ox - w / 2 && x < ox + w / 2 && z > oz - d / 2 && (z < oz + d / 2 || Math.abs(x - r.door.x) < dw / 2);
    r.nav = makeNav(r.portal.area, r.blocks, 0.3, inside);
    portalRooms.push(r);
  }
  const outdoorBlocks = [...rooms.filter(r => !r.portal).flatMap(r => r.blocks), ...(land ? land.blocks : [])];
  const nav = makeNav(land ? land.bounds : room.bounds, outdoorBlocks, 0.3, land && land.walkable);
  const within = (b, x, z) => x > b[0] && x < b[2] && z > b[1] && z < b[3];
  // The room through a door that a point is in, or null (the world outside).
  const areaOf = (x, z) => portalRooms.find(r => within(r.portal.area, x, z)) || null;
  const navAt = (x, z) => { const a = areaOf(x, z); return a ? a.nav : nav; };

  const people = {};
  for (const [id, spec] of Object.entries(pack.people)) {
    const p = person(spec.look);
    p.id = id;
    p.name = spec.name;
    const at = spec.at || [0, 0];
    p.root.position.set(at[0], 0, at[1]);
    p.yaw = p.yawTo = spec.face || 0;
    p.home = { x: at[0], z: at[1], yaw: p.yaw };
    // Where someone talking to them stands (a shopkeeper is talked to across the counter).
    if (spec.talkAt) p.talkAt = { x: spec.talkAt[0], z: spec.talkAt[1] };
    scene.add(p.root);
    people[id] = p;
  }
  const player = people.player;
  // People who stroll about (spec.wander: { spots: [[x, z], ...] } or { area: [x0, z0, x1, z1] }, and speed),
  // pausing a few seconds at each place.
  for (const [id, spec] of Object.entries(pack.people)) if (spec.wander && id !== 'player') {
    const p = people[id];
    p.wander = spec.wander;
    p.wanderWait = 1 + Math.random() * 4;
    p.speed = spec.wander.speed || 1.1;
  }
  if (land) land.setNavigation(outdoorBlocks, () => Object.values(people).map(p => ({ x: p.root.position.x, z: p.root.position.z, r: p.radius })));
  // Paths are a plan, not permission to pass through something that moves into the way later.
  for (const p of Object.values(people)) p.canMove = (x, z) => {
    const at = p.root.position;
    return navAt(at.x, at.z).canMove(at.x, at.z, x, z, othersOf(p));
  };
  // What the player is walking on: the room's floor, or the ground outside.
  function groundAt(x, z) {
    const r = open ? roomAt(x, z) : room;
    if (r) return r.spec.floor === 'boards' ? 'wood' : 'stone';
    return land.surface(x, z);
  }
  player.onLand = p => handlers.step && handlers.step(groundAt(p.root.position.x, p.root.position.z));
  let wasIn;

  // A ring where the floor was tapped.
  const mark = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), new THREE.MeshBasicMaterial({ color: '#F1F7FB', transparent: true, depthWrite: false }));
  mark.rotation.x = -Math.PI / 2;
  mark.visible = false;
  scene.add(mark);
  let markT = 0;

  // ---------------------------------------------------------------- camera
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 220);
  const view = { w: 1, h: 1, top: 0, bottom: 0 };
  const cam = { target: new THREE.Vector3(0, 0.6, 0.2), dist: 14, focus: null };
  const goal = { target: cam.target.clone(), dist: cam.dist };
  const boxOf = r => new THREE.Box3(new THREE.Vector3(r.bounds[0] - 0.4, open ? 0 : -0.6, r.bounds[1] - 0.3), new THREE.Vector3(r.bounds[2] + 0.4, r.spec.wallH, r.bounds[3] + (open ? 0.6 : 0.9)));
  const freeAspect = () => view.w / Math.max(80, view.h - view.top - view.bottom);
  const T = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  // Points the camera so that the box fills the free part of the screen (between the top bar and the panel).
  function frameBox(b, pad, out) {
    const corners = [];
    for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
    const target = b.getCenter(new THREE.Vector3());
    let dist = 12;
    const aspect = freeAspect();
    const fwd = DIR.clone().negate(), right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
    for (let it = 0; it < 6; it++) {
      const eye = target.clone().addScaledVector(DIR, dist);
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (const c of corners) {
        const v = c.clone().sub(eye), z = v.dot(fwd);
        const x = v.dot(right) / (z * T * aspect), y = v.dot(up) / (z * T);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const sx = (maxX - minX) / 2, sy = (maxY - minY) / 2, need = Math.max(sx, sy) / (1 - pad);
      target.addScaledVector(right, (maxX + minX) / 2 * dist * T * aspect).addScaledVector(up, (maxY + minY) / 2 * dist * T);
      dist *= need;
    }
    out.target.copy(target);
    out.dist = dist;
  }

  function applyCamera() {
    const freeH = Math.max(80, view.h - view.top - view.bottom), centre = view.top + freeH / 2, dy = view.h / 2 - centre;
    const fullH = view.h + 2 * Math.abs(dy), scale = fullH / freeH;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(T * scale));
    camera.aspect = view.w / fullH;
    camera.setViewOffset(view.w, fullH, 0, dy > 0 ? 2 * dy : 0, view.w, view.h);
    camera.position.copy(cam.target).addScaledVector(DIR, cam.dist);
    camera.lookAt(cam.target);
    camera.updateProjectionMatrix();
  }
  // The view offset makes the free area's centre the image centre, so framing uses the free area's height.
  // fov is widened by the same factor, which keeps the free area at the base FOV.

  // The room someone is standing in (in an open world), or null when outside.
  function roomAt(x, z) {
    for (const r of rooms) if (r.outer && x > r.outer[0] && x < r.outer[2] && z > r.outer[1] && z < r.outer[3]) return r;
    return null;
  }

  function reframe(now) {
    if (cam.focus) {
      const b = new THREE.Box3();
      for (const p of cam.focus) {
        const q = p.root.position;
        b.expandByPoint(new THREE.Vector3(q.x - 0.55, 0, q.z - 0.45));
        b.expandByPoint(new THREE.Vector3(q.x + 0.55, 1.45, q.z + 0.45));
      }
      frameBox(b, 0.12, goal);
      goal.dist = Math.max(goal.dist, 6.5);
    } else if (!open) frameBox(boxOf(room), 0.02, goal);
    else {
      const p = player.root.position, inRoom = roomAt(p.x, p.z) || areaOf(p.x, p.z);
      if (inRoom && !inRoom.spec.follow) frameBox(boxOf(inRoom), 0.03, goal);
      else {
        // Outside, and in a room too big to show whole, the camera follows the player; in a room it keeps to
        // the room rather than showing the dark round it.
        const [vw, vh] = (inRoom && inRoom.spec.view) || [FOLLOW_W, FOLLOW_H];
        goal.target.set(p.x, 0.5, p.z);
        goal.dist = Math.max(vw / (2 * T * freeAspect()), vh / (2 * T));
        if (inRoom) {
          const b = inRoom.bounds, half = T * freeAspect() * goal.dist;
          const keep = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
          goal.target.x = keep(p.x, b[0] + half - 0.6, b[2] - half + 0.6);
          goal.target.z = keep(p.z, b[1] + 2.6, b[3] - 1.2);
        }
      }
    }
    if (now) { cam.target.copy(goal.target); cam.dist = goal.dist; }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    view.w = Math.max(1, r.width); view.h = Math.max(1, r.height);
    renderer.setSize(view.w, view.h, false);
    reframe(!started);
  }

  // ---------------------------------------------------------------- input
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  // talk(id), walk(id), keys(), step(ground) when the player's foot lands, room(spec, was) when they go in or out.
  const handlers = { talk: null, walk: null };
  let roam = false;

  function ground(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const pt = new THREE.Vector3();
    return ray.ray.intersectPlane(floor, pt) ? pt : null;
  }

  // A quick tap walks there (or talks to the person tapped); pressing and holding keeps walking towards the finger.
  const HOLD_MS = 260;
  let down = null, hold = null;
  canvas.addEventListener('pointerdown', e => {
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
  });
  canvas.addEventListener('pointermove', e => { if (down && e.pointerId === down.id) { down.cx = e.clientX; down.cy = e.clientY; } });
  const release = e => {
    if (!down || e.pointerId !== down.id) return;
    const d = down, wasHold = !!hold;
    down = null; hold = null;
    player.steering = false;
    if (wasHold || !roam || e.type === 'pointercancel') return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(people).filter(p => p !== player && p.root.visible).map(p => p.hit));
    if (hits.length) { handlers.talk && handlers.talk(hits[0].object.userData.person.id); return; }
    const pt = ground(e.clientX, e.clientY);
    if (pt) walkTo(player, pt.x, pt.z, null, true);
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  function othersOf(p) { return Object.values(people).filter(o => o !== p).map(o => ({ x: o.root.position.x, z: o.root.position.z, r: o.radius })).concat(land ? land.colliders() : []); }

  // Keyboard: W A S D or the arrow keys walk the player (up the screen is away from the camera); E, Space or Enter
  // talks to the nearest person within reach.
  const KEYS = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  const held = new Set();
  const typing = e => e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
  let usedKeys = false;
  function nearest(reach = 1.8) {
    const a = player.root.position;
    let best = null, bd = reach;
    for (const o of Object.values(people)) {
      if (o === player || !o.root.visible) continue;
      const d = Math.hypot(o.root.position.x - a.x, o.root.position.z - a.z);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  window.addEventListener('keydown', e => {
    if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (KEYS[e.code]) {
      held.add(e.code);
      if (!usedKeys) { usedKeys = true; handlers.keys && handlers.keys(); }
      if (roam) e.preventDefault();
    } else if (roam && (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter')) {
      const o = nearest();
      if (o) { e.preventDefault(); held.clear(); handlers.talk && handlers.talk(o.id); }
    }
  });
  window.addEventListener('keyup', e => held.delete(e.code));
  window.addEventListener('blur', () => held.clear());

  // Moves the player by the keys held or towards a held finger, sliding along things instead of stopping dead.
  function steer(dt) {
    let x = 0, z = 0;
    if (roam) for (const c of held) { x += KEYS[c][0]; z += KEYS[c][1]; }
    if (roam && down && !held.size && performance.now() - down.t > HOLD_MS && Math.hypot((down.cx || down.x) - down.x, (down.cy || down.y) - down.y) < 400) {
      const pt = ground(down.cx || down.x, down.cy || down.y);
      if (pt) {
        hold = pt;
        const dx = pt.x - player.root.position.x, dz = pt.z - player.root.position.z;
        if (Math.hypot(dx, dz) > 0.35) { x = dx; z = dz; }
      }
    }
    const l = Math.hypot(x, z);
    player.steering = l > 0;
    if (!l) return;
    if (player.state === 'sit') standUp(player);
    player.path = null;
    player.onArrive = null;
    x /= l; z /= l;
    const pos = player.root.position, step = player.speed * dt, others = othersOf(player), n = navAt(pos.x, pos.z);
    // Someone standing in a blocked spot (just up from a chair) may always step out of it.
    const ok = (nx, nz) => n.canMove(pos.x, pos.z, nx, nz, others) || (!n.isFree(pos.x, pos.z, others) && n.isFree(nx, nz, others));
    const nx = pos.x + x * step, nz = pos.z + z * step;
    if (ok(nx, nz)) { pos.x = nx; pos.z = nz; }
    else if (Math.abs(x) > 0.2 && ok(nx, pos.z)) pos.x = nx;
    else if (Math.abs(z) > 0.2 && ok(pos.x, nz)) pos.z = nz;
    player.yawTo = Math.atan2(x, z);
  }

  function walkTo(p, x, z, done, showMark) {
    if (p.state === 'sit') standUp(p);
    const route = navAt(p.root.position.x, p.root.position.z).path(p.root.position.x, p.root.position.z, x, z, othersOf(p));
    if (showMark) {
      mark.position.set(x, 0.012, z);
      mark.visible = true; markT = 0;
    }
    if (!route || !route.length) {
      // An unreachable target is not an arrival: scripted NPCs must not slide through a wall afterwards.
      const at = p.root.position;
      if (Math.hypot(x - at.x, z - at.z) < 0.3) done && done();
      return false;
    }
    p.path = route;
    p.onArrive = done || null;
    handlers.walk && handlers.walk(p.id);
    return true;
  }

  function face(p, x, z) { p.yawTo = Math.atan2(x - p.root.position.x, z - p.root.position.z); }

  // Walks a person to the free spot nearest to another person, at talking distance, and turns them to each other.
  function approach(p, other, done) {
    const a = p.root.position, b = other.root.position, nav = navAt(b.x, b.z);
    const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz) || 1;
    // Stand where they are talked to from, or beside them (left or right, the nearer first) so the camera sees both
    // faces, else anywhere round them.
    let best = other.talkAt && nav.isFree(other.talkAt.x, other.talkAt.z) ? other.talkAt : null;
    const sides = [Math.PI / 2, -Math.PI / 2].sort((u, v) => Math.abs(Math.sin(u) - Math.sign(dx)) - Math.abs(Math.sin(v) - Math.sign(dx)));
    const tries = sides.concat(Array.from({ length: 16 }, (_, i) => Math.atan2(dx, dz) + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 8));
    for (const ang of best ? [] : tries) {
      const x = b.x + Math.sin(ang) * 1.05, z = b.z + Math.cos(ang) * 1.05 + (Math.abs(Math.sin(ang)) > 0.9 ? 0.2 : 0);
      if (nav.isFree(x, z, othersOf(p).filter(o => o.x !== b.x || o.z !== b.z))) { best = { x, z }; break; }
    }
    best = best || { x: b.x + dx / d, z: b.z + dz / d };
    // Already standing there: just turn to each other.
    if (Math.hypot(best.x - a.x, best.z - a.z) < 0.3) { face(p, b.x, b.z); face(other, a.x, a.z); done && later(0.25, done); return; }
    walkTo(p, best.x, best.z, () => { face(p, b.x, b.z); face(other, p.root.position.x, p.root.position.z); done && later(0.2, done); });
  }

  function sit(p, seatId, done) {
    const s = seats[seatId], nav = s && navAt(s.x, s.z);
    if (!s) { done && done(); return; }
    // Step up to the chair from whichever side is free: its front, back or sides (a chair at a table has the table in front).
    const c = Math.cos(s.ry), sn = Math.sin(s.ry);
    const side = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([lx, lz]) => ({ x: s.x + (lx * c + lz * sn) * 0.78, z: s.z + (-lx * sn + lz * c) * 0.78 }))
      .find(q => nav.isFree(q.x, q.z, othersOf(p))) || s.front;
    walkTo(p, side.x, side.z, () => {
      p.yawTo = s.ry;
      later(0.25, () => {
        p.state = 'sit';
        p.seatId = seatId;
        p.seatAt = Object.assign({}, s, { front: side });
        slide(p, s.x, s.z, 0.35, done);
      });
    });
  }
  function standUp(p) {
    if (p.state !== 'sit') return;
    p.state = 'idle';
    const s = p.seatAt;
    if (s) { p.root.position.x = s.front.x; p.root.position.z = s.front.z; }
  }
  const slides = [];
  function slide(p, x, z, secs, done) { slides.push({ p, fx: p.root.position.x, fz: p.root.position.z, x, z, t: 0, secs, done }); }

  // Through a door into a room elsewhere, or out of it: the player is put on the other side (walking on in the
  // same direction if a key is held), and the camera cuts there.
  function through() {
    const pp = player.root.position, area = areaOf(pp.x, pp.z);
    let to = null;
    if (!area) { const r = portalRooms.find(r => within(r.portal.zone, pp.x, pp.z)); if (r) to = { ...r.portal.in, yaw: Math.PI }; }
    else if (within(area.portal.exit, pp.x, pp.z)) to = { ...area.portal.out, yaw: 0 };
    if (!to) return;
    player.path = null;
    player.onArrive = null;
    pp.x = to.x; pp.z = to.z;
    player.yaw = player.yawTo = to.yaw;
    reframe(true);
    if (canvas.animate) canvas.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    handlers.through && handlers.through(areaOf(pp.x, pp.z));
  }

  // A stroller picks somewhere new to walk to after a pause. They stop where they are while the player is close
  // (so they can be tapped), while the game holds them (a conversation), or while the camera is on them.
  function stroll(p, dt) {
    const at = p.root.position, pp = player.root.position;
    const near = Math.hypot(pp.x - at.x, pp.z - at.z) < 2.4;
    const busy = p.hold || p.talking || p.state === 'sit' || (cam.focus && cam.focus.includes(p));
    if (busy || near) {
      if (p.strolling) { p.path = null; p.onArrive = null; p.strolling = false; }
      p.wanderWait = Math.max(p.wanderWait, 1.5 + Math.random() * 2);
      return;
    }
    if (p.path || (p.wanderWait -= dt) > 0) return;
    const w = p.wander, n = navAt(at.x, at.z), others = othersOf(p);
    for (let i = 0; i < 10; i++) {
      let x, z;
      if (w.spots) [x, z] = w.spots[Math.floor(Math.random() * w.spots.length)];
      else { x = w.area[0] + Math.random() * (w.area[2] - w.area[0]); z = w.area[1] + Math.random() * (w.area[3] - w.area[1]); }
      if (Math.hypot(x - at.x, z - at.z) < 0.8 || navAt(x, z) !== n || !n.isFree(x, z, others)) continue;
      if (walkTo(p, x, z, () => { p.strolling = false; p.wanderWait = 2.5 + Math.random() * 5; p.yawTo = Math.random() * Math.PI * 2; })) { p.strolling = true; return; }
    }
    p.wanderWait = 2;
  }

  // ---------------------------------------------------------------- loop
  // Waits are counted in game time, so the scene can also be stepped without drawing (advance, for tests).
  const timers = [];
  function later(secs, fn) { timers.push({ secs, fn }); }

  function update(dt) {
    if (open) { const r = roomAt(player.root.position.x, player.root.position.z); player.speed = r && !r.spec.follow ? SPEED_IN : SPEED_OUT; }
    steer(dt);
    through();
    for (const p of Object.values(people)) {
      if (p.path?.length && p.blocked >= 0.4) {
        const end = p.path[p.path.length - 1], at = p.root.position;
        const route = navAt(at.x, at.z).path(at.x, at.z, end.x, end.z, othersOf(p));
        if (route?.length) p.path = route;
        p.blocked = 0;
      }
      if (p.wander) stroll(p, dt);
      // People standing about turn to look at the player when they come near.
      if (p !== player && !p.path && p.state !== 'sit' && !p.talking) {
        const dx = player.root.position.x - p.root.position.x, dz = player.root.position.z - p.root.position.z, d = Math.hypot(dx, dz);
        if (d < 2.6 && d > 0.1) p.yawTo = Math.atan2(dx, dz);
        else if (p.home && d > 4 && Math.hypot(p.root.position.x - p.home.x, p.root.position.z - p.home.z) < 0.5) p.yawTo = p.home.yaw;
      }
      animate(p, dt);
    }
    for (let i = slides.length - 1; i >= 0; i--) {
      const s = slides[i];
      s.t = Math.min(1, s.t + dt / s.secs);
      const e = s.t * s.t * (3 - 2 * s.t);
      s.p.root.position.x = s.fx + (s.x - s.fx) * e;
      s.p.root.position.z = s.fz + (s.z - s.fz) * e;
      if (s.t >= 1) { slides.splice(i, 1); s.done && s.done(); }
    }
    for (let i = timers.length - 1; i >= 0; i--) if ((timers[i].secs -= dt) <= 0) timers.splice(i, 1)[0].fn();
    if (mark.visible) {
      markT += dt;
      const k = 1 - markT / 0.6;
      mark.material.opacity = Math.max(0, k);
      mark.scale.setScalar(1 + markT * 0.8);
      if (k <= 0) mark.visible = false;
    }
    if (land) {
      land.update(dt);
      land.reveal(player.root.position.x, player.root.position.z, dt);
    }
    // Only the side of a door the player is on is drawn: the world outside, or the room through the door.
    const pp = player.root.position, area = areaOf(pp.x, pp.z);
    if (land) land.group.visible = !area;
    for (const r of rooms) r.group.visible = r.portal ? r === area : !area;
    for (const p of Object.values(people)) p.root.visible = areaOf(p.root.position.x, p.root.position.z) === area;
    scene.background.copy(area ? (area.sky || (area.sky = new THREE.Color(area.spec.sky || '#131F24'))) : sky);
    // A cottage opens up while the player (or a conversation) is inside it: the roof lifts away, the front wall drops.
    const inside = open ? roomAt(pp.x, pp.z) : room;
    const here = inside || (cam.focus && roomAt(cam.focus[0].root.position.x, cam.focus[0].root.position.z));
    // Going in or out of a door (not when a saved game first puts the player somewhere).
    if (wasIn !== undefined && inside !== wasIn) handlers.room && handlers.room(inside && inside.spec, wasIn && wasIn.spec);
    wasIn = inside;
    for (const r of rooms) {
      if (!r.front) continue;
      r.lift += ((r === here || (r.portal && r === area) ? 1 : 0) - r.lift) * Math.min(1, dt * 6);
      if (r.roof) {
        r.roof.position.y = r.lift * 3.5;
        r.roof.visible = r.lift < 0.97;
      }
      r.front.scale.y = 1 - r.lift * 0.86;
    }
    reframe(false);
    const k = 1 - Math.exp(-dt * (open && !cam.focus ? 5 : 3.2));
    cam.target.lerp(goal.target, k);
    cam.dist += (goal.dist - cam.dist) * k;
    // Shadows follow the camera, snapped to whole shadow-map texels so they don't shimmer as it moves.
    const texel = (2 * SHADOW) / sun.shadow.mapSize.x, sx = Math.round(cam.target.x / texel) * texel, sz = Math.round(cam.target.z / texel) * texel;
    sun.target.position.set(sx, 0, sz);
    sun.position.set(sx + SUN.x, SUN.y, sz + SUN.z);
  }

  let last = performance.now(), started = false, onFrame = null;
  function frame(now) {
    update(Math.min(0.05, (now - last) / 1000));
    last = now;
    applyCamera();
    renderer.render(scene, camera);
    onFrame && onFrame();
    requestAnimationFrame(frame);
  }

  // Where a point above a person is on screen (for the speech marker), in CSS pixels.
  const tmp = new THREE.Vector3();
  function screenOf(p, y = 1.95) {
    tmp.set(p.root.position.x, y, p.root.position.z).project(camera);
    return { x: (tmp.x + 1) / 2 * view.w, y: (1 - tmp.y) / 2 * view.h, behind: tmp.z > 1 };
  }

  window.addEventListener('resize', resize);
  resize();
  started = true;
  requestAnimationFrame(t => { last = t; frame(t); });

  return {
    people, player, room, rooms, seats, camera, renderer, view, land,
    animals: land ? land.flock : [],
    on(name, fn) { handlers[name] = fn; },
    set onFrame(fn) { onFrame = fn; },
    // Stops someone strolling about (a conversation with them), or lets them go on.
    hold(id, on) { const p = people[id]; if (!p) return; p.hold = !!on; if (on && p.strolling) { p.path = null; p.onArrive = null; p.strolling = false; } },
    setRoam(v) { roam = v; if (!v) { held.clear(); hold = null; player.steering = false; } },
    // The person close enough to talk to with E (or null), and whether the keyboard has been used.
    nearest, get usingKeys() { return usedKeys; },
    // Where to point to lead the player to someone on the other side of a door: that door ({ x, y, z }), or null
    // when they're on the same side.
    guide(p) {
      const q = player.root.position, a = areaOf(q.x, q.z), b = areaOf(p.root.position.x, p.root.position.z);
      if (a === b) return null;
      if (a) return { x: a.portal.in.x, y: 1.4, z: a.portal.exit[1] - 0.3 };
      const z = b.portal.zone;
      return { x: (z[0] + z[2]) / 2, y: 2.4, z: z[3] + 0.2 };
    },
    screenAt(pt) {
      tmp.set(pt.x, pt.y, pt.z).project(camera);
      return { x: (tmp.x + 1) / 2 * view.w, y: (1 - tmp.y) / 2 * view.h, behind: tmp.z > 1 };
    },
    // Where the player is, for the sound: the room they're in (its spec, or null outside) and metres to the sea.
    where() {
      const q = player.root.position, r = open ? roomAt(q.x, q.z) : room;
      return { room: r ? r.spec : null, sea: land && !areaOf(q.x, q.z) ? land.shore(q.x, q.z) : 99, ground: groundAt(q.x, q.z) };
    },
    walkTo, approach, face, sit, standUp, screenOf, later,
    // Puts a person straight somewhere (when a saved game is loaded): { x, z, yaw, seat }.
    place(id, v) {
      const p = people[id];
      if (!p) return;
      p.path = null;
      p.yaw = p.yawTo = v.yaw || 0;
      const s = v.seat && seats[v.seat];
      if (s) {
        p.state = 'sit'; p.seat = 1; p.seatId = v.seat;
        p.seatAt = Object.assign({}, s, { front: { x: s.x + Math.sin(s.ry + Math.PI) * 0.78, z: s.z + Math.cos(s.ry + Math.PI) * 0.78 } });
        p.root.position.set(s.x, 0, s.z);
      } else {
        p.state = 'idle'; p.seat = 0;
        // A saved spot that is now inside something (the world has changed since): home, or the nearest free spot.
        let { x, z } = v;
        const n = navAt(x, z);
        if (!n.isFree(x, z)) ({ x, z } = id !== 'player' && p.home ? p.home : n.spot(x, z) || p.home);
        p.root.position.set(x, 0, z);
      }
    },
    // Runs the scene forward without drawing it (for tests in slow headless browsers).
    advance(secs) { for (let t = 0; t < secs; t += 1 / 30) update(1 / 30); },
    // The panels tell the world how much of the screen they cover.
    setInsets(top, bottom) { view.top = top; view.bottom = bottom; reframe(false); },
    focus(list) { cam.focus = list && list.length ? list : null; reframe(false); },
    // Jumps the camera to where it should be (after a saved game puts the player somewhere else).
    snap() { reframe(true); },
    resize,
  };
}

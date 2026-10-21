// The 3D world: one diorama room seen from a fixed camera, high and tilted down like Overcooked, the people in it,
// tap to walk and tap a person to talk. The camera never turns; it only frames the whole room, or moves in on two
// people while they talk, always inside the part of the screen the panels leave free.
import * as THREE from '../../lib/three.module.min.js';
import { buildRoom } from './room.js';
import { person, animate } from './people.js';
import { makeNav } from './nav.js';

const PITCH = THREE.MathUtils.degToRad(40), FOV = 30;
const DIR = new THREE.Vector3(0, Math.sin(PITCH), Math.cos(PITCH)); // from the target towards the camera

export function createWorld(canvas, pack) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(pack.room.sky || '#1B2A30');

  const hemi = new THREE.HemisphereLight('#FFF1DC', '#5E544B', 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFF4E2', 2.1);
  sun.position.set(-3.5, 8, 5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 1, far: 22 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.025;
  scene.add(sun, sun.target);

  const room = buildRoom(pack.room);
  scene.add(room.group);
  const nav = makeNav(room.bounds, room.blocks, 0.3);

  const people = {};
  for (const [id, spec] of Object.entries(pack.people)) {
    const p = person(spec.look);
    p.id = id;
    p.name = spec.name;
    const at = spec.at || [0, 0];
    p.root.position.set(at[0], 0, at[1]);
    p.yaw = p.yawTo = spec.face || 0;
    scene.add(p.root);
    people[id] = p;
  }
  const player = people.player;

  // A ring where the floor was tapped.
  const mark = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), new THREE.MeshBasicMaterial({ color: '#F1F7FB', transparent: true, depthWrite: false }));
  mark.rotation.x = -Math.PI / 2;
  mark.visible = false;
  scene.add(mark);
  let markT = 0;

  // ---------------------------------------------------------------- camera
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  const view = { w: 1, h: 1, top: 0, bottom: 0 };
  const cam = { target: new THREE.Vector3(0, 0.6, 0.2), dist: 14, focus: null };
  const goal = { target: cam.target.clone(), dist: cam.dist };
  const roomBox = new THREE.Box3(new THREE.Vector3(room.bounds[0] - 0.4, -0.6, room.bounds[1] - 0.3), new THREE.Vector3(room.bounds[2] + 0.4, pack.room.wallH, room.bounds[3] + 0.9));

  // Points the camera so that the box fills the free part of the screen (between the top bar and the panel).
  function frameBox(b, pad, out) {
    const corners = [];
    for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
    const target = b.getCenter(new THREE.Vector3());
    let dist = 12;
    const freeH = Math.max(80, view.h - view.top - view.bottom), aspect = view.w / freeH;
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const fwd = DIR.clone().negate(), right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
    for (let it = 0; it < 6; it++) {
      const eye = target.clone().addScaledVector(DIR, dist);
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (const c of corners) {
        const v = c.clone().sub(eye), z = v.dot(fwd);
        const x = v.dot(right) / (z * t * aspect), y = v.dot(up) / (z * t);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const sx = (maxX - minX) / 2, sy = (maxY - minY) / 2, need = Math.max(sx, sy) / (1 - pad);
      target.addScaledVector(right, (maxX + minX) / 2 * dist * t * aspect).addScaledVector(up, (maxY + minY) / 2 * dist * t);
      dist *= need;
    }
    out.target.copy(target);
    out.dist = dist;
  }

  function applyCamera() {
    const freeH = Math.max(80, view.h - view.top - view.bottom), centre = view.top + freeH / 2, dy = view.h / 2 - centre;
    const fullH = view.h + 2 * Math.abs(dy), scale = fullH / freeH;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * scale));
    camera.aspect = view.w / fullH;
    camera.setViewOffset(view.w, fullH, 0, dy > 0 ? 2 * dy : 0, view.w, view.h);
    camera.position.copy(cam.target).addScaledVector(DIR, cam.dist);
    camera.lookAt(cam.target);
    camera.updateProjectionMatrix();
  }
  // The view offset makes the free area's centre the image centre, so framing uses the free area's height.
  // fov is widened by the same factor, which keeps the free area at the base FOV.

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
    } else frameBox(roomBox, 0.02, goal);
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
  let down = null;
  const handlers = { talk: null, walk: null };
  let roam = false;

  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12 || performance.now() - down.t > 600) return;
    down = null;
    if (!roam) return;
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(people).filter(p => p !== player).map(p => p.hit));
    if (hits.length) { handlers.talk && handlers.talk(hits[0].object.userData.person.id); return; }
    const pt = new THREE.Vector3();
    if (ray.ray.intersectPlane(floor, pt)) walkTo(player, pt.x, pt.z, null, true);
  });

  function othersOf(p) { return Object.values(people).filter(o => o !== p).map(o => ({ x: o.root.position.x, z: o.root.position.z, r: o.radius })); }

  function walkTo(p, x, z, done, showMark) {
    if (p.state === 'sit') standUp(p);
    const route = nav.path(p.root.position.x, p.root.position.z, x, z, othersOf(p));
    if (showMark) {
      mark.position.set(x, 0.012, z);
      mark.visible = true; markT = 0;
    }
    if (!route || !route.length) { done && done(); return false; }
    p.path = route;
    p.onArrive = done || null;
    handlers.walk && handlers.walk(p.id);
    return true;
  }

  function face(p, x, z) { p.yawTo = Math.atan2(x - p.root.position.x, z - p.root.position.z); }

  // Walks a person to the free spot nearest to another person, at talking distance, and turns them to each other.
  function approach(p, other, done) {
    const a = p.root.position, b = other.root.position;
    const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz) || 1;
    // Stand beside them (left or right, the nearer first) so the camera sees both faces, else anywhere round them.
    let best = null;
    const sides = [Math.PI / 2, -Math.PI / 2].sort((u, v) => Math.abs(Math.sin(u) - Math.sign(dx)) - Math.abs(Math.sin(v) - Math.sign(dx)));
    const tries = sides.concat(Array.from({ length: 16 }, (_, i) => Math.atan2(dx, dz) + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 8));
    for (const ang of tries) {
      const x = b.x + Math.sin(ang) * 1.05, z = b.z + Math.cos(ang) * 1.05 + (Math.abs(Math.sin(ang)) > 0.9 ? 0.2 : 0);
      if (nav.isFree(x, z, othersOf(p).filter(o => o.x !== b.x || o.z !== b.z))) { best = { x, z }; break; }
    }
    best = best || { x: b.x + dx / d, z: b.z + dz / d };
    // Already standing there: just turn to each other.
    if (Math.hypot(best.x - a.x, best.z - a.z) < 0.3) { face(p, b.x, b.z); face(other, a.x, a.z); done && later(0.25, done); return; }
    walkTo(p, best.x, best.z, () => { face(p, b.x, b.z); face(other, p.root.position.x, p.root.position.z); done && later(0.2, done); });
  }

  function sit(p, seatId, done) {
    const s = room.seats[seatId];
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

  // ---------------------------------------------------------------- loop
  // Waits are counted in game time, so the scene can also be stepped without drawing (advance, for tests).
  const timers = [];
  function later(secs, fn) { timers.push({ secs, fn }); }

  function update(dt) {
    for (const p of Object.values(people)) animate(p, dt);
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
    if (cam.focus) reframe(false);
    const k = 1 - Math.exp(-dt * 3.2);
    cam.target.lerp(goal.target, k);
    cam.dist += (goal.dist - cam.dist) * k;
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

  // Where a person's head is on screen (for the speech marker), in CSS pixels.
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
    people, player, room, camera, renderer,
    on(name, fn) { handlers[name] = fn; },
    set onFrame(fn) { onFrame = fn; },
    setRoam(v) { roam = v; },
    walkTo, approach, face, sit, standUp, screenOf, later,
    // Puts a person straight somewhere (when a saved game is loaded): { x, z, yaw, seat }.
    place(id, v) {
      const p = people[id];
      if (!p) return;
      p.path = null;
      p.yaw = p.yawTo = v.yaw || 0;
      const s = v.seat && room.seats[v.seat];
      if (s) {
        p.state = 'sit'; p.seat = 1; p.seatId = v.seat;
        p.seatAt = Object.assign({}, s, { front: { x: s.x + Math.sin(s.ry + Math.PI) * 0.78, z: s.z + Math.cos(s.ry + Math.PI) * 0.78 } });
        p.root.position.set(s.x, 0, s.z);
      } else {
        p.state = 'idle'; p.seat = 0;
        p.root.position.set(v.x, 0, v.z);
      }
    },
    // Runs the scene forward without drawing it (for tests in slow headless browsers).
    advance(secs) { for (let t = 0; t < secs; t += 1 / 30) update(1 / 30); },
    // The panels tell the world how much of the screen they cover.
    setInsets(top, bottom) { view.top = top; view.bottom = bottom; reframe(false); },
    focus(list) { cam.focus = list && list.length ? list : null; reframe(false); },
    resize,
  };
}

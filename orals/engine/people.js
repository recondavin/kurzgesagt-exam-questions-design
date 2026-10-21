// Round, chunky people in the style of Overcooked: an egg-shaped body, a big round head sunk into it, floating
// hands and two little feet. Walking is a small bouncing waddle (hop, squash on landing, a tilt from foot to foot).
// Each part is one smooth-shaded mesh with its outline, moved by hand each frame, so there are no model files.
// A content pack describes a person with colours and a few styles:
//   { skin, hair, hairStyle: 'bun' | 'short' | 'long', top, bottom, shoes, apron, collar, glasses, bag, hood, height }
import * as THREE from '../../lib/three.module.min.js';
import { paint, place, mesh, INK } from './kit.js';

const BASE_H = 1.3, BODY_Y = 0.45, HEAD_Y = 1.0, HEAD_R = 0.26;

function shade(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }
// A smooth ball (or part of one), centred on at.
function orb(r, color, at, part) {
  const p = part || {};
  const g = new THREE.SphereGeometry(r, 20, 14, p.phi0 || 0, p.phi || Math.PI * 2, p.th0 || 0, p.th || Math.PI);
  return place(paint(g, color, true), at);
}
function band(r, tube, color, at) { return place(paint(new THREE.TorusGeometry(r, tube, 8, 20), color, true), at); }

const LINE = 0.014, FRONT = Math.PI / 2;

export function person(spec) {
  const s = Object.assign({ skin: '#E7B896', hair: '#4A3527', hairStyle: 'short', top: '#2F4A6B', bottom: '#56677A', shoes: '#3B3632' }, spec);
  const k = (s.height || BASE_H) / BASE_H;
  const root = new THREE.Group(), rig = new THREE.Group(), feetG = new THREE.Group();
  root.add(rig, feetG);
  feetG.scale.setScalar(k);

  // Body: an egg in the top's colour, the lower part in the trousers' colour.
  const bp = [
    orb(1, s.top, { y: BODY_Y, sx: 0.3, sy: 0.35, sz: 0.27 }),
    orb(1.025, s.bottom, { y: BODY_Y, sx: 0.3, sy: 0.35, sz: 0.27 }, { th0: Math.PI * 0.62, th: Math.PI * 0.38 }),
  ];
  if (s.apron) bp.push(orb(1.04, s.apron, { y: BODY_Y, sx: 0.3, sy: 0.35, sz: 0.27 }, { phi0: FRONT - 0.85, phi: 1.7, th0: Math.PI * 0.38, th: Math.PI * 0.5 }));
  if (s.collar) bp.push(band(0.13, 0.04, s.collar, { y: 0.77, rx: Math.PI / 2, sz: 1, sy: 0.85 }));
  if (s.hood) bp.push(orb(1, s.top, { y: 0.76, z: -0.15, sx: 0.2, sy: 0.09, sz: 0.11 }));
  if (s.bag) bp.push(orb(1, s.bag, { y: 0.5, z: -0.25, sx: 0.21, sy: 0.24, sz: 0.11 }));
  const bodyMesh = mesh(bp, { line: LINE });
  rig.add(bodyMesh);

  // Head: a big ball sunk into the body, hair tipped back to show the forehead, small dark eyes.
  const head = new THREE.Group();
  head.position.y = HEAD_Y;
  const R = HEAD_R, ez = Math.sqrt(R * R - 0.085 * 0.085) - 0.014;
  const hp = [
    orb(R, s.skin, {}),
    orb(R * 1.07, s.hair, { rx: s.hairStyle === 'bun' ? -0.55 : -0.8 }, { th: s.hairStyle === 'long' ? 1.8 : s.hairStyle === 'bun' ? 1.5 : 1.42 }),
    orb(0.05, s.skin, { x: -R + 0.01, y: -0.02, sz: 0.7 }),
    orb(0.05, s.skin, { x: R - 0.01, y: -0.02, sz: 0.7 }),
  ];
  if (s.hairStyle === 'bun') hp.push(orb(0.1, s.hair, { y: 0.2, z: -0.17 }));
  if (s.hairStyle === 'long') hp.push(orb(1, s.hair, { y: -0.12, z: -0.12, sx: 0.27, sy: 0.22, sz: 0.16 }));
  // The face has no outline of its own: small dark eyes, brows, a nose and any glasses.
  // Brows sit just proud of the head (buried ones show only their inner ends and look cross), arched kindly.
  const brow = s.glasses ? 0.085 : 0.07, bz = Math.sqrt(R * R - 0.088 * 0.088 - brow * brow) - 0.012, fp = [
    orb(0.027, INK, { x: -0.085, y: 0.0, z: ez, sy: 1.45 }),
    orb(0.027, INK, { x: 0.085, y: 0.0, z: ez, sy: 1.45 }),
    orb(1, shade(s.hair, 0.75), { x: -0.088, y: brow, z: bz, sx: 0.036, sy: 0.011, sz: 0.02, rz: 0.14 }),
    orb(1, shade(s.hair, 0.75), { x: 0.088, y: brow, z: bz, sx: 0.036, sy: 0.011, sz: 0.02, rz: -0.14 }),
    orb(0.04, shade(s.skin, 0.93), { y: -0.06, z: R - 0.01 }),
  ];
  if (s.glasses) {
    for (const x of [-0.088, 0.088]) fp.push(band(0.052, 0.0065, s.glasses, { x, y: 0.0, z: ez + 0.012 }));
    fp.push(orb(1, s.glasses, { y: 0.005, z: ez + 0.03, sx: 0.036, sy: 0.006, sz: 0.006 }));
  }
  head.add(mesh(fp, { line: 0, cast: false }));
  head.add(mesh(hp, { line: LINE }));
  rig.add(head);

  // Floating hands.
  const hands = [-1, 1].map(side => {
    const h = mesh([orb(0.075, s.skin, {})], { line: LINE });
    h.position.set(side * 0.34, 0.42, 0.04);
    rig.add(h);
    return h;
  });

  // Little feet that stay on the ground while the body bounces.
  const feet = [-1, 1].map(side => {
    const f = mesh([orb(1, s.shoes, { sx: 0.085, sy: 0.055, sz: 0.12 })], { line: LINE });
    f.position.set(side * 0.12, 0.05, 0.03);
    feetG.add(f);
    return f;
  });

  // An invisible box that makes the person easy to tap.
  const hit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.6, 0.95), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.8;
  root.add(hit);

  const p = {
    root, rig, hit, head, hands, feet, k,
    radius: 0.3,
    speed: 1.5,
    state: 'idle', talking: false, phase: 0, t: Math.random() * 10,
    seat: 0, yaw: 0, yawTo: 0, gesture: 0, walk: 0,
    path: null, onArrive: null,
  };
  hit.userData.person = p;
  return p;
}

const lerp = (a, b, t) => a + (b - a) * t;
function turn(a, b, max) {
  const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + Math.max(-max, Math.min(max, d));
}

// Moves one person along their path and poses them for this frame. (The player can also be steered with the
// keyboard: the world moves them and sets p.steering.)
export function animate(p, dt) {
  p.t += dt;
  const onPath = !!(p.path && p.path.length), walking = onPath || !!p.steering;
  if (onPath) {
    const pos = p.root.position, next = p.path[0];
    const dx = next.x - pos.x, dz = next.z - pos.z, d = Math.hypot(dx, dz), step = p.speed * dt;
    p.yawTo = Math.atan2(dx, dz);
    if (d <= step) { pos.x = next.x; pos.z = next.z; p.path.shift(); }
    else { pos.x += dx / d * step; pos.z += dz / d * step; }
    if (!p.path.length) { p.path = null; const f = p.onArrive; p.onArrive = null; f && f(); }
  }
  p.yaw = turn(p.yaw, p.yawTo, dt * (walking ? 10 : 6));
  p.root.rotation.y = p.yaw;

  p.walk = lerp(p.walk, walking ? 1 : 0, Math.min(1, dt * 12));
  p.seat = lerp(p.seat, p.state === 'sit' ? 1 : 0, Math.min(1, dt * 8));
  // One hop per half turn of the phase. Keep hopping until the current hop lands, so it never stops in mid-air.
  const u0 = (p.phase % Math.PI) / Math.PI;
  if (walking || (u0 > 0.04 && u0 < 0.96)) p.phase += dt * 9.5;
  const u = (p.phase % Math.PI) / Math.PI, side = Math.floor(p.phase / Math.PI) % 2 ? 1 : -1;
  const wk = Math.max(p.walk, walking ? 0 : (u > 0.04 && u < 0.96 ? 0.6 : 0)) * (1 - p.seat), seat = p.seat, k = p.k;

  // The bounce: each step is a little jump. The body rises on an arc, stretches at the top, squashes as it
  // lands and takes off, rocks a little to one side then the other, and leans into the walk.
  const air = 4 * u * (1 - u);
  const contact = Math.max(0, 1 - Math.min(u, 1 - u) / 0.18);
  const breathe = Math.sin(p.t * 2.2) * 0.012 * (1 - wk);
  const sq = 1 - 0.16 * contact * wk + 0.07 * air * wk + breathe;
  p.rig.scale.set(k / Math.sqrt(sq), k * sq, k / Math.sqrt(sq));
  p.rig.position.y = air * 0.17 * wk + seat * 0.36 * k;
  p.rig.rotation.z = side * Math.sin(Math.PI * u) * 0.07 * wk;
  p.rig.rotation.x = 0.12 * wk;

  // The feet tuck up with each hop, one a little ahead of the other.
  p.feet.forEach((f, i) => {
    const sg = i ? -1 : 1;
    f.position.z = 0.03 + sg * side * 0.06 * wk + seat * 0.26;
    f.position.y = 0.05 + air * 0.09 * wk + seat * 0.3;
  });

  // Talking: the head bobs and turns, and one hand comes up now and then. Hopping, the hands lift and spread.
  const want = p.talking && Math.sin(p.t * 1.9) > 0.1 ? 1 : 0;
  p.gesture = lerp(p.gesture, want, Math.min(1, dt * 5));
  p.hands.forEach((h, i) => {
    const sg = i ? 1 : -1, g = i ? p.gesture : 0;
    h.position.x = sg * (0.34 + air * 0.05 * wk);
    h.position.y = 0.42 + air * 0.1 * wk - contact * 0.03 * wk + Math.sin(p.t * 2.2 + i) * 0.012 + g * 0.2 + seat * 0.08;
    h.position.z = 0.04 + sg * side * 0.05 * wk + g * 0.1 + seat * 0.12;
  });
  const nod = p.talking ? Math.sin(p.t * 8) * 0.05 : 0;
  p.head.rotation.x = lerp(p.head.rotation.x, nod + (p.lookDown || 0) - contact * 0.08 * wk, Math.min(1, dt * 10));
  p.head.rotation.z = lerp(p.head.rotation.z, p.talking ? Math.sin(p.t * 1.6) * 0.08 : Math.sin(p.t * 0.7) * 0.04, Math.min(1, dt * 3));
  p.head.position.y = HEAD_Y - contact * 0.03 * wk;
}

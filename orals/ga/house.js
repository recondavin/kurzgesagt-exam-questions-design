// The house in Conamara where the student stays: the kitchen, with the bean an tí, Máirín.
// Room layout and the people's looks for the engine (orals/engine/room.js, people.js). The room is nearly square
// so it fills a phone held upright.
export const ROOM = {
  id: 'teach',
  w: 6.2, d: 6.0, wallH: 2.5,
  wall: '#ECE5D5', band: '#5E7F6E',
  sky: '#1B2A30',
  props: [
    { type: 'chimney', wall: 'back', at: -1.85, w: 1.6 },
    { type: 'range', x: -1.85, z: -2.56 },
    { type: 'turf', x: -0.7, z: -2.66 },
    { type: 'clock', wall: 'back', at: -1.85, y: 2.0 },
    { type: 'window', wall: 'back', at: 0.45, w: 0.85, curtain: '#B85C45' },
    { type: 'sink', wall: 'back', at: 0.45, w: 1.2 },
    { type: 'cross', wall: 'back', at: 1.35, y: 1.75 },
    { type: 'dresser', wall: 'back', at: 2.3 },
    { type: 'door', wall: 'left', at: 1.7 },
    { type: 'coats', wall: 'left', at: 0.45 },
    { type: 'armchair', x: -2.4, z: -1.15, ry: 1.0 },
    { type: 'rug', x: -1.5, z: -1.45, w: 1.6, d: 1.0 },
    { type: 'window', wall: 'right', at: -0.9, curtain: '#B85C45', plant: false },
    { type: 'picture', wall: 'right', at: 0.9, y: 1.55 },
    { type: 'settle', x: 2.85, z: 2.0, ry: -Math.PI / 2, w: 1.3 },
    { type: 'table', x: 0.55, z: 0.55 },
    { type: 'tea', x: 0.55, z: 0.55, solid: false },
    { type: 'chair', id: 'cathaoir-n1', x: 0.15, z: -0.2, ry: 0 },
    { type: 'chair', id: 'cathaoir-n2', x: 0.95, z: -0.2, ry: 0 },
    { type: 'chair', id: 'cathaoir-s1', x: 0.15, z: 1.3, ry: Math.PI },
    { type: 'chair', id: 'cathaoir-s2', x: 0.95, z: 1.3, ry: Math.PI },
  ],
};

export const PEOPLE = {
  player: {
    name: 'Tusa',
    at: [-2.45, 1.7], face: Math.PI / 2,
    look: { skin: '#E7B896', hair: '#4A3527', hairStyle: 'short', top: '#2F4A6B', bottom: '#5B6878', shoes: '#ECE8DF', bag: '#C9952F', hood: true, height: 1.3 },
  },
  mairin: {
    name: 'Máirín',
    role: 'bean an tí',
    at: [-0.85, -1.75], face: 0.3,
    look: { skin: '#EBC0A0', hair: '#BDB8B1', hairStyle: 'bun', top: '#3F5E4B', collar: '#E9E2D2', bottom: '#4A4440', shoes: '#5A3F2E', apron: '#DCD3BE', glasses: '#3A3532', height: 1.24 },
  },
};

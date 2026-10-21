// Máirín's house in Conamara: a whitewashed, thatched cottage with a red half-door, standing in the village
// (orals/ga/village.js). Inside is the kitchen, with Máirín. Room layout and the people's looks for the engine
// (orals/engine/room.js, people.js). The kitchen is nearly square so it fills a phone held upright.
export const ROOM = {
  id: 'teach',
  w: 6.2, d: 6.0, wallH: 2.5,
  wall: '#ECE5D5', band: '#5E7F6E',
  sky: '#1B2A30',
  // The outside of the cottage: the door and windows in the front wall, the thatch and the chimneys.
  house: { door: { at: -2.2, w: 1.1 }, windows: [0.4, 2.2], chimneys: [-1.85, 2.75], doorColor: '#8E3A2C' },
  props: [
    { type: 'chimney', wall: 'back', at: -1.85, w: 1.6 },
    { type: 'range', x: -1.85, z: -2.56 },
    { type: 'turf', x: -0.7, z: -2.66 },
    { type: 'clock', wall: 'back', at: -1.85, y: 2.0 },
    { type: 'window', wall: 'back', at: 0.45, w: 0.85, curtain: '#B85C45' },
    { type: 'sink', wall: 'back', at: 0.45, w: 1.2 },
    { type: 'cross', wall: 'back', at: 1.35, y: 1.75 },
    { type: 'dresser', wall: 'back', at: 2.3 },
    { type: 'window', wall: 'left', at: 1.4, curtain: '#B85C45', plant: false },
    { type: 'coats', wall: 'left', at: -0.2 },
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

// You arrive on the bus at the west end of the village. Máirín has the oral practice and Peadar runs the shop,
// where you buy something in Irish; the rest say hello (their lines are in story.ink, talk_<id>).
export const PEOPLE = {
  player: {
    name: 'Tusa',
    at: [-20.8, 6.4], face: Math.PI / 2,
    look: { skin: '#E7B896', hair: '#4A3527', hairStyle: 'short', top: '#2F4A6B', bottom: '#5B6878', shoes: '#ECE8DF', bag: '#C9952F', hood: true, height: 1.3 },
  },
  mairin: {
    name: 'Máirín',
    role: 'bean an tí',
    at: [-0.85, -1.75], face: 0.3,
    look: { skin: '#EBC0A0', hair: '#BDB8B1', hairStyle: 'bun', top: '#3F5E4B', collar: '#E9E2D2', bottom: '#4A4440', shoes: '#5A3F2E', apron: '#DCD3BE', glasses: '#3A3532', height: 1.24 },
  },
  aoife: {
    name: 'Aoife',
    role: 'dalta',
    at: [-12, 8.0], face: -Math.PI / 2,
    look: { skin: '#F0C7A8', hair: '#7A3B22', hairStyle: 'long', top: '#B85C45', bottom: '#3C4F6B', shoes: '#ECE8DF', bag: '#4E6E64', height: 1.27 },
  },
  cormac: {
    name: 'Cormac',
    role: 'dalta',
    at: [12, 19], face: 0,
    look: { skin: '#D9A07E', hair: '#2B2420', hairStyle: 'short', top: '#4E7A52', bottom: '#5B6878', shoes: '#3B3632', hood: true, height: 1.32 },
  },
  // At the till in the shop (orals/ga/shop.js, a room standing at 0, 70); customers stand at talkAt, across it.
  peadar: {
    name: 'Peadar',
    role: 'fear an tsiopa',
    at: [4.3, 72.85], face: 0, talkAt: [4.2, 74.7],
    look: { skin: '#E4B08E', hair: '#8E8A84', hairStyle: 'short', top: '#6B4E3A', bottom: '#3B3632', shoes: '#2F2B28', apron: '#ECE5D5', height: 1.3 },
  },
  brid: {
    name: 'Bríd',
    role: 'an múinteoir',
    at: [16.6, 3.6], face: 0,
    look: { skin: '#EDC3A2', hair: '#3A2A20', hairStyle: 'bun', top: '#7C4A6B', collar: '#E9E2D2', bottom: '#3B3632', shoes: '#2F2B28', glasses: '#3A3532', height: 1.27 },
  },
};

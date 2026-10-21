// The village shop (SIOPA), a room you can walk into, with Peadar behind the counter (where he stands, and where
// a customer stands across the counter from him, are in house.js). It stands where the shop is in the village
// (orals/ga/village.js); the conversation is talk_peadar in story.ink, its questions in questions.js.
export const SHOP = {
  id: 'siopa',
  at: [-15, 0.5],
  w: 5.5, d: 4.5, wallH: 3.0,
  wall: '#E5C46A', band: '#8E6B2E', floor: 'boards',
  house: { roof: 'slate', door: { at: 0, w: 1.1 }, windows: [-1.75, 1.75], chimneys: [2.1], doorColor: '#2F5D8A', sign: 'SIOPA' },
  props: [
    { type: 'shopShelf', wall: 'back', at: -1.8, seed: 3 },
    { type: 'shopShelf', wall: 'back', at: -0.05, seed: 9 },
    { type: 'shopShelf', wall: 'left', at: -0.85, w: 1.3, seed: 17 },
    { type: 'counter', x: 1.45, z: -0.6, w: 2.3 },
    { type: 'fridge', wall: 'right', at: 1.3 },
    { type: 'crates', wall: 'left', at: 0.9, w: 1.2 },
    { type: 'newsstand', x: -1.9, z: 1.7 },
  ],
};


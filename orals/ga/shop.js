// The village shop (SIOPA), a room you can walk into, with Peadar behind the counter (where he stands, and where
// a customer stands across the counter from him, are in house.js). It stands where the shop is in the village
// (orals/ga/village.js); the conversation is talk_peadar in story.ink, its questions in questions.js.
export const SHOP = {
  id: 'siopa',
  at: [-15, 0.5],
  w: 5.5, d: 4.5, wallH: 3.0,
  wall: '#E5C46A', band: '#8E6B2E', floor: 'boards',
  // A bell over the door rings as you come in and go out.
  bell: true,
  house: { roof: 'slate', door: { at: 0, w: 1.1 }, windows: [-1.75, 1.75], chimneys: [2.1], doorColor: '#2F5D8A', sign: 'SIOPA' },
  // The food is Kenney's Food Kit, restyled (orals/models/food.js); each shelf's rows go from the floor up.
  props: [
    { type: 'shopShelf', wall: 'back', at: -1.8, seed: 3, rows: [['flour'], ['beans', 'tomatoes', 'tuna'], ['jam', 'honey', 'ketchup'], ['bread', 'sodabread']] },
    { type: 'shopShelf', wall: 'back', at: -0.05, seed: 9, rows: [['cola'], ['water'], ['tomatoes', 'beans'], ['bread']] },
    { type: 'shopShelf', wall: 'left', at: -0.85, w: 1.3, seed: 17, rows: [['flour'], ['honey', 'jam'], ['tuna', 'beans'], ['sodabread']] },
    { type: 'counter', x: 1.45, z: -0.6, w: 2.3 },
    { type: 'fridge', wall: 'right', at: 1.3, rows: [['milk'], ['juice', 'water'], ['fizzy', 'lemonade']] },
    { type: 'crates', wall: 'left', at: 0.9, w: 1.2, produce: ['apple', 'orange', 'banana', 'cabbage'] },
    { type: 'newsstand', x: -1.9, z: 1.7 },
  ],
};


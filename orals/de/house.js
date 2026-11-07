// The Wagners' house in Seeburg: white walls and a red roof by the market square (orals/de/village.js). Inside is
// the kitchen, where Sabine, your host mother, asks the conversation questions. Room layout and the people's looks
// for the engine (orals/engine/room.js, people.js).
export const ROOM = {
  id: 'wagner',
  w: 6.2, d: 6.0, wallH: 2.5,
  wall: '#F2EEE6', band: '#B9895A',
  floor: 'boards',
  sky: '#1B2A30',
  house: { door: { at: -2.2, w: 1.1 }, windows: [0.4, 2.2], chimneys: [2.75], roof: 'slate', roofColor: '#A9442F', doorColor: '#6B3A2E' },
  props: [
    { type: 'range', x: -1.85, z: -2.56 },
    { type: 'clock', wall: 'back', at: -1.85, y: 2.0 },
    { type: 'window', wall: 'back', at: 0.45, w: 0.85, curtain: '#5E7F6E' },
    { type: 'sink', wall: 'back', at: 0.45, w: 1.2 },
    { type: 'dresser', wall: 'back', at: 2.3, color: '#E9E2CF' },
    { type: 'window', wall: 'left', at: 1.4, curtain: '#5E7F6E', plant: true },
    { type: 'coats', wall: 'left', at: -0.2 },
    { type: 'armchair', x: -2.4, z: -1.15, ry: 1.0 },
    { type: 'rug', x: -1.5, z: -1.45, w: 1.6, d: 1.0 },
    { type: 'window', wall: 'right', at: -0.9, curtain: '#5E7F6E', plant: true },
    { type: 'picture', wall: 'right', at: 0.9, y: 1.55 },
    { type: 'table', x: 0.55, z: 0.55 },
    { type: 'tea', x: 0.55, z: 0.55, solid: false },
    { type: 'chair', id: 'stuhl-1', x: 0.15, z: -0.2, ry: 0 },
    { type: 'chair', id: 'stuhl-2', x: 0.95, z: -0.2, ry: 0 },
    { type: 'chair', id: 'stuhl-3', x: 0.15, z: 1.3, ry: Math.PI },
    { type: 'chair', id: 'stuhl-4', x: 0.95, z: 1.3, ry: Math.PI },
  ],
};

// You arrive by train on the west side of the island. Sabine has the conversation practice; Frau Huber (the bakery
// stall), Herr Schulz (the station) and Dr. Klein (the doctor's) are the role-plays; the rest say hello (their lines
// are in story.ink, talk_<id>). wander: places a person strolls between, or an area they stroll round.
export const PEOPLE = {
  player: {
    name: 'Du',
    at: [-30.4, 2.5], face: Math.PI / 2,
    look: { skin: '#E7B896', hair: '#4A3527', hairStyle: 'short', top: '#2F4A6B', bottom: '#5B6878', shoes: '#ECE8DF', bag: '#C9952F', hood: true, height: 1.3 },
  },
  sabine: {
    name: 'Sabine', role: 'Gastmutter',
    at: [-0.85, -1.75], face: 0.3,
    look: { skin: '#EBC0A0', hair: '#8A5A3B', hairStyle: 'bun', top: '#3C6E9C', collar: '#E9E2D2', bottom: '#4A4440', shoes: '#5A3F2E', glasses: '#3A3532', height: 1.26 },
  },
  lukas: {
    name: 'Lukas', role: 'Austauschpartner',
    at: [50, -16], face: 0,
    wander: { area: [45, -24, 65, -13], speed: 1.4 },
    look: { skin: '#EDC3A2', hair: '#C9A36B', hairStyle: 'short', top: '#C8423A', bottom: '#2B2420', shoes: '#ECE8DF', height: 1.34 },
  },
  mia: {
    name: 'Mia', role: 'Schülerin',
    at: [54.5, 3.5], face: 0,
    wander: { spots: [[54.5, 3.4], [53.5, 3.3], [55.6, 3.3]], speed: 0.8 },
    look: { skin: '#F0C7A8', hair: '#2B2420', hairStyle: 'long', top: '#B07CC6', bottom: '#3C4F6B', shoes: '#ECE8DF', bag: '#4E6E64', height: 1.27 },
  },
  brandt: {
    name: 'Herr Brandt', role: 'Englischlehrer',
    at: [16.6, 3.6], face: 0,
    wander: { spots: [[16.6, 3.6], [12, 3.6], [19.5, 3.8], [15, 4.2]], speed: 0.9 },
    look: { skin: '#E0AA86', hair: '#5A5550', hairStyle: 'short', top: '#4E6E64', collar: '#E9E2D2', bottom: '#3B3632', shoes: '#2F2B28', glasses: '#3A3532', height: 1.33 },
  },
  // The bakery stall on the market square; customers stand in front of it.
  huber: {
    name: 'Frau Huber', role: 'Bäckerin',
    at: [-9.8, 2.3], face: 0, talkAt: [-9.8, 4.2],
    look: { skin: '#EBC0A0', hair: '#BDB8B1', hairStyle: 'bun', top: '#C8423A', bottom: '#4A4440', shoes: '#5A3F2E', apron: '#F4F1EA', height: 1.24 },
  },
  // The ticket window at the station.
  schulz: {
    name: 'Herr Schulz', role: 'Bahnangestellter',
    at: [-24.2, 1.5], face: 0, talkAt: [-24.2, 3.3],
    look: { skin: '#E4B08E', hair: '#3A2A20', hairStyle: 'short', top: '#2F5D8A', collar: '#E9E2D2', bottom: '#2B2420', shoes: '#2F2B28', height: 1.31 },
  },
  // At the door of the doctor's.
  klein: {
    name: 'Dr. Klein', role: 'Ärztin',
    at: [27, 2.9], face: 0, talkAt: [28.3, 3.6],
    look: { skin: '#EDC3A2', hair: '#3A2A20', hairStyle: 'bun', top: '#F4F1EA', collar: '#7FB3C8', bottom: '#3B4146', shoes: '#2F2B28', glasses: '#3A3532', height: 1.28 },
  },
  maier: {
    name: 'Herr Maier', role: 'Fischer',
    at: [12, 19], face: 0,
    wander: { spots: [[12, 19], [12, 15], [12, 20.5]], speed: 0.8 },
    look: { skin: '#D9A07E', hair: '#D9D5CB', hairStyle: 'short', top: '#E3B83A', bottom: '#2F3438', shoes: '#2A2622', height: 1.3 },
  },
  // At the till in the supermarket (orals/de/shop.js, a room standing at 0, 70).
  jonas: {
    name: 'Jonas', role: 'Kassierer',
    at: [4.3, 72.85], face: 0, talkAt: [4.2, 74.7],
    look: { skin: '#E4B08E', hair: '#7A3B22', hairStyle: 'short', top: '#4C9A5B', bottom: '#3B3632', shoes: '#2F2B28', apron: '#ECE5D5', height: 1.32 },
  },
};

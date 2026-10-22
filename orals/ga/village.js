// The village in Conamara, for the engine's open world (orals/engine/land.js): an island of fields in the sea with
// a boreen running east to west, dry-stone walls, the shop, the college, the céilí hall, a few cottages, a pier
// with a currach, a bus stop where you arrive, sheep, and mountains across the bay. Further east: the church, a
// café, the post office, the library, a playground, the GAA pitch with its clubhouse, and a lighthouse on the
// headland. Signs and fingerposts are in Irish. Máirín's house is at 0, 0 (orals/ga/house.js), a room you can walk
// into; the shop at -15, 0.5 leads into a supermarket (orals/ga/shop.js); +x is east, +z is south (towards the sea
// and the camera). All in metres.
export const VILLAGE = {
  sky: '#5A8F98',
  bounds: [-38, -33, 77, 26],
  // The grass, then the sand round it.
  coast: [[-33, -30], [70, -30], [73, -20], [73.5, -6], [72, 5], [68, 10.5], [66, 14], [65.5, 19.5], [62, 21.5], [58.5, 19], [58, 13.5], [52, 11.4], [44, 11.8], [38, 10.8],
    [29, 10.5], [20, 11.2], [14, 10.4], [10, 11], [3, 12], [-5, 11.4], [-13, 12.2], [-21, 11.4], [-29, 10.6], [-34, 6], [-35, -8], [-35, -22]],
  beach: [[-34.5, -31.5], [71.5, -31.5], [75, -20], [75.5, -6], [74, 6], [70, 12.5], [68, 15.5], [67.5, 21], [63, 23.5], [57, 21], [56.2, 15], [51, 13.8], [44, 14.6], [38, 13.4],
    [31, 13.6], [21, 14.6], [15, 13.4], [9, 14.8], [2, 15.6], [-6, 15], [-14, 16], [-22, 14.8], [-30, 13.8], [-36, 7.5], [-37, -8], [-36.8, -22]],
  // Out on the pier you can walk over the water.
  walk: [[10.8, 12, 13.2, 22]],
  patches: [
    { pts: [[-30, -27], [-10.5, -27], [-10.5, -6], [-30, -6]], color: '#86A562' },
    { pts: [[18, -27], [32, -27], [32, -16], [18, -16]], color: '#7A6A4C' },
    { pts: [[-4, -27], [12, -27], [12, -16], [-4, -16]], color: '#728F52' },
  ],
  roads: [
    { pts: [[-33, 7.2], [69, 7.2]], w: 3.2 },
    { pts: [[-8, 6], [-8, -17.6]], w: 2.6 },
  ],
  paths: [
    { pts: [[-2.2, 3.7], [-2.2, 5.8]] }, { pts: [[-15, 3.3], [-15, 5.8]] }, { pts: [[15, 2.8], [15, 5.8]] },
    { pts: [[27, 2.6], [27, 5.8]] }, { pts: [[-26, 2.6], [-26, 5.8]] }, { pts: [[12, 8.6], [12, 12.8]], w: 1.6 },
    { pts: [[6, -8.6], [6, -5.2], [3.8, -3.8]] },
    // The lane up past the playground to the pitch, the doors along the street, and the way to the lighthouse.
    { pts: [[41, 5.8], [41, -11.5]], w: 1.4 }, { pts: [[47.6, 2.3], [47.6, 5.8]] }, { pts: [[54.5, 3], [54.5, 5.8]] },
    { pts: [[61.5, 3], [61.5, 5.8]] }, { pts: [[68, 2.5], [68, 5.8]] }, { pts: [[62, 8.6], [62, 13.5], [62.3, 15.6]], w: 1.4 },
  ],
  // Dry-stone walls along the boreen (with gaps for gates and paths) and round the fields.
  walls: [
    [-33, 5, -27.2, 5], [-24.8, 5, -23, 5], [-18.6, 5, -16.2, 5], [-13.8, 5, -9.6, 5], [-6.4, 5, -3.4, 5], [-1, 5, 13.8, 5], [16.2, 5, 25.8, 5],
    [28.2, 5, 40, 5], [42, 5, 46.6, 5], [48.6, 5, 53.5, 5], [55.5, 5, 60.5, 5], [62.5, 5, 67, 5], [69, 5, 71, 5],
    [-33, 9.4, 10.8, 9.4], [13.2, 9.4, 60.8, 9.4], [63.2, 9.4, 67, 9.4],
    [-9.6, 5, -9.6, -6.5], [-9.6, -8.6, -9.6, -17], [-6.4, 5, -6.4, -17],
    [-31, -28, -9.6, -28], [-31, -28, -31, -5], [-31, -5, -20, -5], [-17, -5, -9.6, -5],
    [17, -28, 33, -28], [17, -28, 17, -6], [17, -6, 24, -6], [27, -6, 33, -6], [33, -28, 33, -6],
  ],
  buildings: [
    { x: 15, z: -0.5, w: 10, d: 6, h: 3, wall: '#EDE8DC', roof: 'slate', doorColor: '#2F5D8A', windows: [-3.5, -1.8, 1.8, 3.5], chimneys: [-4, 4], sign: 'COLÁISTE', signW: 4 },
    { x: -8, z: -21, w: 9, d: 6, h: 3, wall: '#D8D0BC', roof: 'slate', doorColor: '#3E5A3A', windows: [-3, 3], sign: 'HALLA' },
    { x: 6, z: -11, w: 6, d: 4.5, roof: 'thatch', doorColor: '#2F5D8A', windows: [-1.6, 1.6], chimneys: [-2.3] },
    { x: 27, z: 0, w: 5.5, d: 4.5, wall: '#F0E9DA', roof: 'thatch', doorColor: '#3E5A3A', windows: [-1.5, 1.5], chimneys: [2] },
    { x: -26, z: 0, w: 5.5, d: 4.5, roof: 'slate', doorColor: '#2F5D8A', windows: [-1.5, 1.5], chimneys: [-2] },
    // The shop: small outside, a supermarket inside (its door leads into the room in orals/ga/shop.js).
    { x: -15, z: 0.5, w: 5.5, d: 4.5, h: 3, wall: '#E5C46A', roof: 'slate', doorColor: '#2F5D8A', windows: [-1.75, 1.75], chimneys: [2.1], sign: 'SIOPA', enter: 'siopa' },
    // Along the street to the east: the church (its tower at the front corner), the café, the post office and the library.
    { x: 47, z: -2, w: 6, d: 8, h: 3.4, wall: '#E3DED2', roof: 'slate', door: 0.6, doorColor: '#6B3A2E', windows: [2.2], tower: { at: -2, h: 4 } },
    { x: 54.5, z: 0.5, w: 6, d: 4.5, h: 3, wall: '#C9675A', roof: 'slate', doorColor: '#F4F1EA', windows: [-1.9, 1.9], chimneys: [-2.2], sign: 'CAIFÉ', signW: 2.2 },
    { x: 61.5, z: 0.5, w: 5, d: 4.5, h: 3, wall: '#5E8C6A', roof: 'slate', doorColor: '#E3B83A', windows: [1.6], sign: 'OIFIG AN PHOIST', signW: 3.4 },
    { x: 68, z: 0, w: 5, d: 4.5, h: 3, wall: '#E9E2CF', roof: 'slate', doorColor: '#3C6E9C', windows: [-1.6, 1.6], sign: 'LEABHARLANN', signW: 3.4 },
    // The GAA club's clubhouse beside the pitch.
    { x: 37.5, z: -15, w: 6, d: 4, h: 2.8, wall: '#EDE8DC', roof: 'slate', doorColor: '#2F7D4F', windows: [-1.8, 1.8], sign: 'CLG', signW: 1.6, signColors: { bg: '#2F7D4F', ink: '#F4F1EA' } },
  ],
  pitches: [{ x: 55, z: -18.5, w: 22, d: 13 }],
  fences: [[43, -25.8, 67, -25.8], [43, -11.2, 52, -11.2], [58, -11.2, 67, -11.2], [43, -25.8, 43, -20], [43, -17, 43, -11.2], [67, -25.8, 67, -11.2]],
  lighthouses: [{ x: 62.5, z: 18 }],
  playgrounds: [{ x: 36.8, z: -6.5 }],
  boards: [{ x: 37, z: -3.4, text: 'CLÓS SÚGARTHA', w: 2.4 }],
  fingerposts: [
    { x: 39.4, z: 5.85, signs: [{ text: 'AN PHÁIRC', dir: 0 }, { text: 'AN TEACH SOLAIS', dir: 1 }, { text: 'AN CHÉIBH', dir: -1 }] },
    { x: -5.6, z: 5.85, signs: [{ text: 'AN HALLA', dir: 0 }, { text: 'AN COLÁISTE', dir: 1 }, { text: 'AN SIOPA', dir: -1 }] },
  ],
  benches: [[50, -10.4, Math.PI], [60, -10.4, Math.PI], [64.5, 12.6, 0], [33, 3.6, 0]],
  lamps: [[30, 5.6], [44, 5.6], [51, 5.6], [58, 5.6], [65, 5.6], [-12, 5.6], [2, 5.6], [20, 5.6]],
  tables: [[52.3, 3.9], [56.7, 3.9]],
  flowers: [[50.6, 3.6, 8], [58.4, 3.6, 8], [44.6, 3.3, 6], [-17, 3.4, 6]],
  turf: [[5.2, 1.0]],
  rocks: [[-20, -15, 0.6], [-25, -20, 0.5], [-14, -24, 0.4], [22, -12, 0.7], [28, -20, 0.5], [30, -10, 0.35], [3, -20, 0.8], [10, -25, 0.6], [-3, -14, 0.5],
    [-31.5, 11.6, 0.6], [31.5, 11.2, 0.5], [20, 10.5, 0.4], [-18, 10.8, 0.45], [6, 10.6, 0.35], [-33, -12, 0.7], [-2, 13.5, 0.5], [25, 13, 0.6],
    [66, 22, 0.6], [70, 14, 0.5], [56, 15, 0.4], [47, 13.5, 0.5], [74, -12, 0.6], [73, -25, 0.5], [69.5, 17.5, 0.45]],
  bushes: [[-4.5, -6, 0.6], [8.5, -4, 0.5], [11, -14, 0.6], [-12, -12, 0.5], [24, -8, 0.5], [-22, 3, 0.5], [20.5, 3, 0.45], [-5, 2, 0.45], [31, -2, 0.5],
    [71, -14, 0.5], [42.5, -27.5, 0.5], [35.5, 2.5, 0.45], [58, -8, 0.5]],
  trees: [[9.5, -6.5, 1, -0.3], [-11.5, 1, 1.1, -0.25], [22, -3, 0.9, -0.3], [-31, -1, 1, -0.2], [71, -25, 1.1, -0.3], [45, -28.5, 1, -0.2], [69, -8, 0.9, -0.3], [39.5, 1.5, 0.9, -0.25]],
  sheep: [{ field: [-29, -26, -11, -7], n: 5 }, { field: [18.5, -26, 32, -8], n: 3 }],
  pier: { x: 12, z0: 12.6, z1: 22, w: 2.4 },
  boats: [{ x: 14.4, z: 18.5, ry: 0.05 }, { x: 53.5, z: 17, ry: 0.5 }],
  busStop: { x: -20.8, z: 4.3 },
  mountains: [[-40, -62, 14, 16], [-15, -68, 18, 22, '#728891'], [12, -64, 16, 18, '#677A82'], [38, -60, 13, 14], [-64, -40, 12, 12, '#728891'], [62, -44, 12, 12, '#677A82'],
    [70, -64, 15, 19, '#677A82'], [98, -40, 13, 15], [100, -10, 10, 10, '#728891']],
};

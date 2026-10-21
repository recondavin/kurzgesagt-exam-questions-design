// The village in Conamara, for the engine's open world (orals/engine/land.js): an island of fields in the sea with
// a boreen running east to west, dry-stone walls, the shop, the college, the céilí hall, a few cottages, a pier
// with a currach, a bus stop where you arrive, sheep, and mountains across the bay. Máirín's house is at 0, 0
// (orals/ga/house.js), a room you can walk into; the shop at -15, 0.5 leads into a supermarket (orals/ga/shop.js); +x is east, +z is south (towards the sea and the camera). All in metres.
export const VILLAGE = {
  sky: '#5A8F98',
  bounds: [-38, -33, 38, 23],
  // The grass, then the sand round it.
  coast: [[-33, -30], [33, -30], [35, -20], [34.5, -5], [33, 6], [29, 10.5], [20, 11.2], [14, 10.4], [10, 11], [3, 12], [-5, 11.4], [-13, 12.2], [-21, 11.4], [-29, 10.6], [-34, 6], [-35, -8], [-35, -22]],
  beach: [[-34.5, -31.5], [34.5, -31.5], [36.8, -20], [36.3, -5], [35, 7.5], [31, 13.6], [21, 14.6], [15, 13.4], [9, 14.8], [2, 15.6], [-6, 15], [-14, 16], [-22, 14.8], [-30, 13.8], [-36, 7.5], [-37, -8], [-36.8, -22]],
  // Out on the pier you can walk over the water.
  walk: [[10.8, 12, 13.2, 22]],
  patches: [
    { pts: [[-30, -27], [-10.5, -27], [-10.5, -6], [-30, -6]], color: '#86A562' },
    { pts: [[18, -27], [32, -27], [32, -16], [18, -16]], color: '#7A6A4C' },
    { pts: [[-4, -27], [12, -27], [12, -16], [-4, -16]], color: '#728F52' },
  ],
  roads: [
    { pts: [[-33, 7.2], [33, 7.2]], w: 3.2 },
    { pts: [[-8, 6], [-8, -17.6]], w: 2.6 },
  ],
  paths: [
    { pts: [[-2.2, 3.7], [-2.2, 5.8]] }, { pts: [[-15, 3.3], [-15, 5.8]] }, { pts: [[15, 2.8], [15, 5.8]] },
    { pts: [[27, 2.6], [27, 5.8]] }, { pts: [[-26, 2.6], [-26, 5.8]] }, { pts: [[12, 8.6], [12, 12.8]], w: 1.6 },
    { pts: [[6, -8.6], [6, -5.2], [3.8, -3.8]] },
  ],
  // Dry-stone walls along the boreen (with gaps for gates and paths) and round the fields.
  walls: [
    [-33, 5, -27.2, 5], [-24.8, 5, -23, 5], [-18.6, 5, -16.2, 5], [-13.8, 5, -9.6, 5], [-6.4, 5, -3.4, 5], [-1, 5, 13.8, 5], [16.2, 5, 25.8, 5], [28.2, 5, 33, 5],
    [-33, 9.4, 10.8, 9.4], [13.2, 9.4, 31, 9.4],
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
  ],
  turf: [[5.2, 1.0]],
  rocks: [[-20, -15, 0.6], [-25, -20, 0.5], [-14, -24, 0.4], [22, -12, 0.7], [28, -20, 0.5], [30, -10, 0.35], [3, -20, 0.8], [10, -25, 0.6], [-3, -14, 0.5],
    [-31.5, 11.6, 0.6], [31.5, 11.2, 0.5], [20, 10.5, 0.4], [-18, 10.8, 0.45], [6, 10.6, 0.35], [-33, -12, 0.7], [34, -14, 0.6], [-2, 13.5, 0.5], [25, 13, 0.6]],
  bushes: [[-4.5, -6, 0.6], [8.5, -4, 0.5], [11, -14, 0.6], [-12, -12, 0.5], [24, -8, 0.5], [-22, 3, 0.5], [20.5, 3, 0.45], [-5, 2, 0.45], [31, -2, 0.5]],
  trees: [[9.5, -6.5, 1, -0.3], [-11.5, 1, 1.1, -0.25], [22, -3, 0.9, -0.3], [-31, -1, 1, -0.2]],
  sheep: [{ field: [-29, -26, -11, -7], n: 5 }, { field: [18.5, -26, 32, -8], n: 3 }],
  pier: { x: 12, z0: 12.6, z1: 22, w: 2.4 },
  boats: [{ x: 14.4, z: 18.5, ry: 0.05 }],
  busStop: { x: -20.8, z: 4.3 },
  mountains: [[-40, -62, 14, 16], [-15, -68, 18, 22, '#728891'], [12, -64, 16, 18, '#677A82'], [38, -60, 13, 14], [-64, -40, 12, 12, '#728891'], [62, -44, 12, 12, '#677A82']],
};

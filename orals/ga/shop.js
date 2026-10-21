// The village shop: small from outside (a yellow building with a SIOPA sign in orals/ga/village.js, `enter:
// 'siopa'`), a whole supermarket inside. Walking in its door puts you in this room, which stands out of sight
// (at 0, 70) and is much bigger than the building; walking out of its door puts you back on the street. Peadar is
// at the first till (where he and a customer stand is in house.js); the conversation is talk_peadar in
// story.ink, its questions in questions.js. The food is Kenney's Food Kit, restyled (orals/models/food.js), and
// packets; what each shelf holds is listed bottom shelf first (names in GOODS, orals/engine/props.js). The
// shelves face the door, since the camera always looks into the shop from the door's side.
// Signs over the aisles are in Irish, like the bilingual signs in Irish shops.
const SIGN = { bg: '#F4F1EA', ink: '#2F5D8A' };

export const SHOP = {
  id: 'siopa',
  at: [0, 70],
  w: 15, d: 11, wallH: 3.2,
  wall: '#EDE8DC', band: '#2F5D8A', floor: 'tiles',
  sky: '#18272D',
  // Too big to show whole on a phone: the camera follows you round it, showing this much (metres across, up).
  follow: true, view: [8.5, 9.5],
  // A bell over the door rings as you come in and go out.
  bell: true,
  house: { roof: 'none', door: { at: -5, w: 1.4 }, doorColor: '#2F5D8A' },
  props: [
    { type: 'mat', x: -5, z: 4.95, w: 1.5, d: 0.9 },
    { type: 'baskets', x: -6.7, z: 4.85 },
    { type: 'newsstand', x: 6.7, z: 4.7 },

    // Along the back wall: milk, drinks and the bread.
    { type: 'fridge', wall: 'back', at: -4.6, w: 3.4, rows: [['milk'], ['milk', 'juice'], ['juice', 'milk']] },
    { type: 'hangingSign', x: -4.6, z: -4.3, text: 'BAINNE', y: 2.75 },
    { type: 'fridge', wall: 'back', at: -0.7, w: 3.0, color: '#2F5D8A', rows: [['water'], ['cola', 'fizzy'], ['lemonade', 'fizzy']] },
    { type: 'hangingSign', x: -0.7, z: -4.3, text: 'DEOCHANNA', y: 2.75 },
    { type: 'shopShelf', wall: 'back', at: 2.4, w: 2.6, color: '#B9895A', rows: [['sodabread'], ['bread'], ['croissant', 'muffin'], ['donut', 'pie']] },
    { type: 'hangingSign', x: 2.4, z: -4.3, text: 'ARÁN', y: 2.75, w: 1.6 },
    { type: 'shopShelf', wall: 'back', at: 5.6, w: 2.6, color: '#B9895A', rows: [['rolls'], ['soap', 'bleach'], ['sugar', 'flour'], ['cake']] },

    // Fruit and vegetables down the left wall.
    { type: 'crates', wall: 'left', at: -3.6, w: 1.5, produce: ['apple', 'orange', 'banana', 'pear'] },
    { type: 'crates', wall: 'left', at: -2.0, w: 1.5, produce: ['tomato', 'pepper', 'broccoli', 'mushroom'] },
    { type: 'crates', wall: 'left', at: -0.4, w: 1.5, produce: ['cabbage', 'onion', 'lemon', 'apple'] },
    { type: 'hangingSign', x: -6.2, z: -1.2, text: 'TORTHAÍ AGUS GLASRAÍ', y: 2.3, w: 2.4 },

    // The aisles: two rows of low shelves across the shop, facing the door (and the camera), with a way through
    // the middle.
    { type: 'gondola', x: -3.2, z: -2.6, w: 4.4, seed: 2, sign: 'BRICFEASTA', front: [['oats', 'rice'], ['cereal', 'cornflakes'], ['tea', 'jam', 'honey']] },
    { type: 'gondola', x: 2.8, z: -2.6, w: 4.4, seed: 5, sign: 'PASTA AGUS RÍS', front: [['pasta', 'rice'], ['tomatoes', 'beans', 'tuna'], ['ketchup', 'oil']] },
    { type: 'gondola', x: -3.2, z: 0.2, w: 4.4, seed: 8, sign: 'MILSEÁIN', front: [['crisps', 'crisps2'], ['biscuits', 'sweets'], ['chocolate', 'sweets2']] },
    { type: 'gondola', x: 2.8, z: 0.2, w: 4.4, seed: 11, front: [['flour', 'sugar'], ['honey', 'jam'], ['cake']] },

    // Ice cream by the right wall.
    { type: 'freezer', wall: 'right', at: -1.2, w: 2.6, goods: ['icecream', 'lolly', 'icecream2', 'chocice'] },
    { type: 'hangingSign', x: 6.4, z: -1.2, text: 'BIA REOITE', y: 2.3, w: 1.8 },

    // The tills by the door: Peadar is at the first.
    { type: 'counter', x: 4.2, z: 3.6, w: 2.0 },
    { type: 'counter', x: 1.0, z: 3.6, w: 2.0 },
  ],
};

// The supermarket in Seeburg: small from outside (orals/de/village.js, `enter: 'supermarkt'`), a whole shop inside,
// standing out of sight at 0, 70. The same shop as the Irish game's (orals/ga/shop.js) with German signs over the
// aisles; Jonas is at the first till (orals/de/house.js).
const SIGN = { bg: '#F4F1EA', ink: '#2F5D8A' };

export const SHOP = {
  id: 'supermarkt',
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
    { type: 'hangingSign', x: -4.6, z: -4.3, text: 'MILCH', y: 2.75 },
    { type: 'fridge', wall: 'back', at: -0.7, w: 3.0, color: '#2F5D8A', rows: [['water'], ['cola', 'fizzy'], ['lemonade', 'fizzy']] },
    { type: 'hangingSign', x: -0.7, z: -4.3, text: 'GETRÄNKE', y: 2.75 },
    { type: 'shopShelf', wall: 'back', at: 2.4, w: 2.6, color: '#B9895A', rows: [['sodabread'], ['bread'], ['croissant', 'muffin'], ['donut', 'pie']] },
    { type: 'hangingSign', x: 2.4, z: -4.3, text: 'BROT', y: 2.75, w: 1.6 },
    { type: 'shopShelf', wall: 'back', at: 5.6, w: 2.6, color: '#B9895A', rows: [['rolls'], ['soap', 'bleach'], ['sugar', 'flour'], ['cake']] },

    // Fruit and vegetables down the left wall.
    { type: 'crates', wall: 'left', at: -3.6, w: 1.5, produce: ['apple', 'orange', 'banana', 'pear'] },
    { type: 'crates', wall: 'left', at: -2.0, w: 1.5, produce: ['tomato', 'pepper', 'broccoli', 'mushroom'] },
    { type: 'crates', wall: 'left', at: -0.4, w: 1.5, produce: ['cabbage', 'onion', 'lemon', 'apple'] },
    { type: 'hangingSign', x: -6.2, z: -1.2, text: 'OBST UND GEMÜSE', y: 2.3, w: 2.4 },

    // The aisles: two rows of low shelves across the shop, facing the door (and the camera), with a way through
    // the middle.
    { type: 'gondola', x: -3.2, z: -2.6, w: 4.4, seed: 2, sign: 'FRÜHSTÜCK', front: [['oats', 'rice'], ['cereal', 'cornflakes'], ['tea', 'jam', 'honey']] },
    { type: 'gondola', x: 2.8, z: -2.6, w: 4.4, seed: 5, sign: 'NUDELN UND REIS', front: [['pasta', 'rice'], ['tomatoes', 'beans', 'tuna'], ['ketchup', 'oil']] },
    { type: 'gondola', x: -3.2, z: 0.2, w: 4.4, seed: 8, sign: 'SÜSSIGKEITEN', front: [['crisps', 'crisps2'], ['biscuits', 'sweets'], ['chocolate', 'sweets2']] },
    { type: 'gondola', x: 2.8, z: 0.2, w: 4.4, seed: 11, front: [['flour', 'sugar'], ['honey', 'jam'], ['cake']] },

    // Ice cream by the right wall.
    { type: 'freezer', wall: 'right', at: -1.2, w: 2.6, goods: ['icecream', 'lolly', 'icecream2', 'chocice'] },
    { type: 'hangingSign', x: 6.4, z: -1.2, text: 'TIEFKÜHLKOST', y: 2.3, w: 1.8 },

    // The tills by the door: Peadar is at the first.
    { type: 'counter', x: 4.2, z: 3.6, w: 2.0 },
    { type: 'counter', x: 1.0, z: 3.6, w: 2.0 },
  ],
};

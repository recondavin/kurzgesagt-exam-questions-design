// The asset library for Make your own games (bio/bio-maker.js; the user: "build an asset library"). Flat drawings,
// navy outlines, no gradients or glows, in the site's colours:
//   players  ready-made characters (some from the course: a red blood cell, a neuron, a heart, lungs, a kidney)
//   parts    to design your own: body, eyes, mouth, something on top, an extra; any colour
//   rivals   who you play against: the examiner, or a virus, a bacterium, a mould, ...
//   places   where the game is: a classroom, an exam hall, inside a blood vessel, the lungs, space, a GAA pitch, ...
//   things   stickers to put in your world: a plant, a trophy, a microscope, DNA, ...
// Every picture is a string of SVG, built here; nothing is loaded. tools/bio/tests/maker.mjs draws each one.
(function () {
  'use strict';
  var INK = '#13294A', W = '#FFFFFF';
  var COLOURS = ['#1CB0F6', '#58CC02', '#FF4B4B', '#FF9600', '#CE82FF', '#FF86D0', '#FFC800', '#2BD4BD', '#8D6E63', '#5B6B8C'];
  var COLOUR_NAMES = ['Blue', 'Green', 'Red', 'Orange', 'Purple', 'Pink', 'Yellow', 'Teal', 'Brown', 'Slate'];
  function n(v) { return Math.round(v * 10) / 10; }
  // A darker or lighter flat tone of a colour (no gradients: one tone, filled flat).
  function tone(hex, k) {
    var c = parseInt(hex.slice(1), 16), r = c >> 16, g = (c >> 8) & 255, b = c & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1).toUpperCase();
  }
  function s(w) { return ' stroke="' + INK + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function line(d, w) { return '<path d="' + d + '" fill="none"' + s(w || 2.4) + '/>'; }

  // ======================================================================== faces
  // Eyes and mouths, centred on (0, y).
  var EYES = {
    dots: function (y) { return eye(-8, y, 5, 2.3) + eye(8, y, 5, 2.3); },
    big: function (y) { return eye(-9, y, 7.5, 3.6) + eye(9, y, 7.5, 3.6); },
    sleepy: function (y) {
      return ['-8', '8'].map(function (x) { x = +x; return '<path d="M' + (x - 5.5) + ' ' + y + 'A5.5 5.5 0 0 0 ' + (x + 5.5) + ' ' + y + 'Z" fill="' + W + '"' + s(2) + '/><circle cx="' + x + '" cy="' + (y + 2.4) + '" r="2.1" fill="' + INK + '"/>'; }).join('');
    },
    angry: function (y) { return eye(-8, y, 5, 2.3) + eye(8, y, 5, 2.3) + line('M-14 ' + (y - 9) + 'L-3 ' + (y - 5) + 'M14 ' + (y - 9) + 'L3 ' + (y - 5), 3); },
    one: function (y) { return eye(0, y, 9, 4.2); },
    glasses: function (y) {
      return '<circle cx="-9" cy="' + y + '" r="6.8" fill="' + W + '"' + s(2.6) + '/><circle cx="9" cy="' + y + '" r="6.8" fill="' + W + '"' + s(2.6) + '/>' +
        line('M-2.2 ' + y + 'H2.2', 2.6) + '<circle cx="-8" cy="' + (y + 1) + '" r="2.3" fill="' + INK + '"/><circle cx="10" cy="' + (y + 1) + '" r="2.3" fill="' + INK + '"/>';
    },
    stars: function (y) { return star(-8, y, 6.5, '#FFC800', 2) + star(8, y, 6.5, '#FFC800', 2); },
    happy: function (y) { return line('M-12 ' + (y + 2) + 'Q-8 ' + (y - 5) + ' -4 ' + (y + 2) + 'M4 ' + (y + 2) + 'Q8 ' + (y - 5) + ' 12 ' + (y + 2), 2.8); }
  };
  function eye(x, y, r, p) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + W + '"' + s(2) + '/><circle cx="' + n(x + r * 0.2) + '" cy="' + n(y + r * 0.2) + '" r="' + p + '" fill="' + INK + '"/>'; }
  function star(cx, cy, r, fill, w) {
    var d = '';
    for (var i = 0; i < 10; i++) {
      var a = (i * 36 - 90) * Math.PI / 180, q = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + n(cx + q * Math.cos(a)) + ' ' + n(cy + q * Math.sin(a));
    }
    return '<path d="' + d + 'Z" fill="' + fill + '"' + s(w || 3) + '/>';
  }
  var MOUTHS = {
    smile: function (y) { return line('M-5 ' + y + 'Q0 ' + (y + 4) + ' 5 ' + y); },
    grin: function (y) { return '<path d="M-8 ' + (y - 1) + 'H8Q8 ' + (y + 8) + ' 0 ' + (y + 8) + 'Q-8 ' + (y + 8) + ' -8 ' + (y - 1) + 'Z" fill="' + W + '"' + s(2.2) + '/>' + line('M-7 ' + (y + 3) + 'H7', 1.6); },
    open: function (y) { return '<ellipse cx="0" cy="' + (y + 2) + '" rx="4.5" ry="5.5" fill="' + INK + '"/><path d="M-3 ' + (y + 5.5) + 'Q0 ' + (y + 2.5) + ' 3 ' + (y + 5.5) + 'Q0 ' + (y + 7.5) + ' -3 ' + (y + 5.5) + 'Z" fill="#FF6B8A"/>'; },
    flat: function (y) { return line('M-5 ' + (y + 1) + 'H5'); },
    tongue: function (y) { return '<path d="M-1 ' + (y + 2) + 'V' + (y + 6) + 'A3 3 0 0 0 5 ' + (y + 6) + 'V' + (y + 1.5) + 'Z" fill="#FF6B8A"' + s(1.8) + '/>' + line('M-6 ' + y + 'Q0 ' + (y + 5) + ' 6 ' + y); },
    fangs: function (y) { return '<path d="M-4 ' + (y + 1.5) + 'L-2.5 ' + (y + 5.5) + 'L-1 ' + (y + 2) + 'Z M1 ' + (y + 2) + 'L2.5 ' + (y + 5.5) + 'L4 ' + (y + 1.5) + 'Z" fill="' + W + '"' + s(1.4) + '/>' + line('M-6 ' + y + 'Q0 ' + (y + 4) + ' 6 ' + y); },
    oh: function (y) { return '<circle cx="0" cy="' + (y + 2) + '" r="3.2" fill="' + INK + '"/>'; }
  };
  function face(eyes, mouth, y) { return EYES[eyes](y) + MOUTHS[mouth](y + 11); }

  // ======================================================================== design your own
  // Bodies: the shape, where its top is (for what goes on top), its half-width there and where the face goes.
  var BODIES = {
    round: { name: 'Round', top: -20, wide: 18, face: 2, d: function (c) { return '<circle cx="0" cy="4" r="25" fill="' + c + '"' + s() + '/>'; } },
    square: { name: 'Square', top: -19, wide: 20, face: 3, d: function (c) { return '<rect x="-24" y="-19" width="48" height="48" rx="11" fill="' + c + '"' + s() + '/>'; } },
    tall: { name: 'Tall', top: -25, wide: 14, face: -3, d: function (c) { return '<rect x="-19" y="-25" width="38" height="56" rx="19" fill="' + c + '"' + s() + '/>'; } },
    pear: { name: 'Pear', top: -22, wide: 12, face: 4, d: function (c) { return '<path d="M0 -22C14 -22 16 -8 18 2C30 10 26 30 0 30C-26 30 -30 10 -18 2C-16 -8 -14 -22 0 -22Z" fill="' + c + '"' + s() + '/>'; } },
    star: { name: 'Star', top: -21, wide: 6, face: 5, d: function (c) { return star(0, 4, 30, c, 3); } },
    cell: { name: 'Cell', top: -21, wide: 18, face: 3, d: function (c) {
      var d = '';
      for (var i = 0; i <= 40; i++) { var a = i / 40 * Math.PI * 2, r = 24 + 2.4 * Math.sin(a * 7); d += (i ? 'L' : 'M') + n(r * Math.cos(a)) + ' ' + n(4 + r * Math.sin(a)); }
      return '<path d="' + d + 'Z" fill="' + c + '"' + s() + '/>';
    } },
    bean: { name: 'Bean', top: -20, wide: 16, face: 0, d: function (c) { return '<path d="M-22 -2C-24 -18 -6 -24 8 -20C24 -16 28 0 22 14C16 28 -2 32 -14 26C-22 22 -16 12 -20 6C-22 4 -22 2 -22 -2Z" fill="' + c + '"' + s() + '/>'; } },
    ghost: { name: 'Ghost', top: -24, wide: 16, face: -2, d: function (c) { return '<path d="M-23 30V-1A23 23 0 0 1 23 -1V30L15.3 24L7.7 30L0 24L-7.7 30L-15.3 24Z" fill="' + c + '"' + s() + '/>'; } }
  };
  // On top: drawn with y = 0 at the body's top, w its half-width.
  var TOPS = {
    none: { name: 'Nothing', d: function () { return ''; } },
    cap: { name: 'Cap', d: function () { return '<path d="M-15 3Q-15 -14 0 -14Q15 -14 15 3Z" fill="#FF4B4B"' + s(2.6) + '/><path d="M10 3H27Q27 7 22 7H10Z" fill="#FF4B4B"' + s(2.6) + '/>'; } },
    crown: { name: 'Crown', d: function () { return '<path d="M-14 3V-13L-7 -4L0 -17L7 -4L14 -13V3Z" fill="#FFC800"' + s(2.6) + '/><circle cx="0" cy="-3" r="2.4" fill="#FF4B4B"/>'; } },
    party: { name: 'Party hat', d: function () { return '<path d="M-10 3L0 -24L10 3Z" fill="#CE82FF"' + s(2.6) + '/><path d="M-6 -7L4 -3M-3 -15L6 -11" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="-26" r="4" fill="#FFC800"' + s(2) + '/>'; } },
    horns: { name: 'Horns', d: function (w) { return [-1, 1].map(function (k) { var x = k * Math.min(w, 13); return '<path d="M' + n(x - 4 * k) + ' 4Q' + n(x + 6 * k) + ' -6 ' + n(x + 2 * k) + ' -18Q' + n(x + 12 * k) + ' -8 ' + n(x + 6 * k) + ' 5Z" fill="#F4E6C8"' + s(2.4) + '/>'; }).join(''); } },
    antenna: { name: 'Antenna', d: function () { return line('M0 2V-16', 3) + '<circle cx="0" cy="-19" r="5" fill="#FFC800"' + s(2.4) + '/>'; } },
    bow: { name: 'Bow', d: function (w) { var x = Math.min(w, 12); return '<path d="M' + x + ' 0L' + (x - 12) + ' -8L' + (x - 12) + ' 8Z M' + x + ' 0L' + (x + 12) + ' -8L' + (x + 12) + ' 8Z" fill="#FF86D0"' + s(2.4) + '/><circle cx="' + x + '" cy="0" r="3.6" fill="#FF86D0"' + s(2.4) + '/>'; } },
    sprout: { name: 'Sprout', d: function () { return line('M0 3V-12', 3) + '<path d="M0 -10Q-12 -20 -16 -10Q-8 -4 0 -10Z M0 -12Q10 -24 16 -14Q8 -6 0 -12Z" fill="#4CB944"' + s(2.4) + '/>'; } },
    headphones: { name: 'Headphones', d: function (w) { var x = w + 8; return '<path d="M' + (-x) + ' 16Q' + (-x) + ' -13 0 -13Q' + x + ' -13 ' + x + ' 16" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + '<rect x="' + (-x - 5) + '" y="8" width="10" height="17" rx="4" fill="#FF9600"' + s(2.4) + '/><rect x="' + (x - 5) + '" y="8" width="10" height="17" rx="4" fill="#FF9600"' + s(2.4) + '/>'; } },
    chef: { name: 'Chef\'s hat', d: function () { return '<path d="M-11 4V-6A8 8 0 0 1 -6 -20A9 9 0 0 1 8 -21A8 8 0 0 1 11 -6V4Z" fill="#FFFFFF"' + s(2.6) + '/>' + line('M-11 -2H11', 2.2); } },
    grad: { name: 'Grad cap', d: function () { return '<path d="M-11 4V-6H11V4Z" fill="' + INK + '"/><path d="M-22 -8L0 -16L22 -8L0 0Z" fill="' + INK + '"' + s(2) + '/>' + line('M14 -8V4', 2) + '<circle cx="14" cy="6" r="2.6" fill="#FFC800"/>'; } },
    tuft: { name: 'Hair', d: function () { return '<path d="M-10 5L-8 -9L-3 0L1 -14L5 0L10 -9L10 5Z" fill="' + INK + '"' + s(2) + '/>'; } }
  };
  // Extras, drawn on the face (y = where the eyes are).
  var EXTRAS = {
    none: { name: 'Nothing', d: function () { return ''; } },
    cheeks: { name: 'Cheeks', d: function (y) { return '<ellipse cx="-14" cy="' + (y + 8) + '" rx="4" ry="2.6" fill="#FFA3C7"/><ellipse cx="14" cy="' + (y + 8) + '" rx="4" ry="2.6" fill="#FFA3C7"/>'; } },
    spots: { name: 'Spots', d: function (y, c) { var t = tone(c, -0.22); return [[-15, y + 15, 3.4], [13, y + 18, 2.6], [17, y - 9, 2.2], [-16, y - 6, 2]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + t + '"/>'; }).join(''); } },
    freckles: { name: 'Freckles', d: function (y, c) { var t = tone(c, -0.4); return [[-15, y + 7], [-12, y + 9], [-16, y + 10], [15, y + 7], [12, y + 9], [16, y + 10]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.1" fill="' + t + '"/>'; }).join(''); } },
    moustache: { name: 'Moustache', d: function (y) { return '<path d="M0 ' + (y + 8) + 'C-4 ' + (y + 6) + ' -10 ' + (y + 6) + ' -12 ' + (y + 11) + 'C-8 ' + (y + 11) + ' -4 ' + (y + 11) + ' 0 ' + (y + 9.5) + 'C4 ' + (y + 11) + ' 8 ' + (y + 11) + ' 12 ' + (y + 11) + 'C10 ' + (y + 6) + ' 4 ' + (y + 6) + ' 0 ' + (y + 8) + 'Z" fill="' + INK + '"/>'; } },
    scarf: { name: 'Scarf', d: function (y) { var t = y + 19; return '<path d="M-19 ' + t + 'Q0 ' + (t + 6) + ' 19 ' + t + 'L19 ' + (t + 6) + 'Q0 ' + (t + 12) + ' -19 ' + (t + 6) + 'Z" fill="#FF4B4B"' + s(2.4) + '/><path d="M8 ' + (t + 7) + 'L12 ' + (t + 17) + 'L18 ' + (t + 15) + 'L14 ' + (t + 6) + 'Z" fill="#FF4B4B"' + s(2.4) + '/>'; } }
  };
  var PARTS = {
    body: keys(BODIES), eyes: ['dots', 'big', 'sleepy', 'angry', 'one', 'glasses', 'stars', 'happy'],
    mouth: ['smile', 'grin', 'open', 'flat', 'tongue', 'fangs', 'oh'], top: keys(TOPS), extra: keys(EXTRAS)
  };
  var PART_NAMES = { eyes: { dots: 'Dots', big: 'Big', sleepy: 'Sleepy', angry: 'Cross', one: 'One eye', glasses: 'Glasses', stars: 'Stars', happy: 'Happy' },
    mouth: { smile: 'Smile', grin: 'Grin', open: 'Open', flat: 'Flat', tongue: 'Tongue', fangs: 'Fangs', oh: 'Oh' } };
  function keys(o) { return Object.keys(o); }
  function partName(kind, id) {
    if (kind === 'body') return BODIES[id].name;
    if (kind === 'top') return TOPS[id].name;
    if (kind === 'extra') return EXTRAS[id].name;
    return PART_NAMES[kind][id];
  }
  // A character from parts: [body, eyes, mouth, top, extra] (indexes into PARTS).
  function built(d, c) {
    var b = BODIES[PARTS.body[d[0]]], y = b.face;
    return b.d(c) + EXTRAS[PARTS.extra[d[4]]].d(y, c) + face(PARTS.eyes[d[1]], PARTS.mouth[d[2]], y) + '<g transform="translate(0 ' + b.top + ')">' + TOPS[PARTS.top[d[3]]].d(b.wide) + '</g>';
  }

  // A character from parts, zoomed on the part a row changes (eyes, mouth and extras on the face; what's on top on the
  // top), for the buttons that pick it.
  function partSvg(row, d, c, size) {
    var b = BODIES[PARTS.body[d[0]]], box = row === 'eyes' || row === 'mouth' || row === 'extra' ? [-27, b.face - 15, 54, 40] : row === 'top' ? [-32, b.top - 34, 64, 50] : [-42, -52, 84, 88];
    return '<svg class="mk-part" viewBox="' + box.join(' ') + '" width="' + size + '" height="' + Math.round(size * box[3] / box[2]) + '" aria-hidden="true">' + built(d, COLOURS[c] || COLOURS[0]) + '</svg>';
  }

  // ======================================================================== ready-made characters
  var PLAYERS = [
    ['blob', 'Blob', function (c) { return built([0, 0, 0, 0, 0], c); }],
    ['robot', 'Robot', function (c) {
      return '<rect x="-22" y="-18" width="44" height="44" rx="9" fill="' + c + '"' + s() + '/>' + line('M0 -18V-28', 3) + '<circle cx="0" cy="-31" r="4.5" fill="#FFC800"' + s(2.4) + '/>' +
        '<rect x="-15" y="-8" width="11" height="10" rx="2" fill="' + W + '"' + s(2) + '/><rect x="4" y="-8" width="11" height="10" rx="2" fill="' + W + '"' + s(2) + '/>' +
        '<rect x="-11" y="-5" width="4" height="4" fill="' + INK + '"/><rect x="8" y="-5" width="4" height="4" fill="' + INK + '"/>' +
        '<rect x="-9" y="9" width="18" height="7" rx="2" fill="' + W + '"' + s(2) + '/>' + line('M-3 9V16M3 9V16', 1.6) + '<rect x="-26" y="-2" width="4" height="12" rx="2" fill="' + tone(c, -0.25) + '"' + s(2) + '/><rect x="22" y="-2" width="4" height="12" rx="2" fill="' + tone(c, -0.25) + '"' + s(2) + '/>';
    }],
    ['cat', 'Cat', function (c) {
      return '<path d="M-20 -6L-18 -28L-5 -18M20 -6L18 -28L5 -18" fill="' + c + '"' + s() + '/><circle cx="0" cy="4" r="24" fill="' + c + '"' + s() + '/>' +
        '<path d="M-15 -18L-14 -10M15 -18L14 -10" stroke="#FFA3C7" stroke-width="3" stroke-linecap="round"/>' + face('dots', 'smile', 1) +
        '<path d="M-2 8L0 10L2 8Z" fill="#FF6B8A"/>' + line('M-26 8H-16M-26 13H-16M26 8H16M26 13H16', 1.6);
    }],
    ['star', 'Star', function (c) { return built([4, 0, 0, 0, 1], c); }],
    ['rbc', 'Red blood cell', function (c) {
      return '<ellipse cx="0" cy="6" rx="28" ry="22" fill="' + c + '"' + s() + '/><ellipse cx="0" cy="6" rx="15" ry="10" fill="' + tone(c, -0.18) + '"/>' + face('big', 'grin', 0);
    }],
    ['neuron', 'Neuron', function (c) {
      var arms = [[-90, 30], [-30, 32], [30, 32], [150, 32], [210, 32], [90, 26]].map(function (a) {
        var r = a[0] * Math.PI / 180, x = Math.cos(r) * a[1], y = 4 + Math.sin(r) * a[1], fx = function (k, off) { return n(Math.cos(r + off) * (a[1] + k)); }, fy = function (k, off) { return n(4 + Math.sin(r + off) * (a[1] + k)); };
        return line('M0 4L' + n(x) + ' ' + n(y) + 'M' + n(x) + ' ' + n(y) + 'L' + fx(6, 0.25) + ' ' + fy(6, 0.25) + 'M' + n(x) + ' ' + n(y) + 'L' + fx(6, -0.25) + ' ' + fy(6, -0.25), 4);
      }).join('');
      return arms + '<circle cx="0" cy="4" r="18" fill="' + c + '"' + s() + '/>' + face('dots', 'smile', 1);
    }],
    ['heart', 'Heart', function (c) {
      return '<path d="M-8 -22V-34M4 -20V-32" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M-8 -22V-34M4 -20V-32" stroke="' + tone(c, -0.15) + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M0 32C-12 24 -30 12 -30 -6C-30 -18 -22 -24 -14 -24C-7 -24 -2 -20 0 -14C2 -20 7 -24 14 -24C22 -24 30 -18 30 -6C30 12 12 24 0 32Z" fill="' + c + '"' + s() + '/>' + face('dots', 'smile', -3);
    }],
    ['lungs', 'Lungs', function (c) {
      return line('M0 -30V-12M0 -12L-9 -4M0 -12L9 -4', 4) + '<path d="M-4 -8C-8 -20 -24 -18 -27 0C-30 16 -26 28 -12 28C-4 28 -3 20 -3 10Z" fill="' + c + '"' + s() + '/>' +
        '<path d="M4 -8C8 -20 24 -18 27 0C30 16 26 28 12 28C4 28 3 20 3 10Z" fill="' + c + '"' + s() + '/>' + eye(-14, 4, 5, 2.3) + eye(14, 4, 5, 2.3) + MOUTHS.smile(16);
    }],
    ['kidney', 'Kidney', function (c) {
      return '<path d="M-6 -24C10 -30 28 -18 28 2C28 22 12 32 -2 30C-14 28 -12 16 -6 10C-2 6 -2 -2 -8 -4C-16 -8 -18 -20 -6 -24Z" fill="' + c + '"' + s() + '/>' +
        line('M-4 4H-14', 4) + eye(4, -4, 5, 2.3) + eye(16, -4, 5, 2.3) + line('M5 8Q10 12 15 8');
    }],
    ['germ', 'Friendly germ', function (c) {
      return line('M24 0Q32 -8 36 2M22 12Q30 18 36 12M-24 0Q-32 -8 -36 2', 2.6) + '<rect x="-25" y="-14" width="50" height="34" rx="17" fill="' + c + '"' + s() + '/>' +
        '<circle cx="-14" cy="12" r="2.4" fill="' + tone(c, -0.2) + '"/><circle cx="16" cy="-6" r="2" fill="' + tone(c, -0.2) + '"/>' + face('dots', 'smile', -2);
    }],
    ['frog', 'Frog', function (c) {
      return '<circle cx="-12" cy="-16" r="9" fill="' + c + '"' + s() + '/><circle cx="12" cy="-16" r="9" fill="' + c + '"' + s() + '/><ellipse cx="0" cy="8" rx="28" ry="21" fill="' + c + '"' + s() + '/>' +
        eye(-12, -16, 5.2, 2.6) + eye(12, -16, 5.2, 2.6) + line('M-14 8Q0 18 14 8', 2.6) + '<ellipse cx="0" cy="22" rx="14" ry="5" fill="' + tone(c, 0.35) + '"/>' + '<ellipse cx="-19" cy="5" rx="3.6" ry="2.4" fill="#FFA3C7"/><ellipse cx="19" cy="5" rx="3.6" ry="2.4" fill="#FFA3C7"/>';
    }],
    ['owl', 'Owl', function (c) {
      return '<path d="M-20 -14L-22 -26L-10 -18M20 -14L22 -26L10 -18" fill="' + c + '"' + s() + '/><ellipse cx="0" cy="6" rx="24" ry="26" fill="' + c + '"' + s() + '/>' +
        '<ellipse cx="0" cy="14" rx="13" ry="14" fill="' + tone(c, 0.45) + '"/>' + '<circle cx="-9" cy="-4" r="9" fill="' + W + '"' + s(2.4) + '/><circle cx="9" cy="-4" r="9" fill="' + W + '"' + s(2.4) + '/>' +
        '<circle cx="-8" cy="-3" r="3.6" fill="' + INK + '"/><circle cx="10" cy="-3" r="3.6" fill="' + INK + '"/><path d="M-3 5L0 11L3 5Z" fill="#FF9600"' + s(1.8) + '/>' +
        '<path d="M-24 4Q-30 16 -20 22M24 4Q30 16 20 22" fill="none"' + s(2.6) + '/>';
    }],
    ['fox', 'Fox', function (c) {
      return '<path d="M-22 -8L-20 -30L-6 -18M22 -8L20 -30L6 -18" fill="' + c + '"' + s() + '/><path d="M0 30C-18 30 -26 14 -26 0C-26 -14 -14 -22 0 -22C14 -22 26 -14 26 0C26 14 18 30 0 30Z" fill="' + c + '"' + s() + '/>' +
        '<path d="M-24 6C-14 6 -6 12 0 24C6 12 14 6 24 6C22 20 12 30 0 30C-12 30 -22 20 -24 6Z" fill="' + W + '"' + s(2.4) + '/>' + EYES.dots(-2) + '<circle cx="0" cy="10" r="3.2" fill="' + INK + '"/>' + line('M-4 15Q0 18 4 15');
    }],
    ['ghost', 'Ghost', function (c) { return built([7, 7, 6, 0, 1], c); }],
    ['alien', 'Alien', function (c) {
      return line('M-10 -18L-16 -32M10 -18L16 -32', 2.6) + '<circle cx="-16" cy="-33" r="4" fill="#FFC800"' + s(2.2) + '/><circle cx="16" cy="-33" r="4" fill="#FFC800"' + s(2.2) + '/>' +
        '<path d="M0 30C-16 30 -26 12 -26 -2C-26 -16 -14 -24 0 -24C14 -24 26 -16 26 -2C26 12 16 30 0 30Z" fill="' + c + '"' + s() + '/>' +
        '<ellipse cx="-10" cy="0" rx="7" ry="9" fill="' + INK + '" transform="rotate(-20 -10 0)"/><ellipse cx="10" cy="0" rx="7" ry="9" fill="' + INK + '" transform="rotate(20 10 0)"/>' +
        '<circle cx="-8" cy="-3" r="2.2" fill="' + W + '"/><circle cx="12" cy="-3" r="2.2" fill="' + W + '"/>' + line('M-4 16Q0 19 4 16');
    }],
    ['astronaut', 'Astronaut', function (c) {
      return '<rect x="-20" y="8" width="40" height="22" rx="8" fill="' + c + '"' + s() + '/><rect x="-6" y="14" width="12" height="8" rx="2" fill="' + W + '"' + s(2) + '/>' +
        '<circle cx="0" cy="-8" r="22" fill="' + W + '"' + s() + '/><rect x="-15" y="-19" width="30" height="22" rx="11" fill="#9BE3F9"' + s(2.6) + '/>' + EYES.dots(-10) + line('M-4 -2Q0 1 4 -2') +
        '<path d="M-9 -15Q-6 -17 -3 -15" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }],
    ['dino', 'Dino', function (c) {
      return '<path d="M-12 -18L-8 -28L-3 -20L2 -30L6 -20L11 -28L14 -16Z" fill="' + tone(c, -0.2) + '"' + s(2.4) + '/>' +
        '<path d="M-24 30V0C-24 -18 -12 -22 0 -22C16 -22 26 -14 26 -2C26 6 20 10 12 10V30Z" fill="' + c + '"' + s() + '/>' +
        eye(4, -10, 5, 2.3) + line('M8 2Q16 4 22 0', 2.4) + '<circle cx="18" cy="-8" r="1.4" fill="' + INK + '"/><path d="M-10 30V20M2 30V20" stroke="' + INK + '" stroke-width="2.4"/>';
    }],
    ['penguin', 'Penguin', function (c) {
      return '<ellipse cx="0" cy="4" rx="22" ry="27" fill="' + c + '"' + s() + '/><ellipse cx="0" cy="10" rx="14" ry="19" fill="' + W + '"' + s(2) + '/>' +
        eye(-7, -8, 4.5, 2.1) + eye(7, -8, 4.5, 2.1) + '<path d="M-5 -1L0 5L5 -1Z" fill="#FF9600"' + s(2) + '/>' + '<path d="M-10 30L-16 33H-4ZM10 30L16 33H4Z" fill="#FF9600"' + s(2) + '/>' +
        '<path d="M-22 0Q-30 10 -24 18M22 0Q30 10 24 18" fill="none"' + s(2.6) + '/>';
    }],
    ['tooth', 'Tooth', function (c) {
      return '<path d="M-22 -14C-22 -26 -10 -28 0 -22C10 -28 22 -26 22 -14C22 0 18 8 16 18C14 28 8 32 6 22C4 14 -4 14 -6 22C-8 32 -14 28 -16 18C-18 8 -22 0 -22 -14Z" fill="' + tone(c, 0.82) + '"' + s() + '/>' +
        '<path d="M-14 -18Q-10 -22 -6 -20" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>' + face('dots', 'grin', -8);
    }],
    ['stomach', 'Stomach', function (c) {
      return line('M-14 -34V-20', 6) + '<path d="M-14 -34V-20" stroke="' + tone(c, -0.15) + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M-20 -22C-20 -10 -26 4 -18 18C-8 32 18 32 26 14C30 4 26 -10 14 -10C6 -10 4 -4 0 -6C-6 -8 -6 -18 -8 -22Z" fill="' + c + '"' + s() + '/>' +
        line('M20 22Q26 28 32 26', 4) + eye(-3, 6, 5, 2.3) + eye(13, 6, 5, 2.3) + line('M0 17Q5 21 10 17');
    }],
    ['bee', 'Bee', function (c) {
      return '<ellipse cx="-10" cy="-20" rx="10" ry="7" fill="#FFFFFF"' + s(2.4) + ' transform="rotate(-25 -10 -20)"/><ellipse cx="10" cy="-20" rx="10" ry="7" fill="#FFFFFF"' + s(2.4) + ' transform="rotate(25 10 -20)"/>' +
        '<ellipse cx="0" cy="6" rx="24" ry="22" fill="' + c + '"' + s() + '/><path d="M-21 14Q0 22 21 14M-14 24Q0 29 14 24" fill="none" stroke="' + INK + '" stroke-width="5"/>' +
        line('M-6 -14L-10 -26M6 -14L10 -26', 2.4) + '<circle cx="-10" cy="-27" r="2.6" fill="' + INK + '"/><circle cx="10" cy="-27" r="2.6" fill="' + INK + '"/>' + face('dots', 'smile', -2);
    }],
    ['sheep', 'Sheep', function (c) {
      var wool = '';
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; wool += '<circle cx="' + n(20 * Math.cos(a)) + '" cy="' + n(6 + 18 * Math.sin(a)) + '" r="9" fill="#FFFFFF"' + s(2.6) + '/>'; }
      return wool + '<ellipse cx="0" cy="6" rx="21" ry="17" fill="#FFFFFF"/><path d="M-8 34V26M8 34V26" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="2" rx="12" ry="14" fill="' + c + '"' + s(2.6) + '/><ellipse cx="-14" cy="-6" rx="6" ry="3.4" fill="' + c + '"' + s(2.2) + '/><ellipse cx="14" cy="-6" rx="6" ry="3.4" fill="' + c + '"' + s(2.2) + '/>' +
        eye(-5, -2, 4, 1.9) + eye(5, -2, 4, 1.9) + line('M-3 9Q0 11 3 9', 2);
    }]
  ];
  // The ready-made characters' colours as they come (you can change it).
  var PLAYER_COLOUR = { blob: 0, robot: 9, cat: 3, star: 6, rbc: 2, neuron: 4, heart: 2, lungs: 5, kidney: 8, germ: 7, frog: 1, owl: 8, fox: 3, ghost: 4, alien: 1, astronaut: 0, dino: 1, penguin: 9, tooth: 0, stomach: 5, bee: 6, sheep: 9 };
  function playerSvg(spec, size, cls) {
    var c = COLOURS[spec.c] || COLOURS[0], inner;
    if (spec.p === 'make') inner = built(spec.d || [0, 0, 0, 0, 0], c);
    else inner = (PLAYERS.filter(function (p) { return p[0] === spec.p; })[0] || PLAYERS[0])[2](c);
    return '<svg class="' + (cls || 'mk-av') + '" viewBox="-42 -52 84 88" width="' + size + '" height="' + size + '" aria-hidden="true">' + inner + '</svg>';
  }

  // ======================================================================== rivals
  var RIVALS = [
    ['examiner', 'The examiner', null],
    ['virus', 'Virus', function () {
      var spikes = '';
      for (var i = 0; i < 10; i++) { var a = i * 36 * Math.PI / 180, x1 = n(19 * Math.cos(a)), y1 = n(4 + 19 * Math.sin(a)), x2 = n(29 * Math.cos(a)), y2 = n(4 + 29 * Math.sin(a)); spikes += line('M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, 3) + '<circle cx="' + x2 + '" cy="' + y2 + '" r="4" fill="#FF4B4B"' + s(2.2) + '/>'; }
      return spikes + '<circle cx="0" cy="4" r="21" fill="#CE82FF"' + s() + '/>' + face('angry', 'fangs', 1);
    }],
    ['bacterium', 'Bacterium', function () {
      return line('M26 6Q34 0 32 -10M26 14Q36 18 38 10M-26 6Q-34 0 -32 -10M-26 14Q-36 18 -38 10', 2.6) + '<rect x="-27" y="-14" width="54" height="36" rx="18" fill="#2BD4BD"' + s() + '/>' +
        '<circle cx="-16" cy="12" r="2.6" fill="#1C9C8B"/><circle cx="17" cy="-6" r="2.2" fill="#1C9C8B"/>' + face('angry', 'grin', -1);
    }],
    ['mould', 'Mould', function () {
      return '<path d="M-8 28V6H8V28Z" fill="#F4E6C8"' + s() + '/><path d="M-28 8C-28 -14 -14 -24 0 -24C14 -24 28 -14 28 8Z" fill="#FF9600"' + s() + '/>' +
        '<circle cx="-20" cy="-2" r="3.6" fill="#FFFFFF"/><circle cx="2" cy="-18" r="3" fill="#FFFFFF"/><circle cx="21" cy="0" r="2.4" fill="#FFFFFF"/>' + face('angry', 'flat', -8);
    }],
    ['paper', 'Exam paper', function () {
      return '<path d="M-22 -30H12L24 -18V30H-22Z" fill="#FFFFFF"' + s() + '/><path d="M12 -30V-18H24" fill="#E6EBEF"' + s(2.4) + '/>' +
        line('M-14 18H14M-14 24H8', 2) + '<text x="-14" y="-17" font-family="Nunito, sans-serif" font-weight="900" font-size="9" fill="' + INK + '">EXAM</text>' + face('angry', 'grin', -2);
    }],
    ['clock', 'The clock', function () {
      return '<path d="M-18 -20L-24 -26M18 -20L24 -26" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="-20" cy="-24" r="7" fill="#FF4B4B"' + s(2.4) + '/><circle cx="20" cy="-24" r="7" fill="#FF4B4B"' + s(2.4) + '/>' +
        '<circle cx="0" cy="2" r="26" fill="#FF4B4B"' + s() + '/><circle cx="0" cy="2" r="19" fill="#FFFFFF"' + s(2.4) + '/>' + line('M0 2V-10M0 2L8 6', 2.6) + '<path d="M-14 30L-18 34M14 30L18 34" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        line('M-12 -6L-5 -3M12 -6L5 -3', 2.4) + '<circle cx="-8" cy="-1" r="2" fill="' + INK + '"/><circle cx="8" cy="-1" r="2" fill="' + INK + '"/>' + line('M-5 14Q0 11 5 14', 2.4);
    }],
    ['king', 'Germ king', function () {
      return '<path d="M-14 -16V-30L-7 -22L0 -34L7 -22L14 -30V-16Z" fill="#FFC800"' + s(2.6) + '/>' + BODIES.cell.d('#58CC02') + '<circle cx="-16" cy="16" r="3" fill="#3F9E00"/><circle cx="14" cy="18" r="2.4" fill="#3F9E00"/>' + face('angry', 'fangs', 2);
    }],
    ['robo', 'Robo-examiner', function () {
      return '<rect x="-24" y="-20" width="48" height="46" rx="8" fill="#5B6B8C"' + s() + '/>' + line('M-8 -20L-12 -30M8 -20L12 -30', 3) + '<circle cx="-12" cy="-31" r="3.5" fill="#FF4B4B"' + s(2) + '/><circle cx="12" cy="-31" r="3.5" fill="#FF4B4B"' + s(2) + '/>' +
        '<rect x="-17" y="-10" width="34" height="13" rx="6" fill="' + INK + '"/><rect x="-12" y="-6" width="8" height="5" rx="1" fill="#FF4B4B"/><rect x="4" y="-6" width="8" height="5" rx="1" fill="#FF4B4B"/>' +
        '<rect x="-10" y="10" width="20" height="8" rx="2" fill="#FFFFFF"' + s(2) + '/>' + line('M-4 10V18M2 10V18', 1.6);
    }]
  ];
  function rivalSvg(id, size, faceSvg) {
    var r = RIVALS.filter(function (x) { return x[0] === id; })[0] || RIVALS[0];
    if (!r[2]) return '<span class="mk-face" style="width:' + size + 'px;height:' + size + 'px">' + (faceSvg || '') + '</span>';
    return '<svg class="mk-rival" viewBox="-40 -40 80 80" width="' + size + '" height="' + size + '" aria-hidden="true">' + r[2]() + '</svg>';
  }

  // ======================================================================== places
  // Each place fills a 1600 x 500 picture, its floor the bottom 80 (16%: the game's pieces stand on it). On a phone the
  // picture is cut to the middle, so what matters is in the middle 900.
  function rect(x, y, w, h, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function floor(fill, edge) { return rect(0, 420, 1600, 80, fill) + rect(0, 416, 1600, 6, edge || INK); }
  function circles(list, fill, extra) { return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + fill + '"' + (extra || '') + '/>'; }).join(''); }
  function rbc(x, y, r, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')"><ellipse rx="' + r + '" ry="' + n(r * 0.62) + '" fill="#E5484D"' + s(3) + '/><ellipse rx="' + n(r * 0.5) + '" ry="' + n(r * 0.26) + '" fill="#C93A3F"/></g>';
  }
  function tree(x, y, k, leaf) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' + rect(-9, -40, 18, 40, '#8B5E3C', s(3)) + '<path d="M0 -150L52 -40H-52Z" fill="' + leaf + '"' + s(3) + '/><path d="M0 -190L40 -110H-40Z" fill="' + leaf + '"' + s(3) + '/></g>';
  }
  var PLACES = [
    ['class', 'Classroom', false, function () {
      return rect(0, 0, 1600, 420, '#DDEFFB') + rect(0, 330, 1600, 86, '#C9E3F5') + floor('#C7A27C') + line('M0 458H1600', 2) +
        rect(380, 80, 520, 200, '#2E5E4E', ' stroke="#8B5E3C" stroke-width="14" rx="8"') + line('M430 140Q470 110 510 140T590 140M430 200H700M430 230H620', 4).replace(INK, '#FFFFFF') +
        rect(380, 280, 520, 12, '#8B5E3C') + '<circle cx="1050" cy="120" r="42" fill="#FFFFFF"' + s(6) + '/>' + line('M1050 120V92M1050 120L1070 132', 5) +
        rect(1180, 70, 220, 170, '#BFE8FF', s(8)) + line('M1290 70V240M1180 155H1400', 8) + rect(150, 110, 120, 150, '#FFC800', s(5)) + '<circle cx="210" cy="170" r="30" fill="#FF9600"' + s(4) + '/>';
    }],
    ['hall', 'Exam hall', false, function () {
      var desks = '';
      for (var r = 0; r < 2; r++) for (var i = 0; i < 9; i++) { var x = 120 + i * 160 + r * 60, y = 300 + r * 70; desks += rect(x, y, 90, 14, '#B98F65', s(3)) + line('M' + (x + 10) + ' ' + (y + 14) + 'V' + (y + 46) + 'M' + (x + 80) + ' ' + (y + 14) + 'V' + (y + 46), 3); }
      return rect(0, 0, 1600, 420, '#EDE6D6') + floor('#A57E58') + rect(0, 250, 1600, 6, '#D6CBB4') +
        '<circle cx="800" cy="110" r="64" fill="#FFFFFF"' + s(8) + '/>' + line('M800 110V64M800 110L834 128', 7) +
        rect(1150, 70, 260, 70, '#FFFFFF', s(5)) + '<text x="1280" y="117" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="38" fill="' + INK + '">SILENCE</text>' +
        rect(180, 60, 200, 150, '#BFE8FF', s(8)) + line('M280 60V210', 8) + desks;
    }],
    ['lab', 'Lab', false, function () {
      return rect(0, 0, 1600, 420, '#E3F5E1') + floor('#9AA8B5') + line('M0 458H1600M200 420V500M600 420V500M1000 420V500M1400 420V500', 2) +
        rect(120, 90, 360, 14, '#8B5E3C', s(4)) + rect(1120, 90, 360, 14, '#8B5E3C', s(4)) +
        ['#FF4B4B', '#1CB0F6', '#FFC800', '#CE82FF'].map(function (c, i) { return rect(150 + i * 82, 40, 44, 50, c, s(4) + ' rx="6"'); }).join('') +
        ['#2BD4BD', '#FF9600', '#FF86D0'].map(function (c, i) { return '<path d="M' + (1170 + i * 110) + ' 40H' + (1200 + i * 110) + 'V58L' + (1222 + i * 110) + ' 90H' + (1148 + i * 110) + 'L' + (1170 + i * 110) + ' 58Z" fill="' + c + '"' + s(4) + '/>'; }).join('') +
        rect(480, 300, 640, 120, '#FFFFFF', s(5)) + rect(470, 284, 660, 20, '#5B6B8C', s(5)) + line('M693 304V420M906 304V420', 4) +
        '<circle cx="670" cy="362" r="7" fill="' + INK + '"/><circle cx="716" cy="362" r="7" fill="' + INK + '"/><circle cx="884" cy="362" r="7" fill="' + INK + '"/><circle cx="930" cy="362" r="7" fill="' + INK + '"/>' +
        '<path d="M570 284V240H590V284M560 240H600" fill="none"' + s(5) + '/><path d="M600 284H660V260L688 220H620L640 200" fill="none"' + s(0) + '/>' +
        '<path d="M650 284L620 284L640 240V200H660V240L680 284Z" fill="#2BD4BD"' + s(5) + '/>' + line('M634 200H666', 5) +
        '<path d="M960 284V266H1040V284M980 266L1004 180L1050 160M1020 200H1060" fill="none"' + s(6) + '/><circle cx="1054" cy="158" r="11" fill="#FFFFFF"' + s(4) + '/>' + rect(970, 230, 60, 8, '#5B6B8C', s(3));
    }],
    ['blood', 'Blood vessel', false, function () {
      return rect(0, 0, 1600, 500, '#FBE3D6') + '<path d="M0 0H1600V60Q1200 90 800 60T0 60Z" fill="#E8828F"' + s(5) + '/>' + floor('#E8828F', INK) +
        rbc(260, 170, 46, -15) + rbc(560, 300, 40, 20) + rbc(1040, 160, 50, 10) + rbc(1340, 290, 42, -25) + rbc(820, 210, 30, 40) +
        circles([[420, 110, 9], [700, 360, 8], [1200, 120, 7], [1480, 180, 9]], '#FFC800', s(3)) + '<circle cx="140" cy="330" r="26" fill="#FFFFFF"' + s(4) + '/><circle cx="140" cy="330" r="12" fill="#CE82FF"' + s(3) + '/>';
    }],
    ['lungs', 'Inside the lungs', false, function () {
      var grape = function (x, y, k) {
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' + line('M0 -120V-40', 10) + circles([[-30, -10, 32], [30, -14, 32], [0, 30, 32], [-40, 46, 28], [40, 44, 28], [0, -40, 26]], '#F49AB0', s(4)) +
          line('M-60 0Q0 -60 60 0', 4).replace(INK, '#E5484D') + line('M-60 30Q0 80 60 30', 4).replace(INK, '#1CB0F6') + '</g>';
      };
      return rect(0, 0, 1600, 420, '#FFE3E8') + floor('#E88AA0') + grape(260, 200, 1) + grape(800, 170, 1.15) + grape(1330, 210, 0.95) + circles([[520, 90, 8], [1060, 330, 10], [580, 360, 6], [1100, 80, 7]], '#FFFFFF', s(3));
    }],
    ['night', 'Night', true, function () {
      var stars = '';
      for (var i = 0; i < 46; i++) stars += '<circle cx="' + ((i * 349) % 1600) + '" cy="' + (20 + (i * 137) % 300) + '" r="' + (2 + i % 3) + '" fill="#FFFFFF"/>';
      return rect(0, 0, 1600, 500, '#1B2A4A') + stars + '<circle cx="1180" cy="110" r="56" fill="#F6F0C8"' + s(5) + '/><circle cx="1160" cy="96" r="10" fill="#E6DCA8"/><circle cx="1200" cy="128" r="7" fill="#E6DCA8"/>' +
        '<path d="M0 420Q300 300 600 420T1200 420T1600 380V420Z" fill="#2C3E5C"/>' + floor('#24344F', '#0E1A30');
    }],
    ['space', 'Space', true, function () {
      var stars = '';
      for (var i = 0; i < 60; i++) stars += '<circle cx="' + ((i * 271) % 1600) + '" cy="' + (10 + (i * 97) % 400) + '" r="' + (1.5 + i % 3) + '" fill="#FFFFFF"/>';
      return rect(0, 0, 1600, 500, '#14213D') + stars + '<circle cx="1220" cy="150" r="70" fill="#FF9600"' + s(5) + '/><ellipse cx="1220" cy="150" rx="120" ry="24" fill="none" stroke="#FFC800" stroke-width="10" transform="rotate(-15 1220 150)"/>' +
        '<circle cx="360" cy="110" r="34" fill="#CE82FF"' + s(4) + '/><circle cx="350" cy="100" r="8" fill="#B06AE0"/>' + floor('#9AA8B5', '#5B6B8C') + circles([[200, 460, 16], [700, 470, 10], [1100, 455, 20], [1450, 468, 12]], '#7D8B99');
    }],
    ['beach', 'Beach', false, function () {
      return rect(0, 0, 1600, 500, '#BFE8FF') + '<circle cx="1300" cy="100" r="58" fill="#FFC800"' + s(5) + '/>' + rect(0, 300, 1600, 120, '#59B8E6') +
        line('M100 340q30 -16 60 0t60 0M600 370q30 -16 60 0t60 0M1100 335q30 -16 60 0t60 0', 4).replace(INK, '#FFFFFF') + floor('#F6D58E', '#D9B566') +
        '<path d="M240 420Q250 300 230 200" fill="none"' + s(14) + '/><path d="M240 420Q250 300 230 200" fill="none" stroke="#B98A5A" stroke-width="8"/>' +
        '<path d="M230 200Q160 170 120 220Q180 200 230 200Q200 130 150 120Q210 140 230 200Q280 130 340 140Q280 160 230 200Q300 180 350 230Q290 200 230 200Z" fill="#4CB944"' + s(4) + '/>' +
        '<path d="M1060 420L1100 250" fill="none"' + s(6) + '/><path d="M1000 260Q1100 170 1200 260Z" fill="#FF4B4B"' + s(5) + '/><path d="M1066 238Q1100 200 1134 238" fill="none" stroke="#FFFFFF" stroke-width="10"/>';
    }],
    ['sea', 'Under the sea', true, function () {
      var weed = function (x, h, c) { return '<path d="M' + x + ' 420Q' + (x - 30) + ' ' + (420 - h / 2) + ' ' + x + ' ' + (420 - h) + 'Q' + (x + 30) + ' ' + (420 - h / 2) + ' ' + (x + 16) + ' 420Z" fill="' + c + '"' + s(4) + '/>'; };
      var fish = function (x, y, c, k) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><path d="M-40 0Q0 -30 30 0Q0 30 -40 0Z" fill="' + c + '"' + s(4) + '/><path d="M30 0L56 -18V18Z" fill="' + c + '"' + s(4) + '/><circle cx="-18" cy="-4" r="5" fill="' + INK + '"/></g>'; };
      return rect(0, 0, 1600, 500, '#3FA7D6') + rect(0, 0, 1600, 40, '#5DBBE3') + weed(140, 240, '#2E8B57') + weed(200, 160, '#3FAE6E') + weed(1380, 260, '#2E8B57') + weed(1450, 170, '#3FAE6E') +
        fish(560, 140, '#FF9600', 1) + fish(1080, 230, '#FFC800', 0.8) + fish(330, 300, '#FF86D0', 0.7) +
        circles([[720, 80, 10], [740, 40, 7], [1250, 120, 12], [1270, 80, 8], [900, 300, 9]], 'none', ' stroke="#FFFFFF" stroke-width="4"') + floor('#F3D89A', '#C9AC66');
    }],
    ['forest', 'Forest', false, function () {
      return rect(0, 0, 1600, 500, '#D7F2FF') + '<path d="M0 420Q200 280 420 360T880 330T1300 350T1600 300V420Z" fill="#9ED96C"' + s(4) + '/>' +
        tree(110, 420, 1.1, '#3E9B4F') + tree(330, 420, 0.8, '#4CB944') + tree(1250, 420, 1, '#3E9B4F') + tree(1460, 420, 1.2, '#4CB944') + tree(600, 400, 0.55, '#3E9B4F') + tree(1000, 400, 0.6, '#3E9B4F') +
        '<path d="M760 80q20 -24 50 -10q20 -26 50 0q30 -6 30 20H740q-6 -16 20 -10Z" fill="#FFFFFF"' + s(4) + '/>' + floor('#7CC36A', '#4E8F3E');
    }],
    ['city', 'City', false, function () {
      var b = [[60, 170, 160, '#5B6B8C'], [240, 110, 120, '#36486B'], [380, 210, 150, '#5B6B8C'], [560, 140, 110, '#36486B'], [1000, 160, 140, '#36486B'], [1160, 100, 120, '#5B6B8C'], [1300, 200, 130, '#36486B'], [1450, 150, 140, '#5B6B8C']];
      var out = rect(0, 0, 1600, 500, '#FFD8A8') + '<circle cx="800" cy="210" r="90" fill="#FF9600"' + s(5) + '/>';
      b.forEach(function (x) {
        out += rect(x[0], x[1], x[2], 420 - x[1], x[3], s(4));
        for (var yy = x[1] + 24; yy < 390; yy += 46) for (var xx = x[0] + 20; xx < x[0] + x[2] - 30; xx += 40) out += rect(xx, yy, 18, 22, (xx + yy) % 3 ? '#FFC800' : '#24344F');
      });
      return out + floor('#4B5563', INK) + line('M40 460H140M240 460H340M440 460H540M640 460H740M840 460H940M1040 460H1140M1240 460H1340M1440 460H1540', 6).replace(INK, '#FFFFFF');
    }],
    ['snow', 'Snow', false, function () {
      var flakes = circles([[100, 60, 6], [300, 140, 5], [520, 50, 7], [700, 160, 5], [900, 70, 6], [1120, 140, 5], [1340, 60, 7], [1500, 150, 6], [420, 260, 5], [1240, 260, 6]], '#FFFFFF', s(2));
      return rect(0, 0, 1600, 500, '#DCEBF5') + '<path d="M0 420L300 170L560 420Z" fill="#B9CFE0"' + s(4) + '/><path d="M300 170L360 220L330 240L290 210L250 245L232 227Z" fill="#FFFFFF"' + s(3) + '/>' +
        '<path d="M1000 420L1300 120L1600 420Z" fill="#9FB8CC"' + s(4) + '/><path d="M1300 120L1370 190L1330 205L1300 180L1260 210L1232 188Z" fill="#FFFFFF"' + s(3) + '/>' + flakes + floor('#FFFFFF', '#9FB8CC') + line('M0 448H1600', 3).replace(INK, '#C9DBE8');
    }],
    ['volcano', 'Volcano', false, function () {
      return rect(0, 0, 1600, 500, '#FFC59A') + circles([[700, 70, 40], [760, 40, 34], [820, 76, 30], [640, 100, 26]], '#B7B0AA', s(4)) +
        '<path d="M380 420L700 150H900L1220 420Z" fill="#6B4A3A"' + s(5) + '/><path d="M700 150H900L860 200L820 180L790 230L760 185L730 205Z" fill="#FF6B2C"' + s(4) + '/>' +
        '<path d="M790 230Q780 300 800 340Q770 300 760 260" fill="#FF6B2C"' + s(3) + '/>' + floor('#4A3A33', INK) + circles([[200, 455, 14], [1320, 465, 18], [1500, 450, 10]], '#6B4A3A');
    }],
    ['pitch', 'GAA pitch', false, function () {
      var crowd = '';
      for (var r = 0; r < 3; r++) for (var i = 0; i < 40; i++) crowd += '<circle cx="' + (20 + i * 40 + (r % 2) * 20) + '" cy="' + (150 + r * 34) + '" r="12" fill="' + ['#FF4B4B', '#FFC800', '#1CB0F6', '#FFFFFF', '#CE82FF'][(i * 7 + r * 3) % 5] + '"/>';
      return rect(0, 0, 1600, 500, '#CDEBFA') + rect(0, 120, 1600, 130, '#5B6B8C', s(4)) + crowd + rect(0, 250, 1600, 170, '#6DBE45') + line('M0 330H1600', 4).replace(INK, '#FFFFFF') +
        '<path d="M1340 420V180M1440 420V180M1340 330H1440" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M160 420V180M260 420V180M160 330H260" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>' + floor('#5DAE38', '#3D7F22');
    }]
  ];
  // Design your own place: the sky, the ground, what's behind, what's in the sky.
  var SKIES = [['#CDEBFA', 'Day'], ['#FFD8A8', 'Sunset'], ['#1B2A4A', 'Night'], ['#14213D', 'Space'], ['#E3F5E1', 'Mint'], ['#FFE3E8', 'Pink']];
  var GROUNDS = [['#7CC36A', 'Grass', '#4E8F3E'], ['#F6D58E', 'Sand', '#C9AC66'], ['#FFFFFF', 'Snow', '#9FB8CC'], ['#C7A27C', 'Wood', INK], ['#9AA8B5', 'Stone', '#5B6B8C'], ['#4B5563', 'Road', INK]];
  var BEHIND = [
    ['none', 'Nothing', function () { return ''; }],
    ['hills', 'Hills', function () { return '<path d="M0 420Q200 280 420 360T880 330T1300 350T1600 300V420Z" fill="#9ED96C"' + s(4) + '/><path d="M0 420Q300 340 600 400T1200 380T1600 400V420Z" fill="#7CC36A"' + s(4) + '/>'; }],
    ['mountains', 'Mountains', function () {
      return '<path d="M0 420L300 170L560 420Z" fill="#B9CFE0"' + s(4) + '/><path d="M300 170L360 220L330 240L290 210L250 245L232 227Z" fill="#FFFFFF"' + s(3) + '/>' +
        '<path d="M520 420L800 200L1080 420Z" fill="#A7BED1"' + s(4) + '/><path d="M1000 420L1300 120L1600 420Z" fill="#9FB8CC"' + s(4) + '/><path d="M1300 120L1370 190L1330 205L1300 180L1260 210L1232 188Z" fill="#FFFFFF"' + s(3) + '/>';
    }],
    ['city', 'City', function () {
      var out = '';
      [[60, 170, 160, '#5B6B8C'], [240, 110, 120, '#36486B'], [380, 210, 150, '#5B6B8C'], [560, 140, 110, '#36486B'], [700, 230, 120, '#5B6B8C'], [1000, 160, 140, '#36486B'], [1160, 100, 120, '#5B6B8C'], [1300, 200, 130, '#36486B'], [1450, 150, 140, '#5B6B8C']].forEach(function (x) {
        out += rect(x[0], x[1], x[2], 420 - x[1], x[3], s(4));
        for (var yy = x[1] + 24; yy < 390; yy += 46) for (var xx = x[0] + 20; xx < x[0] + x[2] - 30; xx += 40) out += rect(xx, yy, 18, 22, (xx + yy) % 3 ? '#FFC800' : '#24344F');
      });
      return out;
    }],
    ['trees', 'Trees', function () { return tree(110, 420, 1.1, '#3E9B4F') + tree(330, 420, 0.8, '#4CB944') + tree(600, 420, 0.6, '#3E9B4F') + tree(1000, 420, 0.7, '#4CB944') + tree(1250, 420, 1, '#3E9B4F') + tree(1460, 420, 1.2, '#4CB944'); }],
    ['sea', 'Sea', function () { return rect(0, 300, 1600, 120, '#59B8E6') + line('M100 340q30 -16 60 0t60 0M600 370q30 -16 60 0t60 0M1100 335q30 -16 60 0t60 0', 4).replace(INK, '#FFFFFF'); }],
    ['volcano', 'Volcano', function () {
      return circles([[700, 70, 40], [760, 40, 34], [820, 76, 30]], '#B7B0AA', s(4)) + '<path d="M380 420L700 150H900L1220 420Z" fill="#6B4A3A"' + s(5) + '/><path d="M700 150H900L860 200L820 180L790 230L760 185L730 205Z" fill="#FF6B2C"' + s(4) + '/>';
    }]
  ];
  var ABOVE = [
    ['none', 'Nothing', function () { return ''; }],
    ['sun', 'Sun', function () { return '<circle cx="1300" cy="100" r="58" fill="#FFC800"' + s(5) + '/>'; }],
    ['moon', 'Moon', function () { return '<circle cx="1180" cy="110" r="56" fill="#F6F0C8"' + s(5) + '/><circle cx="1160" cy="96" r="10" fill="#E6DCA8"/><circle cx="1200" cy="128" r="7" fill="#E6DCA8"/>'; }],
    ['clouds', 'Clouds', function () {
      return [[200, 90, 1], [760, 60, 0.8], [1250, 110, 1.1]].map(function (c) {
        return '<path transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')" d="M-60 30A28 28 0 0 1 -44 -14A36 36 0 0 1 10 -30A32 32 0 0 1 56 -2A26 26 0 0 1 52 40H-46A22 22 0 0 1 -60 30Z" fill="#FFFFFF"' + s(5) + '/>';
      }).join('');
    }],
    ['stars', 'Stars', function () { var out = ''; for (var i = 0; i < 46; i++) out += '<circle cx="' + ((i * 349) % 1600) + '" cy="' + (20 + (i * 137) % 260) + '" r="' + (2 + i % 3) + '" fill="#FFFFFF"/>'; return out; }],
    ['rainbow', 'Rainbow', function () {
      return ['#FF4B4B', '#FF9600', '#FFC800', '#58CC02', '#1CB0F6', '#CE82FF'].map(function (c, i) { var r = 330 - i * 18; return '<path d="M' + (1150 - r) + ' 420A' + r + ' ' + r + ' 0 0 1 ' + (1150 + r) + ' 420" fill="none" stroke="' + c + '" stroke-width="18"/>'; }).join('');
    }]
  ];
  var PLACE_PARTS = { sky: SKIES.map(function (x) { return x[1]; }), ground: GROUNDS.map(function (x) { return x[1]; }), behind: BEHIND.map(function (x) { return x[1]; }), above: ABOVE.map(function (x) { return x[1]; }),
    skyColours: SKIES.map(function (x) { return x[0]; }), groundColours: GROUNDS.map(function (x) { return x[0]; }) };
  function placeDark(pd) { return pd[0] === 2 || pd[0] === 3; }
  function builtPlace(pd) {
    var g = GROUNDS[pd[1]] || GROUNDS[0];
    return rect(0, 0, 1600, 500, (SKIES[pd[0]] || SKIES[0])[0]) + (ABOVE[pd[3]] || ABOVE[0])[2]() + (BEHIND[pd[2]] || BEHIND[0])[2]() + floor(g[0], g[2]);
  }
  function placeSvg(id, pd) {
    var p = id === 'make' ? null : PLACES.filter(function (x) { return x[0] === id; })[0] || PLACES[0];
    return '<svg class="mk-place" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + (p ? p[3]() : builtPlace(pd || [0, 0, 1, 1])) + '</svg>';
  }

  // ======================================================================== things (stickers)
  // Drawn in -30..30, standing on y = 28 (things that float say so).
  var THINGS = [
    ['plant', 'Plant', function () { return '<path d="M-14 6H14L10 28H-10Z" fill="#FF9600"' + s() + '/><path d="M0 6Q-20 -6 -18 -24Q-4 -18 0 6Q4 -26 18 -22Q20 -4 0 6Z" fill="#4CB944"' + s() + '/>'; }],
    ['tree', 'Tree', function () { return rect(-4, 4, 8, 24, '#8B5E3C', s()) + '<circle cx="0" cy="-8" r="18" fill="#4CB944"' + s() + '/><circle cx="-6" cy="-12" r="4" fill="#3E9B4F"/><circle cx="8" cy="-4" r="3" fill="#3E9B4F"/>'; }],
    ['cactus', 'Cactus', function () { return '<path d="M-6 28V-18A6 6 0 0 1 6 -18V28Z M-6 6H-14A4 4 0 0 1 -18 2V-8A4 4 0 0 1 -10 -8V-2H-6 M6 0H14V-12A4 4 0 0 1 22 -12V2A4 4 0 0 1 18 6H6" fill="#3FAE6E"' + s() + '/>' + rect(-12, 20, 24, 8, '#FF9600', s()); }],
    ['mushroom', 'Mushroom', function () { return rect(-6, 4, 12, 24, '#F4E6C8', s() + ' rx="4"') + '<path d="M-22 6C-22 -14 -10 -20 0 -20C10 -20 22 -14 22 6Z" fill="#FF4B4B"' + s() + '/><circle cx="-9" cy="-8" r="3.6" fill="#FFFFFF"/><circle cx="8" cy="-10" r="3" fill="#FFFFFF"/><circle cx="2" cy="0" r="2.6" fill="#FFFFFF"/>'; }],
    ['rock', 'Rock', function () { return '<path d="M-24 28L-18 8L-6 0L10 2L22 14L24 28Z" fill="#9AA8B5"' + s() + '/><path d="M-6 10L2 8" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'; }],
    ['flag', 'Flag', function () { return line('M-12 28V-24', 3.4) + '<path d="M-12 -24H18L12 -14L18 -4H-12Z" fill="#FF4B4B"' + s(2.6) + '/>'; }],
    ['trophy', 'Trophy', function () { return '<path d="M-14 -20H14V-6A14 14 0 0 1 -14 -6Z" fill="#FFC800"' + s() + '/><path d="M-14 -16H-22V-10A8 8 0 0 0 -12 -2M14 -16H22V-10A8 8 0 0 1 12 -2" fill="none"' + s(2.6) + '/>' + rect(-4, 6, 8, 12, '#FFC800', s()) + rect(-14, 18, 28, 10, '#8B5E3C', s() + ' rx="2"'); }],
    ['books', 'Books', function () { return rect(-20, 18, 40, 10, '#1CB0F6', s() + ' rx="2"') + rect(-16, 8, 34, 10, '#FF4B4B', s() + ' rx="2"') + rect(-18, -2, 36, 10, '#FFC800', s() + ' rx="2"') + rect(-12, -12, 28, 10, '#CE82FF', s() + ' rx="2"'); }],
    ['apple', 'Apple', function () { return '<path d="M0 -6C-10 -14 -24 -8 -22 8C-20 22 -10 30 0 26C10 30 20 22 22 8C24 -8 10 -14 0 -6Z" fill="#FF4B4B"' + s() + '/>' + line('M0 -6V-16', 3) + '<path d="M2 -14Q12 -22 16 -14Q8 -8 2 -14Z" fill="#4CB944"' + s(2.4) + '/>'; }],
    ['flask', 'Flask', function () { return '<path d="M-6 -24H6V-6L20 22A4 4 0 0 1 16 28H-16A4 4 0 0 1 -20 22L-6 -6Z" fill="#FFFFFF"' + s() + '/><path d="M-12 10H12L18 22A3 3 0 0 1 15 26H-15A3 3 0 0 1 -18 22Z" fill="#2BD4BD"/>' + line('M-9 -24H9', 3); }],
    ['microscope', 'Microscope', function () { return rect(-20, 22, 40, 6, '#5B6B8C', s()) + '<path d="M-4 22V12H10" fill="none"' + s(3) + '/><path d="M-2 -22L8 -26L18 4L8 8Z" fill="#1CB0F6"' + s() + '/>' + rect(-14, 6, 26, 5, '#5B6B8C', s(2.4)) + '<path d="M10 -2Q22 6 14 22" fill="none"' + s(3) + '/>'; }],
    ['heart', 'Heart', function () { return '<path d="M0 26C-12 18 -26 8 -26 -6C-26 -16 -18 -22 -11 -22C-5 -22 -1 -18 0 -14C1 -18 5 -22 11 -22C18 -22 26 -16 26 -6C26 8 12 18 0 26Z" fill="#FF4B4B"' + s() + '/>'; }],
    ['lungs', 'Lungs', function () { return line('M0 -26V-10M0 -10L-7 -4M0 -10L7 -4', 3.4) + '<path d="M-3 -6C-6 -16 -20 -14 -22 0C-24 14 -21 24 -10 24C-3 24 -2 18 -2 8Z" fill="#FF86D0"' + s() + '/><path d="M3 -6C6 -16 20 -14 22 0C24 14 21 24 10 24C3 24 2 18 2 8Z" fill="#FF86D0"' + s() + '/>'; }],
    ['dna', 'DNA', function () {
      var a = '', b = '', rungs = '';
      for (var i = 0; i <= 12; i++) { var y = -26 + i * 4.5, x = 12 * Math.sin(i / 12 * Math.PI * 2); a += (i ? 'L' : 'M') + n(x) + ' ' + n(y); b += (i ? 'L' : 'M') + n(-x) + ' ' + n(y); if (i % 2) rungs += '<path d="M' + n(x) + ' ' + n(y) + 'L' + n(-x) + ' ' + n(y) + '" stroke="' + ['#FFC800', '#FF4B4B', '#1CB0F6'][i % 3] + '" stroke-width="3"/>'; }
      return rungs + line(a, 3.4) + line(b, 3.4);
    }],
    ['star', 'Star', function () { return star(0, 0, 24, '#FFC800', 3); }],
    ['cloud', 'Cloud', function () { return '<path d="M-24 10A10 10 0 0 1 -18 -8A13 13 0 0 1 4 -14A12 12 0 0 1 22 -2A10 10 0 0 1 20 16H-18A8 8 0 0 1 -24 10Z" fill="#FFFFFF"' + s() + '/>'; }],
    ['sun', 'Sun', function () { var r = ''; for (var i = 0; i < 8; i++) { var a = i * 45 * Math.PI / 180; r += line('M' + n(17 * Math.cos(a)) + ' ' + n(17 * Math.sin(a)) + 'L' + n(26 * Math.cos(a)) + ' ' + n(26 * Math.sin(a)), 3.4); } return r + '<circle r="13" fill="#FFC800"' + s() + '/>'; }],
    ['moon', 'Moon', function () { return '<path d="M8 -22A22 22 0 1 0 22 10A16 16 0 1 1 8 -22Z" fill="#F6F0C8"' + s() + '/>'; }],
    ['balloon', 'Balloon', function () { return line('M0 14Q-6 20 0 28', 2) + '<ellipse cx="0" cy="-8" rx="15" ry="19" fill="#CE82FF"' + s() + '/><path d="M-3 10H3L0 14Z" fill="#CE82FF"' + s(2) + '/>'; }],
    ['duck', 'Rubber duck', function () { return '<path d="M-22 10C-24 26 20 30 22 14C22 4 12 2 6 6C10 -2 8 -14 -4 -14C-14 -14 -18 -4 -12 4C-18 2 -22 4 -22 10Z" fill="#FFC800"' + s() + '/><path d="M6 -8L16 -6L6 -2Z" fill="#FF9600"' + s(2) + '/><circle cx="-2" cy="-7" r="2.4" fill="' + INK + '"/>'; }]
  ];
  var FLOATS = { star: 1, cloud: 1, sun: 1, moon: 1, balloon: 1 };
  function thingSvg(id) {
    var t = THINGS.filter(function (x) { return x[0] === id; })[0] || THINGS[0];
    return '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + t[2]() + '</svg>';
  }

  function list(rows) { return rows.map(function (r) { return { id: r[0], name: r[1] }; }); }
  window.BioMakerArt = {
    INK: INK, colours: COLOURS, colourNames: COLOUR_NAMES, tone: tone,
    players: list(PLAYERS), playerColour: PLAYER_COLOUR, playerSvg: playerSvg,
    parts: PARTS, partName: partName, partSvg: partSvg,
    rivals: list(RIVALS), rivalSvg: rivalSvg,
    places: PLACES.map(function (p) { return { id: p[0], name: p[1], dark: p[2] }; }), placeSvg: placeSvg, placeParts: PLACE_PARTS, placeDark: placeDark,
    things: THINGS.map(function (t) { return { id: t[0], name: t[1], floats: Boolean(FLOATS[t[0]]) }; }), thingSvg: thingSvg
  };
})();

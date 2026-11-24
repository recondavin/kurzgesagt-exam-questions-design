// Computer Science questions for the games built for Biology (the user: "build computer science on the site ... and
// add minigames"): window.BoardDeck for bio/bio-board.js, which Mini Golf, Pool, the Trivia board, Outrun the
// Examiner, Points Grid, Sea Battle, Cannon Duel and Topple the Examiner all ask from. Load after cs/cs-cards.js
// (built by tools/cs/build_cards.py from tools/cs/cards/*.json), before bio/bio-board.js.
// The cards are the real Higher Level exam parts (2020-2025) on chapters 6 and 7 as four-option questions: the right
// answer and three wrong ones that are real misconceptions; the why is the scheme's reasoning, the hook a way to
// remember it. Five slots under the board's keys (28-32). ?warm on the page's address plays the warm-up cards.
(function () {
  'use strict';
  var WARM = /[?&]warm\b/.test(location.search);
  var C = (WARM ? window.CsWarm : window.CsCards) || {};
  var NAMES = { 28: 'Computer systems', 29: 'Logic and electronics', 30: 'OS and the Internet', 31: 'Algorithms', 32: 'Data and databases' };
  // Never green or red (right and wrong in the games).
  var COLS = { 28: '#1CB0F6', 29: '#FFC800', 30: '#FF9600', 31: '#CE82FF', 32: '#2BD4BD' };
  function items() {
    var out = [];
    Object.keys(C).forEach(function (slot) {
      (C[slot] || []).forEach(function (c) {
        var q = (WARM ? 'Warm-up · ' : String(c.from).slice(0, 4) + ' exam · ') + c.q;
        out.push({ ch: +slot, src: 'cs', qid: c.id, k: 0, text: q,
          c: { q: q, right: c.right, wrong: c.wrong.slice(), why: c.why, hook: c.hook || '', keys: c.keys || [] } });
      });
    });
    return out;
  }
  window.BoardDeck = {
    chapters: [28, 29, 30, 31, 32], names: NAMES, colours: COLS, items: items, level: WARM ? 'warm' : 'exam',
    memory: WARM ? 'cs-warm-drill' : 'cs-drill', prefix: WARM ? 'cs-warm-' : 'cs-', all: WARM ? 'All the warm-ups' : 'All of Computer Science',
    holes: ['The CPU', 'The logic gate', 'The router', 'The flowchart', 'The byte'],
    moreHoles: [{ name: 'The bus', ch: 28 }, { name: 'The truth table', ch: 29 }, { name: 'The packet', ch: 30 }, { name: 'The binary search', ch: 31 }, { name: 'The pixel', ch: 32 }],
    texts: []
  };
})();

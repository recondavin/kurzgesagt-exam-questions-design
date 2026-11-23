// Maths questions for the games built for Biology (Mini Golf, Pool; the user: "maybe minigames with exam questions
// also?"): window.BoardDeck for bio/bio-board.js, which bio/bio-golf.js and bio/bio-pool.js ask from.
// Load after maths/maths-cards.js (built by tools/maths/build_cards.py from tools/maths/cards/*.json, written to
// tools/maths/GAMES.md), before bio/bio-board.js (maths-golf.html, maths-pool.html).
// The cards are the real Ordinary Level exam questions 2015-2025 as four-option questions: the right answer, and three
// wrong ones that are the mistakes students really make on that part; the why is the working, the hook a way to
// remember it. Five slots under the board's keys (28-32): calculus, applied measure, counting, probability, statistics.
(function () {
  'use strict';
  var C = window.MathsCards || {};
  var SLOT = { 10: 28, 11: 29, 12: 30, 13: 31, 14: 32 };
  var NAMES = { 28: 'Calculus', 29: 'Applied measure', 30: 'Counting', 31: 'Probability', 32: 'Statistics' };
  // Never green or red (right and wrong in the games).
  var COLS = { 28: '#1CB0F6', 29: '#FF9600', 30: '#CE82FF', 31: '#FF86D0', 32: '#2BD4BD' };
  function items() {
    var out = [];
    Object.keys(C).forEach(function (ch) {
      var slot = SLOT[ch];
      if (!slot) return;
      (C[ch] || []).forEach(function (c) {
        // The year it was asked, so it reads as the exam question it is.
        var q = String(c.from).slice(0, 4) + ' exam · ' + c.q;
        out.push({ ch: slot, src: 'maths', qid: c.id, k: 0, text: q,
          c: { q: q, right: c.right, wrong: c.wrong.slice(), why: c.why, hook: c.hook || '', keys: c.keys || [] } });
      });
    });
    return out;
  }
  window.BoardDeck = {
    chapters: [28, 29, 30, 31, 32], names: NAMES, colours: COLS, items: items, memory: 'maths-drill', prefix: 'maths-', all: 'All of Maths',
    // the first five holes keep their shapes, named for Maths; then five more
    holes: ['The parabola', 'The cylinder', 'The password', 'The spinner', 'The bell curve'],
    moreHoles: [{ name: 'The tangent', ch: 28 }, { name: 'The cone', ch: 29 }, { name: 'The arrangement', ch: 30 }, { name: 'The dice', ch: 31 }, { name: 'The scatter', ch: 32 }],
    texts: []
  };
})();

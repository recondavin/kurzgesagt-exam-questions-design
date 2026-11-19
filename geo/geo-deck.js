// Geography questions for the games built for Biology (Mini Golf, Pool: the user, "make games now", "including mini
// golf with more levels"): window.BoardDeck for bio/bio-board.js, which bio/bio-golf.js and bio/bio-pool.js ask from.
// Load after geo/geo-mark.js and the banks (geo/data/*.js), before bio/bio-board.js (geo-golf.html, geo-pool.html).
// Five slots under the board's keys (28-32): the restless earth, rocks, landforms, weathering/karst/slopes, British India.
// Questions, all from the banks (so every answer is a checked model point):
//   Which one gets the 2 marks?   the point's own question; right: its model sentence; wrong: its vague and wrong
//                                  versions and another point's wrong version
//   Is it true?                    the point's wrong version: what's wrong with it (right: the point's why)
//   An example of what?            a named example: which landform or process it is an example of
//   Which essay?                   a point: which kind of essay it earns marks in
(function () {
  'use strict';
  var M = window.GeoMark;
  if (!M) return;
  var G = M.index();
  var SLOT = { plates: 28, quakes: 28, volcanoes: 28, deform: 28, isostasy: 28, rocks: 29, landscape: 29, rockuse: 29,
    landforms: 30, weathering: 31, karst: 31, massmove: 31, surfacehuman: 31, india: 32 };
  var NAMES = { 28: 'The restless earth', 29: 'Rocks', 30: 'Landforms', 31: 'Weathering, karst and slopes', 32: 'British India' };
  // Never green or red (right and wrong in the games).
  var COLS = { 28: '#1CB0F6', 29: '#FF9600', 30: '#2BD4BD', 31: '#CE82FF', 32: '#FFC800' };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function item(ch, id, text, right, wrong, why) {
    return { ch: ch, src: 'geo', qid: id, k: 0, text: text, c: { q: text, right: right, wrong: wrong, why: why } };
  }
  // For each SRP, the options (landform, process...) it belongs to, with their part's other options.
  var OPTS = {};
  Object.keys(G.essay).forEach(function (eid) {
    (G.essay[eid].parts || []).forEach(function (p) {
      (p.opts || []).forEach(function (o) {
        (o.srps || []).forEach(function (id) { (OPTS[id] = OPTS[id] || []).push({ o: o, all: p.opts }); });
      });
    });
  });
  function items() {
    var out = [];
    G.topics.forEach(function (t) {
      var ch = SLOT[t.id];
      if (!ch) return;
      var withW = t.srps.filter(function (s) { return s.w && s.v; });
      t.srps.forEach(function (s) {
        if (!s.t || !s.v || !s.w) return;
        var other = shuffle(withW.filter(function (o) { return o !== s && o.w !== s.w; }))[0];
        out.push(item(ch, s.id + ':best', s.c[0] + ' Which one gets the 2 marks?', s.t, [s.v, s.w].concat(other ? [other.w] : []), s.t));
        // what's wrong with the wrong version: its why, against other points' whys
        var whys = shuffle(t.srps.filter(function (o) { return o !== s && o.why && o.why !== s.why; })).slice(0, 3).map(function (o) { return o.why; });
        if (whys.length === 3) out.push(item(ch, s.id + ':why', 'What is wrong with this? "' + s.w + '"', s.why, whys, s.t));
        // a named example: which landform or process
        var os = OPTS[s.id] || [];
        if (s.x && os.length) {
          var names = {}; os.forEach(function (x) { names[x.o.name] = 1; });
          var right = os[0].o.name, wrong = shuffle(os[0].all.filter(function (o) { return !names[o.name]; })).slice(0, 3).map(function (o) { return o.name; });
          // not when the sentence itself names the answer ("Where a U-shaped valley was drowned...")
          var give = s.t.toLowerCase().indexOf(right.toLowerCase().split(/[ (,]/)[0].replace(/-shaped$/, '')) >= 0;
          if (wrong.length === 3 && !give) out.push(item(ch, s.id + ':ex', s.t.replace(/\.$/, '') + '. This is an example of which one?', right, wrong, s.t));
        }
        // which kind of essay it earns marks in
        var mine = s.essays || [];
        if (mine.length) {
          var e = G.essay[mine[0]], nots = shuffle(Object.keys(G.essay).filter(function (id) { return mine.indexOf(id) < 0 && G.essay[id].name !== e.name; })).slice(0, 3).map(function (id) { return G.essay[id].name; });
          out.push(item(ch, s.id + ':essay', '"' + s.t + '" Which essay does this point earn marks in?', e.name, nots, s.t + ' (' + e.name + ')'));
        }
      });
    });
    return out;
  }
  window.BoardDeck = {
    chapters: [28, 29, 30, 31, 32], names: NAMES, colours: COLS, items: items, memory: 'geo-drill', prefix: 'geo-', all: 'All of Geography',
    // the first five holes keep their shapes, named for Geography; then five more landform holes
    holes: ['The rift', 'The batholith', 'The river', 'The swallow hole', 'The railway'],
    moreHoles: [{ name: 'The volcano', ch: 28 }, { name: 'The oxbow', ch: 30 }, { name: 'The drumlins', ch: 30 }, { name: 'The spit', ch: 30 }, { name: 'The fault', ch: 28 }],
    texts: []
  };
})();

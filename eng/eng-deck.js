// English questions for the games built for Biology (the user: "do it in golf and pool that we ALREADY BUILT"):
// window.BoardDeck for bio/bio-board.js, which bio/bio-golf.js and bio/bio-pool.js ask from. Load after
// eng/eng-data.js and before bio/bio-board.js (eng-golf.html, eng-pool.html).
// Five slots under the board's keys (28-32): your three texts (their key moments' chains: what a moment shows, what it
// leads to; the other moments of the same text are the wrong answers), Comparing (Link it: the linking phrase that
// fits) and Say it well (a plain phrase's exam version). Your texts are the three picked on english.html.
(function () {
  'use strict';
  var D = window.EngData;
  if (!D) return;
  var SLOTS = [28, 29, 30, 31, 32];
  // Never green or red (right and wrong in the games).
  var TEXT_COL = { sive: '#FF9600', othello: '#CE82FF', shawshank: '#1CB0F6', stlt: '#2BD4BD' };
  function chosen() {
    var v = [];
    try { v = JSON.parse(window.localStorage.getItem('eng-texts') || '[]'); } catch (e) {}
    v = (Array.isArray(v) ? v : []).filter(function (id) { return D.texts[id]; }).slice(0, 3);
    D.order.forEach(function (id) { if (v.length < 3 && v.indexOf(id) < 0) v.push(id); });
    return v;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function title(id) { return D.texts[id].title; }
  var mine = chosen();
  var names = {}, colours = {};
  mine.forEach(function (t, i) { names[SLOTS[i]] = title(t); colours[SLOTS[i]] = TEXT_COL[t]; });
  names[31] = 'Comparing'; colours[31] = '#FFC800';
  names[32] = 'Say it well'; colours[32] = '#FF86D0';
  function item(ch, id, text, right, wrong, why) {
    return { ch: ch, src: 'eng', qid: id, k: 0, text: text, c: { q: text, right: right, wrong: wrong, why: why } };
  }
  // Who's who questions on a text's people (all of them, or those in some moments): who they are, and who wants what.
  var FIND = { 'Seán Dóta': 'Seán Dóta', "Ellis 'Red' Redding": 'Red', 'The Duke of Venice': 'Duke', 'The Mother Superior': 'Mother Superior', 'The Furlong daughters': 'daughters|girls', "Sarah (Bill's mother)": "Bill's mother|his mother", 'Sarah Redmond': 'Sarah' };
  function findOf(c) { if (FIND[c.name]) return FIND[c.name]; var w = c.name.replace(/\s*\(.*\)/, '').split(' '); return /^(The|Mrs|Warden|Captain)$/.test(w[0]) ? w[w.length - 1] : w[0]; }
  function inThese(c, moments) { var re = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + findOf(c) + ')(?![A-Za-zÀ-ÿ])'); return moments.some(function (m) { return re.test(m.title + ' ' + m.what); }); }
  function castItems(t, ch, only) {
    var ppl = (D.texts[t].people || []).filter(function (c) { return c.tag; }), out = [];
    (only || ppl).forEach(function (c) {
      var rest = shuffle(ppl.filter(function (o) { return o !== c; })).slice(0, 3);
      out.push(item(ch, 'who:' + c.name, 'Who is ' + c.name + ' in ' + title(t) + '?', c.tag, rest.map(function (o) { return o.tag; }), c.name + ': ' + c.who + ' In the end: ' + c.end));
      out.push(item(ch, 'wants:' + c.name, 'In ' + title(t) + ', who wants this: ' + c.wants.charAt(0).toLowerCase() + c.wants.slice(1), c.name, rest.map(function (o) { return o.name; }), c.name + ' (' + c.tag + ') wants: ' + c.wants));
    });
    return out;
  }
  function items() {
    var out = [];
    mine.forEach(function (t, i) { out = out.concat(castItems(t, SLOTS[i])); });
    // Your texts: two questions a moment.
    mine.forEach(function (t, i) {
      var ms = (D.texts[t].moments || []).filter(function (m) { return m.chain; });
      ms.forEach(function (m) {
        ['shows', 'leads'].forEach(function (kind) {
          var wrong = shuffle(ms.filter(function (o) { return o.id !== m.id && o.chain[kind] !== m.chain[kind]; })).slice(0, 3).map(function (o) { return o.chain[kind]; });
          out.push(item(SLOTS[i], m.id + ':' + kind, m.title + ': ' + m.chain.happens + ' ' + (kind === 'shows' ? 'What does this show?' : 'What does it lead to?'),
            m.chain[kind], wrong, m.chain.happens + ' → ' + m.chain.shows + ' → ' + m.chain.leads));
        });
      });
    });
    // Comparing: the linking phrase between two texts' sentences (yours first, then the rest).
    var lang = {}, all = [];
    (D.comparative.language || []).forEach(function (g) { lang[g.id] = g.items; });
    var links = (D.games.link || []).filter(function (it) { return it.texts.every(function (x) { return mine.indexOf(x) >= 0; }); });
    if (links.length < 10) links = D.games.link || [];
    links.forEach(function (it, n) {
      // The wrong links are ones of the other kinds (a difference for a similarity...), sentence openers like the right one.
      var other = [];
      ['same', 'differ', 'degree'].forEach(function (r) { if (r !== it.rel) other = other.concat((lang[r] || []).filter(function (x) { return /^[A-Z]/.test(x) && /,$/.test(x); })); });
      var wrong = shuffle(other).slice(0, 3);
      out.push(item(31, 'link' + n, title(it.a.t) + ': ' + it.a.s + ' ' + title(it.b.t) + ': ___ ' + it.b.s + ' Which link fits?', it.link, wrong, it.why));
    });
    // Comparing, too: Build a point's steps (the sentence that anchors a point, then the one that compares), with its
    // traps as the wrong answers and one more from another item.
    var lv = (D.games.level || []).filter(function (it) { return it.texts.every(function (x) { return mine.indexOf(x) >= 0; }); });
    lv.forEach(function (it, n) {
      it.steps.forEach(function (st, k) {
        var traps = st.slice(1).map(function (o) { return o[0]; }), more = lv.filter(function (o) { return o !== it; }).map(function (o) { return o.steps[k][1][0]; });
        var wrong = traps.concat(shuffle(more).slice(0, 1)).filter(function (w) { return w !== st[0][0]; }).slice(0, 3);
        if (wrong.length < 3) return;
        out.push(item(31, it.id + ':' + k, 'Point: ' + it.statement + ' ' + (k ? 'Which sentence compares?' : 'Which sentence anchors it in a key moment?'), st[0][0], wrong,
          (k ? 'It brings in the other text on the same point, with a key moment.' : 'It names the moment and what happens in it, so the point is proven.') + (st[1][2] ? ' The trap: ' + st[1][2] : '')));
      });
    });
    // Say it well: a plain phrase's exam version.
    var U = D.comparative.upgrades || [];
    U.forEach(function (u, n) {
      var wrong = shuffle(U.filter(function (o) { return o !== u; })).slice(0, 3).map(function (o) { return o.exam[0]; });
      out.push(item(32, 'up' + n, 'The exam way to say "' + u.plain + '"?', u.exam[0], wrong, u.plain + ' → ' + u.exam.join(', ') + '. ' + u.eg));
    });
    return out;
  }
  // ---------- one text's story, start to finish (the user: "do one fully on the sive story") ----------
  // eng-golf.html?story=sive (and eng-pool.html): the five slots are five parts of the story in order, the holes named
  // after them, and every question is on that part: what happens, what it shows, what it leads to, why it matters,
  // and which moment a quote is from. The other moments of the text are the wrong answers.
  var STORY = {
    sive: [['The offer', 'sive-1', 'sive-3'], ['The match', 'sive-4', 'sive-6'], ['The pleas', 'sive-7', 'sive-8'], ['The letter', 'sive-9', 'sive-10'], ['The bog', 'sive-11', 'sive-12']]
  };
  var story = (/[?&]story=([a-z]+)/.exec(window.location.search) || [])[1];
  if (story && D.texts[story]) {
    var T = D.texts[story], ms = (T.moments || []).filter(function (m) { return m.chain; }), parts = STORY[story];
    if (!parts) {
      // Any other text: five parts of its moments in order, named after their first moment.
      var size = [], left = ms.length;
      for (var k = 0; k < 5; k++) { size.push(Math.ceil(left / (5 - k))); left -= size[k]; }
      var at = 0;
      parts = size.map(function (n) { var p = [ms[at].title, ms[at].id, ms[at + n - 1].id]; at += n; return p; });
    }
    var idx = function (id) { for (var i = 0; i < ms.length; i++) if (ms[i].id === id) return i; return -1; };
    var groups = parts.map(function (p) { return ms.slice(idx(p[1]), idx(p[2]) + 1); });
    var SCOL = ['#FF9600', '#FFC800', '#CE82FF', '#1CB0F6', '#FF86D0'], snames = {}, scols = {};
    // Each part is named ("The offer") on the question cards and in pool's picker; the golf hole is its scene.
    var scene = function (g) {
      var a = /^(Act \d+), Scene (\d+)$/.exec(g[0].where), b = /^(Act \d+), Scene (\d+)$/.exec(g[g.length - 1].where);
      return a && b && a[1] === b[1] && a[2] !== b[2] ? a[1] + ', Scenes ' + a[2] + '–' + b[2] : g[0].where;
    };
    SLOTS.forEach(function (c, i) { snames[c] = parts[i][0]; scols[c] = SCOL[i]; });
    var others = function (m, f) { return shuffle(ms.filter(function (o) { return o.id !== m.id && f(o) !== f(m); })).slice(0, 3).map(f); };
    var storyItems = function () {
      var out = [];
      var seen = {};
      groups.forEach(function (g, i) {
        // The people who first turn up in this part of the story.
        var fresh = (T.people || []).filter(function (c) { return c.tag && !seen[c.name] && inThese(c, g); });
        fresh.forEach(function (c) { seen[c.name] = 1; });
        out = out.concat(castItems(story, SLOTS[i], fresh));
        g.forEach(function (m) {
          var c = m.chain, ch = SLOTS[i], line = c.happens + ' → ' + c.shows + ' → ' + c.leads;
          out.push(item(ch, m.id + ':happens', 'What happens in "' + m.title + '"?', c.happens, others(m, function (o) { return o.chain.happens; }), line));
          out.push(item(ch, m.id + ':shows', m.title + ': ' + c.happens + ' What does this show?', c.shows, others(m, function (o) { return o.chain.shows; }), line));
          out.push(item(ch, m.id + ':leads', m.title + ': ' + c.happens + ' What does it lead to?', c.leads, others(m, function (o) { return o.chain.leads; }), line));
          out.push(item(ch, m.id + ':why', 'Why does "' + m.title + '" matter?', m.why, others(m, function (o) { return o.why; }), line));
          out.push(item(ch, m.id + ':which', 'Which moment shows this: ' + c.shows.charAt(0).toLowerCase() + c.shows.slice(1), m.title, others(m, function (o) { return o.title; }), m.where + ': ' + m.title + '. ' + line));
          if (m.quote) out.push(item(ch, m.id + ':quote', '"' + m.quote + '" Which moment is this from?', m.title, others(m, function (o) { return o.title; }), m.where + ': ' + m.title + '. ' + c.happens));
        });
      });
      return out;
    };
    window.BoardDeck = {
      chapters: SLOTS, names: snames, colours: scols, items: storyItems, memory: 'eng-drill', prefix: 'eng-' + story + '-', all: 'The whole story',
      holes: groups.map(scene), texts: [story], story: story,
      title: T.title + ': the whole story', sub: 'Five holes through ' + T.title + ', in order. A question on that part of the story before every putt.'
    };
    return;
  }

  window.BoardDeck = {
    chapters: SLOTS, names: names, colours: colours, items: items, memory: 'eng-drill', prefix: 'eng-', all: 'Everything',
    // The golf holes keep their shapes; these are their names here.
    holes: ['The fork', 'The bean', 'The switchback', 'The two rooms', 'The moving blocks'],
    texts: mine
  };
})();

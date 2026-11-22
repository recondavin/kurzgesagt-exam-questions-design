// The Scene board (english.html#board): a detective's corkboard. The user, of the first version: "nah put it on a
// bulletin board with strings like ur a detective figuring out whats what", "and u get to actually watch them too",
// "and u move the pins and strings urself", "and in teh descriptions of the scenes pt highlights on important parts
// like "better off parents" kind of highlight the giveaways". Content: eng/eng-themes.js.
//   Step by step  the board's default: one scene at a time, with a guide beside the board (know the scene, tie its
//               strings, see what holds and why), then Next scene. Free board is the board without the guide.
//   The board   a case: six scene photos and the eight theme cards pinned to cork. Drag a card to move it; drag from
//               a scene's pin to a theme (or tap one pin, then the other) to tie a string; tap a string to cut it.
//               Tap a scene for its case file: where, who, what happens with the giveaways highlighted, Watch, and
//               the themes it's tied to. Check: every string says whether it holds and why; missed ones are dashed.
//   By theme    the scenes that work for a theme in each text, what each one shows and the quote; the ones to skip.
//   By scene    one scene at a time, its giveaways named, everything it works for.
// eng.js calls EngBoard.render(app, args, api) from its router (#board, #board/theme/<id>, #board/scene/<id>).
(function () {
  'use strict';
  var T = window.EngThemes, D = window.EngData;
  if (!T || !D) return;
  var A = null, app = null, CASE_N = 12;
  var S = { mode: 'board', text: 'all', theme: 'power', scene: null, sel: null, arm: null, miss: false };
  var TH = {}; T.themes.forEach(function (t) { TH[t.id] = t; });
  // The themes on the board: the ones the exam has asked about (`came`), in that order (the user: "i think we should
  // prioritise what came up in comparitives"), or all of them with "All themes" (eng-cork-th). Everywhere else, all.
  var ALLTH = false;
  try { ALLTH = localStorage.getItem('eng-cork-th') === 'all'; } catch (e) {}
  function ON() { return S.mode === 'board' && !ALLTH ? T.themes.filter(function (t) { return t.came; }) : T.themes; }
  function onIds() { var o = {}; ON().forEach(function (t) { o[t.id] = true; }); return o; }
  var TAG = { power: 'Power', education: 'Education', women: 'Women', hope: 'Hope', freedom: 'Freedom', money: 'Money', class: 'Class', religion: 'Church', courage: 'Courage' };
  var LAY = {
    // laptops: the board the width of the window, as long as its cards need (the user: "no top scenes, then themes then
    // bottom senes", then "make the bulletin board longer and put a bit more detail in those cards"): six columns, a row
    // of scenes above the themes and a row below, cards with the picture, the title, who's there and what happens; the
    // full file opens beside the board
    wide: { W: 2058, sw: 320, gap: 18, tw: 210, th: 124, full: true },
    // phones: the same cards, two to a row (the user, of the small photo cards: "add a bit more detail to the scenes")
    narrow: { W: 620, H: 940, sw: 288, tw: 272, th: 100, full: true }
  };
  var C = null, DRAG = null, LAYN = 'wide', K = 1, AUTO = {}, HB = 0, TOPY = 74, TWN = 200, SEEN_BOARD = false;
  // How big the board is drawn on a laptop, as a share of the window's width (the user: "make the whole thing smaller"):
  // 85% to start, − and + beside the other controls change it (eng-cork-zoom). KF is the full width.
  var ZOOM = 0.85, KF = 1;
  // What the scene cards say (the user, of cards with every beat on them: "its what i had in mind but now its just too
  // much"): 'short', the scene in two or three sentences with its giveaways (EngThemes.gist), or 'full', who's there
  // and every beat. Short to start; Cards over the board changes it (eng-cork-detail). The case file always has it all.
  var DETAIL = 'short';
  // Step by step (the user: "make you need to connect strings scene by scene and its spread and theres a next scene
  // button and it really REALLY guides you through it like a learning experience"): on the board you take the case one
  // scene at a time, in story order, with a guide beside the board. Each scene has three steps: know the scene, tie
  // its strings (only that scene's pin ties; tap a theme or drag the pin), then check it and read why each string
  // holds or doesn't. Next scene cuts the strings that don't hold and ties the ones you missed (dashed), so the finished
  // board is right. Free board (eng-cork-mode) is the board without the guide. The walk-through is kept with the case:
  // C.g = { at: the scene's place in the case, step: 'read' | 'tie' | 'checked' | 'end', done: { scene: { p: the
  // themes you tied, ok, bad, miss, of } } }, and for this visit only hint, clued, msg (the hints) and look (a
  // finished scene you're looking back at).
  var GUIDE = true;
  try { if (localStorage.getItem('eng-cork-mode') === 'free') GUIDE = false; } catch (e) {}
  var SIDE_WAS = null, SHEET_LAST = '';
  try { if (localStorage.getItem('eng-cork-detail') === 'full') DETAIL = 'full'; } catch (e) {}
  try { var z0 = parseFloat(localStorage.getItem('eng-cork-zoom')); if (z0 >= 0.5 && z0 <= 1) ZOOM = z0; } catch (e) {}
  // where the top row starts, under the label strips (set per layout in corkHtml)

  function esc(s) { return A.esc(s); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function marks() { try { return JSON.parse(store('eng-board-scenes') || '{}') || {}; } catch (e) { return {}; } }
  function short(tid) { return { shawshank: 'Shawshank', sive: 'Sive', stlt: 'Small Things' }[tid] || A.text(tid).title; }
  function tidOf(mid) { return mid.replace(/-\d+$/, ''); }
  function mom(mid) { return A.text(tidOf(mid)).moments.filter(function (m) { return m.id === mid; })[0]; }
  function scenes(tid) {
    var out = [];
    T.texts.forEach(function (t) { if (tid === 'all' || tid === t) A.text(t).moments.forEach(function (m) { if (T.scenes[m.id]) out.push(m.id); }); });
    return out;
  }
  function cell(mid, th) { return T.scenes[mid].t[th] || null; }
  function isYes(mid, th) { var c = cell(mid, th); return !!(c && c[0] === 'yes'); }
  function yesOf(mid) { return ON().filter(function (t) { return isYes(mid, t.id); }); }
  function pic(mid) {
    var tid = tidOf(mid), all = A.pics(tid), q = all.filter(function (p) { return (p.scene != null ? p.scene : p.moment) === mid; })[0] || all.filter(function (p) { return p.hero; })[0] || all[0];
    return q ? 'assets/eng/img/' + q.file : '';
  }
  // the user: "why arent they organised by what text they are actually in": the texts in their order, each text's
  // scenes in the order they happen
  function sortIds(ids) {
    var at = function (mid) { var tid = tidOf(mid); return T.texts.indexOf(tid) * 100 + A.text(tid).moments.map(function (m) { return m.id; }).indexOf(mid); };
    return ids.slice().sort(function (a, b) { return at(a) - at(b); });
  }
  function hasClip(mid) { try { return !!(A.hasClip && A.hasClip(mid)); } catch (e) { return false; } }
  function canWatch(mid) { try { return !!(A.canWatch && A.canWatch(mid)); } catch (e) { return false; } }
  function noWhy(mid, th) {
    var y = yesOf(mid).map(function (t) { return t.name.toLowerCase(); });
    return 'Nothing in this scene is about ' + TH[th].name.toLowerCase() + '. It\'s a scene for ' + (y.length > 1 ? y.slice(0, -1).join(', ') + ' and ' + y[y.length - 1] : y[0]) + '.';
  }
  function quote(q) { return q ? '<q class="sb-q">' + esc(q) + '</q>' : ''; }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function sfx(name) { var k = window.ExamAnswerMode && window.ExamAnswerMode.kit; try { if (k) { if (name === 'ding') k.ding(3); else if (name === 'bonk') k.bonk(); else k.sfx(name, 0.5); } } catch (e) {} }

  // A scene's description with its giveaways highlighted; named (the themes they point to) once shown.
  function marked(mid, s, named) {
    var low = s.toLowerCase(), hits = [];
    (T.hl && T.hl[mid] || []).forEach(function (h) {
      var at = low.indexOf(h[0].toLowerCase());
      if (at >= 0 && !hits.some(function (x) { return at < x.b && at + h[0].length > x.a; })) hits.push({ a: at, b: at + h[0].length, th: h[1].split(' ') });
    });
    hits.sort(function (x, y) { return x.a - y.a; });
    var out = '', i = 0;
    hits.forEach(function (x) {
      out += esc(s.slice(i, x.a)) + '<mark class="cb-hl">' + esc(s.slice(x.a, x.b)) + '</mark>' +
        (named ? '<span class="cb-hl__t">' + x.th.map(function (t) { return esc(TAG[t] || t); }).join(' · ') + '</span>' : '');
      i = x.b;
    });
    return out + esc(s.slice(i));
  }
  function fixed(mid, named) {
    var m = mom(mid), s = T.scenes[mid];
    return '<dl class="sb-fix"><dt>Where</dt><dd>' + esc(m.where) + '</dd><dt>Who\'s there</dt><dd>' + esc(s.who) + '</dd><dt>What happens</dt><dd><ol>' +
      (m.tell || [m.what]).map(function (x) { return '<li>' + marked(mid, x, named) + '</li>'; }).join('') + '</ol></dd></dl>';
  }
  function watchBtn(mid, cls) {
    if (!canWatch(mid)) return '';
    return '<button type="button" class="' + (cls || 'sb-btn is-quiet') + '" data-cb-watch="' + mid + '"><i aria-hidden="true">▶</i> ' + (hasClip(mid) ? 'Watch the scene' : 'See the scene') + '</button>' +
      (hasClip(mid) ? '' : '<span class="cb-noclip">There\'s no clip of this one on YouTube, so it\'s told over a still.</span>');
  }
  // Why: what it works for, the strings that don't hold, the ones that touch it but have nothing to write.
  function why(mid, picks, play) {
    var yes = [], wrong = [], thin = [], none = [];
    ON().forEach(function (t) {
      var c = cell(mid, t.id), on = !!picks[t.id];
      if (c && c[0] === 'yes') yes.push('<li class="sb-why is-yes' + (play && !on ? ' is-miss' : '') + '"><p class="sb-why__h"><b>' + esc(t.name) + '</b>' +
        (play ? '<span>' + (on ? 'Your string holds' : 'You missed this one') + '</span>' : '') + '</p><p>' + esc(c[1]) + '</p>' + quote(c[2]) + '</li>');
      else if (play && on) wrong.push('<li class="sb-why is-wrong"><p class="sb-why__h"><b>' + esc(t.name) + '</b><span>This string doesn\'t hold</span></p><p>' + esc(c ? c[1] : noWhy(mid, t.id)) + '</p></li>');
      else if (c) thin.push('<li class="sb-why is-thin"><p class="sb-why__h"><b>' + esc(t.name) + '</b><span>Kind of, but skip it</span></p><p>' + esc(c[1]) + '</p></li>');
      else none.push(t.name);
    });
    return '<ol class="sb-whys">' + yes.join('') + wrong.join('') + thin.join('') + '</ol>' +
      (none.length ? '<p class="sb-none">Nothing to write for ' + esc(none.join(', ').replace(/, ([^,]*)$/, ' or $1')) + ': it isn\'t what this scene is about.</p>' : '');
  }

  // ---------- the page ----------
  function render(el, args, api) {
    A = api; app = el;
    args = args || [];
    if (args[0] === 'theme' && TH[args[1]]) { S.mode = 'theme'; S.theme = args[1]; }
    else if (args[0] === 'scene' && T.scenes[args[1]]) { S.mode = 'scene'; S.scene = args[1]; }
    if (!C) load();
    paint();
  }
  function head() {
    var tab = function (m, label) { return '<button type="button" class="sb-tab" data-sb-mode="' + m + '" aria-pressed="' + (S.mode === m) + '">' + label + '</button>'; };
    // the board two ways: with the guide, one scene at a time, or free
    var btab = function (gm, label) { return '<button type="button" class="sb-tab" data-sb-mode="board" data-cb-mode="' + gm + '" aria-pressed="' + (S.mode === 'board' && GUIDE === (gm === 'guide')) + '">' + label + '</button>'; };
    return A.title('Scene board') +
      '<div class="sb-tabs" role="group" aria-label="How to use the board">' + btab('guide', 'Step by step') + btab('free', 'Free board') + tab('theme', 'By theme') + tab('scene', 'By scene') + '</div>';
  }
  function textChips() {
    var chip = function (id, label) { return '<button type="button" class="sb-chip" data-sb-text="' + id + '" aria-pressed="' + (S.text === id) + '">' + esc(label) + '</button>'; };
    var per = function (n) { return '<button type="button" class="sb-chip" data-cb-per="' + n + '" aria-pressed="' + (CASE_N === n) + '">' + n + ' scenes</button>'; };
    return '<div class="sb-chips" role="group" aria-label="Which text">' + chip('all', 'All three') + T.texts.map(function (t) { return chip(t, short(t)); }).join('') +
      (S.mode === 'board' ? '<span class="sb-chips__gap" aria-hidden="true"></span><span class="sb-chips__k">On the board</span>' + per(12) + per(6) +
        (LAYN === 'wide' ? '<span class="sb-chips__gap" aria-hidden="true"></span><span class="sb-chips__k">Size</span><button type="button" class="sb-chip is-zoom" data-cb-zoom="-1" aria-label="Make the board smaller"' + (ZOOM <= 0.5 ? ' disabled' : '') + '>−</button><button type="button" class="sb-chip is-zoom" data-cb-zoom="1" aria-label="Make the board bigger"' + (ZOOM >= 1 ? ' disabled' : '') + '>+</button>' : '') +
        '<span class="sb-chips__gap" aria-hidden="true"></span><span class="sb-chips__k">Themes</span><button type="button" class="sb-chip" data-cb-th="past" aria-pressed="' + !ALLTH + '">From past papers</button>' +
        '<button type="button" class="sb-chip" data-cb-th="all" aria-pressed="' + ALLTH + '">All ' + T.themes.length + '</button>' : '') + '</div>';
  }
  // Short or full cards. It's drawn twice and CSS shows one: beside the case's name when the row of controls is wide
  // enough to hold everything on one line (there, it would push them onto two), and after Size when that row wraps.
  function cardsGrp(where) {
    var b = function (v, label) { return '<button type="button" class="sb-chip" data-cb-detail="' + v + '" aria-pressed="' + (DETAIL === v) + '">' + label + '</button>'; };
    return '<span class="cb-grp is-cards ' + where + '" role="group" aria-label="Cards"><span class="cb-grp__k">Cards</span>' + b('short', 'Short') + b('full', 'Full') + '</span>';
  }
  function boardTools() {
    var chip = function (id, label) { return '<button type="button" class="sb-chip" data-sb-text="' + id + '" aria-pressed="' + (S.text === id) + '">' + esc(label) + '</button>'; };
    var per = function (n) { return '<button type="button" class="sb-chip" data-cb-per="' + n + '" aria-pressed="' + (CASE_N === n) + '">' + n + '</button>'; };
    var grp = function (k, inner) { return '<span class="cb-grp" role="group" aria-label="' + esc(k) + '"><span class="cb-grp__k">' + esc(k) + '</span>' + inner + '</span>'; };
    return '<div class="cb-tools">' + grp('Texts', chip('all', 'All three') + T.texts.map(function (t) { return chip(t, short(t)); }).join('')) +
      grp('Scenes', per(12) + per(6)) +
      grp('Themes', '<button type="button" class="sb-chip" data-cb-th="past" aria-pressed="' + !ALLTH + '">From past papers</button><button type="button" class="sb-chip" data-cb-th="all" aria-pressed="' + ALLTH + '">All ' + T.themes.length + '</button>') +
      (LAYN === 'wide' && !coachSide() ? grp('Size', '<button type="button" class="sb-chip is-zoom" data-cb-zoom="-1" aria-label="Make the board smaller"' + (ZOOM <= 0.5 ? ' disabled' : '') + '>−</button><button type="button" class="sb-chip is-zoom" data-cb-zoom="1" aria-label="Make the board bigger"' + (ZOOM >= 1 ? ' disabled' : '') + '>+</button>') : '') + cardsGrp('is-cards-t') + '</div>';
  }
  function paint() {
    document.body.classList.toggle('eng-wall', S.mode === 'board');
    if (S.mode === 'board') {
      var co = app.querySelector('[data-cb-coach]'), ck = co && co.getAttribute('data-key'), ct = co ? co.scrollTop : 0;
      boardPass(); strings(); sideDraw(); frameIn();
      var co2 = app.querySelector('[data-cb-coach]'); if (co2 && ck && co2.getAttribute('data-key') === ck) co2.scrollTop = ct;
      return;
    }
    var h = head();
    if (S.mode === 'theme') h += themeHtml();
    else h += sceneHtml();
    app.innerHTML = '<div class="sb">' + h + '</div>';
  }

  // ---------- the case: the scenes on the board ----------
  // A case is one text's scenes in story order (the user: "make it all by scene automatically on the board", then
  // "make them automatically by what text they are in"): all twelve, or six at a time. With All three the cases go
  // through Shawshank, then Sive, then Small Things. Each case keeps its own strings and card positions
  // (eng-cork-case:<text>:<size>:<n>, see caseKey); eng-cork-at is the case you were on.
  function cases(tid) {
    if (tid === 'all') return T.texts.reduce(function (out, t) { return out.concat(cases(t)); }, []);
    for (var j = 0, out = [], all = scenes(tid); j < all.length; j += CASE_N) out.push(all.slice(j, j + CASE_N));
    return out;
  }
  // where a case's strings and card positions are kept: by its text and its number within that text, so a case is the
  // same board whether you reach it from All three or from its own text
  function caseKey(ids) {
    var tid = tidOf(ids[0]), k = 1;
    cases(tid).forEach(function (c, i) { if (c.indexOf(ids[0]) >= 0) k = i + 1; });
    return 'eng-cork-case:' + tid + ':' + CASE_N + ':' + k;
  }
  function load() {
    var at = null, per = +(store('eng-cork-per') || 12);
    CASE_N = per === 6 ? 6 : 12;
    try { at = JSON.parse(store('eng-cork-at') || 'null'); } catch (e) {}
    if (at && (at.text === 'all' || T.texts.indexOf(at.text) >= 0)) S.text = at.text;
    goCase(at && at.text === S.text ? at.n : 1);
  }
  function goCase(n) {
    var list = cases(S.text), of = list.length;
    n = ((Math.round(n || 1) - 1) % of + of) % of + 1;
    var saved = null;
    try { saved = JSON.parse(store(caseKey(list[n - 1])) || 'null'); } catch (e) {}
    saved = saved || {};
    C = { n: n, of: of, ids: sortIds(list[n - 1]), text: S.text, tid: tidOf(list[n - 1][0]), pos: saved.pos || {}, checked: !!saved.checked,
      strings: (saved.strings || []).filter(function (x) { return T.scenes[x.s] && TH[x.t] && list[n - 1].indexOf(x.s) >= 0; }) };
    C.g = freshGuide(saved.guide);
    S.sel = null; S.arm = null; S.miss = false;
    store('eng-cork-at', JSON.stringify({ text: S.text, n: n }));
  }
  function save() {
    store(caseKey(C.ids), JSON.stringify({ strings: C.strings, pos: C.pos, checked: C.checked, guide: { at: C.g.at, step: C.g.step, done: C.g.done, ks: C.g.ks || {} } }));
    store('eng-cork-at', JSON.stringify({ text: C.text, n: C.n }));
  }
  function freshGuide(g0) {
    g0 = g0 || {};
    var g = { at: Math.max(0, Math.min(C.ids.length, Math.round(+g0.at || 0))), step: g0.step || 'read', done: g0.done || {}, ks: g0.ks || {}, hint: 0, clued: {}, msg: '', look: null, x: null, qr: null };
    if (g.at >= C.ids.length) g.step = 'end';
    else if (['read', 'tie', 'checked'].indexOf(g.step) < 0 || (g.step === 'checked' && !g.done[C.ids[g.at]])) g.step = 'read';
    return g;
  }
  // which scenes this case is: "scenes 3 and 4" (All three) or "scenes 1 to 6"
  function caseWhat() {
    var nums = C.ids.map(function (mid) { return +mid.replace(/^.*-/, ''); }), lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums);
    return lo === hi ? 'Scene ' + lo : hi - lo === 1 ? 'Scenes ' + lo + ' and ' + hi : 'Scenes ' + lo + ' to ' + hi;
  }
  function lay() { return LAY[LAYN]; }
  function jit(k, n) { return (hash(k) % (2 * n + 1)) - n; }
  // Where cards go until you move them: on laptops the full scene cards (the user: "just make it like these were ...
  // on the bulletin board") in a row along the top and the bottom, the themes in two rows between them, placed from
  // the cards' real heights; on phones, small photos.
  // Rows of scene cards: a case is one text, so its scenes in story order, six to a row on a laptop and two on a phone.
  // The first half of the rows go above the themes, the rest below.
  function placeAuto() {
    var L = lay(), hs = {}, rows = [], wide = LAYN === 'wide', per = wide ? 6 : 2;
    for (var j = 0; j < C.ids.length; j += per) rows.push(C.ids.slice(j, j + per));
    Array.prototype.forEach.call(app.querySelectorAll('.cb-card'), function (el) { hs[el.getAttribute('data-k')] = el.offsetHeight; });
    var hOf = function (k) { return hs[k] || (k.charAt(0) === 's' ? L.sh || 420 : L.th); };
    var colX = wide ? colX6 : function (i) { return 16 + i * (L.sw + 12); }, gap = wide ? 16 : 22;
    var up = rows.slice(0, Math.ceil(rows.length / 2)), down = rows.slice(Math.ceil(rows.length / 2)), y = TOPY;
    AUTO = {};
    var put = function (row) {
      var h = 0;
      row.forEach(function (mid, i) { if (!mid) return; AUTO['s:' + mid] = { x: colX(i) + jit(mid, wide ? 10 : 2), y: y + jit(mid + 'y', wide ? 5 : 3) }; h = Math.max(h, hOf('s:' + mid)); });
      y += h + gap;
    };
    up.forEach(put);
    y += wide ? 8 : 16;
    // the themes: rows of five on a laptop (the last row centred), two on a phone
    // the themes: one row across the board on a laptop (two rows with all of them), two to a row on a phone
    var TL = ON(), per = wide ? (TL.length <= 9 ? TL.length : Math.ceil(TL.length / 2)) : 2, nrow = Math.ceil(TL.length / per);
    TL.forEach(function (t, i) {
      var r = Math.floor(i / per), c = i % per, inRow = Math.min(per, TL.length - r * per);
      AUTO['t:' + t.id] = wide ? { x: Math.round((L.W - (inRow * TWN + (inRow - 1) * 14)) / 2) + c * (TWN + 14) + jit(t.id, 4), y: y + r * (L.th + 18) + jit(t.id + 'y', 6) }
        : { x: 26 + (per - inRow) * 148 + c * 296 + jit(t.id, 6), y: y + r * (L.th + 16) + jit(t.id + 'y', 4) };
    });
    y += wide ? nrow * (L.th + 18) + 6 : nrow * (L.th + 16) + 14;
    down.forEach(put);
  }
  function colX6(i) { return 24 + i * (LAY.wide.sw + (LAY.wide.gap || 18)); }
  function moved() { return C.pos[LAYN] = C.pos[LAYN] || {}; }
  function pos(key) { return moved()[key] || AUTO[key] || { x: 0, y: 0 }; }
  function size(key) {
    var L = lay(), el = app && app.querySelector('.cb-card[data-k="' + key + '"]');
    return key.charAt(0) === 's' ? [L.sw, el ? el.offsetHeight : L.sh || 420] : [LAYN === 'wide' ? TWN : L.tw, el ? el.offsetHeight : L.th];
  }
  function rot(key) { return LAY[LAYN].full && key.charAt(0) === 's' ? ((hash(key) % 5) - 2) * 0.45 : ((hash(key) % 9) - 4) * 0.6; }
  // Where a card's pin is, on the board: its top middle, turned with the card.
  function pinAt(key) {
    var p = pos(key), sz = size(key), r = rot(key) * Math.PI / 180, cx = p.x + sz[0] / 2, cy = p.y + sz[1] / 2, d = -sz[1] / 2 + 13;
    return [cx - d * Math.sin(r), cy + d * Math.cos(r)];
  }
  function strung(mid) { var o = {}, on = onIds(); C.strings.forEach(function (x) { if (x.s === mid && on[x.t]) o[x.t] = true; }); return o; }

  function corkHtml() {
    LAYN = (app.clientWidth || window.innerWidth) >= 900 ? 'wide' : 'narrow';
    TOPY = LAYN === 'wide' ? 64 : 52;
    var L = lay(), res = C.checked ? tally() : null;
    if (LAYN === 'wide') { L.W = colX6(5) + L.sw + 24; var nT = ON().length, perT = nT <= 9 ? nT : Math.ceil(nT / 2); TWN = Math.min(L.tw, Math.floor((L.W - 48 - (perT - 1) * 14) / perT)); }
    LAYN = (app.clientWidth || window.innerWidth) >= 900 ? 'wide' : 'narrow';
    var h = '<div class="cb-ctl">' + boardTools() + '<div class="cb-bar"><span class="cb-case">Case ' + C.n + ' of ' + C.of + '<small>' + esc(caseWhat()) + ' of ' + esc(A.text(C.tid).title) + '</small></span>' +
      cardsGrp('is-cards-b') +
      (guided() ? '<span class="cb-btns"><button type="button" class="sb-btn is-quiet" data-cb-go="-1"' + (C.n > 1 ? '' : ' disabled') + '>‹ Previous case</button><button type="button" class="sb-btn is-quiet" data-cb-go="1">' + (C.n < C.of ? 'Next case ›' : 'Back to case 1') + '</button><button type="button" class="sb-btn is-quiet" data-cb-grestart' + (C.strings.length || C.g.at ? '' : ' disabled') + '>Start again</button></span></div></div>' : '') +
      (guided() ? '' : (res ? '<span class="cb-res"><b>' + res.ok + '</b> hold · <b class="is-bad">' + res.bad + '</b> don\'t · <b class="is-miss">' + res.miss + '</b> missed</span>' : '') +
      '<span class="cb-btns"><button type="button" class="sb-btn" data-cb-check' + (C.strings.length ? '' : ' disabled') + '>' + (C.checked ? 'Check again' : 'Check my strings') + '</button>' +
      (res && res.miss ? '<button type="button" class="sb-btn is-quiet" data-cb-miss aria-pressed="' + S.miss + '">' + (S.miss ? 'Hide what I missed' : 'Show what I missed') + '</button>' : '') + '<button type="button" class="sb-btn is-quiet" data-cb-go="-1"' + (C.n > 1 ? '' : ' disabled') + '>‹ Previous</button><button type="button" class="sb-btn is-quiet" data-cb-go="1">' + (C.n < C.of ? 'Next case ›' : 'Back to case 1') + '</button><button type="button" class="sb-btn is-quiet" data-cb-clear' + (C.strings.length ? '' : ' disabled') + '>Clear strings</button></span></div></div>');
    // the guide: beside the board on a wide window, over it otherwise
    if (guided()) h += coachHtml();
    var gb = guided() ? ' is-guide' + (C.g.step === 'read' || C.g.step === 'tie' ? ' is-tie' : '') : '';
    h += '<div class="cb-wrap" data-cb-wrap><div class="cb-board' + (L.full ? ' is-full' : '') + gb + '" data-cb-board style="width:' + L.W + 'px;height:' + (L.H || 900) + 'px">' +
      '<svg class="cb-strings" data-cb-svg aria-hidden="true"></svg>';
    C.ids.forEach(function (mid) {
      var k = 's:' + mid, p = pos(k), m = mom(mid), src = pic(mid), tid = tidOf(mid);
      var cls = 'cb-card cb-scene is-full' + (S.sel === k ? ' is-sel' : '') + (S.arm === k ? ' is-arm' : '') + (guided() ? gCls(mid) : '');
      var st = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + L.sw + 'px;--r:' + rot(k) + 'deg;--c:' + (A.COL[tid] || '#13233A');
      h += '<div class="' + cls + '" data-k="' + k + '" style="' + st + '" tabindex="0" role="button" aria-label="' + esc(m.title) + ', ' + esc(short(tid)) + '">' +
        '<span class="cb-pin" data-pin="' + k + '" aria-hidden="true"></span>' + (guided() ? gBadge(mid) : '') +
        (src ? '<img class="cb-full__img" src="' + esc(src) + '" alt="" draggable="false">' : '') +
          '<div class="cb-full__body is-compact"><p class="sb-card__tag">Scene ' + mid.replace(/^.*-/, '') + (m.where ? ' · ' + esc(m.where) : '') + '</p><h3 class="sb-card__h">' + esc(m.title) + '</h3>' + cardDesc(mid, guided() ? mid === cur() && C.g.step === 'checked' : C.checked) + '</div>' +
        (canWatch(mid) ? '<button type="button" class="cb-watch' + (hasClip(mid) ? '' : ' is-still') + '" data-cb-watch="' + mid + '" aria-label="' + (hasClip(mid) ? 'Watch ' : 'See ') + esc(m.title) + '" title="' + (hasClip(mid) ? 'Watch the scene' : 'No clip of this scene exists: see it told over a still') + '">▶</button>' : '') + '</div>';
    });
    ON().forEach(function (t) {
      var k = 't:' + t.id, p = pos(k);
      h += '<div class="cb-card cb-theme' + (S.sel === k ? ' is-sel' : '') + (S.arm === k ? ' is-arm' : '') + (guided() && cur() && strung(cur())[t.id] ? ' is-tied' : '') + '" data-k="' + k + '" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + (LAYN === 'wide' ? TWN : L.tw) + 'px;height:' + L.th + 'px;--r:' + rot(k) + 'deg" tabindex="0" role="button" aria-label="' + esc(t.name) + '">' +
        '<span class="cb-pin" data-pin="' + k + '" aria-hidden="true"></span><b>' + esc(t.name) + '</b>' + (t.times ? '<small>came up ' + (t.times === 1 ? 'once' : t.times + ' times') + '</small>' : '') + '</div>';
    });
    var wideL = LAYN === 'wide';
    h += '<p class="cb-label" style="left:' + (wideL ? 24 : 16) + 'px;width:' + (L.W - (wideL ? 48 : 32)) + 'px;--c:' + (A.COL[C.tid] || '#13233A') + '">' +
      esc(A.text(C.tid).title) + ' · in story order</p>';
    if (guided()) h += sheetHtml();
    h += '<svg class="cb-tags" data-cb-tags aria-hidden="true"></svg></div></div>';
    // the desk under the board, with the case file on it as a folder (the user, of the wall: "lik ea detective office")
    return h + '<div class="cb-desk" data-cb-desk>' + (LAYN === 'wide' ? '<svg class="cb-prop cb-lamp" viewBox="0 0 220 230" aria-hidden="true"><defs><linearGradient id="cbShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7A4C"/><stop offset=".55" stop-color="#15502E"/><stop offset="1" stop-color="#0B3520"/></linearGradient><linearGradient id="cbBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A5A22"/><stop offset=".45" stop-color="#E2C374"/><stop offset="1" stop-color="#6E4F1C"/></linearGradient><radialGradient id="cbGlow" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFE2A8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></radialGradient></defs><path d="M38 96 L182 96 L210 160 L10 160 Z" fill="url(#cbGlow)" opacity=".55"/><rect x="104" y="92" width="12" height="108" fill="url(#cbBrass)"/><ellipse cx="110" cy="212" rx="62" ry="14" fill="#3E2A10" opacity=".6"/><path d="M52 214 Q52 196 110 194 Q168 196 168 214 Z" fill="url(#cbBrass)"/><path d="M24 92 Q30 40 110 34 Q190 40 196 92 Z" fill="url(#cbShade)"/><path d="M40 82 Q56 50 104 44" stroke="#8FD1A6" stroke-width="5" stroke-linecap="round" fill="none" opacity=".55"/><rect x="20" y="90" width="180" height="8" rx="4" fill="url(#cbBrass)"/><rect x="104" y="24" width="12" height="12" rx="3" fill="url(#cbBrass)"/></svg>' + '<svg class="cb-prop cb-folders" viewBox="0 0 260 90" aria-hidden="true"><rect x="14" y="40" width="230" height="34" rx="3" fill="#B98B4E" transform="rotate(-3 130 57)"/><rect x="6" y="30" width="236" height="36" rx="3" fill="#D8B77A" transform="rotate(2 124 48)"/><rect x="20" y="16" width="226" height="38" rx="3" fill="#E6CB93" transform="rotate(-1.5 133 35)"/><rect x="150" y="8" width="60" height="14" rx="3" fill="#E6CB93" transform="rotate(-1.5 180 15)"/><path d="M40 70 L232 52" stroke="#C21F2E" stroke-width="3"/><path d="M38 74 L60 72" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round"/></svg>' + '<svg class="cb-prop cb-phone" viewBox="0 0 240 150" aria-hidden="true"><ellipse cx="120" cy="138" rx="104" ry="10" fill="#1A0F06" opacity=".55"/><path d="M40 136 Q36 78 72 64 L168 64 Q204 78 200 136 Z" fill="#15161A"/><path d="M58 120 Q58 84 82 76 L158 76 Q182 84 182 120" fill="none" stroke="#3A3D45" stroke-width="3"/><circle cx="120" cy="104" r="26" fill="#26282E" stroke="#C9CDD3" stroke-width="2"/><circle cx="120" cy="104" r="9" fill="#E9E4D6"/><g fill="#0C0D10"><circle cx="120" cy="85" r="4"/><circle cx="134" cy="91" r="4"/><circle cx="139" cy="104" r="4"/><circle cx="134" cy="117" r="4"/><circle cx="106" cy="91" r="4"/><circle cx="101" cy="104" r="4"/><circle cx="106" cy="117" r="4"/></g><path d="M30 52 Q24 30 46 26 L194 26 Q216 30 210 52 Q204 62 186 58 L178 44 L62 44 L54 58 Q36 62 30 52 Z" fill="#1D1F24"/><path d="M48 32 L192 32" stroke="#4A4E57" stroke-width="3" stroke-linecap="round"/><path d="M200 120 Q236 126 228 146" fill="none" stroke="#15161A" stroke-width="4"/></svg>' : '') +
      (guided() ? '' : '<section class="cb-file" data-cb-file aria-live="polite">' + (sideOn() ? fileHtml0() : fileHtml()) + '</section>') + '</div>';
  }
  // What a card says about its scene: who's there and what happens, beat by beat, with the giveaways highlighted (the
  // user, of cards showing only the giveaways: "put a bit more detail in those cards than there is now there used to be
  // detail and you got rid of them"). Once the strings are checked, each giveaway names the themes it points to.
  function cardDesc(mid, named) {
    var m = mom(mid);
    if (DETAIL === 'short' && T.gist && T.gist[mid]) return '<p class="cb-gist">' + marked(mid, T.gist[mid], named) + '</p>';
    return '<p class="cb-who"><b>Who</b> ' + esc(T.scenes[mid].who) + '</p><ol class="cb-beats">' +
      (m.tell || [m.what]).map(function (x) { return '<li>' + marked(mid, x, named) + '</li>'; }).join('') + '</ol>';
  }
  // After the board is drawn: the cards' real heights decide where the unmoved ones go and how tall the board is.
  function layout() {
    var board = app.querySelector('[data-cb-board]'), L = lay();
    if (!board) return;
    placeAuto();
    var bottom = 0;
    Array.prototype.forEach.call(board.querySelectorAll('.cb-card'), function (el) {
      var k = el.getAttribute('data-k'), p = pos(k);
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      bottom = Math.max(bottom, p.y + el.offsetHeight);
    });
    var sh = board.querySelector('[data-cb-sheet]');
    if (sh) bottom = Math.max(bottom, placeSheet(sh));
    HB = Math.max(bottom + 20, 600);
    board.style.height = HB + 'px';
    ['[data-cb-svg]', '[data-cb-tags]'].forEach(function (q) { var v = board.querySelector(q); v.setAttribute('viewBox', '0 0 ' + L.W + ' ' + HB); v.setAttribute('width', L.W); v.setAttribute('height', HB); });
    if (sh) { placeSheet(sh); sheetStrings(); }
  }
  function tally() {
    var ok = 0, bad = 0, miss = 0;
    var on = onIds();
    C.strings.forEach(function (x) { if (!on[x.t]) return; if (isYes(x.s, x.t)) ok++; else bad++; });
    C.ids.forEach(function (mid) { var on = strung(mid); yesOf(mid).forEach(function (t) { if (!on[t.id]) miss++; }); });
    return { ok: ok, bad: bad, miss: miss };
  }
  // The red string: a little slack, so it sags between the pins.
  function curve(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], dist = Math.sqrt(dx * dx + dy * dy), sag = Math.min(70, dist * 0.14), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2 + sag;
    return { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1), mid: [0.25 * a[0] + 0.5 * cx + 0.25 * b[0], 0.25 * a[1] + 0.5 * cy + 0.25 * b[1]] };
  }
  // The strings run over the cards, as on a real board (the user: "the strings must overlap the pictures"), with their
  // knots and the ✓ / ✗ / ? tags on top of them.
  function strings(live) {
    var svg = app.querySelector('[data-cb-svg]'), tags = app.querySelector('[data-cb-tags]');
    if (!svg || !tags) return;
    // hit: each string's wide invisible line for tapping it, under the cards (so a string never blocks a tap on a card
    // or its pin); h: the visible strings, over the cards; g: tags and knots, on top
    var hit = '', h = '', g = '';
    var tag = function (c, txt, attr) { return '<g class="cb-tag"' + attr + ' transform="translate(' + c.mid[0].toFixed(1) + ' ' + c.mid[1].toFixed(1) + ')"><circle r="14"/><text dy="5">' + txt + '</text></g>'; };
    var gd = guided(), cm = gd ? cur() : null, gc = gd && C.g.step === 'checked';
    if (gc) yesOf(cm).forEach(function (t) {
      if (strung(cm)[t.id]) return;
      var c = curve(pinAt('s:' + cm), pinAt('t:' + t.id));
      h += '<g class="cb-str is-miss"><path class="cb-str__line" d="' + c.d + '"/></g>';
      g += '<g class="cb-str is-miss">' + tag(c, '?', '') + '</g>';
    });
    if (C.checked && !gd) C.ids.forEach(function (mid) {
      var on = strung(mid);
      yesOf(mid).forEach(function (t) {
        if (on[t.id] || !(S.miss || S.sel === 's:' + mid || S.sel === 'm:' + mid + '|' + t.id)) return;
        var c = curve(pinAt('s:' + mid), pinAt('t:' + t.id)), sel = S.sel === 'm:' + mid + '|' + t.id ? ' is-sel' : '', at = ' data-miss="' + mid + '|' + t.id + '"';
        hit += '<g class="cb-str"' + at + '><path class="cb-str__hit" d="' + c.d + '"/></g>';
        h += '<g class="cb-str is-miss' + sel + '"><path class="cb-str__line" d="' + c.d + '"/></g>';
        g += '<g class="cb-str is-miss' + sel + '"' + at + '>' + tag(c, '?', '') + '</g>';
      });
    });
    var onT = onIds();
    var hNow = '', drawn = function (x, i) {
      if (!onT[x.t]) return;
      var c = curve(pinAt('s:' + x.s), pinAt('t:' + x.t)), ok = isYes(x.s, x.t), now = gd && x.s === cm, named = gd ? now && gc : C.checked;
      var cls = 'cb-str' + (named ? ok ? ' is-ok' : ' is-bad' : '') + (S.sel === 'x:' + i ? ' is-sel' : '') +
        (gd ? (now ? ' is-now' : ' is-old') + (x.g ? ' is-given' : '') + (C.g.look === x.s ? ' is-look' : '') : '');
      hit += '<g class="cb-str" data-str="' + i + '"><path class="cb-str__hit" d="' + c.d + '"/></g>';
      var line = '<g class="' + cls + '"><path class="cb-str__shade" d="' + c.d + '"/><path class="cb-str__line" d="' + c.d + '"/></g>';
      if (now) hNow += line; else h += line;
      if (named) g += '<g class="' + cls + '" data-str="' + i + '">' + tag(c, ok ? '✓' : '✗', '') + '</g>';
    };
    C.strings.forEach(drawn);
    h += hNow;
    if (live) { var c2 = curve(live[0], live[1]); g += '<g class="cb-str is-live"><path class="cb-str__shade" d="' + c2.d + '"/><path class="cb-str__line" d="' + c2.d + '"/></g>'; }
    var knots = {};
    C.strings.forEach(function (x) { if (onT[x.t]) { knots['s:' + x.s] = 1; knots['t:' + x.t] = 1; } });
    Object.keys(knots).forEach(function (k) { var p = pinAt(k); g += '<circle class="cb-knot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>'; });
    svg.innerHTML = hit; tags.innerHTML = h + g;
  }
  function scale() {
    var wrap = app.querySelector('[data-cb-wrap]'), board = app.querySelector('[data-cb-board]'), L = lay();
    if (!wrap) return;
    if (LAYN !== 'wide') {
      wrap.style.width = ''; wrap.style.marginLeft = ''; board.style.marginLeft = '';
      var desk0 = app.querySelector('[data-cb-desk]'); if (desk0) { desk0.style.width = ''; desk0.style.marginLeft = ''; }
      var row0 = app.querySelector('.cb-ctl'); if (row0) { row0.style.width = ''; row0.style.marginLeft = ''; }
      K = Math.min(1, wrap.clientWidth / L.W);
    } else {
      // the width of the window (times ZOOM); the board is as long as its cards make it, and the page scrolls
      var docW = document.documentElement.clientWidth;
      var frameW = docW - 56, left = wrap.parentElement.getBoundingClientRect().left, row = app.querySelector('.cb-ctl');
      // the controls take the same full width, so on a wide window they sit on one line
      if (row) { row.style.width = frameW + 'px'; row.style.marginLeft = (28 - left) + 'px'; }
      KF = frameW / L.W; K = KF * ZOOM;
      var bw = Math.round(L.W * K), off = 28 - left + Math.max(0, Math.round((frameW - bw) / 2));
      // with the guide beside it, the board takes the rest of the width, at its full size there
      if (coachSide()) {
        var cw = Math.round(Math.max(360, Math.min(440, docW * 0.25))), co = app.querySelector('[data-cb-coach]');
        if (co) co.style.width = cw + 'px';
        KF = (docW - cw - 16 - 20 - 24) / L.W; K = KF; bw = Math.round(L.W * K); off = 24 - left;
      }
      // the toolbar is the width of the board, over it
      if (row) { row.style.width = bw + 'px'; row.style.marginLeft = off + 'px'; }
      // the cork frame hugs the board, centred
      wrap.style.width = bw + 'px'; wrap.style.marginLeft = off + 'px';
      var desk = app.querySelector('[data-cb-desk]'); if (desk) { desk.style.width = docW + 'px'; desk.style.marginLeft = (-left) + 'px'; }
      board.style.marginLeft = '0px';
    }
    board.style.transform = 'scale(' + K + ')';
    wrap.style.height = Math.ceil((HB || L.H) * K) + 'px';
  }
  function boardPass() { app.innerHTML = '<div class="sb is-cork' + (coachSide() ? ' has-coach' : '') + '">' + head() + corkHtml() + '</div>'; layout(); scale(); SIDE_WAS = coachSide(); }
  // The first time the board is shown, the page scrolls so the case's controls and the whole board fill the window.
  function frameIn() {
    if (SEEN_BOARD || LAYN !== 'wide') return;
    SEEN_BOARD = true;
    if (coachSide()) { requestAnimationFrame(function () { showNow(true, true); }); setTimeout(function () { showNow(true, true); }, 150); return; }
    var ctl = app.querySelector('.cb-ctl'), bar = document.querySelector('.sh-top');
    var go = function () { if (ctl && ctl.isConnected) window.scrollTo(0, Math.max(0, ctl.getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 76) - 8)); };
    requestAnimationFrame(go); setTimeout(go, 150);
  }
  function at(e) { var r = app.querySelector('[data-cb-board]').getBoundingClientRect(); return [(e.clientX - r.left) / K, (e.clientY - r.top) / K]; }

  // ---------- the case file, under the board ----------
  function fileHtml() {
    var s = S.sel;
    if (s && s.charAt(0) === 's') {
      var mid = s.slice(2), m = mom(mid), on = strung(mid);
      return '<p class="cb-file__k">Case file · ' + esc(A.text(tidOf(mid)).title) + '</p><h2 class="sb-h2">' + esc(m.title) + '</h2>' + fixed(mid, C.checked) +
        '<p class="sb-row is-left">' + watchBtn(mid) + '</p>' +
        '<p class="cb-file__sub">Tie this scene to:</p><div class="cb-ties">' + ON().map(function (t) {
          return '<button type="button" class="sb-chip" data-cb-tie="' + mid + '|' + t.id + '" aria-pressed="' + !!on[t.id] + '">' + esc(t.name) + '</button>';
        }).join('') + '</div>' + (C.checked ? why(mid, on, true) : '<p class="cb-file__tip">The highlighted words are the giveaways. Check to see what each one points to.</p>');
    }
    if (s && s.charAt(0) === 't') {
      var t = TH[s.slice(2)], tied = C.strings.filter(function (x) { return x.t === t.id; });
      return '<p class="cb-file__k">Case file · theme</p><h2 class="sb-h2">' + esc(t.name) + '</h2><p class="sb-themeask">' + esc(t.ask) + '</p>' +
        (tied.length ? '<ul class="cb-list">' + tied.map(function (x) { return '<li>' + esc(mom(x.s).title) + (C.checked ? ' <b class="' + (isYes(x.s, t.id) ? 'is-ok' : 'is-bad') + '">' + (isYes(x.s, t.id) ? 'holds' : 'doesn\'t hold') + '</b>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="cb-file__tip">No strings to this theme yet.</p>') +
        '<p class="sb-row is-left"><a class="sb-btn is-quiet" href="#board/theme/' + t.id + '">Every scene for ' + esc(t.name.toLowerCase()) + '</a></p>';
    }
    if (s && (s.charAt(0) === 'x' || s.charAt(0) === 'm')) {
      var x = s.charAt(0) === 'x' ? C.strings[+s.slice(2)] : { s: s.slice(2).split('|')[0], t: s.slice(2).split('|')[1] }, miss = s.charAt(0) === 'm';
      if (!x) return fileHtml0();
      var c = cell(x.s, x.t), ok = isYes(x.s, x.t);
      return '<p class="cb-file__k">Case file · ' + (miss ? 'a string you missed' : 'a string') + '</p><h2 class="sb-h2">' + esc(mom(x.s).title) + ' <span class="cb-to">→</span> ' + esc(TH[x.t].name) + '</h2>' +
        (C.checked || miss ? '<div class="sb-why ' + (ok ? 'is-yes' : 'is-wrong') + (miss ? ' is-miss' : '') + '"><p class="sb-why__h"><b>' + (miss ? 'You missed this one' : ok ? 'It holds' : 'It doesn\'t hold') + '</b></p><p>' + esc(ok ? c[1] : c ? c[1] : noWhy(x.s, x.t)) + '</p>' + (ok ? quote(c[2]) : '') + '</div>'
          : '<p class="cb-file__tip">Check your strings to see if this one holds.</p>') +
        '<p class="sb-row is-left">' + (miss ? '<button type="button" class="sb-btn" data-cb-tie="' + x.s + '|' + x.t + '">Tie it</button>' : '<button type="button" class="sb-btn is-quiet" data-cb-cut="' + s.slice(2) + '">Cut this string</button>') +
        '<button type="button" class="sb-btn is-quiet" data-cb-sel="s:' + x.s + '">Open the scene</button></p>';
    }
    return fileHtml0();
  }
  function fileHtml0() {
    if (C.checked) return '<p class="cb-file__k">Case file · what the strings prove</p>' + C.ids.map(function (mid) {
      return '<section class="cb-sum"><h3 class="sb-h3"><button type="button" class="cb-link" data-cb-sel="s:' + mid + '">' + esc(mom(mid).title) + '</button> <span>' + esc(short(tidOf(mid))) + '</span></h3>' + why(mid, strung(mid), true) + '</section>';
    }).join('') + '<p class="sb-row"><button type="button" class="sb-btn" data-cb-go="1">' + (C.n < C.of ? 'Next case: the next scenes ›' : 'Back to case 1') + '</button></p>';
    return '<p class="cb-file__k">Case file</p><p class="cb-file__tip"><b>How it works:</b> drag a scene\'s red pin onto a theme to tie a string (or tap the pin, then the theme). Drag any card to move it. Tap a string to cut it.</p><p class="cb-file__tip">Tap a scene to read its file, the giveaways highlighted, and watch it. Tie each scene to every theme you could write a paragraph about. Some scenes prove three or four themes; some prove one.</p>' +
      T.texts.filter(function (tid) { return C.ids.some(function (mid) { return tidOf(mid) === tid; }); }).map(function (tid) {
        return '<p class="cb-file__sub">' + esc(A.text(tid).title) + '</p><ul class="cb-list">' + C.ids.filter(function (mid) { return tidOf(mid) === tid; }).map(function (mid) {
          return '<li><button type="button" class="cb-link" data-cb-sel="s:' + mid + '">' + esc(mom(mid).title) + '</button> <span>' + esc(mom(mid).where) + '</span>' + (canWatch(mid) ? ' <button type="button" class="cb-link is-watch" data-cb-watch="' + mid + '">▶ ' + (hasClip(mid) ? 'watch' : 'see it') + '</button>' : '') + '</li>';
        }).join('') + '</ul>';
      }).join('');
  }
  function sideOn() { return S.mode === 'board' && !guided() && LAYN === 'wide' && !!S.sel; }
  function sideDraw() {
    var side = document.querySelector('.cb-side');
    if (!sideOn()) { if (side) side.parentNode.removeChild(side); return; }
    if (!side) { side = document.createElement('aside'); side.className = 'cb-side'; side.setAttribute('aria-label', 'Case file'); (app.querySelector('.sb') || app).appendChild(side); }
    side.innerHTML = '<button type="button" class="cb-side__x" data-cb-close aria-label="Close the case file">×</button>' + fileHtml();
  }
  function fileDraw() { var f = app.querySelector('[data-cb-file]'); if (f) f.innerHTML = sideOn() ? fileHtml0() : fileHtml(); sideDraw(); }
  function select(k) {
    S.sel = k;
    Array.prototype.forEach.call(app.querySelectorAll('.cb-card'), function (c) { c.classList.toggle('is-sel', c.getAttribute('data-k') === k); });
    strings(); fileDraw();
  }

  // ---------- strings ----------
  function tie(a, b) {
    var sKey = a.charAt(0) === 's' ? a : b.charAt(0) === 's' ? b : null, tKey = a.charAt(0) === 't' ? a : b.charAt(0) === 't' ? b : null;
    if (!sKey || !tKey) { toast('A string goes from a scene to a theme.'); return false; }
    var mid = sKey.slice(2), th = tKey.slice(2);
    if (C.strings.some(function (x) { return x.s === mid && x.t === th; })) return false;
    C.strings.push({ s: mid, t: th }); C.checked = false; save(); sfx('pop');
    return true;
  }
  function cut(i) { C.strings.splice(i, 1); C.checked = false; S.sel = null; save(); }
  function toast(msg) {
    var t = document.querySelector('.cb-toast');
    if (!t) { t = document.createElement('p'); t.className = 'cb-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }
  function check() {
    var mk = marks();
    C.checked = true;
    C.ids.forEach(function (mid) { var on = strung(mid); mk[mid] = ON().filter(function (t) { return !!on[t.id] === isYes(mid, t.id); }).length; });
    store('eng-board-scenes', JSON.stringify(mk)); save();
    var r = tally(); sfx(!r.bad && !r.miss ? 'stamp' : r.ok > r.bad + r.miss ? 'ding' : 'bonk');
    S.sel = null; paint();
  }

  // ---------- dragging cards and string ----------
  document.addEventListener('pointerdown', function (e) {
    if (!app || S.mode !== 'board' || !app.querySelector('[data-cb-board]') || !app.contains(e.target) || e.button > 0) return;
    if (e.target.closest('.cb-watch')) return;
    var pin = e.target.closest('.cb-pin'), card = e.target.closest('.cb-card'), str = e.target.closest('.cb-str');
    if (!pin && !card && !str) return;
    e.preventDefault();
    var p = at(e);
    if (pin) DRAG = { kind: 'string', from: pin.getAttribute('data-pin'), x0: e.clientX, y0: e.clientY, moved: false };
    else if (card) { var k = card.getAttribute('data-k'), q = pos(k); DRAG = { kind: 'move', key: k, el: card, q: { x: q.x, y: q.y }, dx: p[0] - q.x, dy: p[1] - q.y, x0: e.clientX, y0: e.clientY, moved: false }; card.classList.add('is-lift'); }
    else DRAG = { kind: 'str', el: str, x0: e.clientX, y0: e.clientY, moved: false };
    try { app.querySelector('[data-cb-board]').setPointerCapture(e.pointerId); } catch (er) {}
  });
  document.addEventListener('pointermove', function (e) {
    if (!DRAG) return;
    if (Math.abs(e.clientX - DRAG.x0) + Math.abs(e.clientY - DRAG.y0) > 6) DRAG.moved = true;
    if (!DRAG.moved) return;
    var p = at(e), L = lay();
    if (DRAG.kind === 'move') {
      // a card only stays where you put it once it has actually been moved
      var sz = size(DRAG.key), q = moved()[DRAG.key] = moved()[DRAG.key] || DRAG.q;
      q.x = Math.round(Math.max(0, Math.min(L.W - sz[0], p[0] - DRAG.dx))); q.y = Math.round(Math.max(0, Math.min((HB || L.H) - sz[1], p[1] - DRAG.dy)));
      DRAG.el.style.left = q.x + 'px'; DRAG.el.style.top = q.y + 'px';
      strings();
    } else if (DRAG.kind === 'string') {
      // near the top or bottom of the window, the page scrolls, so a string can reach any card
      if (e.clientY < 70) window.scrollBy(0, -14); else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
      strings([pinAt(DRAG.from), p]);
      var over = document.elementFromPoint(e.clientX, e.clientY), oc = over && over.closest && over.closest('.cb-card');
      Array.prototype.forEach.call(app.querySelectorAll('.cb-card.is-over'), function (c) { if (c !== oc) c.classList.remove('is-over'); });
      if (oc && oc.getAttribute('data-k') !== DRAG.from) oc.classList.add('is-over');
    }
  });
  document.addEventListener('pointerup', function (e) {
    var d = DRAG;
    if (!d) return;
    DRAG = null;
    Array.prototype.forEach.call(app.querySelectorAll('.cb-card.is-over, .cb-card.is-lift'), function (c) { c.classList.remove('is-over'); c.classList.remove('is-lift'); });
    if (d.kind === 'move') {
      if (d.moved) { save(); return; }
      if (guided()) { gTap(d.key); return; }
      // a tap on a card: tie it to the pin you tapped first, or open its file
      if (S.arm && S.arm !== d.key) { var a = S.arm; S.arm = null; tie(a, d.key); paint(); return; }
      select(d.key); return;
    }
    if (d.kind === 'string') {
      if (d.moved) {
        var over = document.elementFromPoint(e.clientX, e.clientY), oc = over && over.closest && over.closest('.cb-card');
        if (oc && oc.getAttribute('data-k') !== d.from && (!guided() || gCan(d.from, oc.getAttribute('data-k')))) { tie(d.from, oc.getAttribute('data-k')); if (guided()) gTied(); }
        paint(); return;
      }
      if (guided()) {
        // a tap on a theme's pin ties it, like a tap on the card; a scene's pin is held only if it's the scene you're on
        if (d.from.charAt(0) === 't' || S.arm) { var a0 = S.arm; S.arm = null; if (d.from.charAt(0) === 't') gTap(d.from); else if (a0 !== d.from) gTap(d.from); else paint(); return; }
        if (!gCan(d.from, null)) { paint(); return; }
      }
      // a tap on a pin: hold it, then tap the card to tie it to
      if (S.arm && S.arm !== d.from) { var b = S.arm; S.arm = null; tie(b, d.from); paint(); return; }
      S.arm = S.arm === d.from ? null : d.from; paint();
      if (S.arm) toast('Now tap the card to tie it to.');
      return;
    }
    if (d.kind === 'str' && !d.moved) {
      var i = d.el.getAttribute('data-str'), m = d.el.getAttribute('data-miss');
      if (guided()) {
        var xs = i != null ? C.strings[+i] : null;
        if (xs && xs.s === cur() && C.g.step !== 'checked') { cut(+i); toast('String cut.'); paint(); }
        else if (xs) toast(xs.s === cur() ? 'This scene is checked. Try it again to change its strings.' : 'That string is from a scene you\'ve finished.');
        return;
      }
      select(i != null ? 'x:' + i : 'm:' + m);
    }
  });

  // ---------- step by step ----------
  function guided() { return GUIDE && S.mode === 'board' && !!C; }
  function cur() { return C && C.g.step !== 'end' ? C.ids[C.g.at] || null : null; }
  // the guide sits beside the board when the window is wide enough for the board to stay readable next to it, and over
  // the board otherwise
  function coachSide() { return guided() && LAYN === 'wide' && document.documentElement.clientWidth >= 1200; }
  function num(mid) { return +mid.replace(/^.*-/, ''); }
  function words(n) { return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n] || String(n); }
  function pick(list) { var o = {}; (list || []).forEach(function (t) { o[t] = true; }); return o; }
  function gCls(mid) {
    var g = C.g, i = C.ids.indexOf(mid);
    return mid === cur() ? ' is-now' + (g.step === 'read' && g.x && g.x.mid === mid && g.x.kt && g.x.kt.phase !== 'done' ? ' is-quiz' : '') : g.done[mid] ? ' is-done' + (g.look === mid ? ' is-look' : '') : i > g.at ? ' is-later' : '';
  }
  function gBadge(mid) {
    var d = C.g.done[mid], h = mid === cur() ? '<span class="cb-nowtag">Your scene</span>' : '';
    if (d && mid !== cur()) h += '<span class="cb-donetag' + (d.bad || d.miss ? ' is-part' : '') + '">' + starRow(stars(d)) + ' ' + (d.of ? d.ok + ' of ' + d.of : 'Done') + '</span>';
    return h;
  }
  // Only the scene you're on ties, and only until it's checked.
  function gCan(a, b) {
    var cm = cur(), sKey = a && a.charAt(0) === 's' ? a : b && b.charAt(0) === 's' ? b : null;
    if (!cm) { toast('This case is closed. Start it again, or go on to the next case.'); return false; }
    if (sKey && sKey.slice(2) !== cm) { gNotNow(sKey.slice(2)); return false; }
    if (C.g.step === 'checked') { toast('This scene is checked. Try it again to change its strings, or go on to the next scene.'); return false; }
    if (C.g.step === 'read') { toast('First, know the scene: read it, then take the test in the guide.'); return false; }
    return true;
  }
  function gNotNow(mid) {
    toast(C.g.done[mid] ? 'You\'ve finished that scene. Tap it to look back at it.' : 'One scene at a time: you\'re on scene ' + num(cur()) + ', ' + mom(cur()).title + '.');
  }
  // A tap on a card: a theme ties to (or unties from) the scene you're on; a finished scene opens to look back at.
  function gTap(k) {
    S.arm = null;
    var cm = cur();
    if (k.charAt(0) === 't') {
      if (!gCan(k, null)) { paint(); return; }
      var th = k.slice(2), have = -1;
      C.strings.forEach(function (x, i) { if (x.s === cm && x.t === th) have = i; });
      if (have >= 0) { cut(have); toast('Untied from ' + TH[th].name + '.'); } else tie('s:' + cm, k);
      gTied(); paint(); return;
    }
    var mid = k.slice(2);
    if (mid === cm) { if (C.g.look) { C.g.look = null; paint(); } coachTop(); return; }
    if (C.g.done[mid]) { C.g.look = C.g.look === mid ? null : mid; paint(); coachTop(); return; }
    gNotNow(mid);
  }
  function gTied() { if (C.g.step === 'read') C.g.step = 'tie'; C.g.look = null; save(); }
  function gCheck() {
    var cm = cur();
    if (!cm || C.g.step === 'checked') return;
    var on = strung(cm), yes = yesOf(cm), p = Object.keys(on);
    var ok = yes.filter(function (t) { return on[t.id]; }).length, bad = p.filter(function (t) { return !isYes(cm, t); }).length, miss = yes.length - ok;
    C.g.done[cm] = { p: p, ok: ok, bad: bad, miss: miss, of: yes.length, k: !!(C.g.ks && C.g.ks[cm]), s: !bad && !miss && !C.g.hint, l: false };
    C.g.step = 'checked'; C.g.msg = '';
    var mk = marks(); mk[cm] = ON().filter(function (t) { return !!on[t.id] === isYes(cm, t.id); }).length; store('eng-board-scenes', JSON.stringify(mk));
    save(); sfx(!bad && !miss ? 'stamp' : ok > bad + miss ? 'ding' : 'bonk');
    paint(); coachTop(); sheetShow();
  }
  // On to the next scene. The board ends up right: the strings that don't hold are cut, the ones you missed are tied
  // for you (dashed).
  function gNext() {
    var cm = cur();
    if (!cm || !C.g.done[cm]) return;
    C.strings = C.strings.filter(function (x) { return x.s !== cm || isYes(cm, x.t); });
    var on = strung(cm);
    yesOf(cm).forEach(function (t) { if (!on[t.id]) C.strings.push({ s: cm, t: t.id, g: 1 }); });
    C.g.at++; C.g.step = C.g.at >= C.ids.length ? 'end' : 'read';
    C.g.hint = 0; C.g.clued = {}; C.g.msg = ''; C.g.look = null; C.g.x = null;
    save(); paint(); showNow(); coachTop();
  }
  function gAgain() {
    var cm = cur();
    if (!cm) return;
    C.strings = C.strings.filter(function (x) { return x.s !== cm; });
    delete C.g.done[cm]; C.g.step = 'tie'; C.g.hint = 0; C.g.clued = {}; C.g.msg = ''; if (C.g.x) { C.g.x.df = null; C.g.x.dfNone = false; C.g.x.ln = null; }
    save(); paint(); coachTop();
  }
  // Hints, one at a time: first how many themes the scene proves, then for each one you haven't tied, the giveaway
  // that shows it (or the theme's question), then its name.
  function gHint() {
    var cm = cur(), g = C.g;
    if (!cm) return;
    var yes = yesOf(cm), on = strung(cm), n = Object.keys(on).length;
    var missing = yes.filter(function (t) { return !on[t.id]; }), wrong = Object.keys(on).filter(function (t) { return !isYes(cm, t); });
    g.hint++;
    if (g.hint === 1) g.msg = yes.length ? 'This scene proves <b>' + words(yes.length) + '</b> of the themes on the board. You\'ve tied ' + (n ? words(n) : 'none yet') + '.'
      : 'None of the themes on this board really fit this scene, so the right answer is to tie nothing.';
    else if (missing.length) {
      var t = missing[0];
      if (!g.clued[t.id]) {
        g.clued[t.id] = 1;
        var gv = (T.hl[cm] || []).filter(function (x) { return x[1].split(' ').indexOf(t.id) >= 0; })[0];
        g.msg = gv ? 'Look at the giveaway <mark class="cb-hl">' + esc(gv[0]) + '</mark>. Which theme on the board does it show?' : 'Ask yourself: ' + esc(t.ask);
      } else g.msg = 'It\'s <b>' + esc(t.name) + '</b>. Tie it, then see if there are any more.';
    } else if (wrong.length) g.msg = 'You\'ve found every theme this scene proves, but ' + (wrong.length > 1 ? 'some of your strings won\'t' : 'one of your strings won\'t') + ' hold. Which one couldn\'t you write a paragraph on?';
    else g.msg = 'You\'ve got them all. Check the scene.';
    paint();
  }
  // Bring the scene you're on into view with the themes (the whole board when it fits); with the guide over the board,
  // the guide.
  function showNow(force, instant) {
    var bar = document.querySelector('.sh-top'), top = (bar ? bar.offsetHeight : 76) + 10, how = instant ? 'auto' : 'smooth';
    if (!coachSide()) { coachTop(true, how); return; }
    var card = app.querySelector('.cb-scene.is-now'), wrap = app.querySelector('[data-cb-wrap]');
    if (!wrap) return;
    var room = window.innerHeight - top - 10, wr = wrap.getBoundingClientRect(), y;
    if (wr.height <= room || !card) y = wr.top - top;
    else {
      var r = card.getBoundingClientRect(), a = r.top, b = r.bottom;
      Array.prototype.forEach.call(app.querySelectorAll('.cb-theme'), function (el) { var q = el.getBoundingClientRect(); a = Math.min(a, q.top); b = Math.max(b, q.bottom); });
      if (!force && a >= top && b <= window.innerHeight - 10) return;
      y = b - a <= room ? a - top : r.top - top;
    }
    window.scrollTo({ top: Math.max(0, window.scrollY + y), behavior: how });
  }
  // The top of the guide: scrolled to inside the panel beside the board, or the page scrolled to it over the board.
  function coachTop(page, how) {
    var co = app.querySelector('[data-cb-coach]');
    if (!co) return;
    if (coachSide()) { co.scrollTop = 0; return; }
    var bar = document.querySelector('.sh-top'), top = (bar ? bar.offsetHeight : 76) + 8, r = co.getBoundingClientRect();
    if (page || r.top < top || r.top > window.innerHeight * 0.5) window.scrollTo({ top: Math.max(0, window.scrollY + r.top - top), behavior: how || 'smooth' });
  }
  function scoreLine(d) {
    if (!d.of) return d.bad ? 'None of the themes on this board fit this scene, so ' + (d.bad > 1 ? 'your strings don\'t' : 'your string doesn\'t') + ' hold.' : 'Right: none of the themes on this board need this scene.';
    if (!d.bad && !d.miss) return d.of === 1 ? 'Your string holds. That\'s the one.' : 'Every string holds: you found all ' + words(d.of) + '.';
    return 'You found ' + d.ok + ' of ' + d.of + '.' + (d.bad ? ' ' + (d.bad > 1 ? words(d.bad).replace(/^./, function (c) { return c.toUpperCase(); }) + ' of your strings don\'t' : 'One of your strings doesn\'t') + ' hold.' : '');
  }
  function gDots() {
    var g = C.g;
    return '<div class="cb-dots">' + C.ids.map(function (mid) {
      var d = g.done[mid], now = mid === cur(), cls = 'cb-dot' + (now ? ' is-now' : d ? (d.bad || d.miss ? ' is-part' : ' is-full') : '') + (g.look === mid ? ' is-look' : '');
      var lb = 'Scene ' + num(mid) + ', ' + mom(mid).title + (d ? ': ' + d.ok + ' of ' + d.of + ' found' : now ? ': the one you\'re on' : '');
      return d && !now ? '<button type="button" class="' + cls + '" data-cb-look="' + mid + '" title="' + esc(lb) + '" aria-label="' + esc(lb) + '">' + num(mid) + '</button>'
        : '<span class="' + cls + '" title="' + esc(lb) + '">' + num(mid) + '</span>';
    }).join('') + '</div>';
  }
  function toBoard() { return coachSide() ? '' : ' <button type="button" class="cb-tob" data-cb-toboard>See it on the board ↓</button>'; }
  function gHead(mid, m) { return '<h2 class="cb-coach__h">' + esc(m.title) + '</h2><p class="cb-coach__n">Scene ' + num(mid) + (m.where ? ' · ' + esc(m.where) : '') + toBoard() + '</p>'; }
  // ---------- doing it yourself ----------
  // (the user, of Know it / Tie it / Check it: "it should feel like they are accomplishing it themself and they should
  // remember the scene and the quote"). Each step is something you do: Know it ends in a test with the scene hidden
  // (put what happens in order, fill the missing giveaway); Tie it is yours (a hint costs the star); Prove it asks you
  // to pick the real reason for one of your strings, then build the scene's line from memory. Up to three stars a
  // scene; the case ends with a round of its lines. The line is the scene's own quote, or the quote for one of the
  // themes it proves (both as checked in eng-data.js / eng-themes.js); scenes with neither are remembered by their
  // giveaways. G.x holds the scene's tests while you're on it: kt (the memory test), df (prove it), ln (the line).
  function lineOf(mid) {
    var m = mom(mid), c = T.scenes[mid].t, q = m.quote || null;
    ON().concat(T.themes).forEach(function (t) { var x = c[t.id]; if (!q && x && x[0] === 'yes' && x[2]) q = x[2]; });
    return q;
  }
  // the same shuffle every time for the same scene, never the right order
  function shuf(n, seed) {
    var a = [], h = hash(seed) || 7;
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) { h = (h * 1103515245 + 12345) & 0x7fffffff; var k = h % (j + 1), t = a[j]; a[j] = a[k]; a[k] = t; }
    if (n > 1 && a.every(function (x, i) { return x === i; })) a.push(a.shift());
    return a;
  }
  function X() {
    var cm = cur();
    if (!C.g.x || C.g.x.mid !== cm) C.g.x = { mid: cm, kt: null, df: null, ln: null, peek: false };
    return C.g.x;
  }
  function beatsOf(mid) { var m = mom(mid); return m.tell || [m.what]; }
  // the memory test: the beats to put in order, and one giveaway taken out of them with two from other scenes of the
  // same text to choose from
  function kStart(mid) {
    var beats = beatsOf(mid), gap = null, low = beats.join(' ').toLowerCase();
    beats.forEach(function (b, bi) {
      (T.hl[mid] || []).forEach(function (h) {
        var at = b.toLowerCase().indexOf(h[0].toLowerCase()), len = h[0].length, sc = len >= 10 && len <= 48 ? 100 - Math.abs(len - 26) : len;
        if (at >= 0 && (!gap || sc > gap.sc)) gap = { bi: bi, at: at, len: len, sc: sc, word: b.substr(at, len) };
      });
    });
    if (gap) {
      var pool = [];
      scenes(tidOf(mid)).forEach(function (o) { if (o !== mid) (T.hl[o] || []).forEach(function (h) { var l = h[0].length; if (low.indexOf(h[0].toLowerCase()) < 0 && l >= gap.len * 0.5 && l <= gap.len * 1.9) pool.push(h[0]); }); });
      var cap = function (s) { return /^[A-Z]/.test(gap.word) ? s.charAt(0).toUpperCase() + s.slice(1) : /^[A-Z]/.test(s) && !/^(I|I'|Andy|Red|Brooks|Hadley|Norton|Tommy|Sive|Mena|Mike|Nanna|Liam|Pats|Thomasheen|Seán|Carthalawn|Bill|Eileen|Sarah|Ned|Mrs|Mother|Mick|St)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; };
      var pick = shuf(pool.length, mid + 'g').slice(0, 2).map(function (i) { return cap(pool[i]); });
      gap.opts = [gap.word].concat(pick);
      gap.order = shuf(gap.opts.length, mid + 'go');
      gap.bad = -1;
    }
    return { phase: beats.length > 1 ? 'order' : gap ? 'gap' : 'done', ord: shuf(beats.length, mid + 'o'), got: [], bad: -1, miss: 0, gap: gap };
  }
  // prove it: why one of your strings holds, against the reasons other scenes hold for the same theme
  function dStart(mid, picks) {
    var t = ON().filter(function (x) { return picks[x.id] && isYes(mid, x.id) && cell(mid, x.id)[1]; })[0];
    if (!t) return null;
    var same = [], other = [];
    Object.keys(T.scenes).forEach(function (o) { var c = o !== mid && cell(o, t.id); if (c && c[0] === 'yes' && c[1]) (tidOf(o) === tidOf(mid) ? same : other).push(c[1]); });
    var pool = same.length >= 2 ? same : same.concat(other), wrong = shuf(pool.length, mid + t.id).slice(0, 2).map(function (i) { return pool[i]; });
    var opts = [cell(mid, t.id)[1]].concat(wrong);
    return { th: t.id, opts: opts, order: shuf(opts.length, mid + t.id + 'o'), bad: -1, miss: 0, done: false };
  }
  // the line in three to six pieces, shuffled, to put back together
  function lStart(q, seed) {
    var w = q.split(/\s+/).filter(Boolean), n = Math.min(w.length, Math.max(3, Math.min(6, Math.ceil(w.length / 2)))), parts = [];
    for (var i = 0; i < n; i++) parts.push(w.slice(Math.round(i * w.length / n), Math.round((i + 1) * w.length / n)).join(' '));
    return { q: q, parts: parts, order: shuf(parts.length, seed), used: {}, got: 0, bad: -1, miss: 0, done: false };
  }
  function stars(d) { return [d.k, d.s, d.l].filter(Boolean).length; }
  function starRow(n, of) { var s = ''; for (var i = 0; i < (of || 3); i++) s += i < n ? '★' : '☆'; return '<span class="cb-stars" aria-label="' + n + ' of ' + (of || 3) + ' stars">' + s + '</span>'; }
  // the line, being built: what you've put together so far, and the pieces left
  function lineHtml(ln, attr) {
    if (ln.done) return '<div class="cb-built is-done"><p class="cb-built__k">' + (ln.miss ? 'You built it' : 'You built it first time') + '</p><q class="sb-q">' + esc(ln.q) + '</q></div>';
    return '<div class="cb-built"><p class="cb-built__line">' + (ln.got ? esc(ln.parts.slice(0, ln.got).join(' ')) + ' ' : '') + '<span class="cb-blank">…</span></p></div>' +
      '<div class="cb-picks">' + ln.order.map(function (j) {
        return ln.used[j] ? '' : '<button type="button" class="cb-pickb' + (ln.bad === j ? ' is-bad' : '') + '" data-cb-q="' + attr + ':' + j + '">' + esc(ln.parts[j]) + '</button>';
      }).join('') + '</div>';
  }
  // a tap in one of the tests
  function gQ(v) {
    var a = v.split(':'), kind = a[0], j = +a[1], x = X(), cm = x.mid, full = false;
    if (kind === 'test') { x.kt = kStart(cm); full = true; }
    else if (kind === 'study') { x.kt = null; x.peek = true; full = true; }
    else if (kind === 'ord' && x.kt) {
      var kt = x.kt;
      if (j === kt.got.length) { kt.got.push(j); kt.bad = -1; if (kt.got.length === kt.ord.length) kt.phase = kt.gap ? 'gap' : 'done'; sfx('pop'); }
      else { kt.bad = j; kt.miss++; sfx('bonk'); }
      if (kt.phase === 'done') full = kDone(kt);
    } else if (kind === 'gap' && x.kt && x.kt.gap) {
      var gp = x.kt.gap;
      if (j === 0) { x.kt.phase = 'done'; gp.bad = -1; sfx('ding'); full = kDone(x.kt); } else { gp.bad = j; x.kt.miss++; sfx('bonk'); }
    } else if (kind === 'def' && x.df) {
      if (j === 0) { x.df.done = true; x.df.bad = -1; sfx('ding'); if (!lineOf(cm)) { C.g.done[cm].l = !x.df.miss; save(); full = true; } }
      else { x.df.bad = j; x.df.miss++; sfx('bonk'); }
    } else if ((kind === 'ln' || kind === 'qr') && (kind === 'ln' ? x.ln : C.g.qr && C.g.qr.ln)) {
      var ln = kind === 'ln' ? x.ln : C.g.qr.ln;
      if (ln.parts[j] === ln.parts[ln.got] && !ln.used[j]) { ln.used[j] = 1; ln.got++; ln.bad = -1; sfx('pop'); if (ln.got === ln.parts.length) { ln.done = true; sfx('stamp'); } }
      else { ln.bad = j; ln.miss++; sfx('bonk'); }
      if (ln.done && kind === 'ln') { C.g.done[cm].l = !ln.miss; save(); full = true; }
      if (ln.done && kind === 'qr') { C.g.qr.res.push(!ln.miss); }
    } else if (kind === 'qrgo') { qrNext(); }
    else if (kind === 'qrstart') { C.g.qr = { list: C.ids.filter(lineOf), i: -1, res: [] }; qrNext(); }
    else if (kind === 'qrend') { C.g.qr = null; }
    paint();
    if (kind === 'test' || kind === 'qrstart') sheetShow();
  }
  function kDone(kt) { C.g.ks = C.g.ks || {}; C.g.ks[X().mid] = !kt.miss && !X().peek; save(); return true; }
  function qrNext() { var r = C.g.qr; r.i++; r.ln = r.i < r.list.length ? lStart(lineOf(r.list[r.i]), r.list[r.i] + 'qr') : null; }
  // ---------- the tests, on the board ----------
  // (the user: "but still on teh board dont get me wronmg"): the memory test, proving a string and building the line
  // are done on a sheet pinned to the board, over the rows you don't need for it (on a phone, at the top of the board,
  // under the guide); the guide says what to do and what you've earned.
  function ensureCheck(cm) {
    var x = X();
    if (!x.df && !x.dfNone) { x.df = dStart(cm, pick(C.g.done[cm].p)); x.dfNone = !x.df; }
    if (lineOf(cm) && !x.ln) x.ln = lStart(lineOf(cm), cm + 'l');
    return x;
  }
  function sheetState() {
    var g = C.g, cm = cur();
    if (g.step === 'end') return g.qr && g.qr.ln ? 'qr' : null;
    if (!cm) return null;
    var x = X();
    if (g.step === 'read' && x.kt) return 'k';
    if (g.step === 'checked' && g.done[cm]) {
      ensureCheck(cm);
      if (x.df && !x.df.done) return 'df';
      if (x.ln && !x.ln.done) return 'ln';
    }
    return null;
  }
  function sheetHtml() {
    var st = sheetState();
    if (!st) return '';
    // it slides in when it first appears, not again with every tap
    var cm = cur(), x = cm ? X() : null, key = st + ':' + (cm || '') + ':' + (st === 'k' ? x.kt.phase : st === 'qr' ? C.g.qr.i : ''), fresh = key !== SHEET_LAST;
    SHEET_LAST = key;
    var h = '<div class="cb-sheet' + (fresh ? ' is-in' : '') + '" data-cb-sheet><i class="cb-sheet__pin is-a"></i><i class="cb-sheet__pin is-b"></i>';
    var tilt = function (k) { return ' style="--r:' + (((hash(k) % 7) - 3) * 0.6).toFixed(1) + 'deg"'; };
    if (st === 'k') {
      var kt = x.kt, beats = beatsOf(cm), title = mom(cm).title, first = !kt.miss && !x.peek;
      if (kt.phase === 'gap') {
        var gp = kt.gap, b = beats[gp.bi];
        h += '<p class="cb-sheet__k">Evidence · ' + esc(title) + '</p><h3 class="cb-sheet__h">Fill the gap: which giveaway was cut out of this note?</h3>' +
          '<div class="cb-gapnote"' + tilt(cm + 'gap') + '><i class="cb-note__pin"></i>' + esc(b.slice(0, gp.at)) + '<span class="cb-blank">' + (gp.bad >= 0 ? '?' : '') + '</span>' + esc(b.slice(gp.at + gp.len)) + '</div>' +
          '<div class="cb-strips">' + gp.order.map(function (i) { return '<button type="button" class="cb-strip' + (gp.bad === i ? ' is-bad' : '') + '" data-cb-q="gap:' + i + '"' + tilt(cm + 's' + i) + '>' + esc(gp.opts[i]) + '</button>'; }).join('') + '</div>' +
          (gp.bad >= 0 ? '<p class="cb-sheet__nope">That one\'s from another scene. Try again.</p>' : '');
      } else {
        var done = kt.phase === 'done', list = done ? beats.map(function (bt, i) { return i; }) : kt.ord;
        h += (done ? '<span class="cb-stamp">Known' + (first ? ' ★' : '') + '</span>' : '') +
          '<p class="cb-sheet__k">Evidence · ' + esc(title) + '</p><h3 class="cb-sheet__h">' + (done ? 'You pinned it together' + (first ? ', first time.' : '.') : 'What happens? From memory, tap the notes in order: what happens first, then next.') + '</h3>' +
          '<div class="cb-notes">' + list.map(function (i) {
            var at = done ? i : kt.got.indexOf(i);
            return '<button type="button" class="cb-note' + (at >= 0 ? ' is-placed' : '') + (kt.bad === i ? ' is-bad' : '') + '" data-cb-q="ord:' + i + '"' + (at >= 0 ? ' disabled' : '') + tilt(cm + 'n' + i) + '><i class="cb-note__pin"></i>' +
              (at >= 0 ? '<b class="cb-note__n">' + (at + 1) + '</b>' : '') + (done ? marked(cm, beats[i], false) : esc(beats[i])) + '</button>';
          }).join('') + '</div>' +
          (kt.bad >= 0 ? '<p class="cb-sheet__nope">Not that one yet. What comes ' + (kt.got.length ? 'next' : 'first') + '?</p>' : '') +
          (done ? '<div class="cb-sheet__go"><button type="button" class="sb-btn" data-cb-step="tie">Next: tie the strings ›</button></div>' : '');
      }
    } else if (st === 'df') {
      var df = x.df, tn = TH[df.th].name;
      h += '<p class="cb-sheet__k">Prove it · ' + esc(tn) + '</p><h3 class="cb-sheet__h">Your string holds. But why does ' + esc(mom(cm).title) + ' show ' + esc(tn.toLowerCase()) + '? Tap the note that\'s about this scene.</h3>' +
        '<div class="cb-notes">' + df.order.map(function (i) { return '<button type="button" class="cb-note' + (df.bad === i ? ' is-bad' : '') + '" data-cb-q="def:' + i + '"' + tilt(cm + 'd' + i) + '><i class="cb-note__pin"></i>' + esc(df.opts[i]) + '</button>'; }).join('') + '</div>' +
        (df.bad >= 0 ? '<p class="cb-sheet__nope">That\'s true of another scene. Which one is about ' + esc(mom(cm).title) + '?</p>' : '');
    } else {
      var qr = st === 'qr', ln = qr ? C.g.qr.ln : x.ln, of = qr ? mom(C.g.qr.list[C.g.qr.i]).title : mom(cm).title;
      h += (ln.done ? '<span class="cb-stamp">Got it' + (ln.miss ? '' : ' ★') + '</span>' : '') +
        '<p class="cb-sheet__k">' + (qr ? 'The lines · ' + (C.g.qr.i + 1) + ' of ' + C.g.qr.list.length : 'The line') + ' · ' + esc(of) + '</p><h3 class="cb-sheet__h">' + (ln.done ? 'You built it' + (ln.miss ? '.' : ' first time.') : 'Build the line from memory: tap the cut-outs in order.') + '</h3>' +
        '<div class="cb-lineplate">' + (ln.got ? esc(ln.parts.slice(0, ln.got).join(' ')) : '') + (ln.done ? '' : ' <span class="cb-blank"></span>') + '</div>' +
        (ln.done ? '' : '<div class="cb-cutouts">' + ln.order.map(function (j) { return ln.used[j] ? '' : '<button type="button" class="cb-cut is-v' + (hash(ln.parts[j] + j) % 4) + (ln.bad === j ? ' is-bad' : '') + '" data-cb-q="' + (qr ? 'qr' : 'ln') + ':' + j + '"' + tilt(of + j) + '>' + esc(ln.parts[j]) + '</button>'; }).join('') + '</div>') +
        (ln.bad >= 0 && !ln.done ? '<p class="cb-sheet__nope">Not that piece yet. What comes next?</p>' : '') +
        (qr && ln.done ? '<div class="cb-sheet__go"><button type="button" class="sb-btn" data-cb-q="qrgo">' + (C.g.qr.i + 1 < C.g.qr.list.length ? 'Next line ›' : 'Finish ›') + '</button></div>' : '');
    }
    return h + '<svg class="cb-sheet__str" data-cb-sheetstr aria-hidden="true"></svg></div>';
  }
  // Where the sheet goes: on a laptop, over the themes and the row the scene you're on isn't in; on a phone, at the top.
  // Returns its bottom, so the board is tall enough for it.
  function placeSheet(el) {
    var L = lay(), cm = cur(), tp = ON().map(function (t) { return AUTO['t:' + t.id]; }).filter(Boolean);
    var tTop = Math.min.apply(null, tp.map(function (p) { return p.y; })), tBot = Math.max.apply(null, tp.map(function (p) { return p.y; })) + L.th, y0, y1;
    if (LAYN === 'wide') {
      var up = !cm || (AUTO['s:' + cm] && AUTO['s:' + cm].y < tTop);
      if (up) { y0 = tTop - 26; y1 = Math.max(HB - 18, y0 + 560); } else { y0 = TOPY - 10; y1 = tBot + 26; }
      el.style.left = '30px'; el.style.width = (L.W - 60) + 'px'; el.style.top = y0 + 'px'; el.style.minHeight = (y1 - y0) + 'px';
    } else { el.style.left = '10px'; el.style.width = (L.W - 20) + 'px'; el.style.top = (TOPY - 8) + 'px'; el.style.minHeight = '0'; }
    return el.offsetTop + el.offsetHeight + 16;
  }
  // the red string from note to note, in the order you've pinned them
  function sheetStrings() {
    var sh = app.querySelector('[data-cb-sheet]'), svg = sh && sh.querySelector('[data-cb-sheetstr]'), x = cur() && X(), kt = x && x.kt;
    if (!svg) return;
    var w = sh.offsetWidth, hh = sh.offsetHeight, out = '';
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hh); svg.setAttribute('width', w); svg.setAttribute('height', hh);
    if (kt && kt.phase !== 'gap') {
      var ids = kt.phase === 'done' ? beatsOf(x.mid).map(function (b, i) { return i; }) : kt.got;
      var pts = ids.map(function (i) { var n = sh.querySelector('[data-cb-q="ord:' + i + '"] .cb-note__pin'), o = n && n.offsetParent; return n ? [o.offsetLeft + n.offsetLeft + n.offsetWidth / 2, o.offsetTop + n.offsetTop + n.offsetHeight / 2] : null; }).filter(Boolean);
      for (var k = 1; k < pts.length; k++) { var c = curve(pts[k - 1], pts[k]); out += '<path class="cb-str__shade" d="' + c.d + '"/><path class="cb-str__line" d="' + c.d + '"/>'; }
    }
    svg.innerHTML = out ? '<g class="cb-str is-now">' + out + '</g>' : '';
  }
  // bring the sheet into view
  function sheetShow() {
    var sh = app.querySelector('[data-cb-sheet]');
    if (!sh) return;
    var bar = document.querySelector('.sh-top'), top = (bar ? bar.offsetHeight : 76) + 10, r = sh.getBoundingClientRect();
    if (r.top < top || r.bottom > window.innerHeight - 10) window.scrollTo({ top: Math.max(0, window.scrollY + r.top - top), behavior: 'smooth' });
  }

  function coachHtml() {
    var g = C.g, cm = cur(), look = g.look && g.done[g.look] ? g.look : null;
    var h = '<aside class="cb-coach' + (coachSide() ? '' : ' is-flow') + '" data-cb-coach data-key="' + esc((cm || 'end') + ':' + g.step + ':' + (look || '')) + '" aria-label="Step by step">' +
      '<p class="cb-coach__k">Step by step · ' + esc(A.text(C.tid).title) + '</p>' + gDots();
    if (look) {
      var dl = g.done[look], lq = lineOf(look);
      return h + '<p class="cb-coach__back">Looking back</p>' + gHead(look, mom(look)) + '<div class="cb-score' + (dl.bad || dl.miss ? '' : ' is-perfect') + '"><b>' + esc(scoreLine(dl)) + '</b> ' + starRow(stars(dl)) + '</div>' +
        (lq ? '<div class="cb-learn"><p class="cb-learn__k">The line</p><q class="sb-q">' + esc(lq) + '</q></div>' : '') +
        why(look, pick(dl.p), true) + '<div class="cb-coach__go"><button type="button" class="sb-btn" data-cb-look="">' + (cm ? 'Back to scene ' + num(cm) + ' ›' : 'Back to the case ›') + '</button></div></aside>';
    }
    if (!cm) return h + gEnd() + '</aside>';
    var m = mom(cm), si = { read: 0, tie: 1, checked: 2 }[g.step], x = X(), q = lineOf(cm);
    h += '<ol class="cb-steps">' + ['Know it', 'Tie it', 'Prove it'].map(function (s, j) { return '<li class="' + (j < si ? 'is-done' : j === si ? 'is-on' : '') + '"><b>' + (j + 1) + '</b>' + s + '</li>'; }).join('') + '</ol>' + gHead(cm, m);
    if (g.step === 'read') {
      var kt = x.kt;
      if (!kt) {
        var wb = watchBtn(cm);
        return h + '<div class="cb-do"><p><b>Step 1: know the scene.</b> Read it, or watch it, until you could tell it to someone: where it is, who\'s there, what\'s said and what\'s done. Then you\'ll be tested on it, with the text hidden.</p></div>' +
          fixed(cm, false) + (wb ? '<p class="sb-row is-left">' + wb + '</p>' : '') +
          (q ? '<div class="cb-learn"><p class="cb-learn__k">Learn this line. You\'ll build it from memory at the end.</p><q class="sb-q">' + esc(q) + '</q></div>'
            : '<p class="cb-coach__tip">There\'s no line from this scene checked word for word here, so learn it by its giveaways, the <mark class="cb-hl">highlighted</mark> words.</p>') +
          '<div class="cb-coach__go"><button type="button" class="sb-btn" data-cb-q="test">I\'ve got it: test me ›</button></div></aside>';
      }
      var beats = beatsOf(cm);
      if (kt.phase !== 'done') return h + (kt.phase === 'gap' ? '<div class="cb-ok">You put it in order' + (kt.miss ? '.' : ' first time.') + '</div>' : '') +
        '<div class="cb-do"><p><b>' + (kt.phase === 'order' ? 'On the board: what happens, from memory.' : 'On the board: fill the gap.') + '</b> ' +
        (kt.phase === 'order' ? 'The scene\'s card is covered. Tap the notes on the board in the order things happen.' : 'One giveaway has been cut out of a note. Tap the strip that goes in the gap.') + '</p></div>' +
        '<div class="cb-coach__go"><button type="button" class="sb-btn is-quiet" data-cb-q="study">Let me look again</button></div></aside>';
      var first = !kt.miss && !x.peek;
      return h + '<div class="cb-score is-perfect"><b>' + (first ? 'You know this scene: every answer right first time.' : 'You know this scene now.') + '</b> ' + (first ? '<span class="cb-stars">★</span>' : '') + '</div>' +
        '<ol class="cb-placed">' + beats.map(function (bt) { return '<li>' + marked(cm, bt, false) + '</li>'; }).join('') + '</ol>' +
        '<div class="cb-coach__go"><button type="button" class="sb-btn" data-cb-step="tie">Next: tie the strings ›</button></div></aside>';
    }
    if (g.step === 'tie') {
      var on = strung(cm), n = Object.keys(on).length;
      return h + '<div class="cb-do"><p><b>Step 2: tie the strings, yourself.</b> Tie this scene to every theme you could write a whole paragraph about. Tap a theme on the board or below, or drag the scene\'s red pin to it. Tap it again to untie it.</p>' +
        '<p>For each theme, ask: does something happen here that shows it? If it\'s only a little, leave it out. Get them all with no hints for a star.</p></div>' +
        '<p class="cb-coach__sub">What happens</p><ol class="cb-coach__beats">' + beatsOf(cm).map(function (bt) { return '<li>' + marked(cm, bt, false) + '</li>'; }).join('') + '</ol>' +
        '<p class="cb-coach__sub">Tie it to</p><div class="cb-ties">' + ON().map(function (t) {
          return '<button type="button" class="sb-chip" data-cb-gtie="' + t.id + '" aria-pressed="' + !!on[t.id] + '">' + esc(t.name) + '</button>';
        }).join('') + '</div>' +
        '<p class="cb-coach__count">' + (n ? 'Tied to ' + words(n) + ' theme' + (n > 1 ? 's' : '') + '.' : 'Nothing tied yet.') + '</p>' +
        '<div class="cb-hintbox">' + (g.msg ? '<p class="cb-hint">' + g.msg + '</p>' : '') + '<button type="button" class="sb-btn is-quiet" data-cb-ghint>' + (g.hint ? 'Another hint' : 'Give me a hint (costs the star)') + '</button></div>' +
        '<div class="cb-coach__go"><button type="button" class="sb-btn is-quiet" data-cb-step="read">‹ The scene</button><button type="button" class="sb-btn" data-cb-gcheck>Check my strings ›</button></div></aside>';
    }
    var d = g.done[cm], yes = yesOf(cm);
    ensureCheck(cm);
    var df = x.df, proved = !df || df.done, built = !q || (x.ln && x.ln.done);
    h += '<div class="cb-score' + (d.bad || d.miss ? '' : ' is-perfect') + '"><b>' + esc(scoreLine(d)) + '</b>' + (d.s ? ' <span class="cb-stars">★</span>' : '') + '</div>';
    if (!proved) return h + '<div class="cb-do"><p><b>Step 3: prove it.</b> Your string to <b>' + esc(TH[df.th].name) + '</b> holds. But why? On the board, tap the note that\'s about this scene.</p></div></aside>';
    h += df ? '<div class="cb-ok">' + (df.miss ? 'You proved it.' : 'You proved it first time.') + '</div>' : '';
    if (!built) return h + '<div class="cb-do"><p><b>Now the line, from memory.</b> On the board, tap the cut-out pieces in order to build the line you learned at the start.</p></div></aside>';
    if (q) h += '<p class="cb-coach__sub">The line</p>' + lineHtml(x.ln, 'ln');
    h += '<p class="cb-coach__sub">Every theme, and why</p>' + why(cm, pick(d.p), true);
    return h + '<div class="cb-remember"><p>Remember: this scene is your evidence for</p>' + (yes.length ? yes.map(function (t) { return '<span>' + esc(t.name) + '</span>'; }).join('') : '<em>none of the themes on this board</em>') + '</div>' +
      '<div class="cb-earned">This scene: ' + starRow(stars(d)) + '<small>' + ['know it from memory', 'every string, no hints', q ? 'the line first time' : 'proved first time'].map(function (s, i) { return '<span class="' + ([d.k, d.s, d.l][i] ? 'is-got' : '') + '">' + s + '</span>'; }).join('') + '</small></div>' +
      '<p class="cb-coach__tip">When you go on, the strings that don\'t hold are cut and any you missed are tied for you, dashed, so the board ends up right.</p>' +
      '<div class="cb-coach__go"><button type="button" class="sb-btn is-quiet" data-cb-gagain>Try it again</button><button type="button" class="sb-btn" data-cb-gnext>' + (g.at + 1 < C.ids.length ? 'Next scene ›' : 'Close the case ›') + '</button></div></aside>';
  }
  // The end of the case: your stars, the evidence for each theme (dashed: missed the first time), and a round of the
  // case's lines from memory.
  function gEnd() {
    var g = C.g, ok = 0, of = 0, bad = 0, st = 0, nx = cases(S.text)[C.n], lines = C.ids.filter(lineOf);
    C.ids.forEach(function (mid) { var d = g.done[mid]; if (d) { ok += d.ok; of += d.of; bad += d.bad; st += stars(d); } });
    var r = g.qr;
    if (r) {
      if (r.ln) return '<h2 class="cb-coach__h">The lines, from memory</h2><p class="cb-coach__n">Line ' + (r.i + 1) + ' of ' + r.list.length + '</p>' +
        '<div class="cb-do"><p>On the board: build the line from <b>' + esc(mom(r.list[r.i]).title) + '</b>.</p></div>' + (r.ln.done ? lineHtml(r.ln, 'qr') : '') +
        '<div class="cb-coach__go">' + (r.ln.done ? '<button type="button" class="sb-btn" data-cb-q="qrgo">' + (r.i + 1 < r.list.length ? 'Next line ›' : 'Finish ›') + '</button>' : '<button type="button" class="sb-btn is-quiet" data-cb-q="qrend">Stop</button>') + '</div>';
      var firsts = r.res.filter(Boolean).length, miss = r.list.filter(function (mid, i) { return !r.res[i]; });
      return '<h2 class="cb-coach__h">You know ' + firsts + ' of ' + r.list.length + ' lines</h2><p class="cb-coach__n">first time, from memory</p>' +
        (miss.length ? '<div class="cb-do"><p><b>Go over these:</b> ' + miss.map(function (mid) { return esc(mom(mid).title); }).join(' · ') + '</p></div>' : '<div class="cb-score is-perfect"><b>Every line, first time.</b></div>') +
        '<div class="cb-coach__go"><button type="button" class="sb-btn is-quiet" data-cb-q="qrstart">Again</button><button type="button" class="sb-btn" data-cb-q="qrend">Back to the case ›</button></div>';
    }
    return '<h2 class="cb-coach__h">Case closed</h2><p class="cb-coach__n">' + esc(caseWhat()) + ' of ' + esc(A.text(C.tid).title) + '</p>' +
      '<div class="cb-score' + (ok === of && !bad ? ' is-perfect' : '') + '"><b>You found ' + ok + ' of the ' + of + ' strings yourself' + (bad ? ', and ' + bad + (bad > 1 ? ' others didn\'t' : ' other didn\'t') + ' hold' : '') + '.</b><br>' + '<span class="cb-stars">★</span> <small>' + st + ' of ' + C.ids.length * 3 + ' stars</small></div>' +
      (lines.length ? '<div class="cb-learn"><p class="cb-learn__k">Last test: the ' + words(lines.length) + ' lines from this case, from memory.</p><button type="button" class="sb-btn" data-cb-q="qrstart">Start the round ›</button></div>' : '') +
      '<div class="cb-do"><p><b>Your evidence, theme by theme.</b> These are the scenes to use for each theme. Dashed ones you missed the first time: tap one to go over it again.</p></div>' +
      '<ul class="cb-bank">' + ON().map(function (t) {
        var ids = C.ids.filter(function (mid) { return isYes(mid, t.id); });
        return '<li><b>' + esc(t.name) + '</b>' + (ids.length ? '<span>' + ids.map(function (mid) {
          var d = g.done[mid], missed = d && d.p.indexOf(t.id) < 0;
          return '<button type="button" class="cb-chipb' + (missed ? ' is-missed' : '') + '" data-cb-look="' + mid + '">' + num(mid) + ' · ' + esc(mom(mid).title) + '</button>';
        }).join('') + '</span>' : '<span class="is-none">Nothing in this case.</span>') + '</li>';
      }).join('') + '</ul>' +
      '<div class="cb-coach__go"><button type="button" class="sb-btn is-quiet" data-cb-grestart>Do this case again</button><button type="button" class="sb-btn" data-cb-go="1">' + (nx ? 'Next case: ' + esc(short(tidOf(nx[0]))) + ' ›' : 'Back to case 1 ›') + '</button></div>';
  }

  // ---------- By theme ----------
  function themeHtml() {
    var t = TH[S.theme];
    var chip = function (x) { return '<button type="button" class="sb-chip" data-sb-theme="' + x.id + '" aria-pressed="' + (x.id === S.theme) + '">' + esc(x.name) + (x.times ? ' <small>×' + x.times + '</small>' : '') + '</button>'; };
    var h = '<p class="sb-chips__k is-row">Came up in past papers</p><div class="sb-chips" role="group" aria-label="Themes from past papers">' + T.themes.filter(function (x) { return x.came; }).map(chip).join('') + '</div>' +
      '<p class="sb-chips__k is-row">Never named in a question (you can still choose them in Theme or Issue)</p><div class="sb-chips" role="group" aria-label="Other themes">' + T.themes.filter(function (x) { return !x.came; }).map(chip).join('') + '</div>' +
      '<h2 class="sb-h2">' + esc(t.name) + '</h2><p class="sb-themeask">' + esc(t.ask) + '</p>' +
      (t.came ? '<p class="sb-came"><b>Came up ' + (t.times === 1 ? 'once' : t.times + ' times') + ':</b> ' + esc(t.came) + '.</p>' : '<p class="sb-came is-never">Never named in a past question. You can still choose it in Theme or Issue, where you pick the theme.</p>');
    var counts = T.texts.map(function (tid) { return [tid, scenes(tid).filter(function (mid) { return isYes(mid, t.id); }).length]; });
    var gap = counts.filter(function (c) { return !c[1]; });
    h += '<p class="sb-works">' + counts.map(function (c) { return '<span class="' + (c[1] ? '' : 'is-none') + '">' + esc(short(c[0])) + ': ' + (c[1] ? c[1] + ' scene' + (c[1] > 1 ? 's' : '') : 'nothing') + '</span>'; }).join('') + '</p>' +
      (gap.length ? '<p class="sb-warn">' + gap.map(function (c) { return esc(A.text(c[0]).title); }).join(' and ') + ' has nothing to write about ' + esc(t.name.toLowerCase()) +
        '. In Theme or Issue you choose the theme, and it has to work for all three of your texts, so pick a different one if you can.' + (gap.some(function (c) { return T.gaps && T.gaps[t.id] && T.gaps[t.id][c[0]]; }) ? ' If you\'re stuck with it, there\'s a way to handle it below.' : '') + '</p>' : '');
    h += '<div class="sb-cols">' + T.texts.map(function (tid) {
      var ids = scenes(tid), yes = ids.filter(function (mid) { return isYes(mid, t.id); }), thin = ids.filter(function (mid) { var c = cell(mid, t.id); return c && c[0] === 'thin'; });
      return '<section class="sb-colt" style="--c:' + (A.COL[tid] || '#13233A') + '"><h3 class="sb-colt__h">' + esc(A.text(tid).title) + '</h3>' + noteHtml(t.id, tid) +
        (yes.length ? yes.map(function (mid) {
          var c = cell(mid, t.id), p = pic(mid), m = mom(mid);
          return '<a class="sb-use" href="#board/scene/' + mid + '">' + (p ? '<img src="' + esc(p) + '" alt="" loading="lazy">' : '') + '<span class="sb-use__t">' + esc(m.title) + '</span>' +
            '<span class="sb-use__w">' + esc(m.where) + '</span><span class="sb-use__s">' + esc(c[1]) + '</span>' + (c[2] ? '<q class="sb-q">' + esc(c[2]) + '</q>' : '') + '</a>';
        }).join('') : gapHtml(t.id, tid)) +
        (thin.length ? '<details class="sb-skip"><summary>Skip these: they touch it, but there\'s nothing to write</summary><ul>' + thin.map(function (mid) {
          return '<li><b>' + esc(mom(mid).title) + '</b> ' + esc(cell(mid, t.id)[1]) + '</li>';
        }).join('') + '</ul></details>' : '') + '</section>';
    }).join('') + '</div>';
    return h;
  }

  // A weak text for this theme: what angle to take, a moment beyond the key scenes, and a comparing sentence.
  function noteHtml(th, tid) {
    var g = T.notes && T.notes[th] && T.notes[th][tid];
    if (!g) return '';
    return '<div class="sb-gap is-note"><p class="sb-gap__h">How to use this text for it</p><p>' + esc(g.say) + '</p>' + (g.extra || []).map(function (x) {
      return '<div class="sb-use is-gap"><span class="sb-use__t">' + esc(x[0]) + '</span><span class="sb-use__w">' + esc(x[1]) + '</span><span class="sb-use__s">' + esc(x[2]) + '</span></div>';
    }).join('') + '<p class="sb-gap__c"><b>Comparing:</b> ' + esc(g.compare) + '</p></div>';
  }
  // A text with nothing for this theme: how to write about it anyway, if you're stuck with it (EngThemes.gaps).
  function gapHtml(th, tid) {
    var g = T.gaps && T.gaps[th] && T.gaps[th][tid];
    if (!g) return '<p class="sb-empty">No scene works for this theme.</p>';
    return '<div class="sb-gap"><p class="sb-gap__h">If you\'re stuck with this theme</p><p>' + esc(g.say) + '</p>' + g.scenes.map(function (x) {
      var m = mom(x[0]);
      return '<a class="sb-use is-gap" href="#board/scene/' + x[0] + '"><span class="sb-use__t">' + esc(m.title) + '</span><span class="sb-use__w">' + esc(m.where) + '</span><span class="sb-use__s">' + esc(x[1]) + '</span></a>';
    }).join('') + '<p class="sb-gap__c"><b>Comparing:</b> ' + esc(g.compare) + '</p></div>';
  }

  // ---------- By scene ----------
  function sceneHtml() {
    var ids = scenes(S.text);
    if (ids.indexOf(S.scene) < 0) S.scene = ids[0];
    var k = ids.indexOf(S.scene), mid = S.scene, m = mom(mid), tid = tidOf(mid), p = pic(mid);
    return textChips() + '<div class="sb-top"><button type="button" class="sb-arrow" data-sb-go="-1" aria-label="Previous scene">‹</button><span>' + (k + 1) + ' of ' + ids.length + ' · ' + esc(short(tid)) + '</span>' +
      '<button type="button" class="sb-arrow" data-sb-go="1" aria-label="Next scene">›</button></div>' +
      '<article class="sb-card is-solo" style="--c:' + (A.COL[tid] || '#13233A') + '">' + (p ? '<img class="sb-card__img" src="' + esc(p) + '" alt="">' : '') +
      '<div class="sb-card__body"><p class="sb-card__tag">' + esc(A.text(tid).title) + '</p><h3 class="sb-card__h">' + esc(m.title) + '</h3>' + fixed(mid, true) +
      '<p class="sb-row is-left">' + watchBtn(mid) + '</p></div></article>' +
      '<p class="sb-works is-mid">' + yesOf(mid).map(function (t) { return '<span>' + esc(t.name) + '</span>'; }).join('') + '</p>' + why(mid, {}, false);
  }

  // ---------- taps and keys ----------
  window.addEventListener('resize', function () {
    if (!app || S.mode !== 'board' || !app.querySelector('[data-cb-board]')) return;
    var n = (app.clientWidth || window.innerWidth) >= 900 ? 'wide' : 'narrow';
    if (n !== LAYN || (guided() && coachSide() !== SIDE_WAS)) paint(); else { scale(); strings(); }
  });
  document.addEventListener('click', function (e) {
    if (!app || !app.querySelector('.sb') || !app.contains(e.target)) return;
    var t = e.target, x;
    if ((x = t.closest('[data-cb-watch]'))) { e.preventDefault(); if (A.watch) A.watch(x.getAttribute('data-cb-watch'), S.mode === 'theme' ? S.theme : null); return; }
    if ((x = t.closest('[data-sb-mode]'))) {
      var gm = x.getAttribute('data-cb-mode');
      if (gm) { GUIDE = gm === 'guide'; store('eng-cork-mode', GUIDE ? 'guide' : 'free'); S.sel = null; S.arm = null; SEEN_BOARD = false; }
      S.mode = x.getAttribute('data-sb-mode'); history.replaceState(null, '', '#board'); paint();
      if (gm === 'guide' && !coachSide()) showNow(true);
      return;
    }
    if ((x = t.closest('[data-sb-text]'))) {
      var was0 = C && C.ids[0], n0 = 1; S.text = x.getAttribute('data-sb-text');
      if (S.mode === 'board') { cases(S.text).forEach(function (ids, i) { if (ids.indexOf(was0) >= 0) n0 = i + 1; }); goCase(n0); }
      paint(); return;
    }
    if ((x = t.closest('[data-sb-theme]'))) { S.theme = x.getAttribute('data-sb-theme'); paint(); return; }
    if ((x = t.closest('[data-sb-go]'))) { var ids = scenes(S.text), k = ids.indexOf(S.scene) + +x.getAttribute('data-sb-go'); S.scene = ids[(k + ids.length) % ids.length]; paint(); return; }
    if (t.closest('[data-cb-check]')) { check(); return; }
    if (t.closest('[data-cb-miss]')) { S.miss = !S.miss; paint(); return; }
    if (t.closest('[data-cb-close]')) { select(null); return; }
    if ((x = t.closest('[data-cb-zoom]'))) {
      ZOOM = Math.round(Math.max(0.5, Math.min(1, ZOOM + 0.1 * +x.getAttribute('data-cb-zoom'))) * 100) / 100;
      try { localStorage.setItem('eng-cork-zoom', String(ZOOM)); } catch (er) {}
      scale();
      Array.prototype.forEach.call(app.querySelectorAll('[data-cb-zoom]'), function (b) { b.disabled = +b.getAttribute('data-cb-zoom') < 0 ? ZOOM <= 0.5 : ZOOM >= 1; });
      return;
    }
    if ((x = t.closest('[data-cb-detail]'))) { DETAIL = x.getAttribute('data-cb-detail'); try { localStorage.setItem('eng-cork-detail', DETAIL); } catch (er) {} paint(); return; }
    if ((x = t.closest('[data-cb-th]'))) { ALLTH = x.getAttribute('data-cb-th') === 'all'; try { localStorage.setItem('eng-cork-th', ALLTH ? 'all' : 'past'); } catch (er) {} S.sel = null; paint(); return; }
    if ((x = t.closest('[data-cb-per]'))) {
      var was = C.ids[0]; CASE_N = +x.getAttribute('data-cb-per'); store('eng-cork-per', String(CASE_N));
      // stay on the case that has the scene you were looking at
      var list = cases(S.text), k = 0; list.forEach(function (ids, i) { if (ids.indexOf(was) >= 0) k = i; });
      goCase(k + 1); paint(); return;
    }
    if ((x = t.closest('[data-cb-go]'))) { goCase(C.n + +x.getAttribute('data-cb-go')); paint(); var bar = app.querySelector('.cb-bar'); if (bar) window.scrollTo({ top: Math.max(0, bar.getBoundingClientRect().top + window.scrollY - 90), behavior: 'smooth' }); return; }
    if (t.closest('[data-cb-clear]')) { C.strings = []; C.checked = false; C.g = freshGuide(null); S.sel = null; save(); paint(); return; }
    if ((x = t.closest('[data-cb-mode]'))) {
      GUIDE = x.getAttribute('data-cb-mode') === 'guide'; store('eng-cork-mode', GUIDE ? 'guide' : 'free');
      S.sel = null; S.arm = null; SEEN_BOARD = false; paint(); if (GUIDE && !coachSide()) showNow(true); return;
    }
    if ((x = t.closest('[data-cb-gtie]'))) { gTap('t:' + x.getAttribute('data-cb-gtie')); return; }
    if ((x = t.closest('[data-cb-step]'))) { C.g.step = x.getAttribute('data-cb-step'); if (C.g.step === 'read' && C.g.x) C.g.x.kt = null; save(); paint(); coachTop(); return; }
    if (t.closest('[data-cb-gcheck]')) { gCheck(); return; }
    if ((x = t.closest('[data-cb-q]'))) { gQ(x.getAttribute('data-cb-q')); return; }
    if (t.closest('[data-cb-toboard]')) {
      var nc = app.querySelector('.cb-scene.is-now') || app.querySelector('[data-cb-wrap]'), tb = document.querySelector('.sh-top');
      if (nc) window.scrollTo({ top: Math.max(0, nc.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 76) - 16), behavior: 'smooth' });
      return;
    }
    if (t.closest('[data-cb-gnext]')) { gNext(); return; }
    if (t.closest('[data-cb-gagain]')) { gAgain(); return; }
    if (t.closest('[data-cb-ghint]')) { gHint(); return; }
    if (t.closest('[data-cb-grestart]')) { C.strings = []; C.checked = false; C.g = freshGuide(null); save(); paint(); showNow(true); return; }
    if ((x = t.closest('[data-cb-look]'))) { C.g.look = x.getAttribute('data-cb-look') || null; paint(); coachTop(); return; }
    if ((x = t.closest('[data-cb-tie]'))) {
      var v = x.getAttribute('data-cb-tie').split('|'), have = -1;
      C.strings.forEach(function (y, i) { if (y.s === v[0] && y.t === v[1]) have = i; });
      if (have >= 0) cut(have); else tie('s:' + v[0], 't:' + v[1]);
      S.sel = 's:' + v[0]; paint(); return;
    }
    if ((x = t.closest('[data-cb-cut]'))) { var c = x.getAttribute('data-cb-cut'); if (/^\d+$/.test(c)) cut(+c); paint(); return; }
    if ((x = t.closest('[data-cb-sel]'))) { select(x.getAttribute('data-cb-sel')); var f = app.querySelector('[data-cb-file]'); if (f) f.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  });
  document.addEventListener('keydown', function (e) {
    if (!app || S.mode !== 'board' || !app.querySelector('[data-cb-board]')) return;
    var c = e.target.closest && e.target.closest('.cb-card');
    if (c && (e.key === 'Enter' || e.key === ' ') && guided()) { e.preventDefault(); gTap(c.getAttribute('data-k')); return; }
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var k = c.getAttribute('data-k'); if (S.arm && S.arm !== k) { var a = S.arm; S.arm = null; tie(a, k); paint(); } else select(k); }
    if (e.key === 'Escape' && S.arm) { S.arm = null; paint(); }
    else if (e.key === 'Escape' && sideOn()) select(null);
  });

  window.EngBoard = { render: render };
})();

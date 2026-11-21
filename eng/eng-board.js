// The Scene board (english.html#board): a detective's corkboard. The user, of the first version: "nah put it on a
// bulletin board with strings like ur a detective figuring out whats what", "and u get to actually watch them too",
// "and u move the pins and strings urself", "and in teh descriptions of the scenes pt highlights on important parts
// like "better off parents" kind of highlight the giveaways". Content: eng/eng-themes.js.
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
  var TAG = { power: 'Power', education: 'Education', women: 'Women', hope: 'Hope', freedom: 'Freedom', money: 'Money', religion: 'Church', courage: 'Courage' };
  var LAY = {
    wide: { W: 1400, sw: 400, tw: 250, th: 80, full: true },
    narrow: { W: 620, H: 940, sw: 180, sh: 214, tw: 272, th: 70 }
  };
  var C = null, DRAG = null, LAYN = 'wide', K = 1, AUTO = {}, HB = 0, TOPY = 74;
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
  function yesOf(mid) { return T.themes.filter(function (t) { return isYes(mid, t.id); }); }
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
    T.themes.forEach(function (t) {
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
    return A.title('Scene board') +
      '<p class="sb-lead">You\'re the detective. Every scene is evidence; tie it with string to every theme it proves. The scene never changes (where it is, who\'s there, what\'s said and done): what it proves depends on the theme.</p>' +
      '<div class="sb-tabs" role="group" aria-label="How to use the board">' + tab('board', 'The board') + tab('theme', 'By theme') + tab('scene', 'By scene') + '</div>';
  }
  function textChips() {
    var chip = function (id, label) { return '<button type="button" class="sb-chip" data-sb-text="' + id + '" aria-pressed="' + (S.text === id) + '">' + esc(label) + '</button>'; };
    var per = function (n) { return '<button type="button" class="sb-chip" data-cb-per="' + n + '" aria-pressed="' + (CASE_N === n) + '">' + n + ' scenes</button>'; };
    return '<div class="sb-chips" role="group" aria-label="Which text">' + chip('all', 'All three') + T.texts.map(function (t) { return chip(t, short(t)); }).join('') +
      (S.mode === 'board' ? '<span class="sb-chips__gap" aria-hidden="true"></span><span class="sb-chips__k">On the board</span>' + per(12) + per(6) : '') + '</div>';
  }
  function paint() {
    var h = head();
    if (S.mode === 'board') h += corkHtml();
    else if (S.mode === 'theme') h += themeHtml();
    else h += sceneHtml();
    app.innerHTML = '<div class="sb' + (S.mode === 'board' ? ' is-cork' : '') + '">' + h + '</div>';
    if (S.mode === 'board') { layout(); scale(); strings(); }
  }

  // ---------- the case: six scenes on the board ----------
  // The cases go through the scenes in story order (the user: "make it all by scene automatically on the board"):
  // with All three, case 1 is scenes 1 and 2 of each text, case 2 scenes 3 and 4, and so on to 11 and 12; with one
  // text, its scenes six at a time. Each case keeps its own strings and card positions (eng-cork-case:<text>:<n>);
  // eng-cork-at is the case you were on.
  function cases(tid) {
    var out = [];
    if (tid === 'all') {
      var n = Math.max.apply(null, T.texts.map(function (t) { return scenes(t).length; }));
      for (var k = 0; k < n; k += CASE_N / T.texts.length) out.push(T.texts.reduce(function (ids, t) { return ids.concat(scenes(t).slice(k, k + CASE_N / T.texts.length)); }, []));
    } else for (var j = 0, all = scenes(tid); j < all.length; j += CASE_N) out.push(all.slice(j, j + CASE_N));
    return out;
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
    try { saved = JSON.parse(store('eng-cork-case:' + S.text + ':' + CASE_N + ':' + n) || 'null'); } catch (e) {}
    saved = saved || {};
    C = { n: n, of: of, ids: sortIds(list[n - 1]), text: S.text, pos: saved.pos || {}, checked: !!saved.checked,
      strings: (saved.strings || []).filter(function (x) { return T.scenes[x.s] && TH[x.t] && list[n - 1].indexOf(x.s) >= 0; }) };
    S.sel = null; S.arm = null; S.miss = false;
    store('eng-cork-at', JSON.stringify({ text: S.text, n: n }));
  }
  function save() {
    store('eng-cork-case:' + C.text + ':' + CASE_N + ':' + C.n, JSON.stringify({ strings: C.strings, pos: C.pos, checked: C.checked }));
    store('eng-cork-at', JSON.stringify({ text: C.text, n: C.n }));
  }
  // which scenes this case is: "scenes 3 and 4" (All three) or "scenes 1 to 6"
  function caseWhat() {
    var nums = C.ids.map(function (mid) { return +mid.replace(/^.*-/, ''); }), lo = Math.min.apply(null, nums), hi = Math.max.apply(null, nums);
    return lo === hi ? 'scene ' + lo : hi - lo === 1 ? 'scenes ' + lo + ' and ' + hi : 'scenes ' + lo + ' to ' + hi;
  }
  function lay() { return LAY[LAYN]; }
  function jit(k, n) { return (hash(k) % (2 * n + 1)) - n; }
  // Where cards go until you move them: on laptops the full scene cards (the user: "just make it like these were ...
  // on the bulletin board") in a row along the top and the bottom, the themes in two rows between them, placed from
  // the cards' real heights; on phones, small photos.
  // Rows of scene cards: with All three, a row is the next scene of each text (so each text keeps its column); with one
  // text, three at a time in story order. The first half of the rows go above the themes, the rest below.
  function placeAuto() {
    var L = lay(), hs = {}, rows = [];
    if ((C.text || 'all') === 'all') {
      var by = T.texts.map(function (t) { return C.ids.filter(function (mid) { return tidOf(mid) === t; }); }), n = Math.max.apply(null, by.map(function (g) { return g.length; }));
      for (var r = 0; r < n; r++) rows.push(by.map(function (g) { return g[r] || null; }));
    } else for (var j = 0; j < C.ids.length; j += 3) rows.push(C.ids.slice(j, j + 3));
    Array.prototype.forEach.call(app.querySelectorAll('.cb-card'), function (el) { hs[el.getAttribute('data-k')] = el.offsetHeight; });
    var hOf = function (k) { return hs[k] || (k.charAt(0) === 's' ? L.sh || 420 : L.th); };
    var wide = LAYN === 'wide', colX = wide ? function (i) { return 30 + i * 465; } : function (i) { return 14 + i * 202; }, gap = wide ? 34 : 22;
    var up = rows.slice(0, Math.ceil(rows.length / 2)), down = rows.slice(Math.ceil(rows.length / 2)), y = TOPY;
    AUTO = {};
    var put = function (row) {
      var h = 0;
      row.forEach(function (mid, i) { if (!mid) return; AUTO['s:' + mid] = { x: colX(i) + jit(mid, wide ? 10 : 2), y: y + jit(mid + 'y', wide ? 5 : 3) }; h = Math.max(h, hOf('s:' + mid)); });
      y += h + gap;
    };
    up.forEach(put);
    y += wide ? 30 : 16;
    T.themes.forEach(function (t, i) {
      AUTO['t:' + t.id] = wide ? { x: 60 + (i % 4) * 330 + jit(t.id, 18), y: y + (i < 4 ? 0 : 124) + jit(t.id + 'y', 10) }
        : { x: 26 + (i % 2) * 296 + jit(t.id, 6), y: y + Math.floor(i / 2) * 96 + jit(t.id + 'y', 6) };
    });
    y += wide ? 124 + L.th + 64 : 4 * 96 + 18;
    down.forEach(put);
  }
  function moved() { return C.pos[LAYN] = C.pos[LAYN] || {}; }
  function pos(key) { return moved()[key] || AUTO[key] || { x: 0, y: 0 }; }
  function size(key) {
    var L = lay(), el = app && app.querySelector('.cb-card[data-k="' + key + '"]');
    return key.charAt(0) === 's' ? [L.sw, el ? el.offsetHeight : L.sh || 420] : [L.tw, el ? el.offsetHeight : L.th];
  }
  function rot(key) { return LAY[LAYN].full && key.charAt(0) === 's' ? ((hash(key) % 5) - 2) * 0.45 : ((hash(key) % 9) - 4) * 0.6; }
  // Where a card's pin is, on the board: its top middle, turned with the card.
  function pinAt(key) {
    var p = pos(key), sz = size(key), r = rot(key) * Math.PI / 180, cx = p.x + sz[0] / 2, cy = p.y + sz[1] / 2, d = -sz[1] / 2 + 13;
    return [cx - d * Math.sin(r), cy + d * Math.cos(r)];
  }
  function strung(mid) { var o = {}; C.strings.forEach(function (x) { if (x.s === mid) o[x.t] = true; }); return o; }

  function corkHtml() {
    LAYN = (app.clientWidth || window.innerWidth) >= 900 ? 'wide' : 'narrow';
    TOPY = LAYN === 'wide' ? 74 : 52;
    var L = lay(), res = C.checked ? tally() : null;
    var h = textChips() + '<div class="cb-bar"><span class="cb-case">Case ' + C.n + ' of ' + C.of + '<small>' + esc(caseWhat()) + (C.text === 'all' ? ' of each text' : ' of ' + esc(A.text(C.text).title)) + '</small></span>' +
      (res ? '<span class="cb-res"><b>' + res.ok + '</b> hold · <b class="is-bad">' + res.bad + '</b> don\'t · <b class="is-miss">' + res.miss + '</b> missed</span>' : '<span class="cb-how">Drag a scene\'s pin onto a theme to tie a string. Drag cards anywhere. Tap a string to cut it.</span>') +
      '<span class="cb-btns"><button type="button" class="sb-btn" data-cb-check' + (C.strings.length ? '' : ' disabled') + '>' + (C.checked ? 'Check again' : 'Check my strings') + '</button>' +
      (res && res.miss ? '<button type="button" class="sb-btn is-quiet" data-cb-miss aria-pressed="' + S.miss + '">' + (S.miss ? 'Hide what I missed' : 'Show what I missed') + '</button>' : '') + '<button type="button" class="sb-btn is-quiet" data-cb-go="-1"' + (C.n > 1 ? '' : ' disabled') + '>‹ Previous</button><button type="button" class="sb-btn is-quiet" data-cb-go="1">' + (C.n < C.of ? 'Next case ›' : 'Back to case 1') + '</button><button type="button" class="sb-btn is-quiet" data-cb-clear' + (C.strings.length ? '' : ' disabled') + '>Clear strings</button></span></div>';
    h += '<div class="cb-wrap" data-cb-wrap><div class="cb-board' + (L.full ? ' is-full' : '') + '" data-cb-board style="width:' + L.W + 'px;height:' + (L.H || 900) + 'px">' +
      '<svg class="cb-strings" data-cb-svg aria-hidden="true"></svg>';
    C.ids.forEach(function (mid) {
      var k = 's:' + mid, p = pos(k), m = mom(mid), src = pic(mid), tid = tidOf(mid);
      var cls = 'cb-card cb-scene' + (L.full ? ' is-full' : '') + (S.sel === k ? ' is-sel' : '') + (S.arm === k ? ' is-arm' : '');
      var st = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + L.sw + 'px;' + (L.full ? '' : 'height:' + L.sh + 'px;') + '--r:' + rot(k) + 'deg;--c:' + (A.COL[tid] || '#13233A');
      h += '<div class="' + cls + '" data-k="' + k + '" style="' + st + '" tabindex="0" role="button" aria-label="' + esc(m.title) + ', ' + esc(short(tid)) + '">' +
        '<span class="cb-pin" data-pin="' + k + '" aria-hidden="true"></span>' +
        (L.full ? (src ? '<img class="cb-full__img" src="' + esc(src) + '" alt="" draggable="false">' : '') +
          '<div class="cb-full__body"><p class="sb-card__tag">' + esc(A.text(tid).title) + ' · scene ' + mid.replace(/^.*-/, '') + '</p><h3 class="sb-card__h">' + esc(m.title) + '</h3>' + fixed(mid, C.checked) + '</div>'
          : (src ? '<img src="' + esc(src) + '" alt="" draggable="false">' : '<span class="cb-noimg"></span>') + '<span class="cb-scene__t">' + esc(m.title) + '</span><span class="cb-scene__x">' + esc(short(tid)) + ' · ' + mid.replace(/^.*-/, '') + '</span>') +
        (canWatch(mid) ? '<button type="button" class="cb-watch' + (hasClip(mid) ? '' : ' is-still') + '" data-cb-watch="' + mid + '" aria-label="' + (hasClip(mid) ? 'Watch ' : 'See ') + esc(m.title) + '" title="' + (hasClip(mid) ? 'Watch the scene' : 'No clip of this scene exists: see it told over a still') + '">▶</button>' : '') + '</div>';
    });
    T.themes.forEach(function (t) {
      var k = 't:' + t.id, p = pos(k);
      h += '<div class="cb-card cb-theme' + (S.sel === k ? ' is-sel' : '') + (S.arm === k ? ' is-arm' : '') + '" data-k="' + k + '" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + L.tw + 'px;height:' + L.th + 'px;--r:' + rot(k) + 'deg" tabindex="0" role="button" aria-label="' + esc(t.name) + '">' +
        '<span class="cb-pin" data-pin="' + k + '" aria-hidden="true"></span><b>' + esc(t.name) + '</b></div>';
    });
    var one = (C.text || 'all') !== 'all', colW = LAY[LAYN].full ? 465 : 202, lw = LAY[LAYN].full ? 400 : 180;
    (one ? [C.text] : T.texts).forEach(function (tid, i) {
      h += '<p class="cb-label" style="left:' + (one ? (LAY[LAYN].full ? 30 : 14) : (LAY[LAYN].full ? 30 : 14) + i * colW) + 'px;width:' + (one ? LAY[LAYN].W - (LAY[LAYN].full ? 60 : 28) : lw) + 'px;--c:' + (A.COL[tid] || '#13233A') + '">' +
        esc(one ? A.text(tid).title + ' · in story order' : LAY[LAYN].full ? A.text(tid).title : short(tid)) + '</p>';
    });
    h += '<svg class="cb-tags" data-cb-tags aria-hidden="true"></svg></div></div>';
    return h + '<section class="cb-file" data-cb-file aria-live="polite">' + fileHtml() + '</section>';
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
    HB = Math.max(bottom + (L.full ? 34 : 20), 600);
    board.style.height = HB + 'px';
    ['[data-cb-svg]', '[data-cb-tags]'].forEach(function (q) { var v = board.querySelector(q); v.setAttribute('viewBox', '0 0 ' + L.W + ' ' + HB); v.setAttribute('width', L.W); v.setAttribute('height', HB); });
  }
  function tally() {
    var ok = 0, bad = 0, miss = 0;
    C.strings.forEach(function (x) { if (isYes(x.s, x.t)) ok++; else bad++; });
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
    var h = '', g = '';
    var tag = function (c, txt, attr) { return '<g class="cb-tag"' + attr + ' transform="translate(' + c.mid[0].toFixed(1) + ' ' + c.mid[1].toFixed(1) + ')"><circle r="14"/><text dy="5">' + txt + '</text></g>'; };
    if (C.checked) C.ids.forEach(function (mid) {
      var on = strung(mid);
      yesOf(mid).forEach(function (t) {
        if (on[t.id] || !(S.miss || S.sel === 's:' + mid || S.sel === 'm:' + mid + '|' + t.id)) return;
        var c = curve(pinAt('s:' + mid), pinAt('t:' + t.id)), sel = S.sel === 'm:' + mid + '|' + t.id ? ' is-sel' : '', at = ' data-miss="' + mid + '|' + t.id + '"';
        h += '<g class="cb-str is-miss' + sel + '"' + at + '><path class="cb-str__hit" d="' + c.d + '"/><path class="cb-str__line" d="' + c.d + '"/></g>';
        g += '<g class="cb-str is-miss' + sel + '"' + at + '>' + tag(c, '?', '') + '</g>';
      });
    });
    C.strings.forEach(function (x, i) {
      var c = curve(pinAt('s:' + x.s), pinAt('t:' + x.t)), ok = isYes(x.s, x.t), cls = 'cb-str' + (C.checked ? ok ? ' is-ok' : ' is-bad' : '') + (S.sel === 'x:' + i ? ' is-sel' : '');
      h += '<g class="' + cls + '" data-str="' + i + '"><path class="cb-str__hit" d="' + c.d + '"/><path class="cb-str__shade" d="' + c.d + '"/><path class="cb-str__line" d="' + c.d + '"/></g>';
      if (C.checked) g += '<g class="' + cls + '" data-str="' + i + '">' + tag(c, ok ? '✓' : '✗', '') + '</g>';
    });
    if (live) { var c2 = curve(live[0], live[1]); g += '<g class="cb-str is-live"><path class="cb-str__shade" d="' + c2.d + '"/><path class="cb-str__line" d="' + c2.d + '"/></g>'; }
    var knots = {};
    C.strings.forEach(function (x) { knots['s:' + x.s] = 1; knots['t:' + x.t] = 1; });
    Object.keys(knots).forEach(function (k) { var p = pinAt(k); g += '<circle class="cb-knot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>'; });
    svg.innerHTML = ''; tags.innerHTML = h + g;
  }
  function scale() {
    var wrap = app.querySelector('[data-cb-wrap]'), board = app.querySelector('[data-cb-board]'), L = lay();
    if (!wrap) return;
    K = Math.min(1, wrap.clientWidth / L.W);
    board.style.transform = 'scale(' + K + ')';
    wrap.style.height = Math.ceil((HB || L.H) * K) + 'px';
  }
  function at(e) { var r = app.querySelector('[data-cb-board]').getBoundingClientRect(); return [(e.clientX - r.left) / K, (e.clientY - r.top) / K]; }

  // ---------- the case file, under the board ----------
  function fileHtml() {
    var s = S.sel;
    if (s && s.charAt(0) === 's') {
      var mid = s.slice(2), m = mom(mid), on = strung(mid);
      return '<p class="cb-file__k">Case file · ' + esc(A.text(tidOf(mid)).title) + '</p><h2 class="sb-h2">' + esc(m.title) + '</h2>' + fixed(mid, C.checked) +
        '<p class="sb-row is-left">' + watchBtn(mid) + '</p>' +
        '<p class="cb-file__sub">Tie this scene to:</p><div class="cb-ties">' + T.themes.map(function (t) {
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
    return '<p class="cb-file__k">Case file</p><p class="cb-file__tip">Tap a scene to read its file, the giveaways highlighted, and watch it. Tie each scene to every theme you could write a paragraph about. Some scenes prove three or four themes; some prove one.</p>' +
      T.texts.filter(function (tid) { return C.ids.some(function (mid) { return tidOf(mid) === tid; }); }).map(function (tid) {
        return '<p class="cb-file__sub">' + esc(A.text(tid).title) + '</p><ul class="cb-list">' + C.ids.filter(function (mid) { return tidOf(mid) === tid; }).map(function (mid) {
          return '<li><button type="button" class="cb-link" data-cb-sel="s:' + mid + '">' + esc(mom(mid).title) + '</button> <span>' + esc(mom(mid).where) + '</span>' + (canWatch(mid) ? ' <button type="button" class="cb-link is-watch" data-cb-watch="' + mid + '">▶ ' + (hasClip(mid) ? 'watch' : 'see it') + '</button>' : '') + '</li>';
        }).join('') + '</ul>';
      }).join('');
  }
  function fileDraw() { var f = app.querySelector('[data-cb-file]'); if (f) f.innerHTML = fileHtml(); }
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
    var t = app.querySelector('.cb-toast');
    if (!t) { t = document.createElement('p'); t.className = 'cb-toast'; t.setAttribute('role', 'status'); app.querySelector('.sb').appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }
  function check() {
    var mk = marks();
    C.checked = true;
    C.ids.forEach(function (mid) { var on = strung(mid); mk[mid] = T.themes.filter(function (t) { return !!on[t.id] === isYes(mid, t.id); }).length; });
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
      // a tap on a card: tie it to the pin you tapped first, or open its file
      if (S.arm && S.arm !== d.key) { var a = S.arm; S.arm = null; tie(a, d.key); paint(); return; }
      select(d.key); return;
    }
    if (d.kind === 'string') {
      if (d.moved) {
        var over = document.elementFromPoint(e.clientX, e.clientY), oc = over && over.closest && over.closest('.cb-card');
        if (oc && oc.getAttribute('data-k') !== d.from) tie(d.from, oc.getAttribute('data-k'));
        paint(); return;
      }
      // a tap on a pin: hold it, then tap the card to tie it to
      if (S.arm && S.arm !== d.from) { var b = S.arm; S.arm = null; tie(b, d.from); paint(); return; }
      S.arm = S.arm === d.from ? null : d.from; paint();
      if (S.arm) toast('Now tap the card to tie it to.');
      return;
    }
    if (d.kind === 'str' && !d.moved) {
      var i = d.el.getAttribute('data-str'), m = d.el.getAttribute('data-miss');
      select(i != null ? 'x:' + i : 'm:' + m);
    }
  });

  // ---------- By theme ----------
  function themeHtml() {
    var t = TH[S.theme];
    var h = '<div class="sb-chips" role="group" aria-label="Theme">' + T.themes.map(function (x) {
      return '<button type="button" class="sb-chip" data-sb-theme="' + x.id + '" aria-pressed="' + (x.id === S.theme) + '">' + esc(x.name) + '</button>';
    }).join('') + '</div><h2 class="sb-h2">' + esc(t.name) + '</h2><p class="sb-themeask">' + esc(t.ask) + '</p>';
    var counts = T.texts.map(function (tid) { return [tid, scenes(tid).filter(function (mid) { return isYes(mid, t.id); }).length]; });
    var gap = counts.filter(function (c) { return !c[1]; });
    h += '<p class="sb-works">' + counts.map(function (c) { return '<span class="' + (c[1] ? '' : 'is-none') + '">' + esc(short(c[0])) + ': ' + (c[1] ? c[1] + ' scene' + (c[1] > 1 ? 's' : '') : 'nothing') + '</span>'; }).join('') + '</p>' +
      (gap.length ? '<p class="sb-warn">' + gap.map(function (c) { return esc(A.text(c[0]).title); }).join(' and ') + ' has nothing to write about ' + esc(t.name.toLowerCase()) +
        '. A theme has to work for all three of your texts, so if it\'s one of yours, pick a different theme.</p>' : '');
    h += '<div class="sb-cols">' + T.texts.map(function (tid) {
      var ids = scenes(tid), yes = ids.filter(function (mid) { return isYes(mid, t.id); }), thin = ids.filter(function (mid) { var c = cell(mid, t.id); return c && c[0] === 'thin'; });
      return '<section class="sb-colt" style="--c:' + (A.COL[tid] || '#13233A') + '"><h3 class="sb-colt__h">' + esc(A.text(tid).title) + '</h3>' +
        (yes.length ? yes.map(function (mid) {
          var c = cell(mid, t.id), p = pic(mid), m = mom(mid);
          return '<a class="sb-use" href="#board/scene/' + mid + '">' + (p ? '<img src="' + esc(p) + '" alt="" loading="lazy">' : '') + '<span class="sb-use__t">' + esc(m.title) + '</span>' +
            '<span class="sb-use__w">' + esc(m.where) + '</span><span class="sb-use__s">' + esc(c[1]) + '</span>' + (c[2] ? '<q class="sb-q">' + esc(c[2]) + '</q>' : '') + '</a>';
        }).join('') : '<p class="sb-empty">No scene works for this theme.</p>') +
        (thin.length ? '<details class="sb-skip"><summary>Skip these: they touch it, but there\'s nothing to write</summary><ul>' + thin.map(function (mid) {
          return '<li><b>' + esc(mom(mid).title) + '</b> ' + esc(cell(mid, t.id)[1]) + '</li>';
        }).join('') + '</ul></details>' : '') + '</section>';
    }).join('') + '</div>';
    return h;
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
    if (n !== LAYN) paint(); else { scale(); strings(); }
  });
  document.addEventListener('click', function (e) {
    if (!app || !app.querySelector('.sb') || !app.contains(e.target)) return;
    var t = e.target, x;
    if ((x = t.closest('[data-cb-watch]'))) { e.preventDefault(); if (A.watch) A.watch(x.getAttribute('data-cb-watch'), S.mode === 'theme' ? S.theme : null); return; }
    if ((x = t.closest('[data-sb-mode]'))) { S.mode = x.getAttribute('data-sb-mode'); history.replaceState(null, '', '#board'); paint(); return; }
    if ((x = t.closest('[data-sb-text]'))) { S.text = x.getAttribute('data-sb-text'); if (S.mode === 'board') goCase(1); paint(); return; }
    if ((x = t.closest('[data-sb-theme]'))) { S.theme = x.getAttribute('data-sb-theme'); paint(); return; }
    if ((x = t.closest('[data-sb-go]'))) { var ids = scenes(S.text), k = ids.indexOf(S.scene) + +x.getAttribute('data-sb-go'); S.scene = ids[(k + ids.length) % ids.length]; paint(); return; }
    if (t.closest('[data-cb-check]')) { check(); return; }
    if (t.closest('[data-cb-miss]')) { S.miss = !S.miss; paint(); return; }
    if ((x = t.closest('[data-cb-per]'))) {
      var was = C.ids[0]; CASE_N = +x.getAttribute('data-cb-per'); store('eng-cork-per', String(CASE_N));
      // stay on the case that has the scene you were looking at
      var list = cases(S.text), k = 0; list.forEach(function (ids, i) { if (ids.indexOf(was) >= 0) k = i; });
      goCase(k + 1); paint(); return;
    }
    if ((x = t.closest('[data-cb-go]'))) { goCase(C.n + +x.getAttribute('data-cb-go')); paint(); var bar = app.querySelector('.cb-bar'); if (bar) window.scrollTo({ top: Math.max(0, bar.getBoundingClientRect().top + window.scrollY - 90), behavior: 'smooth' }); return; }
    if (t.closest('[data-cb-clear]')) { C.strings = []; C.checked = false; S.sel = null; save(); paint(); return; }
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
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var k = c.getAttribute('data-k'); if (S.arm && S.arm !== k) { var a = S.arm; S.arm = null; tie(a, k); paint(); } else select(k); }
    if (e.key === 'Escape' && S.arm) { S.arm = null; paint(); }
  });

  window.EngBoard = { render: render };
})();

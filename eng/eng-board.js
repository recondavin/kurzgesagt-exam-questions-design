// The Scene board (english.html#board): every key scene of the three comparative texts on a board with the eight
// themes around it (content: eng/eng-themes.js). The user: "build a game where you take all scenes from shawshank and
// small things and sive, and how they match the theme/topic ... a board where this scene is connected to education in
// this way and it also could be connected to something else ... and then it gives an explenation WHY".
//   Play    a scene in the middle, its fixed part (where, who, what happens); tap every theme you could write about,
//           then Check: lines are drawn to the themes it works for, and each one says why (or why there's nothing
//           to write). Eight scenes a round, the ones you've got wrong or never seen first.
//   By theme  pick a theme: the scenes that work for it in each text, what each one shows, the quote; the ones to skip.
//   By scene  the board with the answers showing, scene after scene.
// eng.js calls EngBoard.render(app, args, api) from its router (#board, #board/theme/<id>, #board/scene/<id>).
(function () {
  'use strict';
  var T = window.EngThemes, D = window.EngData;
  if (!T || !D) return;
  var A = null, app = null, ROUND = 8;
  var S = { mode: 'play', text: 'all', theme: 'power', scene: null, list: [], i: 0, picks: {}, checked: false, got: 0, out: 0, missed: [] };
  var TH = {}; T.themes.forEach(function (t) { TH[t.id] = t; });

  function esc(s) { return A.esc(s); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function marks() { try { return JSON.parse(store('eng-board-scenes') || '{}') || {}; } catch (e) { return {}; } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
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
  // What it says when a theme is wrong for a scene and has no note of its own.
  function noWhy(mid, th) {
    var y = yesOf(mid).map(function (t) { return t.name.toLowerCase(); });
    return 'Nothing in this scene is about ' + TH[th].name.toLowerCase() + '. It\'s a scene for ' + (y.length > 1 ? y.slice(0, -1).join(', ') + ' and ' + y[y.length - 1] : y[0]) + '.';
  }
  function quote(q) { return q ? '<q class="sb-q">' + esc(q) + '</q>' : ''; }

  // ---------- the page ----------
  function render(el, args, api) {
    A = api; app = el;
    args = args || [];
    if (args[0] === 'theme' && TH[args[1]]) { S.mode = 'theme'; S.theme = args[1]; }
    else if (args[0] === 'scene' && T.scenes[args[1]]) { S.mode = 'scene'; S.scene = args[1]; }
    if (S.mode === 'play' && !S.list.length) newRound();
    paint();
  }
  function head() {
    var tab = function (m, label) { return '<button type="button" class="sb-tab" data-sb-mode="' + m + '" aria-pressed="' + (S.mode === m) + '">' + label + '</button>'; };
    return A.title('Scene board') +
      '<p class="sb-lead">The scene never changes: where it is, who\'s there, what\'s said and done. What you use it to say depends on the theme. Some scenes work for three or four themes; some themes need different scenes.</p>' +
      '<div class="sb-tabs" role="group" aria-label="How to use the board">' + tab('play', 'Play: connect it') + tab('theme', 'By theme') + tab('scene', 'By scene') + '</div>';
  }
  function textChips() {
    var chip = function (id, label) { return '<button type="button" class="sb-chip" data-sb-text="' + id + '" aria-pressed="' + (S.text === id) + '">' + esc(label) + '</button>'; };
    return '<div class="sb-chips" role="group" aria-label="Which text">' + chip('all', 'All three') + T.texts.map(function (t) { return chip(t, short(t)); }).join('') + '</div>';
  }
  function paint() {
    var h = head();
    if (S.mode === 'play') h += playHtml();
    else if (S.mode === 'theme') h += themeHtml();
    else h += sceneHtml();
    app.innerHTML = '<div class="sb">' + h + '</div>';
    lines();
  }

  // ---------- the board: a scene in the middle, the themes around it ----------
  function card(mid) {
    var m = mom(mid), s = T.scenes[mid], tid = tidOf(mid), p = pic(mid);
    return '<article class="sb-card" style="--c:' + (A.COL[tid] || '#13233A') + '">' + (p ? '<img class="sb-card__img" src="' + esc(p) + '" alt="">' : '') +
      '<div class="sb-card__body"><p class="sb-card__tag">' + esc(A.text(tid).title) + '</p><h3 class="sb-card__h">' + esc(m.title) + '</h3>' +
      '<dl class="sb-fix"><dt>Where</dt><dd>' + esc(m.where) + '</dd><dt>Who\'s there</dt><dd>' + esc(s.who) + '</dd><dt>What happens</dt><dd><ol>' +
      (m.tell || [m.what]).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></dd></dl></div></article>';
  }
  function node(mid, t, k, shown) {
    var on = !!S.picks[t.id], c = cell(mid, t.id), yes = isYes(mid, t.id), cls = '', st = '';
    if (shown) {
      if (yes) { cls = on || S.mode === 'scene' ? ' is-yes is-hit' : ' is-yes is-miss'; st = S.mode === 'scene' ? 'Works' : on ? 'Right' : 'Missed'; }
      else if (on) { cls = ' is-wrong'; st = c ? 'Nothing to write' : 'Not about it'; }
      else { cls = c ? ' is-thin' : ' is-no'; st = c ? 'Kind of: skip' : ''; }
    }
    return '<button type="button" class="sb-node' + cls + '" data-sb-t="' + t.id + '" aria-pressed="' + on + '"' + (shown && S.mode === 'play' ? ' disabled' : '') + '>' +
      '<span class="sb-node__k" aria-hidden="true">' + (k + 1) + '</span><b>' + esc(t.name) + '</b>' + (st ? '<span class="sb-node__st">' + st + '</span>' : '') + '</button>';
  }
  function board(mid, shown) {
    var th = T.themes, half = Math.ceil(th.length / 2);
    return '<div class="sb-board' + (shown ? ' is-shown' : '') + '" data-sb-board><svg class="sb-lines" aria-hidden="true"></svg>' +
      '<div class="sb-col is-l">' + th.slice(0, half).map(function (t, k) { return node(mid, t, k, shown); }).join('') + '</div>' + card(mid) +
      '<div class="sb-col is-r">' + th.slice(half).map(function (t, k) { return node(mid, t, k + half, shown); }).join('') + '</div></div>';
  }
  // Why: the themes it works for first (what it shows, the quote), then the ones you picked that don't work, then the
  // ones that touch it but have nothing to write.
  function why(mid) {
    var yes = [], wrong = [], thin = [], none = [];
    T.themes.forEach(function (t) {
      var c = cell(mid, t.id), on = !!S.picks[t.id];
      if (c && c[0] === 'yes') yes.push('<li class="sb-why is-yes' + (S.mode === 'play' && !on ? ' is-miss' : '') + '"><p class="sb-why__h"><b>' + esc(t.name) + '</b>' +
        (S.mode === 'play' ? '<span>' + (on ? 'You had it' : 'You missed this one') + '</span>' : '') + '</p><p>' + esc(c[1]) + '</p>' + quote(c[2]) + '</li>');
      else if (S.mode === 'play' && on) wrong.push('<li class="sb-why is-wrong"><p class="sb-why__h"><b>' + esc(t.name) + '</b><span>Not worth it</span></p><p>' + esc(c ? c[1] : noWhy(mid, t.id)) + '</p></li>');
      else if (c) thin.push('<li class="sb-why is-thin"><p class="sb-why__h"><b>' + esc(t.name) + '</b><span>Kind of, but skip it</span></p><p>' + esc(c[1]) + '</p></li>');
      else none.push(t.name);
    });
    return '<ol class="sb-whys">' + yes.join('') + wrong.join('') + thin.join('') + '</ol>' +
      (none.length ? '<p class="sb-none">Nothing to write for ' + esc(none.join(', ').replace(/, ([^,]*)$/, ' or $1')) + ': it isn\'t what this scene is about.</p>' : '');
  }

  // ---------- Play ----------
  function newRound() {
    var mk = marks(), list = shuffle(scenes(S.text));
    // never seen first, then the ones you got least right
    list.sort(function (a, b) { var x = mk[a] == null ? -1 : mk[a], y = mk[b] == null ? -1 : mk[b]; return x - y; });
    S.list = list.slice(0, ROUND); S.i = 0; S.picks = {}; S.checked = false; S.got = 0; S.out = 0; S.missed = [];
  }
  function playHtml() {
    var mid = S.list[S.i];
    if (!mid) return textChips() + endHtml();
    var right = S.checked ? T.themes.filter(function (t) { return !!S.picks[t.id] === isYes(mid, t.id); }).length : 0;
    return textChips() + '<div class="sb-top"><span>Scene ' + (S.i + 1) + ' of ' + S.list.length + '</span><span class="sb-score"><b>' + S.got + '</b> / ' + S.out + ' right</span></div>' +
      board(mid, S.checked) +
      (S.checked ? '<p class="sb-verdict' + (right === T.themes.length ? ' is-all' : '') + '">' + right + ' of ' + T.themes.length + ' right' + (right === T.themes.length ? '. Every one.' : '') + '</p>' + why(mid) +
        '<p class="sb-row"><button type="button" class="sb-btn" data-sb-next>' + (S.i + 1 < S.list.length ? 'Next scene' : 'See how you did') + '</button></p>'
        : '<p class="sb-ask">Tap every theme you could <b>write a paragraph about</b> with this scene. Then check.</p><p class="sb-row"><button type="button" class="sb-btn" data-sb-check>Check</button></p>');
  }
  function check() {
    var mid = S.list[S.i];
    if (!mid || S.checked) return;
    var right = T.themes.filter(function (t) { return !!S.picks[t.id] === isYes(mid, t.id); }).length, mk = marks();
    S.checked = true; S.got += right; S.out += T.themes.length;
    if (right < T.themes.length) S.missed.push(mid);
    mk[mid] = right; store('eng-board-scenes', JSON.stringify(mk));
    var K = window.ExamAnswerMode && window.ExamAnswerMode.kit;
    try { if (K) { if (right === T.themes.length) K.sfx('stamp', 0.6); else if (right >= 6) K.ding(3); else K.bonk(); } } catch (e) {}
    paint();
    var v = app.querySelector('.sb-verdict'); if (v) v.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function endHtml() {
    var best = +(store('eng-board-best') || 0), pct = S.out ? Math.round(100 * S.got / S.out) : 0;
    if (pct > best) store('eng-board-best', String(pct));
    return '<section class="sb-end"><p class="sb-end__big">' + S.got + '<span>/' + S.out + '</span></p><p class="sb-end__say">' +
      (pct === 100 ? 'Every theme, every scene. You know these.' : pct >= 85 ? 'Nearly. Look at the ones below again.' : 'Go through the ones below in By scene, then play again.') + '</p>' +
      (S.missed.length ? '<h3 class="sb-h3">Look at these again</h3><ul class="sb-again">' + S.missed.map(function (mid) {
        return '<li><a href="#board/scene/' + mid + '">' + esc(mom(mid).title) + '</a> <span>' + esc(short(tidOf(mid))) + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<p class="sb-row"><button type="button" class="sb-btn" data-sb-again>Play again</button><button type="button" class="sb-btn is-quiet" data-sb-mode="theme">By theme</button></p></section>';
  }

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
    var k = ids.indexOf(S.scene), mid = S.scene;
    S.picks = {};
    return textChips() + '<div class="sb-top"><button type="button" class="sb-arrow" data-sb-go="-1" aria-label="Previous scene">‹</button><span>' + (k + 1) + ' of ' + ids.length + ' · ' + esc(short(tidOf(mid))) + '</span>' +
      '<button type="button" class="sb-arrow" data-sb-go="1" aria-label="Next scene">›</button></div>' + board(mid, true) + why(mid);
  }

  // ---------- the lines from the scene to the themes it works for (laptops and tablets) ----------
  function lines() {
    var b = app && app.querySelector('[data-sb-board].is-shown'), svg = b && b.querySelector('.sb-lines');
    if (!svg) return;
    var r = b.getBoundingClientRect(), c = b.querySelector('.sb-card').getBoundingClientRect(), d = '';
    svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height); svg.setAttribute('width', r.width); svg.setAttribute('height', r.height);
    if (window.innerWidth < 900) { svg.innerHTML = ''; return; }
    Array.prototype.forEach.call(b.querySelectorAll('.sb-node.is-yes'), function (n) {
      var q = n.getBoundingClientRect(), left = q.right <= c.left + 2, y = q.top + q.height / 2 - r.top;
      var x1 = (left ? q.right : q.left) - r.left, x2 = (left ? c.left : c.right) - r.left, cy = Math.min(Math.max(y, c.top - r.top + 40), c.bottom - r.top - 40), mx = (x1 + x2) / 2;
      d += '<path class="' + (n.classList.contains('is-miss') ? 'is-miss' : '') + '" d="M' + x1 + ' ' + y + ' C' + mx + ' ' + y + ' ' + mx + ' ' + cy + ' ' + x2 + ' ' + cy + '"/><circle cx="' + x2 + '" cy="' + cy + '" r="4"/>';
    });
    svg.innerHTML = d;
  }
  window.addEventListener('resize', function () { if (app && app.querySelector('.sb')) lines(); });

  // ---------- taps and keys ----------
  document.addEventListener('click', function (e) {
    if (!app || !app.querySelector('.sb') || !app.contains(e.target)) return;
    var t = e.target, x;
    if ((x = t.closest('[data-sb-mode]'))) { S.mode = x.getAttribute('data-sb-mode'); if (S.mode === 'play') newRound(); history.replaceState(null, '', '#board'); paint(); return; }
    if ((x = t.closest('[data-sb-text]'))) { S.text = x.getAttribute('data-sb-text'); if (S.mode === 'play') newRound(); paint(); return; }
    if ((x = t.closest('[data-sb-theme]'))) { S.theme = x.getAttribute('data-sb-theme'); paint(); return; }
    if ((x = t.closest('[data-sb-go]'))) { var ids = scenes(S.text), k = ids.indexOf(S.scene) + +x.getAttribute('data-sb-go'); S.scene = ids[(k + ids.length) % ids.length]; paint(); return; }
    if ((x = t.closest('.sb-node')) && S.mode === 'play' && !S.checked) { var id = x.getAttribute('data-sb-t'); S.picks[id] = !S.picks[id]; x.setAttribute('aria-pressed', String(!!S.picks[id])); return; }
    if (t.closest('[data-sb-check]')) { check(); return; }
    if (t.closest('[data-sb-next]')) { S.i += 1; S.picks = {}; S.checked = false; paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (t.closest('[data-sb-again]')) { newRound(); paint(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!app || !app.querySelector('.sb') || S.mode !== 'play' || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (/^[1-8]$/.test(e.key) && !S.checked) { var n = app.querySelectorAll('.sb-node')[e.key - 1]; if (n) { e.preventDefault(); n.click(); } return; }
    if (e.key === 'Enter' && !/^(BUTTON|A)$/.test(e.target.tagName)) { var b = app.querySelector('[data-sb-check], [data-sb-next]'); if (b) { e.preventDefault(); b.click(); } }
  });

  window.EngBoard = { render: render };
})();

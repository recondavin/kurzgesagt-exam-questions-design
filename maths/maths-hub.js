// maths.html: Leaving Cert Maths, Ordinary Level, chapters 10-14 of the student's book (Active Maths 3). The same shell as
// Biology (a sidebar of chapters, a top bar, the canvas): Home shows the chapters with how you're doing, a chapter shows
// its real exam questions (2015-2025) as tiles, and a tile opens that question on the desk (maths/maths-desk.js), where
// it is explained part by part with animated working.
(function () {
  'use strict';
  var DESK = 'Geography Questions.dc.html';
  var CHAPTERS = [
    { n: 10, title: 'Calculus', c: '#1CB0F6' },
    { n: 11, title: 'Applied Measure', c: '#FF9600' },
    { n: 12, title: 'Counting and Arrangements', c: '#CE82FF' },
    { n: 13, title: 'Probability', c: '#FF86D0' },
    { n: 14, title: 'Statistics I', c: '#2BD9C4' }
  ];
  var side = document.getElementById('mx-side'), bar = document.getElementById('mx-top'), app = document.getElementById('mx-app');
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function qs(n) { var d = (window.MathsQuestions || {})[n]; return d ? d.questions.slice() : []; }
  function result(n, q) { try { return JSON.parse(localStorage.getItem('maths-q-' + n + '-' + q.id)); } catch (e) { return null; } }
  // How a chapter is going: of the parts you've tried, how many you got right first time.
  function stats(n) {
    var list = qs(n), tried = 0, parts = 0, right = 0;
    list.forEach(function (q) {
      var r = result(n, q);
      if (!r || !r.parts) return;
      tried++;
      Object.keys(r.parts).forEach(function (k) { parts++; if (r.parts[k].first) right++; });
    });
    return { all: list.length, tried: tried, pct: parts ? Math.round(right / parts * 100) : null };
  }
  function deskLink(n, q) { return DESK + '#maths/' + n + '/' + encodeURIComponent(q.id); }

  function shell(active, crumb) {
    var T = window.ExamTeacher;
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (T ? T.head() : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="Maths"><a class="sh-link" href="#"' + (active === 'home' ? ' aria-current="page"' : '') + '><span class="sh-t">Home</span></a>' +
      (GAMES_ON ? '<a class="sh-link" href="maths-golf.html"><span class="sh-t">Mini Golf</span></a><a class="sh-link" href="maths-pool.html"><span class="sh-t">Pool</span></a>' : '') +
      '<p class="sh-group">Chapters</p>' + CHAPTERS.map(function (c) {
        var s = stats(c.n), v = s.pct != null ? s.pct + '%' : '<span class="dash">–</span>';
        return '<a class="sh-link" href="#ch' + c.n + '"' + (active === c.n ? ' aria-current="page"' : '') + '><span class="sh-n num">' + c.n + '</span><span class="sh-t">' + esc(c.title) +
          '</span><span class="sh-v num">' + v + '</span></a>';
      }).join('') + '</nav>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="mx-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb">' + (crumb ? '<a href="#">Maths</a><span class="sh-sep" aria-hidden="true">/</span><span class="sh-here">' + esc(crumb) + '</span>' : '<span class="sh-here">Maths</span>') + '</p>' +
      '<nav class="sh-switch" aria-label="Subject"><a href="geography.html">Geography</a><a href="biology.html">Biology</a><a href="maths.html" aria-current="page">Maths</a><a href="english.html">English</a><a href="irish.html">Irish</a><a href="german.html">German</a></nav>';
  }
  function home() {
    document.title = 'Maths | Leaving Cert';
    shell('home', '');
    app.innerHTML = '<div class="bh"><div class="cv-title rise" style="--i:0"><h1 class="cv-h1">Maths <span class="mx-level">Ordinary Level</span></h1></div>' +
      '<section class="bh-chs mx-chs rise" style="--i:1" aria-label="Chapters">' + CHAPTERS.map(function (c) {
        var s = stats(c.n);
        return '<a class="card bh-ch" href="#ch' + c.n + '" style="--c:' + c.c + '"><span class="bh-n num">' + c.n + '</span><span class="bh-name">' + esc(c.title) + '</span>' +
          '<span class="bh-big">' + (s.pct == null ? '<span class="dash">–</span>' : '<b class="num">' + s.pct + '%</b><i>right first time</i>') + '</span>' +
          '<span class="pg-track bh-track"><i style="--w:' + (s.pct || 0) + '%"></i></span>' +
          '<span class="bh-facts"><span><b class="num">' + s.tried + '</b><span class="of"> of ' + s.all + '</span> questions</span></span></a>';
      }).join('') + '</section>' + games() + '</div>';
  }
  // The games: Biology's Mini Golf and Pool with the real maths exam questions (maths/maths-deck.js), four options
  // each, the wrong ones the mistakes students really make.
  var GAMES = [
    { href: 'maths-golf.html', name: 'Mini Golf', say: 'Ten holes against the examiner, from the parabola to the scatter. Answer a real exam question before every putt.',
      art: '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="24" ry="6" fill="#2BD4BD" opacity=".35"/><path d="M30 52V10" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round"/><path d="M31 11l18 7-18 7z" fill="#FF86D0"/><circle cx="44" cy="50" r="5" fill="#F1F7FB"/></svg>' },
    { href: 'maths-pool.html', name: 'Pool', say: 'Pool against the examiner. Get the question right to take your shot; the wrong answers are the classic mistakes.',
      art: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="36" r="13" fill="#1CB0F6"/><circle cx="24" cy="36" r="6" fill="#F1F7FB"/><text x="24" y="39.5" text-anchor="middle" font-size="9" font-weight="800" fill="#131F24">9</text><circle cx="45" cy="24" r="9" fill="#F1F7FB"/><path d="M52 52L37 37" stroke="#C08552" stroke-width="3" stroke-linecap="round"/></svg>' }
  ];
  var GAMES_ON = true; // the cards are in maths/maths-cards.js (tools/maths/build_cards.py)
  function games() {
    if (!GAMES_ON) return '';
    return '<section class="mx-games rise" style="--i:2" aria-labelledby="mx-games-h"><h2 class="mx-h2" id="mx-games-h">Games</h2><div class="mx-games__row">' +
      GAMES.map(function (g) {
        return '<a class="card mx-game" href="' + g.href + '"><span class="mx-game__art">' + g.art + '</span><span class="mx-game__txt"><b>' + esc(g.name) + '</b><span>' + esc(g.say) + '</span></span></a>';
      }).join('') + '</div></section>';
  }
  function chapter(n) {
    var c = CHAPTERS.filter(function (x) { return x.n === n; })[0];
    if (!c) { home(); return; }
    document.title = c.title + ' | Leaving Cert Maths';
    shell(n, c.title);
    var list = qs(n).sort(function (a, b) { return b.year - a.year || a.paper - b.paper || a.q - b.q; });
    var next = list.filter(function (q) { return !result(n, q); })[0] || list[0];
    app.innerHTML = '<div class="cv-title rise" style="--i:0"><h1 class="cv-h1">' + esc(c.title) + '</h1>' +
      (next ? '<a class="btn-primary" href="' + deskLink(n, next) + '">' + (result(n, next) ? 'Go again' : 'Start the next question') + '</a>' : '') + '</div>' +
      (list.length ? '<ul class="bio-qlist mx-qlist rise" style="--i:1">' + list.map(function (q) {
        var r = result(n, q), done = 0, right = 0, total = (q.parts || []).length;
        if (r && r.parts) Object.keys(r.parts).forEach(function (k) { done++; if (r.parts[k].first) right++; });
        return '<li><a class="bio-q mx-q-tile" href="' + deskLink(n, q) + '" style="--c:' + c.c + '"><span class="bio-q__src">' + q.year + '<em>Paper ' + q.paper + ' · Q' + q.q + '</em></span>' +
          '<span class="mx-q-tile__topic">' + esc(q.topic || '') + '</span>' +
          '<span class="bio-q__meta">' + (done ? '<b class="bio-q__score num">' + right + '<span class="of">/' + total + '</span></b>' : '<span>' + (q.total ? q.total + ' marks' : total + ' parts') + '</span>') + '</span></a></li>';
      }).join('') + '</ul>' : '<p class="bio-empty">The exam questions for this chapter are on their way.</p>');
  }
  function route() {
    document.body.classList.remove('sh-open');
    var m = /^#ch(\d+)$/.exec(location.hash);
    if (m) chapter(+m[1]); else home();
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sh-menu]');
    if (b) { var open = !document.body.classList.contains('sh-open'); document.body.classList.toggle('sh-open', open); b.setAttribute('aria-expanded', String(open)); }
  });
  window.addEventListener('hashchange', route);
  route();
})();

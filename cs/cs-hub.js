// computer-science.html: Leaving Cert Computer Science, Higher Level, chapters 6 and 7 of the student's book (Computer
// Science for Leaving Certificate). The same shell as Maths and Biology (a sidebar of chapters, a top bar, the canvas):
// Home shows the chapters with how you're doing and the games; a chapter shows its real exam questions (2020-2025)
// grouped by topic as tiles, and a tile opens that question on the desk (cs/cs-desk.js), explained part by part.
(function () {
  'use strict';
  var DESK = 'Geography Questions.dc.html';
  var CHAPTERS = [
    { n: 6, title: 'Computer systems', c: '#1CB0F6' },
    { n: 7, title: 'Computational thinking, algorithms and data representation', short: 'Algorithms and data', c: '#CE82FF' }
  ];
  // The topics inside each chapter (a question's "sub"), in the book's order.
  var SUBS = { systems: 'Computer systems', architecture: 'Computer architecture', electronics: 'Electronics and logic gates', os: 'Operating systems',
    internet: 'The Internet and the web', thinking: 'Computational thinking', algorithms: 'Algorithms', data: 'Representing data' };
  var SUB_ORDER = ['systems', 'architecture', 'electronics', 'os', 'internet', 'thinking', 'algorithms', 'data'];
  var side = document.getElementById('mx-side'), bar = document.getElementById('mx-top'), app = document.getElementById('mx-app');
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function qs(n) { var d = (window.CsQuestions || {})[n]; return d ? d.questions.slice() : []; }
  function result(n, q) { try { return JSON.parse(localStorage.getItem('cs-q-' + n + '-' + q.id)); } catch (e) { return null; } }
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
  function deskLink(n, q) { return DESK + '#cs/' + n + '/' + encodeURIComponent(q.id); }

  function shell(active, crumb) {
    var T = window.ExamTeacher;
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (T ? T.head() : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="Computer Science"><a class="sh-link" href="#"' + (active === 'home' ? ' aria-current="page"' : '') + '><span class="sh-t">Home</span></a>' +
      (GAMES_ON ? '<a class="sh-link" href="#games"><span class="sh-t">Games</span></a>' : '') +
      '<p class="sh-group">Chapters</p>' + CHAPTERS.map(function (c) {
        var s = stats(c.n), v = s.pct != null ? s.pct + '%' : '<span class="dash">–</span>';
        return '<a class="sh-link" href="#ch' + c.n + '"' + (active === c.n ? ' aria-current="page"' : '') + '><span class="sh-n num">' + c.n + '</span><span class="sh-t">' + esc(c.short || c.title) +
          '</span><span class="sh-v num">' + v + '</span></a>';
      }).join('') + '</nav>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="mx-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb">' + (crumb ? '<a href="#">Computer Science</a><span class="sh-sep" aria-hidden="true">/</span><span class="sh-here">' + esc(crumb) + '</span>' : '<span class="sh-here">Computer Science</span>') + '</p>' +
      '<nav class="sh-switch" aria-label="Subject"><a href="geography.html">Geography</a><a href="biology.html">Biology</a><a href="maths.html">Maths</a><a href="computer-science.html" aria-current="page">Computer Science</a><a href="english.html">English</a><a href="irish.html">Irish</a><a href="german.html">German</a></nav>';
  }
  function home() {
    document.title = 'Computer Science | Leaving Cert';
    shell('home', '');
    app.innerHTML = '<div class="bh"><div class="cv-title rise" style="--i:0"><h1 class="cv-h1">Computer Science <span class="mx-level">Higher Level</span></h1></div>' +
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
  // The games: Biology's games with Computer Science questions (cs/cs-deck.js: the real exam parts as four-option
  // cards, the wrong options the mistakes students make). Golf and pool have their own pages; the rest open in
  // cs-play.html.
  var ART = {
    golf: '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="24" ry="6" fill="#2BD4BD" opacity=".35"/><path d="M30 52V10" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round"/><path d="M31 11l18 7-18 7z" fill="#FF86D0"/><circle cx="44" cy="50" r="5" fill="#F1F7FB"/></svg>',
    pool: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="36" r="13" fill="#1CB0F6"/><circle cx="24" cy="36" r="6" fill="#F1F7FB"/><text x="24" y="39.5" text-anchor="middle" font-size="9" font-weight="800" fill="#131F24">9</text><circle cx="45" cy="24" r="9" fill="#F1F7FB"/><path d="M52 52L37 37" stroke="#C08552" stroke-width="3" stroke-linecap="round"/></svg>',
    board: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#F4E9D0"/><circle cx="32" cy="32" r="26" fill="none" stroke="#131F24" stroke-width="3"/><path d="M32 32L32 6A26 26 0 0 1 54.5 19Z" fill="#1CB0F6"/><path d="M32 32L54.5 19A26 26 0 0 1 54.5 45Z" fill="#CE82FF"/><path d="M32 32L54.5 45A26 26 0 0 1 32 58Z" fill="#FFC800"/><circle cx="32" cy="32" r="7" fill="#131F24"/></svg>',
    chase: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="26" width="52" height="12" rx="6" fill="#26353C"/><circle cx="18" cy="32" r="8" fill="#1CB0F6"/><circle cx="44" cy="32" r="8" fill="#FF9600"/><path d="M50 32h8" stroke="#F1F7FB" stroke-width="3" stroke-linecap="round"/></svg>',
    grid: '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#1CB0F6"><rect x="8" y="8" width="14" height="14" rx="3"/><rect x="25" y="8" width="14" height="14" rx="3"/><rect x="42" y="8" width="14" height="14" rx="3" fill="#FFC800"/><rect x="8" y="25" width="14" height="14" rx="3"/><rect x="25" y="25" width="14" height="14" rx="3" fill="#CE82FF"/><rect x="42" y="25" width="14" height="14" rx="3"/><rect x="8" y="42" width="14" height="14" rx="3"/><rect x="25" y="42" width="14" height="14" rx="3"/><rect x="42" y="42" width="14" height="14" rx="3"/></g></svg>',
    sea: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="34" width="56" height="22" rx="4" fill="#1CB0F6" opacity=".5"/><path d="M12 34h34l-5 8H17z" fill="#9EB0B9"/><rect x="26" y="24" width="8" height="10" fill="#9EB0B9"/><circle cx="48" cy="18" r="5" fill="#FF9600"/></svg>',
    cannon: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="48" width="56" height="10" fill="#74C043"/><path d="M14 44l26-14 3 6-26 14z" fill="#47555C"/><circle cx="20" cy="46" r="7" fill="#C08552"/><circle cx="52" cy="18" r="4" fill="#F1F7FB"/></svg>',
    tower: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="52" width="56" height="8" fill="#74C043"/><rect x="38" y="30" width="16" height="22" fill="#C08552"/><rect x="36" y="24" width="20" height="6" fill="#9EB0B9"/><circle cx="16" cy="40" r="6" fill="#FF4B4B"/><path d="M8 52l8-12" stroke="#47555C" stroke-width="3"/></svg>'
  };
  var GAMES = [
    { href: 'cs-golf.html', name: 'Mini Golf', art: ART.golf, say: 'Ten holes against the examiner. A real exam question before every putt.' },
    { href: 'cs-pool.html', name: 'Pool', art: ART.pool, say: 'Get the question right to take your shot.' },
    { href: 'cs-play.html?g=board', name: 'Trivia board', art: ART.board, say: 'Win a wedge from each topic before the examiner does.' },
    { href: 'cs-play.html?g=chase', name: 'Outrun the Examiner', art: ART.chase, say: 'Get home before he catches you.' },
    { href: 'cs-play.html?g=grid', name: 'Points Grid', art: ART.grid, say: 'Pick a topic and a value.' },
    { href: 'cs-play.html?g=sea', name: 'Sea Battle', art: ART.sea, say: 'A right answer fires a salvo.' },
    { href: 'cs-play.html?g=cannon', name: 'Cannon Duel', art: ART.cannon, say: 'Answer, aim and fire.' },
    { href: 'cs-play.html?g=tower', name: 'Topple the Examiner', art: ART.tower, say: 'Answer, pull back and knock him down.' }
  ];
  var GAMES_ON = false; // on once cs/cs-cards.js has the cards (tools/cs/build_cards.py)
  function games() {
    if (!GAMES_ON) return '';
    return '<section class="mx-games rise" style="--i:2" aria-labelledby="mx-games-h"><h2 class="mx-h2" id="mx-games-h">Games</h2><div class="mx-games__row cs-games">' +
      GAMES.map(function (g) {
        return '<a class="card mx-game" href="' + g.href + '"><span class="mx-game__art">' + g.art + '</span><span class="mx-game__txt"><b>' + esc(g.name) + '</b><span>' + esc(g.say) + '</span></span></a>';
      }).join('') + '</div></section>';
  }
  function tile(n, q, c) {
    var r = result(n, q), done = 0, got = 0, max = 0, total = (q.parts || []).length;
    if (r && r.parts) Object.keys(r.parts).forEach(function (k) { done++; got += r.parts[k].got || 0; max += r.parts[k].max || 0; });
    return '<li><a class="bio-q mx-q-tile" href="' + deskLink(n, q) + '" style="--c:' + c.c + '"><span class="bio-q__src">' + q.year + '<em>Section ' + esc(q.section || '') + ' · Q' + q.q + '</em></span>' +
      '<span class="mx-q-tile__topic">' + esc(q.topic || '') + '</span>' +
      '<span class="bio-q__meta">' + (done && max ? '<b class="bio-q__score num">' + Math.round(got) + '<span class="of">/' + Math.round(max) + '</span></b>' : '<span>' + (q.total ? q.total + ' marks' : total + ' parts') + '</span>') + '</span></a></li>';
  }
  function chapter(n) {
    var c = CHAPTERS.filter(function (x) { return x.n === n; })[0];
    if (!c) { home(); return; }
    document.title = (c.short || c.title) + ' | Leaving Cert Computer Science';
    shell(n, c.short || c.title);
    var list = qs(n).sort(function (a, b) { return b.year - a.year || a.q - b.q; });
    var next = list.filter(function (q) { return !result(n, q); })[0] || list[0];
    // The questions grouped by topic (the book's sections), newest first in each.
    var groups = SUB_ORDER.map(function (k) { return { k: k, qs: list.filter(function (q) { return q.sub === k; }) }; }).filter(function (g) { return g.qs.length; });
    var rest = list.filter(function (q) { return SUB_ORDER.indexOf(q.sub) < 0; });
    if (rest.length) groups.push({ k: 'other', qs: rest });
    app.innerHTML = '<div class="cv-title rise" style="--i:0"><h1 class="cv-h1">' + esc(c.title) + '</h1>' +
      (next ? '<a class="btn-primary" href="' + deskLink(n, next) + '">' + (result(n, next) ? 'Go again' : 'Start the next question') + '</a>' : '') + '</div>' +
      (list.length ? groups.map(function (g, i) {
        return '<section class="cs-sub rise" style="--i:' + (i + 1) + '"><h2 class="mx-h2">' + esc(SUBS[g.k] || 'Other parts') + ' <span class="cs-sub__n">' + g.qs.length + '</span></h2>' +
          '<ul class="bio-qlist mx-qlist">' + g.qs.map(function (q) { return tile(n, q, c); }).join('') + '</ul></section>';
      }).join('') : '<p class="bio-empty">The exam questions for this chapter are on their way.</p>');
  }
  function route() {
    document.body.classList.remove('sh-open');
    var m = /^#ch(\d+)$/.exec(location.hash);
    if (m) chapter(+m[1]); else home();
    var g = location.hash === '#games' && document.getElementById('mx-games-h');
    if (g) g.scrollIntoView(); else window.scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sh-menu]');
    if (b) { var open = !document.body.classList.contains('sh-open'); document.body.classList.toggle('sh-open', open); b.setAttribute('aria-expanded', String(open)); }
  });
  window.addEventListener('hashchange', route);
  route();
})();

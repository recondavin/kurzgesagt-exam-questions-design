// english.html: the Leaving Cert English comparative study (Higher Level, 2027). Content comes from eng/eng-data.js
// (tools/eng/build_eng.py). Pages, by hash: home (#), how it's marked (#marking), the essay and PACE (#structure),
// a mode with its comparison grid (#mode/theme|cc|gvv), a text with its key moments (#text/<id>), the language bank
// (#language), past questions (#questions) and the essay builder (#build). The student picks their three texts once
// (eng-texts); every page compares those three.
(function () {
  'use strict';
  var D = window.EngData, K = window.ExamAnswerMode && window.ExamAnswerMode.kit;
  var app = document.getElementById('eng-app'), side = document.getElementById('eng-side'), bar = document.getElementById('eng-top');
  if (!D || !app) return;
  var C = D.comparative, MODES = C.modes, MODE = {};
  MODES.forEach(function (m) { MODE[m.id] = m; });
  var COL = { sive: 'var(--t-sive)', othello: 'var(--t-othello)', shawshank: 'var(--t-shawshank)', stlt: 'var(--t-stlt)', theme: 'var(--m-theme)', cc: 'var(--m-cc)', gvv: 'var(--m-gvv)' };
  var PACE_COL = { P: 'var(--pace-p)', A: 'var(--pace-a)', C: 'var(--pace-c)', E: 'var(--pace-e)' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) {} return null; }
  function text(id) { return D.texts[id]; }
  function byline(t) { return (t.kind === 'film' ? 'Directed by ' : t.kind === 'drama' ? 'A play by ' : 'By ') + t.author; }
  // How to name it in an essay: "Sive by John B. Keane", "The Shawshank Redemption, directed by Frank Darabont".
  function nameLine(t) { return '<i>' + esc(t.title) + '</i>' + (t.kind === 'film' ? ', directed by ' : ' by ') + esc(t.author); }
  function pics(id) { return (D.images || []).filter(function (p) { return p.text === id; }); }
  function credit(p) {
    var still = /^Copyright/.test(p.licence || '');
    return 'Picture: ' + (p.source ? '<a href="' + esc(p.source) + '" target="_blank" rel="noopener">' + esc(p.title || p.file) + '</a>' : esc(p.title || p.file)) +
      (p.author ? ', ' + esc(p.author) : '') + (p.licence && !still ? ' (' + esc(p.licence) + ')' : '') + '.';
  }

  // ---------- your three texts ----------
  // You study three of the four, so it's always three: what's stored first, topped up in the texts' order (the home page
  // showed one ticked text while every other page used the first three). Changing it is leaving one out (leaveOut).
  function chosen() {
    var v = picks().slice(0, 3);
    D.order.forEach(function (id) { if (v.length < 3 && v.indexOf(id) < 0) v.push(id); });
    return v;
  }
  function picks() { var v = []; try { v = JSON.parse(store('eng-texts') || '[]'); } catch (e) {} return (Array.isArray(v) ? v : []).filter(function (id) { return D.texts[id]; }); }
  function setChosen(ids) { store('eng-texts', JSON.stringify(ids)); }
  function leftOut() { var c = chosen(); return D.order.filter(function (id) { return c.indexOf(id) < 0; })[0]; }
  // Leave this text out: the one left out until now comes in, in its place.
  function leaveOut(id) {
    var c = chosen(), back = leftOut();
    if (c.indexOf(id) < 0) return;
    c[c.indexOf(id)] = back;
    setChosen(c);
  }

  // ---------- the shell (bio-shell.css): sidebar, top bar ----------
  function link(href, label, active, extra) {
    return '<a class="sh-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + (extra || '') + '<span class="sh-t">' + esc(label) + '</span></a>';
  }
  function renderShell(active, crumb) {
    var mine = chosen();
    closeDef();
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (K ? K.face : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="English">' + link('#', 'All of English', active === 'hub') + link('#single', 'Single text', active === 'single') +
      '<p class="sh-group">Comparative</p>' + link('#comparative', 'Comparative', active === 'home') + link('#compare', 'Compare it', active === 'compare') +
      link('#learn', '1 · Learn the parts', active === 'learn') + link('#structure', '2 · Structure it', active === 'structure') + link('#language', '3 · Say it well', active === 'language') +
      link('#build', 'Build an essay', active === 'build') + link('#marking', 'How it\'s marked', active === 'marking') + link('#questions', 'Past questions', active === 'questions') +
      (window.EngGames ? '<p class="sh-group">Games</p>' + window.EngGames.list.map(function (g) { return link('#play/' + g[0], g[1], false); }).join('') : '') +
      '<p class="sh-group">Modes</p>' + MODES.map(function (m) { return link('#mode/' + m.id, m.name, active === 'mode/' + m.id, '<span class="sh-n" aria-hidden="true"><span class="eng-tag" style="--c:' + COL[m.id] + '">&nbsp;</span></span>'); }).join('') +
      '<p class="sh-group">Your texts</p>' + mine.map(function (id) { return link('#text/' + id, text(id).title, active === 'text/' + id, '<span class="sh-n" aria-hidden="true"><span class="eng-tag" style="--c:' + COL[id] + '">&nbsp;</span></span>'); }).join('') + '</nav>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="eng-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb">' + (crumb ? '<a href="#">English</a><span class="sh-sep" aria-hidden="true">/</span><span class="sh-here">' + esc(crumb) + '</span>' : '<span class="sh-here">English</span>') + '</p>' +
      '<nav class="sh-switch" aria-label="Subject"><a href="Geography%20Questions.dc.html">Geography</a><a href="biology.html">Biology</a><a href="english.html" aria-current="page">English</a><a href="irish.html">Irish</a><a href="german.html">German</a></nav>';
  }
  function menu(open) {
    document.body.classList.toggle('sh-open', open);
    var b = bar.querySelector('[data-sh-menu]');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function title(h, btn) {
    return '<div class="cv-title"><h1 class="cv-h1">' + esc(h) + '</h1>' + (btn || '') + '</div>';
  }
  function note(label, body) { return '<p class="eng-note"><span>' + esc(label) + '</span>' + esc(body) + '</p>'; }

  // ---------- home ----------
  // A text: tap it to open its page; the button in its corner leaves it out (or, on the one left out, says so).
  function pickCard(id, on) {
    var t = text(id), p = pics(id).filter(function (x) { return x.hero; })[0] || pics(id)[0];
    return '<div class="eng-pick' + (on ? ' is-on' : ' is-out') + '" style="--c:' + COL[id] + '">' +
      '<a class="eng-pick__link" href="#text/' + id + '"><span class="eng-pick__img">' + (p ? '<img src="assets/eng/img/' + esc(p.file) + '" alt="" loading="lazy">' : '<span class="eng-pick__init">' + esc(t.title.charAt(0)) + '</span>') + '</span>' +
      '<span class="eng-pick__body"><span class="eng-pick__t">' + esc(t.title) + '</span><span class="eng-pick__a">' + esc(t.author) + ' · ' + esc(t.kind) + '</span></span></a>' +
      (on ? '<button type="button" class="eng-pick__leave" data-eng-out="' + id + '" aria-label="Leave ' + esc(t.title) + ' out">Leave out</button>'
        : '<span class="eng-pick__off">Left out</span>') + '</div>';
  }
  // ---------- every part of the exam (the user: "first thing you need to pick ... comprehension, creative writing,
  // short story, diary, comparative, poetry ... dont fill them in yet just make them options and we go one by one") ----
  // English opens on the parts of the two papers. The comparative is filled in (its own home, #comparative); the single
  // text goes on to its text options (#single); the rest are options still to fill (#part/<id>), one at a time.
  var PARTS = [
    { paper: 'Paper 1', time: '2 hours 50 minutes, 200 marks', parts: [
      { id: 'question-a', name: 'Comprehension', marks: 50, label: 'Question A', what: 'Read a text and answer questions on it: what it says, how it says it, and what you think.' },
      { id: 'question-b', name: 'Writing task', marks: 50, label: 'Question B', what: 'A short piece in a set form, on a different text from your Question A: a diary entry, a letter, a speech, an article.', kinds: ['Diary entry', 'Letter', 'Speech or talk', 'Article', 'Blog post', 'Review', 'Report'] },
      { id: 'composition', name: 'Composition', marks: 100, label: 'Composing', what: 'One longer piece, chosen from seven titles.', kinds: ['Short story', 'Personal essay', 'Speech', 'Feature article', 'Discursive essay', 'Descriptive essay'] }
    ] },
    { paper: 'Paper 2', time: '3 hours 20 minutes, 200 marks', parts: [
      { id: 'single', name: 'Single text', marks: 60, what: 'One text studied on its own. You answer one of two questions on it.', href: '#single' },
      { id: 'comparative', name: 'Comparative study', marks: 70, what: 'Three texts compared through a mode: Theme or Issue, Cultural Context, or General Vision and Viewpoint.', href: '#comparative', ready: true },
      { id: 'unseen', name: 'Unseen poem', marks: 20, what: 'A poem you haven\'t seen before. You answer one of two questions on it.' },
      { id: 'poetry', name: 'Prescribed poetry', marks: 50, what: 'Eight poets are prescribed for 2027. You answer on one of the poets on the paper.', kinds: ['Elizabeth Bishop', 'Emily Dickinson', 'John Donne', 'Patrick Kavanagh', 'Derek Mahon', 'Paula Meehan', 'Adrienne Rich', 'W. B. Yeats'] }
    ] }
  ];
  // The single text's options for 2027 at Higher Level (Prescribed Material circular 0021/2025). Most schools do Othello.
  var SINGLE = [['othello', 'Othello', 'William Shakespeare', 'play'], ['gatsby', 'The Great Gatsby', 'F. Scott Fitzgerald', 'novel'], ['hamnet', 'Hamnet', 'Maggie O\'Farrell', 'novel'],
    ['dracula', 'Dracula', 'Bram Stoker', 'novel'], ['altar', 'Girl on an Altar', 'Marina Carr', 'play']];
  function partOf(id) { var f = null; PARTS.forEach(function (g) { g.parts.forEach(function (x) { if (x.id === id) f = x; }); }); return f; }
  function partCard(x) {
    var state = x.ready ? 'Ready' : x.id === 'single' ? 'Pick your text' : 'Coming soon';
    return '<a class="eng-card eng-part' + (x.ready ? ' is-ready' : '') + (state === 'Coming soon' ? ' is-soon' : '') + '" href="' + (x.href || '#part/' + x.id) + '">' +
      '<span class="eng-part__m">' + (x.label ? esc(x.label) + ', ' : '') + x.marks + ' marks</span><h3>' + esc(x.name) + '</h3><p>' + esc(x.what) + '</p>' +
      '<span class="eng-part__s">' + state + '</span></a>';
  }
  function renderHub() {
    renderShell('hub');
    app.innerHTML = title('English') + '<p class="eng-p">Leaving Cert English, Higher Level. Pick the part you\'re working on.</p>' +
      PARTS.map(function (g) {
        return '<h2 class="eng-h2">' + esc(g.paper) + ' <span class="eng-hub__t">' + esc(g.time) + '</span></h2>' +
          '<div class="eng-grid eng-grid--' + g.parts.length + ' eng-hub">' + g.parts.map(partCard).join('') + '</div>';
      }).join('');
  }
  function renderPart(id) {
    var x = partOf(id);
    if (!x || x.href) { location.hash = x && x.href ? x.href : ''; return; }
    renderShell('part/' + id, x.name);
    app.innerHTML = title(x.name) + '<p class="eng-p">' + (x.label ? esc(x.label) + ', ' : '') + x.marks + ' marks. ' + esc(x.what) + '</p>' +
      (x.kinds ? '<h2 class="eng-h2">' + (id === 'poetry' ? 'The poets' : 'The kinds you can be asked for') + '</h2><div class="eng-grid eng-grid--3">' +
        x.kinds.map(function (k) { return '<div class="eng-card eng-part is-soon"><h3>' + esc(k) + '</h3><span class="eng-part__s">Coming soon</span></div>'; }).join('') + '</div>' : '') +
      '<p class="eng-soon">Coming soon: these are being filled in one at a time.</p><p class="eng-btns"><a class="eng-btn eng-btn--quiet" href="#">All of English</a></p>';
  }
  function renderSingle() {
    renderShell('single', 'Single text');
    var oth = pics('othello').filter(function (q) { return q.hero; })[0];
    app.innerHTML = title('Single text') + '<p class="eng-p">60 marks on Paper 2. One text studied on its own: you answer one of two questions on it. Pick your text.</p>' +
      '<div class="eng-grid eng-grid--4 eng-single">' + SINGLE.map(function (x) {
        var img = x[0] === 'othello' && oth ? '<img src="assets/eng/img/' + esc(oth.file) + '" alt="" loading="lazy">' : '<span class="eng-pick__init">' + esc(x[1].replace(/^The /, '').charAt(0)) + '</span>';
        return '<div class="eng-pick is-soon"><span class="eng-pick__img">' + img + '</span><span class="eng-pick__body"><span class="eng-pick__t">' + esc(x[1]) + '</span>' +
          '<span class="eng-pick__a">' + esc(x[2]) + ' · ' + x[3] + '</span>' + (x[0] === 'othello' ? '<span class="eng-single__most">Most schools do this one</span>' : '') +
          '<span class="eng-part__s">Coming soon</span></span></div>';
      }).join('') + '</div><p class="eng-btns"><a class="eng-btn eng-btn--quiet" href="#">All of English</a></p>';
  }
  function renderHome() {
    renderShell('home', 'Comparative');
    var mine = chosen();
    var pc = C.marks.criteria;
    app.innerHTML = title('Comparative Study') +
      '<h2 class="eng-h2">Your three texts</h2>' +
      '<div class="eng-grid eng-grid--4">' + D.order.map(function (id) { return pickCard(id, mine.indexOf(id) >= 0); }).join('') + '</div>' +
      '<p class="eng-picked" data-eng-picked>' + pickedLine(mine) + '</p>' +
      '<h2 class="eng-h2">Three steps. That\'s all it is.</h2>' + stepsHome() +
      (D.compare && D.compare.length ? '<h2 class="eng-h2">Compare it</h2><a class="eng-card eng-cp__home" href="#compare" style="--c:var(--m-theme)"><span class="eng-bar"></span>' +
        '<h3>' + esc(D.compare[0].name) + ': a 30 + 40 answer</h3><p>Pick your part (a) text, link moments across the other two, and get a plan for the whole answer.</p></a>' : '') +
      '<h2 class="eng-h2">The modes for ' + C.year + '</h2>' +
      '<p class="eng-p">All three modes are on the ' + C.year + ' paper. You answer on one.</p>' +
      '<div class="eng-grid eng-grid--3">' + MODES.map(function (m) {
        return '<a class="eng-card" href="#mode/' + m.id + '" style="--c:' + COL[m.id] + '"><span class="eng-bar"></span><h3>' + esc(m.name) + '</h3><p>' + esc(m.hook) + '</p></a>';
      }).join('') + '</div>' +
      '<h2 class="eng-h2">How it\'s marked</h2>' +
      '<a class="eng-card" href="#marking" style="display:block"><div class="eng-pclm" style="margin:0">' + pc.map(pclmSeg).join('') + '</div></a>' +
      '<h2 class="eng-h2">Every paragraph: PACE</h2>' +
      '<a href="#structure" style="text-decoration:none"><div class="eng-pace">' + C.structure.pace.map(function (p) {
        return '<div class="eng-pace__t" style="background:' + PACE_COL[p.k] + '"><b>' + p.k + '</b><strong>' + esc(p.name) + '</strong></div>';
      }).join('') + '</div></a>' +
      (window.EngGames ? '<h2 class="eng-h2">Games</h2><div class="eng-grid eng-grid--4">' + window.EngGames.list.map(function (g) {
        return '<a class="eng-card" href="#play/' + g[0] + '"><h3>' + esc(g[1]) + '</h3><p>' + esc(g[2]) + '</p></a>';
      }).join('') + '</div>' : '');
  }
  // The three steps (the user: "all u need to do is learn parts of it and how it represents what and that leads to
  // what and then you have to learn how to structure it, and THEN u have to learn to put it into fancy words").
  var STEPS = [['#learn', 'Learn the parts', 'Every key moment: what happens, what it shows, what it leads to.', 'learn'],
    ['#structure', 'Structure it', 'Your chain slots into PACE. That\'s a paragraph.', 'structure'],
    ['#language', 'Say it well', 'Plain words in, exam words out.', 'language']];
  function stepsHome() {
    var learnt = learnStore(), mine = chosen(), all = 0, got = 0;
    mine.forEach(function (t) { text(t).moments.forEach(function (m) { all++; if (learnt[m.id]) got++; }); });
    return '<div class="eng-steps">' + STEPS.map(function (x, k) {
      return '<a class="eng-step" href="' + x[0] + '"><b>' + (k + 1) + '</b><h3>' + esc(x[1]) + '</h3><p>' + esc(x[2]) + '</p>' +
        (k === 0 ? '<span class="eng-step__bar"><i style="width:' + Math.round(100 * got / Math.max(all, 1)) + '%"></i></span><small>' + got + ' of ' + all + ' moments learnt</small>' : '') + '</a>' +
        (k < 2 ? '<span class="eng-step__arrow" aria-hidden="true">→</span>' : '');
    }).join('') + '</div>' +
      '<p class="eng-then"><span>Then put it together:</span><a class="eng-btn" href="#build">Build an essay</a></p>';
  }

  // ---------- step 1: learn the parts ----------
  // Each key moment of your texts as a chain: what happens → what it shows → what it leads to. Test me hides the last
  // two links: tap to see them, then say whether you had it. What you've learnt is kept (eng-learn).
  var LT = null, LM = 'all', LTEST = false;
  function learnStore() { try { return JSON.parse(store('eng-learn') || '{}') || {}; } catch (e) { return {}; } }
  function renderLearn() {
    renderShell('learn', 'Learn the parts');
    var mine = chosen();
    if (mine.indexOf(LT) < 0) LT = mine[0];
    var t = text(LT), learnt = learnStore();
    var list = t.moments.filter(function (m) { return LM === 'all' || (m.modes || []).indexOf(LM) >= 0; });
    var got = t.moments.filter(function (m) { return learnt[m.id]; }).length;
    app.innerHTML = title('Learn the parts', '<span class="eng-btns"><a class="eng-btn eng-btn--quiet" href="#text/' + LT + '/cast">Who\'s who</a><a class="eng-btn" href="eng-golf.html?story=' + LT + '">Mini Golf: ' + esc(text(LT).title) + '</a><a class="eng-btn" href="eng-pool.html?story=' + LT + '">Pool</a><button type="button" class="eng-btn eng-btn--quiet" data-eng-ltest aria-pressed="' + LTEST + '">' + (LTEST ? 'Show me everything' : 'Test me') + '</button></span>') +
      '<p class="eng-p">Every key moment is a chain: <b>what happens</b>, <b>what it shows</b>, and <b>what it leads to</b>. Learn the chains and you have your paragraphs.</p>' +
      '<div class="eb-choices">' + mine.map(function (x) { return '<button type="button" class="eng-chip" style="--c:' + COL[x] + '" data-eng-lt="' + x + '" aria-pressed="' + (x === LT) + '">' + esc(text(x).title) + '</button>'; }).join('') + '</div>' +
      '<div class="eb-choices">' + [['all', 'All moments']].concat(MODES.map(function (m) { return [m.id, m.short || m.name]; })).map(function (x) { return '<button type="button" class="eng-chip" ' + (MODE[x[0]] ? 'style="--c:' + COL[x[0]] + '" ' : '') + 'data-eng-lm="' + x[0] + '" aria-pressed="' + (LM === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="eng-lprog" style="--c:' + COL[LT] + '"><span><i style="width:' + Math.round(100 * got / t.moments.length) + '%"></i></span><b>' + got + ' of ' + t.moments.length + '</b> learnt in ' + esc(t.title) + '</div>' +
      '<div class="eng-chains">' + list.map(function (m) { return chainHtml(LT, m, learnt); }).join('') + '</div>';
  }
  function chainHtml(tid, m, learnt) {
    var c = m.chain || { happens: m.what, shows: m.why, leads: '' }, k = momentNo(tid, m.id), pic = scenePics(tid, m.id)[0];
    var link = function (kind, label, body, hide) {
      return '<div class="eng-link eng-link--' + kind + (hide ? ' is-hidden' : '') + '"' + (hide ? ' role="button" tabindex="0" data-eng-reveal' : '') + '><span>' + label + '</span><p>' + esc(body) + '</p>' + (hide ? '<em>Tap to see</em>' : '') + '</div>';
    };
    return '<article class="eng-chain' + (learnt[m.id] ? ' is-learnt' : '') + '" style="--c:' + COL[tid] + '" data-eng-chain="' + m.id + '">' +
      '<header>' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '<span class="eng-chain__n">' + (k + 1) + '</span>') +
        '<div><h3>' + esc(m.title) + '</h3><small>' + esc(m.where) + ' · ' + (m.modes || []).map(function (x) { return '<span class="eng-tag" style="--c:' + COL[x] + '">' + esc(MODE[x] ? MODE[x].short : x) + '</span>'; }).join(' ') + '</small></div>' +
        (learnt[m.id] ? '<span class="eng-chain__ok">✓ Learnt</span>' : '') + '</header>' +
      '<div class="eng-chain__row">' + link('h', 'What happens', c.happens, false) + '<i aria-hidden="true">→</i>' + link('s', 'What it shows', c.shows, LTEST) + '<i aria-hidden="true">→</i>' + link('l', 'What it leads to', c.leads, LTEST) + '</div>' +
      (LTEST ? '<div class="eng-chain__judge"><button type="button" class="eng-btn eng-btn--quiet" data-eng-learn="' + m.id + ':0">Not yet</button><button type="button" class="eng-btn" data-eng-learn="' + m.id + ':1">Got it</button></div>' : '') +
      '</article>';
  }

  function pickedLine(mine) {
    return 'Tap a text to open it. Not studying one? Tap Leave out under it. Comparing <b>' + mine.map(function (id) { return esc(text(id).title); }).join(', ') + '</b>' +
      (mine.indexOf('othello') >= 0 ? '. Othello is your Shakespeare, so your single text must be another one.' : '. Your single text must be Othello, since a Shakespeare play is required at Higher Level.');
  }
  function pclmSeg(c) {
    var col = { P: '#FFE45C', C: '#BFE3FF', L: '#C6F0B4', M: '#FFD3E6' }[c.code];
    return '<i style="flex:' + c.pct + ';background:' + col + '"><b>' + c.code + ' ' + c.of70 + '</b>' + esc(c.name) + '</i>';
  }

  // ---------- how it's marked ----------
  function renderMarking() {
    renderShell('marking', 'How it\'s marked');
    var M = C.marks, cr = M.criteria, col = { P: '#FFE45C', C: '#BFE3FF', L: '#C6F0B4', M: '#FFD3E6' };
    var P = C.paper;
    var glance = P ? '<h2 class="eng-h2">Paper 2 in ' + C.year + '</h2><p class="eng-p">' + esc(P.time) + '</p>' +
      '<div class="eng-grid eng-grid--3 eng-secs">' + P.sections.map(function (x) {
        var me = /Comparative/.test(x.name);
        return '<div class="eng-card eng-sec' + (me ? ' is-me' : '') + '"><span class="eng-sec__m">' + x.marks + '</span><h3>' + esc(x.name) + '</h3><p>' + esc(x.what) + '</p></div>';
      }).join('') + '</div>' +
      '<div class="eng-grid eng-grid--2" style="margin-top:12px"><div class="eng-card"><h3>A 70-mark question</h3><p>' + esc(P.seventy) + '</p></div>' +
      '<div class="eng-card"><h3>A 30 + 40 question</h3><p>' + esc(P.split) + '</p></div></div>' +
      '<p class="eng-credit">From the official <a href="' + esc(P.source.url) + '" target="_blank" rel="noopener">' + esc(P.source.name) + '</a>. ' + esc(C.current || '') + '</p>' : '';
    app.innerHTML = title('How it\'s marked') + glance +
      '<h2 class="eng-h2">The marks</h2>' +
      '<p class="eng-p">The comparative question is worth <b>' + M.total + ' marks</b>. ' + esc(M.note) + ' ' + esc(M.single) + '</p>' +
      '<div class="eng-pclm">' + cr.map(pclmSeg).join('') + '</div>' +
      '<p class="eng-note eng-note--warn"><span>The most important rule</span>' + esc(M.primacy) + '</p>' +
      '<div class="eng-grid eng-grid--2" style="margin-top:18px">' + cr.map(function (c) {
        return '<div class="eng-card eng-crit"><span class="eng-crit__k" style="--c:' + col[c.code] + '">' + c.code + '</span>' +
          '<h3>' + esc(c.name) + '</h3><span class="eng-crit__m">' + c.pct + '% · ' + c.of70 + ' of 70</span>' +
          '<p>' + esc(c.what) + '</p><p class="eng-crit__c">' + esc(c.comp) + '</p></div>';
      }).join('') + '</div>' +
      '<h2 class="eng-h2">Grades out of 70</h2><div class="eng-grades">' + M.grades.map(function (g) { return '<span><b>' + g[0] + '</b>' + g[1] + '</span>'; }).join('') + '</div>' +
      '<h2 class="eng-h2">A question in two parts</h2><p class="eng-p">' + esc(M.splitText) + '</p>' +
      '<h2 class="eng-h2">What examiners reward</h2><ul class="eng-ask">' + M.reward.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<p class="eng-credit">' + esc(M.rewardSource) + '</p>' +
      '<h2 class="eng-h2">What gets the marks</h2>' + cr.map(function (c) { return note(c.name, c.do); }).join('') +
      '<h2 class="eng-h2">The rules for ' + C.year + '</h2>' +
      '<ul class="eng-ask">' + C.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<p class="eng-credit">Sources: ' + (C.sources || []).map(function (x) { return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + '</a>'; }).join(', ') + '.</p>';
  }

  // ---------- the essay and PACE ----------
  function renderStructure() {
    renderShell('structure', 'Structure it');
    var S = C.structure, parts = S.parts;
    var flow = '<div class="eng-flow">' + parts.map(function (p, k) {
      return (k ? '<span class="eng-flow__arrow" aria-hidden="true">→</span>' : '') +
        '<div class="eng-card"><h3>' + esc(p.name) + '</h3><p>' + esc(p.what) + '</p><p class="eng-avoid">' + esc(p.avoid.replace(/^Don't /, 'Don\'t ')) + '</p></div>';
    }).join('') + '</div>';
    var eg = S.pace.map(function (p) { return '<mark class="pace-' + p.k.toLowerCase() + '">' + esc(p.eg) + '</mark>'; }).join(' ');
    app.innerHTML = title('Structure it', '<a class="eng-btn" href="#build">Build an essay</a>') +
      '<h2 class="eng-h2">Your chain is a paragraph</h2><p class="eng-p">Take a moment from one text and a moment from another. The chains you learnt slot straight into PACE.</p>' + chainPace() +
      '<h2 class="eng-h2">The whole essay</h2>' +
      '<p class="eng-p">' + esc(S.length) + ' ' + esc(S.time) + '</p>' + flow +
      '<h2 class="eng-h2">Every paragraph: PACE</h2>' +
      '<div class="eng-pace">' + S.pace.map(function (p) {
        return '<div class="eng-pace__t" style="background:' + PACE_COL[p.k] + '"><b>' + p.k + '</b><strong>' + esc(p.name) + '</strong><p>' + esc(p.what) + '</p></div>';
      }).join('') + '</div>' +
      '<h2 class="eng-h2">A PACE paragraph</h2><div class="eng-paper">' + eg + '</div>' + note('Remember it', S.hook);
  }

  // The chain → PACE: Point is what both moments show, Anchor is what happens in the first, Compare brings in the other
  // text's moment, Evaluate is what each leads to and which says it more powerfully.
  var CP = null;
  function chainPace() {
    var mine = chosen();
    if (!CP || mine.indexOf(CP[0]) < 0 || mine.indexOf(CP[2]) < 0 || CP[0] === CP[2]) CP = [mine[0], 0, mine[1], 0];
    var A = text(CP[0]).moments[CP[1]], B = text(CP[2]).moments[CP[3]], a = A.chain, b = B.chain;
    var pick = function (slot) {
      var tid = CP[slot], other = CP[slot === 0 ? 2 : 0];
      return '<label class="eng-cpick" style="--c:' + COL[tid] + '"><select data-eng-cp="' + slot + '">' + mine.filter(function (x) { return x !== other; }).map(function (x) {
        return '<optgroup label="' + esc(text(x).title) + '">' + text(x).moments.map(function (m, k) { return '<option value="' + x + ':' + k + '"' + (x === tid && k === CP[slot + 1] ? ' selected' : '') + '>' + esc(m.title) + '</option>'; }).join('') + '</optgroup>';
      }).join('') + '</select></label>';
    };
    var row = function (k, label, from, body) { return '<div class="eng-cp__r"><b style="background:' + PACE_COL[k] + '">' + k + '</b><div><span>' + label + ' <em>' + from + '</em></span><p>' + body + '</p></div></div>'; };
    var tA = esc(text(CP[0]).title), tB = esc(text(CP[2]).title);
    return '<div class="eng-cp"><div class="eng-cp__picks">' + pick(0) + '<span>with</span>' + pick(2) + '</div>' +
      row('P', 'Point', '= what both moments show', '<i>' + tA + ':</i> ' + esc(a.shows) + '<br><i>' + tB + ':</i> ' + esc(b.shows)) +
      row('A', 'Anchor', '= what happens in ' + tA, esc(a.happens)) +
      row('C', 'Compare', '= the other text: similarly, or in contrast,', esc(b.happens)) +
      row('E', 'Evaluate', '= what each leads to, and which says it more powerfully', '<i>' + tA + ':</i> ' + esc(a.leads) + '<br><i>' + tB + ':</i> ' + esc(b.leads)) + '</div>';
  }

  // ---------- a mode: the three texts side by side ----------
  function modeRows(id, tid) {
    var m = text(tid).modes[id] || {};
    if (id === 'theme') return (m.themes || []).map(function (g) { return [g.name, g.points]; });
    if (id === 'cc') return (m.aspects || []).map(function (g) { return [g.name, g.points]; });
    return [['The opening', [m.opening].filter(Boolean)], ['Light and dark', (m.points || []).slice(0, 3)], ['The ending', [m.ending].filter(Boolean)],
      ['Outlook', m.outlook ? ['<' + m.outlook + '>'] : []], ['More', (m.points || []).slice(3)]];
  }
  function pointHtml(p, tid) {
    var o = /^<(bleak|hopeful|mixed)>$/.exec(p);
    if (o) return '<p><span class="eng-outlook eng-outlook--' + o[1] + '">' + o[1].charAt(0).toUpperCase() + o[1].slice(1) + '</span></p>';
    return '<p>' + esc(p).replace(/\[([a-z]+-(\d+))\]/g, function (all, ref, n) {
      return '<a class="eng-ref" href="#text/' + tid + '/' + ref + '" title="Key moment ' + n + '">' + n + '</a>';
    }) + '</p>';
  }
  function renderMode(id) {
    var m = MODE[id];
    if (!m) { location.hash = ''; return; }
    renderShell('mode/' + id, m.name);
    var mine = chosen().filter(function (t) { return text(t).modes && text(t).modes[id]; });
    var names = [], seen = {};
    mine.forEach(function (t) { modeRows(id, t).forEach(function (r) { if (!seen[r[0]]) { seen[r[0]] = 1; names.push(r[0]); } }); });
    var grid = '<div class="eng-cmp" style="--n:' + mine.length + '"><span class="eng-cmp__corner"></span>' +
      mine.map(function (t) { return '<span class="eng-cmp__h" style="--c:' + COL[t] + '">' + esc(text(t).title) + '</span>'; }).join('') +
      names.map(function (name) {
        var pts = mine.map(function (t) { var row = modeRows(id, t).filter(function (r) { return r[0] === name; })[0]; return row ? row[1] : []; });
        // A row nobody has notes for (say, "More" when the vision points run short) is left out.
        if (!pts.some(function (p) { return p.length; })) return '';
        return '<span class="eng-cmp__row">' + esc(name) + '</span>' + mine.map(function (t, k) {
          return '<div class="eng-cmp__cell" style="--c:' + COL[t] + '" data-t="' + esc(text(t).title) + '">' + (pts[k].length ? pts[k].map(function (p) { return pointHtml(p, t); }).join('') : '<p>–</p>') + '</div>';
        }).join('');
      }).join('') + '</div>';
    app.innerHTML = title(m.name, '<a class="eng-btn" href="#build/' + id + '">Build an essay</a>') +
      '<p class="eng-p">' + esc(m.what) + '</p>' +
      (m.official ? '<figure class="eng-official" style="--c:' + COL[id] + '"><blockquote>' + esc(m.official.quote) + '</blockquote><figcaption>' + esc(m.official.src) + '</figcaption>' +
        (m.official.also ? '<p>' + esc(m.official.also) + '</p>' : '') + '</figure>' : '') +
      note('Remember it', m.hook) +
      '<div class="eng-grid eng-grid--2" style="margin-top:18px"><div class="eng-card"><h3>Ask these of each text</h3><ul class="eng-ask">' + m.ask.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="eng-card"><h3>Words for this mode</h3><ul class="eng-words">' + m.words.map(chip).join('') + '</ul></div></div>' +
      '<h2 class="eng-h2">Your three texts, side by side</h2>' + (mine.length ? grid : '<p class="eng-p">The notes for your texts are on their way.</p>');
  }
  function chip(w) { return '<li><button type="button" class="eng-chip" data-eng-copy="' + esc(w) + '">' + esc(w) + '</button></li>'; }

  // ---------- a text ----------
  function renderText(id, moment) {
    var t = text(id);
    if (!t) { location.hash = ''; return; }
    renderShell('text/' + id, t.title);
    var p = pics(id), hero = p.filter(function (x) { return x.hero; })[0], face = p.filter(function (x) { return x.kind === 'author'; })[0];
    app.innerHTML = '<div class="eng-hero" style="--c:' + COL[id] + '"><div><h1 class="eng-hero__t">' + esc(t.title) + '</h1>' +
        '<p class="eng-hero__a">' + (face ? '<img class="eng-hero__face" src="assets/eng/img/' + esc(face.file) + '" alt="' + esc(face.title) + '" title="' + esc(face.caption) + '">' : '') + esc(byline(t)) + (t.made ? ' · ' + esc(t.made) : '') + '</p>' +
        '<p class="eng-p">' + esc(t.gist) + '</p><p class="eng-p"><b>Setting:</b> ' + esc(t.setting) + '</p>' +
        '<p class="eng-btns"><a class="eng-btn" href="eng-golf.html?story=' + id + '">Play the story: Mini Golf</a><a class="eng-btn eng-btn--quiet" href="eng-pool.html?story=' + id + '">Pool</a></p></div>' +
        (hero ? '<figure><img src="assets/eng/img/' + esc(hero.file) + '" alt="' + esc(hero.title) + '"><figcaption>' + credit(hero) + '</figcaption></figure>' : '') + '</div>' +
      castHtml(t) +
      '<h2 class="eng-h2">The story in ' + t.moments.length + ' key moments</h2>' +
      t.moments.map(function (m, k) { return sceneHtml(t, m, k); }).join('');
    watchScenes();
    castDraw('line');
    if (moment) { var el = document.getElementById(moment); if (el) el.scrollIntoView({ block: 'start' }); }
  }

  // ---------- who's who (the user: "i lowk dont know who the characters are") ----------
  // Each text's people in their groups (the Glavin house, the match...), each with a face where a picture surely shows
  // them (else their initials), who they are to the others, what they want, what happens to them in the end, and the
  // key moments they're in (found by name in the moments).
  var GROUP_COL = ['#FFD43B', '#6BC5F8', '#C792EA', '#FF9F6B', '#8FD3B8'];
  var FIND = { 'Seán Dóta': 'Seán Dóta', "Ellis 'Red' Redding": 'Red', 'The Duke of Venice': 'Duke', 'The Mother Superior': 'Mother Superior', 'The Furlong daughters': 'daughters|girls', "Sarah (Bill's mother)": "Bill's mother|his mother", 'Sarah Redmond': 'Sarah' };
  function findOf(c) {
    if (FIND[c.name]) return FIND[c.name];
    var w = c.name.replace(/\s*\(.*\)/, '').split(' ');
    return /^(The|Mrs|Warden|Captain)$/.test(w[0]) ? w[w.length - 1] : w[0];
  }
  function inMoments(t, c) {
    var re = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + findOf(c) + ')(?![A-Za-zÀ-ÿ])');
    return t.moments.filter(function (m) { return re.test(m.title + ' ' + m.what + ' ' + (m.chain ? m.chain.happens : '')); });
  }
  function faceHtml(c, size) {
    var f = c.face;
    if (!f) return '<span class="eng-face eng-face--init" style="width:' + size + 'px;height:' + size + 'px">' + esc(c.name.replace(/^(The|Mrs|Warden|Captain) /, '').replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('')) + '</span>';
    return '<span class="eng-face" style="width:' + size + 'px;height:' + size + 'px"><img src="assets/eng/img/' + esc(f.file) + '" alt="" loading="lazy" style="width:' + (f.zoom * 100) + '%;left:' + ((0.5 - f.x * f.zoom) * 100) + '%;top:' + ((0.5 - f.y * f.zoom * f.ar) * 100) + '%"></span>';
  }
  function groupsOf(t) { var g = []; t.people.forEach(function (c) { if (c.group && g.indexOf(c.group) < 0) g.push(c.group); }); return g; }
  // The cast as a map you play with (the user: "how am i gonna have fun learning when its not interactive at all"):
  // people where they sit (people[].pos, 1000 x 600) and the lines between them with what links them (text.links: a,
  // b, "his mother": a is b's mother). Three ways in:
  //   Meet them  one at a time, each with a line on who they are; their lines draw in to the people already there.
  //   Explore    tap anyone: their lines light up, the rest fade, and what they want and how they end shows below.
  //   Build it   the faces are blank but the lines and what they say stay: drag (or tap, then tap) each name onto its
  //              person. The title character is placed to start you off. Mistakes are counted; the best is kept.
  // The full cards are still there, folded, under the map.
  var CM = null;
  function castHtml(t) {
    var met = store('eng-cast-met-' + t.id);
    CM = { t: t.id, mode: met ? 'explore' : 'meet', sel: -1, shown: 1, placed: {}, pick: -1, miss: 0, order: null, write: -1, res: null, spot: 0, wrote: 0, bad: {}, only: null };
    var groups = groupsOf(t);
    return '<section class="eng-cast" id="cast"><div class="eng-cast__top"><h2 class="eng-h2">Who\'s who</h2>' +
      '<div class="eng-tabs" role="tablist">' + [['meet', 'Meet them'], ['explore', 'Explore'], ['build', 'Build it']].map(function (m) { return '<button type="button" role="tab" data-cm="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="eng-stage"><div class="eng-map" data-map></div><div class="eng-map__panel" data-map-panel aria-live="polite"></div></div>' +
      '<details class="eng-cast__all"><summary>Every character in full</summary><div class="eng-cast__groups">' + groups.map(function (g, gi) {
        return '<div class="eng-cast__g" style="--g:' + GROUP_COL[gi % GROUP_COL.length] + '"><h3>' + esc(g) + '</h3>' + t.people.filter(function (c) { return c.group === g; }).map(function (c) { return whoCard(t, c); }).join('') + '</div>';
      }).join('') + '</div></details></section>';
  }
  function whoCard(t, c) {
    var ms = inMoments(t, c);
    return '<article class="eng-who">' + faceHtml(c, 64) + '<div><h4>' + esc(c.name) + '</h4><span class="eng-who__tag">' + esc(c.tag) + '</span>' + (c.trait ? '<p class="eng-who__trait">' + wordMark(c.trait) + '</p>' : '') + '<p>' + wordMark(c.who) + '</p>' +
      '<dl><dt>Wants</dt><dd>' + wordMark(c.wants) + '</dd><dt>In the end</dt><dd>' + wordMark(c.end) + '</dd></dl>' +
      (ms.length ? '<p class="eng-who__in"><span>In</span>' + ms.map(function (m) { return '<a href="#text/' + t.id + '/' + m.id + '" title="' + esc(m.title) + '">' + (momentNo(t.id, m.id) + 1) + '</a>'; }).join('') + '</p>' : '') + fromHtml(c) + '</div></article>';
  }
  // Where the face is from (which production or film), so it's clear who's shown.
  function fromHtml(c) { return c.face && c.face.from ? '<p class="eng-who__from">Pictured: ' + esc(c.face.from) + '</p>' : '';
  }
  function gcol(t, c) { return GROUP_COL[groupsOf(t).indexOf(c.group) % GROUP_COL.length]; }
  function castDraw(fresh) {
    var box = app.querySelector('[data-map]'), panel = app.querySelector('[data-map-panel]');
    if (!box || !CM) return;
    var t = text(CM.t), P = t.people, links = t.links || [], idx = function (n) { for (var i = 0; i < P.length; i++) if (P[i].name === n) return i; return -1; };
    app.querySelectorAll('[data-cm]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-cm') === CM.mode)); });
    var sec = app.querySelector('.eng-cast'); if (sec) sec.classList.toggle('is-build', CM.mode === 'build');
    // Explore: picking someone slides the map to the right and their profile in on the left (wide screens). The map's
    // move is measured before and after and played as one glide (it shrinks as it goes).
    var open = CM.mode === 'explore' && CM.sel >= 0, glide = null;
    if (sec && sec.classList.contains('is-open') !== open) {
      var r0 = box.getBoundingClientRect();
      sec.classList.toggle('is-open', open);
      sideSize(open);
      var r1 = box.getBoundingClientRect();
      if (r1.width && (Math.abs(r0.left - r1.left) > 4 || Math.abs(r0.width - r1.width) > 4)) glide = [r0.left - r1.left, r0.top - r1.top, r0.width / r1.width];
    }
    // (When a round is over its summary isn't stuck to the bottom of the screen.)
    if (sec) sec.classList.toggle('is-done', CM.mode === 'build' && CM.write < 0 && P.every(function (c, i) { return CM.placed[i]; }));
    // On a phone the map stands on its side (taller than wide), so the people spread out down the screen.
    var tall = window.matchMedia('(max-width: 700px)').matches;
    var VW = tall ? 600 : 1000, VH = tall ? 1000 : 600;
    // People sit in the inner part of the map, with room round the edge for their names (more at the bottom, where a
    // name hangs below its face). On a phone, where names are wide for the map, a name at the side is nudged inside.
    var at = function (c) {
      var q = tall ? [c.pos[1], c.pos[0]] : c.pos;
      return tall ? [q[0], VH * 0.04 + q[1] * 0.86] : [VW * 0.05 + q[0] * 0.9, VH * 0.04 + q[1] * 0.86];
    };
    var visible = function (i) { return CM.mode !== 'meet' || i < CM.shown; };
    var named = function (i) { return CM.mode !== 'build' || CM.placed[i]; };
    // Which lines say what links them: in Build it, the ones from someone already placed (each is a clue to the next).
    var hot = function (l) {
      var a = idx(l[0]), b = idx(l[1]);
      // (On a phone, only the clues still to use: a line from someone placed to someone not yet, so it stays readable.)
      // (In a retest, too, as nearly everyone is already in place.)
      if (CM.mode === 'build') return tall || CM.only ? (!CM.placed[a] !== !CM.placed[b]) || a === CM.write || b === CM.write : CM.placed[a] || CM.placed[b];
      return CM.mode === 'meet' ? (a === CM.shown - 1 || b === CM.shown - 1) : (CM.sel >= 0 && (a === CM.sel || b === CM.sel));
    };
    var lines = '', labels = '';
    links.forEach(function (l, k) {
      var a = idx(l[0]), b = idx(l[1]), A = at(P[a]), B = at(P[b]);
      if (!visible(a) || !visible(b)) return;
      var on = hot(l), dim = CM.mode === 'explore' && CM.sel >= 0 && !on;
      lines += '<line x1="' + A[0] + '" y1="' + A[1] + '" x2="' + B[0] + '" y2="' + B[1] + '" vector-effect="non-scaling-stroke" class="' + (on ? 'is-on' : '') + (dim ? ' is-dim' : '') + (fresh === 'line' && (a === CM.shown - 1 || b === CM.shown - 1) ? ' is-new' : '') + '"/>';
      if (on) labels += '<span class="eng-map__lab" data-ab="' + [A[0] / VW * 100, A[1] / VH * 100, B[0] / VW * 100, B[1] / VH * 100].join(',') + '" style="left:' + ((A[0] + B[0]) / VW * 50) + '%;top:' + ((A[1] + B[1]) / VH * 50) + '%">' + esc(l[2]) + '</span>';
    });
    box.innerHTML = '<svg class="eng-map__lines" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' + labels +
      P.map(function (c, i) {
        if (!visible(i)) return '';
        var linked = CM.sel >= 0 && links.some(function (l) { return (idx(l[0]) === CM.sel && idx(l[1]) === i) || (idx(l[1]) === CM.sel && idx(l[0]) === i); });
        var cls = 'eng-node' + (i === CM.sel || (CM.mode === 'build' && i === CM.write) ? ' is-sel' : '') + (CM.mode === 'explore' && CM.sel >= 0 && i !== CM.sel && !linked ? ' is-dim' : '') + (CM.mode === 'meet' && i === CM.shown - 1 ? ' is-new' : '') +
          (!named(i) ? ' is-blank' : '') + (fresh === 'placed' && CM.last === i ? ' is-new' : '') + (CM.mode === 'build' && CM.wrong === i ? ' is-wrong' : '');
        var xy = at(c);
        return '<button type="button" class="' + cls + '" data-node="' + i + '" style="left:' + xy[0] / VW * 100 + '%;top:' + xy[1] / VH * 100 + '%;--g:' + gcol(t, c) + '">' +
          (named(i) ? faceHtml(c, 56) + '<b>' + esc(c.name) + '</b>' : '<span class="eng-face eng-face--q" style="width:56px;height:56px">?</span><b>?</b>') + '</button>';
      }).join('');
    CM.wrong = -1;
    if (DEF && !document.body.contains(DEF.btn)) closeDef();
    if (glide && box.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      box.animate([{ transformOrigin: '0 0', transform: 'translate(' + glide[0] + 'px,' + glide[1] + 'px) scale(' + glide[2] + ')' }, { transformOrigin: '0 0', transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.25,.8,.25,1)' });
    // A label sits in the middle of its line unless that covers someone (or another label): then it slides along the
    // line to the first clear spot. It also stays inside the map, even on a line along its edge.
    var br = box.getBoundingClientRect(), taken = [];
    box.querySelectorAll('.eng-node b').forEach(function (nb) {
      var r = nb.getBoundingClientRect(), dx = r.left < br.left + 3 ? br.left + 3 - r.left : r.right > br.right - 3 ? br.right - 3 - r.right : 0;
      if (dx) nb.style.transform = 'translateX(' + Math.round(dx) + 'px)';
    });
    box.querySelectorAll('.eng-node .eng-face, .eng-node:not(.is-blank) b').forEach(function (e) { var r = e.getBoundingClientRect(); if (r.width) taken.push(r); });
    var hits = function (r) { return taken.some(function (q) { return r.left < q.right + 3 && q.left < r.right + 3 && r.top < q.bottom + 3 && q.top < r.bottom + 3; }); };
    var face = box.querySelector('.eng-node .eng-face'), fs = face ? face.getBoundingClientRect().width : 50;
    box.querySelectorAll('.eng-map__lab').forEach(function (lab) {
      var ab = lab.getAttribute('data-ab').split(',').map(Number), r, W = br.width / 100, H = br.height / 100;
      // Along the line first; on a short line between two close people, just beside it (clear of both faces).
      var dx = (ab[2] - ab[0]) * W, dy = (ab[3] - ab[1]) * H, len = Math.hypot(dx, dy) || 1, lh = lab.offsetHeight, lw = lab.offsetWidth;
      var nx = -dy / len, ny = dx / len, off = Math.abs(nx) * lw / 2 + Math.abs(ny) * lh / 2 + 5, tries = [];
      [0.5, 0.42, 0.58, 0.35, 0.65, 0.28, 0.72, 0.22, 0.78].forEach(function (f) { tries.push([f, 0]); });
      // (Right beside the line first; then far enough out to clear the faces at its ends.)
      [off, off + fs / 2].forEach(function (o) { [0.5, 0.42, 0.58].forEach(function (f) { tries.push([f, -o], [f, o]); }); });
      var put = function (f, o) {
        lab.style.marginLeft = ''; lab.style.left = (ab[0] + (ab[2] - ab[0]) * f + nx * o / W) + '%'; lab.style.top = (ab[1] + (ab[3] - ab[1]) * f + ny * o / H) + '%';
        var q = lab.getBoundingClientRect(), ex = q.left < br.left + 4 ? br.left + 4 - q.left : q.right > br.right - 4 ? br.right - 4 - q.right : 0;
        if (ex) { lab.style.marginLeft = ex + 'px'; q = lab.getBoundingClientRect(); }
        return q;
      };
      // (No clear spot: in Explore the label is dropped, since the same link is listed under the map.)
      if (!tries.some(function (q) { r = put(q[0], q[1]); return !hits(r); })) {
        if (CM.mode === 'explore') { lab.remove(); return; }
        r = put(0.5, 0);
      }
      taken.push(r);
    });
    // The panel under the map.
    if (CM.mode === 'meet') {
      var c = P[CM.shown - 1];
      panel.innerHTML = '<div class="eng-meet" style="--g:' + gcol(t, c) + '">' + faceHtml(c, 72) + '<div><p class="eng-meet__n">' + CM.shown + ' of ' + P.length + '</p><h3>' + esc(c.name) + '</h3><span class="eng-who__tag">' + esc(c.tag) + '</span>' +
        (c.trait ? '<p class="eng-who__trait">' + wordMark(c.trait) + '</p>' : '') + '<p>' + wordMark(c.who) + '</p><p class="eng-meet__w"><b>Wants:</b> ' + wordMark(c.wants) + '</p>' + fromHtml(c) + '</div></div>' +
        '<div class="eng-map__btns">' + (CM.shown > 1 ? '<button type="button" class="eng-btn eng-btn--quiet" data-cm-back>Back</button>' : '<span></span>') +
        (CM.shown < P.length ? '<button type="button" class="eng-btn" data-cm-next>Next: meet ' + esc(P[CM.shown].name.replace(/^The /, 'the ')) + '</button>' : '<button type="button" class="eng-btn" data-cm="build">That\'s everyone. Now build it</button>') + '</div>';
    } else if (CM.mode === 'explore') {
      panel.innerHTML = CM.sel < 0 ? '<p class="eng-map__hint">Tap anyone on the map to see who they\'re linked to, what they want and how they end.</p>'
        : '<div class="eng-map__card" style="--g:' + gcol(t, P[CM.sel]) + '"><button type="button" class="eng-map__x" data-cm-close aria-label="Close ' + esc(P[CM.sel].name) + '">×</button>' + whoCard(t, P[CM.sel]) + '<div class="eng-map__side"><h5>Linked to</h5><ul class="eng-map__links">' + links.filter(function (l) { return idx(l[0]) === CM.sel || idx(l[1]) === CM.sel; }).map(function (l) {
          return '<li><b>' + esc(l[0]) + '</b> <span>' + esc(l[2]) + '</span> <b>' + esc(l[1]) + '</b></li>'; }).join('') + '</ul></div></div>';
    } else {
      var left = CM.order.filter(function (i) { return !CM.placed[i]; }), n = P.length;
      if (CM.write >= 0) panel.innerHTML = writeHtml(t, P[CM.write]);
      else if (left.length) panel.innerHTML = '<p class="eng-map__hint">' + (CM.only ? '<b class="eng-redo__k">Retest</b> Just the ' + CM.only.length + ' you got wrong. ' : '') + 'Drag each name onto its person' + (tall ? '' : ' (or tap a name, then a person)') + ', then write who they are. The yellow lines are clues. ' +
          'Mistakes: <b>' + CM.miss + '</b> · Written: <b>' + CM.spot + '/' + CM.wrote + '</b></p>' +
        '<div class="eng-chips">' + left.map(function (i) { return '<button type="button" class="eng-namechip' + (CM.pick === i ? ' is-on' : '') + '" data-chip="' + i + '">' + esc(P[i].name) + '</button>'; }).join('') + '</div>';
      else panel.innerHTML = builtHtml(t);
      if (CM.write >= 0 && !CM.res) { var inp = panel.querySelector('[data-cw-in="like"]'); if (inp && fresh !== 'resize') inp.focus({ preventScroll: true }); }
    }
    // A profile with more below than fits shows a fade at the bottom until you scroll to the end.
    var card = panel.querySelector('.eng-map__card');
    if (card) {
      var more = function () { card.classList.toggle('is-more', card.scrollHeight - card.clientHeight - card.scrollTop > 4); };
      card.addEventListener('scroll', more, { passive: true }); more(); setTimeout(more, 600);
    }
  }
  // only: a retest of just these people (the ones you got wrong last round). Everyone else is already on the map, named,
  // so their lines are clues too.
  // Side by side, the map keeps the size it had on its own (the user: "this is supposed to keep its size it just animates
  // to the side"): the pair [profile | map] takes what it needs of the screen's width, past the page column if it must,
  // centred. The profile gets what's left (340-420px); only on a screen too narrow for both does the map give way.
  function sideSize(open) {
    var box = app.querySelector('[data-map]'), pan = app.querySelector('[data-map-panel]'), stage = box && box.parentNode;
    if (!stage) return;
    if (!open || !window.matchMedia('(min-width: 1000px)').matches) { stage.style.width = stage.style.marginLeft = box.style.flex = box.style.width = pan.style.flexBasis = ''; return; }
    var inner = stage.parentNode.getBoundingClientRect().width, gap = 32;
    var W = Math.min(inner, 1180, 0.72 * window.innerHeight * 1000 / 620), avail = document.documentElement.clientWidth - 48;
    var P = Math.min(420, Math.max(340, avail - W - gap)), mw = Math.floor(Math.min(W, avail - gap - P)), total = mw + gap + P;
    stage.style.width = total + 'px'; stage.style.marginLeft = Math.round((inner - total) / 2) + 'px';
    box.style.flex = '0 0 ' + mw + 'px'; box.style.width = mw + 'px'; pan.style.flexBasis = P + 'px';
  }
  window.addEventListener('resize', function () { if (CM && CM.mode === 'explore' && CM.sel >= 0 && app.querySelector('[data-map]')) sideSize(true); });
  function castMode(m, only) {
    var t = text(CM.t);
    CM.mode = m; CM.sel = -1; CM.pick = -1; CM.write = -1; CM.res = null;
    if (m === 'meet') CM.shown = 1;
    if (m === 'build') {
      CM.placed = {}; CM.miss = 0; CM.spot = 0; CM.wrote = 0; CM.res = null; CM.draft = {}; CM.bad = {};
      CM.only = only && only.length && only.length < t.people.length ? only.slice() : null;
      if (CM.only) t.people.forEach(function (c, i) { if (CM.only.indexOf(i) < 0) CM.placed[i] = true; });
      else {
        // The title character starts you off: they're in place, and you write about them first.
        var tc = t.people.filter(function (c) { return c.name === t.title; })[0];
        CM.write = tc ? t.people.indexOf(tc) : 0; CM.placed[CM.write] = true;
      }
      var bw = +(store('eng-cast-wrote-' + CM.t) || -1); CM.bestW = bw >= 0 ? bw : null;
      CM.order = (CM.only || t.people.map(function (c, i) { return i; })).slice().sort(function () { return Math.random() - 0.5; });
      var b = +(store('eng-cast-best-' + CM.t) || -1); CM.best = b >= 0 ? b : null;
    }
    castDraw(m === 'meet' ? 'line' : '');
    // Bring the whole map into view for building it.
    if (m === 'build') { var sec = app.querySelector('.eng-cast'); if (sec && Math.abs(sec.getBoundingClientRect().top - 70) > 40) window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - 70, behavior: 'smooth' }); }
  }
  function castPlace(chip, node) {
    var t = text(CM.t);
    if (CM.placed[node]) return;
    if (chip === node) {
      CM.placed[node] = true; CM.last = node; CM.pick = -1; CM.write = node; CM.res = null; CM.draft = {};
      if (K) K.sfx('stamp', 0.4);
      castDraw('placed');
    } else {
      CM.miss += 1; CM.wrong = node; badOf(chip).place = true;
      if (K) K.bonk();
      toast('Not ' + t.people[chip].name + '. Read the lines around that one.');
      castDraw();
    }
  }

  // Writing it (the user: "they should put it in and WRITE IT"): once someone is in place you write what they're like and
  // what they want, in your own words. Each answer is checked for the words that matter: those of their trait and wants,
  // and the other words a student might fairly use for them (people[].check), matched by their first five letters.
  // Then the real lines show, with the words you got marked.
  var STOPW = ' and the then but with her his him she they them their this that for from into are was who what wants want like likes very really also just some more most has had have been being when where which will would can could does doing get gets got because about ';
  function lowerOf(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function wordsOf(s) { return lowerOf(s).split(/[^a-z0-9£]+/).filter(function (w) { return w.length >= 3 && STOPW.indexOf(' ' + w + ' ') < 0; }); }
  function wordHit(w, k) { k = k.slice(0, 5); return w.indexOf(k) === 0 || (w.length >= 4 && k.indexOf(w) === 0); }
  // (A name in the real line, like 'Sive' in Nanna's 'To protect Sive from the match', doesn't count by itself.)
  function writeCheck(answer, model, extra, names) {
    var said = wordsOf(answer), keys = wordsOf(model).filter(function (k) { return !names || names.indexOf(k) < 0; }).concat((extra || []).map(lowerOf));
    return keys.filter(function (k) { return said.some(function (w) { return wordHit(w, k); }); });
  }
  function markModel(model, got) {
    return esc(model).replace(/[A-Za-zÀ-ÿ£0-9'’-]+/g, function (w) {
      var p = wordsOf(w)[0], g = wordOf(w), m = p && got.some(function (k) { return wordHit(p, k) || wordHit(k, p.slice(0, 5)); }) ? '<mark>' + w + '</mark>' : w;
      return g ? '<button type="button" class="q-def q-word" data-def="' + g.id + '" aria-haspopup="dialog">' + m + '</button>' : m;
    });
  }
  var CALL = { "Ellis 'Red' Redding": 'Red', 'The Duke of Venice': 'the Duke', "Sarah (Bill's mother)": "Bill's mother", 'Warden Samuel Norton': 'Norton', 'Captain Byron Hadley': 'Hadley', 'Seán Dóta': 'Seán Dóta' };
  function callOf(c) { return CALL[c.name] || (/^(The|Mrs) /.test(c.name) ? c.name.replace(/^The /, 'the ') : c.name.split(' ')[0]); }
  function writeHtml(t, c) {
    var who = callOf(c), many = / daughters$/.test(c.name), R = CM.res;
    var head = '<div class="eng-write__top">' + faceHtml(c, 48) + '<div><p class="eng-meet__n">' + (R ? 'How you did' : 'Now write it') + '</p><h3>' + esc(c.name) + '</h3></div>' +
      (R ? '<span class="eng-write__stamp is-' + R.grade + '">' + { spot: 'Spot on!', half: 'Half there', none: R.shown ? 'Here it is' : 'Not quite' }[R.grade] + '</span>' : '') + '</div>';
    var qs = [['like', (many ? 'What are ' : 'What\'s ') + who + ' like?', 'Their character, in a few words', c.trait], ['want', (many ? 'What do ' : 'What does ') + who + ' want?', 'What they\'re after', c.wants]];
    if (!R) return '<form class="eng-write" data-cw style="--g:' + gcol(t, c) + '">' + head + '<div class="eng-write__two">' + qs.map(function (q) {
        return '<label class="eng-write__f"><span>' + esc(q[1].charAt(0).toUpperCase() + q[1].slice(1)) + '</span><input type="text" data-cw-in="' + q[0] + '" maxlength="100" autocomplete="off" spellcheck="true" enterkeyhint="' + (q[0] === 'like' ? 'next' : 'done') + '" placeholder="' + esc(q[2]) + '" value="' + esc((CM.draft || {})[q[0]] || '') + '"></label>';
      }).join('') + '</div><div class="eng-map__btns"><button type="button" class="eng-btn eng-btn--quiet" data-cw-show>Show me</button><button type="submit" class="eng-btn">Check</button></div></form>';
    return '<div class="eng-write is-done" style="--g:' + gcol(t, c) + '">' + head + '<div class="eng-write__two">' + qs.map(function (q) {
        var you = R[q[0]], got = R[q[0] + 'Got'];
        return '<div class="eng-write__row"><span class="eng-write__q">' + esc(q[1].charAt(0).toUpperCase() + q[1].slice(1)) + '</span>' +
          (R.shown ? '' : '<p class="eng-write__you ' + (got.length ? 'is-ok' : 'is-no') + '"><i>' + (got.length ? '✓' : '✗') + '</i>' + (you ? esc(you) : '<em>(blank)</em>') + '</p>') +
          '<p class="eng-write__real">' + markModel(q[3], got) + '</p></div>';
      }).join('') + '</div><div class="eng-map__btns"><span></span><button type="button" class="eng-btn" data-cw-next>' + (CM.order.some(function (i) { return !CM.placed[i]; }) ? 'Next person' : 'Finish') + '</button></div></div>';
  }
  function writeSubmit(show) {
    var c = text(CM.t).people[CM.write], f = app.querySelector('[data-cw]'); if (!c || !f) return;
    var like = show ? '' : f.querySelector('[data-cw-in="like"]').value.trim(), want = show ? '' : f.querySelector('[data-cw-in="want"]').value.trim();
    if (!show && !like && !want) { toast('Write a few words first, or tap Show me.'); return; }
    var names = [].concat.apply([], text(CM.t).people.map(function (x) { return wordsOf(x.name); }));
    var chk = c.check || {}, lg = writeCheck(like, c.trait || '', chk.like, names), wg = writeCheck(want, c.wants, chk.want, names);
    var grade = lg.length && wg.length ? 'spot' : lg.length || wg.length ? 'half' : 'none';
    CM.res = { like: like, want: want, likeGot: lg, wantGot: wg, grade: grade, shown: !!show };
    CM.wrote += 1; if (grade === 'spot') CM.spot += 1;
    if (!lg.length) badOf(CM.write).like = true;
    if (!wg.length) badOf(CM.write).want = true;
    if (K) { if (grade === 'spot') K.ding(); else if (grade === 'half') K.sfx('pop', 0.4); }
    castDraw();
    var nx = app.querySelector('[data-cw-next]'); if (nx) nx.focus({ preventScroll: true });
  }
  function writeNext() {
    var t = text(CM.t);
    CM.write = -1; CM.res = null;
    var over = t.people.every(function (c, i) { return CM.placed[i]; });
    if (over && !CM.only) {
      if (CM.best == null || CM.miss < CM.best) { store('eng-cast-best-' + CM.t, String(CM.miss)); CM.best = CM.miss; }
      if (CM.bestW == null || CM.spot > CM.bestW) { store('eng-cast-wrote-' + CM.t, String(CM.spot)); CM.bestW = CM.spot; }
    }
    if (over && K) setTimeout(badList().length ? K.ding : K.fanfare, 150);
    castDraw();
    if (over) { var bt = app.querySelector('.eng-built'); if (bt) bt.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
  // What went wrong this round, person by person: put in the wrong place, what they're like, what they want.
  function badOf(i) { CM.bad = CM.bad || {}; return CM.bad[i] || (CM.bad[i] = {}); }
  function badList() { return Object.keys(CM.bad || {}).map(Number).filter(function (i) { var b = CM.bad[i]; return b.place || b.like || b.want; }); }
  function builtHtml(t) {
    var P = t.people, n = CM.only ? CM.only.length : P.length, bad = badList(), right = n - bad.length;
    var head = CM.only ? '<b>Retest done:</b> ' + right + ' of ' + n + ' right this time.'
      : '<b>All ' + n + ' in place</b> with ' + CM.miss + ' mistake' + (CM.miss === 1 ? '' : 's') + ', and you wrote ' + CM.spot + ' of ' + n + ' spot on.' +
        (CM.best != null ? ' Best: ' + CM.best + ' mistake' + (CM.best === 1 ? '' : 's') + (CM.bestW != null ? ', ' + CM.bestW + ' spot on' : '') + '.' : '');
    var list = bad.length ? '<div class="eng-redo"><p class="eng-redo__h">' + (CM.only ? 'Still to get' : 'You got these wrong') + ': read them over, then retest just these</p><ul>' + bad.map(function (i) {
        var c = P[i], b = CM.bad[i], tags = [];
        if (b.place) tags.push('put in the wrong place');
        if (b.like) tags.push('what they\'re like');
        if (b.want) tags.push('what they want');
        return '<li style="--g:' + gcol(t, c) + '">' + faceHtml(c, 52) + '<div><p class="eng-redo__n"><b>' + esc(c.name) + '</b>' + tags.map(function (x) { return '<i>' + x + '</i>'; }).join('') + '</p>' +
          '<p class="eng-redo__t"><span>Like:</span> ' + wordMark(c.trait || '') + '</p><p class="eng-redo__t"><span>Wants:</span> ' + wordMark(c.wants) + '</p></div></li>';
      }).join('') + '</ul></div>'
      : '<p class="eng-redo__ok">' + (CM.only ? 'All fixed: you know every one of them now.' : 'Nothing wrong: you know the whole cast.') + '</p>';
    return '<div class="eng-built' + (bad.length ? ' has-redo' : '') + '"><p class="eng-built__h">' + head + '</p>' + list +
      '<div class="eng-map__btns"><button type="button" class="eng-btn eng-btn--quiet" data-cm="explore">Explore</button>' +
      (bad.length ? '<span class="eng-map__two"><button type="button" class="eng-btn eng-btn--quiet" data-cm="build">Play all again</button><button type="button" class="eng-btn" data-cm-retest>Retest these ' + bad.length + '</button></span>'
        : '<button type="button" class="eng-btn" data-cm="build">Play again</button>') + '</div></div>';
  }

  // ---------- the story, told scene by scene ----------
  // Each key moment is a scene: its narration (moments[].tell, short beats), then each of its pictures (credits.json,
  // placed by `scene` or else `moment`) with a line on what it is and a beat per numbered spot, then why it matters and
  // the quote. The picture stays in view while the beats scroll past; the beat in the middle of the screen picks the
  // picture shown and lights up the spot it talks about. Tapping a spot brings its beat into view.
  var KIND = { film: 'From the film', production: 'On stage', painting: 'Painting', stage: 'On the stage', place: 'The real place', author: 'The writer' };
  var WHEN = { opening: 'Opening', middle: 'Middle', climax: 'Climax', ending: 'Ending' };
  function scenePics(tid, mid) { return pics(tid).filter(function (q) { return (q.scene != null ? q.scene : q.moment) === mid; }); }
  function momentNo(tid, mid) { var k = -1; text(tid).moments.forEach(function (m, i) { if (m.id === mid) k = i; }); return k; }
  function sceneHtml(t, m, k) {
    var list = scenePics(t.id, m.id), beats = [];
    (m.tell || [m.what]).forEach(function (s) { beats.push([0, -1, '', esc(s)]); });
    list.forEach(function (q, j) {
      beats.push([j, -1, ' eng-beat--cap', '<span class="eng-beat__kind">' + esc(KIND[q.kind] || 'Picture') + '</span>' + esc(q.caption)]);
      (q.spots || []).forEach(function (s, i) {
        var other = s.moment && s.moment !== m.id ? momentNo(t.id, s.moment) : -1;
        beats.push([j, i, ' eng-beat--spot', '<b class="eng-beat__n">' + (i + 1) + '</b><strong>' + esc(s.label) + '.</strong> ' + esc(s.note) +
          (s.quote ? ' <q>' + esc(s.quote) + '</q>' : '') + (other >= 0 ? ' <a class="eng-beat__go" href="#text/' + t.id + '/' + s.moment + '">Key moment ' + (other + 1) + ' →</a>' : '')]);
      });
    });
    var last = Math.max(list.length - 1, 0), n = beats.length;
    return '<section class="eng-scene' + (list.length ? '' : ' eng-scene--text') + '" id="' + esc(m.id) + '" data-scene="' + esc(m.id) + '" data-text="' + t.id + '" style="--c:' + COL[t.id] + '">' +
      '<header class="eng-scene__head"><span class="eng-scene__n">' + (k + 1) + '</span><div><h3>' + esc(m.title) + '</h3><span class="eng-scene__w">' + esc(m.where) + (m.when ? ' · ' + esc(WHEN[m.when] || m.when) : '') + ' ' +
        (m.modes || []).map(function (x) { return '<span class="eng-tag" style="--c:' + COL[x] + '">' + esc(MODE[x] ? MODE[x].short : x) + '</span>'; }).join(' ') + '</span></div></header>' +
      (list.length ? '<div class="eng-scene__stage" data-stage></div>' : '') +
      '<div class="eng-scene__beats">' + beats.map(function (b, i) {
        return '<p class="eng-beat' + b[2] + '" data-beat="' + i + '" data-pic="' + b[0] + '" data-spot="' + b[1] + '">' + b[3] + '</p>';
      }).join('') +
        '<div class="eng-beat eng-beat--why" data-beat="' + n + '" data-pic="' + last + '" data-spot="-1"><span>Why it matters</span>' + esc(m.why) + '</div>' +
        (m.quote ? '<blockquote class="eng-beat eng-beat--quote" data-beat="' + (n + 1) + '" data-pic="' + last + '" data-spot="-1">“' + esc(m.quote) + '”</blockquote>' : '') +
      '</div></section>';
  }
  // Show picture `pic` of a scene with spot `spot` lit (-1: none).
  function stageShow(sc, pic, spot) {
    var st = sc.querySelector('[data-stage]');
    if (!st) return;
    var list = scenePics(sc.getAttribute('data-text'), sc.getAttribute('data-scene')), q = list[pic] || list[0];
    if (st.getAttribute('data-pic') !== String(pic)) {
      st.setAttribute('data-pic', pic);
      st.innerHTML = '<figure class="eng-scene__fig"><div class="eng-pv__stage"><img src="assets/eng/img/' + esc(q.file) + '" alt="' + esc(q.title) + '">' +
        (q.spots || []).map(function (x, i) { return '<button type="button" class="eng-pin" style="left:' + x.x + '%;top:' + x.y + '%" data-eng-pin="' + i + '" aria-label="' + (i + 1) + ': ' + esc(x.label) + '">' + (i + 1) + '</button>'; }).join('') +
        '</div><figcaption class="eng-credit">' + credit(q) + '</figcaption></figure>' +
        (list.length > 1 ? '<div class="eng-scene__dots" aria-hidden="true">' + list.map(function (x, j) { return '<i' + (j === pic ? ' class="is-on"' : '') + '></i>'; }).join('') + '</div>' : '');
    }
    st.querySelectorAll('[data-eng-pin]').forEach(function (b) {
      var on = +b.getAttribute('data-eng-pin') === spot;
      b.classList.toggle('is-on', on); b.classList.toggle('is-dim', spot >= 0 && !on); b.setAttribute('aria-pressed', on);
    });
  }
  function beatOn(beat) {
    var sc = beat.closest('[data-scene]');
    if (!sc) return;
    sc.querySelectorAll('.eng-beat.is-on').forEach(function (x) { if (x !== beat) x.classList.remove('is-on'); });
    beat.classList.add('is-on');
    stageShow(sc, +beat.getAttribute('data-pic'), +beat.getAttribute('data-spot'));
  }
  var IO = null;
  function watchScenes() {
    if (IO) IO.disconnect();
    document.querySelectorAll('[data-scene]').forEach(function (sc) { stageShow(sc, 0, -1); });
    if (!('IntersectionObserver' in window)) return;
    // The band just above the middle of the screen: the beat in it is the one being read.
    IO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) beatOn(e.target); }); }, { rootMargin: '-38% 0px -52% 0px' });
    document.querySelectorAll('.eng-beat').forEach(function (b) { IO.observe(b); });
  }

  // ---------- language bank ----------
  function renderLanguage() {
    renderShell('language', 'Say it well');
    app.innerHTML = title('Say it well', window.EngGames ? '<a class="eng-btn" href="#play/upgrade">Play Upgrade it</a>' : '') +
      '<h2 class="eng-h2">Plain words in, exam words out</h2><p class="eng-p">Tap a card to upgrade it.</p>' +
      '<div class="eng-ups">' + (C.upgrades || []).map(function (u, k) {
        return '<button type="button" class="eng-up" data-eng-up="' + k + '"><span class="eng-up__in"><span class="eng-up__f"><s>' + esc(u.plain) + '</s><small>Tap to upgrade</small></span>' +
          '<span class="eng-up__b"><small>' + esc(u.plain) + ' →</small>' + u.exam.map(function (w) { return '<b>' + esc(w) + '</b>'; }).join('') + '<em>' + esc(u.eg) + '</em></span></span></button>';
      }).join('') + '</div>' +
      '<h2 class="eng-h2">The language bank</h2><p class="eng-p">Tap a phrase to copy it.</p>' +
      '<div class="eng-grid eng-grid--2">' + C.language.map(function (g) {
        return '<div class="eng-card"><h3>' + esc(g.name) + '</h3><ul class="eng-words">' + g.items.map(chip).join('') + '</ul></div>';
      }).join('') + MODES.map(function (m) {
        return '<div class="eng-card" style="--c:' + COL[m.id] + '"><span class="eng-bar"></span><h3>' + esc(m.name) + '</h3><ul class="eng-words">' + m.words.map(chip).join('') + '</ul></div>';
      }).join('') + '</div>';
  }

  // ---------- past questions ----------
  // Every past comparative question (2012 to 2026, with the deferred papers), each with what it means in normal English
  // and the key moments to use from each of your texts (tools/eng/research/picks.json). In a 30 + 40 question the text
  // that fits best goes in part (a), if it's one of yours. "Show key moments" opens them all (eng-q-open).
  var qFilter = 'all', QOPEN = store('eng-q-open') === '1';
  var SHORT = { stlt: 'Small Things', shawshank: 'Shawshank' };
  var MODE_AT = { theme: 0, cc: 1, gvv: 2 };
  function isSplit(q) { return Array.isArray(q.marks); }
  function plainHtml(s) { return s ? '<p class="eng-q__plain"><b>In normal English:</b> ' + esc(s) + '</p>' : ''; }
  function qBody(q) {
    if (!isSplit(q) || !q.parts) return '<p class="eng-q__t">' + qMark(q.text) + '</p>' + plainHtml(q.plain);
    var pl = q.plain || {};
    return (q.parts.stem ? '<p class="eng-q__t">' + qMark(q.parts.stem) + '</p>' : '') + ['a', 'b'].map(function (k) {
      return '<div class="eng-q__part"><span class="eng-q__k">(' + k + ')<small>' + (k === 'a' ? 30 : 40) + ' marks</small></span>' +
        '<div><p class="eng-q__t">' + qMark(q.parts[k]) + '</p>' + plainHtml(pl[k]) + '</div></div>';
    }).join('');
  }
  // Your texts in the order to write about them: for a 30 + 40 question, part (a)'s text first.
  function pickOrder(q) {
    var mine = chosen().filter(function (id) { return q.picks && q.picks[id]; });
    var a = isSplit(q) && mine.length ? (mine.indexOf(q.best) >= 0 ? q.best : mine[0]) : null;
    return { ids: a ? [a].concat(mine.filter(function (id) { return id !== a; })) : mine, a: a };
  }
  function picksHtml(q) {
    var o = pickOrder(q), none = chosen().filter(function (id) { return !(q.picks && q.picks[id]); });
    if (!o.ids.length) return '';
    var sum = o.ids.map(function (id) {
      var k = q.picks[id];
      return '<span class="eng-kp__s" style="--c:' + COL[id] + '">' + (o.a ? '(' + (id === o.a ? 'a' : 'b') + ') ' : '') + esc(SHORT[id] || text(id).title) + ' ' + (k.skip ? '<i>leave out</i>' : k.m.map(function (mid) { return momentNo(id, mid) + 1; }).join(', ')) + '</span>';
    }).join('');
    return '<details class="eng-kp"' + (QOPEN ? ' open' : '') + '><summary><span class="eng-kp__h">Key moments to use</span>' + sum + '</summary>' +
      (q.theme ? '<p class="eng-kp__theme"><b>Theme to use:</b> ' + esc(q.theme) + '</p>' : '') +
      '<ul class="eng-kp__list">' + o.ids.map(function (id) {
        var k = q.picks[id], t = text(id);
        return '<li class="eng-kp__row' + (k.skip ? ' is-skip' : '') + '" style="--c:' + COL[id] + '"><span class="eng-kp__t">' +
          (o.a ? '<b>(' + (id === o.a ? 'a' : 'b') + ')</b> ' : '') + '<i>' + esc(t.title) + '</i></span>' +
          (k.m.length ? '<span class="eng-kp__m">' + k.m.map(function (mid) {
            var n = momentNo(id, mid);
            return '<a href="#text/' + id + '/' + mid + '"><span>' + (n + 1) + '</span>' + esc(t.moments[n].title) + '</a>';
          }).join('') + '</span>' : '') + '<span class="eng-kp__why">' + esc(k.why) + '</span></li>';
      }).join('') + '</ul>' +
      (q.note ? '<p class="eng-kp__note">' + esc(q.note) + '</p>' : '') +
      (none.length ? '<p class="eng-kp__none">No picks for ' + none.map(function (id) { return '<i>' + esc(text(id).title) + '</i>'; }).join(' or ') + ' yet.</p>' : '') +
      '</details>';
  }
  function renderQuestions() {
    renderShell('questions', 'Past questions');
    var list = D.questions.filter(function (q) { return qFilter === 'all' || q.mode === qFilter; }).sort(function (a, b) {
      return b.year - a.year || (a.paper === 'deferred') - (b.paper === 'deferred') || MODE_AT[a.mode] - MODE_AT[b.mode] || isSplit(a) - isSplit(b);
    });
    app.innerHTML = title('Past questions') +
      '<p class="eng-p">Every comparative question from 2012 to 2026, with the deferred papers. Under each one: what it means in normal English, and the key moments to use from your texts.</p>' +
      '<div class="eng-filter">' + [['all', 'All']].concat(MODES.map(function (m) { return [m.id, m.name]; })).map(function (f) {
        return '<button type="button" class="eng-chip" data-eng-qf="' + f[0] + '" aria-pressed="' + (qFilter === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '<button type="button" class="eng-chip eng-filter__end" data-eng-qopen aria-pressed="' + QOPEN + '">Show key moments</button></div>' +
      (list.length ? '<div class="eng-grid">' + list.map(function (q) {
        var k = D.questions.indexOf(q);
        return '<div class="eng-q"><span class="eng-q__y">' + q.year + (q.paper === 'deferred' ? '<small>Deferred</small>' : '') + '<small>' + esc(MODE[q.mode].short) + ' · ' + (isSplit(q) ? q.marks.join(' + ') : q.marks) + ' marks</small></span>' +
          '<div class="eng-q__b">' + qBody(q) + picksHtml(q) + '</div><a class="eng-btn eng-btn--quiet" href="#build/q' + k + '">Build it</a></div>';
      }).join('') + '</div>' : '<p class="eng-p">The past questions are being collected.</p>');
  }

  // ---------- compare it (#compare) ----------
  // One theme (tools/eng/compare.json) answered as a 30 + 40 question. 1: pick the text that goes in part (a). 2: pick
  // three of its points. 3: link key moments of the other two texts on a board (tap one, then one in the other
  // column, then say how they compare); only listed pairs are links, and the right kind is shown. 4: the plan.
  // Saved in eng-compare: { th, by: { theme: { a, work: { text: { pts: [i], links: [{ a, b, rel, guess }] } } } } }.
  var CP = null, CPSEL = null, CPPICK = null, CPFB = null, CPHINT = null;
  var REL = { same: 'Similar', differ: 'Different', degree: 'More or less' };
  var REL_SAY = { same: 'Showing similarity', differ: 'Showing difference', degree: 'Showing degree' };
  function cpState() {
    if (CP) return CP;
    try { CP = JSON.parse(store('eng-compare') || 'null'); } catch (e) {}
    if (!CP || typeof CP !== 'object') CP = {};
    CP.by = CP.by || {};
    if (!CP.th || !D.compare.some(function (t) { return t.id === CP.th; })) CP.th = D.compare.length ? D.compare[0].id : null;
    return CP;
  }
  function cpSave() { store('eng-compare', JSON.stringify(CP)); }
  function cpTheme() { var s = cpState(); return D.compare.filter(function (t) { return t.id === s.th; })[0]; }
  function cpBy(th) { var s = cpState(); s.by[th.id] = s.by[th.id] || { a: null, work: {} }; return s.by[th.id]; }
  function cpWork(th, a) { var b = cpBy(th); b.work[a] = b.work[a] || { pts: [], links: [] }; return b.work[a]; }
  // Your three texts if the theme has notes for all of them, else its own three.
  function cpTexts(th) {
    var mine = chosen().filter(function (id) { return th.points[id]; });
    return mine.length === 3 ? mine : D.order.filter(function (id) { return th.points[id]; }).slice(0, 3);
  }
  function tidOf(mid) { return mid.replace(/-\d+$/, ''); }
  function mom(mid) { var t = text(tidOf(mid)), n = momentNo(t.id, mid); return { t: t, n: n + 1, m: t.moments[n] }; }
  function pairKey(x, y) { return [x, y].sort().join('|'); }
  function cpLinks(th, x, y) { var k = pairKey(x, y); return th.links.filter(function (l) { return pairKey(tidOf(l.a), tidOf(l.b)) === k; }); }
  function cpFind(th, p, q) { var k = [p, q].sort().join(); return th.links.filter(function (l) { return [l.a, l.b].sort().join() === k; })[0]; }
  function shortTitle(id) { return SHORT[id] || text(id).title; }
  function stop(s) { return /[.?!]$/.test(s) ? s : s + '.'; }
  function momChip(mid) {
    var o = mom(mid);
    return '<a class="eng-cpc" style="--c:' + COL[o.t.id] + '" href="#text/' + o.t.id + '/' + mid + '"><span>' + o.n + '</span>' + esc(o.m.title) + '</a>';
  }
  function renderCompare() {
    renderShell('compare', 'Compare it');
    var th = cpTheme();
    if (!th) { app.innerHTML = title('Compare it') + '<p class="eng-p">Coming soon.</p>'; return; }
    var ids = cpTexts(th), by = cpBy(th), a = ids.indexOf(by.a) >= 0 ? by.a : null;
    var swapped = chosen().some(function (id) { return ids.indexOf(id) < 0; });
    var h = title('Compare it') +
      '<p class="eng-cp__theme"><span class="eng-tag" style="--c:var(--m-theme)">Theme or Issue</span> <b>' + esc(th.name) + '</b> · a 30 + 40 answer</p>' +
      '<p class="eng-p">' + esc(th.what) + ' Part (a), 30 marks, is one text on its own. Part (b), 40 marks, compares your other two.</p>' +
      (swapped ? '<p class="eng-p eng-cp__warn">This one isn\'t ready for every text yet, so it uses ' + ids.map(function (id) { return '<i>' + esc(text(id).title) + '</i>'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.</p>' : '') +
      '<h2 class="eng-h2"><span class="eng-cp__n">1</span>Which text goes in part (a)?</h2>' +
      '<div class="eng-cp__texts">' + ids.map(function (id) {
        var p = pics(id).filter(function (x) { return x.hero; })[0] || pics(id)[0];
        return '<button type="button" class="eng-cpt" data-cp-a="' + id + '" aria-pressed="' + (id === a) + '" style="--c:' + COL[id] + '">' +
          (p ? '<img src="assets/eng/img/' + esc(p.file) + '" alt="" loading="lazy">' : '<span class="eng-cpt__img"></span>') +
          '<span class="eng-cpt__t">' + esc(text(id).title) + '</span>' + (id === th.best ? '<span class="eng-cpt__best">Best for (a)</span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<p class="eng-p eng-cp__why">' + esc(th.bestWhy) + '</p>';
    if (!a) { app.innerHTML = h; return; }
    var w = cpWork(th, a), B = ids.filter(function (id) { return id !== a; });
    // 2: part (a)
    h += '<h2 class="eng-h2"><span class="eng-cp__n">2</span>Part (a): three points about <i>' + esc(text(a).title) + '</i></h2>' +
      '<p class="eng-p">Pick three. Each one is a paragraph, built on its key moment. <b data-cp-count>' + w.pts.length + ' of 3 picked</b>' + (w.pts.length >= 3 ? ': tap one to swap it out.' : '.') + '</p>' +
      '<div class="eng-cp__pts">' + th.points[a].map(function (pt, i) {
        var on = w.pts.indexOf(i) >= 0;
        return '<div class="eng-cpp' + (on ? ' is-on' : '') + '" style="--c:' + COL[a] + '"><button type="button" class="eng-cpp__b" data-cp-pt="' + i + '" aria-pressed="' + on + '">' +
          '<span class="eng-cpp__tick" aria-hidden="true">' + (on ? w.pts.indexOf(i) + 1 : '+') + '</span><span class="eng-cpp__t">' + esc(pt.title) + '</span></button>' +
          '<p>' + esc(pt.say) + '</p><p class="eng-cpp__m">' + pt.m.map(function (n) { return momChip(text(a).moments[n - 1].id); }).join('') + '</p></div>';
      }).join('') + '</div>';
    // 3: part (b), the board
    var L = cpLinks(th, B[0], B[1]);
    var col = function (id) {
      var ms = [];
      L.forEach(function (l) { [l.a, l.b].forEach(function (m) { if (tidOf(m) === id && ms.indexOf(m) < 0) ms.push(m); }); });
      ms.sort(function (x, y) { return mom(x).n - mom(y).n; });
      return '<div class="eng-cpb__col" style="--c:' + COL[id] + '"><h3>' + esc(text(id).title) + '</h3>' + ms.map(function (mid) {
        var o = mom(mid), nums = [], pic = scenePics(id, mid)[0];
        w.links.forEach(function (l, k) { if (l.a === mid || l.b === mid) nums.push(k + 1); });
        return '<button type="button" class="eng-cpm' + (CPHINT === mid ? ' is-hint' : '') + '" data-cpm="' + mid + '" aria-pressed="' + (CPSEL === mid) + '">' +
          (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '') +
          '<span class="eng-cpm__n">' + o.n + '</span><span class="eng-cpm__t">' + esc(o.m.title) + '</span>' +
          (nums.length ? '<span class="eng-cpm__k" aria-label="In link ' + nums.join(' and ') + '">' + nums.join(' ') + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    };
    h += '<h2 class="eng-h2"><span class="eng-cp__n">3</span>Part (b): link <i>' + esc(shortTitle(B[0])) + '</i> and <i>' + esc(shortTitle(B[1])) + '</i></h2>' +
      '<p class="eng-p">Tap a moment, then a moment from the other text that shows the same thing about power. Then say how they compare. Each link is a paragraph: get three or four.</p>' +
      '<div class="eng-cpb" data-cpb>' + col(B[0]) + '<svg class="eng-cpb__lines" aria-hidden="true"></svg>' + col(B[1]) + '</div>';
    if (CPPICK) {
      h += '<div class="eng-cpq" role="group" aria-label="How do they compare?"><p><b>How do they compare?</b> ' + momChip(CPPICK[0]) + ' and ' + momChip(CPPICK[1]) + '</p><p class="eng-btns">' +
        ['same', 'differ', 'degree'].map(function (r) { return '<button type="button" class="eng-btn eng-cpq__' + r + '" data-cp-rel="' + r + '">' + REL[r] + '</button>'; }).join('') +
        '<button type="button" class="eng-btn eng-btn--quiet" data-cp-cancel>Cancel</button></p></div>';
    } else {
      h += '<p class="eng-btns eng-cp__tools"><button type="button" class="eng-btn eng-btn--quiet" data-cp-hint>Give me a hint</button>' +
        (w.links.length || w.pts.length ? '<button type="button" class="eng-btn eng-btn--quiet" data-cp-reset>Start again</button>' : '') + '</p>';
    }
    if (CPFB) h += '<div class="eng-cpf eng-cpf--' + CPFB.kind + '" role="status"><b>' + esc(CPFB.head) + '</b> ' + esc(CPFB.body) + '</div>';
    if (w.links.length) {
      h += '<ol class="eng-cpl">' + w.links.map(function (l, k) {
        var x = cpFind(th, l.a, l.b), left = tidOf(l.a) === B[0] ? l.a : l.b, right = left === l.a ? l.b : l.a;
        return '<li class="eng-cpl__i eng-cpl--' + x.rel + '"><span class="eng-cpl__k">' + (k + 1) + '</span><div><p class="eng-cpl__h"><b>' + esc(x.aspect) + '</b> <span class="eng-cpl__rel">' + REL[x.rel] + '</span></p>' +
          '<p class="eng-cpl__m">' + momChip(left) + momChip(right) + '</p><p>' + esc(x.say) + '</p></div>' +
          '<button type="button" class="eng-cpl__x" data-cp-del="' + k + '" aria-label="Remove link ' + (k + 1) + '">×</button></li>';
      }).join('') + '</ol>';
    }
    // 4: the plan
    if (w.pts.length || w.links.length) h += '<h2 class="eng-h2"><span class="eng-cp__n">4</span>Your plan</h2>' + cpPlanHtml(th, a, B, w);
    app.innerHTML = h;
    requestAnimationFrame(cpLines);
  }
  function cpPlan(th, a, B, w) {
    var pts = w.pts.map(function (i) { return th.points[a][i]; }), out = { a: [], b: [] };
    out.a.push(['Opening', 'Introduce ' + text(a).title + ' and say how ' + th.name.toLowerCase() + ' shows itself in it' +
      (pts.length ? ': ' + pts.map(function (p) { return p.title.toLowerCase(); }).join(', ').replace(/, ([^,]*)$/, ' and $1') : '') + '.']);
    pts.forEach(function (p, k) {
      out.a.push(['Paragraph ' + (k + 1) + ': ' + p.title, p.say, p.m.map(function (n) { return text(a).moments[n - 1].id; })]);
    });
    out.a.push(['Ending', 'Sum up what ' + text(a).title + ' says about ' + th.name.toLowerCase() + '.']);
    out.b.push(['Opening', 'Introduce ' + text(B[0]).title + ' and ' + text(B[1]).title + ' together, and say in one line how they compare on ' + th.name.toLowerCase() + '.']);
    w.links.forEach(function (l, k) {
      var x = cpFind(th, l.a, l.b), left = tidOf(l.a) === B[0] ? l.a : l.b, right = left === l.a ? l.b : l.a;
      var bank = (C.language.filter(function (g) { return g.name === REL_SAY[x.rel]; })[0] || { items: [] }).items.slice(0, 3);
      out.b.push(['Paragraph ' + (k + 1) + ': ' + x.aspect + ' (' + REL[x.rel].toLowerCase() + ')', x.say, [left, right], bank]);
    });
    out.b.push(['Ending', th.ends[pairKey(B[0], B[1])]]);
    return out;
  }
  function cpPlanHtml(th, a, B, w) {
    var P = cpPlan(th, a, B, w), part = function (rows) {
      return '<ol class="eng-cpn">' + rows.map(function (r) {
        return '<li><b>' + esc(r[0]) + '</b><p>' + esc(r[1]) + '</p>' + (r[2] ? '<p class="eng-cpl__m">' + r[2].map(momChip).join('') + '</p>' : '') +
          (r[3] && r[3].length ? '<p class="eng-cpn__w">Link with: ' + r[3].map(function (s) { return '<button type="button" class="eng-chip" data-eng-copy="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</p>' : '') + '</li>';
      }).join('') + '</ol>';
    };
    var todo = [];
    if (w.pts.length < 3) todo.push('pick ' + (3 - w.pts.length) + ' more point' + (w.pts.length === 2 ? '' : 's') + ' for part (a)');
    if (w.links.length < 3) todo.push('make ' + (3 - w.links.length) + ' more link' + (w.links.length === 2 ? '' : 's') + ' for part (b)');
    return (todo.length ? '<p class="eng-p eng-cp__todo">Still to do: ' + esc(todo.join(', and ')) + '.</p>' : '<p class="eng-p eng-cp__done">That\'s a full plan. Now write it.</p>') +
      '<div class="eng-grid eng-grid--2 eng-cp__plan"><div class="eng-card" style="--c:' + COL[a] + '"><span class="eng-bar"></span><h3>(a) 30 marks · <i>' + esc(text(a).title) + '</i></h3>' + part(P.a) + '</div>' +
      '<div class="eng-card"><span class="eng-bar" style="background:linear-gradient(180deg,' + COL[B[0]] + ' 50%,' + COL[B[1]] + ' 50%)"></span><h3>(b) 40 marks · <i>' + esc(shortTitle(B[0])) + '</i> and <i>' + esc(shortTitle(B[1])) + '</i></h3>' + part(P.b) + '</div></div>' +
      '<p class="eng-btns"><button type="button" class="eng-btn eng-btn--quiet" data-cp-copy>Copy my plan</button><a class="eng-btn" href="#build">Write it: Build an essay</a></p>';
  }
  function cpPlanText() {
    var th = cpTheme(), ids = cpTexts(th), a = cpBy(th).a, B = ids.filter(function (id) { return id !== a; }), P = cpPlan(th, a, B, cpWork(th, a));
    var lines = function (rows) { return rows.map(function (r) { return r[0] + '\n' + r[1] + (r[2] ? '\nKey moments: ' + r[2].map(function (m) { var o = mom(m); return o.t.title + ' ' + o.n + ', ' + o.m.title; }).join('; ') : ''); }).join('\n\n'); };
    return th.name + ': 30 + 40\n\n(a) 30 marks: ' + text(a).title + '\n\n' + lines(P.a) + '\n\n(b) 40 marks: ' + text(B[0]).title + ' and ' + text(B[1]).title + '\n\n' + lines(P.b) + '\n';
  }
  // The board's lines: from the right edge of a left card to the left edge of a right card, coloured by kind.
  function cpLines() {
    var b = app.querySelector('[data-cpb]'), svg = b && b.querySelector('svg');
    if (!svg) return;
    var th = cpTheme(), a = cpBy(th).a, w = cpWork(th, a), r0 = b.getBoundingClientRect(), d = '';
    svg.setAttribute('viewBox', '0 0 ' + r0.width + ' ' + r0.height);
    w.links.forEach(function (l, k) {
      var p = b.querySelector('[data-cpm="' + l.a + '"]'), q = b.querySelector('[data-cpm="' + l.b + '"]');
      if (!p || !q) return;
      var rp = p.getBoundingClientRect(), rq = q.getBoundingClientRect();
      if (rp.left > rq.left) { var t = rp; rp = rq; rq = t; }
      var x1 = rp.right - r0.left, y1 = rp.top + rp.height / 2 - r0.top, x2 = rq.left - r0.left, y2 = rq.top + rq.height / 2 - r0.top, mx = (x1 + x2) / 2;
      var rel = cpFind(th, l.a, l.b).rel;
      d += '<path class="eng-cpb__ln eng-cpb__ln--' + rel + '" d="M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>' +
        '<circle class="eng-cpb__dot eng-cpb__ln--' + rel + '" cx="' + x1 + '" cy="' + y1 + '" r="4"/><circle class="eng-cpb__dot eng-cpb__ln--' + rel + '" cx="' + x2 + '" cy="' + y2 + '" r="4"/>';
    });
    svg.innerHTML = d;
  }
  window.addEventListener('resize', function () { if (app.querySelector('[data-cpb]')) cpLines(); });
  // Tap a moment, then one in the other column: if it's a listed link, say how they compare.
  function cpTap(mid) {
    var th = cpTheme(), a = cpBy(th).a, w = cpWork(th, a);
    CPFB = null; CPHINT = null;
    if (!CPSEL || CPSEL === mid) { CPSEL = CPSEL === mid ? null : mid; CPPICK = null; return; }
    if (tidOf(CPSEL) === tidOf(mid)) { CPSEL = mid; return; }
    var have = w.links.filter(function (l) { return [l.a, l.b].sort().join() === [CPSEL, mid].sort().join(); })[0];
    if (have) { var x = cpFind(th, have.a, have.b); CPFB = { kind: 'have', head: stop('You\'ve already linked these: ' + x.aspect), body: x.say }; CPSEL = null; return; }
    CPPICK = [CPSEL, mid]; CPSEL = null;
  }
  function cpRel(rel) {
    var th = cpTheme(), a = cpBy(th).a, w = cpWork(th, a), p = CPPICK;
    CPPICK = null;
    if (!p) return;
    var x = cpFind(th, p[0], p[1]);
    if (!x) { CPFB = { kind: 'miss', head: 'Not a strong link.', body: 'These two moments don\'t show the same thing about ' + th.name.toLowerCase() + '. Try another pair, or tap Give me a hint.' }; return; }
    if (w.links.length >= 4) { CPFB = { kind: 'have', head: 'That\'s a good link, but you have four already.', body: 'Four paragraphs is plenty for part (b). Remove one to swap it in.' }; return; }
    w.links.push({ a: x.a, b: x.b, rel: x.rel, guess: rel });
    CPFB = rel === x.rel ? { kind: 'yes', head: stop('Spot on: ' + x.aspect), body: x.say } :
      { kind: 'nearly', head: stop('Good pair! But it\'s really "' + REL[x.rel].toLowerCase() + '": ' + x.aspect), body: x.say };
    cpSave();
  }
  function cpHint() {
    var th = cpTheme(), ids = cpTexts(th), a = cpBy(th).a, w = cpWork(th, a), B = ids.filter(function (id) { return id !== a; });
    var left = cpLinks(th, B[0], B[1]).filter(function (l) { return !w.links.some(function (m) { return m.a === l.a && m.b === l.b; }); })[0];
    CPFB = null; CPPICK = null;
    if (!left) { CPFB = { kind: 'have', head: 'You\'ve found every link.', body: 'Pick the three or four strongest for your answer.' }; return; }
    var first = tidOf(left.a) === B[0] ? left.a : left.b;
    CPSEL = first; CPHINT = first === left.a ? left.b : left.a;
    CPFB = { kind: 'hint', head: 'Try these two.', body: 'The highlighted moment is picked for you. Find the one that glows in the other column: what do they share about ' + th.name.toLowerCase() + '?' };
  }

  // ---------- the essay builder ----------
  // One draft, saved as you type (eng-essay). Two kinds of question, as on the 2027 paper:
  //   '70'    one essay comparing your texts (at least two; three are marked the same): an introduction, a PACE
  //           paragraph per aspect, a conclusion.
  //   'split' part (a), 30 marks, on one text (a Point, Anchor, Evaluate paragraph per aspect) and part (b),
  //           40 marks, comparing the two other texts (an introduction, a PACE paragraph per aspect, a conclusion).
  // The paper on the right is the answer so far.
  var E = null;
  function essay() {
    if (E) return E;
    try { E = JSON.parse(store('eng-essay') || 'null'); } catch (e) {}
    if (!E) E = { mode: 'gvv', type: '70', q: '', thesis: '', aspects: [], intro: '', paras: {}, end: '', step: 0 };
    E.type = E.type || '70';
    E.parasA = E.parasA || {};
    E.crack = E.crack || {};
    E.stance = E.stance || {};
    return E;
  }
  function saveEssay() { store('eng-essay', JSON.stringify(E)); }
  function split() { return essay().type === 'split'; }
  // Part (a)'s text, and the texts compared (all three for a 70-mark answer; the other two for part (b)).
  function textA() { var e = essay(), m = chosen(); return m.indexOf(e.textA) >= 0 ? e.textA : m[0]; }
  function compared() { var m = chosen(); return split() ? m.filter(function (t) { return t !== textA(); }) : m; }
  function stepsList() {
    var e = essay(), pts = function (pre, name) { return e.aspects.map(function (a, k) { return [pre + k, name + (k + 1)]; }); };
    // No Plan step (the user, of picking aspects: "do i have to do this its not engaging"): the paragraphs are picked
    // for the question (autoPlan) and can be changed from the first writing step.
    // ... then "but put it into a game or something": Plan is a card game (planGameHtml), and Pick for me does it for you.
    if (split()) return [['q', 'Question'], ['plan', 'Plan']].concat(pts('a', '(a) Point ')).concat([['intro', '(b) Introduction']]).concat(pts('p', '(b) Point ')).concat([['end', '(b) Conclusion'], ['check', 'Check']]);
    return [['q', 'Question'], ['plan', 'Plan'], ['intro', 'Introduction']].concat(pts('p', 'Point ')).concat([['end', 'Conclusion'], ['check', 'Check']]);
  }
  // The three aspects of the mode that fit the question best: the question's words (its glossary topic words and
  // its other long words, by their first five letters) counted in each aspect's name and in your texts' notes on it.
  function autoPlan() { var e = essay(); e.aspects = planScores().slice(0, 3).map(function (x) { return x[2]; }); }
  // Each aspect of the mode with how well it fits the question, best first: [score, -order, aspect].
  function planScores() {
    var e = essay(), opts = aspectOptions(e.mode);
    if (opts.length <= 3) return opts.map(function (a, i) { return [1, -i, a]; });
    var stop = /^(which|these|those|their|there|where|other|texts|chosen|course|comparative|reference|response|develop|discuss|compare|extent|about|between|different|possible)$/;
    var words = (e.q.toLowerCase().match(/[a-z]{5,}/g) || []).filter(function (w) { return !stop.test(w); }).map(function (w) { return w.slice(0, 5); });
    glossary().list.forEach(function (x) { if (x.g.kind === 'topic' && e.q.toLowerCase().indexOf(x.m) >= 0) words = words.concat((x.g.term + ' ' + x.g.def).toLowerCase().match(/[a-z]{5,}/g).map(function (w) { return w.slice(0, 5); })); });
    // What a question's topic points to, whatever words it uses.
    var LINKS = [[/patriarch|male-dom|gender|women|woman|marriage|husband|wife/, /gender|marriage|women|love/], [/class|mobility|status|money|wealth|poverty|social position/, /class|money|status/],
      [/religio|church|faith|moral/, /religion|church|faith/], [/law|justice|institution|authority/, /law|justice|power|authority/], [/race|outsider|prejudice|racis|belong/, /race|outsider|identity/],
      [/family|community|friend|parent/, /family|community/], [/power|control|dominan|powerless/, /power|authority|control/], [/freedom|trap|confine|escape/, /freedom|entrap/], [/hope|despair|bleak|optimis|pessimis/, /hope|light|ending/]];
    var ql = e.q.toLowerCase();
    var scored = opts.map(function (a, i) {
      var hay = (a + ' ' + chosen().map(function (t) { return pointsFor(e.mode, a, t).join(' '); }).join(' ')).toLowerCase(), sc = 0;
      words.forEach(function (w) { if (w.length >= 5 && hay.indexOf(w) >= 0) sc += a.toLowerCase().indexOf(w) >= 0 ? 3 : 1; });
      LINKS.forEach(function (l) { if (l[0].test(ql) && l[1].test(a.toLowerCase())) sc += 12; });
      return [sc, -i, a];
    }).sort(function (x, y) { return y[0] - x[0] || y[1] - x[1]; });
    return scored;
  }
  function aspectOptions(mode) {
    var names = [], seen = {};
    chosen().forEach(function (t) { modeRows(mode, t).forEach(function (r) { if (!seen[r[0]] && r[0] !== 'Outlook' && r[0] !== 'More' && r[1].length) { seen[r[0]] = 1; names.push(r[0]); } }); });
    return names.length ? names : MODE[mode].topics;
  }
  function pointsFor(mode, aspect, tid) {
    var row = modeRows(mode, tid).filter(function (r) { return r[0] === aspect; })[0];
    return row ? row[1].filter(function (p) { return !/^</.test(p); }) : [];
  }
  function momentsFor(mode, tid) { return (text(tid).moments || []).filter(function (m) { return (m.modes || []).indexOf(mode) >= 0; }); }
  function paraText(p, keys) { return keys.map(function (x) { return (p[x] || '').trim(); }).filter(Boolean).join(' '); }
  // The answer as paragraphs: part (a)'s first when the question is in two parts.
  function essayParts(which) {
    var e = essay(), a = [], b = [];
    if (split()) e.aspects.forEach(function (x) { var s = paraText(e.parasA[x] || {}, ['P', 'A', 'E']); if (s) a.push(s); });
    if (e.intro) b.push(e.intro);
    e.aspects.forEach(function (x) { var s = paraText(e.paras[x] || {}, ['P', 'A', 'C', 'E']); if (s) b.push(s); });
    if (e.end) b.push(e.end);
    return which === 'a' ? a : which === 'b' ? b : a.concat(b);
  }
  function words(s) { return (String(s).match(/[A-Za-z’'-]+/g) || []).length; }
  function marked(p, keys) {
    var any = false, s = keys.map(function (x) { if (p[x]) any = true; return p[x] ? '<mark class="pace-' + x.toLowerCase() + '">' + esc(p[x].trim()) + '</mark>' : ''; }).join(' ');
    return any ? s : '';
  }
  // ---------- the essay builder: a writing desk ----------
  // One sheet of essay paper on a desk: the question pinned at the top, your line of argument on a sticky note, then
  // each part of the answer where it goes. The part you're on is written straight onto the lines; the rest show what
  // you've written (tap one to go to it) or what goes there. Beside the sheet, the coach for that part: what goes in
  // it, phrases to tap in (for the box you're in), and the key moments from your notes with their pictures, with the
  // examiner's head and a tip. Above, the steps as a track, and the examiner's checklist, stamped as you write. At
  // Check he marks the sheet in red pen.
  var FIELD = {
    P: ['Point', 'Answer the question for this aspect: one clear sentence about all the texts.', ['same', 'degree']],
    A: ['Anchor', 'Ground it in a key moment of the first text: what happens there, and how it shows your point.', ['moment']],
    C: ['Compare', 'Bring in the other text, or texts: alike, different, or more and less so.', ['same', 'differ', 'degree']],
    E: ['Evaluate', 'What does it show? Which text does it more powerfully? Back to the question.', ['judge']]
  };
  var FOCUS = null, TIPS = {
    q: 'Pick one. Any one. The hardest part is starting.',
    crack: 'Crack it first. Tap each card: what it\'s about, what to do, which texts.',
    stance: 'Now take a stand. How far is it true in each text? No sitting on the fence.',
    ready: 'That\'s your line of argument. Every paragraph proves a piece of it. Next: plan.',
    plan: 'Knock off the three that answer the question. Not the ones you like.',
    planned: 'There\'s your plan. Every paragraph proves a piece of your line.',
    intro: 'Answer the question in your first sentence. Then name the texts.',
    a: 'Part (a) is one text. No comparing yet.',
    p: 'Both texts in every paragraph. One text alone isn\'t a comparison.',
    end: 'Answer the question again. Say which text did it best, and why.',
    check: 'Red pen time. Fix what I\'ve marked.'
  };
  function chips(ids) {
    var all = {};
    C.language.forEach(function (g) { all[g.id] = g.items; });
    return ids.map(function (g) { return (all[g] || []).slice(0, 6).map(function (s) { return '<button type="button" class="eng-chip" data-eb-insert="' + esc(s) + '">' + esc(s) + '</button>'; }).join(''); }).join('');
  }
  function plain(p) { return esc(p).replace(/\s*\[[a-z]+-\d+\]/g, ''); }
  function titles(ids) { return ids.map(function (t) { return text(t).title; }); }
  function stepNo(id) { var st = stepsList(); for (var i = 0; i < st.length; i++) if (st[i][0] === id) return i; return -1; }
  function curStep() { var e = essay(), st = stepsList(); return st[Math.min(e.step, st.length - 1)][0]; }

  // The key moments a text has for this mode, as cards with their first picture.
  function momentCards(mode, aspect, tid) {
    var pts = pointsFor(mode, aspect, tid).slice(0, 2).map(plain);
    var mo = momentsFor(mode, tid).slice(0, 3);
    return '<div class="ebd-notes"><h4 style="--c:' + COL[tid] + '">' + esc(text(tid).title) + '</h4>' +
      (pts.length ? '<ul>' + pts.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' : '') +
      mo.map(function (m) {
        var pic = scenePics(tid, m.id)[0];
        return '<div class="ebd-mo">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '<span class="ebd-mo__n" style="background:' + COL[tid] + '">' + (momentNo(tid, m.id) + 1) + '</span>') +
          '<div><b>' + esc(m.title) + '</b><small>' + esc(m.where) + '</small><p>' + esc(m.what.length > 150 ? m.what.slice(0, 148) + '…' : m.what) + '</p></div></div>';
      }).join('') + '</div>';
  }

  // ----- the question, set out to read, and typed in -----
  // (a) and (b) on their own lines (a quotation before them on its own, in italics); the topic words highlighted and
  // the task words (discuss, compare, the extent...) underlined. The first time a question is shown it types itself
  // onto the sheet; a click shows it all at once.
  // The words of the question with a meaning (tools/eng/glossary.json) become buttons: tap one for what it means,
  // what it asks you to do, and an example from each of your texts. Longest match first; task words underlined,
  // topic words highlighted.
  var GL = null, DEF = null, HOV = 0;
  function glossary() {
    if (GL) return GL;
    var list = [], by = {};
    (D.glossary || []).forEach(function (g) { by[g.id] = g; g.match.forEach(function (m) { list.push({ m: m.toLowerCase(), g: g }); }); });
    list.sort(function (a, b) { return b.m.length - a.m.length; });
    GL = { list: list, by: by };
    return GL;
  }
  function qMark(s, kinds) {
    kinds = kinds || ['task', 'topic'];
    var low = String(s).toLowerCase(), taken = [], hits = [];
    glossary().list.forEach(function (x) {
      if (kinds.indexOf(x.g.kind) < 0) return;
      var re = new RegExp('(^|[^a-z’\'-])(' + x.m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^a-z’\'-])', 'g'), r;
      while ((r = re.exec(low))) {
        var st = r.index + r[1].length, en = st + r[2].length, free = true, k;
        for (k = st; k < en; k++) if (taken[k]) { free = false; break; }
        if (free) { for (k = st; k < en; k++) taken[k] = 1; hits.push([st, en, x.g]); }
        re.lastIndex = en;
      }
    });
    hits.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', at = 0;
    hits.forEach(function (h) {
      var p = /^[.,;:?!’”)]+/.exec(s.slice(h[1])), tail = p ? p[0] : '';
      out += esc(s.slice(at, h[0])) + '<span class="q-nw"><button type="button" class="q-def q-' + h[2].kind + '" data-def="' + h[2].id + '" aria-haspopup="dialog">' + esc(s.slice(h[0], h[1])) + '</button>' + esc(tail) + '</span>';
      at = h[1] + tail.length;
    });
    return out + esc(s.slice(at));
  }
  // The hard words in what the cast cards say about a character (lecherous, cunning, ensign...): underlined, with their
  // meaning on hover (or tap).
  function wordMark(s) { return qMark(s, ['word']); }
  function wordOf(w) {
    var low = String(w).toLowerCase(), hit = null;
    glossary().list.forEach(function (x) { if (!hit && x.g.kind === 'word' && x.m === low) hit = x.g; });
    return hit;
  }
  function closeDef() {
    clearTimeout(HOV);
    if (!DEF) return;
    if (DEF.pop.parentNode) DEF.pop.parentNode.removeChild(DEF.pop);
    DEF.btn.classList.remove('is-open'); DEF.btn.setAttribute('aria-expanded', 'false');
    DEF = null;
  }
  function openDef(btn, hover) {
    closeDef();
    var g = glossary().by[btn.getAttribute('data-def')];
    if (!g) return;
    var egs = g.eg ? chosen().filter(function (t) { return g.eg[t]; }) : [];
    var pop = document.createElement('div');
    pop.className = 'q-pop q-pop--' + g.kind; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', g.term);
    pop.innerHTML = '<button type="button" class="q-pop__x" data-def-close aria-label="Close">×</button>' +
      '<span class="q-pop__k">' + (g.kind === 'task' ? 'What it tells you to do' : 'What it means') + '</span><b class="q-pop__t">' + esc(g.term) + '</b><p>' + esc(g.def) + '</p>' +
      (g.do ? '<p class="q-pop__do"><span>In your answer</span>' + esc(g.do) + '</p>' : '') +
      (egs.length ? '<div class="q-pop__eg"><span>In your texts</span>' + egs.map(function (t) { return '<p style="--c:' + COL[t] + '"><b>' + esc(text(t).title) + '</b>' + esc(g.eg[t]) + '</p>'; }).join('') + '</div>' : '');
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    var left = Math.max(12, Math.min(vw - w - 12, r.left + r.width / 2 - w / 2)), below = r.bottom + 12 + h < window.innerHeight || r.top < h + 24;
    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top = ((below ? r.bottom + 10 : r.top - h - 10) + window.scrollY) + 'px';
    pop.style.setProperty('--ax', Math.round(r.left + r.width / 2 - left) + 'px');
    pop.classList.add(below ? 'is-below' : 'is-above');
    btn.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
    DEF = { pop: pop, btn: btn, hover: !!hover };
    if (K && !hover) K.sfx('pop', 0.3);
  }
  function qHtml(q) {
    // Only the first (a) and the first (b) after it start parts: "(as discussed in (a) above)" stays in the text.
    q = String(q);
    var ia = q.indexOf('(a)'), ib = ia < 0 ? -1 : q.indexOf('(b)', ia + 3);
    if (ia < 0 || ib < 0) return '<p class="ebd-qp">' + qMark(q.trim()) + '</p>';
    var part = function (l, t) { return '<p class="ebd-qp"><b class="ebd-qp__l">(' + l + ')</b><span>' + qMark(t.trim()) + '</span><span class="ebd-qp__m">' + (l === 'a' ? '30' : '40') + ' marks</span></p>'; };
    return (q.slice(0, ia).trim() ? '<p class="ebd-qp ebd-qp--quote">' + qMark(q.slice(0, ia).trim()) + '</p>' : '') + part('a', q.slice(ia + 3, ib)) + part('b', q.slice(ib + 3));
  }
  var TYPED = null;
  function typeIn(el) {
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) return;
    var nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), caret = document.createElement('i');
    while (w.nextNode()) nodes.push(w.currentNode);
    var full = nodes.map(function (n) { return n.nodeValue; }), i = 0, j = 0, timer = 0;
    nodes.forEach(function (n) { n.nodeValue = ''; });
    // Parts, labels and highlights stay hidden until their first letter is typed.
    var waiting = [].slice.call(el.querySelectorAll('*'));
    waiting.forEach(function (x) { x.classList.add('ebd-wait'); });
    var show = function (n) { for (var x = n.parentNode; x && x !== el; x = x.parentNode) if (x.classList) x.classList.remove('ebd-wait'); };
    caret.className = 'ebd-caret';
    var box = el.closest('.ebd-q');
    box.classList.add('is-typing');
    var done = function (ev) {
      if (ev) { ev.stopPropagation(); ev.preventDefault(); }
      clearTimeout(timer);
      nodes.forEach(function (n, k) { n.nodeValue = full[k]; });
      waiting.forEach(function (x) { x.classList.remove('ebd-wait'); });
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      box.classList.remove('is-typing'); box.classList.add('is-typed');
      box.removeEventListener('click', done, true);
    };
    var tick = function () {
      if (!el.isConnected) return;
      for (var n = 0; n < 3 && i < nodes.length;) { if (j < full[i].length) { if (!j) show(nodes[i]); j++; n++; nodes[i].nodeValue = full[i].slice(0, j); } else { i++; j = 0; } }
      if (i >= nodes.length) { done(); return; }
      if (nodes[i].parentNode) nodes[i].parentNode.insertBefore(caret, nodes[i].nextSibling);
      var ch = full[i].charAt(j - 1);
      timer = setTimeout(tick, /[.?!]/.test(ch) ? 260 : /[,;:]/.test(ch) ? 110 : 18);
    };
    box.addEventListener('click', done, true);
    tick();
  }

  // ----- the sheet -----
  function line(key, value, ph, k) {
    return '<label class="ebd-line' + (k ? ' ebd-line--k' : '') + '">' + (k ? '<span class="ebd-k" style="background:' + PACE_COL[k] + '" title="' + FIELD[k][0] + '">' + k + '</span>' : '') +
      '<textarea data-eb="' + key + '" rows="1" placeholder="' + esc(ph) + '">' + esc(value || '') + '</textarea></label>';
  }
  function blockHtml(id, label, inner, empty, note) {
    var on = id === curStep();
    return '<div class="ebd-block' + (on ? ' is-on' : '') + (empty && !on ? ' is-empty' : '') + '"' + (on ? '' : ' data-eb-step="' + stepNo(id) + '" role="button" tabindex="0" title="Write this part"') + '>' +
      (label ? '<span class="ebd-label">' + esc(label) + '</span>' : '') + inner + (note || '') + '</div>';
  }
  function shown(p, keys, ghost) { var s = marked(p, keys); return s ? '<p>' + s + '</p>' : '<p class="ebd-ghost">' + esc(ghost) + '</p>'; }
  function red(ok, msg) { return '<span class="ebd-red' + (ok ? ' is-ok' : '') + '">' + (ok ? '✓ ' : '') + esc(msg) + '</span>'; }
  function nameOf(t) { var x = text(t); return [x.title.toLowerCase(), x.author.split(' ').pop().toLowerCase()].concat((x.people || []).map(function (p) { return p.name.split(' ')[0].toLowerCase(); })); }
  function sheetHtml() {
    var e = essay(), cur = curStep(), check = cur === 'check', cmp = compared(), out = '';
    var mentions = function (s, ids) { s = (s || '').toLowerCase(); return ids.filter(function (t) { return nameOf(t).some(function (n) { return n && s.indexOf(n) >= 0; }); }).length; };
    out += '<div class="ebd-q' + (cur === 'q' ? ' is-on' : '') + '"' + (cur === 'q' ? '' : ' data-eb-step="0" role="button" tabindex="0"') + '>' +
      '<span class="ebd-q__tab" style="--c:' + COL[e.mode] + '">' + esc(MODE[e.mode].name) + ' · ' + (split() ? '30 + 40' : '70') + ' marks</span>' +
      '<div class="ebd-qtext" data-eb-qtext>' + (e.q ? qHtml(e.q) : '<p class="ebd-ghost">Pick a question from the real papers, or write your own.</p>') + '</div></div>';
    out += '<div class="ebd-note' + (cur === 'q' ? ' is-on' : '') + '"><span>Your line of argument</span>' +
      (cur === 'q' ? '<textarea data-eb="thesis" rows="2" placeholder="One sentence that answers the question.">' + esc(e.thesis) + '</textarea>'
        : '<p data-eb-step="0" role="button" tabindex="0">' + (e.thesis ? esc(e.thesis) : '<i>Not written yet: tap to write it.</i>') + '</p>') + '</div>';
    out += '<div class="ebd-lines">';
    if (!e.aspects.length) out += cur === 'plan' ? [0, 1, 2].map(function (k) { return '<p class="ebd-part">Paragraph ' + (k + 1) + '</p><p class="ebd-ghost">knock a crate off…</p>'; }).join('') : '<p class="ebd-ghost">Your paragraphs appear here once you pick a question.</p>';
    if (split() && e.aspects.length) {
      out += '<p class="ebd-part">(a) · 30 marks · ' + esc(text(textA()).title) + '</p>';
      e.aspects.forEach(function (a, k) {
        var id = 'a' + k, pa = e.parasA[a] || {}, full = pa.P && pa.A && pa.E;
        out += blockHtml(id, '(a) ' + (k + 1) + ' · ' + a, id === cur ? ['P', 'A', 'E'].map(function (x) { return line('a' + x + k, pa[x], FIELD[x][0] + ': ' + (x === 'P' ? 'in ' + text(textA()).title + ', …' : x === 'A' ? 'this is seen in the moment when …' : 'this leaves the reader …'), x); }).join('') : shown(pa, ['P', 'A', 'E'], 'Point, Anchor, Evaluate…'),
          !marked(pa, ['P', 'A', 'E']), check ? red(full, full ? 'Point, anchor and evaluation' : 'Not finished: ' + ['P', 'A', 'E'].filter(function (x) { return !pa[x]; }).map(function (x) { return FIELD[x][0]; }).join(', ')) : '');
      });
      out += '<p class="ebd-part">(b) · 40 marks · ' + titles(cmp).map(esc).join(' and ') + '</p>';
    }
    if (e.aspects.length || cur === 'intro') {
      var introOk = e.intro && mentions(e.intro, cmp) === cmp.length;
      out += blockHtml('intro', split() ? '(b) Introduction' : 'Introduction', cur === 'intro' ? line('intro', e.intro || (e.thesis ? e.thesis + ' ' : ''), 'Start with your answer, then name the texts and who made them.') : (e.intro ? '<p>' + esc(e.intro) + '</p>' : '<p class="ebd-ghost">Introduction…</p>'),
        !e.intro, check ? red(introOk, introOk ? 'Answers and names the texts' : 'Name every text here, with its author or director') : '');
    }
    e.aspects.forEach(function (a, k) {
      var id = 'p' + k, pr = e.paras[a] || {}, all = paraText(pr, ['P', 'A', 'C', 'E']), n = mentions(all, cmp), missing = ['P', 'A', 'C', 'E'].filter(function (x) { return !pr[x]; });
      var note = !check ? '' : !all ? red(false, 'Not written') : n < 2 ? red(false, 'Only one text here: where is the comparison?') : missing.length ? red(false, 'No ' + missing.map(function (x) { return FIELD[x][0].toLowerCase(); }).join(', ')) : red(true, 'Compares, full PACE');
      out += blockHtml(id, (split() ? '(b) ' : '') + (k + 1) + ' · ' + a, id === cur ? ['P', 'A', 'C', 'E'].map(function (x) {
        return line(x + k, pr[x], FIELD[x][0] + ': ' + ({ P: cmp.length > 2 ? 'in all three texts, …' : 'in both texts, …', A: 'in ' + text(cmp[0]).title + ', this is seen when …', C: 'similarly, in ' + text(cmp[1]).title + ', …', E: 'ultimately, …' })[x], x);
      }).join('') : shown(pr, ['P', 'A', 'C', 'E'], 'Point, Anchor, Compare, Evaluate…'), !all, note);
    });
    if (e.aspects.length) {
      var endOk = !!e.end && /ultimately|for me|most|leaves|overall|of the (three|two)/i.test(e.end);
      out += blockHtml('end', split() ? '(b) Conclusion' : 'Conclusion', cur === 'end' ? line('end', e.end, 'Ultimately, … (answer the question again, and say which text did it best)') : (e.end ? '<p>' + esc(e.end) + '</p>' : '<p class="ebd-ghost">Conclusion…</p>'),
        !e.end, check ? red(endOk, endOk ? 'Answers the question again' : 'Answer the question again and say which text affected you most') : '');
    }
    out += '</div>';
    var na = words(essayParts('a').join(' ')), nb = words(essayParts('b').join(' '));
    var stamp = '';
    if (check) { var cs = checksList(), got = cs.filter(function (c) { return c[1]; }).length; stamp = '<span class="ebd-stamp"><b>' + got + '</b>/' + cs.length + '<small>ticks</small></span>'; }
    return '<div class="ebd-sheet' + (check ? ' is-marked' : '') + '">' + stamp + out +
      '<p class="ebd-count">' + (split() ? '(a) ' + na + ' words · (b) ' + nb + ' words' : nb + ' words') + '<span>' + (split() ? 'about 450 + 650' : nb < 900 ? 'aim for 1,000 to 1,300' : 'a good length') + '</span></p></div>';
  }

  // ----- the coach -----
  function tile(k, name, what) {
    return '<div class="ebd-tile"><b style="background:' + (PACE_COL[k] || '#fff') + '">' + esc(k || ({ q: '?', plan: '≡', intro: 'In', check: '✓' })[curStep()] || '?') + '</b><div><h3>' + esc(name) + '</h3><p>' + esc(what) + '</p></div></div>';
  }
  function fieldChips() {
    var k = FOCUS ? (/^a?([PACE])\d+$/.exec(FOCUS) || [])[1] : null, cur = curStep();
    var groups = k ? FIELD[k][2] : cur === 'intro' ? ['judge'] : cur === 'end' ? ['judge', 'degree'] : ['same', 'differ'];
    return '<div class="ebd-chips" data-eb-chips><h4>' + (k ? 'Phrases for your ' + FIELD[k][0].toLowerCase() : 'Phrases to use') + '</h4><div class="eb-starters">' + chips(groups) + '</div></div>';
  }
  function coachHtml(bodyOnly) {
    var e = essay(), cur = curStep(), m = MODE[e.mode], cmp = compared(), mine = chosen(), out = '';
    var tipKey = /^a\d/.test(cur) ? 'a' : /^p\d/.test(cur) ? 'p' : cur;
    if (cur === 'q') tipKey = !e.q || SLIPS ? 'q' : !crackedAll() ? 'crack' : !e.thesis ? 'stance' : 'ready';
    if (cur === 'plan' && e.aspects.length) tipKey = 'planned';
    var face = window.ExamTeacher ? '<div class="ebd-face" data-mood="' + (cur === 'check' ? (checksList().every(function (c) { return c[1]; }) ? 'happy' : 'angry') : 'ok') + '"><span>' + window.ExamTeacher.head() + '</span><p>' + esc((TIPS[tipKey] || '')) + '</p></div>' : '';
    if (cur === 'q') {
      var qs = D.questions.filter(function (q) { return q.mode === e.mode; }).sort(function (a, b) { return b.year - a.year; });
      var picker = '<div class="eb-choices">' + MODES.map(function (x) { return '<button type="button" class="eng-chip" style="--c:' + COL[x.id] + '" data-eb-mode="' + x.id + '" aria-pressed="' + (e.mode === x.id) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' +
        '<div class="eb-choices">' + [['70', 'One question, 70 marks'], ['split', 'Two parts, 30 + 40']].map(function (x) { return '<button type="button" class="eng-chip" data-eb-type="' + x[0] + '" aria-pressed="' + (e.type === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="ebd-slips">' + qs.slice(0, 10).map(function (q) {
          return '<button type="button" class="ebd-slip' + (e.q === q.text ? ' is-on' : '') + '" style="--c:' + COL[q.mode] + '" data-eb-q="' + D.questions.indexOf(q) + '"><span class="ebd-slip__y">' + q.year + (q.paper === 'deferred' ? ' def.' : '') + '</span><span class="ebd-slip__m">' + (Array.isArray(q.marks) ? '30 + 40' : '70') + '</span>' +
            '<span class="ebd-slip__t">' + esc(q.text.length > 120 ? q.text.slice(0, 118) + '…' : q.text) + '</span></button>';
        }).join('') + '</div>' +
        '<label class="ebd-own"><span>Or your own question</span><textarea data-eb="q" rows="3" placeholder="Paste or type it here">' + esc(e.q) + '</textarea></label>';
      if (!e.q || SLIPS) {
        out = tile('', 'Pick your question', 'A real exam question, by mode. Tap one and it lands on your sheet.') +
          '<button type="button" class="eng-btn ebd-wide ebd-surprise" data-eb-surprise>Surprise me</button>' + picker +
          (e.q ? '<button type="button" class="eng-btn eng-btn--quiet ebd-wide" data-eb-slips>Keep this question</button>' : '');
      } else {
        out = '<div class="ebd-qhead"><span>' + esc(MODE[e.mode].name) + ' · ' + (split() ? '30 + 40' : '70') + ' marks</span><button type="button" class="ebd-link" data-eb-slips>Change question</button></div>' + crackHtml() + stanceHtml() +
          '<button type="button" class="ebd-link ebd-skip" data-eb-go="1">Skip this, start writing →</button>';
      }
        } else if (cur === 'plan') {
      out = planGameHtml();
    } else if (cur === 'intro') {
      out = tile('', split() ? 'Part (b): introduction' : 'Introduction', 'Answer the question straight away, name the texts with their authors or director, and the mode.') +
        '<div class="ebd-notes"><h4>Your texts, written correctly</h4><ul>' + cmp.map(function (t) { return '<li>' + nameLine(text(t)) + '</li>'; }).join('') + '</ul></div>' + fieldChips();
    } else if (cur === 'end') {
      out = tile('E', split() ? 'Part (b): conclusion' : 'Conclusion', 'Answer the question again, name the biggest similarity or difference, and say which text affected you most and why.') + fieldChips();
    } else if (cur === 'check') {
      var cs = checksList();
      out = tile('', 'The examiner\'s checklist', 'Things an examiner notices. It\'s a checklist, not a grade.') +
        '<ul class="eb-checks">' + cs.map(function (c) { return '<li class="' + (c[1] ? 'is-ok' : 'is-no') + '"><i>' + (c[1] ? '✓' : '!') + '</i><span><b>' + c[0] + ' · ' + esc(c[2]) + '.</b> ' + (c[1] ? '' : esc(c[3])) + '</span></li>'; }).join('') + '</ul>' +
        '<div class="eb-nav"><button type="button" class="eng-btn eng-btn--quiet" data-eb-copyall>Copy the answer</button><button type="button" class="eng-btn eng-btn--quiet" data-eb-new>Start a new one</button></div>';
    } else {
      var k = +cur.slice(1), a = e.aspects[k], isA = cur.charAt(0) === 'a', k2 = FOCUS ? (/^a?([PACE])\d+$/.exec(FOCUS) || [])[1] : null;
      out = tile(k2 || 'P', (isA ? 'Part (a), ' : '') + 'Paragraph ' + (k + 1) + ': ' + a, k2 ? FIELD[k2][1] : (isA ? 'Point, Anchor, Evaluate: on ' + text(textA()).title + ' alone.' : 'Point, Anchor, Compare, Evaluate.')) + fieldChips() +
        (isA ? momentCards(e.mode, a, textA()) : cmp.map(function (t) { return momentCards(e.mode, a, t); }).join(''));
    }
    if (e.step === 2) out = planBox() + out;
    return bodyOnly ? out : face + '<div class="ebd-coach__body" data-eb-coachbody>' + out + '</div>';
  }

  // ----- the question step: crack it, then take a stand -----
  // Crack it: three cards to flip (what it's about: the question's topic words from the glossary; what to do: its task
  // words; which texts: the parts and their marks). Take a stand: how far it's true in each text, on a five-step scale,
  // which writes the line of argument ("Social mobility: to a great extent in ..., but hardly at all in ...") for the
  // sticky note.
  var SLIPS = false, DEGREE = ['hardly at all', 'to a limited extent', 'to some extent', 'to a great extent', 'completely'];
  function qTerms(kind) {
    // In the order the question says them.
    var seen = {}, out = [], q = essay().q.toLowerCase();
    glossary().list.forEach(function (x) {
      if (x.g.kind !== kind || seen[x.g.id]) return;
      var r = new RegExp('(^|[^a-z’\'-])' + x.m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^a-z’\'-])').exec(q);
      if (r) { seen[x.g.id] = 1; out.push([r.index, x.g]); }
    });
    return out.sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
  }
  function crackedAll() { var c = essay().crack; return c.topic && c.task && c.texts; }
  function crackHtml() {
    var e = essay(), c = e.crack, cmp = compared();
    var topics = qTerms('topic').filter(function (g) { return ['cc', 'gvv', 'theme'].indexOf(g.id) < 0; }).slice(0, 3);
    var tasks = qTerms('task').filter(function (g) { return ['extent', 'discuss', 'compare', 'contrast', 'explain', 'identify', 'statement'].indexOf(g.id) >= 0; });
    var card = function (id, n, front, back) {
      return '<button type="button" class="ebd-card' + (c[id] ? ' is-flipped' : '') + '" data-eb-crack="' + id + '" aria-pressed="' + !!c[id] + '">' +
        '<span class="ebd-card__in"><span class="ebd-card__f"><b>' + n + '</b>' + esc(front) + '<small>Tap to crack</small></span><span class="ebd-card__b">' + back + '</span></span></button>';
    };
    var extent = tasks.some(function (g) { return g.id === 'extent'; });
    var tBack = topics.length ? topics.slice(0, 2).map(function (g) { return '<b>' + esc(g.term) + '</b>'; }).join('<span>and</span>') : '<b>' + esc(MODE[e.mode].name) + '</b>';
    var kBack = extent ? '<b>How far?</b><span>Judge it: a lot, a little, not at all</span>' : tasks.length ? '<b>' + esc(tasks[0].term) + '</b>' : '<b>Answer it</b>';
    var xBack = split() ? '<b>(a) ' + esc(text(textA()).title) + '</b><span>then</span><b>(b) ' + titles(cmp).map(esc).join(' + ') + '</b>' : '<b>' + titles(cmp).map(esc).join(' + ') + '</b><span>compared all the way</span>';
    var lines = [];
    if (c.topic) (topics.length ? topics : []).forEach(function (g) { lines.push('<li><b>' + esc(g.term) + '</b> ' + esc(g.def) + '</li>'); });
    if (c.task) tasks.slice(0, 3).forEach(function (g) { lines.push('<li class="is-task"><b>' + esc(g.term) + '</b> ' + esc(g.do || g.def) + '</li>'); });
    if (c.texts) lines.push('<li class="is-texts">' + (split() ? '<b>(a) 30 marks:</b> one text, ' + esc(text(textA()).title) + '. <b>(b) 40 marks:</b> compare the other two, ' + titles(cmp).map(esc).join(' and ') + '.' : '<b>70 marks:</b> compare ' + titles(cmp).map(esc).join(', ') + ' in every paragraph.') + '</li>');
    return '<div class="ebd-task"><h4 class="ebd-h"><i>1</i> Crack the question</h4><div class="ebd-cards">' +
      card('topic', '?', 'What is it about?', tBack) + card('task', '!', 'What must you do?', kBack) + card('texts', '3', 'Which texts?', xBack) + '</div>' +
      (lines.length ? '<ul class="ebd-cracked">' + lines.join('') + '</ul>' : '') + '</div>';
  }
  function stanceTexts() { return split() ? [textA()].concat(compared()) : compared(); }
  function stanceLine() {
    var e = essay(), ts = stanceTexts();
    if (!ts.every(function (t) { return e.stance[t] != null; })) return '';
    // "the extent to which social mobility, between ..., is possible" gives "Social mobility is possible ...".
    var cap = function (x) { return x.charAt(0).toUpperCase() + x.slice(1); };
    var m = /the extent to which (?:the )?(.+?)(?:,[^,]*,)?\s+(is|was|are|were|can be|has been|have been) ([a-z]+)/i.exec(e.q);
    var topic = (/the extent to which (?:the )?([^,.;]+?)(?:,|\.|;| in | between )/i.exec(e.q) || [])[1];
    var lead = m && m[1].length < 60 ? cap(m[1]) + ' ' + m[2] + ' ' + m[3] + ' ' : topic && topic.length < 60 ? cap(topic) + ': ' : '';
    var order = ts.slice().sort(function (a, b) { return e.stance[b] - e.stance[a]; });
    var bits = order.map(function (t) { return DEGREE[e.stance[t]] + ' in ' + text(t).title; });
    var lastV = e.stance[order[order.length - 1]], low = lastV < e.stance[order[0]] - 1;
    var body = bits.length > 1 ? bits.slice(0, -1).join(', ') + (low ? ', but ' + (lastV === 1 ? 'only ' : '') : ' and ') + bits[bits.length - 1] : bits[0];
    return lead ? lead + body + '.' : cap(body) + '.';
  }
  function stanceHtml() {
    var e = essay(), ts = stanceTexts(), line = stanceLine(), on = crackedAll();
    return '<div class="ebd-task' + (on ? '' : ' is-locked') + '"><h4 class="ebd-h"><i>2</i> Take a stand: how far is it true?</h4>' +
      (on ? '' : '<p class="ebd-small">Crack the question first.</p>') +
      ts.map(function (t, i) {
        var v = e.stance[t];
        return '<div class="ebd-meter" style="--c:' + COL[t] + '"><span class="ebd-meter__t">' + (split() ? (i ? '(b) ' : '(a) ') : '') + esc(text(t).title) + '</span>' +
          '<div class="ebd-meter__row">' + DEGREE.map(function (d, k) { return '<button type="button" class="ebd-meter__b' + (v != null && k <= v ? ' is-fill' : '') + (k === v ? ' is-on' : '') + '" data-eb-stance="' + t + ':' + k + '" title="' + d + '"' + (on ? '' : ' disabled') + '><i></i></button>'; }).join('') + '</div>' +
          '<span class="ebd-meter__v">' + (v != null ? esc(DEGREE[v]) : 'hardly … completely') + '</span></div>';
      }).join('') +
      (line ? '<div class="ebd-line2' + (e.thesis === line ? ' is-used' : '') + '"><span>Your line of argument</span><p>' + esc(line) + '</p>' +
        (e.thesis === line ? '<b class="ebd-used">✓ On your sticky note. Change a meter to rewrite it.</b>' : '<button type="button" class="eng-btn" data-eb-useline>Put it on my sticky note</button>') + '</div>' : '') + '</div>';
  }

  // ----- Plan: Knock 'em off (eng/eng-plan.js) -----
  // The mode's aspects are crates on shelves; knock three off with the slingshot. The examiner rates each for how well
  // it fits the question (its place in planScores: the best three 3 stars, the next two 2, the rest 1). Or Pick for
  // me. Then the plan here, with a swap offered for a weak pick.
  var PG = null;
  function planRank() { var r = {}; planScores().forEach(function (x, k) { r[x[2]] = k; }); return r; }
  function stars(a) { var r = planRank()[a]; return r == null ? 1 : r < 3 ? 3 : r < 5 ? 2 : 1; }
  function planTopic() {
    var e = essay(), m = /the extent to which (?:the )?(.+?)(?:,|\.|;| is | was | are )/i.exec(e.q), t = qTerms('topic').filter(function (g) { return ['cc', 'gvv', 'theme'].indexOf(g.id) < 0; })[0];
    return m && m[1].length < 70 ? m[1] : t ? t.term : MODE[e.mode].name;
  }
  function playPlan() {
    var e = essay();
    if (!window.EngPlanGame) { autoPlan(); saveEssay(); drawBuild(true); return; }
    window.EngPlanGame.open({ topic: planTopic(), aspects: aspectOptions(e.mode), rank: planRank(), colour: COL[e.mode],
      done: function (plan) { if (!plan) return; essay().aspects = plan.slice(0, 3); PG = { done: true, q: essay().q }; saveEssay(); drawBuild(true); } });
  }
  function planGameHtml() {
    var e = essay(), m = MODE[e.mode], opts = aspectOptions(e.mode);
    if (opts.length <= 3 && !e.aspects.length) { e.aspects = opts.slice(); saveEssay(); }
    if (e.aspects.length) {
      var got = e.aspects.reduce(function (n, a) { return n + stars(a); }, 0), max = e.aspects.length * 3;
      var best = planScores().map(function (x) { return x[2]; }).filter(function (a) { return e.aspects.indexOf(a) < 0; })[0];
      var weak = e.aspects.slice().sort(function (x, y) { return stars(x) - stars(y); })[0];
      if (weak && best && stars(best) <= stars(weak)) weak = null;
      var verdict = opts.length <= 3 ? 'For ' + m.name + ' the paragraphs are always these.' : got === max ? 'Perfect plan. Every paragraph answers the question.' : got >= max - 2 ? 'Strong plan.' : 'It works, but there are better aspects for this question.';
      return '<div class="ebd-pg ebd-pg--done"><h3 class="ebd-pg__h">Your plan</h3><p class="ebd-pg__score"><b>' + got + '</b>/' + max + ' <span>' + esc(verdict) + '</span></p>' +
        '<ol class="ebd-pg__list">' + e.aspects.map(function (a) { return '<li><span>' + esc(a) + '</span><i class="ebd-stars" aria-label="' + stars(a) + ' of 3">' + '★★★'.slice(0, stars(a)) + '<s>' + '★★★'.slice(stars(a)) + '</s></i></li>'; }).join('') + '</ol>' +
        (weak && best ? '<button type="button" class="ebd-pg__swap" data-pg-swap="' + esc(weak) + '|' + esc(best) + '">Swap <b>' + esc(weak) + '</b> for <b>' + esc(best) + '</b>: it fits the question better</button>' : '') +
        '<div class="ebd-pg__btns">' + (opts.length > 3 ? '<button type="button" class="eng-btn eng-btn--quiet" data-pg="play">Play again</button>' : '<span></span>') + '<button type="button" class="eng-btn" data-pg="use">Start writing →</button></div></div>';
    }
    return '<div class="ebd-pg ebd-pg--start"><div class="ebd-pg__art" aria-hidden="true"><i></i><i></i><i></i><b></b></div>' +
      '<h3 class="ebd-pg__h">Plan: Knock \'em off</h3><p class="ebd-small">Every aspect of ' + esc(m.name.toLowerCase()) + ' is a crate on a shelf. Six shots with the slingshot: knock off the three that answer the question. Each one you knock off is a paragraph.</p>' +
      '<button type="button" class="eng-btn ebd-wide ebd-pg__go" data-pg="play">Play</button>' +
      '<button type="button" class="ebd-link ebd-skip" data-pg="auto">Pick for me</button></div>';
  }

  // Your paragraphs, picked for the question; Change opens the aspects (and, for a two-part question, the text for (a)).
  var PLAN_OPEN = false;
  function planBox() {
    var e = essay(), mine = chosen(), cmp = compared();
    return '<div class="ebd-plan"><div class="ebd-plan__top"><span>Your paragraphs, picked for this question</span><button type="button" class="ebd-link" data-eb-plan>' + (PLAN_OPEN ? 'Done' : 'Change') + '</button></div>' +
      '<ol>' + e.aspects.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol>' +
      (PLAN_OPEN ? (split() ? '<h4 class="ebd-h">Part (a) is on</h4><div class="eb-choices">' + mine.map(function (t) { return '<button type="button" class="eng-chip" style="--c:' + COL[t] + '" data-eb-atext="' + t + '" aria-pressed="' + (textA() === t) + '">' + esc(text(t).title) + '</button>'; }).join('') + '</div>' +
          '<p class="ebd-small">Part (b) then compares ' + titles(cmp).map(esc).join(' and ') + '.</p>' : '') +
        '<h4 class="ebd-h">Tap to add or take out (3 to 5)</h4><div class="eb-choices">' + aspectOptions(e.mode).map(function (a) { return '<button type="button" class="eng-chip" style="--c:' + COL[e.mode] + '" data-eb-aspect="' + esc(a) + '" aria-pressed="' + (e.aspects.indexOf(a) >= 0) + '">' + esc(a) + '</button>'; }).join('') + '</div>' : '') + '</div>';
  }

  // ----- the track and the checklist stamps -----
  function trackHtml() {
    var e = essay(), st = stepsList();
    return '<ol class="ebd-track">' + st.map(function (s, k) {
      return '<li class="' + (k < e.step ? 'is-done' : k === e.step ? 'is-on' : '') + '"><button type="button" data-eb-step="' + k + '"' + (k === e.step ? ' aria-current="step"' : '') + '><i>' + (k < e.step ? '✓' : k + 1) + '</i><span>' + esc(s[1]) + '</span></button></li>';
    }).join('') + '</ol>';
  }
  var LAST_OK = null;
  function stampsHtml() {
    var cs = checksList(), got = cs.filter(function (c) { return c[1]; }).length;
    return '<div class="ebd-stamps" title="The examiner\'s checklist: ' + got + ' of ' + cs.length + '">' + cs.map(function (c, i) {
      return '<i class="' + (c[1] ? 'is-ok' : '') + (c[1] && LAST_OK && !LAST_OK[i] ? ' is-new' : '') + '" title="' + esc(c[2]) + '">' + c[0] + '</i>';
    }).join('') + '<span><b>' + got + '</b> of ' + cs.length + '</span></div>';
  }
  function updateStamps() {
    var box = app.querySelector('[data-eb-stamps]');
    if (!box) return;
    var cs = checksList(), now = cs.map(function (c) { return c[1]; });
    var fresh = LAST_OK && now.some(function (ok, i) { return ok && !LAST_OK[i]; });
    box.innerHTML = stampsHtml();
    if (fresh && K) K.sfx('stamp', 0.3);
    LAST_OK = now;
  }

  // The checks: what a reader can see in the text, mapped to P, C, L and M. Not a grade: a list of things to fix.
  function checksList() {
    var e = essay(), cmp = compared(), all = essayParts().join('\n'), low = all.toLowerCase(), bTxt = essayParts('b').join('\n').toLowerCase();
    var stop = /^(the|and|that|this|with|which|what|from|your|their|they|them|have|been|does|text|texts|three|least|comparative|course|studied|study|discuss|extent|reference|making|make|answer|support|other|chosen|response|develop)$/;
    var qWords = (e.q.toLowerCase().match(/[a-z]{5,}/g) || []).filter(function (w) { return !stop.test(w); }).filter(function (w, i, arr) { return arr.indexOf(w) === i; });
    var qHit = qWords.filter(function (w) { return low.indexOf(w.slice(0, 6)) >= 0; });
    var named = function (t, where) { return nameOf(t).slice(0, 2).some(function (n) { return n && where.indexOf(n) >= 0; }); };
    var paras = e.aspects.map(function (x) { return paraText(e.paras[x] || {}, ['P', 'A', 'C', 'E']).toLowerCase(); }).filter(function (p) { return p; });
    var cmpWords = [].concat.apply([], C.language.filter(function (g) { return g.id !== 'moment'; }).map(function (g) { return g.items; })).map(function (s) { return s.replace(/[,.…]/g, '').replace(/ ….*$/, '').trim().toLowerCase(); }).filter(function (s) { return s.length > 3; });
    var usedCmp = cmpWords.filter(function (s) { return bTxt.indexOf(s) >= 0; });
    var modeWords = MODE[e.mode].words.filter(function (w) { return low.indexOf(w.toLowerCase()) >= 0; });
    var used = split() ? chosen() : cmp;
    var titlesRight = used.every(function (t) { var tt = text(t).title; return all.indexOf(tt) >= 0 || low.indexOf(tt.toLowerCase()) < 0; });
    var checks = [
      ['P', qWords.length ? qHit.length >= Math.min(3, qWords.length) : false, 'The question\'s own words', qWords.length ? 'You use ' + qHit.length + ' of its key words (' + qWords.slice(0, 6).join(', ') + '). Keep the question in view in every paragraph.' : 'Put the question in at the first step.'],
      ['P', !!e.intro && cmp.every(function (t) { return named(t, (e.intro || '').toLowerCase()); }), (split() ? 'Part (b)\'s texts' : 'Your texts') + ' in the introduction', 'Name each text (and its author or director) in your introduction.'],
      ['C', paras.length >= 3 && paras.every(function (p) { return cmp.filter(function (t) { return nameOf(t).some(function (x) { return x && p.indexOf(x) >= 0; }); }).length >= 2; }), 'Every paragraph compares', 'Each comparative paragraph should bring in at least two texts. One text per paragraph isn\'t a comparison.'],
      ['C', e.aspects.length >= 3 && e.aspects.every(function (x) { var p = e.paras[x] || {}; return p.P && p.A && p.C && p.E; }), 'Every paragraph is full PACE', 'Point, Anchor, Compare and Evaluate in each one.'],
      ['L', usedCmp.length >= (split() ? 4 : 6), 'The language of comparison', usedCmp.length + ' comparative phrases so far' + (usedCmp.length ? ' (' + usedCmp.slice(0, 5).join(', ') + ')' : '') + '. Aim for ' + (split() ? 4 : 6) + ' or more in the comparison, and vary them.'],
      ['L', modeWords.length >= 3, 'The words of the mode', modeWords.length + ' ' + MODE[e.mode].name + ' words' + (modeWords.length ? ' (' + modeWords.join(', ') + ')' : '') + '. Aim for 3 or more.'],
      ['M', !!all && titlesRight && !/\bi\b/.test(all), 'Titles and spelling', 'Write the titles exactly: ' + titles(used).join(', ') + '. Capital I for yourself.'],
      ['E', !!e.end && /ultimately|for me|most|leaves|overall|of the (three|two)/i.test(e.end), 'A conclusion that answers', 'End by answering the question again and saying which text affected you most.']
    ];
    if (split()) checks.splice(2, 0, ['P', e.aspects.length >= 1 && e.aspects.every(function (x) { var p = e.parasA[x] || {}; return p.P && p.A && p.E; }) && named(textA(), essayParts('a').join(' ').toLowerCase()), 'Part (a) on ' + text(textA()).title,
      'Part (a) is on one text: Point, Anchor and Evaluate for each aspect, naming the text.']);
    return checks;
  }
  function useQuestion(q) { var e = essay(); if (e.q !== q.text) { e.crack = {}; e.stance = {}; e.aspects = []; } e.mode = q.mode; e.q = q.text; e.type = Array.isArray(q.marks) ? 'split' : '70'; }
  // The line goes onto the sticky note, typed in.
  function useLine() {
    var line = stanceLine(), box = app.querySelector('.ebd-note textarea');
    if (!line) return;
    essay().thesis = line; saveEssay();
    if (!box || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { drawBuild(true); return; }
    var i = 0;
    box.value = ''; box.closest('.ebd-note').classList.add('is-writing');
    (function step() { i = Math.min(line.length, i + 2); box.value = line.slice(0, i); noteGrow(box); if (i < line.length) setTimeout(step, 22); else { if (K) K.sfx('stamp', 0.35); setTimeout(function () { drawBuild(true); }, 350); } })();
  }
  function noteGrow(t) { t.style.height = '0px'; t.style.height = Math.min(t.scrollHeight, 140) + 'px'; }
  function renderBuild(arg) {
    renderShell('build', 'Build an essay');
    var e = essay();
    if (arg && MODE[arg] && e.mode !== arg) { e.mode = arg; e.aspects = []; e.step = 0; saveEssay(); }
    if (arg && /^q\d+$/.test(arg) && D.questions[+arg.slice(1)]) { useQuestion(D.questions[+arg.slice(1)]); e.step = 0; saveEssay(); }
    LAST_OK = null;
    drawBuild();
    if (ENTER) { ENTER = false; app.classList.add('eb-enter'); setTimeout(function () { app.classList.remove('eb-enter'); }, 1100); }
  }
  function drawBuild(keepFocus) {
    var e0 = essay();
    if (!e0.aspects.length && e0.q && e0.step > 1) { autoPlan(); saveEssay(); }
    var e = e0, st = stepsList();
    if (e.step >= st.length) e.step = st.length - 1;
    var cur = curStep();
    if (!keepFocus) FOCUS = null;
    app.innerHTML = '<div class="ebd-top"><h1 class="cv-h1">Build an essay</h1><div data-eb-stamps>' + stampsHtml() + '</div></div>' + trackHtml() +
      '<div class="ebd' + (cur === 'plan' ? ' is-plan' : '') + '">' +
        '<div class="ebd-desk">' + sheetHtml() +
          '<div class="eb-nav">' + (e.step > 0 ? '<button type="button" class="eng-btn eng-btn--quiet" data-eb-go="-1">Back</button>' : '<span></span>') +
          (e.step < st.length - 1 ? '<button type="button" class="eng-btn" data-eb-go="1"' + '' + '>Next: ' + esc(st[e.step + 1][1]) + '</button>' : '') + '</div></div>' +
        '<aside class="ebd-coach" data-eb-coach>' + coachHtml() + '</aside></div>';
    LAST_OK = checksList().map(function (c) { return c[1]; });
    app.querySelectorAll('.ebd-sheet .ebd-line textarea').forEach(grow);
    app.querySelectorAll('.ebd-note textarea').forEach(noteGrow);
    var qt = app.querySelector('[data-eb-qtext]');
    if (qt && e.q && e.q !== TYPED) { TYPED = e.q; typeIn(qt); }
    var first = app.querySelector('.ebd-block.is-on textarea');
    if (first && !keepFocus && cur !== 'q') first.focus({ preventScroll: true });
  }
  // A box on the sheet grows a line at a time, so the writing stays on the rules.
  function grow(t) { t.style.height = '0px'; t.style.height = Math.max(34, Math.ceil(t.scrollHeight / 34) * 34) + 'px'; }
  function setField(key, v) {
    var e = essay(), m;
    if (key === 'q' || key === 'thesis' || key === 'intro' || key === 'end') e[key] = v;
    else if ((m = /^a([PAE])(\d+)$/.exec(key))) { var aa = e.aspects[+m[2]]; if (!aa) return; (e.parasA[aa] = e.parasA[aa] || {})[m[1]] = v; }
    else { var part = key.charAt(0), k = +key.slice(1), a = e.aspects[k]; if (!a) return; (e.paras[a] = e.paras[a] || {})[part] = v; }
    saveEssay();
    if (key === 'q') { var qt = app.querySelector('[data-eb-qtext]'); if (qt) qt.innerHTML = v ? qHtml(v) : ''; TYPED = v; }
    var cnt = app.querySelector('.ebd-count');
    if (cnt) { var na = words(essayParts('a').join(' ')), nb = words(essayParts('b').join(' ')); cnt.firstChild.textContent = split() ? '(a) ' + na + ' words · (b) ' + nb + ' words' : nb + ' words'; }
    updateStamps();
  }

  // ---------- events ----------
  var toastT = 0;
  function toast(msg) {
    var t = document.querySelector('.eng-toast');
    if (!t) { t = document.createElement('div'); t.className = 'eng-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-on'); }, 1600);
  }
  function copy(s, el) {
    var done = function () { toast('Copied: ' + (s.length > 40 ? s.slice(0, 40) + '…' : s)); if (el) { el.classList.add('is-copied'); setTimeout(function () { el.classList.remove('is-copied'); }, 900); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, done); else done();
  }
  // ---------- going into the builder ----------
  // A sheet of essay paper opens out of the button you pressed, its rules draw across and the red margin down,
  // "Build an essay" is written on it and P, A, C and E stamp down; then the sheet grows past the screen and lifts away,
  // and the builder comes in under it. A click, a tap or Esc skips it; with reduced motion it just goes.
  var GOING = null, ENTER = false;
  function goBuild(link) {
    var href = link.getAttribute('href');
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (GOING || still || !document.body.animate) { location.hash = href; return; }
    var r = link.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    var pw = Math.min(660, W - 32), ph = Math.min(Math.round(pw * 0.74), H - 96), fx = (W - pw) / 2, fy = (H - ph) / 2;
    var ov = document.createElement('div');
    ov.className = 'eng-go'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="eng-go__sheet" style="left:' + fx + 'px;top:' + fy + 'px;width:' + pw + 'px;height:' + ph + 'px;--pw:' + pw + 'px">' +
      '<div class="eng-go__lines">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<i style="top:' + (24 + k * 8.4) + '%"></i>'; }).join('') + '</div>' +
      '<span class="eng-go__margin"></span><p class="eng-go__t">Build an essay</p>' +
      '<div class="eng-go__pace">' + C.structure.pace.map(function (x) { return '<b style="background:' + PACE_COL[x.k] + '">' + x.k + '<small>' + esc(x.name) + '</small></b>'; }).join('') + '</div></div>';
    document.body.appendChild(ov);
    var sheet = ov.querySelector('.eng-go__sheet'), timers = [], anims = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var run = function (el, frames, opts) { var a = el.animate(frames, Object.assign({ fill: 'both' }, opts)); anims.push(a); return a; };
    var done = function () {
      if (!GOING) return;
      GOING = null; timers.forEach(clearTimeout); anims.forEach(function (a) { a.cancel(); });
      if (location.hash !== href) { ENTER = true; location.hash = href; }
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      document.removeEventListener('keydown', key, true);
    };
    var key = function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } };
    GOING = done;
    ov.addEventListener('click', done);
    document.addEventListener('keydown', key, true);
    if (K) K.sfx('whoosh', 0.35);
    run(ov, [{ backgroundColor: 'rgba(19, 31, 36, 0)' }, { backgroundColor: 'rgba(19, 31, 36, .9)' }], { duration: 320 });
    // Out of the button (the sheet's corner and size start as the button's).
    run(sheet, [{ transform: 'translate(' + (r.left - fx) + 'px,' + (r.top - fy) + 'px) scale(' + (r.width / pw) + ',' + (r.height / ph) + ')', borderRadius: '60px', opacity: 0.7 },
      { transform: 'none', borderRadius: '6px 6px 18px 6px', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2, .9, .25, 1.12)' });
    ov.querySelectorAll('.eng-go__lines i').forEach(function (l, k) { run(l, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 260, delay: 300 + k * 40, easing: 'cubic-bezier(.4, 0, .2, 1)' }); });
    run(ov.querySelector('.eng-go__margin'), [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 360, delay: 340, easing: 'cubic-bezier(.4, 0, .2, 1)' });
    // Written left to right, like a pen.
    run(ov.querySelector('.eng-go__t'), [{ clipPath: 'inset(-20% 100% -30% 0)' }, { clipPath: 'inset(-20% 0 -30% 0)' }], { duration: 560, delay: 560, easing: 'cubic-bezier(.45, .05, .55, .95)' });
    ov.querySelectorAll('.eng-go__pace b').forEach(function (b, k) {
      run(b, [{ transform: 'scale(1.7) rotate(' + (k % 2 ? 9 : -9) + 'deg)', opacity: 0 }, { transform: 'scale(.94) rotate(0)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
        { duration: 300, delay: 900 + k * 120, easing: 'cubic-bezier(.3, .7, .4, 1)' });
      at(900 + k * 120 + 200, function () { if (K) K.sfx(k === 3 ? 'stamp' : 'tick', k === 3 ? 0.3 : 0.25); });
    });
    // Then the builder goes in under it, and the sheet grows past the edges and lifts away.
    at(1520, function () { ENTER = true; location.hash = href; });
    at(1560, function () {
      sheet.style.transformOrigin = '50% 50%';
      run(sheet, [{ transform: 'none', opacity: 1 }, { transform: 'scale(' + (W / pw * 1.3) + ',' + (H / ph * 1.3) + ')', opacity: 0 }], { duration: 460, easing: 'cubic-bezier(.5, 0, .75, 0)' });
      run(ov, [{ backgroundColor: 'rgba(19, 31, 36, .9)' }, { backgroundColor: 'rgba(19, 31, 36, 0)' }], { duration: 460, easing: 'ease-in' });
    });
    at(2040, done);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var dq = t.closest('[data-def]');
    if (dq) { ev.preventDefault(); if (DEF && DEF.btn === dq && DEF.hover) DEF.hover = false; else if (DEF && DEF.btn === dq) closeDef(); else openDef(dq); return; }
    if (DEF && (t.closest('[data-def-close]') || !t.closest('.q-pop'))) { closeDef(); if (t.closest('[data-def-close]')) return; }
    if (t.closest('[data-sh-menu]')) { menu(!document.body.classList.contains('sh-open')); return; }
    // The menu closes when you pick something in it or click anywhere outside it.
    if (document.body.classList.contains('sh-open') && (t.closest('.sh-link') || !t.closest('.sh-side'))) menu(false);
    var gb = t.closest('a[href^="#build"]');
    if (gb && ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !/^#build/.test(location.hash)) { ev.preventDefault(); goBuild(gb); return; }
    if (Date.now() - DRAG_END < 250 && (t.closest('[data-node]') || t.closest('[data-chip]'))) return;
    if (t.closest('[data-cm-retest]') && CM) { castMode('build', badList()); return; }
    if (t.closest('[data-cm-close]') && CM) { CM.sel = -1; castDraw(); return; }
    var cmb = t.closest('[data-cm]');
    if (cmb && CM) { castMode(cmb.getAttribute('data-cm')); return; }
    if (t.closest('[data-cm-next]') && CM) { CM.shown += 1; if (CM.shown === text(CM.t).people.length) store('eng-cast-met-' + CM.t, '1'); if (K) K.sfx('pop', 0.35); castDraw('line'); return; }
    if (t.closest('[data-cm-back]') && CM) { CM.shown = Math.max(1, CM.shown - 1); castDraw(); return; }
    var chip = t.closest('[data-chip]');
    if (t.closest('[data-cw-show]') && CM) { writeSubmit(true); return; }
    if (t.closest('[data-cw-next]') && CM) { writeNext(); return; }
    if (chip && CM) { var ci = +chip.getAttribute('data-chip'); CM.pick = CM.pick === ci ? -1 : ci; castDraw(); return; }
    var node = t.closest('[data-node]');
    if (node && CM) {
      var ni = +node.getAttribute('data-node');
      if (CM.mode === 'explore') { CM.sel = CM.sel === ni ? -1 : ni; if (K) K.sfx('tick', 0.3); castDraw(); }
      else if (CM.mode === 'build' && CM.write >= 0) toast('Write about ' + callOf(text(CM.t).people[CM.write]) + ' first.');
      else if (CM.mode === 'build' && CM.pick >= 0) castPlace(CM.pick, ni);
      else if (CM.mode === 'build') toast('Pick a name first, then tap who it is.');
      else if (CM.mode === 'meet') { CM.mode = 'explore'; CM.sel = ni; castDraw(); }
      return;
    }
    var out = t.closest('[data-eng-out]');
    if (out) {
      var oid = out.getAttribute('data-eng-out'), back = leftOut();
      leaveOut(oid);
      if (K) K.sfx('pop', 0.5);
      renderHome();
      toast(text(oid).title + ' left out: ' + text(back).title + ' is back in.');
      return;
    }
    var pin = t.closest('[data-eng-pin]'), scn = pin && pin.closest('[data-scene]');
    if (scn) {
      var stg = scn.querySelector('[data-stage]'), bt = scn.querySelector('.eng-beat[data-pic="' + stg.getAttribute('data-pic') + '"][data-spot="' + pin.getAttribute('data-eng-pin') + '"]');
      if (bt) { beatOn(bt); bt.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return;
    }
    var lt = t.closest('[data-eng-lt]');
    if (lt) { LT = lt.getAttribute('data-eng-lt'); renderLearn(); return; }
    var lm = t.closest('[data-eng-lm]');
    if (lm) { LM = lm.getAttribute('data-eng-lm'); renderLearn(); return; }
    if (t.closest('[data-eng-ltest]')) { LTEST = !LTEST; renderLearn(); return; }
    var rv = t.closest('[data-eng-reveal]');
    if (rv) { rv.classList.remove('is-hidden'); rv.removeAttribute('data-eng-reveal'); rv.removeAttribute('role'); if (K) K.sfx('pop', 0.3); return; }
    var lr = t.closest('[data-eng-learn]');
    if (lr) {
      var lv = lr.getAttribute('data-eng-learn').split(':'), ls = learnStore();
      if (lv[1] === '1') ls[lv[0]] = 1; else delete ls[lv[0]];
      store('eng-learn', JSON.stringify(ls));
      if (K) { if (lv[1] === '1') K.sfx('stamp', 0.35); else K.sfx('tick', 0.3); }
      var card = lr.closest('[data-eng-chain]'), m0 = text(LT).moments.filter(function (m) { return m.id === lv[0]; })[0];
      if (card && m0) { card.outerHTML = chainHtml(LT, m0, ls); }
      var pr = app.querySelector('.eng-lprog');
      if (pr) { var g = text(LT).moments.filter(function (m) { return ls[m.id]; }).length; pr.querySelector('i').style.width = Math.round(100 * g / text(LT).moments.length) + '%'; pr.querySelector('b').textContent = g + ' of ' + text(LT).moments.length; }
      return;
    }
    var up = t.closest('[data-eng-up]');
    if (up) { up.classList.toggle('is-up'); if (K && up.classList.contains('is-up')) K.sfx('pop', 0.3); return; }
    var cp = t.closest('[data-eng-copy]');
    if (cp) { copy(cp.getAttribute('data-eng-copy'), cp); return; }
    var qf = t.closest('[data-eng-qf]');
    if (qf) { qFilter = qf.getAttribute('data-eng-qf'); renderQuestions(); return; }
    if (t.closest('[data-eng-qopen]')) { QOPEN = !QOPEN; store('eng-q-open', QOPEN ? '1' : '0'); renderQuestions(); return; }
    var cpa = t.closest('[data-cp-a]'), cpp = t.closest('[data-cp-pt]'), cpm = t.closest('[data-cpm]'), cpr = t.closest('[data-cp-rel]'), cpd = t.closest('[data-cp-del]');
    if (cpa || cpp || cpm || cpr || cpd || t.closest('[data-cp-cancel],[data-cp-hint],[data-cp-reset],[data-cp-copy]')) {
      var cth = cpTheme(), cby = cpBy(cth), focus = null;
      if (cpa) { cby.a = cpa.getAttribute('data-cp-a'); CPSEL = CPPICK = CPFB = CPHINT = null; focus = '[data-cp-a="' + cby.a + '"]'; }
      else if (cpp) {
        var cw = cpWork(cth, cby.a), ci = +cpp.getAttribute('data-cp-pt'), at = cw.pts.indexOf(ci);
        if (at >= 0) cw.pts.splice(at, 1); else if (cw.pts.length < 3) cw.pts.push(ci);
        focus = '[data-cp-pt="' + ci + '"]';
      }
      else if (cpm) { cpTap(cpm.getAttribute('data-cpm')); focus = CPPICK ? '[data-cp-rel="same"]' : '[data-cpm="' + cpm.getAttribute('data-cpm') + '"]'; }
      else if (cpr) { cpRel(cpr.getAttribute('data-cp-rel')); focus = '[data-cp-hint]'; }
      else if (cpd) { cpWork(cth, cby.a).links.splice(+cpd.getAttribute('data-cp-del'), 1); CPFB = null; focus = '[data-cp-hint]'; }
      else if (t.closest('[data-cp-cancel]')) { CPPICK = null; focus = '[data-cp-hint]'; }
      else if (t.closest('[data-cp-hint]')) { cpHint(); focus = CPSEL ? '[data-cpm="' + CPSEL + '"]' : '[data-cp-hint]'; }
      else if (t.closest('[data-cp-reset]')) { cby.work[cby.a] = { pts: [], links: [] }; CPSEL = CPPICK = CPFB = CPHINT = null; }
      else if (t.closest('[data-cp-copy]')) { copy(cpPlanText(), t.closest('[data-cp-copy]')); return; }
      cpSave(); renderCompare();
      var fe = focus && app.querySelector(focus);
      if (fe) fe.focus({ preventScroll: true });
      return;
    }
    // The builder.
    var e = E;
    var go = t.closest('[data-eb-go]');
    if (go && !go.disabled && curStep() === 'plan' && +go.getAttribute('data-eb-go') > 0 && !essay().aspects.length) autoPlan();
    if (go && !go.disabled) { essay().step += +go.getAttribute('data-eb-go'); saveEssay(); drawBuild(); window.scrollTo(0, 0); return; }
    var sp = t.closest('[data-eb-step]');
    if (sp) { essay().step = +sp.getAttribute('data-eb-step'); saveEssay(); drawBuild(); return; }
    var ck = t.closest('[data-eb-crack]');
    if (ck) { e = essay(); e.crack[ck.getAttribute('data-eb-crack')] = true; saveEssay(); if (K) K.sfx(crackedAll() ? 'stamp' : 'pop', 0.4); ck.classList.add('is-flipped'); setTimeout(function () { drawBuild(true); }, 420); return; }
    var sn = t.closest('[data-eb-stance]');
    if (sn && !sn.disabled) { var sv = sn.getAttribute('data-eb-stance').split(':'); essay().stance[sv[0]] = +sv[1]; saveEssay(); if (K) K.sfx('tick', 0.35); drawBuild(true); return; }
    if (t.closest('[data-eb-useline]')) { useLine(); return; }
    if (t.closest('[data-eb-slips]')) { SLIPS = !SLIPS; drawBuild(true); return; }
    if (t.closest('[data-eb-plan]')) { PLAN_OPEN = !PLAN_OPEN; drawBuild(true); return; }
    var pgb = t.closest('[data-pg]');
    if (pgb) {
      var pk = pgb.getAttribute('data-pg');
      if (pk === 'play') { playPlan(); return; }
      if (pk === 'auto') { autoPlan(); saveEssay(); if (K) K.sfx('stamp', 0.3); drawBuild(true); return; }
      if (pk === 'use') { e = essay(); e.step = stepNo('plan') + 1; saveEssay(); if (K) K.sfx('stamp', 0.35); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    }
    var sw = t.closest('[data-pg-swap]');
    if (sw) { var pr = sw.getAttribute('data-pg-swap').split('|'), ea = essay().aspects; ea[ea.indexOf(pr[0])] = pr[1]; saveEssay(); if (K) K.sfx('pop', 0.35); drawBuild(true); return; }
    if (t.closest('[data-eb-surprise]')) {
      var pool = D.questions.filter(function (q) { return q.text !== essay().q; });
      useQuestion(pool[Math.floor(Math.random() * pool.length)]); SLIPS = false; saveEssay(); if (K) K.sfx('whoosh', 0.3); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    var md = t.closest('[data-eb-mode]');
    if (md) { e = essay(); if (e.mode !== md.getAttribute('data-eb-mode')) { e.mode = md.getAttribute('data-eb-mode'); e.aspects = []; } saveEssay(); drawBuild(); return; }
    var qq = t.closest('[data-eb-q]');
    if (qq) { useQuestion(D.questions[+qq.getAttribute('data-eb-q')]); SLIPS = false; saveEssay(); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var ty = t.closest('[data-eb-type]');
    if (ty) { essay().type = ty.getAttribute('data-eb-type'); saveEssay(); drawBuild(); return; }
    var at = t.closest('[data-eb-atext]');
    if (at) { essay().textA = at.getAttribute('data-eb-atext'); saveEssay(); drawBuild(); return; }
    var as = t.closest('[data-eb-aspect]');
    if (as) {
      e = essay(); var a = as.getAttribute('data-eb-aspect'), i = e.aspects.indexOf(a);
      if (i >= 0) { if (e.aspects.length > 3) e.aspects.splice(i, 1); else { toast('Three paragraphs at least: add another first.'); return; } } else if (e.aspects.length < 5) e.aspects.push(a);
      saveEssay(); drawBuild(); return;
    }
    var ins = t.closest('[data-eb-insert]');
    if (ins) {
      // Into the box you were last writing in (or the first one of this part).
      var box = (FOCUS && app.querySelector('textarea[data-eb="' + FOCUS + '"]')) || app.querySelector('.ebd-block.is-on textarea');
      if (!box) return;
      var s = ins.getAttribute('data-eb-insert').replace(/ …$/, ' '), at = box.selectionStart != null && document.activeElement !== ins ? box.selectionStart : box.value.length;
      if (box.value && at === 0 && FOCUS !== box.getAttribute('data-eb')) at = box.value.length;
      var before = box.value.slice(0, at), add = (before && !/\s$/.test(before) ? ' ' : '') + s + (/[,]$/.test(s) ? ' ' : '');
      box.value = before + add + box.value.slice(at);
      box.focus(); box.selectionStart = box.selectionEnd = (before + add).length;
      FOCUS = box.getAttribute('data-eb'); grow(box);
      setField(FOCUS, box.value);
      return;
    }
    if (t.closest('[data-eb-copyall]')) { copy(essayParts().join('\n\n')); return; }
    if (t.closest('[data-eb-new]')) { if (window.confirm('Start a new answer? This one will be cleared.')) { E = null; store('eng-essay', 'null'); drawBuild(); } return; }
  });
  document.addEventListener('change', function (ev) {
    var sl = ev.target.getAttribute && ev.target.getAttribute('data-eng-cp');
    if (sl == null) return;
    var v = ev.target.value.split(':'); CP[+sl] = v[0]; CP[+sl + 1] = +v[1];
    var box = app.querySelector('.eng-cp'); if (box) box.outerHTML = chainPace();
  });
  document.addEventListener('keydown', function (ev) {
    var rv = ev.target.closest && ev.target.closest('[data-eng-reveal]');
    if (rv && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); rv.click(); }
  });
  document.addEventListener('input', function (ev) {
    var key = ev.target.getAttribute && ev.target.getAttribute('data-eb');
    if (!key) return;
    if (key === 'thesis' && /\n/.test(ev.target.value)) ev.target.value = ev.target.value.replace(/\s*\n+\s*/g, ' ');
    if (ev.target.closest('.ebd-note')) noteGrow(ev.target); else if (ev.target.closest('.ebd-sheet')) grow(ev.target);
    setField(key, ev.target.value);
  });
  // Writing in a P, A, C or E box: the coach shows what goes in it and its phrases.
  document.addEventListener('focusin', function (ev) {
    var key = ev.target.getAttribute && ev.target.getAttribute('data-eb');
    if (!key || !ev.target.closest('.ebd-sheet') || key === FOCUS) return;
    FOCUS = key;
    var body = app.querySelector('[data-eb-coachbody]');
    if (body && /^a?[PACE]\d+$/.test(key)) body.innerHTML = coachHtml(true);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (DEF) { var b = DEF.btn; closeDef(); b.focus(); return; }
    if (CM && CM.mode === 'explore' && CM.sel >= 0 && app.querySelector('[data-map]')) { CM.sel = -1; castDraw(); return; }
    if (document.body.classList.contains('sh-open')) menu(false);
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', function () { if (CM && app.querySelector('[data-map]')) castDraw('resize'); });
  // Meanings on hover, where there's a mouse: over a word, its meaning opens; it closes a moment after you leave both the
  // word and the box (so you can move onto the box). A click keeps it open.
  var CANHOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.addEventListener('mouseover', function (ev) {
    if (!CANHOVER || !ev.target.closest) return;
    var b = ev.target.closest('.q-def');
    if (b) { clearTimeout(HOV); if (!DEF || DEF.btn !== b) HOV = setTimeout(function () { openDef(b, true); }, 120); return; }
    if (ev.target.closest('.q-pop')) clearTimeout(HOV);
  });
  document.addEventListener('mouseout', function (ev) {
    if (!CANHOVER || !ev.target.closest) return;
    var from = ev.target.closest('.q-def, .q-pop'), to = ev.relatedTarget && ev.relatedTarget.closest ? ev.relatedTarget.closest('.q-def, .q-pop') : null;
    if (!from || from === to) return;
    clearTimeout(HOV);
    if (DEF && DEF.hover) HOV = setTimeout(function () { if (DEF && DEF.hover) closeDef(); }, 280);
  });
  // Build it: a name chip dragged onto a person.
  var DRAGC = null;
  document.addEventListener('pointerdown', function (ev) {
    var chip = ev.target.closest && ev.target.closest('[data-chip]');
    if (!chip || !CM) return;
    ev.preventDefault();
    DRAGC = { i: +chip.getAttribute('data-chip'), x: ev.clientX, y: ev.clientY, ghost: null, chip: chip };
  });
  document.addEventListener('pointermove', function (ev) {
    if (!DRAGC) return;
    if (!DRAGC.ghost && Math.hypot(ev.clientX - DRAGC.x, ev.clientY - DRAGC.y) < 8) return;
    if (!DRAGC.ghost) { DRAGC.ghost = document.createElement('div'); DRAGC.ghost.className = 'eng-namechip is-ghost'; DRAGC.ghost.textContent = text(CM.t).people[DRAGC.i].name; document.body.appendChild(DRAGC.ghost); DRAGC.chip.classList.add('is-lifted'); }
    DRAGC.ghost.style.left = ev.clientX + 'px'; DRAGC.ghost.style.top = ev.clientY + 'px';
    DRAGC.cx = ev.clientX; DRAGC.cy = ev.clientY;
    dragOver();
    // Near the top or bottom edge the page scrolls, faster the closer you are.
    var edge = 70, y = ev.clientY, h = window.innerHeight;
    DRAGC.vy = y < edge + 60 ? -Math.ceil((edge + 60 - y) / 6) : y > h - edge ? Math.ceil((y - (h - edge)) / 5) : 0;
    if (DRAGC.vy && !DRAGC.raf) DRAGC.raf = requestAnimationFrame(dragScroll);
    ev.preventDefault();
  });
  function dragOver() {
    app.querySelectorAll('.eng-node.is-over').forEach(function (n) { n.classList.remove('is-over'); });
    var under = document.elementFromPoint(DRAGC.cx, DRAGC.cy), n = under && under.closest('[data-node]');
    if (n) n.classList.add('is-over');
  }
  function dragScroll() {
    if (!DRAGC) return;
    DRAGC.raf = 0;
    if (!DRAGC.vy) return;
    window.scrollBy(0, DRAGC.vy); dragOver();
    DRAGC.raf = requestAnimationFrame(dragScroll);
  }
  document.addEventListener('pointerup', function (ev) {
    if (!DRAGC) return;
    var d = DRAGC; DRAGC = null;
    if (d.raf) cancelAnimationFrame(d.raf);
    if (!d.ghost) return;
    d.ghost.remove(); d.chip.classList.remove('is-lifted');
    var under = document.elementFromPoint(ev.clientX, ev.clientY), n = under && under.closest('[data-node]');
    DRAG_END = Date.now();
    if (n) castPlace(d.i, +n.getAttribute('data-node')); else castDraw();
  });
  document.addEventListener('pointercancel', function () {
    if (!DRAGC) return;
    var d = DRAGC; DRAGC = null;
    if (d.raf) cancelAnimationFrame(d.raf);
    if (d.ghost) { d.ghost.remove(); d.chip.classList.remove('is-lifted'); }
    app.querySelectorAll('.eng-node.is-over').forEach(function (n) { n.classList.remove('is-over'); });
  });
  var DRAG_END = 0;
  document.addEventListener('input', function (ev) { var k = ev.target.getAttribute && ev.target.getAttribute('data-cw-in'); if (k && CM) { CM.draft = CM.draft || {}; CM.draft[k] = ev.target.value; } });
  document.addEventListener('submit', function (ev) { if (ev.target.matches && ev.target.matches('[data-cw]')) { ev.preventDefault(); writeSubmit(false); } });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' || !ev.target.matches || !ev.target.matches('[data-cw-in="like"]')) return;
    var w = app.querySelector('[data-cw-in="want"]'); if (w && !w.value.trim()) { ev.preventDefault(); w.focus(); }
  });
  // The line of argument is one sentence: Enter doesn't start a new line.
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target.getAttribute && ev.target.getAttribute('data-eb') === 'thesis') ev.preventDefault(); });
  // The parts of the sheet you can tap to go to also go with Enter or Space.
  document.addEventListener('keydown', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-eb-step][role="button"]');
    if (b && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); b.click(); }
  });

  // ---------- routes ----------
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, '')), p = h.split('/');
    menu(false);
    if (p[0] === 'play' && window.EngGames) { window.EngGames.open(p[1]); history.replaceState(null, '', '#comparative'); renderHome(); return; }
    if (p[0] === 'marking') renderMarking();
    else if (p[0] === 'structure') renderStructure();
    else if (p[0] === 'learn') renderLearn();
    else if (p[0] === 'mode') renderMode(p[1]);
    else if (p[0] === 'text') renderText(p[1], p[2]);
    else if (p[0] === 'language') renderLanguage();
    else if (p[0] === 'questions') renderQuestions();
    else if (p[0] === 'compare') renderCompare();
    else if (p[0] === 'build') renderBuild(p[1]);
    else if (p[0] === 'comparative') renderHome();
    else if (p[0] === 'single') renderSingle();
    else if (p[0] === 'part') renderPart(p[1]);
    else renderHub();
    if (!p[2]) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  window.EngApp = { grade: function (tid, name, like, want) {
      var t = text(tid), c = t.people.filter(function (x) { return x.name === name; })[0], chk = c.check || {};
      var names = [].concat.apply([], t.people.map(function (x) { return wordsOf(x.name); }));
      var l = writeCheck(like, c.trait || '', chk.like, names).length > 0, w = writeCheck(want, c.wants, chk.want, names).length > 0;
      return l && w ? 'spot' : l || w ? 'half' : 'none';
    }, chosen: chosen, text: text, data: D, colour: COL, inMoments: inMoments, faceHtml: faceHtml };
  route();
})();

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
  var SUBJECTS = '<a href="Geography%20Questions.dc.html">Geography</a><a href="biology.html">Biology</a><a href="english.html" aria-current="page">English</a><a href="irish.html">Irish</a><a href="german.html">German</a>';
  function renderShell(active, crumb) {
    var mine = chosen();
    closeDef();
    document.body.classList.remove('eng-papertop');
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
      '<nav class="sh-switch" aria-label="Subject">' + SUBJECTS + '</nav>';
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
  // The theme you're working on in Compare it, once you've started it there (picked a part (a) text); else null.
  function myTheme() { var s = cpState(), th = cpTheme(); return th && s.by[th.id] && s.by[th.id].a ? th : null; }
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
    return '<a class="eng-cpc" style="--c:' + COL[o.t.id] + '" href="#text/' + o.t.id + '/' + mid + '">' + esc(o.m.title) + '</a>';
  }
  // A red warning box (the user: "almost like a warning", "red box", "i dont care if it looks ugly i want them to do
  // WELL"): a warning sign, a heading, then each rule on its own line.
  function cpWarnBox(head, lines) {
    return '<div class="eng-cpwarn" role="note"><p class="eng-cpwarn__h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 1.5 21h21z" fill="currentColor"/>' +
      '<rect x="11" y="9" width="2" height="6.5" rx="1" fill="#2A0D0D"/><circle cx="12" cy="18" r="1.25" fill="#2A0D0D"/></svg>' + head + '</p><ul>' +
      lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
  }
  // How to write part (b), broken down the way the user had it explained to them ("very clearly and exactly broken down
  // ... not very long"): together not one then the other; each paragraph as five steps; an example from this pair's
  // first link; the whole of part (b); the part (a) text left out.
  function cpHowB(th, a, B, L) {
    var t0 = shortTitle(B[0]), t1 = shortTitle(B[1]), eg = L[0];
    var step = function (c, name, say) { return '<li style="--c:' + c + '"><b>' + name + '</b><span>' + say + '</span></li>'; };
    return '<div class="eng-cpx">' + cpWarnBox('Part (b): read this before you write', [
      'Write about <i>' + esc(t0) + '</i> and <i>' + esc(t1) + '</i> <b>together</b>: a moment from <b>each</b> in <b>every</b> paragraph.',
      'Do <b>NOT</b> write about one text and then the other. Part (b) is marked on <b>comparing</b>, so that loses marks.',
      'Do <b>NOT</b> bring <i>' + esc(shortTitle(a)) + '</i> into part (b). It gets <b>no marks</b> there.']) +
      '<h3>Each paragraph</h3><ol class="eng-cpx__flow">' +
      step('var(--m-theme)', 'Point', 'what both show about ' + esc(th.name.toLowerCase())) +
      step(COL[B[0]], esc(t0), 'the moment, short') +
      step(COL[B[1]], esc(t1), 'the moment, short') +
      step('var(--m-cc)', 'Compare', 'Similarly… Whereas… Even more so…') +
      step('var(--pace-e)', 'Evaluate', 'why it matters') + '</ol>' +
      (eg ? '<p class="eng-cpx__eg"><b>For example:</b> ' + esc(eg.aspect) + ', ' + momChip(eg.a) + ' and ' + momChip(eg.b) + '. <span>“' + esc(eg.say) + '”</span></p>' : '') +
      '<h3>The whole of part (b)</h3><ul class="eng-cpx__whole">' +
      '<li><b>Opening</b><span>Name both texts and their authors (<i>' + esc(text(B[0]).title) + '</i> by ' + esc(text(B[0]).author) + ', <i>' + esc(text(B[1]).title) + '</i> by ' + esc(text(B[1]).author) + '), answer the question, and say your 3 or 4 points.</span></li>' +
      '<li><b>3 or 4 paragraphs</b><span>One for each pair of scenes you picked above.</span></li>' +
      '<li><b>Ending</b><span>Your judgement: which text shows ' + esc(th.name.toLowerCase()) + ' more powerfully, and why.</span></li></ul>' +
      '</div>';
  }
  // Compare it as building blocks, like a tutorial (the user: "its not in building blocks when you shove a bunch of
  // information in my face ... pick your scene and then 4 reveals itself (the plan should come before the essay) and make
  // the plan simpler and then click next and then you start making the essay", "the student learns from doing, not from
  // reading a page of random words", "make it EASY to get around"). Five steps, each shown once the one before is done
  // or you tap Next (`by.stage`, the furthest reached): 1 pick the part (a) text, 2 write part (a), 3 pick your part (b)
  // scenes, 4 your plan, 5 write part (b). A step bar under the top bar jumps between them. No blocks of explaining on
  // the page: the examiner in the corner gives it one short tip at a time (`guideDraw`), for the step you're on.
  var CP_STEPS = ['Part (a) text', 'Write part (a)', 'Pick scenes', 'Your plan', 'Write part (b)'];
  function cpStage(th, a, w) {
    if (!a) return 1;
    var st = Math.max(cpBy(th).stage || 1, 2);
    if (w.links.length) st = Math.max(st, 3);
    if (w.links.length >= 3) st = Math.max(st, 4);
    var Wb = w.writeB;
    if (Wb && cpbSlots(Wb).some(function (x) { return cpbText(Wb, x); })) st = Math.max(st, 5);
    return st;
  }
  // The top of Compare it is one strip of exam paper, on this page only (body.eng-papertop). The user: "too many navigation
  // layers stacked on top of each other ... replace the stacked bars with a single slim progress indicator", "ONE accent
  // colour, used for ONE meaning only", "the mascot delivers them in a speech bubble placed beside the instructions, not
  // floating over content", then "the mascot looks slapped on rather than part of it". So the top bar, the breadcrumb,
  // the subject tabs, the five step pills and the pinned question banner are one row: the menu, the subject (a quiet
  // dropdown), the examiner with his tip in red pen (`guideDraw` puts him in the slot), the exam question one tap away,
  // and five tick boxes for the steps. Black ink is the examiner's own outline colour; red is "now": him talking and the
  // step you're on; the highlighter is only on the exam question's key words. The steps read as progress (the user: "these
  // check boxes should have a lower opacity like their done and the one that we are on should be vibrant and make it like
  // a progress thing your getting through"): done steps are faded ticks joined by the line you've come along, the step
  // you're on is a bigger red box with its number, the ones to come are empty. Phones (the feed) get the same strip in place of each item's
  // own header: back, the tick boxes, the examiner.
  function cpSteps(st, at) {
    return '<nav class="cpx-steps" aria-label="Steps" data-at="' + at + '"><ol>' + CP_STEPS.map(function (x, i) {
      var n = i + 1, open = n <= st, now = n === at, done = n < at;
      var cls = now ? ' is-on' : done ? ' is-done' : '';
      return '<li class="' + cls.slice(1) + '"><button type="button" class="cpx-step' + cls + '" data-cp-go="' + n + '" title="' + esc(x) + '"' + (open ? '' : ' disabled') + (now ? ' aria-current="step"' : '') +
        ' aria-label="Step ' + n + ': ' + esc(x) + (now ? '' : done ? ', done' : open ? '' : ', locked') + '"><i aria-hidden="true">' + (now ? n : '') + '</i></button></li>';
    }).join('') + '</ol><p class="cpx-steps__l"><span>Step ' + at + ' of ' + CP_STEPS.length + ' · </span><b>' + esc(CP_STEPS[at - 1]) + '</b></p></nav>';
  }
  function cpStepsSync(at) {
    var nav = bar.querySelector('.cpx-steps');
    if (nav && +nav.getAttribute('data-at') !== at) nav.outerHTML = cpSteps(CP_ST, at);
  }
  function cpTop(st, at, feed) {
    var part = st >= 3 ? 'b' : 'a';
    document.body.classList.add('eng-papertop');
    bar.innerHTML = '<div class="cpx' + (feed ? ' is-feed' : '') + (GUIDE.open ? ' is-open' : '') + '">' +
      (feed ? '<h1 class="sr">Compare it</h1><a class="cpx-back" href="#" aria-label="Back to English"><span aria-hidden="true">‹</span></a>'
        : '<button type="button" class="sh-menu cpx-menu" data-sh-menu aria-expanded="false" aria-controls="eng-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
          '<details class="cpx-drop cpx-subj"><summary>English</summary><nav class="cpx-sheet" aria-label="Subject">' + SUBJECTS + '</nav></details>') +
      '<div class="cpx-slot" data-cpx-guide></div>' +
      (feed ? '' : '<details class="cpx-drop cpx-ask"><summary><span>Question </span><b data-cpx-part>' + cpQTag(part) + '</b></summary><div class="cpx-sheet">' + cpQ(part) + '</div></details>') +
      cpSteps(st, at) + '</div>';
    guideMount();
  }
  // The exam question is always on screen (the user: "the exam question should be with you all the time"): under the step
  // bar, which stays at the top as you scroll, and at the top of the writing popup. It shows the part you're working on,
  // (a) for steps 1 and 2 and (b) from step 3, with its key words marked. On a phone it is cut to two lines; tap for all.
  function cpQLabel(part) { return part === 'a' ? '(a) 30 marks' : '(b) 40 marks'; }
  // The same in the strip, where a small laptop has room for "(a)" only.
  function cpQTag(part) { return cpQLabel(part).replace(/^(\(\w\))(.*)$/, '$1<span>$2</span>'); }
  function cpQIn(part) {
    return '<span><b>' + cpQLabel(part) + '</b> ' + (part === 'a'
      ? 'Choose a theme from one text you have studied as part of your comparative course and say <mark>how it helped maintain your interest</mark> in the text.'
      : '<mark>Compare</mark> how the theme you have dealt with in part (a) is treated by the authors of two other texts from your comparative course <mark>to maintain the reader’s interest</mark>.') + '</span>';
  }
  function cpQ(part) { return '<p class="eng-cpq" data-cpq="' + part + '">' + cpQIn(part) + '</p>'; }
  // The step bar's question follows the step on screen as you scroll.
  function cpQSync() {
    var q = bar.querySelector('[data-cpq]');
    if (!q) return;
    var line = bar.getBoundingClientRect().bottom + 60, k = -1;
    Array.prototype.forEach.call(app.querySelectorAll('.eng-cp__step'), function (el, i) { if (!el.classList.contains('is-folded') && (k < 0 || el.getBoundingClientRect().top < line)) k = i; });
    var part = k >= 2 ? 'b' : 'a';
    if (q.getAttribute('data-cpq') !== part) {
      q.setAttribute('data-cpq', part); q.innerHTML = cpQIn(part);
      var ql = bar.querySelector('[data-cpx-part]'); if (ql) ql.innerHTML = cpQTag(part);
    }
  }
  var cpQT = 0;
  window.addEventListener('scroll', function () { if (!cpQT) cpQT = requestAnimationFrame(function () { cpQT = 0; cpQSync(); }); }, { passive: true });
  function cpNext(n, label, isNext) { return '<p class="eng-cp__nextp"><button type="button" class="eng-btn eng-cp__next' + (isNext ? ' is-next' : '') + '" data-cp-stage="' + n + '">' + label + ' →</button></p>'; }
  function cpScrollTo(n) {
    var fdj = app.querySelector('[data-feed]');
    if (fdj) { var itj = fdj.querySelector('[data-fstep="' + n + '"]'); if (itj) fdj.scrollTo({ top: itj.offsetTop, behavior: 'smooth' }); return; }
    if (cpFolded(n)) { CP_UNFOLD[n] = true; renderCompare(); }
    var el = app.querySelectorAll('.eng-cp__step')[n - 1];
    if (!el) return;
    var off = (getComputedStyle(bar).position === 'sticky' ? bar.offsetHeight : 0) + 12;
    GUIDE.hold = Date.now() + 1400;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  }
  // ----- Phones: Compare it as a TikTok feed (the user: "it does not look like the tiktok scroll feature"). One item per
  // screen, edge to edge, over its picture, a caption at the bottom left and round buttons down the right; a swipe moves
  // exactly one item. The items: the theme; your part (a) text; each part (a) paragraph; the pairs of scenes (tap ❤ to
  // pick 3 or 4); your plan; each part (b) paragraph. The laptop keeps the page.
  var FEED_Y = 0, FEED_GO = 0, FEED_ON = false;
  var FICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.5 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.5 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" fill="currentColor"/></svg>',
    pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="m14.5 7.5 3 3" stroke="currentColor" stroke-width="2.2"/></svg>'
  };
  function fHero(id) { var q = pics(id).filter(function (x) { return x.hero; })[0] || pics(id)[0]; return q ? q.file : ''; }
  // A scene's own picture; with own, '' when it has none rather than another scene's (the user: "the image should be what
  // you PICKED").
  function fPic(mid, own) { var tid = tidOf(mid), q = scenePics(tid, mid)[0]; return q ? q.file : own ? '' : fHero(tid); }
  function fRail(extra) {
    var b = function (k, icon, label, cls, attr) { return '<button type="button" class="eng-rail__b' + (cls || '') + '" ' + attr + '><span class="eng-rail__i">' + icon + '</span><b>' + label + '</b></button>'; };
    return '<div class="eng-fi__rail">' + (extra || '') + b('q', RICON.q, 'Question', '', 'data-feed-q') + b('next', RICON.next, 'Next', '', 'data-feed-next') + '</div>';
  }
  function fRailBtn(icon, label, cls, attr) { return '<button type="button" class="eng-rail__b' + (cls || '') + '" ' + attr + '><span class="eng-rail__i">' + icon + '</span><b>' + label + '</b></button>'; }
  // One item: o = { step, bg: [file, file?], c, tag, title, text, html, act, rail, cls, labels: [[name, colour], ...] }
  function fItem(o) {
    var bg = (o.bg || []).filter(Boolean);
    return '<section class="eng-fi' + (bg.length ? '' : ' is-plain') + (o.cls ? ' ' + o.cls : '') + '" data-fstep="' + o.step + '" style="--c:' + (o.c || '#8FD0FF') + '">' +
      '<div class="eng-fi__bg' + (bg.length === 2 ? ' is-two' : bg.length > 2 ? ' is-mosaic' : '') + '">' + bg.map(function (f, i) {
        var l = o.labels && o.labels[i];
        return '<div class="eng-fi__ph"><img src="assets/eng/img/' + esc(f) + '" alt="" loading="' + (o.eager ? 'eager' : 'lazy') + '">' + (l ? '<span class="eng-fi__lbl" style="--c:' + l[1] + '">' + esc(l[0]) + '</span>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="eng-fi__cap">' + (o.tag ? '<p class="eng-fi__tag">' + o.tag + '</p>' : '') + (o.title ? '<h3>' + o.title + '</h3>' : '') +
        (o.text ? '<p class="eng-fi__txt">' + o.text + '</p>' : '') + (o.html || '') + (o.act ? '<div class="eng-fi__act">' + o.act + '</div>' : '') + '</div>' +
      fRail(o.rail) + '</section>';
  }
  // A picked scene, played like a video (the user: "SHOW the scenes and when a really important thing happens it pauses and
  // does a cool analysis of it like circles and lines"): its picture fills the screen and its story comes a beat at a
  // time, with bars at the top like a story; then it pauses on the key moment: the picture slides up, circles are drawn
  // round what matters with lines out to a note on each, and what the scene represents and its technique come in, with
  // Write it. Tap the picture to skip to the pause; Watch again replays it.
  function fScene(tid, s, m, sc, rp, act, rail) {
    var pic = scenePics(tid, m.id).filter(function (q) { return q.spots && q.spots.length; })[0] || scenePics(tid, m.id)[0];
    var beats = (m.tell && m.tell.length ? m.tell : storySentences(m.what)).slice(0, 4), tq = sc.techniques[rp.t] || sc.techniques[0];
    var spots = pic ? (pic.spots || []).slice(0, 2) : [], key = tid + '/' + s + '/' + m.id;
    return '<section class="eng-fi is-play' + (pic ? '' : ' is-plain') + '" data-fstep="2" data-beats="' + beats.length + '" data-play="' + esc(key) + '" style="--c:' + COL[tid] + '">' +
      '<div class="eng-fi__bg">' + (pic ? '<div class="eng-fi__ph"><img src="assets/eng/img/' + esc(pic.file) + '" alt=""></div>' : '') + '</div>' +
      '<div class="eng-fi__ana" aria-hidden="true"><svg class="eng-fi__svg"></svg>' + spots.map(function (q) {
        return '<div class="eng-fi__spot" data-x="' + q.x + '" data-y="' + q.y + '"><b>' + esc(q.label) + '</b><span>' + esc(q.note) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="eng-fi__bars" aria-hidden="true">' + beats.concat(['']).map(function () { return '<i><b></b></i>'; }).join('') + '</div>' +
      '<div class="eng-fi__cap"><p class="eng-fi__tag">Part (a) · ' + slotName(s) + ' · ' + esc(m.title) + '</p>' +
        '<div class="eng-fi__beats">' + beats.map(function (x, i) { return '<p class="eng-fi__beat' + (i ? '' : ' is-on') + '">' + esc(x) + '</p>'; }).join('') + '</div>' +
        '<div class="eng-fi__key"><p class="eng-fi__pause">⏸ Key moment</p><h3>' + esc(rp.title) + '</h3><p class="eng-fi__txt">' + esc(rp.say) + '</p>' +
          (tq ? '<p class="eng-fi__tech"><em>Technique</em>' + esc(tq.name) + '</p>' : '') + '</div>' +
        '<div class="eng-fi__act">' + act + '<button type="button" class="eng-btn eng-btn--quiet eng-fi__again" data-feed-replay>↻ Watch again</button></div></div>' +
      fRail(rail) + '</section>';
  }
  var FPL = { el: null, t: [] }, FBEAT = 3400, FSEEN = {};
  function fStop() { FPL.t.forEach(clearTimeout); FPL.t = []; FPL.el = null; }
  function fGo(el, i) {
    Array.prototype.forEach.call(el.querySelectorAll('.eng-fi__beat'), function (b, k) { b.classList.toggle('is-on', k === i); });
    Array.prototype.forEach.call(el.querySelectorAll('.eng-fi__bars i'), function (b, k) { b.className = k < i ? 'is-done' : k === i ? 'is-now' : ''; });
  }
  function fReset(el) { el.classList.remove('is-playing', 'is-paused', 'is-marked'); var im = el.querySelector('.eng-fi__ph img'); if (im) im.style.objectPosition = ''; fGo(el, 0); }
  function fPlay(el, again) {
    if (FPL.el === el && !again) return;
    fStop(); FPL.el = el; fReset(el);
    var n = +el.getAttribute('data-beats'), reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || (!again && FSEEN[el.getAttribute('data-play')])) { fGo(el, n); fPause(el); return; }
    el.classList.add('is-playing');
    for (var i = 1; i < n; i++) (function (i) { FPL.t.push(setTimeout(function () { fGo(el, i); }, i * FBEAT)); })(i);
    FPL.t.push(setTimeout(function () { fGo(el, n); fPause(el); }, n * FBEAT));
  }
  function fSkip(el) { fStop(); FPL.el = el; fGo(el, +el.getAttribute('data-beats')); fPause(el); }
  function fPause(el) {
    FSEEN[el.getAttribute('data-play')] = 1;
    el.classList.remove('is-playing'); el.classList.add('is-paused');
    FPL.t.push(setTimeout(function () { fSpots(el); }, 620));
  }
  // The circles and lines: each note's spot on the picture (x, y in % of the picture), found where object-fit: cover
  // puts it, the picture first moved so the spots are in view.
  function fSpots(el) {
    var ana = el.querySelector('.eng-fi__ana'), svg = ana && ana.querySelector('svg'), img = el.querySelector('.eng-fi__ph img'), sp = ana ? ana.querySelectorAll('.eng-fi__spot') : [];
    if (!img || !sp.length) { el.classList.add('is-marked'); return; }
    var run = function () {
      var box = el.querySelector('.eng-fi__bg').getBoundingClientRect(), cw = box.width, ch = box.height, iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !cw) return;
      var k = Math.max(cw / iw, ch / ih), dw = iw * k, dh = ih * k, clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
      var xs = Array.prototype.map.call(sp, function (e) { return +e.getAttribute('data-x') / 100 * dw; }), ys = Array.prototype.map.call(sp, function (e) { return +e.getAttribute('data-y') / 100 * dh; });
      var mean = function (a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; };
      var dx = clamp(cw / 2 - mean(xs), cw - dw, 0), dy = clamp(ch / 2 - mean(ys), ch - dh, 0);
      img.style.objectPosition = (dw > cw + 1 ? dx / (cw - dw) * 100 : 50) + '% ' + (dh > ch + 1 ? dy / (ch - dh) * 100 : 50) + '%';
      var d = '', prev = null, lw = Math.min(210, cw * 0.56);
      Array.prototype.forEach.call(sp, function (e, i) {
        var px = clamp(dx + xs[i], 40, cw - 40), py = clamp(dy + ys[i], 96, ch - 40), right = px < cw / 2;
        var ly = clamp(py - 22, 92, ch - 96);
        if (prev != null && Math.abs(ly - prev) < 96) ly = clamp(prev + 100, 92, ch - 96);
        prev = ly;
        var lx = right ? Math.min(px + 58, cw - lw - 8) : Math.max(px - 58 - lw, 8);
        e.style.left = lx + 'px'; e.style.top = ly + 'px'; e.style.width = lw + 'px'; e.style.setProperty('--k', i);
        d += '<circle class="eng-fi__ring" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="30" style="--k:' + i + '"/>' +
          '<path class="eng-fi__line" d="M' + (px + (right ? 30 : -30)).toFixed(1) + ' ' + py.toFixed(1) + ' L' + (right ? lx : lx + lw).toFixed(1) + ' ' + (ly + 16).toFixed(1) + '" style="--k:' + i + '"/>';
      });
      svg.setAttribute('viewBox', '0 0 ' + cw.toFixed(1) + ' ' + ch.toFixed(1)); svg.innerHTML = d;
      el.classList.add('is-marked');
    };
    if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
  }
  function fPick(n) {
    var th = cpTheme(), a = cpBy(th).a, W = cpWrite(th, a), G = th.write[a], at = W.paras.map(function (q) { return q.scene; }).indexOf(n);
    if (at >= 0) { W.paras[at].scene = 0; W.paras[at].rep = 0; W.paras[at].picked = false; }
    else {
      var e = -1;
      W.paras.forEach(function (q, k) { if (e < 0 && !q.scene) e = k; });
      if (e < 0) { if (W.paras.length >= 4) return; W.paras.push({ parts: { p: '', a: '', e: '' } }); e = W.paras.length - 1; }
      var q = W.paras[e]; q.scene = n; q.rep = 0; q.picked = G.scenes[n].reps.length === 1;
    }
    cpSave(); renderCompare();
  }
  function fBtn(attr, label, quiet) { return '<button type="button" class="eng-btn' + (quiet ? ' eng-btn--quiet' : '') + '" ' + attr + '>' + label + '</button>'; }
  function renderFeed(th, ids, by, a, w, B, st, swapped) {
    fStop();
    var old = app.querySelector('[data-feed]'), y = old ? old.scrollTop : FEED_Y, items = [];
    // the theme
    items.push(fItem({ step: 1, bg: [fHero(a || th.best || ids[0])], eager: true, c: 'var(--m-theme)', tag: 'Compare it · a 30 + 40 answer', title: esc(th.name),
      text: 'Part (a): one text, 30 marks. Part (b): compare the other two, 40 marks.' + (swapped ? ' Using ' + ids.map(function (id) { return esc(text(id).title); }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.' : ''),
      html: '<p class="eng-fi__swipe" aria-hidden="true"><span>👆</span> Swipe up to start</p>' }));
    // your part (a) text
    items.push(fItem({ step: 1, c: 'var(--m-theme)', tag: 'Part (a)', title: 'Pick your part (a) text', cls: 'is-pick',
      html: '<div class="eng-fi__opts">' + ids.map(function (id) {
        var f = fHero(id);
        return '<button type="button" class="eng-fi__opt' + (id === a ? ' is-on' : '') + '" data-cp-a="' + id + '" aria-pressed="' + (id === a) + '" style="--c:' + COL[id] + '">' + (f ? '<img src="assets/eng/img/' + esc(f) + '" alt="">' : '<i></i>') +
          '<span><b>' + esc(text(id).title) + '</b>' + (id === a ? '<em>✓ Your part (a)</em>' : id === th.best ? '<em>Best for (a)</em>' : '') + '</span></button>';
      }).join('') + '</div>' }));
    if (a) {
      // part (a), a paragraph per item
      var WR = th.write && th.write[a];
      if (WR) {
        var W = cpWrite(th, a), G = th.write[a], tot = 0, mo = text(a).moments;
        var pickedN = W.paras.filter(function (q) { return q.scene; }).length;
        var mos = W.paras.filter(function (q) { return q.scene; }).map(function (q) { return fPic(mo[q.scene - 1].id, true); }).filter(Boolean).slice(0, 4);
        // Pick the scenes once, first, for all the paragraphs (the user: "i thought you already pick them before hand").
        items.push(fItem({ step: 2, c: COL[a], cls: 'is-pick is-scenes', tag: 'Part (a) · ' + esc(text(a).title), title: 'Pick your 3 or 4 scenes',
          text: pickedN < 3 ? 'Tap one for each paragraph: ' + (3 - pickedN) + ' more to go.' : pickedN === 3 ? 'Three picked. Add a fourth, or watch them.' : 'Four picked. Now watch them.',
          html: '<div class="eng-fi__grid">' + mo.map(function (mm, mi) {
            var n = mi + 1;
            if (!G.scenes[n]) return '';
            var k = W.paras.map(function (q) { return q.scene; }).indexOf(n), own = fPic(mm.id, true), full = k < 0 && pickedN >= 4;
            return '<button type="button" class="eng-fi__tile' + (k >= 0 ? ' is-on' : '') + '" data-feed-pick="' + n + '" aria-pressed="' + (k >= 0) + '"' + (full ? ' disabled' : '') + '>' +
              (own ? '<img src="assets/eng/img/' + esc(own) + '" alt="" loading="lazy">' : '<span class="eng-fi__noimg">' + esc(mm.where || '') + '</span>') +
              '<b>' + esc(mm.title) + '</b>' + (k >= 0 ? '<em>Paragraph ' + (k + 1) + '</em>' : '') + '</button>';
          }).join('') + '</div>',
          act: pickedN >= 3 ? fBtn('data-feed-next', 'Watch your scenes ↓') : '' }));
        cpwSlots(W).forEach(function (s) {
          var txt = slotText(W, s), para = typeof s === 'number' ? W.paras[s] : null, sc = para && para.scene ? G.scenes[para.scene] : null, rp = sc ? sc.reps[para.rep || 0] : null, m = para && para.scene ? mo[para.scene - 1] : null;
          tot += wordsIn(txt);
          var act = fBtn('data-cpw="' + s + '"', txt ? 'Edit' : 'Write it', !!txt), rail = fRailBtn(FICON.pen, txt ? 'Edit' : 'Write', '', 'data-cpw="' + s + '"');
          if (s === 'end') { if (tot) act += fBtn('data-cpw-copy', 'Copy part (a)', true); if (st < 3) act += fBtn('data-cp-stage="3"', 'Next: part (b) →'); }
          if (m && rp) { items.push(fScene(a, s, m, sc, rp, act, rail)); return; }
          if (para) {
            items.push(fItem({ step: 2, c: COL[a], tag: 'Part (a) · ' + slotName(s), title: 'No scene yet', text: 'Pick its scene on the scenes screen first.',
              act: fBtn('data-feed-goto="scenes"', '↑ Pick your scenes') + (s === 3 ? fBtn('data-cpw-drop', 'Remove paragraph 4', true) : ''), rail: rail }));
            return;
          }
          items.push(fItem({ step: 2, bg: mos.length ? mos : [fHero(a)], c: COL[a], tag: 'Part (a) · ' + slotName(s), title: s === 'open' ? 'Your opening' : 'Your ending',
            text: txt ? esc(txt) : s === 'open' ? (pickedN >= 3 ? 'Name the film and its director, answer the question, and say your points.' : 'Pick your scenes first, then write the opening.') : 'Sum it all up: what the film finally says about ' + esc(th.name.toLowerCase()) + '.',
            act: act + (s === 'end' && tot ? '<span class="eng-fi__count">Part (a): ' + tot + ' words</span>' : ''), rail: rail }));
        });
      } else {
        items.push(fItem({ step: 2, bg: [fHero(a)], c: COL[a], tag: 'Part (a) · ' + esc(text(a).title), title: 'Pick three points', cls: 'is-pick',
          html: '<div class="eng-fi__opts">' + th.points[a].map(function (pt, i) {
            var on = w.pts.indexOf(i) >= 0;
            return '<button type="button" class="eng-fi__opt is-text' + (on ? ' is-on' : '') + '" data-cp-pt="' + i + '" aria-pressed="' + on + '"><span><b>' + esc(pt.title) + '</b>' + (on ? '<em>✓ Picked</em>' : '') + '</span></button>';
          }).join('') + '</div>', act: st < 3 ? fBtn('data-cp-stage="3"', 'Next: part (b) →') : '' }));
      }
      // the pairs
      if (st >= 3) {
        var F = cpbOrder(B), L = cpLinks(th, F[0], F[1]).map(function (l) { var x = tidOf(l.a) === F[0] ? l.a : l.b; return { l: l, x: x, y: x === l.a ? l.b : l.a }; });
        L.sort(function (p1, p2) { return mom(p1.x).n - mom(p2.x).n; });
        var n = w.links.length, used = {};
        w.links.forEach(function (l) { used[l.a] = 1; used[l.b] = 1; });
        var picked = function (q) { return w.links.some(function (l) { return [l.a, l.b].sort().join() === [q.x, q.y].sort().join(); }); };
        items.push(fItem({ step: 3, bg: [fHero(F[0]), fHero(F[1])], labels: [[shortTitle(F[0]), COL[F[0]]], [shortTitle(F[1]), COL[F[1]]]], c: '#FF8FB1', tag: 'Part (b) · ' + esc(shortTitle(F[0])) + ' and ' + esc(shortTitle(F[1])),
          title: 'Pick your pairs', text: 'Swipe through the best matches. Tap ❤ on three or four: each one is a paragraph.',
          act: '<span class="eng-fi__count">' + n + ' of 3–4 picked</span>' + fBtn('data-cp-swap', esc(shortTitle(F[1])) + ' first ⇄', true) }));
        L.forEach(function (q) {
          var on = picked(q), clash = !on && (used[q.x] || used[q.y]), full = !on && n >= 4;
          var attr = 'data-feed-pair="' + q.l.a + '|' + q.l.b + '"' + (clash || full ? ' disabled' : '') + ' aria-pressed="' + on + '"';
          items.push(fItem({ step: 3, bg: [fPic(q.x), fPic(q.y)], labels: [[shortTitle(F[0]) + ': ' + mom(q.x).m.title, COL[F[0]]], [shortTitle(F[1]) + ': ' + mom(q.y).m.title, COL[F[1]]]],
            c: '#FF8FB1', cls: on ? 'is-picked' : '', tag: on ? '❤ Picked' : 'A pair', title: esc(q.l.aspect), text: esc(q.l.say),
            act: fBtn(attr, on ? '✓ Picked · tap to remove' : clash ? 'One of these scenes is already paired' : full ? 'Four pairs already' : '❤ Pick this pair', on),
            rail: fRailBtn(FICON.heart, on ? 'Picked' : 'Pick', ' is-heart' + (on ? ' is-on' : ''), attr) }));
        });
      }
      // the plan
      if (st >= 4) {
        var cb = cpbCtx(), Wb = cb.W;
        var rows = ['<li><b>Opening</b><span>Both texts and authors; answer the question</span></li>'].concat(Wb.paras.map(function (q, k) {
          var L2 = cpbLink(th, q.x, q.y);
          return '<li><b>Paragraph ' + (k + 1) + '</b><span>' + esc(L2 ? L2.aspect : 'Your own link') + (q.x && q.y ? '<i>' + esc(mom(q.x).m.title) + ' · ' + esc(mom(q.y).m.title) + '</i>' : '') + '</span></li>';
        })).concat(['<li><b>Ending</b><span>Which text does it more powerfully, and why</span></li>']);
        items.push(fItem({ step: 4, c: '#58CC02', tag: 'Part (b)', title: 'Your plan', cls: 'is-pick is-plan',
          html: '<ol class="eng-fi__plan">' + rows.join('') + '</ol>', act: st < 5 ? fBtn('data-cp-stage="5"', 'Next: write part (b) →') : '' }));
      }
      // part (b), a paragraph per item
      if (st >= 5) {
        var cc = cpbCtx(), W2 = cc.W, F2 = cc.F, tot2 = 0;
        cpbSlots(W2).forEach(function (s2) {
          var txt2 = cpbText(W2, s2), q2 = typeof s2 === 'number' ? W2.paras[s2] : null, L3 = q2 ? cpbLink(th, q2.x, q2.y) : null;
          tot2 += wordsIn(txt2);
          var act2 = fBtn('data-cpbw="' + s2 + '"', txt2 ? 'Edit' : 'Write it', !!txt2);
          if (typeof s2 === 'number' && s2 === W2.paras.length - 1) act2 += W2.paras.length < 4 ? fBtn('data-cpb-add', '+ Paragraph 4', true) : fBtn('data-cpb-drop', 'Remove paragraph 4', true);
          if (s2 === 'end' && tot2) act2 += fBtn('data-cpb-copy', 'Copy part (b)', true) + '<span class="eng-fi__count">Part (b): ' + tot2 + ' words</span>';
          items.push(fItem({ step: 5, bg: q2 && q2.x && q2.y ? [fPic(q2.x), fPic(q2.y)] : [fHero(F2[0]), fHero(F2[1])],
            labels: q2 && q2.x && q2.y ? [[shortTitle(F2[0]) + ': ' + mom(q2.x).m.title, COL[F2[0]]], [shortTitle(F2[1]) + ': ' + mom(q2.y).m.title, COL[F2[1]]]] : null,
            c: '#FF8FB1', tag: 'Part (b) · ' + (s2 === 'open' ? 'Opening' : s2 === 'end' ? 'Ending' : 'Paragraph ' + (s2 + 1)),
            title: L3 ? esc(L3.aspect) : s2 === 'open' ? 'Your opening' : s2 === 'end' ? 'Your ending' : 'Pick the two scenes',
            text: txt2 ? esc(txt2) : s2 === 'open' ? 'Name both texts and their authors, answer the question, and say your points.' : s2 === 'end' ? 'Your judgement: which text does it more powerfully, and why.' : 'Pick a scene from each text, then write it.',
            act: act2, rail: fRailBtn(FICON.pen, txt2 ? 'Edit' : 'Write', '', 'data-cpbw="' + s2 + '"') }));
        });
      }
    }
    FEED_ON = true;
    document.documentElement.classList.remove('eng-snap', 'eng-snapfx');
    app.innerHTML = '<div class="eng-feed" data-feed>' + items.join('') + '</div>';
    var fd = app.querySelector('[data-feed]');
    fd.scrollTop = y;
    if (FEED_GO) { var go = fd.querySelector('[data-fstep="' + FEED_GO + '"]'); FEED_GO = 0; if (go) requestAnimationFrame(function () { fd.scrollTo({ top: go.offsetTop, behavior: 'smooth' }); }); }
    fd.addEventListener('scroll', function () {
      FEED_Y = fd.scrollTop;
      cpFeedStep();
      if (GUIDE.open && GUIDE.fy != null && Math.abs(fd.scrollTop - GUIDE.fy) > 80) { GUIDE.open = false; guideRender(); }
      if (!GUIDE.open) GUIDE.fy = null;
    }, { passive: true });
    GUIDE.fy = fd.scrollTop;
    if (window.IntersectionObserver) {
      var fio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) fPlay(e.target); else if (FPL.el === e.target) fStop(); }); }, { root: fd, threshold: 0.6 });
      Array.prototype.forEach.call(fd.querySelectorAll('.eng-fi.is-play'), function (x) { fio.observe(x); });
    } else Array.prototype.forEach.call(fd.querySelectorAll('.eng-fi.is-play'), function (x) { fSkip(x); });
    CP_ST = st;
    cpFeedStep();
    guideDraw(st, th, a, B);
    railDraw();
  }
  function cpFeedStep() { var fa = feedAt(); if (fa && fa.its.length) cpStepsSync(+fa.its[fa.k].getAttribute('data-fstep') || 1); }
  // The item on screen, and the next one.
  function feedAt() {
    var fd = app.querySelector('[data-feed]');
    if (!fd) return null;
    var its = fd.querySelectorAll('.eng-fi'), k = Math.round(fd.scrollTop / Math.max(1, fd.clientHeight));
    return { fd: fd, its: its, k: Math.min(its.length - 1, Math.max(0, k)) };
  }
  function feedPair(ab) {
    var th = cpTheme(), a = cpBy(th).a, w = cpWork(th, a), x = ab.split('|'), at = -1;
    w.links.forEach(function (l, k) { if ([l.a, l.b].sort().join() === x.slice().sort().join()) at = k; });
    if (at >= 0) w.links.splice(at, 1);
    else {
      var L = cpFind(th, x[0], x[1]);
      if (!L || w.links.length >= 4 || w.links.some(function (l) { return x.indexOf(l.a) >= 0 || x.indexOf(l.b) >= 0; })) return;
      w.links.push({ a: L.a, b: L.b, rel: L.rel });
    }
    cpSave(); renderCompare();
  }
  window.addEventListener('resize', function () { if (/^#compare/.test(location.hash) && !CPW && isPhone() !== FEED_ON) renderCompare(); });
  function renderCompare() {
    renderShell('compare', 'Compare it');
    var th = cpTheme();
    if (!th) { app.innerHTML = title('Compare it') + '<p class="eng-p">Coming soon.</p>'; return; }
    var ids = cpTexts(th), by = cpBy(th), a = ids.indexOf(by.a) >= 0 ? by.a : null;
    var swapped = chosen().some(function (id) { return ids.indexOf(id) < 0; });
    var w = a ? cpWork(th, a) : null, B = a ? ids.filter(function (id) { return id !== a; }) : [], st = cpStage(th, a, w);
    CP_ST = st;
    if (isPhone()) { cpTop(st, 1, true); renderFeed(th, ids, by, a, w, B, st, swapped); return; }
    FEED_ON = false;
    cpTop(st, st, false);
    var h = '<header class="cpx-head">' + title('Compare it') +
      '<p class="cpx-head__theme"><span>Theme or Issue</span> <b>' + esc(th.name) + '</b> · a 30 + 40 answer</p>' +
      (swapped ? '<p class="cpx-head__note">Using ' + ids.map(function (id) { return '<i>' + esc(text(id).title) + '</i>'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' for this one.</p>' : '') + '</header>' +
      '<h2 class="eng-h2"><span class="eng-cp__n">1</span>Pick your part (a) text</h2>' +
      '<div class="eng-cp__texts">' + ids.map(function (id) {
        var p = pics(id).filter(function (x) { return x.hero; })[0] || pics(id)[0];
        return '<button type="button" class="eng-cpt" data-cp-a="' + id + '" aria-pressed="' + (id === a) + '" style="--c:' + COL[id] + '">' +
          (p ? '<img src="assets/eng/img/' + esc(p.file) + '" alt="" loading="lazy">' : '<span class="eng-cpt__img"></span>') +
          '<span class="eng-cpt__t">' + esc(text(id).title) + '</span>' + (id === th.best ? '<span class="eng-cpt__best">Best for (a)</span>' : '') + '</button>';
      }).join('') + '</div>';
    if (CP_FOLD_ST !== st) { CP_FOLD_ST = st; CP_UNFOLD = {}; }
    if (!a) { CP_ST = 1; app.innerHTML = cpPage(h); cpSnap(); guideDraw(1, th, null, []); cpNavShow(); railDraw(); return; }
    // 2: part (a): written in the popup if the text has a writing guide, else three points to pick
    var WR = th.write && th.write[a];
    if (WR) h += cpWriterHtml(th, a);
    else h += '<h2 class="eng-h2"><span class="eng-cp__n">2</span>Part (a): three points about <i>' + esc(text(a).title) + '</i></h2>' +
      '<p class="eng-p">Pick three. <b data-cp-count>' + w.pts.length + ' of 3 picked</b></p>' +
      '<div class="eng-cp__pts">' + th.points[a].map(function (pt, i) {
        var on = w.pts.indexOf(i) >= 0;
        return '<div class="eng-cpp' + (on ? ' is-on' : '') + '" style="--c:' + COL[a] + '"><button type="button" class="eng-cpp__b" data-cp-pt="' + i + '" aria-pressed="' + on + '">' +
          '<span class="eng-cpp__tick" aria-hidden="true">' + (on ? w.pts.indexOf(i) + 1 : '+') + '</span><span class="eng-cpp__t">' + esc(pt.title) + '</span></button>' +
          '<p>' + esc(pt.say) + '</p><p class="eng-cpp__m">' + pt.m.map(function (n) { return momChip(text(a).moments[n - 1].id); }).join('') + '</p></div>';
      }).join('') + '</div>';
    // What each finished step says when it is folded to one line.
    var sums = [[esc(text(a).title), 'Change']], doneA;
    if (WR) {
      var Wa = cpWrite(th, a), sl = cpwSlots(Wa), nw = sl.filter(function (x) { return slotText(Wa, x); }).length;
      doneA = nw === sl.length;
      sums.push([nw + ' of ' + sl.length + ' parts written · ' + sl.reduce(function (n, x) { return n + wordsIn(slotText(Wa, x)); }, 0) + ' words', 'Open']);
    } else { doneA = w.pts.length >= 3; sums.push([w.pts.length + ' of 3 points picked', 'Change']); }
    sums.push([w.links.length + (w.links.length === 1 ? ' pair' : ' pairs'), 'Change'], [w.links.length + ' paragraphs, with an opening and an ending', 'Open']);
    if (st < 3) h += cpNext(3, 'Next: part (b)', doneA);
    if (st >= 3) {
      var F = cpbOrder(B);
      h += cpBoardHtml(th, w, F, cpLinks(th, F[0], F[1]));
      if (st >= 4) { h += cpPlanB(th, a, F); if (st < 5) h += cpNext(5, 'Next: write part (b)', true); }
      if (st >= 5) h += cpbWriterHtml();
    }
    CP_ST = st;
    app.innerHTML = cpPage(h, sums);
    cpSnap();
    if (st >= 3) requestAnimationFrame(cpLines);
    guideDraw(st, th, a, B);
    cpNavShow();
    railDraw();
  }
  function cpNavShow() { cpQSync(); }
  // 3: pick your scenes. One big line says what to do next; after the first tap, the scenes it links to glow and the rest
  // fade; tapping one of those makes the pair. Swap puts the other text first.
  function cpBoardHtml(th, w, F, L) {
    // Each scene goes in one pair only (the user: "i also shouldnt be able to link 2 to 1"): a paired scene is marked used,
    // never glows as a match, and tapping it says which pair it's in.
    var n = w.links.length, partners = {}, used = {};
    w.links.forEach(function (l, k) { used[l.a] = used[l.a] || k + 1; used[l.b] = used[l.b] || k + 1; });
    if (CPSEL) L.forEach(function (l) { if (l.a === CPSEL && !used[l.b]) partners[l.b] = 1; if (l.b === CPSEL && !used[l.a]) partners[l.a] = 1; });
    var col = function (id) {
      var ms = [];
      L.forEach(function (l) { [l.a, l.b].forEach(function (m) { if (tidOf(m) === id && ms.indexOf(m) < 0) ms.push(m); }); });
      ms.sort(function (x, y) { return mom(x).n - mom(y).n; });
      return '<div class="eng-cpb__col" style="--c:' + COL[id] + '"><h3>' + esc(text(id).title) + '</h3>' + ms.map(function (mid) {
        var o = mom(mid), nums = [], pic = scenePics(id, mid)[0], st = CPSEL && tidOf(CPSEL) !== id ? (partners[mid] ? ' is-hint' : ' is-dim') : (CPHINT === mid ? ' is-hint' : '');
        if (used[mid]) st += ' is-used';
        w.links.forEach(function (l, k) { if (l.a === mid || l.b === mid) nums.push(k + 1); });
        return '<button type="button" class="eng-cpm' + st + '" data-cpm="' + mid + '" aria-pressed="' + (CPSEL === mid) + '">' +
          (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '<span class="eng-cpm__ph" aria-hidden="true"></span>') +
          '<span class="eng-cpm__b"><span class="eng-cpm__t">' + esc(o.m.title) + '</span>' + (nums.length ? '<span class="eng-cpm__used">Paired</span>' : '') + '</span></button>';
      }).join('') + '</div>';
    };
    var other = CPSEL ? F.filter(function (x) { return x !== tidOf(CPSEL); })[0] : null, pr;
    if (CPSEL) pr = ['Now pick one to link it with', other];
    else if (n >= 4) pr = ['Four pairs: that\'s your part (b)', null];
    else if (n >= 3) pr = ['That\'s ' + n + ' pairs. Add one more, or check your plan below', null];
    else if (n) pr = ['Pick your next scene', F[0]];
    else pr = ['Pick a scene', F[0]];
    return '<h2 class="eng-h2"><span class="eng-cp__n">3</span><span class="eng-cpk-t"><span>Pick</span> <span>your</span> <span>scenes</span></span></h2>' +
      '<div class="eng-cpk"><p class="eng-cpk__p" style="--c:' + (pr[1] ? COL[pr[1]] : 'var(--m-theme)') + '" aria-live="polite">' + esc(pr[0]) + (pr[1] ? ' in <i>' + esc(shortTitle(pr[1])) + '</i>' : '') +
        (n ? ' <span class="eng-cpk__n">' + n + ' of 3–4</span>' : '') + '</p>' +
        '<button type="button" class="eng-btn eng-cpk__swap" data-cp-swap aria-label="Swap: put ' + esc(shortTitle(F[1])) + ' first"><i style="--c:' + COL[F[0]] + '">' + esc(shortTitle(F[0])) + '</i><span aria-hidden="true">⇄</span><i style="--c:' + COL[F[1]] + '">' + esc(shortTitle(F[1])) + '</i></button></div>' +
      (CPFB ? '<div class="eng-cpf eng-cpf--' + CPFB.kind + '" role="status"><b>' + esc(CPFB.head) + '</b> ' + esc(CPFB.body || '') + '</div>' : '') +
      '<div class="eng-cpb" data-cpb>' + col(F[0]) + '<svg class="eng-cpb__lines" aria-hidden="true"></svg>' + col(F[1]) + '</div>' +
      (n ? '<ol class="eng-cpl eng-cpl--mini">' + w.links.map(function (l, k) {
        var x = cpFind(th, l.a, l.b), left = tidOf(l.a) === F[0] ? l.a : l.b, right = left === l.a ? l.b : l.a;
        return '<li class="eng-cpl__i eng-cpl--' + x.rel + '"><div><p class="eng-cpl__m">' + momChip(left) + momChip(right) + '</p>' +
          '<p class="eng-cpl__h"><b>' + esc(x.aspect) + '</b></p></div>' +
          '<button type="button" class="eng-cpl__x" data-cp-del="' + k + '" aria-label="Remove pair ' + (k + 1) + '">×</button></li>';
      }).join('') + '</ol>' : '') +
      (n ? '<p class="eng-btns eng-cp__tools"><button type="button" class="eng-btn eng-btn--quiet" data-cp-reset>Start again</button></p>' : '');
  }
  // 4: your plan, simple: the opening, a paragraph for each pair (its two scenes and what they share), the ending.
  function cpPlanB(th, a, F) {
    var W = cpWriteB(th, a, F), name = th.name.toLowerCase(), rows = [['Opening', 'Name both texts and their authors, and answer the question.']];
    W.paras.forEach(function (q, k) {
      if (!q.x || !q.y) return;
      var L2 = cpbLink(th, q.x, q.y);
      rows.push(['Paragraph ' + (k + 1), L2 ? L2.aspect : 'Your own link', [q.x, q.y]]);
    });
    rows.push(['Ending', 'Which text shows ' + name + ' more powerfully, and why.']);
    return '<h2 class="eng-h2"><span class="eng-cp__n">4</span>Your plan</h2><ol class="eng-cpn2">' + rows.map(function (r) {
      return '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span>' + (r[2] ? '<span class="eng-cpn2__m">' + r[2].map(momChip).join('') + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function cpSwap(th) {
    var by = cpBy(th), B = cpTexts(th).filter(function (id) { return id !== by.a; }), F = cpbOrder(B);
    by.bFirst = F[1];
    var Wb = cpWork(th, by.a).writeB;
    if (Wb) Wb.paras.forEach(function (q) { var t1 = q.x; q.x = q.y; q.y = t1; q.parts = q.parts || {}; var p1 = q.parts.x; q.parts.x = q.parts.y; q.parts.y = p1; });
    CPSEL = null; CPFB = null; CPHINT = null;
  }
  // The examiner's tips for the step you're on: one short line at a time, "1 of 4" with arrows (the user: "every big piece
  // of information ... should come in smaller parts as you go along ... put some of it in that examiner in the side and
  // on the top can be '1 of 5' and arrows back and forth ... so its like the examiner is talking to you"). He sits in the
  // paper strip at the top (`cpTop`), his head on its bottom edge, and the tip is his note in red pen beside him: part of
  // the page, not over it. A rule that costs marks is tagged Rule and he looks angry. Tap his head to hide or show the
  // tips. Hidden while a writing popup is open (the popup covers the strip).
  var GUIDE = { stage: 0, i: 0, open: true, key: '', tips: [] }, GUIDE_EL = null;
  function guideTips(st, th, a, B) {
    var F = B.length ? cpbOrder(B) : [], s = function (id) { return shortTitle(id); }, name = th.name.toLowerCase();
    if (st <= 1) return [{ t: 'This is a 30 + 40 answer on ' + name + '.' }, { t: 'Part (a) is one text on its own: 30 marks.' }, { t: 'Part (b) compares your other two texts: 40 marks.' },
      { t: firstSentence(th.bestWhy) }, { t: 'Tap the text you want for part (a).' }];
    if (st === 2) return [{ t: 'Part (a) is ' + text(a).title + ' on its own.' }, { t: 'Tap Write it on the Opening first: you pick your scenes there.' },
      { t: 'Each paragraph: Point, Anchor, Evaluate. Most of the marks are in Evaluate.' }, { t: 'Aim for about 450 words.' }, { t: 'Done, or ready for part (b)? Tap Next: part (b).' }];
    if (st === 3) return [{ t: 'Part (b) is ' + s(F[0]) + ' and ' + s(F[1]) + ' only. ' + s(a) + ' gets no marks here.', rule: true },
      { t: 'Tap a scene, then the one it links to. The ones outlined in red are matches.' }, { t: 'Each pair is one paragraph. Get three or four.' }, { t: 'Want ' + s(F[1]) + ' first? Tap the swap button.' }];
    if (st === 4) return [{ t: 'Your plan: one paragraph for each pair, in this order.' }, { t: 'Opening: name both texts and their authors, and answer the question.' },
      { t: 'Ending: say which text does it more powerfully, and why.' }, { t: 'Happy with it? Tap Next: write part (b).' }];
    return [{ t: 'Write about both texts together in every paragraph. Not one, then the other.', rule: true }, { t: 'Each paragraph: Point, ' + s(F[0]) + ', ' + s(F[1]) + ', Compare, Evaluate.' },
      { t: 'Compare using words such as “Similarly”, “Whereas” or “Even more so”.' }, { t: 'Aim for about 650 words in part (b).' }];
  }
  // Phones (the feed): the tip opens under the strip when you reach a step and folds to his head as soon as you swipe
  // (the user: "this is fucking in my face still when i said i want it to be SCROLLED"); the feed's own scroll does that.
  // On the page he is in the strip, over nothing, so the tip stays while you scroll.
  function guideDraw(st, th, a, B) {
    if (!GUIDE_EL) {
      GUIDE_EL = document.createElement('div'); GUIDE_EL.id = 'cpx-guide'; GUIDE_EL.className = 'cpx-ex'; GUIDE_EL.setAttribute('data-mood', 'ok');
      GUIDE_EL.addEventListener('click', function (e) { var b = e.target.closest('[data-guide]'); if (b && !b.disabled) guideClick(b.getAttribute('data-guide')); });
      window.addEventListener('hashchange', function () { if (GUIDE_EL.parentNode && !/^#compare/.test(location.hash)) GUIDE_EL.remove(); });
      if (window.ResizeObserver) new ResizeObserver(cpTopSize).observe(bar);
    }
    if (!guideMount()) return;
    if (GUIDE.stage !== st) { GUIDE.stage = st; GUIDE.i = 0; GUIDE.open = true; }
    GUIDE.tips = guideTips(st, th, a, B);
    guideRender();
  }
  // Every render redraws the strip (`cpTop`), which puts him straight back in its slot as he is, so the strip keeps its
  // height and he doesn't type his tip again; he types again only on arriving at the page.
  function guideMount() {
    var slot = bar.querySelector('[data-cpx-guide]');
    if (!slot || !GUIDE_EL) return !!slot;
    if (!GUIDE_EL.parentNode) GUIDE.key = '';
    if (GUIDE_EL.parentNode !== slot) slot.appendChild(GUIDE_EL);
    return true;
  }
  // The strip's height, for the menu drawer that opens under it.
  function cpTopSize() { if (document.body.classList.contains('eng-papertop')) document.documentElement.style.setProperty('--cpx-h', bar.offsetHeight + 'px'); }
  function guideRender() {
    var g = GUIDE, el = GUIDE_EL, i = Math.min(g.i, g.tips.length - 1), tip = g.tips[i], key = g.stage + '/' + i + '/' + g.open + '/' + tip.t;
    var strip = bar.querySelector('.cpx');
    if (strip) strip.classList.toggle('is-open', g.open);
    if (key === g.key) { cpTopSize(); return; }
    g.key = key;
    clearInterval(el.typer); el.classList.remove('is-talking');
    el.classList.toggle('is-open', g.open); el.classList.toggle('is-rule', !!(g.open && tip.rule));
    el.setAttribute('data-mood', g.open && tip.rule ? 'angry' : 'ok');
    var fig = '<button type="button" class="cpx-ex__fig" data-guide="toggle" aria-expanded="' + g.open + '" aria-label="' + (g.open ? 'Hide the examiner\'s tips' : 'Show the examiner\'s tips') + '">' +
      (window.ExamTeacher ? window.ExamTeacher.head('right') : '') + '</button>';
    // The whole tip is there from the start, unseen, so the strip is its final height before the typing begins.
    var say = g.open ? '<div class="cpx-ex__say">' + (tip.rule ? '<b class="cpx-ex__rule">Rule</b>' : '') +
        '<p class="cpx-ex__line"><span class="cpx-ex__ghost" aria-hidden="true">' + esc(tip.t) + '</span><span class="cpx-ex__typed" aria-live="polite"></span></p>' +
        '<p class="cpx-ex__nav"><button type="button" data-guide="prev" aria-label="Previous tip"' + (i ? '' : ' disabled') + '>‹</button>' +
        '<span>' + (i + 1) + ' of ' + g.tips.length + '</span><button type="button" data-guide="next" aria-label="Next tip"' + (i < g.tips.length - 1 ? '' : ' disabled') + '>›</button></p></div>'
      : '<button type="button" class="cpx-ex__tips" data-guide="toggle">Tips</button>';
    el.innerHTML = fig + say;
    cpTopSize();
    var line = el.querySelector('.cpx-ex__typed');
    if (!line) return;
    var full = tip.t, n = 0;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { line.textContent = full; return; }
    el.classList.add('is-talking');
    el.typer = setInterval(function () { n += 2; line.textContent = full.slice(0, n); if (n >= full.length) { clearInterval(el.typer); el.classList.remove('is-talking'); } }, 20);
  }
  function guideClick(what) {
    var g = GUIDE;
    if (what === 'prev') g.i = Math.max(0, g.i - 1);
    else if (what === 'next') g.i = Math.min(g.tips.length - 1, g.i + 1);
    else if (what === 'toggle') { g.open = !g.open; var fa = feedAt(); g.fy = g.open && fa ? fa.fd.scrollTop : null; }
    guideRender();
    var b = GUIDE_EL.querySelector('[data-guide="' + what + '"]:not([disabled])') || GUIDE_EL.querySelector('[data-guide="toggle"]');
    if (b) b.focus({ preventScroll: true });
  }
  // The page: each step in its own section (for the line joining them), sliding in when you arrive (CP_ENTER).
  // A finished step folds to one line (the user: the page kept every finished step, about 5,600px tall at step 5, and
  // they agreed to "finished steps fold to one line each"): its tick, its name, what you chose, and Change or Open. Tap
  // the line, or its tick box in the strip, to open it again; tap it once more to fold it. A step is finished once you
  // have moved past it, except that the scene board stays open beside the plan it feeds (step 3 while you are on step 4).
  // Opened steps close again when you move on a step. The folded step's content stays in the page, hidden, so nothing
  // that looks it up breaks.
  var CP_ENTER = false, CP_UNFOLD = {}, CP_FOLD_ST = 0;
  function cpDone(n) { return n < CP_ST && !(CP_ST === 4 && n === 3); }
  function cpFolded(n) { return cpDone(n) && !CP_UNFOLD[n]; }
  function cpPage(h, sums) {
    var mark = '<h2 class="eng-h2"><span class="eng-cp__n">', parts = h.split(mark), enter = CP_ENTER;
    CP_ENTER = false;
    var k = 0;
    var tag = function (x) { return x.replace(/class="(eng-cpw__s(?: is-done)?|eng-cpm(?: is-hint)?)"/g, function (all) { return all + ' style="--i:' + (k++ % 12) + '"'; }); };
    var last = parts.length - 2;
    return '<div class="eng-cmpg' + (enter ? ' is-enter' : '') + '">' + tag(parts[0]) + parts.slice(1).map(function (x, i) {
      var n = i + 1, sum = sums && sums[i] && cpDone(n) ? sums[i] : null, fold = sum && cpFolded(n);
      var row = sum ? '<button type="button" class="cpx-fold" data-cp-fold="' + n + '" aria-expanded="' + !fold + '"><i aria-hidden="true"></i><b>' + esc(CP_STEPS[i]) + '</b><span>' + sum[0] + '</span><em>' + (fold ? sum[1] : 'Fold away') + '</em></button>' : '';
      return '<section class="eng-cp__step' + (CP_SEEN[i] ? ' is-in' : '') + (fold ? ' is-folded' : '') + (sum ? ' is-past' : ' is-now') + '" style="--i:' + i + '" data-step-i="' + i + '"' + (i < last ? ' data-next="' + esc(CP_STEPS[i + 1]) + '"' : '') + '>' + row + mark + tag(x) + '</section>';
    }).join('') + '</div>';
  }
  // Phones: the Compare page one step per screen, like TikTok (the user: "do you know what tiktok is?? the SCROLL feature
  // you see one part on your screen and then the next fucking part"): each step fills the screen, the page snaps from one
  // to the next, each step fades in the first time it arrives, and the bottom of a step says which one is next.
  var CP_SEEN = {}, cpIO = null;
  // Phones: the tools as a TikTok-style rail of round buttons down the right side (the user: "you know the like share
  // follow repost", and chose "Tools in a side rail"), instead of sitting on the page: the examiner (his tips; "Stuck?" in
  // the writing popup), the exam question, which step you're on (tap for the list) and Next. The step bar, the pinned
  // question and the examiner in the corner go on phones; the laptop keeps them.
  var RAIL = null, SHEET = null, CP_ST = 1;
  var RICON = {
    q: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.5l-2.6-1.7-2.5 1.7-2.4-1.7-2.5 1.7-2.5-1.7V5A1.5 1.5 0 0 1 7 3.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    steps: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m3 12 9 4.5 9-4.5M3 16l9 4.5 9-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9.5 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function railOn() { return isPhone() && /^#compare/.test(location.hash) && !document.body.classList.contains('eng-story-on') && (!!CPW || !app.querySelector('[data-feed]')); }
  // The step on screen: the last one whose top is above the middle of the screen.
  function cpStepAt() {
    var k = 0, mid = window.innerHeight * 0.45;
    Array.prototype.forEach.call(app.querySelectorAll('.eng-cp__step'), function (el, i) { if (el.getBoundingClientRect().top < mid) k = i; });
    return k;
  }
  function railDraw() {
    if (!railOn()) { if (RAIL) { RAIL.remove(); RAIL = null; } sheetClose(); return; }
    if (!RAIL) {
      RAIL = document.createElement('nav'); RAIL.id = 'eng-rail'; RAIL.setAttribute('aria-label', 'Tools');
      RAIL.addEventListener('click', function (e) { var b = e.target.closest('[data-rail]'); if (b && !b.disabled) railClick(b.getAttribute('data-rail')); });
    }
    if (!RAIL.parentNode) document.body.appendChild(RAIL);
    var head = window.ExamTeacher ? window.ExamTeacher.head('left') : '';
    var btn = function (k, icon, label, dis) {
      return '<button type="button" class="eng-rail__b' + (k === 'tips' || k === 'stuck' ? ' is-me' : '') + '" data-rail="' + k + '"' + (dis ? ' disabled' : '') + '><span class="eng-rail__i">' + icon + '</span><b data-rail-l="' + k + '">' + label + '</b></button>';
    };
    if (CPW) { RAIL.innerHTML = btn('stuck', head, 'Stuck?') + btn('q', RICON.q, 'Question'); return; }
    RAIL.innerHTML = btn('tips', head, 'Tips') + btn('q', RICON.q, 'Question') + btn('steps', RICON.steps, '') + btn('next', RICON.next, 'Next');
    railSync();
  }
  // As you scroll: which step you're on, and whether there's a next one.
  function railSync() {
    if (!RAIL || CPW) return;
    var n = app.querySelectorAll('.eng-cp__step').length, k = cpStepAt(), l = RAIL.querySelector('[data-rail-l="steps"]'), nx = RAIL.querySelector('[data-rail="next"]');
    if (l) l.textContent = 'Step ' + (k + 1) + '/' + CP_STEPS.length;
    if (nx) nx.disabled = k >= n - 1;
  }
  function railClick(k) {
    if (k === 'tips') { GUIDE.open = !GUIDE.open; GUIDE.y0 = window.scrollY; guideRender(); return; }
    if (k === 'stuck') { tchEl(); if (TCH.typing) tchDone(); tchHelp(TCH.classList.contains('is-helping')); return; }
    if (k === 'q' || k === 'steps') { sheetOpen(k); return; }
    if (k === 'next') { var i = cpStepAt(); if (i < app.querySelectorAll('.eng-cp__step').length - 1) cpScrollTo(i + 2); }
  }
  // A sheet that slides up from the bottom: the question (both parts, the one you're on first), or the steps to jump to.
  function sheetOpen(kind) {
    sheetClose();
    var fa = feedAt(), part = CPW ? (CPW.part === 'b' ? 'b' : 'a') : fa ? (+fa.its[fa.k].getAttribute('data-fstep') >= 3 ? 'b' : 'a') : (cpStepAt() >= 2 ? 'b' : 'a'), other = part === 'a' ? 'b' : 'a', inner;
    if (kind === 'q') {
      inner = '<h3>The question</h3><p class="eng-cpq is-full eng-sheet__now"><span>' + cpQIn(part).replace(/^<span>|<\/span>$/g, '') + '</span></p>' +
        '<p class="eng-cpq is-full eng-sheet__other"><span>' + cpQIn(other).replace(/^<span>|<\/span>$/g, '') + '</span></p>';
    } else {
      var at = cpStepAt();
      inner = '<h3>Steps</h3><ol class="eng-sheet__steps">' + CP_STEPS.map(function (x, i) {
        var open = i + 1 <= CP_ST, here = i === at;
        return '<li><button type="button" data-sheet-go="' + (i + 1) + '"' + (open ? '' : ' disabled') + ' class="' + (here ? 'is-here' : '') + '">' + esc(x) +
          '<em>' + (here ? 'You\'re here' : open ? (i < at ? '✓' : '') : 'Locked') + '</em></button></li>';
      }).join('') + '</ol>';
    }
    SHEET = document.createElement('div'); SHEET.id = 'eng-sheet';
    SHEET.innerHTML = '<div class="eng-sheet__bg" data-sheet-close></div><div class="eng-sheet__p" role="dialog" aria-modal="true" aria-label="' + (kind === 'q' ? 'The question' : 'Steps') + '">' +
      '<button type="button" class="eng-sheet__x" data-sheet-close aria-label="Close">×</button>' + inner + '</div>';
    SHEET.addEventListener('click', function (e) {
      var g = e.target.closest('[data-sheet-go]');
      if (g && !g.disabled) { sheetClose(); cpScrollTo(+g.getAttribute('data-sheet-go')); return; }
      if (e.target.closest('[data-sheet-close]')) sheetClose();
    });
    document.body.appendChild(SHEET);
    var x = SHEET.querySelector('.eng-sheet__x'); if (x) x.focus({ preventScroll: true });
  }
  function sheetClose() { if (SHEET) { SHEET.remove(); SHEET = null; } }
  window.addEventListener('scroll', function () { if (RAIL) railSync(); }, { passive: true });
  window.addEventListener('resize', function () { railDraw(); });
  window.addEventListener('hashchange', function () { railDraw(); });
  document.addEventListener('keydown', function (e) { if (SHEET && e.key === 'Escape') { e.stopPropagation(); sheetClose(); } }, true);
  function cpSnap() {
    var on = isPhone(), root = document.documentElement;
    root.classList.toggle('eng-snap', on);
    if (cpIO) { cpIO.disconnect(); cpIO = null; }
    if (!on || !window.IntersectionObserver) { root.classList.remove('eng-snapfx'); return; }
    root.classList.add('eng-snapfx');
    cpIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); CP_SEEN[e.target.getAttribute('data-step-i')] = 1; } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(app.querySelectorAll('.eng-cp__step'), function (x) { cpIO.observe(x); });
  }
  window.addEventListener('hashchange', function () { if (!/^#compare/.test(location.hash)) document.documentElement.classList.remove('eng-snap', 'eng-snapfx'); });
  function cwPrompt(W) { return cpwSlots(W).some(function (x) { return slotText(W, x); }); }
  // Part (a)'s points: the paragraphs' scenes and what they represent if the text has a writing guide, else the picks.
  function cpPts(th, a, w) {
    var G = th.write && th.write[a];
    if (!G) return w.pts.map(function (i) { return th.points[a][i]; });
    return cpWrite(th, a).paras.filter(function (p) { return p.scene; }).map(function (p) { var r = G.scenes[p.scene].reps[p.rep || 0]; return { title: r.title, say: r.say, m: [p.scene] }; });
  }
  function cpPlan(th, a, B, w) {
    var pts = cpPts(th, a, w), out = { a: [], b: [] };
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
    var todo = [], G = th.write && th.write[a];
    if (G) { var W = cpWrite(th, a), sl = cpwSlots(W), done = sl.filter(function (x) { return slotText(W, x); }).length; if (done < sl.length) todo.push('write ' + (sl.length - done) + ' more of part (a)\'s ' + sl.length + ' parts'); }
    else if (w.pts.length < 3) todo.push('pick ' + (3 - w.pts.length) + ' more point' + (w.pts.length === 2 ? '' : 's') + ' for part (a)');
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
      var rel = 'same';   // every pair's line is the same solid green (the user: "only green")
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
    var inPair = 0;
    w.links.forEach(function (l, k) { if (!inPair && (l.a === mid || l.b === mid)) inPair = k + 1; });
    if (inPair) { CPFB = { kind: 'have', head: 'Already paired. Remove that pair first.', body: '' }; return; }
    if (!CPSEL || CPSEL === mid || tidOf(CPSEL) === tidOf(mid)) {
      if (CPSEL === mid) { CPSEL = null; CPPICK = null; return; }
      // A scene whose matches are all used already: say so, rather than nothing glowing.
      var free = th.links.some(function (l) { var o = l.a === mid ? l.b : l.b === mid ? l.a : null; return o && tidOf(o) !== a && !w.links.some(function (k) { return k.a === o || k.b === o; }); });
      if (!free) { CPFB = { kind: 'miss', head: 'No free match left. Pick another.', body: '' }; CPSEL = null; return; }
      CPSEL = mid; CPPICK = null; return;
    }
    var have = w.links.filter(function (l) { return [l.a, l.b].sort().join() === [CPSEL, mid].sort().join(); })[0];
    if (have) { CPFB = { kind: 'have', head: 'You already paired these two.', body: '' }; CPSEL = null; return; }
    var x = cpFind(th, CPSEL, mid);
    if (!x) { CPFB = { kind: 'miss', head: 'Not a match. Pick one outlined in red.', body: '' }; return; }
    if (w.links.length >= 4) { CPFB = { kind: 'have', head: 'Four pairs already. Remove one first.', body: '' }; CPSEL = null; return; }
    w.links.push({ a: x.a, b: x.b, rel: x.rel });
    CPFB = { kind: 'yes', head: 'Paired: ' + x.aspect + '.', body: '' };
    CPSEL = null;
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
    CPFB = { kind: 'hint', head: 'Try these two.', body: 'The highlighted moment is picked for you. Find the one outlined in red in the other column: what do they share about ' + th.name.toLowerCase() + '?' };
  }

  // ---------- compare it: writing part (a) (th.write[a]; Shawshank first) ----------
  // Part (a) in five parts (opening, three paragraphs, ending), each written in a popup, in separate boxes.
  //   A paragraph: 1 pick its key scene from the list, 2 pick what it represents, 3 write it in three boxes, Point,
  //   Anchor and Evaluate, each with ideas to tap in (the scene's details and quote for Anchor, ideas for Evaluate).
  //   The opening: 1 pick your three scenes (they become paragraphs 1 to 3), 2 what each one represents, 3 three boxes:
  //   the film, what it says about the theme, your three points (made from your scenes).
  //   The ending: three boxes: sum up (made from your scenes), what the film finally says, your last line.
  // Beside the boxes: ten words (the scene's, or the opening's or ending's), words to use instead of "shows", and a
  // check on everything written: "This shows", "show" twice, and any word used three times. Saved as you type.
  var CPW = null;
  // A word range for every box (the user: "we should set a minimum and maximum words for each box"), so the parts add
  // up to about 450 words for part (a) and 600-650 for part (b) (the teacher's figures, and what the high-grade
  // sample answers come to). Soft limits: the count under the box goes from grey (keep going) to green (in range) to
  // red (too long); nothing stops you typing.
  var CPW_RANGE = { p: [15, 30], a: [20, 40], e: [40, 80], film: [15, 30], idea: [15, 35], points: [10, 25], sum: [15, 30], final: [15, 30], last: [10, 25] };
  function wcHtml(n, r) {
    var st = n > r[1] ? 'is-high' : n >= r[0] ? 'is-ok' : 'is-low';
    return '<span class="eng-wc ' + st + '">' + n + ' word' + (n === 1 ? '' : 's') + ' · aim for ' + r[0] + '–' + r[1] + (st === 'is-high' ? ': too long, cut it down' : st === 'is-ok' ? ' ✓' : n ? ': keep going' : '') + '</span>';
  }
  // The parts of part (a): the opening, three or four paragraphs (the user: "you should be able pick 3 OR 4"), the ending.
  function cpwSlots(W) { return ['open'].concat(W.paras.map(function (p, i) { return i; }), ['end']); }
  var KEYS = { open: ['film', 'idea', 'points'], end: ['sum', 'final', 'last'], para: ['p', 'a', 'e'] };
  var PART_COL = { p: 'var(--pace-p)', a: 'var(--pace-a)', e: 'var(--pace-e)', film: 'var(--pace-p)', idea: 'var(--pace-c)', points: 'var(--pace-a)', sum: 'var(--pace-c)', final: 'var(--pace-a)', last: 'var(--pace-e)' };
  var SYN = { shows: ['reveals', 'exposes', 'highlights', 'underlines', 'conveys', 'lays bare'], power: ['control', 'authority', 'dominance', 'grip'],
    important: ['significant', 'crucial', 'pivotal'], very: ['deeply', 'profoundly', 'utterly'], really: ['truly', 'deeply'], cruel: ['brutal', 'savage', 'merciless'],
    sad: ['tragic', 'poignant', 'heartbreaking'], good: ['admirable', 'decent', 'hopeful'], says: ['declares', 'insists', 'admits'], uses: ['exploits', 'relies on', 'turns to'],
    makes: ['forces', 'drives', 'leads'], gets: ['receives', 'is given', 'wins'], scene: ['moment', 'sequence', 'episode'], prison: ['Shawshank', 'the institution', 'the system'] };
  var STOPW = ' the and that this with from they their them there then than were was have has had into onto over under about which while when where what whom whose would could should because after before also only even just more most much many some such been being does done your yours its it\'s his him her hers our you are not but all one two three four five film text shows show showed showing shown ';
  function cpWrite(th, a) {
    var w = cpWork(th, a);
    if (!w.write) w.write = { paras: [{}, {}, {}] };
    var W = w.write;
    // Older saves kept one box per part: their text goes in the first box.
    W.paras.forEach(function (p) { if (!p.parts) { p.parts = { p: p.text || '', a: '', e: '' }; delete p.text; } });
    if (!W.openParts) { W.openParts = { film: W.open || '', idea: '', points: '' }; delete W.open; }
    if (!W.endParts) { W.endParts = { sum: W.end || '', final: '', last: '' }; delete W.end; }
    return W;
  }
  function slotOf(v) { return v === 'open' || v === 'end' ? v : +v; }
  function slotName(s) { return s === 'open' ? 'Opening' : s === 'end' ? 'Ending' : 'Paragraph ' + (s + 1); }
  function slotKeys(s) { return typeof s === 'number' ? KEYS.para : KEYS[s]; }
  function slotParts(W, s) { return (s === 'open' ? W.openParts : s === 'end' ? W.endParts : (W.paras[s] || {}).parts) || {}; }
  // Optional parts (the user: "it should be like 'or skip' at the bottom"): the opening's points and the ending's last
  // line, in both parts. A skipped part folds to one line with "Add it back"; what's in it is kept but left out of the answer.
  var SKIPPABLE = { points: 1, last: 1 };
  function skipped(P, k) { return !!(P && P._skip && P._skip[k]); }
  // A box's ideas (the user: "make them show only when a student clicks show idea and once it clicks on the box the idea
  // dissapears and re appears if student clicks show idea again, however it should give 3 diffent ideas at once ... keep
  // them short"): a "Show ideas" button; three short ideas at once; tapping into the box hides them again.
  function ideasHtml(pt) {
    var list = (pt.ideas || []).filter(Boolean).slice(0, 3);
    if (!list.length) return pt.auto ? '<p class="eng-cpd__none">Pick your three scenes first.</p>' : '';
    var on = !!(CPW.ideas && CPW.ideas[pt.k]);
    return '<div class="eng-cpd__ideas' + (on ? ' is-on' : '') + '" data-ideas="' + pt.k + '"><button type="button" class="eng-cpd__show" data-cpw-ideas="' + pt.k + '" aria-expanded="' + on + '">' +
      (on ? 'Hide ideas' : 'Show ideas') + '</button><div class="eng-cpd__ilist"' + (on ? '' : ' hidden') + '>' + list.map(function (x) {
        var tx = typeof x === 'string' ? x : x.t;
        return '<p class="eng-cpd__idea' + (x.tag ? ' is-tech' : '') + '">' + (x.tag ? '<em>' + esc(x.tag) + '</em>' : '') + esc(tx) + '</p>';
      }).join('') + '</div></div>';
  }
  function ideasSet(k, on) {
    if (!CPW) return;
    CPW.ideas = CPW.ideas || {}; CPW.ideas[k] = on;
    var box = document.querySelector('#eng-cpd [data-ideas="' + k + '"]');
    if (!box) return;
    box.classList.toggle('is-on', on);
    box.querySelector('.eng-cpd__ilist').hidden = !on;
    var b = box.querySelector('[data-cpw-ideas]'); b.setAttribute('aria-expanded', on); b.textContent = on ? 'Hide ideas' : 'Show ideas';
  }
  function skipRow(k, wc) { return SKIPPABLE[k] ? '<div class="eng-cpd__pf"><button type="button" class="eng-cpd__skip" data-cpw-skip="' + k + '">or skip</button>' + wc + '</div>' : wc; }
  function skipPart(pt, col, i) {
    return '<section class="eng-cpd__part is-skip" style="--pc:' + col + ';--i:' + i + '"><header><span class="eng-cpd__pl">' + esc(pt.label) + '</span></header>' +
      '<p class="eng-cpd__skipped">Skipped. <button type="button" class="eng-cpd__skip" data-cpw-skip="' + pt.k + '">Add it back</button></p></section>';
  }
  function slotText(W, s) { var P = slotParts(W, s); return slotKeys(s).filter(function (k) { return !skipped(P, k); }).map(function (k) { return String(P[k] || '').trim(); }).filter(Boolean).join(' '); }
  function wordsIn(s) { return (String(s || '').match(/[A-Za-zÀ-ÿ0-9'’£-]+/g) || []).length; }
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  // The ideas made from your paragraphs' scenes: the opening's three points, the ending's summing up.
  function autoIdeas(th, a, kind) {
    var reps = cpPts(th, a, cpWork(th, a)).map(function (p) { return lowerFirst(p.title); });
    if (!reps.length) return [];
    var list = reps.join(', ').replace(/, ([^,]*)$/, ' and $1');
    return kind === 'points' ? ['This is clear in ' + ['one way', 'two ways', 'three ways', 'four ways'][reps.length - 1] + ': ' + list + '.',
        'First, ' + reps[0] + (reps[1] ? '; then, ' + reps[1] : '') + '.', 'Each scene shows a different side of ' + th.name.toLowerCase() + '.'] :
      ['Each of these scenes shows how far the powerful will go to stay in control.', 'In every scene, the men in charge abuse the power they hold.',
        'Together, these scenes show power used to crush, not to protect.'];
  }
  function partsOf(th, a, s) {
    var G = th.write[a], W = cpWrite(th, a);
    if (typeof s !== 'number') return G[s].parts.map(function (pt) { return { k: pt.k, label: pt.label, hint: pt.hint, hl: pt.hl, ideas: pt.auto ? autoIdeas(th, a, pt.auto) : pt.ideas, auto: pt.auto }; });
    var para = W.paras[s], sc = G.scenes[para.scene], rep = sc.reps[para.rep || 0], m = text(a).moments[para.scene - 1];
    var tq = sc.techniques[rep.t] || sc.techniques[0];
    return [{ k: 'p', label: 'Point', hl: 'Your idea, in one sentence', hint: 'Your idea, in one sentence: what this scene represents.', ideas: [rep.start, rep.title + '.', firstSentence(rep.say)] },
      { k: 'a', label: 'Anchor', hl: 'Keep it short', hint: 'Keep it short: the moment in a sentence or two, with ' + (m.quote ? 'the quote or ' : '') + 'a film technique. Don\'t retell the story.',
        ideas: [sc.details[0], m.quote ? { t: '“' + m.quote + '”', tag: 'Quote' } : sc.details[1], { t: tq.say, tag: 'Technique: ' + tq.name }].filter(Boolean) },
      { k: 'e', label: 'Evaluate', hl: 'Most of the marks are here', hint: 'Most of the marks are here: two or three sentences on why it matters for ' + th.name.toLowerCase() + '.', ideas: rep.ideas.slice(0, 2).concat([{ t: 'Darabont suggests that …', tag: 'Start with' }]) }];
  }
  // The pictures at the top of a writing card (the user, of the laptop list: "this is something i wouldnt want to look at").
  function cpwPics(mids) {
    if (!mids.length) return '<span class="eng-cpw__pics is-none"></span>';
    return '<span class="eng-cpw__pics">' + mids.map(function (mid) {
      var tid = tidOf(mid), f = fPic(mid, true);
      return '<span class="eng-cpw__pic" style="--c:' + COL[tid] + '">' + (f ? '<img src="assets/eng/img/' + esc(f) + '" alt="" loading="lazy">' : '') + '<i>' + esc(shortTitle(tid)) + '</i></span>';
    }).join('') + '</span>';
  }
  function cpWriterHtml(th, a) {
    var W = cpWrite(th, a), G = th.write[a], total = 0;
    var rows = cpwSlots(W).map(function (s) {
      var txt = slotText(W, s), p = typeof s === 'number' ? W.paras[s] : null, sc = p && p.scene ? G.scenes[p.scene] : null, rep = sc ? sc.reps[p.rep || 0] : null;
      total += wordsIn(txt);
      var mid = rep ? text(a).moments[p.scene - 1].id : null;
      return '<li class="eng-cpw__s' + (txt ? ' is-done' : '') + (p ? ' is-card' : ' is-wide') + '">' + (p ? cpwPics(mid ? [mid] : []) : '') + '<div class="eng-cpw__h"><b>' + slotName(s) + '</b>' +
        (rep ? '<span class="eng-cpw__rep">' + esc(rep.title) + '</span>' + momChip(mid) : '') +
        '<button type="button" class="eng-btn' + (txt ? ' eng-btn--quiet' : '') + '" data-cpw="' + s + '">' + (txt ? 'Edit' : 'Write it') + '</button></div>' +
        (txt ? '<p class="eng-cpw__t">' + esc(txt) + '</p>' : rep ? '' : '<p class="eng-cpw__e">' + (s === 'open' ? 'Start here: pick your three or four scenes, then write the opening.' :
          s === 'end' ? 'Sum it all up: what the film finally says about abuse of power.' : 'Pick a key scene and what it represents, then write it.') + '</p>') + '</li>';
    });
    return '<h2 class="eng-h2"><span class="eng-cp__n">2</span>Write part (a)</h2>' +
      '<p class="eng-p">Tap <b>Write it</b>, starting with the Opening.</p>' +
      '<ol class="eng-cpw">' + rows.join('') + '</ol>' +
      '<p class="eng-cpw__more">' + (W.paras.length < 4 ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-add>+ Add a fourth paragraph</button>' :
        '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-drop>Remove paragraph 4</button>') + '</p>' +
      '<p class="eng-cpw__foot"><span>Part (a) so far: <b>' + total + ' words</b></span>' + (total ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-copy>Copy part (a)</button>' : '') + '</p>';
  }
  function cpwFirstStep(W, s) {
    var G = cpTheme().write[cpBy(cpTheme()).a];
    if (s === 'open') return !W.paras.every(function (p) { return p.scene; }) ? 1 : W.paras.every(function (p) { return repPicked(G, p); }) ? 3 : 2;
    if (s === 'end') return 3;
    return !W.paras[s].scene ? 1 : repPicked(G, W.paras[s]) ? 3 : 2;
  }
  function cpwOpen(s) {
    var th = cpTheme(), W = cpWrite(th, cpBy(th).a);
    CPW = { slot: s, step: cpwFirstStep(W, s), box: slotKeys(s)[0], pick: W.paras.map(function (p) { return p.scene; }).filter(Boolean), shown: {} };
    cpwDraw(true);
  }
  function cpwClose() {
    var s = CPW && CPW.slot;
    CPW = null; cpwDraw(); renderCompare();
    var b = s != null && app.querySelector('[data-cpw="' + s + '"]');
    if (b) b.focus({ preventScroll: true });
  }
  // A scene card's context (the user: "when picking the key scenes ... explains them with context also"): where it is
  // in the text and when (the opening, the middle, the climax, the ending), what happens in two sentences, and why it
  // matters.
  var WHEN = { opening: 'at the start', middle: 'in the middle', climax: 'at the climax', ending: 'at the end' };
  function sceneCtx(m) {
    return '<span class="eng-cpd__scx">' + esc(m.where || '') + (m.when && WHEN[m.when] ? (m.where ? ' · ' : '') + WHEN[m.when] : '') + '</span>' +
      '<span class="eng-cpd__scw">' + esc(firstSentences(m.what, 2)) + '</span>' +
      (m.why ? '<span class="eng-cpd__scy"><em>Why it matters:</em> ' + esc(firstSentence(m.why)) + '</span>' : '');
  }
  function sceneCard(a, G, n, on, extra, attr) {
    var m = text(a).moments[n - 1], sc = G.scenes[n], pic = scenePics(a, m.id)[0];
    return '<button type="button" class="eng-cpd__sc' + (on ? ' is-on' : '') + '" ' + attr + ' style="--c:' + COL[a] + ';--i:' + (n - 1) + '">' +
      (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '<span class="eng-cpd__ph"></span>') +
      '<span class="eng-cpd__sct">' + esc(m.title) + '</span>' + sceneCtx(m) +
      '<span class="eng-cpd__scr"><em>Can represent:</em> ' + sc.reps.map(function (r) { return esc(r.title); }).join(' · ') + '</span>' + (extra || '') + '</button>';
  }
  // The three paragraphs' scenes, small, at the top of the opening and the ending.
  function threeHtml(th, a, W) {
    var G = th.write[a];
    return '<div class="eng-cpd__three">' + W.paras.map(function (p, k) {
      if (!p.scene) return '<div class="eng-cpd__mini is-empty"><b>Paragraph ' + (k + 1) + '</b><span>No scene yet</span></div>';
      var m = text(a).moments[p.scene - 1], pic = scenePics(a, m.id)[0], rep = G.scenes[p.scene].reps[p.rep || 0];
      return '<div class="eng-cpd__mini">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="">' : '') + '<div><b>Paragraph ' + (k + 1) + ' · ' + esc(m.title) + '</b><span>' + esc(rep.title) + '</span></div></div>';
    }).join('') + '</div>';
  }
  function firstSentence(s) { return (String(s).match(/^.*?[.!?](?=\s+[A-Z‘“']|$)/) || [s])[0]; }
  // Names keep their capital after the meaning's colon; anything else starts small.
  function afterColon(s, a) {
    var w = (s.match(/^[A-Za-zÀ-ÿ']+/) || [''])[0], names = {};
    text(a).people.forEach(function (p) { p.name.split(/[^A-Za-zÀ-ÿ']+/).forEach(function (x) { names[x] = 1; }); });
    return names[w] || w === 'I' ? s : lowerFirst(s);
  }
  // The worked example: a whole paragraph, written out (rep.model: [kind, text] in order), each part in its colour, with
  // a key underneath, and for a scene the film technique it uses. Start from this puts it in the boxes.
  var SEG = { p: ['Point', 'var(--pace-p)'], a: ['Anchor', 'var(--pace-a)'], t: ['Technique', 'var(--m-gvv)'], e: ['Evaluate', 'var(--pace-e)'],
    film: ['Opening line', 'var(--pace-p)'], idea: ['Your three points', 'var(--pace-c)'], points: ['Where it\'s going', 'var(--pace-a)'],
    sum: ['Sum up', 'var(--pace-c)'], final: ['What it finally says', 'var(--pace-a)'], last: ['Last line', 'var(--pace-e)'] };
  function cpwModel(th, a, n, ri) { var sc = th.write[a].scenes[n], r = sc.reps[ri]; return { segs: r.model, t: sc.techniques[r.t] }; }
  // The opening's and ending's example, made from the ideas and your three scenes.
  function slotExample(th, a, s) {
    return partsOf(th, a, s).map(function (pt) { var x = pt.ideas && pt.ideas[0]; return x ? [pt.k, typeof x === 'string' ? x : x.t] : null; }).filter(Boolean);
  }
  // An example only shows you; you write your own (the user: "it let me just click on shit and it wrote the whole thing
  // for me ... it should show them").
  function exampleHtml(segs, tech, key) {
    var kinds = [];
    segs.forEach(function (g) { if (kinds.indexOf(g[0]) < 0) kinds.push(g[0]); });
    return '<div class="eng-cpd__model"><p class="eng-cpd__mh">Here\'s one way to write it</p>' +
      '<p class="eng-cpd__mp" data-type="' + esc(key) + '">' + segs.map(function (g) { return '<span class="eng-cpd__seg" style="--pc:' + SEG[g[0]][1] + '">' + esc(g[1]) + '</span>'; }).join(' ') + '</p>' +
      '<p class="eng-cpd__key">' + kinds.map(function (k) { return '<span style="--pc:' + SEG[k][1] + '">' + esc(k === 't' && tech ? 'Technique: ' + tech.name : SEG[k][0]) + '</span>'; }).join('') + '</p>' +
      (tech ? '<p class="eng-cpd__tq"><b>' + esc(tech.name) + ':</b> ' + esc(lowerFirst(tech.what)) + '</p>' : '') +
      '<p class="eng-cpd__own">Now write your own, in your own words.</p></div>';
  }
  function modelHtml(th, a, n, ri) { var M = cpwModel(th, a, n, ri); return exampleHtml(M.segs, M.t, 'm' + n + '-' + ri); }
  function repPicked(G, p) { return !!p.scene && (p.picked || G.scenes[p.scene].reps.length === 1); }
  // A scene and what it can represent, joined by arrows (drawn by cpwArrows); the one you pick leads on to the example.
  function treeHtml(th, a, k, p, attr, label) {
    var G = th.write[a], sc = G.scenes[p.scene], m = text(a).moments[p.scene - 1], pic = scenePics(a, m.id)[0], on = repPicked(G, p);
    return '<div class="eng-cpd__tree' + (CPW.just === k ? ' is-new' : '') + '" data-tree>' +
      (label ? '<p class="eng-cpd__tl">' + esc(label) + '</p>' : '') +
      '<div class="eng-cpd__root" style="--c:' + COL[a] + '">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="">' : '') +
        '<div class="eng-cpd__rt"><b>' + esc(m.title) + '</b>' +
        '<p class="eng-cpd__rw"><span>What happens</span><span data-type="w' + p.scene + '">' + esc(m.what) + '</span></p>' +
        '<small>' + (on ? 'You picked one below. Tap another to change it.' : 'So what does this scene represent about ' + esc(th.name.toLowerCase()) + '? Pick one below.') + '</small></div></div>' +
      '<svg class="eng-cpd__arrows" aria-hidden="true"></svg>' +
      '<div class="eng-cpd__reps eng-cpd__reps--row">' + sc.reps.map(function (r, i) {
        var sel = on && (p.rep || 0) === i;
        return '<button type="button" class="eng-cpd__rep' + (sel ? ' is-on' : '') + '" ' + attr(i) + ' aria-pressed="' + sel + '" style="--i:' + i + '"><b>' + esc(r.title) + '</b><span>' + esc(r.say) + '</span>' +
          '<span class="eng-cpd__repi"><em>Why it matters</em>' + r.ideas.map(function (x) { return '<i>' + esc(x) + '</i>'; }).join('') + '</span></button>';
      }).join('') + '</div>' + (on ? modelHtml(th, a, p.scene, p.rep || 0) : '') + '</div>';
  }
  // The arrows: side by side, they branch down from the scene; stacked (on a phone), they run down a rail on the left.
  function cpwArrows() {
    var box = document.getElementById('eng-cpd');
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('[data-tree]'), function (tree) {
      // Positions come from the layout (offsets), not the screen, so cards still popping in don't throw the arrows off.
      var at = function (el) {
        var x = 0, y = 0, e = el;
        while (e && e !== tree) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
        return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
      };
      var svg = tree.querySelector('.eng-cpd__arrows'), r0 = { left: 0, top: 0, width: tree.offsetWidth, height: tree.offsetHeight }, root = at(tree.querySelector('.eng-cpd__root')), d = '';
      var cards = Array.prototype.slice.call(tree.querySelectorAll('.eng-cpd__rep')), rows = cards.map(at);
      var side = rows.length < 2 || rows.every(function (r) { return Math.abs(r.top - rows[0].top) < 6; });
      svg.setAttribute('width', r0.width); svg.setAttribute('height', r0.height); svg.setAttribute('viewBox', '0 0 ' + r0.width + ' ' + r0.height);
      var X = function (v) { return Math.round(v); }, Y = function (v) { return Math.round(v); };
      var down = function (x1, y1, x2, y2, cls, i) {
        var my = Math.round((y1 + y2) / 2);
        return '<path class="eng-cpd__ar ' + cls + '" pathLength="1" style="--i:' + i + '" d="M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + (y2 - 8) + '"/>' +
          '<path class="eng-cpd__ah ' + cls + '" style="--i:' + i + '" d="M' + (x2 - 7) + ' ' + (y2 - 10) + ' L' + x2 + ' ' + (y2 - 1) + ' L' + (x2 + 7) + ' ' + (y2 - 10) + ' Z"/>';
      };
      var rail = function (x0, y1, x2, ym, cls, i) {
        return '<path class="eng-cpd__ar ' + cls + '" pathLength="1" style="--i:' + i + '" d="M' + x0 + ' ' + y1 + ' L' + x0 + ' ' + (ym - 10) + ' Q' + x0 + ' ' + ym + ' ' + (x0 + 10) + ' ' + ym + ' L' + (x2 - 8) + ' ' + ym + '"/>' +
          '<path class="eng-cpd__ah ' + cls + '" style="--i:' + i + '" d="M' + (x2 - 10) + ' ' + (ym - 7) + ' L' + (x2 - 1) + ' ' + ym + ' L' + (x2 - 10) + ' ' + (ym + 7) + ' Z"/>';
      };
      var x0 = 13, top = Y(root.bottom) + 2;
      rows.forEach(function (r, i) {
        var cls = cards[i].classList.contains('is-on') ? 'is-on' : '';
        d += side ? down(X(root.left + Math.min(root.width / 2, 120)), top, X(r.left + r.width / 2), Y(r.top), cls, i) : rail(x0, top, X(r.left), Y(r.top + Math.min(r.height / 2, 40)), cls, i);
      });
      var on = tree.querySelector('.eng-cpd__rep.is-on'), mo = tree.querySelector('.eng-cpd__model');
      if (on && mo) {
        var a1 = at(on), b1 = at(mo);
        d += side ? down(X(a1.left + a1.width / 2), Y(a1.bottom) + 2, X(Math.min(a1.left + a1.width / 2, b1.left + 90)), Y(b1.top), 'is-on is-down', 0) :
          rail(x0, Y(a1.bottom) + 2, X(b1.left), Y(b1.top + 24), 'is-on is-down', 0);
      }
      svg.innerHTML = d;
    });
  }
  window.addEventListener('resize', function () { if (CPW) cpwArrows(); });
  function cpwDraw(focus) {
    var box = document.getElementById('eng-cpd');
    if (!CPW) { if (box) box.remove(); if (TCH && TCH.parentNode) TCH.remove(); document.body.classList.remove('eng-cpd-on', 'eng-story-on'); railDraw(); return; }
    if (CPW.part === 'b') return cpbDraw(focus);
    if (!box) {
      // It fades in when it opens, not each time it redraws.
      box = document.createElement('div'); box.id = 'eng-cpd'; box.className = 'eng-cpd is-new'; document.body.appendChild(box);
      setTimeout(function () { box.classList.remove('is-new'); }, 300);
    }
    document.body.classList.add('eng-cpd-on');
    var th = cpTheme(), a = cpBy(th).a, W = cpWrite(th, a), G = th.write[a], s = CPW.slot, para = typeof s === 'number' ? W.paras[s] : null, body = '', foot = '', writing = false;
    // A step plays its animations (cards popping in, arrows drawing) when it is first shown, not on every redraw; and a
    // redraw of the same step keeps your place (the user: "it just takes me to the top when i click on anything").
    var story = para && CPW.step === 3 && storyOn(slotText(W, s)) ? storyHtml(cpwStory(th, a, s)) : '', again = !story && para && CPW.step === 3 && isPhone() ? storyAgain() : '';
    var key = s + '/' + CPW.step + (story ? '/story' : ''), oldBody = box.querySelector('.eng-cpd__body'), keep = box.getAttribute('data-key') === key && oldBody ? oldBody.scrollTop : 0, fresh = box.getAttribute('data-key') !== key;
    if (fresh) {
      box.setAttribute('data-key', key); box.classList.add('is-fresh');
      clearTimeout(box.cpT); box.cpT = setTimeout(function () { box.classList.remove('is-fresh'); }, 1700);
    }
    var steps = s === 'end' ? null : s === 'open' ? ['Your three scenes', 'What they represent', 'Write it'] : ['Key scene', 'What it represents', 'Write it'];
    var head = '<div class="eng-cpd__top"><h2 id="eng-cpd-h">' + slotName(s) + '</h2>' +
      (steps ? '<ol class="eng-cpd__steps">' + steps.map(function (x, i) {
        return '<li class="' + (CPW.step === i + 1 ? 'is-on' : CPW.step > i + 1 ? 'is-done' : '') + '"' + (CPW.step === i + 1 ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + x + '</li>';
      }).join('') + '</ol>' : '') + cpQ('a') + '<button type="button" class="eng-cpd__x" data-cpw-close aria-label="Close">×</button></div>';
    // On a phone the steps and the question scroll away with the page instead of staying pinned (the user: "on mobile this
    // is distracting"): the same two, at the top of the body, shown only on phones.
    var mhead = '<div class="eng-cpd__mhead">' + head.replace(/^.*?<\/h2>/, '').replace(/<button type="button" class="eng-cpd__x"[^]*$/, '') + '</div>';
    var nums = text(a).moments.map(function (m, i) { return i + 1; }).filter(function (n) { return G.scenes[n]; });
    if (s === 'open' && CPW.step === 1) {
      body = '<p class="eng-cpd__lead">Pick the three or four scenes your answer is built on, in the order you\'ll write about them. <b>' + CPW.pick.length + ' picked</b></p><div class="eng-cpd__scenes">' +
        nums.map(function (n) { var k = CPW.pick.indexOf(n); return sceneCard(a, G, n, k >= 0, k >= 0 ? '<span class="eng-cpd__ord">Paragraph ' + (k + 1) + '</span>' : '', 'data-cpw-pick="' + n + '" aria-pressed="' + (k >= 0) + '"'); }).join('') + '</div>';
      foot = '<button type="button" class="eng-btn" data-cpw-picked' + (CPW.pick.length >= 3 ? '' : ' disabled') + '>Next: what they represent</button>';
    } else if (s === 'open' && CPW.step === 2) {
      var left = W.paras.filter(function (p) { return !repPicked(G, p); }).length;
      body = '<p class="eng-cpd__lead">What does each scene represent about ' + esc(th.name.toLowerCase()) + '? Pick one for each, and see how you\'d write it. ' +
        (left ? '<b>' + left + ' still to pick</b>' : '<b class="is-ok">All picked</b>') + '</p>' +
        W.paras.map(function (p, k) { return treeHtml(th, a, k, p, function (i) { return 'data-cpw-orep="' + k + '|' + i + '"'; }, 'Paragraph ' + (k + 1) + ' of ' + W.paras.length); }).join('');
      foot = '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-step="1">Back</button><button type="button" class="eng-btn" data-cpw-step="3"' + (left ? ' disabled' : '') + '>Next: write it</button>';
    } else if (para && CPW.step === 1) {
      body = '<p class="eng-cpd__lead">Pick the key scene this paragraph is built on.</p><div class="eng-cpd__scenes">' + nums.map(function (n) {
        var used = W.paras.map(function (q, k) { return k !== s && q.scene === n ? k + 1 : 0; }).filter(Boolean);
        return sceneCard(a, G, n, para.scene === n, used.length ? '<span class="eng-cpd__used">Already in paragraph ' + used.join(', ') + '</span>' : '', 'data-cpw-scene="' + n + '"');
      }).join('') + '</div>';
    } else if (para && CPW.step === 2) {
      var got = repPicked(G, para);
      body = '<p class="eng-cpd__lead">What does this scene represent about ' + esc(th.name.toLowerCase()) + '? Pick one, and see how you\'d write it.</p>' +
        treeHtml(th, a, s, para, function (i) { return 'data-cpw-rep="' + i + '"'; }, '');
      foot = '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-step="1">Back</button><button type="button" class="eng-btn" data-cpw-step="3"' + (got ? '' : ' disabled') + '>Next: write it</button>';
    } else {
      // Write it: the scene (or the three scenes) on top, then a box for each part with its ideas, the words beside.
      writing = true;
      var words = para ? G.scenes[para.scene].words : G[s].words, top;
      if (para) {
        var m = text(a).moments[para.scene - 1], rep = G.scenes[para.scene].reps[para.rep || 0], pic = scenePics(a, m.id)[0];
        top = '<div class="eng-cpd__banner" style="--c:' + COL[a] + '">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="">' : '') +
          '<div><span class="eng-cpd__bt">' + esc(m.title) + '</span><b>' + esc(rep.title) + '</b><span class="eng-cpd__bs">' + esc(rep.say) + '</span>' +
          '<span class="eng-cpd__techs">Techniques: ' + G.scenes[para.scene].techniques.map(function (q) { return '<i title="' + esc(q.what) + '">' + esc(q.name) + '</i>'; }).join('') + '</span></div></div>' +
          recapBox('What happens in this key scene', '<p><b>' + esc(sceneWhere(a, m)) + ':</b> ' + esc(m.what) + '</p>');
      } else {
        var ex = slotExample(th, a, s);
        var rc = W.paras.map(function (q, k) {
          if (!q.scene) return '';
          var mq = text(a).moments[q.scene - 1];
          return '<p><b>Paragraph ' + (k + 1) + ', ' + esc(mq.title) + ':</b> ' + esc(firstSentence(mq.what)) + '</p>';
        }).join('');
        top = threeHtml(th, a, W) + (rc ? recapBox('What happens in these key scenes', rc) : '') + (ex.length ? exampleHtml(ex, null, 'x' + s + ex.map(function (g) { return g[1].length; }).join('-')) : '');
      }
      var P = slotParts(W, s);
      body = top + '<div class="eng-cpd__write"><div class="eng-cpd__parts">' + partsOf(th, a, s).map(function (pt, pi) {
        if (skipped(P, pt.k)) return skipPart(pt, PART_COL[pt.k], pi);
        return '<section class="eng-cpd__part" style="--pc:' + PART_COL[pt.k] + ';--i:' + pi + '"><header><span class="eng-cpd__pl">' + esc(pt.label) + '</span><span class="eng-cpd__ph2">' + (pt.hl ? esc(pt.hint).replace(esc(pt.hl), '<mark class="eng-cpd__hl">' + esc(pt.hl) + '</mark>') : esc(pt.hint)) + '</span></header>' +
          ideasHtml(pt) +
          '<textarea data-cpw-box="' + pt.k + '" spellcheck="true" lang="en-IE" rows="2" aria-label="' + esc(pt.label) + '" placeholder="Write it in your own words…">' + esc(P[pt.k] || '') + '</textarea>' +
          skipRow(pt.k, CPW_RANGE[pt.k] ? '<p class="eng-cpd__wc" data-cpw-wc="' + pt.k + '" aria-live="polite">' + wcHtml(wordsIn(P[pt.k]), CPW_RANGE[pt.k]) + '</p>' : '') + '</section>';
      }).join('') + '<p class="eng-cpd__tools"><b>How it reads</b><span data-cpw-count></span></p><div class="eng-cpd__check" data-cpw-check role="status" aria-live="polite"></div></div>' +
        '<aside class="eng-cpd__bank"><h3>10 words for ' + (para ? 'this scene' : 'the ' + slotName(s).toLowerCase()) + '</h3><p class="eng-cpd__hint">Tap a word to add it to the box you\'re in.</p><ul>' +
        words.map(function (x) { return '<li><button type="button" class="eng-cpd__w" data-cpw-word="' + esc(x[0]) + '"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></button></li>'; }).join('') +
        '</ul><h3>Instead of “shows”</h3><p class="eng-cpd__inst">' + th.instead.map(function (x) { return '<button type="button" class="eng-chip" data-cpw-word="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</p></aside></div>';
      var sl = cpwSlots(W), i0 = sl.indexOf(s), next = sl[i0 + 1];
      foot = (s === 'open' || para ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpw-step="2">Back</button>' : '') +
        (next != null ? '<button type="button" class="eng-btn" data-cpw-next>Next: ' + slotName(next) + '</button>' : '') + '<button type="button" class="eng-btn' + (next != null ? ' eng-btn--quiet' : '') + '" data-cpw-close>Done</button>';
    }
    box.innerHTML = '<div class="eng-cpd__bg" data-cpw-close></div><div class="eng-cpd__box" role="dialog" aria-modal="true" aria-labelledby="eng-cpd-h">' + head +
      '<div class="eng-cpd__body">' + (story || mhead + again + body + (foot ? '<p class="eng-btns eng-cpd__foot">' + foot + '</p>' : '')) + '</div></div>';
    box.classList.toggle('is-write', writing);
    box.classList.toggle('is-story', !!story); document.body.classList.toggle('eng-story-on', !!story);
    if (story) storyWire(box);
    railDraw();
    if (fresh) { CPW.tch = null; tchIdle(); }
    if (!tchEl().parentNode) document.body.appendChild(TCH);
    Array.prototype.forEach.call(box.querySelectorAll('[data-cpw-box]'), grow);
    cpwArrows();
    CPW.just = null;
    cpwCheck();
    if (keep) box.querySelector('.eng-cpd__body').scrollTop = keep;
    cpwTypeIn(box);
    if (focus && !keep) {
      var f = box.querySelector('[data-cpw-box="' + CPW.box + '"]') || box.querySelector('.eng-cpd__sc.is-on, .eng-cpd__rep.is-on') || box.querySelector('[data-cpw-scene], [data-cpw-pick], [data-cpw-rep], [data-cpw-orep]') || box.querySelector('[data-cpw-close]');
      if (f) f.focus({ preventScroll: true });
      var bd = box.querySelector('.eng-cpd__body'); if (bd) bd.scrollTop = 0;
    }
  }
  function grow(ta) { ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight + 2, 64) + 'px'; }
  // Long text types itself in (the user: "super long text should be like animated in with typing animation"): what
  // happens in a scene, the examples and the ideas, each once (CPW_TYPED). Every text node becomes [typed][caret][still to
  // come, invisible], so nothing moves while it types. A tap finishes it; reduced motion skips it.
  // (Named cpw… because the essay builder has its own typeIn and TYPED further down.)
  var CPW_TYPED = {};
  function cpwTypeIn(root) {
    var els = Array.prototype.filter.call(root.querySelectorAll('[data-type]'), function (e) { return !CPW_TYPED[e.getAttribute('data-type')]; });
    els.forEach(function (e) { CPW_TYPED[e.getAttribute('data-type')] = 1; });
    if (!els.length || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    els.forEach(function (el, n) {
      var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], pairs = [], total = 0;
      while (walk.nextNode()) if (walk.currentNode.nodeValue) nodes.push(walk.currentNode);
      nodes.forEach(function (tn) {
        var v = document.createElement('span'), h = document.createElement('span');
        v.className = 'tw-v'; h.className = 'tw-h'; h.textContent = tn.nodeValue; total += tn.nodeValue.length;
        tn.parentNode.insertBefore(v, tn); tn.parentNode.insertBefore(h, tn); tn.parentNode.removeChild(tn);
        pairs.push([v, h]);
      });
      var caret = document.createElement('span'), done = false, start = null, dur = Math.max(500, Math.min(3200, total * 7)), delay = n * 220;
      caret.className = 'tw-c';
      el.classList.add('is-typing');
      var finish = function () {
        done = true;
        pairs.forEach(function (p) { p[0].textContent += p[1].textContent; p[1].textContent = ''; });
        if (caret.parentNode) caret.parentNode.removeChild(caret);
        el.classList.remove('is-typing');
      };
      el.addEventListener('click', function () { if (!done) finish(); });
      var step = function (t) {
        if (done || !el.isConnected) return;
        if (start === null) start = t + delay;
        var want = Math.max(0, Math.floor((t - start) / dur * total)), seen = 0;
        for (var k = 0; k < pairs.length; k++) {
          var p = pairs[k], len = p[0].textContent.length + p[1].textContent.length;
          if (seen + len <= want) { if (p[1].textContent) { p[0].textContent += p[1].textContent; p[1].textContent = ''; } seen += len; continue; }
          var take = want - seen - p[0].textContent.length;
          if (take > 0) { p[0].textContent += p[1].textContent.slice(0, take); p[1].textContent = p[1].textContent.slice(take); }
          p[1].parentNode.insertBefore(caret, p[1]);
          break;
        }
        if (want >= total) { finish(); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  // The check under the boxes, on everything written in this part.
  function cpwCheck() {
    var box = document.getElementById('eng-cpd'), tas = box ? box.querySelectorAll('[data-cpw-box]') : [];
    if (!tas.length) return;
    var v = Array.prototype.map.call(tas, function (t) { return t.value.trim(); }).filter(Boolean).join(' '), out = [], n = wordsIn(v), th = cpTheme(), a = cpBy(th).a;
    box.querySelector('[data-cpw-count]').textContent = n + ' word' + (n === 1 ? '' : 's');
    var shows = (v.match(/\bshow(s|ed|ing|n)?\b/gi) || []).length;
    // Each box starts a sentence of its own.
    if (Array.prototype.some.call(tas, function (t) { return /(^|[.!?]\s+)this shows\b/i.test(t.value.trim()); })) out.push(['“This shows…” is a weak way to start a sentence.', 'Start with the idea itself, or try:', ['This exposes', 'Here we see', 'This lays bare']]);
    Array.prototype.forEach.call(tas, function (t) {
      var k = t.getAttribute('data-cpw-box'), el = box.querySelector('[data-cpw-wc="' + k + '"]');
      if (el && boxRange(k)) el.innerHTML = wcHtml(wordsIn(t.value), boxRange(k));
    });
    // A part with a few words in it gets its tick.
    Array.prototype.forEach.call(tas, function (t) { t.closest('.eng-cpd__part').classList.toggle('is-done', wordsIn(t.value) >= 4); });
    if (shows >= 2) out.push(['You\'ve used “show” ' + shows + ' times.', 'Swap one for:', SYN.shows]);
    var names = {};
    (CPW.part === 'b' ? cpbCtx().F : [a]).forEach(function (tid) {
      text(tid).people.concat([{ name: text(tid).title }]).forEach(function (p) { p.name.toLowerCase().split(/[^a-zà-ÿ]+/).forEach(function (x) { names[x] = 1; }); });
    });
    var count = {};
    (v.toLowerCase().match(/[a-zà-ÿ'’-]+/g) || []).forEach(function (x) {
      x = x.replace(/[’']s$/, '');
      if (x.length >= 4 && STOPW.indexOf(' ' + x + ' ') < 0 && !names[x]) count[x] = (count[x] || 0) + 1;
    });
    Object.keys(count).filter(function (x) { return count[x] >= 3; }).sort(function (x, y) { return count[y] - count[x]; }).slice(0, 3).forEach(function (x) {
      out.push(['“' + x + '”: ' + count[x] + ' times.', SYN[x] ? 'Swap one for:' : 'Try a different word for one of them.', SYN[x] || []]);
    });
    cpwMore(tas, v, out, th, a);
    // The scene's words you've already used are ticked in the list.
    Array.prototype.forEach.call(box.querySelectorAll('.eng-cpd__w'), function (b) {
      var w = b.getAttribute('data-cpw-word').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      b.classList.toggle('is-used', new RegExp('\\b' + w + '\\b', 'i').test(v));
    });
    box.querySelector('[data-cpw-check]').innerHTML = (out.meter || '') + (out.length ? out.map(function (o) {
      if (o.fix) return '<p class="eng-cpd__warn eng-cpd__warn--' + o.kind + '"><b>' + esc(o[0]) + '</b> ' + esc(o[1]) + ' ' + o.fix.map(function (f) {
        return '<button type="button" class="eng-chip" data-cpw-fix="' + esc(f.join('|')) + '">' + esc(f[1]) + ' → ' + esc(f[2]) + '</button>';
      }).join('') + '</p>';
      if (o.step) return '<p class="eng-cpd__warn eng-cpd__warn--' + o.kind + '"><b>' + esc(o[0]) + '</b> ' + esc(o[1]) + ' <button type="button" class="eng-chip" data-cpw-step="1">Change the scene</button></p>';
      return '<p class="eng-cpd__warn' + (o.kind ? ' eng-cpd__warn--' + o.kind : '') + '"><b>' + esc(o[0]) + '</b> ' + esc(o[1]) + (o[2].length ? ' ' + o[2].map(function (x) { return '<button type="button" class="eng-chip" data-cpw-word="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') : '') + '</p>';
    }).join('') : (n >= 40 ? '<p class="eng-cpd__good">No “shows”, no repeated words, nothing misspelt. Nice.</p>' : ''));
  }
  // The rest of the check, answering what an examiner (and the user's own marker) picks on: a paragraph that mostly
  // retells the story, writing about a different scene from the one picked, no film technique, a paragraph that
  // sprawls; and, everywhere, spelling, capitals on names, missing apostrophes and sentences that run on.
  var MISSPELT = { gaurd: 'guard', gaurds: 'guards', gaurded: 'guarded', tyrrany: 'tyranny', tyrany: 'tyranny', devestating: 'devastating', devistating: 'devastating',
    certian: 'certain', autority: 'authority', athority: 'authority', authoraty: 'authority', definately: 'definitely', seperate: 'separate', beleive: 'believe',
    recieve: 'receive', wierd: 'weird', untill: 'until', alot: 'a lot', occured: 'occurred', begining: 'beginning', enviroment: 'environment',
    goverment: 'government', priviledge: 'privilege', opression: 'oppression', oppresion: 'oppression', corupt: 'corrupt', coruption: 'corruption',
    sentance: 'sentence', existance: 'existence', persue: 'pursue', arguement: 'argument', truely: 'truly', independant: 'independent',
    neccessary: 'necessary', necesary: 'necessary', occassion: 'occasion', relevent: 'relevant', succesful: 'successful', sucessful: 'successful',
    prision: 'prison', prisioner: 'prisoner', prisioners: 'prisoners', voilence: 'violence', violance: 'violence', brutallity: 'brutality',
    hypocracy: 'hypocrisy', hipocrisy: 'hypocrisy', hypocrit: 'hypocrite', ironicly: 'ironically', charachter: 'character',
    charecter: 'character', charactor: 'character', narative: 'narrative', directer: 'director', freind: 'friend', freinds: 'friends',
    wasnt: "wasn't", dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", isnt: "isn't", arent: "aren't", couldnt: "couldn't",
    wouldnt: "wouldn't", shouldnt: "shouldn't", hasnt: "hasn't", havent: "haven't", theyre: "they're", andys: "Andy's", nortons: "Norton's",
    hadleys: "Hadley's", tommys: "Tommy's", darabonts: "Darabont's" };
  var NAMES = ['Shawshank', 'Andy', 'Norton', 'Hadley', 'Brooks', 'Tommy', 'Darabont', 'Heywood', 'Zihuatanejo', 'Bible', 'Frank', 'Dufresne', 'Mexico', 'Buxton',
    'Sive', 'Mena', 'Thomasheen', 'Nanna', 'Liam', 'Keane', 'Furlong', 'Sarah', 'Eileen', 'Keegan', 'Kehoe', 'Wilson', 'Ross'];
  var TECH_WORDS = /\b(camera|shot|shots|angle|close-?up|lighting|lit|light|darkness|shadow|shadows|music|score|sound|soundtrack|voiceover|voice-over|narration|narrates|montage|flashback|editing|cuts?|cross-?cuts?|frame|framing|framed|colou?rs?|slow motion|wide|aerial|filmed|films|lingers|zoom|silence)\b/i;
  // The scene some writing is really about, if it isn't the one picked (n): another scene's keys hit 3+ times and 2
  // more than the picked one's. 0 if it's fine.
  function cpwOtherScene(v, G, n) {
    var low = v.toLowerCase(), hits = function (x) { return (G.scenes[x].keys || []).reduce(function (c, k) { return c + (low.indexOf(k) >= 0 ? 1 : 0); }, 0); };
    var mine = hits(n), best = 0, bestN = 0;
    Object.keys(G.scenes).forEach(function (x) { if (+x !== n) { var h = hits(x); if (h > best) { best = h; bestN = +x; } } });
    return best >= 3 && best >= mine + 2 ? bestN : 0;
  }
  function cpwMore(tas, v, out, th, a) {
    var G = th.write[a], s = CPW.slot, W = cpWrite(th, a), words = {};
    Array.prototype.forEach.call(tas, function (t) { words[t.getAttribute('data-cpw-box')] = wordsIn(t.value); });
    var total = wordsIn(v);
    // Part (b): a paragraph that never compares.
    if (CPW.part === 'b' && typeof s === 'number' && total >= 40 && !/\b(similarly|likewise|both|whereas|in contrast|unlike|on the other hand|in the same way|just as|even more|to a (?:far )?greater extent|less obviously)\b/i.test(v))
      { var nc = ['No comparing yet.', 'Part (b) is marked on comparing: link the two scenes with', CPB_LINKWORDS.slice(0, 5)]; nc.kind = 'bad'; out.unshift(nc); }
    if (CPW.part !== 'b' && typeof s === 'number' && W.paras[s] && W.paras[s].scene) {
      var P = words.p || 0, A = words.a || 0, E = words.e || 0, filled = [P, A, E].filter(Boolean).length, sc = G.scenes[W.paras[s].scene];
      // How much of it is the story, and how much is your thinking.
      if (total >= 30) out.meter = '<div class="eng-cpd__bal" aria-hidden="true"><span style="flex:' + P + ';--pc:var(--pace-p)"></span><span style="flex:' + A + ';--pc:var(--pace-a)"></span><span style="flex:' + E + ';--pc:var(--pace-e)"></span></div>' +
        '<p class="eng-cpd__baltxt">The story (blue, Anchor) should be a third of the paragraph or less; your thinking (yellow and orange) the rest.</p>';
      if (filled === 1 && total > 110) out.unshift(['It\'s all in one box.', 'Split it up: one sentence of Point (your idea), a short Anchor (the moment), then Evaluate (why it matters). It keeps you from just retelling the story.', []]);
      else if (A > 45 && A > P + E) out.unshift(['This is mostly retelling.', 'The Anchor (' + A + ' words) is longer than your Point and Evaluate together (' + (P + E) + '). Cut the story to a sentence or two and say more about why it matters: that is where the marks are.', []]);
      // Writing about a different scene from the one picked.
      var bestN = cpwOtherScene(v, G, W.paras[s].scene);
      if (bestN) {
        var o = ['This reads like it\'s about ' + text(a).moments[bestN - 1].title + ' (scene ' + bestN + ').', 'But this paragraph is built on ' + text(a).moments[W.paras[s].scene - 1].title + '. Change the scene, or write about the one you picked.', []];
        o.step = true; o.kind = 'bad'; out.unshift(o);
      }
      // No film technique.
      if (total >= 60 && !TECH_WORDS.test(v)) out.push(['No film technique yet.', 'It\'s a film, so say how the moment is shown: one technique lifts your Language mark. This scene has', sc.techniques.map(function (q) { return q.name.toLowerCase(); })]);
      if (total > 260) out.push(['This paragraph is long (' + total + ' words).', 'Pick your two strongest ideas and develop those; cut the rest.', []]);
    }
    // Spelling, apostrophes, capitals on names.
    var fixes = [], seen = {};
    (v.match(/[A-Za-z]+/g) || []).forEach(function (w) {
      var low = w.toLowerCase(), right = MISSPELT[low];
      if (right && !seen[low]) { seen[low] = 1; fixes.push(['w', low, right]); }
    });
    NAMES.forEach(function (nm) {
      var low = nm.toLowerCase();
      if (new RegExp('\\b' + low + '\\b').test(v) && !seen[low]) { seen[low] = 1; fixes.push(['c', low, nm]); }
    });
    if (fixes.length) { var f = ['Spelling and capitals.', 'Tap to fix:', []]; f.fix = fixes; f.kind = 'spell'; out.push(f); }
    // Sentences that run on.
    var long = 0;
    Array.prototype.forEach.call(tas, function (t) { t.value.split(/[.!?]+\s+/).forEach(function (x) { if (wordsIn(x) > 45) long++; }); });
    if (long) out.push([(long === 1 ? 'One sentence runs' : long + ' sentences run') + ' over 45 words.', 'Split ' + (long === 1 ? 'it' : 'them') + ' with a full stop, and don\'t join two sentences with just a comma.', []]);
  }
  // Fix a word everywhere in this part: 'w' ignores case (keeping a capital first letter), 'c' matches exactly.
  function cpwFix(spec) {
    var f = spec.split('|'), box = document.getElementById('eng-cpd');
    Array.prototype.forEach.call(box.querySelectorAll('[data-cpw-box]'), function (ta) {
      var re = new RegExp('\\b' + f[1] + '\\b', f[0] === 'w' ? 'gi' : 'g');
      var nv = ta.value.replace(re, function (m) { return f[0] === 'w' && /^[A-Z]/.test(m) ? f[2].charAt(0).toUpperCase() + f[2].slice(1) : f[2]; });
      if (nv !== ta.value) { ta.value = nv; grow(ta); cpwParts()[ta.getAttribute('data-cpw-box')] = nv; }
    });
    cpSave(); cpwCheck();
  }
  // Put text in a box where you're typing (or at its end), with a space either side if it needs one.
  // The teacher in the corner (the user, stuck on an Evaluate box: "wheres bro to help me wheres the teacher"): the
  // examiner from the Biology desk, bottom left of the popup, "Stuck? Click on me.". Tapped, he looks at the box you're
  // in (or the next one that needs work) and says one short tip in his bubble; each tap gives the next. First the big
  // problems (wrong scene, all in one box, mostly retelling), then what the box is for, then sentence starters you can
  // tap in, then how the worked example puts it (to read, not to copy). In the picking steps, how to pick.
  // He is one element on top of the popup (not inside it, so redraws don't replay his entrance or lose his bubble),
  // added when the popup opens and removed when it closes.
  var TCH = null;
  function firstSentences(x, n) { return (String(x).match(/[^.!?]+[.!?]+["'’”]?/g) || [x]).slice(0, n).join('').trim(); }
  function tchTips() {
    if (CPW.part === 'b') {
      if (CPW.step === 1) return [{ id: 'b1', say: 'Pick the scene you can say the most about: one where the abuse of power is clear.' }];
      if (CPW.step === 2) return [{ id: 'b2', say: 'Pick a scene that shows the same thing, or the opposite. The best matches are at the top.' }];
      var cb = cpbCtx(), BP = cpbParts(cb.W, CPW.slot), bp = cpbPartsOf(cb, CPW.slot).filter(function (x) { return !skipped(BP, x.k); }), pt = bp.filter(function (x) { return x.k === CPW.box; })[0] || bp[0], n = wordsIn(BP[pt.k]), r = CPB_RANGE[pt.k], tl = [];
      if (r && n > r[1]) tl.push({ id: 'bl' + pt.k, mood: 'angry', say: 'Too long for this box. Aim for ' + r[0] + '–' + r[1] + ' words.' });
      tl.push({ id: 'bh' + pt.k, say: pt.hint });
      pt.ideas.slice(0, 2).forEach(function (x, i) { tl.push({ id: 'bi' + pt.k + i, say: 'Here\'s one way. Read it, then write your own:', quote: typeof x === 'string' ? x : x.t }); });
      return tl;
    }
    var th = cpTheme(), a = cpBy(th).a, W = cpWrite(th, a), G = th.write[a], s = CPW.slot, para = typeof s === 'number' ? W.paras[s] : null;
    if (CPW.step === 1 && s === 'open') return [{ id: 'o1', say: 'Pick three or four scenes where someone with power uses it on someone weaker. Different kinds of power make a stronger answer.' },
      { id: 'o1b', say: 'Pick the scenes you can say the most about, not just the most dramatic ones.' }];
    if (CPW.step === 1) return [{ id: 'p1', say: 'Pick a scene you haven\'t used yet: the one where the abuse of power is clearest.' }];
    if (CPW.step === 2) return [{ id: 's2', say: 'Pick the meaning you could write the most about. Read how it\'s written under it before you choose.' }];
    var P = slotParts(W, s), keys = slotKeys(s).filter(function (k) { return !skipped(P, k); }), wc = {}, tips = [];
    keys.forEach(function (k) { wc[k] = wordsIn(P[k]); });
    var parts = partsOf(th, a, s), label = {};
    parts.forEach(function (pt) { label[pt.k] = pt.label; });
    var status, list;
    if (para) {
      var sc = G.scenes[para.scene], rp = sc.reps[para.rep || 0], tech = sc.techniques[rp.t] || sc.techniques[0], m = text(a).moments[para.scene - 1];
      var seg = function (k) { return rp.model.filter(function (g) { return g[0] === k; }).map(function (g) { return g[1]; }).join(' '); };
      var all = keys.map(function (k) { return P[k] || ''; }).join(' '), total = wordsIn(all), filled = keys.filter(function (k) { return wc[k]; }).length;
      var other = total >= 20 ? cpwOtherScene(all, G, para.scene) : 0, retell = wc.a > 45 && wc.a > wc.p + wc.e;
      if (other) tips.push({ id: 'scene', mood: 'angry', say: 'Wrong scene. You picked “' + m.title + '”, but this reads like “' + text(a).moments[other - 1].title + '”. Write about yours, or change the scene.', step: true });
      if (filled === 1 && total > 110) tips.push({ id: 'one', mood: 'angry', say: 'It\'s all in one box. Split it: one sentence of Point, a short Anchor, then Evaluate.' });
      else if (retell) tips.push({ id: 'retell', mood: 'angry', say: 'Too much story. The examiner has seen the film. Cut the Anchor to one or two sentences and spend your words on Evaluate.' });
      status = function (k) {
        if (!wc[k]) return 'empty';
        if (k === 'p') return wc.p > CPW_RANGE.p[1] ? 'long' : 'ok';
        if (k === 'a') return wc.a > CPW_RANGE.a[1] ? (retell ? 'ok' : 'long') : !TECH_WORDS.test(P.a) ? 'notech' : 'ok';
        return wc.e < CPW_RANGE.e[0] ? 'short' : 'ok';
      };
      var techs = sc.techniques.map(function (q) { return q.name.toLowerCase(); }).join(', ');
      list = {
        'p empty': [{ say: 'Point first. One sentence: not what happens, but what it says about abuse of power.' },
          { say: 'Start with the idea itself. Tap one to start:', chips: ['Here, Darabont exposes', 'In this scene, power', 'This is the moment where'] },
          { say: 'Here\'s how I\'d put it. Read it, then write your own:', quote: seg('p') }],
        'p long': [{ say: 'Too long for a Point. One sentence: the idea. Save the detail for the Anchor.' }],
        'a empty': [{ say: 'Anchor: the moment, in one or two sentences. Don\'t retell the whole scene.' },
          { say: 'Then say how it\'s filmed. This scene has ' + techs + '. For example:', quote: tech.say },
          { say: 'Here\'s one way. Read it, then write your own:', quote: firstSentences(seg('a'), 1) + ' ' + seg('t') }],
        'a long': [{ say: 'Too long. Cut the Anchor to one or two sentences. The story isn\'t where the marks are.' }],
        'a notech': [{ say: 'Now say how it\'s filmed: one technique lifts your Language mark. This scene has ' + techs + '. For example:', quote: tech.say }],
        'e empty': [{ say: 'Evaluate: why does it matter? Link back to your Point, then say what it tells us about abuse of power.' },
          { say: 'Two or three sentences. Tap one to start:', chips: ['This matters because', 'Ironically, the very', 'Darabont suggests that abuse of power'] },
          { say: 'Here\'s how I\'d start it. Read it, then write your own:', quote: firstSentences(seg('e'), 2) }],
        'e short': [{ say: 'Go further: one more sentence. What does the film say about power here?', chips: ['Darabont suggests that', 'Ultimately,'] }]
      };
    } else {
      status = function (k) { return !wc[k] ? 'empty' : wc[k] > (CPW_RANGE[k] || [0, 70])[1] ? 'long' : 'ok'; };
      list = {};
      parts.forEach(function (pt) {
        list[pt.k + ' empty'] = [{ say: pt.hint }].concat((pt.ideas || []).slice(0, 2).map(function (x) { return { say: 'Here\'s one way. Read it, then write your own:', quote: typeof x === 'string' ? x : x.t }; }));
        list[pt.k + ' long'] = [{ say: 'This part should be short. Cut it back to the one thing it needs to say.' }];
      });
    }
    // The box you're in; if it's fine, the next one that needs work.
    var at = keys.indexOf(CPW.box) < 0 ? 0 : keys.indexOf(CPW.box), k = keys[at], moved = false;
    if (status(k) === 'ok') {
      var nx = keys.slice(at + 1).concat(keys.slice(0, at)).filter(function (x) { return status(x) !== 'ok'; })[0];
      if (nx == null) return tips.concat([{ id: 'done', mood: tips.length ? 'ok' : 'happy', say: para ? 'That\'s a paragraph. Fix anything in the check under it, then go on to the next part.' : 'That\'s this part done. Fix anything in the check, then go on.' }]);
      k = nx; moved = true;
    }
    return tips.concat((list[k + ' ' + status(k)] || []).map(function (t, i) {
      var o = { id: k + status(k) + i, k: k, say: t.say, quote: t.quote, chips: t.chips };
      if (i === 0 && moved) o.say = 'Your ' + label[keys[at]] + ' is fine. ' + o.say;
      return o;
    }));
  }
  function tchEl() {
    if (!TCH) {
      TCH = document.createElement('div'); TCH.className = 'eng-tch'; TCH.setAttribute('data-mood', 'ok');
      TCH.innerHTML = '<div class="eng-tch__say" data-tch-say></div><button type="button" class="eng-tch__fig" data-tch="fig" aria-label="Ask the examiner for help">' +
        (window.ExamTeacher ? window.ExamTeacher.svg() + '<span class="eng-tch__head">' + window.ExamTeacher.head() + '</span>' : '') + '</button>';
    }
    return TCH;
  }
  function tchIdle() {
    var t = tchEl(); clearInterval(t.typer); t.typing = null;
    t.classList.remove('is-helping', 'is-talking'); t.setAttribute('data-mood', 'ok');
    t.querySelector('[data-tch-say]').innerHTML = '<button type="button" class="eng-tch__ask" data-tch="fig">Stuck? <span>Click on me.</span></button>';
    tchPop();
  }
  function tchPop() { var say = TCH.querySelector('[data-tch-say]'); say.classList.remove('is-pop'); void say.offsetWidth; say.classList.add('is-pop'); }
  function tchHelp(again) {
    var t = tchEl(), tips = tchTips(), sig = tips.map(function (x) { return x.id; }).join(',');
    // A warning he's already given in this part isn't repeated when the tips change (you typed): he goes on to the next.
    var st = CPW.tch || (CPW.tch = { i: -1, sig: '', said: {} });
    if (st.sig !== sig || !again) { st.sig = sig; st.i = 0; while (st.i < tips.length - 1 && tips[st.i].mood === 'angry' && st.said[tips[st.i].id]) st.i++; }
    else st.i = Math.min(st.i + 1, tips.length - 1);
    var tip = tips[st.i], last = st.i >= tips.length - 1;
    st.said[tip.id] = 1;
    t.classList.add('is-helping'); t.setAttribute('data-mood', tip.mood || 'ok');
    var say = t.querySelector('[data-tch-say]');
    say.innerHTML = '<p class="eng-tch__line"></p>' +
      '<div class="eng-tch__rest">' + (tip.quote ? '<blockquote class="eng-tch__q">' + esc(tip.quote) + '</blockquote>' : '') +
      (tip.chips ? '<p class="eng-tch__chips">' + tip.chips.map(function (c) { return '<button type="button" class="eng-chip" data-tch="word" data-tch-word="' + esc(c) + '" data-tch-box="' + (tip.k || '') + '">' + esc(c.replace(/,$/, '')) + '…</button>'; }).join('') + '</p>' : '') +
      (tip.step ? '<p class="eng-tch__chips"><button type="button" class="eng-chip" data-cpw-step="1">Change the scene</button></p>' : '') +
      '<p class="eng-tch__btns">' + (last ? '<button type="button" class="eng-btn eng-btn--quiet" data-tch="close">Got it</button>' : '<button type="button" class="eng-btn" data-tch="more">Another tip</button>') +
      '</p></div><button type="button" class="eng-tch__x" data-tch="close" aria-label="Close the tip">×</button>';
    tchPop();
    var line = say.querySelector('.eng-tch__line'), full = tip.say, n = 0;
    clearInterval(t.typer);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { line.textContent = full; say.classList.add('is-done'); return; }
    say.classList.remove('is-done'); t.classList.add('is-talking'); t.typing = full;
    t.typer = setInterval(function () {
      n += 2; line.textContent = full.slice(0, n);
      if (n >= full.length) tchDone();
    }, 22);
  }
  function tchDone() {
    var t = TCH; if (!t || !t.typing) return;
    clearInterval(t.typer); t.querySelector('.eng-tch__line').textContent = t.typing; t.typing = null;
    t.classList.remove('is-talking'); t.querySelector('[data-tch-say]').classList.add('is-done');
  }
  function tchClick(v) {
    var what = v.getAttribute('data-tch');
    if (what === 'close') { tchIdle(); var f = TCH.querySelector('.eng-tch__fig'); if (f) f.focus(); return; }
    if (TCH.typing) { tchDone(); if (what !== 'word') return; }
    if (what === 'word') { cpwInsert(v.getAttribute('data-tch-word'), v.getAttribute('data-tch-box') || null); return; }
    tchHelp(TCH.classList.contains('is-helping'));
  }
  function cpwInsert(word, k) {
    var box = document.getElementById('eng-cpd'), ta = box && box.querySelector('[data-cpw-box="' + (k || CPW.box) + '"]');
    if (!ta) return;
    var mine = document.activeElement === ta || CPW.box === ta.getAttribute('data-cpw-box');
    var i = mine && ta.selectionStart != null ? ta.selectionStart : ta.value.length, j = mine && ta.selectionEnd != null ? ta.selectionEnd : i;
    var before = ta.value.slice(0, i), after = ta.value.slice(j);
    var add = (before && !/\s$/.test(before) ? ' ' : '') + word + (after && /^\S/.test(after) ? ' ' : '');
    ta.value = before + add + after;
    var at = (before + add).length;
    ta.focus(); ta.setSelectionRange(at, at);
    CPW.box = ta.getAttribute('data-cpw-box');
    grow(ta); cpwSave(ta);
  }
  function cpwSave(ta) { cpwParts()[ta.getAttribute('data-cpw-box')] = ta.value; cpSave(); cpwCheck(); }
  function cpwText() {
    var th = cpTheme(), W = cpWrite(th, cpBy(th).a);
    return cpwSlots(W).map(function (s) { return slotText(W, s); }).filter(Boolean).join('\n\n');
  }
  // ----- Part (b), written like part (a) (the user: "you should fucking make it the same as the last one where you pick
  // one key scene from small things and then you click the one to compare with sive ... i want part B) to be like the
  // last one"). A paragraph: pick a scene from the first text (Small Things when part (b) is Sive and Small Things),
  // then the scene from the other text to compare it with (the board's strong matches first), then write it in five
  // boxes: Point, each text's moment, Compare, Evaluate. Opening and ending have two boxes each. Saved in
  // work.writeB: { paras: [{ x, y, parts: { p, x, y, c, e } }], openParts: { texts, points }, endParts: { judge, last } };
  // the paragraphs start from the links made on the board.
  var CPB_RANGE = { p: [15, 30], x: [20, 40], y: [20, 40], c: [25, 50], e: [35, 70], texts: [25, 50], points: [15, 35], judge: [25, 50], last: [10, 25] };
  var CPB_LINKWORDS = ['Similarly,', 'Likewise,', 'In the same way,', 'Both', 'Whereas', 'In contrast,', 'Unlike', 'On the other hand,', 'Even more so,', 'To a far greater extent,', 'Less obviously,', 'Just as'];
  function cpbOrder(B) {
    var th = cpTheme(), f = th ? cpBy(th).bFirst : null;
    if (f && B.indexOf(f) >= 0) return [f].concat(B.filter(function (x) { return x !== f; }));
    return B.indexOf('stlt') >= 0 ? ['stlt'].concat(B.filter(function (x) { return x !== 'stlt'; })) : [B[1], B[0]];
  }
  function cpWriteB(th, a, F) {
    var w = cpWork(th, a);
    if (!w.writeB) {
      w.writeB = { paras: [], openParts: {}, endParts: {} };
      (w.links || []).slice(0, 4).forEach(function (l) { var x = tidOf(l.a) === F[0] ? l.a : l.b; w.writeB.paras.push({ x: x, y: x === l.a ? l.b : l.a, parts: {} }); });
      while (w.writeB.paras.length < 3) w.writeB.paras.push({ parts: {} });
    }
    var W = w.writeB;
    W.openParts = W.openParts || {}; W.endParts = W.endParts || {};
    W.paras.forEach(function (q) { q.parts = q.parts || {}; });
    // The paragraphs follow the pairs picked in step 3, unless one is already written on another pair.
    (w.links || []).slice(0, 4).forEach(function (l, k) {
      var x = tidOf(l.a) === F[0] ? l.a : l.b, y = x === l.a ? l.b : l.a, q = W.paras[k];
      if (!q) { W.paras.push({ x: x, y: y, parts: {} }); return; }
      var blank = !cpbKeys(k).some(function (kk) { return q.parts[kk]; });
      if ((!q.x && !q.y) || (blank && (q.x !== x || q.y !== y))) { q.x = x; q.y = y; }
    });
    return W;
  }
  function cpbCtx() {
    var th = cpTheme(), a = cpBy(th).a, B = cpTexts(th).filter(function (id) { return id !== a; }), F = cpbOrder(B);
    return { th: th, a: a, B: B, F: F, W: cpWriteB(th, a, F) };
  }
  function cpbSlots(W) { return ['open'].concat(W.paras.map(function (q, i) { return i; }), ['end']); }
  function cpbKeys(s) { return typeof s === 'number' ? ['p', 'x', 'y', 'c', 'e'] : s === 'open' ? ['texts', 'points'] : ['judge', 'last']; }
  function cpbParts(W, s) { return s === 'open' ? W.openParts : s === 'end' ? W.endParts : (W.paras[s] || {}).parts || {}; }
  function cpbText(W, s) { var P = cpbParts(W, s); return cpbKeys(s).filter(function (k) { return !skipped(P, k); }).map(function (k) { return String(P[k] || '').trim(); }).filter(Boolean).join(' '); }
  function cpbLink(th, x, y) { return x && y ? cpFind(th, x, y) : null; }
  function cpbName(s) { return s === 'open' ? 'Part (b): opening' : s === 'end' ? 'Part (b): ending' : 'Part (b): paragraph ' + (s + 1); }
  function cpbFirst(W, s) { var q = typeof s === 'number' ? W.paras[s] : null; return q ? (!q.x ? 1 : !q.y ? 2 : 3) : 3; }
  // The page: one row per part, as for part (a).
  function cpbWriterHtml() {
    var c = cpbCtx(), W = c.W, F = c.F, th = c.th, total = 0;
    var rows = cpbSlots(W).map(function (s) {
      var txt = cpbText(W, s), q = typeof s === 'number' ? W.paras[s] : null, L = q ? cpbLink(th, q.x, q.y) : null;
      total += wordsIn(txt);
      return '<li class="eng-cpw__s' + (txt ? ' is-done' : '') + (q ? ' is-card' : ' is-wide') + '">' + (q ? cpwPics([q.x, q.y].filter(Boolean)) : '') + '<div class="eng-cpw__h"><b>' + (s === 'open' ? 'Opening' : s === 'end' ? 'Ending' : 'Paragraph ' + (s + 1)) + '</b>' +
        (L ? '<span class="eng-cpw__rep">' + esc(L.aspect) + '</span>' : '') + (q && q.x ? momChip(q.x) : '') + (q && q.y ? momChip(q.y) : '') +
        '<button type="button" class="eng-btn' + (txt ? ' eng-btn--quiet' : '') + '" data-cpbw="' + s + '">' + (txt ? 'Edit' : 'Write it') + '</button></div>' +
        (txt ? '<p class="eng-cpw__t">' + esc(txt) + '</p>' : q && q.x && q.y ? '' : '<p class="eng-cpw__e">' + (s === 'open' ? 'Name both texts and their authors, answer the question, and say your points.' :
          s === 'end' ? 'Your judgement: which text does it more powerfully, and why.' : 'Pick a scene from ' + esc(shortTitle(F[0])) + ', then the ' + esc(shortTitle(F[1])) + ' scene to compare it with, then write it.') + '</p>') + '</li>';
    });
    return '<h2 class="eng-h2"><span class="eng-cp__n">5</span>Write part (b)</h2>' +
      '<p class="eng-p">Tap <b>Write it</b>, starting with the Opening.</p>' +
      '<ol class="eng-cpw">' + rows.join('') + '</ol>' +
      '<p class="eng-cpw__more">' + (W.paras.length < 4 ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpb-add>+ Add a fourth paragraph</button>' :
        '<button type="button" class="eng-btn eng-btn--quiet" data-cpb-drop>Remove paragraph 4</button>') + '</p>' +
      '<p class="eng-cpw__foot"><span>Part (b) so far: <b>' + total + ' words</b> (aim for about 650)</span>' + (total ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpb-copy>Copy part (b)</button>' : '') + '</p>';
  }
  function cpbOpen(s) {
    var c = cpbCtx();
    CPW = { part: 'b', slot: s, step: cpbFirst(c.W, s), box: cpbKeys(s)[0], shown: {} };
    cpwDraw(true);
  }
  // The boxes of a part, each with its hint and ideas.
  function cpbPartsOf(c, s) {
    var th = c.th, F = c.F, W = c.W, name = th.name.toLowerCase();
    var TA = text(F[0]), TB = text(F[1]), sur = function (t) { return t.author.split(' ').pop(); }, Name = name.charAt(0).toUpperCase() + name.slice(1);
    if (s === 'open') {
      var asp = W.paras.map(function (q) { var L = cpbLink(th, q.x, q.y); return L ? lowerFirst(L.aspect) : ''; }).filter(Boolean);
      return [{ k: 'texts', label: 'Your opening line', hl: 'Name both texts and their authors', hint: 'Name both texts and their authors, and answer the question in one sentence.',
          ideas: ['In ' + TB.title + ' by ' + TB.author + ' and ' + TA.title + ' by ' + TA.author + ', ' + name + ' …', sur(TB) + ' and ' + sur(TA) + ' both use ' + name + ' to keep us hooked.',
            Name + ' drives both ' + TB.title + ' and ' + TA.title + '.'] },
        { k: 'points', label: 'Your points', hl: 'your three or four points', hint: 'Say your three or four points, in the order you\'ll write them.',
          ideas: asp.length ? ['This is clear in ' + ['one way', 'two ways', 'three ways', 'four ways'][asp.length - 1] + ': ' + asp.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.',
            'First, ' + asp[0] + (asp[1] ? '; then, ' + asp[1] : '') + '.', 'I will compare ' + ['one key moment', 'two key moments', 'three key moments', 'four key moments'][asp.length - 1] + ' from each text.'] : [] }];
    }
    if (s === 'end') {
      return [{ k: 'judge', label: 'Your judgement', hl: 'which text', hint: 'Your judgement: which text shows ' + name + ' more powerfully, or keeps you more interested, and why.',
          ideas: [{ t: 'For me, ' + TB.title + ' is more powerful, because …', tag: 'Start with' }, { t: TA.title + ' hits harder, because …', tag: 'Start with' }, { t: 'Both hook the reader, but …', tag: 'Start with' }] },
        { k: 'last', label: 'Your last line', hl: 'Leave the examiner with something', hint: 'Leave the examiner with something: one line that sticks.',
          ideas: ['In the end, both writers show what ' + name + ' costs the powerless.', 'Both texts leave us asking: who will speak up?', 'In both worlds, silence lets ' + name + ' win.'] }];
    }
    var q = W.paras[s], L = cpbLink(th, q.x, q.y), mx = mom(q.x), my = mom(q.y);
    var starts = { same: ['Similarly,', 'Just as', 'Both'], differ: ['Whereas', 'In contrast,', 'Unlike'], degree: ['Even more so,', 'To a far greater extent,', 'Less obviously,'] }[L ? L.rel : 'same'];
    // A link's say is "the point: the comparison"; each half is an idea for its own box.
    var cut = L ? L.say.indexOf(': ') : -1, sayP = L && L.p || (cut > 0 ? L.say.slice(0, cut) + '.' : ''), sayC = L && L.c || (cut > 0 ? L.say.charAt(cut + 2).toUpperCase() + L.say.slice(cut + 3) : (L ? L.say : ''));
    var startWith = function (w) { return { t: w + ' …', tag: 'Start with' }; };
    // The moment in a line or two: the scene's short lines, its quote if it has one, and where it is, to start from.
    var anchor = function (o) {
      var ls = (o.m.anchor || [firstSentence(o.m.what)]).slice();
      if (o.m.quote) ls.splice(1, 0, { t: '“' + o.m.quote + '”', tag: 'Quote' });
      return ls.slice(0, 2).concat([startWith('In ' + o.m.where + ',')]);
    };
    return [
      { k: 'p', label: 'Point', hl: 'One sentence about both texts', hint: 'One sentence about both texts: what they both show about ' + name + '.',
        ideas: (sayP ? [sayP] : []).concat([startWith(sur(TB) + ' and ' + sur(TA) + ' both show that'), startWith('In both texts,'), startWith('Both scenes show')]).slice(0, 3) },
      { k: 'x', label: shortTitle(F[0]), hl: 'Keep it short', hint: 'Keep it short: the moment in ' + shortTitle(F[0]) + ', in a sentence or two. Don\'t retell the story.', ideas: anchor(mx) },
      { k: 'y', label: shortTitle(F[1]), hl: 'Keep it short', hint: 'Keep it short: the moment in ' + shortTitle(F[1]) + ', in a sentence or two.', ideas: anchor(my) },
      { k: 'c', label: 'Compare', hl: 'How they\'re alike or different', hint: 'How they\'re alike or different: Similarly… Whereas… Even more so…',
        ideas: (sayC ? [sayC] : []).concat(starts.map(startWith)).slice(0, 3) },
      { k: 'e', label: 'Evaluate', hl: 'Most of the marks are here', hint: 'Most of the marks are here: why it matters for ' + name + ', and how it keeps the reader hooked.',
        ideas: ['This matters because …', 'Both kept me gripped because …', L && L.rel === 'differ' ? 'The difference shows that …' : 'Together they suggest that …'] }];
  }
  function cpbMini(mid) {
    var o = mom(mid), tid = tidOf(mid), pic = scenePics(tid, mid)[0];
    return '<div class="eng-cpb__m" style="--c:' + COL[tid] + '">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="">' : '<span class="eng-cpb__ph"></span>') +
      '<div><span>' + esc(shortTitle(tid)) + '</span><b>' + esc(o.m.title) + '</b></div></div>';
  }
  // Keep the scene recap concrete. The student builds the thematic comparison for themselves in the PACE boxes below.
  function cpbSceneRecap(mid) {
    var o = mom(mid), tid = tidOf(mid);
    return '<p><b>' + esc(sceneWhere(tid, o.m)) + ':</b> ' + esc(firstSentences(o.m.what, 2)) + '</p>';
  }
  // What actually happens, under the scene you're writing about (the user: "under the scenes you see when writing the essay
  // put context underneath them of what actually happens"): the text and where in it, e.g. "Sive (Act 1, Scene 2)".
  // The "What happens" box can be folded away (the user: "there should he an arrow underneath the scene and it should say
  // \"hide\" for bith"): an arrow and Hide under both scenes' text; folded, it's one line with Show. It stays folded, in
  // part (a) and part (b), until shown again (localStorage eng-recap-hide).
  var CHEV = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 12.5 10 7.5l5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function recapBox(h, inner) {
    var hid = store('eng-recap-hide') === '1';
    return '<div class="eng-cpb__recap' + (hid ? ' is-hid' : '') + '"><h3>' + esc(h) + '</h3>' + (hid ? '' : inner) +
      '<button type="button" class="eng-cpb__rhide" data-recap-hide aria-expanded="' + !hid + '">' + CHEV + (hid ? 'Show' : 'Hide') + '</button></div>';
  }
  // Phones: before you write a paragraph, a swipe-through, one screen at a time like TikTok (the user: "if it were put in a
  // scroll thing and a finger to animate so they know they are suppozed to scroll and it goes through it like a scroll but
  // more like a video where everything gets animated in (the information) not just like a fucking page, and then scroll to
  // a buttom the says \"start\" to which point you get to the essay writing section"): the question; each scene, its picture
  // and then what happens a sentence at a time; what it represents, or what links the two; then Start. It plays when the
  // paragraph is still empty; "Watch the intro again" plays it after.
  function isPhone() { return !!(window.matchMedia && window.matchMedia('(max-width: 700px)').matches); }
  function storyOn(txt) { return isPhone() && (CPW.storyForce || (!CPW.storyDone && !txt)); }
  var NUMW = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  function inEl(tag, cls, html, d) { return '<' + tag + ' class="eng-in' + (cls ? ' ' + cls : '') + '" style="--d:' + d + 'ms">' + html + '</' + tag + '>'; }
  function storySentences(x) { return (String(x).match(/[^.!?]+[.!?]+["'’”]?/g) || [String(x)]).map(function (y) { return y.trim(); }); }
  function storyIntro(kicker, big, part) {
    return inEl('p', 'eng-story__k', esc(kicker), 0) + inEl('h3', 'eng-story__big', esc(big), 160) + inEl('div', 'eng-story__q', cpQ(part), 380) +
      '<div class="eng-story__hint" aria-hidden="true"><span>👆</span><b>Swipe up</b></div>';
  }
  // A scene: its picture with the title over it, like a video's caption, then its story told in short beats, one after another.
  function storyScene(tid, m) {
    var pic = scenePics(tid, m.id)[0], beats = m.tell && m.tell.length ? m.tell : storySentences(m.what);
    return '<div class="eng-in eng-story__hero' + (pic ? '' : ' is-nopic') + '" style="--d:0ms;--c:' + COL[tid] + '">' + (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="">' : '') +
      '<div class="eng-story__cap"><p class="eng-story__k">' + esc(sceneWhere(tid, m)) + '</p><h3 class="eng-story__t">' + esc(m.title) + '</h3></div></div>' +
      beats.map(function (x, i) { return inEl('p', 'eng-story__p eng-story__beat', esc(x), 500 + i * 450); }).join('');
  }
  function storyStart(parts, back) {
    return inEl('p', 'eng-story__k', 'Now write it', 0) + inEl('h3', 'eng-story__big', NUMW[parts.length] + ' short boxes', 160) +
      '<ol class="eng-story__boxes">' + parts.map(function (pt, i) { return inEl('li', '', esc(pt.label), 320 + i * 110); }).join('') + '</ol>' +
      inEl('div', 'eng-story__go', '<button type="button" class="eng-btn" data-story-start>Start</button><button type="button" class="eng-btn eng-btn--quiet" ' + back + '>Change the scenes</button>', 420 + parts.length * 110);
  }
  function storyHtml(slides) {
    return '<div class="eng-storyw"><div class="eng-story" data-story>' + slides.map(function (x, i) {
      return '<section class="eng-story__s" data-story-i="' + i + '">' + x + (i && i < slides.length - 1 ? '<span class="eng-story__more" aria-hidden="true"></span>' : '') + '</section>';
    }).join('') + '</div><ol class="eng-story__dots" aria-hidden="true">' + slides.map(function (x, i) { return '<li' + (i ? '' : ' class="is-on"') + '></li>'; }).join('') + '</ol></div>';
  }
  // Each screen animates in when it scrolls into view; the dots on the right show where you are.
  function storyWire(box) {
    var st = box.querySelector('[data-story]');
    if (!st) return;
    var ss = st.querySelectorAll('.eng-story__s'), dots = box.querySelectorAll('.eng-story__dots li');
    var show = function (el) {
      var i = +el.getAttribute('data-story-i');
      el.classList.add('is-in');
      Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle('is-on', k === i); });
      if (i) st.classList.add('is-moved');
    };
    if (!window.IntersectionObserver) { Array.prototype.forEach.call(ss, show); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) show(e.target); }); }, { root: st, threshold: 0.4 });
    Array.prototype.forEach.call(ss, function (x) { io.observe(x); });
  }
  function cpwStory(th, a, s) {
    var W = cpWrite(th, a), G = th.write[a], para = W.paras[s], m = text(a).moments[para.scene - 1], sc = G.scenes[para.scene], rp = sc.reps[para.rep || 0];
    return [storyIntro('Part (a) · Paragraph ' + (s + 1), 'One scene. One idea.', 'a'), storyScene(a, m),
      inEl('p', 'eng-story__k', 'What it represents', 0) + inEl('h3', 'eng-story__big', esc(rp.title), 160) + inEl('p', 'eng-story__p', esc(rp.say), 380) +
        inEl('p', 'eng-story__techs', 'Techniques: ' + sc.techniques.map(function (q) { return '<i>' + esc(q.name) + '</i>'; }).join(''), 600),
      storyStart(partsOf(th, a, s), 'data-cpw-step="1"')];
  }
  function cpbStory(c, s, q) {
    var L = cpbLink(c.th, q.x, q.y);
    return [storyIntro('Part (b) · Paragraph ' + (s + 1), 'Two scenes. One paragraph.', 'b'), storyScene(tidOf(q.x), mom(q.x).m), storyScene(tidOf(q.y), mom(q.y).m),
      inEl('p', 'eng-story__k', 'What links them', 0) + inEl('h3', 'eng-story__big', esc(L ? L.aspect : 'Your own link'), 160) +
        inEl('p', 'eng-story__p', esc(L ? L.say : 'These two aren\'t one of the strong matches, so how they compare is up to you.'), 380),
      storyStart(cpbPartsOf(c, s), 'data-cpb-step="1"')];
  }
  function storyAgain() { return '<p class="eng-story__again"><button type="button" class="eng-btn eng-btn--quiet" data-story-replay>▶ Watch the intro again</button></p>'; }
  function sceneWhere(tid, m) { return shortTitle(tid) + (m.where ? ' (' + m.where + ')' : ''); }
  function cpbCard(mid, on, extra, attr, i) {
    var o = mom(mid), tid = tidOf(mid), pic = scenePics(tid, mid)[0];
    return '<button type="button" class="eng-cpd__sc' + (on ? ' is-on' : '') + '" ' + attr + ' style="--c:' + COL[tid] + ';--i:' + i + '">' +
      (pic ? '<img src="assets/eng/img/' + esc(pic.file) + '" alt="" loading="lazy">' : '<span class="eng-cpd__ph"></span>') +
      '<span class="eng-cpd__sct">' + esc(o.m.title) + '</span>' + sceneCtx(o.m) + (extra || '') + '</button>';
  }
  function cpbDraw(focus) {
    var box = document.getElementById('eng-cpd');
    if (!box) {
      box = document.createElement('div'); box.id = 'eng-cpd'; box.className = 'eng-cpd is-new'; document.body.appendChild(box);
      setTimeout(function () { box.classList.remove('is-new'); }, 300);
    }
    document.body.classList.add('eng-cpd-on');
    var c = cpbCtx(), th = c.th, F = c.F, W = c.W, s = CPW.slot, q = typeof s === 'number' ? W.paras[s] : null, body = '', foot = '', writing = false;
    var story = q && q.x && q.y && CPW.step === 3 && storyOn(cpbText(W, s)) ? storyHtml(cpbStory(c, s, q)) : '', again = !story && q && CPW.step === 3 && isPhone() ? storyAgain() : '';
    var key = 'b' + s + '/' + CPW.step + (story ? '/story' : ''), oldBody = box.querySelector('.eng-cpd__body'), keep = box.getAttribute('data-key') === key && oldBody ? oldBody.scrollTop : 0, fresh = box.getAttribute('data-key') !== key;
    if (fresh) { box.setAttribute('data-key', key); box.classList.add('is-fresh'); clearTimeout(box.cpT); box.cpT = setTimeout(function () { box.classList.remove('is-fresh'); }, 1700); }
    var steps = q ? ['Scene in ' + shortTitle(F[0]), 'Scene in ' + shortTitle(F[1]), 'Write it'] : null;
    var head = '<div class="eng-cpd__top"><h2 id="eng-cpd-h">' + cpbName(s) + '</h2>' +
      (steps ? '<ol class="eng-cpd__steps">' + steps.map(function (x, i) {
        return '<li class="' + (CPW.step === i + 1 ? 'is-on' : CPW.step > i + 1 ? 'is-done' : '') + '"' + (CPW.step === i + 1 ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + esc(x) + '</li>';
      }).join('') + '</ol>' : '') + cpQ('b') + '<button type="button" class="eng-cpd__x" data-cpw-close aria-label="Close">×</button></div>';
    // On a phone the steps and the question scroll away with the page instead of staying pinned (the user: "on mobile this
    // is distracting"): the same two, at the top of the body, shown only on phones.
    var mhead = '<div class="eng-cpd__mhead">' + head.replace(/^.*?<\/h2>/, '').replace(/<button type="button" class="eng-cpd__x"[^]*$/, '') + '</div>';
    if (q && CPW.step === 1) {
      body = '<p class="eng-cpd__lead">Pick the key scene from <i>' + esc(text(F[0]).title) + '</i> this paragraph is built on.</p><div class="eng-cpd__scenes">' +
        text(F[0]).moments.map(function (m, i) {
          var at = W.paras.map(function (o, k) { return k !== s && o.x === m.id ? k + 1 : 0; }).filter(Boolean);
          return cpbCard(m.id, q.x === m.id, at.length ? '<span class="eng-cpd__used">Already in paragraph ' + at.join(', ') + '</span>' : '', 'data-cpb-x="' + m.id + '"', i);
        }).join('') + '</div>';
    } else if (q && CPW.step === 2) {
      var linked = {};
      th.links.forEach(function (l) { if (l.a === q.x || l.b === q.x) { var o = l.a === q.x ? l.b : l.a; if (tidOf(o) === F[1]) linked[o] = l; } });
      var ms = text(F[1]).moments.slice().sort(function (m1, m2) { return (linked[m2.id] ? 1 : 0) - (linked[m1.id] ? 1 : 0); });
      body = '<div class="eng-cpb__pair">' + cpbMini(q.x) + '</div><p class="eng-cpd__lead">Now pick the <i>' + esc(text(F[1]).title) + '</i> scene to compare it with.' +
        (Object.keys(linked).length ? ' <b>The best matches are first.</b>' : '') + '</p><div class="eng-cpd__scenes">' +
        ms.map(function (m, i) {
          var l = linked[m.id];
          return cpbCard(m.id, q.y === m.id, l ? '<span class="eng-cpd__scr"><em>Best match, ' + esc((REL[l.rel] || '').toLowerCase()) + ':</em> ' + esc(l.aspect) + '</span>' : '', 'data-cpb-y="' + m.id + '"', i);
        }).join('') + '</div>';
      foot = '<button type="button" class="eng-btn eng-btn--quiet" data-cpb-step="1">Back</button>';
    } else {
      writing = true;
      var top;
      if (q) {
        top = '<div class="eng-cpb__pair">' + cpbMini(q.x) + cpbMini(q.y) + '</div>' +
          recapBox('What happens in these key scenes', cpbSceneRecap(q.x) + cpbSceneRecap(q.y));
      } else {
        var hid = store('eng-plan-hide') === '1';
        top = '<div class="eng-cpb__list' + (hid ? ' is-hid' : '') + '"><p class="eng-cpb__lh"><b>Your plan</b><button type="button" class="eng-cpb__hide" data-plan-hide aria-expanded="' + !hid + '">' + (hid ? 'Show plan' : 'Hide plan') + '</button></p>' +
          (hid ? '' : W.paras.map(function (o, k) {
            var L2 = cpbLink(th, o.x, o.y);
            return '<p><b>Paragraph ' + (k + 1) + '</b>' + (o.x ? momChip(o.x) : '') + (o.y ? momChip(o.y) : '') + (L2 ? '<span>' + esc(L2.aspect) + '</span>' : '') + '</p>';
          }).join('')) + '</div>';
      }
      var P = cpbParts(W, s), PC = { p: 'var(--pace-p)', x: COL[F[0]], y: COL[F[1]], c: 'var(--k-blue)', e: '#FF8FB1', texts: 'var(--pace-p)', points: 'var(--k-blue)', judge: 'var(--k-orange)', last: '#FF8FB1' };
      body = top + '<div class="eng-cpd__write"><div class="eng-cpd__parts">' + cpbPartsOf(c, s).map(function (pt, pi) {
        if (skipped(P, pt.k)) return skipPart(pt, PC[pt.k], pi);
        return '<section class="eng-cpd__part" style="--pc:' + PC[pt.k] + ';--i:' + pi + '"><header><span class="eng-cpd__pl">' + esc(pt.label) + '</span><span class="eng-cpd__ph2">' +
          esc(pt.hint).replace(esc(pt.hl), '<mark class="eng-cpd__hl">' + esc(pt.hl) + '</mark>') + '</span></header>' +
          ideasHtml(pt) +
          '<textarea data-cpw-box="' + pt.k + '" spellcheck="true" lang="en-IE" rows="2" aria-label="' + esc(pt.label) + '" placeholder="Write it in your own words…">' + esc(P[pt.k] || '') + '</textarea>' +
          skipRow(pt.k, '<p class="eng-cpd__wc" data-cpw-wc="' + pt.k + '" aria-live="polite">' + wcHtml(wordsIn(P[pt.k]), CPB_RANGE[pt.k]) + '</p>') + '</section>';
      }).join('') + '<p class="eng-cpd__tools"><b>How it reads</b><span data-cpw-count></span></p><div class="eng-cpd__check" data-cpw-check role="status" aria-live="polite"></div></div>' +
        '<aside class="eng-cpd__bank"><h3>Linking words</h3><p class="eng-cpd__hint">Tap one to add it to the box you\'re in.</p><p class="eng-cpd__inst">' +
        CPB_LINKWORDS.map(function (x) { return '<button type="button" class="eng-chip" data-cpw-word="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') +
        '</p><h3>Instead of “shows”</h3><p class="eng-cpd__inst">' + th.instead.map(function (x) { return '<button type="button" class="eng-chip" data-cpw-word="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</p></aside></div>';
      var sl = cpbSlots(W), next = sl[sl.indexOf(s) + 1];
      foot = (q ? '<button type="button" class="eng-btn eng-btn--quiet" data-cpb-step="2">Back</button>' : '') +
        (next != null ? '<button type="button" class="eng-btn" data-cpb-next>Next: ' + (next === 'end' ? 'Ending' : 'Paragraph ' + (next + 1)) + '</button>' : '') +
        '<button type="button" class="eng-btn' + (next != null ? ' eng-btn--quiet' : '') + '" data-cpw-close>Done</button>';
    }
    box.innerHTML = '<div class="eng-cpd__bg" data-cpw-close></div><div class="eng-cpd__box" role="dialog" aria-modal="true" aria-labelledby="eng-cpd-h">' + head +
      '<div class="eng-cpd__body">' + (story || mhead + again + body + (foot ? '<p class="eng-btns eng-cpd__foot">' + foot + '</p>' : '')) + '</div></div>';
    box.classList.toggle('is-write', writing);
    box.classList.toggle('is-story', !!story); document.body.classList.toggle('eng-story-on', !!story);
    if (story) storyWire(box);
    railDraw();
    if (fresh) { CPW.tch = null; tchIdle(); }
    if (!tchEl().parentNode) document.body.appendChild(TCH);
    Array.prototype.forEach.call(box.querySelectorAll('[data-cpw-box]'), grow);
    cpwCheck();
    if (keep) box.querySelector('.eng-cpd__body').scrollTop = keep;
    cpwTypeIn(box);
    if (focus && !keep) {
      var f = box.querySelector('[data-cpw-box="' + CPW.box + '"]') || box.querySelector('.eng-cpd__sc.is-on') || box.querySelector('[data-cpb-x], [data-cpb-y]') || box.querySelector('[data-cpw-close]');
      if (f) f.focus({ preventScroll: true });
      var bd = box.querySelector('.eng-cpd__body'); if (bd) bd.scrollTop = 0;
    }
  }
  function cpbClick(t) {
    var v, c = cpbCtx(), W = c.W, s = CPW.slot, q = typeof s === 'number' ? W.paras[s] : null;
    if (q && (v = t.closest('[data-cpb-x]'))) { var mx = v.getAttribute('data-cpb-x'); if (q.x !== mx) { q.x = mx; q.y = null; } CPW.step = 2; CPW.shown = {}; cpSave(); cpwDraw(true); return true; }
    if (q && (v = t.closest('[data-cpb-y]'))) { q.y = v.getAttribute('data-cpb-y'); CPW.step = 3; CPW.box = 'p'; CPW.shown = {}; cpSave(); cpwDraw(true); return true; }
    if ((v = t.closest('[data-cpb-step]'))) { CPW.step = +v.getAttribute('data-cpb-step'); cpwDraw(true); return true; }
    if (t.closest('[data-plan-hide]')) {
      store('eng-plan-hide', store('eng-plan-hide') === '1' ? '0' : '1'); cpwDraw();
      var hb = document.querySelector('[data-plan-hide]'); if (hb) hb.focus({ preventScroll: true });
      return true;
    }
    if (t.closest('[data-cpb-next]')) {
      var sl = cpbSlots(W), nx = sl[sl.indexOf(s) + 1];
      CPW = { part: 'b', slot: nx, step: cpbFirst(W, nx), box: cpbKeys(nx)[0], shown: {} }; cpwDraw(true); return true;
    }
    return false;
  }
  // Which box object a typed box saves into, for either part.
  function cpwParts() { var th = cpTheme(), a = cpBy(th).a; return CPW && CPW.part === 'b' ? cpbParts(cpbCtx().W, CPW.slot) : slotParts(cpWrite(th, a), CPW.slot); }
  function boxRange(k) { return CPW && CPW.part === 'b' ? CPB_RANGE[k] : CPW_RANGE[k]; }
  function cpwClick(t) {
    var v, th = cpTheme(), a = cpBy(th).a, W = cpWrite(th, a), G = th.write[a];
    if ((v = t.closest('[data-cpw]'))) { cpwOpen(slotOf(v.getAttribute('data-cpw'))); return true; }
    if ((v = t.closest('[data-cpbw]'))) { cpbOpen(slotOf(v.getAttribute('data-cpbw'))); return true; }
    if (t.closest('[data-cpb-add]')) { var cb = cpbCtx(); if (cb.W.paras.length < 4) cb.W.paras.push({ parts: {} }); cpSave(); renderCompare(); return true; }
    if (t.closest('[data-cpb-drop]')) {
      var cb2 = cpbCtx(), q4b = cb2.W.paras[3];
      if (q4b && cpbKeys(3).some(function (k) { return q4b.parts[k]; }) && !window.confirm('Remove paragraph 4 of part (b) and what you wrote in it?')) return true;
      cb2.W.paras.length = 3; cpSave(); renderCompare(); return true;
    }
    if (t.closest('[data-cpb-copy]')) { var cb3 = cpbCtx(); copy(cpbSlots(cb3.W).map(function (x) { return cpbText(cb3.W, x); }).filter(Boolean).join('\n\n'), t.closest('[data-cpb-copy]')); return true; }
    if (t.closest('[data-cpw-add]')) { if (W.paras.length < 4) W.paras.push({ parts: { p: '', a: '', e: '' } }); cpSave(); renderCompare(); return true; }
    if (t.closest('[data-cpw-drop]')) {
      var q4 = W.paras[3];
      if (q4 && slotKeys(3).some(function (k) { return q4.parts && q4.parts[k]; }) && !window.confirm('Remove paragraph 4 and what you wrote in it?')) return true;
      W.paras.length = 3; cpSave(); renderCompare(); return true;
    }
    if (t.closest('[data-cpw-copy]')) { copy(cpwText(), t.closest('[data-cpw-copy]')); return true; }
    if (!CPW) return false;
    if (CPW.part === 'b' && cpbClick(t)) return true;
    var para = typeof CPW.slot === 'number' ? W.paras[CPW.slot] : null;
    if (t.closest('[data-cpw-close]')) { cpwClose(); return true; }
    if ((v = t.closest('[data-cpw-scene]'))) {
      var n = +v.getAttribute('data-cpw-scene');
      if (para.scene !== n) { para.scene = n; para.rep = 0; para.picked = G.scenes[n].reps.length === 1; CPW.shown = {}; }
      CPW.step = 2; CPW.just = CPW.slot;
      cpSave(); cpwDraw(true); return true;
    }
    if ((v = t.closest('[data-cpw-pick]'))) {
      var pn = +v.getAttribute('data-cpw-pick'), at = CPW.pick.indexOf(pn);
      if (at >= 0) CPW.pick.splice(at, 1); else if (CPW.pick.length < 4) CPW.pick.push(pn);
      cpwDraw(); var again = document.querySelector('#eng-cpd [data-cpw-pick="' + pn + '"]'); if (again) again.focus({ preventScroll: true });
      return true;
    }
    if (t.closest('[data-cpw-picked]')) {
      // Three or four: a fourth paragraph is added, or dropped (asking first if it has writing).
      if (CPW.pick.length < W.paras.length) {
        if (W.paras.slice(CPW.pick.length).some(function (q) { return slotKeys(0).some(function (k) { return q.parts && q.parts[k]; }); }) &&
          !window.confirm('Remove paragraph 4 and what you wrote in it?')) return true;
        W.paras.length = CPW.pick.length;
      }
      while (W.paras.length < CPW.pick.length) W.paras.push({ parts: { p: '', a: '', e: '' } });
      CPW.pick.forEach(function (sn, k) { var q = W.paras[k]; if (q.scene !== sn) { q.scene = sn; q.rep = 0; q.picked = G.scenes[sn].reps.length === 1; } });
      CPW.step = 2; cpSave(); cpwDraw(true); return true;
    }
    if ((v = t.closest('[data-cpw-orep]'))) {
      var kr = v.getAttribute('data-cpw-orep').split('|'), q = W.paras[+kr[0]];
      q.rep = +kr[1]; q.picked = true; CPW.just = +kr[0]; cpSave(); cpwDraw(); var b2 = document.querySelector('#eng-cpd [data-cpw-orep="' + kr.join('|') + '"]'); if (b2) b2.focus({ preventScroll: true });
      return true;
    }
    if ((v = t.closest('[data-cpw-rep]'))) {
      para.rep = +v.getAttribute('data-cpw-rep'); para.picked = true; CPW.just = CPW.slot; cpSave(); cpwDraw();
      var b3 = document.querySelector('#eng-cpd [data-cpw-rep="' + para.rep + '"]'); if (b3) b3.focus({ preventScroll: true });
      return true;
    }
    if ((v = t.closest('[data-cpw-step]'))) {
      CPW.step = +v.getAttribute('data-cpw-step');
      if (CPW.slot === 'open' && CPW.step === 1) CPW.pick = W.paras.map(function (p) { return p.scene; }).filter(Boolean);
      if (CPW.step === 3) CPW.box = slotKeys(CPW.slot)[0];
      cpwDraw(true); return true;
    }
    if (t.closest('[data-cpw-next]')) {
      var sln = cpwSlots(W), nx = sln[sln.indexOf(CPW.slot) + 1];
      CPW = { slot: nx, step: cpwFirstStep(W, nx), box: slotKeys(nx)[0], pick: [], shown: {} }; cpwDraw(true); return true;
    }
    if (t.closest('[data-story-start]')) {
      // Start lands on the writing boxes; the scenes and the question are still there above, if you scroll up.
      CPW.storyDone = true; CPW.storyForce = false; cpwDraw();
      var sb = document.querySelector('#eng-cpd .eng-cpd__body'), wr = sb && sb.querySelector('.eng-cpd__write');
      if (wr) sb.scrollTop += wr.getBoundingClientRect().top - sb.getBoundingClientRect().top - 12;
      return true;
    }
    if (t.closest('[data-story-replay]')) { CPW.storyDone = false; CPW.storyForce = true; cpwDraw(); return true; }
    if (t.closest('[data-recap-hide]')) {
      store('eng-recap-hide', store('eng-recap-hide') === '1' ? '0' : '1'); cpwDraw();
      var rh = document.querySelector('#eng-cpd [data-recap-hide]'); if (rh) rh.focus({ preventScroll: true });
      return true;
    }
    if ((v = t.closest('[data-cpw-ideas]'))) { var ki = v.getAttribute('data-cpw-ideas'); ideasSet(ki, !(CPW.ideas && CPW.ideas[ki])); return true; }
    if ((v = t.closest('[data-cpw-skip]'))) {
      var ks = v.getAttribute('data-cpw-skip'), PS = cpwParts();
      PS._skip = PS._skip || {};
      if (PS._skip[ks]) delete PS._skip[ks]; else PS._skip[ks] = 1;
      cpSave(); cpwDraw();
      var fs = document.querySelector('#eng-cpd [data-cpw-box="' + ks + '"]') || document.querySelector('#eng-cpd [data-cpw-skip="' + ks + '"]');
      if (fs) fs.focus({ preventScroll: true });
      return true;
    }
    if ((v = t.closest('[data-cpw-more]'))) {
      var km = v.getAttribute('data-cpw-more');
      CPW.shown = CPW.shown || {}; CPW.shown[km] = (CPW.shown[km] || 1) + 1; cpwDraw();
      var bm = document.querySelector('#eng-cpd [data-cpw-more="' + km + '"]') || document.querySelector('#eng-cpd [data-cpw-box="' + km + '"]'); if (bm) bm.focus({ preventScroll: true });
      return true;
    }
    if ((v = t.closest('[data-tch]'))) { tchClick(v); return true; }
    if ((v = t.closest('[data-cpw-fix]'))) { cpwFix(v.getAttribute('data-cpw-fix')); return true; }
    if ((v = t.closest('[data-cpw-word]'))) { cpwInsert(v.getAttribute('data-cpw-word')); return true; }
    return false;
  }
  document.addEventListener('input', function (ev) { if (CPW && ev.target.matches && ev.target.matches('[data-cpw-box]')) { grow(ev.target); cpwSave(ev.target); } });
  document.addEventListener('focusin', function (ev) {
    if (CPW && ev.target.matches && ev.target.matches('[data-cpw-box]')) { CPW.box = ev.target.getAttribute('data-cpw-box'); ideasSet(CPW.box, false); }
  });
  document.addEventListener('keydown', function (ev) {
    if (!CPW) return;
    if (ev.key === 'Escape') { ev.preventDefault(); if (TCH && TCH.classList.contains('is-helping')) { tchIdle(); return; } cpwClose(); return; }
    if (ev.key === 'Tab') {
      // Keep Tab inside the popup.
      var f = Array.prototype.filter.call(document.querySelectorAll('#eng-cpd .eng-cpd__box button:not([disabled]), #eng-cpd .eng-cpd__box textarea, #eng-cpd .eng-cpd__box a[href], .eng-tch button'), function (e) { return e.offsetParent !== null; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); }
    }
  });

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
    if (!E) E = { mode: myTheme() ? 'theme' : 'gvv', type: '70', q: '', thesis: '', aspects: [], intro: '', paras: {}, end: '', step: 0 };
    E.type = E.type || '70';
    E.parasA = E.parasA || {};
    E.crack = E.crack || {};
    E.stance = E.stance || {};
    return E;
  }
  function saveEssay() { store('eng-essay', JSON.stringify(E)); }
  function split() { return essay().type === 'split'; }
  // A two-part question while a Compare it theme is on the go: part (a) is written in Compare it, so here it's part (b)
  // only (the user: "we are on part fucking b so why even mention part a and shawshank"): the question shows part (b),
  // the texts are part (b)'s two, no part (a) paragraphs, part (b)'s words and marks.
  function bOnly() { return split() && !!myTheme(); }
  // Part (a)'s text, and the texts compared (all three for a 70-mark answer; the other two for part (b)).
  // The theme you write about on a Theme or Issue question (the user: "under that question should be a list of themes
  // that you choose from"): the one picked under the question, else your Compare it theme. The choices are your
  // Compare it theme and the themes the text notes cover (the Theme mode's topics).
  function themeChoices() { var th = myTheme(), list = MODE.theme ? (MODE.theme.topics || []).slice() : []; if (th && list.indexOf(th.name) < 0) list.unshift(th.name); return list; }
  function themeName() { var e = essay(), c = themeChoices(); return e.theme && c.indexOf(e.theme) >= 0 ? e.theme : (myTheme() ? myTheme().name : ''); }
  function themePick() {
    var e = essay(), c = themeChoices(), on = themeName();
    if (e.mode !== 'theme' || !e.q || !c.length) return '';
    return '<div class="ebd-themes"><span>Pick your theme</span><div>' + c.map(function (x) {
      return '<button type="button" class="eng-chip" data-eb-theme="' + esc(x) + '" aria-pressed="' + (x === on) + '">' + esc(x) + '</button>';
    }).join('') + '</div></div>';
  }
  // The essay's three texts: with a Compare it theme on the go, the same three as Compare it (the user, given Small
  // Things, Sive and Othello here while Compare it had Sive, Small Things and Shawshank: "is this a prank?"); else
  // your texts from the home page.
  function ebTexts() { var th = myTheme(); return th ? cpTexts(th) : chosen(); }
  // With a Compare it theme, part (a) is Compare it's part (a) text, and picking it here changes it there too, so the
  // two pages always agree; otherwise the one you picked here, else your first text.
  function textA() {
    var e = essay(), m = ebTexts(), th = myTheme(), ca = th ? cpState().by[th.id].a : null;
    return ca && m.indexOf(ca) >= 0 ? ca : m.indexOf(e.textA) >= 0 ? e.textA : m[0];
  }
  function compared() { var m = ebTexts(); return split() ? m.filter(function (t) { return t !== textA(); }) : m; }
  function stepsList() {
    var e = essay(), pts = function (pre, name) { return e.aspects.map(function (a, k) { return [pre + k, name + (k + 1)]; }); };
    // No Plan step (the user, of picking aspects: "do i have to do this its not engaging"): the paragraphs are picked
    // for the question (autoPlan) and can be changed from the first writing step.
    // ... then "but put it into a game or something": Plan is a card game (planGameHtml), and Pick for me does it for you.
    if (split()) return [['q', 'Question'], ['plan', 'Plan']].concat(bOnly() ? [] : pts('a', '(a) Point ')).concat([['intro', '(b) Introduction']]).concat(pts('p', '(b) Point ')).concat([['end', '(b) Conclusion'], ['check', 'Check']]);
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
      var hay = (a + ' ' + ebTexts().map(function (t) { return pointsFor(e.mode, a, t).join(' '); }).join(' ')).toLowerCase(), sc = 0;
      words.forEach(function (w) { if (w.length >= 5 && hay.indexOf(w) >= 0) sc += a.toLowerCase().indexOf(w) >= 0 ? 3 : 1; });
      LINKS.forEach(function (l) { if (l[0].test(ql) && l[1].test(a.toLowerCase())) sc += 12; });
      return [sc, -i, a];
    }).sort(function (x, y) { return y[0] - x[0] || y[1] - x[1]; });
    return scored;
  }
  function aspectOptions(mode) {
    var names = [], seen = {};
    ebTexts().forEach(function (t) { modeRows(mode, t).forEach(function (r) { if (!seen[r[0]] && r[0] !== 'Outlook' && r[0] !== 'More' && r[1].length) { seen[r[0]] = 1; names.push(r[0]); } }); });
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
    if (split() && !bOnly()) e.aspects.forEach(function (x) { var s = paraText(e.parasA[x] || {}, ['P', 'A', 'E']); if (s) a.push(s); });
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
  // On a Theme or Issue question with your Compare it theme, "a particular theme or issue" (and the like) is your theme,
  // filled in (the user: "why the fuck is this here the theme or issue if abuse of power is already chosen").
  var Q_THEME = /\b(?:(?:a|an|the|this|that|your)\s+)?(?:(?:particular|same|chosen|central|key)\s+)?theme or issue(?:\s+(?:you (?:have )?studied|you have chosen(?: to discuss)?|on your (?:comparative )?course))?/gi;
  // Part (b) on its own: "(as discussed in (a) above)", "discussed in 1. (a) above," and the like come out.
  function noBackRef(t) {
    return t.replace(/\s*(,\s*)?\(?(?:as\s+)?(?:you\s+)?(?:discussed|dealt with)\s+in\s+(?:part\s+)?(?:1\.?\s*)?\(a\)\s+above\)?(\s*,)?/gi, function (m, c1, c2) { return c1 && c2 ? '' : c2 ? ',' : ''; });
  }
  var Q_THEME2 = /\bthe theme(?: or issue)? (?:that )?you have (?:dealt with|discussed|chosen|explored)(?: in part \(a\)(?: above)?)?/gi;
  function qHtml(q) {
    // Only the first (a) and the first (b) after it start parts: "(as discussed in (a) above)" stays in the text.
    // A question pasted from a paper: its number ("2.") and marks ("(30)", "(40)") come out.
    q = String(q).replace(/^\s*\d+\.\s*/, '').replace(/\s*\(\s*(?:30|40|50|70)\s*(?:marks)?\s*\)/gi, '');
    var tn = essay().mode === 'theme' ? themeName() : '', th = tn ? { name: tn } : null, tok = '\u27E6t\u27E7', tokU = '\u27E6T\u27E7';
    if (th) q = q.replace(Q_THEME, function (m) { return /^[A-Z]/.test(m) ? tokU : tok; }).replace(Q_THEME2, function (m) { return /^[A-Z]/.test(m) ? tokU : tok; });
    var ia = q.indexOf('(a)'), ib = ia < 0 ? -1 : q.indexOf('(b)', ia + 3), h;
    if (ia < 0 || ib < 0) h = '<p class="ebd-qp">' + qMark(q.trim()) + '</p>';
    else {
      var part = function (l, t) { return '<p class="ebd-qp"><b class="ebd-qp__l">(' + l + ')</b><span>' + qMark(t.trim()) + '</span><span class="ebd-qp__m">' + (l === 'a' ? '30' : '40') + ' marks</span></p>'; };
      h = (q.slice(0, ia).trim() ? '<p class="ebd-qp ebd-qp--quote">' + qMark(q.slice(0, ia).trim()) + '</p>' : '') + (bOnly() ? '' : part('a', q.slice(ia + 3, ib))) + part('b', bOnly() ? noBackRef(q.slice(ib + 3)) : q.slice(ib + 3));
    }
    if (!th) return h;
    var mk = function (x) { return '<mark class="ebd-qtheme" title="On the paper this says “theme or issue”">' + esc(x) + '</mark>'; };
    return h.split(tok).join(mk(th.name.toLowerCase())).split(tokU).join(mk(th.name));
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
  // Each box's word range: part (b) (and a 70-mark answer) has Compare boxes and two texts in each Anchor, so its boxes
  // run longer; part (a)'s match Compare it's.
  function ebRange(key) {
    if (key === 'intro') return split() ? [50, 90] : [70, 120];
    if (key === 'end') return split() ? [40, 80] : [60, 100];
    var m = /^(a?)([PACE])\d+$/.exec(key);
    if (!m) return null;
    return m[1] ? { P: [15, 30], A: [20, 40], E: [40, 80] }[m[2]] : { P: [15, 30], A: [30, 60], C: [25, 50], E: [35, 70] }[m[2]];
  }
  function line(key, value, ph, k) {
    var r = ebRange(key);
    return '<label class="ebd-line' + (k ? ' ebd-line--k' : '') + '">' + (k ? '<span class="ebd-k" style="background:' + PACE_COL[k] + '" title="' + FIELD[k][0] + '">' + k + '</span>' : '') +
      '<textarea data-eb="' + key + '" rows="1" placeholder="' + esc(ph) + '">' + esc(value || '') + '</textarea>' +
      (r ? '<span class="ebd-wc" data-eb-wc="' + key + '">' + wcHtml(words(value || ''), r) + '</span>' : '') + '</label>';
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
      '<span class="ebd-q__tab" style="--c:' + COL[e.mode] + '">' + esc(MODE[e.mode].name) + ' · ' + (bOnly() ? 'part (b), 40' : split() ? '30 + 40' : '70') + ' marks</span>' +
      '<div class="ebd-qtext" data-eb-qtext>' + (e.q ? qHtml(e.q) : '<p class="ebd-ghost">Pick a question from the real papers, or write your own.</p>') + '</div></div>' + themePick();
    out += '<div class="ebd-note' + (cur === 'q' ? ' is-on' : '') + '"><span>Your line of argument</span>' +
      (cur === 'q' ? '<textarea data-eb="thesis" rows="2" placeholder="One sentence that answers the question.">' + esc(e.thesis) + '</textarea>'
        : '<p data-eb-step="0" role="button" tabindex="0">' + (e.thesis ? esc(e.thesis) : '<i>Not written yet: tap to write it.</i>') + '</p>') + '</div>';
    out += '<div class="ebd-lines">';
    if (!e.aspects.length) out += cur === 'plan' ? [0, 1, 2].map(function (k) { return '<p class="ebd-part">Paragraph ' + (k + 1) + '</p><p class="ebd-ghost">knock a crate off…</p>'; }).join('') : '<p class="ebd-ghost">Your paragraphs appear here once you pick a question.</p>';
    if (split() && !bOnly() && e.aspects.length) {
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
      '<p class="ebd-count">' + (bOnly() ? '(b) ' + nb + ' words' : split() ? '(a) ' + na + ' words · (b) ' + nb + ' words' : nb + ' words') + '<span>' + (bOnly() ? 'about 650' : split() ? 'about 450 + 650' : nb < 900 ? 'aim for 1,000 to 1,300' : 'a good length') + '</span></p></div>';
  }

  // ----- the coach -----
  // Your theme against the question's mode (the user, given a Cultural Context question on social mobility after choosing
  // abuse of power: "i chose the theme abuse of power and here it is fucking talking about social mobility"): on Theme
  // or Issue, a line saying the question's "theme or issue" is yours; on another mode, a red warning that this question
  // isn't about your theme, what that mode asks about instead, and a button back to Theme or Issue.
  var MODE_ASKS = { cc: 'the world of the texts: who has power, what is valued, what is allowed (class, gender, religion, family)', gvv: 'the view of life in the texts: how hopeful or bleak each one is, judged on its ending' };
  function themeNote() {
    var th = myTheme(), e = essay();
    if (!th) return '';
    if (e.mode === 'theme') { var tn = themeName().toLowerCase(); return '<p class="ebd-mytheme">Your theme, <b>' + esc(tn) + '</b>, is filled into the question for you: change it under the question. On the real paper it says “theme or issue”: that\'s ' + esc(tn) + '.</p>'; }
    // Not your theme's mode: say what this question is about (its yellow words), that your theme's scenes can still
    // help if they answer it (the user, of a question on social mobility: "i think it is about abuse and power"), and
    // the way back to Theme or Issue.
    var tp = e.q ? qTerms('topic').filter(function (g) { return ['cc', 'gvv', 'theme'].indexOf(g.id) < 0; }).slice(0, 2).map(function (g) { return '<b>' + esc(g.term) + '</b>'; }).join(' and ') : '';
    var about = tp || 'what the question names (its yellow words)', mine = esc(th.name.toLowerCase());
    return cpWarnBox('Not a theme question', [
      (e.q ? 'This is a <b>' + esc(MODE[e.mode].name) + '</b> question. It asks about ' + about : '<b>' + esc(MODE[e.mode].name) + '</b> questions ask about ' + MODE_ASKS[e.mode]) + ', not about ' + mine + ' itself.',
      'Your ' + mine + ' scenes can still help, but only to answer the question' + (e.mode === 'cc' ? ': for example, how the people in power control what others can do or become.' : ': for example, whether the ' + mine + ' leaves each text hopeful or bleak.'),
      'Every paragraph has to be about ' + (tp || 'the question') + '. A paragraph that only shows ' + mine + ' gets few marks.',
      'In 2027 all three modes are on the paper and you answer on one. To practise your theme itself, switch to Theme or Issue.',
      '<button type="button" class="eng-btn" data-eb-mode="theme">Switch to Theme or Issue</button>']);
  }
  // Practice questions that aren't from the papers we hold, first in their mode's list (the user's homework question;
  // the user: "fucking add it already").
  var PRACTICE_QS = [{ mode: 'theme', marks: [30, 40], year: 'Practice', paper: '', text: '(a) Choose a theme from one text you have studied as part of your comparative course and say how it helped maintain your interest in the text. (b) Compare how the theme you have dealt with in part (a) is treated by the authors of two other texts from your comparative course to maintain the reader’s interest.' }];
  // A question about how the theme keeps you interested: a red warning on every step, since every paragraph has to
  // answer that, not just say what the texts show.
  function interestNote() {
    var e = essay();
    if (!e.q || !/\b(?:maintain|hold|keep|kept|sustain)\w*[^.]{0,40}interest|interest(?:ed)? the (?:reader|viewer)/i.test(e.q)) return '';
    var t = themeName() ? themeName().toLowerCase() : 'the theme';
    return cpWarnBox('This question is about interest', [
      'It asks how ' + esc(t) + ' <b>keeps the reader hooked</b>, not just what the texts say about it.',
      'Every paragraph needs at least one sentence on <b>interest</b>: tension, suspense, shock, sympathy, wanting justice, needing to know what happens next.',
      'Try: <i>This kept me gripped because…</i> · <i>The tension builds as…</i> · <i>I was desperate to see…</i>']);
  }
  function tile(k, name, what) {
    return '<div class="ebd-tile"><b style="background:' + (PACE_COL[k] || '#fff') + '">' + esc(k || ({ q: '?', plan: '≡', intro: 'In', check: '✓' })[curStep()] || '?') + '</b><div><h3>' + esc(name) + '</h3><p>' + esc(what) + '</p></div></div>';
  }
  function fieldChips() {
    var k = FOCUS ? (/^a?([PACE])\d+$/.exec(FOCUS) || [])[1] : null, cur = curStep();
    var groups = k ? FIELD[k][2] : cur === 'intro' ? ['judge'] : cur === 'end' ? ['judge', 'degree'] : ['same', 'differ'];
    return '<div class="ebd-chips" data-eb-chips><h4>' + (k ? 'Phrases for your ' + FIELD[k][0].toLowerCase() : 'Phrases to use') + '</h4><div class="eb-starters">' + chips(groups) + '</div></div>';
  }
  function coachHtml(bodyOnly) {
    var e = essay(), cur = curStep(), m = MODE[e.mode], cmp = compared(), mine = ebTexts(), out = '';
    var tipKey = /^a\d/.test(cur) ? 'a' : /^p\d/.test(cur) ? 'p' : cur;
    if (cur === 'q') tipKey = !e.q || SLIPS ? 'q' : !crackedAll() ? 'crack' : !e.thesis ? 'stance' : 'ready';
    if (cur === 'plan' && e.aspects.length) tipKey = 'planned';
    var face = window.ExamTeacher ? '<div class="ebd-face" data-mood="' + (cur === 'check' ? (checksList().every(function (c) { return c[1]; }) ? 'happy' : 'angry') : 'ok') + '"><span>' + window.ExamTeacher.head() + '</span><p>' + esc((TIPS[tipKey] || '')) + '</p></div>' : '';
    if (cur === 'q') {
      var qs = D.questions.filter(function (q) { return q.mode === e.mode; }).sort(function (a, b) { return b.year - a.year; });
      var picker = '<div class="eb-choices">' + MODES.map(function (x) { return '<button type="button" class="eng-chip" style="--c:' + COL[x.id] + '" data-eb-mode="' + x.id + '" aria-pressed="' + (e.mode === x.id) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' +
        '<div class="eb-choices">' + [['70', 'One question, 70 marks'], ['split', 'Two parts, 30 + 40']].map(function (x) { return '<button type="button" class="eng-chip" data-eb-type="' + x[0] + '" aria-pressed="' + (e.type === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="ebd-slips">' + PRACTICE_QS.filter(function (q) { return q.mode === e.mode; }).map(function (q) {
          return '<button type="button" class="ebd-slip' + (e.q === q.text ? ' is-on' : '') + '" style="--c:' + COL[q.mode] + '" data-eb-pq="' + PRACTICE_QS.indexOf(q) + '"><span class="ebd-slip__y">Practice</span><span class="ebd-slip__m">30 + 40</span>' +
            '<span class="ebd-slip__t">' + esc(q.text.length > 120 ? q.text.slice(0, 118) + '…' : q.text) + '</span></button>';
        }).join('') + qs.slice(0, 10).map(function (q) {
          return '<button type="button" class="ebd-slip' + (e.q === q.text ? ' is-on' : '') + '" style="--c:' + COL[q.mode] + '" data-eb-q="' + D.questions.indexOf(q) + '"><span class="ebd-slip__y">' + q.year + (q.paper === 'deferred' ? ' def.' : '') + '</span><span class="ebd-slip__m">' + (Array.isArray(q.marks) ? '30 + 40' : '70') + '</span>' +
            '<span class="ebd-slip__t">' + esc(q.text.length > 120 ? q.text.slice(0, 118) + '…' : q.text) + '</span></button>';
        }).join('') + '</div>' +
        '<label class="ebd-own"><span>Or your own question</span><textarea data-eb="q" rows="3" placeholder="Paste or type it here">' + esc(e.q) + '</textarea></label>';
      if (!e.q || SLIPS) {
        out = themeNote() + tile('', 'Pick your question', 'A real exam question, by mode. Tap one and it lands on your sheet.') +
          '<button type="button" class="eng-btn ebd-wide ebd-surprise" data-eb-surprise>Surprise me</button>' + picker +
          (e.q ? '<button type="button" class="eng-btn eng-btn--quiet ebd-wide" data-eb-slips>Keep this question</button>' : '');
      } else {
        out = themeNote() + '<div class="ebd-qhead"><span>' + esc(MODE[e.mode].name) + ' · ' + (bOnly() ? 'part (b), 40' : split() ? '30 + 40' : '70') + ' marks</span><button type="button" class="ebd-link" data-eb-slips>Change question</button></div>' + crackHtml() + stanceHtml() +
          '<button type="button" class="ebd-link ebd-skip" data-eb-go="1">Skip this, start writing →</button>';
      }
        } else if (cur === 'plan') {
      out = themeNote() + planGameHtml();
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
    if (cur !== 'check') out = interestNote() + out;
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
    var xBack = bOnly() ? '<b>(b) ' + titles(cmp).map(esc).join(' + ') + '</b><span>compared all the way</span>' : split() ? '<b>(a) ' + esc(text(textA()).title) + '</b><span>then</span><b>(b) ' + titles(cmp).map(esc).join(' + ') + '</b>' : '<b>' + titles(cmp).map(esc).join(' + ') + '</b><span>compared all the way</span>';
    var lines = [];
    if (c.topic) (topics.length ? topics : []).forEach(function (g) { lines.push('<li><b>' + esc(g.term) + '</b> ' + esc(g.def) + '</li>'); });
    if (c.task) tasks.slice(0, 3).forEach(function (g) { lines.push('<li class="is-task"><b>' + esc(g.term) + '</b> ' + esc(g.do || g.def) + '</li>'); });
    if (c.texts) lines.push('<li class="is-texts">' + (bOnly() ? '<b>Part (b), 40 marks:</b> compare ' + titles(cmp).map(esc).join(' and ') + ' together, in every paragraph.' : split() ? '<b>(a) 30 marks:</b> one text, ' + esc(text(textA()).title) + '. <b>(b) 40 marks:</b> compare the other two, ' + titles(cmp).map(esc).join(' and ') + '.' : '<b>70 marks:</b> compare ' + titles(cmp).map(esc).join(', ') + ' in every paragraph.') + '</li>');
    return '<div class="ebd-task"><h4 class="ebd-h"><i>1</i> Crack the question</h4><div class="ebd-cards">' +
      card('topic', '?', 'What is it about?', tBack) + card('task', '!', 'What must you do?', kBack) + card('texts', '3', 'Which texts?', xBack) + '</div>' +
      (lines.length ? '<ul class="ebd-cracked">' + lines.join('') + '</ul>' : '') + '</div>';
  }
  function stanceTexts() { return split() && !bOnly() ? [textA()].concat(compared()) : compared(); }
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
        return '<div class="ebd-meter" style="--c:' + COL[t] + '"><span class="ebd-meter__t">' + (bOnly() ? '(b) ' : split() ? (i ? '(b) ' : '(a) ') : '') + esc(text(t).title) + '</span>' +
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
    var e = essay(), mine = ebTexts(), cmp = compared();
    return '<div class="ebd-plan"><div class="ebd-plan__top"><span>Your paragraphs, picked for this question</span><button type="button" class="ebd-link" data-eb-plan>' + (PLAN_OPEN ? 'Done' : 'Change') + '</button></div>' +
      '<ol>' + e.aspects.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol>' +
      (PLAN_OPEN ? (split() && !bOnly() ? '<h4 class="ebd-h">Part (a) is on</h4><div class="eb-choices">' + mine.map(function (t) { return '<button type="button" class="eng-chip" style="--c:' + COL[t] + '" data-eb-atext="' + t + '" aria-pressed="' + (textA() === t) + '">' + esc(text(t).title) + '</button>'; }).join('') + '</div>' +
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
    var used = split() && !bOnly() ? ebTexts() : cmp;
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
    if (split() && !bOnly()) checks.splice(2, 0, ['P', e.aspects.length >= 1 && e.aspects.every(function (x) { var p = e.parasA[x] || {}; return p.P && p.A && p.E; }) && named(textA(), essayParts('a').join(' ').toLowerCase()), 'Part (a) on ' + text(textA()).title,
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
    if (key === 'q' && /\(a\)/.test(v) && /\(b\)/.test(v)) e.type = 'split';
    else if ((m = /^a([PAE])(\d+)$/.exec(key))) { var aa = e.aspects[+m[2]]; if (!aa) return; (e.parasA[aa] = e.parasA[aa] || {})[m[1]] = v; }
    else { var part = key.charAt(0), k = +key.slice(1), a = e.aspects[k]; if (!a) return; (e.paras[a] = e.paras[a] || {})[part] = v; }
    saveEssay();
    if (key === 'q') { var qt = app.querySelector('[data-eb-qtext]'); if (qt) qt.innerHTML = v ? qHtml(v) : ''; TYPED = v; }
    var wcEl = app.querySelector('[data-eb-wc="' + key + '"]'), wr = ebRange(key);
    if (wcEl && wr) wcEl.innerHTML = wcHtml(words(v), wr);
    var cnt = app.querySelector('.ebd-count');
    if (cnt) { var na = words(essayParts('a').join(' ')), nb = words(essayParts('b').join(' ')); cnt.firstChild.textContent = bOnly() ? '(b) ' + nb + ' words' : split() ? '(a) ' + na + ' words · (b) ' + nb + ' words' : nb + ' words'; }
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

  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    var d = bar.querySelector('details[open]');
    if (d) { d.open = false; var sm = d.querySelector('summary'); if (sm) sm.focus(); }
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    Array.prototype.forEach.call(bar.querySelectorAll('details[open]'), function (d) { if (!d.contains(t)) d.open = false; });
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
    var fpk = t.closest('[data-feed-pick]');
    if (fpk) { if (!fpk.disabled) fPick(+fpk.getAttribute('data-feed-pick')); return; }
    if (t.closest('[data-feed-replay]')) { var frp = t.closest('.eng-fi.is-play'); if (frp) fPlay(frp, true); return; }
    var fgt = t.closest('[data-feed-goto]');
    if (fgt) { var fdg = app.querySelector('[data-feed]'), tg = fdg && fdg.querySelector('.eng-fi.is-scenes'); if (tg) fdg.scrollTo({ top: tg.offsetTop, behavior: 'smooth' }); return; }
    var fpl = t.closest('.eng-fi.is-play');
    if (fpl && !t.closest('button, a') && !fpl.classList.contains('is-paused')) { fSkip(fpl); return; }
    var fsc = t.closest('[data-feed-scene]');
    if (fsc) {
      if (!fsc.disabled) {
        var fsp = fsc.getAttribute('data-feed-scene').split('|'), fth = cpTheme(), fa2 = cpBy(fth).a, fW = cpWrite(fth, fa2), fG = fth.write[fa2], fq = fW.paras[+fsp[0]], fn = +fsp[1];
        if (fq && fq.scene !== fn) { fq.scene = fn; fq.rep = 0; fq.picked = fG.scenes[fn].reps.length === 1; }
        cpSave(); renderCompare();
      }
      return;
    }
    var fp = t.closest('[data-feed-pair]');
    if (fp) { if (!fp.disabled) feedPair(fp.getAttribute('data-feed-pair')); return; }
    if (t.closest('[data-feed-q]')) { sheetOpen('q'); return; }
    if (t.closest('[data-feed-next]')) { var fa1 = feedAt(); if (fa1 && fa1.k < fa1.its.length - 1) fa1.fd.scrollTo({ top: fa1.its[fa1.k + 1].offsetTop, behavior: 'smooth' }); return; }
    var cq = t.closest('[data-cpq]');
    if (cq) { cq.classList.toggle('is-full'); return; }
    if ((CPW || t.closest('[data-cpw],[data-cpw-copy],[data-cpw-add],[data-cpw-drop],[data-cpbw],[data-cpb-copy],[data-cpb-add],[data-cpb-drop]')) && cpwClick(t)) return;
    var cpa = t.closest('[data-cp-a]'), cpp = t.closest('[data-cp-pt]'), cpm = t.closest('[data-cpm]'), cpr = t.closest('[data-cp-rel]'), cpd = t.closest('[data-cp-del]');
    var cgo = t.closest('[data-cp-go]');
    if (cgo && !cgo.disabled) { cpScrollTo(+cgo.getAttribute('data-cp-go')); return; }
    var cfd = t.closest('[data-cp-fold]');
    if (cfd) {
      var fn = +cfd.getAttribute('data-cp-fold'), fy = cfd.getBoundingClientRect().top;
      CP_UNFOLD[fn] = !CP_UNFOLD[fn]; renderCompare();
      var nfd = app.querySelector('[data-cp-fold="' + fn + '"]');
      if (nfd) { window.scrollBy(0, nfd.getBoundingClientRect().top - fy); nfd.focus({ preventScroll: true }); }
      return;
    }
    if (cpa || cpp || cpm || cpr || cpd || t.closest('[data-cp-cancel],[data-cp-hint],[data-cp-reset],[data-cp-copy],[data-cp-stage],[data-cp-swap]')) {
      var cth = cpTheme(), cby = cpBy(cth), focus = null, cstg = t.closest('[data-cp-stage]'), goTo = 0;
      if (GUIDE.open && isPhone() && !cstg) { GUIDE.open = false; GUIDE.key = ''; }
      if (cstg) { goTo = +cstg.getAttribute('data-cp-stage'); cby.stage = Math.max(cby.stage || 1, goTo); }
      else if (t.closest('[data-cp-swap]')) { cpSwap(cth); focus = '[data-cp-swap]'; }
      else
      if (cpa) { cby.a = cpa.getAttribute('data-cp-a'); CPSEL = CPPICK = CPFB = CPHINT = null; focus = '[data-cp-a="' + cby.a + '"]'; CP_ENTER = true; if (isPhone()) FEED_GO = 2; }
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
      else if (t.closest('[data-cp-reset]')) {
        var cwr = cpWork(cth, cby.a).write;
        if (cwr && cwPrompt(cwr) && !window.confirm('Start again? This clears your writing, points and links for this text.')) return;
        cby.work[cby.a] = { pts: [], links: [] }; CPSEL = CPPICK = CPFB = CPHINT = null;
      }
      else if (t.closest('[data-cp-copy]')) { copy(cpPlanText(), t.closest('[data-cp-copy]')); return; }
      cpSave(); renderCompare();
      var fe = focus && app.querySelector(focus);
      if (fe) fe.focus({ preventScroll: true });
      if (goTo) requestAnimationFrame(function () { cpScrollTo(goTo); });
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
      var pool = D.questions.filter(function (q) { return q.mode === essay().mode && q.text !== essay().q; });
      useQuestion(pool[Math.floor(Math.random() * pool.length)]); SLIPS = false; saveEssay(); if (K) K.sfx('whoosh', 0.3); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    var md = t.closest('[data-eb-mode]');
    if (md) {
      e = essay();
      if (e.mode !== md.getAttribute('data-eb-mode')) {
        e.mode = md.getAttribute('data-eb-mode'); e.aspects = [];
        // From the "This isn't your theme" warning: the old question goes too, and you pick a Theme or Issue one.
        if (md.closest('.eng-cpwarn')) { e.q = ''; e.crack = {}; e.stance = {}; e.step = 0; SLIPS = true; }
      }
      saveEssay(); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    var tp = t.closest('[data-eb-theme]');
    if (tp) { essay().theme = tp.getAttribute('data-eb-theme'); saveEssay(); TYPED = essay().q; drawBuild(); return; }
    var pq = t.closest('[data-eb-pq]');
    if (pq) { useQuestion(PRACTICE_QS[+pq.getAttribute('data-eb-pq')]); SLIPS = false; saveEssay(); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var qq = t.closest('[data-eb-q]');
    if (qq) { useQuestion(D.questions[+qq.getAttribute('data-eb-q')]); SLIPS = false; saveEssay(); drawBuild(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var ty = t.closest('[data-eb-type]');
    if (ty) { essay().type = ty.getAttribute('data-eb-type'); saveEssay(); drawBuild(); return; }
    var at = t.closest('[data-eb-atext]');
    if (at) {
      essay().textA = at.getAttribute('data-eb-atext'); saveEssay();
      var mt = myTheme(); if (mt) { cpBy(mt).a = essay().textA; cpSave(); }
      drawBuild(); return;
    }
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
    if (CPW) { CPW = null; cpwDraw(); }
    if (p[0] === 'play' && window.EngGames) { window.EngGames.open(p[1]); history.replaceState(null, '', '#comparative'); renderHome(); return; }
    if (p[0] === 'marking') renderMarking();
    else if (p[0] === 'structure') renderStructure();
    else if (p[0] === 'learn') renderLearn();
    else if (p[0] === 'mode') renderMode(p[1]);
    else if (p[0] === 'text') renderText(p[1], p[2]);
    else if (p[0] === 'language') renderLanguage();
    else if (p[0] === 'questions') renderQuestions();
    else if (p[0] === 'compare') { CP_ENTER = true; renderCompare(); }
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

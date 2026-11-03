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
  function chosen() {
    var v = [];
    try { v = JSON.parse(store('eng-texts') || '[]'); } catch (e) {}
    v = v.filter(function (id) { return D.texts[id]; });
    return v.length === 3 ? v : D.order.slice(0, 3);
  }
  // The texts picked so far (0 to 3), as stored.
  function picks() { var v = []; try { v = JSON.parse(store('eng-texts') || '[]'); } catch (e) {} return (Array.isArray(v) ? v : []).filter(function (id) { return D.texts[id]; }); }
  function pickedExactly() { return picks().length === 3; }
  function setChosen(ids) { store('eng-texts', JSON.stringify(ids)); }

  // ---------- the shell (bio-shell.css): sidebar, top bar ----------
  function link(href, label, active, extra) {
    return '<a class="sh-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + (extra || '') + '<span class="sh-t">' + esc(label) + '</span></a>';
  }
  function renderShell(active, crumb) {
    var mine = chosen();
    closeDef();
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (K ? K.face : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="English">' + link('#', 'Comparative', active === 'home') +
      link('#learn', '1 · Learn the parts', active === 'learn') + link('#structure', '2 · Structure it', active === 'structure') + link('#language', '3 · Say it well', active === 'language') +
      link('#build', 'Build an essay', active === 'build') + link('#marking', 'How it\'s marked', active === 'marking') + link('#questions', 'Past questions', active === 'questions') +
      (window.EngGames ? '<p class="sh-group">Games</p>' + window.EngGames.list.map(function (g) { return link('#play/' + g[0], g[1], false); }).join('') : '') +
      '<p class="sh-group">Modes</p>' + MODES.map(function (m) { return link('#mode/' + m.id, m.name, active === 'mode/' + m.id, '<span class="sh-n" aria-hidden="true"><span class="eng-tag" style="--c:' + COL[m.id] + '">&nbsp;</span></span>'); }).join('') +
      '<p class="sh-group">Your texts</p>' + mine.map(function (id) { return link('#text/' + id, text(id).title, active === 'text/' + id, '<span class="sh-n" aria-hidden="true"><span class="eng-tag" style="--c:' + COL[id] + '">&nbsp;</span></span>'); }).join('') + '</nav>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="eng-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb">' + (crumb ? '<a href="#">English</a><span class="sh-sep" aria-hidden="true">/</span><span class="sh-here">' + esc(crumb) + '</span>' : '<span class="sh-here">English</span>') + '</p>' +
      '<nav class="sh-switch" aria-label="Subject"><a href="Geography%20Questions.dc.html">Geography</a><a href="biology.html">Biology</a><a href="english.html" aria-current="page">English</a><a href="irish.html">Irish</a></nav>';
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
  function pickCard(id, on) {
    var t = text(id), p = pics(id).filter(function (x) { return x.hero; })[0] || pics(id)[0];
    return '<button type="button" class="eng-pick' + (on ? ' is-on' : '') + '" style="--c:' + COL[id] + '" data-eng-pick="' + id + '" aria-pressed="' + on + '">' +
      '<span class="eng-pick__img">' + (p ? '<img src="assets/eng/img/' + esc(p.file) + '" alt="" loading="lazy">' : '<span class="eng-pick__init">' + esc(t.title.charAt(0)) + '</span>') + '</span>' +
      '<span class="eng-pick__body"><span class="eng-pick__t">' + esc(t.title) + '</span><span class="eng-pick__a">' + esc(t.author) + ' · ' + esc(t.kind) + '</span></span>' +
      '<span class="eng-pick__tick" aria-hidden="true">✓</span></button>';
  }
  function renderHome() {
    renderShell('home');
    var mine = picks();
    var pc = C.marks.criteria;
    app.innerHTML = title('Comparative Study') +
      '<h2 class="eng-h2">Your three texts</h2>' +
      '<div class="eng-grid eng-grid--4">' + D.order.map(function (id) { return pickCard(id, mine.indexOf(id) >= 0); }).join('') + '</div>' +
      '<p class="eng-picked" data-eng-picked>' + pickedLine(mine) + '</p>' +
      '<h2 class="eng-h2">Three steps. That\'s all it is.</h2>' + stepsHome() +
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
    app.innerHTML = title('Learn the parts', '<button type="button" class="eng-btn' + (LTEST ? '' : ' eng-btn--quiet') + '" data-eng-ltest aria-pressed="' + LTEST + '">' + (LTEST ? 'Show me everything' : 'Test me') + '</button>') +
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
    if (mine.length !== 3) return 'Pick <b>three</b>: ' + (3 - mine.length) + ' more to choose.';
    return '<b>' + mine.map(function (id) { return esc(text(id).title); }).join(', ') + '</b>' +
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
        '<p class="eng-p">' + esc(t.gist) + '</p><p class="eng-p"><b>Setting:</b> ' + esc(t.setting) + '</p></div>' +
        (hero ? '<figure><img src="assets/eng/img/' + esc(hero.file) + '" alt="' + esc(hero.title) + '"><figcaption>' + credit(hero) + '</figcaption></figure>' : '') + '</div>' +
      '<h2 class="eng-h2">Characters</h2><ul class="eng-people">' + t.people.map(function (c) { return '<li><b>' + esc(c.name) + '</b> ' + esc(c.who) + '</li>'; }).join('') + '</ul>' +
      '<h2 class="eng-h2">The story in ' + t.moments.length + ' key moments</h2>' +
      t.moments.map(function (m, k) { return sceneHtml(t, m, k); }).join('');
    watchScenes();
    if (moment) { var el = document.getElementById(moment); if (el) el.scrollIntoView({ block: 'start' }); }
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
  var qFilter = 'all';
  function renderQuestions() {
    renderShell('questions', 'Past questions');
    var list = D.questions.filter(function (q) { return qFilter === 'all' || q.mode === qFilter; }).sort(function (a, b) { return b.year - a.year; });
    app.innerHTML = title('Past questions') +
      '<div class="eng-filter">' + [['all', 'All']].concat(MODES.map(function (m) { return [m.id, m.name]; })).map(function (f) {
        return '<button type="button" class="eng-chip" data-eng-qf="' + f[0] + '" aria-pressed="' + (qFilter === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div>' +
      (list.length ? '<div class="eng-grid">' + list.map(function (q) {
        var k = D.questions.indexOf(q);
        return '<div class="eng-q"><span class="eng-q__y">' + q.year + (q.paper === 'deferred' ? '<small>Deferred</small>' : '') + '<small>' + esc(MODE[q.mode].short) + ' · ' + (Array.isArray(q.marks) ? q.marks.join(' + ') : q.marks) + ' marks</small></span>' +
          '<p>' + qMark(q.text) + '</p><a class="eng-btn eng-btn--quiet" href="#build/q' + k + '">Build it</a></div>';
      }).join('') + '</div>' : '<p class="eng-p">The past questions are being collected.</p>');
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
    if (split()) return [['q', 'Question']].concat(pts('a', '(a) Point ')).concat([['intro', '(b) Introduction']]).concat(pts('p', '(b) Point ')).concat([['end', '(b) Conclusion'], ['check', 'Check']]);
    return [['q', 'Question'], ['intro', 'Introduction']].concat(pts('p', 'Point ')).concat([['end', 'Conclusion'], ['check', 'Check']]);
  }
  // The three aspects of the mode that fit the question best: the question's words (its glossary topic words and
  // its other long words, by their first five letters) counted in each aspect's name and in your texts' notes on it.
  function autoPlan() {
    var e = essay(), opts = aspectOptions(e.mode);
    if (opts.length <= 3) { e.aspects = opts.slice(); return; }
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
    e.aspects = scored.slice(0, 3).map(function (x) { return x[2]; });
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
    plan: 'Three or four aspects. Depth beats a list.',
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
  var GL = null, DEF = null;
  function glossary() {
    if (GL) return GL;
    var list = [], by = {};
    (D.glossary || []).forEach(function (g) { by[g.id] = g; g.match.forEach(function (m) { list.push({ m: m.toLowerCase(), g: g }); }); });
    list.sort(function (a, b) { return b.m.length - a.m.length; });
    GL = { list: list, by: by };
    return GL;
  }
  function qMark(s) {
    var low = String(s).toLowerCase(), taken = [], hits = [];
    glossary().list.forEach(function (x) {
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
  function closeDef() {
    if (!DEF) return;
    if (DEF.pop.parentNode) DEF.pop.parentNode.removeChild(DEF.pop);
    DEF.btn.classList.remove('is-open'); DEF.btn.setAttribute('aria-expanded', 'false');
    DEF = null;
  }
  function openDef(btn) {
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
    DEF = { pop: pop, btn: btn };
    if (K) K.sfx('pop', 0.3);
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
    if (!e.aspects.length) out += '<p class="ebd-ghost">Your paragraphs appear here once you pick a question.</p>';
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
    if (e.step === 1) out = planBox() + out;
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
    if (!e0.aspects.length && e0.q) { autoPlan(); saveEssay(); }
    var e = e0, st = stepsList();
    if (e.step >= st.length) e.step = st.length - 1;
    var cur = curStep();
    if (!keepFocus) FOCUS = null;
    app.innerHTML = '<div class="ebd-top"><h1 class="cv-h1">Build an essay</h1><div data-eb-stamps>' + stampsHtml() + '</div></div>' + trackHtml() +
      '<div class="ebd">' +
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
    if (dq) { ev.preventDefault(); if (DEF && DEF.btn === dq) closeDef(); else openDef(dq); return; }
    if (DEF && (t.closest('[data-def-close]') || !t.closest('.q-pop'))) { closeDef(); if (t.closest('[data-def-close]')) return; }
    if (t.closest('[data-sh-menu]')) { menu(!document.body.classList.contains('sh-open')); return; }
    // The menu closes when you pick something in it or click anywhere outside it.
    if (document.body.classList.contains('sh-open') && (t.closest('.sh-link') || !t.closest('.sh-side'))) menu(false);
    var gb = t.closest('a[href^="#build"]');
    if (gb && ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !/^#build/.test(location.hash)) { ev.preventDefault(); goBuild(gb); return; }
    var pick = t.closest('[data-eng-pick]');
    if (pick) {
      var id = pick.getAttribute('data-eng-pick'), cur = picks();
      if (cur.indexOf(id) >= 0) cur = cur.filter(function (x) { return x !== id; }); else if (cur.length < 3) cur.push(id); else { cur.shift(); cur.push(id); }
      setChosen(cur);
      if (K) K.sfx(cur.indexOf(id) >= 0 ? 'pop' : 'tick', 0.6);
      renderHome();
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
    // The builder.
    var e = E;
    var go = t.closest('[data-eb-go]');
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
    if (document.body.classList.contains('sh-open')) menu(false);
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
    if (p[0] === 'play' && window.EngGames) { window.EngGames.open(p[1]); history.replaceState(null, '', '#'); renderHome(); return; }
    if (p[0] === 'marking') renderMarking();
    else if (p[0] === 'structure') renderStructure();
    else if (p[0] === 'learn') renderLearn();
    else if (p[0] === 'mode') renderMode(p[1]);
    else if (p[0] === 'text') renderText(p[1], p[2]);
    else if (p[0] === 'language') renderLanguage();
    else if (p[0] === 'questions') renderQuestions();
    else if (p[0] === 'build') renderBuild(p[1]);
    else renderHome();
    if (!p[2]) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  window.EngApp = { chosen: chosen, text: text, data: D, colour: COL };
  route();
})();

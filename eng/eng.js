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
    return 'Picture: ' + (p.source ? '<a href="' + esc(p.source) + '" target="_blank" rel="noopener">' + esc(p.title || p.file) + '</a>' : esc(p.title || p.file)) +
      (p.author ? ', ' + esc(p.author) : '') + (p.licence ? ' (' + esc(p.licence) + ')' : '');
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
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (K ? K.face : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="English">' + link('#', 'Comparative', active === 'home') + link('#build', 'Build an essay', active === 'build') +
      link('#marking', 'How it\'s marked', active === 'marking') + link('#structure', 'Essay and PACE', active === 'structure') +
      link('#language', 'Language bank', active === 'language') + link('#questions', 'Past questions', active === 'questions') +
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
    app.innerHTML = title('Comparative Study', '<a class="eng-btn" href="#build">Build an essay</a>') +
      '<h2 class="eng-h2">Your three texts</h2>' +
      '<div class="eng-grid eng-grid--4">' + D.order.map(function (id) { return pickCard(id, mine.indexOf(id) >= 0); }).join('') + '</div>' +
      '<p class="eng-picked" data-eng-picked>' + pickedLine(mine) + '</p>' +
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
    renderShell('structure', 'Essay and PACE');
    var S = C.structure, parts = S.parts;
    var flow = '<div class="eng-flow">' + parts.map(function (p, k) {
      return (k ? '<span class="eng-flow__arrow" aria-hidden="true">→</span>' : '') +
        '<div class="eng-card"><h3>' + esc(p.name) + '</h3><p>' + esc(p.what) + '</p><p class="eng-avoid">' + esc(p.avoid.replace(/^Don't /, 'Don\'t ')) + '</p></div>';
    }).join('') + '</div>';
    var eg = S.pace.map(function (p) { return '<mark class="pace-' + p.k.toLowerCase() + '">' + esc(p.eg) + '</mark>'; }).join(' ');
    app.innerHTML = title('Essay and PACE', '<a class="eng-btn" href="#build">Build an essay</a>') +
      '<p class="eng-p">' + esc(S.length) + ' ' + esc(S.time) + '</p>' + flow +
      '<h2 class="eng-h2">Every paragraph: PACE</h2>' +
      '<div class="eng-pace">' + S.pace.map(function (p) {
        return '<div class="eng-pace__t" style="background:' + PACE_COL[p.k] + '"><b>' + p.k + '</b><strong>' + esc(p.name) + '</strong><p>' + esc(p.what) + '</p></div>';
      }).join('') + '</div>' +
      '<h2 class="eng-h2">A PACE paragraph</h2><div class="eng-paper">' + eg + '</div>' + note('Remember it', S.hook);
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
    var p = pics(id), when = { opening: 'Opening', middle: 'Middle', climax: 'Climax', ending: 'Ending' };
    app.innerHTML = '<div class="eng-hero eng-hero--solo" style="--c:' + COL[id] + '"><div><h1 class="eng-hero__t">' + esc(t.title) + '</h1><p class="eng-hero__a">' + esc(byline(t)) + (t.made ? ' · ' + esc(t.made) : '') + '</p>' +
        '<p class="eng-p">' + esc(t.gist) + '</p><p class="eng-p"><b>Setting:</b> ' + esc(t.setting) + '</p></div></div>' +
      (p.length ? '<h2 class="eng-h2">In pictures</h2><section class="eng-pv" data-eng-pv="' + id + '" style="--c:' + COL[id] + '"></section>' : '') +
      '<h2 class="eng-h2">Characters</h2><ul class="eng-people">' + t.people.map(function (c) { return '<li><b>' + esc(c.name) + '</b> ' + esc(c.who) + '</li>'; }).join('') + '</ul>' +
      '<h2 class="eng-h2">Key moments</h2><ol class="eng-moments">' + t.moments.map(function (m, k) {
        return '<li class="eng-moment" id="' + esc(m.id) + '" style="--c:' + COL[id] + '"><span class="eng-moment__n">' + (k + 1) + '</span>' +
          '<h3>' + esc(m.title) + '</h3><span class="eng-moment__w">' + esc(m.where) + (m.when ? ' · ' + esc(when[m.when] || m.when) : '') + ' · ' +
          (m.modes || []).map(function (x) { return '<span class="eng-tag" style="--c:' + COL[x] + '">' + esc(MODE[x] ? MODE[x].short : x) + '</span>'; }).join(' ') + '</span>' +
          '<p>' + esc(m.what) + '</p><p class="eng-moment__why">' + esc(m.why) + '</p>' + (m.quote ? '<p class="eng-quote">“' + esc(m.quote) + '”</p>' : '') +
          p.map(function (q, k) { return q.moment === m.id ? '<button type="button" class="eng-moment__pic" data-eng-showpic="' + k + '" aria-label="See the picture: ' + esc(q.title) + '"><img src="assets/eng/img/' + esc(q.file) + '" alt="" loading="lazy"><span>See it</span></button>' : ''; }).join('') + '</li>';
      }).join('') + '</ol>';
    if (p.length) drawPics(id);
    if (moment) { var el = document.getElementById(moment); if (el) el.scrollIntoView({ block: 'center' }); }
  }

  // ---------- a text's pictures: tap the numbers to look closer ----------
  // Each picture (assets/eng/img/credits.json) has a caption, the key moment it shows and numbered spots, each with a
  // note, maybe a quote, and the key moment it belongs to. The spots you've opened are kept (eng-pics-seen).
  var PV = {}, KIND = { painting: 'Painting', stage: 'On the stage', place: 'The real place', author: 'The writer' };
  function seenAll() { try { return JSON.parse(store('eng-pics-seen') || '{}') || {}; } catch (e) { return {}; } }
  function momentLine(tid, mid) {
    var t = text(tid), k = -1;
    t.moments.forEach(function (m, i) { if (m.id === mid) k = i; });
    return k < 0 ? '' : '<a class="eng-pv__go" href="#text/' + tid + '/' + mid + '">Key moment ' + (k + 1) + ': ' + esc(t.moments[k].title) + ' <small>' + esc(t.moments[k].where) + '</small> →</a>';
  }
  function drawPics(id, focusPin) {
    var box = document.querySelector('[data-eng-pv="' + id + '"]');
    if (!box) return;
    var list = pics(id), st = PV[id] || (PV[id] = { k: 0, pin: -1 }), q = list[st.k] || list[0], seen = seenAll()[q.file] || [];
    var spots = q.spots || [], sp = spots[st.pin];
    var note = sp ? '<div class="eng-pv__note"><span class="eng-pv__lab"><b>' + (st.pin + 1) + '</b>' + esc(sp.label) + '</span><p>' + esc(sp.note) + '</p>' +
        (sp.quote ? '<blockquote>“' + esc(sp.quote) + '”</blockquote>' : '') + (sp.moment ? momentLine(id, sp.moment) : '') + '</div>'
      : '<div class="eng-pv__note is-empty"><p>' + (spots.length ? 'Tap the numbers on the picture to look closer.' : '') + '</p>' + (q.moment ? momentLine(id, q.moment) : '') + '</div>';
    var found = spots.filter(function (x, i) { return seen.indexOf(i) >= 0; }).length;
    box.innerHTML = '<div class="eng-pv__main">' +
        '<div class="eng-pv__stagebox"><div class="eng-pv__stage"><img src="assets/eng/img/' + esc(q.file) + '" alt="' + esc(q.title) + '">' +
          spots.map(function (x, i) {
            return '<button type="button" class="eng-pin' + (seen.indexOf(i) >= 0 ? ' is-seen' : '') + (i === st.pin ? ' is-on' : '') + '" style="left:' + x.x + '%;top:' + x.y + '%" data-eng-pin="' + i + '" aria-label="' + (i + 1) + ': ' + esc(x.label) + '" aria-pressed="' + (i === st.pin) + '">' + (i + 1) + '</button>';
          }).join('') + '</div></div>' +
        '<div class="eng-pv__panel"><span class="eng-pv__kind">' + esc(KIND[q.kind] || '') + '</span><h3 class="eng-pv__t">' + esc(q.title) + '</h3><p class="eng-pv__cap">' + esc(q.caption) + '</p>' +
          note +
          '<div class="eng-pv__foot">' + (spots.length ? '<span class="eng-pv__found' + (found === spots.length ? ' is-all' : '') + '">' + found + ' of ' + spots.length + ' looked at</span>' : '<span></span>') +
            (list.length > 1 ? '<button type="button" class="eng-btn eng-btn--quiet" data-eng-pic="' + ((st.k + 1) % list.length) + '">Next picture →</button>' : '') + '</div>' +
          '<p class="eng-credit">' + credit(q) + '</p></div></div>' +
      (list.length > 1 ? '<div class="eng-pv__strip" role="tablist" aria-label="Pictures">' + list.map(function (x, k) {
        var sAll = seenAll()[x.file] || [], done = (x.spots || []).length && (x.spots || []).every(function (y, i) { return sAll.indexOf(i) >= 0; });
        return '<button type="button" class="eng-pv__th' + (k === st.k ? ' is-on' : '') + (done ? ' is-done' : '') + '" role="tab" aria-selected="' + (k === st.k) + '" data-eng-pic="' + k + '" title="' + esc(x.title) + '"><img src="assets/eng/img/' + esc(x.file) + '" alt="" loading="lazy">' +
          ((x.spots || []).length ? '<i>' + (x.spots || []).length + '</i>' : '') + '</button>';
      }).join('') + '</div>' : '');
    if (focusPin != null) { var b = box.querySelector('[data-eng-pin="' + focusPin + '"]'); if (b) b.focus({ preventScroll: true }); }
  }
  function openPin(id, i) {
    var st = PV[id], q = pics(id)[st.k], all = seenAll(), seen = all[q.file] || [];
    st.pin = st.pin === i ? -1 : i;
    if (st.pin >= 0 && seen.indexOf(i) < 0) {
      seen.push(i); all[q.file] = seen; store('eng-pics-seen', JSON.stringify(all));
      if (K) K.sfx(seen.length === q.spots.length ? 'stamp' : 'pop', 0.5);
    }
    drawPics(id, i);
  }
  function showPic(id, k, scroll) {
    var st = PV[id] || (PV[id] = { k: 0, pin: -1 });
    st.k = (k + pics(id).length) % pics(id).length; st.pin = -1;
    drawPics(id);
    var box = document.querySelector('[data-eng-pv="' + id + '"]');
    if (scroll && box) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // ---------- language bank ----------
  function renderLanguage() {
    renderShell('language', 'Language bank');
    app.innerHTML = title('Language bank') + '<p class="eng-p">Tap a phrase to copy it.</p>' +
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
          '<p>' + esc(q.text) + '</p><a class="eng-btn eng-btn--quiet" href="#build/q' + k + '">Build it</a></div>';
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
    return E;
  }
  function saveEssay() { store('eng-essay', JSON.stringify(E)); }
  function split() { return essay().type === 'split'; }
  // Part (a)'s text, and the texts compared (all three for a 70-mark answer; the other two for part (b)).
  function textA() { var e = essay(), m = chosen(); return m.indexOf(e.textA) >= 0 ? e.textA : m[0]; }
  function compared() { var m = chosen(); return split() ? m.filter(function (t) { return t !== textA(); }) : m; }
  function stepsList() {
    var e = essay(), pts = function (pre, name) { return e.aspects.map(function (a, k) { return [pre + k, name + (k + 1)]; }); };
    if (split()) return [['q', 'Question'], ['plan', 'Plan']].concat(pts('a', '(a) Point ')).concat([['intro', '(b) Introduction']]).concat(pts('p', '(b) Point ')).concat([['end', '(b) Conclusion'], ['check', 'Check']]);
    return [['q', 'Question'], ['plan', 'Plan'], ['intro', 'Introduction']].concat(pts('p', 'Point ')).concat([['end', 'Conclusion'], ['check', 'Check']]);
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
  function starters(ids) {
    var all = {};
    C.language.forEach(function (g) { all[g.id] = g.items; });
    return '<div class="eb-starters">' + ids.map(function (g) { return (all[g] || []).slice(0, 5).map(function (s) { return '<button type="button" class="eng-chip" data-eb-insert="' + esc(s) + '">' + esc(s) + '</button>'; }).join(''); }).join('') + '</div>';
  }
  function field(key, label, k, value, ph, help, startersFor) {
    return '<div class="eb-field"><label for="eb-' + key + '">' + (k ? '<span class="eb-k" style="background:' + PACE_COL[k] + '">' + k + '</span>' : '') + esc(label) + '</label>' +
      '<textarea id="eb-' + key + '" rows="3" data-eb="' + key + '" placeholder="' + esc(ph || '') + '">' + esc(value || '') + '</textarea>' + (startersFor ? starters(startersFor) : '') + (help || '') + '</div>';
  }
  function helpList(head, items) { return items.length ? '<div class="eb-help"><b>' + esc(head) + '</b><ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>' : ''; }
  function plain(p) { return esc(p).replace(/\s*\[[a-z]+-\d+\]/g, ''); }
  function notesFor(mode, aspect, tid) {
    var pts = pointsFor(mode, aspect, tid).slice(0, 3).map(plain), mo = momentsFor(mode, tid).slice(0, 3).map(function (x) { return '<b>' + esc(x.title) + '</b> (' + esc(x.where) + '): ' + esc(x.what); });
    return helpList('From your notes on ' + text(tid).title, pts.concat(mo));
  }
  function titles(ids) { return ids.map(function (t) { return text(t).title; }); }
  function stepHtml() {
    var e = essay(), st = stepsList(), cur = st[Math.min(e.step, st.length - 1)][0], mine = chosen(), m = MODE[e.mode], cmp = compared();
    if (cur === 'q') {
      var qs = D.questions.filter(function (q) { return q.mode === e.mode; });
      return '<h2>The question</h2><p>Pick the mode, then a past question or write your own. In 2027 all three modes are on the paper, with two questions on each: a question is either 70 marks or in two parts (30 + 40).</p>' +
        '<div class="eb-choices">' + MODES.map(function (x) { return '<button type="button" class="eng-chip" style="--c:' + COL[x.id] + '" data-eb-mode="' + x.id + '" aria-pressed="' + (e.mode === x.id) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' +
        '<div class="eb-choices">' + [['70', 'One question, 70 marks'], ['split', 'Two parts, 30 + 40']].map(function (x) { return '<button type="button" class="eng-chip" data-eb-type="' + x[0] + '" aria-pressed="' + (e.type === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        (qs.length ? '<div class="eb-qs">' + qs.sort(function (a, b) { return b.year - a.year; }).slice(0, 12).map(function (q) {
          return '<button type="button" class="eb-q' + (e.q === q.text ? ' is-on' : '') + '" data-eb-q="' + D.questions.indexOf(q) + '"><b>' + q.year + (q.paper === 'deferred' ? ' deferred' : '') +
            ' · ' + (Array.isArray(q.marks) ? '30 + 40' : '70') + '</b> ' + esc(q.text.length > 110 ? q.text.slice(0, 108) + '…' : q.text) + '</button>';
        }).join('') + '</div>' : '') +
        field('q', 'The question', '', e.q, 'Paste or type the question here') +
        field('thesis', 'Your answer to it, in one sentence', 'P', e.thesis, split() ? 'For part (b): e.g. Both texts …, but …' : 'e.g. All three texts present a world where the powerful crush the vulnerable, but only Shawshank lets hope win.',
          '<div class="eb-help"><b>This is your line of argument.</b> Every paragraph will prove a part of it. ' +
          (split() ? 'Part (a) is on one text; part (b) compares the two others.' : 'A 70-mark answer needs at least two texts; using three is marked the same.') + '</div>');
    }
    if (cur === 'plan') {
      var opts = aspectOptions(e.mode);
      return '<h2>Plan: one aspect per paragraph</h2>' +
        (split() ? '<p>Part (a) is on one text, part (b) compares the other two. Pick the text for part (a):</p><div class="eb-choices">' + mine.map(function (t) {
          return '<button type="button" class="eng-chip" style="--c:' + COL[t] + '" data-eb-atext="' + t + '" aria-pressed="' + (textA() === t) + '">' + esc(text(t).title) + '</button>'; }).join('') + '</div>' +
          '<p>Part (b) will compare <b>' + titles(cmp).map(esc).join('</b> and <b>') + '</b>. Now pick 3 or 4 aspects of ' + esc(m.name.toLowerCase()) + ' that answer the question; each becomes a paragraph in both parts.</p>'
          : '<p>Pick 3 or 4 aspects of ' + esc(m.name.toLowerCase()) + ' that answer the question. Each becomes a PACE paragraph comparing ' + titles(cmp).map(esc).join(', ') + '.</p>') +
        '<div class="eb-choices">' + opts.map(function (a) { return '<button type="button" class="eng-chip" style="--c:' + COL[e.mode] + '" data-eb-aspect="' + esc(a) + '" aria-pressed="' + (e.aspects.indexOf(a) >= 0) + '">' + esc(a) + '</button>'; }).join('') + '</div>' +
        '<div class="eb-help"><b>' + e.aspects.length + ' chosen.</b> ' + (e.aspects.length < 3 ? 'Pick at least 3.' : e.aspects.length > 5 ? 'Five at most: depth beats a list.' : 'Good.') + '</div>';
    }
    if (cur === 'intro') {
      return '<h2>' + (split() ? 'Part (b): introduction' : 'Introduction') + '</h2><p>Answer the question straight away, name the texts with their authors or director, and the mode.</p>' +
        field('intro', 'Introduction', '', e.intro || (e.thesis ? e.thesis + ' ' : ''), 'Start with your answer, then name the texts.',
          helpList('Your texts, written correctly', cmp.map(function (t) { return nameLine(text(t)); })), ['judge']);
    }
    if (cur === 'end') {
      return '<h2>' + (split() ? 'Part (b): conclusion' : 'Conclusion') + '</h2><p>Answer the question again, name the biggest similarity or difference, and say which text affected you most and why.</p>' +
        field('end', 'Conclusion', 'E', e.end, 'Ultimately, …', '', ['judge', 'degree']);
    }
    if (cur === 'check') return checkHtml();
    var k = +cur.slice(1), a = e.aspects[k];
    if (cur.charAt(0) === 'a') {
      var pa = e.parasA[a] || {}, ta = textA();
      return '<h2>Part (a), point ' + (k + 1) + ': ' + esc(a) + '</h2><p>Part (a) is on one text, ' + esc(text(ta).title) + ', so there\'s nothing to compare yet: Point, Anchor, Evaluate.</p>' +
        field('aP' + k, 'Point: answer the question for ' + a.toLowerCase(), 'P', pa.P, 'In ' + text(ta).title + ', …', '', []) +
        field('aA' + k, 'Anchor it in a key moment', 'A', pa.A, 'This is crystallised in the moment when …', notesFor(e.mode, a, ta), ['moment']) +
        field('aE' + k, 'Evaluate: what does it show? Back to the question', 'E', pa.E, 'This leaves the reader with …', '', ['judge']);
    }
    var pr = e.paras[a] || {}, t1 = cmp[0], rest = cmp.slice(1);
    return '<h2>' + (split() ? 'Part (b), point ' : 'Point ') + (k + 1) + ': ' + esc(a) + '</h2><p>Build it with PACE. The notes under each box are from your texts: use them in your own words.</p>' +
      field('P' + k, 'Point: answer the question for ' + a.toLowerCase(), 'P', pr.P, cmp.length > 2 ? 'In all three texts, …' : 'In both texts, …', '', ['same', 'degree']) +
      field('A' + k, 'Anchor it in ' + text(t1).title, 'A', pr.A, 'This is crystallised in the moment when …', notesFor(e.mode, a, t1), ['moment']) +
      field('C' + k, 'Compare with ' + titles(rest).join(' and '), 'C', pr.C, 'Similarly, … In contrast, …', rest.map(function (t) { return notesFor(e.mode, a, t); }).join(''), ['same', 'differ', 'degree']) +
      field('E' + k, 'Evaluate: what does it show? Back to the question', 'E', pr.E, cmp.length > 2 ? 'Of the three texts, …' : 'Of the two texts, …', '', ['judge']);
  }
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
  function previewHtml() {
    var e = essay(), out = '';
    if (split()) {
      out += '<p class="eb-part">(a) · 30 marks · ' + esc(text(textA()).title) + '</p>' + e.aspects.map(function (x) {
        return '<p>' + (marked(e.parasA[x] || {}, ['P', 'A', 'E']) || '<span class="eb-ghost">' + esc(x) + ': Point, Anchor, Evaluate…</span>') + '</p>';
      }).join('') + '<p class="eb-part">(b) · 40 marks · ' + titles(compared()).map(esc).join(' and ') + '</p>';
    }
    out += '<p>' + (e.intro ? esc(e.intro) : '<span class="eb-ghost">Introduction…</span>') + '</p>' + e.aspects.map(function (x) {
      return '<p>' + (marked(e.paras[x] || {}, ['P', 'A', 'C', 'E']) || '<span class="eb-ghost">' + esc(x) + ': Point, Anchor, Compare, Evaluate…</span>') + '</p>';
    }).join('') + '<p>' + (e.end ? esc(e.end) : '<span class="eb-ghost">Conclusion…</span>') + '</p>';
    var na = words(essayParts('a').join(' ')), nb = words(essayParts('b').join(' '));
    var count = split() ? '(a) ' + na + ' words · (b) ' + nb + ' words' : nb + ' words';
    var aim = split() ? 'Aim for about 450 in (a) and 650 in (b)' : nb < 900 ? 'Aim for 1,000 to 1,300' : nb > 1500 ? 'Long: about 65 minutes in the exam' : 'A good length';
    return '<div class="eng-paper">' + (e.q ? '<p class="eb-qtext">' + esc(e.q) + '</p>' : '') + '<div class="eb-lines">' + out + '</div></div><div class="eb-count"><span>' + count + '</span><span>' + aim + '</span></div>';
  }
  // The checks: what a reader can see in the text, mapped to P, C, L and M. Not a grade: a list of things to fix.
  function checkHtml() {
    var e = essay(), cmp = compared(), all = essayParts().join('\n'), low = all.toLowerCase(), bTxt = essayParts('b').join('\n').toLowerCase();
    var stop = /^(the|and|that|this|with|which|what|from|your|their|they|them|have|been|does|text|texts|three|least|comparative|course|studied|study|discuss|extent|reference|making|make|answer|support|other|chosen|response|develop)$/;
    var qWords = (e.q.toLowerCase().match(/[a-z]{5,}/g) || []).filter(function (w) { return !stop.test(w); }).filter(function (w, i, arr) { return arr.indexOf(w) === i; });
    var qHit = qWords.filter(function (w) { return low.indexOf(w.slice(0, 6)) >= 0; });
    var nameOf = function (t) { var x = text(t); return [x.title.toLowerCase(), x.author.split(' ').pop().toLowerCase()].concat((x.people || []).map(function (p) { return p.name.split(' ')[0].toLowerCase(); })); };
    var named = function (t, where) { return nameOf(t).slice(0, 2).some(function (n) { return n && where.indexOf(n) >= 0; }); };
    var paras = e.aspects.map(function (x) { return paraText(e.paras[x] || {}, ['P', 'A', 'C', 'E']).toLowerCase(); }).filter(function (p) { return p; });
    var cmpWords = [].concat.apply([], C.language.filter(function (g) { return g.id !== 'moment'; }).map(function (g) { return g.items; })).map(function (s) { return s.replace(/[,.…]/g, '').replace(/ ….*$/, '').trim().toLowerCase(); }).filter(function (s) { return s.length > 3; });
    var usedCmp = cmpWords.filter(function (s) { return bTxt.indexOf(s) >= 0; });
    var modeWords = MODE[e.mode].words.filter(function (w) { return low.indexOf(w.toLowerCase()) >= 0; });
    var used = split() ? chosen() : cmp;
    var titlesRight = used.every(function (t) { var tt = text(t).title; return all.indexOf(tt) >= 0 || low.indexOf(tt.toLowerCase()) < 0; });
    var checks = [
      ['P', qWords.length ? qHit.length >= Math.min(3, qWords.length) : false, 'The question\'s own words', qWords.length ? 'You use ' + qHit.length + ' of its key words (' + qWords.slice(0, 6).join(', ') + '). Keep the question in view in every paragraph.' : 'Put the question in at the first step.'],
      ['P', cmp.every(function (t) { return named(t, (e.intro || '').toLowerCase()); }), (split() ? 'Part (b)\'s texts' : 'Your texts') + ' in the introduction', 'Name each text (and its author or director) in your introduction.'],
      ['C', paras.length >= 3 && paras.every(function (p) { return cmp.filter(function (t) { return nameOf(t).some(function (x) { return x && p.indexOf(x) >= 0; }); }).length >= 2; }), 'Every paragraph compares', 'Each comparative paragraph should bring in at least two texts. One text per paragraph isn\'t a comparison.'],
      ['C', e.aspects.every(function (x) { var p = e.paras[x] || {}; return p.P && p.A && p.C && p.E; }), 'Every paragraph is full PACE', 'Point, Anchor, Compare and Evaluate in each one.'],
      ['L', usedCmp.length >= (split() ? 4 : 6), 'The language of comparison', usedCmp.length + ' comparative phrases so far' + (usedCmp.length ? ' (' + usedCmp.slice(0, 5).join(', ') + ')' : '') + '. Aim for ' + (split() ? 4 : 6) + ' or more in the comparison, and vary them.'],
      ['L', modeWords.length >= 3, 'The words of the mode', modeWords.length + ' ' + MODE[e.mode].name + ' words' + (modeWords.length ? ' (' + modeWords.join(', ') + ')' : '') + '. Aim for 3 or more.'],
      ['M', titlesRight && !/\bi\b/.test(all), 'Titles and spelling', 'Write the titles exactly: ' + titles(used).join(', ') + '. Capital I for yourself.'],
      ['E', !!e.end && /ultimately|for me|most|leaves|overall|of the (three|two)/i.test(e.end), 'A conclusion that answers', 'End by answering the question again and saying which text affected you most.']
    ];
    if (split()) checks.splice(2, 0, ['P', e.aspects.every(function (x) { var p = e.parasA[x] || {}; return p.P && p.A && p.E; }) && named(textA(), essayParts('a').join(' ').toLowerCase()), 'Part (a) on ' + text(textA()).title,
      'Part (a) is on one text: Point, Anchor and Evaluate for each aspect, naming the text.']);
    return '<h2>Check your answer</h2><p>These are things an examiner notices. It\'s a checklist, not a grade.</p>' +
      '<ul class="eb-checks">' + checks.map(function (c) {
        return '<li class="' + (c[1] ? 'is-ok' : 'is-no') + '"><i>' + (c[1] ? '✓' : '!') + '</i><span><b>' + c[0] + ' · ' + esc(c[2]) + '.</b> ' + (c[1] ? '' : esc(c[3])) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="eb-nav"><button type="button" class="eng-btn eng-btn--quiet" data-eb-copyall>Copy the answer</button><button type="button" class="eng-btn eng-btn--quiet" data-eb-new>Start a new one</button></div>';
  }
  function useQuestion(q) { var e = essay(); e.mode = q.mode; e.q = q.text; e.type = Array.isArray(q.marks) ? 'split' : '70'; }
  function renderBuild(arg) {
    renderShell('build', 'Build an essay');
    var e = essay();
    if (arg && MODE[arg] && e.mode !== arg) { e.mode = arg; e.aspects = []; e.step = 0; saveEssay(); }
    if (arg && /^q\d+$/.test(arg) && D.questions[+arg.slice(1)]) { useQuestion(D.questions[+arg.slice(1)]); e.step = 0; saveEssay(); }
    drawBuild();
  }
  function drawBuild() {
    var e = essay(), st = stepsList();
    if (e.step >= st.length) e.step = st.length - 1;
    app.innerHTML = title('Build an essay') +
      '<ol class="eb-steps">' + st.map(function (s, k) { return '<li><button type="button" data-eb-step="' + k + '"' + (k === e.step ? ' aria-current="step"' : '') + '>' + esc(s[1]) + '</button></li>'; }).join('') + '</ol>' +
      '<div class="eb"><div class="eb-panel" data-eb-panel>' + stepHtml() +
        '<div class="eb-nav">' + (e.step > 0 ? '<button type="button" class="eng-btn eng-btn--quiet" data-eb-go="-1">Back</button>' : '<span></span>') +
        (e.step < st.length - 1 ? '<button type="button" class="eng-btn" data-eb-go="1"' + (st[e.step][0] === 'plan' && e.aspects.length < 3 ? ' disabled' : '') + '>Next</button>' : '') + '</div></div>' +
      '<div class="eb-preview" data-eb-preview>' + previewHtml() + '</div></div>';
  }
  function setField(key, v) {
    var e = essay(), m;
    if (key === 'q' || key === 'thesis' || key === 'intro' || key === 'end') e[key] = v;
    else if ((m = /^a([PAE])(\d+)$/.exec(key))) { var aa = e.aspects[+m[2]]; if (!aa) return; (e.parasA[aa] = e.parasA[aa] || {})[m[1]] = v; }
    else { var part = key.charAt(0), k = +key.slice(1), a = e.aspects[k]; if (!a) return; (e.paras[a] = e.paras[a] || {})[part] = v; }
    saveEssay();
    var pv = app.querySelector('[data-eb-preview]');
    if (pv) pv.innerHTML = previewHtml();
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
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (t.closest('[data-sh-menu]')) { menu(!document.body.classList.contains('sh-open')); return; }
    if (document.body.classList.contains('sh-open') && t.closest('.sh-link')) menu(false);
    var pick = t.closest('[data-eng-pick]');
    if (pick) {
      var id = pick.getAttribute('data-eng-pick'), cur = picks();
      if (cur.indexOf(id) >= 0) cur = cur.filter(function (x) { return x !== id; }); else if (cur.length < 3) cur.push(id); else { cur.shift(); cur.push(id); }
      setChosen(cur);
      if (K) K.sfx(cur.indexOf(id) >= 0 ? 'pop' : 'tick', 0.6);
      renderHome();
      return;
    }
    var pv = t.closest('[data-eng-pv]'), pin = t.closest('[data-eng-pin]'), pic = t.closest('[data-eng-pic]'), sp = t.closest('[data-eng-showpic]');
    if (pv && pin) { openPin(pv.getAttribute('data-eng-pv'), +pin.getAttribute('data-eng-pin')); return; }
    if (pv && pic) { showPic(pv.getAttribute('data-eng-pv'), +pic.getAttribute('data-eng-pic')); return; }
    if (sp) { var tb = document.querySelector('[data-eng-pv]'); if (tb) showPic(tb.getAttribute('data-eng-pv'), +sp.getAttribute('data-eng-showpic'), true); return; }
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
    var md = t.closest('[data-eb-mode]');
    if (md) { e = essay(); if (e.mode !== md.getAttribute('data-eb-mode')) { e.mode = md.getAttribute('data-eb-mode'); e.aspects = []; } saveEssay(); drawBuild(); return; }
    var qq = t.closest('[data-eb-q]');
    if (qq) { useQuestion(D.questions[+qq.getAttribute('data-eb-q')]); saveEssay(); drawBuild(); return; }
    var ty = t.closest('[data-eb-type]');
    if (ty) { essay().type = ty.getAttribute('data-eb-type'); saveEssay(); drawBuild(); return; }
    var at = t.closest('[data-eb-atext]');
    if (at) { essay().textA = at.getAttribute('data-eb-atext'); saveEssay(); drawBuild(); return; }
    var as = t.closest('[data-eb-aspect]');
    if (as) {
      e = essay(); var a = as.getAttribute('data-eb-aspect'), i = e.aspects.indexOf(a);
      if (i >= 0) e.aspects.splice(i, 1); else if (e.aspects.length < 5) e.aspects.push(a);
      saveEssay(); drawBuild(); return;
    }
    var ins = t.closest('[data-eb-insert]');
    if (ins) {
      var box = ins.closest('.eb-field').querySelector('textarea'), s = ins.getAttribute('data-eb-insert').replace(/ …$/, ' ');
      var at = box.selectionStart || box.value.length;
      box.value = box.value.slice(0, at) + (at && !/\s$/.test(box.value.slice(0, at)) ? ' ' : '') + s + (/[,]$/.test(s) ? ' ' : '') + box.value.slice(at);
      box.focus();
      setField(box.getAttribute('data-eb'), box.value);
      return;
    }
    if (t.closest('[data-eb-copyall]')) { copy(essayParts().join('\n\n')); return; }
    if (t.closest('[data-eb-new]')) { if (window.confirm('Start a new answer? This one will be cleared.')) { E = null; store('eng-essay', 'null'); drawBuild(); } return; }
  });
  document.addEventListener('input', function (ev) {
    var key = ev.target.getAttribute && ev.target.getAttribute('data-eb');
    if (key) setField(key, ev.target.value);
  });

  // ---------- routes ----------
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, '')), p = h.split('/');
    menu(false);
    if (p[0] === 'play' && window.EngGames) { window.EngGames.open(p[1]); history.replaceState(null, '', '#'); renderHome(); return; }
    if (p[0] === 'marking') renderMarking();
    else if (p[0] === 'structure') renderStructure();
    else if (p[0] === 'mode') renderMode(p[1]);
    else if (p[0] === 'text') renderText(p[1], p[2]);
    else if (p[0] === 'language') renderLanguage();
    else if (p[0] === 'questions') renderQuestions();
    else if (p[0] === 'build') renderBuild(p[1]);
    else renderHome();
    if (!p[2]) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  // Left and right arrows change the picture while you're in the pictures.
  document.addEventListener('keydown', function (ev) {
    var pv = ev.target.closest && ev.target.closest('[data-eng-pv]');
    if (!pv || ev.altKey || ev.ctrlKey || ev.metaKey || (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight')) return;
    var id = pv.getAttribute('data-eng-pv');
    ev.preventDefault(); showPic(id, PV[id].k + (ev.key === 'ArrowRight' ? 1 : -1));
    var on = pv.querySelector('.eng-pv__th.is-on'); if (on) on.focus({ preventScroll: true });
  });
  window.EngApp = { chosen: chosen, text: text, data: D, colour: COL };
  route();
})();

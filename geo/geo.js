// geography.html: Leaving Cert Higher Level Geography essays, learned the way the English essays are: a clue, you write
// the point, the marker corrects it as you go. Every point is an SRP from a topic's bank (geo/data/*.js), every essay
// type is modelled on its marking scheme, and every past essay from 2006 to 2025 (and 2026 by topic) is in geo/papers.js.
// The page is built from the English subject's own parts (eng/eng.css): the shell, the cards and photo cards, the
// green buttons and chips, the paper question slips, and on the desk the wooden desk, the cream sheet, the coach panel
// with the examiner's bubble and the stamps (the user: "make the font and ui SAME AS ENGLISH THE ENGLISH SUBJECT").
// Pages (the hash): ""            all of Geography
//                   t/<topic>     a topic: build your points, its essay types, diagrams/photos/videos, games, past questions
//                   w/<essay>[/<ref>]   the writing desk (ref: a past question, e.g. 2024-2B-i)
//                   learn/<topic>[/<srp>] build your points: pick the one that scores, then write it yourself
//                   bank/<topic>  your points, and how far they get you in every past essay
//                   play/real/<topic>, play/where/<topic>   the games
//                   papers        every past question
// Nothing you click writes into an answer: the essay and the bank hold only what you type.
(function () {
  'use strict';
  var M = window.GeoMark, G = M.index(), P = window.GEO_PAPERS || [];
  var app = document.getElementById('geo-app'), side = document.getElementById('geo-side'), bar = document.getElementById('geo-top');
  var TEACH = window.ExamTeacher;

  var GROUPS = [
    { id: 'earth', name: 'The restless earth', ids: ['plates', 'quakes', 'volcanoes', 'deform', 'isostasy'] },
    { id: 'rocks', name: 'Rocks', ids: ['rocks', 'landscape', 'rockuse'] },
    { id: 'surface', name: 'Surface processes', ids: ['weathering', 'karst', 'landforms', 'massmove', 'surfacehuman'] },
    { id: 'colonial', name: 'Colonialism', ids: ['india'] }
  ];
  function topicsIn(g) { return g.ids.map(function (id) { return G.topic[id]; }).filter(Boolean); }
  function groupOf(tid) { return GROUPS.filter(function (g) { return g.ids.indexOf(tid) >= 0; })[0]; }

  // ---------- past questions ----------
  var REF = {}, BY_ESSAY = {};
  function refOf(q, a) { return q.year + '-' + q.id + (a.label ? '-' + a.label.replace(/[()]/g, '') : ''); }
  P.forEach(function (q) {
    (q.ask || []).forEach(function (a) {
      var r = refOf(q, a), item = { q: q, a: a, ref: r };
      REF[r] = item;
      (BY_ESSAY[a.essay] = BY_ESSAY[a.essay] || []).push(item);
    });
  });
  Object.keys(BY_ESSAY).forEach(function (k) { BY_ESSAY[k].sort(function (x, y) { return y.q.year - x.q.year; }); });
  // 2026 is listed by topic from the exam reviews (rev): the year alone, and the essay type's own question
  function qLabel(it) { return it.q.rev ? String(it.q.year) : it.q.year + ' · ' + it.q.id + (it.a.label ? ' ' + it.a.label : ''); }
  function topicPapers(tid) {
    var out = [];
    P.forEach(function (q) {
      (q.ask || []).forEach(function (a) { var e = G.essay[a.essay]; if (e && e.topic === tid) out.push(REF[refOf(q, a)]); });
    });
    return out.sort(function (x, y) { return y.q.year - x.q.year || (x.q.id < y.q.id ? -1 : 1); });
  }
  // the past questions an SRP scores in
  function srpPapers(s) {
    var out = [];
    (s.essays || []).forEach(function (eid) { (BY_ESSAY[eid] || []).forEach(function (it) { out.push(it); }); });
    return out.sort(function (x, y) { return y.q.year - x.q.year; });
  }
  function questionText(it) {
    if (it.q.rev) { var e = G.essay[it.a.essay]; return e ? e.ask : it.q.title; }
    var lines = it.q.text.split('\n');
    if (it.a.label) {
      var lab = it.a.label, start = -1;
      lines.forEach(function (l, i) { if (start < 0 && l.indexOf(lab) === 0) start = i; });
      if (start >= 0) {
        var rest = lines.slice(start), stop = rest.slice(1).findIndex(function (l) { return /^\(i+\)|^or$/i.test(l.trim()); });
        lines = (stop >= 0 ? rest.slice(0, stop + 1) : rest);
        lines[0] = lines[0].replace(/^\(i+\)\s*/, '');
      }
    }
    return lines.filter(function (l) { return !/^(answer \(i\) or \(ii\)\.?|or)$/i.test(l.trim()); }).join(' ').replace(/\s+-\s+/g, ' – ').replace(/:\s+–\s+/g, ': ').trim();
  }

  // ---------- storage (your essays and your bank stay in this browser) ----------
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window: nothing kept */ } }
  function bank(tid) { return load('geo-bank-' + tid, {}); }
  function bankCount(tid) { var b = bank(tid), t = G.topic[tid]; return t ? t.srps.filter(function (s) { return b[s.id]; }).length : 0; }

  // ---------- small helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function keyBoxes(c1) { return '<span class="g-words">' + String(c1 || '').split(' · ').map(function (w) { return '<span class="g-word">' + esc(w) + '</span>'; }).join('') + '</span>'; }
  function rules(t) { return (t && t.normalise) || []; }

  // ---------- the shell: the English top bar (menu, where you are, the subjects) ----------
  var SUBJECTS = '<a href="geography.html" aria-current="page">Geography</a><a href="biology.html">Biology</a><a href="english.html">English</a><a href="irish.html">Irish</a><a href="german.html">German</a>';
  function link(href, label, active, extra) {
    return '<a class="sh-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + (extra || '') + '<span class="sh-t">' + esc(label) + '</span></a>';
  }
  function dot(t) { return '<span class="eng-tag" style="--c:' + esc(t.colour) + '">&nbsp;</span>'; }
  function shell(active, crumbs) {
    document.body.classList.remove('sh-open');
    var nav = link('#', 'All of Geography', active === 'hub') + link('#papers', 'Every past question', active === 'papers');
    GROUPS.forEach(function (g) {
      var ts = topicsIn(g);
      if (!ts.length) return;
      nav += '<p class="sh-group">' + esc(g.name) + '</p>' + ts.map(function (t) {
        return link('#t/' + t.id, t.name, active === 't/' + t.id, '<span class="sh-n" aria-hidden="true">' + dot(t) + '</span>');
      }).join('');
    });
    nav += '<p class="sh-group">On the exam paper</p>' + link('Geography%20Questions.dc.html', '2024 Question 3 on the desk', false);
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (TEACH ? TEACH.head() : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="Geography">' + nav + '</nav>';
    var crumb = '';
    if (crumbs && crumbs.length) {
      crumb = '<a href="#">Geography</a>';
      crumbs.forEach(function (c, i) { crumb += '<span class="sh-sep" aria-hidden="true">/</span>' + (c[1] && i < crumbs.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span class="sh-here">' + esc(c[0]) + '</span>'); });
    } else crumb = '<span class="sh-here">Geography</span>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="geo-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb">' + crumb + '</p><nav class="sh-switch" aria-label="Subject">' + SUBJECTS + '</nav>';
    window.scrollTo(0, 0);
  }
  function menu(open) {
    document.body.classList.toggle('sh-open', open);
    var b = bar.querySelector('[data-sh-menu]');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function title(h, btn) { return '<div class="cv-title rise"><h1 class="cv-h1">' + esc(h) + '</h1>' + (btn || '') + '</div>'; }

  // ---------- diagrams, photos, videos (geo/media/*.js: window.GEO_MEDIA) ----------
  // An item shows on its topic's page, and on the desk when its tags include the essay or an option picked there.
  var MEDIA = window.GEO_MEDIA || { figs: [], photos: [], videos: [] };
  var MKINDS = [['figs', 'fig'], ['photos', 'photo'], ['videos', 'video']];
  function mediaOf(tid, tags) {
    var out = [];
    MKINDS.forEach(function (k) {
      (MEDIA[k[0]] || []).forEach(function (m) {
        if (tags) { if (!(m.tags || []).some(function (x) { return tags.indexOf(x) >= 0; })) return; }
        else if (m.topic !== tid) return;
        out.push({ kind: k[1], m: m });
      });
    });
    // on the desk: diagrams first (the one to draw), then photos, then videos, at most three of each
    if (tags) { var n = {}; out = out.filter(function (x) { n[x.kind] = (n[x.kind] || 0) + 1; return n[x.kind] <= 3; }); }
    return out;
  }
  // a topic's picture: its first photo (the registry lists the best one first)
  function photoOf(tid) { return (MEDIA.photos || []).filter(function (m) { return m.topic === tid; })[0] || null; }
  var MID = {};
  function mediaKey(x) { var key = x.kind + ':' + (x.m.id || x.m.file); MID[key] = x; return key; }
  function mediaImg(x) { return x.kind === 'video' ? 'https://i.ytimg.com/vi/' + encodeURIComponent(x.m.id) + '/hqdefault.jpg' : x.m.file; }
  function mediaKind(x) { return x.kind === 'fig' ? 'Diagram to draw' : x.kind === 'photo' ? 'Photo' : 'Video' + (x.m.secs ? ' · ' + Math.max(1, Math.round(x.m.secs / 60)) + ' min' : ''); }
  function mediaName(m) { return m.name || m.caption || m.title || ''; }
  // on a topic page: English's photo cards
  function mediaCard(x) {
    return '<button type="button" class="eng-pick g-pick' + (x.kind === 'fig' ? ' is-fig' : '') + '" data-g-media="' + esc(mediaKey(x)) + '"><span class="eng-pick__img"><img src="' + esc(mediaImg(x)) + '" alt="" loading="lazy">' +
      (x.kind === 'video' ? '<span class="g-play" aria-hidden="true"></span>' : '') + '</span><span class="eng-pick__body"><span class="eng-pick__t">' + esc(mediaName(x.m)) + '</span><span class="eng-pick__a">' + esc(mediaKind(x)) + '</span></span></button>';
  }
  // in the coach: English's rows with a picture (as its key moments)
  function mediaRow(x) {
    return '<button type="button" class="ebd-mo g-mo" data-g-media="' + esc(mediaKey(x)) + '"><span class="g-mo__img"><img src="' + esc(mediaImg(x)) + '" alt="" loading="lazy">' +
      (x.kind === 'video' ? '<span class="g-play g-play--s" aria-hidden="true"></span>' : '') + '</span><span><b>' + esc(mediaName(x.m)) + '</b><small>' + esc(mediaKind(x)) + '</small></span></button>';
  }
  var VIEW = null;
  function openMedia(key, from) {
    var x = MID[key];
    if (!x) return;
    closeMedia();
    var m = x.m, body = '';
    if (x.kind === 'fig') body = '<div class="g-view__fig" data-g-fig></div><p class="g-view__draw">Draw this one. A labelled diagram earns 1 SRP, and new information on its labels up to 2 more.</p>';
    else if (x.kind === 'photo') body = '<div class="g-view__fig"><img src="' + esc(m.file) + '" alt="' + esc(m.caption) + '"></div><p class="g-view__p">' + esc(m.caption) +
      '. Photo: ' + esc(m.credit || 'Wikimedia Commons') + (m.licence ? ', ' + esc(m.licence) : '') + (m.source ? ' (<a href="' + esc(m.source) + '" target="_blank" rel="noopener">source</a>)' : '') + '.</p>';
    else body = '<div class="g-view__vid"><span class="g-view__spin" aria-hidden="true"></span><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(m.id) + '?autoplay=1&rel=0&modestbranding=1' + (m.start ? '&start=' + (+m.start) : '') +
      '" title="' + esc(m.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p class="g-view__p">' + esc(m.why || '') + (m.channel ? ' · ' + esc(m.channel) : '') + '</p>';
    var el = document.createElement('div');
    el.className = 'g-view';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', mediaName(m));
    el.innerHTML = '<div class="g-view__box"><button type="button" class="g-view__x" data-g-close aria-label="Close">×</button><h2 class="g-view__t">' + esc(mediaName(m)) + '</h2>' + body + '</div>';
    document.body.appendChild(el);
    VIEW = { el: el, from: from };
    el.querySelector('[data-g-close]').focus();
    if (x.kind === 'fig') {
      fetch(m.file).then(function (r) { return r.text(); }).then(function (svg) {
        var box = el.querySelector('[data-g-fig]');
        if (!box || !VIEW || VIEW.el !== el) return;
        box.innerHTML = svg.replace(/^[\s\S]*?(<svg)/i, '$1');
        var root = box.querySelector('svg');
        if (root && root.setCurrentTime) {
          // the labels come in from the start each time; with reduced motion, the finished diagram at once
          if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { root.setCurrentTime(60); root.pauseAnimations(); }
          else root.setCurrentTime(0);
        }
      }).catch(function () {});
    }
  }
  function closeMedia() {
    if (!VIEW) return;
    var from = VIEW.from;
    document.body.removeChild(VIEW.el);
    VIEW = null;
    if (from && from.focus) from.focus();
  }

  // ---------- all of Geography (English's hub: the cards in groups; the topics as photo cards) ----------
  function renderHub() {
    shell('hub');
    var nS = G.topics.reduce(function (a, t) { return a + t.srps.length; }, 0), nB = G.topics.reduce(function (a, t) { return a + bankCount(t.id); }, 0);
    var h = title('Geography') + '<p class="eng-p rise">Higher Level. Every essay on physical geography from 2006 to 2026, and colonialism: <b>' + P.length + ' past essays</b> and <b>' + nS + ' points</b> to learn' +
      (nB ? ', <b>' + nB + '</b> of them in your bank' : '') + '. Pick a topic.</p>';
    GROUPS.forEach(function (g, gi) {
      var ts = topicsIn(g);
      if (!ts.length) return;
      h += '<h2 class="eng-h2 rise" style="--i:' + (gi + 1) + '">' + esc(g.name) + '</h2><div class="eng-grid eng-grid--4 g-topics">' + ts.map(function (t, i) { return topicCard(t, gi * 4 + i + 1); }).join('') + '</div>';
    });
    h += '<h2 class="eng-h2 rise">Practice</h2><div class="eng-grid eng-grid--2">' +
      '<a class="eng-card eng-part rise" href="#papers"><span class="eng-part__m">2006 to 2026</span><h3>Every past question</h3><p>All ' + P.length + ' of them, by year. Each one opens on the writing desk.</p></a>' +
      '<a class="eng-card eng-part rise" href="Geography%20Questions.dc.html"><span class="eng-part__m">2024, Question 3</span><h3>The exam desk</h3><p>The real 2024 paper on the desk, with the walkthrough.</p></a></div>';
    app.innerHTML = h;
  }
  function topicCard(t, i) {
    var n = t.srps.length, have = bankCount(t.id), asked = topicPapers(t.id).length, ph = photoOf(t.id);
    return '<div class="eng-pick rise" style="--c:' + esc(t.colour) + ';--i:' + i + '"><a class="eng-pick__link" href="#t/' + t.id + '"><span class="eng-pick__img">' +
      (ph ? '<img src="' + esc(ph.file) + '" alt="" loading="lazy">' : '<span class="eng-pick__init">' + esc(t.name.charAt(0)) + '</span>') + '</span>' +
      '<span class="eng-pick__body"><span class="eng-pick__t">' + esc(t.name) + '</span><span class="eng-pick__a">' + plural(asked, 'past essay') + ' · ' + plural(n, 'point') + (have ? ' · ' + have + ' in your bank' : '') + '</span></span></a></div>';
  }

  // ---------- a topic ----------
  function renderTopic(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name]]);
    var have = bankCount(tid), n = t.srps.length, papers = topicPapers(tid), media = mediaOf(tid, null);
    var h = title(t.name, '<a class="eng-btn" href="#learn/' + tid + '">Build your points</a>') + '<p class="eng-p rise">' + esc(t.blurb || '') + '</p>';
    h += '<a class="eng-card g-learn rise" style="--c:' + esc(t.colour) + '" href="#learn/' + tid + '"><span class="eng-bar"></span><h3>Build your points</h3>' +
      '<p>A clue, you pick the version that gets the marks, then you write it yourself. Every point you get goes into your bank, in your own words.</p>' +
      '<p class="g-learn__n"><b>' + have + '</b> of ' + n + ' in your bank</p><span class="g-track"><i style="width:' + (n ? Math.round(100 * have / n) : 0) + '%"></i></span></a>';
    h += '<h2 class="eng-h2 rise">The essays</h2><div class="eng-grid eng-grid--2">' + t.essays.map(function (e, i) { return essayCard(e, t, i + 2); }).join('') + '</div>';
    if (media.length) h += '<h2 class="eng-h2 rise">Diagrams, photos and videos</h2><div class="eng-grid eng-grid--4">' + media.map(mediaCard).join('') + '</div>';
    h += '<h2 class="eng-h2 rise">Games</h2><div class="eng-grid eng-grid--3">' +
      '<a class="eng-card eng-part rise" href="#play/real/' + tid + '"><h3>Real, vague or wrong?</h3><p>Ten sentences. Say which ones get the marks.</p></a>' +
      '<a class="eng-card eng-part rise" href="#play/where/' + tid + '"><h3>Where does it score?</h3><p>One point, many essays: find every past question it earns marks in.</p></a>' +
      '<a class="eng-card eng-part rise" href="#bank/' + tid + '"><h3>Your bank vs the papers</h3><p>How many marks your points get in every past essay.</p></a></div>';
    h += '<h2 class="eng-h2 rise">Past questions</h2>' + slips(papers, false);
    app.innerHTML = h;
  }
  function essayCard(e, t, i) {
    var asked = BY_ESSAY[e.id] || [], opts = [];
    (e.parts || []).forEach(function (p) { (p.opts || []).forEach(function (o) { if (opts.indexOf(o.name) < 0) opts.push(o.name); }); });
    return '<a class="eng-card eng-part g-essay rise" style="--c:' + esc(t.colour) + ';--i:' + i + '" href="#w/' + e.id + '"><span class="eng-bar"></span>' +
      '<span class="eng-part__m">' + (asked.length ? 'Asked ' + asked.map(function (it) { return it.q.year; }).filter(function (y, k, a) { return a.indexOf(y) === k; }).join(', ') : 'Not asked yet') + '</span>' +
      '<h3>' + esc(e.name) + '</h3><p>' + esc(e.ask) + '</p>' + (opts.length ? '<p class="g-essay__opts">' + opts.map(esc).join(' · ') + '</p>' : '') +
      '<span class="eng-part__s">Write it</span></a>';
  }
  // past questions as English's paper slips: the year, the part and marks, the question
  function slips(items, showTopic) {
    return '<div class="ebd-slips g-slips">' + items.map(function (it) {
      var e = G.essay[it.a.essay], t = e && G.topic[e.topic];
      return '<a class="ebd-slip" style="--c:' + esc(t ? t.colour : '#93A5AE') + '" href="#w/' + (e ? e.id : '') + '/' + it.ref + '"><span class="ebd-slip__y">' + it.q.year + '</span>' +
        '<span class="ebd-slip__m">' + esc((it.q.rev ? '' : it.q.id + (it.a.label ? ' ' + it.a.label : '') + ' · ') + (it.q.marks || 30) + ' marks') + '</span>' +
        '<span class="ebd-slip__t">' + esc(questionText(it)) + (showTopic && t ? ' <i class="g-slip__topic">' + esc(t.name) + '</i>' : '') + '</span></a>';
    }).join('') + '</div>';
  }

  // ---------- every past question ----------
  var paperFilter = 'all';
  function renderPapers() {
    shell('papers', [['Every past question']]);
    var items = [];
    P.forEach(function (q) { (q.ask || []).forEach(function (a) { var it = REF[refOf(q, a)], e = G.essay[a.essay]; if (!e) return; if (paperFilter === 'all' || (groupOf(e.topic) || {}).id === paperFilter) items.push(it); }); });
    items.sort(function (x, y) { return y.q.year - x.q.year || (x.q.id < y.q.id ? -1 : x.q.id > y.q.id ? 1 : 0); });
    app.innerHTML = title('Every past question') + '<p class="eng-p">Higher Level, 2006 to 2026: Section 1, Questions 1 to 3 (parts B and C, 30 marks), and every question on colonialism. 2026 is listed by topic, from the exam reviews.</p>' +
      '<div class="eng-filter">' + [['all', 'All']].concat(GROUPS.map(function (g) { return [g.id, g.name]; })).map(function (f) {
        return '<button type="button" class="eng-chip" data-g-filter="' + f[0] + '" aria-pressed="' + (paperFilter === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div>' + slips(items, true);
  }

  // =====================================================================================================
  // ---------- the writing desk (English's Build an essay: the wooden desk, the sheet, the coach) ----------
  // You write the essay on the sheet. Each sentence is marked once it is finished, in the examiner's red pen: a point
  // (SRP, 2 marks) or a named mark gets "+2" in the margin; a vague one, a repeat, or a point this question doesn't ask
  // for is marked so. The examiner says why in his bubble, the stamps at the top fill in, and the coach's clue is always
  // for the next point you haven't made: a question, then its key words, then the point itself to read (never to copy:
  // it can't be selected or put in).
  // =====================================================================================================
  var D = null;
  function renderDesk(eid, ref) {
    var e = G.essay[eid];
    if (!e) return renderHub();
    var t = G.topic[e.topic], pq = ref && REF[ref] && REF[ref].a.essay === eid ? REF[ref] : null;
    var saved = load('geo-essay-' + eid, {});
    D = { e: e, t: t, pq: pq, pick: {}, text: saved.text || '', skip: {}, target: null, level: 0, sel: -1, caret: 0, r: null, chosen: !!saved.chosen };
    var optParts = (e.parts || []).filter(function (p) { return p.opts && p.opts.length; });
    optParts.forEach(function (p) { var s = saved.pick && saved.pick[p.id]; if (s && p.opts.some(function (o) { return o.id === s; })) D.pick[p.id] = s; });
    if (pq && pq.a.opt) { optParts.forEach(function (p) { if (p.opts.some(function (o) { return o.id === pq.a.opt; })) D.pick[p.id] = pq.a.opt; }); D.chosen = true; }
    optParts.forEach(function (p) {
      if (D.pick[p.id]) return;
      var taken = Object.keys(D.pick).map(function (k) { return D.pick[k]; });
      D.pick[p.id] = (p.opts.filter(function (o) { return taken.indexOf(o.id) < 0; })[0] || p.opts[0]).id;
    });
    shell('t/' + t.id, [[t.name, '#t/' + t.id], [pq ? qLabel(pq) : e.name]]);
    var ask = pq ? questionText(pq) : e.ask;
    var max = (e.head || []).reduce(function (a, h) { return a + (h.marks || 2); }, 0) + 2 * e.need;
    var h = '<div class="ebd-top rise"><div><h1 class="cv-h1">' + esc(e.name) + '</h1></div><div class="ebd-stamps g-stamps" data-gd-stamps></div></div>' +
      '<div class="g-mini" aria-hidden="true"><span>' + (TEACH ? TEACH.head() : '') + '</span><p><span data-gd-mini></span><small data-gd-mini-next></small></p></div>' +
      '<div class="ebd g-desk">' +
      '<div class="ebd-desk rise" style="--i:1"><div class="ebd-sheet"><div class="ebd-q is-on" style="--c:' + esc(t.colour) + '"><span class="ebd-q__tab">' + (pq ? esc(qLabel(pq)) + ' · ' : '') + max + ' marks</span><p>' + esc(ask) + '</p></div>' +
      '<div class="gd-write"><div class="gd-mirror" aria-hidden="true"></div>' +
      '<textarea class="gd-ta" aria-label="Your answer" spellcheck="true" autocapitalize="sentences" placeholder="Write your answer here, one point per sentence."></textarea>' +
      '<div class="gd-marks"></div></div>' +
      '<p class="ebd-count"><span data-gd-words>0 words</span><button type="button" class="g-clear" data-gd-clear>Start again</button></p></div></div>' +
      '<aside class="ebd-coach rise" style="--i:2" aria-label="Marking">' +
      '<div class="ebd-face"><span data-gd-face>' + (TEACH ? TEACH.head() : '') + '</span><p data-gd-say aria-live="polite"></p></div>' +
      '<div class="ebd-coach__body">' +
      (optParts.length ? optParts.map(function (p) {
        return '<div class="ebd-chips"><h4>' + esc(p.pick || p.name) + '</h4><div class="eb-choices">' + p.opts.map(function (o) {
          return '<button type="button" class="eng-chip" style="--c:' + esc(t.colour) + '" data-gd-pick="' + esc(p.id) + '" data-opt="' + esc(o.id) + '">' + esc(o.name) + '</button>';
        }).join('') + '</div></div>';
      }).join('') : '') +
      '<div data-gd-clue></div>' +
      '<div class="ebd-notes g-marks" data-gd-rows></div>' +
      '<div data-gd-media></div>' +
      '<details class="ebd-notes g-plan"><summary><h4>Every point for this answer</h4></summary><ol data-gd-plan></ol></details>' +
      '<details class="ebd-notes g-scheme"><summary><h4>How it\'s marked</h4></summary><ul>' + (e.notes || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '<li>' + esc(schemeLine(e)) + '</li></ul>' +
      (BY_ESSAY[e.id] && BY_ESSAY[e.id].length ? '<p class="g-asked">' + BY_ESSAY[e.id].map(function (it) { return '<a href="#w/' + e.id + '/' + it.ref + '">' + esc(qLabel(it)) + '</a>'; }).join('') + '</p>' : '') + '</details>' +
      '</div></aside></div>';
    app.innerHTML = h;
    var ta = $('.gd-ta', app);
    ta.value = D.text;
    D.ta = ta;
    D.caret = ta.value.length;   // the examiner speaks about the last sentence written
    paintPicks();
    paintMedia();
    grow();
    update();
  }
  function schemeLine(e) {
    var hs = (e.head || []).map(function (h) { return h.label + ' ' + (h.marks || 2) + ' marks'; });
    var parts = (e.parts || []).filter(function (p) { return p.max != null; }).map(function (p) { return p.name + ' up to ' + p.max + ' SRPs'; });
    return (hs.length ? hs.join(', ') + '; ' : '') + e.need + ' SRPs at 2 marks each' + (parts.length ? ' (' + parts.join(', ') + ')' : '') + '.';
  }
  function deskTags() {
    var tags = [D.e.id];
    Object.keys(D.pick).forEach(function (k) { tags.push(D.pick[k]); });
    return tags;
  }
  function paintMedia() {
    var el = $('[data-gd-media]', app);
    if (!el) return;
    var list = mediaOf(D.t.id, deskTags());
    el.innerHTML = list.length ? '<div class="ebd-notes g-see"><h4>See it</h4>' + list.map(mediaRow).join('') + '</div>' : '';
  }
  function paintPicks() {
    $$('[data-gd-pick]', app).forEach(function (b) {
      var pid = b.getAttribute('data-gd-pick'), oid = b.getAttribute('data-opt');
      var mine = D.pick[pid] === oid, other = Object.keys(D.pick).some(function (k) { return k !== pid && D.pick[k] === oid; });
      b.setAttribute('aria-pressed', String(mine));
      b.disabled = other;
    });
  }
  function grow() { var ta = D.ta; ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight, 34 * 12) + 'px'; }
  function cls(s) {
    if (s.srp) return 'is-srp';
    if (s.heads && s.heads.length) return 'is-head';
    if (s.note === 'vague') return 'is-vague';
    if (s.note === 'repeat' || s.note === 'off') return 'is-' + s.note;
    return '';
  }
  // Until you pick an option yourself, the desk follows what you write: the first landform (process, interaction...)
  // you name becomes your first, the next different one your second.
  function autoPick() {
    if (D.chosen) return false;
    var optParts = (D.e.parts || []).filter(function (p) { return p.opts && p.opts.length; });
    if (!optParts.length) return false;
    var named = [];
    M.sentences(D.text).forEach(function (s) {
      var norm = M.normalise(s.text, rules(D.t)), tok = norm.trim().split(' '), here = [];
      optParts.forEach(function (p) { p.opts.forEach(function (o) {
        if (named.indexOf(o.id) >= 0 || here.some(function (x) { return x.id === o.id; }) || !M.allHit(o.k, norm, tok)) return;
        var at = norm.length;
        o.k[0].forEach(function (st) { var i = norm.indexOf(' ' + st); if (i >= 0 && i < at) at = i; });
        here.push({ id: o.id, at: at });
      }); });
      here.sort(function (a, b) { return a.at - b.at; }).forEach(function (x) { named.push(x.id); });
    });
    if (!named.length) return false;
    var taken = [], assigned = {}, before = JSON.stringify(D.pick);
    optParts.forEach(function (p) {
      var id = named.filter(function (x) { return taken.indexOf(x) < 0 && p.opts.some(function (o) { return o.id === x; }); })[0];
      if (id) { D.pick[p.id] = id; taken.push(id); assigned[p.id] = 1; }
    });
    // a part nobody has named yet keeps an option of its own
    optParts.forEach(function (p) {
      if (assigned[p.id]) return;
      if (taken.indexOf(D.pick[p.id]) < 0) { taken.push(D.pick[p.id]); return; }
      var free = p.opts.filter(function (o) { return taken.indexOf(o.id) < 0; })[0];
      if (free) { D.pick[p.id] = free.id; taken.push(free.id); }
    });
    var changed = JSON.stringify(D.pick) !== before;
    if (changed) { paintPicks(); paintMedia(); }
    return changed;
  }
  function update() {
    if (autoPick()) D.target = null;
    var r = M.mark(D.e, D.text, D.pick);
    D.r = r;
    save('geo-essay-' + D.e.id, { text: D.text, pick: D.pick, chosen: !!D.chosen });
    paintMirror(r);
    paintScore(r);
    chooseTarget(r);
    paintClue();
    paintPlan(r);
    paintSay();
    $('[data-gd-words]', app).textContent = plural(words(D.text), 'word');
  }
  function paintMirror(r) {
    var text = D.text, h = '', at = 0;
    r.sentences.forEach(function (s, i) {
      h += esc(text.slice(at, s.start));
      h += '<span class="gd-s ' + cls(s) + (i === D.sel ? ' is-sel' : '') + '" data-s="' + i + '">' + esc(text.slice(s.start, s.end)) + '</span>';
      at = s.end;
    });
    h += esc(text.slice(at)) + '​';
    var mirror = $('.gd-mirror', app);
    mirror.innerHTML = h;
    // the margin: what each finished sentence earned, beside its last line, in red pen
    var box = $('.gd-write', app), top0 = box.getBoundingClientRect().top, rows = {};
    r.sentences.forEach(function (s, i) {
      if (!cls(s)) return;
      var el = mirror.querySelector('[data-s="' + i + '"]'), rects = el && el.getClientRects();
      if (!rects || !rects.length) return;
      var y = Math.round(rects[rects.length - 1].top - top0);
      var marks = (s.srp ? 2 : 0) + (s.heads || []).length * 2;
      var row = rows[y] = rows[y] || { y: y, marks: 0, note: '', i: i };
      row.marks += marks;
      if (!marks && !row.note) row.note = s.note === 'vague' ? 'vague' : s.note === 'repeat' ? 'repeat' : 'off';
    });
    $('.gd-marks', app).innerHTML = Object.keys(rows).map(function (k) {
      var row = rows[k];
      return '<button type="button" class="gd-m ' + (row.marks ? 'is-ok' : 'is-' + row.note) + '" style="top:' + row.y + 'px" data-gd-s="' + row.i + '" tabindex="-1">' +
        (row.marks ? '✓ ' + row.marks : row.note) + '</button>';
    }).join('');
  }
  function paintScore(r) {
    // English's stamps: one for each named mark (N), then one for each SRP, filled in green as they're earned
    var st = '';
    r.heads.forEach(function (h) { st += '<i class="' + (h.got ? 'is-ok' : '') + '" title="' + esc(h.label) + '">N</i>'; });
    for (var i = 0; i < r.need; i++) st += '<i class="' + (i < r.srps ? 'is-ok' : '') + '">' + (i + 1) + '</i>';
    var stamps = $('[data-gd-stamps]', app);
    var was = D.lastMarks == null ? r.marks : D.lastMarks;
    stamps.innerHTML = st + '<span><b>' + r.marks + '</b> of ' + r.max + '</span>';
    if (r.marks > was) { var ok = $$('i.is-ok', stamps); if (ok.length) ok[ok.length - 1].classList.add('is-new'); }
    D.lastMarks = r.marks;
    var rows = r.heads.map(function (h) {
      return '<p class="g-row' + (h.got ? ' is-got' : '') + '"><span>' + esc(h.label) + (h.got && h.item ? ': ' + esc(h.item) : '') + '</span><b>' + (h.got ? h.marks : 0) + '/' + h.marks + '</b></p>';
    });
    rows.push('<p class="g-row' + (r.srps >= r.need ? ' is-got' : '') + '"><span>Points (SRPs)</span><b>' + r.srps + '/' + r.need + '</b></p>');
    if (r.parts.length > 1) r.parts.forEach(function (p) {
      rows.push('<p class="g-row g-row--sub' + (p.max != null && p.got >= p.max ? ' is-got' : '') + '"><span>' + esc(p.opt || p.name) + '</span><b>' + p.got + (p.max != null ? '/' + p.max : '') + '</b></p>');
    });
    $('[data-gd-rows]', app).innerHTML = '<h4>Your marks</h4>' + rows.join('');
  }
  // The point the clue is for: a name the question asks for first, then the plan's points in order.
  function chooseTarget(r) {
    var tg = D.target;
    if (tg && tg.head != null && !r.heads[tg.head].got && !D.skip['h' + tg.head]) return;
    if (tg && tg.srp && r.used[tg.srp.id] == null && !D.skip[tg.srp.id] && liveIds().indexOf(tg.srp.id) >= 0 && !partFull(r, tg.srp.id)) return;
    D.target = findTarget(r, false) || findTarget(r, true);
    D.level = 0;
  }
  function liveIds() { var ids = []; M.liveParts(D.e, D.pick).forEach(function (lp) { lp.srps.forEach(function (s) { if (ids.indexOf(s) < 0) ids.push(s); }); }); return ids; }
  function partFull(r, sid) {
    var live = M.liveParts(D.e, D.pick);
    for (var i = 0; i < live.length; i++) if (live[i].srps.indexOf(sid) >= 0) return r.parts[i].max != null && r.parts[i].got >= r.parts[i].max;
    return false;
  }
  function findTarget(r, ignoreSkip) {
    if (ignoreSkip) D.skip = {};
    if (r.srps >= r.need && r.heads.every(function (h) { return h.got; })) return null;
    for (var i = 0; i < r.heads.length; i++) if (!r.heads[i].got && !D.skip['h' + i]) return { head: i };
    if (r.srps >= r.need) return null;
    var live = M.liveParts(D.e, D.pick);
    for (var p = 0; p < live.length; p++) {
      if (r.parts[p].max != null && r.parts[p].got >= r.parts[p].max) continue;
      for (var j = 0; j < live[p].srps.length; j++) {
        var s = G.srp[live[p].srps[j]];
        if (s && r.used[s.id] == null && !D.skip[s.id]) return { srp: s };
      }
    }
    return null;
  }
  function targetClue() {
    var tg = D.target;
    if (!tg) return null;
    if (tg.head != null) {
      var h = D.e.head[tg.head], live = M.liveParts(D.e, D.pick);
      var say = h.say, w = h.any ? h.any.map(function (x) { return x.n; }).join(' · ') : '';
      if (h.pick != null) {
        var lp = live.filter(function (x) { return x.part.id === h.pick; })[0];
        if (lp && lp.opt) { say = lp.opt.say || ('The ' + lp.opt.name.toLowerCase() + ' is the one I am writing about.'); w = lp.opt.name; }
      } else if (!w && h.k) w = h.k.map(function (g) { return g[0]; }).join(' · ');
      var what = h.label.replace(/\s+(named|identified|stated|given)$/i, '');
      return { q: (what !== h.label ? 'Name the ' + what.charAt(0).toLowerCase() + what.slice(1) : h.label) + ' (' + (h.marks || 2) + ' marks).', w: w, t: say };
    }
    return { q: tg.srp.c[0], w: tg.srp.c[1], t: tg.srp.t };
  }
  function paintClue() {
    var el = $('[data-gd-clue]', app), c = targetClue();
    if (!c) {
      el.innerHTML = '<div class="ebd-tile"><b style="background:#58CC02">✓</b><div><h3>' + (D.r.marks >= D.r.max ? 'Full marks' : 'Every point used') + '</h3><p>' +
        (D.r.marks >= D.r.max ? 'Read it through once, then try another question.' : 'That\'s every point this answer can use.') + '</p></div></div>';
      return;
    }
    el.innerHTML = '<div class="ebd-tile"><b style="background:' + esc(D.t.colour) + '">?</b><div><h3>Next point</h3><p class="g-clue">' + esc(c.q) + '</p></div></div>' +
      (D.level >= 1 && c.w ? keyBoxes(c.w) : '') +
      (D.level >= 2 ? '<p class="g-model">' + esc(c.t) + '</p><p class="ebd-small">Now write it yourself, in your own words.</p>' : '') +
      (D.level < 2 ? '<button type="button" class="eng-btn ebd-wide" data-gd-more>' + (D.level === 0 && c.w ? 'Key words' : 'Show me') + '</button>' : '') +
      '<button type="button" class="eng-btn eng-btn--quiet ebd-wide g-skip" data-gd-skip>Skip this one</button>';
  }
  function paintPlan(r) {
    var live = M.liveParts(D.e, D.pick), multi = live.length > 1;
    $('[data-gd-plan]', app).innerHTML = live.map(function (lp, pi) {
      return (multi ? '<li class="g-plan__h">' + esc(lp.opt ? lp.opt.name : lp.part.name) + (r.parts[pi].max != null ? ' · up to ' + r.parts[pi].max : '') + '</li>' : '') +
        lp.srps.map(function (sid) {
          var s = G.srp[sid];
          if (!s) return '';
          var got = r.used[sid] != null, on = D.target && D.target.srp === s;
          return '<li><button type="button" class="g-plan__i' + (got ? ' is-got' : '') + (on ? ' is-on' : '') + '" data-gd-aim="' + esc(sid) + '"' + (got ? ' disabled' : '') + '>' + esc(s.a) + '</button></li>';
        }).join('');
    }).join('');
  }
  // What the examiner says: about the sentence you've just finished (or the one you're in, or one you tapped in the margin).
  function sayFor(s) {
    if (s.srp) return ['happy', 'That\'s a point: ' + s.srp.a + '. +2' + (s.heads.length ? ', and ' + s.heads.join(' and ').toLowerCase() + ' +' + s.heads.length * 2 : '') + '.'];
    if (s.heads && s.heads.length) return ['happy', s.heads.join(' and ') + ': +' + s.heads.length * 2 + '.'];
    if (s.note === 'vague') return ['ok', 'Nearly, but too vague to score. ' + (s.near ? s.near.c[0] : 'Say exactly what happens and why.')];
    if (s.note === 'repeat') return ['angry', 'You\'ve made that point already' + (s.near ? ' (' + s.near.a + ')' : '') + '. A point only scores once.'];
    if (s.note === 'off') return ['ok', 'True, but that\'s ' + (s.other ? '"' + s.other.a + '"' : 'another topic') + ', which this question doesn\'t ask for.'];
    if (s.note === 'short') return ['ok', 'Too short to be a point. Write the whole sentence.'];
    return ['ok', 'No point in that sentence yet. One fact a sentence: what happens, and why.'];
  }
  function paintSay() {
    var r = D.r, ss = r.sentences, s = null;
    if (D.sel >= 0 && ss[D.sel]) s = ss[D.sel];
    else for (var i = ss.length - 1; i >= 0; i--) if (ss[i].start <= D.caret && ss[i].complete) { s = ss[i]; break; }
    var out;
    if (r.marks >= r.max) out = ['happy', 'Full marks: ' + r.marks + ' out of ' + r.max + '.'];
    else if (s) out = sayFor(s);
    else if (!D.text.trim()) out = ['ok', 'One point a sentence. The clue below is for your first one.'];
    else out = ['ok', 'Finish the sentence and I\'ll mark it.'];
    var face = $('[data-gd-face]', app), say = $('[data-gd-say]', app);
    if (face) face.setAttribute('data-mood', out[0]);
    // on a phone or tablet the coach is under the paper, so a strip under the top bar says the same and the next clue
    var mini = $('[data-gd-mini]', app), next = $('[data-gd-mini-next]', app), c = targetClue();
    if (mini) mini.textContent = out[1];
    if (next) next.textContent = c ? 'Next: ' + c.q : '';
    if (say && say.textContent !== out[1]) {
      say.textContent = out[1];
      say.style.animation = 'none'; void say.offsetWidth; say.style.animation = '';
    }
  }

  // =====================================================================================================
  // ---------- build your points (the bank) ----------
  // One point at a time: its clue; three versions of it (the one that scores, a vague one, a wrong one) as paper slips
  // to pick from; then the versions go and you write it yourself. Once your sentence earns the point it can go in your
  // bank, in your own words, and you see every past essay it scores in.
  // =====================================================================================================
  var L = null;
  function renderLearn(tid, sid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Build your points']]);
    var b = bank(tid), i = 0;
    if (sid) i = Math.max(0, t.srps.findIndex(function (s) { return s.id === sid; }));
    else { i = t.srps.findIndex(function (s) { return !b[s.id]; }); if (i < 0) i = 0; }
    L = { t: t, i: i, stage: 'pick', order: null, wrong: {}, level: 0, anim: true };
    app.innerHTML = '<div class="g-one">' + title('Build your points') + '<div data-gl></div></div>';
    paintLearn();
  }
  function headLine(t, left, right, pct) {
    return '<div class="g-top"><span>' + left + '</span><span>' + right + '</span>' + (pct != null ? '<span class="g-track"><i style="width:' + pct + '%"></i></span>' : '') + '</div>';
  }
  // the examiner's bubble; it pops up only when what he says is new
  var lastLine = '';
  function coachLine(say) {
    var still = say === lastLine; lastLine = say;
    return '<div class="ebd-face g-face"><span>' + (TEACH ? TEACH.head() : '') + '</span><p' + (still ? ' style="animation:none"' : '') + '>' + esc(say) + '</p></div>';
  }
  function paintLearn() {
    var t = L.t, s = t.srps[L.i], b = bank(t.id), n = t.srps.length, have = bankCount(t.id);
    if (!L.order) L.order = shuffle([['t', s.t], ['v', s.v], ['w', s.w]]);
    var h = headLine(t, 'Point ' + (L.i + 1) + ' of ' + n, '<b>' + have + '</b> in your bank', Math.round(100 * have / n));
    h += '<section class="eng-card g-card' + (L.anim ? ' rise' : '') + '" style="--c:' + esc(t.colour) + '"><span class="eng-bar"></span><h3 class="g-q">' + esc(s.c[0]) + '</h3>';
    if (L.stage === 'pick') {
      h += coachLine('Which one gets the 2 marks?') + '<div class="ebd-slips g-opts">' + L.order.map(function (o) {
        var bad = L.wrong[o[0]];
        return '<button type="button" class="ebd-slip g-opt' + (bad ? ' is-bad' : '') + '" style="--c:' + (bad ? '#E5534B' : esc(t.colour)) + '" data-gl-pick="' + o[0] + '"' + (bad ? ' disabled' : '') + '><span class="ebd-slip__t">' + esc(o[1]) + '</span>' +
          (bad ? '<span class="g-why">' + esc(o[0] === 'v' ? 'Too vague: it names the idea but doesn\'t give the fact.' : s.why) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    } else if (L.stage === 'write') {
      h += coachLine('Now write it yourself.') + (L.level >= 1 ? keyBoxes(s.c[1]) : '') +
        '<textarea class="g-ta" rows="3" aria-label="Your point" spellcheck="true" autocapitalize="sentences" placeholder="One sentence."></textarea>' +
        '<p class="g-check" data-gl-check aria-live="polite"></p>' +
        '<p class="g-row2">' + (L.level < 1 ? '<button type="button" class="eng-btn eng-btn--quiet" data-gl-more>Key words</button>' : '') +
        '<button type="button" class="eng-btn" data-gl-keep disabled>Put it in my bank</button></p>';
    } else {
      var papers = srpPapers(s);
      h += coachLine('That\'s it in your bank: ' + s.a + '.') + '<p class="g-mine">' + esc(b[s.id] || '') + '</p>' +
        (papers.length ? '<h4 class="g-h4">It scores in ' + plural(papers.length, 'past essay') + '</h4><div class="eng-filter">' + papers.map(function (it) {
          return '<a class="eng-chip" href="#w/' + it.a.essay + '/' + it.ref + '">' + esc(qLabel(it)) + '</a>';
        }).join('') + '</div>' : '');
    }
    h += '</section><div class="eb-nav"><button type="button" class="eng-btn eng-btn--quiet" data-gl-go="-1"' + (L.i ? '' : ' disabled') + '>‹ Back</button>' +
      '<button type="button" class="eng-btn' + (L.stage === 'done' ? '' : ' eng-btn--quiet') + '" data-gl-go="1">' + (L.stage === 'done' ? 'Next point' : 'Skip') + ' ›</button></div>';
    $('[data-gl]', app).innerHTML = h;
    L.anim = false;
    var ta = $('.g-ta', app);
    if (ta) { ta.value = L.draft || ''; ta.focus(); checkLearn(); }
  }
  function checkLearn() {
    var ta = $('.g-ta', app), s = L.t.srps[L.i], v = ta.value, out = $('[data-gl-check]', app), keep = $('[data-gl-keep]', app);
    L.draft = v;
    var norm = M.normalise(v, rules(L.t)), tok = norm.trim().split(' ');
    var ok = words(v) >= 5 && M.hits(v, s, rules(L.t));
    var cancel = s.n && M.allHit(s.k, norm, tok) && s.n.some(function (x) { return M.stemHit(x, norm, tok); });
    keep.disabled = !ok;
    out.className = 'g-check' + (ok ? ' is-ok' : cancel ? ' is-bad' : '');
    if (ok) out.textContent = 'That\'s the point.';
    else if (cancel) out.textContent = 'Careful: ' + s.why;
    else if (words(v) >= 5 && M.groups(s.k, norm, tok)[0]) out.textContent = 'Nearly. Say the fact, not just the idea.';
    else out.textContent = '';
  }
  function learnGo(d) {
    var n = L.t.srps.length;
    L.i = (L.i + d + n) % n;
    L.stage = 'pick'; L.order = null; L.wrong = {}; L.level = 0; L.draft = ''; L.anim = true;
    paintLearn();
  }

  // ---------- your bank vs the papers ----------
  function renderBank(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Your bank']]);
    var b = bank(tid), mine = t.srps.filter(function (s) { return b[s.id]; });
    var h = title('Your bank', '<a class="eng-btn" href="#learn/' + tid + '">Build your points</a>') +
      '<p class="eng-p">' + (mine.length ? 'Your points in your own words, and how far they get you in every past essay on ' + esc(t.name.toLowerCase()) + '.' : 'Nothing in it yet. Build your points and they go in here, in your own words.') + '</p>';
    h += '<h2 class="eng-h2">Against the papers</h2><div class="eng-grid eng-grid--2">' + t.essays.map(function (e) {
      var best = bankScore(e, b), asked = BY_ESSAY[e.id] || [];
      return '<a class="eng-card eng-part rise" style="--c:' + esc(t.colour) + '" href="#w/' + e.id + '"><span class="eng-bar"></span><span class="eng-part__m">' + (asked.length ? 'Asked ' + asked.map(function (it) { return it.q.year; }).join(', ') : '') + '</span><h3>' + esc(e.name) + '</h3>' +
        '<p><b class="g-big">' + best.srps + '</b> of ' + e.need + ' points ready' + (best.opt ? ' (' + esc(best.opt) + ')' : '') + '</p><span class="g-track"><i style="width:' + Math.round(100 * best.srps / e.need) + '%"></i></span></a>';
    }).join('') + '</div>';
    if (mine.length) {
      h += '<h2 class="eng-h2">Your points</h2><div class="eng-grid eng-grid--2">' + mine.map(function (s) {
        return '<div class="eng-card g-bank"><span class="eng-part__m">' + plural(srpPapers(s).length, 'past essay') + '</span><h3>' + esc(s.a) + '</h3><p class="g-mine">' + esc(b[s.id]) + '</p>' +
          '<a class="eng-btn eng-btn--quiet" href="#learn/' + tid + '/' + esc(s.id) + '">Write it again</a></div>';
      }).join('') + '</div>';
    }
    app.innerHTML = h;
  }
  // Your bank's sentences as one answer, marked on the essay for each option: the SRPs part, without the named marks.
  function bankScore(e, b) {
    var text = Object.keys(b).filter(function (id) { return G.srp[id]; }).map(function (id) { var x = b[id].trim(); return /[.!?]$/.test(x) ? x : x + '.'; }).join(' ');
    var optParts = (e.parts || []).filter(function (p) { return p.opts && p.opts.length; }), picks = [{}];
    optParts.forEach(function (p) { p.opts.forEach(function (o) {
      var pick = {}; pick[p.id] = o.id;
      optParts.forEach(function (q) { if (q === p) return; var free = q.opts.filter(function (x) { return Object.keys(pick).map(function (k) { return pick[k]; }).indexOf(x.id) < 0; })[0]; if (free) pick[q.id] = free.id; });
      picks.push(pick);
    }); });
    var best = { srps: 0, opt: null };
    picks.forEach(function (pick) {
      var r = M.mark(e, text, pick);
      if (r.srps > best.srps) best = { srps: r.srps, opt: optParts.length ? r.parts.filter(function (p) { return p.opt; }).map(function (p) { return p.opt; }).join(' + ') : null };
    });
    return best;
  }

  // ---------- game: real, vague or wrong ----------
  var RV = null;
  function renderReal(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Real, vague or wrong?']]);
    var picks = shuffle(t.srps).slice(0, 10).map(function (s) { return { s: s, k: ['t', 'v', 'w'][Math.floor(Math.random() * 3)] }; });
    RV = { t: t, list: picks, i: 0, right: 0, answered: null, anim: true };
    app.innerHTML = '<div class="g-one">' + title('Real, vague or wrong?') + '<div data-gg></div></div>';
    paintReal();
  }
  function paintReal() {
    var x = RV.list[RV.i], el = $('[data-gg]', app), t = RV.t;
    var h = '';
    if (!x) {
      el.innerHTML = h + '<section class="eng-card g-card rise" style="--c:' + esc(t.colour) + '"><span class="eng-bar"></span><p class="g-score"><b>' + RV.right + '</b> of ' + RV.list.length + '</p>' +
        coachLine(RV.right === RV.list.length ? 'Every one right.' : RV.right >= 7 ? 'Good. The ones you missed are worth learning.' : 'Build your points first, then try again.') +
        '<p class="g-row2"><button type="button" class="eng-btn" data-gg-again>Again</button><a class="eng-btn eng-btn--quiet" href="#learn/' + t.id + '">Build your points</a></p></section>';
      return;
    }
    var text = x.k === 't' ? x.s.t : x.k === 'v' ? x.s.v : x.s.w, a = RV.answered;
    h += headLine(t, (RV.i + 1) + ' of ' + RV.list.length, '<b>' + RV.right + '</b> right') +
      '<section class="eng-card g-card' + (RV.anim ? ' rise' : '') + '" style="--c:' + esc(t.colour) + '"><span class="eng-bar"></span><p class="g-sent">' + esc(text) + '</p><div class="g-btns">' +
      [['t', 'Gets the marks'], ['v', 'Too vague'], ['w', 'Wrong']].map(function (o) {
        var c = a ? (o[0] === x.k ? ' is-right' : o[0] === a ? ' is-bad' : '') : '';
        return '<button type="button" class="eng-btn eng-btn--quiet g-ans' + c + '" data-gg-a="' + o[0] + '"' + (a ? ' disabled' : '') + '>' + o[1] + '</button>';
      }).join('') + '</div>';
    if (a) h += coachLine((a === x.k ? 'Yes. ' : 'No. ') + (x.k === 't' ? 'That\'s the point: ' + x.s.a + '.' : x.k === 'v' ? 'Too vague. The point is: ' + x.s.t : x.s.why)) +
      '<p class="g-row2"><button type="button" class="eng-btn" data-gg-next>Next</button></p>';
    el.innerHTML = h + '</section>';
    RV.anim = false;
  }

  // ---------- game: where does it score? ----------
  var WS = null;
  function renderWhere(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Where does it score?']]);
    var b = bank(tid);
    var pool = t.srps.filter(function (s) { return srpPapers(s).length; });
    var mine = pool.filter(function (s) { return b[s.id]; });
    WS = { t: t, pool: shuffle(mine.length >= 3 ? mine : pool), i: 0, right: 0, rounds: 0, on: {}, done: false };
    app.innerHTML = '<div class="g-one">' + title('Where does it score?') + '<div data-gg></div></div>';
    nextWhere(true);
  }
  function nextWhere(first) {
    if (!first) WS.i++;
    var s = WS.pool[WS.i % WS.pool.length];
    if (!s) { $('[data-gg]', app).innerHTML = '<p class="eng-p">No points to play with yet.</p>'; return; }
    var yes = srpPapers(s), seen = {}, yesRefs = yes.map(function (it) { return it.ref; });
    // up to 3 where it scores, and 3 where it doesn't: this topic's other essays first, then the rest of Geography
    var pickYes = shuffle(yes).filter(function (it) { if (seen[it.a.essay]) return false; seen[it.a.essay] = 1; return true; }).slice(0, 3);
    var noPool = shuffle(topicPapers(WS.t.id).filter(function (it) { return yesRefs.indexOf(it.ref) < 0 && (s.essays || []).indexOf(it.a.essay) < 0; }));
    if (noPool.length < 3) noPool = noPool.concat(shuffle(Object.keys(REF).map(function (k) { return REF[k]; }).filter(function (it) { return G.essay[it.a.essay] && (s.essays || []).indexOf(it.a.essay) < 0; })));
    var seenNo = {}, pickNo = noPool.filter(function (it) { if (seenNo[it.a.essay]) return false; seenNo[it.a.essay] = 1; return true; }).slice(0, 3);
    WS.s = s; WS.opts = shuffle(pickYes.concat(pickNo)); WS.on = {}; WS.done = false; WS.anim = true;
    paintWhere();
  }
  function paintWhere() {
    var s = WS.s, b = bank(WS.t.id), el = $('[data-gg]', app), t = WS.t;
    var h = headLine(t, 'Round ' + (WS.rounds + (WS.done ? 0 : 1)), '<b>' + WS.right + '</b> right') +
      '<section class="eng-card g-card' + (WS.anim ? ' rise' : '') + '" style="--c:' + esc(t.colour) + '"><span class="eng-bar"></span><span class="eng-part__m">' + (b[s.id] ? 'Your point' : 'The point') + '</span><p class="g-sent">' + esc(b[s.id] || s.t) + '</p>' +
      coachLine(WS.done ? (WS.lastOk ? 'All right. ' : 'Not quite. ') + 'This point scores in ' + plural(srpPapers(s).length, 'past essay') + ' altogether.' : 'Tap every question this point scores in.') +
      '<div class="ebd-slips g-qs">' + WS.opts.map(function (it, i) {
        var e = G.essay[it.a.essay], tt = e && G.topic[e.topic], yes = (s.essays || []).indexOf(it.a.essay) >= 0, on = WS.on[i];
        var c = WS.done ? (yes && on ? ' is-right' : yes ? ' is-missed' : on ? ' is-bad' : '') : (on ? ' is-on' : '');
        return '<button type="button" class="ebd-slip g-q' + c + '" style="--c:' + esc(tt ? tt.colour : '#93A5AE') + '" data-gw="' + i + '" aria-pressed="' + !!on + '"' + (WS.done ? ' disabled' : '') + '><span class="ebd-slip__y">' + it.q.year + '</span><span class="ebd-slip__m">' + esc(it.q.rev ? '' : it.q.id + (it.a.label ? ' ' + it.a.label : '')) + '</span><span class="ebd-slip__t">' + esc(questionText(it)) + '</span></button>';
      }).join('') + '</div>' +
      '<p class="g-row2">' + (WS.done ? '<button type="button" class="eng-btn" data-gw-next>Next point</button>' : '<button type="button" class="eng-btn" data-gw-check>Check</button>') + '</p>';
    el.innerHTML = h + '</section>';
    WS.anim = false;
  }

  // ---------- routing and events ----------
  function route() {
    var parts = location.hash.replace(/^#/, '').split('/');
    var k = parts[0];
    D = L = RV = WS = null;
    closeMedia();
    if (k === 't') renderTopic(parts[1]);
    else if (k === 'w') renderDesk(parts[1], parts[2]);
    else if (k === 'learn') renderLearn(parts[1], parts[2]);
    else if (k === 'bank') renderBank(parts[1]);
    else if (k === 'play' && parts[1] === 'real') renderReal(parts[2]);
    else if (k === 'play' && parts[1] === 'where') renderWhere(parts[2]);
    else if (k === 'papers') renderPapers();
    else renderHub();
  }
  window.addEventListener('hashchange', route);

  document.addEventListener('click', function (ev) {
    var t = ev.target, b;
    if (t.closest('[data-sh-menu]')) { menu(!document.body.classList.contains('sh-open')); return; }
    if (document.body.classList.contains('sh-open') && (t.closest('.sh-link') || !t.closest('.sh-side'))) menu(false);
    if ((b = t.closest('[data-g-media]'))) { openMedia(b.getAttribute('data-g-media'), b); return; }
    if (VIEW && (t.closest('[data-g-close]') || t === VIEW.el)) { closeMedia(); return; }
    if ((b = t.closest('[data-g-filter]'))) { paperFilter = b.getAttribute('data-g-filter'); renderPapers(); return; }
    // the desk
    if (D) {
      if ((b = t.closest('[data-gd-pick]'))) {
        if (b.disabled) return;
        D.pick[b.getAttribute('data-gd-pick')] = b.getAttribute('data-opt'); D.target = null; D.sel = -1; D.chosen = true;
        paintPicks(); paintMedia(); update(); return;
      }
      if ((b = t.closest('[data-gd-more]'))) { D.level++; paintClue(); return; }
      if ((b = t.closest('[data-gd-skip]'))) {
        var tg = D.target; if (tg) D.skip[tg.head != null ? 'h' + tg.head : tg.srp.id] = 1;
        D.target = null; chooseTarget(D.r); paintClue(); paintPlan(D.r); return;
      }
      if ((b = t.closest('[data-gd-aim]'))) { D.target = { srp: G.srp[b.getAttribute('data-gd-aim')] }; D.level = 0; paintClue(); paintPlan(D.r); return; }
      if ((b = t.closest('[data-gd-s]'))) { D.sel = +b.getAttribute('data-gd-s'); paintMirror(D.r); paintSay(); return; }
      if ((b = t.closest('[data-gd-clear]'))) {
        if (D.text.trim() && !window.confirm('Clear this answer and start again?')) return;
        D.text = ''; D.ta.value = ''; D.sel = -1; D.skip = {}; D.target = null; grow(); update(); D.ta.focus(); return;
      }
    }
    // build your points
    if (L) {
      if ((b = t.closest('[data-gl-pick]'))) {
        var k = b.getAttribute('data-gl-pick');
        if (k === 't') { L.stage = 'write'; L.draft = ''; } else L.wrong[k] = 1;
        paintLearn(); return;
      }
      if ((b = t.closest('[data-gl-more]'))) { L.level = 1; paintLearn(); return; }
      if ((b = t.closest('[data-gl-keep]'))) {
        var ta = $('.g-ta', app), bk = bank(L.t.id);
        bk[L.t.srps[L.i].id] = ta.value.trim().replace(/\s+/g, ' ');
        save('geo-bank-' + L.t.id, bk);
        L.stage = 'done'; paintLearn(); return;
      }
      if ((b = t.closest('[data-gl-go]'))) { learnGo(+b.getAttribute('data-gl-go')); return; }
    }
    if (RV && t.closest('[data-gg]')) {
      if ((b = t.closest('[data-gg-a]'))) { var x = RV.list[RV.i]; RV.answered = b.getAttribute('data-gg-a'); if (RV.answered === x.k) RV.right++; paintReal(); return; }
      if (t.closest('[data-gg-next]')) { RV.i++; RV.answered = null; RV.anim = true; paintReal(); return; }
      if (t.closest('[data-gg-again]')) { renderReal(RV.t.id); return; }
    }
    if (WS && t.closest('[data-gg]')) {
      if ((b = t.closest('[data-gw]'))) { var i = +b.getAttribute('data-gw'); WS.on[i] = !WS.on[i]; paintWhere(); return; }
      if (t.closest('[data-gw-check]')) {
        var s = WS.s, ok = WS.opts.every(function (it, i) { return !!WS.on[i] === ((s.essays || []).indexOf(it.a.essay) >= 0); });
        WS.done = true; WS.lastOk = ok; WS.rounds++; if (ok) WS.right++; paintWhere(); return;
      }
      if (t.closest('[data-gw-next]')) { nextWhere(false); return; }
    }
  });
  document.addEventListener('input', function (ev) {
    if (D && ev.target === D.ta) {
      D.text = D.ta.value; D.caret = D.ta.selectionStart; D.sel = -1;
      grow(); update();
    } else if (L && ev.target.classList.contains('g-ta')) checkLearn();
  });
  ['click', 'keyup', 'focus'].forEach(function (k) {
    document.addEventListener(k, function (ev) {
      if (!D || ev.target !== D.ta) return;
      var c = D.ta.selectionStart;
      if (c !== D.caret || D.sel >= 0) { D.caret = c; if (D.sel >= 0) { D.sel = -1; paintMirror(D.r); } paintSay(); }
    }, true);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && VIEW) { closeMedia(); return; }
    if (ev.key === 'Escape' && document.body.classList.contains('sh-open')) menu(false);
    // the page's text can't be selected (only what's in your own boxes): Ctrl+A outside a box does nothing
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'a' || ev.key === 'A')) {
      var a = document.activeElement;
      if (!a || !/^(TEXTAREA|INPUT)$/.test(a.tagName)) ev.preventDefault();
    }
  });
  window.addEventListener('resize', function () { if (D) { grow(); paintMirror(D.r); } });
  route();
})();

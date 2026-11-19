// geography.html: Leaving Cert Higher Level Geography essays, learned the way the English essays are: a clue, you write
// the point, the marker corrects it as you go. Every point is an SRP from a topic's bank (geo/data/*.js), every essay
// type is modelled on its marking scheme, and every past essay from 2006 to 2025 is in geo/papers.js.
// Pages (the hash): ""            all of Geography
//                   t/<topic>     a topic: its essay types, its games, its past questions
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
  function keyBoxes(c1) { return '<span class="g-words">' + String(c1 || '').split(' · ').map(function (w) { return '<span class="g-word">' + esc(w) + '</span>'; }).join('') + '</span>'; }
  function head(mood) { return '<span class="g-head" data-mood="' + (mood || 'ok') + '">' + (TEACH ? TEACH.head() : '') + '</span>'; }
  function tag(t) { return '<span class="g-dot" style="--c:' + esc(t.colour || '#93A5AE') + '" aria-hidden="true"></span>'; }
  function rules(t) { return (t && t.normalise) || []; }

  // ---------- the shell: top bar with the menu (no sidebar, as on the English pages) ----------
  var SUBJECTS = '<a href="geography.html" aria-current="page">Geography</a><a href="biology.html">Biology</a><a href="english.html">English</a><a href="irish.html">Irish</a><a href="german.html">German</a>';
  function link(href, label, active, extra) {
    return '<a class="sh-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + (extra || '') + '<span class="sh-t">' + esc(label) + '</span></a>';
  }
  // The strip across the top (as on English's Compare it): the menu, the subject, the examiner with his note in red pen
  // and, on the desk, the marks. Each page says where Back goes (the last crumb with a link, else all of Geography).
  var BACK = null;
  function shell(active, crumbs, say) {
    document.body.classList.remove('sh-open');
    var nav = link('#', 'All of Geography', active === 'hub') + link('#papers', 'Every past question', active === 'papers');
    GROUPS.forEach(function (g) {
      var ts = topicsIn(g);
      if (!ts.length) return;
      nav += '<p class="sh-group">' + esc(g.name) + '</p>' + ts.map(function (t) {
        return link('#t/' + t.id, t.name, active === 't/' + t.id, '<span class="sh-n" aria-hidden="true">' + tag(t) + '</span>');
      }).join('');
    });
    nav += '<p class="sh-group">On the exam paper</p>' + link('Geography%20Questions.dc.html', '2024 Question 3 on the desk', false);
    side.innerHTML = '<nav class="sh-nav" aria-label="Geography">' + nav + '</nav>';
    BACK = null;
    (crumbs || []).forEach(function (c) { if (c[1]) BACK = c; });
    if (!BACK && crumbs && crumbs.length) BACK = ['Geography', '#'];
    bar.innerHTML = '<div class="gx"><button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="geo-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<details class="gx-drop"><summary>Geography</summary><nav class="gx-sheet" aria-label="Subject">' + SUBJECTS + '</nav></details>' +
      '<div class="gx-ex"><span class="gx-ex__fig" aria-hidden="true">' + (TEACH ? TEACH.head() : '') + '</span><p class="gx-ex__say" aria-live="polite"><span data-gx-say>' + esc(say || '') + '</span><span class="gx-ex__next" data-gx-next></span></p></div>' +
      '<div class="gx-right" data-gx-right></div></div>';
    document.documentElement.style.setProperty('--gx-h', bar.offsetHeight + 'px');
    window.scrollTo(0, 0);
  }
  function setSay(text, next) {
    var a = bar.querySelector('[data-gx-say]'), b = bar.querySelector('[data-gx-next]');
    if (a) a.textContent = text;
    if (b) b.textContent = next ? 'Next: ' + next : '';
  }
  function backLink() { return BACK ? '<a class="g-back" href="' + BACK[1] + '">‹ ' + esc(BACK[0]) + '</a>' : ''; }
  function menu(open) {
    document.body.classList.toggle('sh-open', open);
    var b = bar.querySelector('[data-sh-menu]');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function title(h, sub, extra) { return '<div class="g-title rise">' + backLink() + '<h1 class="g-h1">' + esc(h) + '</h1>' + (sub ? '<p class="g-lead">' + esc(sub) + '</p>' : '') + (extra || '') + '</div>'; }

  // ---------- all of Geography ----------
  function renderHub() {
    shell('hub', null, 'Pick a topic. Learn its points, then write the essay.');
    var nQ = P.length, nS = G.topics.reduce(function (a, t) { return a + t.srps.length; }, 0);
    var h = title('Geography', 'Higher Level: every essay on physical geography from 2006 to 2026, and colonialism. Learn the points, then write the essays and get them marked as you go.',
      '<p class="g-strip"><a href="#papers"><b>' + nQ + '</b> past essays</a><span><b>' + nS + '</b> points to learn</span><span><b>' + G.topics.reduce(function (a, t) { return a + bankCount(t.id); }, 0) + '</b> in your bank</span></p>');
    GROUPS.forEach(function (g, gi) {
      var ts = topicsIn(g);
      if (!ts.length) return;
      h += '<h2 class="g-h2 rise" style="--i:' + (gi + 2) + '">' + esc(g.name) + '</h2><div class="g-topics">' + ts.map(function (t, i) { return topicCard(t, gi * 3 + i + 2); }).join('') + '</div>';
    });
    h += '<h2 class="g-h2 rise">Games</h2><div class="g-games rise">' +
      '<a class="g-card g-game" href="geo-golf.html"><b>Mini Golf</b><span>Ten holes against the examiner, from the rift and the volcano to the spit and the fault. A question before every putt.</span></a>' +
      '<a class="g-card g-game" href="geo-pool.html"><b>Pool</b><span>Pot your four, then the black. A question from all of Geography before every shot.</span></a>' +
      '<a class="g-card g-game" href="#papers"><b>Every past question</b><span>Pick any one and write it on the desk.</span></a></div>';
    app.innerHTML = h;
  }
  function topicCard(t, i) {
    var n = t.srps.length, have = bankCount(t.id), asked = topicPapers(t.id).length;
    // its photo, or (until one comes) its first diagram, shown whole on white
    var ph = photoOf(t.id), fig = !ph && (MEDIA.figs || []).filter(function (m) { return m.topic === t.id; })[0];
    if (fig) ph = { file: fig.file };
    return '<a class="g-card g-topic rise" style="--c:' + esc(t.colour) + ';--i:' + i + '" href="#t/' + t.id + '">' + (ph ? '<span class="g-topic__img' + (fig ? ' is-fig' : '') + '"><img src="' + esc(ph.file) + '" alt="" loading="lazy"></span>' : '') +
      '<span class="g-topic__body"><span class="g-topic__name">' + tag(t) + esc(t.name) + '</span>' +
      '<span class="g-topic__blurb">' + esc(t.blurb || '') + '</span>' +
      '<span class="g-topic__facts"><span>' + asked + ' past essay' + (asked === 1 ? '' : 's') + '</span><span>' + n + ' points</span></span>' +
      '<span class="g-bar" aria-label="' + have + ' of ' + n + ' points in your bank"><i style="width:' + (n ? Math.round(100 * have / n) : 0) + '%"></i></span></span></a>';
  }

  // ---------- a topic ----------
  function renderTopic(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name]], 'Build your points first, then write an essay.');
    var have = bankCount(tid), n = t.srps.length, papers = topicPapers(tid), media = mediaOf(tid, null);
    var h = title(t.name, t.blurb), ph = photoOf(tid);
    if (ph) h += '<img class="g-hero rise" src="' + esc(ph.file) + '" alt="' + esc(ph.caption) + '"><p class="g-hero__c">' + esc(ph.caption) + '. Photo: ' + esc(ph.credit || 'Wikimedia Commons') + (ph.licence ? ', ' + esc(ph.licence) : '') + '.</p>';
    h += '<a class="g-card g-learn rise" style="--c:' + esc(t.colour) + ';--i:1" href="#learn/' + tid + '"><span class="g-learn__t">Build your points</span>' +
      '<span class="g-learn__p">A clue, you pick the version that scores, then you write it yourself. Every point you get goes into your bank.</span>' +
      '<span class="g-learn__n"><b>' + have + '</b> of ' + n + ' in your bank</span><span class="g-bar"><i style="width:' + (n ? Math.round(100 * have / n) : 0) + '%"></i></span></a>';
    h += '<h2 class="g-h2 rise" style="--i:2">The essays</h2><div class="g-essays">' + t.essays.map(function (e, i) { return essayCard(e, i + 3); }).join('') + '</div>';
    if (media.length) h += '<h2 class="g-h2 rise" style="--i:3">Diagrams, photos and videos</h2><div class="g-media rise" style="--i:4">' + media.map(mediaCard).join('') + '</div>';
    h += '<h2 class="g-h2 rise" style="--i:4">Games</h2><div class="g-games rise" style="--i:5">' +
      '<a class="g-card g-game" href="#play/real/' + tid + '"><b>Real, vague or wrong?</b><span>Ten sentences. Say which ones get the marks.</span></a>' +
      '<a class="g-card g-game" href="#play/where/' + tid + '"><b>Where does it score?</b><span>One point, many essays: find every past question it earns marks in.</span></a>' +
      '<a class="g-card g-game" href="#bank/' + tid + '"><b>Your bank vs the papers</b><span>How many marks your points get in every past essay.</span></a>' +
      '<a class="g-card g-game" href="#play/pic/' + tid + '"><b>Picture it</b><span>A diagram or a photo: name the landform, rock or process.</span></a>' +
      '<a class="g-card g-game" href="#play/fix/' + tid + '"><b>Fix it</b><span>A wrong sentence: rewrite it so it gets the 2 marks.</span></a>' +
      '<a class="g-card g-game" href="geo-golf.html"><b>Mini Golf</b><span>Ten holes against the examiner, from the rift to the fault. A question before every putt.</span></a>' +
      '<a class="g-card g-game" href="geo-pool.html"><b>Pool</b><span>Pot your balls against the examiner. A question before every shot.</span></a></div>';
    h += '<h2 class="g-h2 rise" style="--i:6">Past questions</h2>' + paperList(papers);
    app.innerHTML = h;
  }
  function essayCard(e, i) {
    var asked = BY_ESSAY[e.id] || [], opts = [];
    (e.parts || []).forEach(function (p) { (p.opts || []).forEach(function (o) { if (opts.indexOf(o.name) < 0) opts.push(o.name); }); });
    return '<a class="g-card g-essay rise" style="--i:' + i + '" href="#w/' + e.id + '"><span class="g-essay__name">' + esc(e.name) + '</span>' +
      '<span class="g-essay__ask">' + esc(e.ask) + '</span>' +
      (opts.length ? '<span class="g-essay__opts">' + opts.map(esc).join(' · ') + '</span>' : '') +
      '<span class="g-essay__years">' + (asked.length ? asked.map(function (it) { return '<span>' + it.q.year + '</span>'; }).join('') : '') + '</span>' +
      '<span class="g-essay__go">Write it</span></a>';
  }
  function paperList(items, showTopic) {
    return '<ol class="g-papers' + (showTopic ? ' has-topic' : '') + '">' + items.map(function (it) {
      var e = G.essay[it.a.essay], t = e && G.topic[e.topic];
      var text = (it.q.rev ? (e ? e.ask : it.q.title) : it.q.text).split('\n').filter(function (l) { return !/^(answer \(i\) or \(ii\)|or)\.?$/i.test(l.trim()); });
      if (it.a.label) {
        var lab = it.a.label, at = -1;
        text.forEach(function (l, i) { if (at < 0 && l.indexOf(lab) === 0) at = i; });
        if (at >= 0) { var rest = text.slice(at); var stop = rest.slice(1).findIndex(function (l) { return /^\(i+\)/.test(l); }); text = stop >= 0 ? rest.slice(0, stop + 1) : rest; }
      }
      return '<li><a class="g-paper" href="#w/' + (e ? e.id : '') + '/' + it.ref + '"><span class="g-paper__y">' + it.q.year + '</span>' +
        '<span class="g-paper__q">' + esc(it.q.rev ? '' : it.q.id + (it.a.label ? ' ' + it.a.label : '')) + '</span>' +
        '<span class="g-paper__t">' + esc(text.join(' ').replace(/^\(i+\)\s*/, '').replace(/\s+-\s+/g, ' – ').replace(/:\s+–\s+/g, ': ')) + '</span>' +
        (t && showTopic ? '<span class="g-paper__topic">' + tag(t) + esc(t.name) + '</span>' : '') + '</a></li>';
    }).join('') + '</ol>';
  }

  // ---------- every past question ----------
  var paperFilter = 'all';
  function renderPapers() {
    shell('papers', [['Every past question']], 'Every one opens on the writing desk.');
    var items = [];
    P.forEach(function (q) { (q.ask || []).forEach(function (a) { var it = REF[refOf(q, a)], e = G.essay[a.essay]; if (!e) return; if (paperFilter === 'all' || (groupOf(e.topic) || {}).id === paperFilter) items.push(it); }); });
    items.sort(function (x, y) { return y.q.year - x.q.year || (x.q.id < y.q.id ? -1 : x.q.id > y.q.id ? 1 : 0); });
    app.innerHTML = title('Every past question', 'Higher Level, 2006 to 2026: Section 1, Questions 1 to 3 (parts B and C, 30 marks), and every question on colonialism. 2026 is listed by topic from the exam reviews.') +
      '<div class="g-filter rise" style="--i:1">' + [['all', 'All']].concat(GROUPS.map(function (g) { return [g.id, g.name]; })).map(function (f) {
        return '<button type="button" class="g-chip" data-g-filter="' + f[0] + '" aria-pressed="' + (paperFilter === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div>' + paperList(items, true);
  }

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
    // on the desk: what shows the option you picked (the waterfall) comes before what only shares the essay (every
    // landform of erosion); diagrams first (the one to draw), then photos, then videos, at most three of each
    if (tags) {
      var opt = tags.slice(1), score = function (x) { return (x.m.tags || []).some(function (t) { return opt.indexOf(t) >= 0; }) ? 2 : 1; };
      var best = {};
      out.forEach(function (x) { best[x.kind] = Math.max(best[x.kind] || 0, score(x)); });
      // a picture of another landform is no help: with an option picked, only that option's pictures
      out = out.filter(function (x) { return score(x) === best[x.kind] && !(opt.length && score(x) === 1); });
      var n = {}; out = out.filter(function (x) { n[x.kind] = (n[x.kind] || 0) + 1; return n[x.kind] <= 3; });
    }
    return out;
  }
  // a topic's picture: its first photo (the registry lists the best one first)
  function photoOf(tid) { return (MEDIA.photos || []).filter(function (m) { return m.topic === tid; })[0] || null; }
  function deskTags() {
    var tags = [D.e.id];
    Object.keys(D.pick).forEach(function (k) { tags.push(D.pick[k]); });
    return tags;
  }
  var MID = {};
  function mediaCard(x) {
    var m = x.m, key = x.kind + ':' + (m.id || m.file);
    MID[key] = x;
    var img = x.kind === 'video' ? 'https://i.ytimg.com/vi/' + encodeURIComponent(m.id) + '/hqdefault.jpg' : m.file;
    var kind = x.kind === 'fig' ? 'Diagram to draw' : x.kind === 'photo' ? 'Photo' : 'Video' + (m.secs ? ' · ' + Math.max(1, Math.round(m.secs / 60)) + ' min' : '');
    return '<button type="button" class="g-card g-m g-m--' + x.kind + '" data-g-media="' + esc(key) + '"><span class="g-m__img"><img src="' + esc(img) + '" alt="" loading="lazy">' +
      (x.kind === 'video' ? '<span class="g-m__play" aria-hidden="true"></span>' : '') + '</span>' +
      '<span class="g-m__t">' + esc(m.name || m.caption || m.title) + '</span><span class="g-m__k">' + esc(kind) + '</span></button>';
  }
  // The pictures for one point (the user: "when writing points include diagrams and images from videos and images"):
  // the diagram, photo and video of the landform, process or option the point belongs to (else of its essays), one of each.
  var SRP_OPTS = null;
  function srpMedia(s) {
    if (!SRP_OPTS) {
      SRP_OPTS = {};
      Object.keys(G.essay).forEach(function (eid) { (G.essay[eid].parts || []).forEach(function (p) { (p.opts || []).forEach(function (o) {
        (o.srps || []).forEach(function (id) { (SRP_OPTS[id] = SRP_OPTS[id] || []).push(o.id); });
      }); }); });
    }
    var opts = SRP_OPTS[s.id] || [], ess = s.essays || [], out = [];
    MKINDS.forEach(function (k) {
      var best = null, bestSc = 0;
      (MEDIA[k[0]] || []).forEach(function (m) {
        var tg = m.tags || [], sc = tg.some(function (x) { return opts.indexOf(x) >= 0; }) ? 3 : tg.some(function (x) { return ess.indexOf(x) >= 0; }) ? 2 : 0;
        if (sc && m.topic !== s.topic) sc -= 0.5;
        if (sc > bestSc) { best = m; bestSc = sc; }
      });
      // a point of a landform (or process) shows only that landform's pictures, never another one's
      if (best && (!opts.length || bestSc >= 2.5)) out.push({ kind: k[1], m: best });
    });
    return out;
  }
  function pointPics(s) {
    var list = s ? srpMedia(s) : [];
    return list.length ? '<div class="g-pics">' + list.map(mediaCard).join('') + '</div>' : '';
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
    el.setAttribute('aria-label', m.name || m.caption || m.title || '');
    el.innerHTML = '<div class="g-view__box"><button type="button" class="g-view__x" data-g-close aria-label="Close">×</button><h2 class="g-view__t">' + esc(m.name || m.caption || m.title) + '</h2>' + body + '</div>';
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

  // =====================================================================================================
  // ---------- the writing desk ----------
  // You write the essay on the paper. Each sentence is marked once it is finished: a point (SRP, 2 marks) turns green
  // with +2 in the margin; a sentence that names what the question asks to name earns its marks; a vague one, a
  // repeat, or a point this question doesn't ask for is marked so in the margin. The examiner says why, and the clue
  // beside the paper is always for the next point you haven't made: a question, then its key words, then the point
  // itself to read (never to copy: it can't be selected or put in).
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
    shell('t/' + t.id, [[t.name, '#t/' + t.id], [pq ? qLabel(pq) : e.name]], '');
    var ask = pq ? questionText(pq) : e.ask;
    var max = (e.head || []).reduce(function (a, h) { return a + (h.marks || 2); }, 0) + 2 * e.need;
    var media = mediaOf(t.id, deskTags());
    var h = '<div class="gd">' + backLink() +
      '<section class="gd-q rise"><p class="gd-q__meta">' + (pq ? esc(qLabel(pq)) + ' · ' : '') + max + ' marks</p><p class="gd-q__t">' + esc(ask) + '</p>' +
      '<details class="gd-scheme"><summary>How it\'s marked</summary><ul>' + (e.notes || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') +
      '<li>' + esc(schemeLine(e)) + '</li></ul>' + (BY_ESSAY[e.id] && BY_ESSAY[e.id].length ? '<p class="gd-scheme__asked">Asked: ' + BY_ESSAY[e.id].map(function (it) { return '<a href="#w/' + e.id + '/' + it.ref + '">' + esc(qLabel(it)) + '</a>'; }).join('') + '</p>' : '') + '</details></section>' +
      (optParts.length ? '<section class="gd-picks rise" style="--i:1">' + optParts.map(function (p) {
        return '<div class="gd-pick"><p class="gd-pick__l">' + esc(p.pick || p.name) + '</p><div class="gd-chips">' + p.opts.map(function (o) {
          return '<button type="button" class="g-chip" data-gd-pick="' + esc(p.id) + '" data-opt="' + esc(o.id) + '">' + esc(o.name) + '</button>';
        }).join('') + '</div></div>';
      }).join('') + '</section>' : '') +
      '<div class="g-media g-media--strip rise" style="--i:1" data-gd-media>' + media.map(mediaCard).join('') + '</div>' +
      '<div class="gd-main">' +
      '<div class="gd-paper rise" style="--i:2"><div class="gd-sheet"><div class="gd-mirror" aria-hidden="true"></div>' +
      '<textarea class="gd-ta" aria-label="Your answer" spellcheck="true" autocapitalize="sentences" placeholder="Write your answer here, one point per sentence."></textarea>' +
      '<div class="gd-marks"></div></div>' +
      '<p class="gd-foot"><span data-gd-words></span><button type="button" class="g-link" data-gd-clear>Start again</button></p></div>' +
      '<aside class="gd-coach rise" style="--i:3" aria-label="Marking">' +
      '<div class="gd-clue" data-gd-clue></div>' +
      '<div class="gd-rows" data-gd-rows></div>' +
      '<details class="gd-plan"><summary>Every point for this answer</summary><ol data-gd-plan></ol></details>' +
      '</aside></div></div>';
    app.innerHTML = h;
    bar.querySelector('[data-gx-right]').innerHTML = '<p class="gx-score"><b data-gd-score>0</b>/' + max + '</p><ol class="gx-boxes" aria-hidden="true" data-gd-boxes></ol>';
    var ta = $('.gd-ta', app);
    ta.value = D.text;
    D.ta = ta;
    D.caret = ta.value.length;   // the examiner speaks about the last sentence written
    paintPicks();
    grow();
    update();
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
    return lines.filter(function (l) { return !/^(answer \(i\) or \(ii\)\.?|or)$/i.test(l.trim()); }).join(' ').replace(/\s+-\s+/g, ' – ').trim();
  }
  function schemeLine(e) {
    var hs = (e.head || []).map(function (h) { return h.label + ' ' + (h.marks || 2) + ' marks'; });
    var parts = (e.parts || []).filter(function (p) { return p.max != null; }).map(function (p) { return p.name + ' up to ' + p.max + ' SRPs'; });
    return (hs.length ? hs.join(', ') + '; ' : '') + e.need + ' SRPs at 2 marks each' + (parts.length ? ' (' + parts.join(', ') + ')' : '') + '.';
  }
  function paintMedia() {
    var el = $('[data-gd-media]', app);
    if (el) el.innerHTML = mediaOf(D.t.id, deskTags()).map(mediaCard).join('');
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
    if (s.note === 'repeat' || s.note === 'off' || s.note === 'cap' || s.note === 'full') return 'is-' + s.note;
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
    var taken = [], assigned = {}, changed = false, before = JSON.stringify(D.pick);
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
    changed = JSON.stringify(D.pick) !== before;
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
    var w = words(D.text);
    $('[data-gd-words]', app).textContent = w ? w + ' word' + (w === 1 ? '' : 's') : '';
  }
  function paintMirror(r) {
    var text = D.text, h = '', at = 0;
    r.sentences.forEach(function (s, i) {
      h += esc(text.slice(at, s.start));
      var c = cls(s);
      h += '<span class="gd-s ' + c + (i === D.sel ? ' is-sel' : '') + '" data-s="' + i + '">' + esc(text.slice(s.start, s.end)) + '</span>';
      at = s.end;
    });
    h += esc(text.slice(at)) + '​';
    var mirror = $('.gd-mirror', app);
    mirror.innerHTML = h;
    // the margin: what each finished sentence earned, beside its last line
    var sheet = $('.gd-sheet', app), top0 = sheet.getBoundingClientRect().top, rows = {};
    r.sentences.forEach(function (s, i) {
      var c = cls(s);
      if (!c) return;
      var el = mirror.querySelector('[data-s="' + i + '"]'), rects = el && el.getClientRects();
      if (!rects || !rects.length) return;
      var y = Math.round(rects[rects.length - 1].top - top0);
      var marks = (s.srp ? 2 : 0) + (s.heads || []).length * 2;
      var row = rows[y] = rows[y] || { y: y, marks: 0, note: '', i: i };
      row.marks += marks;
      if (!marks && !row.note) row.note = ['vague', 'repeat', 'cap', 'full'].indexOf(s.note) >= 0 ? s.note : 'off';
    });
    $('.gd-marks', app).innerHTML = Object.keys(rows).map(function (k) {
      var row = rows[k];
      return '<button type="button" class="gd-m ' + (row.marks ? 'gd-m--ok' : 'gd-m--' + row.note) + '" style="top:' + row.y + 'px" data-gd-s="' + row.i + '" tabindex="-1">' +
        (row.marks ? '+' + row.marks : { cap: 'no more' }[row.note] || row.note) + '</button>';
    }).join('');
  }
  function paintScore(r) {
    var sc = bar.querySelector('[data-gd-score]'), bx = bar.querySelector('[data-gd-boxes]');
    if (sc) sc.textContent = r.marks;
    // a box for each named mark (dashed), then one for each SRP, filled in red pen as they're earned
    if (bx) bx.innerHTML = r.heads.map(function (h) { return '<li class="is-head' + (h.got ? ' is-got' : '') + '"></li>'; }).join('') + (r.heads.length ? '<li class="gap"></li>' : '') +
      Array.apply(null, Array(r.need)).map(function (x, i) { return '<li' + (i < r.srps ? ' class="is-got"' : '') + '></li>'; }).join('');
    var rows = r.heads.map(function (h) {
      return '<p class="gd-row' + (h.got ? ' is-got' : '') + '"><span>' + esc(h.label) + (h.got && h.item ? ': ' + esc(h.item) : '') + '</span><b>' + (h.got ? h.marks : 0) + '/' + h.marks + '</b></p>';
    });
    var multi = r.parts.length > 1;
    rows.push('<p class="gd-row' + (r.srps >= r.need ? ' is-got' : '') + '"><span>Points (SRPs)</span><b>' + r.srps + '/' + r.need + '</b></p>');
    if (multi) r.parts.forEach(function (p) {
      rows.push('<p class="gd-row gd-row--sub' + (p.max != null && p.got >= p.max ? ' is-got' : '') + '"><span>' + esc(p.opt || p.name) + '</span><b>' + p.got + (p.max != null ? '/' + p.max : '') + '</b></p>');
    });
    $('[data-gd-rows]', app).innerHTML = rows.join('');
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
      var say = h.say, words = h.any ? h.any.map(function (x) { return x.n; }).join(' · ') : '';
      if (h.pick != null) {
        var lp = live.filter(function (x) { return x.part.id === h.pick; })[0];
        if (lp && lp.opt) { say = lp.opt.say || ('The ' + lp.opt.name.toLowerCase() + ' is the one I am writing about.'); words = lp.opt.name; }
      } else if (!words && h.k) words = h.k.map(function (g) { return g[0]; }).join(' · ');
      var what = h.label.replace(/\s+(named|identified|stated|given)$/i, '');
      return { q: (what !== h.label ? 'Name the ' + what.charAt(0).toLowerCase() + what.slice(1) : h.label) + ' (' + (h.marks || 2) + ' marks).', w: words, t: say };
    }
    return { q: tg.srp.c[0], w: tg.srp.c[1], t: tg.srp.t };
  }
  function paintClue() {
    var el = $('[data-gd-clue]', app), c = targetClue();
    if (!c) {
      el.innerHTML = '<p class="gd-clue__q">' + (D.r.marks >= D.r.max ? 'Full marks. Read it through once, then try another question.' : 'That\'s every point this answer can use.') + '</p>';
      return;
    }
    el.innerHTML = '<p class="gd-clue__k">Next point</p><p class="gd-clue__q">' + esc(c.q) + '</p>' + (D.target && D.target.srp ? pointPics(D.target.srp) : '') +
      (D.level >= 1 && c.w ? keyBoxes(c.w) : '') +
      (D.level >= 2 ? '<p class="gd-model">' + esc(c.t) + '</p><p class="gd-model__n">Now write it yourself, in your own words.</p>' : '') +
      '<p class="gd-clue__b">' + (D.level < 2 ? '<button type="button" class="g-btn" data-gd-more>' + (D.level === 0 && c.w ? 'Key words' : 'Show me') + '</button>' : '') +
      '<button type="button" class="g-link" data-gd-skip>Skip this one</button></p>';
  }
  function paintPlan(r) {
    var live = M.liveParts(D.e, D.pick), multi = live.length > 1;
    $('[data-gd-plan]', app).innerHTML = live.map(function (lp, pi) {
      return (multi ? '<li class="gd-plan__h">' + esc(lp.opt ? lp.opt.name : lp.part.name) + (r.parts[pi].max != null ? ' · up to ' + r.parts[pi].max : '') + '</li>' : '') +
        lp.srps.map(function (sid) {
          var s = G.srp[sid];
          if (!s) return '';
          var got = r.used[sid] != null, on = D.target && D.target.srp === s;
          return '<li><button type="button" class="gd-plan__i' + (got ? ' is-got' : '') + (on ? ' is-on' : '') + '" data-gd-aim="' + esc(sid) + '"' + (got ? ' disabled' : '') + '>' + esc(s.a) + '</button></li>';
        }).join('');
    }).join('');
  }
  // What the examiner says: about the sentence you've just finished (or the one you're in, or one you tapped in the margin).
  function sayFor(s) {
    if (s.srp) return ['happy', 'That\'s a point: ' + s.srp.a + '. +2' + (s.heads.length ? ', and ' + s.heads.join(' and ').toLowerCase() + ' +' + s.heads.length * 2 : '') + '.'];
    if (s.heads && s.heads.length) return ['happy', s.heads.join(' and ') + ': +' + s.heads.length * 2 + '.'];
    if (s.note === 'vague') return ['ok', 'Nearly, but too vague to score. ' + (s.near ? s.near.c[0] : 'Say exactly what happens and why.')];
    if (s.note === 'repeat') return ['angry', 'You\'ve made that point already' + (s.near ? ' (' + s.near.a + ')' : '') + '. A point only scores once.'];
    if (s.note === 'cap') return ['ok', 'True, but that\'s another example, and the scheme only credits so many. Explain a process instead.'];
    if (s.note === 'full') return ['ok', 'True, but that part already has all its marks. Write about the other part now.'];
    if (s.note === 'off') return ['ok', 'True, but that\'s ' + (s.other ? '"' + s.other.a + '"' : 'another topic') + ', which this question doesn\'t ask for.'];
    if (s.note === 'short') return ['ok', 'Too short to be a point. Write the whole sentence.'];
    return ['ok', 'No point in that sentence yet. One fact a sentence: what happens, and why.'];
  }
  function paintSay() {
    var r = D.r, ss = r.sentences, s = null;
    if (D.sel >= 0 && ss[D.sel]) s = ss[D.sel];
    else {
      for (var i = ss.length - 1; i >= 0; i--) {
        if (ss[i].start <= D.caret && ss[i].complete) { s = ss[i]; break; }
      }
    }
    var out;
    if (r.marks >= r.max) out = ['happy', 'Full marks: ' + r.marks + ' out of ' + r.max + '.'];
    else if (s) out = sayFor(s);
    else if (!D.text.trim()) out = ['ok', 'Each point is one sentence. The clue below is for your first one.'];
    else out = ['ok', 'Finish the sentence and I\'ll mark it.'];
    var ex = bar.querySelector('.gx-ex__fig');
    if (ex) ex.setAttribute('data-mood', out[0]);
    var c = targetClue();
    setSay(out[1], c ? c.q : '');
  }

  // =====================================================================================================
  // ---------- build your points (the bank) ----------
  // One point at a time: its clue; three versions of it (the one that scores, a vague one, a wrong one) to pick from;
  // then the versions go and you write it yourself. Once your sentence earns the point it can go in your bank, in your
  // own words, and you see every past essay it scores in.
  // =====================================================================================================
  var L = null;
  function renderLearn(tid, sid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Build your points']], 'Pick the one that gets the 2 marks. Then write it yourself.');
    var b = bank(tid), i = 0;
    if (sid) i = Math.max(0, t.srps.findIndex(function (s) { return s.id === sid; }));
    else { i = t.srps.findIndex(function (s) { return !b[s.id]; }); if (i < 0) i = 0; }
    L = { t: t, i: i, stage: 'pick', order: null, wrong: {}, level: 0, anim: true };
    app.innerHTML = '<div class="gl">' + backLink() + '<div data-gl></div></div>';
    paintLearn();
  }
  function paintLearn() {
    var t = L.t, s = t.srps[L.i], b = bank(t.id), n = t.srps.length, have = bankCount(t.id);
    if (!L.order) L.order = shuffle([['t', s.t], ['v', s.v], ['w', s.w]]);
    var h = '<div class="gl-top"><span class="gl-n">Point ' + (L.i + 1) + ' of ' + n + '</span><span class="gl-have"><b>' + have + '</b> in your bank</span>' +
      '<span class="g-bar"><i style="width:' + Math.round(100 * have / n) + '%"></i></span></div>';
    h += '<section class="gl-card' + (L.anim ? ' rise' : '') + '" style="--c:' + esc(t.colour) + '"><p class="gl-q">' + esc(s.c[0]) + '</p>' + pointPics(s);
    if (L.stage === 'pick') {
      h += '<p class="gl-ask">Which one gets the 2 marks?</p><div class="gl-opts">' + L.order.map(function (o) {
        var bad = L.wrong[o[0]];
        return '<button type="button" class="gl-opt' + (bad ? ' is-bad' : '') + '" data-gl-pick="' + o[0] + '"' + (bad ? ' disabled' : '') + '>' + esc(o[1]) +
          (bad ? '<span class="gl-why">' + esc(o[0] === 'v' ? 'Too vague: it names the idea but doesn\'t give the fact.' : s.why) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    } else if (L.stage === 'write') {
      h += '<p class="gl-ask">Now write it yourself.</p>' + (L.level >= 1 ? keyBoxes(s.c[1]) : '') +
        '<textarea class="gl-ta" rows="3" aria-label="Your point" spellcheck="true" autocapitalize="sentences" placeholder="One sentence."></textarea>' +
        '<p class="gl-check" data-gl-check aria-live="polite"></p>' +
        '<p class="gl-row">' + (L.level < 1 ? '<button type="button" class="g-link" data-gl-more>Key words</button>' : '') +
        '<button type="button" class="g-btn" data-gl-keep disabled>Put it in my bank</button></p>';
    } else {
      var papers = srpPapers(s);
      h += '<p class="gl-ok">' + esc(s.a) + '</p><p class="gl-mine">' + esc(b[s.id] || '') + '</p>' +
        (papers.length ? '<p class="gl-ask">It scores in ' + papers.length + ' past essay' + (papers.length === 1 ? '' : 's') + ':</p><p class="gl-in">' + papers.map(function (it) {
          return '<a href="#w/' + it.a.essay + '/' + it.ref + '">' + esc(qLabel(it)) + '</a>';
        }).join('') + '</p>' : '');
    }
    h += '</section><p class="gl-nav"><button type="button" class="g-link" data-gl-go="-1"' + (L.i ? '' : ' disabled') + '>‹ Back</button>' +
      '<button type="button" class="' + (L.stage === 'done' ? 'g-btn' : 'g-link') + '" data-gl-go="1">' + (L.stage === 'done' ? 'Next point' : 'Skip') + ' ›</button></p>';
    $('[data-gl]', app).innerHTML = h;
    L.anim = false;
    var ta = $('.gl-ta', app);
    if (ta) { ta.value = L.draft || ''; ta.focus(); checkLearn(); }
  }
  function checkLearn() {
    var ta = $('.gl-ta', app), s = L.t.srps[L.i], v = ta.value, out = $('[data-gl-check]', app), keep = $('[data-gl-keep]', app);
    L.draft = v;
    var norm = M.normalise(v, rules(L.t)), tok = norm.trim().split(' ');
    var ok = words(v) >= 5 && M.hits(v, s, rules(L.t));
    var cancel = s.n && M.allHit(s.k, norm, tok) && s.n.some(function (x) { return M.stemHit(x, norm, tok); });
    keep.disabled = !ok;
    out.className = 'gl-check' + (ok ? ' is-ok' : cancel ? ' is-bad' : '');
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
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Your bank']], 'Your points, marked against every paper.');
    var b = bank(tid), mine = t.srps.filter(function (s) { return b[s.id]; });
    var h = title('Your bank', mine.length ? 'Your points in your own words, and how far they get you in every past essay on ' + t.name.toLowerCase() + '.' : 'Nothing in it yet. Build your points and they go in here, in your own words.');
    h += '<a class="g-btn g-btn--big rise" style="--i:1" href="#learn/' + tid + '">Build your points</a>';
    // every essay type: the best your bank does on it (over the options), and the years it was asked
    h += '<h2 class="g-h2 rise" style="--i:2">Against the papers</h2><div class="gb-ess">' + t.essays.map(function (e) {
      var best = bankScore(e, b), asked = BY_ESSAY[e.id] || [];
      return '<a class="gb-e rise" href="#w/' + e.id + '"><span class="gb-e__n">' + esc(e.name) + '</span><span class="gb-e__got"><b>' + best.srps + '</b>/' + e.need + ' points ready' + (best.opt ? ' (' + esc(best.opt) + ')' : '') + '</span>' +
        '<span class="g-bar"><i style="width:' + Math.round(100 * best.srps / e.need) + '%"></i></span>' +
        '<span class="g-essay__years">' + asked.map(function (it) { return '<span>' + it.q.year + '</span>'; }).join('') + '</span></a>';
    }).join('') + '</div>';
    if (mine.length) {
      h += '<h2 class="g-h2">Your points</h2><ol class="gb-list">' + mine.map(function (s) {
        var n = srpPapers(s).length;
        return '<li class="gb-p"><p class="gb-p__a">' + esc(s.a) + '<span>' + n + ' past essay' + (n === 1 ? '' : 's') + '</span></p><p class="gb-p__t">' + esc(b[s.id]) + '</p>' +
          '<a class="g-link" href="#learn/' + tid + '/' + esc(s.id) + '">Write it again</a></li>';
      }).join('') + '</ol>';
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
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Real, vague or wrong?']], 'Gets the marks, too vague, or wrong?');
    var picks = shuffle(t.srps).slice(0, 10).map(function (s) { var k = ['t', 'v', 'w'][Math.floor(Math.random() * 3)]; return { s: s, k: k }; });
    RV = { t: t, list: picks, i: 0, right: 0, answered: null, anim: true };
    app.innerHTML = '<div class="gg">' + backLink() + '<div data-gg></div></div>';
    paintReal();
  }
  function paintReal() {
    var x = RV.list[RV.i], el = $('[data-gg]', app);
    if (!x) {
      el.innerHTML = '<section class="gg-card rise"><p class="gg-big">' + RV.right + '<span class="of">/' + RV.list.length + '</span></p><p class="gg-say">' +
        (RV.right === RV.list.length ? 'Every one right.' : RV.right >= 7 ? 'Good. The ones you missed are worth learning.' : 'Build your points first, then try again.') + '</p>' +
        '<p class="gl-row"><button type="button" class="g-btn" data-gg-again>Again</button><a class="g-link" href="#learn/' + RV.t.id + '">Build your points</a></p></section>';
      return;
    }
    var text = x.k === 't' ? x.s.t : x.k === 'v' ? x.s.v : x.s.w, a = RV.answered;
    var h = '<div class="gl-top"><span class="gl-n">' + (RV.i + 1) + ' of ' + RV.list.length + '</span><span class="gl-have"><b>' + RV.right + '</b> right</span></div>' +
      '<section class="gg-card' + (RV.anim ? ' rise' : '') + '"><p class="gg-s">' + esc(text) + '</p><div class="gg-btns">' +
      [['t', 'Gets the marks'], ['v', 'Too vague'], ['w', 'Wrong']].map(function (o) {
        var c = a ? (o[0] === x.k ? ' is-right' : o[0] === a ? ' is-bad' : '') : '';
        return '<button type="button" class="gg-b' + c + '" data-gg-a="' + o[0] + '"' + (a ? ' disabled' : '') + '>' + o[1] + '</button>';
      }).join('') + '</div>';
    if (a) {
      h += '<p class="gg-say">' + (a === x.k ? 'Yes. ' : 'No. ') + esc(x.k === 't' ? 'That\'s the point: ' + x.s.a + '.' : x.k === 'v' ? 'Too vague. The point is: ' + x.s.t : x.s.why) + '</p>' +
        '<p class="gl-row"><button type="button" class="g-btn" data-gg-next>Next</button></p>';
    }
    el.innerHTML = h + '</section>';
    RV.anim = false;
  }

  // ---------- game: where does it score? ----------
  var WS = null;
  function renderWhere(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Where does it score?']], 'One point can earn marks in many essays.');
    var b = bank(tid);
    var pool = t.srps.filter(function (s) { return srpPapers(s).length; });
    var mine = pool.filter(function (s) { return b[s.id]; });
    WS = { t: t, pool: shuffle(mine.length >= 3 ? mine : pool), i: 0, right: 0, rounds: 0, on: {}, done: false };
    app.innerHTML = '<div class="gg">' + backLink() + '<div data-gg></div></div>';
    nextWhere(true);
  }
  function nextWhere(first) {
    if (!first) WS.i++;
    var s = WS.pool[WS.i % WS.pool.length];
    if (!s) { $('[data-gg]', app).innerHTML = '<p class="g-lead">No points to play with yet.</p>'; return; }
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
    var s = WS.s, b = bank(WS.t.id), el = $('[data-gg]', app);
    var h = '<div class="gl-top"><span class="gl-n">Round ' + (WS.rounds + (WS.done ? 0 : 1)) + '</span><span class="gl-have"><b>' + WS.right + '</b> right</span></div>' +
      '<section class="gg-card' + (WS.anim ? ' rise' : '') + '"><p class="gg-k">' + (b[s.id] ? 'Your point' : 'The point') + '</p><p class="gg-s">' + esc(b[s.id] || s.t) + '</p>' +
      '<p class="gl-ask">Tap every question this point scores in.</p><div class="gw-qs">' + WS.opts.map(function (it, i) {
        var yes = (s.essays || []).indexOf(it.a.essay) >= 0, on = WS.on[i];
        var c = WS.done ? (yes && on ? ' is-right' : yes ? ' is-missed' : on ? ' is-bad' : '') : (on ? ' is-on' : '');
        return '<button type="button" class="gw-q' + c + '" data-gw="' + i + '" aria-pressed="' + !!on + '"' + (WS.done ? ' disabled' : '') + '><span class="gw-q__y">' + esc(qLabel(it)) + '</span>' + esc(questionText(it)) + '</button>';
      }).join('') + '</div>';
    if (!WS.done) h += '<p class="gl-row"><button type="button" class="g-btn" data-gw-check>Check</button></p>';
    else {
      var n = srpPapers(s).length;
      h += '<p class="gg-say">' + esc(WS.lastOk ? 'All right.' : 'Not quite.') + ' This point scores in ' + n + ' past essay' + (n === 1 ? '' : 's') + ' altogether.</p>' +
        '<p class="gl-row"><button type="button" class="g-btn" data-gw-next>Next point</button></p>';
    }
    el.innerHTML = h + '</section>';
    WS.anim = false;
  }

  // ---------- game: picture it (a diagram or a photo: which landform, rock or process is it?) ----------
  var PI = null;
  function optNames(tid) {
    var names = {}, groups = [];
    G.topic[tid].essays.forEach(function (e) { (e.parts || []).forEach(function (p) { if (!p.opts) return; groups.push(p.opts); p.opts.forEach(function (o) { names[o.id] = o.name; }); }); });
    return { names: names, groups: groups };
  }
  function renderPic(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Picture it']], 'What is it? Name it the way the exam wants.');
    var on = optNames(tid), rounds = [];
    ['figs', 'photos'].forEach(function (k) {
      (MEDIA[k] || []).forEach(function (m) {
        if (m.topic !== tid) return;
        var id = (m.tags || []).filter(function (x) { return on.names[x]; })[0];
        if (!id) return;
        var grp = on.groups.filter(function (g) { return g.some(function (o) { return o.id === id; }); })[0] || [];
        var wrong = shuffle(grp.filter(function (o) { return o.name !== on.names[id] && (m.tags || []).indexOf(o.id) < 0; })).slice(0, 3).map(function (o) { return o.name; });
        if (wrong.length < 2) return;
        rounds.push({ m: m, kind: k === 'figs' ? 'fig' : 'photo', right: on.names[id], opts: shuffle([on.names[id]].concat(wrong)) });
      });
    });
    PI = { t: t, list: shuffle(rounds).slice(0, 10), i: 0, right: 0, answered: null, anim: true };
    app.innerHTML = '<div class="gg">' + backLink() + '<div data-gg></div></div>';
    paintPic();
  }
  function paintPic() {
    var x = PI.list[PI.i], el = $('[data-gg]', app);
    if (!PI.list.length) { el.innerHTML = '<p class="g-lead">No pictures for this topic yet.</p>'; return; }
    if (!x) {
      el.innerHTML = '<section class="gg-card rise"><p class="gg-big">' + PI.right + '<span class="of">/' + PI.list.length + '</span></p><p class="gg-say">' +
        (PI.right === PI.list.length ? 'Every one right.' : 'Look at the ones you missed again: you\'ll draw them in the exam.') + '</p>' +
        '<p class="gl-row"><button type="button" class="g-btn" data-pi-again>Again</button></p></section>';
      return;
    }
    var a = PI.answered;
    var h = '<div class="gl-top"><span class="gl-n">' + (PI.i + 1) + ' of ' + PI.list.length + '</span><span class="gl-have"><b>' + PI.right + '</b> right</span></div>' +
      '<section class="gg-card' + (PI.anim ? ' rise' : '') + '"><div class="g-pic' + (x.kind === 'fig' ? ' is-fig' : '') + '"><img src="' + esc(x.m.file) + '" alt="A picture to name"></div>' +
      '<p class="gl-ask">What is it?</p><div class="gg-btns g-pic__opts">' + x.opts.map(function (o, k) {
        var c = a != null ? (o === x.right ? ' is-right' : k === a ? ' is-bad' : '') : '';
        return '<button type="button" class="gg-b' + c + '" data-pi-a="' + k + '"' + (a != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('') + '</div>';
    if (a != null) h += '<p class="gg-say">' + (x.opts[a] === x.right ? 'Yes: ' : 'No: it\'s ') + esc(x.right) + '. ' + esc(x.m.caption || x.m.name || '') + '</p><p class="gl-row"><button type="button" class="g-btn" data-pi-next>Next</button></p>';
    el.innerHTML = h + '</section>';
    PI.anim = false;
  }

  // ---------- game: fix it (a wrong sentence: rewrite it so it gets the 2 marks) ----------
  var FX = null;
  function renderFix(tid) {
    var t = G.topic[tid];
    if (!t) return renderHub();
    shell('t/' + tid, [[t.name, '#t/' + tid], ['Fix it']], 'That sentence is wrong. Write it so it scores.');
    FX = { t: t, list: shuffle(t.srps.filter(function (s) { return s.w && s.why; })).slice(0, 10), i: 0, right: 0, shown: false, done: false, draft: '' };
    app.innerHTML = '<div class="gg">' + backLink() + '<div data-gg></div></div>';
    paintFix();
  }
  function paintFix() {
    var s = FX.list[FX.i], el = $('[data-gg]', app);
    if (!s) {
      el.innerHTML = '<section class="gg-card rise"><p class="gg-big">' + FX.right + '<span class="of">/' + FX.list.length + '</span></p><p class="gg-say">Fixed without help: ' + FX.right + '.</p>' +
        '<p class="gl-row"><button type="button" class="g-btn" data-fx-again>Again</button></p></section>';
      return;
    }
    var h = '<div class="gl-top"><span class="gl-n">' + (FX.i + 1) + ' of ' + FX.list.length + '</span><span class="gl-have"><b>' + FX.right + '</b> fixed</span></div>' +
      '<section class="gg-card"><p class="gg-k">This sentence is wrong</p><p class="gg-s g-wrong">' + esc(s.w) + '</p>' +
      '<p class="gl-ask">' + esc(s.c[0]) + '</p>' + (FX.shown ? '<p class="gg-say">' + esc(s.why) + '</p>' : '') +
      '<textarea class="gl-ta g-fix" rows="3" aria-label="Your fixed sentence" spellcheck="true" autocapitalize="sentences" placeholder="Write it so it gets the 2 marks."></textarea>' +
      '<p class="gl-check" data-fx-check aria-live="polite"></p><p class="gl-row">' +
      (FX.done ? '<button type="button" class="g-btn" data-fx-next>Next</button>' : (!FX.shown ? '<button type="button" class="g-link" data-fx-why>What\'s wrong with it?</button>' : '') + '<button type="button" class="g-link" data-fx-next>Skip</button>') + '</p></section>';
    el.innerHTML = h;
    var ta = $('.g-fix', app); ta.value = FX.draft; ta.focus(); checkFix();
  }
  function checkFix() {
    var ta = $('.g-fix', app), s = FX.list[FX.i], v = ta.value, out = $('[data-fx-check]', app);
    FX.draft = v;
    var ok = words(v) >= 5 && M.hits(v, s, rules(FX.t)) && v.trim() !== s.w.trim();
    out.className = 'gl-check' + (ok ? ' is-ok' : '');
    out.textContent = ok ? 'Fixed: that gets the 2 marks.' : '';
    if (ok && !FX.done) { FX.done = true; if (!FX.shown) FX.right++; var row = $('.gl-row', fxRoot()); if (row) row.innerHTML = '<button type="button" class="g-btn" data-fx-next>Next</button>'; }
  }
  function fxRoot() { return $('[data-gg]', app); }

  // ---------- routing and events ----------
  function route() {
    var parts = location.hash.replace(/^#/, '').split('/');
    var k = parts[0];
    D = L = RV = WS = PI = FX = null;
    if (k === 't') renderTopic(parts[1]);
    else if (k === 'w') renderDesk(parts[1], parts[2]);
    else if (k === 'learn') renderLearn(parts[1], parts[2]);
    else if (k === 'bank') renderBank(parts[1]);
    else if (k === 'play' && parts[1] === 'real') renderReal(parts[2]);
    else if (k === 'play' && parts[1] === 'where') renderWhere(parts[2]);
    else if (k === 'play' && parts[1] === 'pic') renderPic(parts[2]);
    else if (k === 'play' && parts[1] === 'fix') renderFix(parts[2]);
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
    if (!t.closest('.gx-drop')) $$('.gx-drop[open]').forEach(function (d) { d.open = false; });
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
        var ta = $('.gl-ta', app), bk = bank(L.t.id);
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
    if (PI && t.closest('[data-gg]')) {
      if ((b = t.closest('[data-pi-a]'))) { var x2 = PI.list[PI.i]; PI.answered = +b.getAttribute('data-pi-a'); if (x2.opts[PI.answered] === x2.right) PI.right++; paintPic(); return; }
      if (t.closest('[data-pi-next]')) { PI.i++; PI.answered = null; PI.anim = true; paintPic(); return; }
      if (t.closest('[data-pi-again]')) { renderPic(PI.t.id); return; }
    }
    if (FX && t.closest('[data-gg]')) {
      if (t.closest('[data-fx-why]')) { FX.shown = true; paintFix(); return; }
      if (t.closest('[data-fx-next]')) { FX.i++; FX.shown = false; FX.done = false; FX.draft = ''; paintFix(); return; }
      if (t.closest('[data-fx-again]')) { renderFix(FX.t.id); return; }
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
    } else if (L && ev.target.classList.contains('gl-ta')) checkLearn();
    else if (FX && ev.target.classList.contains('g-fix')) checkFix();
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
  });
  window.addEventListener('resize', function () { if (D) { grow(); paintMirror(D.r); } });
  // the paper's text can't be selected (only what's in your own boxes): Ctrl+A outside a box does nothing
  document.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'a' || ev.key === 'A')) {
      var a = document.activeElement;
      if (!a || !/^(TEXTAREA|INPUT)$/.test(a.tagName)) ev.preventDefault();
    }
  });
  route();
})();

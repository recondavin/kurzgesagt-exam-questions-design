// The desk for Biology. Loaded by the desk page (Geography Questions.dc.html), it adds a Geography / Biology switch,
// and for a link like "#bio/29/2016-Q12b" it puts that question's real exam paper page on the desk (same desk, hands
// and pen), rings the question, and the narrated guide (hyper-focus.js) explains it in three steps (bio/guide.js).
// "Start writing" then opens the Biology answer sheet (bio/bio.js), marked against the SEC marking scheme.
(function () {
  'use strict';
  var BIO_PAGE = 'biology.html';
  var V = 'bio-6';
  var loaded = {}, current = null, started = false;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function parse() {
    var m = /^#bio\/(\d+)\/(.+)$/.exec(location.hash);
    return m ? { ch: +m[1], qid: decodeURIComponent(m[2]) } : null;
  }

  // ---------- loading the Biology files (only when a Biology question is on the desk) ----------
  function css(href) {
    if (loaded[href]) return;
    loaded[href] = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href + '?v=' + V;
    document.head.appendChild(l);
  }
  function script(src) {
    return new Promise(function (done) {
      if (loaded[src]) { done(); return; }
      loaded[src] = true;
      var s = document.createElement('script');
      s.src = src + '?v=' + V;
      s.onload = s.onerror = function () { done(); };
      document.head.appendChild(s);
    });
  }
  function loadChapter(ch) {
    css('bio/bio-sheet.css');
    css('bio/bio-desk.css');
    var files = ['bio/d28.js', 'bio/d29.js', 'bio/d30.js', 'bio/d31.js', 'bio/d32.js', 'bio/q' + ch + '.js', 'bio/learn' + ch + '.js',
      'bio/papers.js', 'bio/guide.js', 'bio/guide' + ch + '.js', 'bio/bio.js'];
    return files.reduce(function (p, f) { return p.then(function () { return script(f); }); }, Promise.resolve());
  }
  // The desk's paper is drawn by the page once its scripts run; wait for it and for the guide.
  function whenDeskReady() {
    return new Promise(function (done) {
      var tries = 0;
      (function check() {
        if (document.querySelector('.geography-page-image') && window.ExamHyperFocus && window.ExamHyperFocus.use) { done(); return; }
        if (++tries < 300) setTimeout(check, 100);
      })();
    });
  }

  // ---------- the subject switch, on both subjects ----------
  function addSwitch(bio, ch) {
    var old = document.querySelector('.desk-subjects');
    if (old) old.remove();
    var nav = el('nav', 'desk-subjects');
    nav.setAttribute('aria-label', 'Subject');
    nav.innerHTML = '<a href="Geography%20Questions.dc.html"' + (bio ? '' : ' aria-current="page"') + '>Geography</a>' +
      '<a href="' + BIO_PAGE + (ch ? '#ch' + ch : '') + '"' + (bio ? ' aria-current="page"' : '') + '>Biology</a>';
    document.body.appendChild(nav);
  }

  // ---------- one Biology question on the desk ----------
  function chapterList(ch) {
    var P = window.BioPapers || {}, Q = (window.BioQuestions || {})[ch];
    return Q ? Q.questions.filter(function (q) { return P[ch + '/' + q.id]; }) : [];
  }
  function ring(base, hi) {
    var art = (window.BioArt || {})[base];
    if (!art) return '';
    var rings = (hi || []).map(function (a) {
      var p = art.anchors[a];
      return p ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="22" fill="none" stroke="#FFC42E" stroke-width="5"/>' : '';
    }).join('');
    return '<div class="hf-bio-pic" data-hf-still>' + art.plain.replace(/<\/svg>$/, rings + '</svg>') + '</div>';
  }
  function guideSteps(ch, q) {
    var G = window.BioGuide;
    if (!G || !G.steps) return [];
    var list = G.steps(ch, q);
    return list.map(function (s, k) {
      var step = {
        id: s.id, target: 'question-bio', kicker: '', title: s.title, summary: s.summary, spotlight: true, voice: s.voice, prose: '', points: [],
        visual: (s.pic ? ring(s.pic.base, s.pic.hi) : '') + '<ul class="hf-bullets hf-bullets--steps">' + s.bullets.map(function (b) {
          return '<li><span class="hf-bullet-dot"></span><span><b>' + esc(b.b) + ':</b> ' + esc(b.t) + '</span></li>';
        }).join('') + '</ul>'
      };
      if (k === list.length - 1) step.finish = function (rect, exit) { exit(); write(); };
      return step;
    });
  }
  function write() {
    if (!current || !window.BioApp) return;
    window.BioApp.openQuestion(current.ch, current.qid, function () {}, function (next) {
      // "Next question" on the sheet moves the desk to the next paper.
      var root = document.querySelector('.am-root [data-am-keep]');
      if (root) root.click();
      location.hash = '#bio/' + current.ch + '/' + encodeURIComponent(next);
    });
  }
  function show(ch, qid) {
    var P = (window.BioPapers || {})[ch + '/' + qid], Q = (window.BioQuestions || {})[ch];
    var q = Q && Q.questions.filter(function (x) { return x.id === qid; })[0];
    if (!P || !q) { location.href = BIO_PAGE + '#ch' + ch; return; }
    current = { ch: ch, qid: qid, q: q };
    if (window.ExamHyperFocus) window.ExamHyperFocus.exit();
    document.body.classList.add('bio-desk');
    document.title = q.src.replace(/^LC Biology HL /, 'Biology ') + ' | Leaving Cert revision';
    var img = document.querySelector('.geography-page-image');
    img.src = P.img;
    img.alt = P.label;
    // The 3C target becomes this question's target; 3B's is hidden (bio-desk.css).
    var target = document.querySelector('.geography-focus-target:not(.geography-focus-target--3b)');
    target.setAttribute('data-hf-target', 'question-bio');
    target.setAttribute('aria-label', P.label + ': start the guided walkthrough');
    target.style.left = P.box[0] + '%';
    target.style.top = P.box[1] + '%';
    target.style.width = P.box[2] + '%';
    target.style.height = P.box[3] + '%';
    var start = document.querySelector('.geography-focus-start');
    if (start) { start.setAttribute('data-hf-start', 'question-bio'); start.textContent = 'Focus on ' + P.label.replace(/^.*Question\s+/, 'Q'); }
    var acc = document.querySelector('.geography-page-accessible');
    if (acc) acc.innerHTML = '<h1>' + esc(P.label) + '</h1>' + (q.stem ? '<p>' + esc(q.stem) + '</p>' : '') + q.parts.map(function (p) { return '<p>' + esc(p.l + ' ' + p.q) + '</p>'; }).join('');
    window.ExamHyperFocus.use(guideSteps(ch, q));
    bar(ch, qid);
    addSwitch(true, ch);
    // Start the guide once the new page has loaded, so the camera moves over the real paper.
    var go = function () { setTimeout(function () { if (current && current.qid === qid) window.ExamHyperFocus.start('question-bio-ask'); }, 1400); };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  }
  // Buttons on the desk: back to the chapter, the question before and after, and straight to writing.
  function bar(ch, qid) {
    var old = document.querySelector('.bio-deskbar');
    if (old) old.remove();
    var list = chapterList(ch), at = list.map(function (q) { return q.id; }).indexOf(qid);
    var prev = list[at - 1], next = list[at + 1];
    var b = el('div', 'bio-deskbar');
    b.innerHTML = '<a class="bio-deskbar__back" href="' + BIO_PAGE + '#ch' + ch + '">Chapter ' + ch + '</a>' +
      '<span class="bio-deskbar__where">' + (at + 1) + ' of ' + list.length + '</span>' +
      (prev ? '<a class="bio-deskbar__btn" href="#bio/' + ch + '/' + encodeURIComponent(prev.id) + '" aria-label="Previous question">‹</a>' : '') +
      (next ? '<a class="bio-deskbar__btn" href="#bio/' + ch + '/' + encodeURIComponent(next.id) + '" aria-label="Next question">›</a>' : '') +
      '<button type="button" class="bio-deskbar__write" data-bio-write>Answer it</button>';
    document.body.appendChild(b);
  }

  function route() {
    var r = parse();
    if (!r) {
      if (started) location.reload();
      return;
    }
    started = true;
    loadChapter(r.ch).then(whenDeskReady).then(function () { show(r.ch, r.qid); });
  }
  function init() {
    var r = parse();
    css('bio/bio-desk.css');
    if (!r) { whenDeskReady().then(function () { addSwitch(false, null); }); }
    route();
    window.addEventListener('hashchange', route);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-bio-write]')) { if (window.ExamHyperFocus) window.ExamHyperFocus.exit(); write(); }
    });
  }
  window.BioDesk = { show: show };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

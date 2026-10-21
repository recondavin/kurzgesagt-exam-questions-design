// The desk for Biology. Loaded by the desk page (Geography Questions.dc.html), it adds a Geography / Biology switch,
// and for a link like "#bio/29/2016-Q12b" it puts that question's real exam paper page on the desk (same desk, hands
// and pen), rings the question, and the narrated guide (hyper-focus.js) explains it part by part (bio/guide.js): each
// slide's camera and spotlight go to that part's own box on the paper, lit only where that part's print is.
// "Start writing" then opens the Biology answer sheet (bio/bio.js), marked against the SEC marking scheme.
(function () {
  'use strict';
  var BIO_PAGE = 'biology.html';
  var V = 'bio-26';
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
      return p ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="22" fill="none" stroke="#FFC800" stroke-width="5"/>' : '';
    }).join('');
    return '<div class="hf-bio-pic" data-hf-still>' + art.plain.replace(/<\/svg>$/, rings + '</svg>') + '</div>';
  }
  // One part on the desk: its page (a question can run onto the next page), and only its own shade showing.
  function part(k) {
    var v = current && current.P.parts && current.P.parts[k], img = document.querySelector('.geography-page-image');
    if (!v || !img) return;
    if (img.getAttribute('src') !== v.img + '?v=' + V) img.src = v.img + '?v=' + V;
    document.querySelectorAll('.bio-shade').forEach(function (d) { d.classList.toggle('is-on', d.getAttribute('data-part') === String(k)); });
  }
  // The guide closed: back to the question's own page, nothing shaded.
  function rest() {
    var img = document.querySelector('.geography-page-image');
    if (current && img && img.getAttribute('src') !== current.P.img + '?v=' + V) img.src = current.P.img + '?v=' + V;
    document.querySelectorAll('.bio-shade.is-on').forEach(function (d) { d.classList.remove('is-on'); });
  }
  function place(node, b) {
    node.style.left = b[0] + '%';
    node.style.top = b[1] + '%';
    node.style.width = b[2] + '%';
    node.style.height = b[3] + '%';
  }
  // Each part's box (bio/papers.js, traced by tools/bio/build_bio_part_boxes.py) and its shade, like a news explainer
  // zooming into a line of a document: inside the box (and a margin round it, under the dark around the spotlight) the
  // page is greyed and blurred so far that no line of it is left, and the part's own print (and what it needs) stays
  // sharp and white, glowing softly into the grey with no edge. The shade is the page itself, blurred by the browser
  // (smooth, and drawn by the graphics card), cut out over the part's holes.
  function partBoxes(shell, P) {
    shell.querySelectorAll('.bio-part-focus, .bio-shade').forEach(function (n) { n.remove(); });
    (P.parts || []).forEach(function (v, k) {
      var f = el('div', 'bio-part-focus');
      f.setAttribute('data-hf-target', 'question-bio-p' + k);
      f.setAttribute('aria-hidden', 'true');
      place(f, v.box);
      shell.appendChild(f);
      var m = 4, b = [v.box[0] - m, v.box[1] - m, v.box[2] + 2 * m, v.box[3] + 2 * m];
      // Two masks, drawn in page % so they line up with the page. The shade is cut out exactly over the holes (whose
      // edges lie on blank paper), so the part is the real page. Over the grey, a white glow starts at the holes and
      // fades out: where the paper and the glow meet both are white, so there is no edge, and nothing sharp shows
      // through the fade.
      var svg = function (body, defs) {
        return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.join(' ') + '" preserveAspectRatio="none">' +
          (defs || '') + body + '</svg>') + '")';
      };
      var rects = function (grow, grow2, fill) {
        return v.holes.map(function (h) {
          return '<rect x="' + (h[0] - grow) + '" y="' + (h[1] - grow2) + '" width="' + (h[2] + 2 * grow) + '" height="' + (h[3] + 2 * grow2) + '" fill="' + fill + '"/>';
        }).join('');
      };
      var cut = svg('<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="#fff" mask="url(#m)"/>',
        '<defs><mask id="m" maskUnits="userSpaceOnUse" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"><rect x="' + b[0] + '" y="' + b[1] +
        '" width="' + b[2] + '" height="' + b[3] + '" fill="#fff"/>' + rects(0, 0, '#000') + '</mask></defs>');
      var glow = svg('<g filter="url(#f)">' + rects(1.6, 1.12, '#fff') + '</g>',
        '<defs><filter id="f" filterUnits="userSpaceOnUse" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"><feGaussianBlur stdDeviation="0.8 0.56"/></filter></defs>');
      var shade = el('div', 'bio-shade');
      shade.setAttribute('data-part', k);
      shade.setAttribute('aria-hidden', 'true');
      place(shade, b);
      shade.style.webkitMaskImage = shade.style.maskImage = cut;
      // The page, placed so it lies exactly over the real one (the shade's box is b, in page %).
      var page = el('img', 'bio-shade__page');
      page.alt = '';
      page.src = v.img + '?v=' + V;
      page.style.cssText = 'left:' + (-b[0] / b[2] * 100) + '%;top:' + (-b[1] / b[3] * 100) + '%;width:' + (100 / b[2] * 100) + '%;height:' + (100 / b[3] * 100) + '%';
      shade.appendChild(page);
      var light = el('div', 'bio-shade__glow');
      light.style.webkitMaskImage = light.style.maskImage = glow;
      shade.appendChild(light);
      shell.appendChild(shade);
    });
  }
  function guideSteps(ch, q) {
    var G = window.BioGuide, parts = current.P.parts;
    if (!G || !G.steps) return [];
    var list = G.steps(ch, q);
    return list.map(function (s, k) {
      var step = {
        id: s.id, target: 'question-bio', focus: parts && parts[k] ? 'question-bio-p' + k : null, enter: function () { part(k); },
        motion: '.geography-page-shell', kicker: '', title: s.title, summary: s.summary, spotlight: true, voice: s.voice, prose: '', points: [],
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
    current = { ch: ch, qid: qid, q: q, P: P };
    if (window.ExamHyperFocus) window.ExamHyperFocus.exit();
    document.body.classList.add('bio-desk');
    document.title = q.src.replace(/^LC Biology HL /, 'Biology ') + ' | Leaving Cert revision';
    var img = document.querySelector('.geography-page-image');
    img.src = P.img + '?v=' + V;
    img.alt = P.label;
    // The 3C target becomes this question's target; 3B's is hidden (bio-desk.css).
    var target = document.querySelector('.geography-focus-target:not(.geography-focus-target--3b)');
    target.setAttribute('data-hf-target', 'question-bio');
    target.setAttribute('aria-label', P.label + ': start the guided walkthrough');
    place(target, P.box);
    partBoxes(target.parentNode, P);
    // The camera fits what's printed on the page (and the question) to the screen, so the paper is as big as it can be.
    var fit = document.querySelector('[data-hf-fit]') || el('div', 'bio-fitbox'), c = P.content || [0, 0, 100, 100], b = P.box;
    var l = Math.min(c[0], b[0]), t = Math.min(c[1], b[1]), r = Math.max(c[0] + c[2], b[0] + b[2]), u = Math.max(c[1] + c[3], b[1] + b[3]);
    fit.setAttribute('data-hf-fit', '');
    fit.setAttribute('aria-hidden', 'true');
    fit.style.cssText = 'position:absolute;pointer-events:none;left:' + l + '%;top:' + t + '%;width:' + (r - l) + '%;height:' + (u - t) + '%';
    if (!fit.parentNode) img.parentNode.appendChild(fit);
    window.ExamHyperFocus.fit();
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
    document.addEventListener('hf-exit', rest);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-bio-write]')) { if (window.ExamHyperFocus) window.ExamHyperFocus.exit(); write(); }
    });
  }
  window.BioDesk = { show: show };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

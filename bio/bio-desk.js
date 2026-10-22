// The desk for Biology. Loaded by the desk page (Geography Questions.dc.html), it adds a Geography / Biology switch,
// and for a link like "#bio/29/2016-Q12b" it puts that question's real exam paper page on the desk (same desk, hands
// and pen), rings the question, and the narrated guide (hyper-focus.js) explains it part by part (bio/guide.js): each
// slide's camera and spotlight go to that part's own box on the paper, lit only where that part's print is.
// "Start writing" then opens the Biology answer sheet (bio/bio.js), marked against the SEC marking scheme.
(function () {
  'use strict';
  var BIO_PAGE = 'biology.html';
  var V = 'bio-35';
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
      'bio/papers.js', 'bio/guide.js', 'bio/guide' + ch + '.js', 'bio/checks' + ch + '.js', 'bio/bio.js'];
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
      '<a href="' + BIO_PAGE + (ch ? '#ch' + ch : '') + '"' + (bio ? ' aria-current="page"' : '') + '>Biology</a>' +
      '<a href="irish.html">Irish</a>';
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
  // Each part's box (bio/papers.js, traced by tools/bio/build_bio_part_boxes.py) and its cover: inside the box (and a
  // margin round it, under the dark around the spotlight) the page is plain white paper except over the part's own
  // print and what it needs, as if nothing else were printed. The holes' edges lie on blank paper, so white meets
  // white and there is no edge to see.
  function partBoxes(shell, P) {
    shell.querySelectorAll('.bio-part-focus, .bio-shade').forEach(function (n) { n.remove(); });
    (P.parts || []).forEach(function (v, k) {
      var f = el('div', 'bio-part-focus');
      f.setAttribute('data-hf-target', 'question-bio-p' + k);
      f.setAttribute('aria-hidden', 'true');
      place(f, v.box);
      shell.appendChild(f);
      var m = 4, b = [v.box[0] - m, v.box[1] - m, v.box[2] + 2 * m, v.box[3] + 2 * m];
      // The mask, drawn in page % so it lines up with the page: shown everywhere but the holes.
      var mask = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.join(' ') + '" preserveAspectRatio="none"><defs><mask id="m" maskUnits="userSpaceOnUse" x="' +
        b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"><rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="#fff"/>' +
        v.holes.map(function (h) {
          return '<rect x="' + h[0] + '" y="' + h[1] + '" width="' + h[2] + '" height="' + h[3] + '" fill="#000"/>';
        }).join('') + '</mask></defs><rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="#fff" mask="url(#m)"/></svg>';
      var url = 'url("data:image/svg+xml,' + encodeURIComponent(mask) + '")';
      var shade = el('div', 'bio-shade');
      shade.setAttribute('data-part', k);
      shade.setAttribute('aria-hidden', 'true');
      place(shade, b);
      shade.style.webkitMaskImage = shade.style.maskImage = url;
      shell.appendChild(shade);
    });
  }
  // One quick check per part, at the end of its slide (bio/checksNN.js, from tools/bio/checks): pick one of four (or
  // true / false), see straight away if it's right and why. The whole question is then answered from memory on the
  // answer sheet ("Start writing").
  function checkHtml(c, k) {
    // Shuffled, so the right one isn't always in the same place; true or false always reads True, then False.
    var options = [c.right].concat(c.wrong);
    if (options.length === 2) options = ['True', 'False'];
    else for (var i = options.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = options[i]; options[i] = options[j]; options[j] = t; }
    return '<div class="hf-bio-check" data-hf-still data-part="' + k + '"><p class="hf-bio-check__q"><b>Quick check:</b> ' + esc(c.q) + '</p>' +
      '<div class="hf-bio-check__options' + (options.length === 2 ? ' hf-bio-check__options--two' : '') + '">' + options.map(function (o) {
        return '<button type="button" class="hf-bio-check__option"' + (o === c.right ? ' data-right' : '') + '>' + esc(o) + '</button>';
      }).join('') + '</div><p class="hf-bio-check__why" hidden></p><p class="hf-sr" role="status" data-check-status></p></div>';
  }
  function answerCheck(button) {
    var box = button.closest('.hf-bio-check');
    if (!box || box.classList.contains('is-done')) return;
    var right = button.hasAttribute('data-right'), c = current && ((window.BioChecks || {})[current.ch] || {})[current.qid];
    c = c && c[+box.getAttribute('data-part')];
    box.classList.add('is-done');
    box.querySelectorAll('.hf-bio-check__option').forEach(function (b) {
      b.disabled = true;
      if (b.hasAttribute('data-right')) b.classList.add('is-right');
    });
    if (!right) button.classList.add('is-wrong');
    var why = box.querySelector('.hf-bio-check__why');
    why.innerHTML = '<b>' + (right ? 'Right!' : 'Not quite.') + '</b> ' + esc(c ? c.why : '');
    why.className = 'hf-bio-check__why ' + (right ? 'is-right' : 'is-wrong');
    why.hidden = false;
    if (window.ExamHyperFocus && window.ExamHyperFocus.follow) window.ExamHyperFocus.follow(why);
    box.querySelector('[data-check-status]').textContent = (right ? 'Right. ' : 'Not quite. The answer is ' + (c ? c.right : '') + '. ') + (c ? c.why : '');
  }
  function guideSteps(ch, q) {
    var G = window.BioGuide, parts = current.P.parts, checks = ((window.BioChecks || {})[ch] || {})[q.id];
    if (!G || !G.steps) return [];
    var list = G.steps(ch, q);
    return list.map(function (s, k) {
      // Read in pages, one idea at a time, then the quick check, all in the same small card: the question stays at the
      // top, a bar shows how far through the part you are, and Next turns the page ("Quick check" before the check).
      var check = checks && checks[k], n = s.bullets.length;
      var bar = '<div class="bio-pace" data-hf-still>' + s.bullets.map(function (b, i) {
        return '<button type="button" class="bio-pace__seg' + (i ? '' : ' is-now') + '" data-bio-seg="' + i + '" aria-label="' + esc(b.b) + '"></button>';
      }).join('') + (check ? '<button type="button" class="bio-pace__check" data-bio-seg="' + n + '" aria-label="Quick check">?</button>' : '') + '</div>';
      var step = {
        id: s.id, target: 'question-bio', focus: parts && parts[k] ? 'question-bio-p' + k : null, enter: function () { part(k); },
        motion: '.geography-page-shell', kicker: '', title: s.title, summary: s.summary, summaryStill: true, spotlight: true, voice: s.voice, prose: '', points: [],
        visual: bar + (s.pic ? ring(s.pic.base, s.pic.hi) : '') + '<ul class="hf-bullets hf-bullets--steps bio-facts">' + s.bullets.map(function (b, i) {
          return '<li data-bio-page="' + i + '"' + (i ? ' data-hf-gate="Next"' : ' class="is-now"') + '><span class="hf-bullet-dot"></span><span><b>' + esc(b.b) + ':</b> ' +
            esc(b.t) + '</span></li>';
        }).join('') + '</ul>' + (check ? '<div class="bio-check-page" data-hf-still data-bio-page="' + n + '" data-hf-gate="Quick check">' + checkHtml(check, k) + '</div>' : '')
      };
      if (k === list.length - 1) step.finish = function (rect, exit) { exit(); write(); };
      return step;
    });
  }
  // A page of the card opens (hyper-focus.js 'hf-page'), or a seen one is picked on the bar: only it shows.
  function showPage(card, i) {
    var pages = card.querySelectorAll('[data-bio-page]'), at = -1;
    pages.forEach(function (p) { if (p.classList.contains('is-now')) at = +p.getAttribute('data-bio-page'); });
    card.seen = Math.max(card.seen || 0, i, at);
    pages.forEach(function (p) { p.classList.toggle('is-now', +p.getAttribute('data-bio-page') === i); });
    card.querySelectorAll('[data-bio-seg]').forEach(function (b) {
      var j = +b.getAttribute('data-bio-seg');
      b.classList.toggle('is-now', j === i);
      b.classList.toggle('is-done', j !== i && j <= card.seen);
    });
    var box = card.closest('.hf-guide__content');
    if (box) box.scrollTop = 0;
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
    document.addEventListener('hf-page', function (e) {
      var card = e.target.closest && e.target.closest('.hf-guide__visual');
      if (card && e.target.hasAttribute('data-bio-page')) showPage(card, +e.target.getAttribute('data-bio-page'));
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-bio-write]')) { if (window.ExamHyperFocus) window.ExamHyperFocus.exit(); write(); }
      var option = e.target.closest('.hf-bio-check__option');
      if (option) answerCheck(option);
      // A page already seen can be looked at again from the bar; the picture grows when tapped.
      var seg = e.target.closest('[data-bio-seg]'), card = seg && seg.closest('.hf-guide__visual');
      if (seg && card && +seg.getAttribute('data-bio-seg') <= (card.seen || 0)) showPage(card, +seg.getAttribute('data-bio-seg'));
      var pic = e.target.closest('.hf-guide .hf-bio-pic');
      if (pic) pic.classList.toggle('is-big');
      var asked = document.body.classList.contains('bio-desk') && e.target.closest('.hf-guide [data-hf-summary]');
      if (asked) asked.classList.toggle('is-open');
    });
  }
  window.BioDesk = { show: show };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

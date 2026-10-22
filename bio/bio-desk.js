// The desk for Biology. Loaded by the desk page (Geography Questions.dc.html), it adds a Geography / Biology switch,
// and for a link like "#bio/29/2016-Q12b" it puts that question's real exam paper page on the desk (same desk, hands
// and pen), rings the question, and the narrated guide (hyper-focus.js) explains it part by part (bio/guide.js): each
// slide's camera and spotlight go to that part's own box on the paper, lit only where that part's print is.
// "Start writing" then opens the Biology answer sheet (bio/bio.js), marked against the SEC marking scheme.
(function () {
  'use strict';
  var BIO_PAGE = 'biology.html';
  var V = 'bio-54';
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
      // A part with nothing new to teach is just its quick check: one page, no bar, nothing to wait for.
      var check = checks && checks[k], n = s.bullets.length;
      var bar = !n ? '' : '<div class="bio-pace" data-hf-still>' + s.bullets.map(function (b, i) {
        return '<button type="button" class="bio-pace__seg' + (i ? '' : ' is-now') + '" data-bio-seg="' + i + '" aria-label="' + esc(b.b) + '"></button>';
      }).join('') + (check ? '<button type="button" class="bio-pace__check" data-bio-seg="' + n + '" aria-label="Quick check">?</button>' : '') + '</div>';
      var step = {
        id: s.id, target: 'question-bio', focus: parts && parts[k] ? 'question-bio-p' + k : null, enter: function () { part(k); },
        motion: '.geography-page-shell', kicker: '', title: s.title, summary: s.summary, summaryStill: true, spotlight: true, voice: s.voice, prose: '', points: [],
        visual: bar + (s.pic ? ring(s.pic.base, s.pic.hi) : '') + '<ul class="hf-bullets hf-bullets--steps bio-facts">' + s.bullets.map(function (b, i) {
          return '<li data-bio-page="' + i + '"' + (i ? ' data-hf-gate="Next"' : ' class="is-now"') + '><span class="hf-bullet-dot"></span><span><b>' + esc(b.b) + ':</b> ' +
            esc(b.t) + '</span></li>';
        }).join('') + '</ul>' + (check ? '<div class="bio-check-page' + (n ? '"' : ' is-now"') + ' data-hf-still data-bio-page="' + n + '"' + (n ? ' data-hf-gate="Quick check"' : '') + '>' +
          checkHtml(check, k) + '</div>' : '')
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
    // Writing now: the walkthrough mustn't start by itself behind the sheet.
    current.asked = true;
    window.BioApp.openQuestion(current.ch, current.qid, function () {}, function (next) {
      // "Next question" on the sheet moves the desk to the next paper.
      var root = document.querySelector('.am-root [data-am-keep]');
      if (root) root.click();
      location.hash = '#bio/' + current.ch + '/' + encodeURIComponent(next);
    });
    wireSheet(30);
  }
  function show(ch, qid) {
    var P = (window.BioPapers || {})[ch + '/' + qid], Q = (window.BioQuestions || {})[ch];
    var q = Q && Q.questions.filter(function (x) { return x.id === qid; })[0];
    if (!P || !q) { location.href = BIO_PAGE + '#ch' + ch; return; }
    var before = current, img = document.querySelector('.geography-page-image'), was = img.getAttribute('src');
    current = { ch: ch, qid: qid, q: q, P: P };
    if (window.ExamHyperFocus) window.ExamHyperFocus.exit();
    document.body.classList.add('bio-desk');
    document.title = q.src.replace(/^LC Biology HL /, 'Biology ') + ' | Leaving Cert revision';
    img.src = P.img + '?v=' + V;
    if (before && before.qid !== qid) {
      var ids = chapterList(ch).map(function (x) { return x.id; });
      slide(was, img, before.ch === ch && ids.indexOf(qid) < ids.indexOf(before.qid) ? -1 : 1);
    }
    img.alt = P.label;
    // The 3C target becomes this question's target; 3B's is hidden (bio-desk.css).
    var target = document.querySelector('.geography-focus-target:not(.geography-focus-target--3b)');
    target.setAttribute('data-hf-target', 'question-bio');
    target.setAttribute('aria-label', P.label + ': start the guided walkthrough');
    place(target, P.box);
    partBoxes(target.parentNode, P);
    // The camera fits the whole page to the screen, so the paper is the same size and in the same place on every
    // question. (It used to fit only what was printed, so a half-empty page was zoomed in far more than a full one.)
    var fit = document.querySelector('[data-hf-fit]') || el('div', 'bio-fitbox');
    fit.setAttribute('data-hf-fit', '');
    fit.setAttribute('aria-hidden', 'true');
    fit.style.cssText = 'position:absolute;pointer-events:none;left:0;top:0;width:100%;height:100%';
    if (!fit.parentNode) img.parentNode.appendChild(fit);
    window.ExamHyperFocus.fit();
    addHelper();
    var start = document.querySelector('.geography-focus-start');
    if (start) { start.setAttribute('data-hf-start', 'question-bio'); start.textContent = 'Focus on ' + P.label.replace(/^.*Question\s+/, 'Q'); }
    var acc = document.querySelector('.geography-page-accessible');
    if (acc) acc.innerHTML = '<h1>' + esc(P.label) + '</h1>' + (q.stem ? '<p>' + esc(q.stem) + '</p>' : '') + q.parts.map(function (p) { return '<p>' + esc(p.l + ' ' + p.q) + '</p>'; }).join('');
    window.ExamHyperFocus.use(guideSteps(ch, q));
    bar(ch, qid);
    addSwitch(true, ch);
    // Start the guide once the new page has loaded, so the camera moves over the real paper.
    var go = function () { setTimeout(function () { if (current && current.qid === qid && !current.asked) window.ExamHyperFocus.start('question-bio-ask'); }, 1400); };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  }
  // Going to the next question slides the sheets across the desk: the old one out to the left and the new one in from
  // the right (back: the other way), under the hands, once the new page is ready to show. A copy of the old sheet does
  // the leaving, so the real one (with its boxes and buttons) only ever comes in.
  function slide(was, img, dir) {
    var paper = document.querySelector('.exam-paper:not(.bio-ghost)');
    document.querySelectorAll('.bio-ghost').forEach(function (g) { g.remove(); });
    if (!paper || !paper.animate || !was || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    paper.getAnimations().forEach(function (a) { a.cancel(); });
    var ghost = paper.cloneNode(false), page = el('div', 'bio-ghost__page'), pic = el('img');
    ghost.classList.add('bio-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    pic.alt = '';
    pic.src = was;
    page.appendChild(pic);
    ghost.appendChild(page);
    paper.parentNode.insertBefore(ghost, paper.nextSibling);
    paper.style.visibility = 'hidden';
    var done = false;
    var go = function () {
      if (done || !ghost.isConnected) return;
      done = true;
      var r = paperRect(paper), k = r.width / paper.offsetWidth, vw = window.innerWidth;
      var left = -(r.left + r.width + 60) / k, right = (vw - r.left + 60) / k;
      paper.style.visibility = '';
      paper.style.zIndex = ghost.style.zIndex = '0';
      ghost.animate([{ transform: 'none' }, { transform: 'translateX(' + (dir > 0 ? left : right) + 'px) rotate(' + (-2 * dir) + 'deg)' }],
        { duration: 380, easing: 'cubic-bezier(.55,0,.8,.3)', fill: 'forwards' }).onfinish = function () { ghost.remove(); };
      var come = paper.animate([{ transform: 'translateX(' + (dir > 0 ? right : left) + 'px) rotate(' + (2 * dir) + 'deg)' }, { transform: 'none' }],
        { duration: 460, delay: 110, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'backwards' });
      come.onfinish = come.oncancel = function () { paper.style.zIndex = '2'; };
    };
    (img.decode ? img.decode() : Promise.resolve()).then(go, go);
    setTimeout(go, 900);
  }
  // Where the paper lies on the screen, leaving out a slide in progress (offsets don't count transforms).
  function paperRect(node) {
    var scene = document.querySelector('[data-hf-scene]'), s = scene.getBoundingClientRect(), k = s.width / (scene.offsetWidth || 1);
    return { left: s.left + node.offsetLeft * k, top: s.top + node.offsetTop * k, width: node.offsetWidth * k };
  }
  // The examiner as the help, in the bottom-left corner (the user: "where could you position him so ... it's like you're
  // asking for help", "it feels like he should go to the left"; the answer sheet's examiner stands in the same corner).
  // "Stuck? Click on me.": tapped, he helps with the question himself in his speech bubble, part by part, without taking
  // you anywhere (the user: "the text is supposed to come out of him not take you into what you're supposed to be
  // shown"; tapping him used to start the walkthrough; "make him say less stuff"): a hint, then "Still don't know?" for
  // the answer (helpParts). He talks while a line types out; tapping him again shows the answer, then the next part;
  // the last part's button opens the answer sheet. He slides down out of sight while the walkthrough or an answer sheet
  // is open, and back up after (bio-desk.css).
  // Where he's helping (a "host"): the desk's corner (deskHost) or the answer sheet's own examiner (sheetHost). Each has
  // the element that gets is-helping (box), his speech bubble (say), what talks (talker), and whether it's the sheet.
  var helper = null, deskHost = null, sheetHost = null, host = null, parts = [], at = 0, shown = false, typer = 0, typing = null, lastPart = -1;
  function addHelper() {
    if (!helper) {
      helper = el('div', 'bio-logo bio-helps', '<div class="bio-logo__say" data-bio-say></div><button type="button" class="bio-logo__fig" data-mood="ok" ' +
        'aria-label="Ask the examiner about this question">' + (window.ExamTeacher ? window.ExamTeacher.svg() : '') + '</button>');
      deskHost = { box: helper, say: helper.querySelector('[data-bio-say]'), talker: helper, sheet: false };
      listen(deskHost, '.bio-logo__fig');
      var fig = helper.querySelector('.bio-logo__fig');
      ['mouseenter', 'focus'].forEach(function (t) { fig.addEventListener(t, function () { helper.classList.add('is-talking'); }); });
      ['mouseleave', 'blur'].forEach(function (t) { fig.addEventListener(t, function () { if (!typing) helper.classList.remove('is-talking'); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && host && host.box.classList.contains('is-helping')) help('close', host); });
      // The part you're working on, for the sheet's examiner: the last one you typed or tapped in.
      ['focusin', 'click'].forEach(function (t) {
        document.addEventListener(t, function (e) { var sec = e.target.closest && e.target.closest('.am-root [data-bio-part]'); if (sec) lastPart = +sec.getAttribute('data-bio-part'); });
      });
      document.body.appendChild(helper);
    }
    help('idle', deskHost);
  }
  function listen(h, figure) {
    h.box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bio-help]'), open = h.box.classList.contains('is-helping');
      if (b) help(b.getAttribute('data-bio-help'), h);
      else if (e.target.closest(figure) || (!open && e.target.closest('.bio-logo__say'))) help(open ? 'tap' : 'open', h);
    });
  }
  // On the answer sheet its own examiner (answer-mode.js .am-mascot, bottom left beside the card) helps the same way (the
  // user, of the sheet: "make him have the stuck?"): a "Stuck? Click on me." bubble of his own; tapped, the hint for the
  // part you're working on (the last one you typed or tapped in, else the first in view), then "Still don't know?";
  // moving to another part scrolls the sheet to it. His reactions to Check keep their own bubble (hidden while he helps).
  // He only comes up where there's room beside the card, so not on phones.
  function wireSheet(tries) {
    var m = document.querySelector('.am-root .am-mascot');
    if (!m) { if (tries > 0) setTimeout(function () { wireSheet(tries - 1); }, 100); return; }
    if (m.hasAttribute('data-bio-helps')) return;
    m.setAttribute('data-bio-helps', '');
    m.removeAttribute('aria-hidden');
    m.classList.add('bio-helps');
    var say = el('div', 'bio-logo__say'), face = m.querySelector('.am-mascot__face');
    if (face) face.setAttribute('aria-hidden', 'true');
    m.insertBefore(say, m.firstChild);
    sheetHost = { box: m, say: say, talker: face || m, sheet: true };
    lastPart = -1;
    listen(sheetHost, '.am-mascot__face');
    help('idle', sheetHost);
  }
  function sheetPart() {
    if (lastPart >= 0) return lastPart;
    var secs = document.querySelectorAll('.am-root [data-bio-part]');
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().bottom > 120) return +secs[i].getAttribute('data-bio-part');
    return 0;
  }
  // For each part, a hint first, then, if you still don't know, the answer (the user: "it should be like a hint first and
  // then 'still don't know?'"): the hint is the part's quick check's "hint" (tools/bio/checks/ch<N>.json, written to point
  // at the answer without giving it). The answer for a written part is the check's right answer (which the marker gives
  // the part's marks for; a true-or-false check's why is the answer) and why; for labels, drawings, arrows, taps and
  // true-or-false parts it's the scheme's own points, which cover the whole part (a label check asks about one label).
  function helpParts() {
    var C = current && ((window.BioChecks || {})[current.ch] || {})[current.qid] || [];
    return !current ? [] : current.q.parts.map(function (p, k) {
      var c = C[k] || {}, tf = c.right === 'True' || c.right === 'False';
      var scheme = p.kind !== 'text' && p.pts.length ? p.pts.map(function (t) { return t.a.replace(/\*/g, '').trim(); }).join('; ') : '';
      return { k: k, label: p.l, hint: c.hint || '', answer: scheme || (tf ? c.why : c.right) || '', why: (scheme || !tf) && c.why || '' };
    }).filter(function (x) { return x.answer; });
  }
  function help(what, h) {
    if (h !== host && typing) typing();
    host = h;
    var say = h.say, before = at;
    if (typing && (what === 'next' || what === 'tap')) { typing(); return; }
    clearInterval(typer);
    typing = null;
    if (what === 'idle' || what === 'close' || what === 'answer') {
      h.box.classList.remove('is-helping');
      h.talker.classList.remove('is-talking');
      say.textContent = 'Stuck? Click on me.';
      if (what === 'answer' && !h.sheet) write();
      return;
    }
    if (what === 'open') {
      parts = helpParts();
      var k = h.sheet ? sheetPart() : 0;
      at = Math.max(0, parts.map(function (x) { return x.k; }).indexOf(k));
      shown = false;
      if (current) current.asked = true;
    } else if (what === 'reveal') shown = true;
    else if (what === 'next' || what === 'back') {
      at = Math.max(0, Math.min(parts.length - 1, at + (what === 'back' ? -1 : 1)));
      shown = false;
    } else if (what === 'tap') {
      // Tapping him again: first the answer, then the next part.
      if (!shown) shown = true;
      else if (at < parts.length - 1) { at++; shown = false; }
      else return;
    }
    h.box.classList.add('is-helping');
    // The last part's button: on the desk it opens the answer sheet; on the sheet you're already there.
    var P = parts[at], last = at >= parts.length - 1, x = '<button type="button" class="bio-help__x" data-bio-help="close" aria-label="Close">×</button>';
    var end = h.sheet ? '<button type="button" class="bio-help__next" data-bio-help="close">Done</button>' : '<button type="button" class="bio-help__next" data-bio-help="answer">Answer it</button>';
    if (!P) {
      say.innerHTML = x + '<p class="bio-help__line">Nothing from me on this one. Have a go at it.</p><div class="bio-help__foot"><span class="bio-help__count"></span>' + end + '</div>';
      return;
    }
    if (h.sheet && at !== before && what !== 'open') {
      var sec = document.querySelector('.am-root [data-bio-part="' + P.k + '"]');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Just the part's label: its question is on the paper beside him.
    say.innerHTML = x + '<p class="bio-help__about"><b>' + esc(P.label) + '</b></p>' +
      typedLine('bio-help__line', 'Hint: ', P.hint || 'Have a go first.') +
      (shown ? typedLine('bio-help__line bio-help__answer', 'Answer: ', P.answer) + (P.why ? '<p class="bio-help__why" hidden>' + esc(P.why) + '</p>' : '') :
        '<button type="button" class="bio-help__still" data-bio-help="reveal">Still don\'t know?</button>') +
      '<div class="bio-help__foot"><span class="bio-help__count">' + (parts.length > 1 ? 'Part ' + (at + 1) + ' of ' + parts.length : '') + '</span>' +
      (at ? '<button type="button" class="bio-help__back" data-bio-help="back">Back</button>' : '') +
      (last ? end : '<button type="button" class="bio-help__next" data-bio-help="next">Next part</button>') + '</div>';
    var lines = say.querySelectorAll('.bio-help__typed'), why = say.querySelector('.bio-help__why');
    if (shown) {
      lines[0].innerHTML = said('Hint: ', P.hint || 'Have a go first.', Infinity);
      type(lines[1], 'Answer: ', P.answer, function () { if (why) why.hidden = false; });
    } else type(lines[0], 'Hint: ', P.hint || 'Have a go first.');
  }
  // A line typed out while he talks. The whole line sits unseen underneath, so the bubble is its full size from the
  // first letter.
  function typedLine(cls, lead, text) {
    return '<p class="' + cls + '"><span class="bio-help__full">' + said(lead, text, Infinity) + '</span><span class="bio-help__typed" aria-live="polite"></span></p>';
  }
  function type(node, lead, text, done) {
    var n = lead.length + text.length, i = 0;
    typing = function () {
      clearInterval(typer);
      node.innerHTML = said(lead, text, n);
      typing = null;
      host.talker.classList.remove('is-talking');
      if (done) done();
    };
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { typing(); return; }
    host.talker.classList.add('is-talking');
    typer = setInterval(function () { node.innerHTML = said(lead, text, ++i); if (i >= n) typing(); }, 26);
  }
  // The first n letters of a line, its lead ("Hint:", "Answer:") in bold.
  function said(lead, text, n) {
    var k = Math.min(n, lead.length);
    return (k ? '<b>' + esc(lead.slice(0, k)) + '</b>' : '') + esc(text.slice(0, Math.max(0, n - lead.length)));
  }
  // In the walkthrough he stands in its card beside the title, as the one explaining (the user: "he should be there for
  // when I zoom in"; the corner one slides away then), and talks while the card's text types out (hyper-focus.js gives
  // each letter, a .hf-ch, the class 'on' as it appears).
  function seatInGuide() {
    var top = document.querySelector('.hf-guide .hf-guide__top');
    if (!top || top.querySelector('.bio-guide-fig')) return;
    var fig = el('span', 'bio-guide-fig', window.ExamTeacher ? window.ExamTeacher.svg() : ''), quiet = 0;
    fig.setAttribute('data-mood', 'ok');
    fig.setAttribute('aria-hidden', 'true');
    top.insertBefore(fig, top.firstChild);
    new MutationObserver(function (list) {
      var typed = list.some(function (m) { return m.target.classList && m.target.classList.contains('hf-ch') && m.target.classList.contains('on'); });
      if (!typed) return;
      fig.classList.add('is-talking');
      clearTimeout(quiet);
      quiet = setTimeout(function () { fig.classList.remove('is-talking'); }, 300);
    }).observe(top.parentNode, { subtree: true, attributes: true, attributeFilter: ['class'] });
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
    new MutationObserver(function () { if (document.body.classList.contains('hf-active')) seatInGuide(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
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

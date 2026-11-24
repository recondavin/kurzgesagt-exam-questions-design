// The desk for Computer Science (Higher Level, chapters 6 and 7). Loaded by the desk page (Geography Questions.dc.html):
// for a link like "#cs/6/2024-Q8" it puts that question's real SEC paper page on the desk and the guide (hyper-focus.js)
// goes through it part by part, as the Maths desk does (maths/maths-desk.js, which this is built from). Each part: a
// short line of what to do, "Have a go" (type the answer: one value, an explanation, one per printed prompt, or the
// table's blank cells; cs/cs-mark.js marks it the way the scheme does and shows the points earned), then "Show me how":
// a scene (maths/maths-scenes.js and cs/cs-scenes.js: bits, logic gates, the CPU and its buses, a network, a flowchart,
// an array being sorted...), lines of working or code, and a sentence per step. It ends on a model answer, what the
// marks go for and a tip. Results save per part in cs-q-<chapter>-<id>.
(function () {
  'use strict';
  var PAGE = 'computer-science.html';
  var V = 'cs-5';
  var loaded = {}, current = null, started = false;
  var R = function () { return window.MathsRender; };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function parse() {
    var m = /^#cs\/(\d+)\/(.+)$/.exec(location.hash);
    return m ? { ch: +m[1], qid: decodeURIComponent(m[2]) } : null;
  }
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
    css('lib/katex/katex.min.css');
    css('maths/maths.css');
    css('maths/maths-desk.css');
    css('cs/cs-desk.css');
    css('cs/cs-scenes.css');
    return ['lib/katex/katex.min.js', 'maths/maths-render.js', 'maths/maths-scenes.js', 'cs/cs-scenes.js', 'cs/cs-mark.js', 'cs/papers.js', 'cs/q' + ch + '.js']
      .reduce(function (p, f) { return p.then(function () { return script(f); }); }, Promise.resolve());
  }
  function whenDeskReady() {
    return new Promise(function (done) {
      var tries = 0;
      (function check() {
        if (document.querySelector('.geography-page-image') && window.ExamHyperFocus && window.ExamHyperFocus.use) { done(); return; }
        if (++tries < 300) setTimeout(check, 100);
      })();
    });
  }

  // ---------- results, kept per part ----------
  function key(ch, qid) { return 'cs-q-' + ch + '-' + qid; }
  function load(ch, qid) { try { return JSON.parse(localStorage.getItem(key(ch, qid))) || { parts: {} }; } catch (e) { return { parts: {} }; } }
  function save(ch, qid, k, ok, total, got, max) {
    var s = load(ch, qid), p = s.parts[k] || {};
    if (p.first == null) { p.first = ok; p.firstGot = got; }
    p.best = p.best || ok;
    if (got != null) { p.got = Math.max(p.got || 0, got); p.max = max; }
    p.tries = (p.tries || 0) + 1;
    s.parts[k] = p;
    s.total = total;
    s.at = Date.now();
    try { localStorage.setItem(key(ch, qid), JSON.stringify(s)); } catch (e) {}
  }

  // ---------- one question on the desk ----------
  function chapterList(ch) {
    var P = window.CsPapers || {}, Q = (window.CsQuestions || {})[ch];
    return Q ? Q.questions.filter(function (q) { return P[ch + '/' + q.id]; }) : [];
  }
  function place(node, b) {
    node.style.left = b[0] + '%';
    node.style.top = b[1] + '%';
    node.style.width = b[2] + '%';
    node.style.height = b[3] + '%';
  }
  function part(k) {
    var v = current && current.P.parts && current.P.parts[k], img = document.querySelector('.geography-page-image');
    if (!v || !img) return;
    if (img.getAttribute('src') !== v.img + '?v=' + V) img.src = v.img + '?v=' + V;
  }
  function rest() {
    var img = document.querySelector('.geography-page-image');
    if (current && img && img.getAttribute('src') !== current.P.img + '?v=' + V) img.src = current.P.img + '?v=' + V;
  }
  function partBoxes(shell, P) {
    shell.querySelectorAll('.mx-part-focus').forEach(function (n) { n.remove(); });
    (P.parts || []).forEach(function (v, k) {
      var f = el('div', 'bio-part-focus mx-part-focus');
      f.setAttribute('data-hf-target', 'question-maths-p' + k);
      f.setAttribute('aria-hidden', 'true');
      place(f, v.box);
      shell.appendChild(f);
    });
  }

  // The answer box for one part: one value, an explanation, one box per printed prompt, a table's blank cells, or
  // options to pick; then the marks it gets and the scheme's points it made.
  function field(a, attrs, label) {
    var long = a.type === 'keys';
    return (long ? '<textarea class="mx-try__in cs-try__long" rows="3"' : '<input class="mx-try__in" type="text" autocomplete="off" spellcheck="false"') + attrs +
      ' aria-label="' + esc(label || 'Your answer') + '" placeholder="' + esc(long ? 'Write your answer' : a.type === 'number' ? 'e.g. 4096' : 'Your answer') + '"' + (long ? '></textarea>' : '>');
  }
  function tryHtml(p, k) {
    var a = p.answer || { type: 'none' }, body;
    if (a.type === 'none') return '';
    if (a.type === 'choice') body = '<div class="mx-try__choices">' + a.options.map(function (o, i) { return '<button type="button" class="mx-btn" data-mx-pick="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    else if (a.type === 'fields') body = '<div class="cs-fields">' + (a.fields || []).map(function (f, i) {
      return '<label class="cs-field"><span class="cs-field__label">' + esc(f.label) + '</span>' + field(f.answer || {}, ' data-cs-field="' + i + '"', f.label) + '<span class="cs-field__mark" data-cs-fmark="' + i + '"></span></label>';
    }).join('') + '</div><div class="mx-try__row"><button type="button" class="mx-btn mx-btn--go" data-mx-check>Check</button></div>';
    else if (a.type === 'table') {
      var blanks = {}; (a.blank || []).forEach(function (rc, i) { blanks[rc[0] + ',' + rc[1]] = i; });
      body = '<div class="cs-tablebox"><table class="cs-table">' + (a.head ? '<thead><tr>' + a.head.map(function (h) { return '<th>' + R().inline(h) + '</th>'; }).join('') + '</tr></thead>' : '') + '<tbody>' +
        (a.rows || []).map(function (r, ri) { return '<tr>' + r.map(function (c, ci) { var b = blanks[ri + ',' + ci]; return b == null ? '<td>' + R().inline(String(c)) + '</td>' : '<td class="is-blank"><input class="cs-cell" type="text" autocomplete="off" spellcheck="false" data-cs-cell="' + b + '" aria-label="Row ' + (ri + 1) + ', column ' + (ci + 1) + '"></td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div><div class="mx-try__row"><button type="button" class="mx-btn mx-btn--go" data-mx-check>Check</button></div>';
    } else if (a.type === 'keys') body = '<div class="cs-long">' + field(a, '', 'Your answer') + '</div><div class="mx-try__row"><button type="button" class="mx-btn mx-btn--go" data-mx-check>Check</button></div>';
    else body = '<div class="mx-try__row">' + field(a, '', 'Your answer') + '<button type="button" class="mx-btn mx-btn--go" data-mx-check>Check</button></div>';
    var lead = a.type === 'choice' ? 'Pick one.' : a.type === 'table' ? 'Fill in the blank cells.' : a.type === 'fields' ? 'Fill in each box.' : a.type === 'keys' ? 'Write it as you would in the exam.' : 'Type your answer.';
    return '<div class="mx-try" data-hf-still data-mx-try="' + k + '"><p class="mx-try__lead"><b>Have a go.</b> ' + lead + '</p>' + body +
      '<div class="cs-points" hidden></div><p class="mx-try__say" hidden></p></div>';
  }
  // The steps of one part: the idea (when the part needs one), then the method a step at a time.
  function stepsOf(p) {
    var list = [];
    if (p.idea) list.push({ say: '**' + p.idea.title + '.** ' + p.idea.text, math: [], vis: p.idea.vis, idea: true });
    return list.concat(p.steps || []);
  }
  function sayHtml(s) {
    // **bold** for the idea's name; $...$ maths inline.
    return R().inline(String(s || '').replace(/\*\*([^*]+)\*\*/g, '\u0001$1\u0002')).replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>');
  }
  function guideSteps(ch, q) {
    var parts = q.parts || [];
    return parts.map(function (p, k) {
      var list = stepsOf(p), n = list.length, a = p.answer || {};
      var steps = '<ul class="hf-bullets hf-bullets--steps mx-steps">' + list.map(function (s, i) {
        var math = /\$/.test(s.say || '');
        return '<li data-mx-step="' + i + '"' + (i ? ' data-hf-gate="Next"' : ' class="is-now"') + (math ? ' data-hf-still' : '') + '><span class="hf-bullet-dot"></span><span>' +
          (s.idea ? '' : '<b class="mx-n">' + (i + 1 - (list[0] && list[0].idea ? 1 : 0)) + '</b>') + sayHtml(s.say) + '</span></li>';
      }).join('') + '</ul>';
      var ans = p.model || a.show || (a.type === 'choice' ? a.options[a.value] : a.value != null ? String(a.value) : '');
      var end = '<div class="mx-end" data-hf-still data-hf-gate="The answer" data-mx-end="' + k + '">' +
        (p.marks ? '<span class="mx-end__marks">' + p.marks + ' marks</span>' : '') +
        '<p class="mx-end__ans">' + (ans ? '<span class="cs-end__label">A full-marks answer</span>' + R().inline(ans) : 'Model answer') + '</p>' +
        (p.scheme ? '<p class="mx-end__scheme"><b>The marks go for:</b> ' + R().inline(p.scheme) + '</p>' : '') +
        (p.tip ? '<p class="mx-end__tip"><b>Tip:</b> ' + R().inline(p.tip) + '</p>' : '') + '</div>';
      var step = {
        id: 'question-maths-' + k, target: 'question-maths', focus: current.P.parts && current.P.parts[k] ? 'question-maths-p' + k : null,
        enter: function () { part(k); },
        motion: '.geography-page-shell', kicker: '', title: q.topic || 'Question ' + q.q, summary: 'Part ' + p.l, summaryStill: true, spotlight: true, voice: [], prose: '', points: [],
        // What you have to do, in one plain line (the question itself is on the paper beside it, lit up); a part
        // without its short line shows the question as printed.
        visual: (p.ask ? '<div class="mx-q mx-q--ask" data-hf-still>' + R().inline(p.ask) + (p.marks ? ' <span class="mx-q__marks">' + p.marks + ' marks</span>' : '') + '</div>'
          : '<div class="mx-q" data-hf-still>' + R().inline(p.q) + (p.marks ? ' <b>(' + p.marks + ')</b>' : '') + '</div>') + tryHtml(p, k) +
          (n ? '<div class="mx-stage" data-hf-still data-hf-gate="Show me how" data-mx-stage="' + k + '"><div class="mx-pace">' + list.map(function (s, i) {
            return '<span class="mx-pace__seg' + (i ? '' : ' is-now') + '" data-mx-seg="' + i + '"></span>';
          }).join('') + '</div><div class="mx-visbox"></div><div class="mx-boardhost"></div></div>' + steps : '') + end
      };
      if (k === parts.length - 1) step.finish = function (rect, exit) { exit(); done(); };
      return step;
    });
  }
  // A page of a part's card opens (hyper-focus.js 'hf-page'): the board shows that step.
  function stageFor(node) { var v = node.closest('.hf-guide__visual'); return v && v.querySelector('.mx-stage'); }
  function showStep(stage, i) {
    if (!current || !stage) return;
    var k = +stage.getAttribute('data-mx-stage'), p = current.q.parts[k], list = stepsOf(p), s = list[i];
    if (!s) return;
    var host = stage.querySelector('.mx-boardhost');
    if (!stage.board) { stage.board = new (R().Board)(el('div')); host.appendChild(stage.board.host); }
    stage.board.step(s.math || []);
    if (s.code) {
      // Code or pseudocode the step talks about, its lines numbered; the ones it's about (codeHl) glow.
      var hlL = (s.codeHl || []).map(Number), pre = el('pre', 'cs-code');
      pre.innerHTML = String(s.code).replace(/\s+$/, '').split('\n').map(function (ln, j) { return '<span class="cs-code__ln' + (hlL.indexOf(j + 1) >= 0 ? ' is-hl' : '') + '"><i>' + (j + 1) + '</i>' + esc(ln) + '</span>'; }).join('');
      stage.board.host.appendChild(pre);
      if (pre.animate && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) pre.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, fill: 'backwards' });
    }
    var vis = s.vis || null;
    // A step with no picture of its own keeps the last one shown (it's still the same graph or solid). A step's picture
    // builds on the last one: what was already there stays still and only what's new animates.
    if (vis || i === 0) {
      var box = stage.querySelector('.mx-visbox');
      box.innerHTML = '';
      var v = vis && R().vis(vis, i === 0 ? {} : stage.seen);
      if (v) { box.appendChild(v); v.play(); stage.seen = v.keys; } else stage.seen = {};
    }
    stage.querySelectorAll('[data-mx-seg]').forEach(function (g) {
      var j = +g.getAttribute('data-mx-seg');
      g.classList.toggle('is-now', j === i);
      g.classList.toggle('is-done', j < i);
    });
    var card = stage.closest('.hf-guide__visual');
    card.querySelectorAll('.mx-steps > li').forEach(function (li) { li.classList.toggle('is-now', +li.getAttribute('data-mx-step') === i); });
    var content = card.closest('.hf-guide__content');
    if (content && i === 0) content.scrollTop = 0;
  }
  function check(box, pick) {
    var k = +box.getAttribute('data-mx-try'), p = current.q.parts[k], a = p.answer, say = box.querySelector('.mx-try__say');
    var input;
    if (pick != null) input = pick;
    else if (a.type === 'fields') input = Array.prototype.map.call(box.querySelectorAll('[data-cs-field]'), function (n) { return n.value; });
    else if (a.type === 'table') { input = []; box.querySelectorAll('[data-cs-cell]').forEach(function (n) { input[+n.getAttribute('data-cs-cell')] = n.value; }); }
    else { var inp = box.querySelector('.mx-try__in'); input = inp && inp.value; }
    var res = window.CsMark.check(a, input, p.marks);
    if (res.error) { say.hidden = false; say.innerHTML = esc(res.error); return; }
    if (res.ok == null) return;
    save(current.ch, current.qid, k, res.ok, current.q.parts.length, res.got, res.max);
    box.classList.add('is-done');
    box.classList.toggle('is-right', !!res.ok);
    if (a.type === 'choice') box.querySelectorAll('[data-mx-pick]').forEach(function (b) {
      var i = +b.getAttribute('data-mx-pick');
      b.classList.toggle('is-right', i === a.value);
      b.classList.toggle('is-wrong', i === pick && i !== a.value);
    });
    // What the marker found: the scheme's points made (or each box, each cell).
    var pts = box.querySelector('.cs-points'), html = '';
    if (a.type === 'keys') html = (a.points || []).map(function (pt, i) { return '<li class="' + (res.points[i] ? 'is-hit' : '') + '">' + (res.points[i] ? '✓ ' : '') + R().inline(pt.text || '') + '</li>'; }).join('');
    if (a.type === 'fields') (res.fields || []).forEach(function (r, i) {
      var m = box.querySelector('[data-cs-fmark="' + i + '"]');
      if (m) { m.textContent = r.ok ? '✓' : '✗'; m.className = 'cs-field__mark ' + (r.ok ? 'is-right' : 'is-wrong'); }
    });
    if (a.type === 'table') (res.cells || []).forEach(function (ok, i) { var c = box.querySelector('[data-cs-cell="' + i + '"]'); if (c) c.parentNode.classList.add(ok ? 'is-right' : 'is-wrong'); });
    if (html) { pts.hidden = false; pts.innerHTML = '<p>The scheme\'s points' + ((a.need || 0) < (a.points || []).length ? ' (any ' + a.need + ')' : '') + ':</p><ul>' + html + '</ul>'; }
    say.hidden = false;
    var score = res.max ? ' <span class="cs-score">' + res.got + ' / ' + res.max + ' marks</span>' : '';
    say.innerHTML = res.ok ? '<b class="is-right">Right!</b>' + score + ' Press Show me how to see why.'
      : '<b class="is-wrong">Not quite.</b>' + score + ' ' + esc(res.note || '') + ' Press Show me how and follow it step by step.';
    if (window.ExamHyperFocus && window.ExamHyperFocus.follow) window.ExamHyperFocus.follow(say);
  }

  // The last part done: how it went, and the next question.
  function done() {
    var old = document.querySelector('.mx-donecard');
    if (old) old.remove();
    var s = load(current.ch, current.qid), n = current.q.parts.length, tried = 0, right = 0;
    Object.keys(s.parts).forEach(function (k) { tried++; if (s.parts[k].first) right++; });
    var list = chapterList(current.ch), at = list.map(function (x) { return x.id; }).indexOf(current.qid), next = list[at + 1];
    var card = el('div', 'mx-donecard');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Question done');
    card.innerHTML = '<p class="mx-donecard__title">' + (tried ? right + ' of ' + n + ' parts right first time' : 'Question explained') + '</p>' +
      '<div class="mx-donecard__row"><button type="button" class="mx-btn" data-mx-again>Go through it again</button>' +
      (next ? '<a class="mx-btn mx-btn--go" href="#cs/' + current.ch + '/' + encodeURIComponent(next.id) + '">Next question</a>' : '<a class="mx-btn mx-btn--go" href="' + PAGE + '#ch' + current.ch + '">Back to the chapter</a>') + '</div>';
    document.body.appendChild(card);
  }
  function show(ch, qid) {
    var P = (window.CsPapers || {})[ch + '/' + qid], Q = (window.CsQuestions || {})[ch];
    var q = Q && Q.questions.filter(function (x) { return x.id === qid; })[0];
    if (!P || !q) { location.href = PAGE + '#ch' + ch; return; }
    var dc = document.querySelector('.mx-donecard');
    if (dc) dc.remove();
    var img = document.querySelector('.geography-page-image');
    current = { ch: ch, qid: qid, q: q, P: P };
    if (window.ExamHyperFocus) window.ExamHyperFocus.exit();
    document.body.classList.add('maths-desk');
    document.title = 'Computer Science ' + q.year + ' Q' + q.q + ' | Leaving Cert revision';
    img.src = P.img + '?v=' + V;
    img.alt = P.label;
    var target = document.querySelector('.geography-focus-target:not(.geography-focus-target--3b)');
    target.setAttribute('data-hf-target', 'question-maths');
    target.setAttribute('aria-label', P.label + ': start the guided walkthrough');
    place(target, P.box);
    partBoxes(target.parentNode, P);
    var fit = document.querySelector('[data-hf-fit]') || el('div', 'bio-fitbox');
    fit.setAttribute('data-hf-fit', '');
    fit.setAttribute('aria-hidden', 'true');
    fit.style.cssText = 'position:absolute;pointer-events:none;left:0;top:0;width:100%;height:100%';
    if (!fit.parentNode) img.parentNode.appendChild(fit);
    window.ExamHyperFocus.fit();
    var start = document.querySelector('.geography-focus-start');
    if (start) { start.setAttribute('data-hf-start', 'question-maths'); start.textContent = 'Focus on Q' + q.q; }
    var acc = document.querySelector('.geography-page-accessible');
    if (acc) acc.innerHTML = '<h1>' + esc(P.label) + '</h1>' + (q.stem ? '<p>' + esc(q.stem) + '</p>' : '') + q.parts.map(function (p) { return '<p>' + esc(p.l + ' ' + p.q) + '</p>'; }).join('');
    window.ExamHyperFocus.use(guideSteps(ch, q));
    bar(ch, qid);
    var go = function () { setTimeout(function () { if (current && current.qid === qid) window.ExamHyperFocus.start('question-maths-0'); }, 1200); };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  }
  function bar(ch, qid) {
    var old = document.querySelector('.bio-deskbar');
    if (old) old.remove();
    var list = chapterList(ch), at = list.map(function (q) { return q.id; }).indexOf(qid), prev = list[at - 1], next = list[at + 1];
    var Q = (window.CsQuestions || {})[ch], q = list[at];
    var b = el('div', 'bio-deskbar mx-deskbar');
    b.innerHTML = '<a class="bio-deskbar__back" href="' + PAGE + '#ch' + ch + '">' + esc(Q ? Q.title : 'Chapter ' + ch) + '</a>' +
      '<span class="bio-deskbar__where">' + (q ? q.year + ' Q' + q.q + ' · ' : '') + (at + 1) + ' of ' + list.length + '</span>' +
      (prev ? '<a class="bio-deskbar__btn" href="#cs/' + ch + '/' + encodeURIComponent(prev.id) + '" aria-label="Previous question">‹</a>' : '') +
      (next ? '<a class="bio-deskbar__btn" href="#cs/' + ch + '/' + encodeURIComponent(next.id) + '" aria-label="Next question">›</a>' : '') +
      '<button type="button" class="bio-deskbar__write" data-mx-again>Explain it</button>';
    document.body.appendChild(b);
  }

  function route() {
    var r = parse();
    if (!r) { if (started) location.reload(); return; }
    started = true;
    loadChapter(r.ch).then(whenDeskReady).then(function () { show(r.ch, r.qid); });
  }
  function init() {
    route();
    window.addEventListener('hashchange', route);
    document.addEventListener('hf-exit', rest);
    document.addEventListener('hf-page', function (e) {
      if (!current) return;
      var t = e.target;
      // Showing the method: the answer box has done its job, so the question stays in view above the working.
      if (t.hasAttribute && t.hasAttribute('data-mx-stage')) { var vis = t.closest('.hf-guide__visual'), box = vis && vis.querySelector('.mx-try'); if (box) box.classList.add('is-put-away'); showStep(t, 0); }
      else if (t.hasAttribute && t.hasAttribute('data-mx-step')) showStep(stageFor(t), +t.getAttribute('data-mx-step'));
      else if (t.hasAttribute && t.hasAttribute('data-mx-end')) { var st = stageFor(t); if (st) st.querySelectorAll('[data-mx-seg]').forEach(function (g) { g.classList.remove('is-now'); g.classList.add('is-done'); }); }
    });
    document.addEventListener('click', function (e) {
      if (!current) return;
      var c = e.target.closest('[data-mx-check]');
      if (c) check(c.closest('.mx-try'));
      var pick = e.target.closest('[data-mx-pick]');
      if (pick && !pick.closest('.mx-try').classList.contains('is-done')) check(pick.closest('.mx-try'), +pick.getAttribute('data-mx-pick'));
      if (e.target.closest('[data-mx-again]')) {
        var dc = document.querySelector('.mx-donecard');
        if (dc) dc.remove();
        window.ExamHyperFocus.start('question-maths-0');
      }
    });
    // Typing an answer: Enter checks it, and no key reaches the guide's own shortcuts.
    document.addEventListener('keydown', function (e) {
      var input = e.target.closest && e.target.closest('.mx-try__in');
      if (!input) return;
      e.stopPropagation();
      if (e.key === 'Enter' && (input.tagName !== 'TEXTAREA' || e.ctrlKey || e.metaKey)) { e.preventDefault(); check(input.closest('.mx-try')); }
    }, true);
  }
  window.CsDesk = { show: show };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

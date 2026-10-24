// Exam drill (the user: "look through all of the exam questions, the short ones ... and maybe short diagram ones from
// real Leaving Cert diagrams, and also look at what's predicted to come next year and make short questions on those,
// and format them like an exam, and make it so that you choose an answer and if you get it right then later on the
// question comes and you have to type it ... and if you get a question wrong it has to come up later again as a box").
// Every question goes through two stages:
//   box    tick one of four boxes. Right: it comes back later (five cards on, or next time) to be typed. Wrong: you see
//          the answer and why, and it comes back later (three cards on) as boxes again.
//   type   type the answer, marked like the answer sheet against the question's scheme points. Full marks: learnt.
//          Not: you see the answer and why, and it goes back to boxes (three cards on).
// The box marked right always gets full marks in the exam, and no wrong box does (tools/bio/tests/drill.mjs): the
// marker reads words, not their order, so a wrong box that only swaps a direction ("more ADH" / "less ADH") would pass
// typed, and those questions are left out.
// Where the questions come from, for each chapter:
//   exam      the real papers' short parts (2004 to 2026 and the 2027 sample papers), through their quick checks
//             (tools/bio/checks/ch<N>.json): ones that make sense alone, with a right answer up to 70 letters and one
//             or two points; a check that asks for less than the whole part (a 9-mark part asked for two points) is the
//             part made a little easier ("Based on ...").
//   diagram   the real exam diagrams of Label sprint (bio/sprint.js): "Name the part labelled A." (the paper's letter, or
//             our marker with a letter the diagram doesn't print).
//   new       questions on what no exam has asked yet (the new course's untested topics, the likeliest to come next),
//             written in the exam's style with their own scheme points: tools/bio/drill/ch<N>.json, bio/drill.js.
// Progress is kept in this browser (localStorage 'bio-drill': each question's stage).
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit, BB = window.BioBoard;
  if (!K || !BK || !BB) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick;
  var CH = BB.chapters, NAME = BB.names, COL = BB.colours;
  var NEW_PER = 8, CARDS = 15, LATER = { type: 5, again: 3 };
  // Labels that describe a process, not a part, can't be asked as "the part labelled X" (as in bio-quick.js).
  var NOT_A_PART = /^\d+\.|:|diffuses|entering|^Cut |^Blood (from|to) /;
  // Only what the 2025 specification covers: exam parts that test a learning outcome, less the parts and diagram labels
  // tools/bio/drill/off_spec.json lists (they ask for something the specification doesn't name).
  var OFF = window.BioDrillOff || { labels: [], parts: {} };
  function offPart(ch, id) { return (OFF.parts[ch] || []).indexOf(id) >= 0; }
  function offLabel(t) { return OFF.labels.indexOf(t) >= 0; }
  var D = null;
  function live() { return D && D.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }
  function q(sel) { return D.card.querySelector(sel); }

  // ======================================================================== the questions
  function B() { return window.BioApp; }
  // The points an answer earns on a question's scheme points (the marker's rule, as bio.js checks a typed answer).
  function earner(pts) {
    return function (text) { var w = B().words(text || ''); return pts.filter(function (p) { return p.k && B().hasPoint(p, w); }).length; };
  }
  function plain(t) { return String(t).replace(/\s*\(((\d+|one|two|three) of )?\d+ points?\)\s*$/i, ''); }
  // Where a real question is from, as the papers number it: "2014 · Question 12(c)(ii)", "Sample Paper 1 (2027) · ...".
  function where(q, label) {
    var m = q.id.match(/^(?:(\d{4})|S(\d))-Q(\d+)([a-z]?)/);
    if (!m) return q.src;
    return (m[1] || 'Sample Paper ' + m[2] + ' (2027)') + ' \u00b7 Question ' + m[3] + (m[4] ? '(' + m[4] + ')' : '') + label.replace(/\s+/g, '').replace(/\.$/, '');
  }
  function examItems(ch) {
    var Q = ((window.BioQuestions || {})[ch] || {}).questions || [], C = (window.BioChecks || {})[ch] || {}, out = [];
    Q.forEach(function (q) {
      q.parts.forEach(function (p, k) {
        var c = (C[q.id] || [])[k];
        if (!c || !p.out || offPart(ch, q.id + ':' + k) || p.kind !== 'text' || c.board === false || /^(True|False)$/.test(c.right) || c.right.length > 70) return;
        var keyed = p.pts.filter(function (t) { return t.k && !t.self; });
        if (!keyed.length) return;
        var asked = c.q.match(/\((\d) points\)$/), full = Math.min(p.n || 1, keyed.length), need = Math.min(asked ? +asked[1] : 1, full);
        if (need > 2) return;
        var per = p.m && p.n ? p.m / p.n : keyed[0].m || 3;
        var it = { id: 'e' + ch + ':' + q.id + ':' + k, kind: 'exam', ch: ch, from: (need < full ? 'Based on ' : '') + where(q, p.l),
          q: plain(typeof c.board === 'string' ? c.board : c.q), marks: Math.round(per * need), need: need, pts: keyed, right: c.right, wrong: c.wrong.slice(), why: c.why };
        it.earned = earner(keyed);
        if (it.earned(it.right) < need || it.wrong.some(function (w) { return it.earned(w) >= need; })) return;
        out.push(it);
      });
    });
    return out;
  }
  // Diagram questions name a part by a letter. The paper's own letter where its question says which part it is ("A:
  // Capillary"); otherwise our marker on the part, with a letter the diagram doesn't print (its own A, B, X, Y stay).
  var OWN = ['P', 'Q', 'R', 'S', 'T', 'Z', 'W'];
  function diagramItems(ch) {
    var S = (window.BioSprint || {})[ch] || [], Q = ((window.BioQuestions || {})[ch] || {}).questions || [], names = [], out = [];
    S.forEach(function (r) { r.spots.forEach(function (s) { if (!NOT_A_PART.test(s.t) && !offLabel(s.t) && names.indexOf(s.t) < 0) names.push(s.t); }); });
    S.forEach(function (r) {
      var q = Q.filter(function (x) { return x.id === r.q; })[0], printed = {};
      if (q) q.parts.forEach(function (p) { p.pts.forEach(function (t) { if (t.f && /^[A-Z]$/.test(t.f) && t.k) printed[t.f] = t; }); });
      var free = OWN.filter(function (l) { return !printed[l]; });
      // Each printed letter goes to a part whose name earns its scheme point and hasn't a letter yet, the closest name if
      // more than one does.
      var own = {};
      Object.keys(printed).forEach(function (f) {
        var best = null, said = B().words(printed[f].a);
        r.spots.forEach(function (o, oi) {
          if (NOT_A_PART.test(o.t) || own[oi] != null || !B().hasPoint(printed[f], B().words(o.t))) return;
          var w = B().words(o.t), score = w.filter(function (x) { return said.indexOf(x) >= 0; }).length / w.length;
          if (!best || score > best.score) best = { i: oi, score: score };
        });
        if (best) own[best.i] = f;
      });
      r.spots.forEach(function (s, si) {
        if (NOT_A_PART.test(s.t) || offLabel(s.t)) return;
        // A printed letter's part is marked by its own scheme point; ours by the part's name, every word of it.
        var letter = own[si], w = B().words(s.t), pts = letter ? [printed[letter]] : [{ a: s.t, k: [{ w: w, n: w.length }] }], earned = earner(pts);
        // Wrong boxes: the diagram's other parts first, then the chapter's.
        var same = r.spots.map(function (o) { return o.t; }).filter(function (t) { return t !== s.t && !NOT_A_PART.test(t) && !offLabel(t); });
        var wrong = [];
        shuffle(same).concat(shuffle(names)).forEach(function (t) { if (wrong.length < 3 && t !== s.t && wrong.indexOf(t) < 0 && !earned(t)) wrong.push(t); });
        if (wrong.length < 3) return;
        var paper = r.src.replace(/^From the /, ''), L = letter || free[0];
        var it = { id: 'd' + ch + ':' + r.q + ':' + si, kind: 'diagram', ch: ch, from: paper.replace(/^(\d{4}) exam paper$/, '$1 exam paper \u00b7 diagram'),
          q: 'Name the part labelled ' + L + '.', marks: 3, need: 1, pts: pts, right: s.t, wrong: wrong, why: 'On this diagram from the ' + paper + ', ' + L + ' is the ' + s.t + '.', fig: r, spot: si, letter: L, mark: !letter };
        it.earned = earned;
        out.push(it);
      });
    });
    return out;
  }
  function newItems(ch) {
    return ((window.BioDrillNew || {})[ch] || []).map(function (n) {
      var it = { id: 'n' + ch + ':' + n.id, kind: 'new', ch: ch, from: 'Practice question (not from a real paper) · not asked in an exam yet', q: n.q, marks: n.marks, need: n.need,
        pts: n.pts, right: n.right, wrong: n.wrong.slice(), why: n.why };
      it.earned = earner(n.pts);
      return it;
    });
  }
  function items(ch) { return examItems(ch).concat(diagramItems(ch), newItems(ch)); }

  // ======================================================================== progress
  // Each question's stage: 'box' (answer it by ticking, after a wrong one), 'type' (ticked right: type it next) or
  // 'done' (typed with full marks). Not there: not met yet.
  function load() { try { return JSON.parse(K.store('bio-drill') || '{}') || {}; } catch (e) { return {}; } }
  function save(st) { K.store('bio-drill', JSON.stringify(st)); }
  function counts(ch) {
    var st = load(), c = { all: 0, done: 0, type: 0, box: 0 };
    items(ch).forEach(function (it) { c.all++; var s = st[it.id] && st[it.id].s; if (s) c[s]++; });
    return c;
  }

  // ======================================================================== the drill
  function open(ch) {
    D = { card: BK.host(ch || 28, 'Exam drill') };
    K.gameHud(D.card, 0, '');
    if (ch) { start(ch); return; }
    show('<div class="am-games__end ed-start"><h3 class="am-games__title">Exam drill</h3>' +
      '<p class="am-games__sub">Short exam questions: the real papers\' (and their diagrams), and new ones on what no exam has asked yet. Tick the right box first; get it right and it comes back later for you to type. Get it wrong and it comes back as boxes.</p>' +
      '<div class="dsi-chs">' + CH.map(function (c) {
        var n = counts(c);
        return '<button type="button" class="tb-pick" data-ed-ch="' + c + '" style="--c:' + COL[c] + '"><span class="tb-pick__ch">' + esc(NAME[c]) + '</span>' +
          '<span class="tb-pick__what">' + n.all + ' questions · ' + n.done + ' learnt' + (n.type ? ' · ' + n.type + ' to type' : '') + '</span></button>';
      }).join('') + '</div></div>');
    K.mascot('ok', 'Tick it first. Then type it.');
  }
  function show(html, close) {
    BK.body(D.card, html, true);
    D.card.querySelector('.am-finish__card').classList.add('tb-wide');
    BK.buttons(D.card, close || [['more', 'data-am-keep', 'Close']], true);
    BB.nearMascot(D.card);
  }
  // A session: questions to type first met right last time, the ones you got wrong, then up to eight new ones, mixed;
  // fifteen cards, with each answered one coming back in the session where it's due.
  function start(ch) {
    var all = items(ch), st = load(), by = function (s) { return shuffle(all.filter(function (it) { return st[it.id] && st[it.id].s === s; })); };
    var type = by('type').slice(0, 5), box = by('box').slice(0, 4), fresh = shuffle(all.filter(function (it) { return !st[it.id]; })).slice(0, NEW_PER);
    var queue = [];
    type.forEach(function (it) { queue.push({ it: it, stage: 'type' }); });
    box.concat(fresh).forEach(function (it) { queue.push({ it: it, stage: 'box' }); });
    D.ch = ch;
    D.queue = shuffle(queue);
    D.shown = 0;
    D.tally = { learnt: 0, toType: 0, again: 0, right: 0 };
    D.total = all.length;
    K.gameHud(D.card, Math.min(CARDS, D.queue.length), '');
    if (!D.queue.length) { finish(); return; }
    next();
  }
  function next() {
    if (!D.queue.length || D.shown >= CARDS) { finish(); return; }
    var c = D.queue.shift();
    D.cur = c;
    D.phase = 'ask';
    D.shown += 1;
    K.gameSeg(D.card, D.shown - 1, 'is-current');
    var it = c.it, typed = c.stage === 'type';
    show('<div class="ed"><p class="ed-stage' + (typed ? ' is-type' : '') + '">' + (typed ? 'Now type it: you ticked this right before' : 'Tick the right box') + '</p>' +
      '<div class="ed-paper" style="--c:' + COL[it.ch] + '"><p class="ed-from">' + esc(it.from) + '</p>' +
      (it.fig ? figure(it) : '') +
      '<p class="tb-q ed-q">' + esc(it.q) + '</p><p class="ed-marks">[' + it.marks + ' marks]</p>' +
      (typed
        ? '<textarea class="ed-lines" data-ed-text rows="3" placeholder="Write your answer" aria-label="Your answer"></textarea>' +
          '<div class="tb-row ed-row"><button type="button" class="tb-btn tb-btn--go" data-ed-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-ed-pass>I don\'t know</button></div>'
        : '<div class="tb-opts ed-boxes">' + shuffle([it.right].concat(it.wrong)).map(function (o) {
          return '<button type="button" class="ed-box" data-ed-opt="' + esc(o) + '"><i aria-hidden="true"></i><span>' + esc(o) + '</span></button>';
        }).join('') + '</div>') +
      '<div class="qg-after" data-ed-after></div></div></div>');
    BB.reveal(q('.ed-paper'), function () { var t = q('[data-ed-text]'); if (t) t.focus({ preventScroll: true }); });
  }
  // A real exam diagram cut from its page (as in Label sprint), its printed names covered, and an X on the part.
  function figure(it) {
    var r = it.fig, P = [2055, 2908], px = function (x, y) { return [x * P[0] / 100, y * P[1] / 100]; }, n = function (v) { return v.toFixed(1); };
    var a = px(r.box[0], r.box[1]), b = px(r.box[2], r.box[3]), s = px(r.spots[it.spot].at[0], r.spots[it.spot].at[1]), k = b[0] / 480;
    return '<div class="ed-fig"><svg viewBox="' + [a[0], a[1], b[0], b[1]].map(n).join(' ') + '" role="img"><title>' + esc(r.src) + '</title>' +
      '<image href="' + esc(r.img) + '" width="' + P[0] + '" height="' + P[1] + '" preserveAspectRatio="none"/>' +
      (r.cover || []).map(function (c) { var p = px(c[0], c[1]), q2 = px(c[2], c[3]); return '<rect x="' + n(p[0]) + '" y="' + n(p[1]) + '" width="' + n(q2[0]) + '" height="' + n(q2[1]) + '" fill="' + (c[4] || '#FFFFFF') + '"/>'; }).join('') +
      (it.mark ? '<circle cx="' + n(s[0]) + '" cy="' + n(s[1]) + '" r="' + n(15 * k) + '" fill="#13294A" stroke="#FFFFFF" stroke-width="' + n(3 * k) + '"/>' +
        '<text x="' + n(s[0]) + '" y="' + n(s[1]) + '" font-size="' + n(18 * k) + '" font-family="Nunito, sans-serif" font-weight="800" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">' + it.letter + '</text>' : '') + '</svg></div>';
  }
  function choose(btn) {
    if (D.phase !== 'ask') return;
    var c = D.cur, it = c.it, mine = btn.getAttribute('data-ed-opt'), ok = mine === it.right;
    D.card.querySelectorAll('[data-ed-opt]').forEach(function (b) {
      var o = b.getAttribute('data-ed-opt');
      b.disabled = true;
      if (o === it.right) b.classList.add('is-ok');
      else if (o === mine) b.classList.add('is-no');
    });
    // Right: type it later. Wrong: boxes again later.
    answered(ok, ok ? 'type' : 'box', ok ? '' : 'You ticked: ' + mine);
  }
  function check(pass) {
    if (D.phase !== 'ask') return;
    var it = D.cur.it, box = q('[data-ed-text]'), text = pass ? '' : (box.value || '').trim();
    if (!pass && !text) { box.focus(); return; }
    var got = text ? it.earned(text) : 0, ok = got >= it.need;
    box.disabled = true;
    var row = q('.ed-row');
    if (row) row.remove();
    answered(ok, ok ? 'done' : 'box', text ? 'You wrote: ' + text + (ok ? '' : ' (' + Math.round(got * it.marks / it.need) + ' of ' + it.marks + ' marks)') : '');
  }
  function answered(ok, stage, mine) {
    D.phase = 'shown';
    var c = D.cur, it = c.it, st = load(), typed = c.stage === 'type';
    st[it.id] = { s: stage, t: Date.now() };
    save(st);
    if (ok) D.tally.right++;
    if (stage === 'done') D.tally.learnt++;
    else if (stage === 'type') D.tally.toType++;
    else D.tally.again++;
    // Back into this session where it's due: to type five cards on, or boxes again three cards on.
    if (stage !== 'done') D.queue.splice(Math.min(D.queue.length, stage === 'type' ? LATER.type : LATER.again), 0, { it: it, stage: stage });
    K.gameSeg(D.card, D.shown - 1, ok ? 'is-ok' : 'is-no');
    if (ok) K.ding(typed ? 4 : 2, true); else K.bonk();
    K.mascot(ok ? (typed ? 'angry' : 'ok') : 'happy', ok ? (typed ? 'Full marks. Hmph.' : 'Right. You\'ll type it later.') : (typed ? 'Not full marks. Boxes again.' : 'Wrong. It\'ll come back.'));
    // The scheme's points (a star in the scheme means only that exact term is accepted).
    var scheme = it.kind === 'diagram' ? '' : '<p class="ed-scheme"><span>Marking scheme</span>' + it.pts.slice(0, Math.max(it.need, 3)).map(function (p) {
      var star = /\*/.test(p.a);
      return esc(p.a.replace(/\*/g, '')) + (star ? ' <em>(only this term)</em>' : '') + (p.accept && p.accept.length ? ' <em>(accept: ' + esc(p.accept.join('; ')) + ')</em>' : '');
    }).join('<br>') + (it.need < it.pts.length ? '<br><em>Any ' + it.need + ' for full marks.</em>' : '') + '</p>';
    q('[data-ed-after]').innerHTML = '<p class="tb-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + (typed ? (ok ? 'Full marks: ' + it.marks + '/' + it.marks : 'Not full marks') : ok ? 'Right' : 'Not quite') + '</p>' +
      (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>' + (typed || !ok ? 'A full-marks answer' : 'Answer') + '</span>' + esc(it.right) + '</p>' + scheme +
      '<p class="tb-why"><span>Why</span>' + esc(it.why) + '</p>' +
      '<p class="ed-later">' + (stage === 'done' ? 'Learnt.' : stage === 'type' ? 'It\'ll come back for you to type.' : 'It\'ll come back as boxes.') + '</p>';
    var r = document.createElement('div');
    r.className = 'tb-row tb-row--next';
    r.innerHTML = '<button type="button" class="tb-btn tb-btn--go" data-ed-next>' + (D.shown >= CARDS || !D.queue.length ? 'See how you did' : 'Next question') + '</button>';
    q('.ed-paper').appendChild(r);
    r.querySelector('button').focus({ preventScroll: true });
    if (r.scrollIntoView) r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function finish() {
    D.phase = 'over';
    var n = counts(D.ch), t = D.tally;
    show('<div class="am-games__end"><h3 class="am-games__title">' + (D.shown ? t.right + ' of ' + D.shown + ' right' : 'All caught up') + '</h3>' +
      '<p class="am-games__sub">' + (D.shown ? 'Learnt (typed with full marks): ' + t.learnt + '. To type next time: ' + t.toType + '. Back as boxes: ' + t.again + '.' : 'Nothing new or due in this chapter.') + '</p>' +
      '<ul class="pts-rows"><li class="pts-row" style="--c:' + COL[D.ch] + '"><span class="pts-row__n">' + esc(NAME[D.ch]) + '</span><b class="num">' + n.done + '/' + n.all + '</b>' +
      '<span class="pts-row__note">learnt · ' + n.type + ' to type · ' + n.box + ' to retry · ' + (n.all - n.done - n.type - n.box) + ' not met yet</span></li></ul></div>',
      [['more', 'data-am-keep', 'Close'], ['ok', 'data-ed-again', 'Keep going']]);
    K.mascot('ok', t.right >= D.shown * 0.8 ? 'Hmph. Not bad.' : 'Again. Until you can type them.');
  }

  document.addEventListener('click', function (e) {
    if (!live() || !D.card.contains(e.target)) return;
    var t;
    if ((t = e.target.closest('[data-ed-ch]'))) { start(+t.getAttribute('data-ed-ch')); return; }
    if ((t = e.target.closest('[data-ed-opt]'))) { choose(t); return; }
    if (e.target.closest('[data-ed-check]')) { check(false); return; }
    if (e.target.closest('[data-ed-pass]')) { check(true); return; }
    if (e.target.closest('[data-ed-next]') && D.phase === 'shown') { next(); return; }
    if (e.target.closest('[data-ed-again]')) { start(D.ch); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (!live() || e.key !== 'Enter' || e.shiftKey || !e.target.closest || !e.target.closest('[data-ed-text]')) return;
    e.preventDefault();
    check(false);
  });
  window.addEventListener('resize', function () { if (live()) BB.nearMascot(D.card); });
  window.BioDrill = { open: open, items: items, counts: counts, state: function () { return D; } };
})();

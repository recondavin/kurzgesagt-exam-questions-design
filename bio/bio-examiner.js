// Be the examiner for Biology, in answer-mode.js's practice host (cards, the examiner, sounds).
// A made-up student's answer to a real exam part, one line each (BioLearn[ch].examiner). You tick each line that
// earns marks and cross the rest. The marker decides, reading the answer in order like an examiner: a line earns
// when it makes a scheme point the lines before it haven't, until the part has all the points it asks for.
// Then Fix it: rewrite the lines that got nothing so each earns a point the answer doesn't have yet.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, pick = BK.pick, buttons = BK.buttons, body = BK.body;
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  var CROSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var X = null;
  function BA() { return window.BioApp; }

  // Which scheme points each line earns, in order. hits: points it earns; capped: right, but the part was full;
  // repeatOf: the line that already made its point.
  function markLines(part, lines) {
    var have = {}, first = {}, count = 0;
    lines.forEach(function (l, k) {
      var w = BA().words(l.t), fresh = [], old = [];
      part.pts.forEach(function (pt, i) { if (pt.k && BA().hasPoint(pt, w)) (have[i] ? old : fresh).push(i); });
      l.hits = [];
      l.capped = false;
      l.repeatOf = null;
      fresh.forEach(function (i) {
        if (count < part.n) { have[i] = true; first[i] = k; count += 1; l.hits.push(i); } else l.capped = true;
      });
      if (!l.hits.length && !l.capped && old.length) l.repeatOf = first[old[0]];
      l.earns = l.hits.length > 0;
    });
    return have;
  }
  function linePoints(text) {
    var w = BA().words(text);
    return X.part.pts.map(function (pt, i) { return pt.k && BA().hasPoint(pt, w) ? i : -1; }).filter(function (i) { return i >= 0; });
  }
  function marksFor(hits) { return hits.reduce(function (s, i) { return s + BA().pointMarks(X.part, X.part.pts[i]); }, 0); }
  function verdict(l, k) {
    if (l.earns) return { tag: '+' + marksFor(l.hits) + ' marks', ok: true, why: l.hits.map(function (i) { return esc(X.part.pts[i].a); }).join('; ') };
    if (l.capped) return { tag: 'No marks', why: 'Correct, but the question only asks for ' + X.part.n + (X.part.n === 1 ? ' point' : ' points') + ' and the answer already has them.' };
    if (l.repeatOf !== null) return { tag: 'Repeat', why: 'Line ' + (l.repeatOf + 1) + ' already made this point. It only counts once.' };
    var m = /^(\w+(?: \w+)?): (.*)$/.exec(l.why || '');
    return m ? { tag: esc(m[1]), why: esc(m[2].charAt(0).toUpperCase() + m[2].slice(1)) } : { tag: 'No marks', why: esc(l.why || 'This doesn\'t make a point from the marking scheme.') };
  }

  function open(ch, skip) {
    var items = ((window.BioLearn || {})[ch] || {}).examiner || [], list = BA().questions(ch);
    var usable = items.filter(function (it) { return list.some(function (q) { return q.id === it.q && q.parts[it.part]; }); });
    if (!usable.length) return;
    var last = +K.store('bio-exam-last-' + ch), k = usable.length > 1 ? (isNaN(last) ? 0 : (last + 1) % usable.length) : 0;
    if (skip === undefined) k = Math.floor(Math.random() * usable.length);
    K.store('bio-exam-last-' + ch, String(k));
    var item = usable[k], q = list.filter(function (x) { return x.id === item.q; })[0];
    var card = X && X.card && X.card.isConnected && X.ch === ch ? X.card : BK.host(ch, 'Be the examiner');
    if (!X || X.card !== card) K.root().addEventListener('click', onClick);
    X = { ch: ch, item: item, q: q, part: q.parts[item.part], card: card, lines: item.lines.map(function (l) { return { t: l.t, why: l.why, fix: l.fix }; }), done: false };
    X.calls = X.lines.map(function () { return null; });
    X.have = markLines(X.part, X.lines);
    show();
  }
  function show() {
    var card = X.card, face = ((window.ExamGameArt || {}).students || {})[X.item.student], who = X.item.student || 'The student';
    K.gameHud(card, 0, '');
    K.mascot('ok', 'Now YOU mark. See how you like it.');
    var out = BA().partOutOf(X.part);
    body(card, '<div class="am-mark bx">' +
      '<div class="am-run__top"><h3 class="am-run__kind">Be the examiner</h3><span class="am-games__step">' + esc(X.q.src.replace(/^LC Biology HL /, '')) + '</span></div>' +
      '<div data-bx-sum></div>' +
      '<div class="bx-q"><p><b>' + esc(X.part.l) + '</b> ' + esc(X.part.q) + ' <span class="bx-q__m">(' + out + ' marks)</span></p>' +
        (X.part.rule ? '<p class="bx-q__rule">Marking scheme: ' + esc(X.part.rule) + '</p>' : '') + '</div>' +
      '<p class="am-games__ask">Mark ' + esc(who) + '\'s answer. Tick each line that earns marks, cross the ones that don\'t.</p>' +
      '<button type="button" class="am-games__rules" data-bx-rules aria-expanded="false">What earns marks?</button>' +
      '<p class="am-games__rulebox" data-bx-rulebox hidden>A line earns marks when it makes one of the marking scheme\'s points: the right fact, said clearly enough. ' +
        'Nothing for vague lines, wrong facts, a point already made, or more points than the question asks for.</p>' +
      '<div class="am-mark__paper"><div class="am-mark__who">' + (face ? '<div class="am-student" data-mood="wait" aria-hidden="true">' + face + '</div>' : '') +
        '<span class="am-mark__name">' + esc(who) + '</span><p class="am-mark__says" data-bx-says aria-live="polite"></p></div>' + X.lines.map(function (l, k) {
        return '<div class="am-mark__row" data-bx-row="' + k + '"><span class="am-mark__n" aria-hidden="true">' + (k + 1) + '</span>' +
          '<p class="am-mark__text"><span class="am-sr">Line ' + (k + 1) + ': </span>' + esc(l.t) + '</p>' +
          '<div class="am-mark__btns" role="group" aria-label="Mark line ' + (k + 1) + '">' +
            '<button type="button" class="am-mark__btn" data-bx-call="' + k + ':1" aria-pressed="false" aria-label="Earns marks">' + TICK + '</button>' +
            '<button type="button" class="am-mark__btn am-mark__btn--x" data-bx-call="' + k + ':0" aria-pressed="false" aria-label="No marks">' + CROSS + '</button></div></div>';
      }).join('') + '</div>' +
      '<p class="am-games__note" data-am-gnote role="status"></p></div>');
    buttons(card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-bx-hand', 'Hand back']], true);
    card.querySelector('[data-bx-call]').focus({ preventScroll: true });
  }
  function call(k, v) {
    var row = X.card.querySelector('[data-bx-row="' + k + '"]');
    if (X.done || !row) return;
    X.calls[k] = v;
    row.classList.remove('is-yes', 'is-no');
    row.classList.add(v ? 'is-yes' : 'is-no');
    row.querySelectorAll('[data-bx-call]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-bx-call') === k + ':' + v)); });
    var left = X.calls.filter(function (c) { return c === null; }).length;
    X.card.querySelector('[data-am-gnote]').textContent = left ? '' : 'All marked. Hand it back when you\'re sure.';
  }
  function hand() {
    var card = X.card, left = X.calls.indexOf(null);
    if (X.done) return;
    if (left >= 0) {
      card.querySelector('[data-am-gnote]').textContent = 'Mark every line first (' + X.calls.filter(function (c) { return c === null; }).length + ' left).';
      card.querySelector('[data-bx-call="' + left + ':1"]').focus();
      return;
    }
    X.done = true;
    var right = 0, ticked = 0, real = 0, marks = 0;
    X.lines.forEach(function (l, k) {
      var ok = X.calls[k] === (l.earns ? 1 : 0), row = card.querySelector('[data-bx-row="' + k + '"]'), v = verdict(l, k);
      if (ok) right += 1;
      if (X.calls[k]) ticked += 1;
      if (l.earns) { real += 1; marks += marksFor(l.hits); }
      row.classList.add(ok ? 'is-right' : 'is-wrong');
      row.querySelector('.am-mark__n').innerHTML = ok ? TICK : CROSS;
      row.querySelectorAll('[data-bx-call]').forEach(function (b) { b.setAttribute('aria-disabled', 'true'); });
      row.insertAdjacentHTML('beforeend', '<p class="am-mark__why"><b class="am-mark__tag am-mark__tag--' + (v.ok ? 'srp' : 'no') + '">' + v.tag + '</b> ' +
        (ok ? '' : '<span class="am-sr">You marked this wrong. </span>') + v.why + '</p>');
      if (!K.reduced()) row.style.animationDelay = k * 0.06 + 's';
    });
    var n = X.lines.length, great = right >= n - 1, out = BA().partOutOf(X.part), best = (K.store('bio-exam-' + X.ch) || '').split('/');
    var newBest = best.length === 2 && right / n > +best[0] / +best[1];
    if (best.length !== 2 || newBest) K.store('bio-exam-' + X.ch, right + '/' + n);
    K.gameHud(card, 0, '/' + n);
    K.rollTo(card.querySelector('[data-am-gscore]'), right);
    card.querySelector('[data-bx-sum]').innerHTML = '<div class="am-mark__sum ' + (great ? 'is-good' : '') + '"><b>' + right + ' of ' + n + ' lines marked right.</b> ' +
      'You ticked ' + ticked + (ticked === 1 ? ' line' : ' lines') + '; ' + real + (real === 1 ? ' really earns' : ' really earn') + ' marks (' + Math.min(marks, out) + ' of the ' + out + ' marks).' + (newBest ? ' New best!' : '') + '</div>';
    card.querySelector('.am-mark').classList.add('is-marked');
    var student = card.querySelector('.am-student');
    if (student) {
      student.setAttribute('data-mood', ticked < real ? 'upset' : ticked > real ? 'smug' : 'happy');
      if (!K.reduced()) student.classList.add('is-react');
    }
    card.querySelector('[data-bx-says]').textContent = ticked < real ? 'Hey! Some of those were worth marks!' : ticked > real ? 'Free marks. Cheers!'
      : right === n ? 'That\'s fair.' : 'Right number of ticks. Wrong lines, though.';
    card.querySelector('[data-am-gnote]').textContent = '';
    card.querySelector('.am-finish__card').scrollTop = 0;
    K.mascot(great ? 'happy' : right >= n * 0.7 ? 'ok' : 'angry', great ? 'You\'d make a decent examiner. Better than some.' : right >= n * 0.7 ? 'Not bad. Not good either.' : 'You\'d be a terrible examiner.');
    if (right === n) K.later(K.fanfare, 300);
    X.fixes = X.lines.filter(function (l) { return !l.earns && !l.capped && l.fix; }).slice(0, 3);
    buttons(card, X.fixes.length ? [['more', 'data-bx-again', 'Mark another'], ['ok', 'data-bx-fix', 'Fix the weak lines']] : [['more', 'data-am-keep', 'Close'], ['ok', 'data-bx-again', 'Mark another']]);
  }

  // Fix it: each line that got nothing, rewritten so it earns a point the answer doesn't have yet.
  function fixShow() {
    var l = X.fixes[X.fi], v = verdict(l, X.lines.indexOf(l)), replace = l.repeatOf !== null;
    X.tries = 0;
    X.fixDone = false;
    body(X.card, '<div class="am-fix">' +
      '<div class="am-run__top"><h3 class="am-run__kind">Fix it</h3><span class="am-games__step">' + (X.fi + 1) + ' of ' + X.fixes.length + '</span></div>' +
      '<p class="am-games__ask">' + (replace ? 'This point is already in the answer. Replace the line with a new point that answers the question.' : 'Rewrite this line so it earns marks.') + '</p>' +
      '<div class="bx-q bx-q--small"><p><b>' + esc(X.part.l) + '</b> ' + esc(X.part.q) + '</p></div>' +
      '<div class="am-fix__line"><p class="am-mark__text">' + esc(l.t) + '</p><p class="am-mark__why"><b class="am-mark__tag am-mark__tag--no">' + v.tag + '</b> ' + v.why + '</p></div>' +
      '<textarea class="am-type__box am-fix__box" rows="3" spellcheck="true" aria-label="Your better line" placeholder="Your better line…"></textarea>' +
      '<div data-bx-fixresult></div><p class="am-games__note" data-am-gnote role="status"></p></div>');
    buttons(X.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-bx-fcheck', 'Check']], true);
    X.card.querySelector('.am-fix__box').focus({ preventScroll: true });
  }
  function fixCheck() {
    var l = X.fixes[X.fi], box = X.card.querySelector('.am-fix__box'), note = X.card.querySelector('[data-am-gnote]');
    if (X.fixDone) return;
    var text = box.value.trim();
    if (!text) { note.textContent = 'Write your line first.'; box.focus(); return; }
    var hits = linePoints(text), fresh = hits.filter(function (i) { return !X.have[i]; });
    var better = '<p class="am-fix__better"><b>A line that earns the marks:</b> ' + esc(l.fix) + '</p>';
    if (fresh.length) {
      X.fixDone = true;
      X.fixed += 1;
      box.readOnly = true;
      K.ding(3, true);
      K.mascot('happy', pick(['Correct.', 'Hmph. That earns it.', 'Yes. That\'s a mark.']));
      X.card.querySelector('[data-bx-fixresult]').innerHTML = '<p class="am-fix__ok"><b>That earns ' + marksFor(fresh) + ' marks:</b> ' + esc(X.part.pts[fresh[0]].a) + '.</p>' + better;
      note.textContent = '';
    } else {
      X.tries += 1;
      K.bonk();
      K.mascot('angry', pick(['No marks.', 'Still vague.', 'Try again. Properly.']));
      var hint = hits.length ? 'That\'s a real point, but the answer already has it ("' + esc(X.part.pts[hits[0]].a) + '"). Make a different one.'
        : 'Still no marks. Name the exact structure, substance or process, and say what happens.';
      if (X.tries < 2) { note.innerHTML = hint + ' <em>One more try.</em>'; box.focus(); return; }
      X.fixDone = true;
      box.readOnly = true;
      note.innerHTML = hint;
      X.card.querySelector('[data-bx-fixresult]').innerHTML = better;
    }
    buttons(X.card, [['ok', 'data-bx-fnext', X.fi + 1 >= X.fixes.length ? 'Finish' : 'Next line']]);
    X.card.querySelector('[data-bx-fixresult]').scrollIntoView({ block: 'nearest', behavior: K.reduced() ? 'auto' : 'smooth' });
  }
  function fixNext() {
    X.fi += 1;
    if (X.fi < X.fixes.length) { fixShow(); return; }
    var all = X.fixed === X.fixes.length;
    body(X.card, '<div class="am-games__end">' +
      '<p class="am-games__big">' + X.fixed + '<span>/' + X.fixes.length + '</span></p>' +
      '<h3 class="am-games__title">' + (all ? 'Every line fixed!' : X.fixed ? 'Some lines fixed' : 'Those were tricky') + '</h3>' +
      '<p class="am-games__sub">A line earns marks when it names the exact structure, substance or process the scheme wants, and the answer doesn\'t already have that point.</p></div>');
    buttons(X.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-bx-again', 'Mark another']]);
    K.mascot(all ? 'happy' : 'ok', all ? 'Now write like that in the exam.' : 'Better. Still not good enough.');
    if (all) K.later(K.fanfare, 300);
  }
  function onClick(e) {
    if (!X || !X.card.isConnected) return;
    var t;
    if ((t = e.target.closest('[data-bx-call]'))) { var c = t.getAttribute('data-bx-call').split(':'); call(+c[0], +c[1]); return; }
    if ((t = e.target.closest('[data-bx-rules]'))) {
      var box = X.card.querySelector('[data-bx-rulebox]');
      box.hidden = !box.hidden;
      t.setAttribute('aria-expanded', String(!box.hidden));
      return;
    }
    if (e.target.closest('[data-bx-hand]')) { hand(); return; }
    if (e.target.closest('[data-bx-fix]')) { X.fi = 0; X.fixed = 0; K.mascot('ok', 'Go on then. Fix them.'); fixShow(); return; }
    if (e.target.closest('[data-bx-fcheck]')) { fixCheck(); return; }
    if (e.target.closest('[data-bx-fnext]')) { fixNext(); return; }
    if (e.target.closest('[data-bx-again]')) { open(X.ch, true); }
  }
  window.BioExaminer = { open: function (ch) { X = null; open(ch); }, mark: function (ch, item) {
    // For tests: which lines of an examiner item earn, and is each fix a new point?
    var q = BA().questions(ch).filter(function (x) { return x.id === item.q; })[0], part = q.parts[item.part], lines = item.lines.map(function (l) { return { t: l.t }; });
    var have = markLines(part, lines);
    return lines.map(function (l, k) {
      var f = item.lines[k].fix, w = f && BA().words(f);
      return { earns: l.earns, capped: l.capped, repeatOf: l.repeatOf, fixNew: f ? part.pts.some(function (pt, i) { return !have[i] && pt.k && BA().hasPoint(pt, w); }) : null };
    });
  } };
})();

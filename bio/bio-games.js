// Biology games, run inside answer-mode.js's practice host (cards, the examiner, sounds):
//   BioBuild   Build it: study a diagram, build it from its parts, label it, then answer questions on it.
//   BioAction  Opens the chapter's action game: each one is in bio/act<N>.js and registers in window.BioActions[N].
//   BioMemory  Learn it drills: definitions as the words vanish, quick sorting, and tables from memory.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit;
  var ART = window.BioArt || {}, LEARN = window.BioLearn || {};
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(list) { var a = list.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function refresh() { if (window.BioApp) window.BioApp.refresh(); }
  function host(ch, label) {
    AM.practice('bio-' + ch, 'none', refresh);
    var card = K.gameCard(label);
    return card;
  }
  function body(card, html, wide) { return K.gameBody(card, html, wide); }
  function buttons(card, list, keep) { K.fillButtons(card.querySelector('[data-am-gbtns]'), list, keep); }
  function svgPoint(svg, e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  // ======================================================================== Build it
  var B = null;
  function buildOpen(id) {
    var art = ART[id], set = window.ExamDrawDiagrams && window.ExamDrawDiagrams['bio-' + (art && art.chapter)];
    var dg = set && set.diagrams.filter(function (d) { return d.id === id; })[0];
    if (!dg) return;
    var card = host(art.chapter, 'Build it: ' + art.name);
    card.classList.add('bb-card');
    B = { id: id, art: art, dg: dg, card: card, firstTry: 0, parts: 0, labels: 0, labelsOut: dg.labels.length, qRight: 0, qOut: 0 };
    K.root().addEventListener('click', buildClick);
    K.gameHud(card, 3, 'pts');
    buildStudy();
  }
  function frameSvg() { return '<div class="bb-frame" data-bb-frame>' + B.dg.svg + '</div>'; }
  function buildStudy() {
    K.gameSeg(B.card, 0, 'is-current');
    body(B.card, '<div class="bb"><div class="am-run__top"><h3 class="am-run__kind">Study it</h3><span class="am-games__step">' + esc(B.art.name) + '</span></div>' +
      '<p class="am-games__ask">Look at how it fits together. Next you\'ll build it from its parts, then label it.</p>' + frameSvg() +
      '<p class="am-games__note">' + esc(B.dg.tip || '') + '</p></div>', true);
    buttons(B.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-bb-go', 'I\'m ready']]);
    K.mascot('ok', 'Study it. Properly.');
  }
  // Build: part 0 is given; every other part is in the tray. Tap a part, then tap where it goes.
  function buildStart() {
    K.gameSeg(B.card, 0, 'is-current');
    body(B.card, '<div class="bb"><div class="am-run__top"><h3 class="am-run__kind">Build it</h3><span class="am-games__step" data-bb-left></span></div>' +
      '<p class="am-games__ask">Tap a part, then tap where it goes on the diagram.</p>' + frameSvg() +
      '<div class="bb-tray" data-bb-tray></div><p class="am-games__note" data-am-gnote role="status"></p></div>', true);
    var svg = B.card.querySelector('[data-bb-frame] svg');
    svg.querySelectorAll('[data-label]').forEach(function (g) { g.style.display = 'none'; });
    var defs = svg.querySelector('defs') ? svg.querySelector('defs').outerHTML : '';
    B.boxes = {};
    B.todo = [];
    svg.querySelectorAll('[data-part]').forEach(function (g) {
      var k = g.getAttribute('data-part');
      if (k === '0') return;
      var b = g.getBBox();
      B.boxes[k] = { x: b.x, y: b.y, w: b.width, h: b.height };
      g.classList.add('bb-hidden');
      B.todo.push(k);
    });
    B.tries = {};
    B.card.querySelector('[data-bb-tray]').innerHTML = shuffle(B.todo).map(function (k) {
      var b = B.boxes[k], pad = 6, g = svg.querySelector('[data-part="' + k + '"]').outerHTML.replace(' class="bb-hidden"', '');
      return '<button type="button" class="bb-piece" data-bb-piece="' + k + '" aria-pressed="false" aria-label="' + esc(B.art.parts[+k] || 'Part') + '">' +
        '<svg viewBox="' + (b.x - pad) + ' ' + (b.y - pad) + ' ' + (b.w + pad * 2) + ' ' + (b.h + pad * 2) + '" aria-hidden="true">' + defs + g + '</svg>' +
        '<span>' + esc(B.art.parts[+k] || '') + '</span></button>';
    }).join('');
    svg.addEventListener('click', buildDrop);
    buildLeft();
    buttons(B.card, [['more', 'data-am-keep', 'Close'], ['more', 'data-bb-place', 'Show me where']], true);
    K.mascot('ok', 'Now build it. From memory.');
  }
  function buildLeft() {
    B.card.querySelector('[data-bb-left]').textContent = B.todo.length + ' parts left';
  }
  function buildDrop(e) {
    if (!B || !B.sel) { if (B) B.card.querySelector('[data-am-gnote]').textContent = 'Tap a part first.'; return; }
    var svg = B.card.querySelector('[data-bb-frame] svg'), p = svgPoint(svg, e), b = B.boxes[B.sel], m = 14;
    if (p.x >= b.x - m && p.x <= b.x + b.w + m && p.y >= b.y - m && p.y <= b.y + b.h + m) { buildPlace(B.sel, !B.tries[B.sel]); return; }
    B.tries[B.sel] = (B.tries[B.sel] || 0) + 1;
    K.bonk();
    K.mascot('angry', pick(['Not there!', 'Wrong place.', 'Look again.']));
    var note = B.card.querySelector('[data-am-gnote]');
    note.textContent = B.tries[B.sel] >= 2 ? 'Still not there. Tap "Show me where" if you\'re stuck.' : 'Not there. Think about what it joins on to.';
    var piece = B.card.querySelector('[data-bb-piece="' + B.sel + '"]');
    if (!K.reduced()) { piece.classList.remove('am-shake'); void piece.offsetWidth; piece.classList.add('am-shake'); }
  }
  function buildPlace(k, first) {
    var svg = B.card.querySelector('[data-bb-frame] svg'), g = svg.querySelector('[data-part="' + k + '"]');
    g.classList.remove('bb-hidden');
    if (!K.reduced()) g.classList.add('bb-in');
    B.card.querySelector('[data-bb-piece="' + k + '"]').remove();
    B.todo.splice(B.todo.indexOf(k), 1);
    B.parts += 1;
    if (first) B.firstTry += 1;
    B.sel = null;
    K.ding(B.parts, false);
    K.mascot('happy', first ? pick(['Correct.', 'Hmph. Right.', 'Yes.']) : 'There. Remember it.');
    B.card.querySelector('[data-am-gnote]').textContent = first ? 'Right first time.' : '';
    K.rollTo(B.card.querySelector('[data-am-gscore]'), B.firstTry);
    buildLeft();
    if (!B.todo.length) {
      K.gameSeg(B.card, 0, B.firstTry === B.parts ? 'is-ok' : 'is-half');
      B.card.querySelector('[data-am-gnote]').innerHTML = '<b>Built.</b> ' + B.firstTry + ' of ' + B.parts + ' parts right first time.';
      buttons(B.card, [['ok', 'data-bb-labels', 'Now label it']]);
    }
  }
  // Label: one pin at a time, four names to choose from.
  function buildLabels() {
    K.gameSeg(B.card, 1, 'is-current');
    B.li = 0;
    B.order = shuffle(B.dg.labels.map(function (l, i) { return i; }));
    labelAsk();
  }
  function labelAsk() {
    var svg = B.card.querySelector('[data-bb-frame] svg');
    svg.querySelectorAll('.bb-pin').forEach(function (n) { n.remove(); });
    var i = B.order[B.li], l = B.dg.labels[i], ns = 'http://www.w3.org/2000/svg';
    var pin = document.createElementNS(ns, 'g');
    pin.setAttribute('class', 'bb-pin');
    pin.innerHTML = '<circle cx="' + l.at[0] + '" cy="' + l.at[1] + '" r="14" fill="none" stroke="#FFC42E" stroke-width="4"/><circle cx="' + l.at[0] + '" cy="' + l.at[1] + '" r="5" fill="#14243B" stroke="#FFFFFF" stroke-width="2"/>';
    svg.appendChild(pin);
    var others = shuffle(B.dg.labels.filter(function (x, j) { return j !== i; })).slice(0, 3);
    var opts = shuffle([l].concat(others));
    B.card.querySelector('.bb .am-run__kind').textContent = 'Label it';
    B.card.querySelector('[data-bb-left]').textContent = (B.li + 1) + ' of ' + B.order.length;
    B.card.querySelector('.bb .am-games__ask').textContent = 'What is the part at the yellow ring?';
    var tray = B.card.querySelector('[data-bb-tray]');
    tray.className = 'am-run__opts bb-opts';
    tray.innerHTML = opts.map(function (o) {
      return '<button type="button" class="am-run__opt" data-bb-label="' + B.dg.labels.indexOf(o) + '"><span>' + esc(o.text) + '</span></button>';
    }).join('');
    B.answered = false;
    buttons(B.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function labelPick(j, btn) {
    if (B.answered) return;
    B.answered = true;
    var i = B.order[B.li], ok = j === i, svg = B.card.querySelector('[data-bb-frame] svg');
    btn.classList.add(ok ? 'am-run__opt--ok' : 'am-run__opt--no');
    if (!ok) B.card.querySelector('[data-bb-label="' + i + '"]').classList.add('am-run__opt--ok');
    var lab = svg.querySelector('[data-label="' + i + '"]');
    if (lab) lab.style.display = '';
    if (ok) { B.labels += 1; K.ding(B.labels, false); K.mascot('happy', pick(['Correct.', 'Fine.', 'Yes.'])); }
    else { K.bonk(); K.mascot('angry', pick(['Wrong!', 'No.', 'Learn your labels.'])); }
    K.rollTo(B.card.querySelector('[data-am-gscore]'), B.firstTry + B.labels);
    var last = B.li + 1 >= B.order.length;
    buttons(B.card, [['ok', last ? 'data-bb-quiz' : 'data-bb-nextlabel', last ? 'Questions on it' : 'Next label']]);
  }
  // Questions on the diagram you built: tap the right structure, or pick the right answer.
  function buildQuiz() {
    K.gameSeg(B.card, 1, B.labels === B.labelsOut ? 'is-ok' : 'is-half');
    K.gameSeg(B.card, 2, 'is-current');
    B.qs = shuffle(((LEARN[B.art.chapter] || {}).build || {})[B.id] || []);
    B.qi = 0;
    B.qOut = B.qs.length;
    if (!B.qs.length) { buildEnd(); return; }
    var svg = B.card.querySelector('[data-bb-frame] svg');
    svg.querySelectorAll('.bb-pin').forEach(function (n) { n.remove(); });
    quizAsk();
  }
  function quizAsk() {
    var q = B.qs[B.qi], svg = B.card.querySelector('[data-bb-frame] svg'), tray = B.card.querySelector('[data-bb-tray]');
    B.answered = false;
    svg.querySelectorAll('.bb-taps').forEach(function (n) { n.remove(); });
    B.card.querySelector('.bb .am-run__kind').textContent = 'Questions on it';
    B.card.querySelector('[data-bb-left]').textContent = (B.qi + 1) + ' of ' + B.qs.length;
    B.card.querySelector('.bb .am-games__ask').textContent = q.q;
    if (q.tap) {
      var ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'bb-taps bio-taps');
      g.innerHTML = Object.keys(B.art.anchors).map(function (a) {
        var p = B.art.anchors[a];
        return '<circle class="bio-tap" cx="' + p[0] + '" cy="' + p[1] + '" r="20" data-bb-tap="' + a + '" tabindex="0" role="button" aria-label="' + esc(a) + '"/>';
      }).join('');
      svg.appendChild(g);
      tray.className = 'bb-tray';
      tray.innerHTML = '';
    } else {
      tray.className = 'am-run__opts bb-opts';
      tray.innerHTML = shuffle(q.opts.map(function (o, k) { return [o, k]; })).map(function (o) {
        return '<button type="button" class="am-run__opt" data-bb-opt="' + o[1] + '"><span>' + esc(o[0]) + '</span></button>';
      }).join('');
    }
    buttons(B.card, [['more', 'data-am-keep', 'Close']], true);
  }
  function quizAnswer(ok, mark) {
    if (B.answered) return;
    B.answered = true;
    var q = B.qs[B.qi];
    if (ok) { B.qRight += 1; K.ding(3 + B.qRight, false); K.mascot('happy', pick(['Correct.', 'Hmph. Yes.'])); }
    else { K.bonk(); K.mascot('angry', pick(['No!', 'Wrong!', 'Look at it again.'])); }
    if (mark) mark();
    if (q.tap) {
      // Show where the right answer was.
      var svg = B.card.querySelector('[data-bb-frame] svg');
      q.tap.forEach(function (a) { var c = svg.querySelector('[data-bb-tap="' + a + '"]'); if (c) c.classList.add('is-right'); });
    } else {
      var right = B.card.querySelector('[data-bb-opt="' + q.a + '"]');
      if (right) right.classList.add('am-run__opt--ok');
    }
    K.rollTo(B.card.querySelector('[data-am-gscore]'), B.firstTry + B.labels + B.qRight);
    var last = B.qi + 1 >= B.qs.length;
    buttons(B.card, [['ok', last ? 'data-bb-end' : 'data-bb-nextq', last ? 'See my score' : 'Next question']]);
  }
  function buildEnd() {
    K.gameSeg(B.card, 2, B.qRight === B.qOut ? 'is-ok' : 'is-half');
    var got = B.firstTry + B.labels + B.qRight, out = B.parts + B.labelsOut + B.qOut, prev = K.store('bio-build-' + B.id);
    var better = !prev || got / out > (+prev.split('/')[0] / +prev.split('/')[1]);
    if (better) K.store('bio-build-' + B.id, got + '/' + out);
    var perfect = got === out;
    body(B.card, '<div class="am-games__end"><p class="am-games__big">' + got + '<span>/' + out + '</span></p>' +
      '<h3 class="am-games__title">' + (perfect ? 'Perfect!' : got >= out * 0.75 ? 'Nice work!' : 'Keep practising') + '</h3>' +
      '<p class="am-games__sub">Parts right first time: <b>' + B.firstTry + '/' + B.parts + '</b> · Labels: <b>' + B.labels + '/' + B.labelsOut + '</b> · Questions: <b>' + B.qRight + '/' + B.qOut + '</b>' +
      (better && prev ? ' <b>New best!</b>' : '') + '</p>' + frameSvg() + '</div>', true);
    buttons(B.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-bb-again', 'Build it again']]);
    K.mascot(perfect ? 'happy' : 'ok', perfect ? 'Every part. I\'m almost impressed.' : 'Again, until it\'s perfect.');
    if (perfect) K.later(K.fanfare, 300);
  }
  function buildClick(e) {
    if (!B) return;
    var t;
    if (e.target.closest('[data-bb-go]')) { buildStart(); return; }
    if ((t = e.target.closest('[data-bb-piece]'))) {
      B.sel = t.getAttribute('data-bb-piece');
      B.card.querySelectorAll('[data-bb-piece]').forEach(function (p) { p.setAttribute('aria-pressed', String(p === t)); });
      B.card.querySelector('[data-am-gnote]').textContent = 'Now tap where the ' + (B.art.parts[+B.sel] || 'part').toLowerCase() + ' goes.';
      return;
    }
    if (e.target.closest('[data-bb-place]')) {
      if (!B.sel) { B.card.querySelector('[data-am-gnote]').textContent = 'Tap a part first, then I\'ll show you where it goes.'; return; }
      buildPlace(B.sel, false);
      return;
    }
    if (e.target.closest('[data-bb-labels]')) { buildLabels(); return; }
    if ((t = e.target.closest('[data-bb-label]'))) { labelPick(+t.getAttribute('data-bb-label'), t); return; }
    if (e.target.closest('[data-bb-nextlabel]')) { B.li += 1; labelAsk(); return; }
    if (e.target.closest('[data-bb-quiz]')) { buildQuiz(); return; }
    if ((t = e.target.closest('[data-bb-tap]'))) {
      var q = B.qs[B.qi], a = t.getAttribute('data-bb-tap'), ok = q.tap.indexOf(a) >= 0;
      quizAnswer(ok, function () { t.classList.add(ok ? 'is-right' : 'is-wrong'); });
      return;
    }
    if ((t = e.target.closest('[data-bb-opt]'))) {
      var ok2 = +t.getAttribute('data-bb-opt') === B.qs[B.qi].a;
      quizAnswer(ok2, function () { t.classList.add(ok2 ? 'am-run__opt--ok' : 'am-run__opt--no'); });
      return;
    }
    if (e.target.closest('[data-bb-nextq]')) { B.qi += 1; quizAsk(); return; }
    if (e.target.closest('[data-bb-end]')) { buildEnd(); return; }
    if (e.target.closest('[data-bb-again]')) { buildOpen(B.id); }
  }

  // ======================================================================== Learn it
  var M = null;
  function memoryOpen(ch, k) {
    var item = ((LEARN[ch] || {}).learn || [])[k];
    if (!item) return;
    var card = host(ch, item.name);
    M = { ch: ch, k: k, item: item, card: card, i: 0, right: 0 };
    K.root().addEventListener('click', memoryClick);
    if (item.type === 'vanish') vanishStart();
    else if (item.type === 'sort') sortStart();
    else tableStart();
  }
  // Vanishing words: four passes per definition, each hiding more of it. Type the whole thing each time.
  var VANISH = [0, 0.35, 0.7, 1];
  function vanishStart() {
    M.list = shuffle(M.item.items);
    M.pass = 0;
    K.gameHud(M.card, M.list.length, 'learnt');
    K.mascot('ok', 'Word for word. Examiners notice.');
    vanishShow();
  }
  function vanishShow() {
    var it = M.list[M.i], words = it[1].split(' ');
    K.gameSeg(M.card, M.i, 'is-current');
    if (!M.hide || M.hideFor !== M.i + ':' + M.pass) {
      // Hide the longest words first, so the key terms go before the small ones.
      var order = words.map(function (w, k) { return [w.replace(/[^A-Za-z]/g, '').length + Math.random(), k]; }).sort(function (a, b) { return b[0] - a[0]; });
      var n = Math.round(words.length * VANISH[M.pass]);
      M.hide = {};
      order.slice(0, n).forEach(function (o) { M.hide[o[1]] = true; });
      M.hideFor = M.i + ':' + M.pass;
    }
    var shown = words.map(function (w, k) { return M.hide[k] ? '<span class="vw-gap">' + w.replace(/[A-Za-z’']/g, '_') + '</span>' : esc(w); }).join(' ');
    body(M.card, '<div class="vw"><div class="am-run__top"><h3 class="am-run__kind">' + esc(it[0]) + '</h3><span class="am-games__step">' + ['Read it', 'Some words gone', 'Most words gone', 'From memory'][M.pass] + '</span></div>' +
      '<p class="vw-text">' + (M.pass === 3 ? '<span class="vw-gap">All of it, from memory.</span>' : shown) + '</p>' +
      '<div class="am-games__type" data-am-typehost></div><p class="am-games__note" data-am-gnote role="status"></p></div>');
    var g = { kind: 'vanish' };
    K.game(g);
    K.typeIt(M.card, it[1], function () {
      if (M.pass < 3) { M.pass += 1; K.later(vanishShow, 450); return; }
      M.right += 1;
      K.gameSeg(M.card, M.i, 'is-ok');
      K.rollTo(M.card.querySelector('[data-am-gscore]'), M.right);
      K.mascot('happy', 'Word for word. Good.');
      buttons(M.card, [['ok', 'data-mm-next', M.i + 1 >= M.list.length ? 'Finish' : 'Next definition']]);
    });
    var lab = M.card.querySelector('.am-type__k');
    if (lab) lab.textContent = M.pass === 3 ? 'Type the definition from memory' : 'Type the whole definition, gaps and all';
  }
  // Sort it: one card at a time into the right bin, against a short clock.
  function sortStart() {
    M.list = shuffle(M.item.items);
    K.gameHud(M.card, M.list.length, 'right');
    K.mascot('ok', 'Quick. No thinking twice.');
    M.mistakes = [];
    sortShow();
  }
  function sortShow() {
    var it = M.list[M.i];
    K.gameSeg(M.card, M.i, 'is-current');
    body(M.card, '<div class="so"><div class="am-run__top"><h3 class="am-run__kind">' + esc(M.item.name) + '</h3><span class="am-games__step">' + (M.i + 1) + ' of ' + M.list.length + '</span></div>' +
      '<div class="so-card">' + esc(it[0]) + '</div><div class="so-bins">' + M.item.bins.map(function (b, k) {
        return '<button type="button" class="so-bin" data-mm-bin="' + k + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd>' + esc(b) + '</button>';
      }).join('') + '</div><p class="am-games__note" data-am-gnote role="status"></p></div>');
    M.answered = false;
    buttons(M.card, [['more', 'data-am-keep', 'Close']], true);
    M.card.querySelector('[data-mm-bin]').focus({ preventScroll: true });
  }
  function sortPick(k, btn) {
    if (M.answered) return;
    M.answered = true;
    var it = M.list[M.i], ok = k === it[1];
    btn.classList.add(ok ? 'is-ok' : 'is-no');
    if (!ok) { M.card.querySelector('[data-mm-bin="' + it[1] + '"]').classList.add('is-ok'); M.mistakes.push(it); }
    if (ok) { M.right += 1; K.ding(M.right, false); } else { K.bonk(); K.mascot('angry', pick(['No!', 'Wrong bin.'])); }
    K.gameSeg(M.card, M.i, ok ? 'is-ok' : 'is-no');
    K.rollTo(M.card.querySelector('[data-am-gscore]'), M.right);
    K.later(function () { if (M && M.answered) { M.i += 1; if (M.i >= M.list.length) memoryEnd(); else sortShow(); } }, ok ? 450 : 1300);
  }
  // A table from memory: tap each cell to choose, then check.
  function tableStart() {
    var t = M.item;
    M.cells = t.rows.map(function () { return t.cols.map(function () { return -1; }); });
    K.gameHud(M.card, 1, 'right');
    body(M.card, '<div class="tb"><div class="am-run__top"><h3 class="am-run__kind">' + esc(t.name) + '</h3></div><p class="am-games__ask">' + esc(t.what) + ' Tap a cell to change it.</p>' +
      '<div class="tb-wrap"><table class="tb-table"><thead><tr><th></th>' + t.cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.rows.map(function (r, i) {
        return '<tr><th scope="row">' + esc(r[0]) + '</th>' + t.cols.map(function (c, j) {
          return '<td><button type="button" class="tb-cell" data-mm-cell="' + i + ':' + j + '" aria-label="' + esc(r[0] + ', ' + c) + '">?</button></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div><p class="am-games__note" data-am-gnote role="status"></p></div>');
    buttons(M.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-mm-check', 'Check']], true);
    K.mascot('ok', 'From memory. No guessing.');
  }
  function tableCell(btn) {
    if (M.checked) return;
    var p = btn.getAttribute('data-mm-cell').split(':'), i = +p[0], j = +p[1], ch = M.item.choices;
    M.cells[i][j] = (M.cells[i][j] + 1) % ch.length;
    btn.textContent = ch[M.cells[i][j]];
  }
  function tableCheck() {
    if (M.cells.some(function (r) { return r.some(function (c) { return c < 0; }); })) { M.card.querySelector('[data-am-gnote]').textContent = 'Fill every cell first.'; return; }
    M.checked = true;
    var right = 0, total = 0, t = M.item;
    t.rows.forEach(function (r, i) {
      r[1].forEach(function (want, j) {
        total += 1;
        var btn = M.card.querySelector('[data-mm-cell="' + i + ':' + j + '"]'), ok = t.choices[M.cells[i][j]] === want;
        if (ok) right += 1;
        btn.classList.add(ok ? 'is-ok' : 'is-no');
        if (!ok) btn.innerHTML = '<s>' + esc(t.choices[M.cells[i][j]]) + '</s> ' + esc(want);
      });
    });
    M.right = right;
    M.total = total;
    K.rollTo(M.card.querySelector('[data-am-gscore]'), right);
    M.card.querySelector('[data-am-gunit]').textContent = '/' + total;
    M.card.querySelector('[data-am-gnote]').innerHTML = '<b>' + right + ' of ' + total + ' right.</b> ' + esc(t.why || '');
    if (right === total) { K.ding(6, true); K.mascot('happy', 'Every cell. Fine.'); K.later(K.fanfare, 300); } else { K.bonk(); K.mascot('angry', 'Learn the table. It comes up.'); }
    buttons(M.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-mm-again', 'Try again']]);
  }
  function memoryEnd() {
    var out = M.list.length, right = M.right, key = 'bio-learn-' + M.ch + '-' + M.k, prev = K.store(key);
    if (!prev || right > +prev.split('/')[0]) K.store(key, right + '/' + out);
    body(M.card, '<div class="am-games__end"><p class="am-games__big">' + right + '<span>/' + out + '</span></p>' +
      '<h3 class="am-games__title">' + (right === out ? 'Perfect!' : right >= out * 0.75 ? 'Nice work!' : 'Keep practising') + '</h3>' +
      (M.mistakes && M.mistakes.length ? '<p class="am-games__sub">Learn these: ' + M.mistakes.map(function (m) { return '<b>' + esc(m[0]) + '</b> → ' + esc(M.item.bins[m[1]]); }).join(', ') + '</p>' : '') +
      (M.item.why ? '<p class="am-games__sub">' + esc(M.item.why) + '</p>' : '') + '</div>');
    buttons(M.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-mm-again', 'Again']]);
    K.mascot(right === out ? 'happy' : 'ok', right === out ? 'Hmph. You know it.' : 'Again until it\'s perfect.');
    if (right === out) K.later(K.fanfare, 300);
  }
  function memoryClick(e) {
    if (!M) return;
    var t;
    if ((t = e.target.closest('[data-mm-bin]'))) { sortPick(+t.getAttribute('data-mm-bin'), t); return; }
    if ((t = e.target.closest('[data-mm-cell]'))) { tableCell(t); return; }
    if (e.target.closest('[data-mm-check]')) { tableCheck(); return; }
    if (e.target.closest('[data-mm-next]')) { M.i += 1; M.pass = 0; M.hide = null; if (M.i >= M.list.length) memoryEnd(); else vanishShow(); return; }
    if (e.target.closest('[data-mm-again]')) { memoryOpen(M.ch, M.k); }
  }
  document.addEventListener('keydown', function (e) {
    if (!M || M.item.type !== 'sort' || M.answered || !/^[1-9]$/.test(e.key) || !K.root()) return;
    var b = K.root().querySelector('[data-mm-bin="' + (e.key - 1) + '"]');
    if (b) { e.preventDefault(); b.click(); }
  });

  window.BioBuild = { open: buildOpen };
  window.BioActions = window.BioActions || {};
  window.BioAction = { open: function (ch) { var g = window.BioActions[ch]; if (g) g.open(ch); } };
  // What bio/act<N>.js and other chapter files share: a card in the practice host, and small helpers.
  window.BioKit = { host: host, body: body, buttons: buttons, esc: esc, shuffle: shuffle, pick: pick, svgPoint: svgPoint, refresh: refresh };
  window.BioMemory = { open: memoryOpen };
})();

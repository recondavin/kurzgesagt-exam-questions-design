// The English comparative games, in answer-mode.js's practice host (its cards, the examiner, sounds, "Leave the game?").
//   Whose moment?        A key moment: which of your texts is it from? (from the texts' key moments)
//   Penalty shootout     Five kicks each against the examiner; the chains of your key moments are the questions.
//   Upgrade it           A plain phrase: pick its exam version.
//   Picture it           A real picture (a painting, the place, the stage): which key moment does it go with?
//   Link it              Two sentences about two texts: pick the linking phrase that fits (similar, different, degree).
//   Build a point        Level up: a Point, then the sentence that anchors it, then the one that compares (traps:
//                        plot summary, off the mode, vague, wrong).
//   Order the paragraph  Chain reaction: put a model PACE paragraph back in order, then read it whole.
//   Spot the weak line   A paragraph with one line an examiner wouldn't reward: find it, see why and a better one.
// Content: EngData.games (tools/eng/games.json) for the last four, tagged with the texts each item uses, so a student
// gets the ones about their three texts first.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit, D = window.EngData;
  if (!K || !D) return;
  var GD = D.games || {}, G = null, ROUND = 8;
  var REL = { same: 'Similarity', differ: 'Difference', degree: 'Degree' };
  function esc(s) { return K.esc(String(s == null ? '' : s)); }
  function shuffle(a) { return K.shuffle(a.slice(), Date.now() % 233280); }
  function mine() { return window.EngApp ? window.EngApp.chosen() : D.order.slice(0, 3); }
  function title(id) { return D.texts[id] ? D.texts[id].title : id; }
  function col(id) { return window.EngApp ? window.EngApp.colour[id] : '#fff'; }
  // Items about the student's texts first (every text it uses is one of theirs), then the rest.
  function forMe(list) {
    var m = mine(), ok = function (it) { return (it.texts || []).every(function (t) { return m.indexOf(t) >= 0; }); };
    return shuffle(list.filter(ok)).concat(shuffle(list.filter(function (it) { return !ok(it); })));
  }
  function live() { return G && G.card && G.card.isConnected; }
  function host(label) { AM.practice('eng', 'none', function () { G = null; }); return K.gameCard(label); }
  function body(html) { return K.gameBody(G.card, html); }
  function buttons(list, keep) { K.fillButtons(G.card.querySelector('[data-am-gbtns]'), list, keep); }
  function best(key, got, out) {
    var prev = (K.store(key) || '').split('/'), had = prev.length === 2, better = !had || got / out > +prev[0] / +prev[1];
    if (better) K.store(key, got + '/' + out);
    return had && better;
  }
  function end(got, out, line) {
    var perfect = got === out;
    K.playing(false);
    body('<div class="am-games__end"><p class="am-games__big">' + got + '<span>/' + out + '</span></p>' +
      '<h3 class="am-games__title">' + (perfect ? 'Perfect!' : got >= out * 0.75 ? 'Nice work!' : 'Keep practising') + '</h3>' +
      '<p class="am-games__sub">' + esc(line) + '</p></div>');
    buttons([['more', 'data-am-keep', 'Close'], ['ok', 'data-eg-again', 'Play again']]);
    K.mascot(perfect ? 'happy' : 'ok', perfect ? 'Hmph. Flawless.' : 'Again. Until it\'s perfect.');
    if (perfect) K.later(K.fanfare, 300);
  }
  // After an answer: the right one in a green box, then why.
  function verdict(ok, right, why) {
    return '<div class="eg-after"><p class="eg-stamp ' + (ok ? 'is-ok' : 'is-no') + '">' + (ok ? 'Right' : 'Not quite') + '</p>' +
      '<p class="eg-ans"><span>Right answer</span>' + right + '</p>' + (why ? '<p class="eg-why">' + esc(why) + '</p>' : '') + '</div>';
  }
  function step(ok) {
    if (ok) { G.got += 1; K.ding(Math.min(G.got, 6)); K.sfx('stamp', 0.6); K.rollTo(G.card.querySelector('[data-am-gscore]'), G.got); } else { K.bonk(); }
    K.gameSeg(G.card, G.i, ok ? 'is-ok' : 'is-no');
    K.mascot(ok ? 'happy' : 'angry', ok ? ['Correct.', 'Fine.', 'Hmph.', 'Not bad.'][G.i % 4] : ['No.', 'Read it again.', 'Wrong.'][G.i % 3]);
    buttons([['ok', 'data-eg-next', G.i + 1 < G.list.length ? 'Next' : 'Finish']]);
  }

  // ======================================================================== Whose moment?
  function whichOpen() {
    var m = mine(), list = [];
    D.order.forEach(function (t) { (D.texts[t].moments || []).forEach(function (mo) { list.push({ t: t, mo: mo }); }); });
    list = shuffle(list.filter(function (x) { return m.indexOf(x.t) >= 0; })).slice(0, ROUND);
    if (list.length < 4) return;
    G = { kind: 'which', card: host('Whose moment?'), list: list, i: 0, got: 0 };
    K.gameHud(G.card, list.length, '/' + list.length);
    K.playing(true);
    K.mascot('ok', 'Know your key moments? Prove it.');
    whichShow();
  }
  function whichShow() {
    var x = G.list[G.i], opts = mine();
    K.gameSeg(G.card, G.i, 'is-current');
    body('<div class="eg"><div class="am-run__top"><h3 class="am-run__kind">Whose moment?</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<p class="eg-q">' + esc(x.mo.what) + '</p><p class="am-games__ask">Which text is it from?</p>' +
      '<div class="eg-opts">' + opts.map(function (t, k) { return '<button type="button" class="am-run__opt eg-opt" style="--c:' + col(t) + '" data-eg-pick="' + t + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(title(t)) + '</span></button>'; }).join('') + '</div>' +
      '<div data-eg-after></div></div>');
    buttons([['more', 'data-am-keep', 'Close']], true);
  }
  function whichPick(btn) {
    var x = G.list[G.i], ok = btn.getAttribute('data-eg-pick') === x.t;
    G.card.querySelectorAll('[data-eg-pick]').forEach(function (b) { b.disabled = true; if (b.getAttribute('data-eg-pick') === x.t) b.classList.add('am-run__opt--ok'); });
    if (!ok) btn.classList.add('am-run__opt--no');
    G.card.querySelector('[data-eg-after]').innerHTML = verdict(ok, esc(title(x.t)) + ': ' + esc(x.mo.title) + ' <small>(' + esc(x.mo.where) + ')</small>', x.mo.why);
    step(ok);
  }

  // ======================================================================== Picture it
  // A picture from one of your texts (assets/eng/img/credits.json, the ones linked to a key moment): which moment?
  function picsForMe() { var m = mine(); return (D.images || []).filter(function (p) { return p.moment && m.indexOf(p.text) >= 0; }); }
  function picOpen() {
    var list = shuffle(picsForMe()).slice(0, ROUND);
    if (list.length < 4) return;
    G = { kind: 'pic', card: host('Picture it'), list: list, i: 0, got: 0 };
    K.gameHud(G.card, list.length, '/' + list.length);
    K.playing(true);
    K.mascot('ok', 'A picture. Which moment? Look properly.');
    picShow();
  }
  function picShow() {
    var x = G.list[G.i], moms = D.texts[x.text].moments, right = moms.filter(function (m) { return m.id === x.moment; })[0];
    G.opts = shuffle([right].concat(shuffle(moms.filter(function (m) { return m.id !== x.moment; })).slice(0, 3)));
    K.gameSeg(G.card, G.i, 'is-current');
    body('<div class="eg"><div class="am-run__top"><h3 class="am-run__kind">Picture it</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<figure class="eg-pic"><img src="assets/eng/img/' + esc(x.file) + '" alt=""><figcaption><span class="eng-tag" style="--c:' + col(x.text) + '">' + esc(title(x.text)) + '</span></figcaption></figure>' +
      '<p class="am-games__ask">Which key moment does this picture go with?</p>' +
      '<div class="eg-opts">' + G.opts.map(function (m, k) { return '<button type="button" class="am-run__opt eg-opt" style="--c:' + col(x.text) + '" data-eg-mom="' + k + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(m.title) + ' <small>' + esc(m.where) + '</small></span></button>'; }).join('') + '</div>' +
      '<div data-eg-after></div></div>');
    buttons([['more', 'data-am-keep', 'Close']], true);
  }
  function picPick(btn) {
    var x = G.list[G.i], m = G.opts[+btn.getAttribute('data-eg-mom')], ok = m.id === x.moment, right = G.opts.filter(function (o) { return o.id === x.moment; })[0];
    G.card.querySelectorAll('[data-eg-mom]').forEach(function (b) { b.disabled = true; if (G.opts[+b.getAttribute('data-eg-mom')].id === x.moment) b.classList.add('am-run__opt--ok'); });
    if (!ok) btn.classList.add('am-run__opt--no');
    var after = G.card.querySelector('[data-eg-after]');
    after.innerHTML = verdict(ok, esc(right.title) + ' <small>(' + esc(right.where) + ')</small>', x.title + ': ' + x.caption);
    step(ok);
    // The picture takes room: bring the answer into view.
    K.later(function () { if (after.isConnected) after.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60);
  }

  // ======================================================================== Penalty shootout
  // eng/eng-penalty.js, asking about the key moments' chains of your texts: what a moment shows, or what it leads to,
  // with the other moments of the same text as the wrong answers.
  function penaltyOpen() {
    if (!window.PenaltyShootout) return;
    var pool = [];
    mine().forEach(function (t) { (D.texts[t].moments || []).forEach(function (m) { if (m.chain) pool.push({ t: t, m: m }); }); });
    pool = shuffle(pool);
    var k = 0;
    window.PenaltyShootout.open({ title: 'Penalty shootout', store: 'eng-penalty', next: function () {
      var x = pool[k % pool.length], kind = k % 3 === 2 ? 'leads' : 'shows';
      k++;
      var others = shuffle((D.texts[x.t].moments || []).filter(function (m) { return m.id !== x.m.id && m.chain && m.chain[kind] !== x.m.chain[kind]; })).slice(0, 3);
      return { head: title(x.t) + ': ' + x.m.title, text: x.m.chain.happens, ask: kind === 'shows' ? 'What does this show?' : 'What does this lead to?', colour: col(x.t),
        opts: shuffle([{ t: x.m.chain[kind], ok: true }].concat(others.map(function (m) { return { t: m.chain[kind], ok: false }; }))),
        why: x.m.chain.happens + ' → ' + x.m.chain.shows + ' → ' + x.m.chain.leads };
    } });
  }

  // ======================================================================== Upgrade it
  // A plain phrase: pick its exam version (the right one, and three exam phrases that mean something else).
  function upOpen() {
    var U = (D.comparative.upgrades || []), list = shuffle(U).slice(0, ROUND);
    if (list.length < 4) return;
    G = { kind: 'upgrade', card: host('Upgrade it'), list: list, i: 0, got: 0 };
    K.gameHud(G.card, list.length, '/' + list.length);
    K.playing(true);
    K.mascot('ok', 'Plain words lose marks. Upgrade them.');
    upShow();
  }
  function upShow() {
    var x = G.list[G.i], U = D.comparative.upgrades, right = x.exam[G.i % x.exam.length];
    var others = shuffle(U.filter(function (u) { return u !== x; })).slice(0, 3).map(function (u) { return u.exam[0]; });
    G.opts = shuffle([[right, true]].concat(others.map(function (w) { return [w, false]; })));
    K.gameSeg(G.card, G.i, 'is-current');
    body('<div class="eg"><div class="am-run__top"><h3 class="am-run__kind">Upgrade it</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<p class="eg-q"><s class="eg-plain">' + esc(x.plain) + '</s></p><p class="am-games__ask">Which is the exam way to say it?</p>' +
      '<div class="eg-opts">' + G.opts.map(function (o, k) { return '<button type="button" class="am-run__opt eg-opt" data-eg-up="' + k + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(o[0]) + '</span></button>'; }).join('') + '</div>' +
      '<div data-eg-after></div></div>');
    buttons([['more', 'data-am-keep', 'Close']], true);
  }
  function upPick(btn) {
    var x = G.list[G.i], o = G.opts[+btn.getAttribute('data-eg-up')], ok = o[1];
    G.card.querySelectorAll('[data-eg-up]').forEach(function (b) { b.disabled = true; if (G.opts[+b.getAttribute('data-eg-up')][1]) b.classList.add('am-run__opt--ok'); });
    if (!ok) btn.classList.add('am-run__opt--no');
    G.card.querySelector('[data-eg-after]').innerHTML = verdict(ok, esc(x.plain) + ' → ' + x.exam.map(esc).join(', '), x.eg);
    step(ok);
  }

  // ======================================================================== Link it
  function linkOpen() {
    var list = forMe(GD.link || []).slice(0, ROUND);
    if (list.length < 4) return;
    G = { kind: 'link', card: host('Link it'), list: list, i: 0, got: 0 };
    K.gameHud(G.card, list.length, '/' + list.length);
    K.playing(true);
    K.mascot('ok', 'Similarly? In contrast? Choose.');
    linkShow();
  }
  function linkShow() {
    var x = G.list[G.i], lang = {};
    (D.comparative.language || []).forEach(function (g) { lang[g.id] = g.items; });
    // The right phrase, and one each from the other kinds of link.
    var others = ['same', 'differ', 'degree'].filter(function (r) { return r !== x.rel; }).map(function (r) {
      return lang[r].filter(function (s) { return /^[A-Z]/.test(s) && /,$/.test(s); })[G.i % 3] || lang[r][0];
    });
    G.opts = shuffle([[x.link, true]].concat(others.map(function (s) { return [s, false]; })));
    K.gameSeg(G.card, G.i, 'is-current');
    body('<div class="eg"><div class="am-run__top"><h3 class="am-run__kind">Link it</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<p class="eg-q"><span class="eng-tag" style="--c:' + col(x.a.t) + '">' + esc(title(x.a.t)) + '</span> ' + esc(x.a.s) + '</p>' +
      '<p class="eg-q"><span class="eng-tag" style="--c:' + col(x.b.t) + '">' + esc(title(x.b.t)) + '</span> <span class="eg-gap" data-eg-gap>______</span> ' + esc(x.b.s) + '</p>' +
      '<p class="am-games__ask">Which link fits?</p>' +
      '<div class="eg-opts">' + G.opts.map(function (o, k) { return '<button type="button" class="am-run__opt eg-opt" data-eg-link="' + k + '"><kbd aria-hidden="true">' + (k + 1) + '</kbd><span>' + esc(o[0]) + '</span></button>'; }).join('') + '</div>' +
      '<div data-eg-after></div></div>');
    buttons([['more', 'data-am-keep', 'Close']], true);
  }
  function linkPick(btn) {
    var x = G.list[G.i], o = G.opts[+btn.getAttribute('data-eg-link')], ok = o[1];
    G.card.querySelectorAll('[data-eg-link]').forEach(function (b) { b.disabled = true; if (G.opts[+b.getAttribute('data-eg-link')][1]) b.classList.add('am-run__opt--ok'); });
    if (!ok) btn.classList.add('am-run__opt--no');
    G.card.querySelector('[data-eg-gap]').textContent = x.link;
    G.card.querySelector('[data-eg-gap]').classList.add('is-filled');
    G.card.querySelector('[data-eg-after]').innerHTML = verdict(ok, esc(x.link) + ' <small>(' + REL[x.rel] + ')</small>', x.why);
    step(ok);
  }

  // ======================================================================== Spot the weak line
  function spotOpen() {
    var list = forMe(GD.spot || []).slice(0, 6);
    if (list.length < 3) return;
    G = { kind: 'spot', card: host('Spot the weak line'), list: list, i: 0, got: 0 };
    K.gameHud(G.card, list.length, '/' + list.length);
    K.playing(true);
    K.mascot('ok', 'One line here earns nothing. Find it.');
    spotShow();
  }
  function spotShow() {
    var x = G.list[G.i];
    K.gameSeg(G.card, G.i, 'is-current');
    body('<div class="eg"><div class="am-run__top"><h3 class="am-run__kind">Spot the weak line</h3><span class="am-games__step">' + (G.i + 1) + ' of ' + G.list.length + '</span></div>' +
      '<p class="am-games__ask">' + esc(x.ask || 'Tap the line an examiner wouldn\'t reward.') + '</p>' +
      '<div class="eg-lines">' + x.lines.map(function (l, k) { return '<button type="button" class="eg-line" data-eg-line="' + k + '">' + esc(l) + '</button>'; }).join('') + '</div>' +
      '<div data-eg-after></div></div>');
    buttons([['more', 'data-am-keep', 'Close']], true);
  }
  function spotPick(btn) {
    var x = G.list[G.i], k = +btn.getAttribute('data-eg-line'), ok = k === x.weak;
    G.card.querySelectorAll('[data-eg-line]').forEach(function (b) { b.disabled = true; });
    G.card.querySelector('[data-eg-line="' + x.weak + '"]').classList.add('is-weak');
    if (!ok) btn.classList.add('is-wrong');
    G.card.querySelector('[data-eg-after]').innerHTML = verdict(ok, '<b>' + esc(x.kind) + '.</b> ' + esc(x.why), '') +
      (x.fix ? '<p class="eg-fix"><span>A better line</span>' + esc(x.fix) + '</p>' : '');
    step(ok);
  }

  // ======================================================================== Build a point / Order the paragraph
  // These two are answer-mode's Level up and Chain reaction, with the comparative's own words.
  var LEVEL_TEXT = { steps: [['Anchor', 'Anchor it: which sentence grounds the point in a key moment?'], ['Compare', 'Compare: which sentence brings in another text with a link?']],
    tags: ['Point', 'Anchor', 'Compare'], per: 7, start: 'Here\'s the point. Type it out in full.',
    gain: ['Anchored in a key moment: evidence, not just opinion.', 'Compared, with a link: that\'s what the comparative rewards.'],
    note: 'Each one is a point, anchored in a key moment, then compared with another text.',
    recall: 'Write the whole thing from memory: the point, the anchor and the comparison.' };
  function aiGames(kind) {
    var level = forMe(GD.level || []), chains = forMe(GD.chains || []);
    AM.addGames('eng', { level: level, chains: chains, levelText: LEVEL_TEXT });
    // No kit.playing here: these end on answer-mode's own screens, which don't say so.
    AM.practice('eng', kind, function () { G = null; });
  }

  var LIST = [['which', 'Whose moment?', 'A key moment: which text is it from?', function () { return true; }, whichOpen],
    // Penalty shootout: off for now (the user: "scrap penalty shootout for now please"); english.html doesn't load
    // eng/eng-penalty.js, so this stays hidden. Load it again to bring it back.
    // Biology's Mini Golf and Pool with English questions (eng-golf.html, eng-pool.html, eng/eng-deck.js).
    ['golf', 'Mini Golf', 'Five holes against the examiner, a question before every putt.', function () { return true; }, function () { location.href = 'eng-golf.html'; }],
    ['pool', 'Pool', 'Pot your four, then the black: a question before every shot.', function () { return true; }, function () { location.href = 'eng-pool.html'; }],
    ['penalty', 'Penalty shootout', 'Five kicks each against the examiner.', function () { return !!window.PenaltyShootout; }, penaltyOpen],
    ['upgrade', 'Upgrade it', 'Plain words in, exam words out.', function () { return (D.comparative.upgrades || []).length >= 8; }, upOpen],
    ['pic', 'Picture it', 'A real picture: which key moment?', function () { return (D.images || []).filter(function (p) { return p.moment; }).length >= 4; }, picOpen],
    ['link', 'Link it', 'Pick the link that fits two texts.', function () { return (GD.link || []).length >= 4; }, linkOpen],
    ['point', 'Build a point', 'Point, anchor, compare: dodge the traps.', function () { return (GD.level || []).length >= 4; }, function () { aiGames('level'); }],
    ['order', 'Order the paragraph', 'Put a PACE paragraph back in order.', function () { return (GD.chains || []).length >= 3; }, function () { aiGames('chain'); }],
    ['spot', 'Spot the weak line', 'Find the line that earns nothing.', function () { return (GD.spot || []).length >= 3; }, spotOpen]];
  function open(id) {
    var g = LIST.filter(function (x) { return x[0] === id && x[3](); })[0];
    if (g) g[4]();
  }
  document.addEventListener('click', function (e) {
    if (!live() || !G.card.contains(e.target)) return;
    var t;
    if (e.target.closest('[data-eg-next]')) { G.i += 1; if (G.i >= G.list.length) { finish(); return; } ({ which: whichShow, pic: picShow, upgrade: upShow, link: linkShow, spot: spotShow })[G.kind](); return; }
    if (e.target.closest('[data-eg-again]')) { ({ which: whichOpen, pic: picOpen, upgrade: upOpen, link: linkOpen, spot: spotOpen })[G.kind](); return; }
    if (G.kind === 'which' && (t = e.target.closest('[data-eg-pick]'))) { whichPick(t); return; }
    if (G.kind === 'pic' && (t = e.target.closest('[data-eg-mom]'))) { picPick(t); return; }
    if (G.kind === 'upgrade' && (t = e.target.closest('[data-eg-up]'))) { upPick(t); return; }
    if (G.kind === 'link' && (t = e.target.closest('[data-eg-link]'))) { linkPick(t); return; }
    if (G.kind === 'spot' && (t = e.target.closest('[data-eg-line]'))) { spotPick(t); }
  });
  // Keys 1-4 pick an option.
  document.addEventListener('keydown', function (e) {
    if (!live() || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName) || !/^[1-4]$/.test(e.key)) return;
    var b = G.card.querySelectorAll('[data-eg-pick],[data-eg-mom],[data-eg-up],[data-eg-link],[data-eg-line]')[e.key - 1];
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  function finish() {
    var key = 'eng-' + G.kind + '-best', beat = best(key, G.got, G.list.length);
    end(G.got, G.list.length, beat ? 'A new best.' : { which: 'Key moments are your evidence: know whose they are.', pic: 'Picture the moment and you can write about it.', upgrade: 'Shows becomes highlights. Sad becomes bleak. Every time.', link: 'Vary your links: similarly, in contrast, to a far greater extent.', spot: 'No plot summary, no single-text paragraphs, no vague lines.' }[G.kind]);
  }
  window.EngGames = { list: LIST.filter(function (g) { return g[3](); }).map(function (g) { return g.slice(0, 3); }), open: open };
})();

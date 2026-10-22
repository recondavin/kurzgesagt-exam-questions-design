// Trivia board: Trivial Pursuit with the course, against the examiner (the user: "what about trivia the board game but
// instead it's like" the course). One move at a time, nothing against the clock.
//   The board  A ring of 25 squares, five per chapter, in the chapters' colours. Each chapter has one wedge square.
//   Your turn  Roll, then pick which way to go (both squares light up). A chapter's square asks one of its quick checks
//              (pick the answer); a wedge square you haven't won asks you to type the answer, marked against the
//              marking scheme. Right: roll again (and win the wedge). Wrong: you see the answer and his turn starts.
//   His turn   He rolls, moves (towards a wedge he needs) and answers out loud, right or wrong, so you see one more
//              question and its answer. Right, he goes again (three at most).
//   Winning    All five wedges, then a final typed question from any chapter on your next turn.
// The questions are the quick checks (tools/bio/checks/ch<N>.json, bio/checks<N>.js), only ones that make sense
// without the exam paper's diagram. A typed answer is marked like the answer sheet (BioApp.check against the part's
// scheme keys) and needs as many points as the check promises ("(2 points)"); checkmark.mjs proves each check's own
// answer earns them.
(function () {
  'use strict';
  var K = window.ExamAnswerMode && window.ExamAnswerMode.kit, BK = window.BioKit;
  if (!K || !BK) return;
  var esc = BK.esc, shuffle = BK.shuffle, pick = BK.pick, body = BK.body, buttons = BK.buttons;
  var CH = [28, 29, 30, 31, 32];
  var NAME = { 28: 'Breathing', 29: 'Urinary system', 30: 'Digestion', 31: 'Circulation', 32: 'Immunity' };
  // The chapters' colours: never green or red, which mean right and wrong.
  var COL = { 28: '#1CB0F6', 29: '#FFC800', 30: '#FF9600', 31: '#CE82FF', 32: '#2BD4BD' };
  var N = 25, STEP = 120, MAX_RUN = 3;
  // A question that needs the paper (its diagram, graph, table, an earlier part, or a letter on a diagram: "(B)", "X",
  // "organ A") can't be asked on its own. B and T cells and vitamin letters aren't diagram letters.
  var PIC = /diagram|graph|table|figure|picture|drawing|shown|above|below|underlined|experiment|investigation|the results|the data|labelled|\b(this|these|another)\b|\(([A-Z])\)|\b[B-HJ-Z]\b|\b(organ|part|structure|region|label|letter|vessel|gland|tube|area|point|line|layer|at|is) A\b/;
  function needsPaper(c) {
    var clean = function (t) { return t.replace(/\b[BT](?= ?(cells?|lymph))/g, '').replace(/vitamins? [A-Z]\b/gi, '').replace(/\bT\.S\./g, ''); };
    return PIC.test([c.q, c.right].concat(c.wrong).map(clean).join(' '));
  }
  // Each question goes on the board under what it's about, not just the chapter its exam question is filed in (the
  // user, of "Which blood vessel brings blood back to the heart from the lungs?" on a Breathing square: "are you sure
  // this is breathing?"; exam questions on one system often ask about another). The distinct topic words of each
  // chapter in the question and its answer are counted, and it moves only when another chapter has two more.
  function topicOf(c, ch) {
    var TOPIC = {
      28: /\b(lungs?|breath\w*|alveol\w*|trachea|bronch\w*|diaphragm|intercostal|inhal\w*|exhal\w*|asthma|respiratory|ventilat\w*|rib cage|ribs|thorax|thoracic|larynx|pleura\w*|gas exchange|lung capacity|tidal)\b/gi,
      29: /\b(kidneys?|nephron|urine|urin\w*|urea|adh|glomerul\w*|bowman\w*|tubules?|bladder|ureters?|urethra|excret\w*|homeostasis|renal|loop of henle|collecting duct|dialysis|filtration|reabsorb\w*|osmoregulat\w*)\b/gi,
      30: /\b(digest\w*|amylase|lipase|pepsin|protease|stomach|intestin\w*|vill\w*|bile|teeth|tooth|saliva\w*|oesophag\w*|peristal\w*|pancrea\w*|duoden\w*|ileum|colon|fibre|diet\w*|food|enzymes?|chyme|gall bladder|appendix|rectum|egest\w*|absorb\w*|lacteal|nutrition|vitamins?|faeces|mouth|chew\w*|emulsif\w*)\b/gi,
      31: /\b(heart|arter\w*|veins?|venous|capillar\w*|ventricl\w*|atri\w*|valves?|pulse|pulse rate|heart ?beats?|blood pressure|plasma|red blood cells?|platelets?|haemoglobin|sa node|av node|sino\w*|pacemaker|pulmonary|aorta|vena cava|circulat\w*|blood groups?|transfusion|clot\w*|systol\w*|diastol\w*|coronary|portal|cardiac|lymph\w*|heart rate|blood vessels?)\b/gi,
      32: /\b(immun\w*|antibod\w*|antigens?|lymphocytes?|b cells?|t cells?|vaccin\w*|pathogens?|phagocyt\w*|virus\w*|viral|bacteri\w*|infect\w*|inflammat\w*|macrophage\w*|monocyte\w*|white blood cells?|disease|antibiotic\w*|interferon|complement|memory cells?|helper|killer|suppressor|allerg\w*|hiv|aids)\b/gi
    };
    var text = c.q + ' ' + c.right, n = {}, best = ch;
    Object.keys(TOPIC).forEach(function (t) {
      var seen = {};
      (text.match(TOPIC[t]) || []).forEach(function (w) { seen[w.toLowerCase()] = 1; });
      n[t] = Object.keys(seen).length;
      if (n[t] > n[best]) best = +t;
    });
    return n[best] - n[ch] >= 2 ? best : ch;
  }
  var SAY = {
    start: ['Five wedges. One final question. Try to keep up.', 'My board. My rules. Roll.'],
    right: ['Hmph. Correct.', 'Fine. Go again.', 'Lucky.'],
    wrong: ['Wrong. My turn.', 'No. Watch and learn.', 'Did you even read it?'],
    wedge: ['A wedge. Don\'t get comfortable.', 'Hmph. You earned that one.'],
    hisRight: ['Too easy.', 'Obviously.', 'Correct. As always.'],
    hisWrong: ['Hmph. A slip.', 'That didn\'t happen.', 'The question was badly worded.']
  };
  var G = null;
  function live() { return G && G.card.isConnected; }
  function wait(fn, ms) { return K.later(function () { if (live()) fn(); }, ms); }

  // ---------------------------------------------------------------- the board and the questions
  // Square i: each block of five starts with a chapter's wedge, then one square of each other chapter.
  function squares() {
    var out = [];
    for (var i = 0; i < N; i++) {
      var block = Math.floor(i / 5), off = i % 5;
      out.push({ ch: CH[(block + off) % 5], wedge: off === 0 });
    }
    return out;
  }
  // Each question: where it's filed (src, for marking against its part) and the board chapter it's about (ch).
  function pools() {
    var P = {};
    CH.forEach(function (ch) { P[ch] = { mc: [], typed: [], at: 0, tat: 0 }; });
    CH.forEach(function (src) {
      var Q = ((window.BioQuestions || {})[src] || {}).questions || [], C = (window.BioChecks || {})[src] || {};
      Q.forEach(function (q) {
        (C[q.id] || []).forEach(function (c, k) {
          if (needsPaper(c)) return;
          var ch = topicOf(c, src), item = { ch: ch, src: src, qid: q.id, k: k, c: c };
          P[ch].mc.push(item);
          var p = q.parts[k], keyed = p && p.kind === 'text' ? p.pts.filter(function (t) { return t.k && !t.self; }).length : 0;
          if (keyed && !/^(True|False)$/.test(c.right)) {
            var m = c.q.match(/\((\d) points\)$/);
            P[ch].typed.push({ ch: ch, src: src, qid: q.id, k: k, c: c, want: Math.min(m ? +m[1] : 1, keyed, p.n || 1) });
          }
        });
      });
    });
    CH.forEach(function (ch) { P[ch].mc = shuffle(P[ch].mc); P[ch].typed = shuffle(P[ch].typed); });
    return P;
  }
  function nextQ(ch, typed) {
    var p = G.pools[ch], list = typed ? p.typed : p.mc, key = typed ? 'tat' : 'at';
    if (!list.length) return null;
    var item = list[p[key] % list.length];
    p[key] += 1;
    return item;
  }

  // ---------------------------------------------------------------- drawing
  function polar(r, deg) { var a = (deg - 90) * Math.PI / 180; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  function sector(r1, r2, a1, a2) {
    var p1 = polar(r2, a1), p2 = polar(r2, a2), p3 = polar(r1, a2), p4 = polar(r1, a1);
    return 'M' + p1.join(' ') + 'A' + r2 + ' ' + r2 + ' 0 0 1 ' + p2.join(' ') + 'L' + p3.join(' ') + 'A' + r1 + ' ' + r1 + ' 0 0 0 ' + p4.join(' ') + 'Z';
  }
  function f(n) { return Math.round(n * 10) / 10; }
  // A pie of the five wedges: the won ones in their chapter's colour.
  function pie(won, cx, cy, r) {
    return CH.map(function (ch, i) {
      var a1 = i * 72, a2 = a1 + 72, p1 = [cx + r * Math.sin(a1 * Math.PI / 180), cy - r * Math.cos(a1 * Math.PI / 180)], p2 = [cx + r * Math.sin(a2 * Math.PI / 180), cy - r * Math.cos(a2 * Math.PI / 180)];
      return '<path d="M' + cx + ' ' + cy + 'L' + p1.map(f).join(' ') + 'A' + r + ' ' + r + ' 0 0 1 ' + p2.map(f).join(' ') + 'Z" fill="' + (won[ch] ? COL[ch] : '#2B3B42') + '" stroke="#18272D" stroke-width="' + (r > 30 ? 3 : 2) + '"/>';
    }).join('');
  }
  function boardSvg() {
    var span = 360 / N, out = '';
    G.sq.forEach(function (s, i) {
      var a1 = i * span + 0.8, a2 = (i + 1) * span - 0.8, mid = (a1 + a2) / 2, c = polar(170, mid);
      out += '<g class="tb-sq' + (s.wedge ? ' is-wedge' : '') + '" data-tb-sq="' + i + '"><path d="' + sector(132, 196, a1, a2) + '" fill="' + COL[s.ch] + '"/>' +
        (s.wedge ? '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="11" fill="#18272D"/><path d="M' + f(c[0]) + ' ' + f(c[1] - 7) + 'L' + f(c[0] + 6) + ' ' + f(c[1] + 4) + 'L' + f(c[0] - 6) + ' ' + f(c[1] + 4) + 'Z" fill="' + COL[s.ch] + '"/>' : '') + '</g>';
    });
    return '<svg viewBox="0 0 400 400" role="img" aria-label="The board"><circle cx="200" cy="200" r="122" fill="#202F36"/>' + out +
      '<g data-tb-centre>' + pie({}, 200, 200, 70) + '</g><text class="tb-centre" x="200" y="206" text-anchor="middle">Final</text>' +
      '<g data-tb-tok="1" class="tb-tok tb-tok--him"><circle r="13"/><text y="5" text-anchor="middle">T</text></g>' +
      '<g data-tb-tok="0" class="tb-tok tb-tok--you"><circle r="13"/><text y="5" text-anchor="middle">You</text></g></svg>';
  }
  function placeTokens() {
    var span = 360 / N;
    [0, 1].forEach(function (p) {
      var tok = G.card.querySelector('[data-tb-tok="' + p + '"]');
      if (!tok) return;
      var same = G.pos[0] === G.pos[1], mid = G.pos[p] * span + span / 2, c = polar(same ? (p ? 152 : 182) : 165, mid);
      tok.setAttribute('transform', 'translate(' + f(c[0]) + ' ' + f(c[1]) + ')');
    });
  }
  function pies() {
    return [['You', 0], ['Teacher', 1]].map(function (x) {
      var won = G.wedges[x[1]], n = CH.filter(function (ch) { return won[ch]; }).length;
      return '<div class="tb-player' + (G.turn === x[1] ? ' is-turn' : '') + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + pie(won, 20, 20, 18) + '</svg>' +
        '<span class="tb-player__n">' + x[0] + '</span><span class="tb-player__w num">' + n + '/5</span></div>';
    }).join('');
  }
  function chip(ch, extra) { return '<span class="tb-chip" style="--c:' + COL[ch] + '">' + esc(NAME[ch]) + (extra ? ' · ' + extra : '') + '</span>'; }
  function die(n) {
    var P = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] };
    return '<svg class="tb-die" viewBox="0 0 40 40" aria-label="' + (n ? 'Rolled ' + n : 'Die') + '"><rect x="2" y="2" width="36" height="36" rx="8"/>' +
      (P[n] || []).map(function (d) { return '<circle cx="' + d[0] * 10 + '" cy="' + d[1] * 10 + '" r="3.6"/>'; }).join('') + '</svg>';
  }
  function panel(html) {
    var p = G.card.querySelector('[data-tb-panel]');
    p.innerHTML = '<div class="tb-players">' + pies() + '</div>' + html;
    show(p);
    return p;
  }
  // On a phone the turn is under the board: bring it (or the button to go on) into view.
  function show(node) { if (window.innerWidth <= 760 && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }

  // ---------------------------------------------------------------- the game
  function open() {
    G = { card: BK.host(28, 'Trivia board'), sq: squares(), pools: pools(), pos: [0, 0], wedges: [{}, {}], turn: 0, run: 0, right: 0, asked: 0 };
    K.gameHud(G.card, 0, '');
    body(G.card, '<div class="tb"><div class="tb-board">' + boardSvg() + '<ul class="tb-key">' + CH.map(function (ch) {
      return '<li style="--c:' + COL[ch] + '">' + esc(NAME[ch]) + '</li>';
    }).join('') + '<li class="tb-key__wedge">Wedge square</li></ul></div><div class="tb-panel" data-tb-panel aria-live="polite"></div></div>', true);
    buttons(G.card, [['more', 'data-am-keep', 'Close']], true);
    placeTokens();
    K.mascot('ok', pick(SAY.start));
    yourTurn();
  }
  function hasAll(p) { return CH.every(function (ch) { return G.wedges[p][ch]; }); }
  // The centre shows your wedges (his are on his pie beside the board).
  function centre() { G.card.querySelector('[data-tb-centre]').innerHTML = pie(G.wedges[0], 200, 200, 70); }
  function yourTurn() {
    G.turn = 0;
    G.phase = 'roll';
    if (hasAll(0)) { finalQuestion(); return; }
    panel('<p class="tb-say"><b>Your turn.</b> Roll the die.</p><div class="tb-roll">' + die(0) + '<button type="button" class="tb-btn tb-btn--go" data-tb-roll>Roll</button></div>');
    var b = G.card.querySelector('[data-tb-roll]');
    if (b) b.focus({ preventScroll: true });
  }
  // The die tumbles for a moment, then shows the roll.
  function roll(done) {
    var n = 1 + Math.floor(Math.random() * 6), spins = 7;
    (function spin() {
      if (!live()) return;
      if (spins-- > 0) {
        var d = G.card.querySelector('.tb-die');
        if (d) d.outerHTML = die(1 + Math.floor(Math.random() * 6));
        wait(spin, 70);
        return;
      }
      var d2 = G.card.querySelector('.tb-die');
      if (d2) d2.outerHTML = die(n);
      done(n);
    })();
  }
  function targets(p, n) { return [(G.pos[p] + n) % N, (G.pos[p] - n + N) % N]; }
  function rolled(n) {
    G.phase = 'pick';
    G.roll = n;
    var t = targets(0, n);
    t.forEach(function (i) { G.card.querySelector('[data-tb-sq="' + i + '"]').classList.add('is-target'); });
    panel('<div class="tb-roll">' + die(n) + '<p class="tb-say">You rolled <b>' + n + '</b>. Which way?</p></div><div class="tb-picks">' + t.map(function (i, k) {
      var s = G.sq[i], need = s.wedge && !G.wedges[0][s.ch];
      return '<button type="button" class="tb-pick" data-tb-go="' + i + '" style="--c:' + COL[s.ch] + '"><span class="tb-pick__dir">' + (k ? 'Back' : 'On') + '</span>' +
        '<span class="tb-pick__ch">' + esc(NAME[s.ch]) + '</span><span class="tb-pick__what">' + (need ? 'Wedge question' : s.wedge ? 'Wedge (won)' : 'Question') + '</span></button>';
    }).join('') + '</div>');
  }
  // The token walks there a square at a time, the short way round.
  function walk(p, to, done) {
    var dir = (G.pos[p] + G.roll) % N === to ? 1 : -1, left = G.roll;
    G.card.querySelectorAll('.is-target').forEach(function (x) { x.classList.remove('is-target'); });
    (function step() {
      if (left-- <= 0) { done(); return; }
      G.pos[p] = (G.pos[p] + dir + N) % N;
      placeTokens();
      wait(step, STEP);
    })();
  }
  function land(p) {
    var s = G.sq[G.pos[p]], wedge = s.wedge && !G.wedges[p][s.ch];
    if (p === 1) { hisAnswer(s.ch, wedge); return; }
    if (wedge) typedQuestion(s.ch, 'wedge');
    else choiceQuestion(s.ch);
  }
  function choiceQuestion(ch) {
    var item = nextQ(ch, false);
    if (!item) { yourTurn(); return; }
    G.phase = 'ask';
    G.item = item;
    var opts = shuffle([item.c.right].concat(item.c.wrong));
    panel(chip(ch) + '<p class="tb-q">' + esc(item.c.q) + '</p><div class="tb-opts">' + opts.map(function (o) {
      return '<button type="button" class="tb-opt" data-tb-opt="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div><p class="tb-why" data-tb-why hidden></p>');
  }
  function choose(btn) {
    if (G.phase !== 'ask') return;
    G.phase = 'shown';
    var item = G.item, ok = btn.getAttribute('data-tb-opt') === item.c.right;
    G.asked += 1;
    G.card.querySelectorAll('[data-tb-opt]').forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-tb-opt') === item.c.right) b.classList.add('is-ok');
    });
    if (!ok) btn.classList.add('is-no');
    var why = G.card.querySelector('[data-tb-why]');
    why.textContent = item.c.why;
    why.hidden = false;
    answered(ok, false, item.ch);
  }
  function typedQuestion(ch, why) {
    var item = nextQ(ch, true);
    if (!item) { choiceQuestion(ch); return; }
    G.phase = 'ask';
    G.item = item;
    G.kind = why;
    panel(chip(ch, why === 'final' ? 'Final question' : 'Wedge question') + '<p class="tb-q">' + esc(item.c.q) + '</p>' +
      '<textarea class="tb-text" data-tb-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
      '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-tb-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-tb-dunno>I don\'t know</button></div>' +
      '<div class="tb-result" data-tb-result hidden></div>');
    var t = G.card.querySelector('[data-tb-text]');
    if (t) t.focus({ preventScroll: true });
  }
  function check(dunno) {
    if (G.phase !== 'ask') return;
    var item = G.item, text = dunno ? '' : (G.card.querySelector('[data-tb-text]').value || '').trim();
    if (!dunno && !text) { G.card.querySelector('[data-tb-text]').focus(); return; }
    G.phase = 'shown';
    G.asked += 1;
    var got = text && window.BioApp ? window.BioApp.check(item.src, item.qid, item.k, text).filter(Boolean).length : 0, ok = got >= item.want;
    G.card.querySelector('[data-tb-text]').disabled = true;
    G.card.querySelectorAll('[data-tb-check], [data-tb-dunno]').forEach(function (b) { b.hidden = true; });
    var res = G.card.querySelector('[data-tb-result]');
    res.innerHTML = (ok ? '<p class="tb-mark is-ok">Correct' + (item.want > 1 ? ': ' + item.want + ' points' : '') + '</p>'
      : '<p class="tb-mark is-no">' + (dunno ? 'The answer' : got ? 'Not enough: ' + got + ' of ' + item.want + ' points' : 'Not this time') + '</p>') +
      '<p class="tb-ans"><b>Answer:</b> ' + esc(item.c.right) + '</p><p class="tb-why">' + esc(item.c.why) + '</p>';
    res.hidden = false;
    answered(ok, G.kind, item.ch);
  }
  // After your answer: right, you go again (winning the wedge or the game); wrong, he goes.
  function answered(ok, kind, ch) {
    if (ok) {
      G.right += 1;
      K.ding(kind ? 4 : 2, true);
      if (kind === 'final') { K.later(function () { if (live()) end(0); }, 900); return; }
      if (kind === 'wedge') { G.wedges[0][ch] = true; centre(); K.mascot('angry', pick(SAY.wedge)); }
      else K.mascot('ok', pick(SAY.right));
    } else {
      K.bonk();
      K.mascot('happy', pick(SAY.wrong));
    }
    var p = G.card.querySelector('[data-tb-panel]');
    p.querySelector('.tb-players').innerHTML = pies();
    var next = el('div', 'tb-row tb-row--next', '<button type="button" class="tb-btn tb-btn--go" data-tb-next>' + (ok ? (hasAll(0) ? 'Final question' : 'Roll again') : 'His turn') + '</button>');
    p.appendChild(next);
    G.after = ok ? yourTurn : hisTurn;
    next.querySelector('button').focus({ preventScroll: true });
    show(next);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; }
  function finalQuestion() { typedQuestion(CH[Math.floor(Math.random() * CH.length)], 'final'); }

  // ---------------------------------------------------------------- his turn
  function hisTurn() {
    G.turn = 1;
    G.phase = 'him';
    G.run = 0;
    hisGo();
  }
  function hisGo() {
    if (hasAll(1)) { hisAnswer(CH[Math.floor(Math.random() * CH.length)], 'final'); return; }
    panel('<div class="tb-roll">' + die(0) + '<p class="tb-say"><b>His turn.</b> He rolls.</p></div>');
    roll(function (n) {
      G.roll = n;
      var t = targets(1, n), want = t.filter(function (i) { return G.sq[i].wedge && !G.wedges[1][G.sq[i].ch]; });
      var to = want.length ? want[0] : t[Math.floor(Math.random() * 2)];
      panel('<div class="tb-roll">' + die(n) + '<p class="tb-say">He rolled <b>' + n + '</b>.</p></div>');
      wait(function () { walk(1, to, function () { wait(function () { land(1); }, 250); }); }, 450);
    });
  }
  // He answers out loud: you see the question, then whether he got it, and the answer either way.
  function hisAnswer(ch, kind) {
    var typed = kind === 'final' || kind === true, item = nextQ(ch, typed) || nextQ(ch, false);
    var odds = kind === 'final' ? 0.4 : typed ? 0.5 : 0.65, ok = Math.random() < odds;
    panel(chip(ch, kind === 'final' ? 'His final question' : typed ? 'His wedge question' : 'His question') + '<p class="tb-q">' + esc(item ? item.c.q : '') + '</p>' +
      '<p class="tb-say tb-think">He thinks…</p>');
    wait(function () {
      var p = G.card.querySelector('[data-tb-panel]');
      p.querySelector('.tb-think').outerHTML = '<p class="tb-mark ' + (ok ? 'is-ok">He got it' : 'is-no">He got it wrong') + '</p>' +
        (item ? '<p class="tb-ans"><b>Answer:</b> ' + esc(item.c.right) + '</p>' : '');
      if (ok) {
        K.mascot('happy', pick(SAY.hisRight));
        if (kind === 'final') { wait(function () { end(1); }, 1400); return; }
        if (typed) { G.wedges[1][ch] = true; centre(); }
      } else K.mascot('angry', pick(SAY.hisWrong));
      p.querySelector('.tb-players').innerHTML = pies();
      G.run += 1;
      var again = ok && G.run < MAX_RUN;
      p.appendChild(el('div', 'tb-row tb-row--next', '<button type="button" class="tb-btn tb-btn--go" data-tb-next>' + (again ? 'He goes again' : 'Your turn') + '</button>'));
      G.after = again ? hisGo : yourTurn;
      p.querySelector('[data-tb-next]').focus({ preventScroll: true });
      show(p.querySelector('[data-tb-next]'));
    }, 1300);
  }

  // ---------------------------------------------------------------- the end
  function end(winner) {
    G.phase = 'over';
    var wins = +(K.store('bio-board-wins') || 0) + (winner ? 0 : 1);
    if (!winner) K.store('bio-board-wins', String(wins));
    K.store('bio-board-played', String(+(K.store('bio-board-played') || 0) + 1));
    body(G.card, '<div class="am-games__end"><svg class="tb-endpie" viewBox="0 0 40 40" aria-hidden="true">' + pie(G.wedges[winner], 20, 20, 18) + '</svg>' +
      '<h3 class="am-games__title">' + (winner ? 'The teacher wins.' : 'You win!') + '</h3>' +
      '<p class="am-games__sub">You got ' + G.right + ' of ' + G.asked + ' questions right' + (wins ? '. Games won: ' + wins : '') + '.</p></div>');
    buttons(G.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-tb-again', 'Play again']]);
    K.mascot(winner ? 'happy' : 'angry', winner ? 'As expected. Again?' : 'Hmph. Fine. You win. This time.');
    if (!winner) K.later(K.fanfare, 300);
  }

  document.addEventListener('click', function (e) {
    if (!live() || !G.card.contains(e.target)) return;
    var t;
    if (e.target.closest('[data-tb-again]')) { open(); return; }
    if (G.phase === 'roll' && e.target.closest('[data-tb-roll]')) {
      G.phase = 'rolling';
      e.target.closest('[data-tb-roll]').disabled = true;
      roll(rolled);
      return;
    }
    if (G.phase === 'pick' && (t = e.target.closest('[data-tb-go], [data-tb-sq].is-target'))) {
      var to = +(t.getAttribute('data-tb-go') || t.getAttribute('data-tb-sq'));
      G.phase = 'walking';
      walk(0, to, function () { wait(function () { land(0); }, 200); });
      return;
    }
    if ((t = e.target.closest('[data-tb-opt]'))) { choose(t); return; }
    if (e.target.closest('[data-tb-check]')) { check(false); return; }
    if (e.target.closest('[data-tb-dunno]')) { check(true); return; }
    if (e.target.closest('[data-tb-next]') && G.after) { var go = G.after; G.after = null; go(); }
  });
  // Enter checks a typed answer (Shift+Enter for a new line).
  document.addEventListener('keydown', function (e) {
    if (!live() || e.key !== 'Enter' || e.shiftKey || !e.target.closest || !e.target.closest('[data-tb-text]')) return;
    e.preventDefault();
    check(false);
  });
  window.BioBoard = { open: open, state: function () { return G; } };
})();

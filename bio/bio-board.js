// Trivia board: Trivial Pursuit with the course, against the examiner (the user: "what about trivia the board game but
// instead it's like" the course). One move at a time, nothing against the clock.
//   The board  Like the real game's: a ring of 30 squares in the chapters' colours, each chapter's headquarters (its
//              wedge square) and white roll-again squares, with spokes into a five-sided hub for the final.
//   Your turn  Roll, then pick which way to go (both squares light up). A chapter's square asks one of its quick checks
//              (pick the answer); a wedge square you haven't won asks you to type the answer, marked against the
//              marking scheme. Right: roll again (and win the wedge). Wrong: you see the answer and his turn starts.
//   His turn   He rolls, moves (towards a wedge he needs) and answers out loud, right or wrong, so you see one more
//              question and its answer. Right, he goes again (three at most).
//   Winning    All five wedges, then down a spoke to the hub for a final typed question from any chapter.
// The questions are the quick checks (tools/bio/checks/ch<N>.json, bio/checks<N>.js), only ones that make sense
// without the exam paper (each check's "board": true, false, or the question rewritten with the context it needs). A typed answer is marked like the answer sheet (BioApp.check against the part's
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
  var N = 30, STEP = 120, MAX_RUN = 3;
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
  // The ring: every sixth square is a chapter's headquarters (its wedge); between two, one square of each other chapter
  // with a roll-again square in the middle.
  function squares() {
    var out = [];
    for (var i = 0; i < N; i++) {
      var k = Math.floor(i / 6), off = i % 6;
      out.push(off === 0 ? { type: 'hq', ch: CH[k] } : off === 3 ? { type: 'again' } : { type: 'q', ch: CH[(k + (off < 3 ? off : off - 1)) % 5] });
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
          // Each check says whether it makes sense alone ("board": true, false, or the question rewritten with the bit of
          // the exam question it needs; checked by hand for every check). Without that, the filter decides.
          if (c.board === false || (c.board == null && needsPaper(c))) return;
          var text = typeof c.board === 'string' ? c.board : c.q;
          var ch = topicOf({ q: text, right: c.right }, src), item = { ch: ch, src: src, qid: q.id, k: k, c: c, text: text };
          P[ch].mc.push(item);
          var p = q.parts[k], keyed = p && p.kind === 'text' ? p.pts.filter(function (t) { return t.k && !t.self; }).length : 0;
          if (keyed && !/^(True|False)$/.test(c.right)) {
            var m = c.q.match(/\((\d) points\)$/);
            P[ch].typed.push({ ch: ch, src: src, qid: q.id, k: k, c: c, text: text, want: Math.min(m ? +m[1] : 1, keyed, p.n || 1) });
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
  // The board looks like the real game's (the user: "make it really look like trivia, like the game with the cards"): a
  // cream wheel with a dark rim; a ring of squares in the chapters' colours with a big headquarters square for each
  // chapter's wedge and white roll-again squares; five spokes of squares into a five-sided hub. The pieces are pies
  // that fill with the wedges won; questions come on cards drawn from a deck, which flip over to the answer.
  var INK = '#13294A';
  function polar(r, deg) { var a = (deg - 90) * Math.PI / 180; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  function sector(r1, r2, a1, a2) {
    var p1 = polar(r2, a1), p2 = polar(r2, a2), p3 = polar(r1, a2), p4 = polar(r1, a1);
    return 'M' + p1.map(f).join(' ') + 'A' + r2 + ' ' + r2 + ' 0 0 1 ' + p2.map(f).join(' ') + 'L' + p3.map(f).join(' ') + 'A' + r1 + ' ' + r1 + ' 0 0 0 ' + p4.map(f).join(' ') + 'Z';
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function mid(i) { return i * 360 / N + 180 / N; }
  // A pie of the five wedges: the won ones in their chapter's colour.
  function pie(won, cx, cy, r) {
    return CH.map(function (ch, i) {
      var a1 = i * 72, a2 = a1 + 72, p1 = [cx + r * Math.sin(a1 * Math.PI / 180), cy - r * Math.cos(a1 * Math.PI / 180)], p2 = [cx + r * Math.sin(a2 * Math.PI / 180), cy - r * Math.cos(a2 * Math.PI / 180)];
      return '<path d="M' + cx + ' ' + cy + 'L' + p1.map(f).join(' ') + 'A' + r + ' ' + r + ' 0 0 1 ' + p2.map(f).join(' ') + 'Z" fill="' + (won[ch] ? COL[ch] : '#D9DEE3') + '" stroke="' + INK + '" stroke-width="' + (r > 20 ? 2 : 1) + '"/>';
    }).join('');
  }
  // A playing piece: a pie in a rim (yours white, his navy).
  function piece(p, cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (p ? INK : '#FFFFFF') + '" stroke="' + INK + '" stroke-width="2"/>' + pie(G.wedges[p], cx, cy, r * 0.68);
  }
  function wedgeIcon(cx, cy) {
    var p1 = [cx - 7, cy + 5], p2 = [cx + 7, cy + 5];
    return '<path d="M' + f(cx) + ' ' + f(cy - 8) + 'L' + p1.map(f).join(' ') + 'Q' + f(cx) + ' ' + f(cy + 9) + ' ' + p2.map(f).join(' ') + 'Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.5"/>';
  }
  function dieIcon(cx, cy) {
    return '<rect x="' + f(cx - 7) + '" y="' + f(cy - 7) + '" width="14" height="14" rx="3" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<circle cx="' + f(cx - 3) + '" cy="' + f(cy - 3) + '" r="1.6" fill="' + INK + '"/><circle cx="' + f(cx + 3) + '" cy="' + f(cy + 3) + '" r="1.6" fill="' + INK + '"/>';
  }
  function boardSvg() {
    var span = 360 / N, out = '';
    // The spokes: four squares from each headquarters to the hub, in the other chapters' colours.
    G.sq.forEach(function (s, i) {
      if (s.type !== 'hq') return;
      var a = mid(i), k = CH.indexOf(s.ch);
      [0, 1, 2, 3].forEach(function (j) {
        var c = polar(64 + j * 21.5, a);
        out += '<rect x="-12" y="-10" width="24" height="20" rx="3" fill="' + COL[CH[(k + 1 + j) % 5]] + '" stroke="' + INK + '" stroke-width="1.5" transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') rotate(' + f(a) + ')"/>';
      });
    });
    G.sq.forEach(function (s, i) {
      var a1 = i * span, a2 = (i + 1) * span, c = polar(168, mid(i));
      out += '<g class="tb-sq tb-sq--' + s.type + '" data-tb-sq="' + i + '">' + (s.type === 'hq'
        ? '<path d="' + sector(142, 194, a1 + 0.2, a2 - 0.2) + '" fill="' + COL[s.ch] + '" stroke="' + INK + '" stroke-width="2"/>' + wedgeIcon(c[0], c[1])
        : '<path d="' + sector(150, 186, a1 + 0.2, a2 - 0.2) + '" fill="' + (s.type === 'again' ? '#FFFFFF' : COL[s.ch]) + '" stroke="' + INK + '" stroke-width="1.5"/>' + (s.type === 'again' ? dieIcon(c[0], c[1]) : '')) + '</g>';
    });
    // The hub: five triangles, one pointing up each chapter's spoke.
    var hub = G.sq.map(function (s, i) {
      if (s.type !== 'hq') return '';
      var a = mid(i), p1 = polar(54, a - 36), p2 = polar(54, a + 36);
      return '<path d="M200 200L' + p1.map(f).join(' ') + 'L' + p2.map(f).join(' ') + 'Z" fill="' + COL[s.ch] + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    }).join('');
    return '<svg viewBox="0 0 400 400" role="img" aria-label="The board"><circle cx="200" cy="200" r="199" fill="' + INK + '"/><circle cx="200" cy="200" r="193" fill="#F6EBD3"/>' +
      out + hub + '<circle cx="200" cy="200" r="15" fill="#F6EBD3" stroke="' + INK + '" stroke-width="2"/>' +
      '<g data-tb-tok="1" class="tb-tok"></g><g data-tb-tok="0" class="tb-tok"></g></svg>';
  }
  // Where a piece stands: a square of the ring, the hub, or a point on its way down a spoke.
  function spot(p) {
    if (G.xy[p]) return G.xy[p];
    if (G.pos[p] === 'hub') return [200, 200];
    return polar(168, mid(G.pos[p]));
  }
  function placeTokens() {
    [0, 1].forEach(function (p) {
      var tok = G.card.querySelector('[data-tb-tok="' + p + '"]');
      if (!tok) return;
      var c = spot(p), o = spot(1 - p), same = Math.abs(c[0] - o[0]) < 1 && Math.abs(c[1] - o[1]) < 1, dx = same ? (p ? 9 : -9) : 0;
      tok.innerHTML = piece(p, 0, 0, 14);
      tok.setAttribute('transform', 'translate(' + f(c[0] + dx) + ' ' + f(c[1]) + ')');
    });
  }
  function pies() {
    return [['You', 0], ['Teacher', 1]].map(function (x) {
      var won = G.wedges[x[1]], n = CH.filter(function (ch) { return won[ch]; }).length;
      return '<div class="tb-player' + (G.turn === x[1] ? ' is-turn' : '') + '"><svg viewBox="0 0 40 40" aria-hidden="true">' + piece(x[1], 20, 20, 18) + '</svg>' +
        '<span class="tb-player__n">' + x[0] + '</span><span class="tb-player__w num">' + n + '/5</span></div>';
    }).join('');
  }
  function die(n, rolling) {
    var P = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] };
    return '<svg class="tb-die' + (rolling ? ' is-rolling' : '') + '" viewBox="0 0 40 40" aria-label="' + (n ? 'Rolled ' + n : 'Die') + '"><rect x="2" y="2" width="36" height="36" rx="8"/>' +
      (P[n] || P[5]).map(function (d) { return '<circle cx="' + d[0] * 10 + '" cy="' + d[1] * 10 + '" r="3.6"/>'; }).join('') + '</svg>';
  }
  // The deck of question cards, face down.
  function deck() {
    return '<div class="tb-deck" aria-hidden="true"><i></i><i></i><i><svg viewBox="0 0 40 40">' + pie({ 28: 1, 29: 1, 30: 1, 31: 1, 32: 1 }, 20, 20, 13) + '</svg></i></div>';
  }
  // A question card: the chapter's band, the question on the front; the answer on the back, shown by flipping it.
  function card(ch, label, front) {
    var band = '<div class="tb-card__band"><b>' + esc(NAME[ch]) + '</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div>';
    return '<div class="tb-card" style="--c:' + COL[ch] + '" data-tb-card><div class="tb-card__in">' +
      '<div class="tb-card__face tb-card__front">' + band + '<div class="tb-card__body">' + front + '</div></div>' +
      '<div class="tb-card__face tb-card__back" aria-hidden="true">' + band + '<div class="tb-card__body" data-tb-back></div></div></div></div>';
  }
  // Turn the card over to its back, filled with the answer.
  function flip(html) {
    var c = G.card.querySelector('[data-tb-card]');
    if (!c) return;
    var back = c.querySelector('[data-tb-back]');
    back.innerHTML = html;
    c.querySelector('.tb-card__back').removeAttribute('aria-hidden');
    c.querySelector('.tb-card__front').setAttribute('aria-hidden', 'true');
    c.classList.add('is-flipped');
  }
  function panel(html) {
    var p = G.card.querySelector('[data-tb-panel]');
    p.innerHTML = '<div class="tb-players">' + pies() + '</div>' + html;
    show(p);
    return p;
  }
  // Bring the turn (or the button to go on) into view when it's below the card's fold: on a phone the turn is under the
  // board, and on a laptop a big question card can run past the bottom.
  function show(node) { if (node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function nextButton(label, then) {
    var p = G.card.querySelector('[data-tb-panel]'), row = el('div', 'tb-row tb-row--next', '<button type="button" class="tb-btn tb-btn--go" data-tb-next>' + label + '</button>');
    p.querySelector('.tb-players').innerHTML = pies();
    p.appendChild(row);
    G.after = then;
    row.querySelector('button').focus({ preventScroll: true });
    show(row);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; }

  // ---------------------------------------------------------------- the game
  function open() {
    G = { card: BK.host(28, 'Trivia board'), sq: squares(), pools: pools(), pos: [0, 0], xy: [null, null], wedges: [{}, {}], turn: 0, run: 0, right: 0, asked: 0 };
    K.gameHud(G.card, 0, '');
    body(G.card, '<div class="tb"><div class="tb-board">' + boardSvg() + '<ul class="tb-key">' + CH.map(function (ch) {
      return '<li style="--c:' + COL[ch] + '">' + esc(NAME[ch]) + '</li>';
    }).join('') + '<li class="tb-key__wedge">Wedge</li><li class="tb-key__again">Roll again</li></ul></div><div class="tb-panel" data-tb-panel aria-live="polite"></div></div>', true);
    buttons(G.card, [['more', 'data-am-keep', 'Close']], true);
    G.card.querySelector('.am-finish__card').classList.add('tb-wide');
    placeTokens();
    K.mascot('ok', pick(SAY.start));
    nearMascot(G.card);
    yourTurn();
  }
  // The examiner stands right beside the board (the user: "make him closer to the trivia board", then "higher up"), not
  // out in the screen's corner: this moves him up to the card's left edge, his feet level with the card's bottom (after
  // the card has popped in). On a wide screen both are bigger (the user: "make the whole board bigger and make him
  // bigger as well"): he is up to 320px wide (answer-mode.js makes him at most 220) and the card up to 1200px (900),
  // sharing the width so he still fits beside it. Under 1100px wide, answer-mode.js's sizes stay.
  // The other question games (bio-quizgames.js) place him the same way, so it takes the game's card.
  function nearMascot(card) {
    [0, 120, 700].forEach(function (ms) {
      K.later(function () {
        if (!card.isConnected) return;
        var m = document.querySelector('.am-root .am-mascot'), box = card.querySelector('.am-finish__card');
        if (!m || !box || !m.offsetParent) return;
        var W = m.offsetParent.clientWidth;
        if (W >= 1100) {
          // At least his old 220px, unless that would squeeze the card under 860px.
          var t = Math.round(Math.min(320, Math.max(220, (W - 1200) / 2 - 30)));
          if (W - 2 * (t + 30) < 860) t = Math.max(180, Math.round((W - 860) / 2 - 30));
          box.style.setProperty('--tbw', Math.min(1200, W - 2 * (t + 30)) + 'px');
          m.style.setProperty('--size', t + 'px');
        } else box.style.removeProperty('--tbw');
        // Hidden (no room beside the card, as on a phone): leave him where answer-mode.js keeps him, out of sight.
        if (!m.classList.contains('is-on')) { m.style.left = m.style.bottom = ''; return; }
        var root = m.offsetParent.getBoundingClientRect(), r = box.getBoundingClientRect();
        // A clear gap between him and the board, so his bubble doesn't cover it (the user: "put him to the left").
        m.style.left = Math.max(14, (m.offsetParent.clientWidth - box.offsetWidth) / 2 - m.offsetWidth - 60) + 'px';
        m.style.bottom = Math.max(10, Math.round(root.bottom - r.bottom)) + 'px';
      }, ms);
    });
  }
  window.addEventListener('resize', function () { if (live()) nearMascot(G.card); });
  function hasAll(p) { return CH.every(function (ch) { return G.wedges[p][ch]; }); }
  function yourTurn() {
    G.turn = 0;
    G.phase = 'roll';
    if (hasAll(0)) {
      G.phase = 'centre';
      panel('<p class="tb-say"><b>All five wedges!</b> ' + (G.pos[0] === 'hub' ? 'Answer the final question to win.' : 'Head to the centre for the final question.') + '</p>' +
        '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-tb-final>' + (G.pos[0] === 'hub' ? 'Final question' : 'Go to the centre') + '</button></div>');
      return;
    }
    panel('<p class="tb-say tb-turn"><b>Your turn.</b> Roll the die.</p><div class="tb-tray">' + deck() + die(0) + '<button type="button" class="tb-btn tb-btn--go tb-btn--roll" data-tb-roll>Roll</button></div>');
    var b = G.card.querySelector('[data-tb-roll]');
    if (b) b.focus({ preventScroll: true });
  }
  // The die tumbles for a moment, then shows the roll.
  function roll(done) {
    var n = 1 + Math.floor(Math.random() * 6), spins = 7;
    (function spin() {
      if (!live()) return;
      var d = G.card.querySelector('.tb-die');
      if (spins-- > 0) {
        if (d) d.outerHTML = die(1 + Math.floor(Math.random() * 6), true);
        wait(spin, 80);
        return;
      }
      if (d) d.outerHTML = die(n);
      done(n);
    })();
  }
  function targets(p, n) { return [(G.pos[p] + n) % N, (G.pos[p] - n + N) % N]; }
  function what(p, i) {
    var s = G.sq[i];
    return s.type === 'again' ? 'No question' : s.type === 'hq' && !G.wedges[p][s.ch] ? 'Wedge question' : s.type === 'hq' ? 'Wedge (won)' : 'Question';
  }
  function rolled(n) {
    G.phase = 'pick';
    G.roll = n;
    var t = targets(0, n);
    t.forEach(function (i) { G.card.querySelector('[data-tb-sq="' + i + '"]').classList.add('is-target'); });
    panel('<div class="tb-tray">' + deck() + die(n) + '<p class="tb-say tb-turn">You rolled <b>' + n + '</b>. Which way?</p></div><div class="tb-picks">' + t.map(function (i, k) {
      var s = G.sq[i];
      return '<button type="button" class="tb-pick" data-tb-go="' + i + '" style="--c:' + (s.type === 'again' ? '#DCE6EC' : COL[s.ch]) + '"><span class="tb-pick__dir">' + (k ? 'Back' : 'On') + '</span>' +
        '<span class="tb-pick__ch">' + (s.type === 'again' ? 'Roll again' : esc(NAME[s.ch])) + '</span><span class="tb-pick__what">' + what(0, i) + '</span></button>';
    }).join('') + '</div>');
  }
  // The piece walks there a square at a time.
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
  // To the centre: round the ring to the nearest headquarters, then down its spoke into the hub.
  function toHub(p, done) {
    if (G.pos[p] === 'hub') { done(); return; }
    var at = G.pos[p], best = null;
    G.sq.forEach(function (s, i) {
      if (s.type !== 'hq') return;
      var d = (i - at + N) % N, back = (at - i + N) % N, steps = Math.min(d, back);
      if (!best || steps < best.steps) best = { i: i, steps: steps, dir: d <= back ? 1 : -1 };
    });
    var path = [];
    for (var k = 1; k <= best.steps; k++) path.push((at + best.dir * k + N) % N);
    [3, 2, 1, 0].forEach(function (j) { path.push(polar(64 + j * 21.5, mid(best.i))); });
    path.push('hub');
    (function step() {
      if (!path.length) { done(); return; }
      var s = path.shift();
      if (typeof s === 'number') { G.pos[p] = s; G.xy[p] = null; } else if (s === 'hub') { G.pos[p] = 'hub'; G.xy[p] = null; } else G.xy[p] = s;
      placeTokens();
      wait(step, STEP);
    })();
  }
  function land(p) {
    var s = G.sq[G.pos[p]];
    if (s.type === 'again') { again(p); return; }
    var wedge = s.type === 'hq' && !G.wedges[p][s.ch];
    if (p === 1) { hisAnswer(s.ch, wedge); return; }
    if (wedge) typedQuestion(s.ch, 'wedge');
    else choiceQuestion(s.ch);
  }
  // A roll-again square: no question, just another go.
  function again(p) {
    if (p === 0) {
      panel('<p class="tb-say"><b>Roll again!</b> No question on this square.</p>');
      nextButton('Roll', yourTurn);
    } else {
      panel('<p class="tb-say">He landed on <b>Roll again</b>.</p>');
      wait(hisGo, 900);
    }
  }
  function choiceQuestion(ch) {
    var item = nextQ(ch, false);
    if (!item) { yourTurn(); return; }
    G.phase = 'ask';
    G.item = item;
    G.kind = false;
    var opts = shuffle([item.c.right].concat(item.c.wrong));
    panel(card(ch, '', '<p class="tb-q">' + esc(item.text) + '</p><div class="tb-opts">' + opts.map(function (o) {
      return '<button type="button" class="tb-opt" data-tb-opt="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div>'));
    reveal(G.card.querySelector('.tb-card__front'));
  }
  function choose(btn) {
    if (G.phase !== 'ask') return;
    G.phase = 'shown';
    var item = G.item, said = btn.getAttribute('data-tb-opt'), ok = said === item.c.right;
    G.asked += 1;
    G.card.querySelectorAll('[data-tb-opt]').forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-tb-opt') === item.c.right) b.classList.add('is-ok');
    });
    if (!ok) btn.classList.add('is-no');
    answered(ok, false, item.ch, back(ok, ok ? '' : 'You said: ' + said, item));
  }
  // The card's back: right or wrong, the answer and why.
  function back(ok, mine, item, who) {
    return '<p class="tb-stamp ' + (ok ? 'is-ok">' + (who ? who + ' got it' : 'Correct') : 'is-no">' + (who ? who + ' got it wrong' : 'Not quite')) + '</p>' +
      (mine ? '<p class="tb-mine">' + esc(mine) + '</p>' : '') +
      '<p class="tb-ans"><span>Answer</span>' + esc(item.c.right) + '</p><p class="tb-why"><span>Why</span>' + esc(item.c.why) + '</p>';
  }
  function typedQuestion(ch, why) {
    var item = nextQ(ch, true);
    if (!item) { choiceQuestion(ch); return; }
    G.phase = 'ask';
    G.item = item;
    G.kind = why;
    panel(card(ch, why === 'final' ? 'Final question' : 'Wedge question', '<p class="tb-q">' + esc(item.text) + '</p>' +
      '<textarea class="tb-text" data-tb-text rows="3" placeholder="Type your answer" aria-label="Your answer"></textarea>' +
      '<div class="tb-row"><button type="button" class="tb-btn tb-btn--go" data-tb-check>Check</button><button type="button" class="tb-btn tb-btn--ghost" data-tb-dunno>I don\'t know</button></div>'));
    reveal(G.card.querySelector('.tb-card__front'), function () {
      var t = G.card.querySelector('[data-tb-text]');
      if (t) t.focus({ preventScroll: true });
    });
  }
  function check(dunno) {
    if (G.phase !== 'ask') return;
    var item = G.item, text = dunno ? '' : (G.card.querySelector('[data-tb-text]').value || '').trim();
    if (!dunno && !text) { G.card.querySelector('[data-tb-text]').focus(); return; }
    G.phase = 'shown';
    G.asked += 1;
    var got = text && window.BioApp ? window.BioApp.check(item.src, item.qid, item.k, text).filter(Boolean).length : 0, ok = got >= item.want;
    var mine = dunno ? '' : 'You wrote: ' + (text.length > 120 ? text.slice(0, 117) + '...' : text) + (!ok && got ? ' (' + got + ' of ' + item.want + ' points)' : '');
    answered(ok, G.kind, item.ch, back(ok, mine, item));
  }
  // After your answer the card flips to the answer. Right, you go again (winning the wedge or the game); wrong, he goes.
  function answered(ok, kind, ch, backHtml) {
    wait(function () { flip(backHtml); }, kind ? 150 : 450);
    if (ok) {
      G.right += 1;
      K.ding(kind ? 4 : 2, true);
      if (kind === 'final') { wait(function () { end(0); }, 1600); return; }
      if (kind === 'wedge') { G.wedges[0][ch] = true; placeTokens(); K.mascot('angry', pick(SAY.wedge)); }
      else K.mascot('ok', pick(SAY.right));
    } else {
      K.bonk();
      K.mascot('happy', pick(SAY.wrong));
    }
    wait(function () { nextButton(ok ? (hasAll(0) ? 'Go for the final' : 'Roll again') : 'His turn', ok ? yourTurn : hisTurn); }, 700);
  }
  function finalQuestion() { typedQuestion(CH[Math.floor(Math.random() * CH.length)], 'final'); }

  // ---------------------------------------------------------------- his turn
  function hisTurn() {
    G.turn = 1;
    G.phase = 'him';
    G.run = 0;
    hisGo();
  }
  function hisGo() {
    if (hasAll(1)) {
      panel('<p class="tb-say"><b>He has all five wedges.</b> He heads for the centre.</p>');
      wait(function () { toHub(1, function () { hisAnswer(CH[Math.floor(Math.random() * CH.length)], 'final'); }); }, 600);
      return;
    }
    panel('<p class="tb-say tb-turn"><b>His turn.</b> He rolls.</p><div class="tb-tray">' + deck() + die(0) + '</div>');
    roll(function (n) {
      G.roll = n;
      var t = targets(1, n), want = t.filter(function (i) { return G.sq[i].type === 'hq' && !G.wedges[1][G.sq[i].ch]; });
      var to = want.length ? want[0] : t[Math.floor(Math.random() * 2)];
      panel('<div class="tb-tray">' + deck() + die(n) + '<p class="tb-say tb-turn">He rolled <b>' + n + '</b>.</p></div>');
      wait(function () { walk(1, to, function () { wait(function () { land(1); }, 250); }); }, 450);
    });
  }
  // He draws a card and answers out loud: you see the question, then the card turns over to whether he got it and the
  // answer either way.
  function hisAnswer(ch, kind) {
    var typed = kind === 'final' || kind === true, item = nextQ(ch, typed) || nextQ(ch, false);
    var odds = kind === 'final' ? 0.4 : typed ? 0.5 : 0.65, ok = Math.random() < odds;
    if (!item) { nextButton('Your turn', yourTurn); return; }
    panel(card(ch, kind === 'final' ? 'His final question' : typed ? 'His wedge question' : 'His question',
      '<p class="tb-q">' + esc(item.text) + '</p><p class="tb-say tb-think">He thinks…</p>'));
    reveal(G.card.querySelector('.tb-card__front'), function () { wait(function () {
      flip(back(ok, '', item, 'He'));
      if (ok) {
        K.mascot('happy', pick(SAY.hisRight));
        if (kind === 'final') { wait(function () { end(1); }, 1600); return; }
        if (typed) { G.wedges[1][ch] = true; placeTokens(); }
      } else K.mascot('angry', pick(SAY.hisWrong));
      G.run += 1;
      var go = ok && G.run < MAX_RUN;
      wait(function () { nextButton(go ? 'He goes again' : 'Your turn', go ? hisGo : yourTurn); }, 700);
    }, 1500); });
  }

  // ---------------------------------------------------------------- long questions type in
  // A long question (over 90 letters, like "In exercise, A's blood pH fell from 7.43 to 7.35 and B's from 7.42 to 7.17
  // ...") types in at reading pace, pausing at commas and full stops, and then its answers pop in one by one (the user:
  // "if the question is long ... make the question get typed in and the answers appear like pop on the screen; make the
  // typing not super fast but you read it as it goes"). The whole question is laid out hidden underneath first, so
  // nothing moves; a click on the card skips to the end. Short questions show at once. done() runs once the answers are
  // showing. The other question games (bio-quizgames.js, bio-arcade.js) use it too.
  var LONG = 90, CHAR_MS = 38;
  function reveal(root, done) {
    var qn = root && root.querySelector('.tb-q'), text = qn ? qn.textContent : '', rest = [], over = false, i = 0;
    if (!qn || text.length <= LONG || K.reduced()) { if (done) done(); return; }
    for (var n = qn.nextElementSibling; n; n = n.nextElementSibling) {
      if (n.classList.contains('tb-opts')) rest = rest.concat([].slice.call(n.children));
      else if (n.children.length || n.textContent || n.tagName === 'TEXTAREA') rest.push(n);
    }
    rest.forEach(function (r) { r.classList.add('ty-wait'); });
    qn.classList.add('is-typing');
    qn.innerHTML = '<span class="sr">' + esc(text) + '</span><span class="ty-full" aria-hidden="true">' + esc(text) + '</span><span class="ty-on" aria-hidden="true"></span>';
    var on = qn.querySelector('.ty-on');
    function finish() {
      if (over) return;
      over = true;
      root.removeEventListener('click', finish);
      qn.classList.remove('is-typing');
      qn.textContent = text;
      rest.forEach(function (r, k) { r.style.animationDelay = (k * 0.09) + 's'; r.classList.remove('ty-wait'); r.classList.add('ty-pop'); });
      if (done) done();
    }
    root.addEventListener('click', finish);
    (function next() {
      if (over || !qn.isConnected) return;
      i += 1;
      on.textContent = text.slice(0, i);
      if (i >= text.length) { finish(); return; }
      var c = text[i - 1];
      K.later(next, CHAR_MS + (/[.?!]/.test(c) && text[i] === ' ' ? 260 : /[,;:]/.test(c) ? 130 : 0));
    })();
  }

  // ---------------------------------------------------------------- the end
  function end(winner) {
    G.phase = 'over';
    var wins = +(K.store('bio-board-wins') || 0) + (winner ? 0 : 1);
    if (!winner) K.store('bio-board-wins', String(wins));
    K.store('bio-board-played', String(+(K.store('bio-board-played') || 0) + 1));
    body(G.card, '<div class="am-games__end"><svg class="tb-endpie" viewBox="0 0 40 40" aria-hidden="true">' + piece(winner, 20, 20, 19) + '</svg>' +
      '<h3 class="am-games__title">' + (winner ? 'The teacher wins.' : 'You win!') + '</h3>' +
      '<p class="am-games__sub">You got ' + G.right + ' of ' + G.asked + ' questions right' + (wins ? '. Games won: ' + wins : '') + '.</p></div>');
    buttons(G.card, [['more', 'data-am-keep', 'Close'], ['ok', 'data-tb-again', 'Play again']]);
    nearMascot(G.card);
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
    if (G.phase === 'centre' && e.target.closest('[data-tb-final]')) {
      G.phase = 'walking';
      e.target.closest('[data-tb-final]').disabled = true;
      toHub(0, function () { wait(finalQuestion, 250); });
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
  // The other question games (bio-quizgames.js) use the same questions, chapters and colours.
  window.BioBoard = { open: open, state: function () { return G; }, pools: pools, nearMascot: nearMascot, reveal: reveal, chapters: CH, names: NAME, colours: COL };
})();

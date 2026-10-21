// Leaving Cert Biology (Higher Level, exam from 2027): chapters 28-32, the human body.
// The page lists every real exam question on each chapter (bio/q<N>.js), marks typed answers against the
// SEC marking-scheme points, and opens the practice games. Cards run inside answer-mode.js's practice host
// (ExamAnswerMode.practice), so the examiner, the sounds, Draw it and the mini games are the same as Geography's.
(function () {
  'use strict';
  var AM = window.ExamAnswerMode, K = AM && AM.kit;
  var QS = window.BioQuestions || {}, ART = window.BioArt || {}, LEARN = window.BioLearn || {};
  var CHAPTERS = [
    { n: 28, title: 'The Breathing System', short: 'Breathing', unit: 'Humans: fuelling and filtering the body' },
    { n: 29, title: 'The Urinary System', short: 'Urinary system', unit: 'Humans: fuelling and filtering the body' },
    { n: 30, title: 'The Digestive System', short: 'Digestion', unit: 'Humans: fuelling and filtering the body' },
    { n: 31, title: 'The Circulatory System', short: 'Circulation', unit: 'Humans: blood' },
    { n: 32, title: 'Infectious Disease and the Human Immune Response', short: 'Immunity', unit: 'Humans: blood' }
  ];
  var app = null, sheet = null;

  // ---------- small helpers ----------
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function store(key, value) {
    try { if (value === undefined) return window.localStorage.getItem(key); window.localStorage.setItem(key, value); } catch (err) {}
    return null;
  }
  function chapter(n) { return CHAPTERS.filter(function (c) { return c.n === n; })[0]; }
  // A question's best score in chapter n. Some exam questions are split across chapters, each with its own parts, so
  // scores are kept per chapter; a score saved before that (under the id alone) still counts where its marks match.
  function scoreKey(n, q) { return 'bio-q-' + n + '-' + q.id; }
  function scoreOf(n, q) {
    try {
      var s = JSON.parse(store(scoreKey(n, q)) || 'null');
      if (s) return s;
      s = JSON.parse(store('bio-q-' + q.id) || 'null');
      return s && s.out === questionOutOf(q) ? s : null;
    } catch (err) { return null; }
  }

  // ---------- marking: the same word rules as tools/bio/build_bio_questions.py ----------
  var SYNONYMS = { big: 'large', bigger: 'larger', biggest: 'largest', huge: 'large', tiny: 'small', lots: 'many', quick: 'fast', quicker: 'faster', o2: 'oxygen', h2o: 'water' };
  // Two-word names written as one (the same list in tools/bio/build_bio_questions.py).
  var PHRASES = [[/carbon\s*dioxide/g, 'co2'], [/rib\s+cage/g, 'ribcage'], [/can\s+not\b/g, 'cannot'], [/get(?:s|ting)?\s+rid\s+of/g, 'remove'], [/ready[\s-]*made/g, 'readymade']];
  // Which way the ribs and diaphragm move, said in a student's words ("the ribs fall", "the diaphragm rises"): read as
  // the scheme's up/down/out/in, only when it's said of them (not "pressure rises" elsewhere in the answer).
  var MOVES = /\b(ribcage|ribs?|diaphragm)\s+(?:(?:moves?|moved|moving|goes|go|going|went|is|are|gets?|pulled|pushed)\s+)?(rises?|rose|rising|raised|up|upwards?|falls?|fell|falling|drops?|dropped|lowers?|lowered|down|downwards?|flattens?|flattened|out|outwards?|in|inwards?)(?:\s+and\s+(out|outwards?|in|inwards?))?\b/g;
  var WAY = { rise: 'up', rises: 'up', rose: 'up', rising: 'up', raised: 'up', up: 'up', upward: 'up', upwards: 'up', fall: 'down', falls: 'down', fell: 'down',
    falling: 'down', drop: 'down', drops: 'down', dropped: 'down', lower: 'down', lowers: 'down', lowered: 'down', down: 'down', downward: 'down', downwards: 'down',
    flatten: 'down', flattens: 'down', flattened: 'down', out: 'out', outward: 'out', outwards: 'out', 'in': 'in', inward: 'in', inwards: 'in' };
  PHRASES.push([MOVES, function (m, part, way, also) {
    return part + ' moving ' + [way, also].filter(Boolean).map(function (x) { return WAY[x] + ' ' + WAY[x] + 'ward'; }).join(' ');
  }]);
  // Everyday words that mean the same thing in an answer, so a right answer in a student's own words still earns
  // the mark ("cannot produce its own food" for the scheme's "cannot make their food"). Applied to word stems, on
  // both the answer and the scheme's key words.
  var SAME = {
    make: ['produce', 'produc', 'made', 'manufacture', 'manufactur', 'create', 'creat'],
    eat: ['ate', 'eating', 'consume', 'consum', 'ingest', 'feed', 'fed'],
    cannot: ['cant', 'unable'],
    amount: ['quantity', 'quantit', 'propor'],
    type: ['kind', 'class'],
    increase: ['increas', 'rise', 'ris', 'rose', 'rising', 'rais', 'raise'],
    decrease: ['decreas', 'fall', 'falling', 'drop', 'dropp', 'reduce', 'reduc'],
    remove: ['remov', 'eliminate', 'eliminat', 'elimin'],
    muscle: ['muscular', 'muscl'],
    close: ['clos', 'shut'],
    die: ['dying', 'dies', 'died'],
    lose: ['lost', 'losing', 'los', 'loss'],
    keep: ['kept', 'maintain', 'maintenance', 'mainten'],
    copy: ['copi'],
    enter: ['entry', 'entri'],
    mutate: ['mutation', 'mutat', 'muta', 'mutant'],
    axis: ['axe'],
    minute: ['min'],
    few: ['fewer', 'fewest'],
    virus: ['viral']
  };
  var CANON = {};
  Object.keys(SAME).forEach(function (k) { CANON[k] = k; SAME[k].forEach(function (w) { CANON[w] = k; }); });
  function canon(w) { return CANON[w] || w; }
  var SUFFIXES = ['ation', 'ition', 'tion', 'sion', 'ment', 'ing', 'ous', 'ive', 'ed', 'er', 'ly', 'al'];
  // Words that share a start but mean different things.
  var CONFUSE = [['arter', 'arteriol'], ['lymph', 'lymphocyt'], ['pepsin', 'pepsinog'], ['trypsin', 'trypsinog'], ['bronch', 'bronchit'], ['bronch', 'bronchiol'], ['with', 'without'], ['gene', 'gener']];
  function bioStem(w) {
    if (/^\d+$/.test(w) || w.length <= 3) return w;
    if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 4 && /(ches|shes|xes|ses)$/.test(w)) w = w.slice(0, -2);
    else if (/s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    for (var i = 0; i < SUFFIXES.length; i++) {
      var suf = SUFFIXES[i];
      if (w.length - suf.length >= 4 && w.slice(-suf.length) === suf) return w.slice(0, -suf.length);
    }
    return w;
  }
  function bioWords(text) {
    // "a" as a word ("a large area") isn't the letter A, which a scheme can ask for; "B's" is B.
    var t = String(text).replace(/(^|[^A-Za-z])a(?=\s+[A-Za-z]{2,})/g, '$1').toLowerCase().replace(/[’']s\b/g, '').replace(/[’']/g, '');
    PHRASES.forEach(function (p) { t = t.replace(p[0], p[1]); });
    return (t.match(/[a-z0-9]+/g) || []).map(function (w) { return canon(bioStem(SYNONYMS[w] || w)); });
  }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function sameStem(a, b) {
    if (a === b) return true;
    if (a.length === 1 || b.length === 1 || /\d/.test(a + b)) return false;
    for (var i = 0; i < CONFUSE.length; i++) {
      var c = CONFUSE[i];
      if (a.indexOf(c[0]) === 0 && b.indexOf(c[0]) === 0 && (a.indexOf(c[1]) === 0) !== (b.indexOf(c[1]) === 0)) return false;
    }
    var n = 0, min = Math.min(a.length, b.length);
    while (n < min && a[n] === b[n]) n += 1;
    if (n >= Math.max(4, Math.ceil(min * 0.75))) return true;
    // The same short word with an ending: eat / eating, make / making.
    var s = a.length < b.length ? a : b, l = s === a ? b : a;
    if (s.length >= 3 && (/^(s|es|d|ed|ing)$/.test(l.slice(s.length)) && l.indexOf(s) === 0 || /e$/.test(s) && /^(ing|ed)$/.test(l.slice(s.length - 1)) && l.indexOf(s.slice(0, -1)) === 0)) return true;
    return min >= 5 && lev(a, b) <= 1;
  }
  // A marking point is in an answer if, for one of its alternatives, enough of its key words are there.
  function hasPoint(pt, words) {
    return (pt.k || []).some(function (alt) {
      var got = alt.w.filter(function (k) { k = canon(k); return words.some(function (w) { return sameStem(w, k); }); }).length;
      return got >= alt.n;
    });
  }
  // Some schemes list the same fact twice ("Alveoli: large surface area", "Capillaries: large surface area"), so the
  // points have the same keys. Saying it once earns one of them; each further sentence that says it earns another.
  function onePerSentence(part, got, text) {
    var groups = {};
    part.pts.forEach(function (pt, i) { if (got[i] && pt.k) (groups[JSON.stringify(pt.k)] = groups[JSON.stringify(pt.k)] || []).push(i); });
    var out = got.slice(), sentences = String(text).split(/[.;!?\n]+/).map(bioWords);
    Object.keys(groups).forEach(function (key) {
      var ids = groups[key];
      if (ids.length < 2) return;
      var said = sentences.filter(function (w) { return hasPoint(part.pts[ids[0]], w); }).length;
      ids.slice(Math.max(1, said)).forEach(function (i) { out[i] = false; });
    });
    return out;
  }
  function pointMarks(part, pt) {
    if (pt.m) return pt.m;
    if (part.m && part.n) return Math.round(part.m / part.n);
    return 3;
  }
  function partOutOf(part) { return part.m || part.n * 3; }
  // Marks for a part: the points you got (best first), up to the number the scheme counts.
  function partScore(part, got) {
    var marks = part.pts.map(function (pt, k) { return got[k] ? pointMarks(part, pt) : 0; }).filter(Boolean).sort(function (a, b) { return b - a; });
    var sum = marks.slice(0, part.n).reduce(function (s, m) { return s + m; }, 0);
    return Math.min(sum, partOutOf(part));
  }
  function questionOutOf(q) { return q.parts.reduce(function (s, p) { return s + partOutOf(p); }, 0); }

  // ---------- diagrams on exam questions ----------
  // Letters ("A") point at a structure with a short line; given labels ("Cortex") sit on a dark tag.
  function markSvg(m, at, center) {
    var dx = at[0] - center[0], dy = at[1] - center[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    var off = m.given ? 40 : 30, lx = at[0] + dx / len * off, ly = at[1] + dy / len * off;
    var half = m.given ? (m.t.length * 6.8 + 16) / 2 + 4 : 14;  // keep the whole tag inside the frame
    lx = Math.max(half, Math.min(480 - half, lx));
    ly = Math.max(14, Math.min(306, ly));
    var line = '<path d="M' + lx.toFixed(1) + ' ' + ly.toFixed(1) + 'L' + at[0] + ' ' + at[1] + '" stroke="#18272D" stroke-width="1.8"/><circle cx="' + at[0] + '" cy="' + at[1] + '" r="2.6" fill="#18272D"/>';
    if (m.given) {
      var w = m.t.length * 6.8 + 16;
      // A tag right on its spot (a zone like "Medulla") needs no line: its dot would only peep out from under the tag.
      if (Math.abs(at[0] - lx) <= w / 2 - 10 && Math.abs(at[1] - ly) <= 8.5) line = '';
      return line + '<rect x="' + (lx - w / 2).toFixed(1) + '" y="' + (ly - 10) + '" width="' + w.toFixed(1) + '" height="20" rx="10" fill="#18272D"/>' +
        '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11.5" fill="#FFFFFF">' + esc(m.t) + '</text>';
    }
    return line + '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="11" fill="#FFFFFF" stroke="#18272D" stroke-width="2"/>' +
      '<text x="' + lx.toFixed(1) + '" y="' + (ly + 0.5).toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#18272D">' + esc(m.t) + '</text>';
  }
  function baseSvg(base, marks, tap) {
    var art = ART[base];
    if (!art) return '';
    var overlay = (marks || []).map(function (m) { return art.anchors[m.a] ? markSvg(m, art.anchors[m.a], [240, 160]) : ''; }).join('');
    if (tap) {
      // Every structure is a target; only the scheme's ones are right.
      overlay += '<g class="bio-taps">' + Object.keys(art.anchors).map(function (a) {
        var p = art.anchors[a];
        return '<circle class="bio-tap" cx="' + p[0] + '" cy="' + p[1] + '" r="20" data-bio-tap="' + a + '" data-bio-tappart="' + tap + '" tabindex="0" role="button" aria-label="' + esc(a) + '"/>';
      }).join('') + '<g class="bio-tapmark" data-bio-tapmark></g></g>';
    }
    return art.plain.replace(/<\/svg>$/, overlay + '</svg>');
  }
  // A graph from the paper. Simple: {title, trend: 'up' | 'down'} (one dashed line over time). Full:
  // {title, x, y (axis names), series: [{name, pts: [[x, y], ...]}], marks: [{t, at: [x, y]}], xt / yt (tick labels:
  // [[x, 'text'], ...]), key: 'left' to put the key top left}, x and y from 0 to 100. Series after the first are dashed.
  var GRAPH_COLORS = ['#FF4B4B', '#3E6FD8', '#58CC02', '#7E5BA3'];
  function graphSvg(g) {
    var T = function (x, y, txt, more, size) { return '<text x="' + x + '" y="' + y + '" font-family="Nunito, sans-serif" font-weight="800" font-size="' + (size || 11) + '" fill="#18272D"' + (more || '') + '>' + esc(txt) + '</text>'; };
    if (!g.series) {
      var y1 = g.trend === 'down' ? 40 : 120, y2 = g.trend === 'down' ? 120 : 40;
      return '<svg viewBox="0 0 220 160" role="img"><title>' + esc(g.title) + '</title><rect width="220" height="160" fill="#FFFFFF"/>' +
        '<path d="M30 14V140H210" fill="none" stroke="#18272D" stroke-width="2"/>' +
        '<path d="M34 ' + y1 + 'C90 ' + y1 + ' 150 ' + y2 + ' 204 ' + y2 + '" fill="none" stroke="#FF4B4B" stroke-width="3" stroke-dasharray="7 5"/>' +
        T(120, 156, 'Time', ' text-anchor="middle"') + T(36, 12, g.title) + '</svg>';
    }
    // Plot area: x 56..456, y 36..260 on a 480 x 320 card.
    var X = function (v) { return (56 + v * 4).toFixed(1); }, Y = function (v) { return (260 - v * 2.24).toFixed(1); };
    var out = '<svg viewBox="0 0 480 320" role="img"><title>' + esc(g.title || '') + '</title><rect width="480" height="320" fill="#FFFFFF"/>';
    if (g.title) out += T(240, 20, g.title, ' text-anchor="middle"', 13);
    out += '<path d="M56 30V260H462" fill="none" stroke="#18272D" stroke-width="2"/>';
    (g.xt || []).forEach(function (t) { out += '<path d="M' + X(t[0]) + ' 260v5" stroke="#18272D" stroke-width="1.5"/>' + T(X(t[0]), 278, t[1], ' text-anchor="middle"', 10); });
    (g.yt || []).forEach(function (t) { out += '<path d="M51 ' + Y(t[0]) + 'h5" stroke="#18272D" stroke-width="1.5"/>' + T(47, +Y(t[0]) + 4, t[1], ' text-anchor="end"', 10); });
    if (g.x) out += T(259, 304, g.x, ' text-anchor="middle"');
    if (g.y) out += '<g transform="translate(18 145) rotate(-90)">' + T(0, 0, g.y, ' text-anchor="middle"') + '</g>';
    g.series.forEach(function (sr, k) {
      var c = GRAPH_COLORS[k % GRAPH_COLORS.length], P = sr.pts.map(function (p) { return [+X(p[0]), +Y(p[1])]; }), d = 'M' + P[0].join(' ');
      // A smooth curve through the points (Catmull-Rom); "straight: true" for straight lines between them.
      for (var i = 1; i < P.length; i++) {
        var a = P[i - 2] || P[i - 1], b = P[i - 1], e = P[i], f = P[i + 1] || e;
        d += sr.straight ? 'L' + e.join(' ') : 'C' + [b[0] + (e[0] - a[0]) / 6, b[1] + (e[1] - a[1]) / 6, e[0] - (f[0] - b[0]) / 6, e[1] - (f[1] - b[1]) / 6, e[0], e[1]].map(function (v) { return v.toFixed(1); }).join(' ');
      }
      out += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (k ? ' stroke-dasharray="8 6"' : '') + '/>';
      var kx = g.key === 'left' ? 76 : 300;
      if (g.series.length > 1 && sr.name) out += '<path d="M' + kx + ' ' + (40 + k * 18) + 'h22" stroke="' + c + '" stroke-width="3"' + (k ? ' stroke-dasharray="6 4"' : '') + '/>' + T(kx + 28, 44 + k * 18, sr.name);
    });
    (g.marks || []).forEach(function (m) {
      out += '<circle cx="' + X(m.at[0]) + '" cy="' + Y(m.at[1]) + '" r="11" fill="#FFFFFF" stroke="#18272D" stroke-width="2"/>' +
        '<text x="' + X(m.at[0]) + '" y="' + (+Y(m.at[1]) + 0.5) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#18272D">' + esc(m.t) + '</text>';
    });
    return out + '</svg>';
  }
  // A picture cut from the exam paper's page (box: x, y, width, height in % of the page), in the page's pixels so
  // arrows can be drawn on it.
  var PAGE = [2055, 2908];
  function figSvg(f) {
    var b = f.box, box = [b[0] * PAGE[0], b[1] * PAGE[1], b[2] * PAGE[0], b[3] * PAGE[1]].map(function (v) { return (v / 100).toFixed(1); });
    return '<svg viewBox="' + box.join(' ') + '" role="img" data-bio-page><title>The diagram from the paper</title>' +
      '<image href="' + esc(f.img) + '" width="' + PAGE[0] + '" height="' + PAGE[1] + '" preserveAspectRatio="none"/></svg>';
  }
  function diagramHtml(dia, tapPart) {
    if (!dia) return '';
    // About the size it is on the paper, so a small picture isn't blown up to the card's width.
    if (dia.fig) return dia.fig.map(function (f) { return '<div class="bio-dia bio-dia--paper" style="max-width:' + Math.round(f.box[2] * 11) + 'px">' + figSvg(f) + '</div>'; }).join('');
    if (dia.panels) return '<div class="bio-dia bio-dia--two">' + dia.panels.map(function (p) { return '<div>' + baseSvg(p.base, p.marks, null) + '</div>'; }).join('') + '</div>';
    if (dia.graphs) return dia.graphs.length === 1 ? '<div class="bio-dia">' + graphSvg(dia.graphs[0]) + '</div>' :
      '<div class="bio-dia bio-dia--two">' + dia.graphs.map(function (g) { return '<div>' + graphSvg(g) + '</div>'; }).join('') + '</div>';
    if (dia.base && ART[dia.base]) return '<div class="bio-dia">' + baseSvg(dia.base, dia.marks, tapPart) + '</div>';
    return '';
  }

  // ---------- the shell (biology.html): sidebar, top bar and canvas ----------
  var side = null, bar = null;
  function progressApi() {
    return { chapters: CHAPTERS, questions: allQuestions, real: function (n) { return QS[n] ? QS[n].questions.length : 0; }, scoreOf: scoreOf, store: store, esc: esc, drills: drills };
  }
  // Every drill in a chapter (its games, Learn it and Build it): its name, what it is, the attribute that opens it and
  // its saved best ("10/12", or points for an action game).
  var GAMES = [
    ['chain', 'Chain reaction', 'Put each process in order, type it out, then write it from memory.', 'am-chain-bio-', function (L) { return L.games && L.games.chains; }],
    ['level', 'Level up', 'Build one answer point into full marks, then write it from memory.', 'am-level-bio-', function (L) { return L.games && L.games.level; }],
    ['examiner', 'Be the examiner', 'Mark a student\'s answer against the real marking scheme, then fix the lines that got nothing.', 'bio-exam-', function (L) { return L.examiner && L.examiner.length; }],
    ['match', 'Match pairs', 'Tap each word, then what it means. Three quick rounds against the clock.', 'bio-match-', function (L) { return L.match && L.match.length; }],
    ['spot', 'Spot the mistake', 'Each sentence has one wrong word. Find it, then fix it.', 'bio-spot-', function (L) { return L.spot && L.spot.length; }],
    ['sprint', 'Label sprint', 'A part comes up: tap it on a real exam diagram before the time runs out.', 'bio-sprint-', function (L) { return L.sprint && L.sprint.length; }]
  ];
  function drillItems(n) {
    var L = LEARN[n] || {}, out = [];
    function add(kind, key, name, what, attr) { out.push({ kind: kind, key: key, name: name, what: what, attr: attr, best: store(key) }); }
    if (L.action) add('game', 'bio-act-' + n, L.action.name, L.action.what, 'data-bio-game="action"');
    GAMES.forEach(function (g) { if (g[4](L)) add('game', g[3] + n, g[1], g[2], 'data-bio-game="' + g[0] + '"'); });
    (L.learn || []).forEach(function (x, k) { add('learn', 'bio-learn-' + n + '-' + k, x.name, x.what, 'data-bio-learn="' + k + '"'); });
    Object.keys(ART).forEach(function (id) { if (ART[id].chapter === n) add('build', 'bio-build-' + id, 'Build it: ' + ART[id].name, '', 'data-bio-build="' + id + '"'); });
    return out;
  }
  function drills(n) { var d = drillItems(n); return [d.filter(function (x) { return x.best; }).length, d.length]; }
  function bestHtml(v) {
    if (!v) return '<em class="bio-best is-none">Not played yet</em>';
    return '<em class="bio-best">Best <b class="num">' + esc(/\//.test(v) ? v : v + ' points') + '</b></em>';
  }
  function chapterRows() { return window.BioProgress ? window.BioProgress.model(progressApi()).now.rows : []; }
  function renderShell(active, crumb) {
    if (!side) return;
    var rows = chapterRows();
    side.innerHTML = '<a class="sh-brand" href="#"><span class="sh-mark" aria-hidden="true">' + (K ? K.face : '') + '</span><span class="sh-name">Leaving Cert</span></a>' +
      '<nav class="sh-nav" aria-label="Biology"><a class="sh-link" href="#"' + (active === 'home' ? ' aria-current="page"' : '') + '><span class="sh-t">Progress</span></a>' +
      '<p class="sh-group">Chapters</p>' + CHAPTERS.map(function (c, i) {
        var r = rows[i], v = r && r.seen != null ? Math.round(r.seen * 100) + '%' : '<span class="dash">–</span>';
        return '<a class="sh-link" href="#ch' + c.n + '"' + (active === c.n ? ' aria-current="page"' : '') + '><span class="sh-n num">' + c.n + '</span><span class="sh-t">' + esc(c.short) + '</span><span class="sh-v num">' + v + '</span></a>';
      }).join('') + '</nav>';
    bar.innerHTML = '<button type="button" class="sh-menu" data-sh-menu aria-expanded="false" aria-controls="bio-side"><span class="sh-burger" aria-hidden="true"></span><span class="sr">Menu</span></button>' +
      '<p class="sh-crumb"><a href="#">Biology</a><span class="sh-sep" aria-hidden="true">/</span><span class="sh-here">' + esc(crumb) + '</span></p>' +
      '<nav class="sh-switch" aria-label="Subject"><a href="Geography%20Questions.dc.html">Geography</a><a href="biology.html" aria-current="page">Biology</a><a href="irish.html">Irish</a></nav>';
  }
  function menu(open) {
    document.body.classList.toggle('sh-open', open);
    var b = bar && bar.querySelector('[data-sh-menu]');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function renderHome() {
    document.title = 'Progress | Leaving Cert Biology';
    renderShell('home', 'Progress');
    if (window.BioProgress) window.BioProgress.render(app, progressApi());
  }
  // The next question to answer in a chapter: the first real one you haven't tried, else your lowest score.
  function openNext(n) {
    var list = (QS[n] || {}).questions || [], q = list.filter(function (x) { return !scoreOf(n, x); })[0];
    if (!q) q = list.slice().sort(function (a, b) { var A = scoreOf(n, a), B = scoreOf(n, b); return A.got / A.out - B.got / B.out; })[0];
    if (q) openOnDesk(n, q.id);
  }
  var TABS = [['questions', 'Exam questions'], ['diagrams', 'Diagrams'], ['games', 'Games'], ['learn', 'Learn it']];
  function renderChapter(n, tab) {
    var c = chapter(n);
    if (!c) { renderHome(); return; }
    tab = tab || store('bio-tab') || 'questions';
    document.title = c.short + ' | Leaving Cert Biology';
    renderShell(n, c.title);
    app.innerHTML = '<div class="cv-title rise" style="--i:0"><h1 class="cv-h1">' + esc(c.title) + '</h1></div>' +
      '<div class="ch-layout"><div class="ch-main"><nav class="bio-tabs rise" style="--i:1" role="tablist">' + TABS.map(function (t) {
        return '<button type="button" role="tab" class="bio-tab" data-bio-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>';
      }).join('') + '</nav><section class="bio-panel" data-bio-panel></section></div>' + chapterRail(n) + '</div>';
    showTab(n, tab);
  }
  // Beside the tabs: how the chapter is going, the next question, and the drills not tried yet.
  function chapterRail(n) {
    var r = chapterRows()[CHAPTERS.indexOf(chapter(n))] || {}, seen = r.seen != null ? Math.round(r.seen * 100) : null, items = drillItems(n);
    var todo = items.filter(function (x) { return !x.best; }), done = items.length - todo.length, log = [], last = null;
    try { log = JSON.parse(store('bio-log') || '[]'); } catch (err) {}
    (Array.isArray(log) ? log : []).forEach(function (e) { if (e.n === n && (!last || e.d > last)) last = e.d; });
    var grade = seen == null ? null : window.BioProgress ? window.BioProgress.gradeOf(seen).name : null;
    return '<section class="card ch-prog rise" style="--i:2" aria-labelledby="ch-h-prog"><h2 class="card-h" id="ch-h-prog">Your progress</h2>' +
        (seen == null ? '<p class="ch-none">No questions answered in this chapter yet.</p>'
          : '<p class="ch-big"><b class="num">' + seen + '%</b>' + (grade ? '<span class="ch-grade">' + grade + '</span>' : '') + '</p>' +
            '<span class="pg-track ch-track"><i style="--w:' + seen + '%"></i></span>') +
        '<dl class="ch-facts"><div><dt>Questions tried</dt><dd><span class="num">' + (r.count || 0) + '</span><span class="of"> of ' + allQuestions(n).length + '</span></dd></div>' +
          '<div><dt>Drills tried</dt><dd><span class="num">' + done + '</span><span class="of"> of ' + items.length + '</span></dd></div>' +
          '<div><dt>Last answered</dt><dd>' + (last ? esc(ago(last)) : '<span class="dash">–</span>') + '</dd></div></dl>' +
        '<button type="button" class="btn-primary ch-next" data-pg-next="' + n + '">' + (hasUntried(n) ? 'Answer the next question' : 'Retry your lowest score') + '</button></section>' +
      (todo.length ? '<section class="card ch-todo rise" style="--i:3" aria-labelledby="ch-h-todo"><header class="card-head"><h2 class="card-h" id="ch-h-todo">Not tried yet</h2>' +
        '</header><ul class="ch-list">' +
        todo.slice(0, 6).map(function (x) { return '<li><button type="button" class="ch-item" ' + x.attr + '>' + esc(x.name) + '<i class="bio-go" aria-hidden="true"></i></button></li>'; }).join('') +
        '</ul></section>'
        : '<section class="card ch-todo rise" style="--i:3"><h2 class="card-h">Every drill tried</h2></section>');
  }
  // Whether a chapter still has a real exam question you haven't tried.
  function hasUntried(n) { return ((QS[n] || {}).questions || []).some(function (q) { return !scoreOf(n, q); }); }
  function ago(d) {
    var t = new Date(), today = new Date(t.getFullYear(), t.getMonth(), t.getDate()), p = d.split('-'), then = new Date(+p[0], +p[1] - 1, +p[2]);
    var days = Math.round((today - then) / 86400000);
    return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days + ' days ago';
  }
  function showTab(n, tab) {
    store('bio-tab', tab);
    app.querySelectorAll('[data-bio-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-bio-tab') === tab)); });
    var panel = app.querySelector('[data-bio-panel]'), d = QS[n];
    if (tab === 'questions') panel.innerHTML = questionList(n, d);
    else if (tab === 'diagrams') panel.innerHTML = diagramList(n);
    else if (tab === 'games') panel.innerHTML = gameList(n);
    else panel.innerHTML = learnList(n);
    panel.querySelectorAll(':scope > p, :scope > div, :scope > details, :scope > ul > li').forEach(function (x, i) {
      if (i < 14) { x.classList.add('rise'); x.style.setProperty('--i', i + 2); }
    });
  }
  var FILTERS = [['all', 'All'], ['A', 'Short (Section A)'], ['B', 'Experiments (B)'], ['C', 'Long (Section C)'], ['sample', 'Samples'], ['practice', 'Practice']];
  function questionList(n, d) {
    if (!d) return '<p class="bio-empty">Questions for this chapter are coming.</p>';
    var f = store('bio-filter') || 'all';
    var list = allQuestions(n).filter(function (q) { return f === 'all' || q.sec === f || (f === 'sample' && q.year === 2027 && q.sec !== 'practice'); });
    return '<div class="bio-filters">' + FILTERS.map(function (x) {
        return '<button type="button" class="bio-chip" data-bio-filter="' + x[0] + '" aria-pressed="' + (x[0] === f) + '">' + x[1] + '</button>';
      }).join('') + '</div>' +
      '<ul class="bio-qlist">' + list.map(function (q) {
        var s = scoreOf(n, q), out = questionOutOf(q), first = q.parts[0] ? q.parts[0].q : '';
        return '<li><button type="button" class="bio-q" data-bio-open="' + esc(q.id) + '">' +
          '<span class="bio-q__src">' + (q.sec === 'practice' ? 'Practice' : q.year === 2027 ? 'Sample<em>P' + esc(q.id.split('-')[0].slice(1) + ' ' + q.id.split('-').slice(1).join('-')) + '</em>'
            : esc(String(q.year)) + '<em>' + esc(q.id.split('-').slice(1).join('-')) + '</em>') + '</span>' +
          // The question's start is for screen readers only: the tile shows the paper, the part and the marks.
          '<span class="sr">' + esc(((q.stem ? q.stem + ' ' : '') + first).replace(/\s*\[[^\]]*\]/g, '')).slice(0, 150) + '</span>' +
          '<span class="bio-q__meta">' + (s ? '<b class="bio-q__score num">' + s.got + '<span class="of">/' + s.out + '</span></b>' : '<span>' + out + ' marks</span>') +
            (q.fresh === 'no' ? '<i class="bio-old">Old course</i>' : q.fresh === 'partly' ? '<i class="bio-old bio-old--part">Partly old</i>' : '') + '</span></button></li>';
      }).join('') + '</ul>' +
      (d.notCovered && d.notCovered.length ? '<details class="bio-gaps"><summary>On the course but never asked yet (' + d.notCovered.length + ')</summary><ul>' +
        d.notCovered.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></details>' : '');
  }
  function diagramList(n) {
    var ids = Object.keys(ART).filter(function (id) { return ART[id].chapter === n; });
    if (!ids.length) return '<p class="bio-empty">The diagrams for this chapter are coming.</p>';
    return '<ul class="bio-dlist">' + ids.map(function (id) {
        var a = ART[id], best = store('bio-build-' + id);
        return '<li class="bio-d"><div class="bio-d__pic" aria-hidden="true">' + a.plain + '</div><div class="bio-d__text"><b>' + esc(a.name) + '</b>' +
          (best ? '<span>Best ' + esc(best) + '</span>' : '') +
          '<div class="bio-d__btns"><button type="button" class="bio-btn" data-bio-build="' + id + '">Build it</button>' +
          '<button type="button" class="bio-btn bio-btn--ghost" data-bio-draw="' + n + '">Draw it</button></div></div></li>';
      }).join('') + '</ul>';
  }
  function drillRows(items, empty) {
    if (!items.length) return '<p class="bio-empty">' + empty + '</p>';
    return '<ul class="bio-glist">' + items.map(function (g) {
      return '<li><button type="button" class="bio-g" ' + g.attr + '><b>' + esc(g.name) + '</b>' + bestHtml(g.best) + '<i class="bio-go" aria-hidden="true"></i></button></li>';
    }).join('') + '</ul>';
  }
  function gameList(n) { return drillRows(drillItems(n).filter(function (g) { return g.kind === 'game'; }), 'Games for this chapter are coming.'); }
  function learnList(n) { return drillRows(drillItems(n).filter(function (g) { return g.kind === 'learn'; }), 'Memory games for this chapter are coming.'); }

  // ---------- the exam question sheet ----------
  function partHtml(q, part, k) {
    var out = partOutOf(part), ui = '';
    var marks = part.m ? '[' + part.m + ' marks]' : '[' + part.n + (part.n === 1 ? ' point' : ' points') + ']';
    if (part.kind === 'fields') {
      var fields = [];
      part.pts.forEach(function (pt) { if (pt.f && fields.indexOf(pt.f) < 0) fields.push(pt.f); });
      ui = '<div class="bio-fields">' + fields.map(function (f) {
        return '<label class="bio-field"><b>' + esc(f) + '</b><input type="text" class="bio-in" data-bio-f="' + esc(f) + '" autocomplete="off" spellcheck="true"></label>';
      }).join('') + '</div>';
    } else if (part.kind === 'tf') {
      ui = '<div class="bio-tf" role="group" aria-label="True or false"><button type="button" class="bio-btn bio-btn--ghost" data-bio-tf="true">True</button>' +
        '<button type="button" class="bio-btn bio-btn--ghost" data-bio-tf="false">False</button></div>';
    } else if (part.kind === 'tap' && part.tap && q.dia) {
      ui = '<p class="bio-hint">Tap the place on the diagram above.</p>';
    } else if (part.kind === 'arrows') {
      var A = part.arrows, hint = '<p class="bio-hint">' + (A.labels ? 'Pick one, then drag on the diagram to draw its arrow.' : 'Drag on the diagram to draw ' + ((A.max || 1) > 1 ? 'the arrows.' : 'the arrow.')) + '</p>';
      ui = '<div class="bio-tf bio-arrows">' + (A.labels ? A.labels.map(function (t, i) {
        return '<button type="button" class="bio-btn bio-btn--ghost" data-bio-alabel="' + i + '" aria-pressed="' + (i === 0) + '" style="--c:' + inkOf(A, t) + '">' + esc(t) + '</button>';
      }).join('') : hint) + '<button type="button" class="bio-btn bio-btn--ghost bio-arrows__clear" data-bio-aclear>Clear</button></div>' + (A.labels ? hint : '');
    } else if (part.kind === 'draw' || part.kind === 'tap') {
      ui = '<p class="bio-hint">Draw it on paper, then check it against the scheme.</p>';
    } else {
      ui = '<textarea class="am-type__box bio-in" rows="3" spellcheck="true" aria-label="Your answer to ' + esc(part.l) + '"></textarea>';
    }
    return '<section class="bio-part" data-bio-part="' + k + '"><p class="bio-part__q"><b>' + esc(part.l) + '</b> ' + esc(part.q) + ' <span class="bio-part__m">' + marks + '</span></p>' + ui +
      '<div class="bio-part__act"><button type="button" class="bio-btn" data-bio-check="' + k + '">' + (part.kind === 'draw' || (part.kind === 'tap' && !part.tap) ? 'Show the scheme' : 'Check') + '</button>' +
      '<span class="bio-part__got" data-bio-got="' + k + '" aria-live="polite"></span></div><div class="bio-part__res" data-bio-res="' + k + '"></div></section>';
  }
  // Real questions, then our practice questions for course topics never examined yet.
  function allQuestions(n) {
    var d = QS[n], p = (LEARN[n] || {}).practice || [];
    return (d ? d.questions : []).concat(p.map(function (q) { q.year = q.year || 2027; q.sec = 'practice'; q.fresh = 'yes'; return q; }));
  }
  // onClose: what happens when the card closes (the page refreshes its scores by default). onNext: the desk moves
  // its paper to the next question instead of swapping the card.
  function openQuestion(n, qid, onClose, onNext) {
    var list = allQuestions(n), q = list.filter(function (x) { return x.id === qid; })[0];
    if (!q || !AM) return;
    AM.practice('bio-' + n, 'none', onClose || refresh);
    var card = K.gameCard(q.src);
    card.classList.add('bio-sheet');
    var tapPart = null;
    q.parts.forEach(function (p, k) { if (p.kind === 'tap' && p.tap) tapPart = String(k); });
    sheet = { n: n, q: q, card: card, got: q.parts.map(function () { return null; }), tap: {}, tf: {}, onNext: onNext };
    K.gameHud(card, q.parts.length, '/' + questionOutOf(q));
    K.gameBody(card, '<div class="bio-paper">' +
      '<p class="bio-src">' + esc(q.src) + (q.fresh !== 'yes' ? ' <i class="bio-old' + (q.fresh === 'partly' ? ' bio-old--part' : '') + '">' + (q.fresh === 'no' ? 'Old course' : 'Partly old course') + '</i>' : '') +
      (q.parts.some(function (p) { return p.unofficial; }) ? ' <i class="bio-old bio-old--info">Unofficial scheme</i>' : '') + '</p>' +
      (q.why ? '<p class="bio-why">' + esc(q.why) + '</p>' : '') +
      (q.stem ? '<p class="bio-stem">' + esc(q.stem) + '</p>' : '') + diagramHtml(q.dia, tapPart) +
      q.parts.map(function (p, k) { return partHtml(q, p, k); }).join('') + '</div>', Boolean(q.dia && (q.dia.base || q.dia.panels)));
    q.parts.forEach(function (p, k) { if (p.kind === 'arrows' && p.arrows) drawOn(card.querySelector('.bio-dia svg'), k); });
    var at = list.indexOf(q);
    K.fillButtons(card.querySelector('[data-am-gbtns]'), [['more', 'data-am-keep', 'Close']].concat(at + 1 < list.length ? [['ok', 'data-bio-next="' + esc(list[at + 1].id) + '"', 'Next question']] : []), true);
    var root = K.root();
    root.addEventListener('click', sheetClick);
    root.addEventListener('keydown', function (e) {
      var t = e.target.closest && e.target.closest('[data-bio-tap]');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    var first = card.querySelector('.bio-in');
    if (first) first.focus({ preventScroll: true });
    K.mascot('ok', q.sec === 'practice' ? 'A practice question. Same rules.' : q.year === 2027 ? 'A sample paper. Show me you\'re ready.' : 'A real exam question. ' + q.year + '.');
  }
  function sheetClick(e) {
    if (!sheet) return;
    var t;
    if ((t = e.target.closest('[data-bio-check]'))) { checkPart(+t.getAttribute('data-bio-check')); return; }
    if ((t = e.target.closest('[data-bio-tf]'))) {
      var sec = t.closest('[data-bio-part]'), k = +sec.getAttribute('data-bio-part');
      sheet.tf[k] = t.getAttribute('data-bio-tf');
      sec.querySelectorAll('[data-bio-tf]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
      return;
    }
    if ((t = e.target.closest('[data-bio-tap]'))) {
      var pk = +t.getAttribute('data-bio-tappart'), a = t.getAttribute('data-bio-tap'), mark = sheet.card.querySelector('[data-bio-tapmark]'), c = ART[sheet.q.dia.base].anchors[a];
      sheet.tap[pk] = a;
      mark.innerHTML = '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="13" fill="#FFE14D" stroke="#18272D" stroke-width="2"/><text x="' + c[0] + '" y="' + (c[1] + 0.5) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#18272D">✓</text>';
      return;
    }
    if ((t = e.target.closest('[data-bio-alabel]'))) { pickLabel(+t.getAttribute('data-bio-alabel')); return; }
    if ((t = e.target.closest('[data-bio-aclear]'))) {
      var D = sheet.draw;
      if (D && !sheet.got[D.k]) { D.list.forEach(function (r) { r.el.remove(); }); D.list = []; pickLabel(0); }
      return;
    }
    if ((t = e.target.closest('[data-bio-self]'))) { selfTick(t); return; }
    if ((t = e.target.closest('[data-bio-next]'))) { if (sheet.onNext) sheet.onNext(t.getAttribute('data-bio-next')); else openQuestion(sheet.n, t.getAttribute('data-bio-next')); return; }
  }
  function answerWords(sec, part, k) {
    if (part.kind === 'fields') {
      var by = {};
      sec.querySelectorAll('[data-bio-f]').forEach(function (inp) { by[inp.getAttribute('data-bio-f')] = bioWords(inp.value); });
      return by;
    }
    if (part.kind === 'tf') return bioWords(sheet.tf[k] || '');
    var box = sec.querySelector('.bio-in');
    return box ? bioWords(box.value) : [];
  }
  function checkPart(k) {
    var part = sheet.q.parts[k], sec = sheet.card.querySelector('[data-bio-part="' + k + '"]');
    var selfOnly = part.kind === 'draw' || (part.kind === 'tap' && !part.tap);
    var empty = true;
    sec.querySelectorAll('.bio-in').forEach(function (i) { if (i.value.trim()) empty = false; });
    if (part.kind === 'tf') empty = !sheet.tf[k];
    if (part.kind === 'tap' && part.tap) empty = !sheet.tap[k];
    if (part.kind === 'arrows') empty = !(sheet.draw && sheet.draw.list.length);
    if (empty && !selfOnly) {
      sheet.card.querySelector('[data-bio-got="' + k + '"]').textContent = part.kind === 'tap' ? 'Tap the diagram first.' : part.kind === 'arrows' ? 'Draw on the diagram first.' : 'Write your answer first.';
      return;
    }
    var words = answerWords(sec, part, k);
    var got = part.kind === 'arrows' ? judgeArrows(k) : part.pts.map(function (pt) {
      if (pt.self) return false;
      if (part.kind === 'tap') return part.tap ? part.tap.indexOf(sheet.tap[k]) >= 0 : false;
      if (part.kind === 'fields') return hasPoint(pt, words[pt.f] || []);
      return hasPoint(pt, words);
    });
    if (part.kind === 'tap' && part.tap) got = got.map(function (g, i) { return i === 0 ? g : false; });
    if (part.kind === 'text') { var box = sec.querySelector('.bio-in'); got = onePerSentence(part, got, box ? box.value : ''); }
    sheet.got[k] = got;
    sec.querySelectorAll('.bio-in').forEach(function (i) { i.readOnly = true; });
    sec.querySelectorAll('[data-bio-alabel], [data-bio-aclear]').forEach(function (b) { b.disabled = true; });
    renderResult(k);
    var s = partScore(part, got), out = partOutOf(part);
    if (!selfOnly) {
      if (s >= out) { K.ding(4, true); K.mascot('happy', pick(['Full marks. Hmph.', 'Correct. All of it.', 'That\'s what the scheme wants.'])); }
      else if (s > 0) { K.ding(2); K.mascot('ok', 'Some marks. Not all.'); }
      else { K.bonk(); K.mascot('angry', pick(['No marks.', 'Read the scheme. Learn it.', 'Wrong.'])); }
    }
    updateTotal();
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  // The scheme's points: green if your answer has them, otherwise what the examiner wanted. A point the
  // checker can't judge (drawings) or missed can be ticked by hand.
  function renderResult(k) {
    var part = sheet.q.parts[k], got = sheet.got[k], res = sheet.card.querySelector('[data-bio-res="' + k + '"]');
    var s = partScore(part, got), out = partOutOf(part);
    res.innerHTML = '<ul class="bio-pts">' + part.pts.map(function (pt, i) {
      var ok = got[i];
      return '<li class="' + (ok ? 'is-got' : 'is-miss') + '"><span class="bio-pts__mark" aria-hidden="true">' + (ok ? '✓' : '·') + '</span><span>' + esc(pt.a.replace(/^\*/, '')) +
        ' <em>(' + pointMarks(part, pt) + ')</em></span>' +
        (!ok ? '<button type="button" class="bio-self" data-bio-self="' + k + ':' + i + '">' + (pt.self ? 'I had this' : 'I said this') + '</button>' : '') + '</li>';
    }).join('') + '</ul>' + ruleHtml(part) + noteHtml(part);
    sheet.card.querySelector('[data-bio-got="' + k + '"]').innerHTML = '<b>' + s + '/' + out + '</b>';
    sheet.card.querySelector('[data-bio-check="' + k + '"]').disabled = true;
  }
  // Under the scheme's points, only what helps you answer: what the marks need ("both arrows, each labelled") and the
  // scheme's notes on what it accepts. Not the mark arithmetic, the asterisks, or where the answers came from (the
  // source line says when the scheme is unofficial).
  var NOISE = /official|total|\bmark(s|ed|ing)?\b|asterisk|^\s*\*|\(\*\)|\* (in|=)|worth|encountered|correct (responses|answers)|first (two|five|correct)|typo|calls it|heading|specification|new course|included|question;|spells|ambiguous|inferred|best \d|\bNB\b|\d\(\d|= \d|\d points?\b|chapter|\brest of\b|scheme pdf|text version|print|scores \d|\d+m\b|added here|presumably|^\s*(compare|see) \d/i;
  function ruleHtml(part) {
    var r = (part.rule || '').replace(/\s*\((unofficial|no official scheme)\)/i, '').trim();
    if (!r || /\d|official|^likely|\b(points?|responses?)\.?$|^any (one|two|three|four|five|six)\.?$/i.test(r)) return '';
    return '<p class="bio-rule">Marking: ' + esc(r) + '</p>';
  }
  function noteHtml(part) {
    var keep = (part.note || '').replace(/([.!?])\s+(?=[A-Z(\['"*])/g, '$1\n').split('\n').filter(function (x) { return x.trim() && !NOISE.test(x); }).join(' ');
    return keep ? '<p class="bio-rule">' + esc(keep) + '</p>' : '';
  }

  // ---------- arrows dragged onto the diagram (kind 'arrows') ----------
  // Press, drag and let go, as in a drawing app: a straight arrow follows the finger and stays where it's let go. With
  // labels (O2, CO2) each label has one arrow, and the next label is picked once one is drawn; without, up to max
  // arrows, the oldest going when there are too many. Zones and the right arrows are in % of the page on a picture
  // from the paper (sc turns them into its pixels), in the drawing's own units otherwise.
  var SVGNS = 'http://www.w3.org/2000/svg', INK = '#18272D', GOOD = '#58A700', BAD = '#EA2B2B';
  // Each label has its own colour (O2 blue, CO2 orange), on its button and its arrow; not green or red, which say right
  // and wrong. Once checked, a labelled arrow keeps its colour and its label turns green or red.
  var LABEL_INKS = ['#1478B8', '#C25E00', '#7B3FB0'];
  function inkOf(A, t) {
    var i = A.labels ? A.labels.indexOf(t) : -1;
    return i < 0 ? INK : LABEL_INKS[i % LABEL_INKS.length];
  }
  // mark: true or false once checked (the label turns green or red; it stays the same size, so it doesn't spread onto
  // a neighbouring arrow).
  function arrowSvg(a, b, t, color, size, dashed, mark) {
    var n = function (v) { return v.toFixed(1); };
    var sw = size * 0.008, head = sw * 3.4, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var ex = b[0] - ux * head, ey = b[1] - uy * head, px = -uy * head * 0.62, py = ux * head * 0.62;
    var line = 'M' + n(a[0]) + ' ' + n(a[1]) + 'L' + n(ex) + ' ' + n(ey);
    var tip = 'M' + n(b[0]) + ' ' + n(b[1]) + 'L' + n(ex + px) + ' ' + n(ey + py) + 'L' + n(ex - px) + ' ' + n(ey - py) + 'Z';
    // A white edge first, so the arrow reads on a busy picture.
    var out = '<path d="' + line + '" fill="none" stroke="#FFFFFF" stroke-width="' + n(sw * 2.6) + '" stroke-linecap="round"/>' +
      '<path d="' + tip + '" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="' + n(sw * 1.6) + '" stroke-linejoin="round"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="' + n(sw) + '" stroke-linecap="round"' + (dashed ? ' stroke-dasharray="' + n(sw * 2.2) + ' ' + n(sw * 1.8) + '"' : '') + '/>' +
      '<path d="' + tip + '" fill="' + color + '"/>';
    if (t) {
      var judged = mark === true || mark === false, pill = judged ? (mark ? GOOD : BAD) : '#FFFFFF';
      var fs = size * 0.034, w = fs * (0.62 * t.length + 0.9), h = fs * 1.5, off = Math.abs(uy) * w / 2 + Math.abs(ux) * h / 2 + sw * 2.5;
      var cx = (a[0] + b[0]) / 2 - uy * off, cy = (a[1] + b[1]) / 2 + ux * off;
      out += '<rect x="' + n(cx - w / 2) + '" y="' + n(cy - h / 2) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + n(h / 2) + '" fill="' + pill + '" stroke="' + (judged ? pill : color) + '" stroke-width="' + n(sw * 0.6) + '"/>' +
        '<text x="' + n(cx) + '" y="' + n(cy) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="' + n(fs) + '" fill="' + (judged ? '#FFFFFF' : color) + '">' + esc(t) + '</text>';
    }
    return out;
  }
  function drawOn(svg, k) {
    if (!svg) return;
    var A = sheet.q.parts[k].arrows, size = svg.viewBox.baseVal.width, layer = document.createElementNS(SVGNS, 'g'), live = null, from = null;
    layer.setAttribute('class', 'bio-arrows-layer');
    svg.appendChild(layer);
    svg.classList.add('is-drawable');
    var D = sheet.draw = { k: k, layer: layer, size: size, list: [], label: 0, sc: svg.hasAttribute('data-bio-page') ? [PAGE[0] / 100, PAGE[1] / 100] : [1, 1] };
    function at(e) {
      var m = svg.getScreenCTM(), p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      p = m ? p.matrixTransform(m.inverse()) : p;
      return [p.x, p.y];
    }
    function label() { return A.labels ? A.labels[D.label] : ''; }
    svg.addEventListener('pointerdown', function (e) {
      if (sheet.draw !== D || sheet.got[k] || e.button) return;
      e.preventDefault();
      from = at(e);
      live = layer.appendChild(document.createElementNS(SVGNS, 'g'));
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    });
    svg.addEventListener('pointermove', function (e) {
      if (!live) return;
      e.preventDefault();
      live.innerHTML = arrowSvg(from, at(e), label(), inkOf(A, label()), size);
    });
    svg.addEventListener('pointerup', function (e) {
      if (!live) return;
      var to = at(e), g = live;
      live = null;
      if (Math.hypot(to[0] - from[0], to[1] - from[1]) < size * 0.05) { g.remove(); return; }  // a tap, not a drag
      var item = { a: from, b: to, t: label(), el: g };
      g.innerHTML = arrowSvg(from, to, item.t, inkOf(A, item.t), size);
      if (A.labels) D.list = D.list.filter(function (r) { if (r.t !== item.t) return true; r.el.remove(); return false; });
      D.list.push(item);
      if (!A.labels && D.list.length > (A.max || 1)) D.list.shift().el.remove();
      if (A.labels) {
        for (var i = 1; i < A.labels.length; i++) {
          var j = (D.label + i) % A.labels.length;
          if (!D.list.some(function (r) { return r.t === A.labels[j]; })) { pickLabel(j); break; }
        }
      }
    });
    svg.addEventListener('pointercancel', function () { if (live) live.remove(); live = null; });
  }
  function pickLabel(j) {
    if (!sheet.draw) return;
    sheet.draw.label = j;
    sheet.card.querySelectorAll('[data-bio-alabel]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-bio-alabel') === j)); });
  }
  function zoneDist(p, rects, sc) {
    return Math.min.apply(null, rects.map(function (r) {
      var x = r[0] * sc[0], y = r[1] * sc[1], w = r[2] * sc[0], h = r[3] * sc[1];
      return Math.hypot(Math.max(x - p[0], 0, p[0] - x - w), Math.max(y - p[1], 0, p[1] - y - h));
    }));
  }
  // The zone a point is in, or the nearest one within a little of it (a point on a wall counts for the side it's on).
  function zoneOf(p, A, D) {
    var best = null, bd = D.size * 0.06 + 0.01;
    Object.keys(A.zones || {}).forEach(function (z) { var d = zoneDist(p, A.zones[z], D.sc); if (d < bd) { best = z; bd = d; } });
    return best;
  }
  function arrowFits(r, rule, A, D) {
    var dx = r.b[0] - r.a[0], dy = r.b[1] - r.a[1], L = Math.hypot(dx, dy), z = rule.toward || rule.away;
    if (rule.label && r.t !== rule.label) return false;
    if (rule.on && zoneOf([(r.a[0] + r.b[0]) / 2, (r.a[1] + r.b[1]) / 2], A, D) !== rule.on) return false;
    if (rule.from && zoneOf(r.a, A, D) !== rule.from) return false;
    if (rule.to && zoneOf(r.b, A, D) !== rule.to) return false;
    if (rule.dir) {
      var d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[rule.dir];
      if ((dx * d[0] + dy * d[1]) / L < 0.75) return false;
    }
    if (z) {
      var gain = zoneDist(r.a, A.zones[z], D.sc) - zoneDist(r.b, A.zones[z], D.sc);
      if ((rule.toward ? gain : -gain) < 0.35 * L) return false;
    }
    return true;
  }
  // Each scheme point takes the first arrow that fits it (an arrow counts once). The arrows turn green or red, and a
  // missed one is drawn dashed where it should be.
  function judgeArrows(k) {
    var A = sheet.q.parts[k].arrows, D = sheet.draw, used = [];
    var got = A.rules.map(function (rule) {
      var r = D.list.filter(function (x) { return used.indexOf(x) < 0 && arrowFits(x, rule, A, D); })[0];
      if (r) used.push(r);
      return Boolean(r);
    });
    D.list.forEach(function (r) {
      var ok = used.indexOf(r) >= 0;
      r.el.innerHTML = r.t ? arrowSvg(r.a, r.b, r.t, inkOf(A, r.t), D.size, false, ok) : arrowSvg(r.a, r.b, '', ok ? GOOD : BAD, D.size);
    });
    A.rules.forEach(function (rule, i) {
      if (got[i] || !rule.show) return;
      var s = rule.show, g = D.layer.appendChild(document.createElementNS(SVGNS, 'g'));
      g.innerHTML = arrowSvg([s[0] * D.sc[0], s[1] * D.sc[1]], [s[2] * D.sc[0], s[3] * D.sc[1]], rule.label || '', rule.label ? inkOf(A, rule.label) : GOOD, D.size, true);
    });
    return got;
  }
  function selfTick(btn) {
    var p = btn.getAttribute('data-bio-self').split(':'), k = +p[0], i = +p[1];
    sheet.got[k][i] = true;
    renderResult(k);
    updateTotal();
  }
  function updateTotal() {
    var total = 0, all = true;
    sheet.q.parts.forEach(function (p, k) {
      if (sheet.got[k]) total += partScore(p, sheet.got[k]); else all = false;
    });
    K.rollTo(sheet.card.querySelector('[data-am-gscore]'), total);
    sheet.q.parts.forEach(function (p, k) { K.gameSeg(sheet.card, k, sheet.got[k] ? (partScore(p, sheet.got[k]) >= partOutOf(p) ? 'is-ok' : partScore(p, sheet.got[k]) ? 'is-half' : 'is-no') : ''); });
    // Saved as you go: the best total so far, how many parts were checked and the marks they're worth. The day's
    // score also goes in the log that Progress draws its trend from.
    var out = questionOutOf(sheet.q), best = scoreOf(sheet.n, sheet.q), done = sheet.got.filter(Boolean).length, tried = 0;
    sheet.q.parts.forEach(function (p, k) { if (sheet.got[k]) tried += partOutOf(p); });
    if (!best || total > best.got || (total === best.got && done > (best.done || 0))) store(scoreKey(sheet.n, sheet.q), JSON.stringify({ got: total, out: out, done: done, tried: tried }));
    logScore(sheet.n, sheet.q.id, total, tried);
    if (all && total >= out) K.later(K.fanfare, 300);
  }

  // The day's best for each question goes in the log (the saved score is the best ever, so the two agree).
  function logScore(n, id, got, tried) {
    var log = [], t = new Date(), d = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    try { log = JSON.parse(store('bio-log') || '[]'); } catch (err) {}
    if (!Array.isArray(log)) log = [];
    for (var i = log.length - 1; i >= 0 && log[i].d === d; i--) {
      if (log[i].n !== n || log[i].id !== id) continue;
      if (log[i].got > got || (log[i].got === got && log[i].tried >= tried)) return;
      log.splice(i, 1);
      break;
    }
    log.push({ d: d, n: n, id: id, got: got, tried: tried });
    store('bio-log', JSON.stringify(log.slice(-800)));
  }

  // ---------- routing ----------
  function route() {
    if (!app) return;
    var h = location.hash.replace(/^#/, ''), m = h.match(/^ch(\d+)$/);
    menu(false);
    app.classList.remove('is-settled');
    if (m) renderChapter(+m[1]); else renderHome();
    window.scrollTo(0, 0);
  }
  // After a card closes: the same view with fresh scores, scrolled where it was, without animating in again.
  function refresh() {
    var y = window.scrollY, h = location.hash.replace(/^#/, ''), m = h.match(/^ch(\d+)$/);
    app.classList.add('is-settled');
    if (m) renderChapter(+m[1], store('bio-tab')); else renderHome();
    window.scrollTo(0, y);
  }
  function onClick(e) {
    var t;
    if ((t = e.target.closest('[data-pg-next]'))) { openNext(+t.getAttribute('data-pg-next')); return; }
    if ((t = e.target.closest('[data-bio-tab]'))) { var n = +location.hash.replace(/\D/g, ''); showTab(n, t.getAttribute('data-bio-tab')); return; }
    if ((t = e.target.closest('[data-bio-filter]'))) { store('bio-filter', t.getAttribute('data-bio-filter')); showTab(+location.hash.replace(/\D/g, ''), 'questions'); return; }
    if ((t = e.target.closest('[data-bio-open]'))) { openOnDesk(+location.hash.replace(/\D/g, ''), t.getAttribute('data-bio-open')); return; }
    if ((t = e.target.closest('[data-bio-draw]'))) { AM.practice('bio-' + t.getAttribute('data-bio-draw'), 'draw', refresh); return; }
    if ((t = e.target.closest('[data-bio-build]'))) { if (window.BioBuild) window.BioBuild.open(t.getAttribute('data-bio-build')); return; }
    if ((t = e.target.closest('[data-bio-game]'))) { openGame(+location.hash.replace(/\D/g, ''), t.getAttribute('data-bio-game')); return; }
    if ((t = e.target.closest('[data-bio-learn]'))) { if (window.BioMemory) window.BioMemory.open(+location.hash.replace(/\D/g, ''), +t.getAttribute('data-bio-learn')); }
  }
  // A real exam question opens on the desk (the Geography page's desk scene), as its real paper page, with the
  // narrated guide; practice questions have no paper, so they open here.
  var DESK = 'Geography%20Questions.dc.html';
  function openOnDesk(n, qid) {
    if ((window.BioPapers || {})[n + '/' + qid]) { location.href = DESK + '#bio/' + n + '/' + encodeURIComponent(qid); return; }
    openQuestion(n, qid);
  }
  function openGame(n, kind) {
    var L = LEARN[n] || {};
    if (kind === 'action') { if (window.BioAction) window.BioAction.open(n); return; }
    if (kind === 'examiner') { if (window.BioExaminer) window.BioExaminer.open(n); return; }
    if (/^(match|spot|sprint)$/.test(kind)) { if (window.BioQuick) window.BioQuick.open(kind, n); return; }
    AM.addGames('bio-' + n, L.games);
    AM.practice('bio-' + n, kind, refresh);
  }
  function start() {
    app = document.getElementById('bio-app');
    if (!app) return;
    side = document.getElementById('bio-side');
    bar = document.getElementById('bio-top');
    app.addEventListener('click', onClick);
    app.addEventListener('change', function (e) {
      if (!e.target.matches('[data-pg-target]')) return;
      store('bio-target', e.target.value);
      refresh();
      var sel = app.querySelector('[data-pg-target]');
      if (sel) sel.focus();
    });
    if (bar) bar.addEventListener('click', function (e) { if (e.target.closest('[data-sh-menu]')) menu(!document.body.classList.contains('sh-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('sh-open')) menu(false); });
    // The charts are drawn to their box's width, so they're redrawn when it changes.
    var wait = null, lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      clearTimeout(wait);
      wait = setTimeout(function () {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        if (window.BioProgress && app.querySelector('[data-pg-ladder]')) window.BioProgress.redraw(app, progressApi());
        if (window.innerWidth > 1100) menu(false);
      }, 150);
    });
    window.addEventListener('hashchange', route);
    route();
  }
  window.BioApp = {
    refresh: refresh, words: bioWords, hasPoint: hasPoint, partScore: partScore, pointMarks: pointMarks, partOutOf: partOutOf, chapter: chapter, onePerSentence: onePerSentence,
    graphSvg: graphSvg, diagramHtml: diagramHtml, questions: allQuestions, openQuestion: openQuestion, outOf: questionOutOf,
    // For tests: does a typed answer get each point of a part?
    check: function (n, qid, partIndex, text) {
      var q = QS[n].questions.filter(function (x) { return x.id === qid; })[0], part = q.parts[partIndex], w = bioWords(text);
      return part.pts.map(function (pt) { return hasPoint(pt, w); });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

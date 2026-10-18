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
  function scoreOf(qid) { try { return JSON.parse(store('bio-q-' + qid) || 'null'); } catch (err) { return null; } }

  // ---------- marking: the same word rules as tools/bio/build_bio_questions.py ----------
  var SYNONYMS = { big: 'large', huge: 'large', tiny: 'small', lots: 'many', quick: 'fast', quicker: 'faster' };
  var SUFFIXES = ['ation', 'ition', 'tion', 'sion', 'ment', 'ing', 'ous', 'ive', 'ed', 'er', 'ly', 'al'];
  // Words that share a start but mean different things.
  var CONFUSE = [['arter', 'arteriol'], ['lymph', 'lymphocyt'], ['pepsin', 'pepsinog'], ['trypsin', 'trypsinog']];
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
    return (String(text).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || []).map(function (w) { return bioStem(SYNONYMS[w] || w); });
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
    return min >= 5 && lev(a, b) <= 1;
  }
  // A marking point is in an answer if, for one of its alternatives, enough of its key words are there.
  function hasPoint(pt, words) {
    return (pt.k || []).some(function (alt) {
      var got = alt.w.filter(function (k) { return words.some(function (w) { return sameStem(w, k); }); }).length;
      return got >= alt.n;
    });
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
    lx = Math.max(m.given ? 46 : 14, Math.min(480 - (m.given ? 46 : 14), lx));
    ly = Math.max(14, Math.min(306, ly));
    var line = '<path d="M' + lx.toFixed(1) + ' ' + ly.toFixed(1) + 'L' + at[0] + ' ' + at[1] + '" stroke="#14243B" stroke-width="1.8"/><circle cx="' + at[0] + '" cy="' + at[1] + '" r="2.6" fill="#14243B"/>';
    if (m.given) {
      var w = m.t.length * 6.8 + 16;
      return line + '<rect x="' + (lx - w / 2).toFixed(1) + '" y="' + (ly - 10) + '" width="' + w.toFixed(1) + '" height="20" rx="10" fill="#14243B"/>' +
        '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Lexend, Nunito, sans-serif" font-weight="600" font-size="11.5" fill="#FFFFFF">' + esc(m.t) + '</text>';
    }
    return line + '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="11" fill="#FFFFFF" stroke="#14243B" stroke-width="2"/>' +
      '<text x="' + lx.toFixed(1) + '" y="' + (ly + 0.5).toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#14243B">' + esc(m.t) + '</text>';
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
  var GRAPH_COLORS = ['#E5484D', '#3E6FD8', '#2BC46F', '#7E5BA3'];
  function graphSvg(g) {
    var T = function (x, y, txt, more, size) { return '<text x="' + x + '" y="' + y + '" font-family="Nunito, sans-serif" font-weight="800" font-size="' + (size || 11) + '" fill="#14243B"' + (more || '') + '>' + esc(txt) + '</text>'; };
    if (!g.series) {
      var y1 = g.trend === 'down' ? 40 : 120, y2 = g.trend === 'down' ? 120 : 40;
      return '<svg viewBox="0 0 220 160" role="img"><title>' + esc(g.title) + '</title><rect width="220" height="160" fill="#FFFFFF"/>' +
        '<path d="M30 14V140H210" fill="none" stroke="#14243B" stroke-width="2"/>' +
        '<path d="M34 ' + y1 + 'C90 ' + y1 + ' 150 ' + y2 + ' 204 ' + y2 + '" fill="none" stroke="#E5484D" stroke-width="3" stroke-dasharray="7 5"/>' +
        T(120, 156, 'Time', ' text-anchor="middle"') + T(36, 12, g.title) + '</svg>';
    }
    // Plot area: x 56..456, y 36..260 on a 480 x 320 card.
    var X = function (v) { return (56 + v * 4).toFixed(1); }, Y = function (v) { return (260 - v * 2.24).toFixed(1); };
    var out = '<svg viewBox="0 0 480 320" role="img"><title>' + esc(g.title || '') + '</title><rect width="480" height="320" fill="#FFFFFF"/>';
    if (g.title) out += T(240, 20, g.title, ' text-anchor="middle"', 13);
    out += '<path d="M56 30V260H462" fill="none" stroke="#14243B" stroke-width="2"/>';
    (g.xt || []).forEach(function (t) { out += '<path d="M' + X(t[0]) + ' 260v5" stroke="#14243B" stroke-width="1.5"/>' + T(X(t[0]), 278, t[1], ' text-anchor="middle"', 10); });
    (g.yt || []).forEach(function (t) { out += '<path d="M51 ' + Y(t[0]) + 'h5" stroke="#14243B" stroke-width="1.5"/>' + T(47, +Y(t[0]) + 4, t[1], ' text-anchor="end"', 10); });
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
      out += '<circle cx="' + X(m.at[0]) + '" cy="' + Y(m.at[1]) + '" r="11" fill="#FFFFFF" stroke="#14243B" stroke-width="2"/>' +
        '<text x="' + X(m.at[0]) + '" y="' + (+Y(m.at[1]) + 0.5) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#14243B">' + esc(m.t) + '</text>';
    });
    return out + '</svg>';
  }
  function diagramHtml(dia, tapPart) {
    if (!dia) return '';
    if (dia.panels) return '<div class="bio-dia bio-dia--two">' + dia.panels.map(function (p) { return '<div>' + baseSvg(p.base, p.marks, null) + '</div>'; }).join('') + '</div>';
    if (dia.graphs) return dia.graphs.length === 1 ? '<div class="bio-dia">' + graphSvg(dia.graphs[0]) + '</div>' :
      '<div class="bio-dia bio-dia--two">' + dia.graphs.map(function (g) { return '<div>' + graphSvg(g) + '</div>'; }).join('') + '</div>';
    if (dia.base && ART[dia.base]) return '<div class="bio-dia">' + baseSvg(dia.base, dia.marks, tapPart) + '</div>';
    return '<p class="bio-dia__note"><b>Diagram on the paper:</b> ' + esc(dia.note || '') + '</p>';
  }

  // ---------- the page ----------
  function counts(n) {
    var d = QS[n], qn = d ? d.questions.length : 0, done = 0, art = 0;
    if (d) d.questions.forEach(function (q) { if (scoreOf(q.id)) done += 1; });
    Object.keys(ART).forEach(function (id) { if (ART[id].chapter === n) art += 1; });
    return { questions: qn, done: done, diagrams: art };
  }
  function renderHome() {
    document.title = 'Biology | Leaving Cert revision';
    app.innerHTML = '<header class="bio-top"><div class="bio-face" aria-hidden="true">' + (K ? K.face : '') + '</div>' +
      '<div><p class="bio-kicker">Leaving Cert Biology · Higher Level · exam 2027</p><h1 class="bio-h1">The human body</h1>' +
      '<p class="bio-lead">Every real exam question on these chapters since 2004, plus the 2027 sample papers, marked the way the SEC marks them. Then games to make it stick.</p></div></header>' +
      '<ol class="bio-chapters">' + CHAPTERS.map(function (c) {
        var k = counts(c.n), pct = k.questions ? Math.round(k.done / k.questions * 100) : 0;
        return '<li><a class="bio-ch" href="#ch' + c.n + '"><span class="bio-ch__n">' + c.n + '</span>' +
          '<span class="bio-ch__text"><span class="bio-ch__unit">' + esc(c.unit) + '</span><b>' + esc(c.title) + '</b>' +
          '<span class="bio-ch__meta">' + k.questions + ' exam questions' + (k.diagrams ? ' · ' + k.diagrams + ' diagrams' : '') + '</span>' +
          '<span class="bio-bar" aria-label="' + k.done + ' of ' + k.questions + ' questions done"><i style="width:' + pct + '%"></i></span></span>' +
          '<i class="bio-go" aria-hidden="true"></i></a></li>';
      }).join('') + '</ol>';
  }
  var TABS = [['questions', 'Exam questions'], ['diagrams', 'Diagrams'], ['games', 'Games'], ['learn', 'Learn it']];
  function renderChapter(n, tab) {
    var c = chapter(n), d = QS[n];
    if (!c) { renderHome(); return; }
    tab = tab || store('bio-tab') || 'questions';
    document.title = c.short + ' | Leaving Cert Biology';
    app.innerHTML = '<a class="bio-back" href="#">All chapters</a>' +
      '<header class="bio-chhead"><span class="bio-ch__n">' + n + '</span><div><p class="bio-kicker">' + esc(c.unit) + '</p><h1 class="bio-h1">' + esc(c.title) + '</h1></div></header>' +
      '<nav class="bio-tabs" role="tablist">' + TABS.map(function (t) {
        return '<button type="button" role="tab" class="bio-tab" data-bio-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>';
      }).join('') + '</nav><section class="bio-panel" data-bio-panel></section>';
    showTab(n, tab);
  }
  function showTab(n, tab) {
    store('bio-tab', tab);
    app.querySelectorAll('[data-bio-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-bio-tab') === tab)); });
    var panel = app.querySelector('[data-bio-panel]'), d = QS[n];
    if (tab === 'questions') panel.innerHTML = questionList(n, d);
    else if (tab === 'diagrams') panel.innerHTML = diagramList(n);
    else if (tab === 'games') panel.innerHTML = gameList(n);
    else panel.innerHTML = learnList(n);
  }
  var FILTERS = [['all', 'All'], ['A', 'Short (Section A)'], ['B', 'Experiments (B)'], ['C', 'Long (Section C)'], ['sample', '2027 samples'], ['practice', 'Practice']];
  function questionList(n, d) {
    if (!d) return '<p class="bio-empty">Questions for this chapter are coming.</p>';
    var f = store('bio-filter') || 'all';
    var list = allQuestions(n).filter(function (q) { return f === 'all' || q.sec === f || (f === 'sample' && q.year === 2027 && q.sec !== 'practice'); });
    return '<p class="bio-note">' + d.questions.length + ' real exam questions. Each part is marked against the official marking scheme' +
      ' (the 2027 sample papers have no official scheme, so their answers are ours). Old-course questions that go beyond the new course are marked.</p>' +
      '<div class="bio-filters">' + FILTERS.map(function (x) {
        return '<button type="button" class="bio-chip" data-bio-filter="' + x[0] + '" aria-pressed="' + (x[0] === f) + '">' + x[1] + '</button>';
      }).join('') + '</div>' +
      '<ul class="bio-qlist">' + list.map(function (q) {
        var s = scoreOf(q.id), out = questionOutOf(q), first = q.parts[0] ? q.parts[0].q : '';
        return '<li><button type="button" class="bio-q" data-bio-open="' + esc(q.id) + '">' +
          '<span class="bio-q__src">' + (q.sec === 'practice' ? 'Practice<em>Not a real paper</em>' : esc(q.year === 2027 ? '2027 sample ' + q.id.split('-')[0].slice(1) : String(q.year)) + '<em>' + esc(q.id.split('-').slice(1).join('-')) + '</em>') + '</span>' +
          '<span class="bio-q__text">' + esc((q.stem ? q.stem + ' ' : '') + first).slice(0, 150) + '</span>' +
          '<span class="bio-q__meta">' + (q.fresh === 'no' ? '<i class="bio-old">Old course</i>' : q.fresh === 'partly' ? '<i class="bio-old bio-old--part">Partly old course</i>' : '') +
            (s ? '<b class="bio-q__score">' + s.got + '/' + s.out + '</b>' : '<span>' + out + ' marks</span>') + '</span></button></li>';
      }).join('') + '</ul>' +
      (d.notCovered && d.notCovered.length ? '<details class="bio-gaps"><summary>On the course but never asked yet (' + d.notCovered.length + ')</summary><ul>' +
        d.notCovered.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul><p>The Practice questions in this list cover them, with our own answer keys.</p></details>' : '');
  }
  function diagramList(n) {
    var ids = Object.keys(ART).filter(function (id) { return ART[id].chapter === n; });
    if (!ids.length) return '<p class="bio-empty">The diagrams for this chapter are coming.</p>';
    return '<p class="bio-note">Every diagram you need to memorise for this chapter. Build it from its parts and label it, or draw it from memory.</p>' +
      '<ul class="bio-dlist">' + ids.map(function (id) {
        var a = ART[id], best = store('bio-build-' + id);
        return '<li class="bio-d"><div class="bio-d__pic" aria-hidden="true">' + a.plain + '</div><div class="bio-d__text"><b>' + esc(a.name) + '</b>' +
          '<span>' + a.labels.length + ' labels' + (best ? ' · Build it best: ' + esc(best) : '') + '</span>' +
          '<div class="bio-d__btns"><button type="button" class="bio-btn" data-bio-build="' + id + '">Build it</button>' +
          '<button type="button" class="bio-btn bio-btn--ghost" data-bio-draw="' + n + '">Draw it</button></div></div></li>';
      }).join('') + '</ul>';
  }
  function gameList(n) {
    var L = LEARN[n] || {}, items = [];
    if (L.action) items.push(['action', L.action.name, L.action.what]);
    if (L.games && L.games.chains) items.push(['chain', 'Chain reaction', 'Put each process in order, type it out, then write it from memory.']);
    if (L.games && L.games.level) items.push(['level', 'Level up', 'Build one answer point into full marks, then write it from memory.']);
    if (L.examiner && L.examiner.length) items.push(['examiner', 'Be the examiner', 'Mark a student\'s answer against the real marking scheme, then fix the lines that got nothing.']);
    if (!items.length) return '<p class="bio-empty">Games for this chapter are coming.</p>';
    return '<ul class="bio-glist">' + items.map(function (g) {
      return '<li><button type="button" class="bio-g bio-g--' + g[0] + '" data-bio-game="' + g[0] + '"><b>' + esc(g[1]) + '</b><span>' + esc(g[2]) + '</span><i class="bio-go" aria-hidden="true"></i></button></li>';
    }).join('') + '</ul>';
  }
  function learnList(n) {
    var L = LEARN[n] || {}, items = (L.learn || []);
    if (!items.length) return '<p class="bio-empty">Memory games for this chapter are coming.</p>';
    return '<ul class="bio-glist">' + items.map(function (g, k) {
      return '<li><button type="button" class="bio-g bio-g--learn" data-bio-learn="' + k + '"><b>' + esc(g.name) + '</b><span>' + esc(g.what) + '</span><i class="bio-go" aria-hidden="true"></i></button></li>';
    }).join('') + '</ul>';
  }

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
    } else if (part.kind === 'draw' || part.kind === 'tap') {
      ui = '<p class="bio-hint">Do this on paper (or practise it under Diagrams), then check it against the marking scheme.</p>';
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
  function openQuestion(n, qid) {
    var list = allQuestions(n), q = list.filter(function (x) { return x.id === qid; })[0];
    if (!q || !AM) return;
    AM.practice('bio-' + n, 'none', refresh);
    var card = K.gameCard(q.src);
    card.classList.add('bio-sheet');
    var tapPart = null;
    q.parts.forEach(function (p, k) { if (p.kind === 'tap' && p.tap) tapPart = String(k); });
    sheet = { n: n, q: q, card: card, got: q.parts.map(function () { return null; }), tap: {}, tf: {} };
    K.gameHud(card, q.parts.length, '/' + questionOutOf(q));
    K.gameBody(card, '<div class="bio-paper">' +
      '<p class="bio-src">' + esc(q.src) + (q.fresh !== 'yes' ? ' <i class="bio-old' + (q.fresh === 'partly' ? ' bio-old--part' : '') + '">' + (q.fresh === 'no' ? 'Old course' : 'Partly old course') + '</i>' : '') + '</p>' +
      (q.why ? '<p class="bio-why">' + esc(q.why) + '</p>' : '') +
      (q.stem ? '<p class="bio-stem">' + esc(q.stem) + '</p>' : '') + diagramHtml(q.dia, tapPart) +
      q.parts.map(function (p, k) { return partHtml(q, p, k); }).join('') + '</div>', Boolean(q.dia && (q.dia.base || q.dia.panels)));
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
      mark.innerHTML = '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="13" fill="#FFE14D" stroke="#14243B" stroke-width="2"/><text x="' + c[0] + '" y="' + (c[1] + 0.5) + '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#14243B">✓</text>';
      return;
    }
    if ((t = e.target.closest('[data-bio-self]'))) { selfTick(t); return; }
    if ((t = e.target.closest('[data-bio-next]'))) { openQuestion(sheet.n, t.getAttribute('data-bio-next')); return; }
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
    if (empty && !selfOnly) {
      sheet.card.querySelector('[data-bio-got="' + k + '"]').textContent = part.kind === 'tap' ? 'Tap the diagram first.' : 'Write your answer first.';
      return;
    }
    var words = answerWords(sec, part, k);
    var got = part.pts.map(function (pt) {
      if (pt.self) return false;
      if (part.kind === 'tap') return part.tap.indexOf(sheet.tap[k]) >= 0;
      if (part.kind === 'fields') return hasPoint(pt, words[pt.f] || []);
      return hasPoint(pt, words);
    });
    if (part.kind === 'tap' && part.tap) got = got.map(function (g, i) { return i === 0 ? g : false; });
    sheet.got[k] = got;
    sec.querySelectorAll('.bio-in').forEach(function (i) { i.readOnly = true; });
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
    var rule = part.rule ? '<p class="bio-rule">Marking: ' + esc(part.rule) + (part.m ? '' : '. The scheme marks this by how many points you get, so here each point counts as 3.') + '</p>' : '';
    res.innerHTML = '<ul class="bio-pts">' + part.pts.map(function (pt, i) {
      var ok = got[i];
      return '<li class="' + (ok ? 'is-got' : 'is-miss') + '"><span class="bio-pts__mark" aria-hidden="true">' + (ok ? '✓' : '·') + '</span><span>' + esc(pt.a.replace(/^\*/, '')) +
        ' <em>(' + pointMarks(part, pt) + ')</em></span>' +
        (!ok ? '<button type="button" class="bio-self" data-bio-self="' + k + ':' + i + '">' + (pt.self ? 'I had this' : 'I said this') + '</button>' : '') + '</li>';
    }).join('') + '</ul>' + rule + (part.note ? '<p class="bio-rule">' + esc(part.note) + '</p>' : '') +
      (part.unofficial ? '<p class="bio-rule">No official scheme exists for this sample paper: these are the points an examiner would most likely accept.</p>' : '');
    sheet.card.querySelector('[data-bio-got="' + k + '"]').innerHTML = '<b>' + s + '/' + out + '</b>';
    sheet.card.querySelector('[data-bio-check="' + k + '"]').disabled = true;
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
    // Saved as you go: the best total so far, and how many parts were checked.
    var out = questionOutOf(sheet.q), best = scoreOf(sheet.q.id), done = sheet.got.filter(Boolean).length;
    if (!best || total > best.got || (total === best.got && done > (best.done || 0))) store('bio-q-' + sheet.q.id, JSON.stringify({ got: total, out: out, done: done }));
    if (all && total >= out) K.later(K.fanfare, 300);
  }

  // ---------- routing ----------
  function route() {
    if (!app) return;
    var h = location.hash.replace(/^#/, ''), m = h.match(/^ch(\d+)$/);
    if (m) renderChapter(+m[1]); else renderHome();
    window.scrollTo(0, 0);
  }
  // After a card closes: the same view with fresh scores, scrolled where it was.
  function refresh() {
    var y = window.scrollY, h = location.hash.replace(/^#/, ''), m = h.match(/^ch(\d+)$/);
    if (m) renderChapter(+m[1], store('bio-tab')); else renderHome();
    window.scrollTo(0, y);
  }
  function onClick(e) {
    var t;
    if ((t = e.target.closest('[data-bio-tab]'))) { var n = +location.hash.replace(/\D/g, ''); showTab(n, t.getAttribute('data-bio-tab')); return; }
    if ((t = e.target.closest('[data-bio-filter]'))) { store('bio-filter', t.getAttribute('data-bio-filter')); showTab(+location.hash.replace(/\D/g, ''), 'questions'); return; }
    if ((t = e.target.closest('[data-bio-open]'))) { openQuestion(+location.hash.replace(/\D/g, ''), t.getAttribute('data-bio-open')); return; }
    if ((t = e.target.closest('[data-bio-draw]'))) { AM.practice('bio-' + t.getAttribute('data-bio-draw'), 'draw', refresh); return; }
    if ((t = e.target.closest('[data-bio-build]'))) { if (window.BioBuild) window.BioBuild.open(t.getAttribute('data-bio-build')); return; }
    if ((t = e.target.closest('[data-bio-game]'))) { openGame(+location.hash.replace(/\D/g, ''), t.getAttribute('data-bio-game')); return; }
    if ((t = e.target.closest('[data-bio-learn]'))) { if (window.BioMemory) window.BioMemory.open(+location.hash.replace(/\D/g, ''), +t.getAttribute('data-bio-learn')); }
  }
  function openGame(n, kind) {
    var L = LEARN[n] || {};
    if (kind === 'action') { if (window.BioAction) window.BioAction.open(n); return; }
    if (kind === 'examiner') { if (window.BioExaminer) window.BioExaminer.open(n); return; }
    AM.addGames('bio-' + n, L.games);
    AM.practice('bio-' + n, kind, refresh);
  }
  function start() {
    app = document.getElementById('bio-app');
    if (!app) return;
    app.addEventListener('click', onClick);
    window.addEventListener('hashchange', route);
    route();
  }
  window.BioApp = {
    refresh: refresh, words: bioWords, hasPoint: hasPoint, partScore: partScore, pointMarks: pointMarks, partOutOf: partOutOf, chapter: chapter,
    graphSvg: graphSvg, diagramHtml: diagramHtml, questions: allQuestions,
    // For tests: does a typed answer get each point of a part?
    check: function (n, qid, partIndex, text) {
      var q = QS[n].questions.filter(function (x) { return x.id === qid; })[0], part = q.parts[partIndex], w = bioWords(text);
      return part.pts.map(function (pt) { return hasPoint(pt, w); });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

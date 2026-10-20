// Progress for Leaving Cert Biology (biology.html's home): a predicted grade from the exam questions you have
// answered, how it has moved, where each chapter stands, and the last two weeks. predict() and history() are pure, so
// tools/bio/tests/progress.mjs can check them; render() draws the screen into the page's canvas.
(function () {
  'use strict';
  // Higher Level grades: the lowest percentage for each, and its CAO points.
  var GRADES = [['H1', 90, 100], ['H2', 80, 88], ['H3', 70, 77], ['H4', 60, 66], ['H5', 50, 56], ['H6', 40, 46], ['H7', 30, 37], ['H8', 0, 0]];
  function gradeOf(pct) {
    for (var i = 0; i < GRADES.length; i++) if (pct >= GRADES[i][1]) return { name: GRADES[i][0], from: GRADES[i][1], points: GRADES[i][2] };
    return { name: 'H8', from: 0, points: 0 };
  }
  function gradeByName(name) { return GRADES.filter(function (g) { return g[0] === name; }).map(function (g) { return { name: g[0], from: g[1], points: g[2] }; })[0] || null; }

  // The marks a saved score covers: the parts that were checked. Saves from before `tried` was kept count the parts
  // done as an even share of the question.
  function triedOf(s, q) {
    if (s.tried != null) return s.tried;
    if (q && s.done != null && q.parts && q.parts.length) return s.out * Math.min(1, s.done / q.parts.length);
    return s.out;
  }

  // The model. Every chapter's rate is the marks you got over the marks you answered, pulled towards your overall
  // rate by 40 marks' worth (so one lucky question can't make a chapter an H1), and the overall rate is pulled towards
  // 50% by 30 marks. A chapter you haven't tried counts at your overall rate. The chapters are weighted by how many real
  // exam questions each has had, and the range widens with fewer marks answered and more of the weight untried.
  var PRIOR_ALL = 30, PRIOR_CH = 40;
  function predict(chapters, scores) {
    var G = 0, A = 0, Q = 0, rows = chapters.map(function (c) {
      var got = 0, tried = 0, count = 0;
      c.questions.forEach(function (q) {
        var s = scores[c.n + '/' + q.id], t;
        if (!s || !((t = triedOf(s, q)) > 0)) return;
        got += Math.min(s.got, t);
        tried += t;
        count += 1;
      });
      G += got; A += tried; Q += count;
      return { n: c.n, weight: c.weight, got: got, tried: tried, count: count, total: c.total };
    });
    var out = { rows: rows, marks: Math.round(A), got: Math.round(G), questions: Q, pct: null };
    if (!(A > 0)) return out;
    var r0 = (G + 0.5 * PRIOR_ALL) / (A + PRIOR_ALL), W = 0, P = 0, U = 0;
    rows.forEach(function (r) {
      r.est = (r.got + r0 * PRIOR_CH) / (r.tried + PRIOR_CH);
      r.seen = r.tried > 0 ? r.got / r.tried : null;
      W += r.weight;
      P += r.weight * r.est;
      if (!r.tried) U += r.weight;
    });
    var p = P / W, sd = Math.sqrt(p * (1 - p) / (A / 3 + 4)) + 0.12 * (U / W);
    // The figures shown are whole percentages, and every grade is read from the figure shown.
    out.pct = Math.round(p * 100);
    out.low = Math.max(0, Math.round((p - 1.28 * sd) * 100));
    out.high = Math.min(100, Math.round((p + 1.28 * sd) * 100));
    out.grade = gradeOf(out.pct);
    out.lowGrade = gradeOf(out.low);
    out.highGrade = gradeOf(out.high);
    out.untried = U / W;
    return out;
  }

  // The prediction on each day you answered something, replaying the log (one entry per question per day). Scores
  // saved before the log began count from the first day.
  // scores and the log are keyed by chapter and question: "29/2016-Q12b".
  function history(chapters, scores, log) {
    var logged = {}, best = {}, days = [];
    log.forEach(function (e) { logged[e.n + '/' + e.id] = true; if (days.indexOf(e.d) < 0) days.push(e.d); });
    Object.keys(scores).forEach(function (key) { if (!logged[key]) best[key] = scores[key]; });
    days.sort();
    if (!days.length && Object.keys(best).length) days = [today()];
    return days.map(function (d) {
      log.forEach(function (e) {
        if (e.d !== d) return;
        var key = e.n + '/' + e.id, b = best[key];
        if (!b || e.got > b.got || (e.got === b.got && e.tried > triedOf(b))) best[key] = { got: e.got, out: e.tried, tried: e.tried };
      });
      var p = predict(chapters, best);
      return p.pct == null ? null : { d: d, pct: p.pct, low: p.low, high: p.high };
    }).filter(Boolean);
  }

  // ---------- dates ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(t) { return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); }
  function today() { return dayKey(new Date()); }
  function parseDay(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, k) { var t = parseDay(d); t.setDate(t.getDate() + k); return dayKey(t); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function short(d) { var t = parseDay(d); return t.getDate() + ' ' + MONTHS[t.getMonth()]; }
  function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }

  // ---------- the log: bio.js adds { d, id, got, tried } each time a part is checked (one entry per question per day) ----------
  function readLog(store) { try { var v = JSON.parse(store('bio-log') || '[]'); return Array.isArray(v) ? v : []; } catch (err) { return []; } }

  // ---------- charts: drawn to the app rules (one hue on the main data, straight lines, quiet grids) ----------
  var NS = 'http://www.w3.org/2000/svg';
  function f1(v) { return Math.round(v * 10) / 10; }
  // The grade ladder: H1-H8 bands up the side, your predicted percentage across the days, its likely range as a
  // faint band, and your target's band picked out.
  function ladderSvg(points, target, w, h) {
    var L = 34, R = 46, T = 10, B = 24, pw = w - L - R, ph = h - T - B;
    var lows = points.map(function (p) { return p.low; }), floor = Math.min(30, target ? target.from : 30, lows.length ? Math.min.apply(null, lows) : 30);
    var y0 = Math.max(0, Math.floor((floor - 5) / 10) * 10), Y = function (v) { return f1(T + ph * (1 - (v - y0) / (100 - y0))); };
    var first = points.length ? points[0].d : null, span = points.length > 1 ? Math.max(1, daysBetween(first, points[points.length - 1].d)) : 0;
    var X = function (d) { return f1(span ? L + pw * daysBetween(first, d) / span : L + pw / 2); };
    var s = '<svg xmlns="' + NS + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' +
      (points.length ? 'Predicted percentage on ' + points.length + (points.length === 1 ? ' day' : ' days') + ', now ' + points[points.length - 1].pct + '%' : 'No prediction yet') + '">';
    // Bands, their boundaries and their names.
    GRADES.forEach(function (g, i) {
      var top = i ? GRADES[i - 1][1] : 100, bot = Math.max(g[1], y0);
      if (top <= y0) return;
      var mine = target && target.name === g[0];
      if (mine) s += '<rect class="ld-target" x="' + L + '" y="' + Y(top) + '" width="' + pw + '" height="' + f1(Y(bot) - Y(top)) + '"/>';
      if (g[1] > y0) s += '<line class="ld-rule" x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(g[1]) + '" y2="' + Y(g[1]) + '"/>';
      if (Y(bot) - Y(top) >= 12) s += '<text class="ld-band' + (mine ? ' is-target' : '') + '" x="' + (L - 10) + '" y="' + f1((Y(top) + Y(bot)) / 2 + 4) + '" text-anchor="end">' + g[0] + '</text>';
    });
    if (points.length) {
      var last = points[points.length - 1];
      if (points.length > 1) {
        s += '<path class="ld-range" d="M' + points.map(function (p) { return X(p.d) + ' ' + Y(p.high); }).join('L') + 'L' +
          points.slice().reverse().map(function (p) { return X(p.d) + ' ' + Y(p.low); }).join('L') + 'Z"/>';
        s += '<path class="ld-line" pathLength="1" d="M' + points.map(function (p) { return X(p.d) + ' ' + Y(p.pct); }).join('L') + '"/>';
      } else {
        s += '<line class="ld-range-one" x1="' + X(last.d) + '" x2="' + X(last.d) + '" y1="' + Y(last.high) + '" y2="' + Y(last.low) + '"/>' +
          '<circle class="ld-dot" cx="' + X(last.d) + '" cy="' + Y(last.pct) + '" r="5"/>';
      }
      s += '<text class="ld-end" x="' + (+X(last.d) + 8) + '" y="' + (+Y(last.pct) + 5) + '">' + last.pct + '%</text>';
      // Dates on one step: the first day, the middle of the span (when it's even) and the last day.
      var picks = span ? [first, points[points.length - 1].d] : [first];
      if (span >= 6 && span % 2 === 0) picks.splice(1, 0, addDays(first, span / 2));
      picks.forEach(function (d, k) {
        var anchor = picks.length > 1 && k === 0 ? 'start' : picks.length > 1 && k === picks.length - 1 ? 'end' : 'middle';
        s += '<text class="ld-x" x="' + X(d) + '" y="' + (h - 6) + '" text-anchor="' + anchor + '">' + short(d) + '</text>';
      });
    }
    return s + '</svg>';
  }
  // Questions answered on each of the last 14 days: square columns, today in ink.
  function daysSvg(counts, w, h) {
    var L = 22, R = 4, T = 8, B = 22, pw = w - L - R, ph = h - T - B, max = Math.max.apply(null, counts), top = max <= 4 ? 4 : Math.ceil(max / 5) * 5;
    var gap = 4, bw = (pw - gap * (counts.length - 1)) / counts.length;
    var s = '<svg xmlns="' + NS + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Questions answered on each of the last 14 days: ' + counts.join(', ') + '">';
    [0, top / 2, top].forEach(function (v) {
      var y = f1(T + ph * (1 - v / top));
      s += '<line class="' + (v ? 'dy-grid' : 'dy-base') + '" x1="' + L + '" x2="' + (L + pw) + '" y1="' + y + '" y2="' + y + '"/><text class="dy-y" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '</text>';
    });
    counts.forEach(function (c, i) {
      if (!c) return;
      var bh = ph * c / top, x = f1(L + i * (bw + gap));
      s += '<rect class="dy-bar' + (i === counts.length - 1 ? ' is-today' : '') + '" style="--i:' + i + '" x="' + x + '" y="' + f1(T + ph - bh) + '" width="' + f1(bw) + '" height="' + f1(bh) + '"><title>' + c + (c === 1 ? ' question' : ' questions') + '</title></rect>';
    });
    [[1, 'start'], [7, 'middle'], [13, 'end']].forEach(function (p) {
      var x = p[1] === 'end' ? L + pw : p[1] === 'start' ? L + p[0] * (bw + gap) : L + p[0] * (bw + gap) + bw / 2;
      s += '<text class="dy-x" x="' + f1(x) + '" y="' + (h - 5) + '" text-anchor="' + p[1] + '">' + (p[0] === 13 ? 'Today' : short(addDays(today(), p[0] - 13))) + '</text>';
    });
    return s + '</svg>';
  }

  // ---------- the screen ----------
  // api: { chapters, questions(n), real(n), scoreOf(n, q), store(k, v), drills(n) -> [done, total], esc }
  function model(api) {
    var scores = {}, chapters = api.chapters.map(function (c) {
      var qs = api.questions(c.n);
      qs.forEach(function (q) { var s = api.scoreOf(c.n, q); if (s) scores[c.n + '/' + q.id] = s; });
      return { n: c.n, weight: api.real(c.n), total: qs.length, questions: qs };
    });
    var log = readLog(api.store), now = predict(chapters, scores), hist = history(chapters, scores, log), last = hist[hist.length - 1];
    // The line ends on the prediction shown beside it: the saved scores are the truth if the log missed anything.
    if (last && now.pct != null) { last.pct = now.pct; last.low = now.low; last.high = now.high; }
    return { chapters: chapters, scores: scores, log: log, now: now, hist: hist };
  }
  // The one thing to do next: a chapter you haven't tried, else your weakest.
  function finding(api, m) {
    var rows = m.now.rows, name = function (n) { return api.chapters.filter(function (c) { return c.n === n; })[0].short; };
    var untried = rows.filter(function (r) { return !r.tried; });
    var r = m.now.pct == null || untried.length ? (untried[0] || rows[0]) : rows.slice().sort(function (a, b) { return a.seen - b.seen; })[0];
    return { n: r.n, action: 'Answer a question on ' + name(r.n) };
  }
  function render(el, api) {
    var esc = api.esc, m = model(api), now = m.now, target = gradeByName(api.store('bio-target') || ''), f = finding(api, m), weakest = null;
    var tried = now.rows.filter(function (r) { return r.tried; });
    if (tried.length >= 2) weakest = tried.slice().sort(function (a, b) { return a.seen - b.seen; })[0].n;
    var counts = [], log = m.log, streak = 0;
    for (var k = 13; k >= 0; k--) { var d = addDays(today(), -k); counts.push(log.filter(function (e) { return e.d === d; }).length); }
    for (var j = 0; ; j++) { var dd = addDays(today(), -j); if (log.some(function (e) { return e.d === dd; })) streak += 1; else if (j) break; }
    var practised = counts.filter(Boolean).length, drillsDone = 0, drillsAll = 0;
    var rowsHtml = api.chapters.map(function (c, i) {
      var r = now.rows[i], dr = api.drills(c.n), seen = r.seen == null ? null : Math.round(r.seen * 100);
      drillsDone += dr[0]; drillsAll += dr[1];
      return '<tr style="--i:' + i + '"><th scope="row"><a href="#ch' + c.n + '" class="pg-ch"><span class="pg-ch__n">' + c.n + '</span>' + esc(c.short) + '</a>' +
          (weakest === c.n ? '<span class="pill pill--neg">Weakest</span>' : '') + '</th>' +
        '<td class="pg-marks' + (seen == null ? ' is-empty' : '') + '">' + (seen == null ? '<span class="dash">–</span>' : '<span class="pg-track"><i style="--w:' + seen + '%"></i></span><span class="num">' + seen + '%</span>') + '</td>' +
        '<td class="num" data-label=" questions">' + r.count + '<span class="of"> of ' + r.total + '</span></td>' +
        '<td class="num" data-label=" drills">' + dr[0] + '<span class="of"> of ' + dr[1] + '</span></td>' +
        '<td class="num">' + (seen == null ? '<span class="dash">–</span>' : gradeOf(seen).name) + '</td></tr>';
    }).join('');
    var opts = '<option value="">None</option>' + GRADES.map(function (g) { return '<option value="' + g[0] + '"' + (target && target.name === g[0] ? ' selected' : '') + '>' + g[0] + ' (' + g[1] + '%+)</option>'; }).join('');
    el.innerHTML = '<div class="pg">' +
      '<div class="cv-title rise" style="--i:0"><h1 class="cv-h1">Progress</h1>' +
        '<button type="button" class="btn-primary" data-pg-next="' + f.n + '">' + esc(f.action) + '</button></div>' +
      '<div class="pg-grid">' +
        (now.pct == null ? '' : '<section class="card pg-grade rise" style="--i:1" aria-labelledby="pg-h-grade"><h2 class="card-h" id="pg-h-grade">Predicted grade</h2>' +
          '<p class="pg-big"><b>' + now.grade.name + '</b><span class="pg-pct"><span class="num" data-pg-count="' + now.pct + '">' + now.pct + '</span>%</span></p>' +
          '<p class="pg-line">' + now.grade.points + ' CAO points · likely ' + (now.lowGrade.name === now.highGrade.name ? now.grade.name : now.lowGrade.name + ' to ' + now.highGrade.name) + '</p>' +
          '<div class="pg-target"><label for="pg-target">Your target</label><select id="pg-target" class="control" data-pg-target>' + opts + '</select></div></section>') +
        '<section class="card pg-trend rise' + (now.pct == null ? ' pg-trend--wide' : '') + '" style="--i:2" aria-labelledby="pg-h-trend"><header class="card-head"><h2 class="card-h" id="pg-h-trend">Prediction over time</h2>' +
          (m.hist.length ? '<ul class="legend"><li><i class="lg-line"></i>Predicted</li>' + (m.hist.length > 1 ? '<li><i class="lg-range"></i>Likely range</li>' : '') +
            (target ? '<li><i class="lg-target"></i>Target ' + target.name + '</li>' : '') + '</ul>' : '') + '</header>' +
          '<div class="pg-ladder" data-pg-ladder></div>' +
          '</section>' +
        '<section class="card pg-chapters rise" style="--i:3" aria-labelledby="pg-h-ch"><header class="card-head"><h2 class="card-h" id="pg-h-ch">Chapters</h2></header>' +
          '<table class="pg-table"><thead><tr><th scope="col">Chapter</th><th scope="col">Your marks</th><th scope="col" class="num">Questions</th><th scope="col" class="num">Drills</th><th scope="col" class="num">Grade</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></section>' +
        '<section class="card pg-days rise" style="--i:4" aria-labelledby="pg-h-days"><header class="card-head"><h2 class="card-h" id="pg-h-days">Questions answered, last 14 days</h2></header>' +
          '<div class="pg-daychart" data-pg-days></div>' +
          '<dl class="pg-stats"><div><dt>Days practised</dt><dd><span class="num">' + practised + '</span><span class="of"> of 14</span></dd></div>' +
            '<div><dt>Streak</dt><dd><span class="num">' + streak + '</span><span class="of">' + (streak === 1 ? ' day' : ' days') + '</span></dd></div>' +
            '<div><dt>Drills tried</dt><dd><span class="num">' + drillsDone + '</span><span class="of"> of ' + drillsAll + '</span></dd></div></dl></section>' +
      '</div></div>';
    drawCharts(el, m, target, counts);
    animateIn(el);
  }
  function drawCharts(el, m, target, counts) {
    var lad = el.querySelector('[data-pg-ladder]'), days = el.querySelector('[data-pg-days]');
    if (lad) lad.innerHTML = ladderSvg(m.hist, target, Math.max(260, lad.clientWidth), lad.clientWidth < 420 ? 190 : 210);
    if (days) {
      days.innerHTML = '';
      days.innerHTML = daysSvg(counts, Math.max(200, days.clientWidth), Math.max(132, Math.min(240, days.clientHeight)));
    }
  }
  // Numbers count up, bars grow and the line draws itself; with reduced motion they're simply there.
  function animateIn(el) {
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.classList.toggle('is-calm', calm);
    if (calm) return;
    el.querySelectorAll('[data-pg-count]').forEach(function (n) {
      var to = +n.getAttribute('data-pg-count');
      if (isNaN(to)) return;
      var t0 = null;
      (function step(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        n.textContent = Math.round(to * e);
        if (k < 1 && n.isConnected) requestAnimationFrame(step);
      })(performance.now());
    });
  }
  window.BioProgress = { predict: predict, history: history, gradeOf: gradeOf, readLog: readLog, model: model, render: render, redraw: function (el, api) {
    var lad = el.querySelector('[data-pg-ladder]');
    if (!lad) return;
    var m = model(api), counts = [];
    for (var k = 13; k >= 0; k--) { var d = addDays(today(), -k); counts.push(m.log.filter(function (e) { return e.d === d; }).length); }
    el.classList.add('is-settled');
    drawCharts(el, m, gradeByName(api.store('bio-target') || ''), counts);
  }, today: today };
})();

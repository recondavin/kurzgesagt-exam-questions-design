// Marks what a student types for a Computer Science exam part, the way its marking scheme does
// (tools/cs/BRIEF.md "Answers"): window.CsMark.check(answer, input) -> {ok, got, max, points, note}.
//   text    one exact answer (binary, hex, a word): spaces and case don't matter; `accept` lists other forms
//   number  a value within `tol` (units and commas ignored)
//   choice  the option picked (input is its index)
//   keys    an explanation marked by the scheme's points: a point is earned when the answer has every word group of
//           one of its `alts` ("a|b" = either; words match at the start of the student's words, so "process" takes
//           "processes" and "processing"); full marks at `need` points
//   fields  one answer per printed prompt ("Data in RAM:"); input is an array, one per field
//   table   the blank cells of a table; input is an array, one per blank, in order
// `max` is the part's marks when given (check(answer, input, marks)), else the points' or fields' count.
(function () {
  'use strict';
  function low(s) { return String(s == null ? '' : s).toLowerCase(); }
  function squash(s) { return low(s).replace(/[\s_]+/g, '').replace(/^0x|h$/i, ''); }
  // Words of an answer: letters and digits, with simple word endings kept on (the match is by start of word).
  function words(s) {
    return low(s).replace(/[’']/g, '').replace(/[^a-z0-9.+\-/]+/g, ' ').replace(/(^|\s)[.\-]+|[.\-]+(\s|$)/g, ' ').trim().split(/\s+/).filter(Boolean);
  }
  // One of the scheme's words matches a student's word when the student's word starts with it (at least three
  // letters of it, or the whole of a shorter word), or the scheme's word starts with a long enough student word.
  function wordHit(sw, tw) {
    if (sw === tw) return true;
    if (sw.length >= 3 && tw.indexOf(sw) === 0) return true;
    if (tw.length >= 5 && sw.indexOf(tw) === 0) return true;
    return false;
  }
  function phraseIn(phrase, toks) {
    var p = words(phrase);
    if (!p.length) return false;
    for (var i = 0; i + p.length <= toks.length; i++) {
      var ok = true;
      for (var j = 0; j < p.length; j++) if (!wordHit(p[j], toks[i + j])) { ok = false; break; }
      if (ok) return true;
    }
    return false;
  }
  function groupIn(group, toks) { return String(group).split('|').some(function (alt) { return phraseIn(alt, toks); }); }
  function altIn(alt, toks) { return (Array.isArray(alt) ? alt : [alt]).every(function (g) { return groupIn(g, toks); }); }

  function keys(a, input, marks) {
    var toks = words(input), pts = a.points || [];
    var hits = pts.map(function (p) { return (p.alts || []).some(function (alt) { return altIn(alt, toks); }); });
    var need = a.need || pts.length, earned = pts.map(function (p, i) { return hits[i] ? (p.marks || 1) : 0; }).sort(function (x, y) { return y - x; });
    var per = pts.length ? pts.map(function (p) { return p.marks || 1; }).sort(function (x, y) { return y - x; }) : [];
    // Marks for the best `need` points earned, scaled to the part's marks when they're given.
    var full = per.slice(0, need).reduce(function (s, v) { return s + v; }, 0) || need, max = marks || full;
    var got = Math.round(max * Math.min(1, earned.slice(0, need).reduce(function (s, v) { return s + v; }, 0) / full) * 10) / 10;
    var n = hits.filter(Boolean).length;
    return { ok: n >= need, got: got, max: max, points: hits, note: n >= need ? '' : 'The scheme wants ' + need + ' point' + (need > 1 ? 's' : '') + '; you made ' + n + '.' };
  }
  function exact(a, input) {
    var v = squash(input), all = [a.value].concat(a.accept || []).map(squash);
    return all.indexOf(v) >= 0;
  }
  function number(a, input) {
    var s = String(input == null ? '' : input).replace(/,(?=\d{3})/g, '').replace(/[^\d.\-eE]+/g, ' ').trim().split(/\s+/)[0];
    var x = parseFloat(s);
    return isFinite(x) && Math.abs(x - a.value) <= (a.tol == null ? 1e-9 : a.tol) + 1e-9;
  }
  function one(a, input, marks) {
    var t = a.type, m = marks || 1;
    if (t === 'keys') return keys(a, input, marks);
    if (t === 'text') { var ok = exact(a, input); return { ok: ok, got: ok ? m : 0, max: m }; }
    if (t === 'number') { var ok2 = number(a, input); return { ok: ok2, got: ok2 ? m : 0, max: m }; }
    if (t === 'choice') { var ok3 = +input === a.value; return { ok: ok3, got: ok3 ? m : 0, max: m }; }
    if (t === 'fields') {
      var fs = a.fields || [], each = marks ? marks / Math.max(1, fs.length) : null, got = 0, max = 0, res = [];
      fs.forEach(function (f, i) {
        var r = one(f.answer || {}, (input || [])[i], f.marks || each);
        res.push(r); got += r.got || 0; max += r.max || 0;
      });
      return { ok: res.every(function (r) { return r.ok; }), got: Math.round(got * 10) / 10, max: Math.round(max * 10) / 10, fields: res };
    }
    if (t === 'table') {
      var bl = a.blank || [], cells = bl.map(function (rc, i) { return squash((input || [])[i]) === squash(a.rows[rc[0]][rc[1]]); });
      var right = cells.filter(Boolean).length, mm = marks || bl.length;
      return { ok: right === bl.length, got: Math.round(mm * right / Math.max(1, bl.length) * 10) / 10, max: mm, cells: cells };
    }
    return { ok: null, got: 0, max: m };
  }
  function check(answer, input, marks) {
    if (!answer || answer.type === 'none') return { ok: null };
    var blank = Array.isArray(input) ? input.every(function (v) { return !String(v == null ? '' : v).trim(); }) : !String(input == null ? '' : input).trim();
    if (blank && answer.type !== 'choice') return { error: 'Type your answer first.' };
    return one(answer, input, marks);
  }
  window.CsMark = { check: check, words: words, altIn: altIn };
  if (typeof module !== 'undefined') module.exports = window.CsMark;
})();

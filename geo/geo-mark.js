// Geography: the marker. Reads a student's essay sentence by sentence and says, for each sentence, which SRP (if any)
// it earns, which "named/identified" marks it earns, and why a sentence earns nothing (vague, a repeat, not what the
// question asks, too short). Used by the writing desk as you type, by the games, and by the tests (node).
//
// The matching is the practice host's (answer-mode.js), so a point is written the same way everywhere on the site:
// a point lists word groups, and a sentence earns it when it hits EVERY group. A stem matches any word that starts
// with it (small typos allowed for stems of six letters or more); a stem of three letters or fewer, or one starting
// with "=", must be the whole word; a stem with a space in it is a phrase.
//
// Data (geo/data/*.js) fills window.GEO: { topics: [...], srp: {id: srp}, essay: {id: essay} } (see geo/README in
// PROJECT_STATE.md, "Geography").
(function (root) {
  'use strict';
  var MIN_WORDS = 5;

  function lev(a, b) {
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > 1) return 2;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // British and American spellings, and the words students use for the same thing, read as one.
  var SAME = [[/ vulcanicity /g, ' volcanic activity '], [/ isostacy /g, ' isostasy '], [/ (celsius|centigrade) /g, ' degrees '],
    [/ (\d+) c /g, ' $1 degrees '], [/ km2 /g, ' km ']];
  function normalise(text, rules) {
    var t = ' ' + String(text || '').toLowerCase()
      .replace(/°\s*c\b/g, ' degrees ').replace(/%/g, ' percent ')
      .replace(/\b(can)['’]?t\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
      .replace(/\b(has|have|had|is|are|was|were|does|do|did|could|would|should)n['’]?t\b/g, '$1 not')
      .replace(/\bwon['’]?t\b/g, 'will not')
      .replace(/[‘’']/g, ' ').replace(/[^a-z0-9]+/g, ' ') + ' ';
    SAME.forEach(function (r) { t = t.replace(r[0], r[1]); });
    (rules || []).forEach(function (r) { t = t.replace(r[0], r[1]); });
    return t.replace(/\s+/g, ' ');
  }
  function stemHit(stem, norm, tokens) {
    if (stem.indexOf(' ') >= 0) return norm.indexOf(' ' + stem) >= 0;
    if (stem.charAt(0) === '=') { stem = stem.slice(1); return tokens.some(function (t) { return t === stem || t === stem + 's' || t === stem + 'es'; }); }
    if (stem.length <= 3) return tokens.some(function (t) { return t === stem || t === stem + 's' || t === stem + 'es'; });
    return tokens.some(function (t) {
      if (t.indexOf(stem) === 0) return true;
      // a slip of one letter, only in a long word and never in its first two letters ("corrie" is not "carried")
      if (stem.length < 7 || t.length < stem.length - 1 || t[0] !== stem[0] || t[1] !== stem[1]) return false;
      for (var L = stem.length - 1; L <= stem.length + 1; L++) if (lev(stem, t.slice(0, L)) <= 1) return true;
      return false;
    });
  }
  function groups(keys, norm, tokens) { return (keys || []).map(function (g) { return g.some(function (s) { return stemHit(s, norm, tokens); }); }); }
  function allHit(keys, norm, tokens) { return !!(keys && keys.length) && groups(keys, norm, tokens).every(Boolean); }
  // An SRP is earned when the sentence hits every group of its keys (k) and none of its cancelling words (n): the
  // words of the wrong fact that would otherwise share its keys ("the Giant's Causeway columns are GRANITE").
  function earns(p, norm, tokens) { return allHit(p.k, norm, tokens) && !(p.n && p.n.some(function (s) { return stemHit(s, norm, tokens); })); }

  // ---------- sentences (the practice host's rules: students skip full stops) ----------
  function wordSet(list) { var o = {}; list.split(' ').forEach(function (w) { o[w] = true; }); return o; }
  var LINKING = wordSet('del de la le van von da di du na northern southern eastern western central north south east west upper lower greater and or but nor the a an of to from by into onto which that because so as such with in on at is are was were be been can could will would may might called when where while than then their its this these those it they for over under during after before through also including like near named beside around between across along off outside inside towards toward via about than against among within without');
  var PROPER = wordSet('i ireland irish burren clare co county kerry cork munster leinster ulster connacht antrim giants causeway mourne mournes leinster wicklow donegal mayo galway kerry dingle killarney macgillycuddys reeks carrauntoohil shannon liffey boyne bann barrow suir slaney nore moy corrib erne atlantic pacific iceland india indian british britain england english europe european african africa asia american america japan japanese italy italian etna vesuvius hawaii hawaiian andes alps himalayas rockies san andreas california chile mexico nepal turkey haiti indonesia philippines new zealand mount mt st kobe tohoku fukushima tokyo ganges bengal delhi mumbai bombay calcutta kolkata bangalore punjab kashmir pakistan bangladesh raj company');
  var VERB_WORDS = wordSet('is are was were be been am has have had can will may might could would do does did lay laid made make makes built ran sank rose fell took gave saw seen got went came kept broke broken forms formed occurs grow grew flow flows cut cuts drop drops');
  var VERB_STEMS = ['becom', 'form', 'compact', 'compress', 'cement', 'carr', 'transport', 'deposit', 'settl', 'build', 'erod', 'weather', 'break', 'turn', 'contain', 'occur', 'caus', 'use', 'record', 'measur', 'detect', 'predict', 'reduc', 'design', 'sway', 'absorb', 'warn', 'send', 'stop', 'prevent', 'practi', 'creat', 'produc', 'mov', 'push', 'pull', 'sink', 'subduct', 'melt', 'cool', 'rise', 'erupt', 'flow', 'fold', 'fault', 'lift', 'uplift', 'expand', 'contract', 'freez', 'thaw', 'dissolv', 'react', 'widen', 'deepen', 'undercut', 'collaps', 'retreat', 'migrat', 'meander', 'trap', 'slow', 'lose', 'gain', 'export', 'import', 'grow', 'destroy', 'introduc', 'rule', 'exploit', 'tax', 'impos', 'leav', 'left', 'suffer', 'benefit', 'provid', 'allow', 'help', 'attract', 'generat', 'heat', 'pump', 'drill', 'extract', 'quarr', 'mine', 'blast', 'crush', 'shap', 'carv', 'scour', 'pluck', 'abrad', 'grind', 'shatter', 'split', 'widen', 'fill', 'leach', 'seep'];
  function hasVerb(words) {
    return words.some(function (w) {
      var t = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!t) return false;
      if (VERB_WORDS[t] || (t.length > 4 && /ed$/.test(t)) || (t.length > 5 && /ing$/.test(t)) || (t.length > 3 && /s$/.test(t) && !/ss$/.test(t) && t.length < 9)) return true;
      return VERB_STEMS.some(function (stem) { return t.indexOf(stem) === 0 && t.length <= stem.length + 4; });
    });
  }
  var STARTERS = wordSet('the this that these those it its they there then when where while as in on at by from because so but also another one a an each many most some such during after before if although however we he she his her their our these');
  function bare(w) { return w.toLowerCase().replace(/'s$/, '').replace(/[^a-z']/g, ''); }
  function capitalBreaks(body) {
    var out = [], re = /(\S+)(\s+)(?=[A-Z])/g, m;
    while ((m = re.exec(body))) {
      var prev = m[1], next = body.slice(m.index + m[0].length).match(/^[A-Za-z']+/);
      if (!next) continue;
      if (/[,;:(\-"“”‘’']$/.test(prev)) continue;
      // an acronym is not a new sentence ("a big IT industry", "the OPW built", "the EU")
      if (/^[A-Z]{2,}s?$/.test(next[0])) continue;
      // nor is a name of two or more capitalised words ("hard Old Red Sandstone", "the Mid Atlantic Ridge"), unless it
      // starts with a word that starts sentences ("The Burren is...", "In Iceland...")
      var after = body.slice(m.index + m[0].length).match(/^[A-Za-z'’-]+\s+([A-Za-z])/);
      if (after && /[A-Z]/.test(after[1]) && !STARTERS[bare(next[0])]) continue;
      var p = bare(prev), n = bare(next[0]);
      if (!p || LINKING[p] || PROPER[n] || n.length < 2 && n !== 'a') continue;
      if (/^[A-Z]/.test(prev)) continue;
      var before = body.slice(out.length ? out[out.length - 1] : 0, m.index + prev.length).trim().split(/\s+/);
      if (before.length < 5 || !hasVerb(before)) continue;
      // a capital near the end is a name, not a new sentence ("...the Wicklow Mountains, including Lugnaquilla.")
      if (body.slice(m.index + m[0].length).trim().split(/\s+/).length < 3) continue;
      out.push(m.index + m[0].length);
    }
    return out;
  }
  function looksFinished(body, followedBySpace) {
    var words = body.trim().split(/\s+/);
    if (words.length < 6 || !followedBySpace) return false;
    if (LINKING[bare(words[words.length - 1])]) return false;
    return hasVerb(words);
  }
  function sentences(text) {
    var out = [];
    var masked = String(text || '').replace(/\b(Co|St|Mt|Mr|Mrs|Dr|approx|etc|e\.g|i\.e|eg|ie|vs|c)\./gi, function (w) { return w.slice(0, -1) + '․'; })
      .replace(/(\d)\.(\d)/g, '$1․$2');
    var re = /[^.!?\n]+[.!?]*/g, m;
    while ((m = re.exec(masked))) {
      var raw = text.slice(m.index, m.index + m[0].length), punct = /[.!?]\s*$/.test(raw);
      var cuts = [0].concat(capitalBreaks(raw), [raw.length]);
      for (var c = 0; c < cuts.length - 1; c++) {
        var piece = raw.slice(cuts[c], cuts[c + 1]), lead = piece.match(/^\s*/)[0].length, body = piece.slice(lead).replace(/\s+$/, '');
        if (!body) continue;
        var start = m.index + cuts[c] + lead, end = start + body.length, last = c === cuts.length - 2;
        var followed = end < text.length && /\s/.test(text.charAt(end));
        var done = !last || punct || m.index + raw.length < text.length;
        out.push({ start: start, end: end, text: body, complete: done || looksFinished(body, followed), open: last && !punct && m.index + raw.length >= text.length, words: body.split(/\s+/).filter(Boolean).length });
      }
    }
    return out;
  }

  // ---------- the data ----------
  function G() { return root.GEO || { topics: [], srp: {}, essay: {} }; }
  // Fill the look-ups once every topic file has been read: srp by id, essay by id, and for each SRP the essays it
  // can earn in (the "one SRP, many essays" games read this).
  function index() {
    var g = G();
    g.srp = {}; g.essay = {}; g.topic = {};
    g.topics.forEach(function (t) {
      g.topic[t.id] = t;
      (t.srps || []).forEach(function (s) { s.topic = t.id; g.srp[s.id] = s; s.essays = []; });
    });
    g.topics.forEach(function (t) {
      (t.essays || []).forEach(function (e) { e.topic = t.id; g.essay[e.id] = e; });
    });
    Object.keys(g.essay).forEach(function (id) {
      var e = g.essay[id];
      essaySrps(e).forEach(function (sid) { var s = g.srp[sid]; if (s && s.essays.indexOf(id) < 0) s.essays.push(id); });
    });
    return g;
  }
  // Every SRP an essay can award, over all its parts and options.
  function essaySrps(e) {
    var out = [];
    (e.parts || []).forEach(function (p) {
      (p.srps || []).forEach(function (s) { if (out.indexOf(s) < 0) out.push(s); });
      (p.opts || []).forEach(function (o) { (o.srps || []).forEach(function (s) { if (out.indexOf(s) < 0) out.push(s); }); });
    });
    return out;
  }
  // The SRPs that count for this essay given the options picked (pick: {partId: optId}).
  function liveParts(e, pick) {
    pick = pick || {};
    return (e.parts || []).map(function (p) {
      if (!p.opts) return { part: p, srps: p.srps || [], opt: null };
      var o = p.opts.filter(function (x) { return x.id === pick[p.id]; })[0] || p.opts[0];
      return { part: p, srps: (p.srps || []).concat(o.srps || []), opt: o };
    });
  }

  // ---------- marking an essay ----------
  // Returns { sentences: [...], marks, max, srps, need, heads: [{label, marks, got}], parts: [{name, got, max}], notes }
  // Each sentence: { text, start, end, complete, open, srp: srp|null, heads: [labels], note: null|'short'|'vague'|
  //   'repeat'|'cap' (an example over the scheme's limit)|'full' (its part has all its SRPs)|'off'|'other', near: srp|null, other: srp|null }.
  function mark(e, text, pick, opts) {
    opts = opts || {};
    var g = G(), t = g.topic[e.topic] || {}, rules = t.normalise || [];
    // an SRP can belong to more than one part (both landforms use abrasion): it counts for the first with room
    var live = liveParts(e, pick), allowed = {}, partOf = {};
    live.forEach(function (lp, i) { lp.srps.forEach(function (s) { allowed[s] = true; (partOf[s] = partOf[s] || []).push(i); }); });
    // SRPs of the essay's other options (another landform than the one picked) and of other topics: a sentence that
    // makes one of those makes a real point, just not one this question asks for.
    var others = [];
    essaySrps(e).forEach(function (s) { if (!allowed[s] && g.srp[s]) others.push(g.srp[s]); });
    Object.keys(g.srp).forEach(function (s) { if (!allowed[s] && others.indexOf(g.srp[s]) < 0) others.push(g.srp[s]); });
    // The "named / identified" marks. A head is earned by a sentence that hits its keys: its own (k), the picked
    // option's name (pick), or any one of a list of things (any: [{n, k}]) not already named for another head of the
    // same group (grp): "Positive impacts identified 2m + 2m" is two heads in one group, so naming geothermal energy
    // twice earns one of them.
    var heads = (e.head || []).map(function (h) {
      var k = h.k;
      if (h.pick != null) { var lp = live.filter(function (x) { return x.part.id === h.pick; })[0]; k = lp && lp.opt ? lp.opt.k : k; }
      return { label: h.label, marks: h.marks || 2, k: k, any: h.any || null, grp: h.grp || null, got: false, at: -1, item: null };
    });
    var named = {};   // grp -> items already named
    function headHit(h, norm, tok) {
      if (!h.any) return h.k && allHit(h.k, norm, tok);
      var taken = named[h.grp] || [];
      for (var i = 0; i < h.any.length; i++) if (taken.indexOf(h.any[i].n) < 0 && allHit(h.any[i].k, norm, tok)) { h.item = h.any[i].n; return true; }
      return false;
    }
    var used = {}, exUsed = 0, exCap = e.caps && e.caps.ex != null ? e.caps.ex : 99;
    var partGot = live.map(function () { return 0; }), partMax = live.map(function (lp) { return lp.part.max != null ? lp.part.max : 99; });
    var ss = sentences(text);
    ss.forEach(function (s, si) {
      var norm = normalise(s.text, rules), tok = norm.trim().split(' ');
      s.srp = null; s.heads = []; s.note = null; s.near = null; s.other = null;
      var counts = s.words >= MIN_WORDS && (s.complete || (opts.open && s.open));
      if (!s.complete && !(opts.open && s.open)) return;
      heads.forEach(function (h) {
        if (h.got || !headHit(h, norm, tok)) return;
        h.got = true; h.at = si; s.heads.push(h.label);
        if (h.grp && h.item) (named[h.grp] = named[h.grp] || []).push(h.item);
      });
      if (!counts) { if (!s.heads.length) s.note = 'short'; return; }
      // the essay's own SRPs, in the order of the plan: the most specific one this sentence makes that is not banked yet
      var cand = [];
      live.forEach(function (lp, pi) { lp.srps.forEach(function (sid) { var p = g.srp[sid]; if (p && cand.indexOf(p) < 0) cand.push(p); }); });
      var hit = null, repeat = null, capped = null, full = null, hitPart = -1;
      for (var i = 0; i < cand.length; i++) {
        var p = cand[i];
        if (!earns(p, norm, tok)) continue;
        if (used[p.id] != null) { repeat = repeat || p; continue; }
        var pi2 = partOf[p.id].filter(function (k) { return partGot[k] < partMax[k]; })[0];
        if (p.x && exUsed >= exCap) { capped = capped || p; continue; }
        if (pi2 == null) { full = full || p; continue; }
        // of the points the sentence makes, the most specific (the one with the most word groups) wins, then plan order:
        // "In Iceland geothermal water heats 90 per cent of homes" is the Iceland point, not just "geothermal is heat"
        if (!hit || p.k.length > hit.k.length) { hit = p; hitPart = pi2; }
      }
      if (hit) {
        used[hit.id] = si; s.srp = hit; if (hit.x) exUsed++; partGot[hitPart]++;
        return;
      }
      if (repeat) { s.note = 'repeat'; s.near = repeat; return; }
      // a real point the scheme no longer credits: one example too many, or a half that has all its marks
      if (capped) { s.note = 'cap'; s.near = capped; return; }
      if (full) { s.note = 'full'; s.near = full; return; }
      // a real point, but for another option of this question or another topic
      for (var j = 0; j < others.length; j++) if (earns(others[j], norm, tok)) { s.note = 'off'; s.other = others[j]; return; }
      if (s.heads.length) return;   // it named what the question asks to name: that is its job
      // nearly a point: its first group of words is there, the rest is not (it says what, not how or why)
      var near = cand.filter(function (p) { return used[p.id] == null && p.k.length > 1 && groups(p.k, norm, tok)[0]; })[0];
      s.note = near ? 'vague' : 'other'; s.near = near || null;
    });
    var nSrp = Math.min(e.need, partGot.reduce(function (a, b, i) { return a + Math.min(b, partMax[i]); }, 0));
    var headMarks = heads.reduce(function (a, h) { return a + (h.got ? h.marks : 0); }, 0);
    // The scheme's "only one side" caps: an essay of two halves that only answers one of them gets at most its max.
    return {
      sentences: ss, marks: headMarks + 2 * nSrp, max: heads.reduce(function (a, h) { return a + h.marks; }, 0) + 2 * e.need,
      srps: nSrp, need: e.need, heads: heads.map(function (h) { return { label: h.label, marks: h.marks, got: h.got, item: h.item }; }),
      parts: live.map(function (lp, i) { return { id: lp.part.id, name: lp.part.name, got: Math.min(partGot[i], partMax[i]), max: partMax[i] === 99 ? null : partMax[i], opt: lp.opt ? lp.opt.name : null }; }),
      used: used
    };
  }
  // The next SRP to write, for a clue: the first in the plan (part order, then the SRP's place in it) not yet earned.
  function nextSrp(e, result, pick) {
    var g = G(), live = liveParts(e, pick);
    for (var i = 0; i < live.length; i++) {
      var lp = live[i], full = result.parts[i] && result.parts[i].max != null && result.parts[i].got >= result.parts[i].max;
      if (full) continue;
      for (var j = 0; j < lp.srps.length; j++) if (result.used[lp.srps[j]] == null && g.srp[lp.srps[j]]) return g.srp[lp.srps[j]];
    }
    return null;
  }
  // One sentence on its own: which SRP of a set it makes (the games).
  function which(text, ids, rules) {
    var g = G(), norm = normalise(text, rules), tok = norm.trim().split(' ');
    for (var i = 0; i < ids.length; i++) { var p = g.srp[ids[i]]; if (p && earns(p, norm, tok)) return p; }
    return null;
  }
  function hits(text, srp, rules) { var norm = normalise(text, rules), tok = norm.trim().split(' '); return earns(srp, norm, tok); }
  // Typed from memory: most of the model's words, in order (one-letter slips allowed).
  function typedLike(typed, model) {
    var a = normalise(model).trim().split(' ').filter(function (w) { return w.length > 2; }), b = normalise(typed).trim().split(' ');
    if (!a.length) return 1;
    var j = 0, n = 0;
    a.forEach(function (w) {
      for (var k = j; k < b.length; k++) if (b[k] === w || (w.length > 4 && lev(w, b[k]) <= 1)) { n++; j = k + 1; break; }
    });
    return n / a.length;
  }

  var api = { normalise: normalise, stemHit: stemHit, groups: groups, allHit: allHit, earns: earns, sentences: sentences, index: index, essaySrps: essaySrps,
    liveParts: liveParts, mark: mark, nextSrp: nextSrp, which: which, hits: hits, typedLike: typedLike };
  root.GeoMark = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

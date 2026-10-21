// The answer marker. No AI: an answer is right when it matches one of the question's accepted patterns, and it is
// only called a mistake when a rule that is certain finds one (missing lenition after "dhá", "Tá" with a name...).
// Anything else is "unsure": the student sees an answer we're sure of and can say theirs was right. So a right
// answer is never marked wrong; the worst it gets is "I can't check this one".
//
// Patterns are written in the language itself, with fadas:
//   (a|b c)   one of these        [a b]   optional        {slot}   a named sub-pattern (the language's or the question's)
//   {*} one word, {*3} one to three words (any number)
// Matching ignores capitals, fadas, hyphens and full stops; missing fadas only give a spelling tip.
//
// A language (see orals/ga/grammar.js) gives: fold(word), slots, fillers, aliases (words typed without their
// apostrophe), detectors (the certain-mistake rules) and english (common English words, to spot English answers).

export function tokens(text, lang) {
  const out = [];
  const clean = String(text || '').replace(/[’‘`´]/g, "'").replace(/[“”"«»]/g, ' ').replace(/[.,!?;:()…–—]/g, ' $& ');
  for (const raw of clean.split(/\s+/).filter(Boolean)) {
    if (/^[.,!?;:()…–—]$/.test(raw)) { out.push({ raw, low: raw, fold: '', punct: true }); continue; }
    const low = raw.toLowerCase();
    out.push({ raw, low, fold: lang.fold(low) });
  }
  return out;
}

// ---------------------------------------------------------------- patterns
function lex(src) {
  const out = [];
  const re = /\s*(\(|\)|\[|\]|\||\{[^}]+\}|[^\s()[\]|{}]+)/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

function parse(toks) {
  let i = 0;
  function seq(stop) {
    const alts = [[]];
    while (i < toks.length && !stop.includes(toks[i])) {
      const t = toks[i++];
      if (t === '|') alts.push([]);
      else if (t === '(') { const s = seq([')']); i++; alts[alts.length - 1].push({ alt: s }); }
      else if (t === '[') { const s = seq([']']); i++; alts[alts.length - 1].push({ opt: s }); }
      else if (t[0] === '{') alts[alts.length - 1].push({ slot: t.slice(1, -1) });
      else alts[alts.length - 1].push({ word: t });
    }
    return alts;
  }
  return seq([]);
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function compiler(lang, extraSlots) {
  const cache = new Map();
  function slotSrc(name) {
    const any = /^\*(\d*)$/.exec(name);
    if (any) return '(?:[^ ]+ ){1,' + (any[1] || 1) + '}';
    const key = 'slot:' + name;
    if (cache.has(key)) return cache.get(key);
    const def = (extraSlots && extraSlots[name]) || lang.slots[name];
    if (def === undefined) throw new Error('Unknown slot {' + name + '}');
    if (def.re) { cache.set(key, '(?:' + def.re + ')'); return cache.get(key); }
    cache.set(key, '(?:)'); // guards against a slot that refers to itself
    const src = '(?:' + [].concat(def).map(p => source(p)).join('|') + ')';
    cache.set(key, src);
    return src;
  }
  function node(n) {
    if (n.word) return esc(lang.fold(n.word.toLowerCase().replace(/[’‘]/g, "'"))) + ' ';
    if (n.slot) return slotSrc(n.slot);
    if (n.alt) return '(?:' + n.alt.map(a => a.map(node).join('')).join('|') + ')';
    if (n.opt) return '(?:' + n.opt.map(a => a.map(node).join('')).join('|') + ')?';
    return '';
  }
  function source(p) {
    if (cache.has(p)) return cache.get(p);
    const src = parse(lex(p)).map(a => a.map(node).join('')).join('|');
    const wrapped = '(?:' + src + ')';
    cache.set(p, wrapped);
    return wrapped;
  }
  return {
    source,
    whole(p) { return new RegExp('^' + source(p) + '$'); },
  };
}

// Every word a set of patterns uses, with its fadas, keyed by its folded form (for spelling tips and joining).
function wordsOf(patterns, lang, into) {
  for (const p of patterns) for (const t of lex(p)) {
    if (/^[()[\]|]$/.test(t) || t[0] === '{') continue;
    const low = t.toLowerCase(), f = lang.fold(low);
    if (!into.has(f)) into.set(f, new Set());
    into.get(f).add(low);
  }
  return into;
}

// ---------------------------------------------------------------- the marker
export function createMarker(lang, questions) {
  const comp = compiler(lang, null);
  const lexicon = new Map();
  const plain = list => list.flat().map(p => (typeof p === 'string' ? p : p.p || '')).filter(Boolean);
  const slotPatterns = plain(Object.values(lang.slots));
  wordsOf(slotPatterns, lang, lexicon);
  const qs = {};
  for (const q of questions) {
    const c = q.slots ? compiler(lang, q.slots) : comp;
    if (q.slots) wordsOf(plain(Object.values(q.slots)), lang, lexicon);
    wordsOf(plain(q.accept), lang, lexicon);
    // An accepted pattern can carry a tip: { p: pattern, tip: 'Fine, but in the exam...' }.
    qs[q.id] = {
      q,
      accept: q.accept.map(a => c.whole(typeof a === 'string' ? a : a.p)),
      notes: q.accept.map(a => (typeof a === 'string' ? null : a.tip)),
      mistakes: (q.mistakes || []).map(m => ({ ...m, re: c.whole(m.when) })),
    };
  }
  const fillers = (lang.fillers || []).map(p => comp.source(p));
  const lead = fillers.length ? '(?:(?:' + fillers.join('|') + '))*' : '';

  // Joins words typed apart that belong together ("d' aois", "an chineálta" for "an-chineálta"),
  // and restores missing apostrophes ("daois"). Each fix is noted as a spelling tip.
  function tidy(toks, tips) {
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], n = toks[i + 1];
      if (n && !t.punct && !n.punct) {
        const joined = lexicon.get(t.fold + n.fold);
        const form = joined && [...joined].find(w => w.includes('-') || w.includes("'"));
        if (form) {
          tips.push({ kind: 'join', word: form });
          out.push({ raw: form, low: form, fold: t.fold + n.fold });
          i++;
          continue;
        }
      }
      const alias = !t.punct && lang.aliases && lang.aliases[t.fold];
      if (alias && t.low !== alias) {
        tips.push({ kind: 'apostrophe', word: alias });
        out.push({ raw: alias, low: alias, fold: lang.fold(alias) });
        continue;
      }
      out.push(t);
    }
    return out;
  }

  // Sentences, as runs of words between full stops, question marks and exclamation marks.
  function sentences(toks) {
    const out = [[]];
    for (const t of toks) {
      if (t.punct && /[.!?]/.test(t.raw)) { if (out[out.length - 1].length) out.push([]); }
      else if (!t.punct) out[out.length - 1].push(t);
    }
    return out.filter(s => s.length);
  }
  const joinFold = s => s.map(t => t.fold).join(' ') + ' ';

  function matches(entry, sents) {
    for (const s of sents) {
      const f = joinFold(s);
      for (let i = 0; i < entry.accept.length; i++) {
        const re = entry.accept[i];
        if (re.test(f)) return { sentence: s, index: i };
        if (lead) {
          const m = new RegExp('^' + lead).exec(f);
          if (m && m[0] && re.test(f.slice(m[0].length))) return { sentence: s, index: i };
        }
      }
    }
    return null;
  }

  // Missing fadas: a word that we know only with a fada.
  function fadaTips(toks) {
    const tips = [];
    for (const t of toks) {
      if (t.punct) continue;
      const forms = lexicon.get(t.fold);
      if (!forms || forms.has(t.low)) continue;
      const list = [...forms];
      if (list.length === 1 && list[0] !== t.low && lang.fold(list[0]) === t.fold) tips.push({ kind: 'fada', word: list[0], typed: t.raw });
    }
    return tips;
  }

  function mark(qid, text) {
    const entry = qs[qid];
    const raw = tokens(text, lang).filter(t => t.raw);
    const words = raw.filter(t => !t.punct);
    if (!words.length) return { verdict: 'empty' };
    if (words.some(t => /\d/.test(t.raw))) return { verdict: 'digits' };
    const tips = [];
    const toks = tidy(raw, tips);
    const sents = sentences(toks);

    // English? (Most of the words are common English words that aren't Irish.)
    const eng = words.filter(t => lang.english.has(t.fold)).length;
    if (eng >= Math.max(2, words.length * 0.5)) return { verdict: 'english' };

    // Certain mistakes, from the language's rules and this question's own.
    const found = [];
    for (const d of lang.detectors) for (const s of sents) for (const hit of d(s) || []) found.push({ ...hit, sentence: s });
    for (const m of entry.mistakes) for (const s of sents) {
      const f = joinFold(s);
      if (m.re.test(f) || (lead && (() => { const x = new RegExp('^' + lead).exec(f); return x && x[0] && m.re.test(f.slice(x[0].length)); })())) found.push({ why: m.why, fix: m.fix, rule: m.rule || 'question' });
    }
    if (found.length) {
      // Corrects the student's own answer where the rules say exactly what to change. Detectors report
      // positions inside a sentence, which are mapped back to the whole answer.
      const idx = new Map(toks.map((t, i) => [t, i]));
      // Only offer the corrected answer when every mistake found has a correction.
      const fixed = found.every(x => x.tokens) ? applyEdits(toks, found, idx) : null;
      return { verdict: 'mistake', mistakes: dedupe(found), fixed, tips };
    }

    const hit = matches(entry, sents);
    if (hit) return { verdict: 'right', match: hit, note: entry.notes[hit.index] || null, tips: tips.concat(fadaTips(toks)) };

    // Guidance only: unfamiliar or dialect forms must never be called wrong for tense.
    if (entry.q.tense && lang.tenseOf) {
      const tense = lang.tenseOf(sents);
      if (tense && tense !== entry.q.tense) return { verdict: 'tense', tense: entry.q.tense, tips };
    }
    for (const [id, other] of Object.entries(qs)) {
      if (id === qid) continue;
      if ((other.q.topic || 'family') !== (entry.q.topic || 'family')) continue;
      if (matches(other, sents)) return { verdict: 'other', other: id, tips };
    }
    return { verdict: 'unsure', tips };
  }

  // The answer with the rules' corrections, as [{ w, changed }] (punctuation kept on the word before it).
  function applyEdits(toks, found, idx) {
    const words = toks.map(t => ({ w: t.raw, changed: false, punct: t.punct }));
    const edits = [];
    for (const f of found) if (f.sentence && f.tokens) {
      const s0 = idx.get(f.sentence[f.start]), s1 = idx.get(f.sentence[f.end - 1]);
      if (s0 !== undefined && s1 !== undefined) edits.push({ a: s0, b: s1 + 1, tokens: f.tokens });
    }
    edits.sort((x, y) => y.a - x.a);
    let lastA = Infinity;
    for (const e of edits) {
      if (e.b > lastA) continue;
      const before = words.slice(e.a, e.b).map(x => x.w);
      words.splice(e.a, e.b - e.a, ...e.tokens.map((w, k) => ({ w, changed: before[k] !== w })));
      lastA = e.a;
    }
    if (!edits.length) return null;
    const out = [];
    for (const x of words) {
      if (x.punct && out.length) out[out.length - 1].w += x.w;
      else out.push({ w: x.w, changed: x.changed });
    }
    return out;
  }

  function dedupe(list) {
    const seen = new Set(), out = [];
    for (const f of list) { const k = f.why; if (seen.has(k)) continue; seen.add(k); out.push({ why: f.why, fix: f.fix, rule: f.rule, wrong: f.wrong, right: f.right }); }
    return out;
  }

  return { mark, lexicon, questions: qs };
}

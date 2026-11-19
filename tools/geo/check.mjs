// Checks the Geography data (geo/data/*.js, geo/papers.js) against the marker (geo/geo-mark.js).
//   node tools/geo/check.mjs            every topic
//   node tools/geo/check.mjs volcanoes  one topic's file (all files are still loaded: essays may use other topics' SRPs)
// Fails (exit 1) on: a malformed topic, SRP or essay; an SRP whose own model sentence does not earn it, or whose vague
// or wrong version does; an essay whose model answer (its named marks' sentences and then its SRPs' model sentences, in
// plan order) does not reach full marks for EVERY option a student can pick; a past question mapped to an essay that
// does not exist. Warns on: a model sentence another SRP takes first in an essay (it would still be credited, but to the
// wrong point); an essay with fewer than need + 2 SRPs to choose from.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const only = process.argv[2] || '';
const ctx = { window: {}, console };
ctx.globalThis = ctx.window;
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
load('geo/geo-mark.js');
const dataDir = path.join(ROOT, 'geo', 'data');
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort();
const broken = [];
files.forEach((f) => { try { load('geo/data/' + f); } catch (e) { broken.push([f.replace(/\.js$/, ''), e.message]); } });
if (fs.existsSync(path.join(ROOT, 'geo', 'papers.js'))) load('geo/papers.js');
const M = ctx.window.GeoMark;
const G = M.index();
const errors = [], warns = [];
broken.forEach(([t, m]) => { if (!only || t === only) errors.push(t + ': the file does not load: ' + m); });
// Which topic file owns which essay ids (so "node tools/geo/check.mjs plates" reports the plates essays the papers need).
const OWNER = { plates: ['plates-'], quakes: ['quakes-'], volcanoes: ['volc-'], deform: ['deform-'], isostasy: ['isostasy', 'fluvial-'],
  rocks: ['rocks-'], landscape: ['landscape-'], rockuse: ['rockuse'], weathering: ['weather-'], karst: ['karst-'], landforms: ['landform-'],
  massmove: ['mass-'], surfacehuman: ['surface-'], india: ['colonial-'] };
const owns = (t, id) => (OWNER[t] || []).some((p) => id.indexOf(p) === 0);
const err = (t, m) => { if (!only || t === only) errors.push((t ? t + ': ' : '') + m); };
const warn = (t, m) => { if (!only || t === only) warns.push((t ? t + ': ' : '') + m); };
const isKeys = (k) => Array.isArray(k) && k.length > 0 && k.every((g) => Array.isArray(g) && g.length > 0 && g.every((s) => typeof s === 'string' && s.trim() === s && s.length > 0 && s === s.toLowerCase()));

// ---------- shape ----------
const seen = {};
G.topics.forEach((t) => {
  if (!t.id || !t.name || !t.unit) err(t.id, 'topic needs id, name and unit');
  (t.srps || []).forEach((s) => {
    if (seen[s.id]) err(t.id, 'SRP id used twice: ' + s.id); seen[s.id] = 1;
    if (!s.id || s.id.indexOf(t.id + '.') !== 0) err(t.id, 'SRP id must start "' + t.id + '.": ' + s.id);
    if (typeof s.t !== 'string' || s.t.split(/\s+/).length < 6) err(t.id, s.id + ': t (the model SRP) must be a sentence of 6+ words');
    if (!/[.!?]$/.test(s.t || '')) err(t.id, s.id + ': t must end with a full stop');
    if (!isKeys(s.k)) err(t.id, s.id + ': k must be a list of word groups (lower-case stems)');
    if (!Array.isArray(s.c) || s.c.length < 2) err(t.id, s.id + ': c needs two clues');
    if (typeof s.v !== 'string' || typeof s.w !== 'string' || typeof s.why !== 'string') err(t.id, s.id + ': needs v (vague), w (wrong) and why');
    if (!s.a) err(t.id, s.id + ': needs a (a short name for the point, 2-6 words)');
  });
  (t.essays || []).forEach((e) => {
    if (!e.id || !e.name || !e.ask || !Array.isArray(e.parts) || !e.need) err(t.id, 'essay needs id, name, ask, parts, need: ' + e.id);
    (e.head || []).forEach((h) => { if (!h.label || (!h.k && !h.any && h.pick == null) || (!h.say && h.pick == null)) err(t.id, e.id + ': each head needs label, k (or any, or pick) and say'); if (h.k && !isKeys(h.k)) err(t.id, e.id + ': head keys malformed'); (h.any || []).forEach((x) => { if (!x.n || !isKeys(x.k)) err(t.id, e.id + ': head any-item needs n and k'); }); });
    (e.parts || []).forEach((p) => {
      if (!p.id || !p.name) err(t.id, e.id + ': part needs id and name');
      (p.srps || []).forEach((id) => { if (!G.srp[id]) err(t.id, e.id + '/' + p.id + ': no SRP ' + id); });
      (p.opts || []).forEach((o) => {
        if (!o.id || !o.name || !isKeys(o.k)) err(t.id, e.id + '/' + p.id + ': option needs id, name, k: ' + o.id);
        (o.srps || []).forEach((id) => { if (!G.srp[id]) err(t.id, e.id + '/' + p.id + '/' + o.id + ': no SRP ' + id); });
      });
    });
  });
});

// ---------- each SRP on its own ----------
G.topics.forEach((t) => (t.srps || []).forEach((s) => {
  const rules = t.normalise || [];
  if (!M.hits(s.t, s, rules)) err(t.id, s.id + ': its own model sentence does not earn it: "' + s.t + '"');
  if (s.v && M.hits(s.v, s, rules)) err(t.id, s.id + ': the vague version earns it: "' + s.v + '"');
  if (s.w && M.hits(s.w, s, rules)) err(t.id, s.id + ': the wrong version earns it: "' + s.w + '"');
}));

// ---------- each essay, for every option a student can pick ----------
G.topics.forEach((t) => (t.essays || []).forEach((e) => {
  const optParts = (e.parts || []).filter((p) => p.opts && p.opts.length);
  const picks = [{}];
  // one pick per option of each part; the other parts take the first option nobody else has
  optParts.forEach((p) => p.opts.forEach((o) => {
    const pick = { [p.id]: o.id };
    optParts.forEach((q) => { if (q === p) return; const free = q.opts.find((x) => Object.values(pick).indexOf(x.id) < 0); if (free) pick[q.id] = free.id; });
    picks.push(pick);
  }));
  picks.forEach((pick) => {
    const live = M.liveParts(e, pick);
    const heads = (e.head || []).map((h) => {
      if (h.pick != null) { const lp = live.find((x) => x.part.id === h.pick); return lp && lp.opt ? (lp.opt.say || ('The ' + lp.opt.name.toLowerCase() + ' is the one I studied for this answer.')) : h.say; }
      return h.say;
    });
    const plan = [];
    live.forEach((lp) => {
      let n = 0;
      lp.srps.forEach((id) => { if (!G.srp[id]) return; if (lp.part.max == null || n < lp.part.max) { plan.push(id); n++; } });
    });
    const avail = live.reduce((a, lp) => a + (lp.part.max != null ? Math.min(lp.part.max, lp.srps.length) : lp.srps.length), 0);
    const label = e.id + (Object.keys(pick).length ? ' [' + Object.values(pick).join('+') + ']' : '');
    if (avail < e.need) err(t.id, label + ': only ' + avail + ' SRPs can be earned, the essay needs ' + e.need);
    else if (avail < e.need + 2) warn(t.id, label + ': only ' + avail + ' SRPs to choose from (needs ' + e.need + ')');
    const text = heads.join(' ') + ' ' + plan.map((id) => G.srp[id].t).join(' ');
    const r = M.mark(e, text, pick);
    if (r.marks < r.max) {
      const missing = (e.head || []).filter((h, i) => !r.heads[i].got).map((h) => 'head "' + h.label + '"');
      const got = Object.keys(r.used);
      const lost = plan.filter((id) => got.indexOf(id) < 0).slice(0, 6);
      err(t.id, label + ': the model answer gets ' + r.marks + '/' + r.max + (missing.length ? '; not earned: ' + missing.join(', ') : '') + (lost.length ? '; SRPs not credited: ' + lost.join(', ') : ''));
    }
    r.sentences.forEach((s) => {
      const meant = plan.find((id) => s.text.indexOf(G.srp[id].t.slice(0, -1)) === 0);
      if (meant && s.srp && s.srp.id !== meant) warn(t.id, label + ': "' + G.srp[meant].a + '" (' + meant + ') is credited to ' + s.srp.id);
    });
  });
}));

// ---------- past papers ----------
const P = ctx.window.GEO_PAPERS || [];
P.forEach((q) => (q.ask || []).forEach((a) => {
  if (only && !owns(only, a.essay)) return;
  const e = G.essay[a.essay];
  if (!e) { err(only, 'paper ' + q.year + ' ' + q.id + ' maps to a missing essay: ' + a.essay); return; }
  if (a.opt && !(e.parts || []).some((p) => (p.opts || []).some((o) => o.id === a.opt))) err(only, 'paper ' + q.year + ' ' + q.id + ': essay ' + a.essay + ' has no option "' + a.opt + '"');
}));

const nSrp = G.topics.reduce((a, t) => a + (t.srps || []).length, 0), nEss = G.topics.reduce((a, t) => a + (t.essays || []).length, 0);
console.log(G.topics.length + ' topics, ' + nSrp + ' SRPs, ' + nEss + ' essays, ' + P.length + ' past questions');
warns.slice(0, 40).forEach((w) => console.log('warn  ' + w));
if (warns.length > 40) console.log('... ' + (warns.length - 40) + ' more warnings');
errors.slice(0, 60).forEach((e) => console.log('ERROR ' + e));
if (errors.length > 60) console.log('... ' + (errors.length - 60) + ' more errors');
console.log(errors.length ? errors.length + ' errors' : 'all checks passed' + (warns.length ? ' (' + warns.length + ' warnings)' : ''));
process.exit(errors.length ? 1 : 0);

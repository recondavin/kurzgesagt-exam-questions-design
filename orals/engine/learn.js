// Calendar-day scheduling; level changes map through the named step, not an array index.
export const LEARN_VERSION = 1;
export const STEPS = { OL: ['tiles', 'letters', 'type', 'say', 'wording'], HL: ['tiles', 'type', 'say', 'wording'] };
export const GAPS = [1, 3, 7, 14, 30, 60];
export function dayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function addDays(day, n) {
  const d = new Date(day + 'T12:00:00'); d.setDate(d.getDate() + n); return dayKey(d);
}
export function createLearn(storage = globalThis.localStorage, key = 'oral-ga-learn') {
  let data;
  try { data = JSON.parse(storage.getItem(key)); } catch { /* unavailable or corrupt */ }
  if (!data || data.version !== LEARN_VERSION || !data.questions || !Array.isArray(data.days) || !data.rules) data = { version: LEARN_VERSION, questions: {}, days: [], rules: {} };
  const save = () => { try { storage.setItem(key, JSON.stringify(data)); } catch { /* private mode */ } };
  function step(id, level = 'OL') {
    const name = data.questions[id]?.step || 'tiles';
    return STEPS[level].includes(name) ? name : 'type';
  }
  function played(today = dayKey()) { if (!data.days.includes(today)) { data.days.push(today); save(); } return data.days.length; }
  function record(id, outcome, level = 'OL', today = dayKey()) {
    if (outcome === 'unsure' || outcome === 'mine') return;
    const old = data.questions[id] || { streak: 0 }, steps = STEPS[level], i = steps.indexOf(step(id, level));
    const first = outcome === 'first';
    data.questions[id] = { step: steps[Math.max(0, Math.min(steps.length - 1, i + (first ? 1 : -1)))],
      streak: first ? old.streak + 1 : 0, due: addDays(today, first ? GAPS[Math.min(old.streak, GAPS.length - 1)] : 1) };
    save();
  }
  function plan(questions, level = 'OL', today = dayKey()) {
    const allowed = questions.filter(q => !q.side && (!q.higher || level === 'HL'));
    const due = allowed.filter(q => data.questions[q.id]?.due <= today).sort((a, b) => data.questions[a.id].due.localeCompare(data.questions[b.id].due)).slice(0, 12);
    const fresh = allowed.filter(q => !data.questions[q.id]).slice(0, level === 'OL' ? 4 : 5);
    let chosen = [...due, ...fresh];
    if (!chosen.length) chosen = allowed.slice().sort((a, b) => STEPS[level].indexOf(step(a.id, level)) - STEPS[level].indexOf(step(b.id, level))).slice(0, 4);
    // A follow-up is always adjacent to its parent; pulling the parent in is deliberate.
    const selected = new Map(chosen.map(q => [q.id, q]));
    for (const q of chosen) {
      let parent = q.parent && allowed.find(p => p.id === q.parent);
      while (parent && !selected.has(parent.id)) { selected.set(parent.id, parent); parent = parent.parent && allowed.find(p => p.id === parent.parent); }
    }
    const out = [], ids = new Set();
    function append(q) {
      if (!q || ids.has(q.id)) return;
      if (q.parent && !ids.has(q.parent)) { append(selected.get(q.parent)); if (ids.has(q.id)) return; }
      ids.add(q.id); out.push(q);
      for (const child of selected.values()) if (child.parent === q.id) append(child);
    }
    chosen.forEach(append);
    return out;
  }
  function mistakes(items, groupFor) {
    data.ruleHits ||= {};
    for (const rule of new Set(items.map(m => m.rule).filter(Boolean))) data.ruleHits[rule] = (data.ruleHits[rule] || 0) + 1;
    for (const id of new Set(items.map(m => groupFor(m.rule)).filter(Boolean))) data.rules[id] = (data.rules[id] || 0) + 1;
    save();
  }
  function resetRule(group, groupFor = () => null) {
    data.rules[group] = 0;
    for (const rule of Object.keys(data.ruleHits || {})) if (groupFor(rule) === group) data.ruleHits[rule] = 0;
    save();
  }
  return { get data() { return data; }, step, played, record, plan, mistakes, resetRule };
}

global.window = globalThis; const fs = require('fs'); const R = process.argv[2];
require(R + '/geo/geo-mark.js'); fs.readdirSync(R + '/geo/data').forEach(f => require(R + '/geo/data/' + f));
const M = window.GeoMark, G = M.index(); let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
let runs = 0, fails = [];
G.topics.forEach(t => t.essays.forEach(e => {
  const optParts = (e.parts || []).filter(p => p.opts && p.opts.length), picks = [{}];
  optParts.forEach(p => p.opts.forEach(o => { const pick = { [p.id]: o.id }; optParts.forEach(q => { if (q === p) return; const f = q.opts.find(x => Object.values(pick).indexOf(x.id) < 0); if (f) pick[q.id] = f.id; }); picks.push(pick); }));
  picks.forEach(pick => {
    const live = M.liveParts(e, pick), plan = [];
    live.forEach(lp => { let n = 0; lp.srps.forEach(id => { if (G.srp[id] && (lp.part.max == null || n < lp.part.max)) { plan.push(id); n++; } }); });
    const heads = (e.head || []).map(h => { if (h.pick != null) { const lp = live.find(x => x.part.id === h.pick); return lp && lp.opt ? (lp.opt.say || 'The ' + lp.opt.name.toLowerCase() + ' is the one.') : h.say; } return h.say; });
    for (let k = 0; k < 3; k++) {
      const order = plan.slice().sort(() => rnd() - 0.5);
      const text = heads.join(' ') + ' ' + order.map(id => G.srp[id].t).join(' ');
      const r = M.mark(e, text, pick); runs++;
      if (r.marks < r.max) fails.push(e.id + ' ' + JSON.stringify(pick) + ' ' + r.marks + '/' + r.max);
    }
  });
}));
console.log(runs, 'shuffled model answers;', fails.length, 'short of full marks'); console.log(fails.slice(0, 10).join('\n'));

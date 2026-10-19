require('../js/engine.js'); require('../js/gens1.js'); require('../js/gens2.js'); require('../js/curriculum.js');
const M = globalThis.MQ; let total = 0, bad = 0, dup = 0;
for (let i = 0; i < M.Course.count; i++) {
  const m = M.Course.buildModule(i); const seen = new Set();
  if (m.questions.length !== 30) { console.log('module', i + 1, 'has', m.questions.length); bad++; }
  m.questions.forEach(q => { total++; const k = M.strip(q.prompt) + q.svg; if (seen.has(k)) dup++; seen.add(k); if (q.type !== 'mc' && !M.check(q, q.answer)) { bad++; console.log('selfcheck fail', q.id); } if (/NaN|undefined/.test(q.prompt)) { bad++; console.log('bad text', q.id); } });
}
console.log('questions', total, 'bad', bad, 'dups', dup);
const m = M.Course.buildModule(0); console.log(m.title, m.blocks.map(b => b.name));
M.Course.buildModule(29).questions.slice(0,30).forEach(q=>console.log(q.id, M.strip(q.prompt).slice(0,110)));

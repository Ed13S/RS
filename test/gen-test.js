require('../js/engine.js'); require('../js/gens1.js'); require('../js/gens2.js');
const M = globalThis.MQ; const G = M.G;
let bad = 0, n = 0; const errs = {};
for (const k of Object.keys(G)) for (let L = 1; L <= 9; L += 0.5) for (let s = 1; s <= 120; s++) {
  const r = new M.RNG(s * 7919 + Math.round(L * 10)); let q;
  try { q = G[k](r, L); n++; } catch (e) { const key = k + '@' + L + ': ' + e.message; errs[key] = (errs[key] || 0) + 1; continue; }
  const p = [];
  if (!q || !q.prompt) p.push('noprompt');
  else {
    if (/NaN|undefined|Infinity|\[object/.test(q.prompt + (q.sol || '') + (q.hint || ''))) p.push('badtext');
  }
  if (q && (q.answer === undefined || q.answer === 'NaN' || /NaN|undefined/.test(String(q.answer)))) p.push('badanswer');
  if (q && !q.sol) p.push('nosol'); if (q && !q.hint) p.push('nohint');
  if (q && q.type === 'mc' && (!q.choices || q.choices[+q.answer] === undefined)) p.push('badmc');
  if (q && q.type !== 'mc') { try { const a = q.type === 'num' ? q.answer : q.answer; if (!M.check(q, a)) p.push('selfcheck:' + q.answer); } catch (e) { p.push('checkerr'); } }
  if (p.length) { bad++; const key = k + '@' + L + ' ' + p.join(','); if (!errs[key]) errs[key] = (q && q.prompt || '').slice(0, 100); }
}
console.log('generated', n, 'bad', bad);
Object.entries(errs).slice(0, 60).forEach(e => console.log(e[0], '=>', e[1]));

require('../js/engine.js'); require('../js/gens1.js'); require('../js/gens2.js');
const M = globalThis.MQ; const errs = {}; let n = 0;
const bad = (k, L, s, m) => { const key = k + '|' + m; if (!errs[key]) errs[key] = { c: 0, ex: `L${L} seed${s}` }; errs[key].c++; };
for (const k of Object.keys(M.G)) {
  for (let L = 1; L <= 8.5; L += 0.5) for (let s = 1; s <= 120; s++) {
    n++;
    let q; try { q = M.G[k](new M.RNG(s * 7919 + L * 13), L); } catch (e) { bad(k, L, s, 'THROW ' + e.message); continue; }
    if (!q) { bad(k, L, s, 'no q'); continue; }
    const txt = (q.prompt || '') + ' ' + (q.sol || '') + ' ' + (q.hint || '');
    if (/NaN|undefined|Infinity|\[object/.test(txt)) bad(k, L, s, 'BADTEXT ' + (txt.match(/.{0,30}(NaN|undefined|Infinity|\[object).{0,20}/) || [''])[0]);
    if (!q.sol) bad(k, L, s, 'nosol'); if (!q.hint) bad(k, L, s, 'nohint');
    if (q.type === 'mc') { if (!(+q.answer >= 0 && +q.answer < q.choices.length)) bad(k, L, s, 'mc idx'); else if (!M.check(q, q.answer)) bad(k, L, s, 'mc check'); }
    else if (q.type === 'num') { if (!isFinite(parseFloat(q.answer))) bad(k, L, s, 'num ans ' + q.answer); else if (!M.check(q, q.answer)) bad(k, L, s, 'num self-check'); }
    else if (q.type === 'frac' || q.type === 'coord' || q.type === 'text') { if (!M.check(q, q.answer)) bad(k, L, s, q.type + ' self-check ' + q.answer); }
    else bad(k, L, s, 'type ' + q.type);
    if (q.type === 'num' && Math.abs(parseFloat(q.answer)) > 1e9) bad(k, L, s, 'huge');
  }
}
console.log('ran', n); for (const [k, v] of Object.entries(errs)) console.log(v.c, k, v.ex);

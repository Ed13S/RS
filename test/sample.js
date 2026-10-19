require('./../js/engine.js'); require('./../js/gens1.js'); require('./../js/gens2.js');
const M = globalThis.MQ, G = M.G; const keys = process.argv[2] ? process.argv[2].split(',') : Object.keys(G); const Ls = (process.argv[3]||'2,4,6,8').split(',').map(Number);
for (const k of keys) for (const L of Ls) for (let s = 1; s <= 2; s++) { const q = G[k](new M.RNG(s*131+L*7), L); console.log(`[${k}@${L}] ${M.strip(q.prompt).slice(0,170)} => ${q.type==='mc'?q.choices[q.answer]:q.answer}${q.unit?' '+q.unit:''}`); }

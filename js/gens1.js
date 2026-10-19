/* MathQuest generators, part 1: number topics. Each generator: (rng, level) -> question */
(function (g) {
  'use strict';
  const M = g.MQ, { T, fmt, raw, mon, sup, frac, B, gcd, lcm, rd, NAMES, ITEMS } = M;
  const G = (M.G = M.G || {});
  const num = (prompt, a, o = {}) => Object.assign({ prompt, type: 'num', answer: raw(a) }, o);
  const run = (r, opts) => opts[r.int(0, opts.length - 1)]();
  const eq = s => `<div class="eq">${s}</div>`;
  const fa = (n, d, allowMixed) => { // fraction answer string + flags
    const k = gcd(n, d); n /= k; d /= k;
    if (d === 1) return { answer: String(n), type: 'num' };
    if (allowMixed && n > d) return { answer: `${Math.floor(n / d)} ${n % d}/${d}`, type: 'frac', mixed: true };
    return { answer: `${n}/${d}`, type: 'frac', simplest: true };
  };
  const mix = (n, d) => n > d ? `<span class="mixed">${Math.floor(n / d)}</span>${frac(n % d, d)}` : frac(n, d);

  /* ---------- Missing numbers ---------- */
  G.missing = (r, L) => {
    const t = T(L); let p, a, sol, hint = 'Work backwards: use the opposite (inverse) operation.'; const o = [];
    if (t <= 2) {
      o.push(() => { const y = r.int(2, 9), s = r.int(y + 3, 20); a = s - y; p = `${B} + ${y} = ${s}`; sol = `${s} − ${y} = ${a}`; });
      o.push(() => { const s = r.int(10, 20), y = r.int(2, s - 3); a = s - y; p = `${s} − ${B} = ${y}`; sol = `${s} − ${y} = ${a}`; });
      o.push(() => { const m = r.pick([2, 5, 10]), x = r.int(2, 10); a = x; p = `${B} × ${m} = ${x * m}`; sol = `${x * m} ÷ ${m} = ${x}`; });
      o.push(() => { const m = r.pick([2, 5, 10]), q = r.int(2, 9); a = m * q; p = `${B} ÷ ${m} = ${q}`; sol = `${q} × ${m} = ${a}`; });
      o.push(() => { const x = r.int(3, 9), y = r.int(3, 9), z = r.int(1, x + y - 2); a = x + y - z; p = `${x} + ${y} = ${B} + ${z}`; sol = `${x} + ${y} = ${x + y}, and ${x + y} − ${z} = ${a}`; hint = 'Both sides must be equal. Work out the side you can first.'; });
    } else if (t === 3) {
      o.push(() => { const y = r.int(11, 60), s = r.int(y + 10, 100); a = s - y; p = `${B} + ${y} = ${s}`; sol = `${s} − ${y} = ${a}`; });
      o.push(() => { const s = r.int(40, 100), y = r.int(11, s - 10); a = s - y; p = `${s} − ${B} = ${y}`; sol = `${s} − ${y} = ${a}`; });
      o.push(() => { const m = r.int(3, 10), x = r.int(3, 10); a = x; p = `${B} × ${m} = ${x * m}`; sol = `${x * m} ÷ ${m} = ${x}`; });
      o.push(() => { const m = r.int(3, 10), q = r.int(3, 10); a = m; p = `${m * q} ÷ ${B} = ${q}`; sol = `${m * q} ÷ ${q} = ${m}`; hint = 'How many groups of ' + q + ' fit into ' + m * q + '?'; });
      o.push(() => { const x = r.int(20, 50), y = r.int(10, 40), z = r.int(5, 30); a = x + y - z; p = `${x} + ${y} = ${B} + ${z}`; sol = `${x} + ${y} = ${x + y}, and ${x + y} − ${z} = ${a}`; hint = 'Work out the side you know first.'; });
    } else if (t === 4) {
      o.push(() => { const y = r.int(120, 480), s = r.int(y + 100, 990); a = s - y; p = `${B} + ${y} = ${s}`; sol = `${s} − ${y} = ${a}`; });
      o.push(() => { const y = r.int(101, 899); a = 1000 - y; p = `1000 − ${B} = ${y}`; sol = `1000 − ${y} = ${a}`; });
      o.push(() => { const m = r.int(6, 12), x = r.int(6, 12); a = x; p = `${B} × ${m} = ${x * m}`; sol = `${x * m} ÷ ${m} = ${x}`; });
      o.push(() => { const m = r.int(4, 12), q = r.int(5, 12); a = m * q; p = `${B} ÷ ${m} = ${q}`; sol = `${q} × ${m} = ${a}`; });
      o.push(() => { const a1 = r.int(3, 9), b1 = r.int(4, 9), c1 = r.pick([2, 3, 4, 6]); const prod = a1 * b1 * c1; a = b1 * a1; p = `${a1 * c1} × ${b1} = ${B} × ${c1}`; a = a1 * b1; sol = `${a1 * c1} × ${b1} = ${a1 * c1 * b1}; ${a1 * c1 * b1} ÷ ${c1} = ${a}`; hint = 'Work out the left side, then divide by the number next to the box.'; });
    } else if (t === 5) {
      o.push(() => { const m = r.int(12, 25), x = r.int(6, 15); a = x; p = `${B} × ${m} = ${m * x}`; sol = `${m * x} ÷ ${m} = ${x}`; });
      o.push(() => { const m = r.int(6, 12), q = r.int(15, 40); a = m * q; p = `${B} ÷ ${m} = ${q}`; sol = `${q} × ${m} = ${a}`; });
      o.push(() => { const y = r.int(1111, 8888); a = 10000 - y; p = `10 000 − ${B} = ${y}`; sol = `10 000 − ${y} = ${a}`; });
      o.push(() => { const y = rd(r.int(11, 89) / 10, 1), s = r.int(10, 14); a = rd(s - y, 1); p = `${B} + ${fmt(y)} = ${s}`; sol = `${s} − ${fmt(y)} = ${fmt(a)}`; });
      o.push(() => { const m = r.int(3, 9), x = r.int(4, 12), k = r.int(3, 20); a = x; p = `${m} × ${B} + ${k} = ${m * x + k}`; sol = `${m * x + k} − ${k} = ${m * x}, then ${m * x} ÷ ${m} = ${x}`; hint = 'Undo the + first, then undo the ×.'; });
      o.push(() => { const d = r.pick([2, 3, 4, 5]), q = r.int(3, 12); a = d * q; p = `${frac(1, d)} of ${B} = ${q}`; sol = `${q} × ${d} = ${a}`; hint = `If one ${d === 2 ? 'half' : 'part out of ' + d} is ${q}, what is the whole?`; });
    } else if (t === 6) {
      o.push(() => { const y = rd(r.int(101, 899) / 100, 2), s = r.int(10, 15); a = rd(s - y, 2); p = `${fmt(y)} + ${B} = ${s}`; sol = `${s} − ${fmt(y)} = ${fmt(a)}`; });
      o.push(() => { const x = rd(r.int(101, 999) / 100, 2), m = r.pick([10, 100]); a = rd(x, 2); p = `${B} × ${m} = ${fmt(x * m)}`; sol = `${fmt(x * m)} ÷ ${m} = ${fmt(x)}`; hint = 'Multiplying by ' + m + ' moves digits left. Which way do they move back?'; });
      o.push(() => { const m = r.int(3, 9), x = r.int(5, 15), k = r.int(2, 20); a = x; p = `${m} × ${B} − ${k} = ${m * x - k}`; sol = `${m * x - k} + ${k} = ${m * x}; ${m * x} ÷ ${m} = ${x}`; hint = 'Undo the − first, then undo the ×.'; });
      o.push(() => { const d = r.int(3, 8), q = r.int(3, 10), k = r.int(2, 12); a = d * q; p = `${B} ÷ ${d} + ${k} = ${q + k}`; sol = `${q + k} − ${k} = ${q}; ${q} × ${d} = ${a}`; hint = 'Undo the + first, then undo the ÷.'; });
      o.push(() => { const d = r.pick([3, 4, 5, 6, 8]), n = r.int(2, d - 1), x = r.int(3, 9); a = d * x; p = `${frac(n, d)} of ${B} = ${n * x}`; sol = `${n * x} ÷ ${n} = ${x} (one part). ${x} × ${d} = ${a}`; hint = 'Find what ONE part is worth first.'; });
      o.push(() => { const x = r.int(5, 14); a = x; p = `${B} × ${B} = ${x * x}`; sol = `${x} × ${x} = ${x * x}`; hint = 'The same number is multiplied by itself – think square numbers.'; });
    } else {
      o.push(() => { const x = r.int(3, 12), k = r.int(2, 9), m = r.int(2, 5); a = x; p = `${m}(${B} + ${k}) = ${m * (x + k)}`; sol = `Divide by ${m}: ${x + k}; then take away ${k}: ${x}`; hint = 'Undo the multiplying first, then the adding.'; });
      o.push(() => { const k = r.int(3, 9), q = r.int(3, 9), d = r.int(2, 8); a = q * d + k; p = `(${B} − ${k}) ÷ ${d} = ${q}`; sol = `${q} × ${d} = ${q * d}; ${q * d} + ${k} = ${a}`; hint = 'Undo the ÷ first, then undo the −.'; });
      o.push(() => { const x = r.int(3, 12), a1 = r.int(4, 7), c1 = r.int(2, a1 - 1), b1 = r.int(1, 10), d1 = c1 * x + b1 + (a1 - c1) * 0; const dd = (a1 - c1) * x + b1; a = x; p = `${a1} × ${B} + ${b1} = ${c1} × ${B} + ${dd + c1 * x - c1 * x + (c1 * x)}`; const rhs = c1 * x + (a1 * x + b1 - c1 * x); a = x; sol = `Try ${x}: left = ${a1 * x + b1}, right = ${c1 * x} + ${a1 * x + b1 - c1 * x}`; p = `${a1} × ${B} + ${b1} = ${c1} × ${B} + ${a1 * x + b1 - c1 * x}`; hint = 'Same number goes in both boxes. Try a number and test both sides!'; });
      o.push(() => { const x = r.int(4, 13); a = x; p = `${B}² − ${r.int(1, 1)} = ${x * x - 1}`; sol = `${x * x - 1} + 1 = ${x * x}, and √${x * x} = ${x}`; hint = 'Which number multiplied by itself gives that?'; });
      o.push(() => { const b = r.pick([2, 3, 5]), e = r.int(3, b === 2 ? 9 : b === 3 ? 5 : 4); a = e; p = `${b}<sup>${B}</sup> = ${Math.pow(b, e)}`; sol = `${b} multiplied ${e} times = ${Math.pow(b, e)}`; hint = `Keep multiplying ${b} by itself until you reach ${Math.pow(b, e)} – count how many ${b}s.`; });
      o.push(() => { const x = r.int(5, 15); a = x * x; p = `√${B} = ${x}`; sol = `${x} × ${x} = ${x * x}`; hint = 'A square root undoes squaring.'; });
    }
    run(r, o);
    return num('Find the missing number:' + eq(p), a, { hint, sol });
  };

  /* ---------- Word problems (multi-step) ---------- */
  const WP = [
    [1, 3, r => { const n = r.pick(NAMES), it = r.pick(ITEMS), a = r.int(10, 30), b = r.int(5, 15), c = r.int(2, 9); return { p: `${n} has ${a} ${it}. ${n} gets ${b} more, then gives ${c} to a friend. How many ${it} does ${n} have now?`, a: a + b - c, sol: `${a} + ${b} = ${a + b}, then ${a + b} − ${c} = ${a + b - c}.`, hint: 'Two steps: first the "more", then the "gives away".' }; }],
    [1, 3, r => { const n = r.pick(NAMES), rows = r.int(2, 5), per = r.int(3, 5), extra = r.int(2, 6); return { p: `${n} puts chairs in ${rows} rows with ${per} chairs in each row. Then ${extra} more chairs are added at the back. How many chairs are there altogether?`, a: rows * per + extra, sol: `${rows} × ${per} = ${rows * per}, then + ${extra} = ${rows * per + extra}.`, hint: 'Find the chairs in the rows first.' }; }],
    [2, 4, r => { const n = r.pick(NAMES), m = r.int(4, 6), k = r.int(3, 6), e = r.int(3, 9); return { p: `A tray holds ${m} muffins. ${n} bakes ${k} trays and then eats ${e} muffins. How many muffins are left?`, a: m * k - e, sol: `${m} × ${k} = ${m * k}, then ${m * k} − ${e} = ${m * k - e}.`, hint: 'How many muffins were baked before any were eaten?' }; }],
    [2, 4, r => { const n = r.pick(NAMES), k = r.pick([3, 4, 5]), per = r.int(4, 9), x = r.int(2, 8); return { p: `${n} shares ${k * per} stickers equally between ${k} friends. Each friend then buys ${x} more stickers. How many stickers does each friend have now?`, a: per + x, sol: `${k * per} ÷ ${k} = ${per}, then ${per} + ${x} = ${per + x}.`, hint: 'Share first, then add the extras.' }; }],
    [3, 5, r => { const n = r.pick(NAMES), a = r.int(3, 9), b = r.int(1, 4), q1 = r.int(2, 4), q2 = r.int(2, 5); return { p: `A book costs $${a} and a pen costs $${b}. ${n} buys ${q1} books and ${q2} pens. How much does ${n} spend altogether?`, a: a * q1 + b * q2, pre: '$', sol: `${q1} × $${a} = $${a * q1}; ${q2} × $${b} = $${b * q2}; total = $${a * q1 + b * q2}.`, hint: 'Work out the books and the pens separately, then combine.' }; }],
    [3, 5, r => { const n = r.pick(NAMES), pay = r.pick([20, 50]), k = r.int(2, 5), x = r.int(3, 8); return { p: `${n} pays with a $${pay} note and buys ${k} toys that cost $${x} each. How much change does ${n} get?`, a: pay - k * x, pre: '$', sol: `${k} × $${x} = $${k * x}; $${pay} − $${k * x} = $${pay - k * x}.`, hint: 'Total cost first. Then take it from the money paid.' }; }],
    [4, 6, r => { const n = r.pick(NAMES), sp = r.int(40, 80), h = r.int(3, 5), more = r.int(20, 60); return { p: `A car travels ${sp} km each hour for ${h} hours, then another ${more} km. How far did it travel in total?`, a: sp * h + more, sol: `${sp} × ${h} = ${sp * h}; ${sp * h} + ${more} = ${sp * h + more} km.`, hint: 'Distance = km per hour × hours. Then add the last bit.', unit: 'km' }; }],
    [4, 6, r => { const s = r.int(6, 12), k = r.int(3, 9), N = s * k + r.int(1, s - 1); return { p: `${N} students are going on an excursion. A minibus seats ${s} students. How many minibuses are needed so that everyone has a seat?`, a: k + 1, sol: `${N} ÷ ${s} = ${k} remainder ${N - s * k}, so one more bus is needed: ${k + 1}.`, hint: 'Divide, then think about what to do with the leftover students.' }; }],
    [4, 6, r => { const p = r.int(8, 15), b = r.int(6, 9), bx = r.int(3, 6), loose = r.int(4, 11); return { p: `A box holds ${p} packs and each pack has ${b} pens. A shop sells ${bx} boxes and ${loose} extra pens. How many pens is that in total?`, a: p * b * bx + loose, sol: `${p} × ${b} = ${p * b} pens per box; × ${bx} = ${p * b * bx}; + ${loose} = ${p * b * bx + loose}.`, hint: 'Pens per box first.' }; }],
    [5, 7, r => { const w = r.int(4, 9), h = r.int(3, 6), per = r.pick([6, 8, 10, 12]); const area = w * h; return { p: `A wall is ${w} m wide and ${h} m high. One tin of paint covers ${per} m². How many tins must be bought to paint the whole wall once?`, a: Math.ceil(area / per), sol: `Area = ${w} × ${h} = ${area} m². ${area} ÷ ${per} = ${rd(area / per, 2)}, so round UP to ${Math.ceil(area / per)} tins.`, hint: 'Find the area, divide by the coverage, then think about whole tins.' }; }],
    [5, 7, r => { const n = r.pick(NAMES), base = r.pick([48, 60, 72, 96, 120]); const sp1 = base / 4, rem = base - sp1, sp2 = rem / 3; return { p: `${n} has $${base}. ${n} spends ¼ of it on lunch, then ⅓ of what is left on a book. How much money does ${n} have left?`, a: rem - sp2, pre: '$', sol: `¼ of ${base} = ${sp1}, left ${rem}. ⅓ of ${rem} = ${sp2}. ${rem} − ${sp2} = ${rem - sp2}.`, hint: 'The second fraction is of what is LEFT, not of the start.' }; }],
    [5, 7, r => { const rate = r.int(12, 25), cap = r.int(300, 600), start = r.int(30, 90); const mins = Math.ceil((cap - start) / rate); const cap2 = start + rate * mins === cap; const total = start + rate * r.int(8, 15); const m = (total - start) / rate; return { p: `A tank already has ${start} L of water. A tap adds ${rate} L every minute. How many minutes until the tank holds ${total} L?`, a: m, sol: `${total} − ${start} = ${total - start} L still needed. ${total - start} ÷ ${rate} = ${m} minutes.`, hint: 'How much more water is needed? Then how many lots of the tap rate fit?', unit: 'min' }; }],
    [6, 8, r => { const price = r.pick([40, 60, 80, 120, 200]), d = r.pick([10, 20, 25, 50]), post = r.int(3, 9); const sale = price * (100 - d) / 100; return { p: `A jacket costs $${price}. It is on sale for ${d}% off, and postage costs $${post}. What is the total price?`, a: sale + post, pre: '$', sol: `${d}% of ${price} = ${price * d / 100}. Sale price ${sale}. Add postage: ${sale + post}.`, hint: 'Find the discount, take it off, THEN add postage.' }; }],
    [6, 8, r => { const a1 = r.int(2, 5), b1 = r.int(a1 + 1, 7), unit = r.int(8, 30), tot = (a1 + b1) * unit; return { p: `$${tot} is shared between Ava and Ben in the ratio ${a1}:${b1}. How much does Ben get?`, a: b1 * unit, pre: '$', sol: `${a1} + ${b1} = ${a1 + b1} parts. ${tot} ÷ ${a1 + b1} = ${unit} per part. Ben: ${b1} × ${unit} = ${b1 * unit}.`, hint: 'Add the ratio numbers to get the total parts. How much is one part?' }; }],
    [6, 8, r => { const kg = r.int(3, 6), per = r.pick([2.5, 3.5, 4.5, 1.5]), more = r.int(kg + 2, 10); return { p: `${kg} kg of apples cost ${mon(kg * per)}. How much will ${more} kg of apples cost at the same price?`, a: rd(more * per, 2), pre: '$', sol: `One kg = ${fmt(kg * per)} ÷ ${kg} = ${mon(per)}. ${more} × ${fmt(per)} = ${mon(more * per)}.`, hint: 'Find the cost of 1 kg first (unit rate).' }; }],
    [7, 8, r => { const x = r.int(4, 15), m = r.int(2, 5), k = r.int(3, 12); return { p: `I think of a number, multiply it by ${m}, then add ${k}. My answer is ${m * x + k}. What number did I think of?`, a: x, sol: `Undo: ${m * x + k} − ${k} = ${m * x}; ${m * x} ÷ ${m} = ${x}.`, hint: 'Work backwards through each step.' }; }],
    [7, 8, r => { const sp = r.pick([48, 60, 72, 90]), t = r.pick([1.5, 2.5, 3.5]), d = sp * t; return { p: `A train travels at ${sp} km/h. How many kilometres does it travel in ${fmt(t)} hours?`, a: d, unit: 'km', sol: `Distance = speed × time = ${sp} × ${fmt(t)} = ${fmt(d)} km.`, hint: 'distance = speed × time' }; }],
    [7, 8, r => { const v = r.pick([200, 400, 800, 1200]), p = r.pick([10, 15, 20, 25]); return { p: `A town has ${v} people. Next year its population grows by ${p}%. Then the year after it falls by 10% of the new population. What is the population after the two years?`, a: v * (100 + p) / 100 * 0.9, sol: `Grow: ${v} × ${(100 + p) / 100} = ${v * (100 + p) / 100}. Fall by 10%: × 0.9 = ${rd(v * (100 + p) / 100 * 0.9, 2)}.`, hint: 'Each % change is applied to the amount you have at that time.' }; }]
  ];
  G.wordmulti = (r, L) => {
    const t = T(L), ok = WP.filter(w => t >= w[0] && t <= w[1]); const w = r.pick(ok.length ? ok : WP.slice(0, 2)); const q = w[2](r);
    return num(q.p, q.a, { pre: q.pre, unit: q.unit, sol: q.sol, hint: q.hint });
  };

  /* ---------- Multiplication ---------- */
  G.multi = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 2) {
      o.push(() => { const rows = r.int(2, 5), cols = r.pick([2, 3, 4, 5, 10].filter(c => c <= 10)); q = num(`This array shows rows of dots. How many dots are there altogether?`, rows * cols, { svg: M.dotArray(rows, cols), sol: `${rows} rows of ${cols}: ${rows} × ${cols} = ${rows * cols}`, hint: 'Count the dots in one row, then count how many rows. Skip count!', desc: `array of ${rows} rows of ${cols} dots` }); });
      o.push(() => { const n = r.pick(NAMES), k = r.int(2, 5), per = r.pick([2, 5, 10]); q = num(`${n} has ${k} bags. Each bag has ${per} marbles. How many marbles does ${n} have altogether?`, k * per, { sol: `${k} groups of ${per} = ${k * per}`, hint: `Skip count by ${per}s, ${k} times.` }); });
      o.push(() => { const k = r.int(3, 9), n = r.pick(NAMES); q = num(`${n} has ${k} pairs of socks. How many socks is that?`, k * 2, { sol: `${k} × 2 = ${k * 2}`, hint: 'A pair means 2. Double the number!' }); });
    } else if (t === 3) {
      o.push(() => { const n = r.pick(NAMES), a = r.int(3, 9), b = r.int(3, 9); q = num(`A cinema has ${a} rows. Each row has ${b} seats. How many seats are there?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Rows × seats in each row.' }); });
      o.push(() => { const a = r.int(6, 10), b = r.int(4, 9); q = num(`A pack has ${a} pencils. How many pencils are in ${b} packs?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: `Use your ${a} times table.` }); });
      o.push(() => { const a = r.int(3, 9), b = r.int(2, 5); q = num(`${a} × ${b} = ${a * b}. So what is ${a} × ${b * 2}?`, a * b * 2, { sol: `Doubling one number doubles the answer: ${a * b} × 2 = ${a * b * 2}`, hint: 'You are multiplying by double the number. What happens to the answer?' }); });
    } else if (t === 4) {
      o.push(() => { const a = r.int(13, 49), b = r.int(3, 9); q = num(`A bus carries ${a} people. How many people can ${b} buses carry?`, a * b, { sol: `${a} × ${b}: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, ${a % 10} × ${b} = ${a % 10 * b}; total ${a * b}.`, hint: 'Split into tens and ones: multiply each part, then add.' }); });
      o.push(() => { const a = r.int(100, 400), b = r.int(2, 5); q = num(`A farmer packs ${a} eggs in each crate. How many eggs are in ${b} crates?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Split ' + a + ' into hundreds, tens and ones.' }); });
      o.push(() => { const a = r.int(6, 9), b = r.int(7, 9), c = r.int(2, 4); q = num(`There are ${a} boxes with ${b} cupcakes in each. ${c} cupcakes are dropped. How many cupcakes are left?`, a * b - c, { sol: `${a} × ${b} = ${a * b}; ${a * b} − ${c} = ${a * b - c}`, hint: 'Multiply first, then subtract.' }); });
    } else if (t === 5) {
      o.push(() => { const a = r.int(12, 29), b = r.int(11, 24); q = num(`A theatre has ${a} rows with ${b} seats in each row. How many seats is that?`, a * b, { sol: `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${a * b}`, hint: 'Break one number into tens and ones. Multiply each part by the other number.' }); });
      o.push(() => { const a = r.int(234, 876), b = r.int(3, 9); q = num(`${fmt(a)} × ${b} = ?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Multiply the ones, then tens, then hundreds. Carry when you need to.' }); q.prompt = `Use the written method: ${fmt(a)} × ${b} = ?`; });
      o.push(() => { const a = r.int(15, 45), b = r.int(12, 18); q = num(`A baker makes ${a} loaves each day. How many loaves in ${b} days?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Try the area model: split the numbers into tens and ones.' }); });
    } else if (t === 6) {
      o.push(() => { const a = r.int(12, 99), m = r.pick([10, 100, 1000]); q = num(`${a} × ${fmt(m)} = ?`, a * m, { sol: `Move every digit ${String(m).length - 1} place(s) left (add ${String(m).length - 1} zero(s)): ${fmt(a * m)}`, hint: `Multiplying by ${fmt(m)} slides digits left.` }); });
      o.push(() => { const a = rd(r.int(11, 99) / 10, 1), m = r.pick([10, 100]); q = num(`${fmt(a)} × ${m} = ?`, a * m, { sol: `Digits move ${String(m).length - 1} place(s) left: ${fmt(a * m)}`, hint: 'The decimal point seems to move to the right.' }); });
      o.push(() => { const a = r.int(1234, 4999), b = r.int(12, 35); q = num(`A factory makes ${fmt(a)} bolts per day. How many bolts is that in ${b} days?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Long multiplication: ×' + (b % 10) + ' then ×' + Math.floor(b / 10) + '0, then add.' }); });
    } else {
      o.push(() => { const a = rd(r.int(21, 99) / 10, 1), b = r.int(3, 9); q = num(`${fmt(a)} × ${b} = ?`, a * b, { sol: `${fmt(a)} × ${b}: ignore the point → ${Math.round(a * 10)} × ${b} = ${Math.round(a * 10) * b}; put it back → ${fmt(a * b)}`, hint: 'Ignore the decimal point, multiply, then put it back.' }); });
      o.push(() => { const a = rd(r.int(2, 9) / 10, 1), b = rd(r.int(2, 9) / 10, 1); q = num(`${fmt(a)} × ${fmt(b)} = ?`, a * b, { sol: `${a * 10} × ${b * 10} = ${a * 10 * b * 10}; two decimal places in total → ${fmt(a * b)}`, hint: 'How many digits are after the decimal point in total (both numbers)?' }); });
      o.push(() => { const a = rd(r.int(15, 95) / 10, 1), b = r.pick([1.5, 2.5, 3.5, 4.2, 6.5]); q = num(`A rectangle is ${fmt(a)} m by ${fmt(b)} m. What is its area?`, a * b, { unit: 'm²', sol: `${fmt(a)} × ${fmt(b)} = ${fmt(a * b)} m²`, hint: 'Area = length × width. Multiply as whole numbers then place the point.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Division ---------- */
  G.division = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 2) {
      o.push(() => { const k = r.pick([2, 3, 4, 5]), per = r.int(2, 5), n = r.pick(NAMES); q = num(`${n} shares ${k * per} sweets equally between ${k} friends. How many sweets does each friend get?`, per, { sol: `${k * per} ÷ ${k} = ${per}`, hint: 'Share them out one at a time, or think of the times table backwards.' }); });
      o.push(() => { const per = r.pick([2, 5, 10]), k = r.int(2, 6); q = num(`${per * k} apples are put into bags of ${per}. How many bags are needed?`, k, { sol: `${per * k} ÷ ${per} = ${k}`, hint: `Skip count by ${per}s until you reach ${per * k}.` }); });
    } else if (t === 3) {
      o.push(() => { const per = r.int(3, 9), k = r.int(3, 9); q = num(`${per * k} children make teams of ${per}. How many teams are there?`, k, { sol: `${per * k} ÷ ${per} = ${k}`, hint: 'Which times table has ' + per * k + ' in it?' }); });
      o.push(() => { const per = r.int(3, 9), k = r.int(3, 8), rem = r.int(1, per - 1); q = num(`${per * k + rem} cupcakes go into boxes of ${per}. How many FULL boxes can be made?`, k, { sol: `${per * k + rem} ÷ ${per} = ${k} remainder ${rem}. ${k} full boxes.`, hint: 'The leftovers do not fill a box.' }); });
    } else if (t === 4) {
      o.push(() => { const d = r.int(3, 9), k = r.int(11, 30), rem = r.int(1, d - 1); q = num(`${d * k + rem} ÷ ${d} = ? remainder ?  Type ONLY the remainder.`, rem, { sol: `${d} × ${k} = ${d * k}; ${d * k + rem} − ${d * k} = ${rem}`, hint: 'Find the biggest multiple of ' + d + ' that fits, then see what is left over.' }); });
      o.push(() => { const d = r.int(3, 9), k = r.int(12, 40), n = r.pick(NAMES); q = num(`${n} has ${d * k} stickers to put on ${d} pages, the same number on each page. How many stickers on each page?`, k, { sol: `${d * k} ÷ ${d} = ${k}`, hint: 'Short division: divide tens, then ones.' }); });
    } else if (t === 5) {
      o.push(() => { const d = r.int(3, 9), k = r.int(120, 480); q = num(`Use short division: ${fmt(d * k)} ÷ ${d} = ?`, k, { sol: `${d * k} ÷ ${d} = ${k}`, hint: 'Work from the left. Carry any remainder to the next digit.' }); });
      o.push(() => { const d = r.int(4, 9), k = r.int(1100, 2400), n = r.pick(NAMES); q = num(`A school orders ${fmt(d * k)} books. They are shared equally among ${d} classes. How many books does each class get?`, k, { sol: `${d * k} ÷ ${d} = ${k}`, hint: 'Short division with a 4-digit number.' }); });
    } else if (t === 6) {
      o.push(() => { const d = r.pick([2, 4, 5, 8]), n = r.int(3, 30); q = num(`${n} ÷ ${d} = ?  (give a decimal answer)`, n / d, { sol: `${n} ÷ ${d} = ${fmt(n / d)} (add a decimal point and zeros to keep dividing)`, hint: 'When you run out of digits, put a point and a zero after the number and keep going.' }); });
      o.push(() => { const d = r.int(3, 9), k = rd(r.int(11, 99) / 10, 1); q = num(`${fmt(d * k)} ÷ ${d} = ?`, k, { sol: `Divide as normal and keep the decimal point in line: ${fmt(k)}`, hint: 'The decimal point in the answer goes straight above the one in the number.' }); });
    } else {
      o.push(() => { const d = r.int(3, 9), k = rd(r.int(21, 99) / 10, 1); q = num(`${fmt(d * k)} ÷ ${d} = ?`, k, { sol: `${fmt(d * k)} ÷ ${d} = ${fmt(k)}`, hint: 'Short division, keeping the decimal point in line.' }); });
      o.push(() => { const d = r.pick([0.5, 0.25, 0.1, 0.2, 0.4]), k = r.int(3, 20); q = num(`${fmt(rd(d * k, 3))} ÷ ${fmt(d)} = ?`, k, { sol: `Make the divisor whole (multiply both by ${d === 0.25 ? 100 : 10}): ${k}`, hint: 'Dividing by a number less than 1 makes the answer BIGGER. How many ' + fmt(d) + 's fit?' }); });
      o.push(() => { const m = r.pick([10, 100, 1000]), a = rd(r.int(100, 9999) / 10, 1); q = num(`${fmt(a)} ÷ ${fmt(m)} = ?`, a / m, { sol: `Move each digit ${String(m).length - 1} place(s) right: ${fmt(a / m)}`, hint: 'Dividing shifts digits to the right.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Place value ---------- */
  G.place = (r, L) => {
    const t = T(L), o = []; let q;
    const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
    if (t <= 2) {
      o.push(() => { const a = r.int(2, 9), b = r.int(1, 9); q = num(`What number is ${a} tens and ${b} ones?`, a * 10 + b, { sol: `${a} tens = ${a * 10}, plus ${b} = ${a * 10 + b}`, hint: 'A ten is worth 10.' }); });
      o.push(() => { const n = r.int(21, 98); q = num(`What is the value of the <b>${Math.floor(n / 10)}</b> in ${n}?`, Math.floor(n / 10) * 10, { sol: `It is in the tens place so it is worth ${Math.floor(n / 10)} × 10.`, hint: 'Which column is the digit in?' }); });
      o.push(() => { const n = r.int(20, 90); q = num(`What is 10 more than ${n}?`, n + 10, { sol: `${n} + 10 = ${n + 10}`, hint: 'Which digit changes when you add 10?' }); });
    } else if (t === 3) {
      o.push(() => { const h = r.int(1, 9), te = r.int(1, 9), on = r.int(1, 9); q = num(`${h} hundreds + ${te} tens + ${on} ones = ?`, h * 100 + te * 10 + on, { sol: `${h * 100} + ${te * 10} + ${on} = ${h * 100 + te * 10 + on}`, hint: 'Write each part as a number, then add.' }); });
      o.push(() => { const n = r.int(120, 989); q = num(`Round ${n} to the nearest 10.`, Math.round(n / 10) * 10, { sol: `Look at the ones digit (${n % 10}): ${n % 10 >= 5 ? '5 or more, round up' : 'less than 5, round down'} → ${Math.round(n / 10) * 10}`, hint: 'Look at the ones digit. 5 or more rounds up.' }); });
      o.push(() => { const n = r.int(200, 899); q = num(`What is 100 less than ${n}?`, n - 100, { sol: `Take 1 from the hundreds digit: ${n - 100}`, hint: 'Only one digit changes.' }); });
    } else if (t === 4) {
      o.push(() => { const n = r.int(1200, 9899), pos = r.pick([1, 2]); const v = Math.round(n / Math.pow(10, pos)) * Math.pow(10, pos); q = num(`Round ${fmt(n)} to the nearest ${pos === 1 ? 10 : 100}.`, v, { sol: `Look at the digit to the right: ${v}`, hint: 'Which digit decides whether you round up?' }); });
      o.push(() => { const n = String(r.int(1000, 9999)), i = r.int(0, 3), d = n[i]; if (d === '0') return o[1](); const place = 3 - i; q = num(`In the number ${n}, what is the value of the digit <b>${d}</b> (in position ${i + 1} from the left)?`, +d * Math.pow(10, place), { sol: `${d} is in the ${names[place]} place: ${+d * Math.pow(10, place)}`, hint: 'Which place (thousands, hundreds, tens, ones) is it in?' }); });
      o.push(() => { const n = r.int(2000, 8000), k = r.pick([10, 100, 1000]); q = num(`What is ${fmt(k)} more than ${fmt(n)}?`, n + k, { sol: `${n} + ${k} = ${n + k}`, hint: 'Which digit goes up by 1?' }); });
    } else if (t === 5) {
      o.push(() => { const a = r.int(2, 9), b = r.int(0, 9), c = r.int(0, 9), d = r.int(0, 9), e = r.int(1, 9); const n = a * 10000 + b * 1000 + c * 100 + d * 10 + e; q = num(`Write the number: ${a} ten thousands, ${b} thousands, ${c} hundreds, ${d} tens and ${e} ones.`, n, { sol: `${a}${b}${c}${d}${e} = ${fmt(n)}`, hint: 'Each count fills one column. Use 0 for an empty column.' }); });
      o.push(() => { const n = r.int(100000, 899999), pos = r.int(0, 5), s = String(n), d = s[pos]; if (d === '0') return o[1](); q = num(`What is the value of the <b>${d}</b> in ${fmt(n)}? (It is the ${pos + 1}${['st', 'nd', 'rd', 'th', 'th', 'th'][pos]} digit from the left.)`, +d * Math.pow(10, 5 - pos), { sol: `It is in the ${names[5 - pos]} place → ${+d * Math.pow(10, 5 - pos)}`, hint: 'Count places from the right: ones, tens, hundreds…' }); });
      o.push(() => { const d = rd(r.int(1, 99) / 10 + r.int(1, 9), 1), pos = 1; const s = fmt(d); q = num(`Round ${s} to the nearest whole number.`, Math.round(d), { sol: `Look at the tenths digit. ${Math.round(d)}`, hint: 'Look at the first digit after the point.' }); });
      o.push(() => { const t1 = r.int(1, 9), h1 = r.int(1, 9); q = num(`What is the value of the digit <b>${t1}</b> in 3.${t1}${h1}?`, t1 / 10, { sol: `It is the tenths digit: ${t1} ÷ 10 = ${t1 / 10}`, hint: 'The first digit after the point is tenths.' }); });
    } else if (t === 6) {
      o.push(() => { const n = r.int(1000000, 8999999); const k = Math.pow(10, r.int(5, 6)); q = num(`Round ${fmt(n)} to the nearest ${fmt(k)}.`, Math.round(n / k) * k, { sol: `Look at the digit to the right of the ${k === 1000000 ? 'millions' : 'hundred thousands'} place.`, hint: 'Which digit decides?' }); });
      o.push(() => { const d = rd(r.int(1001, 9999) / 1000, 3), dp = r.pick([1, 2]); q = num(`Round ${fmt(d)} to ${dp} decimal place${dp > 1 ? 's' : ''}.`, rd(d, dp), { sol: `Look at the digit after the last one you keep: ${fmt(rd(d, dp))}`, hint: 'Look one digit to the right of where you stop.' }); });
      o.push(() => { const a = r.int(1, 9), b = r.int(1, 9), c = r.int(1, 9); q = num(`What is the value of the <b>${c}</b> in ${a}.${b}${c}?`, c / 100, { sol: `Second digit after the point = hundredths: ${c}/100 = ${c / 100}`, hint: 'tenths, then hundredths, then thousandths' }); });
    } else {
      o.push(() => { const d = rd(r.int(1000, 99999) / 1000, 3); q = num(`Round ${fmt(d)} to 2 significant figures.`, parseFloat(d.toPrecision(2)), { sol: `The first two non-zero digits: ${fmt(parseFloat(d.toPrecision(2)))}`, hint: 'Significant figures start counting at the first digit that is not zero.' }); });
      o.push(() => { const n = r.int(3, 9) * 1000 + r.int(0, 9) * 100 + r.int(0, 9) * 10 + r.int(1, 9); q = num(`${fmt(n)} ÷ 1000 = ?`, n / 1000, { sol: `Move each digit 3 places right: ${fmt(n / 1000)}`, hint: 'Dividing by 1000 moves the point 3 places left.' }); });
      o.push(() => { const a = rd(r.int(10, 99) / 100, 2); q = num(`What is 0.001 more than ${fmt(a)}?`, a + 0.001, { sol: `${fmt(a)} + 0.001 = ${fmt(a + 0.001)}`, hint: '0.001 is one thousandth. Which column changes?' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Decimals ---------- */
  G.decimals = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 3) {
      o.push(() => { const a = r.int(2, 9) + r.pick([0.5, 0.25, 0.75, 0.2]), b = r.int(1, 6) + r.pick([0.5, 0.25, 0.75, 0.2]), n = r.pick(NAMES); q = num(`${n} buys a drink for ${mon(a)} and a snack for ${mon(b)}. How much is that in total?`, a + b, { pre: '$', sol: `${mon(a)} + ${mon(b)} = ${mon(a + b)}`, hint: 'Line up the dollars and cents. Add cents first.' }); });
      o.push(() => { const pay = r.pick([5, 10, 20]), c = rd(r.int(110, pay * 100 - 150) / 100, 2), n = r.pick(NAMES); q = num(`${n} pays $${pay} for something that costs ${mon(c)}. How much change should ${n} get?`, pay - c, { pre: '$', sol: `${pay} − ${fmt(c)} = ${mon(pay - c)}`, hint: 'Count up from the price to the money you paid.' }); });
    } else if (t === 4) {
      o.push(() => { const k = r.int(1, 9), w = r.int(0, 2); const v = w + k / 10; q = num(`The arrow points to a number between ${w} and ${w + 1}. What decimal does it show?`, v, { svg: M.numberLine(w, w + 1, 0.1, v, { labelEvery: 5, fmt: x => fmt(x) }), desc: `number line from ${w} to ${w + 1} in tenths, arrow at ${v}`, sol: `The arrow is ${k} tenths past ${w}: ${fmt(v)}`, hint: 'The line is split into 10 equal steps. Count them from the left.' }); });
      o.push(() => { const a = rd(r.int(15, 95) / 10, 1), b = rd(r.int(15, 95) / 10, 1); q = num(`A ribbon is ${fmt(a)} m long. Another is ${fmt(b)} m long. How long are they together?`, a + b, { unit: 'm', sol: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`, hint: 'Line up the decimal points.' }); });
      o.push(() => { const a = rd(r.int(21, 99) / 10, 1), m = r.pick([10, 100]); q = num(`${fmt(a)} × ${m} = ?`, a * m, { sol: `Digits move left: ${fmt(a * m)}`, hint: 'Multiply by 10 moves the point one place right.' }); });
    } else if (t === 5) {
      o.push(() => { const k = r.int(11, 99), v = rd(2 + k / 100, 2); q = num(`The arrow points to a number between 2 and 3. What is it?`, v, { svg: M.numberLine(2, 3, 0.1, v, { labelEvery: 5, fmt: x => fmt(x) }), desc: `number line 2 to 3, arrow at ${v}`, sol: `Between ${fmt(Math.floor(v * 10) / 10)} and ${fmt(Math.floor(v * 10) / 10 + 0.1)}, so ${fmt(v)}`, hint: 'First find which two tenths it sits between.' }); });
      o.push(() => { const a = rd(r.int(500, 999) / 100, 2), b = rd(r.int(110, 480) / 100, 2); q = num(`${fmt(a)} − ${fmt(b)} = ?`, a - b, { sol: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}`, hint: 'Line up the decimal points. Add zeros if you need to.' }); });
      o.push(() => { const a = rd(r.int(21, 99) / 100, 2), m = r.pick([10, 100, 1000]); q = num(`${fmt(a)} × ${fmt(m)} = ?`, a * m, { sol: `${fmt(a * m)}`, hint: 'The point moves right.' }); });
      o.push(() => { const a = rd(r.int(301, 799) / 100, 2), b = rd(r.int(11, 99) / 100, 2), c = rd(r.int(11, 99) / 100, 2); q = num(`A pencil case costs ${mon(a)}. A ruler costs ${mon(b)} and an eraser costs ${mon(c)}. What is the total?`, a + b + c, { pre: '$', sol: `${fmt(a)} + ${fmt(b)} + ${fmt(c)} = ${fmt(a + b + c)}`, hint: 'Line up the cents. Carry from the hundredths.' }); });
    } else if (t === 6) {
      o.push(() => { const k = r.int(1, 9), v = rd(0.5 + k / 100, 2); q = num(`The arrow points to a number between 0.5 and 0.6. What is it?`, v, { svg: M.numberLine(0.5, 0.6, 0.01, v, { labelEvery: 5, fmt: x => fmt(x) }), sol: `${k} hundredths after 0.5 = ${fmt(v)}`, hint: 'Each tiny step is one hundredth.', desc: `number line from 0.5 to 0.6, arrow at ${v}` }); });
      o.push(() => { const a = rd(r.int(100, 999) / 100, 2), m = r.pick([10, 100, 1000]); q = num(`${fmt(a * m)} ÷ ${fmt(m)} = ?`, a, { sol: `${fmt(a)}`, hint: 'Divide shifts digits right.' }); });
      o.push(() => { const a = rd(r.int(10, 99) / 10, 1), b = r.int(3, 9); q = num(`Ali runs ${fmt(a)} km each day for ${b} days. How far does he run altogether?`, a * b, { unit: 'km', sol: `${fmt(a)} × ${b} = ${fmt(a * b)}`, hint: 'Ignore the point, multiply, put it back.' }); });
    } else {
      o.push(() => { const a = rd(r.int(11, 99) / 10, 1), b = rd(r.int(11, 99) / 10, 1); q = num(`${fmt(a)} × ${fmt(b)} = ?`, a * b, { sol: `${a * 10} × ${b * 10} = ${a * b * 100}; two decimal places → ${fmt(a * b)}`, hint: 'Multiply as whole numbers, then count decimal places in total.' }); });
      o.push(() => { const a = rd(r.int(5, 99) / 100, 2), b = r.int(2, 9); q = num(`${fmt(rd(a * b, 2))} ÷ ${b} = ?`, a, { sol: `${fmt(a)}`, hint: 'Short division with the point in line.' }); });
      o.push(() => { const a = rd(r.int(1, 9) / 10, 1), b = rd(r.int(1, 9) / 10, 1); q = num(`${fmt(a)} ÷ ${fmt(b)} = ?  (Hint: it may not be a whole number – give a decimal if needed.)`, a / b === Math.round(a / b) ? a / b : rd(a / b, 2), { sol: `Multiply both by 10: ${a * 10} ÷ ${b * 10}`, hint: 'Multiply both numbers by 10 to make the divisor whole.' }); if (rd(a / b, 2) !== a / b) return o[0](); });
    }
    run(r, o); return q;
  };

  /* ---------- Fractions with pictures ---------- */
  G.fracpic = (r, L) => {
    const t = Math.min(6, T(L)), o = []; let q;
    if (t <= 2) {
      o.push(() => { const d = r.pick([2, 4]), n = r.int(1, d - 1); q = Object.assign({ prompt: `What fraction of the shape is shaded? Write it like 1/2.`, svg: r.chance(.5) ? M.fracBar(n, d) : M.fracCircle(n, d), sol: `${n} out of ${d} equal parts are shaded: ${n}/${d}`, hint: 'Count all the equal parts (bottom number), then the shaded ones (top number).', desc: `shape split into ${d} equal parts with ${n} shaded` }, fa(n, d)); q.simplest = false; if (n === 2 && d === 4) q.answer = '2/4'; q.type = q.type === 'num' ? 'num' : 'frac'; if (q.type === 'frac') { q.answer = `${n}/${d}`; q.simplest = false; } });
    } else if (t === 3) {
      o.push(() => { const d = r.pick([3, 5, 6, 8, 10]), n = r.int(1, d - 1); q = Object.assign({ prompt: `What fraction of the shape is shaded? Write it like 3/8.`, svg: r.chance(.5) ? M.fracBar(n, d) : M.fracCircle(n, d), sol: `${n} parts shaded out of ${d} equal parts = ${n}/${d}`, hint: 'The bottom number is how many equal parts in total.', desc: `shape with ${d} equal parts, ${n} shaded` }, { type: 'frac', answer: `${n}/${d}` }); });
      o.push(() => { const d = r.pick([4, 5, 8, 10]), n = r.int(1, d - 1); q = num(`A bar is split into ${d} equal parts. ${n} parts are shaded. How many parts are NOT shaded?`, d - n, { svg: M.fracBar(n, d), sol: `${d} − ${n} = ${d - n}`, hint: 'Total parts take away shaded parts.', desc: `bar of ${d} parts, ${n} shaded` }); });
    } else if (t === 4) {
      o.push(() => { const d1 = r.pick([2, 3, 4, 5]), n1 = r.int(1, d1 - 1), k = r.int(2, 4); q = num(`These two bars are the same size and show equal fractions. ${n1}/${d1} = ?/${d1 * k}`, n1 * k, { svg: M.fracBar(n1, d1, M.C.orange) + M.fracBar(n1 * k, d1 * k, M.C.orange), sol: `Multiply top and bottom by ${k}: ${n1} × ${k} = ${n1 * k}`, hint: 'The bottom number was multiplied by ' + k + '. Do the same to the top!', desc: `two bars: ${n1}/${d1} and ${n1 * k}/${d1 * k}` }); });
      o.push(() => { const d = r.pick([4, 6, 8, 10, 12]), n = r.int(2, d - 2); const f = fa(n, d); q = Object.assign({ prompt: `What fraction of the circle is shaded? Write it in <b>simplest form</b>.`, svg: M.fracCircle(n, d), sol: `${n}/${d} simplifies to ${f.answer}`, hint: 'Write the fraction, then divide the top and bottom by the same number.', desc: `circle of ${d} parts with ${n} shaded` }, f); });
    } else {
      o.push(() => { const rows = r.pick([2, 3, 4, 5]), cols = r.pick([4, 5, 6, 10]), tot = rows * cols, n = r.int(2, tot - 2), f = fa(n, tot); q = Object.assign({ prompt: `The grid has ${tot} equal squares. ${n} are shaded. What fraction is shaded? Give it in <b>simplest form</b>.`, svg: M.fracGrid(n, rows, cols), sol: `${n}/${tot} = ${f.answer}`, hint: 'Write shaded over total, then simplify by dividing both by a common factor.', desc: `grid of ${tot} squares with ${n} shaded` }, f); });
      o.push(() => { const rows = r.pick([2, 4, 5]), cols = r.pick([5, 10]), tot = rows * cols, n = r.int(3, tot - 3); const f = fa(tot - n, tot); q = Object.assign({ prompt: `The grid has ${tot} equal squares and ${n} are shaded. What fraction is <b>NOT</b> shaded? Simplest form.`, svg: M.fracGrid(n, rows, cols, M.C.pink), sol: `${tot} − ${n} = ${tot - n} not shaded: ${tot - n}/${tot} = ${f.answer}`, hint: 'Count the unshaded squares first.', desc: `grid of ${tot} squares with ${n} shaded` }, f); if (f.type === 'num') q.type = 'num'; });
      o.push(() => { const d = r.pick([5, 10, 20, 25]), n = r.int(1, d - 1); const pct = n * 100 / d; q = num(`What <b>percentage</b> of this bar is shaded?`, pct, { svg: M.fracBar(n, d > 12 ? 10 : d), unit: '%', sol: `${n}/${d} = ${pct}%`, hint: 'Make the bottom number 100.', desc: 'bar' }); if (d > 12 || Number.isNaN(pct)) return o[0](); const dd = d > 12 ? 10 : d; q.svg = M.fracBar(n, dd); q.answer = raw(n * 100 / dd); q.sol = `${n}/${dd} = ${n * 100 / dd}%`; });
    }
    run(r, o); return q;
  };

  /* ---------- Fraction operations ---------- */
  G.fracop = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 3) {
      o.push(() => { const d = r.pick([2, 4]), k = r.int(2, 6), n = r.pick(NAMES); q = num(`${n} has ${d * k} grapes and eats ${d === 2 ? 'half' : 'a quarter'} of them. How many grapes does ${n} eat?`, k, { sol: `${d * k} ÷ ${d} = ${k}`, hint: `Splitting into ${d} equal groups: find one group.` }); });
      o.push(() => { const k = r.int(2, 6), d = 3; q = num(`What is ${frac(1, 3)} of ${3 * k}?`, k, { sol: `${3 * k} ÷ 3 = ${k}`, hint: 'One third means share into 3 equal groups.' }); });
    } else if (t === 4) {
      o.push(() => { const d = r.pick([3, 4, 5, 8]), n = r.int(2, d - 1), k = r.int(2, 8); q = num(`What is ${frac(n, d)} of ${d * k}?`, n * k, { sol: `${d * k} ÷ ${d} = ${k}; ${k} × ${n} = ${n * k}`, hint: 'Divide by the bottom number, then multiply by the top.' }); });
      o.push(() => { const d = r.pick([5, 6, 8, 10, 12]), a = r.int(1, d - 2), b = r.int(1, d - a - 1 > 0 ? d - a - 1 : 1); const s = a + b; const f = fa(s, d); q = Object.assign({ prompt: `${frac(a, d)} + ${frac(b, d)} = ?  (simplest form, like 3/4)`, sol: `${a} + ${b} = ${s}, so ${s}/${d}${f.answer !== s + '/' + d ? ' = ' + f.answer : ''}`, hint: 'The bottoms are the same, so just add the tops.' }, f); });
      o.push(() => { const d = r.pick([2, 3, 4, 5]), n = r.int(1, d - 1), k = r.int(2, 4); q = num(`${frac(n, d)} = ${frac(B, d * k)}. What number goes in the box?`, n * k, { sol: `×${k} on the bottom, so ×${k} on top: ${n * k}`, hint: 'Do the same to top and bottom.' }); });
    } else if (t === 5) {
      o.push(() => { const d = r.pick([2, 3, 4, 5]), k = r.pick([2, 3, 4]), a = r.int(1, d - 1), b = r.int(1, d * k - 1); const D = d * k, s = a * k + b; const f = fa(s, D, true); q = Object.assign({ prompt: `${frac(a, d)} + ${frac(b, D)} = ?  (Simplest form. If bigger than 1, write a mixed number like 1 1/2.)`, sol: `${a}/${d} = ${a * k}/${D}; ${a * k} + ${b} = ${s}; ${s}/${D} = ${f.answer}`, hint: 'Make the bottom numbers the same first (find an equivalent fraction).' }, f); });
      o.push(() => { const d = r.pick([3, 4, 5, 6, 8]), w = r.int(1, 4), n = r.int(1, d - 1); const imp = w * d + n; q = num(`Write ${mix(imp, d)} as an improper fraction. What is the <b>top number</b> (numerator) over ${d}?`, imp, { sol: `${w} × ${d} + ${n} = ${imp}`, hint: 'Whole number × bottom, then add the top.' }); });
      o.push(() => { const d = r.pick([3, 4, 5]), a = r.int(1, d - 1), b = r.int(1, d - 1); if (a === b) return o[0](); const f1 = a / d, f2 = b / (d + 1); q = { prompt: `Which fraction is bigger: ${frac(a, d)} or ${frac(b, d + 1)}?`, type: 'mc', choices: [`${a}/${d}`, `${b}/${d + 1}`], answer: f1 > f2 ? '0' : '1', sol: `${a}/${d} = ${rd(f1, 3)} and ${b}/${d + 1} = ${rd(f2, 3)}`, hint: 'Change both to the same bottom number, or turn them into decimals.' }; if (f1 === f2) return o[0](); });
      o.push(() => { const d = r.pick([8, 10, 12]), a = r.int(1, d / 2 - 1), b = r.int(1, d / 2 - 1); const s = d - a - b; const f = fa(s, d); q = Object.assign({ prompt: `A pizza was cut into ${d} equal slices. ${a} slices were eaten at lunch and ${b} at dinner. What fraction of the pizza is left? Simplest form.`, sol: `${d} − ${a} − ${b} = ${s} slices left → ${s}/${d} = ${f.answer}`, hint: 'Count how many slices are left. That is your top number.' }, f); });
    } else if (t === 6) {
      o.push(() => { const pairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 8]], pr = r.pick(pairs), a = r.int(1, pr[0] - 1), b = r.int(1, pr[1] - 1), D = pr[0] * pr[1], s = a * pr[1] + b * pr[0], f = fa(s, D, true); q = Object.assign({ prompt: `${frac(a, pr[0])} + ${frac(b, pr[1])} = ?  (Simplest form; mixed number if over 1.)`, sol: `Common bottom ${D}: ${a * pr[1]}/${D} + ${b * pr[0]}/${D} = ${s}/${D} = ${f.answer}`, hint: 'Find a common multiple of both bottom numbers.' }, f); });
      o.push(() => { const pr = r.pick([[3, 4], [2, 3], [4, 5], [5, 6]]), a = pr[0] - 1, b = r.int(1, pr[1] - 1); const s = a * pr[1] - b * pr[0]; if (s <= 0) return o[0](); const f = fa(s, pr[0] * pr[1]); q = Object.assign({ prompt: `${frac(a, pr[0])} − ${frac(b, pr[1])} = ?  (Simplest form)`, sol: `${a * pr[1]}/${pr[0] * pr[1]} − ${b * pr[0]}/${pr[0] * pr[1]} = ${s}/${pr[0] * pr[1]} = ${f.answer}`, hint: 'Common bottom number first, then subtract the tops.' }, f); });
      o.push(() => { const d = r.pick([3, 4, 5, 6, 8]), n = r.int(1, d - 1), k = r.int(2, 9), f = fa(n * k, d, true); q = Object.assign({ prompt: `${k} × ${frac(n, d)} = ?  (Simplest form; mixed number if over 1.)`, sol: `${k} × ${n} = ${n * k}, so ${n * k}/${d} = ${f.answer}`, hint: 'Multiply the whole number by the TOP only.' }, f); });
      o.push(() => { const a = r.pick([2, 3, 4]), b = r.pick([3, 4, 5]), n1 = 1, n2 = r.int(1, b - 1), f = fa(n1 * n2, a * b); q = Object.assign({ prompt: `${frac(1, a)} of ${frac(n2, b)} = ?  (Simplest form)`, sol: `Multiply tops and bottoms: ${n2}/${a * b} = ${f.answer}`, hint: '"Of" means multiply.' }, f); });
    } else {
      o.push(() => { const a = r.int(1, 4), b = r.pick([3, 4, 5, 7]), c = r.int(1, 4), d = r.pick([3, 4, 5, 8]); if (a >= b || c >= d) return o[0](); const f = fa(a * c, b * d); q = Object.assign({ prompt: `${frac(a, b)} × ${frac(c, d)} = ?  (Simplest form)`, sol: `${a * c}/${b * d} = ${f.answer}`, hint: 'Multiply tops together, bottoms together, then simplify.' }, f); });
      o.push(() => { const a = r.int(1, 5), b = r.pick([3, 4, 5, 6, 7]), k = r.int(2, 5); if (a >= b) return o[0](); const f = fa(a, b * k); q = Object.assign({ prompt: `${frac(a, b)} ÷ ${k} = ?  (Simplest form)`, sol: `Dividing by ${k} makes the bottom ${k} times bigger: ${a}/${b * k} = ${f.answer}`, hint: 'Splitting a fraction into more parts makes each part smaller.' }, f); });
      o.push(() => { const w1 = r.int(1, 4), n1 = 1, d1 = r.pick([2, 4]), w2 = r.int(1, 3), n2 = r.pick([1, 3]), d2 = 4; const s = (w1 * d1 + n1) * d2 + (w2 * d2 + n2) * d1, D = d1 * d2, f = fa(s, D, true); q = Object.assign({ prompt: `${mix(w1 * d1 + n1, d1)} + ${mix(w2 * d2 + n2, d2)} = ?  (Mixed number, simplest form)`, sol: `Whole numbers: ${w1} + ${w2} = ${w1 + w2}. Fractions: ${n1}/${d1} + ${n2}/${d2}. Combine.`, hint: 'Add the whole numbers and the fractions separately, then tidy up.' }, f); });
      o.push(() => { const a = r.int(1, 3), b = r.pick([2, 3, 4, 5]), c = r.int(1, 3), d = r.pick([2, 3, 4, 5]); if (a >= b || c >= d) return o[0](); const f = fa(a * d, b * c, true); q = Object.assign({ prompt: `${frac(a, b)} ÷ ${frac(c, d)} = ?  (Simplest form, mixed if over 1.)`, sol: `Flip the second fraction and multiply: ${a}/${b} × ${d}/${c} = ${a * d}/${b * c} = ${f.answer}`, hint: 'Keep – Change – Flip: multiply by the upside-down fraction.' }, f); });
    }
    run(r, o); return q;
  };

  /* ---------- Fractions, decimals, percentages ---------- */
  G.fdp = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 4) {
      o.push(() => { const p = r.pick([[2, 0.5], [4, 0.25]]); q = num(`Write ${frac(1, p[0])} as a decimal.`, p[1], { sol: `1 ÷ ${p[0]} = ${p[1]}`, hint: 'Divide 1 by the bottom number.' }); });
      o.push(() => { const n = r.int(1, 9); q = num(`Write ${frac(n, 10)} as a decimal.`, n / 10, { sol: `${n} tenths = ${n / 10}`, hint: 'Tenths are the first digit after the point.' }); });
    } else if (t === 5) {
      o.push(() => { const f = r.pick([[1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [1, 10, 10], [3, 10, 30], [1, 2, 50], [3, 5, 60], [7, 10, 70]]); q = num(`Write ${frac(f[0], f[1])} as a percentage.`, f[2], { unit: '%', sol: `${f[0]}/${f[1]} = ${f[2]}/100 = ${f[2]}%`, hint: 'Make the bottom number 100.' }); });
      o.push(() => { const p = r.pick([10, 25, 50]), a = r.pick([40, 60, 80, 120, 200]); q = num(`What is ${p}% of ${a}?`, a * p / 100, { sol: `${p}% = ${p === 10 ? '1/10' : p === 25 ? '1/4' : '1/2'}. ${a} ÷ ${100 / p} = ${a * p / 100}`, hint: p === 10 ? '10% means ÷ 10.' : p === 25 ? '25% is one quarter.' : '50% is half.' }); });
      o.push(() => { const d = r.pick([0.25, 0.4, 0.6, 0.75, 0.2, 0.8, 0.35]); q = num(`Write ${d} as a percentage.`, d * 100, { unit: '%', sol: `${d} × 100 = ${d * 100}%`, hint: 'Percent means out of 100.' }); });
    } else if (t === 6) {
      o.push(() => { const p = r.pick([5, 20, 30, 75, 15]), a = r.pick([40, 60, 80, 120, 200, 240]); q = num(`What is ${p}% of ${a}?`, a * p / 100, { sol: `10% of ${a} = ${a / 10}${p === 20 ? ', so 20% = ' + a / 5 : p === 5 ? ', so 5% = ' + a / 20 : ''}. Answer ${a * p / 100}.`, hint: 'Find 10% first, then build up (or halve it for 5%).' }); });
      o.push(() => { const tot = r.pick([20, 25, 40, 50]), n = r.int(3, tot - 2); const p = n * 100 / tot; if (p !== Math.round(p)) return o[0](); q = num(`${n} out of ${tot} students walk to school. What percentage walk?`, p, { unit: '%', sol: `${n}/${tot} = ${p}/100 = ${p}%`, hint: 'Change the fraction so the bottom is 100.' }); });
      o.push(() => { const f = r.pick([[1, 8, 0.125], [3, 8, 0.375], [1, 20, 0.05], [7, 20, 0.35], [3, 25, 0.12]]); q = num(`Write ${frac(f[0], f[1])} as a decimal.`, f[2], { sol: `${f[0]} ÷ ${f[1]} = ${f[2]}`, hint: 'Divide the top by the bottom (short division).' }); });
    } else if (t === 7) {
      o.push(() => { const p = r.pick([12, 15, 35, 45, 60, 85]), a = r.pick([40, 80, 120, 200, 360]); q = num(`What is ${p}% of ${a}?`, a * p / 100, { sol: `${p}% of ${a} = ${p}/100 × ${a} = ${a * p / 100}`, hint: 'Break up the percentage: 10% + 5% etc.' }); });
      o.push(() => { const a = r.pick([50, 80, 120, 200, 250]), p = r.pick([10, 20, 25]), up = r.chance(.5); q = num(`A game costs $${a}. The price ${up ? 'rises' : 'drops'} by ${p}%. What is the new price?`, a * (up ? 100 + p : 100 - p) / 100, { pre: '$', sol: `${p}% of ${a} = ${a * p / 100}. ${up ? a + ' + ' : a + ' − '}${a * p / 100} = ${a * (up ? 100 + p : 100 - p) / 100}`, hint: 'Find the amount of the change, then add or subtract.' }); });
      o.push(() => { const a = r.pick([40, 50, 60, 80]), b = a + r.pick([10, 20, 30]) * (a === 40 ? 1 : 1); const ch = (b - a) / a * 100; if (ch !== Math.round(ch)) return o[0](); q = num(`A plant grows from ${a} cm to ${b} cm. What is the percentage increase?`, ch, { unit: '%', sol: `Increase = ${b - a}. ${b - a}/${a} × 100 = ${ch}%`, hint: 'Percentage change = change ÷ original × 100.' }); });
    } else {
      o.push(() => { const orig = r.pick([50, 80, 120, 200]), p = r.pick([20, 25, 40]), sale = orig * (100 - p) / 100; q = num(`After a ${p}% discount, a bike costs $${sale}. What was the original price?`, orig, { pre: '$', sol: `${100 - p}% = $${sale}, so 1% = ${rd(sale / (100 - p), 4)} and 100% = ${orig}`, hint: 'The sale price is (100 − discount)% of the original. Find 1% first.' }); });
      o.push(() => { const a = r.pick([200, 400, 800]), g1 = r.pick([10, 20, 25]), g2 = r.pick([10, 20]); q = num(`A value of $${a} increases by ${g1}% and then increases by ${g2}% of the new value. What is the final value?`, a * (100 + g1) / 100 * (100 + g2) / 100, { pre: '$', sol: `${a} × ${(100 + g1) / 100} × ${(100 + g2) / 100} = ${rd(a * (100 + g1) / 100 * (100 + g2) / 100, 2)}`, hint: 'Do one percent change at a time – the 2nd is on the NEW amount.' }); });
      o.push(() => { const m = r.pick([[1, 3, '33.3'], [2, 5, '40'], [7, 8, '87.5'], [5, 8, '62.5']]); q = num(`Write ${frac(m[0], m[1])} as a percentage (to 1 decimal place if needed).`, parseFloat(m[2]), { unit: '%', sol: `${m[0]} ÷ ${m[1]} × 100 = ${m[2]}%`, hint: 'Divide first, then × 100.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Patterns ---------- */
  G.pattern = (r, L) => {
    const t = T(L), o = []; let q;
    const seq = (a, f, n) => { const s = [a]; for (let i = 1; i < n; i++) s.push(f(s[i - 1], i)); return s; };
    if (t <= 2) {
      o.push(() => { const st = r.pick([2, 5, 10]), s0 = st * r.int(0, 3), s = seq(s0, x => x + st, 6), i = r.int(2, 4); const hid = s[i]; q = num(`Skip count: ${s.map((v, j) => j === i ? B : v).join(', ')}.  What is the missing number?`, hid, { sol: `The pattern adds ${st} each time: ${hid}`, hint: `How much is added each step?` }); });
    } else if (t === 3) {
      o.push(() => { const st = r.pick([3, 4, 6, 7, 8]), s0 = st * r.int(1, 3), s = seq(s0, x => x + st, 6), i = r.int(2, 5); q = num(`Find the missing number: ${s.map((v, j) => j === i ? B : v).join(', ')}`, s[i], { sol: `Add ${st} each time: ${s[i]}`, hint: 'Find the jump between two numbers you can see.' }); });
      o.push(() => { const s0 = r.int(50, 90), st = r.pick([5, 6, 8, 10, 12]), s = seq(s0, x => x - st, 6), i = r.int(2, 5); q = num(`This pattern goes DOWN: ${s.map((v, j) => j === i ? B : v).join(', ')}`, s[i], { sol: `Subtract ${st} each time: ${s[i]}`, hint: 'The numbers are getting smaller, so subtract.' }); });
    } else if (t === 4) {
      o.push(() => { const st = r.pick([25, 50, 125, 250, 15, 35]), s0 = r.int(1, 6) * st, s = seq(s0, x => x + st, 6), i = r.int(3, 5); q = num(`Find the missing number: ${s.map((v, j) => j === i ? B : v).join(', ')}`, s[i], { sol: `Add ${st} each time: ${s[i]}`, hint: 'Find the constant jump.' }); });
      o.push(() => { const m = r.pick([6, 7, 8, 9, 11, 12]), k = r.int(4, 8); q = num(`What is the ${k}th multiple of ${m}?`, m * k, { sol: `${m} × ${k} = ${m * k}`, hint: 'The ' + k + 'th multiple is ' + k + ' lots of ' + m + '.' }); });
    } else if (t === 5) {
      o.push(() => { const a = r.int(2, 5), b = r.int(1, 5), s0 = r.int(1, 4), s = seq(s0, x => x * a + b, 4); q = num(`Rule: multiply by ${a} then add ${b}. Start at ${s0}: ${s.join(', ')}, … What is the 5th number?`, s[3] * a + b, { sol: `${s[3]} × ${a} + ${b} = ${s[3] * a + b}`, hint: 'Apply the two steps to the last number.' }); });
      o.push(() => { const st = r.pick([0.25, 0.5, 0.75, 1.5]), s0 = r.int(1, 4), s = seq(s0, x => rd(x + st, 2), 6), i = r.int(3, 5); q = num(`Find the missing number: ${s.map((v, j) => j === i ? B : fmt(v)).join(', ')}`, s[i], { sol: `Add ${fmt(st)} each time: ${fmt(s[i])}`, hint: 'Work out the size of one jump.' }); });
    } else if (t === 6) {
      o.push(() => { const s0 = r.int(1, 5), m = r.pick([2, 3, 4]), s = seq(s0, x => x * m, 5); q = num(`1 term of a pattern is found by multiplying by ${m}: ${s.join(', ')}, … What is the next number?`, s[4] * m, { sol: `${s[4]} × ${m} = ${s[4] * m}`, hint: 'Is it adding or multiplying?' }); });
      o.push(() => { const s = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100], i = r.int(5, 9); q = num(`What is the ${i + 1}th number in the pattern 1, 4, 9, 16, 25, …?`, s[i], { sol: `These are square numbers: ${i + 1} × ${i + 1} = ${s[i]}`, hint: 'Look at 1×1, 2×2, 3×3…' }); });
      o.push(() => { const a = r.int(2, 6), b = r.int(1, 8), n = r.int(8, 20); q = num(`Matchstick pattern: shape 1 uses ${a + b} sticks, shape 2 uses ${2 * a + b}, shape 3 uses ${3 * a + b}. How many sticks does shape ${n} use?`, a * n + b, { sol: `Each shape adds ${a}. Rule: ${a} × shape number + ${b}. ${a} × ${n} + ${b} = ${a * n + b}`, hint: 'Find how many sticks are added each time, then build a rule.' }); });
    } else if (t === 7) {
      o.push(() => { const a = r.int(2, 7), b = r.int(-3, 6), s = [1, 2, 3, 4].map(n => a * n + b), n = r.int(10, 30); q = num(`The pattern ${s.join(', ')}, … follows a rule. What is the ${n}th term?`, a * n + b, { sol: `Common difference ${a}; nth term = ${a}n ${b >= 0 ? '+' : '−'} ${Math.abs(b)}. For n = ${n}: ${a * n + b}`, hint: 'Find the common difference, then check what you need to add or subtract.' }); });
      o.push(() => { const a = r.int(2, 6), b = r.int(1, 9), n = r.int(9, 25); q = num(`The nth term of a sequence is ${a}n + ${b}. What is the ${n}th term?`, a * n + b, { sol: `${a} × ${n} + ${b} = ${a * n + b}`, hint: 'Replace n with ' + n + '.' }); });
    } else {
      o.push(() => { const a = r.int(3, 7), b = r.int(1, 8), n = r.int(10, 25); const v = a * n + b; q = num(`The nth term of a sequence is ${a}n + ${b}. Which term (n) is equal to ${v}?`, n, { sol: `${a}n + ${b} = ${v} → ${a}n = ${v - b} → n = ${n}`, hint: 'Set the rule equal to the value and solve for n.' }); });
      o.push(() => { const a = r.int(1, 4), b = r.int(2, 5), s = [a, b]; for (let i = 2; i < 8; i++) s.push(s[i - 1] + s[i - 2]); q = num(`Each number is the sum of the two before it: ${s.slice(0, 6).join(', ')}, …  What is the 8th number?`, s[7], { sol: `${s[6]} + ${s[5]} = ${s[6]}, then ${s[7]}`, hint: 'Keep adding the last two numbers.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Money ---------- */
  G.money = (r, L) => {
    const t = Math.min(6, T(L)), o = []; let q;
    if (t <= 2) {
      o.push(() => { const a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 5); q = num(`${a} × 50c coins, ${b} × 20c coins and ${c} × 10c coins. How many cents is that altogether?`, a * 50 + b * 20 + c * 10, { unit: 'cents', sol: `${a * 50} + ${b * 20} + ${c * 10} = ${a * 50 + b * 20 + c * 10}`, hint: 'Work out each type of coin, then add.' }); });
      o.push(() => { const p = r.int(2, 8), n = r.pick(NAMES); q = num(`A toy costs $${p}. ${n} pays with $10. How much change?`, 10 - p, { pre: '$', sol: `10 − ${p} = ${10 - p}`, hint: `Count up from ${p} to 10.` }); });
    } else if (t <= 4) {
      o.push(() => { const a = r.int(2, 9) + r.pick([0, 0.5]), b = r.int(2, 9) + r.pick([0, 0.5]), c = r.int(1, 4), pay = 50; const tot = a * 2 + b * c; q = { prompt: `Price list: <b>Sandwich ${mon(a)}</b>, <b>Juice ${mon(b)}</b>. Mia buys 2 sandwiches and ${c} juice${c > 1 ? 's' : ''}. She pays with $${pay}. How much change does she get?`, type: 'num', answer: raw(pay - tot), pre: '$', sol: `2 × ${mon(a)} = ${mon(2 * a)}; ${c} × ${mon(b)} = ${mon(b * c)}; total ${mon(tot)}; ${pay} − ${fmt(tot)} = ${mon(pay - tot)}`, hint: 'Cost of sandwiches, cost of juices, total, then change.' }; });
      o.push(() => { const a = rd(r.int(3, 9) + r.pick([0.2, 0.5, 0.8]), 1), n = r.int(3, 6); q = num(`One ticket costs ${mon(a)}. How much do ${n} tickets cost?`, rd(a * n, 2), { pre: '$', sol: `${n} × ${fmt(a)} = ${fmt(a * n)}`, hint: 'Multiply the dollars and the cents separately, then add.' }); });
    } else {
      o.push(() => { const n1 = r.int(3, 6), p1 = rd(r.int(300, 900) / 100, 2), n2 = r.int(2, 5), p2 = rd(r.int(150, 600) / 100, 2); q = num(`${n1} notebooks cost ${mon(p1)} each and ${n2} folders cost ${mon(p2)} each. What is the total cost?`, rd(n1 * p1 + n2 * p2, 2), { pre: '$', sol: `${n1} × ${fmt(p1)} = ${fmt(n1 * p1)}; ${n2} × ${fmt(p2)} = ${fmt(n2 * p2)}; total ${fmt(n1 * p1 + n2 * p2)}`, hint: 'Two separate multiplications, then one addition.' }); });
      o.push(() => { const a = r.int(2, 5), pa = rd(r.int(3, 9) + r.pick([.5, .8, .2]), 1), b = r.int(4, 8), pb = rd(r.int(5, 14) + r.pick([.5, .25]), 2); const ua = rd(pa / a, 3), ub = rd(pb / b, 3); q = { prompt: `Pack A: ${a} pens for ${mon(pa)}. Pack B: ${b} pens for ${mon(pb)}. Which pack is the <b>better value</b> (cheaper per pen)?`, type: 'mc', choices: ['Pack A', 'Pack B', 'They are the same'], answer: String(ua < ub ? 0 : ua > ub ? 1 : 2), sol: `A: ${fmt(pa)} ÷ ${a} = ${mon(ua)} each. B: ${fmt(pb)} ÷ ${b} = ${mon(ub)} each.`, hint: 'Work out the price of ONE pen in each pack.' }; });
    }
    run(r, o); return q;
  };

  /* ---------- Ratio ---------- */
  G.ratio = (r, L) => {
    const t = Math.max(5, T(L)), o = []; let q;
    if (t <= 5) {
      o.push(() => { const a = r.int(1, 4), b = r.int(a + 1, 6), k = r.int(2, 6), n = r.pick(NAMES); q = num(`In a bag the ratio of red to blue marbles is ${a}:${b}. There are ${a * k} red marbles. How many blue marbles are there?`, b * k, { sol: `${a} parts = ${a * k}, so 1 part = ${k}. Blue = ${b} × ${k} = ${b * k}`, hint: 'Find what ONE part is worth.' }); });
      o.push(() => { const k = r.int(2, 4), n = r.int(3, 9); q = num(`A recipe uses 2 cups of flour for every 1 cup of sugar. How many cups of flour for ${n} cups of sugar?`, 2 * n, { sol: `2 × ${n} = ${2 * n}`, hint: 'The flour is always double the sugar.' }); });
    } else if (t === 6) {
      o.push(() => { const a = r.int(1, 4), b = r.int(a + 1, 6), u = r.int(4, 20); q = num(`Share $${(a + b) * u} between Kai and Zara in the ratio ${a}:${b}. How much does Zara get?`, b * u, { pre: '$', sol: `${a} + ${b} = ${a + b} parts. ${(a + b) * u} ÷ ${a + b} = ${u}. Zara: ${b} × ${u} = ${b * u}`, hint: 'Total parts first. Then the value of one part.' }); });
      o.push(() => { const k = r.int(2, 4), n = r.pick([4, 6, 8]), amt = r.pick([150, 200, 250]); q = num(`A recipe for ${n} people uses ${amt} g of rice. How many grams of rice are needed for ${n * k} people?`, amt * k, { unit: 'g', sol: `${n * k} ÷ ${n} = ${k} times as many: ${amt} × ${k} = ${amt * k}`, hint: 'How many times bigger is the group?' }); });
    } else if (t === 7) {
      o.push(() => { const k = r.pick([2, 3, 4, 5, 6]), a = r.int(2, 5) * k, b = r.int(2, 5) * k; const gg = gcd(a, b); q = { prompt: `Simplify the ratio ${a}:${b}. Write it like 2:3.`, type: 'text', nospace: true, answer: `${a / gg}:${b / gg}`, accept: [`${a / gg} to ${b / gg}`], sol: `Divide both by ${gg}: ${a / gg}:${b / gg}`, hint: 'Divide both numbers by the same number (their HCF).' }; if (gg === 1) return o[0](); });
      o.push(() => { const km = r.pick([60, 90, 120, 150]), h = r.pick([1.5, 2, 2.5, 3]); const per = km * h; q = num(`A cyclist rides at ${km} km/h. How far does she go in ${fmt(h)} hours?`, per, { unit: 'km', sol: `${km} × ${fmt(h)} = ${fmt(per)}`, hint: 'distance = speed × time' }); });
      o.push(() => { const n = r.int(4, 9), cost = rd(n * r.pick([1.5, 2.5, 3.5, 4.5]), 2); const unit = cost / n, m = r.int(10, 20); q = num(`${n} bottles of juice cost ${mon(cost)}. How much do ${m} bottles cost?`, rd(unit * m, 2), { pre: '$', sol: `One bottle: ${fmt(cost)} ÷ ${n} = ${fmt(unit)}; ${m} × ${fmt(unit)} = ${fmt(unit * m)}`, hint: 'Unit rate: cost of 1 bottle.' }); });
    } else {
      o.push(() => { const a = r.int(2, 5), b = r.int(a + 1, 7), c = r.int(2, 5), tot = (a + b) * r.int(5, 12), diff = (b - a) * (tot / (a + b)); q = num(`Two friends share some money in the ratio ${a}:${b}. The difference between their shares is $${diff}. How much money was shared altogether?`, tot, { pre: '$', sol: `The ${b - a} extra parts = $${diff}, so 1 part = $${diff / (b - a)}. Total parts ${a + b} → ${tot}`, hint: 'The difference is (b − a) parts. What is one part?' }); });
      o.push(() => { const sc = r.pick([25000, 50000, 100000]), cm = r.int(3, 12); q = num(`A map has the scale 1:${fmt(sc)}. Two towns are ${cm} cm apart on the map. How many kilometres apart are they in real life?`, cm * sc / 100000, { unit: 'km', sol: `${cm} × ${sc} = ${cm * sc} cm = ${cm * sc / 100} m = ${cm * sc / 100000} km`, hint: '100 000 cm = 1 km.' }); });
      o.push(() => { const a = r.int(1, 3), b = r.int(a + 1, 5), u = r.int(2, 9), tot = (a + b) * u; q = num(`Paint is mixed in the ratio ${a}:${b} (blue:white). To make ${tot} litres of paint altogether, how many litres of <b>blue</b> are needed?`, a * u, { unit: 'L', sol: `${a} + ${b} = ${a + b} parts. ${tot} ÷ ${a + b} = ${u} L per part. Blue = ${a} × ${u} = ${a * u}`, hint: 'Add the parts, find one part, then take the blue parts.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Algebra ---------- */
  G.algebra = (r, L) => {
    const t = Math.max(5, T(L)), o = []; let q;
    if (t <= 5) {
      o.push(() => { const a = r.int(2, 9), x = r.int(3, 20); q = num(`n + ${a} = ${x + a}.  What is n?`, x, { sol: `${x + a} − ${a} = ${x}`, hint: 'What do you add to ' + a + ' to make ' + (x + a) + '?' }); });
      o.push(() => { const a = r.int(2, 9), x = r.int(3, 12); q = num(`${a}n = ${a * x}.  What is n?`, x, { sol: `${a * x} ÷ ${a} = ${x}`, hint: '${a}n means ${a} × n.'.replace(/\$\{a\}/g, a) }); });
      o.push(() => { const a = r.int(2, 5), b = r.int(1, 9), x = r.int(2, 9); q = num(`Number machine: input ${x} → <b>× ${a}</b> → <b>+ ${b}</b> → ?`, x * a + b, { svg: M.machine(['× ' + a, '+ ' + b], x, '?'), desc: `machine: ×${a} then +${b}, input ${x}`, sol: `${x} × ${a} = ${x * a}; + ${b} = ${x * a + b}`, hint: 'Follow the arrows one box at a time.' }); });
    } else if (t === 6) {
      o.push(() => { const a = r.int(2, 6), b = r.int(1, 9), x = r.int(2, 9); q = num(`The output is ${a * x + b}. The machine does <b>× ${a}</b> then <b>+ ${b}</b>. What was the input?`, x, { svg: M.machine(['× ' + a, '+ ' + b], '?', a * x + b), desc: `machine ×${a} then +${b}, output ${a * x + b}`, sol: `Backwards: ${a * x + b} − ${b} = ${a * x}; ${a * x} ÷ ${a} = ${x}`, hint: 'Reverse each step, starting from the output.' }); });
      o.push(() => { const a = r.int(2, 6), b = r.int(1, 9), x = r.int(2, 9); q = num(`Find the value of ${a}a + ${b} when a = ${x}.`, a * x + b, { sol: `${a} × ${x} + ${b} = ${a * x + b}`, hint: 'Replace a with ' + x + ', then multiply before adding.' }); });
      o.push(() => { const a = r.int(2, 9), x = r.int(3, 20), b = r.int(2, 9); q = num(`${a}x + ${b} = ${a * x + b}.  What is x?`, x, { sol: `${a * x + b} − ${b} = ${a * x}; ÷ ${a} = ${x}`, hint: 'Undo the + first, then the ×.' }); });
    } else if (t === 7) {
      o.push(() => { const a = r.int(2, 9), b = r.int(1, 15), x = r.int(2, 12); q = num(`Solve: ${a}x + ${b} = ${a * x + b}`, x, { sol: `${a * x + b} − ${b} = ${a * x}; ${a * x} ÷ ${a} = ${x}`, hint: 'Do the opposite operations in reverse order.' }); });
      o.push(() => { const a = r.int(2, 6), b = r.int(2, 6), x = r.int(2, 9); q = num(`${a}x + ${b}x = ${(a + b) * x}.  What is x?`, x, { sol: `${a}x + ${b}x = ${a + b}x. ${(a + b) * x} ÷ ${a + b} = ${x}`, hint: 'Combine the like terms first.' }); });
      o.push(() => { const a = r.int(2, 5), x = r.int(-6, -1), b = r.int(2, 9); q = num(`Find ${a}p − ${b} when p = ${fmt(x)}.`, a * x - b, { sol: `${a} × (${fmt(x)}) = ${a * x}; ${a * x} − ${b} = ${a * x - b}`, hint: 'Careful with negatives: positive × negative = negative.' }); });
      o.push(() => { const d = r.int(2, 6), x = r.int(3, 12), k = r.int(1, 9); q = num(`x ÷ ${d} + ${k} = ${x + k}.  Find x.`, x * d, { sol: `${x + k} − ${k} = ${x}; ${x} × ${d} = ${x * d}`, hint: 'Undo the + then undo the ÷.' }); });
    } else {
      o.push(() => { const a = r.int(4, 8), c = r.int(2, a - 2), x = r.int(2, 10), b = r.int(1, 12); const d = (a - c) * x + b + 0; q = num(`Solve: ${a}x − ${b} = ${c}x + ${a * x - b - c * x}`, x, { sol: `${a}x − ${c}x = ${a * x - b - c * x} + ${b}; ${a - c}x = ${a * x - c * x}; x = ${x}`, hint: 'Collect x terms on one side and numbers on the other.' }); });
      o.push(() => { const a = r.int(2, 6), x = r.int(2, 9), b = r.int(1, 7); q = num(`Solve: ${a}(x + ${b}) = ${a * (x + b)}`, x, { sol: `Divide by ${a}: x + ${b} = ${x + b}; x = ${x}`, hint: 'You can divide both sides by the number outside the bracket.' }); });
      o.push(() => { const a = r.int(2, 7), b = r.int(1, 9), c = r.int(2, 7); q = num(`Expand and simplify: ${a}(x + ${b}) = ${a}x + ?`, a * b, { sol: `${a} × ${b} = ${a * b}`, hint: 'Multiply everything inside the bracket by the outside number.' }); });
      o.push(() => { const x = r.int(2, 9); const rt = r.pick([[1, 2, 3], [1, 1, 2], [2, 3, 4], [1, 3, 5], [2, 2, 5], [1, 2, 6]]), sm = rt[0] + rt[1] + rt[2]; q = num(`The angles of a triangle are ${rt[0] === 1 ? '' : rt[0]}x°, ${rt[1] === 1 ? '' : rt[1]}x° and ${rt[2] === 1 ? '' : rt[2]}x°. Find x.`, 180 / sm, { unit: '°', sol: `${rt.map(v => v === 1 ? 'x' : v + 'x').join(' + ')} = ${sm}x = 180, so x = ${180 / sm}`, hint: 'Angles in a triangle add to 180°. Add the x-terms first.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Order of operations ---------- */
  G.bodmas = (r, L) => {
    const t = T(L), o = []; let q;
    const mk = (s, a, sol, hint) => num(`Work out: ${eq(s)}`, a, { sol, hint: hint || 'Brackets, Orders (powers/roots), Division & Multiplication, then Addition & Subtraction – left to right.' });
    if (t <= 5) {
      o.push(() => { const a = r.int(2, 20), b = r.int(2, 9), c = r.int(2, 9); q = mk(`${a} + ${b} × ${c}`, a + b * c, `× first: ${b * c}; then ${a} + ${b * c} = ${a + b * c}`); });
      o.push(() => { const a = r.int(3, 9), b = r.int(3, 9), c = r.int(2, a * b - 1); q = mk(`${a} × ${b} − ${c}`, a * b - c, `× first: ${a * b}; then − ${c} = ${a * b - c}`); });
      o.push(() => { const b = r.int(2, 6), k = r.int(2, 9), a = r.int(20, 60); q = mk(`${a} − ${b * k} ÷ ${b}`, a - k, `÷ first: ${b * k} ÷ ${b} = ${k}; then ${a} − ${k} = ${a - k}`); });
    } else if (t === 6) {
      o.push(() => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9); q = mk(`(${a} + ${b}) × ${c}`, (a + b) * c, `Brackets: ${a + b}; × ${c} = ${(a + b) * c}`); });
      o.push(() => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 6), d = r.int(1, 9); q = mk(`${a} + ${b} × ${c} − ${d}`, a + b * c - d, `${b} × ${c} = ${b * c}; ${a} + ${b * c} = ${a + b * c}; − ${d} = ${a + b * c - d}`); });
      o.push(() => { const k = r.int(2, 5), b = r.int(3, 9), c = r.int(1, b - 1), d = r.int(2, 6); const inner = b - c; q = mk(`${k * d} ÷ ${d} × (${b} − ${c})`, k * inner, `Brackets: ${inner}; ${k * d} ÷ ${d} = ${k}; ${k} × ${inner} = ${k * inner}`); });
    } else if (t === 7) {
      o.push(() => { const a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 5); q = mk(`${a} + ${b}² × ${c}`, a + b * b * c, `Powers first: ${b}² = ${b * b}; × ${c} = ${b * b * c}; + ${a} = ${a + b * b * c}`); });
      o.push(() => { const a = r.int(1, 6), b = r.int(1, 6), c = r.pick([2, 4, 5, 10]); const s = a + b; if ((s * s) % c) return o[0](); q = mk(`(${a} + ${b})² ÷ ${c}`, s * s / c, `Bracket ${s}; ${s}² = ${s * s}; ÷ ${c} = ${s * s / c}`); });
      o.push(() => { const sq = r.pick([16, 25, 36, 49, 64, 81]), b = r.int(2, 4), c = r.int(2, 9); q = mk(`√${sq} + ${b}³ − ${c}`, Math.sqrt(sq) + b * b * b - c, `√${sq} = ${Math.sqrt(sq)}; ${b}³ = ${b ** 3}; ${Math.sqrt(sq)} + ${b ** 3} − ${c} = ${Math.sqrt(sq) + b ** 3 - c}`); });
    } else {
      o.push(() => { const a = r.int(2, 9), b = r.int(2, 5), c = r.pick([2, 4, 5]); if ((b * b) % c) return o[0](); q = mk(`−${a} + (−${b})² ÷ ${c}`, -a + b * b / c, `(−${b})² = ${b * b}; ÷ ${c} = ${b * b / c}; −${a} + ${b * b / c} = ${-a + b * b / c}`, 'A negative times itself is positive.'); });
      o.push(() => { const a = r.int(3, 8), sq = r.pick([16, 25, 36, 49]), b = r.int(2, 5); q = mk(`${a}² − √${sq} × ${b}`, a * a - Math.sqrt(sq) * b, `${a}² = ${a * a}; √${sq} × ${b} = ${Math.sqrt(sq) * b}; ${a * a} − ${Math.sqrt(sq) * b} = ${a * a - Math.sqrt(sq) * b}`); });
      o.push(() => { const a = r.int(5, 9), b = r.int(1, 4), c = r.int(2, 4), d = r.int(2, 6); q = mk(`(${a} − ${b})³ + ${c} × ${d}²`, (a - b) ** 3 + c * d * d, `(${a - b})³ = ${(a - b) ** 3}; ${c} × ${d}² = ${c * d * d}; total ${(a - b) ** 3 + c * d * d}`); });
    }
    run(r, o); return q;
  };

  /* ---------- Factors, multiples, primes ---------- */
  G.factors = (r, L) => {
    const t = T(L), o = []; let q;
    const facs = n => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
    const isP = n => n > 1 && facs(n).length === 2;
    if (t <= 3) {
      o.push(() => { const m = r.int(3, 9), n = r.int(3, 9) * m + (r.chance(.5) ? 0 : r.int(1, m - 1)); q = { prompt: `Is ${n} a multiple of ${m}?`, type: 'mc', choices: ['Yes', 'No'], answer: n % m === 0 ? '0' : '1', sol: `${n} ÷ ${m} = ${rd(n / m, 2)}${n % m ? ' – not a whole number' : ''}`, hint: `Count in ${m}s, or divide ${n} by ${m} and look for a remainder.` }; });
      o.push(() => { const m = r.int(2, 9), k = r.int(3, 7); q = num(`The first multiples of ${m} are ${m}, ${2 * m}, ${3 * m}, … What is the ${k}th multiple?`, m * k, { sol: `${m} × ${k} = ${m * k}`, hint: 'Skip count.' }); });
    } else if (t === 4) {
      o.push(() => { const n = r.pick([12, 18, 20, 24, 30, 36]); q = num(`How many different factors does ${n} have? (Remember 1 and ${n} count!)`, facs(n).length, { sol: `Factors of ${n}: ${facs(n).join(', ')} → ${facs(n).length}`, hint: 'Find factor PAIRS: 1 × ' + n + ', then try 2, 3, 4…' }); });
      o.push(() => { const m = r.int(4, 9), n = r.int(4, 9); q = num(`What is the smallest number that is a multiple of both ${m} and ${m + 1}?`, m * (m + 1), { sol: `${m} and ${m + 1} share no factors, so multiply: ${m * (m + 1)}`, hint: 'List multiples of the bigger one until you find one that the smaller one divides into.' }); });
    } else if (t === 5) {
      const cands = [[21, 23, 25, 27], [31, 33, 35, 39], [41, 43, 45, 49], [51, 53, 55, 57], [61, 63, 65, 69]];
      o.push(() => { const set = r.pick(cands); q = { prompt: 'Which of these numbers is a <b>prime</b> number?', type: 'mc', choices: set.map(String), answer: String(set.findIndex(isP)), sol: `A prime has exactly 2 factors. ${set[set.findIndex(isP)]} is prime; the others can be divided by 3, 5 or 7.`, hint: 'Try dividing each by 2, 3, 5 and 7.' }; });
      o.push(() => { const n = r.pick([24, 30, 36, 40, 48]); const f = facs(n); q = num(`What is the largest factor of ${n} that is less than ${n}?`, f[f.length - 2], { sol: `Factors: ${f.join(', ')}`, hint: `Try ${n} ÷ 2 first.` }); });
    } else if (t === 6) {
      o.push(() => { const a = r.pick([12, 18, 24, 30, 36, 48]), b = r.pick([8, 9, 15, 16, 20, 27, 40]); q = num(`Find the <b>HCF</b> (highest common factor) of ${a} and ${b}.`, gcd(a, b), { sol: `Factors of ${a}: ${facs(a).join(', ')}. Factors of ${b}: ${facs(b).join(', ')}. Biggest in both: ${gcd(a, b)}`, hint: 'List the factors of each number and look for the biggest one in both lists.' }); });
      o.push(() => { const a = r.pick([4, 6, 8, 9, 10, 12]), b = r.pick([5, 6, 8, 9, 15]); q = num(`Find the <b>LCM</b> (lowest common multiple) of ${a} and ${b}.`, lcm(a, b), { sol: `Multiples of ${a}: ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => a * i).join(', ')}… The first that ${b} goes into is ${lcm(a, b)}`, hint: 'List multiples of both until one appears in each list.' }); });
    } else if (t === 7) {
      o.push(() => { const a = r.pick([6, 8, 9, 10, 12]), b = r.pick([4, 5, 6, 15, 20]); if (a === b) return o[0](); q = num(`Two lights flash together at 12:00. One flashes every ${a} minutes and the other every ${b} minutes. After how many minutes will they flash together again?`, lcm(a, b), { unit: 'min', sol: `LCM of ${a} and ${b} = ${lcm(a, b)}`, hint: 'Look for the lowest common multiple.' }); });
      o.push(() => { const a = r.pick([24, 36, 48, 60]), b = r.pick([30, 42, 54, 72]); q = num(`A teacher has ${a} red pencils and ${b} blue pencils. She wants to make identical packs using all the pencils, with as many packs as possible. How many packs can she make?`, gcd(a, b), { sol: `HCF of ${a} and ${b} = ${gcd(a, b)}`, hint: 'You want the highest common factor.' }); });
    } else {
      o.push(() => { const a = r.int(2, 4), b = r.int(1, 3), c = r.pick([0, 1]); const n = Math.pow(2, a) * Math.pow(3, b) * Math.pow(5, c); q = num(`${fmt(n)} = 2<sup>a</sup> × 3<sup>b</sup>${c ? ' × 5' : ''}.  Find a + b.`, a + b, { sol: `Break ${n} into prime factors: 2^${a} × 3^${b}${c ? ' × 5' : ''}. a + b = ${a + b}`, hint: 'Divide by 2 repeatedly, then by 3.' }); });
      o.push(() => { const a = r.pick([36, 48, 60, 84]), b = r.pick([90, 120, 72, 108]), c = r.pick([18, 24, 30, 54]); q = num(`Find the HCF of ${a}, ${b} and ${c}.`, gcd(gcd(a, b), c), { sol: `HCF = ${gcd(gcd(a, b), c)}`, hint: 'Find the HCF of two, then of that answer and the third.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Negative numbers ---------- */
  G.neg = (r, L) => {
    const t = Math.max(4, T(L)), o = []; let q;
    if (t <= 4) {
      o.push(() => { const v = r.int(-9, 9); if (v === 0) return o[0](); q = num(`The arrow points to a number on the number line. Which number?`, v, { svg: M.numberLine(-10, 10, 1, v, { labelEvery: 2 }), desc: `number line from -10 to 10 with an arrow at ${v}`, sol: `The arrow is at ${fmt(v)}`, hint: 'Numbers left of zero are negative.' }); });
      o.push(() => { const a = r.int(-9, -1), b = r.int(1, 8); q = num(`The temperature is ${fmt(a)}°C. It rises by ${b} degrees. What is the new temperature?`, a + b, { unit: '°C', sol: `Move ${b} steps to the right from ${fmt(a)}: ${fmt(a + b)}`, hint: 'Count up on a number line.' }); });
    } else if (t === 5) {
      o.push(() => { const a = r.int(-4, 5), b = r.int(6, 12); q = num(`The temperature is ${fmt(a)}°C overnight. It falls another ${b}°C. What is it now?`, a - b, { unit: '°C', sol: `${fmt(a)} − ${b} = ${fmt(a - b)}`, hint: 'Falling means moving left on the number line.' }); });
      o.push(() => { const a = r.int(-15, -3), b = r.int(3, 12); q = num(`What is the difference between ${fmt(a)}°C and ${b}°C?`, b - a, { unit: '°C', sol: `From ${fmt(a)} up to 0 is ${-a}, then up to ${b} is ${b}. Total ${b - a}`, hint: 'Count from the lower temperature up to the higher one.' }); });
    } else if (t === 6) {
      o.push(() => { const a = r.int(-15, -4), b = r.int(8, 20); q = num(`A submarine is at ${fmt(a * 2)} m (below sea level). It rises ${b} m. Where is it now? (in metres)`, a * 2 + b, { unit: 'm', sol: `${a * 2} + ${b} = ${a * 2 + b}`, hint: 'Rising moves toward zero.' }); });
      o.push(() => { const a = r.int(-20, -5), b = r.int(-9, -2); q = num(`${fmt(a)} − (${fmt(b)}) = ?`, a - b, { sol: `Subtracting a negative = adding: ${fmt(a)} + ${-b} = ${fmt(a - b)}`, hint: 'Two minus signs together make a plus.' }); });
    } else if (t === 7) {
      o.push(() => { const a = r.int(-9, -2), b = r.int(-9, -2); q = num(`(${fmt(a)}) × (${fmt(b)}) = ?`, a * b, { sol: `Negative × negative = positive: ${a * b}`, hint: 'Two negatives multiplied give a positive.' }); });
      o.push(() => { const a = r.int(-12, -3), b = r.int(2, 9); q = num(`(${fmt(a * b)}) ÷ ${b} = ?`, a, { sol: `${fmt(a * b)} ÷ ${b} = ${fmt(a)}`, hint: 'Negative ÷ positive = negative.' }); });
      o.push(() => { const a = r.int(-9, -2), b = r.int(-9, 9); q = num(`${fmt(a)} − (${fmt(b)}) = ?`, a - b, { sol: `${fmt(a)} − (${fmt(b)}) = ${fmt(a)} + ${fmt(-b)} = ${fmt(a - b)}`, hint: 'Subtracting a number is adding its opposite.' }); });
    } else {
      o.push(() => { const a = r.int(2, 4); q = num(`(−${a})<sup>3</sup> + ${a ** 3 + r.int(1, 5)} = ?`, 0, { sol: 'x', hint: 'x' }); const k = r.int(1, 5); q = num(`(−${a})³ + ${a ** 3 + k} = ?`, k, { sol: `(−${a})³ = −${a ** 3}; −${a ** 3} + ${a ** 3 + k} = ${k}`, hint: 'Negative × negative × negative = negative.' }); });
      o.push(() => { const a = r.int(2, 9); q = num(`(−${a})² − ${a}² = ?`, 0, { sol: `(−${a})² = ${a * a} and ${a}² = ${a * a}; the difference is 0`, hint: 'Square a negative and what do you get?' }); });
      o.push(() => { const a = r.int(-9, -3), b = r.int(-6, -2), c = r.int(2, 6); q = num(`(${fmt(a)}) × (${fmt(b)}) + (${fmt(-c * 3)}) ÷ ${c} = ?`, a * b - 3, { sol: `${a * b} + (${-c * 3 / c}) = ${a * b - 3}`, hint: 'Do × and ÷ first, then add.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Squares and roots ---------- */
  G.roots = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 4) {
      o.push(() => { const n = r.int(2, 9); q = num(`This square array has ${n} rows and ${n} columns. How many dots is that? (A square number!)`, n * n, { svg: M.dotArray(n, n), sol: `${n} × ${n} = ${n * n}`, hint: 'Rows × columns.', desc: `${n} by ${n} array of dots` }); });
      o.push(() => { const n = r.int(3, 10); q = num(`${n} × ${n} = ?  (That is ${n}² – "${n} squared".)`, n * n, { sol: `${n} × ${n} = ${n * n}`, hint: 'Squared means multiplied by itself.' }); });
    } else if (t === 5) {
      o.push(() => { const n = r.int(6, 15); q = num(`${n}² = ?`, n * n, { sol: `${n} × ${n} = ${n * n}`, hint: n > 12 ? 'Try ' + n + ' × 10 plus ' + n + ' × ' + (n - 10) + '.' : 'Use your times tables.' }); });
      o.push(() => { const n = r.int(4, 15); q = num(`√${n * n} = ?`, n, { sol: `${n} × ${n} = ${n * n}, so √${n * n} = ${n}`, hint: 'Which number times itself gives ' + n * n + '?' }); });
      o.push(() => { const n = r.int(4, 14); q = num(`A square garden has an area of ${n * n} m². How long is each side?`, n, { unit: 'm', sol: `Side = √${n * n} = ${n}`, hint: 'Area of a square = side × side.' }); });
    } else if (t === 6) {
      o.push(() => { const n = r.int(2, 6); q = num(`${n}³ = ?  (${n} × ${n} × ${n})`, n ** 3, { sol: `${n} × ${n} = ${n * n}; × ${n} = ${n ** 3}`, hint: 'Cubed means three of them multiplied together.' }); });
      o.push(() => { const n = r.pick([2, 3, 4, 5, 6, 10]); q = num(`∛${n ** 3} = ?  (the cube root)`, n, { sol: `${n} × ${n} × ${n} = ${n ** 3}`, hint: 'Which number cubed makes this?' }); });
      o.push(() => { const k = r.int(4, 12), n = k * k + r.int(2, 2 * k - 1) - 1; const lo = Math.floor(Math.sqrt(n)); q = num(`√${n} lies between ${lo} and which whole number?`, lo + 1, { sol: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}; ${n} is in between`, hint: 'Find the two square numbers either side of ' + n + '.' }); });
      o.push(() => { const n = r.int(5, 12); q = num(`A square has an area of ${n * n} cm². What is its perimeter?`, 4 * n, { unit: 'cm', sol: `Side = √${n * n} = ${n}; perimeter = 4 × ${n} = ${4 * n}`, hint: 'First find the side length.' }); });
    } else if (t === 7) {
      o.push(() => { const a = r.pick([[3, 4], [6, 8], [5, 12], [8, 6]]); q = num(`√(${a[0] ** 2} + ${a[1] ** 2}) = ?`, Math.sqrt(a[0] ** 2 + a[1] ** 2), { sol: `${a[0] ** 2} + ${a[1] ** 2} = ${a[0] ** 2 + a[1] ** 2}; √ = ${Math.sqrt(a[0] ** 2 + a[1] ** 2)}`, hint: 'Do the addition under the root sign first.' }); });
      o.push(() => { const n = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9]); q = num(`√${fmt(rd(n * n, 2))} = ?`, n, { sol: `${n} × ${n} = ${rd(n * n, 2)}`, hint: 'Think: what decimal times itself gives this? Count decimal places.' }); });
      o.push(() => { const n = r.int(2, 9), d = r.pick([2, 3, 4, 5]); q = num(`${n * n} ÷ ${n} + √${n * n} = ?`, n + n, { sol: `${n * n} ÷ ${n} = ${n}; √${n * n} = ${n}; total ${2 * n}`, hint: 'Handle each part separately.' }); });
      o.push(() => { const n = r.int(11, 25); q = num(`${n}² = ?`, n * n, { sol: `${n} × ${n} = ${n * n}`, hint: 'Use (' + n + ' × 10) + (' + n + ' × ' + (n - 10) + ').' }); });
      o.push(() => { const n = r.pick([1.5, 2.5, 0.5, 1.2, 3.5]); q = num(`${fmt(n)}² = ?`, n * n, { sol: `${fmt(n)} × ${fmt(n)} = ${fmt(rd(n * n, 4))}`, hint: 'Multiply as whole numbers, then place the decimal point.' }); });
    } else {
      o.push(() => { const n = r.int(50, 150), lo = Math.floor(Math.sqrt(n)), near = Math.sqrt(n) - lo < 0.5 ? lo : lo + 1; q = num(`√${n} is closest to which whole number?`, near, { sol: `${lo}² = ${lo * lo} and ${(lo + 1) ** 2} = ${(lo + 1) ** 2}; ${n} is nearer to ${near}²`, hint: 'Find the perfect squares on either side, see which is closer.' }); });
      o.push(() => { const a = r.int(2, 5), b = r.int(2, 5); q = num(`√(${a ** 2} × ${b ** 2}) = ?`, a * b, { sol: `√(${a ** 2 * b ** 2}) = ${a * b}. Or √${a ** 2} × √${b ** 2} = ${a} × ${b}`, hint: 'You can take the root of each factor separately.' }); });
      o.push(() => { const n = r.pick([27, 64, 125, 216, 343, 512, 1000]); q = num(`∛${n} = ?`, Math.round(Math.cbrt(n)), { sol: `${Math.round(Math.cbrt(n))}³ = ${n}`, hint: 'Which whole number cubed gives this?' }); });
      o.push(() => { const n = r.int(2, 9); q = num(`If x² = ${(n * 5) ** 2} and x is positive, what is x?`, n * 5, { sol: `x = √${(n * 5) ** 2} = ${n * 5}`, hint: 'Square root undoes squaring.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Indices ---------- */
  G.indices = (r, L) => {
    const t = Math.max(5, T(L)), o = []; let q; const S = sup;
    if (t === 5) {
      o.push(() => { const b = r.pick([2, 3, 4, 5, 10]), e = r.int(2, b <= 3 ? 4 : 3); q = num(`${S(b, e)} means ${Array(e).fill(b).join(' × ')}. What is its value?`, b ** e, { sol: `${Array(e).fill(b).join(' × ')} = ${b ** e}`, hint: 'Multiply the base by itself, exponent times.' }); });
      o.push(() => { const b = r.pick([2, 3, 5, 7]), e = r.int(2, 5); q = num(`Write ${Array(e).fill(b).join(' × ')} as a power of ${b}. What is the <b>exponent</b> (small number)?`, e, { sol: `${b} appears ${e} times → ${S(b, e)}`, hint: 'Count how many times the base is written.' }); });
    } else if (t === 6) {
      o.push(() => { const e = r.int(2, 6); q = num(`${S(10, e)} = ?`, 10 ** e, { sol: `1 followed by ${e} zeros = ${fmt(10 ** e)}`, hint: 'The exponent tells you how many zeros.' }); });
      o.push(() => { const k = r.int(2, 9), e = r.int(2, 5); q = num(`${k} × ${S(10, e)} = ?`, k * 10 ** e, { sol: `${k} followed by ${e} zeros = ${fmt(k * 10 ** e)}`, hint: '10 to a power gives zeros; multiply by ' + k + '.' }); });
      o.push(() => { const b = r.pick([2, 3, 4]), e = r.int(3, 5); q = num(`${S(b, e)} = ?`, b ** e, { sol: `${Array(e).fill(b).join(' × ')} = ${b ** e}`, hint: 'Multiply step by step.' }); });
      o.push(() => { const a = r.pick([[2, 5], [3, 4], [2, 6], [5, 3], [4, 3], [3, 3]]); const A = a[0] ** a[1], Bv = a[1] ** a[0]; q = { prompt: `Which is bigger: ${S(a[0], a[1])} or ${S(a[1], a[0])}?`, type: 'mc', choices: [`${a[0]}^${a[1]} = ${A}`, `${a[1]}^${a[0]} = ${Bv}`, 'They are equal'], answer: String(A > Bv ? 0 : A < Bv ? 1 : 2), sol: `${A} vs ${Bv}`, hint: 'Work both out. The exponent is NOT a multiplier!' }; q.choices = [`${a[0]} to the power ${a[1]}`, `${a[1]} to the power ${a[0]}`, 'They are equal']; });
    } else if (t === 7) {
      o.push(() => { const b = r.pick([2, 3, 5, 7, 10]), m = r.int(2, 6), n = r.int(2, 6); q = num(`${S(b, m)} × ${S(b, n)} = ${S(b, B)}.  Find the missing exponent.`, m + n, { sol: `Same base, ADD the exponents: ${m} + ${n} = ${m + n}`, hint: 'Index law for multiplying: add the powers.' }); });
      o.push(() => { const b = r.pick([2, 3, 5, 10]), n = r.int(2, 5), m = n + r.int(1, 5); q = num(`${S(b, m)} ÷ ${S(b, n)} = ${S(b, B)}.  Find the missing exponent.`, m - n, { sol: `Same base, SUBTRACT the exponents: ${m} − ${n} = ${m - n}`, hint: 'Index law for dividing: subtract the powers.' }); });
      o.push(() => { const b = r.pick([2, 3, 5]), m = r.int(2, 4), n = r.int(2, 4); q = num(`(${S(b, m)})<sup>${n}</sup> = ${S(b, B)}.  Find the missing exponent.`, m * n, { sol: `Power of a power: MULTIPLY: ${m} × ${n} = ${m * n}`, hint: 'Index law for a power of a power: multiply the powers.' }); });
      o.push(() => { const b = r.pick([2, 3, 4, 5, 7, 9]); q = num(`${S(b, 0)} = ?  and then add ${S(b, 1)}. What is ${S(b, 0)} + ${S(b, 1)}?`, 1 + b, { sol: `Any number to the power 0 is 1; the power 1 is the number itself. 1 + ${b} = ${1 + b}`, hint: 'Anything to the power 0 equals 1.' }); });
      o.push(() => { const b = r.pick([2, 3]), m = r.int(2, 3), n = r.int(1, 3); q = num(`Work out ${S(b, m)} × ${S(b, n)}.  (Give the final number.)`, b ** (m + n), { sol: `${S(b, m + n)} = ${b ** (m + n)}`, hint: 'Add the powers, then calculate.' }); });
    } else {
      o.push(() => { const b = r.pick([2, 3, 5]), m = r.int(4, 7), n = r.int(2, 3), k = r.int(1, 3); q = num(`${S(b, m)} × ${S(b, n)} ÷ ${S(b, k)} = ${S(b, B)}.  Find the missing exponent.`, m + n - k, { sol: `${m} + ${n} − ${k} = ${m + n - k}`, hint: 'Add for × and subtract for ÷.' }); });
      o.push(() => { const b = r.pick([2, 3]), m = r.int(2, 3), n = r.int(2, 3), k = r.int(1, m * n - 1); q = num(`(${S(b, m)})<sup>${n}</sup> ÷ ${S(b, k)} = ${S(b, B)}.  Find the missing exponent.`, m * n - k, { sol: `${m} × ${n} = ${m * n}; ${m * n} − ${k} = ${m * n - k}`, hint: 'Power of a power first: multiply. Then divide: subtract.' }); });
      o.push(() => { const a = r.int(2, 9), e = r.int(2, 5); const v = rd(a + r.int(1, 9) / 10, 1); q = num(`${fmt(v)} × 10<sup>${e}</sup> written as an ordinary number is?`, v * 10 ** e, { sol: `Move the decimal point ${e} places right: ${fmt(v * 10 ** e)}`, hint: 'Scientific notation: multiply moves the point right.' }); });
      o.push(() => { const e = r.int(2, 5); q = num(`Negative powers mean "divide". Write ${S(10, -e)} as a decimal.`, 10 ** -e, { sol: `10 to a negative power: ${fmt(10 ** -e)}`, hint: 'Negative power means divide: 10<sup>−2</sup> = 1 ÷ 100 = 0.01' }); });
      o.push(() => { const b = r.pick([2, 3]), n = r.int(2, 3); q = num(`(${b} × ${b + 1})<sup>${n}</sup> = ?`, ((b) * (b + 1)) ** n, { sol: `${b} × ${b + 1} = ${b * (b + 1)}; ${b * (b + 1)}^${n} = ${(b * (b + 1)) ** n}`, hint: 'Do the bracket first.' }); });
    }
    run(r, o); return q;
  };

  /* ---------- Measurement conversions ---------- */
  G.measure = (r, L) => {
    const t = T(L), o = []; let q;
    if (t <= 2) {
      o.push(() => { const len = r.int(3, 9); q = num(`How long is the pencil in centimetres?`, len, { unit: 'cm', svg: M.ruler(len, 10), desc: `pencil ${len} cm against a ruler`, sol: `The pencil ends at ${len} on the ruler.`, hint: 'The pencil starts at 0. Read where it ends.' }); });
      o.push(() => { const a = r.int(2, 9); q = num(`1 metre = 100 cm. How many centimetres are in ${a} metres?`, a * 100, { unit: 'cm', sol: `${a} × 100 = ${a * 100}`, hint: 'Each metre is 100 cm.' }); });
    } else if (t === 3) {
      o.push(() => { const a = r.int(2, 9); q = num(`${a} m = ? cm`, a * 100, { unit: 'cm', sol: `${a} × 100 = ${a * 100}`, hint: '1 m = 100 cm.' }); });
      o.push(() => { const a = r.int(2, 9); q = num(`${a} kg = ? g`, a * 1000, { unit: 'g', sol: `${a} × 1000 = ${a * 1000}`, hint: '1 kg = 1000 g.' }); });
      o.push(() => { const a = r.int(2, 9), b = r.int(10, 90); q = num(`A ribbon is ${a} m ${b} cm long. How many centimetres is that?`, a * 100 + b, { unit: 'cm', sol: `${a * 100} + ${b} = ${a * 100 + b}`, hint: 'Change the metres to cm, then add.' }); });
    } else if (t === 4) {
      o.push(() => { const a = r.int(2, 9), b = r.int(100, 900); q = num(`${a} km ${b} m = ? m`, a * 1000 + b, { unit: 'm', sol: `${a * 1000} + ${b} = ${a * 1000 + b}`, hint: '1 km = 1000 m.' }); });
      o.push(() => { const a = r.int(2, 9); q = num(`${a} L = ? mL`, a * 1000, { unit: 'mL', sol: `${a} × 1000`, hint: '1 L = 1000 mL.' }); });
      o.push(() => { const a = r.int(2, 9) * 500; q = num(`${a} g = ? kg`, a / 1000, { unit: 'kg', sol: `${a} ÷ 1000 = ${fmt(a / 1000)}`, hint: 'Divide by 1000 to go from g to kg.' }); });
    } else if (t === 5) {
      o.push(() => { const a = r.int(11, 99); q = num(`${a} mm = ? cm`, a / 10, { unit: 'cm', sol: `${a} ÷ 10 = ${fmt(a / 10)}`, hint: '10 mm = 1 cm.' }); });
      o.push(() => { const a = rd(r.int(11, 99) / 10, 1); q = num(`${fmt(a)} kg = ? g`, a * 1000, { unit: 'g', sol: `${fmt(a)} × 1000 = ${fmt(a * 1000)}`, hint: '1 kg = 1000 g' }); });
      o.push(() => { const a = r.int(2, 5), b = r.int(20, 80); q = num(`${a} m ${b} cm − 95 cm = ? cm`, a * 100 + b - 95, { unit: 'cm', sol: `${a * 100 + b} − 95 = ${a * 100 + b - 95}`, hint: 'Same units first.' }); });
    } else if (t === 6) {
      o.push(() => { const a = rd(r.int(11, 99) / 10, 1); q = num(`${fmt(a)} km = ? m`, a * 1000, { unit: 'm', sol: `× 1000 = ${fmt(a * 1000)}`, hint: '1 km = 1000 m' }); });
      o.push(() => { const a = r.int(150, 4500); q = num(`${fmt(a)} mL = ? L`, a / 1000, { unit: 'L', sol: `÷ 1000 = ${fmt(a / 1000)}`, hint: '1000 mL = 1 L.' }); });
      o.push(() => { const a = r.int(2, 9), b = r.int(2, 9); q = num(`${a} bottles hold ${fmt(b * 250)} mL each. How many <b>litres</b> is that altogether?`, a * b * 0.25, { unit: 'L', sol: `${a} × ${b * 250} = ${a * b * 250} mL = ${fmt(a * b * 0.25)} L`, hint: 'Find total mL first, then convert.' }); });
    } else {
      o.push(() => { const a = r.int(2, 9); q = num(`1 m² = 10 000 cm². How many cm² are in ${a} m²?`, a * 10000, { unit: 'cm²', sol: `${a} × 10 000 = ${fmt(a * 10000)}`, hint: '1 m = 100 cm so 1 m² = 100 × 100 cm².' }); });
      o.push(() => { const a = rd(r.int(2, 9) / 2, 1); q = num(`1 m³ = 1000 L. How many litres in ${fmt(a)} m³?`, a * 1000, { unit: 'L', sol: `${fmt(a)} × 1000 = ${fmt(a * 1000)}`, hint: '1 m³ is 1000 L.' }); });
      o.push(() => { const s = r.pick([36, 72, 108, 144]); q = num(`Change ${s} km/h to m/s.`, s / 3.6, { unit: 'm/s', sol: `${s} ÷ 3.6 = ${s / 3.6}`, hint: '1 km/h = 1000 m ÷ 3600 s.' }); });
    }
    run(r, o); return q;
  };
})(typeof window !== 'undefined' ? window : globalThis);

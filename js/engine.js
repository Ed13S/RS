/* MathQuest engine: seeded RNG, helpers, SVG diagram builders, answer checking */
(function (g) {
  'use strict';

  /* ---------- Seeded random ---------- */
  class RNG {
    constructor(seed) { this.s = (seed >>> 0) || 1; }
    next() {
      this.s = (this.s + 0x6D2B79F5) >>> 0;
      let t = this.s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    chance(p) { return this.next() < p; }
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    }
  }

  /* ---------- Helpers ---------- */
  const NAMES = ['Mia', 'Leo', 'Zara', 'Sam', 'Ava', 'Noah', 'Ruby', 'Kai', 'Isla', 'Ben', 'Lily', 'Max', 'Chloe', 'Jack', 'Ella', 'Oscar', 'Priya', 'Tom', 'Grace', 'Ali', 'Nina', 'Finn'];
  const ITEMS = ['stickers', 'marbles', 'trading cards', 'shells', 'pencils', 'stamps', 'beads', 'coins', 'bouncy balls', 'sea-glass pieces'];
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const rd = (x, p = 6) => Math.round(x * Math.pow(10, p)) / Math.pow(10, p);
  const T = L => Math.max(1, Math.min(8, Math.round(L)));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const strip = h => String(h).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/\s+/g, ' ').trim();
  function fmt(n) {
    n = rd(n, 6);
    let s = String(n);
    if (s.indexOf('e') >= 0) s = n.toFixed(6).replace(/\.?0+$/, '');
    const neg = s[0] === '-'; if (neg) s = s.slice(1);
    let [i, d] = s.split('.');
    if (i.length >= 5) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + i + (d ? '.' + d : '');
  }
  const raw = n => String(rd(n, 6));
  const mon = n => '$' + (Number.isInteger(rd(n, 6)) ? rd(n, 6) : rd(n, 6).toFixed(2));
  const sup = (b, e) => `${b}<sup>${e}</sup>`;
  const frac = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
  const B = '<span class="box">?</span>';

  /* ---------- SVG building blocks ---------- */
  const C = { ink: '#2b2d42', blue: '#4d9de0', green: '#3bb273', yellow: '#ffd166', pink: '#ff6b9d', orange: '#ff9f1c', purple: '#8f6bd9', red: '#ef476f', teal: '#2ec4b6', light: '#eaf3ff', grey: '#c9d1e3' };
  const svg = (w, h, inner, desc) => `<svg viewBox="0 0 ${w} ${h}" class="dgm" role="img" aria-label="${esc(desc || 'diagram')}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito,Arial,sans-serif">${inner}</svg>`;
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.s || 14}" font-weight="${o.w || 700}" fill="${o.c || C.ink}"${o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ''}>${s}</text>`;
  const ln = (x1, y1, x2, y2, c = C.ink, w = 2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const rc = (x, y, w, h, fill, stroke = C.ink, sw = 2, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const poly = (pts, fill, stroke = C.ink, sw = 2) => `<polygon points="${pts.map(p => p[0] + ',' + p[1]).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const circ = (x, y, r, fill, stroke = C.ink, sw = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  // grid of unit cells; cells = [[x,y],...]
  function cellGrid(cells, cols, rows, cs = 26, fill = C.blue) {
    const set = new Set(cells.map(c => c[0] + ',' + c[1]));
    let o = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
      o += rc(10 + x * cs, 10 + y * cs, cs, cs, set.has(x + ',' + y) ? fill : '#fff', C.ink, 1.2);
    return svg(cols * cs + 20, rows * cs + 20, o, 'grid of squares with some shaded');
  }
  function dotArray(rows, cols) {
    let o = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) o += circ(22 + x * 30, 22 + y * 30, 11, [C.pink, C.blue, C.orange, C.green, C.purple][y % 5], '#fff', 1);
    return svg(cols * 30 + 14, rows * 30 + 14, o, `array of dots, ${rows} rows of ${cols}`);
  }
  function fracBar(n, d, color = C.orange) {
    const w = Math.min(420, d * 52), cw = w / d; let o = '';
    for (let i = 0; i < d; i++) o += rc(10 + i * cw, 10, cw, 44, i < n ? color : '#fff', C.ink, 2);
    return svg(w + 20, 64, o, `bar split into ${d} equal parts, ${n} shaded`);
  }
  function fracCircle(n, d, color = C.pink) {
    const cx = 70, cy = 70, r = 58; let o = '';
    if (d === 1) o += circ(cx, cy, r, n ? color : '#fff');
    else for (let i = 0; i < d; i++) {
      const a1 = -Math.PI / 2 + i * 2 * Math.PI / d, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / d;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1), x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      o += `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${2 / d > 1 ? 1 : 0} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${i < n ? color : '#fff'}" stroke="${C.ink}" stroke-width="2"/>`;
    }
    return svg(140, 140, o, `circle split into ${d} equal parts, ${n} shaded`);
  }
  function fracGrid(n, rows, cols, color = C.green) {
    const cells = []; for (let i = 0; i < n; i++) cells.push([i % cols, Math.floor(i / cols)]);
    return cellGrid(cells, cols, rows, 28, color);
  }
  function barChart(labels, vals, o = {}) {
    const W = 420, H = 250, L = 44, Bm = 40, Tp = 28, max = o.max || Math.ceil(Math.max(...vals) / (o.step || 1)) * (o.step || 1), step = o.step || Math.max(1, Math.ceil(max / 6));
    const bw = (W - L - 14) / vals.length; let s = '';
    if (o.title) s += tx(W / 2, 16, esc(o.title), { s: 14 });
    for (let v = 0; v <= max; v += step) { const y = H - Bm - (v / max) * (H - Bm - Tp); s += ln(L, y, W - 10, y, '#dbe3f3', 1) + tx(L - 6, y + 4, v, { a: 'end', s: 11, w: 600 }); }
    s += ln(L, Tp, L, H - Bm, C.ink, 2) + ln(L, H - Bm, W - 10, H - Bm, C.ink, 2);
    vals.forEach((v, i) => {
      const h = (v / max) * (H - Bm - Tp), x = L + i * bw + bw * 0.18;
      s += rc(x, H - Bm - h, bw * 0.64, h, [C.blue, C.pink, C.orange, C.green, C.purple, C.teal, C.red][i % 7], C.ink, 1.5, 3) + tx(L + i * bw + bw / 2, H - Bm + 16, esc(labels[i]), { s: 11 });
    });
    if (o.yLabel) s += tx(12, H / 2, esc(o.yLabel), { s: 11, r: -90 });
    return svg(W, H, s, 'bar chart: ' + labels.map((l, i) => l + ' ' + vals[i]).join(', '));
  }
  function lineChart(labels, vals, o = {}) {
    const W = 420, H = 250, L = 44, Bm = 40, Tp = 28, step = o.step || 5, max = Math.ceil(Math.max(...vals) / step) * step;
    const dx = (W - L - 24) / (vals.length - 1); let s = '';
    if (o.title) s += tx(W / 2, 16, esc(o.title), { s: 14 });
    for (let v = 0; v <= max; v += step) { const y = H - Bm - (v / max) * (H - Bm - Tp); s += ln(L, y, W - 10, y, '#dbe3f3', 1) + tx(L - 6, y + 4, v, { a: 'end', s: 11, w: 600 }); }
    s += ln(L, Tp, L, H - Bm, C.ink, 2) + ln(L, H - Bm, W - 10, H - Bm, C.ink, 2);
    const pts = vals.map((v, i) => [L + 12 + i * dx, H - Bm - (v / max) * (H - Bm - Tp)]);
    s += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="3"/>`;
    pts.forEach((p, i) => { s += circ(p[0], p[1], 5, C.pink, C.ink, 1.5) + tx(p[0], H - Bm + 16, esc(labels[i]), { s: 11 }); });
    return svg(W, H, s, 'line graph: ' + labels.map((l, i) => l + ' ' + vals[i]).join(', '));
  }
  function spinner(labels, colors) {
    const n = labels.length, cx = 100, cy = 100, r = 88; let o = '';
    for (let i = 0; i < n; i++) {
      const a1 = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n, am = (a1 + a2) / 2;
      o += `<path d="M${cx},${cy} L${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)} A${r},${r} 0 0 1 ${(cx + r * Math.cos(a2)).toFixed(1)},${(cy + r * Math.sin(a2)).toFixed(1)} Z" fill="${(colors || [C.pink, C.yellow, C.blue, C.green, C.orange, C.purple, C.teal, C.red])[i % 8]}" stroke="${C.ink}" stroke-width="2"/>`;
      o += tx((cx + r * 0.62 * Math.cos(am)).toFixed(1), (cy + r * 0.62 * Math.sin(am) + 6).toFixed(1), esc(labels[i]), { s: 20 });
    }
    o += circ(cx, cy, 6, C.ink) + `<polygon points="${cx},${cy - 4} ${cx - 8},${cy - 26} ${cx + 8},${cy - 26}" fill="${C.ink}"/>`;
    return svg(200, 200, o, 'spinner with sections: ' + labels.join(', '));
  }
  function numberLine(min, max, step, marker, o = {}) {
    const W = 460, L = 24, R = W - 24, y = 54, sx = v => L + (v - min) / (max - min) * (R - L); let s = ln(L - 10, y, R + 10, y, C.ink, 3);
    const lab = o.labelEvery || 1;
    let i = 0;
    for (let v = min; v <= max + 1e-9; v = rd(v + step, 6), i++) {
      s += ln(sx(v), y - 8, sx(v), y + 8, C.ink, 2);
      if (i % lab === 0) s += tx(sx(v), y + 26, o.fmt ? o.fmt(v) : String(v).replace('-', '−'), { s: 12 });
    }
    if (marker !== undefined) s += `<polygon points="${sx(marker)},${y - 4} ${sx(marker) - 8},${y - 26} ${sx(marker) + 8},${y - 26}" fill="${C.red}" stroke="${C.ink}" stroke-width="1.5"/>`;
    return svg(W, 90, s, 'number line from ' + min + ' to ' + max + (marker !== undefined ? ' with an arrow' : ''));
  }
  function clock(h, m) {
    const cx = 80, cy = 80, r = 68; let o = circ(cx, cy, r, '#fff', C.ink, 3);
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; o += tx((cx + (r - 14) * Math.cos(a)).toFixed(1), (cy + (r - 14) * Math.sin(a) + 5).toFixed(1), i, { s: 14 }); }
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30 - Math.PI / 2, l = i % 5 === 0 ? 5 : 2.5; o += ln(cx + (r - 2) * Math.cos(a), cy + (r - 2) * Math.sin(a), cx + (r - 2 - l) * Math.cos(a), cy + (r - 2 - l) * Math.sin(a), C.ink, 1); }
    const ha = ((h % 12) + m / 60) * Math.PI / 6 - Math.PI / 2, ma = m * Math.PI / 30 - Math.PI / 2;
    o += ln(cx, cy, cx + 36 * Math.cos(ha), cy + 36 * Math.sin(ha), C.ink, 5) + ln(cx, cy, cx + 54 * Math.cos(ma), cy + 54 * Math.sin(ma), C.red, 3) + circ(cx, cy, 4, C.ink);
    return svg(160, 160, o, `analogue clock showing ${h}:${String(m).padStart(2, '0')}`);
  }
  function rectLabeled(w, h, wl, hl, o = {}) {
    const sc = Math.min(260 / w, 150 / h), pw = w * sc, ph = h * sc, x0 = 50, y0 = 24; let s = rc(x0, y0, pw, ph, o.fill || '#d9ecff', C.ink, 3);
    s += tx(x0 + pw / 2, y0 + ph + 20, wl, { s: 15 }) + tx(x0 - 10, y0 + ph / 2 + 5, hl, { a: 'end', s: 15 });
    if (o.cap) s += tx(x0 + pw / 2, y0 + ph / 2 + 6, o.cap, { s: 15, c: C.purple });
    return svg(x0 + pw + 50, y0 + ph + 34, s, `rectangle labelled ${wl} by ${hl}`);
  }
  function isoCuboid(a, b, c, cs = 26) {
    const k = Math.cos(Math.PI / 6) * cs, P = (x, y, z) => [(x - y) * k, (x + y) * 0.5 * cs - z * cs];
    const faces = [];
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) faces.push([[P(i, j, c), P(i + 1, j, c), P(i + 1, j + 1, c), P(i, j + 1, c)], '#c8f0d8']);
    for (let j = 0; j < b; j++) for (let kk = 0; kk < c; kk++) faces.push([[P(a, j, kk), P(a, j + 1, kk), P(a, j + 1, kk + 1), P(a, j, kk + 1)], '#8fd6ae']);
    for (let i = 0; i < a; i++) for (let kk = 0; kk < c; kk++) faces.push([[P(i, b, kk), P(i + 1, b, kk), P(i + 1, b, kk + 1), P(i, b, kk + 1)], '#5cb98a']);
    const all = faces.flatMap(f => f[0]), minx = Math.min(...all.map(p => p[0])), maxx = Math.max(...all.map(p => p[0])), miny = Math.min(...all.map(p => p[1])), maxy = Math.max(...all.map(p => p[1]));
    const ox = 12 - minx, oy = 12 - miny;
    const s = faces.map(f => poly(f[0].map(p => [(p[0] + ox).toFixed(1), (p[1] + oy).toFixed(1)]), f[1], C.ink, 1.2)).join('');
    return svg(maxx - minx + 24, maxy - miny + 24, s, `block of unit cubes ${a} long, ${b} wide, ${c} high`);
  }
  function boxLabeled(l, w, h, o = {}) {
    const sx = 20, sy = 14, ox = 60, oy = 90 + 0, bw = 150, bh = 80;
    const A = [ox, oy], Bp = [ox + bw, oy], Cp = [ox + bw, oy + bh], D = [ox, oy + bh];
    const dx = 70, dy = -48;
    let s = poly([D, Cp, [Cp[0] + dx, Cp[1] + dy], [D[0] + dx, D[1] + dy]], '#cfe8ff') + '';
    s = poly([A, Bp, Cp, D], '#e6f3ff') + poly([A, Bp, [Bp[0] + dx, Bp[1] + dy], [A[0] + dx, A[1] + dy]], '#ffffff') + poly([Bp, Cp, [Cp[0] + dx, Cp[1] + dy], [Bp[0] + dx, Bp[1] + dy]], '#bcdcff');
    s += tx(ox + bw / 2, oy + bh + 20, l, { s: 15 }) + tx(ox + bw + dx / 2 + 26, oy + bh + dy / 2 + 20, w, { s: 15, a: 'start' }) + tx(ox - 10, oy + bh / 2 + 5, h, { a: 'end', s: 15 });
    return svg(340, 190, s, `box with length ${l}, width ${w}, height ${h}`);
  }
  // fan of rays with arcs. rays: degrees (CCW from east). arcs: {a1,a2,label,color,r}
  function fan(rays, arcs, o = {}) {
    const cx = 160, cy = 130, R = 105; let s = '';
    const P = (a, r) => [cx + r * Math.cos(-a * Math.PI / 180), cy + r * Math.sin(-a * Math.PI / 180)];
    rays.forEach(a => { const p = P(a, R); s += ln(cx, cy, p[0], p[1], C.ink, 3); });
    [].concat(o.fullLine === undefined ? [] : o.fullLine).forEach(fl => { const p = P(fl + 180, R); s += ln(cx, cy, p[0], p[1], C.ink, 3); });
    arcs.forEach(ar => {
      const r = ar.r || 34, p1 = P(ar.a1, r), p2 = P(ar.a2, r), sw = ar.a2 - ar.a1, mid = P((ar.a1 + ar.a2) / 2, r + 18);
      if (ar.right) { const q1 = P(ar.a1, 22), q2 = P(ar.a2, 22), q3 = [q1[0] + q2[0] - cx, q1[1] + q2[1] - cy]; s += `<polyline points="${q1} ${q3} ${q2}" fill="none" stroke="${C.ink}" stroke-width="2"/>`; }
      else s += `<path d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${r},${r} 0 ${sw > 180 ? 1 : 0} 0 ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="none" stroke="${ar.color || C.red}" stroke-width="3"/>`;
      s += tx(mid[0].toFixed(1), (mid[1] + 5).toFixed(1), ar.label, { s: 15, c: ar.color || C.red });
    });
    s += circ(cx, cy, 4, C.ink);
    return svg(320, 190, s, 'angle diagram (not to scale)');
  }
  function crossLines(theta, labels) {
    // two lines crossing, labels for 4 angles [theta, 180-theta, theta, 180-theta]
    const o = fan([theta, 180 - 0], [], { fullLine: theta });
    return o;
  }
  function parallel(theta, givenReg, unkReg, givenLbl) {
    const W = 400, H = 200, y1 = 60, y2 = 150, tr = theta * Math.PI / 180, dx = (y2 - y1) / Math.tan(tr), p2 = [190, y2], p1 = [190 + dx, y1];
    let s = ln(30, y1, 370, y1, C.ink, 3) + ln(30, y2, 370, y2, C.ink, 3);
    s += `<polygon points="30,${y1 - 12} 46,${y1 - 4} 30,${y1 + 4}" fill="${C.purple}" transform="translate(20,4)"/>` + `<polygon points="30,${y2 - 12} 46,${y2 - 4} 30,${y2 + 4}" fill="${C.purple}" transform="translate(20,4)"/>`;
    const ex = (p2[0] - p1[0]) * 0.55, ey = (p2[1] - p1[1]) * 0.55;
    s += ln(p1[0] - ex, p1[1] - ey, p2[0] + ex, p2[1] + ey, C.ink, 3);
    const reg = { UR: [0, theta], UL: [theta, 180], LL: [180, 180 + theta], LR: [180 + theta, 360] };
    const lab = (p, r, txt, col) => {
      const [a1, a2] = reg[r], am = (a1 + a2) / 2 * Math.PI / 180, rr = 30;
      const pa = a => [p[0] + 22 * Math.cos(-a * Math.PI / 180), p[1] + 22 * Math.sin(-a * Math.PI / 180)];
      const q1 = pa(a1), q2 = pa(a2);
      return `<path d="M${q1[0].toFixed(1)},${q1[1].toFixed(1)} A22,22 0 0 0 ${q2[0].toFixed(1)},${q2[1].toFixed(1)}" fill="none" stroke="${col}" stroke-width="3"/>` + tx((p[0] + (rr + 10) * Math.cos(-am)).toFixed(1), (p[1] + (rr + 10) * Math.sin(-am) + 5).toFixed(1), txt, { s: 15, c: col });
    };
    s += lab(p1, givenReg, givenLbl, C.blue) + lab(p2, unkReg, 'x', C.red);
    s += tx(380, y1 - 8, '', {});
    return svg(W, H, s, 'two parallel lines cut by a transversal (not to scale)');
  }
  function triangleAngles(a, b, c, extra) {
    const A = [40, 170], Bp = [270, 170], Cp = [120, 30];
    let s = poly([A, Bp, Cp], '#fff7d6', C.ink, 3);
    s += tx(A[0] + 26, A[1] - 8, a, { s: 15, c: C.blue }) + tx(Bp[0] - 30, Bp[1] - 8, b, { s: 15, c: C.green }) + tx(Cp[0], Cp[1] + 28, c, { s: 15, c: C.red });
    return svg(310, 190, s, 'triangle with angle labels (not to scale)');
  }
  function quadAngles(l1, l2, l3, l4) {
    const P = [[40, 40], [250, 30], [270, 170], [30, 160]]; let s = poly(P, '#e9ffe9', C.ink, 3);
    s += tx(P[0][0] + 24, P[0][1] + 26, l1, { s: 15, c: C.blue }) + tx(P[1][0] - 24, P[1][1] + 26, l2, { s: 15, c: C.green }) + tx(P[2][0] - 28, P[2][1] - 12, l3, { s: 15, c: C.orange }) + tx(P[3][0] + 26, P[3][1] - 12, l4, { s: 15, c: C.red });
    return svg(310, 200, s, 'quadrilateral with angle labels (not to scale)');
  }
  function rightTri(a, b, c, o = {}) {
    // legs a (horizontal) and b (vertical), hypotenuse c
    const sc = Math.min(220 / a, 150 / b), pw = a * sc, ph = b * sc, x0 = 50, y0 = 20; const A = [x0, y0 + ph], Bp = [x0 + pw, y0 + ph], Cp = [x0, y0];
    let s = poly([A, Bp, Cp], '#ffe6ef', C.ink, 3) + `<polyline points="${x0 + 14},${y0 + ph} ${x0 + 14},${y0 + ph - 14} ${x0},${y0 + ph - 14}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    s += tx(x0 + pw / 2, y0 + ph + 22, o.la || a, { s: 15 }) + tx(x0 - 8, y0 + ph / 2 + 5, o.lb || b, { a: 'end', s: 15 }) + tx(x0 + pw / 2 + 14, y0 + ph / 2 - 6, o.lc || c, { s: 15, a: 'start', c: C.red });
    return svg(x0 + pw + 80, y0 + ph + 36, s, `right-angled triangle, sides ${a}, ${b}, hypotenuse ${c}`);
  }
  function coordGrid(max, pts, o = {}) {
    const mn = o.min || 0, n = max - mn, cs = Math.min(30, 300 / n), W = n * cs + 50, H = n * cs + 50, X = v => 30 + (v - mn) * cs, Y = v => 14 + (max - v) * cs; let s = '';
    for (let v = mn; v <= max; v++) { s += ln(X(v), Y(max), X(v), Y(mn), v === 0 ? C.ink : '#cfd8ec', v === 0 ? 2.5 : 1) + ln(X(mn), Y(v), X(max), Y(v), v === 0 ? C.ink : '#cfd8ec', v === 0 ? 2.5 : 1); s += tx(X(v), Y(mn) + 16, String(v).replace('-', '−'), { s: 10, w: 600 }); if (v !== mn) s += tx(22, Y(v) + 4, String(v).replace('-', '−'), { a: 'end', s: 10, w: 600 }); }
    if (o.poly) s += poly(o.poly.map(p => [X(p[0]), Y(p[1])]), 'rgba(77,157,224,.35)', C.blue, 2.5);
    pts.forEach((p, i) => { s += circ(X(p[0]), Y(p[1]), 6, p[2] || C.red, C.ink, 1.5); if (p[3]) s += tx(X(p[0]) + 10, Y(p[1]) - 8, p[3], { s: 14, a: 'start' }); });
    return svg(W, H, s, 'coordinate grid');
  }
  function machine(ops, inLabel, outLabel) {
    let s = '', x = 10; s += tx(x + 20, 52, inLabel, { s: 16, c: C.blue }); x += 48;
    ops.forEach(op => { s += ln(x, 44, x + 24, 44, C.ink, 3) + `<polygon points="${x + 24},38 ${x + 34},44 ${x + 24},50" fill="${C.ink}"/>`; x += 38; s += rc(x, 18, 66, 52, '#ffe9a8', C.ink, 3, 8) + tx(x + 33, 51, op, { s: 17 }); x += 66; });
    s += ln(x, 44, x + 24, 44, C.ink, 3) + `<polygon points="${x + 24},38 ${x + 34},44 ${x + 24},50" fill="${C.ink}"/>`; x += 44;
    s += tx(x + 14, 52, outLabel, { s: 16, c: C.red });
    return svg(x + 50, 90, s, 'function machine');
  }
  function tally(n) {
    let s = '', x = 14; const grp = Math.floor(n / 5), rem = n % 5;
    for (let g2 = 0; g2 < grp; g2++) { for (let i = 0; i < 4; i++) s += ln(x + i * 9, 10, x + i * 9, 42, C.ink, 3); s += ln(x - 5, 40, x + 32, 12, C.ink, 3); x += 48; }
    for (let i = 0; i < rem; i++) s += ln(x + i * 9, 10, x + i * 9, 42, C.ink, 3);
    return `<svg viewBox="0 0 ${Math.max(x + rem * 9 + 12, 60)} 52" class="tally" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  }
  function ruler(objLen, unitsCm) {
    const cm = 40, W = unitsCm * cm + 40; let s = rc(10, 62, unitsCm * cm + 20, 40, '#ffe9a8', C.ink, 2, 4);
    for (let i = 0; i <= unitsCm * 10; i++) { const x = 20 + i * cm / 10, h = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 7; s += ln(x, 62, x, 62 + h, C.ink, 1.3); if (i % 10 === 0) s += tx(x, 92, i / 10, { s: 12 }); }
    s += rc(20, 22, objLen * cm, 24, C.pink, C.ink, 2, 6) + tx(20 + objLen * cm / 2, 39, 'pencil', { s: 12, c: '#fff' });
    return svg(W, 112, s, `a pencil lined up against a ruler (length ${objLen} cm)`);
  }
  function lShape(w1, h1, w2, h2, labels) {
    // L shape: bottom rectangle w1 x h1, top-left part w2 x h2 (w2<w1) on top. total height h1+h2
    const sc = Math.min(230 / w1, 170 / (h1 + h2)), x0 = 40, y0 = 20;
    const P = [[0, 0], [w2, 0], [w2, h2], [w1, h2], [w1, h1 + h2], [0, h1 + h2]].map(p => [x0 + p[0] * sc, y0 + p[1] * sc]);
    let s = poly(P, '#d8f5e3', C.ink, 3);
    s += tx(x0 + w2 * sc / 2, y0 - 6, labels[0], { s: 14 }) + tx(x0 - 6, y0 + h2 * sc / 2 + 5, labels[1], { a: 'end', s: 14 }) + tx(x0 + w1 * sc / 2, y0 + (h1 + h2) * sc + 18, labels[2], { s: 14 }) + tx(x0 + w1 * sc + 8, y0 + (h2 + h1 / 2) * sc + 5, labels[3], { a: 'start', s: 14 });
    return svg(x0 + w1 * sc + 60, y0 + (h1 + h2) * sc + 28, s, 'L-shaped figure (not to scale)');
  }
  function triShape(base, h, bl, hl, extra) {
    const sc = Math.min(240 / base, 150 / h), pw = base * sc, ph = h * sc, x0 = 30, y0 = 20, ap = x0 + (extra !== undefined ? extra * sc : pw / 2);
    let s = poly([[x0, y0 + ph], [x0 + pw, y0 + ph], [ap, y0]], '#fff0c9', C.ink, 3) + ln(ap, y0, ap, y0 + ph, C.red, 2, 'stroke-dasharray="6 4"') + `<polyline points="${ap + 12},${y0 + ph} ${ap + 12},${y0 + ph - 12} ${ap},${y0 + ph - 12}" fill="none" stroke="${C.red}" stroke-width="1.5"/>`;
    s += tx(x0 + pw / 2, y0 + ph + 20, bl, { s: 15 }) + tx(ap + 8, y0 + ph / 2 + 4, hl, { a: 'start', s: 15, c: C.red });
    return svg(x0 + pw + 60, y0 + ph + 30, s, `triangle with base ${bl} and height ${hl}`);
  }
  function paraShape(base, h, bl, hl) {
    const sc = Math.min(200 / base, 140 / h), pw = base * sc, ph = h * sc, sl = 50, x0 = 30, y0 = 20;
    let s = poly([[x0 + sl, y0], [x0 + sl + pw, y0], [x0 + pw, y0 + ph], [x0, y0 + ph]], '#e8defa', C.ink, 3) + ln(x0 + sl, y0, x0 + sl, y0 + ph, C.red, 2, 'stroke-dasharray="6 4"');
    s += tx(x0 + pw / 2, y0 + ph + 20, bl, { s: 15 }) + tx(x0 + sl + 8, y0 + ph / 2 + 4, hl, { a: 'start', s: 15, c: C.red });
    return svg(x0 + pw + sl + 30, y0 + ph + 30, s, `parallelogram base ${bl} height ${hl}`);
  }
  function trapShape(a, b, h) {
    const sc = Math.min(220 / Math.max(a, b), 130 / h), pa = a * sc, pb = b * sc, ph = h * sc, x0 = 40, y0 = 28, off = (pb - pa) / 2;
    let s = poly([[x0 + off, y0], [x0 + off + pa, y0], [x0 + pb, y0 + ph], [x0, y0 + ph]], '#d9f2f0', C.ink, 3) + ln(x0 + off, y0, x0 + off, y0 + ph, C.red, 2, 'stroke-dasharray="6 4"');
    s += tx(x0 + off + pa / 2, y0 - 8, a, { s: 15 }) + tx(x0 + pb / 2, y0 + ph + 20, b, { s: 15 }) + tx(x0 + off + 8, y0 + ph / 2 + 4, h, { a: 'start', s: 15, c: C.red });
    return svg(x0 + pb + 40, y0 + ph + 32, s, `trapezium with parallel sides ${a} and ${b}, height ${h}`);
  }
  function circleShape(r, mode) {
    let s = circ(100, 90, 70, '#ffe1c7', C.ink, 3) + circ(100, 90, 3, C.ink);
    if (mode === 'd') s += ln(30, 90, 170, 90, C.red, 3) + tx(100, 78, 'diameter ' + r, { s: 14, c: C.red }); else s += ln(100, 90, 170, 90, C.red, 3) + tx(135, 80, 'radius ' + r, { s: 14, c: C.red });
    return svg(200, 180, s, 'circle with ' + (mode === 'd' ? 'diameter ' : 'radius ') + r);
  }
  function cylShape(r, h) {
    let s = `<ellipse cx="100" cy="150" rx="60" ry="18" fill="#bfe3ff" stroke="${C.ink}" stroke-width="3"/><rect x="40" y="40" width="120" height="110" fill="#bfe3ff" stroke="none"/><line x1="40" y1="40" x2="40" y2="150" stroke="${C.ink}" stroke-width="3"/><line x1="160" y1="40" x2="160" y2="150" stroke="${C.ink}" stroke-width="3"/><path d="M40,150 A60,18 0 0 0 160,150" fill="#bfe3ff" stroke="${C.ink}" stroke-width="3"/><ellipse cx="100" cy="40" rx="60" ry="18" fill="#e4f3ff" stroke="${C.ink}" stroke-width="3"/>`;
    s += ln(100, 40, 160, 40, C.red, 2.5) + tx(132, 34, 'r = ' + r, { s: 13, c: C.red }) + tx(172, 100, 'h = ' + h, { a: 'start', s: 14, c: C.red });
    return svg(250, 190, s, `cylinder radius ${r} height ${h}`);
  }
  function prismShape(bw, bh, len) {
    const x0 = 30, y0 = 100, w = 110, h = 80, dx = 90, dy = -40;
    let s = poly([[x0 + dx, y0 + dy], [x0 + w + dx, y0 + dy + h], [x0 + dx, y0 + dy + h]], '#d4efdf') + poly([[x0, y0 + h], [x0 + w, y0 + h], [x0 + w + dx, y0 + dy + h], [x0 + dx, y0 + dy + h]], '#bfe6cf') + poly([[x0, y0], [x0 + dx, y0 + dy], [x0 + dx, y0 + dy + h], [x0, y0 + h]], '#e6f8ee');
    s = poly([[x0, y0 + h], [x0 + w, y0 + h], [x0, y0]], '#e6f8ee') + poly([[x0, y0], [x0 + dx, y0 + dy], [x0 + w + dx, y0 + h + dy], [x0 + w, y0 + h]], '#bfe6cf') + poly([[x0, y0 + h], [x0 + w, y0 + h], [x0 + w + dx, y0 + h + dy], [x0 + dx, y0 + h + dy]], '#a9dcc0') + poly([[x0 + dx, y0 + dy], [x0 + w + dx, y0 + h + dy], [x0 + dx, y0 + h + dy]], '#d4efdf');
    s += tx(x0 + w / 2, y0 + h + 20, bw, { s: 14 }) + tx(x0 - 8, y0 + h / 2 + 4, bh, { a: 'end', s: 14 }) + tx(x0 + w + dx / 2 + 26, y0 + h + dy / 2 + 18, len, { a: 'start', s: 14, c: C.red });
    return svg(320, 190, s, `triangular prism: triangle base ${bw}, height ${bh}, length ${len}`);
  }

  /* ---------- Answer checking ---------- */
  function parseNum(s) {
    s = String(s).trim().replace(/[−–]/g, '-').replace(/[\s,$]/g, '').replace(/[°%]/g, '');
    s = s.replace(/[a-zA-Zµ²³]+\d?$/, '');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function parseFrac(s) {
    s = String(s).trim().replace(/[−–]/g, '-').replace(/\s+/g, ' ');
    let m;
    if ((m = s.match(/^(-?\d+) (\d+)\/(\d+)$/))) { const w = +m[1], n = +m[2], d = +m[3]; if (!d) return null; return { n: (Math.abs(w) * d + n) * (w < 0 ? -1 : 1), d, mixed: true, whole: w, pn: n }; }
    if ((m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/))) { if (!+m[2]) return null; return { n: +m[1], d: +m[2], mixed: false }; }
    if ((m = s.match(/^-?\d+$/))) return { n: +s, d: 1, mixed: false };
    if ((m = s.match(/^-?\d*\.\d+$/))) { const f = parseFloat(s); return { n: Math.round(f * 1000), d: 1000, mixed: false, dec: true }; }
    return null;
  }
  function check(q, input) {
    input = String(input == null ? '' : input).trim();
    if (!input) return false;
    switch (q.type) {
      case 'num': { const v = parseNum(input), a = parseFloat(q.answer); return !isNaN(v) && Math.abs(v - a) <= 1e-6 * (1 + Math.abs(a)); }
      case 'frac': {
        const f = parseFrac(input), a = parseFrac(q.answer); if (!f || !a || f.dec) return false;
        if (f.n * a.d !== a.n * f.d) return false;
        if (q.simplest || q.mixed) { const pn = f.mixed ? f.pn : Math.abs(f.n) % f.d; if (gcd(pn, f.d) !== 1 && pn !== 0) return false; if (f.mixed && f.pn >= f.d) return false; }
        if (q.mixed && Math.abs(a.n) > a.d && a.n % a.d !== 0 && !f.mixed) return false;
        return true;
      }
      case 'coord': { const m = input.match(/^\(?\s*([-−]?\d+)\s*[,;]\s*([-−]?\d+)\s*\)?$/); if (!m) return false; const a = q.answer.split(','); return +m[1].replace('−', '-') === +a[0] && +m[2].replace('−', '-') === +a[1]; }
      case 'mc': return String(input) === String(q.answer);
      case 'text': { const nz = x => { x = String(x).toLowerCase().replace(/\s+/g, ' ').trim(); return q.nospace ? x.replace(/ /g, '') : x; }; return [q.answer].concat(q.accept || []).map(nz).indexOf(nz(input)) >= 0; }
    }
    return false;
  }
  function displayAnswer(q) { return q.type === 'mc' ? q.choices[+q.answer] : (q.pre || '') + q.answer + (q.unit ? ' ' + q.unit : ''); }

  g.MQ = g.MQ || {};
  Object.assign(g.MQ, { RNG, NAMES, ITEMS, gcd, lcm, rd, T, esc, strip, fmt, raw, mon, sup, frac, B, C, svg, tx, ln, rc, poly, circ, cellGrid, dotArray, fracBar, fracCircle, fracGrid, barChart, lineChart, spinner, numberLine, clock, rectLabeled, isoCuboid, boxLabeled, fan, parallel, triangleAngles, quadAngles, rightTri, coordGrid, machine, tally, ruler, lShape, triShape, paraShape, trapShape, circleShape, cylShape, prismShape, check, parseNum, parseFrac, displayAnswer });
  /* LLM helper: Anthropic key (sk-ant-...), OpenRouter key (sk-or-...), or a proxy URL */
  g.MQ.llm = async function (system, user, maxTokens) {
    const CFG = g.MQ_CONFIG || {}, key = CFG.CLUE_API_KEY || '', max = maxTokens || 220;
    let r, j, text;
    if (CFG.CLUE_PROXY_URL) {
      r = await fetch(CFG.CLUE_PROXY_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: CFG.CLUE_MODEL || 'claude-haiku-5-5', max_tokens: max, system, messages: [{ role: 'user', content: user }] }) });
      if (!r.ok) throw new Error('HTTP ' + r.status); j = await r.json(); text = (j.content || []).map(c => c.text || '').join(' ');
    } else if (/^sk-or-/.test(key) || /openrouter/i.test(CFG.CLUE_PROVIDER || '')) {
      const model = (CFG.CLUE_MODEL && !/^claude-/.test(CFG.CLUE_MODEL)) ? CFG.CLUE_MODEL : 'openrouter/free';
      r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + key, 'X-Title': 'MathQuest' }, body: JSON.stringify({ model, max_tokens: Math.max(max, 300), messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
      if (!r.ok) throw new Error('HTTP ' + r.status); j = await r.json(); const m = j.choices && j.choices[0] && j.choices[0].message; text = (m && (m.content || '')) || '';
    } else {
      r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: CFG.CLUE_MODEL || 'claude-haiku-5-5', max_tokens: max, system, messages: [{ role: 'user', content: user }] }) });
      if (!r.ok) throw new Error('HTTP ' + r.status); j = await r.json(); text = (j.content || []).map(c => c.text || '').join(' ');
    }
    return String(text).replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };
  if (typeof module !== 'undefined') module.exports = g.MQ;
})(typeof window !== 'undefined' ? window : globalThis);

/* MathQuest student app: 30 modules x 30 questions, hidden-picture reveal, focus tracking, AI clues */
(function () {
  'use strict';
  const M = window.MQ, CFG = window.MQ_CONFIG || {}, T = M.Tracker, LS = M.LS, C = M.Course, esc = M.esc;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const APP = $('#app'), OV = $('#overlay');
  const NMOD = C.count, DPW = Math.max(1, CFG.DAYS_PER_WEEK || 1), MAXCLUE = CFG.MAX_CLUES || 3;
  const PRAISE = ['Brilliant! 🌟', 'You got it! 🎉', 'Nailed it! 💪', 'Correct! 🚀', 'Super maths! 🧠', 'Yes! 🙌', 'Spot on! 🎯', 'Wow, nice one! ⭐', 'Smashed it! 💥'];
  const TRY = ['Not quite – have another go! 💪', 'Close! Check your working. 🔎', 'Hmm, not yet. You can do it! 🌈', 'Read the question slowly and try again. 📖', 'Oops! Take a breath and retry. 🌬️'];
  let st = { name: '', mods: {} }, mod = null, mi = -1, mst = null, curN = 0, curSince = 0, streak = 0, saveT = 0, muted = LS.get('mq_muted', false);
  const label = i => DPW > 1 ? `Week ${Math.floor(i / DPW) + 1} · Day ${i % DPW + 1}` : `Week ${i + 1}`;
  const stars = s => s >= 27 ? 3 : s >= 21 ? 2 : 1;
  const mm = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const mins = ms => { const s = Math.round(ms / 1000); return s >= 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : s + ' s'; };
  const okCount = m => m ? Object.values(m.q || {}).filter(x => x.ok).length : 0;
  const resolved = m => m ? Object.values(m.q || {}).filter(x => x.ok || x.rev).length : 0;
  let ctl = {}, ctlSig = '';
  const unlocked = i => { const a = ctl.access && ctl.access[i]; if (a === 'open') return true; if (a === 'lock') return false; return !!ctl.all || CFG.UNLOCK_ALL || i === 0 || !!(st.mods[i - 1] && st.mods[i - 1].done); };
  const toast = msg => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };
  function ding(ok) {
    if (muted) return; try { const ctx = ding.c || (ding.c = new (window.AudioContext || window.webkitAudioContext)()), o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'sine'; const t0 = ctx.currentTime; (ok ? [660, 880, 1100] : [220]).forEach((f, i) => o.frequency.setValueAtTime(f, t0 + i * .09)); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.15, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + (ok ? .34 : .2)); o.start(t0); o.stop(t0 + .4); } catch (e) { }
  }
  function confetti() {
    const box = $('#confetti'); const em = ['🎉', '⭐', '✨', '🎈', '🌟', '💜', '🟡', '🩷'];
    for (let i = 0; i < 46; i++) { const e = document.createElement('i'); e.textContent = em[i % em.length]; e.style.left = Math.random() * 100 + '%'; e.style.animationDuration = 2.4 + Math.random() * 2.4 + 's'; e.style.animationDelay = Math.random() * .8 + 's'; box.appendChild(e); }
    setTimeout(() => box.innerHTML = '', 6000);
  }
  function showOv(html, cls) { OV.innerHTML = `<div class="ov"><div class="modal ${cls || ''}">${html}</div></div>`; Guard.paused = true; }
  function hideOv() { OV.innerHTML = ''; Guard.paused = false; }

  /* ---------- persistence ---------- */
  function load() { const s = LS.get('mq_state_v2', null); if (s && s.mods) st = s; if (!st.name) st.name = LS.get('mq_name', '') || CFG.STUDENT_NAME || ''; }
  function save(now) {
    LS.set('mq_state_v2', st); LS.set('mq_name', st.name);
    clearTimeout(saveT); saveT = setTimeout(cloudSave, now ? 0 : 4000);
  }
  function summary() { const d = {}; Object.keys(st.mods).forEach(k => { const x = st.mods[k]; d[k] = { ok: okCount(x), done: !!x.done, score: x.score || 0, ms: x.ms || 0, leaves: x.leaves || 0, away: x.awayMs || 0, clues: Object.values(x.q || {}).reduce((a, b) => a + (b.clues || 0), 0), at: x.finishedAt || 0 }; }); return d; }
  function cloudSave() { T.saveCloudProgress(st); T.saveProfile({ modules: summary(), totalDone: Object.values(st.mods).filter(x => x.done).length }); }

  /* ---------- teacher controls (admin page -> Firebase -> here) ---------- */
  function applyCmd(c) {
    const i = +c.mod, ms = () => st.mods[i] || (st.mods[i] = { q: {}, done: false, ms: 0, leaves: 0, awayMs: 0 });
    const mark = (m, q) => { const x = m.q[q.id] || (m.q[q.id] = { att: 0, wrong: [], clues: 0 }); x.ok = true; x.rev = false; x.adm = 1; };
    if (c.type === 'resetMod') delete st.mods[i];
    else if (c.type === 'completeMod') { const m = ms(); C.buildModule(i).questions.forEach(q => mark(m, q)); m.done = true; m.score = okCount(m); m.finishedAt = m.finishedAt || Date.now(); m.adm = 1; }
    else if (c.type === 'completeQ') { const m = ms(), q = C.buildModule(i).questions.find(x => x.id === c.qid); if (q) mark(m, q); }
    else if (c.type === 'resetQ') { const m = st.mods[i]; if (m && m.q) { delete m.q[c.qid]; m.done = false; delete m.finishedAt; } }
  }
  function wipeDevice() {
    const old = T.sid; clearTimeout(saveT); Guard.stop();
    ['mq_state_v2', 'mq_name', 'mq_queue', 'mq_events_local', 'mq_applied'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
    T.queue = []; T.sid = ''; st = { name: '', mods: {} }; mod = null; mst = null; ctl = {}; ctlSig = ''; T.ackWipe(old); welcome();
  }
  async function syncCtl(quiet) {
    if (!st.name || !T.sid) return;
    const c = await T.loadControl(); if (c === false) return;
    const before = ctlSig; ctl = c || {}; ctlSig = JSON.stringify([ctl.access, ctl.all]);
    if (ctl.wipe) { wipeDevice(); return; }
    const applied = LS.get('mq_applied', []); let n = 0, hitCur = false;
    Object.keys(ctl.cmds || {}).sort().forEach(k => {
      const c2 = ctl.cmds[k]; if (!applied.includes(k)) { applyCmd(c2); applied.push(k); n++; if (mod && +c2.mod === mi) hitCur = true; T.log('admin_cmd', { cmd: c2.type, mod: +c2.mod + 1, qid: c2.qid || '' }); }
      T.ackCmd(k);
    });
    if (n) { LS.set('mq_applied', applied.slice(-300)); save(true); }
    if (quiet) return;
    if (hitCur) { toast('Your teacher updated this mission 👩‍🏫'); home(); }
    else if ((n || before !== ctlSig) && !mod && st.name) home();
  }
  setInterval(() => { if (!document.hidden) syncCtl(); }, 10000);

  /* ---------- search bar: type "admin" ---------- */
  function searchHTML() { return `<form class="search" id="sform" role="search"><input id="sin" type="search" placeholder="Search…" aria-label="Search" autocomplete="off"></form>`; }
  function bindSearch() {
    const f = $('#sform'); if (!f) return;
    f.addEventListener('submit', e => { e.preventDefault(); const v = $('#sin').value.trim().toLowerCase(); if (v === 'admin') { location.href = 'admin.html'; return; } filterMods(v); });
    $('#sin').addEventListener('input', e => { const v = e.target.value.trim().toLowerCase(); if (v !== 'admin') filterMods(v); });
  }
  function filterMods(v) { $$('.mod[data-i]').forEach(el => el.classList.toggle('hidden', !!v && !el.dataset.text.includes(v))); }

  /* ---------- screens ---------- */
  const OWL = '🦉';
  function welcome() {
    mod = null; Guard.stop();
    APP.innerHTML = `<div class="top"><div class="brand"><div class="logo">🦉</div><div><h1>MathQuest</h1><p>Small steps. Big adventures.</p></div></div>${searchHTML()}</div>
    <div class="card gate"><div class="pip">🦉</div><h2>Hi, I'm Professor Pip!</h2><p>We're going on a maths adventure together. Each week there's a mission with <b>30 questions</b>. Every right answer uncovers a piece of a <b>secret picture</b>!</p>
    <form id="nameForm" autocomplete="off"><label for="nm" class="small">What's your first name?</label><br><input id="nm" maxlength="20" placeholder="Type your name" value="${esc(st.name || '')}" required><p><button type="submit" class="fun" style="font-size:22px;padding:12px 26px">Let's go! 🚀</button></p></form></div>`;
    bindSearch();
    $('#nameForm').addEventListener('submit', e => { e.preventDefault(); const n = $('#nm').value.trim(); if (!n) return; st.name = n; save(true); begin(); });
  }
  async function begin() {
    T.init(st.name);
    const cloud = await T.loadCloudProgress();
    if (cloud && cloud.mods) { const cs = Object.values(cloud.mods).reduce((a, m) => a + okCount(m), 0), ls = Object.values(st.mods).reduce((a, m) => a + okCount(m), 0); if (cs > ls) { st.mods = cloud.mods; save(true); } }
    T.log('session_start', { ua: navigator.userAgent.slice(0, 140), screen: innerWidth + 'x' + innerHeight, doneModules: Object.values(st.mods).filter(x => x.done).length });
    await syncCtl(true); if (!st.name) return; T.saveProfile({ modules: summary() }); home();
  }
  function home() {
    mod = null; Guard.stop();
    const doneN = Object.values(st.mods).filter(x => x.done).length, starsT = Object.values(st.mods).reduce((a, m) => a + (m.done ? stars(m.score) : 0), 0);
    let next = -1; for (let i = 0; i < NMOD; i++) if (!(st.mods[i] && st.mods[i].done)) { next = i; break; }
    const d = Math.floor(Date.now() / 864e5), j = M.Fun.joke(d);
    let h = `<div class="top"><div class="brand"><div class="logo">🦉</div><div><h1>MathQuest</h1><p>${esc(st.name)}'s adventure map</p></div></div>${searchHTML()}</div>
    <div class="card hero"><div class="pip">🦉</div><div><div class="bubble">${doneN === 0 ? `Welcome, <b>${esc(st.name)}</b>! Pick your first mission and let's uncover a secret picture!` : doneN >= NMOD ? '🏆 You finished EVERY mission! You are a maths legend!' : `Great work, <b>${esc(st.name)}</b>! You've found <b>${doneN}</b> of ${NMOD} secret pictures.`}</div>
    <div class="stats" style="margin-top:10px"><span class="chip">⭐ ${starsT} stars</span><span class="chip">🖼️ ${doneN}/${NMOD} pictures</span>${next >= 0 && unlocked(next) ? `<button class="fun" data-open="${next}">▶ ${st.mods[next] && resolved(st.mods[next]) ? 'Continue' : 'Start'} ${label(next)}</button>` : ''}</div>
    <div class="joke" style="margin-top:12px"><div class="q" style="all:unset"><b>😄 Joke of the day:</b> ${esc(j[0])}</div><button class="small ghost" id="jbtn">Show the punchline</button><div id="jans" class="hidden fun" style="font-size:20px;margin-top:6px">${esc(j[1])}</div></div></div></div>
    <div class="grid">`;
    for (let i = 0; i < NMOD; i++) {
      const m = st.mods[i], ul = unlocked(i), isDone = m && m.done, ok = okCount(m), P = C.PLAN[i], em = P[1].map(k => C.TOPICS[k][1]).join(' ');
      h += `<div class="mod ${isDone ? 'done' : ''} ${ul ? '' : 'locked'}" data-i="${i}" data-text="${esc((label(i) + ' ' + P[0] + ' ' + P[1].map(k => C.TOPICS[k][0]).join(' ')).toLowerCase())}">
        <div class="wk">${label(i)}</div><h3>${esc(P[0])}</h3><div class="emojis">${em}</div>
        <div class="bar"><span style="width:${isDone ? 100 : ok / 30 * 100}%"></span></div>
        <div class="small">${isDone ? '<span class="stars">' + '⭐'.repeat(stars(m.score)) + '</span> ' + m.score + '/30 correct' : ul ? (ok ? ok + '/30 done' : '30 questions') : '🔒 Finish the one before'}</div>
        <button ${ul ? '' : 'disabled'} data-open="${i}" class="${isDone ? 'ghost' : ''}">${isDone ? '🖼️ See picture / retry' : ok ? 'Continue ▶' : ul ? 'Start ▶' : '🔒 Locked'}</button></div>`;
    }
    APP.innerHTML = h + `</div><p class="small" style="text-align:center;margin-top:20px"><button class="small ghost" id="switch">Not ${esc(st.name)}? Switch player</button></p>`;
    bindSearch(); window.scrollTo(0, 0);
    $('#jbtn').onclick = () => { $('#jans').classList.remove('hidden'); $('#jbtn').remove(); };
    $$('[data-open]').forEach(b => b.onclick = () => { const i = +b.dataset.open; if (unlocked(i)) openModule(i); });
    $('#switch').onclick = () => { st = { name: '', mods: {} }; LS.set('mq_state_v2', st); LS.set('mq_name', ''); T.queue = []; welcome(); };
  }

  /* ---------- module gate ---------- */
  function openModule(i) {
    mi = i; mod = C.buildModule(i); mst = st.mods[i] || (st.mods[i] = { q: {}, done: false, ms: 0, leaves: 0, awayMs: 0 });
    const started = resolved(mst) > 0;
    if (mst.done) { showDone(true); return; }
    APP.innerHTML = `<div class="card gate"><div class="pip">🦉</div><h2>${label(i)}: ${esc(mod.title)}</h2>
    <p class="small">${mod.blocks.map(b => b.emoji + ' ' + b.name).join(' · ')}</p>
    <ul><li><b>30 questions</b>. Every right answer opens a piece of the secret picture. 🖼️</li><li>Each part starts with a short <b>“Learn it”</b> box. Read it first – it really helps!</li><li>Stuck? Ask <b>Professor Pip</b> for a clue. No answers, just nudges! 🦉</li><li>👀 <b>Stay on this page.</b> Your teacher is told if you leave it, and when.</li></ul>
    <p><button class="fun" id="go" style="font-size:22px;padding:12px 28px">${started ? 'Continue the mission 🚀' : 'Start the mission 🚀'}</button></p>
    <p><button class="ghost small" id="back">← Back to the map</button></p></div>`;
    $('#back').onclick = home;
    $('#go').onclick = () => { Guard.goFullscreen(); renderModule(started); };
  }

  /* ---------- module screen ---------- */
  function qHTML(q) {
    const s = mst.q[q.id] || {}, isMc = q.type === 'mc';
    let input;
    if (isMc) input = `<div class="choices">${q.choices.map((c, k) => `<button type="button" data-mc="${k}" class="${s.ok && String(k) === String(q.answer) ? 'good' : ''}" ${s.ok || s.rev ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>`;
    else {
      const ph = q.type === 'frac' ? 'e.g. 3/4 or 1 2/5' : q.type === 'coord' ? 'e.g. 3,4' : q.nospace ? 'e.g. 2:3' : 'type your answer';
      const im = (q.type === 'num' && parseFloat(q.answer) >= 0) ? 'decimal' : 'text';
      input = `<div class="ans">${q.pre ? `<span class="pre">${q.pre}</span>` : ''}<input type="text" inputmode="${im}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${ph}" aria-label="Answer for question ${q.n + 1}" value="${s.ok ? esc(s.given || '') : ''}" class="${s.ok ? 'good' : ''}" ${s.ok || s.rev ? 'readonly' : ''}>${q.unit ? `<span class="unit">${esc(q.unit)}</span>` : ''}<button type="button" class="chk" ${s.ok || s.rev ? 'disabled' : ''}>Check ✓</button></div>`;
    }
    return `<div class="q ${s.ok ? 'ok' : s.rev ? 'rev' : ''}" id="q${q.n}" data-n="${q.n}"><div class="qh"><div class="qn">${s.ok ? '✓' : q.n + 1}</div><div class="qp">${q.prompt}</div></div>${q.svg || ''}${input}<div class="fb ${s.ok ? 'good' : ''}">${s.ok ? PRAISE[q.n % PRAISE.length] : ''}</div><div class="extra">${s.ok || s.rev ? `<div class="sol">💡 ${q.sol}${s.rev ? '<br><b>Answer: ' + esc(M.displayAnswer(q)) + '</b>' : ''}</div>` : ''}</div>${s.ok || s.rev ? '' : `<div class="tools"><button type="button" class="ghost small clue">🦉 Ask Professor Pip for a clue <span class="cl">${(s.clues || 0)}/${MAXCLUE}</span></button><button type="button" class="warn small show hidden">👀 Show me how</button></div>`}</div>`;
  }
  function renderModule(resume) {
    curN = 0; for (const q of mod.questions) { const s = mst.q[q.id]; if (!(s && (s.ok || s.rev))) { curN = q.n; break; } }
    const sc = M.Pictures.scene(mi), order = new M.RNG(mi * 7919 + 5).shuffle(Array.from({ length: 30 }, (_, k) => k)), j = M.Fun.joke(mi), rd = M.Fun.riddle(mi);
    mod.scene = sc; mod.order = order;
    let h = `<div class="mbar"><button class="ghost small" id="back">← Map</button><h2>${label(mi)}: ${esc(mod.title)}</h2><span class="chip" id="pcount">0/30</span><span class="chip" id="timer">⏱ 0:00</span><button class="ghost small" id="fs" title="Full screen">⛶</button><button class="ghost small" id="mute">${muted ? '🔇' : '🔊'}</button></div>
    <div class="layout"><div class="main">
    <div class="joke"><div><b>😄 Today's giggle:</b> ${esc(j[0])}</div><button class="small ghost" id="jbtn">Punchline</button><div id="jans" class="hidden fun" style="font-size:20px;margin-top:4px">${esc(j[1])}</div></div><div style="height:16px"></div>`;
    mod.blocks.forEach((b, bi) => {
      h += `<section class="block"><div class="bhead"><span class="em">${b.emoji}</span><h3>Part ${bi + 1}: ${esc(b.name)}</h3></div>
      <details class="lesson" ${bi === 0 && !resume ? 'open' : ''}><summary>📘 Learn it first</summary>${b.lesson}</details>${b.qs.map(qHTML).join('')}</section>`;
    });
    h += `</div><aside class="side"><div class="art">${sc.svg}<div class="tiles">${Array.from({ length: 30 }, (_, k) => `<div class="tile" data-t="${k}">${k + 1}</div>`).join('')}</div></div><div class="ptitle" id="ptitle">🖼️ Mystery picture!</div>
    <div class="bar"><span id="pbar"></span></div>
    <div class="card" style="padding:14px"><div class="pipbox"><div class="e">🦉</div><div id="pip" class="bubble">Hi ${esc(st.name)}! Every right answer opens a tile. Let's do this!</div></div><div class="small" id="streak" style="margin-top:6px"></div></div>
    <div class="card" style="padding:14px"><b>🧩 Riddle:</b> ${esc(rd[0])}<br><button class="small ghost" id="rbtn" style="margin-top:6px">Reveal answer</button><div id="rans" class="hidden fun" style="font-size:19px;margin-top:6px">${esc(rd[1])}</div></div></aside></div>`;
    APP.innerHTML = h; window.scrollTo(0, 0);
    wire(); syncTiles(false); updateProgress(); setCur(curN);
    Guard.start(); T.log(resume ? 'module_resume' : 'module_start', { mod: mi + 1, label: label(mi), title: mod.title, done: okCount(mst) });
  }
  function syncTiles(animate) {
    const n = mst.done ? 30 : okCount(mst);
    $$('.tile').forEach(t => t.classList.remove('open'));
    mod.order.slice(0, n).forEach(k => { const t = $(`.tile[data-t="${k}"]`); if (t) t.classList.add('open'); });
  }
  function revealNext() {
    const n = okCount(mst); const k = mod.order[n - 1]; const t = $(`.tile[data-t="${k}"]`); if (t) t.classList.add('open');
  }
  function updateProgress() {
    const ok = okCount(mst), res = resolved(mst); $('#pcount').textContent = res + '/30'; $('#pbar').style.width = res / 30 * 100 + '%';
    $('#streak').textContent = streak >= 2 ? `🔥 ${streak} right in a row!` : '';
  }
  function pip(msg) { const e = $('#pip'); if (e) e.textContent = msg; }

  /* ---------- question interaction ---------- */
  function qOf(el) { const c = el.closest('.q'); return c ? mod.questions[+c.dataset.n] : null; }
  function wire() {
    $('#back').onclick = () => { T.log('module_exit', { mod: mi + 1, ok: okCount(mst) }); save(true); cloudSave(); home(); };
    $('#mute').onclick = () => { muted = !muted; LS.set('mq_muted', muted); $('#mute').textContent = muted ? '🔇' : '🔊'; };
    $('#fs').onclick = () => Guard.goFullscreen(true);
    $('#jbtn').onclick = () => { $('#jans').classList.remove('hidden'); $('#jbtn').remove(); };
    $('#rbtn').onclick = () => { $('#rans').classList.remove('hidden'); $('#rbtn').remove(); T.log('riddle_reveal', { mod: mi + 1 }); };
    const main = $('.main');
    main.addEventListener('focusin', e => { const q = qOf(e.target); if (q) setCur(q.n); });
    main.addEventListener('pointerdown', e => { const q = qOf(e.target); if (q) setCur(q.n); });
    main.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); const q = qOf(e.target); if (q) submit(q, e.target.value, false); } });
    main.addEventListener('click', e => {
      const q = qOf(e.target); if (!q) return;
      if (e.target.closest('.chk')) { const inp = $('input', e.target.closest('.q')); submit(q, inp.value, false); }
      else if (e.target.closest('[data-mc]')) submit(q, e.target.closest('[data-mc]').dataset.mc, false, e.target.closest('[data-mc]'));
      else if (e.target.closest('.clue')) askClue(q);
      else if (e.target.closest('.show')) showMe(q);
    });
    let liveT = 0;
    main.addEventListener('input', e => { if (e.target.tagName !== 'INPUT') return; const q = qOf(e.target); if (!q) return; e.target.classList.remove('bad'); clearTimeout(liveT); const v = e.target.value; liveT = setTimeout(() => { if (v.trim() && M.check(q, v) && !(mst.q[q.id] || {}).ok) submit(q, v, true); }, 800); });
  }
  function setCur(n) {
    const now = Date.now(); if (curSince && mod && mod.questions[curN]) { const s = qSt(mod.questions[curN]); if (!(s.ok || s.rev) && !Guard.away && !Guard.paused) s.ms = (s.ms || 0) + Math.min(now - curSince, 120000); }
    curN = n; curSince = now; $$('.q.active').forEach(x => x.classList.remove('active')); const el = $('#q' + n); if (el) el.classList.add('active');
  }
  const qSt = q => mst.q[q.id] || (mst.q[q.id] = { att: 0, wrong: [], clues: 0 });
  const qtext = q => M.strip(q.prompt).slice(0, 180);
  function submit(q, val, auto, btn) {
    const s = qSt(q); if (s.ok || s.rev) return; val = String(val).trim(); if (!val) return;
    setCur(q.n); const ok = M.check(q, val); s.att = (s.att || 0) + 1; const card = $('#q' + q.n);
    T.log('answer', { mod: mi + 1, q: q.n + 1, qid: q.id, topic: q.topic, qText: qtext(q), given: q.type === 'mc' ? q.choices[+val] : val, ok, att: s.att, ms: s.ms || 0, auto: !!auto });
    if (ok) {
      s.ok = true; s.given = q.type === 'mc' ? q.choices[+val] : val; streak = s.att === 1 ? streak + 1 : 0; ding(true);
      card.classList.add('ok'); $('.qn', card).textContent = '✓';
      const inp = $('input', card); if (inp) { inp.classList.remove('bad'); inp.classList.add('good'); inp.readOnly = true; $('.chk', card).disabled = true; }
      if (q.type === 'mc') $$('[data-mc]', card).forEach(b => { b.disabled = true; if (String(b.dataset.mc) === String(q.answer)) b.classList.add('good'); });
      const fb = $('.fb', card); fb.className = 'fb good'; fb.textContent = PRAISE[(q.n + s.att) % PRAISE.length] + (s.att === 1 ? '  (first try!)' : '');
      $('.extra', card).innerHTML = `<div class="sol">💡 ${q.sol}</div>`; const tools = $('.tools', card); if (tools) tools.remove();
      revealNext(); updateProgress(); pip(streak >= 3 ? `🔥 ${streak} in a row! You're on fire!` : PRAISE[(q.n * 3) % PRAISE.length]); save();
      if (resolved(mst) >= 30) setTimeout(finish, 900); else setTimeout(() => focusNext(q.n), 600);
    } else {
      s.wrong.push(q.type === 'mc' ? q.choices[+val] : val); streak = 0; ding(false);
      const fb = $('.fb', card); fb.className = 'fb bad'; fb.textContent = TRY[s.att % TRY.length]; pip('Every mistake helps your brain grow! 🌱');
      if (btn) { btn.classList.add('bad'); btn.disabled = true; } else { const inp = $('input', card); inp.classList.remove('bad'); void inp.offsetWidth; inp.classList.add('bad'); }
      if (s.att >= 2 && !$('.hint', card)) $('.extra', card).insertAdjacentHTML('afterbegin', `<div class="hint">🔦 Hint: ${esc(q.hint)}</div>`);
      if (s.att >= 4) { const sb = $('.show', card); if (sb) sb.classList.remove('hidden'); }
      save();
    }
    updateProgress();
  }
  function focusNext(n) {
    for (let k = n + 1; k < 30; k++) { const q = mod.questions[k], s = mst.q[q.id]; if (!(s && (s.ok || s.rev))) { const el = $('#q' + k); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const inp = $('input', el); if (inp) inp.focus({ preventScroll: true }); setCur(k); } return; } }
  }
  function showMe(q) {
    const s = qSt(q); if (s.ok || s.rev) return; s.rev = true; const card = $('#q' + q.n);
    T.log('reveal', { mod: mi + 1, q: q.n + 1, qid: q.id, qText: qtext(q), att: s.att, wrong: s.wrong.slice(-5) });
    card.classList.add('rev'); $('.qn', card).textContent = '👀'; const inp = $('input', card); if (inp) inp.readOnly = true; $$('button', card).forEach(b => { if (!b.classList.contains('clue') && !b.classList.contains('show')) b.disabled = true; });
    $('.extra', card).innerHTML = `<div class="sol">💡 ${q.sol}<br><b>Answer: ${esc(M.displayAnswer(q))}</b></div>`; const t = $('.tools', card); if (t) t.remove(); const fb = $('.fb', card); fb.className = 'fb'; fb.textContent = 'No worries – learn it, then try the next one! 🌟';
    streak = 0; updateProgress(); save(); if (resolved(mst) >= 30) setTimeout(finish, 900);
  }

  /* ---------- clues from Professor Pip ---------- */
  function fallbackClue(q, n) {
    const generic = ['Read the question again slowly. What exactly is it asking you to find? ✏️', q.hint, q.hint + ' Try writing each step on paper. 📝'];
    return generic[Math.min(n, 3) - 1];
  }
  function leaks(text, q) {
    const a = q.type === 'mc' ? String(q.choices[+q.answer]) : String(q.answer);
    if (q.type === 'num') { const v = parseFloat(a); if (Math.abs(v) >= 10 || (v % 1 !== 0)) { const nums = (text.replace(/,/g, '').match(/-?\d+(\.\d+)?/g) || []).map(parseFloat); if (nums.indexOf(v) >= 0) return true; } return false; }
    if (q.type === 'mc') return a.length > 3 && text.toLowerCase().indexOf(a.toLowerCase()) >= 0;
    return a.length > 2 && text.replace(/\s/g, '').indexOf(a.replace(/\s/g, '')) >= 0;
  }
  async function getClue(q, n, s) {
    if (!CFG.CLUE_API_KEY && !CFG.CLUE_PROXY_URL) return { text: fallbackClue(q, n), ai: false };
    const sys = `You are Professor Pip, a kind, playful owl who helps a child (about 10 years old, in Australia) with maths. Write ONE short clue: at most 2 short sentences, simple words, at most one emoji. NEVER state the final answer, NEVER do the final calculation for the child, and never write a number equal to the answer. This is clue ${n} of ${MAXCLUE}: clue 1 = point to the key idea or what to notice; clue 2 = name the first step without doing it; clue 3 = be more direct, using a guiding question or a similar but easier example with DIFFERENT numbers. If the child's wrong tries show a common mistake, gently steer away from it. Be warm and encouraging.`;
    const user = `Question (diagram described in words if any): ${q.desc}\n\nFOR YOUR EYES ONLY (never reveal): correct answer = ${M.displayAnswer(q)}; method = ${M.strip(q.sol)}\n\nThe child's wrong tries so far: ${s.wrong.length ? s.wrong.slice(-4).join(', ') : 'none yet'}.\n\nWrite clue ${n} now.`;
    const body = JSON.stringify({ model: CFG.CLUE_MODEL || 'claude-haiku-5-5', max_tokens: 160, system: sys, messages: [{ role: 'user', content: user }] });
    try {
      const r = CFG.CLUE_PROXY_URL ? await fetch(CFG.CLUE_PROXY_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body })
        : await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': CFG.CLUE_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); const text = ((j.content || []).map(c => c.text || '').join(' ')).trim();
      if (!text || leaks(text, q)) return { text: fallbackClue(q, n), ai: false, blocked: !!text };
      return { text, ai: true };
    } catch (e) { return { text: fallbackClue(q, n), ai: false, err: String(e.message || e) }; }
  }
  async function askClue(q) {
    const s = qSt(q); if (s.ok || s.rev) return; const card = $('#q' + q.n);
    if ((s.clues || 0) >= MAXCLUE) { toast('Professor Pip has no more clues for this one – you can do it! 💪'); return; }
    const btn = $('.clue', card); btn.disabled = true; s.clues = (s.clues || 0) + 1; $('.cl', btn).textContent = s.clues + '/' + MAXCLUE;
    const ex = $('.extra', card); const holder = document.createElement('div'); holder.className = 'clue'; holder.innerHTML = '<div class="pipbox"><div class="e">🦉</div><div>Professor Pip is thinking…</div></div>'; ex.appendChild(holder);
    const r = await getClue(q, s.clues, s); holder.innerHTML = `<div class="pipbox"><div class="e">🦉</div><div><b>Clue ${s.clues}:</b> ${esc(r.text)}</div></div>`;
    T.log('clue', { mod: mi + 1, q: q.n + 1, qid: q.id, qText: qtext(q), n: s.clues, ai: r.ai, text: r.text.slice(0, 300), note: r.err || (r.blocked ? 'blocked-answer-leak' : '') });
    if (s.clues < MAXCLUE) btn.disabled = false; save();
  }

  /* ---------- finishing ---------- */
  function finish() {
    if (mst.done) return; mst.done = true; mst.score = okCount(mst); mst.finishedAt = Date.now(); setCur(curN);
    syncTiles(); Guard.stop(); save(true);
    const clues = Object.values(mst.q).reduce((a, b) => a + (b.clues || 0), 0), wrong = Object.values(mst.q).reduce((a, b) => a + ((b.wrong || []).length), 0), rev = Object.values(mst.q).filter(x => x.rev).length;
    T.log('module_complete', { mod: mi + 1, label: label(mi), title: mod.title, score: mst.score, durationMs: mst.ms, leaves: mst.leaves || 0, awayMs: mst.awayMs || 0, clues, wrong, revealed: rev });
    T.notify(`${st.name} finished ${label(mi)}`, `${mst.score}/30 correct · ${mins(mst.ms)} · left the page ${mst.leaves || 0}× (${Math.round((mst.awayMs || 0) / 1000)}s away) · ${clues} clues · ${wrong} wrong tries${rev ? ' · ' + rev + ' shown' : ''}`, mst.leaves ? ['warning', 'books'] : ['tada'], mst.leaves ? 4 : 3);
    cloudSave(); confetti(); ding(true); setTimeout(() => showDone(false), 700);
  }
  function showDone(review) {
    const sc = M.Pictures.scene(mi), s = mst.score || okCount(mst), nxt = mi + 1 < NMOD ? mi + 1 : -1;
    showOv(`<div style="font-size:54px">${'⭐'.repeat(stars(s))}</div><h2>${review ? 'Your picture!' : label(mi) + ' complete!'}</h2><div class="art" style="margin:10px auto;max-width:360px">${sc.svg}</div><p class="fun" style="font-size:22px;margin:4px 0">${esc(sc.title)}</p>
      <p><b>${s}/30</b> correct${mst.ms ? ' · ' + mins(mst.ms) : ''}</p><div class="joke">${review ? '' : '🧩 You earned the riddle answer: <b>' + esc(M.Fun.riddle(mi)[1]) + '</b>'}</div>
      <p style="margin-top:14px"><button id="ovmap">🗺️ Back to the map</button> ${nxt >= 0 && !review ? '<button id="ovnext" class="fun">Next adventure ▶</button>' : ''} ${review ? '<button class="ghost" id="ovretry">Practise again</button>' : ''}</p>`);
    $('#ovmap').onclick = () => { hideOv(); home(); }; const n = $('#ovnext'); if (n) n.onclick = () => { hideOv(); openModule(nxt); };
    const rt = $('#ovretry'); if (rt) rt.onclick = () => { hideOv(); if (confirm('Practise this mission again? Your first score stays saved.')) { mst.q = {}; mst.done = false; save(true); renderModule(false); } else home(); };
  }

  /* ---------- Guard: focus-mode tracking ---------- */
  const TOUCH = (navigator.maxTouchPoints || 0) > 1 || /iPad|iPhone|Android/i.test(navigator.userAgent);
  const Guard = {
    active: false, away: null, paused: false, fsWanted: false, last: {}, lastAct: Date.now(), idle: false, blurT: 0, tick: 0, dev: 0,
    start() {
      if (Guard.active) return; Guard.active = true; Guard.away = null; Guard.lastAct = Date.now(); Guard.idle = false;
      document.addEventListener('visibilitychange', Guard.vis); window.addEventListener('blur', Guard.blur); window.addEventListener('focus', Guard.back);
      document.addEventListener('fullscreenchange', Guard.fsChange); document.addEventListener('copy', Guard.block); document.addEventListener('cut', Guard.block); document.addEventListener('paste', Guard.block);
      document.addEventListener('contextmenu', Guard.block); document.addEventListener('dragstart', Guard.block); document.addEventListener('keydown', Guard.key, true); window.addEventListener('beforeprint', Guard.print);
      ['pointerdown', 'keydown', 'pointermove', 'scroll', 'touchstart'].forEach(ev => document.addEventListener(ev, Guard.act, { passive: true }));
      window.addEventListener('pagehide', Guard.close); window.addEventListener('beforeunload', Guard.close);
      Guard.tick = setInterval(Guard.timer, 1000);
    },
    stop() {
      if (!Guard.active) return; Guard.active = false; clearInterval(Guard.tick); clearTimeout(Guard.blurT);
      document.removeEventListener('visibilitychange', Guard.vis); window.removeEventListener('blur', Guard.blur); window.removeEventListener('focus', Guard.back); document.removeEventListener('fullscreenchange', Guard.fsChange);
      ['copy', 'cut', 'paste', 'contextmenu', 'dragstart'].forEach(e => document.removeEventListener(e, Guard.block)); document.removeEventListener('keydown', Guard.key, true); window.removeEventListener('beforeprint', Guard.print);
      ['pointerdown', 'keydown', 'pointermove', 'scroll', 'touchstart'].forEach(ev => document.removeEventListener(ev, Guard.act)); window.removeEventListener('pagehide', Guard.close); window.removeEventListener('beforeunload', Guard.close);
      Guard.fsWanted = false; if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { }); Guard.away = null;
    },
    ctx() { const q = mod && mod.questions[curN]; return { mod: mi + 1, q: curN + 1, qText: q ? qtext(q) : '' }; },
    goFullscreen(manual) { const el = document.documentElement; if (el.requestFullscreen) { Guard.fsWanted = true; el.requestFullscreen().catch(() => { Guard.fsWanted = false; if (manual) toast('Full screen is not available here.'); }); } },
    fsChange() { if (!document.fullscreenElement && Guard.fsWanted && Guard.active && !(mst && mst.done)) { T.log('fullscreen-exit', Guard.ctx()); showOv(`<div style="font-size:48px">🖥️</div><h2>Back to full screen!</h2><p>Mission mode works best in full screen. Your teacher has been told.</p><button id="fsback" class="fun">Back to my mission 🚀</button>`); $('#fsback').onclick = () => { hideOv(); Guard.goFullscreen(); }; } },
    vis() { if (document.hidden) Guard.leave('tab-hidden', Date.now()); else Guard.back(); },
    blur() { if (TOUCH) return; clearTimeout(Guard.blurT); const t0 = Date.now(); Guard.blurT = setTimeout(() => { if (!document.hasFocus()) Guard.leave('window-blur', t0); }, 1200); },
    leave(reason, t0) {
      if (!Guard.active || Guard.away || (mst && mst.done)) return; if (setCurSafe()) { }
      Guard.away = { t: t0, reason, q: curN }; mst.leaves = (mst.leaves || 0) + 1;
      T.log('leave', Object.assign(Guard.ctx(), { reason })); T.flush(true);
      if (CFG.NOTIFY_ON_LEAVE !== false) T.notify(`${st.name} left the page`, `${label(mi)}, question ${curN + 1} (${reason})`, ['eyes'], 3); save(true);
    },
    back() {
      clearTimeout(Guard.blurT); if (!Guard.away || document.hidden) return; const a = Guard.away, dur = Date.now() - a.t; Guard.away = null; mst.awayMs = (mst.awayMs || 0) + dur;
      T.log('return', Object.assign(Guard.ctx(), { reason: a.reason, awayMs: dur })); save(true); curSince = Date.now();
      showOv(`<div style="font-size:54px">👀</div><h2>Welcome back!</h2><p>You were away from the mission for <b>${Math.max(1, Math.round(dur / 1000))} seconds</b>. Your teacher can see this.</p><p class="small">Stay on this page so you can finish and uncover the picture!</p><button id="bk" class="fun">Back to question ${a.q + 1} 🚀</button>`);
      $('#bk').onclick = () => { hideOv(); if (Guard.fsWanted && !document.fullscreenElement) Guard.goFullscreen(); const el = $('#q' + a.q); if (el) { el.scrollIntoView({ block: 'center' }); const i = $('input', el); if (i) i.focus({ preventScroll: true }); } };
    },
    block(e) { e.preventDefault(); const k = e.type; const now = Date.now(); if (now - (Guard.last[k] || 0) > 3000) { Guard.last[k] = now; T.log('blocked', Object.assign(Guard.ctx(), { kind: k })); } },
    key(e) {
      const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey; let bad = null;
      if (e.key === 'F12') bad = 'F12'; else if (ctrl && e.shiftKey && 'ijc'.includes(k)) bad = 'devtools-shortcut'; else if (ctrl && 'usp'.includes(k) && !e.shiftKey) bad = 'ctrl-' + k;
      if (bad) { e.preventDefault(); e.stopPropagation(); const now = Date.now(); if (now - (Guard.last[bad] || 0) > 3000) { Guard.last[bad] = now; T.log('blocked', Object.assign(Guard.ctx(), { kind: 'key:' + bad })); } }
    },
    print() { T.log('blocked', Object.assign(Guard.ctx(), { kind: 'print' })); },
    close() { if (Guard.active && mst && !mst.done) { T.log('page-closed', Guard.ctx()); T.flush(true); if (CFG.NOTIFY_ON_LEAVE !== false && !Guard.away) T.notify(`${st.name} closed the page`, `${label(mi)}, question ${curN + 1}`, ['x'], 4); save(true); } },
    act() { const now = Date.now(); if (Guard.idle) { T.log('idle-end', Object.assign(Guard.ctx(), { idleMs: now - Guard.lastAct })); Guard.idle = false; curSince = now; } Guard.lastAct = now; },
    timer() {
      if (!Guard.active || !mst) return; const now = Date.now();
      if (!Guard.away && !Guard.paused && document.visibilityState === 'visible') {
        if (now - Guard.lastAct > 150000 && !Guard.idle) { Guard.idle = true; T.log('idle', Guard.ctx()); }
        if (!Guard.idle) { mst.ms = (mst.ms || 0) + 1000; const t = $('#timer'); if (t) t.textContent = '⏱ ' + mm(mst.ms); if (mst.ms % 15000 === 0) save(); }
      }
      if (!TOUCH && now - Guard.dev > 120000 && !document.fullscreenElement && (window.outerWidth - window.innerWidth > 220 || window.outerHeight - window.innerHeight > 300)) { Guard.dev = now; T.log('devtools-suspected', Guard.ctx()); }
    }
  };
  function setCurSafe() { return false; }

  /* ---------- go ---------- */
  load(); if (st.name) begin(); else welcome();
})();

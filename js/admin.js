/* MathQuest admin dashboard: who, when, which question, how long away */
(function () {
  'use strict';
  const M = window.MQ, CFG = window.MQ_CONFIG || {}, C = M.Course, esc = M.esc, APP = document.getElementById('app');
  const DPW = Math.max(1, CFG.DAYS_PER_WEEK || 1);
  const label = i => DPW > 1 ? `Week ${Math.floor(i / DPW) + 1} · Day ${i % DPW + 1}` : `Week ${i + 1}`;
  const db = (CFG.FIREBASE_DB_URL || '').replace(/\/+$/, '');
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const fmtT = t => new Date(t).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const dur = ms => { const s = Math.round(ms / 1000); if (s < 60) return s + 's'; const m = Math.floor(s / 60); return m < 60 ? m + 'm ' + (s % 60) + 's' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  const ago = t => t ? dur(Date.now() - t) + ' ago' : '–';
  let workKeys = {};
  let data = { events: {}, students: {}, progress: {}, control: {}, source: 'local' }, sel = '', selMod = -1, filter = 'all', timer = 0;
  const cache = {};
  const cloud = () => !!db;
  const send = (method, path, body) => fetch(`${db}/mathquest/${path}.json`, { method, body: body === undefined ? undefined : JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); });
  const cmd = (sid, c) => send('PUT', `control/${encodeURIComponent(sid)}/cmds/${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, Object.assign({ t: Date.now() }, c));
  const silent = sid => !!(data.control[sid] && data.control[sid].silent), vip = sid => !!(data.control[sid] && data.control[sid].all && data.control[sid].silent);
  const access = (sid, i) => { const a = data.control[sid] && data.control[sid].access; return a ? a[i] : undefined; };
  async function act(fn, msg) { if (!cloud()) { alert('Controls need Firebase set up (FIREBASE_DB_URL in js/config.js).'); return; } try { await fn(); await load(); render(); if (msg) flash(msg); } catch (e) { alert('Failed: ' + e.message + '. Check the Firebase rules.'); } }
  function flash(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }
  async function delUser(sid) {
    if (!confirm(`Delete ${nameOf(sid)} and ALL their progress and activity? This cannot be undone.`)) return;
    await act(async () => { await Promise.all(['events', 'progress', 'students'].map(k => send('DELETE', `${k}/${encodeURIComponent(sid)}`))); await send('PUT', `control/${encodeURIComponent(sid)}`, { wipe: Date.now() }); if (sel === sid) sel = ''; }, 'Deleted. Her device resets next time it is online on the site.');
  }

  function gate() {
    if (sessionStorage.getItem('mq_admin_ok') === '1' || lsGet('mq_admin', false) === true) return start();
    APP.innerHTML = `<div class="card gate"><div style="font-size:54px">🧑‍🏫</div><h2>Guardian view</h2><p class="small">Enter the admin passcode.</p><form id="pf"><input id="pw" type="password" placeholder="Passcode" autocomplete="current-password"><p><button class="fun" type="submit">Open dashboard</button></p><div id="pe" class="small" style="color:#c00"></div></form><p><a href="index.html">← Student page</a></p></div>`;
    document.getElementById('pf').onsubmit = e => { e.preventDefault(); if (document.getElementById('pw').value === (CFG.ADMIN_PASSCODE || '')) { sessionStorage.setItem('mq_admin_ok', '1'); start(); } else document.getElementById('pe').textContent = 'Not quite.'; };
  }

  async function load() {
    if (db) {
      try { const r = await fetch(`${db}/mathquest.json`); if (!r.ok) throw new Error('HTTP ' + r.status); const j = (await r.json()) || {}; data = { events: j.events || {}, students: j.students || {}, progress: j.progress || {}, control: j.control || {}, source: 'cloud' }; }
      catch (e) { data = localData(); data.error = 'Could not reach Firebase (' + e.message + '). Check FIREBASE_DB_URL and the database rules. Showing this browser only.'; }
    } else data = localData();
    if (!sel || (!data.events[sel] && !data.progress[sel])) { const ids = studentIds(); sel = ids[0] || ''; }
    workKeys = {}; if (db && sel) { try { const r = await fetch(`${db}/mathquest/work/${encodeURIComponent(sel)}.json?shallow=true`); if (r.ok) workKeys = (await r.json()) || {}; } catch (e) { } }
  }
  function localData() {
    const ev = lsGet('mq_events_local', []), st = lsGet('mq_state_v2', null), by = {}; ev.forEach(e => { (by[e.sid] = by[e.sid] || {})[e.t + '-' + Math.random()] = e; });
    const prog = {}, stu = {}; if (st && st.name) { const sid = (window.MQ.Tracker && MQ.Tracker.slug) ? MQ.Tracker.slug(st.name) : st.name.toLowerCase(); const k = Object.keys(by)[0] || sid; prog[k] = st; stu[k] = { name: st.name }; }
    return { events: by, students: stu, progress: prog, source: 'local' };
  }
  const studentIds = () => Array.from(new Set(Object.keys(data.events).concat(Object.keys(data.progress), Object.keys(data.students))));
  const evs = sid => Object.entries(data.events[sid] || {}).map(([k, v]) => Object.assign({ _k: k }, v)).sort((a, b) => a.t - b.t);
  const nameOf = sid => (data.students[sid] && data.students[sid].name) || ((evs(sid)[0] || {}).name) || sid;
  const buildMod = i => cache[i] || (cache[i] = C.buildModule(i));

  function modStats(sid, i) {
    const p = (data.progress[sid] && data.progress[sid].mods && data.progress[sid].mods[i]) || null, es = evs(sid).filter(e => e.mod === i + 1);
    const leaves = es.filter(e => e.type === 'leave'), rets = es.filter(e => e.type === 'return');
    const ok = p ? Object.values(p.q || {}).filter(x => x.ok).length : es.filter(e => e.type === 'answer' && e.ok).length;
    const away = es.length ? rets.reduce((a, e) => a + (e.awayMs || 0), 0) : (p && p.awayMs) || 0;
    return { p, es, leaves: leaves.length, away, ok, done: !!(p && p.done) || es.some(e => e.type === 'module_complete'), ms: p ? p.ms || 0 : 0, started: es.length > 0 || !!p, clues: es.filter(e => e.type === 'clue').length, blocked: es.filter(e => e.type === 'blocked').length };
  }

  function render() {
    const ids = studentIds(), e = sel ? evs(sel) : [];
    let h = `<div class="top"><div class="brand"><div class="logo">🧑‍🏫</div><div><h1>Guardian view</h1><p>${data.source === 'cloud' ? '☁️ Live from Firebase' : '💻 This browser only'} · refreshed ${new Date().toLocaleTimeString('en-AU')}</p></div></div>
      <div class="stats"><select id="stu" class="chip">${ids.map(s => `<option value="${esc(s)}" ${s === sel ? 'selected' : ''}>${esc(nameOf(s))}</option>`).join('') || '<option>No students yet</option>'}</select><button class="small" id="ref">↻ Refresh</button><label class="chip"><input type="checkbox" id="auto" ${timer ? 'checked' : ''}> auto (30s)</label><button class="small ghost" id="csv">⬇ CSV</button><button class="small ghost" id="tn">🔔 Test alert</button><a href="index.html"><button class="small ghost">Student page</button></a></div></div>`;
    if (data.error) h += `<div class="card" style="border-color:#f5b0b0">⚠️ ${esc(data.error)}</div>`;
    if (data.source === 'local') h += `<div class="card" style="background:#fff9e6;border-color:#ffe29a">ℹ️ <b>Firebase isn't set up</b>, so this page can only see activity from <b>this same browser</b>. Follow the README (5 minutes) to see her activity from your own phone/computer.</div>`;
    if ((CFG.ADMIN_PASSCODE || '') === 'change-me') h += `<div class="card" style="background:#fff0f0;border-color:#f5b0b0">🔐 Change <code>ADMIN_PASSCODE</code> in <code>js/config.js</code>.</div>`;
    if (!sel) { APP.innerHTML = h + `<div class="card">No activity yet. Once she starts a mission it appears here.</div>`; bind(); return; }
    const stats = Array.from({ length: C.count }, (_, i) => modStats(sel, i)), doneN = stats.filter(s => s.done).length, leavesT = stats.reduce((a, s) => a + s.leaves, 0), awayT = stats.reduce((a, s) => a + s.away, 0), okT = stats.reduce((a, s) => a + s.ok, 0), cluesT = stats.reduce((a, s) => a + s.clues, 0), last = e.length ? e[e.length - 1].t : 0;
    h += `<div class="kpis"><div class="kpi"><b>${doneN}/${C.count}</b>modules finished</div><div class="kpi"><b>${okT}</b>questions right</div><div class="kpi"><b style="color:${leavesT ? '#c0392b' : '#1f9d62'}">${leavesT}</b>times left the page</div><div class="kpi"><b>${dur(awayT)}</b>total time away</div><div class="kpi"><b>${cluesT}</b>clues asked</div><div class="kpi"><b style="font-size:22px">${ago(last)}</b>last active</div></div>
    <div class="card"><h3 style="margin-top:0">Modules <span class="small">(green = finished, yellow = in progress, red line = left the page)</span></h3><div class="mgrid">${stats.map((s, i) => `<div class="mcell ${s.done ? 'done' : s.started ? 'part' : ''} ${s.leaves ? 'flag' : ''} ${i === selMod ? 'sel' : ''}" data-m="${i}" title="${esc(C.PLAN[i][0])}">${i + 1}<br><span class="small">${s.started ? s.ok + '/30' : '–'}</span>${access(sel, i) === 'open' ? '<span class="small">🔓</span>' : access(sel, i) === 'lock' ? '<span class="small">🔒</span>' : ''}</div>`).join('')}</div>
    <div class="stats" style="margin-top:10px"><button class="small" data-act="openall">🔓 Open all modules</button><button class="small ghost" data-act="auto">↩ Back to automatic (clears 🔓/🔒)</button><button class="small ${vip(sel) ? '' : 'ghost'}" data-act="${vip(sel) ? 'unvip' : 'vip'}">👑 ${vip(sel) ? 'Admin account: ON (everything open, no tracking)' : 'Make this an admin account'}</button><button class="small ${silent(sel) ? '' : 'ghost'}" data-act="${silent(sel) ? 'unsilent' : 'silent'}">🔕 Silent mode: ${silent(sel) ? 'ON' : 'off'}</button><span class="small">Click a module to open, lock, finish or reset it. 🔓 = forced open, 🔒 = forced locked.</span></div></div>
    ${studentsCard(ids)}`;
    if (selMod >= 0) h += detail(sel, selMod, stats[selMod]);
    h += leaveTable(sel) + timeline(e);
    APP.innerHTML = h; bind();
  }
  function detail(sid, i, s) {
    const m = buildMod(i), p = s.p, es = s.es, comp = es.filter(x => x.type === 'module_complete').pop();
    let h = `<div class="card"><h3 style="margin-top:0">${label(i)}: ${esc(m.title)} ${s.done ? '<span class="tag green">finished</span>' : '<span class="tag amber">in progress</span>'}</h3><div class="stats" style="margin:6px 0"><button class="small" data-act="mopen" data-m="${i}">🔓 Force open</button><button class="small ghost" data-act="mlock" data-m="${i}">🔒 Force lock</button><button class="small ghost" data-act="mauto" data-m="${i}">↩ Automatic</button><button class="small" data-act="mdone" data-m="${i}">✅ Mark whole module complete</button><button class="small ghost" data-act="mreset" data-m="${i}" style="color:#c0392b">⟲ Reset module</button><span class="small">Now: ${access(sid, i) === 'open' ? 'forced open' : access(sid, i) === 'lock' ? 'forced locked' : 'automatic'}</span></div><p class="small">Changes reach her device within ~10 seconds if she is on the site, otherwise next time she opens it.</p>
    <p class="small">Score ${s.ok}/30 · active time ${dur(s.ms || (comp ? comp.durationMs : 0))} · left page ${s.leaves}× (${dur(s.away)} away) · ${s.clues} clues · ${s.blocked} blocked actions (copy / paste / shortcuts)</p>
    <div style="overflow:auto;max-height:560px"><table class="atable"><thead><tr><th>#</th><th>Topic</th><th>Question</th><th>Result</th><th>Tries</th><th>Time</th><th>Wrong answers</th><th>Clues</th><th>Left page here</th><th>Working</th><th>Admin</th></tr></thead><tbody>`;
    m.questions.forEach(q => {
      const x = p && p.q ? p.q[q.id] : null, byEv = es.filter(e => e.qid === q.id), a = es.filter(e => e.type === 'answer' && e.qid === q.id), wrong = x ? x.wrong || [] : a.filter(e => !e.ok).map(e => e.given), lv = es.filter(e => e.type === 'leave' && e.q === q.n + 1).length;
      const ok = x ? x.ok : a.some(e => e.ok), rev = x ? x.rev : es.some(e => e.type === 'reveal' && e.qid === q.id), tries = x ? x.att || 0 : a.length, cl = x ? x.clues || 0 : es.filter(e => e.type === 'clue' && e.qid === q.id).length;
      h += `<tr><td>${q.n + 1}</td><td>${C.TOPICS[q.topic][1]} ${esc(C.TOPICS[q.topic][0])}</td><td>${esc(M.strip(q.prompt).slice(0, 150))}<div class="small">Answer: ${esc(M.displayAnswer(q))}</div></td><td>${ok ? '<span class="tag green">right</span>' : rev ? '<span class="tag amber">shown</span>' : tries ? '<span class="tag red">not yet</span>' : '<span class="tag grey">–</span>'}</td><td>${tries || ''}</td><td>${x && x.ms ? dur(x.ms) : ''}</td><td>${esc(wrong.slice(0, 6).join(', '))}</td><td>${cl || ''}</td><td>${lv ? '<span class="tag red">' + lv + '×</span>' : ''}</td><td>${workKeys[q.id] ? `<button class="small" data-act="work" data-q="${esc(q.id)}" data-n="${q.n + 1}">✏️ View</button>` : ''}</td><td style="white-space:nowrap">${ok ? '' : `<button class="small" data-act="qdone" data-m="${i}" data-q="${esc(q.id)}" title="Mark right">✔</button> `}${tries || ok || rev ? `<button class="small ghost" data-act="qreset" data-m="${i}" data-q="${esc(q.id)}" title="Reset question">⟲</button>` : ''}</td></tr>`;
    });
    return h + '</tbody></table></div></div>';
  }
  function studentsCard(ids) {
    if (!ids.length) return '';
    return `<div class="card"><h3 style="margin-top:0">Students</h3><table class="atable"><thead><tr><th>Name</th><th>Finished</th><th>Last active</th><th></th></tr></thead><tbody>${ids.map(id => { const es = evs(id), d = Object.values((data.progress[id] || {}).mods || {}).filter(m => m && m.done).length; return `<tr><td>${esc(nameOf(id))}</td><td>${d}/${C.count}</td><td>${es.length ? ago(es[es.length - 1].t) : '–'}</td><td><button class="small ghost" data-act="view" data-s="${esc(id)}">View</button> <button class="small ghost" data-act="del" data-s="${esc(id)}" style="color:#c0392b">🗑 Delete</button></td></tr>`; }).join('')}</tbody></table></div>`;
  }
  function leaveTable(sid) {
    const es = evs(sid), rows = es.filter(e => e.type === 'leave').reverse();
    let h = `<div class="card"><div class="top"><h3 style="margin:0">🚪 Every time she left the page <span class="small">(newest first)</span></h3>${rows.length ? '<button class="small ghost" data-act="clearleaves" style="color:#c0392b">🗑 Delete all</button>' : ''}</div>`;
    if (!rows.length) return h + '<p>None recorded. 🎉</p></div>';
    h += `<div style="overflow:auto;max-height:420px"><table class="atable"><thead><tr><th>Left at</th><th>Module</th><th>Question</th><th>How</th><th>Away for</th><th></th></tr></thead><tbody>`;
    rows.slice(0, 200).forEach(l => {
      const r = es.find(e => e.type === 'return' && e.t >= l.t && e.mod === l.mod), cl = es.find(e => e.type === 'page-closed' && e.t >= l.t && e.mod === l.mod && (!r || e.t < r.t));
      const why = { 'tab-hidden': 'Switched tab / app', 'window-blur': 'Clicked another window' }[l.reason] || l.reason;
      h += `<tr class="leave"><td>${fmtT(l.t)}</td><td>${label((l.mod || 1) - 1)}</td><td><b>Q${l.q}</b><div class="small">${esc((l.qText || '').slice(0, 110))}</div></td><td>${esc(why)}</td><td>${r ? '<b>' + dur(r.awayMs || r.t - l.t) + '</b>' : cl ? '<span class="tag red">closed the page</span>' : '<span class="tag amber">still away / not returned</span>'}</td><td><button class="small ghost" data-act="delleave" data-k="${esc(l._k)}" data-r="${r ? esc(r._k) : ''}" data-c="${cl ? esc(cl._k) : ''}" data-m="${(l.mod || 1) - 1}" data-away="${r ? r.awayMs || 0 : 0}" title="Delete this entry">🗑</button></td></tr>`;
    });
    return h + '</tbody></table></div></div>';
  }
  const kindTag = e => ({ leave: ['red', 'left page'], return: ['amber', 'came back'], answer: [e.ok ? 'green' : 'grey', e.ok ? 'right' : 'wrong'], clue: ['blue', 'clue'], reveal: ['amber', 'shown answer'], blocked: ['amber', 'blocked: ' + (e.kind || '')], module_complete: ['green', 'FINISHED'], module_start: ['blue', 'started'], module_resume: ['blue', 'resumed'], 'fullscreen-exit': ['red', 'left full screen'], 'devtools-suspected': ['red', 'dev tools?'], idle: ['grey', 'idle'], 'idle-end': ['grey', 'back from idle'], 'page-closed': ['red', 'closed page'], session_start: ['grey', 'opened site'], module_exit: ['grey', 'left module'], riddle_reveal: ['grey', 'riddle'], work: ['blue', 'saved working'], admin_cmd: ['blue', 'teacher: ' + (e.cmd || '')] }[e.type] || ['grey', e.type]);
  function timeline(es) {
    const f = { all: () => true, leaves: e => ['leave', 'return', 'page-closed', 'fullscreen-exit', 'devtools-suspected', 'idle', 'idle-end'].includes(e.type), wrong: e => e.type === 'answer' && !e.ok, clues: e => e.type === 'clue' || e.type === 'reveal', blocked: e => e.type === 'blocked', done: e => ['module_complete', 'module_start', 'module_resume', 'module_exit'].includes(e.type) }[filter];
    const rows = es.filter(f).reverse().slice(0, 300);
    let h = `<div class="card"><div class="top"><h3 style="margin:0">Activity log</h3><select id="flt" class="chip">${[['all', 'Everything'], ['leaves', 'Leaving / returning'], ['wrong', 'Wrong answers'], ['clues', 'Clues & shown answers'], ['blocked', 'Blocked actions'], ['done', 'Modules']].map(o => `<option value="${o[0]}" ${o[0] === filter ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div><div style="overflow:auto;max-height:520px"><table class="atable"><thead><tr><th>When</th><th>What</th><th>Module / Q</th><th>Details</th></tr></thead><tbody>`;
    rows.forEach(e => {
      const k = kindTag(e); let d = '';
      if (e.type === 'answer') d = `“${esc(e.given)}” (try ${e.att}) – ${esc((e.qText || '').slice(0, 90))}`; else if (e.type === 'clue') d = `clue ${e.n}${e.ai ? ' (AI)' : ' (built-in)'}: ${esc((e.text || '').slice(0, 140))}`; else if (e.type === 'leave') d = esc(e.reason) + ' – ' + esc((e.qText || '').slice(0, 90)); else if (e.type === 'return') d = 'away ' + dur(e.awayMs || 0); else if (e.type === 'module_complete') d = `${e.score}/30 · ${dur(e.durationMs || 0)} · left ${e.leaves}× · ${e.clues} clues`; else d = esc(e.qText || e.title || '');
      h += `<tr class="${e.type === 'leave' ? 'leave' : e.type === 'blocked' ? 'blocked' : ''}"><td>${fmtT(e.t)}</td><td><span class="tag ${k[0]}">${esc(k[1])}</span></td><td>${e.mod ? label(e.mod - 1) : ''}${e.q ? ' · Q' + e.q : ''}</td><td>${d}</td></tr>`;
    });
    return h + '</tbody></table></div></div>';
  }
  function bind() {
    const $ = id => document.getElementById(id);
    if ($('stu')) $('stu').onchange = e => { sel = e.target.value; selMod = -1; render(); };
    if ($('ref')) $('ref').onclick = async () => { await load(); render(); };
    if ($('auto')) $('auto').onchange = e => { clearInterval(timer); timer = 0; if (e.target.checked) timer = setInterval(async () => { await load(); render(); }, 30000); };
    if ($('flt')) $('flt').onchange = e => { filter = e.target.value; render(); };
    if ($('csv')) $('csv').onclick = exportCsv;
    if ($('tn')) $('tn').onclick = () => { if (!CFG.NTFY_TOPIC) { alert('Set NTFY_TOPIC in js/config.js first (see README).'); return; } fetch('https://ntfy.sh/', { method: 'POST', body: JSON.stringify({ topic: CFG.NTFY_TOPIC, title: 'MathQuest test', message: 'Alerts are working! 🎉', tags: ['tada'] }) }).then(() => alert('Sent. Check your phone.')).catch(() => alert('Could not send.')); };
    document.querySelectorAll('[data-act]').forEach(b => b.onclick = e => { e.stopPropagation(); const a = b.dataset.act, m = +b.dataset.m, q = b.dataset.q, sid = sel, S = encodeURIComponent(sel);
      if (a === 'view') { sel = b.dataset.s; selMod = -1; render(); window.scrollTo(0, 0); }
      else if (a === 'del') delUser(b.dataset.s);
      else if (a === 'vip') act(async () => { await send('PUT', `control/${S}/all`, true); await send('PUT', `control/${S}/silent`, true); }, 'Admin account on: everything open, no leave tracking or alerts.');
      else if (a === 'unvip') act(async () => { await send('DELETE', `control/${S}/all`); await send('DELETE', `control/${S}/silent`); }, 'Back to a normal student account.');
      else if (a === 'silent') act(() => send('PUT', `control/${S}/silent`, true), 'Silent mode on.');
      else if (a === 'unsilent') act(() => send('DELETE', `control/${S}/silent`), 'Silent mode off.');
      else if (a === 'delleave') { const k = b.dataset.k; act(async () => { await Promise.all([k, b.dataset.r, b.dataset.c].filter(Boolean).map(x => send('DELETE', `events/${S}/${encodeURIComponent(x)}`))); await cmd(sid, { type: 'unleave', mod: +b.dataset.m, awayMs: +b.dataset.away || 0 }); }, 'Entry deleted.'); }
      else if (a === 'clearleaves') { if (confirm('Delete every leave / return record for this student?')) act(async () => { const ks = evs(sid).filter(x => ['leave', 'return', 'page-closed'].includes(x.type)).map(x => x._k); await Promise.all(ks.map(x => send('DELETE', `events/${S}/${encodeURIComponent(x)}`))); await cmd(sid, { type: 'clearLeaves', mod: 0 }); }, 'All leave records deleted.'); }
      else if (a === 'work') viewWork(sid, b.dataset.q, b.dataset.n);
      else if (a === 'openall') act(() => send('PUT', `control/${S}/all`, true), 'All modules opened.');
      else if (a === 'auto') act(async () => { await send('DELETE', `control/${S}/all`); await send('DELETE', `control/${S}/access`); }, 'Back to automatic unlocking.');
      else if (a === 'mopen') act(() => send('PUT', `control/${S}/access/${m}`, 'open'), `Module ${m + 1} forced open.`);
      else if (a === 'mlock') act(() => send('PUT', `control/${S}/access/${m}`, 'lock'), `Module ${m + 1} locked.`);
      else if (a === 'mauto') act(() => send('DELETE', `control/${S}/access/${m}`), `Module ${m + 1} automatic.`);
      else if (a === 'mdone') { if (confirm(`Mark every question in module ${m + 1} as correct and finish it?`)) act(() => cmd(sid, { type: 'completeMod', mod: m }), 'Queued: module will be marked complete.'); }
      else if (a === 'mreset') { if (confirm(`Erase her progress in module ${m + 1}?`)) act(() => cmd(sid, { type: 'resetMod', mod: m }), 'Queued: module will be reset.'); }
      else if (a === 'qdone') act(() => cmd(sid, { type: 'completeQ', mod: m, qid: q }), 'Queued: question marked right.');
      else if (a === 'qreset') act(() => cmd(sid, { type: 'resetQ', mod: m, qid: q }), 'Queued: question reset.');
    });
    document.querySelectorAll('.mcell').forEach(c => c.onclick = () => { selMod = selMod === +c.dataset.m ? -1 : +c.dataset.m; render(); if (selMod >= 0) window.scrollTo({ top: document.querySelector('.mgrid').offsetTop + 160, behavior: 'smooth' }); });
  }
  async function viewWork(sid, qid, n) {
    try { const r = await fetch(`${db}/mathquest/work/${encodeURIComponent(sid)}/${encodeURIComponent(qid)}.json`), j = await r.json(); if (!j || !j.img) { alert('No working found.'); return; }
      const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;background:rgba(20,10,50,.6);z-index:99;display:flex;align-items:center;justify-content:center;padding:14px'; o.onclick = () => o.remove();
      o.innerHTML = `<div style="background:#fff;border-radius:18px;padding:14px;max-width:900px;width:100%"><b>Question ${esc(n)} working</b> <span class="small">· saved ${fmtT(j.t)} · click anywhere to close</span><img src="${j.img}" style="width:100%;border:2px solid #ddd;border-radius:10px;margin-top:8px"></div>`; document.body.appendChild(o);
    } catch (e) { alert('Could not load: ' + e.message); }
  }
  function exportCsv() {
    const es = evs(sel), cols = ['time', 'type', 'module', 'q', 'detail'], q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
    const rows = es.map(e => [new Date(e.t).toISOString(), e.type, e.mod || '', e.q || '', (e.given || e.reason || e.kind || e.text || e.qText || '') + (e.awayMs ? ' away ' + dur(e.awayMs) : '')].map(q).join(','));
    const blob = new Blob([cols.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mathquest-${sel}.csv`; a.click();
  }
  async function start() { APP.innerHTML = '<div class="card">Loading…</div>'; await load(); render(); }
  gate();
})();

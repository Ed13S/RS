/* MathQuest tracker: event log -> Firebase Realtime Database (REST) + local fallback + ntfy phone alerts */
(function (g) {
  'use strict';
  const CFG = () => g.MQ_CONFIG || {};
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const slug = s => String(s || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'student';
  const dbUrl = () => (CFG().FIREBASE_DB_URL || '').replace(/\/+$/, '');

  const T = {
    sid: '', name: '', queue: LS.get('mq_queue', []), busy: false, LS, slug,
    init(name) { T.name = name; T.sid = slug(name); },
    log(type, data) {
      const ev = Object.assign({ t: Date.now(), sid: T.sid, name: T.name, type }, data || {});
      const local = LS.get('mq_events_local', []); local.push(ev); if (local.length > 6000) local.splice(0, local.length - 6000); LS.set('mq_events_local', local);
      if (dbUrl()) { T.queue.push(ev); LS.set('mq_queue', T.queue); T.flush(); }
      return ev;
    },
    flush(keepalive) {
      const url = dbUrl(); if (!url || !T.queue.length || (T.busy && !keepalive)) return;
      T.busy = true; const batch = T.queue.slice(0, 200), body = {};
      batch.forEach((e, i) => { body[e.t + '-' + i + '-' + Math.random().toString(36).slice(2, 6)] = e; });
      fetch(`${url}/mathquest/events/${encodeURIComponent(T.sid)}.json`, { method: 'PATCH', body: JSON.stringify(body), keepalive: !!keepalive && JSON.stringify(body).length < 60000 })
        .then(r => { if (!r.ok) throw new Error(r.status); T.queue.splice(0, batch.length); LS.set('mq_queue', T.queue); T.busy = false; if (T.queue.length) T.flush(); })
        .catch(() => { T.busy = false; setTimeout(() => T.flush(), 15000); });
    },
    saveProfile(summary) {
      const url = dbUrl(); if (!url || !T.sid) return;
      fetch(`${url}/mathquest/students/${encodeURIComponent(T.sid)}.json`, { method: 'PATCH', body: JSON.stringify(Object.assign({ name: T.name, lastSeen: Date.now() }, summary || {})) }).catch(() => { });
    },
    loadCloudProgress() {
      const url = dbUrl(); if (!url || !T.sid) return Promise.resolve(null);
      return fetch(`${url}/mathquest/progress/${encodeURIComponent(T.sid)}.json`).then(r => r.ok ? r.json() : null).catch(() => null);
    },
    saveCloudProgress(p) {
      const url = dbUrl(); if (!url || !T.sid) return;
      fetch(`${url}/mathquest/progress/${encodeURIComponent(T.sid)}.json`, { method: 'PUT', body: JSON.stringify(p) }).catch(() => { });
    },
    notify(title, message, tags, priority) {
      const topic = CFG().NTFY_TOPIC; if (!topic) return;
      fetch('https://ntfy.sh/', { method: 'POST', body: JSON.stringify({ topic, title, message, tags: tags || ['books'], priority: priority || 3 }) }).catch(() => { });
    }
  };
  g.addEventListener && g.addEventListener('pagehide', () => T.flush(true));
  g.addEventListener && g.addEventListener('online', () => T.flush());
  g.MQ = g.MQ || {}; g.MQ.Tracker = T; g.MQ.LS = LS;
})(typeof window !== 'undefined' ? window : globalThis);

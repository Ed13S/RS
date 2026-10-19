# MathQuest

A 30-module maths catch-up course (30 questions per module, ~900 questions) with a hidden picture that reveals tile by tile, a "Professor Pip" clue helper, daily jokes/riddles, and an admin page.

## Deploy
1. Put these files in a GitHub repo (root). Settings → Pages → Deploy from branch `main` / root.
2. Open `https://<user>.github.io/<repo>/`.

## Configure (`js/config.js`)
- `ADMIN_PASSCODE` – change it. Type `admin` in the home-page search bar to reach `admin.html`.
- `FIREBASE_DB_URL` – create a Firebase Realtime Database (test-mode rules), paste its URL. Lets the admin page see activity from her device. Note: the URL is public.
- `NTFY_TOPIC` – pick a long random topic, install the ntfy app, subscribe. You get a phone alert when she finishes a module (`NOTIFY_ON_LEAVE:true` also alerts on leaving the page).
- `CLUE_API_KEY` – Anthropic key for clues. It is visible to anyone who views the page source, and GitHub may auto-revoke it. Safer: deploy `worker.js` on Cloudflare Workers (key stored as a secret) and set `CLUE_PROXY_URL`. Set a spend limit either way. Without a key, built-in hints are used.
- `DAYS_PER_WEEK`, `UNLOCK_ALL` – pacing / unlock everything for testing.

## Tracking and limits
Logged: tab switches, window blur, fullscreen exit, idle, copy/paste/right-click, blocked shortcuts, devtools heuristic, per-question tries, wrong answers, time and clues. A web page cannot be truly locked down; this is monitoring, not prevention. The admin passcode is a soft client-side lock.

## Tests
`node test/course-test.js` checks all 900 questions.

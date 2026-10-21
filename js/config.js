/* ============================================================
   MathQuest settings  -  edit this file, then commit it to GitHub.
   Everything here is optional; the site works with all of it blank
   (progress + tracking then stay in the student's own browser).
   ============================================================ */
window.MQ_CONFIG = {
  // Leave blank to ask for the student's first name on her first visit.
  STUDENT_NAME: "",

  // Passcode for the admin page (admin.html, or type "admin" in the search bar).
  // NOTE: this is a soft lock. See README for how to make it properly private.
  ADMIN_PASSCODE: "ES",

  // ---- Remote tracking (so YOU can see activity from your own device) ----
  // Firebase Realtime Database URL, e.g. "https://my-maths-default-rtdb.firebaseio.com"
  FIREBASE_DB_URL: "https://mathquest-d3d0b-default-rtdb.asia-southeast1.firebasedatabase.app/",

  // ---- Phone alerts when she finishes a module (free, no account) ----
  // Install the free "ntfy" app, subscribe to this topic name. Make it long and random.
  NTFY_TOPIC: "mathquest",
  NOTIFY_ON_LEAVE: true,           // also ping you every time she leaves the page

  // ---- AI clues ("Professor Pip") ----
  // Anthropic API key. WARNING: anything in this file is public once it is on GitHub Pages.
  // Use a key with a small spend limit, or use CLUE_PROXY_URL instead (see README).
  CLUE_API_KEY: "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",
  CLUE_MODEL: "openrouter/free",
  CLUE_PROXY_URL: "",              // optional: your own endpoint that holds the key
  MAX_CLUES: 3,                    // clues allowed per question
CLUES_PER_DAY: 10,
   
  // ---- Course layout ----
  DAYS_PER_WEEK: 1,                // 1 = "Week 1, Week 2 ..."; 5 = "Week 1 Day 1 ... Day 5"
  UNLOCK_ALL: false                // true = every module open from the start (handy for testing)
};

# Maths Explorer (GitHub Pages starter)

## Publish
1. Create a GitHub repository.
2. Upload `index.html` and `reveal.svg` to the repository root.
3. In **Settings → Pages**, publish from the `main` branch and `/ (root)`.
4. Open the published URL.

## Student use
- 30 weekly missions, 10 questions per mission (300 total).
- Correct answers turn green and uncover a tile of the adventure picture.
- Progress is saved in the current browser using localStorage.
- The student can type `admin` in the search field to open the guardian dashboard.

## Important limitations
This is a static front-end demo, not a secure locked-down browser or remote monitoring service.
- A GitHub Pages site cannot keep a secret API key. Any key placed in HTML/JavaScript can be copied and abused. This version uses built-in hints, with no API key.
- Admin logs and progress are stored only in the browser/device where the student works. They are not sent to you automatically and will not sync between devices.
- The page can record `visibilitychange` and window-blur events, but cannot prove exactly what the child did elsewhere or prevent leaving the page. Browser/OS controls are needed for actual kiosk/locked-down behaviour.
- There is no password protecting the `admin` view in this demo. Anyone who knows the keyword on that device can open it. For private reports, use authentication plus a backend (e.g. a serverless function and database) and keep any AI API key on the server.

## Course design
The plan is 30 weekly missions that gradually build from foundational skills toward more advanced topics. It intentionally avoids isolated basic addition/subtraction/multiplication/division drills; these operations appear inside missing-number puzzles and multi-step word problems. The starter includes 10 questions per mission, each with an answer, worked explanation, and hint. Review question wording and answers before assigning it as formal assessment.

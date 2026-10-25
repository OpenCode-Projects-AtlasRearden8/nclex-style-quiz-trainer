# STATUS.md

_Last verified: 2026-10-25_

## What was built

**NCLEX-Style Quiz Trainer** — an education-only study web app (`index.html`, HTML/CSS/JS,
zero dependencies) for nursing-style multiple-choice questions.

Features implemented:

- **JSON question banks** with required explanations and optional public-source citations.
  A validator (`Engine.validateBank`) enforces the schema and reports exact field errors.
- **Practice mode** — instant feedback + explanation per question; misses are re-asked
  later in the same session until cleared (fixed 3-question requeue delay).
- **Exam mode** — all questions, no feedback until grade time, optional per-bank timer
  with auto-submit, question flagging, pass-mark verdict after grading.
- **Wrong-answer review** — Review tab shows last-session misses, all-ever misses, a box
  histogram, and one-click "practice these" sessions.
- **Spaced re-ask of misses** — Leitner boxes 0–5 with day intervals [0, 1, 2, 4, 7, 14];
  a miss drops to box 0 (due immediately), a correct answer climbs a box. Due counts
  surface on the home page and the Review tab.
- **Progress saved in localStorage** — per-bank stats, session history (last 50), best
  exam score, plus a resumable active session snapshot. In-memory fallback when storage
  is unavailable (with graceful degradation).
- **Disclaimer + facility-policy reminder on every page** — persistent footer banner on
  every view, plus a first-run acknowledgement modal that must be ticked to proceed.
- **Starter public-knowledge bank** — 46 original single-best-answer questions across 9
  categories (infection control, safety, medication safety, assessment, fundamentals,
  priority/delegation, patient education, nutrition & fluids, growth & development),
  written from widely published public guidance (CDC, WHO, Joint Commission, ADA, NCSBN,
  CMS) and cited per question.
- Import tab (file picker or paste JSON) with schema validation, replace-on-collision,
  and a starter template; About tab with safety/privacy/credit info.
- Light/dark auto theming, responsive layout, print styles, reduced-motion support,
  keyboard answering (1–4, Enter), ARIA roles/live regions.
- `tools/sync-bank.js` regenerates `js/starter-bank-embedded.js` from
  `data/starter-bank.json` (check the generated file into git so `file://` works offline);
  `tools/check-bank.js` validates any bank from the command line.
- 37-test dependency-free test suite for the quiz engine logic (validation, deck
  building, practice requeue flow, exam grading, scoring, Leitner scheduling, storage
  round-trips, fallbacks, starter-bank integrity).

## How to run it

- **No install:** open `index.html` in any modern browser (works from `file://` because
  the starter bank is also embedded).
- **With a server (optional):** `python3 -m http.server 8000` → http://localhost:8000
- **Tests:** `npm test` (Node ≥ 16, no dependencies installed by the project).
- **Bank tooling:** `npm run sync-bank`, `npm run check-bank <file>`.

## Verification results (all run in this folder)

- `node --check` syntax check on all 13 JS files: **pass**.
- `npm test`: **37/37 tests pass** (engine 20, storage 10, bank integrity 7).
  During development the suite caught and pinned down 3 real fixes: unvisited-exam
  question scoring, requeue insertion position, and storage export shape.
- `node tools/check-bank.js`: starter bank valid — 46 questions, 9 categories,
  exam 75% pass / 45 min, all explanations substantive, all ids unique.
- `node tools/sync-bank.js && node --check js/starter-bank-embedded.js`:
  regenerated embedded bank, syntax **pass**; a test also asserts the embedded copy
  is byte-equivalent in content to the JSON source.
- HTTP smoke test (`python3 -m http.server` + curl): **200** for `/`,
  `index.html`, `styles.css`, all 8 `js/*` script files, and `data/starter-bank.json`;
  the served JSON re-validated through the engine when fetched.
- Static cross-reference audit: every `getElementById` used by the view layer exists in
  the rendered HTML or the app shell; every `NCLEX.App.*` call from `quiz.js` and
  `NCLEX.Quiz.*` call from `app.js` resolves to an exported API.

## Known gaps / honest limitations

- The browser view layer (`quiz.js`, `app.js`) is verified by syntax checks, a static
  cross-reference audit, and the HTTP smoke test — there is no automated
  browser/DOM-level test suite (the project deliberately ships zero dependencies);
  flows were hand-reviewed but not clicked through in a real browser here.
- Practice requeue uses a fixed 3-question delay (not randomized); exam flagging has
  no per-question jump grid (Prev/Next + flag counter only).
- No choose-all-that-apply, cloze, or case-study (NGN-style) item types; single
  best answer only.
- Deck sizes are the fixed quick choices 10 / 20 / all; no arbitrary count input.
- The spaced scheduler is a simple Leitner ladder (no fuzzy or load-balanced scheduling).
- No progress export/import (CSV or JSON) yet; no per-question history log.
- Single language (English); no offline PWA/service-worker caching.
- Accessibility is good-faith semantic markup + ARIA + keyboard support, not a
  professional audit.
- The app intentionally ships no analytics, accounts, or backend — that is by design,
  not a gap, but it does mean there is no cross-device sync.

## Safety framing (repeated on purpose)

Education-only. Never medical advice. Real practice defers to the facility's current
policies, procedures, and point-of-care references. The footer banner says this on
every page, the first-run modal requires acknowledgement, and the README says it again.

MIT License. Copyright (c) 2026 Asdale Dynamics, LLC. Project by
[Asdale Dynamics, LLC](https://dylanasdale.github.io).

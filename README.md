# NCLEX-Style Quiz Trainer

A friendly, education-only study trainer for nursing-style multiple-choice questions.
It ships with a starter bank of 46 original, public-knowledge questions, supports
practice, exam, and wrong-answer-review modes, and quietly re-asks your misses using
a spaced schedule (Leitner boxes) until they stick.

Study tool. **Never medical advice.** In real practice, follow your facility's current
policies, procedures, and point-of-care references — always, with no exceptions.

Brought to you by **Asdale Dynamics, LLC** — part of a beginner-friendly collection of
practical tools and guides. Learn more at <https://dylanasdale.github.io>.

## Quick start

No install, no build step, no dependencies:

1. Download or clone this folder.
2. **Open `index.html` in any modern browser.** That's the whole app — it runs entirely
   in the page. The starter bank is embedded, so even double-clicking the file with no
   web server works.
3. (Optional, nicer URLs & live JSON banks) serve the folder instead:

   ```bash
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```

Progress, custom banks, and settings are saved in your browser's **localStorage** —
on this device only. Nothing is uploaded, ever. To wipe data, use **Progress →
Reset progress** (per bank) or your browser's site-data controls.

Run the quiz-engine test suite (requires Node 16+):

```bash
npm test
```

## What's inside

| Feature | How it works |
| --- | --- |
| Practice mode | Instant feedback after each answer with a full explanation; misses are re-asked later in the same session (3 questions later) until you clear them. |
| Exam mode | All questions, no feedback until the end, optional timer (set per bank), pass mark shown up front. Finished exams are graded and reviewed question by question. |
| Wrong-answer review | The Review tab shows misses from your last session and everything you have ever missed, with one-click "practice these" sessions. |
| Spaced re-ask of misses | A Leitner-box scheduler: a miss drops a question to box 0 (due immediately), a correct answer climbs a box, which stretches the interval before it returns. Intervals: box 0 → 0 days (due), 1 → 1 day, 2 → 2 days, 3 → 4 days, 4 → 7 days, 5 → 14 days. |
| Session resume | An unfinished session is saved automatically; the home page offers "Resume". Refreshing pages mid-quiz is safe. |
| JSON question banks | Author or import your own banks (Import tab or `data/*.json` when served over HTTP); the app validates everything. |
| Built-in disclaimer | A reminder banner is displayed on every page, and the first run asks you to acknowledge that this is educational study material only. |
| Keyboard friendly | `1–4` pick an answer, `Enter` checks / advances in practice mode. |

## Privacy & safety posture

- Local-first: all state lives in localStorage; the page makes no network calls after
  load (the only fetch attempted is an optional fresh copy of `data/starter-bank.json`
  when served over HTTP).
- No accounts, no tracking, no analytics, no secrets, no personal data.
- The built-in bank is original material written from widely published public guidance
  (CDC, WHO, Joint Commission, ADA, NCSBN, CMS summaries). No copyrighted test-prep
  content is included, and every question cites its source category.
- "NCLEX" is a trademark of NCSBN; this unaffiliated trainer is not endorsed by NCSBN.

## Authoring your own question bank (JSON schema)

A bank is a single JSON document. The canonical example lives at
`data/starter-bank.json`, and this embedded copy `js/starter-bank-embedded.js` is
**auto-generated from it — never edit that file by hand** (run `npm run sync-bank`
after editing the JSON).

```json
{
  "schemaVersion": 1,
  "id": "your-unique-bank-id",
  "name": "Your Bank Name",
  "version": "1.0.0",
  "description": "What this bank covers, one or two sentences.",
  "exam": { "passPct": 75, "minutes": 30 },
  "questions": [
    {
      "id": "q-001",
      "category": "Fundamentals",
      "difficulty": "medium",
      "question": "Full question text, single best answer, one sentence or two.",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answerIndex": 2,
      "explanation": "Why the keyed answer is right — the teaching value lives here.",
      "references": ["CDC hand-hygiene guidance (public)"]
    }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `schemaVersion` | yes | must be `1` |
| `id` | yes | unique string across all banks you load; collisions offer a replace dialog |
| `name` | yes | shown on the home page |
| `version` | no | defaults to `1.0.0` |
| `description` | no | plain text |
| `exam.passPct` | no | number 1–100, default 75 |
| `exam.minutes` | no | positive number for a timed exam, or `null`/omitted = untimed |
| `questions[].id` | yes | must be unique within the bank (`q-001`, …) |
| `questions[].category` | no | defaults to `General`; used for score breakdowns |
| `questions[].difficulty` | no | `easy`, `medium`, or `hard` (default `medium`) |
| `questions[].question` | yes | non-empty string |
| `questions[].choices` | yes | 2 or more non-empty strings; 4 is the sweet spot |
| `questions[].answerIndex` | yes | zero-based index into `choices` |
| `questions[].explanation` | yes | required — a study bank without rationales is a trivia game |
| `questions[].references` | no | array of strings naming public sources |

### Guidelines for writing good items

- Single best answer; avoid "all of the above" and trick wording.
- Make distractors plausible — the kind of wrong idea a smart beginner holds.
- Put the teaching in the `explanation`: the why, not just the what.
- Prioritization items ("Which client first?") work well with an ABC/acute-vs-stable
  reasoning explained in the rationale.
- Stick to widely published public knowledge for safety-critical items, and cite the
  source family in `references`.
- Write original text. Do not copy items from commercial test-prep products.
- Validate before sharing:

```bash
node tools/check-bank.js path/to/your-bank.json
```

The tool prints exactly which fields failed and why (it also validates the starter
bank when run with no argument).

### Loading a bank

- **Import tab** (always works, incl. `file://`): choose a `.json` file or paste JSON,
  then "Validate & import". The bank is stored in localStorage on this device.
- **Served over HTTP** (e.g., `python3 -m http.server`): any JSON at `data/starter-bank.json`
  is fetched fresh at startup and replaces the embedded copy of the same id, so editing
  the JSON file on disk is enough while you iterate.

## Project layout

```
index.html                    the app shell
styles.css                    styles (light + dark, print, reduced motion)
js/engine.js                  pure quiz engine: validation, deck building, session
                              flow, grading, Leitner scheduling (UMD: browser + Node)
js/util.js                    tiny shared helpers
js/storage.js                 localStorage adapter with in-memory fallback (UMD)
js/bank-io.js                 bank parsing, validation, import helpers (UMD)
js/quiz.js                    quiz + results views (browser)
js/app.js                     router, home/review/progress/import/about, modals (browser)
js/starter-bank-embedded.js   AUTO-GENERATED from data/starter-bank.json (do not edit)
data/starter-bank.json        canonical starter bank (46 questions, 9 categories)
tools/sync-bank.js            regenerates the embedded bank from the JSON
tools/check-bank.js           validates any bank file from the command line
tests/                        dependency-free test suite (37 tests)
```

## Development

```bash
npm test         # run the whole test suite (no dependencies)
npm run sync-bank        # after editing data/starter-bank.json
npm run check-bank       # validate a bank file (pass a path)
```

The engine, storage, and bank-io modules are written to run in both the browser and
Node (`module.exports` when available, `window.NCLEX.*` otherwise), which is what makes
the logic testable without a DOM. The browser-only view layer (`quiz.js`, `app.js`) is
plain, dependency-free JavaScript.

## License

MIT. **Copyright (c) 2026 Asdale Dynamics, LLC** — see the LICENSE file.
If you improve it, a kind mention of the origin is appreciated but not required.

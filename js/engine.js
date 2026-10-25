(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NCLEX = root.NCLEX || {};
    root.NCLEX.Engine = factory();
  }
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this,
function () {
  "use strict";

  var SCHEMA_VERSION = 1;
  var DEFAULT_PASS_PCT = 75;
  var DEFAULT_EXAM_MINUTES = null;
  var MAX_BOX = 5;
  var REQUEUE_DELAY = 3;
  var REVIEW_INTERVALS_DAYS = [0, 1, 2, 4, 7, 14];
  var DAY_MS = 24 * 60 * 60 * 1000;
  var DIFFICULTIES = ["easy", "medium", "hard"];

  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    var out = Array.prototype.slice.call(arr);
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function validateQuestion(q, errors, index) {
    var norm = null;
    var errBefore = errors.length;
    var prefix = isPlainObject(q) && typeof q.id === "string" && q.id.length > 0
      ? q.id
      : "question #" + (index + 1);

    if (!isPlainObject(q)) {
      errors.push(prefix + ": must be an object");
      return null;
    }
    if (typeof q.id !== "string" || q.id.trim().length === 0) {
      errors.push(prefix + ": 'id' is required and must be a non-empty string");
    }
    if (typeof q.question !== "string" || q.question.trim().length === 0) {
      errors.push(prefix + ": 'question' text is required");
    }
    if (!Array.isArray(q.choices) || q.choices.length < 2) {
      errors.push(prefix + ": 'choices' must be an array of at least 2 options");
    } else {
      for (var c = 0; c < q.choices.length; c++) {
        if (typeof q.choices[c] !== "string" || q.choices[c].trim().length === 0) {
          errors.push(prefix + ": choice " + (c + 1) + " must be a non-empty string");
        }
      }
    }
    if (typeof q.answerIndex !== "number" || !Number.isInteger(q.answerIndex) ||
        !Array.isArray(q.choices) || q.answerIndex < 0 || q.answerIndex >= q.choices.length) {
      errors.push(prefix + ": 'answerIndex' must be an integer within the choices range");
    }
    if (typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
      errors.push(prefix + ": 'explanation' is required in a study bank");
    }
    var difficulty = "medium";
    if (q.difficulty !== undefined && q.difficulty !== null) {
      if (DIFFICULTIES.indexOf(q.difficulty) === -1) {
        errors.push(prefix + ": 'difficulty' must be one of " + DIFFICULTIES.join(", "));
      } else {
        difficulty = q.difficulty;
      }
    }
    if (q.references !== undefined && !Array.isArray(q.references)) {
      errors.push(prefix + ": 'references' must be an array of strings");
    }

    if (errors.length === errBefore) {
      norm = {
        id: q.id,
        category: typeof q.category === "string" && q.category.trim() ? q.category.trim() : "General",
        difficulty: difficulty,
        question: q.question,
        choices: Array.isArray(q.choices) ? q.choices.slice() : [],
        answerIndex: q.answerIndex,
        explanation: q.explanation,
        references: Array.isArray(q.references)
          ? q.references.filter(function (r) { return typeof r === "string"; })
          : []
      };
      if (norm.question && typeof norm.question === "string") {
        norm.question = norm.question.trim();
      }
      if (norm.explanation && typeof norm.explanation === "string") {
        norm.explanation = norm.explanation.trim();
      }
    }
    return norm;
  }

  function validateBank(raw) {
    var errors = [];

    if (!isPlainObject(raw)) {
      return { ok: false, errors: ["Bank must be a JSON object"], bank: null };
    }
    if (raw.schemaVersion !== SCHEMA_VERSION) {
      errors.push("schemaVersion must be " + SCHEMA_VERSION);
    }
    if (typeof raw.id !== "string" || raw.id.trim().length === 0) {
      errors.push("'id' is required and must be a non-empty string");
    }
    if (typeof raw.name !== "string" || raw.name.trim().length === 0) {
      errors.push("'name' is required and must be a non-empty string");
    }
    if (typeof raw.description === "undefined") {
      raw.description = "";
    } else if (typeof raw.description !== "string") {
      errors.push("'description' must be a string");
    }
    if (typeof raw.version === "undefined") {
      raw.version = "1.0.0";
    } else if (typeof raw.version !== "string") {
      errors.push("'version' must be a string");
    }

    var exam = raw.exam;
    if (typeof exam === "undefined" || exam === null) {
      exam = {};
    }
    if (!isPlainObject(exam)) {
      errors.push("'exam' must be an object with optional passPct and minutes");
      exam = {};
    }
    var passPct = exam.passPct;
    if (typeof passPct === "undefined" || passPct === null) {
      passPct = DEFAULT_PASS_PCT;
    } else if (typeof passPct !== "number" || !Number.isFinite(passPct) || passPct < 1 || passPct > 100) {
      errors.push("exam.passPct must be a number between 1 and 100");
      passPct = DEFAULT_PASS_PCT;
    }
    var minutes = exam.minutes;
    if (minutes === undefined) {
      minutes = DEFAULT_EXAM_MINUTES;
    } else if (minutes !== null && (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0)) {
      errors.push("exam.minutes must be a positive number or null (untimed)");
      minutes = DEFAULT_EXAM_MINUTES;
    }

    var questions = [];
    var seenIds = {};
    if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
      errors.push("'questions' must be a non-empty array of question objects");
    } else {
      for (var i = 0; i < raw.questions.length; i++) {
        var norm = validateQuestion(raw.questions[i], errors, i);
        if (norm) {
          if (seenIds[norm.id]) {
            errors.push("Duplicate question id: '" + norm.id + "'");
          } else {
            seenIds[norm.id] = true;
            questions.push(norm);
          }
        }
      }
    }

    return {
      ok: errors.length === 0,
      errors: errors,
      bank: errors.length === 0
        ? {
            schemaVersion: SCHEMA_VERSION,
            id: raw.id.trim(),
            name: raw.name.trim(),
            version: raw.version,
            description: raw.description,
            exam: { passPct: passPct, minutes: minutes },
            questions: questions
          }
        : null
    };
  }

  function buildDeck(bank, opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var only = opts.only && opts.only.length
      ? new Set(opts.only)
      : null;
    var pool = only ? bank.questions.filter(function (q) { return only.has(q.id); }) : bank.questions;
    var shuffled = shuffle(pool, rng);
    var count = opts.count;
    if (typeof count === "number" && count >= 1) {
      shuffled = shuffled.slice(0, Math.min(count, shuffled.length));
    }
    return shuffled;
  }

  function createSession(bank, mode, deck, startedAt) {
    var session = {
      bankId: bank.id,
      bankName: bank.name,
      mode: mode,
      startedAt: typeof startedAt === "number" ? startedAt : Date.now(),
      finished: false,
      deckSize: deck.length,
      bankMeta: {
        id: bank.id,
        name: bank.name,
        exam: { passPct: bank.exam.passPct, minutes: bank.exam.minutes }
      }
    };
    if (mode === "exam") {
      session.examOrder = deck.map(function (q) { return q.id; });
      session.pointer = 0;
      session.answers = {};
      session.flags = {};
      session.results = {};
      session.firstChoice = {};
    } else {
      session.queue = deck.map(function (q) { return { qid: q.id, isRequeue: false }; });
      session.deliveredOrder = [];
      session.results = {};
    }
    return session;
  }

  function currentQid(session) {
    if (session.mode === "exam") {
      if (session.finished || session.pointer >= session.examOrder.length) return null;
      return session.examOrder[session.pointer];
    }
    if (session.finished || session.queue.length === 0) return null;
    return session.queue[0].qid;
  }

  function requeueDelay() {
    return REQUEUE_DELAY;
  }

  function startDelivery(session, qid) {
    if (session.mode === "exam") {
      if (!session.results[qid]) {
        session.results[qid] = { first: null, attempts: 0, lastChoice: null, unanswered: true };
      }
      return;
    }
    if (!session.results[qid]) {
      session.deliveredOrder.push(qid);
      session.results[qid] = { first: null, attempts: 0, lastChoice: null, requeues: 0 };
    }
  }

  function answerPractice(session, q, choiceIndex) {
    var qid = q.id;
    startDelivery(session, qid);
    var r = session.results[qid];
    var correct = choiceIndex === q.answerIndex;
    if (r.first === null) {
      r.first = correct ? "correct" : "miss";
      r.firstChoice = choiceIndex;
    }
    r.attempts += 1;
    r.lastChoice = choiceIndex;

    var requeued = false;
    if (!correct && !r.resolved) {
      var insertAt = Math.min(1 + requeueDelay(), session.queue.length);
      session.queue.splice(insertAt, 0, { qid: qid, isRequeue: true });
      r.requeues += 1;
      requeued = true;
    } else if (correct && r.first === "miss") {
      r.resolved = true;
    }
    return { correct: correct, requeued: requeued };
  }

  function answerExam(session, qid, choiceIndex) {
    startDelivery(session, qid);
    session.answers[qid] = choiceIndex;
    session.results[qid].lastChoice = choiceIndex;
    if (choiceIndex !== null && choiceIndex !== undefined) {
      session.results[qid].unanswered = false;
    }
    session.firstChoice[qid] = session.firstChoice[qid] === undefined ? choiceIndex : session.firstChoice[qid];
  }

  function toggleFlag(session, qid) {
    session.flags[qid] = !session.flags[qid];
    return session.flags[qid];
  }

  function finishExam(session, byId) {
    for (var i = 0; i < session.examOrder.length; i++) {
      var qid = session.examOrder[i];
      var q = byId[qid];
      var choice = session.answers[qid];
      var hasAnswer = typeof choice === "number" && choice >= 0;
      var correct = hasAnswer && q && choice === q.answerIndex;
      var r = session.results[qid] || { first: null, lastChoice: null, attempts: 0 };
      r.first = hasAnswer ? (correct ? "correct" : "miss") : "miss";
      r.unanswered = !hasAnswer;
      session.results[qid] = r;
    }
    session.finished = true;
    session.score = scoreSession(session);
    return session;
  }

  function advance(session) {
    if (session.finished) return;
    if (session.mode === "exam") {
      session.pointer += 1;
      if (session.pointer >= session.examOrder.length) {
        session.finished = true;
      }
    } else {
      session.queue.shift();
      if (session.queue.length === 0) {
        session.finished = true;
      }
    }
  }

  function scoreSession(session) {
    var ids = session.mode === "exam" ? session.examOrder : session.deliveredOrder;
    var correct = 0;
    var missed = 0;
    var unanswered = 0;
    for (var i = 0; i < ids.length; i++) {
      var r = session.results[ids[i]];
      if (!r || r.first === null) {
        missed += 1;
        unanswered += 1;
        continue;
      }
      if (r.first === "correct") correct += 1;
      else {
        missed += 1;
        if (r.unanswered) unanswered += 1;
      }
    }
    var total = ids.length;
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    var passPct = session.bankMeta ? session.bankMeta.exam.passPct : DEFAULT_PASS_PCT;
    return {
      total: total,
      correct: correct,
      missed: missed,
      unanswered: unanswered,
      pct: pct,
      passed: pct >= passPct
    };
  }

  function scoreByCategory(session, byId) {
    var ids = session.mode === "exam" ? session.examOrder : session.deliveredOrder;
    var out = {};
    for (var i = 0; i < ids.length; i++) {
      var q = byId[ids[i]];
      if (!q) continue;
      var cat = q.category || "General";
      out[cat] = out[cat] || { total: 0, correct: 0 };
      out[cat].total += 1;
      var r = session.results[ids[i]];
      if (r && r.first === "correct") out[cat].correct += 1;
    }
    return out;
  }

  function updateStat(stat, isCorrect, now) {
    if (!stat) {
      stat = { box: 0, seen: 0, correct: 0, wrong: 0, lastResult: null, lastSeen: 0 };
    }
    stat.seen += 1;
    if (isCorrect) {
      stat.correct += 1;
      stat.box = Math.min(MAX_BOX, stat.box + 1);
      stat.lastResult = "correct";
    } else {
      stat.wrong += 1;
      stat.box = 0;
      stat.lastResult = "miss";
    }
    stat.lastSeen = now;
    return stat;
  }

  function isDue(stat, now) {
    if (!stat) return false;
    if (stat.lastResult === "miss") return true;
    var interval = REVIEW_INTERVALS_DAYS[clamp(stat.box, 0, REVIEW_INTERVALS_DAYS.length - 1)];
    return now - stat.lastSeen >= interval * DAY_MS;
  }

  function dueIds(stats, now) {
    return Object.keys(stats || {}).filter(function (id) { return isDue(stats[id], now); });
  }

  function boxHistogram(stats) {
    var out = {};
    for (var b = 0; b <= MAX_BOX; b++) out[b] = 0;
    Object.keys(stats || {}).forEach(function (id) {
      var s = stats[id];
      out[clamp(s.box, 0, MAX_BOX)] += 1;
    });
    return out;
  }

  return {
    SCHEMA_VERSION: SCHEMA_VERSION,
    DEFAULT_PASS_PCT: DEFAULT_PASS_PCT,
    MAX_BOX: MAX_BOX,
    REQUEUE_DELAY: REQUEUE_DELAY,
    REVIEW_INTERVALS_DAYS: REVIEW_INTERVALS_DAYS,
    DAY_MS: DAY_MS,
    isPlainObject: isPlainObject,
    clamp: clamp,
    mulberry32: mulberry32,
    shuffle: shuffle,
    validateQuestion: validateQuestion,
    validateBank: validateBank,
    buildDeck: buildDeck,
    createSession: createSession,
    currentQid: currentQid,
    startDelivery: startDelivery,
    answerPractice: answerPractice,
    answerExam: answerExam,
    toggleFlag: toggleFlag,
    finishExam: finishExam,
    advance: advance,
    scoreSession: scoreSession,
    scoreByCategory: scoreByCategory,
    updateStat: updateStat,
    isDue: isDue,
    dueIds: dueIds,
    boxHistogram: boxHistogram,
    requeueDelay: requeueDelay
  };
});

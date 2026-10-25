"use strict";

var assert = require("assert");
var Engine = require("../js/engine.js");

function failBank() {
  return {
    schemaVersion: 1,
    id: "t-bank",
    name: "Test Bank",
    exam: { passPct: 75, minutes: null },
    questions: []
  };
}

function q(id) {
  return {
    id: id,
    category: "Test",
    difficulty: "easy",
    question: "Question " + id + "?",
    choices: ["a", "b", "c", "d"],
    answerIndex: 0,
    explanation: "Because " + id + ".",
    references: []
  };
}

var tests = [];

tests.push({
  name: "engine exports the expected API",
  fn: function () {
    var expected = [
      "validateBank", "buildDeck", "createSession", "answerPractice", "answerExam",
      "finishExam", "advance", "scoreSession", "scoreByCategory", "updateStat",
      "isDue", "dueIds", "boxHistogram", "mulberry32", "shuffle", "currentQid",
      "toggleFlag", "startDelivery"
    ];
    expected.forEach(function (key) {
      assert.strictEqual(typeof Engine[key], "function", "missing API: " + key);
    });
  }
});

tests.push({
  name: "mulberry32 is deterministic per seed",
  fn: function () {
    var a = Engine.mulberry32(42);
    var b = Engine.mulberry32(42);
    var c = Engine.mulberry32(43);
    var seqA = [a(), a(), a()];
    var seqB = [b(), b(), b()];
    var seqC = [c(), c(), c()];
    assert.deepStrictEqual(seqA, seqB);
    assert.notDeepStrictEqual(seqA, seqC);
    seqA.forEach(function (v) {
      assert.ok(v >= 0 && v < 1);
    });
  }
});

tests.push({
  name: "shuffle preserves membership and order-count",
  fn: function () {
    var rng = Engine.mulberry32(7);
    var input = [1, 2, 3, 4, 5, 6, 7, 8];
    var out = Engine.shuffle(input, rng);
    assert.strictEqual(out.length, input.length);
    assert.deepStrictEqual(out.slice().sort(), input.slice());
    var sameOrder = true;
    for (var i = 0; i < input.length; i++) {
      if (out[i] !== input[i]) sameOrder = false;
    }
    assert.strictEqual(sameOrder, false, "seeded shuffle should reorder with this seed");
  }
});

tests.push({
  name: "validateBank accepts a well-formed bank and normalizes defaults",
  fn: function () {
    var raw = failBank();
    raw.questions = [q("q_one")];
    var result = Engine.validateBank(raw);
    if (!result.ok) assert.fail("bank should validate: " + JSON.stringify(result.errors));
    assert.strictEqual(result.bank.id, "t-bank");
    assert.strictEqual(result.bank.schemaVersion, 1);
    assert.strictEqual(result.bank.description, "");
    assert.strictEqual(result.bank.version, "1.0.0");
    assert.strictEqual(result.bank.questions[0].category, "Test");
    assert.strictEqual(result.bank.exam.passPct, 75);
    assert.strictEqual(result.bank.exam.minutes, null);
  }
});

tests.push({
  name: "validateBank fills default category and difficulty + references",
  fn: function () {
    var raw = failBank();
    raw.questions = [{
      id: "x1",
      question: "Bare minimum question?",
      choices: ["one", "two"],
      answerIndex: 1,
      explanation: "Explain here."
    }];
    var result = Engine.validateBank(raw);
    if (!result.ok) assert.fail("should validate: " + JSON.stringify(result.errors));
    var norm = result.bank.questions[0];
    assert.strictEqual(norm.category, "General");
    assert.strictEqual(norm.difficulty, "medium");
    assert.deepStrictEqual(norm.references, []);
  }
});

tests.push({
  name: "validateBank rejects bad answerIndex, short choices, empty explanation",
  fn: function () {
    var raw = failBank();
    var bad = q("q_bad");
    bad.answerIndex = 9;
    bad.choices = ["only"];
    bad.explanation = "";
    raw.questions = [bad];
    var result = Engine.validateBank(raw);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.bank, null);
    var joined = result.errors.join(" | ");
    assert.ok(/answerIndex/.test(joined), "should report answerIndex");
    assert.ok(/choices/.test(joined), "should report choices");
    assert.ok(/explanation/.test(joined), "should report explanation");
  }
});

tests.push({
  name: "validateBank rejects duplicate question ids and missing bank fields",
  fn: function () {
    var raw = failBank();
    raw.questions = [q("dup"), q("dup")];
    var result = Engine.validateBank(raw);
    assert.strictEqual(result.ok, false);
    assert.ok(/Duplicate question id/.test(result.errors.join(" | ")));

    var noName = { schemaVersion: 1, questions: [q("a")] };
    assert.strictEqual(Engine.validateBank(noName).ok, false, "missing name rejected");

    var noQuestions = { schemaVersion: 1, id: "z", name: "z" };
    assert.strictEqual(Engine.validateBank(noQuestions).ok, false, "missing questions rejected");
  }
});

tests.push({
  name: "validateBank validates exam settings",
  fn: function () {
    var raw = failBank();
    raw.exam = { passPct: 0 };
    raw.questions = [q("a")];
    var result = Engine.validateBank(raw);
    assert.strictEqual(result.ok, false);
    assert.ok(/passPct/.test(result.errors.join(" | ")));

    var raw2 = failBank();
    raw2.exam = { passPct: 80, minutes: -5 };
    raw2.questions = [q("a")];
    var result2 = Engine.validateBank(raw2);
    assert.strictEqual(result2.ok, false);
    assert.ok(/minutes/.test(result2.errors.join(" | ")));
  }
});

tests.push({
  name: "buildDeck: count clamped, shuffled, only-filter works",
  fn: function () {
    var bank = { questions: [q("a"), q("b"), q("c"), q("d"), q("e")] };
    var deck = Engine.buildDeck(bank, { count: 99, rng: Engine.mulberry32(11) });
    assert.strictEqual(deck.length, 5);
    var deck2 = Engine.buildDeck(bank, { count: 2, rng: Engine.mulberry32(11) });
    assert.strictEqual(deck2.length, 2);
    var deck3 = Engine.buildDeck(bank, { only: ["b", "e", "zz"], rng: Engine.mulberry32(11) });
    assert.strictEqual(deck3.length, 2);
    var ids = deck3.map(function (x) { return x.id; }).sort().join(",");
    assert.strictEqual(ids, "b,e");
  }
});

tests.push({
  name: "practice session: first answer recorded, miss re-queued after delay",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("1"), q("2"), q("3"), q("4"), q("5")] };
    var deck = [bank.questions[0], bank.questions[1], bank.questions[2], bank.questions[3], bank.questions[4]];
    var session = Engine.createSession(bank, "practice", deck, 1000);
    var byId = { "1": q("1"), "2": q("2"), "3": q("3"), "4": q("4"), "5": q("5") };

    Engine.answerPractice(session, byId["1"], 3);
    var results = session.results["1"];
    assert.strictEqual(results.first, "miss");
    assert.strictEqual(results.lastChoice, 3);
    Engine.advance(session);
    assert.strictEqual(session.queue.length, 5);
    assert.strictEqual(session.queue[3].qid, "1");
    assert.strictEqual(session.queue[3].isRequeue, true);
    assert.strictEqual(Engine.currentQid(session), "2");
  }
});

tests.push({
  name: "practice: re-queued miss is cleared when answered correctly",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B")] };
    var session = Engine.createSession(bank, "review", bank.questions.slice(), 1000);
    var qA = bank.questions[0];
    var qB = bank.questions[1];

    Engine.answerPractice(session, qA, 1);
    Engine.advance(session);
    assert.strictEqual(Engine.currentQid(session), qB.id);
    Engine.answerPractice(session, qB, qB.answerIndex);
    Engine.advance(session);
    assert.strictEqual(Engine.currentQid(session), qA.id);
    assert.strictEqual(session.results[qA.id].first, "miss");
    assert.strictEqual(session.queue.length, 1);
    Engine.answerPractice(session, qA, qA.answerIndex);
    assert.strictEqual(session.results[qA.id].first, "miss");
    assert.strictEqual(session.results[qA.id].lastChoice, qA.answerIndex);
    Engine.advance(session);
    assert.strictEqual(session.finished, true);
    var score = Engine.scoreSession(session);
    assert.strictEqual(score.total, 2);
    assert.strictEqual(score.correct, 1);
    assert.strictEqual(score.missed, 1);
  }
});

tests.push({
  name: "practice score counts first-attempt correctness only",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B")] };
    var session = Engine.createSession(bank, "practice", bank.questions.slice(), 1000);
    var qA = bank.questions[0];
    Engine.answerPractice(session, qA, qA.answerIndex);
    assert.strictEqual(session.results[qA.id].first, "correct");
    var score = Engine.scoreSession(session);
    assert.strictEqual(score.correct, 1);
    assert.strictEqual(score.total, 1);
  }
});

tests.push({
  name: "exam session: navigation, flagging, grading, pass threshold",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B"), q("C"), q("D")] };
    var byId = { A: bank.questions[0], B: bank.questions[1], C: bank.questions[2], D: bank.questions[3] };
    var session = Engine.createSession(bank, "exam", bank.questions.slice(), 1000);
    assert.strictEqual(Engine.currentQid(session), "A");

    Engine.answerExam(session, "A", byId.A.answerIndex);
    Engine.toggleFlag(session, "A");
    assert.strictEqual(session.flags.A, true);
    assert.strictEqual(session.results.A.first, null);

    Engine.advance(session);
    assert.strictEqual(Engine.currentQid(session), "B");
    Engine.answerExam(session, "B", 2);
    Engine.advance(session);
    Engine.answerExam(session, "C", byId.C.answerIndex);
    Engine.advance(session);
    Engine.answerExam(session, "D", 1);

    Engine.finishExam(session, byId);
    var score = session.score;
    assert.strictEqual(score.total, 4);
    assert.strictEqual(score.correct, 2);
    assert.strictEqual(score.missed, 2);
    assert.strictEqual(score.unanswered, 0);
    assert.strictEqual(score.pct, 50);
    assert.strictEqual(score.passed, false);
  }
});

tests.push({
  name: "exam: unanswered questions are graded as misses",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 50, minutes: null }, questions: [q("A"), q("B")] };
    var byId = { A: bank.questions[0], B: bank.questions[1] };
    var session = Engine.createSession(bank, "exam", bank.questions.slice(), 1000);
    Engine.answerExam(session, "A", byId.A.answerIndex);
    Engine.finishExam(session, byId);
    var score = session.score;
    assert.strictEqual(score.total, 2);
    assert.strictEqual(score.correct, 1);
    assert.strictEqual(score.missed, 1);
    assert.strictEqual(score.unanswered, 1);
    assert.strictEqual(score.pct, 50);
    assert.strictEqual(score.passed, true);
  }
});

tests.push({
  name: "exam: auto-finish via advance closes the session",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A")] };
    var session = Engine.createSession(bank, "exam", bank.questions.slice(), 1000);
    Engine.advance(session);
    assert.strictEqual(session.finished, true);
  }
});

tests.push({
  name: "scoreByCategory tallies per-category first-attempt results",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B"), q("C")] };
    bank.questions[0].category = "Alpha";
    bank.questions[1].category = "Alpha";
    bank.questions[2].category = "Beta";
    var byId = { A: bank.questions[0], B: bank.questions[1], C: bank.questions[2] };
    var session = Engine.createSession(bank, "exam", bank.questions.slice(), 1000);
    Engine.answerExam(session, "A", byId.A.answerIndex);
    Engine.answerExam(session, "B", 2);
    Engine.answerExam(session, "C", 3);
    Engine.finishExam(session, byId);
    var cats = Engine.scoreByCategory(session, byId);
    assert.strictEqual(cats.Alpha.total, 2);
    assert.strictEqual(cats.Alpha.correct, 1);
    assert.strictEqual(cats.Beta.total, 1);
    assert.strictEqual(cats.Beta.correct, 0);
  }
});

tests.push({
  name: "Leitner stat: correct climbs to max, miss resets to 0",
  fn: function () {
    var now = 1000;
    var stat = null;
    for (var i = 0; i < 8; i++) {
      stat = Engine.updateStat(stat, true, now + i * Engine.DAY_MS);
    }
    assert.strictEqual(stat.box, Engine.MAX_BOX);
    assert.strictEqual(stat.lastResult, "correct");
    assert.strictEqual(stat.wrong, 0);
    stat = Engine.updateStat(stat, false, now + 10 * Engine.DAY_MS);
    assert.strictEqual(stat.box, 0);
    assert.strictEqual(stat.lastResult, "miss");
    assert.strictEqual(stat.correct, 8);
    assert.strictEqual(stat.wrong, 1);
  }
});

tests.push({
  name: "isDue: recent miss is due immediately, stale box-1 correct not due, old one is",
  fn: function () {
    var now = 1000000000000;
    var missed = Engine.updateStat(null, false, now);
    assert.strictEqual(Engine.isDue(missed, now), true);

    var fresh = Engine.updateStat(null, true, now - (0.5 * Engine.DAY_MS));
    assert.strictEqual(fresh.box, 1);
    assert.strictEqual(Engine.isDue(fresh, now), false);

    var stale1 = Engine.updateStat(null, true, now - (1.5 * Engine.DAY_MS));
    assert.strictEqual(Engine.isDue(stale1, now), true);

    var box5 = null;
    for (var i = 0; i < 5; i++) box5 = Engine.updateStat(box5, true, now - (6 * Engine.DAY_MS));
    assert.strictEqual(box5.box, 5);
    assert.strictEqual(Engine.isDue(box5, now), false);

    var box5old = null;
    for (var j = 0; j < 5; j++) box5old = Engine.updateStat(box5old, true, now - (15 * Engine.DAY_MS));
    assert.strictEqual(Engine.isDue(box5old, now), true);
  }
});

tests.push({
  name: "dueIds and boxHistogram aggregate correctly",
  fn: function () {
    var now = 1000000000000;
    var stats = {
      a: Engine.updateStat(null, false, now),
      b: Engine.updateStat(null, true, now),
      c: Engine.updateStat(null, true, now - 5 * Engine.DAY_MS),
      d: null
    };
    for (var i = 0; i < 5; i++) {
      stats.d = Engine.updateStat(stats.d, true, now - 6 * Engine.DAY_MS);
    }
    var due = Engine.dueIds(stats, now);
    assert.ok(due.indexOf("a") !== -1, "a recent miss is due");
    assert.ok(due.indexOf("c") !== -1, "a box-1 correct seen 5 days ago is past its 1-day interval");
    assert.strictEqual(due.indexOf("b") !== -1, false, "a box-1 correct seen just now is not due");
    assert.strictEqual(due.indexOf("d") !== -1, false, "a box-5 correct seen 6 days ago is inside its 14-day interval");
    var hist = Engine.boxHistogram(stats);
    assert.strictEqual(hist[0], 1);
    assert.strictEqual(hist[1], 2);
    assert.strictEqual(hist[5], 1);
    assert.strictEqual(hist[3], 0);
  }
});

tests.push({
  name: "session survives JSON round-trip for resume",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B"), q("C")] };
    var byId = { A: bank.questions[0], B: bank.questions[1], C: bank.questions[2] };
    var session = Engine.createSession(bank, "practice", bank.questions.slice(), 1000);
    Engine.answerPractice(session, byId.A, 2);
    Engine.advance(session);

    var revived = JSON.parse(JSON.stringify(session));
    var qB = byId[Engine.currentQid(revived)];
    Engine.answerPractice(revived, qB, 1);
    assert.strictEqual(revived.results[qB.id].lastChoice, 1);
    var score = Engine.scoreSession(revived);
    assert.strictEqual(score.correct, 0);
    assert.strictEqual(score.total, 2);
  }
});

tests.push({
  name: "review deck ends empty for unknown ids",
  fn: function () {
    var bank = { id: "b", name: "Bank", exam: { passPct: 75, minutes: null }, questions: [q("A"), q("B")] };
    var deck = Engine.buildDeck(bank, { only: ["nope"], rng: Engine.mulberry32(5) });
    assert.strictEqual(deck.length, 0);
  }
});

module.exports = tests;

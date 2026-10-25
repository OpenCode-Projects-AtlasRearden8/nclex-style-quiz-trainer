"use strict";

var assert = require("assert");
var createStorage = require("../js/storage.js");

function fakeStore() {
  var data = {};
  return {
    data: data,
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem: function (k, v) { data[k] = String(v); },
    removeItem: function (k) { delete data[k]; }
  };
}

function throwingStore() {
  return {
    getItem: function () { throw new Error("blocked"); },
    setItem: function () { throw new Error("blocked"); },
    removeItem: function () { throw new Error("blocked"); }
  };
}

function sampleBank(id) {
  return {
    schemaVersion: 1,
    id: id,
    name: "Bank " + id,
    version: "1.0.0",
    description: "desc",
    exam: { passPct: 75, minutes: null },
    questions: [{
      id: "q1",
      category: "C",
      difficulty: "easy",
      question: "Q?",
      choices: ["a", "b"],
      answerIndex: 0,
      explanation: "e",
      references: []
    }]
  };
}

var tests = [];

tests.push({
  name: "storage persists a custom bank round-trip and removes it",
  fn: function () {
    var store = createStorage(fakeStore());
    assert.strictEqual(store.kind(), "local");
    assert.deepStrictEqual(store.listCustomBanks(), []);
    assert.strictEqual(store.saveCustomBank(sampleBank("alpha")), true);
    assert.strictEqual(store.listCustomBanks().length, 1);
    assert.strictEqual(store.listCustomBanks()[0].id, "alpha");
    assert.strictEqual(store.saveCustomBank(sampleBank("beta")), true);
    store.removeCustomBank("alpha");
    assert.deepStrictEqual(store.listCustomBanks().map(function (b) { return b.id; }), ["beta"]);
  }
});

tests.push({
  name: "saving the same bank id replaces rather than duplicates",
  fn: function () {
    var store = createStorage(fakeStore());
    store.saveCustomBank(sampleBank("alpha"));
    var updated = sampleBank("alpha");
    updated.name = "Renamed";
    store.saveCustomBank(updated);
    var banks = store.listCustomBanks();
    assert.strictEqual(banks.length, 1);
    assert.strictEqual(banks[0].name, "Renamed");
  }
});

tests.push({
  name: "progress recordAttempt prepends, caps at 50, and tracks counters",
  fn: function () {
    var store = createStorage(fakeStore());
    for (var i = 1; i <= 55; i++) {
      store.recordAttempt("b1", { ts: i, mode: i <= 50 ? "practice" : "exam", total: 10, correct: 8, pct: 80, passed: i > 50, missedIds: [], });
    }
    var p = store.getProgress("b1");
    assert.strictEqual(p.attempts.length, 50);
    assert.strictEqual(p.attempts[0].ts, 55);
    assert.strictEqual(p.examCount, 5);
    assert.strictEqual(p.practiceCount, 50);
    assert.strictEqual(p.bestExamPct, 80);
    assert.strictEqual(p.lastMisses.missedIds.length, 0);
    assert.strictEqual(store.getProgress("b2").attempts.length, 0);
  }
});

tests.push({
  name: "recordAttempt stores missed ids for wrong-answer review",
  fn: function () {
    var store = createStorage(fakeStore());
    store.recordAttempt("b1", { ts: 1, mode: "practice", total: 3, correct: 1, pct: 33, passed: false, missedIds: ["q2", "q3"] });
    var p = store.getProgress("b1");
    assert.deepStrictEqual(p.lastMisses.missedIds, ["q2", "q3"]);
    assert.deepStrictEqual(p.attempts[0].missedIds, ["q2", "q3"]);
  }
});

tests.push({
  name: "mergeStat and setStats persist per-question box state",
  fn: function () {
    var store = createStorage(fakeStore());
    var stat = { box: 2, seen: 3, correct: 3, wrong: 0, lastResult: "correct", lastSeen: 123 };
    store.mergeStat("b1", "q1", stat);
    assert.strictEqual(store.getProgress("b1").stats.q1.box, 2);
    store.setStats("b1", { q2: stat });
    assert.strictEqual(store.getProgress("b1").stats.q1, undefined);
    assert.strictEqual(store.getProgress("b1").stats.q2.box, 2);
  }
});

tests.push({
  name: "corrupt stored JSON falls back to empty defaults",
  fn: function () {
    var raw = fakeStore();
    var store = createStorage(raw);
    Object.keys(raw.data).forEach(function (k) { raw.data[k] = "{broken json"; });
    assert.deepStrictEqual(store.listCustomBanks(), []);
    var p = store.getProgress("b1");
    assert.deepStrictEqual(p.attempts, []);
    assert.deepStrictEqual(p.stats, {});
    assert.strictEqual(store.getActiveSession(), null);
    assert.strictEqual(store.ack(), false);
  }
});

tests.push({
  name: "blocked storage falls back to in-memory mode and still works",
  fn: function () {
    var store = createStorage(throwingStore());
    assert.strictEqual(store.kind(), "memory");
    assert.strictEqual(store.saveCustomBank(sampleBank("alpha")), true);
    assert.strictEqual(store.listCustomBanks().length, 1);
    assert.strictEqual(store.ack(), false);
    store.setAck(true);
    assert.strictEqual(store.ack(), true);
  }
});

tests.push({
  name: "no explicit store + missing localStorage uses memory fallback",
  fn: function () {
    var store = createStorage(undefined);
    assert.strictEqual(store.getProgress("b1").attempts.length, 0);
    assert.strictEqual(store.listCustomBanks().length, 0);
  }
});

tests.push({
  name: "active session save/load/clear round-trip",
  fn: function () {
    var store = createStorage(fakeStore());
    assert.strictEqual(store.getActiveSession(), null);
    var payload = { session: { bankId: "b1", mode: "practice" }, bank: sampleBank("b1"), savedAt: 42 };
    store.saveActiveSession(payload);
    var loaded = store.getActiveSession();
    assert.strictEqual(loaded.session.mode, "practice");
    assert.strictEqual(loaded.bank.id, "b1");
    store.clearActiveSession();
    assert.strictEqual(store.getActiveSession(), null);
  }
});

tests.push({
  name: "disclaimer acknowledgment persists and resets with data",
  fn: function () {
    var store = createStorage(fakeStore());
    assert.strictEqual(store.ack(), false);
    store.setAck(true);
    assert.strictEqual(store.ack(), true);
    store.resetProgress("b1");
    assert.strictEqual(store.ack(), true, "resetProgress only touches that bank");
    store.resetProgress("nothing");
    assert.strictEqual(store.ack(), true);
  }
});

module.exports = tests;

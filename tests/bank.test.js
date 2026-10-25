"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var Engine = require("../js/engine.js");
var BankIO = require("../js/bank-io.js");

var tests = [];

tests.push({
  name: "starter bank JSON file exists and validates",
  fn: function () {
    var raw = fs.readFileSync(path.join(__dirname, "..", "data", "starter-bank.json"), "utf8");
    var parsed = JSON.parse(raw);
    var result = Engine.validateBank(parsed);
    assert.strictEqual(result.ok, true, "bank must validate: " + JSON.stringify(result.errors));
    var bank = result.bank;
    assert.ok(bank.questions.length >= 30, "starter bank should be substantive");
    assert.ok(bank.exam.passPct >= 1 && bank.exam.passPct <= 100);
    assert.ok(bank.exam.minutes === null || bank.exam.minutes > 0);
    var idsFound = {};
    var idsUnique = true;
    bank.questions.forEach(function (question) {
      if (idsFound[question.id]) idsUnique = false;
      idsFound[question.id] = true;
      assert.ok(question.explanation.length > 20, "each explanation should be substantive");
      assert.ok(question.choices.length >= 2);
      assert.ok(Array.isArray(question.references));
    });
    assert.strictEqual(idsUnique, true);
  }
});

tests.push({
  name: "starter bank is internally consistent and matches the embedded copy",
  fn: function () {
    var fileBank = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "starter-bank.json"), "utf8"));
    var embedded = require("../js/starter-bank-embedded.js");
    var fileNormalized = Engine.validateBank(fileBank).bank;
    var embeddedValidated = Engine.validateBank(embedded).bank;
    assert.deepStrictEqual(embeddedValidated, fileNormalized, "embedded copy must exactly match the JSON source");
  }
});

tests.push({
  name: "starter bank exposes a breadth of categories and difficulties",
  fn: function () {
    var bank = Engine.validateBank(JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "data", "starter-bank.json"), "utf8")
    )).bank;
    var categories = {};
    var difficulties = {};
    bank.questions.forEach(function (question) {
      categories[question.category] = true;
      difficulties[question.difficulty] = true;
    });
    assert.ok(Object.keys(categories).length >= 5, "should span multiple categories");
    assert.ok(Object.keys(difficulties).length >= 2, "should span multiple difficulties");
  }
});

tests.push({
  name: "exam and practice decks build from the starter bank",
  fn: function () {
    var bank = Engine.validateBank(JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "data", "starter-bank.json"), "utf8")
    )).bank;
    var examDeck = Engine.buildDeck(bank, { mode: "exam", rng: Engine.mulberry32(3) });
    assert.strictEqual(examDeck.length, bank.questions.length);
    var practiceDeck = Engine.buildDeck(bank, { mode: "practice", count: 10, rng: Engine.mulberry32(3) });
    assert.strictEqual(practiceDeck.length, 10);
    var session = Engine.createSession(bank, "practice", practiceDeck, 1000);
    assert.strictEqual(session.deckSize, 10);
    var first = Engine.currentQid(session);
    assert.strictEqual(typeof first, "string");
    Engine.advance(session);
    assert.strictEqual(Engine.currentQid(session) !== first, true);
  }
});

tests.push({
  name: "BankIO.parseBankText accepts a bank string and flag bad JSON",
  fn: function () {
    var raw = fs.readFileSync(path.join(__dirname, "..", "data", "starter-bank.json"), "utf8");
    assert.strictEqual(BankIO.parseBankText(raw).ok, true);
    var bad = BankIO.parseBankText("{ not json ");
    assert.strictEqual(bad.ok, false);
    assert.ok(/Invalid JSON/.test(bad.errors[0]));
  }
});

tests.push({
  name: "BankIO.uniqueWithCustom detects id collisions",
  fn: function () {
    var existing = [{ id: "a" }, { id: "b" }];
    assert.strictEqual(BankIO.uniqueWithCustom(existing, { id: "b" }), true);
    assert.strictEqual(BankIO.uniqueWithCustom(existing, { id: "c" }), false);
  }
});

module.exports = tests;

"use strict";

const fs = require("fs");
const path = require("path");

const bankPath = process.argv[2] || path.join(__dirname, "..", "data", "starter-bank.json");

let raw;
try {
  raw = fs.readFileSync(bankPath, "utf8");
} catch (e) {
  console.error("Cannot read bank file: " + e.message);
  process.exit(1);
}

const result = require(path.join(__dirname, "..", "js", "engine.js")).validateBank(JSON.parse(raw));

if (!result.ok) {
  console.error("Bank is INVALID (" + bankPath + "):");
  result.errors.forEach(function (e) { console.error("  - " + e); });
  process.exit(1);
}

console.log("OK  " + result.bank.name + "  v" + result.bank.version);
console.log("    id: " + result.bank.id);
console.log("    questions: " + result.bank.questions.length);
console.log("    exam: pass " + result.bank.exam.passPct + "%, " + (result.bank.exam.minutes ? result.bank.exam.minutes + " minutes" : "untimed"));
const cats = {};
result.bank.questions.forEach(function (q) { cats[q.category] = (cats[q.category] || 0) + 1; });
Object.keys(cats).sort().forEach(function (c) {
  console.log("    " + c + ": " + cats[c]);
});

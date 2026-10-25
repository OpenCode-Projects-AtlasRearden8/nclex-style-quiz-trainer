"use strict";

const fs = require("fs");
const path = require("path");

const Engine = require(path.join(__dirname, "..", "js", "engine.js"));
const srcPath = path.join(__dirname, "..", "data", "starter-bank.json");
const outPath = path.join(__dirname, "..", "js", "starter-bank-embedded.js");

let raw;
try {
  raw = fs.readFileSync(srcPath, "utf8");
} catch (e) {
  console.error("Cannot read " + srcPath + ": " + e.message);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error("Invalid JSON in " + srcPath + ": " + e.message);
  process.exit(1);
}

const result = Engine.validateBank(parsed);
if (!result.ok) {
  console.error("Starter bank is INVALID:");
  result.errors.forEach(function (e) { console.error("  - " + e); });
  process.exit(1);
}

const json = JSON.stringify(result.bank, null, 2);
const header =
  "// AUTO-GENERATED from data/starter-bank.json by tools/sync-bank.js — do not edit by hand.\n" +
  "// After editing data/starter-bank.json, run: npm run sync-bank\n";

const js =
  header +
  '(function (root) {\n' +
  '  "use strict";\n' +
  '  var BANK = ' + json + ';\n' +
  '  root.NCLEX = root.NCLEX || {};\n' +
  '  root.NCLEX.STARTER_BANK = BANK;\n' +
  '  if (typeof module === "object" && module.exports) { module.exports = BANK; }\n' +
  '})(typeof globalThis === "object" && globalThis !== null ? globalThis : typeof self === "object" ? self : this);\n';

fs.writeFileSync(outPath, js, "utf8");
console.log("Embedded starter bank written to " + outPath);
console.log("Questions: " + result.bank.questions.length + " (bank id: " + result.bank.id + ")");

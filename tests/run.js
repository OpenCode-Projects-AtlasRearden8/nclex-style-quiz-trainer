"use strict";

var suites = [
  require("./engine.test.js"),
  require("./storage.test.js"),
  require("./bank.test.js")
];

var passed = 0;
var failed = 0;

suites.forEach(function (tests) {
  tests.forEach(function (t) {
    try {
      t.fn();
      console.log("PASS  " + t.name);
      passed += 1;
    } catch (e) {
      console.log("FAIL  " + t.name);
      console.log("      " + (e && e.stack ? String(e.stack).split("\n").slice(0, 3).join("\n      ") : e));
      failed += 1;
    }
  });
});

console.log("");
console.log(failed === 0
  ? "All " + passed + " tests passed."
  : failed + " of " + (passed + failed) + " tests FAILED.");

process.exit(failed === 0 ? 0 : 1);

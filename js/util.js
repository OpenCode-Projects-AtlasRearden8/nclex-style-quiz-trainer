(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NCLEX = root.NCLEX || {};
    root.NCLEX.Util = factory();
  }
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this,
function () {
  "use strict";

  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function questionById(bank) {
    var map = {};
    (bank.questions || []).forEach(function (q) { map[q.id] = q; });
    return map;
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function fmtDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function fmtClock(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function pct(correct, total) {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }

  return {
    esc: esc,
    questionById: questionById,
    clamp: clamp,
    fmtDate: fmtDate,
    fmtClock: fmtClock,
    pct: pct
  };
});

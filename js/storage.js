(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NCLEX = root.NCLEX || {};
    root.NCLEX.createStorage = factory();
  }
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this,
function () {
  "use strict";

  var NS = "nclex-style-quiz-trainer:";
  var KEY_ACK = NS + "disclaimer-ack";
  var KEY_CUSTOM = NS + "custom-banks";
  var KEY_PROGRESS = NS + "progress";
  var KEY_SESSION = NS + "active-session";

  function memoryStore() {
    var data = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      setItem: function (k, v) { data[k] = String(v); },
      removeItem: function (k) { delete data[k]; }
    };
  }

  function isUsable(store) {
    if (!store) return false;
    try {
      var probe = NS + "__probe";
      store.setItem(probe, "1");
      store.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  }

  function createStorage(explicitStore) {
    var persistent;
    if (explicitStore !== undefined) {
      persistent = isUsable(explicitStore) ? explicitStore : null;
    } else if (typeof window !== "undefined" && window.localStorage) {
      persistent = isUsable(window.localStorage) ? window.localStorage : null;
    } else {
      persistent = null;
    }

    var fallback = memoryStore();
    var store = persistent || fallback;

    function kind() {
      return persistent ? "local" : "memory";
    }

    function readJSON(key, defaultValue) {
      var raw;
      try {
        raw = store.getItem(key);
      } catch (e) {
        return defaultValue;
      }
      if (raw === null || raw === undefined) return defaultValue;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return defaultValue;
      }
    }

    function writeJSON(key, value) {
      try {
        store.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    }

    function ack() {
      return readJSON(KEY_ACK, {}).ack === true;
    }

    function setAck(v) {
      writeJSON(KEY_ACK, { ack: !!v, ts: Date.now() });
    }

    function listCustomBanks() {
      var arr = readJSON(KEY_CUSTOM, []);
      return Array.isArray(arr) ? arr : [];
    }

    function saveCustomBank(bank) {
      var arr = listCustomBanks().filter(function (b) { return b.id !== bank.id; });
      arr.push(bank);
      return writeJSON(KEY_CUSTOM, arr);
    }

    function removeCustomBank(id) {
      var arr = listCustomBanks().filter(function (b) { return b.id !== id; });
      return writeJSON(KEY_CUSTOM, arr);
    }

    function emptyProgress() {
      return {
        stats: {},
        attempts: [],
        lastMisses: null,
        examCount: 0,
        practiceCount: 0,
        bestExamPct: null
      };
    }

    function getProgress(bankId) {
      var all = readJSON(KEY_PROGRESS, {});
      var p = isObject(all) ? all[bankId] : null;
      if (!p || !isObject(p)) return emptyProgress();
      var out = emptyProgress();
      out.stats = isObject(p.stats) ? p.stats : {};
      out.attempts = Array.isArray(p.attempts) ? p.attempts : [];
      out.lastMisses = p.lastMisses && isObject(p.lastMisses) ? p.lastMisses : null;
      out.examCount = typeof p.examCount === "number" ? p.examCount : 0;
      out.practiceCount = typeof p.practiceCount === "number" ? p.practiceCount : 0;
      out.bestExamPct = typeof p.bestExamPct === "number" ? p.bestExamPct : null;
      return out;
    }

    function saveProgress(bankId, progress) {
      var all = readJSON(KEY_PROGRESS, {});
      if (!isObject(all)) all = {};
      all[bankId] = progress;
      return writeJSON(KEY_PROGRESS, all);
    }

    function recordAttempt(bankId, attempt) {
      var p = getProgress(bankId);
      p.attempts.unshift({
        ts: attempt.ts,
        mode: attempt.mode,
        total: attempt.total,
        correct: attempt.correct,
        pct: attempt.pct,
        passed: !!attempt.passed,
        missedIds: attempt.missedIds || []
      });
      if (p.attempts.length > 50) p.attempts = p.attempts.slice(0, 50);
      if (attempt.mode === "exam") {
        p.examCount += 1;
        if (p.bestExamPct === null || attempt.pct > p.bestExamPct) p.bestExamPct = attempt.pct;
      } else {
        p.practiceCount += 1;
      }
      p.lastMisses = { ts: attempt.ts, missedIds: attempt.missedIds || [] };
      return saveProgress(bankId, p);
    }

    function setStats(bankId, stats) {
      var p = getProgress(bankId);
      p.stats = stats;
      return saveProgress(bankId, p);
    }

    function mergeStat(bankId, qid, stat) {
      var p = getProgress(bankId);
      p.stats[qid] = stat;
      return saveProgress(bankId, p);
    }

    function resetProgress(bankId) {
      var all = readJSON(KEY_PROGRESS, {});
      if (isObject(all) && all[bankId]) {
        delete all[bankId];
        return writeJSON(KEY_PROGRESS, all);
      }
      return true;
    }

    function saveActiveSession(payload) {
      return writeJSON(KEY_SESSION, payload);
    }

    function getActiveSession() {
      return readJSON(KEY_SESSION, null);
    }

    function clearActiveSession() {
      try {
        store.removeItem(KEY_SESSION);
        return true;
      } catch (e) {
        return false;
      }
    }

    function isObject(v) {
      return typeof v === "object" && v !== null && !Array.isArray(v);
    }

    return {
      kind: kind,
      ack: ack,
      setAck: setAck,
      listCustomBanks: listCustomBanks,
      saveCustomBank: saveCustomBank,
      removeCustomBank: removeCustomBank,
      getProgress: getProgress,
      saveProgress: saveProgress,
      recordAttempt: recordAttempt,
      setStats: setStats,
      mergeStat: mergeStat,
      resetProgress: resetProgress,
      saveActiveSession: saveActiveSession,
      getActiveSession: getActiveSession,
      clearActiveSession: clearActiveSession
    };
  }

  return createStorage;
});

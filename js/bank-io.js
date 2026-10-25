(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./engine.js"));
  } else {
    root.NCLEX = root.NCLEX || {};
    root.NCLEX.BankIO = factory(root.NCLEX.Engine);
  }
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this,
function (Engine) {
  "use strict";

  function starterBank() {
    var src = typeof window !== "undefined" && window.NCLEX && window.NCLEX.STARTER_BANK
      ? window.NCLEX.STARTER_BANK
      : null;
    if (!src) return null;
    var v = Engine.validateBank(src);
    return v.ok ? v.bank : null;
  }

  function parseBankText(text) {
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { ok: false, errors: ["Invalid JSON: " + e.message], bank: null };
    }
    return Engine.validateBank(data);
  }

  function uniqueWithCustom(existing, customBank) {
    return existing.some(function (b) { return b.id === customBank.id; });
  }

  async function tryLoadRemoteStarter(path) {
    if (typeof fetch !== "function") return null;
    try {
      var res = await fetch(path);
      if (!res.ok) return null;
      var text = await res.text();
      var v = parseBankText(text);
      return v.ok ? v.bank : null;
    } catch (e) {
      return null;
    }
  }

  return {
    starterBank: starterBank,
    parseBankText: parseBankText,
    uniqueWithCustom: uniqueWithCustom,
    tryLoadRemoteStarter: tryLoadRemoteStarter
  };
});

(function (root) {
  "use strict";
  var NCLEX = root.NCLEX = root.NCLEX || {};
  var App = NCLEX.App = {};
  var Engine = NCLEX.Engine;
  var Util = NCLEX.Util;
  var BankIO = NCLEX.BankIO;
  var Store = null;
  var state = { banks: [], reviewBankId: null, progressBankId: null };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return Util.esc(s); }

  function scrollToTop() {
    window.scrollTo(0, 0);
  }
  App.scrollToTop = scrollToTop;

  function setRoute(r) {
    NCLEX.Quiz.stopEverything();
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-route") === r);
    });
  }
  App.setRoute = setRoute;

  function flash(message) {
    var banner = el("flash-banner");
    if (!banner) return;
    banner.textContent = message;
    banner.classList.remove("hidden");
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      banner.classList.add("hidden");
    }, 4000);
  }
  App.flash = flash;

  function modal(opts, onAction) {
    var modalRoot = el("modal-root");
    var html = "";
    html += '<div class="modal-overlay" id="modal-overlay">';
    html += '<div class="modal card" role="dialog" aria-modal="true" aria-labelledby="modal-title">';
    html += '<h3 id="modal-title">' + esc(opts.title) + "</h3>";
    html += '<div class="modal-body">' + opts.body + "</div>";
    html += '<div class="modal-actions">';
    (opts.buttons || []).forEach(function (b) {
      html += '<button type="button" class="btn ' +
        (b.kind === "primary" ? "btn-primary" : b.kind === "danger" ? "btn-danger" : "btn-ghost") +
        '" data-value="' + esc(b.value) + '">' + esc(b.label) + "</button>";
    });
    html += "</div></div></div>";
    modalRoot.innerHTML = html;
    modalRoot.classList.remove("hidden");

    function close() {
      modalRoot.classList.add("hidden");
      modalRoot.innerHTML = "";
      document.removeEventListener("keydown", escapeHandler);
    }
    function escapeHandler(e) {
      if (e.key === "Escape" && opts.dismissible !== false) {
        close();
        if (onAction) onAction("cancel");
      }
    }
    modalRoot.querySelectorAll(".modal-actions .btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-value");
        close();
        if (onAction) onAction(value);
      });
    });
    document.addEventListener("keydown", escapeHandler);
    var primary = modalRoot.querySelector(".modal-actions .btn-primary");
    if (primary) primary.focus();
  }

  App.confirmModal = function (title, message, buttons, onAction) {
    modal({ title: title, body: "<p>" + esc(message) + "</p>", buttons: buttons }, onAction);
  };

  function showPlainModal(title, htmlBody) {
    modal({
      title: title,
      body: htmlBody,
      buttons: [{ label: "Close", value: "ok", kind: "primary" }],
      dismissible: true
    }, null);
  }
  App.showPlainModal = showPlainModal;

  function recordStat(bankId, qid, isCorrect) {
    if (!qid) return;
    var p = Store.getProgress(bankId);
    var stat = Engine.updateStat(p.stats[qid] || null, isCorrect, Date.now());
    Store.mergeStat(bankId, qid, stat);
  }
  App.recordStat = recordStat;

  function recordAttempt(session, bank) {
    var score = session.score || Engine.scoreSession(session);
    var ids = session.mode === "exam" ? session.examOrder : session.deliveredOrder;
    var missedIds = ids.filter(function (id) {
      return session.results[id] && session.results[id].first === "miss";
    });
    Store.recordAttempt(bank.id, {
      ts: Date.now(),
      mode: session.mode,
      total: score.total,
      correct: score.correct,
      pct: score.pct,
      passed: score.passed,
      missedIds: missedIds
    });
  }
  App.recordAttempt = recordAttempt;

  function bankById(id) {
    for (var i = 0; i < state.banks.length; i++) {
      if (state.banks[i].bank.id === id) return state.banks[i];
    }
    return null;
  }
  App.bankById = bankById;

  function loadBanks() {
    state.banks = [];
    var starter = BankIO.starterBank();
    if (starter) {
      state.banks.push({ bank: starter, custom: false });
    }
    Store.listCustomBanks().forEach(function (b) {
      var v = Engine.validateBank(b);
      if (v.ok) state.banks.push({ bank: v.bank, custom: true });
    });
    BankIO.tryLoadRemoteStarter("data/starter-bank.json").then(function (remote) {
      if (remote) {
        state.banks = state.banks.filter(function (entry) { return entry.bank.id !== remote.id; });
        state.banks.unshift({ bank: remote, custom: false });
        if (document.querySelector(".nav-link.active") &&
            document.querySelector(".nav-link.active").getAttribute("data-route") === "home") {
          showHome();
        }
      }
    });
  }
  App.loadBanks = loadBanks;

  function validQuestionIds(bankEntry) {
    return Object.keys(Util.questionById(bankEntry.bank));
  }

  function dueIdsFor(bankId) {
    var entry = bankById(bankId);
    if (!entry) return [];
    var p = Store.getProgress(bankId);
    var valid = validQuestionIds(entry);
    return Engine.dueIds(p.stats, Date.now()).filter(function (id) { return valid.indexOf(id) !== -1; });
  }

  function showHome() {
    setRoute("home");
    var view = el("view");
    var html = "";
    html += "<h1>Welcome — pick a bank and study at your own pace.</h1>";
    html += '<p class="lede">A friendly trainer for nursing-style study questions. It runs entirely in this page, keeps progress on this device only, and never pretends to replace expert practice resources.</p>';

    var saved = Store.getActiveSession();
    if (saved && saved.session && bankById(saved.bank && saved.bank.id)) {
      html += '<div class="resume-banner card">';
      html += "<div><strong>You have an unfinished " + esc(saved.session.mode) + " session</strong> in " + esc(saved.bank.name) + ", started " + esc(Util.fmtDate(saved.session.startedAt)) + ".</div>";
      html += '<div class="resume-actions">';
      html += '<button id="resume-btn" class="btn btn-primary" type="button">Resume</button>';
      html += '<button id="resume-discard" class="btn btn-ghost" type="button">Discard</button>';
      html += "</div></div>";
    }

    html += '<div class="mode-cards">';
    html += '<div class="mode-card"><div><strong>🧠 Practice</strong><p>Answer right away, see the explanation instantly. Missed questions come back once more in the same session until you clear them.</p></div></div>';
    html += '<div class="mode-card"><div><strong>🎯 Exam</strong><p>Timed, no feedback until you finish, pass mark shown up front. Every question is reviewed with explanations at the end.</p></div></div>';
    html += '<div class="mode-card"><div><strong>🌱 Spaced review</strong><p>Every miss goes into a spaced schedule (Leitner boxes). The Review tab tells you what is due today and lets you drill exactly those.</p></div></div>';
    html += "</div>";

    html += '<h2 class="section-h">Question banks</h2>';
    html += '<div class="bank-list">';
    state.banks.forEach(function (entry) {
      var b = entry.bank;
      var p = Store.getProgress(b.id);
      var cats = {};
      b.questions.forEach(function (q) { cats[q.category] = true; });
      var due = dueIdsFor(b.id);
      html += '<div class="card bank-card">';
      html += '<div class="bank-head"><div><span class="bank-name">' + esc(b.name) + "</span>" +
        (entry.custom ? '<span class="chip chip-custom">custom</span>' : '<span class="chip chip-soft">built-in</span>') + "</div>" +
        '<span class="bank-ver">v' + esc(b.version) + "</span></div>";
      html += '<p class="bank-desc">' + esc(b.description) + "</p>";
      html += '<div class="bank-stats">' + b.questions.length + " questions · " + Object.keys(cats).length + " categories · exam pass mark " + b.exam.passPct + "%" +
        (b.exam.minutes ? " · " + b.exam.minutes + " min" : " · untimed") + "</div>";
      if (p.attempts.length) {
        var last = p.attempts[0];
        html += '<div class="bank-laststat">Last session: ' + esc(last.mode) + " · " + last.pct + "% (" + last.correct + "/" + last.total + ") on " + esc(Util.fmtDate(last.ts)) + "</div>";
      }
      if (due.length > 0) {
        html += "<div class=\"bank-due\"><strong>" + due.length + "</strong> question" + (due.length === 1 ? "" : "s") + " due for spaced review</div>";
      }
      html += '<div class="bank-actions">';
      var sizes = [10, 20].filter(function (n) { return n < b.questions.length; });
      sizes.push(b.questions.length);
      html += '<label class="inline-label" for="count-' + esc(b.id) + '">Practice length</label>';
      html += '<select id="count-' + esc(b.id) + '" class="select">';
      sizes.forEach(function (n, i) {
        html += '<option value="' + n + '"' + (i === 0 ? " selected" : "") + ">" + (i === sizes.length - 1 ? "All " : "") + n + " questions</option>";
      });
      html += "</select>";
      html += '<button class="btn btn-primary btn-practice" data-bankid="' + esc(b.id) + '" type="button">Practice</button>';
      html += '<button class="btn btn-ghost btn-exam" data-bankid="' + esc(b.id) + '" type="button">Exam</button>';
      if (due.length > 0) {
        html += '<button class="btn btn-ghost btn-due" data-bankid="' + esc(b.id) + '" type="button">Review ' + due.length + " due</button>";
      }
      if (entry.custom) {
        html += '<button class="btn btn-danger btn-remove" data-bankid="' + esc(b.id) + '" type="button">Remove</button>';
      }
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";
    html += '<p class="import-cta">Have your own bank? <a href="#" id="go-import" data-route="import">Import a JSON bank file</a> — the starter template and authoring guide are there and in the README.</p>';
    view.innerHTML = html;

    scrollToTop();

    var resumeButton = el("resume-btn");
    if (resumeButton) {
      resumeButton.addEventListener("click", function () {
        NCLEX.Quiz.renderSession(saved.session, bankById(saved.bank.id).bank);
      });
      el("resume-discard").addEventListener("click", function () {
        Store.clearActiveSession();
        flash("Discarded the saved session.");
        showHome();
      });
    }

    view.querySelectorAll(".btn-practice").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-bankid");
        var select = el("count-" + id);
        var full = String(bankById(id).bank.questions.length);
        var count = select && select.value !== full ? parseInt(select.value, 10) : null;
        NCLEX.Quiz.startPractice(bankById(id).bank, count);
      });
    });
    view.querySelectorAll(".btn-exam").forEach(function (btn) {
      btn.addEventListener("click", function () {
        NCLEX.Quiz.startExam(bankById(btn.getAttribute("data-bankid")).bank);
      });
    });
    view.querySelectorAll(".btn-due").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-bankid");
        NCLEX.Quiz.startReview(bankById(id).bank, dueIdsFor(id));
      });
    });
    view.querySelectorAll(".btn-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-bankid");
        App.confirmModal("Remove this custom bank?", "This removes the bank and its progress from this device.", [
          { label: "Cancel", value: "cancel" },
          { label: "Remove", value: "remove", kind: "danger" }
        ], function (choice) {
          if (choice === "remove") {
            Store.removeCustomBank(id);
            loadBanks();
            flash("Bank removed.");
            showHome();
          }
        });
      });
    });
    var goImport = el("go-import");
    if (goImport) {
      goImport.addEventListener("click", function (e) {
        e.preventDefault();
        showImport();
      });
    }
  }
  App.showHome = showHome;

  function bankPickerHtml(currentId) {
    var html = '<div class="bank-picker"><label for="bank-select">Bank:</label> <select id="bank-select" class="select">';
    state.banks.forEach(function (entry) {
      html += '<option value="' + esc(entry.bank.id) + '"' + (entry.bank.id === currentId ? " selected" : "") + ">" + esc(entry.bank.name) + "</option>";
    });
    html += "</select></div>";
    return html;
  }

  function wireBankPicker(currentId, onPick) {
    var sel = el("bank-select");
    if (sel) {
      sel.value = currentId;
      sel.addEventListener("change", function () {
        state.reviewBankId = sel.value;
        onPick();
      });
    }
  }

  function showReview(bankId) {
    setRoute("review");
    var view = el("view");
    if (!state.banks.length) {
      view.innerHTML = "<h1>Review misses</h1><p class='lede'>No banks loaded.</p>";
      return;
    }
    if (!bankId || !bankById(bankId)) {
      bankId = state.banks.length ? state.banks[0].bank.id : null;
    }
    state.reviewBankId = bankId;
    var entry = bankById(bankId);
    var page = function () {
      var p = Store.getProgress(bankId);
      var byId = Util.questionById(entry.bank);
      var now = Date.now();
      var due = dueIdsFor(bankId);
      var lastMisses = p.lastMisses ? p.lastMisses.missedIds.filter(function (id) { return byId[id]; }) : [];
      var hist = Engine.boxHistogram(p.stats);
      var maxCount = Math.max(1, Math.max.apply(null, Object.keys(hist).map(function (k) { return hist[k]; })));
      var html = "";
      html += "<h1>Review misses</h1>";
      html += "<p class='lede'>Missed questions sit in boxes. A miss drops a question to box 0 (due now, and re-asked within the same practice session). A correct answer climbs one box, lengthening the wait before it returns.</p>";
      html += bankPickerHtml(bankId);
      html += '<div class="review-columns">';
      html += '<div class="card"><h3>Due today <span class="chip chip-accent">' + due.length + "</span></h3>";
      if (due.length) {
        html += "<p>Questions whose spacing interval has arrived.</p>";
        html += '<button id="start-due" class="btn btn-primary" type="button">Practice ' + due.length + " due</button>";
      } else {
        html += "<p>Nothing is due in this bank right now. Nice.</p>";
      }
      html += "</div>";
      html += '<div class="card"><h3>Last session misses <span class="chip chip-accent">' + lastMisses.length + "</span></h3>";
      if (lastMisses.length) {
        html += "<p>Recorded " + esc(Util.fmtDate(p.lastMisses.ts)) + ".</p>";
        html += '<button id="start-last" class="btn btn-primary" type="button">Practice ' + lastMisses.length + " missed</button>";
      } else {
        html += "<p>Your last session in this bank had no recorded misses.</p>";
      }
      html += "</div></div>";
      html += '<div class="card"><h3>Box intervals</h3><p>A question in box n returns only after its interval passes: ' +
        Engine.REVIEW_INTERVALS_DAYS.map(function (d, i) {
          return "box " + i + " → " + (d === 0 ? "due now" : (d === 1 ? "1 day" : d + " days"));
        }).join(" · ") + ".</p>";
      html += '<div class="histogram">';
      for (var b = 0; b <= Engine.MAX_BOX; b++) {
        var n = hist[b];
        html += '<div class="hist-col"><div class="hist-bar" style="height:' + Math.round((n / maxCount) * 70) + (n ? "px" : "px;opacity:.3") + '"></div>' +
          '<div class="hist-count">' + n + '</div><div class="hist-label">' + b + "</div></div>";
      }
      html += "</div><p class='muted'>Questions per box (box 0 = rebuilding; box 5 = long-spacing, strong).</p></div>";
      var tracked = Object.keys(p.stats).filter(function (id) { return byId[id] && p.stats[id].wrong > 0; });
      html += "<h2 class='section-h'>Questions with any miss</h2>";
      if (!tracked.length) {
        html += "<p class='muted'>No misses recorded yet in this bank. Run a practice session to start the schedule.</p>";
      } else {
        tracked.sort(function (a, b) { return p.stats[a].box - p.stats[b].box; });
        html += '<div class="card"><table class="table"><thead><tr><th>Question</th><th>Category</th><th>Box</th><th>Attempts</th><th>Status</th></tr></thead><tbody>';
        tracked.forEach(function (id) {
          var s = p.stats[id];
          var dueNow = Engine.isDue(s, now);
          html += "<tr><td><button type=\"button\" class=\"link-q\" data-qid=\"" + esc(id) + "\">" + esc(byId[id].question) + "</button></td>" +
            "<td>" + esc(byId[id].category) + "</td><td>" + s.box + "</td><td>" + s.seen + "</td>" +
            "<td>" + (dueNow ? '<span class="chip chip-flag">due</span>' : '<span class="chip chip-soft">scheduled</span>') + "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      view.innerHTML = html;

      wireBankPicker(bankId, function () { showReview(state.reviewBankId); });
      var startDue = el("start-due");
      if (startDue) {
        startDue.addEventListener("click", function () {
          NCLEX.Quiz.startReview(entry.bank, due);
        });
      }
      var startLast = el("start-last");
      if (startLast) {
        startLast.addEventListener("click", function () {
          NCLEX.Quiz.startReview(entry.bank, lastMisses);
        });
      }
      view.querySelectorAll(".link-q").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var q = byId[btn.getAttribute("data-qid")];
          if (q) {
            showPlainModal("Question detail",
              "<p class='modal-q'>" + esc(q.question) + "</p>" +
              "<ul class='refs'>" + q.choices.map(function (cl, idx) {
                return "<li" + (idx === q.answerIndex ? " class='ref-correct'" : "") + ">" +
                  String.fromCharCode(65 + idx) + ". " + esc(cl) + "</li>";
              }).join("") + "</ul>" +
              "<p>" + esc(q.explanation) + "</p>" +
              (q.references && q.references.length ? "<p class='muted'>Source: " + esc(q.references.join("; ")) + "</p>" : ""));
          }
        });
      });
    };
    page();
    scrollToTop();
  }
  App.showReview = showReview;

  function showProgress(bankId) {
    setRoute("progress");
    var view = el("view");
    if (!state.banks.length) {
      view.innerHTML = "<h1>Progress</h1><p class='lede'>No banks loaded.</p>";
      return;
    }
    if (!bankId || !bankById(bankId)) {
      bankId = state.banks[0].bank.id;
    }
    state.progressBankId = bankId;
    var entry = bankById(bankId);
    var page = function () {
      var p = Store.getProgress(bankId);
      var examAttempts = p.attempts.filter(function (a) { return a.mode === "exam"; });
      var avgExam = examAttempts.length
        ? Math.round(examAttempts.reduce(function (sum, a) { return sum + a.pct; }, 0) / examAttempts.length)
        : null;
      var html = "";
      html += "<h1>Progress</h1>";
      html += "<p class='lede'>Everything here lives in your browser's local storage on this device; it never leaves your machine.</p>";
      html += bankPickerHtml(bankId);
      html += '<div class="stat-row">';
      html += '<div class="stat card"><div class="stat-num">' + p.attempts.length + '</div><div class="stat-label">sessions finished</div></div>';
      html += '<div class="stat card"><div class="stat-num">' + p.practiceCount + '</div><div class="stat-label">practice runs</div></div>';
      html += '<div class="stat card"><div class="stat-num">' + p.examCount + '</div><div class="stat-label">exams taken</div></div>';
      html += '<div class="stat card"><div class="stat-num">' + (avgExam === null ? "—" : avgExam + "%") + '</div><div class="stat-label">avg exam score</div></div>';
      html += '<div class="stat card"><div class="stat-num">' + (p.bestExamPct === null ? "—" : p.bestExamPct + "%") + '</div><div class="stat-label">best exam</div></div>';
      html += "</div>";
      if (p.attempts.length) {
        html += '<div class="card"><h3>Session history</h3><table class="table"><thead><tr><th>When</th><th>Mode</th><th>Score</th><th>Result</th></tr></thead><tbody>';
        p.attempts.slice(0, 10).forEach(function (a) {
          html += "<tr><td>" + esc(Util.fmtDate(a.ts)) + "</td><td>" + esc(a.mode) + "</td>" +
            "<td>" + a.correct + "/" + a.total + " (" + a.pct + "%)</td><td>" +
            (a.mode === "exam"
              ? (a.passed ? "<span class='chip chip-pass'>pass</span>" : "<span class='chip chip-flag'>below pass</span>")
              : "<span class='chip chip-soft'>practice</span>") + "</td></tr>";
        });
        html += "</tbody></table></div>";
      } else {
        html += "<p class='muted'>No finished sessions yet in this bank. Practice a session to see your trend.</p>";
      }
      html += '<div class="card danger-zone"><h3>Data management</h3>';
      html += "<p class='muted'>Resetting a bank's progress permanently deletes its misses, schedule, and session history from this browser.</p>";
      html += '<button id="reset-progress" class="btn btn-danger" type="button">Reset "' + esc(entry.bank.name) + '" progress</button></div>';
      view.innerHTML = html;

      wireBankPicker(bankId, function () { showProgress(state.progressBankId); });
      var reset = el("reset-progress");
      reset.addEventListener("click", function () {
        App.confirmModal("Erase all progress for this bank?",
          "This permanently deletes this bank's misses, schedule, and session history from local storage on this device.",
          [
            { label: "Cancel", value: "cancel" },
            { label: "Erase progress", value: "erase", kind: "danger" }
          ],
          function (choice) {
            if (choice === "erase") {
              Store.resetProgress(bankId);
              flash("Progress erased for that bank.");
              showProgress(bankId);
            }
          });
      });
    };
    page();
    scrollToTop();
  }
  App.showProgress = showProgress;

  function showImport() {
    setRoute("import");
    var view = el("view");
    var sample = JSON.stringify({
      schemaVersion: 1,
      id: "your-bank-id",
      name: "Your Bank Name",
      description: "A friendly description of what this bank covers.",
      version: "1.0.0",
      exam: { passPct: 75, minutes: null },
      questions: [{
        id: "q-1",
        category: "General",
        difficulty: "easy",
        question: "Why does this app ask you to confirm that facility policies apply?",
        choices: [
          "Because quiz scores change clinical decisions",
          "Because this tool is for study, not for guiding real care",
          "Because banks need filler text",
          "Because the app stores your identity"
        ],
        answerIndex: 1,
        explanation: "This trainer is educational only. Real practice always defers to your facility's current policies, your instructor, and authoritative references.",
        references: ["This app's disclaimer"]
      }]
    }, null, 2);
    var html = "";
    html += "<h1>Import a question bank</h1>";
    html += "<p class='lede'>Load any JSON bank authored in the starter schema. Imported banks are saved in this browser's local storage; nothing is uploaded anywhere.</p>";
    html += '<div class="import-grid">';
    html += "<div class='card'><h3>Choose a file</h3><p class='muted'>Pick a <code>.json</code> bank file from your computer.</p><input type='file' id='bank-file' accept='.json,application/json' class='input' /></div>";
    html += "<div class='card'><h3>Or paste JSON</h3>";
    html += "<textarea id='bank-text' class='input input-mono' rows='14' placeholder='Paste a matching bank JSON here…'></textarea>";
    html += '<div class="import-btns"><button id="import-check" class="btn btn-primary" type="button">Validate &amp; import</button>';
    html += '<button id="import-sample" class="btn btn-ghost" type="button">Load starter template</button></div>';
    html += '<div id="import-result" class="import-result" aria-live="polite"></div>';
    html += "</div></div>";
    html += "<h2 class='section-h'>What the validator checks</h2>";
    html += "<div class='card'><ul class='plainlist'>" +
      "<li><strong>Bank shape:</strong> id, name, schemaVersion 1, a non-empty questions array, and valid exam settings (passPct 1–100, optional timer).</li>" +
      "<li><strong>Every question:</strong> a unique id; real question text; at least 2 choices; an answerIndex inside that range; and a real explanation — explanations are the whole point of a study bank.</li>" +
      "<li><strong>What it does not check:</strong> clinical accuracy. You own the correctness of your submitted content.</li>" +
      "</ul></div>";
    view.innerHTML = html;
    scrollToTop();

    var fileInput = el("bank-file");
    var textInput = el("bank-text");
    var checkBtn = el("import-check");
    var sampleBtn = el("import-sample");
    var result = el("import-result");

    function doImport(text) {
      if (!text || !text.trim()) {
        result.innerHTML = "<div class='import-error'>Nothing to import yet — choose a file or paste JSON.</div>";
        return;
      }
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        result.innerHTML = "<div class='import-error'>That is not valid JSON: " + esc(e.message) + "</div>";
        return;
      }
      var v = Engine.validateBank(parsed);
      if (!v.ok) {
        result.innerHTML = "<div class='import-error'><strong>Not valid — " + v.errors.length + " problem" + (v.errors.length === 1 ? "" : "s") + ":</strong><ul>" +
          v.errors.map(function (er) { return "<li>" + esc(er) + "</li>"; }).join("") + "</ul></div>";
        return;
      }
      var bank = v.bank;
      if (bankById(bank.id)) {
        App.confirmModal("Bank id already in use",
          "A bank with id " + bank.id + " is already loaded. Replace it on this device?",
          [
            { label: "Cancel", value: "cancel" },
            { label: "Replace", value: "replace", kind: "primary" }
          ],
          function (choice) {
            if (choice === "replace") {
              Store.saveCustomBank(bank);
              loadBanks();
              result.innerHTML = "<div class='import-ok'>Replaced " + esc(bank.name) + " (" + bank.questions.length + " questions).</div>";
            }
          });
        return;
      }
      Store.saveCustomBank(bank);
      loadBanks();
      result.innerHTML = "<div class='import-ok'>Imported " + esc(bank.name) + " v" + esc(bank.version) + " — " + bank.questions.length + " questions. See it on the Banks page.</div>";
    }

    fileInput.addEventListener("change", function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        textInput.value = reader.result;
        doImport(String(reader.result || ""));
      };
      reader.readAsText(f);
    });
    checkBtn.addEventListener("click", function () { doImport(textInput.value); });
    sampleBtn.addEventListener("click", function () {
      textInput.value = sample;
      result.innerHTML = "<div class='import-ok'>Starter template loaded in the box — edit and import.</div>";
    });
  }
  App.showImport = showImport;

  function showAbout() {
    setRoute("about");
    var view = el("view");
    var html = "";
    html += "<h1>About this trainer</h1>";
    html += "<div class='card'><h3>What it is</h3><p>An education-only trainer for nursing-style study questions: JSON question banks with explanations, practice and exam modes, wrong-answer review, and spaced re-asking of misses. It runs entirely in your browser, makes no network calls after load, and stores only your own study statistics in this browser's local storage.</p></div>";
    html += "<div class='card'><h3>Who made it</h3><p><strong>NCLEX-Style Quiz Trainer</strong> — a small study-buddy tool published as a free, open-source, education-only project by <strong>Asdale Dynamics, LLC</strong>. Learn more at <a href=\"https://dylanasdale.github.io\" target=\"_blank\" rel=\"noopener\">dylanasdale.github.io</a>. MIT licensed — fork it, improve it, share it.</p></div>";
    html += "<div class='card'><h3>Safety limits</h3><p>This app teaches and quizzes. It does not diagnose, treat, or advise, and it never replaces <strong>your facility's current policies and procedures</strong>, your instructor or preceptor, or authoritative point-of-care references. The built-in bank's content paraphrases widely published public guidance (CDC, WHO, Joint Commission, ADA, NCSBN, CMS) written from scratch for this project; question content is author-updatable, so always cross-check before relying on anything in real care.</p></div>";
    html += "<div class='card'><h3>Privacy</h3><p>No accounts. No tracking. No analytics. Your progress, custom banks, and settings live only in this browser's local storage until you clear them.</p></div>";
    html += "<div class='card'><h3>Suggested study flow</h3><ul class='plainlist'>" +
      "<li>Start in <strong>Practice</strong>: the rationale matters more than the score.</li>" +
      "<li>When a topic keeps slipping, use <strong>Review</strong>: spaced re-asking (boxes 0–5) is built to make content stick in memory.</li>" +
      "<li>Use <strong>Exam</strong> to rehearse test conditions: timed, no feedback, pass mark up front.</li>" +
      "<li>Author your own bank in the built-in schema — see the <strong>Import</strong> tab and the README in the project folder.</li>" +
      "</ul></div>";
    html += "<div class='card'><h3>Credits</h3><ul class='plainlist'><li>Built-in bank content: original material written from published public guidance; no copyrighted test-prep material is included.</li>" +
      "<li>App: © 2026 Asdale Dynamics, LLC · MIT License.</li></ul></div>";
    view.innerHTML = html;
    scrollToTop();
  }
  App.showAbout = showAbout;

  function showDisclaimerModal(done) {
    var htmlBody = "";
    htmlBody += "<p>This <strong>NCLEX-Style Quiz Trainer</strong> is an <strong>education-only self-study tool</strong>. It is <strong>not medical advice</strong>, and it does not substitute for clinical judgment, your instructor, or your facility's current policies, procedures, and point-of-care references.</p>";
    htmlBody += "<p class='muted'>The built-in bank writes original questions from widely published public guidance and is meant for personal study. Question content can be updated by authors, so verify anything before relying on it in real care.</p>";
    htmlBody += "<p><input type='checkbox' id='ack-chk' /> <label for='ack-chk'>I understand this app is educational study material only, and that in real practice I follow my facility's current policies and procedures — not this app.</label></p>";
    modal({
      title: "Welcome & safety note",
      body: htmlBody,
      buttons: [{ label: "Start studying", value: "ack", kind: "primary" }],
      dismissible: false
    }, function (choice) {
      var chk = el("ack-chk");
      if (choice === "ack") {
        if (chk && chk.checked) {
          Store.setAck(true);
          if (done) done();
        } else {
          flash("Please tick the box so we know you are covered for the boring paperwork bits.");
          showDisclaimerModal(done);
        }
      } else {
        showDisclaimerModal(done);
      }
    });
  }

  function wireNav() {
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var r = link.getAttribute("data-route");
        if (r === "home") showHome();
        else if (r === "review") showReview(state.reviewBankId);
        else if (r === "progress") showProgress(state.progressBankId);
        else if (r === "import") showImport();
        else if (r === "about") showAbout();
      });
    });
    var footerAbout = document.getElementById("footer-about");
    if (footerAbout) {
      footerAbout.addEventListener("click", function (e) {
        e.preventDefault();
        showAbout();
      });
    }
  }

  function boot() {
    Store = NCLEX.createStorage();
    App.Store = Store;
    state.banks = [];
    loadBanks();
    wireNav();
    showHome();
    if (!Store.ack()) {
      showDisclaimerModal(function () {
        flash("Welcome aboard. Study well — and let your facility's policies win any tie-breakers.");
      });
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this);

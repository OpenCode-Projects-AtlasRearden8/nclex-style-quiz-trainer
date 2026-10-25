(function (root) {
  "use strict";
  var NCLEX = root.NCLEX = root.NCLEX || {};
  var Quiz = {};
  var Engine = NCLEX.Engine;
  var Util = NCLEX.Util;

  var timerHandle = null;
  var keyHandler = null;

  function esc(s) { return Util.esc(s); }
  function el(id) { return document.getElementById(id); }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
    if (keyHandler) {
      document.removeEventListener("keydown", keyHandler);
      keyHandler = null;
    }
  }

  Quiz.stopEverything = stopTimer;

  function byIdMap(bank) { return Util.questionById(bank); }

  function startPractice(bank, count) {
    var rng = Engine.mulberry32(Date.now() & 0x7fffffff);
    var deck = Engine.buildDeck(bank, { mode: "practice", count: count, rng: rng });
    var session = Engine.createSession(bank, "practice", deck);
    NCLEX.App.Store.saveActiveSession({ session: session, bank: bank, savedAt: Date.now() });
    renderSession(session, bank);
  }

  function startReview(bank, ids) {
    var rng = Engine.mulberry32(Date.now() & 0x7fffffff);
    var deck = Engine.buildDeck(bank, { mode: "review", only: ids, rng: rng });
    if (deck.length === 0) {
      NCLEX.App.flash("No questions matched that review set.");
      NCLEX.App.showHome();
      return;
    }
    var session = Engine.createSession(bank, "review", deck);
    NCLEX.App.Store.saveActiveSession({ session: session, bank: bank, savedAt: Date.now() });
    renderSession(session, bank);
  }

  function startExam(bank) {
    var rng = Engine.mulberry32(Date.now() & 0x7fffffff);
    var deck = Engine.buildDeck(bank, { mode: "exam", rng: rng });
    var session = Engine.createSession(bank, "exam", deck);
    if (bank.exam.minutes) {
      session.examEnd = session.startedAt + bank.exam.minutes * 60000;
    }
    NCLEX.App.Store.saveActiveSession({ session: session, bank: bank, savedAt: Date.now() });
    renderSession(session, bank);
  }

  Quiz.startPractice = startPractice;
  Quiz.startReview = startReview;
  Quiz.startExam = startExam;

  function saveSession(session, bank) {
    if (session.finished) {
      NCLEX.App.Store.clearActiveSession();
    } else {
      NCLEX.App.Store.saveActiveSession({ session: session, bank: bank, savedAt: Date.now() });
    }
  }

  function modeLabel(mode) {
    return mode === "exam" ? "Exam mode" : (mode === "review" ? "Misses review" : "Practice mode");
  }

  function renderSession(session, bank) {
    if (session.finished) {
      finishSession(session, bank);
      return;
    }
    stopTimer();
    NCLEX.App.setRoute("quiz");
    var view = el("view");
    var byId = byIdMap(bank);
    var qid = Engine.currentQid(session);
    var q = byId[qid];
    if (!q) {
      finishSession(session, bank);
      return;
    }
    if (session.mode !== "exam") {
      Engine.startDelivery(session, qid);
    }
    saveSession(session, bank);

    var numbering;
    var requeues = 0;
    var isPractice = session.mode !== "exam";
    if (session.mode === "exam") {
      numbering = "Question " + (session.pointer + 1) + " of " + session.examOrder.length;
    } else {
      numbering = "Question " + session.deliveredOrder.length + " of " + session.deckSize;
      requeues = session.queue.filter(function (item) { return item.isRequeue; }).length;
    }

    var flagged = session.mode === "exam" && !!session.flags[qid];
    var selected = session.mode === "exam" ? session.answers[qid] : null;

    var html = "";
    html += '<div class="quiz-top">';
    html += '<div class="quiz-top-left">';
    html += '<span class="chip chip-mode">' + esc(modeLabel(session.mode)) + "</span>";
    html += '<span class="quiz-counter">' + esc(numbering) + "</span>";
    if (isPractice && requeues > 0) {
      html += '<span class="chip chip-soft">' + requeues + " re-ask" + (requeues === 1 ? "" : "s") + " queued</span>";
    }
    html += "</div>";
    if (session.mode === "exam") {
      html += '<div class="quiz-top-right"><span id="exam-timer" class="timer">--:--</span></div>';
    }
    html += '<button id="quiz-exit" class="btn btn-ghost btn-sm" type="button">Exit</button>';
    html += "</div>";
    html += '<div class="progressbar"><div class="progressbar-fill" id="quiz-progress" style="width:0%"></div></div>';
    html += '<article class="card qcard">';
    html += '<div class="qmeta">';
    html += '<span class="chip chip-cat">' + esc(q.category) + "</span>";
    html += '<span class="chip chip-diff">' + esc(q.difficulty) + "</span>";
    if (flagged) html += '<span class="chip chip-flag">Flagged</span>';
    html += "</div>";
    html += '<h2 class="qtext" id="qtext">' + esc(q.question) + "</h2>";
    html += '<div class="choices" role="radiogroup" aria-labelledby="qtext">';
    for (var i = 0; i < q.choices.length; i++) {
      var letter = String.fromCharCode(65 + i);
      var cls = "choice";
      if (selected === i) cls += " selected";
      html += '<button type="button" class="' + cls + '" data-idx="' + i + '" role="radio" aria-checked="' + (selected === i) + '">';
      html += '<span class="choice-letter">' + letter + "</span>";
      html += '<span class="choice-text">' + esc(q.choices[i]) + "</span>";
      html += "</button>";
    }
    html += "</div>";
    if (isPractice) {
      html += '<div class="qactions"><button id="btn-check" class="btn btn-primary" type="button" disabled>Check answer</button></div>';
    } else {
      html += '<div class="qactions exam-actions">';
      html += '<div class="exam-nav-left">';
      html += '<button id="btn-prev" class="btn btn-ghost" type="button"' + (session.pointer === 0 ? " disabled" : "") + ">Back</button>";
      html += '<button id="btn-flag" class="btn btn-ghost" type="button">' + (flagged ? "Unflag question" : "Flag for review") + "</button>";
      html += "</div>";
      html += '<div class="exam-nav-right">';
      var flagCount = Object.keys(session.flags).filter(function (f) { return session.flags[f]; }).length;
      html += '<span class="flags-note">' + flagCount + " flagged</span>";
      if (session.pointer + 1 < session.examOrder.length) {
        html += '<button id="btn-next" class="btn btn-ghost" type="button">Next</button>';
      }
      html += '<button id="btn-finish" class="btn btn-primary" type="button">Finish exam</button>';
      html += "</div>";
      html += "</div>";
    }
    html += '<div id="feedback" class="feedback" aria-live="polite"></div>';
    html += "</article>";
    view.innerHTML = html;

    var progressPct = isPractice
      ? Math.round((Math.min(session.deliveredOrder.length, session.deckSize) / session.deckSize) * 100)
      : Math.round(((session.pointer + 1) / session.examOrder.length) * 100);
    el("quiz-progress").style.width = progressPct + "%";

    var choiceButtons = view.querySelectorAll(".choice");
    var checkedIdx = null;

    choiceButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        choiceButtons.forEach(function (b) {
          b.classList.remove("selected");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
        checkedIdx = parseInt(btn.getAttribute("data-idx"), 10);
        if (isPractice) {
          el("btn-check").disabled = false;
        } else {
          Engine.answerExam(session, qid, checkedIdx);
          saveSession(session, bank);
        }
      });
    });

    el("quiz-exit").addEventListener("click", function () {
      stopTimer();
      NCLEX.App.confirmModal(
        "Leave this session?",
        "You can resume it later from the home page, or discard it. Question stats recorded so far are kept either way.",
        [
          { label: "Keep & leave", value: "keep" },
          { label: "Discard", value: "discard", kind: "danger" }
        ],
        function (choice) {
          if (choice === "discard") {
            NCLEX.App.Store.clearActiveSession();
          }
          NCLEX.App.showHome();
        }
      );
    });

    if (isPractice) {
      el("btn-check").addEventListener("click", function () {
        if (checkedIdx === null) return;
        choiceButtons.forEach(function (b) { b.disabled = true; });
        var result = Engine.answerPractice(session, q, checkedIdx);
        NCLEX.App.recordStat(bank.id, q.id, result.correct);
        saveSession(session, bank);
        showPracticeFeedback(session, q, result, checkedIdx);
      });
    } else {
      el("btn-prev").addEventListener("click", function () {
        if (session.pointer > 0) {
          session.pointer -= 1;
          saveSession(session, bank);
          renderSession(session, bank);
        }
      });
      el("btn-flag").addEventListener("click", function () {
        Engine.toggleFlag(session, qid);
        saveSession(session, bank);
        renderSession(session, bank);
      });
      var nextBtn = el("btn-next");
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          Engine.advance(session);
          saveSession(session, bank);
          renderSession(session, bank);
        });
      }
      el("btn-finish").addEventListener("click", function () {
        confirmFinish(session, bank);
      });
      if (session.examEnd) {
        startExamTimer(session, bank);
      }
    }

    keyHandler = function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key >= "1" && e.key <= "9") {
        var idx = parseInt(e.key, 10) - 1;
        if (choiceButtons[idx]) choiceButtons[idx].click();
      } else if (e.key === "Enter" && isPractice) {
        var checkBtn = el("btn-check");
        if (checkBtn && !checkBtn.disabled && !checkBtn.classList.contains("hidden")) {
          checkBtn.click();
        } else {
          var nextQ = el("btn-next-q");
          if (nextQ) nextQ.click();
          else if (checkBtn) checkBtn.click();
        }
      }
    };
    document.addEventListener("keydown", keyHandler);
  }

  function showPracticeFeedback(session, q, result, chosenIdx) {
    var fb = el("feedback");
    var correctText = esc(q.choices[q.answerIndex]);
    var letter = String.fromCharCode(65 + q.answerIndex);
    var clearedRequeue = result.correct && session.results[q.id].first === "miss";
    var title = result.correct
      ? (clearedRequeue ? "Cleared this one" : "Correct")
      : "Not quite";
    var sub = "";
    if (!result.correct) {
      sub = session.mode === "review"
        ? "You will see this question again until you clear the miss."
        : "You will see this question again later in this session until you clear it, and it stays scheduled for review across sessions.";
    }
    fb.className = "feedback " + (result.correct ? "feedback-ok" : "feedback-bad");
    fb.innerHTML =
      '<div class="feedback-title">' + esc(title) + "</div>" +
      (sub ? '<div class="feedback-sub">' + esc(sub) + "</div>" : "") +
      (!result.correct
        ? '<div class="feedback-answer"><strong>Correct answer:</strong> (' + letter + ") " + correctText + "</div>"
        : "") +
      '<div class="feedback-explain">' + esc(q.explanation) + "</div>" +
      (q.references && q.references.length
        ? '<ul class="refs">' + q.references.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>"
        : "") +
      '<div class="feedback-actions"><button id="btn-next-q" class="btn btn-primary" type="button">' +
      (session.queue.length === 1 ? "See results" : "Next question") +
      "</button></div>";

    var checkBtn = el("btn-check");
    checkBtn.disabled = true;
    checkBtn.classList.add("hidden");

    document.getElementById("btn-next-q").addEventListener("click", function () {
      Engine.advance(session);
      saveSession(session, bank);
      if (session.finished) {
        finishSession(session, bank);
      } else {
        renderSession(session, bank);
      }
    });
    document.getElementById("btn-next-q").focus();
  }

  function confirmFinish(session, bank) {
    var unanswered = session.examOrder.filter(function (id) {
      return typeof session.answers[id] !== "number";
    }).length;
    var flagged = Object.keys(session.flags).filter(function (f) { return session.flags[f]; }).length;
    var msg = "";
    if (unanswered === 0) {
      msg = "All questions answered. Finish now and see your results?";
    } else {
      msg = unanswered + " question" + (unanswered === 1 ? "" : "s") + " unanswered. Unanswered questions are graded as incorrect.";
    }
    if (flagged > 0) {
      msg += " " + flagged + " flagged for review.";
    }
    NCLEX.App.confirmModal(
      "Finish exam?",
      msg,
      [
        { label: "Keep answering", value: "cancel" },
        { label: "Finish & grade", value: "finish", kind: "primary" }
      ],
      function (choice) {
        if (choice === "finish") {
          examFinish(session, bank);
        }
      }
    );
  }

  function startExamTimer(session, bank) {
    var timerEl = el("exam-timer");
    function tick() {
      var remaining = session.examEnd - Date.now();
      if (remaining <= 0) {
        stopTimer();
        NCLEX.App.flash("Time is up. Your exam was graded automatically.");
        examFinish(session, bank);
        return;
      }
      if (timerEl) {
        timerEl.textContent = Util.fmtClock(remaining);
        timerEl.classList.toggle("timer-low", remaining < 120000);
      }
    }
    tick();
    timerHandle = setInterval(tick, 500);
  }

  function examFinish(session, bank) {
    stopTimer();
    var byId = byIdMap(bank);
    Engine.finishExam(session, byId);
    for (var i = 0; i < session.examOrder.length; i++) {
      var qid = session.examOrder[i];
      NCLEX.App.recordStat(bank.id, qid, session.results[qid].first === "correct", true);
    }
    session.recorded = true;
    renderResults(session, bank);
  }

  function finishSession(session, bank) {
    stopTimer();
    session.score = Engine.scoreSession(session);
    renderResults(session, bank);
  }

  function renderResults(session, bank) {
    stopTimer();
    NCLEX.App.Store.clearActiveSession();
    if (!session.recorded) {
      session.recorded = true;
      NCLEX.App.recordAttempt(session, bank);
    }
    NCLEX.App.setRoute("results");
    var byId = byIdMap(bank);
    var score = session.score || Engine.scoreSession(session);
    var ids = session.mode === "exam" ? session.examOrder : session.deliveredOrder;
    var isExam = session.mode === "exam";
    var missedIds = ids.filter(function (id) {
      return session.results[id] && session.results[id].first === "miss";
    });

    var html = "";
    html += '<section class="results">';
    html += '<div class="card results-card">';
    html += '<div class="results-eyebrow">' + esc(modeLabel(session.mode)) + " complete</div>";
    html += '<div class="results-score">';
    html += '<span class="results-pct">' + score.pct + "%</span>";
    if (isExam) {
      html += '<span class="pill ' + (score.passed ? "pill-pass" : "pill-fail") + '">' +
        (score.passed ? "Passed" : "Keep going") + " · pass mark " + esc(session.bankMeta.exam.passPct) + "%</span>";
    } else {
      html += '<span class="pill pill-soft">First-attempt accuracy</span>';
    }
    html += "</div>";
    html += '<div class="results-line">' + score.correct + " of " + score.total + " correct";
    if (isExam && score.unanswered) html += " (" + score.unanswered + " unanswered)";
    html += "</div>";
    html += '<div class="results-encourage">' + esc(resultsMessage(session.mode, score.passed)) + "</div>";
    html += "</div>";

    var cats = Engine.scoreByCategory(session, byId);
    var catKeys = Object.keys(cats).sort();
    if (catKeys.length > 1) {
      html += '<div class="card"><h3>By category</h3><table class="table"><thead><tr><th>Category</th><th>Correct</th><th>Score</th></tr></thead><tbody>';
      catKeys.forEach(function (c) {
        var row = cats[c];
        html += "<tr><td>" + esc(c) + "</td><td>" + row.correct + "/" + row.total + "</td><td>" + Util.pct(row.correct, row.total) + "%</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html += '<details class="review-toggle" open>';
    html += "<summary>Review every question with its explanation</summary>";
    html += '<div class="review-list">';
    ids.forEach(function (rid) {
      var q = byId[rid];
      var r = session.results[rid];
      if (!q || !r) return;
      var ok = r.first === "correct";
      var chosen = r.lastChoice;
      html += '<details class="review-item' + (ok ? " review-ok" : " review-bad") + '">';
      html += "<summary><span class=\"review-mark\">" + (ok ? "✓" : "✗") + "</span> " + esc(q.question) + "</summary>";
      html += '<div class="review-body">';
      var yourAnswer;
      var correctLine;
      if (typeof chosen === "number") {
        yourAnswer = "(" + String.fromCharCode(65 + chosen) + ") " + esc(q.choices[chosen]);
        if (chosen !== q.answerIndex) {
          correctLine = ' <span class="review-correct">Correct: (' + String.fromCharCode(65 + q.answerIndex) + ") " + esc(q.choices[q.answerIndex]) + "</span>";
        } else {
          correctLine = "";
        }
      } else {
        yourAnswer = "unanswered";
        correctLine = ' <span class="review-correct">Correct: (' + String.fromCharCode(65 + q.answerIndex) + ") " + esc(q.choices[q.answerIndex]) + "</span>";
      }
      html += '<div class="review-answers"><span><strong>Your answer:</strong> ' + yourAnswer + "</span>" + correctLine + "</div>";
      html += '<div class="review-explain">' + esc(q.explanation) + "</div>";
      if (q.references && q.references.length) {
        html += '<ul class="refs">' + q.references.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      }
      html += "</div></details>";
    });
    html += "</div></details>";

    html += '<div class="results-actions">';
    html += '<button id="results-home" class="btn btn-ghost" type="button">Back to banks</button>';
    if (missedIds.length > 0) {
      html += '<button id="results-miss" class="btn btn-primary" type="button">Practice ' + missedIds.length + " miss" + (missedIds.length === 1 ? "" : "es") + "</button>";
    }
    if (isExam) {
      html += '<button id="results-retry" class="btn btn-ghost" type="button">Retake exam</button>';
    } else {
      html += '<button id="results-retry" class="btn btn-ghost" type="button">Practice again</button>';
    }
    html += "</div>";
    html += "</section>";
    el("view").innerHTML = html;

    NCLEX.App.scrollToTop();
    el("results-home").addEventListener("click", function () { NCLEX.App.showHome(); });
    var missBtn = el("results-miss");
    if (missBtn) {
      missBtn.addEventListener("click", function () {
        startReview(bank, missedIds);
      });
    }
    el("results-retry").addEventListener("click", function () {
      if (isExam) startExam(bank);
      else startPractice(bank, session.deckSize);
    });
  }

  function resultsMessage(mode, passed) {
    if (mode === "exam") {
      return passed
        ? "Solid exam run. Review anything you missed, and spaced review will bring the rest back on schedule."
        : "Every exam shows exactly where to aim next. Practice the misses and let the scheduler bring them back at the right time.";
    }
    if (mode === "review") {
      return "Clearing misses one by one is exactly how they stick for good.";
    }
    return "Practice re-asked your misses in-session and quietly scheduled them for future review.";
  }

  Quiz.renderResults = renderResults;
  Quiz.finishSession = finishSession;
  Quiz.resultsMessage = resultsMessage;
})(typeof globalThis === "object" && globalThis !== null
  ? globalThis
  : typeof self !== "undefined" ? self : this);

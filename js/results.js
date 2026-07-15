/*
  ============================================================
  results.js — Behavior for the Results Page (results.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This is the last page of the simulation. It brings together
  everything recorded in state across the previous pages and
  explains it in plain language — no numeric score anywhere, per
  this project's decision to keep every outcome qualitative.

  This file:
    1) recaps what the participant actually did (from state saved
       by the inbox and login pages),
    2) shows the final VPN/Firewall/MFA configuration they left
       the dashboard with,
    3) explains the outcome of that specific combination, using
       the SAME outcome table from scoring.js that the dashboard's
       live preview already used — so this page can never tell a
       different story than the one already shown,
    4) reveals the phishing email's actual warning signs, now that
       the simulation is over, and
    5) lets the participant restart from a clean state.

  Depends on state.js (getState/resetState/escapeHtml) and
  scoring.js (CONTROLS/getOutcome), both loaded before this file.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  const state = getState();
  showEarlyArrivalNotice(state);
  renderRecap(state);
  renderConfiguration(state);
  renderOutcome(state);
  renderIndicators();
  wireRestartButton();
});

/**
 * If someone opens this page directly, without going through the
 * email and login pages, state won't show a completed phishing
 * scenario. We don't hide any content in that case — the "Spot
 * the Signs" section is useful either way — but we do let them
 * know the story below assumes they went through it.
 */
function showEarlyArrivalNotice(state) {
  const noticeEl = document.getElementById("early-arrival-notice");
  if (!noticeEl) return;
  const wentThroughFlow = state.phishingLinkClicked && state.credentialsEntered;
  noticeEl.hidden = wentThroughFlow;
}

/**
 * Lists out what the participant actually did, in order, reading
 * straight from the flags saved by email.js and login.js.
 * Why show this at all: the inbox and login pages happened
 * several pages ago. Reading the sequence back here keeps the
 * explanation that follows grounded in what really happened,
 * instead of assuming the participant remembers every step.
 */
function renderRecap(state) {
  const listEl = document.getElementById("recap-list");
  if (!listEl) return;

  const lines = [];
  if (state.phishingEmailOpened) {
    lines.push('You opened the message from "Microsoft 365 Administrator."');
  }
  if (state.phishingLinkClicked) {
    lines.push("You clicked the sign-in link inside it.");
  }
  if (state.credentialsEntered) {
    lines.push("You entered a username and password on the page it led to.");
  }
  if (lines.length === 0) {
    lines.push(
      "You reached this page without going through the simulated phishing scenario."
    );
  }

  listEl.innerHTML = lines
    .map(function (line) {
      return "<li>" + escapeHtml(line) + "</li>";
    })
    .join("");
}

/**
 * Shows which controls the participant left switched on when they
 * moved on from the dashboard.
 * Why reuse CONTROLS from scoring.js instead of writing "VPN",
 * "Firewall", "MFA" again here: the control names live in exactly
 * one place in the whole project, same as everywhere else.
 */
function renderConfiguration(state) {
  const container = document.getElementById("config-chips");
  if (!container) return;

  container.innerHTML = CONTROLS.map(function (control) {
    const isOn = Boolean(state[control.stateField]);
    const chipClass = isOn ? "chip chip--active" : "chip chip--standby";
    const statusText = isOn ? "ON" : "OFF";
    return (
      '<span class="' +
      chipClass +
      '"><span class="chip__dot"></span>' +
      escapeHtml(control.name) +
      " \u2014 " +
      statusText +
      "</span>"
    );
  }).join("");
}

/**
 * Explains what that final combination actually meant, using the
 * exact same lookup table (and therefore the exact same wording)
 * the dashboard used for its live preview.
 * Why this matters more here than almost anywhere else in the
 * project: this is the participant's takeaway. It has to match
 * what they already saw, or the whole simulation would seem to
 * contradict itself right at the end.
 */
function renderOutcome(state) {
  const panel = document.getElementById("outcome-panel");
  if (!panel) return;

  const outcome = getOutcome(
    state.vpnEnabled,
    state.firewallEnabled,
    state.mfaEnabled
  );

  panel.innerHTML =
    '<p class="outcome-panel__headline">' +
    escapeHtml(outcome.headline) +
    "</p>" +
    outcome.details
      .map(function (line) {
        return "<p>" + escapeHtml(line) + "</p>";
      })
      .join("");
}

/**
 * The educational reveal: the actual warning signs that were
 * present in the phishing email and fake login page all along.
 * Why this only appears now, and not during the email/login
 * pages: pointing these out beforehand would turn a realistic
 * exercise into a quiz with the answers already showing. Waiting
 * until the simulation is over keeps the earlier pages honest.
 */
const RESULT_INDICATORS = [
  {
    title: "The sender's address didn't match the name.",
    detail:
      '"Microsoft 365 Administrator" is just a display name \u2014 anyone can type anything there. The real address was admin@0ffice365-alerts.com, a domain Microsoft doesn\u2019t own, using a zero in place of the letter O.',
  },
  {
    title: "The message used a vague, generic hook.",
    detail:
      '"Unusual sign-in activity" with no device, location, or time named is a common way to prompt a fast reaction before you stop to check the details.',
  },
  {
    title: "The link's visible text didn't match where it led.",
    detail:
      "The text shown was a real Microsoft address (login.microsoftonline.com). The actual destination was a similar-looking domain Microsoft doesn't own (login.microsoftonline-secure-verify.net).",
  },
  {
    title: "The browser's address bar told the truth the whole time.",
    detail:
      "On the sign-in page itself, the address bar showed that same mismatched domain \u2014 visible the entire time, but easy to skip past when focused on signing in quickly.",
  },
];

function renderIndicators() {
  const listEl = document.getElementById("indicator-list");
  if (!listEl) return;

  listEl.innerHTML = RESULT_INDICATORS.map(function (item) {
    return (
      '<li class="indicator-item">' +
      '<p class="indicator-item__title">' +
      escapeHtml(item.title) +
      "</p>" +
      '<p class="indicator-item__detail">' +
      escapeHtml(item.detail) +
      "</p>" +
      "</li>"
    );
  }).join("");
}

/**
 * Clears all saved state and returns to the landing page, so the
 * next attempt (by this participant or the next one on the same
 * device) starts from a genuinely clean slate.
 */
function wireRestartButton() {
  const btn = document.getElementById("restart-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    resetState();
    window.location.href = "index.html";
  });
}

/*
  ============================================================
  dashboard.js — Behavior for the Security Dashboard (dashboard.html)
  ============================================================
  PURPOSE OF THIS FILE:
  By the time a participant reaches this page, they've already
  lived through the phishing scenario (opened the email, clicked
  its link, and submitted the fake login form). This page lets
  them flip VPN, Firewall, and MFA on and off to see — control by
  control — what each one would actually have changed about that
  specific attack.

  This file:
    1) renders the three toggle rows from the CONTROLS data in
       scoring.js (each with an honest role AND limitation),
    2) keeps a live "what's happening right now" explanation and
       a small animated diagram in sync with whichever toggles
       are currently on, using the outcome table in scoring.js,
       and
    3) sends the participant to the Results page once they're
       done exploring — the toggle positions are already saved
       to state as they're clicked, so there's nothing extra to
       save at that point.

  Depends on state.js (getState/setState/escapeHtml) and
  scoring.js (CONTROLS/getOutcome), both loaded before this file.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  warnIfArrivedEarly();
  renderControls();
  syncTogglesWithState();
  wireToggles();
  wireContinueButton();
  updateLiveExplanation();
  updateDiagram();
});

/**
 * If someone opens this page directly — skipping the email and
 * login pages — the simulation state won't show a completed
 * phishing scenario yet.
 * Why this check matters: without it, this page's explanations
 * ("your credentials were just stolen") would be confusing, or
 * simply untrue, for a visitor who arrived here first.
 */
function warnIfArrivedEarly() {
  const state = getState();
  const noticeEl = document.getElementById("early-arrival-notice");
  if (!noticeEl) return;

  const arrivedInOrder = state.phishingLinkClicked && state.credentialsEntered;
  noticeEl.hidden = arrivedInOrder;
}

/**
 * Draws the three toggle rows (VPN, Firewall, MFA) from the
 * CONTROLS array in scoring.js.
 * Why build this from data instead of writing three near-
 * identical HTML blocks by hand: it's the same approach used for
 * the inbox in Phase 2 — the wording lives in one place, and all
 * three rows are guaranteed to share the same structure.
 */
function renderControls() {
  const container = document.getElementById("controls-list");
  if (!container) return;

  container.innerHTML = CONTROLS.map(function (control) {
    return (
      '<div class="control-row glass" data-control="' +
      control.key +
      '">' +
      '<button type="button" class="toggle-switch" id="toggle-' +
      control.key +
      '" role="switch" aria-checked="false" aria-labelledby="label-' +
      control.key +
      '">' +
      '<span class="toggle-switch__track"><span class="toggle-switch__thumb"></span></span>' +
      "</button>" +
      '<div class="control-row__copy">' +
      '<p class="control-row__label" id="label-' +
      control.key +
      '">' +
      escapeHtml(control.name) +
      "</p>" +
      '<p class="control-row__role"><strong>Role:</strong> ' +
      escapeHtml(control.role) +
      "</p>" +
      '<p class="control-row__limit"><strong>Limitation:</strong> ' +
      escapeHtml(control.limitation) +
      "</p>" +
      "</div>" +
      "</div>"
    );
  }).join("");
}

/**
 * Makes each toggle switch visually match whatever is already
 * saved in state. Why this matters: if a participant comes Back
 * from the Results page to explore more combinations, their
 * earlier choices should still be reflected, not reset to off.
 */
function syncTogglesWithState() {
  const state = getState();
  CONTROLS.forEach(function (control) {
    setToggleVisual(control.key, state[control.stateField]);
  });
}

/**
 * Attaches one click handler per toggle switch. Each click flips
 * just that control's own piece of state, then refreshes every
 * part of the page that depends on the FULL combination (the
 * explanation text and the diagram) — not just the one switch
 * that was clicked.
 */
function wireToggles() {
  CONTROLS.forEach(function (control) {
    const btn = document.getElementById("toggle-" + control.key);
    if (!btn) return;

    btn.addEventListener("click", function () {
      const state = getState();
      const newValue = !state[control.stateField];
      setState(buildStateUpdate(control.stateField, newValue));
      setToggleVisual(control.key, newValue);
      updateLiveExplanation();
      updateDiagram();
    });
  });
}

/**
 * Builds a { fieldName: value } object for setState().
 * Why this tiny helper exists: the field name we need to update
 * (e.g. "vpnEnabled") is only known at runtime, from CONTROLS —
 * so we can't just type { vpnEnabled: true } directly in
 * wireToggles() the way we could if the field name were fixed.
 */
function buildStateUpdate(fieldName, value) {
  const update = {};
  update[fieldName] = value;
  return update;
}

/**
 * Updates one toggle's on/off appearance AND its aria-checked
 * attribute. The visual style is for sighted users; aria-checked
 * is what a screen reader actually announces, so both need to be
 * kept in sync every time a toggle changes.
 */
function setToggleVisual(controlKey, isOn) {
  const btn = document.getElementById("toggle-" + controlKey);
  if (!btn) return;
  btn.classList.toggle("is-on", isOn);
  btn.setAttribute("aria-checked", String(isOn));
}

/**
 * Refreshes the plain-language "what's happening right now"
 * panel using the SAME outcome table the Results page will use
 * (scoring.js) — so nothing said here can ever contradict what
 * the participant reads later.
 */
function updateLiveExplanation() {
  const panel = document.getElementById("live-explanation");
  if (!panel) return;

  const state = getState();
  const outcome = getOutcome(
    state.vpnEnabled,
    state.firewallEnabled,
    state.mfaEnabled
  );

  panel.innerHTML =
    '<p class="live-explanation__headline">' +
    escapeHtml(outcome.headline) +
    "</p>" +
    outcome.details
      .map(function (line) {
        return "<p>" + escapeHtml(line) + "</p>";
      })
      .join("");
}

/**
 * Updates the network diagram's icons and packet color to match
 * the current toggle combination. Kept deliberately simple: CSS
 * classes do the actual visual work (see style.css) — this
 * function's only job is deciding which classes should be on or
 * off right now, based on state.
 */
function updateDiagram() {
  const state = getState();

  toggleIcon("vpn-lock", state.vpnEnabled);
  toggleIcon("firewall-shield", state.firewallEnabled);
  toggleIcon("mfa-lock", state.mfaEnabled);

  // In this simulation's simplified model, MFA is the one control
  // that can stop stolen credentials from being used to sign in —
  // matching the explanations written in scoring.js.
  const accountTakeover = !state.mfaEnabled;
  toggleIcon("breach-indicator", accountTakeover);
  toggleIcon("blocked-mark", !accountTakeover);

  const packet = document.getElementById("dash-packet");
  if (packet) {
    packet.classList.toggle("packet--breached", accountTakeover);
    packet.classList.toggle("packet--blocked", !accountTakeover);
  }
}

/**
 * Shows or hides one diagram icon by id, using the shared
 * ".is-visible" class defined once in style.css.
 */
function toggleIcon(id, isVisible) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle("is-visible", isVisible);
  }
}

/**
 * Sends the participant to the Results page. Nothing extra needs
 * to be saved here — each toggle already wrote itself to state
 * the moment it was clicked.
 */
function wireContinueButton() {
  const btn = document.getElementById("continue-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    window.location.href = "results.html";
  });
}

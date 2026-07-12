/*
  ============================================================
  state.js — Shared "memory" for the whole simulation
  ============================================================

  THE PROBLEM:
  This project is made of several separate HTML pages
  (index.html, email.html, login.html, dashboard.html,
  results.html) with NO backend server and NO single-page
  app framework. A normal JavaScript variable resets itself
  every time the browser loads a new page — so on its own,
  main.js on the login page has no way of knowing what
  happened on the email page.

  THE SOLUTION:
  sessionStorage — a small storage area built into every
  browser. It behaves like a simple key/value box that:
    - stays on the participant's OWN device, in this ONE tab
    - is cleared automatically when the tab is closed
    - never sends anything to a server (there is no server)
    - works completely offline

  RULE FOR THIS PROJECT:
  Every other JS file should read and write simulation state
  ONLY through the three functions below (getState, setState,
  resetState) instead of touching sessionStorage directly.
  That way, if we ever need to change *how* state is stored,
  we only have to change it in this one file.

  This file also holds a couple of shared, unchanging scenario
  constants (like the fake phishing URLs) that more than one
  page needs to agree on. It's the natural place for them,
  since it's the one script guaranteed to load on every page.
  ============================================================
*/

// The single key we use inside sessionStorage to store everything.
const STATE_KEY = "cyberSimState";

// --- Shared scenario constants ---
// These two URLs describe the fake phishing link used in the
// simulation. They live here (rather than inside email.js) because
// BOTH the inbox page (which shows the link) and the fake login page
// (which shows a fake address bar) need to agree on the exact same
// values. Keeping a single source of truth means the story can never
// drift out of sync between pages.
const PHISHING_DISPLAY_URL = "https://login.microsoftonline.com/ourcompany";
const PHISHING_REAL_URL =
  "https://login.microsoftonline-secure-verify.net/ourcompany";

// The "shape" of a brand-new simulation run.
// Every property here represents one fact the simulation needs
// to remember as the participant moves between pages.
const DEFAULT_STATE = {
  phishingEmailOpened: false, // did they open the fake phishing email?
  phishingLinkClicked: false, // did they click the link inside it?
  credentialsEntered: false, // did they submit the fake login form?
  vpnEnabled: false, // dashboard toggle: VPN
  firewallEnabled: false, // dashboard toggle: Firewall
  mfaEnabled: false, // dashboard toggle: Multi-Factor Authentication
};

/**
 * Reads the current simulation state from sessionStorage.
 * If nothing has been saved yet (e.g. first visit), returns
 * a fresh copy of DEFAULT_STATE instead.
 */
function getState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }
    // Merge saved data on top of the defaults, so that if we ever
    // add a new field to DEFAULT_STATE later, old saved state
    // won't be missing it.
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (err) {
    // sessionStorage can fail in rare cases (e.g. private browsing
    // mode with storage disabled). If that happens, we fail safely
    // by just starting fresh instead of crashing the page.
    console.warn("Could not read simulation state, starting fresh.", err);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Updates one or more fields in the simulation state, keeping
 * everything else unchanged.
 *
 * Example:
 *   setState({ vpnEnabled: true });
 */
function setState(partialUpdate) {
  const current = getState();
  const updated = { ...current, ...partialUpdate };
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save simulation state.", err);
  }
  return updated;
}

/**
 * Wipes the simulation state completely, returning the
 * participant to a "brand-new run" state. Called when the
 * simulation starts (or restarts) from the landing page.
 */
function resetState() {
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch (err) {
    console.warn("Could not reset simulation state.", err);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Escapes text before it's inserted into the page as HTML.
 * Why this lives here, in the one file every page loads: both
 * email.js and dashboard.js build little bits of HTML out of
 * plain text (an email subject, a control's name) and both want
 * this same safety habit — treat text as text, never as markup —
 * without copying the same function into every file.
 */
function escapeHtml(text) {
  const holder = document.createElement("div");
  holder.textContent = text;
  return holder.innerHTML;
}

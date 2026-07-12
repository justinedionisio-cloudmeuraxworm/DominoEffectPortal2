/*
  ============================================================
  login.js — Behavior for the Fake Login Page (login.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page simulates the site a phishing link leads to. It is
  the most safety-sensitive page in the whole project, so it
  follows one rule above all others: NEVER read, store, or send
  anything the participant types into the Username or Password
  fields. This file only:

    1) displays the fake (lookalike) destination URL in a small
       simulated browser bar, reusing the exact same value shown
       on the inbox page, so the two pages tell one consistent
       story,
    2) intercepts the login form's submit action so the browser
       never actually "sends" it anywhere, and
    3) records ONLY the yes/no fact that the form was submitted,
       before continuing to the security dashboard.

  Depends on state.js, which must load first — it defines
  setState() and the PHISHING_REAL_URL constant used below.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  showFakeAddressBar();
  wireLoginForm();
  wireBackButton();
});

/**
 * Fills in the fake browser address bar with the same lookalike
 * URL that was shown (on hover) back on the inbox page.
 * Why pull this from a shared constant instead of typing the URL
 * again here: if the fake URL ever needs to change, it only has
 * to change in one place (state.js), and every page that uses it
 * stays in sync automatically.
 */
function showFakeAddressBar() {
  const urlEl = document.getElementById("fake-url");
  if (urlEl) {
    urlEl.textContent = PHISHING_REAL_URL;
  }
}

/**
 * Wires up the fake "Sign In" button.
 * Why this function exists: it is the one place in the entire
 * project where a real phishing site would try to steal data —
 * so it's also the one place where we most deliberately show
 * that this simulation does not.
 */
function wireLoginForm() {
  const form = document.getElementById("fake-login-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    // This is the most important line on this page: it stops the
    // browser from doing what a real login form would do (send the
    // entered data somewhere). Because of this line, nothing typed
    // into Username or Password is ever read anywhere in this file.
    event.preventDefault();

    // Clears the fields immediately, so nothing typed here lingers
    // on screen once we move on.
    form.reset();

    // Why we only ever store a yes/no flag: the research question is
    // whether a participant fell for the phishing attempt, not what
    // text they happened to type. Saving the actual typed values —
    // even fake, made-up ones — would work against the "never
    // collect credentials" rule this whole project is built on.
    setState({ credentialsEntered: true });

    window.location.href = "dashboard.html";
  });
}

/**
 * Sends the participant back to the inbox if they'd rather not
 * continue through the fake sign-in page.
 */
function wireBackButton() {
  const backBtn = document.getElementById("back-btn");
  if (!backBtn) return;

  backBtn.addEventListener("click", function () {
    window.location.href = "email.html";
  });
}

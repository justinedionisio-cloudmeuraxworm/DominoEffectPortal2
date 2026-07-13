/*
  ============================================================
  main.js — Behavior for the Landing Page (index.html)
  ============================================================
  This file has one job right now: when the participant presses
  "Start Simulation", we

    1) clear out any leftover state from a previous run, so
       old choices never leak into a new attempt, and
    2) send them to the email inbox page to begin the scenario.

  Note: this file loads AFTER state.js in index.html, so the
  getState / setState / resetState functions are already
  available here.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("start-btn");

  // Safety check: if this file ever gets reused on a page without
  // a start button, don't throw an error — just do nothing.
  if (!startButton) return;

  startButton.addEventListener("click", function () {
    resetState(); // defined in state.js
    window.location.href = "email.html";
  });
});

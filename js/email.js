/*
  ============================================================
  email.js — Behavior for the Simulated Inbox (email.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page shows a small, fake email inbox. Five messages are
  listed; exactly one of them is a phishing attempt. This file:

    1) holds the data for all five messages (EMAILS),
    2) draws the message list on the page,
    3) shows a message's full content when it's clicked, and
    4) if the participant clicks the phishing message's link,
       records that fact and sends them on to the fake login
       page (built in Phase 3).

  IMPORTANT: nothing in this file ever sends data anywhere. The
  "phishing link" below does not go to a real website — it is a
  button styled to look like a link, and it only ever navigates
  to another page inside this same project (login.html).

  This file depends on state.js, which must be loaded first
  (see the <script> order at the bottom of email.html).
  ============================================================
*/

/*
  All five inbox messages live in one array. Keeping the DATA
  (this array) separate from the DISPLAY (the render functions
  below) means we can add, remove, or edit a message just by
  editing this list — nothing else in the file needs to change.

  Each message's "body" is an array of paragraphs rather than
  one long string, so the detail view can print one <p> per
  paragraph without us hand-writing HTML inside the data.
*/
const EMAILS = [
  {
    id: "ms365-security-alert",
    isPhishing: true,
    sender: "Microsoft 365 Administrator",
    senderEmail: "admin@0ffice365-alerts.com",
    subject: "Unusual sign-in activity detected",
    preview: "We noticed a new sign-in to your account from a device we don't recognize...",
    date: "8:14 AM",
    body: [
      "We noticed a new sign-in to your Microsoft 365 account from a device we don't recognize.",
      "If this wasn't you, verify your identity below to help keep your account secure. If this was you, no action is needed.",
      "This is an automated message from the Microsoft 365 security team.",
    ],
    // The text the participant SEES matches a real, legitimate
    // Microsoft sign-in URL — that's the trick. The address it
    // ACTUALLY opens (shown on hover) is a similar-looking but
    // different domain. Both values come from state.js so this
    // page and the fake login page always agree with each other.
    displayLinkText: PHISHING_DISPLAY_URL,
    realLinkUrl: PHISHING_REAL_URL,
  },
  {
    id: "newsletter",
    isPhishing: false,
    sender: "Company Newsletter",
    senderEmail: "newsletter@ourcompany.com",
    subject: "This Month's Highlights",
    preview: "A quick recap of what shipped, who joined, and what's next...",
    date: "Yesterday",
    body: [
      "Here's a quick recap of this month: three product updates shipped, two new teammates joined, and our quarterly all-hands is set for the 28th.",
      "As always, reply to this email with anything you'd like featured next month.",
    ],
  },
  {
    id: "fire-drill",
    isPhishing: false,
    sender: "Facilities Team",
    senderEmail: "facilities@ourcompany.com",
    subject: "Reminder: Fire Drill Tomorrow at 10 AM",
    preview: "Please pause work and head to the nearest exit when the alarm...",
    date: "Yesterday",
    body: [
      "This is a reminder that a scheduled fire drill will take place tomorrow at 10:00 AM.",
      "When the alarm sounds, please save your work, leave your belongings, and head to the nearest marked exit. The drill should take about ten minutes.",
    ],
  },
  {
    id: "project-files",
    isPhishing: false,
    sender: "Jordan Reyes",
    senderEmail: "jordan.reyes@ourcompany.com",
    subject: "Files for tomorrow's review",
    preview: "Sharing the latest versions ahead of our sync tomorrow...",
    date: "2 days ago",
    body: [
      "Hi! Sharing the latest versions ahead of our sync tomorrow — nothing major changed since last week, just tightened up the summary section.",
      "Let me know if you spot anything before we meet.",
    ],
  },
  {
    id: "open-enrollment",
    isPhishing: false,
    sender: "HR Department",
    senderEmail: "hr@ourcompany.com",
    subject: "Open Enrollment Starts Monday",
    preview: "Here's what's changing this year and how to make your...",
    date: "3 days ago",
    body: [
      "Open enrollment begins Monday and runs for two weeks. This year's guide covering what's changing is attached to the internal HR portal.",
      "Sessions to ask questions live are posted on the team calendar.",
    ],
  },
];

/**
 * Looks up one email object by its id.
 * Why a helper instead of repeating EMAILS.find(...) everywhere:
 * if we ever change how emails are stored (e.g. loaded from a
 * file instead of hardcoded), this is the only place that needs
 * to change.
 */
function getEmailById(id) {
  return EMAILS.find(function (email) {
    return email.id === id;
  });
}

/**
 * Escapes text before it's inserted into the page's HTML.
 * Why this exists: any time we build HTML out of a text string
 * (like an email subject), it's a good habit to escape it first
 * so the text is always treated as plain text — never as markup.
 * Our data here is hardcoded and safe either way, but building
 * this habit is exactly the kind of small safety practice this
 * project is trying to teach.
 */
function escapeHtml(text) {
  const holder = document.createElement("div");
  holder.textContent = text;
  return holder.innerHTML;
}

/**
 * Turns a sender's name into two-letter initials for their
 * avatar circle (e.g. "Jordan Reyes" -> "JR").
 * Why: avoids needing separate image files for every sender,
 * which keeps the whole project self-contained and offline-safe.
 */
function getInitials(name) {
  return name
    .split(" ")
    .map(function (word) {
      return word[0];
    })
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Draws the list of five messages into the inbox.
 * Why build the list from EMAILS in JavaScript, instead of
 * writing five <li> elements by hand in the HTML: it keeps the
 * message content in one place (the EMAILS array above) and
 * guarantees the list on screen always matches that data.
 */
function renderInboxList() {
  const listEl = document.getElementById("email-list");
  if (!listEl) return;

  listEl.innerHTML = EMAILS.map(function (email) {
    return (
      '<li class="email-item glass" data-email-id="' +
      email.id +
      '" tabindex="0" role="button" aria-label="Open message from ' +
      escapeHtml(email.sender) +
      ": " +
      escapeHtml(email.subject) +
      '">' +
      '<span class="email-avatar" aria-hidden="true">' +
      getInitials(email.sender) +
      "</span>" +
      '<span class="email-summary">' +
      '<span class="email-sender">' +
      escapeHtml(email.sender) +
      "</span>" +
      '<span class="email-subject">' +
      escapeHtml(email.subject) +
      "</span>" +
      '<span class="email-preview">' +
      escapeHtml(email.preview) +
      "</span>" +
      "</span>" +
      '<span class="email-date">' +
      escapeHtml(email.date) +
      "</span>" +
      "</li>"
    );
  }).join("");
}

/**
 * Sets up ONE click listener (and one keyboard listener) on the
 * whole list, instead of one listener per message.
 * Why "event delegation" like this: it's simpler to maintain —
 * if the list is ever re-rendered with different messages, we
 * don't need to remember to re-attach a listener to each new
 * item. The single listener on the container keeps working.
 */
function initInboxInteractions() {
  const listEl = document.getElementById("email-list");
  if (!listEl) return;

  listEl.addEventListener("click", handleEmailListActivation);

  // Keyboard support: Enter or Space activates the focused message,
  // matching how a real inbox (and basic accessibility expectations)
  // would behave for someone not using a mouse.
  listEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleEmailListActivation(event);
    }
  });
}

function handleEmailListActivation(event) {
  const item = event.target.closest(".email-item");
  if (!item) return;
  openEmail(item.getAttribute("data-email-id"));
}

/**
 * Opens one message in the detail view.
 * Why record "phishingEmailOpened" here specifically: reading the
 * phishing message is a meaningful step on its own, separate from
 * clicking its link. Recording both events separately lets the
 * Results page (Phase 5) later describe the exact sequence of
 * what happened, not just the final outcome.
 */
function openEmail(id) {
  const email = getEmailById(id);
  if (!email) return;

  if (email.isPhishing) {
    setState({ phishingEmailOpened: true });
  }

  renderEmailDetail(email);
  showDetailView();
}

/**
 * Fills in the detail view with one message's full content.
 * The phishing message additionally gets a fake "verify your
 * account" link — styled and worded like a real one, but it is
 * just a button that (a) shows its real destination on hover and
 * (b) only ever navigates within this same project.
 */
function renderEmailDetail(email) {
  const detailEl = document.getElementById("inbox-detail-view");
  if (!detailEl) return;

  const bodyParagraphs = email.body
    .map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    })
    .join("");

  const phishingLinkMarkup = email.isPhishing
    ? '<p class="phishing-link-wrap">' +
      '<button type="button" id="phishing-link-btn" class="phishing-link" ' +
      'title="Actual destination: ' +
      escapeHtml(email.realLinkUrl) +
      '">' +
      escapeHtml(email.displayLinkText) +
      "</button>" +
      "</p>" +
      '<p class="email-hint">Tip: hover over a link (or press and hold on ' +
      "mobile) before clicking. The text you see and the address it " +
      "actually opens can be two different things.</p>"
    : "";

  detailEl.innerHTML =
    '<button type="button" id="back-to-inbox" class="btn-back">&larr; Back to Inbox</button>' +
    '<div class="email-detail__header">' +
    '<p class="email-detail__sender">' +
    escapeHtml(email.sender) +
    " &lt;" +
    escapeHtml(email.senderEmail) +
    "&gt;</p>" +
    '<h2 class="email-detail__subject">' +
    escapeHtml(email.subject) +
    "</h2>" +
    '<p class="email-detail__date">' +
    escapeHtml(email.date) +
    "</p>" +
    "</div>" +
    '<div class="email-detail__body">' +
    bodyParagraphs +
    phishingLinkMarkup +
    "</div>";

  // Re-attach listeners each time, since innerHTML above just
  // replaced the elements they used to be attached to.
  document
    .getElementById("back-to-inbox")
    .addEventListener("click", showListView);

  const phishingLinkBtn = document.getElementById("phishing-link-btn");
  if (phishingLinkBtn) {
    phishingLinkBtn.addEventListener("click", handlePhishingLinkClick);
  }
}

/**
 * Runs when the participant clicks the fake "verify your account"
 * link inside the phishing message.
 * Why this is its own function: clicking the link is the actual
 * moment the simulated participant "takes the bait" — it's the
 * single most important event this page records, so it gets a
 * clearly named function of its own rather than being buried
 * inside renderEmailDetail.
 */
function handlePhishingLinkClick() {
  setState({ phishingLinkClicked: true });
  window.location.href = "login.html";
}

/**
 * Swaps from the message list to the detail view.
 * Why move focus with .focus(): when the visible content changes
 * without a full page navigation, keyboard and screen-reader users
 * need to be told where the "new" content starts. Moving focus to
 * the detail container does that.
 */
function showDetailView() {
  document.getElementById("inbox-list-view").hidden = true;
  const detailEl = document.getElementById("inbox-detail-view");
  detailEl.hidden = false;
  detailEl.focus();
}

function showListView() {
  document.getElementById("inbox-detail-view").hidden = true;
  document.getElementById("inbox-list-view").hidden = false;
}

// Entry point: build the inbox as soon as the page's HTML is ready.
document.addEventListener("DOMContentLoaded", function () {
  renderInboxList();
  initInboxInteractions();
});

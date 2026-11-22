import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./storage";
import { loadAllData } from "./state";
import { handleHashChange, navigateTo } from "./router";
import {
  populateEvidenceDropdowns,
} from "./pages/evidence";
import { populateTimelineDropdowns, renderTimeline } from "./pages/timeline";
import { populateHypothesisDropdowns } from "./pages/workspace";
import { switchPeopleTab } from "./pages/people";

// 1. Declare to TypeScript the global (window) functions we call from the HTML
declare global {
  interface Window {
    navigateTo: typeof navigateTo;
    switchPeopleTab: typeof switchPeopleTab;
  }
}

export function populateAllDropdowns(): void {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function setupEventListeners(): void {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll<HTMLElement>(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  document
    .getElementById("timelineOrder")!
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelinePersonFilter")!
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelineLocationFilter")!
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelineTypeFilter")!
    .addEventListener("change", renderTimeline);

}

function initApp(): void {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    loadNoteAsync("E01").then(function (firstNote) {
      console.log("First note preview:", firstNote);
    });
  });
}

// ---------------------------------------------------------------------
// GLOBAL BRIDGES (for inline "onclick" etc. inside the HTML)
// To keep the HTML unchanged (per the "pure refactor" rule),
// we attach the ES module functions to the global window object.
// ---------------------------------------------------------------------
window.navigateTo = navigateTo;
window.switchPeopleTab = switchPeopleTab;

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);

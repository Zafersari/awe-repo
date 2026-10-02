//const failure = "i never used it";
/*

legacy code from original before ts transition

import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./storage";
import { loadAllData } from "./state";
import { handleHashChange, navigateTo } from "./router";
import {
  populateEvidenceDropdowns,
  renderEvidenceList,
  handleSearchInput,
  handleSortChange,
  clearFilters,
  closeEvidenceDetail,
  saveCurrentNote,
} from "./pages/evidence";
import { populateTimelineDropdowns, renderTimeline } from "./pages/timeline";
import {
  populateHypothesisDropdowns,
  saveHypothesis,
} from "./pages/workspace";
import { switchPeopleTab } from "./pages/people";

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  document
    .getElementById("evidenceSearch")
    .addEventListener("input", handleSearchInput);

  document
    .getElementById("filterType")
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterPerson")
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterLocation")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterStatus")
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterRelevance")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", clearFilters);

  document
    .getElementById("timelineOrder")
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelinePersonFilter")
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelineLocationFilter")
    .addEventListener("change", renderTimeline);
  document
    .getElementById("timelineTypeFilter")
    .addEventListener("change", renderTimeline);

  document
    .getElementById("hypConfidence")
    .addEventListener("input", function (e) {
      document.getElementById("hypConfidenceValue").textContent =
        e.target.value;
    });
}

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    //var firstNote = loadNoteAsync("E01");
    //console.log("First note preview:", firstNote);
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
window.saveHypothesis = saveHypothesis;
window.handleSortChange = handleSortChange;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
window.renderEvidenceList = renderEvidenceList;

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);

Hello World test
*/
import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./storage";
import { loadAllData } from "./state";
import { handleHashChange, navigateTo } from "./router";
import {
  populateEvidenceDropdowns,
  renderEvidenceList,
  handleSearchInput,
  handleSortChange,
  clearFilters,
  closeEvidenceDetail,
  saveCurrentNote,
} from "./pages/evidence";
import { populateTimelineDropdowns, renderTimeline } from "./pages/timeline";
import { populateHypothesisDropdowns, saveHypothesis } from "./pages/workspace";
import { switchPeopleTab } from "./pages/people";

// 1. Declare to TypeScript the global (window) functions we call from the HTML
declare global {
  interface Window {
    navigateTo: (...args: unknown[]) => unknown;
    switchPeopleTab: (...args: unknown[]) => unknown;
    saveHypothesis: (...args: unknown[]) => unknown;
    handleSortChange: (...args: unknown[]) => unknown;
    closeEvidenceDetail: (...args: unknown[]) => unknown;
    saveCurrentNote: (...args: unknown[]) => unknown;
    renderEvidenceList: (...args: unknown[]) => unknown;
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

  // 2. Tell TypeScript (with !) that these elements definitely exist
  document
    .getElementById("evidenceSearch")!
    .addEventListener("input", handleSearchInput);

  document
    .getElementById("filterType")!
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterPerson")!
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterLocation")!
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterStatus")!
    .addEventListener("change", renderEvidenceList);
  document
    .getElementById("filterRelevance")!
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("clearFiltersBtn")!
    .addEventListener("click", clearFilters);

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

  document
    .getElementById("hypConfidence")!
    .addEventListener("input", function (e: Event) {
      // 3. Tell TypeScript that e.target is an input element (text box)
      const target = e.target as HTMLInputElement;
      document.getElementById("hypConfidenceValue")!.textContent = target.value;
    });
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
window.saveHypothesis = saveHypothesis;
window.handleSortChange = handleSortChange;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
window.renderEvidenceList = renderEvidenceList;

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);

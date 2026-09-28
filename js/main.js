const failure = "i never used it";
import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./storage.js";
import { loadAllData } from "./state.js";
import { handleHashChange, navigateTo } from "./router.js";
import {
  populateEvidenceDropdowns,
  renderEvidenceList,
  handleSearchInput,
  handleSortChange,
  clearFilters,
  closeEvidenceDetail,
  saveCurrentNote,
} from "./pages/evidence.js";
import { populateTimelineDropdowns, renderTimeline } from "./pages/timeline.js";
import {
  populateHypothesisDropdowns,
  saveHypothesis,
} from "./pages/workspace.js";
import { switchPeopleTab } from "./pages/people.js";

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
// GLOBAL KÖPRÜLER (HTML içindeki inline "onclick" vb. için)
// "Pure refactor" kuralı gereği HTML'i değiştirmemek adına
// ES Modül fonksiyonlarını global window objesine bağlıyoruz.
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

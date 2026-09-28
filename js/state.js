import { renderDashboard } from './pages/dashboard.js';
import { renderEvidenceList, applyStoredBookmarkFlags } from './pages/evidence.js';
import { renderTimeline } from './pages/timeline.js';
import { populateAllDropdowns } from './main.js';

export const state = {
    allEvidence: [],
    filteredEvidence: [],
    selectedEvidence: null,
    bookmarks: [],
    currentPage: "dashboard",
    allPeople: [],
    allLocations: [],
    allTimeline: [],
    caseData: {},
    currentPeopleTab: "people",
    loadingStepsRemaining: 2,
    evidenceViewLoading: true,
    viewRendered: {
        dashboard: false,
        evidence: false,
        people: false,
        timeline: false,
        workspace: false
    },
    notesStore: {},
    modalCloseListenerCount: 0
};

export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export function showLoadingOverlay(msg) {
    var overlay = document.getElementById("loadingOverlay");
    var text = document.getElementById("loadingText");
    if (text) text.textContent = msg;
    if (overlay) overlay.classList.remove("hidden");
}

export function hideLoadingStep() {
    state.loadingStepsRemaining--;
    if (state.loadingStepsRemaining <= 0) {
        var overlay = document.getElementById("loadingOverlay");
        if (overlay) overlay.classList.add("hidden");
    }
}
/* We changed these code blocks to async functions with lambda expressions to provide more modern code.
export function loadCorePeopleAndLocations() {
    return fetch("data/case.json").then(function (caseRes) {
        return caseRes.json().then(function (caseJson) {
            state.caseData = caseJson;

            return fetch("data/people.json").then(function (peopleRes) {
                return peopleRes.json().then(function (peopleJson) {
                    state.allPeople = peopleJson;

                    return fetch("data/locations.json").then(function (locationsRes) {
                        return locationsRes.json().then(function (locationsJson) {
                            state.allLocations = locationsJson;

                            hideLoadingStep();
                            renderDashboard();
                            populateAllDropdowns();
                        });
                    });
                });
            });
        });
    });
}

export function loadEvidenceData() {
    fetch("data/evidence.json")
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            state.allEvidence = data;
            applyStoredBookmarkFlags();
            state.filteredEvidence = state.allEvidence;
            state.evidenceViewLoading = false;
            renderDashboard();
            populateAllDropdowns();
            if (state.currentPage === "evidence") renderEvidenceList();
        })
        .catch(function (err) {
            console.error("Failed to load evidence.json", err);
            alert("Evidence could not be loaded. Some views may be incomplete.");
        });
}

export function loadTimelineData() {
    return fetch("data/timeline.json")
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            state.allTimeline = data;
            renderDashboard();
            if (state.currentPage === "timeline") renderTimeline();
            populateAllDropdowns();
        })
        .catch(function (err) {
            console.log("timeline load error", err);
        })
        .finally(function () {
            hideLoadingStep();
        });
}
*/
export const loadCorePeopleAndLocations = async () => {
    try {
        const caseRes = await fetch("data/case.json");
        state.caseData = await caseRes.json();

        const peopleRes = await fetch("data/people.json");
        state.allPeople = await peopleRes.json();

        const locationsRes = await fetch("data/locations.json");
        state.allLocations = await locationsRes.json();

        hideLoadingStep();
        renderDashboard();
        populateAllDropdowns();
    } catch (err) {
        console.error("Core data load error", err);
    }
};

export const loadEvidenceData = async () => {
    try {
        const res = await fetch("data/evidence.json");
        const data = await res.json();

        state.allEvidence = data;
        applyStoredBookmarkFlags();
        state.filteredEvidence = state.allEvidence;
        state.evidenceViewLoading = false; // Demo 3 fix

        renderDashboard();
        populateAllDropdowns();

        if (state.currentPage === "evidence") renderEvidenceList();
    } catch (err) {
        console.error("Failed to load evidence.json", err);
        alert("Evidence could not be loaded. Some views may be incomplete.");
    }
};

export const loadTimelineData = async () => {
    try {
        const res = await fetch("data/timeline.json");
        const data = await res.json();

        state.allTimeline = data;
        renderDashboard();
        if (state.currentPage === "timeline") renderTimeline();
        populateAllDropdowns();
    } catch (err) {
        console.log("timeline load error", err);
    } finally {
        hideLoadingStep();
    }
};
export const loadAllData = async () => {
    showLoadingOverlay("Loading case file…");
    state.loadingStepsRemaining = 2;

    // DEMO 9: .then() yerine await kullandık
    await loadCorePeopleAndLocations();

    // Üstteki işlem bitince bunlar normal senkron kod gibi çalışacak
    loadEvidenceData();
    loadTimelineData();
};
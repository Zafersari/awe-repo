import { state } from './state.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderEvidenceList } from './pages/evidence.js';
import { renderPeople, renderLocations } from './pages/people.js';
import { renderTimeline } from './pages/timeline.js';
import { renderWorkspace } from './pages/workspace.js';

export function navigateTo(viewName) {
    window.location.hash = viewName;
}

export function handleHashChange() {
    var hash = window.location.hash.replace("#", "");
    var validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
    if (validViews.indexOf(hash) === -1) {
        hash = "dashboard";
    }

    // State objesini güncelliyoruz
    state.currentPage = hash;

    var sections = document.querySelectorAll(".view");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }
    document.getElementById("view-" + hash).classList.add("active");

    var navButtons = document.querySelectorAll(".nav-btn");
    for (var n = 0; n < navButtons.length; n++) {
        navButtons[n].classList.remove("active");
        if (navButtons[n].getAttribute("data-view") === hash) {
            navButtons[n].classList.add("active");
        }
    }

    // Aşağıdaki fonksiyonlar henüz import edilmediği için şimdilik tanımsız (undefined) olacaklar.
    // View dosyalarını bitirince importlarını ekleyeceğiz.
    if (hash === "dashboard" && !state.viewRendered.dashboard) {
        renderDashboard();
        state.viewRendered.dashboard = true;
    } else if (hash === "evidence" && !state.viewRendered.evidence) {
        renderEvidenceList();
        state.viewRendered.evidence = true;
    } else if (hash === "people" && !state.viewRendered.people) {
        renderPeople();
        renderLocations();
        state.viewRendered.people = true;
    } else if (hash === "timeline" && !state.viewRendered.timeline) {
        renderTimeline();
        state.viewRendered.timeline = true;
    } else if (hash === "workspace") {
        renderWorkspace();
    }
}
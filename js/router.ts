/*import { state } from "./state.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderEvidenceList } from "./pages/evidence.js";
import { renderPeople, renderLocations } from "./pages/people.js";
import { renderTimeline } from "./pages/timeline.js";
import { renderWorkspace } from "./pages/workspace.js";

export function navigateTo(viewName) {
  window.location.hash = viewName;
}

export function handleHashChange() {
  var hash = window.location.hash.replace("#", "");
  var validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }

  // Update the state object
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

  // The functions below are not imported yet, so for now they will be undefined.
  // We will add their imports once the view files are finished.
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
}*/
import { state } from "./state";
import { renderDashboard } from "./pages/dashboard";
import { renderEvidenceList } from "./pages/evidence";
import { renderPeople, renderLocations } from "./pages/people";
import { renderTimeline } from "./pages/timeline";
import { renderWorkspace } from "./pages/workspace";

// Added ': string' to the parameter, and ': void' because it returns nothing.
export function navigateTo(viewName: string): void {
  window.location.hash = viewName;
}

export function handleHashChange(): void {
  // Use modern 'let' and 'const' instead of the old 'var'
  let hash = window.location.hash.replace("#", "");
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace",
  ];

  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  // Update the state object
  state.currentPage = hash;
  // Declare that the queried elements are HTML elements <HTMLElement>
  const sections = document.querySelectorAll<HTMLElement>(".view");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  // Adding ! after getElementById tells TS "this definitely exists, it is not null"
  document.getElementById("view-" + hash)!.classList.add("active");

  const navButtons = document.querySelectorAll<HTMLElement>(".nav-btn");
  for (let n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

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

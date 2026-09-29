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
}*/
import { state } from "./state";
import { renderDashboard } from "./pages/dashboard";
import { renderEvidenceList } from "./pages/evidence";
import { renderPeople, renderLocations } from "./pages/people";
import { renderTimeline } from "./pages/timeline";
import { renderWorkspace } from "./pages/workspace";

// Parametreye ': string' tipini ekledik ve geriye bir şey döndürmediği için ': void' yazdık.
export function navigateTo(viewName: string): void {
  window.location.hash = viewName;
}

export function handleHashChange(): void {
  // Eski 'var' yerine modern 'let' ve 'const' kullanıyoruz
  let hash = window.location.hash.replace("#", "");
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];

  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }

  // State objesini güncelliyoruz
  state.currentPage = hash;

  // Çektiğimiz elementlerin birer HTML elementi olduğunu belirtiyoruz <HTMLElement>
  const sections = document.querySelectorAll<HTMLElement>(".view");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  // getElementById'nin sonuna ! koyarak TS'e "bu kesin var, null değil" diyoruz
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


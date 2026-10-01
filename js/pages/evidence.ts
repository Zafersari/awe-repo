/*import { state } from '../state.js';
import {
    formatDate, getStatusBadgeClass, getRelevanceBadgeClass,
    findEvidenceById, findPersonById, findLocationById, evidenceMentionsPerson
} from '../utils.js';
import { saveBookmarksToStorage, loadNoteForEvidence, saveNoteForEvidence } from '../storage.js';

export function populateEvidenceDropdowns() {
    var typeSelect = document.getElementById("filterType");
    var personSelect = document.getElementById("filterPerson");
    var locationSelect = document.getElementById("filterLocation");
    if (!typeSelect || !personSelect || !locationSelect) return;

    var types = [];
    for (var i = 0; i < state.allEvidence.length; i++) {
        var t = state.allEvidence[i].type.toLowerCase();
        if (types.indexOf(t) === -1) types.push(t);
    }
    typeSelect.innerHTML = '<option value="">All types</option>';
    for (var ti = 0; ti < types.length; ti++) {
        typeSelect.innerHTML += '<option value="' + types[ti] + '">' + types[ti] + "</option>";
    }

    personSelect.innerHTML = '<option value="">All people</option>';
    for (var p = 0; p < state.allPeople.length; p++) {
        personSelect.innerHTML += '<option value="' + state.allPeople[p].id + '">' + state.allPeople[p].name + "</option>";
    }

    locationSelect.innerHTML = '<option value="">All locations</option>';
    for (var l = 0; l < state.allLocations.length; l++) {
        locationSelect.innerHTML += '<option value="' + state.allLocations[l].id + '">' + state.allLocations[l].id + " - " + state.allLocations[l].name + "</option>";
    }
}

export function getFilteredEvidence() {
    var searchBox = document.getElementById("evidenceSearch");
    var searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
    var typeVal = document.getElementById("filterType").value;
    var personVal = document.getElementById("filterPerson").value;
    var locationVal = document.getElementById("filterLocation").value;
    var statusVal = document.getElementById("filterStatus").value;
    var relevanceVal = document.getElementById("filterRelevance").value;

    var results = [];
    for (var i = 0; i < state.allEvidence.length; i++) {
        var item = state.allEvidence[i];
        var matches = true;

        if (searchTerm) {
            var haystack = (item.title + " " + item.summary + " " + item.tags.join(" ")).toLowerCase();
            if (haystack.indexOf(searchTerm) === -1) matches = false;
        }
        if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
        if (matches && personVal) {
            var person = findPersonById(personVal);
            if (!person || !evidenceMentionsPerson(item, person)) matches = false;
        }
        if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1) matches = false;
        if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal) matches = false;
        if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal) matches = false;

        if (matches) results.push(item);
    }
    var sortValue = document.getElementById("sortEvidence").value;
    if (sortValue === "title-asc") {
        results.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (sortValue === "title-desc") {
        results.sort(function (a, b) { return b.title.localeCompare(a.title); });
    } else if (sortValue === "date-asc") {
        results.sort(function (a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
    } else {
        results.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    }


    state.filteredEvidence = results;
    return results;
}

export function renderEvidenceList() {
    var container = document.getElementById("evidenceList");
    if (!container) return;

    var loadingIndicator = document.getElementById("evidenceLoadingIndicator");
    if (state.evidenceViewLoading) {
        if (loadingIndicator) loadingIndicator.classList.remove("hidden");
        container.innerHTML = "";
        return;
    }
    if (loadingIndicator) loadingIndicator.classList.add("hidden");

    var results = getFilteredEvidence();

    var html = "";
    if (results.length === 0) {
        html = "<p>No evidence matches the current filters.</p>";
    }
    for (var i = 0; i < results.length; i++) {
        html += renderEvidenceCardHTML(results[i]);
    }
    container.innerHTML = html;

    container.addEventListener("click", handleEvidenceListClick);
}

export function renderEvidenceCardHTML(ev) {
    var isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
    var html = '<div class="evidence-card" data-id="' + ev.id + '">';
    html += '<button class="bookmark-btn ' + (isBookmarked ? "active" : "") + '" data-action="bookmark" data-id="' + ev.id + '" aria-label="Toggle bookmark for ' + ev.title + '"><span class="bookmark-icon">' + (isBookmarked ? "★" : "☆") + "</span></button>";
    html += "<h3>" + ev.title + "</h3>";
    html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div>";
    html += '<div class="evidence-summary">' + ev.summary + "</div>";

    if (ev.tags.indexOf("critical") !== -1) {
        html += '<span class="badge badge-critical">Critical</span>';
    }
    html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
    html += '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
    html += "<div>";
    for (var t = 0; t < ev.tags.length; t++) {
        html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
    }
    html += "</div>";
    html += "</div>";
    return html;
}

export function handleEvidenceListClick(event) {
    var target = event.target;

    if (target.dataset && target.dataset.action === "bookmark") {
        event.stopPropagation();
        handleBookmarkClick(target.dataset.id);
        return;
    }

    var card = target.closest(".evidence-card");
    if (card) {
        openEvidenceDetail(card.getAttribute("data-id"));
    }
}

export function handleBookmarkClick(evidenceId) {
    var ev = findEvidenceById(evidenceId);
    if (!ev) return;

    if (state.bookmarks.indexOf(evidenceId) === -1) {
        state.bookmarks.push(evidenceId);
        ev.bookmarked = true;
    } else {
        state.bookmarks = state.bookmarks.filter(function (id) {
            return id !== evidenceId;
        });
        ev.bookmarked = false;
    }
    saveBookmarksToStorage();
    if (state.currentPage === "evidence") renderEvidenceList();
}

export function applyStoredBookmarkFlags() {
    for (var i = 0; i < state.allEvidence.length; i++) {
        state.allEvidence[i].bookmarked = state.bookmarks.indexOf(state.allEvidence[i].id) !== -1;
    }
}

export function handleSortChange() {
    renderEvidenceList();
}

export function clearFilters() {
    document.getElementById("evidenceSearch").value = "";
    document.getElementById("filterType").value = "";
    document.getElementById("filterPerson").value = "";
    document.getElementById("filterLocation").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterRelevance").value = "";
    renderEvidenceList();
}

export function simulateAsyncSearch(term) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(term);
        }, 300);
    });
}

export var latestSearchRequestId = 0;

export function handleSearchInput(event) {
    var term = event.target.value;
    var requestId = ++latestSearchRequestId;

    simulateAsyncSearch(term).then(function (resolvedTerm) {
        if (requestId !== latestSearchRequestId) return;
        renderEvidenceList();
    });
}

export function openEvidenceDetail(evidenceId) {
    var ev = findEvidenceById(evidenceId);
    if (!ev) return;
    state.selectedEvidence = ev;

    var section = document.getElementById("evidenceDetailSection");
    section.classList.remove("hidden");

    renderEvidenceDetail(ev);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail() {
    var section = document.getElementById("evidenceDetailSection");
    section.classList.add("hidden");
    section.innerHTML = "";
    state.selectedEvidence = null;
}

export function renderEvidenceDetail(ev) {
    var section = document.getElementById("evidenceDetailSection");

    var personNames = [];
    for (var p = 0; p < ev.personIds.length; p++) {
        var person = findPersonById(ev.personIds[p]);
        personNames.push(person ? person.name : ev.personIds[p]);
    }

    var locationNames = [];
    for (var l = 0; l < ev.locationIds.length; l++) {
        var loc = findLocationById(ev.locationIds[l]);
        locationNames.push(loc ? loc.id + " - " + loc.name : ev.locationIds[l]);
    }

    var tagsHtml = "";
    for (var t = 0; t < ev.tags.length; t++) {
        tagsHtml += '<span class="tag-chip">' + ev.tags[t] + "</span>";
    }

    var storedNote = loadNoteForEvidence(ev.id);

    var html = "";
    html += '<div class="evidence-detail-header">';
    html += "<div><h2>" + ev.title + "</h2>";
    html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div></div>";
    // Original onclick kept
    html += '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
    html += "</div>";

    if (ev.tags.indexOf("critical") !== -1) {
        html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
    }

    html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
    html += '<div class="evidence-detail-content">' + ev.content + "</div>";
    html += '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
    html += '<div class="detail-field"><strong>Related locations</strong>' + locationNames.join(", ") + "</div>";
    html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

    html += '<div class="detail-field"><strong>Review status</strong>';
    html += '<select id="detailStatusSelect">';
    html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
    html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
    html += statusOptionHTML(ev.status, "flagged", "Flagged");
    html += "</select></div>";

    html += '<div class="detail-field"><strong>Relevance</strong>';
    html += '<select id="detailRelevanceSelect">';
    html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
    html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
    html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
    html += "</select></div>";

    html += '<div class="detail-field"><strong>Investigator note</strong>';
    html += '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' + ev.id + '" placeholder="Add a private note about this evidence...">' + storedNote + "</textarea>";
    // Original onclick kept
    html += '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
    html += "</div>";

    html += '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' + storedNote + "</div></div>";

    section.innerHTML = html;

    document.getElementById("detailStatusSelect").addEventListener("change", function (e) {
        ev.status = e.target.value;
        renderEvidenceDetail(ev);
        if (state.viewRendered.evidence) renderEvidenceList();
    });
    document.getElementById("detailRelevanceSelect").addEventListener("change", function (e) {
        ev.relevance = e.target.value;
        renderEvidenceDetail(ev);
        if (state.viewRendered.evidence) renderEvidenceList();
    });
}

export function statusOptionHTML(current, value, label) {
    var currentLower = (current || "").toLowerCase();
    var selected = currentLower === value ? " selected" : "";
    return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

export function saveCurrentNote() {
    var textarea = document.getElementById("evidenceNoteInput");
    if (!textarea) return;
    var evidenceId = textarea.getAttribute("data-evidence-id");
    var text = textarea.value;
    saveNoteForEvidence(evidenceId, text);
    var preview = document.getElementById("notePreview");
    if (preview) preview.innerHTML = text;
}*/
/*
import { state } from "../state.js";
import {
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
} from "../utils.js";
import {
  saveBookmarksToStorage,
  loadNoteForEvidence,
  saveNoteForEvidence,
} from "../storage.js";

export const populateEvidenceDropdowns = () => {
  const typeSelect = document.getElementById("filterType");
  const personSelect = document.getElementById("filterPerson");
  const locationSelect = document.getElementById("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const t = state.allEvidence[i].type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }

  typeSelect.innerHTML = '<option value="">All types</option>';
  for (let ti = 0; ti < types.length; ti++) {
    typeSelect.innerHTML +=
      '<option value="' + types[ti] + '">' + types[ti] + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    personSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (let l = 0; l < state.allLocations.length; l++) {
    locationSelect.innerHTML +=
      '<option value="' +
      state.allLocations[l].id +
      '">' +
      state.allLocations[l].id +
      " - " +
      state.allLocations[l].name +
      "</option>";
  }
};

export const getFilteredEvidence = () => {
  const searchBox = document.getElementById("evidenceSearch");
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = document.getElementById("filterType").value;
  const personVal = document.getElementById("filterPerson").value;
  const locationVal = document.getElementById("filterLocation").value;
  const statusVal = document.getElementById("filterStatus").value;
  const relevanceVal = document.getElementById("filterRelevance").value;

  const results = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    let matches = true;

    if (searchTerm) {
      const haystack = (
        item.title +
        " " +
        item.summary +
        " " +
        item.tags.join(" ")
      ).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal)
      matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1)
      matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal)
      matches = false;
    if (
      matches &&
      relevanceVal &&
      (item.relevance || "").toLowerCase() !== relevanceVal
    )
      matches = false;

    if (matches) results.push(item);
  }

  const sortValue = document.getElementById("sortEvidence").value;
  if (sortValue === "title-asc") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-desc") {
    results.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "date-asc") {
    results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else {
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  state.filteredEvidence = results;
  return results;
};

export const renderEvidenceList = () => {
  const container = document.getElementById("evidenceList");
  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (let i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html;

  container.addEventListener("click", handleEvidenceListClick);
};

export const renderEvidenceCardHTML = (ev) => {
  const isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html +=
    '<span class="badge ' +
    getStatusBadgeClass(ev.status) +
    '">' +
    ev.status +
    "</span>";
  html +=
    '<span class="badge ' +
    getRelevanceBadgeClass(ev.relevance) +
    '">' +
    ev.relevance +
    "</span>";
  html += "<div>";
  for (let t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
};

export const handleEvidenceListClick = (event) => {
  const target = event.target;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id);
    return;
  }

  const card = target.closest(".evidence-card");
  if (card) {
    openEvidenceDetail(card.getAttribute("data-id"));
  }
};

export const handleBookmarkClick = (evidenceId) => {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (state.bookmarks.indexOf(evidenceId) === -1) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((id) => id !== evidenceId);
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (state.currentPage === "evidence") renderEvidenceList();
};

export const applyStoredBookmarkFlags = () => {
  for (let i = 0; i < state.allEvidence.length; i++) {
    state.allEvidence[i].bookmarked =
      state.bookmarks.indexOf(state.allEvidence[i].id) !== -1;
  }
};

export const handleSortChange = () => {
  renderEvidenceList();
};

export const clearFilters = () => {
  document.getElementById("evidenceSearch").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterPerson").value = "";
  document.getElementById("filterLocation").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterRelevance").value = "";
  renderEvidenceList();
};

export const simulateAsyncSearch = (term) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(term), 300);
  });
};

export let latestSearchRequestId = 0;

export const handleSearchInput = async (event) => {
  const term = event.target.value;
  const requestId = ++latestSearchRequestId;

  await simulateAsyncSearch(term);

  if (requestId !== latestSearchRequestId) return;
  renderEvidenceList();
};

export const openEvidenceDetail = (evidenceId) => {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  const section = document.getElementById("evidenceDetailSection");
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const closeEvidenceDetail = () => {
  const section = document.getElementById("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
};

export const renderEvidenceDetail = (ev) => {
  const section = document.getElementById("evidenceDetailSection");

  const personNames = [];
  for (let p = 0; p < ev.personIds.length; p++) {
    const person = findPersonById(ev.personIds[p]);
    personNames.push(person ? person.name : ev.personIds[p]);
  }

  const locationNames = [];
  for (let l = 0; l < ev.locationIds.length; l++) {
    const loc = findLocationById(ev.locationIds[l]);
    locationNames.push(loc ? loc.id + " - " + loc.name : ev.locationIds[l]);
  }

  let tagsHtml = "";
  for (let t = 0; t < ev.tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";
  html +=
    '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html +=
      '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html +=
    '<div class="detail-field"><strong>Summary</strong>' +
    ev.summary +
    "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html +=
    '<div class="detail-field"><strong>Related people</strong>' +
    personNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";
  html +=
    '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  document
    .getElementById("detailStatusSelect")
    .addEventListener("change", (e) => {
      ev.status = e.target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });

  document
    .getElementById("detailRelevanceSelect")
    .addEventListener("change", (e) => {
      ev.relevance = e.target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
};

export const statusOptionHTML = (current, value, label) => {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
};

export const saveCurrentNote = () => {
  const textarea = document.getElementById("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
};
*/
import { state } from "../state";
import { Evidence } from "../models";
import {
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
} from "../utils.js";
import {
  saveBookmarksToStorage,
  loadNoteForEvidence,
  saveNoteForEvidence,
} from "../storage.js";

export const populateEvidenceDropdowns = (): void => {
  const typeSelect = document.getElementById("filterType") as HTMLSelectElement | null;
  const personSelect = document.getElementById("filterPerson") as HTMLSelectElement | null;
  const locationSelect = document.getElementById("filterLocation") as HTMLSelectElement | null;

  if (!typeSelect || !personSelect || !locationSelect) return;

  const types: string[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const t = (state.allEvidence[i].type || "").toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }

  typeSelect.innerHTML = '<option value="">All types</option>';
  for (let ti = 0; ti < types.length; ti++) {
    typeSelect.innerHTML +=
      '<option value="' + types[ti] + '">' + types[ti] + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    personSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (let l = 0; l < state.allLocations.length; l++) {
    locationSelect.innerHTML +=
      '<option value="' +
      state.allLocations[l].id +
      '">' +
      state.allLocations[l].id +
      " - " +
      state.allLocations[l].name +
      "</option>";
  }
};

export const getFilteredEvidence = (): Evidence[] => {
  const searchBox = document.getElementById("evidenceSearch") as HTMLInputElement | null;
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = (document.getElementById("filterType") as HTMLSelectElement)!.value;
  const personVal = (document.getElementById("filterPerson") as HTMLSelectElement)!.value;
  const locationVal = (document.getElementById("filterLocation") as HTMLSelectElement)!.value;
  const statusVal = (document.getElementById("filterStatus") as HTMLSelectElement)!.value;
  const relevanceVal = (document.getElementById("filterRelevance") as HTMLSelectElement)!.value;

  const results: Evidence[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    let matches = true;


    if (searchTerm) {
      const haystack = (
        item.title +
        " " +
        item.summary +
        " " +
        item.tags.join(" ")
      ).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal)
      matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1)
      matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal)
      matches = false;
    if (
      matches &&
      relevanceVal &&
      (item.relevance || "").toLowerCase() !== relevanceVal
    )
      matches = false;

    if (matches) results.push(item);
  }

  const sortValue = (document.getElementById("sortEvidence") as HTMLSelectElement)!.value;
  if (sortValue === "title-asc") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-desc") {
    results.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "date-asc") {
    results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } else {
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  state.filteredEvidence = results;
  return results;
};

export const renderEvidenceList = (): void => {
  const container = document.getElementById("evidenceList");
  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (let i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html;

  container.addEventListener("click", handleEvidenceListClick as EventListener);
};

export const renderEvidenceCardHTML = (ev: Evidence): string => {
  const isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  const tags = ev.tags;

  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html +=
    '<span class="badge ' +
    getStatusBadgeClass(ev.status) +
    '">' +
    (ev.status || "unknown") +
    "</span>";
  html +=
    '<span class="badge ' +
    getRelevanceBadgeClass(ev.relevance) +
    '">' +
    (ev.relevance || "unknown") +
    "</span>";
  html += "<div>";
  for (let t = 0; t < tags.length; t++) {
    html += '<span class="tag-chip">' + tags[t] + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
};

export const handleEvidenceListClick = (event: Event): void => {
  const target = event.target as HTMLElement;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id as string);
    return;
  }

  const card = target.closest(".evidence-card");
  if (card) {
    openEvidenceDetail(card.getAttribute("data-id") as string);
  }
};

export const handleBookmarkClick = (evidenceId: string): void => {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (state.bookmarks.indexOf(evidenceId) === -1) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((id) => id !== evidenceId);
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (state.currentPage === "evidence") renderEvidenceList();
};

export const applyStoredBookmarkFlags = (): void => {
  for (let i = 0; i < state.allEvidence.length; i++) {
    state.allEvidence[i].bookmarked =
      state.bookmarks.indexOf(state.allEvidence[i].id) !== -1;
  }
};

export const handleSortChange = (): void => {
  renderEvidenceList();
};

export const clearFilters = (): void => {
  (document.getElementById("evidenceSearch") as HTMLInputElement)!.value = "";
  (document.getElementById("filterType") as HTMLSelectElement)!.value = "";
  (document.getElementById("filterPerson") as HTMLSelectElement)!.value = "";
  (document.getElementById("filterLocation") as HTMLSelectElement)!.value = "";
  (document.getElementById("filterStatus") as HTMLSelectElement)!.value = "";
  (document.getElementById("filterRelevance") as HTMLSelectElement)!.value = "";
  renderEvidenceList();
};

export const simulateAsyncSearch = (term: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(term), 300);
  });
};

export let latestSearchRequestId = 0;

export const handleSearchInput = async (event: Event): Promise<void> => {
  const term = (event.target as HTMLInputElement).value;
  const requestId = ++latestSearchRequestId;

  await simulateAsyncSearch(term);

  if (requestId !== latestSearchRequestId) return;
  renderEvidenceList();
};

export const openEvidenceDetail = (evidenceId: string): void => {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  const section = document.getElementById("evidenceDetailSection")!;
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const closeEvidenceDetail = (): void => {
  const section = document.getElementById("evidenceDetailSection")!;
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
};

export const renderEvidenceDetail = (ev: Evidence): void => {
  const section = document.getElementById("evidenceDetailSection")!;

  const personNames: string[] = [];
  const evPersonIds = ev.personIds;
  for (let p = 0; p < evPersonIds.length; p++) {
    const person = findPersonById(evPersonIds[p]);
    personNames.push(person ? person.name : evPersonIds[p]);
  }

  const locationNames: string[] = [];
  const locationIds = ev.locationIds;
  for (let l = 0; l < locationIds.length; l++) {
    const loc = findLocationById(locationIds[l]);
    locationNames.push(loc ? loc.id + " - " + loc.name : locationIds[l]);
  }

  let tagsHtml = "";
  const tags = ev.tags;
  for (let t = 0; t < tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + tags[t] + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id) || "";

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";
  html +=
    '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (tags.indexOf("critical") !== -1) {
    html +=
      '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html +=
    '<div class="detail-field"><strong>Summary</strong>' +
    ev.summary +
    "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html +=
    '<div class="detail-field"><strong>Related people</strong>' +
    personNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";
  html +=
    '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  document
    .getElementById("detailStatusSelect")!
    .addEventListener("change", (e: Event) => {
      ev.status = (e.target as HTMLSelectElement).value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });

  document
    .getElementById("detailRelevanceSelect")!
    .addEventListener("change", (e: Event) => {
      ev.relevance = (e.target as HTMLSelectElement).value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
};

export const statusOptionHTML = (current: string | undefined, value: string, label: string): string => {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
};

export const saveCurrentNote = (): void => {
  const textarea = document.getElementById("evidenceNoteInput") as HTMLTextAreaElement | null;
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  if (!evidenceId) return;

  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
};

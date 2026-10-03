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
  const typeSelect = document.getElementById(
    "filterType",
  ) as HTMLSelectElement | null;
  const personSelect = document.getElementById(
    "filterPerson",
  ) as HTMLSelectElement | null;
  const locationSelect = document.getElementById(
    "filterLocation",
  ) as HTMLSelectElement | null;

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
  const searchBox = document.getElementById(
    "evidenceSearch",
  ) as HTMLInputElement | null;
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const typeVal = (document.getElementById("filterType") as HTMLSelectElement)!
    .value;
  const personVal = (document.getElementById(
    "filterPerson",
  ) as HTMLSelectElement)!.value;
  const locationVal = (document.getElementById(
    "filterLocation",
  ) as HTMLSelectElement)!.value;
  const statusVal = (document.getElementById(
    "filterStatus",
  ) as HTMLSelectElement)!.value;
  const relevanceVal = (document.getElementById(
    "filterRelevance",
  ) as HTMLSelectElement)!.value;

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

  const sortValue = (document.getElementById(
    "sortEvidence",
  ) as HTMLSelectElement)!.value;
  if (sortValue === "title-asc") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-desc") {
    results.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "date-asc") {
    results.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } else {
    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
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

export const statusOptionHTML = (
  current: string | undefined,
  value: string,
  label: string,
): string => {
  const currentLower = (current || "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
};

export const saveCurrentNote = (): void => {
  const textarea = document.getElementById(
    "evidenceNoteInput",
  ) as HTMLTextAreaElement | null;
  if (!textarea) return;
  const evidenceId = textarea.getAttribute("data-evidence-id");
  if (!evidenceId) return;

  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
};

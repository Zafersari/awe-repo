/*import { state, STORAGE_KEY_HYPOTHESIS } from "../state";
import { navigateTo } from "../router";
import { openEvidenceDetail } from "./evidence";

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

export function renderBookmarksList() {
  var container = document.getElementById("bookmarksList");
  if (!container) return;

  var bookmarkedItems = state.allEvidence.filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < bookmarkedItems.length; i++) {
    var ev = bookmarkedItems[i];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  var openButtons = container.querySelectorAll("[data-open-evidence]");
  for (var b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e) {
      navigateTo("evidence");
      var id = e.target.getAttribute("data-open-evidence");
      setTimeout(function () {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

export function renderNotesList() {
  var container = document.getElementById("notesList");
  if (!container) return;

  var noteEntries = [];
  for (var i = 0; i < state.allEvidence.length; i++) {
    var note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  var html = "";
  for (var n = 0; n < noteEntries.length; n++) {
    var entry = noteEntries[n];
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html +=
      '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns() {
  var suspectSelect = document.getElementById("hypSuspect");
  var evidenceSelect = document.getElementById("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  var currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (var p = 0; p < state.allPeople.length; p++) {
    suspectSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (var i = 0; i < state.allEvidence.length; i++) {
    evidenceSelect.innerHTML +=
      '<option value="' +
      state.allEvidence[i].id +
      '">' +
      state.allEvidence[i].id +
      " - " +
      state.allEvidence[i].title +
      "</option>";
  }
}

export function saveHypothesis() {
  var draft = {
    suspectId: document.getElementById("hypSuspect").value,
    nature: document.getElementById("hypNature").value,
    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence")),
    confidence: document.getElementById("hypConfidence").value,
    explanation: document.getElementById("hypExplanation").value,
    alternative: document.getElementById("hypAlternative").value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  var msg = document.getElementById("hypothesisSavedMsg");
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

export function getSelectedOptions(selectEl) {
  var result = [];
  for (var i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

export function loadHypothesisFromStorage() {
  var raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  var draft = JSON.parse(raw);

  document.getElementById("hypSuspect").value = draft.suspectId || "";
  document.getElementById("hypNature").value = draft.nature || "";
  document.getElementById("hypConfidence").value = draft.confidence || 50;
  document.getElementById("hypConfidenceValue").textContent =
    draft.confidence || 50;
  document.getElementById("hypExplanation").value = draft.explanation || "";
  document.getElementById("hypAlternative").value = draft.alternative || "";

  var evidenceSelect = document.getElementById("hypEvidence");
  var savedIds = draft.evidenceIds || [];
  for (var i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected =
      savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
*/
import { state, STORAGE_KEY_HYPOTHESIS } from "../state";
import { navigateTo } from "../router";
import { openEvidenceDetail } from "./evidence";

export function renderWorkspace(): void {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

export function renderBookmarksList(): void {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter(function (ev) {
    return (ev as any).bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll<HTMLElement>("[data-open-evidence]");
  for (let b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e: Event) {
      navigateTo("evidence");
      const target = e.target as HTMLElement;
      const id = target.getAttribute("data-open-evidence");
      setTimeout(function () {
        if (id) openEvidenceDetail(id);
      }, 0);
    });
  }
}

// Defined a dedicated type for note objects
interface NoteEntry {
  index: number;
  evidenceId: string;
  title: string;
  text: string;
}

export function renderNotesList(): void {
  const container = document.getElementById("notesList");
  if (!container) return;

  const noteEntries: NoteEntry[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title || "Unknown Title",
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html +=
      '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns(): void {
  const suspectSelect = document.getElementById("hypSuspect") as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement | null;
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    suspectSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (let i = 0; i < state.allEvidence.length; i++) {
    evidenceSelect.innerHTML +=
      '<option value="' +
      state.allEvidence[i].id +
      '">' +
      state.allEvidence[i].id +
      " - " +
      state.allEvidence[i].title +
      "</option>";
  }
}

export function saveHypothesis(): void {
  const draft = {
    suspectId: (document.getElementById("hypSuspect") as HTMLSelectElement)!.value,
    nature: (document.getElementById("hypNature") as HTMLSelectElement)!.value,
    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence") as HTMLSelectElement),
    confidence: (document.getElementById("hypConfidence") as HTMLInputElement)!.value,
    explanation: (document.getElementById("hypExplanation") as HTMLTextAreaElement)!.value,
    alternative: (document.getElementById("hypAlternative") as HTMLTextAreaElement)!.value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg")!;
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

// Guarantee that the parameter type is 'HTMLSelectElement'
export function getSelectedOptions(selectEl: HTMLSelectElement): string[] {
  const result: string[] = [];
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

export function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  const draft = JSON.parse(raw);

  (document.getElementById("hypSuspect") as HTMLSelectElement)!.value = draft.suspectId || "";
  (document.getElementById("hypNature") as HTMLSelectElement)!.value = draft.nature || "";
  (document.getElementById("hypConfidence") as HTMLInputElement)!.value = draft.confidence || "50";
  document.getElementById("hypConfidenceValue")!.textContent = draft.confidence || "50";
  (document.getElementById("hypExplanation") as HTMLTextAreaElement)!.value = draft.explanation || "";
  (document.getElementById("hypAlternative") as HTMLTextAreaElement)!.value = draft.alternative || "";

  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement;
  const savedIds: string[] = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected =
      savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
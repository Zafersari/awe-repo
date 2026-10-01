/*import { state, STORAGE_KEY_BOOKMARKS, STORAGE_KEY_NOTES } from "./state.js";

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

export function loadBookmarksFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    var parsed = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

export function saveNoteForEvidence(evidenceId, text) {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId) {
  return state.notesStore[evidenceId] || "";
}

export function loadNotesFromStorage() {
  var raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }
  state.notesStore = JSON.parse(raw);
}

export function loadNoteAsync(evidenceId) {
  return new Promise(function (resolve) {
    resolve(state.notesStore[evidenceId] || "");
  });
}
*/
import { state as rawState, STORAGE_KEY_BOOKMARKS, STORAGE_KEY_NOTES } from "./state";

// Since state.js is not migrated to TypeScript yet, empty arrays are inferred as never[]. 
// To fix this, we apply a temporary type (shape) to the imported state object:
interface StorageState {
  bookmarks: string[];
  notesStore: Record<string, string>;
}
const state = rawState as StorageState;

export function saveBookmarksToStorage(): void {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

export function loadBookmarksFromStorage(): void {
  try {
    const raw: string | null = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

export function saveNoteForEvidence(evidenceId: string, text: string): void {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId: string): string {
  return state.notesStore[evidenceId] || "";
}

export function loadNotesFromStorage(): void {
  const raw: string | null = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }
  state.notesStore = JSON.parse(raw) as Record<string, string>;
}

export function loadNoteAsync(evidenceId: string): Promise<string> {
  return new Promise((resolve) => {
    resolve(state.notesStore[evidenceId] || "");
  });
}
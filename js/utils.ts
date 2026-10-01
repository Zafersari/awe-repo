/*import { state } from "./state.js";

export function formatDate(ts) {
  if (!ts) return "Unknown date";
  var d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export function getStatusBadgeClass(status) {
  var s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance) {
  var r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
}

export function certaintyBadgeClass(certainty) {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
}

export function findEvidenceById(id) {
  for (var i = 0; i < state.allEvidence.length; i++) {
    if (state.allEvidence[i].id === id) return state.allEvidence[i];
  }
  return null;
}

export function findPersonById(id) {
  for (var i = 0; i < state.allPeople.length; i++) {
    if (state.allPeople[i].id === id) return state.allPeople[i];
  }
  return null;
}

export function findLocationById(id) {
  for (var i = 0; i < state.allLocations.length; i++) {
    if (state.allLocations[i].id === id) return state.allLocations[i];
  }
  return null;
}

export function evidenceMentionsPerson(ev, person) {
  if (!ev.personIds) return false;
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
}*/
/*
import { state as rawState } from "./state";
import { Evidence, Person, Location } from "./models";

// Apply a type shape to state.js so it doesn't raise the never[] (id not found) error:
interface UtilsState {
  allEvidence: Evidence[];
  allPeople: Person[];
  allLocations: Location[];
}
const state = rawState as UtilsState;

export function formatDate(ts: string | number | undefined | null): string {
  if (!ts) return "Unknown date";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export function getStatusBadgeClass(status: string | undefined | null): string {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance: string | undefined | null): string {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
}

export function certaintyBadgeClass(certainty: string | undefined | null): string {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
}

export function findEvidenceById(id: string): Evidence | null {
  for (let i = 0; i < state.allEvidence.length; i++) {
    if (state.allEvidence[i].id === id) return state.allEvidence[i] as Evidence;
  }
  return null;
}

export function findPersonById(id: string): Person | null {
  for (let i = 0; i < state.allPeople.length; i++) {
    if (state.allPeople[i].id === id) return state.allPeople[i] as Person;
  }
  return null;
}

export function findLocationById(id: string): Location | null {
  for (let i = 0; i < state.allLocations.length; i++) {
    if (state.allLocations[i].id === id) return state.allLocations[i] as Location;
  }
  return null;
}

export function evidenceMentionsPerson(ev: Evidence, person: Person): boolean {
  if (!ev.personIds) return false;
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
}*/

import { state } from "./state";
import { Evidence, Person, Location } from "./models";

export function formatDate(dateString: string): string {
  if (!dateString) return "Unknown date";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  // Format: YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStatusBadgeClass(status?: string): string {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "reviewed";
  if (s === "flagged") return "flagged";
  return "unreviewed";
}

export function getRelevanceBadgeClass(relevance?: string): string {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "reviewed";
  if (r === "irrelevant") return "unreviewed";
  return "unknown";
}

export function findEvidenceById(id: string): Evidence | undefined {
  return state.allEvidence.find((e) => e.id === id);
}

export function findPersonById(id: string): Person | undefined {
  return state.allPeople.find((p) => p.id === id);
}

export function findLocationById(id: string): Location | undefined {
  return state.allLocations.find((l) => l.id === id);
}

export function evidenceMentionsPerson(ev: Evidence, person: Person): boolean {
  // Thanks to TypeScript we know ev.personIds is only string[]
  const pIds = ev.personIds || [];
  return pIds.indexOf(person.id) !== -1;
}
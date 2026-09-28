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
import { state as rawState } from "./state.js";

// Demo 6 için temel Domain verilerinin tiplerini önden hazırlıyoruz
export interface Evidence {
  id: string;
  personIds?: string[];
  [key: string]: unknown;
}

export interface Person {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Location {
  id: string;
  [key: string]: unknown;
}

// state.js için kalıp giydiriyoruz ki never[] (id bulunamadı) hatası vermesin:
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
}


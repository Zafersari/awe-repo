import { state } from "./state";
import { Evidence, Person, Location } from "./models";

export function formatDate(dateString: string): string {
  if (!dateString) return "Unknown date";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  // Same output as the JavaScript version: locale date + time (e.g. "Oct 15, 2026 14:32")
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

export function getStatusBadgeClass(status?: string): string {
  const s = (status || "").toLowerCase();
  // Must return the full CSS class name (styles.css defines .badge-reviewed etc.)
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance?: string): string {
  const r = (relevance || "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
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
  // Match by ID or by name, like the JavaScript version (E04 uses the name "Nova Byte")
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
}

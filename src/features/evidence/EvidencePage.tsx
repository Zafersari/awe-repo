import { useState } from "react";
import type { Evidence } from "../../../js/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";

function EvidenceCard({
  evidence,
  isBookmarked,
  onOpen,
  onToggleBookmark,
}: {
  evidence: Evidence;
  isBookmarked: boolean;
  onOpen: () => void;
  onToggleBookmark: () => void;
}) {
  const status = evidence.status || "unknown";
  const relevance = evidence.relevance || "unknown";
  const statusClass =
    status.toLowerCase() === "reviewed" || status.toLowerCase() === "flagged"
      ? `badge-${status.toLowerCase()}`
      : "badge-unreviewed";
  const relevanceClass =
    relevance.toLowerCase() === "relevant"
      ? "badge-relevant"
      : "badge-unreviewed";

  return (
    <article className="evidence-card" onClick={onOpen}>
      <button
        type="button"
        className={`bookmark-btn${isBookmarked ? " active" : ""}`}
        aria-label={`${isBookmarked ? "Bookmarked" : "Bookmark"} ${evidence.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleBookmark();
        }}
      >
        <span className="bookmark-icon">{isBookmarked ? "★" : "☆"}</span>
      </button>
      <h3>{evidence.title}</h3>
      <div className="evidence-meta">
        {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
      </div>
      <div className="evidence-summary">{evidence.summary}</div>
      {evidence.tags.includes("critical") && (
        <span className="badge badge-critical">Critical</span>
      )}
      <span className={`badge ${statusClass}`}>{status}</span>
      <span className={`badge ${relevanceClass}`}>{relevance}</span>
      <div>
        {evidence.tags.map((tag) => (
          <span className="tag-chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

interface EvidencePageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function EvidencePage({ data, error }: EvidencePageProps) {
  const [bookmarks, setBookmarks] = useState<string[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string> | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    null,
  );

  if (error) {
    return (
      <section className="view active">
        <h2>Evidence Catalogue</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="view active">
        <h2>Evidence Catalogue</h2>
        <p>Loading evidence...</p>
      </section>
    );
  }

  const eventTypes = [
    ...new Set(data.evidence.map((evidence) => evidence.type.toLowerCase())),
  ];
  const orderedEvidence = [...data.evidence].sort(
    (first, second) =>
      new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime(),
  );
  const currentBookmarks = bookmarks ?? data.bookmarks;
  const currentNotes = notes ?? data.notes;
  const selectedEvidence = data.evidence.find(
    (evidence) => evidence.id === selectedEvidenceId,
  );

  function toggleBookmark(evidenceId: string) {
    const nextBookmarks = currentBookmarks.includes(evidenceId)
      ? currentBookmarks.filter((id) => id !== evidenceId)
      : [...currentBookmarks, evidenceId];
    setBookmarks(nextBookmarks);
    window.localStorage.setItem(
      "remotion_bookmarks",
      JSON.stringify(nextBookmarks),
    );
  }

  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence) return;

    const formData = new FormData(event.currentTarget);
    const nextNotes = {
      ...currentNotes,
      [selectedEvidence.id]: String(formData.get("note") ?? ""),
    };
    setNotes(nextNotes);
    window.localStorage.setItem("remotion_notes", JSON.stringify(nextNotes));
  }

  return (
    <section className="view active" aria-labelledby="evidence-title">
      <h2 id="evidence-title">Evidence Catalogue</h2>
      <div className="toolbar" id="evidenceToolbar">
        <div className="toolbar-row">
          <label htmlFor="evidenceSearch" className="visually-hidden">
            Search evidence
          </label>
          <input
            type="text"
            id="evidenceSearch"
            placeholder="Search evidence by title, summary, or tag..."
            autoComplete="off"
          />
          <label htmlFor="filterType" className="visually-hidden">
            Filter by type
          </label>
          <select id="filterType" defaultValue="">
            <option value="">All types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <label htmlFor="filterPerson" className="visually-hidden">
            Filter by person
          </label>
          <select id="filterPerson" defaultValue="">
            <option value="">All people</option>
            {data.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <label htmlFor="filterLocation" className="visually-hidden">
            Filter by location
          </label>
          <select id="filterLocation" defaultValue="">
            <option value="">All locations</option>
            {data.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.id} - {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-row">
          <label htmlFor="filterStatus" className="visually-hidden">
            Filter by status
          </label>
          <select id="filterStatus" defaultValue="">
            <option value="">All statuses</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged</option>
          </select>
          <label htmlFor="filterRelevance" className="visually-hidden">
            Filter by relevance
          </label>
          <select id="filterRelevance" defaultValue="">
            <option value="">All relevance</option>
            <option value="unknown">Unknown</option>
            <option value="relevant">Relevant</option>
            <option value="irrelevant">Irrelevant</option>
          </select>
          <label htmlFor="sortEvidence" className="visually-hidden">
            Sort evidence
          </label>
          <select id="sortEvidence" defaultValue="date-desc">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
          <button type="button" id="clearFiltersBtn" className="btn btn-secondary">
            Clear filters
          </button>
        </div>
      </div>
      {orderedEvidence.length === 0 ? (
        <p>No evidence matches the current filters.</p>
      ) : (
        <div className="evidence-grid">
          {orderedEvidence.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              isBookmarked={currentBookmarks.includes(evidence.id)}
              onOpen={() => setSelectedEvidenceId(evidence.id)}
              onToggleBookmark={() => toggleBookmark(evidence.id)}
            />
          ))}
        </div>
      )}
      {selectedEvidence && (
        <section className="evidence-detail" aria-labelledby="evidence-detail-title">
          <div className="evidence-detail-header">
            <div>
              <h2 id="evidence-detail-title">{selectedEvidence.title}</h2>
              <div className="evidence-meta">
                {selectedEvidence.id} &middot; {selectedEvidence.type} &middot;{" "}
                {formatDate(selectedEvidence.timestamp)}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setSelectedEvidenceId(null)}
            >
              Close
            </button>
          </div>
          {selectedEvidence.tags.includes("critical") && (
            <div className="warning-banner">
              This item is tagged as critical evidence.
            </div>
          )}
          <div className="detail-field">
            <strong>Summary</strong> {selectedEvidence.summary}
          </div>
          <div className="evidence-detail-content">{selectedEvidence.content}</div>
          <div className="detail-field">
            <strong>Related people</strong>{" "}
            {selectedEvidence.personIds
              .map(
                (personId) =>
                  data.people.find(
                    (person) =>
                      person.id === personId || person.name === personId,
                  )?.name ?? personId,
              )
              .join(", ") || "None"}
          </div>
          <div className="detail-field">
            <strong>Related locations</strong>{" "}
            {selectedEvidence.locationIds
              .map((locationId) => {
                const location = data.locations.find(
                  (candidate) => candidate.id === locationId,
                );
                return location
                  ? `${location.id} - ${location.name}`
                  : locationId;
              })
              .join(", ") || "None"}
          </div>
          <div className="detail-field">
            <strong>Tags</strong>{" "}
            {selectedEvidence.tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="detail-field">
            <strong>Investigator note</strong>
            <form onSubmit={saveNote}>
              <textarea
                name="note"
                className="note-textarea"
                rows={3}
                placeholder="Add a private note about this evidence..."
                defaultValue={currentNotes[selectedEvidence.id] ?? ""}
              />
              <button
                type="submit"
                className="btn btn-primary btn-small"
                style={{ marginTop: 6 }}
              >
                Save note
              </button>
            </form>
          </div>
          <div className="detail-field">
            <strong>Note preview</strong>
            <div>{currentNotes[selectedEvidence.id] ?? ""}</div>
          </div>
        </section>
      )}
    </section>
  );
}
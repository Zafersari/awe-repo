import { useReducer, useState } from "react";
import type { Evidence } from "../../shared/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";
import { useBookmarks } from "../../app/BookmarkContext";

interface EvidenceFilters {
  search: string;
  type: string;
  person: string;
  location: string;
  status: string;
  relevance: string;
  sort: string;
}

type EvidenceFilterAction =
  | {
      type: "set-filter";
      field: Exclude<keyof EvidenceFilters, "sort">;
      value: string;
    }
  | { type: "set-sort"; value: string }
  | { type: "clear-filters" };

const initialFilters: EvidenceFilters = {
  search: "",
  type: "",
  person: "",
  location: "",
  status: "",
  relevance: "",
  sort: "date-desc",
};

function evidenceFilterReducer(
  filters: EvidenceFilters,
  action: EvidenceFilterAction,
): EvidenceFilters {
  switch (action.type) {
    case "set-filter":
      return { ...filters, [action.field]: action.value };
    case "set-sort":
      return { ...filters, sort: action.value };
    case "clear-filters":
      return initialFilters;
  }
}

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
  notes: Record<string, string>;
  onSaveNote: (evidenceId: string, text: string) => void;
}

export default function EvidencePage({
  data,
  error,
  notes,
  onSaveNote,
}: EvidencePageProps) {
  const [filters, dispatch] = useReducer(evidenceFilterReducer, initialFilters);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    null,
  );
  const { bookmarks, toggleBookmark } = useBookmarks();

  if (error) {
    return (
      <section className="view active">
        <h2>Evidence Catalogue</h2>
        <div className="warning-banner" role="alert">
          Evidence could not be loaded. {error}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="view active">
        <h2>Evidence Catalogue</h2>
        <div className="evidence-loading" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p>Loading evidence...</p>
        </div>
      </section>
    );
  }

  if (data.evidence.length === 0) {
    return (
      <section className="view active">
        <h2>Evidence Catalogue</h2>
        <div className="evidence-empty-state" role="status">
          <h3>No evidence available</h3>
          <p>The case data loaded successfully, but contains no evidence items.</p>
        </div>
      </section>
    );
  }

  const eventTypes = [
    ...new Set(data.evidence.map((evidence) => evidence.type.toLowerCase())),
  ];
  const normalizedSearch = filters.search.trim().toLowerCase();
  const filteredEvidence = data.evidence.filter((evidence) => {
    const searchText = `${evidence.title} ${evidence.summary} ${evidence.tags.join(" ")}`.toLowerCase();
    const person = data.people.find(
      (candidate) => candidate.id === filters.person,
    );
    return (
      (!normalizedSearch || searchText.includes(normalizedSearch)) &&
      (!filters.type || evidence.type.toLowerCase() === filters.type) &&
      (!filters.person ||
        evidence.personIds.includes(filters.person) ||
        evidence.personIds.includes(person?.name ?? "")) &&
      (!filters.location || evidence.locationIds.includes(filters.location)) &&
      (!filters.status || evidence.status.toLowerCase() === filters.status) &&
      (!filters.relevance ||
        evidence.relevance.toLowerCase() === filters.relevance)
    );
  });
  const orderedEvidence = [...filteredEvidence].sort((first, second) => {
    if (filters.sort === "title-asc") {
      return first.title.localeCompare(second.title);
    }
    if (filters.sort === "title-desc") {
      return second.title.localeCompare(first.title);
    }
    const dateOrder =
      new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime();
    return filters.sort === "date-asc" ? dateOrder : -dateOrder;
  });
  const selectedEvidence = data.evidence.find(
    (evidence) => evidence.id === selectedEvidenceId,
  );

  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvidence) return;

    const formData = new FormData(event.currentTarget);
    onSaveNote(selectedEvidence.id, String(formData.get("note") ?? ""));
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
            value={filters.search}
            onChange={(event) =>
              dispatch({
                type: "set-filter",
                field: "search",
                value: event.target.value,
              })
            }
          />
          <label htmlFor="filterType" className="visually-hidden">
            Filter by type
          </label>
          <select
            id="filterType"
            value={filters.type}
            onChange={(event) =>
              dispatch({ type: "set-filter", field: "type", value: event.target.value })
            }
          >
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
          <select
            id="filterPerson"
            value={filters.person}
            onChange={(event) =>
              dispatch({ type: "set-filter", field: "person", value: event.target.value })
            }
          >
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
          <select
            id="filterLocation"
            value={filters.location}
            onChange={(event) =>
              dispatch({ type: "set-filter", field: "location", value: event.target.value })
            }
          >
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
          <select
            id="filterStatus"
            value={filters.status}
            onChange={(event) =>
              dispatch({ type: "set-filter", field: "status", value: event.target.value })
            }
          >
            <option value="">All statuses</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged</option>
          </select>
          <label htmlFor="filterRelevance" className="visually-hidden">
            Filter by relevance
          </label>
          <select
            id="filterRelevance"
            value={filters.relevance}
            onChange={(event) =>
              dispatch({ type: "set-filter", field: "relevance", value: event.target.value })
            }
          >
            <option value="">All relevance</option>
            <option value="unknown">Unknown</option>
            <option value="relevant">Relevant</option>
            <option value="irrelevant">Irrelevant</option>
          </select>
          <label htmlFor="sortEvidence" className="visually-hidden">
            Sort evidence
          </label>
          <select
            id="sortEvidence"
            value={filters.sort}
            onChange={(event) =>
              dispatch({ type: "set-sort", value: event.target.value })
            }
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
          <button
            type="button"
            id="clearFiltersBtn"
            className="btn btn-secondary"
            onClick={() => dispatch({ type: "clear-filters" })}
          >
            Clear filters
          </button>
        </div>
      </div>
      {orderedEvidence.length === 0 ? (
        <div className="evidence-empty-state" role="status">
          <h3>No matching evidence</h3>
          <p>No evidence matches the current filters.</p>
        </div>
      ) : (
        <div className="evidence-grid">
          {orderedEvidence.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              isBookmarked={bookmarks.includes(evidence.id)}
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
                key={selectedEvidence.id}
                defaultValue={notes[selectedEvidence.id] ?? ""}
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
            <div>{notes[selectedEvidence.id] ?? ""}</div>
          </div>
        </section>
      )}
    </section>
  );
}
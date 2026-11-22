import { useEffect, useState } from "react";
import type { Evidence } from "../../shared/models";
import type { DashboardData, HypothesisDraft } from "../../app/types";
import { useBookmarks } from "../../app/BookmarkContext";

function BookmarkList({ evidence }: { evidence: Evidence[] }) {
  if (evidence.length === 0) {
    return (
      <p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>
    );
  }

  return (
    <>
      {evidence.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{item.id}</strong> &mdash; {item.title}{" "}
          <button type="button" className="btn btn-small btn-secondary">
            Open
          </button>
        </div>
      ))}
    </>
  );
}

function NotesList({
  data,
  notes,
}: {
  data: DashboardData;
  notes: Record<string, string>;
}) {
  const entries = data.evidence.filter((item) => notes[item.id]);

  if (entries.length === 0) {
    return <p>No notes yet. Add one from an evidence item's detail view.</p>;
  }

  return (
    <>
      {entries.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{item.id}</strong> &mdash; {item.title}
          <div>{notes[item.id]}</div>
        </div>
      ))}
    </>
  );
}

interface WorkspacePageProps {
  data: DashboardData | null;
  error: string | null;
  notes: Record<string, string>;
  hypothesisDraft: HypothesisDraft | null;
  onSaveHypothesis: (draft: HypothesisDraft) => void;
}

export default function WorkspacePage({
  data,
  error,
  notes,
  hypothesisDraft,
  onSaveHypothesis,
}: WorkspacePageProps) {
  const [saved, setSaved] = useState(false);
  const [draftState, setDraftState] = useState<HypothesisDraft | null>(null);
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    if (!saved) return;
    const timeoutId = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [saved]);

  if (error) {
    return (
      <section className="view active">
        <h2>Investigator Workspace</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="view active">
        <h2>Investigator Workspace</h2>
        <p>Loading workspace...</p>
      </section>
    );
  }

  const bookmarkedEvidence = data.evidence.filter((item) =>
    bookmarks.includes(item.id),
  );
  const draft =
    draftState ??
    hypothesisDraft ?? {
      suspectId: "",
      nature: "",
      evidenceIds: [],
      confidence: "50",
      explanation: "",
      alternative: "",
    };

  function updateDraft(changes: Partial<HypothesisDraft>) {
    setDraftState((current) => ({ ...draft, ...current, ...changes }));
    setSaved(false);
  }

  function saveHypothesis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSaveHypothesis(draft);
    setSaved(true);
  }

  return (
    <section className="view active" aria-labelledby="workspace-title">
      <h2 id="workspace-title">Investigator Workspace</h2>
      <div className="workspace-grid">
        <div className="workspace-col">
          <h3>Bookmarked Evidence</h3>
          <div className="bookmarks-list">
            <BookmarkList evidence={bookmarkedEvidence} />
          </div>
        </div>
        <div className="workspace-col">
          <h3>Personal Notes</h3>
          <p className="hint-text">
            Notes are attached to whichever evidence item is currently open in
            the Evidence view.
          </p>
          <div className="notes-list">
            <NotesList data={data} notes={notes} />
          </div>
        </div>
      </div>

      <div className="hypothesis-card">
        <h3>Hypothesis Draft</h3>
        <form onSubmit={saveHypothesis}>
          <div className="form-row">
            <label htmlFor="hypSuspect">Suspected responsible person</label>
            <select
              id="hypSuspect"
              name="suspectId"
              value={draft.suspectId}
              onChange={(event) =>
                updateDraft({ suspectId: event.target.value })
              }
            >
              <option value="">Select a person...</option>
              {data.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="hypNature">Accidental or deliberate incident</label>
            <select
              id="hypNature"
              name="nature"
              value={draft.nature}
              onChange={(event) => updateDraft({ nature: event.target.value })}
            >
              <option value="">Select...</option>
              <option value="accidental">Accidental</option>
              <option value="deliberate">Deliberate</option>
              <option value="unclear">Unclear</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="hypEvidence">Selected supporting evidence</label>
            <select
              id="hypEvidence"
              name="evidenceIds"
              multiple
              size={6}
              value={draft.evidenceIds}
              onChange={(event) =>
                updateDraft({
                  evidenceIds: Array.from(
                    event.currentTarget.selectedOptions,
                    (option) => option.value,
                  ),
                })
              }
            >
              {data.evidence.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} - {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="hypConfidence">Confidence (0-100)</label>
            <input
              type="range"
              id="hypConfidence"
              name="confidence"
              min="0"
              max="100"
              value={draft.confidence}
              onChange={(event) =>
                updateDraft({ confidence: event.target.value })
              }
            />
            <output>{draft.confidence}</output>
          </div>

          <div className="form-row">
            <label htmlFor="hypExplanation">Written explanation</label>
            <textarea
              id="hypExplanation"
              name="explanation"
              rows={4}
              placeholder="Explain your reasoning..."
              value={draft.explanation}
              onChange={(event) =>
                updateDraft({ explanation: event.target.value })
              }
            />
          </div>

          <div className="form-row">
            <label htmlFor="hypAlternative">Alternative explanation</label>
            <textarea
              id="hypAlternative"
              name="alternative"
              rows={3}
              placeholder="What else could explain the evidence?"
              value={draft.alternative}
              onChange={(event) =>
                updateDraft({ alternative: event.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save hypothesis draft
            </button>
            <span className={`saved-msg${saved ? "" : " hidden"}`}>Saved</span>
          </div>
        </form>
      </div>
    </section>
  );
}
import { useState } from "react";
import type { Evidence } from "../../../js/models";
import type { DashboardData } from "../../app/types";

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

function NotesList({ data }: { data: DashboardData }) {
  const entries = data.evidence.filter((item) => data.notes[item.id]);

  if (entries.length === 0) {
    return <p>No notes yet. Add one from an evidence item's detail view.</p>;
  }

  return (
    <>
      {entries.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{item.id}</strong> &mdash; {item.title}
          <div>{data.notes[item.id]}</div>
        </div>
      ))}
    </>
  );
}

interface WorkspacePageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function WorkspacePage({ data, error }: WorkspacePageProps) {
  const [saved, setSaved] = useState(false);

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

  const bookmarks = data.evidence.filter((item) =>
    data.bookmarks.includes(item.id),
  );
  const draft = data.hypothesisDraft;

  function saveHypothesis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hypothesis = {
      suspectId: String(formData.get("suspectId") ?? ""),
      nature: String(formData.get("nature") ?? ""),
      evidenceIds: formData.getAll("evidenceIds").map(String),
      confidence: String(formData.get("confidence") ?? "50"),
      explanation: String(formData.get("explanation") ?? ""),
      alternative: String(formData.get("alternative") ?? ""),
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem("remotion_hypothesis", JSON.stringify(hypothesis));
    setSaved(true);
  }

  return (
    <section className="view active" aria-labelledby="workspace-title">
      <h2 id="workspace-title">Investigator Workspace</h2>
      <div className="workspace-grid">
        <div className="workspace-col">
          <h3>Bookmarked Evidence</h3>
          <div className="bookmarks-list">
            <BookmarkList evidence={bookmarks} />
          </div>
        </div>
        <div className="workspace-col">
          <h3>Personal Notes</h3>
          <p className="hint-text">
            Notes are attached to whichever evidence item is currently open in
            the Evidence view.
          </p>
          <div className="notes-list">
            <NotesList data={data} />
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
              defaultValue={draft?.suspectId ?? ""}
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
              defaultValue={draft?.nature ?? ""}
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
              defaultValue={draft?.evidenceIds ?? []}
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
              defaultValue={draft?.confidence ?? "50"}
            />
            <output>{draft?.confidence ?? "50"}</output>
          </div>

          <div className="form-row">
            <label htmlFor="hypExplanation">Written explanation</label>
            <textarea
              id="hypExplanation"
              name="explanation"
              rows={4}
              placeholder="Explain your reasoning..."
              defaultValue={draft?.explanation ?? ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="hypAlternative">Alternative explanation</label>
            <textarea
              id="hypAlternative"
              name="alternative"
              rows={3}
              placeholder="What else could explain the evidence?"
              defaultValue={draft?.alternative ?? ""}
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
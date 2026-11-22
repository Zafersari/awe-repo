import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { BookmarkContext } from "./BookmarkContext";
import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../shared/models";
import DashboardPage from "../features/dashboard/DashboardPage";
import EvidencePage from "../features/evidence/EvidencePage";
import PersonDetailPage from "../features/people-locations/PersonDetailPage";
import PeopleLocationsPage from "../features/people-locations/PeopleLocationsPage";
import TimelinePage from "../features/timeline/TimelinePage";
import WorkspacePage from "../features/workspace/WorkspacePage";
import type { CaseData, DashboardData, HypothesisDraft } from "./types";

async function fetchJson<T>(fileName: string): Promise<T> {
  const response = await fetch(`/data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Could not load ${fileName} (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

function PeopleLocationsNavLink() {
  const { pathname } = useLocation();

  return (
    <NavLink
      to="/team/people"
      className={`nav-btn${pathname.startsWith("/team/") ? " active" : ""}`}
    >
      People &amp; Locations
    </NavLink>
  );
}

function loadBookmarks(): string[] {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem("remotion_bookmarks") ?? "[]",
    );
    return Array.isArray(value) && value.every((id) => typeof id === "string")
      ? value
      : [];
  } catch {
    return [];
  }
}

function loadNotes(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem("remotion_notes") ?? "{}",
    );
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function loadHypothesisDraft(): HypothesisDraft | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem("remotion_hypothesis") ?? "null",
    );
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return null;
    }

    const draft = value as Record<string, unknown>;
    return {
      suspectId: typeof draft.suspectId === "string" ? draft.suspectId : "",
      nature: typeof draft.nature === "string" ? draft.nature : "",
      evidenceIds: Array.isArray(draft.evidenceIds)
        ? draft.evidenceIds.filter((id): id is string => typeof id === "string")
        : [],
      confidence:
        typeof draft.confidence === "string" ||
        typeof draft.confidence === "number"
          ? String(draft.confidence)
          : "50",
      explanation:
        typeof draft.explanation === "string" ? draft.explanation : "",
      alternative:
        typeof draft.alternative === "string" ? draft.alternative : "",
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(loadBookmarks);
  const [notes, setNotes] = useState<Record<string, string>>(loadNotes);
  const [hypothesisDraft, setHypothesisDraft] =
    useState<HypothesisDraft | null>(loadHypothesisDraft);

  function toggleBookmark(evidenceId: string) {
    const nextBookmarks = bookmarks.includes(evidenceId)
      ? bookmarks.filter((id) => id !== evidenceId)
      : [...bookmarks, evidenceId];
    setBookmarks(nextBookmarks);
    window.localStorage.setItem(
      "remotion_bookmarks",
      JSON.stringify(nextBookmarks),
    );
  }

  function saveNote(evidenceId: string, text: string) {
    const nextNotes = { ...notes, [evidenceId]: text };
    setNotes(nextNotes);
    window.localStorage.setItem("remotion_notes", JSON.stringify(nextNotes));
  }

  function saveHypothesisDraft(draft: HypothesisDraft) {
    const savedDraft = { ...draft, savedAt: new Date().toISOString() };
    setHypothesisDraft(draft);
    window.localStorage.setItem(
      "remotion_hypothesis",
      JSON.stringify(savedDraft),
    );
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchJson<CaseData>("case.json"),
      fetchJson<Evidence[]>("evidence.json"),
      fetchJson<Person[]>("people.json"),
      fetchJson<Location[]>("locations.json"),
      fetchJson<TimelineEvent[]>("timeline.json"),
    ])
      .then(([caseData, evidence, people, locations, timeline]) => {
        if (cancelled) return;
        setDashboardData({
          caseData,
          evidence,
          people,
          locations,
          timeline,
        });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setDashboardError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load case data.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrowserRouter>
      <BookmarkContext.Provider value={{ bookmarks, toggleBookmark }}>
        <>
          <header className="app-header">
            <div className="header-inner">
              <div className="brand">
                <img
                  src="/assets/logo/logo.svg"
                  alt="Project ReMotion logo"
                  className="brand-logo"
                />
                <div>
                  <h1>Project ReMotion</h1>
                  <p className="subtitle">
                    Investigate the failure of an AI-assisted rehabilitation
                    robot.
                  </p>
                </div>
              </div>
              <nav className="main-nav" aria-label="Main navigation">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-btn${isActive ? " active" : ""}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/evidence"
                  className={({ isActive }) =>
                    `nav-btn${isActive ? " active" : ""}`
                  }
                >
                  Evidence
                </NavLink>
                <PeopleLocationsNavLink />
                <NavLink
                  to="/timeline"
                  className={({ isActive }) =>
                    `nav-btn${isActive ? " active" : ""}`
                  }
                >
                  Timeline
                </NavLink>
                <NavLink
                  to="/workspace"
                  className={({ isActive }) =>
                    `nav-btn${isActive ? " active" : ""}`
                  }
                >
                  Workspace
                </NavLink>
              </nav>
            </div>
          </header>
          <main className="app-main">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage data={dashboardData} error={dashboardError} />
                }
              />
              <Route
                path="/evidence"
                element={
                  <EvidencePage
                    data={dashboardData}
                    error={dashboardError}
                    notes={notes}
                    onSaveNote={saveNote}
                  />
                }
              />
              <Route
                path="/team/people"
                element={
                  <PeopleLocationsPage
                    section="people"
                    data={dashboardData}
                    error={dashboardError}
                  />
                }
              />
              <Route
                path="/team/people/:personId"
                element={
                  <PersonDetailPage
                    data={dashboardData}
                    error={dashboardError}
                  />
                }
              />
              <Route
                path="/team/locations"
                element={
                  <PeopleLocationsPage
                    section="locations"
                    data={dashboardData}
                    error={dashboardError}
                  />
                }
              />
              <Route
                path="/timeline"
                element={
                  <TimelinePage data={dashboardData} error={dashboardError} />
                }
              />
              <Route
                path="/workspace"
                element={
                  <WorkspacePage
                    data={dashboardData}
                    error={dashboardError}
                    notes={notes}
                    hypothesisDraft={hypothesisDraft}
                    onSaveHypothesis={saveHypothesisDraft}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="app-footer">
            Project ReMotion Investigation Portal &mdash; Research Center AI,
            Software and IT-Security of HCW (fictional case study)
          </footer>
        </>
      </BookmarkContext.Provider>
    </BrowserRouter>
  );
}

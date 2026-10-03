import { useEffect, useState } from "react";
import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../../js/models";

interface CaseData {
  title: string;
  status: string;
  summary: string;
}

interface DashboardData {
  caseData: CaseData;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
}

// Fetch one public JSON file and turn HTTP failures into readable errors.
async function fetchJson<T>(fileName: string): Promise<T> {
  const url = new URL(`../../data/${fileName}`, window.location.href);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${fileName} (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

// Restore the saved bookmark IDs used by the vanilla app's workspace.
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

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Unknown date";
  return `${date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

function statusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "reviewed":
      return "badge-reviewed";
    case "flagged":
      return "badge-flagged";
    default:
      return "badge-unreviewed";
  }
}

// Small display components receive their content as props from the dashboard.
function CaseSummary({ data }: { data: CaseData }) {
  return (
    <section className="case-summary-card">
      <h3>{data.title || "Case"}</h3>
      <p>
        <span className="badge badge-flagged">
          {(data.status || "unknown").toUpperCase()}
        </span>
      </p>
      <p>{data.summary}</p>
    </section>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ReviewProgress({
  reviewed,
  total,
}: {
  reviewed: number;
  total: number;
}) {
  const percentage = total === 0 ? 0 : Math.round((reviewed / total) * 100);

  return (
    <section className="dashboard-panel">
      <h3>Review progress</h3>
      <div
        className="progress-bar-outer"
        role="progressbar"
        aria-label="Evidence reviewed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="progress-bar-inner"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p>{percentage}% of evidence reviewed</p>
    </section>
  );
}

function RecentEvidenceList({ items }: { items: Evidence[] }) {
  return (
    <section className="dashboard-panel">
      <h3>Recent evidence</h3>
      {items.length === 0 ? (
        <p>No evidence loaded yet.</p>
      ) : (
        items.map((item) => (
          <div className="mini-list-item" key={item.id}>
            <strong>{item.id}</strong> &mdash; {item.title}{" "}
            <span className={`badge ${statusBadgeClass(item.status || "")}`}>
              {item.status || "unknown"}
            </span>
          </div>
        ))
      )}
    </section>
  );
}

function RecentTimelineList({ items }: { items: TimelineEvent[] }) {
  return (
    <section className="dashboard-panel">
      <h3>Recent timeline events</h3>
      {items.length === 0 ? (
        <p>No timeline events loaded yet.</p>
      ) : (
        items.map((item) => (
          <div className="mini-list-item" key={item.id}>
            <strong>{formatDate(item.time)}</strong>
            <br />
            {item.title}
          </div>
        ))
      )}
    </section>
  );
}

function DashboardPage({
  data,
  error,
}: {
  data: DashboardData | null;
  error: string | null;
}) {
  // Show the request state before trying to render data-dependent content.
  if (error) {
    return (
      <section className="view active">
        <h2>Case Dashboard</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="view active">
        <h2>Case Dashboard</h2>
        <p>Loading case data...</p>
      </section>
    );
  }

  // Derive counts and recent items from the loaded datasets during render.
  const reviewed = data.evidence.filter(
    (item) => (item.status || "").toLowerCase() === "reviewed",
  ).length;
  const recentEvidence = data.evidence.slice(-5).reverse();
  const recentTimeline = data.timeline.slice(-5).reverse();

  return (
    <section className="view active" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title">Case Dashboard</h2>
      <CaseSummary data={data.caseData} />
      <div className="stat-grid">
        <StatCard value={data.evidence.length} label="Evidence items" />
        <StatCard value={data.people.length} label="People" />
        <StatCard value={data.locations.length} label="Locations" />
        <StatCard value={data.bookmarks.length} label="Bookmarked" />
        <StatCard value={reviewed} label="Reviewed" />
      </div>
      <ReviewProgress reviewed={reviewed} total={data.evidence.length} />
      <div className="dashboard-columns">
        <RecentEvidenceList items={recentEvidence} />
        <RecentTimelineList items={recentTimeline} />
      </div>
    </section>
  );
}

function StubPage({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="view active" aria-labelledby="page-title">
      <h2 id="page-title">{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function EvidencePage() {
  return <StubPage title="Evidence Catalogue" detail="Evidence view stub." />;
}

function PeopleLocationsPage() {
  return (
    <StubPage
      title="People & Locations"
      detail="People and locations view stub."
    />
  );
}

function TimelinePage() {
  return <StubPage title="Timeline" detail="Timeline view stub." />;
}

function WorkspacePage() {
  return (
    <StubPage title="Investigator Workspace" detail="Workspace view stub." />
  );
}

// This table defines valid routes, their labels, and the page each route renders.
const views = [
  { id: "dashboard", label: "Dashboard" },
  { id: "evidence", label: "Evidence" },
  { id: "people", label: "People & Locations" },
  { id: "timeline", label: "Timeline" },
  { id: "workspace", label: "Workspace" },
] as const;

type ViewId = (typeof views)[number]["id"];

function RoutePage({
  view,
  data,
  error,
}: {
  view: ViewId;
  data: DashboardData | null;
  error: string | null;
}) {
  switch (view) {
    case "dashboard":
      return <DashboardPage data={data} error={error} />;
    case "evidence":
      return <EvidencePage />;
    case "people":
      return <PeopleLocationsPage />;
    case "timeline":
      return <TimelinePage />;
    case "workspace":
      return <WorkspacePage />;
  }
}

function viewFromHash(): ViewId {
  const hash = window.location.hash.slice(1);
  // Unknown or empty hashes fall back to the dashboard.
  return views.find((view) => view.id === hash)?.id ?? "dashboard";
}

export default function App() {
  // React state tracks the route and drives the rendered page and active nav item.
  const [currentView, setCurrentView] = useState<ViewId>(viewFromHash);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    // Keep React in sync with clicks, browser Back/Forward, and direct hash changes.
    const syncView = () => {
      const nextView = viewFromHash();
      // Replace invalid hashes with the dashboard route in the address bar.
      if (window.location.hash !== `#${nextView}`) {
        window.location.hash = nextView;
      }
      setCurrentView(nextView);
    };

    window.addEventListener("hashchange", syncView);
    syncView();
    // Remove the listener when this shell unmounts.
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  useEffect(() => {
    // Load the same public datasets as the vanilla app once and cache them in the shell.
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
        // Keep the fetched datasets together so Dashboard can pass focused props to children.
        setDashboardData({
          caseData,
          evidence,
          people,
          locations,
          timeline,
          bookmarks: loadBookmarks(),
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

    // Ignore a late response if the shell has unmounted before the requests finish.
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="../../assets/logo/logo.svg"
              alt=""
              className="brand-logo"
            />
            <div>
              <h1>Project ReMotion</h1>
              <p className="subtitle">
                Investigate the failure of an AI-assisted rehabilitation robot.
              </p>
            </div>
          </div>
          <nav className="main-nav" aria-label="Main navigation">
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`nav-btn${currentView === view.id ? " active" : ""}`}
                aria-current={currentView === view.id ? "page" : undefined}
                onClick={() => {
                  // The hashchange listener updates currentView and rerenders the shell.
                  window.location.hash = view.id;
                }}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <RoutePage
          view={currentView}
          data={dashboardData}
          error={dashboardError}
        />
      </main>
      <footer className="app-footer">
        Project ReMotion Investigation Portal
      </footer>
    </>
  );
}

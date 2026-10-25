import { useEffect, useState } from "react";
import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../../../js/models";
import DashboardPage from "../features/dashboard/DashboardPage";
import PeopleLocationsPage from "../features/people-locations/PeopleLocationsPage";
import TimelinePage from "../features/timeline/TimelinePage";
import StubPage from "../shared/StubPage";
import type { CaseData, DashboardData } from "./types";

async function fetchJson<T>(fileName: string): Promise<T> {
  const url = new URL(`../../data/${fileName}`, window.location.href);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${fileName} (${response.status}).`);
  }
  return response.json() as Promise<T>;
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

const views = [
  { id: "dashboard", label: "Dashboard" },
  { id: "evidence", label: "Evidence" },
  { id: "people", label: "People & Locations" },
  { id: "timeline", label: "Timeline" },
  { id: "workspace", label: "Workspace" },
] as const;

type ViewId = (typeof views)[number]["id"];

function viewFromHash(): ViewId {
  const hash = window.location.hash.slice(1);
  return views.find((view) => view.id === hash)?.id ?? "dashboard";
}

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
      return (
        <StubPage title="Evidence Catalogue" detail="Evidence view stub." />
      );
    case "people":
      return <PeopleLocationsPage data={data} error={error} />;
    case "timeline":
      return <TimelinePage data={data} error={error} />;
    case "workspace":
      return (
        <StubPage
          title="Investigator Workspace"
          detail="Workspace view stub."
        />
      );
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>(viewFromHash);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const syncView = () => {
      const nextView = viewFromHash();
      if (window.location.hash !== `#${nextView}`) {
        window.location.hash = nextView;
      }
      setCurrentView(nextView);
    };

    window.addEventListener("hashchange", syncView);
    syncView();
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

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

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../../../js/models";
import DashboardPage from "../features/dashboard/DashboardPage";
import PersonDetailPage from "../features/people-locations/PersonDetailPage";
import PeopleLocationsPage from "../features/people-locations/PeopleLocationsPage";
import TimelinePage from "../features/timeline/TimelinePage";
import StubPage from "../shared/StubPage";
import type { CaseData, DashboardData } from "./types";

async function fetchJson<T>(fileName: string): Promise<T> {
  const response = await fetch(`/data/${fileName}`);
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

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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
    <BrowserRouter basename="/sandbox/react-intro">
      <>
        <header className="app-header">
          <div className="header-inner">
            <div className="brand">
              <img src="/assets/logo/logo.svg" alt="" className="brand-logo" />
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
              <NavLink
                to="/team/people"
                className={({ isActive }) =>
                  `nav-btn${isActive ? " active" : ""}`
                }
              >
                People
              </NavLink>
              <NavLink
                to="/team/locations"
                className={({ isActive }) =>
                  `nav-btn${isActive ? " active" : ""}`
                }
              >
                Locations
              </NavLink>
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
                <StubPage
                  title="Evidence Catalogue"
                  detail="Evidence view stub."
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
                <StubPage
                  title="Investigator Workspace"
                  detail="Workspace view stub."
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          Project ReMotion Investigation Portal
        </footer>
      </>
    </BrowserRouter>
  );
}

import { useEffect, useState } from "react";

function StubPage({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="view active" aria-labelledby="page-title">
      <h2 id="page-title">{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function DashboardPage() {
  return (
    <StubPage
      title="Case Dashboard"
      detail="The real dashboard will be migrated in Demo 10."
    />
  );
}

function EvidencePage() {
  return <StubPage title="Evidence Catalogue" detail="Evidence view stub." />;
}

function PeopleLocationsPage() {
  return <StubPage title="People & Locations" detail="People and locations view stub." />;
}

function TimelinePage() {
  return <StubPage title="Timeline" detail="Timeline view stub." />;
}

function WorkspacePage() {
  return <StubPage title="Investigator Workspace" detail="Workspace view stub." />;
}

// This table defines valid routes, their labels, and the page each route renders.
const views = [
  { id: "dashboard", label: "Dashboard", Page: DashboardPage },
  { id: "evidence", label: "Evidence", Page: EvidencePage },
  { id: "people", label: "People & Locations", Page: PeopleLocationsPage },
  { id: "timeline", label: "Timeline", Page: TimelinePage },
  { id: "workspace", label: "Workspace", Page: WorkspacePage },
] as const;

type ViewId = (typeof views)[number]["id"];

function viewFromHash(): ViewId {
  const hash = window.location.hash.slice(1);
  // Unknown or empty hashes fall back to the dashboard.
  return views.find((view) => view.id === hash)?.id ?? "dashboard";
}

export default function App() {
  // React state tracks the route and drives the rendered page and active nav item.
  const [currentView, setCurrentView] = useState<ViewId>(viewFromHash);

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

  // Resolve the current route to its page component.
  const ActivePage =
    views.find((view) => view.id === currentView)?.Page ?? DashboardPage;

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
        <ActivePage />
      </main>
      <footer className="app-footer">
        Project ReMotion Investigation Portal
      </footer>
    </>
  );
}
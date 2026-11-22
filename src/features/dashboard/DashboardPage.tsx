import type { Evidence, TimelineEvent } from "../../shared/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";
import StatusBadge, {
  type StatusBadgeTone,
} from "../../shared/components/StatusBadge";
import { Link } from "react-router-dom";
import { useBookmarks } from "../../app/BookmarkContext";

function statusBadgeTone(status: string): StatusBadgeTone {
  switch (status.toLowerCase()) {
    case "reviewed":
      return "reviewed";
    case "flagged":
      return "flagged";
    default:
      return "unreviewed";
  }
}

function CaseSummary({ data }: { data: DashboardData["caseData"] }) {
  return (
    <section className="case-summary-card">
      <h3>{data.title || "Case"}</h3>
      <p>
        <StatusBadge
          label={(data.status || "unknown").toUpperCase()}
          tone="flagged"
        />
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
            <StatusBadge
              label={item.status || "unknown"}
              tone={statusBadgeTone(item.status || "")}
            />
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

function DashboardIntro() {
  return (
    <div className="intro-card">
      <h3>How to use this portal</h3>
      <p>
        Everything gathered on the case so far is organised into four working
        views. Use the navigation bar at the top to move between them at any
        time.
      </p>
      <div className="howto-grid">
        <div className="howto-item">
          <h4>1. Evidence Catalogue</h4>
          <p>
            Search, filter, and sort every evidence item. Open one for full
            details, related people and locations, and to add a private note.
          </p>
          <Link className="btn btn-secondary btn-small" to="/evidence">
            Go to Evidence
          </Link>
        </div>
        <div className="howto-item">
          <h4>2. People &amp; Locations</h4>
          <p>
            Read profiles and statements from the six team members involved, and
            look up the six key locations in the investigation.
          </p>
          <Link className="btn btn-secondary btn-small" to="/team/people">
            Go to People &amp; Locations
          </Link>
        </div>
        <div className="howto-item">
          <h4>3. Timeline</h4>
          <p>
            Walk through events in chronological order, filter by person,
            location, or type, and jump straight to the evidence behind any
            event.
          </p>
          <Link className="btn btn-secondary btn-small" to="/timeline">
            Go to Timeline
          </Link>
        </div>
        <div className="howto-item">
          <h4>4. Investigator Workspace</h4>
          <p>
            Your bookmarked evidence and notes collect here. Draft a hypothesis:
            who you suspect, why, and how confident you are. It is saved
            automatically in your browser.
          </p>
          <Link className="btn btn-secondary btn-small" to="/workspace">
            Go to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

interface DashboardContentProps {
  data: DashboardData;
  bookmarks: string[];
  reviewed: number;
  recentEvidence: Evidence[];
  recentTimeline: TimelineEvent[];
}

function DashboardContent({
  data,
  bookmarks,
  reviewed,
  recentEvidence,
  recentTimeline,
}: DashboardContentProps) {
  return (
    <section className="view active" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title">Case Dashboard</h2>
      <DashboardIntro />
      <CaseSummary data={data.caseData} />
      <div className="stat-grid">
        <StatCard value={data.evidence.length} label="Evidence items" />
        <StatCard value={data.people.length} label="People" />
        <StatCard value={data.locations.length} label="Locations" />
        <StatCard value={bookmarks.length} label="Bookmarked" />
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

interface DashboardPageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function DashboardPage({ data, error }: DashboardPageProps) {
  const { bookmarks } = useBookmarks();

  if (error) {
    return (
      <section className="view active">
        <h2>Case Dashboard</h2>
        <DashboardIntro />
        <p role="alert">{error}</p>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="view active">
        <h2>Case Dashboard</h2>
        <DashboardIntro />
        <p>Loading case data...</p>
      </section>
    );
  }

  const reviewed = data.evidence.filter(
    (item) => (item.status || "").toLowerCase() === "reviewed",
  ).length;
  const recentEvidence = data.evidence.slice(-5).reverse();
  const recentTimeline = data.timeline.slice(-5).reverse();

  return (
    <DashboardContent
      data={data}
      bookmarks={bookmarks}
      reviewed={reviewed}
      recentEvidence={recentEvidence}
      recentTimeline={recentTimeline}
    />
  );
}

import type { Evidence, TimelineEvent } from "../../../../js/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";

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

function CaseSummary({ data }: { data: DashboardData["caseData"] }) {
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

interface DashboardContentProps {
  data: DashboardData;
  reviewed: number;
  recentEvidence: Evidence[];
  recentTimeline: TimelineEvent[];
}

function DashboardContent({
  data,
  reviewed,
  recentEvidence,
  recentTimeline,
}: DashboardContentProps) {
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

interface DashboardPageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function DashboardPage({ data, error }: DashboardPageProps) {
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

  const reviewed = data.evidence.filter(
    (item) => (item.status || "").toLowerCase() === "reviewed",
  ).length;
  const recentEvidence = data.evidence.slice(-5).reverse();
  const recentTimeline = data.timeline.slice(-5).reverse();

  return (
    <DashboardContent
      data={data}
      reviewed={reviewed}
      recentEvidence={recentEvidence}
      recentTimeline={recentTimeline}
    />
  );
}

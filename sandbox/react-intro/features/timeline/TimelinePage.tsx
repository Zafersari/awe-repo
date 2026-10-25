import type { TimelineEvent } from "../../../../js/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <article className="timeline-event">
      <div className="timeline-time">{formatDate(event.time)}</div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
    </article>
  );
}

interface TimelinePageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function TimelinePage({ data, error }: TimelinePageProps) {
  if (error) {
    return (
      <section className="view active">
        <h2>Timeline</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="view active">
        <h2>Timeline</h2>
        <p>Loading timeline...</p>
      </section>
    );
  }

  return (
    <section className="view active" aria-labelledby="timeline-title">
      <h2 id="timeline-title">Timeline</h2>
      {data.timeline.length === 0 ? (
        <p>No timeline events to display.</p>
      ) : (
        <div className="timeline-container">
          {data.timeline.map((event) => (
            <TimelineEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

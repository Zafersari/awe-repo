import { useSearchParams } from "react-router-dom";
import type { Location, TimelineEvent } from "../../../js/models";
import { formatDate } from "../../shared/formatDate";
import type { DashboardData } from "../../app/types";

function TimelineEventCard({
  event,
  locations,
}: {
  event: TimelineEvent;
  locations: Location[];
}) {
  const certaintyTone =
    event.certainty === "confirmed"
      ? "reviewed"
      : event.certainty === "contradictory"
        ? "critical"
        : event.certainty === "reported"
          ? "flagged"
          : "unreviewed";

  return (
    <article className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <span className={`badge badge-${certaintyTone}`}>
          {event.certainty}
        </span>
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {event.locationIds.length > 0 && (
        <p className="evidence-meta">
          Location:{" "}
          {event.locationIds
            .map(
              (id) =>
                locations.find((location) => location.id === id)?.name ?? id,
            )
            .join(", ")}
        </p>
      )}
      {event.evidenceIds.map((evidenceId) => (
        <button type="button" className="evidence-link-btn" key={evidenceId}>
          View {evidenceId}
        </button>
      ))}
    </article>
  );
}

interface TimelinePageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function TimelinePage({ data, error }: TimelinePageProps) {
  const [searchParams] = useSearchParams();
  const personFilter = searchParams.get("person") ?? "";

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

  const matchingEvents = personFilter
    ? data.timeline.filter((event) => event.personIds.includes(personFilter))
    : data.timeline;
  const displayedEvents = [...matchingEvents].sort(
    (first, second) =>
      new Date(first.time).getTime() - new Date(second.time).getTime(),
  );
  const eventTypes = [...new Set(data.timeline.map((event) => event.type))];

  return (
    <section className="view active" aria-labelledby="timeline-title">
      <h2 id="timeline-title">Investigation Timeline</h2>
      <div className="toolbar" id="timelineToolbar">
        <div className="toolbar-row">
          <label className="visually-hidden" htmlFor="timelineOrder">
            Order
          </label>
          <select id="timelineOrder" defaultValue="asc">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>

          <label className="visually-hidden" htmlFor="timelinePersonFilter">
            Filter by person
          </label>
          <select id="timelinePersonFilter" defaultValue={personFilter}>
            <option value="">All people</option>
            {data.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <label className="visually-hidden" htmlFor="timelineLocationFilter">
            Filter by location
          </label>
          <select id="timelineLocationFilter" defaultValue="">
            <option value="">All locations</option>
            {data.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.id}
              </option>
            ))}
          </select>

          <label className="visually-hidden" htmlFor="timelineTypeFilter">
            Filter by event type
          </label>
          <select id="timelineTypeFilter" defaultValue="">
            <option value="">All event types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      {displayedEvents.length === 0 ? (
        <p>No timeline events match the current filters.</p>
      ) : (
        <div className="timeline-container">
          {displayedEvents.map((event) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              locations={data.locations}
            />
          ))}
        </div>
      )}
    </section>
  );
}

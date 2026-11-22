import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Location, Person } from "../../shared/models";
import type { DashboardData } from "../../app/types";

interface PeopleLocationsPanelProps {
  children: ReactNode;
}

function PeopleLocationsPanel({ children }: PeopleLocationsPanelProps) {
  return <>{children}</>;
}

function PersonCard({
  person,
  evidenceCount,
}: {
  person: Person;
  evidenceCount: number;
}) {
  return (
    <article className="person-card">
      <div className="person-card-header">
        <img
          className="person-avatar"
          src={`/${person.avatar}`}
          alt={`Portrait of ${person.name}`}
        />
        <div>
          <h3>
            <Link to={`/team/people/${person.id}`}>{person.name}</Link>
          </h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>
      <ul>
        {person.responsibilities.map((responsibility) => (
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>
      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
      <p>
        {evidenceCount} related evidence item{evidenceCount === 1 ? "" : "s"} —{" "}
        <Link className="evidence-count-link" to="/evidence">
          view
        </Link>
      </p>
    </article>
  );
}

function LocationCard({ location }: { location: Location }) {
  return (
    <article className="location-card">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {location.contains.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

interface PeopleLocationsPageProps {
  section: "people" | "locations";
  data: DashboardData | null;
  error: string | null;
}

export default function PeopleLocationsPage({
  section,
  data,
  error,
}: PeopleLocationsPageProps) {
  if (error) {
    return (
      <section className="view active">
        <h2>People & Locations</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="view active">
        <h2>People & Locations</h2>
        <p>Loading people and locations...</p>
      </section>
    );
  }

  return (
    <section className="view active" aria-labelledby="people-locations-title">
      <h2 id="people-locations-title">People & Locations</h2>
      <div className="tab-bar" aria-label="People and locations">
        <NavLink
          className={({ isActive }) => `tab-btn${isActive ? " active" : ""}`}
          to="/team/people"
        >
          People
        </NavLink>
        <NavLink
          className={({ isActive }) => `tab-btn${isActive ? " active" : ""}`}
          to="/team/locations"
        >
          Locations
        </NavLink>
      </div>
      {section === "people" ? (
        <PeopleLocationsPanel>
          {data.people.length === 0 ? (
            <p>No people are listed.</p>
          ) : (
            <div className="people-grid">
              {data.people.map((person) => {
                const evidenceCount = data.evidence.filter(
                  (item) =>
                    item.personIds.includes(person.id) ||
                    item.personIds.includes(person.name),
                ).length;
                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    evidenceCount={evidenceCount}
                  />
                );
              })}
            </div>
          )}
        </PeopleLocationsPanel>
      ) : (
        <PeopleLocationsPanel>
          {data.locations.length === 0 ? (
            <p>No locations are listed.</p>
          ) : (
            <div className="locations-grid">
              {data.locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </PeopleLocationsPanel>
      )}
    </section>
  );
}

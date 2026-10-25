import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Location, Person } from "../../../../js/models";
import type { DashboardData } from "../../app/types";

interface PeopleLocationsPanelProps {
  title: string;
  children: ReactNode;
}

function PeopleLocationsPanel({ title, children }: PeopleLocationsPanelProps) {
  return (
    <section className="dashboard-panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function PersonCard({ person }: { person: Person }) {
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
      <p>{person.background}</p>
      <div className="person-statement">{person.statement}</div>
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
        <strong>Contains:</strong> {location.contains.join(", ")}
      </p>
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
          className={({ isActive }) =>
            `tab-btn${isActive ? " active" : ""}`
          }
          to="/team/people"
        >
          People
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `tab-btn${isActive ? " active" : ""}`
          }
          to="/team/locations"
        >
          Locations
        </NavLink>
      </div>
      <div className="dashboard-columns">
        {section === "people" ? (
          <PeopleLocationsPanel title="People">
            {data.people.length === 0 ? (
              <p>No people are listed.</p>
            ) : (
              <div className="people-grid">
                {data.people.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </PeopleLocationsPanel>
        ) : (
          <PeopleLocationsPanel title="Locations">
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
      </div>
    </section>
  );
}

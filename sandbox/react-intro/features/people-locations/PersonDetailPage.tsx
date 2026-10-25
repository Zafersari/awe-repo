import { Link, useParams } from "react-router-dom";
import type { DashboardData } from "../../app/types";

interface PersonDetailPageProps {
  data: DashboardData | null;
  error: string | null;
}

export default function PersonDetailPage({
  data,
  error,
}: PersonDetailPageProps) {
  const { personId } = useParams<{ personId: string }>();

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!data) {
    return <p>Loading person...</p>;
  }

  const person = data.people.find((candidate) => candidate.id === personId);

  if (!person) {
    return (
      <section className="view active">
        <h2>Person not found</h2>
        <p>No person matches the ID in this URL.</p>
        <Link to="/team/people">Back to People</Link>
      </section>
    );
  }

  return (
    <section className="view active">
      <Link to="/team/people">Back to People</Link>
      <article className="person-card">
        <div className="person-card-header">
          <img
            className="person-avatar"
            src={`/${person.avatar}`}
            alt={`Portrait of ${person.name}`}
          />
          <div>
            <h2>{person.name}</h2>
            <div className="person-role">{person.role}</div>
          </div>
        </div>
        <p>
          <strong>Speciality:</strong> {person.speciality}
        </p>
        <p>{person.background}</p>
        <ul>
          {person.responsibilities.map((responsibility) => (
            <li key={responsibility}>{responsibility}</li>
          ))}
        </ul>
        <div className="person-statement">{person.statement}</div>
      </article>
    </section>
  );
}
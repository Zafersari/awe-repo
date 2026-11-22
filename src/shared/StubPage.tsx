interface StubPageProps {
  title: string;
  detail: string;
}

export default function StubPage({ title, detail }: StubPageProps) {
  return (
    <section className="view active" aria-labelledby="page-title">
      <h2 id="page-title">{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

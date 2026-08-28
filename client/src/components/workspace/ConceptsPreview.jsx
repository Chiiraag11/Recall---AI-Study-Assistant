export default function ConceptsPreview({ concepts }) {
  return (
    <div className="concepts-preview">
      <p className="concepts-preview__caption">Things you should be able to explain from memory.</p>
      <ol className="concepts-preview__list">
        {concepts.map((c, i) => (
          <li key={c.id} className="concepts-preview__item">
            <span className="concepts-preview__index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{c.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

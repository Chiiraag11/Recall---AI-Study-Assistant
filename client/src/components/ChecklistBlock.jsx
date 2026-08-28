export default function ChecklistBlock({ concepts, checked, onToggle }) {
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = concepts.length ? Math.round((doneCount / concepts.length) * 100) : 0;

  return (
    <div className="checklist">
      <div className="checklist__toolbar">
        <h3 className="section-title">Concept checklist</h3>
        <span className="checklist__count">
          {doneCount}/{concepts.length}
        </span>
      </div>
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="checklist__list">
        {concepts.map((c) => (
          <li key={c.id}>
            <label className="checklist__item">
              <input
                type="checkbox"
                checked={Boolean(checked[c.id])}
                onChange={() => onToggle(c.id)}
              />
              <span className={checked[c.id] ? "checklist__label checklist__label--done" : "checklist__label"}>
                {c.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

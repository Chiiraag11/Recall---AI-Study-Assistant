export default function LoadingSkeleton({ partial, streaming }) {
  const flashcardCount = partial?.flashcards?.length || 0;
  const quizCount = partial?.quiz?.length || 0;
  const conceptCount = partial?.concepts?.length || 0;

  return (
    <div className="skeleton" role="status" aria-live="polite">
      <div className="skeleton__header">
        <div className="skeleton__spinner" aria-hidden="true" />
        <div>
          <p className="skeleton__title">
            {streaming ? "Generating your study kit…" : "Thinking…"}
          </p>
          <p className="skeleton__subtitle">
            {streaming
              ? `${flashcardCount} flashcard${flashcardCount === 1 ? "" : "s"}, ${quizCount} quiz question${quizCount === 1 ? "" : "s"}, ${conceptCount} concept${conceptCount === 1 ? "" : "s"} so far…`
              : "The model is drafting flashcards, a quiz, and a concept checklist."}
          </p>
        </div>
      </div>

      {streaming && flashcardCount > 0 ? (
        <div className="skeleton__preview">
          <h3 className="section-title">Flashcards (drafting…)</h3>
          <div className="skeleton__card-row">
            {partial.flashcards.slice(0, 6).map((fc, i) => (
              <div className="skeleton__mini-card" key={fc.id || i}>
                {fc.front || "…"}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="skeleton__blocks">
          <div className="skeleton__block skeleton__block--shimmer" style={{ height: 140 }} />
          <div className="skeleton__block skeleton__block--shimmer" style={{ height: 140 }} />
          <div className="skeleton__block skeleton__block--shimmer" style={{ height: 90 }} />
        </div>
      )}
    </div>
  );
}

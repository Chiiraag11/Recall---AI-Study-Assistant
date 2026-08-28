export default function Flashcard({ front, back, flipped, onFlip, index, total }) {
  return (
    <div
      className={`flashcard ${flipped ? "flashcard--flipped" : ""}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        // Space is handled globally by FlashcardDeck's keyboard shortcuts
        // (so it works regardless of focus); handling it here too would
        // flip the card twice. Enter still needs to work here since it's
        // not one of the global shortcuts.
        if (e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label={flipped ? `Answer: ${back}` : `Question: ${front}. Press to reveal answer.`}
    >
      <div className="flashcard__inner">
        <div className="flashcard__face flashcard__face--front">
          <span className="flashcard__eyebrow">
            Card {index + 1} of {total}
          </span>
          <p className="flashcard__text">{front}</p>
          <span className="flashcard__hint">Tap to flip</span>
        </div>
        <div className="flashcard__face flashcard__face--back">
          <span className="flashcard__eyebrow">Answer</span>
          <p className="flashcard__text">{back}</p>
          <span className="flashcard__hint">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
}

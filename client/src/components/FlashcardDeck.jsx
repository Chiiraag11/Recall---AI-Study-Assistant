import {
  useEffect,
  useState,
  useCallback,
} from "react";
import Flashcard from "./Flashcard";

function shuffleArray(arr) {
  const copy = [...arr];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [copy[i], copy[j]] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

export default function FlashcardDeck({
  cards,
  onCardReviewed,
}) {
  const [order, setOrder] =
    useState(
      cards.map((_, i) => i)
    );

  const [current, setCurrent] =
    useState(0);

  const [flipped, setFlipped] =
    useState(false);

  useEffect(() => {
    setOrder(
      cards.map((_, i) => i)
    );

    setCurrent(0);
    setFlipped(false);
  }, [cards]);

  const reviewCurrentCard =
    useCallback(() => {
      const card =
        cards.length
          ? cards[order[current]]
          : null;

      if (
        card &&
        onCardReviewed
      ) {
        onCardReviewed(card.id);
      }
    }, [
      cards,
      order,
      current,
      onCardReviewed,
    ]);

  const go = useCallback(
    (delta) => {
      setFlipped(false);

      setCurrent((c) =>
        Math.max(
          0,
          Math.min(
            order.length - 1,
            c + delta
          )
        )
      );
    },
    [order.length]
  );

  const card = cards.length
    ? cards[order[current]]
    : null;

  useEffect(() => {
    const handler = (e) => {
      if (
        ["INPUT", "TEXTAREA"].includes(
          document.activeElement?.tagName
        )
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        go(1);
      } else if (
        e.key === "ArrowLeft"
      ) {
        go(-1);
      } else if (e.key === " ") {
        e.preventDefault();

        setFlipped((f) => {
          const next = !f;

          if (next) {
            reviewCurrentCard();
          }

          return next;
        });
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, [
    go,
    reviewCurrentCard,
  ]);

  if (!card) {
    return null;
  }

  return (
    <div className="flashcard-deck">
      <div className="flashcard-deck__toolbar">
        <h3 className="section-title">
          Flashcards
        </h3>

        <button
          className="btn btn--ghost btn--small"
          onClick={() => {
            setOrder(
              shuffleArray(order)
            );

            setCurrent(0);
            setFlipped(false);
          }}
        >
          Shuffle
        </button>
      </div>

      <Flashcard
        front={card.front}
        back={card.back}
        flipped={flipped}
        onFlip={() => {
          setFlipped((f) => {
            const next = !f;

            if (next) {
              reviewCurrentCard();
            }

            return next;
          });
        }}
        index={current}
        total={cards.length}
      />

      <div className="flashcard-deck__nav">
        <button
          className="btn btn--ghost"
          onClick={() => go(-1)}
          disabled={current === 0}
        >
          ← Prev
        </button>

        <div
          className="flashcard-deck__dots"
          aria-hidden="true"
        >
          {order.map((_, i) => (
            <span
              key={i}
              className={`dot ${
                i === current
                  ? "dot--active"
                  : ""
              }`}
            />
          ))}
        </div>

        <button
          className="btn btn--ghost"
          onClick={() => go(1)}
          disabled={
            current ===
            order.length - 1
          }
        >
          Next →
        </button>
      </div>

      <p className="flashcard-deck__hint">
        Keyboard: ← → to move, space
        to flip
      </p>
    </div>
  );
}
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import QuizQuestion from "./QuizQuestion";

export default function Quiz({
  questions,
  onComplete,
}) {
  const [pool, setPool] =
    useState(questions);

  const [answers, setAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [round, setRound] =
    useState(1);

  const score = useMemo(() => {
    if (!submitted) {
      return null;
    }

    const correct = pool.filter(
      (q) =>
        answers[q.id] ===
        q.correctIndex
    ).length;

    return {
      correct,
      total: pool.length,
    };
  }, [
    submitted,
    pool,
    answers,
  ]);

  const wrongQuestions = useMemo(() => {
    if (!submitted) {
      return [];
    }

    return pool.filter(
      (q) =>
        answers[q.id] !==
        q.correctIndex
    );
  }, [
    submitted,
    pool,
    answers,
  ]);

  const answeredCount =
    pool.filter(
      (q) =>
        answers[q.id] !== undefined
    ).length;

  const allAnswered =
    answeredCount === pool.length;

  useEffect(() => {
    if (
      submitted &&
      onComplete
    ) {
      onComplete();
    }
  }, [
    submitted,
    onComplete,
  ]);

  const handleSelect = (
    id,
    index
  ) => {
    if (submitted) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [id]: index,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetestWrong = () => {
    setPool(wrongQuestions);
    setAnswers({});
    setSubmitted(false);
    setRound((r) => r + 1);
  };

  const handleRestartFull = () => {
    setPool(questions);
    setAnswers({});
    setSubmitted(false);
    setRound(1);
  };

  return (
    <div className="quiz">
      <div className="quiz__toolbar">
        <h3 className="section-title">
          Quiz{" "}
          {round > 1
            ? `— retake ${round - 1}`
            : ""}
        </h3>

        {round > 1 && (
          <button
            className="btn btn--ghost btn--small"
            onClick={
              handleRestartFull
            }
          >
            Restart full quiz
          </button>
        )}
      </div>

      {pool.map((q, i) => (
        <QuizQuestion
          key={q.id}
          question={q}
          index={i}
          selectedIndex={
            answers[q.id]
          }
          submitted={submitted}
          onSelect={(idx) =>
            handleSelect(
              q.id,
              idx
            )
          }
        />
      ))}

      {!submitted ? (
        <>
          <div className="quiz__progress">
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={
                answeredCount
              }
              aria-valuemin={0}
              aria-valuemax={
                pool.length
              }
              aria-label="Questions answered"
            >
              <div
                className="progress-bar__fill"
                style={{
                  width: `${
                    pool.length
                      ? (answeredCount /
                          pool.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <span className="quiz__progress-label">
              {answeredCount}/
              {pool.length} answered
            </span>
          </div>

          <button
            className="btn btn--primary"
            onClick={
              handleSubmit
            }
            disabled={!allAnswered}
          >
            {allAnswered
              ? "Submit answers"
              : `Answer all ${pool.length} to submit`}
          </button>
        </>
      ) : (
        <div className="quiz__results">
          <p className="quiz__score">
            {score.correct} /{" "}
            {score.total} correct
          </p>

          {wrongQuestions.length >
          0 ? (
            <button
              className="btn btn--primary"
              onClick={
                handleRetestWrong
              }
            >
              Retest the{" "}
              {wrongQuestions.length} I
              got wrong
            </button>
          ) : (
            <p className="quiz__perfect">
              🎉 Perfect score
              {round > 1
                ? " on the retake!"
                : "!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
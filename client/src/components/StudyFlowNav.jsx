import {
  Check,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "flashcards",
    label: "Flashcards",
  },
  {
    id: "quiz",
    label: "Quiz",
  },
  {
    id: "concepts",
    label: "Concepts",
  },
  {
    id: "checklist",
    label: "Checklist",
  },
];

const NEXT = {
  overview: {
    id: "flashcards",
    label: "Continue to Flashcards",
  },

  flashcards: {
    id: "quiz",
    label: "Continue to Quiz",
  },

  quiz: {
    id: "concepts",
    label: "Review Concepts",
  },

  concepts: {
    id: "checklist",
    label: "Complete Checklist",
  },
};

export default function StudyFlowNav({
  activeSection,
  onNavigate,
  stats,
}) {
  return (
    <div
      className="study-flow"
      aria-label="Study session progress"
    >
      <div className="study-flow__steps">
        {STEPS.map((step, index) => {
          const completed =
            step.id === "flashcards"
              ? Boolean(
                  stats?.flashcardsTotal &&
                    stats.flashcardsReviewed >=
                      stats.flashcardsTotal
                )
              : step.id === "quiz"
                ? Boolean(
                    stats?.quizCompleted
                  )
                : step.id === "concepts"
                  ? Boolean(
                      stats?.conceptsReviewed
                    )
                  : step.id === "checklist"
                    ? Boolean(
                        stats?.checklistCompleted
                      )
                    : false;

          const active =
            step.id === activeSection;

          return (
            <div
              key={step.id}
              className="study-flow__step-wrap"
            >
              <button
                type="button"
                className={[
                  "study-flow__step",

                  active
                    ? "study-flow__step--active"
                    : "",

                  completed
                    ? "study-flow__step--completed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onNavigate(step.id)
                }
                aria-current={
                  active
                    ? "step"
                    : undefined
                }
              >
                <span className="study-flow__step-icon">
                  {completed ? (
                    <Check
                      size={12}
                      strokeWidth={2.5}
                    />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="study-flow__step-label">
                  {step.label}
                </span>
              </button>

              {index <
                STEPS.length - 1 && (
                <span
                  className="study-flow__connector"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="study-flow__action">
        {activeSection ===
        "checklist" ? (
          <button
            type="button"
            className="btn btn--primary study-flow__next"
            onClick={() =>
              onNavigate("overview")
            }
            disabled={
              !stats?.checklistCompleted
            }
          >
            <span>
              {stats?.checklistCompleted
                ? "Finish Study Session"
                : "Complete all checklist items"}
            </span>

            {stats?.checklistCompleted && (
              <ChevronRight
                size={17}
                strokeWidth={2}
              />
            )}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary study-flow__next"
            onClick={() =>
              onNavigate(
                NEXT[activeSection].id
              )
            }
          >
            <span>
              {NEXT[activeSection].label}
            </span>

            <ChevronRight
              size={17}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
    </div>
  );
}
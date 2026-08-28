import {
  Layers,
  ListChecks,
  Lightbulb,
} from "lucide-react";

import ProgressDonut from "../ProgressDonut";

const QUICK_LINKS = [
  {
    id: "flashcards",
    label: "Continue flashcards",
    icon: Layers,
  },
  {
    id: "quiz",
    label: "Take the quiz",
    icon: ListChecks,
  },
  {
    id: "concepts",
    label: "Review concepts",
    icon: Lightbulb,
  },
];

export default function Overview({
  studyKit,
  onNavigate,
  chartSlot,
  refinementSlot,
  checklistProgress,
  progressStats,
}) {
  return (
    <div className="overview">
      <div className="overview__intro">
        <h1>{studyKit.topic}</h1>

        <p>{studyKit.summary}</p>

        <dl className="overview__meta">
          <div>
            <dt>
              {studyKit.flashcards.length}
            </dt>
            <dd>flashcards</dd>
          </div>

          <div>
            <dt>
              {studyKit.quiz.length}
            </dt>
            <dd>quiz questions</dd>
          </div>

          <div>
            <dt>
              {studyKit.concepts.length}
            </dt>
            <dd>concepts</dd>
          </div>
        </dl>
      </div>

      {progressStats && (
        <section
          className={[
            "overview__progress",
            progressStats.complete
              ? "overview__progress--complete"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Overall study progress"
        >
          <div className="overview__progress-content">
            <div className="overview__progress-copy">
              <span className="overview__progress-label">
                Study progress
              </span>

              <h2>
                {progressStats.complete
                  ? "Session complete"
                  : "Keep going"}
              </h2>

              <p>
                {progressStats.complete
                  ? "You've completed every part of this study session."
                  : "Work through each study step to complete your session."}
              </p>

              <div
                className="overview__progress-milestones"
                aria-label="Study milestones"
              >
                <span
                  className={
                    progressStats.flashcardsReviewed >=
                    progressStats.flashcardsTotal
                      ? "is-complete"
                      : ""
                  }
                >
                  Flashcards
                </span>

                <span
                  className={
                    progressStats.quizCompleted
                      ? "is-complete"
                      : ""
                  }
                >
                  Quiz
                </span>

                <span
                  className={
                    progressStats.conceptsReviewed
                      ? "is-complete"
                      : ""
                  }
                >
                  Concepts
                </span>

                <span
                  className={
                    progressStats.checklistCompleted
                      ? "is-complete"
                      : ""
                  }
                >
                  Checklist
                </span>
              </div>
            </div>

            <ProgressDonut
              percentage={
                progressStats.percentage
              }
            />
          </div>
        </section>
      )}

      {chartSlot}

      <div className="overview__quick">
        <h2 className="section-title">
          Quick study
        </h2>

        <div className="overview__quick-links">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;

            return (
              <button
                key={link.id}
                className="quick-link"
                onClick={() =>
                  onNavigate(link.id)
                }
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                />

                <span>
                  {link.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {refinementSlot}
    </div>
  );
}
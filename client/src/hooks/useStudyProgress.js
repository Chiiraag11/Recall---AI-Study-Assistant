import { useCallback, useMemo, useState } from "react";
import { updateSessionProgress } from "../lib/storage";

const EMPTY = {
  flashcardsReviewed: [],
  quizCompleted: false,
  conceptsReviewed: false,
  checklistChecked: [],
  checklistCompleted: false,
};

function normalizeProgress(progress) {
  return {
    flashcardsReviewed: Array.isArray(progress?.flashcardsReviewed)
      ? progress.flashcardsReviewed
      : [],
    quizCompleted: Boolean(progress?.quizCompleted),
    conceptsReviewed: Boolean(progress?.conceptsReviewed),
    checklistChecked: Array.isArray(progress?.checklistChecked)
      ? progress.checklistChecked
      : [],
    checklistCompleted: Boolean(progress?.checklistCompleted),
  };
}

export function useStudyProgress(sessionId, studyKit) {
  const [progress, setProgress] = useState(EMPTY);

  const resetProgress = useCallback((savedProgress) => {
    setProgress(normalizeProgress(savedProgress));
  }, []);

  const markFlashcardReviewed = useCallback(
    (cardId) => {
      if (!cardId) return;

      setProgress((prev) => {
        if (prev.flashcardsReviewed.includes(cardId)) {
          return prev;
        }

        const next = {
          ...prev,
          flashcardsReviewed: [
            ...prev.flashcardsReviewed,
            cardId,
          ],
        };

        if (sessionId) {
          updateSessionProgress(sessionId, next);
        }

        return next;
      });
    },
    [sessionId]
  );

  const markQuizCompleted = useCallback(() => {
    setProgress((prev) => {
      if (prev.quizCompleted) {
        return prev;
      }

      const next = {
        ...prev,
        quizCompleted: true,
      };

      if (sessionId) {
        updateSessionProgress(sessionId, next);
      }

      return next;
    });
  }, [sessionId]);

  const markConceptsReviewed = useCallback(() => {
    setProgress((prev) => {
      if (prev.conceptsReviewed) {
        return prev;
      }

      const next = {
        ...prev,
        conceptsReviewed: true,
      };

      if (sessionId) {
        updateSessionProgress(sessionId, next);
      }

      return next;
    });
  }, [sessionId]);

  const markChecklistItem = useCallback(
    (id, checked) => {
      if (!id) return;

      setProgress((prev) => {
        const checkedSet = new Set(
          prev.checklistChecked
        );

        if (checked) {
          checkedSet.add(id);
        } else {
          checkedSet.delete(id);
        }

        const checkedIds = [...checkedSet];

        const total =
          studyKit?.concepts?.length || 0;

        const complete =
          total > 0 &&
          checkedIds.length >= total;

        const next = {
          ...prev,
          checklistChecked: checkedIds,
          checklistCompleted: complete,
        };

        if (sessionId) {
          updateSessionProgress(sessionId, next);
        }

        return next;
      });
    },
    [sessionId, studyKit]
  );

  const stats = useMemo(() => {
    const totalCards =
      studyKit?.flashcards?.length || 0;

    const flashcardsReviewed = Math.min(
      progress.flashcardsReviewed.length,
      totalCards
    );

    const flashcardPct = totalCards
      ? (flashcardsReviewed / totalCards) * 100
      : 100;

    const raw =
      (
        flashcardPct +
        (progress.quizCompleted ? 100 : 0) +
        (progress.conceptsReviewed ? 100 : 0) +
        (progress.checklistCompleted ? 100 : 0)
      ) / 4;

    const complete =
      totalCards > 0 &&
      flashcardsReviewed >= totalCards &&
      progress.quizCompleted &&
      progress.conceptsReviewed &&
      progress.checklistCompleted;

    return {
      percentage: complete
        ? 100
        : Math.round(raw),

      flashcardsReviewed,
      flashcardsTotal: totalCards,

      quizCompleted:
        progress.quizCompleted,

      conceptsReviewed:
        progress.conceptsReviewed,

      checklistChecked:
        progress.checklistChecked,

      checklistCompleted:
        progress.checklistCompleted,

      complete,
    };
  }, [progress, studyKit]);

  return {
    progress,
    stats,
    resetProgress,
    markFlashcardReviewed,
    markQuizCompleted,
    markConceptsReviewed,
    markChecklistItem,
  };
}
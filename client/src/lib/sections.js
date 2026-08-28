import { LayoutGrid, Layers, ListChecks, Lightbulb, SquareCheck } from "lucide-react";

/**
 * The five workspace views. `short` is used where space is tight (mobile
 * bottom nav); `label` is the full sidebar text.
 */
export const SECTIONS = [
  { id: "overview", label: "Overview", short: "Overview", icon: LayoutGrid },
  { id: "flashcards", label: "Flashcards", short: "Cards", icon: Layers },
  { id: "quiz", label: "Quiz", short: "Quiz", icon: ListChecks },
  { id: "concepts", label: "Concepts", short: "Concepts", icon: Lightbulb },
  { id: "checklist", label: "Checklist", short: "Checklist", icon: SquareCheck },
];

export function countsFor(studyKit) {
  if (!studyKit) return null;
  return {
    flashcards: studyKit.flashcards?.length || 0,
    quiz: studyKit.quiz?.length || 0,
    concepts: studyKit.concepts?.length || 0,
  };
}

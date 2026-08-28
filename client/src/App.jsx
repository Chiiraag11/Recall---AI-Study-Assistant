import { useEffect, useState } from "react";
import Sidebar from "./components/shell/Sidebar";
import TopBar from "./components/shell/TopBar";
import MobileNav from "./components/shell/MobileNav";
import Overview from "./components/workspace/Overview";
import ConceptsPreview from "./components/workspace/ConceptsPreview";
import InputPanel from "./components/InputPanel";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorState from "./components/ErrorState";
import FlashcardDeck from "./components/FlashcardDeck";
import Quiz from "./components/Quiz";
import ChecklistBlock from "./components/ChecklistBlock";
import TopicChart from "./components/TopicChart";
import RefinementBar from "./components/RefinementBar";
import StudyFlowNav from "./components/StudyFlowNav";
import { SECTIONS } from "./lib/sections";
import { useStudyKitGenerator } from "./hooks/useStudyKitGenerator";
import { useStudyProgress } from "./hooks/useStudyProgress";

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem(
        "study-assistant:theme"
      ) ||
      (window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches
        ? "light"
        : "dark")
    );
  });

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      "study-assistant:theme",
      theme
    );
  }, [theme]);

  return [theme, setTheme];
}

export default function App() {
  const [theme, setTheme] =
    useTheme();

  const [streaming, setStreaming] =
    useState(true);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState("overview");

  const [
    sessionRefreshKey,
    setSessionRefreshKey,
  ] = useState(0);

  const {
    status,
    studyKit,
    partial,
    error,
    isRefining,
    refineError,
    sessionId,
    sessionProgress,
    generate,
    retry,
    refine,
    loadFromSession,
    reset,
  } = useStudyKitGenerator({
    streaming,
  });

  const {
    stats: progressStats,
    resetProgress,
    markFlashcardReviewed,
    markQuizCompleted,
    markConceptsReviewed,
    markChecklistItem,
  } = useStudyProgress(
    sessionId,
    studyKit
  );

  const hasSession =
    status === "success" &&
    Boolean(studyKit);

  useEffect(() => {
    if (hasSession) {
      resetProgress(
        sessionProgress
      );
    } else {
      resetProgress(null);
    }
  }, [
    hasSession,
    sessionId,
    sessionProgress,
    resetProgress,
  ]);

  useEffect(() => {
    if (status === "success") {
      setActiveSection(
        "overview"
      );

      setSessionRefreshKey(
        (k) => k + 1
      );
    }
  }, [
    status,
    studyKit,
  ]);

  const handleNewStudy = () => {
    reset();
    resetProgress(null);

    setActiveSection(
      "overview"
    );

    setMobileSidebarOpen(false);
  };

  const handleSelectSession = (
    session
  ) => {
    loadFromSession(session);
    setActiveSection(
      "overview"
    );
  };

  const handleSectionNavigate = (
    section
  ) => {
    if (
      section === "concepts"
    ) {
      markConceptsReviewed();
    }

    setActiveSection(section);
  };

  const handleChecklistToggle = (
    id
  ) => {
    const currentlyChecked =
      progressStats.checklistChecked.includes(
        id
      );

    markChecklistItem(
      id,
      !currentlyChecked
    );
  };

  const activeSectionMeta =
    SECTIONS.find(
      (s) =>
        s.id === activeSection
    );

  const topBarTitle = hasSession
    ? studyKit.topic
    : status === "error"
      ? "Recall — AI Study Assistant"
      : "New study";

  const topBarSubtitle =
    hasSession
      ? activeSectionMeta?.label
      : null;

  return (
    <div className="shell">
      <Sidebar
        open={
          mobileSidebarOpen
        }
        onCloseMobile={() =>
          setMobileSidebarOpen(
            false
          )
        }
        hasSession={hasSession}
        activeSection={
          activeSection
        }
        onSelectSection={
          handleSectionNavigate
        }
        activeSessionId={
          sessionId
        }
        onSelectSession={
          handleSelectSession
        }
        onNewStudy={
          handleNewStudy
        }
        refreshKey={
          sessionRefreshKey
        }
      />

      <div className="shell__body">
        <TopBar
          onOpenMobileSidebar={() =>
            setMobileSidebarOpen(
              true
            )
          }
          title={topBarTitle}
          subtitle={
            topBarSubtitle
          }
          saved={
            hasSession &&
            Boolean(sessionId)
          }
          theme={theme}
          onToggleTheme={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
        />

        <main className="workspace">
          {!hasSession && (
            <div className="workspace__landing">
              <InputPanel
                onSubmit={generate}
                disabled={
                  status ===
                    "loading" ||
                  status ===
                    "streaming"
                }
                streaming={
                  streaming
                }
                onStreamingChange={
                  setStreaming
                }
              />

              <div className="workspace__landing-result">
                {status ===
                  "empty" && (
                  <EmptyState />
                )}

                {(status ===
                  "loading" ||
                  status ===
                    "streaming") && (
                  <LoadingSkeleton
                    partial={
                      partial
                    }
                    streaming={
                      streaming
                    }
                  />
                )}

                {status ===
                  "error" && (
                  <ErrorState
                    message={error}
                    onRetry={
                      retry
                    }
                    onStartOver={
                      handleNewStudy
                    }
                  />
                )}
              </div>
            </div>
          )}

          {hasSession &&
            activeSection ===
              "overview" && (
              <>
                <Overview
                  studyKit={
                    studyKit
                  }
                  onNavigate={
                    handleSectionNavigate
                  }
                  chartSlot={
                    <TopicChart
                      confidence={
                        studyKit.confidence
                      }
                    />
                  }
                  refinementSlot={
                    <RefinementBar
                      onRefine={
                        refine
                      }
                      isRefining={
                        isRefining
                      }
                      error={
                        refineError
                      }
                    />
                  }
                  checklistProgress={{
                    done:
                      progressStats
                        .checklistChecked
                        .length,
                    total:
                      studyKit
                        .concepts
                        .length,
                  }}
                  progressStats={
                    progressStats
                  }
                />

                <StudyFlowNav
                  activeSection="overview"
                  onNavigate={
                    handleSectionNavigate
                  }
                  stats={
                    progressStats
                  }
                />
              </>
            )}

          {hasSession &&
            activeSection ===
              "flashcards" && (
              <div className="workspace__panel">
                <FlashcardDeck
                  cards={
                    studyKit.flashcards
                  }
                  onCardReviewed={
                    markFlashcardReviewed
                  }
                />

                <StudyFlowNav
                  activeSection="flashcards"
                  onNavigate={
                    handleSectionNavigate
                  }
                  stats={
                    progressStats
                  }
                />
              </div>
            )}

          {hasSession &&
            activeSection ===
              "quiz" && (
              <div className="workspace__panel">
                <Quiz
                  questions={
                    studyKit.quiz
                  }
                  onComplete={
                    markQuizCompleted
                  }
                />

                <StudyFlowNav
                  activeSection="quiz"
                  onNavigate={
                    handleSectionNavigate
                  }
                  stats={
                    progressStats
                  }
                />
              </div>
            )}

          {hasSession &&
            activeSection ===
              "concepts" && (
              <div className="workspace__panel">
                <h1 className="workspace__panel-title">
                  Key concepts
                </h1>

                <ConceptsPreview
                  concepts={
                    studyKit.concepts
                  }
                />

                <StudyFlowNav
                  activeSection="concepts"
                  onNavigate={
                    handleSectionNavigate
                  }
                  stats={
                    progressStats
                  }
                />
              </div>
            )}

          {hasSession &&
            activeSection ===
              "checklist" && (
              <div className="workspace__panel">
                <ChecklistBlock
                  concepts={
                    studyKit.concepts
                  }
                  checked={Object.fromEntries(
                    progressStats.checklistChecked.map(
                      (id) => [
                        id,
                        true,
                      ]
                    )
                  )}
                  onToggle={
                    handleChecklistToggle
                  }
                />

                <StudyFlowNav
                  activeSection="checklist"
                  onNavigate={
                    handleSectionNavigate
                  }
                  stats={
                    progressStats
                  }
                />
              </div>
            )}
        </main>

        {hasSession && (
          <MobileNav
            activeSection={[
              "overview",
              "flashcards",
              "quiz",
            ].includes(
              activeSection
            )
              ? activeSection
              : null}
            onSelectSection={
              handleSectionNavigate
            }
            onMore={() =>
              setMobileSidebarOpen(
                true
              )
            }
            moreActive={[
              "concepts",
              "checklist",
            ].includes(
              activeSection
            )}
          />
        )}
      </div>
    </div>
  );
}
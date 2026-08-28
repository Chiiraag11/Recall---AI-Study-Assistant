import { useCallback, useRef, useState } from "react";
import { generateStudyKit, refineStudyKit, streamStudyKit, ApiError } from "../api/studyKitApi";
import { extractPartialArrays } from "../lib/partialJsonParser";
import { saveSession } from "../lib/storage";

/**
 * status:
 *  - "empty"     nothing generated yet
 *  - "loading"   non-streaming request in flight
 *  - "streaming" streaming request in flight (partial data may be available)
 *  - "success"   have a validated study kit
 *  - "error"     last request failed; `error` has a user-facing message
 */
export function useStudyKitGenerator({ streaming = true } = {}) {
  const [status, setStatus] = useState("empty");
  const [studyKit, setStudyKit] = useState(null);
  const [partial, setPartial] = useState({ flashcards: [], quiz: [], concepts: [], confidence: [] });
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Guards against stale responses clobbering a newer request: every call to
  // generate() gets a new id + AbortController. The abort cancels the
  // in-flight network request; the id check is a belt-and-suspenders guard
  // for stream callbacks that may already be queued in the event loop when
  // a newer request starts.
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const isCurrent = (id) => id === requestIdRef.current;

  const generate = useCallback(
    async (inputNotes) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;

      setNotes(inputNotes);
      setError(null);
      setStudyKit(null);
      setPartial({ flashcards: [], quiz: [], concepts: [], confidence: [] });
      setSessionId(null);
      setStatus(streaming ? "streaming" : "loading");

      try {
        if (streaming) {
          await streamStudyKit(inputNotes, {
            signal: controller.signal,
            onDelta: (deltaAccumulatedSoFar) => {
              if (!isCurrent(requestId)) return;
              setPartial((prevAccumulated) => {
                // We don't have the full accumulated text here on purpose -
                // the server only sends deltas - so we track it locally.
                const nextText = (prevAccumulated.__raw || "") + deltaAccumulatedSoFar;
                const arrays = extractPartialArrays(nextText);
                return { ...arrays, __raw: nextText };
              });
            },
            onDone: (finalStudyKit) => {
              if (!isCurrent(requestId)) return;
              setStudyKit(finalStudyKit);
              setStatus("success");
              const saved = saveSession({ notes: inputNotes, studyKit: finalStudyKit });
              setSessionId(saved.id);
            },
            onError: (err) => {
              if (!isCurrent(requestId)) return;
              setError(err.message);
              setStatus("error");
            },
          });
        } else {
          const result = await generateStudyKit(inputNotes, { signal: controller.signal });
          if (!isCurrent(requestId)) return;
          setStudyKit(result);
          setStatus("success");
          const saved = saveSession({ notes: inputNotes, studyKit: result });
          setSessionId(saved.id);
        }
      } catch (err) {
        if (err?.name === "AbortError") return; // superseded by a newer request - ignore silently
        if (!isCurrent(requestId)) return;
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        setStatus("error");
      }
    },
    [streaming]
  );

  const retry = useCallback(() => {
    if (notes) generate(notes);
  }, [notes, generate]);

  const refine = useCallback(
    async (instruction) => {
      if (!studyKit || isRefining) return;
      setIsRefining(true);
      setRefineError(null);
      const controller = new AbortController();
      try {
        const updated = await refineStudyKit(
          { notes, currentStudyKit: studyKit, instruction },
          { signal: controller.signal }
        );
        setStudyKit(updated);
        const saved = saveSession({ id: sessionId, notes, studyKit: updated });
        setSessionId(saved.id);
      } catch (err) {
        setRefineError(err instanceof ApiError ? err.message : "Couldn't apply that change. Please try again.");
      } finally {
        setIsRefining(false);
      }
    },
    [studyKit, notes, sessionId, isRefining]
  );

  const loadFromSession = useCallback((session) => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    setNotes(session.notes);
    setStudyKit(session.studyKit);
    setSessionId(session.id);
    setStatus("success");
    setError(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    setStatus("empty");
    setStudyKit(null);
    setError(null);
    setNotes("");
    setSessionId(null);
    setPartial({ flashcards: [], quiz: [], concepts: [], confidence: [] });
  }, []);

  return {
    status,
    studyKit,
    partial,
    error,
    notes,
    isRefining,
    refineError,
    sessionId,
    generate,
    retry,
    refine,
    loadFromSession,
    reset,
  };
}

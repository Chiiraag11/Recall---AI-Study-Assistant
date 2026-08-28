const STORAGE_KEY =
  "study-assistant:sessions:v1";

const MAX_SESSIONS = 20;

function readAll() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function writeAll(sessions) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        sessions.slice(0, MAX_SESSIONS)
      )
    );

    return true;
  } catch {
    return false;
  }
}

export function listSessions() {
  return readAll().sort(
    (a, b) =>
      b.updatedAt - a.updatedAt
  );
}

export function saveSession({
  id,
  notes,
  studyKit,
  progress,
}) {
  const sessions = readAll();

  const now = Date.now();

  const existingIndex =
    sessions.findIndex(
      (s) => s.id === id
    );

  const existing =
    existingIndex >= 0
      ? sessions[existingIndex]
      : null;

  const session = {
    id:
      id ||
      `session-${now}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    topic:
      studyKit?.topic ||
      "Untitled study kit",

    notes,

    studyKit,

    progress:
      progress ||
      existing?.progress ||
      null,

    updatedAt: now,

    createdAt:
      existingIndex >= 0
        ? existing.createdAt
        : now,
  };

  if (existingIndex >= 0) {
    sessions[existingIndex] =
      session;
  } else {
    sessions.unshift(session);
  }

  writeAll(sessions);

  return session;
}

export function updateSessionProgress(
  id,
  progress
) {
  if (!id) {
    return null;
  }

  const sessions = readAll();

  const index =
    sessions.findIndex(
      (s) => s.id === id
    );

  if (index < 0) {
    return null;
  }

  sessions[index] = {
    ...sessions[index],
    progress,
    updatedAt: Date.now(),
  };

  writeAll(sessions);

  return sessions[index];
}

export function deleteSession(id) {
  writeAll(
    readAll().filter(
      (s) => s.id !== id
    )
  );
}

export function getSession(id) {
  return (
    readAll().find(
      (s) => s.id === id
    ) || null
  );
}

export const storageAvailable =
  (() => {
    try {
      const testKey =
        "__study_assistant_test__";

      localStorage.setItem(
        testKey,
        "1"
      );

      localStorage.removeItem(
        testKey
      );

      return true;
    } catch {
      return false;
    }
  })();
const BASE = "/api";

async function parseJsonSafely(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Non-streaming generation. */
export async function generateStudyKit(notes, { signal } = {}) {
  const res = await fetch(`${BASE}/study-kit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
    signal,
  });
  const body = await parseJsonSafely(res);
  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, {
      status: res.status,
      code: body?.code,
    });
  }
  return body.studyKit;
}

/** Follow-up refinement of an existing study kit. */
export async function refineStudyKit({ notes, currentStudyKit, instruction }, { signal } = {}) {
  const res = await fetch(`${BASE}/study-kit/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes, currentStudyKit, instruction }),
    signal,
  });
  const body = await parseJsonSafely(res);
  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, {
      status: res.status,
      code: body?.code,
    });
  }
  return body.studyKit;
}

/**
 * Streaming generation over SSE. `fetch` (not EventSource) because we need
 * to send a POST body. Parses the `event: <name>\ndata: <json>\n\n` framing
 * by hand and invokes the matching callback as each frame completes.
 */
export async function streamStudyKit(notes, { signal, onDelta, onDone, onError }) {
  const res = await fetch(`${BASE}/study-kit/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
    signal,
  });

  if (!res.ok || !res.body) {
    const body = await parseJsonSafely(res);
    throw new ApiError(body?.error || `Request failed (${res.status})`, {
      status: res.status,
      code: body?.code,
    });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary;
    // SSE frames are separated by a blank line.
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const eventMatch = frame.match(/^event:\s*(.+)$/m);
      const dataMatch = frame.match(/^data:\s*(.+)$/m);
      if (!dataMatch) continue;

      let payload;
      try {
        payload = JSON.parse(dataMatch[1]);
      } catch {
        continue;
      }
      const eventName = eventMatch?.[1]?.trim() || "message";

      if (eventName === "delta") onDelta?.(payload.delta);
      else if (eventName === "done") onDone?.(payload.studyKit);
      else if (eventName === "error") onError?.(new ApiError(payload.error, { code: payload.code }));
    }
  }
}

export { ApiError };

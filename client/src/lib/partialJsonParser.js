/**
 * Attempts to parse a possibly-truncated JSON string by closing any
 * unterminated string and any open objects/arrays, then calling JSON.parse.
 *
 * This is intentionally "optimistic" - it's only ever used to drive the
 * streaming preview (so flashcards/quiz questions can appear one-by-one as
 * the model writes them). It is NOT the source of truth: the final result
 * always comes from the server, which validates the complete response
 * against the real schema before calling it done. If this returns null (or
 * something that doesn't look right), the UI just keeps showing the
 * skeleton for that section - nothing breaks.
 *
 * @param {string} text - accumulated raw text streamed so far
 * @returns {object|null}
 */
export function tryParsePartialJson(text) {
  if (!text || typeof text !== "string") return null;

  const stack = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      stack.pop();
    }
  }

  let fixed = text;
  if (inString) fixed += '"';
  // A dangling key/value/comma at the very end can't be closed into valid
  // JSON, so trim back to the last structurally-safe boundary.
  fixed = fixed.replace(/,\s*$/, "").replace(/:\s*$/, "");

  for (let i = stack.length - 1; i >= 0; i--) {
    fixed += stack[i] === "{" ? "}" : "]";
  }

  try {
    return JSON.parse(fixed);
  } catch {
    return null;
  }
}

/** Safely pulls out arrays-in-progress for the streaming preview, tolerating a partially-formed last element. */
export function extractPartialArrays(text) {
  const parsed = tryParsePartialJson(text);
  if (!parsed || typeof parsed !== "object") {
    return { flashcards: [], quiz: [], concepts: [], confidence: [] };
  }
  return {
    flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
    quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
    concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
    confidence: Array.isArray(parsed.confidence) ? parsed.confidence : [],
  };
}

import { GoogleGenAI } from "@google/genai";
import {
  STUDY_KIT_RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION,
  studyKitZodSchema,
} from "./schema.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000);
const MAX_ATTEMPTS = 3; // 1 initial try + 2 repair retries

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error(
      "GEMINI_API_KEY is not set on the server. Add it to server/.env (see .env.example)."
    );
    err.code = "MISSING_API_KEY";
    throw err;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/** Strips ```json ... ``` fences the model sometimes adds despite instructions not to. */
function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} timed out after ${ms}ms`);
      err.code = "TIMEOUT";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Calls Gemini with responseSchema-constrained JSON mode, validates the
 * result against studyKitZodSchema, and retries with the validation error
 * fed back to the model if it doesn't come back clean. Throws a typed error
 * (`err.code`) rather than returning null, so callers can map it to a
 * specific HTTP status / user-facing message instead of a generic 500.
 */
export async function generateStudyKit(prompt) {
  const ai = getClient();
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const attemptPrompt =
      attempt === 1
        ? prompt
        : `${prompt}\n\nYour previous attempt was invalid: ${lastError}. Return corrected JSON that strictly matches the schema.`;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: MODEL,
          contents: attemptPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: STUDY_KIT_RESPONSE_SCHEMA,
            temperature: 0.6,
          },
        }),
        REQUEST_TIMEOUT_MS,
        "Gemini request"
      );

      const text = response.text;
      if (!text) {
        lastError = "model returned an empty response";
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(stripCodeFences(text));
      } catch (e) {
        lastError = `response was not valid JSON (${e.message})`;
        continue;
      }

      const result = studyKitZodSchema.safeParse(parsed);
      if (!result.success) {
        lastError = result.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        continue;
      }

      return result.data;
    } catch (e) {
      if (e.code === "TIMEOUT" || e.code === "MISSING_API_KEY") throw e;
      lastError = e.message || String(e);
    }
  }

  const err = new Error(
    `Model did not return a valid study kit after ${MAX_ATTEMPTS} attempts. Last error: ${lastError}`
  );
  err.code = "VALIDATION_FAILED";
  throw err;
}

/**
 * Streaming variant used by /api/study-kit/stream. Yields raw text deltas as
 * they arrive (for the "live typing" effect on the client) and resolves with
 * the same validated result as generateStudyKit once the stream ends. Only
 * makes one attempt - the SSE route falls back to generateStudyKit's
 * retry-with-repair logic if the streamed result fails validation.
 */
export async function* streamStudyKit(prompt) {
  const ai = getClient();
  const stream = await withTimeout(
    ai.models.generateContentStream({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: STUDY_KIT_RESPONSE_SCHEMA,
        temperature: 0.6,
      },
    }),
    REQUEST_TIMEOUT_MS,
    "Gemini stream request"
  );

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.text;
    if (delta) {
      full += delta;
      yield { delta, full };
    }
  }
  return full;
}

export function tryParseStudyKit(rawText) {
  try {
    const parsed = JSON.parse(stripCodeFences(rawText));
    const result = studyKitZodSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export { MODEL };

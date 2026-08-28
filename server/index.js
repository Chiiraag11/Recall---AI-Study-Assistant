import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import {
  buildGenerationPrompt,
  buildRefinementPrompt,
  studyKitZodSchema,
} from "./lib/schema.js";
import {
  generateStudyKit,
  streamStudyKit,
  tryParseStudyKit,
  MODEL,
} from "./lib/gemini.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "200kb" }));

// --- very small in-memory rate limiter (per IP, sliding window) ---------
// Good enough for a demo/internship-assignment server. A real deployment
// would use a shared store (Redis) since this resets on restart and doesn't
// work across multiple server instances.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const hits = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const timestamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests. Try again in a minute." });
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  next();
}

const notesSchema = z.object({
  notes: z.string().trim().min(3, "Give me a bit more to work with.").max(8000),
});

const refineSchema = z.object({
  notes: z.string().trim().min(3).max(8000),
  currentStudyKit: studyKitZodSchema,
  instruction: z.string().trim().min(2).max(500),
});

/** Maps our typed errors to HTTP status + a message safe to show the user. */
function respondWithError(res, err) {
  console.error(err);
  switch (err.code) {
    case "MISSING_API_KEY":
      return res.status(500).json({ error: err.message, code: err.code });
    case "TIMEOUT":
      return res
        .status(504)
        .json({ error: "The model took too long to respond. Please try again.", code: err.code });
    case "VALIDATION_FAILED":
      return res.status(502).json({
        error: "The model kept returning malformed data. Please try again or rephrase your input.",
        code: err.code,
      });
    default:
      return res.status(500).json({ error: "Something went wrong generating your study kit.", code: "UNKNOWN" });
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, model: MODEL, hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// --- non-streaming generation --------------------------------------------
app.post("/api/study-kit", rateLimit, async (req, res) => {
  const parsed = notesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request." });
  }
  try {
    const studyKit = await generateStudyKit(buildGenerationPrompt(parsed.data.notes));
    res.json({ studyKit });
  } catch (err) {
    respondWithError(res, err);
  }
});

// --- streaming generation (SSE) ------------------------------------------
app.post("/api/study-kit/stream", rateLimit, async (req, res) => {
  const parsed = notesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request." });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // NOTE: we listen on `res` (the response), not `req`. `req`'s "close"
  // event fires as soon as the request body has been fully read - which
  // happens almost immediately - not when the client actually disconnects.
  // `res.on("close")` is the correct signal for "the client went away
  // before we finished writing the response".
  let closed = false;
  res.on("close", () => {
    closed = true;
  });

  let fullText = "";
  try {
    const gen = streamStudyKit(buildGenerationPrompt(parsed.data.notes));
    for await (const { delta, full } of gen) {
      if (closed) return;
      fullText = full;
      send("delta", { delta });
    }

    const validated = tryParseStudyKit(fullText);
    if (validated) {
      send("done", { studyKit: validated });
    } else {
      // Streamed output didn't validate (truncation, malformed JSON, etc).
      // Fall back to one non-streaming attempt with retry-and-repair rather
      // than failing the whole request outright.
      try {
        const repaired = await generateStudyKit(buildGenerationPrompt(parsed.data.notes));
        send("done", { studyKit: repaired });
      } catch (err) {
        send("error", { error: err.message || "Streamed response was malformed.", code: err.code || "VALIDATION_FAILED" });
      }
    }
  } catch (err) {
    if (!closed) {
      send("error", { error: err.message || "Stream failed.", code: err.code || "UNKNOWN" });
    }
  } finally {
    if (!closed) res.end();
  }
});

// --- refinement (follow-up edits to an existing kit) ----------------------
app.post("/api/study-kit/refine", rateLimit, async (req, res) => {
  const parsed = refineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request." });
  }
  try {
    const studyKit = await generateStudyKit(buildRefinementPrompt(parsed.data));
    res.json({ studyKit });
  } catch (err) {
    respondWithError(res, err);
  }
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`Study assistant server listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is not set - see server/.env.example");
  }
});

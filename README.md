# Study Assistant

Paste in raw notes (or just a topic name) and get back an interactive study kit:
flashcards you can flip through, a multiple-choice quiz you can retake on just
the questions you got wrong, a checklist of key concepts, and a chart showing
how the material breaks down by sub-topic — all rendered as real, stateful UI
from structured JSON, not a chat transcript.

Built for the Frontend Internship take-home assignment (Study Assistant option).

## Demo

- `npm install && npm start` runs both the client (Vite, `:5173`) and server
  (Express, `:8787`) together.
- Open http://localhost:5173.

## Setup

1. Get a free Gemini API key at https://aistudio.google.com/apikey.
2. Copy the server env file and add your key:
   ```bash
   cp server/.env.example server/.env
   # then edit server/.env and set GEMINI_API_KEY=...
   ```
3. From the repo root:
   ```bash
   npm install
   npm start
   ```
   This installs both workspaces and runs the client + server concurrently.
   The Vite dev server proxies `/api/*` to the Express server, so the browser
   never talks to Gemini directly and the API key never reaches the client.

Run just one side if you need to: `npm run dev:client` / `npm run dev:server`.

Run the (small) unit test suite: `npm run test -w client`.

## Architecture

```
study-assistant/
├── server/              Express proxy — the only thing that holds the API key
│   ├── index.js         Routes: /api/study-kit, /api/study-kit/stream, /api/study-kit/refine
│   └── lib/
│       ├── schema.js     Single source of truth: Gemini responseSchema + zod validator + prompts
│       └── gemini.js     Gemini calls, retry-with-repair, streaming, timeouts
└── client/               Vite + React
    └── src/
        ├── api/          fetch wrappers (JSON + hand-rolled SSE parsing)
        ├── hooks/        useStudyKitGenerator — the state machine for the whole app
        ├── components/   One component per UI concern (deck, quiz, checklist, chart, ...)
        └── lib/          partial JSON parser (streaming preview) + localStorage sessions
```

**Why a backend at all, for a "frontend" assignment?** The assignment requires
the API key not be shipped to the browser. A key embedded in client code is
trivially stealable from the network tab regardless of build tooling, so
there's no purely-frontend way to satisfy that requirement — the proxy is the
minimum viable backend. It's intentionally thin: routing, validation, and
talking to Gemini. All the product logic (rendering, interactivity, state)
lives in the client.

**Why one JSON shape instead of a generic "blocks" array?** I considered a
generic `{ type: "flashcard" | "chart" | ..., data: {...} }[]` block list (the
stretch goal literally suggests this). I went with a fixed multi-field object
(`{ flashcards, quiz, concepts, confidence }`) instead, because for one Study
Kit these blocks aren't interchangeable or repeatable — you always want
exactly one deck, one quiz, one checklist, one chart, each with a different
internal shape. A generic block array would've added a discriminated-union
layer of indirection without buying flexibility I actually needed. I'd revisit
this if a block type became optional/repeatable (e.g. the AI deciding whether
a chart makes sense for the material).

## Handling bad AI output

This is where most of the actual engineering went, per the assignment's own
weighting. Layers, roughly in order of "how often each one fires":

1. **Constrained sampling.** The Gemini call uses `responseMimeType:
   "application/json"` + a `responseSchema` (`server/lib/schema.js`) that
   describes the exact shape expected. This makes malformed output rare, but
   *not impossible* — schemas bias sampling, they don't guarantee it, and
   models can still truncate on `MAX_TOKENS`, omit schema-adjacent fields, or
   pick a `correctIndex` that's out of range.
2. **Real validation, not just `JSON.parse`.** Every response — streamed or
   not — is validated against a `zod` schema before the client ever sees it.
   The `quiz` schema even has a `refine()` check that `correctIndex` actually
   points at a real option, since the JSON Schema type system can't express
   that constraint.
3. **Retry-with-repair.** If validation fails, `generateStudyKit()` retries
   (up to 3 attempts total) and — critically — feeds the *specific validation
   error* back into the next prompt ("your previous attempt was invalid:
   quiz.0.correctIndex: ..."), rather than just resending the same prompt and
   hoping for a different roll.
4. **Streaming has its own fallback.** If the stream finishes but the
   accumulated text doesn't validate (truncation is the common cause), the
   server transparently falls back to one non-streaming retry-with-repair
   attempt before giving up — the client just sees the result arrive a little
   later, not an error.
5. **Every failure mode maps to a specific, honest error message** (missing
   key, timeout, still-invalid-after-retries, rate limited) via an
   `err.code` → HTTP status → user-facing copy mapping in `index.js`, instead
   of a generic "something broke."
6. **Stale responses can't clobber newer ones.** `useStudyKitGenerator`
   aborts the in-flight request (`AbortController`) and bumps a
   `requestIdRef` on every new `generate()` call; stream/promise callbacks
   check that id before touching state. So if you fire a request, then
   immediately fire another, the first one's eventual response — success or
   error — is silently dropped instead of overwriting the second.
7. **Server never crashes on a bad/slow model call.** Every Gemini call is
   wrapped in a timeout (`GEMINI_TIMEOUT_MS`, default 30s) so a hung request
   can't hang the server; errors are always caught and turned into an SSE
   `error` event or a JSON error response, never an unhandled rejection.

## Streaming (stretch)

`/api/study-kit/stream` is hand-rolled Server-Sent Events over `fetch`
(`EventSource` can't send a POST body, so I parse the `event:`/`data:` framing
manually in `studyKitApi.js`). On the client, `partialJsonParser.js` does
best-effort "close any open braces/brackets/strings" recovery on the
accumulated text so far, purely to drive the live preview (flashcards
appearing one at a time as they're drafted). That optimistic parse is **never**
the source of truth — the authoritative result is always the server's fully
validated JSON, sent as a `done` event once the stream ends. There's a small
unit test suite for the parser (`partialJsonParser.test.js`) since it's the
trickiest bit of logic in the app.

## Refinement loop (stretch)

The "Refine this kit" bar sends the *current* study kit + a follow-up
instruction back to the model and asks for the complete updated JSON (see
`buildRefinementPrompt`), rather than a diff — Gemini's structured-output mode
works far more reliably against a fixed schema than trying to constrain a
"here's a patch" format. The prompt explicitly asks the model to keep unchanged
ids stable, which keeps things like flip/check state reasonably intact for
items that weren't touched (this is a soft guarantee, not enforced in code —
see Known limitations).

## Sessions (stretch)

Every successful generation and refinement autosaves to `localStorage`
(`client/src/lib/storage.js`). This is a normal browser app (not a sandboxed
artifact), so `localStorage` is the right tool here — no backend persistence
was needed for a single-user demo. Open the sidebar (☰) to browse/reload/delete
past sessions.

## Other stretch/polish included

- Dark/light theme toggle (defaults to `prefers-color-scheme`, persisted).
- Full keyboard navigation on the flashcard deck (← → to move, space to flip).
- Mobile-first layout — single column, large tap targets, tested at 375px.
- Quiz retest flow: submit → see per-question right/wrong + explanation →
  "retest the N I got wrong" narrows the pool without losing the full quiz.

## AI-usage note

I (the person submitting this) used Claude extensively while building this —
for scaffolding the project structure, writing the majority of the component
and server code, and iterating on the failure-handling design described above.
I reviewed, ran, and debugged everything (including tracking down a real
Node.js gotcha where `req.on("close")` fires as soon as the request body is
read rather than on actual client disconnect — the SSE route was watching the
wrong event and would hang forever; fixed by listening on `res.on("close")`
instead). I can walk through and modify any part of this code.

## Known limitations

- **No auth / no rate limiting beyond a basic per-IP in-memory window** — fine
  for a local demo, not for production multi-instance deployment (the limiter
  resets on restart and doesn't share state across instances).
- **Refinement ids are a soft guarantee.** The prompt asks the model to keep
  unchanged item ids stable, but nothing enforces it in code — a large
  rewrite instruction could shuffle ids and reset flip/check UI state for
  items that "look" unchanged to a human.
- **No test coverage for the server or React components** — only the
  streaming JSON parser has unit tests (it's the highest-risk pure logic in
  the app; the rest is mostly integration-shaped and would benefit more from
  e.g. Playwright than unit tests, which I didn't have time to add).
- **Single in-memory Gemini client** — fine for one server process; a
  serverless deployment would want to confirm cold-start behavior of the
  `@google/genai` client.
- **Chart/concepts/quiz counts are model-chosen within schema-enforced
  ranges** (e.g. 5–10 quiz questions) rather than user-configurable.
- Model name is pinned via `GEMINI_MODEL` (default `gemini-2.5-flash`) since
  Google's free-tier model lineup has changed multiple times recently; check
  https://ai.google.dev if the default stops working.

## Time spent

~8 hours: schema/prompt design and failure-handling (server) ~3h,
component/state architecture (client) ~2.5h, streaming + partial-JSON parsing
~1h, styling/responsive/polish ~1h, testing and README ~0.5h.

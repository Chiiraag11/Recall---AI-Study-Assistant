import { z } from "zod";

/**
 * This is the single source of truth for the shape of a "Study Kit".
 *
 * It exists in two forms on purpose:
 *  1. STUDY_KIT_RESPONSE_SCHEMA - Gemini's `responseSchema` config (a subset
 *     of OpenAPI/JSON Schema). This constrains the *sampling* of the model
 *     so it is heavily biased towards emitting well-formed JSON in this shape.
 *  2. studyKitZodSchema - a runtime validator. `responseSchema` makes bad
 *     output much rarer, but it is not a guarantee (models can still omit
 *     required-looking fields, return empty arrays, truncate on MAX_TOKENS,
 *     etc). Nothing gets sent to the client unless it passes this check.
 */

export const STUDY_KIT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    topic: {
      type: "string",
      description: "A short (3-6 word) title for what this study kit covers.",
    },
    summary: {
      type: "string",
      description: "One or two sentence plain-language summary of the material.",
    },
    flashcards: {
      type: "array",
      minItems: 6,
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Short unique id, e.g. 'fc1'." },
          front: { type: "string", description: "The question or term." },
          back: { type: "string", description: "The answer or definition." },
        },
        required: ["id", "front", "back"],
      },
    },
    quiz: {
      type: "array",
      minItems: 5,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Short unique id, e.g. 'q1'." },
          question: { type: "string" },
          options: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
          correctIndex: {
            type: "integer",
            description: "Zero-based index into `options` of the correct answer.",
          },
          explanation: {
            type: "string",
            description: "One sentence on why the correct answer is correct.",
          },
        },
        required: ["id", "question", "options", "correctIndex", "explanation"],
      },
    },
    concepts: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Short unique id, e.g. 'c1'." },
          label: { type: "string", description: "A key concept the learner should be able to explain." },
        },
        required: ["id", "label"],
      },
    },
    confidence: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      description: "A rough breakdown of sub-topics and how much material/difficulty each represents, for a bar chart.",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          score: {
            type: "integer",
            description: "0-100, roughly how much relative weight/difficulty this sub-topic carries.",
          },
        },
        required: ["topic", "score"],
      },
    },
  },
  required: ["topic", "summary", "flashcards", "quiz", "concepts", "confidence"],
};

const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
});

const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(3).max(6),
    correctIndex: z.number().int(),
    explanation: z.string().min(1),
  })
  .refine((q) => q.correctIndex >= 0 && q.correctIndex < q.options.length, {
    message: "correctIndex must point at a real option",
    path: ["correctIndex"],
  });

const conceptSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const confidenceSchema = z.object({
  topic: z.string().min(1),
  score: z.number().min(0).max(100),
});

export const studyKitZodSchema = z.object({
  topic: z.string().min(1),
  summary: z.string().min(1),
  flashcards: z.array(flashcardSchema).min(1),
  quiz: z.array(quizQuestionSchema).min(1),
  concepts: z.array(conceptSchema).min(1),
  confidence: z.array(confidenceSchema).min(1),
});

export const SYSTEM_INSTRUCTION = `You are a study-kit generator embedded in a web app.
Given a student's raw notes or a topic name, produce a complete study kit as JSON.

Rules:
- Write flashcards that test recall of specific facts/definitions, not vague generalities.
- Quiz questions must have exactly one unambiguously correct option.
- "concepts" are the checklist of things a learner should be able to explain from memory.
- "confidence" sub-topics should roughly partition the material (they don't need to sum to 100).
- Base everything on the provided material. If the input is a bare topic name rather than
  detailed notes, use your own knowledge of that topic.
- Never include markdown, backticks, or commentary outside the JSON structure.
- Keep language concise and student-friendly.`;

export function buildGenerationPrompt(notes) {
  return `Generate a study kit from the following material:\n\n"""\n${notes}\n"""`;
}

export function buildRefinementPrompt({ notes, currentStudyKit, instruction }) {
  return `The learner already has this study kit (as JSON):\n\n${JSON.stringify(
    currentStudyKit
  )}\n\nIt was originally generated from this source material:\n\n"""\n${notes}\n"""\n\nApply this change and return the COMPLETE, updated study kit as JSON in the same shape (not a diff, not just the changed part): "${instruction}"\n\nKeep everything that wasn't affected by the instruction the same, including ids where the item is unchanged. Only add new ids for genuinely new items.`;
}

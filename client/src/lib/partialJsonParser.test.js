import { describe, it, expect } from "vitest";
import { tryParsePartialJson, extractPartialArrays } from "./partialJsonParser";

describe("tryParsePartialJson", () => {
  it("parses complete JSON normally", () => {
    expect(tryParsePartialJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("closes a truncated top-level object", () => {
    expect(tryParsePartialJson('{"a":1,"b":2')).toEqual({ a: 1, b: 2 });
  });

  it("closes an array truncated mid-element", () => {
    const result = tryParsePartialJson('{"flashcards":[{"front":"Q1","back":"A1"},{"front":"Q2"');
    expect(result.flashcards[0]).toEqual({ front: "Q1", back: "A1" });
    // second element is incomplete but still recoverable as an object
    expect(result.flashcards[1].front).toBe("Q2");
  });

  it("closes a string left open at the very end", () => {
    expect(tryParsePartialJson('{"topic":"Photo')).toEqual({ topic: "Photo" });
  });

  it("returns null for garbage that can't be recovered", () => {
    expect(tryParsePartialJson("not json at all }}}")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(tryParsePartialJson("")).toBeNull();
    expect(tryParsePartialJson(undefined)).toBeNull();
  });

  it("handles a dangling comma before truncation", () => {
    expect(tryParsePartialJson('{"a":1,')).toEqual({ a: 1 });
  });
});

describe("extractPartialArrays", () => {
  it("returns empty arrays when nothing parses yet", () => {
    expect(extractPartialArrays("{")).toEqual({
      flashcards: [],
      quiz: [],
      concepts: [],
      confidence: [],
    });
  });

  it("pulls out whatever arrays are present", () => {
    const text = '{"flashcards":[{"id":"1","front":"Q","back":"A"}],"quiz":[';
    const result = extractPartialArrays(text);
    expect(result.flashcards).toHaveLength(1);
    expect(result.quiz).toEqual([]);
  });
});

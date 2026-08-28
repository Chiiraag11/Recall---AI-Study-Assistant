import { useState } from "react";

const QUICK_ACTIONS = [
  "Add 3 more flashcards",
  "Make the quiz harder",
  "Simplify the language",
  "Add a concept I'm missing about edge cases",
];

export default function RefinementBar({ onRefine, isRefining, error }) {
  const [text, setText] = useState("");

  const submit = (instruction) => {
    const trimmed = instruction.trim();
    if (!trimmed || isRefining) return;
    onRefine(trimmed);
    setText("");
  };

  return (
    <div className="refinement-bar">
      <h3 className="section-title">Refine this kit</h3>
      <div className="refinement-bar__quick">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            className="chip"
            disabled={isRefining}
            onClick={() => submit(action)}
          >
            {action}
          </button>
        ))}
      </div>
      <form
        className="refinement-bar__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <input
          type="text"
          placeholder="e.g. 'Add flashcards about the light-independent reactions too'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRefining}
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={isRefining || !text.trim()}>
          {isRefining ? "Applying…" : "Apply"}
        </button>
      </form>
      {error && <p className="refinement-bar__error">{error}</p>}
      <p className="refinement-bar__note">
        This edits the existing kit in place instead of starting over — ids for unchanged items stay the same.
      </p>
    </div>
  );
}

import { useState } from "react";

const EXAMPLES = [
  {
    label: "Cell biology",
    text: "Mitochondria are the powerhouse of the cell, generating ATP via oxidative phosphorylation. They have a double membrane, their own circular DNA, and are believed to have originated from an endosymbiotic relationship with ancient bacteria. The inner membrane is folded into cristae to increase surface area for the electron transport chain.",
  },
  {
    label: "Just a topic",
    text: "The French Revolution",
  },
  {
    label: "React hooks",
    text: "useState returns a stateful value and a setter, triggering a re-render when updated. useEffect runs side effects after render and can clean up via a returned function. useMemo and useCallback memoize values/functions between renders to avoid unnecessary recomputation, based on a dependency array.",
  },
];

const MAX_LENGTH = 8000;

export default function InputPanel({ onSubmit, disabled, streaming, onStreamingChange }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  const useExample = (example) => {
    setText(example.text);
  };

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <label htmlFor="notes" className="input-panel__label">
        Paste your notes, or just name a topic
      </label>
      <textarea
        id="notes"
        className="input-panel__textarea"
        placeholder="e.g. Paste your lecture notes, a textbook paragraph, or just type a topic like 'the Krebs cycle'..."
        value={text}
        maxLength={MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        rows={6}
      />
      <div className="input-panel__meta">
        <span className={text.length > MAX_LENGTH * 0.9 ? "input-panel__count input-panel__count--warn" : "input-panel__count"}>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="input-panel__examples">
        <span className="input-panel__examples-label">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex.label}
            className="chip"
            onClick={() => useExample(ex)}
            disabled={disabled}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="input-panel__footer">
        <label className="toggle">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => onStreamingChange(e.target.checked)}
            disabled={disabled}
          />
          <span>Stream response</span>
        </label>
        <button type="submit" className="btn btn--primary" disabled={disabled || !text.trim()}>
          {disabled ? "Generating…" : "Generate study kit"}
        </button>
      </div>
    </form>
  );
}

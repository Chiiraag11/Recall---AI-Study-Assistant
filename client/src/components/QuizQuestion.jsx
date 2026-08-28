export default function QuizQuestion({ question, index, selectedIndex, submitted, onSelect }) {
  return (
    <fieldset className="quiz-question" disabled={submitted}>
      <legend className="quiz-question__prompt">
        {index + 1}. {question.question}
      </legend>
      <div className="quiz-question__options">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === question.correctIndex;
          let stateClass = "";
          if (submitted) {
            if (isCorrect) stateClass = "quiz-option--correct";
            else if (isSelected && !isCorrect) stateClass = "quiz-option--incorrect";
          } else if (isSelected) {
            stateClass = "quiz-option--selected";
          }
          return (
            <label key={i} className={`quiz-option ${stateClass}`}>
              <input
                type="radio"
                name={question.id}
                checked={isSelected}
                onChange={() => onSelect(i)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {submitted && (
        <p className={`quiz-question__explanation ${selectedIndex === question.correctIndex ? "is-correct" : "is-incorrect"}`}>
          {selectedIndex === question.correctIndex ? "✓ Correct. " : "✗ Not quite. "}
          {question.explanation}
        </p>
      )}
    </fieldset>
  );
}

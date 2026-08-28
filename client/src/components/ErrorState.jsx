export default function ErrorState({ message, onRetry, onStartOver }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">⚠️</div>
      <h3 className="error-state__title">That didn't work</h3>
      <p className="error-state__message">{message}</p>
      <div className="error-state__actions">
        <button className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
        <button className="btn btn--ghost" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </div>
  );
}

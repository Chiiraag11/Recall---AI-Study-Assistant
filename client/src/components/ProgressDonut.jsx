import { Check } from "lucide-react";

export default function ProgressDonut({
  percentage = 0,
}) {
  const value = Math.max(
    0,
    Math.min(100, Number(percentage) || 0)
  );

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (value / 100) * circumference;

  const complete = value >= 100;

  return (
    <div
      className={`progress-donut ${
        complete
          ? "progress-donut--complete"
          : ""
      }`}
    >
      <svg
        className="progress-donut__svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Study progress: ${Math.round(
          value
        )} percent complete`}
      >
        <circle
          className="progress-donut__track"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
        />

        <circle
          className="progress-donut__value"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>

      <div className="progress-donut__center">
        {complete ? (
          <div className="progress-donut__complete-icon">
            <Check
              size={16}
              strokeWidth={2.5}
            />
          </div>
        ) : (
          <span className="progress-donut__percentage">
            {Math.round(value)}%
          </span>
        )}

        <span className="progress-donut__label">
          {complete
            ? "Complete"
            : "Complete"}
        </span>
      </div>
    </div>
  );
}
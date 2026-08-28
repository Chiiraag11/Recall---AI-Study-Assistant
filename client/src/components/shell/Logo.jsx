export default function Logo({ size = "default" }) {
  return (
    <div className={`logo logo--${size}`}>
      <span className="logo__mark" aria-hidden="true">R</span>
      <span className="logo__word">Recall - AI Study</span>
    </div>
  );
}

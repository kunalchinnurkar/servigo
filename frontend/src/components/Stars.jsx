export default function Stars({ value, onChange, count = 0 }) {
  const interactive = typeof onChange === "function";
  const rounded = Math.round(value || 0);

  return (
    <span className="stars" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange(n) : undefined}
          style={{ cursor: interactive ? "pointer" : "default" }}
          aria-hidden="true"
        >
          {n <= rounded ? "\u2605" : "\u2606"}
        </span>
      ))}
      {!interactive && value != null && (
        <span className="muted" style={{ marginLeft: 6 }}>
          {value.toFixed(1)} ({count})
        </span>
      )}
      {!interactive && value == null && (
        <span className="muted" style={{ marginLeft: 6 }}>
          No ratings yet
        </span>
      )}
    </span>
  );
}

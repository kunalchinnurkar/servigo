const LABELS = {
  available: "Available now",
  busy: "Not available",
  pending: "Waiting for provider",
  accepted: "On the way",
  completed: "Completed",
  rejected: "Declined",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" />
      {LABELS[status] || status}
    </span>
  );
}

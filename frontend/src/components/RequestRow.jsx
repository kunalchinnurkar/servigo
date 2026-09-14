import { useState } from "react";
import StatusBadge from "./StatusBadge";
import Stars from "./Stars";

export default function RequestRow({ req, role, onAccept, onReject, onComplete, onRate }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [rating_open, setRatingOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setBusy(true);
    try {
      await fn(req.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="directory-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="directory-row__name">
            {role === "customer" ? req.provider_name : req.customer_name}
          </div>
          <div className="directory-row__meta">
            <span className="tag">{req.service}</span>
            <span className="muted">{new Date(req.created_at).toLocaleString()}</span>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {role === "customer" && req.status === "accepted" && req.provider_phone && (
        <p className="muted" style={{ margin: "8px 0 0" }}>
          Contact: {req.provider_phone}
        </p>
      )}

      {role === "provider" && req.status === "pending" && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn--primary btn--small" disabled={busy} onClick={() => run(onAccept)}>
            Accept
          </button>
          <button className="btn btn--danger btn--small" disabled={busy} onClick={() => run(onReject)}>
            Decline
          </button>
        </div>
      )}

      {role === "provider" && req.status === "accepted" && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn--primary btn--small" disabled={busy} onClick={() => run(onComplete)}>
            Mark completed
          </button>
        </div>
      )}

      {role === "customer" && req.status === "completed" && req.rating == null && !rating_open && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn--ghost btn--small" onClick={() => setRatingOpen(true)}>
            Rate this service
          </button>
        </div>
      )}

      {role === "customer" && req.status === "completed" && req.rating == null && rating_open && (
        <div className="stack" style={{ marginTop: 10 }}>
          <Stars value={rating} onChange={setRating} />
          <textarea
            placeholder="How did it go? (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <div className="row">
            <button
              className="btn btn--accent btn--small"
              disabled={!rating || busy}
              onClick={() => run(() => onRate(req.id, rating, review))}
            >
              Submit rating
            </button>
            <button className="btn btn--ghost btn--small" onClick={() => setRatingOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {role === "customer" && req.rating != null && (
        <div style={{ marginTop: 10 }}>
          <Stars value={req.rating} count={1} />
        </div>
      )}
    </div>
  );
}

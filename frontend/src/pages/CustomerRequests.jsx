import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api";
import RequestRow from "../components/RequestRow";

export default function CustomerRequests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get("/requests/mine");
      setRequests(res.data.requests);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function rate(id, rating, review) {
    try {
      await api.post(`/requests/${id}/rate`, { rating, review });
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <h1>Your requests</h1>
      <p>Everything you've asked ServiGo providers for, and where it stands.</p>
      {error && <p className="error-text">{error}</p>}
      <div className="panel">
        {requests === null && <div className="empty-state">Loading...</div>}
        {requests?.length === 0 && (
          <div className="empty-state">You haven't sent any requests yet.</div>
        )}
        {requests?.length > 0 && (
          <div className="directory">
            {requests.map((r) => (
              <RequestRow key={r.id} req={r} role="customer" onRate={rate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

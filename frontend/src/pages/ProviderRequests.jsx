import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api";
import RequestRow from "../components/RequestRow";

export default function ProviderRequests() {
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

  return (
    <div className="page">
      <h1>Incoming requests</h1>
      <p>Customers who've asked for your help, most recent first.</p>
      {error && <p className="error-text">{error}</p>}
      <div className="panel">
        {requests === null && <div className="empty-state">Loading...</div>}
        {requests?.length === 0 && (
          <div className="empty-state">
            No requests yet — make sure you're marked available so customers can find you.
          </div>
        )}
        {requests?.length > 0 && (
          <div className="directory">
            {requests.map((r) => (
              <RequestRow
                key={r.id}
                req={r}
                role="provider"
                onAccept={async (id) => {
                  try {
                    await api.put(`/requests/${id}/accept`);
                    load();
                  } catch (err) {
                    setError(apiErrorMessage(err));
                  }
                }}
                onReject={async (id) => {
                  try {
                    await api.put(`/requests/${id}/reject`);
                    load();
                  } catch (err) {
                    setError(apiErrorMessage(err));
                  }
                }}
                onComplete={async (id) => {
                  try {
                    await api.put(`/requests/${id}/complete`);
                    load();
                  } catch (err) {
                    setError(apiErrorMessage(err));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

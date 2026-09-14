import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api";
import MapView from "../components/MapView";
import ProviderRow from "../components/ProviderRow";

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState("");
  const [radiusKm, setRadiusKm] = useState(15);
  const [location, setLocation] = useState(null);
  const [locateError, setLocateError] = useState("");
  const [providers, setProviders] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    api.get("/services").then((res) => {
      setServices(res.data.services);
      if (res.data.services.length) setService(res.data.services[0].name);
    });
  }, []);

  function useMyLocation() {
    setLocateError("");
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support geolocation - using Pune as a default.");
      setLocation(PUNE_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocateError("Couldn't get your location - using Pune as a default.");
        setLocation(PUNE_CENTER);
      },
      { timeout: 8000 }
    );
  }

  async function search(e) {
    e?.preventDefault();
    if (!location) {
      setLocateError("Share your location first so we can find providers near you.");
      return;
    }
    setSearching(true);
    setSearchError("");
    setConfirmation("");
    try {
      const res = await api.get("/providers/nearby", {
        params: { service, lat: location.lat, lng: location.lng, radius_km: radiusKm },
      });
      setProviders(res.data.providers);
    } catch (err) {
      setSearchError(apiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  async function requestService(provider) {
    setRequestingId(provider.id);
    setConfirmation("");
    setSearchError("");
    try {
      await api.post("/requests", {
        provider_id: provider.id,
        service,
        location,
      });
      setConfirmation(`Request sent to ${provider.name}. Track it under "Requests".`);
      setProviders((list) => list.filter((p) => p.id !== provider.id));
    } catch (err) {
      setSearchError(apiErrorMessage(err));
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="page">
      <h1>Find someone nearby, right now</h1>
      <p>Pick what you need and share your location — we'll only show providers who are free today.</p>

      <div className="two-col">
        <form className="panel" onSubmit={search}>
          <h2>What do you need?</h2>
          <div className="field">
            <label>Service</label>
            <div className="chip-picker">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={"chip" + (service === s.name ? " is-selected" : "")}
                  onClick={() => setService(s.name)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Your location</label>
            <button type="button" className="btn btn--ghost btn--full" onClick={useMyLocation}>
              {location ? "Update my current location" : "Use my current location"}
            </button>
            {location && (
              <p className="muted" style={{ marginTop: 6 }}>
                Using {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
            {locateError && <p className="error-text">{locateError}</p>}
          </div>

          <div className="field">
            <label htmlFor="radius">Search radius: {radiusKm} km</label>
            <input
              id="radius"
              type="range"
              min="2"
              max="40"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </div>

          <button className="btn btn--primary btn--full" type="submit" disabled={searching || !service}>
            {searching ? "Searching..." : "Find providers"}
          </button>
        </form>

        <div>
          {location && (
            <MapView center={[location.lat, location.lng]} providers={providers || []} />
          )}

          {confirmation && (
            <div className="panel" style={{ background: "var(--teal-wash)", borderColor: "var(--teal)" }}>
              {confirmation}
            </div>
          )}
          {searchError && <p className="error-text">{searchError}</p>}

          <div className="panel">
            <div className="panel__header">
              <h2>Nearby providers</h2>
              {providers && <span className="muted">{providers.length} found</span>}
            </div>
            {providers === null && (
              <div className="empty-state">Search to see who's available near you.</div>
            )}
            {providers?.length === 0 && (
              <div className="empty-state">
                No one's available for {service} within {radiusKm} km right now — try a
                wider radius.
              </div>
            )}
            {providers?.length > 0 && (
              <div className="directory">
                {providers.map((p) => (
                  <ProviderRow
                    key={p.id}
                    provider={p}
                    onRequest={requestService}
                    requesting={requestingId === p.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

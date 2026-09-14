import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../api";
import MapView from "../components/MapView";
import StatusBadge from "../components/StatusBadge";
import Stars from "../components/Stars";

export default function ProviderDashboard() {
  const [catalog, setCatalog] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ services: [], bio: "", address_text: "", location: null });
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  useEffect(() => {
    api.get("/services").then((res) => setCatalog(res.data.services));
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/providers/me");
      setProfile(res.data.profile);
      setForm({
        services: res.data.profile.services,
        bio: res.data.profile.bio,
        address_text: res.data.profile.address_text,
        location: res.data.profile.location,
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  function toggleService(name) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(name)
        ? f.services.filter((s) => s !== name)
        : [...f.services, name],
    }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({ ...f, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const res = await api.put("/providers/me", form);
      setProfile(res.data.profile);
      setSavedMsg("Profile saved.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    setTogglingAvail(true);
    try {
      const res = await api.put("/providers/me/availability", { available: !profile.available });
      setProfile(res.data.profile);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setTogglingAvail(false);
    }
  }

  if (!profile) {
    return (
      <div className="page">
        {error ? <p className="error-text">{error}</p> : <p className="muted">Loading your profile...</p>}
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your ServiGo profile</h1>
      <p>Customers only see you in search results while you're marked available.</p>

      <div className="panel row" style={{ justifyContent: "space-between" }}>
        <div>
          <StatusBadge status={profile.available ? "available" : "busy"} />
          <div className="muted" style={{ marginTop: 4 }}>
            <Stars value={profile.rating_avg} count={profile.rating_count} />
          </div>
        </div>
        <button
          className={"btn " + (profile.available ? "btn--danger" : "btn--accent")}
          onClick={toggleAvailability}
          disabled={togglingAvail}
        >
          {profile.available ? "Go unavailable" : "Go available"}
        </button>
      </div>

      <form className="panel" onSubmit={save}>
        <h2>Your details</h2>
        {error && <p className="error-text">{error}</p>}
        {savedMsg && <p className="muted">{savedMsg}</p>}

        <div className="field">
          <label>Services you offer</label>
          <div className="chip-picker">
            {catalog.map((s) => (
              <button
                type="button"
                key={s.id}
                className={"chip" + (form.services.includes(s.name) ? " is-selected" : "")}
                onClick={() => toggleService(s.name)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="bio">Short bio</label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Years of experience, specialities, anything customers should know."
          />
        </div>

        <div className="field">
          <label htmlFor="address">Area / neighbourhood</label>
          <input
            id="address"
            value={form.address_text}
            onChange={(e) => setForm((f) => ({ ...f, address_text: e.target.value }))}
            placeholder="e.g. Kothrud, Pune"
          />
        </div>

        <div className="field">
          <label>Your working location</label>
          <button type="button" className="btn btn--ghost btn--full" onClick={useMyLocation}>
            {form.location ? "Update my location" : "Set my current location"}
          </button>
          {form.location && (
            <p className="muted" style={{ marginTop: 6 }}>
              {form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {form.location && <MapView center={[form.location.lat, form.location.lng]} providers={[]} />}

        <button className="btn btn--primary btn--full" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}

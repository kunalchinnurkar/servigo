import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "provider" ? "provider" : "customer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === "provider" ? "/provider" : "/customer");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="split">
      <div className="split__brand">
        <h1>Join ServiGo.</h1>
        <p>
          As a customer you can find nearby help in minutes. As a provider, you decide
          when you're available and only get requests you can actually take.
        </p>
      </div>
      <div className="split__form">
        <form className="panel" style={{ width: "100%", maxWidth: 420 }} onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <div className="field">
            <label>I am a...</label>
            <div className="chip-picker">
              <button
                type="button"
                className={"chip" + (role === "customer" ? " is-selected" : "")}
                onClick={() => setRole("customer")}
              >
                Customer, looking for help
              </button>
              <button
                type="button"
                className={"chip" + (role === "provider" ? " is-selected" : "")}
                onClick={() => setRole("provider")}
              >
                Service provider
              </button>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <button className="btn btn--primary btn--full" disabled={busy} type="submit">
            {busy ? "Creating account..." : "Create account"}
          </button>
          <p className="muted" style={{ marginTop: 16 }}>
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

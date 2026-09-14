import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
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
        <h1>Welcome back.</h1>
        <p>Log in to see nearby requests, manage availability, or find help fast.</p>
      </div>
      <div className="split__form">
        <form className="panel" style={{ width: "100%", maxWidth: 380 }} onSubmit={handleSubmit}>
          <h2>Log in</h2>
          {error && <p className="error-text">{error}</p>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn--primary btn--full" disabled={busy} type="submit">
            {busy ? "Logging in..." : "Log in"}
          </button>
          <p className="muted" style={{ marginTop: 16 }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
          <p className="muted" style={{ marginTop: 8 }}>
            Demo: <code>customer@servigo.demo</code> or <code>ramesh.plumber@servigo.demo</code>,
            password <code>password123</code>
          </p>
        </form>
      </div>
    </div>
  );
}

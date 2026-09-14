import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="split">
      <div className="split__brand">
        <span className="muted" style={{ color: "#a9c9bd" }}>
          Local Service Discovery &amp; Availability
        </span>
        <h1>Someone nearby is free to help, right now.</h1>
        <p>
          ServiGo connects you with plumbers, electricians, carpenters and other local
          workers who are actually available today — not just listed. See who's close,
          check their rating, and send a request in a couple of taps.
        </p>
        <div className="row" style={{ marginTop: 8 }}>
          <Link to="/register?role=customer" className="btn btn--accent">
            I need a service
          </Link>
          <Link to="/register?role=provider" className="btn btn--ghost" style={{ color: "#f6f4ea", borderColor: "#3f6a5f" }}>
            I offer a service
          </Link>
        </div>
        <p className="muted" style={{ color: "#8fb3a5", marginTop: 24 }}>
          Already have an account? <Link to="/login" style={{ color: "#f6f4ea" }}>Log in</Link>
        </p>
      </div>
      <div className="split__form">
        <div className="stack" style={{ maxWidth: 360 }}>
          <h2>How it works</h2>
          <div className="stack">
            <div>
              <strong>1. Pick a service &amp; share your location.</strong>
              <p>Tell us what you need — plumbing, electrical, cleaning — and where.</p>
            </div>
            <div>
              <strong>2. See who's nearby and free.</strong>
              <p>We only show providers who've marked themselves available right now.</p>
            </div>
            <div>
              <strong>3. Send a request, get it done, rate it.</strong>
              <p>The provider accepts, does the job, and you leave a rating for others.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

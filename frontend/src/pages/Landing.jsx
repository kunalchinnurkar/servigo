import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";

const CATEGORIES = [
  { emoji: "🔧", label: "Plumbing" },
  { emoji: "⚡", label: "Electrical" },
  { emoji: "🪚", label: "Carpentry" },
  { emoji: "🧹", label: "Cleaning" },
  { emoji: "🎨", label: "Painting" },
  { emoji: "🌿", label: "Gardening" },
];

const STEPS = [
  {
    icon: "📍",
    title: "Pick a service & share your location",
    body: "Tell us what you need — plumbing, electrical, cleaning — and where you are.",
  },
  {
    icon: "🟢",
    title: "See who's nearby and free",
    body: "We only show providers who've marked themselves available right now, ranked by distance and rating.",
  },
  {
    icon: "✅",
    title: "Send a request, get it done, rate it",
    body: "The provider accepts, does the job, and you leave a rating so the next person knows too.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Had a burst pipe on a Sunday night. Found someone available in six minutes.",
    name: "Amara O.",
    role: "Customer · Lagos",
    color: "#146356",
  },
  {
    quote: "I go available on my drive home and jobs are already waiting by the time I park.",
    name: "Diego R.",
    role: "Electrician · Provider",
    color: "#dd9b1f",
  },
  {
    quote: "No more calling five people who never pick up. ServiGo just shows who's actually free.",
    name: "Priya N.",
    role: "Customer · Pune",
    color: "#b54b3a",
  },
];

const STATS = [
  { number: "2,400+", label: "Verified providers" },
  { number: "18 min", label: "Avg. response time" },
  { number: "35+", label: "Cities covered" },
  { number: "4.8★", label: "Average rating" },
];

export default function Landing() {
  return (
    <div>
      <header className="topbar">
        <Link to="/" className="topbar__brand">
          ServiGo
        </Link>
        <div className="topbar__actions">
          <Link to="/login" className="btn btn--ghost btn--small">
            Log in
          </Link>
          <Link to="/register" className="btn btn--primary btn--small">
            Get started
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__inner">
          <div>
            <span className="hero__eyebrow">🟢 Live availability, not just listings</span>
            <h1>Someone nearby is free to help, right now.</h1>
            <p className="hero__lead">
              ServiGo connects you with plumbers, electricians, carpenters and other local
              workers who are actually available today. See who's close, check their rating,
              and send a request in a couple of taps.
            </p>
            <div className="hero__ctas">
              <Link to="/register?role=customer" className="btn btn--accent">
                I need a service
              </Link>
              <Link
                to="/register?role=provider"
                className="btn btn--ghost"
                style={{ color: "#f6f4ea", borderColor: "#3f6a5f" }}
              >
                I offer a service
              </Link>
            </div>
            <p className="hero__login">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>

          <div className="hero__mock">
            <div className="mock-card">
              <div className="mock-card__header">
                <span className="mock-card__title">Plumbers near you</span>
                <span className="mock-card__live">
                  <span className="pulse-dot" /> Live
                </span>
              </div>
              <div className="mock-row">
                <span className="mock-avatar" style={{ background: "#146356" }}>
                  RK
                </span>
                <div>
                  <div className="mock-row__name">Ravi K.</div>
                  <div className="mock-row__meta">0.4 km · ★ 4.9 · Available now</div>
                </div>
              </div>
              <div className="mock-row">
                <span className="mock-avatar" style={{ background: "#dd9b1f" }}>
                  SM
                </span>
                <div>
                  <div className="mock-row__name">Sara M.</div>
                  <div className="mock-row__meta">0.9 km · ★ 4.7 · Available now</div>
                </div>
              </div>
              <div className="mock-row">
                <span className="mock-avatar" style={{ background: "#b54b3a" }}>
                  JT
                </span>
                <div>
                  <div className="mock-row__name">Jon T.</div>
                  <div className="mock-row__meta">1.6 km · ★ 4.8 · Available now</div>
                </div>
              </div>
              <div className="mock-card__floaty">⚡ Request sent!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="stats-strip">
        <div className="stats-strip__inner">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="stat">
                <div className="stat__number">{s.number}</div>
                <div className="stat__label">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="section">
        <Reveal as="div" className="section__heading">
          <span className="muted">What people book</span>
          <h2>A helper for whatever's broken, dirty, or overdue</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="categories">
            {CATEGORIES.map((c) => (
              <span className="category-chip" key={c.label}>
                <span className="category-chip__emoji">{c.emoji}</span>
                {c.label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section">
        <Reveal as="div" className="section__heading">
          <span className="muted">How it works</span>
          <h2>Three steps, usually under twenty minutes</h2>
        </Reveal>
        <div className="steps">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="step hover-lift">
                <span className="step__num">0{i + 1}</span>
                <div className="step__icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="section">
        <Reveal as="div" className="section__heading">
          <span className="muted">Word on the street</span>
          <h2>People who stopped calling around</h2>
        </Reveal>
        <div className="testimonials">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <div className="testimonial hover-lift">
                <p className="testimonial__quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial__person">
                  <span className="testimonial__avatar" style={{ background: t.color }}>
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <div className="testimonial__name">{t.name}</div>
                    <div className="testimonial__role">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <Reveal>
        <section className="cta-banner">
          <h2>Ready to stop waiting around?</h2>
          <p>Join as a customer to get help fast, or as a provider to fill your schedule.</p>
          <div className="cta-banner__ctas">
            <Link to="/register?role=customer" className="btn btn--accent">
              I need a service
            </Link>
            <Link
              to="/register?role=provider"
              className="btn btn--ghost"
              style={{ color: "#f6f4ea", borderColor: "#3f6a5f" }}
            >
              I offer a service
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="site-footer">© {new Date().getFullYear()} ServiGo. Built for local, live help.</footer>
    </div>
  );
}

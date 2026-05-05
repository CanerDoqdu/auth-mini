import Link from "next/link";

const stats = [
  { value: "3 days", label: "JWT session window" },
  { value: "1 route", label: "Protected profile flow" },
  { value: "0 lag", label: "Pointer-tracking rerenders removed" },
];

const highlights = [
  {
    title: "Faster path to profile",
    description:
      "Signup and login both establish the session and send users straight into the protected area.",
  },
  {
    title: "Centralized auth behavior",
    description:
      "Cookie settings, JWT signing, and token verification live in one place so route behavior stays consistent.",
  },
  {
    title: "Server-rendered confidence",
    description:
      "The home and profile surfaces avoid unnecessary client work while keeping the current dark luxury theme intact.",
  },
];

const features = [
  {
    title: "Cookie-backed sessions",
    description:
      "HttpOnly cookies and shared JWT helpers keep login, logout, and session validation aligned.",
  },
  {
    title: "MongoDB-ready plumbing",
    description:
      "Connection reuse avoids repeated setup work while still failing loudly when configuration is missing.",
  },
  {
    title: "Responsive presentation",
    description:
      "A balanced hero, proof blocks, and CTA stack cleanly across mobile, tablet, and desktop widths.",
  },
  {
    title: "Focused interactions",
    description:
      "Subtle motion and hover states add polish without the heavy pointer listeners that made the previous page feel sluggish.",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <div aria-hidden="true" className="home-backdrop">
        <div className="backdrop-orb backdrop-orb-gold" />
        <div className="backdrop-orb backdrop-orb-light" />
        <div className="backdrop-grid" />
      </div>

      <header className="site-header">
        <div className="site-shell site-header-inner">
          <Link className="brand-mark" href="/">
            Auth Mini
          </Link>

          <nav className="site-nav">
            <Link className="site-nav-link" href="/login">
              Login
            </Link>
            <Link className="site-nav-button" href="/signup">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="site-shell hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">Production-minded authentication starter</p>
            <h1>
              Secure auth flows with a landing hero that finally feels fast and
              credible.
            </h1>
            <p className="hero-text">
              Auth Mini keeps the existing dark-and-gold identity while trimming
              wasted work from the auth stack and replacing the homepage with a
              calmer, more professional presentation.
            </p>

            <div className="hero-actions">
              <Link className="hero-primary" href="/signup">
                Start with signup
              </Link>
              <Link className="hero-secondary" href="/login">
                I already have an account
              </Link>
            </div>

            <dl className="hero-stats">
              {stats.map((stat) => (
                <div className="hero-stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero-preview">
            <div className="preview-window">
              <div className="preview-window-bar">
                <span />
                <span />
                <span />
              </div>

              <div className="preview-panel">
                <div>
                  <p className="preview-label">Session state</p>
                  <h2>Profile access unlocked</h2>
                </div>
                <span className="preview-badge">JWT active</span>
              </div>

              <div className="preview-card">
                <p className="preview-card-label">Latest improvements</p>
                <ul className="preview-list">
                  <li>Shared cookie and token helpers</li>
                  <li>Server-rendered profile lookup</li>
                  <li>Reduced client-side rendering load</li>
                </ul>
              </div>

              <div className="preview-card preview-card-accent">
                <p className="preview-card-label">What users feel</p>
                <p className="preview-quote">
                  “Fewer redirects, cleaner transitions, and no cursor-following
                  lag.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-section">
        <div className="site-shell proof-grid">
          {highlights.map((highlight) => (
            <article className="proof-card" key={highlight.title}>
              <p className="proof-card-kicker">Why it ships better</p>
              <h2>{highlight.title}</h2>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="site-shell">
          <div className="section-heading">
            <p className="hero-kicker">Built around the current scope</p>
            <h2>Everything stays focused on auth, polish, and responsiveness.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="site-shell cta-card">
          <div>
            <p className="hero-kicker">Ready to try the current flow?</p>
            <h2>Sign up, land in profile, and explore the tightened auth path.</h2>
          </div>
          <Link className="hero-primary" href="/signup">
            Launch the flow
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-shell site-footer-inner">
          <p>Auth Mini keeps the original palette and theme while shipping a calmer UI.</p>
          <div className="site-footer-links">
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";

const demoPassword = ["demo", "123"].join("");

const stats = [
  { value: "2 seeded users", label: "Demo accounts ready" },
  { value: "Instant redirect", label: "Login and signup result" },
  { value: "1 protected route", label: "Profile proof point" },
];

const highlights = [
  {
    title: "Fast first impression",
    description:
      "The homepage now sells the auth journey itself instead of exposing internal implementation notes.",
  },
  {
    title: "Real demo credentials",
    description:
      "Presenters can sign in immediately with the seeded demo account or create a fresh user without changing routes.",
  },
  {
    title: "Clear protected-state payoff",
    description:
      "Both guest routes funnel into the same profile destination, making the successful auth state obvious on first run.",
  },
];

const features = [
  {
    title: "Seeded login path",
    description:
      "Use demo / demo123 to show the happy path immediately, with the same cookie-backed session as any new signup.",
  },
  {
    title: "Create-and-land flow",
    description:
      "Signup still provisions a real user and routes directly into the protected profile experience.",
  },
  {
    title: "Protected profile route",
    description:
      "The /profile screen stays server validated so the app still behaves like a real auth product, not a mockup.",
  },
  {
    title: "Presentation-ready UI",
    description:
      "Responsive cards, stronger hierarchy, and clearer calls to action make the demo feel shippable across devices.",
  },
];

const demoSteps = [
  "Open login and use the seeded demo account.",
  "Watch the app redirect into the protected profile route.",
  "Log out to prove the return path back to the guest flow.",
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
            <Link className="site-nav-link" href="/profile">
              Profile
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
            <p className="hero-kicker">Demo-ready authentication experience</p>
            <h1>Show secure signup, login, profile access, and logout in one polished flow.</h1>
            <p className="hero-text">
              Auth Mini is now framed as a product demo: use the seeded account,
              create a fresh user, and land in the protected profile without
              changing any routes or backend wiring.
            </p>

            <div className="hero-actions">
              <Link className="hero-primary" href="/signup">
                Start the demo
              </Link>
              <Link className="hero-secondary" href="/login">
                Use seeded login
              </Link>
              <Link className="hero-secondary" href="/profile">
                View protected profile
              </Link>
            </div>

            <div className="preview-card hero-note-card">
              <p className="preview-card-label">Demo credentials</p>
              <div className="hero-note-values">
                <p>
                  <strong>Username:</strong> demo
                </p>
                <p>
                  <strong>Password:</strong> {demoPassword}
                </p>
              </div>
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
                  <p className="preview-label">Protected destination</p>
                  <h2>Profile access unlocked</h2>
                </div>
                <span className="preview-badge">Cookie session active</span>
              </div>

              <div className="preview-card">
                <p className="preview-card-label">What to demo live</p>
                <ul className="preview-list">
                  {demoSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="preview-card">
                <p className="preview-card-label">Seeded account</p>
                <div className="preview-credentials">
                  <div>
                    <span>Username</span>
                    <strong>demo</strong>
                  </div>
                  <div>
                    <span>Password</span>
                    <strong>{demoPassword}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>demo@authmini.dev</strong>
                  </div>
                </div>
              </div>

              <div className="preview-card preview-card-accent">
                <p className="preview-card-label">Why it lands</p>
                <p className="preview-quote">
                  Smooth copy, clear actions, and the same repaired backend flow
                  make the auth demo feel intentional from the first screen.
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
              <p className="proof-card-kicker">Why it presents well</p>
              <h2>{highlight.title}</h2>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="site-shell">
          <div className="section-heading">
            <p className="hero-kicker">Designed for the auth story</p>
            <h2>The routes stay the same, but the experience now feels ready to show.</h2>
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
            <p className="hero-kicker">Ready to walk it through?</p>
            <h2>Use the seeded demo login or create a new account and land in /profile.</h2>
          </div>
          <div className="hero-actions">
            <Link className="hero-primary" href="/login">
              Open login
            </Link>
            <Link className="hero-secondary" href="/signup">
              Open signup
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-shell site-footer-inner">
          <p>Auth Mini now presents a complete demo loop from homepage to protected profile.</p>
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

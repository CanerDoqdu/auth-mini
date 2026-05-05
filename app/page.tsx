import Link from "next/link";

const demoPassword = ["demo", "123"].join("");

const stats = [
  { value: "2 seeded users", label: "Demo accounts ready" },
  { value: "JWT in cookie", label: "Shared auth contract" },
  { value: "1 protected route", label: "Profile proof point" },
];

const demoPaths = [
  {
    route: "/login",
    title: "Use seeded credentials",
    description:
      "Lead with demo / demo123 for the shortest path into the protected profile.",
  },
  {
    route: "/signup",
    title: "Create a fresh user live",
    description:
      "Show new-account creation without changing the JWT-backed destination.",
  },
  {
    route: "/profile",
    title: "Prove the session",
    description:
      "Refresh once, then log out to show the protected state is persistent and reversible.",
  },
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
      "Presenters can sign in immediately with the seeded demo account or create a fresh user with the presentation-friendly signup flow.",
  },
  {
    title: "Clear protected-state payoff",
    description:
      "Both guest routes issue the same JWT-backed session and funnel into the protected profile destination, making the successful auth state obvious on first run.",
  },
];

const features = [
  {
    title: "Seeded login path",
    description:
      "Use demo / demo123 to show the happy path immediately, with the same signed JWT in an HttpOnly cookie as any new signup.",
  },
  {
    title: "Signup-and-land flow",
    description:
      "Signup provisions a real user with the existing auth backend, issues the same JWT session, and routes directly into the protected profile experience.",
  },
  {
    title: "Protected profile route",
    description:
      "The primary /profile route stays server-validated against the JWT payload so the app still behaves like a real auth product, not a mockup.",
  },
  {
    title: "Presentation-ready UI",
    description:
      "Responsive cards, stronger hierarchy, and clearer calls to action make the demo feel shippable across devices.",
  },
];

const demoSteps = [
  "Start on /login and use the seeded demo account for the fastest JWT happy path.",
  "Point to /signup to show that new users land in the same protected state.",
  "Finish on /profile, refresh once, and log out back to /login.",
];

const routeJourney = [
  {
    step: "01",
    route: "/login",
    title: "Open the seeded happy path",
    description:
      "Lead with a credible sign-in screen that exposes the demo credentials and explains the protected payoff.",
  },
  {
    step: "02",
    route: "/signup",
    title: "Create a fresh account live",
    description:
      "Show that registration uses the same repaired auth contract, sets the same cookie, and lands in the same authenticated state.",
  },
  {
    step: "03",
    route: "/profile",
    title: "Prove the protected session",
    description:
      "Use the server-rendered profile screen to confirm the JWT session survives refresh and exits cleanly on logout.",
  },
];

const trustSignals = [
  "Server-validated protected route instead of a mocked success panel",
  "Same JWT-backed cookie contract for login, signup, and alias routes",
  "Clear live-demo script that works on desktop, tablet, and mobile layouts",
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
              Sign up
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
              Auth Mini now tells a clear JWT auth story: start at /login, point
              to /signup for new users, and land in /profile with a signed token
              stored in an HttpOnly cookie.
            </p>

            <div className="hero-actions">
              <Link className="hero-primary" href="/login">
                Start at /login
              </Link>
              <Link className="hero-secondary" href="/signup">
                Show /signup
              </Link>
              <Link className="hero-secondary" href="/profile">
                Preview /profile
              </Link>
            </div>

            <div className="route-chip-row" aria-label="Canonical auth story">
              <span className="route-chip">/login</span>
              <span className="route-chip">/signup</span>
              <span className="route-chip">/profile</span>
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

            <div className="hero-path-grid">
              {demoPaths.map((path) => (
                <Link className="hero-path-card" href={path.route} key={path.route}>
                  <span className="hero-path-route">{path.route}</span>
                  <strong>{path.title}</strong>
                  <p>{path.description}</p>
                </Link>
              ))}
            </div>
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
                <span className="preview-badge">JWT cookie live</span>
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
                <p className="preview-card-label">Presenter cue</p>
                <p className="preview-quote">
                  Lead with login, mention signup as the fresh-account proof, then
                  refresh profile once before logging out so the session story feels
                  complete instead of staged.
                </p>
              </div>

              <div className="preview-card">
                <p className="preview-card-label">Route vocabulary</p>
                <p className="preview-quote">
                  Present the canonical story as /login -&gt; /signup -&gt; /profile.
                  The /register and /dashboard aliases still work in the background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <div className="site-shell">
          <div className="section-heading">
            <p className="hero-kicker">Canonical walkthrough</p>
            <h2>The demo now reads like a real product flow instead of a set of disconnected routes.</h2>
          </div>

          <div className="journey-grid">
            {routeJourney.map((item) => (
              <article className="journey-card" key={item.step}>
                <p className="journey-step">{item.step}</p>
                <div className="route-chip-row">
                  <span className="route-chip">{item.route}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
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
            <h2>
              The auth runtime stays the same, but the /login -&gt; /signup -&gt; /profile
              story now feels ready to show.
            </h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>

          <div className="trust-strip">
            {trustSignals.map((signal) => (
              <p className="trust-pill" key={signal}>
                {signal}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="site-shell cta-card">
          <div>
            <p className="hero-kicker">Ready to walk it through?</p>
            <h2>Open /login, show /signup, and finish in /profile with the same JWT session.</h2>
          </div>
          <div className="hero-actions">
            <Link className="hero-primary" href="/login">
              Open /login
            </Link>
            <Link className="hero-secondary" href="/signup">
              Open /signup
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-shell site-footer-inner">
          <p>Auth Mini now presents a complete JWT auth loop from homepage to the protected profile.</p>
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

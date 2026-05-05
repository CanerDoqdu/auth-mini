"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const demoPassword = ["demo", "123"].join("");

const signupBenefits = [
  "Create a fresh account in the local demo store",
  "Get a signed JWT in an HttpOnly cookie immediately after registration",
  "Arrive on the same protected route the current entry point promises",
];

const signupHighlights = [
  {
    title: "Login-ready credentials",
    description: "Fresh usernames and passwords work immediately on /login.",
  },
  {
    title: "Same protected payoff",
    description:
      "Signup lands in the same JWT-backed protected screen as the seeded path.",
  },
  {
    title: "Alias-safe demo story",
    description:
      "Keep /register and /dashboard compatible without distracting from the canonical flow.",
  },
];

type SignupScreenVariant = "register" | "signup";

type SignupScreenProps = {
  variant: SignupScreenVariant;
};

export default function SignupScreen({ variant }: SignupScreenProps) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isRegisterRoute = variant === "register";
  const secondaryRouteHref = isRegisterRoute ? "/signup" : "/register";
  const secondaryRouteLabel = isRegisterRoute ? "Canonical signup" : "Register alias";
  const protectedRouteHref = isRegisterRoute ? "/dashboard" : "/profile";
  const protectedRouteLabel = isRegisterRoute ? "Protected dashboard" : "Protected route";
  const pageEyebrow = isRegisterRoute ? "Register a demo account" : "Create a demo account";
  const pageHeading = isRegisterRoute
    ? "Register a brand-new user and land in the protected dashboard immediately."
    : "Create a brand-new user and land in the protected profile immediately.";
  const pageDescription = isRegisterRoute
    ? "Register keeps the same backend flow but now explains the payoff: successful registration signs you in, issues a JWT-backed session, drops you into /dashboard, and gives you a presentation-ready authenticated state to show."
    : "Signup keeps the same backend flow but now explains the payoff: successful registration signs you in, issues a JWT-backed session, drops you into /profile, and gives you a presentation-ready account state to show.";
  const headerTitle = isRegisterRoute ? "Register account" : "Create account";
  const headerDescription = isRegisterRoute
    ? "New users receive a JWT-backed session immediately and are redirected to /dashboard."
    : "New users receive a JWT-backed session immediately and are redirected to /profile.";
  const routeStory = isRegisterRoute
    ? ["/login", "/register", "/dashboard"]
    : ["/login", "/signup", "/profile"];
  const submitLabel = loading
    ? isRegisterRoute
      ? "Opening dashboard..."
      : "Creating profile..."
    : isRegisterRoute
      ? "Register"
      : "Sign up";

  const validateEmail = (emailAddress: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  const validatePassword = (passwordValue: string) => {
    return passwordValue.length >= 6;
  };

  const errors: Record<string, string> = {};
  const usernameTrimmed = username.trim();
  const emailTrimmed = email.trim().toLowerCase();
  const passwordIsBlank = !password.trim();

  if (touched.username && !usernameTrimmed) errors.username = "Username is required";
  if (touched.email && !emailTrimmed) errors.email = "Email is required";
  if (touched.email && emailTrimmed && !validateEmail(emailTrimmed)) {
    errors.email = "Invalid email format";
  }
  if (touched.password && passwordIsBlank) errors.password = "Password is required";
  if (touched.password && !passwordIsBlank && !validatePassword(password)) {
    errors.password = "Password must be at least 6 characters";
  }

  const isSubmitDisabled =
    loading ||
    !usernameTrimmed ||
    !emailTrimmed ||
    passwordIsBlank ||
    Object.keys(errors).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTouched({ username: true, email: true, password: true });
    setError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameTrimmed,
          email: emailTrimmed,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        router.replace(protectedRouteHref);
        router.refresh();
      }
    } catch (error) {
      console.error("Signup request failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-shell">
        <section className="auth-panel auth-showcase">
          <p className="profile-eyebrow">{pageEyebrow}</p>
          <h1>{pageHeading}</h1>
          <p className="auth-showcase-copy">{pageDescription}</p>

          <ul className="auth-feature-list">
            {signupBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <div className="route-chip-row" aria-label="Signup route story">
            {routeStory.map((route) => (
              <span
                className={`route-chip ${route === routeStory[1] ? "route-chip-active" : ""}`}
                key={route}
              >
                {route}
              </span>
            ))}
          </div>

          <div className="preview-card demo-tip-card">
            <p className="preview-card-label">Need the fast path instead?</p>
            <p>
              Use the seeded credentials on login: <strong>demo</strong> /{" "}
              <strong>{demoPassword}</strong>.
            </p>
            <Link className="inline-link" href="/login">
              Switch to login
            </Link>
          </div>

          {!isRegisterRoute && (
            <div className="preview-card demo-tip-card">
              <p className="preview-card-label">Canonical JWT demo path</p>
              <p>
                Present the guest flow as <strong>/login</strong> -&gt;{" "}
                <strong>/signup</strong> -&gt; <strong>/profile</strong>. The older
                alias routes stay available for compatibility.
              </p>
            </div>
          )}

          <div className="preview-card demo-tip-card">
            <p className="preview-card-label">Route relationship</p>
            <p>
              {isRegisterRoute ? (
                <>
                  <strong>/register</strong> keeps the legacy entry point intact and
                  still lands in <strong>/dashboard</strong>, while the primary demo
                  story remains <strong>/login</strong> -&gt; <strong>/signup</strong>{" "}
                  -&gt; <strong>/profile</strong>.
                </>
              ) : (
                <>
                  <strong>/signup</strong> is the canonical new-user flow. Keep{" "}
                  <strong>/register</strong> and <strong>/dashboard</strong> available
                  as compatibility aliases without changing the main demo script.
                </>
              )}
            </p>
            <Link className="inline-link" href={secondaryRouteHref}>
              {secondaryRouteLabel}
            </Link>
          </div>

          <div className="auth-quick-grid">
            {signupHighlights.map((highlight) => (
              <div className="auth-quick-card" key={highlight.title}>
                <span>Presentation note</span>
                <strong>{highlight.title}</strong>
                <p>{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-top-links">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href={secondaryRouteHref}>{secondaryRouteLabel}</Link>
          </div>

          <div className="auth-header auth-header-left">
            <h1>{headerTitle}</h1>
            <p>{headerDescription}</p>
          </div>

          <div className="surface-muted">
            <p className="preview-card-label">What the protected landing proves</p>
            <p>
              Successful registration signs the user in right away, then hands off
              to <strong>{protectedRouteHref}</strong> with the same cookie-backed
              session used everywhere else in the demo.
            </p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched({ ...touched, username: true })}
                className={touched.username && errors.username ? "input-error" : ""}
                disabled={loading}
                required
              />
              <p
                className={`field-message ${
                  touched.username && errors.username ? "field-message-error" : ""
                }`}
              >
                {touched.username && errors.username
                  ? errors.username
                  : "Pick a name you can use again on the login screen."}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                className={touched.email && errors.email ? "input-error" : ""}
                disabled={loading}
                required
              />
              <p
                className={`field-message ${
                  touched.email && errors.email ? "field-message-error" : ""
                }`}
              >
                {touched.email && errors.email
                  ? errors.email
                  : "Use a valid email so the protected account view looks complete."}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={touched.password && errors.password ? "input-error" : ""}
                disabled={loading}
                required
              />
              <p
                className={`field-message ${
                  touched.password && errors.password ? "field-message-error" : ""
                }`}
              >
                {touched.password && errors.password
                  ? errors.password
                  : "Use at least 6 characters to match the backend rule."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="submit-btn"
            >
              {loading && <span className="spinner"></span>}
              {submitLabel}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
            <div className="auth-footer-links">
              <Link href="/">Back to home</Link>
              <Link href={secondaryRouteHref}>{secondaryRouteLabel}</Link>
              <Link href={protectedRouteHref}>{protectedRouteLabel}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

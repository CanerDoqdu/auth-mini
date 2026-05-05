"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const demoPassword = ["demo", "123"].join("");

const demoAccount = {
  email: "demo@authmini.dev",
  password: demoPassword,
  username: "demo",
};

const loginBenefits = [
  "Signed JWT stored in an HttpOnly cookie on success",
  "Immediate redirect to the protected profile route",
  "Works with the seeded demo account or any new signup",
];

const loginMoments = [
  {
    label: "Fastest route",
    value: "/login -> /profile",
    description: "Use the seeded demo account for the shortest live walkthrough.",
  },
  {
    label: "Fresh account option",
    value: "/signup -> /profile",
    description:
      "If the demo needs registration, create a user live and land in the same protected state.",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  const usernameTrimmed = username.trim();
  const passwordTrimmed = password.trim();

  if (touched.username && !usernameTrimmed) errors.username = "Username is required";
  if (touched.password && !passwordTrimmed) errors.password = "Password is required";

  const isSubmitDisabled =
    loading ||
    !usernameTrimmed ||
    !passwordTrimmed ||
    Object.keys(errors).length > 0;

  function handleUseDemoAccount() {
    setUsername(demoAccount.username);
    setPassword(demoAccount.password);
    setTouched({});
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTouched({ username: true, password: true });
    setError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameTrimmed,
          password: passwordTrimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        router.replace("/profile");
        router.refresh();
      }
    } catch (error) {
      console.error("Login request failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-shell">
        <section className="auth-panel auth-showcase">
          <p className="profile-eyebrow">Secure demo login</p>
          <h1>Walk straight into the protected profile experience.</h1>
          <p className="auth-showcase-copy">
            Use the seeded credentials for the fastest happy path or sign in with
            any account you created in signup. Either way, the repaired backend
            issues the same signed JWT into an HttpOnly cookie and opens /profile.
          </p>

          <div className="demo-credentials-card preview-credentials">
            <div>
              <span>Username</span>
              <strong>{demoAccount.username}</strong>
            </div>
            <div>
              <span>Password</span>
              <strong>{demoAccount.password}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{demoAccount.email}</strong>
            </div>
          </div>

          <button
            className="demo-fill-button"
            disabled={loading}
            onClick={handleUseDemoAccount}
            type="button"
          >
            Use demo account
          </button>

          <ul className="auth-feature-list">
            {loginBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <div className="route-chip-row" aria-label="Login route story">
            <span className="route-chip route-chip-active">/login</span>
            <span className="route-chip">/profile</span>
          </div>

          <div className="auth-quick-grid">
            {loginMoments.map((moment) => (
              <div className="auth-quick-card" key={moment.label}>
                <span>{moment.label}</span>
                <strong>{moment.value}</strong>
                <p>{moment.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-top-links">
            <Link href="/">Home</Link>
            <Link href="/signup">Create account</Link>
          </div>

          <div className="auth-header auth-header-left">
            <h1>Welcome back</h1>
            <p>Sign in to issue a JWT-backed session and open the protected profile demo.</p>
          </div>

          <div className="surface-muted">
            <p className="preview-card-label">Demo-ready reminder</p>
            <p>
              The same repaired auth contract powers both the seeded demo login and
              any user created on <Link href="/signup">/signup</Link>.
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
                placeholder="Enter your username"
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
                  : "Try demo for the seeded account or the username you created on /signup."}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
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
                  : `Seeded demo password: ${demoPassword}.`}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="submit-btn"
            >
              {loading && <span className="spinner"></span>}
              {loading ? "Opening profile..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Need the new-user step? <Link href="/signup">Open /signup</Link>
            </p>
            <div className="auth-footer-links">
              <Link href="/">Back to home</Link>
              <Link href="/profile">Protected profile</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

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
  "Secure cookie session created on success",
  "Immediate redirect to the protected dashboard route",
  "Works with the seeded demo account or any new signup",
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
        router.replace("/dashboard");
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
          <h1>Walk straight into the protected dashboard experience.</h1>
          <p className="auth-showcase-copy">
            Use the seeded credentials for the fastest happy path or sign in with
            any account you created in register or signup. Either way, the repaired backend
            flow sets the same auth cookie and opens /dashboard.
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
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-top-links">
            <Link href="/">Home</Link>
            <Link href="/register">Register account</Link>
          </div>

          <div className="auth-header auth-header-left">
            <h1>Welcome back</h1>
            <p>Sign in to open the protected dashboard demo.</p>
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
                  : "Try demo for the seeded account or your own registered username."}
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
              {loading ? "Opening dashboard..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Need an account instead? <Link href="/register">Register here</Link>
            </p>
            <div className="auth-footer-links">
              <Link href="/">Back to home</Link>
              <Link href="/dashboard">Protected dashboard</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

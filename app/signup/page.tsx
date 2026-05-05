"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const demoPassword = ["demo", "123"].join("");

const signupBenefits = [
  "Create a fresh account in the local demo store",
  "Get signed in immediately after registration",
  "Arrive on the same protected profile route as login",
];

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const errors: Record<string, string> = {};
  const usernameTrimmed = username.trim();
  const emailTrimmed = email.trim().toLowerCase();
  const passwordTrimmed = password.trim();

  if (touched.username && !usernameTrimmed) errors.username = "Username is required";
  if (touched.email && !emailTrimmed) errors.email = "Email is required";
  if (touched.email && emailTrimmed && !validateEmail(emailTrimmed)) errors.email = "Invalid email format";
  if (touched.password && !passwordTrimmed) errors.password = "Password is required";
  if (touched.password && passwordTrimmed && !validatePassword(passwordTrimmed)) errors.password = "Password must be at least 6 characters";

  const isSubmitDisabled =
    loading ||
    !usernameTrimmed ||
    !emailTrimmed ||
    !passwordTrimmed ||
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
          password: passwordTrimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        router.replace("/profile");
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
          <p className="profile-eyebrow">Create a demo account</p>
          <h1>Launch a brand-new user and land in the protected route immediately.</h1>
          <p className="auth-showcase-copy">
            Signup keeps the same backend flow but now explains the payoff:
            successful registration signs you in, drops you into /profile, and
            gives you a presentation-ready account state to show.
          </p>

          <ul className="auth-feature-list">
            {signupBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

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
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-top-links">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
          </div>

          <div className="auth-header auth-header-left">
            <h1>Create account</h1>
            <p>New users are signed in immediately and redirected to /profile.</p>
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
                  : "Use a valid email so the profile view looks complete."}
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
              {loading ? "Creating profile..." : "Sign up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
            <div className="auth-footer-links">
              <Link href="/">Back to home</Link>
              <Link href="/profile">Protected route</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

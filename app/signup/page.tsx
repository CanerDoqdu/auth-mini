"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  
  if (touched.username && !username) errors.username = "Username is required";
  if (touched.email && !email) errors.email = "Email is required";
  if (touched.email && email && !validateEmail(email)) errors.email = "Invalid email format";
  if (touched.password && !password) errors.password = "Password is required";
  if (touched.password && password && !validatePassword(password)) errors.password = "Password must be at least 6 characters";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Mark all fields as touched
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
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us today and get started</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
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
            {touched.username && errors.username && (
              <p style={{ color: "var(--error)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.username}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={touched.email && errors.email ? "input-error" : ""}
              disabled={loading}
              required
            />
            {touched.email && errors.email && (
              <p style={{ color: "var(--error)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.email}
              </p>
            )}
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
            {touched.password && errors.password && (
              <p style={{ color: "var(--error)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.password}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || Object.keys(errors).length > 0}
            className="submit-btn"
          >
            {loading && <span className="spinner"></span>}
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link href="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
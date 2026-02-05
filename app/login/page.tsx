"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  
  if (touched.username && !username) errors.username = "Username is required";
  if (touched.password && !password) errors.password = "Password is required";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Mark all fields as touched
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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        router.push("/profile");
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
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
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
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";

export default function HomePage() {
  const cursorLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorLight = cursorLightRef.current;
    if (!cursorLight) return;

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          cursorLight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
          animationFrameId = 0;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="home-page">
      {/* Animated Background */}
      <div className="gradient-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      {/* Cursor Light */}
      <div
        ref={cursorLightRef}
        className="cursor-light"
      ></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">✨ Auth Mini</h2>
          <div className="nav-links">
            <Link href="/login" className="nav-link">
              Login
            </Link>
            <Link href="/signup" className="nav-link signup-btn">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          {/* Left Side - Text & Form */}
          <div className="hero-left">
            <h1 className="hero-title">
              Secure <span className="gradient-text">Authentication</span>
            </h1>
            <p className="hero-description">
              Fast, secure, and beautiful authentication system built for modern web applications. Enterprise-grade security with JWT tokens and bcrypt hashing. Your gateway to seamless user experience.
            </p>
            
            <div className="hero-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="hero-input"
              />
              <button className="hero-form-btn">Get Started</button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-value">256-bit</div>
                <div className="stat-label">Encryption</div>
              </div>
              <div className="stat">
                <div className="stat-value">⭐⭐⭐⭐⭐</div>
                <div className="stat-label">5.0 Rating</div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="hero-right">
            <div className="hero-visual-placeholder">
              🔐
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Why Choose Us</h2>
          <p>Crafted with attention to detail</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Design</h3>
            <p>
              Artistically crafted UI that stands out. Every pixel is designed
              with purpose and elegance.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Security First</h3>
            <p>
              Enterprise-grade security with JWT tokens and bcrypt hashing.
              Your data is always protected.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Developer Friendly</h3>
            <p>
              Easy-to-use APIs and comprehensive documentation. Integrate in
              minutes.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Modern Stack</h3>
            <p>
              Built with Next.js, TypeScript, and MongoDB. Future-proof
              technology stack.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Fully Responsive</h3>
            <p>
              Perfect experience on every device. Desktop, tablet, or mobile -
              looks stunning everywhere.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>
              Optimized performance with instant load times. Built for speed
              and efficiency.
            </p>
            <a href="#" className="feature-link">
              Learn more →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of developers building amazing experiences</p>
          <Link href="/signup" className="cta-btn">
            <span>Start Your Journey</span>
            <span className="cta-icon">✨</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Auth Mini. Built with love and creativity.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
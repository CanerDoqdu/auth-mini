"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
        className="cursor-light"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
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
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Modern <span className="gradient-text">Authentication</span>
              <br /> Redefined
            </h1>
            <p className="hero-subtitle">
              Experience a seamless, beautiful, and secure authentication system
              built with cutting-edge technology. Your gateway to a modern web.
            </p>
            <div className="hero-buttons">
              <Link href="/signup" className="btn btn-primary">
                <span>Get Started</span>
                <span className="btn-icon">→</span>
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Already have account
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">🔐</div>
              <p>Secure</p>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">⚡</div>
              <p>Fast</p>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">✨</div>
              <p>Beautiful</p>
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
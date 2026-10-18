import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import '../styles/Landing.css';

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const targets = node.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useReveal();

  const goApp = () => navigate('/app');
  const goDemo = () => navigate('/demo');

  return (
    <div className="landing-page" ref={rootRef}>
      <header className="landing-header">
        <nav className="landing-nav">
          <Link to="/" className="landing-brand">
            <Logo size={34} />
            <span className="brand-text">People Atlas</span>
          </Link>

          <div className={`landing-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#privacy" className="nav-link" onClick={() => setMenuOpen(false)}>
              Privacy
            </a>
            <Link to="/demo" className="nav-link" onClick={() => setMenuOpen(false)}>
              Demo
            </Link>
            <div className="landing-nav-cta landing-nav-cta-mobile">
              <button className="btn-ghost" onClick={() => { setMenuOpen(false); goDemo(); }}>
                Explore Demo
              </button>
              <button className="btn-primary" onClick={() => { setMenuOpen(false); goApp(); }}>
                <Icon name="plus" size={16} />
                Start My Atlas
              </button>
            </div>
          </div>

          <div className="landing-nav-cta landing-nav-cta-desktop">
            <button className="btn-ghost" onClick={goDemo}>Explore Demo</button>
            <button className="btn-primary" onClick={goApp}>
              <Icon name="plus" size={16} />
              Start My Atlas
            </button>
          </div>

          <button
            type="button"
            className="landing-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content hero-enter">
            <h1 className="hero-title">Understand the people who shape your world.</h1>
            <p className="hero-subtitle">
              People Atlas helps you organize your network, track meaningful relationships, explore
              locations, and uncover patterns in your personal connections — all stored locally on
              your device.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-lg" onClick={goApp}>
                <Icon name="people" size={20} />
                Build My Network
              </button>
              <button className="btn-secondary btn-lg" onClick={goDemo}>
                <Icon name="insights" size={20} />
                Explore Demo
              </button>
            </div>
            <div className="hero-badges">
              <span className="badge">100% Local Storage</span>
              <span className="badge">No Account Required</span>
              <span className="badge">Private & Secure</span>
            </div>
          </div>
          <div className="hero-visual hero-enter hero-enter-delay">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="preview-title">Network Insights</span>
              </div>
              <div className="preview-content">
                <div className="preview-stats">
                  <div className="stat-item"><strong>100</strong> PEOPLE</div>
                  <div className="stat-item"><strong>5</strong> GROUPS</div>
                  <div className="stat-item"><strong>15+</strong> PLACES</div>
                </div>
                <div className="preview-bars">
                  <div className="bar preview-bar-1"></div>
                  <div className="bar preview-bar-2"></div>
                  <div className="bar preview-bar-3"></div>
                  <div className="bar preview-bar-4"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <h2 className="section-title" data-reveal>Everything your network needs</h2>
          <p className="section-subtitle" data-reveal>
            Thoughtfully designed to help you maintain meaningful connections
          </p>
          <div className="features-grid">
            <div className="feature-card" data-reveal>
              <Icon name="people" size={32} className="feature-icon" />
              <h3>Organized Directory</h3>
              <p>Search, filter, and sort your contacts with a clean, alphabetical directory.</p>
            </div>
            <div className="feature-card" data-reveal>
              <Icon name="insights" size={32} className="feature-icon" />
              <h3>Network Insights</h3>
              <p>Discover patterns in your groups, places, relationships, and close connections.</p>
            </div>
            <div className="feature-card" data-reveal>
              <Icon name="map-pin" size={32} className="feature-icon" />
              <h3>Places Explorer</h3>
              <p>See your network grouped by location and where your connections are concentrated.</p>
            </div>
            <div className="feature-card" data-reveal>
              <Icon name="clock" size={32} className="feature-icon" />
              <h3>Activity Timeline</h3>
              <p>Track when you added, updated, or contacted people with a clean journal view.</p>
            </div>
            <div className="feature-card" data-reveal>
              <Icon name="heart" size={32} className="feature-icon" />
              <h3>Close Circle</h3>
              <p>Keep your inner circle at your fingertips with favorites.</p>
            </div>
            <div className="feature-card" data-reveal>
              <Icon name="link" size={32} className="feature-icon" />
              <h3>Professional Links</h3>
              <p>Store LinkedIn, GitHub, Portfolio, and other professional profiles for each contact.</p>
            </div>
          </div>
        </section>

        <section id="privacy" className="privacy-section" data-reveal>
          <div className="privacy-content">
            <Icon name="shield" size={40} className="privacy-icon" />
            <h2>Your data stays yours</h2>
            <p>
              People Atlas stores all your contacts in your browser's localStorage. No cloud servers,
              no accounts, no tracking, no sharing. You have complete control with export, import, and
              full data reset options.
            </p>
          </div>
        </section>

        <section className="cta-section" data-reveal>
          <h2>Start mapping your network today</h2>
          <p>Choose your path and begin organizing the people who matter most.</p>
          <div className="cta-actions">
            <button className="btn-primary btn-lg" onClick={goApp}>
              <Icon name="plus" size={20} />
              Build My Network
            </button>
            <button className="btn-secondary btn-lg" onClick={goDemo}>
              <Icon name="insights" size={20} />
              Explore Demo
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Logo size={26} />
            <span>People Atlas</span>
          </div>
          <p className="footer-tagline">A personal visual map of the people in your life.</p>
        </div>
        <div className="footer-bottom">
          <p>© 2026 People Atlas. All data stays local on your device.</p>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import { getWorkspaceMode, switchToPersonal, resetDemoData } from '../utils/contactStorage';

export default function Navbar() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const workspaceMode = getWorkspaceMode();

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const applyHeight = () => {
      document.documentElement.style.setProperty('--navbar-h', `${node.offsetHeight}px`);
    };
    applyHeight();

    const observer = new ResizeObserver(applyHeight);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--navbar-h');
    };
  }, []);

  const handleExitDemo = () => {
    switchToPersonal();
    navigate('/app');
  };

  const handleResetDemo = () => {
    resetDemoData();
    navigate('/insights');
  };

  const navItems = [
    { to: '/insights', label: 'INSIGHTS', icon: 'insights' },
    { to: '/people', label: 'PEOPLE', icon: 'users' },
    { to: '/places', label: 'PLACES', icon: 'places' },
    { to: '/recent', label: 'RECENT', icon: 'recent' },
    { to: '/favorites', label: 'CLOSE', icon: 'heart-filled' },
    { to: '/data', label: 'DATA', icon: 'data' }
  ];

  return (
    <>
      <header className="editorial-navbar" ref={headerRef}>
        <div className="navbar-container">
          <Link to="/insights" className="brand-logo">
            <Logo size={26} />
            <span className="brand-title">PEOPLE ATLAS</span>
          </Link>

          <nav className="nav-links desktop-only" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="navbar-actions">
            {workspaceMode === 'demo' && (
              <span className="demo-pill mono-font" title="You are viewing the demo workspace">
                DEMO
              </span>
            )}
            <Link to="/add-contact" className="btn-add-contact">
              <Icon name="plus" size={16} />
              <span className="btn-add-text">Add Person</span>
            </Link>
          </div>
        </div>

        {workspaceMode === 'demo' && (
          <div className="demo-banner" role="status">
            <span className="demo-banner-text">
              <Icon name="insights" size={14} />
              <span>
                <strong>DEMO WORKSPACE</strong> — sample network. Your personal contacts are untouched.
              </span>
            </span>
            <span className="demo-banner-actions">
              <button type="button" className="demo-banner-btn" onClick={handleResetDemo}>
                Reset Demo
              </button>
              <button type="button" className="demo-banner-btn demo-banner-btn-strong" onClick={handleExitDemo}>
                Exit Demo
              </button>
            </span>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-bottom-nav-chip">
              <Icon name={item.icon} size={18} />
            </span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

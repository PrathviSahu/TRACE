import TraceLogo from './TraceLogo.jsx';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState('');

  function handleSearchSubmit(e) {
    if (e.key === 'Enter' && navSearch.trim()) {
      navigate(`/problems?search=${encodeURIComponent(navSearch.trim())}`);
    }
  }
  const { language, theme, setTheme, sidebarOpen, toggleSidebar } = useTraceStore();

  return (
    <header className="navbar">
      {/* ── Brand Logo & Sidebar Toggle ────────────────────────── */}
      <div className="nav-left-section">
        {loc.pathname === "/" && (
          <button
            type="button"
            className={`nav-sidebar-toggle-btn ${!sidebarOpen ? "collapsed" : ""}`}
            onClick={toggleSidebar}
            title={sidebarOpen ? "Slide sidebar inside (Ctrl+B) for more space" : "Show sidebar (Ctrl+B)"}
            aria-label="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              {sidebarOpen ? (
                <path d="m14 9-3 3 3 3"/>
              ) : (
                <path d="m11 9 3 3-3 3"/>
              )}
            </svg>
          </button>
        )}
        <Link to="/" className="nav-brand">
          <div className="brand-logo-badge" title="TRACE — Visual DSA Debugger">
            <TraceLogo size={20} />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-name">TRACE</span>
            <span className="brand-tagline">See Your Algorithm Think</span>
          </div>
        </Link>
      </div>

      {/* ── Nav Links ─────────────────────────────────────────── */}
      <nav className="nav-menu">
        <Link to="/" className={`nav-item ${loc.pathname === '/' ? 'active-pill' : ''}`}>
          Visualizer
        </Link>
        <Link to="/roadmap" className={`nav-item ${loc.pathname === '/roadmap' ? 'active-pill' : ''}`}>
          DSA Roadmap
        </Link>
        <Link to="/problems" className={`nav-item ${loc.pathname === '/problems' ? 'active-pill' : ''}`}>
          Problems
        </Link>
        <Link to="/data-structures" className={`nav-item ${loc.pathname === '/data-structures' ? 'active-pill' : ''}`}>
          Data Structures
        </Link>
        <Link to="/companies" className={`nav-item ${loc.pathname.startsWith('/companies') ? 'active-pill' : ''}`}>
          Companies
        </Link>
        <Link to="/interview/plan" className={`nav-item ${loc.pathname.startsWith('/interview') ? 'active-pill' : ''}`}>
          Interview Plan
        </Link>
        <Link to="/learn" className={`nav-item ${loc.pathname === '/learn' ? 'active-pill' : ''}`}>
          Learn
        </Link>
      </nav>

      {/* ── Right Controls ────────────────────────────────────── */}
      <div className="nav-right">
        <div className="nav-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search problems, topics..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        <div className="theme-toggle-group" role="group" aria-label="Theme selection">
          <button
            type="button"
            className={`theme-icon-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
            title="Light mode"
            id="light-theme-btn"
            aria-label="Switch to light mode"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button
            type="button"
            className={`theme-icon-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
            title="Dark mode"
            id="dark-theme-btn"
            aria-label="Switch to dark mode"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>

        <div className="user-avatar" title="Sneha">
          <span>S</span>
        </div>
      </div>
    </header>
  );
}

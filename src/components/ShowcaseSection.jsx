import { useNavigate } from 'react-router-dom';

export default function ShowcaseSection() {
  const navigate = useNavigate();

  return (
    <section className="showcase-section">
      <div className="showcase-header">
        <h2 className="showcase-title">Visualize. Understand. Master.</h2>
        <p className="showcase-subtitle">
          Everything you need to go from DSA basics to Big Tech.
        </p>
      </div>

      <div className="showcase-cards-grid">
        {/* 1. Multi-Language Support */}
        <div className="feature-card">
          <div className="feature-title">Multi-Language Support</div>
          <div className="lang-icons-row">
            <span className="badge-icon" title="Java — Executable">☕</span>
            <span className="badge-icon" title="Python — Executable">🐍</span>
            <span className="badge-icon" title="C++ — Editor">💠</span>
            <span className="badge-icon" title="JavaScript — Editor">🟨</span>
          </div>
          <p className="feature-desc">
            Execute and visualize step-by-step in Java and Python.
            Write and syntax-highlight in C++ and JavaScript.
          </p>
        </div>

        {/* 2. Data Structure Visualizations */}
        <div className="feature-card" onClick={() => navigate('/data-structures')}>
          <div className="feature-title">Data Structure Visualizations</div>
          <div className="feature-icon-badge purple-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <p className="feature-desc">
            See arrays, linked lists, stacks, queues, trees, graphs and more come to life.
          </p>
        </div>

        {/* 3. DSA Roadmap */}
        <div className="feature-card" onClick={() => navigate('/roadmap')}>
          <div className="feature-title">DSA Roadmap</div>
          <div className="feature-icon-badge purple-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p className="feature-desc">
            Structured learning path from basics to advanced with progress tracking.
          </p>
        </div>

        {/* 4. Curated Problems */}
        <div className="feature-card" onClick={() => navigate('/problems')}>
          <div className="feature-title">Curated Problems</div>
          <div className="feature-icon-badge red-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <p className="feature-desc">
            Practice with hand-picked problems, track your progress, and build consistency.
          </p>
        </div>

        {/* 5. Company Preparation */}
        <div className="feature-card" onClick={() => navigate('/companies')}>
          <div className="feature-title">Company Preparation</div>
          <div className="feature-icon-badge purple-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="22" x2="9" y2="22.01" />
              <line x1="15" y1="22" x2="15" y2="22.01" />
              <line x1="9" y1="6" x2="9" y2="6.01" />
              <line x1="15" y1="6" x2="15" y2="6.01" />
              <line x1="9" y1="10" x2="9" y2="10.01" />
              <line x1="15" y1="10" x2="15" y2="10.01" />
              <line x1="9" y1="14" x2="9" y2="14.01" />
              <line x1="15" y1="14" x2="15" y2="14.01" />
              <line x1="9" y1="18" x2="9" y2="18.01" />
              <line x1="15" y1="18" x2="15" y2="18.01" />
            </svg>
          </div>
          <p className="feature-desc">
            Get ready for top companies with curated question sets and interview-focused practice.
          </p>
        </div>
      </div>

      {/* ── Footer Quote & Hand-drawn Cursive ─────────────────── */}
      <footer className="showcase-footer">
        <div className="footer-quote">
          “A clear mind writes better code.”
        </div>
        <div className="footer-brand">TRACE</div>
        <div className="cursive-tag">
          Learn<br />Visualize<br />Grow ↗
        </div>
      </footer>
    </section>
  );
}

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';
import { useAllProgress, computePatternPerformance } from '../services/progressStore.js';
import { DSA_TOPICS } from '../data/patternMapping.js';
import { ALL_PROBLEMS } from '../data/roadmapProblems.js';

export default function ShowcaseSection() {
  const navigate = useNavigate();
  const { selectExample, activeExampleId } = useTraceStore();
  const { progress } = useAllProgress();

  // Compute real user velocity metrics
  const { solvedCount, totalProblems, easySolved, medSolved, hardSolved, weakPatterns } = useMemo(() => {
    let solved = 0;
    let easy = 0;
    let med = 0;
    let hard = 0;

    for (const [_, item] of Object.entries(progress || {})) {
      if (item?.status === 'solved') {
        solved++;
        if (item.difficulty === 'Easy') easy++;
        else if (item.difficulty === 'Medium') med++;
        else if (item.difficulty === 'Hard') hard++;
      }
    }

    const patterns = computePatternPerformance();
    const weak = patterns.filter(p => p.confidence === 'low' || p.reviewDue > 0).slice(0, 3);

    return {
      solvedCount: solved,
      totalProblems: ALL_PROBLEMS?.length || 290,
      easySolved: easy,
      medSolved: med,
      hardSolved: hard,
      weakPatterns: weak
    };
  }, [progress]);

  const QUICK_PRESETS = [
    { id: 'two-sum', name: 'Two Sum', ds: 'Array / HashMap', complexity: 'O(n) time · O(n) space' },
    { id: 'linked-list', name: 'Reverse Linked List', ds: 'LinkedList', complexity: 'O(n) time · O(1) space' },
    { id: 'stack', name: 'Valid Parentheses', ds: 'Stack', complexity: 'O(n) time · O(n) space' },
    { id: 'binary-tree', name: 'Invert Binary Tree', ds: 'Binary Tree', complexity: 'O(n) time · O(h) space' },
    { id: 'heap-priority-queue', name: 'Kth Largest Element', ds: 'Min-Heap', complexity: 'O(n log k) · O(k) space' },
    { id: 'graphs', name: 'Graph BFS Traversal', ds: 'Graph / Queue', complexity: 'O(V+E) · O(V) space' }
  ];

  return (
    <section className="dev-hub-section">
      {/* ── Section Header ───────────────────────────────────────── */}
      <div className="dev-hub-header">
        <div className="dev-hub-badge">
          <span className="hub-pulse" />
          <span>TRACE OBSERVABILITY & WORKSPACE</span>
        </div>
        <h2 className="dev-hub-title">Execution State & Algorithmic Velocity</h2>
        <p className="dev-hub-subtitle">
          Real-time debugger diagnostics, roadmap progression, and algorithmic pattern readiness.
        </p>
      </div>

      {/* ── 3 Primary Developer Panels ───────────────────────────── */}
      <div className="dev-hub-grid">
        {/* Panel 1: Execution Quick Launch */}
        <div className="dev-panel">
          <div className="dev-panel-hd">
            <div className="dev-panel-title">
              <span className="panel-icon amber">⚡</span>
              <span>Quick Trace Presets</span>
            </div>
            <span className="dev-panel-tag">6 BUILT-IN</span>
          </div>
          <p className="dev-panel-desc">
            Load verified runnable algorithms with live AST execution, variable inspection, and memory graphs.
          </p>
          <div className="dev-presets-list">
            {QUICK_PRESETS.map(p => {
              const isActive = activeExampleId === p.id;
              return (
                <div
                  key={p.id}
                  className={`dev-preset-row ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    selectExample(p.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="preset-name-group">
                    <span className="preset-name">{p.name}</span>
                    <span className="preset-ds-tag">{p.ds}</span>
                  </div>
                  <div className="preset-meta">
                    <span className="preset-complexity">{p.complexity}</span>
                    <span className="preset-arrow">{isActive ? '● ACTIVE' : 'RUN →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Learning Velocity & Roadmap */}
        <div className="dev-panel">
          <div className="dev-panel-hd">
            <div className="dev-panel-title">
              <span className="panel-icon teal">📊</span>
              <span>Roadmap Velocity</span>
            </div>
            <button className="dev-link-btn" onClick={() => navigate('/roadmap')}>
              VIEW ROADMAP →
            </button>
          </div>
          <p className="dev-panel-desc">
            Unified tracking across {DSA_TOPICS.length} canonical DSA categories and {totalProblems} curated roadmap challenges.
          </p>
          <div className="dev-metrics-box">
            <div className="dev-metric-item">
              <span className="metric-label">SOLVED PROBLEMS</span>
              <span className="metric-number">
                {solvedCount} <span className="metric-denom">/ {totalProblems}</span>
              </span>
              <div className="dev-prog-track">
                <div
                  className="dev-prog-bar"
                  style={{ width: `${Math.max(4, Math.round((solvedCount / totalProblems) * 100))}%` }}
                />
              </div>
            </div>
            <div className="dev-metric-subgrid">
              <div className="submetric-col">
                <span className="submetric-name green">Easy</span>
                <span className="submetric-val">{easySolved}</span>
              </div>
              <div className="submetric-col">
                <span className="submetric-name amber">Medium</span>
                <span className="submetric-val">{medSolved}</span>
              </div>
              <div className="submetric-col">
                <span className="submetric-name red">Hard</span>
                <span className="submetric-val">{hardSolved}</span>
              </div>
            </div>
          </div>
          <div className="dev-action-box">
            <button className="btn-dev-action" onClick={() => navigate('/problems')}>
              <span>Browse All 290 Problems</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Panel 3: Technical Interview Readiness */}
        <div className="dev-panel">
          <div className="dev-panel-hd">
            <div className="dev-panel-title">
              <span className="panel-icon amber">🎯</span>
              <span>Interview Readiness</span>
            </div>
            <button className="dev-link-btn" onClick={() => navigate('/interview/plan')}>
              MANAGE PLAN →
            </button>
          </div>
          <p className="dev-panel-desc">
            Deterministic evaluation engine with company targeting, pattern weighting, and timed mock simulation.
          </p>

          <div className="readiness-summary-card">
            <div className="readiness-headline">
              <span className="readiness-label">PROBLEMS SOLVED</span>
              <span className="readiness-score">
                {solvedCount} <span style={{ fontSize: "1.1rem", color: "var(--txt-muted)", fontWeight: 500 }}>/ {totalProblems}</span>
              </span>
            </div>
            <div className="readiness-meta-row">
              <span className="readiness-chip">Big Tech Target</span>
              <span className="readiness-chip">Adaptive Plan Active</span>
            </div>
          </div>

          <div className="weakness-preview-box">
            <div className="weakness-hd">Pattern Attention Queue:</div>
            {weakPatterns.length > 0 ? (
              <div className="weakness-chips">
                {weakPatterns.map(wp => (
                  <span key={wp.pattern} className="weakness-chip">
                    {wp.pattern}
                  </span>
                ))}
              </div>
            ) : (
              <div className="weakness-empty">
                All patterns within target confidence threshold.
              </div>
            )}
          </div>

          <div className="dev-action-box">
            <button className="btn-dev-action highlight" onClick={() => navigate('/interview/setup')}>
              <span>Launch Mock Interview Simulation</span>
              <span>⚡</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Technical Specs Terminal Footer ──────────────────────── */}
      <footer className="dev-terminal-footer">
        <div className="terminal-status-row">
          <span className="status-dot green" />
          <span className="status-label">ENGINE: Java AST Tree-Walker (v1.0)</span>
          <span className="status-divider">·</span>
          <span className="status-label">PYTHON: Limited Trace Support</span>
          <span className="status-divider">·</span>
          <span className="status-label">MAX_STEPS: 8000</span>
          <span className="status-divider">·</span>
          <span className="status-label">CALL_DEPTH: 200</span>
          <span className="status-divider">·</span>
          <span className="status-label">TRACE AMBER TERMINAL</span>
        </div>
        <div className="terminal-copy">
          TRACE Developer Tooling · See Your Algorithm Think
        </div>
      </footer>
    </section>
  );
}

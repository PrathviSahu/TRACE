import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';
import { ALL_PROBLEMS, TOPICS, TOPIC_ORDER, ROADMAP_PROBLEMS } from '../data/roadmapProblems.js';
import { getProblemTemplate, PRESET_SOLUTIONS } from '../data/problemTemplates.js';
import { getProblemDescription } from '../data/problemDescriptions.js';
import ProblemModal from '../components/ProblemModal.jsx';
import { useSolvedProblemIds } from '../services/progressStore.js';

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCode, setInputs } = useTraceStore();

  const initialTopic = searchParams.get('topic');
  const initialSearch = searchParams.get('search');

  // ── Filters & Search state
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedTopic, setSelectedTopic] = useState((initialTopic && TOPICS.includes(initialTopic)) ? initialTopic : 'All');

  // Sync if search params change dynamically
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam && TOPICS.includes(topicParam)) {
      setSelectedTopic(topicParam);
    } else if (topicParam === 'All') {
      setSelectedTopic('All');
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null && searchParam !== undefined) {
      setSearch(searchParam);
    }
  }, [searchParams]);
  const [difficulty, setDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'solved' | 'unsolved' | 'preset'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // ── Problem Modal state
  const [modalProblem, setModalProblem] = useState(null);
  const [modalDesc, setModalDesc] = useState(null);

  function openProblemModal(p) {
    setModalProblem(p);
    setModalDesc(getProblemDescription(p.id));
  }
  function closeProblemModal() {
    setModalProblem(null);
    setModalDesc(null);
  }

  // ── Solved status stored via unified progressStore
  const { solvedIds, toggleSolved, resetAllSolved } = useSolvedProblemIds();

  function resetProgress() {
    if (window.confirm('Are you sure you want to reset all solved problems?')) {
      resetAllSolved();
    }
  }

  // ── Statistics
  const stats = useMemo(() => {
    const total = ALL_PROBLEMS.length;
    let easyTotal = 0, easySolved = 0;
    let medTotal = 0, medSolved = 0;
    let hardTotal = 0, hardSolved = 0;
    let solvedCount = 0;

    for (const p of ALL_PROBLEMS) {
      const isSolved = solvedIds.has(p.id);
      if (isSolved) solvedCount++;
      if (p.difficulty === 'easy') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (p.difficulty === 'medium') {
        medTotal++;
        if (isSolved) medSolved++;
      } else if (p.difficulty === 'hard') {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    }

    return {
      total,
      solvedCount,
      pct: total > 0 ? Math.round((solvedCount / total) * 100) : 0,
      easy: { total: easyTotal, solved: easySolved, pct: easyTotal ? Math.round((easySolved / easyTotal) * 100) : 0 },
      medium: { total: medTotal, solved: medSolved, pct: medTotal ? Math.round((medSolved / medTotal) * 100) : 0 },
      hard: { total: hardTotal, solved: hardSolved, pct: hardTotal ? Math.round((hardSolved / hardTotal) * 100) : 0 },
    };
  }, [solvedIds]);

  // ── Filtered & searched problems
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_PROBLEMS.filter(p => {
      // Topic match
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
      // Difficulty match
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      // Status match
      const isSolved = solvedIds.has(p.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;
      if (statusFilter === 'preset' && !PRESET_SOLUTIONS[p.id]) return false;

      // Search match (id, name, topic)
      if (q) {
        const idMatch = String(p.id).includes(q);
        const nameMatch = p.name.toLowerCase().includes(q);
        const topicMatch = p.topic.toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !topicMatch) return false;
      }

      return true;
    });
  }, [search, selectedTopic, difficulty, statusFilter, solvedIds]);

  // ── Pagination
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedProblems = useMemo(() => {
    if (pageSize === 'All') return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedTopic, difficulty, statusFilter, pageSize]);

  // ── Handle Visualize click
  function handleVisualize(problem) {
    const template = getProblemTemplate(problem);
    setCode(template.code);
    setInputs(template.inputs);
    navigate('/');
  }

  return (
    <div className="page">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="page-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">DSA Roadmap Problems</div>
          <div className="page-sub">
            All 290 curated LeetCode problems from your DSA Roadmap with one-click step-by-step Java execution
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" style={{ fontSize: 11, padding: '4px 10px' }} onClick={resetProgress}>
            Reset Progress
          </button>
        </div>
      </div>

      {/* ── Progress & Statistics Banner ────────────────────────── */}
      <div className="stats-banner">
        <div className="stat-card active-stat">
          <div className="stat-label">Total Progress</div>
          <div className="stat-val">
            {stats.solvedCount} <span className="stat-sub">/ {stats.total}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-fill" style={{ width: `${stats.pct}%`, background: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--txt2)', marginTop: 2 }}>{stats.pct}% Complete</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--green)' }}>Easy</div>
          <div className="stat-val">
            {stats.easy.solved} <span className="stat-sub">/ {stats.easy.total}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-fill" style={{ width: `${stats.easy.pct}%`, background: 'var(--green)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{stats.easy.pct}% Solved</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--amber)' }}>Medium</div>
          <div className="stat-val">
            {stats.medium.solved} <span className="stat-sub">/ {stats.medium.total}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-fill" style={{ width: `${stats.medium.pct}%`, background: 'var(--amber)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{stats.medium.pct}% Solved</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--red)' }}>Hard</div>
          <div className="stat-val">
            {stats.hard.solved} <span className="stat-sub">/ {stats.hard.total}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-fill" style={{ width: `${stats.hard.pct}%`, background: 'var(--red)' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{stats.hard.pct}% Solved</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: "var(--accent-cyan, #38D9C5)" }}>Ready to Trace</div>
          <div className="stat-val">
            {stats.total} <span className="stat-sub">/ {stats.total}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-fill" style={{ width: "100%", background: "var(--accent-cyan, #38D9C5)" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--txt3)", marginTop: 2 }}>{stats.total}/{stats.total} templates execute with TRACE</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────── */}
      <div className="search-bar-row">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className="search-input"
            placeholder="Search by problem title, number, or topic (e.g. 1, Two Sum, Binary Search, DP)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select
          className="topic-select"
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
        >
          <option value="All">All Topics ({ALL_PROBLEMS.length})</option>
          {TOPIC_ORDER.map(t => (
            <option key={t} value={t}>
              {t} ({ROADMAP_PROBLEMS[t]?.length || 0})
            </option>
          ))}
        </select>
      </div>

      {/* ── Quick Filter Buttons ──────────────────────────────── */}
      <div className="filter-row">
        <div className="filters" style={{ marginBottom: 0 }}>
          {['All', 'easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              className={`fbtn ${difficulty === d ? 'on' : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d === 'All' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          {[
            { id: 'All', label: 'All Status' },
            { id: 'solved', label: '✓ Solved' },
            { id: 'unsolved', label: '○ Todo' },
            { id: 'preset', label: '⚡ Ready to Trace' }
          ].map(s => (
            <button
              key={s.id}
              className={`fbtn ${statusFilter === s.id ? 'on' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>
          Showing <b>{filtered.length}</b> problem{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Problem Table ─────────────────────────────────────── */}
      <table className="ptable">
        <thead>
          <tr>
            <th style={{ width: 38, textAlign: 'center' }}>Status</th>
            <th style={{ width: 60 }}>#</th>
            <th>Title</th>
            <th style={{ width: 130 }}>Topic</th>
            <th style={{ width: 90 }}>Difficulty</th>
            <th style={{ width: 170, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProblems.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--txt3)' }}>
                No problems match your current search and filters.
              </td>
            </tr>
          ) : (
            paginatedProblems.map((p) => {
              const isSolved = solvedIds.has(p.id);
              const isPreset = !!PRESET_SOLUTIONS[p.id];
              return (
                <tr key={`${p.topic}-${p.id}`}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="chk-box"
                      checked={isSolved}
                      onChange={() => toggleSolved(p.id)}
                      title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                    />
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt3)' }}>
                    #{p.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="pname" onClick={() => openProblemModal(p)}>
                        {p.name}
                      </span>
                      {isPreset && (
                        <span className="preset-badge" title="Tested runnable solution preset available!">
                          ⚡ Ready to Trace
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="t-chip"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedTopic(p.topic)}
                      title={`Filter by ${p.topic}`}
                    >
                      {p.topic}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${p.difficulty}`}>{p.difficulty}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-info"
                        onClick={() => openProblemModal(p)}
                        title="View problem description"
                      >
                        📄 Question
                      </button>
                      <button
                        className="btn-viz"
                        onClick={() => handleVisualize(p)}
                        title="Load and visualize in TRACE"
                      >
                        ▶ Trace
                      </button>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-lc"
                        title="Open on LeetCode"
                      >
                        LeetCode ↗
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* ── Pagination Controls ───────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="pagination-row">
          <div style={{ fontSize: 11, color: 'var(--txt3)' }}>
            Page {currentPage} of {totalPages} ({filtered.length} total)
          </div>

          <div className="page-btns">
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              title="First page"
            >
              «
            </button>
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              title="Previous page"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1;
              if (totalPages > 5) {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                pNum = start + i;
              }
              return (
                <button
                  key={pNum}
                  className={`page-btn ${currentPage === pNum ? 'active' : ''}`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              title="Next page"
            >
              ›
            </button>
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last page"
            >
              »
            </button>

            <select
              className="topic-select"
              style={{ padding: '3px 8px', fontSize: 11, marginLeft: 8 }}
              value={pageSize}
              onChange={e => setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            >
              <option value="20">20 / page</option>
              <option value="30">30 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="All">All ({filtered.length})</option>
            </select>
          </div>
        </div>
      )}
      {/* ── Problem Modal ─────────────────────────────────────── */}
      {modalProblem && (
        <ProblemModal
          problem={modalProblem}
          description={modalDesc}
          onClose={closeProblemModal}
        />
      )}
    </div>
  );
}

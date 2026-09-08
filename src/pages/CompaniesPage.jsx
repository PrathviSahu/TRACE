import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';
import { COMPANY_DATA, COMPANIES } from '../data/companyData.js';
import { getProblemTemplate, PRESET_SOLUTIONS } from '../data/problemTemplates.js';
import { getProblemDescription } from '../data/problemDescriptions.js';
import ProblemModal from '../components/ProblemModal.jsx';

const WINDOW_LABELS = {
  thirtyDays:  '🔥 Last 30 Days',
  sixMonths:   '📅 Last 6 Months',
  all:         '📚 All Time',
};

const TIER_ORDER = ['FAANG', 'Big Tech', 'Unicorn', 'Finance', 'India', 'Other'];
const TIER_COLORS = {
  'FAANG':    { bg: 'rgba(255,99,71,0.12)',  border: 'rgba(255,99,71,0.3)',  text: '#ff7f6e' },
  'Big Tech': { bg: 'rgba(82,130,255,0.1)',  border: 'rgba(82,130,255,0.25)',text: '#79a8ff' },
  'Unicorn':  { bg: 'rgba(160,90,255,0.1)',  border: 'rgba(160,90,255,0.25)',text: '#c792ea' },
  'Finance':  { bg: 'rgba(255,215,0,0.1)',   border: 'rgba(255,215,0,0.25)', text: '#ffd700' },
  'India':    { bg: 'rgba(0,200,100,0.1)',   border: 'rgba(0,200,100,0.25)',  text: '#73c991' },
  'Other':    { bg: 'rgba(110,118,129,0.1)', border: 'rgba(110,118,129,0.2)',text: '#8b949e' },
};

const DIFF_COLORS = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };
const DIFF_BG = { Easy: 'rgba(0,184,163,0.1)', Medium: 'rgba(255,161,22,0.1)', Hard: 'rgba(239,71,67,0.1)' };

// sort companies: by tier order, then by 6m count desc
const SORTED_COMPANIES = [...COMPANIES].sort((a, b) => {
  const ta = TIER_ORDER.indexOf(a.tier);
  const tb = TIER_ORDER.indexOf(b.tier);
  if (ta !== tb) return ta - tb;
  return (b.total6m || 0) - (a.total6m || 0);
});

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { setCode, setInputs } = useTraceStore();

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [timeWindow, setTimeWindow] = useState('sixMonths');
  const [diffFilter, setDiffFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [modalProblem, setModalProblem] = useState(null);
  const [modalDesc, setModalDesc] = useState(null);
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('trace_solved_problems') || '[]')); } catch { return new Set(); }
  });

  // Auto-select "All Companies" on first load
  useEffect(() => {
    if (!selectedCompany) {
      setSelectedCompany('__ALL__');
    }
  }, []);

  const filteredSidebarCompanies = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    return SORTED_COMPANIES.filter(c => {
      if (tierFilter !== 'All' && c.tier !== tierFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sidebarSearch, tierFilter]);

  const isAllCompanies = selectedCompany === '__ALL__';
  const currentCompany = (selectedCompany && !isAllCompanies) ? COMPANY_DATA[selectedCompany] : null;

  // Build aggregated "All Companies" problems
  const allCompaniesProblems = useMemo(() => {
    const map = new Map(); // id -> { ...problem, companies: Set, maxFreq }
    for (const company of SORTED_COMPANIES) {
      const list = company[timeWindow] || company.sixMonths || [];
      for (const p of list) {
        if (!map.has(p.id)) {
          map.set(p.id, { ...p, companies: new Set(), maxFreq: 0 });
        }
        const entry = map.get(p.id);
        entry.companies.add(company.name);
        entry.maxFreq = Math.max(entry.maxFreq, p.frequency);
      }
    }
    // Convert sets to arrays, sort by maxFreq desc
    return Array.from(map.values())
      .map(p => ({ ...p, companies: Array.from(p.companies), frequency: p.maxFreq }))
      .sort((a, b) => b.frequency - a.frequency);
  }, [timeWindow]);

  const problems = useMemo(() => {
    if (selectedCompany === '__ALL__') return allCompaniesProblems;
    if (!currentCompany) return [];
    return (currentCompany[timeWindow] || currentCompany.sixMonths || []);
  }, [currentCompany, selectedCompany, timeWindow, allCompaniesProblems]);

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter(p => {
      if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
      return true;
    });
  }, [problems, diffFilter, search]);

  function openModal(p) {
    const name = p.title || p.name || 'Unknown';
    const pid = p.id || null;
    const normP = { id: pid, name, url: p.url, difficulty: (p.difficulty || 'Medium').toLowerCase() };
    setModalProblem(normP);
    setModalDesc(pid ? getProblemDescription(pid) : null);
  }
  function closeModal() { setModalProblem(null); setModalDesc(null); }

  function handleVisualize(p) {
    const pid = p.id || null;
    const pObj = { id: pid, name: p.title || p.name, url: p.url };
    const preset = pid ? PRESET_SOLUTIONS[pid] : null;
    const template = getProblemTemplate(pObj);
    if (preset) { setCode(preset.code); if (preset.inputs) setInputs(preset.inputs); }
    else if (template) { setCode(template.code); if (template.inputs) setInputs(template.inputs); }
    navigate('/');
  }

  function toggleSolved(id) {
    setSolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('trace_solved_problems', JSON.stringify(Array.from(next)));
      return next;
    });
  }

  // Stats for selected company
  const stats = useMemo(() => {
    if (!problems.length) return null;
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;
    const solved = problems.filter(p => solvedIds.has(p.id)).length;
    return { total: problems.length, easy, medium, hard, solved };
  }, [problems, solvedIds]);

  const tierGroups = useMemo(() => {
    const groups = {};
    for (const tier of TIER_ORDER) {
      const companies = filteredSidebarCompanies.filter(c => c.tier === tier);
      if (companies.length > 0) groups[tier] = companies;
    }
    return groups;
  }, [filteredSidebarCompanies]);

  return (
    <div className="companies-layout">
      <style>{`
        .companies-layout {
          display: flex;
          height: calc(100vh - 56px);
          overflow: hidden;
          background: var(--bg-primary, #0d1117);
        }
        /* ── Sidebar ─────────────────── */
        .co-sidebar {
          width: 240px;
          flex-shrink: 0;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #0d1117;
        }
        .co-sidebar-header {
          padding: 16px 14px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .co-sidebar-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6e7681;
          margin-bottom: 10px;
        }
        .co-sidebar-search {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #c9d1d9;
          padding: 6px 10px;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
        }
        .co-sidebar-search:focus { border-color: rgba(82,130,255,0.4); }
        .co-tier-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .co-tier-btn {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #6e7681;
          transition: all 0.15s;
        }
        .co-tier-btn.active, .co-tier-btn:hover {
          background: rgba(82,130,255,0.15);
          color: #79a8ff;
          border-color: rgba(82,130,255,0.3);
        }
        .co-company-list {
          overflow-y: auto;
          flex: 1;
          padding: 6px 8px;
        }
        .co-company-list::-webkit-scrollbar { width: 4px; }
        .co-company-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .co-tier-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6e7681;
          padding: 8px 6px 4px;
        }
        .co-company-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 8px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s;
          margin-bottom: 1px;
        }
        .co-company-btn:hover { background: rgba(255,255,255,0.05); }
        .co-company-btn.selected { background: rgba(82,130,255,0.12); }
        .co-company-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .co-company-name {
          font-size: 12.5px;
          color: #c9d1d9;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .co-company-btn.selected .co-company-name { color: #79a8ff; font-weight: 600; }
        .co-company-count {
          font-size: 10px;
          color: #6e7681;
          font-family: var(--mono, monospace);
          background: rgba(255,255,255,0.05);
          padding: 1px 5px;
          border-radius: 3px;
        }

        /* ── Main Content ────────────── */
        .co-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .co-header {
          padding: 18px 22px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #0d1117;
        }
        .co-company-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .co-company-badge {
          width: 36px; height: 36px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .co-company-h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #e6edf3;
          letter-spacing: -0.01em;
        }
        .co-company-sub {
          font-size: 12px;
          color: #6e7681;
          margin-top: 2px;
        }
        .co-stats-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .co-stat-chip {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }
        .co-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          padding: 10px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.01);
        }
        .co-window-btn {
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #8b949e;
          transition: all 0.15s;
        }
        .co-window-btn.active {
          background: rgba(82,130,255,0.15);
          color: #79a8ff;
          border-color: rgba(82,130,255,0.35);
        }
        .co-diff-btn {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #6e7681;
          transition: all 0.15s;
        }
        .co-diff-btn.easy.active { background: rgba(0,184,163,0.15); color: #00b8a3; border-color: rgba(0,184,163,0.3); }
        .co-diff-btn.medium.active { background: rgba(255,161,22,0.15); color: #ffa116; border-color: rgba(255,161,22,0.3); }
        .co-diff-btn.hard.active { background: rgba(239,71,67,0.15); color: #ef4743; border-color: rgba(239,71,67,0.3); }
        .co-diff-btn.all.active { background: rgba(82,130,255,0.1); color: #79a8ff; border-color: rgba(82,130,255,0.3); }
        .co-search-wrap {
          flex: 1;
          min-width: 160px;
          max-width: 300px;
          position: relative;
        }
        .co-search-wrap input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: #c9d1d9;
          padding: 5px 10px;
          font-size: 12px;
          outline: none;
        }
        .co-search-wrap input:focus { border-color: rgba(82,130,255,0.4); }
        .co-result-count {
          margin-left: auto;
          font-size: 11px;
          color: #6e7681;
        }

        /* ── Problem Table ─────────── */
        .co-table-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 0 22px 20px;
        }
        .co-table-wrap::-webkit-scrollbar { width: 5px; }
        .co-table-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .co-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        .co-table th {
          text-align: left;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6e7681;
          padding: 8px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky;
          top: 0;
          background: #0d1117;
          z-index: 1;
        }
        .co-table td {
          padding: 9px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .co-table tr:hover td { background: rgba(255,255,255,0.025); }
        .co-problem-title {
          font-size: 13px;
          color: #c9d1d9;
          cursor: pointer;
          transition: color 0.15s;
          font-weight: 500;
        }
        .co-problem-title:hover { color: #79a8ff; text-decoration: underline; }
        .co-freq-bar {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
          width: 80px;
          display: inline-block;
          vertical-align: middle;
          margin-left: 8px;
        }
        .co-freq-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #5282ff, #8b6ff0);
        }
        .co-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
          align-items: center;
        }
        .co-btn {
          padding: 4px 10px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.15s;
        }
        .co-btn-q { background: rgba(0,184,163,0.08); color: #4ec9b0; border-color: rgba(0,184,163,0.25); }
        .co-btn-q:hover { background: rgba(0,184,163,0.2); }
        .co-btn-v { background: rgba(99,102,241,0.1); color: #a5b4fc; border-color: rgba(99,102,241,0.3); }
        .co-btn-v:hover { background: rgba(99,102,241,0.25); color: #fff; }
        .co-btn-lc { background: transparent; color: #6e7681; border-color: rgba(255,255,255,0.1); text-decoration: none; display: inline-flex; align-items: center; }
        .co-btn-lc:hover { color: #ffa116; border-color: rgba(255,161,22,0.3); }
        .co-empty {
          text-align: center;
          padding: 60px 20px;
          color: #6e7681;
        }
        .co-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .co-empty-title { font-size: 16px; color: #8b949e; margin-bottom: 6px; }

        @media (max-width: 768px) {
          .co-sidebar { display: none; }
        }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="co-sidebar">
        <div className="co-sidebar-header">
          <div className="co-sidebar-title">🏢 {SORTED_COMPANIES.length} Companies</div>
          {/* All Companies button */}
          <button
            className={`co-company-btn ${isAllCompanies ? 'selected' : ''}`}
            style={{ marginBottom: 8, border: `1px solid ${isAllCompanies ? 'rgba(82,130,255,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 7, padding: '8px 10px', background: isAllCompanies ? 'rgba(82,130,255,0.12)' : 'rgba(255,255,255,0.03)' }}
            onClick={() => { setSelectedCompany('__ALL__'); setSearch(''); setDiffFilter('All'); }}
          >
            <span style={{ fontSize: 16 }}>🌐</span>
            <span className="co-company-name" style={{ fontWeight: 600, color: isAllCompanies ? '#79a8ff' : '#c9d1d9' }}>All Companies</span>
            <span className="co-company-count">{allCompaniesProblems.length}</span>
          </button>
          <input
            className="co-sidebar-search"
            placeholder="Search company..."
            value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)}
          />
        </div>

        <div className="co-tier-filters">
          {['All', ...TIER_ORDER].map(t => (
            <button
              key={t}
              className={`co-tier-btn ${tierFilter === t ? 'active' : ''}`}
              onClick={() => setTierFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="co-company-list">
          {Object.entries(tierGroups).map(([tier, companies]) => (
            <div key={tier}>
              <div className="co-tier-label">{tier}</div>
              {companies.map(c => (
                <button
                  key={c.id}
                  className={`co-company-btn ${selectedCompany === c.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedCompany(c.id); setSearch(''); setDiffFilter('All'); }}
                >
                  <span className="co-company-dot" style={{ background: c.color }} />
                  <span className="co-company-name">{c.name}</span>
                  <span className="co-company-count">{c.total6m}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────── */}
      <div className="co-main">
        {(!currentCompany && !isAllCompanies) ? (
          <div className="co-empty" style={{ margin: 'auto' }}>
            <div className="co-empty-icon">🏢</div>
            <div className="co-empty-title">Select a company to view interview questions</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="co-header">
              <div className="co-company-title">
                {isAllCompanies ? (
                  <>
                    <div className="co-company-badge" style={{ background: 'rgba(82,130,255,0.15)', border: '1px solid rgba(82,130,255,0.35)', fontSize: 22 }}>🌐</div>
                    <div>
                      <h1 className="co-company-h1">All Companies</h1>
                      <div className="co-company-sub">
                        Aggregated from {SORTED_COMPANIES.length} companies · sorted by frequency
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="co-company-badge" style={{ background: `${currentCompany.color}22`, border: `1px solid ${currentCompany.color}44` }}>
                      <span style={{ fontSize: 20 }}>{currentCompany.icon}</span>
                    </div>
                    <div>
                      <h1 className="co-company-h1">{currentCompany.name}</h1>
                      <div className="co-company-sub">
                        LeetCode Interview Questions · {currentCompany.tier}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {stats && (
                <div className="co-stats-row">
                  <span className="co-stat-chip" style={{ color: '#c9d1d9', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    {stats.total} Problems
                  </span>
                  <span className="co-stat-chip" style={{ color: '#00b8a3', background: 'rgba(0,184,163,0.1)', borderColor: 'rgba(0,184,163,0.25)' }}>
                    {stats.easy} Easy
                  </span>
                  <span className="co-stat-chip" style={{ color: '#ffa116', background: 'rgba(255,161,22,0.1)', borderColor: 'rgba(255,161,22,0.25)' }}>
                    {stats.medium} Medium
                  </span>
                  <span className="co-stat-chip" style={{ color: '#ef4743', background: 'rgba(239,71,67,0.1)', borderColor: 'rgba(239,71,67,0.25)' }}>
                    {stats.hard} Hard
                  </span>
                  <span className="co-stat-chip" style={{ color: '#7ee787', background: 'rgba(126,231,135,0.08)', borderColor: 'rgba(126,231,135,0.2)' }}>
                    ✓ {stats.solved} Solved
                  </span>
                  {isAllCompanies && (
                    <span className="co-stat-chip" style={{ color: '#c792ea', background: 'rgba(160,90,255,0.1)', borderColor: 'rgba(160,90,255,0.2)' }}>
                      🏢 {SORTED_COMPANIES.length} Companies
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="co-controls">
              {/* Time Window */}
              {Object.entries(WINDOW_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`co-window-btn ${timeWindow === key ? 'active' : ''}`}
                  onClick={() => setTimeWindow(key)}
                >
                  {label}
                </button>
              ))}

              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

              {/* Difficulty filters */}
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  className={`co-diff-btn ${d.toLowerCase()} ${diffFilter === d ? 'active' : ''}`}
                  onClick={() => setDiffFilter(d)}
                >
                  {d}
                </button>
              ))}

              {/* Search */}
              <div className="co-search-wrap">
                <input
                  placeholder="Search problems..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <span className="co-result-count">{filteredProblems.length} shown</span>
            </div>

            {/* Table */}
            <div className="co-table-wrap">
              <table className="co-table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: 'center' }}>✓</th>
                    <th style={{ width: 52 }}>#</th>
                    <th>Title</th>
                    {isAllCompanies && <th style={{ width: 200 }}>Asked By</th>}
                    <th style={{ width: 90 }}>Difficulty</th>
                    <th style={{ width: 130 }}>Frequency</th>
                    <th style={{ width: 180, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="co-empty">
                          <div className="co-empty-icon">🔍</div>
                          <div className="co-empty-title">No problems match your filters</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map(p => {
                      const isSolved = solvedIds.has(p.id);
                      const hasPreset = !!PRESET_SOLUTIONS[p.id];
                      return (
                        <tr key={p.id}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              className="chk-box"
                              checked={isSolved}
                              onChange={() => toggleSolved(p.id)}
                              title={isSolved ? 'Mark unsolved' : 'Mark solved'}
                            />
                          </td>
                          <td style={{ fontFamily: 'var(--mono,monospace)', fontSize: 11, color: '#6e7681' }}>
                            #{p.id}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                              <span className="co-problem-title" onClick={() => openModal(p)}>
                                {p.title || p.name}
                              </span>
                              {hasPreset && (
                                <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: 'rgba(82,130,255,0.12)', color: '#79a8ff', border: '1px solid rgba(82,130,255,0.2)', fontWeight: 600 }}>
                                  ⚡ Trace
                                </span>
                              )}
                              {p.topics && p.topics.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
                                  {p.topics.slice(0, 2).map(t => (
                                    <span key={t} style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.05)', color: '#6e7681', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          {isAllCompanies && (
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                {(p.companies || []).slice(0, 4).map(co => (
                                  <span key={co} style={{
                                    fontSize: 10, padding: '1px 6px', borderRadius: 20,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#8b949e', border: '1px solid rgba(255,255,255,0.08)',
                                    whiteSpace: 'nowrap', cursor: 'pointer'
                                  }} onClick={() => {
                                    const found = SORTED_COMPANIES.find(c => c.name === co);
                                    if (found) { setSelectedCompany(found.id); setSearch(''); setDiffFilter('All'); }
                                  }} title={`View ${co} problems`}>
                                    {co}
                                  </span>
                                ))}
                                {(p.companies || []).length > 4 && (
                                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: 'rgba(82,130,255,0.1)', color: '#79a8ff', border: '1px solid rgba(82,130,255,0.2)' }}>
                                    +{p.companies.length - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          <td>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                              color: DIFF_COLORS[p.difficulty] || '#8b949e',
                              background: DIFF_BG[p.difficulty] || 'transparent',
                            }}>
                              {p.difficulty}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, color: '#8b949e', fontFamily: 'var(--mono,monospace)', width: 40 }}>
                                {p.frequency}%
                              </span>
                              <div className="co-freq-bar">
                                <div className="co-freq-fill" style={{ width: `${Math.min(100, p.frequency)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="co-actions">
                              <button className="co-btn co-btn-q" onClick={() => openModal(p)} title="View question">📄</button>
                              <button className="co-btn co-btn-v" onClick={() => handleVisualize(p)} title="Visualize in TRACE">▶ Trace</button>
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="co-btn co-btn-lc" title="Open on LeetCode">↗</a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalProblem && (
        <ProblemModal
          problem={modalProblem}
          description={modalDesc}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

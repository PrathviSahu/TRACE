import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { COMPANIES, TIERS } from "../data/companyData.js";
import { COMPANY_METRICS, DATA_TRUST_INFO, getProblemKey } from "../data/companyUtils.js";
import { useAllProgress } from "../services/progressStore.js";

const TIER_ORDER = ["All", "FAANG", "Big Tech", "Unicorn", "Finance", "India", "Other"];

const TIER_COLORS = {
  "FAANG":    { bg: "rgba(255, 99, 71, 0.12)", border: "rgba(255, 99, 71, 0.3)", text: "#ff7f6e" },
  "Big Tech": { bg: "rgba(82, 130, 255, 0.12)", border: "rgba(82, 130, 255, 0.3)", text: "#79a8ff" },
  "Unicorn":  { bg: "rgba(160, 90, 255, 0.12)", border: "rgba(160, 90, 255, 0.3)", text: "#c792ea" },
  "Finance":  { bg: "rgba(255, 215, 0, 0.12)", border: "rgba(255, 215, 0, 0.3)", text: "#ffd700" },
  "India":    { bg: "rgba(0, 200, 100, 0.12)", border: "rgba(0, 200, 100, 0.3)", text: "#73c991" },
  "Other":    { bg: "rgba(110, 118, 129, 0.12)", border: "rgba(110, 118, 129, 0.25)", text: "#8b949e" },
};

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ef4743" };

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { progress } = useAllProgress();

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [sortBy, setSortBy] = useState("problems_desc");

  // Filtered and sorted companies
  const filteredCompanies = useMemo(() => {
    let list = COMPANIES.map(c => {
      const metrics = COMPANY_METRICS.get(c.id) || {
        totalProblems: (c.sixMonths || []).length,
        easyCount: 0,
        medCount: 0,
        hardCount: 0,
        easyPct: 0,
        medPct: 0,
        hardPct: 0,
        thirtyDaysCount: (c.thirtyDays || []).length,
        topPatterns: [],
        relevance: "Core Preparation",
      };

      // Compute solved count for this company
      const allProbs = [...(c.thirtyDays || []), ...(c.sixMonths || [])];
      const uniqueKeys = new Set(allProbs.map(p => getProblemKey(p)));
      let solvedCount = 0;
      for (const k of uniqueKeys) {
        if (progress[k]?.status === "solved") solvedCount++;
      }

      return {
        ...c,
        metrics,
        solvedCount,
      };
    });

    // Filter by tier
    if (tierFilter !== "All") {
      list = list.filter(c => c.tier === tierFilter);
    }

    // Filter by search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "problems_desc") return b.metrics.totalProblems - a.metrics.totalProblems;
      if (sortBy === "problems_asc") return a.metrics.totalProblems - b.metrics.totalProblems;
      if (sortBy === "alpha_asc") return a.name.localeCompare(b.name);
      if (sortBy === "alpha_desc") return b.name.localeCompare(a.name);
      if (sortBy === "recency_30d") return b.metrics.thirtyDaysCount - a.metrics.thirtyDaysCount;
      return 0;
    });

    return list;
  }, [search, tierFilter, sortBy, progress]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts = { All: COMPANIES.length };
    for (const c of COMPANIES) {
      const t = c.tier || "Other";
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="companies-page-root">
      <style>{`
        .companies-page-root {
          min-height: calc(100vh - 56px);
          background: #090d13;
          color: #c9d1d9;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          padding: 28px 36px 64px;
        }

        /* ── Header ──────────────────────────────────────────── */
        .cp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .cp-title {
          font-size: 26px;
          font-weight: 800;
          color: #f0f6fc;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .cp-subtitle {
          font-size: 13.5px;
          color: #8b949e;
          max-width: 650px;
          line-height: 1.5;
        }
        .cp-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          background: rgba(0, 184, 163, 0.12);
          color: #00b8a3;
          border: 1px solid rgba(0, 184, 163, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
        }

        /* ── Controls Bar ────────────────────────────────────── */
        .cp-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .cp-tier-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .cp-tier-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cp-tier-pill:hover {
          background: rgba(255,255,255,0.06);
          color: #c9d1d9;
        }
        .cp-tier-pill.active {
          background: rgba(88,166,255,0.15);
          border-color: #58a6ff;
          color: #58a6ff;
        }

        .cp-search-sort-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cp-search-input {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          color: #c9d1d9;
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 8px;
          width: 280px;
          outline: none;
          transition: border-color 0.15s;
        }
        .cp-search-input:focus { border-color: #58a6ff; }

        .cp-sort-select {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          color: #c9d1d9;
          font-size: 12.5px;
          padding: 8px 12px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
        }
        .cp-sort-select:focus { border-color: #58a6ff; }

        /* ── Cards Grid ──────────────────────────────────────── */
        .cp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .cp-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .cp-card:hover {
          border-color: rgba(88,166,255,0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          background: #111620;
        }

        .cp-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .cp-card-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cp-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .cp-card-name {
          font-size: 17px;
          font-weight: 700;
          color: #f0f6fc;
        }
        .cp-card-relevance {
          font-size: 11.5px;
          color: #8b949e;
          margin-top: 2px;
        }

        .cp-card-tier {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 7px;
          border-radius: 10px;
        }

        /* Metrics in Card */
        .cp-card-metrics {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .cp-card-prob-count {
          font-size: 20px;
          font-weight: 800;
          color: #f0f6fc;
          font-family: var(--font-mono, monospace);
        }
        .cp-card-prob-lbl {
          font-size: 11.5px;
          color: #8b949e;
          margin-left: 4px;
        }

        /* Distribution Mini-Bar */
        .cp-mini-dist-bar {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          display: flex;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .cp-mini-bar-easy { background: #00b8a3; height: 100%; }
        .cp-mini-bar-med  { background: #ffa116; height: 100%; }
        .cp-mini-bar-hard { background: #ef4743; height: 100%; }

        .cp-mini-dist-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #8b949e;
          margin-bottom: 14px;
        }

        /* Patterns preview */
        .cp-card-patterns {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 12px;
        }
        .cp-pattern-tag {
          font-size: 10.5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #8b949e;
          padding: 2px 7px;
          border-radius: 4px;
        }

        /* Solved progress badge */
        .cp-card-progress {
          font-size: 11px;
          color: #00b8a3;
          font-weight: 600;
          font-family: var(--font-mono, monospace);
        }

        /* Empty state */
        .cp-empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 0;
          color: #8b949e;
        }
      `}</style>

      {/* Page Header */}
      <div className="cp-header">
        <div>
          <div className="cp-title">Company Interview Intelligence</div>
          <div className="cp-subtitle">
            Curated LeetCode problem sets and frequency analytics for 183 top tech companies.
            Track your preparation, practice high-frequency questions, and trace solutions.
          </div>
        </div>
        <div className="cp-trust-badge">
          <span>🛡️</span>
          <span>{DATA_TRUST_INFO.badge} • 909 Unique Problems</span>
        </div>
      </div>

      {/* Controls: Tiers & Search/Sort */}
      <div className="cp-controls">
        <div className="cp-tier-pills">
          {TIER_ORDER.map(t => (
            <button
              key={t}
              className={`cp-tier-pill ${tierFilter === t ? "active" : ""}`}
              onClick={() => setTierFilter(t)}
            >
              <span>{t}</span>
              <span style={{ fontSize: 10.5, opacity: 0.7 }}>({tierCounts[t] || 0})</span>
            </button>
          ))}
        </div>

        <div className="cp-search-sort-row">
          <input
            type="text"
            className="cp-search-input"
            placeholder="Search company (e.g. Google, Microsoft)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, color: "#8b949e" }}>Sort by:</span>
            <select
              className="cp-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="problems_desc">Problem Count (Highest)</option>
              <option value="problems_asc">Problem Count (Lowest)</option>
              <option value="alpha_asc">Alphabetical (A - Z)</option>
              <option value="alpha_desc">Alphabetical (Z - A)</option>
              <option value="recency_30d">30-Day Activity</option>
            </select>
            <span style={{ fontSize: 12.5, color: "#8b949e" }}>
              {filteredCompanies.length} companies
            </span>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="cp-grid">
        {filteredCompanies.length === 0 ? (
          <div className="cp-empty-state">
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f6fc", marginBottom: 6 }}>
              No companies match \"${search}\"
            </div>
            <div style={{ fontSize: 13 }}>Try clearing your search query or selecting a different tier filter.</div>
          </div>
        ) : (
          filteredCompanies.map(c => {
            const m = c.metrics;
            const tStyle = TIER_COLORS[c.tier] || TIER_COLORS.Other;

            return (
              <div
                key={c.id}
                className="cp-card"
                onClick={() => navigate(`/companies/${c.id}`)}
              >
                <div>
                  <div className="cp-card-top">
                    <div className="cp-card-identity">
                      <div className="cp-card-icon">{c.icon || "🏢"}</div>
                      <div>
                        <div className="cp-card-name">{c.name}</div>
                        <div className="cp-card-relevance">{m.relevance}</div>
                      </div>
                    </div>
                    <span
                      className="cp-card-tier"
                      style={{ background: tStyle.bg, borderColor: tStyle.border, color: tStyle.text }}
                    >
                      {c.tier}
                    </span>
                  </div>

                  <div className="cp-card-metrics">
                    <div>
                      <span className="cp-card-prob-count">{m.totalProblems}</span>
                      <span className="cp-card-prob-lbl">Problems</span>
                    </div>
                    {c.solvedCount > 0 && (
                      <span className="cp-card-progress">
                        ✓ {c.solvedCount} / {m.totalProblems} Solved
                      </span>
                    )}
                  </div>

                  {/* Distribution Mini-Bar */}
                  <div className="cp-mini-dist-bar">
                    <div className="cp-mini-bar-easy" style={{ width: `${m.easyPct}%` }} title={`Easy: ${m.easyCount}`} />
                    <div className="cp-mini-bar-med"  style={{ width: `${m.medPct}%` }}  title={`Med: ${m.medCount}`} />
                    <div className="cp-mini-bar-hard" style={{ width: `${m.hardPct}%` }} title={`Hard: ${m.hardCount}`} />
                  </div>

                  <div className="cp-mini-dist-labels">
                    <span style={{ color: DIFF_COLORS.Easy }}>{m.easyCount} Easy</span>
                    <span style={{ color: DIFF_COLORS.Medium }}>{m.medCount} Med</span>
                    <span style={{ color: DIFF_COLORS.Hard }}>{m.hardCount} Hard</span>
                  </div>
                </div>

                {/* Patterns Preview */}
                {m.topPatterns && m.topPatterns.length > 0 && (
                  <div className="cp-card-patterns">
                    {m.topPatterns.slice(0, 3).map(p => (
                      <span key={p.name} className="cp-pattern-tag">
                        {p.name} ({p.count})
                      </span>
                    ))}
                    {m.topPatterns.length > 3 && (
                      <span className="cp-pattern-tag" style={{ color: "#79a8ff" }}>
                        +{m.topPatterns.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

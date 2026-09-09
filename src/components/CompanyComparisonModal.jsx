import { useState, useMemo } from "react";
import { COMPANIES } from "../data/companyData.js";
import { compareCompanies } from "../services/intelligenceService.js";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ef4743" };

export default function CompanyComparisonModal({ initialCompanyId, onClose, onPractice, onVisualize }) {
  const [companyAId, setCompanyAId] = useState(initialCompanyId || "microsoft");
  const [companyBId, setCompanyBId] = useState(() => {
    if (initialCompanyId === "google") return "microsoft";
    return "google";
  });

  const comparison = useMemo(() => {
    return compareCompanies(companyAId, companyBId);
  }, [companyAId, companyBId]);

  if (!comparison) return null;

  const { companyA, companyB, sharedCount, uniqueACount, uniqueBCount, sharedProblems, overlapPercent } = comparison;

  return (
    <div className="comp-modal-overlay" onClick={onClose}>
      <style>{`
        .comp-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9500;
          padding: 20px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .comp-modal-card {
          background: var(--bg-surface, #111620);
          border: 1px solid var(--border-card, rgba(255, 255, 255, 0.12));
          border-radius: 14px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        .comp-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface, #0d1117);
        }
        .comp-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .comp-select-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
        }
        .comp-select {
          background: var(--bg-main, #0d1117);
          border: 1px solid var(--border-card, rgba(255, 255, 255, 0.12));
          color: var(--txt-bright, #f0f6fc);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 8px;
          width: 100%;
          outline: none;
          cursor: pointer;
        }
        .comp-select:focus { border-color: #58a6ff; }

        .comp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .comp-stat-card {
          background: var(--bg-darkest, rgba(255, 255, 255, 0.03));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          padding: 12px 14px;
          text-align: center;
        }
        .comp-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: var(--txt-bright, #f0f6fc);
          font-family: var(--font-mono, monospace);
        }
        .comp-stat-lbl {
          font-size: 11px;
          color: var(--txt-muted, #8b949e);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }

        .comp-shared-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .comp-shared-table th {
          background: rgba(255,255,255,0.02);
          color: var(--txt-muted, #8b949e);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          text-align: left;
        }
        .comp-shared-table td {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .comp-shared-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .comp-btn {
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .comp-btn-p {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #c9d1d9;
        }
        .comp-btn-p:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .comp-btn-v {
          background: rgba(88,166,255,0.12);
          border-color: rgba(88,166,255,0.3);
          color: #79a8ff;
        }
        .comp-btn-v:hover { background: #1f6feb; color: #fff; }
      `}</style>

      <div className="comp-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="comp-modal-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--txt-bright, #f0f6fc)", letterSpacing: "-0.01em" }}>
              Company Interview Overlap Intelligence
            </div>
            <div style={{ fontSize: 12.5, color: "var(--txt-muted, #8b949e)", marginTop: 2 }}>
              Normalized dataset comparison showing shared LeetCode questions and pattern overlap.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-raised, rgba(255,255,255,0.06))", border: "none", color: "var(--txt-muted, #8b949e)",
              padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="comp-modal-body">
          {/* Selectors */}
          <div className="comp-select-row">
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--txt-muted, #8b949e)", marginBottom: 6 }}>
                Company A
              </label>
              <select
                className="comp-select"
                value={companyAId}
                onChange={e => setCompanyAId(e.target.value)}
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon || "🏢"} {c.name} ({c.total6m || (c.sixMonths || []).length} probs)</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: 16, fontWeight: 800, color: "#58a6ff", marginTop: 20 }}>
              VS
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--txt-muted, #8b949e)", marginBottom: 6 }}>
                Company B
              </label>
              <select
                className="comp-select"
                value={companyBId}
                onChange={e => setCompanyBId(e.target.value)}
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon || "🏢"} {c.name} ({c.total6m || (c.sixMonths || []).length} probs)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="comp-stats-grid">
            <div className="comp-stat-card">
              <div className="comp-stat-val" style={{ color: "#79a8ff" }}>{sharedCount}</div>
              <div className="comp-stat-lbl">Shared Questions</div>
            </div>
            <div className="comp-stat-card">
              <div className="comp-stat-val" style={{ color: "#00b8a3" }}>{overlapPercent}%</div>
              <div className="comp-stat-lbl">Dataset Overlap</div>
            </div>
            <div className="comp-stat-card">
              <div className="comp-stat-val">{uniqueACount}</div>
              <div className="comp-stat-lbl">Unique to {companyA.name}</div>
            </div>
            <div className="comp-stat-card">
              <div className="comp-stat-val">{uniqueBCount}</div>
              <div className="comp-stat-lbl">Unique to {companyB.name}</div>
            </div>
          </div>

          {/* Pattern Comparison Box */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
            background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt-bright, #f0f6fc)", marginBottom: 8 }}>
                {companyA.name} Top Patterns:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {companyA.topPatterns.map(p => (
                  <span key={p.pattern} style={{
                    fontSize: 11, background: "var(--bg-darkest, rgba(255,255,255,0.05))", padding: "2px 8px", borderRadius: 4, color: "var(--txt-main, #c9d1d9)"
                  }}>
                    {p.pattern} ({p.count})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt-bright, #f0f6fc)", marginBottom: 8 }}>
                {companyB.name} Top Patterns:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {companyB.topPatterns.map(p => (
                  <span key={p.pattern} style={{
                    fontSize: 11, background: "var(--bg-darkest, rgba(255,255,255,0.05))", padding: "2px 8px", borderRadius: 4, color: "var(--txt-main, #c9d1d9)"
                  }}>
                    {p.pattern} ({p.count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Problems List */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--txt-bright, #f0f6fc)", marginBottom: 10 }}>
              Top Shared Questions ({sharedCount}):
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
              <table className="comp-shared-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Problem</th>
                    <th style={{ width: 90 }}>Difficulty</th>
                    <th style={{ width: 110 }}>Freq ({companyA.name})</th>
                    <th style={{ width: 110 }}>Freq ({companyB.name})</th>
                    <th style={{ width: 140, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedProblems.slice(0, 30).map(p => (
                    <tr key={p.id || p.title}>
                      <td style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--txt-muted, #8b949e)", fontSize: 11 }}>
                        #{p.id || "—"}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--txt-bright, #f0f6fc)" }}>
                        {p.title}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: DIFF_COLORS[p.difficulty] || "#8b949e"
                        }}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}>
                        {p.frequencyInA}%
                      </td>
                      <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}>
                        {p.frequencyInB}%
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            className="comp-btn comp-btn-p"
                            onClick={() => { onClose(); onPractice(p); }}
                          >
                            Practice
                          </button>
                          <button
                            className="comp-btn comp-btn-v"
                            onClick={() => { onClose(); onVisualize(p); }}
                          >
                            ▶ Visualize
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from "react";

export default function DryRunView({ trace, currentStep, goToStep }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'conditions' | 'vars' | 'calls'
  const activeRowRef = useRef(null);
  const tableContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll active row into view
  useEffect(() => {
    if (autoScroll && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [currentStep, autoScroll]);

  // Extract all distinct variable names across the entire trace
  const allVarNames = useMemo(() => {
    if (!trace || trace.length === 0) return [];
    const names = new Set();
    trace.forEach(step => {
      if (step.variables) {
        Object.keys(step.variables).forEach(k => names.add(k));
      }
      if (step.arrays) {
        Object.keys(step.arrays).forEach(k => names.add(k));
      }
    });
    return Array.from(names);
  }, [trace]);

  // Filtered steps
  const filteredSteps = useMemo(() => {
    if (!trace) return [];
    return trace.map((step, idx) => ({ ...step, originalIndex: idx })).filter(step => {
      // Type filter
      if (filterType === "conditions" && step.type !== "condition") return false;
      if (filterType === "vars" && step.type !== "assignment" && step.type !== "declaration") return false;
      if (filterType === "calls" && step.type !== "call" && step.type !== "return") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const stmt = (step.statement || "").toLowerCase();
        const expl = (step.explanation?.text || step.explanation?.title || "").toLowerCase();
        const varsMatch = step.variables && Object.keys(step.variables).some(k => k.toLowerCase().includes(q));
        return stmt.includes(q) || expl.includes(q) || varsMatch;
      }
      return true;
    });
  }, [trace, filterType, searchQuery]);

  if (!trace || trace.length === 0) {
    return (
      <div className="dry-run-empty-state">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt-bright)", marginBottom: 6 }}>
          No Trace Table Available
        </div>
        <p style={{ fontSize: 12, color: "var(--txt-dim)", maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
          Click <strong>Run & Visualize</strong> to execute your algorithm and generate the step-by-step Dry Run trace table.
        </p>
      </div>
    );
  }

  return (
    <div className="dry-run-container">
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="dry-run-toolbar">
        <div className="dry-run-filter-group">
          <button
            type="button"
            className={`dry-run-filter-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Steps ({trace.length})
          </button>
          <button
            type="button"
            className={`dry-run-filter-btn ${filterType === "conditions" ? "active" : ""}`}
            onClick={() => setFilterType("conditions")}
          >
            Conditions ({trace.filter(s => s.type === "condition").length})
          </button>
          <button
            type="button"
            className={`dry-run-filter-btn ${filterType === "vars" ? "active" : ""}`}
            onClick={() => setFilterType("vars")}
          >
            Mutations ({trace.filter(s => s.type === "assignment" || s.type === "declaration").length})
          </button>
        </div>

        <div className="dry-run-search-wrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="dry-run-search-input"
            placeholder="Filter by variable, code, or line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="dry-run-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="dry-run-toolbar-actions">
          <button
            type="button"
            className={`dry-run-scroll-btn ${autoScroll ? "active" : ""}`}
            onClick={() => setAutoScroll(!autoScroll)}
            title="Auto-scroll table to the active step during playback"
          >
            {autoScroll ? "● Auto-scroll On" : "○ Auto-scroll Off"}
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="dry-run-table-wrapper" ref={tableContainerRef}>
        <table className="dry-run-table">
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: "center" }}>#</th>
              <th style={{ width: 50, textAlign: "center" }}>Line</th>
              <th style={{ width: 85 }}>Type</th>
              <th style={{ minWidth: 180 }}>Statement / Code</th>
              <th style={{ minWidth: 220 }}>Variables Snapshot</th>
              <th style={{ minWidth: 160 }}>Evaluation / Outcome</th>
            </tr>
          </thead>
          <tbody>
            {filteredSteps.map((step) => {
              const isActive = step.originalIndex === currentStep;
              const hasCondition = step.conditionResult !== undefined;
              const isTrue = step.conditionResult === true;
              const isFalse = step.conditionResult === false;

              // What changed in this step?
              const changedKeys = new Set(
                step.changedVars ? Object.keys(step.changedVars) : []
              );
              if (step.explanation?.name) {
                changedKeys.add(step.explanation.name);
              }

              return (
                <tr
                  key={step.originalIndex}
                  ref={isActive ? activeRowRef : null}
                  className={`dry-run-row ${isActive ? "active-row" : ""}`}
                  onClick={() => goToStep(step.originalIndex)}
                  title={`Click to jump to step #${step.step}`}
                >
                  <td style={{ textAlign: "center" }}>
                    <div className="dry-run-step-badge">
                      {isActive && <span className="dry-run-active-arrow">▶</span>}
                      <span>{step.step}</span>
                    </div>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className="dry-run-line-badge">
                      L{step.line}
                    </span>
                  </td>

                  <td>
                    <span className={`dry-run-type-tag type-${step.type || "other"}`}>
                      {step.type || "statement"}
                    </span>
                  </td>

                  <td>
                    <code className="dry-run-statement">
                      {step.statement || "(expression)"}
                    </code>
                  </td>

                  <td>
                    <div className="dry-run-vars-cell">
                      {step.variables && Object.keys(step.variables).length > 0 ? (
                        Object.entries(step.variables).map(([k, v]) => {
                          const val = typeof v === "object" && v !== null ? v.value : v;
                          const wasChanged = changedKeys.has(k);
                          return (
                            <span
                              key={k}
                              className={`dry-run-var-chip ${wasChanged ? "var-changed" : ""}`}
                              title={wasChanged ? `${k} modified in this step` : `${k} = ${val}`}
                            >
                              <strong className="var-key">{k}:</strong>
                              <span className="var-val">{String(val)}</span>
                              {wasChanged && <span className="var-changed-dot" />}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ color: "var(--txt-dim)", fontSize: 11 }}>—</span>
                      )}
                    </div>
                  </td>

                  <td>
                    {hasCondition ? (
                      <span className={`dry-run-cond-badge ${isTrue ? "cond-true" : "cond-false"}`}>
                        {isTrue ? "✓ true (branch taken)" : "✕ false (skipped)"}
                      </span>
                    ) : step.explanation?.text ? (
                      <span className="dry-run-outcome-text">
                        {step.explanation.title || step.explanation.text}
                      </span>
                    ) : (
                      <span style={{ color: "var(--txt-dim)", fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

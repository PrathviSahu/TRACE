import React, { useState, useMemo, useRef, useEffect } from "react";

export default function CodeFlowView({ trace, currentStep, goToStep, code }) {
  const [flowMode, setFlowMode] = useState("step"); // 'step' (focused step-by-step) | 'path' (executed so far) | 'all' (full run)
  const timelineScrollRef = useRef(null);

  // Auto-scroll timeline to the latest step in 'path' or 'all' mode
  useEffect(() => {
    if (timelineScrollRef.current) {
      const activeEl = timelineScrollRef.current.querySelector(".flow-node-item.active");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentStep, flowMode]);

  // Aggregate line frequency statistics
  const lineStats = useMemo(() => {
    if (!trace || trace.length === 0) return { counts: {}, maxCount: 0, total: 0, sortedLines: [] };
    const counts = {};
    let total = 0;

    trace.forEach(step => {
      const line = step.line;
      if (line !== undefined && line !== null) {
        counts[line] = (counts[line] || 0) + 1;
        total++;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    const sortedLines = Object.entries(counts)
      .map(([line, count]) => ({
        line: Number(line),
        count,
        pct: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);

    return { counts, maxCount, total, sortedLines };
  }, [trace]);

  // Code lines split for reference
  const codeLines = useMemo(() => {
    if (!code) return [];
    return code.split("\n");
  }, [code]);

  // Branch statistics
  const branchStats = useMemo(() => {
    if (!trace) return { totalConditions: 0, trueCount: 0, falseCount: 0 };
    let totalConditions = 0;
    let trueCount = 0;
    let falseCount = 0;

    trace.forEach(step => {
      if (step.conditionResult !== undefined) {
        totalConditions++;
        if (step.conditionResult) trueCount++;
        else falseCount++;
      }
    });

    return { totalConditions, trueCount, falseCount };
  }, [trace]);

  if (!trace || trace.length === 0) {
    return (
      <div className="code-flow-empty-state">
        <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--txt-bright)", marginBottom: 6 }}>
          No Control Flow Available
        </div>
        <p style={{ fontSize: 12, color: "var(--txt-dim)", maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
          Click <strong>Run & Visualize</strong> to execute your algorithm and generate the execution path graph and code frequency heatmap.
        </p>
      </div>
    );
  }

  const currentStepData = trace[currentStep] || trace[0];
  const prevStepData = currentStep > 0 ? trace[currentStep - 1] : null;
  const nextStepData = currentStep < trace.length - 1 ? trace[currentStep + 1] : null;

  // Filter steps according to flowMode
  const visibleSteps = flowMode === "path"
    ? trace.slice(0, currentStep + 1)
    : flowMode === "all"
    ? trace
    : [];

  return (
    <div className="code-flow-container">
      {/* ── Top Metric Summary Banner ──────────────────────── */}
      <div className="code-flow-metrics-bar">
        <div className="flow-metric-card">
          <span className="flow-metric-num">
            {currentStep + 1} <span style={{ fontSize: 11, color: "var(--txt-dim)" }}>/ {trace.length}</span>
          </span>
          <span className="flow-metric-lbl">Active Step</span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">{Object.keys(lineStats.counts).length}</span>
          <span className="flow-metric-lbl">Lines Visited</span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">L{lineStats.sortedLines[0]?.line || "—"}</span>
          <span className="flow-metric-lbl">
            Hottest ({lineStats.sortedLines[0]?.count || 0}x)
          </span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">
            {branchStats.trueCount} <span style={{ fontSize: 11, color: "var(--txt-dim)" }}>/ {branchStats.totalConditions}</span>
          </span>
          <span className="flow-metric-lbl">Branch True</span>
        </div>
      </div>

      {/* ── Sub-header Mode Selector ────────────────────────── */}
      <div className="flow-mode-bar">
        <div className="flow-mode-tabs">
          <button
            type="button"
            className={`flow-mode-btn ${flowMode === "step" ? "active" : ""}`}
            onClick={() => setFlowMode("step")}
            title="Step-by-step focused view: shows current step, immediate flow, and state"
          >
            ● Step-by-Step (Focused)
          </button>
          <button
            type="button"
            className={`flow-mode-btn ${flowMode === "path" ? "active" : ""}`}
            onClick={() => setFlowMode("path")}
            title="Shows steps executed so far (1 to current)"
          >
            Path Executed ({currentStep + 1})
          </button>
          <button
            type="button"
            className={`flow-mode-btn ${flowMode === "all" ? "active" : ""}`}
            onClick={() => setFlowMode("all")}
            title="Shows all steps across full trace"
          >
            Full Trace ({trace.length})
          </button>
        </div>
        <span className="flow-mode-hint">
          {flowMode === "step"
            ? "Showing Step " + (currentStep + 1) + " of " + trace.length
            : "Showing " + visibleSteps.length + " of " + trace.length + " steps"}
        </span>
      </div>

      {/* ── Two-Column Main Flow Body ───────────────────────── */}
      <div className="code-flow-split">
        {/* Left: Execution Path (Step-by-Step Spotlight OR Progressive Timeline) */}
        <div className="flow-timeline-pane">
          {flowMode === "step" ? (
            /* ── Step-by-Step Spotlight View ── */
            <div className="flow-spotlight-wrap">
              {/* Previous -> Current -> Next Mini Flow Graph */}
              <div className="flow-tri-node-graph">
                {/* Previous Node */}
                <div
                  className={`flow-mini-node prev ${prevStepData ? "clickable" : "disabled"}`}
                  onClick={() => prevStepData && goToStep(currentStep - 1)}
                  title={prevStepData ? `Go to Step #${prevStepData.step}` : "Start of execution"}
                >
                  <span className="mini-node-badge">
                    {prevStepData ? `#${prevStepData.step}` : "START"}
                  </span>
                  <span className="mini-node-title">
                    {prevStepData ? `L${prevStepData.line} ${prevStepData.type}` : "Initial"}
                  </span>
                </div>

                <span className="flow-tri-arrow">➔</span>

                {/* Current Active Node */}
                <div className="flow-mini-node current active">
                  <span className="mini-node-badge current">
                    #{currentStepData.step} ACTIVE
                  </span>
                  <span className="mini-node-title current">
                    Line {currentStepData.line} · {currentStepData.type || "statement"}
                  </span>
                </div>

                <span className="flow-tri-arrow">➔</span>

                {/* Next Node */}
                <div
                  className={`flow-mini-node next ${nextStepData ? "clickable" : "disabled"}`}
                  onClick={() => nextStepData && goToStep(currentStep + 1)}
                  title={nextStepData ? `Go to Step #${nextStepData.step}` : "End of execution"}
                >
                  <span className="mini-node-badge">
                    {nextStepData ? `#${nextStepData.step}` : "END"}
                  </span>
                  <span className="mini-node-title">
                    {nextStepData ? `L${nextStepData.line} ${nextStepData.type}` : "Complete"}
                  </span>
                </div>
              </div>

              {/* Active Step Hero Card */}
              <div className="flow-hero-card">
                <div className="flow-hero-header">
                  <div className="flow-hero-step-tag">
                    STEP {currentStepData.step} of {trace.length}
                  </div>
                  <div className="flow-hero-line-tag">
                    Line {currentStepData.line}
                  </div>
                  <div className={`flow-hero-type-tag type-${currentStepData.type || "statement"}`}>
                    {currentStepData.type || "statement"}
                  </div>
                  {currentStepData.conditionResult !== undefined && (
                    <div className={`flow-hero-cond-pill ${currentStepData.conditionResult ? "true" : "false"}`}>
                      {currentStepData.conditionResult ? "✓ Condition: TRUE" : "✕ Condition: FALSE"}
                    </div>
                  )}
                </div>

                <div className="flow-hero-code">
                  <code>{currentStepData.statement || "(code statement)"}</code>
                </div>

                <div className="flow-hero-explanation">
                  <strong>Action:</strong> {currentStepData.explanation?.title || "Evaluating statement"}
                  {currentStepData.explanation?.text && (
                    <div style={{ marginTop: 4, color: "var(--txt-bright)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {currentStepData.explanation.text}
                    </div>
                  )}
                </div>

                {/* Scope Variables Snapshot at this specific step */}
                {currentStepData.variables && Object.keys(currentStepData.variables).length > 0 && (
                  <div className="flow-hero-vars">
                    <div className="flow-hero-vars-title">Variables at this Step:</div>
                    <div className="flow-hero-vars-list">
                      {Object.entries(currentStepData.variables).map(([k, v]) => {
                        const val = typeof v === "object" && v !== null ? v.value : v;
                        const isChanged = currentStepData.explanation?.name === k ||
                          (currentStepData.changedVars && currentStepData.changedVars[k] !== undefined);
                        return (
                          <span key={k} className={`flow-hero-var-chip ${isChanged ? "changed" : ""}`}>
                            <strong>{k}:</strong> {String(val)}
                            {isChanged && <span className="changed-pill">CHANGED</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Step Navigation Controls */}
                <div className="flow-hero-nav-row">
                  <button
                    type="button"
                    className="flow-hero-nav-btn"
                    onClick={() => goToStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep <= 0}
                  >
                    ◀ Previous Step
                  </button>
                  <span className="flow-hero-nav-pos">
                    Step {currentStep + 1} / {trace.length}
                  </span>
                  <button
                    type="button"
                    className="flow-hero-nav-btn"
                    onClick={() => goToStep(Math.min(trace.length - 1, currentStep + 1))}
                    disabled={currentStep >= trace.length - 1}
                  >
                    Next Step ▶
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Progressive / All Timeline View ── */
            <div className="flow-timeline-scroll" ref={timelineScrollRef}>
              {visibleSteps.map((step, idx) => {
                const isActive = idx === currentStep;
                const hasCondition = step.conditionResult !== undefined;
                const isTrue = step.conditionResult === true;

                return (
                  <div
                    key={idx}
                    className={`flow-node-item ${isActive ? "active" : ""}`}
                    onClick={() => goToStep(idx)}
                  >
                    <div className="flow-node-connector">
                      <div className={`flow-node-bullet ${isActive ? "active" : ""}`}>
                        {step.step}
                      </div>
                      {idx < visibleSteps.length - 1 && <div className="flow-node-line" />}
                    </div>

                    <div className={`flow-node-card ${isActive ? "active-card" : ""}`}>
                      <div className="flow-card-top">
                        <span className="flow-step-tag">Step #{step.step}</span>
                        <span className="flow-line-tag">Line {step.line}</span>
                        <span className={`flow-type-tag type-${step.type || "statement"}`}>
                          {step.type || "statement"}
                        </span>
                        {hasCondition && (
                          <span className={`flow-cond-pill ${isTrue ? "true" : "false"}`}>
                            {isTrue ? "✓ True" : "✕ False"}
                          </span>
                        )}
                      </div>

                      <div className="flow-card-statement">
                        <code>{step.statement || "(expression)"}</code>
                      </div>

                      {step.explanation?.text && (
                        <div className="flow-card-explanation">
                          {step.explanation.title || step.explanation.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Code Execution Heatmap (Hot-Path Frequency) */}
        <div className="flow-heatmap-pane">
          <div className="flow-pane-header">
            <span className="flow-pane-title">Line Execution Heatmap</span>
            <span className="flow-pane-sub">Algorithmic Hot Paths</span>
          </div>

          <div className="flow-heatmap-scroll">
            {lineStats.sortedLines.map(({ line, count, pct }) => {
              const codeSnippet = codeLines[line - 1] || "";
              const ratio = count / lineStats.maxCount;
              const isCurrentLine = currentStepData?.line === line;

              return (
                <div
                  key={line}
                  className={`heatmap-row ${isCurrentLine ? "active-heatmap-line" : ""}`}
                  onClick={() => {
                    const firstStepOnLine = trace.findIndex(s => s.line === line);
                    if (firstStepOnLine !== -1) goToStep(firstStepOnLine);
                  }}
                  title={`Line ${line} executed ${count} times (${pct.toFixed(1)}% of execution). Click to jump.`}
                >
                  <div className="heatmap-line-num">L{line}</div>
                  <div className="heatmap-code-col">
                    <code>{codeSnippet.trim() || `(Line ${line})`}</code>
                    <div className="heatmap-bar-track">
                      <div
                        className="heatmap-bar-fill"
                        style={{
                          width: `${Math.max(8, ratio * 100)}%`,
                          background: ratio > 0.6
                            ? "linear-gradient(90deg, #FF9F43, #FF5252)"
                            : ratio > 0.3
                            ? "linear-gradient(90deg, #38D9C5, #FF9F43)"
                            : "linear-gradient(90deg, #5282FF, #38D9C5)"
                        }}
                      />
                    </div>
                  </div>
                  <div className="heatmap-count-col">
                    <span className="heatmap-count-badge">{count}x</span>
                    <span className="heatmap-pct-badge">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

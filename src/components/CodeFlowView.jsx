import React, { useMemo } from "react";

export default function CodeFlowView({ trace, currentStep, goToStep, code }) {
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
          Click <strong>Run & Visualize</strong> to generate the execution path graph and code frequency heatmap.
        </p>
      </div>
    );
  }

  const currentStepData = trace[currentStep] || null;

  return (
    <div className="code-flow-container">
      {/* ── Top Metric Summary Banner ──────────────────────── */}
      <div className="code-flow-metrics-bar">
        <div className="flow-metric-card">
          <span className="flow-metric-num">{trace.length}</span>
          <span className="flow-metric-lbl">Total Executed Steps</span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">{Object.keys(lineStats.counts).length}</span>
          <span className="flow-metric-lbl">Distinct Lines Visited</span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">L{lineStats.sortedLines[0]?.line || "—"}</span>
          <span className="flow-metric-lbl">
            Hottest Line ({lineStats.sortedLines[0]?.count || 0}x)
          </span>
        </div>
        <div className="flow-metric-card">
          <span className="flow-metric-num">
            {branchStats.trueCount} <span style={{ fontSize: 11, color: "var(--txt-dim)" }}>/ {branchStats.totalConditions}</span>
          </span>
          <span className="flow-metric-lbl">Branch True Outcomes</span>
        </div>
      </div>

      {/* ── Two-Column Main Flow Body ───────────────────────── */}
      <div className="code-flow-split">
        {/* Left: Interactive Control Flow Timeline Graph */}
        <div className="flow-timeline-pane">
          <div className="flow-pane-header">
            <span className="flow-pane-title">Execution Path Timeline</span>
            <span className="flow-pane-sub">Step {currentStep + 1} of {trace.length}</span>
          </div>

          <div className="flow-timeline-scroll">
            {trace.map((step, idx) => {
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
                    {idx < trace.length - 1 && <div className="flow-node-line" />}
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
                  title={`Line ${line} executed ${count} times (${pct.toFixed(1)}% of execution). Click to view.`}
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

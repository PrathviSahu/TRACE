import React, { useState, useRef, useCallback } from 'react';
import { useTraceStore } from '../store/traceStore.js';

export default function BottomPanels() {
  const {
    inputText,
    setInputText,
    run,
    trace,
    currentStep,
    outputTab,
    setOutputTab,
    outputs,
    returnValue,
    error,
    code,
    language,
    activeTestCases,
    selectTestCase
  } = useTraceStore();

  // Column widths as percentages [Input, Variables, CallStack, Output]
  const [colPcts, setColPcts] = useState(() => {
    const saved = localStorage.getItem("trace_bottom_cols");
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    } catch (_) {}
    return [24, 28, 23, 25];
  });

  // Bottom panels height (px)
  const [panelHeight, setPanelHeight] = useState(() => {
    const saved = localStorage.getItem("trace_bottom_height");
    const parsed = Number(saved);
    return parsed >= 160 && parsed <= 500 ? parsed : 230;
  });

  const [activeSplitter, setActiveSplitter] = useState(null);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const containerRef = useRef(null);

  // Column drag handler between column `idx` and `idx + 1`
  const handleSplitterMouseDown = useCallback((idx, e) => {
    e.preventDefault();
    setActiveSplitter(idx);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = moveEvent.clientX - rect.left;
      const totalWidth = rect.width;

      setColPcts(prev => {
        const next = [...prev];
        // Calculate the boundary between col `idx` and `idx+1` as a target cumulative %
        const currentBoundary = prev.slice(0, idx + 1).reduce((sum, v) => sum + v, 0);
        const targetBoundary = (mouseX / totalWidth) * 100;
        const delta = targetBoundary - currentBoundary;

        const MIN_PCT = 12; // each panel must remain at least 12% wide
        if (next[idx] + delta >= MIN_PCT && next[idx + 1] - delta >= MIN_PCT) {
          next[idx] = Math.round((next[idx] + delta) * 10) / 10;
          next[idx + 1] = Math.round((next[idx + 1] - delta) * 10) / 10;
          localStorage.setItem("trace_bottom_cols", JSON.stringify(next));
        }
        return next;
      });
    };

    const onMouseUp = () => {
      setActiveSplitter(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  // Vertical drag handler to resize bottom panels height
  const handleHeightMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingHeight(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newH = moveEvent.clientY - rect.top;
      if (newH < 150) newH = 150;
      if (newH > 520) newH = 520;
      setPanelHeight(newH);
      localStorage.setItem("trace_bottom_height", String(Math.round(newH)));
    };

    const onMouseUp = () => {
      setIsDraggingHeight(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  function handleAskAiHint(customPrompt) {
    const prompt = customPrompt || (error
      ? `I encountered an execution issue in TRACE running this ${language ? language.toUpperCase() : "Java"} code:\n\nError:\n${error}\n\nCode:\n\`\`\`${language || "java"}\n${code}\n\`\`\`\n\nPlease give me a clear, helpful hint on why this happened and how to fix it.`
      : `I am currently analyzing this ${language ? language.toUpperCase() : "Java"} algorithm in TRACE:\n\nCode:\n\`\`\`${language || "java"}\n${code}\n\`\`\`\n\nCurrent Step: ${currentStep + 1} of ${trace?.length || 1}.\nCan you provide a progressive hint or conceptual guidance on how to optimize or troubleshoot this algorithm?`);

    window.dispatchEvent(new CustomEvent("open-trace-brain", {
      detail: { prompt }
    }));
  }

  const stepData = trace && trace[currentStep] ? trace[currentStep] : null;
  const varsObj = stepData?.variables || {};
  const callStack = stepData?.callStack || [];

  return (
    <div className="bottom-resizable-wrapper" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div
        ref={containerRef}
        className="bottom-cards-resizable"
        style={{ height: `${panelHeight}px` }}
      >
        {/* ── 1. Input Panel ────────────────────────────────────── */}
        <div
          className="bottom-card-item"
          style={{ width: `calc(${colPcts[0]}% - 6px)` }}
        >
          <div className="studio-card input-card" style={{ height: "100%" }}>
            <div className="card-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="card-title-group">
                <span className="card-main-title">Input</span>
                <span className="card-sub-title">stdin / parameters</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {activeTestCases && activeTestCases.length > 0 && (
                  <div className="test-case-pills" style={{ display: "flex", gap: 4 }}>
                    {activeTestCases.map((tc, idx) => (
                      <button
                        key={idx}
                        className={`test-case-pill ${tc.active ? "active" : ""}`}
                        onClick={() => selectTestCase(idx)}
                        title={`Load test case: ${tc.label || `#${idx + 1}`}`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
                <span style={{ fontSize: 9, color: "var(--txt-dim)", fontFamily: "var(--font-mono)" }}>
                  {activeTestCases?.length || 1} case
                </span>
              </div>
            </div>

            <div className="input-card-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea
                className="input-textarea"
                style={{ flex: 1, resize: "none" }}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. nums = [2, 7, 11, 15]\ntarget = 9"
              />
              {/* Corner Cases Generator Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9.5, color: "var(--txt-dim)", fontFamily: "var(--font-mono)" }}>Corner Cases:</span>
                {[
                  { label: "[] Empty", val: "nums = []\ntarget = 0" },
                  { label: "[1] Single", val: "nums = [1]\ntarget = 1" },
                  { label: "[-5, 0, 5]", val: "nums = [-5, 0, 5]\ntarget = 0" },
                  { label: "[2, 2, 2, 2]", val: "nums = [2, 2, 2, 2]\ntarget = 4" },
                  { label: "[9, 7, 5, 3]", val: "nums = [9, 7, 5, 3]\ntarget = 12" }
                ].map(cc => (
                  <button
                    key={cc.label}
                    type="button"
                    style={{
                      fontSize: 9.5,
                      fontFamily: "var(--font-mono)",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--txt-dim)",
                      padding: "1px 5px",
                      borderRadius: 3,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setInputText(cc.val);
                      setTimeout(() => run(), 50);
                    }}
                    title={`Inject corner case: ${cc.val}`}
                  >
                    {cc.label}
                  </button>
                ))}
              </div>

              <div className="input-actions-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "var(--txt-dim)", fontFamily: "var(--font-mono)" }}>
                  Press Run to trace live
                </span>
                <button className="btn-secondary-run" onClick={run}>
                  ▶ Run
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Splitter 0 (between Input & Variables) */}
        <div
          className={`bottom-splitter ${activeSplitter === 0 ? "dragging" : ""}`}
          onMouseDown={(e) => handleSplitterMouseDown(0, e)}
          title="Drag horizontally to resize Input & Variables panels"
        />

        {/* ── 2. Variables Panel ────────────────────────────────── */}
        <div
          className="bottom-card-item"
          style={{ width: `calc(${colPcts[1]}% - 6px)` }}
        >
          <div className="studio-card variables-card" style={{ height: "100%" }}>
            <div className="card-header-bar">
              <span className="card-main-title">Variables</span>
            </div>
            <div className="card-scroll-body" style={{ flex: 1, maxHeight: "none" }}>
              <table className="vars-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(varsObj).length > 0 ? (
                    Object.entries(varsObj).map(([name, info]) => {
                      let displayVal;
                      if (info?.value === null) {
                        displayVal = "null";
                      } else if (info?.value === undefined) {
                        displayVal = "undefined";
                      } else if (typeof info?.value === "object") {
                        if (info.value.__type) {
                          displayVal = info.value.__type + " (ref)";
                        } else {
                          displayVal = JSON.stringify(info.value);
                        }
                      } else {
                        displayVal = String(info?.value);
                      }
                      if (displayVal && displayVal.startsWith("{") && !displayVal.includes("__type")) {
                        displayVal = displayVal.replace(/"/g, "");
                      }
                      const changedVars = stepData?.changedVars || {};
                      const isChanged = Boolean(changedVars[name]);
                      return (
                        <tr key={name} className={isChanged ? "var-changed" : ""}>
                          <td className="var-name">
                            {name} {isChanged && <span className="var-changed-dot" style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--accent-amber)", marginLeft: 4 }} />}
                          </td>
                          <td className="var-type">{info?.type || "var"}</td>
                          <td className="var-val">
                            {isChanged && changedVars[name]?.from !== undefined ? (
                              <span className="var-mutation-badge">
                                <span style={{ opacity: 0.65 }}>{String(changedVars[name].from)}</span>
                                <span>→</span>
                                <b>{displayVal}</b>
                              </span>
                            ) : (
                              displayVal
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", opacity: 0.5, padding: "16px 8px" }}>
                        {trace && trace.length > 0 ? "No variables in scope" : "Run code to inspect variables"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Splitter 1 (between Variables & Call Stack) */}
        <div
          className={`bottom-splitter ${activeSplitter === 1 ? "dragging" : ""}`}
          onMouseDown={(e) => handleSplitterMouseDown(1, e)}
          title="Drag horizontally to resize Variables & Call Stack panels"
        />

        {/* ── 3. Call Stack Panel ───────────────────────────────── */}
        <div
          className="bottom-card-item"
          style={{ width: `calc(${colPcts[2]}% - 6px)` }}
        >
          <div className="studio-card stack-card" style={{ height: "100%" }}>
            <div className="card-header-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="card-main-title">Call Stack</span>
              {callStack.length > 0 && (
                <span style={{ fontSize: 10, color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
                  {callStack.length} frame{callStack.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="card-scroll-body stack-frames-list" style={{ flex: 1, maxHeight: "none" }}>
              {callStack.length > 0 ? (
                [...callStack].reverse().map((frame, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={"stack-frame-item " + (isTop ? "active-frame" : "inactive-frame")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{frame}</span>
                      <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 6 }}>
                        {isTop ? "ACTIVE" : "#" + (callStack.length - 1 - idx)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 12, opacity: 0.5, padding: "12px 8px", textAlign: "center" }}>
                  {trace && trace.length > 0 ? "No active stack frames" : "Ready"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Splitter 2 (between Call Stack & Output) */}
        <div
          className={`bottom-splitter ${activeSplitter === 2 ? "dragging" : ""}`}
          onMouseDown={(e) => handleSplitterMouseDown(2, e)}
          title="Drag horizontally to resize Call Stack & Output panels"
        />

        {/* ── 4. Output & Logs Panel ────────────────────────────── */}
        <div
          className="bottom-card-item"
          style={{ width: `calc(${colPcts[3]}% - 6px)` }}
        >
          <div className="studio-card output-card" style={{ height: "100%" }}>
            <div className="card-header-bar output-tabs-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  className={"out-tab-btn " + (outputTab === "output" ? "active" : "")}
                  onClick={() => setOutputTab("output")}
                >
                  Output
                </button>
                <button
                  className={"out-tab-btn " + (outputTab === "logs" ? "active" : "")}
                  onClick={() => setOutputTab("logs")}
                >
                  Logs
                </button>
              </div>
              <button
                onClick={() => handleAskAiHint()}
                title="Ask ARIA for guidance"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(255, 159, 67, 0.1)",
                  border: "1px solid rgba(255, 159, 67, 0.3)",
                  color: "var(--accent-amber, #FF9F43)",
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                ✦ ARIA
              </button>
            </div>
            <div className="card-scroll-body terminal-body" style={{ flex: 1, maxHeight: "none" }}>
              {outputTab === "output" ? (
                <div className="terminal-output-text">
                  {error && (
                    <div className="terminal-error-wrap" style={{ padding: "10px 14px", background: "rgba(239, 71, 67, 0.12)", border: "1px solid rgba(239, 71, 67, 0.35)", borderRadius: "var(--radius-sm, 6px)", marginBottom: 12 }}>
                      <div style={{ color: "#ef4743", fontWeight: 700, fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>⚠️ Execution Error</span>
                      </div>
                      <div style={{ color: "var(--txt-bright)", fontFamily: "var(--font-mono)", fontSize: 11.5, marginBottom: 10, whiteSpace: "pre-wrap" }}>
                        {error}
                      </div>
                      <button
                        className="btn-ai-hint-fix"
                        onClick={() => handleAskAiHint()}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 12px",
                          background: "rgba(255, 159, 67, 0.18)",
                          border: "1px solid var(--accent-amber, #FF9F43)",
                          color: "var(--accent-amber, #FF9F43)",
                          borderRadius: 4,
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          cursor: "pointer",
                          fontWeight: 700
                        }}
                      >
                        ✦ Ask ARIA to Fix
                      </button>
                    </div>
                  )}
                  {outputs && outputs.length > 0 ? (
                    outputs.map((out, idx) => (
                      <div key={idx} className="terminal-line">{out}</div>
                    ))
                  ) : returnValue !== undefined ? (
                    <div className="terminal-line">{JSON.stringify(returnValue)}</div>
                  ) : (
                    <div className="terminal-empty" style={{ opacity: 0.5 }}>
                      {trace && trace.length > 0 ? "No output generated" : "Run program to view output"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="terminal-logs-text">
                  <div className="log-line">
                    Execution status: {trace && trace.length > 0 ? (trace.length + " steps recorded") : "Ready"}
                  </div>
                  {stepData && (
                    <div className="log-line">
                      Current step: {currentStep + 1} ({stepData.statement || stepData.type})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Height Resizer Handle for bottom panels */}
      <div
        className={`bottom-panel-v-resizer ${isDraggingHeight ? "dragging" : ""}`}
        onMouseDown={handleHeightMouseDown}
        title="Drag vertically to adjust Bottom Panels height"
      />
    </div>
  );
}
